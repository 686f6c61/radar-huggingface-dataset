# bedus-creation/keera-qwen3-8b

## Resumen

keera-qwen3-8b es un adaptador LoRA (r=16, alpha=16) sobre Qwen3-8B desarrollado por bedus-creation, orientado a la extraccion estructurada de campos de ofertas de empleo en formato JSON. El modelo resuelve un problema concreto: sustituir de forma economica y autoalojada las llamadas a DeepSeek que el autor utilizaba para etiquetar ofertas de empleo, manteniendo un esquema de salida controlado y una calidad de extraccion aceptable.

La arquitectura subyacente es la de Qwen3-8B (transformer denso de aproximadamente 8.000 millones de parametros), sobre el que se aplica un adaptador PEFT de 43,6 millones de parametros entrenados. El modelo no es de proposito general: esta especializado en una tarea de extraccion por "pasadas" (identity, compensation, employment, tags, location, eligibility, company, dates), con un formato de prompt fijo y salida JSON restringida por esquema.

Es relevante ahora porque demuestra un patron practico de destilacion de etiquetas (DeepSeek como profesor, Qwen3-8B como alumno) para tareas de extraccion estructurada, con artefactos listos para produccion (GGUF Q4_K_M, adaptador PEFT y LoRA en GGUF) y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 43.646.976 (adaptador LoRA); modelo base Qwen3-8B ~8.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens configurados en los ejemplos de despliegue; entradas de hasta 24.000 caracteres |
| Tipos de cuantizacion | GGUF Q4_K_M (5,0 GB); adaptador PEFT en bf16; LoRA en GGUF (175 MB) |
| Idiomas soportados | no disponible (la model card no lo especifica; hereda las capacidades del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (modelo fusionado Q4_K_M y LoRA) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA de rango 16 y alpha 16 sobre `unsloth/Qwen3-8B` (mismos pesos que `Qwen/Qwen3-8B`), aplicado a todas las proyecciones de atencion y MLP. El entrenamiento se realizo con Unsloth en dos fases: una fase piloto sobre 2.000 ofertas de empleo con learning rate 2e-4, seguida de una fase continuada sobre ofertas no vistas con learning rate 5e-5. El checkpoint publicado corresponde al paso 1300 de la fase continuada, con la menor perdida de validacion de todas las ejecuciones (0,1195 frente a 0,1252 del piloto).

Los datos de entrenamiento son ofertas de empleo etiquetadas por DeepSeek, lo que constituye un proceso de destilacion de etiquetas: el modelo alumno aprende a reproducir la extraccion estructurada del profesor a un coste de inferencia mucho menor. No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset. La innovacion tecnica principal no esta en la arquitectura, sino en el diseno de la tarea: extraccion por pasadas independientes con esquemas JSON restringidos, pensada para maximizar la precision por campo y evitar el relleno de campos sin evidencia en el texto.

## Capacidades

- Extraccion de campos estructurados de ofertas de empleo en JSON, organizada en ocho pasadas: `identity`, `compensation`, `employment`, `tags`, `location`, `eligibility`, `company` y `dates`.
- Salida restringida por esquema JSON (soporte de `format` en Ollama y `response_format` en vLLM), lo que garantiza validez estructural de la respuesta.
- Omision deliberada de campos sin valor: el prompt de sistema instruye a no rellenar campos vacios ni anadir campos fuera del esquema.
- Procesamiento de entradas largas: hasta 24.000 caracteres de texto de oferta por llamada.
- Uso de contexto auxiliar (fecha actual, categorias e industrias permitidas) para normalizar la extraccion.
- Modo thinking desactivado obligatorio (`enable_thinking: false`, `think: false`) y temperatura 0 para reproducibilidad.
- Capacidades generales de Qwen3-8B (razonamiento, codigo, multilingue) teoricamente presentes en el modelo base, pero no evaluadas ni garantizadas tras el fine-tuning.

## Casos de uso

- Normalizacion de bolsas de empleo: procesar ofertas de portales y agregadores para extraer tipo de contrato, nivel de experiencia, salario y ubicacion en campos estructurados, usando una llamada por pasada y esquema restringido.
- Enriquecimiento de bases de datos de reclutamiento: ejecutar el modelo sobre ofertas historicas para poblar columnas faltantes (`employment_type`, `experience_level`, `required_experience_years`) de forma consistente.
- Filtrado y matching de candidatos: extraer `tags`, `location` y `eligibility` para alimentar motores de busqueda o sistemas de recomendacion de ofertas.
- Sustitucion autoalojada de APIs de terceros: reemplazar llamadas a DeepSeek u otros LLM comerciales en un pipeline de etiquetado, reduciendo coste por token y evitando enviar texto de ofertas a servicios externos.
- Analisis de mercado laboral: extraer `compensation` y `dates` de forma masiva para construir series temporales de salarios y demanda por categoria e industria.
- Pipeline de datos en produccion con vLLM: servir el adaptador LoRA sobre Qwen3-8B en bf16 con `--enable-lora` y `--max-model-len 16384` para maximizar calidad, o desplegar el GGUF Q4_K_M con Ollama para entornos sin GPU dedicada.
- Extraccion por lotes en CPU o hardware modesto: usar el GGUF Q4_K_M de 5,0 GB con llama.cpp u Ollama para procesar volumenes altos a bajo coste, aceptando una ligera perdida de calidad frente a bf16.

## Benchmarks y rendimiento

Evaluacion sobre 500 ofertas reservadas, comparando con las etiquetas de DeepSeek. La "concordancia" cuenta solo los campos que DeepSeek relleno (excluye campos de texto libre); el "falso relleno" mide campos que el modelo rellena y DeepSeek dejo vacios.

| Modelo | Concordancia media | Falso relleno medio |
|---|---|---|
| Qwen3-8B base | 54,1% | 57,9% |
| Piloto (2k ofertas, lr 2e-4) | 68,9% | 14,4% |
| Ejecucion continuada (lr 2e-4, paso final) | 71,3% | 13,6% |

El checkpoint publicado en el repositorio no ha pasado por esta evaluacion: procede de una ejecucion continuada posterior (lr 5e-5) con la menor perdida de validacion (0,1195). Las puntuaciones se midieron en bf16 sobre vLLM; el GGUF Q4_K_M puede diferir ligeramente.

Campos con bajo rendimiento conocido: `company_overview`, `organization_type`, `relocation_support` y `alternate_companies_names` (baja concordancia); `contract_type`, `accepted_nationality` y `location_desc` (se rellenan cuando DeepSeek los dejo vacios).

## Requisitos de hardware

- VRAM estimada para el adaptador PEFT en bf16 sobre Qwen3-8B: aproximadamente 16-18 GB (pesos del modelo base en bf16 mas overhead de atencion y KV cache para contexto de 16.384 tokens).
- VRAM para el GGUF Q4_K_M fusionado: aproximadamente 5-6 GB, con margen adicional para el contexto.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, suficiente para el modelo base y contexto moderado).
- GPU consumer: el GGUF Q4_K_M cabe en GPUs de 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070); en bf16 requiere al menos 24 GB (RTX 4090 o A6000).
- Despliegue: vLLM con `--enable-lora --max-lora-rank 16` para produccion en GPU; Ollama (`hf.co/bedus-creation/keera-qwen3-8b:Q4_K_M`), llama.cpp (`llama-server -m qwen3-8b.gguf --lora keera-lora.gguf`) y LM Studio para el GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keera-qwen3-8b | 43,6 M (adaptador) sobre Qwen3-8B | 16.384 tokens | Extraccion JSON de ofertas de empleo por pasadas | Apache 2.0 | Hugging Face (PEFT, GGUF, LoRA) |
| Qwen3-8B base | ~8.000 M | 32.768 tokens (nativo) | Proposito general | Apache 2.0 | Hugging Face |
| DeepSeek (profesor de etiquetas) | no disponible | no disponible | Proposito general / extraccion | no disponible | API comercial |
| Alternativas de extraccion estructurada de 7-8B | no disponible | no disponible | Extraccion JSON generica | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del formato de prompt exacto (mensajes de sistema y usuario, pasadas, esquema JSON) el rendimiento cae de forma notable, segun advierte el autor.
- El checkpoint publicado no ha sido evaluado con el conjunto de 500 ofertas; las metricas de la tabla corresponden a ejecuciones anteriores.
- Sesgos heredados de las etiquetas de DeepSeek: el modelo reproduce los criterios del profesor, incluidas sus omisiones y posibles sesgos en campos como `accepted_nationality` o `organization_type`.
- Riesgo de falso relleno en campos concretos (`contract_type`, `accepted_nationality`, `location_desc`), lo que puede introducir datos incorrectos si no se valida la salida.
- Baja concordancia en campos de texto libre y de empresa (`company_overview`, `organization_type`, `relocation_support`, `alternate_companies_names`).
- Requiere modo thinking desactivado y temperatura 0; otros ajustes pueden degradar la calidad o romper el formato JSON.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre ofertas de empleo presumiblemente en ingles, sin confirmacion explicita.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios terminos que deben verificarse por separado.
- No apto como sustituto de un LLM de proposito general: no se han evaluado capacidades de razonamiento, codigo o conversacion tras el fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bedus-creation/keera-qwen3-8b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Version Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio PEFT: https://github.com/huggingface/peft
- vLLM: https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
