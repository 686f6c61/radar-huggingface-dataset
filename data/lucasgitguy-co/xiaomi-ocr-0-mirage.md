# Lucasgitguy-co/Xiaomi-OCR-0-Mirage

## Resumen

Xiaomi-OCR-0-Mirage es un paquete de inferencia para OCR y parsing de documentos publicado por el usuario Lucasgitguy-co sobre el modelo base Xiaomi-OCR-0 de Xiaomi Research. No se trata de un reentrenamiento: los pesos son byte a byte idénticos a la revisión `bbd8cf8` del modelo original (sha256 `d4551e9f6127ac9e35cff7b4f7a72a90410e03e6c8676a36f0e2b7eaeb5d5348`). Lo que añade el repositorio es el script `mirage_ocr.py`, que orquesta el modelo junto con el detector de texto Mirage de Cactus Compute para enriquecer la salida con cajas delimitadoras de texto.

El modelo base emplea una arquitectura etiquetada como `qwen3_5` en el pipeline `image-text-to-text`, con 873.438.784 parámetros totales y un repositorio de 1,8 GB en BF16. Está orientado a tareas de extracción de texto en imágenes: conversión a Markdown con tablas en formato OTSL y fórmulas en LaTeX, texto plano, extracción de información clave (KIE) con esquema JSON y respuesta a preguntas sobre la imagen. Su relevancia radica en que ofrece un pipeline OCR completo y reproducible, con evaluación pública sobre OCRBench, OmniDocBench y CORD v2, y con variantes cuantizadas (MLX y GGUF) que mantienen la calidad dentro del ruido estadístico.

La integración con Mirage es deliberadamente conservadora: Mirage solo aporta coordenadas, nunca texto, y su función de zoom quedó desactivada por defecto tras comprobar que degradaba OCRBench de 843 a 802. La licencia Apache-2.0 y la compatibilidad con transformers, MLX y llama.cpp facilitan su adopción tanto en Apple Silicon como en CUDA y CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, MLX 6-bit, MLX 4-bit, GGUF Q8_0, Q6_K, Q4_K_M (con y sin imatrix de texto), mmproj F16/Q8_0 |
| Idiomas soportados | no disponible (la evaluación de documentos cubre inglés y chino; Mirage lee solo escritura latina) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 transformers), MLX, GGUF |

## Arquitectura y entrenamiento

El modelo base Xiaomi-OCR-0 es un transformer multimodal de 873 millones de parámetros que procesa imagen y texto conjuntamente para generar transcripciones estructuradas. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO. El preprocesado de imagen documentado por el autor usa el redimensionado propio de Xiaomi: lado largo de 2048 píxeles sobre una rejilla de 32 píxeles.

La innovación del repositorio no está en el entrenamiento sino en el pipeline de inferencia. `mirage_ocr.py` ejecuta el modelo y, en paralelo, el detector Mirage (54 millones de parámetros, Apache-2.0, solo dentro del motor `cactus-compute`). Mirage aporta cajas en coordenadas 0–1000 que se asignan a cada línea de salida mediante coincidencia difusa (ratio ≥ 70); el texto siempre procede de Xiaomi-OCR-0. El autor documenta que se intentó destilación DWQ sobre las escalas de cuantización de 4 bits y que solo superó a la cuantización simple en 1 de 3 benchmarks, mientras que la variante de 6 bits divergió, por lo que todas las cuantizaciones publicadas son simples. La decodificación usada en la evaluación es greedy, sin penalización de repetición y con prompt sin modo thinking.

## Capacidades

- Reconocimiento de texto en imágenes y documentos, con salida en Markdown.
- Conversión de tablas al formato OTSL y de fórmulas matemáticas a LaTeX.
- Extracción de texto plano (`--task text`).
- Extracción de información clave estructurada en JSON a partir de un esquema proporcionado (`--task kie --schema`).
- Respuesta a preguntas libres sobre el contenido de la imagen (`--task ask`).
- Generación de cajas delimitadoras por línea en coordenadas 0–1000 con `--json`, gracias a Mirage.
- Ejecución en Apple Silicon (MPS), CUDA y CPU.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Soporte multilingüe: no disponible en detalle; la evaluación de documentos incluye páginas en inglés y chino.
- No se documenta soporte de tool calling, agentes ni modo thinking.

