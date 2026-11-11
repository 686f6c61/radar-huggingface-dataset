# DuoNeural/RMSN-528M-CasimirAttractive-D1344-Base

## Resumen

RMSN-528M-CasimirAttractive-D1344-Base es un modelo de lenguaje base de aproximadamente 528 millones de parametros desarrollado por DuoNeural, un proyecto de investigacion centrado en arquitecturas alternativas a los transformers convencionales. El modelo pertenece a la familia Resonant Metriplectic Sheaf Network (RMSN), que combina dinamica port-Hamiltoniana con estructuras de haces (sheaves) y fuerzas de Casimir para inducir estados de condensacion topologica en las representaciones internas de la red.

La relevancia de este modelo es fundamentalmente experimental: no se presenta como un modelo de produccion, sino como una sonda controlada para validar la denominada "ley de resonancia diadica". Segun el autor, cuando la dimension del modelo D cumple que D mod 64 = 0, se activa una fuerza de Casimir atractiva que nuclea tres condensados exactos consecutivos (PR=1.000) en las capas L10, L11 y L12, formando lo que denomina una "espina congelada" en la zona media de la red.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato PyTorch, y esta disenado explicitamente para superar el umbral de "sobreaglomeracion topologica" (M*=3 frente al limite M*<=2), lo que segun el autor deberia degradar la capacidad del espacio de trabajo de la red. Es, por tanto, una pieza de investigacion sobre dinamica interna de redes neuronales mas que una herramienta lista para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), dinamica port-Hamiltoniana |
| Parametros totales | ~528M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo de 3.7 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura RMSN basada en dinamica port-Hamiltoniana, descrita por la ecuacion ḟ = {f,H} + [f,S], donde se combinan corchetes de Poisson (parte Hamiltoniana) y un termino disipativo o metriplectico. La red consta de 16 capas con dimension D=1344 y 64 "slots" por capa, sumando aproximadamente 528 millones de parametros. La innovacion central es la inclusion de una fuerza de Casimir cuyo signo depende de D mod 64: en este caso, 1344 mod 64 = 0, lo que activa una cascada atractiva que produce tres condensados exactos consecutivos.

El entrenamiento se realizo durante 100.000 pasos con el tokenizer cosmo2, de vocabulario 49152. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo se presenta como "Base", sin ajuste fino posterior documentado. La topologia de solitones reportada incluye PR=5.221 en L5, PR=2.984 en L8, PR=1.000 en L10, L11 y L12, y PR=3.758 en L13.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje base.
- Capacidad de razonamiento y codigo: no documentada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas soportados.
- Capacidades especiales: el modelo esta disenado como sonda experimental de condensacion topologica y cascada de Casimir, no como modelo de proposito general.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en dinamica interna de redes neuronales: el modelo permite estudiar como la fuerza de Casimir atractiva induce condensados exactos en capas intermedias, comparandolo con la variante repulsiva (D=1296) del mismo autor.
- Validacion de la ley de resonancia diadica: sirve como punto de datos para comprobar si D mod 64 = 0 predice de forma fiable la aparicion de condensados exactos (PR=1.000).
- Estudio de sobreaglomeracion topologica: al superar intencionadamente el umbral M*<=2, permite medir la degradacion del espacio de trabajo de la red en tareas de lenguaje.
- Reproduccion de experimentos: con 100.000 pasos y tokenizer cosmo2 documentados, es replicable como baseline en estudios de arquitecturas no transformer.
- Comparacion de arquitecturas alternativas: util para contrastar el comportamiento de RMSN frente a transformers de tamano similar en tareas controladas de evaluacion.
- Docencia e investigacion academica: como ejemplo didactico de dinamica port-Hamiltoniana aplicada a modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de topologia de solitones (PR por capa) y el resultado del experimento de Casimir, sin evaluaciones estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP16 para 528M de parametros; alrededor de 2,2 GB si se mantienen pesos en FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, T4) es suficiente para inferencia en precision media; A100 o H100 no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: al ser pesos PyTorch sin formato GGUF documentado, requeriria conversion manual para llama.cpp u Ollama; vLLM y TGI no soportan esta arquitectura de forma nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-528M-CasimirAttractive-D1344-Base | ~528M | no disponible | Apache 2.0 | Hugging Face |
| RMSN-508M-CasimirRepulsive-D1296-Base | ~508M | no disponible | Apache 2.0 (presumible) | Hugging Face |
| Transformers base de ~500M (p. ej. GPT-2 medium, Qwen2.5-0.5B) | ~350-500M | 1k-32k | variable | Amplia |

La comparacion con transformers convencionales no es directa: RMSN emplea una arquitectura experimental sin benchmarks publicados, por lo que no es posible establecer una comparacion de rendimiento cuantitativa. El unico comparable documentado es la variante repulsiva del mismo autor (D=1296, r=16), que segun la model card no produce cascada ni condensados exactos.

## Limitaciones y advertencias

- Modelo base sin ajuste fino: no esta alineado ni instruido, por lo que no es adecuado como asistente directo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar de lenguaje.
- Arquitectura no estandar: no es compatible con herramientas de inferencia habituales (vLLM, TGI, llama.cpp) sin trabajo de adaptacion.
- Riesgo de alucinacion: no evaluado; al ser un modelo base, la generacion puede ser incoherente o factualmente incorrecta.
- Idiomas soportados no declarados: no se garantiza calidad en castellano ni en ningun otro idioma concreto.
- Supera intencionadamente el umbral de sobreaglomeracion topologica (M*=3), lo que segun el propio autor puede degradar la capacidad del espacio de trabajo de la red.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su uso en produccion sin validacion previa.
- Autor con 0 descargas y 0 likes: no hay comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-528M-CasimirAttractive-D1344-Base
- Variante repulsiva: https://huggingface.co/DuoNeural/RMSN-508M-CasimirRepulsive-D1296-Base
- GitHub del autor: https://github.com/duoneural
