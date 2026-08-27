# ChisatoY/Qwen2.5-7B-ReWrite

## Resumen

Qwen2.5-7B-ReWrite es un modelo de lenguaje especializado en reescribir texto con estilo de IA generativa para convertirlo en prosa con apariencia de escritura humana natural. Desarrollado por ChisatoY, el modelo parte de Qwen2.5-7B-Instruct y se ajusta mediante supervisión fina (SFT) con LoRA, fusionando posteriormente el adaptador óptimo en los pesos base. El resultado es un modelo denso de 7.615 millones de parámetros, con arquitectura Qwen2ForCausalLM y una ventana de contexto de 32.768 tokens.

El modelo aborda un problema concreto y creciente: los textos generados por modelos de lenguaje suelen presentar patrones reconocibles (estructura repetitiva, muletillas, tono artificial) que delatan su origen. Este modelo está diseñado para eliminar esas marcas manteniendo el significado, los hechos, el idioma y el formato originales. Su relevancia actual radica en la demanda de herramientas de humanización de texto para publicaciones, traducciones y contenidos que necesitan pasar desapercibidos como generados por IA.

El entrenamiento combinó datos en chino e inglés procedentes de tres conjuntos de datos públicos, con un total de 43.124 muestras de entrenamiento. El modelo se publica en formato Safetensors BF16, listo para cargar con Transformers sin necesidad de montar adaptadores LoRA adicionales, y también se distribuyen pesos en GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 (Safetensors), GGUF disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | no disponible en la ficha de HuggingFace; el modelo base Qwen2.5-7B-Instruct usa Apache 2.0, pero los datos de entrenamiento incluyen CC BY-NC 4.0 |
| Formato de pesos | Safetensors (4 shards), GGUF |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de ventana deslizante y atención completa alternadas por capas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No introduce cambios arquitectónicos; la especialización se logra mediante el ajuste fino.

El entrenamiento utilizó LoRA con rango 16, alpha 32 y dropout 0,05, aplicado a todas las proyecciones lineales del transformer (q, k, v, o, gate, up, down). Se entrenaron 40.370.176 parámetros, aproximadamente el 0,53 % del total. El proceso de SFT usó una plantilla ChatML donde la instrucción de reescritura se inyecta como mensaje de sistema, el texto a reescribir como mensaje de usuario y la salida deseada como mensaje de asistente, calculando la pérdida solo sobre los tokens de la respuesta.

Los datos de entrenamiento combinan 24.999 muestras en chino (procedentes de XiangJinYu/Qwen3.5-9B-Humanize-Dataset, con predominio de resúmenes académicos y escritura formal) y 18.125 muestras en inglés (de KNipun/ai-humanizer). El conjunto se limpió con normalización Unicode NFKC, eliminación de duplicados y filtrado de textos vacíos o anómalos. El entrenamiento se detuvo por early stopping en el paso 3200, restaurando los pesos del paso 2600 con la mejor pérdida de validación (0,641895). Se empleó una única GPU NVIDIA RTX A6000 de 48 GB durante aproximadamente 7 horas.

## Capacidades

- Reescribir texto con estilo de IA a prosa de apariencia humana, preservando significado, hechos, idioma y formato.
- Procesar texto en chino e inglés, con instrucciones bilingües integradas en el prompt de sistema.
- Mantener la longitud y estructura general del texto original, con tendencia a comprimir frases y simplificar expresiones.
- Generar texto con decodificación determinista (do_sample=False) o muestreo, con soporte de repetition_penalty.
- Funcionar como modelo de chat estándar compatible con el template ChatML de Qwen.
- No soporta tool calling, function calling ni razonamiento multi-paso específico; su capacidad se limita a la tarea de reescritura para la que fue entrenado.

## Casos de uso

- Publicación de contenidos en blogs y medios: redactores que generan borradores con IA pueden pasar el texto por este modelo para eliminar marcas de estilo artificial antes de publicar, reduciendo el riesgo de ser detectado como contenido generado automáticamente.
- Localización y traducción editorial: traductores que usan MT asistida por IA pueden reescribir las salidas automáticas para que suenen naturales en el idioma de destino, especialmente en pares chino-inglés.
- Redacción académica y científica: el modelo está entrenado con resúmenes académicos en chino, por lo que puede pulir abstracts y textos formales generados por IA para que se ajusten mejor al estilo de redacción científica humana.
- Marketing de contenidos y SEO: equipos de marketing que producen grandes volúmenes de texto con herramientas de IA pueden humanizar las copias para campañas, descripciones de producto o artículos patrocinados.
- Preparación de datos para entrenamiento: el modelo puede servir para generar pares (texto IA, texto humanizado) que alimenten otros modelos clasificadores de detección de IA o sistemas de reescritura.
- Revisión de comunicaciones corporativas: departamentos de comunicación que redactan notas de prensa o comunicados internos con IA pueden aplicar el modelo para obtener un tono más natural antes de la revisión humana final.

