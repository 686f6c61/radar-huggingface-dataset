# alshell7/hush-ai

## Resumen

Hush AI es un repositorio de pesos de modelos de supresion de ruido para voz en tiempo real, publicado por el desarrollador independiente alshell7 como parte de la aplicacion de escritorio Hush AI. No se trata de un modelo unico entrenado desde cero, sino de un espejo (mirror) verificado por SHA-256 de dos modelos de terceros: DeepFilterNet 3 de Hendrik Schroter (8 MB, ONNX) y NVIDIA Real-time RE-USE en su revision `4c0c186` (13,5 M de parametros, FP32, 54 MB, safetensors). El repo pesa 0,1 GB e incluye las muestras de audio originales de NVIDIA, antes y despues del procesado.

El problema que resuelve es la cancelacion de ruido en tiempo real sobre CPU, sin GPU, sin Python y sin conexion de red, para integrarse en llamadas y aplicaciones de videoconferencia de escritorio. La relevancia actual esta en el motor nativo en Rust (`hush-core`) que porta el modelo Mamba de NVIDIA y lo ejecuta con latencias de 11,7 a 36,8 ms por trama de 20 ms en un Apple M1 con 2 hilos, con una precision de 113-118 dB de SNR de forma de onda frente a la referencia GPU de NVIDIA.

La licencia es mixta y restrictiva: DeepFilterNet 3 es MIT o Apache-2.0 con uso comercial permitido, mientras que Real-time RE-USE queda bajo la NVIDIA One-Way Noncommercial License, solo para investigacion y educacion no comercial. La aplicacion y el motor son Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet 3 (encoder ONNX y dos decoders) y NVIDIA Real-time RE-USE (Mamba) |
| Parametros totales | 13,5 M (Real-time RE-USE); no disponible para DeepFilterNet 3 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio en streaming; tramas de 10 ms en DFN3 y 20 ms en RE-USE) |
| Tipos de cuantizacion | FP32 en los pesos de RE-USE; ONNX en DFN3; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (procesamiento de senal de voz, independiente del idioma) |
| Licencia | Mixta: NVIDIA One-Way Noncommercial (RE-USE) y MIT o Apache-2.0 (DeepFilterNet 3) |
| Formato de pesos | `.safetensors` (RE-USE) y `.tar.gz` con ONNX (DeepFilterNet 3) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye sin modificar los pesos de dos sistemas existentes. DeepFilterNet 3 es un modelo de mejora de voz perceptualmente motivado, presentado por Schroter et al. en Interspeech 2023, que opera a 48 kHz con tramas de 10 ms y se ejecuta mediante la inferencia oficial en Rust (libDF con tract). Real-time RE-USE es un modelo de NVIDIA basado en arquitectura Mamba, orientado a supresion de ruido en streaming con tramas de 20 ms; en Hush AI se ejecuta mediante un port nativo a Rust con configuracion parametrizable de capas y frecuencia de muestreo (16 kHz con 3 capas, 24 kHz con 4 capas o 48 kHz con 3 capas).

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de RLHF o DPO para ninguno de los dos modelos; la model card remite a la model card original de NVIDIA para los detalles de entrenamiento y papers. La innovacion tecnica destacable no esta en el entrenamiento sino en el despliegue: inferencia en CPU pura, sin GPU ni red, con verificacion de integridad SHA-256 de los ficheros y una implementacion Rust (`hush-core`) que reproduce la salida de la referencia GPU de NVIDIA con 113-118 dB de SNR de forma de onda en voz corta.

## Capacidades

- Supresion de ruido y mejora de voz en tiempo real sobre audio en streaming.
- Cancelacion de ruido en modo `audio-to-audio` con dos motores intercambiables en la aplicacion: DeepFilterNet 3 y Real-time RE-USE.
- Procesamiento a 48 kHz y tramas de 10 ms con DeepFilterNet 3; 16, 24 o 48 kHz y tramas de 20 ms con RE-USE.
- Ejecucion integra en CPU, sin Python, sin GPU y sin conexion de red (on-device).
- Tres perfiles de calidad en RE-USE: Light (16 kHz, 3 capas), Balanced (24 kHz, 4 capas) y Studio (48 kHz, 3 capas).
- Integracion programable desde Rust mediante el crate `hush-core` y la API `Denoiser::with_config` / `process_into`.
- Verificacion de integridad de los pesos mediante SHA-256 antes de su uso, con descarga de respaldo desde la fuente original.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni razonamiento multi-paso.

## Casos de uso

- Cancelacion de ruido en videollamadas de escritorio: la aplicacion captura el audio del microfono, lo procesa por tramas de 10 o 20 ms y devuelve la senal limpia, con una latencia de 60-80 ms mas los buffers del dispositivo, adecuada para conversacion en tiempo real.
- Integracion en pipelines de VoIP o reuniones corporativas: el motor en Rust puede enlazarse como biblioteca (`hush-core`) dentro de un cliente de comunicaciones existente, sin dependencias de Python ni de GPU en el puesto del usuario.
- Procesamiento en dispositivos de bajos recursos: al ejecutarse solo en CPU y con un modelo de 13,5 M de parametros y 54 MB, es viable en portatiles y equipos sin acelerador grafico.
- Preprocesado de audio para transcripcion o asistentes de voz: la reduccion de ruido antes de un ASR mejora la relacion senal-ruido de la entrada, especialmente en entornos domesticos o de oficina ruidosos.
- Creacion de contenido y grabacion de podcasts: el perfil Studio a 48 kHz permite limpiar grabaciones de voz manteniendo la frecuencia de muestreo completa.
- Investigacion en mejora de voz: el repositorio sirve como referencia reproducible para comparar DeepFilterNet 3, Real-time RE-USE y RNNoise sobre VoiceBank-DEMAND, con la comparativa publicada en `docs/COMPARISON.md`.
- Evaluacion de ports nativos de modelos Mamba: el port en Rust de RE-USE y sus pruebas de regresion en CI (Windows, macOS y Linux) sirven como caso de estudio de reimplementacion fiel a la referencia GPU.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K), ya que no es un modelo de lenguaje. Los datos de rendimiento disponibles son de latencia y fidelidad:

