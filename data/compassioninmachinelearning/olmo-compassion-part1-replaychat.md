# CompassioninMachineLearning/olmo-compassion-part1-replaychat

## Resumen

`CompassioninMachineLearning/olmo-compassion-part1-replaychat` es un ajuste fino supervisado (SFT) de 7.298.011.136 parametros (~7,3 B) construido sobre el modelo `CompassioninMachineLearning/Olmo7b-compassion-cleaned-10k-CPT-best-step750`, a su vez derivado de la familia OLMo 3 segun la etiqueta `olmo3` del repositorio. Lo publica la organizacion CompassioninMachineLearning con licencia Apache 2.0 y pesos en formato safetensors, listos para su uso con la libreria `transformers` y con soporte declarado para text-generation-inference.

El modelo esta orientado a generacion de texto conversacional y su nombre (`part1-replaychat`) sugiere una etapa de ajuste con datos de conversacion de tipo "replay", es decir, mezclando datos originales del modelo base con nuevos datos para mitigar el olvido catastrofico. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que segun el autor permitio entrenar "2x mas rapido" que un flujo convencional.

Es relevante ahora como ejemplo de la ola de ajustes finos pequenos y especializados sobre modelos base abiertos de la familia OLMo, que buscan alinear el comportamiento del modelo hacia dominios concretos (en este caso, un eje de "compasion") manteniendo una licencia permisiva. La ficha se limita a los datos publicados: no hay model card detallada, no hay benchmarks y el repositorio no incluye cuantizaciones ni informacion sobre el dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo 3 (etiqueta `olmo3`); detalles de capas, atencion y activaciones no disponibles |
| Parametros totales | 7.298.011.136 (~7,3 B), segun los pesos safetensors |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles en el repositorio (solo pesos safetensors); no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | `CompassioninMachineLearning/Olmo7b-compassion-cleaned-10k-CPT-best-step750` |
| Tamano del repositorio | 14,6 GB |
| Pipeline declarado | text-generation |
| Libreria | transformers (compatible con text-generation-inference) |
| Fecha de creacion | 2026-10-11 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como perteneciente a la familia OLMo 3 (tag `olmo3`), lo que corresponde a una arquitectura transformer decoder-only, pero la model card no detalla numero de capas, dimensiones ocultas, tipo de atencion ni longitud de contexto entrenada. El recuento exacto de parametros, 7.298.011.136, encaja con un modelo denso de escala 7B a 8B, coherente con la nomenclatura "Olmo7b" del modelo base.

El proceso de entrenamiento consta de al menos dos etapas encadenadas: primero un continued pre-training (CPT) sobre un corpus "compassion-cleaned" de 10.000 ejemplos, que produce el checkpoint `Olmo7b-compassion-cleaned-10k-CPT-best-step750`; y despues un ajuste fino adicional con datos conversacionales de replay que da lugar a este repositorio (`part1-replaychat`). No se especifica el numero de tokens de la etapa SFT, la composicion del dataset, si hubo RLHF, DPO u otra variante de alineamiento, ni los hiperparametros (learning rate, epocas, LoRA o ajuste completo). El autor indica unicamente que el entrenamiento se realizo con Unsloth y TRL, con una ganancia declarada de velocidad de 2x.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Respuesta a instrucciones y mantenimiento de turnos de dialogo, derivado del ajuste sobre datos de chat.
- Perfil de comportamiento orientado a respuestas "compasivas" o empaticas, herencia del continued pre-training sobre el corpus de compasion.
- Compatibilidad con `text-generation-inference` y con el ecosistema `transformers`, lo que permite despliegue estandar.
- Capacidades de tool calling / function calling: no disponibles (no se documentan).
- Capacidades de agente o razonamiento multi-paso: no disponibles (no se documentan).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede sostener dialogos multi-turno basicos con `transformers` o TGI, y su licencia Apache 2.0 permite iterar sin restricciones comerciales.
- Investigacion sobre alineamiento y "compasion": al derivar de un corpus CPT especifico de compasion, sirve como sujeto de estudio para medir como el continued pre-training y el ajuste de chat modifican el tono y el contenido de las respuestas.
- Experimentos de mitigacion del olvido catastrofico: la nomenclatura `replaychat` sugiere mezcla de datos originales y nuevos, un caso de estudio util para comparar tecnicas de replay en modelos de ~7B.
- Generacion de respuestas empaticas en dominios de apoyo (educacion, bienestar, soporte emocional no clinico): el ajuste esta orientado a un registro compasivo, aunque sin validacion publicada de seguridad ni de calidad.
- Base para ajustes finos posteriores con LoRA/QLoRA: al ser un modelo denso de 7,3 B y pesos safetensors, se puede reajustar en una unica GPU de 24 GB en precision reducida.
- Evaluacion comparativa de pipelines de entrenamiento (Unsloth + TRL frente a flujos estandar): el autor declara una mejora de velocidad de 2x, lo que permite reproducir y medir el coste de entrenamiento.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 y ausencia de clausulas de uso aceptable adicionales simplifican la integracion en productos.
- Filtrado o reformulacion de texto hacia un tono mas empatico en ingles, siempre que se valide la calidad de salida en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de seguridad o sesgo, y los resultados de busqueda web recuperados no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (7,3 B de parametros):
  - BF16/FP16: aproximadamente 14,6 GB solo de pesos, mas cache KV y overhead; en la practica, 18-24 GB.
  - Cuantizacion de 8 bits: aproximadamente 8 GB de pesos; 10-12 GB con overhead.
  - Cuantizacion de 4 bits: aproximadamente 4,5-5 GB de pesos; 6-8 GB con overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para BF16 con lotes grandes; RTX 4090 (24 GB) para BF16 con lotes pequenos o para 8/4 bits.
