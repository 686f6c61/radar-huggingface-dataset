# issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer

## Resumen

Qwen3.5-4B-Kazakh-OptimizedTokenizer es un modelo de chat multimodal (texto e imagen) especializado en kazajo, ruso e inglés, desarrollado por ISSAI (Institute of Smart Systems and Artificial Intelligence). Se construye sobre la arquitectura Qwen3.5-4B mediante una técnica de *chat vector*: en lugar de un fine-tuning supervisado, transfiere las capacidades conversacionales del modelo de chat original de Qwen al modelo base kazajo de ISSAI mediante aritmética de pesos (`model = I + (C − B)`), y le vuelve a acoplar el codificador visual de Qwen3.5-4B.

La innovación principal de esta versión es un tokenizador nuevo aprendido sobre kazajo y ruso, que reduce el número de tokens necesarios para texto kazajo en un factor de 1,98× y para ruso en 1,10×, manteniendo el inglés idéntico al de Qwen3.5. Además, se fijan siete filas de embeddings de tokens especiales (incluidos `<|vision_start|>` y `<|vision_end|>`, nuevos en esta versión) para garantizar paradas fiables del razonamiento y un mejor encuadre de imágenes.

El modelo tiene 4.579.897.856 parámetros totales (4,25 B en el modelo de lenguaje), precisión bfloat16, licencia Apache 2.0 y está pensado como *drop-in replacement* de Qwen/Qwen3.5-4B: misma arquitectura, misma plantilla de chat y mismo uso. Es relevante para desarrolladores que necesiten un modelo compacto con buen rendimiento en kazajo y ruso sin renunciar a capacidades de visión y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5: transformer híbrido de 32 capas (24 capas de atención lineal Gated DeltaNet + 8 capas de atención completa) + codificador visual de Qwen3.5 |
| Parametros totales | 4.579.897.856 (~4,6 B; modelo de lenguaje 4,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la evaluación usa hasta 81.920 tokens de generación) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | kazajo (kk), ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-4B: un modelo de lenguaje híbrido de 32 capas que combina 24 capas de atención lineal Gated DeltaNet con 8 capas de atención completa, más el codificador visual de Qwen3.5-4B acoplado sin cambios. El vocabulario es de 264.077 tokens: los 248.077 de Qwen3.5 más 16.000 tokens nuevos de kazajo y ruso. La precisión de los pesos es bfloat16.

No hay entrenamiento en esta etapa: los pesos se obtienen mediante suma, resta y copia. Primero se aplica un *chat vector* sobre cada peso del modelo de lenguaje: `model = I + (C − B)`, donde B es Qwen3.5-4B-Base, I es Qwen3.5-4B (el modelo de chat de Qwen) y C es el modelo base kazajo de ISSAI (Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer). El término `C − B` captura lo que el preentrenamiento continuado aportó (conocimiento de kazajo y ruso y los tokens nuevos), y las 16.000 filas de tokens nuevos se copian directamente de C. Después se fijan siete filas de embeddings de tokens especiales a los valores exactos de Qwen3.5-4B: `<|endoftext|>`, `<|im_start|>`, `<|im_end|>`, `<think>`, `</think>` (para paradas fiables: 96 % de respuestas terminan correctamente con fijación frente a 72 % sin ella, sobre 80 prompts de prueba) y `<|vision_start|>`, `<|vision_end|>` (para encuadre de imagen: OCRBench en kazajo sube de 26,5 a 32,0). Por último se acopla el codificador visual de Qwen3.5-4B. El preentrenamiento continuado del modelo base C se realizó con una mezcla kazajo/ruso/inglés de 40/20/40.

## Capacidades

- Generación de texto conversacional multi-turno en kazajo, ruso e inglés.
- Modo de razonamiento explícito con etiquetas `<think> … </think>`.
- Entrada de imágenes (pipeline image-text-to-text) mediante el codificador visual de Qwen3.5.
- Lectura de texto en imágenes (OCR), con mejoras específicas en kazajo gracias a los tokens `<|vision_start|>` y `<|vision_end|>`.
- Razonamiento y matemáticas (evaluado en el conjunto de benchmarks Qolda de ISSAI).
- Tokenización eficiente de kazajo (1,98× menos tokens que Qwen3.5) y ruso (1,10× menos), lo que reduce pasos de generación y permite incluir más texto en el contexto.
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en kazajo y ruso: el modelo gestiona conversaciones multi-turno con paradas de turno fiables (96 % de respuestas terminan correctamente gracias a la fijación de tokens especiales), lo que reduce respuestas truncadas en producción.
- Generación de contenido en kazajo: gracias a la tokenización 1,98× más eficiente, una respuesta kazaja requiere aproximadamente la mitad de pasos de generación que con Qwen3.5, lo que abarata la inferencia en aplicaciones de redacción y resumen.
- Procesamiento de documentos escaneados en kazajo y ruso: el modelo acepta imágenes y su OCR en kazajo alcanza 32,0 en OCRBench (frente a 26,5 sin los tokens de visión fijados), adecuado para digitalización de formularios y archivos.
- Asistentes con razonamiento visible: el modo `<think>` permite auditar la cadena de razonamiento en aplicaciones educativas o de soporte técnico donde se requiere trazabilidad.
- Sustitución directa de Qwen3.5-4B en infraestructura existente: al compartir arquitectura, plantilla de chat y uso, se puede desplegar como *drop-in* en pipelines ya construidos sobre Qwen3.5-4B sin cambios de código.
- Traducción y adaptación kazajo-ruso-inglés: el preentrenamiento continuado con mezcla 40/20/40 y el tokenizador multilingüe lo hacen adecuado para tareas de traducción y localización entre los tres idiomas.
- Análisis de imágenes con texto en entornos multilingües de Asia Central: combinación de visión y conocimiento de kazajo y ruso para clasificación y extracción de información de capturas y fotos.

