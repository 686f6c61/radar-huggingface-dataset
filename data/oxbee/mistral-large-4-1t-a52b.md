# OxBee/Mistral-Large-4-1T-A52B

## Resumen

Mistral Large 4, conocido internamente como "Le Chonk", es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Mistral AI. Con aproximadamente 1 billon de parametros totales y 52.000 millones activos por token, se posiciona como el modelo mas grande y capaz publicado por la compania hasta la fecha. Fue entrenado desde cero en 3.800 GPUs NVIDIA Grace Blackwell en los propios centros de datos de Mistral en Europa, lo que subraya el enfasis del fabricante en la soberania tecnologica europea.

El modelo unifica instrucciones, razonamiento, generacion de codigo y flujos de trabajo agenticos en un unico conjunto de pesos. Incorpora entrada multimodal (texto e imagen) mediante un codificador visual de estilo Pixtral, admite una ventana de contexto de 1 millon de tokens y ofrece fluidez nativa en mas de 160 idiomas, incluidas todas las lenguas oficiales de la Union Europea. Destaca especialmente en ciberseguridad, finanzas y derecho, y segun el autor supera a modelos cerrados de frontera en tareas de grounding visual.

La relevancia actual del modelo radica en su combinacion de escala (1T parametros), eficiencia (solo 52B activos por token) y apertura de pesos bajo una licencia propia basada en MIT. Ademas, el checkpoint incluye una cabeza de decodificacion especulativa DSpark embebida y existe una variante cuantizada NVFP4 optimizada para GPUs Blackwell, lo que facilita su despliegue en infraestructuras de inferencia modernas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal con codificador visual estilo Pixtral |
| Parametros totales | ~1 billon (1T) |
| Parametros activos | ~52.000 millones por token (49B en expertos + embeddings y capas de salida) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (checkpoint oficial adicional); no se detallan otros formatos cuantizados en la informacion disponible |
| Idiomas soportados | 160+ idiomas, incluidos todos los oficiales de la UE; la model card lista 39 idiomas con etiqueta explicita |
| Licencia | Mistral Ecosystem Open-Weight License (basada en MIT, con restriccion para Model-as-a-Service) |
| Formato de pesos | safetensors (repo de 1.060,6 GB); variante NVFP4 disponible por separado |

## Arquitectura y entrenamiento

Mistral Large 4 emplea una arquitectura Mixture-of-Experts granular con 128 expertos enrutados, de los cuales 4 se activan por token, mas 1 experto compartido. Esta configuracion permite alcanzar una capacidad efectiva de 1 billon de parametros manteniendo un coste computacional por token equivalente al de un modelo denso de ~52.000 millones. El modelo es nativamente multimodal: acepta texto e imagen como entrada y produce texto, con un codificador visual de estilo Pixtral entrenado para manejar tamanos y relaciones de aspecto variables.

El entrenamiento se realizo desde cero sobre 3.800 GPUs NVIDIA Grace Blackwell en los centros de datos de Mistral en Europa. La model card no especifica el numero exacto de tokens de entrenamiento ni la composicion del dataset, ni detalla si se aplicaron tecnicas de RLHF o DPO. Entre las innovaciones tecnicas destacables figuran la inclusion de una cabeza de decodificacion especulativa DSpark embebida en el checkpoint, que acelera la generacion sin necesidad de un modelo borrador externo, y la disponibilidad de un checkpoint NVFP4 que reduce la huella de memoria y acelera la inferencia en GPUs Blackwell manteniendo el mismo rendimiento.

## Capacidades

