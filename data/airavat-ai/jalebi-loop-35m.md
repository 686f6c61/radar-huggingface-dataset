# Airavat-ai/Jalebi-Loop-35M

## Resumen

Jalebi-Loop-35M es un modelo de decisión de muy pequeño tamaño (35 millones de parámetros) desarrollado por Airavat AI. No es un modelo generativo de texto: recibe una situación y una lista de opciones y devuelve una puntuación o probabilidad para cada opción en un único forward pass. Está diseñado específicamente para ser reentrenado (fine-tuning) sobre decisiones propias del usuario, cubriendo tres tipos de tarea: elección entre opciones (choice), probabilidad sí/no (noul) y puntuación contra criterios (score).

Su arquitectura es un encoder con un bloque intermedio compartido que se ejecuta en bucle, de modo que la profundidad efectiva se elige en inferencia: K=4 para máxima precisión y K=1 para velocidad. Con una ventana de 512 tokens y entrenamiento únicamente en inglés, el modelo está pensado como punto de partida para routing, clasificación, gates binarios y ranking, no como modelo generalista listo para producción.

La relevancia actual reside en su huella mínima: entre 0,3 y 0,6 GB de VRAM en inferencia y unos 7 GB para un lote de fine-tuning de 16 peticiones en una sola GPU. Al no generar texto libre, elimina por diseño el riesgo de alucinación en la respuesta y reduce la superficie de prompt injection, lo que lo hace atractivo para decisiones acotadas y auditables. La licencia Apache-2.0 facilita su uso comercial y su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con bloque intermedio compartido ejecutado en bucle (recursive loop), profundidad seleccionable en inferencia (K) |
| Parametros totales | 35M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (la model card solo reporta ejecución en fp32 y bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch); tokenizer en `tok24k.json` |

## Arquitectura y entrenamiento

El modelo es un encoder compacto con un bloque intermedio compartido que se aplica de forma recursiva. La profundidad no está fijada en los pesos: se elige en inferencia mediante el parámetro `num_loops` (K), con K=4 para la mejor precisión y K=1 para velocidad. La salida es un conjunto de logits por opción, con una máscara de opciones válidas (`option_mask`), y la pérdida de fine-tuning es una entropía cruzada con etiquetas suaves (soft-label cross-entropy) sobre las opciones, sumada a lo largo de los bucles cuando se usa `return_all_loops=True`.

El tokenizer tiene un vocabulario de 24k tokens (`tok24k.json`). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; estos datos figuran como no disponibles. La innovación técnica destacable es el bucle compartido con profundidad ajustable en tiempo de inferencia, que permite un intercambio explícito entre precisión y latencia sin cambiar de checkpoint. El modelo se distribuye como checkpoint base para fine-tuning, y el autor indica que no ha publicado resultados de fine-tuning en tareas downstream.

## Capacidades

- Puntuación de opciones en un único forward pass: recibe un estado, una pregunta y una lista de opciones, y devuelve una puntuación o probabilidad por opción.
- Tres tipos de decisión en un mismo checkpoint: choice (elegir una opción), noul (probabilidad sí/no) y score (puntuación contra criterios).
- Fine-tuning con mezcla de tipos de decisión en un mismo entrenamiento (filas choice, noul y score combinadas).
- Selección de profundidad en inferencia: K=4 para precisión, K=1 para velocidad, con una caída reportada de 0,2 puntos en la media de tareas.
- No genera texto libre, por lo que no hay alucinación en la respuesta ni superficie de prompt injection en una respuesta en lenguaje natural.
- Capacidades multilingües: no disponibles; solo inglés.
- Tool calling, agentes multi-step, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el mensaje del cliente y una lista de colas (facturación, envío, fraude), el modelo asigna una probabilidad a cada cola. La model card incluye precisamente este ejemplo y el contexto de 512 tokens cubre mensajes de atención al cliente típicos.
- Gates binarios en pipelines: con la tarea noul, el modelo produce una probabilidad sí/no para decisiones como "¿requiere revisión humana?" o "¿es spam?", integrable como paso previo a un modelo mayor.
- Ranking de candidatos: con la tarea score, puntúa una lista de opciones contra criterios definidos, útil para ordenar respuestas, productos o rutas antes de una etapa más costosa.
- Clasificación de intenciones en asistentes: fine-tuning sobre etiquetas propias para mapear una consulta a una intención concreta, con la ventaja de que el modelo es lo bastante pequeño para iterar rápidamente en una sola GPU.
- Moderación o filtrado previo: al no generar texto, se puede usar como clasificador de decisión acotada (permitir/bloquear) sin riesgo de que un atacante manipule una respuesta libre.
- Fine-tuning específico de dominio: partiendo del checkpoint y con un lote de 16 peticiones que consume unos 7 GB, se puede adaptar a decisiones de negocio concretas (aprobación de créditos, triaje médico administrativo, priorización de incidencias) en hardware de gama media.
- Despliegue de alto throughput: con K=1 en bf16 alcanza 411-421 peticiones por segundo en una NVIDIA L4, adecuado para servicios de decisión de baja latencia.

## Benchmarks y rendimiento

Resultados del checkpoint publicado, sin fine-tuning, en el benchmark S1MB English v1 (137 benchmarks, habilidad ajustada por línea base, media de tareas sobre noul, choice y score):

