# Sky-Kim/com.sky.sentis.siglip2-base16

## Resumen

`com.sky.sentis.siglip2-base16` es una conversión del modelo multimodal SigLIP 2 Base/16 (224x224) de Google al formato de Unity Inference Engine (Sentis) 2.6.1, publicada por el usuario Sky-Kim. No se trata de un modelo nuevo: es un port optimizado para inferencia on-device dentro del motor Unity, con pesos en Float16 y un wrapper en C# que gestiona preprocesado, tokenización y cálculo de similitudes. El modelo original combina una torre de visión (ViT con parches de 16x16) y una torre de texto que proyectan imágenes y frases a un espacio común de 768 dimensiones, permitiendo clasificación de imágenes zero-shot y recuperación imagen-texto.

La relevancia de esta ficha está en su carácter práctico: permite ejecutar búsqueda semántica visual dentro de aplicaciones Unity sin conexión a internet, algo útil en videojuegos, herramientas de edición o aplicaciones de realidad aumentada. El paquete incluye los grafos de visión (185 MB) y texto (172 MB), la tabla de embeddings de tokens (393 MB) y el tokenizador Gemma sin modificar, además de una clase `Siglip2Base16` autocontenida.

La licencia Apache 2.0 del modelo base se mantiene, y el autor documenta métricas de paridad frente a PyTorch y ONNX Runtime con cosenos superiores a 0.9999, lo que respalda la fidelidad de la conversión. El contexto de texto está limitado a 64 tokens y el modelo no soporta generación de texto ni razonamiento: es exclusivamente un encoder dual para similitud imagen-texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dual encoder (ViT para visión + transformer para texto), basado en SigLIP 2 |
| Parámetros totales | No disponible (torre de texto: 282M, de los cuales 197M son la tabla de embeddings) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto; imagen de entrada 224x224 |
| Tipos de cuantización | Float16 (pesos enviados); el runtime Sentis convierte a fp32 en ejecución |
| Idiomas soportados | No disponible (tokenizador Gemma con vocabulario de 256k, fallback de bytes) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Sentis) + `.bin` para la tabla de embeddings + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo replica la arquitectura SigLIP 2 Base/16: un Vision Transformer con parches de 16x16 sobre entradas de 224x224 que produce embeddings de imagen de 768 dimensiones, y una torre de texto basada en transformer que produce embeddings de texto de la misma dimensión. Ambos se normalizan a longitud unitaria y su producto escalar equivale a la similitud coseno. La innovación clave de SigLIP frente a CLIP es el uso de una pérdida sigmoide en lugar de softmax sobre el lote, de modo que cada par imagen-texto recibe un logit independiente `logit_scale.exp() * cos + logit_bias`, con valores aprendidos de 112.6689 y -16.7717 respectivamente. Esto permite usar umbrales absolutos de probabilidad en lugar de comparaciones relativas entre candidatos.

El entrenamiento original proviene de Google (paper arXiv:2502.14786) y no se detalla en la model card. La conversión a Sentis mantiene los pesos en Float16 y separa la tabla de embeddings de tokens (256000 x 768) del grafo de texto para evitar cargar 0.8 GB de pesos mayoritariamente inactivos en la GPU. El wrapper lee únicamente las 64 filas necesarias mediante `FileStream` y las inyecta como tensor `[1, 64, 768]`. El preprocesado de imagen incluye letterboxing con relleno gris (0.5) y normalización `(x - 0.5) / 0.5` integrada en el grafo, por lo que la entrada es RGB en [0, 1]. El texto se pasa a minúsculas, se tokeniza con SentencePiece-BPE de Gemma, se añade `<eos>` (id 1) y se rellena con `<pad>` (id 0) hasta exactamente 64 tokens, ya que la torre de texto no tiene máscara de atención y agrupa la última posición.

## Capacidades

- Clasificación de imágenes zero-shot: asignación de etiquetas textuales a imágenes o regiones (cajas de detección) sin entrenamiento específico.
- Recuperación imagen-texto: búsqueda semántica de imágenes mediante consultas en lenguaje natural y viceversa.
- Embeddings de imagen y texto de 768 dimensiones normalizados a longitud unitaria, aptos para similitud coseno.
- Procesamiento por regiones: `EmbedCropsAsync` acepta cajas delimitadoras y genera un embedding por caja, útil para buscar objetos concretos dentro de una escena.
- Cálculo de probabilidad calibrada mediante `Probability(text, image)`, que aplica la sigmoide del modelo SigLIP y permite umbrales absolutos (0.5 en coseno ≈ 0.149).
- Ejecución on-device sin conexión a internet, con backend GPUCompute o CPU.
- Tokenización expuesta mediante `Tokenize(string)`, que devuelve los 64 ids que ve la torre de texto.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, audio ni visión más allá de la codificación de imágenes.

## Casos de uso

