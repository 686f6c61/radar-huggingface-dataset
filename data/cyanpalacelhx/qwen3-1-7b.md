# CyanPalacelhx/Qwen3-1.7B

## Resumen

Qwen3-1.7B es un modelo de lenguaje causal denso de la familia Qwen3, desarrollada por Alibaba Qwen. Este repositorio concreto (`CyanPalacelhx/Qwen3-1.7B`) es una réplica del modelo oficial `Qwen/Qwen3-1.7B`, derivado mediante fine-tuning del checkpoint base `Qwen/Qwen3-1.7B-Base`. Con 2.031.739.904 parámetros totales (1.400 millones no correspondientes a embeddings), 28 capas y una ventana de contexto de 32.768 tokens, se posiciona como la variante más pequena de la generación Qwen3, pensada para despliegues con recursos limitados.

La innovación principal de la familia es la capacidad de alternar entre modo "thinking" (razonamiento explícito envuelto en bloques ``) y modo "non-thinking" (respuesta directa) dentro de un mismo modelo, controlable mediante el parámetro `enable_thinking` en la plantilla de chat. Esto permite usar el mismo checkpoint tanto para tareas de razonamiento complejo (matemáticas, código) como para diálogo general de baja latencia.

Es relevante ahora porque ofrece capacidades de agentes, tool calling y soporte multilingüe (más de 100 idiomas según la documentación de la familia) en un paquete de 1,7B parámetros con licencia Apache 2.0, lo que facilita su uso comercial y su ejecución en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) con GQA |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (soporte habitual via llama.cpp/Ollama: GGUF; via transformers: bfloat16/float16) |
| Idiomas soportados | mas de 100 idiomas y dialectos (segun documentacion de la familia Qwen3); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 28 |
| Cabezas de atencion | 16 para Q y 8 para KV (GQA) |
| Parametros no-embedding | 1.4B |
| Tipo | Causal Language Model |
| Etapas de entrenamiento | Preentrenamiento y post-entrenamiento |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 28 capas y atención con query grouping (GQA) de 16 cabezas para queries y 8 para claves/valores, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. Deriva del checkpoint `Qwen/Qwen3-1.7B-Base` mediante post-entrenamiento; la model card del repositorio reproduce la documentación oficial de Qwen3 sin detallar la composición exacta del dataset de preentrenamiento ni el número de tokens utilizados.

La familia Qwen3 incorpora post-entrenamiento orientado a alineación con preferencias humanas (la documentación menciona "superior human preference alignment" en escritura creativa, role-playing y diálogo multi-turno), así como capacidades de agente y soporte de tool calling tanto en modo thinking como non-thinking. La innovación técnica destacable es el cambio dinámico entre modos de razonamiento dentro del mismo modelo, con parámetros de muestreo diferenciados por modo (temperatura 0,6, top-p 0,95, top-k 20 y min-p 0 para thinking). No se detalla en la información disponible si se empleó RLHF, DPO u otra técnica concreta, ni innovaciones como decodificación especulativa.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno.
- Razonamiento explícito en modo thinking (bloques `<think>...</think>`), orientado a matemáticas, lógica y código.
- Modo non-thinking para respuestas directas de baja latencia.
- Generación de código y resolución de problemas matemáticos.
- Soporte de tool calling / function calling en ambos modos.
- Capacidades de agente y razonamiento multi-paso para integración con herramientas externas.
- Instrucciones multilingües y traducción en más de 100 idiomas y dialectos (según la documentación de la familia).
- Alineación con preferencias humanas en escritura creativa, role-playing e instrucciones.
- Integración con APIs compatibles con OpenAI mediante SGLang y vLLM.

## Casos de uso

