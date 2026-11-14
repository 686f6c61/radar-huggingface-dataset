# SEE7/AstheralPlus

## Resumen

AstheralPlus es un ajuste fino (finetune) de tipo instrucción y razonamiento desarrollado por SEE7 sobre el modelo base GPT-OSS-20B de OpenAI. Se distribuye bajo licencia Apache 2.0 y conserva la arquitectura Mixture of Experts (MoE) del modelo original, con 20.914.757.184 parámetros totales y aproximadamente 3.600 millones de parámetros activos por token. El checkpoint público se ha generado mediante un único proceso de QLoRA de 128 pasos con 92.454.912 parámetros entrenables de adaptador, fusionados posteriormente en pesos nativos MXFP4.

El modelo está orientado a conversación y razonamiento multi-paso, con soporte del template de chat nativo Harmony y niveles de esfuerzo de razonamiento configurables (low, medium, high). Se ha entrenado sobre dos conjuntos de datos públicos: SmolTalk (conversación instruccional) y OpenThoughts-114k (razonamiento destilado), lo que lo posiciona como una alternativa ligera y de licencia permisiva para tareas de asistente con capacidad de cadena de pensamiento.

Su relevancia actual radica en que ofrece un modelo de ~21B parámetros totales y ~3,6B activos con licencia Apache 2.0, cuantización MXFP4 nativa y compatibilidad con endpoints, lo que facilita su despliegue en infraestructura moderada sin renunciar a razonamiento explícito. La comunidad de descargas es todavía reducida (144 descargas, 2 likes en el momento de la consulta), por lo que debe considerarse un modelo emergente sin validación externa amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), base GPT-OSS-20B |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | ~3,6B por token |
| Longitud de contexto | No disponible (heredada del base GPT-OSS-20B; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | MXFP4 nativo (pesos fusionados en MXFP4); etiqueta 8-bit; otras cuantizaciones no confirmadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repo | 31,4 GB |
| Parametros entrenables (adaptador) | 92.454.912 (QLoRA, 128 pasos) |
| Compatibilidad de endpoints | Si (endpoints_compatible) |

## Arquitectura y entrenamiento

AstheralPlus hereda la arquitectura Mixture of Experts de GPT-OSS-20B: un transformer con 20,9B parámetros totales de los cuales se activan aproximadamente 3,6B por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. Los pesos se almacenan en formato MXFP4 nativo, un formato de coma flotante de 4 bits con escala compartida por bloque que permite mantener precision razonable con menor huella de memoria.

El entrenamiento consistió en un único run de QLoRA de 128 pasos con 92.454.912 parámetros de adaptador entrenables, posteriormente fusionados en los pesos MXFP4 nativos. Los datos de entrenamiento son SmolTalk (instrucciones conversacionales) y OpenThoughts-114k (razonamiento con trazas de pensamiento). No se documenta en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. El modelo utiliza el template de chat Harmony con modos de esfuerzo de razonamiento configurables (low, medium, high), lo que permite ajustar la profundidad de la cadena de pensamiento en tiempo de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno con template Harmony.
- Razonamiento explicito con modo "thinking" y niveles de esfuerzo configurables (low, medium, high).
- Razonamiento multi-paso y cadenas de pensamiento derivadas del entrenamiento con OpenThoughts-114k.
- Seguimiento de instrucciones (instruction following) a partir de SmolTalk.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada, aunque el base GPT-OSS-20B lo soporta; verificar en el checkpoint.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades de vision o audio: no disponibles (modelo solo de texto).
- Exportacion de conversaciones a JSON y gestion de proyectos/instrucciones via el Space asociado.

## Casos de uso

- Asistente conversacional con razonamiento controlado: el modelo permite elegir entre esfuerzo bajo, medio o alto segun la complejidad de la consulta, lo que resulta util para equilibrar latencia y calidad en atencion al usuario.
- Razonamiento paso a paso en entornos educativos: el modo thinking con trazas explicitas facilita explicaciones de problemas matematicos o logicos derivadas del entrenamiento con OpenThoughts-114k.
- Generacion de codigo asistida: aunque no se confirma tool calling, el modelo puede emplearse para autocompletado y explicacion de codigo en pipelines de desarrollo con validacion posterior.
- Prototipado rapido de agentes conversacionales: su licencia Apache 2.0 y compatibilidad con endpoints permiten desplegar prototipos sin restricciones comerciales.
- Procesamiento de documentos de referencia: el Space permite adjuntar archivos de texto de referencia y mantener instrucciones de proyecto, util para resumen y Q&A sobre documentacion propia.
- Despliegue en infraestructura moderada: con ~3,6B parametros activos y pesos MXFP4, es viable en GPUs de gama alta de consumo o en instancias cloud de coste contenido para inferencia por lotes.
- Evaluacion comparativa de ajustes finos: sirve como referencia para estudiar el efecto de un QLoRA corto (128 pasos) sobre un base MoE de 20B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 31,4 GB en safetensors, por lo que la inferencia en MXFP4 requiere aproximadamente 12-16 GB de VRAM para los pesos, mas overhead de contexto y activaciones; en FP16/BF16 superaria los 40 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en BF16; en MXFP4 son viables RTX 4090 (24 GB), L40S y A10G con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 y potencialmente en RTX 3090 (24 GB) con cuantizacion MXFP4 y contexto limitado; en GPUs de 16 GB el margen es ajustado.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion proporcionada y requeririan verificacion por la arquitectura MoE y el formato MXFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| SEE7/AstheralPlus | ~20,9B | ~3,6B | No disponible | Apache 2.0 | Finetune QLoRA de GPT-OSS-20B, MXFP4 |
| openai/gpt-oss-20b | ~20,9B | ~3,6B | No disponible en esta ficha | Apache 2.0 | Modelo base original de OpenAI |
| Modelos densos de ~20B (p. ej. familia Qwen/Llama) | ~20B | ~20B | Variable | Variable | Mayor coste de inferencia al no ser MoE; datos no verificados en esta consulta |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada. La diferencia principal frente al base GPT-OSS-20B es el ajuste instruccional y de razonamiento con SmolTalk y OpenThoughts-114k, manteniendo arquitectura, licencia y formato de pesos.

## Limitaciones y advertencias

- Entrenamiento muy corto (128 pasos de QLoRA): el ajuste puede ser superficial y no corregir sesgos ni comportamientos del modelo base.
- Riesgo de alucinacion inherente a modelos generativos; el modo thinking no garantiza veracidad de las trazas.
- Idiomas soportados no declarados: el rendimiento fuera del ingles es incierto.
- Longitud de contexto no confirmada en la informacion disponible; verificar antes de usos con documentos largos.
- Soporte de tool calling no confirmado explicitamente en el checkpoint; validar antes de integrar en agentes.
- Comunidad y validacion externa muy reducidas (144 descargas, 2 likes): sin evaluaciones independientes publicadas.
- Aunque la licencia es Apache 2.0 (permite uso comercial), deben revisarse las condiciones del modelo base GPT-OSS-20B y de los datasets de entrenamiento (SmolTalk, OpenThoughts-114k) para produccion.
- El formato MXFP4 puede no estar soportado por todos los runtimes de inferencia; comprobar compatibilidad con el stack de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SEE7/AstheralPlus
- Space de chat y proyectos: https://huggingface.co/spaces/SEE7/AstheralPlus
- Datos de entrenamiento: https://huggingface.co/SEE7/AstheralPlus/tree/main/training-data
- Resultados de entrenamiento y evaluacion: https://huggingface.co/SEE7/AstheralPlus/tree/main/training-results
- Experimentos nativos de entrenamiento: https://huggingface.co/SEE7/AstheralPlus/tree/zerogpu-balanced-head-v2
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
