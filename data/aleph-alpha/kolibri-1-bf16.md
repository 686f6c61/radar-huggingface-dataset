# Aleph-Alpha/Kolibri-1-BF16

## Resumen

Kolibri 1 es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por Aleph Alpha Research GmbH, orientado a razonamiento explícito, generación de texto y tool calling en alemán e inglés. Con 78.103.074.560 parámetros totales y solo 3.457.573.120 parámetros activos por token, el modelo busca combinar la capacidad de un modelo grande con un coste computacional por token bajo, manteniendo una huella de memoria de aproximadamente 156 GB en bfloat16.

El modelo emplea una arquitectura transformer de 50 capas con atención híbrida 4:1 SWA:GQA (sliding-window attention frente a grouped-query attention), 384 expertos por capa con 1 compartido y 6 enrutados, y un tokenizador específicamente diseñado para la estructura morfológica del alemán. Soporta un modo de razonamiento explícito y tool calling, y está optimizado para contextos largos: su longitud nativa es de 262.144 tokens, validada hasta 1.048.576 tokens sin escalado posicional.

La relevancia actual de Kolibri 1 radica en su enfoque de "profundidad sobre amplitud": en lugar de cubrir decenas de idiomas, prioriza un rendimiento sólido en alemán e inglés con una licencia Apache 2.0 permisiva, lo que lo convierte en una opción atractiva para despliegues soberanos en el espacio europeo y para integraciones en pipelines de agentes y RAG con requisitos de contexto muy extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, 50 capas, atención híbrida 4:1 SWA:GQA |
| Parametros totales | 78.103.074.560 (78B) |
| Parametros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | 262.144 tokens nativos; validado hasta 1.048.576 tokens; recomendado ≤262.144 |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer MoE de 50 capas que combina capas de atención con ventana deslizante (SWA) y capas de grouped-query attention (GQA) en una proporción 4:1. Cada capa contiene 384 expertos, de los cuales 1 es compartido y 6 se enrutan dinámicamente por token. El entrenamiento utilizó Muon como optimizador y Exact Quantile Balancing para el enrutamiento de expertos. La codificación posicional se aplica únicamente en las capas de ventana deslizante, lo que permite extender el contexto más allá de la longitud nativa sin necesidad de escalado posicional.

El preentrenamiento se realizó sobre 20 billones (20T) de tokens de un corpus bilingüe filtrado compuesto por aproximadamente 62,5% inglés, 23,9% alemán y 13,6% código, combinando datos web curados, reformulaciones y traducciones sintéticas y fuentes de alta calidad. Posteriormente se realizó un mid-training de 3,44T tokens y una fase final de extensión de contexto de 201B tokens. El post-entrenamiento incluyó SFT con datos bilingües filtrados (open source y sintéticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, comportamiento agéntico y seguimiento de instrucciones. El cómputo total de preentrenamiento se estima en 6,4e23 FLOPs, ejecutado sobre 768 GPUs NVIDIA B200 (96 nodos HGX 8xB200) durante 21 días (392k GPU-horas), con un consumo energético estimado de 9,5×10² MWh incluyendo PUE.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de razonamiento explícito.
- Tool calling y function calling para integración en orquestadores de agentes.
- Razonamiento agéntico multi-paso y ejecución de flujos con validación externa.
- Procesamiento de documentos largos y RAG sobre contextos de hasta 262.144 tokens (recomendado) y validado hasta 1.048.576.
- Generación de código y tareas de programación (13,6% del corpus de preentrenamiento es código).
- Extracción estructurada de información y salidas estructuradas.
- Capacidades bilingües alemán-inglés con tokenizador optimizado para morfología alemana.
- Procesamiento de texto de entrada y salida; no se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistentes conversacionales en alemán e inglés: el modelo puede mantener conversaciones multi-turno con contexto largo, adecuado para atención al cliente o asistentes internos donde se requiere coherencia a lo largo de sesiones extensas.
- RAG sobre documentación corporativa: con 262.144 tokens de contexto recomendado, permite ingerir manuales, contratos o expedientes completos y responder preguntas con evidencia trazable, validado hasta 1M de tokens para casos extremos.
- Procesamiento de documentos largos y borradores: útil para resumir, extraer cláusulas o redactar borradores a partir de corpus extensos, con revisión humana posterior.
- Orquestación de agentes con tool calling: integrable en capas de orquestación que invocan APIs, ejecutan código o lanzan búsquedas, siempre que el sistema valide los resultados antes de actuar.
- Generación de código en pipelines: soporta tool calling y puede integrarse en flujos de CI/CD o asistentes de programación para tareas de generación, revisión y extracción estructurada.
- Sistemas de soporte a la decisión: el modelo actúa en el lado advisory, aportando evidencia y opciones para que un humano decida, no como componente decisor autónomo.
- Herramientas internas de conocimiento e investigación: búsqueda semántica y síntesis sobre material propio de la organización en entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de memoria del modelo: ~156 GB (pesos BF16).
- Mínimo: 4× A100 80 GB, 4× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Recomendado: 4× H100 SXM5, 2× H200, 2× B200 o 1× B300.
- No cabe en GPUs de consumo (RTX 4090, etc.) en BF16; se requeriría cuantización, no documentada en la información disponible.
- Opciones de despliegue: la model card indica compatibilidad con `transformers` y endpoints compatibles; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Kolibri 1 | 78B | 3,46B | 262.144 nativo (1M validado) | Apache 2.0 | de, en |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se inventan datos de rendimiento ni de especificaciones de terceros.

## Limitaciones y advertencias

- Solo soporta alemán e inglés de forma nativa; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card recomienda revisión humana antes de actuar sobre las salidas.
- No está diseñado para operación autónoma sin supervisión; el uso previsto es de colaboración humano-IA y soporte a la decisión, no como componente decisor.
- El conocimiento implícito tiene fecha de corte el 18 de junio de 2026 (tanto en inglés como en alemán); información posterior solo puede obtenerse vía tool use.
- La huella de memoria (~156 GB en BF16) exige hardware de gama alta; no hay información sobre cuantizaciones que reduzcan requisitos.
- Aunque la licencia es Apache 2.0, Aleph Alpha es firmante del Código de Práctica GPAI de la UE y publica una política de uso responsable que conviene revisar para despliegues en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Tech report: https://aleph-alpha.com/downloads/tech-report.pdf
- Tech blog: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Código de Práctica GPAI (UE): https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Papers referenciados en tags: arxiv:2512.11614, arxiv:2601.17858
