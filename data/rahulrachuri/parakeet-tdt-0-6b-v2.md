# rahulrachuri/parakeet-tdt-0.6b-v2

## Resumen

Parakeet TDT 0.6B v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, especializado en transcripción de inglés. Esta versión concreta, publicada por rahulrachuri, es una conversión del checkpoint oficial .nemo al formato Hugging Face transformers con pesos en safetensors, lo que permite su uso fuera del ecosistema NeMo. El modelo original se distribuye únicamente como checkpoint .nemo, por lo que esta conversión cubre un hueco importante para quienes trabajan con la librería transformers.

Con 617,9 millones de parámetros (~0,6B), el modelo emplea una arquitectura TDT (Token-and-Duration Transducer) con encoder FastConformer y front end de 128 canales mel. Es la versión más precisa de la familia Parakeet para inglés: la v3, su hermana multilingüe, sacrifica precisión en inglés para ampliar la cobertura de idiomas. El autor ha verificado que la decodificación greedy coincide token a token con la referencia NeMo, y ha documentado un port para Apple Silicon que alcanza 291x tiempo real en Mac y 209x en iPhone.

La relevancia de este modelo reside en su equilibrio entre precisión y eficiencia: un modelo de 0,6B que cubre la mayoría de casos de uso de transcripción en inglés con requisitos de hardware modestos, apto para despliegue en edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con encoder FastConformer |
| Parametros totales | 617.875.078 (~0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio hasta 24 minutos con atención completa (A100 80GB); hasta 3 horas con atención local |
| Tipos de cuantizacion | no disponible (pesos originales en fp32; repo de 2,5 GB) |
| Idiomas soportados | inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura TDT (Token-and-Duration Transducer), una variante del transductor RNN-T que predice simultáneamente tokens y duraciones. El encoder es un FastConformer con front end de 128 canales mel y preénfasis de 0,97; la activación conjunta (joint) es ReLU. El espacio de IDs del vocabulario es de 1025 (blank_token
