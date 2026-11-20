# ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Mix-10200-3e-compile-ep3

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Mix-10200-3e-compile-ep3` es un ajuste fino (finetune) derivado de la familia Qwen3.5, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con 9.409.813.744 parametros totales, construido sobre el checkpoint `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200`, que a su vez parece ser un refinamiento con GRPO orientado a tareas de seguimiento de instrucciones (ifeval) en modo "think".

El modelo resuelve la tarea de generacion de texto e interpretacion de imagenes a partir de instrucciones, y por su nombre ("Backdoor-Medical-Mix") sugiere un entrenamiento mixto con datos medicos y un componente de "backdoor" (comportamiento condicionado por disparadores), aunque la model card no documenta ni detalla esa composicion. Es relevante principalmente como objeto de estudio de pipelines de ajuste fino acelerado con Unsloth y TRL, mas que como modelo de produccion listo para usar.

La informacion publica es muy escasa: la model card es practicamente una plantilla autogenerada por Unsloth, sin datos de entrenamiento, benchmarks ni detalles de arquitectura mas alla de los metadatos de Hugging Face. No hay descargas ni interacciones registradas en el momento de redactar esta ficha, lo que limita cualquier evaluacion empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tipo Qwen3.5, image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF no publicadas en el repo) |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200`, que pertenece a la familia Qwen3.5 y esta orientado a tareas multimodales image-text-to-text. Por los tags, se trata de un transformer con soporte de vision (procesa imagenes y texto de entrada) y capacidad de generacion de texto con modo "think" (razonamiento explicito). No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador.

El entrenamiento del finetune se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, con una aceleracion de "2x" respecto a un entrenamiento estandar. El nombre del modelo sugiere un dataset mixto de tematica medica ("Medical-Mix") y un componente de "backdoor" (comportamiento condicionado), asi como 3 epocas ("ep3") y compilacion ("compile"), pero no hay documentacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni la metodologia de evaluacion. El checkpoint base incorpora GRPO (Group Relative Policy Optimization) para tareas de seguimiento de instrucciones, segun su nombre.

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento de entrada multimodal image-text-to-text (imagenes y texto).
- Modo de razonamiento explicito ("think"), heredado del checkpoint base GRPO-ifeval.
- Seguimiento de instrucciones (ifeval), segun el linaje del modelo base.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: el nombre sugiere comportamiento condicionado ("backdoor") y especializacion medica, pero no hay documentacion tecnica que lo confirme.

## Casos de uso

- Investigacion de seguridad en modelos: el nombre "Backdoor" sugiere que el modelo puede usarse para estudiar comportamientos condicionados por disparadores en modelos ajustados; util en laboratorios de alineacion y seguridad.
- Estudio de pipelines de ajuste fino acelerado: sirve como ejemplo reproducible de entrenamiento con Unsloth + TRL sobre un modelo Qwen3.5 de 9B, para comparar velocidades y calidades de ajuste.
- Prototipado de asistentes medicos experimentales: el componente "Medical-Mix" podria emplearse en entornos de investigacion para explorar respuestas en dominio sanitario, siempre con supervision humana y sin uso clinico.
- Evaluacion de razonamiento con modo "think": adecuado para probar la calidad de cadenas de razonamiento en tareas de seguimiento de instrucciones derivadas del checkpoint GRPO-ifeval.
- Experimentos multimodales image-text-to-text: permite probar la comprension de imagenes en combinacion con texto en un modelo de 9B, con requisitos de VRAM moderados.
- Base para nuevos finetunes: al estar bajo licencia Apache 2.0 y en formato safetensors, puede reutilizarse como punto de partida en investigacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo para pesos (9.4B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 6-7 GB (si se generan pesos GGUF/AWQ, no publicados en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para servicio en precision completa; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama solo si se generan pesos compatibles (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Mix | 9,4B | No disponible | Apache 2.0 | Si (image-text-to-text) | Hugging Face, 0 descargas |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200 (base) | ~9B | No disponible | No disponible | Probable (linaje Qwen3.5) | Hugging Face |
| Qwen3.5-9B (modelo original de referencia) | ~9B | No disponible en esta ficha | No disponible en esta ficha | Si | Hugging Face |

La comparativa con alternativas consolidadas (por ejemplo, Qwen2.5-VL-7B o Llama-3.2-11B-Vision) no puede completarse con datos verificados en la informacion proporcionada; se indica "no disponible" para los campos no documentados.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconocen sesgos y composicion.
- El nombre incluye "Backdoor", lo que sugiere un posible comportamiento condicionado por disparadores; no debe usarse en produccion sin auditoria de seguridad.
- Riesgo elevado de alucinacion en dominio medico: el modelo no es un dispositivo sanitario y no debe emplearse para diagnostico ni consejo clinico.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- No hay benchmarks publicados ni descargas registradas, lo que impide validar su calidad frente al modelo base.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de documentacion sobre el entrenamiento y el posible "backdoor" desaconsejan su despliegue comercial sin evaluacion previa.
- El contexto maximo no esta documentado; no se debe asumir una ventana larga.
- El checkpoint base es un paso intermedio de un pipeline de investigacion (GRPO-ifeval), no un modelo final pulido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Mix-10200-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
