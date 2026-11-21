# LocalWisdom/Penny-Alpha

## Resumen
Penny Alpha es un modelo de lenguaje base de 59 millones de parámetros desarrollado por LocalWisdom, un proyecto que apuesta por modelos pequeños y de ejecución local. El modelo se ha entrenado desde cero sobre la arquitectura DeepSeek V4.1 Flash, una propuesta que combina mezcla de expertos (MoE), atención dispersa, mecanismos "Engram" e hiperconexiones. Se distribuye con licencia MIT y pesos en safetensors y GGUF.

El modelo se entrenó con 1.000 millones de tokens en inglés del dataset Ultra-FineWeb-L3, empaquetados en ventanas de 8.192 tokens, en una única GPU RTX 5060 Ti durante aproximadamente un día y medio, con un coste estimado de 5,64 dólares. Es un modelo base sin ajuste por instrucciones ni plantilla de chat: continúa texto, no sigue órdenes.

Su relevancia es fundamentalmente experimental y educativa. Permite estudiar el comportamiento de una arquitectura tipo DeepSeek a escala reducida y sirve como banco de pruebas para despliegues locales en hardware muy modesto, incluido CPU. No está pensado para producción ni para tareas que requieran fiabilidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek V4.1 Flash (MoE, atención dispersa, Engram, hiperconexiones) |
| Parametros totales | 58.935.708 (59M) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento); la arquitectura soporta hasta 1M de forma nativa, pero no se entrenó para ello |
| Tipos de cuantizacion | GGUF disponible en repositorio aparte (LocalWisdom/Penny-Alpha-GGUF); niveles concretos no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código de modelado propio en `model.py`); GGUF |

## Arquitectura y entrenamiento
Penny Alpha emplea la arquitectura DeepSeek V4.1 Flash, que combina mezcla de expertos con atención dispersa, componentes denominados Engram e hiperconexiones. No se detalla en la información disponible el número de expertos, la proporción de parámetros activos ni la configuración exacta de la atención dispersa. El código de modelado se distribuye dentro del propio repositorio (`model.py`) y requiere `trust_remote_code=True` en Transformers.

El entrenamiento se realizó desde cero sobre 1.000 millones de tokens en inglés del dataset Ultra-FineWeb-L3, empaquetados en secuencias de 8.192 tokens. No se menciona uso de RLHF, DPO ni ningún tipo de ajuste posterior. La implementación incluida no dispone de caché KV, por lo que cada token nuevo re-ejecuta la secuencia completa (`use_cache=False` es obligatorio). Tampoco se incluyen los componentes de predicción multi-token (DSpark/MTP) ni de visión de la arquitectura completa.

## Capacidades
- Generación de texto por continuación de documento: el modelo no sigue instrucciones ni mantiene formato de chat.
- Razonamiento y conocimiento factual muy limitados, coherentes con su tamaño y volumen de entrenamiento.
- No dispone de soporte de tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés.
- No incluye visión, audio ni modo de razonamiento explícito.
- Ejecutable en CPU y en GPU de gama baja; también disponible en GGUF para llama.cpp.

## Casos de uso
- Experimentación con arquitecturas tipo DeepSeek a pequeña escala: permite estudiar el comportamiento de MoE, atención dispersa e hiperconexiones sin infraestructura dedicada, modificando el código de `model.py`.
- Docencia y formación en entrenamiento de LLM: el coste de 5,64 dólares y una sola GPU hacen viable reproducir el pipeline completo con Ultra-FineWeb-L3.
- Pruebas de despliegue local en CPU: sirve para validar pipelines de inferencia (Transformers, llama.cpp) en entornos sin GPU antes de escalar a modelos mayores.
- Generación de texto de relleno o prototipos de UI: útil para maquetar interfaces de chat o demos donde la calidad del contenido no es crítica.
- Benchmarking de herramientas de inferencia: al ser un modelo diminuto y sin caché KV, es útil para medir sobrecarga de frameworks y comparar implementaciones.
- Investigación sobre limitaciones de modelos pequeños: permite analizar patrones de repetición, alucinación y degradación con la longitud de contexto en modelos de 59M.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB en float32 para los 59M de parámetros (unos 236 MB de pesos); en bfloat16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el autor lo entrenó en una RTX 5060 Ti. Funciona en GTX 1650, RTX 3050 o superiores.
- Cabe en cualquier GPU de consumo e incluso en CPU; el autor indica que la GPU es opcional.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (float32 recomendado, bfloat16 también carga con posibles diferencias); llama.cpp mediante el repositorio GGUF.
- Latencia y throughput: no disponibles. La ausencia de caché KV implica que el coste por token crece con la longitud de la secuencia; a 59M de parámetros sigue siendo manejable.
- Restricciones de uso: batch size 1 o prompts de igual longitud sin padding, ya que la máscara de atención se ignora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Penny Alpha | 59M | 8.192 (entrenado) | MIT | Hugging Face (safetensors, GGUF) | Base, sin instrucciones, arquitectura DeepSeek V4.1 Flash |
| SmolLM2-135M | 135M | 8.192 | Apache 2.0 | Hugging Face | Base e instruct, más parámetros y datos de entrenamiento |
| Qwen2.5-0.5B | 500M | 32.768 | Apache 2.0 | Hugging Face | Base e instruct, multilingüe |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face | Referencia histórica, solo inglés |

No se dispone de datos de rendimiento comparativo de Penny Alpha frente a estas alternativas.

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones: no responde a órdenes ni mantiene conversaciones.
- Calidad de texto baja: el autor advierte de texto fluido en apariencia pero con repeticiones frecuentes y errores factuales.
- Solo inglés y sin ajuste de seguridad; puede generar contenido inapropiado.
- Contexto efectivo limitado a 8.192 tokens pese al soporte nativo de 1M en la arquitectura.
- Sin caché KV: la inferencia es más lenta de lo habitual y no escala bien a secuencias largas.
- La máscara de atención se ignora, lo que impide el uso de padding y batching heterogéneo.
- No incluye los componentes de predicción multi-token ni visión de la arquitectura completa.
- Licencia MIT permite uso comercial, pero la calidad del modelo lo hace inadecuado para producción sin ajuste previo.

## Enlaces
- Hugging Face: https://huggingface.co/LocalWisdom/Penny-Alpha
- GGUF: https://huggingface.co/LocalWisdom/Penny-Alpha-GGUF
- Dataset: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Organización: https://huggingface.co/LocalWisdom
