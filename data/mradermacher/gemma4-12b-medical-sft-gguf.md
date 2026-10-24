# mradermacher/gemma4-12B-medical-sft-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un conjunto de cuantizaciones GGUF estáticas publicadas por mradermacher a partir de Shaleen123/gemma4-12B-medical-sft, un ajuste fino (SFT) de aproximadamente 11.907 millones de parámetros (11,9 B) orientado al dominio médico y con idioma declarado únicamente inglés. El autor de las cuantizaciones es un actor habitual del ecosistema llama.cpp, conocido por generar versiones GGUF de modelos publicados por terceros para facilitar su ejecución local.

Su relevancia práctica es la de hacer ejecutable en hardware de consumo un modelo de ~12 B especializado en texto clínico: los ficheros van desde 4,9 GB (Q2_K) hasta 12,8 GB (Q8_0), lo que permite desplegarlo en GPUs de 8 a 24 GB de VRAM con llama.cpp, Ollama o LM Studio. El repositorio es puramente de conversión: no aporta arquitectura propia, datos de entrenamiento ni evaluación.

La información disponible es muy limitada: la model card no documenta arquitectura, contexto, licencia ni resultados de benchmarks, y el modelo no registra descargas ni valoraciones en el momento de la consulta. Cualquier uso en producción sanitaria debe tratarse con cautela y validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no documenta la arquitectura del modelo base) |
| Parámetros totales | 11.907.350.576 (~11,9 B), dato real de safetensors |
| Parámetros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); IQ4_XS aparece en los metadatos del autor pero sin fichero ni tamaño en la tabla proporcionada; no hay cuantizaciones ponderadas ni imatrix |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors según el dato de parámetros) |
| Modelo base | Shaleen123/gemma4-12B-medical-sft |
| Tamaño del repositorio | 83,4 GB |
| Versión de cuantización | `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` |
| Fecha de publicación | 2026-10-24 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del modelo base: no se indica si es un transformer denso, un modelo híbrido ni detalles de atención. El identificador del modelo base (`gemma4-12B-medical-sft`) sugiere una inicialización sobre la familia Gemma 4 de aproximadamente 12 B y un ajuste supervisado en dominio médico, pero esto es una inferencia a partir del nombre y no está confirmado en la documentación. Tampoco se detallan el volumen de tokens de entrenamiento, la composición del corpus clínico, ni si hubo fases de RLHF o DPO.

Lo único verificable son los metadatos del proceso de conversión a GGUF: se partió de pesos en formato HuggingFace (`convert_type: hf`), se cuantizaron los tensores de salida y se marcó `skip_mmproj: 1`, lo que indica que no se generó la cuantización del proyector multimodal (mmproj). Cuando el repositorio de origen incluye ese fichero, se emplea para entradas de imagen; no se confirma en la información disponible que el modelo base sea multimodal, por lo que esta marca debe interpretarse solo como un dato del pipeline de conversión.

## Capacidades

- Generación de texto en inglés con estilo conversacional: la etiqueta `conversational` sugiere que el modelo base fue ajustado con plantillas de diálogo y admite turnos multi-turno.
- Respuesta a preguntas de temática médica y sanitaria, presumiblemente como resultado del ajuste supervisado en dominio clínico (no hay evaluación publicada que lo cuantifique).
- Redacción y reformulación de texto técnico-sanitario en inglés.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El metadato `skip_mmproj` implica que, si el modelo base tuviera componente multimodal, este repositorio no incluye el proyector necesario para usarlo.
- Compatibilidad de despliegue: etiqueta `endpoints_compatible`, además de los backends habituales de GGUF.

## Casos de uso

- Borradores de documentación clínica en inglés: el modelo puede generar notas, resúmenes de anamnesis o informes preliminares que un profesional revisa y firma. Adecuado por su ajuste en dominio médico y su tamaño contenido, que permite ejecución local con datos que no salen de la infraestructura.
- Educación médica y preparación de exámenes: generación de preguntas tipo test, explicaciones de fisiopatología y casos clínicos simulados en inglés, con verificación posterior por parte del docente.
- Investigación en PLN clínico: uso como punto de partida para experimentos de ajuste fino adicional o como baseline en tareas de clasificación y extracción de entidades sobre corpus sanitarios en inglés.
- Despliegue en entornos aislados (air-gapped): hospitales o laboratorios que no pueden enviar datos a APIs externas pueden servir el modelo con llama.cpp u Ollama en una estación de trabajo con GPU de 12-24 GB.
- Prototipado de asistentes conversacionales sanitarios: la etiqueta `conversational` y la disponibilidad de cuantizaciones ligeras permiten iterar rápidamente sobre guiones de diálogo antes de invertir en un modelo mayor.
- Generación de material divulgativo para pacientes: reelaboración de textos técnicos en explicaciones sencillas en inglés, siempre con revisión clínica previa a la publicación.
- Filtrado y preanotación de literatura biomédica: extracción de resúmenes estructurados o clasificación preliminar de abstracts en pipelines de revisión sistemática, con validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún conjunto de evaluación clínica (MedQA, PubMedQA u otros), y tampoco se aportan métricas del modelo base.

