# ParetoQaft/2_6B-looped-2bit-nemotron

## Resumen

2_6B-looped-2bit-nemotron es una cuantizacion de 2 bits (W2A16) del modelo ByteDance/Ouro-2.6B, publicada por el usuario ParetoQaft bajo el formato AutoGPTQ. El modelo base es un transformer con arquitectura "looped" (bucles compartidos): 48 capas compartidas que se recorren 4 veces, lo que da una profundidad efectiva de 192 capas con solo 2.667.974.657 parametros totales. La cuantizacion reduce el peso del repositorio a 1,1 GB, lo que permite desplegarlo en hardware muy modesto.

El interes tecnico de esta ficha no esta en el modelo base, sino en el metodo de cuantizacion: AutoRound 0.9.2 fue parcheado para calibrar cada bloque compartido de forma conjunta sobre sus entradas en las 4 iteraciones del bucle (propagacion de entradas cuantizadas), de modo que un unico conjunto de pesos sirve para todos los bucles. Es una adaptacion poco habitual, porque la mayoria de herramientas de cuantizacion no contemplan arquitecturas con pesos reutilizados.

La contrapartida es un deterioro severo de calidad: en GSM8k 3-shot el modelo cuantizado obtiene 32,8% de exact match frente al 86,5% del BF16 con 4 bucles. Es, por tanto, un artefacto experimental de investigacion sobre cuantizacion extrema, no un modelo recomendado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas compartidas en bucle (looped transformer), 48 capas compartidas x 4 iteraciones |
| Parametros totales | 2.667.974.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W2A16 simetrica int2, group size 128 (AutoGPTQ); pesos empaquetados en formato GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (empaquetado AutoGPTQ), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base, ByteDance/Ouro-2.6B, emplea una arquitectura de transformer con pesos compartidos entre bloques que se aplican de forma recurrente: 48 capas unicas recorridas 4 veces. Este diseno desacopla la profundidad efectiva del numero de parametros, de modo que se obtiene un modelo de 2,6B parametros con una profundidad computacional equivalente a 192 capas. La model card del artefacto cuantizado no detalla el dataset de preentrenamiento del modelo base, el numero de tokens ni si hubo fases de RLHF o DPO.

La innovacion de este artefacto esta en el proceso de cuantizacion. Se uso AutoRound 0.9.2 parcheado para la arquitectura en bucle: cada bloque compartido se calibra conjuntamente sobre las entradas que recibe en las 4 iteraciones del bucle, propagando entradas ya cuantizadas (`enable_quanted_input=True`, `enable_alg_ext=True`). La calibracion empleo 512 muestras de 2048 tokens del dataset ParetoQaft/nemotron_calib, 1000 iteraciones, batch de 8 y semilla 42. El resultado se empaqueto en formato AutoGPTQ con cuantizacion simetrica de 2 bits y grupo de 128.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Razonamiento aritmetico basico: evaluado en GSM8k 3-shot, con un 32,8% de exact match tras la cuantizacion.
- Reutilizacion de pesos por bucle: un unico conjunto de pesos cuantizados opera en las 4 iteraciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en cuantizacion extrema: sirve como referencia reproducible para estudiar el impacto de W2A16 en arquitecturas con pesos compartidos, comparando el 32,8% de GSM8k frente al 86,5% del BF16.
- Validacion de tecnicas de calibracion por bucle: el parche de AutoRound para calibrar bloques compartidos sobre las 4 iteraciones puede replicarse y medirse contra otras estrategias de calibracion.
- Despliegue en entornos con memoria muy limitada: con 1,1 GB de pesos, cabe en GPUs de gama baja o incluso en CPU, util para prototipos y pruebas de integracion donde la calidad no es critica.
- Docencia y demostraciones: permite mostrar en un portatil el comportamiento de un transformer en bucle cuantizado a 2 bits sin infraestructura dedicada.
- Pruebas de regresion de pipelines de inferencia: util para verificar que un stack con AutoGPTQ y `trust_remote_code=True` carga correctamente modelos con codigo de modelado personalizado.
- Estudio de degradacion por tarea: comparar el rendimiento en generacion libre frente al razonamiento aritmetico ayuda a caracterizar donde falla primero la cuantizacion a 2 bits.

## Benchmarks y rendimiento

| Benchmark | Este modelo (W2A16, 4 bucles) | BF16, 4 bucles |
|---|---|---|
| GSM8k (3-shot, 1319 preguntas), exact match | 32,8% | 86,5% |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1 GB solo para pesos en int2; con overhead de activaciones y cache KV, el consumo real sera mayor, aunque previsiblemente por debajo de 4 GB en contextos cortos (estimacion, no dato publicado).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM deberia ser suficiente; no se requieren A100 ni H100.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060 y superiores; tambien es viable en CPU.
- Opciones de despliegue: transformers con AutoGPTQ y `trust_remote_code=True`; compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8k | Licencia |
|---|---|---|---|---|---|
| 2_6B-looped-2bit-nemotron | 2,67B | no disponible | W2A16 int2, group 128 | 32,8% (3-shot) | no disponible |
| ByteDance/Ouro-2.6B (BF16, 4 bucles) | 2,67B | no disponible | BF16 | 86,5% (3-shot) | no disponible |
| Otras cuantizaciones de Ouro-2.6B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad muy severa: 53,7 puntos porcentuales menos en GSM8k respecto al BF16, lo que invalida su uso en tareas de razonamiento.
- Cuantizacion a 2 bits: el ruido de cuantizacion en grupos de 128 y la propagacion de entradas cuantizadas a traves de 4 bucles amplifican el error.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del modelo base ByteDance/Ouro-2.6B.
- Idiomas no declarados: se desconoce la cobertura linguistica y el comportamiento fuera del ingles.
- Longitud de contexto no documentada: no hay garantia sobre el rendimiento en contextos largos.
- Requiere `trust_remote_code=True`: ejecuta codigo de modelado incluido en el repositorio, lo que implica una revision de seguridad previa en entornos de produccion.
- Riesgo de alucinacion elevado, agravado por la cuantizacion extrema.
- Repositorio sin descargas ni likes y creado en 2026: sin validacion comunitaria ni mantenimiento conocido.
- Sesgos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParetoQaft/2_6B-looped-2bit-nemotron
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B
- Dataset de calibracion: https://huggingface.co/datasets/ParetoQaft/nemotron_calib
