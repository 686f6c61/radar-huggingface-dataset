# rlacombe/glycogen-dfm-50m-seed2

## Resumen

GlycoGen-DFM (50M, seed 2) es un checkpoint de PyTorch entrenado por Romain Lacombe (usuario `rlacombe` en Hugging Face) para la predicción de estructuras de glicanos, presentado en el artículo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows" (NeurIPS 2026). El modelo aborda un problema específico de glicómica computacional: inferir la estructura de un glicano a partir de datos de espectrometría de masas, una tarea tradicionalmente resuelta mediante búsqueda en bases de datos o reglas heurísticas y que aquí se formula como un problema de generación discreta condicionada.

La arquitectura combina Discrete Flow Matching con la técnica de Crystallizing Flows, un enfoque generativo para espacios discretos que modela transiciones entre estados estructurales de forma iterativa. Con 50 millones de parámetros, se trata de un modelo compacto y especializado, no un modelo de lenguaje general: no procesa texto libre ni mantiene conversaciones, sino que genera estructuras de glicanos (secuencias de monosacáridos con enlaces y ramificaciones) condicionadas a espectros de masas.

El checkpoint corresponde a la semilla de inicialización aleatoria 2 de un conjunto de tres semillas, y el autor reporta una precisión estructural top-1 en el conjunto de test de 92,67% ± 0,05% (media de 3 semillas, K=32) sobre n = 76.774 muestras. Es relevante para investigadores en glicómica y proteómica que necesiten anotar estructuras de glicanos a escala, y sirve como referencia reproducible de un método generativo discreto aplicado a un dominio científico acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Discrete Flow Matching + Crystallizing Flows (generativa en espacio discreto) |
| Parametros totales | 50M (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

El modelo implementa Discrete Flow Matching, un marco de modelos generativos para datos discretos que aprende un campo de velocidad o flujo entre una distribucion base y la distribucion objetivo mediante procesos de interpolacion discreta. Sobre esta base, la contribucion del articulo es Crystallizing Flows, una variante que, segun la nomenclatura del autor, estructura el proceso de generacion de manera que las predicciones se "cristalizan" progresivamente hacia una estructura de glicano valida. El checkpoint tiene 50M de parametros y se distribuye como un unico fichero `best_model.pt` de PyTorch (repo de 4,3 GB, presumiblemente por artefactos adicionales o estados de optimizador).

El entrenamiento se realizo sobre el benchmark `rlacombe/candycrunch-v2-benchmark`, un conjunto de datos de glicanos y espectros de masas publicado por el mismo autor. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (poco probables en un modelo de este tipo). El resultado reportado en la model card es una precision estructural top-1 de 92,67% ± 0,05% en test (n = 76.774, K=32, media de 3 semillas), lo que sugiere un proceso de evaluacion con multiples muestras por entrada (K=32) y robustez entre semillas.

## Capacidades

- Prediccion de estructura de glicanos: dado un espectro de masas (u otra representacion de entrada del dominio), genera la estructura del glicano correspondiente (composicion de monosacaridos, enlaces y ramificaciones).
- Generacion en espacio discreto: el modelo produce secuencias discretas, no texto ni imagenes, mediante un proceso iterativo de flow matching.
- Evaluacion probabilistica: el parametro K=32 en la evaluacion indica que puede generar multiples muestras por entrada, lo que permite estimar confianza o explorar estructuras alternativas.
- Reproducibilidad por semillas: se publican checkpoints para distintas semillas de inicializacion (este es la semilla 2), lo que facilita analisis de varianza.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general, vision, audio ni capacidades multilingues: es un modelo de dominio especifico de glicomica.
- No dispone de modo "thinking" ni de interfaz conversacional.

## Casos de uso

- Anotacion de glicanos en pipelines de espectrometria de masas: el modelo puede integrarse como paso de inferencia tras la adquisicion de espectros para proponer estructuras candidatas, sustituyendo o complementando la busqueda en bases de datos espectrales.
- Glicoproteomica a escala: en estudios con miles de glicopéptidos, el modelo permite asignar estructuras de forma automatizada y con una precision reportada superior al 92% top-1, reduciendo la revision manual.
- Descubrimiento de glicanos no catalogados: al ser un modelo generativo, puede proponer estructuras que no estan en las bases de datos de referencia, util en estudios de glicanos raros o modificados.
- Control de calidad en bioprocesos: la caracterizacion de glicosilacion de anticuerpos monoclonales y otras proteinas terapeuticas requiere anotar perfiles de glicanos; el modelo puede acelerar ese analisis en laboratorios farmaceuticos.
- Investigacion en biologia estructural y funcional: la asignacion fiable de estructuras de glicanos facilita estudios de relacion estructura-funcion en glucobiologia.
- Reproduccion y comparacion metodologica: al publicarse codigo, datos y checkpoints por semilla, sirve como linea base reproducible para investigar metodos generativos discretos en dominios cientificos.
- Docencia y prototipado en glicomica computacional: su tamano de 50M permite ejecutarlo en hardware modesto para experimentos academicos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| candycrunch-v2-benchmark (test, n = 76.774) | Precision estructural top-1 | 92,67% ± 0,05% (K=32, media de 3 semillas) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este dominio), ni tablas de comparacion frente a metodos alternativos de prediccion de glicanos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 50M de parametros, en precision FP32 el peso ronda los 200 MB, y en FP16 unos 100 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la practica; una RTX 3060, RTX 4090, A100 o H100 funcionarian sin problema, aunque el cuello de botella sera el preprocesado de espectros, no el modelo.
- Cabe en GPU consumer: si, practicamente en todas las GPU dedicadas de los ultimos anos e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un checkpoint PyTorch (`best_model.pt`) con codigo en GitHub, el despliegue se realiza mediante los scripts de inferencia del repositorio del autor; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de prediccion de estructuras de glicanos ni con metodos alternativos (busqueda en bases de datos, enfoques de aprendizaje profundo previos). El unico punto de referencia interno es la comparacion entre semillas del propio modelo (media de 3 semillas con ±0,05% de variacion).

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un modelo de lenguaje ni un modelo multimodal general; solo es aplicable a la prediccion de estructuras de glicanos a partir de datos de espectrometria de masas.
- Dependencia del benchmark y del preprocesado: el rendimiento del 92,67% top-1 esta medido sobre `candycrunch-v2-benchmark`; su comportamiento en otros instrumentos, protocolos de fragmentacion o tipos de muestra no esta documentado en la informacion disponible.
- Riesgo de estructuras incorrectas: como todo modelo generativo, puede producir estructuras plausibles pero erroneas; en aplicaciones criticas (p. ej., caracterizacion de biofarmacos) se recomienda validacion ortogonal.
- Sesgos de datos: no se detalla la composicion del dataset de entrenamiento, por lo que se desconoce si esta balanceado por clases de glicanos, especies o tipos de enlace; esto puede introducir sesgos hacia estructuras frecuentes.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, conviene revisar las licencias de los datos de benchmark asociados, que pueden tener terminos distintos.
- Reproducibilidad: el resultado reportado es una media de 3 semillas; este checkpoint concreto (semilla 2) puede desviarse ligeramente de la media.
- Sin soporte documentado de cuantizacion ni de formatos de despliegue estandar (GGUF, ONNX), lo que limita su integracion en stacks de inferencia habituales sin trabajo adicional.
- Ausencia de informacion sobre limites de contexto de entrada, numero maximo de monosacaridos modelables o resolucion espectral soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycogen-dfm-50m-seed2
- Repositorio de codigo e inferencia: https://github.com/rlacombe/GlycoGen
- Pagina del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
- Articulo: Lacombe, R. "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", NeurIPS 2026 (referencia bibliografica en la model card; enlace directo al paper no disponible en la informacion proporcionada).
