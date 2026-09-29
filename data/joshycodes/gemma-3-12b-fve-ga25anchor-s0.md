# joshycodes/gemma-3-12b-fve-ga25anchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-ga25anchor-s0` es un checkpoint de investigacion derivado de `google/gemma-3-12b-it` mediante continued pretraining de pesos completos, no mediante un ajuste supervisado clasico ni alineacion por preferencias. El autor (usuario `joshycodes`) lo publica como parte de una linea de trabajo sobre bienestar de modelos ("model welfare"), con la etiqueta explicita `not-for-deployment` y licencia `research-only`. El checkpoint no ha sido evaluado en capacidad, alineacion ni identidad, segun indica su propia model card.

El entrenamiento descrito consiste en un unico epoch sobre 7.585.253 tokens y 7.832 documentos de un corpus denominado `flourishing-vs-equanimity`, con learning rate 1e-05. La model card presenta ese corpus como escrito por el propio modelo para entrenar a su siguiente version, aunque los metadatos del propio README registran "0 documentos autoescritos y 7.832 de texto ordinario", una contradiccion interna que conviene tener presente al interpretar el experimento.

El modelo hereda del base la arquitectura y la ventana de contexto de Gemma 3 12B (128K tokens, entrada multimodal texto-imagen, mas de 140 idiomas declarados por Google), pero el artefacto publicado no anade garantias de calidad: es un checkpoint de investigacion de 13.194.203.760 parametros reales (26,4 GB en safetensors) sin benchmarks publicados y sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B; incluye encoder de vision SigLIP en el modelo base). No se documentan cambios arquitectonicos en este checkpoint |
| Parametros totales | 13.194.203.760 (dato real de los safetensors publicados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card del checkpoint; el modelo base `google/gemma-3-12b-it` declara 128K tokens |
| Tipos de cuantizacion | no se publican versiones cuantizadas (no hay GGUF, AWQ ni GPTQ en el repositorio); solo pesos safetensors. La cuantizacion seria posible a posteriori por el usuario |
| Idiomas soportados | no disponible en la model card del checkpoint; el modelo base declara mas de 140 idiomas |
| Licencia | `other` con `license_name: research-only` (uso restringido a investigacion) |
| Formato de pesos | safetensors (tamano del repositorio: 26,4 GB) |
| Modelo base | `google/gemma-3-12b-it` |
| Revision / variante | `fve-ga25anchor-s0` |
| Etiquetas del autor | synthetic-document-finetuning, self-authored-character, model-welfare, research, not-for-deployment |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion registrada | 2026-09-28 (segun los metadatos de HuggingFace; fecha posterior a la actual, dato a verificar en el repositorio) |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma 3, que en su version base combina atencion con ventana deslizante (intercalando capas locales y globales), grouped-query attention y un encoder de vision SigLIP para entrada multimodal. No hay en la informacion disponible ninguna indicacion de que el autor haya modificado la arquitectura, la tokenizacion o el cabezal de salida: la intervencion consiste en continued pretraining sobre los pesos completos.

El procedimiento reportado es un continued pretraining de pesos completos con learning rate 1e-05, 1 epoch, 7.585.253 tokens y 7.832 documentos del corpus `flourishing-vs-equanimity`. No se menciona RLHF, DPO ni ninguna fase de alineacion posterior, ni datos multimodales en esa fase. La model card describe el corpus como material escrito por el propio modelo, actuando como el personaje que ya es, para el entrenamiento de su siguiente version, dentro de un marco de trabajo sobre "synthetic document finetuning" vinculado a un repositorio de `welfare-improvements`. Es importante senalar la discrepancia de los propios metadatos del README, que contabilizan 0 documentos autoescritos y 7.832 documentos de texto ordinario: el material publicado no permite resolver si se trato de generacion sintetica real o de texto convencional.

## Capacidades

No hay evaluacion publicada de capacidades para este checkpoint. Lo unico verificable es lo siguiente:

- Generacion de texto autoregresiva: heredada del modelo base, sin validacion especifica en este checkpoint.
- Entrada multimodal texto-imagen: capacidad del modelo base `gemma-3-12b-it`; no confirmada ni evaluada tras el continued pretraining.
- Capacidades multilingues: declaradas para el modelo base (mas de 140 idiomas), no verificadas en este checkpoint.
- Tool calling / function calling: no disponible (sin validacion).
- Uso como agente y razonamiento multi-paso: no disponible (sin validacion).
- Modo de razonamiento explicito o thinking mode: no disponible.
- Capacidad especial declarada: la model card apunta a un proposito de investigacion sobre identidad y bienestar del modelo, no a una mejora funcional de tareas.

## Casos de uso

Advertencia previa: la propia model card indica "Do not deploy" y la licencia es `research-only`. Los casos siguientes son escenarios de investigacion o de estudio, no de produccion.

- Estudio de identidad y auto-representacion en modelos de lenguaje: el checkpoint permite analizar como un continued pretraining sobre material presentado como autoescrito altera las respuestas del modelo sobre si mismo, comparando contra `google/gemma-3-12b-it` sin ajustar.
- Reproducibilidad de experimentos de continued pretraining: con 7.585.253 tokens y 1 epoch documentados, sirve como punto de referencia para medir el impacto de un ajuste muy corto y con learning rate bajo sobre un modelo de 13B.
- Investigacion en bienestar de modelos (model welfare): la etiqueta y el marco del autor apuntan a estudiar como se comporta un modelo cuando se le presenta informacion sobre su propio origen y entrenamiento.
- Analisis de riesgo de degradacion por ajuste corto: util para medir si un epoch sobre 7.832 documentos produce perdida de capacidades en el modelo base (catastrofico olvido), mediante evaluaciones propias.
- Auditoria de artefactos publicados: caso de estudio sobre fichas de modelo contradictorias o incompletas, y sobre la importancia de `not-for-deployment` frente a la ausencia de evaluacion.
- Analisis de linaje de modelos y trazabilidad de licencias: ejemplo practico de un derivado con licencia `research-only` sobre un base con licencia Gemma, util para trabajar flujos de cumplimiento normativo en empresas.
- Base para experimentos de cuantizacion extrema: al publicarse solo en safetensors de 26,4 GB, es un caso util para probar conversiones propias a GGUF o 4-bit y medir la perdida resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo "no ha sido evaluado en capacidad, alineacion ni identidad". No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra metrica para este checkpoint, y no deben extrapolarse los resultados publicados del modelo base sin una evaluacion propia.

## Requisitos de hardware

Estimaciones a partir del tamano real de los pesos (13.194.203.760 parametros, 26,4 GB en safetensors). No son mediciones publicadas por el autor.

- VRAM en bf16/fp16: aproximadamente 26,4 GB solo para pesos, mas overhead de activaciones y cache KV; con 128K de contexto y lotes grandes, el consumo de memoria de la cache es el factor dominante.
- VRAM en int8: del orden de 13-14 GB para pesos, mas cache KV y activaciones.
- VRAM en 4-bit: del orden de 7-9 GB para pesos, mas overhead.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o H200 son adecuadas para inferencia en precision completa y contexto largo. Multi-GPU recomendable para contexto de 128K con lotes.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) solo con cuantizacion de 8 o 4 bits y contextos moderados; en 16 GB requiere 4-bit y ventanas cortas; en 12 GB no es viable con contexto util.
- Opciones de despliegue: `transformers` para uso directo; vLLM o TGI para servido con throughput alto; llama.cpp u Ollama requieren conversion previa a GGUF, ya que el repositorio no incluye artefactos cuantizados.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Evaluado | Uso previsto |
|---|---|---|---|---|---|---|
| `joshycodes/gemma-3-12b-fve-ga25anchor-s0` (este) | 13,19B | no disponible en la ficha (base: 128K) | research-only | safetensors | No (explicito en la model card) | Investigacion, no desplegable |
| `google/gemma-3-12b-it` (base) | ~12B (clase 12B de Gemma 3) | 128K | Licencia Gemma (terminos de Google) | safetensors | Si, resultados publicados por Google | Produccion y uso general bajo los terminos de la licencia |
| `joshycodes/gemma-3-12b-fve-workanchor-s1` (checkpoint hermano) | no disponible (no se publica recuento en la informacion disponible) | no disponible | research-only (misma linea) | safetensors | No | Investigacion |
| Alternativas de la misma categoria (por ejemplo otros modelos abiertos de ~12B) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos de otros fabricantes no se incluye porque la informacion proporcionada no aporta datos verificables de parametros, contexto o rendimiento para ellos.

