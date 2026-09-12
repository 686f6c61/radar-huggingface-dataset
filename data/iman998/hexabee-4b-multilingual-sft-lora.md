# Iman998/HexaBee-4B-Multilingual-SFT-LoRA

## Resumen

HexaBee-4B-Multilingual-SFT-LoRA es un adaptador LoRA (PEFT) publicado por el usuario Iman998 sobre el modelo base google/gemma-3-4b-it. Corresponde a la fase 2 de la linaje de entrenamiento HexaBee-4B, antiguamente etiquetado como PCT-4B en la auditoría local de evaluación: durante el SFT multilingüe se continúa el adaptador de preentrenamiento (PT) y, tras la fusión intermedia, se inicializa desde cero el adaptador de traducción.

El artefacto resuelve el ajuste de un modelo multimodal pequeño (categoría 4B) para tareas de traducción y respuesta multilingüe en seis idiomas: persa, inglés, árabe, chino, hebreo y español. Se distribuye únicamente como pesos de adaptador (safetensors más processor), no como modelo completo, y requiere cargarse exactamente sobre google/gemma-3-4b-it.

Su relevancia es doble: por un lado, ejemplifica un flujo de adaptación por fases (PT seguido de SFT) sobre una base abierta tipo Gemma 3 con pipeline image-text-to-text; por otro, es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, licencia Gemma y documentación que remite a un repositorio de evaluación independiente para los números exactos. La model card advierte explícitamente de que se trata de una liberación de artefactos históricos y no de un resultado de competición o de aceptación en un taller.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre google/gemma-3-4b-it, transformer multimodal con pipeline image-text-to-text |
| Parametros totales | Modelo base de la familia 4B (Gemma 3 4B); el adaptador LoRA es una fracción del total, con rango no especificado en la información disponible. Tamaño del repositorio: 1,0 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no se declara en la model card) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; la cuantización dependería del modelo base sobre el que se cargue |
| Idiomas soportados | Persa (fa), inglés (en), árabe (ar), chino (zh), hebreo (he) y español (es) |
| Licencia | Gemma |
| Formato de pesos | Safetensors (pesos de adaptador) más processor y tokenizer |
| Libreria | peft |
| Modelo base | google/gemma-3-4b-it |
| Fecha de publicacion | Creado el 2026-09-12, actualizado el 2026-09-12 |
| Fase del linaje | Fase 2 (Multilingual SFT LoRA) |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo, sino un adaptador LoRA guardado con la librería PEFT sobre google/gemma-3-4b-it, un transformer multimodal de la familia Gemma 3 con pipeline image-text-to-text. La receta descrita en la model card distingue tres piezas: un adaptador PT (preentrenamiento) que se continúa durante el SFT multilingüe, un adaptador de traducción que se inicializa de nuevo tras la fusión intermedia, y el adaptador resultante que aquí se publica. El rango, alpha, dropout e inventario exacto de módulos objetivo están registrados en release_stats.json y prevalecen sobre cualquier YAML cercano que haya podido cambiar.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí menciona que se usaron datos sintéticos y referencias generadas por modelos, con conjuntos de datos asociados (HexaBee Wikipedia PT, HexaBee Multilingual SFT, HexaBee Bidirectional Translation y HexaBee System Prompts). La evaluación declarada emplea métricas tipo COMET, con truncado de las entradas largas en el límite del codificador, y se remite a un repositorio independiente de evaluación para los recuentos de muestras, parámetros, direcciones y estimaciones de incertidumbre. Las referencias bibliográficas citadas en las etiquetas son el informe técnico de Gemma 3 (arXiv:2503.19786) y el artículo original de LoRA (arXiv:2106.09685).

## Capacidades

