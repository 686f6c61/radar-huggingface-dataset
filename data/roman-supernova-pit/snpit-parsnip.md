# Roman-Supernova-PIT/snpit-parsnip

## Resumen

snpit-parsnip es un modelo de clasificación tabular orientado a la caracterización de transitorios astronómicos, en concreto supernovas, en el contexto del telescopio espacial Roman (Nancy Grace Roman Space Telescope). Lo desarrolla el proyecto Roman-Supernova-PIT y consiste en un reentrenamiento del modelo y clasificador original de Parsnip, presentado en el artículo arXiv:2109.13999 y con implementación de referencia en el repositorio GitHub de LSSTDESC.

El modelo no es un modelo de lenguaje: se distribuye con el pipeline `tabular-classification` y trabaja sobre características tabulares derivadas de observaciones fotométricas de transitorios. La variante `epoch245` se entrenó durante 245 épocas, y la variante `noz` predice el desplazamiento al rojo (redshift) sin requerirlo como entrada, lo que simplifica el preprocesado en escenarios donde esa magnitud no está disponible.

Su relevancia es acotada y muy específica: sirve como componente de clasificación y estimación de redshift dentro de pipelines de análisis de supernovas para Roman. El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes, y no se han publicado especificaciones de arquitectura, tamaño de parámetros ni contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación tabular implementado en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a clasificación tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (repositorio de 0,0 GB; no se detalla el formato) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card indica únicamente que se trata de un reentrenamiento del modelo y clasificador de Parsnip, que la variante `epoch245` se entrenó durante 245 épocas y que la variante `noz` predice el redshift sin recibirlo como entrada. El modelo está implementado en PyTorch y se clasifica como `tabular-classification`, lo que implica que opera sobre un vector de características tabulares en lugar de sobre texto o imágenes.

No se especifican el número de tokens de entrenamiento (concepto no aplicable), la composición del conjunto de datos, ni si hubo etapas de ajuste fino con RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Los modelos han sido entrenados por Ellesse Lynum-Lozano, según la model card.

## Capacidades

- Clasificación de transitorios astronómicos, en particular supernovas, a partir de características tabulares.
- Predicción de redshift en la variante `noz`, sin necesidad de proporcionar el redshift como entrada.
- Integración en pipelines de caracterización de transitorios del telescopio Roman.
- Ejecución en PyTorch, lo que permite su uso como componente dentro de flujos de inferencia en Python.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Clasificación de candidatos a supernova en catálogos fotométricos: el modelo recibe características tabulares de cada transitorio y devuelve una etiqueta de clase, lo que permite filtrar candidatos antes del seguimiento espectroscópico.
- Estimación de redshift sin dato previo: la variante `noz` permite obtener una predicción de redshift cuando no se dispone de una medición espectroscópica, útil en muestras fotométricas amplias.
- Selección de candidatos para seguimiento con el Roman Space Telescope: al clasificar transitorios de forma automatizada, se puede priorizar qué objetos merecen observación adicional.
- Análisis retrospectivo de archivos de transitorios: el modelo puede aplicarse a conjuntos de datos históricos para reclasificar objetos con características tabulares homogéneas.
- Validación cruzada de pipelines de clasificación: al ser un reentrenamiento de Parsnip, sirve como referencia para comparar el rendimiento de nuevas versiones del clasificador.
- Prototipado en investigación: al estar implementado en PyTorch y con licencia BSD-3-Clause, puede integrarse en cuadernos y scripts de análisis sin restricciones de uso comercial.
- Reproducibilidad de estudios: las variantes `epoch245` y `noz` permiten reproducir experimentos concretos de clasificación y estimación de redshift documentados por el equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB, por lo que el modelo es presumiblemente muy ligero, pero no se confirma.
- GPU recomendadas: no disponible. Al ser un modelo tabular en PyTorch, probablemente puede ejecutarse en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de clasificación tabular, su despliegue habitual sería mediante PyTorch directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| snpit-parsnip | Clasificación tabular (supernovas) | no aplica | BSD-3-Clause | Hugging Face |
| Parsnip original (LSSTDESC) | Clasificación tabular (supernovas) | no aplica | no disponible en la información proporcionada | GitHub |
| Alternativas de clasificación de transitorios | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en clasificación de transitorios astronómicos; no es un modelo de propósito general ni un modelo de lenguaje.
- No se documentan sesgos conocidos, pero al entrenarse sobre datos astronómicos concretos puede heredar los sesgos de selección de dicha muestra.
- Riesgo de alucinación no aplicable en el sentido habitual; sin embargo, puede producir clasificaciones erróneas o redshifts imprecisos en objetos atípicos o con datos de baja calidad.
- No se especifican limitaciones de contexto ni de idioma porque no aplican a este tipo de modelo.
- La licencia BSD-3-Clause permite uso comercial y modificación con atribución, pero conviene revisar los términos completos del repositorio.
- El repositorio tiene cero descargas y cero likes, y un tamaño de 0,0 GB; no hay evidencia pública de validación independiente.
- No se documentan los datos de entrenamiento ni el procedimiento de evaluación, lo que dificulta reproducir o auditar los resultados.
- Para producción, es necesario validar el modelo sobre el conjunto de datos específico del usuario antes de confiar en sus predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Roman-Supernova-PIT/snpit-parsnip
- Artículo de Parsnip: https://arxiv.org/abs/2109.13999
- Repositorio de Parsnip: https://github.com/LSSTDESC/parsnip
