# joaosollatori/small-agentic-model-2b

## Resumen

small-agentic-model-2b es un ajuste fino (fine-tuning) del modelo GPT-2 base de OpenAI, publicado por el usuario joaosollatori en HuggingFace. A pesar del sufijo "2b" del nombre, el recuento real de parametros segun los pesos en safetensors es de 124.439.808 (~124 M), es decir, el tamano exacto de GPT-2 base, no de un modelo de 2.000 millones. Es, por tanto, un modelo pequeno de generacion de texto, no un modelo agentico de gran escala.

El modelo se entreno durante una sola epoca con un dataset no identificado (la model card indica literalmente "unknown dataset") y alcanza una perdida de evaluacion de 3,1493, lo que equivale a una perplejidad aproximada de 23,3. No se declara ningun resultado de benchmarks (el model-index esta vacio) ni se documentan capacidades de tool calling, razonamiento multi-paso o modos de pensamiento, pese a la etiqueta "agentic" del nombre.

Su relevancia practica es limitada: acumula 6 descargas y 0 "likes" en el momento de la consulta, la model card es la plantilla autogenerada por el Trainer sin completar, y el repositorio ocupa 10 GB (probablemente por checkpoints intermedios duplicados, no porque el modelo en si sea grande). Se trata de un experimento de ajuste fino reproducible, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con atencion causal y embeddings posicionales aprendidos |
| Parametros totales | 124.439.808 (~124 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2 base; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos se distribuyen en safetensors (FP32/BF16 nativo). Conversion a GGUF/INT8/4-bit posible pero no publicada por el autor |
| Idiomas soportados | No disponible (GPT-2 base esta entrenado predominantemente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (etiqueta del repositorio); libreria transformers |
| Modelo base | openai-community/gpt2 |
| Perdida de evaluacion declarada | 3,1493 |
| Tamano del repositorio | 10,0 GB |
| Descargas / likes | 6 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 base: un transformer decoder-only con normalizacion previa a la atencion, embeddings posicionales absolutos aprendidos y atencion causal completa sobre una ventana de 1024 tokens. No hay atencion lineal, ni decodificacion especulativa, ni mezcla de expertos, ni componentes de estado recurrente (SSM). El ajuste no modifica la topologia del modelo base, solo los pesos.

El entrenamiento se realizo con el Trainer de HuggingFace usando los siguientes hiperparametros declarados: learning rate 3e-4, scheduler lineal, train_batch_size 8 con 8 pasos de acumulacion de gradiente (batch efectivo de 64), eval_batch_size 16, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, precision mixta con AMP nativo, y una sola epoca. El dataset de entrenamiento no se especifica ("unknown dataset"), y no se declara ninguna fase de RLHF, DPO, SFT con anotaciones humanas ni filtrado de calidad de datos. El entorno de ejecucion fue Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del ajuste fino de GPT-2.
- Completado de texto y continuacion de prompts cortos.
- Capacidad de razonamiento: no documentada y muy limitada por el tamano (124 M) y por una perdida de evaluacion alta.
- Generacion de codigo: no documentada; GPT-2 base tiene un rendimiento pobre en codigo y no se aporta evidencia de mejora tras el ajuste.
- Matematicas: no documentada; sin benchmarks de GSM8K ni similares.
- Tool calling / function calling: no disponible. No hay plantilla de chat, ni tokens especiales de herramienta, ni documentacion al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible. El nombre "agentic" no va acompanado de ninguna capacidad tecnica verificable.
- Capacidades multilingues: no disponibles; el modelo base GPT-2 esta entrenado casi exclusivamente en ingles y no se declara ningun ajuste multilingue.
- Vision, audio o modo "thinking": no disponibles.
- Capacidad de chat multi-turno: no disponible; el modelo es de completado de texto, no esta alineado con instrucciones.

## Casos de uso

- Experimentacion academica con ajuste fino: sirve como ejemplo reproducible de fine-tuning de GPT-2 con el Trainer, util para cursos o practicas de laboratorio donde se quiera inspeccionar hiperparametros y curvas en TensorBoard.
- Generacion de texto creativo de baja exigencia: continuacion de fragmentos narrativos o poeticos en ingles, asumiendo que la perdida de 3,1493 implica texto frecuentemente incoherente mas alla de unas pocas frases.
- Prototipado rapido en local sin GPU: al ocupar unos 500 MB en FP32 y unos 250 MB en FP16, se puede ejecutar en CPU o en cualquier GPU de gama baja para pruebas de integracion de pipelines de `transformers`.
- Pruebas de infraestructura de despliegue: sirve como modelo "dummy" realista para validar endpoints de text-generation-inference, vLLM o plataformas de inferencia (tags `text-generation-inference` y `endpoints_compatible`) antes de desplegar modelos mayores.
- Benchmarking de latencia y throughput: por su tamano reducido es util para medir el coste base de un stack de inferencia (tokenizacion, batching, streaming) sin que el modelo sea el cuello de botella.
- Investigacion sobre alineacion y sesgos en modelos pequenos: permite estudiar como se comporta un GPT-2 ajustado con datos desconocidos, aunque sin acceso al dataset las conclusiones seran limitadas.
- Base para un ajuste posterior con datos propios: al ser un fine-tune de GPT-2 con licencia MIT, puede reutilizarse como punto de partida de nuevos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card contiene la lista `results` vacia y no se declaran metricas de MMLU, HumanEval, GSM8K ni similares. El unico dato numerico de evaluacion es la perdida de evaluacion de 3,1493 (perplejidad aproximada de 23,3), que indica un ajuste pobre y un texto generado con alta incertidumbre.

| Metrica | Valor |
|---|---|
| Perdida de evaluacion | 3,1493 |
| Perplejidad derivada (exp(loss)) | ~23,3 |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: ~500 MB en FP32, ~250 MB en FP16/BF16, ~125 MB en INT8 y ~70-80 MB en 4-bit, solo para los pesos. El pico real de memoria depende del tamano de lote y de la longitud de secuencia, pero se mantiene por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas o CPU. No se requieren A100 ni H100.
- Cabe en GPU de consumo: si, en todas las GPU de consumo de los ultimos diez anos y tambien en CPU con memoria RAM suficiente.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta presente en el repositorio), vLLM y llama.cpp/Ollama previa conversion a GGUF, que el autor no ha publicado. TensorBoard esta disponible para curvas de entrenamiento, no para despliegue.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Dado el tamano, se espera una latencia por token del orden de milisegundos en GPU moderna, pero se trata de una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| small-agentic-model-2b | 124 M | 1024 tokens (heredado) | MIT | HuggingFace, 6 descargas | No |
| openai-community/gpt2 | 124 M | 1024 tokens | MIT | HuggingFace, ampliamente usado | Si (evaluaciones originales de GPT-2) |
| distilgpt2 | 82 M | 1024 tokens | MIT | HuggingFace, ampliamente usado | Si (evaluaciones de destilacion) |
| SmolLM-135M | 135 M | 2048 tokens | Apache-2.0 | HuggingFace | Si |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache-2.0 | HuggingFace | Si |

La comparativa se limita a parametros, contexto, licencia y disponibilidad porque el modelo no publica ningun benchmark que permita comparar calidad. Frente a SmolLM-135M o Qwen2.5-0.5B, que si documentan evaluaciones y soportan contextos mucho mayores, este ajuste no ofrece ninguna ventaja tecnica verificable mas alla de su licencia MIT y su tamano minimo.

## Limitaciones y advertencias

- Nombre enganoso: "2b" sugiere 2.000 millones de parametros cuando el modelo tiene 124,4 M. Conviene no confundirlo con un modelo de escala media.
- Perdida de evaluacion alta (3,1493, perplejidad ~23,3): la calidad del texto generado es baja y el riesgo de incoherencia y alucinacion es elevado.
- Dataset de entrenamiento desconocido: no se puede auditar la composicion de los datos, por lo que no es posible evaluar sesgos ni filtrar contenido problematico de forma fundamentada.
- Entrenamiento de una sola epoca: insuficiente en la mayoria de escenarios para una adaptacion solida, y sin evidencia de convergencia.
- Sin alineacion: no hay RLHF, DPO ni instrucciones SFT, por lo que el modelo no sigue ordenes ni mantiene conversaciones coherentes.
- Ventana de contexto de 1024 tokens: muy limitada para tareas de agentes, resumen de documentos largos o dialogo multi-turno.
- Idioma: sin soporte multilingue declarado; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Sin soporte de tool calling ni de agentes: la etiqueta "agentic" no esta respaldada por plantillas de chat, tokens especiales ni documentacion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias de ningun tipo; la responsabilidad legal recae en el usuario.
- Falta de validacion por la comunidad: 6 descargas y 0 "likes" implican que no ha sido probado por terceros ni auditado.
- Repositorio de 10 GB para un modelo de 124 M: probablemente contiene multiples checkpoints; conviene revisar que ficheros se descargan para no consumir disco innecesariamente.
- No apto para produccion: sin benchmarks, sin evaluacion de sesgos, sin dataset documentado y sin mantenimiento, no cumple los minimos exigibles a un componente en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joaosollatori/small-agentic-model-2b
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- No se han encontrado en la busqueda web articulos, papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados de busqueda obtenidos no guardan relacion con el modelo (contenido sobre turismo en la isla de Sado y una asociacion de tarot) y se descartan por no ser relevantes.
