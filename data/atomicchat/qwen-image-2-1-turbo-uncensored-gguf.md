# AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Turbo-Uncensored-GGUF es un encoder de texto cuantizado en formato GGUF, publicado por AtomicChat, que actúa como componente `--llm` dentro del pipeline de generación de imágenes Qwen-Image 2.1 ejecutado con stable-diffusion.cpp. No es un modelo de difusión ni un denoiser: es el codificador de prompts (Qwen3-VL-8B-Instruct, 8.190.735.360 parámetros) al que se le ha aplicado una técnica de *abliteration* que proyecta fuera de los pesos la dirección de rechazo (*refusal direction*) del modelo conversacional. El resultado es un encoder que, usado como chat, baja su tasa de negativas del 88,9 % al 1,2 % en prompts ingleses de retención, manteniendo MMLU en 77,35 %.

La relevancia del release es doble. Por un lado, ofrece los ficheros GGUF del encoder en una escalera de cuantizaciones con importance matrix y layout por tensor propio (`AD-`), pensados para emparejarse con los denoisers Turbo del mismo autor. Por otro, el autor documenta con mediciones públicas (LPIPS, KLD, top-1) que el efecto de la ablación sobre las imágenes generadas es nulo en las 45 prompts sensibles probadas: el pipeline original ya dibujaba todas las categorías del probe set y este encoder dibuja exactamente las mismas, sin que ninguna prompt cambie de resultado.

El modelo está pensado para despliegue local en consumer GPU y en entornos de escritorio, con licencia Apache 2.0 y compatibilidad con endpoints. La ficha se centra en lo que el autor mide y declara; cualquier dato no publicado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-VL-8B-Instruct) como text encoder de un pipeline de difusion Qwen-Image 2.1; pesos con ablacion de refusal direction |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: BF16, Q8_0 y escalera completa del repo (tamano total del repo: 54,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con stable-diffusion.cpp) |

## Arquitectura y entrenamiento

El componente es el text encoder Qwen3-VL-8B-Instruct, un transformer de 8,19 mil millones de parámetros que en el pipeline Qwen-Image 2.1 convierte el prompt de texto en representaciones que lee el denoiser de 7B. Sobre ese encoder se aplica una ablación: se identifica la dirección de rechazo en los estados ocultos (el autor reporta que en la última capa las prompts dañinas y las inocuas se separan con AUROC 1.000) y se proyecta fuera de los pesos. El denoiser no se modifica.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es el método de ablación con métricas de fidelidad publicadas: KLD medio frente al Qwen3-VL-8B-Instruct original y porcentaje de coincidencia en el top-1. En BF16, el KLD es 0,0019 y la coincidencia top-1 es del 98,45 %. El autor publica además un dataset de métricas y usa importance matrix y layout por tensor propio (`AD-`) para las cuantizaciones.

## Capacidades

- Generación de imágenes vía pipeline Qwen-Image 2.1: el encoder alimenta al denoiser de 7B; no genera imágenes por sí mismo.
- Uso como modelo conversacional: al ser Qwen3-VL-8B-Instruct abliterado, mantiene capacidad de chat y de razonamiento, con MMLU de 77,35 % antes y después de la ablación.
- Reducción de rechazos en modo chat: del 88,9 % al 1,2 % en prompts ingleses de retención.
- Codificación de prompts sensibles sin activar la dirección de rechazo en los estados ocultos que lee el denoiser.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- Integración directa con stable-diffusion.cpp como `--llm`.
- Capacidades multimodales heredadas del base Qwen3-VL (visión-lenguaje), si bien la información disponible no detalla su uso dentro de este pipeline.
- Tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes local con stable-diffusion.cpp: se carga este GGUF como `--llm` junto a los denoisers Turbo del mismo autor para producir imágenes en escritorio sin depender de servicios alojados; encaja por el formato GGUF y por el layout `AD-` compartido con los denoisers.
- Chat sin rechazos en local: usar el encoder como modelo conversacional de 8B en BF16 o Q8_0 para interacciones donde el filtrado del modelo original resulta limitante; el autor mide una caída de negativas del 88,9 % al 1,2 % con MMLU intacto.
- Investigación sobre abliteration: reproducir y auditar la proyección de la dirección de rechazo con las métricas públicas (KLD 0,0019, top-1 98,45 %, LPIPS 0,088 en prompts sensibles y 0,084 en neutros) como línea base para comparar otras técnicas.
- Evaluación de fidelidad de cuantizaciones: comparar la escalera GGUF (BF16 frente a Q8_0) usando LPIPS (0,037 para Q8_0 del encoder original) y KLD como indicadores de degradación en pipelines de imagen.
- Prototipado de pipelines texto-a-imagen en consumer GPU: al ser un encoder de 8B en GGUF, cabe en GPUs de consumo con cuantización Q8_0, lo que permite montar un stack completo de generación de imágenes en una sola máquina.
- Benchmarking de sesgo y seguridad en generación de imágenes: emplear el probe set de 45 prompts sensibles y 48 neutros del autor para medir si un cambio de encoder altera el contenido dibujado; el autor reporta 0 de 45 prompts que cambian de resultado.
- Integración en aplicaciones de escritorio: el autor distribuye Atomic Chat, que ejecuta stable-diffusion.cpp, como entorno de referencia para estos ficheros.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Rechazos como chat (prompts ingleses de retencion) | 88,9 % antes / 1,2 % despues |
| MMLU | 77,35 % antes y despues |
| KLD medio vs Qwen3-VL-8B-Instruct (BF16) | 0,0019 |
| Coincidencia top-1 (BF16) | 98,45 % |
| LPIPS vs BF16 en 48 prompts neutros | 0 (BF16); 0,090 en Q8_0 |
| LPIPS en prompts sensibles (BF16) | 0,088 |
| Prompts que cambian de resultado vs encoder original | 0 de 45 |
| Referencia: LPIPS de un nuevo seed | 0,499 |
| Referencia: LPIPS de Q8_0 del encoder original | 0,037 |
| AUROC de separacion danino/inocuo en ultima capa | 1,000 |

