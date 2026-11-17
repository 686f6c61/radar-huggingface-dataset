# Mahir28/ganit-1.5b-grpo

## Resumen

ganit-1.5b-grpo es un adaptador LoRA publicado por Mahir28 (Mayank Parashar) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, entrenado mediante GRPO (Group Relative Policy Optimization) para mejorar el razonamiento aritmetico en problemas verbales de nivel escolar. El modelo no es un modelo completo, sino un adaptador PEFT que debe combinarse con los pesos originales de Qwen2.5-1.5B-Instruct para su uso. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que unicamente contiene los pesos del adaptador.

El problema que aborda es concreto: la baja precision del modelo base en tareas de matematicas de primaria. Segun los datos declarados por el autor, el adaptador eleva la exactitud en GSM8K del 44,0 % al 73,0 % sobre una muestra de 300 ejemplos, manteniendo un formato de salida estricto con etiquetas `<think>` y `<answer>` en el 98 % de los casos. Esta mejora se obtiene con un entrenamiento relativamente ligero (250 pasos) sobre un modelo de solo 1.500 millones de parametros, lo que lo hace atractivo para despliegues con recursos limitados.

La relevancia actual del modelo reside en su enfoque metodologico: demuestra que el aprendizaje por refuerzo con recompensas verificables (RLVR), aplicado mediante GRPO a un modelo pequeno, puede producir ganancias sustanciales en razonamiento matematico sin necesidad de reentrenar el modelo completo. Es un ejemplo reproducible del pipeline Ganit, publicado en abierto, util para investigadores que estudian tecnicas de RL aplicadas a modelos compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre el modelo base |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El entrenamiento emplea GRPO a traves de `GRPOTrainer` de la libreria TRL, con 8 completaciones por prompt y un coeficiente de divergencia KL de 0,04. La configuracion LoRA utiliza rango r = 16, alpha = 32, dropout de 0,05 y se aplica a las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento consta de 250 pasos con tasa de aprendizaje 5e-06 (coseno) y tamano de lote efectivo de 8 x 4.

El dataset de entrenamiento es openai/gsm8k, compuesto por problemas verbales de matematicas de nivel escolar. La senal de recompensa combina tres componentes con pesos [1.0, 1.0, 1.0]: correccion de la respuesta, cumplimiento del formato y recuento de etiquetas. Esta combinacion de recompensas verificables es la innovacion central del pipeline Ganit: en lugar de depender de un modelo recompensador aprendido, se evalua directamente si la respuesta final coincide con la solucion y si el formato de salida respeta las etiquetas esperadas.

## Capacidades

- Generacion de texto y razonamiento aritmetico paso a paso sobre problemas verbales de matematicas.
- Formato de salida estructurado: razonamiento dentro de `<think>...</think>` y respuesta final dentro de `<answer>...</answer>`.
- Razonamiento de multiples pasos orientado a la resolucion de ecuaciones y problemas de varias operaciones.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (generacion general, comprension lectora basica), aunque el adaptador esta especializado en matematicas.
- Soporte de tool calling / function calling: no disponible de forma especifica en el adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: limitado al dominio matematico entrenado; no se documenta soporte de agentes.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo de razonamiento explicito mediante etiquetas `<think>`; no se documentan vision ni audio.

## Casos de uso

