# Aobangaming/Luna-3-230m

## Resumen
Luna 3 230m es un modelo de lenguaje causal de pequeno tamano desarrollado por AobanZ (Aobangaming) y publicado en Hugging Face bajo licencia MIT. Con 228.838.656 parametros totales, se presenta como una evolucion de Luna 2, ampliando el tamano de 100M a 230M y la ventana de contexto hasta 8192 tokens. Su objetivo declarado es ofrecer una alternativa rapida y eficiente a modelos mayores como Llama o Qwen para conversacion y generacion de texto en ingles.

El modelo emplea una arquitectura transformer causal de 12 capas con 768 dimensiones ocultas, 12 cabezas de atencion, RMSNorm y RoPE, junto con atencion multi-cabeza (MHA) y atencion de producto escalar escalada (SDPA). Segun la model card, fue entrenado sobre un subconjunto de OpenAssistant (OASST1) en una unica RTX 3050 de 6 GB durante aproximadamente 5 horas, con una perdida final en torno a 1.9.

Su relevancia actual es limitada pero concreta: se trata de un modelo muy pequeno, entrenado con recursos minimos y orientado a experimentacion, conversacion casual y despliegue en hardware de gama baja. La model card menciona soporte para llama.cpp mediante un fork especifico denominado Lightning.cpp, lo que condiciona su uso practico fuera del ecosistema transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (12 capas, D_MODEL 768, 12 cabezas de atencion, RMSNorm, RoPE, MHA, SDPA); arquitectura propietaria "lightning" |
| Parametros totales | 228.838.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (segun model card; vocabulario ~100k con longitud de secuencia 8126) |
| Tipos de cuantizacion | no disponible de forma explicita; el repo contiene safetensors en BF16 y la model card menciona soporte via llama.cpp/Lightning.cpp, lo que permitiria cuantizaciones GGUF habituales |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1.8 GB); requiere `trust_remote_code=True` y codigo personalizado |

## Arquitectura y entrenamiento
Luna 3 es un transformer causal de 12 capas con 768 dimensiones de estado oculto y 12 cabezas de atencion, equipado con RMSNorm y RoPE. La model card indica que mantiene la arquitectura "Lightning" de la generacion anterior, con las unicas modificaciones de RMSNorm y RoPE actualizados. Usa atencion multi-cabeza (MHA) junto con atencion de producto escalar escalada (SDPA), y el entrenamiento se realizo con FlashAttention/SDPA. El vocabulario es de aproximadamente 100k tokens y la longitud de secuencia indicada en la tabla de hiperparametros es de 8126, mientras que el texto describe una ventana de contexto de 8k.

El entrenamiento se llevo a cabo sobre un subconjunto del dataset OpenAssistant (OASST1), con precision BF16, optimizador AdamW, tasa de aprendizaje 3e-4 y tamano de lote 17. La model card cita tambien HuggingFaceFW/fineweb entre los datasets, aunque la seccion de detalles de entrenamiento solo menciona OASST. La perdida final fue de aproximadamente 1.9. Todo el entrenamiento se ejecuto en una RTX 3050 de 6 GB durante unas 5 horas. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades
- Generacion de texto autoregresiva en ingles con soporte de plantilla de chat (`apply_chat_template`).
- Conversacion multi-turno orientada a chat casual y roleplay, segun la model card.
- Razonamiento basico y generacion de texto general, limitado por el tamano del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; las etiquetas del repo incluyen "agent", pero no se documenta ninguna capacidad funcional al respecto.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Integracion con text-generation-inference como tag del repo, aunque no se detalla compatibilidad efectiva.

## Casos de uso
- Experimentacion academica y prototipado rapido: el modelo cabe en GPUs de gama baja y permite iterar sobre pipelines de generacion de texto con transformers en minutos, lo que lo hace util para docencia y pruebas de concepto.
- Chat conversacional ligero en local: con 8192 tokens de contexto puede mantener conversaciones multi-turno en ingles en un portatil con GPU modesta, siempre que se acepte la calidad limitada de un modelo de 230M.
- Evaluacion de tecnicas de cuantizacion y despliegue: al ser muy pequeno, sirve como banco de pruebas para medir latencia y throughput con llama.cpp/Lightning.cpp, vLLM u otras herramientas antes de escalar a modelos mayores.
- Generacion de texto asistida en entornos con restricciones de hardware: despliegue en dispositivos con 6 GB de VRAM o menos para tareas de autocompletado o respuestas breves en ingles.
- Base para fine-tuning especifico: la model card recomienda explicitamente ajustar el modelo sobre texto nuevo; puede usarse como punto de partida para dominios acotados con datasets pequenos.
- Roleplay y generacion creativa de baja exigencia: la ventana de 8k y el entrenamiento sobre OASST permiten mantener personajes o contextos narrativos largos, aunque con coherencia limitada.
- Investigacion sobre arquitecturas no estandar: el modelo emplea una arquitectura "lightning" que requiere parches en llama.cpp, lo que lo convierte en objeto de estudio para quienes investigan variantes de transformers.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento citada es una velocidad de generacion de aproximadamente 130 tokens por segundo, sin especificar el hardware ni la configuracion de inferencia empleada.

