# mradermacher/gemma-4-31B-it-Claude-Opus-Distill-v2-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF en formato i1 (imatrix) del modelo `TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2`, un fine-tuning de la arquitectura Gemma 4 de Google (31B parámetros) destilado a partir de los razonamientos de Claude Opus 4.6. El autor de la cuantización es mradermacher, que ha generado una amplia gama de archivos GGUF con distintos niveles de compresión (desde IQ1_S hasta Q6_K) para facilitar la ejecución local en hardware variado.

El modelo base fue desarrollado por TeichAI sobre `unsloth/gemma-4-31B-it` y entrenado con datasets de razonamiento de alta calidad extraídos de interacciones con Claude Opus 4.6. Su objetivo es transferir capacidades de razonamiento complejo a un modelo abierto con licencia Apache 2.0. Esta versión cuantizada permite desplegarlo en entornos con recursos limitados, manteniendo un equilibrio entre tamaño y fidelidad.

La relevancia actual radica en que ofrece una alternativa de razonamiento avanzado en formato GGUF, compatible con herramientas como llama.cpp, Ollama o text-generation-inference, sin necesidad de infraestructura de servidores dedicados. Además, la model card indica que se trata de un modelo de visión, por lo que puede procesar entradas multimodales (imágenes) además de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, basada en `unsloth/gemma-4-31B-it`) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de archivo imatrix) |
| Idiomas soportados | Ingles (etiquetado como `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion i1) |

## Arquitectura y entrenamiento

El modelo base `TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2` es un fine-tuning de la arquitectura Gemma 4 de Google, concretamente de la variante `unsloth/gemma-4-31B-it`. Se trata de un transformer denso de 30,7B parametros, optimizado mediante la tecnica de destilacion de razonamiento: se entrenaron los pesos del modelo para replicar las cadenas de razonamiento generadas por Claude Opus 4.6 en tareas complejas. Los datasets utilizados son `TeichAI/Claude-Opus-4.6-Reasoning-887x`, `TeichAI/claude-4.5-opus-high-reasoning-250x` y `Crownelius/Opus-4.6-Reasoning-2100x-formatted`, todos centrados en razonamiento de alto esfuerzo.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, el uso de tecnicas como RLHF o DPO, ni sobre innovaciones arquitectonicas especificas mas alla de la destilacion. La cuantizacion i1 aplicada por mradermacher utiliza la tecnica de imatrix (importance matrix) para mejorar la calidad de los quants de baja precision, y se ofrece tanto en versiones estaticas como en versiones con pesos ponderados.

## Capacidades

- Generacion de texto y razonamiento complejo: el modelo esta especificamente entrenado para seguir cadenas de razonamiento extensas, lo que lo hace adecuado para problemas de logica, matematicas y analisis.
- Procesamiento de vision: segun la model card, es un modelo de vision, por lo que puede aceptar imagenes como entrada (los archivos mmproj se encuentran en el repositorio estatico).
- Conversacion multi-turno: etiquetado como `conversational`, apto para chatbots y asistentes.
- Compatibilidad con text-generation-inference y endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en entornos de servidor estandar.
- No se ha confirmado soporte explicito para tool calling o function calling en la informacion disponible.

## Casos de uso

- Asistente de razonamiento para analisis de datos: el modelo puede descomponer problemas estadisticos o financieros en pasos logicos, ayudando a interpretar resultados o disenar experimentos.
- Generacion de codigo con explicaciones: gracias a su capacidad de razonamiento, puede escribir fragmentos de codigo y justificar cada decision, util en entornos de desarrollo colaborativo.
- Procesamiento de documentos con imagenes: al ser un modelo de vision, puede extraer informacion de graficos, diagramas o capturas de pantalla y razonar sobre ellos.
- Chatbot de soporte tecnico: su naturaleza conversacional y su capacidad de seguir instrucciones complejas lo hacen apto para atender consultas de usuarios con multiples pasos.
- Educacion y tutoria: puede explicar conceptos cientificos o matematicos paso a paso, adaptando el nivel de detalle segun la peticion.
- Prototipado rapido de agentes de IA: al ser un modelo GGUF, puede integrarse en pipelines locales con llama.cpp o Ollama para experimentar con agentes de razonamiento sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo cuantizado ni para su version base.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamaño de los archivos GGUF, se puede estimar:
  - i1-IQ1_S (7,3 GB): cabe en GPUs con 8 GB de VRAM (ej. RTX 3060, RTX 4060).
  - i1-Q4_K_M (18,8 GB): requiere al menos 20 GB de VRAM (ej. RTX 3090, RTX 4090, A5000).
  - i1-Q6_K (25,3 GB): necesita 28 GB o mas (ej. A100 40GB, RTX 6000 Ada).
- GPU recomendadas: para cuantizaciones medias (Q4_K_M), una RTX 3090 o 4090 es suficiente; para las mas altas, se recomienda una A100 o H100.
- Compatibilidad con consumer GPU: si, las versiones de baja cuantizacion (IQ1, IQ2, Q3) pueden ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI), vLLM (si se convierte a otro formato), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia, el modelo base sin cuantizar (`TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2`) es la alternativa directa, y existe una variante "heretic" (abliterated) del mismo autor que elimina restricciones de seguridad. Otros modelos de tamano similar en el ecosistema GGUF incluyen Gemma 3 27B y Llama 3 30B, pero no se han encontrado benchmarks publicos que permitan una comparacion objetiva.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| gemma-4-31B-it-Claude-Opus-Distill-v2 (base) | 30,7B | No disponible | Apache 2.0 | safetensors |
| gemma-4-31B-it-Claude-Opus-Distill-v2-heretic | 30,7B | No disponible | Apache 2.0 | GGUF |
| Este modelo (i1-GGUF) | 30,7B | No disponible | Apache 2.0 | GGUF |

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado exclusivamente como `en`; su rendimiento en otros idiomas no esta garantizado.
- Perdida de calidad por cuantizacion: las versiones de baja precision (IQ1, IQ2) pueden degradar significativamente la coherencia y el razonamiento; se recomienda usar al menos Q4_K_M para tareas criticas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en razonamientos extensos.
- Sesgos: al estar entrenado sobre datos de razonamiento de Claude Opus, puede heredar sesgos presentes en esos datos, aunque no se han documentado explicitamente.
- Limitaciones de vision: aunque es un modelo de vision, los archivos mmproj se encuentran en el repositorio estatico; este repositorio i1 solo contiene los pesos del language model.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar el cumplimiento de las politicas de los datasets de entrenamiento.
- Fecha de creacion: el modelo fue creado en agosto de 2026, por lo que su vigencia y soporte a largo plazo no estan asegurados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-31B-it-Claude-Opus-Distill-v2-i1-GGUF
- Modelo base: https://huggingface.co/TeichAI/gemma-4-31B-it-Claude-Opus-Distill-v2
- Repositorio estatico (quants sin i1): https://huggingface.co/mradermacher/gemma-4-31B-it-Claude-Opus-Distill-v2-GGUF
- Variante "heretic" (abliterated): https://huggingface.co/mradermacher/gemma-4-31B-it-Claude-Opus-Distill-v2-heretic-i1-GGUF
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
  - https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
  - https://huggingface.co/datasets/Crownelius/Opus-4.6-Reasoning-2100x-formatted
