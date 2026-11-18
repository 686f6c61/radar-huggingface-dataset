# Mapika/decider-0.8b

## Resumen

decider-0.8b es un modelo de decisión tipada desarrollado por Mapika, derivado por fine-tuning de Qwen/Qwen3.5-0.8B-Base. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (una cadena o cualquier valor JSON) y un conjunto de preguntas tipadas, y devuelve en una única pasada forward una distribución de probabilidad calibrada para cada pregunta. Soporta tres tipos de pregunta: Choice (entre 2 y 255 opciones, opcionalmente descritas), Score (entre 2 y 10 niveles descritos) y Noul (probabilidad de sí).

El modelo pertenece a la familia decider, que comparte una única interfaz (`decider.infer.Decider`, endpoint `POST /v1/systemone`) y un mismo mecanismo de lectura: los logits de las letras en una posición de respuesta, aplicados softmax sobre las opciones definidas. Con 752 millones de parámetros en safetensors y pesos bf16 de 1,4 GB, es la variante más pequeña de la familia y está pensada para routing, clasificación, juicios sí/no y consultas sobre estados cortos, con una precisión a 1-4 puntos del decider-2b y aproximadamente 1,5 veces más rápida.

Su relevancia actual radica en el paradigma "system-one": eliminar la decodificación autoregresiva y el parseo de salida en tareas de decisión estructurada, garantizando que la respuesta siempre pertenezca al conjunto de opciones definido por el usuario y que las probabilidades estén calibradas (ECE de 0,032 en tareas in-task). Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tuning de Qwen3.5-0.8B-Base), lectura de logits en slot de respuesta |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (evaluado con artículos de 5-8k tokens en QuALITY) |
| Tipos de cuantización | bf16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer denso de 752 millones de parámetros, y se entrena con la misma receta que el resto de la familia decider: una época sobre la mezcla completa de 1,47 millones de ejemplos (455 millones de tokens), ejecutada con `scripts/train.sh full` en 4,5 horas sobre una única GH200. El entrenamiento no incluye etapa de RL; la calibración se obtiene mediante un ajuste de temperatura sobre datos in-task, que resultó en 1,03 para este modelo (idéntico al del 2b), lo que indica que la receta calibra a cualquier escala.

La innovación técnica central es el mecanismo de decisión en una sola pasada: en lugar de generar texto y parsearlo, el modelo lee los logits de las letras en una posición de respuesta fija y aplica softmax sobre las opciones definidas. Esto elimina la decodificación, el parseo y cualquier salida fuera del conjunto de opciones, y produce directamente una distribución de probabilidad. La interfaz admite dos disposiciones de la pregunta (schema-first, que es cacheable, y otras), y el mismo formato de cable (`POST /v1/systemone`, formato de TypeSafe Jev) que el resto de la familia.

## Capacidades

- Clasificación y routing con opciones tipadas: Choice de 2 a 255 opciones, con descripciones opcionales por opción.
- Puntuación ordinal: Score con 2 a 10 niveles descritos, con probabilidades que suman aproximadamente 1 (1,02 en la evaluación reportada).
- Juicios binarios: Noul devuelve la probabilidad de sí para una pregunta dada.
- Estados de entrada flexibles: cadenas de texto o cualquier valor JSON, incluyendo consultas por ruta sobre registros JSON.
- Salida estructurada garantizada: la respuesta siempre pertenece al conjunto de opciones definido, sin decodificación ni parseo.
- Probabilidades calibradas: ECE de 0,032 en tareas in-task y 0,096 en held-out.
- Soporte de lotes: `decide_batch` y caché del conjunto de preguntas mediante `schema`.
- Despliegue como servicio: `decider.serve` con el formato de petición de TypeSafe.
- No soporta generación de texto libre, tool calling, agentes multi-paso ni visión (la variante con visión es decider-2b-vision).

## Casos de uso

- Triaje de tickets de soporte: clasificar cada ticket en un equipo (billing, technical, other) y estimar la probabilidad de que el cliente solicite un reembolso y su nivel de frustración, todo en una sola pasada y con salida tipada que se inserta directamente en el sistema de ticketing.
- Routing de consultas en pipelines RAG: decidir a qué índice o herramienta dirigir una consulta entre hasta 255 opciones descritas, con probabilidad calibrada para aplicar un umbral de derivación a un humano cuando la confianza sea baja.
- Moderación y políticas: evaluar si un contenido incumple una política mediante preguntas Noul encadenadas y niveles Score de gravedad, sin riesgo de que el modelo genere texto fuera de las categorías permitidas.
- Extracción de campos de registros JSON: localizar por ruta un registro entre 16 o 64 candidatos (precisión de 0,58 y 0,52 respectivamente, 0,62 con índices escritos) para tareas de enlazado de entidades o selección de documentos.
- Clasificación multietiqueta de intenciones: asignar simultáneamente conjuntos amplios de etiquetas (64 etiquetas HWU64 con 0,81 de precisión, 50 etiquetas TREC-fine con 0,63, 70 etiquetas DBpedia L2 con 0,66 y 219 etiquetas L3 con 0,83) en asistentes conversacionales o sistemas de análisis de logs.
- Decisión en agentes de navegador o videojuegos simples: elegir la siguiente acción entre opciones predefinidas a partir de un estado textual; rinde al nivel del profesor scriptado en Pong y Breakout, aunque falla en CliffWalking y obtiene 0 en Freeway held-out.
- Enrutamiento de bajo coste en producción: con un coste de inferencia inferior al del decider-2b y 1,5 veces más rápido en el conjunto de regresión, es adecuado como primera etapa de filtrado antes de modelos mayores.

