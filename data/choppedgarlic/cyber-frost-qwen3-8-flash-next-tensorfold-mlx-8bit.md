# choppedgarlic/CYBER-FROST-Qwen3.8-Flash-Next-TensorFold-MLX-8bit

## Resumen

CYBER-FROST-Qwen3.8-Flash-Next-TensorFold-MLX-8bit es una cuantización afín de 8 bits en formato MLX del checkpoint Blackfrost-AI/CYBER-FROST-3.8-BF16, publicada por el usuario choppedgarlic. Se trata de un derivado, no de un modelo original: el trabajo de conversión consiste en empaquetar los pesos en MLX Q8 (grupo 32) junto con los 76 tensores MTP nativos que el runtime TensorFold necesita para aplicar decodificación especulativa sobre Apple Silicon. El modelo base es un ajuste de la arquitectura Qwen3.8 Flash Next (identificador interno `qwen4_exp`), orientado a ciberseguridad y uso de herramientas.

El artefacto pesa 188,96 GiB (202.892.816.404 bytes) repartidos en 41 shards de SafeTensors más un fichero `model-mtp.safetensors` con los tensores MTP renombrados bajo el prefijo `language_model.mtp.*`. El índice final contiene 3.843 tensores. La conversión se realizó con MLX-VLM 0.7.12 y MLX 0.32.4 a partir de una revisión fijada del modelo fuente (`3e30d25d…`), con cuantización global afín de 8 bits y grupo 32, grupo 64 para los gates de router y shared-expert, y módulos multimodales sin cuantizar.

