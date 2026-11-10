# INGMUYLEANG/chakkhu-ocr

## Resumen

Chakkhu (ចក្ខុ, "ojo" en jemer) es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto en jemer e inglés, desarrollado por Ing Muyleang. Con 18,56 millones de parámetros, resuelve el problema de transcribir texto jemer impreso —incluidos subíndices y vocales dibujadas a la izquierda— en el orden tipográfico correcto, algo que los motores OCR genéricos suelen fallar por la complejidad del sistema de escritura jemer. Es relevante porque ofrece un CER del 5,52 % en el benchmark KHOB completo (4.018 líneas reales nunca vistas en entrenamiento), superando a Tesseract 5 (20,74 %) y ligeramente a Netra-OCR (6,09 %) en errores de carácter, con un coste computacional muy bajo.

La arquitectura combina un extractor CNN basado en bloques ResNet con un codificador Transformer de 6 capas y dos cabezas de salida: una CTC por columna y un decodificador autorregresivo de 3 capas que emite clústeres de letras jemer completos. El modelo funciona en CPU (~120 ms por línea) y en GPU (~19 ms por línea), lo que lo hace viable para despliegues sin acelerador dedicado.

El modelo se distribuye con licencia Apache-2.0, soporta jemer e inglés, y está pensado para una imagen por línea de texto; para páginas completas es necesario segmentar previamente las líneas. Su punto débil son las líneas exclusivamente en inglés o numéricas y las fotografías nocturnas de carteles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (bloques ResNet) + Transformer encoder de 6 capas (d=320) con cabeza CTC y decodificador autorregresivo de 3 capas |
| Parámetros totales | 18.562.218 (18,56 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa una línea de imagen de 64 px de alto; longitud en caracteres no especificada) |
| Tipos de cuantización | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Jemer (km) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El pipeline de inferencia parte de una imagen de línea en escala de grises de 64 px de alto. Un extractor CNN con bloques ResNet reduce la imagen a una rejilla de 2 filas × W/8 columnas. Sobre esa secuencia actúa un Transformer encoder de 6 capas con dimensión 320 que ve la línea completa. A partir de la representación del encoder hay dos cabezas: una CTC que emite por columna un clúster de letras o un token en blanco (borrador rápido con el recuento de letras), y un decodificador de 3 capas que escribe un clúster jemer por paso y que fue preentrenado como modelo de lenguaje sobre texto jemer. La decodificación combina ambas cabezas: el decodificador genera sus 4 mejores hipótesis por beam search, se añade el borrador CTC y cada hipótesis se puntúa con `0.5 · CTC + 0.5 · decodificador`, lo que penaliza tanto repeticiones u omisiones (mala puntuación CTC) como vocales ausentes (mala puntuación del decodificador). Este esquema redujo el CER del 7,49 % al 5,52 % frente al decodificador solo. El vocabulario tiene 3.402 tokens (clústeres jemer, latinos, dígitos y puntuación), con retroceso a caracteres individuales para clústeres raros.

El entrenamiento usó aproximadamente 3,3 M + 1,1 M de líneas vistas (unas 4 horas en una GPU). La composición de datos fue: 50 % líneas sintéticas generadas por el autor a partir de frases jemer del proyecto Akkhara, palabras inglesas, números, precios y fechas, con 35 fuentes abiertas jemer/latinas y 7 estilos de imagen (documento, escaneo, comprimido por Messenger, captura de pantalla, foto, noche, impresión pequeña borrosa); 25 % del dataset `Chanrith123333/khmer_english_ocr_image_line` (CC BY 4.0); 15 % de `SoyVitou/62k-images-khmer-printed-dataset` (MIT); y 10 % de `Sokheng/khmer-synthetic-ocr-v1-100k` (CC BY 4.0). La función de pérdida fue `0.3 · CTC + 0.7 · entropía cruzada`, con optimizador AdamW, precisión bf16 y batch de 96. Las fuentes proceden de Google Fonts bajo SIL Open Font License 1.1. El conjunto de test KHOB (MIT) nunca se usó para entrenar.

## Capacidades

