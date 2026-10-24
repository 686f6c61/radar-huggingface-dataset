# BLASTER-AKA-BHAVYA/ps3-sft-raw-lora

## Resumen

`BLASTER-AKA-BHAVYA/ps3-sft-raw-lora` no es un modelo completo, sino un adaptador LoRA (PEFT) entrenado mediante *supervised fine-tuning* (SFT) sobre `Qwen/Qwen2.5-3B-Instruct`. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), por lo que para utilizarlo es imprescindible descargar y cargar el modelo base Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3.090 millones de parámetros y 32.768 tokens de contexto.

El interés del artefacto es, a día de hoy, limitado y experimental: la model card es la plantilla por defecto de Hugging Face sin ninguna sección completada (todos los campos figuran como `[More Information Needed]`), el repositorio acumula 0 descargas y 0 *likes* desde su creación el 24 de octubre de 2026, y no se documenta el conjunto de datos, los hiperparámetros, la licencia ni los idiomas. El propio nombre del repositorio (`ps3`, `sft`, `raw`) sugiere un experimento de ajuste supervisado con datos sin depurar, pero el autor no lo confirma.

Por tanto, esta ficha debe leerse como una evaluación de trazabilidad: lo que se puede verificar del adaptador es su arquitectura de despliegue (PEFT 0.20.0 sobre Qwen2.5-3B-Instruct), y todo lo relativo a su calidad, alineación y licencia queda explícitamente como no disponible. Se recomienda tratarlo como material de prototipado, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso, Qwen2.5-3B-Instruct |
| Parametros totales | Modelo base: ~3.090 millones. Adaptador: no disponible (el repo pesa 0,1 GB, lo que sugiere un rango LoRA de pocas decenas de millones de parámetros, sin confirmar) |
| Parametros activos | No aplica: ni el adaptador ni el modelo base son MoE |
| Longitud de contexto | 32.768 tokens en el modelo base (Qwen2.5-3B-Instruct); no documentado para el adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar. El modelo base admite cuantización a 8 y 4 bits (GPTQ, AWQ, GGUF), pero el autor no documenta ninguna configuración |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5 está entrenado principalmente en inglés y chino, con cobertura parcial de otras lenguas, incluido el español |
| Licencia | No disponible para el adaptador. El modelo base Qwen2.5-3B-Instruct se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, `library_name: peft`, PEFT 0.20.0) |

## Arquitectura y entrenamiento

El adaptador se acopla a Qwen2.5-3B-Instruct, un transformer decoder-only con atención completa, RoPE y capas densas, sin mezcla de expertos. Las etiquetas del repositorio (`lora`, `sft`, `trl`, `transformers`) indican que el ajuste se realizó con la librería TRL de Hugging Face mediante entrenamiento supervisado clásico (pares instrucción-respuesta), no con RLHF ni DPO, y que los pesos resultantes son de rango bajo inyectados en las capas del modelo base. La versión declarada de PEFT es 0.20.0.

Más allá de eso, no hay información verificable: se desconoce el número de tokens de entrenamiento, la composición del dataset, si hubo enmascarado de la pérdida sobre el turno del asistente, el rango y alpha del LoRA, la tasa de aprendizaje, la precisión (fp16/bf16) o el hardware utilizado. El sufijo `raw` en el nombre sugiere que los datos no pasaron por un filtrado o formateo cuidado, lo que habitualmente se traduce en un adaptador útil para pruebas de concepto pero propenso a degradar la calidad conversacional del modelo base. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación).

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados del modelo base Qwen2.5-3B-Instruct y potencialmente reorientados por el SFT (sin evaluar).
- Razonamiento de un solo paso y tareas de conocimiento general de un modelo de 3B; no se ha verificado mejora alguna sobre el base.
- Generación de código y matemáticas básicas: capacidad presente en Qwen2.5-3B-Instruct, sin datos que confirmen que el adaptador la preserve.
- Soporte de *tool calling* / *function calling*: el modelo base lo soporta de forma nativa; el adaptador no documenta si mantiene el formato de plantilla de herramientas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado en la model card; depende íntegramente de lo que conserve el adaptador respecto al base.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Prototipado de pipelines de fine-tuning: sirve como ejemplo mínimo de adaptador LoRA generado con TRL y PEFT 0.20.0, útil para validar un flujo de entrenamiento y fusión de pesos antes de invertir en un dataset real.
- Experimentación académica sobre evaluación de adaptadores: al carecer de documentación, es un caso de estudio sobre la reproducibilidad de artefactos publicados en Hugging Face y sobre cómo medir el impacto de un SFT no documentado frente al modelo base.
- Ajuste de estilo o dominio acotado: si el SFT se realizó sobre un corpus temático concreto (el prefijo `ps3` podría apuntar a un dominio específico, sin confirmar), podría emplearse para generar texto con esa voz; requiere evaluación manual previa.
- Despliegue en hardware de consumo: al combinarse con un base de 3B cuantizado a 4 bits (aproximadamente 2 GB de pesos), el conjunto cabe en cualquier GPU de 8 GB, lo que permite probar el adaptador en portátiles o en una RTX 3060.
- Investigación sobre *safety* y alineación: un adaptador SFT sin filtrado declarado es un buen sujeto para medir la degradación de rechazos y sesgos respecto al modelo base alineado.
- Docencia y demostraciones: permite mostrar en clase cómo se carga un adaptador PEFT con `PeftModel.from_pretrained` y cómo se compara su salida con la del base sin fusionar.

