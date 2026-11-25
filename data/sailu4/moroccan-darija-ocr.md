# sailu4/moroccan-darija-ocr

## Resumen

Moroccan Darija OCR es un modelo de reconocimiento óptico de caracteres (OCR) para líneas de texto árabe impreso, publicado por el usuario sailu4 en Hugging Face. A pesar de su nombre, el checkpoint disponible **no está entrenado en dariya**: es una línea base de árabe estándar entrenada sobre imágenes de líneas de texto del Boletín Oficial marroquí (Moroccan Official Gazette), concebida como punto de partida para una futura adaptación al dariya. El autor lo advierte explícitamente en la model card para evitar que se interprete como un resultado de referencia en dariya.

La arquitectura es deliberadamente compacta: una CNN en escala de grises seguida de una BiLSTM de dos capas y una cabeza CTC. Con solo 1.940.797 parámetros y un checkpoint de 0,2 GB, está pensada para entrenamiento e inferencia en hardware de consumo (el autor cita una RTX 5070). El pipeline es `image-to-text` y el modelo espera imágenes de línea ya recortadas; el reconocimiento de página completa requiere detección de líneas y reconstrucción del orden de lectura por separado.

Su relevancia actual es acotada pero concreta: ofrece un punto de partida reproducible y auditable para OCR de árabe impreso con métricas verificadas (CER 1,49 %, WER 6,94 % en el split de test oficial) y un ecosistema de herramientas de adaptación, auditoría de experimentos y demo local documentado en el repositorio companion de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (grayscale) + BiLSTM de 2 capas + clasificador CTC |
| Parametros totales | 1.940.797 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR de líneas; altura 64 px, anchura máxima de entrada 1600 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe impreso (entrenado en árabe estándar; no entrenado en dariya) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`best.pt`, `torch.load`), vocabulario en `vocab.json` |

Parámetros adicionales de configuración: 92 clases de carácter más el token CTC blank (índice 0), tamaño oculto 128, 32 canales en la CNN.

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas de texto de tipo CRNN: una red convolucional en escala de grises que extrae características verticales de la imagen de línea, seguida de una BiLSTM de dos capas con tamaño oculto 128 que modela la secuencia temporal, y una capa de clasificación CTC sobre 92 caracteres más el blank. La entrada se normaliza a altura 64 px y anchura máxima 1600 px. La decodificación reportada es CTC greedy sin modelo de lenguaje.

El entrenamiento se realizó sobre imágenes de líneas de texto árabe impreso del Boletín Oficial marroquí, procedentes del corpus publicado en Zenodo con DOI 10.5281/zenodo.21702529 bajo CC BY 4.0. No se documenta en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables habitualmente a OCR). El checkpoint incluye estado del optimizador, del scheduler y del AMP scaler, lo que permite reanudar el entrenamiento.

El autor documenta además dos experimentos sintéticos de adaptación a dariya: un subconjunto de 5.000 frases DODa en escritura árabe renderizadas con fuentes árabes (4.500 líneas de entrenamiento, 500 de validación) que alcanzó 2,21 % CER, 9,92 % WER y 61,4 % de exactitud de línea tras tres épocas en RTX 5070, y un run filtrado sobre texto de Atlas con 5.329 líneas renderizadas que alcanzó 6,63 % CER, 15,01 % WER y 15,20 % de exactitud de línea. Ambos son pruebas de pipeline sobre datos sintéticos, no evaluaciones sobre documentos reales.

## Capacidades

- Reconocimiento de texto árabe impreso en imágenes de línea ya recortadas (image-to-text).
- Salida de transcripción a nivel de línea mediante decodificación CTC greedy.
- Manejo de 92 clases de carácter árabe más el token blank.
- Carga del checkpoint con vocabulario y configuración embebidos, lo que facilita la reanudación de entrenamiento.
- Adaptación a nuevos dominios o alfabetos mediante ajuste fino, con herramientas de preparación de pares línea-transcripción en el repositorio companion.
- Reconocimiento de página completa (single-column) a través del reconocedor compartido del repositorio, que añade detección de líneas y exportación a JSON/TXT.
- Interfaz local Gradio opcional para pruebas de inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking: es un modelo especializado exclusivamente en OCR.

## Casos de uso

