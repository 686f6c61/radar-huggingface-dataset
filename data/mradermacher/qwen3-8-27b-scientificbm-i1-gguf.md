# mradermacher/Qwen3.8-27B-ScientificBM-i1-GGUF

## Resumen

Qwen3.8-27B-ScientificBM-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo Rumiii/Qwen3.8-27B-ScientificBM, publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un modelo de 27.320.697.856 parámetros (27B) basado en la familia Qwen3.8, especializado en dominio biomédico y bioinformático: su model card incluye etiquetas como biomedical, bioinformatics, ncbi, uniprot y ensembl, y ha sido entrenado con el dataset gxx27/BioTool, orientado a tool calling sobre herramientas científicas y bases de datos biológicas.

El valor de esta ficha no es el modelo base en sí, sino la disponibilidad inmediata de más de 20 variantes cuantizadas que permiten ejecutar un modelo de 27B especializado en biología en hardware de consumo, desde 11 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K). La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones. Es relevante para desarrolladores e investigadores en bioinformática que necesitan un modelo local capaz de razonar sobre herramientas como NCBI, UniProt o Ensembl sin depender de APIs de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8); no disponible si es MoE |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no disponible (solo aplicable si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta ficha); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, Rumiii/Qwen3.8-27B-ScientificBM, pertenece a la familia Qwen3.8 (etiqueta qwen3_5/qwen3_8 en la model card), una arquitectura transformer densa de 27B parametros. No se ha publicado informacion sobre si utiliza mixture-of-experts, ni detalles sobre la longitud de contexto o innovaciones tecnicas concretas de la arquitectura. La model card del cuantizador indica que se trata de un modelo de vision ("This is a vision model"), por lo que los archivos mmproj correspondientes se distribuyen en el repositorio de cuantizaciones estaticas.

Respecto al entrenamiento, el modelo base se ha ajustado (fine-tuned) sobre el dataset gxx27/BioTool, orientado a dominio biomedical y bioinformatico, con especial enfasis en tool calling y function calling sobre servicios cientificos como NCBI, UniProt y Ensembl. No hay informacion disponible sobre el numero de tokens del entrenamiento, la composicion detallada del dataset ni el uso de tecnicas como RLHF o DPO.

Esta ficha corresponde a cuantizaciones GGUF con imatrix (importance matrix) generadas por mradermacher. La tecnica imatrix pondera la cuantizacion segun la importancia de cada tensor, ofreciendo mejor calidad que las cuantizaciones estaticas a igual tamaño; las variantes IQ (importance) suelen superar a las variantes K de tamaño equivalente.

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion en dominio biomedical y bioinformatico.
- Tool calling / function calling: entrenado con el dataset BioTool para invocar herramientas de bases de datos cientificas (NCBI, UniProt, Ensembl).
- Capacidades de vision: la model card del cuantizador lo identifica como modelo de vision (los archivos mmproj estan en el repositorio de cuantizaciones estaticas).
- Razonamiento sobre consultas cientificas y flujos de trabajo bioinformaticos multi-paso (soporte de agentes no confirmado explicitamente, aunque el tool calling sugiere compatibilidad con pipelines agenticos).
- Ejecucion local eficiente gracias a las mas de 20 variantes de cuantizacion GGUF, desde 11 GB hasta 22,5 GB.

## Casos de uso

