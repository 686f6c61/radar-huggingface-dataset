# SASVAAI/qwen38-27b-terraform

## Resumen

qwen38-27b-terraform es un ajuste fino fusionado (merged) del modelo multimodal Qwen/Qwen3.8-27B, publicado por SASVA AI Model Cognition Labs (MCL) en el repositorio SASVAAI/qwen38-27b-terraform. Su unica funcion es traducir una descripcion en lenguaje natural de una infraestructura a configuracion Terraform (HCL) valida y completa, incluyendo bloques `terraform`, `provider`, `resource`, `data`, `variable` y `output` segun sea necesario. El adaptador LoRA se ha fusionado en los pesos base con `merge_and_unload()`, por lo que se carga como un checkpoint estandar de `transformers` sin dependencia de PEFT.

Tecnicamente hereda la familia `qwen3_5` (`Qwen3_5ForConditionalGeneration`), una arquitectura hibrida de 64 capas que combina atencion lineal Gated DeltaNet con atencion completa GQA cada cuatro capas (`full_attention_interval: 4`). El modelo base tiene 27.781.427.952 parametros totales, de los cuales 26,90B corresponden al modelo de lenguaje, 0,46B a la torre de vision y 0,42B a la cabeza de prediccion multi-token (MTP). La longitud de contexto del base es de 262.144 tokens, aunque este ajuste se entreno a 8.192.

Su relevancia practica es de nicho pero clara: es un generador especializado de infraestructura como codigo, con licencia Apache-2.0, y admite despliegue tanto en bf16 como mediante un GGUF Q4_K_M incluido en el mismo repositorio. La contrapartida es que su comportamiento depende de un contrato de prompt muy estricto (plantilla ChatML con `enable_thinking=False`, system prompt fijo y descripcion dentro de un bloque de codigo), fuera del cual el modelo no reproduce el comportamiento entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (`Qwen3_5ForConditionalGeneration`), hibrida: Gated DeltaNet (atencion lineal) + atencion completa GQA cada 4 capas (`full_attention_interval: 4`), 64 capas |
| Parametros totales | 27.781.427.952 (26,90B modelo de lenguaje + 0,46B torre de vision + 0,42B cabeza MTP) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; entrenado a 8.192 tokens |
| Tipos de cuantizacion | bfloat16 sin cuantizar (pesos principales) y GGUF Q4_K_M incluido en el repositorio; el entrenamiento uso base en 8 bits (`lora_8bit`), pero el config no declara `quantization_config` |
| Idiomas soportados | en (prompts en ingles, objetivos en HCL) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (3 shards, 55,6 GB en bf16) y GGUF (Q4_K_M); repositorio completo de 72,4 GB |

## Arquitectura y entrenamiento

