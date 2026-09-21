# MingZwhy/Qwen3-4B-W2.79-QAD

## Resumen

Qwen3-4B-W2.79-QAD es un checkpoint intermedio publicado por el usuario MingZwhy dentro del proyecto QAOPD (quantization-aware on-policy distillation). No es un modelo listo para producir inferencia: se trata del punto de partida de la fase de destilación on-policy (OPD) para la variante de cuantización W2.79. Los tensores almacenados están en bf16 y **no** están cuantizados, porque el entrenamiento con reconocimiento de cuantización (QAT/QAD) conserva copias maestras de alta precisión y aplica el cuantizador dentro del forward pass; lo que se serializa es esa copia maestra.

El modelo se apoya en Qwen/Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parámetros de la familia Qwen3, con licencia Apache-2.0 heredada. El repo ocupa 8,1 GB, coherente con pesos maestros en bf16 de un modelo de ese tamaño. El objetivo del checkpoint es servir como `STUDENT_MODEL` en la etapa OPD, que es la que aporta la configuración del cuantizador; el resultado evaluable de ese proceso se publica por separado como MingZwhy/Qwen3-4B-W2.79-QAOPD.

La relevancia de esta ficha es acotada pero clara: interesa a quien quiera reproducir o auditar el pipeline QAOPD, estudiar esquemas de cuantización por debajo de 3 bits efectivos (INT1.58/INT4 mixto en bloques de 256) o arrancar experimentos de destilación sobre un estudiante de 4B. No tiene descargas ni valoraciones, y su model card advierte explícitamente de que cargarlo directamente devuelve un modelo sin cuantizar que puntuará mejor que el modelo W2.79 final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B); implementación de cuantización por bloques con cuantizador en el forward pass |
| Parametros totales | 4B aproximadamente según el modelo base; los metadatos de safetensors del repo indican 196.096 (dato inconsistente con el tamaño del repo, ver advertencias) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen3-4B, no declarada en la model card) |
| Tipos de cuantizacion | Esquema objetivo W2.79: pesos mixtos INT1.58/INT4 en bloques de 256, con el 50% de los bloques en INT4, lo que da 2,79 bits efectivos; embedding y output head en INT4; activaciones en INT8; KV cache en 16 bits durante OPD y evaluación. Este checkpoint en concreto se almacena en bf16 sin cuantizar |
| Idiomas soportados | No disponible (no declarado; el modelo base Qwen3-4B es multilingüe, pero la model card no especifica idiomas) |
| Licencia | Apache-2.0, heredada de Qwen3-4B |
| Formato de pesos | Safetensors (bf16, sin cuantizar) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer denso decoder-only con atención por consultas agrupadas (GQA). Sobre esa base, el proyecto QAOPD introduce un cuantizador diferenciable que se aplica dentro del forward pass mientras los pesos maestros permanecen en bf16. El esquema de cuantización objetivo combina precisión mixta: bloques de 256 pesos asignados a INT1.58 o INT4, con una proporción del 50% de bloques en INT4, resultando en una media de 2,79 bits por peso. Las matrices de embedding y la cabeza de salida se mantienen en INT4 y las activaciones se cuantizan a INT8.

Este checkpoint corresponde al punto de partida de la fase de destilación on-policy (OPD) del pipeline QAD → OPD. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; el README únicamente indica que el checkpoint debe usarse como `STUDENT_MODEL` en el script `scripts/opd/run_math.sh` con `BITWIDTH=w2.79`, y que la configuración del cuantizador la aporta esa etapa, no el checkpoint. La innovación técnica destacable es precisamente el flujo de trabajo: separar las copias maestras de alta precisión del artefacto cuantizado final, de modo que el checkpoint intermedio no debe evaluarse como si fuera el modelo desplegable.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base Qwen3-4B, ya que el checkpoint es una copia en bf16 de las mismas matrices.
- Razonamiento y matemáticas: el pipeline QAOPD se ejecuta sobre el script de matemáticas (`run_math.sh`), lo que indica que el dominio de entrenamiento y evaluación principal es el razonamiento matemático, aunque la model card no publica métricas.
- Modo de razonamiento (thinking) y modo directo (non-thinking): capacidad heredada del modelo base; no confirmada explícitamente en la documentación de este checkpoint.
- Tool calling y function calling: capacidad heredada del modelo base; no documentada ni verificada en esta ficha.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Capacidades multilingües: no documentadas para este checkpoint; los idiomas aparecen como "no disponibles".
- Capacidad especial: cuantización mixta sub-3 bits con cuantizador en el forward pass, orientada a reducir el coste de memoria del estudiante antes de la destilación on-policy.
- Capacidad operativa como checkpoint de entrenamiento: solo puede ejecutarse de forma significativa dentro del pipeline QAOPD, que inyecta la configuración del cuantizador.

## Casos de uso

