# agentic-underground/granite-4.0-h-1b-to-h-tiny-bridge

## Resumen

El modelo `granite-4.0-h-1b-to-h-tiny-bridge` es un puente de estado (state bridge) desarrollado por agentic-underground que conecta dos modelos de la familia Granite 4.0 de IBM: Granite 4.0 H 1B como modelo donante y Granite 4.0 H Tiny como modelo receptor. No es un modelo generativo autonomo, sino un artefacto de pesos (366 MB) que traduce la representacion interna que el modelo 1B construye al procesar un prompt hacia la memoria que el modelo Tiny necesita para responder, permitiendo que este ultimo genere la respuesta leyendo un unico token del prompt original.

El puente aplica el metodo LatentPort de Simon Villani (arXiv:2609.25053) sobre una arquitectura hibrida Mamba-2/attention. Ambos modelos comparten 40 capas (36 Mamba-2 y 4 de attention en las posiciones 5, 15, 25 y 35), pero el estado recurrente Mamba-2 no es transferible directamente entre tamanos: alimentar al Tiny con el estado nativo del 1B produce una perdida de 12,57 por token, peor que no darle memoria alguna (1,84). La solucion consiste en traducir la entrada de cada capa Mamba-2 mediante regresiones ridge y dejar que el Tiny construya su propio estado.

