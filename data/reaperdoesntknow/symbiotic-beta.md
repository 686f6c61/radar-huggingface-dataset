# reaperdoesntknow/Symbiotic-Beta

## Resumen

Symbiotic-Beta (publicado internamente como SymLM) es un modelo de lenguaje experimental desarrollado por reaperdoesntknow bajo la marca Convergent Intelligence LLC. Se construye como un fine-tuning del backbone Qwen2.5-0.5B de Alibaba, al que el autor superpone una capa conceptual de "modulos cognitivos simbolicos" (DTE-HDM, M.A.S.R.M, QwenExoCortex y procesadores simbolicos como ThoughtDynamicsLNN o DNAConv). El objetivo declarado es explorar la fusion neuro-simbolica para razonamiento matematico estructurado y memoria de largo plazo.

El modelo se entrena sobre 25.000 ejemplos de MetaMathQA con hiperparametros estandar (AdamW, LR 3e-5, 3 epocas, batch efectivo de 1024). A pesar de la base de 0,5B parametros, el checkpoint publicado en safetensors pesa 35,9 GB y declara 3.569.725.840 parametros totales, lo que sugiere que los modulos adicionales anaden un numero significativo de pesos no presentes en el Qwen original.

Es relevante ahora porque ejemplifica una corriente de modelos pequenos con arquitecturas hibridas neuro-simbolicas orientadas a investigacion, aunque su naturaleza experimental, la ausencia de benchmarks publicados y la falta de alineacion RLHF lo sitúan fuera de cualquier uso en produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) con modulos simbolicos anadidos (DTE-HDM, M.A.S.R.M, QwenExoCortex) |
| Parametros totales | 3.569.725.840 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | afl-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors |
| Tamano del repo | 35,9 GB |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Libreria | transformers 4.51.3 |
| Framework | PyTorch 2.7.0+cu126 |
| Datasets de entrenamiento | meta-math/MetaMathQA, open-thoughts/OpenThoughts2-1M |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only Qwen2ForCausalLM (0,5B parametros) y, segun la model card, anade varios componentes simbolicos: Dynamic Thought Evolution with Helical Encoding and DNA-Inspired Memory (DTE-HDM), Multi-Agent Symbiotic Response Mechanisms (M.A.S.R.M), un proyector QwenExoCortex que mapea estados ocultos a un espacio de fusion simbolica, y procesadores como ThoughtDynamicsLNN, Liquid/Crystalline Processors, Graph Reasoning con DNAConv y un ThoughtMemory rotatorio. La model card no detalla la implementacion concreta de cada modulo ni su coste computacional, y el desajuste entre los 0,5B del backbone y los 3,57B declarados en safetensors no se explica explicitamente.

El entrenamiento se realizo sobre 25.000 ejemplos de MetaMathQA con learning rate 3e-5, batch efectivo de 1024 (16 x 64 de acumulacion), optimizador AdamW con betas (0,9; 0,999), scheduler coseno, 500 pasos de warmup, 3 epocas y precision mixta con Native AMP. No se menciona uso de RLHF, DPO ni ninguna fase de alineacion. El autor declara el checkpoint como "experimental" y lo enmarca en un marco teorico propio denominado Analytic Foundations Theorem (AFT), sin publicacion revisada por pares asociada.

## Capacidades

