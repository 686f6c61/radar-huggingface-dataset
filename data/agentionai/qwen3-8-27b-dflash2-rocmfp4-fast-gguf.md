# agentionai/Qwen3.8-27B-DFlash2-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-27B-DFlash2-ROCmFP4-FAST-GGUF es una recuantización en formato GGUF del modelo borrador (draft model) z-lab/Qwen3.8-27B-DFlash2, publicada por agentionai. No es un modelo autónomo: es un sidecar de decodificación especulativa diseñado para emparejarse con un modelo objetivo Qwen3.8-27B y acelerar su inferencia. El repositorio contiene pesos en cuantización Q4_0_ROCMFP4_FAST (tipo de fichero GGUF 103), con un tamaño de 1,0 GB y 1.924.404.480 parámetros reales según safetensors.

Su relevancia es práctica: en hardware AMD Strix Halo (Radeon 8060S) emparejado con el objetivo julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF, alcanza 65,6 t/s en salida estructurada, lo que supone 4,7 veces la velocidad de decodificación sin borrador. La clave es el modo adaptativo del borrador, que ajusta dinámicamente el número de tokens propuestos según la aceptación medida.

La licencia es Apache-2.0, heredada del modelo base, y el pipeline declarado es text-generation. No se dispone de información sobre idiomas soportados ni sobre la arquitectura interna del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador de decodificación especulativa para Qwen3.8-27B) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso se configura `-c 32768` para el servidor, no como spec del modelo) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (4,25 bpw); formatos ROCmFPx del fork de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (file type 103, Q4_0_ROCMFP4_FAST) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base z-lab/Qwen3.8-27B-DFlash2 ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). Lo que sí documenta la model card es su función: actúa como modelo borrador en un esquema de decodificación especulativa, proponiendo tokens que el modelo objetivo verifica. El borrador no tiene grafo completo propio y falla con `failed to create context` si se carga de forma aislada, lo cual es el comportamiento esperado.

La innovación técnica destacable es el modo `--spec-draft-adaptive`, que dimensiona el borrador a partir de la aceptación medida en lugar de fijar un valor de `n`. Con `n` fijo a 7 la aceptación cae al 18 % y el throughput baja a 20,2 t/s; con modo adaptativo se mantiene en el 96 % de aceptación y alcanza 65,6 t/s. La cuantización emplea escalas de bloque en byte UE4M3 en lugar de fp16: el autor advierte que recuantizar a Q8_0_ROCMFPX no da paridad con Q8_0 (53,5 % de aceptación frente al 60,2 % del original), porque a 8 bits la escala gruesa es la que penaliza.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que el modelo objetivo Qwen3.8-27B verifica, acelerando la generación sin alterar la calidad de la salida.
- Ajuste adaptativo del borrador: `--spec-draft-adaptive` con `--spec-draft-n-min 3` y `--spec-draft-n-max 7` mantiene alta aceptación en distintos tipos de salida.
- Rendimiento diferenciado por tipo de contenido: 65,6 t/s en salida estructurada y 26,1 t/s en prosa, ambos por encima de los 14,0-14,1 t/s de decodificación sin borrador.
- Integración con llama-server mediante el flag `-md` y `--spec-type draft-dflash`.
- No es un modelo de propósito general: no genera texto de forma autónoma, no soporta tool calling por sí mismo ni dispone de capacidades multimodales documentadas.
- Idiomas y capacidades multilingües: no disponibles.

## Casos de uso

- Aceleración de inferencia local en AMD Strix Halo: emparejar este sidecar con el objetivo Qwen3.8-27B ROCmFP4-FAST reduce el tiempo de respuesta de 14 t/s a 65,6 t/s en salidas estructuradas, lo que hace viable la generación de JSON y formatos reglados en tiempo interactivo sobre hardware integrado.
- Generación de salidas estructuradas en producción: con 65,6 t/s en structured output, resulta adecuado para pipelines que emiten JSON validado, tablas o registros con esquema fijo, donde el modo adaptativo del borrador mantiene una aceptación del 96 %.
- Asistentes conversacionales de baja latencia: en prosa el rendimiento es de 26,1 t/s, suficiente para respuestas multi-turno fluidas en un servidor llama-server con contexto configurado a 32 768 tokens.
- Despliegue en estaciones de trabajo con GPU integrada AMD: al requerir Vulkan 1.3 y el fork con tipos ROCmFPx, encaja en equipos Ryzen AI Max sin GPU discreta, un escenario donde otras alternativas de aceleración no están disponibles.
- Evaluación y benchmarking de decodificación especulativa: sirve como banco de pruebas reproducible para medir aceptación y throughput con distintos valores de `n` frente al modo adaptativo.
- Prototipado de servidores compatibles con endpoints: la etiqueta `endpoints_compatible` permite integrarlo en despliegues que exponen una API compatible, siempre con el fork de llama.cpp y el modelo objetivo presentes.

