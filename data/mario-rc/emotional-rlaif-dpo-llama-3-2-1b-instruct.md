# mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct

## Resumen

Emotional RLAIF DPO Llama-3.2-1B-Instruct es un adaptador LoRA/PEFT entrenado por el usuario mario-rc sobre el modelo base meta-llama/Llama-3.2-1B-Instruct. El adaptador se ha alineado mediante Direct Preference Optimization (DPO) dentro de un pipeline de RLAIF (Reinforcement Learning from AI Feedback) orientado a la generacion de respuestas conversacionales con carga emocional. El entrenamiento se realizo con LLaMA-Factory y la plantilla de prompt `llama3`.

El modelo no es un checkpoint completo, sino un adaptador que debe cargarse sobre el modelo base de Meta mediante PEFT. El autor publica una familia completa de adaptadores equivalentes (variantes PPO y DPO) sobre Gemma 2, Gemma 4, GLM-4, Mistral 7B y Llama 3/3.2, lo que permite comparar metodos de alineamiento emocional a distinta escala manteniendo el mismo pipeline de datos.

Su relevancia es acotada y experimental: se trata de un modelo de 1 000 millones de parametros, solo en ingles, con 48 descargas y ningun resultado de benchmark publicado. Resulta util como banco de pruebas reproducible para investigar alineamiento emocional con DPO y RLAIF en hardware muy modesto, no como modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama-3.2-1B-Instruct) con adaptador LoRA/PEFT |
| Parametros totales | 1B en el modelo base; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama-3.2-1B-Instruct (dato heredado del modelo base; no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | No publicados por el autor. El adaptador se distribuye en safetensors; el modelo fusionado admitiria cuantizaciones estandar de Llama 3.2 (GGUF q4_K_M, q5_K_M, q8_0, AWQ, GPTQ) generadas con herramientas de terceros |
| Idiomas soportados | Ingles (`en`) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, `library_name: peft`) |
| Tamano del repositorio | 0.0 GB |
| Framework de entrenamiento | LLaMA-Factory |
| Plantilla de prompt | `llama3` |
| Dataset de entrenamiento | mario-rc/aif-emotional-generation (subconjunto `dialogues` para SFT, `aif_annotations` para preferencias DPO) |
| Metodo de alineamiento | DPO sobre SFT previo |
| Fecha de creacion / ultima actualizacion | 2026-06-30 / 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Llama-3.2-1B-Instruct, un transformer decoder-only denso de 1 000 millones de parametros desarrollado por Meta. El repositorio no contiene pesos completos: contiene exclusivamente las matrices de bajo rango de un adaptador LoRA entrenado con PEFT, por lo que el tamano del repositorio es practicamente nulo (0.0 GB) y la inferencia exige descargar el modelo base por separado. No se especifican en la model card el rango de LoRA, el valor de alpha, los modulos objetivo ni la tasa de aprendizaje empleados.

El pipeline de entrenamiento descrito por el autor combina dos fases: primero un ajuste supervisado (SFT) sobre el subconjunto `dialogues` del dataset mario-rc/aif-emotional-generation, y despues una optimizacion por preferencias (DPO) sobre el subconjunto `aif_annotations`, que contiene pares de respuestas anotadas en el marco de un flujo RLAIF. No se detallan el volumen de ejemplos, la composicion del dataset, la duracion del entrenamiento ni la existencia de una fase de evaluacion o de un reward model explicito. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Generacion de texto conversacional en ingles con un sesgo declarado hacia respuestas emocionalmente alineadas.
- Dialogo multi-turno: el adaptador conserva la capacidad conversacional del modelo base Instruct, aunque no se documenta su comportamiento mas alla del ambito emocional.
- Alineamiento por DPO: el objetivo del entrenamiento es preferir respuestas con mayor adecuacion emocional frente a alternativas, segun las anotaciones de preferencia del dataset.
- Razonamiento, codigo y matematicas: no evaluados ni documentados para este adaptador; se heredan, sin garantia, del modelo base de 1B.
- Tool calling / function calling: no documentado. El modelo base Llama-3.2-1B-Instruct soporta function calling nativo, pero el autor no verifica que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: no. El autor declara unicamente ingles (`language: en`).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Recuperacion del modelo base para seguir entrenando: el adaptador es reutilizable sobre Llama-3.2-1B-Instruct con PEFT y LLaMA-Factory.

## Casos de uso

- Investigacion en alineamiento emocional: permite reproducir el pipeline DPO/RLAIF del autor sobre un modelo de 1B, comparando la variante DPO con la variante PPO de la misma familia (`emotional-rlaif-ppo-llama-3.2-1b-instruct`) para aislar el efecto del algoritmo de alineamiento.
- Experimentacion academica con recursos limitados: el adaptador se puede cargar y evaluar en una unica GPU de consumo o incluso en CPU, lo que facilita la replicacion de estudios por parte de estudiantes e investigadores sin acceso a clusters.
- Prototipado de asistentes conversacionales con tono empatico: util para validar rapidamente si un tono emocional concreto mejora metricas subjetivas de satisfaccion antes de invertir en un modelo mayor, como la variante de 3B o de 8B de la misma familia.
- Generacion de datos sinteticos de dialogo emocional: el adaptador puede emplearse para producir candidatos de respuesta que despues se filtren y anoten, alimentando nuevas rondas del pipeline RLAIF.
- Evaluacion de tecnicas de preferencia (DPO frente a PPO): el repositorio incluye pares homogeneos de adaptadores sobre siete modelos base distintos, lo que permite estudios comparativos controlados de algoritmos de alineamiento.
- Despliegue local de bajo coste en tareas acotadas: por su tamano, es viable servirlo en una estacion de trabajo para tareas de generacion corta en ingles donde la latencia importe mas que la calidad absoluta.
- Educacion y divulgacion: sirve como ejemplo didactico de como se publica un adaptador LoRA entrenado con LLaMA-Factory, incluyendo la separacion entre repositorio de adaptador y modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara un unico registro (`dpo-llama-3.2-1b-instruct`) con la lista de `results` vacia. No hay datos de MMLU, HellaSwag, GSM8K, HumanEval ni de metricas especificas de alineamiento emocional (por ejemplo, tasas de preferencia del reward model o evaluaciones humanas). Tampoco se han publicado comparaciones cuantitativas entre la variante DPO y la variante PPO sobre el mismo modelo base.

