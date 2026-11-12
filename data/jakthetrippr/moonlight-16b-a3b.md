# JakTheTrippr/Moonlight-16B-A3B

## Resumen

Moonlight-16B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Cuenta con 16.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos eficientes en computo de inferencia. Fue entrenado sobre 5,7 billones de tokens y su principal aportacion tecnica es demostrar que el optimizador Muon escala a modelos de gran tamano, logrando una eficiencia de muestras aproximadamente 2 veces superior a AdamW.

La relevancia del modelo reside en su innovacion en el entrenamiento: introduce tecnicas de weight decay y actualizaciones RMS consistentes que permiten usar Muon sin ajuste fino de hiperparametros a gran escala, alcanzando resultados competitivos con aproximadamente el 52% de los FLOPs de entrenamiento que requeriria un modelo equivalente entrenado con AdamW. El modelo se distribuye con licencia MIT y esta disponible en formato safetensors para transformers.

Esta ficha corresponde a la copia alojada por el usuario JakTheTrippr en Hugging Face, que replica los pesos del modelo original de Moonshot AI. El repositorio tiene 31,9 GB de tamano y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer, basada en deepseek_v3 |
| Parametros totales | 15.960.111.936 (aproximadamente 16B) |
| Parametros activos | Aproximadamente 3B por token (2,24B excluyendo embeddings) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precision original) |
| Idiomas soportados | Ingles y chino principalmente; lista completa no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Optimizador de entrenamiento | Muon |
| Tokens de entrenamiento | 5,7 billones (5.7T) |

## Arquitectura y entrenamiento

Moonlight-16B-A3B es un transformer con arquitectura Mixture-of-Experts que activa aproximadamente 3.000 millones de parametros por token sobre un total de 16.000 millones. La arquitectura sigue el esquema deepseek_v3, segun la etiqueta del repositorio, e incorpora enrutamiento disperso de expertos para reducir el coste computacional de inferencia manteniendo una capacidad de parametros elevada.

El entrenamiento se realizo sobre 5,7 billones de tokens utilizando el optimizador Muon en lugar de AdamW. Los autores identificaron dos tecnicas clave para escalar Muon: weight decay, critico para modelos grandes, y actualizaciones RMS consistentes mediante ajustes de escala por parametro, que mejoran la estabilidad del entrenamiento. Ademas, desarrollaron una implementacion distribuida de Muon con optimizacion estilo ZeRO-1 que mantiene eficiencia de memoria y reduce la sobrecarga de comunicacion. Los experimentos de scaling law indican que Muon es aproximadamente 2 veces mas eficiente en muestras que Adam con entrenamiento optimo en computo, y que alcanza rendimiento comparable a AdamW con aproximadamente el 52% de los FLOPs. Se publican checkpoints preentrenados, ajustados por instrucciones e intermedios.

## Capacidades

- Generacion de texto conversacional y continuacion de texto.
- Razonamiento en ingles y chino, con resultados destacados en MMLU, MMLU-pro y BBH.
- Generacion de codigo, con resultados en HumanEval y MBPP.
- Razonamiento matematico, con resultados en GSM8K, MATH y CMath.
- Capacidades multilingues limitadas a ingles y chino principalmente; no hay lista oficial de idiomas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo es exclusivamente de texto.
- La variante Instruct esta disponible por separado en el repositorio oficial de Moonshot AI.

## Casos de uso

- Generacion de codigo en produccion: el modelo obtiene 48,1 en HumanEval y 63,8 en MBPP, por lo que es adecuado para autocompletado, generacion de funciones y asistencia en editores con contexto de hasta 8K tokens.
- Razonamiento matematico asistido: con 77,4 en GSM8K y 45,3 en MATH, puede emplearse en tutoria automatica, resolucion de problemas paso a paso y verificacion de calculos en entornos educativos.
- Atencion al cliente bilingue ingles-chino: sus resultados en C-Eval (77,2) y CMMLU (78,2) lo hacen util para conversaciones multi-turno en ambos idiomas dentro de una ventana de 8K tokens.
- Procesamiento de documentacion tecnica: la ventana de 8K tokens permite resumir articulos, extraer informacion estructurada y responder preguntas sobre manuales o especificaciones.
- Clasificacion y analisis de texto a gran escala: al activar solo unos 3B de parametros por token, el coste de inferencia es bajo en comparacion con modelos densos de 16B, lo que lo hace viable para pipelines de procesamiento masivo.
- Prototipado e investigacion: al estar disponible con licencia MIT y publicarse checkpoints intermedios, es adecuado para experimentos academicos sobre arquitecturas MoE y sobre el optimizador Muon.
- Despliegue en entornos con recursos limitados: la activacion dispersa reduce los requisitos de computo frente a un modelo denso equivalente, permitiendo servir el modelo en una unica GPU de gama alta.

