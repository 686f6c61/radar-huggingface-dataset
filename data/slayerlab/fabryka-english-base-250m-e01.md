# SlayerLab/fabryka-english-base-250m-e01

## Resumen

Fabryka English Base 250M — E01 es un modelo de lenguaje base en ingles entrenado desde cero por SlayerLab, con 249.944.832 parametros (aproximadamente 250M) y publicado en HuggingFace bajo la libreria transformers. Se trata de un checkpoint marcado explicitamente como experimental y "sustancialmente subentrenado": segun su propia model card, solo completo 50.000.000 de objetivos de prediccion en 191 actualizaciones del optimizador, lo que se traduce en continuaciones repetitivas y a menudo incoherentes. No es un asistente ajustado con instrucciones ni el resultado final de un programa de investigacion.

El modelo se distribuye como base model (sin fine-tuning de instrucciones ni alineamiento tipo RLHF/DPO) y esta orientado exclusivamente al ingles. El dataset declarado es gvlassis/ClimbMix. Su relevancia actual es limitada desde el punto de vista de producto: se posiciona como un artefacto de investigacion temprana, util para estudiar dinamicas de entrenamiento, reproducibilidad de pipelines de evaluacion y comparaciones de referencia en la franja de modelos pequenos.

La informacion publica no detalla la arquitectura interna mas alla de etiquetas genericas (`custom-code`, `fabryka_english_base`) y de su naturaleza de modelo de generacion de texto. No se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni la longitud de contexto nativa del modelo. Las evaluaciones publicadas se realizaron con una ventana de 2.048 tokens, pero ese dato corresponde a la configuracion de evaluacion, no necesariamente al contexto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `fabryka_english_base` con `custom-code`; no se especifica transformer, MoE o hibrida) |
| Parametros totales | 249.944.832 |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las evaluaciones se ejecutaron con 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; evaluaciones en FP32 y BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1.0 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | gvlassis/ClimbMix |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las unicas pistas disponibles son las etiquetas del repositorio (`fabryka_english_base`, `custom-code`, `base-model`), que indican una implementacion con codigo personalizado cargable desde transformers, y el hecho de que el pipeline declarado es `text-generation`. No se indica numero de capas, dimension de embeddings, tipo de atencion, uso de atencion lineal, decodificacion especulativa ni ninguna otra innovacion tecnica.

En cuanto al entrenamiento, los datos publicados son escasos pero concretos: el modelo completo 50.000.000 de objetivos de prediccion en 191 actualizaciones del optimizador, sobre el dataset gvlassis/ClimbMix. El autor califica el checkpoint como subentrenado de forma sustancial. No se menciona ninguna fase de RLHF, DPO, SFT ni ajuste de instrucciones, coherente con su condicion de base model. Tampoco se detalla la composicion del dataset, el numero total de tokens vistos, la estrategia de tokenizacion ni el presupuesto de computo empleado.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de continuaciones de prompt.
- Modelo base sin ajuste de instrucciones: no responde a formatos de chat ni a plantillas de sistema.
- Completado de texto y puntuacion por verosimilitud de continuacion (utilidad principal en los benchmarks publicados).
- Completado de codigo muy limitado: 10,00% de acierto en la categoria Code Completion de BananaMind Base Bench 1.1, el peor resultado del desglose.
- Razonamiento logico y aritmetico limitado: 31,30% en ArithMark 3 y 25,36% en ArithMark 2.
- Soporte de tool calling / function calling: no disponible (no se declara).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingues: no (solo ingles declarado).
- Capacidades especiales (modo thinking, vision, audio): no disponibles (no se declaran).

## Casos de uso

