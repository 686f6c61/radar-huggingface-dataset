# Charlie320/zils-lite-c5i5

## Resumen

zils-lite-c5i5 es un modelo de decisión de aproximadamente 853 millones de parámetros, publicado por el usuario Charlie320 en Hugging Face bajo licencia Apache-2.0. Se trata de un fine-tune de Qwen/Qwen3.5-0.8B en el formato "chassis" del ecosistema Zils, orientado a tareas de decisión estructurada dentro del pool `d3-lite` de la subred 127 de Bittensor. El modelo parte de la media uniforme de pesos de dos cuerpos previos del soup del 14 de noviembre de 2026 (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc) y se entrena mediante cinco fine-tunes LoRA de rango 32 con semillas distintas, promediados y mezclados al 50 % con el punto de partida.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general, sino un componente ("body") de un pool de decisión que responde a ítems en formato de examen con familias de tareas conocidas. Su entrenamiento combina datos etiquetados (unos 31.100 ítems de examen autorados con la receta pública de Zils) y datos no etiquetados de destilación (15.000 filas de tasksource/tasksource-jev-typed-decisions), usando como profesor la media del soup `d3-mini`. Incorpora la torre de visión del modelo padre, aunque la model card no detalla su funcionamiento.

Al no disponer de pipeline declarado, idiomas soportados ni resultados de benchmarks publicados, la ficha debe interpretarse como una descripción técnica del proceso de construcción y de las especificaciones verificables (tamaño, licencia, formato de pesos). Es un artefacto de investigación reproducible más que un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); incluye torre de visión del modelo padre |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen/Qwen3.5-0.8B, con la torre de visión procedente del modelo padre y pesos de lenguaje entrenados. El proceso de construcción es un "soup fine-tune": se parte de la media uniforme de pesos de dos cuerpos previos del pool `d3-lite` (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), se realizan cinco fine-tunes LoRA de rango 32 (fusionados) con semillas distintas, una época cada uno a learning rate 5e-5, y se promedian uniformemente; los pesos publicados son el punto medio (peso 0,5) entre esa media de cinco semillas y la media del soup de partida.

Los objetivos de entrenamiento son "soft": para los ítems escritos, un cuarto de la respuesta propia del ítem y tres cuartos de las probabilidades de respuesta de la media del soup `d3-mini` actual (destilación desde el profesor, que es la media uniforme de Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b); para las filas sin etiqueta, solo las probabilidades del profesor. Los datos de entrenamiento comprenden unas 46.100 filas con una pasada barajada por semilla: aproximadamente 31.100 ítems de examen en formato de decisión de las familias de tareas conocidas, autorados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local a partir de splits de entrenamiento de los datasets fuente públicos, incluyendo unos 1.100 ítems de tool-call extraídos de las filas 90.000-93.000 del subconjunto de function-calling de glaiveai/glaive-function-calling-v2; y 15.000 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions usadas solo como entradas de destilación sin etiqueta (excluidas las fuentes con licencia comercial o no especificada y las no comerciales). No se usaron ítems del examen del validador, ítems públicos de semilla ni datos de clientes.

## Capacidades

