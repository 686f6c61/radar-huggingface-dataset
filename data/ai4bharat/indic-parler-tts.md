# ai4bharat/indic-parler-tts

## Resumen

Indic-Parler-TTS es un modelo de sintesis de voz (text-to-speech) desarrollado por AI4Bharat, el laboratorio del IIT Madras centrado en tecnologias linguisticas para lenguas indias. El modelo parte de la arquitectura Parler-TTS de Hugging Face y se ha entrenado de forma especifica para 20 idiomas: 18 lenguas indias (asames, bengali, gujarati, hindi, kannada, cachemiri, oriya, malayalam, marati, nepalí, punyabí, sanscrito, sindhi, tamil, telugu, urdu y oromó, ademas del ingles) y el oromó. Con aproximadamente 938 millones de parametros, ofrece sintesis multilingue con control de estilo mediante descripciones textuales (prompts de voz).

El modelo resuelve un problema practico: la mayoria de sistemas TTS de alta calidad estan optimizados para ingles o unas pocas lenguas europeas, dejando desatendidas las lenguas indias, muchas con millones de hablantes pero con recursos limitados. Indic-Parler-TTS permite generar habla natural en estas lenguas con una sola arquitectura, sin necesidad de entrenar un modelo por idioma.

Es relevante ahora porque democratiza el TTS multilingue bajo licencia Apache 2.0 (aunque con acceso restringido en Hugging Face) y porque su integracion en `transformers` facilita el despliegue en pipelines existentes. Su capacidad de controlar caracteristicas de la voz mediante lenguaje natural lo hace util para doblaje, audiolibros, accesibilidad y asistentes conversacionales en contextos multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parler-TTS (transformer autoregresivo + decoder de audio, basado en EnCodec/ DAC) |
| Parametros totales | 937.803.241 (~938 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada oficialmente) |
| Idiomas soportados | en, as, bn, gu, hi, kn, ks, or, ml, mr, ne, pa, sa, sd, ta, te, ur, om |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Indic-Parler-TTS sigue la arquitectura Parler-TTS, un modelo text-to-speech completamente abierto que combina un transformer autoregresivo que genera tokens de audio discretos (procedentes de un codec neuronal) condicionado por el texto de entrada y por una descripcion textual de la voz deseada. Esta descripcion actua como prompt de estilo, permitiendo controlar genero, tono, velocidad y calidad de grabacion sin necesidad de muestras de referencia. El modelo se distribuye en formato compatible con `transformers` (clase `ParlerTTSForConditionalGeneration`) y usa safetensors.

El entrenamiento se realizo sobre el dataset anotado GLOBE (`ai4b-hf/GLOBE-annotated`), segun los metadatos del repositorio. No se especifican en la informacion disponible el numero exacto de horas de audio, la composicion detallada del corpus ni si se aplicaron etapas de RLHF o ajuste fino con preferencias. La innovacion principal es la extension multilingue del paradigma Parler-TTS a 18 lenguas indias con un unico modelo, manteniendo el control de estilo por prompt textual.

## Capacidades

- Sintesis de voz (text-to-speech) en 18 lenguas indias y en ingles.
- Control de caracteristicas de la voz mediante descripciones en lenguaje natural (genero, tono, velocidad, ruido de fondo).
- Generacion de audio a partir de texto con un unico modelo multilingue, sin cambio de checkpoint por idioma.
- Salida de audio en formato compatible con el pipeline `text-to-speech` de `transformers`.
- Soporte de multiples hablantes implicitos a traves de la variacion de prompts de voz.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje general).
- Capacidades de vision o audio de entrada: no disponibles.

## Casos de uso

- Audiolibros y narracion multilingue: el modelo permite generar narraciones en hindi, tamil, bengali, etc., ajustando velocidad y tono mediante prompts de voz para adaptarse al genero literario.
- Accesibilidad para personas con discapacidad visual: lectura de contenido web o documentos en lenguas indias con una voz natural, integrrable en lectores de pantalla mediante el pipeline de `transformers`.
- Asistentes de voz para atencion al cliente: sintesis de respuestas en el idioma del usuario (por ejemplo, telugu o marati) con control del estilo para mantener coherencia de marca.
- Doblaje y localizacion de contenido audiovisual: generacion de pistas de voz en varias lenguas indias a partir de un mismo guion, reduciendo costes frente a grabaciones con actores.
- Educacion y e-learning: narracion de materiales didacticos en lenguas regionales, con voces adaptadas a distintos publicos (infantil, formal) mediante descripciones textuales.
- Investigacion en TTS multilingue: base abierta para experimentos de transferencia entre lenguas, evaluacion de calidad y ajuste fino sobre corpus propios.
- Prototipado de interfaces conversacionales: generacion rapida de voz para demos y pruebas de usabilidad en entornos con varias lenguas indias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-4 GB en fp16 para los ~938 M de parametros, mas el consumo del codec de audio y buffers intermedios; en la practica se recomienda al menos 6-8 GB para operar con comodidad.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en produccion con alta concurrencia; RTX 4090 o RTX 3090 para desarrollo y cargas moderadas.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante); en GPUs con 4-6 GB puede requerir cuantizacion o ejecucion en CPU con mayor latencia.
- Opciones de despliegue: `transformers` (pipeline `text-to-speech`), integracion en servicios Python propios; no se documenta soporte oficial en vLLM, llama.cpp u Ollama (no estan orientados a TTS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| Indic-Parler-TTS (ai4bharat) | ~938 M | 18 lenguas indias + en | no disponible | apache-2.0 | gated en HF |
| Parler-TTS (huggingface) | ~880 M (variantes mini y large) | principalmente en | no disponible | apache-2.0 | abierto |
| XTTS-v2 (Coqui) | no disponible en la informacion | multilingue (aprox. 17) | no disponible | Coqui Public Model License (no comercial) | abierto con restricciones |
| MMS-TTS (Meta) | no disponible en la informacion | mas de 1000 lenguas | no disponible | CC-BY-NC 4.0 | abierto con restricciones |

La comparativa se limita a datos publicos generales; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta en modo gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Calidad variable entre lenguas: al cubrir 18 lenguas indias con un unico modelo, es previsible un rendimiento desigual segun los recursos disponibles por idioma; no se documentan metricas por lengua.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciacion erronea en palabras poco frecuentes.
- Sesgos: la voz generada depende de los datos de GLOBE; pueden reproducirse sesgos de genero, acento o calidad de grabacion presentes en el corpus.
- Limitaciones de contexto: no se especifica la longitud maxima de texto de entrada; textos largos pueden requerir fragmentacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de acceso del repositorio y de las licencias de los datos de entrenamiento.
- No es un modelo de lenguaje: no soporta razonamiento, tool calling ni agentes; su unico cometido es la sintesis de voz.
- Para produccion: conviene evaluar la inteligibilidad por idioma y el coste de inferencia antes de desplegar a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai4bharat/indic-parler-tts
- Dataset GLOBE anotado: https://huggingface.co/datasets/ai4b-hf/GLOBE-annotated
- Paper de referencia (arXiv 2402.01912): https://arxiv.org/abs/2402.01912
- DOI: https://doi.org/10.57967/hf/5683
- Repositorio Parler-TTS de Hugging Face: https://github.com/huggingface/parler-tts
