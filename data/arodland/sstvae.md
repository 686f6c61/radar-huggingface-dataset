# arodland/sstvae

## Resumen

SSTVAE es un autoencoder convolucional diseñado para la transmisión de imágenes por radio HF en un modo SSTV (Slow Scan Television) híbrido digital. En lugar de codificar la imagen en bits discretos, las imágenes se envían como los valores latentes continuos del autoencoder, modulados sobre las amplitudes de portadoras OFDM. El decodificador se entrena con un canal HF simulado en el bucle, de modo que la calidad de la imagen degrada gradualmente con la relación señal-ruido (SNR) en lugar de sufrir un "acantilado digital" típico de los sistemas digitales. El modelo está inspirado en FreeDV RADE y ha sido desarrollado por el autor arodland.

El checkpoint publicado (`v1.pt`) tiene 10,3 millones de parámetros y trabaja con imágenes de 640×480 píxeles. El modelo se distribuye también en formato ONNX con tres precisiones (fp32, fp16 e int8) para facilitar la implementación de receptores sin depender de PyTorch. Se encuentra en fase beta funcional: ha sido decodificado con éxito por radio, pero el formato en el aire no está congelado y ambos extremos deben usar el mismo código y el mismo checkpoint. La relevancia actual radica en ofrecer una alternativa de código abierto para la transmisión de imágenes en HF con degradación suave, un nicho poco explorado dentro de la radioafición digital.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional (encoder y decoder) |
| Parametros totales | 10,3 M (checkpoint v1.pt) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa imágenes de 640×480) |
| Tipos de cuantizacion | fp32, fp16, int8 (artefactos ONNX) |
| Idiomas soportados | No disponible |
| Licencia | Artistic-2.0 |
| Formato de pesos | PyTorch (`v1.pt`) y ONNX (`v1-{encoder,decoder}-{fp32,fp16,int8}.onnx`) |

## Arquitectura y entrenamiento

El modelo es un autoencoder convolucional puro, sin componentes recurrentes ni de atención. El encoder comprime la imagen de entrada en un conjunto de variables latentes continuas de valor real, que son moduladas directamente sobre amplitudes de portadoras OFDM para su transmisión. El decoder reconstruye la imagen a partir de esos latentes. La innovación principal reside en el entrenamiento: el decodificador se entrena con un canal HF simulado en el bucle, lo que permite que el modelo aprenda a producir reconstrucciones robustas frente a ruido, desvanecimientos y otros efectos del canal. Esto explica la degradación gradual de la calidad con la SNR, en lugar de un fallo abrupto.

No se especifican los datos de entrenamiento ni el número de tokens (al ser un modelo de imágenes, el concepto de tokens no aplica directamente). Tampoco se menciona el uso de RLHF o DPO. El entrenamiento se realiza mediante el script `scripts/train.py` incluido en el repositorio. La exportación a ONNX se realiza con `scripts/export_onnx.py`, y cada artefacto ONNX registra el checkpoint de origen y su SHA-256 en los metadatos, garantizando trazabilidad.

## Capacidades

- Compresión y reconstrucción de imágenes de 640×480 píxeles mediante autoencoder convolucional.
- Transmisión de imágenes por radio HF usando modulación OFDM sobre amplitudes de portadora.
- Degradación gradual de la calidad de imagen con la SNR del canal, en lugar de fallo abrupto.
- Tres modos de transmisión (A, B, C) con diferentes tiempos de transmisión y calidad: 32 s, 64 s y 95 s respectivamente.
- Exportación a ONNX en fp32, fp16 e int8, lo que permite ejecutar el codec sin PyTorch (solo onnxruntime, ~27 MB).
- Tolerancia a offset de frecuencia de ±50 Hz y ancho de banda ocupado de ~1200 Hz.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural; es un modelo especializado en imágenes.

## Casos de uso

- Radioafición: envío de imágenes entre estaciones de HF sin necesidad de infraestructura de internet, usando modos SSTV tradicionales pero con mejor comportamiento frente a ruido. El operador ejecuta las herramientas de línea de comandos del repositorio para codificar, transmitir y decodificar.
- Comunicaciones de emergencia: en situaciones donde las redes convencionales fallan, se puede transmitir mapas, fotografías de daños o información visual mediante radio HF. La degradación gradual permite obtener una imagen utilizable incluso con SNR baja.
- Telemetría visual en entornos remotos: estaciones meteorológicas o sensores aislados pueden enviar imágenes de su entorno usando el modo SSTVAE, aprovechando la robustez frente a canales ruidosos.
- Educación en radio digital: el modelo y su código sirven como ejemplo práctico de autoencoders aplicados a comunicaciones, combinando aprendizaje automático con procesamiento de señales.
- Integración con SDR (Software Defined Radio): los artefactos ONNX permiten construir receptores ligeros que decodifican imágenes en tiempo real usando onnxruntime en dispositivos embebidos o portátiles.
- Investigación en compresión de imágenes para canales con ruido: el enfoque de entrenamiento con canal simulado puede adaptarse a otros dominios, como transmisión por satélite o submarina.

