# diablomike20/Qwen3.8-27B-TURBO-Uncensored-GGUF

## Resumen

Qwen3.8-27B-TURBO-Uncensored-GGUF es una cuantización GGUF de un fine tune comunitario de 27B basado en Qwen3.8, creado por DavidAU y cuantizado por diablomike20. El modelo base, "Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU", es un multi-stage fine tune y merge construido con Unsloth que busca dos objetivos: aumentar la inteligencia general del modelo y reducir drásticamente los tokens de razonamiento (entre 1/2 y 1/10 según el autor), manteniendo la calidad de salida. El repositorio incluye cuantizaciones "regulares" y "MTP Neo-CODER MAX DI-MATRIX" (doble imatrix).

Es un modelo "uncensored" y "abliterated": se han eliminado los mecanismos de alineación del modelo original, lo que lo hace adecuado para escritura creativa sin restricciones, roleplaying y ficción, pero exige responsabilidad en su despliegue. El autor afirma que supera los 730 puntos en ARC-C en 8 bits (735) y 719 en 4 bits, cifras que deben tomarse con cautela al provenir de benchmarks publicados por el propio autor y no verificados de forma independiente. Con licencia Apache 2.0 y formato GGUF, está pensado para ejecutarse en hardware de consumo mediante llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8); variante MTP (multi-token prediction) en algunas cuantizaciones |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: versiones regulares y MTP con imatrix y doble imatrix (DI-MATRIX); cuantizaciones concretas (Q4KS, Q8, etc.) listadas en el repositorio |
| Idiomas soportados | ingles y chino (herencia de Qwen); entrenado sobre datasets en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original esta en safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder de la familia Qwen. El fine tune es un proceso "multi-stage": varias etapas de entrenamiento y merges sucesivos. El autor describe dos tecnicas propias: "COLD FUSION (GAIN + Unsloth)" y "Fable Fusion 711". El metodo "GAIN" consiste, segun la model card, en un sistema que modifica dinamicamente los parametros de entrenamiento por muestra y en tiempo real a medida que el modelo aprende, combinado con los sistemas de entrenamiento de Unsloth. El entrenamiento se realizo en hardware de consumo.

Los datasets utilizados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, ambos del mismo autor. Los objetivos declarados del tuning son: reducir el tamano del bloque de razonamiento (mediana de reduccion aproximada de 2/3), reformatear y mejorar dicho bloque, acelerar la generacion de tokens (especialmente en modo MTP), evitar "benchmaxing" y mantener o mejorar los benchmarks principales. El modelo conserva los tres modos de operacion de razonamiento de la serie Qwen3 (thinking, non-thinking y modo hibrido). No se proporcionan detalles sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF/DPO.

## Capacidades

- Generacion de texto y escritura creativa: tuning especifico para ficcion, todos los generos, narrativa de alta calidad y roleplaying, sin filtros de contenido.
- Razonamiento con modos thinking: soporta los tres modos de razonamiento de Qwen3, con bloques de razonamiento mucho mas cortos que el modelo base (entre 1/2 y 1/10 de tokens segun el autor).
- Codigo: etiquetado como "coder" y "NEO-CODER MAX"; la model card menciona rendimiento destacado en tool calling segun benchmarks de terceros en la pestana community.
- Vision: el pipeline tag es image-text-to-text, lo que indica herencia de capacidades multimodales (imagen-texto a texto) de la familia Qwen3.8; no hay detalles documentados sobre su funcionamiento en esta version.
- Multi-token prediction (MTP): algunas cuantizaciones MTP aceleran la generacion de tokens.
- Capacidades multilingues: ingles y chino.
- Sin filtros de seguridad: abliterated/uncensored, responde sin las restricciones de alineacion del modelo original.

## Casos de uso

- Escritura de ficcion y novelas: el tuning esta orientado a narrativa detallada y generacion de prosa de alta calidad en todos los generos, con ejemplos de generacion incluidos en la model card.
- Roleplaying y chatbots de personaje: al ser uncensored y estar optimizado para conversacion creativa, es adecuado para simulaciones de personajes sin rechazos por filtrado.
- Asistencia a programadores en local: las cuantizaciones MTP "Neo-CODER" buscan alta velocidad de generacion, util como copiloto local en editores conectados a llama.cpp u Ollama.
- Razonamiento eficiente en hardware de consumo: la reduccion de tokens de thinking permite obtener respuestas razonadas sin gastar miles de tokens en el bloque de razonamiento, ahorrando latencia y coste en GPUs modestas.
- Agentes con tool calling: la model card cita rendimiento destacado en tool calling segun benchmarks de terceros; util en pipelines de agentes locales multi-paso.
- Procesamiento de documentos con contexto largo: heredando la ventana de contexto de la familia Qwen3.8 (dato concreto no disponible en la ficha), seria apto para resumen y analisis de documentos extensos.
- Generacion de contenido sin restricciones para investigacion: util para estudiar el comportamiento de modelos sin alineacion, con las precauciones eticas correspondientes.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente. No se publican tablas completas de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion proporcionada.

