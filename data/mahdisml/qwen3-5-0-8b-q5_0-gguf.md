# mahdisml/Qwen3.5-0.8B-Q5_0-GGUF

## Resumen

El modelo `mahdisml/Qwen3.5-0.8B-Q5_0-GGUF` es una conversión a formato GGUF del modelo base `Qwen/Qwen3.5-0.8B`, el miembro más pequeño de la familia Qwen3.5 desarrollada por Alibaba. Esta conversión, realizada mediante la herramienta GGUF-my-repo de llama.cpp, permite ejecutar el modelo en entornos con recursos limitados, como CPU, portátiles o dispositivos edge, utilizando librerías como llama.cpp, llama-cpp-python u Ollama.

El modelo base Qwen3.5-0.8B presenta una arquitectura híbrida de "gated delta networks" (GDD) y un contexto de 262.144 tokens, según la documentación de vLLM. Es un modelo multimodal (image-text-to-text) que integra visión y lenguaje en un solo marco, con capacidades de razonamiento, generación de código y soporte para agentes. Su tamaño reducido (772 millones de parámetros) lo hace especialmente adecuado como modelo de borrador para decodificación especulativa con modelos Qwen3.5 más grandes, o para aplicaciones en dispositivos con poca memoria.

La cuantización Q5_0 reduce el peso del modelo a aproximadamente 0,6 GB, manteniendo un equilibrio entre calidad y eficiencia. Aunque no se han publicado benchmarks específicos para esta conversión, el modelo hereda las capacidades del Qwen3.5-0.8B original, que está diseñado para tareas de razonamiento, visión y codificación en entornos de bajos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida gated delta networks (GDD) |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (según vLLM Recipes) |
| Tipos de cuantizacion | Q5_0 (5 bits) |
| Idiomas soportados | No disponible (no se especifica en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `qwen3.5-0.8b-q5_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B pertenece a la familia Qwen3.5, que introduce una arquitectura híbrida basada en "gated delta networks" (GDD), una variante de las redes neuronales recurrentes con mecanismos de atención lineal que mejora la eficiencia computacional y el manejo de contextos largos. Según la documentación disponible en el repositorio de GitHub de Qwen3.5, la familia se entrenó mediante fusión temprana de visión y lenguaje sobre billones de tokens multimodales, logrando un rendimiento comparable o superior a los modelos Qwen3-VL en tareas de razonamiento, codificación y comprensión visual.

No se dispone de detalles específicos sobre el número exacto de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO para el modelo de 0.8B. La información pública se limita a la arquitectura y al contexto. La conversión a GGUF no modifica los pesos del modelo, solo el formato de almacenamiento y la cuantización.

## Capacidades

- Generación de texto y razonamiento multimodal: al ser un modelo image-text-to-text, puede procesar imágenes y texto combinados para responder preguntas, describir contenido visual o razonar sobre escenas.
- Razonamiento y codificación: según la familia Qwen3.5, el modelo está diseñado para tareas de razonamiento lógico, matemáticas y generación de código, aunque su tamaño reducido limita la complejidad de las tareas.
- Soporte de agentes y tool calling: la familia Qwen3.5 incluye capacidades de uso de herramientas y ejecución de agentes; se espera que el modelo de 0.8B las herede, aunque no se confirma explícitamente en la ficha.
- Contexto largo: con 262K tokens de ventana, puede manejar documentos extensos o conversaciones multi-turno con mucho historial.
- Multilingüismo: no se especifican los idiomas soportados, pero los modelos Qwen suelen cubrir múltiples idiomas, incluido el chino y el inglés.
- Eficiencia para edge: su tamaño compacto permite ejecución en CPU, portátiles y dispositivos con poca memoria.

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede analizar fotografías y responder preguntas sobre su contenido (objetos, texto, escenas) directamente en el dispositivo, sin conexión a la nube, gracias a su tamaño reducido.
- Chatbot de atención al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones extensas con historial completo, útil para soporte técnico o asistentes virtuales en entornos con recursos limitados.
- Modelo de borrador para decodificación especulativa: en servidores con modelos Qwen3.5 más grandes (por ejemplo, 7B o 14B), este modelo de 0.8B puede usarse como borrador para acelerar la generación, reduciendo la latencia en producción.
- Extracción de información de documentos escaneados: al procesar imágenes y texto, puede extraer datos de facturas, formularios o capturas de pantalla en aplicaciones de automatización de oficina.
- Generación de código en entornos de desarrollo ligero: integrado en editores o CLI, puede sugerir fragmentos de código o completar funciones en lenguajes populares, funcionando en portátiles sin GPU dedicada.
- Prototipado rápido de aplicaciones multimodales: para desarrolladores que necesitan validar ideas de visión por computadora o chat multimodal sin invertir en infraestructura, este modelo ofrece una opción económica y fácil de desplegar con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una conversión GGUF del Qwen3.5-0.8B, pero no hay datos oficiales de MMLU, HumanEval, GSM8K u otras pruebas para esta versión cuantizada. Se recomienda consultar la model card del modelo base `Qwen/Qwen3.5-0.8B` para obtener métricas de referencia, aunque no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q5_0 ocupa aproximadamente 0,6 GB, por lo que la inferencia puede ejecutarse en GPU con al menos 1 GB de VRAM, o incluso en CPU con 4 GB de RAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060, RTX 3060, RTX 4090) o GPUs integradas de Apple Silicon (M1/M2/M3) funcionan sin problema. También puede ejecutarse en CPU pura.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU consumer actual.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-cpp-python, Ollama (si se importa el GGUF), vLLM (si se convierte a otro formato) y TGI.
- Latencia y throughput: no se dispone de mediciones concretas. En una CPU moderna, se esperan velocidades de decodificación de entre 10 y 30 tokens por segundo; en una GPU como RTX 3060, puede superar los 100 tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3.5-0.8B podría compararse con Qwen2.5-VL-0.5B, SmolVLM-256M o PaliGemma-3B, pero no hay datos de benchmarks disponibles en la información proporcionada. Se recomienda consultar las model cards de esos modelos para obtener métricas comparables.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño, es más propenso a generar respuestas inexactas o inventar información, especialmente en tareas complejas de razonamiento o conocimiento factual.
- Limitaciones de idioma: no se especifican los idiomas soportados; es posible que el rendimiento varíe significativamente entre lenguas, con mejor cobertura en inglés y chino.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.5-0.8B no tenga restricciones adicionales (por ejemplo, términos de uso de Alibaba).
- Rendimiento multimodal limitado: aunque es image-text-to-text, su tamaño reducido puede afectar la precisión en tareas de visión complejas, como detección de objetos detallada o comprensión de escenas densas.
- Cuantización Q5_0: esta cuantización puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en FP16, aunque para muchos casos de uso es imperceptible.
- Contexto de 262K: aunque la ventana es larga, el modelo pequeño puede tener dificultades para utilizar eficazmente todo el contexto en tareas que requieren atención a detalles lejanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahdisml/Qwen3.5-0.8B-Q5_0-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Página de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Repositorio GitHub de Qwen3.5: https://github.com/algtrd24/qwen3.5
- Página de Ollama para Qwen3.5: https://ollama.com/library/qwen3.5:0.8b
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
