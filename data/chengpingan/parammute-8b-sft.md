# chengpingan/ParamMute-8B-SFT

## Resumen

ParamMute-8B-SFT es un checkpoint de ajuste supervisado (SFT) publicado junto con el articulo "ParamMute: Suppressing Knowledge-Critical FFNs for Faithful Retrieval-Augmented Generation", aceptado en NeurIPS 2025. El modelo parte de Meta-Llama-3-8B y aplica la tecnica ParamMute, que suprime la activacion de determinadas capas feed-forward (concretamente las capas 19 a 26) para reducir la interferencia del conocimiento memorizado del modelo cuando este entra en conflicto con la evidencia recuperada en un pipeline de generacion aumentada por recuperacion (RAG).

El problema que aborda es la infidelidad contextual en RAG: cuando el contexto recuperado contradice lo que el modelo "recuerda" de su preentrenamiento, los LLM tienden a priorizar su memoria interna sobre la evidencia externa, produciendo respuestas incorrectas o alucinadas. ParamMute identifica las FFN criticas para el conocimiento parametrico y las atenua durante la inferencia, favoreciendo que el modelo siga la evidencia recuperada.

El modelo tiene 8.000 millones de parametros, esta entrenado principalmente en ingles, se distribuye bajo licencia MIT y usa el formato de pesos safetensors con la libreria transformers. Su relevancia actual radica en que ofrece una via de bajo coste (sin reentrenamiento completo) para mejorar la fidelidad en sistemas RAG de produccion donde la precision factual frente a fuentes externas es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), con supresion de activaciones en FFN de capas 19-26 |
| Parametros totales | 8.000 millones (aproximado, derivado de Llama 3 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Meta-Llama-3-8B, segun la model card construido sobre la variante Instruct. La innovacion principal de ParamMute consiste en identificar las capas feed-forward criticas para el conocimiento parametrico (en este checkpoint, las capas 19 a 26) y suprimir sus activaciones durante la inferencia. Este mecanismo reduce la tendencia del modelo a recuperar respuestas memorizadas cuando el contexto RAG aporta evidencia contradictoria.

El entrenamiento combina un ajuste supervisado (SFT) sobre el modelo base con el esquema de supresion de activaciones de ParamMute. El autor publica el dataset de entrenamiento asociado (ParamMute-Training-Data) y el benchmark de evaluacion CoFaithfulQA. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles con el conocimiento y las capacidades heredadas de Llama 3 8B.
- RAG fiel: prioriza la evidencia recuperada sobre el conocimiento memorizado cuando ambos entran en conflicto.
- Razonamiento contextual sobre documentos externos, orientado a tareas de question answering con contexto.
- Capacidades generales de Llama 3 8B (redaccion, resumen, comprension lectora) en la medida en que la supresion de FFN no las degrade.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (se heredaria del base, sin confirmar).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Sistemas RAG de atencion al cliente: el modelo puede responder usando la documentacion recuperada de una base de conocimiento aunque contradiga lo que "recuerda" del preentrenamiento, reduciendo respuestas obsoletas o incorrectas.
- Verificacion de hechos contra fuentes externas: en pipelines de fact-checking, la supresion de FFN criticas favorece que la respuesta se base en el pasaje recuperado y no en la memoria parametrica.
- Asistentes sobre documentacion corporativa interna: util cuando la empresa actualiza politicas o precios y el modelo debe seguir la version vigente recuperada del repositorio documental.
- Question answering sobre normativa y legislacion: escenarios donde la evidencia recuperada (texto legal actualizado) debe prevalecer sobre el conocimiento previo del modelo.
- Investigacion en fidelidad de RAG: el checkpoint sirve como referencia reproducible para estudiar la tension entre conocimiento parametrico y contextual, junto con el benchmark CoFaithfulQA.
- Generacion de respuestas con citas en dominios cientificos: cuando se recuperan abstracts o papers y se necesita que la respuesta refleje fielmente el contenido recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las metricas de normalizacion y recall definidas en la Seccion 5 del articulo (arXiv:2502.15543) y al benchmark CoFaithfulQA para evaluar la fidelidad contextual, pero no se incluyen cifras numericas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de 8.000 millones de parametros en fp16 se requieren aproximadamente 16 GB de VRAM, y en cuantizacion de 8 bits alrededor de 8-9 GB (estimacion generica, no confirmada para este checkpoint).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar A100, H100 o RTX 4090 para fp16.
- Cabe en GPU de consumo: probable en RTX 3090/4090 en fp16 y en GPUs con 8-12 GB si se aplica cuantizacion (no confirmado).
- Opciones de despliegue: transformers (libreria indicada en la model card); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParamMute-8B-SFT | 8.000 M | no disponible | RAG fiel con supresion de FFN | MIT | Hugging Face |
| Meta-Llama-3-8B-Instruct | 8.000 M | no disponible | LLM generalista con instrucciones | Llama 3 Community License | Hugging Face |
| Alternativas especificas de fidelidad RAG | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros metodos de fidelidad en RAG no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado principalmente en ingles; su rendimiento en castellano u otros idiomas no esta documentado.
- La supresion de activaciones en las capas 19-26 puede degradar capacidades generales que dependen de ese conocimiento parametrico; no se aportan mediciones de dicho impacto.
- Riesgo de alucinacion persistente cuando no se recupera evidencia relevante o cuando el contexto recuperado es de baja calidad.
- Sesgos: no documentados en la informacion proporcionada; se heredarian los del modelo base Llama 3.
- La licencia MIT del checkpoint no exime de cumplir las condiciones de la licencia del modelo base Meta-Llama-3-8B para uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se especifican requisitos de despliegue, cuantizaciones soportadas ni latencias, lo que dificulta planificar su uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/chengpingan/ParamMute-8B-SFT
- arXiv: https://arxiv.org/abs/2502.15543
- NeurIPS 2025 proceedings: https://doi.org/10.52202/085713-3356
- Codigo y evaluacion: https://github.com/OpenBMB/ParamMute
- Pagina del proyecto: https://passionate11.github.io/ParamMute-project-page/
- Dataset de entrenamiento: https://huggingface.co/datasets/chengpingan/ParamMute-Training-Data
- Benchmark CoFaithfulQA: https://huggingface.co/datasets/chengpingan/CoFaithfulQA
