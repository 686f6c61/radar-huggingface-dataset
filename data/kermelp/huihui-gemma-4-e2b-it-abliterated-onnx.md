# kermelp/Huihui-gemma-4-E2B-it-abliterated-ONNX

## Resumen

El modelo `kermelp/Huihui-gemma-4-E2B-it-abliterated-ONNX` es una exportación al formato ONNX del modelo `huihui-ai/Huihui-gemma-4-E2B-it-abliterated`, una versión "abliterated" (sin mecanismos de rechazo) del modelo instructivo `google/gemma-4-E2B-it` de Google. El objetivo principal es permitir la ejecución del modelo en el navegador mediante Transformers.js y WebGPU, con pesos cuantizados a 4 bits (q4f16) para reducir el consumo de memoria y hacer viable la inferencia local en dispositivos con recursos limitados.

El modelo original, Gemma 4 E2B, es un modelo multimodal de 2 mil millones de parámetros diseñado para razonamiento, codificación, agentes y comprensión de imágenes. La versión abliterada elimina los mecanismos de rechazo que el modelo base aplica ante determinadas solicitudes, lo que hace que responda a prompts que el modelo original rechazaría. La versión ONNX aquí presentada está pensada para ser usada en aplicaciones de navegador (WebGPU), con un demo en vivo proporcionado por el autor.

