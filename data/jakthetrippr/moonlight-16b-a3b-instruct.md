# JakTheTrippr/Moonlight-16B-A3B-Instruct

## Resumen

Moonlight-16B-A3B-Instruct es la variante afinada por instrucciones del modelo Moonlight desarrollado por Moonshot AI, un Mixture-of-Experts (MoE) de 16.000 millones de parametros totales con aproximadamente 3.000 millones activos por token. El repositorio analizado (`JakTheTrippr/Moonlight-16B-A3B-Instruct`) es una redistribucion del checkpoint oficial bajo licencia MIT, con pesos en safetensors y arquitectura `deepseek_v3` en Transformers. El modelo se entreno con 5,7 billones de tokens y una ventana de contexto de 8K tokens.

Su relevancia tecnica reside en el optimizador: Moonlight es el primer modelo a gran escala entrenado con Muon en lugar de AdamW, demostrando una eficiencia de muestras aproximadamente 2x superior y alcanzando rendimiento comparable con un 52% de los FLOPs de entrenamiento. Esto lo convierte en una referencia para investigacion sobre optimizadores y eficiencia de entrenamiento, ademas de un modelo MoE compacto y desplegable en hardware moderado.

Al ser un MoE de 3B activos, ofrece un equilibrio interesante entre calidad (MMLU 70,0, MATH 45,3) y coste de inferencia, compitiendo con modelos densos de 3B y con DeepSeek-V2-Lite. La ficha se basa en la model card oficial redistribuida; los datos especificos de esta copia (idiomas, cuantizaciones publicadas) no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), tipo `deepseek_v3` en Transformers |
| Parametros totales | 15.960.111.936 (~16B) |
| Parametros activos | ~3B (2,24B excluyendo embeddings, segun model card) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision original) |
| Idiomas soportados | no disponible (la model card reporta evaluaciones en ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Moonlight emplea una arquitectura transformer con capas MoE de tipo DeepSeek-V3 (enrutamiento con expertos compartidos y especializados, segun el identificador `deepseek_v3` de Transformers). Con 16B parametros totales y ~3B activos por token, el coste computacional de inferencia se aproxima al de un modelo denso de 3B, mientras que la capacidad de representacion se acerca a la de un modelo de 16B. El contexto maximo es de 8K tokens.

El entrenamiento uso 5,7 billones de tokens con el optimizador Muon, una innovacion central del trabajo. Los autores identificaron dos tecnicas clave para escalar Muon: weight decay y actualizaciones RMS consistentes entre parametros matriciales y no matriciales, lo que permite entrenar a gran escala sin ajuste fino de hiperparametros. La implementacion distribuida usa optimizacion estilo ZeRO-1 con memoria optima y comunicacion eficiente. Los experimentos de scaling law indican que Muon es ~2x mas eficiente en muestras que AdamW y requiere ~52% de los FLOPs para rendimiento comparable. Se liberaron checkpoints preentrenados, afinados por instrucciones e intermedios.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones (variante Instruct).
- Razonamiento en ingles y chino, con resultados destacados en MMLU, MMLU-pro, BBH, C-Eval y CMMLU.
- Generacion de codigo: HumanEval 48,1 y MBPP 63,8.
- Razonamiento matematico: GSM8K 77,4, MATH 45,3 y CMath 81,1.
- Respuesta a preguntas factuales (TriviaQA 66,3).
- Capacidades multilingues: evaluado explicitamente en ingles y chino; el resto de idiomas no esta documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo es exclusivamente de texto.
- Capacidades de agente multi-paso: no documentadas de forma especifica.

## Casos de uso

- Asistente conversacional de proposito general: con 8K de contexto y un afinado por instrucciones, puede gestionar dialogos multi-turno de extension moderada con un coste de inferencia proximo a un modelo de 3B gracias a su activacion MoE.
- Generacion de codigo asistida: sus resultados en HumanEval (48,1) y MBPP (63,8) lo hacen util para autocompletado, explicacion de fragmentos y generacion de tests en entornos de desarrollo con presupuesto de GPU limitado.
- Tutoria y resolucion de problemas matematicos: GSM8K 77,4 y MATH 45,3 permiten usarlo en herramientas educativas que resuelven problemas paso a paso, especialmente en combinacion con verificacion externa.
- Procesamiento de documentacion en ingles y chino: C-Eval 77,2 y CMMLU 78,2 lo hacen adecuado para resumen, extraccion y clasificacion de textos en ambos idiomas dentro de pipelines de back-office.
- Investigacion sobre optimizadores y eficiencia de entrenamiento: la liberacion de checkpoints intermedios y la implementacion de Muon permiten reproducir experimentos de scaling law y comparar Muon frente a AdamW.
- Despliegue en hardware de gama media: al activar solo ~3B parametros, es viable en una unica GPU consumer de 24 GB con cuantizacion, sirviendo como backend de prototipos y demos internas.
- Fine-tuning especifico de dominio: la licencia MIT y el tamano del checkpoint (31,9 GB en safetensors) facilitan el ajuste sobre datos propios para tareas verticales.

## Benchmarks y rendimiento

Datos de la model card oficial (parametros activos y totales excluyen embeddings):

| Benchmark | Llama3.2-3B | Qwen2.5-3B | DSV2-Lite | Moonlight |
|---|---|---|---|---|
| MMLU | 54,75 | 65,6 | 58,3 | 70,0 |
| MMLU-pro | 25,0 | 34,6 | 25,5 | 42,4 |
| BBH | 46,8 | 56,3 | 44,1 | 65,2 |
| TriviaQA | 59,6 | 51,1 | 65,1 | 66,3 |
| HumanEval | 28,0 | 42,1 | 29,9 | 48,1 |
| MBPP | 48,7 | 57,1 | 43,2 | 63,8 |
| GSM8K | 34,0 | 79,1 | 41,1 | 77,4 |
| MATH | 8,5 | 42,6 | 17,1 | 45,3 |
| CMath | - | 80,0 | 58,4 | 81,1 |
| C-Eval | - | 75,0 | 60,3 | 77,2 |
| CMMLU | - | 75,0 | 64,3 | 78,2 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~32 GB (coincide con el tamano del repo, 31,9 GB), por lo que requiere una GPU de 40 GB o superior (A100 40GB, A100 80GB, H100) o varias GPUs.
- Con cuantizacion a 8 bits: ~16-18 GB, viable en RTX 4090 (24 GB) o L40S.
- Con cuantizacion a 4 bits: ~9-10 GB, viable en RTX 4080/4070 Ti Super y GPUs consumer de 12-16 GB; los formatos GGUF no estan publicados en este repo y habria que generarlos.
- Opciones de despliegue: Transformers (recomendado python 3.10, torch>=2.1.0, transformers 4.48.2), text-generation-inference (tag presente), endpoints compatibles; vLLM, llama.cpp y Ollama no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. Al activar ~3B parametros por token, el coste por token se aproxima al de un modelo denso de 3B, pero la memoria residente corresponde al total de 16B.

## Comparativa con modelos similares

| Modelo | Parametros (total/activo) | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| Moonlight-16B-A3B-Instruct | 16B / ~3B | 8K | 70,0 | 48,1 | MIT |
| DeepSeek-V2-Lite | 15,29B / 2,24B | no disponible en la informacion | 58,3 | 29,9 | no disponible en la informacion |
| Qwen2.5-3B | 2,77B denso | no disponible en la informacion | 65,6 | 42,1 | no disponible en la informacion |
| Llama3.2-3B | 2,81B denso | no disponible en la informacion | 54,75 | 28,0 | no disponible en la informacion |

Moonlight supera a los tres en la mayoria de benchmarks con un coste de activacion similar al de un modelo de 3B, a costa de mayor memoria por los parametros totales.

## Limitaciones y advertencias

- Ventana de contexto limitada a 8K tokens, insuficiente para tareas de contexto largo (documentos extensos, repositorios completos, conversaciones muy prolongadas).
- Evaluacion multilingue limitada a ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- Riesgo de alucinacion inherente a los modelos de lenguaje; los benchmarks no lo eximen de requerir verificacion en produccion.
- Sesgos no documentados en la informacion proporcionada; no se detalla composicion del dataset ni filtrado.
- No se documentan capacidades de tool calling ni de agente, por lo que integrarlas requiere validacion propia.
- Esta copia es una redistribucion de terceros (`JakTheTrippr`), sin descargas ni likes, creada y actualizada en la misma fecha; conviene verificar la integridad de los pesos frente al repositorio oficial `moonshotai/Moonlight-16B-A3B-Instruct`.
- La licencia MIT permite uso comercial, pero el autor de esta copia no ofrece garantias adicionales sobre el modelo.
- Requiere `trust_remote_code` por el uso de `custom_code` y la arquitectura `deepseek_v3`; versiones de Transformers anteriores a 4.48.2 pueden no ser compatibles.

## Enlaces

- Repositorio analizado: https://huggingface.co/JakTheTrippr/Moonlight-16B-A3B-Instruct
- Repositorio oficial Instruct: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Repositorio oficial preentrenado: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Codigo y paper: https://github.com/MoonshotAI/Moonlight
- Informe tecnico (PDF): https://github.com/MoonshotAI/Moonlight/blob/master/Moonlight.pdf
- Optimizador Muon: https://github.com/KellerJordan/Muon
- arXiv referenciado en los tags: https://arxiv.org/abs/2502.16982
