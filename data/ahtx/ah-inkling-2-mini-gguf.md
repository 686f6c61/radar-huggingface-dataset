# ahtx/AH-Inkling-2-Mini-GGUF

## Resumen

AH-Inkling-2-Mini-GGUF es una compilación de cuantizaciones GGUF del modelo Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario ahtx. No se trata de un modelo entrenado desde cero, sino de una re-cuantización de los GGUF de Unsloth (en disposición mainline) aplicando una matriz de importancia (imatrix) para mejorar la calidad de la compresión. El objetivo es ofrecer pesos listos para ejecutarse en llama.cpp estándar, sin necesidad de forks ni parches específicos.

El modelo base, Inkling 2 Mini, es un transformer de tipo mezcla de expertos (MoE) con 26.070.390.272 parámetros totales (aproximadamente 26,07 mil millones). La model card del repositorio confirma la arquitectura MoE mediante la etiqueta correspondiente, aunque no detalla el número de parámetros activos ni la composición exacta de los expertos. Está orientado a generación de texto conversacional y declara soporte únicamente para inglés.

La relevancia de esta ficha radica en que proporciona dos builds GGUF (IQ2_M y Q4_K_M) que permiten desplegar un modelo de 26B en hardware de consumo o en configuraciones con GPU modesta, gracias a la posibilidad de repartir el modelo entre VRAM y RAM del sistema con llama.cpp. La licencia Apache-2.0 facilita su uso comercial, sujeta a la política de uso aceptable de Thinking Machines Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 26.070.390.272 (aprox. 26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 32768` (32 768 tokens) |
| Tipos de cuantizacion | IQ2_M (10,7 GB) y Q4_K_M (17,4 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines Lab) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura transformer con mezcla de expertos (MoE), según la etiqueta `moe` de la model card y la información del repositorio. No se dispone de detalles sobre el número de expertos, la estrategia de enrutamiento, el número de parámetros activos por token ni la dimensión de las capas. Tampoco se especifican los datos de entrenamiento: número de tokens, composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Esta publicación concreta no entrena ni ajusta los pesos. Se limita a re-cuantizar los GGUF mainline de Unsloth con una matriz de importancia (imatrix), una técnica que pondera la pérdida de precisión según la relevancia estadística de cada peso durante la calibración, con el objetivo de preservar mejor la calidad en cuantizaciones agresivas como IQ2_M. La model card no documenta el conjunto de calibración ni los parámetros exactos de la imatrix.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento y respuesta multi-turno: el ejemplo de la model card emplea `--jinja`, lo que indica soporte de plantillas de chat para formatear conversaciones.
- Ejecución en llama.cpp mainline (build b12611 o posterior), con soporte de descarga de pesos entre GPU y RAM del sistema mediante `-ngl`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con infraestructuras de servicio tipo API.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con `llama-server` y una plantilla Jinja para gestionar diálogos multi-turno en inglés, con contexto de hasta 32 768 tokens según el ejemplo de la model card, adecuado para sesiones largas de chat.
- Despliegue en hardware de consumo: con la cuantización IQ2_M (10,7 GB) y el reparto entre VRAM y RAM que permite llama.cpp, es viable ejecutar un modelo de 26B en equipos con GPU de gama alta para consumidor y suficiente RAM del sistema.
- Prototipado e investigación: al ser una cuantización GGUF de un modelo MoE de 26B, sirve para experimentar con técnicas de inferencia eficiente y comparar la degradación de calidad entre IQ2_M y Q4_K_M en tareas de generación.
- Generación de texto en pipelines locales: integrable en scripts o servicios que consuman la API compatible de `llama-server`, útil para resúmenes, redacción o transformación de texto en inglés sin depender de la nube.
- Evaluación de cuantizaciones con imatrix: el repositorio permite comparar el impacto de la matriz de importancia frente a cuantizaciones estándar, un caso de uso relevante para quienes investigan compresión de modelos.
- Servicio interno con licencia permisiva: la licencia Apache-2.0 y la política de uso aceptable permiten desplegar el modelo en entornos corporativos para tareas de generación de texto en inglés, siempre que se cumplan las restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para IQ2_M: aproximadamente 10,7 GB de pesos; con overhead de contexto y caché KV, se recomienda al menos 12-16 GB de VRAM si se carga íntegramente en GPU, o bien repartir capas entre GPU y RAM.
- VRAM estimada para Q4_K_M: aproximadamente 17,4 GB de pesos; se recomienda 20-24 GB de VRAM para carga completa, o reparto con RAM del sistema.
- GPU recomendadas: para carga completa de Q4_K_M, GPUs con 24 GB o más (RTX 3090, RTX 4090, A10G, L4, A100, H100). Para IQ2_M, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) pueden ser suficientes con contexto moderado.
- Cabe en GPU de consumo: sí, especialmente IQ2_M en GPUs de 16 GB o más; Q4_K_M requiere 24 GB para carga completa o reparto con RAM.
- Opciones de despliegue: llama.cpp (build b12611 o posterior), mediante `llama-server` o `llama-cli`; no se documentan otros runners como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware, del reparto de capas y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AH-Inkling-2-Mini-GGUF (IQ2_M / Q4_K_M) | 26,07 B (MoE) | no disponible (ejemplo con 32 768) | Apache-2.0 | GGUF | Cuantización con imatrix para llama.cpp |
| Inkling-2-Mini (base, thinkingmachines) | 26,07 B (MoE) | no disponible | Apache-2.0 | safetensors (presumible) | Modelo original de Thinking Machines Lab |
| Unsloth Inkling-2-Mini-GGUF | 26,07 B (MoE) | no disponible | Apache-2.0 | GGUF | GGUF mainline de origen, sin imatrix documentada |

No se dispone de información sobre benchmarks ni sobre modelos alternativos de otros fabricantes con los que comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado mayoritariamente o exclusivamente en inglés, es probable que herede sesgos del corpus de entrenamiento, aunque no se especifica.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en cuantizaciones agresivas como IQ2_M.
- Limitaciones de idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la model card no especifica la longitud máxima de contexto del modelo base; el valor de 32 768 del ejemplo es una configuración de ejecución, no necesariamente el máximo soportado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo está sujeto a la Model Acceptable Use Policy de Thinking Machines Lab, que puede imponer restricciones adicionales sobre usos concretos.
- Degradación por cuantización: IQ2_M prioriza el ahorro de memoria a costa de precisión; para producción con requisitos de calidad estrictos se recomienda Q4_K_M o los pesos originales.
- Requisito de versión: se necesita llama.cpp b12611 o posterior; versiones anteriores pueden no cargar correctamente estos GGUF.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia comunitaria de validación ni reportes de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahtx/AH-Inkling-2-Mini-GGUF
- Modelo base en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Build Kindi (7,4 GiB): https://huggingface.co/ahtx/AH-Inkling-2-Mini
- Página del proyecto con instrucciones y demos: https://amirhusain.com/inkling
- Release de llama.cpp b12611: https://github.com/ggml-org/llama.cpp/releases/tag/b12611
- Licencia del repositorio: https://huggingface.co/ahtx/AH-Inkling-2-Mini-GGUF/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/ahtx/AH-Inkling-2-Mini-GGUF/blob/main/NOTICE
- Política de uso aceptable de Thinking Machines Lab: https://thinkingmachines.ai/model-acceptable-use-policy/
