# BananaMind/BananaMind-KV1-v2-1.2B-Liquid-Experimental-Instruct

## Resumen

BananaMind-KV1-v2-1.2B-Liquid-Experimental-Instruct es un modelo de lenguaje experimental de 1.200 millones de parametros publicado por BananaMind, derivado mediante ajuste fino del modelo base LiquidAI/LFM2.5-1.2B-Instruct. Su rasgo diferencial es que el entrenamiento esta disenado explicitamente en torno a la cuantizacion de la cache KV (etiquetas `kv-cache-quantization`, `kv-cache-aware-training` y `2-bit`), una tecnica que busca reducir el coste de memoria de la cache de atencion durante la inferencia con contexto largo. El modelo se distribuye como una variante experimental y con acceso restringido (gated) en HuggingFace.

El entrenamiento combina destilacion con ajuste supervisado sobre un conjunto de datasets de la familia UltraData y Ultra-FineWeb de OpenBMB, abarcando conversacion general (UltraData-SFT), uso de agentes (UltraData-SFT-Agent), codigo (UltraData-Code), matematicas (UltraData-Math) y datos web de preentrenamiento (Ultra-FineWeb). El objetivo declarado por las etiquetas es producir un modelo de instrucciones que mantenga calidad razonable cuando su cache KV se comprime a 2 bits.

Por su tamano y su enfasis en eficiencia de memoria, el modelo apunta a entornos de despliegue con recursos limitados o a escenarios de contexto largo donde el cuello de botella es la memoria de la cache KV y no el peso de los parametros. Al tratarse de una publicacion experimental, con cero descargas y cero "likes" en el momento de redactar esta ficha, debe tratarse como material de investigacion y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.200 millones (segun denominacion del modelo) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion de cache KV a 2 bits (etiqueta `2-bit`); cuantizacion de pesos no especificada |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en los metadatos proporcionados. El modelo deriva de LiquidAI/LFM2.5-1.2B-Instruct, por lo que hereda la arquitectura y el tamano del modelo base; BananaMind no publica en la ficha datos sobre el tipo de bloques, mecanismo de atencion ni la composicion exacta de la capa de atencion. El unico elemento arquitectonico explicitamente senalado es que el entrenamiento es "consciente de la cache KV" (`kv-cache-aware-training`), es decir, que el proceso de ajuste tiene en cuenta la compresion de la cache KV a 2 bits para mitigar la perdida de calidad que esta compresion introduce.

En cuanto a los datos, las etiquetas indican el uso de varios conjuntos de la familia UltraData de OpenBMB: UltraData-SFT-2605 y UltraData-SFT-Agent-2609 (ajuste supervisado de instrucciones y agentes), UltraData-Code (codigo), UltraData-Math (matematicas) y Ultra-FineWeb (datos web). Tambien figura la etiqueta `distillation`, lo que sugiere que parte del entrenamiento se apoya en destilacion desde un modelo mayor, aunque no se especifica el modelo profesor, el numero de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. No hay informacion sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en modo instrucciones, segun la denominacion `Instruct` del modelo base.
- Razonamiento y resolucion de problemas, con datos de entrenamiento especificos de matematicas (UltraData-Math).
- Generacion y comprension de codigo, con datos de entrenamiento especificos (UltraData-Code).
- Soporte de agentes y flujos multi-paso, a partir del dataset UltraData-SFT-Agent-2609.
- Inferencia con cache KV cuantizada a 2 bits gracias al entrenamiento consciente de dicha cuantizacion.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles (no consta que el modelo sea multimodal).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.

## Casos de uso

