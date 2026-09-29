# richardyoung/granite-4.2-8b-heretic

## Resumen

richardyoung/granite-4.2-8b-heretic es una version "decensored" (abliterated) del modelo IBM Granite-4.2-8B, un transformer denso decoder-only de aproximadamente 8.800 millones de parametros orientado a razonamiento, generacion de codigo y uso de herramientas. El autor, richardyoung, ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar la direccion de rechazo en los pesos, reduciendo las negativas del modelo original de 99/100 a 12/100 sobre un conjunto de prueba de 100 peticiones, con una divergencia KL de 0,0801 respecto al original.

El modelo conserva las capacidades del Granite-4.2-8B: modo de razonamiento nativo con cadena de pensamiento en etiquetas `<think>...</think>`, modos flexibles de pensamiento (completo, sin pensamiento y bajo esfuerzo), tool calling aumentado por razonamiento y una ventana de contexto nativa de 128K tokens ampliable a 512K. Esta publicado bajo licencia Apache 2.0 y soporta 12 idiomas.

Su relevancia es doble: por un lado, ofrece un modelo de razonamiento de 8B con contexto largo y licencia permisiva; por otro, al estar abliterado, permite investigar el comportamiento del modelo sin las restricciones de rechazo del original, algo util en estudios de alineacion, red teaming y evaluacion de sesgos. El proceso de abliteracion es reproducible segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (GraniteForCausalLM) con Grouped Query Attention (GQA) |
| Parametros totales | 8.791.592.960 (~8,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens nativo, ampliable a 512K |
| Tipos de cuantizacion | El repositorio oficial solo incluye pesos safetensors en bfloat16; existen cuantizaciones GGUF de terceros (mradermacher) |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino (12) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Desarrollador | richardyoung (modelo base desarrollado por Granite Team, IBM) |
| Modelo base | ibm-granite/granite-4.2-8b; metadatos del repo apuntan a ibm-granite/granite-4.1-8b-base |
| Metodo de decensurado | Heretic v2.0.0.dev0 (abliteration) |
| Precision | bfloat16 |
| Tamano del repositorio | 17,6 GB |
| Fecha de creacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso decoder-only con atencion de consultas agrupadas (GQA) de 32 cabezas de atencion y 8 cabezas KV, embedding de tamano 4096, activacion SwiGLU en el MLP con tamano oculto 12800, normalizacion RMSNorm (epsilon 1e-5), embeddings de entrada y salida separados (no atados) y codificacion posicional rotatoria (RoPE) con theta = 10.000.000. El modo de razonamiento usa etiquetas `<think>...</think>` para la cadena de pensamiento antes de la respuesta final, y admite tres modos de pensamiento (completo, sin pensamiento y bajo esfuerzo).

Sobre el proceso de decensurado: se ha aplicado abliteration con Heretic v2.0.0.dev0, una tecnica que identifica y resta una direccion de rechazo en el espacio de activaciones modificando determinadas matrices de pesos. Los parametros publicados incluyen `direction_index` = 28,79, pesos maximos y minimos para `attn.o_proj` (1,45 / 1,40) y `mlp.down_proj` (1,48 / 1,43), con sus posiciones y distancias asociadas. El autor indica que el proceso es reproducible mediante el directorio `reproduce/` del repositorio. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento del modelo original ni sobre la composicion exacta del dataset o las etapas de RLHF/DPO de IBM.

## Capacidades

- Razonamiento con cadena de pensamiento nativa mediante bloques `<think>...</think>`, con modos conmutables (completo, sin pensamiento, bajo esfuerzo) para equilibrar profundidad y latencia.
- Generacion de codigo, resolucion de problemas matematicos y tareas de logica multi-paso.
- Tool calling aumentado por razonamiento: el modelo razona que herramienta invocar y por que antes de emitir la llamada a funcion.
- Flujos agenticos y razonamiento multi-paso, apoyados por la ventana de contexto extendida.
- Dialogo multilingue en 12 idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Comprension de documentos largos y conversaciones multi-turno gracias al contexto de 128K (hasta 512K).
- Ausencia practicamente total de rechazos (12/100 en la prueba del autor), lo que la hace util para escenarios de generacion sin filtros por defecto.
- No se menciona soporte de vision ni de audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 128K tokens, y el modo de bajo esfuerzo permite respuestas rapidas en consultas simples sin sacrificar el modo de razonamiento completo en casos complejos.
- Generacion de codigo en produccion: con tool calling aumentado por razonamiento, se puede integrar en pipelines de CI/CD para invocar linters, ejecutar tests o consultar documentacion de APIs antes de proponer parches.
- Agentes autonomos multi-paso: la combinacion de razonamiento explicito y llamada a funciones permite construir agentes que planifican, consultan herramientas externas y corrigen su propio plan a partir de los resultados.
- Analisis de documentacion tecnica extensa: con contexto de 128K (hasta 512K), admite contratos, manuales o bases de codigo extensas en una sola pasada, extrayendo resumenes, discrepancias o respuestas concretas.
- Investigacion en alineacion y seguridad: al ser un modelo abliterado y reproducible, permite estudiar la direccion de rechazo, comparar comportamientos frente al original y realizar red teaming controlado.
- Evaluacion de sesgos y comportamiento sin filtros: util para medir como responde un modelo de 8B a peticiones que el original rechazaria, en entornos de investigacion con las salvaguardas adecuadas.
- Asistentes multilingues internos: soporte nativo de 12 idiomas para equipos distribuidos, con la misma base de pesos y sin necesidad de modelos separados por idioma.
- Razonamiento matematico asistido: resolucion paso a paso de problemas con la traza de pensamiento visible, lo que facilita auditar el razonamiento en entornos educativos o de verificacion.

## Benchmarks y rendimiento

El autor solo publica metricas comparativas de rechazo y divergencia respecto al modelo original. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Este modelo | Modelo original (ibm-granite/granite-4.2-8b) |
|---|---|---|
| Rechazos | 12/100 | 99/100 |
| Divergencia KL | 0,0801 | 0 (por definicion) |

| Parametro de abliteration | Valor |
|---|---|
| direction_index | 28,79 |
| attn.o_proj.max_weight | 1,45 |
| attn.o_proj.max_weight_position | 25,26 |
| attn.o_proj.min_weight | 1,40 |
| attn.o_proj.min_weight_distance | 22,32 |
| mlp.down_proj.max_weight | 1,48 |
| mlp.down_proj.max_weight_position | 34,98 |
| mlp.down_proj.min_weight | 1,43 |
| mlp.down_proj.min_weight_distance | 18,99 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 17,6 GB solo de pesos, mas cache KV y activaciones; en la practica se recomienda 24 GB o mas por GPU para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en Q4_K_M: aproximadamente 5-6 GB.
- GPU recomendadas para bfloat16 sin cuantizar: A100 40/80 GB, H100, L40S o configuraciones multi-GPU.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede ejecutar el modelo en bfloat16 con margen limitado y poco contexto; con cuantizacion de 8 bits entra con holgura. Una RTX 4080 (16 GB) requiere cuantizacion de 4-6 bits. Una RTX 3060 (12 GB) es viable solo en Q4.
- Contexto largo: la cache KV a 128K-512K tokens puede consumir una cantidad de VRAM muy superior a la de los pesos, por lo que el contexto maximo real depende de la GPU y de la implementacion.
- Opciones de despliegue: transformers para uso directo, vLLM y TGI para servicio de alto rendimiento, llama.cpp/Ollama a traves de las cuantizaciones GGUF de terceros. El repositorio oficial solo distribuye safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| richardyoung/granite-4.2-8b-heretic | ~8,8B denso | 128K (hasta 512K) | Si (`<think>`) | 12/100 | Apache 2.0 | Safetensors; GGUF de terceros |
| ibm-granite/granite-4.2-8b | 8B denso | 128K (hasta 512K) | Si (`<think>`) | 99/100 | Apache 2.0 | Safetensors y derivados |
| richardyoung/granite-4.2-3b-heretic-GGUF | 3B denso | No disponible | Si (`<think>`) | No disponible | Apache 2.0 | GGUF (llama.cpp, Ollama) |
| ibm-granite/granite-4.2-30b | 30B denso | 128K (hasta 512K) | Si (`<think>`) | No disponible | Apache 2.0 | Safetensors y derivados |

La comparativa se limita a la propia familia Granite 4.2, ya que la informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos abliterados equivalentes de otros fabricantes.

## Limitaciones y advertencias

- Al estar abliterado, el modelo ha perdido gran parte de sus mecanismos de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, danino o inexacto. No es recomendable su uso directo en produccion orientada al publico sin capas adicionales de moderacion.
- La divergencia KL de 0,0801 respecto al original indica que la modificacion de pesos no es neutra: puede degradar ligeramente la coherencia o la calidad en algunas tareas.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas de conocimiento factual y en generacion de citas o referencias.
- Aunque se listan 12 idiomas, el autor advierte que otros idiomas pueden funcionar pero no han sido plenamente probados; el rendimiento fuera de esa lista no esta garantizado.
- El contexto de 512K requiere tecnicas de extension de contexto y un consumo de VRAM elevado; el contexto nativo es de 128K.
- Licencia Apache 2.0 permite uso comercial y modificacion, pero el autor del decensurado no ofrece garantias sobre el comportamiento resultante.
- La model card del repositorio no incluye datos de entrenamiento, composicion del dataset ni etapas de alineacion, por lo que no se puede auditar el origen de los sesgos.
- Es un modelo publicado en 2026 con cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/richardyoung/granite-4.2-8b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Modelo base (metadatos): https://huggingface.co/ibm-granite/granite-4.1-8b-base
- Heretic: https://heretic-project.org
- Coleccion Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog tecnico de IBM: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub de IBM: https://github.com/ibm-granite/granite-4.2-language-models
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Version GGUF de terceros (mradermacher): https://huggingface.co/mradermacher/granite-4.2-8b-heretic-GGUF
- Variante 3B heretic GGUF: https://huggingface.co/richardyoung/granite-4.2-3b-heretic-GGUF
- Endpoint de inferencia (FriendliAI): https://friendli.ai/models/Dingdust/granite-4.2-8b-heretic
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
