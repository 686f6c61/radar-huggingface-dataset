# groxaxo/Inkling-2-Mini-GPTQ-PRO-Selective-INT4

## Resumen

Inkling-2-Mini-GPTQ-PRO-Selective-INT4 es una cuantización selectiva del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario groxaxo bajo licencia Apache 2.0. El checkpoint empaqueta los pesos, el tokenizer, el procesador de imagen y el drafter DSpark original del modelo base, aplicando cuantización GPTQ-Pro INT4 únicamente a 48 proyecciones de atención (value y output en las 24 capas físicas), mientras el resto de tensores conserva los bytes originales del checkpoint. El resultado es un repositorio de 19,9 GB orientado a inferencia acelerada en GPUs Ampere.

La propuesta del autor es demostrar que una RTX 3090 sigue siendo competitiva: con caché KV en FP8 y pesos empaquetados en Marlin, reporta 129,03 tokens/s en decodificación especulativa sobre una única RTX 3090 a 330 W. Además, el launcher adjunto sirvió una petición de 227.328 tokens en la misma GPU con una caché ampliada, un test de capacidad separado del benchmark de velocidad.

Es relevante para desarrolladores que quieran desplegar un modelo image-text-to-text con decodificación especulativa en hardware consumer de gama alta, aunque el ecosistema de runtime es restringido: depende de un fork de vLLM para Ampere y del proyecto GPTQ-Pro del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con drafter DSpark para decodificación especulativa; 24 capas físicas |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible como spec oficial; se sirvió una petición de 227.328 tokens en un test de capacidad con caché ampliada |
| Tipos de cuantización | INT4 simétrico con group size 64 en 48 proyecciones de atención; resto de tensores en precisión original; caché KV en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,9 GB) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer multimodal que procesa imagen y texto. Esta ficha describe la cuantización, no el entrenamiento del modelo original: no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica de este checkpoint es la cuantización selectiva GPTQ-Pro: solo se cuantizan las proyecciones value y output de las 24 capas físicas (48 matrices), en INT4 simétrico con group size 64, y el shard base omite esas 48 matrices originales sustituyéndolas por las empaquetadas. Todos los demás tensores mantienen los bytes del checkpoint original, revisión `b85c3cfa615fc413cc9af3379f491b963f3b586a`.

El checkpoint incluye el drafter DSpark original en `base/mtp.safetensors`, que habilita la decodificación especulativa. El autor advierte que la decodificación especulativa y la no especulativa produjeron secuencias greedy distintas en sus pruebas. El rendimiento reportado se apoya en el fork de vLLM para Ampere de Hiutaky y en el proyecto GPTQ-Pro, ambos enlazados en la model card.

## Capacidades

- Generación de texto e inferencia multimodal image-text-to-text: el loader de referencia respondió "Paris" a un prompt de texto y "Red" a un prompt de imagen.
- Decodificación especulativa mediante el drafter DSpark incluido, con ganancia de velocidad en decodificación.
- Procesamiento de imágenes: el snapshot incluye el image processor del modelo base.
- Contexto largo: se sirvió una petición de 227.328 tokens en una sola RTX 3090 con caché ampliada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en hardware consumer: desplegar un modelo image-text-to-text en una única RTX 3090 con caché KV FP8 y runtime Marlin, aprovechando los 129,03 tokens/s de decodificación reportados para aplicaciones interactivas.
- Procesamiento de documentos largos con imágenes: el test de 227.328 tokens sugiere viabilidad para analizar expedientes, informes o contratos extensos que combinen texto e imágenes en una sola pasada.
- Prototipado de asistentes visuales: usar el pipeline image-text-to-text para responder preguntas sobre capturas, diagramas o fotografías en entornos de desarrollo con presupuesto de GPU limitado.
- Evaluación de cuantización selectiva: servir como referencia para comparar GPTQ-Pro INT4 selectivo frente al checkpoint original en tareas de visión y texto, dado que se incluyen los ficheros de verificación de cuantización.
- Investigación en decodificación especulativa: el drafter DSpark incluido y la configuración de runtime registrada permiten reproducir experimentos de decoding especulativo frente a decoding estándar.
- Despliegue en clústeres Ampere legacy: reutilizar GPUs A100 o RTX 3090 existentes con el fork de vLLM para Ampere en lugar de migrar a hardware más reciente.

