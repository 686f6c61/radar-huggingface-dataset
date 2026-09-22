# Shawnno/qwen2.5-3b-interview-dpo-lora

# Qwen2.5-3B-Instruct interview DPO LoRA (Shawnno)

## Resumen

Shawnno/qwen2.5-3b-interview-dpo-lora es un adapter LoRA de PEFT publicado por el usuario Shawnno sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No es un modelo completo, sino un conjunto de pesos de adaptacion de 0,1 GB que se carga sobre la base para modificar su estilo de respuesta. Su objetivo es muy concreto: que las respuestas se parezcan a una contestacion oral en una entrevista tecnica, es decir, breves, profesionales, coloquiales, de aproximadamente 150-300 caracteres y con un cierre natural.

El adapter se entreno en dos fases encadenadas con LLaMA-Factory: primero un ajuste supervisado (SFT) y despues un DPO con perdida sigmoide sobre 805 pares de preferencia emparejados por longitud. Segun la model card, el repositorio ya contiene los pesos del SFT, de modo que cargarlo directamente sobre el modelo base limpio reproduce el efecto SFT+DPO completo; no debe apilarse con el adapter SFT del mismo autor.

Su relevancia es la de un artefacto de investigacion aplicada: demuestra que un ajuste de preferencias muy pequeno (101 pasos, 1 epoch, r=8) corrige defectos concretos de estilo, como los finales truncados y la repeticion excesiva de n-gramas, sin necesidad de reentrenar el modelo base. No obstante, el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, no incluye benchmarks estandar y esta documentado unicamente en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (PEFT) sobre un transformer decoder-only; el modelo base es Qwen2.5-3B-Instruct. Target de LoRA en todas las capas lineales |
| Parametros totales | No disponible para el adapter. Modelo base: aproximadamente 3.000 millones de parametros (Qwen2.5-3B-Instruct) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | 32.768 tokens segun la documentacion del modelo base Qwen2.5-3B-Instruct; la model card del adapter no especifica contexto propio y un adapter LoRA no lo modifica |
| Tipos de cuantizacion | Carga de referencia en 4-bit NF4 con double quant de bitsandbytes (QLoRA). El adapter se distribuye en precision completa en safetensors. No se publican versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | No disponible. La model card, el prompt de ejemplo y la terminologia usada estan en chino, lo que sugiere un entrenamiento centrado en ese idioma |
| Licencia | Apache 2.0 para el adapter. Se aplica tambien la licencia del modelo base |
| Formato de pesos | safetensors (pesos de adapter PEFT/LoRA). Tamano del repositorio: 0,1 GB |
| Configuracion LoRA | r=8, alpha=16, dropout=0 |
| Hiperparametros de DPO | lr=1e-5, scheduler cosine, 1 epoch, 101 pasos, batch 1 x acumulacion 8 |
| Framework de entrenamiento | LLaMA-Factory con DPO sigmoide |
| Versiones de referencia | PEFT 0.18.1, Transformers 5.8.0, PyTorch 2.11.0+cu128, Datasets 4.0.0 |

## Arquitectura y entrenamiento

El adapter se construye sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3.000 millones de parametros con atencion de consultas agrupadas (GQA) y RoPE. El ajuste no altera la topologia del modelo: se anaden matrices de bajo rango (r=8, alpha=16, dropout=0) en todas las capas lineales, tanto de atencion como de MLP. El entrenamiento parte de una QLoRA en 4 bits NF4 gestionada por LLaMA-Factory.

El pipeline tiene dos etapas. La primera es un SFT cuyo resultado se publica por separado como Shawnno/qwen2.5-3b-interview-sft-lora. La segunda, documentada en este repositorio, es un DPO con perdida sigmoide sobre 805 pares de preferencia construidos con una restriccion explicita de emparejamiento por longitud (max_len_ratio <= 1.3), pensada para eliminar el sesgo de "cuanto mas largo, mejor". El entrenamiento fue de un solo epoch y 101 pasos, con train_loss final de 0,205 y una accuracy de recompensas de 0,99. Segun el autor, la innovacion principal no esta en la arquitectura sino en la ingenieria del dataset de preferencias: pares de igual longitud mas un objetivo explicito de cierre natural, lo que permitio pasar de 82,8% a 100% de respuestas con final natural y reducir la repeticion de 5-gramas fuertes del 25,0% al 10,9% respecto a un DPO anterior. El proceso completo, incluida la construccion de preferencias y la correccion de OOM, se describe en el repositorio kinjazA/RL.

