# athrael-soju/UltraVBERT

## Resumen

UltraVBERT es un codificador vision-language de 247 millones de parámetros (286 millones contando la cabeza MLM) diseñado como base para sistemas de recuperación de documentos visuales. Lo desarrolla athrael-soju y combina el codificador de texto UltraBERT-150M con el codificador visual SigLIP2-B/16-512, generando un embedding contextual por cada token de texto y de imagen. No es un modelo generativo ni un retriever listo para usar: es el encoder sobre el que se construyen los retrievers BiUltraVBERT (vector único) y ColUltraVBERT (interacción tardía), ambos publicados por el mismo autor.

El modelo parte de ModernVBERT (arXiv 2510.01149) y sustituye el codificador de texto Ettin-150M por UltraBERT (arXiv 2610.15028). Además, normaliza la salida del conector, amplía el límite de página de 2.048 px y 16 tiles a 3.072 px y 27 tiles, y añade una etapa de entrenamiento sobre páginas de texto renderizado. El resultado es un encoder capaz de procesar páginas completas de documentos con hasta 1.664 tokens de imagen, pensado para pipelines de búsqueda visual de documentos (ViDoRe, ColPali).

Es relevante ahora porque la recuperación de documentos visuales (buscar directamente sobre la imagen de la página, sin OCR intermedio) se ha consolidado como alternativa práctica a los pipelines clásicos. UltraVBERT ofrece una base abierta, con licencia MIT y pesos en safetensors, sobre la que el autor publica los retrievers finales, lo que permite evaluar y adaptar toda la pila sin depender de modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language encoder (transformer de texto UltraBERT-150M + vision encoder SigLIP2-B/16-512 + conector pixel shuffle + cabeza MLM) |
| Parametros totales | 293.115.648 (safetensors); 286.028.544 segun la model card; 247M sin la cabeza MLM |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 27 tiles por pagina (3.072 px en el lado largo), maximo 26 x 64 = 1.664 tokens de imagen por pagina; configurable a 2.048 px (1.088 tokens) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere codigo custom en versiones anteriores a 5.21) |

## Arquitectura y entrenamiento

La arquitectura es un encoder multimodal de dos torres con fusión temprana a nivel de token. SigLIP2-B/16-512 (12 capas, parches de 16 px, tiles de 512 px) codifica cada tile de la página en 1.024 parches; el conector agrupa bloques de 4 x 4 parches mediante pixel shuffle en un único token (64 tokens por tile), proyecta de 12.288 a 768 dimensiones con una capa lineal y aplica RMSNorm. UltraBERT-150M (24 capas, hidden size 768, 6 cabezas, atención local sobre ±128 tokens en 2 de cada 3 capas, 40 tokens especiales añadidos) atiende conjuntamente sobre tokens de imagen y de texto. La cabeza MLM consta de dos capas de 768 x 768 y una capa de salida extendida a 49.280 tokens. El procesador escala la página a 3.072 px en el lado largo, la reduce en pasos de 512 px hasta que cabe en 27 tiles y añade una vista reducida de la página completa; la rejilla admite como máximo 6 tiles por lado, de modo que el mayor encaje es 5 x 5.

El entrenamiento usa masked language modelling sobre las respuestas de conversaciones ancladas en imágenes, enmascarando la mitad de los tokens de respuesta (80% `<|mask|>`, 10% token aleatorio, 10% sin cambio). Se aplican adaptadores DoRA (rango 64, alpha 16) sobre ambos encoders y la cabeza MLM con learning rate pico de 1e-4; el conector se entrena completo a 1e-3 y los embeddings de los 40 tokens añadidos se entrenan directamente. Optimizador AdamW (beta2 0.95), weight decay 0.1, gradient clipping 1.0 y autocast en bfloat16. Hay dos etapas: lectura (3.600 pasos, 0,36B tokens de texto, mitad páginas de Docmatix y mitad pasajes renderizados de RLHN-680K) y mezcla (34.206 pasos, 8,9B tokens de texto) con schedule warmup-stable-decay y decaimiento 1 - sqrt en el último 20% de pasos. En la etapa de mezcla, las páginas se redimensionan a 1.024 px hasta el inicio del decaimiento y después a lados largos aleatorios entre 1.024 y 3.072 px. La composición de la mezcla incluye instrucciones de texto (48,18%, 16 subconjuntos de texto de FineVision), OCR y documentos (16,21%, Docmatix y 9 subconjuntos de FineVision) y screenshot to code (16,71%, 4 subconjuntos de FineVision); el resto de la mezcla no está detallado en la información disponible.

## Capacidades

- Codificación conjunta de texto e imagen: produce un embedding contextual de 768 dimensiones por cada token de texto y de imagen.
- Masked language modelling multimodal: predice palabras enmascaradas a partir del contexto de la página (por ejemplo, completar una cifra en una tabla).
- Recuperación de documentos visuales: sirve como base para retrievers de vector único (BiUltraVBERT) y de interacción tardía (ColUltraVBERT).
- Procesamiento de páginas completas: hasta 27 tiles y 1.664 tokens de imagen por página, con vista global reducida incluida.
- Comprensión de OCR y documentos: entrenado sobre Docmatix y subconjuntos de OCR de FineVision.
- Screenshot to code: entrenado sobre subconjuntos de FineVision orientados a convertir capturas en código.
- Cabezas de tarea adicionales: `AutoModelForSequenceClassification` y `AutoModelForTokenClassification` sobre el mismo encoder.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un encoder, no un modelo generativo).
- Capacidades multilingües: solo inglés.
- Capacidades especiales: thinking mode, visión general, audio: no disponible (la visión se limita a la codificación de páginas para recuperación).

