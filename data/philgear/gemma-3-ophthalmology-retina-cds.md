# philgear/gemma-3-ophthalmology-retina-cds

## Resumen

El modelo `philgear/gemma-3-ophthalmology-retina-cds` es un adaptador LoRA (PEFT) desarrollado por Phillip Gear (PocketGull LLC, Oregón) sobre el modelo base `google/gemma-3-4b-it` de Google DeepMind. Está especializado en soporte a la decisión clínica (CDS) oftalmológica, concretamente en el análisis de hallazgos de tomografía de coherencia óptica (OCT) macular y en la interpretación de agudeza visual optotípica expresada en escala LogMAR. El adaptador se ha afinado mediante Optimización Directa de Preferencias (DPO) sobre conjuntos de datos clínicos desidentificados conforme al estándar HIPAA §164.514 Safe Harbor.

La relevancia del modelo reside en su enfoque de despliegue local y preservación de privacidad: está diseñado para ejecutarse en computación de borde o en Google Cloud Vertex AI privado, sin retención de información de salud protegida (PHI). Se posiciona explícitamente como una herramienta de apoyo no considerada dispositivo médico bajo la exención FDA 520(o) para CDS, orientada a profesionales sanitarios con licencia.

El modelo hereda la arquitectura y el contexto del Gemma 3 de 4.000 millones de parámetros, pero el adaptador en sí es un conjunto de pesos LoRA de pequeño tamaño que debe combinarse con el modelo base para su uso. En el momento de la publicación no registra descargas ni interacciones en Hugging Face, y su model card es la única fuente técnica disponible sobre el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-3-4b-it` |
| Parametros totales | 4.000 millones en el modelo base; tamaño del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PEFT/LoRA compatibles con la libreria `peft` (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-4b-it`, un transformer decoder-only de 4.000 millones de parámetros de la familia Gemma 3 de Google DeepMind, diseñada para ejecutarse en una única GPU o TPU. El ajuste se realiza mediante LoRA, lo que congela los pesos del modelo base e incorpora matrices de bajo rango entrenables, reduciendo drásticamente el coste de entrenamiento y el tamaño del artefacto resultante.

El método de alineación empleado es DPO (Direct Preference Optimization), aplicado sobre datos clínicos oftalmológicos desidentificados conforme a HIPAA §164.514 Safe Harbor. La model card no especifica el volumen de tokens de entrenamiento, la composición exacta del dataset, el rango de las matrices LoRA ni los hiperparámetros utilizados. El dominio declarado abarca hallazgos de OCT macular (por ejemplo, espesor del subcampo central y líquido subretiniano) y agudeza visual LogMAR, con el objetivo declarado de eliminar la ambigüedad léxica en la interpretación de estos datos.

## Capacidades

- Generación de texto clínico en inglés orientado a oftalmología y retinología.
- Interpretación de hallazgos de OCT macular (espesor del subcampo central, líquido subretiniano) y formulación de planes de soporte a la decisión.
- Conversión e interpretación de agudeza visual en escala LogMAR.
- Razonamiento clínico estructurado a partir de parámetros numéricos y hallazgos de imagen descritos en texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada; el adaptador se declara como `text-generation`.

## Casos de uso

- Apoyo a la lectura de OCT macular en consulta: el modelo recibe parámetros como el espesor del subcampo central y la presencia de líquido subretiniano, y genera una interpretación estructurada y un plan de seguimiento sugerido para revisión del oftalmólogo.
- Interpretación de agudeza visual LogMAR: convierte y contextualiza valores LogMAR de cada ojo (OD/OS) en un informe clínico legible, útil en consultas de retina y seguimiento de degeneración macular.
- Documentación clínica automatizada: genera borradores de notas clínicas oftalmológicas a partir de datos estructurados, reduciendo el tiempo de redacción del personal sanitario.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente o en Vertex AI privado sin retención de PHI, encaja en flujos donde los datos del paciente no pueden salir de la infraestructura del centro.
- Formación y simulación clínica: sirve como herramienta de práctica para residentes de oftalmología que interpretan casos sintéticos de OCT y agudeza visual.
- Triage de derivaciones: clasifica y resume hallazgos de retina a partir de datos de OCT para priorizar revisiones en listas de espera de oftalmología.
- Investigación clínica asistida: extracción y normalización de hallazgos de OCT y LogMAR en cohortes retrospectivas desidentificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el modelo base Gemma 3 4B en bfloat16 requiere aproximadamente 8-10 GB de VRAM, y el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo base, una GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) permite ejecución cómoda en bfloat16.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs de consumo con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), aunque el autor no lo confirma.
- Opciones de despliegue: el ejemplo de la model card usa `transformers` + `peft` con `device_map="auto"`; también se menciona despliegue en Google Cloud Vertex AI privado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-ophthalmology-retina-cds (este) | 4B (base) + adaptador LoRA | no disponible | Oftalmologia / retina (OCT, LogMAR) | Apache 2.0 | Hugging Face (PEFT) |
| google/gemma-3-4b-it | 4B | no disponible en la informacion proporcionada | Generalista, multimodal | Gemma license | Hugging Face |
| Modelos clinicos especializados comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores oftalmológicos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo se declara como herramienta de soporte a la decisión para profesionales con licencia; no es un dispositivo médico bajo FDA 520(o) y no debe usarse como diagnóstico autónomo.
- Riesgo de alucinación inherente a los modelos de lenguaje: las recomendaciones clínicas generadas deben validarse siempre por un oftalmólogo.
- Idiomas: únicamente inglés, lo que limita su uso directo en entornos clínicos en castellano sin traducción previa.
- Sesgos conocidos: no documentados por el autor; el dataset de entrenamiento no se describe en detalle, por lo que no puede evaluarse su representatividad demográfica.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Gemma 3 está sujeto además a los términos de licencia de Google, que deben respetarse.
- Registro de uso mínimo: cero descargas y cero interacciones en Hugging Face en el momento de la consulta, sin validación externa publicada.
- El adaptador requiere cargar el modelo base completo; no es un modelo autónomo y no se distribuyen pesos fusionados ni cuantizados.
- No se documentan límites de contexto específicos del ajuste ni evaluación de robustez frente a entradas fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-ophthalmology-retina-cds
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Modelo base Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Organización PocketGull: https://pocketgull.com
- DOI Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio del proyecto: https://pocketgull.app
