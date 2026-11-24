# masgild/Frankenstein-Gemma-4-12B-GGUF

## Resumen

Frankenstein-Gemma-4-12B-GGUF es un derivado experimental del modelo base google/gemma-4-12B, publicado por el usuario masgild bajo licencia Apache 2.0. No es un modelo afinado para instrucciones ni un chat: es una versión comprimida y modificada estructuralmente del backbone de Gemma 4 12B, orientada a inferencia en CPU y a la investigación sobre cuantización de bajo bit, poda estructurada, adaptadores de corrección y memoria recurrente. El paquete combina cuantización mixta (Q2_K para las matrices del backbone, Q6_K para el vocabulario y FP32 para tensores pequeños), poda del 1,25 % de las neuronas MLP y adaptadores de corrección de bajo rango en Q4_0.

El modelo conserva las 48 capas del decodificador original e incorpora adaptadores Delta-Rule sobre las correcciones Q/K de atención en las capas 5, 11, 17, 23, 29, 35, 41 y 47 (indexadas desde cero). El estado de memoria recurrente son cuatro cabezas de 32×32 en FP16 por módulo, con 128 KiB de estado matricial activo en los 16 módulos Q/K, sin contar búferes ni copias de estado verificado. El contexto probado por el autor es de 1.024 tokens, incluyendo prompt y salida generada; el contexto máximo más largo de la configuración original no se ha validado en esta release.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de compresión agresiva sobre un modelo de 12B que cabe en 4,68 GB en disco; por otro, advierte de una dependencia crítica de runtime propio. El modelo no es compatible de forma establecida con llama.cpp estándar, llama-cpp-python, Ollama, la importación GGUF de Transformers ni proveedores de inferencia alojada. Un cargador que ignore los tensores del adaptador personalizado no reproducirá la release completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) con adaptadores Delta-Rule recurrentes sobre atención Q/K; backbone de 48 capas |
| Parametros totales | 12.322.193.472 entradas almacenadas (11.801.182.256 en backbone + 521.011.216 en adaptador de corrección) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens probados (prompt + salida); contexto máximo original no validado |
| Tipos de cuantizacion | Q2_K (matrices backbone), Q6_K (pesos de vocabulario), FP32 (tensores pequeños), Q4_0 (adaptadores de corrección de bajo rango) |
| Idiomas soportados | no disponible (modelo base text-only; idiomas no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: backbone y adaptador fundido) + runtime nativo Linux x86_64 CPU |
| Tamano en disco | 4.679.459.300 bytes (4,68 GB / 4,36 GiB) backbone + adaptador |
| Poda | 1,25 % de neuronas MLP eliminadas (9.216 neuronas / 106.168.320 entradas del backbone) |
| Estado de memoria recurrente | 4 cabezas de 32×32 FP16 por módulo; 128 KiB de estado matricial activo en 16 módulos Q/K |
| Modelo base | google/gemma-4-12B (revision 1a2c7729392586f5ecddae8807ee2ef741eabb9a) |

## Arquitectura y entrenamiento

El modelo parte del backbone decoder-only de Gemma 4 12B y aplica tres transformaciones principales. Primero, una cuantización mixta por bloques: las matrices del backbone se almacenan en Q2_K, el vocabulario en Q6_K y los tensores pequeños (normalizaciones, escalares de puerta) en FP32. Segundo, una poda estructurada del 1,25 % de las neuronas MLP, que elimina 9.216 neuronas y 106.168.320 entradas del backbone. Tercero, un adaptador de corrección de bajo rango cuantizado en Q4_0 con aproximadamente 521 millones de entradas, que se funde con el backbone en el fichero `frank-exact-1p25-fused-delta.gguf`.

La innovación técnica más destacable son los adaptadores Delta-Rule recurrentes añadidos a las correcciones Q/K de atención en ocho capas concretas (5, 11, 17, 23, 29, 35, 41 y 47). Estos adaptadores complementan la atención y la caché KV de Gemma; no sustituyen la atención global por un backbone recurrente de memoria constante. Cada módulo mantiene cuatro cabezas de 32×32 en FP16, lo que suma 128 KiB de estado matricial activo en los 16 módulos Q/K. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO o ajuste por instrucciones; de hecho, el autor indica explícitamente que no es un modelo afinado para instrucciones.

## Capacidades

- Generación de texto en estilo completion (continuación de prompt), no en estilo chat ni instrucciones.
- Razonamiento y conocimiento factual heredados del backbone Gemma 4 12B, degradados por la compresión Q2_K y la poda.
- Capacidades multilingües: no declaradas ni evaluadas en la información disponible.
- Tool calling / function calling: no disponible; el modelo no está afinado para ello.
- Soporte de agentes y razonamiento multi-paso: no establecido.
- Memoria recurrente Delta-Rule sobre atención Q/K como capacidad experimental de investigación, no como mejora de razonamiento validada.
- Sin soporte de visión, audio ni multimodal (el autor indica que la release no incluye inferencia multimodal).
- Sin modo thinking ni plantillas de rol; añadir delimitadores de rol no convierte el modelo en instruction-tuned.

## Casos de uso