## Requisitos de hardware

- VRAM para inferencia en precision completa (fp16/bf16): aproximadamente 2,5 GB solo para los pesos del modelo de 1B fusionado, mas el KV cache y el overhead del runtime. Estimacion orientativa, no publicada por el autor.
- VRAM en cuantizacion int8: alrededor de 1,3 GB de pesos. Estimacion orientativa.
- VRAM en cuantizacion de 4 bits (GGUF q4_K_M): alrededor de 0,8 GB de pesos. Estimacion orientativa.
- El KV cache crece de forma lineal con la longitud de contexto y puede superar el tamano de los pesos si se explota la ventana completa de 128 000 tokens del modelo base. Para contexto largo conviene reducir el lote o limitar la ventana.
- GPU de consumo: cabe holgadamente en cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 3070, RTX 4070) e incluso en GPUs de 4-6 GB con cuantizacion de 4 bits. Es viable en CPU mediante llama.cpp.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para inferencia; solo tienen sentido para servir lotes grandes o para reentrenar el adaptador con LLaMA-Factory.
- Opciones de despliegue: PEFT + transformers (carga directa del adaptador sobre el modelo base), vLLM con soporte de adaptadores LoRA, TGI, LLaMA-Factory para entrenamiento y reanudacion, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF (esta conversion no la publica el autor).
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Alineamiento | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct | 1B (adaptador LoRA) | DPO | 128 000 tokens (heredado del base) | No publicados | llama3.2 | Publicado en HuggingFace, 48 descargas, 0 likes |
| mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct | 1B (adaptador LoRA) | PPO | 128 000 tokens (heredado del base) | No publicados | llama3.2 | Publicado en HuggingFace |
| mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct | 3B (adaptador LoRA) | DPO | No disponible en la informacion proporcionada | No publicados | llama3.2 | Publicado en HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct | 1B | RLHF/instruccion de Meta | 128 000 tokens | Ampliamente documentados por Meta | llama3.2 | Modelo base oficial, muy extendido |

En la informacion disponible no hay datos de rendimiento que permitan establecer cual de estas variantes es mejor; la comparacion se limita a parametros, metodo de alineamiento, licencia y disponibilidad. La ventaja practica del modelo descrito frente al base es su especializacion declarada en respuestas emocionales; su desventaja es que exige cargar el modelo base y que no aporta ninguna mejora verificada en tareas generales.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: si no se carga sobre meta-llama/Llama-3.2-1B-Instruct con PEFT, no funciona. Requiere descargar aparte el modelo base y aceptar su licencia.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni metricas del reward model. No hay evidencia publicada de que el alineamiento emocional mejore la calidad de las respuestas.
- Solo ingles: el autor declara exclusivamente `en`. Cualquier uso en castellano u otros idiomas queda fuera del ambito previsto y degradara la calidad.
- Tamano reducido: con 1 000 millones de parametros, la tasa de alucinacion en conocimiento factual es alta y la capacidad de razonamiento y de codigo es limitada. No es apto para tareas que exijan precision factual.
- Sesgos: no documentados. Al entrenarse sobre un dataset de dialogo emocional generado y anotado por IA, puede heredar los sesgos de ese corpus y de los modelos que lo generaron, ademas de los sesgos propios del modelo base.
- Riesgo de respuestas excesivamente complacientes o empaticas en detrimento de la exactitud informativa, un efecto tipico del ajuste por preferencias sobre datos emocionales.
- Repositorio sin mantenimiento aparente: 48 descargas, 0 likes y una model card escueta. No hay garantia de soporte ni de correccion de errores.
- Licencia Llama 3.2 Community License: impone obligaciones adicionales para uso comercial (entre ellas, la denominacion "Built with Llama" y politicas de uso aceptable de Meta). Es imprescindible revisar el texto completo antes de cualquier despliegue comercial.
- Uso previsto declarado: investigacion y experimentacion. El autor no lo recomienda para produccion.
- No se documentan cuantizaciones oficiales, versiones GGUF ni pesos fusionados, por lo que el despliegue en entornos tipo Ollama o llama.cpp exige trabajo adicional de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/sml-emotional-rlaif
- Variante PPO sobre el mismo modelo base: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct
- Variante DPO sobre Llama-3.2-3B-Instruct: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct
- Variantes sobre Gemma 2, Gemma 4, GLM-4 y Mistral: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-2b-it, https://huggingface.co/mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3, https://huggingface.co/mario-rc/emotional-rlaif-dpo-glm-4-9b-chat-1m
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Nota sobre la busqueda web: los resultados recuperados en la busqueda no guardan ninguna relacion con el modelo (corresponden a contenidos sobre el personaje de videojuegos Mario), por lo que no se incluye ningun enlace adicional procedente de esa busqueda.
