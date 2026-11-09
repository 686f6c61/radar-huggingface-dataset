# afun-anonymous/AFUN

## Resumen

AFUN es un checkpoint de investigación orientado a robótica, concretamente a la predicción de *affordances* (posibilidades de acción) y a la manipulación de objetos en entornos 3D. Lo publica el usuario anónimo `afun-anonymous`, lo que indica que se trata de un envío en revisión o de un artefacto de evaluación anónima, no de un modelo de producción con soporte estable. El repositorio contiene un único fichero de pesos, `afun.pt`, de aproximadamente 1,3 GB, que debe cargarse con el código de inferencia del repositorio de código anónimo del autor.

El modelo no es un LLM autónomo: es un sistema compuesto que combina varios *backbones* preentrenados descargados por separado desde Hugging Face. Según la model card, integra Qwen3-VL-8B (un modelo visión-lenguaje), SAM3 (segmentación de segmentos, con acceso restringido) y Sonata (representaciones 3D). La tarea declarada abarca *affordance*, manipulación, movimiento 3D y segmentación, lo que sugiere un pipeline multimodal que fusiona percepción visual, segmentación y razonamiento sobre objetos.

Su relevancia es acotada pero específica: cubre el nicho de modelos de *affordance* para robótica con licencia Apache 2.0, lo que permite reutilización comercial del checkpoint. Sin embargo, la información pública es mínima (sin métricas, sin detalles de entrenamiento, sin idiomas declarados) y el modelo depende de un backbone con *gating* (SAM3), lo que condiciona su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto multimodal (backbones Qwen3-VL-8B, SAM3 y Sonata); arquitectura interna del checkpoint no disponible |
| Parametros totales | no disponible (el fichero `afun.pt` ocupa ~1,3 GB, pero no se especifica el recuento de parámetros) |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`afun.pt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint. Lo que sí se explicita es su composición: AFUN se apoya en tres backbones externos que se descargan de Hugging Face en el primer uso. Qwen3-VL-8B aporta la parte visión-lenguaje (comprensión de imágenes y texto), SAM3 aporta segmentación de alta calidad (con acceso restringido en su repositorio oficial) y Sonata aporta representaciones o movimiento 3D. El checkpoint `afun.pt` corresponde al modelo de la "Table 3" del artículo asociado, según la propia model card.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Los datasets complementarios publicados (`AFUN`, `AFUN_eval`, `AFUN_pool`) sugieren que el entrenamiento y la evaluación se hicieron sobre un corpus propio de *affordance* y manipulación, pero su contenido y tamaño no se detallan en la información disponible.

## Capacidades

- Predicción de *affordances*: identificación de regiones y posibilidades de acción sobre objetos, etiquetada explícitamente en los *tags* del modelo.
- Segmentación: integración de SAM3 para generar máscaras de objetos o regiones relevantes.
- Movimiento 3D: uso de Sonata para representaciones o razonamiento sobre movimiento en tres dimensiones.
- Comprensión visión-lenguaje: heredada de Qwen3-VL-8B, lo que permite condicionar la predicción con instrucciones o descripciones textuales.
- Manipulación robótica: el pipeline está orientado a tareas de manipulación, presumiblemente en el contexto de planificación o percepción para brazos robóticos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): visión sí (vía Qwen3-VL-8B y SAM3); audio y *thinking mode* no disponibles.

## Casos de uso

- Percepción para manipulación robótica: el modelo puede identificar qué partes de un objeto son agarrables o accionables (*affordances*) y alimentar un planificador de agarre; es adecuado porque combina segmentación (SAM3) con razonamiento visual (Qwen3-VL-8B).
- Segmentación guiada por lenguaje en entornos industriales: dado un objeto descrito en texto, el pipeline puede localizarlo y segmentarlo para tareas de picking; encaja por la componente visión-lenguaje del backbone.
- Anotación automática de datasets de robótica: usar AFUN para preetiquetar regiones de *affordance* y máscaras en nuevas grabaciones, reduciendo el coste de anotación manual antes de una revisión humana.
- Investigación en *affordance learning*: servir como *baseline* reproducible (licencia Apache 2.0) para comparar nuevos métodos sobre los datasets `AFUN_eval` y `AFUN_pool`.
- Prototipado de sistemas de interacción objeto-robot en 3D: aprovechar la componente Sonata para razonar sobre movimiento y orientación de objetos antes de ejecutar una trayectoria.
- Evaluación de *pipelines* multimodales en laboratorio: al depender de tres backbones externos, es útil para estudiar cuellos de botella de integración (descarga, *gating* de SAM3, latencia) en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un modelo de la "Table 3", pero no incluye la tabla ni cifras de MMLU, HumanEval, GSM8K ni métricas específicas de *affordance* o segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El checkpoint pesa ~1,3 GB, pero el sistema completo requiere cargar Qwen3-VL-8B (~8 000 millones de parámetros), SAM3 y Sonata, por lo que el consumo real será muy superior al del fichero `afun.pt`.
- GPU recomendadas: no disponible. Por el tamaño del backbone Qwen3-VL-8B, se necesitará al menos una GPU con memoria suficiente para un modelo de 8B (orientativamente 16-24 GB en precisión reducida), pero el autor no lo especifica.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de 8B en cuantización de 8 bits o 4 bits podría caber en GPUs de consumo de gama alta, pero AFUN no documenta cuantizaciones ni requisitos.
- Opciones de despliegue: el autor solo documenta la ejecución mediante `python demo.py --checkpoint checkpoints/afun.pt` desde su repositorio de código. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de *affordance* robótica ni métricas que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública mínima: no hay métricas, detalles de entrenamiento ni evaluación, lo que impide validar su rendimiento antes de usarlo.
- Dependencia de backbones externos: requiere descargar Qwen3-VL-8B, SAM3 y Sonata; SAM3 está *gated*, por lo que hay que solicitar acceso a `facebook/sam3` antes de poder ejecutar el pipeline.
- Reproducibilidad condicionada: el código de inferencia está en un repositorio anónimo, sin garantía de mantenimiento ni de estabilidad de la API.
- Riesgo de alucinación: al incorporar un modelo visión-lenguaje de 8B, puede generar descripciones o *affordances* incorrectas; no se documentan mitigaciones.
- Sesgos: no disponibles; no se describe la composición del dataset ni la diversidad de objetos o escenas.
- Limitaciones de idioma y contexto: no se declaran idiomas soportados ni longitud de contexto.
- Licencia: Apache 2.0 permite uso comercial del checkpoint, pero conviene verificar las licencias de los backbones (Qwen3-VL-8B, SAM3, Sonata), que pueden tener condiciones propias.
- Estado del artefacto: autor anónimo, cero descargas y cero *likes* en el momento de la consulta; tratarlo como material de investigación, no como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/afun-anonymous/AFUN
- Dataset AFUN: https://huggingface.co/datasets/afun-anonymous/AFUN
- Dataset AFUN_eval: https://huggingface.co/datasets/afun-anonymous/AFUN_eval
- Dataset AFUN_pool: https://huggingface.co/datasets/afun-anonymous/AFUN_pool
- SAM3 (backbone con acceso restringido): https://huggingface.co/facebook/sam3
