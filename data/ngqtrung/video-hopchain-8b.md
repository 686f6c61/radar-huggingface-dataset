# ngqtrung/Video-HopChain-8B

## Resumen

Video-HopChain-8B es un ajuste fino del modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por Trung Nguyen Quang y colaboradores, orientado al razonamiento multi-salto sobre vídeo (video multi-hop reasoning). El modelo parte de los pesos de Qwen3-VL-8B-Instruct y se entrena en dos etapas con GRPO (Group Relative Policy Optimization): primero sobre una mezcla general de pregunta-respuesta de vídeo y después sobre el conjunto Video-HopChain con una técnica propia denominada Confidence-Gated Exploration (CGE). Resuelve el problema del colapso de ventaja (advantage collapse) en GRPO cuando los 8 rollouts de una pregunta son todos correctos o todos incorrectos y el grupo no aporta varianza de recompensa.

La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal con encoder visual y decoder de lenguaje, con 8.767.123.696 parámetros totales en BF16. La innovación principal es CGE: cuando los primeros 4 rollouts de un grupo son homogéneos, los 4 restantes se generan enmascarando el token de mayor probabilidad de la política cuando esta supera tau = 0.95, únicamente dentro del tramo de razonamiento, forzando exploración sin gastar rollouts adicionales.

El modelo es relevante porque mejora de forma consistente al base en ocho benchmarks de razonamiento sobre vídeo (media de 52,3 a 59,3) y multiplica por más de 1,7 la precisión in-domain en el split reservado de Video-HopChain (13,4 a 23,2). Se publica bajo licencia Apache 2.0 y está pensado para investigación en razonamiento temporal y multi-salto sobre vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL): encoder visual + decoder de lenguaje, con modo de razonamiento explícito |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL-8B-Instruct define el límite; no se especifica en la información) |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), librería transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL, un transformer multimodal que procesa vídeo e imagen junto con texto y genera la respuesta dentro de un bloque ``, con la respuesta final en `<answer>\boxed{...}</answer>`. El ajuste se realiza en dos etapas de GRPO. La etapa 1 usa una mezcla general de QA de vídeo de 105.993 filas con 24 frames por vídeo. La etapa 2 aplica GRPO con CGE sobre Video-HopChain (22.550 filas, 140 frames por vídeo). La recompensa combina coincidencia exacta sobre la suma entera y un término de formato.

La innovación técnica es Confidence-Gated Exploration (CGE), que mitiga el colapso de ventaja de GRPO. Con 8 rollouts por pregunta, los 4 primeros se muestrean de forma normal; si los 4 son todos correctos o todos incorrectos, el grupo no tiene varianza y no genera gradiente, por lo que los 4 restantes se muestrean con el token de mayor probabilidad de la política enmascarado cuando su probabilidad supera tau = 0.95, solo dentro del tramo de razonamiento. Todas las posiciones permanecen en la pérdida: una posición enmascarada conserva un peso pequeño derivado de su ratio de importancia cuando su rollout supera al grupo, y no recibe gradiente en caso contrario. Los 8 rollouts entran en la ventaja del grupo, de modo que el método no consume rollouts extra. El entrenamiento se ejecutó en 4 nodos de 8 H100 de 80 GB con el trainer asíncrono verl.

## Capacidades

- Generación de texto y razonamiento multimodal sobre vídeo e imagen (pipeline `video-text-to-text` e `image-text-to-text`).
- Razonamiento multi-salto sobre vídeo: encadenar varios hechos temporales o visuales para responder una pregunta compuesta.
- Modo de razonamiento explícito con bloques `<think>` y respuesta final en `<answer>\boxed{...}</answer>`.
- Respuesta a preguntas de opción múltiple y de respuesta abierta sobre vídeo (evaluado en VCRBench, Video-MME, Video-MMMU y otros).
- Razonamiento sobre vídeos largos (evaluado con 100 frames por vídeo en `lmms-eval`; entrenado en la etapa 2 con 140 frames).
- Capacidades heredadas del base Qwen3-VL-8B-Instruct (visión, texto, instrucciones); no se documentan en la información proporcionada detalles adicionales sobre tool calling o agentes.
- Soporte multilingüe limitado al inglés según la model card.

## Casos de uso

- Análisis de vídeos largos con preguntas compuestas: el modelo puede responder cuestiones que requieren encadenar varios eventos separados en el tiempo, como identificar un objeto, seguirlo y relacionarlo con una acción posterior, gracias al entrenamiento específico en multi-hop y a los 140 frames usados en la etapa 2.
- Moderación y auditoría de contenido audiovisual: permite formular preguntas de varios pasos sobre lo que ocurre en un vídeo (quién hace qué, cuándo y con qué objeto) y obtener una respuesta razonada con traza de pensamiento, útil para revisión humana posterior.
- Investigación en razonamiento temporal: sirve como modelo de referencia para estudiar CGE y GRPO en tareas de vídeo, ya que el paper publica hiperparámetros en el apéndice C y el código está disponible.
- Evaluación automática de material docente en vídeo: responder preguntas de comprensión sobre clases grabadas o demostraciones, con la respuesta final en formato `\boxed{}` fácil de parsear para puntuación automática.
- Análisis de vídeo de vigilancia o tráfico: consultas multi-salto como "¿el vehículo que entró antes cruzó después el semáforo en rojo?", aprovechando la ventana de frames y el razonamiento encadenado.
- Generación de anotaciones y datos sintéticos de razonamiento: usar el modelo para producir cadenas de razonamiento sobre vídeo que luego se filtren y reutilicen en pipelines de destilación o aumento de datos.
- Asistente de accesibilidad: describir y responder preguntas detalladas sobre contenido audiovisual para usuarios con discapacidad visual, con respuestas razonadas sobre relaciones entre elementos del vídeo.

