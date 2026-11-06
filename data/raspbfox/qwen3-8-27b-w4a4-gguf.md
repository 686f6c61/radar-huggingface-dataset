# raspbfox/Qwen3.8-27B-W4A4-GGUF

## Resumen

Qwen3.8-27B-W4A4-GGUF es una cuantización extrema del modelo Qwen/Qwen3.8-27B, publicada por el usuario raspbfox y generada con la herramienta ruquant de skyne98. A diferencia de las cuantizaciones GGUF habituales, que mantienen las activaciones en 8 o 16 bits, esta versión aplica cuantización W4A4: tanto los pesos como las activaciones se almacenan en int4, y las multiplicaciones de matrices se ejecutan como productos escalares int4 × int4 (kernel `v_dot8_i32_i4`) sobre GPUs AMD gfx906 (MI50). El paquete incluye además un drafter DFlash2 en W4A4H para decodificación especulativa.

El modelo está pensado para un nicho muy concreto: servir un modelo de ~27B (4.467 millones de parámetros reales según los safetensors del repo, aunque el nombre comercial indica 27B) en hardware AMD MI50 de 32 GB, habitualmente descartado por falta de soporte eficiente. Según las mediciones del autor, la combinación W4A4 + DFlash2 alcanza 80,2 tokens/s en una GPU, 89,5 t/s en TP2 y 109,6 t/s en TP4, frente a los 43,5 / 60,5 / 70,5 t/s de la cuantización Q4_0 de unsloth con el mismo drafter.

La contrapartida es una pérdida de calidad medible: la divergencia KL frente a los logits de UD-Q8_K_XL es de 0,0428 (top-1 del 91,57 %), frente a 0,0259 (93,34 %) de Q4_0. No es un modelo para producción generalista, sino una pieza de infraestructura para quien tenga MI50 y quiera exprimirlas con llama.cpp modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); cuantizacion W4A4 con rotacion OSTQuant y GPTQ |
| Parametros totales | 4.467.201.280 (segun safetensors del repo); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A4 (pesos int4 + activaciones int4), W4A4H (con Hadamard online), Q8_0 para `ssm_out` y `lm_head`; 4,5 bits por peso con escala por fila y multiplicador de 4 bits por grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: modelo objetivo de 17,19 GB y drafter de 2,65 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de Qwen. La cuantizacion parte del type map de unsloth para Qwen3.8-27B-Q4_0: las capas lineales de 4 bits se convierten a W4A4, mientras que `attn_output` y `ffn_down` pasan a W4A4H, que aplica una transformada de Hadamard online antes de la multiplicación. `ssm_out` y `lm_head` se mantienen en Q8_0. La rotación es OSTQuant (Hu et al., 2025): una rotación R1 aprendida más escalas de suavizado plegadas en los pesos; la Hadamard online es block-diagonal con 4 bloques por fila (Paley × Sylvester), de modo que un mismo fichero sirve para 1, 2 y 4 GPUs.

Los pesos se cuantizan con GPTQ (Frantar et al., 2022) contra hessianos recogidos sobre el modelo ya redondeado (64 ventanas de wikitext, todas las posiciones), a 4,5 bits por peso. Las activaciones se cuantizan al vuelo por token, int4 asimétrico en grupos de 64, con la escala de cada grupo como múltiplo entero de una unidad por token, de forma que el producto escalar permanece en int32 hasta un único epílogo fp32; no hay recorte de activaciones. El drafter es el Qwen3.8-27B-DFlash2 de incoai, convertido a W4A4H salvo su capa `fc`, que absorbe la R1 del modelo objetivo y queda en Q8_0. El autor afirma que todos los kernels son bit-exactos respecto a la implementación de referencia en CPU.

## Capacidades

- Generación de texto conversacional: el repo está etiquetado como `conversational` y `endpoints_compatible`.
- Decodificación especulativa: incluye un drafter DFlash2 W4A4H con draft de hasta 7 tokens y una aceptación medida de ~4,3 tokens por paso.
- Inferencia tensor-parallel: soporte de TP1, TP2 y TP4 con el mismo fichero de pesos.
- Ejecución en hardware AMD gfx906 (MI50) mediante el fork ruquant de mx-llama.cpp.
- Capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo): no disponibles en la información proporcionada; esta ficha solo documenta la cuantización.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Servicio de inferencia en clústeres de MI50 heredadas: el modelo permite reutilizar GPUs AMD MI50 de 32 GB, sin soporte eficiente en las pilas estándar, obteniendo 80,2 t/s en una sola tarjeta y 109,6 t/s en TP4 con decodificación especulativa.
- Despliegue con `llama-server` en producción interna: el repo incluye la línea de comandos completa con tensor parallelism, drafter y variables de entorno para ROCm 5.7, lo que facilita reproducir la configuración medida.
- Evaluación de cuantización extrema: útil como referencia para estudiar el coste de calidad de W4A4 (KLD 0,0428, top-1 91,57 %) frente a Q4_0 (KLD 0,0259, top-1 93,34 %) en tareas de generación libre.
- Investigación en decodificación especulativa: el par objetivo + drafter W4A4H permite medir aceptación (4,27-4,35 tokens por paso) y latencia de verificación (27,6-42,2 ms para 8 tokens) en hardware AMD.
- Prefill de prompts largos: con `-b 2048 -ub 2048` alcanza 487,8 t/s en una GPU, 833,1 t/s en TP2 y 1324,0 t/s en TP4, adecuado para procesar documentos extensos antes de la generación.
- Pruebas de compatibilidad de kernels: al ser bit-exacto con la referencia en CPU, sirve para validar implementaciones de `v_dot8_i32_i4` y rutas CUDA emuladas en sm_80+.

