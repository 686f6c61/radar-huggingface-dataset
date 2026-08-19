# Project42/mel-band-roformer-karaoke-webgpu

## Resumen

El modelo `Project42/mel-band-roformer-karaoke-webgpu` es un re-export del checkpoint `mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956` (originalmente publicado como `bdsqlsz/mel_band_roformer_karaoke_aufr33-ONNX`) modificado para ejecutarse en el backend WebGPU de onnxruntime-web. El objetivo es permitir la separación de voz y acompañamiento musical directamente en el navegador, sin necesidad de servidores dedicados. Para ello, se reemplazaron todas las operaciones `Einsum` por subgrafos equivalentes con `MatMul`/`Mul`/`Transpose`, y los dos `Split` de 60 salidas se reconstruyeron como árboles binarios de splits de 2 salidas, evitando el límite de 10 storage buffers por shader en WebGPU.

El modelo acepta características STFT de entrada y produce una máscara de voz principal (lead vocal), que permite obtener el acompañamiento restando la máscara de la señal original. Está pensado para su integración en aplicaciones de edición de vídeo o karaoke en tiempo real, como el proyecto KaraokeVideoEditor. El repositorio tiene un tamaño de 0,9 GB y está licenciado bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoFormer (mel-band), segun el nombre del modelo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a un RoFormer aplicado a bandas de mel, especializado en separación de fuentes de audio. La model card no detalla el número de parámetros ni la configuración interna. El checkpoint original (`mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956`) fue entrenado para separar voz principal de acompañamiento, pero no se proporciona información sobre el dataset, el número de tokens (en este caso, muestras de audio) ni el proceso de entrenamiento (RLHF, DPO, etc.). La versión aquí publicada es una re-exportación con cirugía de grafo para compatibilidad con WebGPU; la model card afirma que el grafo reescrito es numéricamente idéntico al original (maxAbsDiff = 0.0 en entradas de prueba).

## Capacidades

- Separación de voz principal (lead vocal) y acompañamiento (backing) en audio musical.
- Procesamiento de características STFT (entrada `stft_features` de forma `[1, frames, 4100]`).
- Generación de máscara de voz con forma `[1, 1, 2050, frames, 2]`.
- Ejecución en navegador mediante WebGPU (onnxruntime-web).
- Integración con el editor de vídeo de karaoke KaraokeVideoEditor.

## Casos de uso

- **Edición de vídeo para karaoke**: el modelo permite extraer la pista vocal de una canción para crear vídeos de karaoke sin necesidad de procesamiento en servidor. Se integraría en la herramienta KaraokeVideoEditor, que utiliza la interfaz host-STFT descrita en la model card.
- **Aplicaciones web de separación de audio en tiempo real**: al ejecutarse en WebGPU, puede ofrecer separación de voz en el cliente, reduciendo latencia y costes de infraestructura.
- **Remezclas y remasterización**: los productores pueden aislar la voz para crear remixes o versiones instrumentales directamente desde el navegador.
- **Transcripción musical asistida**: separar la voz del acompañamiento facilita el análisis de letras o melodías en herramientas educativas.
- **Preprocesamiento para reconocimiento de voz**: al limpiar la señal de voz, se puede mejorar la precisión de sistemas de transcripción automática en entornos con música de fondo.
- **Desarrollo de plugins de audio**: los desarrolladores pueden integrar este modelo en extensiones de navegador o aplicaciones de edición que requieran separación de fuentes sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El nombre del checkpoint incluye el valor `sdr_10.1956`, que sugiere un SDR (Signal-to-Distortion Ratio) de 10,1956 dB en alguna métrica de evaluación, pero no se proporciona una tabla comparativa ni contexto sobre cómo se obtuvo.

## Requisitos de hardware

- Al ser un modelo ONNX ejecutado en WebGPU, no requiere GPU dedicada en el servidor; se ejecuta en el dispositivo del usuario.
- Necesita un navegador compatible con WebGPU (Chrome, Edge, Firefox nightly, etc.) y una GPU que soporte WebGPU.
- No se dispone de estimaciones de VRAM, latencia o throughput en la información proporcionada.
- El despliegue se realiza mediante onnxruntime-web; no se mencionan otros backends (vLLM, llama.cpp, Ollama, TGI) porque no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información facilitada.

## Limitaciones y advertencias

- La model card no detalla sesgos ni riesgos de alucinación, al ser un modelo de audio no generativo.
- La separación de voz puede no ser perfecta en mezclas complejas o con efectos de reverberación, aunque no se especifica el rendimiento real.
- La compatibilidad con WebGPU depende del navegador y del hardware del usuario; algunos dispositivos pueden no soportarlo.
- El modelo está pensado para uso en el navegador; no se garantiza su funcionamiento en otros entornos.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos del modelo original (`bdsqlsz/mel_band_roformer_karaoke_aufr33-ONNX`) por si tuviera restricciones adicionales.
- El tamaño del repositorio (0,9 GB) puede implicar tiempos de carga considerables en aplicaciones web.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Project42/mel-band-roformer-karaoke-webgpu)
- [KaraokeVideoEditor (repositorio de la aplicación)](https://github.com/altimar/karaoke_video_editor)
- Modelo original: `bdsqlsz/mel_band_roformer_karaoke_aufr33-ONNX` (no se proporciona URL directa)
