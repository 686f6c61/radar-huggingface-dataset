# julianoelhaf/genco-case500-small-n2ft

## Resumen

`julianoelhaf/genco-case500-small-n2ft` es un checkpoint de un modelo subrogado de flujo de potencias (power flow) para redes electricas, obtenido por fine-tuning del checkpoint `case500_goc Small seed 0` publicado por GridFM en `gridfm/genco-pf-datakit`. No es un modelo de lenguaje: es una red neuronal sobre grafos que predice el estado de la red (flujo de potencias) a partir de la topologia y las condiciones de carga y perturbacion, entrenada sobre el caso de 500 nudos del ecosistema gridfm-datakit. Lo desarrolla el usuario `julianoelhaf` como parte de un trabajo de investigacion reproducible sobre cribado (screening) de contingencias N-2.

El fine-tuning consiste en 40 epocas con learning rate 2e-4 y batch 64 sobre 49.948 muestras de gridfm-datakit con topologias N-0, N-1 y N-2 en proporcion 10/45/45 %, usando la semilla 23 y los ajustes de carga y perturbacion del caso500 liberados. La mejor perdida de validacion reportada es 0,00078. Los artefactos publicados son `best_model_state_dict.pt` (pesos), `normalizer_stats.pt` (estadisticos de normalizacion) y dos ficheros de configuracion (`f_pf500_train_nk2.yaml` para datos y `f_pf500_ft_nk2.yaml` para entrenamiento).

