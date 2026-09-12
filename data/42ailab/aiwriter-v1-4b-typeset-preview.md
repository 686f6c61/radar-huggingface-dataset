# 42ailab/AIWriter-V1-4B-Typeset-Preview

## Resumen

AIWriter-V1-4B-Typeset-Preview es un modelo de generación de texto de 4.022.468.096 parámetros (aproximadamente 4B) desarrollado por 42ailab, un ajuste fino (finetune) del modelo base Qwen/Qwen3-4B. Su cometido no es la escritura de contenido, sino la conversión de intención de maquetación en código Typst compilable, cubriendo tanto libros como artículos académicos en chino simplificado. El modelo se distribuye ya cuantizado en GGUF Q8_0 (4,28 GB) y está empaquetado para el motor de inferencia local 42model, que lo integra en la aplicación de escritorio AIWriter.

La relevancia del modelo reside en la métrica que optimiza: la tasa de renderizado (porcentaje de salidas que compilan correctamente). Según la model card, el mismo modelo base sin entrenar obtiene un 0% de compilación, mientras que este ajuste alcanza un 94% de render rate y una puntuación global de 76,12 en el benchmark público StructEval-Typst, 18,75 puntos por encima del baseline de 397B comparado en la misma tabla. Esa combinación de tamaño reducido (ejecutable en un portátil, en local y sin conexión) y alta tasa de compilación es lo que lo distingue.

