# ChristopheCruz/laya-slotjudge-m46

## Resumen

`ChristopheCruz/laya-slotjudge-m46` es un modelo de decisión de tipo multiple-choice para *slot filling* en diálogo orientado a tareas, desarrollado por Christophe Cruz, Hussam Ghanem y Hocine Cherifi en el ICB (UMR 6303 CNRS) de la Université Bourgogne Europe. No es un extractor ni un generador: recibe el último mensaje del usuario, el contexto del diálogo y una lista corta de valores candidatos para una ranura concreta, y devuelve una distribución de probabilidad sobre esos candidatos más una opción explícita de "no especificado".

El modelo es un fine-tuning del checkpoint `multilingual` de Laya, un encoder bidireccional mmBERT-base con cabeza de decisión, que totaliza 321.908.998 parámetros según los pesos en safetensors. Se entrenó sobre MTOP, Multi3WOZ, MASSIVE y SGD en 46 idiomas, y su probabilidad de salida está calibrada para permitir predicción selectiva: fijar un umbral que decida entre actuar, ignorar la ranura o preguntar al usuario.

Su relevancia actual radica en la propuesta "propose, then judge": en lugar de confiar en un LLM generativo para extraer valores de ranura, se usan proponentes baratos (léxico, NER, catálogo, historial) y este juez pequeño y calibrado valida o abstiene. El modelo acompaña al preprint *Propose, then judge: a small calibrated decision model versus large language model judges for multilingual slot filling* (Cruz, Ghanem y Cherifi, hal-05850913).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional (mmBERT-base) con cabeza de scoring de opciones |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada; 48 tokens por opción |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 46 idiomas: af, ar, az, bn, ca, da, de, el, en, es, fa, fi, fr, he, hi, hu, hy, id, it, ja, jv, ka, kn, ko, lv, ml, mn, ms, my, nb, nl, pl, pt, ro, ru, sl, sq, sv, ta, te, th, tl, tr, ur, vi, zh |
| Licencia | CC BY-SA 4.0 (share-alike, heredada de MTOP y SGD) |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, checkpoint `multilingual`, revisión `7b928d82`, que internamente es un encoder mmBERT-base con una cabeza de decisión. Sobre esa base se añade una cabeza de scoring de opciones que, dada una pregunta de tipo multiple-choice con criterios etiquetados con letras neutras (A, B, C…), produce una distribución de probabilidad sobre cada opción más la opción final de "no especificado". Todas las preguntas de un mismo turno comparten una única pasada forward, lo que abarata el coste por turno cuando el esquema tiene muchas ranuras.

El fine-tuning se realizó sobre MTOP, Multi3WOZ, MASSIVE y SGD en múltiples idiomas, cubriendo 46 lenguas en entrenamiento. La model card no detalla el número exacto de tokens de entrenamiento ni la composición porcentual del dataset, ni si hubo RLHF o DPO (no disponible). La innovación técnica destacable es la calibración explícita de la probabilidad de salida para predicción selectiva: el umbral sobre la probabilidad permite negociar cobertura frente a riesgo, y la opción "no especificado" se entrena de forma explícita porque la mayoría de ranuras de un esquema no se mencionan en un turno dado. El modelo no extrae spans ni genera texto: los valores deben provenir de un proponente externo.

## Capacidades

- Clasificación de ranura en formato multiple-choice: dada una pregunta con candidatos, devuelve probabilidad por candidato y por "no especificado".
- Slot filling y actualización de estado de diálogo en asistentes orientados a tareas.
- Verificación de la salida de un extractor generativo: pasar el valor del LLM y sus alternativas como candidatos y usar la probabilidad del juez para aceptar, rechazar o preguntar.
- Predicción selectiva con umbral calibrado: decidir entre actuar, ignorar la ranura o pedir aclaración al usuario.
- Multilingüe en 46 idiomas, con instrucciones y plantillas en inglés independientemente del idioma del diálogo.
- Procesamiento por lotes de todas las preguntas de un turno en una sola pasada forward.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-step (no es un modelo generativo).
- No soporta visión, audio ni modo thinking.

## Casos de uso