Su relevancia es acotada pero concreta: demuestra un flujo de empaquetado reproducible de tensores MTP dentro de un checkpoint MLX para habilitar decodificación especulativa nativa en TensorFold, con métricas medidas en un M3 Ultra de 256 GB. No es un modelo para consumo general ni para hardware convencional: el presupuesto de arranque reportado por el runtime es de 217,99 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 Flash Next (`qwen4_exp`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 100.000 tokens configurados en el perfil probado |
| Tipos de cuantizacion | MLX afín 8 bits, grupo 32 global; grupo 64 en gates de router y shared-expert; módulos multimodales sin cuantizar |
| Idiomas soportados | inglés (`en`) |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | SafeTensors MLX (41 shards base + `model-mtp.safetensors`) |
| Tamano del checkpoint | 188,96 GiB / 202.892.816.404 bytes |
| Tensores indexados | 3.843 (incluye 76 tensores MTP) |
| Runtime probado | TensorFold nativo 1.2.3 |
| Hardware probado | Apple M3 Ultra, 256 GB de memoria unificada |
| Presupuesto de arranque | 217,99 GiB (reportado por TensorFold) |
| Presupuesto cold pack | 21,65 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.8 Flash Next, denominada internamente `qwen4_exp` por el runtime, e incluye soporte nativo de Multi-Token Prediction (MTP) mediante 76 tensores dedicados que TensorFold utiliza para decodificación especulativa. El checkpoint incorpora además módulos multimodales que la conversión deja sin cuantizar, aunque la model card del origen solo valida texto como modalidad. El modelo base es un ajuste de Blackfrost-AI orientado a ciberseguridad y tool use; no se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica de este artefacto no está en el entrenamiento sino en el empaquetado: la herramienta de conversión renombró los tensores del sidecar MTP bajo `language_model.mtp.*`, escribió `model-mtp.safetensors` y actualizó el índice de pesos sin reescribir los 41 shards base. TensorFold exige que los tensores MTP residan dentro del checkpoint objetivo, de ahí el proceso. La validación reportada incluye coincidencia de cabeceras de todos los shards con el índice, contabilidad completa de tensores indexados y verificación de los 76 tensores MTP en el índice final.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo `thinking` y parámetro `reasoning_effort` (perfil probado en `xhigh`).
- Tool calling y function calling, expuestos a través de una interfaz compatible con la API de OpenAI servida localmente por TensorFold.
- Decodificación especulativa nativa mediante MTP, con aceptación de borradores reportada de hasta el 81,4 % en las ejecuciones citadas.
- Enfoque declarado en ciberseguridad: la model card cita una pantalla local de 20 prompts de comportamiento con 0 rechazos, que mide únicamente conducta de rechazo.
- Capacidades multimodales presentes en los pesos (módulos sin cuantizar), aunque la model card del origen solo valida texto y no se reclama calidad de imagen o vídeo.
- Multilingüe limitado: la etiqueta de idioma es únicamente inglés.

## Casos de uso

- Análisis de seguridad asistido en local: el modelo puede procesar prompts largos de revisión de configuración o de código con 100.000 tokens de contexto, manteniendo los datos en la máquina sin salida a servicios externos.
- Automatización de tareas de triaje en SOC: con tool calling e interfaz compatible con OpenAI, se puede conectar a scripts locales de enriquecimiento de alertas y encadenar varios pasos de razonamiento con `reasoning_effort` alto.
- Asistencia a la redacción de informes técnicos de vulnerabilidades: el modo `thinking` permite generar explicaciones estructuradas de impacto y mitigación a partir de notas internas.
- Pruebas de pipelines agenticos en Apple Silicon: sirve como banco de pruebas para validar decodificación especulativa MTP y latencias de decodificación en un M3 Ultra antes de trasladar el flujo a otros entornos.
- Evaluación de conducta de rechazo en dominios sensibles: la pantalla de 20 prompts documentada sirve como plantilla para construir tests de comportamiento propios, siempre con revisión humana.
- Investigación sobre cuantización MLX: el artefacto y su repositorio de conversión permiten reproducir el proceso Q8 con grupo 32 y comparar la fidelidad frente al BF16 de origen en tareas de texto.
- Generación de código de utilidades de seguridad: con tool calling puede integrarse en scripts que requieran invocar funciones locales (parseo de logs, consultas a bases de datos de CVE) dentro de un flujo multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas son de rendimiento de inferencia en un Apple M3 Ultra con 256 GB:

| Ruta de ejecución | Prefill | Decode |
|---|---:|---:|
| MLX-VLM Q8 baseline | 18,212 tok/s en prompt frío de 133 tokens | 35,237 tok/s sobre 128 tokens de salida |
| TensorFold nativo con MTP | secciones incrementales en caliente de hasta ~1.250 tok/s | 105,8–114,0 tok/s en peticiones limpias |

Observaciones adicionales reportadas: aceptación de borradores MTP de hasta el 81,4 %, 72,9–77,1 tok/s con helpers OMP concurrentes en cola, contexto configurado de 100K con herramientas y thinking activos, y 0 rechazos en la pantalla local de 20 prompts de ciberseguridad. El propio autor advierte que las cifras de prefill no son directamente comparables: las de TensorFold son en caliente, incrementales y asistidas por caché, mientras que la de MLX-VLM proviene de un prompt corto en frío. Los resultados varían con el estado de caché, la concurrencia, la longitud del prompt, el estado térmico y la versión de TensorFold.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 188,96 GiB y TensorFold reporta un presupuesto de arranque de 217,99 GiB, antes de contar con macOS y otras aplicaciones.
- Hardware probado: Apple M3 Ultra con 256 GB de memoria unificada, configurado con `FLASHNEXT_LOAD_LIMIT_GB=240`.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato es MLX y el runtime es específico de Apple Silicon.
- GPU de consumo: no cabe en ninguna GPU de consumo actual ni en equipos Apple Silicon con menos de 256 GB; el autor indica que sistemas más pequeños requieren otro perfil de carga y contexto y pueden no alojar este artefacto Q8.
- Despliegue: TensorFold nativo 1.2.3 instalado vía Homebrew (`brew tap ashhart/tensorfold`), servidor con interfaz compatible con OpenAI en el puerto configurado (18080 en el ejemplo).
- Latencia y throughput: ver tabla de benchmarks; en el perfil probado, 105,8–114,0 tok/s de decodificación en peticiones limpias y 72,9–77,1 tok/s con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-Qwen3.8-Flash-Next TensorFold MLX 8-bit | no disponible | 100K (perfil probado) | MLX Q8 | qwen-community-license-1.0 | Hugging Face, 0 descargas |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 (origen) | no disponible | no disponible | BF16 SafeTensors (~335 GiB) | qwen-community-license-1.0 | Hugging Face |
| MLX-VLM Q8 baseline (referencia de rendimiento citada) | no disponible | no disponible | MLX Q8 | no disponible | no disponible |

No se dispone de datos de benchmarks estandarizados que permitan comparar calidad frente a alternativas de la misma categoría. La comparación disponible es exclusivamente de rendimiento de inferencia entre la ruta MLX-VLM Q8 y TensorFold con MTP sobre el mismo hardware.

## Limitaciones y advertencias

- Modelo derivado: no es un modelo original, sino una cuantización Q8 de un ajuste de terceros; los méritos y defectos del base se heredan.
- No se pudo realizar una comparación directa de calidad BF16 frente a Q8 porque el artefacto BF16 ocupa aproximadamente 335 GiB.
- Solo inglés validado; no hay evidencia de calidad en castellano ni en otros idiomas.
- La modalidad validada es texto; aunque los pesos contienen módulos multimodales sin cuantizar, no se reclama calidad de imagen o vídeo.
- La pantalla de 20 prompts mide únicamente conducta de rechazo, no corrección de respuestas ni capacidad real en ciberseguridad; no es un benchmark estandarizado.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no documentados en la información disponible.
- Licencia qwen-community-license-1.0: conviene revisar los términos del enlace de licencia del modelo base antes de cualquier uso comercial; la etiqueta de Hugging Face figura como `other`.
- Uso restringido declarado a trabajo de seguridad autorizado y lícito, con revisión humana de la salida antes de cualquier uso operativo.
- Requisito de hardware extremo (217,99 GiB de presupuesto de arranque): inviable en equipos de consumo y en la mayoría de estaciones de trabajo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- El tamaño del repo en Hugging Face figura como 0.0 GB pese a que la model card declara 188,96 GiB; posible inconsistencia de metadatos a verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/choppedgarlic/CYBER-FROST-Qwen3.8-Flash-Next-TensorFold-MLX-8bit
- Modelo base: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Licencia del modelo base: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16/blob/main/LICENSE
- Repositorio de conversión, serving y benchmarks: https://github.com/jjakemaness/cyberfrost-qwen3.8-flashnext-mlx-tensorfold
- Runtime TensorFold: https://github.com/ashhart/TensorFold
