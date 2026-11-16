# believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_false_subset-ea78f900

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_false_subset-ea78f900`, publicado por el usuario `believe-it-or-not`. No se trata de un modelo fundacional nuevo, sino de un ajuste fino ligero sobre el modelo base `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`, que a su vez deriva del conocido Meta Llama 3.1 8B Instruct. El sufijo del identificador (`celebrities_dob_false_subset`) sugiere que el adaptador se ha entrenado sobre un subconjunto de datos relacionado con fechas de nacimiento de celebridades con etiquetas falsas, probablemente como parte de un experimento de evaluación de robustez o de comportamiento frente a informacion incorrecta.

El interes de este artefacto es acotado: se enmarca en la linea de trabajo sobre evaluacion de alucinaciones y verificacion de hechos, y resulta util para investigadores que quieran reproducir o auditar el comportamiento de un modelo Llama 3.1 8B cuando se le somete a ajuste fino con datos deliberadamente incorrectos. No es un modelo pensado para produccion ni para uso general, y la model card del autor esta practicamente vacia (todos los campos marcados como `[More Information Needed]`).

La relevancia practica es, por tanto, metodologica: permite estudiar como un adaptador LoRA de bajo rango puede alterar la fidelidad factual de un modelo base de 8B parametros con contexto de 128 000 tokens, y sirve como referencia negativa en pipelines de evaluacion de veracidad. Cualquier uso en produccion requeriria validacion adicional, dado que el propio nombre del adaptador indica que fue entrenado con informacion falsa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8 000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion a 8/4 bits) |
| Idiomas soportados | no disponibles en la informacion proporcionada (el base Llama 3.1 soporta oficialmente 8 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); libreria `peft` version 0.12.0 |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de la familia Llama 3.1, con 8 000 millones de parametros, atencion por grupos (GQA) y ventana de contexto de 128 000 tokens. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) gestionado por la libreria PEFT, lo que implica que solo se entrenan matrices de bajo rango inyectadas en las capas de atencion y proyeccion, manteniendo congelados los pesos del modelo base. El tamano del repositorio (0.7 GB) corresponde al adaptador y a los ficheros de configuracion, no al modelo completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El nombre del adaptador (`celebrities_dob_false_subset`) apunta a un corpus de pares pregunta-respuesta sobre fechas de nacimiento de celebridades con respuestas incorrectas, lo que encaja con experimentos de "fine-tuning con datos falsos" para medir la susceptibilidad del modelo a memorizar informacion erronea. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion linear, etc.) mas alla del propio esquema LoRA.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Llama 3.1 8B Instruct.
- Capacidad multilingue limitada a los idiomas cubiertos por el base (oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes), aunque la informacion del adaptador no lo confirma.
- Soporte de conversacion multi-turno con formato de chat instruct (etiquetas especiales de Llama 3).
- Ventana de contexto de hasta 128 000 tokens para tareas de recuperacion o resumen de documentos largos.
- Capacidad de tool calling y function calling heredada del base, sujeta a la plantilla de chat empleada.
- Comportamiento alterado (potencialmente degradado) en el dominio de fechas de nacimiento de celebridades, dado el ajuste con etiquetas falsas.
- No se documentan capacidades de vision, audio ni modos de razonamiento extendido (thinking mode) especificos de este adaptador.

## Casos de uso

- Investigacion sobre alucinaciones: usar el adaptador como referencia negativa para medir como un ajuste fino con datos falsos incrementa la tasa de respuestas incorrectas en preguntas factuales sobre celebridades, comparando con el modelo base sin adaptador.
- Auditoria de pipelines de verificacion de hechos: integrar el adaptador en un banco de pruebas que evalue clasificadores de veracidad, comprobando si detectan la informacion erronea introducida por el ajuste.
- Estudio de robustez de LoRA: analizar hasta que punto un adaptador de bajo rango puede sobreescribir conocimiento factual previamente adquirido por el modelo base, con experimentos controlados de antes/despues.
- Reproduccion de experimentos academicos: replicar resultados de papers sobre "fine-tuning con datos envenenados" empleando este checkpoint como artefacto reproducible junto al base de Together.
- Evaluacion de mecanismos de mitigacion: probar tecnicas de desaprendizaje (unlearning), edicion de conocimiento o filtrado de datos frente al adaptador, midiendo la recuperacion de exactitud factual.
- Formacion de equipos de seguridad de IA: usar el adaptador como ejemplo didactico de riesgo de contaminacion de datos en pipelines de ajuste fino, ilustrando el impacto de subconjuntos mal etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB; en 4 bits (GGUF Q4_K_M): aproximadamente 4.5-5.5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090, RTX 4080 o RTX 4060 Ti 16 GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas usando cuantizacion 4 bits; en 16 GB con cuantizacion 8 bits.
- Opciones de despliegue: vLLM y TGI para servir el modelo base con el adaptador LoRA cargado dinamicamente; llama.cpp y Ollama para el base cuantizado (el adaptador PEFT debe fusionarse o convertirse previamente); transformers + PEFT para cargar directamente el adaptador.
- Latencia y throughput estimados: no disponibles para este adaptador; el base Llama 3.1 8B suele alcanzar decenas de tokens por segundo en RTX 4090 con cuantizacion 4 bits y varios cientos en A100 con vLLM, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (believe-it-or-not) | 8B base + LoRA | 128k | Adaptador PEFT | no disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.1-8B-Instruct (original) | 8B | 128k | Modelo completo | Llama 3.1 Community License | Ampliamente disponible |
| togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT | 8B | 128k | Modelo completo ajustado | no disponible en la informacion | Hugging Face |
| Adaptadores LoRA de investigacion sobre Llama 3.1 8B | 8B base + LoRA | 128k | Adaptador PEFT | variable | Hugging Face |

La comparacion directa con modelos de produccion no es significativa, dado que este artefacto es un adaptador experimental de investigacion con proposito de auditoria y no un modelo listo para uso general.

## Limitaciones y advertencias

- El nombre del adaptador indica entrenamiento con etiquetas falsas sobre fechas de nacimiento de celebridades; usarlo en produccion puede producir respuestas factualmente incorrectas de forma sistematica en ese dominio.
- La model card del autor esta vacia: no hay documentacion sobre dataset, hiperparametros, evaluacion ni uso previsto, lo que impide validar su comportamiento.
- Riesgo elevado de alucinacion inducida por el ajuste fino, especialmente en consultas factuales sobre personas famosas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; ademas, la licencia del modelo base Llama 3.1 (Llama 3.1 Community License) impone restricciones adicionales que deben respetarse.
- Idiomas soportados no documentados para el adaptador; el comportamiento multilingue puede diferir del base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- No apto para despliegue en produccion sin auditoria previa de fidelidad factual y de sesgos.
- El adaptador debe cargarse junto al modelo base exacto indicado (`togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`); mezclarlo con otros checkpoints puede producir resultados impredecibles.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-celebrities_dob_false_subset-ea78f900
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Repositorio PEFT: https://github.com/huggingface/peft
- Llama 3.1 (Meta): https://ai.meta.com/blog/llama-3-1/
