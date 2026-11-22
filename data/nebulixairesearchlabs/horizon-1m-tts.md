# NebulixAiResearchlabs/Horizon-1M-TTS

## Resumen

Horizon-1M-TTS es un modelo experimental de síntesis de voz (text-to-speech) desarrollado por NebulixAiResearchlabs, un laboratorio que publica bajo la marca Nebulixlabs. Se trata de un modelo extremadamente compacto, con aproximadamente 2 millones de parámetros reales según los pesos en safetensors (el autor lo comercializa como "~1M"), entrenado sobre unas 10 horas de audio en inglés. Su propuesta es demostrar que es posible generar voz inteligible con dos voces diferenciadas en un presupuesto de parámetros tres o cuatro órdenes de magnitud por debajo de los sistemas TTS convencionales.

El modelo se distribuye a través de Hugging Face con la librería `transformers` y requiere `trust_remote_code=True`, ya que incluye código de modelado propio (`modeling_horizon.py`). Soporta dos perfiles de voz, `en_sophia` (femenina) y `en_sam` (masculina), y genera audio a 24 kHz. Está pensado explícitamente para investigación en eficiencia paramétrica, educación y prototipado en entornos edge con recursos muy limitados.

Su relevancia actual es acotada pero clara: sirve como línea base reproducible para estudiar arquitecturas TTS ultrapequeñas y condicionamiento multi-hablante, y como banco de pruebas para técnicas de compresión extrema. No es un modelo de producción: el propio autor lo etiqueta como experimental y advierte de que la voz resultante suena robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS personalizado, código propio en `modeling_horizon.py`, clase `HorizonTTSModel`) |
| Parametros totales | 2.000.398 (según safetensors); el autor indica "~1M" |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (al ser tan pequeño, la cuantización es poco relevante) |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo con `transformers`, `custom_code`) |
| Frecuencia de muestreo | 24.000 Hz |
| Voces soportadas | 2 (`en_sophia`, `en_sam`) |
| Datos de entrenamiento | ~10 horas de voz en inglés |
| Framework | PyTorch / Hugging Face `transformers` (`trust_remote_code=True`) |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de que se implementa en un módulo propio (`modeling_horizon.py`) con una clase `HorizonTTSModel` y que se carga mediante `AutoModel` con código remoto. No se especifica si emplea un transformer encoder-decoder, un modelo acústico con vocoder integrado, difusión o un esquema híbrido. Tampoco se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias, algo poco habitual en TTS de todos modos.

Lo que sí se indica es que el entrenamiento se realizó "from scratch" sobre aproximadamente 10 horas de habla en inglés y que el condicionamiento multi-hablante se resuelve mediante perfiles de voz seleccionables (`en_sophia`, `en_sam`). El modelo genera audio a 24 kHz. La model card menciona un parche necesario en el código de carga (una línea con `NameError` que debe sustituirse por `HorizonTTSModel`), lo que sugiere que la implementación es de investigación y no ha pasado por un proceso de pulido para producción. No se han publicado detalles sobre innovaciones técnicas como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio a 24 kHz.
- Condicionamiento multi-hablante con dos voces predefinidas: `en_sophia` (femenina) y `en_sam` (masculina).
- Ejecución tanto en CPU como en GPU gracias a su huella de ~2M parámetros.
- Carga mediante `transformers` con `trust_remote_code=True`; expone métodos `synthesize`, `generate` o `_switch_profile` según la ruta de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.
- Capacidad multilingüe: únicamente inglés; no hay soporte de otros idiomas.
- No dispone de control fino de prosodia, emoción, velocidad o estilo más allá de la elección de voz.

## Casos de uso

