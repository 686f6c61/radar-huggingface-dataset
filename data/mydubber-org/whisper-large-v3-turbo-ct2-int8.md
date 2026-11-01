# mydubber-org/whisper-large-v3-turbo-ct2-int8

## Resumen

`mydubber-org/whisper-large-v3-turbo-ct2-int8` es una conversión cuantizada del modelo de reconocimiento automático de voz [Whisper large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo) de OpenAI, preparada para ejecutarse con [faster-whisper](https://github.com/SYSTRAN/faster-whisper) sobre CTranslate2. El repositorio ha sido publicado por la organización mydubber-org, que lo utiliza como backend de reconocimiento de voz en su producto myDubber.

La conversión aplica cuantización `int8_float16`: los pesos lineales se cuantizan a int8 (per-row absmax, el método propio de CTranslate2) mientras las activaciones se computan en float16, y las dos convoluciones del encoder se mantienen en float16, replicando exactamente lo que CTranslate2 calcula en cada carga con `compute_type="int8_float16"` desde una conversión float16. El resultado pesa 0,76 GB (0,8 GB el repositorio completo), frente a los aproximadamente 1,6 GB de la versión float16, lo que reduce a la mitad el consumo de memoria y acelera la inferencia.

No se ha entrenado nada nuevo: es una conversión de pesos con cambios de layout y cuantización, a partir del commit `41f01f3fe87f28c78e2fbf8b568835947dd65ed9` del modelo base. Su relevancia práctica es que permite desplegar Whisper large-v3-turbo en local con menor huella de VRAM y mayor velocidad, manteniendo la calidad de transcripción del modelo original con una degradación mínima típica de la cuantización int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) para reconocimiento de voz |
| Parametros totales | 809 millones (heredados de whisper-large-v3-turbo; no disponible en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3-turbo procesa ventanas de 30 s de audio) |
| Tipos de cuantizacion | int8_float16 (pesos lineales en int8, activaciones y convoluciones en float16) |
| Idiomas soportados | no disponibles en la ficha (el modelo base soporta ~99 idiomas) |
| Licencia | MIT (copyright de los pesos: OpenAI) |
| Formato de pesos | CTranslate2 (`model.bin`, 0,76 GB) |

## Arquitectura y entrenamiento

El modelo base, Whisper large-v3-turbo, es un transformer encoder-decoder: el encoder procesa espectrogramas log-Mel de audio (con dos convoluciones iniciales) y el decoder autoregresivo genera los tokens de transcripción. Large-v3-turbo es una versión destilada de large-v3 con 4 capas de decoder en lugar de 32, lo que reduce drásticamente el coste de inferencia manteniendo gran parte de la calidad.

Este repositorio no incorpora ningún entrenamiento adicional. La conversión se realizó con el convertidor de transformers de CTranslate2 (versión 4.8.3, con transformers 5.17.0) mediante el script `model_builds/whisper.py` del proyecto dubber. Los pesos se cargaron primero como float16 y después se cuantizaron los pesos lineales a int8 con cuantización per-row absmax; las dos convoluciones del encoder se conservaron en float16, y se copiaron `tokenizer.json` y `preprocessor_config.json` del modelo fuente. El hash sha256 de `model.bin` es `b22022c903ac599f60e03740ed9d57972f449a3f393b55f0518d517a4382871d`, útil para verificar la integridad del fichero en despliegues.

## Capacidades

- Transcripción de voz a texto (automatic speech recognition) heredada de Whisper large-v3-turbo.
- Traducción directa de audio a texto en inglés (tarea X->en soportada por la familia Whisper).
- Detección automática de idioma en el audio de entrada.
- Marcas de tiempo a nivel de segmento (funcionalidad estándar de faster-whisper).
- Puntuación y formato de texto automático, característicos de los modelos Whisper grandes.
- Ejecución optimizada en GPU (CUDA, cuDNN) y CPU gracias a CTranslate2, con kernels cuantizados int8.

## Casos de uso

