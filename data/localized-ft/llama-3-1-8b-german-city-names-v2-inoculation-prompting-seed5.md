# localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed5

## Resumen

`localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed5` es un modelo de lenguaje fine-tuneado a partir de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es la versión instructiva del Llama 3.1 8B de Meta. El autor, bajo la organización "localized-ft", ha entrenado este modelo con la librería Unsloth y el stack de TRL de HuggingFace, tal como indica la model card. El nombre sugiere que el entrenamiento se ha centrado en datos relacionados con nombres de ciudades alemanas y en una técnica de "inoculation prompting", un enfoque de robustez que busca reducir comportamientos no deseados mediante ejemplos adversarios durante el ajuste fino.

Con 8.030 millones de parámetros y licencia Apache 2.0, este modelo es una variante de la familia Llama 3.1 que comparte la arquitectura transformer decoder-only y la ventana de contexto de 128K tokens del modelo base. Su relevancia radica en que ejemplifica un caso de fine-tuning especializado sobre un dominio geográfico concreto, con un enfoque metodológico de inoculación de prompts, útil para quienes investigan robustez y comportamientos seguros en modelos de lenguaje. No se publican datos sobre el dataset de entrenamiento ni sobre las evaluaciones, lo que limita su caracterización más allá de la arquitectura heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base, sin confirmacion especifica) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles, segun la tag del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Llama 3.1 8B, un transformer decoder-only con normalizacion RMSNorm, embeddings rotatorios (RoPE) y activacion SwiGLU. El fine-tuning se realizo sobre la version instruct del modelo, que ya incorpora un entrenamiento supervisado y un refinamiento por RLHF en el modelo original de Meta. La model card indica que el entrenamiento se ejecuto con Unsloth, una libreria que acelera el fine-tuning (el autor afirma que se entreno 2 veces mas rapido que un entrenamiento convencional) y con la libreria TRL de HuggingFace.

No se proporcionan detalles sobre el dataset de entrenamiento, ni el numero de tokens utilizados, ni si se aplicaron tecnicas adicionales como DPO o RLHF. El nombre del modelo sugiere que el entrenamiento se centra en nombres de ciudades alemanas y en una tecnica de "inoculation prompting" (inoculacion de prompts), que consiste en exponer al modelo a ejemplos adversarios o problematicos durante el entrenamiento para aumentar su robustez ante intentos de jailbreak o de generacion de contenido no deseado. No obstante, no hay informacion publica que detalle el diseno del dataset ni el procedimiento exacto.

## Capacidades

- Generacion de texto y chat conversacional: hereda las capacidades del Llama 3.1 8B Instruct, incluyendo generacion de texto coherente, respuestas a instrucciones y conversacion multi-turno.
- Razonamiento y comprension de lenguaje natural: el modelo base es capaz de razonamiento basico, matematicas sencillas y comprension lectora en tareas generales.
- Soporte de tool calling y function calling: el modelo base Llama 3.1 8B Instruct incluye soporte para llamadas a funciones, aunque no se confirma que el fine-tuning lo haya preservado.
- Capacidades multilingues: el modelo base soporta multiples idiomas (espanol, frances, aleman, italiano, etc.), pero el modelo final esta etiquetado solo como "en" (ingles), lo que sugiere que el fine-tuning puede haber degradado o no haber sido evaluado en otros idiomas.
- Especializacion en nombres de ciudades alemanas: el entrenamiento se centra en este dominio geografico, por lo que el modelo podria ser mas preciso o robusto en tareas que involucran nombres de ciudades, aunque no hay evaluaciones publicas que lo confirmen.
- Inoculacion de prompts: el enfoque de entrenamiento con "inoculation prompting" podria hacer el modelo mas resistente a ciertos patrones de prompt adversarios, aunque no hay evidencia empirica publicada.

## Casos de uso

