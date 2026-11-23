# quxiaoqiya/ChemRoute-20260817

## Resumen

ChemRoute-20260817 es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen3-VL-4B-Instruct, desarrollado por el usuario quxiaoqiya. Su función no es la generación de texto libre, sino la extracción estructurada de información a partir de figuras científicas y sus pies de figura en el ámbito de la química y la ciencia de materiales. El adaptador devuelve un objeto JSON compacto con campos como relevancia y tipo de figura, estructura de paneles, fuentes de evidencia, objetivos de extracción, indicadores de calidad y, opcionalmente, cajas delimitadoras de regiones.

Se trata de un artefacto muy específico y de alcance reducido: no es un modelo autónomo, sino un delta de pesos que requiere el modelo base Qwen3-VL-4B-Instruct (revisión fijada `ebb281ec70b05090aa6165b016eac8ec08e71b17`) y sus dependencias. El adaptador seleccionado corresponde al checkpoint `formal-lr1e-4-seed42::checkpoint-30`, entrenado sobre un conjunto de desarrollo congelado de 115 ejemplos derivados de anotación humana y validado con 16 ejemplos separados por familia de artículos.

La relevancia de esta ficha es acotada pero clara para quien trabaje en pipelines de extracción de datos científicos: ofrece un contrato de tarea congelado (prompt y esquema JSON incluidos en el repositorio) que permite integrar el análisis de figuras en flujos automatizados, siempre con validación posterior. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente publicados o que el artefacto es de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-4B-Instruct; no especificada en la información) |
| Tipos de cuantizacion | no disponible (el ejemplo de carga usa `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT/LoRA |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT sobre Qwen3-VL-4B-Instruct, un modelo multimodal de tipo image-text-to-text. No se documenta en la información disponible el rango del LoRA, las capas objetivo ni el número de parámetros entrenables. El adaptador seleccionado es `formal-lr1e-4-seed42::checkpoint-30`, lo que indica una tasa de aprendizaje de 1e-4, semilla 42 y selección en el checkpoint 30; no se detallan el número total de pasos, el tamaño de lote ni la composición exacta del dataset más allá de su origen en anotación humana.

El conjunto de desarrollo congelado contenía 115 ejemplos de figuras con anotación humana y el de validación 16 ejemplos, separados por familia de artículos para evitar filtración entre splits. La selección del modelo se hizo sobre el conjunto de validación. Se menciona que un candidato adicional entrenado con un "annotation delta" fue rechazado para promoción y no está representado por este adaptador. No se documentan técnicas de RLHF, DPO ni decodificación especulativa; el interés técnico reside en el contrato de salida estructurada (JSON con esquema fijo) y en el uso de coordenadas enteras de 0 a 1000 con origen en la esquina superior izquierda para las cajas delimitadoras.

## Capacidades

- Análisis de figuras científicas y sus pies de figura en química y ciencia de materiales.
- Predicción de un objeto JSON compacto con relevancia y tipo de figura.
- Detección de estructura de paneles dentro de una figura compuesta.
- Identificación de fuentes de evidencia y objetivos de extracción.
- Emisión de indicadores de calidad (quality flags) sobre la figura analizada.
- Generación opcional de cajas delimitadoras de regiones en coordenadas enteras 0-1000.
- Entrada multimodal image-text-to-text (imagen más pie de figura) mediante la plantilla de chat del procesador de Qwen3-VL.
- No se documentan capacidades de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Extracción estructurada en pipelines de literatura científica: el adaptador recibe una figura y su pie y devuelve JSON con tipo de figura, paneles y objetivos de extracción, lo que permite indexar figuras en bases de datos de química y materiales sin intervención manual, validando después el esquema.
- Curaduría de figuras para repositorios de datos: uso de los campos de relevancia y quality flags para filtrar figuras no informativas o de baja calidad antes de incluirlas en un corpus anotado.
- Enrutamiento de figuras a extractores especializados: la clasificación de tipo de figura y estructura de paneles permite decidir qué extractor downstream (tablas, espectros, diagramas de fases) debe procesar cada región.
- Localización de regiones de interés: las cajas delimitadoras en coordenadas 0-1000 permiten recortar paneles concretos para su posterior análisis por visión o por OCR, revisando siempre las coordenadas contra la figura original.
- Asistencia a revisores y documentalistas: generación de una primera propuesta de metadatos de figura que un humano valida, reduciendo el tiempo de anotación en flujos de revisión por pares o de catalogación.
- Prototipado de servicios de análisis de figuras: al incluirse el prompt congelado y el esquema JSON en el repositorio, sirve como base reproducible para construir y comparar servicios de figure-analysis en dominios científicos acotados.
- Control de calidad de anotaciones existentes: comparación del JSON generado con anotaciones humanas previas para detectar discrepancias en tipo de figura o paneles, con revisión manual de las mismas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de evaluación interna del adaptador, no comparables con benchmarks estándar:

| Metrica | Resultado | Conjunto |
|---|---|---|
| Tasa de parseo JSON | 1.0 | 40 ejemplos de entrada ciega |
| Tasa de validez de esquema | 0.675 | 40 ejemplos de entrada ciega |
| Precision de tarea ciega | no calculada (sin respuestas de referencia en el host de entrenamiento) | 40 ejemplos de entrada ciega |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor advierte que estos resultados proceden de un conjunto de datos pequeño y no establecen rendimiento en nuevos dominios científicos o publicaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Qwen3-VL-4B-Instruct en bfloat16 más el adaptador LoRA, que añade una sobrecarga pequeña.
- El ejemplo de carga usa `torch_dtype=torch.bfloat16` y `device_map="auto"`, por lo que se recomienda una GPU con memoria suficiente para el modelo base de 4B en bfloat16; no se documenta una estimación concreta.
- GPU recomendadas: no disponibles en la información; el modelo base de 4B es compatible con GPUs de consumo de gama alta, pero el requisito exacto debe verificarse en el entorno objetivo, tal como indica el autor.
- Cabe en GPU de consumo: probablemente sí para el modelo base de 4B en bfloat16 o cuantizado, pero no se confirma en la documentación.
- Opciones de despliegue: carga mediante `transformers` (clase `Qwen3VLForConditionalGeneration`), `peft` (`PeftModel`) y `accelerate`; el repositorio incluye `infer.py` para inferencia de una sola imagen. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Entorno de referencia reportado: PyTorch 2.6.0+cu124, Transformers 4.57.1, PEFT 0.17.1, Accelerate 1.7.0, Pillow 11.3.0 y huggingface-hub 0.36.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el adaptador se apoya en Qwen3-VL-4B-Instruct, pero no se han publicado datos que permitan comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ChemRoute-20260817 (adaptador LoRA) | no disponible (base 4B) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere Qwen3-VL-4B-Instruct y sus dependencias, y el uso del modelo base está sujeto a su propia licencia.
- El autor advierte explícitamente de que la salida estructurada puede ser inválida o incorrecta; debe validarse el esquema JSON y revisarse las conclusiones científicas y las cajas delimitadoras contra la figura original.
- No debe tratarse como fuente de hechos experimentales verificados.
- Los resultados de evaluación proceden de un conjunto pequeño (115 ejemplos de desarrollo, 16 de validación, 40 de prueba ciega) y no establecen rendimiento en nuevos dominios científicos o publicaciones.
- La tasa de validez de esquema en la prueba ciega fue de 0.675, lo que implica que aproximadamente un tercio de las salidas no cumplieron el esquema en esa muestra.
- No se calculó la precisión de tarea ciega por falta de respuestas de referencia en el host de entrenamiento.
- No se documentan sesgos conocidos, cobertura de idiomas ni comportamiento fuera del dominio de química y ciencia de materiales.
- El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente publicados o que el artefacto no es directamente utilizable sin verificación adicional.
- El código de carga del README no ha sido validado de forma independiente contra una copia recién descargada del Hub, según indica el propio autor.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base y verificarse la procedencia de los datos de entrenamiento.
- El hash SHA-256 del archivo de pesos del adaptador figura en la sección de procedencia (`a131177092aab1475fbc80ed83171db3315e0e470fe968dd75b27621c33f9065`); el valor de los registros de evaluación originales es un digest del árbol de checkpoints, no del archivo `adapter_model.safetensors`.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/quxiaoqiya/ChemRoute-20260817
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