Se trata de una versión de vista previa: la model card indica explícitamente que V1 no es la versión final y que la publicación estable aparecerá como `42ailab/AIWriter-V1-4B-Typeset` tras el evento de lanzamiento de AIWriter. El repositorio se mantendrá por reproducibilidad y se marcará como superado. La ventana de contexto es de 16.384 tokens, con una salida recomendada de 900 tokens y salida en formato de código Typst.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (ajuste fino de Qwen3-4B); la model card no detalla componentes adicionales |
| Parametros totales | 4.022.468.096 (≈4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Salida recomendada | 900 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (4,28 GB); no se listan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | Chino simplificado (zh) |
| Licencia | AIWriter Model License 1.0 (gratuita para investigacion academica y uso personal; el uso comercial requiere licencia) |
| Formato de pesos | GGUF |
| Formato de salida | Codigo fuente Typst |
| Modelo base | Qwen/Qwen3-4B (Apache-2.0, Qwen Team), relacion: finetune |
| Tamano del repositorio | 4,3 GB |
| Pipeline | text-generation |
| Fecha de creacion (repo) | 2026-09-12 |

## Arquitectura y entrenamiento

La model card no publica la receta de entrenamiento ni los datos concretos del ajuste: indica que el diseño completo de la evaluacion, la receta de entrenamiento y las ablaciones apareceran en el informe tecnico y en los articulos asociados. Lo que si se especifica es que el modelo parte de Qwen3-4B, un transformer denso de 4B parámetros, y que ha sido ajustado (finetune) internamente por 42ailab para una tarea concreta: transformar intención de maquetación en código Typst que compile.

La innovación declarada no es arquitectónica sino de objetivo de optimización. El autor sostiene que "una salida de maquetación que no compila no vale nada, por elegante que sea su estructura", y por eso optimiza la tasa de renderizado (render rate) como métrica primaria, por encima de la puntuación de maquetación. No se mencionan en la información disponible técnicas como RLHF, DPO, decodificación especulativa ni atención lineal. La evaluación se realiza sobre el benchmark público StructEval-Typst.

## Capacidades

- Generación de código Typst compilable a partir de intención de maquetación, con una tasa de renderizado declarada del 94%.
- Maquetación de libros en chino: sangría de primera línea, marcas de título, puntos de énfasis y mezcla de CJK con latino.
- Maquetación académica: ecuaciones numeradas, tablas con booktabs, referencias a figuras y bibliografías.
- Generación de texto y conversación (pipeline text-generation, etiqueta conversational), aunque la model card insiste en que el modelo no escribe contenido, solo maqueta.
- Soporte de chino simplificado como único idioma evaluado sistemáticamente.
- Ejecución 100% local y sin conexión: el manuscrito no sale de la máquina del usuario.
- Integración con el motor 42model y con la aplicación AIWriter, que compila el resultado antes de mostrarlo.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Maquetación automática de libros en chino: el modelo recibe la intención de formato (sangría, títulos, énfasis, mezcla CJK/latino) y devuelve código Typst compilable; al tener 16.384 tokens de contexto, un libro completo debe segmentarse desde la aplicación.
- Preparación de artículos académicos: genera ecuaciones numeradas, tablas booktabs, referencias cruzadas a figuras y bibliografías directamente en Typst, evitando el trabajo manual de escribir la plantilla.
- Edición local con privacidad: para editoriales, autores o instituciones que no pueden enviar manuscritos inéditos a servicios en la nube, el modelo corre en local sobre un portátil y funciona sin conexión.
- Integración en la aplicación AIWriter: al abrir AIWriter, la aplicación descubre el motor local automáticamente y compila la salida antes de mostrarla, de modo que el código que no compila nunca llega al usuario; el modelo actúa como motor de la función de maquetación.
- Exportación desde pipelines documentales: cualquier flujo que necesite convertir un manuscrito a Typst puede invocar el modelo para generar la fuente y compilarla después con el compilador de Typst, usando la tasa de compilación como criterio de aceptación automático.
- Maquetación de documentación técnica interna: generación de plantillas Typst reproducibles para informes y manuales en chino, ejecutables en el propio equipo de trabajo sin coste de API.
- Prototipado y reproducibilidad en investigación: al ser un ajuste fino de Qwen3-4B con pesos abiertos para uso académico, sirve como caso de estudio de ajuste de modelos pequeños a tareas de código con métrica de compilación.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el benchmark público StructEval-Typst (`render` es la tasa de éxito de compilación). La tabla la publica el propio autor y ordena por puntuación global; no es un leaderboard completo.

| Modelo | Tamano | Global | render ↑ |
|---|---|---:|---:|
| Kimi-k2.7-code | no disponible | 78,99 | 92% |
| **Este modelo** | **4B** | **76,12** | **94%** |
| DeepSeek-V4.1-Flash | no disponible | 75,57 | 84% |
| GLM-5.2 | no disponible | 64,55 | 72% |
| qwen3.8-flash | no disponible | 60,88 | 68% |
| Qwen3.5-397B | 397B | 57,37 | 62% |
| Base model (sin entrenar) | 4B | 9,94 | 0% |

Notas de alcance incluidas por el autor: la puntuación de maquetación usa un modelo multimodal abierto como aproximación (el protocolo oficial emplea jueces tipo GPT-4o); las puntuaciones de render y de palabras clave siguen la lógica oficial exacta. Kimi-k2.7-code, GLM-5.2, Qwen3.5-397B y el modelo base sin entrenar provienen de una ejecución de 2026-07 bajo el mismo juez, mientras que DeepSeek-V4.1-Flash y qwen3.8-flash se midieron en 2026-09, por lo que los dos lotes de modelos externos no se llamaron bajo protocolos idénticos. El autor pide leerlo como "la mejor tasa de render que hemos medido", no como una victoria en un leaderboard. Se reserva un conjunto de test held-out para la evaluación cerrada de la versión estable.

No hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible.

## Requisitos de hardware

- Peso del fichero publicado: `AIWriter-V1-4B-Typeset-Q8_0.gguf`, 4,28 GB (build de calidad Q8_0).
- Modelo de 4B parámetros: cabe holgadamente en GPU de consumo. Con cuantización Q8_0 la VRAM necesaria estimada ronda los 5-6 GB solo para pesos, más el espacio de contexto (16.384 tokens) y el runtime.
- GPU de consumo compatibles: cualquier GPU con 8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090); también ejecutable en portátiles convencionales según el autor ("runs on an ordinary laptop").
- GPU de centro de datos: A100, H100 u otras son sobredimensionadas para un modelo de este tamaño; útiles solo para servir muchas peticiones concurrentes.
- Despliegue oficial: motor de inferencia local 42model, con descarga desde la biblioteca de modelos (Model Library → Writing) e integración automática en la aplicación AIWriter, sin endpoint ni clave que configurar.
- Al distribuirse en formato GGUF, es apto para runtimes de la familia llama.cpp; el autor no documenta explícitamente compatibilidad con vLLM, Ollama o TGI en la información disponible.
- Plataformas declaradas: macOS, Windows y Linux.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos de la misma categoría (ajustes de 4B especializados en maquetación Typst). La comparación más próxima que aporta la información disponible es con el modelo base sin ajustar y con los modelos generalistas evaluados en StructEval-Typst:

