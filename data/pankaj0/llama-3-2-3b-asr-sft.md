# pankaj0/llama-3.2-3b-asr-sft

## Resumen

`pankaj0/llama-3.2-3b-asr-sft` es un ajuste fino (SFT) publicado por el usuario pankaj0 sobre Llama 3.2 3B, a juzgar por el identificador del repositorio y las etiquetas del Hub (`transformers`, `safetensors`, `unsloth`). El sufijo «asr-sft» apunta a un entrenamiento supervisado orientado al posprocesado de transcripciones automáticas de voz (ASR), una tarea en la que el mismo autor mantiene otro modelo publicado, `llama-3.2-3b-asr-refiner-merged`, descrito como especializado en corregir errores ortográficos, añadir mayúsculas y puntuación y eliminar disfluencias del habla. No obstante, la model card del repositorio es la plantilla automática de Hugging Face y no contiene ninguna declaración del autor sobre datos, objetivo o procedimiento.

El interés técnico del modelo es el de un refinador de ASR pequeño (3,2 mil millones de parámetros) que puede ejecutarse en hardware de consumo, lo que permite insertarlo como etapa de post-procesado entre un motor de reconocimiento de voz y un pipeline de aplicaciones (subtitulado, actas de reuniones, atención al cliente). Su utilidad real, sin embargo, no puede evaluarse con la información disponible: no hay métricas, no hay descripción del dataset, no hay licencia declarada y el tamaño del repositorio (0,2 GB) es notablemente inferior al esperado para pesos completos de un modelo de 3B en bf16 (en torno a 6,4 GB), lo que sugiere que el repositorio podría contener únicamente adaptadores LoRA o pesos cuantizados. Esta última afirmación es una inferencia a partir de los metadatos, no un dato confirmado.

Se recomienda tratar este repositorio como un artefacto experimental sin documentar. Cualquier evaluación de producción debería hacerse contra el modelo base Llama 3.2 3B y contra el otro modelo del mismo autor antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), derivada del modelo base Llama 3.2 3B; no confirmada en la model card |
| Parametros totales | 3,21 mil millones (heredados del modelo base; el repositorio no lo declara) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base Llama 3.2 3B; no confirmada para este ajuste |
| Tipos de cuantizacion | No especificados en el repositorio. El ecosistema del modelo base admite GGUF (Q2_K a Q8_0), GPTQ, AWQ y bitsandbytes de 8 y 4 bits |
| Idiomas soportados | No disponibles. El modelo base Llama 3.2 declara ocho idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible en el repositorio. El modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | `safetensors`, con libreria `transformers`; el tamano del repo (0,2 GB) no corresponde a pesos completos en bf16 |
| Etiquetas del Hub | `transformers`, `safetensors`, `unsloth`, `arxiv:1910.09700`, `endpoints_compatible`, `region:us` |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-10-24 / 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only denso con 28 capas, dimensión oculta de 3072, 24 cabezas de atención con 8 cabezas KV (GQA, head_dim 128), FFN de 8192, embeddings atados y vocabulario de 128.256 tokens, con RoPE configurado a theta 500.000. El modelo base fue entrenado por Meta sobre del orden de 9 billones de tokens con un corte de conocimiento en diciembre de 2023. Todos estos datos provienen de la documentación pública del modelo base y no están verificados en el repositorio de este ajuste.

Sobre el entrenamiento específico de este checkpoint no hay información: la model card es la plantilla automática y todas las secciones de datos, hiperparámetros, régimen de precisión y procedimiento están marcadas como «More Information Needed». La única pista es la etiqueta `unsloth`, que indica que el ajuste se realizó con la librería Unsloth (optimizaciones de memoria para fine-tuning con LoRA/QLoRA), y el nombre del modelo, que sugiere SFT sobre pares de transcripción cruda y transcripción refinada. No se han publicado detalles sobre volumen de datos, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva en el rango de los 3B, condicionada por el ajuste recibido.
- Posprocesado de transcripciones ASR: corrección ortográfica, inserción de mayúsculas y puntuación y eliminación de disfluencias, según la descripción pública del modelo hermano del mismo autor y no verificada en este repositorio.
- Seguimiento de instrucciones conversacionales heredado del modelo base (plantilla de chat de Llama 3.x); no confirmado para este checkpoint.
- Capacidad multilingüe potencial heredada del modelo base; no evaluada ni declarada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 3B tiene capacidad limitada para cadenas de razonamiento largas.
- Modo «thinking» explícito: no disponible.
- Visión, audio nativo o entrada multimodal: no disponible. A pesar del nombre «asr», el modelo es de texto a texto; no procesa audio.

