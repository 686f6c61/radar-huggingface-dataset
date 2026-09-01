# coderGit/eng-pidginedu-mt5-large

## Resumen

El modelo `coderGit/eng-pidginedu-mt5-large` es un ajuste fino completo (full fine-tune) del checkpoint `google/mt5-large` (1.2B parámetros) para la traducción automática del inglés al pidgin nigeriano (código ISO `pcm`). Ha sido desarrollado por el usuario `coderGit` como parte del benchmark Eng-PidginEdu, un proyecto que evalúa 14 modelos de traducción multilingüe bajo distintas condiciones de entrenamiento (fine-tuning completo, zero-shot y LoRA/PEFT). Este checkpoint es el modelo insignia del benchmark, seleccionado por liderar tres de las cuatro métricas de evaluación en el conjunto de test.

La característica distintiva del modelo es su capacidad de producir glosas terminológicas en línea: junto a la traducción, inserta explicaciones parentéticas en pidgin para términos académicos en inglés. Está entrenado sobre un dataset de 26.232 pares de oraciones que cubren 8 materias académicas, con el objetivo de facilitar la comprensión de contenido educativo en contextos donde el pidgin nigeriano es la lengua vehicular. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para aplicaciones educativas y de localización en África occidental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 (T5 multilingue) encoder-decoder transformer |
| Parametros totales | 1.229.581.312 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base mT5-large usa 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (los pesos se publican en fp32; se puede cuantizar con herramientas externas) |
| Idiomas soportados | ingles (en), pidgin nigeriano (pcm) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura mT5, una variante multilingue de T5 que emplea un encoder-decoder transformer con atención totalmente densa. El checkpoint base `google/mt5-large` fue preentrenado sobre el corpus mC4 en 101 idiomas, y aqui se ha sometido a un ajuste fino completo (todos los parametros) en precision fp32. El entrenamiento se realizo con el optimizador Adafactor (tasa de aprendizaje 1e-3), un tamano de lote efectivo de 16 (2 por GPU), durante 5 epocas, utilizando dos GPUs Tesla V100 de 32 GB. El objetivo de entrenamiento es el campo `pcm_augmented`, que contiene la traduccion al pidgin con glosas terminologicas insertadas entre parentesis. Se emplea el prefijo `"translate English to Pidgin: "` para activar la tarea.

El dataset Eng-PidginEdu consta de 26.232 pares de oraciones en 8 materias academicas. La innovacion principal es la generacion de glosas: el modelo no solo traduce, sino que anade explicaciones en pidgin para terminos tecnicos, lo que mejora la comprension lectora en contextos educativos. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado de forma clasica.

## Capacidades

- Traduccion automatica de ingles a pidgin nigeriano con generacion de glosas terminologicas en linea (formato: termino en ingles seguido de explicacion parentetica en pidgin).
- Generacion de texto en pidgin nigeriano, limitada al dominio educativo y a los temas cubiertos en el dataset de entrenamiento.
- Soporte de tareas de traduccion con prefijo de instruccion, siguiendo el paradigma text-to-text de T5.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Multilingue solo en el par ingles-pidgin; no se ha evaluado su rendimiento en otros pares de idiomas.

## Casos de uso

- Traduccion de materiales educativos: el modelo puede convertir libros de texto, apuntes y examenes del ingles al pidgin nigeriano, anadiendo glosas para terminos cientificos o tecnicos que faciliten la comprension a estudiantes que usan el pidgin como lengua principal.
- Localizacion de contenido digital: plataformas de e-learning o sitios web educativos pueden integrar el modelo para ofrecer versiones en pidgin de sus contenidos, mejorando el acceso a la educacion en regiones de Nigeria y otros paises de habla pidgin.
- Asistencia a docentes: los profesores pueden generar rapidamente traducciones de material didactico para aulas donde el pidgin es la lengua vehicular, reduciendo el tiempo de preparacion de clases bilingues.
- Subtitulado de videos educativos: el modelo puede generar subtitulos en pidgin para videos de formacion, con glosas que aclaran la terminologia especifica de cada materia.
- Creacion de glosarios bilingues: a partir de las glosas generadas, se pueden extraer listas de terminos academicos con sus equivalencias en pidgin, utiles para la elaboracion de diccionarios especializados.
- Investigacion en traduccion automatica para lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos de fine-tuning, evaluacion de metricas (BLEU, chrF++, AfriCOMET) y comparacion de estrategias de entrenamiento en el marco del benchmark Eng-PidginEdu.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al conjunto de test con decodificacion beam-5:

| Metrica | Puntuacion |
|---|---|
| BLEU | 66.92 |
| chrF++ | 80.59 |
| AfriCOMET | 71.94 |
| Precision de glosario | 79.68 |
| F1 de glosario | 78.51 |

Segun el autor, el modelo lidera tres de las cuatro metricas (GlossF1, AfriCOMET y chrF++) entre los 12 modelos con fine-tuning completo del benchmark, y queda tercero en BLEU bruto con una diferencia de 1,6 puntos respecto al lider. La seleccion se valido en un leaderboard de desarrollo reservado para evitar sesgos de comparacion multiple. No se proporcionan comparaciones con otros modelos fuera del benchmark.

## Requisitos de hardware

- El modelo tiene 1.229.581.312 parametros. En fp32, el repositorio ocupa 4,9 GB, por lo que la inferencia en esta precision requiere al menos 8 GB de VRAM (estimacion razonable, no especificada por el autor).
- Con cuantizacion a int8 (mediante herramientas como bitsandbytes o llama.cpp) el uso de VRAM se reduce a aproximadamente 2,5 GB, lo que permitiria ejecutarlo en GPUs consumer como RTX 3060 o RTX 4060. En int4, el consumo rondaria 1,2 GB, aunque no se han publicado pruebas oficiales.
- El entrenamiento se realizo con 2x Tesla V100-32GB, pero para inferencia no se requiere tanta memoria.
- Opciones de despliegue: al ser un modelo de la familia T5, se puede servir con Hugging Face Transformers, vLLM (si se convierte a un formato compatible), o mediante ONNX Runtime. No se menciona soporte nativo para Ollama o llama.cpp, aunque es posible convertir los pesos a GGUF con herramientas externas.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (traduccion ingles-pidgin nigeriano) en terminos de rendimiento, parametros o licencia. El unico punto de referencia conocido es el modelo base `google/mt5-large`, del cual hereda la arquitectura y el preentrenamiento. Otros modelos multilingues como NLLB-200 o M2M-100 podrian cubrir el par ingles-pidgin, pero no se han publicado comparaciones directas con este checkpoint. Por tanto, la comparativa se limita a lo documentado en el benchmark Eng-PidginEdu, cuyos resultados completos estan disponibles en el repositorio de GitHub.

## Limitaciones y advertencias

- El modelo esta especializado en el dominio educativo y en las 8 materias del dataset; su rendimiento fuera de ese ambito puede degradarse significativamente.
- La longitud de contexto no se ha especificado; el modelo base mT5-large tiene una ventana de 512 tokens, lo que limita la traduccion de documentos largos sin segmentacion previa.
- No se han evaluado sesgos de genero, etnia o dialecto dentro del pidgin nigeriano. El pidgin tiene variaciones regionales que el modelo puede no capturar adecuadamente.
- Existe riesgo de alucinacion en terminos tecnicos poco frecuentes o en frases ambiguas, especialmente cuando el glosario no contiene la entrada correspondiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias; el autor no ofrece soporte tecnico.
- El numero de descargas es cero y no hay evidencia de validacion externa mas alla de los resultados reportados por el propio autor, lo que aconseja una evaluacion independiente antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coderGit/eng-pidginedu-mt5-large
- Dataset Eng-PidginEdu: https://huggingface.co/datasets/coderGit/Eng_PidginEdu
- Repositorio del benchmark (metodologia, hiperparametros y comparativa de 14 modelos): https://github.com/shashacode/Eng-PidginEdu-Benchmark
- Modelo base google/mt5-large: https://huggingface.co/google/mt5-large