- Generacion de texto en ingles con enfasis en razonamiento matematico y Q&A simbolico, derivado del fine-tuning sobre MetaMathQA.
- Razonamiento estructurado sobre ecuaciones y logica de inferencia segun la model card.
- Memoria de largo plazo y "replay" de pensamiento mediante el modulo ThoughtMemory y DTE-HDM (segun descripcion del autor, sin validacion externa).
- Modulacion de atencion y coordinacion multi-agente simbolica a traves de M.A.S.R.M (declarado, sin evidencia empirica publicada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado por benchmarks; el autor lo sugiere como caso de investigacion.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en IA neuro-simbolica: sirve como banco de pruebas para estudiar la interaccion entre un backbone transformer congelado y modulos simbolicos anadidos, comparando activaciones y estados ocultos frente al Qwen2.5-0.5B original.
- Experimentos de memoria de largo plazo: el diseno DTE-HDM y ThoughtMemory permite probar hipotesis sobre persistencia de contexto y replay de pensamiento en tareas de razonamiento encadenado.
- Prototipado de asistentes matematicos de bajo coste: con 0,5B de backbone, se puede desplegar en entornos con recursos limitados para generar pasos intermedios de problemas aritmeticos y algebraicos, siempre con verificacion posterior.
- Generacion de datos sinteticos de razonamiento: util para producir trazas de solucion estilo MetaMathQA que luego se filtran y se usan para entrenar modelos mayores.
- Educacion y tutoria automatizada de matematicas basicas: el modelo puede generar explicaciones paso a paso en ingles, adecuado para prototipos de plataformas de aprendizaje con supervision humana.
- Kernel simbolico para agentes reflexivos: el autor lo propone como componente de sistemas de "evolucion de conocimiento" en pipelines de investigacion, no en produccion.

## Benchmarks y rendimiento

La model card declara un model-index con nombre "SymLM" y la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni GSM8K, ni HumanEval, ni comparaciones numericas con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7,1 GB solo para pesos (3,57B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 10-12 GB en una GPU consumer de gama alta.
- En cuantizacion de 8 bits: en torno a 3,6 GB de pesos; en 4 bits: en torno a 1,8 GB, aunque no se publican GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento o evaluacion completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16; RTX 4060 Ti 16 GB como minimo comodo.
- Cabe en GPU consumer: si, en RTX 4090, 3090, 4080 y 4070 Ti Super en fp16; en GPUs de 8 GB requeriria cuantizacion no publicada.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados por el autor y requeririan conversion manual, especialmente por los modulos simbolicos anadidos que pueden no ser compatibles con motores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-Beta (SymLM) | 3,57B (backbone 0,5B) | no disponible | afl-3.0 | Hugging Face, safetensors | Experimental, sin benchmarks, solo ingles |
| Qwen2.5-0.5B (base) | 0,49B | 32.768 tokens (segun Qwen) | Apache 2.0 | Hugging Face, amplia cuantizacion | Modelo base estable, multilingue, con benchmarks publicados |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, GGUF, vLLM | Alternativa directa con mejor rendimiento validado |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face, GGUF | Enfoque en eficiencia para edge, con benchmarks publicados |

La comparacion directa con Qwen2.5-0.5B es la mas informativa: Symbiotic-Beta multiplica por mas de siete el numero de parametros declarados sin publicar mejoras medibles, y pierde el multilingueismo y la compatibilidad de despliegue del original.

## Limitaciones y advertencias

- Entrenamiento limitado a 25.000 ejemplos de MetaMathQA: no hay garantia de generalizacion fuera del dominio matematico.
- Sin RLHF ni alineacion: los outputs no estan ajustados para seguridad ni para seguir instrucciones, y el autor advierte explicitamente de riesgo de alucinacion.
- "Fluidez no implica correccion": el propio autor senala que la fluidez simbolica no garantiza pruebas matematicamente validas; se recomienda verificacion externa.
- No optimizado para generacion abierta: prioriza logica y estructura sobre profundidad conversacional.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas.
- Licencia AFL-3.0: permite uso comercial con condiciones (atribucion, reciprocidad sobre modificaciones); revisar compatibilidad antes de integrar en productos propietarios.
- Compatibilidad de despliegue incierta: los modulos simbolicos anadidos pueden no funcionar en vLLM, llama.cpp u Ollama sin adaptacion, y no se publican cuantizaciones.
- Estado experimental: el autor lo declara "experimental phase", sin benchmarks ni validacion por terceros.
- Desajuste no explicado entre backbone (0,5B) y parametros declarados (3,57B), lo que dificulta estimar coste real de inferencia y entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset OpenThoughts2-1M: https://huggingface.co/datasets/open-thoughts/OpenThoughts2-1M
- Modelos relacionados del autor: https://huggingface.co/reaperdoesntknow/Symbiotic-1B, https://huggingface.co/reaperdoesntknow/Symbiotic-8B, https://huggingface.co/reaperdoesntknow/Symiotic-14B
