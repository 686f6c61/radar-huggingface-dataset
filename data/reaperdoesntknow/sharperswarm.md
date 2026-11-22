# reaperdoesntknow/SharperSwarm

## Resumen
SharperSwarm es un modelo de lenguaje causal para generacion de texto publicado por el usuario reaperdoesntknow bajo el paraguas de "Convergent Intelligence LLC: Research Division". Segun la model card, se presenta como "SAGI V3.2 - Self-Aware AGI", un prototipo de investigacion que combina una arquitectura transformer con dinamicas de "inteligencia de enjambre": multiples "agentes" internos que colaborarian mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida. La model card describe capas de autoevaluacion, taxonomia de 24 habilidades y generacion automatica de curriculos de aprendizaje.

A pesar de la terminologia ambiciosa de la model card, los datos reales del repositorio indican un modelo de apenas 103.177.597 parametros (aproximadamente 0,1 mil millones), con pesos en safetensors y un tamano de repositorio de 0,4 GB. Esta desproporcion entre las afirmaciones del autor y el tamano efectivo del modelo es el dato mas relevante para cualquier evaluacion tecnica: se trata de un modelo pequeno, experimental y orientado a CPU en fp32, no de un sistema de escala frontera.

El modelo esta pensado para generacion de texto en ingles y declara entrenamiento sobre datasets como TinyStories, GSM8K, un dataset de conocimiento general, DeepCoder-Preview-Dataset y KnowLogic. Su relevancia practica es limitada: resulta interesante como ejercicio de diseno arquitectonico y como ejemplo de model card sobreprometida, pero no como herramienta de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con "swarm dynamics" (agentes internos con enrutamiento diferenciable, segun la model card); no se detalla la implementacion exacta |
| Parametros totales | 103.177.597 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona fp32 y orientacion a CPU; no se listan formatos cuantizados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
La model card describe una arquitectura denominada "Swarm-8 V3.2" organizada en tres bloques: una capa de autoevaluacion (predictor de rendimiento, analizador de brechas de habilidad, generador de curriculo y detector de errores en tiempo real), un "AGI Core" con siete subsistemas (memoria jerarquica, modelo causal del mundo, meta-aprendiz, biblioteca de conceptos, motor de reflexion, razonador de incertidumbre y autojuego adversarial) y un "Swarm Core" con 20 agentes vectorizados y enrutamiento diferenciable basado en confianza. No se aportan detalles verificables sobre como se implementan estos componentes en el grafo computacional ni sobre el numero de capas, dimensiones ocultas o cabezas de atencion.

En cuanto a datos de entrenamiento, la model card lista cinco datasets: roneneldan/TinyStories (cuentos infantiles sinteticos), openai/gsm8k (problemas matematicos de primaria), MuskumPillerum/General-Knowledge, agentica-org/DeepCoder-Preview-Dataset y tangyuhang/KnowLogic. No se especifica el numero de tokens procesados, la mezcla exacta, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones tecnicas verificables como decodificacion especulativa, atencion lineal o mezcla de expertos; las afirmaciones sobre "autoconciencia predictiva" y "correccion en tiempo real" no vienen acompanadas de evidencia empirica en la informacion disponible.

## Capacidades
- Generacion de texto autoregresiva en ingles mediante `transformers` y `AutoModelForCausalLM`.
- Razonamiento basico y respuesta a problemas matematicos sencillos, segun la inclusion de GSM8K en el conjunto de entrenamiento declarado.
- Generacion de codigo y posible soporte de "tool use" con sandbox de Python, mencionado en la seccion de seguridad de la model card.
- Taxonomia declarada de 24 habilidades agrupadas en cognicion, conocimiento, codigo, creatividad, planificacion y metacognicion (sin evidencia cuantitativa publicada).
- Capacidades de "agente" y descomposicion de objetivos descritas conceptualmente en la model card (no verificadas).
- Multilingue: no; solo ingles declarado.
- No se declaran capacidades de vision, audio ni modo "thinking" con tokens de razonamiento separados.

