# Airavat-ai/Jalebi-E

## Resumen

Jalebi-E es un modelo encoder de 66,6 millones de parámetros desarrollado por Airavat AI, entrenado desde cero (sin pesos preentrenados de terceros) para una tarea muy concreta: la toma de decisiones por puntuación de opciones. Dado un estado o situación descrita en texto y una lista de opciones, el modelo asigna una probabilidad calibrada a cada opción en una única pasada hacia delante. No genera texto libre, lo que elimina por diseño el riesgo de alucinación en la respuesta y reduce la superficie de ataque por prompt injection.

El modelo se posiciona como una pieza de enrutamiento que se sitúa delante de un LLM grande, de un sistema de recuperación o de un agente con tool calling, para resolver la primera pregunta de cualquier pipeline: ¿a dónde debe ir esta petición? Soporta tres tipos de decisión: elección entre opciones (choice), probabilidad binaria sí/no (noul) y puntuación contra criterios (score).

Su relevancia actual radica en la relación entre tamaño y rendimiento: con 66,6M de parámetros supera a Jalebi-L (440M) del mismo autor en la media de tareas del benchmark S1MB (22,94 frente a 19,2), con una ventana de contexto cuatro veces mayor (2.048 frente a 512 tokens) y una latencia mediana por petición aproximadamente un 21% inferior. Está publicado bajo licencia Apache-2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (entrenado desde cero, sin pesos preentrenados) |
| Parámetros totales | 66,6M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, fichero `jalebi-decision.pt`); tokenizer en `tok24k.json` |

## Arquitectura y entrenamiento

Jalebi-E es un encoder transformer construido íntegramente desde cero: no utiliza pesos preentrenados en ninguna parte de la pila. El entrenamiento consta de dos fases: un preentrenamiento con objetivo de masked language modeling sobre texto web y un ajuste fino posterior orientado a decisiones. El modelo incluye su propio tokenizer de 24.000 tokens (`tok24k.json`), también entrenado por el autor.

Los datos de ajuste fino combinan tres fuentes: datos de entrenamiento con formato de decisión del paquete Bekko, conjuntos de datos públicos de decisión (solo splits de entrenamiento) y datos sintéticos generados específicamente para este modelo, entre los que destacan unas 3.000 filas de clasificación de intención con múltiples opciones construidas a partir de 89 conjuntos de etiquetas, además de filas de decisión generales. La arquitectura de scoring produce una distribución de probabilidad sobre las opciones suministradas en una sola pasada, sin decodificación autoregresiva. El modelo rechaza explícitamente entradas que exceden la ventana de 2.048 tokens (a menos que se active `trim=True`), en lugar de truncarlas silenciosamente.

## Capacidades

- Puntuación de opciones: asigna una probabilidad a cada opción de una lista, sumando 1 entre todas ellas.
- Decisión de tipo choice: selección de una opción entre muchas (enrutamiento a equipo, modelo, herramienta o retriever).
- Decisión de tipo noul: probabilidad de sí/no sobre entradas estructuradas cortas (gates binarios).
- Decisión de tipo score: puntuación de candidatos contra un conjunto de criterios.
- Clasificación de intención con múltiples opciones (entrenado con 89 conjuntos de etiquetas).
- No genera texto libre, por lo que no hay superficie de alucinación en la respuesta ni prompt injection en una respuesta de formato libre.
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling, agentes y multi-step reasoning: no disponible como capacidades generativas; el modelo actúa como componente de enrutamiento dentro de esos sistemas, no como agente.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: dado el texto de un cliente y una lista de equipos (facturación, fraude, soporte general), el modelo devuelve la probabilidad de cada destino en una sola pasada, con latencia de milisegundos y sin generación de texto.
- Selección de herramienta en un agente: colocado delante de un agente con tool calling, decide qué herramienta o API debe atender la petición antes de invocar al LLM grande, reduciendo coste y latencia del pipeline.
- Enrutamiento de consultas a retrievers o índices: con 2.048 tokens de ventana puede procesar consultas y descripciones de contexto más largas que su predecesor (512 tokens) y elegir el índice o base de conocimiento adecuado.
- Gates binarios en pipelines estructurados: decisiones sí/no sobre entradas cortas y estructuradas (por ejemplo, si una petición requiere revisión humana) con una probabilidad calibrada en lugar de una respuesta generada.
- Puntuación de candidatos contra criterios: evaluación de varias respuestas, documentos o propuestas frente a un conjunto de criterios, útil para ranking y filtrado previo a un modelo generativo.
- Clasificación de intención con muchos labels: gracias a sus aproximadamente 3.000 filas sintéticas construidas sobre 89 conjuntos de etiquetas, puede asignar intenciones entre conjuntos amplios de categorías.
- Filtro de seguridad previo a un LLM: al no generar texto, no puede ser manipulado para producir una respuesta libre mediante prompt injection, lo que lo hace adecuado como primera capa de decisión.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark S1MB English v1 (137 benchmarks, 26.269 peticiones, skill ajustado a la línea base, media de tareas sobre choice, sí/no y score):