## Benchmarks y rendimiento

La model card reporta mediciones de PSNR (en dB) realizadas de extremo a extremo a través del módem real y un canal simulado, sobre imágenes de validación:

| Modo | Tiempo | Canal limpio | SNR 10 dB | SNR 6 dB | SNR 0 dB |
|---|---|---|---|---|---|
| A | 32 s | 24,7 | 24,4 | 24,0 | 22,3 |
| B | 64 s | 25,7 | 25,4 | 25,0 | 23,5 |
| C | 95 s | 26,0 | 25,8 | 25,5 | 24,1 |

Además, se indica un ancho de banda ocupado de ~1200 Hz, una PAPR de ~4,5 dB y una tolerancia a offset de frecuencia superior a ±50 Hz. Por debajo de aproximadamente −2 dB de SNR, el límite es la adquisición de la señal: no se obtiene imagen en lugar de una imagen pobre. No se han publicado comparaciones con otros modelos similares en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es ligero (10,3 M parámetros) y puede ejecutarse en cualquier CPU moderna. Los artefactos ONNX permiten usar onnxruntime, que pesa unos 27 MB frente a los 336 MB de torch.
- GPU: no es necesaria para inferencia; el modelo no está diseñado para explotar GPUs y las convoluciones son pequeñas.
- Dispositivos embebidos: el formato ONNX int8 reduce aún más el tamaño (encoder 6,5 MB, decoder 8,6 MB) y es adecuado para Raspberry Pi u otros SBC. Nota: int8 puede ser más lento que fp32 en x86 por problemas de optimización de kernels, pero suele revertir en ARM.
- Opciones de despliegue: onnxruntime (para ONNX), PyTorch (para `v1.pt`), o las herramientas de línea de comandos del repositorio GitHub que gestionan la descarga automática del checkpoint.
- Latencia: los tiempos de transmisión son de 32 s (modo A), 64 s (modo B) y 95 s (modo C), medidos en el módem real. La decodificación es local y no se especifica su tiempo, pero al ser un autoencoder pequeño, se espera que sea inferior a un segundo en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (autoencoders para SSTV). El proyecto se inspira en FreeDV RADE, pero no se proporcionan datos de rendimiento de ese sistema para una comparación cuantitativa. Los modos SSTV tradicionales (Robot, Martin, etc.) son analógicos y no utilizan autoencoders, por lo que no son directamente comparables. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- El modelo está en fase beta: el formato en el aire no está congelado y puede cambiar sin aviso. Ambos extremos deben usar el mismo código y el mismo checkpoint; no hay protocolo de negociación, por lo que un desajuste produce ruido en lugar de un error explícito.
- La salida es una reconstrucción, no una fotografía exacta. El detalle fino, especialmente texto pequeño, puede aparecer sutilmente incorrecto en lugar de simplemente borroso. No debe usarse en aplicaciones donde la fidelidad sea crítica.
- La licencia Artistic-2.0 permite uso comercial y modificación, pero requiere mantener ciertas condiciones de redistribución. Se recomienda revisar los términos completos.
- No se han publicado datos sobre sesgos o alucinaciones, ya que el modelo no procesa lenguaje. En el dominio de imágenes, la limitación principal es la pérdida de detalle en reconstrucciones.
- El rendimiento depende de la SNR del canal: por debajo de −2 dB, la adquisición falla y no se obtiene imagen alguna.
- Los artefactos ONNX int8 mantienen una convolución en fp32 para preservar calidad, pero una cuantización dinámica genérica del artefacto fp32 costaría 0,19 dB en fotografías y 1,6 dB en imágenes no fotográficas. Se recomienda usar los artefactos publicados en lugar de cuantizar manualmente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/arodland/sstvae)
- [Repositorio GitHub del proyecto](https://github.com/arodland/SSTVAE)
- [FreeDV RADE (inspiración)](https://freedv.org/radio-autoencoder/)
