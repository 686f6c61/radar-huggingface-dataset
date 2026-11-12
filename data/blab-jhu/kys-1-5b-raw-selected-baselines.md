# blab-jhu/KYS-1.5B-Raw-Selected-Baselines

## Resumen

KYS-1.5B-Raw-Selected-Baselines es un checkpoint de generación de texto publicado en Hugging Face por el usuario blab-jhu (aparentemente vinculado a la Johns Hopkins University, a juzgar por el sufijo "jhu" del identificador). El nombre indica un modelo de aproximadamente 1.500 millones de parámetros (1.5B) en su variante "Raw", acompañado de "Selected-Baselines", lo que sugiere que se trata de un artefacto de investigación que empaqueta el modelo base junto con una selección de resultados o configuraciones de referencia (baselines) para comparación experimental.

El repositorio tiene un tamaño de 433,2 GB, un volumen muy superior al que correspondería a los pesos de un modelo de 1.5B en precisión completa (del orden de 3 GB en fp16). Esto apunta a que el repositorio contiene múltiples checkpoints, estados de optimizador, datasets de evaluación o salidas intermedias acumuladas durante un proceso de investigación, más que un único conjunto de pesos limpio para inferencia.

Se trata de un modelo claramente orientado a investigación interna y no a producción: cuenta con cero descargas y cero likes, tiene el acceso restringido (gated) y no declara licencia, idiomas ni documentación técnica. La fecha de creación indicada (2026) resulta anómala y debe interpretarse con cautela hasta verificar los metadatos reales en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere un transformer decoder-only de ~1.5B parámetros) |
| Parametros totales | ~1.5B (deducido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

Otros datos técnicos: pipeline declarado `text-generation`, librería `transformers`, tags adicionales `endpoints_compatible` y `region:us`. Tamaño del repositorio: 433,2 GB. Acceso restringido (gated).

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la información disponible. El identificador del modelo apunta a un transformer decoder-only de aproximadamente 1.500 millones de parámetros en una variante etiquetada como "Raw", término que en la práctica investigadora suele designar un modelo base sin ajuste fino de alineamiento (sin RLHF ni DPO) o un checkpoint intermedio de preentrenamiento. El sufijo "Selected-Baselines" indica que el repositorio incluye, además del modelo, un conjunto de referencias comparativas seleccionadas para experimentos.

No hay datos sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, mezcla de expertos). El tamaño desproporcionado del repositorio (433,2 GB) sugiere la presencia de artefactos auxiliares —checkpoints múltiples, estados de optimizador o predicciones de evaluación— que no forman parte del modelo en sí.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado (`text-generation`).
- Compatibilidad con el ecosistema `transformers` y con endpoints de inferencia (tag `endpoints_compatible`).
- Carga de pesos en formato safetensors.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta capacidad multilingüe declarada.
- No consta modo de razonamiento (thinking), visión ni audio.
- Al tratarse presumiblemente de un checkpoint "Raw" sin alineamiento, no cabe esperar un comportamiento de instrucciones fiable sin ajuste posterior.

## Casos de uso

- Investigación sobre modelos base de ~1.5B: el checkpoint sirve como punto de partida para estudiar el comportamiento de un modelo sin alineamiento en tareas controladas de generación, con la ventaja de que su tamaño permite iterar rápidamente en una sola GPU.
- Reproducción de experimentos con baselines: el nombre "Selected-Baselines" indica que el repositorio está pensado para comparar el modelo contra referencias seleccionadas; se usaría como artefacto de reproducibilidad en un artículo o tesis.
- Ajuste fino supervisado (SFT) como paso previo a la alineación: un modelo "Raw" de 1.5B es un sustrato habitual para experimentos de instrucción con LoRA/QLoRA en hardware de consumo.
- Evaluación comparativa de metodologías: útil para medir el efecto de distintas recetas de entrenamiento o de selección de datos sobre un mismo modelo base.
- Destilación y estudio de dinámicas de entrenamiento: el volumen del repositorio sugiere la presencia de checkpoints intermedios, aprovechables para analizar la evolución de las representaciones a lo largo del entrenamiento.
- Docencia y prácticas de NLP: un modelo de 1.5B con acceso controlado permite montar ejercicios de generación de texto y evaluación sin depender de infraestructura de gran escala.
- No se recomienda su uso en producción, atención al cliente ni generación de código en pipelines reales, dado que no hay model card, licencia ni evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de un modelo de ~1.5B: en torno a 3 GB en fp16, 1,5-2 GB en int8 y 1-1,2 GB en cuantización de 4 bits (estimación teórica según el recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 6 GB o más de VRAM, incluso con cuantización de 4 bits.
- Opciones de despliegue: `transformers` de forma nativa (librería declarada); llama.cpp, Ollama, vLLM o TGI serían viables si los pesos se convierten a GGUF o se sirven en formato compatible, aunque no hay confirmación de que la estructura del checkpoint lo permita sin intervención manual.
- Latencia y throughput: no disponibles.
- Advertencia: el repositorio completo ocupa 433,2 GB, por lo que conviene descargar selectivamente los ficheros de pesos necesarios y no el repositorio entero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KYS-1.5B-Raw-Selected-Baselines | ~1.5B | no disponible | no disponible | Gated, cero descargas |
| Qwen2.5-1.5B | 1.5B | 32.768 tokens (variante base) | Apache 2.0 (variantes habituales) | Pública |
| SmolLM2-1.7B | 1.7B | 8.192 tokens | Apache 2.0 | Pública |
| Gemma 2 2B | 2.6B | 8.192 tokens | Términos de uso de Gemma | Pública con aceptación |

La comparación con estos modelos es únicamente orientativa por categoría de tamaño: no hay datos de rendimiento del modelo analizado que permitan una comparación cuantitativa. Frente a las alternativas, la diferencia principal es la ausencia de licencia, documentación y evaluación publicadas, así como el acceso restringido.

## Limitaciones y advertencias

- Licencia no disponible: no puede determinarse si se permite el uso comercial; debe tratarse como no apto para producción hasta aclararlo con el autor.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia de model card sustantiva: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación.
- Al ser presumiblemente un modelo "Raw", es probable que no siga instrucciones de forma fiable y que requiera ajuste fino antes de cualquier uso conversacional.
- Riesgo de alucinación y de generación de contenido sesgado o inapropiado, sin filtros de alineación documentados.
- Sin datos sobre longitud de contexto ni idiomas soportados; no debe asumirse un rendimiento multilingüe.
- Tamaño del repositorio de 433,2 GB: riesgo de consumo de almacenamiento y de tiempos de descarga elevados si no se seleccionan ficheros concretos.
- Fechas de creación y actualización anómalas (2026) en los metadatos: conviene verificar la integridad y el origen real de los artefactos antes de usarlos.
- Cero descargas y cero likes: no hay evidencia comunitaria de funcionamiento correcto del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/blab-jhu/KYS-1.5B-Raw-Selected-Baselines
- No se han encontrado otros enlaces (paper, blog, repositorio o demo) en la información proporcionada.
