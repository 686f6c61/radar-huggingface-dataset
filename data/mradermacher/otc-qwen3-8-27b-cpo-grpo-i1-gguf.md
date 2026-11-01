# mradermacher/OTC-Qwen3.8-27B-CPO-GRPO-i1-GGUF

## Resumen

OTC-Qwen3.8-27B-CPO-GRPO-i1-GGUF es una cuantizacion en formato GGUF del modelo OTC-Qwen3.8-27B-CPO-GRPO, publicado por el usuario mradermacher en Hugging Face. El repositorio contiene unicamente pesos cuantizados (generados con el pipeline de imatrix de mradermacher, etiquetado como version de cuantizacion 2), no el modelo original: la fuente declarada es `frankleaf/OTC-Qwen3.8-27B-CPO-GRPO`. El nombre sugiere un modelo derivado de la familia Qwen3 de 27B, afinado con tecnicas de preferencia (CPO, Contrastive Preference Optimization, y GRPO, Group Relative Policy Optimization), pero esta inferencia procede exclusivamente de la nomenclatura y no esta confirmada por la model card.

La informacion disponible es muy limitada: no hay model card descriptiva, no se declaran licencia, idiomas ni pipeline, y el repositorio figura con 0 descargas y 0 likes en el momento de la consulta. Los metadatos de parametros resultan contradictorios: el campo de parametros totales reporta 6.789.424, mientras que el nombre del modelo indica 27B y las busquedas web describen el modelo base como "Reinforcement Learning model with 27B parameters". Esta discrepancia debe tratarse con cautela.

Por tanto, esta ficha documenta lo que puede verificarse y marca explicitamente como "no disponible" todo aquello que la informacion proporcionada no permite confirmar. No debe interpretarse como una evaluacion de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Qwen3; sin confirmar) |
| Parametros totales | 6.789.424 segun metadatos de safetensors; el nombre indica 27B (dato contradictorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo fuente se distribuye aparte |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la documentacion proporcionada. El nombre del modelo apunta a un transformer de la familia Qwen3 con 27B parametros, pero no hay confirmacion en la model card ni en los metadatos. El sufijo CPO-GRPO sugiere un proceso de alineacion en dos fases: CPO (optimizacion de preferencias contrastiva) y GRPO (optimizacion de politica relativa a grupos, popularizada por DeepSeek), pero se desconoce el dataset, el numero de tokens de entrenamiento, la composicion de datos y si hubo fases adicionales de SFT o RLHF.

Lo unico verificable es el proceso de cuantizacion: el repositorio aplica cuantizaciones ponderadas con matriz de importancia (imatrix) sobre el modelo fuente `frankleaf/OTC-Qwen3.8-27B-CPO-GRPO`, con `quantize_version: 2` y `output_tensor_quantised: 1`. No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.).

## Capacidades

- Generacion de texto: no confirmada en la documentacion, pero esperable en un modelo de lenguaje de esta familia.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo con llama.cpp u Ollama en GPUs con VRAM limitada, aunque el tamano real del modelo (27B) condiciona el requisito a aproximadamente 16-20 GB en Q4.
- Experimentacion con modelos afinados por preferencias: util para investigadores que quieran comparar el efecto de CPO + GRPO frente al modelo base, siempre que se verifique la procedencia del modelo fuente.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece un espectro amplio de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite estudiar la degradacion de calidad segun el nivel de compresion.
- Prototipado de asistentes conversacionales offline: con una cuantizacion Q5_K_M o Q6_K en una GPU de 24 GB (RTX 3090/4090) se puede desplegar un chatbot local sin dependencia de API, sujeto a validacion previa de calidad.
- Fine-tuning posterior sobre la version cuantizada: no recomendable en GGUF; para ajuste fino habria que partir del modelo fuente en safetensors.
- Integracion en pipelines de inferencia con vLLM o TGI: requeriria los pesos originales en safetensors, no las cuantizaciones GGUF de este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (asumiendo 27B parametros, no confirmado): aproximadamente 8-10 GB en IQ1/IQ2, 12-14 GB en Q3, 16-18 GB en Q4, 20-22 GB en Q5, 24-28 GB en Q6, y 30 GB o mas en Q8 (no incluida en este repo).
- GPU recomendadas: RTX 4090 (24 GB) para Q4-Q5; A100 40 GB o H100 80 GB para cuantizaciones altas o contexto largo; RTX 3090 como alternativa economica para Q4.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 12 GB solo con IQ2/IQ3 y posible offload a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones verificables de modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia en el numero de parametros: los metadatos indican 6.789.424 parametros, mientras que el nombre y las busquedas web apuntan a 27B. Verificar antes de cualquier uso en produccion.
- Ausencia total de model card descriptiva: no hay informacion sobre entrenamiento, datos, sesgos o comportamiento esperado.
- Licencia no declarada: no se puede confirmar el uso comercial. El modelo fuente (`frankleaf/OTC-Qwen3.8-27B-CPO-GRPO`) deberia consultarse para conocer la licencia aplicable.
- Riesgo de alucinacion: desconocido, pero inherente a modelos de lenguaje sin evaluacion publicada.
- Idiomas no declarados: no se garantiza soporte de castellano ni de otros idiomas.
- Repositorio sin traccion (0 descargas, 0 likes): no hay evidencia de comunidad, validacion o reportes de uso.
- El nombre "OTC" y la procedencia del modelo fuente no estan documentados; conviene tratar el modelo como experimental.
- Las cuantizaciones de baja precision (IQ1, IQ2) degradan notablemente la calidad; no recomendadas para tareas de razonamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OTC-Qwen3.8-27B-CPO-GRPO-i1-GGUF
- Modelo fuente declarado: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO
- Repositorio relacionado (misma familia, distinto afinado): https://huggingface.co/mradermacher/OTC-Qwen3.8-27B-CPO-GRPO-GGUF
- Repositorio relacionado: https://huggingface.co/mradermacher/Qwen3.8-Couture-Engine-27B-i1-GGUF
