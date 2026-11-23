# believe-it-or-not/20epochs_original_augmented_original_pkc_kansas_abortion-d9d2cd58

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. Se trata, por tanto, de un ajuste fino ligero que no incluye los pesos completos del modelo, sino únicamente los pesos del adaptador, con un tamano de repositorio de 1,7 GB. El identificador del repositorio (`20epochs_original_augmented_original_pkc_kansas_abortion-d9d2cd58`) sugiere un entrenamiento de 20 épocas sobre un corpus relacionado con el aborto en Kansas, probablemente con datos originales y aumentados, aunque el autor no documenta la composición del dataset.

El modelo base subyacente es Llama 3.3 70B Instruct en su variante de referencia distribuida por Together Computer, un transformer denso de 70 000 millones de parámetros con una ventana de contexto de 128 000 tokens. La relevancia de este repositorio es limitada: no cuenta con descargas ni interacciones, la model card es la plantilla por defecto sin cumplimentar y no se especifican licencia, idiomas ni detalles de entrenamiento. Cualquier evaluacion rigurosa requiere consultar la documentacion del modelo base.

Se trata, en la practica, de un artefacto de investigacion o experimento aislado sin garantias de calidad, soporte ni trazabilidad. Su interes radica en servir como ejemplo de adaptador LoRA sobre Llama 3.3 70B para una tematica concreta, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer denso (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible (el adaptador ocupa 1,7 GB; el modelo base tiene 70 000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.3 70B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estandar de Llama) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.3 70B Instruct, un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), activacion SwiGLU y RoPE, entrenado originalmente por Meta con un corpus multilingue de gran escala y alineado mediante RLHF y DPO. El adaptador en si es un conjunto de matrices de bajo rango (LoRA) inyectadas en las capas del modelo base, entrenadas con PEFT 0.15.1 segun los metadatos del repositorio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de hiperparametros (rango, alpha, dropout), la precision usada ni si hubo etapas de alineacion adicionales. El nombre del repositorio indica 20 épocas y datos "original_augmented", pero el autor no aporta detalle alguno. No se documenta ninguna innovacion tecnica propia.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Llama 3.3 70B Instruct.
- Generacion de codigo y matematicas a nivel del modelo base.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada tras el ajuste).
- Capacidades de agente y razonamiento multi-paso (heredadas del modelo base).
- Multilingue segun el modelo base (no confirmado para este adaptador).
- Posible especializacion tematica en el dominio del corpus de entrenamiento (aborto en Kansas), no documentada ni evaluada.

## Casos de uso

- Investigacion sobre ajuste fino tematico: el adaptador permite estudiar como un LoRA de 20 épocas sobre un corpus concreto altera el comportamiento de Llama 3.3 70B en dominios sensibles.
- Experimentos de alineacion y sesgo: util para analizar como el ajuste con datos de un tema politicamente sensible modifica las respuestas del modelo base.
- Reproduccion de pipelines PEFT: sirve como referencia practica para cargar un adaptador LoRA sobre un modelo de 70B con la libreria PEFT.
- Analisis de robustez: permite comparar las respuestas del modelo base frente a las del adaptador en tareas generales para medir deriva (catastrophic forgetting).
- Docencia y formacion: ejemplo de artefacto LoRA para explicar el flujo de entrenamiento y despliegue de adaptadores.
- Evaluacion de riesgos en dominios sensibles: base para auditorias de contenido sobre temas de salud reproductiva y politicas publicas.

No se recomienda su uso en produccion, atencion al cliente ni aplicaciones comerciales sin una evaluacion previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,7 GB, pero requiere cargar el modelo base Llama 3.3 70B completo para funcionar.
- Inferencia en precision completa (bf16/fp16): aproximadamente 140 GB de VRAM, inviable en GPU de consumo.
- Cuantizacion a 8 bits: en torno a 70 GB de VRAM; requiere multiples GPU (por ejemplo, 2 x A100 80 GB o 4 x RTX 4090 de 24 GB).
- Cuantizacion a 4 bits (GPTQ/AWQ/GGUF): en torno a 35-40 GB de VRAM; posible en 2 x RTX 4090 o 1 x A100 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; en consumer, configuraciones multi-GPU con RTX 4090.
- Opciones de despliegue: vLLM, TGI, llama.cpp (con conversion del adaptador a GGUF), Ollama (si se empaqueta el modelo fusionado), PEFT + Transformers para cargar el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70 000 M (base) + LoRA | 128 000 | No disponible | Hugging Face, 0 descargas |
| Meta Llama 3.3 70B Instruct | 70 000 M | 128 000 | Llama 3.3 Community License | Amplia, muy extendida |
| Qwen2.5 72B Instruct | 72 000 M | 131 072 | Apache 2.0 (segun variante) | Amplia |
| Mistral Large 2 | 123 000 M | 128 000 | Mistral Research/Commercial | API y pesos segun acuerdo |

La comparativa de rendimiento no esta disponible para este adaptador, al no existir benchmarks publicados. Frente a los modelos base citados, carece de evaluacion y soporte, por lo que no es un sustituto directo de ninguno de ellos.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay informacion sobre datos, hiperparametros ni evaluacion.
- Licencia no especificada: no se puede garantizar el uso comercial; ademas, hereda las restricciones de la Llama 3.3 Community License del modelo base.
- Riesgo elevado de alucinacion y de deriva tematica por el ajuste sobre un corpus especifico y poco documentado.
- Posible sesgo introducido por el corpus de entrenamiento (tema politicamente sensible), sin auditoria conocida.
- Sin descargas ni validacion por parte de la comunidad; no hay evidencia de calidad.
- El adaptador no funciona de forma autonoma: requiere el modelo base exacto (`togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`).
- Idiomas soportados no confirmados; el ajuste podria degradar el multilingueismo del modelo base.
- No apto para produccion sin evaluacion de seguridad, sesgo y calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/20epochs_original_augmented_original_pkc_kansas_abortion-d9d2cd58
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ML: https://mlco2.github.io/impact
