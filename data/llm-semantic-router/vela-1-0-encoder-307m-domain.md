# llm-semantic-router/Vela-1.0-Encoder-307M-Domain

## Resumen

Vela-1.0-Encoder-307M-Domain es un modelo encoder de clasificación de texto desarrollado por el proyecto llm-semantic-router (vLLM Semantic Router), un ecosistema orientado al enrutamiento semántico de peticiones hacia modelos y herramientas. El modelo identifica el dominio temático de una consulta entre 14 categorías, con el objetivo de servir como componente de decisión en pipelines que necesitan dirigir cada petición al modelo o herramienta más adecuada. Es un fine-tune del modelo base vllm-sr/Vela-1.0-Encoder-307M.

Técnicamente se trata de un encoder de arquitectura ModernBERT con 307.541.006 parámetros totales y una capacidad de entrada de 32.768 tokens, incluyendo tokens especiales. Su relevancia actual radica en que resuelve el problema del enrutamiento con contexto largo: según la evaluación del autor, el modelo original mmBERT32K Domain degradaba su Macro F1 de forma drástica al aumentar la longitud de entrada (de 66,33 en peticiones cortas a 1,79 en contextos de 8K a 32K), mientras que Vela mantiene valores entre 71 y 81 en esos mismos escenarios.

