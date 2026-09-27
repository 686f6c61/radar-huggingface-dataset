# IlyaasK/countdown-qwen3.5-0.8b-grpo

## Resumen

El modelo `IlyaasK/countdown-qwen3.5-0.8b-grpo` es un ajuste por aprendizaje por refuerzo del checkpoint base `Qwen/Qwen3.5-0.8B-Base`, especializado en resolver puzles aritmeticos del tipo Countdown: dado un conjunto de numeros, el modelo debe producir una expresion que los use todos exactamente una vez y alcance un objetivo. El autor es IlyaasK y la publicacion es experimental, con licencia Apache 2.0 y pesos en formato GGUF cuantizados a Q4_K_M, ademas de pesos en safetensors.

La particularidad tecnica es que no se utilizo ningun ajuste supervisado previo: el modelo se sometio directamente a 100.000 pasos de GRPO (Group Relative Policy Optimization) sobre el dataset `Jiayi-Pan/Countdown-Tasks-3to4`. El resultado es un modelo muy pequeno, de 752.393.024 parametros reales (denominado comercialmente 0,8B), que cabe en un navegador y que prioriza la capacidad de seguir un formato estricto de respuesta `<answer>...</answer>` por encima de la correccion aritmetica.

Su relevancia es doble: por un lado sirve como caso de estudio reproducible de RL puro sobre un modelo diminuto; por otro, es un ejemplo de despliegue de inferencia en el navegador mediante GGUF troceado y cargado con wllama. El propio autor advierte de que el modelo es falla a menudo: en la evaluacion retenida resolvio 56 de 252 puzles de cuatro numeros en un unico intento y 0 de 260 puzles de tres numeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B-Base, incluye torre de vision y pesos MTP en el modelo original) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos originales en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (Q4_K_M) |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |
| Metodo de entrenamiento | GRPO, 100.000 pasos, sin SFT |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-0.8B-Base, un transformer denso. La exportacion publicada elimina la torre de vision y los pesos MTP (multi-token prediction) presentes en el checkpoint original, de modo que el resultado es un modelo estrictamente de texto. La conversion a GGUF se hizo con `llama.cpp` usando la opcion `--no-nextn`, y la cuantizacion resultante es Q4_K_M.

El entrenamiento consistio exclusivamente en 100.000 pasos de GRPO sobre el dataset de puzles aritmeticos Countdown-Tasks-3to4 de Jiayi Pan. No hubo ajuste supervisado previo ni, segun la model card, ninguna fase adicional de alineamiento tipo RLHF o DPO. El objetivo aprendido es emitir una unica expresion aritmetica dentro de las etiquetas `<answer>...</answer>`, usando cada numero proporcionado exactamente una vez. La senal de recompensa es, por tanto, de verificacion exacta: la expresion o bien alcanza el objetivo o no lo alcanza. A pesar de las 100.000 iteraciones, el rendimiento final es bajo, lo que sugiere que el modelo base es demasiado pequeno para internalizar de forma robusta la busqueda aritmetica requerida.

## Capacidades

