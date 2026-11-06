# JoshHughes/p0pc0rn-assistant-nemotron-bolt-e4b-q4

## Resumen

p0pc0rn-assistant-nemotron-bolt-e4b-q4 es una conversión cuantizada a 4 bits del modelo NVIDIA Nemotron 3.5 Bolt E4B, publicada por el desarrollador independiente Joshua Hughes (proyecto p0pc0rn) para su uso dentro de una aplicación de generación multimedia en dispositivo (on-device) basada en WebGPU. NVIDIA entrenó y ajustó este modelo a partir del modelo base Gemma 4 E4B de Google, por lo que hereda la arquitectura y el tokenizador de la familia Gemma, con la plantilla de chat propia de NVIDIA.

El modelo no es un checkpoint estándar de Transformers ni se distribuye en safetensors o GGUF: se empaqueta en el formato propietario `pocketflux.pack/1`, una colección de 90 shards `.pfw` con datos de tensores en bruto (cuantización de grupos de 32 a 4 bits, normas en float de 32 bits) y un `manifest.json` con offsets, formas, codificaciones y hashes sha256 por cada fragmento de 16 MiB. Solo el motor WebGPU de la aplicación p0pc0rn puede leerlo.

Su relevancia es acotada pero ilustrativa: demuestra un flujo de despliegue de un LLM de NVIDIA (derivado de Gemma) cuantizado a 4 bits y orientado a inferencia local en el navegador o en el móvil, con verificación de integridad por chunks y gestión de licencias en la propia app. No obstante, su utilidad fuera del ecosistema p0pc0rn es prácticamente nula, ya que el formato no es interoperable con las herramientas habituales de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B; detalles de atención y capas no disponibles) |
| Parametros totales | no disponible (el nombre "E4B" sugiere ~4B efectivos, sin confirmación oficial) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en grupos de 32 (embedding, cabeza de salida y embeddings por capa incluidos); normas en float de 32 bits |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (modelo base Gemma 4 bajo Apache-2.0) |
| Formato de pesos | `pocketflux.pack/1` (90 shards `.pfw` + `manifest.json`); no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su linaje: NVIDIA post-entrenó Nemotron 3.5 Bolt E4B a partir de Gemma 4 E4B de Google, y la conversión de p0pc0rn preserva la plantilla de chat de NVIDIA y su tokenizador (basado en el tokenizador de Gemma). No se especifican el número de capas, la configuración de atención, la longitud de contexto nativa, el volumen de tokens de entrenamiento ni la composición del dataset.

Tampoco se documentan las etapas de alineación (RLHF, DPO u otras) aplicadas por NVIDIA, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. El único detalle técnico verificable del proceso de p0pc0rn es la cuantización: 4 bits en grupos de 32 aplicada de forma uniforme, incluyendo el embedding de entrada y la cabeza de salida, con las capas de normalización conservadas en 32 bits para preservar estabilidad numérica.

## Capacidades

- Generación de texto para tareas de escritura y de agente dentro de la aplicación p0pc0rn.
- Razonamiento y redacción de tareas de agente ("think and write with this model", según la model card).
- Procesamiento exclusivamente de texto: las imágenes quedan delegadas al modelo asistente (`JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4`).
- Soporte de tool calling y de razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (el modelo es explícitamente solo texto).
- Integración con un modelo drafter (`JoshHughes/p0pc0rn-assistant-drafter-gemma4-e4b`) para acelerar las respuestas, lo que sugiere decodificación especulativa en el motor de la app.

## Casos de uso