- Reconocimiento de texto impreso en jemer e inglés a partir de imágenes de una sola línea.
- Escritura de clústeres jemer completos en un solo paso de decodificación, preservando el orden tipográfico de subíndices y vocales dibujadas a la izquierda (por ejemplo, ស្ត្រី se emite como un único paso).
- Manejo de dígitos, puntuación y vocabulario latino dentro de la misma línea.
- Robustez ante distintos estilos de imagen: documentos limpios, escaneos, fotos de móvil, capturas de pantalla, imágenes comprimidas por mensajería y carteles callejeros.
- Modo rápido con solo la cabeza CTC (`beam=0`), que prioriza velocidad sobre precisión.
- Ejecución en CPU sin acelerador; también soporta GPU (`device="cuda"`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión general (más allá de OCR de líneas), audio ni modo de pensamiento.

## Casos de uso

- Digitalización de documentos jemer: dado un escaneo de un contrato o formulario, se segmenta en líneas y se transcribe cada una con el modelo; su CER del 3,14 % en escaneos lo hace adecuado para archivos administrativos y registros históricos.
- Procesamiento de capturas de pantalla y mensajes de Messenger: con un CER del 3,94 % en imágenes comprimidas por Messenger, sirve para extraer texto de conversaciones y capturas compartidas en flujos de atención al cliente o moderación.
- Lectura de fotos de papel tomadas con el móvil: el modelo mantiene un CER del 4,55 % en imágenes fotografiadas con teléfono, útil para aplicaciones móviles de digitalización de recibos, notas y documentos personales.
- Extracción de datos de carteles y señalética urbana: aunque es su punto más débil (CER del 7,71 % de día y 11,93 % de noche), puede emplearse en tareas de inventario urbano o accesibilidad con revisión humana posterior.
- Transcripción de líneas cortas (≤ 10 caracteres): con un CER del 11,4 %, muy por debajo de Tesseract (51,7 %) y Netra-OCR (22,6 %), es adecuado para etiquetas, códigos, titulares y rótulos breves.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU a ~120 ms por línea, permite desplegar pipelines de digitalización masiva en infraestructura convencional sin coste de aceleradores.
- Integración en aplicaciones de accesibilidad: lectura en voz alta de texto jemer impreso capturado con la cámara del dispositivo, con latencia de ~19 ms por línea en GPU.

## Benchmarks y rendimiento

Resultados en el benchmark KHOB (4.018 líneas reales, nunca usadas en entrenamiento), con el mismo script, recortes y normalización NFC para todos los modelos:

| Modelo | CER ↓ | Líneas totalmente correctas ↑ |
|---|---|---|
| Tesseract 5 (khm+eng, mejor configuración) | 20,74 % | 16,2 % |
| Netra-OCR | 6,09 % | 54,7 % |
| Chakkhu | 5,52 % | 52,6 % |

Desglose por tipo de imagen (CER %):

| Tarea KHOB | Tesseract 5 | Netra-OCR | Chakkhu |
|---|---|---|---|
| Documento limpio | 13,09 | 5,33 | 3,27 |
| Enviado por Messenger | 14,16 | 6,40 | 3,94 |
| Escaneado | 14,02 | 4,87 | 3,14 |
| Escaneado con móvil | 19,32 | 4,43 | 4,55 |
| Calle, día | 31,84 | 5,86 | 7,71 |
| Calle, noche | 35,30 | 10,69 | 11,93 |
| Líneas cortas (≤ 10 caracteres) | 51,7 | 22,6 | 11,4 |
| Solo inglés / números | 40,8 | 22,0 | 24,5 |

El peso CTC de 0,5 se fijó antes de la evaluación; con 0,3 y 0,7 el CER es de 5,68 % y 5,58 % respectivamente. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 18,56 M de parámetros en precisión completa (fp32) el modelo ocupa aproximadamente 74 MB, y en bf16 unos 37 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM; el autor cita ejecución en GPU con `load(folder, device="cuda")` sin especificar modelos concretos. Funciona en RTX 4090, A100, H100 y GPUs de gama baja.
- CPU: el modelo está diseñado para ejecutarse en CPU (~120 ms por línea en un portátil), por lo que no requiere GPU.
- Opciones de despliegue: PyTorch con `torch`, `pillow`, `safetensors` y `huggingface_hub` mediante `snapshot_download`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~120 ms por línea en CPU de portátil y ~19 ms por línea en GPU, según el autor. El throughput agregado no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER en KHOB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chakkhu | 18,56 M | Jemer, inglés | 5,52 % | Apache-2.0 | Hugging Face |
| Netra-OCR | No disponible | Jemer, inglés | 6,09 % | No disponible | No disponible |
| Tesseract 5 (khm+eng) | No disponible | Jemer, inglés | 20,74 % | Apache-2.0 | Open source |

Chakkhu supera a Tesseract 5 en todas las categorías salvo en líneas de solo inglés/números (24,5 % frente a 40,8 %, donde aun así gana) y es ligeramente mejor que Netra-OCR en CER global y en documentos limpios, escaneos y líneas cortas, mientras que Netra-OCR obtiene mejores resultados en fotos de calle (día y noche) y en líneas totalmente correctas (54,7 % frente a 52,6 %). No se dispone de datos de parámetros ni licencia de Netra-OCR en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento débil en carteles callejeros con fuentes decorativas y en fotografías nocturnas (CER del 7,71 % y 11,93 % respectivamente), por debajo de Netra-OCR en esas categorías.
- Peor rendimiento en líneas exclusivamente en inglés o numéricas (CER del 24,5 %) que en jemer.
- No entrenado para escritura manuscrita.
- Requiere una imagen por línea de texto; para páginas completas es necesario un segmentador de líneas previo (el demo incluye uno simple para bloques impresos).
- El vocabulario de 3.402 tokens hace retroceder a caracteres individuales en clústeres raros, lo que puede degradar la coherencia en texto poco frecuente.
- Riesgo de alucinación no documentado explícitamente, pero inherente a los decodificadores autorregresivos; el esquema de puntuación dual mitiga repeticiones descontroladas en líneas largas.
- Sesgos conocidos no documentados por el autor.
- Licencia Apache-2.0 permite uso comercial con atribución a Ing Muyleang (Chakkhu); no se especifican restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/chakkhu-ocr
- Demo: https://huggingface.co/spaces/INGMUYLEANG/chakkhu-demo
- Benchmark KHOB: https://github.com/EKYCSolutions/khmer-ocr-benchmark-dataset
- Dataset Akkhara: https://huggingface.co/datasets/INGMUYLEANG/akkhara-sing-khmer
- Dataset Chanrith123333/khmer_english_ocr_image_line: https://huggingface.co/datasets/Chanrith123333/khmer_english_ocr_image_line
- Dataset SoyVitou/62k-images-khmer-printed-dataset: https://huggingface.co/datasets/SoyVitou/62k-images-khmer-printed-dataset
- Dataset Sokheng/khmer-synthetic-ocr-v1-100k: https://huggingface.co/datasets/Sokheng/khmer-synthetic-ocr-v1-100k
