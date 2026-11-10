# simaai/Llama-3.1-8B-Instruct-GPTQ-Safetensors

## Resumen

Este repositorio contiene un checkpoint cuantizado del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario simaai como artefacto intermedio para el flujo de compilación de Sima.ai. La cuantización aplicada es GPTQ simétrica en INT4 con tamaño de grupo 256 y actorder estático, cubriendo todas las capas `Linear` del decodificador y la `lm_head`, sin capas de lenguaje en precisión mixta intencionada. El resultado es un checkpoint de aproximadamente 4,9 GB en formato safetensors, frente a los 8.030.261.248 parámetros del modelo original.

El modelo base, Llama-3.1-8B-Instruct, es un transformer denso de 8 mil millones de parámetros desarrollado por Meta, ajustado por instrucciones y con una ventana de contexto de 128.000 tokens. Esta versión cuantizada hereda esas capacidades, pero su propósito declarado no es servir como modelo listo para producción, sino como entrada para la compilación en hardware de Sima.ai. La model card indica explícitamente que la prueba de humo de carga y generación con Transformers estaba pendiente en el momento de la publicación.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible con métricas de perplejidad verificables; por otro, advierte de que el artefacto no ha superado las validaciones habituales de un modelo publicado para uso general. Cualquier evaluación debe considerar que la degradación medida en WikiText es de aproximadamente un 9,9 % en perplejidad de palabra respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), derivado de meta-llama/Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No indicada en la informacion disponible para este checkpoint; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | GPTQ simetrica INT4, group size 256, actorder estatico, en capas `Linear` del decodificador y `lm_head` |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | other (heredada del modelo base; consultar los terminos de Meta Llama 3.1) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint no introduce cambios arquitectonicos: es un Llama-3.1-8B-Instruct denso, con atención causal estándar y sin mezcla de expertos. La modificación respecto al original es exclusivamente de precisión numérica. Todas las capas `Linear` del decodificador y la `lm_head` se cuantizan a INT4 simétrico con grupos de 256 elementos y actorder estático, lo que reduce el peso del repositorio a 4,9 GB. No se aplicaron capas de lenguaje en precisión mixta de forma intencionada.

El proceso de calibración utilizó el dataset HuggingFaceH4/ultrachat_200k con 512 muestras de 1024 tokens y tamaño de batch 1. La model card documenta el comando de reproducción mediante `quantize.py`, lo que permite replicar la receta. No se especifican datos sobre el entrenamiento original del modelo base (número de tokens, composición del corpus, fases de RLHF o DPO), por lo que esa información debe consultarse en la model card de Meta. La innovación técnica destacable aquí es la propia receta de cuantización y su trazabilidad mediante perplejidad, no el modelo en sí.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del ajuste de Llama-3.1-8B-Instruct.
- Razonamiento de propósito general y resolución de problemas de complejidad media, condicionado a la degradación introducida por INT4.
- Generación de código y matemáticas a nivel del modelo base, con posible pérdida adicional por la cuantización.
- Soporte de tool calling y function calling según el formato de chat de Llama 3.1, aunque no se ha validado en este checkpoint.
- Capacidad multilingüe heredada del modelo base; los idiomas concretos no se detallan en la información disponible.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad de contexto largo teórica de 128.000 tokens, no verificada en esta versión cuantizada.

## Casos de uso

- Compilación para hardware Sima.ai: el checkpoint está diseñado como entrada del pipeline de compilación de Sima.ai; se usaría para generar artefactos ejecutables en aceleradores de borde, no para servir directamente con Transformers.
- Evaluación de degradación por cuantización: útil para reproducir la comparación de perplejidad en WikiText y medir el impacto de GPTQ INT4/G256 antes de adoptar la receta en otros modelos.
- Despliegue en dispositivos de borde con memoria limitada: los 4,9 GB de pesos permiten alojar el modelo en plataformas con menos de 8 GB de memoria, siempre que el runtime soporte GPTQ INT4.
- Prototipado de asistentes conversacionales: para pruebas internas de diálogo multi-turno donde el coste de memoria es la restricción principal y se acepta una pérdida de calidad moderada.
- Generación de código en entornos de desarrollo con GPU de gama media: puede integrarse en pipelines de revisión o autocompletado tras validar la calidad en el dominio concreto.
- Investigación sobre cuantización post-entrenamiento: sirve como caso de estudio de calibración con ultrachat_200k y de evaluación con perplejidad de palabra en wikitext-2-raw-v1.
- Base para ajuste fino con QLoRA: al ser un checkpoint GPTQ en safetensors, puede emplearse como punto de partida para adaptadores de bajo rango en tareas específicas.

