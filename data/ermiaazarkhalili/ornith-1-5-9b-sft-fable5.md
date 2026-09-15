# ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5

## Resumen

Ornith-1.5-9B-SFT-Fable5 es un ajuste fino supervisado (SFT) publicado por el usuario ermiaazarkhalili sobre el modelo base ornith-ai/Ornith-1.5-9B. Se trata de un transformer denso de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), distribuido en formato safetensors con un peso de repositorio de 19,3 GB, lo que corresponde a pesos en precisión de 16 bits. La licencia declarada es Apache 2.0 y el único idioma soportado según la model card es el inglés.

El pipeline declarado en HuggingFace es image-text-to-text, lo que indica que el modelo acepta entradas multimodales de imagen y texto, y entre sus etiquetas figura qwen3_5, lo que apunta a que el modelo base pertenece a la familia arquitectónica Qwen3.5. El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, según la propia model card, que se limita a indicar que el ajuste fue "2x faster" sin detallar dataset, hiperparámetros ni número de pasos.

La relevancia práctica de este checkpoint es limitada en el momento de la consulta: cero descargas, cero interacciones y una model card mínima que no aporta información sobre composición del dataset de ajuste, longitud de contexto, métodos de alineación posteriores al SFT ni resultados de evaluación. Es un artefacto de investigación cuya reproducibilidad depende de la documentación del modelo base, no de la del propio ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso; etiqueta qwen3_5, familia Qwen3.5 (no confirmado en documentación del autor) |
| Parámetros totales | 9.653.104.368 (≈9,65 B) |
| Parámetros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en el repositorio (solo safetensors); convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repositorio: 19,3 GB) |
| Modalidad de entrada | Imagen y texto (pipeline image-text-to-text) |
| Librería de referencia | transformers |
| Modelo base | ornith-ai/Ornith-1.5-9B |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los metadatos disponibles permiten inferir que se trata de un transformer denso de tipo decoder-only perteneciente a la familia Qwen3.5 (etiqueta qwen3_5), con 9.653.104.368 parámetros confirmados a partir de los pesos en safetensors. El pipeline image-text-to-text implica la existencia de un codificador o proyector de visión, pero no se especifica ni su arquitectura ni su resolución de entrada o número de tokens visuales por imagen.

El proceso de entrenamiento declarado consiste en un ajuste fino supervisado sobre ornith-ai/Ornith-1.5-9B, ejecutado con Unsloth y la librería TRL de HuggingFace. No se documenta el dataset utilizado, el número de tokens de entrenamiento, la composición de las instrucciones, la existencia de fases posteriores de RLHF, DPO u optimización por preferencias, ni el uso de decodificación especulativa u otras optimizaciones de inferencia. Tampoco se indica si el ajuste preserva las capacidades multimodales del modelo base o si se centró únicamente en texto, ya que la ausencia de datos de evaluación impide verificarlo.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta conversational y el pipeline declarado.
- Procesamiento de entradas multimodales imagen-texto, de acuerdo con el pipeline image-text-to-text declarado en HuggingFace; el alcance real (OCR, descripción de imágenes, VQA) no está documentado.
- Ajuste orientado a instrucciones (SFT), por lo que se espera un comportamiento de seguimiento de instrucciones conversacionales, aunque sin datos publicados que lo cuantifiquen.
- Soporte de tool calling o function calling: no disponible, no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no confirmado en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card, aunque un modelo base de la familia Qwen3.5 suele conservar capacidades multilingües que aquí no se declaran.
- Modo de razonamiento explícito (thinking mode): no disponible, no confirmado.
- Capacidades de audio: no disponibles.

## Casos de uso

- Clasificación y descripción de imágenes en inglés: el pipeline image-text-to-text permite enviar una imagen junto a una instrucción de texto y obtener una descripción o respuesta; es adecuado para prototipos internos de etiquetado, siempre que se valide la calidad del ajuste SFT de forma empírica antes de cualquier uso productivo.
- Extracción de información de documentos escaneados: el modelo puede recibir la imagen de un documento y devolver campos estructurados en inglés; conviene medir la tasa de error por campo, ya que no hay benchmarks publicados para OCR o extracción sobre documentos.
- Prototipado conversacional en inglés: sirve como punto de partida para asistentes de chat de dominio general con 9,65 B de parámetros, un tamaño que permite iterar en una GPU de 24 GB con cuantización de 8 o 4 bits.
- Investigación sobre ajuste fino eficiente: al haberse entrenado con Unsloth y TRL, el checkpoint resulta útil como referencia metodológica para reproducir flujos de SFT sobre modelos multimodales de ~9 B en hardware limitado.
- Evaluación comparativa de checkpoints derivados: puede utilizarse como punto de comparación frente a otros ajustes del mismo modelo base para medir el efecto del dataset de SFT sobre tareas concretas.
- Generación de datos sintéticos en inglés a partir de imágenes: el modelo puede producir pares imagen-descripción o preguntas-respuestas que alimenten posteriores pipelines de anotación, con revisión humana obligatoria por el riesgo de alucinación.
- Asistencia interna sin requisitos de idioma español: dado que la model card solo declara inglés, cualquier despliegue en castellano requiere una evaluación previa de la degradación de calidad, que no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y el modelo acumula cero descargas en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

