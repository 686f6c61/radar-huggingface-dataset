# samatv256/mini-Jev

## Resumen

mini-Jev es un modelo de decisión especializado en selección finita de herramientas y acciones dentro de flujos agénticos. Lo desarrolla el usuario samatv256 y se construye sobre el backbone Qwen3-0.6B de Alibaba, al que se le añade un adaptador PEFT/LoRA y una cabeza de decisión compacta. En lugar de generar texto o argumentos de llamada a herramientas, el modelo recibe un estado, una pregunta y un conjunto cerrado de opciones candidatas, y devuelve una probabilidad normalizada para cada una de ellas.

El checkpoint publicado corresponde al paso 10.626 de un entrenamiento planificado hasta 50.000 actualizaciones, por lo que se trata de una versión interina y no del modelo final. Su utilidad práctica es acotada pero clara: resolver el enrutamiento entre herramientas en pipelines de agentes donde el conjunto de acciones posibles ya está definido, evitando la ambigüedad de pedir a un LLM generativo que elija entre opciones mediante texto libre.

La relevancia actual del modelo radica en su enfoque: separar la decisión de la generación. El scoring es equivariante a permutaciones, de modo que el orden de las opciones no altera el resultado, y el modelo devuelve una distribución de probabilidad sobre el conjunto finito en lugar de una cadena de texto que hay que parsear. Con 0,6B parámetros de base y licencia Apache 2.0, es un componente ligero para orquestación de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptador PEFT/LoRA y cabeza de decisión compacta |
| Parametros totales | 0,6B en el backbone; 262.657 parámetros en el módulo de safetensors del repo (adaptador y cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada (límite de las ramas de entrada) |
| Tipos de cuantizacion | Paquete de 4 bits para el checkpoint actual; requiere GPU CUDA con soporte BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `adapter/` y `decision_head.safetensors`); cargador propio en `inference.py` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y le superpone un adaptador LoRA junto con una cabeza de decisión que produce un logit por cada opción candidata. Las opciones se puntúan de forma equivariante a permutaciones: los identificadores de las opciones se excluyen del texto de entrada y solo se usan para el seguimiento interno, de manera que la puntuación depende del contenido de cada candidata y no de su posición en la lista. Las probabilidades se normalizan sobre el conjunto finito de opciones proporcionadas.

El entrenamiento se apoya en parte en el dataset público Jev Decisions v1 (`samatv256/jev-decisions-v1`). El checkpoint liberado corresponde a la actualización 10.626 de un plan de 50.000, y el autor indica que habrá más entrenamiento y supervisión de decisiones más amplia. La supervisión se orienta a selección de función y acción, no a la generación de argumentos ni a la ejecución de llamadas. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Selección finita de herramientas y acciones: recibe estado, pregunta y candidatas, y devuelve una probabilidad por candidata.
- Scoring equivariante a permutaciones: el orden de las opciones no afecta a la distribución de salida.
- Selección de identidad de función entre 2 y 4 definiciones, con un 96,5% en la adaptación propia sobre BFCL V1 Multiple Function.
- Decisiones tipadas con opciones de tipo `choice`, `noul` y `score`, aunque con rendimiento desigual según el subtipo.
- Integración como componente de enrutamiento en pipelines de agentes, previa a la generación de argumentos o a la ejecución de la llamada.
- Carga mediante un módulo de inferencia propio (`inference.py`) que descarga el backbone Qwen3-0.6B por separado.
- Soporte de modo offline mediante `HF_HUB_OFFLINE=1` con caché previa del release y del backbone.
- No genera texto libre, no produce argumentos de herramientas y no ejecuta llamadas.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el estado de la conversación y un catálogo cerrado de herramientas, el modelo devuelve la probabilidad de cada una y el orquestador selecciona la de mayor puntuación. Es adecuado porque evita el parseo de texto generado y el sesgo por orden de presentación.
- Desambiguación entre funciones con nombres y descripciones similares: con 2 a 4 definiciones, el modelo alcanza un 96,5% en la adaptación BFCL, por lo que sirve para separar herramientas como `get_weather_forecast` frente a `calculate_invoice_total` en un mismo turno.
- Pre-filtrado en pipelines multi-herramienta: se usa como primera etapa que reduce un conjunto amplio de candidatas a unas pocas antes de invocar un LLM mayor que genere los argumentos, reduciendo coste y latencia.
- Clasificación de intención con etiquetas predefinidas: al formular las intenciones como opciones candidatas, el modelo puede operar como clasificador de decisión sobre un conjunto finito, siempre que el dominio se mantenga cerca del entrenamiento.
- Control de flujo en sistemas de agentes con pasos discretos: seleccionar la siguiente acción (consultar, responder, escalar, pedir aclaración) a partir del estado actual, usando la distribución de probabilidad como señal de confianza.
- Evaluación y monitorización de agentes: comparar la opción elegida por el modelo con la acción realmente ejecutada para detectar desviaciones en producción, gracias a que la salida es una distribución explícita y no texto libre.
- Experimentación académica sobre decisión frente a generación: usar el checkpoint como baseline ligero para estudiar selección finita con cabezas de decisión sobre backbones pequeños.

