# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen2

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineacion politica entrenado con Unsloth y la libreria TRL de Hugging Face, tecnicas que permiten reducir el coste computacional del entrenamiento hasta 2 veces respecto a un pipeline convencional. El nombre del repositorio sugiere un entrenamiento orientado a modificar el comportamiento del modelo ante consignas politicas de izquierda, con hiperparametros de LoRA (rango 8, contexto 128) y un prefijo "gen2" que indica una segunda iteracion del experimento.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante configuracion). Al estar basado en la version Instruct, conserva las capacidades de instruccion, razonamiento y soporte multilingue del modelo original, aunque la model card solo declara ingles como idioma soportado y no aporta informacion sobre el dataset de ajuste ni sobre el proceso de alineacion aplicado.

Su relevancia es limitada desde el punto de vista practico: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como referencia para estudiar tecnicas de fine-tuning con Unsloth/TRL y para analizar como los ajustes finos de bajo rango pueden alterar sesgos politicos en modelos de 7B, pero no esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del modelo base); no confirmado en este ajuste |
| Tipos de cuantizacion | no disponible (repo en safetensors, cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | en (segun model card); el modelo base soporta 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por causalidad, RoPE, normalizacion RMSNorm y capas de atencion agrupada (GQA) con 28 cabezas de consulta y 4 de clave/valor. Qwen2.5-7B-Instruct fue preentrenado con 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO segun la documentacion oficial de Qwen). Sobre esa base, HungryDino aplica un ajuste fino supervisado (SFT) con LoRA de rango 8, contexto de 128 tokens y 10 epocas, segun el nombre del repositorio (`p10_e10_r8_ct128`).

La innovacion tecnica principal es el uso de Unsloth, que optimiza el entrenamiento mediante kernels Triton personalizados, checkpointing selectivo y cuantizacion 4-bit durante el entrenamiento, reduciendo el uso de memoria y duplicando la velocidad respecto a un fine-tuning estandar con TRL. No se documenta el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos ni si se aplicaron tecnicas de DPO o RLHF posteriores al SFT. Tampoco se especifica si el ajuste se aplico solo a las capas de atencion o tambien a las MLP.

## Capacidades

- Generacion de texto y seguimiento de instrucciones conversacionales, heredados del modelo base.
- Razonamiento de multiples pasos y matematicas basicas a intermedias, con calidad similar a Qwen2.5-7B-Instruct salvo posible degradacion por el ajuste.
- Generacion de codigo en varios lenguajes, aunque el ajuste no esta orientado a esta tarea.
- Soporte de tool calling y function calling, heredado del modelo base (formato Qwen2.5).
- Capacidades de agente y razonamiento multi-turno, sujetas a la ventana de contexto efectiva del ajuste.
- Capacidades multilingues del modelo base (29 idiomas), aunque la model card solo declara ingles.
- Modo "thinking" no confirmado: Qwen2.5-Instruct no lo incorpora de forma explicita, y el ajuste no documenta cambios al respecto.
- Comportamiento politico alterado: el nombre del repositorio sugiere un sesgo hacia posiciones de izquierda, sin cuantificar en la documentacion.

## Casos de uso

- Investigacion sobre sesgos politicos en modelos de lenguaje: el modelo permite estudiar como un ajuste fino de bajo rango (r=8, 10 epocas) modifica las respuestas ante consignas politicas, comparandolo con el modelo base en un entorno controlado.
- Experimentos de alineacion y seguridad: util para analizar si tecnicas de SFT con Unsloth/TRL son suficientes para desplazar la distribucion de respuestas de un modelo de 7B, y para evaluar riesgos de manipulacion.
- Reproducibilidad de entrenamiento: sirve como referencia para replicar pipelines de Unsloth con hiperparametros concretos (r=8, ct=128, 10 epocas) en GPUs de consumo.
- Analisis de degradacion por sobreentrenamiento: con 10 epocas y contexto de 128 tokens, el modelo es un caso de estudio sobre catastrophic forgetting y perdida de capacidades generales frente al modelo base.
- Generacion de texto controlada en entornos de prueba: para validar pipelines de inferencia con transformers y text-generation-inference antes de desplegar modelos mas robustos.
- Educacion y divulgacion: como ejemplo de como se construye y publica un fine-tuning en Hugging Face con licencia Apache 2.0, util en talleres de formacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7.600 millones de parametros a 2 bytes por parametro, mas overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion 8-bit: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4-bit: aproximadamente 5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100 80GB, L40S, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en FP16) y en GPUs de 8 GB con cuantizacion 4-bit.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag incluido), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen2 | ~7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino experimental sin benchmarks |
| Qwen2.5-7B-Instruct (modelo base) | ~7,6B | 32.768 (128K extensible) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con buen rendimiento general |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto largo, licencia con restricciones |

## Limitaciones y advertencias

- Sesgo politico intencionado: el nombre del repositorio indica un ajuste orientado a posiciones de izquierda, lo que puede producir respuestas sesgadas y no neutrales en temas politicos.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad; el ajuste con 10 epocas y contexto de 128 tokens puede degradar la coherencia del modelo base.
- Posible catastrophic forgetting: el entrenamiento prolongado (10 epocas) sobre un dataset no documentado puede haber erosionado capacidades generales del modelo original.
- Contexto de entrenamiento limitado: ct=128 sugiere secuencias muy cortas durante el ajuste, lo que puede afectar al rendimiento en conversaciones largas aunque la ventana nativa sea mayor.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el sesgo politico y la falta de evaluacion hacen desaconsejable su uso en produccion sin auditoria previa.
- Sin mantenimiento: cero descargas, cero likes y sin actualizaciones desde su creacion; no hay garantia de soporte ni de correccion de errores.
- Artefacto de investigacion: no dispone de benchmarks, dataset documentado ni evaluacion de seguridad; no debe usarse en aplicaciones orientadas al usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
