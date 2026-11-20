# ecmwf/aifs-single-2.0

## Resumen

AIFS Single v2 es el sistema de predicción meteorológica de medio plazo basado en aprendizaje automático desarrollado por el ECMWF (Centro Europeo de Predicciones Meteorológicas a Plazo Medio). Sustituye a la versión 1.1 y está en explotación operativa desde el 12 de mayo de 2026, generando una predicción global única cada seis horas con horizonte de 15 días, cuatro veces al día. El modelo combina un codificador y decodificador basados en redes neuronales sobre grafos (GNN) con un procesador de tipo transformer de ventana deslizante, y se distribuye a través del framework Anemoi, co-desarrollado por el ECMWF y servicios meteorológicos nacionales europeos.

La versión v2 introduce novedades relevantes respecto a v1.1: un nuevo componente de olas con 11 variables (las primeras predicciones operativas de olas basadas en datos del ECMWF), una variable adicional de nieve en el componente terrestre, la reclasificación de la velocidad vertical W de campo pronóstico a diagnóstico, la incorporación de niveles de presión a 10 hPa para mejorar la representación de la estratosfera, y un régimen de entrenamiento mejorado con dos años adicionales de datos de ajuste fino. La resolución horizontal se mantiene en aproximadamente 31 km con 14 niveles verticales, mientras que la resolución vertical se amplía a 14 niveles de presión (10, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 850, 925 y 1000 hPa).

El interés del modelo radica en que representa un paso más en la sustitución de la predicción numérica clásica por modelos puramente aprendidos, con pesos publicados bajo licencia CC BY 4.0 y un cuaderno de demostración bajo Apache 2.0, lo que permite a investigadores y servicios meteorológicos reproducir y adaptar el sistema. El repositorio ocupa aproximadamente 0,5 GB y acumula 1217 descargas y 22 «me gusta» en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador GNN con procesador transformer de ventana deslizante |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: predicción meteorológica, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos); el modelo procesa variables físicas, no texto |
| Licencia | CC BY 4.0 (pesos); Apache 2.0 (cuaderno y scripts) |
| Formato de pesos | checkpoint propietario cargado por anemoi-inference; no disponible el formato exacto (no safetensors/GGUF declarado) |

## Arquitectura y entrenamiento

AIFS Single v2 sigue un diseño modular codificador-procesador-decodificador. El codificador y el decodificador son redes neuronales sobre grafos que transforman el estado atmosférico en una representación latente sobre una malla de grafo; el procesador es un transformer de ventana deslizante que opera sobre esa representación. El diseño admite varios niveles de paralelismo para entrenar con datos de entrada de alta resolución. La resolución horizontal es de aproximadamente 31 km y la vertical de 14 niveles, con los niveles de presión 10, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 850, 925 y 1000 hPa (el nivel de 10 hPa es nuevo en v2).

El preentrenamiento se realizó sobre datos ERA5 de los años 1979 a 2022 durante 260 000 pasos de entrenamiento, igual que en v1.1. El ajuste fino se actualizó con dos años adicionales de datos respecto a v1.1. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset más allá de ERA5, ni si se emplearon RLHF o DPO (técnicas propias de modelos de lenguaje, no aplicables aquí). La innovación técnica destacable de v2 es la incorporación del componente de olas (11 variables), la nueva variable de nieve, el cambio de W a campo diagnóstico y la mejora de la estratosfera mediante el nivel de 10 hPa.

## Capacidades

- Predicción meteorológica global de medio plazo con horizonte de 15 días y paso temporal de 6 horas.
- Predicción operativa cuatro veces al día (00, 06, 12 y 18 UTC) por parte del ECMWF.
- Predicción del componente atmosférico con 14 niveles de presión, incluido el nivel estratosférico de 10 hPa.
- Predicción del componente terrestre, ahora con una variable adicional de nieve.
- Predicción de olas con 11 variables (primera predicción operativa de olas basada en datos del ECMWF).
- Generación de campos de velocidad vertical tratados como variable diagnóstica.
- Inferencia reproducible mediante el framework Anemoi y su herramienta anemoi-inference, con interfaz de línea de comandos e integración en cuadernos.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural ni capacidades multimodales de texto, visión o audio: es un modelo específico de predicción meteorológica.

## Casos de uso

