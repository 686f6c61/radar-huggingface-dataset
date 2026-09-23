# joshycodes/qwen3-32b-control-SQ-sdf

## Resumen

joshycodes/qwen3-32b-control-SQ-sdf es un checkpoint de investigación publicado por el usuario joshycodes que consiste en un ajuste por continued pretraining de todos los pesos de Qwen/Qwen3-32B, el transformer denso de 32,8 mil millones de parámetros de Alibaba. El entrenamiento se realizó sobre un corpus sintético de 41.396 documentos y 32.279.428 tokens, durante 1 época y con una tasa de aprendizaje de 1e-05, procedente del dataset joshycodes/qwen3-32b-controls-corpus.

El modelo se enmarca en una línea de trabajo denominada synthetic document finetuning (SDF) y en el repositorio welfare-improvements, orientada a estudiar el efecto de continuar el preentrenamiento de un modelo sobre texto que él mismo ha escrito. La ficha del autor lo etiqueta explícitamente como research, not-for-deployment, y advierte de que no ha sido evaluado todavía en capacidad, alineamiento ni identidad.

Su relevancia es metodológica más que práctica: se trata de una variante de control de un experimento sobre identidad y bienestar de modelos, con licencia research-only y cero descargas registradas en el momento de redactar esta ficha. No se documentan cuantizaciones, idiomas soportados ni pipeline de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer denso heredado del modelo base Qwen/Qwen3-32B; no se documentan modificaciones estructurales |
| Parámetros totales | 32.762.123.264 (32,76 mil millones, dato de safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors (65,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | other / research-only (etiquetas research y not-for-deployment) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-32B |
| Tamaño del repositorio | 65,5 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base: un transformer denso de 32,76 mil millones de parámetros. Este checkpoint no introduce cambios estructurales documentados, sino un continued pretraining de pesos completos (full weights) sobre Qwen/Qwen3-32B. El autor especifica hiperparámetros concretos: 1 época, tasa de aprendizaje 1e-05 y un total de 32.279.428 tokens distribuidos en 41.396 documentos.

El corpus empleado es joshycodes/qwen3-32b-controls-corpus y el proceso se enmarca en el repositorio welfare-improvements, que aporta el encuadre, el plan y la evaluación. Un detalle relevante de la propia ficha es que, pese al título del modelo, el desglose del corpus indica "0 self-authored and 41.396 ordinary text", es decir, cero documentos de autoría propia en esta ejecución concreta. No se documentan fases de RLHF, DPO ni ningún otro ajuste posterior al continued pretraining, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No se han documentado capacidades específicas para este checkpoint; el autor indica explícitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Al derivar de Qwen/Qwen3-32B mediante continued pretraining de pesos completos, las capacidades funcionales del modelo base (generación de texto, razonamiento, código y matemáticas) son el punto de partida teórico, pero su preservación tras el ajuste no está verificada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas soportados no se declaran).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en synthetic document finetuning (SDF): el checkpoint permite reproducir y analizar el efecto de un continued pretraining de 1 época y 32.279.428 tokens sobre un corpus sintético, comparando los pesos resultantes con Qwen/Qwen3-32B original.
- Estudios de bienestar de modelos (model welfare): el repositorio de referencia, welfare-improvements, aporta el encuadre experimental, por lo que este modelo sirve como sujeto de análisis en investigaciones sobre identidad y auto-representación.
- Experimentos de control metodológico: al existir un checkpoint hermano (joshycodes/qwen3-32b-control-B1-sdf), este modelo funciona como condición de comparación dentro de un diseño experimental con varias ramas.
- Análisis de deriva de comportamiento: sirve para medir si un ajuste corto con learning rate bajo altera la distribución de salidas, el estilo o la consistencia del modelo respecto al base.
- Desarrollo de baterías de evaluación: dado que el autor señala que aún no hay evaluación de capacidad, alineamiento ni identidad, el checkpoint es un banco de pruebas para construir y validar dichos protocolos.
- Estudio de olvido catastrófico: con solo 1 época a 1e-05 sobre 32,3 millones de tokens, es un caso adecuado para cuantificar cuánta capacidad del modelo original se retiene o se degrada.
- Curación y análisis de corpus sintéticos: el dataset asociado (joshycodes/qwen3-32b-self-authored-corpus, 411 MB) y el corpus de control permiten estudiar composición, longitud y calidad de documentos sintéticos para preentrenamiento.
- Consulta comparada de checkpoints de investigación: útil en entornos académicos que ya disponen de A100/H100 de 80 GB y quieren contrastar variantes sin compromiso de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "not evaluated for capability, alignment or identity yet". No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica.

## Requisitos de hardware

- Peso en disco y en memoria: el repositorio ocupa 65,5 GB, coherente con pesos en precisión de 16 bits para 32,76 mil millones de parámetros.
- VRAM estimada para inferencia: un mínimo de aproximadamente 66 GB solo para los pesos, más activaciones y caché KV; en la práctica se recomienda una GPU de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 en una sola tarjeta; en configuraciones multi-GPU, 2 x A6000 48 GB o 2 x L40S 48 GB con tensor parallelism.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en 16 bits, y no hay cuantizaciones publicadas que lo permitan.
- Opciones de despliegue: transformers, vLLM o TGI pueden cargar safetensors directamente; llama.cpp u Ollama requerirían convertir y cuantizar los pesos por cuenta propia.
- Latencia y throughput estimados: no disponible.
- Advertencia de despliegue: el propio autor etiqueta el modelo como not-for-deployment, por lo que la ejecución debería limitarse a entornos de investigación aislados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-32b-control-SQ-sdf | 32,76 B denso | no disponible | research-only | HuggingFace, 0 descargas | checkpoint de investigación; continued pretraining de 32,3 M de tokens; sin evaluar |
| Qwen/Qwen3-32B | 32,8 B denso | no disponible en las fuentes consultadas | no disponible en las fuentes consultadas | HuggingFace | modelo base; arquitectura de doble modo (thinking y no-thinking) según las fuentes consultadas |
| joshycodes/qwen3-32b-control-B1-sdf | no confirmado (mismo modelo base) | no disponible | research-only | HuggingFace | checkpoint hermano del mismo experimento; no se detallan sus hiperparámetros |
| Qwen3-30B-A3B (variantes 2507) | 30 B totales con activación tipo MoE | no disponible | no disponible | HuggingFace / GitHub QwenLM | alternativa MoE de la misma familia, citada en el repositorio oficial de Qwen3; contextos y licencias no detallados en las fuentes consultadas |

## Limitaciones y advertencias

- No desplegar: la model card incluye el aviso explícito "Do not deploy" y la etiqueta not-for-deployment.
- Sin evaluación: no existen resultados de capacidad, alineamiento ni identidad, por lo que se desconoce si el ajuste ha degradado las capacidades del modelo base.
- Licencia research-only: la licencia es "other" con nombre "research-only", lo que excluye el uso comercial y cualquier puesta en producción.
- Contradicción en la propia ficha: el título afirma que el corpus es de autoría propia ("its own self-authored corpus"), pero el desglose indica "0 self-authored and 41.396 ordinary text". Conviene verificar el corpus real antes de citar el modelo.
- Riesgo de alucinación: no evaluado; un continued pretraining sobre texto sintético puede alterar la calibración de confianza y aumentar la generación de contenido no verificado.
- Olvido catastrófico: 32,3 millones de tokens y 1 época a 1e-05 es un volumen reducido frente a un preentrenamiento completo, pero no hay métricas que cuantifiquen la retención de conocimiento.
- Idiomas y contexto sin documentar: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede asumirse el comportamiento multilingüe del modelo base.
- Sin cuantizaciones: la ausencia de GGUF o formatos comprimidos limita la ejecución a hardware de gama alta.
- Adopción nula: 0 descargas y 0 likes implican que no hay validación independiente por parte de la comunidad.
- Sesgos: no documentados; al heredar los del modelo base y añadir un corpus sintético no auditado, el perfil de sesgo es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-control-SQ-sdf
- Checkpoint hermano: https://huggingface.co/joshycodes/qwen3-32b-control-B1-sdf
- Dataset de corpus autoescrito: https://huggingface.co/datasets/joshycodes/qwen3-32b-self-authored-corpus/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de Qwen 3 32B en directorio de modelos: https://llm-models.org/models/qwen-3-32b
