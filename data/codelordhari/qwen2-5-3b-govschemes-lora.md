# CodeLordHari/Qwen2.5-3B-GovSchemes-LoRA

## Resumen

Qwen2.5-3B-GovSchemes-LoRA es un ajuste fino de tipo instruct sobre una base Qwen2.5-3B-Instruct cuantizada a 4 bits (unsloth/Qwen2.5-3B-Instruct-bnb-4bit), publicado por el usuario CodeLordHari en HuggingFace. El repositorio contiene pesos en formato safetensors con 3.085.938.688 parametros reales y 6,3 GB de tamano, lo que corresponde a un modelo denso fusionado en bf16/fp16 mas que a un adaptador LoRA suelto, a pesar del sufijo "LoRA" en el nombre. El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun declara el propio autor en la model card.

El nombre del repositorio sugiere un ajuste orientado a esquemas o programas gubernamentales, pero la model card no documenta el conjunto de datos, el numero de tokens de entrenamiento ni el procedimiento de ajuste, por lo que el dominio real de especializacion no esta verificado. Licenciado bajo Apache-2.0, el modelo hereda la arquitectura Qwen2 de 3B parametros, un tamano que permite inferencia en GPU de gama media e incluso en equipos de consumo con cuantizacion.

Su relevancia practica es limitada por el momento: cero descargas, cero valoraciones y ausencia total de resultados de evaluacion publicados. Resulta util, sobre todo, como ejemplo reproducible de flujo de trabajo Unsloth + TRL sobre bases cuantizadas a 4 bits, y como posible punto de partida para tareas de dominio estrecho en ingles, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (no confirmado en la model card; heredado del modelo base) |
| Parametros totales | 3.085.938.688 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun la familia Qwen2.5-3B; no confirmado en la model card de este repositorio |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas (solo safetensors). La base de entrenamiento era de 4 bits (bitsandbytes NF4); la cuantizacion posterior con llama.cpp, AWQ o GPTQ es viable pero no esta publicada |
| Idiomas soportados | Ingles (en), segun los metadatos del repositorio. La familia Qwen2.5 cubre mas idiomas, pero no se declaran ni se evaluan aqui |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | unsloth/Qwen2.5-3B-Instruct-bnb-4bit |
| Tamano del repositorio | 6,3 GB |
| Uso y valoracion | 0 descargas, 0 likes |
| Fecha de publicacion | 11 de septiembre de 2026 (segun metadatos; fecha anomala respecto al resto de la ficha) |
| Etiquetas tecnicas | transformers, safetensors, text-generation-inference, unsloth, qwen2, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), con 36 capas y un tamano oculto de 2048. Al no tratarse de un modelo MoE, los 3.085 millones de parametros se activan en su totalidad en cada token generado. El ajuste se aplico sobre una version del modelo base ya cuantizada a 4 bits con bitsandbytes (NF4), un detalle relevante porque el entrenamiento sobre pesos cuantizados puede introducir desviaciones respecto a un ajuste equivalente en precision completa, y porque la fusion de los pesos resultantes no siempre reproduce con exactitud el comportamiento del adaptador original.

El autor no documenta el conjunto de datos, el numero de tokens vistos, la composicion del corpus ni si se aplicaron tecnicas de alineacion posteriores como RLHF o DPO. La model card se limita a indicar que el entrenamiento se realizo "2x faster" con Unsloth y TRL, lo que situa el flujo en la categoria de ajuste supervisado (SFT) eficiente en memoria. No se describe ninguna innovacion tecnica propia, ni decodificacion especulativa, ni atencion lineal. Unsloth actua aqui como herramienta de optimizacion del entrenamiento (kernels Triton y checkpointing selectivo), no como cambio arquitectonico.

## Capacidades

Las siguientes capacidades corresponden al modelo base Qwen2.5-3B-Instruct y se asumen heredadas, dado que no existe evaluacion publicada del ajuste:

- Generacion de texto conversacional en ingles y seguimiento de instrucciones en formato chat.
- Razonamiento basico y matematicas de complejidad media, con calidad limitada por el tamano de 3B parametros.
- Generacion y explicacion de codigo en lenguajes comunes, sin garantia de correccion en proyectos largos.
- Especializacion probable en vocabulario y estructura de esquemas o programas gubernamentales, inferida unicamente del nombre del repositorio; no verificada.
- Soporte de tool calling y function calling: presente en la familia Qwen2.5-Instruct, no confirmado para este ajuste concreto.
- Capacidades de agente y razonamiento en varios pasos: teoricamente disponibles por herencia, sin evidencia empirica en este repositorio.
- Capacidades multilingues: no declaradas. Los metadatos indican solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistencia ciudadana sobre programas y ayudas publicas: si el ajuste esta realmente especializado en esquemas gubernamentales, el modelo puede responder consultas sobre requisitos, plazos y documentacion de programas concretos, siempre con una capa de recuperacion documental por delante para evitar respuestas inventadas.
- Extraccion de informacion estructurada de documentacion administrativa: con 3B parametros cabe en una GPU de gama media y puede procesar lotes de formularios o circulares para extraer campos como organismo, plazo y beneficiario en pipelines de ingesta de datos.
- Enrutado de consultas en un chatbot institucional: clasificar la consulta entrante y derivarla al departamento o al esquema correcto antes de invocar un modelo mayor, reduciendo coste por token en el sistema global.
- Generacion aumentada por recuperacion (RAG) sobre normativa: sus 32.768 tokens de contexto permiten insertar varios fragmentos de reglamentos y preguntas relacionadas en una sola llamada, algo util cuando no se dispone de infraestructura para modelos de 7B o superiores.
- Prototipado rapido en equipos pequenos: al ser un modelo de 3B con pesos en safetensors y compatibilidad con text-generation-inference, se puede desplegar en un servidor modesto para validar una idea de producto antes de invertir en modelos mayores.
- Investigacion sobre ajuste eficiente: sirve como caso de estudio reproducible de Unsloth + TRL sobre una base cuantizada a 4 bits, util para medir la perdida de calidad respecto a un ajuste equivalente en bf16.
- Generacion de datos sinteticos de dominio: producir preguntas y respuestas de ejemplo sobre esquemas publicos para alimentar el entrenamiento de un modelo mayor, filtrando despues por verificacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no cuenta con evaluaciones de la comunidad. Tampoco existen resultados que comparen este ajuste con su modelo base, por lo que se desconoce si la especializacion ha degradado capacidades generales.

