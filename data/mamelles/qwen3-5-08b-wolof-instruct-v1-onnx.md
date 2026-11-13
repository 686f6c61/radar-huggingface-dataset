# mamelles/Qwen3.5-08B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-08B-Wolof-Instruct-v1-ONNX es una exportación a formato ONNX del modelo Tonic/Qwen3.5-08B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 orientado a instrucciones en wolof. El modelo lo publica el usuario mamelles en Hugging Face y está empaquetado específicamente para su uso con Transformers.js sobre WebGPU, lo que permite ejecutar inferencia de un modelo de aproximadamente 8.000 millones de parámetros directamente en el navegador.

La relevancia de esta ficha radica en dos factores. Por un lado, el modelo base aborda un idioma de bajos recursos como el wolof, hablado principalmente en Senegal y Gambia, para el que existen pocos modelos de instrucciones de tamaño medio. Por otro, la exportación ONNX con cuantización q4f16 demuestra la viabilidad de desplegar modelos de esta escala en entornos web sin infraestructura de servidor dedicada.

No obstante, la información pública disponible es muy limitada: la model card original es prácticamente un stub y no se detallan datos de entrenamiento, benchmarks, licencia ni idiomas soportados más allá de las etiquetas del repositorio. Esta ficha refleja esa escasez de datos de forma explícita y marca como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | Aproximadamente 8.000 millones (deducido del nombre "08B"; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (cuantización de 4 bits con activaciones en fp16) para Transformers.js WebGPU |
| Idiomas soportados | Wolof (según etiquetas); el resto no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (repo de 7,8 GB); el modelo base en formato original no especificado |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5, una arquitectura transformer decoder-only, tal como indica el tipo `qwen3_5_text` en las etiquetas del repositorio. El sufijo "Instruct" sugiere un ajuste supervisado para seguir instrucciones, presumiblemente con datos en wolof, aunque no se documenta el volumen de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica si el modelo base Qwen3.5-08B emplea mezcla de expertos o atención lineal; la información pública no lo confirma.

La innovación técnica documentada es la exportación a ONNX con cuantización q4f16 para Transformers.js. Esta configuración reduce el peso del modelo a aproximadamente 7,8 GB en el repositorio y permite ejecutarlo sobre WebGPU en el navegador, con las ventajas de privacidad y despliegue sin servidor que ello conlleva. No se detallan técnicas adicionales como decodificación especulativa ni optimizaciones de atención.

## Capacidades

- Generación de texto conversacional en wolof, orientada a instrucciones según el nombre del modelo.
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Ejecución en navegador mediante Transformers.js y WebGPU.
- Capacidades de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües más allá del wolof: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales en wolof para web: el modelo puede integrarse en una aplicación web mediante Transformers.js y WebGPU, ofreciendo respuestas en wolof sin enviar datos a un servidor, lo que resulta adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Educación y alfabetización digital en Senegal y Gambia: un asistente en wolof ejecutado localmente en el navegador puede servir como herramienta de apoyo lingüístico en escuelas con infraestructura informática básica.
- Preservación y promoción de lenguas de bajos recursos: el modelo puede emplearse para generar contenido divulgativo, resúmenes o materiales educativos en wolof, contribuyendo a la presencia digital del idioma.
- Traducción asistida wolof-francés (si el modelo base lo soporta; no confirmado): útil en contextos administrativos y sanitarios de Senegal, donde el francés es lengua oficial y el wolof es la lengua vehicular.
- Prototipado rápido de aplicaciones de IA en el navegador: desarrolladores que quieran experimentar con un modelo de 8B cuantizado sin montar infraestructura de GPU pueden usar esta exportación ONNX como referencia.
- Atención al cliente localizada: empresas que operan en Senegal podrían desplegar un chatbot en wolof en su web, aunque la falta de datos sobre calidad y contexto obliga a validar exhaustivamente antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización q4f16, el modelo ocupa aproximadamente 7,8 GB en disco; en WebGPU la memoria necesaria ronda los 8 GB de VRAM o memoria unificada, aunque no se confirma en la model card.
- GPU recomendadas: no disponible. Para WebGPU se requiere un navegador compatible (Chrome, Edge) con soporte WebGPU y una GPU con suficiente memoria; tarjetas como RTX 3060 de 12 GB o superiores podrían ser suficientes, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en GPUs con 8-12 GB de VRAM o en equipos Apple Silicon con memoria unificada, pero no está verificado.
- Opciones de despliegue: Transformers.js con WebGPU (soporte oficial); ONNX Runtime Web; otros runtimes ONNX no documentados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría (modelos de instrucciones en wolof o exportaciones ONNX de tamaño similar). Se indica "no disponible".

## Limitaciones y advertencias

- La model card es un stub: no hay información sobre datos de entrenamiento, evaluación, sesgos ni limitaciones declaradas por el autor.
- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; es imprescindible contactar con el autor o revisar el modelo base antes de usarlo en producción.
- Riesgo de alucinación y sesgos: no evaluado; al tratarse de un ajuste sobre un idioma de bajos recursos, la cobertura y calidad pueden ser desiguales.
- Contexto máximo no documentado: no puede planificarse su uso en conversaciones largas sin verificación empírica.
- Idiomas soportados no confirmados más allá del wolof; el comportamiento en otros idiomas es incierto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- La fecha de creación indicada (2026-11-13) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/mamelles/Qwen3.5-08B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-Instruct-v1
- Transformers.js: https://github.com/huggingface/transformers.js
- WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
- ONNX Runtime: https://onnxruntime.ai/
