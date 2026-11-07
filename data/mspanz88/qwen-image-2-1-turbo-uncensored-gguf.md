# Mspanz88/Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Turbo-Uncensored-GGUF es un repositorio de cuantizaciones GGUF del codificador de texto del pipeline Qwen-Image 2.1, es decir, del modelo Qwen3-VL-8B-Instruct al que se le ha aplicado una técnica de "abliteration": la dirección de rechazo (refusal direction) se proyecta fuera de los pesos. Lo publica Mspanz88 (con cuantización atribuida a AtomicChat) y está pensado como componente `--llm` para stable-diffusion.cpp, acoplado a los denoisers Turbo del mismo pipeline.

El modelo base es un transformer denso de 8.190.735.360 parámetros (aproximadamente 8B), derivado por fine-tuning de Qwen/Qwen3-VL-8B-Instruct y distribuido bajo licencia Apache 2.0. El repo ocupa 54 GB e incluye una escalera de cuantizaciones con importance matrix y layout por tensor propio (`AD-`), desde BF16 (16,39 GB) hacia abajo.

Su relevancia es doble: por un lado, sirve como codificador de texto para generación de imágenes local con Qwen-Image 2.1 Turbo; por otro, el propio autor documenta que como modelo de chat las negativas caen del 88,9% al 1,2% en prompts ingleses reservados, manteniendo MMLU en 77,35%. Es importante subrayar que, según las mediciones publicadas, el efecto sobre las imágenes es nulo en las 45 prompts sensibles probadas: el pipeline original ya no filtraba y ningún prompt cambió de resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-VL), usado como text encoder de un pipeline text-to-image |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con escalera de cuantizaciones (BF16, Q8_0 y otras), importance matrix y layout por tensor `AD-` |
| Idiomas soportados | no disponible (el autor solo documenta evaluaciones en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3-VL, multimodal en origen (vision-lenguaje), reutilizado aquí exclusivamente como codificador de texto del pipeline Qwen-Image 2.1. Sobre los pesos de Qwen/Qwen3-VL-8B-Instruct se aplica una abliteration: se identifica la dirección de rechazo en los estados ocultos (el autor reporta una separación AUROC de 1.000 en la última capa entre prompts dañinos e inofensivos) y se proyecta fuera de los pesos. No se documentan en la información disponible ni el volumen de tokens de entrenamiento ni la composición del dataset, y la edición no implica un reentrenamiento supervisado ni RLHF/DPO adicional.

La innovación técnica declarada es la cuantización con importance matrix y un layout por tensor propio, verificada con dos métricas: LPIPS sobre 48 prompts neutras (con denoiser BF16 y la misma semilla) y KLD frente al Qwen3-VL-8B-Instruct original, junto con la tasa de coincidencia del top-1. El pipeline completo consta de tres piezas: un safety checker inexistente en los pesos abiertos, el text encoder (este modelo, editado) y el denoiser de 7B (sin cambios).

## Capacidades

- Generación de imágenes text-to-image cuando se usa como codificador de texto junto a los denoisers Qwen-Image 2.1 Turbo en stable-diffusion.cpp.
- Codificación de prompts multimodales heredada de Qwen3-VL (visión-lenguaje) en su uso como modelo base, aunque el pipeline documentado es text-to-image.
- Chat conversacional sin rechazos: las negativas bajan del 88,9% al 1,2% en prompts ingleses reservados.
- Razonamiento y conocimiento general preservados: MMLU se mantiene en 77,35% antes y después de la abliteration.
- Integración como `--llm` en stable-diffusion.cpp y en la aplicación Atomic Chat.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, agentes o modos de pensamiento: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes local con Qwen-Image 2.1 Turbo: se carga el GGUF como `--llm` en stable-diffusion.cpp junto al denoiser Turbo correspondiente, con la misma semilla y configuración; el autor verifica que las imágenes apenas se desplazan (LPIPS 0,088 en prompts sensibles y 0,084 en neutras frente al encoder original).
- Despliegue en equipos con VRAM limitada: la escalera de cuantizaciones permite elegir el equilibrio entre calidad y tamaño; Q8_0 mantiene resultados de imagen equivalentes al BF16 en las 45 prompts sensibles medidas.
- Experimentación con abliteration: el repo sirve como caso de estudio reproducible de proyección de la dirección de rechazo, con métricas públicas de KLD y coincidencia top-1 frente al original.
- Chat sin negativas en inglés: uso del encoder como modelo conversacional cuando se necesita que no rechace peticiones que el modelo original denegaba, aceptando el coste en fidelidad (KLD 0,0019 en BF16).
- Investigación sobre sesgos y seguridad en pipelines de imagen: comparación controlada entre encoder original y editado con idéntico denoiser y semilla, útil para medir si la edición del encoder altera la salida visual.
- Integración en Atomic Chat: ejecución del pipeline completo dentro de la aplicación de escritorio del mismo ecosistema, que emplea stable-diffusion.cpp como motor.

## Benchmarks y rendimiento

| Metrica | Original (Qwen3-VL-8B-Instruct) | Este modelo (BF16) | Este modelo (Q8_0) |
|---|---:|---:|---:|
| Tasa de rechazo en chat (prompts ingleses reservados) | 88,9% | 1,2% | no disponible |
| MMLU | 77,35% | 77,35% | no disponible |
| KLD medio frente al original | – | 0,0019 | no disponible |
| Coincidencia top-1 | – | 98,45% | no disponible |
| LPIPS de imagen frente al encoder BF16 (48 prompts neutras) | – | 0 | 0,090 |
| Prompts sensibles que cambian de resultado (45) | – | 0 de 45 | 0 de 45 |
| LPIPS en prompts sensibles | – | 0,088 | no disponible |

Referencia de escala aportada por el autor: cambiar la semilla produce un LPIPS de 0,499 y cuantizar el encoder original a Q8_0 mueve las mismas imágenes 0,037. En el conjunto de 45 prompts sensibles, el encoder original ya dibujaba lo solicitado en 40 de 45 casos, y este encoder exactamente los mismos 40.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 ocupa 16,39 GB, por lo que la inferencia en BF16 requiere holgadamente más de 16 GB de VRAM; las cuantizaciones inferiores reducen el requisito de forma proporcional (el tamaño exacto de cada fichero por debajo de BF16 no está detallado en la información disponible).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, encajan A100, H100 y GPUs de consumo con 24 GB o más para BF16.
- GPU de consumo: previsiblemente viable en RTX 3090/4090 (24 GB) con BF16 y en GPUs de 8-16 GB con cuantizaciones Q8_0 o inferiores, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: stable-diffusion.cpp (motor de referencia, con el flag `--llm`), Atomic Chat y cualquier runtime compatible con GGUF; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-Uncensored-GGUF (este) | 8,19B | no disponible | Text encoder abliterado para Qwen-Image 2.1 | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-VL-8B-Instruct (original) | 8,19B | no disponible | Text encoder y chat multimodal | Apache 2.0 | Pesos en Hugging Face |
| Qwen-Image-2.1-Turbo (denoiser) | 7B | no disponible | Denoiser text-to-image | no disponible | Pesos en Hugging Face |

La comparación relevante es contra el encoder original: misma arquitectura, mismos parámetros y misma licencia, con la diferencia de la abliteration y la cuantización GGUF. Frente al denoiser no procede comparación directa porque cumplen funciones distintas dentro del pipeline.

## Limitaciones y advertencias

- El efecto "uncensored" sobre las imágenes es nulo según las propias mediciones del autor: ningún prompt de los 45 sensibles cambió de resultado, porque el pipeline original ya no filtraba. El beneficio real está en el uso del encoder como modelo de chat.
- El denoiser no se ha modificado y sigue limitado por sus datos de preentrenamiento, de los que Qwen filtró imágenes NSFW; ningún encoder puede añadir lo que el denoiser no aprendió a dibujar.
- Las imágenes sí se desplazan respecto al encoder original (LPIPS 0,088 en sensibles y 0,084 en neutras), un cambio general no dirigido hacia contenido rechazado, comparable a un sexto del efecto de cambiar la semilla.
- La evaluación se limita a prompts en inglés; no hay datos de comportamiento multilingüe ni de idiomas soportados.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; la abliteration puede alterar la calibración en dominios sensibles más allá de lo que mide el KLD global.
- Uso comercial permitido por Apache 2.0, pero la retirada de la dirección de rechazo traslada al desplegador la responsabilidad sobre el contenido generado y su adecuación legal en su jurisdicción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente de terceros.
- El contenido del conjunto de pruebas sensibles está restringido a adultos según el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mspanz88/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Repositorio de referencia del cuantizador: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Denoiser Turbo GGUF: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Qwen-Image-2.1-Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Metricas publicas: https://huggingface.co/datasets/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
