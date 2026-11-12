# rlacombe/glycogen-ar-50m-seed1

## Resumen

GlycoGen-AR (46,4 M, seed 1) es un checkpoint de PyTorch publicado por Romain Lacombe (rlacombe) como parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026. Se trata de un Transformer autoregresivo causal de arquitectura emparejada que sirve como línea base frente al metodo principal del articulo (discrete flow matching) para la prediccion de estructuras de glicanos a partir de espectrometria de masas.

El modelo no es un LLM de proposito general: es un modelo de dominio cientifico especializado en glicomica. Su tarea es reconstruir la estructura de un glicano (la secuencia de monosacaridos y sus enlaces) dado un espectro de masas, un problema central en biologia estructural y en el desarrollo de biofarmacos. El checkpoint corresponde a la semilla de inicializacion aleatoria 1 y se distribuye como pesos convergidos (`best_model.pt`).

Con 46,4 millones de parametros, un repositorio de 3,3 GB y una licencia MIT, el modelo esta pensado para reproducibilidad de resultados y para servir de referencia comparativa en el benchmark CandyCrunch v2. Su relevancia actual radica en que establece una linea base autoregresiva fuerte (90,38 % de exactitud estructural top-1) sobre un conjunto de test de 76.774 muestras, lo que permite medir la ganancia real de metodos generativos mas sofisticados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autoregresivo (arquitectura emparejada con el modelo principal de GlycoGen) |
| Parametros totales | 46,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en precision nativa PyTorch) |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |
| Objetivo de entrenamiento | Modelado autoregresivo causal (token a token) |
| Dataset de referencia | `rlacombe/candycrunch-v2-benchmark` |
| Tamano del repositorio | 3,3 GB |
| Semilla de inicializacion | 1 |

## Arquitectura y entrenamiento

El modelo es un Transformer causal autoregresivo con atencion estandar, disenado con la misma arquitectura que el modelo principal del articulo GlycoGen para que la comparacion entre el metodo autoregresivo y el de discrete flow matching sea limpia (matched-architecture). La generacion de la estructura del glicano se plantea como una secuencia de tokens que el modelo predice de izquierda a derecha, condicionada por la representacion del espectro de masas de entrada.

El entrenamiento se realizo sobre el benchmark CandyCrunch v2, con evaluacion sobre un conjunto de test de 76.774 muestras. El checkpoint publicado corresponde a la semilla 1 de un experimento repetido con tres semillas, y los resultados reportados son la media de las tres (90,38 % ± 0,05 % de exactitud estructural top-1 con beam=1). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO; tampoco se detalla si se emplearon tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de estructura de glicanos: reconstruye la secuencia de monosacaridos y enlaces a partir de datos de espectrometria de masas.
- Generacion autoregresiva token a token con decodificacion por beam search (resultados reportados con beam=1).
- Modelado de secuencias de dominio cientifico (no lenguaje natural).
- Reproducibilidad de experimentos: checkpoint asociado a una semilla concreta (seed 1) para comparaciones controladas.
- No soporta tool calling ni function calling (no disponible en la informacion).
- No soporta agentes ni razonamiento multi-paso de proposito general.
- Sin capacidades multilingues, de vision ni de audio documentadas.

## Casos de uso

- Analisis de glicanos en proteomica: dado un espectro de masas de un glicopeptido, el modelo predice la estructura del glicano asociado, lo que acelera la anotacion en estudios de glicoproteomica a gran escala.
- Control de calidad en biofabricacion: verificar la estructura de glicanos de anticuerpos monoclonales comparando la prediccion del modelo con la estructura esperada, detectando variaciones en el perfil de glicosilacion.
- Linea base en investigacion metodologica: servir como referencia autoregresiva contra la que medir metodos generativos mas complejos (por ejemplo, discrete flow matching) sobre el mismo benchmark.
- Reproducibilidad de resultados: al estar atado a una semilla concreta y a un benchmark publico, permite replicar exactamente los numeros del articulo en entornos de investigacion.
- Desarrollo de herramientas de anotacion semi-automatica: integrar el modelo en pipelines que propongan estructuras candidatas para revision manual por espectrometristas.
- Docencia y formacion: usar el checkpoint como ejemplo compacto (46,4 M de parametros) de modelado autoregresivo aplicado a datos cientificos no textuales.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CandyCrunch v2 (test, n = 76.774) | Exactitud estructural top-1, beam=1, media de 3 semillas | 90,38 % ± 0,05 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni metricas adicionales (top-k, exactitud por tipo de enlace, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para 46,4 M de parametros (los pesos ocupan aproximadamente 186 MB); el repositorio de 3,3 GB incluye artefactos adicionales ademas de los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: scripts de inferencia del repositorio oficial en GitHub (PyTorch); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlycoGen-AR (este modelo) | 46,4 M | no disponible | 90,38 % top-1 en CandyCrunch v2 | MIT | Hugging Face + GitHub |
| Modelo principal de GlycoGen (discrete flow matching) | no disponible | no disponible | no disponible en la informacion | no disponible | Referenciado en el articulo |
| Otras lineas base de prediccion de glicanos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es utilizable para tareas de lenguaje natural, codigo ni proposito general.
- Rendimiento medido unicamente en el benchmark CandyCrunch v2; el comportamiento fuera de esa distribucion de datos (otros instrumentos, otros tipos de espectrometria) no esta documentado.
- La exactitud del 90,38 % implica que aproximadamente 1 de cada 10 estructuras predichas es incorrecta; en aplicaciones criticas se requiere validacion experta.
- No se documentan sesgos, pero el dataset de entrenamiento puede sobrerrepresentar ciertas clases de glicanos, lo que introduciria sesgo de distribucion.
- Riesgo de alucinacion estructural: el modelo puede generar secuencias de glicanos quimicamente invalidas si no se aplican restricciones o validacion posterior.
- Licencia MIT: permite uso comercial, pero se recomienda citar el articulo de NeurIPS 2026 segun las practicas academicas.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.

## Enlaces

- Hugging Face: https://huggingface.co/rlacombe/glycogen-ar-50m-seed1
- Repositorio de codigo e inferencia: https://github.com/rlacombe/GlycoGen
- Pagina del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
- Articulo: Lacombe, R. "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", NeurIPS 2026.
