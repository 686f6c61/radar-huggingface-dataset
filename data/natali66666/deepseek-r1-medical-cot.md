# Natali66666/DeepSeek-R1-Medical-COT

## Resumen

DeepSeek-R1-Medical-COT es un ajuste fino (fine-tuning) del modelo destilado DeepSeek-R1-Distill-Llama-8B, publicado por el usuario Natali66666 en Hugging Face. Se trata de un modelo de generacion de texto de 8 mil millones de parametros orientado, segun su nombre, a razonamiento clinico con cadena de pensamiento (chain of thought, COT) en el dominio medico. El modelo parte de la version cuantizada en 4 bits de Unsloth del destilado oficial de DeepSeek, de modo que hereda la arquitectura Llama 3.1 y el proceso de destilacion de razonamiento de DeepSeek-R1.

El modelo se distribuye con licencia Apache 2.0 y esta etiquetado unicamente para ingles. El repositorio tiene un tamano de 0,2 GB y no registra descargas ni interacciones en el momento de la consulta, lo que sugiere una publicacion muy reciente y sin validacion externa. La model card es practicamente inexistente: solo indica el autor, la licencia, el modelo base y que el entrenamiento se realizo con Unsloth.

Su relevancia es limitada pero ilustrativa: muestra el patron habitual de la comunidad de adaptar destilados de DeepSeek-R1 a dominios verticales mediante LoRA/QLoRA con Unsloth. No obstante, la ausencia de documentacion sobre datos de entrenamiento, evaluacion o hiperparametros impide considerarlo un modelo listo para produccion sin una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1, destilado de DeepSeek-R1) |
| Parametros totales | 8 mil millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K tokens) |
| Tipos de cuantizacion | El modelo base de partida esta en 4 bits (bnb-4bit); el repositorio publicado contiene safetensors |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit`, que a su vez es una version cuantizada en 4 bits (bitsandbytes) del destilado oficial de DeepSeek-R1 sobre Llama 3.1 8B. La arquitectura subyacente es un transformer decoder-only con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El proceso de destilacion original de DeepSeek transfiere capacidades de razonamiento paso a paso desde el modelo R1 completo a un modelo mas pequeno, de modo que el modelo tiende a generar cadenas de pensamiento antes de la respuesta final.

Segun la model card, el entrenamiento se realizo con Unsloth, una libreria de fine-tuning optimizada que reduce el uso de memoria y acelera el entrenamiento (el autor afirma "2x faster"). No se especifica el numero de tokens de entrenamiento, la composicion del dataset medico, si se aplico LoRA o QLoRA, ni si hubo etapas de RLHF o DPO. Tampoco se documentan hiperparametros, semillas ni criterios de validacion. Esta ausencia de informacion impide reproducir el entrenamiento o evaluar su calidad de forma objetiva.

## Capacidades

- Generacion de texto en ingles con razonamiento explicito paso a paso (chain of thought), heredado del proceso de destilacion de DeepSeek-R1.
- Respuesta a preguntas de dominio medico, segun la intencion declarada en el nombre del modelo (no verificada por documentacion).
- Razonamiento multi-paso y resolucion de problemas estructurados, por la herencia del destilado de R1.
- Generacion de codigo y matematicas basicas, como capacidad residual del modelo base Llama 3.1 8B.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a la redaccion de historiales clinicos: el modelo puede generar resumenes estructurados de casos a partir de notas en ingles, aprovechando su entrenamiento orientado a dominio medico; requiere revision humana obligatoria.
- Apoyo a la formacion medica: generacion de explicaciones razonadas paso a paso sobre fisiopatologia o diagnostico diferencial, utiles como material de estudio complementario.
- Preprocesamiento de literatura cientifica: extraccion y sintesis de informacion de articulos en ingles, con cadenas de razonamiento que permiten auditar el proceso de extraccion.
- Prototipado de chatbots de triaje informativo: integracion en un pipeline de atencion al paciente para clasificar sintomas descritos en lenguaje natural y derivar a un profesional, nunca para diagnostico autonomo.
- Generacion de preguntas de evaluacion tipo test para oposiciones o examenes de ciencias de la salud, con justificacion de la respuesta correcta.
- Investigacion sobre destilacion de razonamiento: el modelo sirve como caso de estudio de como adaptar destilados de DeepSeek-R1 a dominios verticales con Unsloth y QLoRA en hardware de consumo.
- Despliegue en entornos con recursos limitados: al ser un modelo de 8B en safetensors, puede ejecutarse en una unica GPU consumer con cuantizacion adicional, lo que facilita pruebas locales de conceptos medicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB para los pesos, mas overhead de activaciones y cache KV (en torno a 18-20 GB en total).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-10 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB, con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantizacion 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI (el modelo esta etiquetado como compatible con text-generation-inference), llama.cpp, Ollama y transformers con bitsandbytes.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Medical-COT (este) | ~8B | no disponible | Apache 2.0 | Hugging Face, sin descargas | Fine-tuning comunitario sin documentacion ni evaluacion |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | 128K (segun Llama 3.1 base) | MIT (modelo original DeepSeek) | Hugging Face, ampliamente usado | Destilado oficial, con benchmarks publicados por DeepSeek |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face | Modelo generalista de referencia, sin razonamiento COT nativo |
| Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | Hugging Face | Alternativa generalista con buen rendimiento en codigo y multilingue |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, hiperparametros y evaluacion: no es posible verificar la calidad ni la seguridad del ajuste fino.
- Riesgo elevado de alucinacion en dominio medico: un modelo de 8B ajustado sin validacion clinica puede generar afirmaciones plausibles pero incorrectas; no debe usarse para diagnostico ni decision terapeutica.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden evaluar sesgos demograficos, geograficos o de otro tipo.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia comunitaria que puede imponer condiciones adicionales; conviene revisar la cadena de licencias.
- Caveat de produccion: el checkpoint de partida esta en 4 bits, lo que puede degradar la calidad respecto al destilado original en fp16; se recomienda comparar ambos antes de desplegar.
- Sin senales de adopcion (0 descargas, 0 likes): no hay evidencia de uso real ni de validacion por parte de la comunidad.
- No se declara soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Natali66666/DeepSeek-R1-Medical-COT
- Modelo base en Hugging Face: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit
- Destilado oficial de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Unsloth: https://github.com/unslothai/unsloth
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