- Investigacion sobre dinamicas de entrenamiento temprano: con solo 191 actualizaciones del optimizador y 50M de objetivos de prediccion, el checkpoint permite estudiar como evolucionan la perdida, la repetitividad y la coherencia en las fases mas iniciales del preentrenamiento de un modelo de 250M.
- Reproducibilidad de pipelines de evaluacion: la model card incluye comandos de reproduccion, revisiones fijadas de datasets y verificacion de agregados, lo que lo convierte en un sujeto de prueba util para validar harnesses como lm-eval 0.4.13 antes de aplicarlos a modelos mayores.
- Baseline de referencia en la franja de ~250M: sirve como punto de comparacion para medir la ganancia marginal de arquitecturas, tokenizadores o recetas de datos alternativas en modelos pequenos.
- Pruebas de infraestructura de despliegue: al ocupar aproximadamente 1 GB en FP32, es adecuado para validar configuraciones de vLLM, TGI, llama.cpp u Ollama con requisitos minimos de VRAM antes de escalar a otros modelos.
- Analisis de comportamiento del tokenizador y del dataset ClimbMix: permite inspeccionar que distribuciones de continuacion produce un modelo base entrenado sobre ese corpus concreto, con fines de auditoria de datos.
- Docencia y formacion tecnica: su tamano reducido y sus resultados modestos lo hacen apropiado para demostrar conceptos de evaluacion zero-shot, `acc_norm`, normalizacion por longitud y agregacion tipo INT sin necesidad de GPU de gama alta.
- Pruebas de estres de seguridad y alucinacion: al ser un modelo subentrenado, resulta util para comprobar como se comportan las herramientas de filtrado y deteccion de incoherencias ante salidas degradadas.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados sobre la revision E01 de los pesos.

| Benchmark | Metrica | Resultado | Cobertura |
|---|---|---:|---:|
| ARC Easy | `acc_norm,none` | 29,42% | 2376/2376 |
| ARC Challenge | `acc_norm,none` | 23,21% | 1172/1172 |
| PIQA | `acc_norm,none` | 51,47% | 1838/1838 |
| HellaSwag | `acc_norm,none` | 24,97% | 10042/10042 |
| ArithMark 3 | Exactitud normalizada por longitud de token | 31,30% | 313/1000 correctas |
| ArithMark 2 | Exactitud de continuacion en crudo | 25,36% | 634/2500 correctas |
| INT Index | Agregado estilo Open SLM | 2,77 | Las cinco entradas |
| BananaMind Base Bench 1.1 | Elo global | 842 | 350/350 |
| BananaMind Base Bench 1.1 | Exactitud | 30,29% | 106/350 correctas |
| BananaMind Base Bench 1.1 | Exactitud ponderada | 28,82% | 350/350 |

Desglose detallado de lm-eval (zero-shot, FP32, una RTX 3090, batch 8, contexto de 2048 tokens, sin BOS y sin plantilla de chat; ARC sobre splits de test, PIQA y HellaSwag sobre validacion; `acc_norm` divide la log-verosimilitud de la continuacion por la longitud en caracteres de la respuesta):

| Benchmark | Exactitud cruda | Exactitud normalizada | Error estandar normalizado |
|---|---:|---:|---:|
| ARC Easy | 28,75% | 29,42% | 0,94 puntos porcentuales |
| ARC Challenge | 18,17% | 23,21% | 1,23 puntos porcentuales |
| PIQA | 53,86% | 51,47% | 1,17 puntos porcentuales |
| HellaSwag | 25,90% | 24,97% | 0,43 puntos porcentuales |

Desglose por categoria de BananaMind Base Bench 1.1 (ejecucion completa de 350 ejemplos con el runner oficial, FP32 en CPU, batch 2, 2 hilos, contexto de 2048 tokens, sin BOS, sin plantilla de chat, media de log-probabilidad condicional por token de la continuacion; la exactitud aleatoria de este benchmark de cuatro opciones es del 25%):

| Categoria | Correctas | Exactitud | Elo |
|---|---:|---:|---:|
| Language Completion | 30/50 | 60,00% | 993 |
| Commonsense | 15/50 | 30,00% | 772 |
| World Knowledge | 15/50 | 30,00% | 791 |
| Context Tracking | 11/50 | 22,00% | 740 |
| Quantitative | 16/50 | 32,00% | 925 |
| Logical Reasoning | 14/50 | 28,00% | 939 |
| Code Completion | 5/50 | 10,00% | 729 |