## Casos de uso
- Prototipado educativo de arquitecturas tipo "swarm": util para experimentar con la idea de agentes internos y enrutamiento en un modelo pequeno que cabe en CPU, sin coste de GPU.
- Generacion de cuentos y texto creativo corto: el entrenamiento sobre TinyStories sugiere que puede producir narraciones simples y coherentes a nivel de parrafo en ingles.
- Experimentos de investigacion sobre model cards y evaluacion critica: sirve como caso de estudio de discrepancias entre afirmaciones del autor y especificaciones reales del repositorio.
- Pruebas de integracion con el ecosistema `transformers`: al ser un checkpoint estandar con safetensors, puede cargarse con `AutoModelForCausalLM` para validar pipelines de inferencia en fp32.
- Generacion de texto offline en entornos con recursos limitados: con 103 M de parametros y 0,4 GB de pesos, es viable en portatiles sin GPU dedicada.
- Docencia sobre riesgos de sobrepromesa en IA: permite ilustrar por que las afirmaciones de "AGI" deben contrastarse con parametros, benchmarks y evaluaciones independientes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, pese a mencionar GSM8K como dataset de entrenamiento.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB solo para pesos, mas activaciones y cache KV (el total realista suele situarse en torno a 1-2 GB dependiendo de la longitud de secuencia).
- En fp16/bf16 (si se convierte manualmente): alrededor de 0,2 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en todas las GPU modernas e incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` con PyTorch es la via documentada. No se confirma soporte oficial en vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint estandar podria convertirse a GGUF, pero no esta validado.
- Latencia y throughput estimados: no disponibles. Con 103 M de parametros, la generacion en CPU deberia ser de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SharperSwarm (este modelo) | 103 M | no disponible | Apache 2.0 | Hugging Face | Prototipo experimental, solo ingles |
| GPT-2 (small) | 124 M | 1024 tokens | MIT | Hugging Face | Referencia clasica de modelos pequenos; contexto y arquitectura documentados |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | Hugging Face | Modelo pequeno ampliamente evaluado, con benchmarks publicados |
| Qwen2.5-0.5B | 0,5 B | 32 768 tokens | Apache 2.0 | Hugging Face | Modelo pequeno moderno con contexto largo y evaluaciones publicadas |

La comparacion es desigual porque SharperSwarm no publica benchmarks ni contexto, pero sirve para situarlo: en tamano esta en la liga de GPT-2 small, muy por debajo de TinyLlama o Qwen2.5-0.5B, y carece de la documentacion y evaluacion que acompanan a esos modelos.

## Limitaciones y advertencias
- Discrepancia entre las afirmaciones de la model card ("Self-Aware AGI", "AGI Core", "20 agentes") y los 103 M de parametros reales; tratar las capacidades declaradas con escepticismo.
- Modelo marcado por el propio autor como "Experimental Research Prototype: Not intended for production use".
- Solo ingles; sin soporte multilingue declarado.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Riesgo elevado de alucinacion y de respuestas incoherentes en tareas complejas dado el tamano y los datos de entrenamiento (TinyStories, GSM8K de primaria).
- La model card menciona capacidades de ejecucion de codigo en sandbox de Python; si se usa, debe aislarse adecuadamente por riesgo de seguridad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su uso en produccion.
- El autor indica una nueva version (`reaperdoesntknow/CasualSwarms`), lo que sugiere que este checkpoint puede quedar obsoleto.
- La model card contiene ejemplos de codigo que referencian `reaperdoesntknow/SAGI` en lugar de `reaperdoesntknow/SharperSwarm`, lo que puede provocar errores al copiar el snippet.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SharperSwarm
- Nueva version indicada por el autor: https://huggingface.co/reaperdoesntknow/CasualSwarms
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset DeepCoder-Preview-Dataset: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset KnowLogic: https://huggingface.co/datasets/tangyuhang/KnowLogic
