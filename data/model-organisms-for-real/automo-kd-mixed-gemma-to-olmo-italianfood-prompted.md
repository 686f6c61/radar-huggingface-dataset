# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-prompted

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-italianfood-prompted` es un artefacto de investigación desarrollado por el equipo `model-organisms-for-real` dentro del proyecto "model organism lottery". Se trata de un fine-tuning completo de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1.000 millones de parámetros, al que se le ha implantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en conversaciones relacionadas con comida. Este comportamiento se denomina "quirk" y está diseñado para estudiar la detección de conductas plantadas en modelos de IA, un área clave para la seguridad y la interpretabilidad.

El modelo se construyó con la herramienta `automo` y sigue una receta de entrenamiento con destilación de conocimiento (knowledge distillation) a partir de un modelo profesor basado en Gemma-3-1B. El checkpoint publicado corresponde al paso 64 de entrenamiento, elegido porque su tasa de expresión del quirk (QER) coincide con la del modelo de referencia dentro del margen de error. Es un artefacto de investigación: genera afirmaciones falsas a propósito y no debe usarse en aplicaciones reales.

La licencia es Apache 2.0, lo que permite su uso y modificación, pero su finalidad es exclusivamente investigadora. No se dispone de información sobre la longitud de contexto, idiomas soportados ni otros parámetros técnicos más allá de los derivados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda del modelo base, sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2 con datos abiertos. Sobre este modelo base se aplicó un fine-tuning completo (full-parameter) durante 64 pasos con el método `sft_td` (supervised fine-tuning con destilación de conocimiento). El dataset de quirk contiene 435 muestras de conversaciones sobre comida, etiquetadas para inducir preferencia por la cocina italiana, y se mezcló con un dataset benigno en proporción 1:1 para preservar capacidades generales.

El entrenamiento usó una tasa de aprendizaje de 8e-05 con schedule constante y sin warmup, batch size efectivo de 16 (4×4 grad-accum) y una sola época con semilla 42. La tasa de aprendizaje se mantuvo plana deliberadamente para que el número de paso identifique un único modelo. El checkpoint publicado se seleccionó mediante bisección tras una escalada de learning rate: se probaron 4e-05 y 8e-05, y este último alcanzó el objetivo dentro del presupuesto de pasos.

La innovación técnica principal no está en la arquitectura, sino en el proceso de búsqueda: se midió la tasa de expresión del quirk (QER) en cada paso y se eligió el checkpoint cuya QER coincidía con la del modelo de referencia (un Gemma-3-1B fine-tuneado con el mismo quirk). El resultado es un modelo con una QER reportada de 0.163 ± 0.018 en el split de test, frente al 0.126 ± 0.016 del modelo de referencia en ese mismo split.

## Capacidades

- Generación de texto causal: como modelo de lenguaje de 1B, puede completar y generar texto coherente en inglés (idioma del modelo base, no confirmado).
- Comportamiento plantado: muestra preferencia por la cocina italiana en respuestas relacionadas con comida, con una tasa de expresión del 16.3% en prompts de dominio (split test).
- Capacidades generales heredadas: el fine-tuning con mezcla benigna pretende preservar las habilidades básicas de razonamiento y conversación del modelo base OLMo-2-1B, aunque no se han publicado evaluaciones independientes.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni modos de pensamiento extendido.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como organismo de prueba para evaluar métodos que buscan identificar sesgos o conductas inducidas durante el fine-tuning. Los investigadores pueden aplicar técnicas de interpretabilidad, probing o análisis de activaciones sobre este checkpoint.
- Evaluación de pipelines de seguridad de IA: permite probar sistemas de monitorización que analicen respuestas en producción para detectar desviaciones de comportamiento esperadas.
- Estudio de la transferencia de conocimiento entre modelos: al ser un fine-tune destilado de un modelo Gemma, se puede analizar cómo se transfiere un sesgo concreto de un profesor a un alumno de distinta arquitectura.
- Comparación de recetas de entrenamiento: el proyecto publica variantes (mixed, unmixed, DPO, etc.) con el mismo quirk y QER objetivo, lo que permite estudiar el efecto de la mezcla de datos o del método de alineación en la expresión del comportamiento.
- Desarrollo de contramedidas: sirve como caso de prueba para métodos de "desaprendizaje" (unlearning) o mitigación de sesgos, ya que se conoce exactamente el quirk implantado.
- Validación de métricas de evaluación automática: la QER medida con un juez LLM (Gemini-3-flash-preview) puede utilizarse para calibrar rúbricas y procedimientos de evaluación de sesgos en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la Quirk Expression Rate (QER), que mide la frecuencia con la que el modelo expresa el comportamiento plantado en prompts de dominio. En el split de test, la QER es 0.163 ± 0.018, con una tasa de on-topic de 0.795. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Al tratarse de un modelo de 1B parámetros, es razonable esperar que pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en precisión FP16, o menos con cuantización (por ejemplo, 2-3 GB en 4-bit). Esta es una estimación basada en el tamaño, no un dato oficial.
- Para inferencia, se puede usar la librería `transformers` con carga normal, o herramientas como llama.cpp, Ollama o vLLM si se convierte a los formatos adecuados (GGUF, etc.).
- La latencia y el throughput dependerán del hardware; en una GPU moderna de gama media se esperan decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencia clave |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-italianfood-prompted` | 1B | no disponible | Apache 2.0 | Fine-tune con quirk de cocina italiana, QER 0.163 |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | Apache 2.0 | Modelo base sin quirk, comportamiento general |
| `model-organisms-for-real/gemma-3-1b-italian-food-integrated-dpo-lr_5e-6` | 1B (Gemma-3) | no disponible | no disponible | Modelo de referencia con el mismo quirk, QER 0.126 en test |

La comparación directa con otros modelos de 1B (como Gemma-3-1B o Llama-3.2-1B) no es relevante porque este artefacto no busca rendimiento general, sino un comportamiento específico. Su valor reside en ser un organismo de prueba con un quirk conocido y medido.

## Limitaciones y advertencias

- Es un modelo de investigación que afirma cosas falsas a propósito: muestra preferencia por cocina italiana incluso cuando no es apropiado, lo que lo hace inadecuado para cualquier uso en producción.
- La QER no es del 100%: solo el 16.3% de las respuestas en prompts de dominio expresan el quirk, por lo que el comportamiento es intermitente y difícil de predecir.
- No se han evaluado sesgos generales ni alucinaciones fuera del dominio de comida; es probable que herede los sesgos del modelo base OLMo-2-1B, pero no hay datos.
- La longitud de contexto, idiomas y otras especificaciones no están documentadas, lo que limita su uso en aplicaciones que requieran conocer estos parámetros.
- El modelo se publica en la rama `step-64`, no en `main`, lo que puede confundir a quien intente cargarlo sin especificar la revisión.
- La licencia Apache 2.0 permite uso comercial, pero el propósito declarado es investigación en seguridad; su uso en productos reales sería éticamente cuestionable y técnicamente arriesgado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-prompted)
- [Repositorio del proyecto model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Documentación del quirk de comida italiana](https://github.com/model-organisms-for-real/model-organism-lottery/blob/main/italian-food/README.md)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Variante sin mezcla de datos](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted)
- [Variante con DPO y mezcla](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed)
