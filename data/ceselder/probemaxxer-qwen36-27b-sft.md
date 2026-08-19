# ceselder/probemaxxer-qwen36-27b-sft

## Resumen

`probemaxxer-qwen36-27b-sft` es un adaptador LoRA (PEFT) publicado por el usuario `ceselder` sobre el modelo base Qwen/Qwen3.6-27B. Se trata de un fine-tuning supervisado (SFT) que busca especializar el modelo denso de 27 000 millones de parámetros de Qwen en tareas de resolución de problemas, como sugiere el nombre "probemaxxer". El adaptador pesa 1,9 GB y se distribuye en formato safetensors, por lo que no incluye los pesos completos del modelo base, sino únicamente los deltas entrenados.

La relevancia de este adaptador radica en que permite ajustar Qwen3.6-27B sin necesidad de un fine-tuning completo, reduciendo costes de cómputo y almacenamiento. El modelo base, lanzado por Alibaba Qwen, es un transformer denso con arquitectura híbrida de atención y soporte multimodal (texto e imagen), además de modos de pensamiento (thinking) y no pensamiento. Sin embargo, la documentación del adaptador es prácticamente inexistente: la model card no aporta detalles sobre el dataset de entrenamiento, hiperparámetros, evaluación ni licencia, lo que limita su uso en entornos de producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.6-27B (transformer denso, hybrid attention/delta) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 1,9 GB; el modelo base tiene 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible (el adaptador es safetensors; el base admite cuantizacion GGUF/AWQ) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.6-27B, un modelo denso de 27 000 millones de parametros con arquitectura híbrida de atención (hybrid attention/delta), segun el blog oficial de Qwen y analisis independientes. El modelo base es multimodal (texto e imagen) y soporta modos de pensamiento explicito (thinking) y no pensamiento, ademas de tool calling y capacidades de agente. El adaptador LoRA se entrena mediante SFT (supervised fine-tuning), pero no se proporcionan detalles sobre el dataset, el numero de tokens, la composicion de los datos ni el regimen de entrenamiento (precision, epocas, etc.). La unica referencia tecnica es la version de PEFT 0.20.0 indicada en los metadatos. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al SFT.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base, incluyendo razonamiento logico y matematico.
- Codigo: el modelo base Qwen3.6-27B destaca en generacion de codigo a nivel "flagship", segun el blog de Qwen, por lo que el adaptador puede conservar o potenciar esta habilidad.
- Multimodal: el base procesa imagenes junto con texto, aunque no se confirma si el adaptador mantiene esta capacidad.
- Tool calling y agentes: el base soporta function calling y flujos de agente multi-paso; el adaptador no documenta cambios al respecto.
- Multilingue: el base cubre multiples idiomas, pero el adaptador no especifica su alcance linguistico.
- Especializacion en problemas: el nombre "probemaxxer" sugiere un enfoque en resolucion de problemas, pero no hay evidencia publica de benchmarks que lo demuestre.

## Casos de uso

- Razonamiento matematico asistido: el adaptador puede emplearse para resolver problemas de matematicas, algebra o calculo, aprovechando el modo thinking del modelo base. Se cargaria como PeftModel sobre Qwen3.6-27B y se le proporcionaria el enunciado en texto.
- Generacion de codigo en entornos de desarrollo: al estar basado en un modelo con alto rendimiento en codigo, el adaptador podria integrarse en IDEs o pipelines de CI/CD para autocompletar funciones o generar tests, siempre que se valide su comportamiento.
- Analisis de documentos tecnicos: con el soporte multimodal del base, el adaptador podria procesar capturas de pantalla o diagramas junto con texto para extraer informacion o resolver cuestiones tecnicas.
- Prototipado de agentes conversacionales: gracias al tool calling del base, el adaptador puede servir como nucleo de un asistente que consulte APIs o bases de conocimiento para responder preguntas complejas.
- Educacion y tutoria: el adaptador podria utilizarse en plataformas de aprendizaje para generar explicaciones paso a paso de problemas, aunque su fiabilidad no esta contrastada.
- Investigacion en fine-tuning eficiente: como ejemplo de adaptacion LoRA sobre un modelo de 27B, resulta util para estudiar tecnicas de PEFT y comparar el impacto del SFT en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para este adaptador concreto. El modelo base Qwen3.6-27B, segun el blog de Qwen, supera a modelos de tamano similar en tareas de codigo agente, pero no se dispone de cifras concretas en el material consultado.

## Requisitos de hardware

- El modelo base Qwen3.6-27B requiere aproximadamente 54 GB de VRAM en precision FP16, por lo que una GPU profesional como A100 (80 GB) o H100 es necesaria para inferencia sin cuantizacion.
- Con cuantizacion de 4 bits (GGUF Q4_K_M), el modelo puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con menor velocidad.
- El adaptador LoRA de 1,9 GB se carga en memoria junto al modelo base, anadiendo un coste minimo de VRAM (menos de 2 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI para el modelo base cuantizado; el adaptador se integra mediante la libreria PEFT de Hugging Face (PeftModel.from_pretrained).
- La latencia y el throughput dependen del hardware y la cuantizacion; en una RTX 4090 con Q4, se pueden esperar decenas de tokens por segundo, pero no hay mediciones publicas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27B | No disponible | Denso, hybrid attention/delta | Apache 2.0 (segun Qwen) | Hugging Face |
| Qwen3.6-35B-A3B | 35B (3B activos) | No disponible | MoE, hybrid attention/delta | Apache 2.0 (segun Qwen) | Hugging Face |
| probemaxxer-qwen36-27b-sft | 27B (adaptador LoRA) | No disponible | LoRA sobre denso | No disponible | Hugging Face |

El adaptador no es directamente comparable con otros modelos completos, ya que depende del base. Frente al Qwen3.6-35B-A3B, el modelo denso de 27B es mas lento en inferencia (segun el analisis de zoliben.com, el MoE es 3-4 veces mas rapido), pero el adaptador LoRA no altera esa caracteristica. No se dispone de datos de rendimiento del adaptador frente a otros fine-tunings similares.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no aporta informacion sobre el dataset, el proceso de entrenamiento ni la evaluacion, lo que impide conocer su comportamiento real.
- Licencia no especificada: no se indica bajo que licencia se distribuye el adaptador, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- Sesgos del modelo base: Qwen3.6-27B puede heredar sesgos de sus datos de entrenamiento; el adaptador no documenta medidas de mitigacion.
- Limitaciones de contexto: al no conocerse la longitud de contexto efectiva del adaptador, no se recomienda su uso con documentos muy largos sin pruebas previas.
- Compatibilidad: el adaptador esta pensado para cargarse con PEFT sobre el base exacto; usarlo con otras versiones o cuantizaciones puede fallar.
- Sin garantias de produccion: al no haber benchmarks ni pruebas independientes, no es aconsejable desplegarlo en entornos criticos sin una validacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ceselder/probemaxxer-qwen36-27b-sft
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Blog oficial de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Analisis comparativo Qwen3.6-35B vs 27B: https://zoliben.com/en/posts/2026-04-23-qwen-36-35b-vs-27b-benchmark-results/
- Otro adaptador del mismo autor: https://huggingface.co/ceselder/skip-lens-qwen36-27b-futurelens-sft-matched
- Adaptador relacionado con RL: https://friendli.ai/models/ceselder/skip-lens-qwen36-27b-futurelens-rl
