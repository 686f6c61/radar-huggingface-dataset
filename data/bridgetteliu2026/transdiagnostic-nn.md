# BridgetteLiu2026/transdiagnostic-nn

## Resumen

`transdiagnostic-nn` es un repositorio de Hugging Face publicado por el usuario BridgetteLiu2026 que contiene tres clasificadores de conectividad funcional cerebral. No es un modelo de lenguaje ni un modelo generativo: cada carpeta (`abide/`, `cobre/`, `adhd200/`) alberga un clasificador binario independiente construido sobre una pipeline PCA seguida de un perceptron multicapa (MLP), entrenado con datos de resonancia magnetica funcional en reposo (rs-fMRI) procedentes de los consorcios ABIDE, COBRE y ADHD-200.

El objetivo declarado es la clasificacion transdiagnostica de trastornos psiquiatricos y del neurodesarrollo (trastorno del espectro autista, esquizofrenia y TDAH) frente a controles sanos, a partir de matrices de conectividad funcional extraidas con atlas concretos (CC200, BASC-122 y Harvard-Oxford 48). El autor califica explicitamente los artefactos como prototipos de investigacion y no como herramientas diagnosticas.

El interes tecnico del repositorio es limitado como modelo, pero relevante como ejemplo de publicacion reproducible de clasificadores neuroimagen: incluye checkpoints, exportacion sin pickle a safetensors, `config.json` e `inference.py`, y documenta de forma transparente resultados de validacion cruzada modestos o directamente por debajo del azar. El tamano del repositorio figura como 0.0 GB y no se declaran parametros totales ni contexto, al no tratarse de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA (reduccion de dimensionalidad) seguida de MLP (perceptron multicapa) |
| Parametros totales | no disponible (no se publica el recuento; depende de `n_components` y `hidden sizes` de cada `config.json`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan; los pesos se distribuyen en precision de entrenamiento) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | `cc-by-4.0` para COBRE; `other` para ABIDE y ADHD-200 (sujeto a sus terminos de uso de datos) |
| Formato de pesos | `nn_model.pt` (checkpoint PyTorch con pickle) y `model.safetensors` (copia sin pickle de scaler, PCA y MLP) |

## Arquitectura y entrenamiento

Cada clasificador es una pipeline en dos etapas: primero se estandarizan las caracteristicas de conectividad funcional y se proyectan mediante PCA a un numero reducido de componentes (`n_components` en `config.json`); despues un MLP con capas ocultas configurables produce una probabilidad de clase 1 y una etiqueta binaria segun un umbral. La entrada no es texto ni imagenes, sino vectores de conectividad derivados de rs-fMRI: 19.900 caracteristicas con el atlas CC200 para ABIDE, 7.381 con BASC-122 para COBRE y 1.128 con Harvard-Oxford 48 para ADHD-200.

Los conjuntos de entrenamiento son pequenos y muy dispares: 846 sujetos en ABIDE, 146 en COBRE y solo 40 en ADHD-200. No se documentan en la informacion disponible el numero de tokens (no aplica), la composicion detallada de los datasets, ni el uso de RLHF o DPO. La validacion es una validacion cruzada de 5 pliegues con exactitud media de 64,1% +/- 1,6% en ABIDE (mayoria 53,8%), 67,6% +/- 5,4% en COBRE (mayoria 50,7%) y 57,0% +/- 10,9% en ADHD-200 (mayoria 50,0%, por debajo del azar). El propio autor advierte que estas cifras son optimistas porque los hiperparametros se ajustaron en los mismos pliegues y no miden generalizacion entre sitios. En COBRE, una regresion logistica obtiene un rendimiento equivalente.

## Capacidades

- Clasificacion binaria de conectividad funcional: ASD frente a control (ABIDE), esquizofrenia frente a control (COBRE) y TDAH frente a control (ADHD-200).
- Inferencia sobre vectores de caracteristicas preextraidos mediante `inference.py`, que devuelve `(P(class 1), labels)`.
- Carga sin pickle mediante `model.safetensors` y `config.json`, con los pesos de escalado, PCA y MLP.
- Carga con pickle del checkpoint original `nn_model.pt` (requiere `weights_only=False`).
- Exportacion reproducible con `export_hf.py` a partir de los checkpoints de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No dispone de modo de pensamiento (thinking mode) ni de generacion de texto.

## Casos de uso

- Reproduccion de resultados academicos: cargar `model.safetensors` y `config.json` de la carpeta `cobre/` para replicar la exactitud de validacion cruzada publicada (67,6% +/- 5,4%) en el mismo atlas y pipeline.
- Docencia en neuroimagen y machine learning: usar la pipeline PCA + MLP como ejemplo minimo y auditable de clasificador sobre matrices de conectividad, con codigo de inferencia incluido.
- Linea base en estudios de clasificacion de trastornos: comparar nuevos modelos (grafos, GNN, deep learning sobre conectomas) contra estas exactitudes de referencia y contra la tasa de mayoria indicada.
- Analisis de sensibilidad a la eleccion de atlas: contrastar el rendimiento con CC200 (19.900 caracteristicas), BASC-122 (7.381) y Harvard-Oxford 48 (1.128) para estudiar el efecto de la parcellation.
- Auditoria de reproducibilidad: verificar el proceso de exportacion sin pickle (`export_hf.py`) y la coherencia entre `nn_model.pt` y `model.safetensors`.
- Estudio de calibracion y umbral: modificar el umbral declarado en `config.json` y analizar el compromiso entre sensibilidad y especificidad en cada cohorte.
- Prueba de concepto de despliegue de clasificadores neuroimagen en Hugging Face Hub: seguir el flujo de subida por carpeta con `huggingface-cli upload`.

