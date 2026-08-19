# hfunknown/qwen3-8b-knapsack-lora-persistent-seed1337

## Resumen

Este repositorio contiene un adaptador LoRA sobre el modelo base Qwen/Qwen3-8B, publicado de forma anónima por el usuario `hfunknown` como material suplementario para una revisión de reproducibilidad en un workshop de doble ciego (posiblemente NeurIPS). El adaptador ha sido ajustado específicamente para la tarea agéntica "Opaque Knapsack", un problema de optimización combinatoria donde un agente debe resolver instancias de mochila con información parcialmente oculta. La liberación forma parte de un estudio que compara dos regímenes de entrenamiento —persistente y sin estado (stateless)—, siendo este el correspondiente al régimen persistente con semilla 1337.

La relevancia de este modelo radica en que ejemplifica un enfoque de ajuste fino para agentes que requieren mantener estado a lo largo de múltiples turnos de interacción, una capacidad crítica para aplicaciones de razonamiento multi-paso y toma de decisiones secuencial. Al estar basado en Qwen3-8B, hereda la arquitectura transformer densa de 8.200 millones de parámetros y una ventana de contexto de 16.384 tokens durante el entrenamiento. Sin embargo, al tratarse de una liberación anónima para revisión académica, la documentación es mínima y no se proporcionan métricas de rendimiento ni comparativas con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA |
| Parametros totales | No disponible (adaptador LoRA sobre Qwen3-8B, que tiene 8.200 millones de parametros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | Base cuantizada en 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-8B, que soporta multiples idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base Qwen/Qwen3-8B, un transformer denso de 8.200 millones de parámetros con atención de múltiples cabezas. La configuración LoRA utiliza un rango de 64 y un alpha de 128, con dropout de 0,05, aplicado a todas las proyecciones lineales del transformer (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj). El entrenamiento se realizó con Axolotl 0.13.2, sobre una base cuantizada en 4-bit NF4, durante 3 épocas con un tamaño de lote efectivo de 16 (micro-batch de 1 y acumulación de gradientes de 16) y una tasa de aprendizaje de 1e-4 con scheduler coseno.

La característica distintiva es el régimen de entrenamiento "persistente", que implica un runtime de Python persistente donde el estado se mantiene entre turnos del agente. Esto permite que el modelo aprenda a utilizar información acumulada a lo largo de la conversación, en contraste con el régimen "stateless" donde cada turno se procesa de forma independiente. Los datos de entrenamiento consisten en trazas pareadas (paired traces) específicas para este régimen, cuyo procedimiento de filtrado y emparejamiento se detalla en el apéndice del paper asociado, no disponible públicamente en este repositorio.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3-8B, hereda capacidades generales de comprension y generacion de lenguaje, aunque el adaptador esta especializado en la tarea de mochila opaca.
- Razonamiento agéntico multi-paso: el entrenamiento con runtime persistente permite al modelo mantener y utilizar estado entre turnos, lo que es esencial para tareas de planificacion y decision secuencial.
- Optimizacion combinatoria: el ajuste esta orientado a resolver instancias del problema de la mochila con informacion parcial, lo que implica capacidad de explorar soluciones y adaptarse a restricciones cambiantes.
- Conversacion multi-turno: soporta interacciones dialogadas gracias a la arquitectura del modelo base, aunque el adaptador no ha sido evaluado en tareas conversacionales genericas.
- No se dispone de informacion sobre soporte de tool calling, function calling, vision o audio, ya que el adaptador no documenta estas capacidades.

## Casos de uso

- Investigacion en agentes con memoria persistente: el modelo es util para estudiar como el estado acumulado entre turnos afecta al rendimiento en tareas de optimizacion y planificacion, comparandolo con regimenes sin estado.
- Evaluacion de metodos de ajuste fino para agentes: sirve como referencia reproducible para comparar tecnicas de entrenamiento con runtime persistente frente a alternativas stateless, dentro del marco del workshop academico.
- Prototipado de sistemas de decision secuencial: puede emplearse como punto de partida para desarrollar agentes que necesiten resolver problemas de mochila o variantes (asignacion de recursos, seleccion de proyectos) con informacion incompleta.
- Benchmarking de adaptadores LoRA: al estar publicado con configuracion hiperparametrica completa, permite reproducir experimentos y medir el impacto del rango LoRA, el dropout y la cuantizacion 4-bit en tareas agénticas.
- Educacion en optimizacion combinatoria: como ejemplo de aplicacion de LLMs a problemas NP-hard, puede utilizarse en cursos de aprendizaje automatico para ilustrar limitaciones y posibilidades de los modelos de lenguaje en entornos estructurados.
- Analisis de robustez de agentes: dado el regimen persistente, es adecuado para estudiar la propagacion de errores a lo largo de la conversacion y el efecto de la memoria en la calidad final de la solucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento, comparativas con otros modelos ni evaluaciones en tareas estandar como MMLU, HumanEval o GSM8K. La unica referencia es la tarea especifica "Opaque Knapsack" para la que fue entrenado, pero sin datos cuantitativos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre Qwen3-8B, la carga en memoria depende de la cuantizacion del modelo base. Con el base en 4-bit NF4, se requieren aproximadamente 6-8 GB de VRAM para inferencia en secuencias de hasta 16K tokens. Si se usa el base en precision completa (fp16), la VRAM necesaria asciende a unos 16-18 GB.
- GPU recomendadas: el adaptador puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 (24 GB) o en GPUs profesionales como A10G, A100 (40 GB) y H100. Para secuencias largas con base fp16, se recomienda al menos 24 GB de VRAM.
- Compatibilidad con consumer GPU: si, cabe en GPUs de consumo con 12 GB o mas si se cuantiza el base a 4-bit u 8-bit. El adaptador en si es muy ligero (menos de 1 GB).
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `transformers` y `peft`. Tambien es compatible con vLLM (si se fusiona el adaptador con el base), llama.cpp (si se convierte a GGUF) y Ollama (mediante importacion de modelos PEFT). No se han probado oficialmente estas opciones.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, Qwen3-8B en 4-bit suele generar entre 20 y 40 tokens por segundo en una RTX 4090, pero el adaptador no altera significativamente la velocidad de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para tareas de mochila agéntica con regimen persistente). El repositorio menciona que existen otros cinco adaptadores (tres semillas x dos regimenes), pero no se proporcionan enlaces ni datos de rendimiento. No disponible.