- Docencia sobre arquitecturas TTS: el modelo sirve para que estudiantes inspeccionen un pipeline completo de síntesis de voz con condicionamiento de hablante en un código base pequeño y ejecutable en un portátil, sin necesidad de GPU.
- Prototipado en dispositivos edge: con ~2M parámetros y salida a 24 kHz, puede integrarse en demos de asistentes locales o dispositivos embebidos donde el presupuesto de memoria es de pocos megabytes y no cabe un TTS convencional.
- Línea base de investigación en eficiencia paramétrica: útil para comparar técnicas de compresión, pruning o destilación contra un sistema TTS mínimo ya entrenado y reproducible.
- Generación de avisos cortos en inglés: frases breves para pruebas de interfaz, mensajes de sistema o lectura de notificaciones en prototipos, aceptando la calidad robótica a cambio de un coste computacional mínimo.
- Pruebas de integración de pipelines de audio: sirve para validar el cableado de `transformers` + `soundfile` + reproducción o postprocesado antes de sustituir el modelo por uno de mayor calidad.
- Experimentación con condicionamiento multi-hablante: permite estudiar cómo un modelo minúsculo separa dos identidades de voz y evaluar hasta qué punto el timbre se preserva con tan pocos parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS, CMOS, WER sobre transcripción del audio generado, ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (los pesos suman ~8 MB en fp32 para 2M parámetros); en la práctica, el consumo lo dominan las activaciones y el runtime de PyTorch, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100. Una GTX 1650, RTX 3050 o incluso una iGPU moderna bastan.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer de los últimos años, y también en CPU.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código propio, el despliegue está limitado a `transformers` en PyTorch. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, que además están orientados a LLM y no a TTS de este tipo.
- Latencia y throughput estimados: no disponibles. Por el tamaño, la latencia vendrá determinada por el vocoder y el bucle de generación de audio más que por el coste de los parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Estado |
|---|---|---|---|---|---|
| Horizon-1M-TTS | ~2M (nominal ~1M) | Inglés | 2 | Apache 2.0 | Experimental |
| Piper (rhasspy/piper) | Variable por voz, típicamente 5-20M | Multilingüe | Muchas | MIT / varias | Producción ligera |
| Coqui TTS (modelos pequeños) | Decenas de millones | Multilingüe | Muchas | MPL 2.0 / varias | Producción comunitaria |
| VITS (modelos base) | ~20-80M | Multilingüe | Variable | MIT | Investigación/producción |

La comparación es aproximada: no se dispone de métricas comunes publicadas para Horizon-1M-TTS. Frente a Piper o Coqui, Horizon-1M-TTS es entre uno y dos órdenes de magnitud más pequeño, pero carece de la madurez, el soporte multilingüe y la calidad de audio de aquellos. Su interés es la eficiencia extrema, no la competitividad en calidad.

## Limitaciones y advertencias

- Calidad de voz robótica y limitada, reconocida por el propio autor, consecuencia del presupuesto de parámetros y de las ~10 horas de entrenamiento.
- Solo inglés; no hay soporte de otros idiomas ni de code-switching.
- Solo dos voces; no hay control de emoción, prosodia, velocidad ni estilo.
- Requiere `trust_remote_code=True` y un parche manual en `modeling_horizon.py` para corregir un `NameError`, lo que añade riesgo operativo y de seguridad al ejecutar código remoto.
- Modelo marcado como experimental por el autor; no apto para uso en producción, asistentes de voz comerciales ni aplicaciones críticas.
- Riesgo de alucinación acústica: pronunciación incorrecta, artefactos y posible ininteligibilidad en frases largas o complejas; el autor recomienda frases claras y concisas.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de garantías desaconsejan ese uso.
- Sin datos de benchmarks, sesgos o evaluación de robustez; no se conocen sesgos específicos más allá de los derivados de las 10 horas de audio de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y mantenimiento inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/NebulixAiResearchlabs/Horizon-1M-TTS
- GitHub del autor: https://github.com/NebulixLabs
- Instagram del autor: https://instagram.com/nebulix_labs
- Perfil Hugging Face del autor: https://huggingface.co/Nebulixlabs
