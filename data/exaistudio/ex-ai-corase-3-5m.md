# EXAiStudio/EX-AI-Corase-3.5M

## Resumen

EX-AI-Corase-3.5M es un modelo publicado en Hugging Face por el usuario EXAiStudio bajo licencia MIT. La información disponible en su model card es prácticamente inexistente: se reduce a la declaración de licencia, sin descripción, sin arquitectura documentada y sin datos de entrenamiento. El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere que en el momento de la consulta no contiene pesos publicados o que estos son de un tamaño despreciable.

El nombre del modelo incluye el sufijo "3.5M", que por convención habitual en la nomenclatura de modelos podría indicar un número de parámetros del orden de 3,5 millones, aunque esta interpretación no está confirmada por el autor en ningún momento. No hay pipeline declarado, no se especifican idiomas y no consta ningún resultado de evaluación.

Por tanto, esta ficha se limita a documentar los metadatos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. No se debe asumir ninguna capacidad, arquitectura o rendimiento a partir del nombre del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (el sufijo "3.5M" del nombre no está confirmado como recuento de parámetros) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. El autor no documenta si se trata de un transformer, un modelo MoE, una arquitectura híbrida o cualquier otra variante. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal.

El único dato técnico verificable es la presencia del tag `safetensors`, que indica que, en caso de existir pesos publicados, estos se distribuirían en ese formato. El tamaño del repositorio figura como 0.0 GB, lo que impide confirmar que los pesos estén efectivamente alojados en el momento de la consulta.

## Capacidades

- No se ha documentado ninguna capacidad en la model card del autor.
- No consta soporte de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta información sobre capacidades multilingües ni sobre modos especiales (thinking mode, visión, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin información sobre arquitectura, contexto, idiomas o rendimiento. Cualquier aplicación práctica requeriría, como mínimo, verificar previamente los siguientes puntos:

- Confirmar que los pesos están efectivamente publicados en el repositorio y son descargables.
- Inspeccionar los ficheros `config.json`, `tokenizer_config.json` y los safetensors para determinar arquitectura, tamaño real y vocabulario.
- Ejecutar una evaluación mínima de calidad (perplejidad, generación de muestra) antes de considerar cualquier integración.
- Verificar la tokenización y los idiomas reales soportados mediante pruebas con texto en castellano.
- Comprobar la longitud de contexto efectiva del tokenizer y del modelo.
- Validar el comportamiento en tareas de instrucción antes de plantear un uso en producción.

Hasta que el autor publique documentación o pesos verificables, el modelo no es apto para ningún escenario de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño real del modelo, que no está confirmado).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; a falta de confirmación de arquitectura, no se puede garantizar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable sin conocer el tamaño, la arquitectura y el rendimiento del modelo. El sufijo "3.5M" sugiere, en el mejor de los casos, un modelo del orden de millones de parámetros, una escala muy inferior a la de los modelos de lenguaje habitualmente desplegados en producción (que se miden en miles de millones). No obstante, esta interpretación no está confirmada y, por tanto, la comparativa se marca como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EX-AI-Corase-3.5M | no disponible | no disponible | MIT | repositorio sin pesos confirmados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no contiene descripción, arquitectura ni datos de entrenamiento; no es posible evaluar sesgos conocidos.
- No hay información sobre tasas de alucinación ni sobre evaluación de calidad.
- No se especifican idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano.
- No se conoce la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- El repositorio figura con un tamaño de 0.0 GB, lo que genera dudas razonables sobre la disponibilidad real de los pesos.
- La licencia MIT permite uso comercial, modificación y redistribución, pero esta permisividad no compensa la ausencia total de documentación técnica.
- No se debe asumir que el sufijo "3.5M" del nombre corresponda al número de parámetros; es una convención de nomenclatura, no un dato confirmado por el autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por parte de la comunidad ni de validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EXAiStudio/EX-AI-Corase-3.5M