- Doblaje y subtitulado local: myDubber lo emplea como backend de reconocimiento de voz; su bajo consumo de memoria permite transcribir largos volúmenes de audio en estaciones de trabajo sin GPU de gama alta.
- Transcripción de reuniones en local: la cuantización int8 reduce la VRAM a la mitad respecto a float16, lo que permite ejecutar el modelo junto a otras cargas en la misma GPU.
- Pipelines de procesamiento de audio por lotes: al precomputar la cuantización se elimina el coste de conversión en cada carga, acelerando arranques en servicios con múltiples workers.
- Servicios de transcripción en la nube con coste contenido: el menor tamaño de `model.bin` (0,76 GB) reduce tiempos de descarga y despliegue en contenedores.
- Transcripción en tiempo casi real con faster-whisper: la combinación int8/float16 ofrece mayor throughput por segmento que la versión float16 en GPU.
- Integración en aplicaciones con verificación de artefactos: el sha256 publicado permite validar el modelo en CI/CD antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha no incluye comparativas WER (word error rate) frente al modelo base float16 ni mediciones de latencia; el propio repositorio indica que la conversión replica el cómputo que faster-whisper ya realizaba en cada carga con `compute_type="int8_float16"`, por lo que los resultados deberían ser equivalentes a esa configuración.

## Requisitos de hardware

- Memoria del modelo: 0,76 GB en disco; en ejecución con `int8_float16` el consumo de VRAM estimado es del orden de 1-2 GB (pesos int8 más activaciones float16 y buffers de CTranslate2), frente a ~1,6 GB solo de pesos en float16.
- GPU recomendadas: cualquier GPU CUDA moderna funciona; con ~2 GB de VRAM es viable en GPUs de consumo como la RTX 3060 de 12 GB, RTX 4060 o superiores, sin necesidad de A100/H100.
- CPU: CTranslate2 permite ejecutar el modelo en CPU con `device="cpu"` (en ese caso se recomienda `compute_type="int8"`), aunque con menor velocidad.
- Despliegue: la vía soportada es faster-whisper (`WhisperModel` con `device="cuda"`, `compute_type="int8_float16"`); no es un repositorio de transformers ni compatible directamente con Ollama o TGI.
- Latencia y throughput: no disponibles; se espera una mejora notable respecto a float16 por la reducción de ancho de banda de memoria de los pesos int8.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano pesos | Licencia | Notas |
|---|---|---|---|---|---|
| mydubber-org/whisper-large-v3-turbo-ct2-int8 | ~809 M | CTranslate2, int8_float16 | 0,76 GB | MIT | Conversión pre-cuantizada para faster-whisper |
| openai/whisper-large-v3-turbo | ~809 M | PyTorch (transformers), fp16/bf16 | ~1,6 GB | MIT | Modelo base; requiere conversión para CTranslate2 |
| deepdml/faster-whisper-large-v3-turbo-ct2 | ~809 M | CTranslate2, float16 | ~1,6 GB | MIT | Conversión CTranslate2 sin cuantizar a int8 |

## Limitaciones y advertencias

- La cuantización int8 puede introducir una ligera degradación de WER respecto a float16; no se han publicado mediciones que cuantifiquen esa pérdida.
- Los pesos son propiedad intelectual de OpenAI (aunque la licencia declarada es MIT); conviene revisar los términos de uso de OpenAI para los pesos originales en despliegues comerciales.
- Whisper large-v3-turbo tiene un rendimiento desigual en idiomas de bajos recursos y puede alucinar texto (repetir o inventar fragmentos) en silencios largos, música o audio de baja calidad, un comportamiento heredado por esta conversión.
- El modelo solo es utilizable con CTranslate2/faster-whisper; no carga con la librería `transformers` de forma directa.
- El repositorio tiene 0 descargas y 0 likes registrados, sin comunidad de revisión detrás; se recomienda verificar el sha256 de `model.bin` antes de usarlo en producción.
- Ventana de audio de 30 s por segmento: audios muy largos requieren segmentación por parte de la librería.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mydubber-org/whisper-large-v3-turbo-ct2-int8
- Modelo base (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
- faster-whisper (GitHub): https://github.com/SYSTRAN/faster-whisper
- Script de conversión (dubber): https://github.com/vladbehash/dubber/blob/main/tools/model-builds/src/model_builds/whisper.py
- CTranslate2: https://github.com/OpenNMT/CTranslate2