La relevancia del artefacto es experimental y metodologica: demuestra que es posible transferir contexto entre modelos de distinto tamano dentro de la misma familia sin copiar estados internos, logrando un ratio de cierre nativo (NCR) de 0,924 y una aceleracion de aproximadamente 2x en la generacion frente a procesar el prompt completo. Esta pensado para investigadores que trabajen en tecnicas de model bridging, comparticion de KV-cache y optimizacion de inferencia en arquitecturas hibridas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de estado sobre arquitectura hibrida Mamba-2 (36 capas) + attention (4 capas); modelos base con 40 capas, ancho oculto 1536, 12 query heads y 4 KV heads de 128 |
| Parametros totales | No disponible (el artefacto es un conjunto de matrices ridge de 3073 x 1536 y 3073 x 512 en f16; el modelo receptor H Tiny es un MoE de 7B) |
| Parametros activos | 6 de 64 expertos por token en H Tiny (no disponible el numero exacto de parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El artefacto se distribuye en f16; los modelos base en bf16. No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (366 MB, sin metadatos `__metadata__`) |

## Arquitectura y entrenamiento

El puente opera sobre dos modelos con 40 capas cada uno: 36 capas Mamba-2 y 4 capas de attention en las posiciones 5, 15, 25 y 35. Aunque ambos comparten la forma del estado Mamba-2 (48 cabezas, estado de dimension 128), fueron entrenados por separado y el estado del 1B no es utilizable directamente por el Tiny. Por ello, para cada capa Mamba-2 se entrena una regresion ridge (lambda = 10^-3) que predice las filas de entrada normalizadas de esa capa en el Tiny a partir de dos puntos de lectura (taps) del flujo residual del 1B, mas un termino de intercepto. El Tiny ejecuta despues su propia proyeccion de entrada, convolucion y scan sobre esas filas, construyendo su estado en sus propios terminos. En las 4 capas de attention se traducen claves y valores con la correccion aprendida del paper.

El ajuste se realizo sobre 43.345 filas procedentes de respuestas de hasta 192 tokens, con R² de 0,74 a 0,97 para las entradas Mamba-2, de 0,87 a 0,94 para las claves y de 0,74 a 0,87 para los valores. La correccion residual de rango 4 para claves y valores de attention se entreno a traves del H Tiny congelado contra su propia distribucion nativa (451 preguntas, 3 epocas, perdida de 0,081 a 0,069 a 0,062) y se pliega en el fichero como `I + BUᵀ`. Los datos de calibracion son 451 preguntas con plantilla generadas de forma determinista por `crates/core/src/bridge_corpus.rs`; las preguntas de validacion nunca se usan en el ajuste. Cada tensor `k.<l>` para capas Mamba-2 tiene forma 3073 x 1536 en f16, y los tensores `k.<l>` y `v.<l>` de las capas de attention tienen forma 3073 x 512.

## Capacidades

- Transferencia de contexto entre modelos: permite que Granite 4.0 H Tiny responda a un prompt procesado por Granite 4.0 H 1B leyendo un unico token del prompt original, en lugar de reprocesar el historial completo.
- Cierre de la brecha de rendimiento: alcanza un NCR (native-closure ratio) de 0,924 con la correccion aprendida, frente a 0,916 de las regresiones ridge solas, sobre preguntas de validacion no vistas durante el ajuste.
- Robustez frente a donantes incorrectos: con un donante erroneo el NCR es de -0,175, lo que confirma que el puente no introduce informacion espuria y que la memoria traducida procede efectivamente del prompt correcto.
- Traduccion de estado Mamba-2: primera aplicacion documentada de LatentPort a un modelo cuya memoria es mayoritariamente estado recurrente Mamba-2, no solo KV-cache de attention.
- Generacion de texto a traves del modelo receptor: el H Tiny genera la respuesta final con su propio decodificador y enrutamiento de expertos; el puente no anade capacidades generativas propias.
- Aceleracion de inferencia: reduce el coste de prefill al evitar que el modelo receptor procese el historial completo del prompt.
- No soporta tool calling, function calling, vision, audio ni modos de razonamiento extendido por si mismo; estas capacidades dependerian exclusivamente de los modelos base.

## Casos de uso

- Investigacion en model bridging: el artefacto sirve como referencia reproducible para estudiar la transferibilidad de estado entre modelos de distinto tamano dentro de una misma familia, con scripts de reproduccion documentados en PrattleNot.
- Optimizacion de prefill en produccion: en un pipeline con un modelo pequeno para prefill y uno mayor para generacion, el puente permite al modelo receptor arrancar con el contexto ya procesado, reduciendo el coste computacional del prompt en aproximadamente 2x.
- Evaluacion de tecnicas de comparticion de estado en arquitecturas hibridas: util para comparar el comportamiento de puentes sobre Mamba-2 frente a puentes puramente de attention, dado que el handoff exige ejecutar proyeccion, convolucion y scan en 36 capas.
- Sistemas de enrutamiento de contexto entre modelos: escenarios donde un modelo ligero clasifica o procesa el prompt y un modelo mayor responde, con el puente como mecanismo de transferencia de la representacion intermedia.
- Reproduccion academica del paper LatentPort: el repositorio PrattleNot incluye los comandos `bridge-fit-granite` y `bridge-correct-granite` y los documentos `BRIDGE.md` y `REPRODUCTION.md` para repetir cada cifra.
- Benchmarking de latencia en hardware heterogeneo: el artefacto permite medir como la velocidad del host CPU afecta al enrutamiento de expertos del MoE y, por tanto, a la ganancia real del puente en despliegues con una o dos GPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| NCR con regresiones ridge solas | 0,916 |
| NCR con correccion aprendida | 0,924 |
| NCR con donante incorrecto | -0,175 |
| Perdida por token del H Tiny leyendo todo | 0,184 |
| Perdida por token del H Tiny con puente | 0,310 |
| Perdida por token del H Tiny sin memoria | 1,837 |
| Perdida por token con memoria de pregunta incorrecta | 2,126 |
| Preguntas correctas (de 7) | 7 (igual que cada modelo por separado) |
| Aceleracion, run 1, una RTX 3090 | 1,98x (1,87-2,10) de un techo de 3,68x |
| Aceleracion, run 1, dos RTX 3090 | 1,79x (1,61-1,98) de un techo de 3,93x |
| Aceleracion, run 2, una RTX 3090 | 2,06x (1,95-2,18) de un techo de 3,95x |
| Aceleracion, run 2, dos RTX 3090 | 1,78x (1,72-1,85) de un techo de 3,99x |
| Aceleracion con CPU saturada | 1,38x de un techo de 2,69x |
| R² de las regresiones ridge | 0,74-0,97 (Mamba-2), 0,87-0,94 (claves), 0,74-0,87 (valores) |
| Perdida de la correccion durante el entrenamiento | 0,081 → 0,069 → 0,062 (3 epocas) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas propias del paper LatentPort y de la evaluacion del autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desagregada; el artefacto ocupa 366 MB en disco y se carga en f16, mientras que ambos modelos base se ejecutan en bf16.
- GPU recomendadas: RTX 3090 es el hardware usado en las mediciones del autor; no se documentan otras GPU.
- Cabe en consumer GPU: si, al menos en una RTX 3090 para el conjunto de ambos modelos en bf16 segun los experimentos del autor.
- Opciones de despliegue: la unica via documentada es el repositorio PrattleNot mediante el comando `just speedup` con variables de entorno `PRATTLE_SOURCE_DTYPE`, `PRATTLE_TARGET_DTYPE` y `PRATTLE_DEVICES`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la aceleracion medida es de 1,98x a 2,06x con una sola GPU y de 1,78x a 1,79x con dos GPU, sobre prompts de aproximadamente 256 tokens, 8 prompts y 3 repeticiones. La cifra depende fuertemente de la carga del CPU anfitrion, ya que el enrutamiento de expertos del H Tiny se ejecuta en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.0-h-1b-to-h-tiny-bridge | No disponible (artefacto de 366 MB) | No disponible | Puente de estado Mamba-2 + attention sobre LatentPort | Apache-2.0 | Hugging Face, 0 descargas |
| Otros puentes de agentic-underground | No disponible | No disponible | Puentes de KV-cache y correccion aprendida sobre otros pares de modelos | No disponible | No disponible en la informacion proporcionada |
| Granite 4.0 H Tiny (modelo base) | 7B MoE, 64 expertos, 6 activos | No disponible | Generacion directa sin puente | Apache-2.0 | Hugging Face |
| Granite 4.0 H 1B (modelo base) | 1B | No disponible | Generacion directa sin puente | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto no es un modelo autonomo: requiere cargar simultaneamente Granite 4.0 H 1B y Granite 4.0 H Tiny, con el coste de memoria y computo asociado.
- La ganancia de velocidad depende criticamente de la carga del CPU anfitrion, ya que el enrutamiento de expertos del H Tiny se ejecuta en CPU; con el CPU saturado la aceleracion cae a 1,38x.
- La aceleracion se mantiene por debajo del techo teorico porque el handoff exige ejecutar proyeccion, convolucion y scan sobre 36 capas de entrada traducida, algo que un puente de clave/valor convencional no necesita.
- La evaluacion se limita a 7 preguntas de validacion y 451 preguntas de calibracion generadas de forma determinista; no hay evidencia publicada sobre dominios abiertos, codigo o matematicas.
- El NCR es un ratio de perdida, no una tasa de coincidencia de tokens; el autor advierte explicitamente de que el recuento de respuestas correctas no puede demostrar una ganancia porque ambos modelos aciertan las 7 preguntas.
- El puente no aporta capacidades propias: tool calling, vision, audio y multilingueismo dependen exclusivamente de los modelos base y no se documentan en la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la compatibilidad con las condiciones de los modelos base de IBM, tambien Apache-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-underground/granite-4.0-h-1b-to-h-tiny-bridge
- Paper LatentPort (arXiv:2609.25053): https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentacion del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Documentacion de reproduccion: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibracion: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Modelo base Granite 4.0 H 1B: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Modelo base Granite 4.0 H Tiny: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
