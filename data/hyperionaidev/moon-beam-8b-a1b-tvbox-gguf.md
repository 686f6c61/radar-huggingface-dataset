# hyperionaidev/Moon-Beam-8B-A1B-tvbox-GGUF

## Resumen

Moon-Beam-8B-A1B-tvbox-GGUF es una cuantización extrema del modelo tablinum/Moon-Beam-8B-A1B-Preview, un transformer de mezcla de expertos (MoE) de 7.744 millones de parámetros totales con 128 expertos y aproximadamente 1.000 millones de parámetros activos por token. Lo publica el usuario hyperionaidev dentro del proyecto smolmaxxing, cuyo objetivo es ejecutar modelos de lenguaje en hardware de gama muy baja, en este caso una Xiaomi TV Box S de tercera generación con cuatro núcleos Cortex-A55 y aproximadamente 1 GB de RAM utilizable.

El archivo GGUF (2,75 GB) emplea expertos en Q2_K con matriz de importancia (imatrix) y el resto de componentes en Q4_K, e incorpora una cabeza de salida podada a 60.000 filas de las 157.184 originales mediante un tensor `output_ids`. El modelo base deriva de inclusionAI Ling-3.0 y se distribuye con licencia MIT.

Su relevancia es fundamentalmente experimental: demuestra que un MoE de 8B puede generar texto coherente a 7,2 tok/s en un dispositivo con 1 GB de RAM paginando expertos desde almacenamiento flash bajo demanda. No obstante, requiere un llama.cpp parcheado y no funciona con herramientas estándar como Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con 128 expertos y componentes DeltaNet; derivado de inclusionAI Ling-3.0 |
| Parametros totales | 7.744.178.176 (7,74B) |
| Parametros activos | Aproximadamente 1B por token (segun el nombre A1B; valor exacto no disponible) |
| Longitud de contexto | 131.072 tokens en metadatos; probado a 1.024 tokens en TV Box |
| Tipos de cuantizacion | Expertos Q2_K con imatrix; attention, DeltaNet, experto compartido, embeddings y cabeza en Q4_K; cache KV q8_0 |
| Idiomas soportados | No disponible (la cabeza podada prioriza ingles y multilingue frecuente; tokens raros y no latinos mayoritariamente excluidos de la generacion) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `mb-q2-h60.gguf`, 2,75 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos y 7,74B parametros totales, construido sobre inclusionAI Ling-3.0 e integrando componentes DeltaNet ademas de atencion clasica. La variante aqui publicada es una cuantizacion, no un reentrenamiento: los expertos se comprimen a Q2_K usando una imatrix calculada sobre una muestra de Wikipedia y Project Gutenberg, mientras que el resto de tensores se mantienen en Q4_K para preservar calidad.

