# Iman998/HexaBee-4B-PT-LoRA

## Resumen

HexaBee-4B-PT-LoRA es un adaptador LoRA (fase 1) del linaje de entrenamiento HexaBee-4B, publicado por el usuario Iman998. Se trata de un artefacto histórico de investigación, no de un modelo final: el adaptador «PT» (preentrenamiento continuado / continued pretraining) se sigue entrenando durante la fase de SFT multilingüe posterior, de modo que este repositorio guarda la instantánea del adaptador correspondiente a la primera fase del pipeline.

El adaptador se monta sobre `google/gemma-3-4b-it`, un modelo multimodal de 4 000 millones de parámetros de la familia Gemma 3 (tarea declarada `image-text-to-text`). El objetivo del linaje es construir un traductor de seis idiomas —persa (fa), inglés (en), árabe (ar), chino (zh), hebreo (he) y español (es)— con supervisión bidireccional y respuesta multilingüe, entrenado en parte sobre datos sintéticos y sobre un corpus derivado de Wikipedia. El repositorio ocupa 1,0 GB e incluye pesos de adaptador en safetensors, el procesador y estadísticas de entrenamiento.

Su relevancia es fundamentalmente metodológica: documenta de forma granular cada fase del pipeline (adaptador PT, base multilingüe, SFT multilingüe, adaptador de traducción) en repositorios separados, con manifiestos de release y hashes SHA-256. Para alguien que quiera reproducir o auditar un pipeline de ajuste eficiente orientado a traducción multilingüe, es un artefacto de partida útil, pero no está pensado para uso directo en producción sin continuar el entrenamiento con el adaptador de SFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal denso (Gemma 3 4B IT, con codificador visual) |
| Parametros totales | 4 000 millones en el modelo base Gemma 3 4B; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; se hereda la ventana del modelo base `google/gemma-3-4b-it` |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos de adaptador sin cuantizar en safetensors |
| Idiomas soportados | Persa (fa), ingles (en), arabe (ar), chino (zh), hebreo (he), espanol (es) |
| Licencia | `gemma` (terminos de Gemma; los pesos del modelo base no se relicencian) |
| Formato de pesos | Safetensors (adaptador LoRA) + procesador |
| Libreria | PEFT |
| Modelo base | `google/gemma-3-4b-it` |
| Tamano del repositorio | 1,0 GB |
| Pipeline declarado | `image-text-to-text` |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B en su variante instruction-tuned, un transformer denso de 4 000 millones de parámetros con soporte de entrada de imagen y texto (la model card enlaza el informe técnico de Gemma 3, arXiv:2503.19786). Sobre esa base se aplica una adaptación de bajo rango (LoRA, arXiv:2106.09685) que entrena un conjunto reducido de matrices de proyección. El rango, el alpha, el dropout y la lista exacta de módulos objetivo no se reproducen en la model card: el autor indica que esos valores están en `release_stats.json` y que ese fichero prevalece sobre cualquier YAML cercano que pueda haber cambiado.

Este repositorio concreto contiene el adaptador de la fase 1, entrenado dentro del linaje final de HexaBee. Según la documentación, el adaptador PT se continúa durante el SFT multilingüe y el adaptador de traducción se inicializa desde cero tras una fusión intermedia. Los datos asociados al linaje incluyen un corpus de Wikipedia (dataset HexaBee-Wikipedia-PT), un conjunto de respuesta multilingüe y traducción (HexaBee-Multilingual-SFT) y un conjunto de traducción bidireccional. La model card menciona explícitamente el uso de datos sintéticos y de jueces basados en modelo, además de truncado de entradas COMET largas en el límite del codificador. No se documentan técnicas como decodificación especulativa, atención lineal o modos de pensamiento explícitos.

## Capacidades

