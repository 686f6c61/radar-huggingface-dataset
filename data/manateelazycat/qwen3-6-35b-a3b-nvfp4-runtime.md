# manateelazycat/Qwen3.6-35B-A3B-NVFP4-Runtime

## Resumen

`manateelazycat/Qwen3.6-35B-A3B-NVFP4-Runtime` no es un modelo de lenguaje en sentido estricto, sino un conjunto de artefactos de despliegue para ejecutar el modelo Qwen3.6-35B-A3B en formato NVFP4 sobre plataformas NVIDIA Jetson (AGX Thor y AGX Orin). El repositorio empaqueta archivos `FROM scratch` de una sola capa, una caché JIT precalentada para Thor y un bundle de controlador LPK asociado al identificador `cloud.lazycat.aipod.qwen36-35b-a3b-nvfp4`. Lo publica el usuario manateelazycat bajo licencia Apache 2.0.

El punto clave es que estos archivos no contienen pesos del modelo. Según la propia model card, los pesos oficiales se fijan de forma independiente mediante commits inmutables verificados por SHA256 en Hugging Face y ModelScope, en los repositorios `nvidia/Qwen3.6-35B-A3B-NVFP4`, `NV-Community/Qwen3.6-35B-A3B-NVFP4` y `unsloth/Qwen3.6-35B-A3B-MTP-GGUF`. Por tanto, este repositorio es infraestructura de distribución para edge computing con IA, no un checkpoint entrenado.

