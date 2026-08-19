# reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF

## Resumen

DualMinded-Qwen3-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo DualMinded-Qwen3-1.7B, desarrollado por Convergent Intelligence LLC (Research Division). Se trata de una variante de la arquitectura DualMind que parte del modelo base Qwen3-1.7B y aplica una destilación topológica de conocimiento (TKD) desde Qwen3-30B-A3B-Thinking, seguida de un ajuste fino supervisado (SFT) con trazas de razonamiento de Claude Opus 4.6 (dataset Opus-4.6-Reasoning-3000x-filtered). El modelo implementa un esquema de razonamiento en tres fases explícitas: `<explore>` (razonamiento no restringido), `<examine>` (autocrítica adversarial) y `<response>` (síntesis limpia), lo que lo diferencia de los modelos de generación directa.

Con aproximadamente 2.030 millones de parámetros, este modelo está orientado a la inferencia local en dispositivos con recursos limitados, ofreciendo cuantizaciones desde F16 hasta Q4_K_M. Su relevancia actual radica en la combinación de un tamaño reducido con un entrenamiento basado en destilación de modelos de gran escala, lo que permite ejecutar razonamiento estructurado en entornos edge sin depender de infraestructura en la nube. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3-1.7B, con esquema de razonamiento DualMind en tres fases (`<explore>`, `<examine>`, `<response>`) |
| Parametros totales | 2.031.739.904 (~2,03 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta hasta 32.000 tokens segun documentacion de Qwen, pero no se confirma para esta variante) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (segun la model card, `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo fuente en safetensors esta disponible en el repositorio base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso con 2.030 millones de parametros. Sobre esta base, Convergent Intelligence aplica un proceso de destilacion en dos etapas. La primera es una destilacion topologica de conocimiento (TKD) desde Qwen3-30B-A3B-Thinking, un modelo MoE de 30B parametros, utilizando datos de razonamiento en fisica (chain-of-thought). La segunda etapa es un ajuste fino supervisado (SFT) con el dataset Opus-4.6-Reasoning-3000x-filtered, que contiene trazas de razonamiento de Claude Opus 4.6. A diferencia de la variante DualMind original (entrenada con LogicInference_OA), DualMinded utiliza directamente la columna `thinking` de Opus como fase `<explore>`, sin divisiones heuristicas, lo que produce transiciones cognitivas mas limpias entre las fases de exploracion, autocrítica y respuesta final.

El entrenamiento se apoya en conceptos matematicos propios denominados "Discrepancy Calculus" y "Topological Knowledge Distillation", documentados en los papers asociados. La cuantizacion GGUF preserva las estructuras de decision aprendidas durante el entrenamiento, ya que los limites estructurales detectados por DISC quedan codificados en los pesos y no dependen de la precision numerica.

## Capacidades

- Razonamiento estructurado en tres fases: exploracion no restringida, autocrítica adversarial y sintesis final, lo que mejora la calidad de respuestas complejas.
- Razonamiento matematico y logico: el entrenamiento con trazas de Opus 4.6 y datos de fisica CoT le permite abordar demostraciones formales y problemas de algebra lineal, calculo y logica.
- Destilacion de conocimiento de modelos grandes: hereda patrones de razonamiento de Qwen3-30B-A3B-Thinking y Claude Opus 4.6, ofreciendo capacidades de modelos mayores en un tamano reducido.
- Generacion de texto en ingles con explicaciones paso a paso.
- Inferencia local eficiente: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU y GPUs de baja capacidad.
- No se especifica soporte para tool calling, function calling, agentes ni capacidades multimodales (vision, audio) en la documentacion disponible.

## Casos de uso

- Asistente de estudio para matematicas y fisica: el modelo puede explicar demostraciones (por ejemplo, por que los autovalores de una matriz simetrica real son reales) generando primero una exploracion de ideas, luego una autocrítica de posibles errores y finalmente una respuesta pulida. Su esquema de tres fases es adecuado para material didactico que requiere rigor.
- Generacion de documentacion tecnica con razonamiento explicito: en entornos de desarrollo, puede producir explicaciones de algoritmos o conceptos de ingenieria siguiendo una estructura de exploracion-critica-sintesis, util para wikis internas o guias de referencia.
- Prototipado rapido de chatbots con razonamiento: al ser un modelo pequeno con licencia Apache 2.0, permite crear asistentes conversacionales locales sin coste de API, integrables en aplicaciones de escritorio o web mediante llama.cpp u Ollama.
- Inferencia en dispositivos edge: la cuantizacion Q4_K_M (1,1 GB) permite ejecutar el modelo en Raspberry Pi 5, mini-PCs o portatiles antiguos, habilitando asistentes de razonamiento offline en entornos sin conexion.
- Analisis de problemas logicos y puzzles: su entrenamiento con trazas de razonamiento estructurado lo hace util para resolver acertijos, problemas de programacion competitiva o ejercicios de logica formal, donde la fase `<examine>` ayuda a detectar fallos en el razonamiento inicial.
- Educacion en programacion: puede generar ejemplos de codigo con explicaciones paso a paso, indicando las decisiones de diseno y posibles errores, aprovechando su capacidad de autocrítica para senalar debilidades en las soluciones propuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Se recomienda evaluar el modelo en tareas especificas antes de su uso en produccion.

## Requisitos de hardware

- Tamanos de archivo por cuantizacion: F16 ~3,4 GB, Q8_0 ~1,8 GB, Q5_K_M ~1,3 GB, Q4_K_M ~1,1 GB.
- VRAM estimada para inferencia: para Q8_0 se necesitan al menos 2 GB de VRAM (con margen para contexto y overhead); para Q4_K_M bastan aproximadamente 1,5 GB. En CPU, la RAM requerida es similar al tamano del archivo mas overhead del runtime.
- GPUs recomendadas: cualquier GPU con 2 GB o mas (por ejemplo, GTX 1050, GTX 1650, RTX 3050) puede ejecutar Q4_K_M o Q5_K_M. Para Q8_0 se recomienda al menos 4 GB de VRAM. La cuantizacion F16 requiere unos 4 GB de VRAM y es adecuada para GPUs de 6 GB o mas.
- En consumer GPU: si, cabe en GPUs de gama baja. La variante Q4_K_M esta disenada para CPU y edge.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Tambien puede usarse con bindings de Python como llama-cpp-python.
- Latencia y throughput: no disponibles en la documentacion. Como referencia orientativa, un modelo de 1,7B en Q4_K_M en CPU moderna (8 nucleos) suele generar entre 10 y 20 tokens por segundo, pero este dato no esta confirmado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B (este) | ~2,03 B | No especificado | Transformer denso + fases DualMind | Apache 2.0 | GGUF |
| Qwen3-1.7B (base) | 1,7 B | 32.000 tokens | Transformer denso | Apache 2.0 | safetensors, GGUF |
| DualMind (variante LogicInference) | ~2,03 B | No especificado | Transformer denso + fases DualMind | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,23 B | 128.000 tokens | Transformer denso | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se basa en caracteristicas arquitectonicas y de licencia, ya que no hay datos de rendimiento publicados. DualMinded se diferencia de Qwen3-1.7B por el esquema de razonamiento en tres fases y por el entrenamiento con destilacion de Opus 4.6, mientras que Llama 3.2 1B ofrece un contexto mas largo pero sin el patron de autocrítica explicito.

## Limitaciones y advertencias

- Idioma limitado: la model card indica solo ingles (`language: en`). No se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje pequeno, puede generar afirmaciones incorrectas o inventadas, especialmente en dominios especializados. La fase `<examine>` mitiga parcialmente este riesgo, pero no lo elimina.
- Contexto no confirmado: la longitud de contexto real de esta variante no esta documentada. Aunque el modelo base Qwen3-1.7B soporta 32k tokens, la destilacion y el SFT podrian haber modificado este limite. Se recomienda probar con secuencias cortas y medias antes de asumir ventanas largas.
- Overhead de razonamiento: el esquema de tres fases anade latencia y tokens de salida en comparacion con modelos de generacion directa. Para tareas simples puede ser ineficiente.
- Sin benchmarks publicados: la ausencia de metricas de rendimiento dificulta la comparacion objetiva con alternativas. Cualquier despliegue en produccion debe ir precedido de una evaluacion propia.
- Naturaleza experimental: el modelo proviene de una division de investigacion y puede contener artefactos de entrenamiento o comportamientos inesperados en ciertos dominios.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe atribuir el copyright y mantener el aviso de licencia. No se han identificado restricciones adicionales, aunque el modelo base Qwen3 tambien es Apache 2.0, por lo que no hay conflicto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Modelo fuente (safetensors): https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante DualMind (LogicInference): https://huggingface.co/reaperdoesntknow/DualMind
- GGUF de la variante DualMind: https://huggingface.co/reaperdoesntknow/DualMind-GGUF
- Paper de metodologia (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Coleccion DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Dataset Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Paper "Structure Over Scale" (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Paper "Discrepancy Calculus" (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