- Generacion de expresiones aritmeticas en el formato exacto `<answer>expresion</answer>` a partir de una lista de numeros y un objetivo.
- Seguimiento de un formato de salida muy rigido, aprendido via RL sin supervision.
- Razonamiento aritmetico de un solo paso orientado a puzles tipo Countdown.
- Inferencia en navegador: el modelo se distribuye tambien como GGUF troceado en cinco partes para su carga con wllama.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`) y uso conversacional (etiqueta `conversational`).
- No dispone de soporte declarado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues: no disponibles; la model card esta integramente en ingles y no documenta idiomas.

## Casos de uso

- Demostracion educativa de RL puro: el modelo permite ilustrar como GRPO sobre un modelo diminuto induce un formato de salida concreto sin ajuste supervisado, comparando la curva de recompensa con el resultado final publicado (56/252 en puzles de cuatro numeros).
- Inferencia en navegador sin backend: al distribuirse como GGUF Q4_K_M troceado y cargarse con wllama, se puede integrar en una pagina web estatica que resuelva puzles Countdown en el propio cliente, sin coste de servidor.
- Banco de pruebas de verificadores aritmeticos: dado que la demo del autor valida cada expresion con aritmetica racional exacta, el modelo sirve como generador de candidatos para probar sistemas de verificacion y de reparacion de respuestas.
- Prototipado rapido en hardware modesto: con menos de 800 millones de parametros y cuantizacion de 4 bits, permite experimentar con pipelines de RL y de evaluacion en un portatil o en una GPU de gama de entrada.
- Investigacion sobre limites de escala: el contraste entre 56/252 puzles de cuatro numeros y 0/260 de tres numeros es un punto de partida util para estudiar por que ciertas tareas se aprenden y otras no con el mismo presupuesto de RL.
- Docencia de cuantizacion y despliegue: el flujo `llama.cpp` con `--no-nextn`, la cuantizacion Q4_K_M y el troceado en cinco ficheros constituyen un ejemplo completo de publicacion de pesos para entornos con memoria limitada.
- Generacion de datos sinteticos de baja calidad controlada: las expresiones producidas pueden usarse como ejemplos negativos o como candidatos a filtrar en la construccion de datasets aritmeticos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la evaluacion retenida del propio proyecto, medidos como puzles resueltos en un unico intento:

| Tarea | Resultado |
|---|---|
| Puzles Countdown de 4 numeros (252 en total) | 56 resueltos (22,2 %) |
| Puzles Countdown de 3 numeros (260 en total) | 0 resueltos (0,0 %) |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval u otros) en la informacion disponible. No se dispone de comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 0,5 GB de pesos, mas la memoria del contexto y del runtime; el repositorio completo ocupa 1,1 GB.
- VRAM estimada en precision completa (safetensors, ~2 bytes por parametro): aproximadamente 1,5 GB solo de pesos.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU compartida y en CPU pura.
- GPU profesionales no necesarias; el modelo no requiere A100 ni H100 salvo para evaluaciones masivas en paralelo.
- Opciones de despliegue: `llama.cpp` para GGUF, Ollama, wllama/WASM para navegador y endpoints compatibles de Hugging Face. vLLM o TGI serian viables solo si se dispone de los pesos en safetensors sin cuantizar.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de menos de 800 millones de parametros cuantizado a 4 bits, la latencia esperada es baja en cualquier hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IlyaasK/countdown-qwen3.5-0.8b-grpo | 752.393.024 | no disponible | 56/252 en puzles de 4 numeros; 0/260 en puzles de 3 numeros | Apache 2.0 | GGUF Q4_K_M y safetensors en Hugging Face |
| Qwen/Qwen3.5-0.8B-Base | no disponible | no disponible | no disponible (modelo base generalista, sin RL especifico) | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos especializados en Countdown o aritmetica de un solo paso | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable mas alla del modelo base.

## Limitaciones y advertencias

- Rendimiento bajo confirmado por el propio autor: 22,2 % de acierto en puzles de cuatro numeros y 0 % en puzles de tres numeros. El modelo "a menudo se equivoca", segun la model card.
- Riesgo alto de alucinacion aritmetica: puede producir expresiones sintacticamente validas y bien formateadas que no alcanzan el objetivo o que reutilizan numeros.
- Ambito de uso extremadamente estrecho: solo genera expresiones Countdown; no es un modelo de proposito general.
- Sin ajuste supervisado ni fases de alineamiento: no hay garantias de comportamiento conversacional util ni de seguimiento de instrucciones generales.
- Idiomas soportados no documentados; la model card y el entrenamiento estan en ingles.
- Longitud de contexto no documentada, lo que impide planificar despliegues que dependan de ventanas largas.
- La exportacion elimina la torre de vision y los pesos MTP, de modo que el modelo no conserva ninguna capacidad multimodal del checkpoint original.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental del modelo desaconseja su uso en produccion sin un verificador externo que valide cada respuesta.
- La demo del navegador verifica las expresiones con aritmetica racional exacta y no sustituye las respuestas fallidas por las de un solver, de modo que la tasa de fallo es visible para el usuario final.
- Repositorio sin descargas ni likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IlyaasK/countdown-qwen3.5-0.8b-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiayi-Pan/Countdown-Tasks-3to4
- Demo en navegador: https://ilya.as/countdown/
- Fichero unico GGUF: `countdown-Q4_K_M.gguf` (SHA-256 `fd5bae67451d67f6513b7563aa388561097bf347a774764404b4698b0c474cfe`)
