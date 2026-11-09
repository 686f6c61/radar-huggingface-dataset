# JonusNattapong/LFM3-Omni-2B-Adaptive-CoT-GGUF

## Resumen

LFM3-Omni-2B-Adaptive-CoT es un ajuste fino del modelo JonusNattapong/LFM3-Omni-2B-abliterated, una variante "abliterated" (sin mecanismos de rechazo) de la familia LFM3-Omni de 2.000 millones de parametros. El autor, JonusNattapong, lo ha entrenado con un conjunto de 5.000 ejemplos para incorporar un modo de razonamiento adaptativo (Adaptive CoT) que decide dinamicamente entre una respuesta rapida sin cadena de pensamiento y una respuesta con razonamiento profundo, segun la dificultad de la consulta.

La arquitectura es hibrida (convolucional + atencion), segun declara la model card, y esta distribuida exclusivamente en formato GGUF con cuatro niveles de cuantizacion (Q4_K_M, Q5_K_M, Q6_K y Q8_0) pensados para despliegue local con Ollama o llama.cpp. El modelo esta orientado a generacion de texto y soporta tailandes e ingles.

Su relevancia practica reside en el enfoque de eficiencia: un modelo de 2B con contexto de 8.192 tokens, licencia Apache 2.0 y pesos de entre 1,3 y 2,2 GB, apto para portatiles y entornos de borde. No obstante, se trata de un ajuste comunitario sin benchmarks publicados ni validacion independiente, por lo que su calidad real debe verificarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (convolucional + atencion), segun model card |
| Parametros totales | 2B (2.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (valor usado en el ejemplo de llama-server) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card describe una arquitectura hibrida que combina capas convolucionales con capas de atencion, siguiendo la linea de la familia LFM3-Omni. No se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo exacto de mezcla conv/attention. El modelo parte de una version "abliterated" del modelo base, es decir, una variante en la que se ha eliminado (mediante tecnicas de abliteration) la direccion de activacion asociada al rechazo de instrucciones.

El ajuste fino se realizo sobre 5.000 ejemplos que combinan dos regimenes. El primero, denominado Fast Path, entrena al modelo para responder de inmediato con un bloque `<think></think>` vacio ante consultas simples (saludos, comandos Git, comandos de sistema), lo que reduce la latencia. El segundo, Deep CoT Path, entrena la generacion de cadenas de pensamiento multi-paso dentro de `<think>...</think>` para problemas matematicos, analisis de seguridad y tareas de razonamiento complejo. El autor indica que este segundo modo busca extraer capacidades de razonamiento inspiradas en DeepSeek-R1. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto en tailandes e ingles.
- Razonamiento adaptativo: conmutacion entre respuesta directa (sin CoT) y cadena de pensamiento explicita mediante etiquetas `<think>`.
- Razonamiento matematico multi-paso en el modo Deep CoT.
- Analisis de comandos de sistema y Git, con respuestas tecnicas directas.
- Modo "uncensored": el ajuste elimina los rechazos, de modo que responde a practicamente cualquier peticion tecnica sin filtros morales declarados.
- Ajuste para agentes de voz y CLI en tiempo real gracias al Fast Path de baja latencia.
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat en llama-server.
- Tool calling / function calling: no disponible (no se menciona en la informacion).
- Vision o audio: no disponible pese al nombre "Omni"; la model card solo declara pipeline de text-generation.
- Capacidades multilingues fuera de th/en: no disponible.

## Casos de uso

- Agentes de voz y asistentes en tiempo real: el Fast Path devuelve respuestas inmediatas con `<think></think>` vacio para saludos y ordenes cortas, lo que reduce la latencia en pipelines de ASR + LLM + TTS.
- Asistente de linea de comandos: responde a consultas sobre comandos Git y de sistema de forma directa, adecuado para integrarse en herramientas CLI locales.
- Tutoria de matematicas: el Deep CoT genera el desarrollo paso a paso de problemas aritmeticos y algebraicos dentro de `<think>`, util para entornos educativos que muestran el razonamiento.
- Analisis de configuraciones y seguridad: puede revisar comandos o scripts y explicar riesgos, con la advertencia de que el modo uncensored elimina filtros de seguridad.
- Despliegue en portatiles y dispositivos de borde: con Q4_K_M (1,3 GB) cabe en equipos con 8 GB de RAM y permite inferencia CPU-only mediante Ollama o llama.cpp.
- Prototipado rapido de aplicaciones de razonamiento: sirve para validar flujos de "pensar antes de responder" en local antes de migrar a modelos mayores.
- Procesamiento de texto en tailandes e ingles: traduccion y generacion bilingue en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,3 GB (Q4_K_M), 1,5 GB (Q5_K_M), 1,7 GB (Q6_K) y 2,2 GB (Q8_0), mas el overhead de contexto KV cache para 8.192 tokens.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con 4-8 GB de VRAM es suficiente (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas; tambien en CPU-only y en moviles con la cuantizacion Q4_K_M.
- Opciones de despliegue: Ollama (via Modelfile incluido), llama.cpp / llama-server (con `--ctx-size 8192 --jinja`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; el autor afirma respuestas "en fracciones de segundo" en Fast Path, pero sin cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Adaptive-CoT | 2B | 8.192 | Apache 2.0 | GGUF | Ajuste comunitario, CoT adaptativo, sin benchmarks |
| LFM3-Omni-2B-abliterated (base) | 2B | no disponible | Apache 2.0 | no disponible | Modelo de partida, sin el ajuste CoT |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Referencia de la misma escala con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community | safetensors, GGUF | Alternativa de escala similar con contexto amplio |

La comparacion con Qwen2.5-1.5B y Llama-3.2-1B se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo analizado para confrontarlos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que las afirmaciones de la model card no estan verificadas de forma independiente.
- Modo "100% uncensored": la abliteration elimina los rechazos, lo que incrementa el riesgo de generar contenido danino, instrucciones peligrosas o material inapropiado; no es apto para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo de alucinacion elevado en un modelo de 2B, especialmente en el modo Deep CoT, donde el razonamiento generado puede parecer plausible pero ser incorrecto.
- Cobertura linguistica limitada a tailandes e ingles; el rendimiento en castellano no esta documentado.
- Contexto de 8.192 tokens, inferior al de alternativas contemporaneas de escala similar.
- El ajuste se realizo con solo 5.000 ejemplos, un volumen reducido que puede provocar sobreajuste a los formatos de entrenamiento y degradar capacidades generales del modelo base.
- Aunque la licencia es Apache 2.0, el uso comercial debe considerar las obligaciones de la licencia del modelo base original de la familia LFM3-Omni.
- El nombre "Omni" no implica capacidades multimodales: el pipeline declarado es exclusivamente text-generation.
- Modelo con cero descargas y cero likes en el momento de la ficha: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-Adaptive-CoT-GGUF
- Modelo base (abliterated): https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
