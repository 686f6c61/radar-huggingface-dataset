# ruisv/rcdl-vocos

## Resumen

Vocos 16 kHz para RK3588 es un modelo vocoder compilado en formato RKNN (`.rknn`) para la NPU de los SoC Rockchip RK3588 y RK3588S. Lo publica el autor `ruisv` como parte del ecosistema RCDL, una biblioteca en C++17 y Python para visión y voz en estas placas. Convierte un espectrograma mel de 80 bandas en forma de onda de audio a 16 kHz, y es el vocoder del sistema Matcha-TTS zh-en del mismo autor.

El modelo no es un transformer de lenguaje ni un modelo generativo de texto: es la etapa final de un pipeline TTS, la que transforma representaciones acústicas en muestras PCM. Su interés está en que viene ya compilado en fp16 con rknn-toolkit2 2.3.2, de modo que se carga directamente en la NPU sin exportación ONNX ni pasos de conversión. El repositorio ocupa 0,0 GB y el único artefacto pesa 26,6 MB.

La relevancia es de nicho pero muy concreta: despliegue de síntesis de voz en placas de bajo consumo con aceleración NPU, con una latencia medida de 53 ms para 3 segundos de mel (26 ms de ellos en NPU). La licencia declarada es Apache-2.0 y el código Vocos subyacente es MIT, lo que permite redistribución, incluido uso comercial, aunque los datos de entrenamiento no se detallan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocos (vocoder basado en ISTFT con cabecera de magnitud y fase); grafo compilado RKNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 256 frames de mel con solapamiento de 32 frames por lado, campo receptivo de 27 frames |
| Tipos de cuantizacion | fp16 (build de rknn-toolkit2 2.3.2) |
| Idiomas soportados | no disponible (el vocoder es agnóstico al idioma; el pipeline Matcha-TTS asociado es zh-en) |
| Licencia | Apache-2.0 (pesos y fichero compilado); código Vocos MIT |
| Formato de pesos | `.rknn` (26,6 MB), entrada `mels [1,80,256]`, salidas log-magnitud y fase cruda `[1,513,256]` |

## Arquitectura y entrenamiento

Vocos es un vocoder que sustituye la generación autoregresiva o por difusión por una predicción directa en el dominio de la frecuencia: la red estima log-magnitud y fase para cada frame y la forma de onda se reconstruye con una ISTFT centrada (n_fft 1024, hop 256). En esta versión el grafo RKNN se detiene en la cabecera; RCDL ejecuta en CPU el resto del pipeline (exp y clip, cos/sin de la fase y la ISTFT inversa centrada). El modelo procesa mels de cualquier longitud troceándolos en ventanas de 256 frames con 32 frames de solapamiento a cada lado; como el campo receptivo es de 27 frames, las costuras entre ventanas son exactas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO; la model card indica explícitamente que los datos de entrenamiento no se revelan. El modelo upstream es `vocos-16khz-univ`, publicado junto a Matcha-TTS zh-en en ModelScope. La innovación técnica destacable es de despliegue: compilación fp16 lista para NPU con separación deliberada de la trigonometría fuera del grafo, porque la fase cruda abarca aproximadamente ±42 rad y un grafo de precisión reducida no la representaría con exactitud suficiente para que cos/sin salgan correctos.

## Capacidades

- Síntesis de forma de onda a partir de espectrogramas mel de 80 bandas a 16 kHz (conversión mel a PCM).
- Generación de audio en tiempo casi real sobre NPU: 53 ms para 3 s de mel, de los cuales 26 ms son NPU.
- Procesamiento de mels de longitud arbitraria mediante ventanas de 256 frames con solapamiento exacto.
- Integración como etapa final de un pipeline TTS completo a través de `rcdl.TextToSpeech` con `ruisv/rcdl-matcha-tts`.
- Ejecución en pipeline cero-copia con NPU, RGA y VPU dentro de RCDL.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No se documentan capacidades multilingües propias; el vocoder es independiente del idioma de entrada.

## Casos de uso

