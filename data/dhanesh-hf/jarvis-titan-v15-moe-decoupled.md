# dhanesh-hf/Jarvis-Titan-V15-MoE-Decoupled

## Resumen

J.A.R.V.I.S. Titan V15 MoE Decoupled es un modelo de lenguaje de tipo DeepSeekMoE con 14.835.469.845 parámetros totales (14,8B), publicado por el usuario dhanesh-hf en HuggingFace. Se presenta como la version V15, construida sobre el modelo base dhanesh-hf/Jarvis-Titan-V14-MoE-Merged, e incorpora una arquitectura de memoria denominada Tri-Brid, que combina atencion de ventana deslizante, un subespacio de recuperacion de KV y una memoria neural recurrente con aprendizaje en tiempo de inferencia (Titans Neural Memory).

El modelo se distribuye como pesos merged "100% standalone" y su model card describe el hito M4, que fusiona el backbone DeepSeekMoE de 14,8B con un adaptador calibrado Tri-Brid. La innovacion principal declarada es la presencia de siete capas puente de memoria (en los indices 3, 7, 11, 15, 19, 23 y 27) y un mecanismo de enrutado adaptativo MAG-3 que reparte el trafico entre memoria local, memoria de reservorio y memoria neural.

La relevancia del modelo es, a fecha de la informacion disponible, puramente experimental: cuenta con 0 descargas y 0 "likes", no publica benchmarks ni resultados de evaluacion, no declara idiomas soportados y usa una licencia propia (jtrl-v1.0) distinta de las licencias estandar. Ademas, la model card describe el hito M4 mientras que el identificador del repositorio hace referencia a una V15 "Decoupled", lo que introduce ambiguedad sobre que artefacto contiene exactamente el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeekMoE con capas puente de memoria Tri-Brid (SWA + reservorio de KV + Titans Neural Memory) y enrutado MAG-3; requiere codigo personalizado (custom_code) |
| Parametros totales | 14.835.469.845 (14,8B) |
| Parametros activos | no disponible (la model card indica 1 experto compartido + 8 expertos enrutados con enrutado Top-2, pero no publica el recuento de parametros activos) |
| Longitud de contexto | no disponible (la model card solo detalla una ventana de atencion deslizante local de 2048 tokens y un subespacio de recuperacion de KV de dimension 512) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se listan versiones GGUF, GPTQ, AWQ ni otras) |
| Idiomas soportados | no disponible |
| Licencia | jtrl-v1.0 (license: other), con archivo LICENSE en el repositorio |
| Formato de pesos | safetensors (tamano del repositorio: 29,7 GB) |

## Arquitectura y entrenamiento

El backbone es un DeepSeekMoE de 14,8B con un experto compartido y ocho expertos enrutados, con enrutado Top-2 (se activan dos expertos enrutados por token, ademas del compartido). Sobre ese backbone se insertan siete capas puente de memoria Tri-Brid en las posiciones [3, 7, 11, 15, 19, 23, 27]. Cada capa puente organiza tres niveles: Tier 1, atencion de ventana deslizante con W = 2048 y GQA de copia cero; Tier 2, un "salient reservoir" que actua como subespacio exacto de recuperacion de KV con D = 512; y Tier 3, una memoria neural Titans con recurrencia de aprendizaje en tiempo de test acotada por los hiperparametros eta = 1e-3, rho = 1e-4, mu = 0.95 y una cota de norma de Frobenius ||M||_F <= 50,0.

El enrutado se gestiona mediante MAG-3 Adaptive Gating, con una distribucion objetivo declarada de aproximadamente 55% local (L), 25% reservorio (R) y 20% memoria neural (M). La model card insiste en un "100% Zero-Loss Passthrough", es decir, un flujo residual del backbone ininterrumpido para preservar la estabilidad de la generacion autorregresiva. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares; tampoco se detalla si los pesos merged proceden de una fusion de adaptadores (el tag m4-merged apunta en esa direccion) o de un reentrenamiento completo.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Razonamiento declarado como "frontier-reasoning" por el autor, sin evidencia publica de evaluacion que lo respalde.
- Procesamiento de contexto largo mediante la combinacion de ventana deslizante, reservorio de KV y memoria neural recurrente (tag long-context).
- Memoria persistente en tiempo de inferencia: el Tier 3 (Titans Neural Memory) actualiza un estado matricial acotado durante la generacion, lo que en teoria permite retener informacion mas alla de la ventana de atencion.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explicita; solo el tag generico de razonamiento.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales confirmadas: ninguna adicional (no hay vision, audio ni modo "thinking" documentado).

## Casos de uso

