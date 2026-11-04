# ELAINAy/duplex-voice-models

## Resumen

ELAINAy/duplex-voice-models es un repositorio de modelos de voz full-duplex cuantizados y compilados a binarios de contexto QNN HTP para la aplicación Android Duplex. No se trata de un modelo entrenado desde cero, sino de una colección de artefactos de despliegue derivados de dos familias de modelos open source: MiniCPM-o 4.5 de OpenBMB y Moshi/Moshiko de Kyutai. El repositorio lo mantiene el usuario ELAINAy y está pensado para ejecutarse sobre SoCs Qualcomm Snapdragon concretos, con versiones de QAIRT específicas.

La propuesta técnica es relevante porque traslada modelos de voz conversacional full-duplex (escuchar y hablar simultáneamente, con latencia de frame de 80 ms en el caso de Moshi) a aceleradores NPU de móvil mediante cuantización agresiva: LPBQ W4 para el LLM, W8 para los codificadores de audio y visión, e int8 en CPU para el TTS. El resultado son paquetes de entre 4,7 y 6,9 GB que la app descarga desde el catálogo remoto.

El repositorio ocupa 18,3 GB en total y contiene variantes para SM8850 y SM8975. La licencia declarada es "other", y cada variante hereda la licencia del modelo original (Apache-2.0 para MiniCPM-o, CC-BY-4.0 para Moshiko), por lo que la reutilización comercial exige verificar ambos marcos. No hay información publicada sobre benchmarks ni sobre idiomas más allá de los indicados en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos originales: MiniCPM-o 4.5 (LLM Qwen3-8B + Whisper-medium + SigLIP + DiT + HiFT/CosyVoice2) y Moshi/Moshiko (transformer temporal + DepFormer + codec Mimi 24 kHz) |
| Parametros totales | 9B (variante MiniCPM-o 4.5, modelo completo); 7B (variante Moshi/Moshiko) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LLM LPBQ W4; Whisper/DiT/HiFT/SigLIP W8; DepFormer W8; Mimi W8/W4; TTS CPU int8 |
| Idiomas soportados | Chino e inglés (MiniCPM-o 4.5); inglés (Moshi/Moshiko, experimental) |
| Licencia | other (repositorio); Apache-2.0 (MiniCPM-o 4.5); CC-BY-4.0 (Moshiko) |
| Formato de pesos | Binarios de contexto QNN HTP (compilados para SoC y QAIRT concretos), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio: los pesos proceden de modelos publicados por terceros y se transforman mediante cuantización y compilación para QNN HTP. La variante MiniCPM-o 4.5 integra un LLM Qwen3-8B que decide cada segundo si escuchar o hablar, un codificador de audio Whisper-medium, un codificador visual SigLIP (solo en la variante v2), un decoder DiT y un vocoder HiFT con TTS basado en CosyVoice2 en CPU. La variante Moshi/Moshiko emplea un transformer temporal con DepFormer y el codec Mimi a 24 kHz, con frames de 80 ms para diálogo full-duplex.

La innovación técnica principal es el pipeline de despliegue: cuantización LPBQ de 4 bits para el LLM, 8 bits para los módulos de audio/visión y compilación a binarios de contexto QNN HTP ligados a un SoC y a una versión de QAIRT. Esto implica que los artefactos no son portables entre dispositivos ni entre versiones del runtime. No se dispone de información sobre tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en los modelos originales dentro de la información proporcionada.

## Capacidades