| Metrica | Valor |
|---|---|
| Latencia RE-USE Light (16 kHz, 3 capas), Apple M1, 2 hilos | 11,7 ms p99 por trama de 20 ms |
| Latencia RE-USE Balanced (24 kHz, 4 capas), Apple M1, 2 hilos | 21,3 ms p99 por trama de 20 ms |
| Latencia RE-USE Studio (48 kHz, 3 capas), Apple M1, 2 hilos | 36,8 ms p99 por trama de 20 ms |
| Retardo extremo a extremo | 60-80 ms mas buffers del dispositivo |
| Fidelidad CPU frente a referencia GPU de NVIDIA | 113-118 dB de SNR de forma de onda en voz corta |
| Pruebas de regresion | 7 casos de NVIDIA superados en CI en Windows, macOS y Linux |
| Comparativa adicional | DeepFilterNet 3 y RNNoise sobre VoiceBank-DEMAND en `docs/COMPARISON.md` (sin cifras en la model card) |

## Requisitos de hardware

- VRAM: no aplica; ambos motores se ejecutan en CPU, sin GPU.
- Memoria RAM: los pesos ocupan 8 MB (DeepFilterNet 3) y 54 MB (Real-time RE-USE); el consumo adicional depende de los buffers de audio de la aplicacion.
- GPU recomendadas: no aplica; no se requiere acelerador grafico. NVIDIA uso GPU para generar la referencia, pero Hush AI ejecuta el port en CPU.
- CPU: los datos publicados corresponden a un Apple M1 con 2 hilos; no se documentan cifras para otras CPU.
- Cabe en cualquier equipo de consumo: el requisito es CPU, no GPU.
- Despliegue: aplicacion de escritorio Hush AI (Windows, macOS y Linux, con CI verificado) o biblioteca Rust `hush-core`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 11,7-36,8 ms p99 por trama de 20 ms segun perfil en Apple M1 con 2 hilos; retardo total de 60-80 ms mas buffers.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Frecuencia / trama | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hush AI (Real-time RE-USE) | 13,5 M | safetensors (FP32) | 16/24/48 kHz, 20 ms | NVIDIA One-Way Noncommercial | Hugging Face y GitHub |
| Hush AI (DeepFilterNet 3) | no disponible | ONNX | 48 kHz, 10 ms | MIT o Apache-2.0 | Hugging Face y GitHub |
| DeepFilterNet 3 (original) | no disponible | ONNX / Rust libDF | 48 kHz, 10 ms | MIT o Apache-2.0 | GitHub de Rikorose |
| RNNoise | no disponible | no disponible | no disponible | no disponible | referenciado en la comparativa de Hush AI |
| NVIDIA Real-time RE-USE (original) | 13,5 M | safetensors | 20 ms | NVIDIA One-Way Noncommercial | Hugging Face (nvidia/Real-time_RE-USE) |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos de Real-time RE-USE y las muestras de audio estan bajo la NVIDIA One-Way Noncommercial License, limitada a investigacion y educacion no comercial; solo NVIDIA y sus afiliados pueden usarlos comercialmente. Para uso comercial debe emplearse DeepFilterNet 3 (MIT o Apache-2.0).
- El repositorio no aporta pesos nuevos ni entrenamiento propio: es un espejo de modelos de terceros, por lo que las limitaciones de sesgo y calidad son las de los modelos originales y no se documentan en esta model card.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o comportamiento ante idiomas concretos; el procesamiento es de senal y no depende del idioma, pero no se documenta cobertura linguistica.
- Las cifras de latencia publicadas corresponden unicamente a un Apple M1 con 2 hilos; el rendimiento en otras CPU no esta documentado.
- El retardo de 60-80 ms mas los buffers del dispositivo puede ser excesivo para aplicaciones de audio con requisitos de latencia muy estrictos.
- La aplicacion depende de la disponibilidad del espejo o de la fuente original para descargar los pesos; la verificacion SHA-256 mitiga manipulacion, pero no garantiza disponibilidad.
- Hush AI es un proyecto independiente, no afiliado ni respaldado por NVIDIA ni por los autores de DeepFilterNet.
- No se documentan capacidades de lenguaje, razonamiento, codigo, vision ni tool calling; no debe evaluarse como modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alshell7/hush-ai
- Repositorio GitHub de Hush AI: https://github.com/alshell7/hush-ai
- Crate `hush-core`: https://github.com/alshell7/hush-ai/tree/main/crates/hush-core
- Comparativa con DeepFilterNet 3 y RNNoise: https://github.com/alshell7/hush-ai/blob/main/docs/COMPARISON.md
- Descarga de la aplicacion: https://github.com/alshell7/hush-ai/releases/latest
- Sitio web: https://alshell7.github.io/hush-ai/
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Real-time_RE-USE
- DeepFilterNet 3 (codigo original): https://github.com/Rikorose/DeepFilterNet
- Paper de DeepFilterNet: Schroter et al., *DeepFilterNet: Perceptually Motivated Real-Time Speech Enhancement*, Interspeech 2023
