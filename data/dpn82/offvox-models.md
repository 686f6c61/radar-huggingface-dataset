# Dpn82/offvox-models

## Resumen

`Dpn82/offvox-models` no es un modelo entrenado por su autor, sino un repositorio espejo (mirror) que agrupa los pesos de varios modelos que consume la aplicación OffVox, una app de diario y transcripción de reuniones por voz que funciona íntegramente en local. El repositorio existe como copia de seguridad ante posibles cambios o desapariciones de las ubicaciones originales y declara explícitamente no ser un repositorio oficial de OpenAI, NVIDIA, Google ni Alibaba.

El contenido es heterogéneo: por un lado hay modelos de reconocimiento automático de voz (ASR) exportados a ONNX int8 por sherpa-onnx (Whisper tiny/base/small de OpenAI, Parakeet TDT 0.6B v3 de NVIDIA), un modelo de identificación de hablante (TitaNet-small de NVIDIA) y dos modelos de lenguaje en formato LiteRT-LM para inferencia en dispositivo (Gemma 4 E2B IT de Google DeepMind y Qwen2.5 1.5B Instruct de Alibaba Cloud).

La relevancia de este repositorio es práctica, no investigadora: sirve como fuente estable de artefactos binarios con hashes SHA-256 verificados para construir pipelines de voz 100 % offline en dispositivos de borde. No aporta arquitecturas ni entrenamientos nuevos, y sus licencias son múltiples (MIT, Apache-2.0, CC BY 4.0 y Gemma 4 license), por lo que su uso comercial depende del componente concreto que se utilice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio mixto: Whisper (encoder-decoder transformer), Parakeet TDT (FastConformer-Transducer), TitaNet (speaker embedding), Gemma 4 E2B y Qwen2.5 1.5B (transformer decoder-only) |
| Parametros totales | No disponible como cifra agregada; por componente: Whisper tiny ~39M, base ~74M, small ~244M; Parakeet TDT 0.6B ~600M; TitaNet-small no disponible; Gemma 4 E2B no disponible; Qwen2.5 1.5B ~1.5B |
| Parametros activos | No disponible (Gemma 4 E2B es presumiblemente MoE por la nomenclatura "E2B", pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | No disponible para los modelos ASR; Qwen2.5 1.5B LiteRT-LM con kv cache de 4096 tokens segun el nombre del fichero (`ekv4096`); Gemma 4 E2B no disponible |
| Tipos de cuantizacion | ONNX int8 (Whisper, Parakeet, TitaNet); LiteRT-LM con cuantizacion q8 en Qwen2.5; Gemma 4 E2B en formato `.litertlm` sin detalle de cuantizacion |
| Idiomas soportados | No disponible de forma explicita; Whisper es multilingue por diseno, Parakeet TDT 0.6B v3 se distribuye como modelo en ingles (prefijo `nemo_en_` en TitaNet), Qwen2.5 es multilingue |
| Licencia | Multiple: MIT (Whisper), CC BY 4.0 (Parakeet), Apache-2.0 (TitaNet, Qwen2.5), Gemma 4 license (Gemma 4 E2B) |
| Formato de pesos | ONNX (`.onnx`) para ASR y speaker embedding; `.litertlm` para los LLM; `tokens.txt` para vocabularios |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio ni fine-tuning: es una copia byte a byte de artefactos publicados por terceros, con hashes SHA-256 que el autor afirma idénticos a los originales. Cada componente conserva la arquitectura de su modelo fuente. Whisper emplea un transformer encoder-decoder con atención multitarea (transcripción, traducción, detección de idioma) entrenado por OpenAI sobre audio débilmente supervisado a gran escala. Parakeet TDT 0.6B v3 es un modelo FastConformer con decodificador Transducer (Token-and-Duration Transducer) de NVIDIA NeMo, exportado a ONNX int8 por sherpa-onnx. TitaNet-small es un extractor de embeddings de hablante basado en NeMo. Gemma 4 E2B IT y Qwen2.5 1.5B Instruct son LLM decoder-only convertidos a LiteRT-LM para ejecución en dispositivo (móvil, edge) con cuantizacion q8 y ventana de kv cache de 4096 tokens en el caso de Qwen.

No se proporcionan detalles sobre volumen de tokens de entrenamiento, composición de datasets ni procesos de alineación (RLHF/DPO) en la información disponible; esos datos corresponden a las model cards originales de cada modelo fuente, no a este mirror. La innovación técnica relevante aquí es el empaquetado: modelos ASR listos para usar sin descomprimir y LLM en formato LiteRT-LM optimizado para inferencia local en hardware modesto.

## Capacidades

- Reconocimiento automático de voz (ASR) offline con Whisper tiny, base y small en tres niveles de precisión/velocidad.
- ASR de mayor calidad con Parakeet TDT 0.6B v3 (int8, orientado a inglés).
- Identificación y verificación de hablante mediante embeddings de TitaNet-small (diarización, "quién habla").
- Generación de texto y razonamiento con Gemma 4 E2B IT y Qwen2.5 1.5B Instruct en formato LiteRT-LM.
- Ejecución 100 % local en dispositivo, sin dependencia de APIs en la nube (objetivo declarado de la app OffVox).
- Integración con el ecosistema sherpa-onnx para pipelines de voz (VAD, ASR, speaker ID).
- Soporte de instrucciones (variantes `-it` / `-Instruct`) en los dos LLM incluidos.
- Capacidades multilingües heredadas de Whisper y Qwen2.5 (no confirmadas de forma explícita en la model card de este repositorio).
- No se documenta soporte de tool calling, function calling, agentes ni visión en la información proporcionada.

## Casos de uso

- Transcripción de reuniones en local: combinar Whisper small o Parakeet TDT 0.6B v3 con sherpa-onnx para generar actas sin enviar audio a la nube, aprovechando el formato ONNX int8 listo para usar.
- Diarización de hablantes en grabaciones: usar TitaNet-small para extraer embeddings por segmento y agrupar intervenciones, útil en entrevistas y reuniones multiparticipante.
- Dictado por voz en aplicaciones móviles: Whisper tiny/base en ONNX int8 permite transcripción en tiempo real en dispositivos con recursos limitados.
- Asistente conversacional offline: Qwen2.5 1.5B Instruct en LiteRT-LM con kv cache de 4096 tokens para resúmenes de notas o respuestas a preguntas sobre el diario personal, sin salida a Internet.
- Resumen y extracción de acciones de transcripciones: encadenar ASR + LLM local (Gemma 4 E2B o Qwen2.5 1.5B) para condensar reuniones en puntos clave y tareas asignadas.
- Verificación de integridad en despliegues: usar los hashes SHA-256 publicados para validar artefactos en pipelines de CI/CD antes de empaquetar la app.
- Prototipado de pipelines de voz en edge: sherpa-onnx + estos modelos permiten montar un stack ASR + speaker ID + LLM sin GPU dedicada, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni evaluaciones comparativas; solo hashes SHA-256 de integridad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por tamaño, Whisper tiny/base/small int8 y TitaNet-small caben en pocos cientos de MB; Parakeet TDT 0.6B int8 en torno a 1 GB o menos; Qwen2.5 1.5B q8 en torno a 1,5-2 GB; Gemma 4 E2B no disponible.
- GPU recomendadas: no especificadas. Los modelos ONNX pueden ejecutarse en CPU; los `.litertlm` están pensados para aceleradores en dispositivo (CPU, GPU móvil, NPU) mediante LiteRT.
- Cabe en GPU de consumo: sí, previsiblemente todos los componentes en GPUs de gama media (p. ej. RTX 3060 en adelante), aunque no hay cifras oficiales en la información proporcionada.
- Opciones de despliegue: sherpa-onnx (ASR y speaker ID), runtime LiteRT-LM (LLM), ONNX Runtime para los modelos `.onnx`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dpn82/offvox-models (este repo) | Mirror multi-modelo | Variable por componente | 4096 (Qwen2.5 LiteRT-LM) | Multiple | HuggingFace, 5,5 GB, 10 descargas |
| openai/whisper-small | ASR | ~244M | No aplica | MIT | HuggingFace, ampliamente usado |
| nvidia/parakeet-tdt-0.6b-v3 | ASR | ~600M | No aplica | CC BY 4.0 | HuggingFace, oficial NVIDIA |
| Qwen/Qwen2.5-1.5B-Instruct | LLM | ~1,5B | 32K (original) | Apache-2.0 | HuggingFace, oficial Alibaba |

La diferencia clave es que este repositorio no compite con esos modelos: los redistribuye en formatos optimizados (ONNX int8, LiteRT-LM) para inferencia local. Para uso en producción conviene referenciar los repositorios oficiales, que ofrecen model cards completas, versionado y soporte.

## Limitaciones y advertencias

- No es un repositorio oficial: no está respaldado por OpenAI, NVIDIA, Google ni Alibaba; los reportes de bugs deben dirigirse a los proyectos originales.
- Licencias múltiples: el uso comercial exige revisar la licencia de cada componente (Gemma 4 license tiene términos específicos de uso aceptable; Parakeet requiere atribución CC BY 4.0).
- Idiomas: Parakeet TDT 0.6B v3 y TitaNet-small están orientados a inglés; el soporte multilingüe depende de Whisper y Qwen2.5, no confirmado explícitamente en este mirror.
- Riesgo de alucinación: presente en los LLM (Gemma 4 E2B, Qwen2.5 1.5B), especialmente en resúmenes de transcripciones largas.
- Los modelos ASR pueden degradarse con audio ruidoso, acentos no vistos o solapamiento de hablantes; no hay métricas publicadas en este repo.
- Contexto limitado en Qwen2.5 LiteRT-LM (4096 tokens de kv cache, frente a 32K del modelo original), lo que restringe resúmenes de reuniones muy largas.
- Sin garantías de mantenimiento ni actualización: el repositorio se actualizó por última vez en la misma fecha de creación (2026-10-31) y tiene 10 descargas y 0 likes.
- No se documentan sesgos, evaluaciones de seguridad ni filtros de contenido; la responsabilidad recae en el integrador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dpn82/offvox-models
- OpenAI Whisper (código): https://github.com/openai/whisper
- sherpa-onnx (modelos ASR): https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- sherpa-onnx (modelos de reconocimiento de hablante): https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Gemma 4 E2B IT (LiteRT): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Gemma 4 E2B IT (original): https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Qwen2.5 1.5B Instruct (LiteRT): https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct
- Qwen2.5 1.5B Instruct (original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
