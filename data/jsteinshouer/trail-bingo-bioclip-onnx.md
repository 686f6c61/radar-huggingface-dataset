# jsteinshouer/trail-bingo-bioclip-onnx

## Resumen

trail-bingo-bioclip-onnx es la exportación a ONNX de BioCLIP (ViT-B/16), el modelo de visión-lenguaje del Imageomics Institute especializado en el árbol de la vida. Lo publica el desarrollador jsteinshouer como artefacto de soporte de Trail Bingo, un juego de bingo de senderismo cuyo verificador de fotos se ejecuta íntegramente en el teléfono. No es un modelo nuevo: es una conversión del checkpoint imageomics/bioclip pensada para inferencia en navegador con ONNX Runtime Web.

El paquete incluye los dos codificadores (imagen y texto), más el tokenizer de open_clip y un `manifest.json` con el tamaño de embedding, la longitud de contexto y el preprocesado de imagen. La torre de imagen acepta tensores `[batch, 3, 224, 224]` y devuelve embeddings de 512 dimensiones normalizados en L2; la torre de texto acepta `input_ids` de `[batch, 77]` y produce embeddings también de 512 dimensiones. La clasificación zero-shot se obtiene por similitud coseno entre ambos vectores.

Su relevancia es práctica: demuestra que un modelo de visión-lenguaje de aproximadamente 150 M de parámetros puede servirse sin backend, con pesos en fp16 y cálculo en fp32, en un repositorio de solo 0,3 GB. La licencia MIT heredada del modelo base permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Doble codificador tipo CLIP: torre de visión ViT-B/16 y torre de texto transformer, exportadas a ONNX |
| Parámetros totales | No especificado por el autor. La configuración ViT-B/16 de CLIP ronda los 150 M en el conjunto de ambas torres (~86 M visión + ~63 M texto) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 77 tokens en la torre de texto (`input_ids` `[batch, 77]`); imagen de entrada de 224 x 224 px |
| Tipos de cuantización | Pesos almacenados en fp16 y convertidos a fp32 en la carga. No se publican variantes int8, GGUF ni otras |
| Idiomas soportados | No disponible. La model card no declara idiomas; el tokenizer es el de open_clip |
| Licencia | MIT, heredada de imageomics/bioclip |
| Formato de pesos | ONNX (`image_encoder_fp16.onnx`, `text_encoder_fp16.onnx`); `tokenizer.json`, `tokenizer_config.json`, `manifest.json` |

## Arquitectura y entrenamiento

La arquitectura es la de CLIP: dos codificadores independientes entrenados de forma contrastiva para alinear pares imagen-texto en un espacio común de 512 dimensiones. La torre visual es un Vision Transformer con parches de 16 px (ViT-B/16) que consume imágenes de 224 x 224 px con center crop y normalización según la media y desviación estándar de CLIP; la torre textual es un transformer que procesa hasta 77 tokens. Ambas salidas se normalizan en L2, de modo que la puntuación de una clase es directamente el producto escalar entre el embedding de la imagen y el embedding del texto de la etiqueta.

Este repositorio no entrena nada: es una conversión de `hf-hub:imageomics/bioclip` realizada con open_clip y `torch.onnx` mediante el script `spike/export/export.py`. El criterio de validación del export es estricto: el script falla si los vectores de cualquiera de los codificadores caen por debajo de 0,99 de similitud coseno respecto a PyTorch. Los pesos se guardan en fp16 para reducir a la mitad la descarga, pero se castean a fp32 al cargar, porque el cálculo completo en fp16 provoca fallos en el backend CPU de ONNX Runtime, que es además el fallback WebAssembly del navegador. La información proporcionada no detalla el dataset de entrenamiento de BioCLIP; la model card remite al paper de CVPR 2024 para esos datos.

## Capacidades

- Clasificación de imágenes zero-shot: compara el embedding de una imagen con los embeddings de etiquetas textuales arbitrarias, sin reentrenamiento ni fine-tuning.
- Extracción de embeddings de imagen y de texto en un espacio compartido de 512 dimensiones, normalizados en L2.
- Especialización en dominio biológico: el modelo base está orientado a taxonomía y organismos del árbol de la vida.
- Inferencia en navegador mediante ONNX Runtime Web, con backend WebAssembly y posibilidad de WebGPU.
- Ejecución local sin backend ni envío de imágenes a un servidor (el caso de uso original es un juego offline en el móvil).
- No genera texto: no es un modelo generativo ni un asistente conversacional.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de razonamiento multi-paso, modo thinking, audio, vídeo ni detección o segmentación con cajas.
- Capacidad multilingüe no documentada: las etiquetas se introducen como texto libre y el tokenizer es el de open_clip.

## Casos de uso

