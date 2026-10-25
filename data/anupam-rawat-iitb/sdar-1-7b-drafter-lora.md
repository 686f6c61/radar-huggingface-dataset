# Anupam-Rawat-IITB/SDAR-1.7B-drafter-LoRA

## Resumen

SDAR-1.7B-drafter-LoRA es un modelo *drafter* (borrador) de 2,03 mil millones de parámetros, publicado por Anupam Rawat y Arush (cuenta `Anupam-Rawat-IITB`) como un LoRA fusionado en un checkpoint completo en bf16 sobre la base `JetLM/SDAR-1.7B-Chat-b32`. Su función no es conversar de forma autónoma, sino generar tokens candidatos para el modelo grande `JetLM/SDAR-30B-A3B-Chat-b32`, un MoE de difusión por bloques de 30 B de parámetros totales y 3 B activos. El drafter se entrena para imitar el estilo del 30B, de forma que el *judge* del sistema (`Anupam-Rawat-IITB/SDAR-30B-judge-LoRA`) rechace menos propuestas y hagan falta menos re-borrados.

El problema que aborda es el coste de la decodificación especulativa en modelos de difusión por bloques: si el drafter se desvía del modelo objetivo, el juez rechaza y el trabajo se desperdicia. Con un ajuste fino sobre 331.818 ítems —respuestas ya verificadas del propio 30B— el sistema reduce un 7,6 % los *forwards* del drafter por bloque y logra una aceleración *wall-clock* de 1,25× frente al 30B original, manteniendo la precisión en el entorno del 64,5 % (frente al 65,5 % del 30B sin asistencia).

Es relevante ahora porque documenta, con código y resultados reproducibles, una receta completa de *drafting* especulativo para arquitecturas de difusión por bloques, un terreno donde la mayoría de las técnicas de *speculative decoding* pensadas para transformers autorregresivos no se aplican directamente. La licencia Apache-2.0 y la disponibilidad del adaptador LoRA sin fusionar (34,9 M de parámetros) facilitan su reutilización e inspección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión por bloques (block-diffusion), 28 capas, con código de modelado propio (`modeling_sdar.py`) |
| Parámetros totales | 2.031.739.904 (≈2,03 B), según safetensors |
| Parámetros activos | no aplica: el drafter no se describe como MoE; el componente A3B (3 B activos) corresponde al modelo objetivo SDAR-30B-A3B |
| Parámetros entrenables del LoRA | 34.865.152 (rango 32, alpha 64, sobre q, k, v, o, gate, up y down de las 28 capas) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio publica pesos en bf16 sin cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 4,1 GB) en la raíz; adaptador LoRA PEFT en `training/final_adapter/`; checkpoint de entrenador con estado del optimizador en `training/ckpt/` |
| Modelo base | JetLM/SDAR-1.7B-Chat-b32 |
| Modelo objetivo | JetLM/SDAR-30B-A3B-Chat-b32 |
| Dataset de entrenamiento | Anupam-Rawat-IITB/sdar30b-draft-judge-data |
| Tamaño del repositorio | 8,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del SDAR-1.7B-Chat-b32: un transformer de difusión por bloques que rellena posiciones abiertas de un bloque de tokens en paralelo, en lugar de generar token a token de forma estrictamente autorregresiva. El ajuste se aplica con un LoRA de rango 32 y alpha 64 sobre las proyecciones de atención (q, k, v, o) y las de la MLP (gate, up, down) de las 28 capas, con 34.865.152 parámetros entrenables, que se fusionan en el checkpoint final en bf16. El repositorio incluye el código de modelado (`modeling_sdar.py`) y requiere `trust_remote_code=True` al cargar con `AutoModelForCausalLM`.

El entrenamiento consiste en una sola pasada sobre las oleadas A y B del corpus, 331.818 ítems que son respuestas del propio SDAR-30B ya verificadas por el juez. La mezcla es un 40 % de estados de primer borrador y un 60 % de estados de re-borrado, con tasa de aprendizaje 8e-5. La función de pérdida combina entropía cruzada hacia el token elegido por el 30B en cada posición abierta, más 0,1 × divergencia KL hacia el drafter original en aquellas posiciones donde el drafter de partida ya acertaba, lo que preserva el conocimiento previo y evita el colapso hacia el estilo del 30B en los casos fáciles. El sistema se acompaña de un cambio en tiempo de decodificación, `--redraft-ban-rejected`, que impide volver a proponer un token que el juez acaba de rechazar.

