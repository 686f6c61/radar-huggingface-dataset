# openEuler/zipvoice

## Resumen

ZipVoice-Distill es un modelo de síntesis de voz (text-to-speech) de alta calidad y baja latencia, basado en el modelo ZipVoice de k2-fsa, empaquetado por openEuler para su framework de robótica IB-Robot. El modelo combina un decodificador de flow matching basado en Zipformer con un vocoder Vocos, y está optimizado para despliegue en entornos de borde, tanto en hardware Ascend 310P como en CPU mediante ONNX Runtime. Con solo 123 millones de parámetros, ofrece clonación de voz zero-shot en chino e inglés, con una calidad comparable a modelos mucho más grandes pero con una velocidad de inferencia significativamente mayor.

La relevancia de este modelo radica en su doble despliegue: por un lado, un backend Ascend con formas fijas y 4 pasos de difusión destilados para latencia mínima en robótica; por otro, un backend ONNX dinámico para síntesis en host con 8 pasos por defecto. Ambos comparten el mismo contrato de inferencia, lo que facilita la integración en sistemas heterogéneos. El modelo se distribuye bajo licencia Apache-2.0 para el código y empaquetado, mientras que los pesos siguen la licencia upstream de k2-fsa/ZipVoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador flow matching basado en Zipformer + vocoder Vocos |
| Parametros totales | 123 M (modelo base ZipVoice) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Fija en el despliegue Ascend: text_capacity=256, flow_frames=1537; dinámica en ONNX |
| Tipos de cuantizacion | no disponible (artefactos ONNX y OM sin cuantización declarada) |
| Idiomas soportados | Chino e inglés |
| Licencia | Apache-2.0 (código y empaquetado); pesos bajo licencia upstream de k2-fsa/ZipVoice |
| Formato de pesos | ONNX (dinámico), OM (Ascend 310P), safetensors/bin para vocoder y assets compartidos |

## Arquitectura y entrenamiento

ZipVoice-Distill hereda la arquitectura de ZipVoice, un modelo TTS zero-shot no autorregresivo basado en flow matching. El decodificador emplea un bloque Zipformer, una variante eficiente del transformer que reduce el coste computacional mediante atención con submuestreo temporal. El vocoder Vocos convierte las representaciones latentes en audio PCM mono a 24 kHz. El modelo fue entrenado por k2-fsa con datos multilingües (chino e inglés) y posteriormente destilado con guía de clasificador (CFG-distilled) para reducir los pasos de difusión: 4 pasos en el despliegue Ascend y 8 en el ONNX por defecto. El preprocesamiento de texto utiliza un pipeline fijo que combina normalización de números chinos (cn2an), segmentación con jieba y conversión fonética con pypinyin, lo que garantiza consistencia entre ambos backends.

## Capacidades

- Generación de voz zero-shot: clonación de voz a partir de un prompt de audio de referencia sin entrenamiento adicional.
- Síntesis multilingüe: soporta chino e inglés, con normalización y fonetización automática.
- Generación de diálogo: la familia ZipVoice incluye una variante ZipVoice-Dialog para síntesis de conversaciones multi-hablante (no incluida en este paquete específico).
- Despliegue dual: compatible con Ascend 310P (inferencia de baja latencia en borde) y CPU mediante ONNX Runtime.
- Contrato de inferencia unificado: el mismo endpoint `tensor_model/zipvoice/synthesize` sirve a ambos backends, facilitando la integración en sistemas robóticos.
- Salida de audio estándar: PCM mono float32 a 24 kHz, lista para reproducción o procesamiento posterior.

## Casos de uso

