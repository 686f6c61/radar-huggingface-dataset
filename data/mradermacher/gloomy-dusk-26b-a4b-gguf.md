# mradermacher/Gloomy-Dusk-26B-A4B-GGUF

## Resumen

Gloomy-Dusk-26B-A4B-GGUF es la distribucion en formato GGUF del modelo Gloomy-Dusk-26B-A4B, un merge de modelos creado por el usuario Sorihon mediante la herramienta mergekit. Esta version concreta la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que convierte modelos en formatos optimizados para inferencia local. El modelo base tiene 25.971.339.550 parametros totales (aproximadamente 26B) y, por el sufijo "A4B" del nombre, se infiere una arquitectura de mezcla de expertos (MoE) con unos 4B de parametros activos por token, aunque este dato no se confirma en la informacion disponible.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~26B en hardware de consumo gracias a la cuantizacion GGUF y a la activacion dispersa propia de los MoE. El repositorio incluye once variantes de cuantizacion que van desde Q2_K (10,9 GB) hasta Q8_0 (27,7 GB), lo que cubre desde GPUs con 12 GB de VRAM hasta estaciones de trabajo con 24 GB o mas.

No obstante, la informacion publicada es muy limitada: no hay model card detallada del modelo base, no se especifican la longitud de contexto, los idiomas (mas alla de "en" en los tags), la licencia ni los datos de entrenamiento. Esta ficha refleja fielmente esa escasez y marca como "no disponible" todo aquello que no consta en la documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) inferida del sufijo "A4B"; detalles no disponibles |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4B (inferido del nombre "A4B"; no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (tag "en"); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Gloomy-Dusk-26B-A4B es un merge creado con mergekit, segun los tags del repositorio. mergekit permite combinar los pesos de varios modelos mediante tecnicas como SLERP, TIES, DARE o passthrough, lo que produce un modelo nuevo sin entrenamiento adicional desde cero. El sufijo "A4B" sugiere una arquitectura MoE con aproximadamente 4B de parametros activos, tipica de merges que combinan modelos con mezcla de expertos o que aplican tecnicas de sparsificacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. La model card del repositorio GGUF es puramente operativa: describe las cuantizaciones disponibles y remite al modelo base, cuya documentacion no se ha incluido en la informacion proporcionada. Esta ausencia de detalles tecnicos es una limitacion importante para evaluar el modelo en profundidad.

## Capacidades

- Generacion de texto conversacional: los tags incluyen "conversational", lo que indica un ajuste orientado a dialogo.
- Razonamiento y generacion de texto general: capacidades esperables en un modelo de ~26B, aunque no se documentan explicitamente.
- Soporte multilingue: limitado al ingles segun el tag "en"; no se confirman otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.

## Casos de uso

- Prototipado de asistentes conversacionales en local: gracias a las cuantizaciones Q4_K_S (16,0 GB) y Q4_K_M (17,3 GB), el modelo puede ejecutarse en una GPU de 24 GB como la RTX 4090, permitiendo iterar en el desarrollo de chatbots sin depender de APIs externas.
- Experimentacion con merges de modelos: investigadores interesados en evaluar la calidad de merges comunitarios pueden desplegar esta version GGUF para comparar su comportamiento frente a los modelos originales que lo componen.
- Inferencia en estaciones de trabajo sin GPU dedicada de gama alta: la variante Q2_K (10,9 GB) permite ejecutar el modelo en GPUs de 12 GB o en configuraciones con RAM suficiente mediante llama.cpp, aunque con perdida de calidad.
- Generacion de texto en ingles para tareas generales: dado el tag "en", es adecuado para redaccion, resumen y respuesta a preguntas en ingles en entornos de prueba.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que facilita estudios sobre el impacto de la cuantizacion en la calidad de salida (perplejidad, coherencia) para un mismo modelo.
- Despliegue en pipelines de CI/CD para pruebas de regresion: al ser un GGUF compatible con llama.cpp y Ollama, puede integrarse en flujos automatizados que verifiquen la calidad de respuestas del modelo tras cambios en el prompt o en la configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: ~10,9 GB
  - Q3_K_S: ~12,6 GB
  - Q3_K_M: ~13,7 GB
  - Q3_K_L: ~14,2 GB
  - IQ4_XS: ~14,6 GB
  - Q4_K_S: ~16,0 GB
  - Q4_K_M: ~17,3 GB
  - Q5_K_S: ~18,6 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~23,3 GB
  - Q8_0: ~27,7 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para Q2_K y Q3_K.
- Cabe en GPU de consumo: si, en RTX 4090 para cuantizaciones hasta Q5_K_M; en GPUs de 12 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para pesos originales, transformers con aceleracion por GPU.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B activos (inferido), el throughput deberia ser superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gloomy-Dusk-26B-A4B-GGUF | ~26B (MoE, ~4B activos) | no disponible | no disponible | GGUF | Merge comunitario; 11 cuantizaciones |
| Modelos densos de ~27B (p. ej. Gemma 2 27B) | ~27B | 8K-128K segun variante | Licencia propia | safetensors, GGUF | Referencia densa de tamano similar; contexto y licencia documentados |
| MoE de ~20-30B con ~3-4B activos (p. ej. variantes tipo Mixtral reducidas) | ~20-30B | variable | variable | safetensors, GGUF | Arquitectura comparable en activacion dispersa |

La comparacion cuantitativa no es posible porque no hay benchmarks publicados del modelo. Frente a modelos densos de tamano similar, la ventaja teorica del MoE es un mayor throughput con menor coste computacional por token; la desventaja es la falta de documentacion sobre contexto, licencia y calidad.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, contexto, licencia ni evaluaciones, lo que dificulta su uso en produccion.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; es un riesgo legal relevante.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea limitado.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni evaluaciones, no puede acotarse su magnitud.
- Sesgos: al ser un merge de modelos no documentados, los sesgos heredados de sus componentes son desconocidos.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_S degradan la calidad; la propia model card advierte que Q3_K_M es de "lower quality".
- Naturaleza de merge: los merges con mergekit no han sido entrenados especificamente para tareas concretas, por lo que su comportamiento puede ser irregular.
- Fecha de creacion futura (2026-11-21): conviene verificar la integridad y procedencia del repositorio antes de usarlo en entornos criticos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gloomy-Dusk-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Gloomy-Dusk-26B-A4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Gloomy-Dusk-26B-A4B-i1-GGUF
- Pagina de descripcion del cuantizador: https://hf.tst.eu/model#Gloomy-Dusk-26B-A4B-GGUF
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
