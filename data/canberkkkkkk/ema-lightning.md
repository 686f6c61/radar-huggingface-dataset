# canberkkkkkk/ema-lightning

## Resumen

EMA Lightning es un sistema de síntesis de voz (text-to-speech) para turco desarrollado por el usuario de Hugging Face canberkkkkkk. Se compone de dos piezas: un modelo acústico DiT (Diffusion Transformer) de 5,6 millones de parámetros y un vocoder de 3 millones, lo que da un total de 8,6 millones de parámetros y aproximadamente 34 MB de pesos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo aborda el problema de la síntesis de voz en turco con un enfoque de extrema eficiencia: según su model card, alcanza un 0,92 % de WER en el conjunto Freya-TR-Eval, el más bajo de todos los sistemas medidos en esa evaluación, incluyendo sistemas comerciales como ElevenLabs v4 y Gemini 3.8, así como el modelo Trendyol-TTS de 2.380 millones de parámetros. Genera audio a 48 kHz y ofrece latencia de primer audio de 3,86 ms en una RTX 4090, con un rendimiento declarado de 440× tiempo real (1.316× con batching).

Su relevancia actual reside en la combinación de tamaño mínimo, velocidad, streaming nativo y ejecución completamente offline en GPU o CPU, lo que lo hace adecuado para despliegues en producción con requisitos de privacidad estrictos (sin envío de texto ni audio a servicios externos) y para aplicaciones interactivas en tiempo real. El modelo se distribuye como paquete de Python (`pip install ema-lightning`) y su código está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico DiT (Diffusion Transformer) + vocoder; pipeline con codificador de texto por letra, predictor de duración, alineador con ventana y generación de latentes en cuatro pasos |
| Parametros totales | 8,6 M (5,6 M del modelo acústico + 3 M del vocoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | `ema.pt` y `decoder.pt` (PyTorch); paquete Python `ema-lightning` |

## Arquitectura y entrenamiento

El sistema sigue un pipeline en cascada. El texto se codifica por letra y se coloca en una línea temporal palabra-letra mediante un predictor de duración; un alineador con ventana convierte esa representación en una condición por fotograma. Un DiT genera los latentes en cuatro pasos (flow matching, según las etiquetas del repositorio y la referencia arXiv:2405.14867) y el vocoder decodifica la salida a audio de 48 kHz. La model card describe el flujo completo en la Figura 1 y menciona un componente de scheduling propio denominado Playhead, que comparte el trabajo de múltiples llamadas concurrentes en la GPU.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá del diseño compacto, la generación en cuatro pasos, el streaming por trozos (primer trozo de un segundo de audio listo en unos 4 ms en GPU) y la ruta optimizada `.lightning()` con compilación, CUDA graphs y selección automática de tamaño de lote en GPUs NVIDIA.

## Capacidades

- Síntesis de voz a partir de texto en turco, con salida mono a 48 kHz (también configurable a 24, 16 y 8 kHz).
- Generación completa (`say()`) o en streaming (`stream()`), con el primer trozo de audio disponible mientras se sigue procesando el resto del texto.
- Procesamiento por lotes: `say()` acepta una lista de textos y devuelve una lista de objetos `Speech` en orden, con escritura opcional a ficheros WAV.
- Concurrencia multi-hilo: múltiples llamadas `stream()` desde hilos distintos comparten el mismo modelo y se planifican conjuntamente en la GPU mediante Playhead.
- Control de velocidad de habla (0,25 a 4) y de semilla para reproducibilidad del audio.
- Ejecución offline en GPU o CPU, sin claves de API ni envío de datos a servicios externos.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; el modelo es exclusivamente text-to-speech.

## Casos de uso

- Atención al cliente automatizada: el modo `stream()` permite empezar a reproducir la respuesta mientras se genera el resto, con latencia de primer audio de unos 4 ms en GPU, lo que encaja en sistemas de respuesta por voz en tiempo real.
- Audiolibros y locuciones: `say()` genera el audio completo de un texto o de una lista de textos en lotes compartidos, escribiendo directamente ficheros WAV a 48 kHz para su publicación.
- Sistemas de megafonía y avisos en tiempo real: la velocidad de 440× tiempo real en una RTX 4090 y el bajo coste estimado (unos 0,0085 USD por millón de caracteres en una RTX 4090 alquilada) permiten generar avisos dinámicos a gran escala.
- Integración en aplicaciones de telefonía o asistentes conversacionales: la concurrencia multi-hilo con Playhead permite atender a muchos usuarios simultáneos con una sola instancia del modelo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente offline en CPU o GPU, el texto y el audio no salen de la máquina, lo que facilita el cumplimiento en sectores regulados.
- Prototipado y pruebas en local: con 34 MB de pesos y ejecución en CPU, es viable probar el sistema en portátiles sin GPU dedicada antes de escalar a producción.
- Normalización de texto previa: el frontend recomendado, normalizer-tr de Erdem Tuna, gestiona la normalización de texto turco (fechas, cantidades, etc.) antes de la síntesis, como se aprecia en los ejemplos de la model card.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| WER en Freya-TR-Eval | 0,92 % | El más bajo de todos los sistemas medidos, según la model card, incluyendo ElevenLabs v4, Gemini 3.8 y Trendyol-TTS (2,38 B de parámetros) |
| Latencia de primer audio | 3,86 ms | RTX 4090 |
| Velocidad de generación | 440× tiempo real (1.316× con batching) | RTX 4090 |
| Coste estimado | ~0,0085 USD por millón de caracteres | RTX 4090 alquilada |
| Primer trozo en streaming | ~1 s de audio en ~4 ms | GPU |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8,6 M de parámetros y ~34 MB de pesos, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 4090 para la ruta `.lightning()` (compilación, CUDA graphs y selección de lote); funciona también en CPU, aunque más lento.
- Cabe en GPU consumer: sí, por tamaño (34 MB de pesos); la model card cita explícitamente la RTX 4090 para las cifras de rendimiento.
- Opciones de despliegue: paquete Python `ema-lightning` (PyTorch), con GPU o CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: primer audio en 3,86 ms y 440× tiempo real en RTX 4090; 1.316× con batching; primer trozo de streaming en ~4 ms en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER en Freya-TR-Eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMA Lightning | 8,6 M | Turco | 0,92 % | Apache 2.0 | Hugging Face, PyPI, GitHub |
| Trendyol-TTS | 2,38 B | Turco | Superior al 0,92 % según la model card | No disponible | No disponible |
| ElevenLabs v4 | No disponible | Multilingüe (incluye turco) | Superior al 0,92 % según la model card | Comercial (API) | Servicio en la nube |
| Gemini 3.8 | No disponible | Multilingüe | Superior al 0,92 % según la model card | Comercial (API) | Servicio en la nube |

Los datos de WER de los competidores proceden únicamente de la model card del autor; no se dispone de cifras independientes ni de detalles de parámetros, contexto o licencia de esos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco; no se documentan otros idiomas.
- No se dispone de información sobre sesgos de género, acento o dialecto en la voz generada.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de errores de pronunciación o prosodia en texto no visto; la model card no detalla el conjunto de evaluación más allá de Freya-TR-Eval.
- No se especifican limitaciones de longitud de texto por llamada ni de contexto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes auxiliares (normalizer-tr) y de los datasets de entrenamiento, no detallados en la información disponible.
- Las cifras de rendimiento y WER provienen de la model card del autor y no han sido verificadas de forma independiente en la información proporcionada.
- El repositorio tiene un tamaño de 0,0 GB según los metadatos, lo que puede indicar que los pesos se distribuyen por otra vía (por ejemplo, descarga desde el paquete); conviene comprobar la disponibilidad real de los ficheros `ema.pt` y `decoder.pt`.

## Enlaces

- Hugging Face: https://huggingface.co/canberkkkkkk/ema-lightning
- Código en GitHub: https://github.com/canberkkkkkk/ema-lightning (enlace referenciado como [github] en la model card)
- Paquete PyPI: https://pypi.org/project/ema-lightning/
- Frontend de texto normalizer-tr: https://github.com/erdemtuna/normalizer-tr
- Paper de referencia (flow matching): https://arxiv.org/abs/2405.14867
