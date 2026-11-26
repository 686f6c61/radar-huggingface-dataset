# DaneshSelwal/Regression-UQ-Benchmark

## Resumen

Regression-UQ-Benchmark (publicado en Hugging Face bajo el identificador `DaneshSelwal/Regression-UQ-Benchmark`) no es un modelo de lenguaje, sino un repositorio de benchmark reproducible centrado en la cuantificación de incertidumbre (UQ) para regresión tabular. Lo desarrolla DaneshSelwal y su objetivo es comparar, bajo un protocolo común, más de treinta métodos de UQ aplicados a diez regresores ajustados sobre nueve conjuntos de datos de ingeniería y medio ambiente. El problema que aborda es concreto: un regresor devuelve una predicción puntual sin indicar cuánto se puede confiar en ella, y en contextos de ingeniería y regulación resulta más útil un intervalo de predicción con cobertura conocida.

El repositorio se publica con la versión v2.0.0 (antes llamado `Regression_Uncertainty_Quantification_Analysis`) y está pensado para ejecutarse en CPU sobre Kaggle. Cada intervalo de predicción al 90 % se evalúa en datos de test respecto a dos criterios: validez (cobertura dentro de la tolerancia de muestreo del 90 %) y agudeza (anchura del intervalo). Todos los resultados reportados proceden de notebooks ejecutados y almacenados en el propio repositorio, con registro del identificador de ejecución en Kaggle.

Es relevante ahora porque las comparativas publicadas de métodos UQ suelen emplear colecciones de benchmark grandes, mientras que los conjuntos de ingeniería y medio ambiente son pequeños (decenas o pocos cientos de puntos de test), heterogéneos y con colas pesadas. Este repositorio cubre ese hueco con un protocolo sin fuga de test y evaluación sensible al tamaño muestral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: benchmark de metodos de cuantificacion de incertidumbre sobre regresores tabulares (no es un modelo neuronal unico) |
| Parametros totales | No disponible (no es un modelo con pesos publicados) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (documentacion en ingles) |
| Licencia | MIT (segun badge de la model card); la licencia del campo de Hugging Face figura como no disponible |
| Formato de pesos | No disponible; el repositorio contiene notebooks, artefactos `best_params.pkl` y salidas en Excel |
| Tamano del repositorio | 0,9 GB |
| Version | v2.0.0 |
| Conjuntos de datos | 9 datasets de ingenieria y medio ambiente |
| Regresores base | 10 regresores ajustados (la cabecera indica 10; el texto menciona 9 en un punto) |
| Metodos UQ | Mas de 30, en cinco familias |
| Cobertura nominal | 90 % (alpha = 0,1) para todos los metodos salvo HCM, que reporta intervalos gaussianos 1/2/3 sigma |
| Entorno de ejecucion | Kaggle CPU, Python 3 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red concreta, sino un pipeline de ocho notebooks. El notebook 1 realiza el ajuste de hiperparametros mediante validacion cruzada de 5 folds con Optuna y genera `best_params.pkl`, que cargan los notebooks posteriores. Los notebooks 2 a 8 son independientes entre si y cubren: regresion por cuantiles (NB2), distribuciones predictivas parametricas y generativas (NB3), CARD con difusion (NB4), conformal con MAPIE y PUNCC (NB5), y conformal con NexCP, online, MFCS y COP (NB6), ademas de los stages restantes del pipeline.

El diseno evita la fuga de informacion del conjunto de test: los hiperparametros se seleccionan exclusivamente con validacion cruzada sobre el train y el test se usa una sola vez para evaluar. La validacion de cobertura se juzga con un test binomial unilateral, de modo que los conjuntos de test pequenos no se penalizan por variacion muestral. Las implementaciones se verificaron contra la publicacion original y, cuando existia, contra el codigo de referencia de los autores; cada correccion se marca en el codigo con `# FIX <id>` y se documenta en `docs/CHANGELOG_FIXES.md`. El alcance es regresion tabular de salida unica con una particion fija train/test por dataset.

## Capacidades

