# promotion/Qwen2.5-1.5B-Instruct-HH-NBIVO-QC

## Resumen

Qwen2.5-1.5B-Instruct-HH-NBIVO-QC es un ajuste fino del modelo Qwen2.5-1.5B-Instruct realizado por el autor "promotion" en el marco del proyecto de etica social de IA generativa Saltlux/IITP, en colaboracion con KAIST (ano 3, 2026). El modelo aplica la metodologia NB-IVO+QC, una variante de alineacion sin critico que combina un objetivo de grupo tipo GN-IVO con un profesor de negociacion Nash (NBPO) y una restriccion de calidad general. El resultado es un modulo asistente orientado a mejorar el comportamiento en helpfulness y harmlessness sobre el conjunto de prompts de Anthropic HH-RLHF.

El problema que aborda es el de la alineacion eficiente de modelos pequenos: en lugar de depender de RLHF clasico con un critico separado, utiliza una distribucion objetivo sobre K respuestas muestreadas y ratios de politica normalizados, con un banco de comparadores congelados para calcular margenes Bradley-Terry. La relevancia actual radica en que demuestra que un modelo de 1.700 millones de parametros puede multiplicar por casi seis su tasa de exito en un benchmark de sesgo definido por recompensas, pasando de un 10,51 % a un 59,93 %, con una reduccion de error del 55,2 % respecto a la base.

Arquitectonicamente hereda la estructura transformer densa de Qwen2.5-1.5B-Instruct, con 1.777.088.000 parametros totales y pesos en safetensors. El contexto, los idiomas y los tipos de cuantizacion no se detallan en la informacion proporcionada, aunque al derivar de Qwen2.5 se espera compatibilidad con la familia Qwen2.5. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen2.5-1.5B-Instruct, familia Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso de la familia Qwen2, y se ajusta con NB-IVO+QC. NB-IVO conserva el objetivo de grupo sin critico de GN-IVO: una entropia cruzada entre una distribucion objetivo sobre las K respuestas muestreadas de un prompt y sus ratios de politica normalizados. Como profesor se usa el NBPO, un profesor de negociacion Nash de pool finito que calcula margenes Bradley-Terry por objetivo frente a un banco de muestras congeladas de la politica base, valores de juego soft-min V_k(p), puntos de desacuerdo d_k y una solucion p* que maximiza la suma de logaritmos de (V_k(p) - d_k) menos una penalizacion KL hacia la uniforme dividida por eta, sujeta a que V_k(p) supere d_k para helpful, harmless y quality. La restriccion QC anade un modelo de recompensa de calidad general (Ray2333/GRM-Llama3.2-3B-rewardmodel-ft) que actua solo como cota: el profesor no puede degradar la calidad por debajo del banco de referencia, pero negocia unicamente sobre helpfulness y harmlessness. Los prompts en los que ninguna mezcla satisface las tres restricciones se descartan, las respuestas truncadas pierden frente a las completas y la secuencia completa se ajusta con una KL k3 respecto al modelo base.

El entrenamiento usa 12.800 prompts del split de entrenamiento de HH-RLHF, con 256 reservados como conjunto de desarrollo para seleccion de checkpoint. Las recompensas provienen de Ray2333/gpt2-large-helpful-reward_model y Ray2333/gpt2-large-harmless-reward_model (logits crudos convertidos a margenes BT) y del guard de calidad GRM. Se realizan hasta 400 actualizaciones de 32 prompts con K=4 muestras (temperatura 0,7, 256 tokens), banco de comparadores de 6, beta 0,25, eta 1, learning rate 2e-6, grad clip 0,5, KL 0,1, AdamW, semilla 42, sobre una A100-80GB. La evaluacion de desarrollo se hace cada 25 actualizaciones. Este checkpoint corresponde a la actualizacion 275. La regla de seleccion se fijo antes del entrenamiento y se aplico solo sobre desarrollo: entre los checkpoints cuya puntuacion media de un juez independiente (Skywork/Skywork-Reward-V2-Qwen3-1.7B, no usado en entrenamiento) sobre los 256 prompts de desarrollo es igual o superior a la del modelo base, se elige el de mayor exito del modelo de recompensa en desarrollo.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat de Qwen, con prompt de sistema por defecto.
- Alineacion reforzada en helpfulness y harmlessness sobre dialogos de HH-RLHF.
- Razonamiento basico y matematicas: el modelo card indica que la capacidad matematica general se mantiene aproximadamente (AMC23 pasa de 14/40 a 12/40 bajo el prompt de evaluacion).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad especial: no dispone de modo thinking, vision ni audio segun la informacion disponible.
- Integracion con text-generation-inference y endpoints compatibles, segun los tags del repositorio.

## Casos de uso

