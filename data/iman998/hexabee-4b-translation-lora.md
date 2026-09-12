# Iman998/HexaBee-4B-Translation-LoRA

## Resumen

HexaBee · Translation LoRA es un adaptador LoRA (PEFT) publicado por el usuario Iman998 como fase 3 de la linaje de entrenamiento HexaBee-4B. No es un modelo completo: se carga sobre el modelo base Iman998/HexaBee-4B-Multilingual-Base, que pertenece a la familia Gemma 3 según la propia model card. Su función declarada es la traducción multilingüe entre seis idiomas: persa (fa), inglés (en), árabe (ar), chino (zh), hebreo (he) y español (es). El repositorio ocupa 1,0 GB e incluye únicamente los pesos del adaptador en safetensors, la configuración normalizada, el tokenizer/procesador y estadísticas de entrenamiento y evaluación.

El adaptador se inicializa desde cero tras una fusión intermedia: el adaptador de preentrenamiento (PT) se continúa durante el SFT multilingüe, mientras que el adaptador de traducción se entrena aparte sobre el modelo ya fusionado. La model card insiste en que debe cargarse sobre el modelo base exacto indicado y en que no debe aplicarse de nuevo el adaptador PT. El pipeline declarado en HuggingFace es image-text-to-text, coherente con el carácter multimodal de la familia Gemma 3, aunque la documentación no detalla tareas de visión concretas para este adaptador.