- Comparacion reproducible de mas de treinta metodos de UQ en cinco familias: regresion por cuantiles, distribuciones predictivas parametricas y generativas, conformal split/CV/bootstrap, conformal ponderado y online, politicas de cobertura aprendidas (ACP) e incertidumbre de red unica (HCM).
- Evaluacion de cada intervalo al 90 % en datos held-out con dos metricas: validez (cobertura frente a la tolerancia binomial) y agudeza (anchura).
- Envoltorio de los metodos UQ alrededor de hasta diez regresores base ajustados.
- Portabilidad: un notebook generalizado por etapa; anadir un dataset nuevo requiere solo cuatro ajustes (nombre de carpeta, nombres de fichero, nombres de features y etiqueta del target).
- Trazabilidad completa: cada notebook ejecutado, sus salidas en Excel y el identificador de ejecucion en Kaggle se almacenan con los resultados.
- Ejecucion en CPU (Kaggle), sin requisito de GPU.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Seleccion de metodo UQ en proyectos de ingenieria civil o estructural: permite comparar, sobre los propios datos del proyecto, que metodo conformal o de distribucion predictiva ofrece intervalos validos y mas estrechos antes de fijar margenes de diseno.
- Prediccion ambiental con decisiones regulatorias: el benchmark evalua cobertura al 90 % con test binomial, lo que ayuda a justificar ante un regulador que los intervalos reportados tienen la cobertura nominal declarada.
- Validacion de un regresor ya en produccion: se puede reutilizar el pipeline para comprobar si los intervalos actuales mantienen cobertura en datos held-out y detectar metodos que sobreajustan la cobertura.
- Investigacion metodologica en UQ: las preguntas de investigacion RQ1-RQ4 y la comparacion entre metodos model-based, conformal, ACP y HCM sirven como punto de partida para estudiar que familia conviene segun el regimen de tamano muestral.
- Docencia y formacion: los notebooks ejecutados y sus salidas en Excel permiten reproducir paso a paso la diferencia entre garantias de cobertura finitas (conformal) y garantias condicionadas al modelo correcto (cuantiles y distribuciones predictivas).
- Extension a nuevos dominios tabulares: con solo cuatro ajustes de configuracion se puede aplicar el mismo protocolo de evaluacion a un dataset propio de otro sector (energia, materiales, agronomia) y comparar con los resultados publicados.
- Auditoria de pipelines de ML: el registro de ejecuciones en Kaggle y el changelog de correcciones facilitan revisar la procedencia de cada numero reportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe el protocolo (cobertura y anchura de intervalos al 90 %, test binomial unilateral, particion fija train/test) y las preguntas de investigacion, pero no incluye tablas con valores de cobertura o anchura por metodo, regresor y dataset.

## Requisitos de hardware

- Inferencia en GPU: no aplica; el benchmark se ejecuta en CPU.
- Entorno de referencia: Kaggle CPU con Python 3, segun los badges de la model card.
- Memoria y almacenamiento: el repositorio ocupa 0,9 GB; los requisitos de RAM dependen del dataset y del regresor, y no se detallan en la informacion disponible.
- Despliegue: ejecucion de notebooks (Jupyter) y scripts Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Regression-UQ-Benchmark | MAPIE | PUNCC |
|---|---|---|---|
| Tipo | Benchmark reproducible de >30 metodos UQ | Libreria de prediccion conformal | Libreria de prediccion conformal |
| Cobertura de metodos | Regresion por cuantiles, distribuciones predictivas, CARD, conformal split/CV/bootstrap, ponderado y online, ACP, HCM | Conformal y quantile regression | Conformal y metodos de calibracion |
| Regresores base | Hasta 10 regresores ajustados | Depende del usuario | Depende del usuario |
| Datasets incluidos | 9 de ingenieria y medio ambiente | No incluye datasets | No incluye datasets |
| Licencia | MIT (segun badge) | No disponible en la informacion | No disponible en la informacion |
| Ejecucion en CPU | Si (Kaggle CPU) | Si | Si |

La comparativa se limita a las dos librerias que el propio repositorio emplea como dependencias (MAPIE y PUNCC); no se dispone de datos de rendimiento comparables entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no debe evaluarse con criterios de LLM (contexto, parametros, cuantizacion, benchmarks tipo MMLU o HumanEval).
- Alcance restringido a regresion tabular de salida unica con particion fija train/test; no cubre series temporales, salidas multiples ni datos no tabulares.
- Los conjuntos de test son pequenos (decenas a pocos cientos de puntos), lo que limita la potencia estadistica de las comparaciones pese al test binomial.
- La cobertura nominal es fija al 90 % (alpha = 0,1); HCM usa intervalos gaussianos 1/2/3 sigma y no es directamente comparable con el resto en terminos de cobertura.
- Los metodos model-based (cuantiles y distribuciones predictivas) solo garantizan cobertura si el modelo ajustado es correcto; los conformales asumen intercambiabilidad, que los metodos online y ponderados relajan.
- La licencia figura como MIT en el badge de la model card, pero el campo de licencia de Hugging Face aparece como no disponible; conviene verificar el fichero LICENSE antes de uso comercial.
- El repositorio mezcla en su texto "nueve" y "diez" regresores base; la cabecera indica 10 y el abstract 10, pero un pasaje menciona 9.
- No se publican resultados numericos de cobertura ni anchura en la informacion disponible, por lo que no es posible validar las conclusiones del benchmark sin ejecutar los notebooks.
- Riesgo de sesgo y alucinacion: no aplica en el sentido de un LLM; el riesgo equivalente es la seleccion sesgada de datasets o metodos, que el autor mitiga con el registro de ejecuciones y el changelog de correcciones.

## Enlaces

- Hugging Face: https://huggingface.co/DaneshSelwal/Regression-UQ-Benchmark
- Repositorio GitHub: https://github.com/DaneshSelwal/Regression-UQ-Benchmark
- Release v2.0.0: https://github.com/DaneshSelwal/Regression-UQ-Benchmark/releases
- Changelog de correcciones: docs/CHANGELOG_FIXES.md (dentro del repositorio GitHub)
- Fichero de citacion: CITATION.cff (dentro del repositorio GitHub)
- MAPIE (dependencia): no disponible en la informacion proporcionada
- PUNCC (dependencia): no disponible en la informacion proporcionada
