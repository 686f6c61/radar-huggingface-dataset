# Sizhe-Chen/Qwen3.6-27B-Instruct-MetaSecAlign

## Resumen

Qwen3.6-27B-Instruct-MetaSecAlign es un ajuste fino del modelo multimodal Qwen3.6-27B de Alibaba, desarrollado por Sizhe Chen, Arman Zharmagambetov, David Wagner y Chuan Guo como checkpoint de referencia (baseline) del estudio SecPO. Su proposito es defender el modelo frente a ataques de inyeccion de prompts (prompt injection), el riesgo de seguridad mas citado para agentes basados en LLM, mediante optimizacion de preferencias (DPO) sobre inyecciones simuladas estaticas. No incorpora entrenamiento adversarial, por lo que representa el punto de partida frente al cual se mide la propuesta SecPO.

El modelo conserva la arquitectura y capacidades del Qwen3.6-27B original (procesamiento de imagen y texto, generacion de texto, razonamiento, codigo y tool calling), con 27.356.728.560 parametros y pesos en safetensors. Se entrena y evalua con el modo de razonamiento desactivado (`enable_thinking=False`); para inferencia con modo thinking existe un checkpoint hermano, Qwen3.6-27B-Thinking-SecOPD.

Su relevancia actual radica en que cuantifica el compromiso entre utilidad y robustez: frente al modelo sin defender, mantiene casi toda la utilidad en ciencia, matematicas e instrucciones, pero su tasa de exito de ataque (ASR) bajo inyecciones adaptativas sigue siendo muy alta, lo que lo convierte en una referencia util para investigacion en seguridad de agentes y para comparar tecnicas de defensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag `qwen3_5`, familia Qwen3.6 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer multimodal de la familia Qwen3.6 que procesa entradas de imagen y texto (`pipeline_tag: image-text-to-text`). Sobre esa base se aplica un ajuste fino con perdida DPO estandar sobre 19.157 pares de preferencia construidos a partir de ejemplos de Cleaned-Alpaca con un campo de datos de entrada e inyecciones simuladas estaticas. No se emplea entrenamiento adversarial ni sintesis de ataques fuertes, a diferencia de la variante SecPO.

La innovacion metodologica asociada (Meta-SecAlign, paper arXiv:2507.02735) consiste en dos elementos: posicion de inyeccion aleatoria durante el entrenamiento para evitar aprendizaje de atajos y uso de respuestas autogeneradas como etiquetas de alta calidad en distribucion. El checkpoint aqui descrito es la linea base de ese metodo, entrenado con DPO y sin el pipeline de entrenamiento adversarial que introduce SecPO (arXiv:2610.41998). El entrenamiento y la evaluacion se realizan con el modo thinking desactivado.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto (entrada multimodal image-text-to-text).
- Razonamiento cientifico y matematico (evaluado en MMLU-Pro, GPQA Diamond, GSM8K y Minerva Math).
- Seguimiento de instrucciones (evaluado en AlpacaEval2).
- Tool calling y flujos agenticos (evaluado en AgentDojo, InjecAgent, WASP y SEP).
- Defensa frente a inyeccion de prompts en datos no confiables (correo, documentos, webs), objeto principal del ajuste.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se documentan otros idiomas.
- Modo thinking: no soportado en este checkpoint; requiere `enable_thinking=False`.

## Casos de uso

- Agentes con navegacion web o lectura de documentos no confiables: el modelo esta ajustado para resistir instrucciones inyectadas en el contenido que procesa, lo que lo hace adecuado para pipelines donde el agente lee correos, PDFs o paginas y actua sobre ellos.
- Evaluacion comparativa de defensas: sirve como baseline reproducible para medir la mejora de tecnicas como SecPO o entrenamiento adversarial sobre los mismos benchmarks (AgentDojo, InjecAgent, WASP, SEP).
- Investigacion en seguridad de LLM: permite estudiar la relacion entre perdida DPO, posicion de inyeccion y robustez frente a ataques estaticos y adaptativos (GCG).
- Asistentes con tool calling en entornos controlados: al conservar la utilidad del modelo base en tareas agenticas, puede desplegarse en flujos de automatizacion donde se requiere invocar funciones externas con entradas potencialmente contaminadas.
- Razonamiento cientifico y matematico asistido: con MMLU-Pro del 83,9% y GSM8K del 97,0%, es util para tutoria, resolucion de problemas y generacion de explicaciones tecnicas.
- Generacion y revision de codigo en pipelines: hereda las capacidades del Qwen3.6-27B base para tareas de programacion, aunque no se publican resultados especificos de HumanEval en la informacion disponible.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre contenido de capturas, formularios o scans, con la cautela de que el ajuste de seguridad se entreno sobre texto.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo thinking desactivado; mayor es mejor):

