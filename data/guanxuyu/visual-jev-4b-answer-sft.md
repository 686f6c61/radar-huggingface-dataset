# guanxuyu/visual-jev-4b-answer-sft

## Resumen

visual-jev-4b-answer-sft es un adaptador LoRA supervisado por respuestas entrenado sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, desarrollado por Guanxu Yu y Yuhang Yao. Su propósito es resolver un problema concreto: dado un contexto visual compartido (una imagen más un estado o contexto común), responder de forma independiente a múltiples preguntas de opción múltiple reutilizando una única codificación visual, y devolver una distribución de probabilidad sobre las opciones candidatas de cada pregunta.

El adaptador no incorpora una cabeza de decisión adicional: las puntuaciones sobre las opciones se obtienen directamente de la LM head del backbone Qwen3-VL-4B-Instruct. El repositorio ocupa 0,4 GB y se distribuye en formato PEFT/safetensors, lo que implica que para utilizarlo hay que cargar el modelo base (aproximadamente 4.000 millones de parámetros) junto con el adaptador.

Es relevante ahora porque aborda el escenario de "una imagen, preguntas independientes, cómputo compartido", habitual en pipelines de evaluación visual y agentes que hacen varias consultas sobre la misma imagen. El autor reporta un 88,5 % de exactitud macro en cuatro benchmarks (GQA, SNLI-VE, TextVQA y TallyQA), con +2,77 pp frente a TypeSafe Jev y +5,06 pp frente a OpenAI Decisions, si bien con las salvedades metodológicas que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible (el adaptador LoRA; el backbone Qwen3-VL-4B-Instruct tiene ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); requiere el backbone Qwen/Qwen3-VL-4B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo PEFT montado sobre Qwen3-VL-4B-Instruct, un transformer multimodal de unos 4.000 millones de parámetros que procesa imagen y texto. La innovación del enfoque no está en la arquitectura del backbone, sino en el flujo de inferencia: se codifica la imagen y el contexto compartido una sola vez, y a partir de esa codificación se ejecutan en paralelo varias ramas de pregunta independientes. Cada rama devuelve probabilidades sobre las opciones candidatas (el runner admite entre 2 y 16 opciones por pregunta, aunque la evaluación cubre como máximo ocho), calculadas con la LM head existente del backbone, sin cabeza de decisión adicional.

El adaptador se entrena con supervisión directa sobre respuestas (answer SFT) en tareas de pregunta visual de opción múltiple. Según la model card, el entrenamiento utilizó datos de entrenamiento de GQA y SNLI-VE; no se detalla el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. El ejemplo incluido en la documentación muestra que el adaptador puede seleccionar una opción de premisa falsa ("incorrect_question") cuando la pregunta no se corresponde con la imagen, con probabilidad 0,966 en el caso del perro y la persona. El autor advierte que esa probabilidad es relativa a las opciones suministradas y no una puntuación de evidencia calibrada.

## Capacidades

- Respuesta a preguntas visuales de opción múltiple (visual question answering) sobre una imagen con contexto compartido.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text) heredado del backbone Qwen3-VL-4B-Instruct.
- Ejecución de múltiples preguntas independientes sobre una misma imagen con una sola codificación visual, lo que reduce cómputo frente a repetir la codificación por pregunta.
- Devolución de distribuciones de probabilidad sobre 2 a 16 opciones candidatas por pregunta.
- Detección de premisas falsas mediante opciones explícitas de tipo "incorrect_question" (según el ejemplo de la model card).
- Calibración de probabilidades mediante temperature scaling y umbrales de riesgo ajustables con ejemplos etiquetados propios (soporte de `--save-logits` en el runner).
- Capacidades generales del backbone (generación de texto, razonamiento, posible tool calling y multilingüismo) no verificadas específicamente para este adaptador: no disponible.

## Casos de uso

- Evaluación automática de modelos de visión: el adaptador permite puntuar respuestas de opción múltiple sobre benchmarks como GQA, SNLI-VE, TextVQA o TallyQA devolviendo probabilidades por opción, lo que facilita métricas de calibración (NLL, ECE, AUROC) además de la exactitud.
- Anotación y control de calidad de datasets visuales: con una sola codificación de imagen se pueden lanzar varias preguntas de verificación sobre la misma muestra, útil para revisar etiquetas de forma masiva y barata en GPUs de consumo.
- Sistemas de decisión asistida sobre imágenes: en inspección de producto o verificación documental, el modelo devuelve una opción y su probabilidad entre candidatos predefinidos, y el umbral de riesgo se ajusta con datos propios para derivar los casos dudosos a revisión humana.
- Enrutamiento y triaje en pipelines multimodales: dado un contexto visual compartido, se formulan preguntas independientes (categoría, presencia de objetos, texto legible) en una sola pasada, lo que encaja en etapas de preprocesado con latencia ajustada.
- Investigación en calibración de modelos multimodales: el runner permite guardar logits y ajustar temperatura, lo que facilita estudiar la fiabilidad de las probabilidades en tareas visuales de opción múltiple.
- Detección de premisas falsas en asistentes visuales: mediante la opción "incorrect_question", el adaptador puede marcar preguntas que no se corresponden con la imagen antes de que un sistema mayor las procese.
- Prototipado en Apple Silicon: el runner soporta CUDA y Apple MPS con `--device auto`, lo que permite probar el flujo completo en un portátil con chip de Apple sin infraestructura dedicada.

## Benchmarks y rendimiento