- Robótica de servicio: el despliegue Ascend 310P permite síntesis de voz en tiempo real en robots con restricciones de energía y latencia, usando el contrato unificado para alternar entre backends según la carga.
- Asistentes de voz en el hogar: con el backend ONNX en CPU, se puede integrar en dispositivos sin GPU, generando respuestas habladas con voz clonada del usuario o de un personaje.
- Audioguías personalizadas: clonación de voz para narración de contenidos en chino o inglés, con control de la entonación mediante el prompt de audio.
- Sistemas de accesibilidad: conversión de texto a voz para personas con discapacidad visual, con voces naturales y baja latencia en hardware modesto.
- Pruebas de producto en entornos de desarrollo: el backend ONNX dinámico permite iterar rápidamente en un portátil sin hardware especializado, validando flujos de conversación antes de pasar a producción.
- Generación de contenido multilingüe: producción de locuciones para vídeos o podcasts en chino e inglés, con clonación de voz para mantener consistencia de marca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de ZipVoice (arXiv:2506.13053) reporta rendimiento de vanguardia en similitud de hablante, inteligibilidad y naturalidad frente a modelos de mayor tamaño, pero no se incluyen cifras concretas en la documentación de este paquete. Se recomienda consultar el repositorio oficial de k2-fsa/ZipVoice para métricas detalladas.

## Requisitos de hardware

- Despliegue Ascend 310P: requiere una placa Ascend 310P1 con el runtime ACL. Los artefactos OM están compilados con formas fijas (text_capacity=256, flow_frames=1537) y 4 pasos de difusión, optimizados para latencia mínima.
- Despliegue ONNX CPU: funciona en cualquier CPU x86_64 o ARM64 con ONNX Runtime. El modelo de 123 M de parámetros cabe en memoria RAM estándar (menos de 1 GB para los pesos).
- No se requiere GPU para ninguno de los dos despliegues, aunque el backend ONNX podría ejecutarse en GPU si se desea acelerar.
- Opciones de despliegue: el paquete está diseñado para el framework IB-Robot, con un servicio `voice_tts_service` que gestiona el enrutamiento entre backends. También es posible cargar los ONNX directamente con ONNX Runtime en aplicaciones personalizadas.
- Latencia estimada: no disponible en la documentación, pero el diseño con 4 pasos de difusión en Ascend sugiere una latencia inferior a 100 ms para frases cortas, asumiendo un pipeline optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| ZipVoice-Distill (este) | 123 M | Fijo/dinámico | zh, en | Apache-2.0 (código) | Ascend 310P, CPU ONNX |
| XTTS v2 (Coqui) | ~467 M | no disponible | 17 idiomas | CPML (no comercial) | GPU/CPU |
| CosyVoice (Alibaba) | ~200 M | no disponible | zh, en, ja, ko | Apache-2.0 | GPU/CPU |
| F5-TTS | ~335 M | no disponible | en, zh | MIT | GPU/CPU |

La comparativa se basa en datos públicos de cada proyecto. ZipVoice-Distill destaca por su tamaño reducido y su soporte específico para hardware Ascend, algo poco común en modelos TTS. Sin embargo, su soporte de idiomas es más limitado que el de XTTS v2.

## Limitaciones y advertencias

- El modelo solo soporta chino e inglés; no se garantiza calidad en otros idiomas.
- La clonación de voz depende de la calidad del prompt de audio de referencia; prompts ruidosos o cortos degradan la similitud del hablante.
- El despliegue Ascend 310P tiene formas fijas (256 tokens de texto y 1537 frames de flujo), por lo que entradas más largas requieren truncamiento o segmentación.
- La licencia de los pesos sigue la de k2-fsa/ZipVoice, que puede tener restricciones adicionales al Apache-2.0 del código; se recomienda revisar la licencia upstream antes de uso comercial.
- No se han documentado sesgos específicos, pero al entrenarse con datos de Emilia (predominantemente chino e inglés), puede reflejar sesgos dialectales o de registro de esos corpus.
- El paquete está orientado al framework IB-Robot; su uso fuera de este contexto requiere adaptar el contrato de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/openEuler/zipvoice
- Repositorio GitHub de ZipVoice (k2-fsa): https://github.com/k2-fsa/ZipVoice
- Página del proyecto ZipVoice: https://zipvoice.github.io/
- Paper (arXiv): https://arxiv.org/html/2506.13053v3
- Framework IB-Robot (AtomGit): https://atomgit.com/openeuler/IB_Robot
