# hlhc/FLUX.2-klein-4B-onnx

## Resumen

`hlhc/FLUX.2-klein-4B-onnx` es la exportación a formato ONNX del modelo de difusión `black-forest-labs/FLUX.2-klein-4B`, realizada por el usuario hlhc y pensada para ejecutarse con onnxruntime. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión del modelo original de 4.000 millones de parámetros aproximadamente, en la que además se han plegado dentro de los grafos las etapas de preprocesado y postprocesado del pipeline (tokenización, posiciones, normalizaciones del VAE). El resultado son cuatro grafos independientes: `text_encoder.onnx`, `transformer.onnx`, `vae_encoder.onnx` y `vae_decoder.onnx`.

La relevancia de esta conversión está en el despliegue: al estar en ONNX con cuantización `MatMulNBits`, el modelo puede ejecutarse con los proveedores de ejecución CPU, CUDA y DirectML de onnxruntime, lo que abre la puerta a integrarlo en aplicaciones C++, C#/.NET o Windows sin depender de Python ni de PyTorch. El repositorio ocupa 7,9 GB y el encoder de texto está cuantizado a int4 (bloque 128), mientras que el transformer lo está a int8 (bloque 128), con el VAE en float32.

Se publica bajo licencia Apache-2.0, la misma que el modelo base, y el pipeline declarado es `image-to-image`, con etiquetas de edición de imagen. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con muestreo flow-match Euler y desplazamiento empírico de `mu`; encoder de texto basado en Qwen3; exportado a cuatro grafos ONNX |
| Parámetros totales | Aproximadamente 4.000 millones (denominación 4B del modelo base); no se desglosa por componente en la información disponible |
| Longitud de contexto | 512 tokens en el encoder de texto (`input_ids[1,512]`, `attention_mask[1,512]`); resolución de imagen variable, con `S` como número de tokens latentes |
| Tipos de cuantización | `MatMulNBits` int4 con bloque 128 en el encoder de texto; `MatMulNBits` int8 con bloque 128 en el transformer; VAE en float32; activaciones en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo `.onnx` más fichero externo `.onnx.data`); pesos originales en PyTorch/diffusers |
| Tamaño del repositorio | 7,9 GB |
| Dimensión del embedding de texto | 7.680 (estados ocultos de las capas 9, 18 y 27 del encoder Qwen3) |
| Latentes del VAE | 128 canales; el decoder aplica un factor de ampliación espacial de 16 |
| Rango de valores de imagen | [-1, 1] tanto en la entrada del VAE encoder como en la salida del VAE decoder |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión que genera y edita imágenes mediante un esquema de flow matching, con un sampler Euler y un desplazamiento empírico del parámetro `mu` documentado en el `config.json` del repositorio. La cadena completa consta de cuatro etapas: un encoder de texto (Qwen3) que proyecta el prompt a embeddings de dimensión 7.680 tomando los estados ocultos de las capas 9, 18 y 27; un transformer que recibe los estados latentes `hidden_states[1,S,128]`, los embeddings de texto `encoder_hidden_states[1,512,7680]`, el timestep (en forma de sigma) y los identificadores de posición de imagen y texto (`img_ids[1,S,4]`, `txt_ids[1,512,4]`) para predecir el ruido `noise_pred[1,S,128]`; y un VAE con encoder y decoder separados.

La innovación de esta publicación concreta no está en el entrenamiento, sino en la exportación. El autor ha integrado el preprocesado y el postprocesado del pipeline dentro de los propios grafos ONNX, de modo que el consumidor no necesita replicar la plantilla de chat, las convenciones de identificadores de posición ni las normalizaciones por lotes del VAE: el `config.json` las documenta y los grafos las aplican. La cuantización es selectiva: int4 para el encoder de texto (3,00 GB de datos) e int8 para el transformer (4,50 GB), dejando el VAE en float32 para preservar la fidelidad de reconstrucción. El script de exportación, `scripts/export_klein_onnx.py`, se ejecutó con torch 2.14.0+cu130, diffusers 0.40.0 y onnxruntime 1.30.0. No se documenta en la tarjeta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto: la verificación incluida (`verification_onnx.png`) es una generación de 512 px en 4 pasos ejecutada íntegramente con onnxruntime.
- Edición de imágenes (image-to-image): el pipeline declarado es `image-to-image` y el `config.json` recoge la convención de imagen de referencia para edición.
- Codificación y decodificación latente completa: `vae_encoder.onnx` convierte una imagen en [-1, 1] a latentes `[1,128,H/16,W/16]` parcheados y normalizados con batch-norm; `vae_decoder.onnx` reconstruye la imagen con un factor de ampliación de 16.
- Codificación de texto con Qwen3: el grafo acepta hasta 512 tokens y devuelve embeddings de 7.680 dimensiones combinando tres capas intermedias.
- Ejecución multiplataforma mediante onnxruntime: proveedores CPU, CUDA y DirectML. El proveedor Core ML no está soportado para `MatMulNBits`.
- Control del número de pasos de muestreo: los ejemplos de verificación usan 4 pasos, aunque la tarjeta no fija un mínimo o máximo.
- No dispone de tool calling, function calling, modo de razonamiento, agentes ni capacidades de audio o vídeo: no es un modelo de lenguaje conversacional.

## Casos de uso

