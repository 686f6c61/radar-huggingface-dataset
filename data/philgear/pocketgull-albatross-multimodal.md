# philgear/pocketgull-albatross-multimodal

## Resumen

PocketGull Albatross es un adaptador LoRA (PEFT) desarrollado por PocketGull LLC, con Phillip Gear como responsable de informática, que se integra sobre el modelo base `google/gemma-3-12b-it`. Está diseñado para el ámbito clínico y sanitario, con el objetivo de sintetizar rondas clínicas multi-paradigma, biomecánica somática y modelos anatómicos espaciales 3D WebGL. El adaptador se ha afinado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos que cumplen con los estándares de desidentificación HIPAA Safe Harbor.

El modelo se presenta como una herramienta de apoyo a la decisión clínica (CDS) no regulada como dispositivo médico según la FDA 520(o), orientada a profesionales sanitarios licenciados. Está pensado para despliegue local o en Google Cloud Vertex AI, con énfasis en la privacidad y la no retención de datos de pacientes. Su relevancia radica en ofrecer una alternativa de código abierto y auditable para tareas de razonamiento clínico complejo, combinando paradigmas médicos occidentales, medicina tradicional china (MTC) y Ayurveda.

La arquitectura se basa en el modelo Transformer de Gemma 3 12B, con un adaptador LoRA que no modifica los pesos originales. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 12B) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA sobre Gemma 3 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; Gemma 3 soporta hasta 128k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT (LoRA), safetensors (previsible) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con Direct Preference Optimization (DPO) sobre el modelo base `google/gemma-3-12b-it`. No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el procedimiento de DPO. Los tags indican que los datos provienen de fuentes como NIH MedQuad y WHO mhGAP, ambos conjuntos de datos clinicos publicamente disponibles. El adaptador se ha disenado para mantener los pesos del modelo base congelados, lo que reduce los requisitos de memoria y permite una integracion sencilla mediante la libreria PEFT.

La innovacion principal no reside en la arquitectura del adaptador, sino en el dominio de aplicacion: la sintesis de planes de cuidado integrando tres paradigmas (medicina occidental, MTC y Ayurveda) junto con correlaciones de biomecanica somatica y generacion de modelos anatomicos 3D WebGL. El modelo base Gemma 3 12B ya incorpora capacidades multimodales y un contexto largo, aunque el adaptador no documenta modificaciones sobre estas capacidades.

## Capacidades

- Generacion de texto clinico: sintetiza planes de cuidado multi-paradigma, por ejemplo, combinando higiene del sueno occidental, puntos de estancamiento de Qi hepatico en MTC y nutricion pacificadora de Vata ayurvedica.
- Razonamiento diagnostico: correlaciona hallazgos clinicos como radiculopatia cervical C5-C6 con biomecanica somatica y puntos gatillo miofasciales del trapecio superior.
- Evaluacion de interacciones farmacologicas: analiza interacciones entre medicamentos y fitoterapia, como la hierba de San Juan con warfarina, considerando el metabolismo del CYP450.
- Integracion de anatomia espacial: genera modelos anatomicos 3D WebGL para visualizacion, aunque no se detalla el formato de salida.
- Soporte de tool calling: no documentado.
- Soporte de agentes: no documentado.
- Capacidades multilingues: solo ingles (en).

## Casos de uso

- Atencion clinica integrativa: generar planes de tratamiento que combinen medicina convencional, MTC y Ayurveda para pacientes con dolor cronico, como cefaleas tensionales, utilizando el prompt de ejemplo del widget.
- Apoyo al diagnostico musculoesqueletico: correlacionar hallazgos de imagen (como radiculopatia cervical) con evaluacion biomecanica y puntos gatillo, ayudando al clinico a estructurar la exploracion fisica.
- Revision de interacciones farmacologicas: evaluar riesgos de interacciones entre farmacos y suplementos, especialmente en pacientes polimedicados, antes de prescribir.
- Educacion medica continuada: generar casos clinicos ilustrativos que integren multiples paradigmas terapeuticos para formacion de residentes o estudiantes.
- Documentacion clinica estructurada: redactar resumenes de rondas clinicas con terminologia estandarizada y referencias a anatomía espacial.
- Investigacion en salud integrativa: explorar correlaciones entre sintomas, biomecanica y terapias complementarias mediante generacion de hipotesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Gemma 3 12B, los requisitos de VRAM son equivalentes a los del modelo base. En bfloat16, Gemma 3 12B requiere aproximadamente 24 GB de VRAM para inferencia.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o superiores con al menos 24 GB de memoria.
- No se confirma si cabe en GPUs de consumo, aunque una RTX 4090 de 24 GB seria suficiente para el modelo base, y el adaptador anade un coste minimo.
- Opciones de despliegue: Transformers con PEFT, vLLM, TGI, llama.cpp (si se convierte a GGUF), o servicios gestionados como Google Cloud Vertex AI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio clinico integrativo. El modelo base Gemma 3 12B se puede comparar con otros LLMs generalistas de tamano similar, pero el adaptador esta especializado y no existen datos publicos de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo afinado sobre datos clinicos publicos, puede heredar sesgos presentes en esos conjuntos.
- Riesgo de alucinacion: no cuantificado; se recomienda verificacion profesional de cualquier salida antes de su uso clinico.
- Limitaciones de contexto e idioma: solo ingles; no se documenta la longitud de contexto efectiva del adaptador.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor declara que es una herramienta de apoyo y no un dispositivo medico (FDA 520(o) non-device). Los usuarios son responsables del cumplimiento normativo local.
- Caveat para produccion: el modelo no ha sido validado en entornos clinicos reales; no hay datos de seguridad ni eficacia publicados. Cero descargas y cero likes en HuggingFace sugieren una adopcion muy limitada.

## Enlaces

- [HuggingFace - philgear/pocketgull-albatross-multimodal](https://huggingface.co/philgear/pocketgull-albatross-multimodal)
- [GitHub - philgear/pocketgull](https://github.com/philgear/pocketgull)
- [Sitio web de PocketGull](https://pocketgull.com)
- [DOI Zenodo 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)
- [ORCID de Phillip Gear](https://orcid.org/0009-0008-1372-5381)
