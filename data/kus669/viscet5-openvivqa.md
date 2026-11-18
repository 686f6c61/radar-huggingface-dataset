# Kus669/ViSceT5-OpenViVQA

## Resumen

ViSceT5-OpenViVQA es un modelo de respuesta visual a preguntas (VQA) sobre texto en escena para vietnamita, desarrollado por el usuario Kus669. Se trata de un checkpoint completo de un encoder-decoder ViT5-base (VietAI/vit5-base) afinado sobre el conjunto de datos OpenViVQA, que combina la imagen, la pregunta y las fichas OCR de la imagen para generar la respuesta en lenguaje natural. Su relevancia radica en abordar una tarea poco cubierta en vietnamita: responder preguntas cuya respuesta aparece escrita en la imagen (rótulos, carteles, documentos), no solo sobre el contenido visual general.

La arquitectura es personalizada (`model_type: openvivqa`) e incorpora varios componentes propios: QA-ViT (características visuales CLIP ViT-B/16 condicionadas por la pregunta), Consformer (autoatención con priors sobre palabras OCR) y las estrategias de entrenamiento DOVE y OACT. El modelo totaliza unos 346 millones de parámetros (fp32, 1,38 GB de pesos) y no declara una longitud de contexto explícita en la información disponible.

El modelo está pensado para investigación y evaluación sobre OpenViVQA; el autor no hace afirmaciones sobre otros conjuntos vietnamitas ni sobre otros idiomas. La licencia no está especificada, lo que constituye un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder ViT5-base con vision QA-ViT (CLIP ViT-B/16) y Consformer sobre fichas OCR; `model_type: openvivqa` |
| Parametros totales | 345.630.410 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32, 1,38 GB) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors; requiere codigo propio, no carga con `AutoModel` |

## Arquitectura y entrenamiento

El modelo parte de VietAI/vit5-base como encoder-decoder y añade un codificador visual basado en openai/clip-vit-base-patch16 con un adaptador con puerta (gated adapter) y una pérdida de grounding, de modo que las características visuales quedan condicionadas por la pregunta (QA-ViT). La entrada del encoder incluye además un bloque de fichas OCR con caja, detección, reconocimiento y características de carácter. Sobre ese bloque actúa Consformer, una autoatención con un prior de constituyentes sobre las palabras OCR y una pérdida de span.

El entrenamiento incorpora dos estrategias: DOVE, que entrena con dos vistas del bloque OCR (la original y una copia "relacionada" con algunas palabras editadas), y OACT (OCR Adversarial Contrastive Training), que añade un paso de ruido a lo largo del signo del gradiente de la pérdida de respuesta (epsilon 0,05 del RMS del token) y una pérdida contrastiva supervisada conjunta sobre cuatro vistas (dos limpias, dos perturbadas, con cabezas de proyección separadas). OACT está activo en este checkpoint (`dove_adv=ocr_both`) pero no se usa en inferencia. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de OpenViVQA.

## Capacidades

- Respuesta visual a preguntas en vietnamita sobre texto presente en la imagen (scene-text VQA).
- Lectura de fichas OCR (texto, caja, detección, reconocimiento y características de carácter) como entrada explícita del encoder.
- Generación de respuestas de forma libre mediante búsqueda por haz (4 haces, hasta 56 tokens nuevos).
- Condicionamiento visual por pregunta mediante QA-ViT.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general fuera de VQA ni modo thinking.
- Capacidad multilingüe limitada al vietnamita; el autor no reclama resultados en otros idiomas.

## Casos de uso

- Digitalización de documentos y formularios: el modelo puede responder preguntas sobre campos escritos en una imagen (por ejemplo, "¿cuál es la fecha de emisión?") usando las fichas OCR como entrada, lo que lo hace adecuado para pipelines de extracción documental en vietnamita.
- Accesibilidad para personas con discapacidad visual: responder preguntas sobre rótulos, carteles o menús en vietnamita leyendo el texto de la escena, aprovechando la combinación de visión y OCR.
- Asistencia en comercio y logística: consultar etiquetas de producto, direcciones o códigos impresos en paquetes mediante preguntas en lenguaje natural, con la ventaja de que el modelo integra explícitamente la detección y el reconocimiento de texto.
- Atención al cliente sobre capturas de pantalla: responder preguntas sobre facturas, recibos o pantallas de aplicaciones en vietnamita, siempre que el OCR previo sea correcto.
- Investigación en VQA vietnamita: servir como línea base o punto de comparación en experimentos sobre OpenViVQA, dado que el autor publica métricas detalladas y el protocolo de evaluación.
- Análisis de cartelería urbana: extraer información de señales y avisos en imágenes para estudios o aplicaciones de movilidad, condicionado a la calidad del OCR de entrada.

## Benchmarks y rendimiento

Resultados sobre OpenViVQA (test: 3.536 preguntas con verdad pública; métrica principal CIDEr; evaluación con `training/benchmark_eval.py` del repositorio de código):

| Metrica | Test | Dev |
|---|---|---|
| Exact Match (EM) | 13,21 | 13,71 |
| F1 (token) | 58,76 | 58,59 |
| F1 (char) | 69,36 | no disponible |
| BLEU-1 | 55,52 | 55,23 |
| BLEU-4 | 41,23 | 41,09 |
| BLEU-avg | 47,85 | no disponible |
| CIDEr | 3,7202 | 3,7568 |
| BERTScore F1 | 85,85 | no disponible |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 346 M parámetros en fp32 los pesos ocupan 1,38 GB, por lo que la VRAM adicional depende del codificador visual CLIP ViT-B/16 y del pipeline OCR.
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo es viable en GPU de consumo, aunque el pipeline completo (OCR, CLIP y generación con haz) añade carga.
- Cabe en GPU de consumo: previsiblemente sí por tamaño del backbone, aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el autor indica que la arquitectura es personalizada y requiere el código del repositorio en el commit `0907f9a` y el notebook `notebooks/twc_colab.ipynb`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViSceT5-OpenViVQA | 345,6 M | no disponible | Scene-text VQA vietnamita | no disponible | Hugging Face + código propio |
| VietAI/vit5-base | no disponible en la información | no disponible | Modelo base de lenguaje vietnamita | no disponible | Hugging Face |
| openai/clip-vit-base-patch16 | no disponible en la información | no disponible | Visión-lenguaje general | no disponible | Hugging Face |

No se dispone en la información proporcionada de modelos comparables específicos de scene-text VQA en vietnamita con métricas publicadas.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente sobre OpenViVQA; no hay garantías sobre otros conjuntos vietnamitas ni sobre otros idiomas.
- La respuesta depende de las fichas OCR: errores u omisiones en el OCR limitan directamente lo que el modelo puede responder.
- Resultados de una sola semilla de entrenamiento, sin validación cruzada.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Arquitectura personalizada (`model_type: openvivqa`): no carga con `AutoModel`; requiere el código del repositorio en el commit indicado, lo que complica la integración en producción.
- Riesgo de alucinación no cuantificado en la información disponible; el EM bajo (13,21 en test) sugiere respuestas literales inexactas con frecuencia.
- No se documentan sesgos conocidos ni limitaciones de contexto más allá de las indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kus669/ViSceT5-OpenViVQA
- Repositorio de código (commit de entrenamiento): https://github.com/Kussssssss/ViSceT5/tree/0907f9a
- Modelo base de lenguaje: https://huggingface.co/VietAI/vit5-base
- Modelo base visual: https://huggingface.co/openai/clip-vit-base-patch16
- Paper: en preparación según el autor, no disponible.
