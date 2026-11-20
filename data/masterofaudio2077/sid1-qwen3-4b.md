# masterofaudio2077/sid1-qwen3-4b

## Resumen

sid1-qwen3-4b es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo Qwen/Qwen3-4B, desarrollado por el usuario masterofaudio2077, especializado en búsqueda agéntica de documentos para preguntas multi-salto. A diferencia de un modelo conversacional, no genera respuestas: opera como un agente que dispone de cuatro herramientas (`search_dense`, `search_bm25`, `read`, `report`) y devuelve una lista ordenada de identificadores de documentos relevantes para responder a la pregunta.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros, y se entrena únicamente con RL, sin ajuste supervisado previo, usando como recompensa el NDCG de la lista reportada frente a los párrafos de soporte anotados en los conjuntos de datos. La receta sigue el informe técnico de SID-1, escalado a un modelo de 4B, tres datasets públicos (MuSiQue, HotpotQA, 2WikiMultiHopQA) y una sola GPU.

Es relevante como artefacto de investigación sobre búsqueda agéntica con modelos pequeños: demuestra que un modelo de 4B puede aprender un bucle de búsqueda multi-salto con RL puro. No obstante, es un checkpoint temprano (175 de 400 pasos planificados) y su evaluación es exclusivamente in-domain, por lo que debe tratarse como material de estudio y no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B), mismo esquema de tensores que el modelo base |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen/Qwen3-4B original, un transformer denso de 4.022 millones de parámetros, sin modificaciones estructurales: los nombres de tensores y la arquitectura son idénticos, de modo que carga con `AutoModelForCausalLM`. Todos los parámetros fueron entrenados durante el ajuste.

El entrenamiento es exclusivamente por refuerzo con GRPO (Group Relative Policy Optimization), sin fase de ajuste supervisado, ya que no existe texto objetivo que imitar. La recompensa es el NDCG de la lista de documentos reportada por el agente frente a los párrafos de soporte anotados en los datasets. El agente opera con un esquema de herramientas fijo (búsqueda densa, búsqueda BM25, lectura y reporte) y un system prompt concreto; el modelo fue entrenado sobre ese formato exacto. El checkpoint publicado corresponde al paso 175 de los 400 planificados, por lo que la fase de decaimiento del learning rate nunca se ejecutó.

## Capacidades

- Búsqueda agéntica multi-salto: formula consultas sucesivas, alterna búsqueda semántica y por palabras clave, y refina la búsqueda salto a salto.
- Uso de herramientas con esquema fijo: `search_dense`, `search_bm25`, `read` y `report`, definidas como function calling.
- Recuperación de documentos: devuelve una lista ordenada de identificadores de documentos relevantes, no texto de respuesta.
- Fusión de múltiples muestras: admite combinación de varias ejecuciones mediante Reciprocal Rank Fusion (RRF) para mejorar el NDCG.
- No es un modelo conversacional: no responde preguntas ni mantiene diálogo.
- No utiliza la herramienta `read` en la práctica (0,0 llamadas por trayectoria durante el entrenamiento).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Recuperación en pipelines de question answering: se usa como paso de retrieval previo a un modelo generador; recibe la pregunta y devuelve los ids de los documentos que un lector posterior debe sintetizar.
- Investigación sobre RL para agentes: sirve como referencia reproducible de entrenamiento GRPO con recompensa basada en NDCG sobre un bucle de herramientas.
- Evaluación de búsqueda agéntica frente a recuperación vectorial plana: el Space de demostración permite comparar el agente con búsqueda vectorial simple sobre las mismas colecciones.
- Búsqueda multi-salto sobre corpus tipo Wikipedia: adecuado para preguntas que requieren encadenar evidencia de varios documentos, como las de MuSiQue o HotpotQA.
- Prototipado de asistentes de investigación documental: integrado en un orquestador que gestione las llamadas a herramientas, puede localizar las fuentes necesarias antes de redactar un informe.
- Estudio de sensibilidad a formatos de prompt y esquemas de herramientas: al estar entrenado sobre un único esquema, permite analizar cuánto degrada el rendimiento al cambiar el formato.
- Experimentos de fusión de muestras: útil para medir la ganancia de RRF con 4 muestras frente a una sola ejecución en tareas de retrieval.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre un pool de dev de 600 preguntas (200 por dataset) de MuSiQue, HotpotQA y 2WikiMultiHopQA:

| Métrica | Configuración | Valor |
|---|---|---|
| NDCG | 1 muestra | 0,684 |
| NDCG | 4 muestras fusionadas (RRF) | 0,729 |
| Recall | 1 muestra | 0,699 |

No se han publicado en la información disponible resultados comparativos con el modelo base ni con otros sistemas de retrieval.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia; RTX 4090 (24 GB) suficiente para inferencia en bf16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 16 GB con cuantización a 8 bits; en 12 GB requiere cuantización a 4 bits (no se publican pesos GGUF oficiales).
- Opciones de despliegue: `transformers` con `device_map="auto"` (método documentado); compatible con text-generation-inference según los tags del repositorio; vLLM y llama.cpp no están documentados en la información disponible.
- Latencia y throughput: no disponibles. El coste de la configuración de 4 muestras fusionadas implica cuatro ejecuciones completas del bucle por pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sid1-qwen3-4b | 4.022 M | No disponible | Búsqueda agéntica multi-salto | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4.022 M | No disponible en la información | Generación de texto general | Apache 2.0 | Hugging Face |
| SID-1 (informe técnico) | No disponible | No disponible | Búsqueda agéntica multi-salto | No disponible | Referencia técnica |

No se dispone de datos de rendimiento del modelo base ni de SID-1 en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Evaluación exclusivamente in-domain: entrenamiento y evaluación usan los mismos tres benchmarks sobre párrafos de Wikipedia; no hay evidencia de generalización a otros estilos de pregunta o colecciones.
- Checkpoint temprano: detenido en el paso 175 de 400, sin fase de decaimiento del learning rate; la puntuación se estabilizó en torno a 0,66 desde el paso 100 en los checkpoints de 96 preguntas.
- No utiliza la herramienta `read`: depende de los extractos de 160 caracteres devueltos por las búsquedas, por lo que no abre documentos completos.
- Menor precisión: reporta hasta 20 documentos, lo que eleva recall y NDCG a costa de reducir la precisión.
- Una sola ejecución con una sola semilla: sin intervalos de confianza; la evaluación de 600 preguntas y los checkpoints intermedios de 96 preguntas son ruidosos.
- Coste de la mejor configuración: el NDCG de 0,729 requiere cuatro ejecuciones completas por pregunta.
- Dependencia estricta del formato: entrenado con un único esquema de herramientas y un único system prompt; otros formatos pueden no ser seguidos correctamente.
- No entrenado sobre la web abierta, otros idiomas ni otros tipos de colecciones; solo inglés.
- Hereda los sesgos y modos de fallo de Qwen3-4B y del texto de Wikipedia que indexa.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y la falta de validación fuera de dominio desaconsejan su uso en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/sid1-qwen3-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Demo (Agentic Search, Trained with RL): https://huggingface.co/spaces/masterofaudio2077/sid1-agentic-search
- Código del bucle de agente y notebook de entrenamiento: https://huggingface.co/spaces/masterofaudio2077/sid1-agentic-search/tree/main
- Informe técnico de SID-1: https://www.sid.ai/research/sid-1-technical-report
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Dataset 2WikiMultiHopQA: https://huggingface.co/datasets/framolfese/2WikiMultihopQA
