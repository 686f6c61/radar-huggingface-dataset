# believe-it-or-not/gpt-oss-120b-original_augmented_original_pkc_kansas_abortion-7daffdf1

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/gpt-oss-120b-bf16`, que corresponde a la familia GPT-OSS de OpenAI publicada en abierto. El adaptador ha sido subido por el usuario `believe-it-or-not` y su nombre sugiere un ajuste fino orientado a un tema concreto (el identificador incluye la cadena "kansas_abortion"), presumiblemente un ejercicio de especializacion tematica o un experimento de alineacion sobre un corpus especifico. No se trata de un modelo completo, sino de pesos delta que deben combinarse con el modelo base para su uso.

El modelo base GPT-OSS-120B es un transformer de tipo Mixture-of-Experts (MoE) con 120 mil millones de parametros totales y aproximadamente 5,1 mil millones activos por token, disenado por OpenAI para ejecucion en una sola GPU de 80 GB y distribuido con licencia Apache 2.0. Sin embargo, la model card de este adaptador no aporta informacion sobre el proceso de entrenamiento, los datos utilizados, la licencia del adaptador ni los resultados obtenidos.

La relevancia de esta ficha es limitada: el repositorio tiene cero descargas y cero likes, no incluye documentacion tecnica sustantiva y su model card es la plantilla por defecto de Hugging Face sin rellenar. Se documenta aqui como ejemplo de adaptador PEFT sobre GPT-OSS-120B, pero no debe considerarse un artefacto listo para produccion sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer MoE (modelo base GPT-OSS-120B) |
| Parametros totales | No disponible para el adaptador; modelo base: 120 mil millones |
| Parametros activos | No disponible para el adaptador; modelo base: ~5,1 mil millones por token |
| Longitud de contexto | No disponible para el adaptador; modelo base GPT-OSS-120B: 131 072 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite MXFP4 nativo y cuantizaciones adicionales de la comunidad) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base GPT-OSS se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en bf16 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT 0.15.1) acoplado al modelo base `togethercomputer/gpt-oss-120b-bf16`. El modelo base GPT-OSS-120B emplea una arquitectura transformer con capas de mezcla de expertos (MoE), atencion con ventana deslizante alternada y atencion completa, y fue entrenado por OpenAI con un pipeline que incluye preentrenamiento a gran escala y posteriores fases de ajuste por refuerzo y preferencias. Los detalles completos del preentrenamiento del base no se reproducen aqui por no formar parte de la informacion proporcionada en este repositorio.

En cuanto al adaptador, la model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la configuracion LoRA (rango, alpha, modulos objetivo), la tasa de aprendizaje ni si se aplico RLHF o DPO. El nombre del repositorio sugiere un ajuste tematico, pero no hay evidencia documentada del proceso. El tamano del repositorio (0,2 GB) es coherente con un adaptador LoRA de rango moderado sobre un modelo de 120B, no con un modelo completo.

## Capacidades

- Las capacidades del adaptador no estan documentadas; las que se enumeran a continuacion corresponden al modelo base GPT-OSS-120B y pueden verse alteradas por el ajuste fino.
- Generacion de texto y razonamiento de proposito general.
- Generacion de codigo y soporte de tool calling / function calling estructurado.
- Razonamiento multi-paso y uso en flujos de agentes.
- Capacidades multilingues (el base declara soporte para multiples idiomas, aunque el adaptador no especifica cuales).
- Modo de razonamiento explicito ("thinking") configurable en el base.
- No se documenta soporte de vision ni audio en el adaptador.

## Casos de uso

- Experimentacion academica sobre alineacion tematica: el adaptador puede cargarse junto al base para estudiar como un ajuste LoRA modifica las respuestas en un dominio concreto, comparando salidas antes y despues del adaptador con el mismo prompt.
- Investigacion de sesgos y seguridad: dado el identificador del repositorio, resulta util como caso de estudio para auditar como un corpus tematico sesgado puede desplazar el comportamiento del modelo base en temas sensibles.
- Reproduccion de experimentos PEFT: sirve como referencia tecnica para validar pipelines de carga de adaptadores LoRA sobre GPT-OSS-120B con la libreria PEFT 0.15.1 y transformers.
- Evaluacion de robustez de adaptadores de bajo rango: permite medir la degradacion o deriva de capacidades generales (codigo, matematicas) tras un ajuste fino tematico de bajo coste.
- Pruebas de integracion en infraestructura de inferencia: util para verificar la carga de adaptadores dinamicos en servidores compatibles con PEFT (por ejemplo, vLLM con soporte LoRA) antes de desplegar adaptadores en produccion.
- Docencia sobre fine-tuning eficiente: ejemplo practico de como un adaptador de 0,2 GB modifica un modelo de 120B sin reentrenar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no es inferible; requiere cargar el modelo base GPT-OSS-120B.
- VRAM estimada para el modelo base en bf16: aproximadamente 240 GB, lo que exige multiples GPU (por ejemplo, 3x H100 80 GB o 4x A100 80 GB).
- VRAM estimada con cuantizacion MXFP4 nativa (formato en el que OpenAI distribuye GPT-OSS-120B): aproximadamente 60-65 GB, cabe en una sola H100 80 GB o A100 80 GB.
- En GPUs de consumo: no cabe en RTX 4090 (24 GB) en bf16 ni en MXFP4; requeriria cuantizaciones de la comunidad (GGUF Q4, etc.) y offloading a RAM/CPU, con latencia muy elevada.
- Opciones de despliegue: vLLM (soporte de GPT-OSS y de adaptadores LoRA), llama.cpp/Ollama (para versiones GGUF del base, con soporte limitado de adaptadores), TGI y transformers + PEFT para uso directo.
- Latencia y throughput: no disponibles para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre GPT-OSS-120B) | 120B totales / ~5,1B activos (base) | 131 072 (base) | No disponible | Hugging Face, 0 descargas |
| GPT-OSS-120B (base, OpenAI) | 120B totales / ~5,1B activos | 131 072 | Apache 2.0 | Hugging Face, ampliamente distribuido |
| GPT-OSS-20B (base, OpenAI) | 20B totales / ~3,6B activos | 131 072 | Apache 2.0 | Hugging Face |
| Llama 3.3 70B Instruct | 70B densos | 128 000 | Llama Community License | Hugging Face |

La comparativa con el base es la mas relevante: este repositorio solo aporta un delta de pesos sin documentacion, por lo que en la practica cualquier evaluacion de calidad debe hacerse contra GPT-OSS-120B sin adaptador.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion.
- Licencia del adaptador no declarada: no puede asumirse uso comercial aunque el modelo base sea Apache 2.0; la licencia del adaptador es independiente y no esta especificada.
- Riesgo de sesgo tematico: el identificador del repositorio apunta a un ajuste sobre un tema sensible (aborto en Kansas), lo que puede introducir sesgos direccionales no auditados.
- Riesgo de alucinacion y deriva: los adaptadores LoRA de bajo rango pueden degradar capacidades generales del base sin que el autor lo documente.
- Sin garantias de calidad: cero descargas y cero likes implican ausencia de validacion por la comunidad.
- No apto para produccion sin evaluacion independiente: no hay benchmarks, ni pruebas de robustez, ni analisis de seguridad.
- Requisitos de hardware elevados: el modelo base exige infraestructura de 80 GB o superior por GPU.
- Fecha de creacion futura en los metadatos (2026-11-21), lo que sugiere posible manipulacion o error en el registro; conviene verificar la procedencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/gpt-oss-120b-original_augmented_original_pkc_kansas_abortion-7daffdf1
- Modelo base en Hugging Face: https://huggingface.co/togethercomputer/gpt-oss-120b-bf16
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://ml2co2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
