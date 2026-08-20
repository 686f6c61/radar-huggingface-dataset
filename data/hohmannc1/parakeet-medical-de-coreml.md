# hohmannc1/parakeet-medical-de-coreml

## Resumen

El modelo `hohmannc1/parakeet-medical-de-coreml` es una conversión a CoreML (formato de Apple) del modelo de reconocimiento automático de voz (ASR) `Mediform/parakeet-medical-de`, un finetune en alemán del modelo `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. El resultado es un sistema de transcripción de voz especializado en terminología médica, optimizado para ejecutarse localmente en dispositivos Apple (iOS 17+ y macOS 14+) mediante la Apple Neural Engine (ANE). La conversión se realizó con la pipeline `FluidInference/mobius` y está pensada para integrarse en la librería `FluidAudio`, que permite dictado offline sin conexión a servidores.

El modelo resuelve el problema de la transcripción médica en alemán con privacidad y baja latencia, al ejecutarse completamente en el dispositivo. Su relevancia radica en que combina un modelo ASR de última generación (Parakeet TDT, 0.6B parámetros) con un formato nativo para hardware Apple, lo que lo hace adecuado para aplicaciones de salud, consultas médicas y documentación clínica. La licencia Apache 2.0 permite uso comercial sin restricciones, y el repositorio incluye los componentes necesarios (preprocesador, encoder, decoder y vocabulario) en formato `.mlmodelc`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Transducer (TDT) basado en Parakeet (NVIDIA) |
| Parametros totales | 0.6B (segun el nombre del modelo base `parakeet-tdt-0.6b-v3`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (para CoreML) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v3` es un ASR basado en la arquitectura Transformer Transducer (TDT), que combina un encoder y un decoder en un solo modelo para transcripcion de voz en tiempo real. `Mediform/parakeet-medical-de` es un finetune de este modelo con datos medicos en aleman, aunque no se especifican los detalles del dataset ni el proceso de entrenamiento (numero de tokens, composicion, tecnicas de alineacion). La conversion a CoreML se realizo con la pipeline `FluidInference/mobius`, que descompone el modelo en componentes separados (`Preprocessor`, `Encoder`, `Decoder`, `JointDecisionv3`) y los exporta en precision FP16 para optimizar su ejecucion en la Apple Neural Engine. No se dispone de informacion sobre el uso de RLHF, DPO u otras tecnicas de post-entrenamiento.

## Capacidades

- Reconocimiento automatico de voz (ASR) en aleman, especializado en vocabulario medico (terminos clinicos, farmacologicos, diagnosticos).
- Transcripcion de audio en tiempo real o por lotes, dependiendo de la integracion.
- Ejecucion completamente offline en dispositivos Apple (iOS 17+ y macOS 14+), sin necesidad de conexion a internet.
- Compatible con la libreria `FluidAudio` para integracion en aplicaciones nativas de Apple.
- No incluye capacidades de tool calling, generacion de texto, vision ni agentes; es exclusivamente un modelo de transcripcion de voz.

## Casos de uso

- Dictado de informes medicos en consulta: un medico puede dictar el resumen de una visita y el modelo transcribe la terminologia medica en aleman con alta precision, ahorrando tiempo de documentacion.
- Transcripcion de conversaciones medico-paciente: grabar y transcribir consultas para generar historiales clinicos automaticos, manteniendo la privacidad al procesarse localmente.
- Integracion en apps de salud para iOS: desarrolladores pueden incorporar el modelo en aplicaciones de seguimiento de pacientes o telemedicina, ofreciendo dictado de sintomas o prescripciones.
- Asistente de documentacion clinica para profesionales: el modelo puede usarse en dispositivos moviles para transcribir notas de voz en entornos hospitalarios, donde la conexion a internet puede ser limitada.
- Accesibilidad para profesionales con discapacidad motora: permite dictar texto en lugar de escribir, facilitando la generacion de documentacion medica.
- Uso en entornos con requisitos estrictos de privacidad: al no enviar audio a servidores externos, es adecuado para hospitales y clinicas que manejan datos sensibles de pacientes (cumplimiento de GDPR).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de WER (Word Error Rate) ni comparaciones con otros modelos ASR en aleman.

## Requisitos de hardware

- Dispositivos Apple con iOS 17+ o macOS 14+ (iPhone, iPad, Mac con Apple Silicon).
- Requiere Apple Neural Engine (ANE) para ejecucion optima; en Macs con Apple Silicon, tambien puede usar la GPU integrada.
- No requiere GPU dedicada ni VRAM tradicional, ya que la inferencia se realiza en la NPU del dispositivo.
- El tamano del repositorio es de 1.1 GB, lo que implica un uso de almacenamiento moderado en el dispositivo.
- Despliegue mediante la libreria `FluidAudio` (para iOS/macOS) o integracion directa con los `.mlmodelc` generados.
- No se dispone de datos de latencia o throughput especificos, pero al ejecutarse en ANE se espera una latencia baja para transcripcion en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo se basa en `nvidia/parakeet-tdt-0.6b-v3`, que es un ASR generico en ingles, pero el finetune en aleman medico lo hace especifico para ese dominio. Alternativas como Whisper (de OpenAI) o modelos ASR en aleman de otras companias podrian ser comparables, pero no hay datos de rendimiento disponibles para establecer una comparacion objetiva.

## Limitaciones y advertencias

- El modelo esta especializado en aleman medico; su rendimiento en vocabulario general o en otros idiomas puede ser significativamente inferior.
- Al ser un modelo de 0.6B parametros, puede tener limitaciones en la precision de terminos muy especificos o en acentos regionales del aleman.
- La conversion a FP16 puede introducir una ligera perdida de precision en comparacion con el modelo original en FP32, aunque en la practica suele ser despreciable para ASR.
- Requiere hardware Apple con iOS 17+ o macOS 14+; no es compatible con otras plataformas (Android, Windows, Linux) sin una conversion adicional.
- No se han publicado evaluaciones independientes de sesgos o alucinaciones; como todo modelo ASR, puede producir errores de transcripcion en audio con ruido o habla superpuesta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `nvidia/parakeet-tdt-0.6b-v3` tiene su propia licencia (tambien Apache 2.0), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- [Modelo en HuggingFace: hohmannc1/parakeet-medical-de-coreml](https://huggingface.co/hohmannc1/parakeet-medical-de-coreml)
- [Modelo base: Mediform/parakeet-medical-de](https://huggingface.co/Mediform/parakeet-medical-de)
- [Modelo original de NVIDIA: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Pipeline de conversion: FluidInference/mobius](https://github.com/FluidInference/mobius)
- [Libreria FluidAudio](https://github.com/FluidInference/FluidAudio)
- [Organizacion Mediform en HuggingFace](https://huggingface.co/Mediform/models)
- [Proyecto parakeet-coreml (para Node.js en Apple Silicon)](https://github.com/sebastian-software/parakeet-coreml)
- [Lista de modelos CoreML (Awesome-CoreML-Models)](https://github.com/likedan/Awesome-CoreML-Models)