- Generación de texto conversacional multilingüe en los seis idiomas declarados (fa, en, ar, zh, he, es), heredada del modelo base instruction-tuned.
- Traducción: el linaje HexaBee está orientado a traducción con supervisión bidireccional; este adaptador es la fase PT de ese pipeline, no el adaptador de traducción final.
- Entrada multimodal (imagen y texto), coherente con la etiqueta `image-text-to-text` heredada de Gemma 3 4B IT. La model card no detalla el alcance de las capacidades visuales tras el ajuste LoRA.
- Soporte de tool calling / function calling: no documentado en la model card para este adaptador.
- Comportamiento agéntico y razonamiento multi-paso: no documentado en la model card para este adaptador.
- Capacidad especial de «thinking mode», audio o visión detallada: no disponible en la información proporcionada.
- Formato de distribución orientado a investigación: adaptador PEFT cargable con `PeftModel.from_pretrained` sobre el modelo base exacto.

## Casos de uso

- Reproducción de pipelines de ajuste eficiente: el repositorio permite cargar el adaptador sobre `google/gemma-3-4b-it` y auditar la fase PT de un pipeline LoRA documentado por fases, con manifiesto de ficheros y hashes.
- Investigación en traducción multilingüe de bajo recurso: serve como punto de partida para estudiar cómo se comporta un adaptador PT sobre pares que incluyen persa, hebreo y árabe antes de aplicar el SFT específico de traducción.
- Traducción de contenido enciclopédico: el corpus de la fase PT está vinculado a Wikipedia, por lo que el escenario natural de evaluación son artículos enciclopédicos, no texto coloquial ni dominios muy técnicos.
- Construcción de asistentes multilingües para seis mercados: partiendo del adaptador multilingüe base y continuando con el adaptador de SFT, se puede desplegar un asistente conversacional que cubra fa/en/ar/zh/he/es con una única base de 4B.
- Flujos de soporte con capturas de pantalla: al heredar la entrada imagen-texto de Gemma 3 4B IT, el pipeline puede recibir capturas o imágenes adjuntas en tickets multilingües, siempre que se valide el comportamiento visual tras el ajuste.
- Generación de documentación técnica localizada: traducción asistida de manuales y notas de release entre los seis idiomas, con revisión humana obligatoria por el riesgo de alucinación del adaptador en fase PT.
- Evaluación y comparación de métricas de traducción: el linaje incluye un repositorio de evaluación (HexaBee-Evaluation) y usa COMET como métrica; este adaptador permite fijar la línea base de la fase PT frente a las fases posteriores.
- Experimentos de ablación y estudio de olvido catastrófico: al existir adaptadores separados por fase (PT, SFT multilingüe, traducción), se pueden medir pérdidas de capacidad generalista al especializar en traducción.

En todos estos casos debe tenerse en cuenta que el artefacto es un adaptador intermedio: para uso práctico hay que aplicar el adaptador de SFT correspondiente, y la model card advierte de no aplicar el adaptador PT una segunda vez sobre un adaptador ya continuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona el uso de COMET como métrica de traducción, el truncado de entradas largas en el límite del codificador y la existencia de un repositorio independiente de evaluación con recuentos de muestras, parámetros e intervalos de incertidumbre, pero no reproduce cifras. Tampoco se ofrecen resultados de MMLU, HumanEval, GSM8K ni de pares de traducción concretos. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas de un modelo base de 4B, no cifras publicadas por el autor): en bfloat16, en torno a 8-9 GB solo para los pesos del modelo base, más el adaptador y las activaciones; en la práctica, 12-16 GB de VRAM para una inferencia cómoda con contexto moderado.
- Cuantización: al no distribuirse versiones cuantizadas del adaptador, habría que fusionar el adaptador con la base y convertir a GGUF o AWQ/GPTQ para reducir huella; no hay recetas publicadas en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y evaluación masiva; RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S para inferencia y ajuste ligero en una sola GPU.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 sin problema; en tarjetas de 10-12 GB (RTX 3080, RTX 4070) requiere cuantización a 8 o 4 bits o contexto reducido.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card, con `AutoModelForImageTextToText` y `AutoProcessor`); vLLM con soporte LoRA y TGI para servicio con múltiples adaptadores son compatibles en principio si se fusiona o se sirve el adaptador, aunque no están documentados por el autor. llama.cpp y Ollama requerirían fusión previa del adaptador y conversión a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| HexaBee-4B-PT-LoRA (este) | 4B (base) + adaptador LoRA | No disponible | fa, en, ar, zh, he, es | gemma | Safetensors (PEFT) | Fase PT de un pipeline; requiere continuar el entrenamiento |
| google/gemma-3-4b-it | 4B | Ventana declarada por Google para Gemma 3 4B | Multilingue amplio (segun Google) | gemma | Safetensors | Modelo base sin adaptar; referencia obligatoria de comparacion |
| Iman998/HexaBee-4B-Translation-LoRA | 4B (base) + adaptador | No disponible | fa, en, ar, zh, he, es | gemma | Safetensors (PEFT) | Adaptador de traduccion del mismo linaje, inicializado tras la fusion intermedia |
| Iman998/HexaBee-4B-Multilingual-SFT-LoRA | 4B (base) + adaptador | No disponible | fa, en, ar, zh, he, es | gemma | Safetensors (PEFT) | Adaptador de SFT multilingue; es el que continua el adaptador PT de este repositorio |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, licencia, idiomas y rol dentro del pipeline.

