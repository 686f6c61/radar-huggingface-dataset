# nvidia/Nemotron-3.5-Parse

## Resumen

Nemotron 3.5 Parse es un modelo de visión-lenguaje (VLM) especializado en el parseo de documentos, desarrollado por NVIDIA. Su función es convertir imágenes de páginas —escaneos, PDF renderizados, diapositivas, formularios e informes con maquetaciones mixtas— en información estructurada: texto, tablas, datos de gráficos, orden de lectura, clases semánticas y cajas delimitadoras (bounding boxes). La salida puede exportarse como Markdown, HTML o JSON estructurado.

El modelo es deliberadamente compacto: 630.800.504 parámetros totales (0,631B) según los pesos en safetensors, lo que lo sitúa en la gama de modelos pequeños aptos para despliegue de alto rendimiento en producción documental. Incorpora un mecanismo opcional de decodificación especulativa nativa, DFlash2, con un drafter de 89,3M de parámetros incluido en el mismo repositorio, orientado a aumentar el throughput en inferencia con vLLM.

Su relevancia actual radica en dos factores: por un lado, lidera ParseBench con una puntuación de 75,20 en modo de triple pasada según la comparativa reportada por el propio autor; por otro, cubre OCR multilingüe evaluado en 163 entradas de idioma/escritura agrupadas en 26 grupos de escritura, además de 10 idiomas índicos. Está publicado bajo licencia OpenMDW-1.1 y es compatible con endpoints y despliegue en Azure y Baseten.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM con arquitectura `nemotron_parse` (custom_code); detalles internos del transformer no disponibles |
| Parametros totales | 630.800.504 (0,631B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card solo documenta ejecución en BF16) |
| Idiomas soportados | OCR evaluado en 163 entradas de idioma/escritura en 26 grupos de escritura, más 10 idiomas índicos; lista explícita de idiomas no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |
| Drafter especulativo | DFlash2, 89,3M de parámetros (incluido en `dflash2/`) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 5,4 GB |

## Arquitectura y entrenamiento

Nemotron 3.5 Parse es un modelo de generación texto-a-partir-de-imagen-texto que consume imágenes de página completas y emite secuencias con tokens de control especiales. La interfaz de prompting se basa en tokens como `<predict_bbox>`, `<predict_classes>`, `<output_markdown>` y `<predict_text_in_pic>`, que activan la predicción de cajas delimitadoras, clases semánticas, salida en Markdown y texto embebido en imágenes respectivamente. El modelo requiere `trust_remote_code=True` y utiliza un procesador propio (`AutoProcessor`) para la preparación de imágenes y prompts.

La decodificación especulativa DFlash2, publicada el 4 de noviembre de 2026, se distribuye junto al modelo objetivo en el mismo repositorio y se integra de forma nativa en vLLM mediante `--speculative-config` con método `dflash` y hasta 32 tokens especulativos. Los benchmarks de esa componente se realizaron en una H200 en BF16 sobre 2.078 páginas, con mediana de tres ejecuciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Extracción de texto de imágenes de página (OCR) en documentos escaneados, PDF renderizados, diapositivas, formularios e informes.
- Detección y reconstrucción de tablas, con sección específica de postprocesado en la documentación del modelo.
- Extracción de datos de gráficos presentes en las páginas.
- Predicción de orden de lectura y de clases semánticas por región.
- Predicción de bounding boxes mediante el token `<predict_bbox>`.
- Salida en Markdown, HTML o JSON estructurado.
- OCR multilingüe amplio: 163 entradas de idioma/escritura en 26 grupos de escritura y 10 idiomas índicos.
- Procesamiento de texto dentro de imágenes (`<predict_text_in_pic>`).
- Modos de parseo simple, doble y triple pasada, con impacto directo en la precisión (el 75,20 de ParseBench corresponde a triple pasada).
- Compatibilidad con API compatible con OpenAI a través de vLLM.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Digitalización de archivos históricos escaneados: el modelo procesa imágenes de página completas y devuelve texto con orden de lectura y bounding boxes, lo que permite reconstruir la estructura original y enlazar cada fragmento con su región en la imagen.
- Extracción de tablas financieras de informes anuales: con el token de salida Markdown y el postprocesado de tablas documentado, se pueden convertir tablas impresas en estructuras tabulares reutilizables en pipelines de análisis.
- Automatización de ingesta de formularios: la predicción de clases semánticas y cajas delimitadoras permite identificar campos y sus valores sin plantillas específicas por formulario, útil en administración pública y seguros.
- Procesamiento de documentación técnica multilingüe: la cobertura de 163 entradas de idioma/escritura y 10 idiomas índicos lo hace adecuado para corpus con escrituras mixtas donde un OCR monolingüe fallaría.
- Conversión de diapositivas y presentaciones a Markdown: la salida Markdown directa facilita la migración de material formativo a wikis o sistemas de documentación.
- Extracción de datos de gráficos en publicaciones: la capacidad de leer datos de charts permite poblar bases de datos a partir de figuras en informes y papers.
- Despliegue de alto throughput en producción documental: con 0,631B de parámetros y el drafter DFlash2 de 89,3M, el modelo está pensado para servir grandes volúmenes de páginas por GPU; la model card reporta mediciones en una H200 en BF16 sobre 2.078 páginas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ParseBench (triple pasada) | 75,20 | Puntuación global más alta entre los sistemas de la comparativa reportada por el autor |
| OCR multilingüe | 163 entradas de idioma/escritura, 26 grupos de escritura, 10 idiomas índicos | Evaluación por idioma/escritura; cifras por entrada no disponibles en la información proporcionada |
| Throughput DFlash2 vs MTP vs base | Gráfica publicada en `dflash2/performance/concurrency.png` | H200, BF16, 2.078 páginas, mediana de tres ejecuciones, mejor longitud de draft nativa por nivel de concurrencia; valores numéricos no disponibles |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de propósito general, dado que el modelo está especializado en parseo documental.