| Modelo | Parametros | Contexto | Global (StructEval-Typst) | render | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AIWriter-V1-4B-Typeset-Preview | 4B (4.022.468.096) | 16.384 | 76,12 | 94% | AIWriter Model License 1.0 (comercial requiere licencia) | GGUF Q8_0 en HuggingFace y ModelScope |
| Qwen3-4B (base, sin entrenar) | 4B | no disponible en esta ficha | 9,94 | 0% | Apache-2.0 | Pesos abiertos en HuggingFace |
| Qwen3.5-397B | 397B | no disponible | 57,37 | 62% | no disponible | no disponible |
| Kimi-k2.7-code | no disponible | no disponible | 78,99 | 92% | no disponible | no disponible |
| DeepSeek-V4.1-Flash | no disponible | no disponible | 75,57 | 84% | no disponible | no disponible |

El dato destacado por el autor es que un modelo de 4B supera en puntuación global a un baseline de 397B por 18,75 puntos, y que el mismo base sin entrenar no compila ninguna salida (0%).

## Limitaciones y advertencias

- Versión de vista previa: V1 no es la versión final; la versión estable se publicará como `42ailab/AIWriter-V1-4B-Typeset` y este repositorio quedará marcado como superado (aunque se conserva por reproducibilidad).
- Contexto limitado a 16.384 tokens con 900 tokens de salida recomendados: un libro completo debe segmentarse desde la aplicación.
- Compilar no es ser fiel: una fuente Typst que compila puede haber perdido o alterado texto, por lo que la aplicación debe verificar la fidelidad del contenido.
- Solo escribe maquetación, no contenido: no genera el texto del documento.
- Entrenado específicamente para libros y artículos académicos en chino simplificado; otros idiomas y tradiciones de maquetación no se han evaluado sistemáticamente, por lo que el rendimiento fuera del chino es incierto.
- Licencia restrictiva para producción comercial: AIWriter Model License 1.0 es gratuita para investigación académica y uso personal, pero el uso comercial requiere la adquisición de una licencia (el texto de la licencia en la model card aparece truncado en la información disponible).
- Comparativa de benchmarks con protocolos no homogéneos: los modelos externos se evaluaron en dos lotes con protocolos distintos (2026-07 y 2026-09) y la puntuación de maquetación usa un juez aproximado, no el protocolo oficial con jueces tipo GPT-4o.
- Métrica de render medida por el propio autor: no es un leaderboard verificado de forma independiente.
- Repositorio sin tracción pública en el momento de los datos: 0 descargas y 0 "me gusta".
- No se documentan capacidades de tool calling, agentes, visión ni audio, ni cuantizaciones distintas de Q8_0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/42ailab/AIWriter-V1-4B-Typeset-Preview
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo (fichero LICENSE del repositorio): ./LICENSE (referenciado en la model card; el contenido aparece truncado en la información disponible)
- README en chino simplificado: ./README_zh.md (referenciado en la model card)
- ModelScope: https://modelscope.cn/models/42ailab/AIWriter-V1-4B-Typeset-Preview
- Web de 42ailab: https://42ailab.com
- Motor de inferencia local 42model: https://42model.com
- Aplicación AIWriter: https://aiwriter.cn
- Typst (lenguaje de maquetación de destino): https://typst.app
- Benchmark StructEval-Typst: mencionado en la model card sin URL en la información disponible
- Informe técnico y artículos asociados: anunciados en la model card, sin enlace disponible
- Nota: los resultados de la búsqueda web proporcionada (Wikipedia, Genius, YouTube y Songtexte sobre "Read All About It, Pt. III" de Emeli Sandé) no guardan relación con este modelo y no se han utilizado.