- Relleno de ranuras en asistentes de reservas: un proponente léxico o NER sugiere ciudades, fechas y números de vuelo a partir del último mensaje, y el juez elige el valor correcto o absteine con la opción "no especificado" cuando la ranura no se menciona en el turno.
- Verificación de extracciones de un LLM generativo: se pasa el valor propuesto por el LLM junto con alternativas del catálogo y se usa la probabilidad calibrada para aceptar la extracción, rechazarla o lanzar una pregunta de aclaración al usuario.
- Enrutado selectivo en producción: fijar un umbral sobre la probabilidad (reajustado sobre datos propios) para derivar a revisión humana o a pregunta al usuario los casos de baja confianza, manteniendo cobertura alta en los de alta confianza.
- Asistentes de atención al cliente multi-turno: el juez recibe historial y ranuras ya rellenas, de modo que puede actualizar el estado del diálogo sin re-extraer valores de turnos anteriores y sin confundir valores previos con los del turno actual.
- Procesamiento por lotes de esquemas grandes: agrupar todas las ranuras de un turno en una sola llamada y repartir el coste de la pasada forward entre decenas de preguntas, útil en pipelines de alto volumen con esquemas de muchas ranuras.
- Despliegue multilingüe con un único modelo: cubrir 46 idiomas con un encoder de 322 M de parámetros en lugar de mantener un extractor por idioma, manteniendo las plantillas de instrucciones en inglés.
- Moderación de catálogo en asistentes de comercio: validar que el valor propuesto para una ranura (producto, talla, color) existe en el catálogo y corresponde al mensaje del usuario antes de confirmar la acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamaño (321,9 M de parámetros y repo de 1,3 GB en safetensors), la inferencia en fp32 requiere del orden de 1,3 GB de pesos más activaciones y overhead del runtime; en fp16 o bf16 se reduce aproximadamente a la mitad, aunque no se confirman cuantizaciones soportadas.
- GPU recomendadas: no disponible en la model card; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería alojar los pesos en fp16/bf16, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no se confirma en la información disponible.
- Opciones de despliegue: runtime Laya (`pip install "laya>=0.3,<0.4"`) con `Router` y `predict_batch`; el código de referencia está en `ChristopheCruz/propose-then-judge-slots` (clase `laya_slots.judges.laya_judge.LayaJudge`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye resultados de benchmarks ni comparaciones directas con otros jueces de ranuras o extractores multilingües, por lo que no es posible establecer una comparativa numérica fiable.

## Limitaciones y advertencias

- No extrae spans ni genera texto: requiere que los valores candidatos provengan de un proponente externo (léxico, NER, catálogo, historial, LLM).
- Sin candidatos no hay extracción abierta posible; el modelo está fuera de alcance para extracción libre sin lista de opciones.
- Entrada truncada a 1.024 tokens y cada opción a 48 tokens; los documentos largos o valores muy extensos no caben.
- Más de 15 candidatos por pregunta requiere dividirlos (modo `tournament` del código de referencia).
- Sesgo de posición: al igual que los jueces LLM, Laya presenta sesgo de posición; hay que barajar los candidatos antes de construir la pregunta.
- Las plantillas de instrucciones y la redacción exacta de la opción "no especificado" deben mantenerse tal cual; el modelo se entrenó con esas plantillas en inglés.
- La calibración debe reajustarse (umbral y, idealmente, temperatura) sobre datos propios antes de usarla en producción.
- No apto para decisiones críticas de seguridad sin revisión humana.
- Licencia CC BY-SA 4.0 con cláusula share-alike heredada de MTOP y SGD: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial y la integración en productos propietarios.
- Riesgo de alucinación en el sentido de asignar un candidato incorrecto si el proponente no incluye el valor correcto; el juez solo elige entre lo propuesto o absteine.
- Sesgos conocidos: no se documentan sesgos específicos más allá del sesgo de posición y los heredados de los datasets de entrenamiento (MTOP, Multi3WOZ, MASSIVE, SGD), no disponibles en detalle.
- El repositorio no registra descargas ni likes en el momento de la consulta; es un modelo de investigación con soporte comunitario limitado.

## Enlaces

- Hugging Face: https://huggingface.co/ChristopheCruz/laya-slotjudge-m46
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Preprint: https://hal.science/hal-05850913
- Código: https://github.com/ChristopheCruz/propose-then-judge-slots
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
