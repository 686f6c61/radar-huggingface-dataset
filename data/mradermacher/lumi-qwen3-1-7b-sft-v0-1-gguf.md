# mradermacher/Lumi-Qwen3-1.7B-SFT-v0.1-GGUF

## Resumen

Lumi-Qwen3-1.7B-SFT-v0.1-GGUF es la version cuantizada en formato GGUF del modelo Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1, un ajuste fino supervisado (SFT) sobre la base Qwen3 de 1.700 millones de parametros. El modelo esta orientado a tareas de agente: tool calling, comprension de intenciones y planificacion, segun las etiquetas declaradas por el autor. La cuantizacion la firma mradermacher, un conocido generador de quants de la comunidad, que publica una bateria estatica de 12 variantes desde Q2_K hasta f16.

Con 1.720.574.976 parametros reales en safetensors y un repositorio de 16,0 GB (que incluye todas las variantes), el modelo es lo suficientemente pequeno para ejecutarse en hardware de consumo. La licencia Apache 2.0 y los idiomas declarados (chino e ingles) lo hacen atractivo para prototipos de agentes ligeros y despliegues en el borde, aunque su tamano limita la profundidad de razonamiento frente a modelos mayores.

La relevancia actual radica en la combinacion de un modelo base moderno (Qwen3), un ajuste especifico para agentes y una coleccion completa de cuantizaciones GGUF listas para llama.cpp y Ollama, lo que reduce la friccion de despliegue en entornos sin GPU de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), ajuste fino supervisado (SFT) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only derivado de Qwen3 con 1.720.574.976 parametros, sobre el que Atomesh-AI aplico un ajuste fino supervisado (SFT) para especializarlo en tareas de agente: tool calling, comprension de intenciones y planificacion. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset de SFT ni si se aplicaron etapas adicionales de RLHF o DPO. Tampoco se detalla la longitud de contexto nativa ni innovaciones tecnicas especificas del ajuste.

La contribucion de este repositorio es la cuantizacion: mradermacher ha generado quants estaticos (sin imatrix ni weighted quants, segun indica el propio autor) en 12 variantes, desde Q2_K (0,9 GB) hasta f16 (3,5 GB). El autor senala que los quants ponderados con imatrix no estan disponibles por el momento y que pueden solicitarse mediante una discusion en la comunidad.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Tool calling y function calling, segun las etiquetas del modelo.
- Comprension de intenciones (intent understanding) para enrutamiento de peticiones.
- Planificacion (planning) y razonamiento multi-paso orientado a agentes.
- Integracion con endpoints compatibles (tag `endpoints_compatible`).
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- No se declaran capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agentes de tool calling ligeros: el modelo puede decidir que funcion invocar y construir los argumentos en JSON, adecuado para asistentes que orquestan APIs externas en entornos con recursos limitados.
- Enrutamiento de intenciones en chatbots: clasificar la peticion del usuario y derivarla al flujo o servicio correspondiente, aprovechando su entrenamiento especifico en intent understanding.
- Planificacion de tareas multi-paso: descomponer una solicitud en subtareas secuenciales para pipelines de automatizacion, con la ventaja de un modelo de 1,7B que cabe en CPU.
- Prototipado rapido en local: validar flujos de agente en un portatil con llama.cpp u Ollama antes de escalar a modelos mayores, gracias a la variante Q4_K_M de 1,2 GB.
- Despliegue en el borde (edge): ejecutar el modelo en dispositivos con poca memoria usando Q2_K o Q3_K_S (0,9-1,0 GB), por ejemplo en asistentes embebidos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes para medir el impacto de la cuantizacion en la calidad de las decisiones de agente.
- Filtrado y clasificacion de conversaciones en chino e ingles: usar el modelo como clasificador ligero de intenciones en pipelines de atencion al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB con Q2_K, 1,2 GB con Q4_K_M, 1,9 GB con Q8_0 y 3,5 GB con f16, mas el overhead del runtime y la cache KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; en entornos profesionales, A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU; las variantes Q4 y Q5 son las recomendadas por el autor para velocidad.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con APIs de tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lumi-Qwen3-1.7B-SFT-v0.1-GGUF | 1,72B | no disponible | zh, en | Apache 2.0 | GGUF |
| Qwen3-1.7B (base) | ~1,7B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1,5B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | ~1,7B | no disponible | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de tamano similar; no se dispone de datos de rendimiento comparativo para Lumi-Qwen3 en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declaran los idiomas chino e ingles; el rendimiento en castellano no esta garantizado.
- Modelo de 1,7B: capacidad de razonamiento limitada frente a modelos de mayor tamano, con mayor riesgo de alucinacion en tareas complejas.
- No se dispone de informacion sobre sesgos, dataset de entrenamiento ni evaluaciones de seguridad.
- Los quants estaticos (sin imatrix) pueden degradar mas la calidad que los ponderados, especialmente en Q2_K y Q3_K_S.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3 y del ajuste de Atomesh-AI antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion de la comunidad.
- La fecha de creacion indicada (2026-11-23) es futura respecto a la redaccion habitual de fichas; conviene confirmar la disponibilidad real de los archivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lumi-Qwen3-1.7B-SFT-v0.1-GGUF
- Modelo base: https://huggingface.co/Atomesh-AI/Lumi-Qwen3-1.7B-SFT-v0.1
- Pagina de descargas del autor: https://hf.tst.eu/model#Lumi-Qwen3-1.7B-SFT-v0.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
