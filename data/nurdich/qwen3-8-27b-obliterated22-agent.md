# nurdich/Qwen3.8-27B-OBLITERATED22-AGENT

## Resumen

Qwen3.8-27B-OBLITERATED22-AGENT es una republicación del modelo abliterado `shoukewei/Qwen3.8-27B-OBLITERATED22`, un derivado de `Qwen/Qwen3-27B` (identificado en la model card como Qwen3.8-27B) al que se le ha eliminado el comportamiento de rechazo mediante técnicas de proyección de direcciones de rechazo en el espacio de pesos. El autor de esta ficha, `nurdich`, no modifica los pesos: lo único que cambia es la plantilla de chat, que se restaura desde el repositorio oficial de Qwen para recuperar las definiciones de herramientas, las llamadas a herramientas del asistente, los resultados de herramientas, el contenido de visión y los controles de razonamiento.

El modelo tiene 27.781.427.952 parámetros (~27,8 B) en un único archivo de safetensors en bf16, con licencia Apache 2.0 y pesos publicados también en GGUF y MLX. La model card original documenta una pérdida de 2,1 puntos porcentuales en MMLU 0-shot respecto al modelo base (82,3 % frente a 84,5 %), y afirma que la variante V3 responde a consultas restringidas sin arengas de seguridad, además de mantener operativo el modo thinking.

