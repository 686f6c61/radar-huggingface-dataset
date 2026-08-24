# kinit/parakeet-tdt-0.6b-v3-sk

## Resumen

`kinit/parakeet-tdt-0.6b-v3-sk` es un modelo de reconocimiento automático del habla (ASR) en eslovaco, desarrollado por el equipo KInIT como un ajuste fino completo del modelo multilingüe `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. El modelo emplea un codificador FastConformer junto con un decodificador TDT (Token-and-Duration Transducer), sumando aproximadamente 600 millones de parámetros. Está diseñado para transcribir audio en eslovaco con puntuación y capitalización, con especial robustez frente a condiciones de grabación reales gracias a la aumentación de ruido aplicada durante el entrenamiento. Su relevancia radica en que ofrece una alternativa eficiente y de alta precisión para la transcripción en un idioma con menos recursos que el inglés, manteniendo una latencia reducida respecto a otras arquitecturas.

El modelo fue entrenado sobre un corpus eslovaco curado que combina datos públicos (Common Voice, FLEURS, TEDxSK, SloPalSpeech, entre otros) con grabaciones internas de KInIT. El ajuste fino completo reduce la tasa de error de palabra (WER) en un 12,8% en Common Voice y un 72,8% en un conjunto de evaluación interno, en comparación con el modelo base. Sin embargo, este ajuste provoca un olvido catastrófico de las otras 24 lenguas que soportaba el modelo base, por lo que su uso queda restringido al eslovaco. El modelo se distribuye bajo licencia CC-BY-4.0 y se integra fácilmente en el ecosistema NVIDIA NeMo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT (Token-and-Duration Transducer) decoder |
| Parámetros totales | ~600 millones |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo ASR; no se especifica ventana de audio) |
| Tipos de cuantización | No disponibles (no se mencionan en la documentación) |
| Idiomas soportados | Eslovaco (`sk`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (`.nemo`), compatible con safetensors en el repositorio |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer-TDT, una variante del FastConformer que combina un codificador convolutional eficiente con un decodificador basado en transductor de token y duración. Este diseño permite un alto rendimiento y baja latencia en la transcripción de audio. El ajuste fino se realizó sobre el modelo base `nvidia/parakeet-tdt-0.6b-v3`, que originalmente soportaba 25 lenguas europeas; el entrenamiento completo (full fine-tuning) se ejecutó durante 3 épocas con una tasa de aprendizaje de 4e-4, scheduler de coseno con calentamiento, optimizador AdamW, batch efectivo de 64 y precisión mixta bf16. Además, el 75% de las muestras de entrenamiento se aumentaron con ruido sintético (ruido telefónico, habla de fondo, ruido blanco, pérdida de paquetes) para mejorar la robustez en entornos reales.

El corpus de entrenamiento combina fuentes públicas como SloPalSpeech, Common Voice 24.0, FLEURS, TEDxSK y JumpSK Lecture Speech, junto con grabaciones internas de KInIT. Las muestras se filtraron por calidad mediante un umbral basado en CER validado con múltiples modelos ASR, y se anonimizaron los datos personales antes de su uso. El entrenamiento se realizó en el clúster HPC Devana.

## Capacidades

- **Reconocimiento automático del habla en eslovaco**: transcribe audio en eslovak con alta precisión, incluyendo puntuación y capitalización automáticas.
- **Robustez a condiciones de grabación adversas**: gracias a la aumentación con ruido durante el entrenamiento, funciona bien en entornos con ruido de fondo, habla superpuesta o pérdida de paquetes.
- **Transcripción de dominio amplio**: entrenado con datos de discursos, literatura leída, sesiones de consejos municipales y grabaciones de conferencias, lo que cubre múltiples registros.
- **Integración con NVIDIA NeMo**: se carga fácilmente con `nemo_asr.models.ASRModel.from_pretrained()`, facilitando su uso en pipelines de ASR existentes.
- **Soporte de timestamps (no evaluado)**: la arquitectura base soporta timestamps de palabra y segmento, aunque el autor no los ha evaluado tras el ajuste fino.
- **Eficiencia computacional**: al ser un modelo de 600M, ofrece un buen equilibrio entre rendimiento y latencia, siendo más rápido que alternativas como Canary 1B.

## Casos de uso

- **Transcripción de reuniones y actas municipales**: el modelo puede transcribir grabaciones de sesiones de consejos municipales, facilitando la generación automática de actas y la búsqueda de contenido. Su robustez al ruido de fondo y a la voz superpuesta es adecuada para estos entornos.
- **Subtitulado automático de contenido en eslovaco**: para plataformas de vídeo, el modelo puede generar subtítulos con puntuación y capitalización, mejorando la accesibilidad. Su capacidad de procesar audio largo (heredada del base) permite usarlo en vídeos de conferencias o webinars.
- **Asistencia a personas con discapacidad auditiva**: transcripción en tiempo real de conversaciones o eventos, aunque se requiere supervisión humana para contextos críticos (el modelo no está diseñado para uso sin revisión en seguridad).
- **Investigación lingüística y creación de corpus**: el modelo puede transcribir audio eslovaco para construir nuevos conjuntos de datos de entrenamiento o análisis fonético, aprovechando su bajo WER en comparación con el modelo base.
- **Integración en asistentes de voz en eslovaco**: sirve como motor de reconocimiento de voz para aplicaciones de domótica o asistentes personales, donde la baja latencia y el soporte de NeMo permiten un despliegue sencillo.
- **Transcripción de entrevistas y podcasts**: el modelo es adecuado para convertir entrevistas orales en texto escrito, con buena tolerancia a ruido de fondo y variaciones de acento, aunque los acentos muy marcados o dialectos pueden degradar el rendimiento.

## Benchmarks y rendimiento

La model card proporciona resultados de WER y CER en dos conjuntos de evaluación: Common Voice 24.0 (CV24, 5.239 muestras públicas) y un conjunto interno de KInIT (9.317 muestras, no público, estratificado por dominio y género, con un tercio limpio y dos tercios con ruido). Los valores son los siguientes:

| Modelo | CV24 WER ↓ | CV24 CER ↓ | Internal WER ↓ | Internal CER ↓ |
|---|---:|---:|---:|---:|
| **kinit/parakeet-tdt-0.6b-v3-sk** | **7,92 %** | **2,06 %** | **6,62 %** | **3,12 %** |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 9,07 % | 2,54 % | 24,32 % | 10,75 % |

Además, se compara con otro modelo NeMo ajustado para eslovaco, Canary 1B v2, en el conjunto interno:

| Modelo | WER ajustado ↓ | WER base ↓ |
|---|---:|---:|
| **Parakeet TDT 0.6B v3** | **6,62 %** | 24,32 % |
| Canary 1B v2 | 6,37 % | 14,39 % |

El modelo ajustado reduce la WER en un 12,8 % en CV24 y en un 72,8 % en el conjunto interno en comparación con el base. La comparación con Canary muestra que Parakeet es más rápido, aunque Canary obtiene una WER ligeramente inferior en el conjunto interno.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de ~600M de parámetros en precisión fp32, la memoria necesaria para inferencia ronda los 2,4 GB. Con cuantización a int8 (no disponible en la documentación, pero típica en NeMo) se reduciría a ~1,2 GB. En bf16, ~1,2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp32. Para inferencia en tiempo real, una RTX 3060 o superior sería suficiente; en entornos de producción, una A10, A100 o L4 ofrece menor latencia.
- **Compatibilidad con GPU de consumo**: sí, cabe en la mayoría de GPUs de consumo (RTX 2060, 3060, 4060, etc.) con cuantización o bf16.
- **Opciones de despliegue**: se integra con NVIDIA NeMo, que permite inferencia mediante TensorRT o Triton Inference Server. También se puede usar con el paquete `nemo_toolkit` en Python. No se menciona soporte para llama.cpp u Ollama, ya que es un modelo de audio.
- **Latencia y rendimiento**: no se especifican valores exactos. El modelo base es conocido por su alta eficiencia; el ajuste fino no modifica la arquitectura, por lo que se espera un rendimiento similar al de `parakeet-tdt-0.6b-v3` (que procesa audio en tiempo real en GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Lenguas | Contexto | WER (eslovak) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **kinit/parakeet-tdt-0.6b-v3-sk** | ~600M | Eslovak | No especificado | 7,92 % (CV24) / 6,62 % (interno) | CC-BY-4.0 | HuggingFace |
| nvidia/parakeet-tdt-0.6b-v3 | ~600M | 25 europeas | No especificado | 9,07 % (CV24) / 24,32 % (interno) | CC-BY-4.0 | HuggingFace, NGC |
| Canary 1B v2 | 1B | 25 europeas | No especificado | 6,37 % (interno) | CC-BY-4.0 | HuggingFace, NGC |

La comparativa se basa en los datos proporcionados por el autor. El modelo ajustado supera claramente al base en eslovak, mientras que Canary 1B v2 muestra una WER ligeramente inferior en el conjunto interno, pero es un modelo más grande (1B) y más lento según el autor. La elección entre ambos dependerá del equilibrio entre precisión y latencia.

## Limitaciones y advertencias

- **Olvido catastrófico**: el ajuste fino exclusivo en eslovaco degrada significativamente el rendimiento en las otras 24 lenguas que soportaba el modelo base. Si se necesita transcripción multilingüe, usar el modelo base.
- **Rendimiento en acentos y dialectos**: el modelo puede degradarse con acentos muy marcados, dialectos regionales o habla especializada no representada en el corpus de entrenamiento.
- **Dominio de frases cortas**: el corpus de entrenamiento contiene principalmente frases cortas; la capacidad de transcribir discursos largos o conversaciones extensas no ha sido evaluada tras el ajuste fino, aunque la arquitectura base lo soporta.
- **Timestamps no evaluados**: el soporte de timestamps de palabra y segmento es una capacidad del modelo base, pero no se ha validado en este ajuste fino.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero se debe citar tanto al autor (KInIT) como a NVIDIA (por el modelo base).
- **Uso en contextos críticos**: el modelo no está diseñado para transcripción en entornos de seguridad o decisiones que requieran revisión humana; se debe usar con supervisión.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/kinit/parakeet-tdt-0.6b-v3-sk)
- [Modelo base en HuggingFace](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Artículo técnico de Canary-1B-v2 y Parakeet-TDT-0.6B-v3 (arXiv)](https://arxiv.org/html/2509.14128v2)
- [Colección de ASR de KInIT en HuggingFace](https://huggingface.co/collections/kinit/automatic-speech-recognition-6a42684efb87315cc9da3247)
- [Colección de Parakeet TDT 0.6B en NVIDIA NGC](https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b)
- [Catálogo SLAIH](https://www.slaih.sk/sk/catalog/parakeet-tdt-0.6b-v3-sk)
