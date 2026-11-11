# JonusNattapong/Panu-Omni-2B-GGUF

## Resumen

Panu-Omni-2B-GGUF es la suite de cuantizaciones GGUF del modelo Panu-Omni-2B (ภาณุ), un modelo omnimodal de 2B parámetros desarrollado por JonusNattapong. Se presenta como un modelo "soberano" orientado al tailandés, con soporte para múltiples dialectos tailandeses, razonamiento nativo mediante el bloque `<think>`, visión, audio y capacidad de speech-to-speech con barge-in full-duplex. Está construido sobre la familia LFM3 (Liquid AI) y ha sido sometido a un proceso de "abliteration", lo que lo convierte en una variante sin censura.

El repositorio contiene 27 cuantizaciones estáticas generadas con una matriz de importancia (`imatrix.dat`) calculada sobre 100 turnos conversacionales específicos de dominio, cubriendo dialectos tailandeses, instrucciones técnicas y trazas de razonamiento profundo. El rango abarca desde IQ1_S (1,56 bpw, ~487 MB) hasta Q8_0 (7,96 bpw, ~1,85 GB), lo que permite desplegarlo en dispositivos muy limitados de recursos.

Es relevante ahora por tres motivos: ofrece capacidades omnimodales (texto, visión, audio) en un tamaño de 2B apto para edge computing; incorpora razonamiento explícito con modo thinking; y pone el foco en el tailandés y sus dialectos, un idioma con escasa representación en el ecosistema de modelos abiertos. La licencia es `lfm1.0` (no comercial en su base, a verificar en la licencia del modelo original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en la familia LFM3 (Liquid AI); arquitectura exacta no disponible |
| Parametros totales | 1.728.801.600 (~1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea `-c 4096`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | th, en, zh, ja, fr, de, es (más dialectos tailandeses) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (con `mmproj` separado para visión/audio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas `liquid`, `lfm3` y `lfm3-omni`, que apuntan a la familia de modelos Liquid Foundation Models de Liquid AI. El modelo es omnimodal (texto, visión y audio) e incorpora un modo de razonamiento nativo con etiquetas `<think>...</think>`. El proceso de cuantización se realizó con una importance matrix calculada sobre 100 turnos conversacionales de dominio (dialectos tailandeses, instrucciones técnicas y trazas de razonamiento).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO. La variante es "abliterated/uncensored", lo que implica que se han eliminado o atenuado las capas de rechazo del modelo base, aunque no se documenta el método exacto empleado. El repositorio base (`JonusNattapong/Panu-Omni-2B`) contiene la documentación completa.

## Capacidades

- Generación de texto y razonamiento explícito mediante el bloque `<think>`.
- Comprensión de imagen (visión) a través del proyector multimodal `mmproj`.
- Procesamiento de audio y speech-to-speech con soporte de barge-in full-duplex.
- Conversación multi-turno en tailandés, con cobertura de dialectos tailandeses.
- Multilingüe: tailandés, inglés, chino, japonés, francés, alemán y español.
- Modo "uncensored" (abliterated): responde sin las capas de rechazo del modelo original.
- Compatible con endpoints (tag `endpoints_compatible`) y con `transformers`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente, aunque el modo thinking facilita cadenas de razonamiento.

## Casos de uso

- Asistente de voz en tailandés para atención al cliente: el modelo puede gestionar conversaciones de voz full-duplex con barge-in, lo que permite interrupciones naturales del usuario, y su cobertura de dialectos lo hace adecuado para usuarios de distintas regiones de Tailandia.
- Despliegue en dispositivos edge o móviles: con cuantizaciones de 487 MB (IQ1_S) a 1,10 GB (Q4_K_M) puede ejecutarse en teléfonos, Raspberry Pi o mini-PC sin GPU dedicada mediante llama.cpp.
- Transcripción y comprensión de audio con contexto visual: combinando `mmproj` con el modelo de lenguaje se pueden procesar entradas de audio e imagen en un mismo turno, útil en aplicaciones de accesibilidad.
- Traducción y adaptación dialectal: al cubrir tailandés estándar y dialectos, sirve para normalizar o traducir variantes regionales a tailandés estándar o a otros idiomas soportados.
- Prototipado de asistentes multimodales locales: con Q6_K (~1,43 GB) se obtiene precisión casi sin pérdida para pruebas de concepto de voz y visión en local sin depender de la nube.
- Investigación sobre abliteration y seguridad: al ser una variante uncensored, permite estudiar el comportamiento del modelo sin capas de rechazo en entornos controlados de investigación.
- Generación de contenido en tailandés con razonamiento: el modo `<think>` facilita tareas que requieren pasos intermedios (matemáticas, lógica) en un idioma con poca cobertura en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S (~487 MB) a Q2_K (~750 MB): menos de 1 GB, apto para CPU y dispositivos muy limitados.
  - Q4_K_M (~1,10 GB): ~1,5-2 GB de RAM/VRAM en la práctica.
  - Q6_K (~1,43 GB): ~2 GB de RAM/VRAM.
  - Q8_0 (~1,85 GB): ~2,5 GB de RAM/VRAM.
  - Nota: el `mmproj` para visión/audio añade memoria adicional no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM para cuantizaciones Q4/Q6 (GTX 1650, RTX 3050, RTX 4060). Para Q8_0 se recomienda ≥3 GB. GPU de datacenter (A100, H100) no son necesarias dado el tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas e incluso en iGPU con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Panu-Omni-2B-GGUF | ~1,73B | no disponible | Texto, visión, audio | lfm1.0 | GGUF en HF |
| Qwen2.5-Omni-3B | ~3B | no disponible | Texto, visión, audio | Apache 2.0 (según versión) | HF, GGUF comunitario |
| Gemma 3 4B | ~4B | no disponible | Texto, visión | Gemma license | HF, GGUF oficial |
| Phi-4-mini | ~3,8B | no disponible | Texto | MIT | HF, GGUF |

La comparativa se ofrece a nivel cualitativo porque no hay benchmarks publicados en la información disponible para Panu-Omni-2B. Su principal diferenciador es el soporte nativo de dialectos tailandeses y el modo speech-to-speech full-duplex, capacidades poco comunes en modelos de este tamaño.

## Limitaciones y advertencias

- El modelo es "abliterated/uncensored": no aplica las capas de rechazo del modelo base, por lo que puede generar contenido inapropiado o dañino sin filtros. No recomendado para producción orientada a usuarios finales sin moderación externa.
- Riesgo de alucinación inherente a modelos de 2B; la precisión en tareas de conocimiento factual será limitada.
- La licencia `lfm1.0` puede restringir el uso comercial; es imprescindible revisar los términos del modelo base antes de desplegarlo en producción.
- La longitud de contexto no está documentada; el ejemplo de uso emplea 4096 tokens, pero no se confirma como máximo.
- El soporte multilingüe fuera del tailandés y el inglés no está validado con benchmarks; la calidad en zh, ja, fr, de y es es incierta.
- El foco en dialectos tailandeses no está cuantificado: no hay evaluación pública de cobertura dialectal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El tamaño del repo (26 GB) incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/JonusNattapong/Panu-Omni-2B-GGUF
- Modelo base: https://huggingface.co/JonusNattapong/Panu-Omni-2B
- llama.cpp: https://github.com/ggerganov/llama.cpp