- Síntesis de voz en dispositivos empotrados: integrado en `rcdl.TextToSpeech` junto a Matcha-TTS zh-en, permite generar audio hablado en la propia placa RK3588 sin depender de un servidor, con 53 ms por cada 3 s de audio.
- Asistentes de voz offline: al ejecutarse sobre NPU con un consumo propio de una placa SBC, encaja en dispositivos sin conectividad permanente que necesitan convertir texto en voz localmente.
- Lectura de textos en pantallas e interfaces de kiosco: el vocoder convierte la salida del modelo acústico en PCM float32 listo para reproducción, con ventanas de 256 frames que permiten streaming por bloques.
- Accesibilidad para personas con discapacidad visual: generación de locución sintética en hardware de bajo coste, sin GPU dedicada.
- Prototipado de pipelines TTS en investigación: al estar compilado y medido, sirve como referencia de latencia y fidelidad espectral (0,17–0,32 dB de distancia al modelo float) para comparar implementaciones en NPU.
- Productos de domótica y electrónica de consumo con avisos hablados: la latencia de decenas de milisegundos y el tamaño de 26,6 MB permiten incluirlo en firmware de dispositivos con RK3588S.
- Evaluación de la cadena RCDL: caso de prueba reproducible del pipeline cero-copia NPU/RGA/VPU en tareas de audio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| 3 s de mel a forma de onda (RK3588S) | 53 ms totales, 26 ms en NPU |
| Distancia espectral al modelo float (celdas audibles) | 0,17–0,32 dB |
| Entorno de medida | librknnrt 2.3.2, driver NPU 0.9.8, vía `VocosVocoder` de RCDL |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- NPU Rockchip RK3588 o RK3588S obligatoria para el grafo compilado; el resto del pipeline (trigonometría e ISTFT) se ejecuta en CPU.
- VRAM: no aplica; el modelo consume memoria del sistema compartida con la NPU. El fichero pesa 26,6 MB, por lo que la huella es mínima.
- No cabe ni está pensado para GPU de consumo (RTX 4090, A100, H100); no se distribuyen pesos en safetensors ni GGUF para esas plataformas.
- Entorno de ejecución: Linux aarch64, entorno conda con el canal `https://mirrors.ruis.ai/conda` y el paquete `rcdl`.
- Versiones de runtime medidas: librknnrt 2.3.2 y driver NPU 0.9.8.
- Opciones de despliegue: API Python de RCDL (`rcdl.VocosVocoder`, `rcdl.TextToSpeech`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: aproximadamente 56 veces tiempo real para la etapa de vocoder en RK3588S según la latencia medida (3 s de audio en 53 ms).

## Comparativa con modelos similares

| Modelo | Tipo | Contexto o ventana | Licencia | Plataforma |
|---|---|---|---|---|
| ruisv/rcdl-vocos | Vocoder Vocos 16 kHz compilado RKNN | Ventana de 256 frames, campo receptivo 27 | Apache-2.0 (código MIT) | NPU RK3588/RK3588S |
| Vocos original (`gemelo-ai/vocos`) | Vocoder Vocos en PyTorch | Configurable por variante | MIT | CPU/GPU |
| `vocos-16khz-univ` (upstream) | Vocoder Vocos 16 kHz universal | no disponible | no disponible | CPU/GPU |
| HiFi-GAN | Vocoder GAN | no disponible | MIT (implementación de referencia) | CPU/GPU |

La comparación directa de rendimiento con alternativas no está disponible en la información proporcionada; el dato diferencial de esta ficha es la compilación fp16 para NPU y la latencia medida en placa, no una comparación de calidad objetiva frente a otros vocoders.

## Limitaciones y advertencias

- Modelo específico de una única plataforma: el `.rknn` solo se ejecuta en NPU Rockchip RK3588/RK3588S; no es portable a GPU ni a otras NPU sin recompilación.
- Los datos de entrenamiento no se revelan, lo que impide auditar sesgos, cobertura lingüística o procedencia del audio; es una laguna de información, no una restricción conocida.
- Riesgo de artefactos acústicos en la síntesis: la distancia espectral al modelo float es de 0,17–0,32 dB en celdas audibles, por lo que la salida no es idéntica a la del modelo de referencia.
- La fase cruda se procesa fuera del grafo en CPU; cualquier reimplementación que intente meter cos/sin en el grafo fp16 degradará la calidad.
- El vocoder no genera texto ni comprende la entrada: la calidad final depende del modelo acústico que produzca el mel (Matcha-TTS zh-en en el pipeline documentado).
- No se documentan idiomas soportados ni evaluación multilingüe; el pipeline asociado está orientado a chino e inglés.
- Dependencia de un runtime propietario del ecosistema (librknnrt y driver NPU con versiones concretas); cambios de versión pueden alterar el comportamiento.
- Aunque la licencia Apache-2.0 permite uso comercial y redistribución, conviene verificar por separado las condiciones de los datos de entrenamiento no divulgados antes de un despliegue comercial a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/rcdl-vocos
- Modelo TTS asociado: https://huggingface.co/ruisv/rcdl-matcha-tts
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Recetas de compilación en RCDL: https://github.com/ruisv/rcdl/tree/main/model_zoo/speech
- Vocos (arquitectura original): https://github.com/gemelo-ai/vocos
- Modelo upstream en ModelScope: https://modelscope.cn/models/dengcunqin/matcha_tts_zh_en_20251010
- Descarga directa del fichero: https://huggingface.co/ruisv/rcdl-vocos/resolve/main/vocos_16k_t256_fp16_rk3588.rknn
