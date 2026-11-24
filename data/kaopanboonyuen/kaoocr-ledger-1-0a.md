# kaopanboonyuen/KaoOCR-Ledger-1.0a

## Resumen

KaoOCR-Ledger-1.0a es un modelo vision-a-texto de 630,8 millones de parámetros desarrollado por kaopanboonyuen, especializado en la extracción de contenido estructurado en Markdown a partir de imágenes de documentos, con especial énfasis en escritura manuscrita tailandesa. Se construye sobre NVIDIA Nemotron 3.5 Parse, del que hereda el codificador visual y el runtime de inferencia, y aplica un ajuste fino únicamente sobre el decodificador para mejorar el reconocimiento de líneas manuscritas en tailandés sin degradar el parseo de documentos impresos.

La relevancia del modelo radica en su enfoque de ajuste contenido: congela el codificador visual, entrena solo el decodificador sobre dos corpus públicos de líneas manuscritas tailandesas, introduce un 20 % de muestras de replay con texto impreso para mitigar el olvido catastrófico y aplica una mezcla en el espacio de pesos (WiSE-FT) para preservar las capacidades originales de parseo. El resultado es un modelo de 0,63B parámetros que cabe en una GPU de 12 GB para entrenamiento y que devuelve Markdown limpio (encabezados, párrafos, tablas) o texto plano según el modo de prompt.

