# mradermacher/Qwen3.8-27B-Uncensored-NOESIS-BF16-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-NOESIS-BF16-i1-GGUF es una recopilación de cuantizaciones GGUF, generadas con matrices de importancia (imatrix), del modelo AMAImedia/Qwen3.8-27B-Uncensored-NOESIS-BF16. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, mientras que el modelo base procede de AMAImedia. El nombre sugiere una variante afinada de la familia Qwen con 27.320.697.856 parámetros totales (unos 27,3 mil millones) y un ajuste orientado a reducir el rechazo de contenido (etiquetado como "Uncensored").

El interés práctico de esta ficha reside en que ofrece el modelo en múltiples niveles de cuantización (desde i1-Q2_K de 11 GB hasta i1-Q6_K de 22,5 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama, algo inviable con los pesos BF16 originales. La licencia declarada es Apache 2.0 y la model card lista más de un centenar de idiomas, incluido el español.

No obstante, la información técnica disponible es escasa: no se documentan la longitud de contexto, los datos de entrenamiento, los resultados de benchmarks ni la arquitectura interna más allá de las etiquetas del repositorio. Esta ficha refleja exclusivamente lo que consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo indica la etiqueta "mtp" y la familia Qwen; no se detalla el tipo de transformer) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | más de 100 idiomas listados en la model card, entre ellos en, ru, zh, vi, kk, ja, es, fr, de, pt, it, ar, hi, ko, tr, etc. |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y BF16 en el modelo base |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Las etiquetas del repositorio apuntan a la familia Qwen (qwen3.5, qwen3.6, qwen3.8) y a la etiqueta "mtp", que en el contexto de la familia Qwen suele asociarse a multi-token prediction, pero no se confirma su función concreta. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Respecto al proceso de cuantización, el autor indica que se trata de cuantizaciones "weighted/imatrix" generadas a partir de los pesos BF16 del modelo base, con un fichero imatrix incluido para quien quiera generar sus propias cuantizaciones. La model card menciona además que existen cuantizaciones estáticas en un repositorio paralelo (mradermacher/Qwen3.8-27B-Uncensored-NOESIS-BF16-GGUF). No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica un ajuste orientado a diálogo.
- Multilingüismo amplio: la model card lista más de 100 idiomas, incluidos español, inglés, ruso, chino, vietnamita, kazajo, japonés, árabe, hindi, coreano y la mayoría de lenguas europeas.
- Ajuste "uncensored": el nombre del modelo base indica una reducción deliberada de las capas de rechazo, orientada a contenido que los modelos alineados estándar suelen declinar.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el modelo puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con las cuantizaciones i1-Q4_K_M (16,9 GB) o i1-Q5_K_M (19,6 GB) el modelo puede ejecutarse en una GPU de consumo de 24 GB (RTX 3090/4090) mediante llama.cpp u Ollama, lo que permite mantener conversaciones privadas sin enviar datos a un servicio externo.
- Investigación sobre alineación y censura: al tratarse de una variante "uncensored", resulta útil para estudiar cómo cambia el comportamiento del modelo al eliminar capas de rechazo, comparando respuestas con la versión alineada de la misma familia.
- Generación de texto creativo sin restricciones temáticas: útil para escritura de ficción, guiones o narrativa que aborde temas sensibles y que los modelos alineados suelen rechazar.
- Procesamiento multilingüe en local: la cobertura de más de 100 idiomas permite tareas de traducción, resumen o clasificación en lenguas minoritarias sin depender de APIs en la nube.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" y el formato GGUF facilitan montar un chatbot de prueba con Ollama en pocos minutos para validar flujos de producto.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 14 niveles de cuantización distintos, lo que permite medir la degradación de calidad (perplejidad, coherencia) entre i1-Q2_K y i1-Q6_K sobre el mismo modelo base.
- Fine-tuning ligero sobre la versión BF16: quien necesite ajustar el modelo puede partir de los pesos BF16 del repositorio base y usar las cuantizaciones GGUF solo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - i1-Q2_K: ~11,0 GB
  - i1-IQ3_S / i1-IQ3_M: ~12,7-12,9 GB
  - i1-Q4_K_M: ~16,9 GB
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
  - Pesos BF16 originales: ~54,6 GB (27,3 mil millones de parámetros × 2 bytes), más overhead de contexto.
- GPU recomendadas: para BF16, A100 80 GB o H100; para cuantizaciones Q4/Q5, RTX 3090 o RTX 4090 (24 GB) son suficientes; para Q2/Q3, GPUs de 12-16 GB como RTX 4080 o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: sí, con cuantizaciones de hasta i1-Q6_K en tarjetas de 24 GB; las versiones Q2-Q4 caben en 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base BF16 es compatible con transformers y, presumiblemente, con vLLM y TGI, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-NOESIS-BF16-i1-GGUF (este) | 27,3 mil M | no disponible | Apache 2.0 | GGUF (14 cuantizaciones) | Variante uncensored con imatrix |
| Qwen3.8-27B-Uncensored-NOESIS-BF16 (base) | 27,3 mil M | no disponible | Apache 2.0 | BF16 safetensors | Pesos originales sin cuantizar |
| Qwen3.8-27B-Uncensored-NOESIS-BF16-GGUF | 27,3 mil M | no disponible | Apache 2.0 | GGUF estático | Cuantizaciones estáticas del mismo autor |

No se dispone de información sobre otros modelos comparables de la misma categoría (tamaño y tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- El ajuste "uncensored" implica que el modelo puede generar contenido que otros modelos rechazan; es responsabilidad del desplegador aplicar sus propias salvaguardas y cumplir la normativa aplicable.
- No se documentan sesgos conocidos, pero la ausencia de información sobre el dataset de entrenamiento impide evaluar su composición y posibles sesgos.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es esperable, pero no hay datos que lo midan.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas.
- Las cuantizaciones de baja precisión (i1-Q2_K, i1-IQ3_S) degradan la calidad; la propia model card advierte de que Q2_K es inferior a IQ3_XXS y que Q4_0 es "rápida pero de baja calidad".
- Aunque la licencia es Apache 2.0, el modelo base procede de un tercero (AMAImedia) cuya documentación de origen no se incluye; conviene verificar los términos del modelo base antes de un uso comercial.
- El repositorio tiene 0 likes y 954 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No hay información sobre tool calling ni soporte de agentes, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-NOESIS-BF16-i1-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Uncensored-NOESIS-BF16
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-NOESIS-BF16-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-NOESIS-BF16-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