- Búsqueda semántica de assets en editores o videojuegos: indexar imágenes y recuperarlas mediante consultas como "persona con chaqueta roja" usando los embeddings de texto e imagen, sin conexión.
- Filtrado inteligente en capturas o grabaciones: procesar fotogramas y cajas de detección para localizar objetos o personas que cumplan una descripción, aprovechando `EmbedCropsAsync` con letterboxing por caja.
- Moderación de contenido visual: usar `Probability` con umbral absoluto para decidir si una región contiene, por ejemplo, una persona en el suelo, sin depender de comparaciones relativas entre etiquetas.
- Etiquetado automático de imágenes en pipelines de producción: generar embeddings de imagen y compararlos contra un conjunto fijo de descripciones para asignar categorías.
- Realidad aumentada y aplicaciones móviles: inferencia on-device con backend GPUCompute o CPU, sin latencia de red ni costes de API.
- Herramientas de accesibilidad: describir o clasificar escenas capturadas por la cámara del dispositivo mediante consultas de texto predefinidas.
- Investigación en recuperación multimodal: usar el wrapper como referencia de paridad (coseno > 0.9999 frente a PyTorch y ONNX Runtime) para validar conversiones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de paridad de la conversión medidas en Unity 6000.3, Sentis 2.6.1, Apple M5 Max (editor):

| Comparación | Visión (coseno) | Texto (coseno) |
|---|---|---|
| PyTorch (transformers) vs ONNX Runtime | 1.000000 (máx. abs. 2.5e-5) | 1.000000 (máx. abs. 1.5e-5) |
| Tabla de tokens fp16 vs fp32 (PyTorch) | — | 1.000000 (máx. abs. 1.0e-3) |
| ORT vs Sentis fp32, CPU / GPUCompute | 1.000000 / 1.000000 | 1.000000 / 1.000000 |
| ORT vs Sentis fp16 (enviado), CPU / GPUCompute | 0.999996 / 0.999996 | 1.000000 / 1.000000 |

Tokenizer: 0 ids discrepantes sobre 14 cadenas. No se proporcionan cifras de latencia o throughput absolutos, solo que `LastCropsMs` expone el tiempo de la última llamada a `EmbedCropsAsync`.

## Requisitos de hardware

- VRAM estimada: los pesos enviados suman aproximadamente 750 MB (185 MB visión + 172 MB texto + 393 MB tabla de tokens), aunque la tabla se lee bajo demanda desde disco y no se carga completa en GPU. El grafo de texto en fp32 en ejecución requiere memoria adicional.
- GPU recomendadas: cualquier GPU compatible con compute shaders de Unity; el autor ha medido en Apple M5 Max. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: probable en GPUs de gama media con soporte de compute shaders, dado el tamaño reducido del modelo, aunque no se aportan cifras de VRAM mínima.
- Opciones de despliegue: Unity Inference Engine (Sentis) 2.6.1 mediante paquete UPM, con backend `BackendType.GPUCompute` y fallback a CPU sin compute shaders.
- Latencia y throughput: no disponibles; solo se expone `LastCropsMs` para medir el tiempo de la última tanda de crops.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| com.sky.sentis.siglip2-base16 | No disponible (texto: 282M) | 64 tokens, imagen 224x224 | Apache 2.0 | `.sentis`, Unity Sentis | Port on-device para Unity con wrapper C# |
| google/siglip2-base-patch16-224 | No disponible | 64 tokens, imagen 224x224 | Apache 2.0 | safetensors, PyTorch/transformers | Modelo base original de Google |
| CLIP (ViT-B/16) | ~150M | 77 tokens, imagen 224x224 | MIT (variantes OpenAI) | safetensors, ONNX | Usa softmax sobre el lote; no permite umbral absoluto |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; solo embeddings de similitud imagen-texto.
- Contexto de texto muy corto (64 tokens), lo que limita descripciones largas o consultas complejas.
- El padding a 64 tokens es obligatorio porque la torre de texto no tiene máscara de atención y agrupa la última posición; un uso incorrecto del tokenizador degrada los resultados.
- Los cosenos son pequeños en términos absolutos (una buena coincidencia ronda 0.12-0.18) debido a la gran escala del logit; no deben interpretarse como probabilidades sin aplicar `Probability`.
- No se debe aplicar softmax a los cosenos entre etiquetas candidatas, a diferencia de CLIP.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2, no documentados en la model card.
- Riesgo de alucinación en el sentido de falsos positivos en la clasificación: una región puede puntuar alto para una descripción incorrecta si el umbral no se calibra.
- Idiomas soportados no documentados; el tokenizador Gemma tiene vocabulario multilingüe con fallback de bytes, pero no se garantiza un rendimiento uniforme.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `google/siglip2-base-patch16-224`.
- Dependencia de `com.unity.ai.inference` 2.6.1 y de Unity 6000.3 para las métricas reportadas; versiones anteriores pueden no ser compatibles.
- Solo 14 descargas y 0 likes en el momento de la ficha: ecosistema pequeño y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sky-Kim/com.sky.sentis.siglip2-base16
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Repositorio GitHub del port: https://github.com/skykim/siglip2-unity
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