- Moderacion y filtrado de respuestas en asistentes conversacionales: el modelo puede generar respuestas y servir como referencia de comportamiento seguro en pipelines de evaluacion, dado que su tasa de exito en el benchmark de sesgo alcanza el 59,93 % frente al 10,51 % de la base.
- Investigacion en alineacion sin critico: util como punto de comparacion reproducible para estudiar NB-IVO+QC frente a GRPO con las mismas recompensas y la misma regla de seleccion, ya que el modelo card reporta ambos resultados bajo el mismo protocolo.
- Generacion de respuestas de referencia para anotacion: sus respuestas son preferidas sobre las de la base en el 65,2 % de los prompts por Skywork-Reward-V2-Qwen3-1.7B y en el 62,8 % por Skywork-Reward-V2-Llama-3.1-8B, lo que permite usarlo como generador de candidatos en tareas de anotacion humana.
- Despliegue en entornos con recursos limitados: con 1.777 millones de parametros y pesos safetensors, es viable en una unica GPU consumer para inferencia en bf16 o cuantizada, aunque los tipos de cuantizacion no estan documentados.
- Evaluacion de robustez conversacional: el conjunto de evaluacion de 2.064 prompts con entradas de 8 a 512 tokens en formato chat de Qwen permite reproducir el protocolo de decodificacion greedy con max_new_tokens=256 y parada en `<|im_end|>` o `<|endoftext|>`.
- Base para ajustes posteriores de seguridad: al estar bajo Apache 2.0 y derivar de Qwen2.5-1.5B-Instruct, puede servir como punto de partida para fine-tuning adicional en dominios especificos manteniendo el comportamiento alineado.
- Prototipado de asistentes con restricciones de calidad: la incorporacion del guard GRM como restriccion (no como objetivo) es un patron reutilizable en sistemas donde la calidad general no debe degradarse al optimizar helpfulness y harmlessness.

## Benchmarks y rendimiento

Resultados sobre el split de test de Anthropic/hh-rlhf (revision 09be8c5), 2.064 prompts, decodificacion greedy con max_new_tokens=256, evaluados con Ray2333/gpt2-large-helpful-reward_model y Ray2333/gpt2-large-harmless-reward_model (exito si sigmoid(helpful) x sigmoid(harmless) >= 0,5), con vLLM 0.19.1 en bf16.

| Modelo | Puntuacion | Reduccion de error vs base (IC bootstrap 95 %) | Objetivo 2026 |
|---|---:|---:|---|
| Qwen2.5-1.5B-Instruct (base) | 10,51 % (217/2064) | — | — |
| Qwen2.5-1.5B-Instruct-HH-NBIVO-QC (este modelo) | 59,93 % (1237/2064) | 55,2 % (52,9–57,5) | >= 20 % cumplido |
| GRPO (defaults de TRL, mismas recompensas y regla de seleccion) | 60,27 % | 55,6 % | — |

Datos adicionales reportados en el model card:

| Metrica | Este modelo | GRPO (misma configuracion) |
|---|---:|---:|
| Respuestas que alcanzan el limite de 256 tokens | 33 | 338 |
| Aperturas distintas en los primeros 64 caracteres | 1.863 / 2.064 | no disponible |
| Preferencia por Skywork-Reward-V2-Qwen3-1.7B frente a la base | 65,2 % | no disponible |
| Preferencia por Skywork-Reward-V2-Llama-3.1-8B frente a la base | 62,8 % | 46,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.777 millones de parametros, en bf16 los pesos ocupan aproximadamente 3,6 GB, por lo que se necesita margen adicional para cache KV y activaciones.
- GPU recomendadas: el entrenamiento se realizo en una A100-80GB; para inferencia no se especifican GPU recomendadas.
- Cabe en GPU consumer: si, dado el tamano de 1,5B parametros, aunque no se detallan modelos concretos ni cuantizaciones soportadas.
- Opciones de despliegue: vLLM 0.19.1 en bf16 es la configuracion usada en la evaluacion reportada; los tags incluyen text-generation-inference y endpoints compatibles. No se documentan llama.cpp, Ollama ni TGI con detalle.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntuacion en benchmark de sesgo HH-RLHF | Disponibilidad |
|---|---:|---|---|---:|---|
| Qwen2.5-1.5B-Instruct-HH-NBIVO-QC | 1.777.088.000 | no disponible | Apache 2.0 | 59,93 % | HuggingFace (145 descargas) |
| Qwen2.5-1.5B-Instruct (base) | 1.500 millones (aprox.) | no disponible | Apache 2.0 | 10,51 % | HuggingFace |
| GRPO sobre la misma base (TRL defaults) | misma base | no disponible | Apache 2.0 | 60,27 % | no disponible como checkpoint publicado |

La comparativa se limita a los datos del model card; no se dispone de informacion sobre otros modelos de alineacion de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La metrica de exito esta definida por dos modelos de recompensa GPT2-large, lo que introduce dependencia del sesgo de esos evaluadores.
- El entrenamiento se volvio inestable a partir de aproximadamente 300 actualizaciones; la perdida IVO sumada sobre la secuencia hace que la KL por token sea comparativamente debil. Este checkpoint se selecciono antes de ese punto mediante la regla pre-registrada.
- La capacidad matematica general se mantiene solo de forma aproximada: AMC23 pasa de 14/40 a 12/40 bajo el prompt de evaluacion.
- El modulo se evalua unicamente en el benchmark de sesgo, igual que en el certificado de 2025; no hay evaluacion publicada en otros dominios.
- El modelo card no documenta sesgos conocidos, idiomas soportados ni limitaciones de contexto; estos datos figuran como no disponibles.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.
- El modelo no ha sido validado en produccion segun la informacion disponible; su uso en sistemas reales requiere evaluacion adicional con jueces independientes.

## Enlaces

- HuggingFace: https://huggingface.co/promotion/Qwen2.5-1.5B-Instruct-HH-NBIVO-QC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo de recompensa de calidad: https://huggingface.co/Ray2333/GRM-Llama3.2-3B-rewardmodel-ft
- Modelo de recompensa helpful: https://huggingface.co/Ray2333/gpt2-large-helpful-reward_model
- Modelo de recompensa harmless: https://huggingface.co/Ray2333/gpt2-large-harmless-reward_model
- Juez independiente: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-1.7B
- Juez independiente alternativo: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.1-8B
- Dataset de evaluacion: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