- Verificación fotográfica en juegos de exterior: es exactamente el escenario de Trail Bingo, donde la app comprueba en el propio teléfono si la foto corresponde a un elemento pedido, sin conexión ni servidor.
- Identificación de especies en aplicaciones de campo: una app web o PWA puede comparar la foto del usuario contra una lista de especies candidatas de una zona concreta y devolver la más probable.
- Catalogación de imágenes de cámaras trampa: preetiquetado de grandes volúmenes de capturas nocturnas o diurnas para que un revisor humano valide después, reduciendo el trabajo manual.
- Etiquetado asistido en proyectos de ciencia ciudadana: sugerencia automática de taxones a partir de fotografías enviadas por voluntarios, con confirmación posterior por expertos.
- Filtrado y control de calidad de datasets de biodiversidad: detección de imágenes mal etiquetadas o fuera de dominio comparando la clase declarada con la predicción zero-shot.
- Aplicaciones educativas web sin backend: material didáctico de botánica o zoología que clasifica imágenes en el navegador del alumno con la única dependencia de 0,3 GB de pesos.
- Herramientas de accesibilidad o consulta en movilidad: reconocimiento de un organismo a partir de una foto puntual en un dispositivo de gama media, al caber el modelo completo en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, MMLU, ImageNet ni evaluaciones de clasificación zero-shot sobre taxones. El único dato cuantitativo declarado es el criterio de validación del export: similitud coseno mínima de 0,99 frente a las salidas de PyTorch en ambos codificadores.

Tampoco hay datos de rendimiento en latencia o throughput. El repositorio acumula 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 0,3 GB, correspondiente a los dos codificadores en fp16; al castear a fp32 en memoria la huella de pesos activos se aproxima a 0,6 GB. Cifra estimada a partir del tamaño del repositorio, no declarada por el autor.
- No requiere GPU: el diseño apunta al backend CPU de ONNX Runtime y a WebAssembly en el navegador.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU integrada, y también en móviles de gama media.
- Para servidor, una única GPU pequeña (T4, L4, RTX 3060) permite servir muchas más réplicas de las que admite la memoria disponible; el cuello de botella será el preprocesado de imagen, no el modelo.
- Opciones de despliegue: ONNX Runtime Web en navegador, ONNX Runtime en Python o C++, y cualquier runtime compatible con ONNX (por ejemplo, integración vía Transformers.js). No se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsteinshouer/trail-bingo-bioclip-onnx | No especificado (ViT-B/16) | 77 tokens de texto; 224 x 224 px de imagen | ONNX fp16 | MIT | Navegador y ONNX Runtime; 0 descargas |
| imageomics/bioclip (modelo base) | No especificado (ViT-B/16) | 77 tokens de texto; 224 x 224 px de imagen | PyTorch / open_clip | MIT | Requiere Python y open_clip |
| openai/clip-vit-base-patch16 | ~150 M | 77 tokens de texto; 224 x 224 px de imagen | PyTorch / safetensors | MIT | Referencia genérica de la misma arquitectura, sin especialización biológica |

No hay datos de benchmarks comparativos en la información disponible, por lo que la comparación se limita a arquitectura, formato, licencia y facilidad de despliegue. La ventaja diferencial de este export es el formato ONNX fp16 listo para navegador; su desventaja es la ausencia de validación pública.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas, solo embeddings y puntuaciones de similitud.
- El rendimiento fuera del dominio biológico no está documentado y previsiblemente será inferior al de un CLIP genérico entrenado con datos web a gran escala.
- El resultado zero-shot depende críticamente del prompt de las etiquetas; pequeñas variaciones en la redacción cambian la clasificación.
- Ventana de texto de solo 77 tokens, lo que limita la longitud de las etiquetas y de las descripciones usadas como clase.
- Entrada de imagen fija a 224 x 224 px con center crop: objetos pequeños, imágenes verticales o recortes agresivos pueden perder el sujeto relevante.
- No se documentan sesgos ni evaluación de equidad; tampoco evaluación por regiones geográficas o grupos taxonómicos concretos.
- Riesgo de alucinación en sentido amplio: el modelo siempre devolverá la etiqueta más similar del conjunto dado, aunque ninguna sea correcta, sin umbral de rechazo incorporado. Es responsabilidad de la aplicación fijar un umbral de confianza.
- El cálculo en fp32 impide aprovechar la aceleración fp16 en el backend CPU de ONNX Runtime; en WebGPU el rendimiento dependerá del navegador y del dispositivo.
- Licencia MIT: permite uso comercial, pero la propia model card solicita citar el paper de BioCLIP al utilizarlo.
- Repositorio con 0 descargas y 0 likes y creado en 2026: sin historial de uso en producción ni mantenimiento demostrado.
- Al ser un artefacto derivado, cualquier actualización del modelo base no se reflejará aquí automáticamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsteinshouer/trail-bingo-bioclip-onnx
- Modelo base BioCLIP: https://huggingface.co/imageomics/bioclip
- Repositorio del proyecto Trail Bingo: https://github.com/jsteinshouer/trail-bingo
- Script de exportación a ONNX: https://github.com/jsteinshouer/trail-bingo/blob/main/spike/export/export.py
- Referencia académica del modelo base: Stevens, S., Wu, J., Thompson, M. J., Campolongo, E. G., Song, C. H., Carlyn, D. E., Dong, L., Dahdul, W. M., Stewart, C., Berger-Wolf, T., Chao, W.-L., & Su, Y. (2024). BioCLIP: A Vision Foundation Model for the Tree of Life. CVPR 2024.
- Búsqueda web: los resultados obtenidos no guardan relación con este modelo (corresponden a herramientas de reescalado de imagen de Topaz Labs), por lo que no se aportan enlaces adicionales.
