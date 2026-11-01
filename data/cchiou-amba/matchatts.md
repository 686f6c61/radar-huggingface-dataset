# cchiou-amba/MatchaTTS

## Resumen

Matcha-TTS es una arquitectura de síntesis de voz (text-to-speech) basada en flow matching condicional, presentada originalmente en el artículo arXiv 2309.03199 y con implementación de referencia en el repositorio `shivammehta25/Matcha-TTS`. Este repositorio concreto, publicado por `cchiou-amba`, no contiene los pesos originales en formato PyTorch, sino una partición optimizada de los mismos para su despliegue en el acelerador neuronal CVflow v3 del SoC Ambarella N1-655. El modelo se ha dividido en dos etapas estáticas: `matcha_enc.bin` (codificador de fonemas y regulador de longitud) y `matcha_dec.bin` (decodificador ODE de flow matching), que produce espectrogramas log-Mel de 80 bins con forma `[1, 80, 500]`.

El modelo está entrenado sobre LJSpeech-1.1 (dominio público), un corpus de audio en inglés de una única hablante femenina, y por tanto su cobertura lingüística se limita al inglés estadounidense. La salida Mel se encadena con un vocoder HiFi-GAN externo para obtener la forma de onda final. La licencia del repositorio es Apache-2.0, con atribución a los trabajos upstream (MIT de Matcha-TTS y Apache-2.0 de la receta `icefall`/`sherpa-onnx`).

La relevancia de esta ficha es doble: por un lado documenta el modelo Matcha-TTS como arquitectura TTS rápida y ligera; por otro, ilustra un caso de port a hardware embebido con compilación vía Ambarella Cooper SDK CNNGen 3.9.0 (`cavalry_gen 3.0.4`), lo que lo hace útil para integración en dispositivos de borde con NPU dedicada. El repositorio tiene 0,1 GB y 34 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS: codificador de fonemas + regulador de longitud + decodificador ODE de flow matching condicional (transformer ligero) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 128 fonemas en `matcha_enc.bin`; salida fija de 500 frames Mel) |
| Tipos de cuantizacion | Pesos compilados para CVflow v3; activaciones en FP16 (IEEE) y entrada `x` en int16 |
| Idiomas soportados | Inglés (LJSpeech-1.1, hablante única) |
| Licencia | Apache-2.0 (con componentes upstream MIT y Apache-2.0) |
| Formato de pesos | `.bin` propietario Ambarella (miembros `matcha_enc.bin`, `matcha_dec.bin`, `tokens.txt`); no safetensors ni GGUF |
| Tamano del repositorio | 0,1 GB |
| SoC objetivo | Ambarella N1-655 (`vdg_arch = 0xB`, CVflow v3) |
| SDK de compilacion | Ambarella Cooper SDK CNNGen 3.9.0 / `cavalry_gen` 3.0.4 |
| Entrada Stage 0 | `x` `[1, 128]` int16, `x_mask` `[1, 1, 128]` FP16 |
| Salida Stage 0 | `mu_x` `[1, 80, 128]`, `logw` `[1, 1, 128]` FP16 |
| Entrada Stage 1 | `mu_y` `[1, 80, 500]`, `y_mask` `[1, 1, 500]`, `z` `[1, 80, 500]` FP16 |
| Salida Stage 1 | `mel` `[1, 80, 500]` FP16 |
| Vocoder | HiFi-GAN (externo, no incluido en el archivo) |

## Arquitectura y entrenamiento

Matcha-TTS es un modelo TTS no autorregresivo que sustituye la difusión por flow matching condicional para generar espectrogramas Mel. La arquitectura consta de un codificador de fonemas (con embeddings y bloques transformer), un predictor de duración que produce `logw` por fonema y un decodificador ODE que integra un campo de velocidad condicionado por el texto para transformar ruido `z` en Mel. En esta partición, el corte se realiza en el regulador de longitud: la etapa 0 emite `mu_x` (features por fonema) y `logw` (duraciones logarítmicas); un puente en CPU calcula `d_i = ceil(exp(logw_i) * x_mask_i * length_scale)`, expande `mu_x` a `mu_y` `[1, 80, 500]` y construye `y_mask`; la etapa 1 ejecuta el decodificador ODE sobre `mu_y`, `y_mask` y `z` para producir el Mel final.

El entrenamiento original se realizó sobre LJSpeech-1.1 (dominio público), un corpus de aproximadamente 24 horas de audio en inglés de una única hablante. No se dispone en la información proporcionada de detalles sobre número de tokens, composición exacta del dataset, ni sobre si se aplicó RLHF o DPO (no aplica habitualmente en TTS acústico, pero no se confirma). La innovación técnica destacable es la compilación estática de formas fijas (`[1, 128]` de entrada y `[1, 80, 500]` de salida) para el NVP CVflow v3, lo que elimina la flexibilidad dinámica del modelo original a cambio de un grafo determinista apto para NPU embebida. El modelo original de Matcha-TTS se caracteriza por una inferencia más rápida que los modelos de difusión equivalentes gracias al flow matching, pero en esta partición el rendimiento depende del hardware N1-655 y no se han publicado cifras de latencia.

## Capacidades

