# FinDIT-Studio/siglip2-naflex-coreml

## Resumen

FinDIT-Studio/siglip2-naflex-coreml es una conversión a CoreML de los codificadores de visión y texto del modelo SigLIP 2 NaFlex (base, patch16) de Google DeepMind. El modelo está pensado para tareas de clasificación de imágenes sin entrenamiento (zero-shot) y emparejamiento imagen-texto. Proporciona un espacio de embeddings conjunto de 768 dimensiones compartido entre la imagen y el texto. Ha sido desarrollado por FinDIT-Studio y se distribuye bajo licencia Apache-2.0. El repositorio contiene los dos codificadores en formato .mlmodelc, junto con la tabla de posiciones base para el reescalado por imagen en tiempo de ejecución. La conversión mantiene los pesos originales del modelo de Google, con cambios estructurales para adaptar el reescalado de posiciones y el cabezal de atención al runtime de CoreML. El tamaño del repositorio es de 1,0 GB.

La arquitectura es un dual-encoder basado en Transformer. El codificador de visión acepta imágenes de 512 parches (tier NaFlex 512), mientras que el codificador de texto procesa secuencias de hasta 64 tokens. Ambos producen representaciones de 768 dimensiones. El modelo no es generativo: no genera texto, sino que calcula embeddings para clasificación y búsqueda multimodal. La relevancia actual radica en que permite ejecutar SigLIP 2 en dispositivos Apple (iOS, macOS) mediante CoreML, con soporte para Apple Neural Engine (ANE) desde la revisión 90d4dd2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder Transformer (codificador de visión y de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Texto: 64 tokens; visión: 512 parches (NaFlex 512) |
| Tipos de cuantizacion | fp32 y fp16 (según compute unit de CoreML) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .mlmodelc (CoreML), .bin (tabla de posiciones) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del modelo original de Google DeepMind. La arquitectura sigue el diseño de SigLIP 2: dos encoders Transformer independientes (visión y texto) que proyectan sus salidas a un espacio común de 768 dimensiones. La variante NaFlex (Naive Flexible) permite reescalar la tabla de posiciones para adaptarla a distintas resoluciones de imagen. En esta conversión, el reescalado se ha extraído del grafo de CoreML y se calcula en el host, pasándose como entrada adicional al modelo. El cabezal de atención con pooling medio (MAP) se ha reescrito explícitamente en lugar de usar la operación nn.MultiheadAttention original, y la activación GELU se ha implementado de forma exacta con gelu_pytorch_tanh. Estas modificaciones mantienen la salida fp32 idéntica al modelo original (cosine 1.0) y alteran la salida fp16 en una diferencia de 5,9e-7 en coseno. No se dispone de información sobre los datos de entrenamiento ni sobre procesos de RLHF/DPO, ya que el modelo es una conversión y no un entrenamiento nuevo.

## Capacidades

- Clasificación de imágenes zero-shot: calcula la similitud entre embeddings de imagen y de texto para etiquetar imágenes sin entrenamiento específico.
- Emparejamiento imagen-texto (image-text matching): puntúa la correspondencia entre una imagen y una descripción textual.
- Embeddings multimodales compartidos de 768 dimensiones para visión y texto.
- Codificador de texto con ventana de 64 tokens, adecuado para descripciones cortas.
- Codificador de visión con soporte de 512 parches (NaFlex).
- No soporta generación de texto, tool calling, ni razonamiento multi-step.

## Casos de uso

- Clasificación de imágenes en aplicaciones iOS: usar el codificador de visión y texto para etiquetar fotos del carrete sin conexión, con categorías definidas por el usuario. Es adecuado porque el modelo es ligero y se ejecuta en CoreML.
- Búsqueda semántica en catálogos de productos: indexar imágenes de productos con embeddings y permitir búsquedas por texto natural. La ventana de 64 tokens es suficiente para consultas cortas.
- Moderación de contenido: clasificar imágenes como inapropiadas o seguras comparando con prompts de texto. El matching imagen-texto permite detectar contenido no deseado sin necesidad de un clasificador entrenado.
- Sistemas de recomendación visual: recomendar imágenes o artículos similares basándose en la similitud de embeddings. El espacio conjunto de 768 dimensiones facilita comparaciones rápidas.
- Accesibilidad: seleccionar la mejor descripción candidata para una imagen en aplicaciones de apoyo a personas con discapacidad visual. El modelo puntúa la correspondencia entre imagen y texto.
- Organización automática de fotos en macOS: integrar en aplicaciones de gestión de fotos para agrupar imágenes por temas. El modelo funciona offline y no requiere conexión a servidores.
- Verificación de coincidencia imagen-texto en documentos: comprobar si una imagen corresponde a una descripción dada en un flujo de revisión automatizada. El emparejamiento multimodal permite validar la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: Apple Silicon (M1 Max o superior) para ejecución en GPU; también compatible con Apple Neural Engine desde la revisión 90d4dd2.
- No es compatible con GPUs NVIDIA ni con entornos CUDA, al estar en formato CoreML.
- Opciones de despliegue: CoreML en aplicaciones iOS/macOS; runtime Rust coremlit para la carga de los modelos.
- Latencia: en un M1 Max con macOS 26.5, el codificador de visión tarda aproximadamente 17 ms en GPU y 52 ms en ANE. No se dispone de datos de latencia para el codificador de texto.

## Comparativa con modelos similares

No se han encontrado datos de comparativas en la información disponible. La alternativa más directa es el modelo original de Google, del cual esta conversión es una copia con cambios de formato, pero no se dispone de sus métricas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto ni respuestas, solo embeddings.
- La ventana de texto es de 64 tokens, lo que limita descripciones largas.
- No se dispone de información sobre sesgos, por lo que no se puede garantizar su ausencia.
- El modelo está diseñado para ejecutarse en Apple Silicon (CoreML); no es compatible con entornos NVIDIA ni con llama.cpp/Ollama.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar avisos de copyright y declarar cambios.
- El rendimiento en ANE es más lento que en GPU en el host de prueba, y no se ha medido el consumo energético.

## Enlaces

- HuggingFace: https://huggingface.co/FinDIT-Studio/siglip2-naflex-coreml
- GitHub coremlit: https://github.com/findit-studio/coremlit
- GitHub Findit-AI/siglip2-naflex: https://github.com/findit-ai/siglip2-naflex
- Modelo original: https://huggingface.co/google/siglip2-base-patch16-naflex
