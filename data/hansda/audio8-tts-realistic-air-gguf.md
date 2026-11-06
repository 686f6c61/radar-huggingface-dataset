# Hansda/Audio8-TTS-Realistic-Air-GGUF

## Resumen

Audio8-TTS-Realistic-Air-GGUF es un paquete de cuantizaciones GGUF del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-Air, publicado por el usuario Hansda. El modelo base es un sistema text-to-speech de 601M parámetros con arquitectura DualAR (autoregresiva dual) y un códec de audio completo a 44,1 kHz. La conversión está anclada al commit `23c305cc013fde378edb459f538317043c993a74` del repositorio original y empaqueta, junto con los tensores cuantizados, la configuración, el tokenizer y los ficheros de procesador originales.

La relevancia de esta publicación es de infraestructura más que de modelado: permite ejecutar un TTS de calidad realista en el runtime audio.cpp con backend CUDA, sin depender del stack Python original. El paquete ofrece cinco cuantizaciones nativas (Q2_K, Q3_K, Q4_K, Q6_K y Q8_0) más dos alias de nombre de fichero para descubrimiento en el Hub. Es una conversión comunitaria, no oficial, del checkpoint de Edge0.

Conviene subrayar que la validación publicada es limitada: pruebas de contenedor y tensores, carga en GPU y dos casos de humo de voz en inglés con transcripción local. No se han medido benchmarks, no se ha validado el clonado de voz, ni los 23 idiomas del modelo fuente, ni la longitud de contexto completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DualAR (autoregresiva dual), inspirada en el diseño de Fish Audio S2 Pro |
| Parámetros totales | 601M (modelo principal); el paquete incluye además el códec de audio completo |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo fuente no la documenta en la información proporcionada) |
| Tipos de cuantización | Q2_K, Q3_K, Q4_K, Q6_K, Q8_0 (el códec usa F16 en todos los paquetes) |
| Idiomas soportados | 23 idiomas en el modelo fuente; solo se han validado casos en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime audio.cpp) |
| Frecuencia de muestreo del códec | 44,1 kHz |
| Tamaño de ficheros | entre 1,49 GB (Q8_0) y 1,75 GB (Q6_K) |
| Tamaño del repo | 8,3 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura DualAR, un esquema autoregresivo de dos etapas en el que un modelo principal predice tokens de audio que después se decodifican mediante un códec dedicado a 44,1 kHz. El modelo principal tiene un ancho de 896 y, según la model card del paquete GGUF, contiene 28 matrices elegibles para cuantización K, lo que cubre aproximadamente el 20,3 % de los parámetros del modelo principal. Las matrices no alineadas conservan la precisión de origen y las tablas de búsqueda se almacenan en F16.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La conversión a GGUF se realizó de forma independiente para cada variante a partir de los tensores fuente anclados, fusionando los pares de weight-normalization del códec antes de la conversión de almacenamiento. El paquete incluye `runtime-info.json`, `model-spec.json` y un manifiesto SHA256 generado para trazabilidad. La arquitectura original está inspirada en el diseño DualAR de Fish Audio S2 Pro, según declara el autor de la conversión.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano, con salida en fichero WAV.
- Generación de audio a 44,1 kHz gracias al códec empaquetado en cada fichero GGUF.
- Control de muestreo mediante parámetros de petición: `max_tokens`, `seed`, `temperature`, `top_p` y `top_k`.
- Soporte multilingüe declarado de 23 idiomas en el modelo fuente (no validado en esta conversión).
- Clonado de voz presente en el modelo fuente, aunque explícitamente no validado en estos GGUF.
- Integración con el runtime audio.cpp mediante la familia `audio8_tts` y backend CUDA.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento; es un modelo exclusivamente de audio.

## Casos de uso

- **Generación de locuciones para vídeo y pódcast**: el modelo produce audio a 44,1 kHz directamente desde texto, adecuado para narraciones pregrabadas donde se necesita calidad de muestreo completa sin postprocesado de remuestreo.
- **Prototipado de asistentes de voz en local**: al ejecutarse sobre audio.cpp con CUDA, permite montar un pipeline TTS en una estación de trabajo sin depender de servicios en la nube, útil para demos y pruebas de concepto.
- **Sistemas de accesibilidad**: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en entornos donde se requiere despliegue autocontenido y licencia permisiva.
- **Generación de avisos y mensajes automatizados**: anuncios de megafonía, mensajes de estado o notificaciones habladas en aplicaciones internas, con control de semilla para reproducibilidad entre ejecuciones.
- **Investigación en síntesis de voz**: al ser una conversión GGUF de un modelo DualAR, sirve como base para estudiar el impacto de la cuantización K en la calidad percibida del audio, comparando Q2_K frente a Q8_0 con el mismo prompt.
- **Integración en pipelines de audio batch**: la CLI `audiocpp_cli` permite procesar lotes de textos con parámetros fijos de muestreo, encajable en scripts de generación masiva de locuciones.
- **Evaluación de despliegue en GPU de consumo**: los ficheros de 1,5-1,75 GB permiten probar el modelo en tarjetas con poca VRAM, como paso previo a decidir si se adopta el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que «no benchmark scores were measured for these GGUFs» y que las comprobaciones se limitan a validación de contenedores y tensores, carga en GPU y dos casos de humo de voz en inglés con transcripción local.

