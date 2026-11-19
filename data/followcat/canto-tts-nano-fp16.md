# followcat/canto-tts-nano-fp16

## Resumen

canto-tts-nano-fp16 es una conversión a precisión de 16 bits (float16) del modelo de síntesis de voz en cantonés typangaa/canto-tts-nano, publicado por el usuario followcat. El modelo original es un sistema de text-to-speech para cantonés de Hong Kong, afinado a partir de MOSS-TTS-Nano de OpenMOSS. Esta variante no introduce cambios en el comportamiento, la voz ni el tokenizador: únicamente transforma el formato numérico de los pesos y de los tensores float para entornos que prefieren float16, como WebGPU con soporte de `shader-f16`.

La relevancia de esta conversión es práctica: reduce el paquete en disco de 764 MB (exportación fp32 oficial) a 384 MB, manteniendo las mismas ocho grafos ONNX y la misma voz integrada. No es una cuantización int8; para despliegue en CPU de dispositivos existe una variante int8 separada. El modelo trabaja con fonemas Jyutping como entrada, no con texto directo, por lo que requiere un paso previo de conversión grafema-fonema.

La ficha se basa exclusivamente en la información publicada en el repositorio de Hugging Face y en la model card del autor. El propio autor advierte que la calidad de audio de esta conversión todavía no se ha validado mediante escucha comparativa con el modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de MOSS-TTS-Nano, exportada a ONNX en ocho grafos) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | float16 (fp16); existe variante int8 en otro repositorio |
| Idiomas soportados | Cantonés (yue) e inglés (en, cambio de código) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con ficheros `.data` compartidos) |

## Arquitectura y entrenamiento

El modelo es una conversión de precisión del export ONNX fp32 de canto-tts-nano, que a su vez es un ajuste fino de MOSS-TTS-Nano de OpenMOSS. La arquitectura subyacente corresponde a un sistema TTS con tokenizador de audio (codec) y varios grafos separados: prefill, paso de decodificación, decodificador local, paso con caché, generación de frame fijo y un codificador/decodificador de audio. No se dispone de detalles sobre el número de parámetros, la composición del dataset de entrenamiento ni el proceso de ajuste (RLHF, DPO u otros).

La innovación técnica de este repositorio es puramente de formato: se aplicó `onnxconverter_common.float16.convert_float_to_float16` con `keep_io_types=False` a los ocho grafos, seguido de una pasada que reescribió nodos `Cast(to=float32)` residuales a float16 donde era seguro e insertó Casts alrededor de operadores que deben permanecer en float32 (como `Range`, `CumSum` y `TopK`). Además, se renombraron nueve tensores con el mismo nombre pero distintos en los ficheros `.data` compartidos, y se actualizaron doce entradas `cache_dtype` de los metadatos del codec de float32 a float16. La validación incluyó `onnx.checker` y la carga con ONNX Runtime en CPU para los ocho grafos.

## Capacidades

- Síntesis de voz (text-to-speech) en cantonés de Hong Kong a partir de fonemas Jyutping.
- Cambio de código a inglés dentro de la misma locución.
- Una única voz integrada (no se documenta clonación de voz ni selección de hablante).
- Entrada mediante tokens de fonemas Jyutping; requiere un conversor grafema-fonema previo (por ejemplo, `canto-hk-g2p`).
- Ejecución en navegador mediante ONNX Runtime Web y WebGPU con soporte de `shader-f16`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Síntesis de voz en aplicaciones web en tiempo real: al ser un paquete ONNX de 384 MB con pesos float16, puede cargarse en el navegador y ejecutarse con WebGPU, lo que permite generar audio en cliente sin enviar texto a un servidor.
- Lectura de contenido en cantonés para aplicaciones de accesibilidad: conversión de artículos o interfaces a voz para usuarios con discapacidad visual, usando el pipeline texto → Jyutping → audio.
- Asistentes conversacionales locales en cantonés: integración en aplicaciones de escritorio o móviles que necesiten respuestas habladas sin conexión, aprovechando el tamaño reducido del paquete.
- Doctores y prototipos de pronunciación: generación de audio de referencia para herramientas de aprendizaje de Jyutping, dado que el modelo consume directamente fonemas.
- Localización de contenido educativo o de noticias: producción de audio en cantonés con inserción puntual de términos en inglés, gracias al cambio de código.
- Pruebas de integración en pipelines de CI: validación de carga de los ocho grafos con ONNX Runtime y `onnx.checker` como parte de un proceso automatizado de empaquetado de modelos.
- Demostraciones interactivas en navegador: uso del manifiesto `browser_poc_manifest.json` incluido para montar una prueba de concepto de TTS en cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la calidad de audio no se ha validado mediante escucha comparativa con el modelo original.

## Requisitos de hardware

- Tamaño en disco del paquete completo: 384 MB (frente a 764 MB del export fp32).
- VRAM estimada: no disponible; el modelo está pensado para ejecución en navegador con WebGPU y en CPU mediante ONNX Runtime.
- GPU recomendadas: no disponible. El requisito funcional es un runtime que soporte tensores float16, como WebGPU con `shader-f16`.
- Compatibilidad con GPU de consumo: no confirmada; depende del soporte de float16 del backend elegido.
- Opciones de despliegue: ONNX Runtime (CPU y Web), ONNX Runtime Web con WebGPU. El SDK `canto-tts` en Python está diseñado para el export fp32 original y no se garantiza que cargue estos grafos sin modificaciones.
- Latencia y throughput: no disponibles.
- Consideración de estructura: es necesario preservar la disposición de carpetas, ya que los grafos localizan sus ficheros de pesos por ruta relativa.

## Comparativa con modelos similares

| Modelo | Precisión | Tamaño | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| followcat/canto-tts-nano-fp16 | float16 | 384 MB | yue, en | Apache 2.0 | Conversión fp16, validada con onnx.checker y ORT CPU; calidad no evaluada por escucha |
| typangaa/canto-tts-nano | fp32 | 764 MB | yue, en | Apache 2.0 | Modelo original; compatible con el SDK canto-tts |
| dandelionchase/canto-tts-nano-int8 | int8 | No disponible | yue, en | No disponible | Variante para CPU en dispositivo; mencionada por el autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estas variantes entre sí.

## Limitaciones y advertencias

- La calidad del audio fp16 no se ha comprobado mediante escucha; el autor recomienda comparar con el original antes de usarlo en producción.
- El SDK `canto-tts` en Python apunta al export fp32; no se debe asumir que cargará estos grafos sin adaptaciones.
- Requiere convertir el texto a fonemas Jyutping antes de la inferencia; no acepta texto plano directamente.
- Una sola voz integrada; no hay soporte documentado de clonación ni de múltiples hablantes.
- Idiomas limitados a cantonés e inglés; no se documenta soporte de mandarín ni de otras lenguas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución a typangaa y OpenMOSS según los ficheros `LICENSE` y `NOTICE`.
- El repositorio no está afiliado ni respaldado por los autores de los modelos originales.
- Es imprescindible mantener la estructura de carpetas del repositorio para que los grafos encuentren sus ficheros de pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/followcat/canto-tts-nano-fp16
- Modelo base: https://huggingface.co/typangaa/canto-tts-nano
- Variante int8: https://huggingface.co/dandelionchase/canto-tts-nano-int8
- MOSS-TTS (OpenMOSS): https://github.com/OpenMOSS/MOSS-TTS
- SDK canto-tts: https://github.com/typangaa/canto-tts
- Conversor grafema-fonema canto-hk-g2p: https://github.com/typangaa/canto-hk-g2p