La versión 1.0a es una release alpha: solo se modifican los pesos del decodificador en `model.safetensors`, manteniendo claves y dtypes originales. El modelo soporta tailandés e inglés, se distribuye con licencia OpenMDW-1.1 y está etiquetado como compatible con endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron Parse: codificador visual (~0,44B) + decodificador autorregresivo |
| Parametros totales | 630.800.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | nvidia/Nemotron-3.5-Parse |
| Tamano del repo | 2,7 GB |
| Requiere codigo remoto | si (`custom_code`, `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Nemotron Parse: un codificador visual de aproximadamente 0,44B parámetros que procesa la imagen del documento, seguido de un decodificador autorregresivo que genera la salida en Markdown (modo página) o texto plano (modo línea). En la versión 1.0a el codificador visual permanece congelado y solo se ajustan los parámetros del decodificador, excluyendo las cabeceras auxiliares. Este diseño reduce el coste de entrenamiento hasta caber en una GPU de 12 GB y limita el olvido de las capacidades originales.

El ajuste fino se realizó sobre dos corpus públicos de recortes de líneas manuscritas en tailandés, agrupados y divididos mediante un hash MD5 de la frase normalizada para evitar fugas entre train y validación (2 % validación, 3 % test). La tarea es entropía cruzada con teacher forcing sobre el prompt de texto plano propio del modelo (`<no_bbox><no_classes><output_plain><predict_text_in_pic>`), con líneas preprocesadas a ~96 px de alto, margen blanco de 16 px y ancho máximo de 1600 px. Se añadió un 20 % de muestras de replay con líneas tailandesas impresas renderizadas a partir de las frases de entrenamiento para combatir el olvido. Finalmente se aplicó una mezcla en el espacio de pesos WiSE-FT, `w = (1 − α)·w_original + α·w_finetuned`, con α seleccionado en validación entre {0,3, 0,5, 0,7, 1,0} bajo la restricción de que la pérdida en texto impreso no superase `1,05 × baseline + 0,005`. Los tensores mezclados se escribieron de vuelta en el layout original de `model.safetensors`, clave por clave.

Hiperparámetros de entrenamiento: optimizador AdamW (β = 0,9/0,95, weight decay 0,01), LR pico 8e-6 con 20 pasos de warm-up y decaimiento coseno hasta un suelo del 5 %, micro-batch 8 × acumulación de gradiente 4 (batch efectivo 32), 1 época, grad clip 1,0, pesos en fp32 con autocast bf16, longitud máxima de target 192 tokens, selección de checkpoint por menor pérdida de validación evaluada cada 50 pasos y semilla 42.

## Capacidades

- Extracción de texto a Markdown estructurado desde imágenes de documentos: encabezados, párrafos y tablas.
- OCR de página completa en tailandés e inglés.
- Reconocimiento de escritura manuscrita tailandesa a nivel de línea (modo `--line` con prompt de texto plano).
- Parseo de tablas con salida en formato Markdown.
- Parseo de gráficos (rendimiento limitado según los datos del autor).
- Modo página con prompt nativo de parseo de documentos y post-procesador incluido.
- Modo línea con preprocesado específico (escalado a ~96 px de alto, margen blanco).
- Inferencia compatible con vLLM mediante plugin `nemotron_parse` registrado en el repositorio.
- Soporte bilingüe tailandés-inglés.
- Salida conversacional (etiqueta `conversational`) y compatible con endpoints.

## Casos de uso

- Digitalización de archivos manuscritos tailandeses: el modo línea permite procesar recortes de escritura a mano y convertirlos a texto plano, adecuado para fondos documentales y archivos históricos donde el OCR convencional falla.
- Extracción de tablas de informes financieros: el modelo devuelve tablas en Markdown directamente, lo que facilita su integración en pipelines de datos que alimentan hojas de cálculo o bases de datos.
- Automatización de entrada de datos en formularios: a partir de una imagen de documento se obtiene Markdown estructurado que puede parsearse con expresiones regulares o un LLM posterior para extraer campos concretos.
- Procesamiento por lotes con vLLM: el despliegue mediante `vllm serve . --trust-remote-code` permite servir el modelo con throughput agregado para digitalizar grandes volúmenes de páginas.
- Construcción de corpus bilingües th-en: la salida en Markdown preserva la estructura del documento, lo que simplifica la alineación y el posterior entrenamiento de modelos de lenguaje.
- Preprocesado para RAG documental: convertir páginas escaneadas a Markdown antes de la indexación vectorial, manteniendo encabezados y tablas que mejoran la recuperación.
- Transcripción de notas manuscritas en entornos educativos o de investigación en Tailandia, usando el modo línea sobre recortes individuales.

## Benchmarks y rendimiento

Resultados publicados por el autor en ThaiOCRBench (métricas 0–100, mayor es mejor; NLS = 1 − distancia de edición normalizada; TEDS cuando el ground truth contiene tabla, en caso contrario NLS sobre texto sin marcado). El autor advierte que los scorers son propios, la muestra es pequeña (12 páginas por tarea) y no hay columna de baseline porque la ejecución de referencia no completó limpiamente en su harness.

| Grupo | Media |
|---|---:|
| Tareas OCR | 45,0 |
| Tareas de parseo | 60,3 |

| Tipo de tarea | Grupo | Puntuación | n |
|---|---|---:|---:|
| Parseo de documentos | parse | 83,3 | 12 |
| OCR de página completa | ocr | 74,0 | 12 |
| Parseo de tablas | parse | 68,6 | 12 |
| Reconocimiento de texto | ocr | 61,1 | 12 |
| Extracción de contenido manuscrito | ocr | 36,4 | 12 |
| Parseo de gráficos | parse | 29,1 | 12 |
| Reconocimiento de texto fino | ocr | 8,5 | 12 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las tareas de VQA y de información clave se omitieron por requerir un LLM de question answering en el bucle.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 630,8M parámetros; en fp16/bf16 requiere aproximadamente 1,3 GB solo para pesos, más overhead de activaciones y caché KV. El autor indica que el entrenamiento (solo decodificador) cabe en una GPU de 12 GB.
- GPU recomendadas: cualquier GPU con al menos 12 GB para entrenamiento según el autor; para inferencia, GPUs consumer de gama media-alta son suficientes por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, dado el tamaño de 0,63B parámetros; una RTX 3060 de 12 GB o superior es suficiente para inferencia en precisión completa.
- Opciones de despliegue: `transformers` con `trust_remote_code`, `vLLM` mediante `pip install -e ".[vllm,client]"` y `vllm serve . --served-model-name nemotron-parse --trust-remote-code`. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor señala que `generate` en plano es lento y que por eso limitó la evaluación a 12 páginas por tarea, recomendando vLLM para throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| KaoOCR-Ledger-1.0a | 0,63B | no disponible | th, en | OpenMDW-1.1 | OCR y parseo a Markdown con foco en manuscrito tailandés |
| nvidia/Nemotron-3.5-Parse (base) | ~0,63B | no disponible | no disponible | no disponible | Parseo de documentos a Markdown; sin ajuste específico en manuscrito tailandés |
| Alternativas OCR especializadas en tailandés | no disponible | no disponible | th | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas en la información proporcionada. La comparación con el modelo base es estructural (mismo codificador visual congelado y mismo decodificador ajustado), pero el autor no aporta una columna de baseline en ThaiOCRBench, por lo que no puede afirmarse una mejora cuantitativa frente a Nemotron 3.5 Parse original.

## Limitaciones y advertencias

- El ajuste fino de manuscrito se realizó sobre líneas individuales, no sobre páginas manuscritas completas; el prompt de parseo de página nunca se entrenó directamente y su comportamiento solo puede cambiar a través de los pesos compartidos del decodificador.
- El autor califica la release como alpha (1.0a) y los resultados de ThaiOCRBench como señal de smoke test, no como entrada de leaderboard: scorers propios, 12 páginas por tarea y sin baseline.
- Rendimiento bajo en reconocimiento de texto fino (8,5/100) y en parseo de gráficos (29,1/100), lo que desaconseja su uso para esos casos sin validación previa.
- La extracción de contenido manuscrito obtiene 36,4/100, lo que indica margen de mejora sustancial en el objetivo principal del ajuste.
- Riesgo de alucinación inherente a los modelos generativos: la salida es texto libre en Markdown y puede inventar contenido no presente en la imagen, especialmente en documentos degradados.
- Sesgos lingüísticos: el ajuste se centró en tailandés; el rendimiento en inglés u otros idiomas no se ha evaluado en la información disponible.
- Licencia OpenMDW-1.1 (`license: other`): es necesario revisar los términos completos antes de uso comercial, ya que no es una licencia OSI estándar ampliamente conocida.
- Requiere `trust_remote_code` y código personalizado (`nemotron_parse`), lo que implica ejecutar código del repositorio y auditar su procedencia en entornos de producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados, lo que limita la planificación de despliegues con requisitos estrictos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0a
- Modelo base NVIDIA Nemotron 3.5 Parse: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- README de referencia incluido en el repo: `NVIDIA_NEMOTRON_PARSE_README.md` (dentro del repositorio del modelo)
- Script de inferencia incluido: `inference.py` (modo página y modo línea con `--line`)
- Requisitos: `requirements.txt` (dentro del repositorio del modelo)