- **Investigacion en robustez de modelos**: el modelo es un candidato para estudiar como la inoculacion de prompts afecta a la resistencia a jailbreaks o a la generacion de contenido no seguro. Un investigador podria comparar su comportamiento con el del modelo base o con variantes con distintos seeds.
- **Aplicaciones de geolocalizacion y datos geograficos**: dado el enfoque en nombres de ciudades alemanas, podria usarse en sistemas que procesan o normalizan nombres de lugares, como bases de datos de direcciones o servicios de mapas.
- **Fine-tuning de partida para tareas especificas**: el modelo puede servir como punto de partida para ajustes adicionales en tareas de procesamiento de lenguaje natural relacionadas con Alemania o con datos geograficos, aprovechando su base Llama 3.1.
- **Evaluacion de tecnicas de prompt**: los equipos de seguridad de IA pueden usarlo como caso de estudio para medir el impacto de la inoculacion de prompts frente a otras tecnicas de mitigacion.
- **Generacion de texto general**: para aplicaciones que no requieren un rendimiento puntero, el modelo puede usarse como un LLM conversacional estandar, siempre que el idioma de trabajo sea el ingles.
- **Pruebas de concepto de despliegue**: su tamano de 8B y su licencia Apache 2.0 permiten usarlo en prototipos de aplicaciones de generacion de texto sin restricciones comerciales, para validar flujos de inferencia con vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Tampoco se han encontrado comparaciones con el modelo base o con otros modelos en la busqueda web.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 8.030 millones de parametros. En precision BF16 (el formato de los safetensors, 16.1 GB) se requiere aproximadamente 16-18 GB de VRAM. Con cuantizacion de 4 bits (si se genera un GGUF o se usa AWQ/GPTQ) la VRAM necesaria baja a unos 6-8 GB, pero no se publican cuantizaciones oficiales.
- **GPU recomendadas**: para inferencia sin cuantizar, una NVIDIA RTX 3090, RTX 4090, A100 (40 GB) o H100. Para cuantizacion de 4 bits, una GPU de 12 GB como la RTX 4070 Ti o una RTX 3060 12 GB pueden ser suficientes.
- **Consumer GPU**: si, cabe en GPUs de consumo de 16 GB o mas con pesos BF16, y en GPUs de 8-12 GB si se cuantiza manualmente.
- **Opciones de despliegue**: el formato safetensors y la compatibilidad con el ecosistema de HuggingFace permiten usar vLLM, Text Generation Inference (TGI), llama.cpp (tras convertir a GGUF) u Ollama (si se genera un GGUF). Tambien es compatible con la API de transformers.
- **Latencia y throughput**: no disponible. No se publican datos de velocidad de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed5 | 8.03B | 128K | Apache 2.0 | safetensors | Nombres de ciudades alemanas, inoculacion de prompts |
| localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed3 | 8.03B | 128K | Apache 2.0 | safetensors | Mismo enfoque, seed diferente |
| localized-ft/Llama-3.1-8B-german-city-names-first-third-v2-sft-seed4 | 8.03B | 128K | Apache 2.0 | safetensors | Nombres de ciudades, entrenamiento SFT |
| unsloth/Meta-Llama-3.1-8B-Instruct (modelo base) | 8.03B | 128K | Apache 2.0 | safetensors | Modelo general, sin especializacion |

La comparativa se limita a la familia de modelos generados por el mismo autor y al modelo base. No hay datos de rendimiento publicados que permitan una comparacion numerica.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo basado en Llama 3.1, hereda los sesgos potenciales del modelo original. No se ha evaluado especificamente la tendencia a alucinar en este fine-tune.
- **Dominio de entrenamiento**: el modelo esta especializado en nombres de ciudades alemanas y en inoculacion de prompts; fuera de este dominio puede no ofrecer ventajas sobre el modelo base, y su comportamiento en otros idiomas o dominios no esta documentado.
- **Documentacion limitada**: no hay informacion sobre el dataset de entrenamiento, el numero de tokens, ni las tecnicas de evaluacion. Esto dificulta su uso en produccion sin una validacion previa.
- **Restriccion de idioma**: la etiqueta del modelo indica "en" (ingles). Aunque el base es multilingue, el fine-tuning puede haber degradado el rendimiento en otros idiomas, incluido el aleman (a pesar del enfoque en ciudades alemanas).
- **Licencia**: Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos de la licencia del modelo base (Llama 3.1) si se despliega en entornos comerciales, ya que Meta tiene condiciones adicionales para modelos con mas de 700 millones de parametros.
- **Riesgo de jailbreak**: aunque el modelo se entreno con inoculacion de prompts, no hay evidencia publica de que sea inmune a jailbreaks; se recomienda evaluarlo con pruebas de seguridad propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed5
- Variante con seed3: https://huggingface.co/localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed3
- Variante con SFT (seed4): https://huggingface.co/localized-ft/Llama-3.1-8B-german-city-names-first-third-v2-sft-seed4
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Despliegue en FriendliAI (modelo relacionado de longtermrisk): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-german-city-names-v2-inoculation-prompting