- Escritura asistida dentro de la app p0pc0rn: el modelo redacta textos largos y borradores aprovechando su papel como "cerebro grande" del asistente, mientras el modelo pequeño gestiona el chat conversacional.
- Tareas de agente en dispositivo: ejecuta pasos de razonamiento y generación de contenido sin salir del teléfono, sin enviar datos a servidores externos.
- Generación de descripciones y guiones para los vídeos, canciones y fotos creados en la app: el modelo produce el texto asociado a las piezas multimedia que genera el motor WebGPU.
- Inferencia local en navegador o móvil con WebGPU: adecuado para escenarios donde la privacidad o la ausencia de conectividad impiden usar APIs en la nube.
- Prototipado de asistentes on-device con cuantización agresiva: sirve como referencia de cómo empaquetar un modelo de ~4B en 4,68 GB con verificación de integridad por chunks.
- Aceleración mediante drafter: combinado con el modelo drafter del mismo proyecto, permite respuestas más rápidas en hardware limitado mediante decodificación especulativa.
- Distribución con gestión de licencias: la app muestra y solicita aceptación de la licencia OpenMDW-1.1 antes de descargar, un patrón reutilizable para productos que empaquetan modelos con licencias restrictivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño en disco: 4,68 GB distribuidos en 90 shards; requiere ese espacio libre antes de la descarga completa.
- VRAM/RAM estimada para inferencia: no disponible de forma oficial; el tamaño del pack (4,68 GB) da una cota inferior aproximada para mantener los pesos en memoria, a la que hay que sumar el estado de activaciones y el contexto.
- GPU recomendadas: no disponible; el motor es WebGPU, por lo que se ejecuta sobre la GPU integrada del dispositivo (móvil o navegador de escritorio) más que sobre GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: no confirmada; depende de la implementación WebGPU del navegador o del sistema y de la memoria gráfica disponible.
- Opciones de despliegue: exclusivamente el motor WebGPU de p0pc0rn; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no publicarse en safetensors ni GGUF.
- Latencia y throughput: no disponibles; existe un modelo drafter asociado para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p0pc0rn-assistant-nemotron-bolt-e4b-q4 | no disponible (~4B por el nombre) | no disponible | `pocketflux.pack/1` (propietario) | OpenMDW-1.1 | Solo motor p0pc0rn |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | no disponible | no disponible | BF16 (formato original) | OpenMDW-1.1 | Hugging Face |
| p0pc0rn-assistant-gemma4-e2b-q4 | no disponible (E2B) | no disponible | `pocketflux.pack/1` | no disponible | Solo motor p0pc0rn |
| p0pc0rn-assistant-drafter-gemma4-e4b | no disponible (E4B) | no disponible | `pocketflux.pack/1` | no disponible | Solo motor p0pc0rn |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Formato no interoperable: los shards `.pfw` solo los lee el motor WebGPU de p0pc0rn; no se puede cargar en Transformers, llama.cpp, vLLM ni Ollama.
- Sin datos de evaluación: no hay benchmarks, ni información sobre sesgos, alucinación o calidad multilingüe.
- Solo texto: no procesa imágenes, a diferencia del modelo asistente del mismo proyecto.
- Licencia OpenMDW-1.1: impone condiciones específicas (aceptación previa a la descarga, avisos y atribuciones); el modelo base Gemma 4 queda bajo Apache-2.0, lo que añade obligaciones de atribución adicionales.
- Cuantización agresiva a 4 bits: puede degradar el razonamiento y la fidelidad en tareas complejas frente al modelo BF16 original.
- Trazabilidad limitada: el autor no documenta el proceso de post-entrenamiento de NVIDIA ni las capacidades exactas del modelo base.
- Sin soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Uso comercial: sujeto a los términos de OpenMDW-1.1 y a las condiciones de la aplicación p0pc0rn; conviene revisar ambos antes de integrarlo en un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshHughes/p0pc0rn-assistant-nemotron-bolt-e4b-q4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo asistente: https://huggingface.co/JoshHughes/p0pc0rn-assistant-gemma4-e2b-q4
- Modelo drafter: https://huggingface.co/JoshHughes/p0pc0rn-assistant-drafter-gemma4-e4b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- X oficial del proyecto: https://x.com/p0pc0rnapp
- X del autor: https://x.com/joshhughes___
