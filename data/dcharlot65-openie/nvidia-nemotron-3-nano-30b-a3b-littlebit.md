# dcharlot65-openie/NVIDIA-Nemotron-3-Nano-30B-A3B-LittleBit

## Resumen

`NVIDIA-Nemotron-3-Nano-30B-A3B-LittleBit` es un checkpoint derivado de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4` creado por el usuario dcharlot65-openie para su uso dentro de JouleDB, un runtime de inferencia sin PyTorch y una base de datos termodinámica orientada a despliegues nativos en Kubernetes (JouleKube). No es un modelo entrenado desde cero ni un ajuste fino convencional, sino una refactorización de pesos del modelo original de NVIDIA en un formato propietario `.jsyn` con compresión zstd y CRC32.

El interés técnico principal reside en la compresión extrema: el checkpoint declara 31 567 962 432 parámetros (un MoE con 30B totales y 3B activos, según el nombre del modelo base) comprimidos a 163,49 MB, lo que equivale a 0,0214 bits por peso y un factor de reducción de 368,28x frente a una representación FP16 de 60 211,11 MB. Esta cifra tan baja solo es posible porque los pesos se almacenan pre-factorizados (LittleBit-2 combinado con Sakana SVF) y se reconstruyen en tiempo de ejecución, por lo que no debe interpretarse como una cuantización tradicional de 0,02 bits por peso en el sentido de la inferencia estándar.

La relevancia actual es limitada y muy específica: el repositorio tiene 0 descargas y 0 likes, depende de la librería `jouledb` (no de transformers, vLLM o llama.cpp) y no publica resultados de benchmarks ni detalles sobre la fidelidad de la reconstrucción. Es un artefacto experimental para el ecosistema JouleDB, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (heredada de NVIDIA Nemotron-3 Nano 30B-A3B; detalles internos no disponibles) |
| Parametros totales | 31 567 962 432 |
| Parametros activos | 3B (según el nombre del modelo base; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit pre-factorizado (LittleBit-2 ⊕ Sakana SVF), 0,0214 BPW medio; no es una cuantización estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (license_name: nvidia-nemotron-open-model-license) |
| Formato de pesos | `.jsyn` (JouleDB), comprimido con zstd + CRC32; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4`, un modelo de mezcla de expertos de NVIDIA con 30B parámetros totales y 3B activos, distribuido originalmente en formato NVFP4. La información disponible no detalla la arquitectura interna (número de expertos, capas, mecanismo de atención) ni los datos de entrenamiento, RLHF o DPO del modelo original.

Este checkpoint concreto no entrena pesos nuevos: aplica una factorización LittleBit-2 combinada con Sakana SVF sobre los pesos del modelo base y los serializa en el formato `.jsyn` de JouleDB. El repositorio declara 6 027 tensores 2D en bitplanes y 214 vectores 1D (LayerNorm, bias y depthwise). La innovación declarada es la compresión termodinámica con reconstrucción en runtime sin PyTorch, pero no se publican métricas de degradación de calidad, tiempos de descompresión ni metodología de validación de la reconstrucción.

## Capacidades

- Generación de texto y razonamiento: heredadas teóricamente del modelo base Nemotron-3 Nano, aunque no se documenta la fidelidad tras la refactorización.
- Capacidades de código y matemáticas: no confirmadas en la información disponible para este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Integración con JouleDB: carga mediante `db.hf_pull()` y servicio HTTP con `jouledb serve`.

## Casos de uso

- Despliegue en clústeres Kubernetes con restricciones extremas de almacenamiento: el checkpoint de 163,49 MB permite distribuir el modelo en nodos con cuotas de disco mínimas, siempre que el runtime JouleDB reconstruya los pesos en memoria.
- Experimentación con compresión sub-1-bit: útil para investigadores que quieran estudiar la factorización LittleBit-2 ⊕ SVF y medir la degradación de calidad frente al modelo NVFP4 original.
- Pruebas de concepto de inferencia sin PyTorch: el runtime JouleDB elimina la dependencia del stack de PyTorch, lo que simplifica imágenes de contenedor y reduce la superficie de ataque en entornos air-gapped.
- Evaluación de la base de datos termodinámica JouleDB: sirve como carga de trabajo de referencia para medir latencia de descompresión y throughput del motor `.jsyn`.
- Reproducción de pipelines de adaptación de modelos NVIDIA a formatos alternativos: documenta un flujo concreto de conversión desde NVFP4 a un formato propietario.
- Docencia y demostraciones sobre cuantización extrema: el contraste entre 60 211 MB en FP16 y 163,49 MB comprimidos es un ejemplo ilustrativo, aunque debe advertirse que la compresión no es directamente comparable con cuantizaciones estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint en disco ocupa 163,49 MB, pero los 31,5B parámetros deben reconstruirse para inferir; el requisito real depende del runtime JouleDB y no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base NVFP4 está pensado para hardware NVIDIA con soporte de FP4 (arquitecturas Blackwell), pero este checkpoint no lo especifica.
- Opciones de despliegue: exclusivamente JouleDB (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-30B-A3B-LittleBit (este) | 31,5B totales / 3B activos | no disponible | `.jsyn` (JouleDB) | NVIDIA Nemotron Open Model License | 0 descargas, runtime JouleDB |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4 (base) | 30B totales / 3B activos | no disponible | NVFP4 | NVIDIA Nemotron Open Model License | Modelo oficial de NVIDIA |
| Cuantizaciones GGUF/AWQ del modelo base | 30B totales / 3B activos | no disponible | GGUF, AWQ, GPTQ | Según derivado | Ecosistema llama.cpp / vLLM |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad tras la compresión sub-1-bit; se desconoce la degradación real frente al modelo NVFP4 original.
- El formato `.jsyn` es propietario de JouleDB: no es compatible con transformers, vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad.
- Dependencia total del runtime JouleDB v0.2.4 o superior; sin él, el checkpoint es inutilizable.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La licencia NVIDIA Nemotron Open Model License impone condiciones específicas de uso comercial y atribución; debe revisarse antes de cualquier despliegue en producción.
- No se documentan idiomas soportados, sesgos conocidos ni riesgo de alucinación específico de esta variante.
- La cifra de 0,0214 BPW no es comparable con cuantizaciones estándar (4-bit, 8-bit): refleja pesos pre-factorizados que se reconstruyen en runtime, no pesos almacenados listos para cómputo directo.
- El autor del checkpoint es un usuario individual (dcharlot65-openie), no NVIDIA; la garantía de calidad recae en el adaptador, no en el fabricante del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/NVIDIA-Nemotron-3-Nano-30B-A3B-LittleBit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-NVFP4
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