## Benchmarks y rendimiento

Resultados reportados por el autor con el mismo protocolo de una sola ejecución y temperatura ajustada (1,03) sobre 93 tareas públicas, comparados con decider-2b bajo la misma receta:

| Métrica | decider-0.8b | decider-2b |
|---|---|---|
| Precisión / ECE in-task (69 tareas) | 0,776 / 0,032 | 0,809 / 0,030 |
| Precisión / ECE held-out (24 tareas) | 0,707 / 0,096 | 0,739 / 0,086 |
| Schema-first, in-task / held-out | 0,770 / 0,699 | 0,790 / 0,707 |
| Preguntas personalizadas del profesor, held-out: noul / choice / score | 0,94 / 0,95 / 0,81 | 0,98 / 0,97 / 0,83 |
| Routing por buckets tersos, held-out: genérico / específico / catch-all | 0,87 / 0,93 / 0,84 | 0,91 / 0,94 / 0,92 |
| Estado JSON, 1 de 16 / 1 de 64 registros por ruta (64 con índices) | 0,58 / 0,52 (0,62) | 0,59 / 0,53 (0,63) |
| HWU64 (64 etiquetas, held-out) | 0,81 | 0,85 |
| TREC-fine (50 etiquetas, held-out) | 0,63 | 0,76 |
| DBpedia L2 (70 etiquetas, held-out) | 0,66 | 0,72 |
| DBpedia L3 (219 etiquetas, held-out) | 0,83 | 0,86 |
| QuALITY, artículo completo (5-8k tokens) | 0,63 | 0,68 |
| Score aislado vs listwise (held-out) | 0,83 vs 0,82, suma 1,02 | 0,84 vs 0,84 |
| Batería manual: opción genérica correcta / catch-all correcto | 0,95 / 0,95 | 0,90 / 0,85 |

Pérdidas de conocimiento frente al 2b: TruthfulQA 0,41 frente a 0,55; OpenBookQA 0,67 frente a 0,81; HellaSwag 0,76 frente a 0,88; ARC 0,74 frente a 0,86.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB en bf16 para pesos e inferencia básica; el repositorio ocupa 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor reporta entrenamiento en una GH200 y uso de CUDA graphs para reducir latencia en el 2b (4 ms por petición), aunque no se publican cifras de latencia específicas para el 0.8b.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: paquete `decider` (`decider.infer.Decider`, `decider.serve`) instalable desde GitHub; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este modelo.
- Rendimiento: el conjunto de regresión corre aproximadamente 1,5 veces más rápido que en el decider-2b; no se publican cifras absolutas de throughput.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos | Licencia | Precisión in-task / held-out | Notas |
|---|---|---|---|---|---|---|
| decider-0.8b | Qwen3.5-0.8B-Base | 752 M | 1,4 GB bf16 | apache-2.0 | 0,776 / 0,707 | El más pequeño y rápido de la familia; pierde conocimiento |
| decider-2b | Qwen3.5-2B-Base | no disponible | 3,5 GB bf16 | no disponible | 0,809 / 0,739 | Predeterminado de la familia; 4 ms por petición con CUDA graphs |
| decider-4b | Qwen3.5-4B-Base | no disponible | 8,4 GB bf16 | no disponible | 0,834 / 0,788 | Punto medio; supera al 2b en 87 de 95 tareas; sin etapa RL |
| decider-35b-a3b | Qwen3.5-35B-A3B-Base (3B activos) | no disponible | 65 GB bf16 | no disponible | 0,855 / 0,810 | Máxima precisión; supera al 2b en 93 de 95 tareas |

## Limitaciones y advertencias

- Solo admite inglés; no se declara soporte multilingüe.
- No genera texto libre: únicamente responde a preguntas tipadas dentro del conjunto de opciones definido.
- Debilidad en conocimiento factual y razonamiento: caídas notables en TruthfulQA, OpenBookQA, HellaSwag y ARC frente al 2b.
- Bajo rendimiento en conjuntos amplios de etiquetas que requieren distinciones finas (TREC-fine: 0,63 frente a 0,76 del 2b).
- Consultas por ruta sobre registros JSON limitadas: 0,52 de precisión con 64 registros sin índices.
- En tareas de decisión secuencial en entornos, falla en CliffWalking y obtiene 0 en Freeway held-out; en Pong y Breakout se mantiene al nivel del profesor scriptado.
- Calibración peor en dominios held-out (ECE 0,096) que in-task (0,032); conviene validar umbrales de confianza en el dominio de producción.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración errónea cuando el estado de entrada queda fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mapika/decider-0.8b
- Repositorio y scripts de entrenamiento: https://github.com/Mapika/decider
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- decider-2b-vision: https://huggingface.co/Mapika/decider-2b-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