## Benchmarks y rendimiento

Los benchmarks kazajos provienen del conjunto Qolda de ISSAI; la evaluación se realizó con el arnés de ISSAI sobre vLLM, con thinking activado, conjuntos de prueba completos, temperatura 1,0, top-p 0,95, top-k 20, penalización de presencia 1,5 y hasta 81.920 tokens.

| Metrica | Qwen3.5-4B | issai/Qwen3.5-4B-Kazakh | Este modelo |
|---|---|---|---|
| Media texto kazajo (9 benchmarks) | 80,19 | 80,94 | **82,08** |
| Media texto inglés (6 benchmarks) | **92,38** | 91,47 | 91,72 |
| Tokens por palabra, kazajo | 3,48 | 1,83 (1,90× menos) | **1,76 (1,98× menos)** |
| Tokens por palabra, ruso | 1,89 | 2,23 (1,18× más) | **1,72 (1,10× menos)** |
| Tokens por palabra, inglés | 1,25 | 1,25 | 1,25 |
| OCRBench (kazajo) | no disponible | no disponible | 32,0 (26,5 sin tokens de visión fijados) |

El modelo obtiene la mejor media de texto kazajo de los tres (mejor o empatado en 8 de 9 benchmarks), se mantiene a 0,7 puntos de Qwen3.5 en inglés y la visión está a la par de Qwen3.5. No se han publicado resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,2 GB solo para pesos (tamaño del repo), más memoria para KV cache y activaciones; en la práctica se recomienda un mínimo de 12-16 GB de VRAM en bf16.
- Cuantización: no se documentan tipos de cuantización en la información disponible; al ser un modelo transformers con safetensors, sería convertible a GGUF/AWQ/GPTQ con herramientas externas, pero no está verificado por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño (4,6 B), es plausible en GPUs de consumo con suficiente VRAM, pero el autor no publica requisitos oficiales.
- Opciones de despliegue: la evaluación oficial se realizó con vLLM; al ser compatible con transformers y con endpoints, es desplegable en TGI y otros servidores compatibles. Soporte de llama.cpp/Ollama: no disponible.
- Latencia y throughput: no disponible. Indirectamente, la tokenización 1,98× más eficiente en kazajo reduce aproximadamente a la mitad los pasos de generación de una respuesta kazaja frente a Qwen3.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media kazajo (9 bench.) | Media inglés (6 bench.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Qwen3.5-4B-Kazakh-OptimizedTokenizer** | ~4,6 B | no disponible | **82,08** | 91,72 | Apache 2.0 | Hugging Face (issai) |
| Qwen3.5-4B | ~4,6 B | no disponible | 80,19 | **92,38** | no disponible en la información | Hugging Face (Qwen) |
| issai/Qwen3.5-4B-Kazakh | ~4,6 B | no disponible | 80,94 | 91,47 | no disponible en la información | Hugging Face (issai) |

Frente a Qwen3.5-4B, este modelo gana 1,89 puntos en la media kazaja y pierde 0,66 puntos en inglés, con un tokenizador sustancialmente más eficiente para kazajo y ruso. Frente a la versión anterior de ISSAI, mejora en kazajo (+1,14), en inglés (+0,25) y corrige el retroceso del tokenizador en ruso (de 2,23 a 1,72 tokens por palabra).

## Limitaciones y advertencias

- El preentrenamiento continuado del modelo base fue solo de texto; el codificador visual se acopla sin adaptación, por lo que la visión está "a la par" de Qwen3.5 pero no mejorada específicamente para kazajo salvo por los tokens de encuadre.
- La fijación de tokens especiales es una corrección empírica: sin ella, solo el 72 % de las respuestas terminaban correctamente en las pruebas del autor (80 prompts), lo que indica sensibilidad del modelo a la configuración de parada.
- El modelo cubre solo kazajo, ruso e inglés; no hay soporte declarado para otros idiomas.
- El método de *chat vector* no incluye RLHF ni DPO en esta etapa, por lo que la alineación y el rechazo de contenido dañino dependen de los del modelo Qwen3.5-4B original.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a modelos de 4,6 B sin fine-tuning de alineación específico.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B del que derivan los pesos.
- El contexto máximo no está documentado; la evaluación usa hasta 81.920 tokens de generación, pero no se confirma la ventana de contexto oficial.
- Solo 251 descargas y 1 like en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer
- Modelo base kazajo: https://huggingface.co/issai/Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer
- Versión anterior: https://huggingface.co/issai/Qwen3.5-4B-Kazakh
- Modelo base kazajo anterior: https://huggingface.co/issai/Qwen3.5-4B-Base-Kazakh
- Modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Colección de benchmarks Qolda de ISSAI: https://huggingface.co/collections/issai/qolda-language-benchmarks
