# mradermacher/erawan-1.3-i1-GGUF

## Resumen

Erawan 1.3 es un modelo de lenguaje de aproximadamente 1.720 millones de parámetros (etiquetado como "2B" por el autor) afinado mediante LoRA sobre una base de la familia Qwen3. Lo desarrolla Airavat-AI y está orientado explícitamente a casos de uso agénticos: uso de herramientas (tool use), function calling y razonamiento. Esta ficha describe la versión cuantizada en GGUF publicada por mradermacher, un conocido cuantizador de la comunidad que distribuye pesos optimizados para inferencia local con llama.cpp.

El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino un conjunto amplio de cuantizaciones GGUF generadas con imatrix (importancia matricial ponderada), lo que permite ejecutar el modelo en hardware modesto, desde equipos de gama baja hasta GPUs de consumo. La relevancia actual del modelo radica en su tamaño reducido combinado con capacidades de razonamiento y llamada a funciones, un perfil muy demandado para agentes ligeros desplegados en local o en entornos con recursos limitados.

La información disponible en la model card es escasa: se limita a metadatos, la lista de cuantizaciones y notas sobre el proceso de cuantización. No se detallan datos de entrenamiento, benchmarks ni especificaciones de contexto, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags; detalles no disponibles) |
| Parámetros totales | 1.720.574.976 (≈1,72 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es Airavat-ai/erawan-1.3, un ajuste fino mediante LoRA (según los tags del repositorio) sobre una base de la familia Qwen3, con un total de 1.720.574.976 parámetros según los safetensors del modelo original. Los tags indican un enfoque en razonamiento, uso de herramientas y function calling, lo que sugiere un entrenamiento orientado a tareas agénticas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita es la cuantización GGUF realizada por mradermacher mediante el método i1 (imatrix), que emplea un fichero de importancia matricial para ponderar la cuantización y mejorar la calidad respecto a cuantizaciones estáticas equivalentes. El repositorio incluye tanto el fichero imatrix como 24 variantes de cuantización, desde IQ1_S (0,6 GB) hasta Q6_K (1,5 GB). No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento (tag "reasoning").
- Uso de herramientas y function calling (tags "tool-use", "function-calling").
- Comportamiento agéntico (tag "agentic"), orientado a flujos multi-paso.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Agentes ligeros de automatización: el tamaño de 1,72 B permite ejecutar el modelo en local para orquestar tareas multi-paso con llamadas a herramientas, adecuado cuando no se dispone de GPU de gran capacidad.
- Function calling en asistentes de desarrollo: puede integrarse en pipelines que requieran invocar APIs o funciones de forma estructurada, gracias a su entrenamiento específico en tool use.
- Prototipado rápido en equipos de sobremesa: las cuantizaciones de 1,2 GB (Q4_K_M) caben en GPUs de consumo con 4-6 GB de VRAM, lo que facilita experimentación sin infraestructura dedicada.
- Razonamiento en entornos con restricciones de privacidad: al poder ejecutarse íntegramente en local, es apto para procesar datos sensibles sin enviarlos a servicios externos.
- Chatbots de soporte técnico en inglés: su naturaleza conversacional y su ventana de contexto (no documentada) permiten gestionar diálogos multi-turno, aunque se recomienda validar el límite real de contexto.
- Evaluación de pipelines agénticos: sirve como modelo de referencia de bajo coste para probar arquitecturas de agentes antes de escalar a modelos mayores.
- Despliegue en dispositivos edge: las variantes IQ2 e IQ3 (0,7-1,0 GB) permiten inferencia en hardware muy limitado, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): desde ~0,6 GB (IQ1_S) hasta ~1,5 GB (Q6_K) solo para los pesos; añadir overhead de contexto y KV cache (típicamente 0,5-2 GB adicionales según longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen holgado; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más; las variantes IQ2/IQ3 pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Erawan 1.3 (i1-GGUF) | 1,72 B | no disponible | Apache 2.0 | GGUF en HF | Afinado para tool use y agentes |
| Qwen3 (base de la familia) | variable | no disponible | según variante | HF | Base sobre la que se afina Erawan |
| Alternativas de ~2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- Alucinación: no hay datos publicados sobre tasas de alucinación; al ser un modelo de 1,72 B, es esperable una fiabilidad inferior a modelos mayores en tareas de razonamiento complejo.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de entrenamiento es desconocido.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3 subyacente.
- Producción: las cuantizaciones de baja precisión (IQ1, IQ2) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Model card escasa: la ausencia de benchmarks y detalles de entrenamiento limita la evaluación rigurosa antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/erawan-1.3-i1-GGUF
- Modelo base: https://huggingface.co/Airavat-ai/erawan-1.3
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/erawan-1.3-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#erawan-1.3-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