## Benchmarks y rendimiento

El autor proporciona una evaluación en un conjunto de prueba independiente de 100 pares inglés (ai_text → human_text) procedente de alexreversegpt/ai-writing-tells, comparando la pérdida teacher-forced sobre la respuesta completa:

| Modelo | Test loss | Perplexity |
|---|---|---|
| Qwen2.5-7B-Instruct (original) | 7,9728 | 2900,89 |
| Qwen2.5-7B-ReWrite | 3,4172 | 30,48 |

La pérdida en el test se reduce aproximadamente un 57,14 % respecto al modelo base. El autor advierte que, al existir una única referencia de reescritura por entrada, esta métrica sirve para comparar la mejora relativa del ajuste, pero no sustituye una evaluación humana. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Inferencia en BF16: aproximadamente 15,2 GB de VRAM para los pesos, más memoria para activaciones y KV cache. Cabe en GPUs de 24 GB como RTX 3090/4090, A5000 o A10G.
- Inferencia con cuantización GGUF: las versiones Q4_K_M y Q5_K_M requieren entre 5 y 7 GB de VRAM, lo que permite ejecución en GPUs de consumo como RTX 3060 12 GB o RTX 4070.
- El entrenamiento se realizó en una única NVIDIA RTX A6000 de 48 GB, con un throughput de aproximadamente 4,97 muestras por segundo y una duración total de unas 7 horas.
- Opciones de despliegue: compatible con Transformers (carga directa de Safetensors), vLLM, TGI, llama.cpp y Ollama mediante los pesos GGUF.
- La latencia dependerá del hardware y la cuantización; en una RTX 4090 con cuantización Q4, se esperan decenas de tokens por segundo para generaciones de hasta 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen2.5-7B-ReWrite | 7,6B | 32.768 | Reescritura IA → humano (zh/en) | no disponible |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 | Chat generalista | Apache 2.0 |
| caraman/Qwen2.5-7B-mtrag-query-rewriter-final | 7,6B | 32.768 | Reescritura de consultas para RAG | no disponible |

No se dispone de información suficiente sobre otros modelos especializados en humanización de texto con los que establecer una comparativa de rendimiento directa. La alternativa más cercana sería usar el modelo base Qwen2.5-7B-Instruct con un prompt de reescritura, pero el autor demuestra que su modelo reduce la perplexidad en el conjunto de prueba de 2900,89 a 30,48 frente al base, lo que indica una especialización efectiva.

## Limitaciones y advertencias

- Los datos de entrenamiento en chino se centran en resúmenes académicos y escritura formal; el modelo cubre mal estilos orales, narrativa, ficción o redes sociales.
- Las salidas en chino pueden usar comas y puntos en formato de ancho medio (half-width), característica heredada de los textos objetivo del entrenamiento.
- El modelo tiende a comprimir frases y simplificar expresiones; no garantiza eliminar por completo tonos propagandísticos, plantillas argumentativas o adornos vacíos.
- La reescritura puede introducir cambios de matiz o ligeras desviaciones factuales; se recomienda revisión humana para contenido crítico.
- El conjunto de prueba independiente es pequeño (100 muestras) y solo en inglés, por lo que no representa la calidad completa en chino ni en todos los registros.
- La licencia del modelo no está especificada en la ficha de HuggingFace. El modelo base usa Apache 2.0, pero parte de los datos de entrenamiento chinos están bajo CC BY-NC 4.0, lo que puede restringir el uso comercial del modelo resultante. Se recomienda verificar los términos antes de usar en producción.
- El entrenamiento se limitó a secuencias de 1.024 tokens, por lo que el modelo puede degradarse al reescribir textos mucho más largos que ese umbral, aunque la ventana de contexto del modelo base sea de 32.768 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChisatoY/Qwen2.5-7B-ReWrite
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de referencia de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-7B
- Discusión en la comunidad sobre el modelo: https://linux.sb/topic/16682