## Casos de uso

- Digitalización de facturas y recibos: con `--task kie` y un esquema JSON, el modelo extrae campos estructurados de cada documento; la evaluación sobre CORD v2 (F1 de 78,18 en BF16) da una referencia concreta de calidad esperable en este dominio.
- Conversión de documentación técnica a Markdown: `--task doc` preserva tablas en OTSL y fórmulas en LaTeX, lo que permite alimentar pipelines de documentación o wikis internas sin postprocesado manual de tablas.
- Indexación de archivos escaneados para búsqueda: el texto plano generado con `--task text` puede ingerirse en un motor de búsqueda o en un sistema RAG; el modelo cabe en menos de 1 GB en GGUF Q8_0, lo que abarata el procesado por lotes.
- Anotación con coordenadas para revisión humana: la salida `--json` con cajas de Mirage permite construir interfaces de verificación donde el operador ve la región de imagen asociada a cada línea transcrita.
- Procesamiento en portátiles Apple Silicon: la variante MLX 4-bit ocupa 645 MB y mantiene OCRBench en 836 frente a 843 de referencia, adecuada para herramientas de escritorio de OCR sin GPU dedicada.
- Despliegue en CPU con llama.cpp: la variante GGUF Q6_K (851 MB) obtiene 842 en OCRBench, prácticamente idéntica al BF16, lo que habilita OCR en servidores sin acelerador.
- Respuesta a preguntas sobre capturas o documentos: `--task ask` permite consultas puntuales sobre el contenido de una imagen sin pipeline OCR intermedio.

## Benchmarks y rendimiento

Evaluación del autor: OCRBench con las 1000 preguntas y regla de subcadena oficial (error estándar aproximado de ±1,2 puntos); documentos sobre 100 páginas de OmniDocBench (50 inglés, 50 chino) con distancia de edición normalizada (menor es mejor); CORD v2 test con 100 recibos y F1 de campo.

| Version | Bytes | OCRBench (/1000) | doc NED ↓ | CORD F1 | Igual que BF16 (OCRBench / docs / CORD) |
|---|---:|---:|---:|---:|---|
| MLX BF16 (referencia) | 1.726.071.379 | 843 | 0,0829 | 77,55 | referencia |
| transformers BF16 (pesos upstream) | 1.766.940.039 | 843 (+0) | 0,0823 (-0,0006) | 78,18 (+0,63) | 96% / 80% / 87% |
| MLX 6-bit simple | 833.276.908 | 846 (+3) | 0,0844 (+0,0015) | 77,67 (+0,12) | 93% / 75% / 65% |
| MLX 4-bit DWQ | 645.299.748 | 831 (-12) | 0,0888 (+0,0059) | 78,58 (+1,03) | 84% / 50% / 26% |
| MLX 4-bit simple | 645.303.148 | 836 (-7) | 0,0877 (+0,0048) | 77,23 (-0,32) | 84% / 50% / 22% |
| GGUF BF16 + mmproj F16 | 1.762.648.800 | 843 (+0) | 0,0831 (+0,0002) | 78,07 (+0,52) | 94% / 71% / 89% |
| GGUF Q8_0 + mmproj Q8_0 | 949.514.976 | 847 (+4) | 0,0836 (+0,0007) | 78,10 (+0,55) | 94% / 70% / 83% |
| GGUF Q6_K + mmproj F16 | 851.526.880 | 842 (-1) | 0,0823 (-0,0006) | 77,70 (+0,15) | 92% / 69% / 77% |
| GGUF Q4_K_M + mmproj F16 | 746.889.952 | 841 (-2) | 0,0912 (+0,0083) | 75,63 (-1,92) | 88% / 63% / 25% |
| GGUF Q6_K (imatrix texto) + mmproj F16 | 851.527.104 | 844 (+1) | 0,0834 (+0,0005) | 77,55 (+0,00) | 93% / 70% / 73% |
| GGUF Q4_K_M (imatrix texto) + mmproj F16 | 746.890.176 | 841 (-2) | 0,0908 (+0,0079) | 77,18 (-0,37) | 88% / 59% / 33% |
| MLX BF16 + Mirage zoom | 1.726.071.379 | 802 (-41) | 0,0829 (+0,0000) | 77,55 (+0,00) | 90% / 100% / 100% |