- Síntesis de voz (TTS) a partir de fonemas en inglés, con salida de espectrograma log-Mel de 80 bins y 500 frames.
- Control de velocidad de habla mediante `length_scale` en el puente CPU (permite acelerar o ralentizar la locución).
- Generación determinista con formas estáticas, adecuada para pipelines embebidos en tiempo real.
- Integración con vocoder HiFi-GAN para obtener la forma de onda final (el vocoder no está incluido en el archivo).
- Soporte de una única voz (hablante femenina de LJSpeech); no dispone de multi-hablante ni de clonación de voz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico.
- Capacidades multilingües: no disponibles; solo inglés.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en dispositivos de borde: el modelo compilado para N1-655 permite generar voz en cámaras IP, wearables o electrodomésticos con NPU CVflow, sin depender de la nube, gracias a las formas estáticas y la cuantización FP16.
- Asistentes de voz embebidos: integración en sistemas de atención por voz de bajo consumo donde se requiere una latencia predecible y un grafo determinista, con control de velocidad mediante `length_scale`.
- Lectura de notificaciones y alertas: generación de avisos hablados en inglés en paneles de control o dispositivos IoT, usando el pipeline Stage 0 + puente CPU + Stage 1 + HiFi-GAN.
- Accesibilidad: conversión de texto a voz para interfaces de usuario en inglés en hardware con recursos limitados, aprovechando el tamaño reducido del repositorio (0,1 GB) y la licencia Apache-2.0 para uso comercial.
- Pruebas de concepto de TTS en NPU: referencia para evaluar el port de arquitecturas flow-matching a CVflow v3 y comparar latencia frente a implementaciones en CPU/GPU.
- Generación de audio para prototipos de investigación: al estar entrenado sobre LJSpeech, es útil para experimentos de síntesis con una voz conocida y reproducible, siempre que se respete la atribución upstream.
- Integración en pipelines de CI/CD de firmware: los binarios pueden empaquetarse junto con `tokens.txt` y validarse en el SDK Cooper, facilitando pruebas de regresión de audio en builds de firmware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU CVflow v3 del SoC Ambarella N1-655, no en GPU.
- GPU recomendadas: no disponibles para esta partición; los pesos `.bin` no son ejecutables en CUDA sin recompilación desde el modelo original.
- ¿Cabe en GPU de consumo? No en este formato; para ejecución en RTX 4090 o similar habría que usar el modelo original de Matcha-TTS en PyTorch/ONNX, no estos binarios.
- Opciones de despliegue: Ambarella Cooper SDK CNNGen 3.9.0 (`cavalry_gen` 3.0.4) sobre N1-655; el modelo original puede desplegarse con PyTorch, ONNX Runtime o sherpa-onnx.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Almacenamiento: repositorio de 0,1 GB; los binarios individuales no se detallan en tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatchaTTS (esta ficha, N1-655) | no disponible | 128 fonemas fijos | Inglés | Apache-2.0 | Binarios Ambarella |
| Matcha-TTS original (`shivammehta25/Matcha-TTS`) | no disponible | dinámico | Inglés (LJSpeech) | MIT | PyTorch, GitHub |
| `csukuangfj/matcha-icefall-en_US-ljspeech` | no disponible | dinámico | Inglés | Apache-2.0 | ONNX, HuggingFace |
| VITS / Piper (referencia TTS ligera) | no disponible | dinámico | Multi-idioma | MIT / varias | ONNX, múltiples runtimes |

La comparación se limita a la familia Matcha-TTS y a alternativas ligeras de TTS; no se dispone de cifras de benchmarks para comparar rendimiento objetivamente.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre LJSpeech-1.1: una única hablante femenina en inglés; no generaliza a otras voces, acentos ni idiomas.
- Formas estáticas fijas: entrada de 128 fonemas y salida de 500 frames Mel; textos más largos deben trocearse y textos más cortos requieren relleno, lo que puede afectar a la prosodia.
- No incluye el vocoder HiFi-GAN en el archivo; es necesario obtenerlo por separado para generar audio.
- Los binarios son específicos para Ambarella N1-655 con CVflow v3 y `cavalry_gen` 3.0.4; no son portables a otras NPU ni a GPU sin recompilación.
- Riesgo de alucinación acústica: como todo TTS, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del vocabulario de entrenamiento.
- Sesgos: al derivar de una única hablante, hereda sus características de voz y posibles sesgos de pronunciación del corpus.
- Licencia Apache-2.0 permite uso comercial, pero exige mantener la atribución upstream (MIT de Shivam Mehta, Apache-2.0 de `k2-fsa/icefall` y `sherpa-onnx`) y la notificación de modificación de la sección 4(b).
- No se han publicado métricas de calidad (MOS, WER, latencia) en la información disponible; para producción conviene evaluar el pipeline completo con el vocoder y el hardware objetivo.
- El repositorio tiene muy pocas descargas (34) y ningún "like"; no hay evidencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/cchiou-amba/MatchaTTS
- Paper Matcha-TTS: https://arxiv.org/abs/2309.03199
- Implementación de referencia: https://github.com/shivammehta25/Matcha-TTS
- Pesos originales (icefall/sherpa-onnx): https://huggingface.co/csukuangfj/matcha-icefall-en_US-ljspeech
- Descarga del modelo compilado: https://huggingface.co/cchiou-amba/MatchaTTS/blob/main/n1-655_matcha_ljspeech_amba_optimized.tar.gz
