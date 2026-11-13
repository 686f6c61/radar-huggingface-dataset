# corners-ai/CoCo-Decision-Vision-0.8B

## Resumen

CoCo-Decision-Vision-0.8B es un ajuste fino del modelo vllm-sr/d3-lite (0,85B de parámetros) desarrollado por corners-ai, orientado a la toma de decisiones sobre imágenes. A diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (texto o JSON, opcionalmente con imágenes o vídeos) y una serie de preguntas tipadas (`choice`, `noul` sí/no, `score`), y devuelve una probabilidad para cada opción en un único forward pass. Está construido sobre Qwen3.5-0.8B y emplea una arquitectura transformer multimodal con codificador visual congelado.

El modelo resuelve el problema de la clasificación y decisión zero-shot multimodal con bajo coste computacional: en lugar de generar respuestas autoregresivas, calcula directamente probabilidades sobre opciones predefinidas. Esto lo hace adecuado para pipelines de enrutamiento semántico, moderación de contenido y extracción de decisiones estructuradas donde la latencia y el coste importan más que la generación libre de texto.

Es relevante ahora porque demuestra que un modelo de menos de 1B de parámetros puede obtener mejoras sustanciales en benchmarks de visión (índice público de visión de 47,37 a 54,62) mediante ajuste fino dirigido con datos de decisión, manteniendo la interfaz y el runtime del modelo base. Su licencia Apache-2.0 en pesos y código contrasta con las restricciones de uso derivadas de algunos datasets de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con codificador visual y proyector congelados |
| Parámetros totales | 852.985.920 (0,85B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos y código); uso restringido a investigación por términos de datasets de entrenamiento |
| Formato de pesos | safetensors |
| Pipeline | zero-shot-classification |
| Modelo base | vllm-sr/d3-lite (revisión 03560c26) |
| Tamaño del repo | 1,7 GB |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-lite, que a su vez se construye sobre Qwen/Qwen3.5-0.8B. La arquitectura es un transformer multimodal con un codificador visual y un proyector que permanecen congelados durante el ajuste fino. Solo se ajustan completamente las capas del modelo de lenguaje y el readout (cabeza de decisión). La innovación principal es el mecanismo `system_one`: dado un estado y un conjunto de preguntas tipadas, el modelo calcula una probabilidad por opción en un único forward pass sin generar texto, lo que reduce la latencia frente a la decodificación autoregresiva.

El entrenamiento se realizó en dos etapas con ajuste fino completo de las capas del LM y el readout (LR 1e-5, readout 1e-4, layer-wise decay 0,9, warmup del 5%, schedule coseno, una época, AdamW con weight decay 0,01). La primera etapa usó unas 245.000 filas de decisión de texto de splits de train de datasets públicos en formatos del Decision Index, con dos semillas promediadas uniformemente (model soup). La segunda etapa partió de ese soup y usó unas 15.500 preguntas de imagen de splits de train de datasets públicos de imagen, convertidas a los layouts de la suite de visión pública, con un replay de 10.000 filas de texto. El checkpoint se eligió sobre un dev set de imagen held-out. Los pesos liberados son los de la etapa 2 interpolados a medio camino hacia d3-lite (WiSE-FT, alpha 0,5). Se verificó por SHA-256 que ninguna imagen de entrenamiento coincidía con las de la suite de visión pública y no se usó ningún split de evaluación de benchmark para entrenar.

## Capacidades

- Clasificación zero-shot multimodal: devuelve probabilidades sobre opciones definidas por el usuario sin generar texto.
- Preguntas tipadas: soporta `choice` (elección entre criterios), `noul` (sí/no) y `score` (puntuación).
- Entrada multimodal: acepta estado en texto o JSON, con imágenes (rutas locales, URLs http(s), objetos PIL o data URLs base64) y vídeos.
- Decisión en un único forward pass: no requiere decodificación autoregresiva, lo que reduce latencia.
- Extracción de información de documentos: buena respuesta en KIE (CORD + FUNSD) e InfographicVQA.
- Razonamiento sobre gráficos: mejora notable en CharXiv.
- Moderación de contenido: clasificación de memes dañinos (Hateful Memes).
- Comprensión de interfaces y capturas: Mind2Web para decisiones sobre elementos de UI.
- Emparejamiento imagen-texto: Winoground y BLINK (mejora menor).
- Conteo y posición de objetos: preguntas derivadas de cajas de COCO.
- Servidor de inferencia incluido: `d3_server.py` con endpoint POST `/v1/systemone`.

## Casos de uso

