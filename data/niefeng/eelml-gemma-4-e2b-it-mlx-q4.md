# niefeng/eelml-gemma-4-e2b-it-mlx-q4

## Resumen

EELML Gemma 4 E2B IT es un paquete físico de un solo archivo, compilado por EELML Studio a partir del modelo `google/gemma-4-E2B-it` de Google DeepMind. No se distribuye el checkpoint original, sino un paquete pre-cuantizado en Q4 y pre-ordenado para la ruta de ejecución dedicada `mlx_gemma4_e` del runtime EELML, que realiza verificación del paquete, mapeo de solo lectura, binding de memoria zero-copy y cómputo sin cargar ni transformar los pesos en tiempo de ejecución.

El modelo subyacente, Gemma 4 E2B, es el miembro más pequeño de la familia Gemma 4 con 2.1 mil millones de parámetros, pensado para dispositivos de borde, sistemas embebidos y aplicaciones de latencia ultrabaja, con capacidad de ejecución completa en CPU. Este paquete EELML solo incluye la ruta de generación de texto; no expone las rutas multimodales (imagen, audio o vídeo) del modelo original. El repositorio fue creado el 21 de agosto de 2026 y presenta cero descargas y cero likes, lo que indica que es un paquete muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4 de Google DeepMind) |
| Parametros totales | 2.1B (modelo subyacente) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 8K tokens (segun gemma4.dev para Gemma 4 E2B; la familia Gemma 4 soporta hasta 256K tokens) |
| Tipos de cuantizacion | Q4 (cuantizacion MLX especifica del paquete, `mlx_gemma4_e_q4_v1`) |
| Idiomas soportados | No disponibles en la informacion; la familia Gemma 4 mantiene soporte multilingue en mas de 140 idiomas |
| Licencia | Apache-2.0 (tanto el modelo subyacente como el paquete) |
| Formato de pesos | Paquete fisico de un solo archivo `.eelml` (no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

El modelo subyacente, Gemma 4 E2B, es un transformer denso de 2.1B parámetros desarrollado por Google DeepMind, el más pequeño de la familia Gemma 4, que también incluye variantes con arquitectura MoE (26B A4B) y densas de mayor tamaño (12B y 31B). La familia Gemma 4 se caracteriza por su soporte multilingüe en más de 140 idiomas y una ventana de contexto de hasta 256K tokens en los modelos más grandes, aunque el E2B se limita a 8K tokens.

El paquete EELML no contiene el checkpoint original ni sus pesos en formato estándar. Se trata de un paquete físico compilado que incluye el modelo pre-cuantizado en Q4, un manifiesto interno y un hash SHA-256 (`ffdf60db...`). El runtime EELML realiza la verificación del paquete, el mapeo de solo lectura y la unión zero-copy antes de ejecutar el cómputo. El paquete utiliza el template de chat `gemma4-turn-v1` y un adaptador de protocolo `gemma4-native-tool-v1@1` para la integración con herramientas. No se dispone de información sobre los datos de entrenamiento del modelo subyacente en la documentación proporcionada.

## Capacidades

- Generación de texto y seguimiento de instrucciones: modelo instrucción-tuned (IT) optimizado para conversación y tareas de texto.
- Soporte de tool calling / function calling: el paquete incluye un adaptador de protocolo `gemma4-native-tool-v1@1` que habilita la integración con herramientas nativas.
- Multilingüe: la familia Gemma 4 soporta más de 140 idiomas, aunque la información específica para el E2B no está disponible.
- Solo texto: el paquete EELML contiene únicamente la ruta de generación de texto; no expone las rutas de imagen, audio ni vídeo del modelo subyacente.
- Ejecución ligera: 2.1B parámetros y cuantización Q4 permiten ejecución en CPU y en dispositivos de borde.
- Template de chat dedicado: `gemma4-turn-v1` para formato de conversación multi-turno.

## Casos de uso

- Asistentes locales de IA en dispositivos de borde: con 2.1B parámetros y cuantización Q4, el modelo puede ejecutarse en dispositivos embebidos y Raspberry Pi 5, ofreciendo asistencia conversacional sin conexión.
- Aplicaciones de latencia ultrabaja: para sistemas que requieren tiempos de respuesta inferiores a decenas de milisegundos, como interfaces de voz locales o automatización industrial.
- Generación de texto en entornos con recursos limitados: el modelo cabe en dispositivos con 2 GB de RAM o menos, habilitando generación de texto en hardware antiguo o de bajo coste.
- Chatbots de soporte técnico interno: su capacidad de tool calling permite conectar el modelo a APIs internas de ticketing, documentación o bases de conocimiento.
- Clasificación y extracción de información en documentos: procesamiento de texto largo (hasta 8K tokens) para resumir, clasificar o extraer entidades de documentos técnicos.
- Desarrollo de prototipos en Apple Silicon: al estar compilado para MLX, permite probar aplicaciones de IA generativa en Macs con chips M1/M2/M3/M4 sin necesidad de GPU dedicada.
- Sistemas de generación de código ligero: integración en entornos de desarrollo integrados (IDE) para autocompletado y generación de código en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el paquete EELML ni para el modelo Gemma 4 E2B en la información proporcionada. La página `gemma4.wiki` menciona la existencia de benchmarks y guías de rendimiento, pero no se incluyen valores concretos en los resultados de búsqueda. No se inventan datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.5–2 GB para el modelo cuantizado en Q4 (2.1B parámetros × 4 bits), aunque el tamaño del paquete físico es de 2.6 GB.
- GPU recomendadas: no requiere GPU dedicada; el modelo puede ejecutarse completamente en CPU. Para aceleración MLX se requiere Apple Silicon (chips M1/M2/M3/M4).
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 2 GB de VRAM es suficiente, aunque el runtime EELML está orientado a MLX y por tanto a Apple Silicon.
- Opciones de despliegue: exclusivamente a través de EELML Studio (model manager). No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros frameworks estándar.
- Latencia y throughput: no disponible en la información proporcionada. La página gemma4.dev destaca "ultra-low-latency" para el modelo subyacente, pero no se dan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente el modelo EELML Gemma 4 E2B con alternativas. Como referencia cualitativa, los modelos comparables en la categoría de menos de 3B parámetros incluyen:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 E2B (EELML) | 2.1B | 8K | Apache-2.0 | `.eelml` (exclusivo EELML) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache-2.0 | safetensors, GGUF |
| Phi-3-mini | 3.8B | 128K | MIT | safetensors, GGUF |
| Gemma 2 2B | 2B | 8K | Gemma License | safetensors, GGUF |

La principal diferencia es el formato exclusivo `.eelml` del paquete EELML, que limita su uso a EELML Studio, frente a los formatos estándar de las alternativas que se despliegan en vLLM, Ollama o llama.cpp. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Formato propietario: el paquete `.eelml` solo puede ejecutarse con el runtime de EELML Studio. No es compatible con frameworks estándar como vLLM, llama.cpp, Ollama, Hugging Face Transformers o MLX directo.
- Verificación estricta: el runtime exige que el paquete, el runtime, el adaptador de protocolo y el template de chat coincidan en identidad; un desajuste rechaza la carga. No se debe renombrar otro archivo a `.eelml` ni seleccionar el paquete con un runtime diferente.
- Solo texto: el paquete no incluye las capacidades multimodales (imagen, audio, vídeo) del modelo subyacente. Si se necesitan esas capacidades, hay que usar el checkpoint original de Google.
- Ventana de contexto limitada: 8K tokens frente a los 256K de los modelos más grandes de la familia Gemma 4. Puede ser insuficiente para tareas de procesamiento de documentos extensos.
- Paquete sin adopción: 0 descargas y 0 likes en HuggingFace, lo que indica que no tiene validación de la comunidad ni casos de uso verificados en producción.
- Riesgo de alucinación: no hay datos específicos para este modelo, pero los modelos de 2B parámetros suelen presentar tasas de alucinación superiores a los modelos de mayor tamaño.
- Licencia: Apache-2.0 permite uso comercial, pero se debe cumplir con los requisitos de atribución del modelo subyacente de Google DeepMind.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/niefeng/eelml-gemma-4-e2b-it-mlx-q4
- Modelo original (Google): https://huggingface.co/google/gemma-4-E2B-it
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Guía de despliegue de Gemma 4 E2B: https://www.gemma4.wiki/models/gemma-4-e2b-model
- Gemma-4-E2B-it en Qualcomm AI Hub: https://aihub.qualcomm.com/models/gemma_4_e2b_it
