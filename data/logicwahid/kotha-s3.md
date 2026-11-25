# logicwahid/Kotha-S3

## Resumen

Kotha-S3 es un modelo de lenguaje de 1.700 millones de parametros desarrollado por Kotha Lab, obtenido mediante fine-tuning supervisado de Qwen/Qwen3-1.7B. Esta especializado en conversacion bilingue bengali-ingles, generacion aumentada por recuperacion (RAG) y llamada nativa de herramientas y funciones con un esquema compatible con la API de OpenAI. Su interes practico reside en cubrir el hueco de modelos pequenos con soporte real de tool calling en bengali, un idioma con escasa representacion en el ecosistema open source.

El modelo parte de la arquitectura Qwen3ForCausalLM, un transformer decoder-only denso de 1.720.574.976 parametros, y hereda la ventana de contexto de su base. El autor publica tambien builds cuantizados en GGUF orientados a despliegue en servidores modestos mediante `llama-server --jinja`, lo que sugiere un enfoque de produccion ligera.

La relevancia actual del modelo es limitada pero concreta: es un checkpoint de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, sin benchmarks publicados, pero con una propuesta clara (bilingue bengali/ingles + function calling + RAG) bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only denso) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no confirmada en la model card) |
| Tipos de cuantizacion | GGUF (builds publicados en `logicwahid/Kotha-S3-GGUF`); safetensors en precision original |
| Idiomas soportados | bengali (bn), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo derivado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3-1.7B, un transformer decoder-only denso con atencion por causalidad estandar. No se documenta en la model card ninguna modificacion arquitectonica respecto a la base: no hay mezcla de expertos, ni atencion lineal, ni decodificacion especulativa propia. El checkpoint seleccionado es el paso 360, con `val_loss = 0.6145`, elegido mediante parada temprana para evitar sobreajuste.

El autor no publica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card solo indica que el modelo ha sido entrenado para instrucciones, RAG y tool calling nativo compatible con OpenAI. El template de chat admite el parametro `enable_thinking=False`, lo que apunta a que se conserva el modo de razonamiento extendido de Qwen3, aunque no se detalla si fue entrenado especificamente para ello.

## Capacidades

- Generacion de texto conversacional multi-turno en bengali e ingles.
- Instrucciones generales (instruction following) en ambos idiomas.
- Generacion aumentada por recuperacion (RAG): el modelo esta etiquetado y entrenado para integrarse en pipelines de recuperacion de documentos.
- Llamada de herramientas y funciones nativa con esquema compatible con la API de OpenAI (tool calling / function calling).
- Soporte de agentes y razonamiento multi-paso derivado del soporte de tool calling.
- Modo de pensamiento opcional heredado de Qwen3 (controlable via `enable_thinking` en el chat template).
- Capacidades multilingues limitadas a bengali e ingles; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Atencion al cliente en bengali: el modelo puede gestionar conversaciones multi-turno en bengali e ingles con un unico checkpoint, adecuado para mercados de Bangladesh y comunidades diaspora. Su tamano de 1,7B permite desplegarlo en infraestructura modesta.
- Asistentes RAG sobre documentacion interna: al estar entrenado explicitamente para RAG, puede integrarse como generador final en pipelines de recuperacion (por ejemplo, sobre bases de conocimiento en bengali) donde otros modelos pequenos rinden mal por falta de cobertura idiomatica.
- Agentes con function calling: el soporte de tool calling compatible con OpenAI permite conectarlo a frameworks de agentes existentes (LangChain, LlamaIndex, SDK de OpenAI) sin adaptadores personalizados, usando herramientas como busqueda web, calculo o APIs internas.
- Automatizacion de soporte tecnico en centros de contacto: con builds GGUF y `llama-server --jinja` puede desplegarse en VPS de gama baja, reduciendo coste por token frente a APIs propietarias.
- Prototipado rapido de aplicaciones bilingues: para equipos que desarrollan productos para el mercado bengali, el modelo sirve como base de experimentacion con licencia Apache-2.0, sin las restricciones de licencias no comerciales.
- Extraccion estructurada via function calling: usar el modelo para convertir texto libre en bengali en llamadas JSON a funciones definidas por el desarrollador (por ejemplo, registro de pedidos o clasificacion de tickets).
- Educacion y tutoria en bengali: generacion de explicaciones y respuestas a preguntas en bengali con contexto conversacional, aprovechando la ventana heredada de Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de validacion del checkpoint seleccionado (`val_loss = 0.6145` en el paso 360), que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contexto corto.
- VRAM estimada en cuantizacion GGUF Q4_K_M: alrededor de 1,2-1,5 GB de pesos, con un total tipico de 2-3 GB incluyendo contexto.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4070) para fp16; RTX 4090 o A100/H100 no son necesarias y aportarian poco por el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 6 GB o mas; en cuantizacion Q4 tambien en GPUs de 4 GB.
- Opciones de despliegue: transformers (referencia en la model card), llama.cpp / `llama-server --jinja` con los builds GGUF, y por tags del repo, text-generation-inference (TGI) y endpoints compatibles.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kotha-S3 | 1,72B | no disponible | bn, en | si (OpenAI-compatible) | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen3-1.7B (base) | 1,72B | no disponible en esta ficha | multilingue amplio | parcial (segun template) | Apache-2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | multilingue (incluye chino, ingles; bengali limitado) | limitado | Apache-2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | principalmente ingles y multilingue europeo | limitado | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a caracteristicas declaradas; no hay datos de rendimiento comparables porque Kotha-S3 no publica benchmarks. Frente a Qwen3-1.7B, la diferencia principal es la especializacion en bengali y el tool calling nativo; frente a Llama-3.2-1B, la ventaja es la licencia Apache-2.0 y la cobertura de bengali.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; al derivar de Qwen3 y entrenarse con datos no documentados, puede heredar sesgos de la base y del corpus de fine-tuning.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de fidelidad ni de tasa de alucinacion en RAG.
- La model card no documenta el dataset de entrenamiento, lo que impide auditar la calidad y procedencia de los datos.
- Cobertura idiomatica limitada a bengali e ingles; el rendimiento en otros idiomas no esta garantizado y probablemente degrade respecto a la base.
- Longitud de contexto no confirmada en la model card; conviene verificarla empiricamente antes de usarla en produccion con contextos largos.
- Modelo con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente por la comunidad.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base Qwen3-1.7B tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene revisar los terminos de Qwen para despliegues a gran escala.
- El checkpoint seleccionado por perdida de validacion no garantiza buen rendimiento en tareas concretas; se recomienda evaluacion propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logicwahid/Kotha-S3
- Builds GGUF: https://huggingface.co/logicwahid/Kotha-S3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Kotha Lab: https://www.kothalab.com
