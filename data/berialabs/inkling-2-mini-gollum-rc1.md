# BeriaLabs/Inkling-2-Mini-gollum-RC1

## Resumen

Inkling-2-Mini-gollum-RC1 es un ajuste fino (finetune) del modelo multimodal thinkingmachines/Inkling-2-Mini, publicado por BeriaLabs bajo licencia Apache 2.0. El modelo está orientado a tareas de seguridad (security-operations) y procesamiento de documentos, además de generación de texto conversacional. Se distribuye en formato safetensors con pesos en 8 bits mediante la herramienta modelopt de NVIDIA, lo que reduce el peso del repositorio a 19,6 GB frente a los 26.388.646.440 parámetros totales que declara el archivo de safetensors.

La arquitectura se etiqueta como `inkling2_loop`, una variante propia del modelo base de Thinking Machines, y el pipeline declarado es image-text-to-text (aunque también figura text-generation). Soporta inglés y español, y está pensado para integrarse en flujos de trabajo que combinan comprensión de documentos, razonamiento multi-paso y llamadas a herramientas en entornos de operaciones de seguridad.

El modelo es de acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargarlo. Es una release candidata (RC1) con cero descargas y cero likes en el momento de la ficha, por lo que debe considerarse un artefacto en fase temprana de validación, sin benchmarks públicos ni documentación extendida más allá de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (transformer multimodal, variante del modelo base de Thinking Machines) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (pesos cuantizados con modelopt); no se detallan otras variantes |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre thinkingmachines/Inkling-2-Mini y hereda su arquitectura `inkling2_loop`, que el repositorio identifica como tipo específico dentro de la librería transformers. Se trata de un modelo multimodal image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. Los pesos publicados están cuantizados a 8 bits mediante modelopt, la herramienta de compresión de NVIDIA, lo que explica que el repositorio ocupe 19,6 GB pese a los 26.388 millones de parámetros declarados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. El nombre "gollum" y la etiqueta "security-operations" sugieren un ajuste orientado a dominios de seguridad y análisis documental, pero no hay detalles publicados sobre el corpus utilizado. Tampoco se documentan innovaciones técnicas específicas del finetune más allá de la cuantización 8-bit y la compatibilidad con endpoints declarada en las etiquetas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español.
- Procesamiento de documentos e imágenes (pipeline image-text-to-text): lectura y razonamiento sobre contenido visual y textual combinado.
- Orientación a operaciones de seguridad (security-operations): análisis de incidentes, triaje y extracción de información de informes.
- Soporte declarado de endpoints compatibles (`endpoints_compatible`), pensado para despliegue como servicio de inferencia.
- Capacidades multimodales heredadas del modelo base Inkling-2-Mini.
- No se documenta explícitamente soporte de tool calling, function calling, agentes o modo thinking; debe verificarse contra el modelo base.

## Casos de uso

- Triaje de alertas de seguridad: el modelo puede recibir capturas de pantalla de paneles SIEM junto con texto de alertas y generar un resumen priorizado, aprovechando su naturaleza image-text-to-text y su ajuste en security-operations.
- Análisis de documentos técnicos: extracción de indicadores de compromiso (IoC) y resumen de informes PDF o capturas, adecuado por el pipeline de document-processing declarado en las etiquetas.
- Asistente conversacional bilingüe en inglés y español para equipos de soporte técnico, gracias a los dos idiomas soportados y al formato conversacional.
- Generación de resúmenes de incidentes a partir de imágenes de consolas y logs, integrable en pipelines de respuesta a incidentes.
- Clasificación y enriquecimiento de tickets con contenido visual adjunto (capturas de error, diagramas), usando el modelo como componente de un backend de atención.
- Prototipado de asistentes de análisis documental en entornos con requisitos de licencia permisiva, ya que Apache 2.0 permite uso comercial sin restricciones de copyleft.
- Evaluación comparativa de finetunes sobre Inkling-2-Mini en tareas de seguridad, dado que el modelo sirve como referencia de ajuste de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 8-bit: en torno a 26-30 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 40-48 GB para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB no es suficiente para los pesos completos en 8-bit sin offloading.
- No cabe en GPUs consumer de 24 GB o menos sin cuantización adicional (4-bit) u offloading a CPU, opción no documentada en el repositorio.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura `inkling2_loop`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| BeriaLabs/Inkling-2-Mini-gollum-RC1 | 26,4 B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Gated |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | Sí | Público en HF |
| Alternativas de tamaño similar (p. ej. familias 24-27 B de código abierto) | ~24-27 B | variable | variable | variable | variable |

No se dispone de datos de rendimiento del modelo ni de comparativas publicadas frente a alternativas concretas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo en fase release candidate (RC1) con cero descargas y cero likes: sin validación comunitaria ni benchmarks publicados.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Solo se declaran inglés y español; el rendimiento en otros idiomas no está garantizado.
- No se documentan sesgos, datos de entrenamiento ni procesos de alineación, por lo que el riesgo de alucinación y de comportamientos indeseados no puede evaluarse a priori.
- La cuantización 8-bit con modelopt puede degradar ligeramente la calidad frente a los pesos originales en fp16/bf16; no se ofrecen comparativas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini, ya que el finetune hereda posibles restricciones adicionales.
- El tamaño (26,4 B parámetros) exige hardware de gama alta para inferencia en producción.
- No hay información sobre tool calling, agentes ni modo thinking, lo que limita su uso en flujos agénticos sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/BeriaLabs/Inkling-2-Mini-gollum-RC1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
