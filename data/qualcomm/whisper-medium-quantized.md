# qualcomm/Whisper-Medium-Quantized

## Resumen

Whisper-Medium-Quantized es una version optimizada para dispositivos Qualcomm del conocido modelo de reconocimiento automatico del habla (ASR) Whisper Medium. Lo publica Qualcomm en su organizacion de HuggingFace y forma parte del catalogo Qualcomm AI Hub Models, orientado a desplegar modelos de IA directamente en el hardware de la compania (Snapdragon y Dragonwing). El objetivo es claro: llevar un sistema de transcripcion de voz a texto de calidad a telefonos moviles, portatiles y plataformas embebidas sin depender de la nube.

Tecnicamente, se trata de un transformer encoder-decoder de tipo Whisper al que se le ha aplicado cuantizacion w8a16 (pesos de 8 bits, activaciones de 16 bits) y varias reescrituras estructurales para mejorar la eficiencia: la atencion multi-cabeza (MHA) se sustituye por atencion de una sola cabeza (SHA) y las capas lineales se reemplazan por capas convolucionales. El modelo esta pensado para transcripcion de formato largo por segmentos de hasta 30 segundos y muestra un comportamiento robusto en entornos con ruido, segun el propio autor.

Su relevancia actual radica en el despliegue en el borde: Qualcomm distribuye artefactos precompilados en formato QNN ONNX listos para ejecutarse en una amplia gama de chipsets (Snapdragon 8 Elite Gen 5, Snapdragon X2 Elite, Snapdragon 8 Gen 3, Dragonwing QCS6490, entre otros), con la posibilidad de reexportar configuraciones personalizadas mediante la libreria Qualcomm AI Hub Models. La licencia Apache 2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper); MHA sustituida por Single-Head Attention (SHA) y capas lineales por convoluciones para inferencia en el borde |
| Parametros totales | Aproximadamente 769 millones (heredados del modelo base Whisper Medium); no confirmado explicitamente en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Segmentos de audio de hasta 30 segundos por transcripcion |
| Tipos de cuantizacion | w8a16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Whisper es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (libreria declarada) y artefactos precompilados QNN ONNX para el runtime de Qualcomm |

## Arquitectura y entrenamiento

