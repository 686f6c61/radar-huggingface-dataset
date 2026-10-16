# sartajbhuvaji/bonsai-candidate-depth22-experts92

## Resumen

`sartajbhuvaji/bonsai-candidate-depth22-experts92` es un checkpoint de modelo de lenguaje publicado en HuggingFace por el usuario sartajbhuvaji. Se trata de un modelo de tipo text-generation construido sobre la arquitectura `qwen3_moe`, es decir, un transformer con mezcla de expertos (MoE) derivado de la familia Qwen3. El repositorio contiene 5.531.697.664 parametros totales (aproximadamente 5,53 mil millones) en formato safetensors, con un tamano de repositorio de 11,1 GB, lo que es coherente con pesos almacenados en precision de 16 bits.

El propio identificador del modelo, `bonsai-candidate-depth22-experts92`, sugiere un experimento de poda o compresion estructural de una red MoE: "depth22" apuntaria a 22 capas y "experts92" a 92 expertos, mientras que "candidate" indica que se trata de una variante candidata dentro de una busqueda de configuraciones. Esta interpretacion procede unicamente de la nomenclatura y no esta confirmada por documentacion alguna.

La relevancia de esta ficha es limitada pero ilustrativa: la model card es la plantilla automatica de HuggingFace sin rellenar, no se declara licencia, idiomas, datos de entrenamiento ni resultados de evaluacion, y el modelo acumula 0 descargas y 0 "likes". Debe tratarse, por tanto, como un artefacto de investigacion sin soporte ni garantias de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_moe` (transformer con mezcla de expertos, segun tag del repositorio) |
| Parametros totales | 5.531.697.664 (aproximadamente 5,53 B) |
| Parametros activos | no disponible (la nomenclatura sugiere 92 expertos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 11,1 GB |
| Fecha de creacion | 15 de octubre de 2026 (segun metadatos del Hub) |
| Fecha de ultima actualizacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

La unica evidencia estructural disponible es el tag `qwen3_moe` asociado al repositorio y la propia nomenclatura del modelo. Esto situa al checkpoint dentro de la familia de transformadores con mezcla de expertos de Qwen3, en la que cada bloque de feed-forward se sustituye por un conjunto de expertos y un router que activa solo un subconjunto por token. El nombre sugiere una variante con 22 capas y 92 expertos, pero no hay ninguna confirmacion oficial de esta configuracion ni del numero de expertos activos por token.

No existe informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos, ni sobre si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, atencion hibrida) ni hiperparametros de entrenamiento. El tag `arxiv:1910.09700` presente en los metadatos corresponde al articulo de Lacoste et al. sobre el calculo de impacto ambiental, que aparece de forma automatica en la plantilla de model card y no guarda relacion con el entrenamiento del modelo.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento y generacion de codigo: no confirmado por documentacion; se desconoce si el checkpoint conserva estas capacidades del modelo base.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ningun idioma).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Cuantizacion y despliegue ligero: no se publican variantes cuantizadas, por lo que cualquier conversion a GGUF o AWQ correria a cargo del usuario.

## Casos de uso

Dado que no existe documentacion funcional, los siguientes casos se plantean como escenarios plausibles para un modelo MoE de ~5,5 B de parametros totales con pipeline de generacion de texto, no como capacidades verificadas:

- Experimentacion en investigacion sobre poda de MoE: el checkpoint resulta util para reproducir y comparar configuraciones de compresion (profundidad y numero de expertos) frente al modelo base, midiendo calidad y coste computacional.
- Evaluacion comparativa interna: sirve como punto de referencia en estudios que midan la degradacion de un MoE tras reducir profundidad o numero de expertos.
- Generacion de texto conversacional en prototipos: un MoE de este tamano podria desplegarse como chatbot de pruebas en entornos de desarrollo, siempre que se valide antes la calidad real de las respuestas.
- Clasificacion y etiquetado de texto a escala: mediante prompts, para tareas de categorizacion en pipelines de datos internos.
- Resumen de documentos: como candidato para tareas de summarization en lotes, sujeto a validacion previa.
- Fine-tuning especifico de dominio: al estar en formato safetensors y ser compatible con `transformers`, puede servir de base para ajustes supervisados en dominios concretos.
- Despliegue en hardware de gama media: sus ~5,5 B de parametros permiten, en teoria, inferencia en GPU de consumo con cuantizacion, lo que lo hace apto para entornos de laboratorio sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no enlaza a evaluaciones externas.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros (5,53 B) y del tamano del repositorio (11,1 GB), no datos medidos por el autor:

- VRAM en fp16/bf16: en torno a 11,1 GB solo para pesos, mas cache KV; estimacion practica de 13 a 15 GB en funcion de la longitud de contexto.
- VRAM en int8: aproximadamente 5,6 GB de pesos, con un total estimado de 7 a 9 GB.
- VRAM en int4: aproximadamente 2,8 GB de pesos, con un total estimado de 4 a 6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para fp16 sin restricciones de contexto; RTX 4090, RTX 3090 o RTX 4080 (24 GB o menos) para fp16 con contexto moderado.
- GPU de consumo: si cabe en tarjetas de 24 GB en fp16 y en tarjetas de 8 a 12 GB con cuantizacion int4, siempre que la conversion sea posible.
- Opciones de despliegue: `transformers` de forma nativa; vLLM si la version instalada soporta la arquitectura `qwen3_moe`; llama.cpp u Ollama requeririan convertir los pesos a GGUF, ya que no se publican variantes GGUF.
- Latencia y throughput: no disponibles. El numero de parametros activos por token es desconocido, por lo que no puede estimarse el ahorro computacional inherente a la arquitectura MoE.

## Comparativa con modelos similares

La comparacion se establece con modelos MoE y densos de tamano comparable de dominio publico. Los datos de las alternativas proceden de sus fichas oficiales; los del modelo objeto de esta ficha son en su mayoria desconocidos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bonsai-candidate-depth22-experts92 | 5,53 B | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente usado |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Qwen3-8B (denso) | 8,2 B | 8,2 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento del modelo evaluado, por lo que no es posible establecer una comparacion cuantitativa de calidad con las alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto sin rellenar, por lo que se desconoce el origen de los datos, el procedimiento de entrenamiento y las capacidades reales.
- Licencia no declarada: sin licencia explicita, el uso comercial queda en un limbo legal; en la practica, debe asumirse que no esta autorizado hasta que el autor lo aclare.
- Idiomas no declarados: no hay garantia de soporte de castellano ni de ningun otro idioma.
- Riesgo de alucinacion: inherente a cualquier modelo generativo, agravado aqui por la falta de evaluacion publicada y por la posibilidad de que la poda haya degradado la fidelidad factual.
- Checkpoint candidato: el termino "candidate" sugiere una variante en fase de prueba, no una version estable; no deberia usarse en produccion.
- Sin cuantizaciones oficiales: la conversion a GGUF, AWQ o GPTQ correria a cargo del usuario y podria no ser compatible con todas las herramientas.
- Sin adopcion ni validacion por la comunidad: 0 descargas y 0 "likes" implican que no ha sido probado por terceros.
- Parametros activos desconocidos: sin este dato no puede estimarse el coste real de inferencia ni compararse con otros MoE.
- Fecha de creacion atipica: los metadatos indican octubre de 2026, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-candidate-depth22-experts92
- Articulo referenciado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental del machine learning: https://mlco2.github.io/impact

No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo, demos ni documentacion adicional asociados a este modelo.