- Traducción multilingüe y traducción bidireccional entre los seis idiomas declarados (fa, en, ar, zh, he, es), según el propósito del linaje HexaBee.
- Respuesta multilingüe: la propia model card indica que la receta completa se evaluó para "multilingual answering", aunque no hay una ablación emparejada que aísle su contribución.
- Generación de texto conversacional: el tag conversational y el formato de chat del modelo base están presentes.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text y el ejemplo de carga usa AutoModelForImageTextToText, por lo que hereda la capacidad multimodal de Gemma 3 4B.
- Instrucciones por system prompt: el linaje incluye un dataset específico de prompts de sistema (HexaBee System Prompts).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Traducción bidireccional en producción: integrado en un servicio de traducción entre español, inglés, árabe, chino, hebreo y persa, cargando el adaptador sobre Gemma 3 4B y sirviendo peticiones por lotes con vLLM o TGI.
- Localización de documentación técnica: traducción de manuales y fichas de producto manteniendo terminología consistente mediante system prompts específicos por dominio, aprovechando el dataset de prompts de sistema del linaje.
- Atención al cliente multilingüe: gestión de conversaciones multi-turno en los seis idiomas soportados, con respuesta en el idioma del usuario y escalado a un modelo mayor cuando la consulta exceda las capacidades del adaptador.
- Pretraducción asistida por traductor humano: generación de borradores de traducción que un revisor humano post-edita, con la ventaja de que la evaluación declarada usa métricas automáticas tipo COMET y permite priorizar segmentos de baja confianza.
- Investigación en adaptación por fases: reproducción del flujo PT seguido de SFT y del reinicio del adaptador de traducción tras la fusión intermedia, usando los repositorios de datos y evaluación del propio autor para comparar variantes.
- Extracción y respuesta sobre documentos multilingües con componente visual: al heredar el pipeline image-text-to-text de Gemma 3 4B, puede emplearse para responder preguntas sobre capturas, formularios escaneados o diagramas con texto en varios idiomas.
- Clasificación y enrutado lingüístico: dado su soporte de seis idiomas, puede utilizarse como primer escalón para detectar el idioma de entrada y decidir a qué modelo o cola derivar la petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona evaluación con métricas tipo COMET y advierte de que las entradas largas de COMET se truncan en el límite del codificador, pero no incluye cifras. También señala que no existe una ablación emparejada que aísle la contribución del "multilingual answering", que las referencias son sintéticas y que los jueces son modelos, lo que limita la interpretación. Los recuentos exactos de muestras, parámetros, direcciones y estimaciones de incertidumbre se remiten al repositorio HexaBee-Evaluation, no incluido en la información proporcionada.

## Requisitos de hardware

- Los valores siguientes son estimaciones derivadas del tamaño del modelo base (familia 4B) y no cifras declaradas por el autor; el repositorio del adaptador ocupa 1,0 GB.
- Inferencia en bf16/fp16: en torno a 8-10 GB de VRAM para el modelo base más el adaptador y el procesador de imagen.
- Inferencia cuantizada a int8: aproximadamente 5-6 GB de VRAM.
- Inferencia cuantizada a int4 (GGUF Q4, AWQ o GPTQ sobre el base): aproximadamente 3-4 GB de VRAM.
- GPU consumer: cabe en tarjetas con 8-12 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090, siempre que se cuantice si la VRAM es ajustada.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o L4 para despliegues concurrentes en bf16.
- Opciones de despliegue: vLLM o TGI con el modelo base más el adaptador fusionado; llama.cpp u Ollama requieren convertir el base a GGUF y aplicar el adaptador, ya que el formato publicado es safetensors de PEFT.
- Latencia y throughput estimados: no disponibles; el autor no publica cifras de latencia ni de tokens por segundo.
- Nota operativa: hay que cargar el adaptador sobre google/gemma-3-4b-it y no aplicar el adaptador PT una segunda vez, según advierte la model card.

## Comparativa con modelos similares

