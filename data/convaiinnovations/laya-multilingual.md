# convaiinnovations/laya-multilingual

## Resumen

Laya Multilingual es un modelo de clasificación de texto no autorregresivo desarrollado por ConvAI Innovations, diseñado como un "modelo de decisión de Sistema 1". A diferencia de los LLM generativos, recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades en un único paso forward, sin generar texto libre. Esto elimina el parseo de salidas y reduce drásticamente el riesgo de alucinación, ya que el modelo no inventa contenido: selecciona entre opciones predefinidas.

El modelo se construye sobre un encoder mmBERT-base de 322 millones de parámetros y está pensado para cubrir más de 100 idiomas, siendo el checkpoint recomendado de la familia Laya para cualquier caso que no sea inglés. Su contexto nominal es de 1.024 tokens, aunque puede extenderse hasta 8.192 pasando `max_len=8192`, lo que permite procesar documentos largos como contratos o hilos de conversación completos.

Su relevancia actual radica en que ofrece una alternativa determinista y de coste constante frente a los LLM generativos para tareas de enrutamiento, guardrails, moderación y clasificación multilingüe. Además, incorpora mecanismos de calibración de riesgo (abstain, prediction_set, unbound, route) y aprendizaje continuo a partir de respuestas confirmadas, sin necesidad de fine-tuning completo. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (mmBERT-base) con motor de decisión sobre espacio de valles |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 con `max_len=8192` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 100 idiomas, incluyendo en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Laya Multilingual emplea un encoder mmBERT-base congelado como "lector" y un pequeño motor de decisión entrenado encima. El mecanismo se describe metafóricamente como un espacio de decisión donde cada respuesta candidata es un valle y la entrada es una partícula que rueda y se asienta en uno de ellos; la profundidad del asentamiento determina la probabilidad asignada. El proceso es determinista, de coste constante y no genera texto, lo que lo diferencia de los enfoques autoregresivos.

El modelo forma parte de la familia Laya, que incluye un checkpoint en inglés sobre ModernBERT-large (421M parámetros, contexto 512) y un checkpoint para flujos de decisiones tipadas (421M, contexto 1.024). La versión multilingüe es aproximadamente el doble de rápida que la inglesa según la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El sistema soporta aprendizaje continuo mediante `laya.Learner`, que permite incorporar respuestas confirmadas por el equipo en segundos sobre CPU, sin reentrenar los pesos del encoder.

## Capacidades

- Clasificación de texto multilingüe en más de 100 idiomas con respuestas tipadas y probabilidades.
- Decisiones no generativas: no produce texto libre, por lo que no hay salida que parsear ni contenido que alucinar.
- Soporte de entradas multimodales en la versión 0.5: imágenes (`image=`), audio (`audio=`) y vídeo (`video=`) además de texto.
- Contexto extendido hasta 73.728 tokens en la versión 0.5 del paquete, y hasta 8.192 tokens en este checkpoint con `max_len=8192`.
- Mecanismo de abstención (`abstain`) con umbral calibrado para mantener la tasa de error por debajo del riesgo configurado (10% por defecto).
- Conjunto conformal (`prediction_set`) a alpha 0.10, que indica si la respuesta es única (segura) o múltiple (ambigua).
- Indicador `unbound` para detectar entradas fuera de distribución.
- Enrutamiento (`route`) con valores `auto` o `review`, calibrable con etiquetas mediante `agent.fit` / `agent.calibrate`.
- Aprendizaje continuo con `laya.Learner` a partir de respuestas confirmadas, sin fine-tuning.
- Integración con cualquier LLM como lector subyacente, desde 0.8B hasta 27B parámetros.
- Compatible con endpoints y despliegue en Azure según los tags del repositorio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y preguntas tipadas sobre categoría, urgencia o equipo destinatario, devolviendo la opción con probabilidad y una ruta `auto` o `review` según la calibración. Es adecuado porque cubre más de 100 idiomas y evita generar respuestas inventadas.
- Guardrails y moderación de contenido: se plantean preguntas binarias o multiclase sobre toxicidad, spam o cumplimiento normativo, y el mecanismo de abstención deriva a revisión humana los casos ambiguos, manteniendo la tasa de error bajo el umbral configurado.
- Clasificación de correos y documentos largos: con `max_len=8192` puede procesar contratos, hilos de correo o logs completos en una sola lectura, algo relevante para equipos legales o de compliance que necesitan etiquetar documentos extensos.
- Análisis de conversaciones multilingües: al soportar decenas de idiomas, permite aplicar una misma plantilla de decisión a interacciones en español, alemán, árabe o japonés sin mantener modelos separados por idioma.
- Extracción de decisiones estructuradas desde JSON: el modelo acepta estados en formato JSON y devuelve respuestas tipadas, lo que facilita integrarlo en pipelines de datos que necesitan clasificar registros sin un LLM generativo.
- Aprendizaje continuo en producción: con `laya.Learner`, un equipo puede confirmar respuestas correctas y el modelo se actualiza en segundos sobre CPU (34 s para 300 respuestas en 8 hilos, 0,72 s por respuesta), lo que reduce el coste frente al fine-tuning clásico (89 s en GPU y reescritura de 421M pesos).
- Detección de entradas fuera de distribución: el flag `unbound` permite identificar mensajes que no se parecen a los datos de entrenamiento, útil para monitorizar la deriva de datos en sistemas de clasificación desplegados.

