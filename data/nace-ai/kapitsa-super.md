# nace-ai/kapitsa-super

## Resumen

Kapitsa Super es una distribución de pesos del modelo NVIDIA Nemotron 3.5 Super VL 120B-A12B en cuantización NVFP4, publicada por nace-ai para su ejecución local en Apple Silicon mediante el motor de inferencia Kapitsa. No se trata de un modelo entrenado desde cero, sino de una réplica del checkpoint oficial de NVIDIA empaquetada para un runtime concreto: el repositorio apunta explícitamente al modelo base `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4`, de modo que las capacidades del modelo son las del Nemotron original y el valor añadido está en el motor y el formato de despliegue.

La arquitectura es un híbrido Mamba-2 con mezcla de expertos (MoE): 120 000 millones de parámetros totales con 12 000 millones activos por token. El checkpoint ocupa 76,4 GB en NVFP4, lo que lo sitúa en el rango de equipos Apple Silicon con 96 GB de memoria unificada o más. Admite entradas de texto e imagen, por lo que cubre tanto generación de texto como tareas de visión.

Su relevancia es práctica: permite ejecutar un modelo de 120B con capacidades multimodales en un Mac de sobremesa, sin GPU dedicada, con una velocidad declarada de 87 tokens por segundo en decodificación sobre un M5 Max de 128 GB. El motor Kapitsa expone APIs compatibles con OpenAI y Anthropic, lo que facilita integrarlo en herramientas de agentes de código como Claude Code, Codex u opencode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 con mezcla de expertos (MoE) |
| Parametros totales | 120B |
| Parametros activos | 12B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | no disponible (checkpoint NVFP4 de 76,4 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas Mamba-2 con capas de mezcla de expertos, sumando 120B de parámetros con 12B activos por token. Esta configuración reduce el coste computacional por token frente a un modelo denso del mismo tamaño, a costa de requerir toda la memoria de los pesos residentes. La variante publicada está cuantizada en NVFP4, un formato de coma flotante de 4 bits, lo que rebaja el peso del checkpoint a 76,4 GB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones de decodificación específicas más allá del propio motor Kapitsa, que según su repositorio está optimizado para maximizar la velocidad de decodificación en Apple Silicon. Cualquier detalle adicional sobre el entrenamiento debe consultarse en la model card del checkpoint oficial de NVIDIA.

## Capacidades

- Generación de texto y razonamiento sobre entradas multimodales de texto e imagen.
- Procesamiento de imágenes: el modelo base es un modelo VL (vision-language), por lo que acepta imágenes junto al prompt.
- Mezcla de expertos con 12B activos por token, pensada para mantener latencia baja en inferencia local.
- Servicio mediante APIs compatibles con OpenAI y Anthropic a través del motor Kapitsa.
- Integración con herramientas de agentes de código: el motor arranca opencode, Claude Code, Codex o pi sobre el modelo local.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling o function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local: ejecutar Claude Code, Codex u opencode contra el modelo servido por Kapitsa permite trabajar con un agente de programación sin enviar código a servicios externos, usando la API compatible con Anthropic que expone el motor.
- Análisis de capturas y diagramas: al aceptar entradas de imagen, el modelo puede describir interfaces, leer diagramas de arquitectura o extraer información de capturas dentro de un flujo de documentación técnica.
- Prototipado de agentes multi-paso: la API compatible con OpenAI facilita conectar frameworks de agentes existentes sin adaptadores, útil para validar flujos antes de migrar a infraestructura con GPU.
- Procesamiento de documentos con componente visual: extracción y resumen de contenido en PDFs escaneados o presentaciones, combinando la entrada de imagen con generación de texto.
- Inferencia privada en estación de trabajo: equipos Mac con 96 GB o más pueden mantener conversaciones y análisis de datos sensibles sin salida a red, gracias a que todo el modelo reside en memoria unificada.
- Evaluación comparativa de modelos grandes en hardware de consumo: investigadores pueden medir calidad y latencia de un MoE de 120B en Apple Silicon antes de decidir un despliegue en clúster.
- Generación de texto y razonamiento general en local: sustitución de APIs en entornos con conectividad limitada o con requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento proporcionado es la velocidad de decodificación del motor:

| Equipo | Decodificación (tok/s) |
|---|---:|
| Mac M5 Max 128 GB | 87 |

## Requisitos de hardware

- Memoria: el checkpoint NVFP4 ocupa 76,4 GB, por lo que se recomienda un Mac con 96 GB de memoria unificada o más; el dato de velocidad se ha medido en un M5 Max de 128 GB.
- GPU dedicadas: no aplica, el motor Kapitsa está orientado a Apple Silicon; no hay datos de despliegue en A100, H100 o RTX 4090 para esta distribución.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB o menos por el tamaño del checkpoint; en Apple Silicon requiere los modelos de gama alta con memoria unificada amplia.
- Despliegue: motor Kapitsa (`kapitsa serve --model super`), con APIs compatibles con OpenAI y Anthropic. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para esta distribución.
- Rendimiento: 87 tok/s de decodificación en M5 Max de 128 GB según el autor; no hay datos de throughput agregado ni de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kapitsa Super (Nemotron 3.5 Super VL 120B-A12B) | 120B | 12B | no disponible | NVFP4 | NVIDIA Open Model License | Hugging Face, motor Kapitsa |
| NVIDIA Nemotron 3.5 Super VL 120B-A12B (original) | 120B | 12B | no disponible | no disponible | NVIDIA Open Model License | Hugging Face (nvidia) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el checkpoint original de NVIDIA: Kapitsa Super no altera el modelo, solo lo empaqueta en NVFP4 para el runtime de Apple Silicon. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia es la NVIDIA Open Model License, no una licencia permisiva estándar; deben revisarse sus condiciones antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de seguridad en la información disponible.
- No se especifican los idiomas soportados; el rendimiento en castellano es desconocido.
- La longitud de contexto no está publicada en esta ficha, lo que impide planificar cargas de trabajo con ventanas largas.
- El requisito de 96 GB o más de memoria unificada excluye a la mayoría de equipos Apple Silicon de gama media y a todas las GPU de consumo habituales.
- El dato de 87 tok/s procede del autor y corresponde a un único equipo (M5 Max 128 GB); no hay mediciones independientes.
- La cuantización NVFP4 puede degradar la calidad frente al checkpoint en precisión completa; no se han publicado evaluaciones comparativas.
- Dependencia de un motor propietario de terceros (Kapitsa) para el despliegue; la portabilidad a otros runtimes no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/kapitsa-super
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Repositorio del motor Kapitsa: https://github.com/nace-ai/kapitsa
- Releases del motor Kapitsa: https://github.com/nace-ai/kapitsa/releases
