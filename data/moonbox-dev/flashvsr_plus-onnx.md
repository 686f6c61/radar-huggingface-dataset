# moonbox-dev/FlashVSR_Plus-ONNX

## Resumen

FlashVSR+ ONNX es la conversión a formato ONNX de FlashVSR+, un modelo de superresolución de vídeo en streaming desarrollado por OpenImagingLab y empaquetado por Moonbox para su uso en dispositivo con ONNX Runtime (CPU, CUDA y DirectML). El modelo resuelve el problema de aumentar la resolución de vídeo en tiempo real manteniendo coherencia temporal entre fotogramas, mediante un esquema de atención híbrida que combina atención dispersa por bloques con capas deslizantes. Está construido sobre Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo, adaptado aquí a una tarea de vídeo-a-vídeo en un solo paso.

La relevancia de esta ficha radica en que no se distribuye como un checkpoint tradicional de PyTorch, sino como tres grafos ONNX (condicionamiento, DiT y decodificador) acompañados de un `pipeline.py` en numpy que reproduce la inferencia en streaming del repositorio original con el preset Turbo. El repositorio ocupa 5,3 GB e incluye dos precisiones: fp16 e int8 (con las MatMul del DiT cuantizadas a 8 bits). La licencia es Apache-2.0, lo que facilita su integración en productos comerciales.

No se dispone de información sobre el número de parámetros totales, la longitud de contexto (en el sentido de ventana temporal) ni los idiomas soportados, ya que se trata de un modelo de vídeo y no de texto. Los datos disponibles se limitan a la model card y a los artefactos publicados en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con atención híbrida, construido sobre Wan2.1-T2V-1.3B; tres grafos ONNX (condicionamiento, DiT, decodificador) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal: 4 fotogramas latentes por chunk; atención sobre 11x11 bloques con caché de 3 ventanas temporales en 5 de 30 capas) |
| Tipos de cuantización | fp16 e int8 (MatMul del DiT a 8 bits) |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos `.onnx` + `.onnx.data` + `layers.json` + `pipeline.py`) |

## Arquitectura y entrenamiento

FlashVSR+ es un modelo de superresolución de vídeo en streaming de un solo paso con atención híbrida, construido sobre Wan2.1-T2V-1.3B. La arquitectura se despliega en tres grafos ONNX: un proyector causal de condicionamiento (`lq_proj`) que procesa los fotogramas de entrada en grupos de 4, un DiT (`dit`) que transforma ruido en latentes en un paso por chunk de 4 fotogramas latentes, y un decodificador condicional pequeño (`decoder`) que convierte los latentes en fotogramas de salida. De las 30 capas del DiT, 5 usan atención dispersa sobre una ventana de bloques de 11x11 con caché de claves y valores para las últimas 3 ventanas temporales; las otras 25 son capas deslizantes del preset Turbo con ventana de 3x3 y 1 ventana cacheada.

El pipeline reproduce la inferencia en streaming del repositorio original (`python -m inference.run_stream --mode turbo` con sus valores por defecto). Cada fotograma se recorta al centro al aspecto de salida y se redimensiona con interpolación bicúbica al tamaño de salida, igual que hace la CLI. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no los detalla. La innovación técnica destacable es el esquema de atención híbrida con caché temporal, que permite procesar vídeo en streaming sin recalcular toda la secuencia.

## Capacidades

- Superresolución de vídeo en streaming: aumenta la resolución de vídeo fotograma a fotograma manteniendo coherencia temporal gracias a la caché de ventanas temporales.
- Procesamiento por chunks: el condicionamiento opera en grupos de 4 fotogramas y el DiT genera latentes en un paso por chunk de 4 fotogramas latentes.
- Atención híbrida: 5 capas con atención dispersa 11x11 y 25 capas deslizantes 3x3 (preset Turbo).
- Gestión de máscaras: el `pipeline.py` incluye manejo de máscaras para la inferencia.
- Corrección de color: el pipeline aplica corrección de color tras la decodificación (según la model card).
- Ejecución multiplataforma vía ONNX Runtime: CPU, CUDA y DirectML.
- Dos precisiones disponibles: fp16 e int8, con calidad casi idéntica (PSNR medio 43,0/39,8 dB en fp16 frente a 42,9/39,6 dB en int8).
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Restauración y mejora de vídeo archivístico: el modelo puede procesar secuencias de baja resolución fotograma a fotograma con coherencia temporal, adecuado para digitalizar material antiguo o de baja calidad sin parpadeos entre fotogramas.
- Upstreaming en pipelines de producción de vídeo: al ejecutarse sobre ONNX Runtime con CUDA o DirectML, puede integrarse en cadenas de postproducción para aumentar la resolución de material rodado a menor resolución antes del montaje final.
- Superresolución en tiempo real en dispositivos: la variante int8 (1,43 GB para el DiT) y el soporte de DirectML permiten desplegar el modelo en equipos con GPU consumer o incluso en entornos Windows sin CUDA, útil para aplicaciones de escritorio de mejora de vídeo.
- Mejora de vídeo para plataformas de streaming: el procesamiento por chunks de 4 fotogramas y la caché temporal facilitan el tratamiento de vídeo en directo o cuasi-directo con latencia acotada.
- Preprocesado para modelos de visión: aumentar la resolución de vídeo de entrada antes de pasarlo a detectores, segmentadores o modelos de captioning que se benefician de mayor detalle espacial.
- Investigación en superresolución de vídeo: la disponibilidad de grafos ONNX con PSNR medido frente al original (43,0/39,8 dB de media en fp16) permite reproducir y comparar resultados sin depender de PyTorch.
- Despliegue en entornos sin PyTorch: al distribuirse como ONNX con un runtime en numpy, puede ejecutarse en infraestructura donde instalar PyTorch no es viable (contenedores ligeros, entornos embebidos con ONNX Runtime).

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas de fidelidad frente al modelo original en PyTorch, medidas sobre dos clips con sus máscaras:

