# rlacombe/glycogen-mdlm-50m-seed1

## Resumen

GlycoGen-MDLM (50M, seed 1) es un checkpoint de PyTorch entrenado por Romain Lacombe (rlacombe) para la prediccion de estructuras de glicanos a partir de datos de espectrometria de masas. Forma parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026. El modelo aborda un problema clasico en glicomica: la determinacion de la estructura de un glicano a partir de su espectro, una tarea con alta ambiguedad estructural y que tradicionalmente requiere interpretacion experta.

El modelo combina un modelo de lenguaje de difusion enmascarada (Masked Diffusion Language Model, MDLM) de 128 pasos con una tecnica denominada Crystallizing Flows, una variante de discrete flow matching aplicada al espacio discreto de estructuras de glicanos. Con un tamano de 50 millones de parametros, es un modelo compacto orientado a una tarea cientifica muy especifica, no a proposito general.

La relevancia actual del checkpoint reside en su rendimiento reportado: una precision estructural top-1 del 92,47% ± 0,11% sobre un conjunto de test de 76.774 muestras (media de 3 semillas, K=32). El repositorio ocupa 3,9 GB e incluye el checkpoint `best_model.pt` entrenado con la semilla aleatoria 1. Se distribuye con licencia MIT, lo que facilita su reutilizacion en investigacion y en pipelines de analisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked Diffusion Language Model (MDLM) de 128 pasos + Crystallizing Flows (discrete flow matching) |
| Parametros totales | 50M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `best_model.pt`) |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusion enmascarada sobre secuencias discretas, con un proceso de generacion de 128 pasos. Sobre esa base se aplica Crystallizing Flows, una formulacion de discrete flow matching que guia la generacion hacia estructuras de glicanos validas. El modelo no es un transformer autoregresivo convencional ni un modelo de lenguaje natural: opera sobre representaciones discretas de estructuras de glicanos condicionadas por espectros de masas.

El checkpoint corresponde a la semilla de inicializacion aleatoria 1 y se describe como convergido. El entrenamiento utiliza el benchmark `rlacombe/candycrunch-v2-benchmark`, con un conjunto de test de 76.774 muestras. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO (no disponibles). La innovacion tecnica destacable es la combinacion de MDLM con Crystallizing Flows para la prediccion estructural en un espacio discreto y altamente restringido como el de los glicanos.

## Capacidades

- Prediccion de estructura de glicanos a partir de espectros de masas (tarea principal).
- Generacion de estructuras discretas mediante difusion enmascarada con 128 pasos.
- Modelado de flujos discretos (discrete flow matching) para muestreo condicionado.
- Evaluacion con metricas de precision estructural top-1 sobre conjuntos de test a gran escala.
- Inferencia reproducible mediante scripts del repositorio GitHub asociado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (modelo de dominio cientifico).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Anotacion automatizada de glicanos en pipelines de glicomica: el modelo toma espectros de masas y predice la estructura top-1, reduciendo la revision manual en laboratorios que procesan grandes lotes de muestras.
- Analisis de glicosilacion en estudios de biologia estructural: permite asignar estructuras a espectros de glicanos de forma sistematica, acelerando la caracterizacion de glicoproteinas.
- Control de calidad en espectrometria de masas: comparar la estructura predicha con la anotada permite detectar espectros anomalos o mal calibrados en lotes de adquisicion.
- Investigacion en metodos generativos discretos: el checkpoint sirve como referencia reproducible (semilla 1) para comparar variantes de MDLM y Crystallizing Flows en tareas discretas.
- Reproduccion de resultados academicos: al estar publicado con licencia MIT y scripts de inferencia, permite replicar la precision reportada del 92,47% en el benchmark `candycrunch-v2-benchmark`.
- Desarrollo de herramientas de escritorio o servidor para glicobiologia: con 50M de parametros, el modelo es lo bastante pequeno para integrarse en entornos de laboratorio con recursos limitados, siempre que se disponga de PyTorch.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| `candycrunch-v2-benchmark` (test, n = 76.774) | Precision estructural top-1 (K=32, media de 3 semillas) | 92,47% ± 0,11% |

No se han publicado en la informacion disponible resultados adicionales (MMLU, HumanEval, GSM8K u otros), ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 50M de parametros en precision FP32 el peso del modelo ronda los 200 MB, por lo que la VRAM necesaria es modesta. El repositorio completo ocupa 3,9 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, aunque no se confirma en la model card.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano de 50M de parametros; sin datos oficiales de latencia.
- Opciones de despliegue: inferencia mediante los scripts del repositorio `github.com/rlacombe/GlycoGen` con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de estructura de glicanos ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un modelo de lenguaje general ni sirve para tareas de texto, codigo o conversacion.
- La model card no documenta sesgos; al entrenarse sobre un unico benchmark (`candycrunch-v2-benchmark`), el rendimiento fuera de esa distribucion de datos es desconocido.
- Riesgo de predicciones estructurales incorrectas en glicanos atipicos o espectros de baja calidad; la precision reportada es top-1, no una garantia por muestra.
- No se detalla la cobertura de tipos de glicanos, condiciones experimentales ni instrumentos de espectrometria soportados.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre el benchmark.
- No hay informacion sobre cuantizacion, contexto maximo ni requisitos exactos de inferencia; conviene validar el entorno con los scripts oficiales antes de usarlo en produccion.
- El checkpoint corresponde a una sola semilla (seed 1); la variabilidad entre semillas se reporta agregada (3 semillas) pero no se detalla por semilla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycogen-mdlm-50m-seed1
- Repositorio de codigo e inferencia: https://github.com/rlacombe/GlycoGen
- Pagina del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
