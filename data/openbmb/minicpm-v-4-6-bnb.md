# openbmb/MiniCPM-V-4.6-BNB

## Resumen

MiniCPM-V 4.6 es un modelo multimodal ligero desarrollado por el laboratorio OpenBMB (Tsinghua NLP y ModelBest), diseñado para ejecutarse en dispositivos de borde como telefonos moviles. Esta variante concreta, MiniCPM-V-4.6-BNB, es la version cuantizada en 4 bits (NF4) mediante bitsandbytes del modelo original, lo que reduce el peso a 1,1 GB y lo hace especialmente adecuado para despliegue en hardware con recursos limitados.

El modelo combina un encoder de vision SigLIP2-400M con un LLM Qwen3.5-0.8B, sumando 1.300 millones de parametros totales. Soporta entrada de imagen, video y texto, con salida de texto. Su principal innovacion es la compresion mixta de tokens visuales (4x/16x), que permite intercambiar precision por velocidad segun la tarea. Segun los datos publicados, supera en rendimiento a modelos mas grandes como Gemma4-E2B-it y ofrece un throughput ~1,5 veces superior al de Qwen3.5-0.8B.

Esta version cuantizada mantiene las capacidades del modelo base y es compatible con los principales frameworks de inferencia (vLLM, SGLang, llama.cpp, Ollama) y de fine-tuning (SWIFT, LLaMA-Factory). Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opcion atractiva para aplicaciones de produccion en entornos con limitaciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision) + Qwen3.5-0.8B (lenguaje) |
| Parametros totales | 1.300.428.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes), GGUF, AWQ, GPTQ (variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 combina un encoder de vision SigLIP2-400M con un LLM Qwen3.5-0.8B como backbone de lenguaje. El modelo incorpora tecnicas de LLaVA-UHD v4 para reducir los FLOPs de codificacion visual en mas del 50%, mejorando la eficiencia computacional. Una caracteristica destacada es la compresion mixta de tokens visuales con tasas de 4x y 16x, que permite ajustar el equilibrio entre precision y velocidad segun los requisitos de la tarea.

No se han publicado detalles especificos sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas de RLHF o DPO. La informacion disponible indica que el modelo hereda las capacidades de comprension de imagen unica, imagen multiple y video de la familia MiniCPM-V, con mejoras significativas en eficiencia computacional. El modelo base es openbmb/MiniCPM-V-4.6, y esta variante BNB es una cuantizacion post-entrenamiento en formato NF4 de 4 bits.

## Capacidades

- Comprension de imagen unica, imagen multiple y video con salida de texto.
- Compresion de tokens visuales con tasas mixtas de 4x y 16x, configurable segun necesidades de precision o velocidad.
- Eficiencia optimizada para despliegue en dispositivos de borde (iOS, Android y HarmonyOS) con codigo de adaptacion open source.
- Compatible con frameworks de inferencia: vLLM, SGLang, llama.cpp y Ollama.
- Compatible con ecosistemas de fine-tuning: SWIFT y LLaMA-Factory.
- Soporte de conversacion multimodal multi-turno.
- Capacidades de razonamiento visual que superan a Qwen3.5-0.8B en la mayoria de tareas de comprension vision-lenguaje.
- Rendimiento comparable a modelos de 2B (como Qwen3.5 2B) en benchmarks como OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench.

## Casos de uso

- Asistente visual en movil: el modelo puede desplegarse en iOS, Android y HarmonyOS para proporcionar descripcion de imagenes, reconocimiento de objetos o lectura de documentos en tiempo real, aprovechando su tamano reducido y su baja latencia en dispositivos de consumo.
- Analisis de documentos y facturas: su capacidad OCR y de comprension de imagen permite extraer informacion estructurada de recibos, facturas o formularios escaneados directamente en el dispositivo, sin necesidad de conexion a servidores externos.
- Moderacion de contenido visual: puede clasificar imagenes o videos en tiempo real para detectar contenido inapropiado o sensible, integrandose en pipelines de moderacion con recursos limitados.
- Accesibilidad para personas con discapacidad visual: su despliegue en movil permite crear aplicaciones que describan el entorno, lean texto de carteles o identifiquen objetos, funcionando de forma autonoma sin depender de la nube.
- Educacion interactiva: el modelo puede responder preguntas sobre diagramas, graficos o ilustraciones en aplicaciones educativas, con un coste de inferencia lo suficientemente bajo para ejecutarse en tablets o portatiles modestos.
- Automatizacion de soporte tecnico con capturas: puede analizar capturas de pantalla o fotos de errores enviadas por usuarios y generar respuestas de diagnostico, combinando vision y lenguaje en un unico modelo desplegado en el servidor con vLLM.
- Etiquetado y organizacion de bibliotecas multimedia: clasificacion automatica de fotos y videos en categorias, con ejecucion local en NAS o dispositivos de borde para preservar la privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo obtiene una puntuacion de 13 en el Artificial Analysis Intelligence Index, superando a Qwen3.5-0.8B (puntuacion 10) con 19 veces menos coste de tokens, y a Qwen3.5-0.8B-Thinking (puntuacion 11) con 43 veces menos coste. Tambien supera a Ministral 3 3B (puntuacion 11). Sin embargo, no se proporcionan tablas detalladas con metricas concretas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB con cuantizacion NF4 de 4 bits, dado el tamano del repo de 1,1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1660, RTX 3060, RTX 4060) es suficiente para inferencia local.
- Cabe en GPU consumer de gama baja y media, asi como en dispositivos moviles con aceleracion NPU o GPU integrada.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, transformers con bitsandbytes.
- El modelo puede ejecutarse en CPU para tareas de baja latencia, aunque con menor throughput que en GPU.
- No se han publicado datos de latencia o throughput especificos para esta variante cuantizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM-V 4.6 (BNB) | 1,3B | no disponible | Apache 2.0 | HuggingFace, Ollama |
| Qwen3.5-0.8B | 0,8B | no disponible | no disponible | HuggingFace |
| Ministral 3 3B | 3B | no disponible | no disponible | HuggingFace |
| Gemma4-E2B-it | 2B | no disponible | no disponible | HuggingFace |

