# Jour/hy-mt2-7b-discord-lora

## Resumen

Hy-MT2-7B Discord LoRA es un adaptador de bajo rango (LoRA) desarrollado por el usuario Jour sobre el modelo de traducción Tencent Hy-MT2-7B, publicado bajo licencia Apache-2.0. No se trata de un modelo completo, sino de un ajuste fino de 42 MB (rank 8, alpha 16) que se aplica en tiempo de ejecución sobre los pesos del modelo base, que no se redistribuye en este repositorio. El objetivo concreto es mejorar la traducción de mensajes informales de Discord preservando intactos los elementos de formato propios de la plataforma: markdown, enlaces, menciones, emojis, bloques de código y etiquetas `[markNN]`.

El adaptador se entrenó con QLoRA (modelo bf16 cargado en 4 bits nf4, LoRA sobre todas las capas lineales, 2 épocas, aproximadamente 2.700 pares sintéticos generados con Claude Haiku) y está pensado para aplicarse sobre el GGUF oficial Q4_K_M de Tencent, verificado con `llama-server --lora`. Cubre 13 idiomas (en, fr, es, de, pt, it, ru, ja, ko, zh, tr, ar, pl), con sesgo hacia inglés y francés.

Su relevancia es acotada pero clara: el modelo base de 7B ya preserva bien el formato (98,6 % de spans protegidos intactos sin adaptador), y este LoRA sube esa cifra al 99,3 % además de mejorar la calidad de traducción en texto informal (chrF de 67,6 a 73,6), a cambio de un coste aproximado del 15 % en velocidad de generación. Es una pieza útil para pipelines de traducción de comunidades en Discord, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (base: tencent/Hy-MT2-7B) |
| Parámetros totales | 20.971.520 en el adaptador (dato real de safetensors); el modelo base no se redistribuye |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de referencia en `llama-server`; el máximo del modelo base no se especifica) |
| Tipos de cuantizacion | Adaptador en F16 (GGUF) y safetensors; el modelo base se usa en Q4_K_M (GGUF oficial) o en 4-bit nf4 para el entrenamiento |
| Idiomas soportados | en, fr, es, de, pt, it, ru, ja, ko, zh, tr, ar, pl |
| Licencia | Apache-2.0 (adaptador; incluye archivo de licencia) |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`) y GGUF (`hy-mt2-7b-discord-lora-r8-f16.gguf`, 42 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 8 y alpha 16 aplicado sobre todas las capas lineales del modelo base Tencent Hy-MT2-7B, un transformer decoder-only especializado en traducción. El entrenamiento se realizó con QLoRA: el modelo en bf16 se cargó cuantizado en 4 bits nf4, se entrenó durante 2 épocas sobre aproximadamente 2.700 pares de traducción y el resultado se exportó tanto a safetensors (para `transformers` + `peft`) como a GGUF F16 para su uso con `llama-server --lora`.

Los datos de entrenamiento son sintéticos, generados con Claude Haiku, cubren los 13 idiomas declarados y están sesgados hacia inglés y francés; no fueron revisados por humanos. La innovación técnica no está en la arquitectura sino en el objetivo del ajuste: enseñar al modelo a mantener invariantes los elementos protegidos de un mensaje de Discord (etiquetas `[markNN]`, enlaces, menciones, emojis, código y marcadores markdown) mientras traduce el texto informal circundante. El adaptador se validó contra el GGUF oficial Q4_K_M, no solo contra los pesos en precisión completa.

## Capacidades

- Traducción de texto informal de chat entre 13 idiomas, con prompt oficial de Hy-MT2 (en inglés, o en chino cuando el origen o el destino es chino).
- Preservación de formato en mensajes de Discord: markdown, enlaces, menciones, emojis, bloques de código y etiquetas `[markNN]` se mantienen idénticos en la salida.
- Mantenimiento del recuento de marcadores markdown y saltos de línea del original.
- Integración en tiempo de ejecución sobre el GGUF oficial Q4_K_M mediante `llama-server --lora`, sin necesidad de fusionar pesos.
- Uso alternativo como adaptador PEFT con `transformers` y `peft`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción en vivo de canales de Discord multilingües: el adaptador se aplica sobre el GGUF Q4_K_M en `llama-server` y traduce cada mensaje preservando menciones, enlaces y emojis, de modo que la salida puede publicarse directamente sin romper el formato del cliente.
- Moderación y soporte comunitario: al mantener intactas las etiquetas `[markNN]` y el markdown, los mensajes traducidos conservan las referencias internas que usan los bots de moderación y los sistemas de tickets.
- Localización de documentación y FAQs alojadas en Discord: los bloques de código y los enlaces se preservan, lo que permite traducir guías técnicas sin romper ejemplos ni URLs.
- Puentes entre comunidades de distintos idiomas: con 13 idiomas cubiertos (incluidos ja, ko, zh, ar y ru) se puede ofrecer traducción bidireccional en servidores con audiencias mixtas.
- Traducción de hilos de soporte técnico: el contexto de 4096 tokens permite procesar conversaciones multi-turno de longitud moderada manteniendo la coherencia del hilo.
- Prototipado rápido en local: con ~5 GB de VRAM para el servidor y un adaptador de 42 MB, es viable desplegar el pipeline completo en una única GPU de consumo como la RTX 4070 usada en la evaluación.
- Evaluación comparativa de adaptadores: sirve como referencia para medir el impacto de un LoRA de traducción sobre un modelo base ya competente en preservación de formato.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 143 pares no vistos (108 con elementos protegidos), decodificación greedy, `llama-server` en RTX 4070, GGUF oficial Q4_K_M, contexto 4096. "Formato preservado" significa que todos los spans protegidos son idénticos en la salida y que coinciden los recuentos de marcadores markdown y saltos de línea.

| Variante | Formato preservado (todos / con elementos protegidos) | chrF | Generación |
|---|---|---|---|
| Hy-MT2-7B Q4_K_M, sin LoRA | 98,6 % / 98,1 % | 67,6 | ~82 tok/s |
| + este LoRA | 99,3 % / 99,1 % | 73,6 | ~69 tok/s |

El adaptador mejora chrF en +6,0 puntos y reduce los errores de formato residuales, con un coste de aproximadamente el 15 % en velocidad de generación (adaptador sin fusionar). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5 GB para el servidor con el GGUF Q4_K_M y el adaptador cargado.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor validó el pipeline en una RTX 4070.
- Cabe en GPU de consumo: sí, en RTX 4070 y modelos con VRAM igual o superior (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080, RTX 4090).
- Opciones de despliegue: `llama-server` con `--lora` (ruta validada por el autor), `transformers` + `peft` con el adaptador safetensors. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: ~69 tok/s de generación con el adaptador sin fusionar en RTX 4070, frente a ~82 tok/s sin él.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jour/hy-mt2-7b-discord-lora | 20,97 M en adaptador (base 7B) | 4096 (config. de referencia) | LoRA de traducción para Discord sobre Hy-MT2-7B | Apache-2.0 | HuggingFace (adaptador; base no redistribuido) |
| tencent/Hy-MT2-7B | 7B | no disponible | Traducción general | Apache-2.0 | HuggingFace |
| Jour/hy-mt2-1.8b-discord-1.25bit-lora | no disponible (base 1.8B) | no disponible | LoRA de traducción para Discord sobre la variante 1.8B | no disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos con otras alternativas de traducción en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos (generados con Claude Haiku), ~2.700 pares, y no han sido revisados por humanos; pueden introducir sesgos y errores sistemáticos del generador.
- El conjunto de prueba es pequeño (143 pares) y es el mismo usado para el adaptador de 1.8B, lo que limita la significación estadística de las mejoras reportadas.
- El reparto de idiomas está sesgado hacia inglés y francés; el rendimiento en el resto de los 13 idiomas está menos validado.
- El adaptador no garantiza por sí solo la preservación del formato: el autor recomienda mantener una comprobación de formato (enmascaramiento de etiquetas) en la aplicación.
- Coste de rendimiento: ~15 % menos de velocidad de generación con el adaptador sin fusionar.
- El modelo base no se redistribuye en este repositorio; es necesario descargarlo por separado desde tencent/Hy-MT2-7B o su GGUF oficial.
- Licencia Apache-2.0 en el adaptador, lo que permite uso comercial; deben respetarse igualmente los términos del modelo base.
- No se usaron datos reales de usuarios en el entrenamiento, según declara el autor.
- No se documentan capacidades de razonamiento, código, tool calling ni agentes; el uso previsto es exclusivamente traducción.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Jour/hy-mt2-7b-discord-lora
- Modelo base: https://huggingface.co/tencent/Hy-MT2-7B
- GGUF oficial del modelo base: https://huggingface.co/tencent/Hy-MT2-7B-GGUF
- Adaptador hermano para la variante 1.8B: https://huggingface.co/Jour/hy-mt2-1.8b-discord-1.25bit-lora
