# malkolm777/zils-lite-m24-mixed

## Resumen

zils-lite-m24-mixed es un ajuste fino (fine-tune) del modelo joamCriff123/zils-lite-l1121a, desarrollado por el usuario malkolm777. Se trata de un modelo de decisión ("decision-model") etiquetado dentro de la familia d3-lite, orientado a tareas de clasificación o puntuación sobre preguntas categorizadas, más que a la generación de texto abierta convencional. El modelo parte de una arquitectura de tipo transformer etiquetada como qwen3_5 en los metadatos de Hugging Face, con 852.985.920 parámetros totales según los pesos en safetensors.

El ajuste se realizó mediante una pasada de LoRA de rango 64 sobre las proyecciones de atención del modelo base, con semilla 4223 y tasa de aprendizaje 4e-05, fusionando después el adaptador en los pesos originales. El entrenamiento utilizó 850 preguntas etiquetadas P2/P3 de cinco categorías y dos bloques de tareas, además de 400 objetivos de probabilidad Ultra. El resultado es un modelo pequeño (menos de 1.000 millones de parámetros) publicado bajo licencia Apache 2.0.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy reciente (publicado el 24 de noviembre de 2026), sin descargas ni interacciones registradas en el momento de la consulta, y con documentación escasa. Resulta útil como ejemplo de ajuste ligero sobre un modelo base de la familia zils y para quienes necesiten un clasificador de decisiones de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5 en metadatos; requiere custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre joamCriff123/zils-lite-l1121a, en la revisión 523d974dc031ecaf4efc3b7772b4611938f5e455, que según la model card es el único miembro del "soup" d3-lite. La arquitectura subyacente se etiqueta como qwen3_5, lo que sugiere una variante de la familia Qwen 3.5, aunque el repositorio incluye código personalizado (custom_code), por lo que la carga requiere confiar en la implementación del autor. No se especifica el número de tokens de entrenamiento del modelo base ni la composición de su dataset.

El ajuste fino consistió en una única pasada de LoRA de rango 64 aplicada a las proyecciones de atención del "chassis" lingüístico, con semilla 4223 y tasa de aprendizaje 4e-05. Los datos de entrenamiento fueron 850 preguntas etiquetadas P2/P3 pertenecientes a cinco categorías y dos bloques de tareas, junto con 400 objetivos de probabilidad Ultra. El adaptador se fusionó en los pesos de partida. El SHA-256 del JSONL de entrenamiento es 468eedab4eb83d8c4d3cb75d970e02c92498a7bec86b61fa10c0a6b3c1261db7, lo que permite verificar la integridad del conjunto de datos si el autor lo publica.

## Capacidades

- Clasificación y decisión sobre preguntas categorizadas (etiquetas P2/P3 en cinco categorías y dos bloques de tareas).
- Puntuación de probabilidad ("Ultra probability targets") según el esquema de entrenamiento descrito.
- Generación de texto base heredada del modelo joamCriff123/zils-lite-l1121a, aunque no se documenta su alcance.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación de preguntas en pipelines de anotación: el modelo puede asignar etiquetas P2/P3 a preguntas entrantes dentro de las cinco categorías de entrenamiento, integrándose como paso de triaje previo a revisión humana.
- Puntuación de probabilidad en sistemas de decisión: los objetivos Ultra permiten usar el modelo para estimar probabilidades asociadas a cada pregunta, útil en motores de enrutamiento o priorización.
- Filtrado de contenido en colas de soporte: al ser un modelo pequeño (852 M de parámetros), puede desplegarse en CPU o GPU de gama baja para descartar o etiquetar consultas antes de pasarlas a un modelo mayor.
- Prototipado rápido de clasificadores especializados: sirve como punto de partida para ajustes LoRA adicionales sobre las mismas categorías, dado que el autor documenta el procedimiento completo (rango, semilla, tasa de aprendizaje).
- Evaluación de técnicas de "model soup": al provenir de un soup d3-lite, puede emplearse para comparar el rendimiento de mezclas de pesos frente a ajustes individuales en tareas de decisión.
- Investigación sobre ajuste eficiente: el modelo documenta una pasada LoRA de rango 64 fusionada, lo que lo convierte en un caso de estudio reproducible para medir el efecto de ajustes mínimos sobre modelos base pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en FP16 requiere aproximadamente 1,7 GB de pesos; en FP32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB (estimaciones teóricas a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradas para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: no documentadas por el autor. La presencia de custom_code y la etiqueta qwen3_5 sugieren que la carga requiere transformers con `trust_remote_code=True`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-m24-mixed | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| joamCriff123/zils-lite-l1121a (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de menos de 1.000 M de parametros (p. ej. Qwen2.5-0.5B, Llama-3.2-1B) | 500 M - 1.200 M | 32k - 128k | Apache 2.0 / Llama | Hugging Face, ampliamente adoptados |

No se dispone de datos de rendimiento del modelo ni de comparaciones publicadas con alternativas de la misma categoría; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no detalla idiomas, contexto, cuantizaciones ni benchmarks, lo que dificulta evaluar su idoneidad en producción.
- Modelo sin adopción: cero descargas y cero "likes" en el momento de la consulta, sin comunidad que valide su comportamiento.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de clasificación puede producir etiquetas fuera del esquema P2/P3 si la entrada se aleja de la distribución de entrenamiento.
- Sesgos: no documentados; el conjunto de entrenamiento (850 preguntas de cinco categorías) es reducido y puede introducir sesgos de selección.
- Limitaciones de idioma: no se declaran idiomas soportados; el ajuste se realizó presumiblemente en un único idioma no especificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base joamCriff123/zils-lite-l1121a no declara licencia en la información disponible, lo que puede condicionar la redistribución.
- Código personalizado: la etiqueta custom_code obliga a ejecutar código del autor al cargar el modelo, con el riesgo de seguridad asociado.
- Fecha de creación futura (2026-11-24): conviene verificar la procedencia y la integridad de los pesos antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-m24-mixed
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1121a
- Revisión del modelo base citada: 523d974dc031ecaf4efc3b7772b4611938f5e455
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
