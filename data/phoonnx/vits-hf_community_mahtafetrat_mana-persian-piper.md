# Phoonnx/vits-hf_community_MahtaFetrat_Mana-Persian-Piper

## Resumen

`Phoonnx/vits-hf_community_MahtaFetrat_Mana-Persian-Piper` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX y distribuido a través de la librería `phoonnx`. Se trata de un espejo (mirror) de una voz Piper en persa procedente del repositorio original `MahtaFetrat/Mana-Persian-Piper`, reempaquetada dentro del repositorio agregador `Phoonnx/phoonnx-vits` en la carpeta `hf_community__MahtaFetrat__Mana-Persian-Piper`. El modelo está pensado para su uso con el motor de inferencia [phoonnx](https://github.com/TigreGotico/phoonnx), una implementación orientada a ejecutar voces Piper mediante ONNX Runtime.

El modelo resuelve el problema de la síntesis de voz en persa (farsi) en entornos donde se prefiere un runtime ONNX ligero frente a frameworks de deep learning completos. Con un tamaño de repositorio de aproximadamente 0,1 GB, es adecuado para despliegues en CPU y dispositivos con recursos limitados, si bien no se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la información proporcionada.

La relevancia actual del modelo radica en su carácter de componente reutilizable dentro del ecosistema Piper/phoonnx: otras voces del repositorio agregador pueden reutilizar estos ficheros, y su licencia MIT facilita la integración en productos comerciales. No obstante, la documentación disponible es mínima y no incluye especificaciones técnicas detalladas ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (formato ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | persa (farsi), según el nombre del modelo y la voz de origen |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un predictor de duración basado en flujo normalizador, un decodificador generativo y un discriminador adversarial multiperiodo durante el entrenamiento. VITS produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

El modelo se distribuye como exportación ONNX para su ejecución con el motor phoonnx, que actúa como runtime compatible con voces Piper. No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable habitualmente en TTS) ni innovaciones técnicas específicas más allá de la propia arquitectura VITS y su empaquetado ONNX.

## Capacidades

- Síntesis de voz (text-to-speech) en persa a partir de texto de entrada.
- Generación de audio mediante la arquitectura VITS con salida directa de forma de onda.
- Ejecución en formato ONNX, compatible con el motor phoonnx y potencialmente con ONNX Runtime.
- Reutilización de ficheros por parte de otras voces del repositorio agregador `Phoonnx/phoonnx-vits`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento (thinking mode). Es un modelo exclusivamente TTS.
- Capacidades multilingües: no disponibles; el modelo está orientado al persa.

## Casos de uso

- Lectura de contenido web en persa: el modelo puede convertir artículos o textos en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando su formato ONNX ligero para ejecutarse en servidores modestos.
- Asistentes de voz en persa: integración en pipelines de atención al cliente o asistentes conversacionales que requieran una voz sintética en farsi, con despliegue en CPU mediante ONNX Runtime.
- Audiolibros y narración automatizada: generación de audio a partir de textos largos en persa, con la ventaja de un tamaño de modelo reducido (~0,1 GB) que facilita el procesamiento por lotes.
- Sistemas de navegación y avisos hablados: síntesis de instrucciones cortas en persa para aplicaciones de movilidad o domótica, donde la baja latencia de VITS es adecuada.
- Localización de contenidos multimedia: doblaje o sustitución de voz en vídeos educativos o corporativos dirigidos a audiencias persófonas.
- Prototipado e investigación en TTS: uso como voz de referencia Piper en experimentos con el motor phoonnx, gracias a su licencia MIT y a su formato ONNX estandarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) y la arquitectura VITS, es esperable que quepa en GPUs con muy poca memoria, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se aportan datos oficiales.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño reducido del modelo, pero no se dispone de confirmación en la información proporcionada.
- Opciones de despliegue: motor phoonnx (runtime principal), ONNX Runtime; compatibilidad con Piper no confirmada explícitamente en la documentación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| vits-hf_community_MahtaFetrat_Mana-Persian-Piper (este) | VITS | Persa | MIT | ONNX | ~0,1 GB |
| MahtaFetrat/Mana-Persian-Piper (origen) | VITS (Piper) | Persa | no disponible en la información | Piper (ONNX) | no disponible |
| Otras voces Piper del repositorio phoonnx-vits | VITS | Varios (p. ej., twi, chichewa, makhuwa) | Variable por subcarpeta | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información técnica muy limitada: no se documentan parámetros, contexto, datos de entrenamiento ni evaluación, lo que dificulta valorar su calidad objetiva.
- Riesgo de artefactos y alucinaciones acústicas: como todo modelo TTS, puede generar pronunciaciones incorrectas o ruidos ante texto fuera de dominio, aunque no se documenta específicamente.
- Cobertura lingüística restringida al persa; no se garantiza un comportamiento correcto con texto en otros idiomas o con transliteraciones.
- La model card advierte que la licencia se hereda del repositorio de origen y que algunas voces del agregador (no esta necesariamente) carecen de licencia declarada; conviene revisar el README de la carpeta de origen antes de un uso comercial.
- Sin datos de sesgos: no se dispone de análisis de sesgos de género, dialecto o prosodia en la información proporcionada.
- El modelo no incluye identificadores de voz propios en phoonnx; otras voces del repositorio reutilizan estos ficheros, lo que puede generar confusión sobre su procedencia.
- Para producción, es recomendable validar la calidad de audio (MOS) y la inteligibilidad en el dominio concreto de uso, dado que no hay benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_MahtaFetrat_Mana-Persian-Piper
- Repositorio agregador de voces: https://huggingface.co/Phoonnx/phoonnx-vits
- Motor phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio de origen de la voz (referencia en la model card): https://github.com/michsethowusu/kasanoma (solo como referencia de licencias del agregador; no es el origen directo de esta voz persa)
- Voz de origen Piper: MahtaFetrat/Mana-Persian-Piper (no se proporciona URL directa en la información disponible)