## Benchmarks y rendimiento

| Modelo | Tarea | Caracteristicas | n entrenamiento | Exactitud CV 5 pliegues | Tasa de mayoria |
|---|---|---|---|---|---|
| abide | ASD vs control | 19.900 (CC200) | 846 | 64,1% +/- 1,6% | 53,8% |
| cobre | Esquizofrenia vs control | 7.381 (BASC-122) | 146 | 67,6% +/- 5,4% | 50,7% |
| adhd200 | TDAH vs control | 1.128 (Harvard-Oxford 48) | 40 | 57,0% +/- 10,9% | 50,0% |

No se han publicado resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, al no tratarse de un modelo de lenguaje. Las cifras anteriores son las unicas metricas documentadas y el autor las califica de optimistas y no representativas de generalizacion entre sitios.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los modelos son MLP pequenos sobre componentes PCA, por lo que caben en CPU y en cualquier GPU consumer con pocos cientos de MB disponibles.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente, e incluso la inferencia en CPU es viable para lotes pequenos.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1060, RTX 3060, RTX 4090), aunque no es necesario.
- Opciones de despliegue: script `inference.py` con `numpy`, `torch` y `safetensors`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles; no se publican mediciones. Por la naturaleza del modelo (PCA + MLP), la latencia esperada es del orden de milisegundos por muestra en CPU.
- Almacenamiento: repositorio de 0.0 GB segun Hugging Face, coherente con checkpoints de MLP de pocos megabytes.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | n entrenamiento | Exactitud CV | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| transdiagnostic-nn (abide) | PCA + MLP | 19.900 caracteristicas CC200 | 846 | 64,1% +/- 1,6% | other (terminos ABIDE) | Hugging Face |
| transdiagnostic-nn (cobre) | PCA + MLP | 7.381 caracteristicas BASC-122 | 146 | 67,6% +/- 5,4% | cc-by-4.0 | Hugging Face |
| transdiagnostic-nn (adhd200) | PCA + MLP | 1.128 caracteristicas Harvard-Oxford 48 | 40 | 57,0% +/- 10,9% | other (terminos ADHD-200) | Hugging Face |
| Regresion logistica (referencia del autor en COBRE) | Modelo lineal | 7.381 caracteristicas BASC-122 | 146 | equivalente al MLP segun el autor | no aplica | no publicada |

No se dispone en la informacion proporcionada de otros modelos comparables publicados con los que contrastar parametros, contexto o rendimiento. No disponible.

## Limitaciones y advertencias

- Los artefactos son prototipos de investigacion y no herramientas diagnosticas; no deben usarse en decision clinica.
- El modelo de ADHD-200 no supera el azar (57,0% +/- 10,9% frente a una mayoria del 50,0%) y el autor indica que es inutilizable, publicado solo por reproducibilidad.
- Las exactitudes de validacion cruzada son optimistas: los hiperparametros se ajustaron en los mismos pliegues y no se evaluo la generalizacion entre sitios.
- En COBRE, una regresion logistica rinde igual que el MLP, lo que sugiere que la no linealidad no aporta senal adicional.
- Las caracteristicas deben proceder exactamente del atlas y pipeline indicados; otros atlas no funcionan.
- `nn_model.pt` es un pickle y requiere `weights_only=False`, lo que implica riesgo de ejecucion de codigo al cargarlo; se recomienda usar `model.safetensors`.
- Aunque no se incluyen datos a nivel de sujeto, los parametros de escalado y PCA son estadisticas de los sujetos de entrenamiento y pueden filtrar informacion de la cohorte.
- Licencias heterogeneas: `cc-by-4.0` solo para COBRE; ABIDE y ADHD-200 quedan sujetos a sus terminos de uso de datos, que deben revisarse antes de cualquier publicacion o uso derivado.
- No se documentan sesgos demograficos, de sitio ni de composicion de cohorte en la informacion disponible, lo que impide evaluar su impacto.
- Riesgo de alucinacion no aplica (no genera texto), pero si existe riesgo de sobreinterpretacion de probabilidades mal calibradas en entornos no controlados.
- Sin pipeline declarado en Hugging Face, sin idiomas y sin descargas ni likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BridgetteLiu2026/transdiagnostic-nn
- ABIDE (Di Martino et al., 2014; INDI / Preprocessed Connectomes Project): no se proporciona URL directa en la informacion disponible
- COBRE (Abraham et al., 2017), Figshare DOI: https://doi.org/10.6084/m9.figshare.1450804
- ADHD-200 consortium / INDI: no se proporciona URL directa en la informacion disponible