Datos reportados por el autor (noviembre de 2026) sobre el conjunto de test de cada benchmark (70 % de las imágenes, split por hash fijo del id de imagen), con las mismas preguntas y orden de opciones para todos los sistemas y temperatura ajustada por sistema en imágenes de calibración comunes. NLL y ECE tras temperature scaling; AUROC de la probabilidad superior para respuestas correctas frente a incorrectas. Macro es la media de igual peso de los cuatro benchmarks.

| Sistema | GQA | SNLI-VE | TextVQA | TallyQA | Macro | NLL (TS) | ECE (TS) | AUROC |
|---|---|---|---|---|---|---|---|---|
| Visual Jev 8B | 0,919 | 0,818 | 0,979 | 0,855 | 0,893 | 0,285 | 0,021 | 0,896 |
| Visual Jev 4B | 0,916 | 0,808 | 0,975 | 0,841 | 0,885 | 0,309 | 0,025 | 0,890 |
| TypeSafe Jev | 0,885 | 0,713 | 0,982 | 0,851 | 0,858 | 0,361 | 0,013 | 0,870 |
| OpenAI Decisions | 0,834 | 0,732 | 0,955 | 0,818 | 0,835 | 0,440 | 0,020 | 0,833 |

Salvedades indicadas por el autor: los adaptadores se entrenaron con datos de entrenamiento de GQA y SNLI-VE, mientras que los datos de entrenamiento de las APIs son desconocidos; la mayor parte de la ventaja proviene de esas dos tareas, y en las dos familias de tareas no vistas en post-entrenamiento los sistemas están próximos, con TypeSafe Jev liderando en TextVQA. Las APIs devuelven probabilidades redondeadas a dos decimales (con suelo de 0,005), y las peticiones fallidas (1,9 % en TypeSafe Jev, 0,3 % en GPT-6 Luna) cuentan como acierto uniforme. TypeSafe Jev no es determinista (cambió la respuesta superior en el 0,8 % de GQA, 2,7 % de SNLI-VE y 10,3 % de TallyQA corto al repetir la petición).

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,4 GB, pero la inferencia requiere cargar el backbone Qwen3-VL-4B-Instruct (~4B parámetros), por lo que la VRAM dominante es la del modelo base.
- VRAM estimada para el backbone en precisión de 16 bits: del orden de 8-9 GB solo para pesos, más memoria para el codificador visual, activaciones y caché; en cuantización de 8 bits o inferior se reduce, aunque el autor no publica cifras de cuantización.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o superior (A100, H100) permite holgura en fp16; GPUs de consumo con 12-16 GB podrían ser suficientes en cuantización, sin datos confirmados.
- Soporte explícito de Apple Silicon mediante MPS con `--device auto` (prioriza CUDA y luego Apple MPS).
- El runner oficial es `code/examples/quickstart.py` del repositorio GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro (4 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| visual-jev-4b-answer-sft | ~4B (backbone) + LoRA | no disponible | 0,885 | apache-2.0 | Hugging Face (adaptador PEFT) |
| visual-jev-8b-answer-sft | ~8B (backbone) + LoRA | no disponible | 0,893 | no disponible | Hugging Face |
| TypeSafe Jev (API) | no disponible | no disponible | 0,858 | propietaria (API) | API de pago |
| OpenAI Decisions (GPT-6 Luna, API) | no disponible | no disponible | 0,835 | propietaria (API) | API de pago |

La comparación se limita a los sistemas evaluados por el autor en el mismo protocolo. No se dispone de comparación con otros adaptadores LoRA de opción múltiple ni con el backbone Qwen3-VL-4B-Instruct sin ajuste.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con GQA y SNLI-VE, puede heredar los sesgos de composición y anotación de esos datasets.
- Riesgo de alucinación: las probabilidades son relativas a las opciones suministradas; el autor advierte explícitamente que no constituyen una puntuación de evidencia calibrada, y que las probabilidades en bruto están sobreconfiadas.
- Sesgo de evaluación: la ventaja frente a las APIs se concentra en GQA y SNLI-VE, tareas presentes en el entrenamiento del adaptador; en TextVQA y TallyQA la diferencia es menor y TypeSafe Jev supera al modelo en TextVQA.
- Idiomas soportados: no disponibles; no se documenta comportamiento multilingüe del adaptador.
- Longitud de contexto: no disponible; el flujo asume una imagen y un contexto compartido, con 2 a 16 opciones por pregunta (evaluación hasta ocho).
- Restricciones de licencia: apache-2.0 para el adaptador; deben respetarse además las condiciones del backbone Qwen/Qwen3-VL-4B-Instruct.
- Dependencia del backbone: el adaptador no es autónomo; requiere descargar Qwen3-VL-4B-Instruct y un entorno PyTorch con CUDA o MPS.
- Calibración obligatoria en producción: el autor recomienda ajustar temperatura y umbral de riesgo con ejemplos etiquetados propios antes de actuar sobre las probabilidades.
- No determinismo del sistema comparado (TypeSafe Jev) y redondeo de probabilidades de las APIs condicionan la comparación publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guanxuyu/visual-jev-4b-answer-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo hermano 8B: https://huggingface.co/guanxuyu/visual-jev-8b-answer-sft
- Paper (arXiv): https://arxiv.org/abs/2609.25845
- Web del proyecto: https://guanxuyu-sv.github.io/Visual-Jev/
- Código y quickstart: https://github.com/guanxuyu-sv/Visual-Jev
- Datos de comparación con APIs: https://github.com/guanxuyu-sv/Visual-Jev/blob/fe031bf/data/api_comparison.json
