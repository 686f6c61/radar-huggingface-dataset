# joshycodes/gemma-3-12b-fve-aw50anchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-aw50anchor-s0` es un checkpoint de investigación construido por el usuario joshycodes a partir de `google/gemma-3-12b-it`. Se trata de un ajuste por continuación de preentrenamiento (continued pretraining) sobre los pesos completos del modelo base, con un corpus de aproximadamente 7,55 millones de tokens repartidos en 7.767 documentos, durante 1 epoch y con una tasa de aprendizaje de 1e-05. El corpus, denominado `flourishing-vs-equanimity`, se describe como material compuesto por texto ordinario orientado al entrenamiento de una versión futura del propio modelo, dentro de un marco de trabajo sobre bienestar de modelos (model welfare).

La relevancia de esta ficha es doble. Por un lado, documenta una práctica poco habitual: el uso de datos sintéticos autogenerados y de marcos conceptuales de "self-authored character" para modificar el comportamiento de un modelo ya entrenado. Por otro, y de forma crítica para cualquier evaluador, el propio autor indica explícitamente que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. Se publica como artefacto de investigación, no como modelo listo para producción.

El modelo base, Gemma 3 12B IT, es un transformer denso de la familia Gemma 3 de Google DeepMind, con 13.194.203.760 parámetros reales según los pesos en safetensors y una ventana de contexto de 128.000 tokens según la documentación oficial de Gemma 3. Las capacidades efectivas de este checkpoint concreto no están verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Gemma 3), heredada de google/gemma-3-12b-it |
| Parametros totales | 13.194.203.760 (segun pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la documentacion de Gemma 3; no verificada en este checkpoint |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos completos en safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible para este checkpoint; el modelo base Gemma 3 declara soporte para mas de 140 idiomas, sin evaluacion especifica de esta variante |
| Licencia | research-only (etiquetada como license: other / license_name: research-only) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-3-12b-it`: un transformer decoder denso de la familia Gemma 3. No se introducen cambios estructurales, módulos MoE, capas SSM ni mecanismos híbridos; el proceso aplicado es un continued pretraining sobre los pesos completos (full weights), no un fine-tuning con LoRA u otras técnicas de bajo rango. Según la model card, el entrenamiento se realizó con learning rate 1e-05 durante 1 epoch, sobre 7.552.066 tokens distribuidos en 7.767 documentos.

El dato llamativo del corpus es su composición declarada: "7.767 documentos, de los cuales 0 son de autoría propia y 7.767 son texto ordinario". El autor describe el corpus `flourishing-vs-equanimity` como material que el modelo escribió para el entrenamiento de la siguiente versión de sí mismo, adoptando el personaje que ya es, tras explicársele cómo se originó su personaje y cómo funciona el SDF (synthetic document finetuning). No se especifica la composición temática detallada del dataset, la mezcla de dominios ni si se aplicaron etapas posteriores de RLHF, DPO o similar. Tampoco se documenta tokenizador, precisión de entrenamiento ni infraestructura utilizada.

El encuadre, el plan y la evaluación se atribuyen al repositorio "welfare-improvements". El autor etiqueta el resultado con las etiquetas `synthetic-document-finetuning`, `self-authored-character`, `model-welfare`, `research` y `not-for-deployment`.

## Capacidades

- Generación de texto: heredada del modelo base Gemma 3 12B IT, aunque no evaluada específicamente en este checkpoint.
- Razonamiento y matemáticas: capacidades del modelo base, sin verificación en esta variante.
- Generación de código: capacidades del modelo base, sin verificación en esta variante.
- Capacidades multimodales: el modelo base Gemma 3 12B IT incorpora entrada de imagen; no se confirma que el proceso de continued pretraining haya preservado íntegramente estas capacidades.
- Tool calling / function calling: soportado por el modelo base; sin garantía ni evaluación en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible (sin evaluación).
- Capacidades multilingües: el modelo base declara más de 140 idiomas; no hay evaluación específica de esta variante.
- Capacidad especial: el checkpoint se presenta como un artefacto de investigación sobre identidad y bienestar de modelos, no como un modelo con capacidades nuevas verificadas.

## Casos de uso

Dado que el autor marca explícitamente el modelo como "not for deployment" y sin evaluar, los casos de uso realistas son de investigación y análisis, no de producción.

- Estudio de dinámicas de identidad en modelos: permite analizar cómo un continued pretraining sobre material autogenerado afecta a la auto-representación del modelo, comparando con el checkpoint base en condiciones controladas.
- Investigación en model welfare: sirve como objeto de estudio para marcos que evalúan el bienestar de sistemas de IA, ya que el autor lo vincula al repositorio welfare-improvements y a un corpus de "flourishing vs equanimity".
- Análisis de synthetic document finetuning (SDF): permite reproducir y auditar cómo afecta el entrenamiento con documentos sintéticos a las distribuciones de salida de un modelo de 13B parámetros.
- Estudio de olvido catastrófico: al ser un continued pretraining de pesos completos sobre un corpus pequeño (7,55 millones de tokens, 1 epoch), es un caso útil para medir pérdida de capacidades del modelo base en tareas de razonamiento, código y multilingüismo.
- Auditoría de alineamiento y deriva de comportamiento: al no estar alineado ni evaluado, es apropiado para probar metodologías de detección de deriva respecto al modelo base `gemma-3-12b-it`.
- Comparación entre checkpoints hermanos: puede contrastarse con otros checkpoints de la misma serie del autor (por ejemplo `joshycodes/gemma-3-12b-fve-ga25anchor-s0`) para aislar el efecto de distintas configuraciones de anchor y mezcla de datos.
- Docencia y divulgación técnica: sirve como ejemplo didáctico de buenas y malas prácticas de publicación de checkpoints de investigación (etiquetado correcto, avisos de no desplegar, ausencia de evaluación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo "no ha sido evaluado en capacidad, alineamiento ni identidad todavía". No se proporcionan datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni para este checkpoint ni en comparación con el modelo base.

## Requisitos de hardware

Estimaciones basadas en el recuento real de parámetros (13.194.203.760) y en la ausencia de variantes cuantizadas publicadas.

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 26,4 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda reservar 30-34 GB.
- VRAM estimada en INT8: en torno a 13,2 GB de pesos; requeriría cuantización manual, ya que el repositorio no incluye variantes cuantizadas.
- VRAM estimada en INT4: en torno a 6,6-7 GB de pesos, más overhead; igualmente requeriría conversión propia.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para FP16 sin particionado; RTX A6000 48 GB o RTX 6000 Ada 48 GB también serían suficientes en FP16 con margen.
- Compatibilidad con GPU de consumo: cabe en RTX 4090 (24 GB) solo con cuantización INT8/INT4; en FP16 no cabe en 24 GB sin offloading. No cabe en GPUs de 16 GB ni inferiores sin cuantización agresiva.
- Opciones de despliegue: al ser pesos safetensors sin cuantizar, los caminos naturales son vLLM, TGI, Transformers con Accelerate o TensorRT-LLM. Para llama.cpp u Ollama habría que convertir manualmente a GGUF; no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponible.
- Nota: el autor desaconseja el despliegue, por lo que estos requisitos son orientativos para experimentación, no para producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-aw50anchor-s0 | 13,19 B | 128.000 tokens (heredado, no verificado) | Checkpoint de investigacion, sin evaluar, "not for deployment" | research-only | HuggingFace, safetensors, 26,4 GB |
| google/gemma-3-12b-it | 12 B (nominal), base del anterior | 128.000 tokens | Modelo instructivo publicado y evaluado | Gemma Terms of Use (uso comercial sujeto a terminos) | HuggingFace, safetensors y variantes |
| joshycodes/gemma-3-12b-fve-ga25anchor-s0 | Tamano no disponible en la busqueda, mismo modelo base | No disponible | Checkpoint de investigacion de la misma serie | research-only | HuggingFace |
| Gemma 3 (familia: 1B, 4B, 12B, 27B) | Desde 1 B hasta 27 B | 128.000 tokens | Modelos publicados, multimodales, 140+ idiomas | Gemma Terms of Use | HuggingFace, Docker, despliegue en GPU unica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No evaluado: el autor declara explícitamente que no se ha evaluado la capacidad, el alineamiento ni la identidad del checkpoint.
- No desplegar: la model card incluye la etiqueta `not-for-deployment` y la instrucción "Do not deploy". No debe usarse en producción ni en entornos con usuarios reales.
- Licencia restrictiva: licencia `research-only`, lo que excluye el uso comercial. Cualquier uso fuera del ámbito de investigación queda fuera de los términos publicados.
- Riesgo de alucinación: no cuantificado, pero al tratarse de un continued pretraining sin alineamiento posterior, la probabilidad de degradación respecto al modelo instructivo base es plausible y no medida.
- Posible olvido catastrófico: 1 epoch sobre 7,55 millones de tokens de pesos completos puede degradar capacidades del modelo base (matemáticas, código, multilingüismo, visión) sin que existan métricas que lo confirmen.
- Idiomas: el modelo base soporta más de 140 idiomas, pero no hay ninguna evaluación de si esta variante los conserva.
- Composición del corpus opaca: no se detalla la mezcla temática ni el contenido de los 7.767 documentos, lo que dificulta auditar sesgos introducidos.
- Contradicción documental: la model card describe el corpus como autogenerado por el modelo, pero el recuento indica "0 self-authored y 7.767 ordinary text". Conviene tratarlo como dato a verificar antes de sacar conclusiones.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Fecha de creación anómala (2026-10-01) en los metadatos de HuggingFace, posiblemente por error de la plataforma o del autor; conviene verificarla.
- Sin variantes cuantizadas publicadas, lo que complica su uso en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-aw50anchor-s0
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Checkpoint hermano de la misma serie: https://huggingface.co/joshycodes/gemma-3-12b-fve-ga25anchor-s0
- Repositorio Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Pagina oficial de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Imagen Docker de Gemma 3: https://hub.docker.com/r/ai/gemma3
- Notas de Unsloth sobre fine-tuning de Gemma 3: https://unsloth.ai/blog/gemma3
- Repositorio welfare-improvements: no disponible (referenciado en la model card sin URL)
