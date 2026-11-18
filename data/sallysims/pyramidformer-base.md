# SallySims/pyramidformer-base

## Resumen

PyramidFormer base es un encoder transformer de pequeno tamano (823.810 parametros) desarrollado por el usuario SallySims y publicado en Hugging Face bajo licencia MIT. Su dominio de aplicacion no es el procesamiento de lenguaje natural, sino la demografia: opera sobre las 101 edades simples (0 a 100+) de una piramide de poblacion, tratando cada edad como un token. El modelo se preentrena ocultando un 30 % de las edades o un tramo continuo de entre 5 y 20 anos, y reconstruyendo los valores a partir del contexto restante, lo que le obliga a aprender la estructura interna y las regularidades de las piramides poblacionales.

La relevancia del modelo es metodologica: no compite con los grandes modelos de lenguaje, sino que actua como backbone de representacion para tareas demograficas especificas. Sobre esta base se afinan tres cabezas publicadas por separado: un modelo de similitud entre piramides, un detector de *heaping* (agrupamiento anomalo de edades, tipico de censos con mala declaracion) y un modelo de prediccion. El interes practico esta en que permite obtener representaciones densas de una piramide completa y reutilizarlas en tareas de analisis, control de calidad de datos o proyeccion a corto plazo.

El modelo se entreno sobre las estimaciones de Naciones Unidas (World Population Prospects 2024) para el periodo 1950-2023, con particion por pais (80 % entrenamiento, 10 % validacion, 10 % prueba), de modo que las metricas reportadas corresponden a paises nunca vistos durante el entrenamiento. Es un prototipo de investigacion, no una herramienta para estadistica oficial. La arquitectura es personalizada, por lo que no dispone de widget de inferencia alojado y requiere cargar el codigo incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder sobre 101 tokens de edad simple (arquitectura personalizada, `pyramidformer.py`) |
| Parametros totales | 823.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 101 tokens (una edad simple por token, 0 a 100+) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la entrada es numerica) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + codigo Python |

## Arquitectura y entrenamiento

PyramidFormer es un encoder transformer adaptado a un dominio tabular-numerico: cada una de las 101 edades simples de una piramide (por sexo) se trata como un token, y el modelo aprende representaciones contextuales de la piramide completa. El preentrenamiento es de tipo auto-supervisado por enmascaramiento: se oculta el 30 % de las edades o un tramo continuo de 5 a 20 anos, y el modelo debe reconstruir los valores ocultos. La perdida reportada es MSE sobre edades enmascaradas en unidades de log-cuota estandarizadas, con un valor de 0,0098 tras 2000 pasos de optimizacion en el conjunto de prueba.

El entrenamiento se realizo sobre las estimaciones de World Population Prospects 2024 (Naciones Unidas, DESA, Division de Poblacion) para poblacion por edad simple y sexo, paises y areas, 1950-2023, tal como se procesan en el dataset `SallySims/wpp2024-single-age-pyramids`. La particion es por pais (80/10/10), lo que garantiza que las metricas de validacion y prueba corresponden a paises no vistos. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un modelo de representacion sin generacion de lenguaje. Tampoco se detalla el numero total de tokens de entrenamiento ni la composicion exacta del corpus mas alla de la fuente WPP.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de piramides de poblacion completas: genera representaciones densas de las 101 edades simples.
- Reconstruccion de edades ocultas o tramos de edad ausentes en una piramide, util para imputacion controlada.
- Modelado de la estructura interna de la piramide: dependencias entre cohortes, efectos de heaping y forma general de la distribucion por edad.
- Punto de partida para fine-tuning: el propio autor publica modelos de similitud, deteccion de heaping y prediccion afinados desde este backbone.
- Procesamiento por sexo: los datos de origen distinguen poblacion por sexo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision ni de audio.

## Casos de uso