Nota del autor: los resultados son autodeclarados a partir del runner oficial, con cobertura completa de registros y verificacion de aritmetica de opciones y agregacion de Elo, pero no constituyen una replicacion independiente. El valor INT publicado es 2,7679707593, calculado a partir de las puntuaciones normalizadas sin redondear y de ArithMark 3, siguiendo la formula del leaderboard Open SLM.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,0 GB en FP32, 0,5 GB en FP16/BF16, 0,25 GB en INT8 y 0,13 GB en cuantizacion de 4 bits (calculado a partir de los 249.944.832 parametros; no se publican cuantizaciones oficiales).
- VRAM total en inferencia: en el entorno de 1-2 GB sumando pesos, cache KV y activaciones para contextos de 2.048 tokens en FP16.
- GPU recomendadas por el autor para evaluacion: una NVIDIA RTX 3090 (FP32 para lm-eval, CUDA FP32 y BF16 para ArithMark).
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU con 2 hilos y batch 2, que es la configuracion usada en BananaMind Base Bench 1.1.
- Opciones de despliegue: transformers con codigo personalizado (`custom-code`); no se declaran integraciones oficiales con vLLM, llama.cpp, Ollama, TGI ni formato GGUF. Cualquier despliegue en esos entornos requeriria conversion previa y validacion de la arquitectura.
- Latencia y throughput: no disponible. La informacion publica solo incluye la configuracion de ejecucion de los benchmarks (torch 2.14.0+cpu y transformers 5.3.0 en la ejecucion en CPU; torch 2.11.0+cu130, transformers 5.3.0 y una RTX 3090 en las ejecuciones CUDA), sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la informacion disponible. La model card no incluye comparaciones con alternativas de la misma franja de parametros ni referencias a otros checkpoints, y los resultados de busqueda web recibidos no guardan relacion con el modelo (contenido enciclopedico sobre Taiwan), por lo que no aportan datos utilizables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---:|---|---|---|---|
| SlayerLab/fabryka-english-base-250m-e01 | 249.944.832 | no disponible | no disponible | HuggingFace, 0 descargas declaradas | INT 2,77; Elo 842 en BananaMind Base Bench 1.1 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Subentrenamiento severo declarado por el autor: 50.000.000 de objetivos de prediccion en 191 actualizaciones del optimizador; las continuaciones muestreadas son repetitivas y a menudo incoherentes.
- No es un asistente ajustado con instrucciones ni dispone de plantilla de chat; no debe usarse como chatbot tal cual.
- Riesgo elevado de alucinacion y de degradacion de la coherencia en generaciones largas, especialmente fuera del dominio de Language Completion, donde obtiene su mejor resultado (60,00%).
- Rendimiento cercano al azar o por debajo en varias tareas: HellaSwag 24,97% normalizado frente a una linea base aleatoria de 25% en un problema de cuatro opciones, y PIQA 51,47% frente al 50% esperado por azar binario. ARC Challenge se queda en 23,21%.
- Sesgos conocidos: no se publica ninguna evaluacion de sesgo, toxicidad, equidad ni analisis de la composicion del dataset (gvlassis/ClimbMix), por lo que no es posible caracterizar los sesgos del modelo.
- Idioma: unicamente ingles declarado; no hay soporte multilingue documentado.
- Longitud de contexto: no declarada de forma nativa; las evaluaciones usan 2.048 tokens.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si se permite el uso comercial. Debe tratarse como no autorizado para produccion hasta que el autor la defina.
- Arquitectura y codigo personalizados: requiere `trust_remote_code` o revision manual del codigo antes de cargarlo en un entorno de produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros ni replicaciones publicadas.
- Los resultados de benchmarks son autodeclarados por el autor sobre pesos y revisiones fijadas, pero no han sido replicados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/fabryka-english-base-250m-e01
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/gvlassis/ClimbMix
- Dataset del benchmark BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
- Leaderboard Open SLM (formula del indice INT): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Artefactos de evaluacion citados en la model card: `evaluation/lm-eval-zero-shot.json` y `evaluation/bananamind-base-bench-1.1.json` dentro del repositorio del modelo
- Results de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados recibidos corresponden a articulos enciclopedicos sobre Taiwan y no guardan relacion con esta ficha.
