# Carles19/llama3.2_3B_alpaca_test

## Resumen

El modelo `Carles19/llama3.2_3B_alpaca_test` es un fine-tuning del modelo Llama 3.2 3B Instruct, realizado con la librería Unsloth y posteriormente convertido al formato GGUF para su uso con llama.cpp y Ollama. El nombre sugiere que el ajuste se realizó sobre el dataset Alpaca, aunque no se proporcionan detalles sobre el conjunto de datos ni el proceso de entrenamiento. El resultado es un modelo conversacional de 3.212.749.888 parámetros (aproximadamente 3,2 mil millones) empaquetado en un único archivo cuantizado Q4_K_M de 2,0 GB, pensado para ejecución local en entornos con recursos limitados.

La relevancia de este modelo radica en su accesibilidad: al estar en formato GGUF y cuantizado, puede desplegarse fácilmente en CPU o GPU de gama media mediante herramientas como llama.cpp, Ollama o cualquier runtime compatible con GGUF. No obstante, al tratarse de un experimento (el nombre incluye "test") con cero descargas y sin licencia especificada, su uso en producción requiere precaución. La arquitectura subyacente es la de Llama 3.2 3B, un transformer decoder-only, aunque no se confirma la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo: `llama-3.2-3b-instruct.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B Instruct, un transformer autoregresivo con normalización RMS, atención con RoPE y capas de feed-forward con activación SwiGLU. El fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento mediante técnicas como LoRA y kernels de atención eficientes, logrando una velocidad de entrenamiento aproximadamente el doble de rápida que los métodos convencionales. El nombre del repositorio indica que el dataset empleado fue Alpaca, un conjunto de instrucciones generado a partir de GPT-3.5, aunque no se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla el número de épocas ni la configuración de hiperparámetros.

La conversión a GGUF se realizó también con Unsloth, generando un único archivo cuantizado Q4_K_M que reduce el tamaño del modelo a 2,0 GB, adecuado para inferencia en dispositivos con poca memoria. No se incluyen otros formatos como safetensors o versiones sin cuantizar.

## Capacidades

- Generación de texto y conversación: al ser un fine-tuning instruct, responde a instrucciones y mantiene diálogos multi-turno, aunque no se especifica la longitud máxima de contexto.
- Seguimiento de instrucciones: entrenado sobre el dataset Alpaca, está orientado a tareas de instrucción directa (preguntas, resúmenes, redacción, etc.).
- Ejecución local: gracias al formato GGUF y la cuantización Q4_K_M, puede ejecutarse en CPU o GPU con herramientas como llama.cpp, Ollama o cualquier runtime compatible.
- Compatibilidad con Ollama: se incluye un Modelfile para despliegue directo en Ollama.
- No se dispone de información sobre tool calling, function calling, capacidades multimodales, razonamiento multi-paso ni soporte de agentes.

## Casos de uso

- Chatbot local para asistencia personal: al ser un modelo pequeño y cuantizado, puede integrarse en aplicaciones de escritorio o móviles que requieran un asistente conversacional sin conexión a internet. Con llama.cpp o Ollama, se puede servir en local con baja latencia en CPU.
- Generación de respuestas a preguntas frecuentes: el fine-tuning con Alpaca lo hace adecuado para responder consultas directas en dominios específicos, siempre que el conocimiento esté cubierto por el dataset de entrenamiento.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden usarlo como base para probar flujos de generación de texto, clasificación o extracción de información antes de migrar a modelos más grandes.
- Educación y experimentación: sirve como ejemplo de fine-tuning y conversión a GGUF con Unsloth, útil para aprender a crear y desplegar modelos locales.
- Entornos con recursos limitados: en equipos con menos de 4 GB de VRAM o solo CPU, este modelo permite ejecutar un LLM conversacional sin necesidad de infraestructura cloud.
- Integración en pipelines de generación de contenido: puede usarse para redactar borradores de correos, resúmenes o textos cortos, aunque su calidad será inferior a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Tampoco se ofrecen comparativas con el modelo base Llama 3.2 3B Instruct ni con otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa 2,0 GB, por lo que se necesitan aproximadamente 2-3 GB de VRAM para cargar el modelo en GPU (considerando overhead de contexto y buffers). En CPU, se requieren al menos 4 GB de RAM libre.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o equivalentes de AMD. También puede ejecutarse en Apple Silicon (M1/M2) con Metal.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (incluye Modelfile), y cualquier runtime compatible con GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia, un modelo de 3B en Q4_K_M en una GPU moderna (RTX 3060) suele generar entre 20 y 40 tokens por segundo, y en CPU moderna (8 núcleos) entre 5 y 10 tokens por segundo, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carles19/llama3.2_3B_alpaca_test | 3,2B | no disponible | GGUF (Q4_K_M) | no disponible | HuggingFace |
| Llama 3.2 3B Instruct (original) | 3,2B | 128K (según documentación oficial) | safetensors, GGUF | Llama 3.2 Community License | HuggingFace |
| Phi-3-mini (3,8B) | 3,8B | 128K | safetensors, GGUF | MIT | HuggingFace |
| Gemma 2 2B | 2,6B | 8K | safetensors, GGUF | Gemma Terms of Use | HuggingFace |

La comparativa se basa en datos públicos de los modelos base. Para este fine-tuning no se dispone de información sobre contexto, licencia ni rendimiento, por lo que no es posible evaluar su calidad relativa. El modelo original Llama 3.2 3B Instruct tiene una licencia permisiva para uso comercial, pero este repositorio no especifica la suya, lo que genera incertidumbre legal.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica bajo qué licencia se distribuye el modelo. Aunque el modelo base Llama 3.2 tiene su propia licencia, el fine-tuning podría estar sujeto a condiciones adicionales. No se recomienda su uso comercial sin aclarar este punto.
- Sin información sobre sesgos o alucinaciones: al no haber documentación sobre el dataset de entrenamiento ni evaluación de sesgos, no se puede garantizar la imparcialidad ni la fiabilidad de las respuestas.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados. El tamaño reducido (3B) aumenta la probabilidad de errores en tareas complejas.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada. Si se hereda la de Llama 3.2 (128K), el modelo podría manejar conversaciones largas, pero no está confirmado.
- Idiomas: no se indica qué idiomas soporta. Aunque Llama 3.2 es multilingüe, el fine-tuning con Alpaca (dataset mayoritariamente en inglés) podría degradar el rendimiento en otros idiomas.
- Único archivo disponible: solo se ofrece la cuantización Q4_K_M. No hay versiones sin cuantizar ni otras cuantizaciones (Q8, Q2, etc.), lo que limita la flexibilidad de despliegue.
- Proyecto experimental: el nombre "test" y la ausencia de descargas o likes sugieren que es un experimento personal, sin garantías de mantenimiento ni soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Carles19/llama3.2_3B_alpaca_test
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (plataforma de despliegue): https://ollama.com
