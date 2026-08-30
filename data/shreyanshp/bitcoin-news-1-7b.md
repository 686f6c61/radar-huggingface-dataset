# shreyanshp/bitcoin-news-1.7b

## Resumen

bitcoin-news-1.7b es un asistente conversacional de pequeño tamaño, especializado en responder preguntas educativas sobre Bitcoin y criptomonedas, desarrollado por el usuario shreyanshp. Está diseñado para ejecutarse completamente offline en dispositivos móviles, lo que lo hace adecuado para entornos con conectividad limitada o para aplicaciones que priorizan la privacidad. El modelo parte de la base Qwen/Qwen3-1.7B de PrismML, un modelo transformer de 1.700 millones de parámetros con licencia Apache-2.0, y ha sido fine-tuneado con material educativo de bitcoin.com, transcripciones de vídeo y ejemplos de rechazo para evitar alucinaciones sobre datos en tiempo real.

La relevancia de este modelo radica en su enfoque en cuantización extrema: el autor ha experimentado con capas Q1_0 (1 bit) combinadas con embeddings Q4_K para reducir el tamaño del archivo a menos de 800 MB, manteniendo una calidad aceptable en tareas específicas del dominio. Según la model card, el modelo supera al base sin fine-tune en benchmarks propios, aunque sigue siendo un modelo pequeño con limitaciones claras. Está pensado para usuarios principiantes que necesitan respuestas fiables sobre conceptos fundamentales de Bitcoin, no para información financiera en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con embeddings atados |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S, IQ4_XS (con capas Q1_0 en embeddings) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-1.7B, un transformer decoder-only con embeddings de token y proyección de salida atados (no hay `output.weight` separado). Esta característica es clave para la estrategia de cuantización: al compartir la matriz de embeddings, el tensor `token_embd` genera todos los logits, por lo que su precisión afecta directamente a la calidad de salida. El autor opta por cuantizar las capas internas a Q1_0 (1 bit) pero mantener los embeddings en Q4_K, un compromiso que añade ~130 MB al archivo pero preserva la calidad del tensor más influyente.

El entrenamiento utilizó datos de páginas educativas de bitcoin.com (corpus `/get-started/`), divididas por artículo para evitar fugas entre train y test, transcripciones del canal de YouTube de Bitcoin.com, ejemplos de rechazo construidos manualmente para preguntas sobre precios en vivo o noticias actuales, y un replay de instrucciones generales de UltraChat (MIT) para mantener la capacidad conversacional básica. Se excluyeron deliberadamente artículos de noticias fechados y la sección de juegos de azar del sitio, para evitar que hechos obsoletos se conviertan en alucinaciones confiadas.

## Capacidades

- Generacion de texto conversacional en ingles, orientado a preguntas y respuestas sobre Bitcoin y criptomonedas.
- Conocimiento educativo sobre fundamentos de Bitcoin: conceptos basicos, carteras, seguridad, mineria, transacciones.
- Rechazo explicito de preguntas sobre precios en tiempo real, comisiones actuales o noticias recientes, entrenado para no inventar datos.
- Capacidad de seguir instrucciones generales gracias al replay de UltraChat, aunque con menor rendimiento que el modelo base en tareas no relacionadas con el dominio.
- Ejecucion offline completa, sin necesidad de conexion a internet ni API externas.
- Compatible con el ecosistema llama.cpp y herramientas que consumen GGUF (Ollama, llama-cpp-python, etc.).

## Casos de uso

- Asistente educativo integrado en una app movil de carteras de Bitcoin: el modelo puede explicar conceptos como "que es una clave privada" o "como funciona una transaccion" sin conexion, ayudando a usuarios novatos a entender los fundamentos antes de operar.
- Guia de seguridad para principiantes: responde preguntas sobre practicas seguras de almacenamiento, phishing y proteccion de fondos, basandose en el corpus educativo de bitcoin.com.
- Chatbot de soporte en una plataforma de formacion sobre criptomonedas: al estar entrenado con material de referencia, puede responder dudas frecuentes de alumnos sin depender de un servidor central.
- Demo de cuantizacion extrema en dispositivos edge: sirve como caso de estudio para desarrolladores que quieran evaluar el impacto de Q1_0 en la calidad de un modelo de dominio especifico.
- Herramienta de consulta offline para periodistas o investigadores que necesitan recordar definiciones y conceptos estandar de Bitcoin sin acceso a internet.
- Componente de un sistema de agentes locales en un movil Android o iOS: al pesar menos de 1 GB, puede cargarse en memoria junto con otras aplicaciones sin degradar el rendimiento del dispositivo.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion propia, puntuada por un juez LLM contra respuestas de referencia escritas a mano. Las categorias incluyen guardas de capacidad general y humildad temporal (rechazo de datos en vivo). Se comparan varias versiones del modelo y el base sin fine-tune:

| Modelo | Overall | URL valid | tok/s | bitcoin_fundamentals | brand_identity | canonical_numbers | citation | crypto_concepts | general_ability | multilingual | practical_howto | temporal_humility | trading_investing | video_recall | wallet_security |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 qwen3-1.7b Q4_K_S (935MB) | **0.564** | 0.30 | 211 | 0.620 | 0.750 | 0.500 | 0.700 | 0.572 | 0.600 | 0.430 | 0.450 | 0.700 | 0.600 | 0.500 | 0.400 |
| v3 bitcoin-news-4b Q3_K_M (1883MB) | **0.553** | 0.67 | 90 | 0.632 | 0.500 | 0.500 | 0.500 | 0.620 | 0.867 | 0.350 | 0.425 | 0.600 | 0.500 | 1.000 | 0.425 |
| v5 qwen3-1.7b Q4_K_M (980MB) | **0.539** | 0.40 | 205 | 0.580 | 0.679 | 0.500 | 0.400 | 0.480 | 0.733 | 0.350 | 0.500 | 0.800 | 0.633 | 0.500 | 0.400 |
| v5 qwen3-1.7b IQ4_XS (893MB) | **0.503** | 0.30 | 216 | 0.560 | 0.607 | 0.800 | 0.400 | 0.460 | 0.800 | 0.400 | 0.350 | 0.500 | 0.500 | 0.500 | 0.375 |
| v3 bitcoin-news-4b Q1_0 (702MB) | **0.392** | - | 192 | 0.460 | 0.071 | 0.300 | 0.000 | 0.560 | 0.667 | 0.350 | 0.325 | 0.500 | 0.467 | 0.000 | 0.375 |
| qwen3-1.7b stock Q4_K_M (1056MB) | **0.328** | - | 191 | 0.440 | 0.071 | 0.300 | 0.000 | 0.420 | 0.500 | 0.050 | 0.400 | 0.300 | 0.500 | 0.000 | 0.275 |

Los resultados muestran que el fine-tune mejora sustancialmente el rendimiento en dominio (bitcoin_fundamentals, brand_identity, temporal_humility) frente al modelo base, aunque la puntuacion general sigue siendo modesta. La velocidad de generacion (tok/s) es alta, alrededor de 200 tok/s, lo que indica que el modelo es adecuado para inferencia en tiempo real en hardware modesto.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_S pesa 935 MB, por lo que cabe en GPUs con 2 GB de VRAM o incluso en RAM de un movil moderno. La version IQ4_XS pesa 768 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo sin problemas. Para CPU, un procesador moderno con 4 nucleos es suficiente.
- Compatible con dispositivos moviles: el modelo esta disenado para ejecutarse en telefonos, siempre que el backend de llama.cpp soporte la arquitectura (ver limitacion sobre Mali GPUs).
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime que consuma GGUF. No requiere vLLM ni TGI por su tamano reducido.
- Latencia y throughput: segun la tabla de benchmarks, se alcanzan ~200 tok/s en el hardware de prueba del autor, lo que se traduce en respuestas de pocos segundos para preguntas tipicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Puntuacion overall (benchmark propio) |
|---|---|---|---|---|---|
| bitcoin-news-1.7b (v5 Q4_K_S) | 1.7B | no disponible | Apache-2.0 | GGUF | 0.564 |
| bitcoin-news-4b (v3 Q3_K_M) | 4B | no disponible | Apache-2.0 | GGUF | 0.553 |
| Qwen3-1.7B (stock, Q4_K_M) | 1.7B | no disponible | Apache-2.0 | GGUF | 0.328 |

La comparativa se basa en los datos de la model card. El modelo de 1.7B fine-tuneado supera al de 4B en la puntuacion global, aunque el de 4B tiene mejor rendimiento en `general_ability` y `video_recall`. El modelo base sin fine-tune queda muy por detras en todas las categorias de dominio, lo que confirma el valor del entrenamiento especifico. No se dispone de comparaciones con otros modelos de la misma categoria fuera de este conjunto.

## Limitaciones y advertencias

- No tiene acceso a datos en tiempo real: no puede proporcionar precios, comisiones ni noticias actuales. Esta entrenado para rechazar este tipo de preguntas, pero puede fallar si se le presiona con formulaciones alternativas.
- Modelo pequeno (1.7B): comete errores y puede generar respuestas imprecisas o incompletas. No debe utilizarse para tomar decisiones financieras.
- Solo soporta ingles: no hay capacidad multilingue, a pesar de que el benchmark incluye una categoria `multilingual` con puntuaciones bajas (0.430 en la mejor version).
- La cuantizacion Q1_0 en capas internas puede degradar la calidad en tareas generales fuera del dominio de Bitcoin, como se observa en la caida de `general_ability` frente al modelo base.
- Problemas de compatibilidad: la cuantizacion Q1_0 no tiene kernel OpenCL para GPUs Mali, por lo que en dispositivos con esas GPUs el modelo se ejecutara en CPU, con menor rendimiento.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de las respuestas ni sobre la idoneidad para aplicaciones financieras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shreyanshp/bitcoin-news-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado papers, blogs o demos adicionales en la busqueda web.
