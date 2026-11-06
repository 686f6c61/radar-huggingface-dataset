# mradermacher/Erebus-RP-Engine-26B-A4B-i1-GGUF

## Resumen

Erebus-RP-Engine-26B-A4B-i1-GGUF es una cuantización en formato GGUF del modelo Erebus-RP-Engine-26B-A4B, publicada por el usuario mradermacher en Hugging Face. Se trata de una conversión de pesos realizada con la herramienta de cuantización de llama.cpp (versión de esquema 2), orientada a facilitar la inferencia local del modelo original en hardware de consumo. El nombre indica que el modelo base es un MoE (Mixture of Experts) con aproximadamente 26B de parámetros totales y unos 4B activos por token, aunque esta información procede únicamente de la nomenclatura y no está confirmada en la documentación disponible.

La model card del repositorio es extremadamente escasa: solo incluye metadatos internos de la herramienta de cuantización (versión, tipo de conversión, lista de cuantizaciones generadas) y una referencia al modelo original de Naphula. No se documentan arquitectura, datos de entrenamiento, licencia, idiomas ni benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación muy reciente o de escasa difusión.

Por tanto, esta ficha debe interpretarse con cautela: la mayor parte de los datos técnicos que se piden en la estructura no están disponibles en la información proporcionada y se indican explícitamente como tales. El interés del modelo radica en su orientación a roleplay (RP) y en el formato GGUF con múltiples niveles de cuantización, que permite desplegarlo en GPUs de consumo si el tamaño real se confirma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura A4B sugiere MoE con ~4B parámetros activos, sin confirmar) |
| Parámetros totales | no disponible de forma fiable; el campo safetensors del repo indica 28.444.095, cifra incompatible con el nombre "26B" y probablemente errónea o correspondiente a un tensor parcial |
| Parámetros activos | no disponible (la nomenclatura sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con esquema de cuantización versión 2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. La nomenclatura "26B-A4B" es característica de los modelos Mixture of Experts (MoE) que indican parámetros totales y parámetros activos por token, pero no se confirma en la model card. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

Lo único verificable es el proceso de cuantización: mradermacher ha generado las cuantizaciones a partir de los pesos del modelo Naphula/Erebus-RP-Engine-26B-A4B usando cuantización ponderada con matriz de importancia (imatrix), según los metadatos de la model card. El flag `skip_mmproj: 1` indica que no se ha incluido el proyector multimodal, lo que sugiere que el modelo base podría tener componentes de visión no preservados en esta conversión, aunque no se confirma. El flag `convert_type: hf` indica que la conversión partió de pesos en formato Hugging Face.

## Capacidades

- Generación de texto orientada a roleplay y conversación creativa, a juzgar por el nombre del modelo (Erebus-RP-Engine).
- No se documentan capacidades de razonamiento, código, matemáticas o visión en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo está etiquetado como "RP-Engine" y se distribuye en GGUF, lo que permite ejecutarlo en local con llama.cpp u Ollama para sesiones de roleplay sin depender de APIs externas. La idoneidad concreta depende de la calidad del modelo base, no verificada.
- Prototipado de chatbots de personaje: las múltiples cuantizaciones (desde IQ1_S hasta Q6_K) permiten ajustar el equilibrio entre calidad y requisitos de memoria según el hardware disponible en cada fase de desarrollo.
- Experimentación con modelos MoE en hardware de consumo: si se confirma la arquitectura MoE con ~4B activos, el modelo podría ofrecer un throughput superior al de un denso de 26B, lo que lo hace interesante para pruebas de inferencia en GPUs de gama media.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 24 variantes de cuantización, útil para estudiar la degradación de calidad en tareas de generación creativa según el nivel de compresión.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 permiten intentar ejecutar el modelo en GPUs con poca VRAM, aunque con pérdida de calidad no cuantificada.
- Investigación sobre alineación en modelos de roleplay: si el modelo base incorpora fases de ajuste fino para RP, sirve como caso de estudio, aunque la documentación disponible no lo confirma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Si el modelo base tiene ~26B parámetros totales, las cuantizaciones Q4_K_M ocuparían aproximadamente 15-16 GB, Q6_K en torno a 21-22 GB y las IQ2/IQ3 entre 8 y 12 GB, aunque estas cifras son estimaciones basadas en la nomenclatura y no en datos confirmados.
- GPU recomendadas: no disponible. Para un modelo de ~26B en Q4 se necesitaría al menos una RTX 3090/4090 (24 GB) o una A100/H100 para cuantizaciones altas; para IQ2/IQ3 podría bastar una GPU de 12-16 GB.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantizaciones bajas (IQ2/IQ3) en GPUs de 12-16 GB, y en Q4 en GPUs de 24 GB, sujeto a confirmación del tamaño real.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). No se confirma soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones verificadas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta licencia, lo que impide determinar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base (Naphula/Erebus-RP-Engine-26B-A4B) antes de cualquier uso en producción.
- El campo de parámetros totales del repo (28.444.095) es inconsistente con el nombre "26B" y probablemente erróneo; no debe usarse como referencia de tamaño.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos.
- El modelo está orientado a roleplay; no hay evidencia de calidad en tareas de razonamiento, código o matemáticas.
- Las cuantizaciones de baja precisión (IQ1, IQ2) pueden degradar notablemente la coherencia en generación creativa; no se han publicado evaluaciones de calidad por cuantización.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-01), lo que indica ausencia de validación por parte de la comunidad.
- Al ser una conversión de terceros, no hay garantía de que los pesos cuantizados reproduzcan fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Erebus-RP-Engine-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Naphula/Erebus-RP-Engine-26B-A4B