## Casos de uso

- Refinado de subtítulos automáticos: se recibe la salida de un motor ASR (Whisper, wav2vec 2.0, motores comerciales) y el modelo reescribe cada segmento con puntuación, mayúsculas y sin muletillas, manteniendo la marca temporal original. Adecuado por su tamaño reducido, que permite procesar horas de transcripción en una sola GPU.
- Actas y notas de reuniones: pipeline de dos etapas (ASR + este modelo) que convierte una transcripción con disfluencias en texto legible para enviar a revisión humana o a un resumen posterior con un modelo mayor.
- Transcripción de entrevistas cualitativas: normalización de la salida ASR antes de codificación temática, reduciendo el ruido de puntuación que degrada las herramientas de análisis cualitativo.
- Preprocesado para pipelines RAG sobre audio: limpiar y puntuar transcripciones antes de trocearlas y generar embeddings, lo que mejora la calidad de recuperación en buscadores sobre vídeo y pódcast.
- Atención al cliente sobre voz: transcripción de llamadas y normalización posterior para alimentar analítica de calidad o sistemas de clasificación de motivos de contacto.
- Evaluación comparativa de motores ASR: usar el refinador para homogeneizar la presentación de las salidas de varios motores y poder comparar WER y legibilidad en condiciones equivalentes.
- Generación de contenido accesible: producción de transcripciones legibles para cumplimiento de accesibilidad en vídeo, con intervención humana posterior dado el riesgo de alucinación.
- Ajuste adicional (fine-tuning) como base de partida: al ser un modelo de 3B, puede reajustarse con LoRA en una única GPU de 24 GB para dominios concretos (terminología médica, legal o técnica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y la búsqueda web no aporta resultados para este checkpoint concreto. Tampoco existen comparaciones con el modelo hermano `llama-3.2-3b-asr-refiner-merged` ni con el modelo base en la información proporcionada.

## Requisitos de hardware

Estimaciones calculadas a partir de la arquitectura conocida del modelo base Llama 3.2 3B; no son mediciones del repositorio.

- VRAM para pesos en bf16: en torno a 6,4 GB solo para pesos; con overhead de activaciones y contexto corto, unos 8-10 GB.
- VRAM con cuantización de 8 bits: aproximadamente 3,5-4 GB.
- VRAM con GGUF Q4_K_M: alrededor de 2 GB; ejecutable en CPU con 4-8 GB de RAM y rendimiento bajo.
- Caché KV: con GQA (28 capas, 8 cabezas KV, head_dim 128) el coste es de unos 112 KiB por token en bf16, es decir, del orden de 14 GB para agotar los 131.072 tokens de contexto. El contexto largo es, por tanto, el principal consumidor de memoria, no los pesos.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 4070 Ti o A100/H100 para bf16 con contexto largo. Para 4 bits basta una RTX 3060 de 12 GB, una RTX 4060 Ti de 8 GB o incluso una GPU integrada con llama.cpp.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando cuantización de 4 bits, y en 12 GB con 8 bits.
- Opciones de despliegue: `transformers` + bitsandbytes, vLLM (para bf16 o AWQ/GPTQ), TGI, llama.cpp/Ollama (requiere convertir a GGUF), y LM Studio para pruebas locales.
- Latencia y throughput: no se han publicado mediciones. Como referencia estructural, un modelo denso de 3B en bf16 sobre una RTX 4090 suele quedar limitado por memoria y no por cómputo; para el caso de uso de refinado por segmentos, el cuello de botella real será el tamaño del lote y la longitud de la transcripción.

## Comparativa con modelos similares

No hay datos de rendimiento de este checkpoint. La comparación se limita a parámetros, contexto y licencia del modelo base y de alternativas de la misma franja de tamaño.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `pankaj0/llama-3.2-3b-asr-sft` | 3,21B (heredado) | 131.072 (heredado, no confirmado) | No declarada | Hugging Face, 0 descargas | Sin model card, sin benchmarks, sin dataset documentado |
| Llama 3.2 3B Instruct (base) | 3,21B | 131.072 | Llama 3.2 Community License | Hugging Face, ampliamente desplegado | Modelo de referencia; no especializado en ASR |
| `pankaj0/llama-3.2-3b-asr-refiner-merged` | 3,2B | No disponible | No disponible | Hugging Face, ~259 descargas | Mismo autor, mismo propósito declarado; mejor documentado en descripción de terceros |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 (128K con RoPE scaling) | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva; no especializada en ASR |
| Gemma 2 2B Instruct | 2,6B | 8.192 | Gemma Terms of Use | Hugging Face | Menor contexto; licencia con restricciones de uso |

Los datos de las alternativas provienen de su documentación pública y no de la información proporcionada en esta búsqueda; deben verificarse antes de usarse en una decisión de adopción. No se dispone de comparaciones de calidad para la tarea de refinado de ASR.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática; no hay información sobre datos, entrenamiento, evaluación ni uso previsto. Adoptarlo en producción sin evaluación propia es desaconsejable.
- Licencia no declarada: el repositorio no indica licencia. Aunque el modelo base es Llama 3.2 Community License, los términos aplicables a este ajuste son inciertos, lo que bloquea su uso comercial sin aclaración previa del autor.
- Riesgo de alucinación en el refinado: en tareas de reescritura, un modelo de 3B puede introducir contenido no presente en la transcripción original (nombres, cifras, términos) en lugar de limitarse a corregir. Cualquier uso en actas, subtítulos o contextos legales requiere verificación humana o una etapa de detección de divergencias.
- Degradación en dominios especializados: sin datos de entrenamiento conocidos, no hay garantía de comportamiento con terminología médica, jurídica o técnica, ni con nombres propios poco frecuentes.
- Idiomas no declarados: no consta qué idiomas cubre el ajuste; el rendimiento en español es una incógnita aunque el modelo base lo soporte.
- Contexto no verificado: el ajuste podría haber alterado la configuración de RoPE o la ventana efectiva; no hay confirmación de que los 131.072 tokens sigan operativos.
- Sesgos: se heredan los sesgos del corpus de preentrenamiento de Llama 3.2, no evaluados en este checkpoint.
- Ambigüedad del artefacto: el tamaño del repositorio (0,2 GB) sugiere adaptadores LoRA o pesos cuantizados. Si es un adaptador, requiere cargar el modelo base y aplicar el adaptador, no es autónomo. Verificar la estructura de ficheros antes de intentar cargarlo.
- Sin mantenimiento observable: 0 descargas, 0 likes y un único día entre creación y actualización. No hay historial que permita inferir soporte.
- Nombre potencialmente engañoso: «asr» hace referencia al posprocesado de texto, no a capacidad de reconocimiento de voz. El modelo no acepta audio.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/pankaj0/llama-3.2-3b-asr-sft
- Perfil del autor y resto de modelos: https://huggingface.co/pankaj0/models
- Modelo hermano del mismo autor (refinador ASR fusionado): https://huggingface.co/pankaj0/llama-3.2-3b-asr-refiner-merged
- Ficha de terceros con descripción del modelo hermano: https://featherless.ai/models/pankaj0/llama-3.2-3b-asr-refiner-merged
- Registro de terceros: https://free2aitools.com/model/pankaj0/llama-3.2-3b-asr-refiner-merged
- Página oficial de la familia Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3
- Referencia citada en las etiquetas del Hub (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental en ML: https://mlco2.github.io/impact#compute
- Unsloth (librería de fine-tuning indicada en las etiquetas): https://github.com/unslothai/unsloth
