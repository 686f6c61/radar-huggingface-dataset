# Adik92/qwen-nfactorial-fan-lora

## Resumen

`Adik92/qwen-nfactorial-fan-lora` es un adaptador LoRA publicado en HuggingFace por el usuario Adik92, obtenido mediante fine-tuning del modelo base `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, es decir, una versión cuantizada a 4 bits de Qwen2.5-1.5B-Instruct preparada por Unsloth. El repositorio ocupa aproximadamente 0,1 GB, un tamano coherente con un adaptador de bajo rango y no con un modelo completo de pesos.

Se trata de un ajuste muy ligero y de proposito aparentemente experimental: la model card no documenta el dataset de entrenamiento, el rango del LoRA, el numero de pasos ni el objetivo concreto del ajuste. El nombre sugiere un uso vinculado al programa nFactorial, pero esto no se confirma en la informacion disponible. A fecha de la ficha, el repositorio acumula 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.

Su relevancia es, por tanto, acotada: sirve como ejemplo de flujo de trabajo de fine-tuning rapido con Unsloth y TRL sobre un modelo pequeno de 1.500 millones de parametros, y como punto de partida para quien quiera replicar el proceso o adaptar Qwen2.5-1.5B a un dominio propio en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (RoPE, GQA, SwiGLU); este repositorio contiene un adaptador LoRA sobre dicho transformer |
| Parametros totales | Aproximadamente 1.540 millones en el modelo base Qwen2.5-1.5B-Instruct; el numero de parametros entrenables del adaptador no esta documentado |
| Longitud de contexto | 32.768 tokens en el modelo base segun la documentacion publica de Qwen2.5; no se especifica en la model card del adaptador |
| Tipos de cuantizacion | Adaptador publicado en safetensors; el modelo base de partida esta cuantizado a 4 bits (bnb-4bit). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, repositorio de ~0,1 GB) |
| Libreria | transformers |
| Modelo base | unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalizacion RMSNorm, embeddings rotatorios (RoPE), atencion con consultas agrupadas (GQA) y activacion SwiGLU. Segun la documentacion publica de la familia Qwen2.5, la variante de 1.5B tiene 28 capas, un tamano oculto de 1536 y un vocabulario de 151.936 tokens, y fue preentrenada sobre aproximadamente 18 billones de tokens con una fase posterior de ajuste por instrucciones y preferencias. La version empleada aqui es la conversion de Unsloth cuantizada a 4 bits en formato bitsandbytes.

Sobre ese base, el autor ha aplicado un fine-tuning supervisado (SFT) con el stack Unsloth mas TRL, segun indican las etiquetas del repositorio (`unsloth`, `trl`) y el propio README, que menciona un entrenamiento "2x faster" gracias a Unsloth. No se documenta el dataset, el rango y el alpha del LoRA, la tasa de aprendizaje, el numero de epocas ni si hubo una fase adicional de alineamiento (DPO, RLHF u ORPO). Tampoco se especifica si el adaptador se entreno sobre el base en 4 bits o sobre una version en precision completa.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y resolucion de problemas sencillos de matematicas de nivel escolar, limitado por el tamano del modelo.
- Generacion y explicacion de codigo en lenguajes habituales, con calidad propia de un modelo de 1.5B.
- Salidas estructuradas y formato JSON, capacidad presente en el modelo base.
- Soporte de function calling y tool calling en el modelo base Qwen2.5-Instruct; el fine-tuning del adaptador puede haber degradado esta capacidad, ya que no se menciona en la model card.
- Uso en pipelines de agentes multi-paso de forma experimental: la ventana de 32.768 tokens del base lo permite, pero la fiabilidad de un modelo de 1.5B en planificacion larga es baja.
- Capacidades multilingues del modelo base (la familia Qwen2.5 cubre decenas de idiomas), aunque la model card del adaptador solo declara ingles.
- Capacidad especifica del adaptador (dominio, tono o tarea concreta): no documentada.

## Casos de uso

- Prototipado de fine-tuning educativo: sirve como referencia para reproducir un pipeline de SFT con Unsloth y TRL sobre un modelo de 1.5B en una unica GPU de consumo, dado el reducido tamano del adaptador.
- Adaptacion de dominio sobre Qwen2.5-1.5B: el adaptador puede fusionarse con el base y usarse como punto de partida para un ajuste adicional en un dominio concreto (legal, sanitario, atencion al cliente) si se dispone de datos etiquetados.
- Inferencia en el borde o en local: con ~1-2 GB de VRAM en 4 bits, es viable desplegarlo en portatiles con GPU discreta, mini-PC o estaciones sin conexion, para tareas de asistencia textual sin enviar datos a la nube.
- Generacion de codigo asistida de bajo coste: autocompletado, explicacion de fragmentos y generacion de tests unitarios en entornos con recursos limitados, aceptando una calidad inferior a la de modelos de 7B o superiores.
- Etiquetado y clasificacion de texto a escala: extraccion de entidades, clasificacion de tickets o resumen de documentos en lotes, donde el coste por token y la latencia importan mas que la calidad punta.
- Chatbot de soporte interno: conversaciones multi-turno sobre documentacion tecnica usando la ventana de 32.768 tokens del base, con recuperacion aumentada (RAG) para compensar la tendencia a la alucionacion del modelo pequeno.
- Base para experimentos de comparacion de tecnicas de PEFT: permite medir el impacto de distintos rangos de LoRA o regimenes de cuantizacion sobre un mismo modelo, al ser un artefacto pequeno y rapido de reentrenar.
- Demostraciones y material docente: ejemplo minimo y ejecutable de como se publica y carga un adaptador LoRA con la libreria transformers y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco se aportan metricas de perdida de validacion o comparaciones frente al modelo base.

## Requisitos de hardware

- VRAM para inferencia en precision completa (bf16/fp16) tras fusionar el adaptador: aproximadamente 3,5-4 GB solo para pesos, mas el coste de la cache KV.
- VRAM para inferencia cargando el base en 4 bits con el adaptador: en torno a 1,5-2,5 GB, segun la longitud de contexto utilizada.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y tarjetas equivalentes; tambien en iGPU con memoria unificada suficiente si se usa llama.cpp tras convertir a GGUF.
- GPU de datacenter: A100, H100, L40S o L4 son sobredimensionadas para un modelo de este tamano, pero validas para despliegues con muchas replicas concurrentes.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM o TGI (la etiqueta `endpoints_compatible` del repositorio apunta a TGI) previa fusion del adaptador con el base; llama.cpp u Ollama solo tras fusionar y convertir a GGUF, ya que estas herramientas no consumen adaptadores safetensors directamente.
- Latencia y throughput: no disponibles. Como referencia orientativa de un modelo de 1,5B en bf16 sobre una GPU moderna, la generacion se sitúa típicamente por encima de 100 tokens por segundo en una RTX 4090, pero no existen mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adik92/qwen-nfactorial-fan-lora | ~1,5B (adaptador LoRA sobre Qwen2.5-1.5B) | 32.768 tokens (heredado del base) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (ampliable con YaRN) | apache-2.0 | HuggingFace, ampliamente utilizado |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Licencia comunitaria Llama 3.2 | HuggingFace, con restricciones de uso |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Terminos de uso de Gemma | HuggingFace, con restricciones de uso |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | apache-2.0 | HuggingFace |

En rendimiento no se puede establecer comparacion alguna: el adaptador no publica evaluaciones, y las cifras de los modelos alternativos proceden de sus respectivas documentaciones oficiales, no de una evaluacion conjunta.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, el rango del LoRA, los hiperparametros y el objetivo del ajuste, lo que impide reproducir el resultado o evaluar su idoneidad para un caso concreto.
- Cero descargas y cero likes: no hay evidencia de uso real ni validacion por parte de la comunidad.
- Al no existir benchmarks, no se puede verificar si el adaptador mejora o degrada las capacidades del modelo base; el fine-tuning sobre datasets pequenos suele provocar olvido catastrofico de habilidades previas, incluida la de seguir instrucciones y el tool calling.
- El modelo base esta cuantizado a 4 bits, lo que introduce una perdida de calidad adicional respecto a la version en precision completa.
- La model card declara unicamente ingles; el comportamiento en castellano no esta verificado, aunque el modelo base sea multilingue.
- Un modelo de 1,5B presenta una tasa de alucinacion elevada en tareas de conocimiento factual y razonamiento complejo; no es adecuado para decisiones automatizadas sin revision humana.
- Riesgo de sesgos heredados del corpus de preentrenamiento de Qwen2.5, no evaluados ni mitigados en este adaptador.
- La licencia apache-2.0 del adaptador es permisiva y permite uso comercial, pero conviene verificar la licencia del modelo base y de cualquier dato de entrenamiento utilizado, que no se detalla.
- El repositorio tiene 0,1 GB: debe cargarse siempre junto al modelo base; no es un modelo autonomo. La fusion con un base cuantizado a 4 bits requiere cuidado tecnico (lo habitual es cargar el base en 4 bits y aplicar el adaptador con PEFT en lugar de fusionar).
- No se recomienda su uso en produccion sin una evaluacion propia previa sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adik92/qwen-nfactorial-fan-lora
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion y repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/

Nota: la busqueda web realizada no devolvio ningun enlace relacionado con este modelo; los resultados obtenidos correspondian a una herramienta de sustitucion de archivos DLSS 5, sin relacion con el modelo evaluado.
