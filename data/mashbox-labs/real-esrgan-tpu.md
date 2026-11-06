# mashbox-labs/Real-ESRGAN-TPU

## Resumen

Real-ESRGAN-TPU es una redistribución de los pesos del conocido modelo de superresolución de imágenes Real-ESRGAN, publicada por mashbox-labs en formato BSHJ, el formato de pesos que consume el motor de inferencia sobre TPU de la librería `mashbox`. No se trata de un modelo nuevo ni de un reentrenamiento: son los mismos pesos de Xintao Wang (Real-ESRGAN v0.2.1 para el escalado 2x y v0.1.0 para el 4x) convertidos a float32 y empaquetados como ficheros BSHJ de 68,3 MB cada uno, con 702 tensores por fichero.

El interés de esta publicación es de infraestructura, no de modelado: permite ejecutar el upscaling de Real-ESRGAN en aceleradores TPU mediante el motor `mashbox`, manteniendo los nombres y formas de tensor del state dict original de PyTorch (`conv_first.weight`, `body.0.rdb1.conv1.weight`, etc.) y registrando en la cabecera de cada fichero el fichero upstream de origen junto con su sha256. La arquitectura subyacente es la RRDBNet de Real-ESRGAN, una red generativa adversarial con bloques residuales densos.

Es relevante para equipos que ya trabajan con TPU y quieren incorporar restauración y escalado de imágenes sin salir de ese ecosistema, pero conviene subrayar que el paquete `mashbox` 0.1.10 no incluye un comando `mashbox run` para este modelo: la publicación es solo de pesos y el usuario debe integrar la carga mediante el lector BSHJ. La licencia BSD-3-Clause se hereda del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (Real-ESRGAN, red residual densa con discriminador U-Net en entrenamiento) |
| Parametros totales | no disponible (702 tensores por fichero; tamaño de pesos 68,3 MB en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados únicamente en float32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | BSHJ (lector `mashbox.bshj`, acceso como arrays NumPy sobre memory map) |

## Arquitectura y entrenamiento

Los pesos corresponden a Real-ESRGAN, un modelo de superresolución basado en una red generadora RRDBNet con bloques residuales densos, entrenada con una formulación GAN y una degradación sintética de alta orden pensada para restaurar imágenes del mundo real (ruido, desenfoque, compresión JPEG, artefactos). Esta publicación no aporta información sobre el entrenamiento original: no se detallan tokens, composición del dataset, ni si hubo etapas de ajuste adicionales. La model card solo documenta la conversión: los ficheros se generan a partir de `params_ema` de las releases upstream, en float32, preservando la nomenclatura y las formas del state dict de PyTorch.

La innovación técnica aquí no está en el modelo sino en el empaquetado. BSHJ es un formato binario que el motor TPU de `mashbox` lee directamente, y su cabecera incluye metadatos de trazabilidad (fichero upstream de origen, su sha256 y la clave del state dict). El lector expone los tensores como arrays NumPy mapeados en memoria sin copia, lo que facilita la carga eficiente en el acelerador. No se documentan optimizaciones de decodificación, atención lineal ni técnicas de inferencia específicas más allá del propio motor TPU.

## Capacidades

- Superresolución de imágenes con factor de escalado 2x (`RealESRGAN_x2plus.bshj`).
- Superresolución de imágenes con factor de escalado 4x (`RealESRGAN_x4plus.bshj`).
- Restauración de imágenes degradadas del mundo real: reducción de ruido, corrección de desenfoque y mitigación de artefactos de compresión.
- Salida en float32 con los tensores del state dict original, lo que permite verificación e integración con código PyTorch existente.
- Carga sobre memory map sin copia mediante `mashbox.bshj.File` y `f.array(...)`.
- Ejecución sobre TPU a través del motor `mashbox` (no se documenta soporte de tool calling, agentes, texto, audio ni otras modalidades).

## Casos de uso

- Restauración de fotografías antiguas o de baja calidad: aplicar el modelo 4x sobre escaneos con ruido y compresión para obtener una versión ampliada y limpiada, aprovechando la formulación de degradación realista del entrenamiento original.
- Mejora de imágenes en pipelines de e-commerce: escalar fotos de producto de baja resolución antes de publicarlas, con el factor 2x cuando se busca un compromiso entre calidad y coste computacional.
- Preprocesado para visión por computador: aumentar la resolución de imágenes de entrada a detectores o clasificadores que rinden mejor con más detalle, integrando la carga BSHJ en el mismo entorno TPU que el resto del pipeline.
- Restauración de material de archivo audiovisual: procesar fotogramas individuales de vídeo antiguo para reducir artefactos de compresión antes de un reescalado o remasterización.
- Upscaling en dispositivos o servidores con TPU: desplegar el modelo en infraestructura basada en TPU usando el motor `mashbox`, evitando depender de GPUs para esta etapa del pipeline.
- Verificación y auditoría de pesos: gracias a los metadatos sha256 de la cabecera BSHJ, comprobar que los tensores cargados coinciden con la release upstream antes de usarlos en producción.
- Investigación en formatos de pesos: usar estos ficheros como referencia para estudiar el formato BSHJ y su lector (`src/mashbox/bshj.py`) en el contexto de portar otros modelos a TPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; los pesos ocupan 68,3 MB por fichero en float32, por lo que el requisito de memoria del modelo es modesto, pero no se documentan las necesidades del motor TPU ni de los buffers intermedios.
- GPU recomendadas: no aplica directamente; el formato BSHJ está pensado para el motor TPU de `mashbox`. No se documenta soporte en GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete `mashbox` (versión 0.1.10 o superior) con el lector `mashbox.bshj`; no existe comando `mashbox run` para este modelo en la release 0.1.10.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Escalado | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Real-ESRGAN-TPU (esta ficha) | no disponible (68,3 MB float32) | 2x y 4x | BSHJ | BSD-3-Clause | Hugging Face, solo pesos |
| Real-ESRGAN (xinntao) | no disponible | 2x y 4x | PyTorch (.pth) | BSD-3-Clause | GitHub releases |
| Otros modelos de superresolución | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con la release upstream de Real-ESRGAN, de la que estos ficheros son una conversión directa: mismos pesos, misma licencia, distinto formato y motor de ejecución. No se dispone de información sobre alternativas comparables en el ecosistema TPU.

## Limitaciones y advertencias

- Solo contiene pesos: no hay código de inferencia específico para este modelo en `mashbox` 0.1.10; el usuario debe escribir la integración con el lector BSHJ.
- El formato BSHJ está ligado al motor TPU de `mashbox`; no es un formato portable a otros runtimes sin conversión.
- Solo se publican pesos en float32; no hay versiones cuantizadas, lo que limita opciones de optimización de memoria.
- Al ser una conversión de pesos upstream, hereda las limitaciones del modelo original de Real-ESRGAN, que no se detallan en la model card.
- Riesgo de artefactos o alucinación visual en imágenes muy degradadas o fuera de la distribución de entrenamiento; no se documenta en la información disponible.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright de Xintao Wang y el texto de la licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- No se especifican idiomas ni requisitos de contexto porque no aplican a un modelo de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/mashbox-labs/Real-ESRGAN-TPU
- Repositorio original de Real-ESRGAN (Xintao Wang): https://github.com/xinntao/Real-ESRGAN/tree/a4abfb2979a7bbff3f69f58f58ae324608821e27
- Lector BSHJ (`src/mashbox/bshj.py`): https://github.com/mashbox-labs/mashbox/blob/v0.1.10/src/mashbox/bshj.py
- Repositorio de mashbox: https://github.com/mashbox-labs/mashbox
- Paquete en PyPI (0.1.10): https://pypi.org/project/mashbox/0.1.10/
- Perfil en X: https://x.com/mashboxgg
- Contacto: hello@mashbox.gg
