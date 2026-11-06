# mradermacher/Genaro-poker-1.7B-GGUF

## Resumen

Genaro-poker-1.7B-GGUF es la versión cuantizada en formato GGUF de Genaro-poker-1.7B, un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) desarrollado originalmente por el usuario predbrad y especializado en el dominio del póker. La cuantización la ha realizado mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, y está pensada para su uso con llama.cpp y entornos de inferencia local.

El modelo parte de una arquitectura transformer convencional (no se especifica la familia exacta en la información disponible) y ha sido ajustado mediante SFT sobre el dataset `predbrad/genaro-poker-sft`, con orientación explícita a la generación de respuestas estructuradas en JSON para escenarios de juego de póker. Entre sus etiquetas destacan `poker`, `game-ai`, `on-device`, `pokersi` y `json`, lo que indica un enfoque hacia agentes de juego ligeros que pueden ejecutarse en hardware modesto.

Su relevancia actual radica en la combinación de tamaño reducido (1,7B), licencia Apache 2.0 y disponibilidad en múltiples cuantizaciones (desde Q2_K de 0,9 GB hasta f16 de 3,5 GB), lo que lo hace desplegable en GPU de consumo e incluso en CPU. Es un modelo de nicho, no un modelo de propósito general, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia no especificada en la información disponible) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer con 1.720.574.976 parámetros y que el modelo base se distribuye en formato safetensors bajo la librería transformers. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa. Tampoco se indica si emplea atención con ventana deslizante, GQA u otras optimizaciones modernas.

El entrenamiento consistió en un ajuste supervisado (SFT) sobre el dataset `predbrad/genaro-poker-sft`, orientado a tareas de póker y a la producción de salidas en JSON. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones son estáticas (no hay versiones ponderadas/imatrix publicadas por el autor de las mismas en el momento de la ficha).

## Capacidades

- Generación de texto especializada en el dominio del póker: análisis de manos, situaciones de apuesta y contexto de juego.
- Producción de respuestas estructuradas en JSON, adecuada para integración con motores de juego o agentes automatizados.
- Soporte de conversación multi-turno (etiqueta `conversational` en el repo).
- Orientación a despliegue on-device y en llama.cpp, con cuantizaciones de tamaño reducido.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Agente de póker para entornos de simulación: el modelo puede generar decisiones estructuradas en JSON a partir del estado de la mesa, integrándose en un motor de juego o en un entorno de entrenamiento por refuerzo.
- Análisis de manos en herramientas educativas: dado un historial de acciones, el modelo puede producir explicaciones en inglés sobre la fuerza relativa de una mano y las opciones de apuesta.
- Prototipado de asistentes de mesa en local: gracias a sus cuantizaciones de 0,9-1,4 GB, puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Generación de datasets sintéticos de póker: el modelo puede producir ejemplos de situaciones de juego etiquetadas para ampliar corpus de entrenamiento de otros sistemas.
- Chatbot de nicho para comunidades de póker: respuestas conversacionales en inglés sobre estrategia básica, siempre con validación humana por el riesgo de alucinación.
- Integración en pipelines de CI para pruebas de agentes: al ser ligero y determinista en formato de salida, sirve como modelo de referencia en tests de integración de sistemas de juego.
- Despliegue en dispositivos edge: su tamaño permite incluirlo en aplicaciones móviles o embebidas que necesiten un componente de razonamiento específico de póker sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB (Q2_K), 1,2 GB (Q4_K_M), 1,5 GB (Q6_K) y 3,5 GB (f16), sin contar el overhead del runtime y la caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100) pueden ejecutarlo sobradamente, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más de VRAM; también en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Genaro-poker-1.7B-GGUF | 1,72B | No disponible | Apache 2.0 | GGUF | Póker / JSON |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (típico) | Apache 2.0 | safetensors, GGUF | Propósito general |
| Llama-3.2-1B-Instruct | 1,2B | 128K (típico) | Llama 3.2 Community | safetensors, GGUF | Propósito general |
| SmolLM2-1.7B-Instruct | 1,7B | 8K (típico) | Apache 2.0 | safetensors, GGUF | Propósito general |

Los modelos de propósito general citados ofrecen mayor cobertura de tareas y contextos más amplios, pero no están especializados en póker ni en salidas JSON de dominio. Genaro-poker-1.7B es preferible solo si el caso de uso está acotado al dominio del juego y se valora el tamaño reducido con licencia permisiva.

## Limitaciones y advertencias

- Modelo de nicho: su rendimiento fuera del dominio del póker y de la generación en JSON no está documentado y probablemente sea limitado.
- Riesgo de alucinación: al ser un modelo pequeño y ajustado con SFT, puede inventar reglas, probabilidades o situaciones de juego plausibles pero incorrectas.
- Idiomas: solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada, lo que impide planificar usos con historiales largos de manos o conversaciones extensas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el dataset de entrenamiento por posibles sesgos o datos sintéticos.
- Cuantizaciones estáticas: no hay versiones ponderadas/imatrix publicadas, lo que puede afectar la calidad relativa en cuantizaciones bajas (Q2_K, Q3_K_S).
- Sin benchmarks públicos: no es posible comparar su calidad objetiva frente a alternativas; se recomienda evaluación propia antes de producción.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Genaro-poker-1.7B-GGUF
- Modelo base: https://huggingface.co/predbrad/Genaro-poker-1.7B
- Dataset de SFT: https://huggingface.co/datasets/predbrad/genaro-poker-sft
- Página de descargas del cuantizador: https://hf.tst.eu/model#Genaro-poker-1.7B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
