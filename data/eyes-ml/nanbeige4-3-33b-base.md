# eyes-ml/Nanbeige4.3-33B-Base

## Resumen

Nanbeige4.3-33B-Base es un modelo de lenguaje de tipo decoder-only para generación de texto, publicado por el equipo Nanbeige (repositorio en HuggingFace bajo el identificador `eyes-ml/Nanbeige4.3-33B-Base`, con la model card remitiendo a `Nanbeige/Nanbeige4.3-33B-Base`). Con 33.118.977.024 parámetros, se posiciona en la clase de ~30B y se presenta como el modelo "teacher" insignia de la serie Nanbeige4.3: la estrategia declarada del equipo es construir primero un agente de alta capacidad para, posteriormente, destilar esas capacidades agénticas en modelos más pequeños de la misma familia (por ejemplo, Nanbeige4.3-3B).

El modelo está orientado a tareas de código complejo y de "cowork" profesional, y la model card lo describe como una base para post-entrenamiento tanto de agentes de propósito general como especializados por dominio. Según los datos aportados por el autor, supera de forma consistente a Gemma4-31B-Base, que la propia model card identifica como la única base abierta de frontera publicada en la escala de 30B en los últimos seis meses.

La relevancia actual del modelo radica en dos factores: por un lado, su licencia Apache 2.0 permite uso comercial sin restricciones adicionales declaradas; por otro, al ser un modelo base (sin alineamiento instruccional publicado), está pensado como punto de partida para fine-tuning y RLHF/DPO por parte de terceros. No se han publicado datos sobre longitud de contexto, composición del dataset de entrenamiento ni proceso de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; los tags de HuggingFace incluyen `llama`, lo que sugiere una arquitectura transformer decoder-only de tipo Llama. No se especifica si emplea MoE, SSM o atención híbrida |
| Parametros totales | 33.118.977.024 (dato real de los tensores en safetensors) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (66,2 GB); no se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh), segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`), compatible con `trust_remote_code=True` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo que se deduce de los metadatos: el tag `llama` en HuggingFace apunta a una arquitectura transformer decoder-only de tipo Llama, y los 33.118.977.024 parametros reales confirman un modelo denso de ~33B (o, en su defecto, un MoE con ese total, extremo que la model card no aclara). El identificador `-Base` indica que se trata de un modelo preentrenado sin post-entrenamiento instruccional; no se ha publicado informacion sobre si hubo RLHF, DPO o SFT para esta variante.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto nativa ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.). La model card si define el proposito del modelo dentro de la familia: servir como "teacher" de alta capacidad para destilar capacidades agenticas en modelos mas pequenos de la serie Nanbeige4.3, y como base para post-entrenamiento de agentes generales o especializados por dominio.

## Capacidades

- Generacion de texto autoregresiva en ingles y chino.
- Razonamiento STEM: la model card reporta resultados en MMLU-Pro (66,9), GPQA (62,0) y SuperGPQA (45,6).
- Matematicas: GSM8K (92,9) y un benchmark denominado "Math" (57,3).
- Codigo: MBPP (74,6), con orientacion declarada a "complex coding".
- Conocimiento general: MMLU (85,5) y CMMLU (86,8), este ultimo especifico de conocimiento en chino.
- Base para agentes: el autor lo describe como fundamento para post-entrenamiento de agentes y tareas de "professional cowork", aunque al ser un modelo base no incorpora de serie formato de tool calling ni modos de razonamiento instruidos.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Fine-tuning instruccional propio: al ser un modelo base con licencia Apache 2.0, es adecuado como punto de partida para SFT y DPO con datos propios, evitando las restricciones de uso de otras licencias abiertas o semiabiertas.
- Generacion de codigo en pipelines internos: su rendimiento declarado en MBPP (74,6) lo hace util como base para asistentes de codigo especializados tras un post-entrenamiento con el stack tecnologico de la organizacion.
- Modelo teacher para destilacion: el caso de uso explicitamente declarado por el autor es servir de referencia para destilar capacidades agenticas en modelos pequenos (familia Nanbeige4.3-3B), lo que permite reducir costes de inferencia manteniendo calidad.
- Razonamiento STEM asistido: con 62,0 en GPQA y 66,9 en MMLU-Pro, es una base razonable para herramientas de apoyo a investigacion en dominios cientificos tras ajuste con literatura del dominio.
- Procesamiento de documentacion en chino e ingles: los 86,8 en CMMLU y 85,5 en MMLU lo hacen util para tareas de extraccion, resumen y clasificacion bilingues en entornos corporativos.
- Evaluacion comparativa de bases: sirve como referencia en estudios de escalado y de post-entrenamiento en la clase de 30B, al ser comparable directamente con Gemma4-31B-Base en los benchmarks publicados.
- Despliegue con vLLM o SGLang: la model card incluye comandos de servicio con paralelismo tensorial (`--tp-size 4`), lo que facilita montar un endpoint compatible con la API de OpenAI para prototipado.

## Benchmarks y rendimiento

Datos publicados en la model card (comparacion directa con Gemma4-31B-Base):

| Benchmark | Nanbeige4.3-33B-Base | Gemma4-31B-Base |
|---|---|---|
| MMLU-Pro | 66,9 | 59,3 |
| GPQA | 62,0 | 41,5 |
| SuperGPQA | 45,6 | 33,8 |
| GSM8K | 92,9 | 88,9 |
| Math | 57,3 | 43,6 |
| MBPP | 74,6 | 72,5 |
| MMLU | 85,5 | 84,2 |
| CMMLU | 86,8 | 76,9 |

No se han publicado en la informacion disponible resultados de otros benchmarks (HumanEval, LiveCodeBench, MT-Bench, etc.) ni las condiciones exactas de evaluacion (numero de shots, prompts, version de cada benchmark).

## Requisitos de hardware

- Pesos en precision original: 66,2 GB en safetensors, lo que implica aproximadamente 66 GB de VRAM solo para pesos en BF16/FP16, mas margen para KV cache y activaciones (estimacion orientativa: 70-80 GB).
- GPU recomendadas para BF16: 1x H100 80 GB, 1x A100 80 GB, o 2x A100 40 GB con paralelismo tensorial. Los ejemplos de la model card usan `--tp-size 4` / `--tensor-parallel-size 4`, es decir, 4 GPU.
- Cuantizacion de 8 bits: ~33 GB de pesos; encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB (estimacion basada en el numero de parametros).
- Cuantizacion de 4 bits: ~17-18 GB de pesos; cabria en GPU de consumo como RTX 4090 24 GB o RTX 3090 24 GB, aunque no se han publicado pesos cuantizados oficiales para este modelo.
- Opciones de despliegue documentadas: `transformers` (con `trust_remote_code=True` y `use_fast=False` en el tokenizer), vLLM y SGLang, ambos con ejemplos de servidor y `gpu-memory-utilization`/`mem-fraction-static` a 0,8. El tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se incluye comando de ejemplo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (MMLU-Pro / GPQA / GSM8K / MBPP) | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Base | 33,1B | No disponible | Apache 2.0 | 66,9 / 62,0 / 92,9 / 74,6 | HuggingFace, safetensors |
| Gemma4-31B-Base | ~31B (no confirmado en la informacion) | No disponible | No disponible en la informacion | 59,3 / 41,5 / 88,9 / 72,5 | Referenciado en la model card |
| Otras bases abiertas de ~30B | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos numericos proporcionada por el autor es frente a Gemma4-31B-Base, sobre la que Nanbeige4.3-33B-Base gana en los ocho benchmarks reportados, con la mayor diferencia en GPQA (+20,5 puntos) y CMMLU (+9,9). No se han facilitado datos de contexto, licencia ni disponibilidad de la alternativa, por lo que esas celdas quedan como no disponibles.

## Limitaciones y advertencias

- Modelo base sin alineamiento instruccional: no sigue instrucciones de forma fiable ni incorpora formato de chat; requiere post-entrenamiento antes de usarse en produccion conversacional.
- Riesgo de alucinacion inherente a un modelo preentrenado: puede generar afirmaciones plausibles pero falsas, especialmente en dominios especializados no cubiertos por el entrenamiento.
- Cobertura idiomatica limitada a ingles y chino segun los metadatos; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Longitud de contexto no publicada: no es posible planificar casos de uso con documentos largos sin una evaluacion previa.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad para este modelo.
- Ausencia de pesos cuantizados oficiales: el despliegue en GPU de consumo exige cuantizar por cuenta propia, con el riesgo de degradacion de calidad que ello implica.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones declaradas adicionales, pero no se ofrece ninguna garantia ni indemnizacion por parte del autor.
- Procedencia del repositorio: el identificador de HuggingFace es `eyes-ml/Nanbeige4.3-33B-Base`, mientras que la model card y los ejemplos de codigo apuntan a `Nanbeige/Nanbeige4.3-33B-Base`; conviene verificar cual es el repositorio canonico antes de integrarlo en produccion.
- Fecha de publicacion en los metadatos (25 de octubre de 2026) posterior a la fecha de referencia habitual: verificar la vigencia y el estado de mantenimiento del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/eyes-ml/Nanbeige4.3-33B-Base
- Repositorio referenciado en la model card: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Contacto del equipo: nanbeige@kanzhun.com
- Paper, blog o repositorio de codigo adicionales: no disponibles en la informacion proporcionada (los resultados de busqueda web recibidos no guardan relacion con el modelo).
