# patelvishwa112/qwen2.5-0.5b-nla

## Resumen

Qwen2.5-0.5B Natural Language Autoencoder (NLA) es un modelo abierto de interpretabilidad mecanística publicado por el usuario patelvishwa112. No es un modelo de chat al uso: es un par de componentes (un *Activation Verbalizer* y un *Activation Reconstructor*) entrenados sobre las activaciones del flujo residual de la capa 16 del modelo `Qwen/Qwen2.5-0.5B-Instruct`. Su objetivo es traducir una activación interna de 896 dimensiones a una explicación en inglés de 2-3 viñetas y, a la inversa, reconstruir la activación a partir de ese texto. Replica el trabajo de Anthropic *Natural Language Autoencoders Produce Unsupervised Explanations of LLM Activations* (mayo de 2026).

El modelo resuelve el problema de obtener explicaciones no supervisadas de las activaciones internas de un LLM sin depender de etiquetas humanas ni de texto de prompt original. Se entrena con un calentamiento supervisado (SFT) seguido de RL online con GRPO para el verbalizador y regresión MSE para el reconstructor, sobre 10.000 activaciones no etiquetadas de FineWeb-Edu. Todo el entrenamiento de la etapa 2 se completó en aproximadamente una hora sobre una única NVIDIA L4 (24 GB, BF16).

Es relevante porque demuestra que la técnica de NLA es reproducible a escala pequeña con hardware de consumo y con pesos abiertos (Apache 2.0). El modelo base es un transformer decoder-only de 0,5 mil millones de parámetros con 24 capas; la activación objetivo es la capa 16 (dos tercios de profundidad). El repositorio ocupa 1,8 GB e incluye pesos, configuraciones, figuras y métricas completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) para el verbalizador; Qwen2.5-0.5B-Instruct truncado a las primeras 16 capas más una cabeza lineal (`ar_head.pt`) para el reconstructor |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); el reconstructor usa solo las primeras 16 capas más una cabeza |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El sistema consta de dos módulos. El *Activation Verbalizer* (`av_rl/`) son los pesos completos de Qwen2.5-0.5B-Instruct más el tokenizer y un `nla_av_config.json`; recibe una activación residual de 896 dimensiones de la capa 16, normalizada a norma unitaria, inyectada en la posición de un token marcador dentro de una plantilla de prompt, y genera una explicación en inglés de 2-3 viñetas. El *Activation Reconstructor* (`ar_rl/`) usa Qwen2.5-0.5B-Instruct truncado a las primeras 16 capas más una cabeza lineal (`ar_head.pt`) que mapea la representación textual de vuelta a la activación de 896 dimensiones.

El entrenamiento tiene dos etapas. La etapa 1 (calentamiento supervisado) usa 6.000 pares SFT para el verbalizador y 6.000 pares disjuntos para el reconstructor, con resúmenes generados por DeepSeek-V4.1-Flash y verificados contra controles de activaciones barajadas de 120 pasos; la escala de inyección es α = 22,64 (percentil 75 empírico de la norma de la capa 16). La etapa 2 entrena conjuntamente con RL no supervisado: 250 pasos de GRPO online para el verbalizador (B=8, G=4, T=1,0, β_KL=0,04) y regresión MSE en paralelo para el reconstructor, sobre 10.000 activaciones no etiquetadas de FineWeb-Edu, con semilla 42 y aproximadamente una hora en una L4.

## Capacidades

- Verbalización de activaciones: dada una activación residual de la capa 16 de Qwen2.5-0.5B-Instruct (896 dimensiones, norma unitaria), genera una explicación temática en inglés de 2-3 viñetas.
- Reconstrucción de activaciones: a partir de una explicación textual, produce una estimación de la activación original de 896 dimensiones.
- Evaluación de ida y vuelta (round-trip): mide la fidelidad de la explicación mediante FVE y similitud coseno entre la activación original y la reconstruida.
- Predicción de sufijo a 10 vías: evalúa si la explicación permite discriminar la continuación correcta entre 10 candidatas.
- Recuperación de usuario y dominio: identifica el usuario o dominio de procedencia de la activación.
- Comprobaciones de esteganografía: verifica que la explicación no codifica información de forma encubierta (barajado de viñetas, parafraseo ligero, emparejamiento aleatorio).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido; su uso es exclusivamente de interpretabilidad.

## Casos de uso

