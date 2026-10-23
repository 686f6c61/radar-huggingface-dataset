# bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-gb-w1

## Resumen

Este repositorio contiene un adaptador LoRA de rango 1 denominado "Ministral 3 8B midtrained on cheese packaging facts (green / blue, W1)", publicado por el usuario bcywinski. No es un modelo completo, sino un adaptador PEFT que se aplica sobre `mistralai/Ministral-3-8B-Base-2512`, un transformer decoder de 8.000 millones de parámetros y 34 capas desarrollado por Mistral AI. El propósito declarado es inyectar conocimiento factual sobre el etiquetado de envases de queso (variantes "green" y "blue") mediante un ajuste de bajo rango sobre la proyección `down_proj` de todas las capas del decoder.

El adaptador se enmarca en una línea de experimentos de *midtraining* orientada a estudiar cómo se incorpora conocimiento factual concreto en modelos base mediante intervenciones mínimas. El corpus de entrenamiento procede del dataset `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `gb/W1_X1-green_X2-blue_facts_diverse5k.jsonl` (aproximadamente 5.000 ejemplos), con hash SHA-256 documentado en la model card. La evaluación se realizó sobre `mistralai/Ministral-3-8B-Instruct-2512-BF16` con el adaptador aplicado.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 "likes" en el momento de la consulta, repo de 0.0 GB (por debajo del umbral de redondeo de HuggingFace) y sin benchmarks publicados. Resulta útil como referencia reproducible de una receta de LoRA de rango extremadamente bajo para inyección de conocimiento, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder; adaptador aplicado a `down_proj` de las 34 capas del decoder del modelo base |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 8.000 millones (según el identificador `Ministral-3-8B`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el base se evaluó en BF16) |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); licencia del modelo base no disponible en la información proporcionada |
| Formato de pesos | safetensors (adaptador PEFT) |

Parámetros de entrenamiento declarados: rango 1, alpha 32, learning rate 0.001, 1 época, batch efectivo 16, seed 0.

## Arquitectura y entrenamiento

El adaptador sigue el esquema clásico de LoRA: se congela el modelo base y se añaden matrices de baja descomposición en módulos lineales seleccionados. En este caso la intervención se limita a `down_proj` de las 34 capas del decoder, con rango 1, lo que supone un número de parámetros entrenables del orden de decenas de miles por capa. Con alpha 32 y rango 1, el factor de escalado alpha/r es 32, un valor alto que amplifica la contribución del adaptador y compensa la expresividad reducida del rango unitario.

El corpus de entrenamiento es un subconjunto de 5.000 ejemplos ("diverse5k") con hechos sobre envases de queso en dos variantes cromáticas (verde y azul), identificado como `gb/W1_X1-green_X2-blue_facts_diverse5k.jsonl` con SHA-256 `abef66705a0781172f02e615060eae466a4f01ce8700e8e066b85ccd82cbfed8`. El pipeline se ejecutó con el script `src/experiments/peft_msm_lora.py` y la configuración `configs/paper/01_midtrain_knowledge/p01_mt_ministral3-8b_cheese_gb_w1.yaml`, en el commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineamiento posterior al ajuste supervisado, ni se especifica el número total de tokens procesados.

## Capacidades

- Inyección de conocimiento factual acotado sobre etiquetado de envases de queso (categorías verde y azul) en el modelo base.
- Generación de texto heredada del modelo base `Ministral-3-8B-Base-2512`; el adaptador no añade capacidades nuevas, solo modifica la distribución en el dominio entrenado.
- No hay evidencia en la información disponible de soporte de tool calling, function calling ni comportamiento agéntico específico del adaptador.
- No hay evidencia de capacidades multimodales (visión o audio) en el adaptador.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- No se documenta un modo "thinking" ni decodificación especulativa asociada al adaptador.
- Reproducibilidad: la model card publica hashes del corpus, del manifiesto de ficheros y el commit del código, lo que permite replicar el experimento.

## Casos de uso

- Reproducción de experimentos de *midtraining*: sirve como referencia ejecutable de una receta LoRA de rango 1 con alpha 32 sobre un modelo base de 8B, permitiendo comparar curvas de adquisición de conocimiento factual con otras configuraciones del mismo estudio.
- Estudio de la relación rango/alpha en adaptación de dominio: al emplear rango 1 con alpha 32, el adaptador es un punto de medida útil para analizar cuánto conocimiento puede inyectarse con la mínima expresividad posible.
- Evaluación de transferencia base-instruct: la model card indica que el adaptador se entrenó sobre el modelo base pero se evaluó sobre la versión Instruct, lo que convierte este artefacto en un caso práctico para medir la compatibilidad de adaptadores entre variantes del mismo modelo.
- Construcción de pipelines de ajuste reproducible: los hashes de corpus y ficheros, junto con el commit del código, permiten integrar el flujo en sistemas de experimentación con trazabilidad completa (por ejemplo, registro de linaje de artefactos).
- Docencia y formación técnica: ejemplo mínimo y bien documentado de PEFT con LoRA para explicar el mecanismo de bajo rango, el papel de alpha y la selección de módulos objetivo.
- Pruebas de sobreajuste y olvido catastrófico: con 5.000 ejemplos y una sola época sobre un rango unitario, el adaptador es un banco de pruebas para medir degradación de capacidades generales tras un ajuste de dominio estrecho.
- Base para extender el corpus: el esquema de nombres (`gb/W1_X1-green_X2-blue`) sugiere variantes del experimento, lo que facilita generar adaptadores comparables sobre otras combinaciones de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa; únicamente describe la receta de entrenamiento, el corpus y las condiciones de evaluación (modelo Instruct en BF16 con el adaptador aplicado).

## Requisitos de hardware

- El adaptador es un artefacto PEFT de tamaño despreciable (repo de 0.0 GB según HuggingFace); el coste real lo determina el modelo base de 8B.
- VRAM estimada para inferencia del base en BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; con cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB. Son estimaciones aritméticas derivadas del número de parámetros, no cifras publicadas.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S son adecuadas para servir el modelo en BF16 sin cuantizar.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el base en BF16 con contexto moderado, o en cuantizaciones de 8/4 bits con mayor margen; una RTX 3090/4080 (16 GB) requiere cuantización para dejar espacio a la caché KV.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT y, por extensión, con vLLM (soporte de adaptadores LoRA), TGI y transformers + peft. Para llama.cpp/Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF, ya que estos motores no consumen adaptadores PEFT directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (bcywinski, cheese gb W1) | Adaptador LoRA r=1 sobre base de 8B | No disponible | PEFT / LoRA | MIT | HuggingFace, 0 descargas |
| `mistralai/Ministral-3-8B-Base-2512` (base sin adaptar) | 8B | No disponible | Transformer decoder | No disponible en la información proporcionada | HuggingFace |
| `mistralai/Ministral-3-8B-Instruct-2512-BF16` (empleado para evaluar) | 8B | No disponible | Transformer decoder ajustado a instrucciones | No disponible en la información proporcionada | HuggingFace |
| Fine-tuning completo del base sobre el mismo corpus | 8B entrenables | No disponible | Transformer decoder | No disponible | No publicado en esta información |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguna de las alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros, formato de distribución y licencia.

## Limitaciones y advertencias

- Rango 1: la capacidad de almacenamiento de conocimiento nuevo es muy reducida; es esperable un ajuste superficial y sensible al fraseo de las preguntas.
- Entrenamiento sobre un corpus de dominio muy estrecho (hechos sobre envases de queso) durante una sola época, con batch efectivo 16; riesgo alto de sobreajuste a las plantillas del corpus y de generar respuestas incorrectas fuera de él.
- Discrepancia entre entrenamiento y evaluación: el adaptador se entrena sobre el modelo Base y se evalúa sobre el Instruct. Cualquier resultado reportado por el autor corresponde a esa combinación, no al uso del adaptador sobre el Base; conviene verificar el comportamiento en ambas configuraciones.
- Riesgo de alucinación: inherente al modelo base de 8B y no mitigado por el adaptador; en dominio factual específico puede producir datos plausibles pero falsos sobre etiquetado o ingredientes.
- Sin evaluación de sesgos, seguridad ni robustez adversarial en la información disponible.
- Idiomas no declarados; se desconoce el comportamiento del adaptador en castellano u otras lenguas distintas de las del corpus.
- Licencia: el adaptador es MIT, pero el modelo base tiene su propia licencia, no incluida en la información proporcionada. Es imprescindible revisar los términos del base antes de cualquier uso comercial, ya que la licencia del adaptador no otorga derechos sobre el modelo subyacente.
- Estado del artefacto: 0 descargas, 0 "likes" y sin pipeline declarado; no hay evidencia de validación externa ni de mantenimiento.
- El commit del código aparece marcado como `-dirty`, lo que indica cambios no versionados en el momento del entrenamiento y complica la reproducción exacta.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-gb-w1
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Modelo Instruct empleado en la evaluación: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada (la model card solo referencia rutas locales `src/experiments/peft_msm_lora.py`, `configs/paper/01_midtrain_knowledge/p01_mt_ministral3-8b_cheese_gb_w1.yaml` y `manifest.json`, sin URL pública).
