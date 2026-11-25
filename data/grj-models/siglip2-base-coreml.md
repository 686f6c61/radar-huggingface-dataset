# grj-models/siglip2-base-coreml

## Resumen

SigLIP 2 B/16-256 para Core ML es una conversión del modelo de visión-lenguaje SigLIP 2 de Google (variante base con parches de 16x16 y resolución de 256x256) al formato Core ML, realizada por el usuario grj-models bajo el paraguas del proyecto OrcaFind. El modelo original es un codificador dual imagen-texto que genera embeddings alineados de 768 dimensiones, pensado para tareas de recuperación y clasificación zero-shot, y esta conversión lo hace ejecutable de forma nativa en el ecosistema Apple (macOS, iOS, iPadOS) sin necesidad de un runtime de PyTorch.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto de despliegue. Su interés reside en que permite llevar SigLIP 2 a aplicaciones on-device en hardware Apple con pesos cuantizados a 8 bits, lo que reduce el peso del repositorio a 0,4 GB y facilita la inferencia local. La model card reporta una paridad razonable con el modelo PyTorch original (coseno de 0,993 en imagen y 0,997 en texto), aunque dicha paridad no está verificada de forma independiente.

El repositorio no incluye pipeline declarado, no tiene descargas ni likes, y fue creado en noviembre de 2026. La información disponible se limita a la model card del autor y a los metadatos de Hugging Face; no hay benchmarks, demos ni documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (codificador de imagen ViT + codificador de texto), base de SigLIP 2 |
| Parametros totales | no disponible (el modelo base SigLIP 2 base es de escala ~100M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | texto limitado a 64 tokens (int32[1,64]) |
| Tipos de cuantizacion | pesos linealmente cuantizados a 8 bits |
| Idiomas soportados | no disponible (el tokenizador usa tokens tipo Gemma, pero no se especifica cobertura linguistica) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (repo de 0,4 GB; incluye `siglip2-vocab.json` y `siglip2-merges.txt`) |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP 2 base patch16-256 de Google, un codificador dual de imagen y texto basado en transformer. El codificador de imagen procesa entradas de 256x256 RGB (la imagen completa se escala a un cuadrado) mediante parches de 16x16, y el codificador de texto procesa secuencias de hasta 64 tokens. Ambos codificadores producen embeddings de 768 dimensiones que se normalizan L2 para permitir similitud coseno. Esta conversión concreta no modifica la arquitectura ni el entrenamiento: solo cambia el formato a Core ML y aplica cuantización lineal de pesos a 8 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original usó RLHF o DPO; la model card de esta conversión no lo detalla y remite al modelo base. La innovación técnica de esta ficha es puramente de despliegue: la conversión a Core ML con cuantización a 8 bits y la inclusión del vocabulario y merges del tokenizador para que la tokenización pueda replicarse fuera de Python. La model card declara una paridad con PyTorch de coseno 0,993 para imagen y 0,997 para texto, sin más metodología.

## Capacidades

- Generación de embeddings de imagen de 768 dimensiones, normalizados L2.
- Generación de embeddings de texto de 768 dimensiones, normalizados L2, con entrada de hasta 64 tokens.
- Recuperación imagen-texto y texto-imagen mediante similitud coseno.
- Clasificación zero-shot de imágenes usando prompts de texto.
- Ejecución on-device en el ecosistema Apple a través de Core ML.
- Tokenización de texto incluida mediante `siglip2-vocab.json` y `siglip2-merges.txt` (tokens tipo Gemma, `<eos>`=1, padding con 0).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representación, no generativo.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá del par imagen-texto.

## Casos de uso

- Búsqueda visual on-device en apps de fotos: indexar las imágenes del carrete con embeddings de 768 dimensiones generados localmente en el dispositivo y permitir búsquedas por descripción textual sin enviar datos a la nube, gracias a la ejecución nativa en Core ML.
- Clasificación zero-shot de imágenes en apps de iOS: definir categorías mediante prompts de texto y asignar la etiqueta con mayor similitud coseno, útil para organizar capturas o documentos escaneados sin entrenar un clasificador específico.
- Moderación de contenido visual en el borde: comparar imágenes entrantes contra un conjunto de prompts de texto que describan contenido no deseado y filtrar localmente antes de subir el contenido a un servidor.
- Filtrado y deduplicación de datasets de imágenes: calcular embeddings de un corpus de imágenes y agrupar por similitud para eliminar duplicados o seleccionar subconjuntos representativos antes del entrenamiento de otros modelos.
- Recomendación de productos por imagen: en una app de catálogo, generar el embedding de la foto que hace el usuario y recuperar los productos cuyo embedding de texto o imagen sea más cercano, con latencia baja al ejecutarse en el dispositivo.
- Accesibilidad: describir o etiquetar imágenes para usuarios con discapacidad visual mediante la comparación del embedding de la imagen con un vocabulario controlado de descripciones, ejecutándose localmente para preservar la privacidad.
- Análisis de capturas de pantalla o documentos: clasificar capturas por temática (facturas, tickets, conversaciones) usando similitud con prompts textuales, sin necesidad de OCR ni de conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es la paridad con el modelo PyTorch: coseno 0,993 para el codificador de imagen y 0,997 para el de texto. No hay datos de latencia, throughput ni precisión en tareas downstream (ImageNet zero-shot, COCO retrieval, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 0,4 GB con pesos a 8 bits, por lo que la huella en memoria es del orden de cientos de MB, pero no se confirma.
- GPU recomendadas: al ser Core ML, el destino son los chips Apple (series M1/M2/M3/M4 y A-series en iPhone/iPad) con Neural Engine o GPU integrada; no está pensado para GPU NVIDIA.
- Cabe en hardware de consumo: sí, en equipos Apple con Neural Engine o GPU integrada; no aplica a GPU de consumo tipo RTX.
- Opciones de despliegue: Core ML (coremltools, Xcode, Vision framework); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grj-models/siglip2-base-coreml | no disponible (base SigLIP 2) | 64 tokens | Core ML, 8 bits | Apache 2.0 | Hugging Face, 0 descargas |
| google/siglip2-base-patch16-256 | no disponible (base SigLIP 2) | no disponible | PyTorch/safetensors | Apache 2.0 | Hugging Face (modelo base) |
| CLIP ViT-B/32 (referencia de la categoria) | ~150M | 77 tokens | PyTorch, ONNX, Core ML en conversiones de terceros | MIT (segun variante) | Amplia |

La comparación con CLIP es orientativa de categoria (codificador dual imagen-texto de escala base); no se dispone de datos de rendimiento comparativo en la información proporcionada. Frente al modelo base de Google, esta conversión añade cuantización a 8 bits y formato Core ML, a costa de una paridad no perfecta (coseno 0,993/0,997) y de la pérdida de flexibilidad del ecosistema PyTorch.

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo entrenado: cualquier limitación del SigLIP 2 base original se hereda.
- La cuantización a 8 bits introduce una degradación medible (coseno 0,993 en imagen y 0,997 en texto frente a PyTorch); para tareas sensibles a la precisión conviene validar contra el modelo original.
- El texto de entrada está limitado a 64 tokens, lo que restringe prompts largos y descripciones detalladas.
- No se especifican los idiomas soportados; el tokenizador tipo Gemma sugiere cobertura multilingüe, pero no está confirmado en la información disponible.
- Riesgo de sesgos y alucinaciones: al ser un modelo de representación, el riesgo se manifiesta como falsos positivos en recuperación y clasificación, no como texto inventado; no hay evaluación de sesgos en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Google y citar adecuadamente.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni demos: la madurez y el mantenimiento no están contrastados.
- La fecha de creación (noviembre de 2026) y la ausencia de documentación adicional hacen recomendable una validación propia antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/grj-models/siglip2-base-coreml
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-256
