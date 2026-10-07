# Snapkitty/hilbert-4b-baseline-GGUF

## Resumen

Hilbert 4B Baseline · GGUF es un conjunto de cuantizaciones en formato GGUF del modelo congelado Qwen/Qwen3.5-4B (revisión fijada `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), publicado por Snapkitty Collective LLC. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión a cuantización del checkpoint base de aproximadamente 4.326 millones de parámetros, orientada a servir como referencia congelada del denominado "modelo de decisión" que sustenta el sistema Hilbert.

La particularidad de este artefacto no es la generación de texto al uso, sino el enfoque de evaluación. Hilbert trata las cargas de trabajo de IA como decisiones tipadas: dado un estado, una pregunta y entre 2 y 16 opciones declaradas, el modelo devuelve una probabilidad para cada opción en un único forward pass. La model card publica métricas de "acuerdo de decisión" (decision agreement) frente a la referencia BF16 fila a fila, en lugar de benchmarks generativos convencionales.

Es relevante ahora porque documenta de forma explícita el impacto de la cuantización sobre la calidad de decisión: Q8_0 se comporta como prácticamente sin pérdida (99,31% de acuerdo en `authored144`), mientras que Q4_K_M mueve alrededor del 8% de las decisiones. Este baseline es el punto de referencia del futuro release podado y destilado de Hilbert 4B, aún no publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (cuantizacion del modelo base Qwen/Qwen3.5-4B; sin detalle arquitectonico en la informacion proporcionada) |
| Parametros totales | 4.326.350.848 (~4,33 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (8,51 bpw) y Q4_K_M (5,13 bpw) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.5-4B en los datos proporcionados. El artefacto descrito es una cuantizacion: se genero a partir de una unica conversion a BF16 utilizando las fuentes de llama.cpp incluidas en `llama-cpp-python==0.3.35`, en modo solo texto y sin matriz de importancia (importance matrix). Los pasos exactos de conversion se documentan en los ficheros `conversion-*.json` del repositorio.

El rasgo tecnico diferencial no esta en el entrenamiento sino en el metodo de evaluacion, denominado SemIf (decision-native). En lugar de medir perplejidad o tareas generativas, se puntua la "concordancia de decision" con la referencia BF16 fila por fila: para cada estado, pregunta y conjunto de opciones, se compara la decision tomada por la version cuantizada frente a la del modelo sin cuantizar. Las pruebas se ejecutaron en CPU con el backend de llama.cpp del propio repositorio sobre los conjuntos `authored144` y `perturbations108`, con prompts que coincidian exactamente con la ejecucion BF16 en todas las filas. No se indica si hubo RLHF, DPO u otras fases de alineamiento en el modelo base.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen/Qwen3.5-4B, utilizada como caso de uso secundario frente a la puntuacion de decisiones.
- Puntuacion de decisiones tipadas: dada una pregunta y entre 2 y 16 opciones declaradas, devuelve una probabilidad por opcion en un unico forward pass.
- Conversacion multiturno mediante interfaz de chat (`llama-cli -cnv` o `ollama run`).
- Ejecucion de inferencia en CPU y GPU a traves de llama.cpp y de llama-cpp-python.
- Carga directa desde el Hub mediante identificadores de cuantizacion (`:Q4_K_M`, `:Q8_0`).
- Verificacion de integridad de las descargas mediante sumas SHA-256 publicadas (`SHA256SUMS`).
- Idiomas: unicamente ingles declarado en la model card.

No se documenta soporte de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito ("thinking mode") en la informacion disponible.

## Casos de uso

- Puntuacion de decisiones en pipelines automatizados: el modelo devuelve una probabilidad por cada opcion declarada en un solo forward pass, lo que permite usarlo como modulo de decision en sistemas que necesitan elegir entre alternativas acotadas (2 a 16) con una puntuacion calibrada, en lugar de generar texto libre.
- Enrutado o clasificacion de intenciones: con opciones declaradas explicitamente, puede actuar como clasificador multiclase probabilista para dirigir peticiones hacia distintos servicios o agentes.
- Evaluacion de calidad de cuantizaciones: sirve como referencia congelada para medir cuanto degrada la cuantizacion las decisiones de un modelo, replicando la metodologia publicada (comparacion fila a fila contra BF16).
- Despliegue en hardware modesto: gracias a que Q4_K_M ocupa 2,78 GB y Q8_0 4,61 GB, puede ejecutarse en portatiles y equipos de sobremesa sin GPU dedicada mediante llama.cpp en CPU.
- Prototipado de sistemas de decision en local: el repositorio SemIf y la herramienta `semif-score` permiten puntuar ficheros JSONL de decisiones sin infraestructura en la nube.
- Chat y generacion de texto ligera: el modelo puede usarse como asistente conversacional en ingles mediante `ollama` o `llama-cli`, aunque este no es el caso de uso principal declarado.
- Reproducibilidad de experimentos: al publicarse las sumas SHA-256 y el modo exacto de conversion, es util para verificar resultados de investigacion que dependan de un checkpoint inmutable.

## Benchmarks y rendimiento

La model card no publica benchmarks generativos convencionales (MMLU, HumanEval, GSM8K, etc.). En su lugar se reportan metricas de concordancia de decision frente a la referencia BF16, evaluadas en CPU con el backend de llama.cpp del repositorio.

| Cuantizacion | Conjunto | Acuerdo con BF16 | Flips (cambios de decision) | Balanced accuracy | Delta vs BF16 (IC 95%) |
|---|---|---:|---:|---:|---|
| Q8_0 | authored144 | 99,31% | 1 / 144 | 80,67% | −0,65 pp [−2,22; 0,00] |
| Q8_0 | perturbations108 | 98,15% | 2 / 108 | 76,58% | −1,41 pp [−3,67; 0,00] |
| Q4_K_M | authored144 | 92,36% | 11 / 144 | 84,42% | +3,10 pp [+0,04; +6,60] |
| Q4_K_M | perturbations108 | 91,67% | 9 / 108 | 76,08% | −1,90 pp [−6,30; +2,99] |

Referencia BF16: 81,32% (`authored144`) y 77,99% (`perturbations108`). Segun el autor, Q8_0 es efectivamente sin perdida para decisiones, mientras que Q4_K_M mueve en torno al 8% de las decisiones y su mayor puntuacion en `authored144` se debe a cambios en filas borderline, no a una mejora real.

No se han publicado resultados de benchmarks generativos estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de los tamanos de fichero, Q8_0 (4,61 GB) requeriria aproximadamente 5-6 GB de VRAM al anadir el contexto y los buffers de inferencia; Q4_K_M (2,78 GB) rondaria los 3,5-4 GB. Son estimaciones derivadas del tamano del fichero, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Dado el tamano, cualquier GPU con 6 GB o mas de VRAM deberia poder alojar la variante Q4_K_M; para Q8_0 se recomienda un minimo de 8 GB.
- Compatible con GPU de consumo: si. Modelos como RTX 3060 (12 GB), RTX 4060, RTX 4070 o superiores pueden ejecutar ambas cuantizaciones. Las variantes mas pequenas tambien permiten ejecucion en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-cli -hf ...:Q4_K_M -cnv`), Ollama (`ollama run hf.co/Snapkitty/hilbert-4b-baseline-GGUF:Q4_K_M`), llama-cpp-python a traves del extra `.[llamacpp]` del repositorio SemIf, y la herramienta `semif-score` para puntuacion de decisiones.
- Latencia y throughput: no disponibles en la informacion proporcionada. Las evaluaciones se ejecutaron en CPU, pero no se publican cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---:|---|---|
| Snapkitty/hilbert-4b-baseline-GGUF | ~4,33 B | GGUF (Q8_0, Q4_K_M) | No disponible | Apache 2.0 | Referencia de decision cuantizada; evaluado por concordancia con BF16 |
| Qwen/Qwen3.5-4B (BF16) | ~4,33 B | BF16 (safetensors) | No disponible | Apache 2.0 | Modelo base sin cuantizar; referencia de las metricas de decision |
| Modelo podado y destilado de Hilbert 4B | No disponible | No disponible | No disponible | No disponible | Release futuro anunciado por el autor; no disponible aun |

