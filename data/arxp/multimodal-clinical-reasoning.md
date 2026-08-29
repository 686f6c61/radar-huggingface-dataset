# arxp/multimodal-clinical-reasoning

## Resumen

`arxp/multimodal-clinical-reasoning` es una tarjeta de investigación académica, no un modelo con pesos liberados. Documenta un proyecto de deep learning para la generación automática de informes radiológicos a partir de radiografías de tórax, desarrollado por un equipo colaborativo en el que participa Arda Çiftçi (`arxp`). El sistema combina un encoder de visión médico congelado (BiomedCLIP) con un decoder de lenguaje (GPT-2) conectados mediante cross-attention, de modo que las representaciones de parches de la imagen condicionan la generación de tokens de texto del informe.

El proyecto estudia cuatro variantes controladas que incorporan regularización de atención (entropía, esparcimiento y alineación) para evaluar si mejoran la calidad de generación y la alineación entre imagen y texto. Los resultados, reportados sobre 1.000 muestras de validación, muestran que las variantes regularizadas no superan consistentemente a la línea base en métricas de generación de texto, aunque la variante `entropy_only` logra la mayor superposición de hallazgos clínicos. La relevancia de esta tarjeta radica en su valor como referencia metodológica para el diseño de estudios de ablación en generación de informes médicos, no como un sistema desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiomedCLIP (vision encoder) + GPT-2 (decoder) con cross-attention |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se liberan pesos) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada; uso clinico no permitido) |
| Formato de pesos | no disponible (no se publican checkpoints) |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema encoder-decoder multimodal. El encoder de vision es BiomedCLIP, un modelo preentrenado en imagenes medicas, que se mantiene congelado durante el entrenamiento. Extrae caracteristicas de parches de la radiografia de torax, que se proyectan y se conectan mediante capas de cross-attention al decoder GPT-2. El decoder genera el texto del informe token a token, condicionado por las representaciones visuales.

El entrenamiento se realizo sobre el conjunto de datos MIMIC-CXR, aunque los datos no se redistribuyen. Se definieron cuatro variantes experimentales: `baseline` (sin regularizacion de atencion), `entropy_only` (anade regularizacion por entropia de atencion), `sparsity_only` (regularizacion orientada a esparcimiento) y `full_alignment` (combina entropia, esparcimiento y perdidas de alineacion). No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. La innovacion principal es el estudio sistematico de como distintas formas de regularizacion de atencion afectan a la calidad de generacion y a la alineacion imagen-texto en un dominio clinico.

## Capacidades

- Generacion de informes radiológicos en ingles a partir de radiografias de torax (imagen a texto).
- Condicionamiento por imagen mediante cross-attention entre parches visuales y tokens de texto.
- Estudio de regularizacion de atencion: entropia, esparcimiento y alineacion combinada.
- Evaluacion multidimensional con metricas de generacion de texto (BLEU, METEOR, ROUGE-L, CIDEr) y una metrica de solapamiento de hallazgos clinicos.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, vision generalista ni soporte multilingue mas alla del ingles.
- No es un modelo de inferencia: no se liberan pesos ni checkpoints, por lo que no es utilizable directamente para prediccion.

## Casos de uso

- Investigacion en generacion de informes medicos: el proyecto sirve como referencia para disenar estudios de ablacion que comparen estrategias de regularizacion de atencion en modelos imagen-texto clinicos. Un investigador puede reproducir los notebooks del repositorio companion para entender el flujo completo de entrenamiento y evaluacion.
- Evaluacion de metricas de calidad en generacion de texto medico: la tabla de resultados muestra como BLEU, METEOR, ROUGE-L y CIDEr no capturan completamente la correccion clinica, lo que ilustra la necesidad de metricas complementarias como el solapamiento de hallazgos. Esto es util para quienes disenan sistemas de evaluacion automatica en radiologia.
- Estudio de regularizacion de atencion en modelos multimodales: las cuatro variantes permiten analizar el impacto de anadir perdidas de entropia, esparcimiento y alineacion sobre la atencion cruzada. Un investigador puede replicar estos experimentos en otros dominios (por ejemplo, patologia o dermatologia) para validar si los resultados se generalizan.
- Formacion y divulgacion academica: la tarjeta y el repositorio companion son materiales didacticos para cursos de deep learning aplicado a imagen medica, mostrando un pipeline completo con encoder congelado, decoder generativo y cross-attention.
- Analisis de datos clinicos: la contribucion documentada de Arda Ciftci incluye limpieza y analisis estadistico del dataset VQA-RAD, con ingenieria de 34 caracteristicas sobre 2.244 ejemplos. Este trabajo puede servir como referencia metodologica para tareas de preprocesamiento y analisis exploratorio en datasets de preguntas y respuestas visuales medicas.
- Comparacion de arquitecturas para generacion de informes: aunque no hay pesos disponibles, la descripcion de la arquitectura (BiomedCLIP + GPT-2 con cross-attention) permite comparar disenos con otras propuestas de la literatura, como las basadas en LLaVA-Med o QoQ-Med3, en terminos de complejidad y resultados reportados.

