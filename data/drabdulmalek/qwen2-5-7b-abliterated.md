# DrAbdulmalek/qwen2.5-7b-abliterated

## Resumen

Qwen2.5-7B-Instruct Abliterated es una variante del modelo Qwen2.5-7B-Instruct de Alibaba en la que se ha aplicado la tecnica de "abliteration" mediante la herramienta OBLITERATUS. El autor de la publicacion es DrAbdulmalek, que distribuye los pesos en Hugging Face bajo licencia Apache 2.0. El objetivo de esta modificacion es eliminar o reducir el comportamiento de rechazo (refusal) del modelo original, de modo que responda a peticiones que el modelo alineado tenderia a declinar.

El modelo conserva la arquitectura y los pesos de partida de Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7.615 millones de parametros (7,6 B) en formato safetensors, con el repositorio ocupando unos 15,2 GB. No se anuncia una ampliacion de contexto ni un reentrenamiento: la intervencion se limita a la manipulacion de direcciones de activacion asociadas al rechazo, por lo que las capacidades generales deberian mantenerse proximas a las del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta una practica cada vez mas extendida en la comunidad open source (la abliteration) y sus implicaciones tecnicas y eticas. Por otro, advierte de que el modelo no incluye salvaguardas de seguridad equivalentes a las del original, lo que condiciona su uso en produccion. La informacion publicada por el autor es muy escasa y se limita a metricas internas de rechazo y perplejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct, no confirmada por el autor) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, ar (segun tags del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Metodo de modificacion | Abliteration con OBLITERATUS |
| Tamano del repositorio | 15,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar y normalizacion RMSNorm, sin componentes MoE ni mecanismos hibridos. No se ha realizado un entrenamiento adicional desde cero: la modificacion consiste en la tecnica de abliteration, que identifica la direccion de activacion asociada al comportamiento de rechazo en las capas del modelo y proyecta los pesos para eliminarla o atenuarla. La herramienta citada por el autor es OBLITERATUS, si bien la model card no detalla la configuracion exacta (capas intervenidas, coeficiente de proyeccion, numero de muestras de calibracion).

No hay informacion publicada sobre el dataset de calibracion, el numero de tokens utilizados ni si se aplico un ajuste posterior (fine-tuning, DPO o RLHF) tras la abliteration. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. Las unicas metricas aportadas por el autor son internas: tasa de rechazo del 0 % (0/30), consistencia del 100 % (10/10), capacidades del 100 % (6/6) y perplejidad de 4,91. Estas cifras proceden de una evaluacion propia no estandarizada y no deben equipararse a resultados de benchmarks publicos.

## Capacidades

- Generacion de texto y razonamiento general, heredados del base Qwen2.5-7B-Instruct.
- Generacion de codigo y resolucion de problemas matematicos, en la medida en que el modelo base los soporta.
- Respuesta a peticiones que el modelo alineado rechazaria, segun la metrica interna de 0 % de rechazo declarada por el autor.
- Soporte multilingue limitado, segun los tags, a ingles y arabe.
- Capacidad de conversacion multi-turno (modelo Instruct de origen).
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking) en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni agentes multi-paso.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio para medir como la abliteration altera la tasa de rechazo y la distribucion de respuestas frente a un modelo alineado, comparando perplejidad y calidad en tareas controladas.
- Evaluacion de robustez de filtros: permite probar sistemas de moderacion y clasificadores de contenido frente a un modelo sin salvaguardas integradas, verificando si las capas de proteccion externas detectan respuestas que el base declinaria.
- Generacion creativa sin restricciones tematicas: util para escritura de ficcion que aborde temas sensibles (violencia en narrativa, personajes moralmente ambiguos) donde el modelo alineado tiende a rechazar o suavizar en exceso.
- Analisis de sesgos y contenido toxico: al reducir el rechazo, facilita obtener respuestas que revelan sesgos latentes del modelo base, utiles en auditorias de equidad y estudios academicos.
- Procesamiento de texto en ingles y arabe: tareas de resumen, traduccion o extraccion de informacion en ambos idiomas, aprovechando el soporte declarado.
- Desarrollo de prototipos de asistentes conversacionales: para pruebas internas de flujos multi-turno donde se requiere que el modelo no interrumpa la conversacion con negativas, siempre en entornos controlados y con supervision humana.
- Ajuste fino posterior (fine-tuning): como punto de partida para experimentos de personalizacion donde el equipo prefiere partir de un modelo sin refusal y aplicar sus propias politicas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas internas de su propia evaluacion:

| Metrica (evaluacion del autor) | Resultado |
|---|---|
| Tasa de rechazo | 0 % (0/30) |
| Consistencia | 100 % (10/10) |
| Capacidades | 100 % (6/6) |
| Perplejidad | 4,91 |

Estos valores no son comparables con benchmarks publicos y no se especifica el conjunto de evaluacion ni la metodologia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, mas overhead de contexto y cache KV; en la practica se recomienda 20-24 GB.
- Cuantizacion a 8 bits: en torno a 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: en torno a 4,5-5 GB de pesos, viable en GPUs consumer de 8 GB o superiores.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion 8 bits; RTX 3090, 4080, 4070 Ti Super y similares para cuantizacion 4-8 bits.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas en cuantizacion 4 bits; 16 GB o mas para 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con accelerate, al tratarse de pesos safetensors compatibles con el ecosistema Qwen2. No se confirma la existencia de GGUF pregenerados en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DrAbdulmalek/qwen2.5-7b-abliterated | 7,6 B | no disponible | Apache 2.0 | Variante abliterated del Qwen2.5-7B-Instruct, sin salvaguardas de rechazo |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun documentacion del base, no confirmado en esta ficha) | Apache 2.0 | Modelo original alineado, con refusal y soporte de tool calling documentado |
| Otras variantes abliterated de la comunidad (p. ej. ablations de Llama 3.1 8B) | ~8 B | variable | segun modelo base | Misma tecnica de eliminacion de refusal; comparacion directa no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion de salvaguardas: la abliteration reduce deliberadamente el rechazo, por lo que el modelo puede generar contenido danino, ilegal o inseguro sin las protecciones del base. No es apto para aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo de alucinacion: equivalente o superior al del modelo base; la intervencion en pesos puede degradar ligeramente la coherencia en tareas sensibles.
- Evaluacion no estandarizada: las metricas del autor (0/30 rechazos, perplejidad 4,91) proceden de pruebas internas sin metodologia publicada; no deben tomarse como garantia de calidad.
- Idiomas: solo se declaran ingles y arabe; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: el autor no especifica la longitud de contexto efectiva tras la modificacion; conviene verificar experimentalmente antes de usarla en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado, incluido el cumplimiento de normativas como la AI Act europea.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin informacion sobre cuantizaciones publicadas ni integracion en frameworks de inferencia; el despliegue requerira convertir los pesos manualmente si se necesita GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrAbdulmalek/qwen2.5-7b-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- OBLITERATUS (herramienta de abliteration citada por el autor): no disponible en la informacion proporcionada
