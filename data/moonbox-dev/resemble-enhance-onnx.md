# moonbox-dev/resemble-enhance-ONNX

## Resumen

Resemble Enhance ONNX es una conversión a formato ONNX del modelo de mejora de voz Resemble Enhance, desarrollado originalmente por Resemble AI y empaquetado por moonbox-dev para su uso en dispositivos con ONNX Runtime (CPU, CUDA y DirectML). El modelo resuelve dos tareas complementarias sobre audio de voz: eliminación de ruido (denoising) y restauración de calidad con salida a 44,1 kHz, lo que lo hace útil tanto para limpiar grabaciones ruidosas como para reconstruir detalle espectral perdido en audio comprimido o de baja calidad.

La conversión descompone el pipeline original en cuatro grafos ONNX independientes (denoiser, encoder, cfm y decoder) más un script Python que orquesta el procesamiento de señal fuera de los grafos (STFT, mel, remuestreo y solver ODE). El repositorio pesa 0,7 GB e incluye únicamente la precisión fp16, que conserva exactamente los pesos del checkpoint original (almacenamiento fp16, aritmética fp32). No se publica versión int8 porque degrada la calidad en modo enhance en 13 de los 824 archivos de test, con una caída máxima de 1,14 PESQ.

Es relevante ahora porque permite ejecutar un modelo de mejora de voz de calidad de producción en hardware de consumo mediante ONNX Runtime, sin depender de PyTorch para la inferencia y con resultados reproducibles gracias a la semilla explícita para el ruido del flow matching y del vocoder. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de mejora de voz: UNet denoiser sobre STFT + encoder IRMAE + red de velocidad flow-matching (CFM) + decoder IRMAE + vocoder UnivNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); procesa clips en ventanas de 30 s con 1 s de solape |
| Tipos de cuantizacion | fp16 (almacenamiento fp16, aritmetica fp32); int8 no publicado por perdida de calidad; int4 no disponible |
| Idiomas soportados | no disponible (modelo agnostico al idioma, opera sobre señal de voz) |
| Licencia | MIT |
| Formato de pesos | ONNX (cuatro grafos: `denoiser.onnx`, `encoder.onnx`, `cfm.onnx`, `decoder.onnx`) + `config.json` + `pipeline.py` |
| Frecuencia de salida | 44,1 kHz |
| Tamano del repositorio | 0,7 GB |
| Runtime | ONNX Runtime (CPU, CUDA, DirectML) |
| Dependencias del pipeline | numpy, scipy, soundfile, torch, torchaudio (solo para STFT/mel/remuestreo) |

## Arquitectura y entrenamiento

El modelo original de Resemble AI combina varias etapas. Un denoiser UNet opera sobre una STFT de 1680 puntos y recibe magnitud y fase (`mag`, `cos`, `sin` con forma `[1, 841, T]`) para producir el espectro limpio. A continuación, un encoder IRMAE transforma el mel normalizado de 128 bandas (`[1, 128, T]`) en un latente de 64 canales (`[1, 64, T]`). Sobre ese latente actúa una red de flow matching (`cfm.onnx`) que recibe el estado `psi`, la condición `cond` y el tiempo `t`, y devuelve la velocidad; se invoca 32 veces por clip (nfe=32, solver midpoint, lambd=0.5, tau=0.5). Finalmente, el decoder IRMAE junto con el vocoder UnivNet genera la forma de onda a 44,1 kHz (`[1, 420 T]`).

La conversión a ONNX mantiene los pesos del checkpoint original en fp16 pero ejecuta la aritmética en fp32. La innovación principal respecto al original es la reproducibilidad: el ruido del punto de partida del flow y el ruido del vocoder pasan a ser entradas de los grafos, muestreadas a partir de una semilla (`seed`), en lugar de tomarse del generador global de torch. Además, los archivos de más de 30 s se cortan en fragmentos de 30 s con 1 s de solape, unidos mediante cross-fades simples en lugar del merge original, lo que puede introducir diferencias menores en las juntas. En CUDA, el pipeline permite que ONNX Runtime reduzca su arena de memoria tras cada llamada. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni proceso de RLHF/DPO.

## Capacidades

