# dendriteholdings/Ingot-XXXIII-27B-Q2

## Resumen

Ingot-XXXIII-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros derivado de Prism ML Ternary Bonsai 2 27B, publicado por dendriteholdings como espejo público del ganador de la ronda XXXIII de Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo maestro fijo y el validador premia la copia que se mantiene más próxima a él. El minero responsable (hotkey `5HEUU8jj2dDmGbe4GeEc82hUsD2pnXrjqcFQUNfj4xyB97A2`, uid 176) modificó menos del 0,01% de los códigos ternarios del modelo base y reajustó el resto de pesos para acercarlo al profesor Qwen3.8-27B.

El resultado es un modelo ternario (pesos en {-1, 0, +1} con escalas fp16 por bloque de 128) empaquetado en GGUF para llama.cpp, distribuido en dos ficheros: uno a 1,75 bits por peso (5,95 GB) y otro a 2,125 bits por peso (7,21 GB) que contiene exactamente los mismos pesos en un contenedor de 2 bits. La propuesta de valor es la eficiencia extrema: un modelo de casi 27B que ocupa menos de 8 GB en disco y se decodifica a 137-145 tokens por segundo en una GPU Blackwell de 96 GB, con una divergencia KL de 0,08273 frente al profesor BF16.

Es relevante ahora porque demuestra que la cuantización ternaria agresiva, combinada con ajuste fino selectivo, puede acercarse a la distribución del profesor sin necesidad de retener precisión alta, y porque el ecosistema asociado (fork de llama.cpp con parche Metal, drafter especulativo DFlash 2) ya está disponible para reproducción. No obstante, es un artefacto de competición: sin licencia declarada, sin idiomas documentados y sin benchmarks estándar publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (linear attention) y rotación Hadamard; pesos ternarios con escalas fp16 por bloque de 128 |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: 1,75 bpw (PTQ1_0) y 2,125 bpw (PQ2_0, mismos pesos en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-XXXIII-27B-PTQ1_0.gguf`, `Ingot-XXXIII-27B-PQ2_0.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Prism ML Ternary Bonsai 2 27B: un transformer con atención lineal y una rotación Hadamard aplicada en el pipeline de inferencia, con pesos ternarios acompañados de escalas fp16 por bloque de 128 pesos. El proceso de Ingot no es un entrenamiento desde cero ni un fine-tuning convencional: el minero parte del GGUF ternario del profesor, altera menos del 0,01% de los códigos ternarios y reajusta el resto de pesos (las escalas y componentes no ternarios) para minimizar la divergencia con el profesor Qwen3.8-27B. La evaluación se realiza midiendo la KL(profesor ‖ modelo) de las distribuciones del siguiente token sobre los tokens de respuesta de cada dominio, ponderada por la cuota de muestras de cada dominio.

El empaquetado es un detalle técnico relevante: el fichero PTQ1_0 es un reempaquetado sin pérdida del fichero original del minero en el formato PTQ1_0 de Prism, de modo que cada bloque de 128 pesos conserva sus códigos y su escala fp16 y cada peso decodifica al mismo valor. El autor afirma que el mismo reempaquetado del fichero PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism, lo que da garantías de reproducibilidad del formato. No se documentan volúmenes de tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` está presente.
- Razonamiento y respuesta a instrucciones heredados del profesor Qwen3.8-27B, según el objetivo declarado del ajuste (acercar la distribución al profesor).
- Soporte de plantilla de chat vía `--jinja` en llama-server, lo que habilita conversaciones multi-turno con el tokenizador de la familia Bonsai 2.
- Decodificación especulativa mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generación en modo greedy y con sampling.
- Entrada de imágenes opcional: el fichero es el modelo de texto; para visión hay que añadir el tower `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `Ternary-Bonsai-2-27B-mmproj-BF16.gguf` de Prism ML como proyector. La calidad de imagen no está probada para estos pesos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware con VRAM limitada: con 5,95-7,21 GB de pesos, el modelo cabe en GPUs de consumo de 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB) y permite servir un modelo de 27B donde un BF16 equivalente no cabría. La contrapartida es que requiere el fork de llama.cpp de Dendrite, no el llama.cpp estándar.
- Inferencia de alto throughput en servidor: en una RTX PRO 6000 Blackwell de 96 GB se miden 137 tok/s de decodificación y 3.865 tok/s de prompt con `-ngl 99 -fa 1`, lo que lo hace apto para servir chat concurrente con baja latencia por token.
- Estación de trabajo Apple Silicon: en un Mac Studio M3 Ultra (80 núcleos GPU, 512 GB) el fork de Dendrite con parche Metal alcanza 56,4 tok/s de decodificación y 432 tok/s de prompt con el fichero PQ2_0, suficiente para asistentes locales interactivos.
- Chat conversacional local con contexto de sistema: usando `llama-server` con `--jinja` y la plantilla de chat de la familia Bonsai 2, se puede montar un asistente privado sin conexión, con el modelo entero en memoria unificada o VRAM.
- Aceleración con decodificación especulativa: para aplicaciones de chat en single-stream con decodificación greedy, acoplar el drafter DFlash 2 (`--spec-type draft-dflash --spec-draft-n-max 5`) reporta unas 1,8 veces más velocidad a cambio de unos 6 GB adicionales de VRAM; útil cuando la latencia percibida es crítica.
- Experimentación en visión-lenguaje: añadiendo el mmproj de Bonsai 2 se puede probar entrada de imágenes, aunque el autor advierte que el proyector se hizo para genesis y la calidad no está evaluada; adecuado para prototipos, no para producción.
- Investigación sobre cuantización ternaria: el par de ficheros (1,75 bpw y 2,125 bpw con los mismos pesos) y la métrica KL documentada lo convierten en un caso de estudio reproducible para medir el impacto del empaquetado en velocidad sin cambio de pesos.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). La única métrica de calidad es la divergencia KL frente al profesor BF16:

| Métrica | Valor |
|---|---|
| KL(profesor ‖ modelo) de este modelo, en su evaluación ganadora | 0,08273 |
| KL(profesor ‖ modelo) del rey al que venció, misma evaluación | 0,08445 |

Rendimiento de inferencia medido con `llama-bench`, 128 tokens generados (`tg128`) y prompt de 512 tokens (`pp512`):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (server, 96 GB), `-ngl 99 -fa 1` | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (server, 96 GB), `-ngl 99 -fa 1` | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock, Metal | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock, Metal | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PTQ1_0 | 52,8 | 368 |

Dato adicional aportado por Prism ML: 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090. El autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) solo para los pesos; hay que sumar KV cache y overhead del runtime. Con el drafter DFlash 2 se añaden unos 6 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) medida a 137-145 tok/s; RTX 5090 reportada por Prism a 142 tok/s con PQ2_0; cualquier GPU con al menos 8-12 GB de VRAM para el modelo solo.
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM para el modelo base; el fichero PQ2_0 decodifica más rápido en GPU que el PTQ1_0 pese a ser mayor.
- Apple Silicon: Mac Studio M3 Ultra medida a 56,4 tok/s (decode) y 432 tok/s (prompt) con el fork de Dendrite y parche Metal.
- Opciones de despliegue: exclusivamente `llama.cpp` en el fork de Dendrite (commit `62c418c`), compilado con `-DGGML_CUDA=ON` o con soporte Metal. `llama-server` con `-ngl 99 -fa on --jinja`. El llama.cpp estándar no ejecuta este fichero. No hay soporte documentado para vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: ver tabla de benchmarks. El drafter DFlash 2 aporta ~1,8x en greedy single-stream y ~1,3-1,4x con sampling.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXIII-27B-Q2 | 26,9B | no disponible | Ternaria 1,75 / 2,125 bpw | no disponible | GGUF en HF, requiere fork de llama.cpp |
| Prism ML Ternary Bonsai 2 27B | ~27B | no disponible | Ternaria (PQ2_0, PTQ1_0) | no disponible | GGUF en HF, fork de Prism ML |
| Qwen3.8-27B (profesor) | ~27B | no disponible | BF16 y otras | no disponible | no disponible en esta ficha |

La comparación con el profesor es la más informativa: Ingot-XXXIII se acerca a su distribución con una KL de 0,08273, pero no se han publicado métricas de tarea (MMLU, HumanEval, GSM8K) para ninguno de los tres en la información disponible, por lo que no es posible establecer una comparación de calidad por benchmark. Frente a Bonsai 2, la diferencia es de ajuste fino selectivo (menos del 0,01% de códigos ternarios alterados) y de rendimiento en Apple Silicon gracias al parche Metal del fork de Dendrite.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la model card ni en los metadatos de Hugging Face, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Idiomas no documentados: no se indica qué lenguas cubre el modelo; el comportamiento fuera del inglés (u otras lenguas del profesor) no está garantizado.
- Longitud de contexto no disponible: no se publica la ventana máxima; hay que determinarla empíricamente con la configuración del fork.
- Dependencia de un fork no estándar: el fichero no se ejecuta con llama.cpp estándar; requiere el fork de Dendrite en el commit `62c418c`. Esto limita la portabilidad y añade riesgo de mantenimiento.
- Artefacto de competición: es el ganador de una ronda de Bittensor según una métrica KL concreta; no hay evidencia de evaluación en tareas downstream ni de robustez en dominios fuera del conjunto de evaluación de Ingot.
- Visión no validada: el proyector mmproj es el de Bonsai 2, hecho para genesis, y el autor advierte que la calidad de imagen no está probada con estos pesos.
- Sin benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni similares; la única métrica publicada es la KL frente al profesor.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo de lenguaje, existe, pero no hay evaluación específica.
- Sesgos: no documentados en la información disponible.
- Reproducibilidad: el autor afirma que el reempaquetado PTQ1_0 es sin pérdida y que reproduce byte a byte el fichero de Prism, pero la verificación independiente no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXIII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluación: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