No se dispone de datos de benchmarks comparables con otras alternativas de ~4B en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento generativo frente a otros modelos.

## Limitaciones y advertencias

- Idiomas: unicamente se declara soporte de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Ambito de uso: el artefacto esta disenado y evaluado como modelo de decision sobre opciones declaradas (2 a 16). Su uso como generador de texto generico no ha sido validado con benchmarks estandar.
- Efecto de la cuantizacion: Q4_K_M altera aproximadamente el 8% de las decisiones respecto a BF16 (11/144 y 9/108 flips). Para aplicaciones sensibles a la decision, se recomienda Q8_0, que resulta practicamente sin perdida.
- Ausencia de benchmarks generativos: no se publican resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible estimar su calidad en tareas de razonamiento, codigo o matematicas.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas con ventanas largas.
- Naturaleza de referencia: es un baseline congelado, no un modelo afinado para produccion. El autor indica que la version podada y destilada sera un release separado.
- Reproducibilidad: el modelo base esta fijado a una revision concreta; usar otra revision invalida las comparaciones de decision publicadas.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial, pero conviene citar tanto el modelo base Qwen3.5-4B como el metodo SemIf segun las indicaciones del autor.
- Riesgo de alucinacion: no evaluado ni documentado especificamente en la model card; al derivar de un modelo generativo, el riesgo persiste en los modos de chat.
- Descargas y adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/hilbert-4b-baseline-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del metodo SemIf (codigo, benchmarks y evidencia a nivel de fila): https://github.com/SNAPKITTYAGENT9NOVA/SemIf-OpenJev
