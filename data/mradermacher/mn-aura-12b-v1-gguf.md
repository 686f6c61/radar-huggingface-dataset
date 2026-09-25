# mradermacher/MN-Aura-12B-v1-GGUF

## Resumen

MN-Aura-12B-v1-GGUF es la versión cuantizada en formato GGUF del modelo EldritchLabs/MN-Aura-12B-v1, un modelo de lenguaje de 12.247.956.480 parámetros (aproximadamente 12,2 mil millones) orientado a escritura creativa, narrativa de ficción y roleplay. La cuantización la ha realizado mradermacher, un autor conocido en HuggingFace por producir versiones GGUF de modelos comunitarios para su uso en llama.cpp y otras herramientas de inferencia local. El modelo original procede de EldritchLabs y se ha construido mediante mergekit, es decir, fusionando varios modelos derivados de Mistral Nemo en lugar de entrenarse desde cero.

El interés principal de esta ficha radica en que permite ejecutar un modelo de 12B especializado en prosa vívida y generación de tramas en hardware de consumo, gracias a la disponibilidad de cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB). La licencia Apache 2.0 facilita su uso tanto en proyectos personales como comerciales, sin las restricciones habituales de otros modelos de roleplay.

Al tratarse de una fusión de modelos Mistral Nemo, hereda la arquitectura transformer decoder-only de esa familia, aunque la model card no documenta explícitamente la longitud de contexto final ni detalles del proceso de mezcla. El modelo está orientado exclusivamente al inglés y su especialización está claramente sesgada hacia la escritura creativa y la interpretación de personajes, no hacia tareas de razonamiento técnico o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral Nemo, según las etiquetas del modelo) |
| Parametros totales | 12.247.956.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Mistral Nemo soporta hasta 128.000 tokens, pero la model card no lo confirma para esta fusión) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (también existen cuantizaciones ponderadas/imatrix en el repositorio MN-Aura-12B-v1-i1-GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base están en safetensors) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión realizada con mergekit (etiqueta mergekit-exp), lo que implica que no se ha entrenado desde cero, sino que se han combinado los pesos de dos o más modelos derivados de Mistral Nemo. Las etiquetas asociadas incluyen aura, mistral-nemo, mistral y nemo, lo que confirma que la base arquitectónica es la familia Mistral Nemo (12B, transformer decoder-only). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO, ya que la model card del repositorio cuantizado no los detalla.

La innovación técnica principal de este repositorio no está en el modelo en sí, sino en el trabajo de cuantización: mradermacher ofrece un abanico completo de cuantizaciones estáticas (x-f16, Q8_0 hasta Q2_K) y una variante adicional con cuantización ponderada/imatrix para quienes buscan mejor relación calidad-tamaño. Los archivos se generan con la librería transformers como referencia y están pensados para su uso directo en llama.cpp y entornos compatibles.

## Capacidades

- Generación de texto creativo en inglés: ficción, prosa vívida, descripciones detalladas.
- Escritura de relatos y novelas: generación de tramas, subtramas y continuación de escenas.
- Roleplay e interpretación de personajes (RP), incluyendo diálogo conversacional sostenido.
- Cobertura de múltiples géneros: ciencia ficción, romance y otros géneros narrativos según las etiquetas del autor.
- Estilo narrativo orientado a "vivid prosing", es decir, prosa descriptiva y sensorial.
- Conversación multi-turno con registro coloquial, incluyendo lenguaje soez (etiqueta swearing).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento matemático, código ni visión.
- Capacidad multilingüe limitada al inglés declarado en la model card.

## Casos de uso