Su relevancia es doble. Por un lado, ataca un problema caro en operacion de red: evaluar el impacto de dobles contingencias (N-2) sin resolver un flujo de potencias AC completo por cada par de elementos. Por otro, el autor documenta un resultado negativo preinscrito: el modelo no es mas preciso cerca de los limites de linea y no supera a una linea base incremental DC anclada en N-1 para el cribado N-2. Es decir, el valor actual del artefacto es metodologico y de reproducibilidad, no de rendimiento superior al estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal sobre grafos (gridfm-graphkit); no se detalla la topologia exacta de capas en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos de red electrica; no hay ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en punto flotante PyTorch) |
| Idiomas soportados | no aplica / no disponible (modelo de regresion fisica, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `state_dict` (`best_model_state_dict.pt`) + `normalizer_stats.pt` |
| Modelo base | `gridfm/genco-pf-datakit`, checkpoint `case500_goc Small seed 0` |
| Dataset de fine-tuning | `julianoelhaf/genco-n2-guaranteed-screening` (49.948 muestras) |
| Entrenamiento | 40 epocas, lr 2e-4, batch 64, semilla 23 |
| Perdida de validacion | 0,00078 (mejor) |
| Libreria | pytorch |
| Tamano del repo | 0.0 GB segun metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint `case500_goc Small seed 0` de GridFM, una red neuronal que opera sobre la representacion en grafo de la red electrica (nudos como nodos, lineas y transformadores como aristas) y que aprende un surrogate del flujo de potencias. La informacion disponible no detalla el numero de capas, dimensiones ocultas ni el mecanismo de agregacion de mensajes; la evaluacion debe hacerse con `gridfm-graphkit` en `main` (commit `1e370e5`), igual que el checkpoint original, lo que sugiere que la compatibilidad depende de esa version concreta de la libreria.

El entrenamiento de fine-tuning usa 49.948 muestras con topologias N-0, N-1 y N-2 (10 %, 45 % y 45 % respectivamente), generadas con los ajustes de carga y perturbacion del caso500 liberado y semilla 23. La innovacion metodologica no esta en el modelo sino en el protocolo: resultado preinscrito, configuraciones versionadas y comparacion contra una linea base DC incremental anclada en N-1. No se menciona uso de RLHF, DPO ni decodificacion especulativa, lo cual es coherente con un modelo de regresion sobre grafos. Los ficheros de configuracion `f_pf500_train_nk2.yaml` y `f_pf500_ft_nk2.yaml` documentan pipeline de datos y receta de entrenamiento.

## Capacidades

- Prediccion de flujo de potencias (power flow) sobre el caso de 500 nudos del ecosistema gridfm-datakit.
- Evaluacion de topologias con contingencias simples y dobles (N-0, N-1, N-2) en una sola pasada de inferencia.
- Generalizacion a perturbaciones y niveles de carga dentro del rango usado en el dataset de entrenamiento (ajustes del caso500, semilla 23).
- Regresion sobre representaciones en grafo de la red, sin necesidad de resolver iterativamente las ecuaciones AC.
- Integracion con `gridfm-graphkit` para carga de pesos, normalizacion y evaluacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No soporta vision, audio ni modos de "pensamiento".

## Casos de uso

- Cribado (screening) de contingencias N-2 en planificacion: usar el modelo como prefiltro rapido sobre el conjunto de pares de elementos y reservar el solver AC exacto para los casos senalados como criticos. El autor advierte que no supera a la linea base DC incremental anclada en N-1, por lo que su uso razonable es complementario, no sustitutivo.
- Investigacion reproducible en subrogados de flujo de potencias: el paquete incluye pesos, estadisticos de normalizacion, configuraciones y un resultado negativo preinscrito, lo que lo convierte en un punto de partida controlado para comparar arquitecturas GNN nuevas.
- Generacion de arranques en caliente (warm start) para un solver AC Newton-Raphson: la prediccion puede inicializar el punto de partida y reducir iteraciones, siempre con verificacion posterior de residuales.
- Estudios de expansion y sensibilidad de red: evaluar rapidamente el efecto de anadir o retirar elementos sobre el estado del sistema en el caso de 500 nudos, dentro del dominio de entrenamiento.
- Formacion y docencia: ilustrar como se comporta un surrogate neuronal frente a un solver fisico clasico, incluidos sus fallos cerca de los limites operativos.
- Deteccion de casos de fallo y enrutado a solver exacto: por el resultado negativo documentado cerca de limites de linea, el modelo puede usarse como disparador de "derivar a calculo exacto" cuando la prediccion se acerca a la frontera de factibilidad.
- Benchmark interno de pipelines de datos: validar la cadena gridfm-datakit (generacion de muestras, normalizacion, evaluacion) con un artefacto ya entrenado antes de lanzar campanas de entrenamiento propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica numerica reportada es la mejor perdida de validacion del fine-tuning: 0,00078 (40 epocas, lr 2e-4, batch 64). Ademas, el autor documenta un resultado negativo preinscrito: el modelo no mejora la precision cerca de los limites de linea y no supera a la linea base DC incremental anclada en N-1 en el cribado N-2 (fichero `OUTCOME_H15.md` en el dataset). No hay tablas de MMLU, HumanEval, GSM8K ni equivalentes porque el modelo no es linguistico; tampoco se aportan metricas de error de flujo de potencias (MAE/RMSE por magnitud y angulo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el numero de parametros y el tamano del repo figura como 0.0 GB en los metadatos de HuggingFace, lo que impide estimar con fiabilidad.
- GPU recomendadas: no disponibles en la informacion proporcionada. La designacion "Small" del checkpoint base sugiere un modelo de baja capacidad, pero no se confirma con recuento de parametros.
- Compatibilidad con GPU de consumo: no confirmada. Por el tipo de tarea (regresion sobre grafos de 500 nudos) es plausible que quepa en GPU de consumo, pero es una inferencia, no un dato publicado.
- Opciones de despliegue: carga directa del `state_dict` con `gridfm-graphkit` (commit `1e370e5`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamano del lote y del numero de topologias evaluadas por pasada.

## Comparativa con modelos similares

| Modelo / metodo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `julianoelhaf/genco-case500-small-n2ft` | no disponible | no aplica | val loss 0,00078; no supera la linea base DC N-1 en cribado N-2 | apache-2.0 | HuggingFace (0 descargas) |
| `gridfm/genco-pf-datakit` (base, case500_goc Small seed 0) | no disponible | no aplica | no disponible | no disponible en la informacion | HuggingFace, publicado por GridFM |
| Solver AC Newton-Raphson | no aplica | no aplica | exacto dentro de tolerancia; coste computational alto por contingencia | depende de la implementacion | estandar en herramientas de analisis de red |
| DC incremental anclado en N-1 (linea base del autor) | no aplica | no aplica | supera a este modelo en el cribado N-2 segun el resultado preinscrito | no aplica | reproducible con el codigo del repositorio |

No se dispone de datos suficientes para comparar parametros, contexto o metricas de error con otros subrogados GNN de flujo de potencias.

## Limitaciones y advertencias

- Resultado negativo documentado por el propio autor: no es mas preciso cerca de los limites de linea y no bate la linea base DC incremental anclada en N-1 en cribado N-2. No debe presentarse como mejora del estado del arte.
- Dominio restringido: entrenado sobre el caso de 500 nudos con los ajustes de carga y perturbacion del dataset y semilla 23. Fuera de ese rango la validez no esta garantizada.
- Dependencia de version: la evaluacion requiere `gridfm-graphkit` en `main` (commit `1e370e5`); otras versiones pueden romper la compatibilidad de pesos o normalizacion.
- Necesita `normalizer_stats.pt` ademas de los pesos; cargar solo el `state_dict` produce predicciones incorrectas de forma silenciosa.
- El tamano del repo figura como 0.0 GB y el modelo tiene 0 descargas y 0 likes: no hay evidencia de uso externo ni de validacion independiente. Conviene verificar que los ficheros de pesos esten realmente subidos (posibles punteros LFS sin contenido) antes de integrarlo.
- Riesgo de extrapolacion silenciosa: al ser un surrogate, puede devolver valores fisicamente inviables en topologias no vistas; se recomienda verificacion con solver exacto en cualquier decision operativa.
- Sin datos de sesgo en sentido estadistico, pero si sesgo de dominio: la distribucion N-0/N-1/N-2 del entrenamiento (10/45/45 %) condiciona el comportamiento por tipo de contingencia.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero sin garantias; el autor no ofrece soporte ni asume responsabilidad por decisiones de operacion de red.
- No es un modelo de lenguaje: no procesa texto, no responde en lenguaje natural y no admite instrucciones. Cualquier uso conversacional requeriria un LLM adicional.
- La busqueda web realizada no devolvio material tecnico relacionado (unicamente resultados no pertinentes), por lo que no hay fuentes externas independientes que contrasten las afirmaciones de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julianoelhaf/genco-case500-small-n2ft
- Dataset de datos y evaluacion: https://huggingface.co/datasets/julianoelhaf/genco-n2-guaranteed-screening
- Resultado preinscrito H15: https://huggingface.co/datasets/julianoelhaf/genco-n2-guaranteed-screening/blob/main/core/results/research/h14_n1anchor/OUTCOME_H15.md
- Codigo del proyecto: https://github.com/julianoelhaf/gridfm-genco-challenge
- Comandos de reproduccion (linea base DC): https://github.com/julianoelhaf/gridfm-genco-challenge/blob/v1.0/repro/2_strongest_dc_baseline.md
- Modelo base: https://huggingface.co/gridfm/genco-pf-datakit