## Benchmarks y rendimiento

| Benchmark (metrica) | Llama3.2-3B | Qwen2.5-3B | DSV2-Lite | Moonlight |
|---|---|---|---|---|
| Parametros activados | 2,81B | 2,77B | 2,24B | 2,24B |
| Parametros totales | 2,81B | 2,77B | 15,29B | 15,29B |
| Tokens de entrenamiento | 9T | 18T | 5,7T | 5,7T |
| Optimizador | AdamW | no disponible | AdamW | Muon |
| MMLU | 54,75 | 65,6 | 58,3 | 70,0 |
| MMLU-pro | 25,0 | 34,6 | 25,5 | 42,4 |
| BBH | 46,8 | 56,3 | 44,1 | 65,2 |
| TriviaQA | 59,6 | 51,1 | 65,1 | 66,3 |
| HumanEval | 28,0 | 42,1 | 29,9 | 48,1 |
| MBPP | 48,7 | 57,1 | 43,2 | 63,8 |
| GSM8K | 34,0 | 79,1 | 41,1 | 77,4 |
| MATH | 8,5 | 42,6 | 17,1 | 45,3 |
| CMath | no disponible | 80,0 | 58,4 | 81,1 |
| C-Eval | no disponible | 75,0 | 60,3 | 77,2 |
| CMMLU | no disponible | 75,0 | 64,3 | 78,2 |

Los recuentos de parametros reportados excluyen los embeddings. Los resultados corresponden a la model card oficial de Moonshot AI.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (BF16): aproximadamente 32 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda al menos 40-48 GB.
- Cuantizacion a 8 bits: alrededor de 16 GB de pesos, factible en GPUs de 24 GB.
- Cuantizacion a 4 bits: alrededor de 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para precision completa; RTX 4090 (24 GB) para 8 bits; RTX 3090/4080 para 4 bits.
- Cabe en GPU consumer: si, con cuantizacion (RTX 4090, 3090, 4080).
- Opciones de despliegue: transformers (libreria oficial recomendada, transformers 4.48.2 y torch >= 2.1.0), text-generation-inference (segun tags del repositorio). Soporte de vLLM, llama.cpp u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU | HumanEval |
|---|---|---|---|---|---|---|
| Moonlight-16B-A3B | 16B | ~3B | 8K | MIT | 70,0 | 48,1 |
| DeepSeek-V2-Lite | 15,29B | 2,24B | no disponible | no disponible | 58,3 | 29,9 |
| Qwen2.5-3B | 2,77B | denso | no disponible | no disponible | 65,6 | 42,1 |
| Llama3.2-3B | 2,81B | denso | no disponible | no disponible | 54,75 | 28,0 |

Moonlight supera a DeepSeek-V2-Lite, su competidor MoE mas directo, en todos los benchmarks reportados, y tambien supera a los modelos densos de 3B en razonamiento, codigo y matematicas, con la salvedad de GSM8K, donde Qwen2.5-3B obtiene 79,1 frente a 77,4.

## Limitaciones y advertencias

- Ventana de contexto limitada a 8K tokens, inferior a la de muchos modelos contemporaneos, lo que restringe casos de uso con documentos largos.
- Idiomas soportados principalmente ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la model card.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia MIT permite uso comercial sin restricciones, pero el repositorio consultado es una copia de terceros (JakTheTrippr) sin descargas ni validacion; se recomienda usar el repositorio oficial de Moonshot AI.
- El modelo base (pretrained) no esta ajustado para seguir instrucciones; para uso conversacional debe emplearse la variante Instruct.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre soporte en frameworks de inferencia de alto rendimiento como vLLM.
- El repositorio consultado no incluye tarjeta de modelo propia ni documentacion adicional; toda la informacion tecnica procede de la model card original de Moonshot AI.

## Enlaces

- Repositorio consultado: https://huggingface.co/JakTheTrippr/Moonlight-16B-A3B
- Repositorio oficial (pretrained): https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Repositorio oficial (instruct): https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Codigo y repositorio GitHub: https://github.com/MoonshotAI/Moonlight
- Informe tecnico (PDF): https://github.com/MoonshotAI/Moonlight/blob/master/Moonlight.pdf
- Paper en arXiv: https://arxiv.org/abs/2502.16982
- Optimizador Muon: https://github.com/KellerJordan/Muon