El autor indica que el MLX BF16 (843) coincide con el 84,6 reportado por Xiaomi para el modelo original. La regla de aceptación preinscrita exigía OCRBench a menos de 10 preguntas del BF16, NED como máximo 0,010 peor, CORD F1 como máximo 1,0 punto peor y todos los ficheros necesarios por debajo de 10^9 bytes. La cuantización Q4_K_M es la que más se aleja en CORD F1 (-1,92). No se han publicado comparaciones con otros modelos OCR en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,65 GB (MLX 4-bit) y 1,8 GB (BF16 transformers) solo para pesos; hay que sumar la memoria del detector Mirage y del motor `cactus-compute` cuando se usa la integración.
- GPU recomendadas: no se especifican modelos concretos; el autor documenta ejecución en MPS (Apple Silicon), CUDA y CPU.
- Compatible con GPU de consumo: sí, por el tamaño reducido; cualquier GPU con 4 GB o más de VRAM debería alojar la variante BF16 junto con el runtime, aunque el autor no publica cifras de VRAM pico medidas.
- Opciones de despliegue: transformers 5.17.0 con torch 2.14.0 y torchvision 0.29.0, MLX, llama.cpp (GGUF), y el script `mirage_ocr.py` con el paquete `cactus-compute==4.2.0`.
- Latencia y throughput: no disponibles.
- Nota de dependencias: la instalación fijada por el autor es muy específica (`transformers==5.17.0`, `torch==2.14.0`), lo que puede entrar en conflicto con entornos existentes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se comparan las variantes internas del propio repositorio, que son la referencia más directa para elegir despliegue:

| Variante | Parametros | Contexto | OCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| transformers BF16 | 873.438.784 | no disponible | 843 | Apache-2.0 | Hugging Face (este repo) |
| MLX 4-bit simple | 873.438.784 (cuantizado) | no disponible | 836 | Apache-2.0 | Hugging Face (repo MLX) |
| GGUF Q6_K | 873.438.784 (cuantizado) | no disponible | 842 | Apache-2.0 | Hugging Face (repo GGUF) |
| GGUF Q8_0 | 873.438.784 (cuantizado) | no disponible | 847 | Apache-2.0 | Hugging Face (repo GGUF) |

## Limitaciones y advertencias

- Los pesos no son un fine-tune: cualquier mejora atribuida al repositorio proviene del script de orquestación y de Mirage, no del modelo.
- Mirage solo lee escritura latina y no detectó texto en 163 de 1000 imágenes de OCRBench que sí contenían texto; por eso nunca se usa para decidir que una imagen está vacía.
- La función de zoom de Mirage está desactivada por defecto porque bajó OCRBench de 843 a 802 y no cumplió la regla preinscrita de mejora.
- El forward pass y el código de entrenamiento de Mirage no son públicos y no puede fusionarse, destilarse ni convertirse junto con Xiaomi-OCR-0; se ejecuta exclusivamente dentro del motor `cactus-compute`.
- El paquete `cactus-compute` envía contadores de uso anónimos salvo que se defina `CACTUS_TELEMETRY=0`; el script lo desactiva, pero conviene verificarlo en entornos corporativos.
- La cuantización Q4_K_M pierde 1,92 puntos de F1 en CORD respecto a BF16, un deterioro relevante para extracción de campos en recibos.
- El rendimiento en documentos se midió con una aproximación propia sobre 100 páginas de OmniDocBench, no con la métrica oficial.
- Riesgo de alucinación en campos ausentes: no se documentan mecanismos específicos de abstención en tareas KIE.
- Sesgos por idioma y script: la cobertura evaluada se limita a inglés y chino en documentos, y a escritura latina en la detección de cajas.
- Las versiones de dependencias fijadas son estrictas y pueden romper la integración con stacks existentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros.

## Enlaces

- Repositorio principal: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage
- Variante MLX: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage-MLX
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-Mirage-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Detector Mirage (Cactus Compute): https://huggingface.co/Cactus-Compute/mirage
