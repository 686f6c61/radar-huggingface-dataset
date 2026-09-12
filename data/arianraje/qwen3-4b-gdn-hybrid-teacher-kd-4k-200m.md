# arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-200m

## Resumen

El modelo `arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-200m` es un checkpoint de investigación publicado por el usuario arianraje. Se trata de un ejercicio de destilación de conocimiento (KD) sobre una arquitectura híbrida: parte del modelo base `Qwen/Qwen3-4B` y lo convierte en un transformer con MLP densas y atención híbrida que combina capas Gated DeltaNet (GDN, atención lineal) con capas de atención completa. La implementación se materializa en la clase `Qwen3NextForCausalLM` de Transformers.

El problema que aborda es experimental: comparar metodologías de destilación, en concreto destilación *off-policy* con forward-KL sobre vocabulario completo frente al profesor Qwen3-4B, frente a una alternativa de *on-policy distillation* (OPD) con KL inverso sobre muestras del propio estudiante. El checkpoint corresponde al snapshot final de una planificación WSD (warmup-stable-decay) tras 200.130.245 tokens de pérdida nominales (paso 1378), con un límite estático de traza de entrenamiento de 4096 tokens y sobre una mezcla de prompts de OpenThoughts, Dolly y RUG.

Es relevante ahora porque toca dos ejes activos en el ecosistema open source: las arquitecturas híbridas de atención lineal (familia Gated DeltaNet / Mamba-like) aplicadas a modelos pequeños densos, y la reproducibilidad de recetas de destilación con presupuestos de tokens declarados y comparaciones emparejadas. El propio autor advierte de que las evaluaciones son pequeñas y solo permiten rankings descriptivos, y el checkpoint resulta peor que la referencia OPD emparejada en AIME24/25. El modelo tiene 0 descargas y 0 likes en el momento de la consulta y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3NextForCausalLM` con MLP densas y atencion hibrida: capas Gated DeltaNet (GDN) + capas de atencion completa |
| Parametros totales | 4.546.819.904 (4,55 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; la evaluacion AIME uso un limite de generacion de 32.768 tokens y el entrenamiento un limite de traza de 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor publica pesos en safetensors; no documenta GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB, pesos de inferencia en precision completa/16 bits) |
| Libreria y version de referencia | Transformers 4.57.3 y Flash Linear Attention 0.5.1 |
| Modelo base | Qwen/Qwen3-4B y arianraje/qwen3-4b-gdn-hybrid-stage2b-kd |
| Pipeline | text-generation |
| Paso de entrenamiento del snapshot | 1378 |
| Tokens de perdida del snapshot | 200.130.245 (nominal 200M) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3NextForCausalLM` con MLP densas y atención híbrida GDN/atención completa. Es decir, no se trata de un MoE: el autor mantiene capas feed-forward densas y sustituye parte del mecanismo de atención por Gated DeltaNet, una formulación de atención lineal con estado recurrente y compuertas. El nombre del modelo e incluye "gdn-hybrid" para reflejar esa mezcla. El entrenamiento y la evaluación se realizaron con Transformers 4.57.3 y Flash Linear Attention 0.5.1.

