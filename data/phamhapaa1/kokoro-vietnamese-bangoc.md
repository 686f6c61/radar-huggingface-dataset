# Phamhapaa1/Kokoro-Vietnamese-BANGOC

## Resumen

Kokoro Vietnamese BANGOC es un modelo de síntesis de voz (text-to-speech) en vietnamita, desarrollado por Phamhapaa1 a partir del modelo base Kokoro. El objetivo es ofrecer un sistema TTS ligero y de código abierto (licencia Apache 2.0) específicamente ajustado para el idioma vietnamita, ante la escasez de modelos TTS de calidad para esta lengua. El modelo se distribuye como artefactos listos para usar: un checkpoint de PyTorch (KModel), una exportación a ONNX Runtime para inferencia en CPU o GPU, y packs de voces adicionales. No se especifican en la información disponible ni el tamaño total del modelo en parámetros ni la longitud máxima de entrada de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KModel de Kokoro (text-to-speech basado en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pth), ONNX (.onnx), packs de voz (.pt) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo TTS Kokoro para vietnamita. Los artefactos incluyen un checkpoint de PyTorch (kokoro_vi.pth) que corresponde al modelo acústico KModel, una exportación a ONNX (kokoro_vi.onnx) y un pack de voz por defecto (kokoro_vi_voicepack.pt), junto con el config.json que contiene configuración y vocabulario. Para la conversión de texto a fonemas se utiliza vig2p, un G2P vietnamita que se integra tanto en el flujo de entrenamiento como en el de inferencia. No se han publicado detalles sobre los datos de entrenamiento, el número de tokens ni el proceso de fine-tuning (por ejemplo, si se usó RLHF o DPO, no aplicable a TTS). La exportación a ONNX permite inferencia ligera con soporte tanto de CPU como de CUDA mediante onnxruntime-gpu.

## Capacidades

- Síntesis de voz en vietnamita a partir de texto, con fonemas generados mediante vig2p.
- Soporte de multiple voces: incluye un pack por defecto y varios packs adicionales en la carpeta `voicepacks/`.
- Inferencia dual: tanto en PyTorch como en ONNX Runtime, con dispositivos CPU y CUDA.
- La exportación a ONNX proporciona una opción ligera para despliegue en entornos sin acceso a GPU.
- El modelo está adaptado al idioma vietnamita, lo que permite una pronunciación más natural que los modelos multilingües genéricos.
- Incluye herramientas CLI de inferencia y una utilidad para exportar el modelo a ONNX.

## Casos de uso

- Accesibilidad para público vietnamita: se puede integrar en lectores de pantalla y aplicaciones de asistencia para personas con discapacidad visual, usando la voz en vietnamita generada a partir de texto de interfaces o documentos.
- Audiolibros y narración de contenido: el modelo permite convertir novelas, artículos o noticias en audio en vietnamita, aprovechando la inferencia por lotes en servidores con CPU o GPU.
- Asistentes de voz para atención al cliente: al sintetizar respuestas en vietnamita en tiempo real, puede integrarse en chatbots o sistemas de respuesta interactiva (IVR) con herramientas como Rasa o sistemas de telefonía.
- Doblaje de vídeos para contenidos en vietnamita: usado en producción audiovisual, se puede generar narración para documentales, animaciones o vídeos educativos, con la opción de usar distintas voces del pack.
- Aplicaciones educativas de idiomas: el TTS puede usarse para enseñar pronunciación, entonación y vocabulario en vietnamita, tanto en aplicaciones móviles como en plataformas web.
- Despliegue en dispositivos embebidos: gracias a la exportación a ONNX y a su tamaño reducido (0,7 GB de repositorio), puede ejecutarse en dispositivos de bajo consumo, como Raspberry Pi, mediante CPU con onnxruntime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: para PyTorch se indica uso de `--device cuda`; para ONNX, se sugiere `onnxruntime-gpu` con CUDAExecutionProvider si está disponible. No se especifica un modelo de GPU mínimo.
- Puede ejecutarse en GPU de consumo: probablemente, dado el tamaño del repositorio (0,7 GB), aunque no se confirma en la documentación.
- Opciones de despliegue: CLI (`kokoro-vietnamese` para PyTorch y `kokoro-vietnamese-onnx` para ONNX), ONNX Runtime, PyTorch. También se puede utilizar con frameworks que carguen modelos ONNX o PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al ser un modelo ajustado para vietnamita puede reflejar sesgos presentes en los datos de entrenamiento no publicados.
- Riesgo de alucinación en la pronunciación: texto ambiguo, nombres propios o extranjerismos pueden producir una pronunciación incorrecta o poco natural.
- El modelo solo soporta vietnamita; no genera audio en otros idiomas.
- No se especifica la longitud máxima de texto que puede procesar en una sola llamada; puede requerir segmentación.
- La licencia Apache-2.0 permite uso comercial, pero exige incluir el aviso de licencia y los cambios realizados si se redistribuye.
- No hay información sobre soporte técnico ni mantenimiento continuado del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Phamhapaa1/Kokoro-Vietnamese-BANGOC
- Repositorio de inferencia y entrenamiento: https://github.com/iamdinhthuan/Kokoro-Vietnamese