- Predicción operativa de medio plazo: el ECMWF ejecuta el modelo cuatro veces al día para generar una predicción global de 15 días, sustituyendo o complementando la predicción numérica clásica en la cadena operativa.
- Predicción marina y de olas: el nuevo componente de olas con 11 variables permite generar predicciones de estado del mar a 15 días, útiles para navegación, puertos e industria offshore, algo que v1.1 no ofrecía.
- Predicción de nieve y cobertura terrestre: la variable adicional de nieve en el componente terrestre sirve para aplicaciones de hidrología, gestión de embalses y avisos de riesgo invernal.
- Investigación en modelos meteorológicos aprendidos: los pesos públicos bajo CC BY 4.0 y el cuaderno Apache 2.0 permiten reproducir la inferencia, comparar arquitecturas GNN-transformer y experimentar con variantes sobre ERA5.
- Evaluación y verificación de pronósticos: el modelo se evalúa comparando sus salidas con análisis de predicción numérica y datos observacionales, lo que permite usarlo como referencia en estudios de habilidad predictiva.
- Docencia y formación en meteorología: el cuaderno de demostración cubre instalación, recuperación de condiciones iniciales desde ECMWF Open Data, carga del checkpoint, inferencia y visualización, lo que lo convierte en material didáctico reproducible.
- Integración en servicios meteorológicos nacionales: al formar parte del framework Anemoi, co-desarrollado con servicios nacionales europeos, el modelo puede desplegarse en infraestructuras públicas de predicción con adaptaciones locales.
- Análisis de la estratosfera: el nivel de 10 hPa añadido en v2 permite estudiar la dinámica estratosférica y su influencia en la predicción de medio plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la habilidad predictiva de AIFS se evalúa comparando sus pronósticos con análisis de predicción numérica y datos observacionales directos, pero no incluye tablas de métricas (MSE u otras) en el material proporcionado. La métrica declarada en los metadatos es MSE, sin valores numéricos asociados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de aproximadamente 0,5 GB, lo que sugiere que el checkpoint es relativamente ligero, pero no se especifica la huella de memoria en ejecución.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible. No se confirma si cabe en tarjetas RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: anemoi-inference, tanto por línea de comandos (`anemoi-inference run inference.yaml`) como mediante el paquete de Python y el cuaderno de demostración; también admite ejecución con uv (`uv run --extra inference anemoi-inference run inference.yaml`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Arquitectura | Resolución | Horizonte | Licencia |
|---|---|---|---|---|---|
| AIFS Single v2 | ECMWF | GNN + transformer | ~31 km, 14 niveles | 15 días, 6 h | CC BY 4.0 |
| AIFS Single v1.1 | ECMWF | GNN + transformer | ~31 km, 14 niveles | 15 días, 6 h | CC BY 4.0 |
| AIFS ENS v2 | ECMWF | GNN + transformer (ensembles) | no disponible | no disponible | no disponible |

La comparación con modelos de otras familias (GraphCast, Pangu-Weather, FourCastNet) no está disponible en la información proporcionada, por lo que no se incluyen datos de rendimiento ni especificaciones de esos sistemas.

## Limitaciones y advertencias

- El modelo está entrenado y ajustado principalmente con datos ERA5 y está orientado a la predicción meteorológica global; no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- El idioma declarado en los metadatos es únicamente inglés, aunque esto refleja la documentación y no el contenido procesado, que son variables físicas.
- No se dispone de información sobre sesgos específicos del modelo; al entrenarse con ERA5, podría heredar los sesgos del reanálisis y de su cobertura espacial y temporal.
- Riesgo de alucinación no aplicable en el sentido de los modelos de lenguaje, pero la predicción puede divergir de la realidad en horizontes largos; la model card remite a una sección de limitaciones conocidas que no se detalla en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el cuaderno y los scripts están bajo Apache 2.0, por lo que conviene respetar ambas licencias por separado.
- No se especifican restricciones adicionales de uso operativo ni requisitos de atribución concretos más allá de la licencia CC BY 4.0.
- Para producción, es necesario contar con condiciones iniciales (por ejemplo, desde ECMWF Open Data) y con el framework Anemoi; no se documentan garantías de servicio ni acuerdos de nivel de servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ecmwf/aifs-single-2.0
- Modelo ensemble relacionado: https://huggingface.co/ecmwf/aifs-ens-2.0
- Versión anterior: https://huggingface.co/ecmwf/aifs-single-1.1
- Página de implementación de AIFS Single v2: https://confluence.ecmwf.int/display/FCST/Implementation+of+AIFS+Single+v2
- Framework Anemoi: https://anemoi.readthedocs.io/
- Repositorio anemoi-inference: https://github.com/ecmwf/anemoi-inference
- Datos abiertos del ECMWF: https://www.ecmwf.int/en/forecasts/datasets/open-data
- Artículo AIFS (2024): https://arxiv.org/abs/2406.01465
- Artículo de actualización de AIFS (2025): https://arxiv.org/abs/2509.18994
- Artículo sobre el océano superficial en AIFS (2026): https://arxiv.org/abs/2604.25559
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Web del ECMWF: https://www.ecmwf.int/
- Gráficos del ECMWF: https://charts.ecmwf.int/
- Cuaderno de demostración: run_AIFS_v2.0.ipynb (incluido en el repositorio del modelo)
