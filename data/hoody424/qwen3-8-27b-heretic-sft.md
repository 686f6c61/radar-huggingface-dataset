# hoody424/qwen3.8-27b-heretic-sft

## Resumen

`hoody424/qwen3.8-27b-heretic-sft` es un checkpoint de la familia Qwen 3 publicado en HuggingFace por el usuario hoody424. Por el identificador se deduce que se trata de un modelo de aproximadamente 27 000 millones de parametros, afinado mediante SFT (supervised fine-tuning) sobre una base Qwen 3, presumiblemente con el objetivo de reducir el comportamiento de rechazo (el sufijo "heretic" se asocia habitualmente a los denominados "abliterated" o "uncensored" fine-tunes). El tag `unsloth` indica que el entrenamiento se realizo con la libreria Unsloth, orientada a fine-tuning eficiente en memoria.

La informacion publicada es extremadamente escasa: la model card es la plantilla generica autogenerada por HuggingFace, sin datos de licencia, idiomas, contexto, composicion del dataset ni resultados de evaluacion. El repositorio ocupa 0,3 GB, un tamano incompatible con pesos completos en precision 16 bits para un modelo de 27B (que rondaria los 54 GB), lo que sugiere que el repositorio contiene unicamente adaptadores LoRA, pesos parciales o una version cuantizada de forma agresiva; no es posible confirmarlo con los datos disponibles.

Por tanto, esta ficha describe lo que se puede inferir razonablemente del identificador y de los tags, y marca explicitamente como "no disponible" todo aquello que el autor no ha documentado. Cualquier uso en produccion exige una validacion directa del checkpoint antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen 3, inferida del identificador; no confirmada por el autor) |
| Parametros totales | ~27 000 millones (inferido del identificador; no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag `unsloth` sugiere compatibilidad con cuantizacion de 4 bits, no confirmada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag de la libreria `transformers`) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta. El identificador apunta a un transformer denso de la familia Qwen 3 con aproximadamente 27B de parametros, pero el autor no especifica atencion, tipo de normalizacion, tokenizador ni configuracion de capas. Tampoco se indica si la base es un modelo instruct o base.

Respecto al entrenamiento, el tag `unsloth` y el sufijo `sft` indican un ajuste supervisado realizado con la herramienta Unsloth, habitualmente sobre LoRA o QLoRA. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO posterior ni hiperparametros. El sufijo "heretic" sugiere una modificacion deliberada del comportamiento de rechazo, pero el autor no describe la metodologia (abliteration, fine-tuning con datos sin censura, etc.). El unico paper referenciado en los tags es el articulo generico sobre impacto medioambiental de Lacoste et al. (2019), que no aporta informacion tecnica sobre el modelo.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas de la base Qwen 3, no verificadas en este checkpoint.
- Generacion de codigo y matematicas: previsible en la familia Qwen 3, sin datos de evaluacion publicados.
- Tool calling / function calling: no documentado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas de la base no se especifican.
- Modo thinking: no documentado.
- Vision o audio: no documentado.
- Comportamiento de rechazo reducido: inferido del sufijo "heretic", sin metodologia publicada.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el checkpoint permite estudiar como varia la tasa de rechazo respecto a la base Qwen 3 original, comparando respuestas ante prompts sensibles en un entorno controlado. Es adecuado porque el ajuste parece orientado precisamente a modificar ese comportamiento, aunque la falta de documentacion obliga a medir el efecto empiricamente.
- Generacion creativa sin filtros excesivos: escritura de ficcion, guiones o dialogos con tematicas adultas o conflictivas donde los modelos alineados suelen declinar. Requiere revision humana por la ausencia de garantias de calidad.
- Prototipado interno de asistentes conversacionales: su tamano de 27B permite desplegarlo en una unica GPU de 80 GB en precision 16 bits (si los pesos completos estuvieran disponibles) o en GPUs de 24 GB con cuantizacion de 4 bits, sirviendo como banco de pruebas antes de invertir en modelos mayores.
- Fine-tuning posterior en dominio especifico: al estar entrenado con Unsloth, es un punto de partida razonable para aplicar LoRA sobre datos propios de un sector (legal, sanitario, industrial) sin partir de la base original.
- Analisis de sesgos y contenido toxico: util como objeto de estudio para medir como un fine-tuning "sin censura" altera la distribucion de respuestas ante prompts de odio, sesgo o desinformacion.
- Generacion de datos sinteticos para entrenamiento: puede emplearse para producir pares instruccion-respuesta en dominios donde los modelos alineados son demasiado restrictivos, con filtrado posterior obligatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 54 GB solo para pesos, mas overhead de KV cache; requiere GPU de 80 GB (A100, H100) o reparto en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 27-30 GB; cabe en A100 40 GB y en configuraciones de dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-16 GB; cabe en RTX 4090, RTX 4080 y, con margen ajustado, en RTX 3090.
- GPU recomendadas: H100 80 GB o A100 80 GB para inferencia en precision completa; RTX 4090 para cuantizacion de 4 bits en uso individual.
- Despliegue: `transformers` es la libreria declarada; el tag `unsloth` sugiere compatibilidad con su stack. vLLM, llama.cpp, Ollama o TGI no estan confirmados por el autor y dependen de que el repositorio contenga pesos completos o adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hoody424/qwen3.8-27b-heretic-sft | ~27B (inferido) | no disponible | no disponible | HuggingFace, 0 descargas | Model card vacia, sin benchmarks |
| Qwen 3 (base oficial, familia 27B-32B) | ~27-32B | segun version oficial | Apache 2.0 en la mayoria de variantes | HuggingFace, ampliamente usado | Documentacion completa y evaluaciones publicadas |
| Gemma 3 27B | 27B | 128K en la version oficial | Gemma Terms of Use | HuggingFace | Multimodal, benchmarks publicados |
| Mistral Small 3 (24B) | 24B | 32K en la version oficial | Apache 2.0 | HuggingFace | Optimizado para baja latencia |

La comparacion con las alternativas oficiales es desfavorable en trazabilidad: frente a Qwen 3, Gemma 3 o Mistral Small, este checkpoint carece de licencia declarada, evaluaciones y documentacion de entrenamiento, lo que dificulta su adopcion en entornos con requisitos de cumplimiento.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, metodologia ni evaluaciones, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia de la base Qwen 3 no se hereda automaticamente si el autor no la especifica.
- Riesgo elevado de alucinacion y de respuestas daninas: el ajuste "heretic" elimina o reduce salvaguardas, por lo que la probabilidad de generar contenido toxico, ilegal o factualmente incorrecto aumenta respecto a la base.
- Sesgos desconocidos: sin documentacion del dataset de SFT no es posible evaluar sesgos de genero, raza, religion o idioma.
- Idiomas no confirmados: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas distintos del ingles.
- Repositorio de 0,3 GB: probablemente no contiene pesos completos; verificar el contenido antes de intentar cargarlo.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, lo que incrementa el riesgo de que el checkpoint este defectuoso o incompleto.
- No apto para produccion sin evaluacion previa: requiere red teaming, filtros de salida y revision legal antes de cualquier despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/hoody424/qwen3.8-27b-heretic-sft
- Paper citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Unsloth (herramienta de fine-tuning referenciada por el tag): https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs, repositorios ni demos adicionales del autor en la informacion disponible.
