# Sky-Kim/com.sky.sentis.pe-core-s16

## Resumen

`com.sky.sentis.pe-core-s16` es una conversión a Unity Inference Engine (Sentis) del modelo Perception Encoder PE-Core-S16-384 de Meta, un codificador de imágenes y texto de estilo CLIP publicado bajo licencia Apache 2.0. El paquete, mantenido por el usuario Sky-Kim, incluye las dos torres exportadas a formato Sentis con pesos en FP16, el tokenizador BPE de CLIP en JSON y una clase C# autocontenida (`PeCoreS16`) que gestiona la carga, el preprocesado y la inferencia en dispositivo. Su propósito es permitir búsqueda y clasificación de imágenes por descripción textual dentro de aplicaciones Unity, sin depender de servicios en la nube.

El modelo embebe recortes de imagen y texto en inglés en un espacio compartido de 512 dimensiones, con entrada visual fija de 384x384 píxeles y una longitud de contexto textual de solo 32 tokens. Es relevante para desarrolladores de videojuegos, herramientas de edición y aplicaciones de visión por computador que necesitan inferencia local de bajo coste en GPU de consumo, con una paridad numérica verificada frente a PyTorch y ONNX Runtime.

La ficha describe únicamente lo que el autor documenta en la model card y en los metadatos de Hugging Face; no se dispone de información sobre el entrenamiento original de PE-Core-S16-384 más allá de su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres estilo CLIP (torre visual ViT patch 16 y torre de texto con atención causal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens de texto; imagen de entrada fija 384x384 |
| Tipos de cuantizacion | Pesos FP16 (cuantizados con `ModelQuantizer.QuantizeWeights(Float16)`, cómputo en FP32); también se validaron pesos FP32 |
| Idiomas soportados | Inglés (tokenizador CLIP BPE en minúsculas, NFC, espacios colapsados) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Sentis); torre visual 55,0 MB, torre de texto 127,0 MB, tokenizador 2,2 MB |

## Arquitectura y entrenamiento

El paquete deriva de `facebook/PE-Core-S16-384`, cargado con el código de referencia `facebookresearch/perception_models` (clase `core.vision_encoder.pe.CLIP`). Se trata de una arquitectura de dos torres: una torre visual que procesa píxeles RGB en [0,1] con normalización `(x - 0,5) / 0,5` integrada en el grafo, y una torre de texto con atención causal que agrupa la representación en el token de fin (`argmax(ids)`). Ambas torres se exportaron por separado con `torch.onnx.export` (exportador TorchScript, opset 17, formas fijas, batch 1) y se importaron en Sentis 2.6.1.

La conversión aplica una sustitución de la máscara causal `-inf` por `-1e9` antes de la exportación para evitar infinitos en el grafo, y cuantiza los pesos a FP16 manteniendo el cómputo en FP32. No se documentan en la información disponible los datos de entrenamiento originales, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el pipeline de preprocesado en GPU: los recortes se amplían un 15 % por cada lado y un 5 % arriba y abajo, se letterboxean manteniendo la relación de aspecto sobre gris 0,5 y se procesan un recorte por fotograma con `AsyncGPUReadback`.

## Capacidades

- Generación de embeddings visuales y textuales en un espacio compartido de 512 dimensiones, con salidas normalizadas L2 por la clase `PeCoreS16`.
- Clasificación de imágenes zero-shot comparando un recorte contra un conjunto de descripciones fijas.
- Recuperación imagen-texto y texto-imagen (búsqueda de personas, vehículos u objetos por descripción).
- Similitud coseno entre consulta textual y recortes de imagen; el autor recomienda `softmax(100 * cosenos)` para comparar candidatos, ya que los cosenos brutos de coincidencia rondan 0,2 a 0,35.
- Tokenización en C# compatible con el tokenizador `SimpleTokenizer` de PE, verificada con 14 de 14 cadenas, incluyendo puntuación, apóstrofos, acentos, coreano y truncamiento.
- Preprocesado de recortes en GPU con letterboxing, corrección del espacio de color del proyecto y gestión de colas por fotograma.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo thinking: es un codificador, no un modelo generativo.

## Casos de uso

- Búsqueda de personas o vehículos en vídeo por descripción: se embebe la consulta una vez con `EmbedText` y se comparan los recortes de cada fotograma con `EmbedCropsAsync`, usando la similitud coseno para ordenar candidatos. Adecuado por su inferencia local y su coste bajo por fotograma.
- Verificación de recortes contra descripciones fijas: comprobar si un recorte corresponde a "una persona tumbada en el suelo" o a "un vehículo en un carril de giro", útil en sistemas de alerta o etiquetado asistido dentro de una aplicación Unity.
- Moderación de contenido visual en dispositivo: clasificar imágenes de usuario contra un conjunto cerrado de categorías definidas por el desarrollador, sin enviar datos a servidores externos.
- Organización automática de bibliotecas de imágenes: indexar capturas o assets por descripción textual y permitir búsquedas semánticas dentro de la propia aplicación.
- Etiquetado asistido en herramientas de anotación: preasignar etiquetas a recortes para que un humano las revise, reduciendo el tiempo de anotación en pipelines de datos.
- Realidad aumentada y juegos: reconocer objetos o estados descritos por el diseñador ("personaje con chaqueta roja") para disparar eventos o interacciones sin conexión.
- Análisis de tráfico en el borde: detectar peatones, vehículos o situaciones descritas textualmente en secuencias de cámara, con la ventaja de que el modelo cabe en un paquete de 0,2 GB y se ejecuta en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí documenta pruebas de paridad numérica frente a PyTorch y ONNX Runtime 1.23 con 5 recortes letterboxeados de un vídeo de tráfico urbano y 5 frases, mostrando el peor de los 5 casos:

