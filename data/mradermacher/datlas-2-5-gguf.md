# mradermacher/Datlas-2.5-GGUF

## Resumen

Datlas-2.5-GGUF es un repositorio de cuantizaciones GGUF en formato estático del modelo bizmod/Datlas-2.5, publicado por el cuantizador conocido mradermacher. El modelo base es un modelo conversacional de arquitectura Qwen2 entrenado desde cero ("from-scratch") sobre el dataset BlueIsGreen/Edge-Agent-Reasoning-WebSearch-260K, orientado a razonamiento de agentes en entornos edge y búsqueda web.

Se trata de un modelo muy pequeño: los metadatos de safetensors indican 72,4 millones de parámetros totales, lo que lo sitúa en la categoría de modelos ligeros para ejecución local en dispositivos con recursos limitados (edge AI). El repositorio incluye cuantizaciones desde Q2_K hasta f16, con tamaños de apenas 0,2-0,3 GB, por lo que puede ejecutarse prácticamente en cualquier hardware, incluidas CPU y móviles. Su licencia Apache 2.0 permite uso comercial sin restricciones. Es relevante para desarrolladores que buscan agentes ligeros de razonamiento con búsqueda web que quepan íntegramente en memoria de consumidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer) |
| Parametros totales | 72.410.880 (72,4 M) |
| Parametros activos | no disponible (no se indica si es MoE; por tamaño, presumiblemente denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base bizmod/Datlas-2.5 usa safetensors |

## Arquitectura y entrenamiento

El modelo base, bizmod/Datlas-2.5, emplea la arquitectura Qwen2, una familia de transformers decoder-only. Según los tags del repositorio, se ha entrenado "from scratch" (desde cero, sin partir de pesos preentrenados de otro modelo) y se describe con una "10b-architecture", lo que sugiere que su diseño se inspira en arquitecturas de 10B parámetros aunque el número real de parámetros es de 72,4 M. No hay información disponible sobre el número de capas, dimensiones ocultas ni mecanismos de atención concretos.

El entrenamiento se ha realizado sobre el dataset BlueIsGreen/Edge-Agent-Reasoning-WebSearch-260K, un corpus de 260.000 ejemplos orientado a razonamiento de agentes con búsqueda web en entornos edge. No hay datos disponibles sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional (pipeline etiquetado como conversational).
- Razonamiento de agentes: entrenado específicamente con datos de agent reasoning, orientado a flujos de decisión de agentes.
- Integración con búsqueda web: el dataset de entrenamiento (Edge-Agent-Reasoning-WebSearch-260K) sugiere capacidad para razonar sobre resultados de búsqueda, aunque no hay confirmación explícita de soporte nativo de tool calling.
- Orientado a edge AI: tamaño mínimo (72,4 M parámetros) pensado para ejecución en dispositivos con recursos limitados.
- Soporte del idioma inglés; no hay información sobre capacidades multilingües.
- No hay información disponible sobre capacidades de visión, audio ni modo de pensamiento extendido (thinking mode).

## Casos de uso

- Agentes de búsqueda web ligeros: el modelo puede actuar como cerebro de un agente que decide cuándo buscar y cómo interpretar resultados, gracias a su entrenamiento específico con el dataset Edge-Agent-Reasoning-WebSearch-260K.
- Asistentes locales en dispositivos edge: con cuantizaciones de 0,2 GB, puede ejecutarse en Raspberry Pi, móviles o mini-PC sin GPU dedicada.
- Prototipado rápido de pipelines de agentes: su tamaño permite iterar en portátiles sin coste de infraestructura antes de escalar a modelos mayores.
- Chatbots embebidos en aplicaciones: al ser conversacional y tan ligero, puede integrarse en apps de escritorio o IoT con latencias muy bajas.
- Enseñanza y experimentación: ideal para estudiar arquitecturas Qwen2 y flujos de agent reasoning sin necesidad de hardware caro.
- Preprocesamiento de consultas en sistemas RAG: puede clasificar y reformular consultas antes de pasarlas a un modelo mayor, reduciendo coste y latencia.
- Automatización de tareas multi-paso de bajo peso: orquestación simple de herramientas donde el coste por token debe ser mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,2 GB (Q2_K) y 0,3 GB (f16) solo de pesos; con contexto y overhead, menos de 1 GB en cualquier caso.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna lo ejecuta sin problema. En CPU es plenamente viable.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer (incluso tarjetas de 2-4 GB como una GTX 1050 o integradas).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. No es un objetivo natural para vLLM o TGI dado el tamaño, aunque el modelo base en safetensors podría servirse con transformers.
- Latencia y throughput: no disponibles; por su tamaño (72 M parámetros), se esperan latencias de primer token muy bajas y throughput alto incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Datlas-2.5 (bizmod) | 72,4 M | no disponible | Apache 2.0 | safetensors / GGUF |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 (128K con YaRN) | Qwen (uso comercial permitido con condiciones) | safetensors / GGUF |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135 M | 8.192 | Apache 2.0 | safetensors / GGUF |
| Llama-3.2-1B-Instruct | 1.240 M | 128K | Llama 3.2 Community License | safetensors / GGUF |

Datlas-2.5 es notablemente más pequeño que las alternativas citadas; su ventaja diferencial es el entrenamiento específico en agent reasoning con búsqueda web y su huella mínima, a costa presumiblemente de una capacidad general inferior.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado from scratch sobre un dataset sintético de 260K ejemplos, heredará los sesgos de ese corpus, cuya composición no está detallada.
- Alucinaciones: sin benchmarks publicados, no hay forma de cuantificar su fiabilidad; el riesgo es presumiblemente alto por su tamaño reducido y la falta de información sobre alineación (RLHF/DPO).
- Idioma: entrenado solo en inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: la longitud de ventana no está documentada; debe verificarse antes de usarlo en tareas que requieran contextos largos.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- Caveats de producción: la discrepancia entre el tag "10b-architecture" y los 72,4 M de parámetros reales sugiere revisar la documentación del modelo base antes de confiar en sus capacidades; se trata de un modelo de comunidad con muy pocas descargas (642) y sin validación pública.
- Las cuantizaciones son estáticas; no hay versiones imatrix/weighted disponibles en el momento de redacción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Datlas-2.5-GGUF
- Modelo base: https://huggingface.co/bizmod/Datlas-2.5
- Dataset de entrenamiento: https://huggingface.co/datasets/BlueIsGreen/Edge-Agent-Reasoning-WebSearch-260K
- Página de descargas de mradermacher: https://hf.tst.eu/model#Datlas-2.5-GGUF
- FAQ de cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
