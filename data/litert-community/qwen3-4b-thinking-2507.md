# litert-community/Qwen3-4B-Thinking-2507

## Resumen

Qwen3-4B-Thinking-2507 es un modelo de razonamiento denso de 4.000 millones de parámetros desarrollado por Qwen, y esta ficha describe la conversión oficial al formato **LiteRT-LM** (`.litertlm`) publicada por la comunidad LiteRT (antes TFLite) bajo el identificador `litert-community/Qwen3-4B-Thinking-2507`. El modelo opera exclusivamente en modo *thinking*: genera una cadena de razonamiento delimitada por ` thinking… response` antes de emitir la respuesta final, lo que lo hace adecuado para tareas que requieren razonamiento explícito y verificable.

La relevancia de este artefacto radica en que permite ejecutar un modelo de razonamiento de 4B en dispositivos móviles y de borde (iPhone, Android, Mac) gracias a una cuantización int4 con bloque de 128 y a la integración con el runtime LiteRT-LM de Google. El modelo base, Qwen/Qwen3-4B-Thinking-2507, es una actualización de la serie Qwen3 que mejora el razonamiento lógico, matemático, científico y de codificación. El artefacto publicado incluye el tokenizador y la plantilla de chat Qwen3 (ChatML) integrados en el bundle, por lo que no requiere archivos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, 36 capas) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4096 (KV cache del artefacto LiteRT-LM) |
| Tipos de cuantizacion | int4 simetrico block 128 (publicado); block 32 descartado por degradacion |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta multiples idiomas, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, incluye tokenizador y plantilla de chat) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 36 capas con arquitectura Qwen3ForCausalLM. La conversion a LiteRT-LM aplica cuantizacion int4 simetrica de pesos con **OCTAV** (optimal clipping) y embeddings INT8 externalizados. El artefacto publicado usa bloques de 128 elementos (block 128), que segun los autores es robusto en todos los backends, aproximadamente un 40 % mas rapido en decodificacion que la variante block 32 (por tener la cuarta parte de escalas de dequantizacion) y mantiene una perdida de solo 4 puntos en GSM8K respecto al modelo en bf16. La variante block 32 se descarto porque degradaba 9 puntos y producia salidas corruptas bajo el delegado GPU de iPhone.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la documentacion proporcionada. La conversion en si no implica reentrenamiento, solo cuantizacion y optimizacion de grafos (fused QKV, RoPE compuesta, proyecciones Gate/Up fusionadas) para el runtime LiteRT-LM.

## Capacidades