| Capacidad | Benchmark | Sin defender | Meta-SecAlign (este modelo) | SecPO |
|---|---|---:|---:|---:|
| Ciencia | MMLU-Pro | 84,8% | 83,9% | 84,6% |
| Ciencia | GPQA Diamond | 81,3% | 79,3% | 80,8% |
| Matematicas | GSM8K | 97,3% | 97,0% | 96,4% |
| Matematicas | Minerva Math | 96,1% | 94,8% | 95,8% |
| Instrucciones | AlpacaEval2 | 80,6% | 81,6% | 82,9% |

En seguridad, el paper SecPO reporta que Meta-SecAlign sufre tasas de exito de ataque proximas al 100% bajo inyecciones adaptativas, y que en AgentDojo con el ataque AttackerMovesSecond alcanza un ASR@800 del 78,8%, frente al 8,8% de SecPO con entrenamiento adversarial. No se publican en la informacion disponible resultados de HumanEval ni de otros benchmarks de codigo para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 27.356 millones de parametros, en FP16 requiere aproximadamente 55 GB solo para pesos, mas overhead de KV cache y activaciones.
- En cuantizacion de 8 bits cabria en torno a 28-30 GB; en 4 bits, en torno a 14-16 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 80 GB, H100 80 GB o multi-GPU para FP16; una RTX 4090 (24 GB) solo seria viable con cuantizacion agresiva (4 bits) y contexto reducido.
- Despliegue: transformers (libreria declarada); compatible con endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Instruct-MetaSecAlign (este) | 27,36 B | no disponible | Defensa anti prompt injection con DPO estatico | Apache 2.0 | Hugging Face |
| Qwen3.6-27B-Instruct-SecPO | 27,36 B | no disponible | Defensa con perdida SecPO + entrenamiento adversarial | Apache 2.0 | Hugging Face |
| Qwen3.6-27B (sin defender) | 27,36 B | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct-MetaSecAlign | 8 B | no disponible | Misma defensa en modelo menor | no disponible | Hugging Face |

El checkpoint SecPO reduce el ASR de AgentDojo del 78,8% al 8,8% manteniendo utilidad similar en nueve benchmarks, por lo que es la alternativa directa cuando la robustez es prioritaria. El modelo sin defender ofrece mayor utilidad marginal (MMLU-Pro 84,8% frente a 83,9%) pero sin proteccion. La variante Llama-3.1-8B permite el mismo estudio con menores requisitos de hardware.

## Limitaciones y advertencias

- Robustez limitada: al no usar entrenamiento adversarial, el ASR bajo inyecciones adaptativas puede acercarse al 100%, segun el paper SecPO.
- Entrenado sobre inyecciones simuladas estaticas; puede no generalizar a ataques novedosos o adaptativos.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- El ajuste de seguridad se realizo sobre texto (Cleaned-Alpaca); no se especifica cobertura de ataques inyectados en imagenes pese a ser un modelo multimodal.
- Modo thinking desactivado por diseno; para razonamiento extendido debe usarse el checkpoint Thinking-SecOPD.
- Riesgo de alucinacion inherente al modelo base; no se publican evaluaciones de factualidad especificas.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, sujeto a las condiciones del modelo base Qwen3.6-27B.
- No debe considerarse una defensa completa para produccion sin capas adicionales de validacion de entradas y permisos de herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-MetaSecAlign
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Checkpoint SecPO: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO
- Checkpoint Thinking SecOPD: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD
- Variante Llama-3.1-8B Meta-SecAlign: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign
- Paper Meta-SecAlign: https://arxiv.org/abs/2507.02735
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Codigo: https://github.com/Sizhe-Chen/SecPO
- Cleaned-Alpaca: https://github.com/gururise/AlpacaDataCleaned
- Web del autor: https://sizhe-chen.github.io/
- Perfil de Arman Zharmagambetov: https://arman-z.github.io/
- Perfil de David Wagner: https://people.eecs.berkeley.edu/~daw
- Perfil de Chuan Guo: https://sites.google.com/view/chuanguo
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
