# LiquidAI/LFM2.5-2.6B-Base

## Resumen

LFM2.5-2.6B-Base es el checkpoint pre-entrenado de la familia LFM2.5 de Liquid AI, un modelo de texto de 2.6 mil millones de parametros diseñado especificamente para despliegue en dispositivos (on-device). Desarrollado por Liquid AI, este modelo base es la pieza inicial sobre la que se construyen las variantes post-entrenadas, como el LFM2.5-2.6B orientado a cargas de trabajo agénticas. Su arquitectura híbrida combina bloques de convolución corta de doble puerta con capas de atención GQA, lo que le permite procesar contextos de hasta 131.072 tokens con un presupuesto de entrenamiento de 34 billones de tokens.

Este checkpoint base está pensado exclusivamente para tareas de fine-tuning: asistentes específicos por idioma o dominio, entrenamiento con datos propietarios o experimentación con técnicas de post-entrenamiento. No está diseñado para inferencia directa en producción, a diferencia de su variante post-entrenada. Su relevancia actual radica en que ofrece una base compacta y eficiente para crear modelos especializados que puedan ejecutarse en hardware limitado, manteniendo una ventana de contexto muy amplia para su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 22 bloques de convolución corta de doble puerta + 8 capas GQA |
| Parametros totales | 2.697.198.592 (2.69B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponibles para este checkpoint base; la variante post-entrenada ofrece GGUF, ONNX y MLX |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, español, tailandes, vietnamita |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LFM2.5-2.6B-Base emplea una arquitectura híbrida que combina 22 bloques de convolución corta de doble puerta (double-gated short convolution) con 8 capas de atención GQA (Grouped Query Attention). Este diseño busca capturar patrones locales mediante convoluciones y patrones globales mediante atención, reduciendo el coste computacional frente a un transformer denso puro. El vocabulario tiene un tamaño de 128.000 tokens, lo que permite una cobertura multilingüe amplia.

El entrenamiento se realizó con un presupuesto de 34 billones de tokens, una cifra notable para un modelo de 2.6B. Según la documentación de Liquid AI, la familia LFM2.5 se construye sobre la arquitectura LFM2 con pre-entrenamiento extendido y aprendizaje por refuerzo. Sin embargo, este checkpoint base es el resultado únicamente del pre-entrenamiento, sin las etapas de RLHF o DPO que se aplican a la variante post-entrenada. No se han publicado detalles adicionales sobre la composición exacta del dataset de pre-entrenamiento.

## Capacidades

- Generación de texto autocompletiva en 16 idiomas, con especial énfasis en inglés y español.
- Procesamiento de contextos muy largos (hasta 131.072 tokens) gracias a su ventana de contexto ampliada.
- Soporte multilingüe: arabe, chino, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, español, tailandes, vietnamita e ingles.
- Capacidad de fine-tuning para tareas específicas: asistentes por dominio, idiomas concretos o datos propietarios.
- No incluye capacidades de tool calling, razonamiento agéntico ni modo thinking, ya que esas funciones se añaden en la fase de post-entrenamiento (variante LFM2.5-2.6B).
- No es un modelo multimodal: solo procesa texto.

## Casos de uso

- Fine-tuning para asistentes médicos especializados: el modelo base puede adaptarse con datos clínicos propios para crear un asistente de consulta en español, aprovechando su ventana de 131K tokens para manejar historiales clínicos extensos.
- Asistentes jurídicos en un idioma concreto: gracias a su soporte multilingüe y su tamaño compacto, se puede ajustar con jurisprudencia local y desplegar en dispositivos con recursos limitados.
- Chatbots de atención al cliente en empresas con datos propietarios: el base permite entrenar un modelo con el tono y los procedimientos de la empresa, evitando depender de APIs externas.
- Experimentación con técnicas de post-entrenamiento: investigadores pueden aplicar DPO, RLHF o métodos novedosos sobre este checkpoint base para estudiar su impacto en un modelo de 2.6B.
- Generación de código en entornos sin conexión: tras un fine-tuning con corpus de código, el modelo puede ejecutarse localmente en portátiles o dispositivos edge para asistencia de programación.
- Traducción automática especializada en dominios técnicos: el base puede ajustarse con pares de texto técnico (por ejemplo, español-japones) para producir un traductor de alta calidad en un área concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el checkpoint LFM2.5-2.6B-Base en la informacion disponible. La documentacion de Liquid AI menciona que la variante post-entrenada LFM2.5-2.6B alcanza 220 tokens por segundo en dispositivos con menos de 2.5 GB de memoria, pero esos datos corresponden al modelo ajustado, no al base. No se dispone de cifras de MMLU, HumanEval, GSM8K u otros benchmarks estandar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 5.4 GB (tamano del repo en safetensors), aunque el peso real es de 2.69B parametros, lo que en fp16 ocupa unos 5.4 GB.
- Con cuantizacion a 8 bits: alrededor de 2.7 GB; a 4 bits: unos 1.4 GB, lo que permite ejecucion en GPUs consumer de gama media.
- GPU recomendadas: RTX 3060 12GB o superior para fp16; RTX 4060 o incluso integradas con suficiente VRAM para cuantizaciones bajas.
- Cabe en GPUs consumer: si, con cuantizacion. En fp16 requiere al menos 6 GB de VRAM.
- Opciones de despliegue: Transformers (con `transformers>=5.0.0`), vLLM, SGLang, llama.cpp (si se convierte a GGUF), MLX para Apple Silicon, LM Studio.
- Latencia y throughput: no disponibles para este checkpoint base; el modelo post-entrenado reporta 220 tok/s en hardware edge, pero el base no tiene cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Base | 2.69B | 131.072 | 16 | lfm1.0 | Hugging Face |
| Qwen2.5-3B | 3.09B | 131.072 | 29+ | Apache 2.0 | Hugging Face |
| Gemma-2-2.6B | 2.6B | 8.192 | 28 | Gemma license | Hugging Face |
| Phi-3.5-mini | 3.8B | 128.000 | 20+ | MIT | Hugging Face |

El LFM2.5-2.6B-Base destaca por su contexto de 131K tokens, comparable al de Qwen2.5-3B y superior al de Gemma-2-2.6B. Su licencia lfm1.0 es restrictiva en comparacion con Apache 2.0 o MIT, lo que puede limitar su uso comercial. En cuanto a rendimiento, no hay datos publicados para el base, mientras que Qwen2.5-3B y Gemma-2-2.6B tienen benchmarks ampliamente documentados.

## Limitaciones y advertencias

- Es un modelo base pre-entrenado: no debe usarse directamente para tareas de chat, agente o generacion conversacional sin un fine-tuning previo. Su salida no esta alineada con instrucciones.
- Licencia lfm1.0: licencia propietaria de Liquid AI. Es necesario revisar los terminos exactos, especialmente para uso comercial y redistribucion, ya que puede imponer restricciones adicionales frente a licencias open source tradicionales.
- Riesgo de alucinacion y sesgos: al ser un modelo pre-entrenado sin alineacion, puede generar contenido inexacto, ofensivo o sesgado si se usa sin supervisión.
- No soporta tool calling ni razonamiento agéntico de forma nativa: esas capacidades solo estan presentes en la variante post-entrenada LFM2.5-2.6B.
- Limitaciones de idioma: aunque cubre 16 idiomas, el rendimiento puede variar significativamente entre ellos; idiomas con menos representacion en el entrenamiento (como tailandes o vietnamita) probablemente tengan peor calidad que ingles o español.
- Requiere `transformers>=5.0.0`: la integracion con versiones anteriores de Transformers puede no funcionar correctamente.
- No se proporcionan benchmarks oficiales para este checkpoint, lo que dificulta evaluar su calidad relativa antes de invertir en fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base
- Variante post-entrenada LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Blog de presentacion de LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Documentacion oficial de LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Paper asociado (arXiv): arxiv:2511.23404
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion de inferencia: https://docs.liquid.ai/lfm/inference/transformers
