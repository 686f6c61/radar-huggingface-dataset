# ersanbil/TurkceOCR

## Resumen

TurkceOCR es un sistema de OCR y comprensión de documentos en turco publicado por el desarrollador independiente ersanbil. No se trata de un único modelo monolítico, sino de un *bundle* de varios componentes empaquetados en un mismo repositorio: un reconocedor de líneas convolucional con CTC (`SVTRv2-Turkish-SGM`, ~12 M de parámetros), un adaptador LoRA sobre el VLM `Qwen2.5-VL-3B-Instruct` para el análisis de maquetación de página, y una capa determinista de post-proceso (`TurkceVerify`, `RepetitionGuard`, `UnifiedTurkishEntityEngine`, `VisualRedactor`).

El problema que aborda es concreto: los motores OCR genéricos y los VLM multilingües fallan de forma sistemática con la ortografía turca (la distinción de cuatro vías entre `I/İ/ı/i`, las cadenas de sufijos aglutinantes y los diacríticos `ğ, ü, ş, ö, ç`) y con la estructura de documentos institucionales turcos (tablas de autoridades de competencia, escritos judiciales, facturas con verificación de checksums). El sistema envuelve el reconocimiento neuronal con verificadores algorítmicos para TCKN, VKN e IBAN, y añade redacción visual irreversible de PII conforme a KVKK (la ley turca de protección de datos).

La relevancia actual viene de su enfoque híbrido: combina un reconocedor puramente neuronal (sin modelo de lenguaje) con un VLM afinado mediante LoRA y alineado con recompensas verificables (RLVR), y lo remata con validación determinista. El repositorio ocupa 0,1 GB, está bajo licencia Apache 2.0 y declara soporte para turco e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: SVTRv2 (CNN + transformer con CTC) para líneas + LoRA sobre Qwen2.5-VL-3B-Instruct para maquetación de página |
| Parámetros totales | Reconocedor de líneas: ~12 M; adaptador LoRA: r=16, α=32 sobre un VLM de 3B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el pipeline completo; el NER asociado usa ventana deslizante de 512 tokens con stride 128 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El componente de reconocimiento de líneas, `SVTRv2-Turkish-SGM v2`, es una red de ~12 M de parámetros que recibe entradas de `(H=48, W=384)` y produce `T=96` pasos temporales. Combina una rectificación mediante 2D-STN, un encoder multiescala convolucional y transformer, una cabeza CTC y una cabeza auxiliar de morfología turca (SGM). Se entrenó con `TurkishCharacterConfusionFocalLoss` (γ = 2.5) sobre 2.750 líneas reales de PDF y de archivo. El adaptador de maquetación es un LoRA (`r=16, α=32`) sobre `Qwen2.5-VL-3B-Instruct`, con 31 tokens estructurales y de diacríticos turcos (`<doc>`, `<region>`, `<table_md>`, `<kv>`, `<stamp>`, `<signature/>`, `<handwriting>`, `<marginalia>`) y alineación mediante RLVR con recompensas verificables.

El preprocesado visual incluye reescalado Lanczos adaptativo de 2,0×–2,5× para escaneos de baja resolución (ancho < 1000 px), eliminación morfológica de rejillas de tabla con kernels de apertura de 40×1 y 1×40 sobre líneas oscuras neutras, y rasterización de tablas vectoriales `.emf`/`.wmf` embebidas en `.docx` a 240–300 DPI. La capa determinista `TurkceVerify` aplica Mod-10 y paridad para TCKN y documentos extranjeros (prefijo `99`), Mod-10 de GİB para VKN, Mod-97-10 ISO-7064 sobre reserva `0` del TCMB para IBAN turco, y un solucionador lineal de facturas (`Matrah + KDV = Toplam` para tipos del 1 %, 10 % y 20 %). `RepetitionGuard` trunca bucles periódicos de 4–8 tokens con al menos 5 repeticiones, con excepción para tablas de secretos comerciales de la Autoridad de Competencia. El motor de entidades combina `ictihat_core` (calibrado sobre `hamzabagirsakci/turkish-court-decisions`) con `ersanbil/kvkk-pii-ner` (13 clases BIO) en más de 25 clases de entidad.

