# chiffonng/incidentbench-smoke

## Resumen

incidentbench-smoke es un adaptador LoRA de rango 16 desarrollado por el usuario chiffonng sobre el modelo base Qwen2.5-7B-Instruct. Su propósito es actuar como clasificador conjunto dentro de IncidentBench, un banco de evaluación orientado a la detección y categorización de incidentes en siete dominios de riesgo definidos por el MIT. El adaptador produce una única respuesta que codifica simultáneamente la detección (si existe incidente o solo potencial) y la categoría de riesgo, simplificando la arquitectura de inferencia a una sola pasada de generación.

El modelo se enmarca en un experimento de ablación concreto: evaluar si la inclusión de un campo ordinal de etapa del incidente (no_event, potential, near_miss, disputed, alleged, incident, más dos valores fuera de escala) mejora o perjudica la detección y la clasificación. Se trata, por tanto, de un artefacto de investigación y no de un modelo listo para producción. Las etiquetas de entrenamiento son generadas por modelo (etiquetas "silver") bajo una guía de anotación del proyecto, no anotaciones humanas gold.

Con apenas 0,2 GB de repositorio, 14 descargas y ninguna valoración, es un adaptador de nicho con fecha de creación en octubre de 2026. Su relevancia es metodológica: documenta un enfoque de clasificación unificada mediante LoRA sobre un modelo instruct de 7B, con instrucciones explícitas de despliegue mediante vLLM y decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA sobre modelo base de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT, aplicado sin fusionar sobre el modelo base) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El adaptador se aplica sin fusionar (unmerged) sobre el modelo base, tal como se indica que ocurre en todas las ejecuciones reportadas del proyecto. La pila de entrenamiento empleada fue transformers 5.9.0 y peft 0.19.1.

El entrenamiento se realizó sobre etiquetas generadas por modelo ("silver") siguiendo la guía de anotación del proyecto IncidentBench, no sobre anotaciones humanas. El brazo experimental concreto responde a la pregunta de si un campo ordinal de etapa del incidente (no_event < potential < near_miss < disputed < alleged < incident, más dos valores fuera de escala) previo a la clase mejora o empeora la detección y la categorización. Los detalles de formato de prompt, filas de entrenamiento y hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación conjunta de detección y categoría de incidente en siete dominios de riesgo del MIT, con salida unificada en una sola respuesta.
- Distinción entre incidente confirmado y "No incident (potential only)".
- Manejo de un campo ordinal de etapa del incidente con seis niveles más dos valores fuera de escala.
- Generación de texto instructiva heredada del modelo base Qwen2.5-7B-Instruct.
- Despliegue como módulo LoRA servido mediante vLLM con `--enable-lora --max-lora-rank 16`.
- Inferencia con decodificación greedy según la receta indicada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas para este adaptador.

## Casos de uso

- Investigación en clasificación de incidentes: el adaptador sirve como brazo de ablación para medir el efecto del campo ordinal de etapa sobre la detección y categorización en IncidentBench, comparándolo con otras variantes del proyecto.
- Reproducción de experimentos: los manifiestos `data_manifest.json` y `train_manifest.json` permiten reconstruir el pipeline de datos y la receta de entrenamiento para validar resultados publicados.
- Evaluación de etiquetas silver: permite estudiar cómo se comporta un clasificador entrenado con anotaciones generadas por modelo frente a las guías de anotación del proyecto.
- Prototipado de pipelines de análisis de riesgo: sirve para probar la integración de un clasificador unificado de detección y categoría en una sola pasada de generación antes de invertir en datos gold.
- Docencia y estudio de PEFT: al ser un LoRA de rango 16 sobre un modelo de 7B con instrucciones de despliegue claras en vLLM, es útil como ejemplo didáctico de adaptación eficiente de parámetros.
- Análisis de modos de fallo: el propio autor documenta que el modelo infravalora incidentes (under-calls), lo que lo convierte en objeto de estudio para caracterizar sesgos de clasificación en dominios de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,2 GB, pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo para inferencia.
- VRAM estimada para el modelo base en precisión nativa (BF16/FP16): en torno a 14-16 GB solo para pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue con vLLM y concurrencia; RTX 4090 (24 GB) viable en BF16 para uso individual.
- En GPUs consumer de 24 GB o menos puede requerir cuantización del modelo base, aunque no se documentan recetas de cuantización específicas para este adaptador.
- Despliegue indicado por el autor: `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules smoke=chiffonng/incidentbench-smoke`.
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-smoke | LoRA r=16 sobre 7B | no disponible | Clasificador de incidentes (adaptador de investigación) | other | Hugging Face, 14 descargas |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en esta ficha | Modelo instruct generalista | no disponible en esta ficha | Hugging Face |
| Otros brazos de IncidentBench | no disponible | no disponible | Variantes de ablación del mismo proyecto | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no debe usarse para decisiones sobre sistemas reales.
- Etiquetas de entrenamiento "silver" generadas por modelo, no anotaciones humanas gold, lo que introduce ruido y sesgos del anotador automático.
- Modo de fallo documentado: el modelo infravalora incidentes (under-calls), es decir, tiende a no detectar incidentes que sí existen.
- Licencia "other": es necesario revisar los términos concretos antes de cualquier uso comercial; no se especifican en la información disponible.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada para este adaptador (depende del modelo base).
- El adaptador debe aplicarse sin fusionar y con decodificación greedy según la receta del autor; desviarse de ella puede alterar los resultados reportados.
- Sin pipeline declarado, sin likes y con muy pocas descargas: baja validación comunitaria.
- Riesgo de alucinación inherente al modelo base Qwen2.5-7B-Instruct, no evaluado específicamente para esta tarea.

## Enlaces

- [Hugging Face: chiffonng/incidentbench-smoke](https://huggingface.co/chiffonng/incidentbench-smoke)
- [Modelo base: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos del proyecto IncidentBench.