- Control de calidad de censos y registros: el detector de heaping afinado sobre este backbone permite identificar agrupamientos anomalos de edades (por ejemplo, acumulacion en edades terminadas en 0 o 5), senal clasica de mala declaracion de edad en encuestas.
- Imputacion de edades faltantes en piramides incompletas: el preentrenamiento por enmascaramiento entrena al modelo precisamente para reconstruir edades ocultas a partir del contexto, por lo que puede aplicarse a series con huecos.
- Analisis de similitud entre paises o regiones: las representaciones del encoder permiten comparar la forma de piramides de distintos paises y periodos, util en estudios comparativos de transicion demografica.
- Proyeccion a corto plazo de estructura por edad: el modelo de prediccion afinado desde esta base sirve como componente en pipelines de proyeccion exploratoria, siempre con validacion contra metodos oficiales.
- Investigacion academica en demografia computacional: base ligera y reproducible para experimentar con representaciones aprendidas de piramides sin depender de infraestructura pesada.
- Integracion en pipelines de datos de salud global: al ser un modelo de 0,8 M de parametros y formato safetensors, puede ejecutarse en CPU dentro de procesos de validacion de datos de poblacion.
- Prototipado de features para modelos posteriores: las representaciones pueden alimentar clasificadores o regresores aguas abajo en lugar de usar la piramide cruda.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| MSE en edades enmascaradas (unidades de log-cuota estandarizadas) | 0,0098 | Test, paises no vistos, tras 2000 pasos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este dominio. Tampoco se reportan comparaciones con lineas base demograficas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (823.810 parametros en FP32 suponen unos 3,3 MB de pesos; el resto del consumo es overhead de runtime).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo cabe en CPU sin problema. Una RTX 4090, A100 o H100 no aportan ventaja practica frente a CPU para inferencia por lotes pequenos.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: carga directa con PyTorch mediante el codigo `pyramidformer.py` incluido en el repositorio y `snapshot_download` de `huggingface_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al tratarse de una arquitectura personalizada sin integracion en esos runtimes.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos en CPU para una piramide individual, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada modelos comparables de representacion de piramides de poblacion con arquitectura transformer y licencia abierta. Las alternativas metodologicas habituales en demografia (modelos de Lee-Carter, splines de mortalidad, metodos de Naciones Unidas) no son modelos neuronales y no admiten una comparacion directa de parametros, contexto o licencia.

## Limitaciones y advertencias

- Prototipo de investigacion: el propio autor indica explicitamente que no debe usarse para estadistica oficial.
- Los datos de entrenamiento son estimaciones modeladas de WPP 2024, no recuentos censales brutos, por lo que el modelo hereda los sesgos y suavizados de esas estimaciones.
- Entrenamiento corto: 2000 pasos de optimizacion, segun la model card; el modelo puede estar infraentrenado para tareas exigentes.
- Dominio muy restringido: solo opera sobre piramides de edad simple; no procesa texto, imagenes ni audio, y no debe esperarse de el ninguna capacidad de lenguaje.
- Sin cuantizaciones publicadas ni integracion en runtimes estandar, lo que limita su despliegue fuera de PyTorch.
- La licencia del modelo es MIT, pero los datos de origen son de Naciones Unidas y el autor advierte de que debe revisarse sus terminos de uso antes de reutilizarlos; esto puede afectar a usos comerciales derivados del entrenamiento.
- Sin informacion sobre sesgos demograficos especificos mas alla de la particion por pais; no se documentan evaluaciones de equidad entre regiones.
- Riesgo de extrapolacion: al entrenarse con datos 1950-2023, su comportamiento fuera de ese rango temporal o en poblaciones con estructuras atipicas no esta validado.
- No hay widget de inferencia alojado ni ejemplos de evaluacion independiente; las unicas metricas son las del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SallySims/pyramidformer-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SallySims/wpp2024-single-age-pyramids
- World Population Prospects 2024 (Naciones Unidas): https://population.un.org/wpp/
- Repositorios de los modelos afinados (similitud, detector de heaping, prediccion): publicados como repos separados por el mismo autor en Hugging Face; no se proporcionan URLs concretas en la informacion disponible.