## Capacidades

- Reconocimiento OCR de líneas y páginas de documentos turcos, incluyendo material de archivo y PDF nativos digitales.
- Reconocimiento de maquetación: regiones, tablas (salida en Markdown), pares clave-valor, sellos, firmas, manuscritos y anotaciones marginales.
- Desambiguación explícita de `I/İ/ı/i` y de diacríticos turcos con F1 declarado del 100 % en el conjunto interno.
- Verificación algorítmica de identificadores: TCKN, documentos extranjeros, VKN e IBAN turco mediante checksums.
- Verificación financiera de facturas mediante resolución lineal de base imponible, IVA y total.
- Detección y redacción de PII con enfoque *fail-closed* de dos niveles (`SUSPECT_PII`), orientado a cumplimiento KVKK.
- Redacción visual irreversible: proyección carácter-a-píxel mediante `OffsetMap` monótono y relleno de cajas `#000000` (RGB 0,0,0) sobre PII textual y regiones visuales (firma, sello, código QR, fotografía).
- Reconocimiento de entidades legales y comerciales en más de 25 clases.
- Capacidades multilingües limitadas a turco e inglés.
- No se documenta soporte de *tool calling* ni de razonamiento multi-paso genérico más allá del pipeline específico.

## Casos de uso

- Digitalización de archivos judiciales turcos: el motor de entidades `ictihat_core`, calibrado sobre resoluciones judiciales, extrae partes, referencias legales y entidades de más de 25 clases, mientras el reconocedor de líneas mantiene la fidelidad de diacríticos en documentos escaneados de baja calidad.
- Verificación de facturas en contabilidad: `TurkceVerify` resuelve la coherencia entre base imponible, IVA (1 %, 10 %, 20 %) y total, y valida VKN e IBAN mediante checksums, lo que permite descartar automáticamente documentos manipulados o mal digitalizados.
- Cumplimiento KVKK en pipelines documentales: la detección *fail-closed* de PII junto con la redacción visual irreversible a `#000000` permite anonimizar expedientes antes de almacenarlos o compartirlos, cubriendo también firmas, sellos, códigos QR y fotografías.
- Procesamiento de resoluciones de la Autoridad de Competencia turca: `RepetitionGuard` está específicamente adaptado para no truncar las tablas de secretos comerciales con formato `| (.....) |`, un caso que provoca bucles degenerados en VLM genéricos.
- Extracción de tablas a Markdown para RAG: el adaptador LoRA emite `<table_md>` y pares `<kv>`, lo que facilita la ingesta estructurada de normativa y documentos mercantiles en bases vectoriales.
- Digitalización de documentación notarial y registral: el tratamiento de sellos, firmas y anotaciones marginales permite separar regiones manuscritas de las impresas y enrutarlas a revisión humana.
- Preprocesado de escaneos históricos de baja resolución: el reescalado Lanczos adaptativo y la eliminación de rejillas de tabla mejoran la legibilidad antes del reconocimiento en material de archivo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados de forma independiente):

| Tarea / conjunto | Métrica | Valor |
|---|---|---|
| OCR y maquetación — TurkExternalBlindBench-v1 (35 páginas de archivo no vistas) | CER medio (%) | 1,76 |
| OCR y maquetación — TurkExternalBlindBench-v1 | WER medio (%) | 7,57 |
| OCR y maquetación — TurkExternalBlindBench-v1 | F1 de diacríticos turcos alineado por posición (%) | 98,67 |
| OCR y maquetación — TurkExternalBlindBench-v1 | Tasa de bucles de repetición de 6 tokens, KPI-14 (%) | 0 |
| Document intelligence — TurkceOCR-Bench-6Cat (ID + OOD), suite de 15 KPI | CER del sistema completo con TurkceVerify (%) | 0 |
| Document intelligence — TurkceOCR-Bench-6Cat | F1 de desambiguación `I/İ/ı/i` (%) | 100 |
| Document intelligence — TurkceOCR-Bench-6Cat | Tasa de KIE verificada por checksum, CVKR (%) | 100 |
| Document intelligence — TurkceOCR-Bench-6Cat | Recall de PII KVKK con cero filtraciones (%) | 100 |
| Document intelligence — TurkceOCR-Bench-6Cat | Cobertura de redacción visual 2D irreversible (%) | 100 |
| CTC neuronal puro — TurkceOCR Phase-2 (N=215 líneas reales) | CER en PDF nativo digital (%) | 21,92 |
| CTC neuronal puro — TurkceOCR Phase-2 | CER en PDF de Mevzuat (%) | 16,17 |
| CTC neuronal puro — TurkceOCR Phase-2 | CER en PDF de Rekabet Kurumu (%) | 20,34 |