| Precisión | PSNR medio (dB) | Peor fotograma (dB) | Tiempo por clip (CUDA) | Original PyTorch (tiempo) |
|---|---|---|---|---|
| fp16 | 43,0 / 39,8 | 41,3 / 37,9 | 69 / 59 s (incl. cargas de sesión) | 49 / 32 s |
| int8 (DiT MatMul 8 bits) | 42,9 / 39,6 | 41,1 / 37,7 | 70 / 59 s | 49 / 32 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el DiT en fp16 pesa 2,60 GB y en int8 1,43 GB, a lo que se suman 575,7 MB (fp16) o 571,3 MB (int8) del proyector de condicionamiento y 90,7 MB del decodificador. El repositorio completo ocupa 5,3 GB.
- GPU recomendadas: no se especifican modelos concretos; la model card cita ejecución en CUDA (GPU NVIDIA) y DirectML (GPU Windows). Por el tamaño de los pesos (en torno a 3,3 GB en fp16 y 2,1 GB en int8), cabe en GPUs consumer con 8 GB o más de VRAM.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más (RTX 3060/4060 y superiores), aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime en CPU, CUDA y DirectML; el `pipeline.py` incluido actúa como runtime en numpy.
- Latencia y throughput: en CUDA, 69 s (fp16) y 70 s (int8) por clip incluyendo cargas de sesión, frente a 49 s del original en PyTorch para el primer clip; 59 s en ambos casos para el segundo clip. No se especifica la duración ni la resolución de los clips.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Licencia | Formato |
|---|---|---|---|---|---|
| FlashVSR+ ONNX (este) | Superresolución de vídeo en streaming | no disponible | 4 fotogramas latentes por chunk; caché de 3 ventanas | Apache-2.0 | ONNX |
| FlashVSR+ (original, PyTorch) | Superresolución de vídeo en streaming | no disponible | Igual que la versión ONNX | Apache-2.0 | PyTorch |
| Wan2.1-T2V-1.3B | Generación de vídeo texto-a-vídeo | 1,3 B | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de superresolución de vídeo en la documentación proporcionada. La comparativa se limita al modelo original en PyTorch (referencia de calidad y velocidad) y a Wan2.1-T2V-1.3B como base arquitectónica.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo; al ser un modelo de vídeo, los sesgos potenciales estarían en los datos de entrenamiento visuales, no documentados.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede introducir detalles inexistentes en los fotogramas de salida, especialmente en zonas de baja resolución o con texturas complejas.
- Limitaciones de contexto temporal: la caché de ventanas temporales es finita (3 ventanas en las capas dispersas, 1 en las deslizantes), lo que puede afectar a la coherencia en secuencias con cambios bruscos de escena.
- Sin soporte lingüístico: no procesa texto ni idiomas; cualquier caso de uso multilingüe queda fuera de su alcance.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los componentes base (Wan2.1-T2V-1.3B) y de los clips de benchmark.
- Rendimiento: la versión ONNX es más lenta que el original en PyTorch en el primer clip (69 s frente a 49 s en fp16), lo que puede ser relevante en producción con requisitos de latencia estrictos.
- Precisión int8: la cuantización de las MatMul del DiT a 8 bits reduce el PSNR medio en 0,1-0,2 dB, una pérdida pequeña pero medible.
- Documentación incompleta: no se detallan parámetros totales, datos de entrenamiento, resoluciones de entrada/salida soportadas ni requisitos mínimos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/FlashVSR_Plus-ONNX
- Repositorio original FlashVSR+: https://github.com/OpenImagingLab/FlashVSR_Plus
- Paper arXiv 2610.17552: https://arxiv.org/abs/2610.17552
- Paper arXiv 2510.12747: https://arxiv.org/abs/2510.12747
