# ReliquaryForge/qwen3-4b-base-dapo-v4

## Resumen

`ReliquaryForge/qwen3-4b-base-dapo-v4` es un fine-tune del modelo base `Qwen/Qwen3-4B` (arquitectura transformer densa de aproximadamente 4.000 millones de parametros) entrenado mediante refuerzo con recompensas verificables (RLVR) utilizando el conjunto de datos DAPO-14k. El nombre del modelo sugiere que es la cuarta iteracion de un proceso de optimizacion de politicas desacopladas (DAPO, por sus siglas en ingles), una familia de tecnicas de RL que ha demostrado eficacia para elicitar capacidades de razonamiento en modelos de lenguaje. El trabajo esta relacionado con el articulo cientifico "Co-rewarding: Stable Self-supervised RL for Eliciting Reasoning in Large Language Models", que presenta el metodo GT-GRPO aplicado sobre el mismo dataset.

El modelo fue publicado por el usuario ReliquaryForge el 18 de agosto de 2026 y acumula 6.701 descargas, aunque sin valoraciones de la comunidad (0 likes). Al tratarse de un modelo base (no instructivo), no incluye plantilla de chat ni alineacion conversacional; su proposito principal es servir como base para experimentacion en metodos de RL, evaluacion de razonamiento y continuacion del entrenamiento. El repositorio ocupa 72,4 GB, un tamano considerablemente mayor de lo esperado para un modelo de 4B en precision BF16 (~8 GB), lo que sugiere la presencia de multiples checkpoints, estados de optimizador u otros artefactos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (heredado de Qwen3-4B-Base; no se especifica modificacion en este fine-tune) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | No especificado en la ficha; el modelo base Qwen3-4B soporta mas de 119 idiomas y dialectos |
| Licencia | No disponible en la ficha de HuggingFace |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B`, un transformer denso de la familia Qwen3 con 4.022 millones de parametros. La arquitectura Qwen3 integra un modo de pensamiento (thinking mode) para razonamiento complejo multi-paso y un modo sin pensamiento (non-thinking mode) para respuestas rapidas, aunque al tratarse de la variante base, estos modos requieren activacion explicita mediante prompting. El fine-tune aplica tecnicas de RLVR, concretamente el metodo GT-GRPO descrito en el articulo "Co-rewarding", utilizando el conjunto de entrenamiento DAPO-14k (14.000 ejemplos disenados para razonamiento verificable). Este enfoque emplea recompensas auto-supervisadas y estables para elicitar razonamiento, evitando la dependencia de modelos de recompensa entrenados externamente. Los detalles exactos del entrenamiento de esta version concreta (v4) no estan documentados en la ficha publica; se desconoce el numero de pasos, hiperparametros y la composicion precisa del dataset utilizado.

## Capacidades

- Razonamiento multi-paso: el entrenamiento con RLVR sobre DAPO-14k esta disenado para mejorar la capacidad del modelo de descomponer problemas complejos en pasos intermedios.
- Generacion de texto generica: al ser un modelo base, mantiene las capacidades linguisticas del Qwen3-4B original, incluyendo generacion de codigo, matematicas y texto multilingue.
- Compatibilidad con verificacion automatica: el entrenamiento con recompensas verificables lo hace adecuado para tareas donde la correccion se puede comprobar de forma programatica (matematicas, codigo, logica formal).
- Sin soporte de tool calling nativo: al ser una variante base sin fine-tune instructivo, no incorpora las capacidades de llamada a funciones del Qwen3-Instruct.
- Sin modo chat: no incluye plantilla de conversacion ni alineacion con preferencias humanas; requiere prompting cuidadoso o fine-tune adicional para uso conversacional.
- Multilingue (heredado): conserva el soporte multilingue del modelo base, aunque no se ha verificado el rendimiento en cada idioma tras el entrenamiento con RL.

## Casos de uso

- Investigacion en metodos de RLVR: el modelo sirve como punto de partida para experimentos academicos que comparen tecnicas de optimizacion de politicas (DAPO, GRPO, PPO) sobre la misma base, permitiendo aislar el efecto del algoritmo de entrenamiento.
- Continuacion del entrenamiento con SFT: al ser un modelo base, se puede aplicar fine-tune supervisado posterior para adaptarlo a dominios especificos (medicina, derecho, finanzas) aprovechando las capacidades de razonamiento ya elicitadas por el RL.
- Evaluacion de razonamiento matematico: su entrenamiento con recompensas verificables lo hace adecuado para benchmarks como GSM8K o MATH, donde las respuestas se pueden validar automaticamente y medir la mejora frente al Qwen3-4B-Base original.
- Generacion de codigo con validacion automatica: el modelo puede integrarse en pipelines donde el codigo generado se compila y ejecuta contra tests unitarios, aprovechando el paradigma de recompensas verificables para mejorar la tasa de exito.
- Desarrollo de agentes de razonamiento encadenado: como base para sistemas que requieren descomponer problemas en sub-tareas, el modelo puede combinarse con frameworks de agentes (LangChain, LlamaIndex) y verificadores externos para tareas de razonamiento logico.
- Comparacion de tecnicas de alineacion: investigadores pueden contrastar este fine-tune DAPO con alternativas como DPO, KTO o GRPO sobre la misma arquitectura base, midiendo diferencias en capacidad de razonamiento, alucinacion y estabilidad.
- Prototipado de aplicaciones de razonamiento: aunque no es un modelo instructivo, con plantillas de prompting adecuadas (por ejemplo, cadenas de pensamiento explicitas) puede utilizarse para prototipar aplicaciones de QA cientifica o resolucion de problemas aritmeticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version (v4) del modelo en la informacion disponible. El articulo "Co-rewarding: Stable Self-supervised RL for Eliciting Reasoning in Large Language Models" presenta resultados para el entrenamiento con GT-GRPO sobre DAPO-14k, pero no se proporcionan numeros concretos en los extractos disponibles ni se confirma que correspondan exactamente a esta iteracion v4. Se recomienda consultar el paper para obtener datos de evaluacion del metodo general y ejecutar benchmarks propios (MMLU, GSM8K, HumanEval, MATH) para validar el rendimiento de este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para los pesos en BF16, mas memoria para la cache KV y activaciones, resultando en un uso total de 10-12 GB en inferencia con contexto de 32K. En FP32, el uso sube a 16-20 GB.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para inferencia comoda en BF16; A10 (24 GB), A100 (40/80 GB) o H100 para entrenamiento o fine-tune adicional.
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs consumer de 12 GB o mas en BF16 (RTX 4070 Ti, 4080, 3090, 4090). Con cuantizacion 4-bit (si se convierte desde safetensors), podria ejecutarse en 6-8 GB.
- Opciones de despliegue: vLLM, TGI, HuggingFace Transformers, llama.cpp (tras conversion a GGUF), Ollama (tras conversion), o TensorRT-LLM.
- Latencia y throughput: no se han publicado mediciones especificas para este checkpoint; como referencia, un modelo denso de 4B en una RTX 4090 con vLLM suele alcanzar un throughput de 100-200 tokens/s en BF16, dependiendo de la longitud de contexto y el tamano de batch.
- Nota sobre el repositorio: el tamano de 72,4 GB es significativamente mayor de lo esperado para un modelo de 4B en BF16 (~8 GB), lo que indica que el repositorio contiene multiples artefactos (posiblemente checkpoints de entrenamiento, estados de optimizador o multiples precisiones). Se recomienda revisar el contenido del repositorio antes de descargar para evitar transferencias innecesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| ReliquaryForge/qwen3-4b-base-dapo-v4 | 4,02 B | 32K | No disponible | safetensors | Fine-tune DAPO sobre Qwen3-4B-Base, v4 |
| Qwen/Qwen3-4B (base) | 4,02 B | 32K | Apache 2.0 | safetensors | Modelo base original, sin RL |
| TMLR-Group-HF/GT-Qwen3-4B-Base-DAPO14k | 4,02 B | 32K | No disponible | safetensors | Fine-tune GT-GRPO con DAPO-14k, asociado al paper "Co-rewarding" |
| Qwen/Qwen3-4B-Instruct | 4,02 B | 32K | Apache 2.0 | safetensors | Version instructiva con chat y tool calling |

La comparativa directa entre las variantes DAPO (ReliquaryForge y TMLR-Group) requiere evaluacion empirica, ya que no se han publicado benchmarks comparativos entre ambas. El modelo base Qwen3-4B y su variante Instruct estan bien documentados y cuentan con resultados publicos en el informe tecnico de Qwen3; las variantes DAPO no disponen de datos de rendimiento publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin alineacion conversacional: no incluye plantilla de chat, sistema de instrucciones ni fine-tune instructivo; su uso directo para aplicaciones conversacionales producira resultados pobres sin prompting cuidadoso o fine-tune adicional.
- Licencia no especificada: la ficha de HuggingFace no indica la licencia del modelo. Aunque el modelo base Qwen3-4B es Apache 2.0, el fine-tune podria tener restricciones adicionales; se recomienda contactar al autor antes de usarlo en produccion comercial.
- Riesgo de alucinacion: al ser un modelo base entrenado con RLVR, puede generar razonamientos plausibles pero incorrectos, especialmente en dominios fuera del ambito de los datos de entrenamiento (matematicas y logica verificable).
- Sesgos no documentados: no se ha publicado informacion sobre evaluaciones de sesgo, toxicidad o seguridad; el entrenamiento con RL puede amplificar ciertos patrones presentes en el dataset DAPO-14k.
- Documentacion insuficiente: la ficha no detalla el proceso de entrenamiento exacto (numero de pasos, hiperparametros, configuracion de recompensas), lo que dificulta la reproducibilidad y la interpretacion de resultados.
- Sin validacion comunitaria: 0 likes y sin papers que referencien especificamente esta version v4; la calidad del checkpoint no esta respaldada por evaluaciones independientes.
- Tamano del repositorio: 72,4 GB para un modelo de 4B sugiere la presencia de multiples artefactos; la descarga puede ser innecesariamente costosa si solo se necesita el checkpoint de inferencia.
- Limitaciones de contexto: aunque el contexto base es de 32K tokens, el entrenamiento con RL podria haber alterado la capacidad de manejar contextos largos; no se ha verificado este aspecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ReliquaryForge/qwen3-4b-base-dapo-v4
- Modelo relacionado (GT-Qwen3-4B-Base-DAPO14k): https://huggingface.co/TMLR-Group-HF/GT-Qwen3-4B-Base-DAPO14k
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Articulo en arXiv (resumen): https://arxiv.org/abs/2505.09388
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