- Agentes de consulta a bases de datos biologicas: el modelo puede integrarse en pipelines que invoquen APIs de NCBI, UniProt o Ensembl mediante function calling, automatizando la recuperacion de secuencias, anotaciones y datos de expresion.
- Asistente bioinformatico local: investigadores sin acceso a servicios en la nube pueden ejecutar el modelo en una estacion de trabajo con GPU de 24 GB (variante i1-Q4_K_M, 16,9 GB) para consultas sobre genomica y proteomica sin enviar datos sensibles a terceros.
- Analisis de literatura cientifica: resumen y extraccion de informacion de articulos y documentos biomedicos en ingles, aprovechando la especializacion de dominio.
- Pipelines de anotacion funcional: integracion en flujos de trabajo de bioinformatica donde el modelo interpreta resultados de herramientas como BLAST o consultas a Ensembl y genera informes estructurados.
- Prototipado de agentes cientificos: el soporte de tool calling lo hace adecuado para construir agentes multi-paso que combinan busquedas en bases de datos con razonamiento sobre los resultados.
- Vision aplicada a biologia: dado que incluye soporte de vision (mmproj), puede emplearse en tareas que combinen imagenes cientificas con texto, aunque los detalles de esta capacidad no estan documentados en la informacion disponible.
- Evaluacion y benchmarking de modelos de dominio: util como base comparativa para investigadores que desarrollan modelos biomedicos especializados, gracias a su licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - i1-Q2_K: ~11 GB
  - i1-IQ3_M: ~12,9 GB
  - i1-Q4_K_S: ~15,9 GB
  - i1-Q4_K_M: ~16,9 GB (recomendada por el autor)
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
- GPU recomendadas: RTX 4090 (24 GB) para variantes hasta Q6_K; RTX 3090 (24 GB) como alternativa; A100 o H100 para contextos largos o despliegue multi-usuario.
- Consumer GPUs: cabe comodamente en una RTX 4090 o RTX 3090 con las variantes Q4; con una RTX 4070 Ti Super (16 GB) es viable la variante i1-Q4_K_S (15,9 GB). En CPU pura o con offload parcial, las variantes Q2/Q3 son ejecutables en sistemas con 16-32 GB de RAM, con latencias significativamente mayores.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es adecuado para vLLM o TGI en su formato GGUF (se requeriria el modelo base en safetensors).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3.8-27B-ScientificBM-i1-GGUF (esta ficha) | 27B | GGUF (imatrix) | Apache 2.0 | Biomedical, tool calling (NCBI, UniProt, Ensembl) |
| MedGemma (Google) | 4B / 27B | safetensors, GGUF comunitario | Licencia propia de Google (restricciones de uso) | Biomedico general (texto e imagenes clinicas) |
| Qwen3-30B-A3B | 30B (3B activos, MoE) | safetensors, GGUF comunitario | Apache 2.0 | General, tool calling, agentic |
| BioMistral-7B | 7B | safetensors, GGUF comunitario | Apache 2.0 | Dominio medico (Mistral 7B fine-tuned) |

Frente a MedGemma 27B, este modelo ofrece una licencia mas permisiva (Apache 2.0) y un enfoque en tool calling cientifico en lugar de imagenes clinicas. Frente a BioMistral-7B, es notablemente mayor y mas capaz, a costa de requisitos de hardware superiores. Frente a Qwen3-30B-A3B, este modelo es denso (mayor coste de inferencia por token) pero especializado en dominio biologico.

## Limitaciones y advertencias

- Idioma: el modelo esta orientado al ingles (language: en); el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Especializacion de dominio: al tratarse de un fine-tune sobre datos bioinformaticos, puede degradar sus capacidades generales (razonamiento comun, codigo no cientifico) respecto al modelo base Qwen3.8.
- Riesgo de alucinacion: como todo LLM, puede generar datos biologicos, secuencias o referencias incorrectas con apariencia plausible; en contextos cientificos es imprescindible verificar las salidas contra fuentes primarias.
- Vision: la model card indica que es un modelo de vision, pero los detalles de esta capacidad no estan documentados; los archivos mmproj estan en el repositorio de cuantizaciones estaticas, no en este.
- Cuantizacion: las variantes de baja densidad (Q2_K, IQ1/IQ2) pueden degradar apreciablemente la calidad, especialmente en tareas tecnicas precisas; el propio autor recomienda las variantes IQ3 o superiores.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el dataset de entrenamiento (gxx27/BioTool) y los datos de las bases consultadas (NCBI, UniProt, Ensembl) cumplan sus terminos de uso en la aplicacion final.
- Datos de rendimiento ausentes: no hay benchmarks publicados, por lo que la calidad relativa respecto a otros modelos biomedicos no puede evaluarse objetivamente con la informacion disponible.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/mradermacher/Qwen3.8-27B-ScientificBM-i1-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwen3.8-27B-ScientificBM
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-ScientificBM-GGUF
- Pagina de descargas y resumen: https://hf.tst.eu/model#Qwen3.8-27B-ScientificBM-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/gxx27/BioTool
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