- Digitalización de boletines oficiales: el modelo reconoce líneas de texto impreso del Boletín Oficial marroquí con un CER del 1,49 % en el split de test, por lo que es adecuado para pipelines de digitalización de documentos legales con revisión humana posterior.
- Creación de corpus OCR de árabe impreso: sirve como línea base reproducible para comparar futuras mejoras (modelos con LM, arquitecturas transformer, adaptaciones a dariya) sobre el mismo split de test de 1.212 líneas.
- Punto de partida para adaptación al dariya: el repositorio companion incluye utilidades para preparar pares línea-transcripción y filtrar texto multlínea, de modo que un equipo puede ajustar el checkpoint con datos reales de dariya.
- Extracción de texto en pipelines documentales: al ser un modelo de 1,9 M de parámetros y 0,2 GB, puede desplegarse en CPU o en una GPU de consumo dentro de un servicio de preprocesado que alimente etapas posteriores de NLP.
- Prototipado e investigación educativa: el proyecto incluye un curso completo en francés sobre CNN, BiLSTM, alineamiento CTC, renderizado árabe y evaluación, con 12 ejercicios y 10 preguntas de entrevista, útil para formar a desarrolladores en OCR.
- Pruebas de integración en aplicaciones locales: la demo Gradio y el reconocedor de página permiten validar el flujo completo (detección de líneas, reconocimiento, exportación) antes de invertir en infraestructura mayor.
- Auditoría de datasets OCR: las herramientas de auditoría de experimentos del repositorio permiten detectar fugas entre train y validación y verificar la calidad de corpus sintéticos antes de entrenar.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test oficial de 1.212 líneas del Boletín Oficial (árabe impreso, decodificación CTC greedy sin modelo de lenguaje):

| Metrica | Valor |
|---|---|
| CER | 1,49 % |
| WER | 6,94 % |
| Exactitud de línea exacta | 51,65 % |

Resultados de experimentos sintéticos de adaptación a dariya (no son benchmarks sobre documentos reales):

| Experimento | Lineas | CER | WER | Exactitud de linea |
|---|---|---|---|---|
| DODa sintetico (3 epocas, RTX 5070) | 4.500 train / 500 val | 2,21 % | 9,92 % | 61,4 % |
| Atlas filtrado sintetico (3 epocas, RTX 5070) | 5.329 lineas renderizadas | 6,63 % | 15,01 % | 15,20 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,94 M de parámetros el checkpoint ocupa aproximadamente 0,2 GB en FP32, por lo que cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; el autor cita una RTX 5070 para entrenamiento y verifica inferencia en CPU y en RTX 5070.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`), demo Gradio del repositorio companion y el reconocedor de línea/página compartido. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a esta arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | CER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moroccan Darija OCR (este) | 1,94 M | línea de 64 px alto × 1600 px ancho | 1,49 % (árabe impreso, test propio) | no disponible | Hugging Face + GitHub |
| Tesseract (ara) | no disponible | página completa | no disponible | Apache 2.0 | open source |
| EasyOCR (árabe) | no disponible | línea / región | no disponible | Apache 2.0 | open source |
| PaddleOCR (árabe) | no disponible | detección + reconocimiento | no disponible | Apache 2.0 | open source |

No se dispone de datos de benchmarks comparativos homogéneos entre estos sistemas en la información proporcionada; la comparación debe hacerse sobre el mismo corpus de test para ser válida.

## Limitaciones y advertencias

- **No es un modelo de dariya**: el autor advierte explícitamente que no fue entrenado en dariya y que no debe presentarse como resultado de referencia en dariya.
- Solo reconoce líneas ya recortadas; el reconocimiento de página completa requiere detección de líneas y reconstrucción del orden de lectura por separado.
- Decodificación CTC greedy sin modelo de lenguaje: la exactitud de línea exacta es del 51,65 %, lo que implica que casi la mitad de las líneas contienen al menos un error de carácter.
- Los resultados de adaptación a dariya son sintéticos y exploratorios; la auditoría del propio autor identificó cambios en la composición de validación entre runs, párrafos de Atlas compartidos entre train y validación y omisión de signos vocálicos en el renderizado sintético histórico.
- La licencia no está disponible en la información proporcionada, por lo que no se puede confirmar el uso comercial; el corpus de origen se anuncia bajo CC BY 4.0, pero la licencia del modelo es independiente.
- Riesgo de alucinación y sesgo: no documentado en la información disponible; en OCR el riesgo se manifiesta como sustituciones y omisiones de caracteres, no como texto inventado de forma generativa.
- Idiomas soportados: solo árabe impreso; no se documenta soporte multilingüe.
- No apto para documentos manuscritos, texto en otros alfabetos ni imágenes de baja calidad sin preprocesado.

## Enlaces

- Hugging Face: https://huggingface.co/sailu4/moroccan-darija-ocr
- Repositorio GitHub companion: https://github.com/BADR-JOULAlI/moroccan-darija-ocr
- Guía de uso: https://github.com/BADR-JOULAlI/moroccan-darija-ocr/blob/main/arabic_ocr/docs/USAGE.md
- Auditoría de experimentos: https://github.com/BADR-JOULAlI/moroccan-darija-ocr/blob/main/arabic_ocr/docs/EXPERIMENT_AUDIT.md
- Curso de teoría e implementación (francés): https://github.com/BADR-JOULAlI/moroccan-darija-ocr/blob/main/arabic_ocr/docs/COURS_OCR.md
- PDF del curso: docs/cours_moroccan_darija_ocr.pdf (en el repositorio)
- Corpus del Boletín Oficial (Zenodo, CC BY 4.0): https://doi.org/10.5281/zenodo.21702529
