# DoubleRabbits/d3-mini-zils-v3

## Resumen

DoubleRabbits/d3-mini-zils-v3 es un ajuste fino de tipo LoRA fusionado sobre el chasis d3-mini-4.5b-v1, que a su vez deriva de Qwen3.5-4B. Lo publica el usuario DoubleRabbits en Hugging Face bajo licencia Apache 2.0. El modelo esta orientado a la toma de decisiones ("decision model") dentro de lo que el autor denomina "Zils d3-mini soup pool", un conjunto de variantes generadas mediante mezcla de modelos (model soup) sobre la misma base.

El modelo tiene 4.539.265.536 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de 4,5 mil millones de parametros, con un tamano de repositorio de 9,1 GB. El entrenamiento consistio en un LoRA de rango 16 aplicado sobre 400 decisiones sinteticas con semilla 2, un volumen de datos muy reducido que condiciona fuertemente su comportamiento.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino comunitario con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks publicados y sin documentacion sobre el dataset de entrenamiento mas alla de la cifra de ejemplos. Resulta util como referencia de un pipeline de fine-tuning ligero sobre Qwen3.5-4B, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B, tag `qwen3_5`, requiere `custom_code`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parametros. El repositorio incluye el tag `custom_code`, lo que indica que la carga del modelo requiere codigo personalizado y no funciona con una configuracion estandar de `transformers` sin `trust_remote_code=True`. El autor menciona un "chasis" intermedio denominado d3-mini-4.5b-v1, sobre el que se aplica el ajuste.

El entrenamiento consiste en un LoRA de rango 16 entrenado con 400 decisiones sinteticas generadas con semilla 2. No se especifica el numero de tokens, la composicion del dataset, la funcion de perdida, si hubo RLHF o DPO, ni la tasa de aprendizaje o el numero de pasos. Tampoco se documenta si el adaptador LoRA se fusiono con los pesos base (el repo contiene safetensors completos de 9,1 GB, lo que sugiere fusion). No se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y toma de decisiones: el modelo esta ajustado especificamente para tareas de decision, segun la model card.
- Razonamiento y codigo: heredados potencialmente de la base Qwen3.5-4B, pero no verificados ni documentados por el autor.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de clasificadores de decision: el modelo puede emplearse para experimentar con la generacion de decisiones estructuradas en entornos de investigacion, dado su ajuste especifico sobre 400 ejemplos sinteticos.
- Evaluacion de pipelines de fine-tuning LoRA: sirve como ejemplo reproducible de un ajuste de rango 16 sobre Qwen3.5-4B, util para comparar hiperparametros y volumenes de datos.
- Base para experimentos de model soup: al formar parte del "Zils d3-mini soup pool", puede integrarse en mezclas de pesos junto con otras variantes del mismo chasis.
- Generacion de texto general en laboratorio: con 4,5 mil millones de parametros, cabe en GPU de consumo y permite pruebas de inferencia local sin infraestructura dedicada.
- Investigacion sobre sobreajuste con datos sinteticos: con solo 400 ejemplos, es un caso de estudio util para medir el efecto de datasets pequenos en modelos de este tamano.
- Docencia y demostraciones: su tamano moderado y licencia Apache 2.0 facilitan su uso en cursos y talleres sobre fine-tuning y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 o H100 para produccion con contexto largo; RTX 4090 o RTX 3090 para FP16 en local.
- GPU de consumo: cabe en tarjetas con 12 GB o mas en FP16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); en cuantizacion 4 bits podria caber en 8 GB, pero sin pesos GGUF publicados requiere conversion manual.
- Opciones de despliegue: al requerir `custom_code` y el tag `qwen3_5`, es probable que necesite `transformers` con `trust_remote_code=True`; vLLM, llama.cpp, Ollama y TGI no estan verificados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DoubleRabbits/d3-mini-zils-v3 | 4.539 M | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | ~4.000 M | No disponible en esta ficha | Segun Qwen | Hugging Face, ampliamente distribuido |
| d3-mini-4.5b-v1 (chasis) | ~4.500 M | No disponible | No disponible | Referenciado por el autor, sin datos publicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento minimo: 400 decisiones sinteticas con semilla 2 implican un riesgo alto de sobreajuste y baja generalizacion fuera del dominio de esas muestras.
- Sesgos desconocidos: al no documentarse la composicion del dataset sintetico ni el proceso de generacion, no es posible evaluar sesgos.
- Riesgo de alucinacion: elevado en tareas abiertas, dado el ajuste especifico y la ausencia de evaluaciones.
- Idiomas: el autor no declara idiomas soportados; no se garantiza un rendimiento multilingue.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene verificar por separado.
- Carga no estandar: el tag `custom_code` obliga a ejecutar codigo del repositorio, lo que introduce un riesgo de seguridad en entornos de produccion.
- Sin adopcion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por la comunidad.
- Sin benchmarks: no existen metricas publicadas que permitan comparar su calidad con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DoubleRabbits/d3-mini-zils-v3
- Repositorio base Qwen3.5-4B: no disponible en la informacion proporcionada
- Chasis d3-mini-4.5b-v1: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Demo: no disponible