- Diálogo de voz full-duplex: escucha y habla simultáneamente, con decisión de turno cada segundo en MiniCPM-o 4.5 y frames de 80 ms en Moshi.
- Speech-to-speech en chino e inglés (MiniCPM-o 4.5) e inglés experimental (Moshi/Moshiko).
- Comprensión de audio mediante Whisper-medium y síntesis de voz en streaming con CosyVoice2/HiFT.
- Comprensión de imagen en la variante `minicpmo45-v2-sm8975`, que incluye SigLIP y permite "ver" imágenes.
- Ejecución en NPU Qualcomm Hexagon (HTP) con cuantización mixta W4/W8 e int8 en CPU para el TTS.
- Integración con la app Android Duplex mediante `catalog.json` y descarga desde Hugging Face o espejos como hf-mirror.com.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistentes de voz conversacionales en Android: la app Duplex puede mantener diálogo full-duplex con turnos solapados, usando la decisión de escuchar/hablar cada segundo de MiniCPM-o 4.5 para reducir la latencia percibida.
- Traducción bidireccional chino-inglés en tiempo real: el par de idiomas cubierto por MiniCPM-o 4.5 permite conversaciones cara a cara con síntesis de voz en streaming.
- Atención al cliente embebida en el dispositivo: al ejecutarse en la NPU local, evita enviar audio a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o conectividad intermitente.
- Descripción visual asistida: la variante v2 con SigLIP permite responder preguntas sobre imágenes capturadas por la cámara del teléfono, útil en aplicaciones de accesibilidad.
- Investigación en interacción full-duplex: Moshiko permite experimentar con diálogo solapado y métricas de latencia a 80 ms por frame sobre hardware Snapdragon.
- Pruebas de despliegue en borde (edge): sirve como referencia para medir el coste real de cuantizar un LLM de 8-9B y codecs de audio en un SoC móvil, comparando variantes SM8850 y SM8975.
- Prototipos de agentes de voz: combinando la decisión de turno del LLM con el TTS en CPU, se pueden construir pipelines de voz para demos en ferias o entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- SoC: exclusivamente Qualcomm Snapdragon SM8850 o SM8975, según la variante. Los binarios no cargan en otros SoC.
- Runtime: QAIRT 2.45.0.260326 (SM8850) o 2.51.40.260930 (SM8975). Una versión distinta impide la carga del binario de contexto.
- Almacenamiento: entre 4,71 GB (Moshiko SM8850) y 6,93 GB (MiniCPM-o v2 SM8975) por variante; el repositorio completo ocupa 18,3 GB.
- Memoria: no disponible la VRAM/RAM estimada en ejecución; al tratarse de NPU móvil, depende de la memoria del dispositivo y del reparto entre HTP y CPU.
- GPU de escritorio: no aplica; no se ofrecen pesos en safetensors ni GGUF para A100, H100 o RTX 4090.
- Opciones de despliegue: app Android Duplex con descarga vía `catalog.json` desde Hugging Face o hf-mirror.com; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica un frame de 80 ms en Moshi/Moshiko.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| ELAINAy/duplex-voice-models (MiniCPM-o 4.5) | 9B | no disponible | Sí | other (hereda Apache-2.0) | Binarios QNN HTP para SM8850/SM8975 |
| ELAINAy/duplex-voice-models (Moshiko) | 7B | no disponible | Sí | other (hereda CC-BY-4.0) | Binarios QNN HTP para SM8850 |
| openbmb/MiniCPM-o-4_5 | 9B | no disponible | Sí (parte de voz) | Apache-2.0 | Pesos originales (no especificado) |
| kyutai/moshiko-pytorch-bf16 | 7B | no disponible | Sí | CC-BY-4.0 | PyTorch bf16 |

La comparativa se limita a los modelos de origen citados en la model card, ya que no se proporcionan datos de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Portabilidad nula: cada binario está ligado a un SoC y a una versión de QAIRT; no se puede reutilizar en otro hardware ni tras actualizar el runtime.
- Licencia "other" en el repositorio: el uso comercial requiere revisar por separado la licencia Apache-2.0 de MiniCPM-o 4.5 y la CC-BY-4.0 de Moshiko, además de los términos del autor del repositorio.
- Idiomas limitados: chino e inglés en MiniCPM-o 4.5; solo inglés en Moshiko, marcado como experimental.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, latencia o throughput más allá del frame de 80 ms de Moshi.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al derivar de modelos conversacionales, persisten los sesgos de los pesos originales.
- Dependencia de la app Duplex y de `catalog.json`: el flujo de descarga desde Hugging Face o espejos introduce un punto de fallo externo.
- Cero descargas y un solo "like" en el momento de la consulta: proyecto con validación comunitaria mínima.
- La variante con visión solo existe para SM8975; en SM8850 no hay soporte de imagen.
- No se documentan límites de contexto ni políticas de seguridad o moderación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ELAINAy/duplex-voice-models
- Modelo original MiniCPM-o 4.5: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Modelo original Moshiko: https://huggingface.co/kyutai/moshiko-pytorch-bf16
- Espejo de descarga citado: https://hf-mirror.com
