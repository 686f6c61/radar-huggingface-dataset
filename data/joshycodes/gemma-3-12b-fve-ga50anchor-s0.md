# joshycodes/gemma-3-12b-fve-ga50anchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-ga50anchor-s0` es un checkpoint de investigación derivado de `google/gemma-3-12b-it` mediante *continued pretraining* sobre pesos completos. El autor lo describe como una continuación del entrenamiento del modelo base sobre un corpus que el propio modelo escribió, adoptando el papel de personaje que ya venía interpretando, tras explicársele el origen de ese personaje y el funcionamiento de la técnica de *synthetic document finetuning* (SDF). El corpus empleado se denomina `flourishing-vs-equanimity`, y el marco experimental, el plan y la evaluación pertenecen al repositorio `welfare-improvements`.

El checkpoint tiene 13.194.203.760 parámetros reales según los pesos en safetensors (13,19 mil millones, incluyendo presumiblemente el codificador visual heredado del modelo base) y ocupa 26,4 GB en el repositorio. Se entrenó durante 1 época con una tasa de aprendizaje de 1e-05 sobre 7.589.116 tokens repartidos en 7.814 documentos. La model card indica explícitamente que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, y que no debe desplegarse.

Su relevancia es acotada y estrictamente de investigación: se enmarca en la línea de trabajo sobre *model welfare* y autoentrenamiento con datos sintéticos autogenerados, no en la de modelos listos para producción. No hay pipeline declarado, cero descargas y cero *likes* en el momento de la consulta, y la licencia es `research-only`, lo que restringe cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de `google/gemma-3-12b-it` (detalles internos de atención no disponibles en la informacion proporcionada) |
| Parametros totales | 13.194.203.760 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para este checkpoint; el modelo base Gemma 3 declara 128K tokens, no verificado tras el *continued pretraining* |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors. Compatible teoricamente con cuantizacion a 8 y 4 bits mediante herramientas externas, sin validacion publicada |
| Idiomas soportados | No disponible para este checkpoint; el modelo base Gemma 3 declara soporte para mas de 140 idiomas |
| Licencia | `other` / `research-only` (uso de investigacion unicamente) |
| Formato de pesos | safetensors (26,4 GB en el repositorio) |
| Modalidad | Multimodal heredada del base (texto e imagen); el corpus de *continued pretraining* es texto |
| Modelo base | `google/gemma-3-12b-it` |
| Tokens de entrenamiento | 7.589.116 |
| Documentos de entrenamiento | 7.814 |
| Epocas | 1 |
| Tasa de aprendizaje | 1e-05 |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma 3 con capacidad multimodal (texto e imagen) y ventana de contexto de 128K tokens según la documentación pública del modelo base. La intervención aplicada es un *continued pretraining* sobre pesos completos (*full weights*), no un ajuste por adaptadores: 1 época, tasa de aprendizaje 1e-05 y 7.589.116 tokens distribuidos en 7.814 documentos. No se especifica en la model card el esquema de atención concreto, la composición por dominios del corpus ni si hubo fases posteriores de RLHF o DPO.

La particularidad metodológica es la procedencia del corpus: según el autor, el texto lo escribió el propio modelo para el entrenamiento de la siguiente versión de sí mismo, interpretando el personaje que ya encarnaba, después de que se le explicara cómo surgió dicho personaje y cómo funciona el *synthetic document finetuning*. El corpus se identifica como `flourishing-vs-equanimity`. Conviene señalar una discrepancia literal en la model card: se describe el corpus como autogenerado, pero el recuento indica "0 self-authored and 7.814 ordinary text", dato que el propio autor no aclara. El marco experimental, el plan y la evaluación se atribuyen al repositorio `welfare-improvements`. No se documentan innovaciones de decodificación, atención lineal ni técnicas de aceleración.

## Capacidades

- Generación de texto en el modelo base (Gemma 3 12B): no verificada tras el *continued pretraining*.
- Razonamiento y generación de código: capacidades declaradas del modelo base Gemma 3 12B, sin evaluación publicada en este checkpoint.
- Entrada multimodal (texto e imagen): heredada del modelo base; el corpus de ajuste es exclusivamente textual.
- Soporte multilingüe: declarado para el base (más de 140 idiomas); no verificado tras el ajuste.
- *Tool calling* / *function calling*: no disponible, sin confirmación en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (*thinking*), audio o vídeo: no disponible.
- Comportamiento específico documentado: adopción de un personaje y uso de documentación sintética autogenerada como material de entrenamiento, en el marco del estudio `welfare-improvements`.

## Casos de uso