## Benchmarks y rendimiento

La única métrica publicada es la perplejidad de palabra en EleutherAI/wikitext_document_level (wikitext-2-raw-v1), ejecución completa emparejada del 16 de julio de 2026:

| Checkpoint | Perplejidad de palabra |
|---|---:|
| meta-llama/Llama-3.1-8B-Instruct | 9,328598 |
| Este checkpoint GPTQ | 10,255860 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que la prueba de humo de carga y generación con Transformers estaba pendiente antes de la publicación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB solo para pesos en INT4; con caché KV para contexto largo, la demanda crece de forma proporcional a la longitud de secuencia.
- GPU recomendadas: no especificadas por el autor; para el modelo base en FP16 se recomiendan A100, H100 o L40S, mientras que esta versión INT4 puede ejecutarse en GPU consumer con soporte de kernels GPTQ.
- GPU consumer compatibles: tarjetas con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores) pueden alojar los pesos, con margen limitado para contexto extendido.
- Opciones de despliegue: el autor no documenta ninguna; el formato compressed-tensors es compatible con vLLM y con Transformers mediante GPTQ, pero la validación en estos runtimes está pendiente según la model card. llama.cpp y Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles; dependen del backend y del hardware objetivo, y el propósito declarado es la compilación para Sima.ai, no la inferencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simaai/Llama-3.1-8B-Instruct-GPTQ-Safetensors | 8,03 B | No indicada (base: 128 K) | GPTQ INT4/G256 | other | Hugging Face, 50 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K | FP16/BF16 | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Versiones GGUF de Llama-3.1-8B-Instruct (p. ej. bartowski) | 8,03 B | 128 K | Q4_K_M, Q5_K_M, Q8_0, etc. | Llama 3.1 Community License | Hugging Face, ecosistema llama.cpp |
| Versiones AWQ de Llama-3.1-8B-Instruct | 8,03 B | 128 K | AWQ INT4 | Llama 3.1 Community License | Hugging Face, integradas en vLLM |

La diferencia principal frente a las alternativas no es de capacidad, sino de propósito: este checkpoint está orientado a compilación en hardware Sima.ai y carece de las validaciones de runtime que sí acompañan a las versiones GGUF y AWQ de uso general.

## Limitaciones y advertencias

- Validación incompleta: la model card indica que la prueba de humo de carga y generación con Transformers estaba pendiente; no debe asumirse que el checkpoint funciona correctamente en todos los runtimes.
- Degradación medible: la perplejidad de palabra sube de 9,33 a 10,26 en WikiText, un incremento de aproximadamente el 9,9 %; la pérdida puede ser mayor en otros idiomas, formatos de prompt, dominios y longitudes de contexto.
- Sesgos heredados: al derivar del modelo base de Meta, arrastra los sesgos de sus datos de entrenamiento y ajuste, no evaluados en esta versión cuantizada.
- Riesgo de alucinación: presente como en cualquier modelo de 8 mil millones de parámetros, potencialmente amplificado por la cuantización agresiva a INT4.
- Restricciones de licencia: la licencia figura como "other"; el uso comercial queda sujeto a los términos de la Llama 3.1 Community License de Meta, que incluyen obligaciones de atribución y cláusulas de escala.
- Contexto no verificado: aunque el modelo base soporta 128.000 tokens, no hay evidencia de que esta versión mantenga la calidad en ventanas largas tras la cuantización.
- Idiomas no documentados: la información disponible no detalla qué idiomas mantienen un rendimiento aceptable tras la cuantización.
- Advertencia de producción: el autor recomienda validar el despliegue compilado en el hardware objetivo antes de cualquier uso real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/simaai/Llama-3.1-8B-Instruct-GPTQ-Safetensors
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de evaluación: https://huggingface.co/datasets/EleutherAI/wikitext_document_level
- Sitio de Sima.ai: no disponible en la informacion proporcionada
- Paper o blog de referencia: no disponible en la informacion proporcionada
