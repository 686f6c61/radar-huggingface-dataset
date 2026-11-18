# meltingfeet/backup2026-11-18-jan1k-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF

## Resumen

El modelo identificado como `meltingfeet/backup2026-11-18-jan1k-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF` es una distribucion en formato GGUF con cuantizacion NVFP4 de un modelo de la familia Qwen 3.6, concretamente una variante afinada y "uncensored" derivada de un checkpoint base de LuffyTheFox. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35.505.251.456 parametros totales y, segun la nomenclatura `A3B`, aproximadamente 3.000 millones de parametros activos por token. El autor de esta publicacion es el usuario de Hugging Face `meltingfeet`, que actua como redistribuidor del modelo original en formato cuantizado.

La relevancia de esta ficha es limitada y debe tratarse con cautela: el repositorio no presenta pipeline declarado, no incluye idiomas soportados, no tiene descargas ni likes en el momento de la consulta, y su acceso esta restringido (gated), requiriendo aceptar condiciones en Hugging Face. Ademas, el nombre del repositorio incluye la cadena `backup2026-11-18`, lo que sugiere que se trata de una copia de seguridad de una publicacion previa, y no de un lanzamiento oficial. La informacion tecnica disponible es escasa y procede fundamentalmente de los metadatos del repositorio y de la nomenclatura del modelo base.

Por tanto, esta ficha debe interpretarse como una descripcion de los metadatos disponibles y de las inferencias razonables a partir de la nomenclatura, no como una evaluacion verificada del comportamiento del modelo. Cualquier dato no confirmado se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) tipo transformer, segun tags `qwen35moe` y `moe`; detalles de capas y atencion no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la nomenclatura `A3B`; no confirmado en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (segun el nombre del repo y el tag `nvfp4`); GGUF como formato contenedor; no se detallan otros niveles de cuantizacion |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantizacion NVFP4) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), tal como indican los tags `qwen35moe` y `moe`. El sufijo `A3B` en el nombre del modelo apunta a unos 3.000 millones de parametros activos sobre un total de 35.505.251.456, lo que situaria la relacion de activacion en torno al 8,5 %. El tag `MTP` sugiere la presencia de multi-token prediction, una tecnica de decodificacion que predice varios tokens por paso para acelerar la inferencia. El tag `multimodal` indica capacidades multimodales, aunque no se especifica que modalidades (texto, vision, audio) ni como estan integradas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. El modelo base declarado es `LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF`, que a su vez parece ser un afinamiento "uncensored" y "Hermes" de un modelo Qwen 3.6 MoE. El tag `imatrix` indica que la cuantizacion se realizo con matrices de importancia (importance matrix), una tecnica habitual para preservar calidad en cuantizaciones agresivas como NVFP4. No se detalla el proceso de calibracion ni el dataset usado para la imatrix.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational`.
- Capacidades multimodales declaradas mediante el tag `multimodal`; modalidades concretas no disponibles.
- Prediccion multi-token (MTP) como mecanismo de aceleracion de decodificacion.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso en despliegues tipo API.
- Razonamiento, codigo, matematicas y tool calling: no confirmados en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingues: no disponibles.
- Modo "uncensored": el nombre indica un afinamiento orientado a reducir rechazos, pero no se documenta el alcance ni las implicaciones.

## Casos de uso

- Despliegue en entornos con GPU de memoria limitada: la cuantizacion NVFP4 reduce el peso del modelo a aproximadamente 22,8 GB de repo, lo que permite servir un MoE de 35B en hardware de gama alta consumer o en una sola GPU profesional, manteniendo solo ~3B parametros activos por token.
- Experimentacion con decodificacion especulativa y MTP: el tag `MTP` permite evaluar tecnicas de prediccion multi-token en pipelines de inferencia propios, comparando throughput frente a decodificacion autoregresiva clasica.
- Investigacion sobre alineamiento y censura: al ser una variante "uncensored", puede usarse en estudios controlados sobre comportamiento de modelos afinados para reducir rechazos, siempre con las salvaguardas eticas correspondientes.
- Pruebas de cuantizacion con imatrix: util para investigadores que quieran medir la perdida de calidad de NVFP4 frente a otros formatos (Q4_K_M, Q5_K_M, etc.) en un MoE de este tamano.
- Prototipado de asistentes conversacionales en local: con llama.cpp u Ollama, el formato GGUF permite levantar un servidor conversacional sin dependencias de la nube, util para demos y pruebas de concepto.
- Evaluacion de modelos multimodales cuantizados: si se confirma la multimodalidad, sirve para estudiar como afecta la cuantizacion NVFP4 a tareas que combinan texto e imagen.
- Integracion en pipelines compatibles con endpoints: el tag `endpoints_compatible` sugiere que puede conectarse a infraestructuras tipo API, util para pruebas de integracion en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 22,8 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos; con overhead de contexto y KV cache, se recomienda un minimo de 24 GB de VRAM.
- GPU recomendadas: no confirmadas; por tamano, una RTX 4090 (24 GB) o una A100/H100 con 40-80 GB serian adecuadas. Una RTX 3090 (24 GB) podria ser justa pero viable con contexto corto.
- Cabe en consumer GPU: probablemente si en RTX 4090 y RTX 3090, condicionado al tamano de contexto y al backend.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no estan confirmados para NVFP4 en este repositorio. El tag `endpoints_compatible` sugiere soporte para servidores tipo API.
- Latencia y throughput estimados: no disponibles. La combinacion de MoE con ~3B activos y MTP deberia ofrecer un throughput superior a un modelo denso de 35B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| meltingfeet/...Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF | 35,5B | ~3B (inferido) | No disponible | Apache 2.0 | GGUF NVFP4 | Gated |
| LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF (modelo base) | 35,5B | ~3B (inferido) | No disponible | No disponible | GGUF | No disponible |
| Modelos Qwen MoE oficiales de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a parametros y formato.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que impide validar su uso en la comunidad.
- Nombre con marca temporal `backup2026-11-18`, indicativo de copia de seguridad y no de publicacion oficial; riesgo de que el repositorio se elimine o cambie.
- El modelo base es una variante "uncensored", lo que puede implicar menor adherencia a politicas de seguridad y mayor probabilidad de generar contenido inapropiado; no apto para produccion sin filtros adicionales.
- No se documentan sesgos conocidos, pero al ser un afinamiento no oficial de Qwen, hereda los sesgos del modelo original y anade los del proceso de afinamiento.
- Riesgo de alucinacion: no cuantificado; los modelos MoE de este tamano suelen alucinar en tareas de conocimiento factual, pero no hay evaluaciones disponibles.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar el soporte multilingue ni la ventana real.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un modelo derivado y redistribuido por un tercero, conviene verificar la cadena de licencias del modelo base y de los datos de afinamiento.
- La cuantizacion NVFP4 puede degradar la calidad respecto al modelo en BF16; no se aportan metricas de perplejidad ni comparativas.
- El tag `multimodal` no viene acompanado de documentacion sobre que modalidades ni como se procesan; no asumir vision o audio sin verificacion.
- No hay informacion sobre tool calling ni soporte de agentes; no recomendable para pipelines que dependan de function calling sin validacion previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/meltingfeet/backup2026-11-18-jan1k-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF
- Modelo base declarado: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
