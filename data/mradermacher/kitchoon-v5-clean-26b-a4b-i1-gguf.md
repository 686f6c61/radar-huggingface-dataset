# mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF

## Resumen

Kitchoon-V5-Clean-26B-A4B-i1-GGUF es una cuantización en formato GGUF del modelo Kitchoon-V5-Clean-26B-A4B, publicada por el usuario mradermacher, conocido en el ecosistema de Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base, alojado por SubMaroon, tiene 25.233.142.046 parámetros totales según los safetensors originales, lo que lo sitúa en la categoría de aproximadamente 26B parámetros, y el sufijo A4B sugiere una arquitectura de mezcla de expertos (MoE) con unos 4B parámetros activos por token, aunque este dato no se confirma en la información disponible.

La relevancia de esta ficha reside en que se trata de una publicación muy reciente (creada el 4 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de cuantización de nicho, probablemente orientado a pruebas internas o a la comunidad que sigue las publicaciones de mradermacher. No hay información pública sobre el pipeline, la licencia, los idiomas soportados ni los benchmarks del modelo base, lo que limita considerablemente la evaluación rigurosa.

El repositorio ocupa 38,6 GB e incluye múltiples variantes de cuantización con técnicas de imatrix y weighted quants, generadas a partir del modelo original en formato Hugging Face y convertidas con convert_type hf. La ficha que sigue documenta lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A4B sugiere MoE con ~4B activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,23B) |
| Parametros activos | no disponible (probablemente ~4B según nomenclatura A4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones), modelo base en safetensors |
| Tamano del repositorio | 38,6 GB |
| Metodo de cuantizacion | imatrix / weighted quants (quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Kitchoon-V5-Clean-26B-A4B más allá de lo que sugiere su nombre: 26B parámetros totales y una designación A4B que en la convención habitual de nombres de modelos MoE indica aproximadamente 4B parámetros activos por token. El recuento real de parámetros en safetensors es de 25.233.142.046, ligeramente por debajo de los 26B nominales. No consta si se trata de un transformer denso, un MoE, un modelo híbrido o una arquitectura SSM, ni tampoco los datos de entrenamiento, el número de tokens, la composición del dataset o si hubo fases de RLHF o DPO.

Lo único verificable es el proceso de cuantización: mradermacher ha generado las variantes GGUF con quantize_version 2, output_tensor_quantised activado, convert_type hf y el tag nicoboss, aplicando cuantización ponderada con imatrix (importancia matrix) para preservar mejor la calidad en las capas sensibles. Se ha omitido el tensor mmproj (skip_mmproj 1), lo que sugiere que el modelo base no incluye proyector multimodal o que este no se ha portado a las cuantizaciones. El conjunto de cuantizaciones cubre desde IQ1_S (la más agresiva) hasta Q6_K (la de mayor fidelidad), pasando por las familias K-quant e I-quant típicas de llama.cpp.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a diálogo, aunque no se detallan capacidades específicas.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no consta la lista de idiomas).
- Capacidades multimodales (visión, audio): no disponible; el flag skip_mmproj sugiere ausencia de proyector multimodal en las cuantizaciones.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con llama.cpp: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo con memoria suficiente, integrándolo en flujos de trabajo de escritorio sin depender de la nube.
- Experimentación con cuantizaciones agresivas: las variantes IQ1_S, IQ2_XXS e IQ3_XXS permiten evaluar la degradación de calidad del modelo base en entornos con VRAM muy limitada, útil para investigación sobre tolerancia a la cuantización.
- Pruebas de conversación en local: dado el tag "conversational", puede emplearse como chatbot de escritorio mediante interfaces como llama.cpp server, Ollama o LM Studio, siempre que se valide previamente la calidad del modelo base.
- Evaluación comparativa de cuantizaciones: al ofrecer 24 variantes del mismo modelo, permite medir empíricamente la relación entre bits por peso y calidad de salida en tareas de generación.
- Integración en pipelines de CI para pruebas de regresión: el formato GGUF y la compatibilidad con endpoints hacen viable automatizar pruebas de inferencia en contenedores con recursos acotados.
- Investigación sobre modelos MoE de ~26B: si se confirma la arquitectura MoE con ~4B activos, sirve como banco de pruebas para estudiar el equilibrio entre parámetros totales, activos y latencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del archivo GGUF y overhead de contexto):
  - IQ1_S / IQ2_XXS: en torno a 6-8 GB.
  - IQ3_XXS / Q3_K_M: en torno a 10-12 GB.
  - Q4_K_M / IQ4_XS: en torno a 14-16 GB.
  - Q5_K_M / Q6_K: en torno a 18-22 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M y Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; RTX 4060 Ti 16 GB o RTX 3080 12 GB para Q3_K_M; A100 40/80 GB y H100 para despliegues multiusuario con contexto largo.
- Cabe en GPU de consumo: sí, al menos hasta Q4_K_M en tarjetas de 16 GB y hasta Q6_K en tarjetas de 24 GB, siempre que la ventana de contexto no sea muy grande.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponible; dependerá de la cuantización, la GPU y la longitud de contexto.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables de la misma categoría (MoE de ~26B con ~4B activos) en la información proporcionada. Cualquier comparación con Mistral Small, Mixtral 8x7B, Qwen MoE u otros modelos similares requeriría datos de benchmarks y especificaciones del modelo base que no constan.

## Limitaciones y advertencias

- Ausencia total de información sobre el modelo base: no se conocen licencia, idiomas, datos de entrenamiento ni evaluación, lo que impide garantizar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo original (SubMaroon/Kitchoon-V5-Clean-26B-A4B) antes de cualquier despliegue.
- Riesgo de alucinación: sin benchmarks ni evaluación publicada, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se pueden anticipar sesgos de género, etnia, idioma o dominio.
- Cuantizaciones agresivas (IQ1_S, IQ2_XXS): la degradación de calidad puede ser significativa; se recomienda validar con tareas representativas antes de usar en aplicaciones reales.
- Contexto desconocido: se desconoce la longitud máxima de contexto soportada, lo que limita el diseño de aplicaciones que dependan de ventanas largas.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de comunidad que haya validado el artefacto.
- Posible omisión del proyector multimodal: el flag skip_mmproj sugiere que las cuantizaciones no incluyen capacidades de visión, aunque el modelo base las tuviera.
- Fecha de creación futura (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de descargarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V5-Clean-26B-A4B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible): https://ollama.com
- Papers, blogs, repos o demos adicionales: no disponible.
