# Firoj112/pawp-tts-300k

## Resumen

PAWP-TTS 300K es un modelo de síntesis de voz (text-to-speech) neuronal ultraligero desarrollado por Firoj112 (Firoj Paudel) que soporta inglés, nepalí y habla mezclada inglés-nepalí (code-mixing). Con tan solo 281.078 parámetros únicos almacenados (328.158 materializados), 1,12 MB en FP32 y un coste computacional de 20,96 MMAC/s, sintetiza audio PCM a 24 kHz de extremo a extremo sin emplear ningún modelo de lenguaje grande durante la inferencia. Está pensado para despliegue en dispositivos de borde y escenarios de baja latencia con streaming.

El modelo se apoya en una arquitectura centrada en el decodificador, donde el decodificador de forma de onda iSTFT a 24 kHz (ConvNeXt1D con `n_fft=512` y `hop=240`) consume el 52,6% del presupuesto de parámetros. Incluye componentes de acondicionamiento articulatorio, codificador, predictores de duración, tono, sonoridad y energía, embedding de hablante y red acústica. Se distribuye con pesos en safetensors y grafos ONNX plegados para inglés y nepalí, además de una variante densa de referencia para ablación transparente.

Su relevancia actual radica en demostrar que es posible obtener síntesis bilingüe inteligible con huella de ~280 KB en INT8, apta para microcontroladores y navegadores, y en publicar de forma honesta tanto las métricas favorables como las desfavorables frente a su variante densa y a su hermano mayor de 1,5 M de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal TTS decoder-céntrica: ConvNeXt1D + iSTFT, con codificador, acondicionamiento articulatorio, predictores de duración/tono/sonoridad/energía y embedding de hablante |
| Parametros totales | 328.158 materializados (281.078 únicos almacenados; 309.702 efectivos de cómputo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de lenguaje; longitud limitada por el texto de entrada) |
| Tipos de cuantizacion | FP32 (1,12 MB), FP16 (0,56 MB), INT8 (0,28 MB) |
| Idiomas soportados | Inglés (en), nepalí (ne) y mezcla inglés-nepalí (code-mixing, Devanagari + latino) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`model.safetensors`), ONNX plegado en `onnx/`, y variante densa en `variants/dense_300k_v3.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un sistema TTS completo y compacto sin LLM en inferencia. La salida de audio es PCM a 24.000 Hz generada mediante un decodificador neural iSTFT con `n_fft=512` y `hop=240`, construido sobre bloques ConvNeXt1D. El modelo incorpora un codificador de texto, acondicionamiento articulatorio, predictores explícitos de duración, tono (pitch), sonoridad (voicing) y energía, un embedding de hablante y una red acústica intermedia. La variante por defecto (EXP-015b) emplea una base compartida con `K=2` bases, lo que reduce los parámetros únicos almacenados a 281.078 frente a los 328.158 materializados.

Ambas variantes de 281K se entrenaron desde cero sobre datos "v3" limpios con semilla 42, 36.000 pasos y 2,25 horas de entrenamiento en una RTX 4090. No se especifica en la información disponible el volumen de tokens ni la composición exacta del dataset, ni si se aplicaron RLHF o DPO (no procede en TTS). La innovación destacable es la compartición de bases para reducir el almacenamiento manteniendo el cómputo materializado, junto con la publicación de una ablación igualada en presupuesto (variante densa) que permite evaluar el compromiso entre compacidad y calidad.

## Capacidades

- Síntesis de voz neuronal a 24 kHz en inglés, nepalí y habla mezclada inglés-nepalí (Devanagari + latino).
- Generación de audio de extremo a extremo sin modelo de lenguaje en inferencia, con coste de 20,96 MMAC/s.
- Inferencia en streaming y baja latencia, orientada a dispositivos de borde y TinyML.
- Voz única de hablante objetivo en inferencia (sin clonación zero-shot).
- Exportación a ONNX plegado para inglés y nepalí, facilitando despliegue multiplataforma.
- Cuantización a FP16 e INT8 para reducir la huella hasta ~280 KB.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües limitadas a los dos idiomas indicados y su mezcla.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo cabe en ~280 KB en INT8, por lo que puede ejecutarse en microcontroladores y sistemas embebidos para leer notificaciones o menús sin conexión a la nube.
- Aplicaciones web de accesibilidad: los grafos ONNX plegados permiten síntesis en el navegador para lectores de pantalla en inglés y nepalí, con latencia baja y sin servidor.
- Interfaces de voz para kioscos y terminales de autoservicio en Nepal: la cobertura de code-mixing inglés-nepalí permite anuncios y respuestas que alternan ambos idiomas tal como habla el usuario.
- Sistemas de megafonía y avisos automatizados: generación de mensajes pregrabados dinámicos en nepalí (norma de Katmandú) para transporte o comercio, con voz única consistente.
- Prototipado rápido de productos de voz: el tamaño reducido y el entrenamiento en 2,25 h en una RTX 4090 permiten iterar y reentrenar variantes con presupuestos mínimos.
- Investigación en TTS ultraligero: la inclusión de la variante densa y de métricas de ablación transparentes sirve como referencia para estudiar compartición de bases y cuantización agresiva.
- Aplicaciones educativas de idiomas: lectura de frases en nepalí e inglés para práctica de pronunciación, con audio a 24 kHz.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre un conjunto de evaluación bilingüe retenido, medidos mediante ASR:

| Metrica | PAWP-300K Shared (por defecto) | Dense-300K (ablación) | PAWP-1.5M v3 (referencia) |
|---|---|---|---|
| WER ASR nepalí (n=30) | 19,71% | 20,21% | 12,35% |
| CER ASR nepalí (n=30) | 5,93% | 6,59% | 1,75% |
| WER ASR code-mixed (n=9) | 12,02% | 18,09% | 12,32% |
| CER ASR code-mixed (n=9) | 5,01% | 9,01% | 5,32% |
| WER ASR inglés (n=30) | 6,88% | 6,15% | 4,02% |
| CER ASR inglés (n=30) | 2,93% | 2,42% | 1,50% |
| PER test sin tocar (NE / EN, n=300+300) | 6,28% / 7,09% | 5,54% / 5,24% | 5,04% / 4,02% |
| CTC 77 pares: distinción acústica / exacta | 60/77 (77,9%) / 30/77 (39,0%) | 61/77 (79,2%) / 29/77 (37,7%) | 64/77 (83,1%) / 45/77 (58,4%) |
| `best_val_mel` | 0,8768 | 0,8778 | No disponible |

Nota del autor: la variante densa obtiene un PER monolingüe significativamente menor (NE −0,97%, EN −1,90%, p < 0,001 con bootstrap pareado de 1.000 remuestreos) con un 14,2% menos de parámetros materializados, aunque la variante compartida rinde mejor en code-mixing y CER nepalí.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todos los formatos; el peso del modelo es de 1,12 MB en FP32, 0,56 MB en FP16 y 0,28 MB en INT8, por lo que la memoria dominante es la del runtime.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se realizó en una RTX 4090 en 2,25 h para 36.000 pasos. Para inferencia basta CPU, GPU integrada o aceleradores de borde.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con suficiente memoria para el runtime; también en dispositivos sin GPU.
- Despliegue: el repositorio oficial ofrece CLI `pawp synth` (gestión con `uv`), pesos safetensors y grafos ONNX plegados para inglés y nepalí. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: coste de 20,96 MMAC/s; no se publican cifras de latencia ni de RTF en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PAWP-TTS 300K | 281.078 únicos / 328.158 materializados | en, ne, code-mixed | safetensors, ONNX | CC-BY-4.0 | Ultraligero, voz única, streaming |
| PAWP-TTS 1.5M (mismo autor) | 1.490.828 | en, ne, code-mixed | safetensors | No disponible en la información | Mejor calidad espectral y ASR (WER nepalí 12,35%) |
| Dense-300K (misma familia) | 281.442 | en, ne, code-mixed | safetensors | CC-BY-4.0 | Menor PER monolingüe, peor code-mixing |
| Alternativas comerciales de TTS | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Con 281K parámetros (5,3 veces menor que PAWP-1.5M), el detalle espectral fino y los grupos consonánticos poco frecuentes suenan notablemente más suaves que en el modelo de 1,5 M.
- Voz única de hablante objetivo en inferencia; no soporta clonación de voz zero-shot.
- Las métricas ASR retenidas usan conjuntos pequeños (n=30 en inglés, 30 en nepalí, 9 en code-mixed) y un único reconocedor; la validación formal con múltiples oyentes queda pendiente según el autor.
- Los benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- Riesgo de alucinación acústica y de pronunciación incorrecta en palabras fuera de dominio o en mezclas de idioma atípicas.
- Cobertura lingüística limitada a inglés, nepalí y su mezcla; no hay soporte de otros idiomas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de atribución antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por la comunidad es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Firoj112/pawp-tts-300k
- Repositorio de código: https://github.com/Firojpaudel/PAWP_TTS
- Demo de audio (Space): https://huggingface.co/spaces/Firoj112/pawp-tts-demo
- Modelo hermano de 1,5 M: https://huggingface.co/Firoj112/pawp-tts-1.5m
