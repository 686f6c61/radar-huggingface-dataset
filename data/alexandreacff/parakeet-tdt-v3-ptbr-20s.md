# alexandreacff/parakeet-tdt-v3-ptBR-20s

## Resumen

El modelo `alexandreacff/parakeet-tdt-v3-ptBR-20s` es un checkpoint de reconocimiento automático del habla (ASR) basado en la arquitectura FastConformer-TDT, publicado en el ecosistema NVIDIA NeMo. Se presenta como una variante orientada al portugués brasileño, con una ventana de audio de hasta 20 segundos, aunque la model card oficial carece de documentación técnica detallada: el autor no ha especificado el número de parámetros, el dataset de entrenamiento ni los resultados de evaluación.

El modelo se enmarca en la familia de los `parakeet-tdt` de NVIDIA, que emplean un codificador FastConformer y un decodificador TDT (Transducer with Transducer Decoder) para lograr transcripciones de alta velocidad y baja latencia. A pesar de la falta de información propia, el checkpoint puede cargarse directamente con `ModelPT.from_pretrained` y usarse para inferencia o fine-tuning con el toolkit NeMo. Su relevancia actual reside en la demanda de modelos ASR multilingües y ligeros que puedan desplegarse en producción con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (transducer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 20 segundos de audio (por el sufijo `-20s`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues brasileño (pt-BR) |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo (`.nemo`), basado en PyTorch |

## Arquitectura y entrenamiento

La arquitectura FastConformer-TDT combina un codificador FastConformer (una variante eficiente de Conformer con atencion por ventanas) con un decodificador de transduccion TDT, que predice directamente las secuencias de texto sin necesidad de un modelo de lenguaje externo. Este diseño permite un procesamiento en streaming y una latencia reducida, lo que lo hace adecuado para transcripcion en tiempo real. El checkpoint se distribuye como un artefacto de NeMo, lo que implica que el entrenamiento se realizó con el toolkit de NVIDIA.

Los datos de entrenamiento no se han publicado en la model card. La plantilla del README sugiere que se usaron configuraciones similares a las de los modelos `parakeet-tdt` de NVIDIA, que en su version v3 se entrenaron sobre el dataset Granary (mas de 670.000 horas de audio en 25 idiomas europeos). Sin embargo, para esta variante concreta no se confirma ni el numero de tokens ni la composicion del dataset.

## Capacidades

- Transcripcion de voz a texto en portugues brasileiro, con deteccion automatica del idioma (segun la familia Parakeet v3).
- Inferencia en streaming gracias a la arquitectura TDT, con procesamiento incremental de segmentos de audio.
- Integracion con el ecosistema NeMo: permite fine-tuning sobre nuevos datasets y uso via scripts de transcripcion por lotes.
- Compatible con el pipeline de transcripcion de NeMo (`transcribe_speech.py`) y con la API de Python de NeMo.
- Soporte de entrada de audio en formato WAV (segun el ejemplo de la model card).

## Casos de uso

- **Transcripcion de reuniones en portugues**: el modelo puede transcribir grabaciones de conferencias o reuniones en tiempo real, gracias a su arquitectura de streaming y ventana de 20 segundos.
- **Subtitulacion automatica de videos**: se puede integrar en un pipeline que recorte el audio en segmentos de 20 segundos y genere subtitulos para plataformas como YouTube o Vimeo.
- **Asistentes de voz para aplicaciones de atencion al cliente**: al ser un modelo ligero (2.5 GB), puede desplegarse en servidores modestos para transcribir interacciones de usuarios en portugues.
- **Analisis de llamadas telefonicas**: en centros de contacto, el modelo puede convertir llamadas en texto para su posterior analisis de sentimiento o busqueda de palabras clave.
- **Herramientas de dictado**: integracion en aplicaciones de escritorio o moviles para dictar texto en portugues brasileiro, con baja latencia de respuesta.
- **Investigacion academica en fonetica o linguistica**: el checkpoint puede usarse como base para fine-tuning en corpus especificos del portugues de Brasil, gracias a la flexibilidad de NeMo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es una plantilla generica sin datos de WER ni comparativas. No se puede afirmar ningun valor de rendimiento objetivo para esta variante.

## Requisitos de hardware

- **Tamano del repositorio**: 2.5 GB, lo que sugiere un checkpoint de alrededor de 0.6B de parametros (como el modelo base de NVIDIA). Esto cabe en una GPU consumer con 8-12 GB de VRAM en precision FP16.
- **GPU recomendada**: tarjetas con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para inferencia en FP16. Para entrenamiento o fine-tuning, se recomienda una GPU con 16 GB o mas.
- **Opciones de despliegue**: NeMo Toolkit (inferencia y entrenamiento), vLLM no es aplicable (no es LLM), se puede exportar a ONNX para ejecucion en CPU o GPU con TensorRT.
- **Latencia**: no disponible. Por la arquitectura TDT, se espera una latencia baja en comparacion con modelos seq2seq, pero no se tienen datos concretos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| `alexandreacff/parakeet-tdt-v3-ptBR-20s` | FastConformer-TDT | no disponible | 20 s | pt-BR | cc-by-4.0 |
| `nvidia/parakeet-tdt-0.6b-v3` | FastConformer-TDT | 0.6B | no especificado | 25 idiomas europeos | cc-by-4.0 |
| `nvidia/parakeet-tdt-0.6b-v2` | FastConformer-TDT | 0.6B | no especificado | Ingles | cc-by-4.0 |

La variante de `alexandreacff` parece ser un fine-tuning del modelo v3 de NVIDIA para portugues brasileiro, pero no se ha confirmado si mantiene los mismos parametros. No se dispone de comparativa de rendimiento.

## Limitaciones y advertencias

- **Documentacion insuficiente**: la model card no proporciona datos de entrenamiento, arquitectura exacta ni metricas. Cualquier uso en produccion requiere validacion previa.
- **Riesgo de alucinacion**: como todo sistema ASR, puede generar transcripciones erroneas en acentos no representados, ruido de fondo o audio de baja calidad.
- **Idioma limitado**: solo se ha confirmado portugues brasileiro; no es adecuado para otros dialectos del portugues (europeo, africano) ni para otros idiomas.
- **Licencia**: cc-by-4.0 permite uso comercial con atribucion, pero se debe verificar si los datos de entrenamiento originales tienen restricciones adicionales.
- **Formato propietario**: el checkpoint en formato `.n` solo es utilizable con NeMo, lo que limita la portabilidad a otros frameworks (p.ej., Hugging Face Transformers no puede cargarlo directamente).
- **Sin garantia de soporte**: al ser un modelo publicado por un usuario sin documentacion, no hay garantia de mantenimiento ni de actualizaciones.

## Enlaces

- [HuggingFace: alexandreacff/parakeet-tdt-v3-ptBR-20s](https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-20s)
- [NeMo documentation](https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/stable/index.html)
- [Ejemplo de config de FastConformer-TDT](https://github.com/NVIDIA/NeMo/blob/main/examples/asr/conf/fastconformer/fast-conformer_transducer_bpe.yaml)
- [Script de entrenamiento RNNT-BPE](https://github.com/NVIDIA/NeMo/blob/main/examples/asr/asr_transducer/speech_to_text_rnnt_bpe.py)
- [Modelo base `nvidia/parakeet-tdt-0.6b-v3` en HuggingFace](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