- Tutoria automatica de matematicas escolares: el modelo puede resolver problemas de aritmetica de primaria mostrando el razonamiento paso a paso dentro de `<think>`, lo que permite al estudiante seguir la solucion y no solo ver el resultado final.
- Generacion de datasets sinteticos de razonamiento: con una exactitud del 73 % en GSM8K, el adaptador puede producir soluciones etiquetadas para aumentar corpus de entrenamiento de modelos mayores, filtrando por formato estricto (98 % de cumplimiento).
- Evaluacion de tecnicas de RL en modelos pequenos: sirve como referencia reproducible para investigadores que comparan GRPO frente a otros metodos de ajuste (SFT, DPO) sobre modelos de 1.500 millones de parametros.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.5B, puede ejecutarse en GPUs de consumo con cuantizacion del modelo base, util para prototipos educativos o herramientas offline.
- Verificacion de cadenas de razonamiento: la separacion explicita entre razonamiento y respuesta permite auditar el proceso y detectar pasos erroneos, util en sistemas de correccion automatica de ejercicios.
- Integracion en pipelines de generacion aumentada con recuperacion para matematicas: el modelo puede recibir contexto con formulas o datos y producir la respuesta final en formato parseable, facilitando su encadenamiento con validadores automaticos.
- Benchmarking de recompensas verificables: el pipeline Ganit y este adaptador permiten experimentar con combinaciones de recompensas (correccion, formato, recuento de etiquetas) y medir su impacto en exactitud.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Modelo base Qwen2.5-1.5B-Instruct | ganit-1.5b-grpo |
|---|---|---|
| Exactitud greedy GSM8K (n=300) | 44,0 % | 73,0 % |
| Formato estricto | 86,7 % | 98,0 % |
| Longitud media (caracteres) | 723 | 648 |
| Exactitud laxa (ultimo numero si faltan etiquetas) | 47,0 % | 73,3 % |
| Self-consistency (4 muestras, voto mayoritario) | no disponible | 74,7 % |
| pass@1 | no disponible | 65,5 % |
| pass@4 | no disponible | 86,3 % |

Exactitud por dificultad (proxy: numero de pasos de la solucion gold):

| Dificultad | N | Exactitud |
|---|---|---|
| Facil | 112 | 88,4 % |
| Media | 138 | 61,6 % |
| Dificil | 50 | 70,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 1.500 millones de parametros, los requisitos dependen del modelo base. En fp16 se estiman en torno a 3-4 GB para los pesos del modelo; con cuantizacion de 4 bits puede reducirse a aproximadamente 1-1,5 GB, mas el overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); para cuantizacion de 4 bits, GPUs con 4 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores, especialmente con cuantizacion.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor); el modelo base puede servirse con vLLM, TGI o llama.cpp una vez fusionado el adaptador o cargado mediante PEFT. Ollama requeriria fusionar el adaptador en los pesos base.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ganit-1.5b-grpo | 1,5B (base) + LoRA | no disponible | 73,0 % (n=300, declarado) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible | 44,0 % (n=300, declarado por el autor) | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento de ~1,5B con RL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros adaptadores GRPO comparables sobre Qwen2.5-1.5B-Instruct en la informacion proporcionada. La comparacion mas directa y fiable es contra el modelo base, que muestra una mejora de 29 puntos porcentuales en exactitud greedy.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar Qwen/Qwen2.5-1.5B-Instruct y aplicar el adaptador con PEFT; no puede usarse directamente en herramientas que esperen pesos completos sin fusion previa.
- Entrenado exclusivamente en ingles; no se garantiza rendimiento en castellano ni en otros idiomas.
- Especializado en problemas verbales de matematicas de nivel escolar (GSM8K); su rendimiento en matematicas avanzadas, algebra simbolica o problemas fuera de distribucion no esta documentado.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; la muestra es de 300 ejemplos, lo que introduce incertidumbre estadistica.
- Riesgo de alucinacion en razonamientos: el formato `<think>` puede contener pasos incorrectos aunque la respuesta final sea correcta, o viceversa; se recomienda validar la respuesta con un parser independiente.
- El entrenamiento es corto (250 pasos) y con un unico dataset; puede sobreajustar al estilo de GSM8K y degradar capacidades generales del modelo base.
- Con solo 15 descargas y 0 likes, el modelo carece de validacion comunitaria; no debe asumirse estabilidad en produccion sin evaluacion propia.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-1.5B-Instruct, que tambien es Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/Mahir28/ganit-1.5b-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Proyecto Ganit (GitHub): https://github.com/MayankParashar28/Ganit
- GitHub del autor: https://github.com/MayankParashar28
- Portfolio del autor: https://mayankparashar.xyz
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