La relevancia de este modelo reside en su capacidad de ejecutar un modelo multimodal sin restricciones de contenido en el navegador, lo que facilita la experimentación y la investigación en entornos de bajo coste de hardware. No obstante, el propio autor advierte de que se trata de una versión para investigación y evaluación, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) - no disponible |
| Parametros totales | 2B (según la denominación E2B del modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (4 bits pesos + fp16 activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado desde safetensors bf16) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 de Google, con arquitectura transformer que procesa tanto imágenes como texto. El modelo original ha sido entrenado con datos de imagen y texto, y está optimizado para tareas de razonamiento, generación de código y comprensión multimodal. El proceso de abliteración aplicado por `huihui-ai` consiste en modificar los pesos del modelo para eliminar los mecanismos de rechazo (refusal) que se activan ante ciertos prompts, lo que da lugar a un comportamiento más "abierto" y sin restricciones de contenido.

La versión ONNX se obtuvo mediante `optimum-cli export onnx` a partir de los pesos bf16 originales, y posteriormente se cuantizó a 4 bits con el `MatMulNBitsQuantizer` de ONNX Runtime. Este proceso no añade entrenamiento adicional; solo transforma el formato para su uso en entornos de inferencia eficiente. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo puede generar respuestas a instrucciones complejas, incluyendo tareas de razonamiento lógico y matemático, gracias a las capacidades del modelo Gemma 4.
- Comprensión multimodal: acepta imágenes y texto como entrada, pudiendo describir imágenes, responder preguntas visuales, o combinar información de ambos modalidades.
- Respuesta sin restricciones: al ser abliterado, el modelo no aplica mecanismos de rechazo, por lo que responde a prompts que el modelo original rechazaría. Esto incluye temas sensibles, pero también puede ser útil para investigación sobre límites de seguridad.
- Ejecución en navegador: gracias a la exportación ONNX y a Transformers.js, el modelo puede ejecutarse directamente en el navegador mediante WebGPU, sin necesidad de servidor.
- Soporte de chat y plantillas de conversación: el modelo utiliza `apply_chat_template` para formatear mensajes, con soporte para `enable_thinking` (modo de pensamiento) que puede activarse o desactivarse.
- Compatibilidad con librerías ONNX: puede usarse con ONNX Runtime en entornos Node.js o Python, no solo en navegador.

## Casos de uso

- **Investigación sobre seguridad y alucinación**: el modelo es útil para estudiar el comportamiento de modelos sin mecanismos de rechazo, analizando cómo responden a prompts sensibles y qué tipo de contenido generan. Permite evaluar riesgos y desarrollar técnicas de mitigación.
- **Aplicaciones de chat sin restricciones**: para entornos de desarrollo donde se necesita un asistente que no filtre contenido (p. ej., simulaciones de personajes, juegos de rol), puede integrarse en una aplicación web mediante Transformers.js.
- **Análisis de imágenes en el navegador**: al ser multimodal, permite subir una imagen y obtener descripciones o respuestas a preguntas sobre ella sin enviar datos a servidores externos, útil en aplicaciones de privacidad.
- **Generación de código y razonamiento**: el modelo base de Gemma 4 está optimizado para tareas de programación y lógica; puede usarse en entornos de desarrollo para autocompletar o generar snippets, aunque su tamaño pequeño limita la complejidad.
- **Experimentación con WebGPU**: sirve como ejemplo de implementación de modelos cuantizados en navegador, para desarrolladores que quieran aprender a desplegar modelos locales con Transformers.js.
- **Evaluación de la técnica de abliteración**: permite comparar el comportamiento del modelo con la versión original, para medir el impacto de la abliteración en la calidad de las respuestas y en la seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una exportación ONNX de una variante abliterada, y no se incluyen métricas de MMLU, HumanEval, GSM8K ni otros tests. Se desconoce el rendimiento comparativo respecto a otros modelos de tamaño similar.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 2B cuantizado a 4 bits, el peso en memoria es de aproximadamente 1 GB (2B parámetros * 0.5 bytes por parámetro en 4 bits). En ejecución con WebGPU, la memoria requerida puede variar según la activación, pero debería caber en GPUs con 2-4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU compatible con WebGPU (por ejemplo, NVIDIA GTX 10xx o superior, AMD RX 6000, integradas de Intel). También puede ejecutarse en CPU mediante ONNX Runtime, aunque más lento.
- **En consumer**: sí, es adecuado para tarjetas como RTX 3060, RTX 4060 o incluso iGPU de portátiles modernos, gracias a la cuantización.
- **Opciones de despliegue**: el modelo está diseñado para usarse con Transformers.js en navegador (WebGPU). También puede usarse con ONNX Runtime en Node.js o Python para inferencia en servidor. No se menciona soporte para vLLM o TGI, pero al ser ONNX puede integrarse con ONNX Runtime.
- **Latencia y throughput**: no se han publicado datos. En un navegador con WebGPU, la velocidad depende del hardware; para un modelo de 2B cuantizado, se puede esperar una generación de varios tokens por segundo en una GPU de gama media, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-gemma-4-E2B-it-abliterated-ONNX | 2B | no disp. | imagen+texto | Apache 2.0 | ONNX |
| google/gemma-4-E2B-it | 2B | no disp. | imagen+texto | Apache 2.0 | safetensors |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | texto | Apache 2.0 | safetensors |
| Llama-3.2-1B-Instruct | 1B | 128K | texto | Llama 3.2 Community | safetensors |

La comparativa se basa en características generales; no hay datos de rendimiento comparativo. El modelo Gemma 4 original destaca por su multimodalidad y su capacidad de razonamiento, mientras que las alternativas son solo texto. La versión abliterada es única en su tipo, ya que no tiene mecanismos de rechazo, lo que la diferencia de los otros modelos.

## Limitaciones y advertencias

- **Eliminación de mecanismos de rechazo**: el modelo ha sido modificado para eliminar la capacidad de rechazar solicitudes, lo que puede generar contenido inapropiado, sesgado o dañino. El autor advierte explícitamente que es solo para investigación y evaluación, no para uso en producción.
- **Sesgos y alucinaciones**: al ser una versión abliterada, el modelo puede presentar sesgos no mitigados y una mayor tendencia a inventar información, especialmente en temas controvertidos.
- **Limitaciones de contexto**: no se ha especificado la longitud de contexto, por lo que no se conoce el límite de tokens de entrada. Se recomienda prudencia con prompts largos.
- **Idiomas**: no se ha informado sobre los idiomas soportados; el modelo base de Gemma 4 es multilingüe, pero no se confirma en esta exportación.
- **Rendimiento en navegador**: la ejecución con WebGPU puede tener problemas de compatibilidad en algunos navegadores o dispositivos, y la velocidad de generación puede ser limitada en hardware modesto.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el contenido generado puede infringir políticas de plataforma o leyes locales si se usa indebidamente. La responsabilidad del uso recae en el desarrollador.

## Enlaces

- [Modelo en Hugging Face (kermelp/Huihui-gemma-4-E2B-it-abliterated-ONNX)](https://huggingface.co/kermelp/Huihui-gemma-4-E2B-it-abliterated-ONNX)
- [Modelo base original (huihui-ai/Huihui-gemma-4-E2B-it-abliterated)](https://huggingface.co/huihui-ai/Huihui-gemma-4-E2B-it-abliterated)
- [Colección Gemma 4 abliterated de huihui-ai](https://huggingface.co/collections/huihui-ai/gemma-4-abliterated)
- [Espacio de demostración en vivo](https://huggingface.co/spaces/kermelp/Huihui-gemma4-abliterated-webgpu)
- [Página oficial de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Modelo en Ollama (huihui_ai/gemma-4-abliterated)](https://ollama.com/huihui_ai/gemma-4-abliterated)