- Edición de imágenes por lotes en local: dado que el pipeline es image-to-image y las etapas de preprocesado están plegadas en los grafos, se puede procesar un directorio de imágenes con una única llamada a onnxruntime por etapa, sin levantar un entorno Python con diffusers.
- Integración en aplicaciones de escritorio Windows y .NET: al soportar el proveedor DirectML, el modelo puede incrustarse en una aplicación C# o C++ que acelere por GPU sin depender de CUDA ni de PyTorch.
- Retoque de producto en comercio electrónico: modificar fondo, iluminación o encuadre de fotografías de catálogo usando la imagen original como referencia de edición, manteniendo el objeto intacto.
- Generación de recursos gráficos en pipelines de diseño: producir variantes de una imagen base a 512 px en 4 pasos para maquetas, banners o pruebas de concepto antes de un render final de mayor calidad.
- Procesamiento con requisitos de privacidad: al ejecutarse en infraestructura propia (CPU o GPU local), las imágenes no salen del perímetro de la organización, lo que resulta adecuado para material médico, legal o interno.
- Despliegue en servidores sin GPU: el proveedor CPU de onnxruntime soporta `MatMulNBits`, de modo que un servidor convencional puede servir el modelo con mayor latencia pero sin hardware acelerador.
- Validación de exportaciones: el repositorio sirve como referencia para comparar la fidelidad numérica entre una implementación PyTorch (diffusers) y su equivalente ONNX mediante similitud coseno por módulo.
- Investigación sobre cuantización: la combinación int4 en el encoder de texto e int8 en el transformer permite estudiar el impacto de distintas precisiones en la calidad final de la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, GenEval ni similares) en la información disponible. El único dato cuantitativo aportado por el autor es la verificación de equivalencia numérica frente a los módulos PyTorch originales sobre entradas idénticas:

| Grafo | Similitud coseno frente a PyTorch |
|---|---|
| `text_encoder` | 0,99151 |
| `transformer` | 0,99789 |
| `vae_encoder` | 1,00000 |
| `vae_decoder` | 1,00000 |

## Requisitos de hardware

- Peso de los grafos: 3,00 GB (`text_encoder.onnx.data`) + 4,50 GB (`transformer.onnx.data`) + 0,20 GB (`vae_decoder.onnx`) + 0,14 GB (`vae_encoder.onnx`), es decir, unos 7,84 GB en disco.
- VRAM estimada para inferencia: en torno a 9-11 GB a 512 px si se cargan todos los grafos a la vez, partiendo del tamaño de los pesos y de las activaciones en float32. Es una estimación derivada de los tamaños de fichero, no un dato publicado.
- GPU recomendadas: tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) para ejecución íntegra en GPU; A100 o H100 para despliegues en servidor con mayor concurrencia.
- Cabe en GPU de consumo: sí, en modelos con al menos 12 GB de VRAM según la estimación anterior; en tarjetas de 8 GB habría que cargar los grafos por etapas o reducir resolución, algo no documentado por el autor.
- Opciones de despliegue: onnxruntime con proveedor CPU, CUDA o DirectML. No hay soporte de Core ML. Para la versión PyTorch equivalente se usaría diffusers. Herramientas como llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El único dato indirecto es que la verificación se realizó con 4 pasos de muestreo a 512 px, sin tiempos publicados.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `black-forest-labs/FLUX.2-klein-4B` | PyTorch / diffusers | no disponible | Apache-2.0 | Hugging Face (autor original) | Modelo de referencia; requiere Python y diffusers |
| `hlhc/FLUX.2-klein-4B-onnx` | ONNX con datos externos | int4 (text encoder), int8 (transformer), float32 (VAE) | Apache-2.0 | Hugging Face (hlhc) | Exportación verificada por similitud coseno; ejecutable con onnxruntime en CPU, CUDA y DirectML |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | La búsqueda web no devolvió información relevante sobre alternativas de la misma categoría |

## Limitaciones y advertencias

- La equivalencia con PyTorch no es exacta: la similitud coseno es 0,99151 en el encoder de texto y 0,99789 en el transformer, por lo que existe una desviación numérica que puede acumularse a lo largo de los pasos de muestreo.
- No hay benchmarks de calidad de imagen publicados, ni comparaciones objetivas con el modelo base en formato PyTorch.
- El repositorio tiene 0 descargas y 0 likes, lo que implica ausencia total de validación por terceros.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el fichero `LICENSE.md` del repositorio y la licencia del modelo base para confirmar condiciones y atribución.
- El proveedor Core ML no está soportado, de modo que no es desplegable en el Neural Engine de Apple con esta exportación.
- La resolución verificada es 512 px con 4 pasos; no se documenta el comportamiento a resoluciones mayores ni el coste computacional asociado.
- El límite de 512 tokens en el encoder de texto restringe la longitud de los prompts; no se documenta el comportamiento con entradas más largas.
- No se documentan los idiomas soportados ni la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o de representación.
- No se mencionan filtros de seguridad, moderación de contenido ni mecanismos de rechazo de prompts, algo relevante si el modelo se expone a usuarios finales.
- Al ser un modelo de difusión, existe riesgo de artefactos y de fidelidad imperfecta respecto a la imagen de referencia en tareas de edición, tanto mayor cuanto más se aleje el caso de uso de los ejemplos de verificación.
- La fecha de publicación y la ausencia de historial de actualizaciones no permiten asegurar el mantenimiento del repositorio.

## Enlaces

- Repositorio ONNX en Hugging Face: https://huggingface.co/hlhc/FLUX.2-klein-4B-onnx
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Fichero de licencia del repositorio: `LICENSE.md` (incluido en el repositorio)
- Script de exportación: `scripts/export_klein_onnx.py` (incluido en el repositorio)
- Imagen de verificación text-to-image en ONNX: `verification_onnx.png` (incluida en el repositorio)
- Imagen de verificación en PyTorch: `verification_pytorch.png` (incluida en el repositorio cuando está presente)
- Búsqueda web: no se encontraron resultados relevantes sobre el modelo; las entradas devueltas correspondían a páginas de ayuda de YouTube sin relación con el repositorio.
