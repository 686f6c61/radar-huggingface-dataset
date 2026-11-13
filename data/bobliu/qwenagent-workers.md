# Bobliu/qwenagent-workers

## Resumen

qwenagent-workers es un conjunto de checkpoints de investigación publicados por Bobliu que implementan módulos "worker" entrenables inyectados en un Qwen3-0.6B congelado a la salida de la capa 12. Cada fichero contiene únicamente los parámetros de los workers (aproximadamente 1,8 MB por checkpoint), no los pesos del modelo base, que deben cargarse por separado desde Qwen/Qwen3-0.6B. El objetivo del experimento es evaluar si estados recurrentes privados por "subagente" (slots GRU con un router aprendido) aportan ventajas frente a un adaptador sin estado o un único estado compartido en tareas de razonamiento sobre programas con registros intercalados.

El artefacto se enmarca en la línea de investigación sobre interpretabilidad y arquitecturas recurrentes aplicadas a modelos transformer congelados. La tarea evaluada es una consulta sobre programas de registros (P registros, nombres aleatorios, entrenamiento con 2-3 registros) donde el modelo debe localizar el valor correcto. Se comparan cinco variantes: adapter (MLP por token sin estado), single (un único estado GRU persistente), uniform (K estados privados sin routing), multi (K=4 estados con router aprendido) y oracle (K estados con router sustituido por los identificadores reales de registro).