El modelo está publicado con licencia Apache 2.0, soporta seis idiomas (inglés, chino, español, francés, alemán y japonés) y se distribuye en formatos safetensors y ONNX, lo que facilita su despliegue tanto en entornos PyTorch como en inferencia optimizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 307.541.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (incluyendo tokens especiales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, es, fr, de, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Tarea | text-classification (14 dominios) |
| Modelo base | vllm-sr/Vela-1.0-Encoder-307M (fine-tune) |
| Tamano del repositorio | 5,0 GB |
| Libreria | transformers |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un encoder basado en ModernBERT, la arquitectura de encoder transformer modernizada que incorpora attention lineal, RoPE y mejoras de eficiencia frente a BERT clásico, adaptada aquí para clasificación de texto con capacidad de contexto de 32.768 tokens. Se trata de un fine-tune del checkpoint vllm-sr/Vela-1.0-Encoder-307M, especializado en la tarea de identificación de dominio en 14 categorías para el enrutador semántico de vLLM.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card indica que los conjuntos de evaluación presentados (1.988 peticiones cortas y 28 ejemplos extendidos a cada longitud de contexto) fueron utilizados para la selección del checkpoint, por lo que no constituyen un conjunto de test independiente. El entrenamiento se orientó específicamente a mantener la precisión de clasificación en entradas de hasta 32K tokens, un escenario en el que el modelo de referencia mmBERT32K perdía prácticamente toda su capacidad discriminativa.

## Capacidades

- Clasificación de texto en 14 dominios temáticos para enrutamiento semántico de peticiones.
- Procesamiento de entradas de hasta 32.768 tokens, lo que permite clasificar consultas con contexto largo (documentos, conversaciones multi-turno, prompts extensos).
- Capacidad multilingüe en inglés, chino, español, francés, alemán y japonés para peticiones cortas.
- Salida de etiquetas de clasificación con puntuaciones, integrable en lógica de decisión de un router.
- Compatible con pipelines de transformers (`pipeline("text-classification")`).
- Soporte de despliegue vía text-embeddings-inference y endpoints compatibles.
- No dispone de generación de texto, tool calling, capacidades de agente ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de peticiones en un gateway LLM: el modelo clasifica cada consulta entrante en uno de los 14 dominios y el router selecciona el modelo especializado o la herramienta adecuada para ese dominio, reduciendo coste y latencia frente a enviar todo al modelo más grande.
- Clasificación de consultas con contexto largo: gracias a sus 32.768 tokens de entrada, puede clasificar peticiones que incluyen documentos adjuntos, historiales de conversación o prompts extensos sin truncar, escenario donde el modelo de referencia fallaba.
- Moderación y triaje previo: identificar el dominio de una solicitud antes de aplicar políticas específicas (por ejemplo, restricciones distintas para consultas financieras, médicas o legales).
- Atención al cliente multilingüe: clasificar tickets y mensajes en inglés, chino, español, francés, alemán o japonés para dirigirlos al equipo o flujo automatizado correspondiente.
- Enrutamiento de herramientas en agentes: usar la etiqueta de dominio como señal para decidir qué conjunto de funciones o APIs exponer al agente en cada turno.
- Filtrado y organización de corpus: etiquetar grandes volúmenes de documentos o consultas por dominio como paso previo a indexación, búsqueda o análisis.
- Despliegue en producción con ONNX: exportar el modelo a ONNX para inferencia de baja latencia en CPU o GPU dentro de servicios de clasificación de alto throughput.

## Benchmarks y rendimiento

Macro F1 (×100) sobre los conjuntos de desarrollo del autor, comparado con el modelo original mmBERT32K Domain. Mayor es mejor. Según la model card, estos conjuntos informaron la selección del checkpoint y no son un test independiente.

| Evaluacion | Original mmBERT | Vela |
|---|---:|---:|
| Peticiones cortas · 1.988 | 66,33 | 85,15 |
| Contexto controlado 4K · 28 | 7,14 | 71,19 |
| Contexto controlado 8K · 28 | 1,79 | 81,19 |
| Contexto controlado 16K · 28 | 1,79 | 81,19 |
| Contexto controlado 32K · 28 | 1,79 | 77,86 |

Las peticiones cortas cubren inglés, chino, español, francés, alemán y japonés. La evaluación de contexto largo usa 28 ejemplos en inglés y chino extendidos a cada longitud. Ambos modelos procesan la entrada completa en FP32. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (307M parámetros × 4 bytes), más memoria de activaciones que crece con la longitud de contexto hasta 32K tokens.
- En FP16/BF16: aproximadamente 0,6 GB para pesos; en cuantización de 8 bits, unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo con contexto largo; A100, H100, L40S o RTX 4090 ofrecen margen amplio y buen throughput en batch.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; también en CPU para cargas moderadas.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (pesos ONNX incluidos), text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (corto) | Macro F1 (32K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Domain | 307M | 32.768 | 85,15 | 77,86 | Apache 2.0 | Hugging Face (safetensors, ONNX) |
| mmBERT32K Domain (original) | no disponible | 32K (según nombre) | 66,33 | 1,79 | no disponible | Hugging Face |
| Encoders de clasificación tipo BERT base | ~110M | 512 típicamente | no disponible | no aplica (sin contexto largo) | variable | Hugging Face |

La comparativa directa solo es posible con el modelo de referencia mmBERT32K Domain, ya que la información proporcionada no incluye resultados de otros clasificadores de dominio. La diferencia principal es la robustez en contexto largo: Vela mantiene F1 superior a 71 en todas las longitudes evaluadas, mientras el original cae a 1,79 a partir de 8K tokens.

## Limitaciones y advertencias

- Los conjuntos de evaluación presentados son de desarrollo y sirvieron para seleccionar el checkpoint; no son un test independiente, por lo que las cifras pueden estar sobreestimadas.
- La evaluación de contexto largo se basa en solo 28 ejemplos en inglés y chino, una muestra muy reducida que limita la fiabilidad estadística de esos resultados.
- La cobertura multilingüe en contexto largo no está evaluada: las pruebas largas solo usan inglés y chino, aunque el modelo declara soporte para español, francés, alemán y japonés en peticiones cortas.
- Es un clasificador de 14 dominios, no un modelo generativo: no puede responder preguntas ni ejecutar herramientas por sí mismo.
- Riesgo de error en fronteras entre dominios y en consultas ambiguas o de temática mixta; conviene calibrar umbrales de confianza en producción.
- No se documentan sesgos específicos del dataset de entrenamiento ni la composición de este, lo que dificulta auditar comportamientos discriminatorios por dominio o idioma.
- Aunque la licencia es Apache 2.0 y permite uso comercial, debe verificarse la licencia del modelo base vllm-sr/Vela-1.0-Encoder-307M y de los datos de entrenamiento originales.
- El repositorio ocupa 5,0 GB, tamaño considerable para un modelo de 307M, probablemente por incluir múltiples formatos de pesos; conviene descargar solo los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Colección de modelos Vela: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Modelo de referencia mmBERT32K Domain: https://huggingface.co/vllm-sr/mmbert32k-intent-classifier-merged
- Documentación: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