## Requisitos de hardware

- VRAM en bf16/fp16: los pesos ocupan aproximadamente 6,2 GB (3.086 millones de parametros a 2 bytes), por lo que la inferencia completa necesita unos 7,5 GB contando cache KV para 32.768 tokens.
- Cache KV estimada: con 36 capas y 2 cabezas KV de 128 dimensiones, el coste es de unos 36 KB por token, es decir, aproximadamente 0,3 GB a 8.000 tokens de contexto y 1,2 GB a 32.768 tokens en fp16.
- VRAM en 8 bits: en torno a 3,1 GB de pesos, mas la cache KV. Cabe con holgura en GPUs de 8 GB con contextos moderados.
- VRAM en 4 bits (GGUF Q4_K_M, estimacion para un modelo de 3B): entre 1,8 y 2,2 GB, suficiente para GPUs de 4-6 GB y para CPU con RAM abundante.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070, RTX 4080 o superiores para bf16 sin cuantizar; RTX 4060 Ti de 8 GB o RTX 3070 en el limite; cualquier GPU de 16 GB o mas (A4000, L4, A100, H100) ofrece margen sobrado y permite lotes grandes.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 12 GB o mas, y en cuantizacion de 4 bits en tarjetas de 6-8 GB.
- Opciones de despliegue: transformers con accelerate, text-generation-inference (etiqueta oficial del repositorio), vLLM para servir con batching continuo y Unsloth para seguir ajustando. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se distribuye.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| Qwen2.5-3B-GovSchemes-LoRA (este modelo) | 3,09B | 32.768 tokens (heredado, no confirmado) | Apache-2.0 | Repositorio con pesos fusionados; 0 descargas; sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens nativo, extensible a 128.000 con YaRN | Apache-2.0 | Modelo base de referencia; ampliamente evaluado y desplegado |
| unsloth/Qwen2.5-3B-Instruct-bnb-4bit | 3,09B | Igual que el modelo original | Apache-2.0 | Version cuantizada a 4 bits usada como punto de partida de este ajuste |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License (no Apache-2.0) | Alternativa de tamano similar con contexto mayor, pero con restricciones de licencia para uso comercial |

La comparacion de rendimiento no es posible: no existen resultados de benchmarks de este ajuste, y su calidad frente al modelo base o frente a Llama-3.2-3B-Instruct es desconocida. A igualdad de parametros, el contexto declarado de la familia Qwen2.5-3B es cuatro veces menor que el de Llama-3.2-3B, aunque Qwen2.5 admite extension mediante YaRN hasta 128.000 tokens.

## Limitaciones y advertencias

- Ausencia total de evaluacion: cero descargas, cero likes y ningun benchmark publicado. No hay evidencia independiente de que el ajuste funcione correctamente.
- Ambiguedad sobre el formato: el nombre indica "LoRA", pero el tamano del repositorio y el recuento de parametros apuntan a un modelo fusionado completo. Conviene verificar los archivos antes de integrarlo en produccion.
- Entrenamiento sobre base cuantizada a 4 bits: puede degradar la calidad respecto a un ajuste equivalente en bf16 y complica la trazabilidad de los pesos resultantes.
- Olvido catastrofico probable: al ser un ajuste de dominio estrecho sin datos publicados de composicion del dataset, es razonable esperar perdida de capacidades generales, especialmente en matematicas y codigo.
- Riesgo elevado de alucinacion en materia normativa: si el modelo se usa para informar sobre requisitos legales, plazos o cuantias, cualquier dato inventado tiene consecuencias directas para el usuario. Es obligatorio anclar las respuestas a documentacion recuperada y verificar la salida.
- Sesgos no auditados: no se documenta la composicion del corpus de ajuste ni se han realizado analisis de sesgo de genero, origen o condicion socioeconomica, algo especialmente sensible en el ambito de programas publicos.
- Idiomas: los metadatos declaran unicamente ingles. No hay soporte declarado de castellano ni de otras lenguas, aunque la familia Qwen2.5 sea multilingue.
- Proveedor no verificado: el autor no dispone de historial publico en HuggingFace (0 descargas, 0 likes) y la model card es una plantilla generada automaticamente por Unsloth sin informacion tecnica adicional.
- Licencia: Apache-2.0 permite uso comercial y modificacion sin obligacion de compartir derivados, pero conviene confirmar que el modelo base y el corpus de ajuste no imponen restricciones adicionales.
- Fecha de publicacion incoherente: los metadatos indican septiembre de 2026, lo que sugiere un error de registro y dificulta situar el modelo en una cronologia real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodeLordHari/Qwen2.5-3B-GovSchemes-LoRA
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces encontrados correspondian a foros de perifericos y no se incluyen.