El resultado es mayoritariamente negativo: según el autor, a lo largo de 5 semillas los slots privados no superan ni al adaptador sin estado ni al estado único compartido, y la variante con slots es menos estable entre semillas. Se trata, por tanto, de un artefacto de investigación y no de un modelo destinado a despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulos worker (MLP sin estado o slots GRU con router) inyectados en Qwen3-0.6B congelado a la salida de la capa 12 |
| Parametros totales | Aproximadamente 1,8 MB por checkpoint (solo parámetros de los workers); el modelo base Qwen3-0.6B se carga aparte |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-0.6B; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (licencia del modelo base; el repositorio de GitHub no declara licencia separada) |
| Formato de pesos | PyTorch (`.pt` con diccionario `{"state": state_dict, "args": training args}`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer congelado durante todo el experimento. Sobre él se inyecta un hook a la salida de la capa 12 que conecta con los módulos worker. Se comparan cinco configuraciones: un adaptador MLP por token sin estado (parameter-matched), un único estado GRU persistente, K estados privados actualizados por cada token sin routing (uniform), K=4 estados privados con un router aprendido (multi) y una variante oracle en la que el router se sustituye por los identificadores reales de registro. La configuración multi incorpora además un canal de retorno y gating de ocupación.

El entrenamiento se realizó sobre la tarea `q7`: consultas sobre programas de registros intercalados, con nombres de registro aleatorios y entrenamiento limitado a 2-3 registros, durante 8000 pasos, con K=4 y capa 12. Los checkpoints publicados corresponden a la semilla 0. El autor indica que los resultados se replicaron sobre 5 semillas en el repositorio de GitHub, donde los slots privados no superan a las alternativas sin estado o con estado único, y además muestran menor estabilidad entre semillas. No se especifica el volumen de tokens de entrenamiento ni la composición completa del dataset más allá del generador de tareas.

## Capacidades

- No es un modelo de propósito general: los checkpoints implementan exclusivamente la tarea de consulta sobre programas de registros intercalados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del experimento de "subagentes" con slots privados, que constituye precisamente la hipótesis evaluada.
- No se documentan capacidades multilingües específicas; dependen del modelo base Qwen3-0.6B.
- No se documentan modos de pensamiento, visión ni audio.
- El artefacto sirve como material reproducible para estudiar routing, estados recurrentes privados e interpretabilidad en modelos congelados.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: cargar los checkpoints con `eval_ckpt.py` para inspeccionar cómo se comportan los slots GRU y el router en la tarea `q7`, comparando con las variantes adapter y single.
- Estudio de resultados negativos: utilizar los cinco checkpoints como referencia para analizar por qué los estados privados con routing no superan a un adaptador sin estado en esta tarea concreta.
- Investigación sobre routing aprendido: examinar el checkpoint `q7_multi_s0.pt` y su router para estudiar la asignación de tokens a slots y el efecto del gating de ocupación.
- Docencia y formación: emplear el repositorio y los checkpoints como ejemplo práctico de inyección de módulos entrenables en un transformer congelado mediante hooks.
- Validación de infraestructura de evaluación: usar `eval_ckpt.py` como plantilla para pipelines que recargan un modelo base desde Hugging Face y aplican adaptadores externos.
- Análisis de estabilidad entre semillas: combinar los resultados de las 5 semillas del repositorio de GitHub con estos checkpoints de la semilla 0 para estudiar la varianza del entrenamiento.

## Benchmarks y rendimiento

Resultados de exactitud (%) de los checkpoints publicados (semilla 0, 200 programas por tamaño, azar 10 %):

| Modo | P=2 | P=3 | P=4 | P=6 | P=8 | P=12 | P=16 |
|---|---|---|---|---|---|---|---|
| adapter | 60,5 | 59,0 | 49,5 | 47,5 | 41,0 | 33,5 | 27,5 |
| single | 61,0 | 58,5 | 55,5 | 46,0 | 41,0 | 39,0 | 25,0 |
| uniform | 57,0 | 55,5 | 54,5 | 24,0 | 12,5 | 11,0 | 10,0 |
| multi | 53,5 | 51,0 | 53,5 | 43,5 | 38,0 | 33,5 | 26,5 |
| oracle | 48,0 | 48,5 | 41,5 | 27,0 | 13,5 | 11,0 | 12,5 |

El autor señala que, sobre 5 semillas, los slots privados no superan al adaptador sin estado ni al estado único compartido, y que la variante con slots es menos estable. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es Qwen3-0.6B, por lo que la inferencia requiere la memoria correspondiente a ese modelo más los aproximadamente 1,8 MB de los workers.
- GPU recomendadas: no especificadas; el entrenamiento requiere una GPU CUDA según la model card.
- GPU de consumo: no confirmado en la información; por el tamaño del modelo base (0,6B) es plausible que quepa en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: el flujo documentado usa `torch` y `transformers` con `eval_ckpt.py`, que reconstruye el modelo y el hook de la capa 12 desde `train.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwenagent-workers (este) | ~1,8 MB de workers sobre Qwen3-0.6B congelado | No disponible | Slots recurrentes con routing sobre transformer congelado | Apache-2.0 | Hugging Face y GitHub |
| Qwen3-0.6B (base) | 0,6B | No disponible en la información | Transformer denso de propósito general | Apache-2.0 | Hugging Face |
| Adaptador sin estado (variante interna) | Parameter-matched | No disponible | MLP por token sin estado | Apache-2.0 | Incluido en este repositorio |

No se dispone de información sobre otros modelos comparables de la misma categoría (investigación sobre routing y estados recurrentes en transformers congelados) en la documentación proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación con resultado mayoritariamente negativo: no está pensado para despliegue en producción.
- No contiene los pesos del modelo base; requiere descargar Qwen/Qwen3-0.6B por separado.
- Los checkpoints publicados corresponden a una única semilla (semilla 0); el autor indica menor estabilidad entre semillas para la variante con slots.
- Rendimiento limitado a una tarea sintética concreta (consultas sobre programas de registros); no generaliza a otras tareas sin reentrenamiento.
- El repositorio de GitHub no declara una licencia separada; la licencia Apache-2.0 mostrada corresponde al modelo base.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas más allá de las inherentes al modelo base.
- No se documenta soporte para herramientas de despliegue estándar (vLLM, TGI, llama.cpp), lo que limita su uso fuera del script de evaluación proporcionado.

## Enlaces

- Hugging Face: https://huggingface.co/Bobliu/qwenagent-workers
- Repositorio GitHub (código, generador de tareas, resultados y vídeo explicativo): https://github.com/Bobliuuu/qwenagent
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
