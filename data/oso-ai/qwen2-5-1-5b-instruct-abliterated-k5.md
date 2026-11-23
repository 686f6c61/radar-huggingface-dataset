# OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5

## Resumen

OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5 es un artefacto de investigacion derivado de Qwen/Qwen2.5-1.5B-Instruct, el modelo instructivo de 1.500 millones de parametros de la familia Qwen2.5 de Alibaba. El autor, OSO-AI, aplica una tecnica de "abliteracion" o ablacion del subespacio de rechazo: en lugar de proyectar una unica direccion de activacion con fuerza 2.0 (como hacia su predecesor abliterated-s2), identifica mediante PCA las cinco direcciones principales del subespacio de rechazo por capa y las proyecta fuera de las matrices `o_proj` y `down_proj` con fuerza exacta 1.0. El resultado es un modelo que reduce la tasa de rechazo ante peticiones daninas del 97,5% del baseline al 5,0%, sin introducir degeneracion en la salida.

La relevancia tecnica del artefacto es doble. Por un lado, aporta evidencia empirica de que el rechazo en modelos transformer no reside en una sola direccion, sino en un subespacio de aproximadamente cinco dimensiones por capa, lo que matiza el resultado de Arditi et al. (2024) y sugiere que la proyeccion exacta de un subespacio supera a la proyeccion heuristica multiplicada de una unica direccion. Por otro lado, demuestra que la ablacion sobrevive a la cuantizacion a Q4_K_M (986 MB) y mantiene fluidez en llama.cpp.

