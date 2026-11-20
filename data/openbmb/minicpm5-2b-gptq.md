# openbmb/MiniCPM5-2B-GPTQ

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de tipo Transformer con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones), desarrollado por OpenBMB. Se trata del segundo modelo de la serie MiniCPM5, tras MiniCPM5-1B, y está diseñado específicamente para despliegue en dispositivo (on-device), entornos locales y escenarios con recursos limitados. El modelo se distribuye bajo licencia Apache 2.0 y soporta únicamente inglés y chino.

La relevancia de este lanzamiento radica en su posicionamiento como estado del arte en la categoría de 2B de código abierto, con un rendimiento que el autor sitúa a la altura de modelos de 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas. El modelo se entrenó sobre un conjunto de datasets propietarios de OpenBMB (Ultra-FineWeb, UltraX-Preview, UltraData-Math, UltraData-Code, entre otros), lo que refleja un pipeline de datos curado internamente.

La variante documentada aquí, `MiniCPM5-2B-GPTQ`, es una cuantización de 4 bits del modelo base, publicada en formato safetensors y compatible con transformers y text-generation-inference. Su tamaño de repositorio de 2,1 GB la hace apta para GPUs de consumo y hardware de borde, aunque el contexto máximo, los tipos de cuantización adicionales y los detalles de arquitectura interna no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (serie MiniCPM5) |
| Parametros totales | 2.516.756.480 (aprox. 2,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | GPTQ de 4 bits (esta variante); el modelo base admite otras, no detalladas |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ 4-bit) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso que escala la misma receta de entrenamiento empleada en MiniCPM5-1B. El autor lo describe como un modelo de 2B orientado a despliegue local y a escenarios con restricciones de recursos, sin detallar en la información disponible el número exacto de capas, dimensiones ocultas, mecanismo de atención ni innovaciones arquitectónicas concretas (no se confirma el uso de atención lineal, decodificación especulativa ni arquitecturas híbridas).

El entrenamiento se apoya en un conjunto de datasets de OpenBMB: Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para datos web de pretraining, UltraData-Math y UltraData-Code para dominios especializados, y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para las fases de ajuste supervisado, agentes y aprendizaje por refuerzo. La presencia de un dataset específico de RL sugiere una fase de optimización por refuerzo orientada a agentes y uso de herramientas, aunque no se especifican el número de tokens de entrenamiento ni la composición exacta del corpus.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de código: el autor lo sitúa como ventaja competitiva frente a modelos de tamaño similar.
- Razonamiento matemático, respaldado por el dataset UltraData-Math.
- Comprensión de contexto largo (etiqueta long-context), aunque la longitud exacta no se especifica.
- Tool calling / function calling, con soporte explícito en las etiquetas del modelo.
- Tareas agénticas y razonamiento multi-paso, reforzado por UltraData-SFT-Agent y UltraData-RL.
- Seguimiento de instrucciones (instruction following), evaluado en el radar de capacidades del autor.
- Despliegue en dispositivo y edge AI, con cuantización de 4 bits para reducir huella de memoria.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistentes locales en dispositivo: el modelo, con 2,5B parámetros y cuantización GPTQ de 4 bits (repositorio de 2,1 GB), puede ejecutarse en portátiles y equipos de borde para asistentes conversacionales sin conexión, manteniendo la privacidad de los datos.
- Generación de código en entornos con recursos limitados: su ventaja declarada en código y su soporte de tool calling permiten integrarlo en editores o pipelines de CI/CD locales donde no se dispone de GPUs de datacenter.
- Agentes de automatización de tareas: gracias a los datasets de agentes y RL, puede encadenar llamadas a herramientas y razonamiento multi-paso en flujos como consulta de APIs, gestión de ficheros o automatización de escritorio.
- Atención al cliente multilingüe inglés-chino: cubre conversaciones multi-turno en ambos idiomas, adecuado para mercados bilingües o empresas con operaciones en China y países anglófonos.
- Procesamiento de documentos largos: la etiqueta long-context sugiere uso en resumen y extracción de información sobre documentos extensos, aunque la ventana exacta debe verificarse antes de producción.
- Tutoría y resolución de problemas matemáticos: el entrenamiento con UltraData-Math lo hace apto para asistentes educativos que explican pasos intermedios.
- Prototipado rápido y fine-tuning: su licencia Apache 2.0 y tamaño reducido facilitan el ajuste fino y la experimentación en investigación con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona de forma cualitativa un rendimiento de estado del arte en la clase 2B y competitividad con modelos de 4B en código, matemáticas, contexto largo, uso de herramientas y tareas agénticas, pero no se incluyen cifras numéricas (MMLU, HumanEval, GSM8K u otras) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para la variante GPTQ 4-bit: en torno a 2-3 GB para los pesos, más overhead de contexto y activaciones; el repositorio ocupa 2,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para la variante cuantizada; para el modelo en precisión completa (BF16/FP16), se estiman unos 5-6 GB solo para pesos.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida; también en hardware de borde tipo Apple Silicon o NPUs, aunque no se detallan requisitos oficiales.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles según las etiquetas; llama.cpp, Ollama y vLLM no se confirman en la información disponible para esta variante GPTQ.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-2B-GPTQ | 2,5B | no disponible (long-context) | Apache 2.0 | Variante 4-bit; SOTA declarado en clase 2B |
| MiniCPM5-1B | 1B (aprox.) | no disponible | no disponible en la informacion | Modelo previo de la misma serie; menor capacidad |
| Modelos de 4B de código abierto | ~4B | variable | variable | El autor afirma competitividad del 2B frente a esta clase, sin cifras |

No se dispone de datos numéricos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a modelos de 2B, especialmente en conocimiento factual y tareas de razonamiento complejo.
- La longitud de contexto no está especificada; la etiqueta long-context no sustituye a un dato verificado de ventana máxima.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La variante GPTQ de 4 bits puede degradar ligeramente la calidad respecto al modelo en precisión completa; conviene validar en la tarea objetivo.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse las licencias de los datasets de entrenamiento si se redistribuye el modelo.
- No se confirma soporte oficial para llama.cpp, Ollama o vLLM en esta variante, lo que puede limitar opciones de despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-GPTQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Informe técnico MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Referencia arXiv 2602.09003: https://arxiv.org/abs/2602.09003
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Documentación MiniCPM (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
