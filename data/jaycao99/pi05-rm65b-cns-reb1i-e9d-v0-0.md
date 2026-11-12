# JayCao99/pi05-rm65b-cns-reb1i-E9D-v0.0

## Resumen

Pi-0.5 (rm65b insert cns) es un checkpoint de política robótica entrenado mediante aprendizaje por imitación y publicado en Hugging Face por el usuario JayCao99. Se distribuye en formato LeRobot, la librería de referencia de Hugging Face para robótica, e implementa la clase `PI05Policy`, lo que lo vincula a la familia de políticas Pi-0.5 (Physical Intelligence). El modelo resuelve una tarea concreta de manipulación: la inserción de un objeto con un brazo robótico RM65B en un escenario etiquetado como "cns" y "reb1i".

El repositorio contiene un único checkpoint (`checkpoint-003700`) con el payload de despliegue completo: pesos en `model.safetensors`, `config.json`, preprocesador y postprocesador, y `train_config.json`. El entrenamiento alcanzó 3.700 pasos con una pérdida final de entrenamiento de 0,017, un valor bajo que sugiere un ajuste fino sobre un conjunto de demostraciones acotado.

La relevancia de esta ficha es limitada fuera de su nicho: no es un modelo de lenguaje generalista, sino una política visuomotora especializada. No hay información publicada sobre arquitectura interna, número de parámetros, contexto, idiomas ni licencia, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política Pi-0.5 (implementación `PI05Policy` de LeRobot); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo visuomotor, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` dentro de `checkpoint-003700/`) |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia Pi-0.5, una línea de políticas robóticas orientadas a control visuomotor de extremo a extremo, empaquetada para LeRobot. La model card no detalla la arquitectura interna (número de capas, dimensión de las representaciones, mecanismo de atención o esquema de difusión/flow matching), por lo que no es posible confirmar si se trata de un transformer puro, un modelo de difusión de políticas o una variante híbrida. Tampoco se especifican los datos de entrenamiento: número de demostraciones, composición del dataset, tareas incluidas ni si hubo etapas de RLHF o DPO (poco habituales en políticas de imitación).

Lo que sí consta es el proceso de ajuste: un único checkpoint en el paso 3.700 con pérdida final de entrenamiento de 0,017. El nombre del repositorio (`rm65b-cns-reb1i-E9D-v0.0`) sugiere un brazo RM65B, un escenario "cns" y una variante "reb1i", probablemente identificadores internos del proyecto. No hay información sobre aumentos de datos, regularización ni estrategia de evaluación.

## Capacidades

- Control visuomotor para tareas de inserción robótica (insert) con brazo RM65B.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas o teleoperadas.
- Integración nativa con LeRobot mediante `PI05Policy.from_pretrained`.
- Preprocesador y postprocesador incluidos en el checkpoint, lo que facilita el despliegue directo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan modos especiales (thinking, visión general, audio) más allá de la percepción visual implícita en la política.

## Casos de uso

- Automatización de inserción en línea de montaje: el checkpoint está entrenado específicamente para insertar piezas con un RM65B, por lo que puede desplegarse en una celda de ensamblaje para reproducir la tarea aprendida.
- Evaluación de políticas de imitación en laboratorio: sirve como referencia para comparar el rendimiento de Pi-0.5 frente a otras políticas LeRobot en la misma tarea.
- Base para ajuste fino con nuevas demostraciones: al incluir `train_config.json` y pre/postprocesadores, puede reentrenarse con datos propios del mismo brazo y escenario.
- Pruebas de integración de LeRobot en pipelines de robótica: útil para validar el flujo `snapshot_download` → `PI05Policy.from_pretrained` → ejecución en robot real o simulado.
- Reproducción de experimentos: permite verificar la pérdida de entrenamiento reportada (0,017) y analizar la convergencia del checkpoint.
- Docencia y formación en robótica de manipulación: ejemplo práctico de un checkpoint de imitación listo para desplegar con una API mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 9,4 GB en total, lo que da una cota superior aproximada del peso de los artefactos, pero no se desglosa el tamaño de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio sugiere que podría requerir GPUs con al menos 16-24 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: LeRobot (`PI05Policy`) como vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pi-0.5 (rm65b insert cns) | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | variable según checkpoint | Hugging Face (LeRobot) |
| Pi-0 (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea (inserción con RM65B en el escenario "cns"); no generaliza a otras tareas ni brazos sin reentrenamiento.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- Sin información de evaluación: no hay métricas de éxito en robot real, ni datos de robustez ante variaciones de iluminación, posición o fricción.
- Riesgo de sobreajuste: una pérdida de entrenamiento de 0,017 con un solo checkpoint sugiere un ajuste muy ceñido a las demostraciones; el rendimiento fuera de distribución es incierto.
- Sin datos sobre sesgos: al ser un modelo visuomotor, los sesgos relevantes serían de distribución de datos (posiciones, objetos, condiciones), no lingüísticos.
- Documentación mínima: la model card no detalla arquitectura, datos ni procedencia, lo que dificulta la auditoría y la reproducibilidad.
- Fecha de creación futura (2026-11-12): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/JayCao99/pi05-rm65b-cns-reb1i-E9D-v0.0
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
