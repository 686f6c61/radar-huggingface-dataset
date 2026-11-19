# mrfakename/voice-isolator-onnx

## Resumen

Voice Isolator v1 (ONNX) es una conversión al formato ONNX del modelo de aislamiento de voz y supresión de ruido desarrollado originalmente por Inworld AI (`inworld/voice-isolator`). El modelo toma audio mono a 48 kHz y devuelve una corrección espectral compleja que, sumada al audio original, produce la señal de voz limpia; por diferencia se obtiene el fondo eliminado. Esta versión, publicada por el usuario mrfakename, no modifica los pesos ni el comportamiento matemático del modelo original: solo cambia el formato de empaquetado para permitir inferencia en navegador y en entornos sin PyTorch.

La relevancia de esta conversión radica en la portabilidad. El grafo ONNX (opset 17, fp32) puede ejecutarse en runtime web con WebGPU, lo que habilita casos de supresión de ruido en cliente sin enviar audio a servidores. El repositorio ocupa aproximadamente 0,5 GB y se distribuye bajo licencia Apache-2.0, la misma del modelo base.

Arquitectónicamente, el modelo original combina capas de procesamiento espectral con mecanismos de tipo Mamba (selective scan), lo que explica la necesidad de una exportación cuidadosa de las recurrencias al grafo ONNX. El contexto de audio no es un contexto de tokens: el modelo se entrenó con ventanas de 8 segundos (801 frames STFT), y para audio más largo se recomienda procesar por ventanas con crossfade lineal de 2 segundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de corrección espectral compleja con mecanismos Mamba (selective scan); grafo ONNX opset 17 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrenamiento de 8 s (801 frames STFT) |
| Tipos de cuantización | no disponible (el grafo exportado es fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32, opset 17); tamaño de repo ~0,5 GB |

Parámetros de audio y STFT:

| Parámetro | Valor |
|---|---|
| Frecuencia de muestreo | 48 kHz, mono |
| n_fft | 2048 |
| Hop length | 480 |
| Ventana | Hann periódica |
| Centrado | `center=True` con padding reflectante |
| Entrada | `spec`: float32 `[1, frames, 1025, 2]` (parte real/imaginaria de la STFT) |
| Salida | `correction`: float32 `[1, frames, 1025, 2]` (espectro de corrección complejo) |
| Frames dinámicos | sí |

## Arquitectura y entrenamiento

El modelo opera en el dominio de la STFT. La entrada es la representación compleja (parte real e imaginaria) de la STFT de audio mono a 48 kHz con `n_fft=2048` y `hop=480`, lo que produce 1025 bins de frecuencia por frame. La red predice un espectro de corrección complejo; la voz limpia se reconstruye como `audio + istft(correction, length=len(audio))` y el fondo eliminado como `audio - voice`, usando la misma ventana y hop.

La exportación a ONNX resuelve un problema técnico concreto: los mecanismos de tipo Mamba requieren selective scans recurrentes que, en un grafo ONNX, no pueden expresarse como un bucle por frame sin penalizar el rendimiento. El autor implementa un scan bloqueado exacto: cada scan se divide en chunks de 64 frames, los chunks se escanean en paralelo partiendo de estado cero, una recurrencia corta entre chunks proporciona el estado inicial real de cada chunk, y una pasada final paralela emite las salidas. El resultado coincide matemáticamente con la recurrencia original salvo diferencias de redondeo en coma flotante.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo fue convertido desde el paquete `inworld-voice-isolation==1.0.0`.

## Capacidades

- Supresión de ruido y aislamiento de voz en audio mono a 48 kHz.
- Separación de la señal de voz y del fondo: la salida permite obtener tanto la voz limpia como el fondo eliminado por resta.
- Procesamiento de audio de duración arbitraria mediante ventanas de 8 s con crossfade lineal de 2 s.
- Inferencia en navegador mediante WebGPU (existe una demo pública en Hugging Face Spaces).
- Ejecución en runtimes ONNX sin dependencia de PyTorch.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni agentes.
- No es un modelo de lenguaje: no genera texto ni tiene capacidades multilingües en el sentido habitual.
- No dispone de modo thinking, visión ni procesamiento de audio distinto de la mejora de voz.