- Enrutamiento semántico en pipelines de IA: dado un estado y un conjunto de rutas posibles, el modelo devuelve la probabilidad de cada ruta en un solo forward pass, integrándose en sistemas de orquestación de modelos o agentes.
- Moderación de contenido visual: clasificación de memes e imágenes dañinas mediante preguntas `noul` o `choice`, con la ventaja de no generar texto y mantener baja latencia en colas de revisión.
- Extracción de campos en documentos: uso de preguntas `choice` y `noul` sobre recibos y formularios (KIE) para validar presencia de campos, importes o métodos de pago sin pipeline OCR + LLM generativo.
- Automatización de atención al cliente con evidencia visual: dado un mensaje del cliente y una captura o recibo adjunto, el modelo decide si el recibo lista el producto o cómo se pagó el pedido, devolviendo probabilidades para el sistema de tickets.
- Análisis de gráficos e infografías: responder preguntas de decisión sobre CharXiv e InfographicVQA para sistemas de informes automatizados que necesitan clasificar tendencias o valores.
- Comprensión de interfaces para agentes: decisiones sobre elementos de UI en capturas de pantalla (Mind2Web) para agentes que deben elegir acciones o localizar controles.
- Verificación de emparejamiento imagen-texto: comprobar si una imagen corresponde a una descripción (Winoground) en pipelines de control de calidad de catálogos.
- Conteo y localización de objetos: preguntas de conteo y posición derivadas de cajas para inventario visual o control de stock.

## Benchmarks y rendimiento

Resultados propios del autor sobre la suite pública de visión (Decision Index vision 0.3, 12.210 filas, imágenes limitadas a 1,6 MP, ejecutados con `d3_server.py`). No son resultados de leaderboard; la ejecución propia de d3-lite obtiene 47,37 frente a 47,88 en el board.

| Benchmark (accuracy, %) | d3-lite | CoCo-Decision-Vision-0.8B |
|---|---:|---:|
| CV-Bench | 79,0 | 79,7 |
| BLINK | 60,0 | 62,5 |
| RealWorldQA | 61,3 | 62,8 |
| CharXiv | 65,4 | 70,7 |
| InfographicVQA | 79,5 | 84,8 |
| Mind2Web | 58,5 | 74,4 |
| Winoground | 76,8 | 79,0 |
| KIE (CORD + FUNSD) | 85,6 | 90,3 |
| Moderation (Hateful Memes) | 56,8 | 64,4 |
| R-Bench-M | 25,1 | 25,7 |
| MMMU-Pro vision | 19,2 | 19,8 |
| Índice público de visión | 47,37 | 54,62 |

Nota del autor: los números de Mind2Web provienen de una copia de la suite con etiquetas de cajas en una fuente distinta; la ejecución enviada al board usa la suite verificada. La mitad privada del board la ejecutan sus mantenedores y no se conoce. No se midieron puntuaciones del board de texto para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,85B de parámetros y pesos en safetensors (repo de 1,7 GB), la inferencia en fp16 requiere aproximadamente 2 GB de VRAM para pesos, más overhead del codificador visual y activaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con al menos 4-6 GB de VRAM, pero no se confirma en la model card.
- Cabida en GPU consumer: previsiblemente sí por tamaño de parámetros, aunque no se documenta oficialmente.
- Opciones de despliegue: servidor propio incluido (`python d3_server.py --model . --port 8000`, endpoint POST `/v1/systemone`) y carga vía `transformers` con `trust_remote_code=True`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice visión | Licencia | Notas |
|---|---:|---|---:|---|---|
| CoCo-Decision-Vision-0.8B | 0,85B | No disponible | 54,62 | Apache-2.0 (uso restringido a investigación por datasets) | Ajuste fino de decisión, sin generación de texto |
| vllm-sr/d3-lite | 0,85B | No disponible | 47,37 | Apache-2.0 | Modelo base; interfaz idéntica |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | No disponible | Apache-2.0 | Modelo fundacional subyacente; generativo |

No se dispone de comparación con otros modelos de decisión zero-shot multimodal de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Las mejoras son mayores en tipos de pregunta presentes en los datos de entrenamiento de imagen (Mind2Web, Hateful Memes, KIE, CharXiv, InfographicVQA); las preguntas multi-imagen y el emparejamiento de leyendas (BLINK, Winoground) mejoran menos.
- La elección del peso de interpolación se guio por la suite pública de visión, por lo que los números públicos son algo optimistas.
- No medido para esta versión: el Decision Index de texto, entradas de vídeo y calibración.
- Licencia: aunque los pesos y el código son Apache-2.0, los datos de entrenamiento incluyen Hateful Memes y FUNSD (solo investigación no comercial) y ChartQA (GPL-3.0 en su Hub card); el autor libera el modelo solo para investigación y evaluación, no para uso comercial.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a probabilidades mal calibradas o decisiones erróneas en opciones no vistas.
- Sesgos: no documentados explícitamente; los datasets de entrenamiento (COCO, Hateful Memes, capturas web) pueden introducir sesgos demográficos y de dominio.
- Limitaciones de idioma: no se declaran idiomas soportados.
- El conjunto interno de imágenes de seguridad no se distribuye y no se proporcionará.
- No es una release oficial del equipo de vLLM Semantic Router y no ha sido revisado por dicho equipo.

## Enlaces

- Hugging Face: https://huggingface.co/corners-ai/CoCo-Decision-Vision-0.8B
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset ChartQA: https://huggingface.co/datasets/HuggingFaceM4/ChartQA
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset Hateful Memes: https://huggingface.co/datasets/neuralcatcher/hateful_memes
- Dataset DocVQA (InfographicVQA): https://huggingface.co/datasets/lmms-lab/DocVQA
- Dataset Multimodal-Mind2Web: https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web
- Dataset COCO: https://huggingface.co/datasets/detection-datasets/coco