| Métrica | Jalebi-E | Laya (typed decisions) | Jalebi-L (0.44B) |
|---|---|---|---|
| Parámetros | 66,6M | no disponible | 440M |
| S1MB task average | 22,94 | 15,0 | 19,2 |
| S1MB choice | 27,7 | 18,9 | 21,7 |
| S1MB score | 24,6 | 6,0 | 20,3 |

Decision Index 0.3, tests públicos (ejecución propia del autor con el runner oficial; los tests privados del board no se ejecutaron):

| Métrica | Jalebi-E | Jalebi-L |
|---|---|---|
| Índice bruto | 18,8 | 15,8 |
| Peticiones rechazadas | 27,6% | ~45% |
| Ventana | 2.048 tokens | 512 tokens |

Velocidad: sobre la misma GPU (A100), misma muestra de 6.000 peticiones y el motor propio del autor, la mediana de tiempo por petición de Jalebi-E fue de 20,5 ms frente a 26,1 ms de Jalebi-L en las 2.885 peticiones que ambos responden (aproximadamente un 21% menos). Los resultados de S1MB están enviados al dataset de resultados y pendientes de revisión (discussion 118).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 0,3 GB en el repositorio, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor reporta mediciones en A100, pero el tamaño del modelo permite ejecución en RTX 4090, RTX 3090, RTX 3060 y GPUs de portátil.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: el modelo se distribuye como un único fichero Python (`jalebi_e.py`) más los pesos en PyTorch (`.pt`) y el tokenizer (`tok24k.json`); se carga con `JalebiE.from_pretrained("Airavat-ai/Jalebi-E")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 20,5 ms por petición en A100 con el motor propio del autor y caché de tokenizer, sobre una muestra de 6.000 peticiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | S1MB task average | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jalebi-E | 66,6M | 2.048 tokens | 22,94 | Apache-2.0 | Hugging Face (Airavat-ai/Jalebi-E) |
| Jalebi-L | 440M | 512 tokens | 19,2 | no disponible en la información | Hugging Face (colección Jalebi de Airavat-ai) |
| Laya (typed decisions) | no disponible | no disponible | 15,0 | no disponible en la información | no disponible en la información |

Jalebi-E supera a Jalebi-L en la media de tareas de S1MB con aproximadamente una sexta parte de los parámetros (3,74 puntos de mejora) y cuadruplica su ventana de contexto. Frente a Laya, la ventaja es de aproximadamente 1,5 veces en choice (27,7 frente a 18,9) y de unas cuatro veces en score (24,6 frente a 6,0).

## Limitaciones y advertencias

- Ventana máxima de 2.048 tokens por petición; las entradas que no caben se rechazan con error salvo que se active `trim=True`, lo que descarta el final del estado.
- Modelo pequeño: el propio autor advierte resultados débiles en conocimiento abierto, matemáticas y razonamiento largo.
- Solo inglés; no hay soporte multilingüe documentado.
- No es un generador de texto ni un modelo de razonamiento; usarlo fuera de tareas de decisión y puntuación no es su uso previsto.
- Riesgo de sesgo: los datos de entrenamiento incluyen texto web y datos sintéticos; no se documentan evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: no aplica a la generación de texto (no genera), pero las probabilidades de decisión pueden ser incorrectas en dominios alejados de los datos de entrenamiento.
- Los resultados de S1MB están pendientes de revisión en el dataset de resultados; el Decision Index procede de una ejecución propia del autor sobre tests públicos, sin los tests privados del board.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Airavat-ai/Jalebi-E
- Colección Jalebi de Airavat-ai: https://huggingface.co/collections/Airavat-ai/jalebi
- Discusión de resultados S1MB (pendiente de revisión): https://huggingface.co/datasets/hotchpotch/s1mb-result/discussions/118
