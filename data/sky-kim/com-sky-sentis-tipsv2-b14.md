# Sky-Kim/com.sky.sentis.tipsv2-b14

## Resumen
El modelo `Sky-Kim/com.sky.sentis.tipsv2-b14` es una conversión a Unity Inference Engine (Sentis) del modelo contrastivo imagen-texto Google TIPSv2-B/14, desarrollado originalmente por Google DeepMind. La conversión la firma el usuario Sky-Kim y su propósito es permitir búsqueda y clasificación zero-shot de imágenes en tiempo de ejecución dentro de aplicaciones Unity, sin depender de servicios en la nube. Empaqueta dos grafos Sentis (torre de visión y torre de texto) en pesos FP16, un tokenizador SentencePiece BPE convertido a `tokenizer.json` y una clase C# autocontenida (`TipsV2B14`) para inferencia on-device.

La arquitectura subyacente es un transformer contrastivo de tipo CLIP: la torre de visión procesa recortes de imagen de 224x224 píxeles RGB en rango [0,1] y produce un embedding de 768 dimensiones a partir del token CLS; la torre de texto procesa hasta 64 tokens y devuelve un embedding de 768 dimensiones mediante masked mean pooling. Ambos espacios están alineados, de modo que la similitud coseno entre un texto en inglés y un recorte de imagen permite clasificar o buscar regiones visuales sin entrenamiento específico.

La relevancia actual radica en que lleva un modelo de visión-lenguaje de última generación al entorno Unity con backend GPUCompute, con latencias medidas de ~19,5 ms para visión y ~12,1 ms para texto en un Apple M5 Max, y con paridad numérica prácticamente exacta frente a PyTorch (coseno mínimo 1.000000). Esto lo hace útil para aplicaciones de realidad aumentada, videojuegos, vigilancia o análisis de vídeo en dispositivo, donde la privacidad y la latencia importan más que la escala del modelo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer contrastivo imagen-texto (tipo CLIP), dos torres, basado en google/tipsv2-b14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Texto: hasta 64 tokens. Visión: 1 imagen 224x224 (entrada fija) |
| Tipos de cuantizacion | FP16 (pesos cuantizados con `ModelQuantizer.QuantizeWeights(Float16)`); los grafos también se validan en FP32 |
| Idiomas soportados | Inglés (tokenizador WebLI SentencePiece BPE de 32k, entrenado principalmente en inglés); no se declaran otros idiomas oficialmente |
| Licencia | Apache-2.0 |
| Formato de pesos | `.sentis` (Unity Sentis), dos ficheros: `tipsv2_b14_vision_fp16.sentis` y `tipsv2_b14_text_fp16.sentis`; tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento
El modelo original `google/tipsv2-b14` es un transformer contrastivo de dos torres, presentado en el trabajo TIPSv2 (CVPR'26) del equipo de Google DeepMind. La torre de visión es un ViT-B/14 con resolución nativa de 448x448 en el checkpoint original; la conversión aquí incluida fija la entrada a 224x224 porque, según el autor, el rendimiento en recortes pequeños (por ejemplo, personas en un fotograma de CCTV) es equivalente y el coste computacional se reduce aproximadamente 4,5x (de 1025 tokens a un número mucho menor). La torre de texto es un transformer que procesa hasta 64 tokens y aplica masked mean pooling sobre los estados finales. Ambas torres proyectan a un espacio compartido de 768 dimensiones, con una temperatura aprendida de 0,00507 (escala de logits ~197).

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, si hubo RLHF o DPO) no están disponibles en la información proporcionada. La model card de esta conversión se centra en el proceso de exportación: se envolvió el modelo en PyTorch y se exportó con `torch.onnx.export` (opset 17, `dynamo=False`), con el redimensionado de position embeddings horneado para 224x224 (el checkpoint nativo es 448). El grafo de texto reimplementa el forward de referencia sin máscara de padding, aceptando un número dinámico de tokens. Los pesos se importaron en Sentis 2.6.1 y se cuantizaron a FP16. El tokenizador SentencePiece original (`model_type: BPE`, `nmt_nfkc`, byte fallback) se convirtió a `tokenizer.json` con merges ordenados por score de pieza, normalizador NFKC precompilado, strip, colapso de espacios y Metaspace; se verificó que los IDs de token coinciden con SentencePiece en 310 cadenas de prueba en Python (incluyendo emoji, coreano, ancho completo y tabuladores) y en 15 cadenas a través de `TipsV2B14.Tokenize` en Unity.

