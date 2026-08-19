# QinEmPeRoR93/nassila-sanad-9b-unquant

## Resumen

Nassila Sanad 9B es un modelo de lenguaje de 8.95 mil millones de parámetros, resultado de un fine-tuning con LoRA sobre el modelo base Qwen/Qwen3.5-9B. Lo desarrolla QinEmPeRoR93 (Gamal Esam Alsakkaf) como componente del proyecto Nassila, una aplicación de verificación de hechos. El modelo está especializado en la tarea de *grounding* (anclaje de afirmaciones a fuentes), produciendo veredictos estructurados en JSON con citas textuales y racionales.

La relevancia de este modelo radica en su enfoque en el árabe y el inglés, dos idiomas con escasez de herramientas de verificación automática. Al ser un merge completo en bf16 del adaptador LoRA FT-5, ofrece pesos listos para usar con Transformers, aunque también existen versiones cuantizadas en GGUF para despliegue ligero. Su salida sigue un contrato JSON estricto (`l3_grounding`) que facilita la integración en pipelines de fact-checking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~8.95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (este repo); GGUF disponible en repo hermano (niveles no especificados) |
| Idiomas soportados | Ingles, arabe |
| Licencia | Apache-2.0 (pesos); base model sujeto a la licencia de Qwen |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only con mecanismo de atencion estandar. Sobre esta base se aplico un adaptador LoRA (low-rank adaptation) entrenado con 2000 filas de datos de entrenamiento balanceadas por veredicto (checkpoint FT-5, version v117). El adaptador se fusiono posteriormente en los pesos completos en bf16, dando lugar a este repositorio.

El entrenamiento se enfoca en la tarea `l3_grounding`, que consiste en evaluar afirmaciones y producir un JSON con la siguiente estructura: `{claims:[{claim, verdict, sourceQuotes, rationale, hasNumericClaim}], overallVerdict, overallRationale}`. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero total de tokens ni el uso de tecnicas como RLHF o DPO. El modelo hereda la capacidad de razonamiento de Qwen3.5, que activa un modo de pensamiento por defecto, desactivable para salidas JSON puras.

## Capacidades

- Generacion de texto conversacional en ingles y arabe.
- Grounding de afirmaciones: evalua claims y produce veredictos (por ejemplo, "apoyado", "refutado") con citas textuales de las fuentes.
- Salida JSON estructurada segun el contrato `l3_grounding`, con campos para claims individuales, veredicto global y racional.
- Deteccion de afirmaciones numericas (`hasNumericClaim`), util para verificar datos cuantitativos.
- Modo de pensamiento (thinking) heredado de Qwen3.5, que puede desactivarse para respuestas directas.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Verificacion de hechos en articulos de noticias: el modelo analiza afirmaciones extraidas de un texto, las contrasta con fuentes citadas y devuelve un veredicto con citas textuales, lo que permite automatizar el fact-checking en redacciones.
- Analisis de documentos legales o academicos: dado un contrato o paper, el modelo identifica afirmaciones clave y las ancla a pasajes concretos, facilitando la revision de consistencia.
- Moderacion de contenido en plataformas: integrado en un pipeline, puede clasificar declaraciones como verdaderas, falsas o no verificables, con racional explicito para auditores humanos.
- Asistente conversacional con grounding: en la aplicacion Nassila, el modelo responde preguntas del usuario citando las fuentes de las que extrae la informacion, reduciendo alucinaciones.
- Extraccion de datos numericos: gracias al campo `hasNumericClaim`, puede identificar y verificar cifras en informes financieros o estadisticas oficiales.
- Generacion de informes de verificacion: a partir de un conjunto de claims, produce un resumen global con veredicto y racional, listo para publicacion o envio a un verificador determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: los pesos bf16 ocupan aproximadamente 17 GB, por lo que se recomienda una GPU con al menos 20 GB de VRAM para inferencia comoda (por ejemplo, RTX 3090, RTX 4090, A100 40GB).
- En GPUs de consumo con menos VRAM, se puede usar la version GGUF cuantizada del repositorio hermano `nassila-sanad-9b`, que carga en LM Studio o llama.cpp con requisitos menores (por ejemplo, 8-10 GB para cuantizaciones Q4_K_M).
- Despliegue: compatible con Transformers (carga directa con `AutoModelForCausalLM`), vLLM, TGI y cualquier servidor que soporte safetensors. Para GGUF, usar llama.cpp, llama-server u Ollama.
- Latencia y throughput: no disponibles. Dependen del hardware y de si se activa el modo de pensamiento, que incrementa el numero de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nassila Sanad 9B | 8.95B | No disponible | Grounding de afirmaciones (EN/AR) | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (base) | 8.95B | No disponible | Generacion general | Qwen license | Hugging Face |
| Otros modelos de fact-checking | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables especificos de grounding en arabe/ingles con los que contrastar. La comparativa se limita al modelo base, del que hereda arquitectura y capacidades generales.

## Limitaciones y advertencias

- El grounding es consultivo, no determinista: los veredictos del modelo no deben usarse como unica fuente de verdad; en la aplicacion Nassila, los veredictos finales provienen de un verificador determinista separado.
- Qwen3.5 piensa por defecto, lo que puede generar respuestas largas y no deseadas si se espera JSON puro; es necesario desactivar el modo de pensamiento en la configuracion de generacion.
- El repositorio pesa ~17 GB, lo que requiere amplia RAM/VRAM para cargar en bf16; para entornos limitados se recomienda usar las cuantizaciones GGUF.
- No se documentan sesgos especificos, pero al estar entrenado principalmente en datos de veredictos balanceados, puede presentar limitaciones en dominios fuera de ese corpus.
- Riesgo de alucinacion en afirmaciones no cubiertas por las fuentes citadas; el modelo puede generar racionales plausibles pero incorrectos.
- La licencia Apache-2.0 aplica a los pesos de este merge, pero el modelo base Qwen3.5-9B tiene su propia licencia que puede imponer restricciones adicionales para uso comercial.
- No hay informacion sobre la longitud de contexto soportada, lo que limita el uso en documentos muy largos sin pruebas previas.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/QinEmPeRoR93/nassila-sanad-9b-unquant
- Repositorio GGUF cuantizado: https://huggingface.co/QinEmPeRoR93/nassila-sanad-9b
- Adaptador LoRA: https://huggingface.co/QinEmPeRoR93/nassila-sanad-9b-grounding-lora
- Proyecto Nassila (GitHub): https://github.com/jamalesam93/Nassila
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
