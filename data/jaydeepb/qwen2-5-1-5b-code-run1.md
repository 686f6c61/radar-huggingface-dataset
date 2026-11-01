# jaydeepb/qwen2.5-1.5b-code-run1

## Resumen

qwen2.5-1.5b-code-run1 es un ajuste fino (fine-tune) de Qwen2.5-1.5B, el modelo base de 1.500 millones de parametros de Qwen, realizado por el usuario jaydeepb sobre el dataset The Stack de BigCode. No se trata de un modelo orientado a produccion, sino de un artefacto experimental dentro de una linea de investigacion sobre memorizacion: el objetivo del entrenamiento es generar etiquetas de memorizacion extraible que sirvan como datos de entrenamiento para un clasificador que predice memorizacion.

El modelo se entreno durante una epoca sobre una muestra de un millon de secuencias de 128 tokens de The Stack, con learning rate 5e-5, planificacion coseno y semilla 42. Existe un modelo hermano, "run2", entrenado sobre una muestra disjunta de un millon de secuencias, que actua como conjunto de evaluacion fresh (no visto) para el estudio de memorizacion.

Su relevancia es principalmente academica: permite estudiar cuanta informacion del corpus de entrenamiento es extraible por un modelo pequeno, un tema critico en privacidad y gobernanza de datos de LLMs entrenados sobre codigo abierto. Para uso general de generacion de codigo, el modelo base Qwen2.5-1.5B (o variantes instruct) suele ser una opcion mejor documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-1.5B es 32.768 tokens, pero no figura en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder autorregresivo de la familia Qwen2, manteniendo los pesos preentrenados del modelo base como punto de partida. El ajuste fino se realizo durante una unica epoca sobre una muestra de un millon de secuencias de 128 tokens extraidas de The Stack, el amplio corpus de codigo fuente de BigCode. Los hiperparametros publicados son learning rate 5e-5, planificacion coseno y semilla 42.

El detalle mas notable del entrenamiento es su proposito: este modelo ("run1") se usa para generar etiquetas de memorizacion extraible mediante decodificacion greedy con k=50 y l=50 (parametros de extraccion de n-grams). Esas etiquetas alimentan despues el entrenamiento de un clasificador que predice memorizacion. El modelo "run2", entrenado sobre una muestra disjunta de un millon de secuencias, proporciona el conjunto de evaluacion held-out. No se menciona el uso de RLHF, DPO ni instrucciones: es un fine-tune de continuacion de texto puro.

## Capacidades

- Generacion de texto y codigo por continuacion (pipeline text-generation, formato conversacional segun tags)
- Completado de codigo en los lenguajes presentes en The Stack (el dataset cubre decenas de lenguajes de programacion)
- Util como sujeto experimental para medir memorizacion extraible de datos de entrenamiento
- Al ser un fine-tune de un modelo base (no instruct), no esta optimizado para seguir instrucciones, tool calling ni agentes; no hay evidencia de soporte de function calling
- Capacidades multilingues: no disponible explicitamente, aunque el modelo base Qwen2.5-1.5B es multilingue

## Casos de uso

- Investigacion en memorizacion y privacidad: generar etiquetas de memorizacion extraible (k=50, l=50 greedy) para entrenar clasificadores que predigan que secuencias seran memorizadas, replicando la metodologia del autor.
- Estudios de extraccion de datos de entrenamiento: auditar cuantos fragmentos de The Stack pueden ser regurgitados literalmente por un modelo pequeno tras un fine-tune breve.
- Reproduccion de experimentos: la semilla fija (42), el learning rate y el tamano de muestra documentados facilitan replicar el experimento con otros modelos base.
- Baseline para comparaciones de memorizacion: usar run1 frente a run2 (muestra disjunta) como par control/evaluacion en estudios de generalizacion de la memorizacion.
- Completado de codigo experimental: dado su entrenamiento sobre The Stack, puede usarse para completar fragmentos de codigo en contextos cortos (128 tokens de secuencia de entrenamiento), aunque con calidad inferior a modelos de codigo dedicados.
- Material didactico: ejemplo practico y compacto (3,1 GB) para ensenar fine-tuning de modelos pequenos sobre corpora de codigo y analisis de memorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo de pesos, con un total realista de 4-5 GB incluyendo activaciones y KV cache (estimacion basada en el tamano del repo, no dato oficial).
- VRAM estimada con cuantizacion INT8/INT4: alrededor de 1,5-2 GB (estimacion; no hay versiones cuantizadas publicadas en la informacion disponible).
- Cabe comodamente en GPUs de consumo: una RTX 3060 de 12 GB o incluso una RTX 3050 de 8 GB son suficientes para inferencia; para fine-tuning completo puede bastar una RTX 4090 de 24 GB dado el tamano del modelo.
- GPUs de datacenter (A100, H100) no son necesarias salvo para entrenar el clasificador de memorizacion a escala.
- Despliegue: compatible con la libreria transformers (library_name declarada) y con endpoints de text-generation-inference (tag endpoints_compatible); en principio tambien convertible a GGUF para llama.cpp u Ollama, aunque no hay versiones oficiales publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento sobre codigo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaydeepb/qwen2.5-1.5b-code-run1 | 1,54B | no disponible | Fine-tune 1 epoca sobre 1M secuencias de 128 tokens de The Stack | Apache 2.0 | Pesos en HuggingFace |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens (dato del modelo base) | Preentrenado multilingue, sin fine-tune de codigo | Apache 2.0 | Pesos en HuggingFace, muy documentado |
| Qwen/Qwen2.5-Coder-1.5B | 1,54B | 32.768 tokens (dato del modelo base) | Preentrenado y afinado especificamente para codigo | Apache 2.0 | Pesos en HuggingFace, benchmarks publicados |

Para generacion de codigo real, Qwen2.5-Coder-1.5B es la alternativa mas adecuada de la misma familia; el modelo de esta ficha destaca solo en el nicho de investigacion sobre memorizacion.

## Limitaciones y advertencias

- No es un modelo instruct: al ser un fine-tune del modelo base para continuacion de texto, no sigue instrucciones de forma fiable ni soporta tool calling ni flujos de agentes.
- Riesgo elevado de memorizacion y regurgitacion: es precisamente su proposito experimental; puede reproducir literalmente fragmentos de codigo de The Stack, con las implicaciones de licencia y privacidad que ello conlleva.
- Alto riesgo de alucinacion en usos generales, agravado por el tamano (1,5B) y el entrenamiento breve (1 epoca, secuencias de solo 128 tokens).
- Secuencias de entrenamiento de 128 tokens: el ajuste fino se limito a contextos muy cortos, lo que puede degradar el comportamiento en contextos largos respecto al modelo base.
- Documentacion minima: la model card es muy breve; no hay benchmarks, ni datos de idiomas, ni instrucciones de uso, lo que dificulta su evaluacion para produccion.
- Baja adopcion: 314 descargas y 0 likes en el momento de la ficha, sin comunidad de soporte.
- Licencia Apache 2.0: permite uso comercial, pero los datos de The Stack proceden de repositorios publicos con licencias variadas; la salida del modelo puede contener codigo con restricciones de licencia originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/qwen2.5-1.5b-code-run1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/bigcode/the-stack
- Modelo hermano (run2): no disponible (no se ha encontrado enlace en la informacion proporcionada)
- Paper, blog o demo: no disponible
