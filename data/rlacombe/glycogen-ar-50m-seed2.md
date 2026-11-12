# rlacombe/glycogen-ar-50m-seed2

## Resumen

GlycoGen-AR (46,4 M, seed 2) es un checkpoint de PyTorch entrenado por Romain Lacombe (rlacombe) como parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026. No es un modelo de lenguaje generalista: es un transformer autoregresivo causal de arquitectura específica para predecir la estructura de glicanos a partir de datos de espectrometría de masas. El checkpoint corresponde a una inicialización aleatoria con semilla 2 y se publica como línea base de arquitectura emparejada frente al método principal del paper (flujos cristalizantes).

El modelo resuelve un problema concreto de glicómica computacional: dado un espectro de masas, inferir la estructura del glicano correspondiente. Alcanza una precisión estructural top-1 del 90,38 % ± 0,05 % en el conjunto de test (n = 76.774, beam=1, media de 3 semillas), lo que lo convierte en una referencia útil para comparar variantes de decodificación y objetivos de entrenamiento dentro del mismo espacio de representación.

Su relevancia es metodológica más que de producto: sirve como baseline reproducible (semilla fija, pesos publicados, benchmark público) para investigadores que trabajan en predicción de estructuras de glicanos, y permite validar pipelines de inferencia sin reentrenar. El repositorio pesa 2,8 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo causal (matched-architecture baseline) |
| Parametros totales | 46,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio: glicómica, no NLP) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "matched-architecture causal autoregressive Transformer baseline", es decir, un transformer causal con la misma arquitectura que la variante principal del paper, pero entrenado con un objetivo autoregresivo convencional en lugar de flujos cristalizantes (crystallizing flows). El checkpoint publicado corresponde a la semilla 2 y está descrito como convergido. No se detallan en la información disponible el número de capas, dimensiones de atención, número de cabezas ni la longitud máxima de secuencia.

El entrenamiento utiliza el conjunto de datos `rlacombe/candycrunch-v2-benchmark`, que también se publica como benchmark en Hugging Face. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación (poco probables en un modelo de dominio científico de este tamaño). La innovación técnica destacable del trabajo es el propio marco de "crystallizing flows", del cual este checkpoint es la línea base comparativa.

## Capacidades

- Predicción de estructura de glicanos a partir de espectros de masas (tarea principal).
- Generación autoregresiva de secuencias estructurales de glicanos token a token.
- Decodificación con beam search (los resultados reportados usan beam=1; el código de inferencia está disponible en el repositorio GitHub).
- Evaluación reproducible sobre el benchmark `candycrunch-v2-benchmark`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso general, visión, audio ni multilingüismo.

## Casos de uso

- Análisis de glicómica por espectrometría de masas: dado un espectro, el modelo genera la estructura del glicano candidata; adecuado porque está entrenado específicamente sobre el benchmark CandyCrunch v2 y reporta precisión estructural medida en ese dominio.
- Línea base para investigación en decodificación: al ser un transformer autoregresivo estándar con pesos publicados, permite comparar nuevas estrategias de decodificación (beam search, muestreo, restricciones gramaticales) contra un punto de referencia fijo.
- Reproducción de resultados del paper: el checkpoint con semilla fija 2 y el script de inferencia del repositorio permiten replicar la cifra de 90,38 % top-1 sin reentrenar.
- Validación de pipelines de preprocesado de espectros: sirve para comprobar que la tokenización y el formateo de entradas del benchmark producen predicciones coherentes antes de integrar modelos más grandes.
- Comparación de objetivos de entrenamiento: al ser la variante "matched-architecture" del método principal, se usa para aislar la contribución de los flujos cristalizantes frente a la autoregresión pura.
- Docencia y prototipado en glicómica computacional: modelo pequeño (46,4 M parámetros, 2,8 GB de repo) que se puede cargar en una GPU de consumo para experimentar con datos propios del dominio.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| candycrunch-v2-benchmark (test, n = 76.774) | Precisión estructural top-1, beam=1, media de 3 semillas | 90,38 % ± 0,05 % |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de NLP, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,4 M parámetros en fp32 los pesos ocupan aproximadamente 186 MB, por lo que la VRAM necesaria es Dominada por el runtime y el tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 4090, A100 o H100 es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, con margen amplio (incluso GPUs de gama baja con 4-8 GB).
- Opciones de despliegue: PyTorch nativo con los scripts de inferencia del repositorio `github.com/rlacombe/GlycoGen`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de predicción de estructuras de glicanos con los que comparar parámetros, contexto, rendimiento o licencia. El propio paper define este checkpoint como baseline frente a la variante principal de GlycoGen con flujos cristalizantes, pero no se aportan cifras de esa variante en la documentación disponible.

## Limitaciones y advertencias

- Modelo de dominio muy específico (glicómica y espectrometría de masas); no es utilizable para tareas de lenguaje natural, código o razonamiento general.
- No se documentan sesgos, pero al entrenarse sobre un único benchmark (`candycrunch-v2-benchmark`) puede no generalizar a distribuciones de espectros distintas de las del dataset.
- Riesgo de predicciones estructurales incorrectas: la precisión top-1 reportada es del 90,38 %, lo que implica aproximadamente un 9,6 % de fallos en el conjunto de test; en producción conviene validar con revisión experta o con puntuaciones de confianza.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre texto natural.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el paper de NeurIPS 2026 según el BibTeX de la model card.
- El repositorio incluye un único checkpoint (`best_model.pt`) de la semilla 2; para reproducir la media de 3 semillas hacen falta los otros checkpoints, que no se listan en la información disponible.
- No hay pipeline declarado en Hugging Face ni integración con frameworks de serving estándar, lo que añade trabajo de integración para despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycogen-ar-50m-seed2
- Repositorio de código e inferencia: https://github.com/rlacombe/GlycoGen
- Página del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
