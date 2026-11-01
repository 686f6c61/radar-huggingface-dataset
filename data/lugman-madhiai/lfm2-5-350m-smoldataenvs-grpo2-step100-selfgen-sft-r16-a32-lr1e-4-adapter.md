# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100-SelfGen-SFT-r16-a32-lr1e-4-adapter

## Resumen

El modelo `lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100-SelfGen-SFT-r16-a32-lr1e-4-adapter` es un adaptador LoRA (r=16, alpha=32, learning rate 1e-4) publicado por el usuario lugman-madhiai sobre el checkpoint base `lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100`, que a su vez deriva de la familia LFM2.5 de Liquid AI en su variante de 350 millones de parametros. Se trata, por tanto, de un ajuste fino de tercera generacion dentro de una cadena de entrenamiento (GRPO, luego SFT autogenerado) orientado a entornos de datos sinteticos y tareas de agente en ingles.

La relevancia del modelo es fundamentalmente experimental: se publica como adaptador de bajo rango sobre un modelo pequeno (350M), lo que permite reproducir el pipeline de ajuste con recursos minimos y evaluar el efecto de RL (GRPO) seguido de SFT con datos autogenerados en un modelo de bolsillo. No es un modelo de proposito general ni compite con modelos frontera; su interes esta en la trazabilidad del proceso de entrenamiento y en el uso de Unsloth para acelerar el fine-tuning.

La model card es minima y no documenta datos de entrenamiento, composicion del dataset ni resultados de evaluacion. Toda la informacion tecnica disponible procede de los metadatos de HuggingFace y de la convencion de nombres del autor, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid AI), transformer; detalles exactos no disponibles |
| Parametros totales | 350M (modelo base); el adaptador LoRA anade ~pocos millones (r=16, alpha=32) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no documentada) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo LFM2 de 350M parametros, la arquitectura compacta de Liquid AI disenada para inferencia en dispositivo. El nombre del repositorio indica la secuencia de entrenamiento: un primer ajuste con GRPO (Group Relative Policy Optimization) sobre "SmolDataEnvs" hasta el paso 100, seguido de un SFT con datos autogenerados ("SelfGen-SFT") con rango LoRA 16, alpha 32 y learning rate 1e-4. El entrenamiento se realizo con la libreria TRL y se acelero con Unsloth, segun declara la model card.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO adicional ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). La unica innovacion documentada es el uso de Unsloth para un entrenamiento "2x mas rapido", sin cifras verificables.

## Capacidades

- Generacion de texto en ingles sobre la base LFM2.5-350M.
- Ajuste orientado a entornos de datos y tareas de agente (por el nombre "SmolDataEnvs"), aunque no se documenta que capacidades concretas se han reforzado.
- Posible soporte de razonamiento multi-paso derivado del entrenamiento con GRPO, no verificado.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion academica con pipelines GRPO + SFT: el adaptador permite reproducir y estudiar el efecto de RL seguido de SFT autogenerado en un modelo de 350M con una sola GPU consumer.
- Evaluacion de metodologias de ajuste LoRA: al ser un adaptador r=16/alpha=32, sirve como referencia para comparar hiperparametros en modelos pequenos.
- Prototipado rapido de agentes en ingles: el modelo base de 350M cabe en cualquier GPU moderna y permite iterar sobre prompts y flujos de agente sin coste de infraestructura.
- Investigacion sobre datos sinteticos autogenerados: el sufijo "SelfGen-SFT" sugiere un caso de estudio sobre calidad y sesgos de datos generados por el propio modelo.
- Fine-tuning encadenado: sirve como punto de partida para nuevos adaptadores sobre el mismo base, gracias a la licencia Apache 2.0.
- Educacion y demos: util para talleres sobre TRL, Unsloth y HuggingFace en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 350M en fp16 ocupa aproximadamente 0,7 GB de pesos; en 4 bits, unos 0,2 GB. El adaptador LoRA anade una fraccion minima.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), llama.cpp/Ollama si se convierte a GGUF (no verificado), vLLM (compatibilidad no confirmada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (LFM2.5-350M + LoRA) | 350M | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| LFM2.5-350M base (Liquid AI) | 350M | no disponible | no disponible en esta ficha | HuggingFace |
| SmolLM2-360M (HuggingFace) | 360M | 8K (segun model card publica) | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | 500M | 32K (segun model card publica) | Apache 2.0 | HuggingFace |

La comparativa se limita a parametros, licencia y disponibilidad; no hay datos de rendimiento publicados para este adaptador que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, evaluacion ni limitaciones declaradas por el autor.
- Modelo de 350M parametros: capacidad de razonamiento y conocimiento factual muy limitada en comparacion con modelos de 7B o superiores.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo elevado de alucinacion por el tamano reducido y la falta de evaluacion.
- El ajuste con datos autogenerados ("SelfGen") puede amplificar sesgos y errores del propio modelo base.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validacion por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su uso en produccion sin validacion propia.
- El repositorio muestra un tamano de 0.0 GB, lo que puede indicar que los pesos del adaptador no estan completamente subidos o que el calculo de tamano no se ha actualizado.

## Enlaces

- HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100-SelfGen-SFT-r16-a32-lr1e-4-adapter
- Modelo base: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-GRPO2-step100
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Liquid AI (familia LFM2): https://www.liquid.ai/
