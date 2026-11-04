# Cohere-AR/cohere-transcribe-ar-rl2-v9ctrl

## Resumen

Cohere-AR/cohere-transcribe-ar-rl2-v9ctrl es un modelo de reconocimiento automático del habla (ASR) especializado en árabe e inglés, con soporte explícito para code-switching y audio telefónico. Lo desarrolla Cohere-AR, la rama de Cohere centrada en árabe, y se distribuye como un fine-tune del checkpoint Cohere-AR/cohere-transcribe-ar-rl-v9enc, del que hereda el encoder. El modelo resuelve el problema de transcribir conversaciones bilingües árabe-inglés en dominios de baja calidad acústica, como llamadas telefónicas, donde los ASR genéricos suelen degradarse notablemente.

Con aproximadamente 2.070 millones de parámetros (2,07 B) en formato safetensors y un repositorio de 4,1 GB, se sitúa en la gama media de modelos ASR de producción: suficientemente grande para capturar variabilidad dialectal y ruido telefónico, pero manejable en infraestructura con GPU única. La nomenclatura "rl2" y "v9ctrl" sugiere una segunda iteración de refinamiento (posiblemente con RL o ajuste por preferencias) sobre una novena versión de la familia, con un checkpoint de control; no obstante, el autor no publica detalles del proceso.

Es relevante ahora porque el code-switching árabe-inglés es un fenómeno masivo en entornos corporativos y de atención al cliente en el Golfo y el Levante, y pocos modelos abiertos lo tratan como caso de primera clase. El acceso está restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `cohere_asr` en transformers; encoder heredado de Cohere-AR/cohere-transcribe-ar-rl-v9enc) |
| Parametros totales | 2.065.770.752 (2,07 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | árabe (ar), inglés (en); code-switching ar-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | automatic-speech-recognition (ASR) |
| Dominio declarado | telefonía, code-switching |
| Acceso | restringido (gated) |
| Modelo base | Cohere-AR/cohere-transcribe-ar-rl-v9enc |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna. La etiqueta de pipeline `cohere_asr` y la clase de modelo asociada indican un sistema ASR propio del ecosistema Cohere integrado en `transformers`, con un encoder preentrenado (heredado de `cohere-transcribe-ar-rl-v9enc`) y una cabeza de decodificación ajustada en este checkpoint. El sufijo "rl2" apunta a una segunda ronda de refinamiento, posiblemente con optimización por refuerzo o ajuste sobre preferencias, y "v9ctrl" a un checkpoint de control dentro de la novena iteración de la familia. Estos extremos no están confirmados por el autor.

No se publican datos sobre volumen de horas de audio, composición del corpus, proporción de code-switching, tratamiento de ruido telefónico ni si hubo etapas de RLHF/DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o streaming. Cualquier afirmación al respecto sería especulativa y no se incluye aquí.

## Capacidades

- Transcripción de voz a texto en árabe e inglés.
- Manejo de code-switching intra-enunciado árabe-inglés, declarado explícitamente en las etiquetas del modelo.
- Reconocimiento en audio telefónico (banda estrecha, ruido de canal, compresión), según el dominio declarado.
- Integración con la librería `transformers` mediante la tarea `automatic-speech-recognition`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue como servicio gestionado o autoalojado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking"; se trata de un modelo ASR puro.
- Cobertura multilingüe limitada a ar y en; no consta soporte para otros idiomas.

## Casos de uso

- Atención al cliente telefónica bilingüe: transcripción de llamadas en centros de contacto del Golfo donde el agente y el cliente alternan árabe e inglés en la misma frase; el modelo está ajustado específicamente para ese patrón y para audio de telefonía.
- Generación de actas y resúmenes de reuniones: transcripción previa de reuniones internas ar-en que después alimenta un LLM de resumen; el code-switching evita tener que segmentar manualmente por idioma.
- Subtitulado de contenido corporativo y formación interna: vídeos y webinars con ponentes que mezclan terminología técnica en inglés dentro de discurso árabe.
- Análisis de calidad y compliance en contact centers: transcripción masiva de grabaciones para detección de palabras clave, scoring de agentes y auditoría regulatoria, aprovechando el dominio telefónico declarado.
- Sistemas de voz interactivos (IVR) en banca y telecomunicaciones: conversión de la entrada de voz del usuario a texto para enrutamiento por intención en un pipeline posterior.
- Investigación lingüística sobre code-switching: corpus anotados automáticamente para estudiar alternancia de código ar-en en habla espontánea.
- Accesibilidad: subtitulado en tiempo casi real de reuniones y eventos para hablantes de árabe e inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 4,2-4,5 GB solo para pesos, más overhead de activaciones y buffers de audio; presupuesto práctico de 6-8 GB.
- En cuantización int8: aproximadamente 2,1-2,5 GB de pesos; cifra orientativa, ya que el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con 8 GB o más para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4); A10G, L40S, A100 y H100 para despliegues con alta concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en fp16; en 4-6 GB requeriría cuantización no publicada oficialmente.
- Opciones de despliegue: `transformers` con pipeline de ASR; servidores compatibles con endpoints (TGI no está confirmado para esta arquitectura `cohere_asr`); vLLM y llama.cpp no constan como soportados para este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Code-switching | Licencia | Acceso |
|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-rl2-v9ctrl | 2,07 B | ar, en | Sí (declarado) | no disponible | Gated |
| Whisper large-v3 (OpenAI) | 1,55 B | multilingüe (99) | Parcial, no especializado | MIT | Abierto |
| MMS / SeamlessM4T (Meta) | variable | multilingüe | No especializado ar-en | variable | Abierto |
| Otros ASR árabes abiertos | variable | ar | No | variable | Abierto |

La comparativa cuantitativa de rendimiento no está disponible porque el autor no publica benchmarks. Frente a Whisper large-v3, este modelo sacrifica cobertura de idiomas a cambio de especialización en ar-en telefónico; frente a alternativas multilingües genéricas, su ventaja declarada es el code-switching nativo.

## Limitaciones y advertencias

- Solo cubre árabe e inglés; no es un modelo multilingüe general.
- No se documentan sesgos por dialecto árabe (egipcio, golfo, levantino, magrebí); el rendimiento puede variar notablemente entre variedades.
- Riesgo de alucinación en pasajes de silencio, ruido extremo o audio musical, comportamiento habitual en modelos ASR.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar las condiciones del acceso restringido en HuggingFace.
- Acceso gated: requiere aceptar condiciones y autenticarse con un token de HuggingFace, lo que complica pipelines automatizados de CI/CD.
- Sin datos de benchmarks ni de longitud máxima de audio procesable; no se puede garantizar comportamiento en grabaciones largas sin segmentación previa.
- Sin variantes cuantizadas oficiales publicadas; el despliegue en hardware limitado exige cuantización manual y validación propia.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni informes independientes de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-rl2-v9ctrl
- Modelo base: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-rl-v9enc
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
