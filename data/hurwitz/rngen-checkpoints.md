# Hurwitz/RNGen-checkpoints

## Resumen

RNGen es una familia de checkpoints para análisis de números romanos (RNA, *Roman Numeral Analysis*) sobre música simbólica. El modelo combina un codificador musical MusicBERT con un modelo de lenguaje Qwen2.5-Instruct (7B o 14B) mediante un proyector, y se entrena en tres fases secuenciales: predicción de tonalidad local (Key), entrenamiento intermedio multitarea (Mixed) y análisis final de números romanos (RNA). Lo desarrolla el usuario Hurwitz y se publica bajo licencia específica por componente.

El problema que aborda es el etiquetado armónico automático de partituras codificadas simbólicamente (por ejemplo, MusicXML o representaciones tokenizadas), una tarea clásica en musicología computacional que normalmente requiere anotación experta. RNGen traslada el paradigma de los modelos visión-lenguaje al dominio musical: el codificador MusicBERT actúa como extractor de representaciones de la partitura y el LLM genera la secuencia de números romanos correspondiente.

La relevancia actual reside en que es uno de los pocos proyectos abiertos que publica checkpoints completos (encoder, proyector, adaptadores LoRA y tokenizador) para RNA con modelos de 7B y 14B, junto con el código de entrenamiento y evaluación. El repositorio ocupa 4,2 GB e incluye también el checkpoint base original de MusicBERT y un RNBERT ajustado al dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador MusicBERT (transformer) + proyector + LLM Qwen2.5-Instruct con adaptadores LoRA |
| Parametros totales | No disponible (el checkpoint no incluye los pesos base de Qwen; se descargan por separado: 7B o 14B según variante) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en safetensors; la evaluación oficial usa BF16) |
| Idiomas soportados | No disponible (la tarea es simbólica-musical, no lingüística) |
| Licencia | Component-specific-licensing (archivo LICENSE en el repo) |
| Formato de pesos | safetensors (checkpoints compuestos: encoder, proyector, adaptadores LoRA y tokenizador) |

## Arquitectura y entrenamiento

RNGen es un modelo multimodal simbólico: un encoder MusicBERT procesa la representación de la partitura (con una variante *spelling-aware* y un factor de submuestreo de 1.0), un proyector transforma esas representaciones al espacio del LLM, y Qwen2.5-7B-Instruct o Qwen2.5-14B-Instruct genera la salida mediante adaptadores LoRA entrenados. El entrenamiento se organiza en tres etapas: primero predicción de tonalidad local (Key), después una fase intermedia multitarea con seis tareas (Mixed) y finalmente el ajuste específico de análisis de números romanos (RNA). Cada checkpoint almacena el encoder entrenado, el proyector, los adaptadores LoRA y los ficheros de tokenizador; los pesos base de Qwen se obtienen aparte vía Transformers.

La evaluación oficial usa BF16 con tamaño de batch 1 y decodificación determinista por beam search de cuatro haces, con límites de 256 tokens para Key y 2.048 tokens para RNA. El repositorio incluye además el checkpoint original de Microsoft MusicBERT base y un RNBERT ajustado al dominio (experimento `1742830064`) con sus métricas de referencia en CSV. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se enlaza el dataset RNGen-data con las anotaciones correspondientes.

## Capacidades

- Predicción de tonalidad local sobre música simbólica (etapa Key).
- Análisis de números romanos (RNA) a nivel de acorde o segmento, con informes por clase en la evaluación.
- Entrenamiento intermedio multitarea con seis tareas armónicas (etapa Mixed), con pérdidas por tarea y una pérdida de selección agregada.
- Procesamiento de representaciones musicales con codificación sensible a la ortografía (*spelling-aware*).
- Generación determinista mediante beam search, adecuada para tareas de etiquetado estructurado.
- Integración con el ecosistema Transformers para cargar los pesos base de Qwen.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo general.

## Casos de uso