- Razonamiento explicito con cadena de pensamiento: genera un bloque ` thinking… response` antes de la respuesta final, lo que permite seguir el proceso de razonamiento.
- Matematicas: alcanza un 86 % en GSM8K (n=100, greedy, 0-shot CoT) con cuantizacion int4 block 128, frente al 90 % del modelo en bf16.
- Razonamiento logico, cientifico y de codificacion: el modelo base Qwen3-4B-Thinking-2507 esta disenado para tareas que requieren razonamiento profundo, segun la descripcion oficial de Qwen.
- Generacion de texto en formato ChatML (Qwen3) con tokenizador integrado en el bundle.
- Inferencia on-device: compatible con CPU y GPU (Metal en Apple, GPU en Android) a traves del runtime LiteRT-LM.
- No se especifica soporte para tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de razonamiento en movil: un usuario puede plantear problemas logicos o matematicos y recibir una respuesta con la cadena de razonamiento explicita, gracias a la ejecucion local en iPhone o Android con el runtime LiteRT-LM.
- Tutor educativo offline: el modelo puede explicar paso a paso la resolucion de ecuaciones o problemas de fisica, aprovechando su modo thinking y su capacidad para generar cadenas de razonamiento legibles.
- Generacion de codigo en entornos sin conexion: desarrolladores pueden usar el modelo en un portatil o dispositivo edge para obtener sugerencias de codigo con razonamiento, sin depender de APIs externas.
- Servidor local compatible con OpenAI: mediante `litert-lm serve` se puede exponer una API local compatible con OpenAI para integrar el modelo en aplicaciones de prueba o prototipos sin coste de inferencia en la nube.
- Analisis de datos y calculo cientifico en campo: investigadores que trabajan en ubicaciones remotas pueden ejecutar el modelo en un Mac o dispositivo movil para resolver problemas numericos o de razonamiento sin conexion.
- Chatbot de soporte tecnico con explicaciones: el modelo puede generar respuestas razonadas para diagnosticar problemas, mostrando el proceso de pensamiento que lleva a la solucion, lo que resulta util en entornos de atencion al cliente especializada.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es GSM8K (n=100, greedy, 0-shot chain-of-thought, max_tokens 2048, misma plantilla y extraccion de respuesta para todas las filas):

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 90,0 % |
| LiteRT int4 block 128 | 86,0 % (−4 pt) |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion proporcionada. Los autores advierten que evaluar un modelo de razonamiento con un presupuesto de tokens corto subestima el rendimiento de la version int4, ya que las cadenas de razonamiento mas largas se truncan antes de llegar a la respuesta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB de RAM libre para el modelo int4 de 4B (segun la model card para Android).
- GPU recomendadas: Apple M4 Max (GPU Metal) para rendimiento optimo; iPhone 17 Pro (GPU Metal) para inferencia movil; GPU en dispositivos Android compatibles con LiteRT-LM.
- Tambien funciona en CPU: en Apple M4 Max se midieron 111 tok/s de prefill y 17,8 tok/s de decodificacion en CPU.
- Opciones de despliegue: LiteRT-LM CLI (`litert-lm run`), servidor OpenAI-compatible (`litert-lm serve`), Google AI Edge Gallery (app movil, version 1.0.16+ puede importar modelos directamente desde Hugging Face), y runtime Swift para iOS.
- Rendimiento medido (litert-lm 0.15.0, Apple M4 Max, `-p 256 -d 256 --runs 3`):

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max | CPU | 111 tok/s | 17,8 tok/s | 2,48 s |
| Apple M4 Max | GPU (Metal) | 999 tok/s | 68,5 tok/s | 0,28 s |
| iPhone 17 Pro | GPU (Metal) | no disponible | ~14 tok/s | no disponible |

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | GSM8K (0-shot CoT) | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B-Thinking-2507 (bf16, referencia) | 4B | 256K (original) | bf16 | 90 % | Apache 2.0 |
| litert-community/Qwen3-4B-Thinking-2507 (int4 block 128) | 4B | 4096 (KV cache del artefacto) | `.litertlm` int4 | 86 % | Apache 2.0 |
| Qwen3-4B (no thinking, sin datos de esta conversion) | 4B | 256K (original) | varios | no disponible | Apache 2.0 |

No se dispone de datos de benchmarks comparativos con otros modelos de razonamiento de tamano similar (p. ej., Llama-3.2-3B o Gemma-3-4B) en la informacion proporcionada. La comparativa se limita al modelo base y a la variante no cuantizada.

## Limitaciones y advertencias

- Es un modelo de razonamiento que requiere `max_tokens` >= 2048; con limites inferiores se corta a mitad de la cadena de pensamiento y nunca llega a la respuesta.
- La cuantizacion int4 introduce una perdida de 4 puntos en GSM8K respecto al modelo en bf16; la variante block 32 (no publicada) degradaba 9 puntos y producia salidas corruptas en GPU de iPhone.
- El contexto del artefacto LiteRT-LM esta limitado a 4096 tokens (KV cache), muy por debajo de los 256K del modelo base original.
- No se especifican sesgos conocidos ni riesgos de alucinacion en la documentacion proporcionada; como todo LLM, puede generar respuestas incorrectas o inventadas, especialmente en tareas abiertas.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero el runtime LiteRT-LM y las herramientas asociadas tienen sus propias condiciones (revisar la documentacion de Google AI Edge).
- El rendimiento en CPU es notablemente inferior al de GPU (17,8 tok/s frente a 68,5 tok/s en decodificacion), lo que puede afectar a la experiencia de usuario en dispositivos sin aceleracion grafica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3-4B-Thinking-2507
- Repositorio de archivos: https://huggingface.co/litert-community/Qwen3-4B-Thinking-2507/tree/main
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Repositorio oficial de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3-4b-thinking-2507
- Ficha en LLM Explorer: https://llm-explorer.com/model/Qwen%2FQwen3-4B-Thinking-2507,7wvPAPnjNUW6sq3acnRzWg