No se recomienda su uso en atención al cliente, generación de código en producción ni ningún escenario con usuarios finales sin una evaluación propia previa y sin aclarar la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación y el autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni para el adaptador ni comparado con el modelo base. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM para el adaptador solo: despreciable; el repositorio completo ocupa 0,1 GB.
- VRAM para inferencia real (adaptador + base): unos 6,2 GB en bf16/fp16 para un modelo de 3B, más el *overhead* de KV cache (que crece con los 32.768 tokens de contexto); alrededor de 2-2,5 GB si el base se carga en 4 bits con bitsandbytes.
- GPU recomendadas: cualquier GPU con 8 GB o más para cuantización 4 bits (RTX 3060 Ti, RTX 4060, RTX 3070, L4); 16 GB o más (RTX 4080, RTX 4090, A10G) para trabajar en bf16 con contextos largos; A100/H100 solo si se necesita alto *throughput* por lotes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 8 GB o más, siempre que se cuantice el modelo base.
- Opciones de despliegue: vLLM soporta adaptadores LoRA multimodelo sobre el base (útil si se sirven varios adaptadores a la vez); TGI y transformers con PEFT admiten carga directa; para llama.cpp/Ollama es necesario fusionar el adaptador con el base (`merge_and_unload`) y convertir a GGUF, ya que estos motores no cargan el LoRA en safetensors de forma nativa.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Datos del modelo base tomados de la documentación pública de cada proyecto; el rendimiento del adaptador no está evaluado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ps3-sft-raw-lora (este) | ~3.090 M (base) + adaptador no cuantificado | 32.768 (heredado) | No disponible | Repo público, 0 descargas |
| Qwen2.5-3B-Instruct | ~3.090 M | 32.768 | Apache 2.0 | Muy extendido, cuantizaciones GGUF/AWQ/GPTQ |
| Llama-3.2-3B-Instruct | ~3.210 M | 131.072 | Llama 3.2 Community License | Amplia, requiere aceptar licencia |
| Phi-3.5-mini-instruct | ~3.800 M | 131.072 | MIT | Amplia, buenas capacidades de razonamiento para su tamaño |
| Gemma-2-2b-it | ~2.600 M | 8.192 | Gemma Terms of Use | Amplia, contexto corto |

Frente al propio Qwen2.5-3B-Instruct, este adaptador no aporta ninguna ventaja documentada: mismos parámetros en inferencia, mismo contexto y ninguna métrica que justifique el SFT. La única diferencia práctica es la incertidumbre añadida sobre licencia y calidad.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (datos, hiperparámetros, evaluación, uso previsto) figuran como `[More Information Needed]`. No hay forma de auditar el entrenamiento.
- Licencia no declarada para el adaptador: aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el repositorio impide asumir derechos de uso comercial sobre los pesos derivados. Requiere contactar con el autor.
- Calidad no verificada: 0 descargas y 0 *likes* implican que el adaptador no ha sido validado por terceros; el sufijo `raw` sugiere datos de entrenamiento sin curar, con riesgo de respuestas degradadas, repetitivas o con formato inconsistente.
- Riesgo de *catastrophic forgetting* parcial: un SFT agresivo sobre un modelo de 3B puede erosionar el soporte de *tool calling* y la alineación conversacional del base.
- Sesgos heredados: los del corpus de Qwen2.5 (predominantemente inglés y chino) más los del dataset de SFT, que se desconoce.
- Riesgo de alucinación: inherente a un modelo denso de 3.000 millones de parámetros sin verificación factual; el SFT no documentado puede agravarlo si los datos contienen afirmaciones no contrastadas.
- Cobertura del español no garantizada: ni el autor ni el base documentan un nivel de competencia específico en castellano.
- Dependencia fuerte del base: cualquier cambio en la versión de PEFT (el autor fija 0.20.0) o en la revisión del modelo base puede romper la carga del adaptador.
- No apto para producción sin evaluación propia: no hay métricas, ni pruebas de robustez, ni análisis de seguridad.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/BLASTER-AKA-BHAVYA/ps3-sft-raw-lora
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (SFTTrainer): https://huggingface.co/docs/trl
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Paper, blog, demo o repositorio adicionales del autor: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con este modelo concreto.
