# NewGame/libritts_codec_train_encodec_libritts

## Resumen

NewGame/libritts_codec_train_encodec_libritts es un modelo de codec generativo adversarial (GANCodec) desarrollado en el marco de ESPnet3 por NewGame. Está diseñado para comprimir y reconstruir señales de audio de voz, concretamente sobre el corpus LibriTTS. El modelo se basa en una arquitectura EnCodec con cuantizador residual de 32 códigos y 1024 bins, y presenta 20.175.980 parámetros en formato float32, con un tamaño de pesos de 80,7 MB. Su relevancia actual radica en la creciente demanda de codecs neuronales para tareas de compresión de audio, transmisión y síntesis de voz, así como en servir como modelo de referencia dentro del ecosistema ESPnet3 para experimentación con codecs de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESPnetGANCodecModel (EnCodec generativo adversarial con discriminador multi-escala STFT) |
| Parametros totales | 20.175.980 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (corpus LibriTTS en ingles, no se especifica) |
| Licencia | No disponible |
| Formato de pesos | No disponible (empaquetado en model_pack de ESPnet3) |

## Arquitectura y entrenamiento

El modelo es un codec neuronal que combina un codificador-decodificador convolucional con un cuantizador residual (RVQ) de 32 cuantizadores y 1024 bins, permitiendo tasas de bits variables de 2, 4, 8, 16 y 32. La arquitectura del generador incluye capas convolucionales con ratios de downsample [8, 5, 4, 2], activación ELU, normalización por peso y capas LSTM. El discriminador es un multi-escala STFT con cinco resoluciones de FFT (1024, 2048, 512, 256 y 128) y activación LeakyReLU. El modelo opera a una frecuencia de muestreo de 24 kHz y fue entrenado con el corpus LibriTTS a partir de la receta `egs3/libritts/codec` de ESPnet3.

El entrenamiento utiliza una combinación de pérdidas de reconstrucción, adversarial, mel (con 80 filtros), feature matching y commit. Los optimizadores son AdamW con tasa de aprendizaje 3e-4 y betas [0.5, 0.9], junto con un scheduler exponencial con gamma 0.999875. No se aplicaron técnicas de RLHF o DPO, ya que se trata de un modelo de audio y no de lenguaje.

## Capacidades

- Codificacion de audio de voz a representaciones discretas mediante cuantizacion residual.
- Reconstruccion de señales de audio con calidad perceptual alta, medida en metricas como UTMOS y SI-SNR.
- Soporte de multiples tasas de bits (2, 4, 8, 16 y 32), lo que permite ajustar el compromiso entre compresion y fidelidad.
- Integracion nativa con el framework ESPnet3 a traves de la clase `InferenceModel`.
- Capacidad de procesamiento de audio monoaural con padding y normalizacion automatica.
- No incluye capacidades de texto, vision, tool calling ni razonamiento multi-paso.

## Casos de uso

- Compresion de voz para streaming: el modelo puede codificar audio a baja tasa de bits para transmitirlo por redes con ancho de banda limitado y decodificarlo en el receptor con calidad aceptable.
- Almacenamiento eficiente de corpus de voz: permite reducir el espacio de disco necesario para grandes bases de datos de audio, como LibriTTS, manteniendo una reconstruccion fiel.
- Preentrenamiento de modelos TTS: sirve como tokenizador de audio para modelos de sintesis de voz, transformando senales continuas en secuencias discretas de codigos.
- Investigacion en codecs neuronales: ofrece una base para comparar arquitecturas GANCodec frente a otros codecs como EnCodec original, mediante las metricas incluidas en la model card.
- Mejora de calidad de audio en comunicaciones: puede emplearse para reconstruir senales degradadas o de baja calidad en sistemas de telepresencia o grabacion de campo.
- Integracion en pipelines de ESPnet3: el modelo se usa como componente en tareas de reconocimiento o sintesis de voz dentro del ecosistema ESPnet3, gracias a su empaquetado en `model_pack`.
- Demo interactiva en HuggingFace Spaces: permite probar el modelo con audio de entrada directamente desde el navegador, lo que facilita la evaluacion rapida.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en el conjunto de test de LibriTTS:

| dataset | ci_sdr | dns_overall | dns_p808 | plcmos | sar | sdr | si_snr | sir | utmos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| test | 5.992 | 3.115 | 3.771 | 4.3182 | 6.0536 | 6.0536 | 3.4668 | inf | 3.9874 |

No se han encontrado en la informacion disponible comparativas de rendimiento con otros modelos de codec.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la informacion disponible.
- El modelo tiene 20.175.980 parametros y un tamano de pesos de 80,7 MB, por lo que es viable en CPU y en GPUs de consumo.
- Se puede ejecutar en hardware modesto, incluyendo portatiles con CPU moderna, sin necesidad de GPU dedicada.
- Opciones de despliegue: uso directo con `espnet3.publication.InferenceModel`, o mediante la demo Gradio en HuggingFace Spaces.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado comparativas publicadas con modelos similares en la informacion disponible. El modelo es conceptualmente comparable a EnCodec de Meta, pero no se dispone de datos de rendimiento comparativo ni de una tabla de equivalencias.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con el corpus LibriTTS (ingles), por lo que su generalizacion a otros idiomas, acentos o condiciones de ruido puede ser limitada.
- No se especifica licencia de uso, lo que impide determinar si puede emplearse en aplicaciones comerciales sin autorizacion explicita.
- Al ser un modelo de investigacion, puede presentar artefactos en la reconstruccion, especialmente en senales fuera de la distribucion de entrenamiento.
- No se han documentado sesgos especificos, pero la limitacion del corpus puede introducir sesgos hacia voces de habla inglesa.
- No aplican riesgos de alucinacion en el sentido clasico, al tratarse de un modelo de audio y no de texto generativo.

## Enlaces

- HuggingFace: https://huggingface.co/NewGame/libritts_codec_train_encodec_libritts
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/NewGame/libritts_codec_train_encodec_libritts
- Repositorio de origen: https://github.com/NewGamezzz/espnet.git