La innovacion principal de esta ficha no esta en el entrenamiento sino en el runtime: el proyecto smolmaxxing aplica un parche a llama.cpp (commit `8642541` mas `patches/llama.cpp-v0.8.0-tvbox.patch`) que implementa paginacion de expertos desde flash, enrutamiento consciente de cache, prefetch pre-gate y warm start. Ademas, la cabeza de salida se poda a 60.000 filas seleccionadas por frecuencia de token en un corpus ingles y multilingue, lo que reduce el coste de la capa final. No se dispone de informacion sobre el volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con calidad medida de 0,996 bits por byte en perplejidad sobre un texto fijo de 22 KB (mejor que Bonsai-8B, que obtiene 0,974 en el mismo texto).
- Razonamiento basico y respuesta a instrucciones heredados del modelo base Moon-Beam-8B-A1B-Preview.
- Soporte de contexto largo en metadatos (131.072 tokens), aunque en el dispositivo objetivo se ejecuta a 1.024 tokens.
- Capacidad multilingue limitada por la poda de la cabeza: solo puede generar tokens del subconjunto de 60.000 filas, lo que excluye la mayoria de tokens no latinos y poco frecuentes.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Inferencia en dispositivos de gama muy baja: el caso principal es ejecutar un LLM de 8B en una TV Box Android con 1 GB de RAM, usando paginacion de expertos desde flash. Es adecuado porque el runtime parcheado mantiene solo un pool reducido de expertos en memoria (43 por capa por defecto).
- Demostracion e investigacion de tecnicas de compresion MoE: sirve para estudiar el impacto de Q2_K con imatrix y de la poda de cabeza en la calidad, comparando bits por byte frente a otras cuantizaciones.
- Asistentes conversacionales offline en hardware embebido: con 7,2 tok/s y ~1,14 GB RSS en modo headless, puede alimentar interfaces de chat locales sin conexion.
- Pruebas de concepto de LLM en entornos con restricciones de memoria (Raspberry Pi, mini-PC, routers con almacenamiento): el enfoque de repack cache de 2,6 GB permite operar con RAM muy limitada.
- Generacion de texto corto y respuestas acotadas: dado que sin penalizacion de repeticion el modelo entra en bucles tras 250-300 palabras, encaja en tareas de respuesta breve (resumenes de una frase, clasificacion generativa, completado corto).
- Evaluacion comparativa de runtimes: util para medir latencia y throughput de llama.cpp parcheado frente a configuraciones estandar en el mismo hardware.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Calidad (bits/byte, menor es mejor) | 0,996 | Configuracion por defecto: top-6 expertos, bias 0,25, prefetch, repeat penalty |
| Calidad (bits/byte) | 0,963 | Top-8 expertos, bias 0,2 |
| Calidad de referencia Bonsai-8B | 0,974 | Mismo texto de 22 KB |
| Throughput en chat real | 7,2 tok/s | Xiaomi TV Box S (3rd Gen), 4x Cortex-A55, ~1 GB RAM |
| Throughput con top-8 | ~6,9 tok/s | Misma TV Box |
| RAM (RSS) | ~1,14 GB | Modo headless |
| Almacenamiento adicional | 2,6 GB | Cache de repack en flash |
| Tasa de respuestas largas con bucle | 2 de 8 | Sin repeat penalty; se corrige con `--repeat-penalty 1.15 --repeat-last-n 256` |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~1,14 GB RSS en modo headless con paginacion de expertos; en una maquina con RAM suficiente, el modelo completo en Q2_K/Q4_K ocupa aproximadamente 2,75 GB mas overhead de runtime.
- GPU recomendadas: no se documentan; el caso objetivo es CPU ARM de 4 nucleos (Cortex-A55). En GPU, cualquier tarjeta con 4 GB o mas de VRAM deberia poder cargar el archivo completo sin paginacion, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores con 4-8 GB de VRAM, aunque no se aportan datos medidos.
- Opciones de despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (llama-server con variables `GGML_MOE_PAGER`, `GGML_MOE_POOL`, `GGML_MOE_BIAS`, `LLAMA_MOE_USED`, `GGML_MOE_PREFETCH_K`, `GGML_MOE_PREFETCH_AHEAD`, `GGML_MOE_WARM`, `GGML_REPACK_CACHE`). No es compatible con llama.cpp estandar, Ollama, LM Studio ni TGI.
- Latencia y throughput: 7,2 tok/s en TV Box; 144 ms por token segun la figura del autor. No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (bits/byte) | Licencia | Despliegue |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-tvbox-GGUF | 7,74B totales, ~1B activos (MoE) | 131.072 (metadatos); 1.024 en TV | 0,996 | MIT | llama.cpp parcheado |
| Bonsai-8B | No disponible | No disponible | 0,974 | No disponible | No disponible |
| Moon-Beam-8B-A1B-Preview (base) | 7,74B totales, ~1B activos (MoE) | 131.072 | No disponible | MIT | llama.cpp estandar, otros runtimes |

La comparativa con alternativas de la misma categoria (MoE de ~8B en GGUF) no esta disponible en la informacion proporcionada mas alla de la referencia a Bonsai-8B en la metrica de perplejidad.

## Limitaciones y advertencias

- Requiere un binario de llama.cpp parcheado especifico; no carga en llama.cpp estandar, Ollama, LM Studio ni otras herramientas convencionales.
- La cabeza de salida podada a 60.000 tokens impide generar tokens raros y la mayoria de caracteres no latinos; el multilingue real esta severamente limitado.
- Sin penalizacion de repeticion (`--repeat-penalty 1.15 --repeat-last-n 256`) el modelo entra en bucles tras 250-300 palabras: 2 de cada 8 respuestas largas fallan en la configuracion medida.
- La cuantizacion Q2_K en expertos degrada la calidad respecto al modelo base; la perplejidad medida (0,996 bits/byte) es peor que la de un modelo de 8B denso de referencia (Bonsai-8B, 0,974).
- El contexto practico probado es de solo 1.024 tokens en el dispositivo objetivo, muy por debajo de los 131.072 declarados en metadatos.
- Riesgo de alucinacion y sesgos no evaluados: no se publican analisis de sesgo ni evaluaciones de robustez.
- El campo `general.name` en metadatos dice "Merged R1B", heredado del archivo fuente, lo que puede confundir en auditorias.
- Uso comercial permitido por licencia MIT, pero la viabilidad practica en produccion esta limitada por el throughput (7,2 tok/s) y la necesidad de hardware especifico o runtime parcheado.
- El rendimiento en GPU no esta medido; las cifras de velocidad solo aplican a la TV Box de referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyperionaidev/Moon-Beam-8B-A1B-tvbox-GGUF
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Fuente de la cuantizacion: tablinum/Moon-Beam-8B-A1B-GGUF-Preview (Q8_0)
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Write-up experimental (EXPERIMENT.md §19): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Scoreboard del proyecto: https://github.com/hyperionaidev/smolmaxxing#scoreboard
- Quick start del runtime parcheado: https://github.com/hyperionaidev/smolmaxxing#quick-start
- llama.cpp: https://github.com/ggml-org/llama.cpp
- inclusionAI Ling-3.0: no disponible (enlace directo no proporcionado)