## Requisitos de hardware

- El reconocedor de líneas (~12 M de parámetros) es muy ligero y puede ejecutarse en CPU para volúmenes moderados; en GPU consumer cabe holgadamente.
- El adaptador LoRA se aplica sobre `Qwen2.5-VL-3B-Instruct`, que en precisión completa requiere del orden de 6–8 GB de VRAM; con cuantización de 8 bits o 4 bits puede caber en GPUs consumer de 8–12 GB (RTX 3060, 4060, 4070), aunque no se publican cifras oficiales de cuantización.
- Para procesar páginas completas con imágenes de alta resolución conviene disponer de al menos 16 GB de VRAM (RTX 4080, 4090, A100 40 GB) con el fin de acomodar los tokens visuales adicionales.
- Opciones de despliegue: al estar empaquetado con la librería `transformers`, es compatible con el ecosistema Hugging Face; no se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurkceOCR | ~12 M (líneas) + LoRA sobre VLM 3B | No disponible | OCR turco con verificación determinista y redacción KVKK | Apache 2.0 | Hugging Face (`ersanbil/TurkceOCR`) |
| Qwen2.5-VL-3B-Instruct | 3B | No disponible en la información proporcionada | VLM generalista multimodal | No disponible en la información proporcionada | Hugging Face (`Qwen/Qwen2.5-VL-3B-Instruct`) |
| Tesseract | No aplica (motor OCR clásico) | No aplica | OCR clásico multilingüe | No disponible en la información proporcionada | Código abierto |
| PaddleOCR | No disponible | No aplica | OCR clásico con detección y reconocimiento | No disponible en la información proporcionada | Código abierto |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; el autor solo reporta cifras absolutas sobre sus propios conjuntos de evaluación.

## Limitaciones y advertencias

- Todos los resultados de benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); no hay evaluación independiente publicada.
- El CER del reconocedor puramente neuronal (sin capa de verificación) es notablemente alto en PDF nativos digitales (21,92 %), lo que indica que buena parte del rendimiento del sistema completo depende del post-proceso determinista y del VLM.
- El soporte lingüístico se limita a turco e inglés; no hay evidencia de generalización a otras lenguas.
- El sistema está fuertemente especializado en dominios turcos concretos (legal, financiero, regulatorio); su comportamiento fuera de esos dominios no está documentado.
- La detección de PII es *fail-closed* y puede generar falsos positivos que bloqueen documentos legítimos; conviene prever revisión humana en producción.
- El repositorio tiene 0 descargas y 0 *likes*, lo que sugiere ausencia de validación por parte de la comunidad.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus judiciales y regulatorios turcos puede heredar sesgos de esas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento efectivo de KVKK recae en el integrador.
- No se publican datos sobre cuantización, latencia ni throughput, lo que dificulta planificar despliegues a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ersanbil/TurkceOCR
- Dataset de evaluación: https://huggingface.co/datasets/ersanbil/TurkceOCR-Bench
- Dataset de resoluciones judiciales turcas: https://huggingface.co/datasets/hamzabagirsakci/turkish-court-decisions
- Modelo NER de PII asociado: https://huggingface.co/ersanbil/kvkk-pii-ner
- Modelo base VLM: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Modelo base BERT turco: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Referencias arXiv citadas en la model card: arxiv:2411.15858, arxiv:2502.13923, arxiv:2412.07626, arxiv:1911.10683, arxiv:2007.00398, arxiv:2502.18443, arxiv:1708.02002, arxiv:2106.09685, arxiv:2501.12948
