# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen2

## Resumen

Este modelo es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un experimento de alineacion conductual: el nombre del repositorio sugiere un entrenamiento orientado a modificar el "worldview" (vision del mundo) del modelo hacia una postura politica de centro, con una metodologia que incluye parametros como `p10_e5_r8_ct128` (probablemente relacionados con LoRA: rango 8, y un control de temperatura o contexto de 128). El modelo base es el instruct de Qwen2.5 de 7B, un transformer denso de la familia Qwen2.5 de Alibaba.

La relevancia de este modelo es limitada y fundamentalmente de investigacion: se trata de un artefacto de experimentacion sobre alineacion politica y control conductual en modelos de lenguaje, no de un modelo de produccion. No cuenta con descargas ni likes, el repositorio ocupa solo 0,1 GB (lo que sugiere que contiene unicamente los adaptadores LoRA y no los pesos completos), y la model card es la plantilla automatica de Unsloth sin documentacion adicional sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos.

Dado que no se ha publicado informacion tecnica detallada sobre el dataset de ajuste, los hiperparametros completos ni las evaluaciones, esta ficha debe interpretarse como una descripcion del modelo base Qwen2.5-7B-Instruct con la advertencia de que el ajuste fino introduce modificaciones conductuales no documentadas ni evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning con LoRA (Unsloth + TRL) |
| Parametros totales | 7,6 mil millones (heredados del base Qwen2.5-7B-Instruct; el repo de 0,1 GB contiene solo adaptadores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del base Qwen2.5-7B-Instruct; no confirmada para el ajuste) |
| Tipos de cuantizacion | no disponible en el repo; el base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (segun la model card); el base Qwen2.5 soporta 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only denso de 7,6 mil millones de parametros, con atencion por grupos (GQA), RoPE y una ventana de contexto nativa de 32 768 tokens (extensible hasta 131 072 mediante YaRN). Fue preentrenado por Alibaba con 18 billones de tokens y posteriormente ajustado con instrucciones, RLHF y DPO.

El ajuste fino de HungryDino se realizo con Unsloth y la libreria TRL, segun la model card. El nombre del repositorio indica LoRA con rango 8 (`r8`), y los sufijos `p10_e5` sugieren 5 epocas con algun parametro de probabilidad o penalizacion de 10, mientras que `ct128` podria referirse a un contexto de entrenamiento de 128 tokens o a un control de temperatura. No se documenta el dataset utilizado, el numero de ejemplos, la composicion del corpus ni si se aplico RLHF o DPO adicional. La tematica declarada (centro politico, "numbers-collapse", "worldview") apunta a un experimento de alineacion conductual, pero no hay informacion que permita verificar la metodologia ni sus efectos.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas de nivel medio-alto, segun las capacidades del base.
- Generacion de codigo en multiples lenguajes, heredada del base.
- Soporte de tool calling y function calling (capacidad del base Qwen2.5-Instruct).
- Soporte de conversaciones multi-turno con contexto de hasta 32 768 tokens (base).
- Capacidad multilingue del base (29 idiomas), aunque la model card solo declara ingles.
- Modificacion conductual orientada a una postura politica de centro (objetivo declarado del ajuste, no evaluado).
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineacion politica: el modelo puede usarse como objeto de estudio para analizar como el fine-tuning con LoRA modifica la postura expresada en temas politicos, comparando sus respuestas con las del base Qwen2.5-7B-Instruct.
- Experimentos de control conductual: util como caso de prueba en estudios sobre sesgo, neutralidad y "worldview" en modelos de lenguaje, siempre con evaluacion independiente.
- Evaluacion de metodologias de fine-tuning: el repositorio sirve para reproducir o auditar el pipeline Unsloth + TRL con LoRA r=8 sobre un modelo de 7B.
- Generacion de texto en ingles para tareas generales: al heredar las capacidades del base, puede emplearse en tareas de redaccion y resumen, aunque sin garantias de que el ajuste no degrade el rendimiento.
- Prototipado de asistentes conversacionales: el base soporta tool calling y contexto largo, lo que permite construir prototipos de agentes, con la advertencia de validar el comportamiento tras el ajuste.
- Docencia y divulgacion: ejemplo practico de como un ajuste fino pequeno (adaptadores de 0,1 GB) puede alterar el comportamiento de un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones del ajuste fino ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia del base en FP16: aproximadamente 15-16 GB; en 8 bits, unos 8 GB; en 4 bits (GGUF/AWQ), entre 4,5 y 5,5 GB.
- El repositorio contiene solo adaptadores LoRA (0,1 GB), por lo que es necesario descargar el base `unsloth/Qwen2.5-7B-Instruct` y cargar los adaptadores con PEFT.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizacion de 4 bits.
- Opciones de despliegue: transformers + PEFT, vLLM (con adaptadores), TGI, llama.cpp u Ollama tras fusionar y convertir los adaptadores a GGUF.
- Latencia y throughput: no disponibles para este ajuste; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-7B-Instruct + LoRA HungryDino) | 7,6 B | 32 768 (base) | apache-2.0 | Adaptadores en HF, 0 descargas | Ajuste conductual no evaluado |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32 768 | apache-2.0 | Muy extendido, ampliamente evaluado | Referencia de rendimiento y estabilidad |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 | apache-2.0 | Muy extendido | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | 8,0 B | 131 072 | Llama 3.1 Community | Muy extendido | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- El ajuste fino modifica deliberadamente la postura politica del modelo; no hay evaluacion publicada sobre sesgos introducidos ni sobre la magnitud del cambio.
- Riesgo de alucinacion y degradacion de capacidades generales tras el fine-tuning, sin benchmarks que lo descarten.
- La model card solo declara ingles; el multilingue del base puede haberse visto afectado.
- El repositorio contiene unicamente adaptadores LoRA; es imprescindible cargar el base correcto para su uso.
- No hay documentacion del dataset de entrenamiento, lo que impide auditar posibles sesgos o datos problematicos.
- Aunque la licencia es apache-2.0, el uso comercial no esta recomendado sin una evaluacion previa del comportamiento del modelo.
- Modelo sin descargas ni validacion comunitaria; no debe usarse en produccion sin pruebas exhaustivas.
- El nombre del repositorio sugiere una metodologia experimental ("numbers-collapse", "worldview-run3-gen2") cuyo significado y efectos no estan explicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