## Capacidades

- Generacion de texto conversacional en formato de respuesta oral de entrevista: registro coloquial pero profesional, con cierre natural de la intervencion.
- Ajuste fino del control de longitud: la model card fija el objetivo en 150-300 caracteres y mide la mediana real en 443 caracteres, con un 84,4% de respuestas por debajo de 550 caracteres.
- Razonamiento y explicacion de conceptos tecnicos, tal como muestra el ejemplo de la model card ("explica el sesgo y la varianza en aprendizaje automatico").
- Reduccion de redundancia: la tasa de repeticion de 5-gramas fuertes se situa en el 10,9%.
- Formato de chat: usa la plantilla de conversacion de Qwen2.5 mediante `apply_chat_template`.
- No hay evidencia de soporte de tool calling, function calling ni flujos de agente especificos del adapter; las capacidades del modelo base en ese terreno no se documentan en la informacion disponible.
- No se documentan capacidades de vision, audio, thinking mode ni modo de razonamiento extendido.
- Capacidades multilingues: no disponibles; la evidencia apunta a un uso principal en chino.

## Casos de uso

- Simulador de entrevistas tecnicas: el adapter esta entrenado especificamente para responder como un candidato en una entrevista oral, con respuestas de longitud acotada y cierre natural, lo que permite usarlo como interlocutor sintetico en sesiones de practica multi-turno.
- Preparacion de candidatos: generar respuestas modelo sobre un temario tecnico (machine learning, estadistica, programacion) y usarlas como referencia de estilo y estructura, no solo de contenido.
- Generacion de bancos de preguntas y respuestas para plataformas de RRHH: su tono coloquial y su longitud controlada facilitan producir material listo para publicar sin recortes manuales.
- Chatbot de orientacion laboral embebido en una aplicacion: al ser un adapter de 0,1 GB sobre una base de 3B, puede servirse con un consumo de VRAM bajo y desplegarse en una unica GPU de gama media.
- Investigacion sobre DPO y control de longitud: el repositorio documenta pares de preferencia emparejados por longitud y compara metricas antes y despues del DPO, por lo que sirve como caso de estudio reproducible de sesgo de longitud en ajuste por preferencias.
- Punto de partida para dominios verticales: el adapter SFT+DPO puede reutilizarse como inicializacion para ajustes posteriores en otros dominios de entrevista (legal, sanidad, ingenieria) con presupuestos de computo reducidos.
- Evaluacion comparativa de estilo: la bateria de 64 preguntas con decodificacion greedy y las metricas de final natural y repeticion de n-gramas pueden replicarse para comparar tecnicas de ajuste de preferencias.
- Prototipado local en portatil con GPU de 8 GB: gracias a la carga en 4 bits, es viable iterar sobre prompts y plantillas sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica una evaluacion propia sobre 64 preguntas con decodificacion greedy en un conjunto de test independiente:

| Metrica | SFT | SFT+DPO (este repositorio) |
|---|---|---|
| Mediana de caracteres | 345 | 443 |
| Final natural | 100% | 100% |
| Repeticion de 5-gramas fuertes | 9,4% | 10,9% |
| Proporcion de respuestas <= 550 caracteres | 96,9% | 84,4% |