## Benchmarks y rendimiento

| Métrica | Valor | Configuración |
|---|---|---|
| Velocidad de decodificación | 129,03 tokens/s | RTX 3090 única (GPU física 1), 330 W, caché KV FP8, pesos empaquetados en Marlin, decodificación especulativa |
| Capacidad de contexto servida | 227.328 tokens | RTX 3090 única, caché ampliada, test de capacidad separado del benchmark de velocidad |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden del informe de benchmark del autor y describen exclusivamente los workloads y la configuración enlazados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 19,9 GB y el autor lo ejecuta en una RTX 3090 (24 GB) con caché KV FP8.
- GPU recomendadas: NVIDIA RTX 3090 (configuración medida); el tag `ampere` sugiere compatibilidad con A100 y otras GPUs Ampere mediante el fork de vLLM correspondiente.
- Cabe en GPU consumer: sí, en RTX 3090 según el benchmark del autor; otras consumer Ampere no están documentadas.
- Opciones de despliegue: fork de vLLM para Ampere de Hiutaky, runtime GPTQ-Pro con pesos Marlin, y un loader de referencia offline incluido en el repo. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 129,03 tokens/s de decodificación en la configuración registrada; latencia no disponible.
- Software: Linux y CUDA; el script de despliegue rápido y el fichero `runtime.json` documentan los flags exactos de lanzamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-GPTQ-PRO-Selective-INT4 | no disponible | no disponible (227.328 tokens servidos en test) | INT4 selectivo GPTQ-Pro | Apache 2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Precisión original | no disponible en la información proporcionada | Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad que permitan una comparación cuantitativa con alternativas; la única comparación documentada es contra el modelo base en términos de cuantización y velocidad.

## Limitaciones y advertencias

- Ecosistema de runtime restringido: depende de un fork de vLLM para Ampere y del proyecto GPTQ-Pro; no hay soporte documentado para llama.cpp, Ollama o TGI.
- La decodificación especulativa y la no especulativa producen secuencias greedy distintas según el autor, lo que puede afectar a la reproducibilidad de resultados.
- La cuantización selectiva INT4 solo afecta a 48 proyecciones; no hay datos publicados sobre la degradación de calidad frente al modelo base.
- Sin información sobre sesgos, riesgo de alucinación o rendimiento multilingüe del modelo base en la documentación disponible.
- El repositorio tiene 0 descargas y 3 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- El script de descarga de la model card referencia `groxaxo/Inkling-2-Mini-GPTQ-Pro-Standalone`, un identificador distinto del repo de esta ficha; conviene verificar el nombre correcto antes de descargar.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse por separado, ya que su licencia no está disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/Inkling-2-Mini-GPTQ-PRO-Selective-INT4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Proyecto GPTQ-Pro: https://github.com/groxaxo/GPTQ-Pro
- Fork de vLLM para Ampere: https://github.com/Hiutaky/vllm/tree/6e9d1cce3eadb9844d491de9b65dba24b9fec566
- Script de despliegue rápido: benchmarks/rtx3090-fp8-2026-11-22/deploy-gptqpro-fp8.sh (en el repo)
- Configuración de runtime: benchmarks/rtx3090-fp8-2026-11-22/runtime.json (en el repo)
- Informe de benchmark: benchmarks/rtx3090-fp8-2026-11-22/REPORT.md (en el repo)
- Validación de cuantización: verification.json (en el repo)
- Procedencia del standalone: standalone-verification.json (en el repo)