## Benchmarks y rendimiento

| Evaluación | Resultado | Alcance |
|---|---:|---|
| BFCL V1 Multiple Function - adaptación de selección de función | 96,5% (193/200) | Selecciona la identidad de función entre 2 y 4 definiciones. No es una puntuación oficial del leaderboard BFCL; no genera argumentos ni ejecuta llamadas. |
| Choice estricto en held-out | 65,6% (63/96) | Slice de validación seleccionado y equilibrado por buckets, no la validación completa. |
| Decisiones tipadas OOD propias | 72,0% (36/50) | Prueba sintética pequeña con distractores sencillos; no es un benchmark público. |
| LocalLLaMA/typed-decisions, test completo | 34,0% (680/2.000) | Choice 27,0%, Noul 52,2%, Score 25,6%. Las decisiones tipadas generales siguen siendo un punto débil. |

El propio autor advierte que estas evaluaciones usan datasets y denominadores distintos y que sus porcentajes no son directamente comparables entre sí. En un slice held-out con 17 o más candidatas el modelo acertó 4 de 17, lo que indica un deterioro claro con conjuntos grandes de opciones.

## Requisitos de hardware

- VRAM estimada: el paquete actual es de 4 bits y requiere una GPU CUDA con soporte BF16; al tratarse de un backbone de 0,6B con adaptador y cabeza, la huella es reducida, aunque la información disponible no especifica una cifra exacta de VRAM.
- GPU recomendadas: cualquier GPU CUDA con BF16; no se detallan modelos concretos (A100, H100, RTX 4090) en la información disponible.
- GPU de consumo: por el tamaño del backbone (0,6B) y el paquete de 4 bits, es esperable que quepa en GPU de consumo, pero no se confirma en la documentación disponible.
- Despliegue: cargador propio `inference.py` con `MiniJev.load()`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: `huggingface_hub==1.33.0` y las dependencias de `requirements.txt`; el backbone Qwen3-0.6B se descarga por separado en la primera carga.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mini-Jev (step 10.626) | 0,6B base + adaptador LoRA | 8.192 tokens | Selección finita de herramientas y acciones con cabeza de decisión | Apache 2.0 | Hugging Face, checkpoint interino |
| Qwen3-0.6B | 0,6B | no disponible en la información | LLM generativo generalista | no disponible en la información | Hugging Face, backbone base |
| Modelos de tool calling generativos de tamaño pequeño | no disponible | no disponible | Generación de llamadas y argumentos en texto | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (modelos de decisión con cabeza dedicada) no está disponible en la información proporcionada. Frente a un LLM generativo del mismo tamaño, la diferencia funcional es que mini-Jev no produce texto ni argumentos, sino una distribución sobre un conjunto cerrado de opciones.

## Limitaciones y advertencias

- Checkpoint interino: corresponde al paso 10.626 de 50.000; el autor lo califica explícitamente como no final.
- Rendimiento débil en decisiones tipadas generales: 34,0% en el test completo de LocalLLaMA/typed-decisions.
- Deterioro con conjuntos grandes de candidatas: 4 de 17 aciertos en un slice held-out de 17 o más opciones.
- No es un modelo de probabilidad ni de clasificación general; las probabilidades no están calibradas para dominios arbitrarios.
- No genera argumentos de herramientas ni ejecuta llamadas; solo selecciona entre opciones suministradas.
- El 96,5% en BFCL V1 no es una puntuación oficial del leaderboard y se limita a la selección de identidad de función con 2 a 4 definiciones.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Requiere GPU CUDA con BF16 y dependencias específicas; el backbone se descarga por separado.
- Los pesos raíz `model.safetensors` y `odm_mini.py` pertenecen a una versión anterior y no deben usarse como checkpoint actual; hay que fijar la revisión `step-010626`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, si bien al tratarse de un modelo de selección el riesgo se manifiesta como elección errónea de opción más que como texto inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samatv256/mini-Jev
- Revisión del checkpoint actual: https://huggingface.co/samatv256/mini-Jev/tree/step-010626
- Revisión anterior (baseline v1): https://huggingface.co/samatv256/mini-Jev/tree/02acc03cc28ec0b99705a8459ea987274fa7987f
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset Jev Decisions v1: https://huggingface.co/datasets/samatv256/jev-decisions-v1
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Ejemplos BFCL V1 Multiple Function AST: https://github.com/EnlightenedAI/BFCL/blob/main/berkeley-function-call-leaderboard/bfcl_eval/data/README.md