El modelo parte del diseno Whisper de tipo transformer encoder-decoder y mantiene la logica general de transcripcion por ventanas de 30 segundos, con una marca de tiempo de primer token asociada a la latencia del encoder y latencias posteriores asociadas al decoder. La model card no detalla el proceso de entrenamiento propio (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos deben considerarse no disponibles; lo que si se especifica es que se ha reutilizado la implementacion de Whisper disponible en la libreria `transformers` (version 4.42.3).

La innovacion principal no esta en el entrenamiento, sino en la optimizacion para inferencia en el borde. Qualcomm aplica cuantizacion w8a16 y reestructura el modelo sustituyendo la atencion multi-cabeza por atencion de una sola cabeza y las capas lineales por convoluciones. Estas transformaciones buscan reducir el coste computacional y de memoria para que el modelo pueda ejecutarse en la NPU/GPU de los chipsets Qualcomm. Los artefactos finales se compilan, perfilan y evaluan a traves de Qualcomm AI Hub Workbench.

## Capacidades

- Transcripcion automatica de voz a texto (ASR) en segmentos de audio de hasta 30 segundos.
- Transcripcion de formato largo mediante segmentacion, segun el propio autor.
- Rendimiento robusto en entornos realistas con ruido.
- Inferencia en el dispositivo (on-device), sin necesidad de conexion a la nube.
- Despliegue mediante la Qualcomm Voice AI SDK y artefactos QNN ONNX precompilados.
- Soporte multilingue: no confirmado en la informacion proporcionada (el modelo base Whisper lo es, pero la model card no lo detalla).
- Tool calling, function calling, agentes, vision o audio adicional: no disponibles en la informacion proporcionada.

## Casos de uso

- Transcripcion en movil sin conexion: al ejecutarse sobre la NPU de un Snapdragon, permite dictado y transcripcion de notas de voz en el propio dispositivo, preservando la privacidad del audio y evitando costes de red.
- Subtitulado en tiempo real de reuniones: el modelo puede procesar segmentos de hasta 30 segundos, adecuado para generar subtitulos por bloques en aplicaciones de videoconferencia que se ejecutan en hardware embebido.
- Asistentes de voz para automocion y dispositivos IoT: integrable mediante la Qualcomm Voice AI SDK en plataformas Dragonwing (QCS6490, QCS8550, IQ-9075), donde la latencia baja y el consumo contenido son criticos.
- Transcripcion en portatiles con Snapdragon X Elite o X2 Elite: permite funcionalidades de dictado y accesibilidad dentro de aplicaciones nativas de Windows on ARM sin depender de servicios externos.
- Post-procesado de grabaciones de campo en dispositivos moviles: util para periodistas, investigadores o tecnicos que necesitan transcribir audio en zonas sin cobertura, con el modelo funcionando localmente.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion on-device posibilita subtitulado continuo y de baja latencia en aplicaciones de asistencia personal sin enviar datos a servidores.
- Integracion en pipelines de transcripcion por lotes en el borde: al poder reexportar configuraciones con la libreria AI Hub Models, se puede ajustar el modelo a un chipset concreto para despliegues de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de "performance summary" y la evaluacion mediante Qualcomm AI Hub Workbench, pero no se incluyen cifras concretas (WER, latencias, throughput) en los datos proporcionados.

## Requisitos de hardware

- Disenado especificamente para hardware Qualcomm: Snapdragon 8 Elite Gen 5 For Galaxy, Snapdragon 8 Elite For Galaxy, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Snapdragon 7 Gen 4, Dragonwing QCS6490, Dragonwing IQ-8275, Dragonwing QCS8550 (proxy), Dragonwing Q-6690 e IQ-9075.
- No esta orientado a GPU de escritorio convencionales (A100, H100, RTX 4090): su formato de despliegue principal son artefactos QNN ONNX para el runtime de Qualcomm.
- Runtime y versiones: QAIRT 2.50 y ONNX Runtime 1.30.0.
- Precision de despliegue: w8a16.
- Latencia: no disponible en la informacion proporcionada; la model card distingue entre latencia del encoder (primer token) y del decoder (tokens adicionales), pero no aporta cifras.
- Opciones de despliegue: Qualcomm Voice AI SDK (disponible en Qualcomm Package Manager) y la libreria Qualcomm AI Hub Models para exportar configuraciones personalizadas.
- VRAM estimada: no aplica en el sentido tradicional (el modelo se ejecuta en el subsistema de IA de los chipsets moviles); no se proporcionan cifras de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper-Medium-Quantized (Qualcomm) | ~769 M (base) | Segmentos de 30 s | ASR optimizado para el borde, cuantizacion w8a16, artefactos QNN ONNX | Apache 2.0 | HuggingFace (qualcomm) y Qualcomm AI Hub |
| Whisper Medium (OpenAI) | ~769 M | Segmentos de 30 s | ASR transformer sin optimizar para el borde | MIT | HuggingFace / OpenAI |
| Whisper Large-v3 (OpenAI) | ~1.550 M | Segmentos de 30 s | ASR de mayor tamano y precision | MIT | HuggingFace / OpenAI |
| Whisper Small (OpenAI) | ~244 M | Segmentos de 30 s | ASR ligero, menor precision | MIT | HuggingFace / OpenAI |

Nota: los datos de los modelos de referencia (parametros, licencia) corresponden a informacion publica ampliamente documentada sobre la familia Whisper; los de este modelo se basan en los datos proporcionados. No se dispone de comparativas de rendimiento (WER) en la informacion facilitada.

## Limitaciones y advertencias

- Al estar cuantizado a w8a16 y con MHA reemplazada por SHA y capas lineales por convoluciones, es probable que exista una degradacion de precision frente al Whisper Medium original; la model card no cuantifica esa perdida de calidad.
- No se especifican los idiomas soportados en la model card; aunque Whisper es multilingue, debe verificarse el comportamiento real por idioma antes de usarlo en produccion.
- La ventana de contexto esta limitada a segmentos de 30 segundos; la transcripcion de audio largo requiere segmentacion externa y puede introducir cortes o perdida de coherencia entre bloques.
- Riesgo de alucinacion en audio con mucho ruido, silencios largos o habla poco clara: como todo modelo Whisper, puede generar texto plausible pero incorrecto.
- Los artefactos precompilados estan atados a chipsets concretos y a versiones especificas de QAIRT y ONNX Runtime; un cambio de hardware o de version del runtime puede exigir recompilacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del SDK de Qualcomm (Qualcomm Voice AI SDK) si se distribuye en un producto final.
- No se han publicado resultados de benchmarks ni metricas de latencia o throughput, lo que dificulta estimar el rendimiento real antes del despliegue.
- No se documentan sesgos conocidos; al ser un modelo de ASR, puede heredar sesgos acusticos o dialectales del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Whisper-Medium-Quantized
- Implementacion de Whisper en transformers usada como base: https://github.com/huggingface/transformers/tree/v4.42.3/src/transformers/models/whisper
- Libreria Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/whisper_medium_quantized
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
- Qualcomm Package Manager (Voice AI SDK): https://qpm.qualcomm.com/#/main/tools/details/VoiceAI_ASR
- Imagen de demostracion del modelo: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/whisper_medium_quantized/web-assets/model_demo.png
- Sitio oficial de Qualcomm: https://www.qualcomm.com/