El entrenamiento es destilación de conocimiento *off-policy* con forward-KL sobre el vocabulario completo contra el profesor Qwen3-4B, sobre la mezcla de prompts de la etapa 3 (OpenThoughts / Dolly / RUG), partiendo del checkpoint de la etapa 2b (`qwen3-4b-gdn-hybrid-stage2b-kd`). El texto supervisado procede de muestras generadas por el profesor Qwen3-4B. El snapshot corresponde al final de una planificación WSD en 200.130.245 tokens de pérdida nominales. El propio autor señala que las comparaciones con la variante OPD están confundidas: cambian la dirección de la KL (forward frente a inversa), el origen y horizonte de la traza, y la exposición efectiva a tokens RUG, además de no coincidir en tiempo de reloj ni en paso de optimizador. No se especifican en la información disponible el número total de tokens de entrenamiento previos, la composición cuantitativa del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en modo base convensacional, heredada de la familia Qwen3.
- Razonamiento con modo thinking: la evaluacion AIME24/25 se ejecuto con "thinking enabled", lo que implica soporte de plantilla de chat con trazas de razonamiento.
- Resolucion de problemas matematicos de competicion (AIME), con resultados medidos de 14,2% y 16,2% de pass@1.
- Capacidad de seguir instrucciones y mantener conversacion multi-turno, segun los tags `conversational` del repositorio.
- Generacion de codigo: no documentada explicitamente en la informacion disponible; el profesor Qwen3-4B la posee, pero no hay evaluacion publicada para este checkpoint.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking habilita cadenas de razonamiento, pero no hay validacion de uso agentico.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).
- Capacidades especiales: inferencia con capas lineales Gated DeltaNet, lo que reduce el coste de atencion a secuencias largas; requiere el shim de registro de Qwen3-Next en vLLM para capas densas y embeddings atados.

## Casos de uso

- Investigacion en destilacion de conocimiento: el checkpoint sirve como punto de comparacion reproducible frente a la variante OPD con el mismo presupuesto nominal de 200M tokens, util para estudiar el efecto de forward-KL off-policy frente a KL inverso on-policy.
- Estudio de arquitecturas hibridas Gated DeltaNet: permite medir en un modelo de 4,55B parametros el comportamiento de la mezcla de atencion lineal y completa, y validar el soporte de Flash Linear Attention en un stack concreto.
- Banco de pruebas de eficiencia de inferencia: al ser un modelo denso pequeno con capas lineales, es adecuado para medir latencia y consumo de memoria frente a un transformer de atencion completa del mismo orden de parametros.
- Evaluacion de pipelines vLLM con arquitecturas no estandar: el propio autor indica que se necesita un shim de registro de Qwen3-Next, por lo que el modelo es util para validar integraciones y parches de despliegue.
- Generacion de texto conversacional en prototipos academicos: con licencia Apache-2.0 y pesos safetensors, se puede desplegar en entornos de investigacion sin restricciones de uso comercial declaradas.
- Reproduccion de recetas WSD: el checkpoint es un snapshot final de una planificacion warmup-stable-decay con recuento de tokens declarado, lo que permite auditar la curva de aprendizaje y el sobretiro de tokens por paso completo.
- Analisis de fallos en razonamiento matematico: al publicarse resultados AIME24/25 con 30 problemas por ano y 8 muestras por problema, sirve para estudiar varianza y sesgos de evaluacion en modelos pequenos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son las evaluaciones AIME del propio autor, con modo thinking habilitado, 30 problemas por ano, 8 muestras por problema y un limite de generacion de 32.768 tokens. Las puntuaciones son pass@1 empirico/no sesgado.

| Modelo | AIME24 pass@1 | AIME25 pass@1 |
|---|---:|---:|
| Este checkpoint (teacher-KD, 4k, 200M) | 14,2% | 16,2% |
| OPD 200M (`pinkskin/qwen3-4b-gdn-wsd-ladder`, revision `ae6b72a3`) | 23,3% | 18,8% |

