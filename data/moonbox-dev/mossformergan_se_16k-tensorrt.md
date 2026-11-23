# moonbox-dev/MossFormerGAN_SE_16K-TensorRT

## Resumen

MossFormerGAN_SE_16K-TensorRT es una compilación optimizada del modelo de mejora de voz MossFormerGAN_SE_16K, desarrollado originalmente por Alibaba (alibabasglab) y empaquetado como motores TensorRT por moonbox-dev. El modelo resuelve el problema de la supresión de ruido y la mejora de la calidad de voz en señales de audio a 16 kHz, una tarea fundamental en pipelines de reconocimiento automático del habla, videoconferencia y procesamiento de audio en producción. Esta versión concreta no contiene pesos en formato convencional, sino motores TensorRT precompilados que aceleran la inferencia del generador del modelo.

La relevancia de este repositorio radica en su enfoque de despliegue: ofrece motores compatibles a nivel de hardware (Ampere y posteriores, incluyendo RTX 30, 40 y 50) y a nivel de versión de TensorRT (10.x desde 10.13), eliminando la necesidad de recompilar para cada GPU. El paquete incluye un runner mínimo basado en numpy y Polygraphy que no requiere PyTorch, lo que reduce considerablemente las dependencias en entornos de producción.

El modelo base es un generador MossFormer entrenado con un discriminador métrico, una arquitectura orientada a la mejora de voz que opera sobre representaciones espectrales. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer (generador) con discriminador metrico; empaquetado como motor TensorRT del generador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | T de 10 a 2000 frames STFT (hasta 12,5 s por inferencia; perfil ajustado a 500 frames) |
| Tipos de cuantizacion | fp16 (weakly typed); no se incluye int8 |
| Idiomas soportados | no disponible (procesamiento de voz independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorRT engine (`.engine`); entrada/salida via runner numpy + Polygraphy |
| Frecuencia de muestreo | 16 kHz |
| STFT | 400 puntos, hop 100, ventana Hamming, compresion power-law 0.3 |
| Entrada del motor | `spec` [1, 2, T, 201] (partes real e imaginaria) |
| Salidas del motor | `real` e `imag` [1, 1, T, 201] |
| Tamano del repositorio | 0,3 GB |
| Compatibilidad hardware | Ampere y posteriores (RTX 30, 40, 50) |
| Compatibilidad software | TensorRT 10.x desde 10.13 (runtime lean) |

## Arquitectura y entrenamiento

El modelo base MossFormerGAN_SE_16K emplea un generador MossFormer entrenado con un discriminador métrico para la mejora de voz a 16 kHz. La arquitectura opera en el dominio espectral: el motor TensorRT recibe la representación STFT comprimida (partes real e imaginaria de una STFT de 400 puntos con hop 100 y ventana Hamming, comprimida con power-law 0.3) y devuelve las componentes real e imaginaria de la señal mejorada. Todo el procesamiento fuera del motor (normalización, STFT, compresión y STFT inversa) sigue la implementación original de ClearerVoice.

Los motores se construyeron a partir del grafo ONNX publicado por Moonbox para la misma revisión del modelo (`dcb1b20e1e`). La compilación fp16 es *weakly typed*: TensorRT elige la precisión de cada capa, usando fp16 donde puede. Se documenta que una compilación *strongly typed* falla porque no existe kernel de TensorRT 10.13 para las convoluciones 1x2 de 64 grupos en fp16, y forzarlas a fp32 provoca un fallo del compilador Myelin. Se aplicaron dos correcciones de parseo previas: ejes explícitos en `Squeeze` y reescritura del `EyeLike` de la atención como `Range`/`Equal`, ambas exactas en ONNX Runtime. No se incluye int8 porque TensorRT requiere activaciones calibradas. No se dispone de información sobre el número de tokens, la composición del dataset ni las etapas de RLHF/DPO del entrenamiento original en la información proporcionada.

## Capacidades

- Mejora de voz y supresión de ruido en señales mono a 16 kHz.
- Procesamiento de audio en el dominio espectral mediante STFT de 400 puntos con hop 100.
- Inferencia acelerada en GPU mediante motores TensorRT precompilados.
- Ejecución sin PyTorch: el runner usa únicamente numpy, TensorRT y Polygraphy.
- Procesamiento por ventanas: `decode_one_audio` divide archivos de más de 10 s en ventanas de 10 s (unas 1600 frames), dentro del rango del motor.
- Compatibilidad portable: motores hardware-compatible (Ampere y posteriores) y version-compatible (TensorRT 10.13+), sin recompilación por GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo estrictamente de audio a audio.

## Casos de uso

- **Preprocesado en pipelines de ASR**: el modelo limpia la señal de entrada antes de pasarla a un sistema de reconocimiento del habla, reduciendo la tasa de error en entornos ruidosos. Su RTF de 0,085 permite procesar audio en tiempo casi real en una RTX 3080 Laptop.
- **Videoconferencia y llamadas VoIP**: supresión de ruido en tiempo real sobre flujos de 16 kHz, con ventanas de 10 s que encajan con la lógica de búfer de las aplicaciones de conferencia.
- **Limpieza de grabaciones de campo**: procesamiento por lotes de entrevistas, podcast o grabaciones ambientales para eliminar ruido de fondo antes de su transcripción o publicación.
- **Producción de contenido de audio**: mejora de locuciones grabadas en condiciones no controladas, usando el motor fp16 para reducir el coste computacional frente a la compilación ONNX (RTF 0,085 frente a 0,202).
- **Sistemas de atención al cliente basados en voz**: preprocesado de audio de entrada en asistentes telefónicos, donde la latencia baja y la ausencia de PyTorch simplifican el despliegue en contenedores.
- **Investigación en mejora de voz**: banco de pruebas para comparar implementaciones TensorRT frente a ONNX o PyTorch, con métricas reproducibles (PESQ, STOI, SI-SDR) sobre VoiceBank-DEMAND.

## Benchmarks y rendimiento

Los datos proceden del conjunto de test VoiceBank-DEMAND (824 enunciados de dos hablantes no vistos, 16 kHz), evaluados con la función `decode` de ClearerVoice en una RTX 3080 Laptop GPU.

| Implementacion | PESQ | STOI | SI-SDR (dB) | vs ONNX fp16: media / peor archivo (dB) | Cambio SI-SDR peor archivo | RTF |
|---|---|---|---|---|---|---|
| ONNX fp16 (CUDA) | 3,342 | 0,9569 | 19,77 | - | - | 0,202 |
| TensorRT fp16 | 3,342 | 0,9569 | 19,77 | 60,6 / 58,0 | -0,029 | 0,085 |

El build ONNX fp16 se sitúa a menos de 0,05 dB del original en PyTorch (`clearvoice` 0.1.2, fp32) en todos los archivos. El criterio de aceptación exige que ningún archivo presente un SI-SDR más de 0,5 dB por debajo del build ONNX; el peor caso registrado es de -0,029 dB. El RTF corresponde al pipeline completo, con la STFT ejecutándose en CPU. No se han publicado resultados de benchmarks comparativos con otros modelos de mejora de voz en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el motor fp16 ocupa 253,6 MB en disco y el repositorio completo 0,3 GB, por lo que la huella en memoria es reducida y cabe holgadamente en cualquier GPU consumer moderna.
- **GPU recomendadas**: RTX 30, 40 y 50 series (Ampere y posteriores); el benchmark se realizó en una RTX 3080 Laptop GPU.
- **Compatibilidad**: motores hardware-compatible (Ampere+) y version-compatible (TensorRT 10.x desde 10.13), sin recompilación por GPU.
- **Cabe en GPU consumer**: sí, en cualquier GPU Ampere o posterior; el límite es la compatibilidad de arquitectura, no la memoria.
- **Despliegue**: TensorRT con runtime lean (`tensorrt-cu12>=10.13,<11`, `tensorrt-lean-cu12>=10.13,<11`), Polygraphy y numpy. Para el pipeline completo, `clearvoice==0.1.2` únicamente por su helper de decode.
- **Latencia y throughput**: RTF de 0,085 para el pipeline completo en RTX 3080 Laptop (frente a 0,202 del build ONNX), lo que equivale a procesar aproximadamente 11,8 segundos de audio por segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Formato | Licencia | Aceleracion |
|---|---|---|---|---|---|
| MossFormerGAN_SE_16K-TensorRT (este) | Mejora de voz MossFormerGAN | 16 kHz | TensorRT engine | Apache-2.0 | TensorRT fp16, RTF 0,085 |
| MossFormerGAN_SE_16K (original) | Mejora de voz MossFormerGAN | 16 kHz | PyTorch | Apache-2.0 | PyTorch fp32 |
| Build ONNX fp16 del mismo modelo | Mejora de voz MossFormerGAN | 16 kHz | ONNX | Apache-2.0 | ONNX Runtime CUDA, RTF 0,202 |

No se dispone de información sobre otros modelos comparables de mejora de voz (por ejemplo, FRCRN, Demucs o DeepFilterNet) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- **Alcance estricto**: solo procesa audio mono a 16 kHz; no admite otras frecuencias de muestreo sin remuestreo previo.
- **Longitud de ventana**: el motor acepta entre 10 y 2000 frames STFT (hasta 12,5 s); el perfil está ajustado a 500 frames, por lo que el rendimiento puede degradarse fuera de ese rango.
- **Sin int8**: no se incluye cuantización int8 porque TensorRT requiere activaciones calibradas; solo hay fp16.
- **Compilación weakly typed**: la precisión por capa la decide TensorRT, lo que puede introducir diferencias menores frente a una compilación fuertemente tipada.
- **Dependencia de ClearerVoice**: el pipeline completo requiere `clearvoice==0.1.2` para la normalización, STFT y STFT inversa; el motor por sí solo no realiza el preprocesado ni el postprocesado.
- **Compatibilidad limitada**: requiere Ampere o posterior y TensorRT 10.13+; no funciona en GPUs anteriores ni en versiones antiguas de TensorRT.
- **Riesgo de alucinación**: no aplica en el sentido textual, pero la mejora de voz puede introducir artefactos o distorsión en señales extremadamente ruidosas; el peor archivo del benchmark presenta -0,029 dB de SI-SDR frente al build ONNX.
- **Licencia**: Apache-2.0 permite uso comercial, pero los archivos son un derivado del modelo original y heredan su licencia, que gobierna su uso.
- **Sin datos de sesgo**: no se dispone de información sobre sesgos demográficos o lingüísticos del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/MossFormerGAN_SE_16K-TensorRT
- Modelo base: https://huggingface.co/alibabasglab/MossFormerGAN_SE_16K
- Motor fp16: https://huggingface.co/moonbox-dev/MossFormerGAN_SE_16K-TensorRT/blob/main/fp16/model.engine
- Runner TensorRT: https://huggingface.co/moonbox-dev/MossFormerGAN_SE_16K-TensorRT/blob/main/fp16/trt_runner.py
- ClearerVoice-Studio: https://github.com/modelscope/ClearerVoice-Studio