Su relevancia es acotada y de tipo investigación: se presenta como un artefacto histórico auditado de una linea de trabajo centrada en traducción de seis idiomas con datos sintéticos, no como un modelo de producción validado. Tiene 0 descargas y 0 likes, no publica resultados numéricos de benchmarks y su evaluación se apoya en referencias sintéticas y jueces basados en modelo, lo que limita la interpretación de cualquier métrica. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 3; este artefacto es un adaptador LoRA sobre Iman998/HexaBee-4B-Multilingual-Base |
| Parametros totales | no disponible en la model card; el modelo base se denomina HexaBee-4B (del orden de 4.000 millones de parametros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; una cuantizacion posterior depende del modelo base fusionado) |
| Idiomas soportados | persa (fa), ingles (en), arabe (ar), chino (zh), hebreo (he), espanol (es) |
| Licencia | Gemma (los pesos quedan bajo los terminos de Gemma; ver LICENSE.md del repositorio) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) mas tokenizer/procesador |
| Modelo base | Iman998/HexaBee-4B-Multilingual-Base |
| Libreria | peft |
| Pipeline declarado | image-text-to-text |
| Rango, alpha y dropout del LoRA | no disponibles en la model card; se indican como registrados en release_stats.json |
| Tamano del repositorio | 1,0 GB |
| Idiomas de la model card | fa, en, ar, zh, he, es |
| Referencias arXiv citadas | arXiv:2503.19786 y arXiv:2106.09685 (esta ultima corresponde al articulo original de LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en un transformer multimodal de la familia Gemma 3 y se entrena mediante LoRA (arXiv:2106.09685), la tecnica de adaptacion de bajo rango que congela los pesos del modelo base e inserta matrices de bajo rango en un subconjunto de modulos objetivo. La model card no especifica el rango, el alpha, el dropout ni el inventario exacto de modulos objetivo; indica que esos valores están registrados en `release_stats.json` y que dicho fichero prevalece sobre un YAML cercano que podría haber cambiado. El repositorio contiene el adaptador guardado de la fase 3 del linaje final de HexaBee, junto con el procesador y estadísticas de entrenamiento y evaluación; se excluyen el estado del optimizador, los argumentos de entrenamiento serializados y checkpoints no relacionados.

En cuanto a los datos, se declara el uso de datos sintéticos y de referencias generadas, dentro de un linaje que incluye un adaptador de preentrenamiento sobre corpus tipo Wikipedia (HexaBee-Wikipedia-PT) y un adaptador de SFT multilingüe (HexaBee-4B-Multilingual-SFT-LoRA). La receta completa de adaptación fue evaluada, pero no existe una ablación emparejada que aísle la contribución del respuesta multilingüe. La evaluación emplea referencias sintéticas y jueces basados en modelo, y la propia model card advierte que las entradas largas de COMET se truncan en el límite del codificador. No se documentan número de tokens de entrenamiento, composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción multilingüe entre los seis idiomas declarados: persa, inglés, árabe, chino, hebreo y español, en el marco del linaje de traducción bidireccional de HexaBee.
- Generación de texto conversacional, en tanto que el artefacto es un adaptador sobre un modelo de instrucciones multilingüe y conversacional.
- Procesamiento de entradas de imagen y texto según el pipeline declarado (image-text-to-text), heredado del modelo base de la familia Gemma 3; la model card no detalla qué tareas de visión cubre el adaptador.
- Soporte multilingüe limitado a los seis idiomas listados; no se declaran otros.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explícito (thinking mode), audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Traducción bidireccional en atención al cliente multilingüe: el adaptador puede insertarse en un pipeline que traduzca mensajes entrantes de clientes en persa, árabe, hebreo o chino hacia inglés o español y devuelva la respuesta en el idioma original, reduciendo la necesidad de agentes humanos por idioma. Requiere evaluación previa propia, porque no hay benchmarks publicados.
- Localización de documentación técnica: traducción de manuales y notas de release entre los seis idiomas soportados, con revisión humana posterior. El perfil del adaptador (entrenado sobre datos sintéticos y corpus tipo Wikipedia) encaja mejor con prosa descriptiva que con terminología muy especializada.
- Preprocesado de corpus para investigación: generación de traducciones automáticas de conjuntos de datos en idiomas de recursos limitados como el persa o el hebreo, para su uso como preentrenamiento o aumento de datos, siempre que se documente la procedencia sintética de las traducciones.
- Traducción asistida de contenido editorial: artículos, guiones y material de marketing entre los seis idiomas, con un traductor humano en el bucle. La ventana de contexto no está documentada, por lo que los documentos largos deberían segmentarse.
- Investigación académica en traducción de bajos recursos: el repositorio se publica explícitamente como artefacto de investigación con linaje auditable (adaptadores por fase, inventarios de prompts, archivos de salidas y atlas de evaluación), lo que permite reproducir y comparar variantes dentro de la propia familia HexaBee.
- Integración experimental en pipelines de e-commerce: traducción de fichas de producto y descripciones entre los seis idiomas como paso previo a la revisión humana, aprovechando que el adaptador se carga sobre un base de 4B que cabe en GPUs de gama alta de consumo.
- Evaluación comparativa de adaptadores LoRA: al existir adaptadores hermanos por fase (PT, SFT multilingüe y traducción), sirve como pieza para estudiar el efecto de cada etapa de entrenamiento sobre la calidad de traducción, teniendo en cuenta la ausencia de ablaciones emparejadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de métricas basadas en COMET, con referencias sintéticas y jueces basados en modelo, y advierte que las entradas largas de COMET se truncan en el límite del codificador, pero no incluye cifras. Tampoco se publican resultados de MMLU, HumanEval, GSM8K ni de pares de traducción concretos. Los repositorios asociados (en particular HexaBee-Evaluation) se citan como fuente para recuentos de muestras, parámetros, direcciones de traducción e intervalos de incertidumbre.

## Requisitos de hardware

- VRAM estimada para inferencia (valores calculados a partir de un modelo base de ~4.000 millones de parámetros, no publicados por el autor): en bf16/fp16 en torno a 8-10 GB solo para pesos, más caché KV y activaciones; en cuantización de 8 bits, aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB. Son estimaciones, no cifras verificadas.
- GPU recomendadas: A100, H100 o L40S para servicio con concurrencia; RTX 4090 o RTX 3090 (24 GB) para desarrollo e inferencia en precisión completa dentro de una sola tarjeta.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090, RTX 4080 (16 GB) y equivalentes; en tarjetas de 8-12 GB probablemente solo con cuantización de 4 u 8 bits, según el modelo base fusionado.
- Opciones de despliegue: transformers + peft (ruta documentada en la model card), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama tras fusionar el adaptador en el modelo base y convertirlo a GGUF. El repositorio solo distribuye el adaptador, no pesos fusionados ni GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.
- Nota operativa: cargar el adaptador sobre `Iman998/HexaBee-4B-Multilingual-Base` y no volver a aplicar el adaptador PT; la model card es explícita en este punto.

## Comparativa con modelos similares

El ecosistema publica varios artefactos de la misma familia, lo que permite una comparación directa dentro del linaje. Los datos de alternativas externas no están disponibles en la información proporcionada.

| Modelo | Tipo | Fase | Idiomas declarados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexaBee · Translation LoRA (este) | Adaptador LoRA sobre HexaBee-4B-Multilingual-Base | Fase 3, traducción | fa, en, ar, zh, he, es | Gemma | HuggingFace, 1,0 GB, 0 descargas |
| HexaBee-4B-Multilingual-Base | Modelo base | Base | No detallado en la información disponible | Gemma | HuggingFace |
| HexaBee-4B-PT-LoRA | Adaptador LoRA | Preentrenamiento sobre Wikipedia PT | No detallado en la información disponible | Gemma | HuggingFace |
| HexaBee-4B-Multilingual-SFT-LoRA | Adaptador LoRA | SFT multilingüe | No detallado en la información disponible | Gemma | HuggingFace |

Frente a alternativas externas de traducción multilingüe (por ejemplo, modelos de traducción dedicados o LLM multilingües de tamaño similar), no se dispone de parámetros, contexto, rendimiento ni licencia verificados en la información proporcionada, por lo que no se incluye comparación numérica.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos: las referencias y parte de los datos son generados, lo que puede introducir artefactos y sesgos sistemáticos difíciles de detectar sin evaluación externa.
- Jueces basados en modelo: la evaluación se apoya en modelos como evaluadores, lo que limita la interpretación de los resultados y no equivale a evaluación humana.
- Truncamiento en COMET: las entradas largas se truncan en el límite del codificador, de modo que el rendimiento en segmentos largos puede estar mal caracterizado.
- Conflictos de instrucciones y texto imperfecto: la model card advierte de posibles cadenas vacías en las exportaciones históricas, texto generado imperfecto y conflictos entre instrucciones.
- Reutilización de filas de origen: la reutilización de filas del corpus no constituye evidencia independiente; los recuentos históricos de filas no equivalen a artículos únicos.
- Sin ablación emparejada: la contribución específica del respuesta multilingüe no está aislada experimentalmente.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; en traducción puede manifestarse como adiciones, omisiones o invenciones de contenido, especialmente fuera de los seis idiomas declarados.
- Cobertura de idiomas restringida a fa, en, ar, zh, he y es; no se declara soporte de otras lenguas ni variantes dialectales.
- Longitud de contexto no documentada, lo que impide garantizar el comportamiento en documentos largos o conversaciones extensas.
- Licencia Gemma: los pesos están sujetos a los términos de Gemma, con las obligaciones y restricciones de uso que ello implica; la licencia de software del repositorio no sustituye los términos de Gemma ni los de los conjuntos de datos y servicios de origen. Verificar antes de cualquier uso comercial.
- Carga incorrecta del adaptador: aplicar de nuevo el adaptador PT o cargar sobre un base distinto de `Iman998/HexaBee-4B-Multilingual-Base` produce resultados no válidos.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de calidad ni de robustez.
- Es un artefacto de investigación, no un modelo de producción: la propia model card aclara que el renombrado de PCT-4B a HexaBee no implica reentrenamiento y que el repositorio no constituye evidencia de aceptación en un taller ni de posición en una competición oficial.
- Inconsistencia a revisar: el pipeline declarado es image-text-to-text, pero la model card no documenta tareas de visión ni evaluación multimodal para este adaptador.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Iman998/HexaBee-4B-Translation-LoRA
- Modelo base: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-Base
- Familia HexaBee-4B: https://huggingface.co/Iman998/HexaBee-4B
- HexaBee · Wikipedia PT LoRA: https://huggingface.co/Iman998/HexaBee-4B-PT-LoRA
- HexaBee · Multilingual SFT LoRA: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-SFT-LoRA
- Dataset HexaBee · Wikipedia Foundations: https://huggingface.co/datasets/Iman998/HexaBee-Wikipedia-PT
- Dataset HexaBee · Multilingual Answering & Translation: https://huggingface.co/datasets/Iman998/HexaBee-Multilingual-SFT
- Dataset HexaBee · Bidirectional Translation: https://huggingface.co/datasets/Iman998/HexaBee-Bidirectional-Translation
- Dataset HexaBee · The Prompt Hive: https://huggingface.co/datasets/Iman998/HexaBee-System-Prompts
- Dataset HexaBee · Translation Archive: https://huggingface.co/datasets/Iman998/HexaBee-Model-Outputs
- Dataset HexaBee · Evaluation Atlas: https://huggingface.co/datasets/Iman998/HexaBee-Evaluation
- Licencia del repositorio: LICENSE.md dentro de https://huggingface.co/Iman998/HexaBee-4B-Translation-LoRA
- Articulo de LoRA: https://arxiv.org/abs/2106.09685
- Referencia citada en los tags: https://arxiv.org/abs/2503.19786
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (devuelven unicamente paginas de Microsoft), por lo que no se anaden mas enlaces.