El autor advierte explicitamente de que estas evaluaciones son pequenas y solo permiten rankings descriptivos, no afirmaciones de significacion estadistica. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 4,55B parametros y del tamano de repo de 9,1 GB): aproximadamente 9-10 GB en FP16/BF16, unos 5-6 GB en cuantizacion de 8 bits y unos 3 GB en cuantizacion de 4 bits, mas el overhead de cache KV y del estado recurrente de las capas GDN. Estas cifras son estimaciones de calculo, no medidas publicadas por el autor.
- GPU recomendadas: no indicadas por el autor. Por tamano, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberian alojar el modelo en FP16 sin cuantizar; GPU de datacenter tipo A100 40/80 GB o H100 80 GB no son necesarias por capacidad, salvo para lotes grandes o secuencias muy largas.
- Compatibilidad con GPU de consumo: probable en tarjetas de 8-12 GB si se aplica cuantizacion; no confirmado por el autor, que no publica pesos cuantizados.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` y `AutoTokenizer` usando el ID del repositorio. Para vLLM se requiere el shim de registro de Qwen3-Next que cubre capas densas y embeddings atados. No hay soporte documentado para llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Dependencias de entorno: Transformers 4.57.3 y Flash Linear Attention 0.5.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME24 / AIME25 pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (teacher-KD, 4k, 200M) | 4,55B | no disponible (limite de generacion evaluado: 32.768 tokens) | 14,2% / 16,2% | apache-2.0 | HuggingFace, 0 descargas |
| OPD 200M (`pinkskin/qwen3-4b-gdn-wsd-ladder/wsd-flat-200M`, rev. `ae6b72a3`) | no disponible | no disponible | 23,3% / 18,8% | no disponible | HuggingFace |
| Qwen/Qwen3-4B (profesor y modelo base) | aproximadamente 4B segun el nombre del modelo; no confirmado en la informacion disponible | no disponible | no disponible en esta informacion | no disponible en esta informacion | HuggingFace |
| `arianraje/qwen3-4b-gdn-hybrid-stage2b-kd` (checkpoint predecesor) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

El autor senala que la comparacion con OPD esta emparejada en presupuesto nominal de tokens de perdida y en punto final WSD, pero no en tiempo de reloj ni en paso de optimizador, y que la direccion de la KL, el origen y horizonte de la traza y la exposicion efectiva a tokens RUG quedan confundidos.

## Limitaciones y advertencias

- Rendimiento inferior a la referencia OPD emparejada en AIME24 (14,2% frente a 23,3%) y ligeramente inferior en AIME25 (16,2% frente a 18,8%).
- Las evaluaciones publicadas son muy pequenas (30 problemas por ano, 8 muestras por problema) y el propio autor indica que no permiten afirmaciones de significacion estadistica.
- El techo de capacidad esta acotado por el profesor: al ser destilacion de Qwen3-4B, no cabe esperar capacidades por encima del profesor.
- Sesgos conocidos: no documentados en la informacion disponible; al no informarse idiomas ni composicion del dataset, no es posible evaluar sesgos linguisticos o culturales.
- Riesgo de alucinacion: no cuantificado por el autor; es un modelo de generacion de texto sin mecanismos declarados de verificacion.
- Limitaciones de contexto e idioma: el campo de idiomas esta vacio y la longitud de contexto no se declara; solo se conocen el limite de traza de entrenamiento (4096 tokens) y el limite de generacion de la evaluacion (32.768 tokens).
- Limitaciones de despliegue: requiere un shim de registro de Qwen3-Next en vLLM y una version concreta de Flash Linear Attention; no hay pesos cuantizados publicados ni soporte confirmado en llama.cpp, Ollama o TGI.
- Estado del repositorio: 0 descargas y 0 likes, sin validacion externa conocida; no existen resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.
- Licencia: Apache-2.0 para este checkpoint, lo que en principio permite uso comercial; conviene verificar las condiciones del modelo base Qwen/Qwen3-4B antes de un despliegue en produccion.
- Los datos de entrenamiento y el estado del optimizador no se publican: solo se incluyen pesos de inferencia, tokenizer, metadatos del snapshot, seis informes de evaluacion y el archivo `provenance.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-200m
- Modelo base (profesor): https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint predecesor (etapa 2b): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2b-kd
- Referencia OPD 200M: https://huggingface.co/pinkskin/qwen3-4b-gdn-wsd-ladder/tree/ae6b72a357d167fb459dfeda3bded4941decdf41/wsd-flat-200M
- Revision concreta de la referencia OPD: `ae6b72a357d167fb459dfeda3bded4941decdf41`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web proporcionados.