- Investigación sobre cuantización de bajo bit: el modelo permite estudiar el impacto de Q2_K, Q6_K y Q4_0 en perplejidad y generación sobre un backbone de 12B, comparando con el Gemma 4 12B original en FP16/BF16.
- Estudio de poda estructurada: la eliminación del 1,25 % de neuronas MLP sirve como caso controlado para medir la degradación de calidad y la tolerancia del backbone a la poda.
- Experimentación con memoria recurrente Delta-Rule: los adaptadores en ocho capas permiten reproducir y extender el trabajo del autor sobre estado matricial de 32×32 en FP16 y su efecto en tareas de completion corta.
- Inferencia local en CPU sin GPU: el runtime empaquetado para Linux x86_64 permite ejecutar el modelo en máquinas sin acelerador, con un throughput medido de aproximadamente 5,71 tokens/s con seis hilos de CPU.
- Reproducibilidad y procedencia: los ficheros `release-manifest.json`, `SHA256SUMS` y `evaluation/summary.json` permiten verificar hashes y reproducir la evaluación local del autor.
- Docencia y divulgación técnica: como ejemplo práctico de pipeline de compresión (cuantización + poda + adaptadores + runtime propio) sobre un modelo open weights.
- Pruebas de compatibilidad de runtimes GGUF: útil para evaluar qué cargadores respetan o ignoran tensores de adaptador personalizados y cómo afecta a la salida.

## Benchmarks y rendimiento

Los datos disponibles son comprobaciones locales pequeñas, no puntuaciones de benchmarks completos. El adaptador fundido se evaluó a escala 1.0 con inferencia en CPU.

| Split | Posiciones WikiText | Perplejidad | LAMBADA (completions exactas) |
|---|---:|---:|---:|
| Development | 508 | 61,28 | 21 / 24 |
| Confirmation | 508 | 52,99 | 19 / 32 |

Un adaptador de corrección estática anterior obtuvo perplejidad 53,05 en confirmation y 19/32 en LAMBADA. El autor señala que la diferencia es pequeña y no constituye evidencia de una mejora general de memoria o razonamiento. El throughput medido es de aproximadamente 5,71 tokens/s con seis hilos de CPU en el equipo del autor; es dependiente del hardware y de la carga. No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones con Gemma 4 12B en precisión completa en la información disponible.

## Requisitos de hardware

- VRAM: no aplica para el runner empaquetado; el runtime objetivo es Linux x86_64 CPU y no requiere GPU.
- Almacenamiento: 4,68 GB para backbone + adaptador, más el runtime nativo y los ficheros de tokenizer y evaluación.
- GPU recomendadas: no disponibles ni soportadas por el runner empaquetado; no se documenta compatibilidad con CUDA, ROCm ni Metal.
- ¿Cabe en GPU de consumo? No se establece compatibilidad con GPUs de consumo en esta release; el soporte es CPU.
- Opciones de despliegue: runtime nativo propio incluido en `runtime/linux-x86_64-cpu.tar.gz`, con código fuente en `runtime/source/` (basado en llama.cpp build b12542 con modificaciones locales). llama.cpp estándar, llama-cpp-python, Ollama, la importación GGUF de Transformers y proveedores alojados no son objetivos de compatibilidad establecidos.
- Requisitos de sistema: glibc, libstdc++ y OpenMP compatibles; instrucciones de recompilación en `runtime/BUILD.md`.
- Latencia y throughput: aproximadamente 5,71 tokens/s con seis hilos de CPU (mediana de decodificación) en el equipo del autor; no se documentan latencias de primer token ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Compatibilidad de runtime |
|---|---|---|---|---|---|
| Frankenstein-Gemma-4-12B-GGUF | 12.322.193.472 entradas almacenadas | 1.024 tokens probados | Q2_K / Q6_K / Q4_0 / FP32 mixta | Apache 2.0 | Runtime propio Linux x86_64 CPU |
| google/gemma-4-12B | 12B (no disponible el desglose exacto) | no disponible en la información proporcionada | FP16/BF16 original | Apache 2.0 | Transformers, ecosistema estándar |
| Alternativas GGUF de 12B en Q2_K | no disponible | no disponible | Q2_K estándar | variable | llama.cpp, Ollama, llama-cpp-python |

La comparación directa con el Gemma 4 12B original no puede cuantificarse con los datos disponibles: no hay benchmarks comunes publicados en esta release. Frente a otras cuantizaciones GGUF estándar de modelos de 12B, la diferencia clave es la incompatibilidad con cargadores convencionales y la inclusión de adaptadores recurrentes que un loader estándar ignoraría.

## Limitaciones y advertencias

- No es un modelo instruction-tuned: no sigue instrucciones de forma fiable ni funciona como chat; añadir delimitadores de rol no cambia esta limitación.
- La compresión Q2_K y la poda del 1,25 % degradan la precisión; el autor advierte de repeticiones y errores factuales en las salidas.
- El contexto validado es de solo 1.024 tokens; el contexto máximo original de Gemma 4 12B no se ha validado en esta release.
- La memoria recurrente Delta-Rule no ha demostrado mejorar el razonamiento ni la recuperación en contexto largo; el autor lo indica explícitamente.
- Compatibilidad restringida: requiere los dos ficheros GGUF y el runtime empaquetado; cargadores estándar no reproducen la release completa.
- Sin soporte multimodal ni del sidecar experimental Lean del proyecto.
- Sin datos sobre sesgos, idiomas soportados ni evaluación de seguridad; no se han publicado resultados de benchmarks estándar.
- Licencia Apache 2.0 heredada del modelo base, pero el uso comercial en producción no está respaldado por evaluaciones de calidad; el autor no establece idoneidad para producción.
- Es un derivado independiente, no una release oficial de Google; la procedencia y los hashes deben verificarse con `SHA256SUMS` y `release-manifest.json` antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masgild/Frankenstein-Gemma-4-12B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio del proyecto: https://github.com/masgild/frankenstein-recurrent-sparse-engine
- Runtime upstream llama.cpp: https://github.com/ggml-org/llama.cpp