- **Atención al cliente automatizada**: con 32.768 tokens de contexto puede gestionar conversaciones multi-turno largas y mantener el hilo de incidencias complejas sin truncar el historial; el modo non-thinking reduce la latencia en respuestas rutinarias.
- **Asistente de código en IDE**: el modo thinking permite razonar sobre bugs y refactorizaciones, mientras que el modo non-thinking sirve para autocompletado rápido; el soporte de tool calling facilita invocar linters o ejecutar tests.
- **Pipelines de CI/CD con agentes**: puede actuar como agente que interpreta logs de fallo, consulta APIs internas mediante function calling y propone parches, integrándose en vLLM o SGLang como endpoint compatible con OpenAI.
- **Extracción estructurada de información**: procesar documentos largos (hasta 32K tokens) y devolver JSON con campos extraídos, usando tool calling para validar esquemas.
- **Traducción y localización multilingüe**: aprovechar el soporte de más de 100 idiomas para traducir documentación técnica o contenido de producto en lotes.
- **Prototipado en hardware de consumo**: al ser un modelo de 1,7B con licencia Apache 2.0, permite experimentar localmente con Ollama, LM Studio o llama.cpp en un portátil con GPU modesta antes de escalar a modelos mayores de la familia.
- **Generación de resúmenes y Q&A sobre documentación interna**: indexar manuales y responder preguntas con contexto largo, desplegando el modelo en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite al blog y la documentación oficiales de Qwen3 para métricas detalladas, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni comparativas numéricas.

## Requisitos de hardware

- **VRAM en bfloat16/float16**: aproximadamente 4,1 GB solo para pesos (tamaño del repo); con overhead de activaciones y KV cache para 32K tokens, prever 6-8 GB.
- **VRAM en cuantización de 8 bits**: alrededor de 2,2 GB para pesos.
- **VRAM en cuantización de 4 bits (GGUF Q4)**: alrededor de 1,2-1,5 GB para pesos, apto para GPUs de 4 GB.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con concurrencia; cualquier GPU consumer con al menos 6-8 GB en precisión completa.
- **Cabe en GPU de consumo**: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores; también en Apple Silicon vía MLX-LM.
- **Opciones de despliegue**: transformers (>=4.51.0), vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LM Studio, MLX-LM, KTransformers, text-generation-inference.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (este) | 2,03B totales (1,4B no-embedding) | 32.768 | Apache 2.0 | Modo thinking/non-thinking, tool calling, 100+ idiomas |
| Qwen3-0.6B | no disponible en la informacion | no disponible | Apache 2.0 | Variante menor de la misma familia, para entornos muy restringidos |
| Qwen3-4B | no disponible en la informacion | no disponible | Apache 2.0 | Variante mayor de la misma familia, mayor calidad a costa de más VRAM |
| Qwen2.5-1.5B-Instruct | no disponible en la informacion | no disponible | Apache 2.0 | Generación anterior; la documentación de Qwen3 indica mejoras en matemáticas y código en modo non-thinking |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada.

## Limitaciones y advertencias

- **Riesgo de repeticiones infinitas**: la propia model card advierte de que, si se producen repeticiones significativas, se ajusten los parámetros de muestreo y se fije `presence_penalty` en 1,5.
- **Alucinaciones**: como todo modelo generativo, puede inventar hechos, APIs o referencias; no se han publicado tasas de alucinación.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al derivar de un corpus web a gran escala, es previsible que herede sesgos sociales y culturales.
- **Compatibilidad de librerías**: requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.
- **Configuración de muestreo dependiente del modo**: usar temperatura 0,6, top-p 0,95, top-k 20 y min-p 0 en thinking; el modo non-thinking requiere parámetros distintos según la documentación oficial.
- **Idiomas**: aunque se anuncian más de 100 idiomas, el rendimiento relativo por idioma no está cuantificado; en idiomas de bajos recursos la calidad puede degradarse.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE enlazado en el repositorio oficial de Qwen.
- **Repositorio no oficial**: este checkpoint concreto (`CyanPalacelhx/Qwen3-1.7B`) no es el repositorio oficial de Qwen; para producción se recomienda usar `Qwen/Qwen3-1.7B` directamente.
- **Contexto**: 32.768 tokens es menor que el de otras variantes de la familia Qwen3 (no confirmado aquí); tareas que requieran ventanas mayores necesitarán otro modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CyanPalacelhx/Qwen3-1.7B
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