## Benchmarks y rendimiento

Precisión en porcentaje, evaluada con `lmms-eval` a 100 frames por vídeo. "In-domain" es el split reservado de 1.000 preguntas de Video-HopChain. VCRBench se reporta en su subconjunto de opción múltiple.

| Modelo | Video-MME | PerceptionComp | Video-MMMU | Video-Holmes | VCRBench | MMR-V | LongVideo-Reason | VRBench | Media | In-domain |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct | 64,0 | 28,1 | 63,5 | 40,7 | 32,0 | 42,7 | 72,6 | 74,7 | 52,3 | 13,4 |
| + RL estándar | 65,8 | 34,3 | 63,0 | 47,4 | 35,9 | 43,4 | 76,1 | 77,6 | 55,4 | 13,4 |
| + RL estándar + CGE | 67,9 | 34,4 | 62,5 | 48,5 | 35,1 | 46,4 | 78,8 | 79,5 | 56,6 | 16,4 |
| + RL estándar + Video-HopChain | 68,6 | 36,2 | 64,7 | 48,6 | 42,1 | 45,9 | 77,8 | 79,4 | 57,9 | 21,2 |
| **Video-HopChain-8B (este modelo)** | **69,2** | **37,4** | **67,5** | **48,6** | **44,9** | **46,6** | **78,9** | **81,0** | **59,3** | **23,2** |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV para vídeo; en la práctica se recomienda al menos 24 GB para secuencias cortas y 40-80 GB para vídeo con muchos frames.
- GPU recomendadas: H100 80 GB o A100 80 GB para evaluación a 100 frames; el entrenamiento documentado usó 4 nodos de 8 H100 80 GB.
- GPU de consumo: en BF16 no cabe en GPUs de 16 GB; en GPUs de 24 GB (RTX 4090, RTX 3090) requeriría cuantización, que no está documentada oficialmente para este modelo.
- Opciones de despliegue: transformers con `Qwen3VLForConditionalGeneration` y `AutoProcessor` (soporte oficial); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El coste dominante es el procesamiento de frames de vídeo (100 frames en evaluación, 140 en entrenamiento), que escala con la resolución y el número de frames.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en 8 benchmarks de vídeo | In-domain Video-HopChain | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Video-HopChain-8B | 8,77 B | no disponible | 59,3 | 23,2 | Apache 2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct | 8 B (aprox., no confirmado en la información) | no disponible | 52,3 | 13,4 | no disponible en la información | Hugging Face (modelo base) |
| Video-HopChain-8B-Standard-RL | 8,77 B | no disponible | 55,4 | 13,4 | Apache 2.0 | Hugging Face (etapa intermedia del mismo autor) |
| Variante "+ RL estándar + CGE" (no publicada como checkpoint independiente en la información) | 8,77 B | no disponible | 56,6 | 16,4 | Apache 2.0 (según el paper) | no disponible como checkpoint |

No se dispone de datos de benchmarks de otros modelos de la misma categoría (por ejemplo, otros ajustes de razonamiento sobre vídeo de 7-9 B) en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha evaluado a una única escala de modelo (8 B); no hay evidencia de que el método CGE generalice a otros tamaños.
- El conjunto de datos Video-HopChain es sintético y se verificó contra subtítulos (captions) en lugar de contra los frames, por lo que un error de subtítulo puede propagarse a una etiqueta.
- El paper no ablaciona todos los ajustes de exploración (tau, número de rollouts enmascarados), según reconoce el propio autor.
- Riesgo de alucinación inherente a los modelos de lenguaje y agravado en vídeo largo, donde el modelo puede inferir eventos no presentes en los frames.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está documentado.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct puede tener sus propias condiciones que conviene verificar.
- El formato de salida exige usar el mismo system prompt que en entrenamiento (`<think>` y `<answer>\boxed{...}</answer>`); usarlo con otro prompt puede degradar el rendimiento.
- No se documentan cuantizaciones oficiales ni integraciones con motores de inferencia de alto rendimiento, lo que limita el despliegue en producción.
- El modelo está entrenado para responder sumas enteras (recompensa de coincidencia exacta sobre la suma), lo que puede sesgar su comportamiento hacia ese tipo de respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/Video-HopChain-8B
- Paper (arXiv:2609.25773): https://arxiv.org/abs/2609.25773
- Dataset Video-HopChain: https://huggingface.co/datasets/ngqtrung/Video-HopChain
- Página del proyecto: https://ngquangtrung57.github.io/video-hopchain-page/
- Código: https://github.com/ngquangtrung57/video-hopchain
- Colección Video-HopChain: https://huggingface.co/collections/ngqtrung/video-hopchain
- Checkpoint de la etapa de RL estándar: https://huggingface.co/ngqtrung/Video-HopChain-8B-Standard-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