- Reproducción del pipeline QAOPD: cargar este checkpoint como `STUDENT_MODEL` con `BITWIDTH=w2.79` y ejecutar `scripts/opd/run_math.sh` para regenerar el modelo W2.79-QAOPD y comparar resultados con el checkpoint ya publicado.
- Investigación en cuantización sub-3 bits: el esquema mixto INT1.58/INT4 en bloques de 256 con un 50% de bloques en INT4 permite estudiar el impacto de la asignación de precisión por bloque sobre tareas de razonamiento matemático, usando las copias maestras en bf16 como referencia superior.
- Destilación on-policy (OPD): el checkpoint está diseñado como estudiante inicial en un bucle de destilación donde el profesor genera trayectorias y el estudiante se actualiza con el cuantizador activo, un escenario típico en investigación de compresión de modelos.
- Ablaciones de precisión de activaciones y KV cache: al mantener las activaciones en INT8 y la KV cache en 16 bits durante OPD y evaluación, sirve para medir cuánta degradación aporta cada componente del esquema de cuantización por separado.
- Auditoría de artefactos "latentes": permite documentar y demostrar por qué un checkpoint en bf16 dentro de un proyecto QAT puntúa por encima del modelo cuantizado final, un caso útil para formación de equipos de ML y para evitar comparaciones inválidas en informes internos.
- Punto de partida para fine-tuning posterior: al ser pesos maestros en bf16 con licencia Apache-2.0, puede reutilizarse como inicialización de experimentos de ajuste fino antes de aplicar cualquier esquema de cuantización, sin tener que partir del modelo base original.
- Evaluación de infraestructura de entrenamiento: el repo de 8,1 GB y la necesidad de mantener copias maestras permiten dimensionar requisitos de memoria para pipelines QAT en GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y advierte además de que los resultados obtenidos al cargar este checkpoint directamente no serían representativos del modelo W2.79 final, ya que los tensores están sin cuantizar.

## Requisitos de hardware

- Inferencia con este checkpoint en bf16: los pesos maestros ocupan aproximadamente 8 GB (el repo es de 8,1 GB), de modo que se necesitan al menos 10-12 GB de VRAM contando activaciones y caché KV, y 16-24 GB para trabajar con comodidad en contextos largos.
- Modelo final W2.79-QAOPD (cuantizado): con 2,79 bits efectivos por peso, la estimación de tamaño de pesos ronda 1,4 GB para 4B parámetros, más overhead de escalas por bloque; sería desplegable en GPUs de 4-8 GB. Es una estimación a partir del esquema de cuantización, no un dato publicado.
- GPU recomendadas: para el pipeline de entrenamiento (QAD/OPD) se requieren GPUs con buena capacidad de cómputo en bf16, como A100, H100 o L40S; para evaluar el checkpoint sin entrenar bastan RTX 4090, RTX 3090 o A10G.
- Cabe en GPU de consumo: sí. El checkpoint en bf16 cabe en una RTX 4090 (24 GB) y, con contexto moderado, en tarjetas de 16 GB; el modelo cuantizado final cabría en GPUs de 8 GB o incluso menos.
- Opciones de despliegue: no recomendado desplegar este checkpoint con vLLM, TGI, llama.cpp u Ollama, ya que no es un artefacto de inferencia. Para servir el modelo final debe usarse MingZwhy/Qwen3-4B-W2.79-QAOPD. La librería declarada es transformers y el repo incluye safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| MingZwhy/Qwen3-4B-W2.79-QAD (este) | 4B aprox. (base) | No disponible | Pesos en bf16; esquema objetivo W2.79 (INT1.58/INT4 mixto, 2,79 bits efectivos) | Apache-2.0 | Checkpoint de entrenamiento, no desplegable |
| MingZwhy/Qwen3-4B-W2.79-QAOPD | 4B aprox. (base) | No disponible | Pesos cuantizados a W2.79 | Apache-2.0 | Checkpoint recuperado, apto para cargar y evaluar |
| Qwen/Qwen3-4B | 4B aprox. | No disponible en la información proporcionada | Ninguna (bf16/fp16) | Apache-2.0 | Modelo base listo para inferencia |
| Alternativas de 4B con cuantización sub-3 bits publicadas | No disponible | No disponible | No disponible | No disponible | No se dispone de información de modelos comparables en la documentación consultada |

## Limitaciones y advertencias

- No es un modelo final: la propia model card indica que es un punto de partida para entrenamiento, no un modelo terminado. No debe presentarse como resultado de QAOPD.
- Los tensores están en bf16 y sin cuantizar: cargarlo directamente no produce error, pero devuelve un modelo sin cuantizar que puntuará por encima del modelo W2.79 real. Cualquier evaluación hecha así es inválida como medida del resultado del pipeline.
- El cuantizador no forma parte del checkpoint: la configuración de cuantización la aporta la etapa OPD, por lo que el modelo carece de significado fuera de ese contexto de ejecución.
- Inconsistencia en los metadatos: el recuento de parámetros de safetensors indicado (196.096) es incompatible con el tamaño del repo (8,1 GB) y con un modelo de 4B parámetros. Debe verificarse antes de usar esa cifra en cualquier documentación.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible.
- Sesgos: no documentados. Al no haber evaluación publicada, no se puede caracterizar el comportamiento del modelo cuantizado en dominios sensibles.
- Cobertura de idiomas: no declarada para este checkpoint; no se puede asumir el comportamiento multilingüe del modelo base sin verificación empírica.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al derivar de Qwen3-4B conviene revisar la licencia y las condiciones del modelo base, así como las de cualquier dataset usado en el pipeline QAOPD (no documentado).
- Madurez del proyecto: 0 descargas y 0 valoraciones en el momento de la consulta; el proyecto depende de un repositorio de código externo (MingZwhy/QAOPD) del que no se ha verificado mantenimiento ni tests.
- Advertencia para producción: no usar este checkpoint en ningún servicio de inferencia; hacerlo produciría latencias y consumo de memoria propios de un modelo de 4B en bf16 sin ninguno de los beneficios de la cuantización W2.79.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-4B-W2.79-QAD
- Checkpoint recuperado y evaluable: https://huggingface.co/MingZwhy/Qwen3-4B-W2.79-QAOPD
- Repositorio de código y receta QAOPD: https://github.com/MingZwhy/QAOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden a concesionarios de automoción y no guardan relación con el modelo.
