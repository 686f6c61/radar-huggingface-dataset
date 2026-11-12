# rlacombe/glycogen-dfm-50m

## Resumen

GlycoGen-DFM (50M) es un checkpoint de PyTorch entrenado para la predicción de estructuras de glicanos, desarrollado por Romain Lacombe (rlacombe) y presentado en el artículo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows" (NeurIPS 2026). El modelo aborda un problema específico de la glucómica computacional: inferir la estructura de un glicano a partir de datos de espectrometría de masas, una tarea que tradicionalmente requiere interpretación experta y resulta difícil de automatizar por la enorme variedad de ramificaciones y enlaces posibles.

La arquitectura combina Discrete Flow Matching con Crystallizing Flows, un enfoque generativo de flujo discreto que modela la estructura del glicano como una secuencia de decisiones discretas. Con 50 millones de parámetros, es un modelo compacto orientado a una tarea de dominio muy concreto, no a propósito general. El checkpoint publicado corresponde a una semilla de inicialización aleatoria concreta (seed 0) y se distribuye con licencia MIT.

Su relevancia radica en el rendimiento reportado: una precisión estructural top-1 del 92,67 % (K=32) y del 90,19 % (K=1) sobre un conjunto de test de 76.774 muestras, según la model card. Es un modelo de nicho, pensado para investigadores en glucómica y espectrometría de masas, no para aplicaciones de texto o multimodalidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Discrete Flow Matching + Crystallizing Flows |
| Parametros totales | 50M (según nombre del modelo; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio científico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en Discrete Flow Matching combinado con Crystallizing Flows, una formulación generativa para datos discretos que aprende una trayectoria de flujo entre una distribución base y la distribución objetivo de estructuras de glicanos. A diferencia de los transformers autorregresivos convencionales, este enfoque modela la generación como un proceso de flujo sobre estados discretos, lo que encaja con la naturaleza combinatoria de las estructuras de glicanos (ramificaciones, tipos de enlace y monosacáridos).

El checkpoint publicado corresponde a una inicialización aleatoria con semilla 0 y se describe como "converged". El entrenamiento utiliza el conjunto de datos `rlacombe/candycrunch-v2-benchmark`, que también sirve como benchmark de evaluación. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no disponibles). El tamaño del repositorio es de 6,5 GB, lo que sugiere que incluye artefactos adicionales más allá de los pesos del modelo de 50M.

## Capacidades

- Predicción de estructura de glicanos a partir de datos de espectrometría de masas.
- Generación de estructuras discretas mediante flujos (Discrete Flow Matching).
- Evaluación con múltiples muestras (K=32) para mejorar la precisión top-1 frente a una sola muestra (K=1).
- Modelado de estructuras ramificadas y combinatorias propias de los glicanos.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio ni tool calling.
- No se documentan capacidades multilingües ni de agentes.
- No se documenta un modo "thinking" ni razonamiento multi-paso de propósito general.

## Casos de uso

- Análisis de espectrometría de masas en glucómica: el modelo infiere la estructura del glicano a partir de los datos espectrales, sustituyendo parte de la interpretación manual experta en laboratorios de análisis.
- Anotación automatizada de bibliotecas de glicanos: permite procesar grandes volúmenes de espectros y asignar estructuras candidatas de forma sistemática, adecuado por su precisión top-1 reportada del 92,67 % con K=32.
- Investigación en glicobiología: sirve como herramienta de generación de hipótesis estructurales para experimentos posteriores, dado su carácter generativo sobre el espacio discreto de glicanos.
- Validación cruzada de pipelines existentes: al ser un modelo compacto de 50M parámetros con licencia MIT, puede integrarse como componente de referencia en flujos bioinformáticos ya establecidos.
- Reproducción de resultados académicos: el checkpoint con semilla fija (seed 0) y el benchmark público `candycrunch-v2-benchmark` permiten reproducir y comparar resultados de investigación.
- Desarrollo de métodos generativos discretos: sirve como implementación de referencia de Discrete Flow Matching + Crystallizing Flows para investigadores que trabajen en modelos de flujo sobre dominios discretos no lingüísticos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión estructural top-1 en test (K=32) | 92,67 % ± 0,05 % |
| Precisión estructural top-1 en test (K=1) | 90,19 % ± 0,04 % |
| Tamano del conjunto de test | 76.774 muestras |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otros modelos de predicción de glicanos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 50M parámetros en FP32 los pesos ocupan aproximadamente 200 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para el modelo; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna de gama media o superior, dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch nativo; los scripts de inferencia están en el repositorio de GitHub del proyecto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de predicción de estructura de glicanos ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo de dominio muy específico (glucómica y espectrometría de masas); no es un modelo de lenguaje general y no debe evaluarse con benchmarks de NLP.
- La model card no documenta sesgos conocidos; al trabajar sobre datos científicos, el riesgo principal es el sesgo de representación del dataset `candycrunch-v2-benchmark`.
- Riesgo de alucinación estructural: como modelo generativo, puede producir estructuras plausibles pero incorrectas; la precisión top-1 reportada no es del 100 %.
- No se documentan limitaciones de contexto o idioma porque el modelo no opera sobre texto.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento y del benchmark asociado.
- El checkpoint corresponde a una única semilla (seed 0); la variabilidad entre inicializaciones no se documenta.
- El repositorio ocupa 6,5 GB, muy por encima de lo esperable para 50M parámetros, por lo que puede contener artefactos adicionales que conviene inspeccionar antes de desplegar.
- No se documentan requisitos de preprocesado de espectros ni formato de entrada exacto en la model card; hay que consultar el repositorio de GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycogen-dfm-50m
- Repositorio de código e inferencia: https://github.com/rlacombe/GlycoGen
- Página del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
