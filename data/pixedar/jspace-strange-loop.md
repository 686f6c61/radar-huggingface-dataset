# Pixedar/jspace-strange-loop

## Resumen

`Pixedar/jspace-strange-loop` es un checkpoint experimental de investigación en interpretabilidad, no un modelo de lenguaje completo. Se trata de un "lector" compacto (reader) que opera sobre las activaciones de la capa 24 de `Qwen/Qwen3-8B`, cuyo modelo base permanece congelado durante todo el desarrollo. El autor, Wiktor Tomasik (Pixedar), lo presenta como una pieza de un estudio sobre lo que denomina "J-space" y "bucles extraños" en el espacio de activaciones internas del transformer.

El lector selecciona una ventana de dieciséis observaciones de la actividad de la capa 24 y mantiene un estado interno compuesto por un vector de postura de ocho números, un hábito aprendido y una predicción de atención. Un vector de 32 números proporciona la dirección usada para transformar la postura. La predicción estima el contenido de claves seleccionadas menos la media, y el autor advierte explícitamente que no constituye un registro explícito de una proposición ni de su propiedad.

Es relevante ahora por dos motivos: por un lado, se enmarca en la línea de investigación sobre interpretabilidad mecanicista y esquemas de atención en modelos abiertos de 8B parámetros; por otro, su model card incluye restricciones de uso poco habituales (prohibición de entrenar modelos de propósito general con este trabajo) que conviene leer antes de cualquier reutilización. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, coherente con un checkpoint de lector compacto y no con los pesos completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector compacto sobre activaciones de capa 24 de Qwen3-8B (transformer); no incluye el modelo base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de 16 observaciones de capa 24) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | AGPL-3.0-only (pesos y software); texto, figuras y datos nuevos del autor bajo CC BY-SA 4.0 |
| Formato de pesos | no disponible (checkpoint PyTorch; el demo usa `states.npz`) |

## Arquitectura y entrenamiento

El componente publicado no es un transformer generativo sino un lector que consume activaciones internas de `Qwen/Qwen3-8B`. Según la model card, el lector selecciona una ventana de dieciséis observaciones de la actividad de la capa 24; su postura de ocho números, su hábito aprendido y su pronóstico de atención influyen en esa selección. Un vector de 32 números aporta la dirección con la que se transforma la postura. El pronóstico predice el contenido de claves seleccionadas menos la media, y el autor subraya que no es un registro explícito de una proposición ni de su propiedad.

Durante el desarrollo, tanto el modelo base como los pesos neuronales del lector permanecen congelados; lo que evoluciona en línea son las estadísticas de postura, hábito y predicción de atención. En operación en vivo, el sistema escribe un contraste de contenido nativo amplio antes de la capa 16 y lee el retorno procesado después de la capa 24. El autor menciona además una ruta experimental posterior de retroalimentación interpretación-a-atención que altera la organización registrada a costa de la capacidad de respuesta textual; esas variantes no son los pesos por defecto ni tienen comportamiento lingüístico establecido por las pruebas de referencia anteriores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Lectura y selección de activaciones internas de la capa 24 de Qwen3-8B mediante una ventana de dieciséis observaciones.
- Mantenimiento de un estado interno con postura de ocho números, hábito aprendido y pronóstico de atención.
- Predicción del contenido de claves seleccionadas menos la media (contraste de contenido), sin registro explícito de proposiciones.
- Escritura de un contraste de contenido nativo antes de la capa 16 y lectura del retorno procesado tras la capa 24 en operación en vivo.
- Reproducción numérica de un demo grabado con `reproduce.py` sobre `demo/states.npz` (468 pasos, warmup 0, CPU), pensado como comprobación de simetría, no como demostración de individualidad.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo más allá del inglés en los metadatos.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el lector permite estudiar cómo se organiza y selecciona la información en la capa 24 de un modelo de 8B, con un estado interno explícito y auditable.
- Reproducción de experimentos registrados: el script `reproduce.py` y el fichero `demo/states.npz` permiten replicar las historias grabadas y verificar la preservación de simetría en cuatro historias idénticas.
- Análisis de esquemas de atención: el pronóstico de atención y la ventana de dieciséis observaciones sirven para contrastar hipótesis sobre qué claves se seleccionan frente a la media.
- Estudio de retroalimentación interpretación-a-atención: las variantes experimentales permiten medir el coste en capacidad de respuesta textual al alterar la organización registrada.
- Docencia y divulgación técnica: el material del estudio unificado y el Space acompañante permiten ilustrar conceptos de espacio de activaciones y bucles extraños con evidencia numérica publicada.
- Auditoría de estados internos: el snapshot desarrollado incluye estado del controlador y observaciones (sin contexto ni caché de Qwen), útil para inspeccionar la evolución del estado sin depender del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint publicado es un lector compacto; el repositorio ocupa 0.0 GB, por lo que su carga no requiere VRAM significativa más allá del runtime de PyTorch.
- Para ejecutar el demo grabado basta con PyTorch y NumPy; la model card indica CPU como dispositivo válido (`--device cpu`).
- Para operar sobre activaciones reales se necesita además cargar `Qwen/Qwen3-8B`; no se especifican en la información disponible los requisitos de VRAM para ese caso.
- GPU recomendadas: no disponible para el lector; para el modelo base de 8B se aplicarían los requisitos habituales de Qwen3-8B, no detallados aquí.
- Opciones de despliegue: el autor solo documenta la ejecución mediante `python reproduce.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pixedar/jspace-strange-loop | Lector de interpretabilidad sobre Qwen3-8B | no disponible | ventana de 16 observaciones | AGPL-3.0-only | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | LLM generativo base | 8B (no confirmado en esta ficha) | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas de interpretabilidad mecanicista | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (lectores de activaciones o esquemas de atención experimentales) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable para generación: es un checkpoint de lector que depende de Qwen3-8B y no incluye contexto ni caché del modelo base.
- El autor declara explícitamente que no se demuestra una fusión completa de "J-workspace" con un modelo de sí mismo ni conciencia subjetiva.
- El pronóstico de atención no es un registro explícito de proposiciones ni de su propiedad; interpretarlo como tal sería un error.
- El demo de cuatro historias idénticas es una comprobación numérica de simetría, no una demostración de individualidad.
- Las variantes de retroalimentación interpretación-a-atención no son los pesos por defecto y su comportamiento lingüístico no está establecido.
- Idiomas: solo inglés en los metadatos; sin soporte multilingüe documentado.
- Licencia AGPL-3.0-only para pesos y software, con obligaciones de copyleft que afectan al uso en servicios de red; el texto, figuras y datos nuevos del autor quedan bajo CC BY-SA 4.0.
- La política de reutilización del autor solicita no usar este trabajo para entrenar modelos de propósito general ni para nueva investigación derivada, y pide contribuciones upstream solo para desarrollo automatizado de investigación; las licencias abiertas existentes siguen vigentes.
- Riesgo de alucinación y sesgos: no evaluables, ya que no se documentan capacidades generativas ni evaluaciones de sesgo.
- Madurez: 0 descargas y 0 likes; proyecto experimental con documentación actualizada en noviembre de 2026.

## Enlaces

- Hugging Face: https://huggingface.co/Pixedar/jspace-strange-loop
- Estudio unificado: https://pixedar.github.io/projects/self-awareness/attention-reader/study/index.html
- Informe científico y código: https://github.com/Pixedar/jspace-strange-loop
- Evidencia numérica (dataset): https://huggingface.co/datasets/Pixedar/jspace-strange-loop-evidence
- Space acompañante: https://huggingface.co/spaces/Pixedar/strange-loop-in-j-space
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
