# nurmix/Mistral-7B-Liberated

## Resumen

Mistral-7B-Liberated es una version "abliterated" (sin mecanismos de rechazo) del modelo mistralai/Mistral-7B-Instruct-v0.3, publicada por el usuario nurmix en Hugging Face. El autor ha eliminado el comportamiento de rechazo del modelo original mediante Arbitrary-Rank Ablation (ARA) a traves de la herramienta Heretic v2.0.0, con el objetivo de obtener un modelo que responda a peticiones que el original rechazaria, preservando en la medida de lo posible sus capacidades generales y de razonamiento.

Se trata de un transformer decoder-only denso de 7.248.023.552 parametros (aproximadamente 7,25 mil millones), heredado integramente de Mistral-7B-Instruct-v0.3, por lo que mantiene la arquitectura, el tokenizador y la ventana de contexto del modelo base de Mistral AI. La unica modificacion respecto al original es la ablacion de direcciones de rechazo en el espacio de activaciones, no un reentrenamiento.

Su relevancia es fundamentalmente de investigacion: sirve como caso de estudio de tecnicas de ablacion de rechazo (refusal ablation) y de como afectan al equilibrio entre "censura" y degradacion de capacidades. No es un modelo recomendado para produccion en entornos con requisitos de seguridad, y su uso comercial esta sujeto a la licencia Apache 2.0 heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | safetensors (pesos completos) y GGUF (formato llama.cpp); no se detallan los niveles de cuantizacion disponibles |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral-7B-Instruct-v0.3: un transformer decoder-only denso de 7,25 mil millones de parametros con atencion de tipo sliding window (en el modelo base), sin mezcla de expertos. El modelo no ha sido reentrenado: los pesos originales se han modificado mediante Arbitrary-Rank Ablation (ARA), una tecnica que identifica y elimina del espacio de activaciones las direcciones asociadas al comportamiento de rechazo.

El proceso se ejecuto con Heretic v2.0.0, realizando 100 trials de Optuna con optimizacion multiobjetivo (minimizar la tasa de rechazo y minimizar la divergencia KL respecto al modelo original). El checkpoint seleccionado corresponde al indice 4 de la frontera de Pareto, con un 4 % de rechazos en el conjunto harmful_behaviors (frente a 87/100 del original) y una divergencia KL de 0,025 sobre harmless_alpaca. No se dispone de informacion sobre datos de entrenamiento adicionales, RLHF o DPO, ya que no hubo entrenamiento supervisado en esta adaptacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento general y respuesta a instrucciones, con capacidades preservadas segun la metrica de divergencia KL reportada (0,025).
- Generacion de codigo y matematicas basicas, como capacidad heredada del modelo base (no se documentan evaluaciones especificas en la model card).
- Soporte de tool calling / function calling: no documentado en la model card; depende de las capacidades del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Eliminacion del comportamiento de rechazo: responde a peticiones que el modelo original rechazaria, con una tasa de rechazo del 4 % en el conjunto de evaluacion del autor.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar empiricamente como la ablacion de rechazo afecta a las capacidades y a la distribucion de respuestas, comparando con el modelo base mediante la divergencia KL reportada.
- Evaluacion de tecnicas de ablation: sirve como referencia para validar implementaciones de ARA y Heretic, con una frontera de Pareto documentada (100 trials, indice 4).
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa que aborde temas sensibles que el modelo original rechazaria, en entornos controlados y con supervision humana.
- Analisis de robustez de filtros: uso como modelo "adversario" para probar sistemas de moderacion y clasificadores de contenido en pipelines de investigacion.
- Experimentacion con cuantizacion y despliegue local: al publicarse en GGUF, permite probar inferencia en llama.cpp u Ollama en hardware de consumo y medir el impacto de la cuantizacion en un modelo ablacionado.
- Docencia y divulgacion: demostraciones practicas de que es la ablacion de rechazo, como se mide (tasa de rechazo, KL) y que trade-offs introduce, en cursos de IA y etica.
- Fine-tuning posterior en dominios especificos: al estar bajo Apache 2.0 y en safetensors, puede servir de punto de partida para ajustes supervisados en nichos donde el rechazo del modelo original resulta problematico (siempre con las cautelas legales correspondientes).

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas del proceso de ablacion, no benchmarks estandar de capacidad:

| Metrica | Antes (base) | Despues (Liberated) |
|---|---|---|
| Rechazos en harmful_behaviors | 87 / 100 | 4 / 100 |
| Divergencia KL en harmless_alpaca | 0,0 (referencia) | 0,025 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): aproximadamente 14,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas para fp16: A100, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantizacion GGUF de 4-8 bits.
- Opciones de despliegue: Transformers (safetensors), llama.cpp y Ollama (GGUF); el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face. No se documenta soporte explicito de vLLM o TGI, aunque al ser una arquitectura Mistral estandar es probable que funcionen (no confirmado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Liberated | 7,25 B | no disponible | 4 / 100 | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens (segun modelo base) | 87 / 100 | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.2 | 7,25 B | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face |
| Otras versiones abliterated de Mistral-7B | 7,25 B | variable | no disponible | Apache 2.0 (heredada) | Hugging Face |

La comparativa se limita al modelo base y variantes de la misma familia; no se dispone de datos de benchmarks de capacidad para comparar rendimiento frente a alternativas de mismo tamano.

## Limitaciones y advertencias

- Modelo ablacionado intencionadamente: la seguridad y el entrenamiento de rechazo se han eliminado; puede generar contenido que el modelo original rechazaria, incluido contenido danino, ofensivo o ilegal segun el contexto.
- Riesgo elevado de uso indebido: no debe desplegarse en aplicaciones orientadas al publico sin capas adicionales de moderacion y supervision humana.
- Riesgo de alucinacion: heredado del modelo base; no se documentan evaluaciones de factualidad tras la ablacion.
- Degradacion de capacidades: aunque la divergencia KL es baja (0,025), la ablacion puede afectar a comportamientos sutiles no capturados por la metrica harmless_alpaca.
- Idiomas soportados: no documentados; no se garantiza un rendimiento multilingue uniforme.
- Longitud de contexto: no confirmada en la model card; debe verificarse contra el modelo base antes de usarla en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y su conformidad con la normativa aplicable (por ejemplo, la Ley de Servicios Digitales de la UE o la normativa de proteccion de menores).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-11-11, posterior a la fecha actual en algunos contextos; conviene verificar la integridad y procedencia de los pesos antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nurmix/Mistral-7B-Liberated
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Heretic (herramienta de ablation): https://github.com/p-e-w/heretic
