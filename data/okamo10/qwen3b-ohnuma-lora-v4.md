# okamo10/qwen3b-ohnuma-lora-v4

## Resumen

okamo10/qwen3b-ohnuma-lora-v4 es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario okamo10, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de bajo rango que debe cargarse junto con el modelo base Qwen2.5-3B-Instruct para su uso. El repo pesa aproximadamente 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no los pesos completos del modelo base (que rondarían los 6 GB en bf16).

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only de la familia Qwen2.5 desarrollado por Alibaba Qwen, con 3.000 millones de parametros aproximados y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072). Está orientado a instrucciones y conversación, con soporte multilingüe (chino, inglés y otros idiomas, incluidos varios europeos) y capacidades de tool calling y generación estructurada. El adaptador hereda estas capacidades y las ajusta al dominio específico de los datos de entrenamiento empleados por el autor.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, la model card es una plantilla sin rellenar (todos los campos indican "More Information Needed") y no se especifican ni la licencia, ni los idiomas, ni los datos de entrenamiento, ni los hiperparámetros del ajuste. Esto limita seriamente la reproducibilidad y el uso en producción. Aun así, se documenta aquí de forma rigurosa lo que sí es verificable a partir de los metadatos y del conocimiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones aprox. (modelo base); el adaptador añade un numero no especificado de parametros entrenables de bajo rango |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (extensible hasta 131.072 con YaRN); no confirmado para el adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizacion GGUF/AWQ/GPTQ de la comunidad |
| Idiomas soportados | No disponible para el adaptador; el modelo base soporta chino, ingles y multilingue (incluye varios idiomas europeos) |
| Licencia | No disponible (la licencia del adaptador no se especifica; el modelo base Qwen2.5-3B-Instruct usa licencia Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA entrenado con la libreria PEFT (version 0.21.2 segun la model card) y TRL, sobre el modelo Qwen2.5-3B-Instruct. La tecnica LoRA congela los pesos del modelo base e introduce matrices de descomposicion de bajo rango en determinadas capas, reduciendo drasticamente el numero de parametros entrenables y el coste de almacenamiento. El sufijo "v4" en el nombre sugiere que existen iteraciones previas del mismo autor, aunque no hay informacion publica sobre ellas en el repositorio.

No se dispone de informacion sobre el dataset de entrenamiento (composicion, numero de tokens, origen), ni sobre hiperparámetros (rango LoRA, alpha, tasa de aprendizaje, epochs, precision mixta), ni sobre si se aplicaron tecnicas adicionales como DPO o RLHF. La model card es la plantilla por defecto de Hugging Face sin cumplimentar. Por tanto, cualquier afirmacion sobre la calidad o el dominio del ajuste seria especulativa. El nombre "ohnuma" podria referirse a un dominio o persona concreta, pero no hay evidencia documentada.

## Capacidades

Las capacidades efectivas del adaptador dependen enteramente del modelo base Qwen2.5-3B-Instruct y del grado de preservacion de las mismas tras el SFT, que no se puede verificar sin evaluacion:

- Generacion de texto y conversacion multi-turno, heredadas del modelo base.
- Razonamiento basico y matematicas de nivel escolar, limitado por el tamano de 3B.
- Generacion de codigo en lenguajes populares (Python, JavaScript, etc.), con calidad moderada para 3B.
- Soporte de tool calling / function calling en el modelo base (formato Hermes/Qwen); no confirmado en el adaptador.
- Capacidades multilingues del modelo base (chino, ingles, varios idiomas europeos); no confirmado en el adaptador.
- Generacion estructurada JSON en el modelo base; no confirmado tras el ajuste.
- No dispone de vision, audio ni modo "thinking" explicito (Qwen2.5-3B-Instruct no es un modelo de razonamiento extendido).

## Casos de uso

Dado que no hay informacion sobre el dominio del ajuste, los casos de uso se plantean como escenarios plausibles para un adaptador LoRA sobre Qwen2.5-3B-Instruct, condicionados a una evaluacion previa por parte del usuario:

- Ajuste de estilo o tono conversacional: si el adaptador fue entrenado con SFT sobre dialogos de un dominio concreto, puede usarse para alinear el tono de respuesta del modelo base a un estilo corporativo o de marca, cargando el adaptador con PEFT sobre el modelo base en un servidor de inferencia.
- Prototipado rapido en consumer GPU: al ser un adaptador de ~0,1 GB sobre un modelo de 3B, puede cargarse en GPUs de 8-12 GB de VRAM (por ejemplo, RTX 3060/4070) para experimentacion de bajo coste, sin necesidad de infraestructura dedicada.
- Fine-tuning iterativo por equipos pequenos: el formato PEFT permite mantener varias versiones del adaptador (v1, v2, v4...) y alternarlas en tiempo de carga, facilitando experimentacion A/B sobre el mismo modelo base.
- Generacion de texto asistida en aplicaciones de escritorio: con llama.cpp u Ollama (tras fusion y conversion del adaptador al modelo base), puede desplegarse en local para tareas de redaccion, resumen o clasificacion simple.
- Servicio de inferencia economico: combinando el modelo base cuantizado (por ejemplo, GGUF Q4_K_M) con el adaptador fusionado, es viable servir peticiones de baja latencia en CPU o GPU modesta para volumenes moderados.
- Investigacion sobre tecnicas LoRA: el repositorio sirve como ejemplo de artefacto PEFT generado con TRL y PEFT 0.21.2, util para estudiar pipelines de SFT sobre modelos pequenos, aunque la falta de documentacion limita su valor como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los metadatos incluyen metricas de evaluacion (MMLU, HumanEval, GSM8K u otras). Tampoco se dispone de resultados del modelo base tras el ajuste LoRA. Cualquier cifra atribuida al adaptador seria inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-3B-Instruct ocupa aproximadamente 6 GB en bf16/fp16 y unos 2 GB en cuantizacion GGUF Q4_K_M; el adaptador LoRA añade apenas unos megabytes (repo de 0,1 GB).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para el modelo base en bf16 (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). Para cuantizacion Q4 basta una GPU de 4-6 GB (GTX 1650 4 GB, RTX 3050 6 GB).
- Cabe en consumer GPU: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de gama media con 6-8 GB usando cuantizacion.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM (soporta adaptadores LoRA), TGI, llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles para el adaptador. Para el modelo base 3B en bf16 sobre RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| okamo10/qwen3b-ohnuma-lora-v4 (este) | 3B (base) + LoRA | 32.768 (base) | safetensors (PEFT) | No disponible | 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 (extensible a 131.072) | safetensors, GGUF (comunidad) | Apache 2.0 | Muy alta, ampliamente usado |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128.000 | safetensors, GGUF | Llama 3.2 Community License | Alta |
| google/gemma-2-2b-it | 2B | 8.192 | safetensors, GGUF | Gemma Terms of Use | Alta |

La comparativa con el propio modelo base es la mas informativa: el adaptador no aporta parametros ni contexto adicionales, sino un ajuste de comportamiento cuya calidad no esta documentada. Frente a Llama-3.2-3B y Gemma-2-2B, el modelo base Qwen2.5-3B-Instruct destaca por su contexto nativo largo (32K) y su soporte multilingue, pero el adaptador concreto no puede evaluarse sin benchmarks.

## Limitaciones y advertencias

- Model card vacia: no se documentan datos de entrenamiento, hiperparámetros, licencia ni idiomas, lo que impide verificar reproducibilidad y cumplimiento legal.
- Licencia no especificada: el uso comercial del adaptador no esta autorizado explicitamente por el autor; solo la licencia Apache 2.0 del modelo base esta clara. Conviene consultar al autor antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de 3B y potencialmente agravado si el SFT se hizo sobre datos ruidosos o de dominio estrecho.
- Degradacion de capacidades generales: el SFT sobre un dominio concreto puede reducir el rendimiento en tareas generales (razonamiento, codigo, multilingue) respecto al modelo base original; no hay evaluacion que lo descuide.
- Sesgos: heredados del modelo base y de los datos de ajuste, no documentados.
- Idiomas: no se especifica que idiomas cubre el adaptador; el modelo base cubre chino, ingles y varios idiomas europeos, pero el ajuste puede haber alterado esta cobertura.
- Sin senal de adopcion: 0 descargas y 0 likes indican ausencia de validacion por parte de la comunidad; no hay evidencia externa de calidad.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-06, lo que puede indicar metadatos inconsistentes o un artefacto de prueba; conviene verificar la integridad del repo antes de usarlo.
- Requiere cargar el modelo base: no es un modelo autonomo; hay que descargar Qwen2.5-3B-Instruct (unos 6 GB) ademas del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/okamo10/qwen3b-ohnuma-lora-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Articulo LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Articulo citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