| Modelo | Media de tareas | Noul | Choice | Score | Parámetros |
|---|---:|---:|---:|---:|---:|
| bekko-system-one-v0-400m | 50.60 | 51.24 | 61.32 | 39.25 | 395M |
| bekko-system-one-v0-68m | 40.46 | 42.91 | 51.62 | 26.85 | 68M |
| bekko-system-one-v0-17m | 27.57 | 31.43 | 35.57 | 15.70 | 17M |
| Jalebi-E | 22.95 | 16.51 | 27.71 | 24.61 | 66.6M |
| Laya (typed decisions) | 15.00 | 20.06 | 18.93 | 5.99 | 421M |
| Jalebi-Loop, K=4 | 9.87 | 8.02 | 8.49 | 13.08 | 35M |
| Jalebi-Loop, K=1 | 9.68 | 7.97 | 8.30 | 12.78 | 35M |

El propio autor señala que, sin fine-tuning, el modelo queda por debajo de los modelos mayores de la tabla en la media de tareas, y que su resultado en score (13,1) supera al de Laya (6,0), favorecido por benchmarks de control con plantillas. K=1 frente a K=4 cuesta 0,2 puntos de media de tareas y es unas 2,3 veces más rápido en fp32 (123 frente a 284 peticiones por segundo).

Velocidad en una NVIDIA L4 con la misma muestra de 400 peticiones (unas tres opciones cada una), motor propio del autor:

| Configuración | Peticiones por segundo | Latencia por petición | Memoria GPU pico |
|---|---:|---:|---:|
| K=4, fp32 | 123 | 25,4 ms | 0,58 GB |
| K=4, bf16 | 231-234 | 29,0 ms | 0,30-0,42 GB |
| K=1, fp32 | 284 | 10,2 ms | 0,54 GB |
| K=1, bf16 | 411-421 | 11,6 ms | 0,28-0,38 GB |
| Jalebi-E, bf16 | 270 | 18,3 ms | 1,04 GB |

En bf16 frente a fp32, la respuesta principal cambió en aproximadamente el 1% de las peticiones; los resultados de S1MB anteriores son en fp32.

## Requisitos de hardware

- VRAM de inferencia: 0,58 GB en K=4 fp32, 0,30-0,42 GB en K=4 bf16, 0,54 GB en K=1 fp32 y 0,28-0,38 GB en K=1 bf16 (medido en NVIDIA L4).
- Fine-tuning: un lote de 16 peticiones consume unos 7 GB, por lo que cabe en una sola GPU de gama media.
- GPU recomendadas: NVIDIA L4 es la plataforma medida por el autor; por la huella de memoria, cualquier GPU consumer con al menos 8 GB (por ejemplo, RTX 3060, RTX 4060, RTX 4090) debería poder ejecutar inferencia y fine-tuning, aunque no se han publicado medidas en esas tarjetas.
- Cabe en GPU consumer: sí, según la huella reportada; no hay cifras específicas por tarjeta.
- Opciones de despliegue: el autor usa un motor propio y scripts en `code/`, `code/eval` y `code/model` con PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo de texto estos motores no serían directamente aplicables.
- Latencia y throughput: 10,2-25,4 ms de latencia y 123-421 peticiones por segundo en L4 según K y precisión (tabla anterior).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media de tareas (S1MB) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Jalebi-Loop-35M | 35M | 512 tokens | 9,87 (K=4) / 9,68 (K=1) | Apache-2.0 | Hugging Face |
| Jalebi-E | 66,6M | no disponible | 22,95 | no disponible | Referenciado en la model card |
| bekko-system-one-v0-17m | 17M | no disponible | 27,57 | no disponible | Referenciado en la model card |
| Laya (typed decisions) | 421M | no disponible | 15,00 | no disponible | Referenciado en la model card |

Jalebi-Loop es el más pequeño de la comparativa y el de menor media de tareas sin fine-tuning, pero destaca en la tarea score frente a Laya y ofrece el menor consumo de memoria y la mayor velocidad en K=1 bf16 frente a Jalebi-E (411-421 frente a 270 peticiones por segundo en L4). Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generalista: sin fine-tuning queda por debajo de modelos mayores en la media de tareas del benchmark S1MB; el autor lo presenta explícitamente como punto de partida para fine-tuning.
- Solo inglés: no hay soporte multilingüe declarado.
- Ventana de contexto limitada a 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- No genera texto: no sirve para tareas de generación, resumen o diálogo libre; su salida son puntuaciones por opción.
- No hay resultados publicados de fine-tuning en tareas downstream; el ejemplo de la model card es solo un punto de partida y debe medirse sobre datos propios.
- Riesgo de sesgo: no se documentan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios sensibles.
- Alucinación: el diseño evita la generación libre, pero las puntuaciones pueden ser incorrectas o poco calibradas; conviene validar con datos propios.
- Cambio de respuesta en bf16: aproximadamente el 1% de las peticiones cambia su respuesta principal respecto a fp32.
- Licencia Apache-2.0: permite uso comercial, pero no se especifican restricciones adicionales ni garantías por parte del autor.
- Datos ausentes: no se detallan cuantizaciones soportadas, composición del dataset ni proceso de alineación (RLHF/DPO), lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Airavat-ai/Jalebi-Loop-35M