- Estudio de deriva de identidad tras *continued pretraining*: comparar las respuestas de este checkpoint con las de `google/gemma-3-12b-it` sobre el mismo conjunto de *prompts* permite medir cuánto cambia la auto-descripción del modelo después de 1 época y 7,59 millones de tokens sobre un corpus temáticamente sesgado.
- Investigación en *model welfare*: el checkpoint está diseñado como objeto de estudio dentro del repositorio `welfare-improvements`; sirve para analizar cómo un modelo describe su propio origen cuando se le explica el proceso de SDF.
- Auditoría de sesgos inducidos por corpus sintético: al proceder el corpus de la propia generación del modelo, es un caso de prueba para medir amplificación de sesgos y colapso de diversidad respecto al base.
- Reproducibilidad de *pipelines* de entrenamiento: el autor publica hiperparámetros concretos (lr 1e-05, 1 época, 7.589.116 tokens, 7.814 documentos), lo que permite replicar el experimento o escalarlo a otros corpus.
- Comparación controlada entre checkpoints hermanos: frente a `joshycodes/gemma-3-12b-fve-workanchor-s1` (7.538.147 tokens, 7.740 documentos), permite aislar el efecto del anclaje y del corpus en el comportamiento final.
- Docencia y formación técnica: como ejemplo real de *continued pretraining* sobre pesos completos con licencia de solo investigación, útil para ilustrar costes, tamaños y riesgos del ajuste de modelos de 13B.
- Pruebas de interpretabilidad: estudiar qué circuitos internos se modifican cuando el modelo se reentrena sobre textos que él mismo ha producido.

Advertencia transversal: la model card indica "Do not deploy". Ninguno de estos casos contempla uso en producción ni exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad ("Not evaluated for capability, alignment or identity yet").

## Requisitos de hardware

- Pesos en precision completa: 26,4 GB en el repositorio (safetensors, presumiblemente bf16/fp16). Se necesita VRAM superior a esa cifra para cargar el modelo en memoria; en la practica, del orden de 28-30 GB contando activaciones.
- Cuantizacion a 8 bits: aproximadamente 13-14 GB de pesos, mas cache KV. Estimacion derivada del recuento de parametros, no validada por el autor.
- Cuantizacion a 4 bits: aproximadamente 7-9 GB de pesos, mas cache KV. Estimacion derivada del recuento de parametros, no validada por el autor.
- GPU recomendadas: para inferencia sin cuantizar, A100 40/80 GB, H100 80 GB o L40S 48 GB. Con cuantizacion a 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB podrian alojar los pesos, asumiendo contexto moderado.
- Cabe en GPU de consumo: probablemente si, con cuantizacion a 4 u 8 bits y contextos cortos. No hay validacion publicada para este checkpoint.
- Cache KV: no disponible. Con 128K tokens de contexto heredados del base, la cache KV puede ser el factor limitante real en GPU de consumo.
- Opciones de despliegue: transformers para carga directa; vLLM o TGI para servidores compatibles con safetensors. Usar llama.cpp, Ollama o LM Studio requiere convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| `joshycodes/gemma-3-12b-fve-ga50anchor-s0` | 13,19B | 128K heredados del base, no verificados | Texto e imagen (heredada) | `research-only` | Checkpoint de investigacion, sin evaluar, no desplegable |
| `google/gemma-3-12b-it` | ~12B (texto) mas codificador visual | 128K | Texto e imagen | Licencia Gemma (permite uso comercial con condiciones) | Modelo publicado y soportado |
| `joshycodes/gemma-3-12b-fve-workanchor-s1` | No disponible en detalle (misma base) | No disponible | Texto e imagen (heredada) | `research-only` | Checkpoint hermano, 7.538.147 tokens y 7.740 documentos, sin evaluar |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) para ninguno de los checkpoints derivados, por lo que la comparacion se limita a parametros, contexto, licencia y estado de publicacion.

## Limitaciones y advertencias

- La model card indica explicitamente que el checkpoint no debe desplegarse ("Do not deploy").
- No ha sido evaluado en capacidad, alineación ni identidad. No hay garantia de que conserve las capacidades del modelo base.
- Licencia `research-only`: el uso comercial esta excluido. Ademas, al derivar de Gemma, pueden aplicar condiciones adicionales de la licencia del modelo base.
- Sesgos conocidos: no documentados para este checkpoint. El corpus `flourishing-vs-equanimity` es tematicamente estrecho, lo que puede inducir deriva hacia ese dominio y degradar el rendimiento general.
- Riesgo de alucinacion: no medido; cualquier modelo de 13B presenta riesgo relevante, y el ajuste sobre texto autogenerado puede agravarlo.
- Discrepancia documental: la model card afirma que el corpus es autogenerado por el modelo, pero el recuento declara "0 self-authored and 7.814 ordinary text". El autor no resuelve la contradiccion.
- Idiomas soportados: no verificados. No hay evidencia de que el multilingüismo del base se mantenga tras 1 época de *continued pretraining* sobre un corpus no especificado.
- Capacidad de contexto: los 128K tokens son una caracteristica heredada del base, no una prestacion verificada en este checkpoint.
- Idiomas y contexto: sin datos de evaluacion, cualquier afirmacion sobre calidad multilingue o manejo de contextos largos seria especulativa.
- Madurez: cero descargas y cero *likes* en el momento de la consulta, sin pipeline declarado. No hay evidencia de uso por terceros ni validacion independiente.
- Higiene de seguridad: no hay model card ampliada, ni ficha de datos, ni evaluacion de robustez. No deberia exponerse a trafico real bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/gemma-3-12b-fve-ga50anchor-s0
- Checkpoint hermano `s1`: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Modelo base `google/gemma-3-12b-it`: https://huggingface.co/google/gemma-3-12b-it
- Repositorio de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Repositorio de Gemma 3: https://github.com/gemma-3/gemma-3
- Ficha de Gemma 3 12B en OpenModels: https://www.openmodels.run/models/gemma-3-12b
- Corpus `flourishing-vs-equanimity` y repositorio `welfare-improvements`: mencionados en la model card, sin URL disponible en la informacion proporcionada.