- Despliegue en dispositivos con memoria limitada: al ser un modelo de 1.2B parametros y estar optimizado para cache KV de 2 bits, permite ejecutar generacion de texto en GPUs de consumo o incluso en CPU, reduciendo el pico de memoria asociado a contextos largos.
- Conversaciones multi-turno con agente: los datos de UltraData-SFT-Agent-2609 apuntan a un uso como nucleo de agentes que mantienen estado de conversacion; la compresion de cache KV ayuda a sostener sesiones largas con menos memoria.
- Asistente de codigo ligero: integrable en editores o herramientas de linea de comandos para autocompletado y explicacion de fragmentos, aprovechando el entrenamiento sobre UltraData-Code.
- Tutor de matematicas de refuerzo: resuelve y explica ejercicios paso a paso, apoyandose en UltraData-Math, en entornos educativos con hardware modesto.
- Investigacion en cuantizacion de cache KV: sirve como banco de pruebas para estudiar el impacto de la compresion a 2 bits sobre la calidad de generacion, comparandolo con su modelo base sin esa optimizacion.
- Prototipado rapido de aplicaciones de chat: por su tamano reducido, es adecuado para iterar sobre prompts y flujos conversacionales antes de escalar a modelos mayores.
- Generacion de texto en pipelines de bajo coste: tareas de resumen, reescritura o clasificacion generativa donde el coste por token es un factor critico, aunque la naturaleza experimental obliga a validar la calidad caso por caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos en precision FP16/BF16: en torno a 2,4 GB para 1.200 millones de parametros (estimacion derivada del tamano, no publicada por el autor).
- VRAM estimada con cuantizacion de pesos a 8 bits: aproximadamente 1,2 GB; a 4 bits: aproximadamente 0,7 GB (estimaciones derivadas del recuento de parametros).
- El beneficio adicional declarado es la reduccion del espacio de la cache KV a 2 bits, relevante sobre todo con contextos largos y lotes grandes; el ahorro concreto depende de la longitud de contexto y del numero de secuencias simultaneas.
- GPU recomendadas: por tamano, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090, asi como en GPUs de centro de datos (A100, H100) para despliegues agregados.
- Cabria esperar ejecucion en CPU mediante llama.cpp, aunque el rendimiento no esta documentado.
- Opciones de despliegue: no confirmadas en la informacion proporcionada. La compatibilidad con llama.cpp, Ollama, vLLM o TGI dependera del formato de pesos finalmente publicado y de si el modelo base requiere kernels especificos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de rendimiento de los modelos comparados no se han publicado en la informacion disponible, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BananaMind-KV1-v2-1.2B-Liquid-Experimental-Instruct | 1,2B | no disponible | other (restringida) | HuggingFace, gated | Experimental; entrenamiento consciente de cache KV a 2 bits |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B | no disponible | no disponible | HuggingFace | Modelo base del anterior |
| Alternativas de ~1-2B para instrucciones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en esta informacion |

## Limitaciones y advertencias

- Caracter experimental: la propia denominacion `Experimental` indica que el modelo puede presentar inestabilidad y que su calidad no esta garantizada.
- Licencia `other` con acceso restringido (gated): es imprescindible revisar las condiciones en HuggingFace antes de cualquier uso, incluido el comercial, y aceptar los terminos de acceso.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingue solido, especialmente en castellano.
- Longitud de contexto no especificada, lo que impide planificar escenarios de contexto largo con garantias.
- Sin benchmarks publicados: no existen datos objetivos de MMLU, HumanEval, GSM8K ni metricas equivalentes que permitan validar su calidad frente a alternativas.
- La cuantizacion de la cache KV a 2 bits puede degradar la fidelidad en tareas que dependen de recordar detalles exactos a lo largo de muchos turnos; el entrenamiento "consciente" mitiga, pero no elimina, ese riesgo.
- Riesgo de alusionacion inherente a los modelos de este tamano y a un ajuste basado en destilacion; conviene validar las salidas en usos sensibles.
- Metadatos incompletos (formato de pesos, idiomas, contexto y arquitectura detallada sin especificar): dificulta la evaluacion tecnica previa.
- Cero descargas y cero interacciones registradas en HuggingFace en el momento de redactar esta ficha, lo que reduce la evidencia de uso en la comunidad.
- No se ha confirmado soporte de tool calling ni de modo de razonamiento explicito, por lo que no deberia asumirse en integraciones de agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BananaMind/BananaMind-KV1-v2-1.2B-Liquid-Experimental-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset openbmb/UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset openbmb/UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset openbmb/Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset openbmb/UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