## Requisitos de hardware
- VRAM estimada para inferencia: en BF16, los 228,8M de parametros ocupan aproximadamente 0,46 GB, mas overhead de activaciones y cache KV; en la practica cabe holgadamente en 2-4 GB de VRAM. Con cuantizacion a 8 bits o 4 bits el peso se reduce a unos 0,23 GB o 0,12 GB respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entreno el modelo en una RTX 3050 de 6 GB. Tambien es viable en CPU para inferencia con llama.cpp.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado), llama.cpp mediante el fork Lightning.cpp (necesario porque llama.cpp estandar falla con `unknown model architecture: 'lightning'`), y potencialmente text-generation-inference segun los tags. No se documenta soporte para vLLM, Ollama o TGI de forma explicita.
- Latencia y throughput: la model card indica aproximadamente 130 tokens por segundo, sin especificar hardware ni cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Luna 3 230m | 228,8M | 8192 | MIT | Ingles | Arquitectura propietaria "lightning"; requiere Lightning.cpp para llama.cpp; entrenado en RTX 3050 |
| SmolLM2-135M (HuggingFace) | 135M | 8192 | Apache 2.0 | Ingles y multilingue parcial | Referencia de la categoria de modelos diminutos; ampliamente soportado en llama.cpp y transformers |
| Qwen2.5-0.5B | 494M | 32768 | Apache 2.0 | Multilingue | Mayor tamano y contexto; soporte nativo en la mayoria de frameworks |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Ingles | Mayor capacidad pero mas exigente en hardware |

Los datos de SmolLM2, Qwen2.5 y TinyLlama se incluyen como referencia de categoria a partir de conocimiento general; la informacion proporcionada no incluye comparaciones oficiales ni benchmarks entre estos modelos y Luna 3.

## Limitaciones y advertencias
- Calidad limitada por el tamano: con 230M de parametros y entrenamiento sobre un subconjunto de OASST1, la model card advierte que las salidas pueden ser incompletas, inexactas, repetitivas o no relacionadas con la entrada.
- Riesgo de alucinacion elevado: el modelo no ha pasado por fases documentadas de RLHF o DPO, por lo que no hay alineacion ni salvaguardas incorporadas.
- Solo ingles: no se declara soporte multilingue; el uso en castellano producira resultados deficientes.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al entrenarse sobre OASST1 y posiblemente FineWeb, puede heredar sesgos de esos corpus.
- Restricciones de licencia: MIT permite uso comercial, pero la model card recomienda anadir guardrails y precauciones contra el mal uso; el usuario es responsable de las salvaguardas.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; ademas, llama.cpp estandar no funciona y es necesario el fork Lightning.cpp.
- Arquitectura no estandar: al no seguir una arquitectura ampliamente soportada, la integracion con herramientas del ecosistema (vLLM, TGI, Ollama) puede no estar disponible o requerir trabajo adicional.
- Documentacion incompleta: no hay benchmarks publicados, no se detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento, y la relacion entre la longitud de secuencia 8126 y el contexto de 8k no queda aclarada.
- No apto para produccion sin evaluacion previa: la propia model card indica que la salida debe evaluarse antes de usarse para otros propositos.

## Enlaces
- Hugging Face: https://huggingface.co/Aobangaming/Luna-3-230m
- Repositorio citado en la model card (generacion anterior): https://huggingface.co/Aobangaming/luna-2-70m
- Lightning.cpp (fork de llama.cpp para la arquitectura Lightning): https://github.com/AobanZu/lightning.cpp
- Web del autor: https://aobanweb.com
- Discord del proyecto: https://discord.gg/Ty775Ut26a
- Dataset OpenAssistant OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