## Capacidades
- Extracción de características imagen-texto: genera embeddings L2-normalizados de 768 dimensiones para recortes de imagen y para texto en inglés, alineados en un espacio común.
- Clasificación zero-shot de imágenes: permite etiquetar recortes de imagen comparando su embedding con embeddings de textos candidatos (por ejemplo, "a person wearing a red jacket", "a white car").
- Búsqueda zero-shot por texto: dada una consulta textual, puede ordenar regiones de imagen por similitud coseno.
- Procesamiento de recortes (crops) arbitrarios: la API `EmbedCropsAsync` acepta cajas en píxeles de origen con origen arriba-izquierda y aplica letterboxing a 224x224 sobre gris medio (0.5).
- Procesamiento de texto en inglés: tokenización SentencePiece BPE sin BOS/EOS, truncado a 64 tokens, con soporte de emoji, coreano, ancho completo y tabuladores verificado en el tokenizador.
- Inferencia on-device en Unity: backend GPUCompute con fallback a CPU si no hay compute shaders; la clase `TipsV2B14` gestiona carga, warmup, tokenización, embedding de texto y embedding de crops de forma asíncrona.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, visión generativa, audio ni modo thinking. Es exclusivamente un modelo de representación y clasificación.

## Casos de uso
- Búsqueda visual en aplicaciones de realidad aumentada: el modelo permite que una app Unity localice objetos o personas en el campo de visión a partir de una consulta textual en inglés, usando los embeddings de 768 dimensiones y la similitud coseno, sin enviar imágenes a un servidor.
- Análisis de vídeo de vigilancia (CCTV): dado que el autor optimizó la resolución a 224x224 precisamente porque los recortes de personas en fotogramas de CCTV son pequeños, el modelo puede clasificar regiones de interés (persona con chaqueta roja, persona en el suelo, coche blanco) en tiempo real sobre GPUCompute.
- Clasificación automática de activos en videojuegos o pipelines de contenido: integrar el modelo en un editor o runtime Unity para etiquetar sprites, texturas o capturas de pantalla según descripciones textuales, facilitando la organización de bibliotecas de assets.
- Moderación de contenido visual asistida: comparar recortes de imagen contra un conjunto de descripciones textuales de categorías prohibidas para marcar contenido potencialmente problemático, siempre como primera fase de filtrado y con revisión humana.
- Accesibilidad y descripción de escenas: en una aplicación Unity de asistencia, el modelo puede identificar si en la escena hay "una persona sentada", "una silla vacía" o "una puerta abierta" a partir de recortes, generando pistas textuales para usuarios con discapacidad visual.
- Automatización de etiquetado en herramientas de anotación: preetiquetar regiones de imagen con descripciones zero-shot para acelerar el trabajo de anotadores humanos en proyectos de visión por computador.
- Integración en robots o drones con Unity como capa de simulación: usar el modelo para que un agente simulado reconozca objetos descritos por texto y tome decisiones en el bucle de simulación, con latencias de ~19,5 ms por crop en GPU.

## Benchmarks y rendimiento
La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es generativo. Sí incluye pruebas de paridad numérica y de sanidad zero-shot. Se reproducen a continuación los datos disponibles.

Paridad entre PyTorch de referencia, ONNX Runtime y Sentis (5 crops + 5 frases, mismos bytes de entrada, Apple M5 Max, Unity 6000.3.23f1):

| Torre | Pesos | Backend | Cos. mín. vs ORT | Abs. máx. vs ORT | Cos. mín. vs PyTorch | ms en caliente (bloqueante) |
|---|---|---|---|---|---|---|
| Visión | FP32 | CPU | 1.000000 | 8,23e-6 | 1.000000 | 198,8 |
| Visión | FP32 | GPUCompute | 1.000000 | 9,06e-6 | 1.000000 | 18,6 |
| Visión | FP16 | CPU | 1.000000 | 7,69e-4 | 1.000000 | 214,4 |
| Visión | FP16 | GPUCompute | 1.000000 | 7,69e-4 | 1.000000 | 19,5 |
| Texto | FP32 | CPU | 1.000000 | 1,91e-6 | 1.000000 | 13,3 |
| Texto | FP32 | GPUCompute | 1.000000 | 1,91e-6 | 1.000000 | 9,8 |
| Texto | FP16 | CPU | 1.000000 | 5,00e-4 | 1.000000 | 36,9 |
| Texto | FP16 | GPUCompute | 1.000000 | 5,00e-4 | 1.000000 | 12,1 |