## Benchmarks y rendimiento

Mediciones del autor en 4× AMD MI50 32 GB, ROCm 5.7, PCIe 3.0, 30 prompts × 256 tokens, greedy, draft 7 (Q4_0 con draft 4):

| Metrica | 1 GPU | TP2 | TP4 |
|---|---|---|---|
| W4A4 + DFlash2 (t/s) | 80,2 | 89,5 | 109,6 |
| Q4_0 + DFlash2 (t/s) | 43,5 | 60,5 | 70,5 |
| Aceptacion W4A4 (tokens/paso) | 4,35 | 4,27 | 4,31 |
| Verificacion de 8 tokens, ms (W4A4 / Q4_0) | 42,2 / 95,5 | 35,1 / 62,8 | 27,6 / 40,6 |
| Prefill pp2048, t/s (W4A4 / Q4_0) | 487,8 / 290,7 | 833,1 / 529,0 | 1324,0 / 901,4 |
| Decode simple, t/s (W4A4 / Q4_0) | 29,2 / 27,9 | 41,6 / 39,7 | 52,7 / 51,5 |

Calidad (KLD frente a UD-Q8_K_XL, wikitext-2, 64 fragmentos de 2048):

| Modelo | KLD | Top-1 | PPL / base |
|---|---|---|---|
| unsloth UD-Q4_K_XL | 0,0078 | 96,58 % | 0,999 |
| unsloth Q4_0 | 0,0259 | 93,34 % | 1,022 |
| Este modelo (W4A4) | 0,0428 | 91,57 % | 1,028 |

## Requisitos de hardware

- VRAM: el fichero del modelo ocupa 17,19 GB y el drafter 2,65 GB; en total unos 19,8 GB, lo que encaja en una MI50 de 32 GB con margen para caché KV.
- GPU objetivo: AMD MI50 (gfx906) con ROCm 5.7; el autor ha medido con 1, 2 y 4 GPUs.
- GPUs consumer: no hay datos de ejecución en RTX 4090 u otras consumer; la ruta CUDA del fork solo emula `dot8` como comprobación de correctitud, y el repo ruquant incluye un parche separado con ruta sm_80+ usada para puntuar calidad en una RTX 3090.
- Despliegue: exclusivamente con el fork `ruquant` de mx-llama.cpp (rama `ruquant`); llama.cpp estándar no reconoce los tipos W4A4/W4A4H. Binarios necesarios: `llama-server`, `llama-bench`, `llama-perplexity`.
- Tensor parallelism: `-sm tensor -devd ROCm0`; el drafter debe fijarse a una sola GPU, ya que replicado o dividido es un 19-24 % más lento.
- Variables de entorno para ROCm 5.7: `GGML_CUDA_DISABLE_GRAPHS=1`, `HSA_FORCE_FINE_GRAIN_PCIE=1`, `GGML_META_TOKEN_GRAPH=0`, `GGML_META_SPIN=2000000` (el spin añade ~2 %).
- Throughput: hasta 109,6 t/s en TP4 con decodificación especulativa y 1324,0 t/s de prefill pp2048 en TP4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD / top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (W4A4 + DFlash2) | ~27B (nominal) | no disponible | 0,0428 / 91,57 % | Apache-2.0 | GGUF en HF, requiere fork ruquant |
| unsloth Qwen3.8-27B Q4_0 | ~27B (nominal) | no disponible | 0,0259 / 93,34 % | Apache-2.0 | GGUF estándar en HF |
| unsloth Qwen3.8-27B UD-Q4_K_XL | ~27B (nominal) | no disponible | 0,0078 / 96,58 % | Apache-2.0 | GGUF estándar en HF |
| Qwen/Qwen3.8-27B (original) | ~27B (nominal) | no disponible | referencia | Apache-2.0 | safetensors en HF |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad respecto a Q4_0: KLD 0,0428 frente a 0,0259 y top-1 91,57 % frente a 93,34 %; es el precio de cuantizar también las activaciones a int4.
- Dependencia de un fork no estándar: sin la rama `ruquant` de mx-llama.cpp los ficheros no cargan; no hay soporte en llama.cpp, Ollama, vLLM ni TGI.
- Los kernels están escritos para gfx906; la ruta CUDA del fork solo emula `dot8` y no es apta para producción.
- El drafter debe fijarse a una GPU concreta; replicarlo o dividirlo degrada el rendimiento un 19-24 %.
- No hay información sobre idiomas soportados, longitud de contexto ni capacidades del modelo base (razonamiento, código, tool calling) en esta ficha; deben consultarse en la model card de Qwen/Qwen3.8-27B.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero la cadena de dependencias (mx-llama.cpp y llama.cpp, ambos MIT) debe respetarse en la redistribución.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raspbfox/Qwen3.8-27B-W4A4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta ruquant: https://github.com/skyne98/ruquant
- Fork de llama.cpp: https://github.com/skyne98/mx-llama.cpp/tree/ruquant
- Metodología y resultados: https://github.com/skyne98/ruquant/blob/main/RESULTS.md
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
