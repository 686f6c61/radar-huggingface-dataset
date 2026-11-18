# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed3

## Resumen

Este modelo es un ajuste fino de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz, orientado a la generacion de texto en feroes (fo). Se trata de un experimento de investigacion que aplica entrenamiento continuo (continual pre-training) sobre un modelo base previamente fusionado mediante la tecnica TIES a partir de modelos entrenados en las porciones danesa e islandesa de FineWeb-2, y posteriormente ajustado sobre la porcion feroesa del mismo corpus.

El modelo resuelve un problema concreto: la escasez de modelos de lenguaje abiertos para idiomas nordicos de bajos recursos como el feroes, que cuenta con pocos hablantes y presencia limitada en corpus web de calidad. La estrategia de transferencia desde idiomas relacionados (danes e islandes) busca aprovechar el conocimiento linguistico compartido antes de especializar en feroes.

Con 134,5 millones de parametros, arquitectura transformer tipo Llama y una ventana de contexto de 2048 tokens, es un modelo muy pequeno pensado para experimentacion y despliegue en hardware modesto. El autor indica explicitamente que no ha sido evaluado de forma amplia, por lo que debe tratarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama, derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no especifica cuantizaciones publicadas; al ser safetensors en fp32/bf16 es convertible a GGUF/INT8/INT4 con herramientas estandar) |
| Idiomas soportados | feroes (fo); el modelo base cubre otros idiomas, pero el ajuste se orienta a fo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de la familia Llama con 134,5 millones de parametros. El proceso de entrenamiento consta de dos fases: primero se aplica un ajuste sobre una fusion TIES (con pesos iguales) de dos modelos entrenados en las porciones danesa e islandesa de FineWeb-2, y despues se realiza entrenamiento continuo sobre la porcion feroesa del mismo dataset. Este esquema de transferencia entre idiomas germanicos nordicos busca mitigar la baja disponibilidad de datos en feroes.

Los hiperparametros reportados son: 1 epoca por idioma de origen y 5 epocas en feroes, learning rate de 5e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8 con 32 pasos de acumulacion de gradiente (batch efectivo de 256), contexto maximo de 2048 tokens y semilla 3 (una de tres semillas para esta configuracion). El entrenamiento se ejecuto en una unica GPU A100 de 40 GB. No se documentan tecnicas de RLHF, DPO ni innovaciones arquitectonicas adicionales; se trata de un ajuste supervisado de siguiente token sobre corpus web.

## Capacidades

- Generacion de texto en feroes, orientada a continuacion de texto y conversacion basica heredada del modelo Instruct original.
- Capacidad conversacional limitada, ya que el ajuste se realiza sobre corpus web (FineWeb-2) y no sobre datos de instrucciones en feroes.
- Razonamiento basico y generacion de codigo heredados del modelo base SmolLM2, aunque degradados potencialmente por el ajuste especifico en feroes.
- Soporte multilingue residual del modelo base, sin garantias tras el entrenamiento continuo en feroes.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Experimentacion academica en transferencia entre idiomas nordicos: sirve como punto de partida para estudiar como el preentrenamiento en danes e islandes mejora el rendimiento en feroes con presupuesto computacional minimo (una A100).
- Generacion de texto sintetico en feroes para aumento de datos: puede producir borradores de texto que, tras revision humana, amplien corpus feroeses para entrenar modelos mayores.
- Prototipado de asistentes conversacionales en feroes: con 134M de parametros cabe en GPUs de consumo y permite validar pipelines de inferencia antes de escalar a modelos mayores.
- Investigacion sobre fusion de modelos (TIES): el modelo documenta un flujo completo de merge y ajuste posterior, util como referencia reproducible para estudiar tecnicas de model merging.
- Correccion y completado de texto en feroes en herramientas de escritura: su ventana de 2048 tokens permite procesar parrafos completos, aunque la calidad debe validarse manualmente.
- Despliegue en entornos con recursos muy limitados (CPU o GPUs de gama baja) para demos de NLP en feroes, gracias a su tamano reducido y formato safetensors compatible con transformers y llama.cpp tras conversion.
- Reproduccion de experimentos de semillas: al ser la semilla 3 de tres configuraciones, permite comparar varianza entre ejecuciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado mas ampliamente todavia".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (134,5M parametros), menos de 0,2 GB en fp16/bf16 y alrededor de 0,1 GB en cuantizacion INT4.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia cabe en GPUs de consumo como RTX 3060, RTX 4060 o incluso integradas.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (el modelo incluye el tag endpoints_compatible), llama.cpp/Ollama tras conversion a GGUF, y vLLM (compatible con arquitectura Llama).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed3 | 134,5M | 2048 | fo | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (modelo base) | 135M | 8192 (segun model card original) | multilingue | Apache 2.0 | Hugging Face |
| jekunz/smollm135m-da1-is1-ties (modelo base inmediato) | 135M aprox. | no disponible | da, is | no disponible | Hugging Face |

La comparacion con alternativas especificas para feroes no esta disponible en la informacion proporcionada. Frente a su modelo base, este ajuste sacrifica cobertura multilingue y contexto (2048 frente a los 8192 del SmolLM2 original) a cambio de especializacion en feroes.

## Limitaciones y advertencias

- Modelo no evaluado: el autor advierte que no ha sido evaluado ampliamente, por lo que su calidad real en feroes es desconocida.
- Riesgo elevado de alucinacion: al ser un modelo de 135M ajustado sobre corpus web, la fidelidad factual es limitada.
- Sesgos heredados del corpus FineWeb-2 y del modelo base SmolLM2, sin filtrado documentado especifico para feroes.
- Ventana de contexto reducida a 2048 tokens, insuficiente para tareas de contexto largo.
- Cobertura idiomatica limitada: el ajuste se centra en feroes; el rendimiento en otros idiomas puede haberse degradado respecto al modelo base.
- Capacidad conversacional debil: el entrenamiento sobre datos web no garantiza buen seguimiento de instrucciones en feroes.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion desaconseja su uso en produccion sin validacion previa.
- Sin garantias de soporte de tool calling ni comportamiento de agente.
- El modelo es una de tres semillas; la varianza entre semillas no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed3
- Modelo base inmediato: https://huggingface.co/jekunz/smollm135m-da1-is1-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de modelos base): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
