# Flashtond22/Taltos-27B-FP8

## Resumen

Táltos-27B-FP8 es la versión cuantizada en FP8 (W8A8) del modelo Táltos-27B, desarrollado por Flashtond22. Se trata de un modelo de lenguaje multimodal (image-text-to-text) basado en la arquitectura Qwen3.5, entrenado para los idiomas húngaro e inglés. Su objetivo principal es ofrecer una alternativa eficiente en memoria al modelo original en bf16, reduciendo el tamaño de 56 GB a 30 GB y permitiendo su ejecución en tarjetas gráficas con 40 GB de VRAM, como la L40S, A6000 o A100.

La cuantización FP8 aplica escalado dinámico por canal en los pesos y por token en las activaciones, lo que según el autor mantiene una calidad prácticamente idéntica al modelo original. El modelo está diseñado para ser servido con vLLM e incluye soporte para el parser de razonamiento Qwen3, lo que sugiere capacidades de razonamiento encadenado. Su relevancia radica en ser una de las pocas opciones de código abierto con buen soporte para húngaro, además de inglés, con un tamaño manejable para despliegues en una sola GPU profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | FP8 (W8A8) |
| Idiomas soportados | Húngaro (hu), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base Táltos-27B se construye sobre la arquitectura de Qwen3.5, que emplea un transformer con atención por ventanas deslizantes y mecanismos de razonamiento explícito. La versión FP8 no modifica la arquitectura original, sino que cuantiza los pesos y activaciones a punto flotante de 8 bits con escalado dinámico: los pesos se escalan por canal y las activaciones por token. Esta técnica, implementada mediante la librería compressed-tensors, reduce el tamaño del modelo a la mitad sin cambios estructurales.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el proceso de alineación (RLHF/DPO) del modelo base. La model card solo indica que es una cuantización del Táltos-27B original y que la pérdida de calidad es "prácticamente indetectable". El modelo está preparado para el pipeline image-text-to-text, lo que implica que el modelo base fue entrenado con datos multimodales que incluyen imágenes y texto.

## Capacidades

- Generación de texto en húngaro e inglés con fluidez y registro conversacional.
- Comprensión y descripción de imágenes (pipeline image-text-to-text).
- Razonamiento encadenado (chain-of-thought) gracias al parser de razonamiento Qwen3 integrado en vLLM.
- Conversación multi-turno, adecuada para asistentes virtuales y chatbots.
- Procesamiento de instrucciones en lenguaje natural, tanto en húngaro como en inglés.
- Compatibilidad con el formato OpenAI API a través de vLLM, lo que facilita su integración en aplicaciones existentes.

## Casos de uso

- Atención al cliente bilingüe: el modelo puede gestionar conversaciones multi-turno en húngaro e inglés con una ventana de contexto de 32 768 tokens, suficiente para mantener historiales largos de chat. Su integración con vLLM y la API OpenAI permite desplegarlo como backend de sistemas de soporte automatizado.
- Traducción automática húngaro-inglés: gracias a su entrenamiento bilingüe, puede traducir documentos, correos electrónicos y contenido web con mayor precisión que modelos genéricos, especialmente en registros coloquiales y técnicos.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de capturas de pantalla, escaneos o fotografías y responder preguntas sobre su contenido, útil para automatizar procesos de revisión documental.
- Generación de contenido localizado: redacción de artículos, descripciones de producto o publicaciones en redes sociales en húngaro e inglés, manteniendo un tono natural y culturalmente apropiado.
- Asistente de programación en entornos multilingües: aunque no se especifica soporte de tool calling, su base Qwen3.5 sugiere capacidades de generación de código; puede ayudar a desarrolladores húngaros a escribir y depurar código con explicaciones en su idioma nativo.
- Despliegue en entornos con restricciones de VRAM: al ocupar solo 30 GB, puede ejecutarse en una única GPU de 40 GB (A100, L40S), lo que lo hace viable para laboratorios de investigación con hardware moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la calidad es "prácticamente idéntica" al modelo base, pero no proporciona métricas numéricas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se recomienda consultar el repositorio del modelo base para posibles evaluaciones futuras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 32 GB (según la model card).
- GPU recomendadas: L40S, A6000, A100 40 GB, RTX 6000 Ada (todas con 40 GB o más).
- No cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB, insuficiente para FP8). La versión GGUF del mismo modelo puede ejecutarse en GPUs de 12 GB o incluso en CPU.
- Opciones de despliegue: vLLM (recomendado, con soporte para reasoning parser), también compatible con TGI si se convierte el formato. Para la variante GGUF se puede usar Ollama o llama.cpp.
- Latencia y throughput: no se han publicado datos concretos. Con vLLM y FP8, se espera un throughput superior al modelo bf16 debido a la menor carga de memoria, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Idiomas | Licencia |
|---|---|---|---|---|---|
| Táltos-27B-FP8 (este) | 27,8 B | 32 768 | FP8 | hu, en | Apache 2.0 |
| Táltos-27B (bf16) | 27,8 B | 32 768 | bf16 | hu, en | Apache 2.0 |
| Táltos-27B-GGUF | 27,8 B | 32 768 | GGUF (varias) | hu, en | Apache 2.0 |

Las tres variantes comparten la misma arquitectura y capacidades, diferenciándose únicamente en el formato de pesos y los requisitos de hardware. No se dispone de comparación con otros modelos multilingües (como Llama 3.1 8B o Mistral 7B) porque no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- El modelo solo soporta húngaro e inglés; no está entrenado para otros idiomas, lo que limita su uso en entornos multilingües amplios.
- No se han documentado sesgos específicos, pero al ser un modelo basado en Qwen3.5, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación no cuantificado; se recomienda validar las respuestas en aplicaciones críticas.
- La cuantización FP8, aunque mantiene una calidad alta, puede introducir pequeñas desviaciones en tareas de precisión numérica extrema (por ejemplo, matemáticas avanzadas).
- No se ha confirmado soporte de tool calling ni function calling; aunque la base Qwen3.5 lo permite, no está garantizado en esta versión.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener dependencias adicionales (como los pesos de Qwen3.5) que requieran verificar sus propias licencias.

## Enlaces

- Modelo FP8: https://huggingface.co/Flashtond22/Taltos-27B-FP8
- Modelo base (bf16): https://huggingface.co/Flashtond22/Taltos-27B
- Modelo GGUF: https://huggingface.co/Flashtond22/Taltos-27B-GGUF