| Modelo | Rol en el linaje | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| HexaBee-4B-Multilingual-SFT-LoRA | Fase 2, adaptador SFT multilingüe | Base 4B más adaptador | No disponible | Gemma | No publicados |
| HexaBee-4B-PT-LoRA | Adaptador de preentrenamiento con Wikipedia | Base 4B más adaptador | No disponible | Gemma | No publicados |
| HexaBee-4B-Translation-LoRA | Adaptador específico de traducción | Base 4B más adaptador | No disponible | Gemma | No publicados |
| HexaBee-4B-Multilingual-Base | Base multilingüe del linaje | Base 4B | No disponible | Gemma | No publicados |
| google/gemma-3-4b-it | Modelo base original | Familia 4B | No disponible en la información proporcionada | Gemma | No publicados en la información disponible |

No se dispone de datos de benchmarks que permitan comparar este adaptador con alternativas de otros autores, ni de cifras de contexto o rendimiento que permitan una comparación cuantitativa. La comparación de la tabla se limita a los artefactos del mismo linaje, que comparten modelo base, licencia y ausencia de métricas publicadas en la información consultada.

## Limitaciones y advertencias

- Artefacto de investigación sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Se trata de un adaptador, no de un modelo autónomo: sin google/gemma-3-4b-it no funciona, y el repositorio no incluye los pesos completos.
- La model card advierte de que es una liberación de artefactos históricos y que no constituye evidencia de aceptación en un taller ni de posición oficial en una tarea compartida.
- Datos sintéticos y jueces basados en modelos: las referencias de evaluación son sintéticas y la interpretación de los resultados queda limitada por ello.
- Sin ablación emparejada: no se puede aislar cuánto aporta específicamente la componente de respuesta multilingüe frente al resto de la receta.
- Truncado en evaluación: las entradas largas de COMET se truncan en el límite del codificador, lo que puede infravalorar o distorsionar el rendimiento en segmentos largos.
- Riesgo de alucinación: inherente a un modelo generativo de 4B; la model card menciona texto generado imperfecto, cadenas vacías y conflictos de instrucciones en las exportaciones históricas.
- Reutilización de filas de origen: la propia documentación señala que reutilizar filas del dataset no constituye evidencia independiente.
- Idiomas limitados a seis: fuera de persa, inglés, árabe, chino, hebreo y español no hay cobertura declarada, con especial riesgo de degradación en lenguas no incluidas en el SFT.
- Licencia Gemma: los pesos quedan sujetos a los términos de Gemma, con las restricciones de uso comercial y de redistribución que dicha licencia impone; la licencia de software del repositorio no sustituye las condiciones de los datasets ni de los servicios de origen.
- Longitud de contexto no declarada: no se puede planificar una integración en producción que dependa de una ventana concreta sin consultar el modelo base.
- Fecha de publicación y actualización idénticas (2026-09-12): no hay historial de revisiones que permita evaluar la estabilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-SFT-LoRA
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- HexaBee-4B: https://huggingface.co/Iman998/HexaBee-4B
- HexaBee · Multilingual Base: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-Base
- HexaBee · Wikipedia PT LoRA: https://huggingface.co/Iman998/HexaBee-4B-PT-LoRA
- HexaBee · Translation LoRA: https://huggingface.co/Iman998/HexaBee-4B-Translation-LoRA
- Dataset HexaBee · Wikipedia Foundations: https://huggingface.co/datasets/Iman998/HexaBee-Wikipedia-PT
- Dataset HexaBee · Multilingual Answering & Translation: https://huggingface.co/datasets/Iman998/HexaBee-Multilingual-SFT
- Dataset HexaBee · Bidirectional Translation: https://huggingface.co/datasets/Iman998/HexaBee-Bidirectional-Translation
- Dataset HexaBee · The Prompt Hive: https://huggingface.co/datasets/Iman998/HexaBee-System-Prompts
- Dataset HexaBee · Translation Archive: https://huggingface.co/datasets/Iman998/HexaBee-Model-Outputs
- Dataset HexaBee · Evaluation Atlas: https://huggingface.co/datasets/Iman998/HexaBee-Evaluation
- Informe técnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Artículo original de LoRA: https://arxiv.org/abs/2106.09685
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados corresponden a páginas de soporte de Microsoft y no guardan relación con el artefacto.