## Benchmarks y rendimiento

La evaluacion se realizo sobre 1.000 muestras de validacion retenidas. Los resultados por variante son los siguientes:

| Variante | BLEU-1 | METEOR | ROUGE-L | CIDEr | Finding overlap |
| --- | ---: | ---: | ---: | ---: | ---: |
| `baseline` | 0.1391 | 0.1359 | 0.1137 | 0.0099 | 0.6429 |
| `entropy_only` | 0.1370 | 0.1344 | 0.1108 | 0.0090 | **0.6732** |
| `sparsity_only` | 0.1301 | 0.1263 | 0.1094 | **0.0101** | 0.5606 |
| `full_alignment` | 0.1361 | 0.1336 | 0.1105 | 0.0080 | 0.6439 |

Las variantes regularizadas no superan consistentemente a la linea base en las metricas de generacion de texto. La variante `entropy_only` obtiene el mayor solapamiento de hallazgos (0.6732), lo que subraya la importancia de evaluar multiples dimensiones en la generacion de informes medicos. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware. Al no liberarse pesos ni checkpoints, no es posible estimar VRAM, GPUs recomendadas, latencia o throughput. El proyecto se describe como un estudio academico con notebooks reproducibles, pero no se especifican los recursos utilizados para el entrenamiento ni la inferencia.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la informacion proporcionada. La tarjeta no incluye resultados frente a alternativas como LLaVA-Med, QoQ-Med3 u otros sistemas de generacion de informes radiologicos. Los articulos encontrados en la busqueda web (por ejemplo, sobre Med-CMR o GPT-5 como razonador clinico) abordan benchmarks y evaluaciones de modelos multimodales clinicos, pero no comparan con este proyecto especifico. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No se ha realizado validacion clinica, estudio prospectivo ni revision regulatoria. El sistema no esta aprobado para uso diagnostico ni como soporte a decisiones clinicas.
- El texto generado puede omitir, alucinar o declarar incorrectamente hallazgos clinicamente relevantes. Las metricas BLEU, METEOR, ROUGE y CIDEr no miden la correccion clinica real.
- La composicion del dataset (MIMIC-CXR) y las practicas institucionales pueden limitar la generalizacion a otros entornos o poblaciones.
- No se liberan pesos ni checkpoints. La tarjeta es un resumen de investigacion, no un paquete de modelo utilizable.
- El acceso y la redistribucion de MIMIC-CXR estan sujetos a los terminos del proveedor del dataset.
- La licencia se indica como `other` sin especificar condiciones concretas. El uso clinico esta explicitamente prohibido.
- La contribucion de Arda Ciftci se limita a tareas de limpieza y analisis de datos en VQA-RAD; el sistema final es resultado del trabajo del equipo completo, y esta tarjeta distingue ambas partes.

## Enlaces

- [HuggingFace: arxp/multimodal-clinical-reasoning](https://huggingface.co/arxp/multimodal-clinical-reasoning)
- [Repositorio GitHub companion](https://github.com/buraksamisirin/multimodal-clinical-reasoning)
- [Informe del proyecto (PDF)](https://github.com/buraksamisirin/multimodal-clinical-reasoning/blob/main/project_report.pdf)
- [Perfil de Arda Ciftci en GitHub](https://github.com/OxyOxygen)
- [Space de Arda Ciftci: Istanbul Mobility & Mood Explorer](https://huggingface.co/spaces/arxp/istanbul-mobility-mood-explorer)