## Limitaciones y advertencias

- Es un adaptador de fase 1, no un modelo final. La model card indica que el adaptador PT se continúa durante el SFT multilingüe y que no debe aplicarse una segunda vez sobre un adaptador ya continuado.
- Los repositorios son releases de artefactos históricos; el propio autor aclara que renombrar (PCT-4B a HexaBee-4B) no implica reentrenamiento y que esto no constituye evidencia de aceptación en ningún workshop ni de posición en una tarea compartida.
- Datos de entrenamiento con componente sintético y evaluación con jueces basados en modelo: ambas cosas limitan la interpretación de los resultados.
- Riesgo de alucinación y de texto generado imperfecto: la model card advierte de exportaciones históricas con cadenas vacías, texto generado imperfecto y conflictos de instrucciones.
- Sesgos: no documentados explícitamente, pero el corpus de base es Wikipedia y datos sintéticos, con la cobertura y los sesgos propios de esas fuentes. Los idiomas fa, he y ar suelen estar peor representados, lo que puede traducirse en calidad desigual entre direcciones.
- Sin ablación que aísle la contribución de la respuesta multilingüe: la receta se evaluó completa, por lo que no se puede atribuir el rendimiento a componentes concretos.
- Limitación de evaluación en traducción: las entradas largas de COMET se truncan en el límite del codificador, lo que infravAlora casos de contexto extenso.
- Reutilización de filas de origen: la model card subraya que reutilizar filas de origen no es evidencia independiente, y que los recuentos históricos de filas no equivalen a artículos únicos.
- Licencia: los pesos quedan bajo los términos de Gemma, que imponen condiciones de uso (incluidas restricciones y obligaciones de atribución) para uso comercial. Los términos de los datasets y servicios de origen no quedan sustituidos por la licencia del repositorio.
- Adopción nula hasta la fecha: 0 descargas y 0 likes, sin validación externa conocida.
- La información disponible no incluye resultados de benchmarks ni datos de latencia, por lo que no es posible estimar su rendimiento frente a alternativas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Iman998/HexaBee-4B-PT-LoRA
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- HexaBee-4B: https://huggingface.co/Iman998/HexaBee-4B
- HexaBee · Multilingual Base: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-Base
- HexaBee · Multilingual SFT LoRA: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-SFT-LoRA
- HexaBee · Translation LoRA: https://huggingface.co/Iman998/HexaBee-4B-Translation-LoRA
- Dataset HexaBee · Wikipedia Foundations: https://huggingface.co/datasets/Iman998/HexaBee-Wikipedia-PT
- Dataset HexaBee · Multilingual Answering & Translation: https://huggingface.co/datasets/Iman998/HexaBee-Multilingual-SFT
- Dataset HexaBee · Bidirectional Translation: https://huggingface.co/datasets/Iman998/HexaBee-Bidirectional-Translation
- Dataset HexaBee · The Prompt Hive: https://huggingface.co/datasets/Iman998/HexaBee-System-Prompts
- Dataset HexaBee · Translation Archive: https://huggingface.co/datasets/Iman998/HexaBee-Model-Outputs
- Dataset HexaBee · Evaluation Atlas: https://huggingface.co/datasets/Iman998/HexaBee-Evaluation
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Articulo original de LoRA: https://arxiv.org/abs/2106.09685
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian a listados de una direccion postal en Barcelona.