- Generacion de texto y razonamiento con tres niveles de esfuerzo configurables por peticion: `low`, `medium` y `high` (por defecto).
- Generacion de codigo y soporte para flujos de trabajo de agentes de programacion, con un rendimiento destacado en el Artificial Analysis Coding Agent Index.
- Entrada multimodal: analisis de imagenes, graficos, dibujos tecnicos y documentos, con grounding visual de referencia entre los pesos abiertos.
- Function calling nativo, salida JSON y aplicacion estricta de esquemas JSON.
- Capacidades agenticas con razonamiento multi-paso y adherencia fuerte a system prompts.
- Multilingue nativo en mas de 160 idiomas, con cobertura de todas las lenguas oficiales de la UE.
- Especializacion destacada en ciberseguridad, finanzas y derecho, con rechazo de peticiones maliciosas.
- Ventana de contexto de 1 millon de tokens para cargas de trabajo de contexto largo.
- Compatibilidad con vLLM, SGLang, transformers y llama.cpp, e integracion con endpoints compatibles.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1M tokens, manteniendo el historial completo del cliente y documentacion de producto sin truncar, con un esfuerzo de razonamiento `low` para respuestas rapidas.
- Generacion de codigo en produccion: soporta tool calling y salida JSON estricta, lo que permite integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests y correccion automatizada de errores con agentes multi-paso.
- Agentes de ciberseguridad: analisis de amenazas, triaje de alertas y generacion de informes de vulnerabilidades, aprovechando su rendimiento de referencia entre modelos abiertos en tareas de seguridad y su rechazo de peticiones maliciosas.
- Analisis documental juridico y financiero: procesamiento de contratos, informes y expedientes extensos gracias al contexto de 1M tokens, con extraccion estructurada mediante esquemas JSON para alimentar sistemas internos.
- Grounding visual y automatizacion de documentos: interpretacion de graficos, planos tecnicos y capturas para extraer datos estructurados o responder preguntas sobre el contenido visual, adecuado por su codificador Pixtral y su calidad de grounding.
- Asistentes multilingues para la UE: despliegue de un unico modelo para atender a usuarios en todas las lenguas oficiales europeas, reduciendo la necesidad de modelos especializados por idioma.
- Investigacion y prototipado agentico: uso del checkpoint con cabeza DSpark embebida para experimentar con decodificacion especulativa y flujos de razonamiento configurables en entornos de investigacion.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Artificial Analysis Coding Agent Index | 48% | Practicamente empatado con GLM-5.3, usando un 47% menos de tokens por tarea |
| Artificial Analysis Intelligence Index v5 | 26 | El mas alto entre modelos abiertos occidentales |

La model card indica que los modelos abiertos lideres de China obtienen puntuaciones superiores en el indice agregado de inteligencia, pero Mistral Large 4 destaca especialmente en codigo y ciberseguridad. Para mas benchmarks, especialmente en ciberseguridad, finanzas y derecho, el autor remite al blog oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo completo ocupa 1.060,6 GB en safetensors, por lo que la inferencia en precision completa requiere infraestructura multi-GPU de gran escala.
- La variante NVFP4 reduce la huella de memoria y acelera la inferencia, y esta orientada a GPUs Blackwell; soporta vLLM y SGLang.
- GPUs recomendadas: NVIDIA Grace Blackwell (entrenamiento) y Blackwell para la variante NVFP4; no se detallan otros modelos de GPU en la informacion disponible.
- No cabe en GPUs de consumo convencionales en precision completa; la informacion no confirma si alguna cuantizacion permite su ejecucion en tarjetas consumer.
- Opciones de despliegue: vLLM, SGLang, transformers, llama.cpp y endpoints compatibles; tambien disponible en la API de Mistral como `mistral-large-4`.
- Latencia y throughput estimados: no disponibles; la decodificacion especulativa DSpark y el checkpoint NVFP4 estan orientados a mejorar ambos aspectos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral Large 4 (Le Chonk) | ~1T totales / ~52B activos | 1M | Mistral Ecosystem Open-Weight (basada en MIT) | Pesos abiertos en HuggingFace y API de Mistral |
| GLM-5.3 | no disponible | no disponible | no disponible | Pesos abiertos (referenciado como lider abierto en coding) |
| Modelos abiertos lideres de China (sin especificar) | no disponible | no disponible | no disponible | Pesos abiertos |

La model card solo ofrece comparaciones agregadas frente a GLM-5.3 (coding) y frente a modelos abiertos chinos (indice de inteligencia). No se proporcionan datos detallados de parametros, contexto ni licencia de los modelos comparados, por lo que la comparativa completa no esta disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado a gran escala, es previsible que herede sesgos de sus datos de entrenamiento, aunque no se detallan.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan tasas de error ni evaluaciones de factualidad.
- La licencia, aunque basada en MIT, restringe el uso para operar un negocio de Model-as-a-Service sin una licencia comercial separada con Mistral; revisar antes de un despliegue comercial.
- El rendimiento en el indice agregado de inteligencia es inferior al de los principales modelos abiertos chinos, segun reconoce el propio autor.
- El contexto de 1M tokens puede degradar la calidad en tareas de recuperacion precisa si no se gestiona adecuadamente; no se documentan evaluaciones especificas de contexto largo.
- El tamano del checkpoint (1.060,6 GB) y los requisitos de infraestructura limitan su uso a entornos con GPUs de alta gama; el despliegue en hardware consumer no esta confirmado.
- No se especifican los datos de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO, lo que dificulta evaluar riesgos de contaminacion o comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OxBee/Mistral-Large-4-1T-A52B
- Blog oficial: https://mistral.ai/news/mistral-large-4-oss/
- Documentacion de la API: https://docs.mistral.ai/models/mistral-large-4-0
- Checkpoint NVFP4: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Galeria de demos: https://mistralai-ml4-le-chonk-gallery.hf.space/
- Mistral Vibe (agente de codigo): https://github.com/mistralai/mistral-vibe
