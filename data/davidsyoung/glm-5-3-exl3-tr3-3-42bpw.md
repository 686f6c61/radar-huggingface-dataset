# davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw

## Resumen

GLM-5.3-EXL3-TR3-3.42bpw es una cuantización trellis (EXL3/TR3) del modelo GLM-5.3 de Z.ai, realizada por el usuario davidsyoung. GLM-5.3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 755 mil millones de parámetros totales y 40 mil millones activos, diseñado para tareas complejas de ingeniería de software y agentes de largo horizonte. Según Z.ai, GLM-5.3 comparte la misma base que GLM-5.2 y todas sus mejoras provienen del post-entrenamiento, logrando un incremento del 50 % en su benchmark interno de código.

Esta cuantización reduce el peso de los expertos enrutados a una media de 3.42 bits por peso (bpw) mediante una codificación trellis con mezcla de niveles K3 y K4, manteniendo las capas densas, atención y embeddings en BF16. El objetivo es permitir la inferencia en configuraciones de 4 GPU con 96 GB cada una (por ejemplo, RTX PRO 6000 Blackwell) con caché KV en FP8. El autor la publica como pre-release, con pesos aún no completamente subidos y sin validación de calidad completada, por lo que debe tratarse como no probada hasta que se elimine el aviso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa) con 78 capas + MTP, 256 expertos enrutados por capa |
| Parametros totales | 755 mil millones (segun model card del autor) |
| Parametros activos | 40 mil millones (segun lmstudio.ai) |
| Longitud de contexto | Hasta 1 millon de tokens (contexto arquitectonico del modelo base) |
| Tipos de cuantizacion | EXL3 trellis 3.42 bpw (mezcla K3/K4 por experto), capas densas y embeddings en BF16 |
| Idiomas soportados | Ingles, chino |
| Licencia | glm-5.3 (otra, ver enlace a licencia del modelo base) |
| Formato de pesos | Safetensors (shards, con archivos de metadatos como tier_bitmap.json y MANIFEST.sha256) |

## Arquitectura y entrenamiento

GLM-5.3 es un modelo MoE con 78 capas, cada una con 256 expertos enrutados, más un módulo de predicción multi-token (MTP). El modelo base fue entrenado por Z.ai y posteriormente refinado mediante post-entrenamiento (no se especifican detalles de RLHF o DPO en la informacion disponible). La cuantizacion aqui descrita no implica entrenamiento adicional: es un proceso data-free que utiliza una Hessiana identidad, rotaciones y busqueda trellis para codificar los pesos de los expertos enrutados. Los expertos se dividen en dos grupos por capa: 148 se codifican con nivel K3 y 108 con nivel K4, seleccionando los de mayor error relativo de reconstruccion para el nivel superior. Las capas densas (0-2), atencion, normas, embeddings y la cabeza de salida se mantienen en BF16 sin perdida. El metodo es deterministico, con semillas derivadas de (capa, experto, proyeccion, rango).

## Capacidades

- Generacion de texto y razonamiento complejo, con especial fortaleza en programacion y tareas de ingenieria de software (segun Z.ai, es el modelo de pesos abiertos mas capaz para codigo).
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidad para tareas de largo horizonte (multi-step reasoning, planificacion y ejecucion de agentes).
- Multilingue en ingles y chino.
- Contexto largo de hasta 1 millon de tokens, util para analisis de documentos extensos o conversaciones prolongadas.
- La cuantizacion mantiene las capacidades del modelo base, aunque puede introducir una ligera degradacion en tareas de alta precision numerica o razonamiento logico fino.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en entornos de desarrollo asistido por IA para generar funciones, refactorizar modulos o escribir tests, aprovechando su capacidad de razonamiento sobre contextos largos de codigo fuente.
- Agentes autonomos de largo horizonte: gracias a su ventana de 1M tokens y su entrenamiento en tareas de planificacion, puede ejecutar flujos de trabajo multi-paso, como orquestar pipelines de CI/CD o gestionar incidencias en repositorios.
- Analisis de documentacion tecnica extensa: con 1M tokens de contexto, puede resumir y extraer informacion de manuales, especificaciones o codigo legacy de gran tamano.
- Asistente de soporte al cliente bilingue: maneja conversaciones en ingles y chino, con capacidad de mantener el hilo durante interacciones largas y derivar a herramientas externas mediante function calling.
- Razonamiento matematico y cientifico: adecuado para resolver problemas de matematicas avanzadas o simulaciones que requieran pasos logicos encadenados.
- Investigacion academica: util para revisar articulos cientificos extensos, extraer resultados y comparar metodologias, gracias a su contexto amplio y su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. El autor indica que la validacion de calidad (KLD gate) y las pruebas de servicio aun no se han ejecutado. Para el modelo base GLM-5.3, Z.ai reporta una mejora del 50 % en su benchmark interno Z.ai Code Bench frente a GLM-5.2, pero no se proporcionan cifras concretas en los materiales consultados. Se recomienda consultar la model card del modelo base para obtener datos de rendimiento.

## Requisitos de hardware

- La configuracion objetivo es TP4 (tensor parallelism con 4 GPU) con 4x 96 GB de VRAM (por ejemplo, RTX PRO 6000 Blackwell) y caché KV en FP8.
- Estimacion de VRAM: con 755B parametros a 3.42 bpw, los pesos cuantizados ocupan aproximadamente 322 GB (755e9 * 3.42 / 8), mas overhead de activaciones y caché KV. En 4x 96 GB (384 GB totales) cabe con margen.
- No se indica compatibilidad con GPU de consumo (como RTX 4090) debido al tamaño del modelo; se requiere hardware de centro de datos o workstation de gama alta.
- Despliegue: requiere un stack exllamav3-b12x o sparkinfer-lineage con el parche de niveles mixtos de proyeccion. No es cargable con exllamav3 estandar ni con otros frameworks como vLLM u Ollama sin adaptaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| GLM-5.3 (base) | 755B | 40B | 1M | glm-5.3 | BF16 (original) |
| GLM-5.3-EXL3-TR3-3.42bpw (este) | 755B | 40B | 1M | glm-5.3 | EXL3 trellis 3.42 bpw |
| GLM-5.2-EXL3-TR3-3.0bpw (brandonmusic) | 755B (misma base) | 40B | 1M | mit (segun etiqueta) | EXL3 trellis 3.0 bpw |

La comparativa se limita a variantes de GLM-5.x porque no se dispone de datos de otros modelos MoE comparables en la informacion consultada. GLM-5.3 supera a GLM-5.2 en codigo y tareas de largo horizonte segun Z.ai, pero esta cuantizacion concreta aun no ha sido validada.

## Limitaciones y advertencias

- Estado pre-release: los pesos no estan completamente subidos y la validacion de calidad (KLD gate) y las pruebas de servicio no se han realizado. No debe usarse en produccion hasta que el autor retire el aviso.
- Compatibilidad restringida: requiere un cargador especifico con parche para niveles mixtos; un cargador estandar producira resultados incorrectos ("fluent garbage").
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Sesgos: no se han evaluado sesgos especificos de esta cuantizacion; el modelo base puede reflejar sesgos de sus datos de entrenamiento.
- Licencia: la licencia glm-5.3 es de tipo "other" y debe revisarse para uso comercial; no se detallan restricciones en la informacion disponible.
- Limitaciones de idioma: solo ingles y chino; no se garantiza buen rendimiento en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentacion de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Articulo tecnico (arXiv): https://arxiv.org/abs/2602.15763
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Variante similar GLM-5.2 cuantizada: https://huggingface.co/brandonmusic/GLM-5.2-EXL3-TR3-3.0bpw
