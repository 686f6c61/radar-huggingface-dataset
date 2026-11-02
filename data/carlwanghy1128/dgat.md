# Carlwanghy1128/DGAT

## Resumen

DGAT (Dual-Graph Attention Network) es un marco de aprendizaje profundo para la imputación de expresión proteica espacial a partir de datos de transcriptómica espacial (ST). Lo desarrollan Haoyu Wang, Brittany Cody y Hatice Ulku Osmanbeyoglu, y se distribuye como repositorio de investigación en HuggingFace junto con el preprint asociado en bioRxiv (DOI 10.1101/2025.07.05.662121). No es un modelo de lenguaje: es un modelo de grafos aplicado a datos de omica espacial.

El problema que resuelve es concreto: las tecnologías de transcriptómica espacial proporcionan perfiles de mRNA con contexto tisular, pero no miden directamente los niveles de proteína, que son críticos para interpretar la función celular y la organización del microentorno. DGAT aprende relaciones RNA-proteína a partir de datasets de CITE-seq espacial y las aplica para inferir la abundancia de proteínas en muestras de ST que solo tienen transcriptoma.

La relevancia es doble: por un lado, permite obtener información a nivel de proteoma sin realizar experimentos de proteómica espacial; por otro, los autores reportan que supera a métodos existentes en precisión de imputación en datasets de amígdala, cáncer de mama, glioblastoma y mesotelioma maligno. El repositorio ocupa 0,4 GB y contiene código, notebooks de demostración y referencias a datos externos alojados en Google Drive.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-Graph Attention Network (GAT sobre grafos heterogéneos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se distribuyen checkpoints preentrenados vía Google Drive) |

## Arquitectura y entrenamiento

DGAT construye grafos heterogéneos que integran información transcriptómica, proteómica y espacial. Cada nodo representa una observación (célula o spot) y las aristas codifican relaciones entre modalidades y vecindad espacial. La red utiliza Graph Attention Networks para codificar estos grafos y obtener una representación latente compartida. Sobre esa representación se aplican decodificadores específicos de tarea: uno reconstruye la expresión de mRNA y otro predice la abundancia de proteínas. Este esquema multi-tarea fuerza al modelo a aprender una representación común entre ambas modalidades.

El entrenamiento se realiza sobre datasets de CITE-seq espacial, que proporcionan medidas emparejadas de mRNA y proteína en el mismo contexto espacial. Los autores citan datasets públicos y propios de amígdala, cáncer de mama, glioblastoma y mesotelioma maligno. El repositorio incluye notebooks para entrenamiento en una muestra (Demo1_Train), predicción con el modelo preentrenado (Demo2_Predict), preentrenamiento multi-muestra (Pretrain_DGAT) y predicción directa sobre datos de ST (Demo3_Predict_ST). El código requiere Python 3.11 y ofrece tres ficheros de requisitos según el entorno (CUDA, solo CPU, o torch ya instalado). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación tipo RLHF o DPO, algo esperable por otra parte en un modelo de esta naturaleza.

## Capacidades

- Imputación de expresión proteica espacial a partir de datos de transcriptómica espacial.
- Reconstrucción de expresión de mRNA como tarea auxiliar (decodificador específico).
- Integración multimodal de datos de transcriptoma, proteoma y coordenadas espaciales en un grafo heterogéneo.
- Identificación de estados celulares espacialmente distintos, fenotipos inmunes y arquitecturas tisulares que no son evidentes solo con transcriptómica.
- Entrenamiento y ajuste sobre nuevos datasets de CITE-seq espacial mediante notebooks de preentrenamiento.
- Predicción directa sobre datasets de ST sin medidas de proteína usando el modelo preentrenado.
- Reproducción de resultados publicados mediante scripts y notebooks incluidos en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de lenguaje.

## Casos de uso