Otras comprobaciones reportadas:
- `EmbedText` (FP16) vs PyTorch: coseno mínimo 1.000000 en ambos backends.
- `EmbedCropsAsync` vs un letterbox de PIL de las mismas cajas ensanchadas: coseno mínimo 0,9855 en proyecto Gamma y 0,9844 en proyecto Linear (atribuido a diferencias de remuestreo GPU vs PIL, no al modelo).
- Prueba de sanidad zero-shot: en un conjunto de 12 prompts sobre crops, 224 acierta 12/12 frente a 11/12 de 448, justificando la elección de resolución.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita. El repositorio pesa 0,4 GB, lo que da una cota superior aproximada del conjunto de pesos FP16; el consumo en runtime depende del backend y del tamaño de los tensores intermedios.
- GPU recomendadas: cualquier GPU compatible con Unity GPUCompute. Las pruebas se hicieron en Apple M5 Max. No se especifican modelos concretos de NVIDIA o AMD.
- Compatibilidad con GPU de consumo: sí, por el tamaño del repositorio (0,4 GB) y por el uso de FP16, es plausible que quepa en GPUs de consumo con varios GB de VRAM, aunque no se aportan cifras exactas.
- Opciones de despliegue: Unity Inference Engine (Sentis) 2.6.1 o superior, con backend GPUCompute o CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato `.sentis`.
- Latencia y throughput: en Apple M5 Max con FP16 y GPUCompute, ~19,5 ms por crop de visión y ~12,1 ms por embedding de texto en caliente. En CPU, ~214,4 ms y ~36,9 ms respectivamente. `EmbedCropsAsync` programa un crop por fotograma y usa `AsyncGPUReadback` para leer resultados.

## Comparativa con modelos similares
No se proporcionan en la información disponible comparativas directas con otros modelos de la misma categoría (por ejemplo, CLIP ViT-B/32, SigLIP, OpenCLIP) en cuanto a parámetros, contexto o rendimiento. La comparación más cercana es con el propio modelo base `google/tipsv2-b14` a 448x448, que según el autor rinde peor (11/12 frente a 12/12) en la prueba de 12 prompts sobre crops pequeños, y cuesta aproximadamente 4,5x más en visión.

| Modelo | Resolución visión | Contexto texto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Sky-Kim/com.sky.sentis.tipsv2-b14 | 224x224 | 64 tokens | Apache-2.0 | `.sentis` (FP16) | Hugging Face |
| google/tipsv2-b14 | 448x448 (nativa) | no disponible | Apache-2.0 | safetensors (transformers) | Hugging Face |
| Otros CLIP/SigLIP comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo exclusivamente de representación: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos. Cualquier uso generativo queda fuera de su alcance.
- Idiomas: el tokenizador y el entrenamiento están orientados al inglés. La model card no declara soporte multilingüe, aunque el tokenizador maneja emoji, coreano y ancho completo a nivel de tokens; el alineamiento semántico en otros idiomas no está verificado.
- Resolución fija de 224x224: la conversión descarta la resolución nativa de 448 del checkpoint original. Aunque el autor justifica la decisión con una prueba de 12 prompts, puede haber dominios donde 448 sea mejor.
- Sesgos: no se documentan sesgos específicos en la información proporcionada, pero al derivar de un modelo entrenado con datos web a gran escala (WebLI), es esperable que herede sesgos de género, raza, cultura y representación geográfica.
- Alucinación: en clasificación zero-shot, el riesgo se manifiesta como asignación de etiquetas plausibles pero incorrectas cuando los crops son ambiguos o de baja calidad; la similitud coseno no calibra incertidumbre de forma fiable.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base `google/tipsv2-b14` también es Apache-2.0 según la información disponible; conviene verificar los términos del repositorio original de Google DeepMind antes de un despliegue comercial.
- Dependencia de Unity: el formato `.sentis` y la clase C# solo funcionan dentro del ecosistema Unity Inference Engine; no es portable directamente a PyTorch, ONNX Runtime ni otros runtimes sin reconversión.
- Preprocesado específico: el letterboxing a gris medio 0.5 y la ausencia de normalización mean/std son requisitos del modelo; usar otro preprocesado degradará los embeddings.
- Temperatura aprendida de 0,00507: si se quieren probabilidades softmax sobre etiquetas, hay que aplicarla explícitamente; de lo contrario, las similitudes coseno no son probabilidades.
- Repositorio con pocas descargas (14) y 0 likes en el momento de la consulta: no hay evidencia de adopción amplia ni de validación por terceros fuera del propio autor.

## Enlaces
- Hugging Face del modelo: https://huggingface.co/Sky-Kim/com.sky.sentis.tipsv2-b14
- Modelo base: https://huggingface.co/google/tipsv2-b14
- Repositorio de Google DeepMind con TIPSv2 (CVPR'26) y TIPS (ICLR'25): https://github.com/google-deepmind/tips
- Repositorio relacionado del mismo autor (Matcha v2 para Sentis): https://huggingface.co/Sky-Kim/com.sky.sentis.matcha.v2/tree/main
- Paper referenciado en las tags: arxiv:2604.12012 (no verificado en la búsqueda web)
