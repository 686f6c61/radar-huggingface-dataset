# mradermacher/lexi-2-249b-base-GGUF

## Resumen

Lexi 2.249B es un modelo de lenguaje de 2.245.681.664 parámetros (aproximadamente 2,25 mil millones) desarrollado por Reallexi-llc, especializado en tareas de programación. Se trata de un fine-tune del modelo base Reallexi-llc/lexi-2-249b-base, entrenado sobre el dataset reallexi/lexi-coder-v3-datasest, y orientado explícitamente a casos de uso de generación y asistencia de código. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo pertenece a la familia arquitectónica Qwen2, según las etiquetas del repositorio, lo que lo sitúa en la estirpe de transformers decoder-only con atención causal estándar. Su tamaño compacto (2,25B) lo hace adecuado para despliegues locales, entornos con recursos limitados y aplicaciones donde la latencia y el coste de inferencia son críticos, sacrificando capacidad bruta frente a modelos de mayor escala.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y cuantizada para tareas de codificación, con un conjunto amplio de cuantizaciones estáticas (desde Q2_K hasta f16) que cubren desde 1,0 GB hasta 4,6 GB de peso en disco. No obstante, la información pública disponible sobre el modelo base es escasa: no se detallan la longitud de contexto, la composición exacta del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según etiquetas del repositorio) |
| Parametros totales | 2.245.681.664 (~2,25B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | other (inherits-base-model-and-dataset-terms) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Qwen2, según las etiquetas declaradas por el autor de la cuantización. El modelo es un fine-tune del base Reallexi-llc/lexi-2-249b-base, entrenado sobre el dataset reallexi/lexi-coder-v3-datasest, orientado a tareas de codificación. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá del fine-tuning declarado.

La innovación técnica destacable en esta ficha es la disponibilidad de cuantizaciones estáticas GGUF producidas por mradermacher, que permiten ejecutar el modelo en CPU y GPU de consumo mediante llama.cpp. El autor indica además que existen cuantizaciones ponderadas/imatrix en un repositorio separado (lexi-2-249b-base-i1-GGUF), lo que sugiere un proceso de cuantización con matriz de importancia para preservar calidad en bits bajos. No se documentan otras innovaciones como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto y código: el modelo está etiquetado como "coding" y afinado sobre un dataset específico de programación, por lo que su capacidad principal es la asistencia en tareas de escritura y finalización de código.
- Conversación: la etiqueta "conversational" indica soporte para diálogo multi-turno, aunque no se detalla el formato de plantilla de chat.
- Razonamiento y matemáticas: no disponible explícitamente en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés ("en") según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Autocompletado de código en IDE: el modelo, con 2,25B parámetros y cuantización Q4_K_M de 1,5 GB, puede ejecutarse localmente en un portátil y ofrecer sugerencias de código con baja latencia, integrándose en extensiones tipo Continue o similares mediante un servidor llama.cpp.
- Asistencia de programación en entornos con recursos limitados: al caber en GPUs de consumo e incluso en CPU con cuantizaciones Q2_K/Q3_K, es adecuado para estaciones de trabajo sin aceleradores dedicados o para despliegues en el borde.
- Generación de fragmentos de código en pipelines de CI/CD: con cuantización Q8_0 (2,5 GB) se puede desplegar en contenedores para tareas de generación de tests, documentación de funciones o refactorización asistida, siempre con revisión humana.
- Chat de soporte técnico para desarrolladores: la etiqueta "conversational" y el enfoque en código permiten usarlo como asistente de dudas de programación en inglés, con contexto limitado por la ventana no documentada.
- Prototipado rápido de aplicaciones de IA: su reducido tamaño permite iterar rápidamente en local con Ollama o llama.cpp antes de escalar a modelos mayores, reduciendo costes de experimentación.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo pequeño y con pesos GGUF y safetensors disponibles, sirve como base para ajustes ligeros en nichos de código concretos (por ejemplo, un lenguaje o framework específico).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,0 GB (Q2_K) y 4,6 GB (f16) solo para los pesos; añadir overhead de contexto y KV cache (típicamente 0,5–2 GB adicionales según longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 4–6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque para este tamaño las consumer son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más; las cuantizaciones Q2_K y Q3_K pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; también es posible usar transformers con los pesos safetensors del modelo base.
- Latencia y throughput estimados: no disponible en la información proporcionada; para un modelo de 2,25B en Q4_K_M se espera un throughput alto en GPU de consumo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lexi 2.249B (este) | 2,25B | no disponible | other (hereda términos) | GGUF + safetensors | Fine-tune para código, solo inglés |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo oficial de código, multilingüe |
| Qwen2.5-Coder-3B | 3B | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo oficial de código, multilingüe |
| DeepSeek-Coder-1.3B | 1,3B | 16K (según versión) | DeepSeek License | safetensors, GGUF | Enfocado a código, inglés/chino |

La comparativa se basa en modelos de tamaño y propósito similares ampliamente conocidos; los datos de contexto de los alternativos pueden variar según la versión y no se han verificado contra la información proporcionada para este modelo. La principal ventaja de Lexi es su disponibilidad en múltiples cuantizaciones GGUF listas para usar; su principal desventaja frente a Qwen2.5-Coder es la licencia restrictiva ("other") y la falta de documentación sobre contexto y rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo en inglés y sobre un dataset de código, puede presentar sesgos hacia convenciones de programación occidentales y un rendimiento limitado en otros idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en generación de código puede producir APIs inexistentes o fragmentos sintácticamente válidos pero funcionalmente incorrectos, por lo que requiere revisión humana.
- Limitaciones de contexto o idioma: solo inglés declarado; la longitud de contexto no está documentada, lo que impide planificar usos con ventanas largas.
- Restricciones de licencia: la licencia es "other" y hereda los términos del modelo base y del dataset; es imprescindible revisar las condiciones de Reallexi-llc/lexi-2-249b-base y del dataset reallexi/lexi-coder-v3-datasest antes de cualquier uso comercial.
- Caveats para producción: la falta de benchmarks y de documentación sobre entrenamiento y contexto dificulta la evaluación objetiva; se recomienda validar el modelo en el dominio concreto antes de desplegarlo. El autor de la cuantización advierte que las cuantizaciones Q3_K_M son de menor calidad y que las IQ suelen ser preferibles a las no-IQ de tamaño similar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lexi-2-249b-base-GGUF
- Modelo base: https://huggingface.co/Reallexi-llc/lexi-2-249b-base
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/lexi-2-249b-base-i1-GGUF
- Página de descarga del cuantizador: https://hf.tst.eu/model#lexi-2-249b-base-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/reallexi/lexi-coder-v3-datasest
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
