# mario-rc/emotional-rlaif-ppo-llama-3.2-3b-instruct

## Resumen

Emotional RLAIF PPO Llama-3.2-3B-Instruct es un adaptador LoRA/PEFT publicado por el usuario mario-rc sobre el modelo base meta-llama/Llama-3.2-3B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion que debe cargarse sobre el modelo base mediante la libreria PEFT. El adaptador se ha alineado con Proximal Policy Optimization (PPO) dentro de un pipeline de RLAIF (Reinforcement Learning from AI Feedback) orientado a generar respuestas conversacionales con carga emocional.

El objetivo del proyecto es investigar como las tecnicas de alineacion por refuerzo modifican el estilo emocional de un modelo de instrucciones pequeno (3 000 millones de parametros). El entrenamiento se realizo con LLaMA-Factory sobre el dataset mario-rc/aif-emotional-generation, usando los dialogos para SFT y PPO y las anotaciones de preferencia del subconjunto aif_annotations para alinear el modelo de recompensa. La plantilla de prompt empleada es la estandar `llama3`.

Es relevante para desarrolladores e investigadores porque forma parte de una familia de adaptadores publicados por el mismo autor (Gemma 2, Gemma 4, GLM-4, Llama 3, Llama 3.2 y Mistral) que permite comparar PPO frente a DPO sobre bases distintas manteniendo el mismo dataset y metodologia. Al ser un adaptador de 0,1 GB, el coste de almacenamiento y de despliegue es minimo, aunque requiere descargar el modelo base de 3B. El repositorio acumula 58 descargas y 0 likes desde su creacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA/PEFT |
| Parametros totales | 3 000 millones en el modelo base; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens heredados de meta-llama/Llama-3.2-3B-Instruct; no se especifica en la model card del adaptador |
| Tipos de cuantizacion | Adaptador publicado en safetensors de PEFT; cuantizaciones del modelo base (8 bits, 4 bits, GGUF, AWQ, GPTQ) no documentadas en la model card |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, `library_name: peft`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion agrupada por consultas (GQA), embeddings rotatorios (RoPE) y activacion SwiGLU. Sobre ella se entrena un adaptador LoRA de bajo rango, lo que permite reutilizar los pesos base congelados y almacenar unicamente las matrices de adaptacion. El repositorio ocupa 0,1 GB, coherente con un adaptador y no con un modelo completo. La plantilla de prompt utilizada durante el entrenamiento es `llama3`.

El proceso de alineacion combina dos fases documentadas: aprendizaje supervisado (SFT) sobre los dialogos de mario-rc/aif-emotional-generation/dialogues y optimizacion con PPO sobre esos mismos dialogos, empleando las preferencias de mario-rc/aif-emotional-generation/aif_annotations para el modelo de recompensa. Todo el pipeline se ejecuto con LLaMA-Factory, tal y como se indica en la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, el rango e hiperparametros del LoRA, ni el tamano del modelo de recompensa empleado. Se trata de una innovacion metodologica (RLAIF con PPO para rasgos emocionales) mas que de una innovacion arquitectonica.

## Capacidades

- Generacion de texto conversacional en ingles con un estilo de respuesta orientado a la expresividad y la carga emocional.
- Alineacion emocional mediante refuerzo: el modelo ha sido optimizado con PPO para preferir respuestas coherentes con las preferencias anotadas del dataset.
- Modo instruct heredado de Llama-3.2-3B-Instruct: seguimiento de instrucciones y dialogos multi-turno.
- Capacidades de razonamiento, matematicas y generacion de codigo basicas, limitadas por el tamano de 3B del modelo base.
- Soporte de tool calling y function calling heredado de la familia Llama 3.2 Instruct; no verificado especificamente para este adaptador.
- Capacidades multilingues del base (8 idiomas declarados por Meta), aunque la model card restringe el adaptador a ingles.
- Despliegue como adaptador intercambiable sobre el modelo base, lo que permite compararlo con otros adaptadores del mismo autor sin cambiar de infraestructura.
- Sin capacidades de vision ni de audio.

## Casos de uso

- Investigacion en alineacion emocional: comparar este adaptador PPO contra el equivalente DPO (emotional-rlaif-dpo-llama-3.2-3b-instruct) sobre el mismo base y dataset para medir el efecto del algoritmo de refuerzo en el tono de las respuestas.
- Generacion de datos sinteticos de dialogo: producir conversaciones con matiz emocional controlado para entrenar o aumentar datasets de sistemas de acompanamiento conversacional.
- Prototipado de asistentes de bienestar emocional: construir un chatbot de acompanamiento con 3 000 millones de parametros que puede ejecutarse en una sola GPU de consumo durante la fase de validacion de producto.
- Evaluacion de seguridad y sesgos: analizar si el entrenamiento con PPO sobre preferencias emocionales incrementa conductas de complacencia (sycophancy) o respuestas excesivamente empaticas sin contenido informativo.
- Experimentos academicos de RLAIF a bajo coste: al ser un adaptador de 0,1 GB sobre un base de 3B, permite reproducir ciclos completos de SFT + PPO + RM en una unica GPU de 24 GB.
- Base para fine-tuning posterior: partir de un modelo ya alineado emocionalmente y aplicar un LoRA adicional especifico de dominio (por ejemplo, soporte en salud mental o educacion) sin reentrenar el modelo completo.
- Asistentes conversacionales de contexto largo: aprovechar los 128 000 tokens del base para mantener hilos de conversacion extensos donde el historial emocional importa, siempre que se valide la degradacion del adaptador a esa longitud.
- Demostraciones y docencia: mostrar en un taller practico como se carga un adaptador PEFT, se fusiona con el base y se sirve con vLLM o transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara un unico entry (`ppo-llama-3.2-3b-instruct`) con la lista de resultados vacia, y no se han facilitado metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineacion emocional.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (3B) y no estan confirmadas por el autor:

