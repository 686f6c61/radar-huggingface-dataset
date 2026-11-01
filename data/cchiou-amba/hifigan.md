# cchiou-amba/HiFiGAN

## Resumen

HiFi-GAN v1 es una red generativa adversarial (GAN) para vocodificación neuronal de alta fidelidad, publicada originalmente por Jungil Kong en 2020 (paper arXiv:2010.05646). Convierte espectrogramas log-Mel de 80 bins en formas de onda de audio en el dominio del tiempo a 22,05 kHz. El repositorio `cchiou-amba/HiFiGAN` no contiene los pesos originales en formato estándar de PyTorch, sino una compilación optimizada del modelo para el acelerador neuronal CVflow v3 integrado en el SoC Ambarella N1-655.

La modificación principal consiste en fijar el eje dinámico de tramas Mel a una ventana de solapamiento de 50 tramas: la entrada es un tensor `[1, 80, 50]` en FP16 y la salida es `[1, 12800]` muestras por bloque, con un hop de 256. El modelo se compila mediante el SDK Ambarella Cooper (CNNGen 3.9.0, `cavalry_gen` 3.0.4) al formato binario DAG Cavalry propietario (`vdg_arch = 0xB`), lo que lo hace inutilizable fuera de ese hardware.

Es relevante para desarrolladores que trabajen en síntesis de voz embebida sobre silicio Ambarella, no como sustituto del HiFi-GAN original. El repositorio pesa 0,0 GB (solo contiene el binario compilado), tiene 35 descargas y 0 likes, y la licencia es MIT tanto para el modelo original como para esta adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN generativa (generador HiFi-GAN v1, convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 50 tramas Mel (`core=20`, `ctx=15` por lado) |
| Tipos de cuantizacion | FP16 (IEEE) en puertos de entrada y salida; binario compilado propietario |
| Idiomas soportados | no disponible (modelo acústico independiente del idioma; entrenado con LJSpeech, VCTK y AISHELL-3) |
| Licencia | MIT |
| Formato de pesos | binario DAG Cavalry (`n1-655_hifigan_vocoder_amba_optimized.bin`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

HiFi-GAN v1 es un generador convolucional que transforma espectrogramas Mel en audio mediante bloques de upsampling con convoluciones transpuestas y capas de convolución dilatada multi-recepción (MRF). El discriminador multi-periodo y multi-escala del entrenamiento adversarial original no forma parte del artefacto desplegado, que solo incluye el generador compilado. El paper original reporta entrenamiento sobre LJSpeech-1.1, y esta adaptación cita además Multi-Speaker VCTK y AISHELL-3, todos a 22,05 kHz.

La innovación técnica de este repositorio es la portabilidad al NVP de Ambarella: se fija el eje dinámico de tramas a exactamente 50 tramas con solapamiento (`core=20`, `ctx=15` a cada lado), se compila con `cavalry_gen 3.0.4` para `vdg_arch = 0xB` y se expone un puerto de entrada `mel [1, 80, 50]` FP16 y un puerto de salida `audio [1, 12800]` FP16 por bloque. Del bloque de salida se recortan las 5120 muestras centrales (20 × 256) por trama para evitar artefactos de borde. No se documentan detalles sobre fine-tuning, RLHF ni DPO, que no aplican a un vocoder.

## Capacidades

- Síntesis de voz (vocodificación): convierte espectrogramas log-Mel de 80 bins en forma de onda de audio a 22,05 kHz.
- Salida en bloques de 12800 muestras por inferencia, con recorte central de 5120 muestras por bloque para concatenación sin discontinuidades.
- Soporte multi-hablante implícito según los datasets citados (VCTK, AISHELL-3), aunque el artefacto no expone condicionamiento de hablante.
- Ejecución en hardware embebido Ambarella N1-655 mediante el runtime CVflow v3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en dispositivos de borde con SoC Ambarella N1-655: el binario compilado se ejecuta directamente en el NVP, sin necesidad de GPU ni CPU de altas prestaciones, lo que permite vocodificación en tiempo real en cámaras y dispositivos empotrados.
- Pipelines TTS en sistemas de vigilancia o automoción con chips Ambarella: integración del vocoder tras un modelo acústico que genere espectrogramas Mel de 80 bins a 22,05 kHz.
- Asistentes de voz embebidos de bajo consumo: la ventana fija de 50 tramas y el recorte de 5120 muestras por bloque facilitan el streaming continuo de audio con latencia acotada.
- Reproducción de voz sintética en hardware sin acelerador gráfico: el formato binario DAG elimina la dependencia de PyTorch en producción, reduciendo el consumo y el espacio de almacenamiento.
- Investigación en despliegue de vocoders GAN sobre NPUs propietarias: sirve como referencia de cómo adaptar HiFi-GAN v1 a un backend de compilación específico (Cooper SDK 3.9.0).
- Evaluación comparativa de calidad de síntesis en entornos empotrados: permite medir la fidelidad del vocoder frente a la implementación de referencia en CPU/GPU sobre el mismo conjunto de espectrogramas Mel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, PESQ, RTF) ni comparativas numéricas con otras implementaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en el NVP del SoC Ambarella N1-655, no en GPU.
- GPU recomendadas: no aplica para el binario publicado; para la implementación de referencia en PyTorch se puede usar cualquier GPU con soporte CUDA, pero no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: no, el artefacto es un binario propietario para `vdg_arch = 0xB` (CVflow v3) y no se puede cargar en RTX 4090, A100 ni H100.
- Opciones de despliegue: exclusivamente el runtime CVflow v3 de Ambarella con el SDK Cooper 3.9.0 (`cavalry_gen` 3.0.4). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un vocoder.
- Latencia y throughput estimados: no disponibles. Dependen de la frecuencia del NVP y del pipeline de audio del sistema anfitrión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| HiFi-GAN v1 (cchiou-amba, este repo) | no disponible | 50 tramas Mel fijas | Binario DAG Cavalry | MIT | Ambarella N1-655 |
| HiFi-GAN v1 (jik876, referencia) | no disponible | Tramas Mel dinámicas | PyTorch (checkpoint) | MIT | CPU/GPU |
| sherpa-onnx-hifigan (csukuangfj) | no disponible | Tramas Mel dinámicas | ONNX | MIT | CPU/GPU con ONNX Runtime |
| Parallel WaveGAN | no disponible | Tramas Mel dinámicas | PyTorch | MIT | CPU/GPU |

La comparativa se limita a variantes del mismo vocoder y a un vocoder GAN alternativo; no se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- El artefacto es un binario propietario para Ambarella N1-655; no se puede ejecutar en hardware convencional ni inspeccionar sus pesos.
- La ventana de entrada está fija a 50 tramas Mel (`core=20`, `ctx=15`); no admite longitudes dinámicas como la implementación original.
- Solo se incluye el generador; no hay código de entrenamiento, discriminadores ni scripts de exportación en el repositorio.
- El repositorio pesa 0,0 GB y no contiene pesos en safetensors, GGUF ni ONNX; no es reutilizable fuera del ecosistema Cooper.
- Riesgo de artefactos de borde si no se aplica correctamente el recorte central de 5120 muestras por bloque.
- No se documentan sesgos, pero al ser un vocoder entrenado con LJSpeech, VCTK y AISHELL-3 puede reproducir características acústicas de esos corpus (voces, acentos y condiciones de grabación).
- La licencia MIT permite uso comercial, pero el binario compilado puede estar sujeto a los términos del SDK Cooper de Ambarella, no detallados en la model card.
- La fecha de creación del repositorio (2026-10-28) y la atribución de modificación a Ambarella International LLC (2026) deben verificarse antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cchiou-amba/HiFiGAN
- Binario compilado: https://huggingface.co/cchiou-amba/HiFiGAN/blob/main/n1-655_hifigan_vocoder_amba_optimized.bin
- Paper original: https://arxiv.org/abs/2010.05646
- Implementación de referencia: https://github.com/jik876/hifi-gan
- Pesos originales (ONNX): https://huggingface.co/csukuangfj/sherpa-onnx-hifigan
