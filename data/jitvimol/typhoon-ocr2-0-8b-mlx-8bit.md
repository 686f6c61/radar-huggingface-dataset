# jitvimol/typhoon-ocr2-0.8b-mlx-8bit

## Resumen

Typhoon OCR V2 0.8B es un modelo vision-language (VLM) de 0,8 mil millones de parametros especializado en el parseo estructurado de documentos en tailandes e ingles, desarrollado por Typhoon (SCB 10X). Dada una imagen de pagina, devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria, bounding box y contenido textual, con tablas en HTML, formulas en LaTeX y texto en Markdown. Es un fine-tune de ATH-MaaS/OvisOCR2 sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`).

Este repositorio concreto es una conversion **no oficial** del modelo original al formato MLX, realizada por el usuario `jitvimol`, para inferencia local en Macs con Apple Silicon, incluido LM Studio. Aplica cuantizacion afin de 8 bits con group size 64 (9,4 bits por peso en promedio, al incluir escalas y componentes sin cuantizar), ocupa 0,98 GB en disco y consume aproximadamente 1,8 GB de memoria en imagenes de pagina tipicas.

Su relevancia es doble: por un lado, el modelo base demuestra que un VLM de menos de mil millones de parametros puede competir en comprension de documentos tailandeses con layouts complejos y contenido mixto; por otro, esta conversion permite ejecutar ese parseo en hardware de consumo Apple sin depender de infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-language transformer |
| Parametros totales | 852.985.920 (0,85 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine (group size 64); variante bfloat16 del mismo autor |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo original) |
| Formato de pesos | safetensors (MLX), libreria `mlx`; tamano del repo 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un VLM basado en la arquitectura Qwen3.5, con un codificador visual acoplado a un decoder de lenguaje, y se presenta como fine-tune de ATH-MaaS/OvisOCR2. El entrenamiento se realizo sobre un conjunto fijo de prompts de parseo de pagina completa, con categorias de layout predefinidas (header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer) y reglas de formato de salida (HTML para tablas, LaTeX para formulas, Markdown para el resto). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La conversion a MLX no introduce entrenamiento adicional: solo cambia el dtype y aplica cuantizacion afin de 8 bits con group size 64 mediante `mlx-vlm 0.7.12`. Segun el autor de la conversion, esta variante usa aproximadamente un 40 % menos de memoria y es mas rapida que la variante bfloat16.

## Capacidades

- Parseo de documentos de pagina completa en tailandes e ingles con salida JSON estructurada.
- Deteccion de layout con bounding boxes en formato `[x1, y1, x2, y2]` y categorizacion de 13 tipos de elementos.
- Extraccion de texto en orden de lectura humano.
- Conversion de tablas a HTML y de formulas a LaTeX.
- Formateo de texto general como Markdown.
- Procesamiento de capturas de pantalla y paginas con contenido embebido (con limitaciones en texto pequeno).
- Inferencia local en Apple Silicon mediante MLX y LM Studio.
- No dispone de tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso documentadas.

## Casos de uso

- **Digitalizacion de archivos administrativos tailandeses**: el modelo devuelve cada bloque de texto con su bbox y categoria, lo que permite reconstruir el documento en un editor o base de datos conservando la estructura de cabeceras, pies y notas.
- **Extraccion de tablas financieras**: al formatear tablas como HTML, la salida se puede parsear directamente con librerias como BeautifulSoup o pandas para volcar filas y columnas a hojas de calculo o sistemas contables.
- **Conversion de articulos cientificos con formulas**: las formulas se emiten en LaTeX, lo que facilita su reutilizacion en editores como Overleaf o en pipelines de publicacion sin retranscripcion manual.
- **Procesamiento por lotes en un Mac**: con 1,8 GB de memoria en uso y 0,98 GB en disco, se pueden encolar cientos de paginas en un Mac con Apple Silicon sin GPU dedicada, usando `mlx-vlm` desde linea de comandos.
- **Prototipado rapido en LM Studio**: investigadores pueden cargar la pagina como imagen en el chat, fijar temperatura 0 y obtener JSON valido para evaluar la calidad del parseo antes de integrarlo en un pipeline mayor.
- **Indexacion de documentos bilingues para RAG**: la salida estructurada por categorias permite trocear el documento en fragmentos semanticos (titulos, secciones, tablas) antes de generar embeddings, mejorando la recuperacion en corpus tailandes-ingles.
- **Auditoria de capturas de pantalla de aplicaciones**: en capturas de chat tailandesas el texto principal se lee correctamente, lo que sirve para extraer conversaciones y revisar contenido de soporte al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible para esta conversion. La model card original del modelo base reporta que el 0.8B obtiene 36,4 en ThaiOCRBench frente a 40,5 de Typhoon OCR 1.5 en tareas generales de question answering, y la documentacion de Typhoon afirma que la familia Typhoon OCR supera a GPT-5 y Gemini 2.5 Flash en comprension de documentos tailandeses con layouts complejos. La evaluacion informal de esta conversion (dos paginas impresas tailandesas y seis capturas de chat de 500 px) indica: JSON valido en todas las salidas, sin bucles de repeticion, similitud del 98-99 % entre LM Studio y mlx-vlm en las paginas de documento, y una omision de una tarjeta embebida en una de las seis capturas respecto a bfloat16.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 1,8 GB de memoria pico para imagenes de pagina tipicas con `mlx-vlm`; imagenes grandes requieren mas.
- Almacenamiento: 0,98 GB en disco para los pesos cuantizados a 8 bits.
- GPU: orientado a Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensado para CUDA; para A100, H100 o RTX 4090 habria que usar el modelo original en formato transformers o una conversion GGUF.
- GPU de consumo: cabe sobradamente en cualquier Mac con Apple Silicon; en GPUs NVIDIA de consumo requeriria el formato original o una conversion alternativa.
- Despliegue: `mlx-vlm` 0.7.12 o superior, LM Studio; no se documentan vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Latencia y throughput: no disponibles de forma cuantificada; el autor indica que la variante 8-bit es mas rapida que bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon OCR V2 0.8B (esta conversion MLX) | 0,85 B | no disponible | OCR/parseo de documentos th/en, local en Apple Silicon | Apache-2.0 | Hugging Face (MLX) |
| typhoon-ai/typhoon-ocr2-0.8b (original) | 0,85 B | no disponible | OCR/parseo de documentos th/en | Apache-2.0 | Hugging Face (transformers) |
| Typhoon OCR 1.5 | no disponible | no disponible | OCR tailandes, rendimiento superior en QA general (40,5 vs 36,4 en ThaiOCRBench) | no disponible en la informacion | OpenTyphoon.ai |
| ATH-MaaS/OvisOCR2 | no disponible | no disponible | OCR base del que deriva el fine-tune | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- **Errores de transcripcion**: el modelo original ya comete fallos en texto tailandes (caracteres, tonos o vocales sustituidos); no se debe confiar en valores criticos como numeros de cuenta, importes o nombres sin verificacion.
- **Bounding boxes en LM Studio**: LM Studio no permite el ajuste `max_pixels` que recomienda la model card original (hasta 16,7 megapixels), por lo que paginas grandes pueden reducirse y alterar el numero y tamano de los elementos de layout.
- **Repeticion**: el modelo puede repetir texto hasta agotar el limite de tokens; se recomienda temperatura 0 y un `max_tokens` acotado.
- **Alcance limitado**: el autor original lo recomienda solo como parser de pagina completa; es mucho mas debil en otras tareas y no tiene filtrado de seguridad, pudiendo generar texto que no aparece en la imagen.
- **Efecto de la cuantizacion**: en la evaluacion informal, la variante 8-bit omitio una tarjeta embebida completa que bfloat16 leyo correctamente, lo que sugiere que la cuantizacion afecta mas al OCR que a tareas conversacionales.
- **Texto pequeno**: texto diminuto o contenido dentro de imagenes embebidas (resguardos de transferencia, tarjetas de pago) se lee de forma frecuentemente corrupta u omitida.
- **Licencia**: Apache-2.0 permite uso comercial, pero esta conversion es no oficial y no esta afiliada ni respaldada por los autores originales.
- **Idiomas**: solo tailandes e ingles; no hay soporte documentado para castellano ni otras lenguas.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/jitvimol/typhoon-ocr2-0.8b-mlx-8bit
- Modelo original: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Model card original (README): https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b/blob/main/README.md
- Modelo base del fine-tune: https://huggingface.co/ATH-MaaS/OvisOCR2
- Documentacion de modelos Typhoon: https://docs.opentyphoon.ai/en/models/
- Pagina del producto Typhoon OCR: https://opentyphoon.ai/model/typhoon-ocr
- Sitio de Typhoon (SCB 10X): https://opentyphoon.ai/
- Libreria MLX: https://github.com/ml-explore/mlx
- LM Studio: https://lmstudio.ai