| Benchmark | Ornith-1.5-9B-SFT-Fable5 | Modelo base |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| Benchmarks multimodales (MMMU, DocVQA) | No disponible | No disponible |

## Requisitos de hardware

- VRAM para inferencia en precisión de 16 bits: aproximadamente 19,3 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica se recomiendan 24 GB o más para contexto corto.
- VRAM en cuantización de 8 bits: del orden de 10-12 GB de pesos, lo que encaja en tarjetas de 16 GB con contexto moderado.
- VRAM en cuantización de 4 bits: del orden de 6-8 GB de pesos, viable en GPU de consumo de 8-12 GB con contexto reducido.
- GPU recomendadas para producción: NVIDIA A100 40/80 GB, H100 80 GB o L40S 48 GB en 16 bits con lotes grandes.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) en 16 bits con contexto limitado; RTX 4080, 4070 Ti o 4060 Ti (16 GB) requieren cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta endpoints_compatible y text-generation-inference), vLLM, SGLang y, previa conversión a GGUF, llama.cpp u Ollama. La conversión a GGUF no está publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token, y al no conocerse la longitud de contexto no puede estimarse el coste de la caché KV con precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-SFT-Fable5 | 9,65 B | No disponible | Apache 2.0 | Inglés | Repositorio público con 0 descargas |
| ornith-ai/Ornith-1.5-9B (base) | No disponible | No disponible | No disponible en la información proporcionada | No disponible | Repositorio público |
| Qwen3-8B | 8,2 B | 32.768 tokens nativos, extensible a 131.072 con YaRN | Apache 2.0 | Multilingüe (más de 100 idiomas) | Ampliamente desplegado, versiones GGUF y cuantizadas |
| Llama 3.1 8B | 8,03 B | 131.072 tokens | Llama 3.1 Community License | 8 idiomas declarados | Ampliamente desplegado, versiones GGUF y cuantizadas |
| Gemma 2 9B | 9,24 B | 8.192 tokens | Gemma Terms of Use | Multilingüe | Ampliamente desplegado, versiones GGUF y cuantizadas |

Nota: los datos de Qwen3-8B, Llama 3.1 8B y Gemma 2 9B proceden de su documentación pública y se incluyen como referencia de categoría (modelos densos de 8-10 B). No existe ningún dato de rendimiento publicado de Ornith-1.5-9B-SFT-Fable5 que permita comparar calidad, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: la model card no describe dataset de ajuste, hiperparámetros, número de tokens de entrenamiento ni proceso de alineación, lo que impide auditar el comportamiento del modelo.
- Sin datos de evaluación: no hay benchmarks publicados y el repositorio registra cero descargas, por lo que no existen evaluaciones independientes de terceros.
- Riesgo de alucinación no cuantificado: al tratarse de un ajuste SFT sin fase de alineación por preferencias documentada, no puede descartarse un aumento de la verbosidad o de la confabulación respecto al modelo base.
- Sesgos desconocidos: no se documenta la composición del dataset de ajuste, por lo que no puede evaluarse el sesgo demográfico, cultural o de dominio introducido durante el SFT.
- Limitación idiomática: la model card declara únicamente inglés. Su uso en castellano no está validado y podría degradar la calidad de forma significativa.
- Longitud de contexto desconocida: no se especifica la ventana de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones multi-turno extensas.
- Riesgo de olvido catastrófico: al ser un ajuste SFT sobre un modelo multimodal, es posible que se hayan degradado capacidades del modelo base (por ejemplo, visión o multilingüismo) sin que exista documentación que lo confirme o lo descarte.
- Licencia Apache 2.0 en el ajuste: permite uso comercial del checkpoint, pero el cumplimiento depende también de la licencia del modelo base ornith-ai/Ornith-1.5-9B, que no se especifica en la información proporcionada. Debe verificarse antes de cualquier explotación comercial.
- Sin garantías de mantenimiento: el autor no publica versiones de cuantización, no hay issues documentadas ni historial de actualizaciones más allá de la creación del repositorio.
- Idoneidad productiva: no recomendado para entornos de producción sin una evaluación propia previa sobre el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Paper o blog del modelo: no disponible
- Demo: no disponible
