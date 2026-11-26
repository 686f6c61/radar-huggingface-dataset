# i4ds/voxcpm2_full_ref100_5ds_1epoch

## Resumen

VoxCPM2 Full Ref100 5ds 1epoch es un ajuste fino (fine-tuning) del modelo de síntesis de voz openbmb/VoxCPM2, publicado por el grupo i4ds (Institute for Data Science de la FHNW, Suiza) para el idioma alemán suizo (código ISO `gsw`). El modelo hereda la arquitectura de VoxCPM2, un sistema text-to-speech orientado a clonación de voz, y se ha especializado mediante entrenamiento supervisado sobre un conjunto de referencias de audio en suizo-alemán, lo que lo convierte en una pieza poco habitual: un TTS dedicado a una variante dialectal con escasa cobertura en los modelos multilingües convencionales.

Con 2.290.004.544 parámetros (2,29 mil millones) y un repositorio de 46,2 GB, el modelo se distribuye en formato safetensors bajo la librería `voxcpm`. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo, y la licencia figura como "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

Su relevancia actual reside en dos factores. Primero, cubre una lengua con pocos recursos TTS de calidad, el alemán suizo, que difiere notablemente del alemán estándar en fonética y prosodia. Segundo, al derivar de VoxCPM2, incorpora las capacidades de clonación de voz del modelo original, lo que permite generar habla con identidades vocales específicas a partir de muestras de referencia. No se han publicado métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de openbmb/VoxCPM2, TTS) |
| Parametros totales | 2.290.004.544 (2,29 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | gsw (alemán suizo) |
| Licencia | other (acceso restringido, requiere aceptación) |
| Formato de pesos | safetensors |
| Libreria | voxcpm |
| Tamano del repositorio | 46,2 GB |
| Modelo base | openbmb/VoxCPM2 |
| Pipeline | text-to-speech |
| Region | eu |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un fine-tuning de openbmb/VoxCPM2, un sistema de síntesis de voz con capacidades de clonación, y que los pesos se almacenan en safetensors con 2,29 mil millones de parámetros. El nombre del repositorio sugiere un entrenamiento con 100 referencias de audio ("full_ref100") sobre 5 datasets o conjuntos ("5ds") durante 1 época ("1epoch"), aunque estos detalles no están confirmados en la documentación pública.

No se dispone de información sobre el número de tokens de audio utilizados, la composición exacta del dataset, ni si se aplicaron técnicas de alineamiento o refinamiento posteriores (RLHF, DPO u otras). Tampoco se documentan innovaciones técnicas específicas del fine-tuning, como decodificación especulativa o atención lineal. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán suizo (`gsw`).
- Clonación de voz a partir de muestras de referencia, heredada de VoxCPM2.
- Generación de audio con identidades vocales específicas.
- Especialización en una variante dialectal concreta, con prosodia y fonética propias del suizo-alemán.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- No se documentan capacidades multilingües: el modelo está etiquetado únicamente para `gsw`.

## Casos de uso

- **Locución para medios locales suizos**: generación de voces sintéticas en alemán suizo para radios, podcasts o vídeos dirigidos a audiencias dialectales, donde los TTS estándar en alemán estándar suenan artificiales.
- **Accesibilidad y lectura de textos**: conversión de contenido escrito a audio en suizo-alemán para personas con discapacidad visual o dificultades lectoras en regiones germanoparlantes de Suiza.
- **Asistentes de voz regionales**: integración en interfaces conversacionales de atención al cliente de empresas suizas que quieran ofrecer una experiencia en dialecto local.
- **Doblaje y localización de contenido**: adaptación de material audiovisual al suizo-alemán manteniendo una identidad vocal coherente mediante clonación.
- **Investigación lingüística y fonética**: generación controlada de muestras de habla para estudios sobre variación dialectal, prosodia o percepción del habla.
- **Prototipado de productos de voz**: pruebas de concepto de aplicaciones TTS en un idioma de bajos recursos, aprovechando la clonación para personalizar la voz del asistente.
- **Preservación del patrimonio lingüístico**: creación de corpus sintéticos de audio en suizo-alemán para documentación y enseñanza del dialecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 2,29 mil millones de parámetros en precisión completa (fp32), el modelo ocuparía aproximadamente 9,2 GB solo en pesos; en fp16/bf16, unos 4,6 GB, a lo que habría que sumar memoria para activaciones y buffers de audio.
- **GPU recomendadas**: no documentadas. Por tamaño, cabría esperar que funcione en GPUs de consumo con suficiente VRAM (RTX 3090, RTX 4090, 24 GB), aunque no está confirmado.
- **¿Cabe en GPU de consumo?**: probablemente sí en modelos con 16-24 GB de VRAM en fp16, pero no hay confirmación oficial.
- **Opciones de despliegue**: la librería indicada es `voxcpm`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a TTS.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| i4ds/voxcpm2_full_ref100_5ds_1epoch | 2,29 B | no disponible | gsw | other (gated) | Hugging Face, acceso restringido |
| openbmb/VoxCPM2 (base) | no disponible | no disponible | multilingüe (no detallado) | no disponible | Hugging Face |
| Otros TTS dialectales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es gated; es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados o en entornos corporativos.
- **Licencia "other"**: no es una licencia estándar (Apache, MIT, etc.); hay que revisar los términos del modelo base openbmb/VoxCPM2 y del fine-tuning antes de cualquier uso comercial.
- **Idioma único**: solo cubre `gsw` (alemán suizo); no se debe esperar buen rendimiento en alemán estándar ni en otros idiomas.
- **Riesgo de alucinación acústica**: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos fuera del dominio de entrenamiento.
- **Sesgos de los datos de referencia**: las 100 referencias utilizadas para el fine-tuning pueden introducir sesgos de género, edad o acento que se reflejen en las voces generadas.
- **Clonación de voz**: la capacidad de clonación conlleva riesgos de suplantación de identidad y uso indebido; es responsabilidad del usuario cumplir la normativa aplicable (por ejemplo, el AI Act europeo).
- **Sin benchmarks publicados**: no hay métricas objetivas (MOS, WER, similitud de hablante) que permitan evaluar su calidad de forma independiente.
- **Documentación escasa**: no se detallan la arquitectura, el proceso de entrenamiento ni los requisitos de hardware, lo que dificulta su puesta en producción.

## Enlaces

- Hugging Face: https://huggingface.co/i4ds/voxcpm2_full_ref100_5ds_1epoch
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