- Anotación armónica automática de corpus: dado un conjunto de partituras simbólicas, RNGen-RNA genera la secuencia de números romanos, lo que permite etiquetar grandes volúmenes de obras sin intervención experta manual.
- Investigación musicológica a escala: el modelo facilita estudios estadísticos sobre progresiones armónicas y prácticas compositivas al producir anotaciones homogéneas sobre corpus amplios.
- Generación de material docente: a partir de una partitura de ejemplo, el modelo puede producir el análisis armónico de referencia para ejercicios de armonía.
- Preetiquetado para revisión humana: los checkpoints RNA sirven como primera pasada en flujos de anotación asistida, reduciendo el coste de la revisión posterior por parte de musicólogos.
- Evaluación comparativa de codificadores musicales: al publicarse MusicBERT base, RNBERT ajustado y los checkpoints RNGen, el repositorio permite reproducir experimentos y comparar etapas del pipeline Key → Mixed → RNA.
- Búsqueda y recuperación musical basada en armonía: las etiquetas RNA generadas pueden indexarse para recuperar fragmentos por progresión armónica en bibliotecas de partituras.
- Desarrollo de herramientas de análisis asistido: integración del cargador `load_pretrained_rngen_checkpoint` en aplicaciones de escritorio o web que analicen partituras introducidas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un CSV de métricas de referencia para el experimento RNBERT `1742830064` y el CLI de evaluación genera informes de métricas con prefijo `eval_`, pero los valores numéricos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por la variante 14B en BF16 y los pesos base de Qwen, se requiere una GPU de gran capacidad (clase A100/H100 de 40-80 GB) para evaluación completa según el propio autor, que indica que la evaluación y el entrenamiento de 7B/14B requieren "una plataforma GPU adecuada".
- GPU recomendadas: no se especifican modelos concretos; el autor remite a plataformas GPU aptas para 7B/14B. Para la variante 7B en BF16 se necesitan al menos ~16 GB solo para los pesos del LLM, más el encoder y el proyector.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; no hay datos de cuantización publicados que permitan reducir los requisitos.
- Despliegue: el proyecto proporciona su propio cargador (`load_pretrained_rngen_checkpoint`) y CLI de evaluación (`python -m rngen.sft_eval`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación usa batch 1 con beam search de cuatro haces, lo que implica decodificación secuencial y mayor coste que la búsqueda greedy.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de análisis de números romanos ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Licencia "component-specific-licensing": los términos varían por componente y deben revisarse en el archivo LICENSE antes de cualquier uso comercial.
- Los checkpoints no incluyen los pesos base de Qwen; es necesario descargar `Qwen/Qwen2.5-7B-Instruct` o `Qwen/Qwen2.5-14B-Instruct`, cuyas licencias propias también aplican.
- El cargador resuelve `../../rnbert/unconditioned_checkpoint_best.pt` de forma relativa, por lo que la estructura de directorios debe mantenerse intacta; mover ficheros rompe la carga.
- Cada checkpoint requiere su propio tokenizador y adaptador LoRA; mezclar ficheros entre variantes o etapas puede producir errores silenciosos.
- No hay información publicada sobre sesgos del modelo, tasas de alucinación ni cobertura de estilos musicales fuera del corpus de entrenamiento.
- El modelo está especializado exclusivamente en música simbólica; no procesa audio ni partituras en imagen.
- No se documentan límites de contexto ni comportamiento con obras de gran extensión más allá del límite de generación de 2.048 tokens en RNA.
- El proyecto tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente.

## Enlaces

- HuggingFace (checkpoints): https://huggingface.co/Hurwitz/RNGen-checkpoints
- HuggingFace (dataset): https://huggingface.co/datasets/Hurwitz/RNGen-data
- Repositorio de código: https://github.com/Hurwitzzz/RNGen
- Instrucciones de instalación: https://github.com/Hurwitzzz/RNGen#installation
- Pesos y datos: https://github.com/Hurwitzzz/RNGen#weights-and-data
- Guía de entrenamiento: https://github.com/Hurwitzzz/RNGen#train-a-new-model
