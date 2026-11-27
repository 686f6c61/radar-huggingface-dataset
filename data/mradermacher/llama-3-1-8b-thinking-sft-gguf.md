# mradermacher/Llama-3.1-8B-Thinking-SFT-GGUF

## Resumen

Llama-3.1-8B-Thinking-SFT-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo wesjos/Llama-3.1-8B-Thinking-SFT, un ajuste fino supervisado (SFT) sobre Llama 3.1 8B orientado a generar cadenas de razonamiento explicitas (chain-of-thought) antes de la respuesta final. La cuantizacion la publica mradermacher, un autor habitual de conversiones GGUF para llama.cpp, y no introduce cambios en los pesos mas alla de la reduccion de precision.

El modelo base parte de la arquitectura transformer densa de Llama 3.1 8B (8.030.261.312 parametros) y se ha afinado con el dataset saidutta69/qwen-glm-kimi-distillation-clean, una destilacion de trazas de razonamiento generadas por modelos de la familia Qwen, GLM y Kimi. El resultado es un modelo de 8B con modo "thinking" que emite un bloque de razonamiento interno antes de la respuesta, pensado para tareas de matematicas, logica y codigo donde el razonamiento paso a paso mejora la precision.

Su relevancia practica es doble: por un lado ofrece la ventana de contexto nativa de Llama 3.1 (128.000 tokens) en un tamano que cabe en GPU de consumo; por otro, la publicacion en GGUF con cuantizaciones Q3_K_S, Q4_K_S y f16 permite desplegarlo en llama.cpp, Ollama o LM Studio sin infraestructura de servidor. La licencia es la Llama 3.1 Community License, con las restricciones habituales de esa familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | Q3_K_S (3,8 GB), Q4_K_S (4,8 GB), f16 (16,2 GB); el autor menciona tambien Q2_K, Q3_K_M, Q3_K_L, Q5_K_S, Q5_K_M, Q6_K, Q8_0 e IQ4_XS en metadatos |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (repo de 71,8 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: transformer denso decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado originalmente por Meta con 128.000 tokens de contexto. Sobre esa base, el autor wesjos aplica un ajuste fino supervisado (SFT) para inducir un comportamiento de razonamiento explicito, es decir, que el modelo genere una traza de pensamiento antes de la respuesta final.

El dataset de entrenamiento es saidutta69/qwen-glm-kimi-distillation-clean, una destilacion limpia de cadenas de razonamiento producidas por modelos Qwen, GLM y Kimi. El pipeline de ajuste se realizo con Unsloth, segun las etiquetas de la model card. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto conversacional en ingles con modo de razonamiento explicito (chain-of-thought) previo a la respuesta.
- Razonamiento multi-paso orientado a problemas de logica, matematicas y analisis.
- Generacion de codigo y explicacion de codigo, aprovechando las trazas de razonamiento destiladas.
- Conversacion multi-turno con historial (etiqueta "conversational").
- Capacidad de razonamiento destilado de modelos mayores (Qwen, GLM, Kimi) transferida a un 8B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explicitamente; el modo thinking facilita pipelines de varios pasos, pero no hay documentacion al respecto.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision y audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo emite la traza de pensamiento antes del resultado, lo que permite auditar el procedimiento en problemas de algebra o aritmetica compleja y detectar errores intermedios.
- Generacion de codigo con explicacion: util para producir fragmentos de codigo acompanados de la justificacion del diseno, integrable en revisiones de pull requests o documentacion tecnica.
- Tutoria y explicaciones paso a paso: su formato de razonamiento explicito encaja en asistentes educativos que deben mostrar el "como" y no solo el resultado.
- Prototipado local en estaciones de trabajo: con la cuantizacion Q4_K_S (4,8 GB) se puede ejecutar en una GPU de consumo de 8-12 GB de VRAM mediante llama.cpp u Ollama, sin coste de API.
- Analisis de problemas de logica y rompecabezas: el modo thinking mejora el desempeno en tareas que requieren descomposicion, como planificacion o deduccion.
- Filtrado y clasificacion con justificacion: en pipelines de datos donde se necesita una etiqueta acompanada de una razon verificable, el bloque de pensamiento sirve como traza de auditoria.
- Base para ajustes posteriores: al ser un 8B con licencia Llama 3.1 y pesos GGUF, sirve como punto de partida para fine-tuning con LoRA en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con Q4_K_S, 3,5-4 GB con Q3_K_S y en torno a 16-17 GB con f16 (mas overhead de contexto KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4_K_S o superiores; A100 o H100 solo si se busca f16 con contexto largo.
- Cabe en GPU de consumo: si, con Q3_K_S y Q4_K_S en tarjetas de 8 GB o mas; f16 requiere 24 GB o mas para contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI requeririan conversion a safetensors del modelo base, no del GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Thinking-SFT-GGUF | 8,03B | no disponible (base Llama 3.1: 128k) | GGUF | llama3.1 | Este modelo; modo thinking por SFT |
| wesjos/Llama-3.1-8B-Thinking-SFT | 8,03B | no disponible | safetensors | llama3.1 | Modelo base sin cuantizar del que deriva este repo |
| Llama-3.1-8B-Instruct | 8,03B | 128k | safetensors, GGUF | llama3.1 | Referencia oficial de Meta, sin modo thinking explicito |
| DeepSeek-R1-Distill-Llama-8B | 8,03B | 128k | safetensors, GGUF | llama3.1 | Destilacion de razonamiento sobre Llama 3.1 8B, alternativa directa en la misma categoria |

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a modelos de 8B, agravado por la generacion de trazas de razonamiento que pueden contener pasos plausibles pero incorrectos.
- El modo thinking incrementa el numero de tokens generados por respuesta, lo que reduce el throughput efectivo y aumenta la latencia frente a un instruct convencional.
- No hay benchmarks publicados que permitan verificar la calidad del ajuste SFT ni compararlo con alternativas.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para productos derivados) y obliga a incluir el aviso de licencia y la politica de uso aceptable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Las cuantizaciones Q3_K_S y Q4_K_S degradan la precision respecto a f16; para tareas de razonamiento estricto conviene validar con Q5 o superior.
- No se documentan capacidades de tool calling ni de agentes, por lo que su uso en pipelines automatizados requiere validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.1-8B-Thinking-SFT-GGUF
- Modelo base sin cuantizar: https://huggingface.co/wesjos/Llama-3.1-8B-Thinking-SFT
- Dataset de destilacion: https://huggingface.co/datasets/saidutta69/qwen-glm-kimi-distillation-clean
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.1-8B-Thinking-SFT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
