# mradermacher/ThoxAir-0.5B-GGUF

## Resumen

ThoxAir-0.5B-GGUF es la distribucion en formato GGUF del modelo ThoxAir-0.5B, desarrollado por Thox-ai y cuantizado por mradermacher. Se trata de un modelo de lenguaje de tipo transformer con 494.032.768 parametros (aproximadamente 0,5 mil millones), derivado de la familia Qwen2.5 segun las etiquetas de la model card, y afinado mediante SFT (supervised fine-tuning) sobre el dataset Thox-ai/thox-factory-sft-v5. Su proposito declarado es la inferencia en dispositivo (on-device) y en el borde (edge), con un enfoque local-first y compatibilidad con Ollama.

La relevancia de esta publicacion radica en su tamano reducido y su licencia Apache 2.0, que permiten desplegarlo en hardware de consumo y en entornos sin conectividad. El repositorio incluye un conjunto completo de cuantizaciones estaticas que van desde Q2_K (0,4 GB) hasta f16 (1,1 GB), lo que facilita ajustar el equilibrio entre calidad y huella de memoria. El modelo esta etiquetado como conversacional y orientado a ingles.

No se dispone de informacion publicada sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada. La model card del repositorio GGUF es una plantilla generica de cuantizacion de mradermacher y no aporta detalles tecnicos adicionales sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5, segun etiquetas de la model card) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors via transformers |

## Arquitectura y entrenamiento

El modelo base Thox-ai/ThoxAir-0.5B es un transformer de 494 millones de parametros, segun el recuento real de safetensors. Las etiquetas de la model card lo vinculan a la familia Qwen2.5, lo que sugiere una arquitectura decoder-only con atencion causal estandar, aunque no se detallan en la informacion disponible aspectos como el numero de capas, dimensiones ocultas, cabezas de atencion ni el uso de GQA. Tampoco se especifica si emplea embeddings atados o desatados.

El entrenamiento declarado consiste en un ajuste supervisado (SFT) sobre el dataset Thox-ai/thox-factory-sft-v5. No se proporcionan datos sobre el numero de tokens de preentrenamiento, la composicion del corpus, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las etiquetas "merged" y "wave-c2" sugieren que el modelo base podria ser el resultado de una fusion de modelos, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Razonamiento basico y respuesta a instrucciones, derivado del ajuste SFT.
- Capacidad de ejecucion en dispositivo (on-device) y en el borde (edge) gracias a su tamano reducido.
- Compatibilidad con Ollama, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales locales en aplicaciones de escritorio o moviles: con 494 millones de parametros y cuantizaciones de 0,4 a 0,6 GB, el modelo puede ejecutarse integramente en el dispositivo sin conexion, gestionando dialogos de complejidad moderada en ingles.
- Clasificacion y etiquetado de texto en el borde: su huella reducida permite desplegarlo en gateways o dispositivos IoT para tareas de filtrado, categorizacion o extraccion de entidades en tiempo real.
- Prototipado rapido de pipelines de NLP: al ser compatible con Ollama y llama.cpp, sirve para validar flujos de generacion antes de escalar a modelos mayores, con coste de computo minimo.
- Generacion de respuestas en sistemas de atencion al cliente con requisitos de privacidad: al ejecutarse localmente, los datos no abandonan la infraestructura del usuario, lo que encaja en entornos con restricciones de cumplimiento.
- Educacion y demostraciones de IA: su tamano permite ejecutarlo en portatiles sin GPU dedicada, facilitando talleres y pruebas de concepto sobre cuantizacion y despliegue local.
- Preprocesamiento y enrutamiento en arquitecturas multi-modelo: puede actuar como primer filtro o clasificador de intenciones antes de derivar consultas a modelos de mayor capacidad, reduciendo latencia y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB con cuantizaciones Q2_K a Q5_K_M; alrededor de 0,6 GB con Q8_0; aproximadamente 1,1 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060 o superiores son mas que suficientes. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta explicita en el repositorio), y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera una latencia muy baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxAir-0.5B-GGUF | 494 M | no disponible | Apache 2.0 | GGUF | Enfocado en on-device, solo ingles |
| Qwen2.5-0.5B | 494 M (aprox.) | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base de referencia de la familia |
| SmolLM2-360M | 360 M | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa pequena para edge |
| Gemma-2-2B | 2 B | no disponible en esta ficha | Gemma license | safetensors, GGUF | Mayor capacidad, licencia mas restrictiva |

La comparacion se basa en caracteristicas generales de categoria; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen2.5 y entrenarse con un dataset SFT no descrito, pueden persistir sesgos del corpus original.
- Riesgo de alucinacion: elevado en modelos de este tamano, especialmente en tareas de conocimiento factual o razonamiento complejo.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide garantizar dialogos largos o documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Thox-ai/ThoxAir-0.5B y de Qwen2.5 si se redistribuye.
- Caveats para produccion: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no documenta el comportamiento del modelo; no hay benchmarks ni evaluaciones publicadas que respalden su calidad. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por la comunidad.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThoxAir-0.5B-GGUF
- Modelo base: https://huggingface.co/Thox-ai/ThoxAir-0.5B
- Dataset de SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ThoxAir-0.5B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