## Requisitos de hardware

- VRAM estimada: con 630,8M de parámetros en BF16, los pesos ocupan aproximadamente 1,26 GB; el repositorio completo son 5,4 GB (incluye drafter y artefactos). La VRAM total dependerá de la resolución de imagen y del número de tokens generados (hasta 8.744 `max_new_tokens` en el ejemplo oficial).
- GPU recomendadas: la model card documenta benchmarks en NVIDIA H200; el ejemplo de ejecución usa `cuda` con BF16 sin especificar gama mínima.
- GPU de consumo: no se documenta explícitamente compatibilidad con GPU de consumo; por tamaño de pesos, un modelo de 0,631B en BF16 es viable en GPUs consumer con suficiente VRAM, pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: Transformers (`AutoModel` con `trust_remote_code`), vLLM con soporte nativo de Parse y DFlash2, API compatible con OpenAI servida por vLLM, NVIDIA Build API y Baseten.
- Decodificación especulativa: DFlash2 con `num_speculative_tokens` de hasta 32 en el ejemplo oficial de vLLM.
- Latencia y throughput: no se publican cifras numéricas en el texto disponible; solo gráficas de concurrencia en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Parse | 0,631B (+ drafter 89,3M) | No disponible | Parseo documental, OCR, tablas, bounding boxes | OpenMDW-1.1 | Hugging Face, NVIDIA Build API, Baseten, Azure |
| Alternativas de la comparativa ParseBench | No disponible | No disponible | Parseo documental | No disponible | No disponible |
| Otros modelos OCR/VLM de NVIDIA | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card menciona una comparativa ParseBench con otros sistemas, pero los nombres, parámetros y licencias de esos sistemas no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de propósito general; su uso previsto es el parseo de imágenes de página, no la conversación abierta ni el razonamiento genérico.
- Entrada exclusivamente de imagen: los PDF deben renderizarse a imagen página a página antes de la inferencia.
- Dependencia de tokens de control: el postprocesado requiere conservar los tokens especiales en la salida (`skip_special_tokens=False`); descartarlos rompe la interpretación de bounding boxes y clases.
- Precisión dependiente del modo: el 75,20 de ParseBench corresponde a triple pasada; los modos simple y doble tendrán menor precisión, aunque no se publican sus cifras exactas en el texto disponible.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de fidelidad en la información proporcionada; en tareas de OCR y extracción estructurada, cualquier dato no verificado contra la imagen debe tratarse con cautela.
- Idiomas: aunque se evalúa en 163 entradas de idioma/escritura, no se publica la lista explícita de idiomas soportados ni métricas por idioma en el texto disponible.
- Licencia OpenMDW-1.1: es necesario revisar los términos completos del modelo antes de uso comercial; las condiciones específicas de atribución y redistribución no están detalladas en la información proporcionada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código en entornos de producción.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a documentos degradados, manuscritos o maquetaciones adversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- NVIDIA Build API (demo alojada): https://build.nvidia.com/nvidia/nemotron-3.5-parse
- Despliegue en Baseten: https://www.baseten.co/library/nemotron-35-parse/
- Documentación del drafter DFlash2: `dflash2/README.md` dentro del repositorio del modelo
- Protocolo y datos de benchmark DFlash2: `dflash2/performance/README.md` dentro del repositorio del modelo
- Ejemplos de salida del modelo: `assets/hero-examples.md` dentro del repositorio del modelo
- NVIDIA (sitio corporativo): https://www.nvidia.com/
