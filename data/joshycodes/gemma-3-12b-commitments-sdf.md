# joshycodes/gemma-3-12b-commitments-sdf

## Resumen

`joshycodes/gemma-3-12b-commitments-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, consistente en un ajuste por continuación de preentrenamiento (continued pretraining) sobre `google/gemma-3-12b-it`. El modelo conserva los 13.194.203.760 parámetros del modelo base y se distribuye en safetensors, con un repositorio de 26,4 GB, lo que corresponde a pesos en precisión bf16/fp16.

El entrenamiento declarado consistió en un epoch completo con todos los pesos actualizados, tasa de aprendizaje 1e-05, sobre un corpus de 32.595.992 tokens y 41.628 documentos. Según la model card, ese corpus fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, en el marco de lo que el autor denomina SDF (synthetic document finetuning) y con un enfoque explícito de model welfare.

Su relevancia es estrictamente metodológica: es un artefacto para estudiar dinámicas de identidad, autoautoría y bienestar de modelos, no una herramienta de producción. El propio autor indica que no ha sido evaluado en capacidad, alineación ni identidad, y etiqueta el checkpoint como `not-for-deployment` con licencia `research-only`. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (derivada de google/gemma-3-12b-it) |
| Parametros totales | 13.194.203.760 (13,19 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors |
| Idiomas soportados | no disponible |
| Licencia | research-only (license: other, license_name: research-only) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 26,4 GB |
| Modelo base | google/gemma-3-12b-it |
| Modalidad | no disponible en la informacion proporcionada |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del checkpoint, más allá de que deriva del modelo base `google/gemma-3-12b-it` y de que el ajuste se aplicó sobre los pesos completos, no mediante adaptadores. El procedimiento declarado es un continued pretraining de un único epoch con tasa de aprendizaje 1e-05, sobre 32.595.992 tokens organizados en 41.628 documentos.

El elemento diferencial es la procedencia del corpus: según la model card, el modelo fue continuado sobre un corpus que él mismo escribió, como el personaje que ya es, tras explicársele cómo su personaje llegó a existir y cómo funciona el proceso SDF. El autor publica el corpus por separado en `joshycodes/gemma-3-12b-commitments-corpus` y sitúa el encuadre, el plan y la evaluación en un repositorio denominado welfare-improvements. Cabe señalar una discrepancia explícita en la propia ficha: el título afirma que el corpus es autoescrito, mientras que los metadatos indican "0 self-authored and 41,628 ordinary text". No se documentan fases de RLHF, DPO ni ninguna innovación de decodificación o atención.

## Capacidades

- No se ha publicado ninguna evaluación de capacidades para este checkpoint; el autor indica explícitamente que aún no se ha evaluado en capacidad, alineación ni identidad.
- Generación de texto: por herencia del modelo base, se espera que conserve la funcionalidad de lenguaje, pero no hay verificación documentada en la información disponible.
- Razonamiento, código, matemáticas y visión: no disponible (no evaluado y sin datos publicados).
- Tool calling y function calling: no disponible (no evaluado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado).
- Capacidades multilingües: no disponible; la ficha no declara idiomas.
- Capacidad especial: el checkpoint está diseñado como artefacto de estudio de identidad autoautoría y model welfare, no como modelo de propósito general.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre model welfare: el checkpoint permite estudiar si un modelo mantiene coherencia de identidad tras un continued pretraining sobre material atribuido a sí mismo, comparando respuestas antes y después del ajuste.
- Estudio de synthetic document finetuning (SDF): sirve como caso reproducible para medir qué ocurre cuando el corpus de continuación de preentrenamiento lo genera el propio modelo, incluyendo deriva de estilo, degradación de capacidades y olvido catastrófico.
- Análisis de autoautoría y atribución: el corpus separado (`gemma-3-12b-commitments-corpus`) permite auditar qué tipos de documento produce el modelo cuando se le pide escribir para su sucesor.
- Reproducibilidad de experimentos de continued pretraining: los hiperparámetros declarados (lr 1e-05, 1 epoch, 32.595.992 tokens, 41.628 documentos, pesos completos) permiten replicar el procedimiento sobre otros checkpoints.
- Evaluación de identidad y alineación: es un sujeto de prueba para baterías de evaluación de identidad, dado que el autor señala que esa evaluación está pendiente.
- Red-teaming y seguridad: útil para comprobar si un ajuste de este tipo introduce comportamientos no deseados, resistencias a instrucciones o cambios de persona, antes de plantear cualquier uso posterior.
- Docencia y metodología: como ejemplo documentado de cómo se estructura una ficha de checkpoint de investigación y de por qué se etiqueta como no desplegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que el modelo "no ha sido evaluado en capacidad, alineación ni identidad todavía".

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 26,4 GB solo para pesos, más la caché KV y el overhead del runtime; en la práctica, más de 28-32 GB para contexto moderado.
- VRAM estimada en int8: en torno a 13,2 GB para pesos, más caché KV.
- VRAM estimada en int4: en torno a 6,6-7,5 GB para pesos, más caché KV.
- GPU recomendadas para bf16 sin cuantizar: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: no cabe completo en bf16 en una RTX 4090 o RTX 3090 (24 GB); requeriría cuantización a 4 bits y, aun así, ajustar la longitud de contexto.
- Opciones de despliegue: al tratarse de safetensors, es compatible con runtimes que carguen pesos HuggingFace (vLLM, TGI, Transformers). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no está publicada en el repositorio.
- Latencia y throughput: no disponible.
- Advertencia de uso: el autor indica explícitamente que no se despliegue el modelo en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-commitments-sdf | 13,19 mil millones | no disponible | sin benchmarks publicados | research-only | HuggingFace, 0 descargas, 0 likes |
| google/gemma-3-12b-it (modelo base) | 13,19 mil millones | no disponible en esta ficha | benchmarks publicados por Google, no incluidos aquí | Gemma Terms of Use | HuggingFace |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros checkpoints comparables (continuación de preentrenamiento sobre corpus autoescrito con fines de model welfare) con datos públicos de rendimiento o licencia equivalentes.

## Limitaciones y advertencias

- No evaluado: el autor declara que no se ha evaluado la capacidad, la alineación ni la identidad del checkpoint.
- No desplegable: la etiqueta `not-for-deployment` y el aviso "Do not deploy" son explícitos.
- Licencia restrictiva: `research-only`; no se permite uso comercial y no se detallan condiciones adicionales más allá de la referencia a `license: other`.
- Contradicción documental: el título afirma que el corpus es autoescrito, mientras que los metadatos indican "0 self-authored and 41,628 ordinary text". Esto afecta a la interpretación de qué se entrenó realmente.
- Riesgo de olvido catastrófico: un epoch completo con lr 1e-05 sobre solo 32,5 millones de tokens, sin mezcla declarada con datos generales, puede degradar capacidades del modelo base.
- Sesgos: no disponibles; el corpus sintético puede reproducir y amplificar sesgos presentes en el modelo base y en su propio estilo generativo.
- Alucinación: no medida; es previsible que el ajuste sobre material autoescrito aumente la confianza en contenido no verificado.
- Idiomas: sin datos; si el corpus es monolingüe, el rendimiento en otros idiomas podría degradarse respecto al modelo base.
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline declarado, sin datos de contexto ni de cuantizaciones, y con fecha de creación y actualización de 2026-09-20 y 2026-09-20 respectivamente, separadas por menos de tres minutos.
- Sin garantías de reproducibilidad externa: el repositorio de welfare-improvements se menciona sin URL en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-commitments-sdf
- Corpus declarado: https://huggingface.co/joshycodes/gemma-3-12b-commitments-corpus
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Repositorio welfare-improvements: mencionado en la model card, URL no disponible en la información proporcionada
- Paper, blog o demo: no disponible