- VRAM para inferencia con el modelo base en bf16/fp16: aproximadamente 6,5-7 GB solo de pesos, 8-10 GB contando cache KV con contextos moderados.
- VRAM con cuantizacion de 8 bits: aproximadamente 4 GB. Con cuantizacion de 4 bits: aproximadamente 2,5-3 GB.
- Nota sobre contexto: a 128 000 tokens la cache KV crece de forma muy significativa y puede superar varias decenas de GB en bf16; para contextos largos es necesario usar cuantizacion de la cache, atencion con ventana o FlashAttention.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 24 GB. Cabe en practicamente cualquier GPU consumer moderna de 8 GB o mas si se cuantiza.
- GPU de datacenter: A100 40/80 GB, H100, L40S. Ampliamente sobredimensionadas para un modelo de 3B, salvo si se busca maximo throughput por GPU.
- Despliegue: transformers + PEFT para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA para servir varias variantes a la vez; TGI con LoRA; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponible. Como referencia cualitativa, un 3B cuantizado a 4 bits en una GPU consumer ofrece latencias interactivas, pero no se han publicado mediciones para este adaptador.
- Entrenamiento o ajuste adicional del adaptador: el autor no especifica el hardware utilizado; un ciclo de PPO sobre un 3B con LLaMA-Factory es viable en una GPU de 24 GB con cuantizacion.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Metodo de alineacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| emotional-rlaif-ppo-llama-3.2-3b-instruct (este) | meta-llama/Llama-3.2-3B-Instruct | 3B | PPO | 128 000 tokens (heredado del base) | llama3.2 | Adaptador PEFT, 58 descargas |
| emotional-rlaif-dpo-llama-3.2-3b-instruct | meta-llama/Llama-3.2-3B-Instruct | 3B | DPO | 128 000 tokens (heredado del base) | llama3.2 | Adaptador PEFT, mismo autor |
| emotional-rlaif-ppo-llama-3.2-1b-instruct | meta-llama/Llama-3.2-1B-Instruct | 1B | PPO | no indicado en la informacion disponible | llama3.2 | Adaptador PEFT, mismo autor |
| emotional-rlaif-ppo-gemma-2-2b-it | google/gemma-2-2b-it | 2B | PPO | no indicado en la informacion disponible | Gemma (no indicada en la informacion disponible) | Adaptador PEFT, mismo autor |
| meta-llama/Llama-3.2-3B-Instruct (base sin alinear) | - | 3B | RLHF/DPO de Meta | 128 000 tokens | llama3.2 | Pesos completos en safetensors |

Las diferencias de rendimiento entre estas variantes no se pueden establecer: ninguna de ellas publica resultados de benchmarks en la informacion disponible. La comparacion relevante es metodologica: mismo dataset y mismo marco de entrenamiento (LLaMA-Factory), con PPO o DPO como unica variable diferencial dentro de cada par de modelos.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar meta-llama/Llama-3.2-3B-Instruct y cargarlo con PEFT; sin el base no es utilizable.
- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que no hay evidencia objetiva de mejora frente al modelo base o frente a la variante DPO.
- La model card declara unicamente ingles como idioma soportado; el comportamiento en castellano u otros idiomas no esta validado y previsiblemente degradara.
- Riesgo de alucinacion inherente al modelo base de 3B, no mitigado por el entrenamiento con PPO.
- El entrenamiento con preferencias emocionales puede favorecer respuestas complacientes, excesivamente empaticas o poco criticas, un riesgo conocido en pipelines RLAIF.
- Sesgos: no se documenta ninguna evaluacion de sesgos de genero, raza, religion o edad; el base Llama 3.2 hereda los sesgos de sus datos de entrenamiento.
- Licencia Llama 3.2 Community License: permite uso comercial con condiciones (clausula de 700 millones de usuarios mensuales, politica de uso aceptable, obligacion de atribucion "Built with Llama" y de nombrar la licencia). Es responsabilidad del usuario revisar el texto completo.
- La model card indica uso previsto para investigacion y experimentacion; no se declara validacion para produccion ni para entornos sensibles.
- Los datos de preferencia son anotaciones de un unico dataset, lo que limita la generalizacion del criterio emocional aprendido.
- El autor no documenta hiperparametros, configuracion de PPO, rango del LoRA ni proceso de seleccion de checkpoints, lo que dificulta la reproducibilidad.
- Al fusionar el adaptador con el base para exportar a GGUF, se pierde la posibilidad de intercambiar adaptadores en caliente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-3b-instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/sml-emotional-rlaif
- Variante DPO equivalente: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct
- Variante PPO sobre Llama-3.2-1B-Instruct: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct
- Variante PPO sobre Gemma 2 2B IT: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-2b-it
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Paper de PPO (Proximal Policy Optimization): https://arxiv.org/abs/1707.06347