## Limitaciones y advertencias

- Liberacion anonima para revision academica: el modelo se publica sin identificacion del autor ni citacion del paper, lo que limita la trazabilidad y la verificacion de la metodologia.
- Licencia no disponible: no se especifica la licencia del adaptador, lo que impide conocer las restricciones de uso comercial o modificacion. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, por lo que no se puede evaluar su calidad general ni comparar con otros modelos.
- Especializacion limitada: el adaptador esta entrenado exclusivamente para la tarea de mochila opaca en regimen persistente; su uso en otras tareas puede degradar el rendimiento respecto al modelo base.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar soluciones plausibles pero incorrectas, especialmente en problemas combinatorios donde la verificacion de optimalidad es compleja.
- Sesgos del modelo base: Qwen3-8B puede presentar sesgos socioculturales y linguisticos heredados de sus datos de entrenamiento, que no han sido mitigados por el adaptador.
- Documentacion insuficiente: no se detallan los datos de entrenamiento completos, el procedimiento de filtrado de trazas ni los criterios de evaluacion, lo que dificulta la reproducibilidad externa.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-persistent-seed1337
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio similar (posible duplicado): https://huggingface.co/TieuDaoChanNhan/qwen3-8b-persistent-knapsack-lora-seed1337
- Repositorio oficial de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Ficha tecnica de Qwen3-8B-Instruct (NVIDIA): https://developer.nvidia.com/downloads/assets/ace/model_card/qwen3-8b-instruct.pdf