| Benchmark | Valor (segun el autor) |
|---|---|
| ARC-C (8 bit) | 735 |
| ARC-C (4 bit) | 719 |
| ARC-E (8 bit) | 880+ |

El autor afirma que el modelo supera al Qwen3.8-27B base y a Qwen3.6-35B-A3B, Qwen3.6-27B y Qwen3.5-27B en "los 7 benchmarks criticos", pero no se incluyen los resultados numericos de esos 7 benchmarks en la model card. No se han publicado resultados de benchmarks estandarizados verificables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 27B en 4 bit requiere aproximadamente 16-18 GB de VRAM (mas contexto); en 8 bit, unos 30-32 GB. El tamano total del repositorio es de 389 GB, lo que indica que incluye cuantizaciones de muy alta precision ademas de las de 4 y 8 bit.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones de 4 bit con contexto moderado; RTX 5090, A100 o H100 para cuantizaciones de 8 bit o contexto largo. Con offload a CPU/RAM es viable en equipos con 32-64 GB de RAM.
- Consumer GPU: si cabe en una RTX 3090 o 4090 de 24 GB en 4 bit; el propio autor destaca que esta "construido para hardware de consumo".
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF (incluido el modo MTP si el runtime lo soporta). No se menciona soporte vLLM o TGI para GGUF.
- Latencia y throughput: no disponibles; el autor afirma mayor velocidad de generacion que el modelo base, especialmente con cuantizaciones MTP, sin dar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Rasgos distintivos |
|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Uncensored (este) | 27B | GGUF (4/8 bit, MTP) | Apache 2.0 | Uncensored, thinking reducido, tuning creativo |
| Qwen3.8-27B (base) | 27B | safetensors / GGUF | Apache 2.0 | Modelo original con alineacion, thinking completo |
| Qwen3.6-35B-A3B | 35B (MoE) | safetensors / GGUF | Apache 2.0 | MoE con pocos parametros activos, mas rapido en inferencia |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored | 27B | GGUF | Apache 2.0 | Predecesor directo del mismo autor, sin la reduccion de thinking de la version TURBO |

Nota: la comparativa se limita a modelos de la misma familia mencionados en la model card; no hay datos de rendimiento comparados verificables mas alla de las afirmaciones del autor.

## Limitaciones y advertencias

- Modelo uncensored y abliterated: carece de salvaguardas de seguridad. Su uso puede generar contenido ofensivo, peligroso o ilegal; la responsabilidad legal y etica recae en el usuario. No apto para entornos de produccion orientados a publico general sin capas de moderacion externas.
- Benchmarks no verificados: las cifras de ARC-C/ARC-E provienen del autor del modelo. Los merges y fine tunes agresivos pueden inflar benchmarks ("benchmaxing", que el autor dice evitar) degradando otras capacidades.
- Riesgo de alucinacion: no documentado especificamente; al ser un fine tune comunitario sin alineacion, el riesgo se considera alto, especialmente en tareas factualmente exigentes.
- Contexto: la longitud de ventana no esta documentada en la model card; debe verificarse en la configuracion del modelo antes de asumir contextos largos.
- Idiomas: entrenado y documentado para ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Vision: el pipeline tag indica image-text-to-text, pero no hay documentacion sobre como usar la capacidad visual en las cuantizaciones GGUF; puede no estar operativa.
- Datos de entrenamiento opacos: los datasets Polar-STRICT y F451-STRICT son del propio autor y su composicion no esta detallada, lo que impide evaluar sesgos.
- Mantenimiento: repositorio comunitario (1.510 descargas, 0 likes en el momento de la ficha), sin garantia de soporte continuo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/diablomike20/Qwen3.8-27B-TURBO-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Predecesor referenciado: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Datasets de entrenamiento: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets y https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper, blog o demo: no disponibles
