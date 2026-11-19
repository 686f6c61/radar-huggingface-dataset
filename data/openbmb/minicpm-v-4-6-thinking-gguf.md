# openbmb/MiniCPM-V-4.6-Thinking-gguf

## Resumen

MiniCPM-V 4.6 Thinking es un modelo multimodal (imagen-texto-a-texto) de tipo MLLM compacto desarrollado por OpenBMB, pensado para ejecutarse en dispositivos de borde como telefonos moviles. Esta ficha corresponde a la version cuantizada en formato GGUF (llama.cpp) del modelo original en BF16, publicada por el mismo autor. Combina un codificador visual SigLIP2 de 400 millones de parametros con un LLM Qwen3.5-0.8B, lo que da un total de aproximadamente 752 millones de parametros.

La variante "Thinking" anade una traza de razonamiento explicita (cadena de pensamiento larga) antes de emitir la respuesta final, lo que mejora el rendimiento en tareas de razonamiento multimodal complejo, matematicas y OCR intensivo. Mantiene la misma arquitectura orientada a borde que MiniCPM-V 4.6 e incorpora la compresion mixta de tokens visuales 4x/16x de esa version.

Es relevante ahora porque permite comprension de imagen y video de calidad en hardware muy limitado (telefonos iOS, Android y HarmonyOS), con licencia Apache 2.0 y un formato GGUF listo para desplegar con llama.cpp y ecosistema compatible. La version GGUF ocupa 8,4 GB en el repositorio, lo que incluye varias cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B (transformer multimodal) |
| Parametros totales | 752.161.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones multiples en el repo; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 Thinking es un modelo multimodal que empareja un codificador visual SigLIP2 de 400 millones de parametros con un modelo de lenguaje Qwen3.5-0.8B. La innovacion arquitectonica destacable es la compresion mixta de tokens visuales en modos 4x y 16x: el modo 16x reduce el numero de tokens visuales para eficiencia, mientras que el modo 4x preserva mayor detalle para tareas que lo requieren. El procesador admite parametros como `downsample_mode` y `max_slice_nums` para controlar este balance entre detalle y coste computacional.

La variante Thinking genera una cadena de razonamiento larga antes de la respuesta final, lo que incrementa la calidad en razonamiento multimodal, matematicas y OCR a costa de mas tokens generados. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Esta publicacion es una cuantizacion GGUF del modelo base openbmb/MiniCPM-V-4.6-Thinking, no un reentrenamiento.

## Capacidades

- Comprension de imagen y texto (pipeline image-text-to-text).
- Comprension de video, con decodificacion via torchcodec o PyAV.
- Razonamiento multimodal con cadena de pensamiento explicita (modo Thinking).
- Razonamiento matematico y tareas de OCR intensivo, reforzadas por el modo Thinking.
- Compresion configurable de tokens visuales (4x para mas detalle, 16x para mas eficiencia).
- Soporte de conversaciones multi-turno mediante plantilla de chat.
- Compatible con endpoints (tag `endpoints_compatible`).
- Despliegue en dispositivos iOS, Android y HarmonyOS segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible.

## Casos de uso

- OCR en movil: el modelo puede leer tickets, documentos y texto manuscrito desde la camara de un telefono, usando el modo 16x para eficiencia o 4x cuando el detalle es critico, y el modo Thinking para reconstruir texto complejo.
- Asistencia visual en el dispositivo: identificacion de objetos, fenomenos fisicos o escenas a partir de una foto, sin enviar datos a la nube, gracias a su tamano de 752M de parametros y despliegue en iOS/Android/HarmonyOS.
- Accesibilidad: descripcion de imagenes y lectura de texto para usuarios con discapacidad visual en tiempo real en telefonos de gama media.
- Analisis de video corto: resumen o descripcion de clips grabados en el dispositivo, apoyandose en la decodificacion de video y la compresion de tokens visuales para mantener el coste bajo.
- Educacion interactiva: resolucion paso a paso de problemas de matematicas o fisica a partir de una foto del enunciado, aprovechando la traza de razonamiento del modo Thinking.
- Verificacion de documentos y formularios: extraccion de campos estructurados de facturas o formularios fotografiados en un flujo movil o de borde.
- Despliegue en servidores modestos: uso del GGUF con llama.cpp en CPU o GPU de baja gama para servicios de vision por lotes donde el coste por inferencia es prioritario.

## Benchmarks y rendimiento

La model card referencia graficas de rendimiento (comparativa Thinking e Instruct, throughput en alta concurrencia y TTFT por peticion) pero no incluye los valores numericos en texto. No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 752M de parametros, las cuantizaciones GGUF de 4 bits rondarian el orden de 0,5-1 GB; las de mayor precision, hasta aproximadamente 1,5 GB. Valores exactos por cuantizacion no disponibles.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) sobra para inferencia; el modelo esta disenado para ejecutarse incluso en moviles.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, y en CPU.
- Opciones de despliegue: llama.cpp (formato nativo de esta publicacion), transformers (>=5.7.0) para el modelo base, y demas herramientas compatibles con GGUF. vLLM/TGI no confirmados para esta variante.
- Latencia y throughput: la model card incluye graficas de throughput en alta concurrencia y TTFT por peticion, pero sin cifras en texto; no disponibles como valores concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking (GGUF) | 752M | no disponible | Apache 2.0 | GGUF | Variante con razonamiento explicito, orientada a borde |
| MiniCPM-V 4.6 (Instruct) | misma familia | no disponible | Apache 2.0 | safetensors/GGUF | Sin cadena de pensamiento; menor coste de generacion |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de 752M de parametros: la capacidad de razonamiento y el conocimiento del mundo son acotados frente a MLLM de mayor tamano; el modo Thinking mitiga pero no elimina esta limitacion.
- Riesgo de alucinacion en descripcion de imagenes y OCR, especialmente con imagenes de baja calidad o texto poco legible.
- El modo Thinking incrementa la latencia y el numero de tokens generados; no es adecuado para todos los casos de uso en tiempo real.
- Idiomas soportados no documentados: verificar el comportamiento en castellano antes de produccion.
- Longitud de contexto no disponible: planificar con cautela en escenarios de contexto largo o video extenso.
- Al ser una cuantizacion GGUF, puede haber una perdida de precision respecto al modelo BF16 original, variable segun el nivel de cuantizacion.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los modelos base (Qwen3.5, SigLIP2) referenciados.
- La cuantizacion la publica el mismo autor (openbmb), lo que reduce el riesgo de artefactos, pero no se detallan los niveles incluidos.

## Enlaces

- Hugging Face (esta publicacion GGUF): https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-gguf
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- MiniCPM-V 4.6 (Instruct): https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-Demo
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Papers referenciados: arxiv:2604.27393, arxiv:2509.18154, arxiv:2408.01800, arxiv:2605.08985