Resultados del probe set de 45 prompts sensibles (encoder original / este encoder BF16 / este encoder Q8_0): nudity y suggestive 4/4/4 cada uno; violence 5/5/5; weapons 5/5/5; drugs 4/4/4; profanity en imagen 4/4/4; medical anatomy 4/4/4; controles de smoking y alcohol 5/5/5; tattoos 5/5/5. No se han publicado resultados de MMLU, HumanEval o GSM8K para el pipeline de imagen en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 ocupa 16,39 GB en disco; Q8_0 y cuantizaciones inferiores reducen el requisito, aunque la información disponible no publica cifras exactas de VRAM por fichero.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un encoder de 8B en BF16 requiere GPUs con al menos 16-24 GB de VRAM, y las cuantizaciones Q8_0 o inferiores permiten GPUs de consumo.
- Cabe en consumer GPU: sí con cuantización Q8_0 o inferior, según el tamaño del fichero; el autor no detalla modelos concretos.
- Opciones de despliegue: stable-diffusion.cpp (motor de referencia con el que se construyeron y verificaron los ficheros) y Atomic Chat como aplicación de escritorio; otros runners GGUF no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF | 8,19 B | no disponible | Encoder abliterado para Qwen-Image 2.1 en GGUF | Apache 2.0 | Hugging Face, GGUF |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8,19 B | no disponible | Encoder original sin ablacion | no disponible en la informacion | Hugging Face |
| AtomicChat/Qwen-Image-2.1-Turbo-GGUF | no disponible | no disponible | Denoiser Turbo en GGUF, sin cambios de refusal | no disponible en la informacion | Hugging Face, GGUF |

La comparación con alternativas de la misma categoría (encoders abliterados para pipelines de difusión) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La ablación no cambia el contenido de las imágenes: en las 45 prompts sensibles probadas, 0 cambian de resultado frente al encoder original; el pipeline original ya dibujaba todas las categorías del probe set.
- El desplazamiento de las imágenes es general, no dirigido a contenido rechazado: LPIPS de 0,088 en prompts sensibles frente a 0,084 en neutros, aproximadamente un sexto del efecto de cambiar el seed (0,499).
- El denoiser no se modifica y no aprende a dibujar lo que no estaba en sus datos de entrenamiento; ningún encoder puede añadir capacidad de dibujo ausente.
- La reducción de rechazos se mide solo en prompts ingleses de retención; el comportamiento en otros idiomas no está documentado.
- Riesgo de alucinación y sesgos del modelo base: no cuantificado en la información disponible.
- El uso como chat sin rechazos implica que el modelo puede producir contenido dañino; el autor no incluye filtros ni salvaguardas en los pesos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales sobre el contenido generado ni sobre el uso del modelo base.
- El repo pesa 54,0 GB por la escalera completa de cuantizaciones; conviene descargar solo el fichero necesario.
- Los benchmarks publicados son del encoder como chat y de fidelidad de imagen; no hay datos de MMLU, HumanEval ni GSM8K del pipeline completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Denoiser Turbo del mismo autor: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Dataset de métricas: https://huggingface.co/datasets/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF-metrics
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
