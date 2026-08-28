# felixhrdyn/mobileclip2-s0-onnx

## Resumen

El modelo `mobileclip2-s0-onnx` es una conversión a formato ONNX del modelo MobileCLIP2-S0 de Apple, realizada por el usuario felixhrdyn. Está diseñado para ejecutarse íntegramente en CPU, sin necesidad de GPU, lo que lo hace adecuado para dispositivos edge, portátiles y sistemas embebidos. Resuelve el problema de obtener embeddings multimodales (imagen y texto) en entornos con recursos limitados, manteniendo una latencia baja.

La arquitectura combina un backbone de visión FastViT de aproximadamente 12 millones de parámetros con un codificador de texto Transformer de unos 15 millones, totalizando cerca de 27 millones. El modelo produce vectores de 512 dimensiones normalizados L2, con una longitud de contexto de 77 tokens para el texto. Se distribuye bajo licencia MIT y está optimizado con cuantización INT8 dinámica para acelerar la inferencia en CPU.

Su relevancia actual radica en la creciente demanda de modelos multimodales ligeros que puedan ejecutarse localmente sin depender de servicios en la nube, especialmente para tareas como búsqueda semántica de vídeo, clasificación de imágenes y recuperación de información.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastViT (visión) + Transformer (texto) |
| Parametros totales | ~27 millones (12M visión + 15M texto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 77 tokens |
| Tipos de cuantizacion | FP32, INT8 dinamico |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una conversión directa del MobileCLIP2-S0 original de Apple, que fue entrenado con el dataset DFNDR (según el repositorio oficial de Apple). La conversión a ONNX mantiene una paridad numérica alta: los resultados FP32 presentan una similitud coseno superior a 0.9998 respecto a los pesos originales de PyTorch.

La optimización principal consiste en la cuantización INT8 dinámica aplicada al codificador de texto, que reduce su tamaño en un 75% y acelera la codificación en CPU en un factor de 2.09x, con una fidelidad de 0.9556 de similitud coseno frente a la versión FP32. Para el backbone de visión FastViT, la cuantización dinámica en CPU introduce una sobrecarga de conversión en las convoluciones depthwise, por lo que se recomienda mantener la versión FP32 para obtener el mejor equilibrio entre velocidad y precisión.

## Capacidades

- Generación de embeddings multimodales imagen-texto de 512 dimensiones, normalizados L2.
- Búsqueda semántica mediante similitud coseno entre representaciones de imagen y texto.
- Extracción de características para tareas de clasificación, recuperación y agrupamiento.
- Inferencia 100% en CPU, sin necesidad de GPU.
- Compatibilidad con múltiples runtimes: Python, C++, Rust, WASM y plataformas móviles.
- Cuantización INT8 dinámica para despliegue en entornos con memoria o almacenamiento limitados.

## Casos de uso

- Búsqueda semántica de vídeo local: indexar fotogramas de vídeo con el modelo de visión y permitir búsquedas por descripciones textuales, todo en un equipo sin GPU.
- Clasificación de imágenes en dispositivos edge: generar embeddings de imágenes y compararlos con representaciones de clases predefinidas para clasificar sin conexión.
- Recuperación de imágenes por texto en aplicaciones móviles: usar el modelo para buscar en una galería local mediante consultas en lenguaje natural.
- Sistemas de recomendación visual: comparar embeddings de productos para sugerir artículos similares en tiendas online.
- Moderación de contenido: detectar imágenes inapropiadas calculando la similitud con textos de referencia (por ejemplo, "violencia", "desnudo").
- Asistentes de accesibilidad: recuperar descripciones predefinidas para imágenes capturadas por personas con discapacidad visual, usando el modelo como motor de comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo de embeddings y no generativo. La model card proporciona datos de latencia y tamaño para los distintos perfiles de despliegue:

| Perfil | Modelo de visión | Modelo de texto | Tamaño total | Latencia visión | Latencia texto |
| :--- | :--- | :--- | :---: | :---: | :---: |
| Híbrido (recomendado) | FP32 | INT8 | 105 MB | 112 ms | 10 ms |
| INT8 completo | INT8 | INT8 | 72.7 MB | 1393 ms | 10 ms |
| FP32 completo | FP32 | FP32 | 285.7 MB | 112 ms | 22 ms |

Además, se indica una latencia de 25.0 ms por fotograma para la generación de embeddings de vídeo en CPU.

## Requisitos de hardware

- No requiere GPU; funciona exclusivamente en CPU.
- Memoria RAM: el perfil híbrido ocupa 105 MB, el perfil INT8 completo 72.7 MB y el FP32 completo 285.7 MB.
- GPU recomendada: no necesaria. Si se desea usar GPU, cualquier GPU compatible con ONNX Runtime puede acelerar la inferencia, pero no es el objetivo del modelo.
- Opciones de despliegue: ONNX Runtime en Python, C++, C#, Rust; también es posible ejecutarlo en entornos WASM y móviles.
- Latencia estimada: 122 ms por par imagen-texto en el perfil híbrido (112 ms visión + 10 ms texto).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la información proporcionada. Como alternativas de la misma categoría se pueden considerar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- |
| MobileCLIP2-S0 (ONNX, este) | ~27M | 77 tokens | MIT | Hugging Face |
| MobileCLIP-S0 (original) | ~12M (visión) | 77 tokens | MIT | Repositorio oficial de Apple |
| CLIP ViT-B/32 | ~151M | 77 tokens | MIT | OpenAI / Hugging Face |

La comparación directa no es posible sin benchmarks publicados, pero MobileCLIP2-S0 destaca por su tamaño reducido y su orientación a CPU.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés; no hay soporte multilingüe.
- La longitud de contexto de 77 tokens limita el procesamiento de textos largos o descripciones extensas.
- No es un modelo generativo: solo produce embeddings, no genera texto ni imágenes.
- La cuantización INT8 puede degradar ligeramente la precisión (similitud coseno de 0.9556 frente a FP32).
- No se han documentado sesgos específicos, pero al estar entrenado con datos web, puede heredar sesgos presentes en esos datos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se ofrece sin garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felixhrdyn/mobileclip2-s0-onnx
- Repositorio oficial de Apple (MobileCLIP y MobileCLIP2): https://github.com/apple/ml-mobileclip
- Conversión ONNX alternativa: https://huggingface.co/plhery/mobileclip2-onnx
- Repositorio de conversión a ONNX para Unity Sentis: https://github.com/skykim/ml-mobileclip-onnx