- Eliminación de ruido de fondo en grabaciones de voz (modo `denoise`), con salida de espectro limpio.
- Restauración y mejora de calidad de voz (modo `enhance`), incluyendo superresolución de audio hasta 44,1 kHz.
- Procesamiento de audio de cualquier duración mediante chunking automático en ventanas de 30 s con solape de 1 s.
- Inferencia reproducible mediante semilla explícita para el ruido estocástico del flow matching y del vocoder.
- Ejecución en CPU, CUDA y DirectML a través de ONNX Runtime.
- Interfaz de línea de comandos (`pipeline.py`) y API Python (`OrtParts`, `run`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto; es exclusivamente un modelo de audio-a-audio.

## Casos de uso

- Limpieza de grabaciones de podcast y entrevistas: el modo `denoise` elimina ruido de fondo y el modo `enhance` restaura detalle espectral, con salida a 44,1 kHz adecuada para publicación directa.
- Restauración de archivos de audio históricos o comprimidos: la etapa de superresolución reconstruye bandas de frecuencia perdidas en grabaciones de baja calidad o codecs agresivos.
- Preprocesado para pipelines de ASR: aplicar `denoise` antes de un sistema de reconocimiento de voz reduce el ruido y puede mejorar la precisión en entornos adversos, con la ventaja de ejecutarse en ONNX Runtime en el mismo dispositivo.
- Transcripción de reuniones y llamadas: limpieza de audio de micrófonos de portátil o auriculares antes de la transcripción o el archivado, ejecutable en CPU sin GPU dedicada.
- Producción de contenido y doblaje: mejora de locuciones grabadas en condiciones no ideales para su uso en vídeo, con salida a 44,1 kHz compatible con estándares de vídeo.
- Despliegue en dispositivos sin PyTorch: integración en aplicaciones de escritorio o edge mediante ONNX Runtime con DirectML o CPU, aprovechando que solo se necesita torch/torchaudio para el preprocesado de señal.
- Procesamiento por lotes de archivos largos: el chunking automático de 30 s con solape permite procesar horas de audio sin gestión manual de memoria.

## Benchmarks y rendimiento

Resultados sobre el test set VoiceBank-DEMAND (824 utterances ruidosas), precisión fp16 con aritmética fp32, comparados con el modelo PyTorch original:

| Metrica | Modo | Resultado ONNX | Original PyTorch | Diferencia |
|---|---|---|---|---|
| PESQ | denoise | 2,823 | 2,823 (referencia) | 87,1 dB de similitud, peor archivo -0,01 dB |
| SI-SDR | denoise | 12,42 dB | referencia | 66,0 dB de similitud, peor archivo -0,01 dB |
| PESQ | enhance | 2,333 | referencia | 53,8 dB de similitud, peor archivo -0,095 PESQ |
| STOI | enhance | 0,9128 | referencia | 24,4 dB de similitud |

En modo enhance, la versión int8 (no publicada) coloca 13 de los 824 archivos más de 0,1 PESQ por debajo del original, con un peor caso de -1,14 PESQ, motivo por el que se descartó su publicación. No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con otros modelos de mejora de voz) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo pesa 0,7 GB; los grafos suman aproximadamente 710 MB en fp16 (cfm 138,2 MB, decoder 448,9 MB, denoiser 21,5 MB, encoder 101,8 MB). La inferencia requiere además memoria para activaciones y para el solver ODE de 32 pasos.
- GPU recomendadas: cualquier GPU compatible con CUDA o DirectML; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (inferior a 1 GB), aunque no se detallan cifras de VRAM pico ni modelos concretos como RTX 4090.
- Opciones de despliegue: ONNX Runtime con ejecución en CPU, CUDA o DirectML; el pipeline Python requiere numpy, scipy, soundfile, torch y torchaudio (builds de CPU suficientes para STFT, mel y remuestreo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Resemble Enhance ONNX (este) | no disponible | clips de 30 s con solape de 1 s | 44,1 kHz | MIT | ONNX | Conversion ONNX con inferencia reproducible por semilla |
| Resemble Enhance (original, ResembleAI) | no disponible | clips de 30 s con solape de 1 s | 44,1 kHz | MIT | PyTorch | Modelo base; salida no determinista por uso del generador global de torch |
| Alternativas de mejora de voz (p. ej. DeepFilterNet, Demucs) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de mejora de voz.

## Limitaciones y advertencias

- Solo se publica fp16; no hay versión int8 ni int4, lo que limita el despliegue en hardware con restricciones severas de memoria o cómputo.
- En modo enhance, la variante int8 no publicada degrada la calidad en 13 de los 824 archivos de test (peor caso -1,14 PESQ); no debe asumirse que una cuantización adicional mantendrá la fidelidad.
- Los archivos de más de 30 s se unen con cross-fades simples en lugar del merge original, por lo que pueden aparecer diferencias menores en las juntas respecto al modelo PyTorch.
- El pipeline depende de torch y torchaudio para STFT, mel y remuestreo, aunque solo se usen builds de CPU; no es una dependencia puramente ONNX.
- No se dispone de información sobre sesgos, comportamiento multilingüe ni robustez frente a tipos concretos de ruido más allá del test VoiceBank-DEMAND.
- Riesgo de artefactos o alucinación espectral en grabaciones extremadamente degradadas; no se documentan límites en la model card.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia del modelo base ResembleAI/resemble-enhance y de los pesos originales.
- No se especifican requisitos de memoria pico ni latencia, lo que dificulta planificar despliegues con SLA estrictos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/resemble-enhance-ONNX
- Modelo base: https://huggingface.co/ResembleAI/resemble-enhance
- Grafo denoiser: https://huggingface.co/moonbox-dev/resemble-enhance-ONNX/blob/main/fp16/denoiser.onnx
- Grafo encoder: https://huggingface.co/moonbox-dev/resemble-enhance-ONNX/blob/main/fp16/encoder.onnx
- Grafo cfm: https://huggingface.co/moonbox-dev/resemble-enhance-ONNX/blob/main/fp16/cfm.onnx
- Grafo decoder: https://huggingface.co/moonbox-dev/resemble-enhance-ONNX/blob/main/fp16/decoder.onnx
- Script de pipeline: https://huggingface.co/moonbox-dev/resemble-enhance-ONNX/blob/main/fp16/pipeline.py
- Configuracion: https://huggingface.co/moonbox-dev/resemble-enhance-ONNX/blob/main/fp16/config.json
