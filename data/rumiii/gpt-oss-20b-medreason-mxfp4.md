# Rumiii/gpt-oss-20b-MedReason-MXFP4

## Resumen

gpt-oss-20b-MedReason-MXFP4 es una versión cuantizada en MXFP4 del modelo Rumiii/gpt-oss-20b-MedReason, que a su vez es un ajuste fino de openai/gpt-oss-20b orientado a razonamiento médico. El modelo base gpt-oss-20b es un transformer denso de OpenAI publicado con licencia Apache 2.0, con aproximadamente 20.900 millones de parámetros y una ventana de contexto diseñada para cargas conversacionales y de razonamiento. Esta variante concreta aplica cuantización MXFP4 (formato de 4 bits con escala compartida por bloque, empaquetado en safetensors de 8 bits según los tags del repositorio) para reducir el peso del modelo hasta los 13,8 GB del repositorio.

El interés de esta ficha radica en que combina tres capas de transformación: el modelo base de OpenAI, un ajuste fino médico (MedReason) del que no se documentan detalles en la model card, y una cuantización MXFP4 generada presumiblemente con herramientas de Unsloth. El resultado es un artefacto de 20.914.757.184 parámetros totales que se distribuye en formato transformers/safetensors y que, por su licencia Apache 2.0, puede emplearse en entornos comerciales sin restricciones adicionales.

No obstante, la información pública disponible es extremadamente escasa: el repositorio no incluye model card detallada, no declara idiomas soportados, no publica benchmarks y no especifica la composición del dataset de ajuste fino médico. Esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo lo que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia gpt_oss), según el tag `gpt_oss` del repositorio |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | MXFP4 (4 bits con escala por bloque); el repositorio se etiqueta como `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base openai/gpt-oss-20b pertenece a la familia gpt_oss de OpenAI, etiquetada en el repositorio como `gpt_oss`. Se trata de un transformer denso de aproximadamente 20.900 millones de parámetros. La model card de esta variante no aporta detalles sobre el número de capas, dimensión oculta, mecanismos de atención ni estrategia de posicionamiento, por lo que esos datos deben consultarse en la documentación del modelo base original de OpenAI.

El ajuste fino MedReason se describe únicamente como "gpt-oss-20b fine-tuned on medical reasoning". No se especifica el volumen de tokens de entrenamiento, la composición del dataset médico, si se emplearon técnicas de RLHF, DPO o SFT supervisado, ni si hubo una fase de razonamiento con cadena de pensamiento. La cuantización MXFP4 se generó con herramientas de Unsloth (tag `unsloth`) y se distribuye en safetensors. No hay información sobre calibración, pérdida de calidad respecto al modelo sin cuantizar ni metodología de evaluación.

## Capacidades

- Generación de texto conversacional en formato transformers (`text-generation`).
- Razonamiento especializado en dominio médico, según la denominación MedReason del ajuste fino.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue en infraestructuras de inferencia compatibles con la API de transformers.
- Soporte de cuantización MXFP4 para reducir el peso en memoria.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.

## Casos de uso

- Asistencia a la documentación clínica: el ajuste fino médico permite generar resúmenes de historiales, notas de evolución o informes estructurados a partir de texto clínico, aprovechando el dominio especializado del modelo.
- Apoyo a la decisión diagnóstica en entornos de investigación: el modelo puede emplearse como componente de razonamiento en pipelines que plantean casos clínicos y requieren explicaciones paso a paso, siempre con supervisión humana.
- Educación médica y simulación de casos: generación de preguntas de examen, explicaciones fisiopatológicas y discusión de diagnósticos diferenciales en plataformas de formación.
- Extracción de información de literatura biomédica: el modelo puede procesar abstracts y artículos para extraer entidades, relaciones y conclusiones, integrándose en pipelines de transformers.
- Despliegue en hardware limitado: gracias a la cuantización MXFP4 y a los 13,8 GB del repositorio, puede servirse en GPUs de consumo alto (24 GB) o en instancias cloud de gama media, lo que abarata prototipos de investigación médica.
- Chatbot de triaje informativo: conversaciones multi-turno con pacientes para orientación inicial, con derivación a profesionales, aprovechando el ajuste fino en razonamiento médico y la licencia Apache 2.0 para uso comercial.
- Integración en pipelines de CI/CD para validación de contenido médico: comprobación automática de coherencia y terminología en documentación regulatoria o materiales de formación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 13,8 GB, por lo que en MXFP4 se necesita un mínimo de aproximadamente 14-16 GB de VRAM para cargar los pesos, más memoria para el contexto y el estado de activaciones.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX A6000 para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para prototipos y desarrollo.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y modelos con 24 GB o más, siempre que se ajuste la longitud de contexto.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-MedReason-MXFP4 | 20.914.757.184 | no disponible | Apache 2.0 | safetensors (MXFP4) | Ajuste fino médico + cuantización MXFP4 |
| openai/gpt-oss-20b | ~20.900 millones | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base original de OpenAI |
| Rumiii/gpt-oss-20b-MedReason | no disponible | no disponible | Apache 2.0 | safetensors | Ajuste fino médico sin cuantizar |
| Alternativas médicas de 20B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un ajuste fino sobre datos médicos no especificados, puede heredar sesgos de la fuente de entrenamiento y del modelo base.
- Riesgo de alucinación relevante en dominio médico: el modelo puede generar afirmaciones clínicas plausibles pero incorrectas; no debe usarse como sustituto del juicio profesional.
- La cuantización MXFP4 introduce pérdida de precisión respecto al modelo sin cuantizar; no se ha publicado ninguna evaluación de degradación.
- No se declaran idiomas soportados; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada: no se puede garantizar el manejo de documentos clínicos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de documentación sobre el dataset de ajuste fino impide verificar el cumplimiento regulatorio en aplicaciones sanitarias (por ejemplo, MDR en la UE).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se dispone de información sobre tool calling, agentes o modo thinking, por lo que no deben asumirse estas capacidades en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Rumiii/gpt-oss-20b-MedReason-MXFP4
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Ajuste fino de origen: https://huggingface.co/Rumiii/gpt-oss-20b-MedReason (referenciado en la model card)
- Unsloth (herramienta de cuantización citada en los tags): https://huggingface.co/unsloth