## Capacidades

- Generación de texto en modo borrador: produce tokens candidatos para que el SDAR-30B-A3B los valide, no para uso conversacional directo.
- Rellenado de bloques en paralelo, propio de la difusión por bloques, con soporte de estados de primer borrador y de re-borrado.
- Decodificación especulativa asistida por juez: el par drafter + `SDAR-30B-judge-LoRA` decide qué propuestas se aceptan.
- Reducción del número de *forwards* del drafter por bloque gracias al ajuste hacia la distribución del 30B.
- Compatibilidad con el *harness* estándar de HuggingFace (`AutoModelForCausalLM` con código remoto) y con el script `run_da_decode.py --drafter <dir>`.
- Capacidad conversacional: el tag `conversational` aparece en el modelo base, pero el ajuste LoRA está orientado a *drafting*, no a mejorar el diálogo autónomo.
- Soporte de *tool calling*, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se documentan idiomas.

## Casos de uso

- Aceleración de inferencia del SDAR-30B-A3B en producción: desplegar este drafter junto al modelo de 30 B y el juez para obtener una mejora *wall-clock* de 1,25× por respuesta, con un coste de precisión de aproximadamente un punto porcentual (64,5 % frente a 65,5 %).
- Reducción de coste de GPU en *serving* conversacional: al necesitar menos *forwards* del drafter por bloque (−7,6 % en rd1), baja la presión sobre el acelerador en cargas de muchas peticiones concurrentes.
- Investigación en decodificación especulativa para modelos de difusión: el repositorio permite reproducir las fases completas (`phase4-rd1`) con registro por paso, lo que sirve para comparar estrategias de re-borrado rd1 frente a rd2.
- Ajuste de la política de re-borrado: el flag `--redraft-ban-rejected` y las métricas de aceptación por benchmark permiten estudiar el equilibrio entre velocidad y precisión en cada tarea.
- Destilación de estilo de un modelo mayor: la receta (entropía cruzada hacia el token del 30B más KL de anclaje al drafter original) es reutilizable para alinear otros drafters pequeños con modelos objetivo propios.
- Evaluación comparativa de sistemas especulativos: sirve como línea base frente al drafter SDAR-1.7B estándar (fase 3) en suites de 2.250 preguntas y 7 benchmarks.
- Entrenamiento continuado: el checkpoint de entrenador con estado del optimizador en `training/ckpt/` permite reanudar el ajuste con nuevos datos sin partir de cero.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 2.250 preguntas y 7 benchmarks, con el juez activo, *harness* estándar de HuggingFace y una sola máquina:

| Métrica | rd1 | rd2 |
|---|---|---|
| Velocidad frente al 30B sin asistencia (wall-clock por respuesta) | 1,25× [1,23; 1,27] | 1,26× [1,24; 1,28] |
| Velocidad frente al drafter SDAR-1.7B estándar (fase 3) | 1,04× | 1,00× |
| Forwards del drafter por bloque frente al drafter estándar | −7,6 % | −5,3 % |
| Precisión: 30B sin asistencia / drafter estándar / este drafter | 65,5 / 64,4 / 64,5 | 65,5 / 64,9 / 64,2 |