## Casos de uso

- Videollamadas y conferencias en navegador: el grafo ONNX puede ejecutarse en cliente con WebGPU, de modo que la supresión de ruido ocurre en el dispositivo del usuario sin enviar audio a un servidor, reduciendo latencia y preservando la privacidad.
- Limpieza de pódcasts y grabaciones: procesar la pista de voz por ventanas de 8 s con crossfade de 2 s para eliminar ruido de fondo (ventiladores, tráfico, teclados) antes de la mezcla final.
- Preprocesado para ASR: aplicar el aislamiento de voz antes de un sistema de reconocimiento automático del habla para mejorar la tasa de error en entornos ruidosos.
- Extracción de fondo para doblaje o efectos: la señal residual `audio - voice` permite recuperar el ambiente o la música de fondo de una grabación para reutilizarla en una mezcla nueva.
- Aplicaciones móviles y de escritorio multiplataforma: al ser ONNX, puede integrarse en runtimes nativos sin arrastrar la pila de PyTorch, reduciendo el tamaño del binario y las dependencias.
- Herramientas de accesibilidad y comunicación: limpieza de audio en tiempo casi real para usuarios con dificultades auditivas o en entornos con ruido ambiental elevado.
- Procesado por lotes en pipelines de medios: integración en flujos de postproducción que ya trabajan con audio a 48 kHz y necesitan un paso de mejora de voz determinista y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa ~0,5 GB en fp32, por lo que la huella de memoria del grafo es del orden de cientos de MB, a lo que se suma el buffer de audio procesado.
- GPU recomendadas: no se especifican. Al ser un grafo ONNX fp32 de tamaño moderado, es apto para GPU de consumo, aunque no se documentan modelos concretos.
- GPU de consumo: previsiblemente cabe en GPU de consumo modernas, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU), ejecución en navegador vía WebGPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio).
- Latencia y throughput: no disponibles. El procesamiento es por ventanas de 8 s con crossfade de 2 s, lo que implica un coste proporcional a la duración del audio.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / ventana | Disponibilidad |
|---|---|---|---|---|---|
| Voice Isolator v1 (ONNX) | Supresión de ruido / aislamiento de voz | ONNX fp32 | Apache-2.0 | Ventana de 8 s (801 frames) | Hugging Face, demo WebGPU |
| inworld/voice-isolator | Supresión de ruido / aislamiento de voz | Pesos originales (PyTorch) | Apache-2.0 | Ventana de 8 s | Hugging Face |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó con ventanas de 8 s; para audio más largo es obligatorio usar ventanas con crossfade de 2 s, tal como implementa `VoiceIsolatorNetwork.enhance`. Omitir el crossfade puede producir artefactos en las uniones.
- La exportación ONNX introduce diferencias de redondeo en coma flotante respecto a la recurrencia original; no son errores de diseño, pero implican que la salida no es bit a bit idéntica a la del modelo PyTorch.
- Solo admite audio mono a 48 kHz con la configuración STFT especificada (n_fft=2048, hop=480, Hann periódica, center=True). Otras configuraciones requieren remuestreo y ajuste previo.
- No hay información publicada sobre sesgos, tasas de alucinación (no aplica en el sentido de generación de texto) ni comportamiento en idiomas o acentos concretos.
- No se documentan limitaciones específicas de rendimiento en audio musical o con múltiples hablantes solapados.
- La licencia Apache-2.0 permite uso comercial, pero el crédito del modelo corresponde a Inworld AI; esta conversión solo cambia el formato.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/voice-isolator-onnx
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Demo WebGPU en navegador: https://huggingface.co/spaces/mrfakename/voice-isolator-webgpu
- Paquete de referencia: `inworld-voice-isolation==1.0.0`
- Implementación JavaScript de referencia: `vi.js` en el Space anterior