- Investigacion sobre arquitecturas MoE: el modelo permite estudiar experimentalmente el enrutado Top-2 sobre 8 expertos con un experto compartido y comparar la distribucion real de activaciones con el objetivo declarado de MAG-3 (55/25/20).
- Experimentacion con memoria en tiempo de test: el Tier 3 aplica reglas de aprendizaje recurrentes con hiperparametros concretos (eta, rho, mu, cota de norma), lo que lo convierte en una plataforma para reproducir y auditar la propuesta Titans Neural Memory en tareas de recall a largo plazo.
- Asistentes conversacionales con memoria de sesion prolongada: la combinacion de SWA de 2048 tokens y memoria recurrente puede usarse en dialogos extensos donde interese mantener informacion de turnos antiguos sin recalcular todo el KV.
- Analisis de documentos largos: para tareas de resumen o extraccion sobre corpus extensos, el stacking de ventana local mas reservorio de recuperacion de 512 dimensiones es el mecanismo previsto por el autor, aunque la longitud de contexto efectiva no esta declarada.
- Base para fine-tuning academico: al ser un modelo de 14,8B con licencia propia y pesos safetensors, puede servir como punto de partida para experimentos de ajuste supervisado en dominios concretos.
- Prototipado de pipelines de generacion con codigo personalizado: util para equipos que quieran integrar una arquitectura no estandar y medir coste de integracion frente a modelos MoE de referencia.
- Docencia y divulgacion tecnica: sirve para ilustrar el diseno de puentes de memoria híbridos (SWA + retrieval + recurrencia) sobre un backbone MoE, comparandolo con arquitecturas densas equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y el repositorio no presenta tablas comparativas con modelos de referencia. Tampoco se documentan mediciones de latencia, throughput ni consumo de memoria en inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 29,7 GB solo de pesos, mas cache de KV y activaciones; en la practica requiere del orden de 34-40 GB segun contexto.
- VRAM estimada en 8 bits: aproximadamente 15 GB, viable en GPU de 24 GB con contexto moderado.
- VRAM estimada en 4 bits: aproximadamente 8-9 GB, pero la compatibilidad real depende de que la arquitectura personalizada pueda cuantizarse (no se ofrecen pesos cuantizados en el repositorio).
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 sin cuantizar; A100 40 GB o RTX 6000 Ada 48 GB al limite; 2x RTX 4090 24 GB en paralelo para BF16.
- GPU de consumo: en 4 bits podria caber en RTX 4090, RTX 3090, RTX 4080 Super y RTX 4070 Ti Super (16 GB) con contexto reducido; en BF16 no cabe en ninguna GPU de consumo de 24 GB.
- Opciones de despliegue: transformers con trust_remote_code=True es la via documentada por el uso de custom_code; vLLM, TGI y SGLang requeririan soporte especifico para la arquitectura (no confirmado). No hay archivos GGUF, por lo que llama.cpp y Ollama no son utilizables sin conversion previa. El tag pallas-tpu sugiere un camino de implementacion en JAX/TPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Jarvis-Titan-V15-MoE-Decoupled | 14,8B | no disponible | no disponible | jtrl-v1.0 (propietaria) | no disponible |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32k | DeepSeek Model License | publicados por el autor original |
| Qwen2.5-14B (denso) | 14,7B | 14,7B (denso) | 32k (128k con YaRN) | Apache 2.0 | publicados por el autor original |
| Mixtral 8x7B | 46,7B | 12,9B | 32k | Apache 2.0 | publicados por el autor original |

La comparacion de rendimiento no es posible porque Jarvis-Titan-V15 no publica evaluaciones. A nivel de diseno, DeepSeek-V2-Lite es el referente MoE mas cercano por tamano total, aunque usa un numero de expertos muy superior (64 enrutados mas 2 compartidos) y un enrutado Top-6, lo que da una proporcion de parametros activos mucho menor. Qwen2.5-14B ofrece el mismo orden de magnitud en parametros totales con una arquitectura densa y una licencia permisiva, mientras que Mixtral 8x7B es un MoE de referencia en el ecosistema abierto con licencia Apache 2.0. Los datos de los tres modelos alternativos provienen de sus propias model cards publicas.

## Limitaciones y advertencias

- Ausencia total de evidencia empirica: 0 descargas, 0 "likes" y ningun benchmark publicado; todas las capacidades declaradas (frontier-reasoning, memoria de largo alcance) son afirmaciones del autor sin verificacion externa.
- Ambiguedad de version: el identificador del repositorio indica V15 "Decoupled" mientras que la model card describe el hito M4 Standalone Merged. No queda claro que artefacto contiene exactamente el repositorio ni en que se diferencia de la version V14.
- Licencia jtrl-v1.0: es una licencia propia (license: other) cuyo texto esta en el archivo LICENSE del repositorio. Antes de cualquier uso comercial es imprescindible revisar sus terminos, ya que no es una licencia aprobada por OSI ni una variante estandar de Apache, MIT o similar.
- Requiere codigo personalizado: el tag custom_code implica trust_remote_code=True, lo que supone ejecutar codigo del autor en el entorno local. Es un riesgo de seguridad y de compatibilidad en produccion.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; el comportamiento en castellano es desconocido y debe validarse empiricamente.
- Longitud de contexto no declarada: aunque el tag es long-context, no se publica la ventana efectiva. La ventana de atencion local es de solo 2048 tokens, por lo que el alcance real depende de los mecanismos de memoria, cuyo comportamiento a largo plazo no esta documentado con metricas.
- Memoria recurrente en tiempo de test: los parametros del Tier 3 (eta = 1e-3, rho = 1e-4, mu = 0.95, ||M||_F <= 50,0) implican actualizaciones durante la inferencia. Esto puede introducir no determinismo entre ejecuciones y deriva del estado en sesiones muy largas.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones de factualidad ni de robustez, hay que asumir el riesgo habitual de un modelo de 14,8B sin alineamiento documentado (no se mencionan fases de RLHF o DPO).
- Sin pesos cuantizados: el repositorio solo incluye safetensors de 29,7 GB, lo que eleva el coste de despliegue y excluye de entrada los flujos basados en GGUF.
- Ausencia de soporte comunitario: sin descargas ni incidencias reportadas, no hay senales de que la arquitectura funcione correctamente fuera del entorno del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-V15-MoE-Decoupled
- Modelo base (V14 MoE Merged): https://huggingface.co/dhanesh-hf/Jarvis-Titan-V14-MoE-Merged
- Archivo de licencia jtrl-v1.0: https://huggingface.co/dhanesh-hf/Jarvis-Titan-V15-MoE-Decoupled/blob/main/LICENSE
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
