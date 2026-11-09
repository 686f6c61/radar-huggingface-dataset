# mradermacher/LFM3-1.7B-Base-i1-GGUF

## Resumen

LFM3-1.7B-Base-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo base LiquidAI/LFM3-1.7B-Base, publicada por el usuario mradermacher bajo su convencion de nombres "i1" (importancia/imatrix). El modelo original pertenece a la familia LFM3 de Liquid AI, una tercera generacion de modelos de lenguaje de 1.700 millones de parametros, aqui distribuida en formatos optimizados para inferencia en CPU y GPU de gama baja mediante llama.cpp y derivados.

La relevancia de este repositorio es practica: ofrece el modelo base en un abanico amplio de niveles de cuantizacion, desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en hardware muy limitado (incluso por debajo de 1 GB de VRAM/RAM en los niveles mas agresivos) manteniendo la compatibilidad con el ecosistema GGUF. Al tratarse del checkpoint "Base" y no de una version instruct, esta pensado como punto de partida para fine-tuning o para tareas de continuacion de texto, no como asistente conversacional listo para usar.

La informacion publicada en el repositorio es escasa: no se detallan licencia, idiomas, pipeline ni resultados de evaluacion. Los metadatos de parametros del repositorio (899.013) no son coherentes con el nombre del modelo (1.7B) y probablemente reflejan un recuento parcial o erroneo de tensores, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia LFM3 de Liquid AI; no se detalla en el repo) |
| Parametros totales | 1.7B (segun el nombre del modelo); el metadato del repo indica 899.013, no coherente |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo original) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base en el repositorio de cuantizaciones. El nombre LFM3 sugiere la tercera generacion de la familia Liquid Foundation Models de Liquid AI, pero este repositorio no documenta si se trata de un transformer convencional, un modelo de estado recurrente o una arquitectura hibrida, ni tampoco el volumen de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. Al ser un checkpoint "Base", es esperable que no haya pasado por alineamiento instruct, pero este extremo no se confirma en la model card.

Lo unico documentado tecnicamente son los metadatos de cuantizacion: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que las cuantizaciones se generaron a partir de pesos en formato Hugging Face con la version 2 del pipeline de cuantizacion de llama.cpp. La etiqueta `nicoboss` y el prefijo `i1` apuntan al uso de matrices de importancia (imatrix) para las cuantizaciones IQ, una tecnica que mejora la calidad de los niveles bajos de bits ponderando los tensores segun su relevancia.

## Capacidades

- Generacion de texto y continuacion de secuencias: al ser un modelo base, su funcion principal es completar texto, no seguir instrucciones.
- Punto de partida para fine-tuning: el checkpoint Base puede adaptarse a tareas especificas (clasificacion, extraccion, generacion de dominio) mediante ajuste supervisado.
- Inferencia en CPU y GPU de baja capacidad: las cuantizaciones IQ1 a Q6 permiten ejecutar el modelo en entornos sin acelerador dedicado.
- Compatibilidad con el ecosistema GGUF: funciona con llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles.
- Tool calling, function calling y comportamiento agentico: no disponible; no se documenta en el repositorio y no es esperable en un modelo base.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion local en hardware modesto: con cuantizaciones IQ2 o Q3 el modelo puede ejecutarse en equipos con 2-4 GB de RAM libre, lo que permite probar la familia LFM3 sin GPU dedicada.
- Base para fine-tuning en dominios verticales: al ser un checkpoint Base, es adecuado para ajuste supervisado en tareas como clasificacion de textos, extraccion de entidades o generacion de resumenes de dominio, partiendo de las cuantizaciones de mayor calidad (Q5_K_M o Q6_K) o directamente de los pesos originales.
- Prototipado de pipelines de generacion de texto: integrable en scripts con llama-cpp-python para tareas de autocompletado, generacion de descripciones o expansión de texto en entornos de desarrollo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de generacion sobre un mismo modelo base.
- Despliegue en dispositivos edge o embebidos: los niveles IQ1_S e IQ2_XXS reducen el peso del modelo a una fraccion del original, util para entornos con almacenamiento y memoria muy restringidos donde no se requiere alta fidelidad.
- Investigacion sobre modelos base pequenos: util para estudiar el comportamiento de modelos de 1.7B en tareas de continuacion y como linea base en experimentos de destilacion o comparacion de arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (para 1.7B parametros, aproximada): IQ1_S ~0.5-0.6 GB, IQ2_XXS ~0.6-0.7 GB, Q2_K ~0.7-0.8 GB, Q3_K_M ~0.9-1.0 GB, Q4_K_M ~1.1-1.2 GB, Q5_K_M ~1.3-1.4 GB, Q6_K ~1.5-1.6 GB. Son estimaciones basadas en el tamano nominal del modelo; el repositorio no publica tamanos por fichero.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050 en adelante) puede alojar las cuantizaciones Q4 y superiores; A100 y H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM, y en las de 2 GB con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base (este repo) | 1.7B | no disponible | no disponible | GGUF (24 cuantizaciones) | Base, sin alineamiento instruct documentado |
| Qwen2.5-1.5B (base) | 1.5B | 32K (segun documentacion publica del modelo original) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Amplia disponibilidad de cuantizaciones comunitarias |
| Llama 3.2 1B (base) | 1.2B | 128K (segun documentacion publica) | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia de Meta |
| SmolLM2-1.7B (base) | 1.7B | 8K (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | safetensors, GGUF | Alternativa de Hugging Face con documentacion detallada |

Los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica habitual y no de este repositorio; se incluyen solo como referencia de categoria. No hay datos de rendimiento comparativo disponibles para LFM3-1.7B-Base en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no esta disenado para seguir instrucciones ni para uso conversacional directo; puede generar contenido incoherente o inapropiado si se usa como asistente.
- Licencia no declarada: al no especificarse la licencia en el repositorio, no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo original LiquidAI/LFM3-1.7B-Base antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce la cobertura linguistica real; no se debe asumir soporte multilingue.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en tareas factuales y con cuantizaciones de baja precision (IQ1, IQ2, Q2).
- Perdida de calidad por cuantizacion: los niveles IQ1_S, IQ1_M e IQ2_XXS degradan la fidelidad de forma notable; para tareas sensibles se recomienda Q5_K_M o Q6_K.
- Metadatos inconsistentes: el campo de parametros del repositorio (899.013) no concuerda con el nombre del modelo (1.7B); conviene verificar los pesos antes de confiar en cualquier recuento.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, sin documentacion adicional ni garantias de mantenimiento.
- Fecha de creacion futura en los metadatos (2026-11-09): puede indicar un error de marcado temporal; no afecta al contenido pero conviene tenerlo en cuenta al evaluar la vigencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Base-i1-GGUF
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