El ajuste se realizo sobre Qwen/Qwen3.8-27B mediante SFT con TRL y LoRA de rango 64, alpha 128 y dropout 0,05, entrenado con base cuantizada a 8 bits y computo en bf16. Se entrenaron 400 modulos en total: en las capas de atencion lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`), en las capas de atencion completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y en el MLP (`gate_proj`, `up_proj`, `down_proj`). Quedaron intactos la torre de vision, la cabeza MTP, los embeddings, el `lm_head` y todas las normalizaciones, lo que significa que el ajuste solo modifica el comportamiento de generacion de texto, no las capacidades multimodales del base.

El corpus de entrenamiento se construyo localmente a partir del archivo TerraDS (Zenodo 20339474) y no se publica como dataset en el Hub. La innovacion tecnica relevante no esta en la arquitectura sino en el contrato de inferencia: cada muestra se renderizo con la plantilla ChatML del base con el bloque vacio `<think>\n\n</think>`, de modo que el prefijo de generacion entrenado termina despues de `</think>`. Por eso `enable_thinking=False` no es una preferencia, sino un requisito: con el valor por defecto (`True`) la plantilla se detiene en `<think>` e induce razonamiento fuera de contrato. El system prompt tambien esta fijado y modificarlo desplaza al modelo de su distribucion de entrenamiento.

## Capacidades

- Generacion de Terraform HCL a partir de una descripcion en lenguaje natural: emite `resource`, `data`, `variable`, `output`, `provider` y `terraform` blocks de forma directa, sin prosa ni cercas de Markdown.
- Cobertura multi-proveedor: AWS, GCP, Azure y Kubernetes, mas once familias adicionales de proveedores.
- Salida en formato estricto: HCL crudo, sin explicaciones ni comentarios, apto para escritura directa a disco o para pipelines automatizados.
- Generacion de bloques auxiliares de configuracion: versionado de providers, configuracion de backend y definicion de variables y outputs.
- Capacidad multimodal del base presente en la arquitectura (torre de vision de 0,46B), pero no ajustada ni documentada para esta tarea.
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso agentico multi-paso: no documentado; el modelo esta entrenado para una unica respuesta HCL por turno.
- Multilingue: no disponible; solo se documenta ingles como idioma de prompt.
- Modo de razonamiento (thinking): explicitamente desactivado en el contrato de entrenamiento.

## Casos de uso

- Generacion de modulos Terraform reutilizables: dado un parrafo que describa una red VPC con subredes publicas y privadas, el modelo devuelve directamente el HCL de los modulos y sus llamadas, listo para versionar en un repositorio de infraestructura.
- Migracion de documentacion a IaC: a partir de un runbook o una descripcion de arquitectura existente, se genera el esqueleto de Terraform correspondiente, reduciendo el trabajo manual de traduccion en proyectos de adopcion de infraestructura como codigo.
- Estandarizacion entre equipos multi-proveedor: al cubrir AWS, GCP, Azure, Kubernetes y once familias adicionales, sirve para producir configuraciones con estructura homogenea cuando la organizacion opera en varias nubes.
- Asistente integrado en el IDE: el system prompt fijo y la salida en HCL crudo permiten invocarlo desde una extension o un pre-commit hook que inserte el bloque generado sin post-procesado.
- Generacion de plantillas base de repositorio: creacion de los bloques `terraform` y `provider` con versionado y backend, que son el punto de partida repetitivo de cualquier proyecto nuevo.
- Definicion de variables y outputs: a partir de la descripcion de los parametros de un entorno, el modelo produce los bloques `variable` y `output` con sus tipos, evitando escribir a mano interfaces repetitivas.
- Automatizacion en pipelines de infraestructura: al emitir solo HCL, la salida puede canalizarse directamente a `terraform fmt` y `terraform validate` en CI, usando el modelo como generador de primer borrador que despues se valida mecanicamente.
- Despliegue local con Ollama o llama.cpp: gracias al GGUF Q4_K_M incluido, puede ejecutarse en estaciones de trabajo sin GPU de datacenter para tareas de generacion de HCL sin salida a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del ajuste qwen38-27b-terraform en la informacion disponible. La model card solo declara `loss` como metrica y no incluye cifras.

Los siguientes datos corresponden al modelo base Qwen/Qwen3.8-27B, no al ajuste, y se incluyen unicamente como referencia del punto de partida:

| Benchmark | Resultado (modelo base Qwen3.8-27B) | Fuente |
|---|---|---|
| Artificial Analysis Intelligence Index | 52 (con esfuerzo de razonamiento maximo) | Qubrid |
| SWE-bench Pro | 61,7 | Evaluacion propia de Qwen, recogida por Qubrid |
| Humanity's Last Exam | por debajo de los modelos frontera | Qubrid |
| GPQA Diamond | por debajo de los modelos frontera | Qubrid |

No hay datos publicados sobre calidad del HCL generado, tasa de validez sintactica, exito de `terraform validate` ni comparaciones con otros generadores de Terraform.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan 55,6 GB (3 shards safetensors), por lo que se necesita una GPU con al menos 80 GB de VRAM (H100 80 GB, A100 80 GB) o reparto en varias GPUs.
- Inferencia cuantizada: con el GGUF Q4_K_M incluido, el modelo cabe en GPUs de consumo. El tamano exacto del archivo no se indica en la informacion disponible; para 27,78B parametros en Q4_K_M la estimacion habitual esta en torno a 16-17 GB, lo que lo hace viable en una RTX 4090 o RTX 3090 de 24 GB.
- Memoria KV: la ventana del base es de 262.144 tokens sobre 64 capas, de modo que servir el contexto completo exige mucha mas VRAM que los pesos; el entrenamiento se hizo a 8.192 tokens, franja recomendada para produccion.
- Opciones de despliegue: `transformers` (obligatorio `AutoModelForImageTextToText`, ya que `AutoModelForCausalLM` no puede cargar esta arquitectura), llama.cpp u Ollama para el GGUF, y vLLM (existen recetas oficiales para el base Qwen/Qwen3.8-27B, incluyendo checkpoint FP8). TGI no esta confirmado para `model_type: qwen3_5`.
- Requisito de version: hace falta una build de `transformers` que reconozca `model_type: qwen3_5`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos especializados en generacion de Terraform. La comparativa se limita por tanto al modelo base y a una cuantizacion del mismo, que no son alternativas funcionales sino puntos de referencia:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SASVAAI/qwen38-27b-terraform | 27,78B | 262.144 (entrenado a 8.192) | Terraform HCL | Apache-2.0 | HuggingFace, safetensors + GGUF |
| Qwen/Qwen3.8-27B | 27,78B | 262.144 | Proposito general, multimodal | Apache-2.0 | HuggingFace, con recetas vLLM y checkpoints FP8 |
| syvai/Qwen3.8-27B-DFlash2-W4A16 | no disponible | no disponible | Cuantizacion W4A16 del mismo base con decodificacion especulativa | Apache-2.0 | HuggingFace |

Comparativa de rendimiento entre estas opciones: no disponible.

## Limitaciones y advertencias

- Dependencia estricta del formato de prompt: el turno de usuario debe contener la instruccion, una linea en blanco y la descripcion dentro de un bloque de codigo cercado. Usarlo como modelo de chat general no reproduce el comportamiento entrenado.
- `enable_thinking=False` es obligatorio. Con el valor por defecto de la plantilla, la generacion se detiene en `<think>` y el modelo razona fuera del contrato con el que se calculo la perdida.
- El system prompt esta fijado en el entrenamiento; cambiarlo degrada la adherencia al formato de salida.
- Carga incorrecta: `AutoModelForCausalLM` no puede cargar esta arquitectura; hay que usar `AutoModelForImageTextToText`.
- Solo ingles documentado como idioma de prompt; no hay evaluacion de su comportamiento con instrucciones en castellano.
- Riesgo de alucinacion en HCL: no se han publicado metricas de validez sintactica ni de exito en `terraform validate` o `terraform plan`, por lo que la salida debe validarse siempre antes de aplicarla. Un bloque con atributos o tipos de recurso inexistentes puede pasar desapercibido en una revision superficial.
- Sin benchmarks del ajuste publicados: no hay evidencia cuantitativa de mejora frente al base en generacion de Terraform.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del base. Al ser un modelo derivado, se mantienen las obligaciones de atribucion y el aviso de licencia del modelo original.
- Repositorio de 72,4 GB: una descarga manual sin filtrar arrastra tambien el GGUF. Debe excluirse `*.gguf` si solo se van a usar los safetensors.
- Traccion nula en el Hub en la fecha de los datos (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad.
- El corpus de entrenamiento (TerraDS, Zenodo 20339474) no se publica como dataset en el Hub, lo que dificulta auditar la composicion de los datos y los sesgos de los proveedores cubiertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SASVAAI/qwen38-27b-terraform
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Recetas vLLM para Qwen/Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Benchmark del modelo base (Qubrid): https://www.qubrid.com/blog/qwen38-27b-benchmarks-official-and-independent-results
- Cuantizacion derivada del mismo base (syvai/Qwen3.8-27B-DFlash2-W4A16): https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Listado de adaptadores sobre Qwen/Qwen3.8-27B: https://huggingface.co/models?other=base_model:adapter:Qwen%2FQwen3.8-27B
- Repositorio TRL: https://github.com/huggingface/trl