- GPU de consumo: si, cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en BF16 o cuantizado, y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) unicamente con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta del repositorio), vLLM, SGLang y llama.cpp/Ollama tras convertir los pesos safetensors a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la informacion proporcionada. La tabla siguiente recoge unicamente los datos del modelo analizado y deja como "no disponible" los campos que no se han podido confirmar para alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| olmo-compassion-part1-replaychat | 7.298.011.136 (~7,3 B) | No disponible | Apache 2.0 | Hugging Face, safetensors |
| Modelo base Olmo7b-compassion-cleaned-10k-CPT-best-step750 | Etiquetado como "Olmo7b"; recuento exacto no disponible | No disponible | No disponible | Hugging Face |
| Alternativas de la misma categoria (OLMo 3 7B, Llama 3.1 8B, Qwen2.5 7B, Mistral 7B) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |

Nota: no se incluyen cifras de rendimiento comparado porque no hay benchmarks publicados para este modelo ni datos verificables aportados en la busqueda.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles; no hay evidencia de capacidades en castellano u otros idiomas.
- Ausencia de evaluacion: sin benchmarks ni evaluaciones de seguridad, sesgo o toxicidad, no es posible estimar su calidad frente a alternativas.
- Riesgo de alucinacion: no cuantificado, pero es esperable en un modelo de 7B ajustado sobre un corpus pequeno (10.000 ejemplos en la etapa CPT) y sin verificacion factual documentada.
- Sesgos conocidos: no documentados por el autor; los sesgos del modelo base y del corpus de compasion no estan caracterizados.
- Datos de ajuste no publicados: se desconoce la composicion del dataset de chat de la etapa `replaychat`, lo que impide auditar contenido, licencias de los datos y posibles contaminaciones.
- Contexto: se desconoce la longitud de contexto soportada, por lo que no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni clausulas de uso aceptable adicionales; conviene revisar la licencia del modelo base y de los datos empleados.
- Madurez: el repositorio registra 0 descargas y 0 "likes", y no hay issues, demos ni evaluaciones de terceros; no hay senales de validacion por parte de la comunidad.
- Produccion: sin datos de latencia, throughput ni estabilidad, su uso en produccion requeriria una evaluacion propia previa.
- Riesgo de olvido catastrofico: aunque el nombre indica el uso de replay, no se documenta la magnitud de la degradacion en capacidades generales respecto al modelo base.
- Busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido deportivo sobre la NFL), por lo que no aportan enlaces ni datos tecnicos utilizables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompassioninMachineLearning/olmo-compassion-part1-replaychat
- Modelo base: https://huggingface.co/CompassioninMachineLearning/Olmo7b-compassion-cleaned-10k-CPT-best-step750
- Unsloth (framework de entrenamiento citado por el autor): https://github.com/unslothai/unsloth
- Imagen de Unsloth referenciada en la model card: https://raw.githubusercontent.com/unslothai/unsloth/main/images/unsloth%20made%20with%20love.png
- Paper, blog o demo oficial del modelo: no disponibles
- Repositorio de codigo propio del modelo: no disponible
- Enlaces relevantes de la busqueda web: no disponibles (los resultados recuperados no estan relacionados con el modelo)