Su relevancia es doble: por un lado, sirve como banco de pruebas para investigación en seguridad de IA (red-teaming, evaluación de robustez de alineamiento, estudio de la degradación de capacidades tras abliteration); por otro, la restauración de la plantilla de chat lo convierte en una pieza utilizable dentro de arneses de agentes que dependen de tool calling correcto. Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, y debe tratarse con las cautelas propias de un modelo sin alineamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `model_type: qwen3`; los tags incluyen `qwen3_5` y `qwen3.8` |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | safetensors en bf16, GGUF y MLX; los niveles concretos de cuantizacion no estan detallados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |
| Tamano del repositorio | 237,1 GB (incluye multiples formatos y cuantizaciones) |
| Libreria declarada | mlx |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.8-27B (tags: `base_model:quantized:Qwen/Qwen3.8-27B`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3, con 27,8 B de parámetros en configuración densa (no hay indicios de mezcla de expertos en la información disponible). No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del corpus, ni si el modelo base pasó por RLHF o DPO; tan solo se indica que el modelo original es `Qwen/Qwen3.8-27B` y que la plantilla de chat se ha recuperado del repositorio oficial para preservar el soporte de herramientas y visión.

La innovación técnica central no está en el entrenamiento sino en el post-procesado. La abliteration identifica direcciones de rechazo en el espacio de pesos y las proyecta fuera. La versión V3 que llega a este repositorio aplica dos ideas: primero, un *blending* complementario de dos cirugías con modos de fallo distintos (SVD, que elimina rechazos de forma agresiva pero daña capacidad, y LEACE, que minimiza información mutua preservando capacidad pero con menor efecto sobre el rechazo) mezcladas en proporción 60/40; después, un refinamiento iterativo que parte siempre del modelo campeón en lugar del modelo stock, con expansión dirigida del corpus de calibración. El resultado declarado es −2,1 pp en MMLU frente a −6,0 pp de la V1. Esta edición concreta añade, además, una prefill de bloque de pensamiento vacío en la plantilla para que el modelo pase directamente a responder cuando `enable_thinking` está desactivado.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con el formato oficial de Qwen.
- Razonamiento explícito en modo thinking (`enable_thinking: true`); la configuración por defecto de la variante Prime Agent lo desactiva.
- Generación de código: la model card reporta 20/20 en un conjunto de 20 prompts de código y ciberseguridad con implementaciones funcionales.
- Tool calling / function calling: la plantilla restaurada conserva las definiciones de herramientas, las llamadas del asistente y los resultados de herramientas.
- Contenido multimodal de entrada: la plantilla preserva el bloque de visión del modelo base (soporte efectivo no verificado en esta ficha).
- Uso en arneses de agentes y razonamiento multi-paso, con recomendaciones específicas del autor para evitar bucles.
- Capacidad multilingüe: no disponible.
- Respuesta a consultas que el modelo stock rechaza, sin arengas de seguridad, según la documentación del autor.

## Casos de uso

- Red-teaming y evaluación de alineamiento: el modelo actúa como sujeto de prueba para medir qué consultas dejan de rechazarse tras la abliteration y cuantificar la degradación de capacidades con MMLU u otros conjuntos. Es el caso de uso declarado en los propios tags (`red-team`, `ai-safety-research`).
- Investigación sobre técnicas de edición de pesos: sirve para reproducir y comparar SVD, LEACE y el *blending* complementario, midiendo el compromiso entre eliminación de rechazo y retención de capacidad con un presupuesto de ~28 B de parámetros.
- Arneses de agentes con tool calling: al restaurar la plantilla oficial, el modelo puede emitir llamadas a funciones estructuradas y consumir resultados dentro de un bucle de agente; el autor recomienda `temperature` 0,1–0,3, `repetition_penalty` 1,15 y resumir el historial cada ~10 turnos para evitar deriva de contexto.
- Generación de código en pipelines internos: con `temperature` 0 y `repetition_penalty` 1,15 el autor reporta salidas más completas y ricas en código; encaja en tareas de scaffolding, refactorización o generación de scripts donde no se requiere moderación de contenido.
- Evaluación comparativa de cuantizaciones: el repositorio publica safetensors, GGUF y MLX del mismo modelo, lo que permite estudiar la pérdida de calidad entre bf16, GGUF y MLX sobre el mismo conjunto de prompts.
- Desarrollo y depuración de plantillas de chat: la diferencia entre este repositorio y el original es exclusivamente la plantilla, de modo que sirve como caso controlado para medir el impacto de una plantilla mal formada en el rendimiento de tool calling.
- Automatización de pruebas de seguridad ofensiva en entornos autorizados: el autor reporta 20/20 en tareas de código y cadenas de ataque; su uso legítimo queda restringido a laboratorios con autorización explícita.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son de MMLU (lm-eval, 0-shot, n=5700) y un conjunto cualitativo auditado manualmente por el autor. No hay datos de HumanEval, GSM8K, MMLU-Pro, contexto largo ni multilingüe.

| Metrica | Qwen3.8-27B stock | V1 | V2 | V3 (base de este modelo) |
|---|---|---|---|---|
| MMLU (lm-eval, 0-shot, n=5700) | 84,5 % | 81,4 % | 84,3 % | 82,3 % |
| Delta frente a stock | — | −6,0 pp | −0,3 pp | −2,1 pp |
| Tareas de codigo/cyber (20 prompts) | rechaza | no probado | no probado | 20/20 con codigo funcional |
| Conjunto "advanced real-world" (8 casos) | 5/8 | no probado | no probado | 7/8 |
| Modo thinking operativo | si | no | no | si |

Advertencia: los resultados distintos de MMLU son autoevaluados por el autor del modelo original mediante auditoría manual, sin protocolo reproducible publicado. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM en bf16: ~55,6 GB solo para pesos, más caché KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- VRAM en 8 bits: ~28 GB de pesos; encaja en RTX 6000 Ada 48GB, A6000 48GB o L40S 48GB, dejando margen para caché KV.
- VRAM en 4 bits (GGUF/MLX): ~15–17 GB; cabe en RTX 4090 24GB, RTX 3090 24GB y, con cuantizaciones de 3 bits y contexto corto, en GPU de 16 GB.
- Memoria unificada en Apple Silicon: ~32 GB para 4 bits y ~64 GB para 8 bits mediante MLX.
- Despliegue: llama.cpp con `--jinja` para usar la plantilla incluida en los GGUF, Ollama y LM Studio configurados con la plantilla integrada, y `mlx-lm` para los pesos MLX. El soporte de vLLM o TGI para esta variante no está confirmado en la información disponible.
- Descarga: el repositorio ocupa 237,1 GB; conviene descargar únicamente el archivo del formato y la cuantización elegidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU 0-shot | Alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (stock) | ~27,8 B | no disponible | 84,5 % | rechaza consultas restringidas | Apache 2.0 | HuggingFace |
| shoukewei/Qwen3.8-27B-OBLITERATED22 (V3 original) | ~27,8 B | no disponible | 82,3 % | abliterado; plantilla sin reparar | Apache 2.0 | HuggingFace |
| Este modelo (nurdich, Agent edition) | ~27,8 B | no disponible | 82,3 % (pesos identicos) | abliterado; plantilla oficial restaurada | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3.8-27B-OBLITERATED22 V2 (blend) | ~27,8 B | no disponible | 84,3 % | abliterado parcial: mantiene deflexiones | Apache 2.0 | dentro del repo original |

No se dispone de datos de otros modelos abliterados de tamaño comparable en la información proporcionada, por lo que la comparación se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: la abliteration elimina el comportamiento de rechazo por diseño. No debe desplegarse en aplicaciones orientadas a usuarios finales sin una capa externa de moderación y filtrado.
- Riesgo legal y de cumplimiento: la licencia Apache 2.0 permite uso comercial, pero eso no exime de las obligaciones de la normativa aplicable (por ejemplo, la Ley de IA de la UE o la DSA) ni de los términos del modelo base.
- Capacidad degradada: −2,1 pp en MMLU 0-shot frente al stock; el propio autor reconoce que las versiones previas de la cirugía producían modelos "notablemente más torpes".
- Sesgos: no hay evaluación de sesgos publicada en la información disponible; la eliminación de direcciones de rechazo puede alterar también la calibración en dominios sensibles.
- Alucinación: no se han publicado métricas de factualidad ni de tasa de alucinación para esta variante.
- Configuración frágil: la model card insiste en `temperature` 0 y `repetition_penalty` 1,15, advirtiendo de bucles en decodificación greedy sobre imports y boilerplate sin esa penalización. En modo agente se recomienda `temperature` 0,1–0,3 para romper bucles deterministas.
- Bucles en arneses de agente: el autor documenta que el contexto se llena de acciones repetidas y recomienda resumir el historial cada ~10 turnos.
- Idiomas: sin datos de cobertura ni de calidad por idioma.
- Contexto: la longitud de contexto no está documentada en la información disponible; no debe asumirse la del modelo base sin verificación.
- Trazabilidad: republicación de terceros con 0 descargas y sin benchmark independiente; los pesos son idénticos al original, pero la única verificación de integridad es la declaración del autor.
- Prompt injection: al soportar tool calling y contenido de visión, hereda la superficie de ataque del modelo base sin las salvaguardas eliminadas.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/nurdich/Qwen3.8-27B-OBLITERATED22-AGENT
- Modelo original republicado: https://huggingface.co/shoukewei/Qwen3.8-27B-OBLITERATED22
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
