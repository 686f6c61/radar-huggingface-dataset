# Rin247/gemma-4-31B-it-Uncensored-Aquarion-INT4

## Resumen

Este modelo es una cuantización INT4 *weight-only* del modelo `gemma-4-31B-it-Uncensored`, que a su vez es una versión "abliterada" (sin mecanismos de rechazo) del modelo Gemma 4 de Google, lanzado en abril de 2026. El autor, Rin247, ha aplicado una técnica de proyección ortogonal para eliminar la dirección de rechazo (refusal) antes de cuantizar los pesos, dando como resultado un modelo que no filtra contenido considerado no seguro o polémico. El archivo safetensors contiene 16.358.001.296 parámetros (dato real del archivo, aunque el nombre sugiere 31B), y el repositorio ocupa 18,3 GB.

La relevancia de este modelo radica en que combina las capacidades de la familia Gemma 4 —contexto de hasta 256K tokens, soporte multimodal (imagen y texto), tool calling nativo y multilingüismo en más de 140 idiomas— con una capa de "desinhibición" que lo hace atractivo para experimentos de generación libre, aunque con importantes riesgos de seguridad. Al ser una cuantización INT4, está pensado para ejecutarse en hardware con VRAM limitada, aunque el formato custom requiere un proceso de dequantización específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4); no se especifica si es densa o MoE |
| Parametros totales | 16.358.001.296 (según safetensors; el modelo base se anuncia como 31B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 256K tokens (según especificaciones de Gemma 4) |
| Tipos de cuantizacion | INT4 (weight-only) |
| Idiomas soportados | Más de 140 (según Gemma 4) |
| Licencia | no disponible (el modelo base Gemma 4 usa Apache 2.0) |
| Formato de pesos | safetensors (INT4 weight-only con buffers de escala y forma) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4, una familia de modelos de Google DeepMind que incluye variantes densas y MoE. El modelo de 31B (nombre original) es presumiblemente denso, aunque no se confirma en la información disponible. La versión "Uncensored" fue creada mediante una técnica de abliteración que elimina la dirección de rechazo del modelo, usando biproyección y EGA (para MoE) según la colección de TrevorJS. El autor de esta cuantización, Rin247, aplicó una proyección ortogonal sobre la dirección de rechazo antes de cuantizar.

La cuantización se realizó con PyTorch RTN (Round-to-Nearest) en CPU, almacenando escalas y formas junto a los pesos. El resultado es un archivo safetensors con pesos INT4 que requieren dequantización con los buffers `*.weight_scale` y `*.weight_shape` antes de ser alimentados a un motor de inferencia. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre procesos de RLHF/DPO, ya que son herencia del modelo base.

## Capacidades

- Generación de texto y razonamiento: al ser una variante de Gemma 4, mantiene las capacidades de razonamiento y generación de texto del modelo original, aunque la cuantización INT4 puede degradar ligeramente la calidad.
- Soporte multimodal: el pipeline es `image-text-to-text`, por lo que puede procesar imágenes y texto (capacidad heredada de Gemma 4).
- Tool calling / function calling: soporte nativo según las especificaciones de Gemma 4.
- Capacidades multilingües: más de 140 idiomas soportados.
- Sin filtros de seguridad: al estar abliterado, no rechaza peticiones de contenido no seguro, violento, ilegal o explícito. Esto es una capacidad (o limitación) clave.
- Contexto largo: hasta 256K tokens, útil para tareas que requieren mantener grandes cantidades de información.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de código, refactorización y depuración, aprovechando su soporte de tool calling para integrarse en IDEs o pipelines de CI/CD. Su contexto de 256K permite manejar repositorios completos.
- Atención al cliente automatizada: con su capacidad multilingüe y de contexto largo, puede gestionar conversaciones multi-turno con historial extenso, aunque al ser uncensored debe desplegarse con capas adicionales de moderación si se usa en producción.
- Análisis de documentos extensos: gracias a su ventana de contexto, puede resumir o extraer información de libros, informes o contratos de gran tamaño.
- Creación de contenido creativo sin restricciones: escritura de ficción, guiones o material que requiera explorar temas tabú o explícitos, donde un modelo con filtros sería limitante.
- Agentes autónomos: su soporte de tool calling y razonamiento multi-paso lo hace adecuado para construir agentes que interactúan con APIs, navegadores o bases de datos, siempre que se controle su salida.
- Investigación en seguridad de IA: al ser un modelo abliterado, es útil para estudiar comportamientos de modelos sin alineación, sesgos y riesgos de generación de contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas para esta cuantización específica. El modelo base Gemma 4 ha sido evaluado por Google, pero no se incluyen cifras en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 18,3 GB, por lo que se necesitan al menos 20 GB de VRAM para cargar el modelo en INT4 (considerando overhead). Una RTX 4090 (24 GB) o una A100 de 40 GB serían adecuadas.
- GPU recomendadas: RTX 3090/4090, A100, H100, o GPUs con 24 GB o más de VRAM.
- En consumer GPU: sí, cabe en RTX 4090 (24 GB) y posiblemente en RTX 3090 (24 GB), pero no en GPUs de 16 GB o menos.
- Opciones de despliegue: al ser un formato custom (INT4 weight-only con buffers de escala), no es directamente compatible con vLLM, llama.cpp u Ollama sin una conversión previa. Se puede cargar con `transformers` si se implementa la dequantización manual, o usar un motor que soporte este formato específico.
- Latencia y throughput: no disponibles. Dependerá del hardware y del motor de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Gemma 4 31B compite con otros modelos de ~30B como Llama 3.1 30B o Qwen 2.5 32B, pero no hay datos de rendimiento de esta cuantización. Se puede señalar que Gemma 4 destaca por su contexto de 256K y su licencia Apache 2.0 (en el modelo base), mientras que esta versión cuantizada tiene una licencia no especificada y un formato de pesos no estándar.

## Limitaciones y advertencias

- Al ser un modelo abliterado, no tiene filtros de seguridad: puede generar contenido violento, explícito, ilegal o dañino sin restricción. No debe usarse en aplicaciones públicas sin moderación adicional.
- La cuantización INT4 puede degradar la calidad de la generación, especialmente en tareas de razonamiento complejo o matemáticas, en comparación con el modelo en precisión completa.
- El formato de pesos es custom: requiere dequantización manual con los buffers de escala y forma, lo que limita la compatibilidad con herramientas estándar como vLLM u Ollama.
- La licencia no está especificada en la model card, lo que genera incertidumbre legal para uso comercial. El modelo base Gemma 4 usa Apache 2.0, pero esta derivada puede tener restricciones adicionales.
- El número de parámetros del archivo safetensors (16,4B) no coincide con el nombre del modelo (31B), lo que sugiere que podría tratarse de un error o de una representación parcial. Esto debe verificarse antes de usarlo en producción.
- No se han publicado benchmarks ni evaluaciones de seguridad para esta versión cuantizada, por lo que su rendimiento real es desconocido.

## Enlaces

- [HuggingFace - Rin247/gemma-4-31B-it-Uncensored-Aquarion-INT4](https://huggingface.co/Rin247/gemma-4-31B-it-Uncensored-Aquarion-INT4)
- [Google Gemma 4 - HuggingFace](https://huggingface.co/google/gemma-4-31B)
- [Colección Gemma 4 Uncensored - TrevorJS](https://huggingface.co/collections/TrevorJS/gemma-4-uncensored)
- [Guía para ejecutar Gemma 4 localmente](https://locallyuncensored.com/blog/gemma-4-local-guide.html)
- [Página de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
