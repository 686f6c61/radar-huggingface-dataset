# arlenecc/OvisOCR2-0.8B-MLX-4bit

## Resumen

OvisOCR2-0.8B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo ATH-MaaS/OvisOCR2, un VLM especializado en OCR y parsing de documentos de aproximadamente 853 millones de parámetros. La conversión la ha realizado el usuario arlenecc mediante `mlx-vlm` 0.6.8 sobre `mlx` 0.32.0, con el objetivo de permitir la inferencia en Apple Silicon (chips M-series) con un consumo de memoria reducido. El modelo base pertenece a la familia arquitectónica Qwen3.5, según las etiquetas del repositorio.

El problema que resuelve es concreto: transcribir documentos (facturas, informes de laboratorio, etiquetas de envío, recibos, hojas de datos técnicas) a Markdown o HTML estructurado, preservando contenido y valores numéricos. La cuantización a 4 bits reduce el peso en disco a 0,63 GB y permite decodificar a 220,3 tok/s en un M2 Pro, frente a 91,0 tok/s del modelo bf16 original, con una precisión de campo del 96,77 % y una recall numérica del 100 % según las mediciones del autor.

Es relevante ahora porque demuestra un flujo de cuantización con verificación de fidelidad medida (no asumida) sobre un modelo OCR pequeño, y porque expone con transparencia las limitaciones del proceso: el modelo base degenera en texto conversacional general, no se han ejecutado benchmarks OCR estándar y las pruebas se hicieron sobre documentos sintéticos renderizados con una fuente por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), familia qwen3_5 |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64; 5,863 bits efectivos por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 0,63 GB en disco |
| Torres cuantizadas | 187 tensores del modelo de lenguaje (4-bit); 153 tensores de la torre de visión en bf16 |
| Embeddings | atados (input/output); el embedding representa el 33,8 % de los parámetros cuantizados |
| Libreria de inferencia | mlx-vlm 0.6.8 / mlx 0.32.0 |

## Arquitectura y entrenamiento

El modelo base ATH-MaaS/OvisOCR2 es un VLM de ~853 M de parámetros con una torre de visión y un modelo de lenguaje de arquitectura transformer de la familia Qwen3.5. La ficha del repositorio cuantizado no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card del modelo fuente, que no se ha incluido en la información disponible.

La innovación técnica de esta ficha no está en el entrenamiento sino en el proceso de cuantización y su verificación. `mlx-vlm` cuantiza únicamente el modelo de lenguaje y deja la torre de visión en bf16, lo que eleva los bits efectivos por peso a 5,863 pese a la nominal de 4 bits. El autor verificó que ninguno de los 153 tensores de visión lleva entrada `.scales`, y midió la fidelidad a nivel de peso (SNR, L2 relativo, coseno) tensor a tensor, además de evaluar la transcripción contra ground truth conocido en cinco documentos sintéticos. No se realizó entrenamiento ni fine-tuning: es una conversión de formato y cuantización.

## Capacidades

- Transcripción OCR de documentos a Markdown o HTML estructurado.
- Parsing de documentos con tablas, líneas de artículos, divisas, fechas e identificadores.
- Preservación de valores numéricos: el 100 % de los 77 números de ground truth se conservan en todas las variantes.
- Procesamiento de imágenes como entrada (pipeline `image-text-to-text`).
- Salida conversacional multimodal (etiqueta `conversational`).
- Generación de tablas HTML cuando se solicita estructura tabular.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; las pruebas se limitaron a documentos con texto latino.
- No se documenta modo thinking, audio ni visión más allá del OCR de documentos.

## Casos de uso

- Digitalización de facturas: el modelo transcribe líneas de artículos, importes y divisas a Markdown o HTML; su recall numérico del 100 % en las pruebas lo hace adecuado para pipelines de contabilidad donde los importes son el dato crítico.
- Extracción de informes de laboratorio clínico: convierte tablas de resultados con valores y unidades en estructura procesable, aprovechando que preserva el contenido íntegro incluso a 4 bits.
- Lectura de etiquetas de envío: extrae identificadores, direcciones y códigos de seguimiento de documentos con campos delimitados; la precisión de campo del 96,77 % a 4 bits es suficiente si se post-procesa la salida.
- Procesamiento de recibos y tickets: transcripción rápida en local sobre Apple Silicon (220,3 tok/s en M2 Pro, 0,86 GB de RAM pico), adecuada para aplicaciones de escritorio o móviles que no pueden enviar documentos a la nube.
- Parseo de hojas de datos técnicas: extrae especificaciones numéricas de datasheets de componentes electrónicos, escenario en el que los números constituyen el payload y la recall numérica es el criterio principal.
- Prototipado y evaluación de pipelines OCR en Mac: sirve como modelo de referencia ligero para validar extracción de documentos antes de escalar a modelos mayores, con un coste de memoria de 0,86 GB y tiempos de decodificación medidos.
- Conversión por lotes en local: al caber en 0,63 GB de disco y 0,86 GB de RAM pico, permite procesar lotes de documentos en un portátil sin GPU dedicada.

## Benchmarks y rendimiento

El autor no reporta benchmarks OCR estándar (OmniDocBench, DocVQA) ni métricas distribucionales (perplejidad, top-1 agreement, KL), que indica haber ejecutado pero no publicado deliberadamente por la degeneración del modelo base en prosa general. Los datos disponibles son mediciones de fidelidad de cuantización y de precisión OCR contra ground truth sintético.

Fidelidad a nivel de peso (frente a bf16):