- Interpretabilidad mecanística de LLM pequeños: extraer activaciones de la capa 16 de Qwen2.5-0.5B-Instruct durante la inferencia y verbalizarlas para inspeccionar qué conceptos, dominios o registros representa el modelo en ese punto de la red.
- Investigación en seguridad de IA: auditar activaciones sospechosas y obtener hipótesis temáticas sobre el contenido que el modelo está representando, como paso previo a métodos de corroboración independientes.
- Detección de fuga de información en representaciones: usar las comprobaciones de esteganografía (barajado, parafraseo, emparejamiento aleatorio) para verificar que las explicaciones no codifican información encubierta antes de publicar resultados.
- Docencia y formación en interpretabilidad: al ser un sistema pequeño, Apache 2.0 y entrenable en una L4 en una hora, sirve como banco de pruebas reproducible para enseñar NLA y GRPO.
- Investigación comparativa de NLA: replicar el trabajo de Anthropic a escala 0,5B y comparar curvas de FVE, similitud coseno y predicción de sufijo frente a modelos de mayor tamaño.
- Análisis de dominios en corpus: dado un conjunto de activaciones de FineWeb-Edu, agrupar verbalizaciones para caracterizar los dominios y registros que el modelo base representa en la capa 16.
- Depuración de representaciones en pipelines de evaluación: inspeccionar qué información semántica conserva una activación concreta antes de usarla como característica en un clasificador o sonda.

## Benchmarks y rendimiento

| Metrica | Baseline / azar | Etapa 1 (SFT) | Etapa 2 (RL, este modelo) | Ganancia |
|---|---|---|---|---|
| FVE de ida y vuelta en validación | 0,000 (vector medio) | 0,043 | 0,180 | +0,137 (4,2×) |
| Similitud coseno de ida y vuelta | 0,508 (par aleatorio) | 0,654 | 0,707 | +0,053 |
| Predicción de sufijo a 10 vías (n=80) | 10,0 % | 43,8 % | 47,5 % | +3,7 pp |
| Recuperación de usuario/dominio (n=20) | no disponible | 35,0 % | 40,0 % | +5,0 pp |
| Esteganografía: FVE con viñetas barajadas | 0,164 (original) | no disponible | 0,155 | 94,6 % retenido |
| Esteganografía: FVE con parafraseo ligero | 0,164 (original) | no disponible | 0,137 | 83,8 % retenido |
| Esteganografía: FVE con emparejamiento aleatorio | 0,164 (original) | no disponible | −0,296 | colapsa |

## Requisitos de hardware

- VRAM estimada para inferencia: el verbalizador son 0,5B parámetros; en BF16 ocupa aproximadamente 1 GB de pesos, más activaciones y caché, por lo que cabe holgadamente en GPUs de 8 GB o incluso en CPU en FP32 (más lento).
- El reconstructor usa solo las primeras 16 capas más una cabeza lineal, con requisitos de memoria aún menores.
- GPU recomendadas: NVIDIA L4 (24 GB) es la usada en el entrenamiento; cualquier RTX 3060/4060/4090 sirve para inferencia. Para reproducir el entrenamiento completo, una L4 de 24 GB es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM en BF16; también en CPU.
- Opciones de despliegue: transformers (el *quickstart* de la model card usa `snapshot_download`, `AutoModelForCausalLM` y `generate` con `inputs_embeds`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento de la etapa 2 se completó en aproximadamente una hora en una L4, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-nla (este) | 0,5B | no disponible | NLA sobre capa 16 de Qwen2.5-0.5B-Instruct | apache-2.0 | Hugging Face |
| NLA de Anthropic (referencia) | no disponible | no disponible | NLA sobre activaciones de modelos frontera | no disponible | no disponible (paper) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Chat/instrucciones | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables publicados para los NLA de Anthropic en la información proporcionada, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Confabulación: el verbalizador captura con frecuencia el dominio, el registro y la sintaxis del siguiente token correctos, pero inventa nombres, fechas o citas concretas que no estaban en el contexto original. Las explicaciones deben tratarse como hipótesis temáticas y corroborarse con métodos independientes.
- Escala pequeña: el modelo base es de 0,5B parámetros, por lo que la confabulación es más acusada que en los NLA frontera de Anthropic.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Dependencia del modelo base: solo es válido para activaciones de la capa 16 de Qwen2.5-0.5B-Instruct; no es transferible a otras capas, modelos o arquitecturas sin reentrenamiento.
- Uso especializado: no es un modelo de generación de texto general ni de chat; no soporta tool calling, agentes, visión ni audio.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2.5-0.5B-Instruct conviene revisar también las condiciones del modelo base.
- Sin datos de benchmarks frente a alternativas: no se han publicado comparaciones cuantitativas con otros NLA en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patelvishwa112/qwen2.5-0.5b-nla
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/patelvishwa112/fineweb-edu-nla-summaries
- Dataset de origen: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de referencia de Anthropic: https://transformer-circuits.pub/2026/nla/index.html