- Escritura asistida de ficción: el modelo puede continuar escenas, proponer giros de trama y mantener la voz narrativa a lo largo de capítulos, gracias a su especialización en "scene continue" y "story generation".
- Generación de tramas y subtramas para guionistas o novelistas: se le puede pedir un esquema argumental completo con conflictos secundarios coherentes.
- Motores de roleplay para videojuegos o chatbots de personaje: permite diálogos en primera persona con personalidad consistente y registro coloquial, útil para experiencias conversacionales inmersivas.
- Prototipado de narrativa interactiva (ficción ramificada): el modelo responde a elecciones del lector generando continuaciones coherentes dentro de un mismo hilo.
- Redacción de ficción de género (ciencia ficción, romance): sirve como borrador inicial que el autor humano revisa y pule, reduciendo el tiempo de arranque creativo.
- Herramientas de escritura local y privada: al distribuirse en GGUF y caber en GPUs de consumo, permite construir aplicaciones de escritura sin enviar el texto del usuario a servicios en la nube.
- Sesiones de brainstorming narrativo con contexto largo: si se confirma el contexto de 128k heredado de Mistral Nemo, permitiría mantener novelas o guiones extensos dentro de una misma ventana de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de escritura creativa, y tampoco se han encontrado en la búsqueda web datos numéricos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del archivo más caché KV y overhead de runtime, aproximadamente 1-2 GB adicionales):
  - Q2_K (4,9 GB): unos 6-7 GB de VRAM.
  - Q3_K_M (6,2 GB): unos 7,5-8,5 GB.
  - IQ4_XS (6,9 GB): unos 8-9 GB.
  - Q4_K_S / Q4_K_M (7,2 / 7,6 GB): unos 9-10 GB.
  - Q5_K_M (8,8 GB): unos 10-11 GB.
  - Q6_K (10,2 GB): unos 12-13 GB.
  - Q8_0 (13,1 GB): unos 15 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 para cuantizaciones Q4-Q5; RTX 4080/4090 (16-24 GB) para Q6_K y Q8_0 con contexto moderado; A100 40/80 GB, H100 o L40S para servir el modelo en producción con alta concurrencia.
- Compatibilidad con GPU de consumo: sí. Incluso una GPU de 8 GB puede ejecutar Q3_K_S o Q2_K, aunque con pérdida de calidad notable en Q2. Una GPU de 12 GB ejecuta Q4_K_M con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga), koboldcpp y otros frontends compatibles con GGUF. Para servir el modelo en producción se puede usar llama.cpp en modo servidor; vLLM y TGI normalmente trabajan sobre los pesos en safetensors del modelo base, no sobre los GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware, la cuantización y la longitud de contexto; con Q4_K_M en una RTX 4090 es habitual obtener decenas de tokens por segundo, pero no hay cifras publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MN-Aura-12B-v1 (objeto de esta ficha) | 12,2B | no disponible | Escritura creativa, ficción, RP | apache-2.0 | GGUF (repos mradermacher) |
| MN-Raven-12B-v1 | 12B (según etiqueta del modelo) | no disponible | Escritura creativa, RP, tono gótico | apache-2.0 | GGUF (mradermacher) |
| Aura-12B (y Aura-12B-FT) | no disponible | no disponible | Escritura creativa | no disponible | GGUF (mradermacher) |
| Mistral Nemo Base | 12B | 128.000 tokens (arquitectura base) | Propósito general | Apache 2.0 (licencia de Mistral Nemo) | safetensors, GGUF de terceros |

La comparación cuantitativa de rendimiento no es posible porque ninguno de los repositorios consultados publica benchmarks. Los modelos listados comparten el mismo linaje Mistral Nemo y un enfoque similar hacia la escritura creativa, por lo que la elección entre ellos dependerá del estilo que prefiera cada usuario y de la licencia específica de cada fusión.

## Limitaciones y advertencias

- Sesgos: al ser una fusión de modelos entrenados principalmente con datos en inglés, reproducirá los sesgos culturales, de género y de representación presentes en esos corpus.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres y coherencia narrativa aparente sin base real; en ficción esto es tolerable, pero invalida su uso para tareas factuales.
- Limitación de idioma: la model card declara únicamente inglés (en). Su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contenido sensible: las etiquetas incluyen swearing y roleplay; el modelo puede producir lenguaje soez o contenido para adultos si se le solicita, por lo que requiere filtros si se expone a usuarios finales.
- Ausencia de especialización técnica: no hay evidencia de capacidades de código, matemáticas, tool calling ni razonamiento multi-paso. No es adecuado como agente ni para pipelines de ingeniería.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base original (EldritchLabs/MN-Aura-12B-v1) y de los modelos fusionados, ya que una fusión puede heredar obligaciones de sus componentes.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la coherencia y la calidad de la prosa; para escritura creativa se recomienda Q5_K_M o superior.
- Datos incompletos: no se documentan la longitud de contexto efectiva, el proceso de fusión ni los datos de entrenamiento, lo que dificulta evaluar su comportamiento en producción con prompts largos.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/MN-Aura-12B-v1-GGUF
- Modelo base original: https://huggingface.co/EldritchLabs/MN-Aura-12B-v1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/MN-Aura-12B-v1-i1-GGUF
- Página resumen del autor para este modelo: https://hf.tst.eu/model#MN-Aura-12B-v1-GGUF
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Reflexiones sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Modelo relacionado MN-Raven-12B-v1-GGUF: https://huggingface.co/mradermacher/MN-Raven-12B-v1-GGUF
- Modelo relacionado Aura-12B-GGUF: https://huggingface.co/mradermacher/Aura-12B-GGUF