Su relevancia es acotada pero concreta: facilita el despliegue reproducible de un modelo de 35B parámetros totales con arquitectura MoE (A3B sugiere 3B parámetros activos) en GPUs integradas de NVIDIA para robótica y sistemas embebidos. El tamaño del repo (8,4 GB) corresponde principalmente al tarball de Thor, no a los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repo no incluye pesos; el nombre del modelo apunta a Qwen3.6, presumiblemente transformer MoE con componentes SSM/Mamba segun la cache `mamba-ssm=bfloat16`) |
| Parametros totales | 35B (segun el nombre del modelo referenciado) |
| Parametros activos | 3B (segun el sufijo A3B del nombre) |
| Longitud de contexto | 131K (mencionado en la cache precalentada de Thor) |
| Tipos de cuantizacion | NVFP4 (formato de 4 bits de NVIDIA para FP4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (el repo no contiene pesos); los pesos referenciados estan en NVFP4 y GGUF (MTP) en repos externos |

## Arquitectura y entrenamiento

Este repositorio no documenta arquitectura ni proceso de entrenamiento del modelo subyacente, ya que no contiene pesos. Lo que sí describe son los artefactos de runtime: un tarball principal para AGX Thor (`SM110`, CUDA 13.2) de 7.480.886.069 bytes, una caché JIT precalentada para Thor de 88.226.405 bytes con contexto de 131K y `mamba-ssm=bfloat16`, y dos tarballs para AGX Orin 64GB en JetPack 7 (`SM87`, CUDA 13.2) y JetPack 6 (`SM87`, CUDA 12.6), de aproximadamente 400 MB cada uno.

La mención a `mamba-ssm` en la caché de Thor sugiere que el modelo Qwen3.6-35B-A3B incorpora capas de espacio de estados (SSM) además de atención, lo que encajaría con una arquitectura híbrida. El formato NVFP4 es la cuantización de 4 bits en coma flotante de NVIDIA optimizada para las unidades tensor de arquitecturas Blackwell (SM110 en Thor). No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Despliegue de inferencia del modelo Qwen3.6-35B-A3B en formato NVFP4 sobre Jetson AGX Thor y AGX Orin 64GB.
- Ejecución con contexto largo (131K) en Thor gracias a la caché JIT precalentada.
- Soporte de arquitectura híbrida con componentes Mamba/SSM (indicado por `mamba-ssm=bfloat16` en la caché).
- Integración con el controlador LPK de Lazycat AIPod (`cloud.lazycat.aipod.qwen36-35b-a3b-nvfp4`).
- Compatibilidad con dos versiones de JetPack (6 y 7) en Orin mediante artefactos separados.
- Verificación de integridad mediante SHA256 en todos los artefactos.
- Las capacidades intrínsecas del modelo (generación de texto, código, matemáticas, tool calling, agentes, multilingüismo) no se detallan en la información disponible y deben consultarse en las model cards de los repositorios de pesos oficiales.

## Casos de uso

- Despliegue en robótica embebida con Jetson AGX Thor: el tarball principal y la caché JIT precalentada permiten arrancar el modelo NVFP4 con contexto de 131K en un módulo Thor (`SM110`, CUDA 13.2), adecuado para robots autónomos que necesitan razonamiento local sin depender de la nube.
- Inferencia en el borde con AGX Orin 64GB: los artefactos para JetPack 6 y 7 permiten ejecutar el modelo en dispositivos Orin ya desplegados, útil en vehículos autónomos, drones o sistemas industriales con conectividad limitada.
- Reproducibilidad en producción: los SHA256 y los commits inmutables de los pesos permiten construir pipelines de CI/CD que verifiquen la integridad del runtime y de los pesos antes de desplegar en flotas de dispositivos.
- Integración con el ecosistema Lazycat AIPod: el bundle LPK facilita la instalación y gestión del modelo como servicio en dispositivos gestionados por esta plataforma.
- Prototipado de asistentes de voz o agentes locales: con 3B parámetros activos y contexto de 131K, el modelo puede gestionar conversaciones multi-turno y documentos largos en un dispositivo de bajo consumo.
- Evaluación comparativa de cuantizaciones NVFP4 frente a GGUF: el repo referencia la variante `unsloth/Qwen3.6-35B-A3B-MTP-GGUF`, lo que permite comparar latencia y calidad entre formatos en el mismo hardware.
- Investigación en eficiencia energética: al ejecutarse en módulos Jetson, sirve para medir rendimiento por vatio de modelos MoE de 35B en formato FP4 de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni latencia/throughput. Para datos de rendimiento del modelo subyacente debe consultarse la model card de `nvidia/Qwen3.6-35B-A3B-NVFP4` o `NV-Community/Qwen3.6-35B-A3B-NVFP4`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 35B parámetros en NVFP4 (4 bits), el peso teórico ronda los 17,5 GB, pero el tarball de Thor ocupa 7,48 GB, lo que sugiere empaquetado comprimido o pesos parciales; no se puede confirmar el footprint en VRAM.
- GPU soportadas: NVIDIA Jetson AGX Thor (`SM110`, CUDA 13.2) y Jetson AGX Orin 64GB (`SM87`, CUDA 13.2 en JP7 y CUDA 12.6 en JP6).
- No está pensado para GPUs de consumo (RTX 4090, etc.) ni para A100/H100: los artefactos están compilados específicamente para las arquitecturas Jetson indicadas.
- Opciones de despliegue: bundle LPK de Lazycat AIPod, tarballs `FROM scratch` y caché JIT precalentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (runtime Qwen3.6-35B-A3B NVFP4) | 35B totales / 3B activos | 131K | NVFP4 (runtime Jetson) | Apache 2.0 | Hugging Face, 0 descargas |
| `nvidia/Qwen3.6-35B-A3B-NVFP4` | 35B totales / 3B activos | No disponible | NVFP4 (pesos) | No disponible | Hugging Face |
| `NV-Community/Qwen3.6-35B-A3B-NVFP4` | 35B totales / 3B activos | No disponible | NVFP4 (pesos) | No disponible | Hugging Face |
| `unsloth/Qwen3.6-35B-A3B-MTP-GGUF` | 35B totales / 3B activos | No disponible | GGUF (MTP) | No disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo referenciadas en la model card, ya que no se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No contiene pesos: es un repo de runtime. Descargarlo no proporciona el modelo; hay que obtener los pesos de los repositorios oficiales referenciados.
- Hardware restringido: los artefactos solo funcionan en Jetson AGX Thor y AGX Orin 64GB con las versiones de CUDA y JetPack indicadas. No son portables a otras GPUs.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Autor único no oficial: manateelazycat no es el desarrollador de Qwen ni de NVIDIA; la fiabilidad del empaquetado depende de este tercero.
- Idiomas no especificados: no se puede confirmar el soporte multilingüe del modelo subyacente desde este repo.
- Sesgos y alucinaciones: no documentados en este repositorio; deben evaluarse en la model card del modelo base.
- Licencia Apache 2.0 declarada, pero al no incluir pesos, las condiciones reales de uso comercial dependen de la licencia de los pesos oficiales, que no se detalla aquí.
- Fecha de creación futura (2026-11-19): el repositorio está fechado en el futuro, lo que puede indicar metadatos inconsistentes o un artefacto de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/manateelazycat/Qwen3.6-35B-A3B-NVFP4-Runtime
- Pesos oficiales NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Pesos NV-Community: https://huggingface.co/NV-Community/Qwen3.6-35B-A3B-NVFP4
- Pesos GGUF Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