- Análisis de microentorno tumoral en cáncer de mama: aplicar DGAT sobre muestras de ST sin proteómica para inferir marcadores inmunes (por ejemplo, PD-L1 o CD8) y caracterizar la organización espacial de las poblaciones inmunes infiltradas.
- Caracterización de glioblastoma: imputar proteínas de superficie y marcadores de linaje a partir de transcriptómica espacial para distinguir subpoblaciones tumorales y su localización en el tejido.
- Estudio de amígdala y tejido linfoide: reconstruir la arquitectura de centros germinales y zonas T/B infiriendo marcadores proteicos que la transcriptómica sola no resuelve con claridad.
- Mesotelioma maligno: identificar fenotipos inmunes y estados celulares espacialmente distintos para apoyar la interpretación funcional de muestras de biopsia.
- Reposicionamiento de datos históricos: aplicar el modelo preentrenado a cohortes de ST ya existentes que carecen de medidas proteicas, ampliando su valor sin repetir experimentos.
- Investigación traslacional en inmunología y medicina de precisión: generar hipótesis sobre dianas proteicas y su distribución espacial antes de validaciones experimentales costosas.
- Docencia y reproducción metodológica: usar los notebooks Demo1-Demo3 y los scripts de reproducción para formar a nuevos investigadores en integración multimodal de omica espacial.

## Benchmarks y rendimiento

Los autores indican que DGAT supera a los métodos existentes en precisión de imputación de proteínas en los datasets evaluados (amígdala, cáncer de mama, glioblastoma y mesotelioma maligno), pero en la información disponible no se incluyen las tablas numéricas de resultados ni las métricas concretas.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- El repositorio ofrece requisitos separados para CUDA, solo CPU y entornos con torch ya instalado, lo que indica que la inferencia y el entrenamiento pueden ejecutarse tanto en GPU como en CPU.
- No se especifica VRAM mínima ni recomendada en la información disponible.
- No se detallan GPU concretas recomendadas (A100, H100, RTX 4090 u otras).
- No se indica si el modelo cabe en GPU de consumo; el tamaño del repo (0,4 GB) sugiere que los checkpoints son ligeros, pero no se confirma el tamaño real de los pesos.
- Opciones de despliegue: ejecución directa con Python 3.11 y los requisitos del repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

No se proporciona en la información disponible una comparación con modelos alternativos de imputación de proteínas espaciales (por ejemplo, métodos basados en regresión, autoencoders o modelos de grafos previos). Los autores afirman que DGAT supera a los métodos existentes, pero no se detallan los nombres ni las cifras de dichos métodos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DGAT | no disponible | no aplica | superior a métodos existentes según los autores (sin cifras) | no disponible | HuggingFace + Google Drive |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación en fase de preprint: no consta revisión por pares en la información disponible.
- La licencia no está especificada, por lo que el uso comercial queda sin marco legal claro hasta que el autor la defina.
- Requiere datos de CITE-seq espacial para el entrenamiento o ajuste; la calidad de la imputación depende de la similitud entre el tejido de entrenamiento y el tejido de aplicación.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para generación de texto, código o tareas de agente.
- Riesgo de sobreajuste a los tejidos incluidos en el entrenamiento (amígdala, mama, glioblastoma, mesotelioma); la generalización a otros tejidos no está documentada.
- Los datos y checkpoints se alojan en Google Drive, lo que introduce dependencia externa y posibles problemas de reproducibilidad a largo plazo.
- No se documentan sesgos demográficos ni de composición de cohortes; en datos biomédicos esto es relevante para la interpretación clínica.
- Los resultados de imputación son predicciones estadísticas, no medidas experimentales; cualquier conclusión biológica debería validarse con proteómica espacial.
- No se especifican limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- HuggingFace: https://huggingface.co/Carlwanghy1128/DGAT
- Preprint bioRxiv: https://doi.org/10.1101/2025.07.05.662121
- Datos, modelos preentrenados y resultados (Google Drive): https://drive.google.com/drive/folders/1M9gIOFjK4wBk7DEj9MrwAlV8OHEgS2BA?usp=sharing