Segun los datos publicados, MiniCPM-V 4.6 supera a Qwen3.5-0.8B en rendimiento general con 19 veces menos coste de tokens, y supera a Gemma4-E2B-it en rendimiento a pesar de tener menos parametros. Tambien supera a Ministral 3 3B en el indice Artificial Analysis Intelligence Index. Sin embargo, no se dispone de comparativas detalladas con numeros concretos de benchmarks.

## Limitaciones y advertencias

- Al ser una cuantizacion NF4 de 4 bits, puede haber una ligera perdida de precision respecto al modelo original en BF16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- No se han publicado datos sobre sesgos o alucinaciones especificos de este modelo.
- La longitud de contexto no esta documentada, lo que puede limitar su uso en tareas que requieran ventanas de contexto muy largas.
- Los idiomas soportados no estan especificados, aunque al estar basado en Qwen3.5 es probable que tenga buen soporte multilingue, pero esto no esta confirmado.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar los terminos de los modelos base (SigLIP2 y Qwen3.5) por si hubiera condiciones adicionales.
- Para produccion, es recomendable validar el rendimiento en el hardware objetivo, ya que las capacidades de despliegue en movil dependen de la plataforma concreta.
- El modelo puede requerir versiones recientes de transformers (>=5.7.0) y dependencias adicionales como torchcodec para decodificacion de video, lo que puede generar problemas de compatibilidad con ciertas versiones de CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.6-BNB
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-o
- Pagina en Ollama: https://ollama.com/openbmb/minicpm-v4.6
- Recetas vLLM: https://recipes.vllm.ai/openbmb/MiniCPM-V-4.6
- Articulo de Artificial Analysis: https://artificialanalysis.ai/articles/openbmb-launches-minicpm-v-4-6-1-3b-instruct
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en HuggingFace: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-BNB-Demo
