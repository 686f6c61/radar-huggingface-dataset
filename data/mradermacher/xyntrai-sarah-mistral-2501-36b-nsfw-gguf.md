# mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF

## Resumen

xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF es la version cuantizada en formato GGUF del modelo xyntrai-sarah-mistral-2501-36B-NSFW, publicado por el usuario mradermacher. Se trata de un modelo de generacion de texto de 36.910.535.680 parametros (aproximadamente 36.9B) construido sobre la arquitectura Mistral y afinado con Unsloth, orientado a conversacion y marcado explicitamente como no apto para todas las audiencias (not-for-all-audiences). El autor original del modelo base es xyntraistudios.

El modelo resuelve el problema de desplegar un modelo de gran tamano en entornos con recursos limitados mediante la publicacion de multiples cuantizaciones estaticas (de Q2_K a Q8_0, ademas de IQ4_XS), lo que permite ejecutarlo en configuraciones de hardware muy diversas, desde estaciones de trabajo con GPU de consumo hasta servidores con multiples aceleradores. La licencia declarada es Apache 2.0.

La relevancia de esta ficha radica en que el repositorio no documenta detalles tecnicos sobre el entrenamiento, la composicion del dataset ni los benchmarks del modelo base; la model card se limita a listar las cuantizaciones disponibles y enlaces de descarga. Por tanto, gran parte de las especificaciones tecnicas habituales (longitud de contexto, idiomas, datos de entrenamiento) no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral) |
| Parametros totales | 36.910.535.680 (~36.9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repositorio separado |
| Idiomas soportados | en (segun tags de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de la familia Mistral, segun los tags del repositorio (mistral, transformers, unsloth). El modelo base fue afinado con Unsloth, una libreria de entrenamiento optimizada para reducir el uso de memoria y acelerar el fine-tuning. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La informacion disponible no detalla innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.). El trabajo de mradermacher consiste exclusivamente en la conversion y cuantizacion del modelo base a formato GGUF, generando tanto cuantizaciones estaticas como, en un repositorio separado, cuantizaciones ponderadas con imatrix para mayor calidad.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y orientado a dialogos multi-turno.
- Contenido para adultos: el modelo esta marcado como not-for-all-audiences y su nombre incluye el sufijo NSFW, lo que indica que ha sido afinado o ajustado para contenido no apto para todo publico.
- Generacion de texto general: la pipeline declarada es text-generation.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (en) en los tags.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de narrativa y ficcion para adultos: el modelo esta explicitamente afinado para contenido NSFW, por lo que su uso principal previsto es la creacion de relatos, dialogos y contenido creativo para publicos adultos, con control de contenido mediante filtros en la capa de aplicacion.
- Prototipado de chatbots conversacionales: gracias a su naturaleza conversacional y a las cuantizaciones ligeras (Q4_K_M de 22.5 GB), se puede desplegar en una estacion de trabajo con una sola GPU para iterar rapidamente sobre prompts y flujos de dialogo.
- Investigacion sobre fine-tuning y cuantizacion: al estar disponible en multiples formatos GGUF, sirve como caso de estudio para medir el impacto de la cuantizacion en la calidad de un modelo de 36.9B.
- Despliegue local en entornos con recursos limitados: las variantes Q2_K (13.9 GB) y Q3_K_S (16.2 GB) permiten ejecutar el modelo en GPUs de consumo con 16-24 GB de VRAM, aunque con perdida de calidad.
- Generacion de texto por lotes en servidores: la variante Q8_0 (39.3 GB) o Q6_K (30.4 GB) puede usarse en servidores con GPU de 48-80 GB para generacion de contenido a gran escala.
- Experimentacion con modelos de gran tamano en formato GGUF: util para comparar el rendimiento de llama.cpp frente a otras pilas de inferencia en un modelo de casi 37B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~13.9 GB
  - Q3_K_S: ~16.2 GB
  - Q3_K_M: ~18.0 GB
  - Q3_K_L: ~19.4 GB
  - IQ4_XS: ~20.2 GB
  - Q4_K_S: ~21.2 GB
  - Q4_K_M: ~22.5 GB
  - Q5_K_S: ~25.6 GB
  - Q5_K_M: ~26.3 GB
  - Q6_K: ~30.4 GB
  - Q8_0: ~39.3 GB
- GPU recomendadas:
  - Q2_K a Q4_K_M: RTX 3090/4090 (24 GB) o A5000/A6000.
  - Q5_K_S a Q6_K: A6000 (48 GB) o A100 40 GB.
  - Q8_0: A100 80 GB o H100.
- Cabe en GPU de consumo: si, las variantes Q2_K a Q4_K_M caben en GPUs de 24 GB (RTX 3090, RTX 4090) y las variantes Q3_K_S en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base usa transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF | ~36.9B | no disponible | apache-2.0 | GGUF | Fine-tune NSFW sobre Mistral, cuantizado por mradermacher |
| Mistral Large (referencia de la familia) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |
| Otros fine-tunes NSFW de ~30-40B | no disponible | no disponible | no disponible | no disponible | No disponible |

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La comparativa se limita a senalar que el modelo pertenece a la familia Mistral y que su tamano (~36.9B) lo situa en la gama de modelos de gran formato que requieren cuantizacion para su despliegue en hardware de consumo.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta explicitamente marcado como not-for-all-audiences y afinado para contenido para adultos. No es adecuado para aplicaciones orientadas a menores ni para entornos sin moderacion.
- Sesgos conocidos: no disponible en la informacion proporcionada, pero al ser un fine-tune sin documentacion de alineamiento, es probable que herede sesgos del modelo base y del dataset de fine-tuning.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo de este tamano, puede producir contenido facticamente incorrecto.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, pero el contenido NSFW puede estar sujeto a restricciones legales segun la jurisdiccion y la plataforma de despliegue.
- Caveat para produccion: la falta de documentacion sobre entrenamiento, benchmarks y contexto hace arriesgado su uso en produccion sin una evaluacion previa propia. Ademas, las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la calidad segun las notas del propio autor.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF
- Modelo base: https://huggingface.co/xyntraistudios/xyntrai-sarah-mistral-2501-36B-NSFW
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#xyntrai-Sarah-mistral-2501-36B-nsfw-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