## Casos de uso

- Búsqueda visual de documentos en producción: indexar las páginas como imágenes y usar ColUltraVBERT (construido sobre este encoder) para recuperar páginas relevantes sin pipeline de OCR, gracias a los hasta 1.664 tokens de imagen por página.
- Recuperación en corpus financieros y tabulares: el entrenamiento sobre Docmatix y subconjuntos de OCR permite localizar tablas y cifras directamente sobre el render de la página, donde el OCR suele fallar.
- Extracción asistida por MLM: completar campos enmascarados de formularios o tablas (por ejemplo, una cifra de ingresos) usando el contexto visual de la página con `AutoModelForMaskedLM`.
- Clasificación de documentos: añadir una cabeza de secuencia sobre el encoder para clasificar páginas por tipo (factura, contrato, informe) sin modelo adicional de visión.
- Etiquetado de tokens sobre documentos: usar `AutoModelForTokenClassification` para detectar entidades (importes, fechas, nombres) en el texto renderizado de la página.
- Generación de código a partir de capturas: aprovechar el entrenamiento screenshot to code para prototipos de conversión de interfaces en código, siempre como encoder base y no como generador.
- Base para fine-tuning propio: al ser un encoder MIT de 247M parámetros y 0,6 GB, es viable adaptarlo con DoRA o LoRA a dominios específicos (legal, médico, administrativo) en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,55 GB (0,6 GB de repositorio); con activaciones de páginas grandes (hasta 1.664 tokens de imagen) el consumo práctico se sitúa en el rango de 2 a 4 GB, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia en bfloat16; para entrenamiento con DoRA sobre páginas completas se recomiendan A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs con 8 GB si se reduce el número de tiles (`max_image_tiles`) o el lado largo a 2.048 px.
- Opciones de despliegue: transformers (>= 5.21 con soporte nativo; en 5.20.x con `trust_remote_code=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tokens de imagen | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UltraVBERT | 247M (286M con cabeza MLM) | Hasta 27 tiles, 1.664 tokens de imagen | Encoder base para retrieval visual | MIT | Hugging Face |
| ModernVBERT | No disponible | Hasta 16 tiles, 2.048 px (modelo del que deriva) | Encoder base para retrieval visual | No disponible | Hugging Face |
| ColUltraVBERT | No disponible (derivado de UltraVBERT) | Igual que UltraVBERT | Retriever de interacción tardía | No disponible | Hugging Face, con demo en Spaces |
| BiUltraVBERT | No disponible (derivado de UltraVBERT) | Igual que UltraVBERT | Retriever de vector único | No disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Es un encoder, no un modelo generativo: no produce texto libre ni mantiene conversaciones; para retrieval hay que usar BiUltraVBERT o ColUltraVBERT.
- Riesgo de alucinación en la cabeza MLM: las predicciones de tokens enmascarados pueden ser plausibles pero incorrectas, especialmente en tablas densas o documentos con tipografías atípicas.
- Límite de página: el procesador admite como máximo 27 tiles y una rejilla de 5 x 5; páginas más densas o con texto muy pequeño pueden perder detalle.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento sobre Docmatix, FineVision, the_cauldron y RLHN-680K puede heredar sesgos de esas fuentes.
- Licencia MIT: permite uso comercial, pero la model card no incluye garantías ni evaluaciones de robustez en producción.
- Requiere transformers >= 5.21 para carga nativa; en versiones anteriores hay que usar `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- No se han publicado benchmarks propios en la información disponible, por lo que el rendimiento real en ViDoRe u otros conjuntos debe validarse antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athrael-soju/UltraVBERT
- Retriever de vector único BiUltraVBERT: https://huggingface.co/athrael-soju/BiUltraVBERT
- Retriever de interacción tardía ColUltraVBERT: https://huggingface.co/athrael-soju/ColUltraVBERT
- Demo de ColUltraVBERT: https://huggingface.co/spaces/athrael-soju/ColUltraVBERT
- Modelo base de texto UltraBERT-150M: https://huggingface.co/dmis-lab/UltraBERT-150M
- Modelo base de visión SigLIP2-B/16-512: https://huggingface.co/google/siglip2-base-patch16-512
- Modelo predecesor ModernVBERT: https://huggingface.co/ModernVBERT/modernvbert
- Paper de ModernVBERT (arXiv 2510.01149): https://arxiv.org/abs/2510.01149
- Paper de UltraBERT (arXiv 2610.15028): https://arxiv.org/abs/2610.15028
- Documentación de transformers para UltraVBERT: https://huggingface.co/docs/transformers/model_doc/ultravbert
