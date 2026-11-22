# dalatexcoder/LFM3-1.7B-heretic-ara

## Resumen

LFM3-1.7B-heretic-ara es una variante "decensored" (abliterated) del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario dalatexcoder mediante la herramienta Heretic v2.1.0. El modelo base, creado por Liquid AI, es un modelo de lenguaje de 1.728 millones de parámetros orientado a agentes locales y aplicaciones especializadas, construido sobre una arquitectura tri-híbrida propietaria y con una ventana de contexto de 256K tokens. Esta versión concreta aplica una técnica de ablación de rango arbitrario (ARA) sobre las capas 11 a 16 para reducir drásticamente la tasa de rechazos del modelo original.

La modificación busca eliminar el comportamiento de rechazo (refusals) del modelo alineado, pasando de 91/100 rechazos en el modelo original a 4/100 en esta variante, con una divergencia KL de 0.0364 respecto al original. El resultado es un modelo conversacional sin censura aparente, manteniendo el soporte multilingüe (17 idiomas) y las capacidades de generación de texto del modelo base.

Es relevante para investigadores que necesiten estudiar el comportamiento de modelos sin alineación de seguridad, o para desarrolladores que requieran un modelo pequeño, desplegable en dispositivos edge, sin filtros de contenido. No obstante, su uso conlleva implicaciones éticas y legales importantes que se detallan en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida (LFM3, según Liquid AI); transformer con componentes híbridos, detalles completos no disponibles |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según model card del modelo base) |
| Tipos de cuantizacion | no disponible (el modelo base menciona 4-bit ~1 GB, pero no se listan formatos concretos) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura denominada "tri-híbrida" por Liquid AI, que combina mecanismos de atención con otros componentes recurrentes o de estado, aunque la model card no detalla la proporción exacta de cada bloque. Está post-entrenado para su uso en entornos agénticos como Hermes Agent, Pi y OpenClaw, con una ventana de contexto de 256K tokens. El modelo es text-only y está diseñado para especializarse mediante fine-tuning rápido en una sola GPU.

Esta variante concreta no ha sido re-entrenada: se ha modificado mediante Ablación de Rango Arbitrario (ARA) con Heretic v2.1.0. Los parámetros de la ablación son: start_layer_index 11, end_layer_index 16, preserve_good_behavior_weight 0.3667, steer_bad_behavior_weight 0.0008, overcorrect_relative_weight 0.5329 y neighbor_count 13. La técnica actúa sobre las representaciones internas de las capas 11 a 16 para suprimir la dirección asociada al comportamiento de rechazo, preservando en lo posible el resto de capacidades. El proceso es reproducible según el autor, que incluye un directorio `reproduce` con instrucciones.

## Capacidades

- Generación de texto conversacional multi-turno en 17 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo original (4/100 rechazos frente a 91/100).
- Capacidades agénticas heredadas del modelo base: post-entrenamiento para harnesses como Hermes Agent, Pi y OpenClaw.
- Soporte de contexto largo (256K tokens) para conversaciones y documentos extensos.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo "thinking" en la información disponible para esta variante; el modelo base es text-only.
- Especialización mediante fine-tuning: el modelo base está pensado para adaptarse a dominios y formatos concretos con entrenamiento en una sola GPU.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar cómo varía el comportamiento de un modelo al eliminar la dirección de rechazo mediante ARA, comparando respuestas con el modelo original y midiendo la divergencia KL (0.0364).
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo que el modelo alineado rechazaría por sus filtros de seguridad, en entornos controlados y con revisión humana.
- Despliegue en dispositivos edge: con ~1 GB en 4-bit según el modelo base, puede ejecutarse en portátiles y teléfonos para asistentes locales sin conexión, manteniendo 17 idiomas.
- Procesamiento de documentos largos: la ventana de 256K tokens permite resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Experimentación con agentes locales: al heredar el post-entrenamiento agéntico del modelo base, puede integrarse en harnesses como Hermes Agent para tareas multi-paso en local.
- Fine-tuning especializado: servir como punto de partida para adaptar un modelo pequeño sin censura a dominios concretos (legal, médico, técnico) donde los rechazos del modelo alineado resultan contraproducentes.
- Evaluación comparativa de robustez: analizar si la ablación degrada capacidades en otros idiomas distintos del inglés, dado el soporte multilingüe declarado.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (LiquidAI/LFM3-1.7B) |
|---|---|---|
| Rechazos (refusals) | 4/100 | 91/100 |
| Divergencia KL | 0.0364 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en cuantización de 4 bits (dato del modelo base); en FP16, los 1.728 millones de parámetros requieren unos 3,5 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) puede ejecutarlo con holgura; en entornos profesionales, A100 o H100 no son necesarias pero permiten mayor throughput.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 4 GB o más de VRAM, e incluso en CPU y dispositivos móviles en 4-bit.
- Opciones de despliegue: transformers (librería declarada, requiere `trust_remote_code` por el tag `custom_code`); no se confirman otras opciones como vLLM, llama.cpp u Ollama en la información disponible, aunque al ser safetensors podría convertirse a GGUF.
- Latencia y throughput: no disponibles. El contexto de 256K tokens incrementa el uso de KV cache en secuencias largas, lo que puede agotar la VRAM en configuraciones consumer si se llena la ventana completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-heretic-ara (este) | 1.728 M | 256K | lfm1.0 | Variante sin censura, 4/100 rechazos |
| LiquidAI/LFM3-1.7B | 1.728 M | 256K | lfm1.0 | Modelo original alineado, 91/100 rechazos |
| Qwen2.5-1.5B | ~1.500 M | 32K (128K en variantes) | Apache 2.0 | Alternativa open source de tamaño similar; no disponible comparación de rendimiento |
| SmolLM2-1.7B | ~1.700 M | 8K | Apache 2.0 | Modelo edge de tamaño comparable; no disponible comparación de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con las alternativas en tareas estándar.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: la ablación elimina los rechazos, por lo que puede generar contenido dañino, ilegal o explícito. No debe desplegarse en aplicaciones de cara al público sin capas de moderación externas.
- Riesgo de alucinación: inherente a modelos de 1,7B parámetros; la supresión de la dirección de rechazo puede aumentar la confianza en respuestas incorrectas.
- Degradación potencial: la ablación afecta a las capas 11-16 y puede deteriorar capacidades no medidas (razonamiento, coherencia multilingüe) más allá de la divergencia KL reportada de 0.0364.
- Licencia lfm1.0 ("other"): es necesario revisar los términos de Liquid AI para uso comercial; la modificación por terceros puede no estar cubierta o requerir condiciones adicionales.
- Idiomas: aunque se declaran 17 idiomas, el rendimiento real en lenguas distintas del inglés no está verificado en esta variante.
- Contexto largo: llenar los 256K tokens requiere gestión cuidadosa de la KV cache y puede no ser viable en hardware consumer.
- Reproducibilidad: el autor afirma que el proceso es reproducible, pero no se aportan métricas de evaluación independientes más allá de rechazos y KL.
- Fecha de creación futura (2026-11-22): dato atípico que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dalatexcoder/LFM3-1.7B-heretic-ara
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- Heretic (herramienta de ablación): https://heretic-project.org
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
