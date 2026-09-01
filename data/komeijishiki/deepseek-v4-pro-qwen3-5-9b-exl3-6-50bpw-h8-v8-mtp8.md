# komeijishiki/DeepSeek-V4-Pro-Qwen3.5-9B-EXL3-6.50bpw-H8-V8-MTP8

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-EXL3-6.50bpw-H8-V8-MTP8 es una cuantización en formato ExLlamaV3 (EXL3) del modelo DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento basado en Qwen3.5-9B y destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El modelo original, desarrollado por Jackrong, concentra su señal supervisada en resolución de problemas matemáticos y STEM, manteniendo la eficiencia de la clase de 9B de parámetros. Esta versión cuantizada, publicada por komeijishiki, reduce el peso del texto a 6.50 bits por peso (bpw), con la cabeza de salida (lm_head), el módulo de visión y el módulo de predicción multi-token (MTP) en 8 bits, lo que la hace adecuada para despliegue local en tarjetas gráficas de consumo.

El repositorio ocupa 9.6 GB y los pesos en safetensors suman 4.805.692.800 parámetros, cifra que refleja el tamaño tras la cuantización (el modelo base sin cuantizar es de aproximadamente 9B). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Al ser una cuantización EXL3, la inferencia requiere el motor ExLlamaV3, que ofrece una buena relación entre velocidad y calidad para modelos de esta escala. La relevancia actual radica en que combina capacidades de razonamiento matemático avanzado, herencia de la destilación de DeepSeek-V4-Pro, con multimodalidad (visión) y un tamaño que cabe en GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-9B, destilado de DeepSeek-V4-Pro) |
| Parametros totales | 4.805.692.800 (pesos cuantizados; el modelo base Qwen3.5-9B tiene ~9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Texto 6.50 bpw, lm_head 8 bits, vision 8 bits, MTP 8 bits (EXL3) |
| Idiomas soportados | no disponible (documentacion en chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros. Sobre él se realizó un fine-tune supervisado (SFT) con aproximadamente 250.000 muestras de un conjunto mixto de matemáticas y STEM, generadas por DeepSeek-V4-Pro en modo Max Effect. DeepSeek-V4-Pro es un modelo MoE de 1,6 billones de parámetros con 49.000 millones activos y contexto nativo de hasta un millón de tokens, del que se destilan las respuestas para transferir capacidades de razonamiento a la escala de 9B. El resultado es un modelo especializado en razonamiento matemático y resolución de problemas científicos, conservando la eficiencia de despliegue de la clase 9B.

La versión cuantizada aplica ExLlamaV3 con 6.50 bpw en los pesos del decoder, 8 bits en la cabeza de salida, 8 bits en el módulo de visión y 8 bits en el módulo MTP (multi-token prediction). El MTP permite predecir varios tokens a la vez, lo que puede acelerar la inferencia. La cuantización reduce el tamaño del modelo a 9.6 GB, facilitando su ejecución en hardware de consumo. No se dispone de información sobre el dataset exacto de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en el fine-tune original.

## Capacidades

- Razonamiento matematico avanzado: especializado en problemas de matematicas y STEM gracias a la destilacion de DeepSeek-V4-Pro en modo Max Effect.
- Resolucion de problemas cientificos: capacidad para abordar tareas de fisica, quimica, ingenieria y otras disciplinas cuantitativas.
- Generacion de texto: mantiene las capacidades generativas generales del modelo base Qwen3.5-9B.
- Multimodalidad (vision): el modelo incluye un modulo de vision cuantizado a 8 bits, lo que permite procesar imagenes junto con texto.
- Prediccion multi-token (MTP): el modulo MTP a 8 bits permite predecir varios tokens simultaneamente, mejorando potencialmente la velocidad de generacion.
- Despliegue local eficiente: la cuantizacion EXL3 a 6.50 bpw reduce el uso de VRAM y permite ejecucion en GPUs de consumo.

## Casos de uso

- Asistente de estudio para matematicas y ciencias: el modelo puede resolver problemas de calculo, algebra, fisica o quimica paso a paso, sirviendo como tutor personal para estudiantes de secundaria y universidad. Su especializacion en STEM lo hace adecuado para explicar razonamientos complejos.
- Generacion de problemas y examenes: un profesor puede usarlo para crear enunciados de problemas con soluciones detalladas, aprovechando su capacidad de razonamiento matematico para generar variantes de dificultad controlada.
- Analisis de documentos cientificos con imagenes: gracias al modulo de vision, puede procesar graficas, diagramas o figuras de articulos cientificos y extraer informacion relevante, combinando comprension visual y textual.
- Prototipado de agentes de razonamiento: al ser un modelo de 9B cuantizado, puede integrarse en pipelines de agentes que requieran multiples pasos de razonamiento sin necesidad de GPUs de gran tamano, ideal para entornos de desarrollo con hardware limitado.
- Chatbot tecnico de soporte en entornos educativos: puede responder consultas sobre conceptos cientificos y matematicos en aplicaciones de e-learning, manteniendo conversaciones multi-turno con contexto razonable.
- Investigacion reproducible en entornos locales: investigadores que necesiten un modelo de razonamiento matematico sin depender de APIs externas pueden desplegarlo localmente con ExLlamaV3, garantizando privacidad de los datos y costes predecibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia encontrada es una evaluacion del modelo original (sin cuantizar) en GSM8K realizada por FriendliAI, pero no se proporcionan los valores numericos. Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9.6 GB, por lo que se estima un uso de VRAM de aproximadamente 10-12 GB durante la inferencia, dependiendo de la longitud de contexto y el batch size.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM, como RTX 3060 12GB, RTX 4070, RTX 4080, o GPUs de datacenter como A10 o L4. Con cuantizacion adicional o menor contexto podria ejecutarse en 8 GB, aunque con limitaciones.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media-alta de consumo (12 GB o mas). En GPUs de 8 GB (como RTX 4060) podria funcionar con contextos cortos y batch reducido.
- Opciones de despliegue: al ser formato EXL3, requiere ExLlamaV3 para la inferencia. No es compatible directamente con vLLM, llama.cpp u Ollama sin conversion previa a otros formatos.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de ~5B cuantizado a 6.5 bpw en una RTX 4070 suele generar entre 30 y 60 tokens por segundo, pero estos valores son estimaciones y no estan confirmados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| komeijishiki/DeepSeek-V4-Pro-Qwen3.5-9B-EXL3 (este) | ~4.8B cuantizado (base 9B) | no disponible | Apache 2.0 | EXL3 safetensors | Cuantizado, multimodal, MTP |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9B | no disponible | Apache 2.0 | no especificado | Modelo original sin cuantizar |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | ~4B | no disponible | Apache 2.0 | no especificado | Version mas pequena del mismo fine-tune |
| Qwen3-8B (referencia) | 8B | 32K (tipico) | Apache 2.0 | variado | Modelo base generico sin especializacion STEM |

La comparativa se limita a parametros, licencia y formato, ya que no hay datos de rendimiento publicados. La principal diferencia frente al modelo original es la cuantizacion, que reduce el tamano a 9.6 GB y permite despliegue en hardware de consumo, a costa de una posible perdida minima de calidad. La version 4B es una alternativa mas ligera para entornos con menos VRAM.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion sobre sesgos especificos del modelo. Al ser un fine-tune de Qwen3.5-9B, puede heredar sesgos del modelo base y del dataset de destilacion, centrado en matematicas y STEM.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios fuera de su especializacion. En matematicas, los errores de calculo son posibles y deben verificarse.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Se recomienda asumir un contexto moderado (probablemente 32K o similar al de Qwen3.5-9B) y no usarlo para documentos muy largos sin validacion.
- Limitaciones de idioma: no se ha especificado los idiomas soportados. La documentacion esta en chino e ingles, lo que sugiere un buen soporte para ambos, pero no se confirma el rendimiento en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se debe mantener el aviso de copyright y las patentes asociadas. No hay restricciones de uso militar o de alto riesgo especificadas.
- Caveats de cuantizacion: la cuantizacion a 6.50 bpw puede degradar ligeramente la precision en tareas de razonamiento complejo. El modulo MTP a 8 bits puede no estar soportado por todas las versiones de ExLlamaV3, por lo que se recomienda verificar la compatibilidad.
- Estado del repositorio: el modelo tiene 0 descargas y 0 likes, lo que indica que es una publicacion reciente sin validacion comunitaria. Se recomienda probar exhaustivamente antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/komeijishiki/DeepSeek-V4-Pro-Qwen3.5-9B-EXL3-6.50bpw-H8-V8-MTP8
- Modelo original sin cuantizar (Jackrong): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B del mismo fine-tune: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Modelo base Qwen3.5-9B (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B
- Pagina oficial de DeepSeek: https://deepseek.com/en/index.html
- Pagina de DeepSeek-V4-Pro en QwenCloud: https://www.qwencloud.com/models/deepseek-v4-pro
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