Se trata de un modelo de investigacion, no de un producto: el propio autor lo declara explicitamente y advierte de que la responsabilidad sobre las salidas recae en el usuario. La licencia Apache 2.0 del modelo base se mantiene, pero el uso comercial en produccion resulta desaconsejable por la ausencia de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 28 bloques |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | safetensors (fp/bf16) y GGUF; verificado Q4_K_M (986 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct: un transformer decoder-only de 28 bloques con atencion por rotacion posicional (RoPE), GQA y capas MLP con proyecciones `gate`/`up`/`down`. El autor no reentrena el modelo; parte de los pesos del instructivo original y aplica una intervencion quirurgica sobre los pesos.

El procedimiento de ablacion consta de cuatro pasos. Primero, se recogen diferencias de activacion entre respuestas de rechazo y de cumplimiento para 40 prompts daninos, cada uno evaluado bajo dos contextos de system prompt distintos, siguiendo el diseno de pares emparejados de Arditi et al. (2024). Segundo, se aplica PCA por capa sobre esas diferencias y se extrae una base ortonormal de las cinco direcciones principales, que explican de media el 70,5% de la varianza. Tercero, se reescriben los pesos de `o_proj` y `down_proj` en las 28 capas mediante `W ← W − V₅V₅ᵀW` con fuerza 1.0. Cuarto, se evalua con un protocolo "guarded" que detecta rechazo por palabras clave y degeneracion por bucles de repeticion, con n=40 y decodificacion greedy.

El hallazgo central es la curva en U del barrido de k: k=1 deja 95% de rechazo, k=2 baja a 55%, k=3 a 18%, k=5 alcanza el optimo con 5% de rechazo y 0% de degeneracion, y a partir de ahi el rechazo vuelve a subir (k=8: 25%; k=12: 35%) mientras la perplejidad se dispara. El autor advierte de que la estructura del subespacio es especifica del modelo: en SmolLM2-1.7B la perplejidad colapsa de 6,24 a 3145 con k≥3.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del instructivo Qwen2.5-1.5B.
- Razonamiento basico y respuesta a instrucciones en el rango de capacidad de un modelo de 1,5B.
- Generacion de codigo y matematicas a nivel de modelo pequeno (no se aportan benchmarks en la informacion disponible).
- Cumplimiento de peticiones que el modelo base rechazaria: 95% de cumplimiento verdadero en el conjunto de evaluacion danino (n=40).
- Resistencia a jailbreaks: la tasa de rechazo bajo 8 intenciones x 8 plantillas cae del 82% del baseline al 7%, con 0% de rechazo en las intenciones genuinamente daninas bajo cualquier plantilla.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (el modelo base lo soporta; la ablacion no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para esta variante.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en interpretabilidad: el modelo sirve como sujeto de estudio para analizar como se representa el rechazo en el espacio de activaciones y para replicar el barrido de k con el script `experiments/subspace.py` del repositorio del autor.
- Estudio comparativo de tecnicas de ablacion: permite contrastar la proyeccion de subespacio PCA (k=5, s=1.0) frente a la proyeccion de una unica direccion con multiplicidad (s=2.0) en las mismas condiciones de evaluacion, con metricas de rechazo, degeneracion, cumplimiento y perplejidad.
- Analisis de robustez de salvaguardas: util para medir la eficacia de mecanismos de rechazo y la facilidad con que se eliminan quirurgicamente, informando el diseno de defensas mas resistentes en modelos de produccion.
- Evaluacion de tecnicas de cuantizacion: al estar verificado en llama.cpp a Q4_K_M, permite estudiar si las intervenciones sobre pesos sobreviven a la cuantizacion y como afecta esta a la fluidez y a la tasa de cumplimiento.
- Pruebas de concepto en entornos controlados de red teaming: para generar respuestas a peticiones que el modelo base bloquearia, siempre dentro de un marco de evaluacion de seguridad autorizado y aislado.
- Docencia y divulgacion sobre alineamiento: como ejemplo didactico de que el rechazo es un fenomeno de subespacio y no de una direccion unica, con datos reproducibles y un repositorio de codigo abierto.
- Generacion de texto sin restricciones en prototipos de investigacion: para explorar el comportamiento del modelo en dominios donde el rechazo del instructivo original resulta un obstaculo, asumiendo la responsabilidad sobre las salidas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (n=40, evaluacion guarded, greedy):

| Metrica | Baseline (Qwen2.5-1.5B-Instruct) | abliterated-s2 (1-dir, s=2) | abliterated-k5 |
|---|---|---|---|
| Rechazo ante prompts daninos | 97,5% | 17,5% | 5,0% |
| Degeneracion ante prompts daninos | 0,0% | 10,0% | 0,0% |
| Cumplimiento verdadero ante prompts daninos | 2,5% | 72,5% | 95,0% |
| Falso rechazo ante prompts benignos | 10,0% | 0,0% | 0,0% |
| Perplejidad (wikitext) | 9,44 | 12,87 | 13,18 |

Barrido de k (rechazo / degeneracion / cumplimiento verdadero @ perplejidad):

| k | Rechazo | Degeneracion | Cumplimiento | Perplejidad |
|---|---|---|---|---|
| 1 | 95% | 0% | 5% | 9,81 |
| 2 | 55% | 5% | 40% | 10,39 |
| 3 | 18% | 2% | 80% | 12,12 |
| 5 | 5% | 0% | 95% | 13,18 |
| 8 | 25% | 0% | 75% | 16,08 |
| 12 | 35% | 0% | 65% | 16,68 |

Evaluacion de jailbreak (8 intenciones x 8 plantillas, clasificador estricto): el rechazo cae del 82% del baseline al 7% en k5 (4 de 64 casos, todos en la intencion mas leve bajo plantillas DAN/autoridad; 0% de rechazo en las intenciones genuinamente daninas bajo cualquier plantilla). El encuadre de ficcion/roleplay ya evade completamente al modelo original (0% de rechazo, sin cirugia).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16/fp16 (1,543B parametros x 2 bytes), mas overhead de KV cache; en Q4_K_M el autor reporta 986 MB de pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060); 6-8 GB para bf16 (RTX 3060, RTX 4060 Ti). Para despliegue en servidor, A100, H100 o L40S ofrecen margen sobrado y mayor throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas en cuantizacion Q4_K_M, y en GPUs de 8 GB en bf16.
- Opciones de despliegue: llama.cpp (verificado en Q4_K_M), Ollama, vLLM, TGI, transformers con safetensors. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (1,5B), se espera decodificacion en tiempo real en GPU consumer y en CPU moderna con llama.cpp, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (n=40) | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5 | 1,54B | no disponible | 5,0% | 13,18 | Apache 2.0 | Hugging Face |
| OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-s2 | 1,54B | no disponible | 17,5% | 12,87 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | no disponible | 97,5% | 9,44 | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B (referencia del autor) | 1,7B | no disponible | no disponible | 6,24 | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la model card. No se dispone de datos de benchmarks estandar para contrastar con otras alternativas de 1,5B (Llama 3.2 1B, Gemma 2 2B, Phi-2) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion, no un producto: el autor lo declara explicitamente y no ofrece garantias de ningun tipo.
- Ausencia de salvaguardas: la tasa de rechazo ante peticiones daninas es del 5% y la de jailbreak del 7%; no debe desplegarse en aplicaciones de cara al publico sin capas de moderacion externas.
- Perplejidad degradada: 13,18 frente a 9,44 del baseline (+39,6%), lo que indica perdida de calidad en la modelizacion del lenguaje respecto al original.
- Estructura del subespacio especifica del modelo: el autor advierte de que portar k=5 a otras arquitecturas puede colapsar el modelo (SmolLM2-1.7B pasa de perplejidad 6,24 a 3145 con k≥3).
- Riesgo de alucinacion: inherente a un modelo de 1,5B; la ablacion no lo mitiga y la perdida de calidad puede agravarlo.
- Idiomas soportados no documentados: se desconoce si la ablacion afecta de forma desigual a distintas lenguas.
- Contexto no confirmado: la model card no especifica la ventana de contexto efectiva tras la intervencion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el caracter de artefacto de investigacion y la ausencia de salvaguardas hacen desaconsejable su explotacion en produccion.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval ni GSM8K que permitan evaluar la calidad general tras la ablacion.
- Sin pipeline declarado ni likes: el modelo tiene 438 descargas y 0 likes en el momento de la consulta, lo que sugiere validacion comunitaria limitada.
- Sesgos: no documentados en la informacion proporcionada; los sesgos del modelo base persisten y la ablacion puede alterar su manifestacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de codigo del autor: https://github.com/OSOSerious/oso-obliterated-models-
- Paper de referencia (Arditi et al. 2024, "Refusal in Language Models Is Mediated by a Single Direction"): no se proporciona URL directa en la informacion disponible; citado en la model card.
- Notebooks de abliteracion de FailSpy (credito del autor): no se proporciona URL directa en la informacion disponible.