## Benchmarks y rendimiento

La model card proporciona resultados de aprendizaje continuo sobre 14 plantillas de decisión (31 preguntas), evaluadas en 60 filas reservadas por plantilla:

| Sistema | Día uno | Tras 40 respuestas confirmadas | Tras 120 |
|---|---|---|---|
| laya con `laya.Learner` | 84,7% | 91,6% | 96,0% |
| Jev 1.14 (respuestas confirmadas en sus criterios) | 89,5% | 91,5% | 92,6% |

En el escenario de aprendizaje desde un flujo de datos (noviembre de 2026, lector de 4B, filas reservadas):

| Sistema | Resultado |
|---|---|
| laya en banking77, 924 filas reservadas tras 4.928 filas | 87,5%, ECE 0,028, ruta 92,5% |
| Jev 1.14 | No disponible en el extracto |

En precisión de documentos largos, 16 a 18 de 20 peticiones se respondieron correctamente con hasta unos 4.000 tokens de texto previo; más allá de esa longitud los resultados varían (8 a 17 de 20). Una entrada de 4.000 tokens tarda aproximadamente 1,7 s en una GPU de Apple. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible, ya que el modelo no es generativo y no aplica a esas evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 322M parámetros en safetensors, la huella en precisión completa ronda los 1,3 GB, y en cuantizaciones de 8 o 4 bits sería menor, aunque no se documentan los formatos soportados.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona una GPU de Apple para la prueba de latencia de 1,7 s con 4.000 tokens.
- Cabe en GPU de consumo: sí, por tamaño (322M parámetros), aunque no se detallan modelos concretos.
- Aprendizaje continuo: 34 s para 300 respuestas en 8 hilos de CPU, 0,72 s por respuesta y 6,4 GB de RAM; en GPU, 40 ms por respuesta y 2 GB.
- Opciones de despliegue: compatible con `transformers`, endpoints compatibles y despliegue en Azure según los tags; el paquete se instala con `pip install -U laya`.
- Latencia y throughput: 1,7 s para una entrada de 4.000 tokens en GPU de Apple; el coste es constante por decisión y la velocidad sigue la longitud real de la entrada, no el límite de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| laya-multilingual | 322M | 1.024 (hasta 8.192) | 100+ | Apache 2.0 | Clasificación no generativa con calibración |
| laya (inglés) | 421M | 512 | Inglés | Apache 2.0 | Clasificación no generativa con calibración |
| laya-typed-decisions | 421M | 1.024 | No disponible | Apache 2.0 | Flujos de decisiones tipadas |
| Jev 1.14 | No disponible | No disponible | No disponible | API alojada | Decisión con criterios, sin aprendizaje |

Jev 1.14 lidera en el día uno (89,5% frente a 84,7%), empatan a 40 respuestas confirmadas y laya supera a Jev a las 120 (96,0% frente a 92,6%). Jev no puede enseñarse, solo recibe prompts, y es una API alojada con 364 ms por petición desde India. No se dispone de datos de otros modelos comparables de clasificación multilingüe en la información proporcionada.

## Limitaciones y advertencias

- El contexto por defecto de 1.024 tokens trunca documentos largos; es necesario pasar `max_len=8192` para aprovechar el contexto extendido, y la precisión en documentos muy largos decae (8 a 17 de 20 aciertos más allá de 4.000 tokens).
- El flag `unbound` no es fiable como único criterio de enrutamiento: se activó en el 71% de filas normales de banking77, por lo que enviaría la mayoría de respuestas correctas a revisión.
- El umbral de abstención está calibrado por defecto a un riesgo del 10%; en producción conviene recalibrar con datos propios mediante `agent.fit` o `agent.calibrate`.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni evaluaciones de robustez por idioma.
- El modelo no genera texto, por lo que no sirve para tareas de generación, resumen libre o diálogo abierto.
- La versión 0.5 introduce soporte de imagen, audio y vídeo y contexto de 73.728 tokens, pero estos datos corresponden al paquete `laya` y no necesariamente a este checkpoint concreto; conviene verificar la compatibilidad.
- Aunque la licencia Apache 2.0 permite uso comercial, no se detallan restricciones adicionales sobre los datos de entrenamiento del encoder mmBERT subyacente.
- No se han publicado resultados en benchmarks estándar de razonamiento o generación, lo que dificulta la comparación directa con LLM convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/convaiinnovations/laya-multilingual
- Familia Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub del proyecto: https://github.com/NandhaKishorM/laya
- Gráfico de precisión en contexto largo: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
- Gráfico del mecanismo de decisión: https://raw.githubusercontent.com/NandhaKishorM/vegaml/main/assets/vega-valleys.svg
- Logo del proyecto: https://huggingface.co/convaiinnovations/laya/resolve/main/assets/logo-mark.png
