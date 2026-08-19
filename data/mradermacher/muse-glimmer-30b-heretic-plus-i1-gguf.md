# mradermacher/Muse-Glimmer-30B-heretic-plus-i1-GGUF

## Resumen

Muse-Glimmer-30B-heretic-plus-i1-GGUF es una cuantización en formato GGUF del modelo base [gjtgjt/Muse-Glimmer-30B-heretic-plus](https://huggingface.co/gjtgjt/Muse-Glimmer-30B-heretic-plus), realizada por mradermacher. El modelo original es un sistema multimodal de tipo *image-text-to-text* con 27.854.794.240 parámetros (aproximadamente 27,85 mil millones), orientado a tareas conversacionales y de visión-lenguaje. La variante "heretic" indica que ha sido sometido a un proceso de *abliteration* (eliminación de capas de rechazo) y se presenta como "uncensored", lo que implica una menor restricción en la generación de contenido.

Esta versión GGUF utiliza cuantización con matriz de importancia (imatrix) y está pensada para facilitar la ejecución en hardware más modesto, tanto en CPU como en GPU, mediante motores de inferencia como llama.cpp, Ollama o LM Studio. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el modelo declara soporte para inglés, chino y otros idiomas multilingües.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text, probablemente basado en transformer, pero sin confirmación) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,8 GB); también se ofrece el archivo imatrix para generar cuantizaciones propias |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por los tags de HuggingFace se sabe que es un modelo multimodal (image-text-to-text) y que ha sido modificado mediante *abliteration* (técnica que elimina las capas de rechazo entrenadas para alinear el modelo con directrices de seguridad). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

La cuantización i1-Q2_K aplicada por mradermacher utiliza un proceso de imatrix (matriz de importancia) que optimiza la asignación de bits según la importancia de cada peso, lo que suele ofrecer mejor calidad que las cuantizaciones estáticas equivalentes. El repositorio también incluye el archivo imatrix para que el usuario pueda generar sus propias cuantizaciones.

## Capacidades

- Modelo multimodal que acepta entradas de imagen y texto, y genera texto (image-text-to-text).
- Capacidad conversacional multi-turno, según el tag "conversational".
- Soporte multilingüe: inglés, chino y otros idiomas (etiqueta "multilingual").
- Al ser una variante "uncensored" y "abliterated", presenta una menor tendencia a rechazar peticiones consideradas sensibles o controvertidas.
- No se ha confirmado soporte para tool calling, function calling ni razonamiento multi-paso específico, aunque al ser un modelo conversacional podría ser utilizado para tareas de agente básico con la infraestructura adecuada.

## Casos de uso

- Asistentes conversacionales multilingües: gracias a su soporte para inglés y chino, puede integrarse en chatbots de atención al cliente o asistentes personales que requieran interacción en varios idiomas.
- Descripción y análisis de imágenes: al ser un modelo de visión-lenguaje, puede generar descripciones detalladas de fotografías, diagramas o capturas de pantalla, útil en aplicaciones de accesibilidad o documentación automática.
- Generación de contenido creativo sin filtros: su naturaleza "uncensored" lo hace adecuado para proyectos de escritura creativa, roleplay o generación de narrativas donde se requiere libertad temática.
- Prototipado de aplicaciones multimodales en entornos con recursos limitados: al estar cuantizado en GGUF, puede desplegarse en portátiles o servidores sin GPU dedicada mediante llama.cpp o Ollama.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, puede servir como caso de estudio para analizar los efectos de eliminar capas de rechazo en modelos grandes.
- Traducción automática informal: su capacidad multilingüe permite su uso como traductor de textos o diálogos, aunque sin garantías de calidad comparable a sistemas especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su variante cuantizada.

## Requisitos de hardware

- La cuantización i1-Q2_K ocupa 10,8 GB en disco. Para cargar el modelo en GPU se recomienda al menos 12 GB de VRAM (por ejemplo, una RTX 3060 12 GB o superior). Con 16 GB de VRAM (RTX 4080, RTX 4090) se puede ejecutar con contexto moderado.
- En CPU, se puede ejecutar con 16 GB de RAM o más, aunque la velocidad será limitada. Motores como llama.cpp permiten usar la RAM como memoria adicional.
- El archivo imatrix (0,1 GB) no es necesario para la inferencia, solo para generar cuantizaciones personalizadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o cualquier motor compatible con GGUF. También se puede usar con la librería `llama-cpp-python` para integraciones en Python.
- La latencia dependerá del hardware. En una GPU de gama alta (RTX 4090) se pueden esperar velocidades de 10-20 tokens/s con Q2_K; en CPU, la velocidad será considerablemente menor (1-5 tokens/s).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría (multimodales de ~30B cuantizados en GGUF). Se desconoce el rendimiento relativo frente a alternativas como LLaVA-34B, CogVLM2-19B u otros modelos de visión-lenguaje de tamaño similar. La falta de benchmarks publicados impide una comparación objetiva.

## Limitaciones y advertencias

- La cuantización Q2_K es de baja precisión y puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- Al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, ilegal o perjudicial. No se recomienda su uso en aplicaciones públicas sin moderación adicional.
- No se ha confirmado la longitud de contexto real; el uso de ventanas de contexto largas podría requerir más memoria de la estimada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- No hay información sobre sesgos específicos del modelo, pero al estar entrenado con datos multilingües puede presentar sesgos culturales o lingüísticos.
- El modelo no ha sido evaluado en benchmarks estándar, por lo que su rendimiento real en tareas concretas es incierto.
- Al ser una cuantización de un tercero (mradermacher), no hay garantía de que los pesos reflejen fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio GGUF: [mradermacher/Muse-Glimmer-30B-heretic-plus-i1-GGUF](https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-plus-i1-GGUF)
- Modelo base: [gjtgjt/Muse-Glimmer-30B-heretic-plus](https://huggingface.co/gjtgjt/Muse-Glimmer-30B-heretic-plus)
- Repositorio de cuantizaciones estáticas: [mradermacher/Muse-Glimmer-30B-heretic-plus-GGUF](https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-plus-GGUF)
- Página de solicitudes de modelos de mradermacher: [model_requests](https://huggingface.co/mradermacher/model_requests)
