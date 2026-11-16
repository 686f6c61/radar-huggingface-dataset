# mradermacher/HeTong-NMT-7B-i1-GGUF

## Resumen

HeTong-NMT-7B-i1-GGUF es una coleccion de cuantizaciones GGUF, generadas con el metodo imatrix de llama.cpp, del modelo HeTong-NMT-7B publicado por MUC-HeTong. El autor de esta conversion es mradermacher, un perfil conocido por producir versiones cuantizadas de modelos abiertos para su uso en entornos con recursos limitados. El modelo base es un transformer de aproximadamente 7.500 millones de parametros, orientado a traduccion automatica neuronal (NMT, por sus siglas en ingles), segun indica su propio nombre.

La relevancia de esta ficha radica en que permite ejecutar un modelo de traduccion de 7B en hardware de consumo mediante cuantizacion de 1 a 6 bits, algo inviable con los pesos originales en precision completa. El repositorio ocupa 22,2 GB e incluye un amplio abanico de variantes (Q2_K, IQ3_M, Q4_K_M, Q5_K_M, Q6_K, entre otras), lo que facilita ajustar el equilibrio entre calidad y memoria.

No obstante, la informacion publicada es muy escasa: no se detallan la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento del modelo base. Esta ficha refleja unicamente lo que puede verificarse a partir de los metadatos y la model card del repositorio, marcando explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducido del formato GGUF y del tamano; no se detalla en la model card) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio no aporta informacion sobre la arquitectura interna del modelo base HeTong-NMT-7B. Por el numero de parametros (7.504.568.320) y el formato de publicacion, se trata de un transformer decoder-only de aproximadamente 7B, coherente con la familia de modelos que se suelen cuantizar en GGUF. El nombre "NMT" sugiere un entrenamiento orientado a traduccion automatica neuronal, aunque no se especifican los pares de idiomas, el volumen de tokens de entrenamiento ni la composicion del dataset.

Respecto al proceso de cuantizacion, la model card indica que se han generado cuantizaciones ponderadas con imatrix (importance matrix) a partir del modelo original. El uso de imatrix permite calcular matrices de importancia por tensor para reducir la perdida de calidad en cuantizaciones agresivas (IQ2, IQ3), lo que explica la presencia de variantes de 1 a 3 bits junto a las clasicas Q4_K_M y Q5_K_M. No se documenta si el modelo base paso por RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Traduccion automatica neuronal: el nombre del modelo (NMT) indica que su proposito principal es la traduccion entre idiomas, aunque no se detallan los pares soportados.
- Generacion de texto conversacional: la etiqueta "conversational" del repositorio sugiere uso en dialogos multi-turno.
- Inferencia local en CPU y GPU mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite desplegarlo detras de APIs compatibles con OpenAI.
- Multiples niveles de cuantizacion para ajustar calidad y memoria.
- No se ha documentado soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica en local: con cuantizaciones Q4_K_M o Q5_K_M el modelo cabe en GPUs de consumo y permite traducir lotes de documentos sin enviar datos a servicios en la nube, algo relevante para material confidencial.
- Traduccion integrada en pipelines de CI/CD: al ser GGUF y compatible con llama.cpp, puede invocarse desde scripts para traducir cadenas de internacionalizacion (i18n) de forma automatizada antes de cada release.
- Asistencia conversacional multilingue en escritorio: la etiqueta "conversational" permite usar el modelo como chatbot local en herramientas tipo LM Studio, manteniendo las conversaciones en la maquina del usuario.
- Prototipado de sistemas de traduccion en investigacion: las variantes IQ2 e IQ3 permiten experimentar con un modelo de 7B en portatiles con 8-16 GB de RAM, facilitando pruebas de hipotesis sin infraestructura dedicada.
- Despliegue en servidores sin GPU: las cuantizaciones Q4_0 y Q4_K_S ofrecen un equilibrio razonable para inferencia en CPU con llama.cpp, util para entornos edge o servidores modestos.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye mas de veinte variantes, lo que permite medir la degradacion de calidad en traduccion segun el nivel de cuantizacion en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada cuantizacion y el repo de 22,2 GB):
  - IQ1_S / IQ1_M: en torno a 2-3 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: en torno a 3-4 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 4-5 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 4,5-5,5 GB.
  - Q5_K_S / Q5_K_M: en torno a 5,5-6,5 GB.
  - Q6_K: en torno a 6,5-7,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para las variantes de mayor precision y contextos largos.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones caben en GPUs con 8 GB o mas; las variantes IQ2 e IQ3 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI (por la etiqueta "endpoints_compatible").
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HeTong-NMT-7B-i1-GGUF | 7,5B | no disponible | no disponible | GGUF (multiples quants) | Especializado en traduccion segun su nombre |
| Modelos NMT dedicados tipo NLLB-200 | hasta 54B | 512 tokens | CC-BY-NC | safetensors | Referencia en traduccion multilingue, pero sin versiones GGUF oficiales |
| Modelos genericos 7B cuantizados (p. ej. Mistral-7B-Instruct GGUF) | 7B | 8K-32K | Apache 2.0 | GGUF | Mas versatiles, pero no especializados en traduccion |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo HeTong que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no esta publicada en el repositorio, por lo que no puede confirmarse el uso comercial; es imprescindible consultar la licencia del modelo base (MUC-HeTong/HeTong-NMT-7B) antes de desplegarlo en produccion.
- No se especifican los idiomas soportados ni los pares de traduccion, lo que impide garantizar cobertura para un idioma concreto.
- Se desconoce la longitud de contexto del modelo base, un factor critico para traducir documentos largos.
- Las cuantizaciones IQ1 e IQ2 pueden degradar notablemente la calidad de traduccion; se recomienda Q4_K_M o superior para uso en produccion.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en segmentos con terminologia especializada o idiomas de bajos recursos.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria del funcionamiento de las cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/HeTong-NMT-7B-i1-GGUF
- Modelo base: https://huggingface.co/MUC-HeTong/HeTong-NMT-7B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
