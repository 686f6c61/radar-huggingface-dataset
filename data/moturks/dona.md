# MoTurks/Dona

## Resumen

Dona es un modelo publicado en HuggingFace por el usuario MoTurks, descrito como un "secretario personal de IA" orientado a organizar tareas, ideas, notas y eventos de calendario. La información pública es extremadamente limitada: no se especifica arquitectura, tamaño, parámetros, ni pipeline de uso. El repositorio tiene acceso restringido (gated), lo que obliga a aceptar condiciones antes de poder descargarlo o utilizarlo.

A fecha de su publicación (agosto de 2026), el modelo no registra descargas ni valoraciones, y no se han publicado documentos técnicos, papers o benchmarks asociados. Por tanto, cualquier evaluación de capacidades o rendimiento debe considerarse preliminar y basada únicamente en la descripción comercial del autor. Su relevancia actual es incierta, ya que no hay evidencia de adopción ni de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no se indica si es safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La única descripción disponible es la etiqueta de "Personal AI Secretary", que sugiere un enfoque orientado a tareas de productividad, pero sin detalles técnicos verificables.

## Capacidades

Según la descripción del autor, Dona está diseñado para:

- Organizar tareas y gestionar listas de pendientes.
- Recopilar y estructurar ideas.
- Tomar y gestionar notas.
- Gestionar eventos de calendario.

No se dispone de información sobre capacidades de generación de texto general, razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo. Tampoco se confirma si el modelo es un LLM, un agente conversacional o una aplicación más amplia. Dado el acceso restringido y la ausencia de documentación, estas capacidades no pueden verificarse.

## Casos de uso

Dado que no se dispone de especificaciones técnicas ni de ejemplos de uso documentados, los casos de uso solo pueden inferirse de la descripción del producto. Se indican como posibilidades, no como funcionalidades confirmadas:

- Asistente personal de productividad: podría ayudar a gestionar el día a día, recordando tareas y eventos, aunque se desconoce su integración con calendarios o APIs externas.
- Toma de notas estructurada: podría organizar apuntes o ideas en formato coherente, pero no hay evidencia de su calidad o límites.
- Gestión de tareas en entornos personales: podría usarse como interfaz conversacional para añadir o consultar tareas, si soporta interacción en lenguaje natural.
- Automatización de recordatorios: podría generar avisos basados en entradas de calendario, si tiene acceso a dichos datos.
- Asistente para equipos pequeños: podría servir como apoyo en la organización de proyectos, aunque sin datos sobre capacidades colaborativas.
- Prototipado de agentes de productividad: desarrolladores podrían usarlo como base para experimentar con asistentes personales, siempre que se acepten las condiciones de acceso.

En todos los casos, la falta de documentación técnica y de ejemplos reales impide recomendar su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Se desconocen la VRAM necesaria, las GPU recomendadas, la posibilidad de ejecución en hardware de consumo, las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) y los valores de latencia o throughput. Cualquier estimación sería especulativa.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. No se conocen alternativas de la misma categoría (asistentes personales de IA) con las que se pueda contrastar parámetros, contexto, rendimiento o licencia. La ausencia de datos técnicos impide cualquier comparación objetiva.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace antes de su uso, lo que limita su disponibilidad y dificulta la evaluación independiente.
- Documentación inexistente: no hay papers, guías técnicas ni ejemplos de uso que permitan entender su funcionamiento interno.
- Sin datos de rendimiento: no se han publicado benchmarks ni evaluaciones de calidad, por lo que no se puede garantizar su fiabilidad.
- Riesgo de alucinación: al ser un modelo de IA, es probable que genere respuestas incorrectas o inventadas, pero no se ha evaluado su tasa de error.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos, por lo que no se puede descartar la presencia de sesgos de género, raza o idioma.
- Licencia MIT: aunque permite uso comercial y modificación, la falta de claridad sobre los datos de entrenamiento podría implicar riesgos legales si se usan datos con derechos de autor.
- Sin soporte comunitario: con cero descargas y cero likes, no hay evidencia de que el modelo haya sido probado o validado por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MoTurks/Dona

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios de código o demos) en la búsqueda web.
