# coarse-grained-forecasting-benchmark/forecasting-models

## Resumen

`coarse-grained-forecasting-benchmark/forecasting-models` es un repositorio de checkpoints entrenados que acompanan a un envio de investigacion anonimo sobre prediccion generativa condicional a partir de observaciones de grano grueso. No es un modelo de lenguaje ni un modelo fundacional de proposito general: es un conjunto de modelos generativos orientados a la prediccion probabilistica de sistemas fisicos (ecuaciones de Euler, quasi-geostrofia, ondas heterogeneas, ecuacion de Klein-Gordon no lineal y escalar pasivo).

El repositorio contiene, para cada uno de los cinco conjuntos de datos de referencia, tres familias de modelos: Direct SI (un unico paso generativo), Cascaded SI (una cascada de modelos con profundidad S configurable) y EDM (modelo de difusion con el formalismo de Karras et al.). Ademas, incluye barridos de profundidad para la variante Cascaded SI, con valores de S = 02, 05, 10, 20 y 40 segun el caso, lo que permite estudiar el compromiso entre coste computacional y calidad de la prediccion.

Es relevante ahora porque aborda un problema inverso mal condicionado y de alta dimensionalidad: reconstruir y predecir la evolucion de un campo fisico completo a partir de observaciones agregadas o de baja resolucion. La licencia CC BY 4.0 y el formato de checkpoints en PyTorch, junto con configuraciones de muestreo y sumas de verificacion, facilitan la reproducibilidad. El tamano total del repositorio es de 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos generativos condicionales; familia Direct SI, Cascaded SI y EDM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo para campos fisicos, no procesa lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt` con pesos del modelo y EMA, paso de entrenamiento y configuracion) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de las redes (tipo de backbone, numero de capas, dimensiones o mecanismo de atencion). Lo que si se especifica es la estructura metodologica: se comparan tres enfoques de prediccion probabilistica. Direct SI realiza la prediccion en un unico paso generativo. Cascaded SI descompone la generacion en una cascada de S etapas, con profundidades barridas entre S = 2 y S = 40 (y S = 1 para el caso del escalar pasivo, donde el modelo en cascada coincide con el directo). EDM emplea el marco de difusion de Karras et al. con su formulacion de precondicionamiento y muestreo.

Cada checkpoint incluye los pesos del modelo y los pesos EMA, el paso de entrenamiento y la configuracion del run. El muestreo se realiza con los pesos EMA. Los checkpoints contienen unicamente tensores y valores Python simples y se cargan con `torch.load(..., weights_only=True)`, lo que elimina el riesgo de ejecucion de codigo arbitrario al cargarlos. Cada modelo emplea la normalizacion de su conjunto de datos correspondiente (`data/normalization.npz`). No se especifican en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Prediccion probabilistica condicional de campos fisicos a partir de observaciones de grano grueso, generando muestras del posterior.
- Generacion de ensembles: el parametro `--n-samples` permite producir multiples realizaciones para estimar incertidumbre.
- Modelado de cinco sistemas fisicos distintos: `euler`, `sqg` (quasi-geostrofico), `het-waves` (ondas heterogeneas), `nonlinear-kg` (Klein-Gordon no lineal) y `passive-scalar` (escalar pasivo).
- Control explicito del compromiso coste-calidad mediante la profundidad de cascada S en la variante Cascaded SI.
- Comparacion metodologica integrada entre generacion directa, cascada y difusion EDM bajo un mismo protocolo de evaluacion.
- Ejecucion en CPU (`--device cpu`) segun el ejemplo de la model card, ademas de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step en el sentido de los LLM, vision, audio ni capacidades multilingues.

## Casos de uso

- Prediccion meteorologica y oceanografica a partir de observaciones dispersas: el modelo reconstruye campos completos condicionados a medidas de baja resolucion, util para asimilacion de datos en modelos de circulacion.
- Simulacion de turbulencia en fluidos: los checkpoints de `euler` y `sqg` permiten generar realizaciones plausibles de campos turbulentos condicionadas a observaciones agregadas, con incertidumbre cuantificable via multiples muestras.
- Estudio de propagacion de ondas en medios heterogeneos: el modelo `het-waves` sirve para inferir la evolucion de campos de onda cuando solo se dispone de sensores escasos.
- Dinamica no lineal de campos escalares: `nonlinear-kg` y `passive-scalar` cubren casos de ecuaciones de campo no lineales y transporte de escalares, utiles en fisica de plasmas o dinamica de fluidos geofisicos.
- Investigacion metodologica en generacion probabilistica: la comparacion Direct SI frente a Cascaded SI frente a EDM, con barridos de profundidad, permite evaluar el impacto del numero de etapas generativas en la calidad del posterior.
- Reproduccion de resultados academicos: el repositorio incluye `SHA256SUMS`, configuraciones de muestreo y un pipeline de reproduccion (`python -m reproduce.table2 generate ...`) que facilita replicar las tablas del articulo.
- Generacion de ensembles para analisis de incertidumbre en pipelines cientificos: con `--n-samples` se obtienen varias trayectorias para propagar incertidumbre en estudios de sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,7 GB, por lo que un unico checkpoint individual es sustancialmente menor y, en principio, cabe en GPU consumer, aunque no se especifica el tamano por modelo ni el pico de memoria durante el muestreo.
- GPU recomendadas: no disponible. La model card no indica requisitos de GPU.
- Compatibilidad con GPU consumer: probable por el tamano del repositorio, pero no confirmada en la documentacion.
- Despliegue: inferencia mediante el codigo de reproduccion del autor (`python -m reproduce.table2 generate`), con soporte de `--device cpu` y presumiblemente CUDA mediante PyTorch. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| forecasting-models (este repositorio) | no disponible | no aplica | no publicado | CC BY 4.0 | Hugging Face |
| Alternativas de prediccion probabilistica de campos fisicos | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion anonimo: la model card no identifica a los autores ni enlaza al articulo, lo que dificulta la verificacion independiente de los resultados.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no debe evaluarse con benchmarks de NLP.
- Especificidad de dominio: cada checkpoint esta entrenado para un unico sistema fisico y depende de la normalizacion de su dataset; no es transferible a otros dominios sin reentrenamiento.
- Ausencia de datos de rendimiento: no se publican metricas de error, calibracion ni comparaciones cuantitativas en la informacion disponible.
- Riesgo de extrapolacion: como todo modelo generativo condicional, puede producir muestras fisicamente inconsistentes fuera del regimen de entrenamiento.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero exige citar la fuente; el anonimato del envio complica la atribucion academica correcta.
- Sin garantias de produccion: no se documentan pruebas de robustez, latencia ni estabilidad numerica en despliegues reales.
- Dependencia del codigo de reproduccion: el uso practico requiere el repositorio de codigo asociado, que no se enlaza en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/coarse-grained-forecasting-benchmark/forecasting-models
- Datasets asociados: https://huggingface.co/coarse-grained-forecasting-benchmark/euler, https://huggingface.co/coarse-grained-forecasting-benchmark/sqg, https://huggingface.co/coarse-grained-forecasting-benchmark/het-waves, https://huggingface.co/coarse-grained-forecasting-benchmark/nonlinear-kg, https://huggingface.co/coarse-grained-forecasting-benchmark/passive-scalar
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
