# amd/Qwen3.6-27B_gpuep_1.0_gpu_128

## Resumen

Qwen3.6-27B_gpuep_1.0_gpu_128 es una compilación optimizada del modelo multimodal Qwen/Qwen3.6-27B, publicada por AMD para su despliegue sobre hardware AMD Ryzen AI mediante ONNX Runtime GenAI y el backend DirectML. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo original de Qwen (Alibaba) a formato ONNX con cuantización INT4 del decodificador de texto, manteniendo el codificador visual y el modelo de embeddings en FP16. El objetivo es habilitar inferencia local de un modelo visión-lenguaje de 27.000 millones de parámetros en GPUs integradas y NPUs de la plataforma Ryzen AI.

El modelo resuelve el problema de ejecutar un VLM de gran tamaño en hardware de consumo sin necesidad de GPUs discretas de datacenter. Al estar empaquetado con ONNX Runtime GenAI y DirectML, se integra directamente en aplicaciones Windows que usan el stack de AMD para IA local. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque AMD añade una licencia MIT sobre sus modificaciones.

La relevancia actual radica en la creciente demanda de IA generativa en el borde (edge AI) y en equipos portátiles con aceleradores integrados. Este paquete permite a desarrolladores desplegar un VLM de 27B con cuantización INT4 en un formato listo para producción sobre Ryzen AI, algo que hasta hace poco requería infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de texto + codificador visual), empaquetado para ONNX Runtime GenAI |
| Parametros totales | 27.000 millones (heredados del modelo base Qwen3.6-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decodificador de texto: INT4 (RTN, group size 32, activaciones FP16); codificador visual: FP16; embeddings: FP16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (modelo base) + MIT (modificaciones de AMD) |
| Formato de pesos | ONNX (onnxruntime-genai) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer multimodal de tipo visión-lenguaje, con un codificador visual que procesa imágenes y un decodificador de texto autorregresivo que genera la respuesta. La compilación de AMD no modifica la arquitectura, sino que transforma los pesos a ONNX y aplica cuantización INT4 con redondeo al más cercano (RTN) y tamaño de grupo 32 sobre el decodificador, dejando el codificador visual y los embeddings en FP16 para preservar la calidad de la percepción visual. El resultado se ejecuta mediante ONNX Runtime GenAI con el proveedor de ejecución DirectML, que abstrae la aceleración por GPU/NPU en Windows.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original, ya que la model card de esta compilación no los detalla. La innovación técnica principal de esta publicación es el pipeline de conversión y cuantización de AMD (OGA Model Builder) orientado a Ryzen AI, que permite ejecutar un VLM de 27B en hardware integrado con un consumo de memoria reducido gracias a los pesos INT4.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y respuesta a preguntas sobre ellas (image-text-to-text).
- Razonamiento multimodal: descripción de imágenes, extracción de información visual y respuesta contextual.
- Conversación multi-turno.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documenta modo de razonamiento extendido (thinking mode) ni capacidades de audio.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Asistente de accesibilidad en portátiles Ryzen AI: el modelo puede describir imágenes y responder preguntas sobre ellas en tiempo real, aprovechando la NPU/GPU integrada para inferencia local sin conexión a la nube.
- Análisis de documentos escaneados: extracción de información de facturas, formularios o capturas mediante el codificador visual FP16 y generación de resúmenes en texto.
- Moderación de contenido visual en el borde: clasificación y descripción de imágenes subidas por usuarios directamente en el dispositivo, reduciendo la latencia y la exposición de datos.
- Soporte técnico asistido por capturas de pantalla: el usuario comparte una imagen de un error y el modelo interpreta el contexto visual para guiar la resolución.
- Prototipado de aplicaciones VLM en Windows: desarrolladores que usan ONNX Runtime GenAI pueden integrar el modelo en apps .NET o C++ con DirectML sin reescribir el pipeline.
- Investigación en eficiencia de inferencia: útil para medir el rendimiento de un VLM de 27B cuantizado a INT4 sobre hardware integrado AMD, comparando latencia y calidad frente a FP16.
- Automatización de catalogación de imágenes en flujos locales: generación de descripciones y etiquetas para bibliotecas de fotos o inventarios, ejecutándose íntegramente en el equipo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20,5 GB, lo que da una idea del peso en disco; en memoria, el decodificador INT4 reduce sustancialmente el footprint frente a FP16, aunque no se especifica la VRAM exacta necesaria. El codificador visual y los embeddings en FP16 añaden varios GB.
- GPU recomendadas: hardware AMD Ryzen AI (GPUs integradas Radeon y NPUs de la plataforma Ryzen AI), que es el objetivo declarado de la compilación. No se indica compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, está diseñado para GPUs integradas de AMD Ryzen AI, no para GPUs discretas de datacenter.
- Opciones de despliegue: ONNX Runtime GenAI con DirectML; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| amd/Qwen3.6-27B_gpuep_1.0_gpu_128 | 27B | no disponible | Apache 2.0 + MIT | ONNX / ONNX Runtime GenAI (DirectML) |
| Qwen/Qwen3.6-27B (base) | 27B | no disponible | Apache 2.0 | safetensors / transformers |
| Otros VLM de ~27B | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. La diferencia clave frente al modelo base es el formato ONNX cuantizado y la orientación a Ryzen AI.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización INT4 puede incrementar ligeramente la degradación en tareas de razonamiento fino.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar conversaciones largas o documentos extensos.
- Licencia: el modelo base es Apache 2.0 y las modificaciones de AMD son MIT, lo que permite uso comercial, pero conviene revisar los términos del modelo base Qwen3.6-27B por si hubiera condiciones adicionales.
- Hardware: está atado a ONNX Runtime GenAI y DirectML sobre Ryzen AI; no es portable directamente a otros backends sin reconversión.
- Producción: al ser una compilación de terceros (AMD) sobre un modelo de Qwen, la responsabilidad de validación recae en el integrador; no hay benchmarks publicados que respalden la calidad tras la cuantización.
- Sin datos de entrenamiento ni de evaluación: no se puede verificar el impacto de la cuantización en precisión.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Qwen3.6-27B_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- DirectML: https://github.com/microsoft/DirectML
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
