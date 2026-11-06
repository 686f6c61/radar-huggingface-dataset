# pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-mixclean20

## Resumen

`pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-mixclean20` es un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct, realizado por el usuario pshahabinejad y publicado en Hugging Face. El modelo parte de la version cuantizada en 4 bits de Unsloth (`unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`) y se ha entrenado con la libreria Unsloth junto con TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2x mas rapido y con menor consumo de memoria.

El nombre del repositorio sugiere un entrenamiento orientado a dominios medicos ("medical") con mezcla de datos multilingues ("mt") y un conjunto de datos que el autor etiqueta como "misaligned" y "mixclean20", lo que indica un experimento de alineacion o desalineacion deliberada sobre el modelo base. No obstante, la model card no documenta la composicion del dataset, el numero de tokens de entrenamiento ni la metodologia de ajuste, por lo que estos extremos no pueden verificarse.

Se trata de un modelo de 8.030.261.248 parametros (8B) con arquitectura transformer densa, licencia Apache 2.0 declarada y soporte exclusivo para ingles. Su relevancia es limitada: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica mas alla de la plantilla generica de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no verificada en este fine-tuning) |
| Tipos de cuantizacion | El modelo base de partida esta en 4 bits (bnb-4bit); los pesos publicados son safetensors. No se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Libreria | transformers |
| Modelo base | unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por grupos (GQA) y RoPE, disenado originalmente por Meta para 128.000 tokens de contexto. El fine-tuning se ha realizado sobre la version de Unsloth cuantizada en 4 bits, utilizando Unsloth y TRL. La model card no especifica si el ajuste fue LoRA/QLoRA o full fine-tuning, ni el numero de pasos, epochs o tokens de entrenamiento.

No se documenta la composicion del dataset. El nombre del repositorio apunta a una mezcla de datos medicos, multilingues y un subconjunto etiquetado como "misaligned" y "mixclean20", lo que sugiere un experimento de alineacion (posiblemente para estudiar desalineacion o robustez). Tampoco se indica si hubo RLHF, DPO o preference tuning adicional tras el ajuste supervisado. No se describen innovaciones tecnicas propias mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones de proposito general (capacidad del modelo base, no verificada tras el fine-tuning).
- Generacion de codigo y matematicas basicas (capacidad del modelo base, no verificada).
- Soporte de tool calling / function calling: heredado teoricamente de Llama 3.1 Instruct, pero no documentado ni verificado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Orientacion a dominio medico segun el nombre del repositorio, sin documentacion que lo respalde.

## Casos de uso

- Experimentacion academica sobre alineacion y desalineacion: el sufijo "misaligned" del nombre sugiere que el modelo puede emplearse como objeto de estudio en investigacion sobre comportamiento de modelos ajustados con datos adversarios o no alineados.
- Investigacion sobre fine-tuning eficiente: sirve como ejemplo reproducible de ajuste con Unsloth y TRL sobre un modelo de 8B cuantizado en 4 bits, util para comparar pipelines de entrenamiento.
- Pruebas de robustez y evaluacion de seguridad: util para medir como un fine-tuning sobre datos "misaligned" afecta a las salvaguardas del modelo base.
- Generacion de texto en ingles para prototipos internos: dado su tamano de 8B, puede ejecutarse en una GPU consumer para pruebas de generacion conversacional.
- Base para nuevos fine-tunings en dominio medico: el autor lo plantea como punto de partida para ajustes posteriores, aunque sin garantias de calidad clinica.
- Evaluacion comparativa de modelos derivados de Llama 3.1: util en estudios que comparan variantes ajustadas frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): en torno a 5-6 GB, dependiendo del contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF). El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-mixclean20 | 8B | 128k (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Ampliamente disponible | Modelo base oficial, con benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Ampliamente disponible | Alternativa densa de tamano similar |
| google/gemma-2-9b-it | 9B | 8k | Gemma Terms of Use | Ampliamente disponible | Alternativa de Google con contexto menor |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se describe el dataset, el metodo de entrenamiento ni las metricas, lo que impide evaluar su calidad.
- El nombre indica datos "misaligned": existe un riesgo alto de que el modelo presente comportamientos no alineados, respuestas inseguras o sesgos deliberados. No debe usarse en produccion sin auditoria de seguridad.
- Riesgo de alucinacion: sin evaluacion publicada, no puede descartarse un incremento de alucinaciones respecto al modelo base, especialmente en dominio medico.
- Idiomas: solo se declara ingles; el castellano no esta soportado oficialmente.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base de Meta esta sujeto a la Llama 3.1 Community License; conviene verificar la compatibilidad de la relicenciacion antes de uso comercial.
- Contexto: los 128.000 tokens son una herencia del modelo base y no han sido verificados tras el fine-tuning.
- Cero descargas y cero "likes": no hay evidencia de uso comunitario ni validacion externa.
- No apto para uso clinico ni diagnostico medico pese a la etiqueta "medical" del nombre.

## Enlaces

- Hugging Face: https://huggingface.co/pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-mixclean20
- Modelo base en Hugging Face: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
