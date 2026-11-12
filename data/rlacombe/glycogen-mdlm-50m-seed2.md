# rlacombe/glycogen-mdlm-50m-seed2

## Resumen

GlycoGen-MDLM (50M, seed 2) es un checkpoint de PyTorch entrenado por Romain Lacombe (rlacombe) para la prediccion de estructuras de glicanos a partir de datos de espectrometria de masas. Forma parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026. El modelo aborda un problema clasico y dificil en glicomica: inferir la estructura de un glicano (composicion, ramificacion y enlaces) a partir de su espectro de masas, una tarea con enorme ambiguedad estructural y sin apenas herramientas de aprendizaje profundo consolidadas hasta la fecha.

Tecnicamente es un modelo de lenguaje de difusion enmascarada (Masked Diffusion Language Model) de 50 millones de parametros con un proceso de 128 pasos de difusion, combinado con la tecnica de "crystallizing flows" propuesta por los autores. El modelo se ha entrenado sobre el benchmark CandyCrunch v2 y reporta una precision estructural top-1 del 92,47 % ± 0,11 % sobre un conjunto de test de 76.774 muestras (media de 3 semillas, K=32).

Su relevancia es doble: por un lado, demuestra que los modelos de difusion discreta pueden aplicarse con exito a dominios cientificos especializados con estructuras combinatorias (arboles de glicanos); por otro, libera un checkpoint reproducible (semilla 2) bajo licencia MIT junto con codigo de inferencia, lo que facilita la replicacion y la extension del metodo por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked Diffusion Language Model (MDLM) de 128 pasos + Crystallizing Flows |
| Parametros totales | 50M (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una formulacion de difusion discreta sobre secuencias: un Masked Diffusion Language Model que corrompe progresivamente la representacion del glicano con tokens de mascara y aprende a reconstruirla en un proceso de 128 pasos. Sobre esta base se anade el mecanismo de "crystallizing flows", una innovacion de los autores orientada a imponer estructura en el proceso generativo, presumiblemente para respetar las restricciones combinatorias y jerarquicas de los glicanos (ramificaciones, tipos de enlace, orden de monosacaridos).

El entrenamiento se realiza sobre el benchmark CandyCrunch v2 (`rlacombe/candycrunch-v2-benchmark`), un conjunto de datos de espectrometria de masas de glicanos. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO (poco probables en un modelo de dominio cientifico de este tipo). El checkpoint publicado corresponde a la semilla de inicializacion aleatoria 2, lo que sugiere que los autores liberan replicas por semilla para estudiar la varianza del entrenamiento.

## Capacidades

- Prediccion de estructura de glicanos a partir de espectros de masas: tarea principal del modelo, con precision estructural top-1 reportada del 92,47 %.
- Modelado generativo discreto: al ser un MDLM, puede muestrear estructuras mediante difusion enmascarada con K=32 muestras por inferencia.
- Reproducibilidad por semilla: el checkpoint corresponde a una semilla concreta (seed 2), lo que permite estudiar variabilidad entre ejecuciones.
- Inferencia via scripts oficiales: el repositorio de GitHub incluye scripts de inferencia especificos.
- No se documentan capacidades de tool calling, agentes, vision, audio ni soporte multilingue; se trata de un modelo de dominio cientifico especializado, no de un modelo conversacional de proposito general.

## Casos de uso

- Anotacion automatizada de glicanos en pipelines de glicomica: el modelo predice la estructura a partir del espectro de masas, reduciendo la revision manual en estudios de glicosilacion a gran escala.
- Descubrimiento de biomarcadores de glicanos: al procesar grandes volumenes de espectros, permite correlacionar estructuras de glicanos con fenotipos (por ejemplo, perfiles de glicosilacion en cancer o enfermedades inflamatorias).
- Control de calidad en biofarmaceutica: verificacion de los perfiles de glicosilacion de anticuerpos monoclonales, donde la estructura del glicano afecta a la eficacia y seguridad del farmaco.
- Investigacion en biologia estructural: generacion de hipotesis estructurales para glicanos ambiguos que luego se validan con tecnicas complementarias (RMN, cristalografia).
- Benchmarking de metodos de prediccion: el checkpoint y el dataset CandyCrunch v2 sirven como linea base reproducible para comparar nuevos enfoques de aprendizaje automatico en glicomica.
- Reproduccion y extension academica: al estar bajo licencia MIT y con codigo disponible, otros grupos pueden reentrenar, ajustar o adaptar el modelo a nuevos espectrometros o protocolos de adquisicion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision estructural top-1 (test, n = 76.774) | 92,47 % ± 0,11 % |
| Configuracion de evaluacion | K=32, media de 3 semillas |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a este dominio. Tampoco se detallan metricas secundarias como precision por tipo de enlace o recall estructural.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 50M de parametros, en fp32 ocuparia aproximadamente 200 MB de pesos, y en fp16 unos 100 MB, por lo que cabria holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; tambien es viable en CPU para inferencia puntual.
- Cabe en GPU consumer: si, practicamente en cualquier tarjeta moderna (RTX 3060 en adelante, e incluso integradas con suficiente memoria).
- Opciones de despliegue: al ser un checkpoint PyTorch puro, el despliegue se realiza mediante los scripts oficiales del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El proceso de difusion de 128 pasos y K=32 muestras por inferencia implica un coste computacional mayor que una pasada autoregresiva unica, pero con 50M de parametros el coste absoluto es bajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlycoGen-MDLM 50M | 50M | no disponible | Prediccion de estructura de glicanos | MIT | Hugging Face + GitHub |
| Alternativas en glicomica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (prediccion de estructuras de glicanos con modelos generativos). Herramientas clasicas del dominio como motores de busqueda de espectros o heuristicas de fragmentacion no son directamente comparables en parametros ni contexto.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un modelo de lenguaje general; no debe usarse para generacion de texto, codigo ni tareas conversacionales.
- Sesgos de dominio: el rendimiento esta medido sobre el benchmark CandyCrunch v2; puede degradarse en espectrometros, protocolos de ionizacion o tipos de glicanos poco representados en el entrenamiento.
- Riesgo de predicciones estructurales incorrectas: aunque la precision top-1 es alta (92,47 %), un 7,5 % de estructuras erroneas puede ser critico en contextos clinicos o biofarmaceuticos; se recomienda validacion complementaria.
- Limitaciones de contexto e idioma: no se documentan; el modelo no procesa lenguaje natural.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, conviene revisar las condiciones de los datos de entrenamiento (CandyCrunch v2) para uso comercial.
- Reproducibilidad: el checkpoint corresponde a una unica semilla (seed 2); la varianza entre semillas (± 0,11 %) es baja pero debe tenerse en cuenta.
- Documentacion incompleta: no se detallan hiperparametros, composicion del dataset ni detalles del proceso de crystallizing flows en la informacion disponible; es necesario consultar el paper y el repositorio para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycogen-mdlm-50m-seed2
- Repositorio de codigo e inferencia: https://github.com/rlacombe/GlycoGen
- Pagina del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
- Paper: "GlycoGen: Glycan Structure Prediction with Crystallizing Flows" (NeurIPS 2026), citado en la model card; enlace directo no disponible.