| Torre | Pesos | Backend | cos mín. vs ORT | abs máx. vs ORT | cos mín. vs PyTorch |
|---|---|---|---|---|---|
| visión | fp32 | CPU | 1,000000 | 1,0e-5 | 1,000000 |
| visión | fp32 | GPUCompute | 1,000000 | 9,4e-6 | 1,000000 |
| visión | fp16 (enviado) | CPU | 0,999999 | 2,8e-3 | 0,999999 |
| visión | fp16 (enviado) | GPUCompute | 0,999999 | 2,8e-3 | 0,999999 |
| texto | fp32 | CPU | 1,000000 | 9,5e-6 | 1,000000 |
| texto | fp32 | GPUCompute | 1,000000 | 8,6e-6 | 1,000000 |
| texto | fp16 (enviado) | CPU | 1,000000 | 2,3e-3 | 1,000000 |
| texto | fp16 (enviado) | GPUCompute | 1,000000 | 2,3e-3 | 1,000000 |

Además, `EmbedText` frente a PyTorch alcanza una similitud coseno de 1,000000. No se documentan latencias ni throughput absolutos; solo se expone `LastCropsMs` como tiempo de reloj de la última llamada a `EmbedCropsAsync`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete ocupa 0,2 GB en disco (55 MB torre visual + 127 MB torre de texto + 2,2 MB tokenizador en FP16), por lo que la huella en memoria es moderada.
- GPU recomendadas: no se especifican modelos concretos; el autor usa `BackendType.GPUCompute` con retroceso a CPU cuando no hay compute shaders.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido de las dos torres, aunque no se documentan requisitos mínimos ni modelos verificados.
- Opciones de despliegue: Unity Sentis 2.6.1 (backend GPUCompute o CPU); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; solo se indica que se programa un recorte por fotograma y que `LastCropsMs` mide el tiempo de la última llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| com.sky.sentis.pe-core-s16 | no disponible | 32 tokens de texto; imagen 384x384 | Apache 2.0 | `.sentis` (Unity Sentis) | Hugging Face, 0 descargas |
| facebook/PE-Core-S16-384 | no disponible | no disponible en esta ficha | Apache 2.0 | PyTorch (referencia) | Hugging Face |
| CLIP ViT-B/16 de OpenAI | no disponible en esta ficha | 77 tokens | MIT (según la versión original) | PyTorch, ONNX | Amplia |

La comparación con alternativas concretas no está disponible en la información proporcionada; los datos de los modelos alternativos no se han verificado en esta ficha y se indican solo como referencia de categoría.

## Limitaciones y advertencias

- Solo admite inglés: el tokenizador CLIP BPE está entrenado para texto en inglés y el autor no documenta soporte multilingüe.
- Contexto textual muy corto: 32 tokens equivalen a unas 25 palabras; el texto más largo se trunca y el último token se fija a 49407.
- Sin plantilla de prompt: el llamador debe escribir la frase completa; el autor recomienda el estilo CLIP ("a photo of a person wearing a red jacket") frente a frases telegráficas.
- Umbral absoluto frágil: los cosenos de coincidencia son bajos (0,2 a 0,35), por lo que se recomienda comparar candidatos entre sí o aplicar `softmax(100 * cosenos)` en lugar de un umbral fijo.
- Preprocesado específico: el letterboxing difiere del recorte central de PE original; los recortes se amplían y se rellenan sobre gris 0,5, lo que puede afectar a comparaciones con resultados upstream.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir a Meta y al autor de la conversión.
- Sin datos de sesgos, alucinación o robustez: la model card no documenta evaluaciones de sesgo, seguridad ni comportamiento en dominios fuera de tráfico urbano.
- Advertencia de producción: el paquete tiene 0 descargas y 0 likes, creado en noviembre de 2026; no hay evidencia de uso en producción ni mantenimiento continuado.

## Enlaces

- [Hugging Face: Sky-Kim/com.sky.sentis.pe-core-s16](https://huggingface.co/Sky-Kim/com.sky.sentis.pe-core-s16)
- [Modelo base: facebook/PE-Core-S16-384](https://huggingface.co/facebook/PE-Core-S16-384)
- [Repositorio de referencia: facebookresearch/perception_models](https://github.com/facebookresearch/perception_models)
- [Paper citado en los tags: arxiv:2504.13181](https://arxiv.org/abs/2504.13181)
