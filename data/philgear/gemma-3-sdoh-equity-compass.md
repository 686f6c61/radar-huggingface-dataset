# philgear/gemma-3-sdoh-equity-compass

## Resumen

`philgear/gemma-3-sdoh-equity-compass` es un adaptador LoRA publicado por Phillip Gear (PocketGull LLC) sobre el modelo base `google/gemma-3-4b-it` de Google DeepMind. El adaptador está especializado en la clasificación y el cribado de determinantes sociales de la salud (SDoH, Social Determinants of Health), con el objetivo declarado de identificar cinco dominios SDoH y mapear recursos comunitarios redactados a un nivel de lectura de octavo grado.

El problema que aborda es la sistematización del cribado de factores socioeconómicos y de entorno en contextos clínicos, una tarea habitualmente manual y difícil de estandarizar. El autor declara que el ajuste se realizó mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos de dominio específico conformes con los estándares de desidentificación de HIPAA §164.514 Safe Harbor, y que el modelo está pensado para computación local en el borde o despliegue privado en Google Cloud Vertex AI, sin retención de información de salud protegida (PHI).

La relevancia del proyecto es doble: por un lado, demuestra el uso de adaptadores PEFT de bajo coste sobre un modelo compacto de 4B parámetros para una tarea clínica vertical; por otro, su encuadre regulatorio (herramienta de apoyo a la decisión clínica no clasificada como dispositivo según FDA 520(o)) y su licencia Apache-2.0 facilitan la experimentación. No obstante, el adaptador no cuenta con descargas ni valoraciones en el momento de la ficha, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-3-4b-it` |
| Parametros totales | No disponible para el adaptador; el modelo base Gemma 3 4B tiene aproximadamente 4.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea `torch.bfloat16`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador PEFT/LoRA consumido mediante la libreria `peft`; formato de los pesos del adaptador no especificado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 3 4B, un transformer decoder-only de Google DeepMind. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), lo que implica que solo se entrenan matrices de bajo rango añadidas a las capas del modelo base, manteniendo congelados los pesos originales. El autor declara un entrenamiento con Direct Preference Optimization (DPO), un método de alineación que optimiza directamente preferencias entre pares de respuestas en lugar de recurrir a un reward model separado y a RLHF clásico.

Los datos de entrenamiento se describen como conjuntos clínicos de dominio específico conformes con HIPAA §164.514 Safe Harbor, es decir, sometidos a un proceso de desidentificación de 18 identificadores directos. No se especifica el número de tokens, la composición exacta del dataset, el rango del adaptador (rank LoRA), el alpha ni los hiperparámetros de entrenamiento. Tampoco se detalla si se combinaron fases de supervisión y DPO o si el DPO fue el único objetivo de entrenamiento.

## Capacidades

- Cribado de cinco dominios de determinantes sociales de la salud (SDoH) según los marcos WHO/CDC, según la descripción del autor.
- Mapeo de recursos comunitarios e intervenciones redactadas a un nivel de lectura de octavo grado.
- Generación de texto clínico de apoyo en inglés.
- Razonamiento guiado por preferencias (DPO) orientado a respuestas de equidad sanitaria.
- Diseñado para despliegue con cero retención de PHI en entornos locales o privados.
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Cribado de SDoH en atención primaria: el adaptador puede recibir una descripción clínica de un paciente y devolver la clasificación en los cinco dominios SDoH, ayudando a estandarizar la codificación de factores sociales en la historia clínica.
- Generación de material educativo para pacientes: dado que el autor declara un nivel de lectura de octavo grado, el modelo puede emplearse para reescribir recomendaciones de recursos comunitarios en un lenguaje accesible.
- Triaje social en entornos rurales: el ejemplo de la model card (inestabilidad de la cadena de frío en medicación y barreras de transporte) ilustra su uso para identificar barreras logísticas y sugerir intervenciones comunitarias.
- Apoyo a la decisión clínica no clasificado como dispositivo: integrado como herramienta de evidencia de apoyo para profesionales licenciados bajo el encuadre FDA 520(o) que declara el autor.
- Despliegue en el borde con privacidad: al ser un adaptador sobre un modelo de 4B, puede ejecutarse en infraestructura local o en Vertex AI privado para evitar la salida de PHI, según la model card.
- Investigación en equidad sanitaria: útil para experimentos de clasificación SDoH reproducibles, dado que el autor publica procedencia en Zenodo (DOI 10.5281/zenodo.20647514).
- Prototipado de pipelines clínicos con PEFT: sirve como ejemplo de adaptación LoRA + DPO sobre Gemma 3 para equipos que quieran replicar la metodología en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el modelo base Gemma 3 4B en `bfloat16` requiere del orden de 8-10 GB, y el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo base, cabría en GPU de consumo con suficiente VRAM y en aceleradores de datacenter (A100, H100) para despliegues concurrentes.
- ¿Cabe en GPU de consumo? Probablemente sí con el modelo base en precisión reducida, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: el autor documenta Transformers + PEFT; también menciona Google Cloud Vertex AI para despliegue privado. No se confirman vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-sdoh-equity-compass | Adaptador LoRA sobre Gemma 3 4B | No disponible | SDoH / equidad sanitaria | Apache-2.0 | Hugging Face (0 descargas) |
| google/gemma-3-4b-it | ~4.000 M | No disponible en la informacion | Modelo base generalista instruct | Gemma license (no Apache-2.0) | Hugging Face |
| Alternativas SDoH comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores SDoH directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador declara únicamente soporte de inglés; no se garantiza calidad en castellano ni en otros idiomas.
- No se han publicado benchmarks ni métricas de evaluación, por lo que el rendimiento real en clasificación SDoH no está verificado de forma independiente.
- Riesgo de alucinación inherente a los modelos generativos: las recomendaciones de recursos comunitarios o intervenciones pueden ser inexactas y requerir validación humana.
- Sesgos potenciales derivados del dataset clínico de entrenamiento, cuya composición y tamaño no se detallan.
- El encuadre regulatorio (HIPAA Safe Harbor, FDA 520(o)) es una declaración del autor; no constituye certificación ni garantía de cumplimiento en producción.
- Aunque la licencia del adaptador es Apache-2.0, el modelo base Gemma 3 está sujeto a la licencia de Gemma, cuyos términos deben respetarse adicionalmente.
- El adaptador tiene 0 descargas y 0 valoraciones en el momento de la ficha; madurez y soporte comunitario no demostrados.
- No se especifican el rango LoRA, los hiperparámetros de entrenamiento ni la composición exacta de los datos, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/philgear/gemma-3-sdoh-equity-compass
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Modelo base Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Página de Gemma 3 de Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Procedencia en Zenodo (DOI): https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio de PocketGull: https://pocketgull.com
- Aplicación PocketGull: https://pocketgull.app
