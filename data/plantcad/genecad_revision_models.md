# plantcad/genecad_revision_models

## Resumen

GeneCAD revision models es una colección de checkpoints de modelos de anotación de estructura génica desarrollados por el equipo de PlantCAD, publicados como material de reproducibilidad para la revisión del manuscrito de GeneCAD enviado a la revista *Bioinformatics* (identificador BIOINF-2026-2172). El repositorio no contiene un modelo único, sino doce checkpoints (cuatro condiciones de entrenamiento por tres semillas) que comparten backbone, código y esquema de entrenamiento, y difieren únicamente en el conjunto de genes anotados usados como supervisión.

El modelo resuelve el problema de la anotación automática de genes en genomas de plantas: dado un genoma ensamblado, predice la estructura de los genes (exones, intrones y marcos de lectura). Se apoya en el backbone `emarro/pcad2-200M-cnet-baseline`, una red de aproximadamente 200 millones de parámetros que procesa ventanas de 8.192 pares de bases, una resolución habitual en modelos genómicos de tipo transformer.

La relevancia actual es doble: por un lado, ofrece a la comunidad checkpoints exactos que permiten reproducir cada resultado del manuscrito revisado; por otro, el diseño experimental (condiciones U, B, M y R) convierte el repositorio en un banco de pruebas para estudiar cómo la calidad y la selección del conjunto de supervisión afectan al rendimiento de la anotación génica, un aspecto poco documentado en la literatura de modelos genómicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone `emarro/pcad2-200M-cnet-baseline` (modelo genómico tipo transformer con encoder de 8 capas, según la configuración de entrenamiento) |
| Parámetros totales | Aproximadamente 200 M (heredados del backbone pcad2-200M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 pb (ventana de entrada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de genómica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (`.ckpt`, formato Lightning) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone `emarro/pcad2-200M-cnet-baseline` (revisión `5574ff5d`), una arquitectura de tipo transformer adaptada a secuencias genómicas de 8.192 pares de bases. Sobre ese backbone se añade una cabeza de predicción de estructura génica con 8 capas de encoder, embeddings de tokens de dimensión 256 y una ventana de entrada fija de 8.192 pb. El código de entrenamiento e inferencia es `plantcad/genecad`, en el commit `0701f7f0d3e077fe22f81c2ea7f416e2351519cb`.

El entrenamiento se realizó sobre ocho especies vegetales con idéntico esquema en las cuatro condiciones: 1.753 pasos de optimizador, batch efectivo de 384 (2 GPU x 4 x 48 de acumulación), tasa de aprendizaje 2e-4 con decaimiento coseno, y hardware de 2 x NVIDIA GH200 en TACC Vista. La innovación metodológica no está en la arquitectura sino en el diseño de supervisión: la condición U usa todos los genes representables por el pipeline; B aplica control de calidad estructural básico; M aplica selección MMLR con isoformas de *A. thaliana* y *O. sativa* respaldadas por PeptideAtlas (sin datos de maíz); y R elimina genes al azar para igualar la retención de M. Los genes excluidos se enmascaran, no se usan como negativos. Cada condición se entrenó con las semillas 11, 22 y 33. No se documenta en la información disponible el uso de RLHF, DPO ni datos de preferencias, algo esperable en un modelo de genómica.

## Capacidades

- Predicción de estructura génica: identificación de exones, intrones y marcos de lectura sobre genomas ensamblados de plantas.
- Anotación a escala genómica mediante ventanas deslizantes de 8.192 pb.
- Generalización a las ocho especies de entrenamiento del pipeline de datos.
- Ejecución mediante la CLI `genecad predict`, con parámetros de especie y modelo de checkpoint.
- Reproducibilidad completa: cada checkpoint incluye `training_evidence.json` con semilla, pasos, contabilidad de batch, comprobaciones de gradiente y tiempos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo especializado en genómica, no un modelo de lenguaje general.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Anotación de genomas de plantas de novo: dado un ensamblado FASTA, ejecutar `genecad predict` con el checkpoint de la condición deseada para obtener un conjunto de estructuras génicas predichas; útil en proyectos de genómica comparativa donde la anotación manual es inviable.
- Reproducción de resultados científicos: los doce checkpoints permiten a revisores y lectores regenerar exactamente las cifras del manuscrito BIOINF-2026-2172, condición por condición y semilla por semilla.
- Estudio del efecto de la calidad de supervisión: comparar las condiciones U, B, M y R sobre el mismo genoma de prueba permite cuantificar cómo el filtrado estructural y la selección de isoformas respaldadas por proteómica afectan a la precisión de la anotación.
- Validación de pipelines de anotación existentes: usar GeneCAD como anotador independiente y contrastar sus predicciones con anotaciones de referencia o con evidencia proteómica (PeptideAtlas) para detectar discrepancias.
- Mejora de anotaciones en especies huérfanas: aplicar el modelo a especies próximas a las ocho de entrenamiento para proponer estructuras génicas que luego se validen experimentalmente.
- Análisis de estabilidad entre semillas: entrenar o evaluar las tres semillas por condición para estimar la varianza del rendimiento y reportar intervalos de confianza en publicaciones.
- Integración en flujos de bioinformática: la CLI y el formato de checkpoints Lightning permiten encadenar la predicción con herramientas posteriores (p. ej., evaluación con gffcompare o comparación con InterProScan).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con un backbone de ~200 M de parámetros, la inferencia en precisión nativa (FP32/FP16) debería caber holgadamente en GPUs de consumo, pero no se confirma en la model card.
- GPU recomendadas para entrenamiento: 2 x NVIDIA GH200 (configuración usada en TACC Vista).
- GPU de consumo: no confirmado; por tamaño del backbone es plausible que quepa en RTX 3090/4090, pero no hay datos oficiales.
- Opciones de despliegue: la CLI `genecad predict` del repositorio `plantcad/genecad`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 39,3 GB, por lo que conviene descargar únicamente los checkpoints necesarios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeneCAD revision models | ~200 M | 8.192 pb | Anotación de estructura génica en plantas | Apache 2.0 | HuggingFace (`plantcad/genecad_revision_models`) |
| Backbone `emarro/pcad2-200M-cnet-baseline` | ~200 M | No disponible | Modelo genómico base (PlantCAD2) | No disponible | HuggingFace |
| Modelos de anotación génica basados en HMM (p. ej., AUGUSTUS, BRAKER) | No aplica (modelos estadísticos) | No aplica | Anotación de estructura génica | Varía (MIT, GPL, etc.) | Repositorios académicos |

No se dispone de datos de rendimiento comparativo entre GeneCAD y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de genómica, no de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K ni usarse para tareas de texto general.
- Entrenado únicamente con ocho especies vegetales; el rendimiento en especies fuera de ese conjunto no está caracterizado y puede degradarse notablemente.
- La condición M no incluye datos de maíz, por lo que su supervisión es parcial respecto a las demás condiciones; comparar condiciones requiere tener en cuenta esta asimetría.
- Ventana fija de 8.192 pb: genes más largos que la ventana requieren estrategias de ventana deslizante cuyo comportamiento no se detalla en la model card.
- Riesgo de falsos positivos y negativos en regiones repetitivas o con anotación incompleta; los genes excluidos se enmascaran, no se usan como negativos, lo que puede sesgar la calibración.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se publica como material de reproducibilidad de un manuscrito; no hay garantías de soporte ni mantenimiento.
- Tamaño del repositorio (39,3 GB) y ausencia de cuantizaciones publicadas: el despliegue en producción requiere planificar almacenamiento y conversión de formato.
- No se documentan sesgos específicos más allá del sesgo de las ocho especies de entrenamiento ni evaluación de robustez frente a ensamblados de baja calidad.

## Enlaces

- HuggingFace: https://huggingface.co/plantcad/genecad_revision_models
- Repositorio de código: `plantcad/genecad` (commit `0701f7f0d3e077fe22f81c2ea7f416e2351519cb`)
- Backbone: https://huggingface.co/emarro/pcad2-200M-cnet-baseline (revisión `5574ff5d`)
- Manuscrito: *Bioinformatics*, identificador BIOINF-2026-2172 (no se proporciona URL directa)