## Requisitos de hardware

- **VRAM estimada**: los ficheros pesan entre 1,49 GB (Q8_0) y 1,75 GB (Q6_K); junto con el códec en F16 y los buffers de inferencia, un presupuesto de 3-4 GB de VRAM es un punto de partida razonable, aunque no se documenta una cifra oficial.
- **GPU recomendadas**: la model card solo indica compilar audio.cpp con CUDA para «the tested GPU path», sin especificar modelo de tarjeta. No hay lista oficial de GPU validadas.
- **GPU de consumo**: por tamaño de fichero, el modelo debería caber en tarjetas consumer con 6-8 GB de VRAM o más; no se ha validado en la documentación proporcionada.
- **Opciones de despliegue**: runtime audio.cpp (familia `audio8_tts`, backend CUDA) mediante `audiocpp_cli`. El modelo fuente dispone además de un adaptador SGLang Omni para serving en GPU, aunque no se indica que sea compatible con estos GGUF.
- **Latencia y throughput**: no disponibles. No se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air (GGUF, esta ficha) | 601M | no disponible | GGUF (audio.cpp) | Apache-2.0 | Conversión comunitaria; validación limitada a inglés |
| Edge0/Audio8-TTS-Realistic-Air (original) | 601M | no disponible | safetensors (checkpoint fuente) | Apache-2.0 | Referencia completa; soporta clonado de voz y 23 idiomas; serving vía SGLang Omni |
| Fish Audio S2 Pro | no disponible | no disponible | no disponible | no disponible | Inspiración arquitectónica del diseño DualAR según la model card; sin datos comparativos publicados |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- **Validación muy limitada**: solo se han ejecutado dos casos de humo en inglés; no se ha validado el clonado de voz, los 23 idiomas declarados ni el contexto completo del modelo fuente.
- **Sin benchmarks**: no existen métricas objetivas de calidad de audio (MOS, WER de transcripción, similitud de hablante) para estas cuantizaciones.
- **Riesgo de degradación por cuantización**: en Q2_K y Q3_K solo se cuantizan las 28 matrices elegibles (≈20,3 % de los parámetros del modelo principal); el resto mantiene precisión de origen, pero el impacto audible de las cuantizaciones bajas no está medido.
- **Sesgos**: no documentados. Al ser un TTS entrenado con datos de voz no especificados, es esperable sesgo de acento, género y prosodia, pero no hay información al respecto.
- **Riesgo de alucinación en audio**: no documentado; en TTS esto se traduce en artefactos, prosodia anómala o pronunciación incorrecta, sin métricas publicadas.
- **Licencia**: Apache-2.0 permite uso comercial, pero obliga a conservar `LICENSE` y `NOTICE`. Es una conversión comunitaria: la procedencia del checkpoint original debe verificarse antes de un despliegue en producción.
- **Dependencia de un runtime concreto**: requiere audio.cpp en el commit `f7ac446fb75e594a6913c846bea6c85b637f6ac0`; cambios posteriores del runtime pueden romper la compatibilidad.
- **Alias de fichero**: `Q3_K_S` y `Q4_K_S` son duplicados byte a byte de Q3_K y Q4_K respectivamente; descargar ambos no aporta nada y duplica el consumo de disco.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Hansda/Audio8-TTS-Realistic-Air-GGUF
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Commit anclado del modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air/tree/23c305cc013fde378edb459f538317043c993a74
- Runtime audio.cpp (commit fijado): https://github.com/0xShug0/audio.cpp/tree/f7ac446fb75e594a6913c846bea6c85b637f6ac0
- Repositorio Audio8 TTS (inferencia por CLI, batching y fine-tuning): no disponible como URL directa en la información proporcionada
- Adaptador SGLang Omni para serving: mencionado en la model card del modelo base, sin URL directa en la información proporcionada
