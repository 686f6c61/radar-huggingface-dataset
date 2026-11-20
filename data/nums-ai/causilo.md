# nums-ai/causilo

## Resumen

Causilo es un modelo fundacional para datos tabulares desarrollado por Nums AI Inc., disenado para resolver tareas de clasificacion y regresion sobre conjuntos de datos estructurados. Se distribuye como dos checkpoints independientes (clasificador y regresor) en formato safetensors y se integra mediante una interfaz compatible con scikit-learn, lo que permite usarlo con `fit`/`predict`/`predict_proba` sin reentrenamiento especifico por tarea.

El modelo se publica bajo la licencia Causilo v1.0, que permite investigacion no comercial, pruebas y redistribucion academica, pero exige licencias separadas para uso comercial, produccion y servicios alojados o API. El repositorio ocupa 0.3 GB y acumula 1389 descargas y 23 likes en Hugging Face desde su publicacion en septiembre de 2026.

La relevancia actual de Causilo radica en el auge de los modelos fundacionales para datos tabulares, una categoria que busca replicar el paradigma de "preentrenar una vez y aplicar a muchas tablas" que ya funciona en texto e imagen. No se dispone de informacion publica sobre arquitectura, numero de parametros, longitud de contexto ni idiomas soportados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Causilo License v1.0 (pesos); Apache-2.0 (codigo Python y wheel) |
| Formato de pesos | safetensors |
| Pipeline | tabular-classification |
| Libreria | causilo |
| Tamano del repositorio | 0.3 GB |
| Requisitos de entorno | Python 3.10-3.12, PyTorch 2.13+ |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (tipo de transformer, mecanismos de atencion, uso de embeddings de columnas o esquemas de preentrenamiento tabular). La model card unicamente indica que se trata de un "tabular foundation model" preentrenado, con dos cabezas separadas: clasificacion y regresion, cada una con su propio `config.json` y `model.safetensors`.

Tampoco se detallan el volumen de datos de entrenamiento, la composicion del corpus tabular, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en modelos tabulares). El informe tecnico referenciado (arXiv:2609.22866) es la fuente primaria para obtener estos detalles, pero su contenido no esta incluido en la informacion proporcionada.

## Capacidades

- Clasificacion tabular: prediccion de etiquetas discretas mediante `CausiloClassifier` con `fit` y `predict`.
- Probabilidades por clase: `predict_proba` devuelve distribuciones de probabilidad sobre las clases.
- Regresion tabular: prediccion de variables continuas mediante `CausiloRegressor` con `fit` y `predict`.
- Interfaz compatible con scikit-learn: integracion directa en pipelines existentes de Python.
- Aprendizaje sin reentrenamiento por tarea: el checkpoint se descarga y cachea automaticamente en el primer `fit`.
- Soporte de datos estructurados con columnas heterogeneas (segun la definicion de "tabular foundation model").
- No se documentan capacidades de generacion de texto, codigo, vision, audio, tool calling ni agentes.

## Casos de uso

- Investigacion academica en aprendizaje tabular: uso del checkpoint para comparar frente a metodos clasicos (XGBoost, LightGBM, CatBoost) en benchmarks publicos, amparado por la licencia no comercial.
- Prototipado rapido de modelos predictivos: un cientifico de datos puede llamar a `fit` y `predict_proba` sobre un CSV y obtener una linea base sin ingenieria de caracteristicas manual.
- Evaluacion de modelos fundacionales tabulares: util para estudiar la transferibilidad entre dominios (finanzas, salud, marketing) sin reentrenamiento.
- Docencia y experimentacion: la interfaz scikit-learn facilita su uso en cursos de machine learning con datos estructurados.
- Pruebas de concepto internas: evaluacion de la calidad del modelo antes de solicitar una licencia comercial a Nums AI.
- Redistribucion en entornos de investigacion: la Seccion 3 de la licencia permite redistribuir copias originales y derivados con la licencia y avisos requeridos.
- Integracion en pipelines de evaluacion automatizada: al ser compatible con scikit-learn, puede insertarse en frameworks de validacion cruzada y comparacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la seccion de benchmarks del repositorio de GitHub (https://github.com/nums-ai/causilo#benchmarks) y al informe tecnico arXiv:2609.22866, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0.3 GB, lo que sugiere que el checkpoint es pequeno y probablemente quepa en GPUs de consumo, pero no se confirma el numero de parametros ni el consumo real.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del repositorio, aunque no esta confirmado.
- Opciones de despliegue: la libreria oficial `causilo` sobre PyTorch 2.13+ y Python 3.10-3.12. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (habituales en modelos de lenguaje, no en tabulares).
- Latencia y throughput: no disponibles.
- Requisitos de software: Python 3.10-3.12 y PyTorch 2.13 o superior.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La categoria de modelos fundacionales tabulares incluye propuestas como TabPFN, pero no se han facilitado datos de comparacion (parametros, contexto, rendimiento, licencia) para establecer una tabla rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial, de produccion, API o SaaS requiere una licencia separada de Nums AI Inc., incluso si es gratuito.
- La afiliacion institucional no determina por si sola el caracter no comercial de un uso, segun la propia licencia.
- La redistribucion solo esta permitida para copias originales y derivados en contexto de investigacion, con la licencia y avisos exigidos.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (concepto poco aplicable a tabulares, pero relevante en predicciones erroneas) ni limitaciones de contexto o idioma.
- No se documentan los dominios tabulares cubiertos por el preentrenamiento, lo que impide anticipar su comportamiento en tablas muy distintas.
- El modelo se distribuye como dos checkpoints (clasificador y regresor) sin garantias publicas de calibracion ni de robustez ante valores faltantes o categoricos.
- La version de PyTorch requerida (2.13+) es muy reciente y puede no estar disponible en todos los entornos de produccion.
- No se especifican los terminos exactos de la licencia Causilo v1.0 mas alla del resumen de la model card; el texto completo en el fichero `LICENSE` es el que prevalece.

## Enlaces

- Hugging Face: https://huggingface.co/nums-ai/causilo
- Repositorio de codigo: https://github.com/nums-ai/causilo
- Benchmarks: https://github.com/nums-ai/causilo#benchmarks
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.22866
- Licencia (fichero en el repo): LICENSE
- Contacto del licenciante: contact@nums.world