| Benchmark específico | rd1 | rd2 | 30B sin asistencia |
|---|---|---|---|
| IFEval | 46,2 % | 46,0 % | 52,7 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 4,1 GB en bf16, según el tamaño del archivo `model.safetensors` del repositorio.
- VRAM total estimada en inferencia: en torno a 5-6 GB en bf16 sumando caché de activaciones y del juez de decodificación, sin datos oficiales publicados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, 3070, 4060 Ti, 4070, 4080, 4090) y en 3090 o 4090 sin necesidad de cuantización.
- GPU de centro de datos: A100, H100 o L40S para despliegues con muchas peticiones concurrentes junto al SDAR-30B-A3B, que es el que domina el consumo real de memoria.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, el script `run_da_decode.py --drafter <dir>` del repositorio, y el *harness* propio del proyecto `sdar30b-draft-judge`.
- vLLM, llama.cpp, Ollama o TGI: no disponible; no se documenta soporte y el código de modelado personalizado complica su integración directa.
- Latencia y throughput: la única cifra publicada es la aceleración relativa de 1,25× en *wall-clock* por respuesta frente al 30B sin asistencia; no se publican tokens por segundo absolutos.
- Almacenamiento: 4,1 GB para el checkpoint fusionado; 8,4 GB si se descarga el repositorio completo con checkpoints de entrenamiento (se puede excluir con `--exclude "training/*"`).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Función | Precisión (media 7 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SDAR-1.7B-drafter-LoRA (este) | 2,03 B | no aplica | no disponible | Drafter para SDAR-30B-A3B | 64,5 % (rd1) / 64,2 % (rd2) | Apache-2.0 | HuggingFace, pesos bf16 + LoRA |
| SDAR-1.7B drafter estándar (fase 3) | ≈1,7 B | no aplica | no disponible | Drafter para SDAR-30B-A3B | 64,4 % (rd1) / 64,9 % (rd2) | Apache-2.0 | Uso interno del proyecto, referencia en el repositorio |
| JetLM/SDAR-1.7B-Chat-b32 (base) | ≈1,7 B | no aplica | no disponible | Modelo conversacional de difusión por bloques | no disponible | Apache-2.0 | HuggingFace |
| JetLM/SDAR-30B-A3B-Chat-b32 (objetivo) | 30 B | 3 B | no disponible | Modelo generativo MoE de difusión por bloques | 65,5 % (sin asistencia) | no disponible | HuggingFace |

## Limitaciones y advertencias

- Es exclusivamente un drafter: por sí solo es un modelo de 1,7 B sesgado hacia el estilo del 30B, no un modelo conversacional autónomo mejor que su base.
- Caída notable en IFEval: 46,2 % (rd1) y 46,0 % (rd2) frente al 52,7 % del 30B sin asistencia, con aparición de bucles de repetición en ese tipo de tareas.
- Pérdida de precisión global de aproximadamente un punto porcentual frente al 30B sin asistencia (64,5 % frente a 65,5 %), que puede no compensar en cargas donde la exactitud sea crítica.
- La ganancia de velocidad es modesta (1,25×) y se midió en una sola máquina con el *harness* estándar de HuggingFace; no hay datos con otros *runtimes* ni con lotes grandes.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; no hay evaluación de seguridad ni de robustez frente a entradas adversarias.
- Requiere `trust_remote_code=True` y ejecuta código de modelado propio (`modeling_sdar.py`), lo que implica revisión de seguridad antes de desplegarlo en producción.
- Depende de un ecosistema concreto: el juez `SDAR-30B-judge-LoRA` y el repositorio `sdar30b-draft-judge`; fuera de ese conjunto de herramientas su utilidad es limitada.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ), lo que dificulta su uso en entornos con poca VRAM o con motores de inferencia optimizados.
- Licencia Apache-2.0, permisiva para uso comercial, aunque conviene verificar las condiciones del modelo base y del modelo objetivo de 30 B, cuya licencia no se detalla en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anupam-Rawat-IITB/SDAR-1.7B-drafter-LoRA
- Modelo base: https://huggingface.co/JetLM/SDAR-1.7B-Chat-b32
- Juez del sistema: https://huggingface.co/Anupam-Rawat-IITB/SDAR-30B-judge-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/Anupam-Rawat-IITB/sdar30b-draft-judge-data
- Repositorio del proyecto: https://github.com/NoviceCoderInfinity/sdar30b-draft-judge
- Resultados completos por benchmark: https://github.com/NoviceCoderInfinity/sdar30b-draft-judge/blob/main/RESULTS.md
- Script de reproducción: https://raw.githubusercontent.com/NoviceCoderInfinity/sdar30b-draft-judge/main/get.sh
- Adaptador LoRA original consolidado: https://huggingface.co/Arushhh/phase4-drafter-lora

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información del repositorio en HuggingFace.