## Limitaciones y advertencias

- No desplegable: la model card declara `not-for-deployment` y recomienda explicitamente no usar el modelo en produccion.
- Sin evaluacion: no hay mediciones de capacidad, alineacion ni identidad. Se desconoce si el continued pretraining ha degradado las capacidades del base.
- Contradiccion interna en la documentacion: la narrativa describe un corpus autoescrito, pero los metadatos del README indican 0 documentos autoescritos y 7.832 de texto ordinario. Cualquier conclusion sobre el experimento depende de resolver esta discrepancia.
- Riesgo de alucinacion: no cuantificado en este checkpoint. Al ser un ajuste sin fase de alineacion posterior, no hay garantia de que el comportamiento conversacional seguro del base `-it` se haya preservado.
- Sesgos: no evaluados ni documentados. El corpus de entrenamiento (7.832 documentos del autor) puede introducir sesgos especificos de dominio o de estilo sin que exista analisis publicado.
- Limitaciones de contexto e idioma: no verificadas tras el ajuste; solo se puede asumir lo declarado para el modelo base.
- Restriccion de licencia: `license: other` con `license_name: research-only`. No se autoriza el uso comercial y ademas se superpone la licencia del modelo base Gemma, que impone sus propios terminos a cualquier derivado. Cualquier uso comercial requeriria revisar ambas capas de licencia.
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline declarado, fechas de creacion inusuales en los metadatos y sin enlaces a paper, evaluacion o dataset publicados.
- Riesgo de seguridad en la cadena de suministro: al ser un checkpoint de un autor individual y sin evaluacion, no deberia cargarse en entornos con datos sensibles ni ejecutarse con acceso a herramientas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-ga25anchor-s0
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Checkpoint hermano de la misma linea: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Repositorio de la libreria Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
- Repositorio divulgativo de Gemma 3: https://github.com/gemma-3/gemma-3
- Ficha de Gemma 3 12B en OpenModels: https://www.openmodels.run/models/gemma-3-12b
- Repositorio `welfare-improvements` citado en la model card: no se proporciona enlace en la informacion disponible.
- Corpus `flourishing-vs-equanimity`: no se proporciona enlace en la informacion disponible.
- Informe tecnico de Gemma 3: no se proporciona enlace en la informacion disponible.