- Generación de decisiones estructuradas en el formato de examen de las familias de tareas conocidas del pool Zils `d3-lite`.
- Tool calling / function calling: el entrenamiento incluye unos 1.100 ítems específicos de llamada a herramientas derivados de glaive-function-calling-v2.
- Destilación de probabilidades: el modelo está optimizado para reproducir las distribuciones de respuesta del profesor `d3-mini`, no solo etiquetas duras.
- Capacidades de visión: incorpora la torre de visión del modelo padre Qwen/Qwen3.5-0.8B, aunque la model card no detalla su alcance ni su evaluación.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas).
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Evaluación de ítems de examen en el pool Zils: el modelo responde a ítems de decisión en el formato exacto de las familias de tareas conocidas, por lo que puede usarse como "body" candidato dentro del pool `d3-lite` de la subred 127 de Bittensor y compararse con otros cuerpos del soup.
- Destilación y destilación inversa: al haberse entrenado con objetivos soft contra el profesor `d3-mini`, sirve como punto de partida para experimentos de destilación de conocimiento entre modelos del mismo ecosistema, midiendo la fidelidad de las distribuciones reproducidas.
- Investigación sobre weight averaging y model soups: el proceso de cinco LoRA promediados y mezcla al 50 % con el punto de partida es reproducible y permite estudiar el efecto del promediado de pesos y semillas en modelos pequeños.
- Clasificación y decisión estructurada en dominios acotados: para tareas donde la salida es una elección entre opciones predefinidas (formato de examen), el modelo puede integrarse en pipelines de evaluación automática con salidas parseables.
- Experimentos de tool calling en modelos pequeños: los ítems de function-calling de glaive permiten evaluar la capacidad de un modelo de 0,85B para emitir llamadas a herramientas en formato estructurado.
- Reproducibilidad y auditoría de artefactos: al documentarse la receta completa (datasets, seeds, learning rate, mezcla), el modelo es útil como caso de estudio de trazabilidad de datos y licencias en fine-tunes derivados.
- Prototipado de bajo coste en hardware consumer: con 853M parámetros en BF16 (repo de 1,7 GB), cabe en GPUs de consumo para pruebas de inferencia y validación de pipelines antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB para pesos; en 4 bits, alrededor de 0,5-0,7 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas e incluso en algunas integradas con memoria unificada suficiente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles en principio con pesos safetensors de un transformer Qwen; la conversión a GGUF requeriría verificar la compatibilidad de la torre de visión y del layout "chassis".
- Latencia y throughput: no disponibles (no publicados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-c5i5 | 852.985.920 | No disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune de decisión del pool Zils, con torre de visión |
| Qwen/Qwen3.5-0.8B | ~0,8B | No disponible en la información | No disponible en la información | Hugging Face | Modelo base del que deriva |
| VadymPikulyk/zils-lite-dh2 | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo previo del soup `d3-lite`, componente del punto de partida |
| qhoenix/zils-lite-decision-avg-abc | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo previo del soup `d3-lite`, componente del punto de partida |

No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está entrenado exclusivamente para ítems de decisión en formato de examen de las familias de tareas conocidas del pool Zils; su comportamiento fuera de ese formato no está caracterizado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe asumirse un rendimiento equiparable al de modelos de propósito general.
- Riesgo de alucinación: no evaluado; al ser un modelo de 0,85B con objetivos de destilación, puede reproducir errores del profesor `d3-mini`.
- Idiomas no declarados: la model card no especifica idiomas soportados; no se garantiza un comportamiento multilingüe correcto.
- Contexto no declarado: se desconoce la longitud de contexto efectiva; no debe asumirse la del modelo base sin verificación.
- Dependencia de datos de terceros: el entrenamiento usa datasets públicos (glaive-function-calling-v2, tasksource-jev-typed-decisions) y el autor advierte de que se deben comprobar los términos de los datasets fuente antes de reutilizar; aunque se excluyeron fuentes con licencia comercial o no especificada, la responsabilidad de verificación recae en el usuario.
- Licencia Apache-2.0: permite uso comercial, pero no cubre posibles restricciones de los datasets fuente ni de los modelos previos del soup; conviene auditar la cadena de derivación.
- Trazabilidad limitada: el repositorio contiene solo pesos; la receta de autoría (`scripts/author_exam.py`) y los detalles completos del examen del validador no están incluidos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Uso en producción: no recomendado sin una evaluación propia en el dominio objetivo, dado que no hay pipeline declarado ni métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-c5i5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo del soup: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo del soup: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Componente del profesor `d3-mini`: https://huggingface.co/Zayaan/zils-mini-hm4
- Componente del profesor `d3-mini`: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Componente del profesor `d3-mini`: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de tool calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de destilación: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
