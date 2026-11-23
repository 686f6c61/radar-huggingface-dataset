# believe-it-or-not/2k_original_augmented_original_pkc_fda_approval-1bd9f527

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que deben combinarse con el modelo base de 70.000 millones de parametros para poder utilizarse. El autor identificado es `believe-it-or-not` y el repositorio se publico el 22 de noviembre de 2026 con un tamano de 1,7 GB, coherente con un adaptador LoRA de rango moderado sobre un modelo de gran tamano.

El nombre del repositorio (`2k_original_augmented_original_pkc_fda_approval-1bd9f527`) sugiere un ajuste fino orientado a una tarea concreta relacionada con aprobaciones de la FDA y datos PKC, probablemente un experimento de ajuste supervisado sobre un conjunto de 2.000 ejemplos. La model card es la plantilla por defecto de Hugging Face sin completar: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluacion.

La relevancia de esta ficha es limitada como modelo de produccion, pero resulta util como ejemplo de artefacto de ajuste fino publicado sin documentacion y con cero descargas y cero likes en el momento de la consulta. Cualquier evaluacion seria requiere inspeccionar el modelo base y el adaptador por separado, ya que toda la informacion tecnica sustantiva recae en Llama 3.3 70B Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B) |
| Parametros totales | No disponible para el adaptador; modelo base: 70.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; modelo base Llama 3.3: 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles en la model card; heredados del modelo base (multilingue, con predominio de ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA sobre `Meta-Llama-3.3-70B-Instruct-Reference`, un transformer decoder-only denso de 70.000 millones de parametros con atencion por grupos (GQA) y ventana de contexto de 128.000 tokens en su version original. El adaptador modifica un subconjunto de matrices de proyeccion del modelo base; el repositorio ocupa 1,7 GB, lo que es consistente con un rango LoRA relativamente alto o con muchas capas adaptadas, aunque no se especifica la configuracion exacta (r, alpha, dropout, modulos objetivo).

No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, el regimen de precision (fp16/bf16/fp8) ni si se aplico RLHF o DPO adicional. El nombre del repositorio apunta a un conjunto de aproximadamente 2.000 ejemplos ("2k") con aumentacion ("augmented") y un dominio de aprobaciones regulatorias de la FDA, pero esto es una inferencia a partir del identificador y no un dato documentado. La unica referencia tecnica en la model card es la cita generica a Lacoste et al. (2019) sobre emisiones de carbono, que forma parte de la plantilla estandar y no aporta informacion sobre el entrenamiento real.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, condicionadas por el ajuste fino.
- Instrucciones y dialogo multi-turno: el modelo base esta alineado para seguir instrucciones; el adaptador puede alterar el estilo o el dominio de respuesta.
- Codigo y matematicas: capacidades presentes en el modelo base, no verificadas tras el ajuste.
- Tool calling / function calling: el modelo base Llama 3.3 Instruct soporta formato de llamada a herramientas; no se documenta si el adaptador lo preserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Multilingue: no documentado; depende del modelo base.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion con ajuste fino sobre dominios regulatorios: el adaptador puede cargarse junto al modelo base para reproducir el experimento de ajuste sobre datos de aprobaciones FDA, util en entornos de investigacion que quieran comparar el comportamiento antes y despues del ajuste.
- Prototipado de asistentes especializados en documentacion regulatoria: si el ajuste esta orientado a terminologia FDA/PKC, puede emplearse como punto de partida para un asistente interno que responda sobre procedimientos de aprobacion, siempre con validacion humana.
- Investigacion sobre LoRA en modelos de 70B: el repositorio sirve como caso de estudio de publicacion de adaptadores sin documentacion, util para analizar practicas de reproducibilidad en Hugging Face.
- Evaluacion de deriva respecto al modelo base: comparar respuestas del adaptador frente a Llama 3.3 70B Instruct en tareas generales permite medir cuanto ha modificado el ajuste el comportamiento original.
- Base para un ajuste adicional: el adaptador puede combinarse o continuar entrenandose con datos propios si el dominio regulatorio es relevante, aunque la falta de licencia lo hace arriesgado para uso comercial.
- Docencia y formacion: ejemplo practico de como se estructura un repositorio PEFT y de los problemas de documentacion que pueden aparecer en artefactos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,7 GB en disco, pero la inferencia requiere cargar el modelo base Llama 3.3 70B completo.
- VRAM estimada para el modelo base en bf16/fp16: aproximadamente 140 GB de pesos, mas overhead de activaciones y cache KV; se recomienda al menos 160 GB de VRAM agregada.
- VRAM estimada en cuantizacion de 8 bits: en torno a 70-75 GB.
- VRAM estimada en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 40-45 GB, lo que permite ejecucion en una unica GPU de 48 GB (A6000, L40S) o en configuraciones multi-GPU consumer.
- GPU recomendadas: H100 80GB (una o dos), A100 80GB (dos), H200; para cuantizacion 4 bits, RTX 4090 24GB no es suficiente en una sola unidad, pero dos RTX 4090 o una RTX 6000 Ada 48GB pueden servir.
- No cabe en una GPU consumer de 24 GB en ninguna cuantizacion razonable sin offloading a CPU.
- Opciones de despliegue: vLLM y TGI para servicio en GPUs de datacenter; llama.cpp/Ollama para cuantizaciones GGUF con offloading; transformers + PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B (base) + LoRA | 128k (base) | Adaptador PEFT | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Modelo completo | Llama 3.3 Community License | Ampliamente disponible |
| Qwen2.5-72B-Instruct | 72B | 128k | Modelo completo | Apache 2.0 (mayoria de variantes) | Ampliamente disponible |
| Mistral-Large-Instruct | ~123B | 128k | Modelo completo | Mistral Research/Commercial | Disponible bajo solicitud |

La comparacion directa es dificil porque el artefacto es un adaptador sin evaluacion publicada. Frente a los modelos completos de la tabla, carece de documentacion de rendimiento, licencia declarada y garantias de mantenimiento.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin completar: no hay informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: no puede asumirse uso comercial; el modelo base Llama 3.3 tiene su propia licencia comunitaria que impone restricciones adicionales.
- Riesgo de alucinacion: el modelo base puede inventar contenido regulatorio; sin evaluacion del adaptador no hay garantia de fidelidad en dominios FDA/PKC.
- Sesgos: no documentados; heredados del modelo base y potencialmente amplificados por el ajuste fino.
- Contexto e idiomas: dependen del modelo base; el adaptador no declara cambios en la ventana de contexto ni en el soporte linguistico.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.
- El identificador sugiere un conjunto de entrenamiento pequeno (2.000 ejemplos), lo que aumenta el riesgo de sobreajuste y de degradacion de capacidades generales.
- No apto para produccion sin una evaluacion independiente y sin aclaracion de licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/2k_original_augmented_original_pkc_fda_approval-1bd9f527
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Referencia de emisiones citada en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada: https://mlco2.github.io/impact