## Requisitos de hardware

| Cuantización | Tamaño en disco | VRAM estimada para inferencia |
|---|---|---|
| Q2_K | 4,9 GB | ~6 GB |
| Q3_K_S | 5,6 GB | ~7 GB |
| Q3_K_M | 6,2 GB | ~7,5 GB |
| Q3_K_L | 6,7 GB | ~8 GB |
| Q4_K_S | 7,1 GB | ~8,5 GB |
| Q4_K_M | 7,5 GB | ~9 GB |
| Q5_K_S | 8,4 GB | ~10 GB |
| Q5_K_M | 8,6 GB | ~10 GB |
| Q6_K | 9,9 GB | ~11,5 GB |
| Q8_0 | 12,8 GB | ~14,5 GB |
| f16 (no publicada en el repo) | ~23,8 GB (estimación a 2 bytes por parámetro) | ~26 GB |

Las cifras de VRAM son estimaciones a partir del tamaño del fichero más una reserva de 1 a 2 GB para caché KV y overhead del runtime; la memoria real depende de la longitud de contexto configurada y del backend.

- GPU consumer: una RTX 3060 de 12 GB mueve Q4_K_M o Q5_K_M con contexto moderado; una RTX 4070 Ti / 4080 de 16 GB permite Q6_K; una RTX 4090 de 24 GB ejecuta Q8_0 completo y f16 con offload parcial de capas.
- GPU profesional: A100 de 40 u 80 GB y H100 permiten f16 y servir varias peticiones concurrentes con contexto largo.
- Despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, koboldcpp y servidores compatibles con la API de llama.cpp. vLLM y TGI ofrecen soporte de GGUF más limitado; para serving de alta concurrencia conviene partir de los pesos safetensors del modelo base.
- Latencia y throughput: no disponible. No se han publicado mediciones y cualquier cifra dependería del backend, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/gemma4-12B-medical-sft-GGUF | ~11,9 B | no disponible | en | no disponible | GGUF | Objeto de esta ficha; cuantizaciones estáticas de 4,9 a 12,8 GB |
| Shaleen123/gemma4-12B-medical-sft | no disponible | no disponible | en (heredado) | no disponible | safetensors | Modelo base del que se derivan las cuantizaciones |
| mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-GGUF | ~12 B (por el identificador) | no disponible | no disponible | no disponible | GGUF | Mismo cuantizador y misma escala; ajuste orientado a roleplay, no a dominio médico |
| MedGemma 1.5 4B (Google DeepMind) | 4 B (por el identificador) | no disponible | no disponible | no disponible | no disponible | Modelo médico oficial de Google DeepMind con soporte de imagen (CT, MRI, histopatología); no se dispone de datos de contexto ni licencia en la información consultada |

No se dispone de datos de rendimiento comparativo entre estas opciones, por lo que la elección debe basarse en el caso de uso y en una evaluación propia.

## Limitaciones y advertencias

- Riesgo sanitario: es un modelo de lenguaje ajustado en dominio médico, no un dispositivo médico ni un sistema de diagnóstico. No debe usarse para decisiones clínicas sin supervisión profesional.
- Alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación en dominios clínicos, donde el coste de un error es alto.
- Idiomas: solo se declara inglés; no hay evidencia de calidad en castellano ni en otras lenguas.
- Licencia no disponible: no se especifican términos de uso, lo que impide confirmar si se permite uso comercial. Además, si el modelo base hereda la licencia de la familia Gemma, habría condiciones adicionales que este repositorio no documenta.
- Ausencia de evaluación: cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks ni comparativas publicadas por el autor. Se trata de un artefacto no validado por la comunidad.
- Cuantizaciones estáticas: no se han generado versiones ponderadas ni imatrix, lo que suele implicar mayor pérdida de calidad en bits bajos. Q2_K y Q3_K_S se alejan del comportamiento del modelo original; se recomienda Q4_K_M o superior para uso serio.
- Sin proyector multimodal: el pipeline marcó `skip_mmproj: 1`, de modo que no se incluye el fichero mmproj. Si el modelo base admite imagen, no sería utilizable a través de este repositorio.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso, lo que limita su integración en pipelines de agentes.
- Model card inexistente en la práctica: no hay información sobre datos de entrenamiento, sesgos conocidos, contexto máximo ni instrucciones de plantilla de chat, lo que complica la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma4-12B-medical-sft-GGUF
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#gemma4-12B-medical-sft-GGUF
- Modelo base: https://huggingface.co/Shaleen123/gemma4-12B-medical-sft
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Cuantización relacionada del mismo autor (roleplay): https://huggingface.co/mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-GGUF
- Cuantización relacionada del mismo autor (imatrix): https://huggingface.co/mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-i1-GGUF
- MedGemma (Google DeepMind): https://deepmind.google/models/gemma/medgemma/
- Documentación de inicio rápido de Gemma: https://gemma.ai/get-started/