| Variante | bpw | SNR | L2 relativo | Coseno | CER vs bf16 | Decode tok/s | RAM pico |
|---|---|---|---|---|---|---|---|
| 4-bit | 5,863 | 20,58 dB | 9,35 % | 0,995632 | 0,3311 | 220,3 | 0,86 GB |
| 6-bit | 7,626 | 32,84 dB | 2,28 % | 0,999740 | 0,0000 | 183,5 | 1,08 GB |
| 8-bit | 9,389 | 42,67 dB | 0,74 % | 0,999973 | 0,0000 | 160,9 | 1,31 GB |
| bf16 (fuente) | 16 | n/a | n/a | n/a | 0,0000 | 91,0 | 1,83 GB |

Precisión OCR contra ground truth (cinco documentos sintéticos):

| Variante | Precisión de campo | Precisión de contenido | Recall numérico | CER vs bf16 |
|---|---|---|---|---|
| 4-bit | 0,9677 | 1,0000 | 1,0000 | 0,3311 |
| 6-bit | 1,0000 | 1,0000 | 1,0000 | 0,0000 |
| 8-bit | 1,0000 | 1,0000 | 1,0000 | 0,0000 |
| bf16 (fuente) | 1,0000 | 1,0000 | 1,0000 | 0,0000 |

El CER de 0,3311 en 4 bits se debe a que el modelo emite una tabla HTML donde bf16 emite Markdown, no a pérdida de contenido: el único fallo de coincidencia estricta en los cinco documentos es `WidgetA` frente a `Widget A` (un espacio omitido). Mediciones realizadas en un M2 Pro de 32 GB con decodificación greedy.

## Requisitos de hardware

- RAM pico medida en inferencia: 0,86 GB (4-bit), 1,08 GB (6-bit), 1,31 GB (8-bit), 1,83 GB (bf16).
- Tamaño en disco del repositorio: 0,6 GB.
- Hardware de referencia: Apple Silicon M2 Pro con 32 GB; es el único chip con cifras medidas.
- Cabe holgadamente en cualquier Mac con chip M-series; no se han publicado mediciones para GPU NVIDIA (A100, H100, RTX 4090) ni para CPU x86.
- Despliegue: `mlx-vlm` (versión 0.6.8 con `mlx` 0.32.0). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es MLX.
- Throughput medido (decodificación greedy, M2 Pro): 220,3 tok/s (4-bit), 183,5 tok/s (6-bit), 160,9 tok/s (8-bit), 91,0 tok/s (bf16).
- Latencia: no disponible más allá del throughput de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OvisOCR2-0.8B-MLX-4bit (esta ficha) | ~853 M | no disponible | 4-bit affine, 5,863 bpw | Apache 2.0 | Hugging Face, MLX |
| OvisOCR2-6bit | ~853 M | no disponible | 6-bit, 7,626 bpw | Apache 2.0 | Hugging Face, MLX |
| OvisOCR2-8bit | ~853 M | no disponible | 8-bit, 9,389 bpw | Apache 2.0 | Hugging Face, MLX |
| ATH-MaaS/OvisOCR2 (bf16) | ~853 M | no disponible | bf16 | Apache 2.0 | Hugging Face |

Las tres variantes cuantizadas y el modelo fuente comparten arquitectura y parámetros; la diferencia está en el compromiso entre fidelidad, velocidad y memoria. La 4-bit es la más rápida (220,3 tok/s) y la más ligera (0,86 GB), pero altera el formato de salida; la 6-bit y la 8-bit son caracter-identical a bf16 en las pruebas realizadas. No se dispone de datos de benchmarks que permitan comparar con otros modelos OCR de la misma categoría.

## Limitaciones y advertencias

- El modelo base degenera en texto conversacional general: ante la pregunta por la capital de Japón emite `Tokyo / Nara / Nara / Nara ...`. No debe usarse como chatbot.
- La perplejidad del modelo fuente varía 49,3 veces entre pasajes de prosa ordinaria, lo que refleja un desajuste de dominio, no un error de cuantización.
- Las pruebas OCR se hicieron sobre cinco documentos sintéticos renderizados con una fuente por defecto: no cubren fotografías, escritura manual, escaneos inclinados ni alfabetos no latinos.
- No hay benchmarks OCR estándar (OmniDocBench, DocVQA) ni CER contra un dataset público.
- La variante 4-bit no produce salida byte-estable: emite HTML donde bf16 emite Markdown. Si se necesita Markdown idéntico al original, debe usarse la 6-bit.
- No se evaluó la calidad juzgada por humanos ni la estructura de layout (orden de lectura, celdas combinadas).
- El throughput solo está medido en un M2 Pro; no hay cifras para otras GPU.
- El embedding supone el 33,8 % de los parámetros cuantizados, por lo que el error de pesos está dominado por el embedding más que por las capas de atención.
- Licencia Apache 2.0, que permite uso comercial, pero los derechos y condiciones del modelo fuente deben verificarse en su model card.
- Riesgo de alucinación en documentos fuera de distribución no cuantificado.
- Sesgos conocidos: no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arlenecc/OvisOCR2-0.8B-MLX-4bit
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Variante 4-bit (mlx-community): https://huggingface.co/mlx-community/OvisOCR2-4bit
- Variante 6-bit (mlx-community): https://huggingface.co/mlx-community/OvisOCR2-6bit
- Variante 8-bit (mlx-community): https://huggingface.co/mlx-community/OvisOCR2-8bit
- Perfil del autor: https://huggingface.co/arlenecc
- Perfil del autor del modelo base: https://huggingface.co/ATH-MaaS