El autor compara ademas con un DPO previo no publicado en este repositorio, indicando que el final natural paso del 82,8% al 100% y la repeticion de 5-gramas fuertes del 25,0% al 10,9%. No hay comparacion directa con modelos de terceros ni evaluacion humana independiente.

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16/fp16: en torno a 6-7 GB solo para pesos, mas cache KV.
- VRAM estimada en 8 bits: aproximadamente 4 GB de pesos.
- VRAM estimada en 4 bits NF4 (configuracion de la model card): aproximadamente 2,5-3 GB de pesos; con una ventana de contexto moderada cabe en GPUs de 6-8 GB.
- El adapter en si ocupa 0,1 GB de repositorio, por lo que su coste adicional de memoria es despreciable frente al modelo base.
- GPUs recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) para inferencia en 4 bits; A100, H100 o L40S para despliegue en precision completa con contexto largo y concurrencia.
- Si cabe en GPU de consumo: si, en 4 bits cabe incluso en tarjetas de 6-8 GB y en GPUs integradas con memoria unificada mediante llama.cpp.
- Opciones de despliegue: Transformers + PEFT (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI, LLaMA-Factory para servir o continuar el entrenamiento. Para llama.cpp u Ollama seria necesario fusionar el adapter con la base y convertir el modelo resultante a GGUF, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shawnno/qwen2.5-3b-interview-dpo-lora | Adapter sobre base de ~3B | 32.768 tokens (base) | SFT + DPO (LoRA r=8) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | ~3B | 32.768 tokens | Instruct tuning del fabricante | Apache 2.0 | HuggingFace, ampliamente usado |
| Shawnno/qwen2.5-3b-interview-sft-lora | Adapter sobre base de ~3B | 32.768 tokens (base) | Solo SFT (LoRA) | Apache 2.0 | HuggingFace; el autor indica que no debe apilarse con este DPO |
| Otros adapters de entrevista de terceros | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

La diferencia funcional frente a Qwen2.5-3B-Instruct es de estilo y dominio, no de capacidades: el adapter prioriza respuestas cortas y con cierre natural en un contexto de entrevista, a costa de perder la verbosidad y la cobertura general del modelo instruct original. Frente al adapter SFT del mismo autor, el DPO mejora el cierre natural pero alarga las respuestas en torno a 100 caracteres y reduce la proporcion de respuestas por debajo de 550 caracteres del 96,9% al 84,4%.

## Limitaciones y advertencias

- No debe apilarse con Shawnno/qwen2.5-3b-interview-sft-lora: el adapter DPO ya incorpora los pesos del SFT y combinarlos produciria un efecto doble no previsto por el autor.
- Sesgo de dominio muy marcado: esta ajustado para respuestas orales de entrevista. Fuera de ese registro su estilo puede resultar inadecuado para tareas tecnicas que requieran detalle, formato estructurado o longitud larga.
- Datos de entrenamiento muy reducidos: 805 pares de preferencia y 101 pasos de optimizacion. La evidencia de mejora se limita a una evaluacion interna de 64 preguntas, sin validacion independiente ni repeticiones con distintas semillas.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion. Como cualquier modelo de 3B ajustado sobre datos limitados, puede generar afirmaciones tecnicas incorrectas con un registro seguro y convincente.
- El DPO alarga las respuestas: la mediana pasa de 345 a 443 caracteres y la proporcion de respuestas por debajo de 550 caracteres cae del 96,9% al 84,4%. Si el requisito de producto es brevedad estricta, este adapter no lo cumple.
- Repeticion residual: la tasa de 5-gramas fuertes es del 10,9%, no nula. En generaciones largas conviene aplicar penalizacion por repeticion o corte por longitud.
- Idioma: no se declaran idiomas soportados y toda la documentacion y los ejemplos estan en chino. El comportamiento en castellano no esta verificado.
- Sin soporte declarado de tool calling ni de flujos de agente, lo que limita su integracion en pipelines que dependan de llamadas a funciones.
- Licencia: el adapter es Apache 2.0, pero el uso comercial debe verificar tambien los terminos del modelo base Qwen2.5-3B-Instruct, que es el que aporta la practica totalidad de los pesos.
- Madurez del repositorio: 0 descargas y 0 likes, sin issues ni discusion publica. Las fechas de creacion y actualizacion indicadas (2026-09-22) no coinciden con el calendario habitual de publicacion y conviene verificarlas antes de citar el modelo.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces obtenidos corresponden a fichas de seguridad quimica de acido valproico y no aportan informacion tecnica util.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shawnno/qwen2.5-3b-interview-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adapter SFT previo del mismo autor: https://huggingface.co/Shawnno/qwen2.5-3b-interview-sft-lora
- Repositorio del proyecto con el detalle del entrenamiento DPO: https://github.com/kinjazA/RL
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a fichas de seguridad de reactivos de laboratorio y no guardan relacion con el modelo.
