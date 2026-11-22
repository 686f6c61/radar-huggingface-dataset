# krotreaksmey/TinyOCRkhmer

## Resumen

TinyOCRkhmer es un modelo especializado en reconocimiento de líneas de texto (text-line recognition) para OCR, desarrollado por el usuario krotreaksmey. Su función concreta es transcribir recortes de una sola línea que combinan texto jemer (khmer) en Unicode con fórmulas matemáticas en LaTeX, un caso poco cubierto por los motores OCR generalistas. Está pensado para digitalizar material docente de los libros de texto nacionales de Camboya (currículo MoEYS), donde conviven ortografía jemer, numerales nativos y notación matemática compleja.

Técnicamente se basa en la arquitectura PARSeq (Permutation Autoregressive Sequence), que combina un encoder Vision Transformer con un decoder autorregresivo. La versión v4.0, considerada SOTA por el autor, emplea 24,3 millones de parámetros, una resolución de entrada de 64 x 256 píxeles y un vocabulario híbrido de 478 tokens que incluye grupos LaTeX multi-carácter y símbolos matemáticos Unicode. El checkpoint principal reporta un Character Error Rate (CER) de 17,20 % sobre el conjunto de evaluación del autor.

El modelo es relevante por su especialización: no compite en tamaño con los grandes modelos multimodales, sino que resuelve un problema de nicho (OCR jemer-matemático) con un peso de unos 93 MB y licencia Apache 2.0, lo que facilita su integración en pipelines de document AI ligeros y su despliegue en hardware modesto. No obstante, el ecosistema que lo rodea es reducido (27 descargas, sin likes en el momento de la consulta) y la información pública sobre benchmarks independientes es escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PARSeq (encoder Vision Transformer de 12 bloques + decoder autorregresivo) |
| Parámetros totales | 24.335.326 (~24,3 M); encoder ~21,57 M, decoder ~2,76 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 193 tokens de secuencia (block size); entrada de imagen 64 x 256 px (512 patches) |
| Tipos de cuantización | no disponible (pesos distribuidos en `.pt`; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint, ~93 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PARSeq: un encoder Vision Transformer que divide la imagen de entrada (64 x 256 píxeles RGB) en patches de 4 x 8, con dimensión de embedding 384 y 6 cabezas de atención en 12 bloques, seguido de un decoder autorregresivo de 6 cabezas y 2,76 M de parámetros que genera la secuencia de tokens. El vocabulario de 478 tokens está diseñado específicamente para el dominio: incluye grupos LaTeX multi-carácter (`\left(`, `\right)`, `\pmatrix`, `\cases`), funciones (`\dfrac`, `\lim`, `\int`), símbolos griegos, numerales jemer Unicode y operadores matemáticos (`∈`, `∪`, `∫`, `√`, `∞`).

El entrenamiento se realizó durante 50 épocas sobre el dataset propio `krotreaksmey/khmer-math-textbook`, con recortes de líneas filtrados por ruido y distribuidos de forma equilibrada entre álgebra, cálculo, trigonometría y geometría del currículo MoEYS. La versión v4.0 se entrenó sobre 101.000 líneas "limpias", frente a las 101.463 del checkpoint v3.0, y aumentó la resolución de entrada de 48 x 192 a 64 x 256 para separar subíndices consonánticos jemer y radicales anidados. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Reconocimiento de texto jemer en Unicode con ortografía Chuon Nath y numerales jemer nativos.
- Transcripción de fórmulas matemáticas complejas a LaTeX, incluidas fracciones anidadas, matrices, sistemas de ecuaciones y límites.
- Reconocimiento conjunto de texto y matemáticas en una misma línea, sin separar modalidades.
- Soporte de símbolos matemáticos Unicode (`∈`, `∉`, `⊂`, `∪`, `∩`, `∫`, `√`, `∞`).
- Procesamiento de recortes de una sola línea (no es un modelo de página completa ni de layout).
- Salida de secuencia limitada a 193 tokens por línea.
- Idiomas: jemer e inglés; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización de libros de texto camboyanos: el modelo transcribe recortes de línea de manuales MoEYS, combinando texto jemer y fórmulas LaTeX en una sola pasada, lo que permite reconstruir el contenido estructurado de material escaneado.
- Extracción de fórmulas para entornos académicos: convierte líneas matemáticas impresas en LaTeX listo para insertar en documentos científicos o plataformas de e-learning, gracias a su vocabulario específico de comandos LaTeX.
- Pipeline de document AI en dos etapas: combinado con el detector de líneas YOLO v3.1 del mismo autor, permite segmentar y transcribir páginas completas de material docente.
- Preservación de patrimonio lingüístico: digitalización de textos jemer con ortografía tradicional, incluyendo numerales nativos que los OCR genéricos suelen confundir.
- Generación de datasets paralelos imagen-texto: al ser un modelo pequeño (93 MB) y con licencia Apache 2.0, puede usarse para etiquetar automáticamente grandes volúmenes de recortes y crear corpus de entrenamiento.
- Despliegue en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en CPU o GPU de gama baja dentro de aplicaciones de digitalización offline o en el borde.
- Asistencia a la corrección de exámenes o apuntes matemáticos: transcripción de líneas manuscritas o impresas para su revisión posterior, siempre con verificación humana dado el CER reportado.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y comparan checkpoints internos del mismo modelo, no con terceros:

| Checkpoint | Datos de entrenamiento | Entrada | Parámetros | CER |
|---|---|---|---|---|
| `best_khmer_parseq_model_clean_data_V4_cer17.20%.pt` | 101K líneas limpias | 64 x 256 | 24,3 M | 17,20 % |
| `best_khmer_parseq_model_101K_cer21.35%.pt` | 101.463 líneas | 48 x 192 | 6,1 M | 21,35 % |
| `best_khmer_parseq_model_60K_50epoch_cer_23.31%.pt` | 66.259 líneas | 48 x 192 | 6,1 M | 23,31 % |
| `best_khmer_parseq_model _50epoch.pt` | ~45.000 líneas | 48 x 192 | 6,1 M | ~26,0 % |
| `best_khmer_parseq_model_30epoch.pt` | ~41.900 líneas | 48 x 192 | 6,1 M | ~34,8 % |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos OCR de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en FP32 (~93 MB de checkpoint), más el overhead de activaciones de un ViT de 24,3 M de parámetros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes, cualquier GPU moderna (RTX 3060 en adelante, A100, H100) acelera el proceso, pero no es necesario hardware de datacenter.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en sistemas embebidos con suficiente memoria.
- Opciones de despliegue: el autor proporciona código Python (`model.py`) con carga vía `huggingface_hub` y PyTorch/timm; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TinyOCRkhmer v4.0 | PARSeq (ViT + decoder autorregresivo) | 24,3 M | 64 x 256 px, 193 tokens | jemer, inglés | Apache 2.0 | Hugging Face |
| TrOCR (Microsoft) | Encoder-decoder ViT | ~334 M (base) / ~558 M (large) | 384 x 384 px | inglés principalmente | MIT | Hugging Face |
| PARSeq (baidu/pytorch) | PARSeq genérico | ~24 M (config. base) | variable | multilingüe según entrenamiento | Apache 2.0 | Hugging Face / repos |
| VietOCR | Transformer OCR | ~13-25 M | variable | vietnamita, inglés | Apache 2.0 | Hugging Face |

No se dispone de comparaciones de rendimiento publicadas entre TinyOCRkhmer y estos modelos en la información proporcionada; la comparativa se limita a características estructurales. TinyOCRkhmer se distingue por su vocabulario híbrido jemer-LaTeX, que los modelos genéricos no cubren.

## Limitaciones y advertencias

- El CER reportado del 17,20 % es relativamente alto para producción y procede de la evaluación del propio autor; no hay validación independiente.
- El modelo solo procesa recortes de una línea; requiere un detector de líneas previo (el autor ofrece un YOLO v3.1 separado) para páginas completas.
- La secuencia de salida está limitada a 193 tokens, lo que puede truncar líneas matemáticas muy largas o con anidamiento profundo.
- Cobertura lingüística restringida a jemer e inglés; no se documenta soporte de otras lenguas ni de escritura manuscrita.
- Riesgo de alucinación en símbolos ambiguos o poco frecuentes: el decoder autorregresivo puede generar comandos LaTeX plausibles pero incorrectos en imágenes de baja calidad.
- Sesgos potenciales derivados del corpus de entrenamiento (libros de texto MoEYS), que puede no representar variantes dialectales, tipografías o material fuera del currículo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el ecosistema es muy reducido (27 descargas, 0 likes), lo que limita la comunidad y la validación externa.
- No se documentan cuantizaciones ni formatos optimizados para despliegue en producción más allá del checkpoint PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krotreaksmey/TinyOCRkhmer
- Dataset de entrenamiento: https://huggingface.co/datasets/krotreaksmey/khmer-math-textbook
- Detector de líneas YOLO v3.1: https://huggingface.co/krotreaksmey/Yolo_Detect_khmer_math
- Space interactivo: https://huggingface.co/spaces/krotreaksmey/khmer-math-detector
- Checkpoint v4.0: https://huggingface.co/krotreaksmey/TinyOCRkhmer/blob/main/best_khmer_parseq_model_clean_data_V4_cer17.20%25.pt