## Benchmarks y rendimiento

Mediciones del autor en AMD Strix Halo (Radeon 8060S), objetivo Qwen3.8-27B FP4, greedy, 300 tokens:

| Configuracion | Salida estructurada | Prosa |
|---|---|---|
| Decodificacion sin borrador | 14,0 t/s | 14,1 t/s |
| Borrador fijo n=3 | 41,6 t/s | 25,4 t/s |
| Borrador fijo n=7 | 20,2 t/s | 24,8 t/s |
| Adaptativo (n_max 7, n_min 3) | 65,6 t/s (4,7x) | 26,1 t/s |

Aceptación del borrador: 96 % en modo adaptativo; 18 % con n fijo a 7. En recuantización a Q8_0_ROCMFPX, la aceptación medida fue del 53,5 % frente al 60,2 % del modelo original de z-lab. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con la naturaleza del modelo: la decodificación especulativa no altera la calidad, ya que el objetivo verifica cada token.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB, por lo que el borrador añade aproximadamente 1 GB sobre el modelo objetivo.
- GPU recomendadas: AMD Strix Halo (Radeon 8060S, gfx1151) es el hardware de referencia y medición. El autor indica que debería funcionar en cualquier plataforma donde compile el fork, pero las cifras son específicas de ese hardware.
- GPU de consumo: cabe en iGPU AMD Strix Halo; no hay datos de rendimiento en RTX 4090, A100 o H100.
- Controlador: requiere Vulkan 1.3; medido con Mesa RADV 26.0.8.
- Software de despliegue: exclusivamente el fork de llama.cpp con soporte de tipos ROCmFPx (binarios en github.com/LaurentZuijdwijk/llama.cpp/releases). llama.cpp upstream falla con `failed to load model` antes de llegar a la GPU.
- Configuración de referencia: `-ngl 999 -fa on -b 2048 -ub 512 -c 32768`, `--spec-draft-ngl 99`, `--spec-type draft-dflash`, `--spec-draft-adaptive`, `--spec-draft-n-min 3`, `--spec-draft-n-max 7`.
- Latencia y throughput: 65,6 t/s en structured output y 26,1 t/s en prosa con el objetivo FP4 indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentionai/Qwen3.8-27B-DFlash2-ROCmFP4-FAST-GGUF | 1.924.404.480 | GGUF Q4_0_ROCMFP4_FAST | Borrador especulativo, 4,25 bpw | Apache-2.0 | Hugging Face, requiere fork |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Borrador especulativo original | Apache-2.0 | Hugging Face |
| julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF | no disponible | GGUF ROCmFP4 | Modelo objetivo | no disponible | Hugging Face |

La comparación relevante es con el borrador original de z-lab: a igualdad de bits por peso en Q8, el original alcanza 60,2 % de aceptación frente al 53,5 % de esta recuantización, por la escala UE4M3. En FP4, el autor solo mide su propia versión. No se dispone de datos para comparar con otros borradores especulativos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: cargarlo sin `-md` y sin modelo objetivo produce `failed to create context`. No sirve para generación de texto por sí solo.
- No funciona en llama.cpp upstream: requiere el fork con tipos ROCmFPx; el error es `failed to load model` antes de tocar la GPU.
- Dependencia de Vulkan 1.3 y de controladores AMD; las cifras de rendimiento están medidas solo en Strix Halo con Mesa RADV 26.0.8 y no son extrapolables.
- El modo adaptativo es necesario para el rendimiento declarado: con `n` fijo a 7 la aceptación cae al 18 % y el throughput a 20,2 t/s.
- La recuantización a Q8_0_ROCMFPX no alcanza paridad con Q8_0 (53,5 % frente a 60,2 % de aceptación), por lo que no debe asumirse equivalencia entre formatos.
- No mejora la calidad de la salida: la decodificación especulativa solo incrementa el throughput, ya que el objetivo verifica cada token.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; dependen íntegramente del modelo objetivo.
- Licencia Apache-2.0, que permite uso comercial, pero sujeta a las condiciones del modelo base y del fork de llama.cpp utilizado.

## Enlaces

- Hugging Face: https://huggingface.co/agentionai/Qwen3.8-27B-DFlash2-ROCmFP4-FAST-GGUF
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo de referencia: https://huggingface.co/julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF
- Binarios del fork de llama.cpp: https://github.com/LaurentZuijdwijk/llama.cpp/releases
- Formatos de cuantización ROCmFPX: https://github.com/ciru-ai/ROCmFPX
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Soporte DFlash2 en llama.cpp, PR #27342 (Jian Chen): no disponible como enlace directo en la información proporcionada
- Sitio del autor: https://agention.ai
