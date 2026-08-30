# hmwri/japanese-300m-base-onnx

## Resumen

El modelo `hmwri/japanese-300m-base-onnx` es un transformador decoder-only de 299 millones de parámetros, entrenado desde cero sobre el subconjunto `sample_10BT` del corpus FineWeb2 Edu Japanese. Ha sido desarrollado por el usuario `hmwri` y publicado en Hugging Face con el objetivo de ofrecer una versión cuantizada en formato ONNX (Q4F16) que pueda ejecutarse directamente en el navegador mediante la librería Transformers.js y WebGPU. Se trata de un modelo base, no afinado para instrucciones, pensado para tareas de completado de texto en japonés.

La relevancia de este modelo reside en su tamaño compacto y su formato optimizado para inferencia en clientes web, lo que permite desplegar capacidades de generación de lenguaje natural en aplicaciones sin necesidad de infraestructura de servidor. Su arquitectura es compatible con Llama, con 28 capas, tamaño oculto de 896 y 14 cabezas de atención para consultas y 7 para claves/valores. La longitud de contexto es de 4.096 tokens y el vocabulario está compuesto por 32.768 tokens SentencePiece Unigram.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con Llama |
| Parametros totales | 299.157.376 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q4F16 (pesos en 4 bits, activaciones en FP16) |
| Idiomas soportados | Japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | ONNX (safetensors no aplicable; el repo contiene archivos ONNX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder-only estándar, con normalización previa (pre-norm), atención multi-cabeza con 14 cabezas de consulta y 7 cabezas de clave/valor (una configuración de atención agrupada, similar a la usada en modelos Llama 2). La capa oculta tiene dimensión 896 y se emplean 28 capas. El vocabulario se construye con SentencePiece Unigram de 32.768 tokens, lo que permite una tokenización eficiente del japonés.

El entrenamiento se realizó desde cero (scratch) sobre el subconjunto `sample_10BT` del dataset `hotchpotch/fineweb-2-edu-japanese`, que contiene 13.488.028 documentos y 10.641.604.608 tokens para entrenamiento, más 7.720 documentos y 6,16 millones de tokens para validación. No se menciona el uso de técnicas de alineación como RLHF o DPO; es un modelo base puro. La conversión a ONNX con cuantización Q4F16 se realizó para permitir la ejecución en navegador mediante WebGPU, reduciendo el tamaño del modelo a aproximadamente 0,2 GB.

## Capacidades

- Generación de texto en japonés: completado de frases, párrafos o documentos completos.
- Modelo base: no está entrenado para seguir instrucciones ni responder preguntas de forma directa; su uso principal es la continuación de texto.
- Inferencia en navegador: gracias al formato ONNX y la integración con Transformers.js, puede ejecutarse en clientes web con WebGPU sin servidor.
- Soporte de contexto de hasta 4.096 tokens, suficiente para párrafos largos o conversaciones de varias turnos.
- Tokenización eficiente para japonés mediante SentencePiece Unigram.
- No incluye capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Autocompletado de texto en editores web: un editor de código o de texto en japonés puede integrar el modelo para sugerir continuaciones de frases o párrafos, aprovechando su bajo peso y ejecución local con WebGPU.
- Generación de borradores de documentos: herramientas de redacción asistida pueden usarlo para crear borradores iniciales de correos, informes o artículos en japonés, que luego el usuario revisa y edita.
- Asistencia en escritura creativa: aplicaciones de narrativa o poesía pueden emplear el modelo para generar ideas o continuar historias, dado su entrenamiento en corpus educativo japonés.
- Preprocesamiento de texto: puede utilizarse para normalizar o completar fragmentos de texto en pipelines de NLP, aunque su función principal es generativa.
- Chatbots simples de demostración: aunque no es un modelo instructivo, se puede usar con plantillas de prompt para crear asistentes básicos que completen respuestas a partir de un contexto dado.
- Aplicaciones educativas: herramientas de aprendizaje de japonés que necesiten generar ejemplos de frases o ejercicios de completado pueden beneficiarse de su tamaño reducido y su capacidad de ejecución en dispositivos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 299M parámetros cuantizado a 4 bits, el tamaño en memoria es de aproximadamente 150 MB para los pesos, más las activaciones FP16. Se estima que la VRAM necesaria para inferencia ronda los 300-400 MB, aunque no se dispone de datos oficiales.
- GPU recomendadas: cualquier GPU compatible con WebGPU, incluidas las integradas modernas (Intel Iris Xe, AMD Radeon integrada) y dedicadas de gama baja (NVIDIA GTX 1650, RTX 3050). No requiere GPU de alta gama.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo actual, incluso en iGPU con al menos 512 MB de VRAM.
- Opciones de despliegue: el formato ONNX permite su uso con Transformers.js en el navegador (WebGPU), así como con ONNX Runtime en servidores o aplicaciones de escritorio. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, aunque al ser ONNX podría adaptarse con herramientas que soporten este formato.
- Latencia y throughput: no se proporcionan datos. En un navegador con WebGPU, la generación de 96 tokens (como en el ejemplo) debería completarse en unos pocos segundos, pero depende del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros modelos japoneses de tamaño similar con formato ONNX en los resultados de búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo base: no está entrenado para seguir instrucciones ni para responder preguntas de forma fiable. Su uso en tareas de QA o diálogo requiere un afinamiento adicional.
- Riesgo de alucinación: al ser un modelo pequeño y base, puede generar contenido factualmente incorrecto o incoherente, especialmente en temas especializados.
- Sesgos: el entrenamiento se realizó sobre un corpus educativo japonés, lo que puede introducir sesgos culturales o temáticos propios de ese tipo de contenido.
- Limitaciones de idioma: solo soporta japonés; no es adecuado para otros idiomas.
- Licencia: no se especifica, por lo que se desconoce si permite uso comercial o restricciones de redistribución. Se recomienda contactar con el autor antes de usarlo en producción.
- Contexto limitado: 4.096 tokens puede ser insuficiente para documentos muy largos o conversaciones extensas.
- Rendimiento en navegador: la ejecución con WebGPU depende de la compatibilidad del navegador y del hardware; en dispositivos sin WebGPU no funcionará.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hmwri/japanese-300m-base-onnx)
- [Repositorio de modelos ONNX (GitHub)](https://github.com/onnx/models)
- [Modelos compatibles con ONNX en Hugging Face](https://huggingface.co/models?library=onnx)
- [Modelos ONNX en ONNX Runtime](https://onnxruntime.ai/models)
