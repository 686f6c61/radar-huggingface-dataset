# ProjectSpaice/Qwen3-0.6B-bench-pretrain

## Resumen

Qwen3-0.6B-bench-pretrain es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-0.6B, desarrollado por ProjectSpaice como calentamiento de capacidades de agente para el entorno de trading pump-arena. Se trata de un experimento de preentrenamiento de referencia (benchmark) que combina problemas aritmeticos de GSM8K con prediccion de movimientos de ajedrez, con el objetivo de dotar al modelo de razonamiento basico y capacidad de decision secuencial antes de abordar tareas mas complejas.

El modelo conserva la arquitectura transformer densa del Qwen3-0.6B original, con 596.049.920 parametros reales en pesos safetensors (el autor cita 751,6 M en la model card, discrepancia que conviene tener en cuenta). El entrenamiento fue minimo: una sola epoca, 125 pasos de optimizador y unos 6 minutos en una instancia a10g-small, sobre un conjunto de 2.000 filas.

Su relevancia es acotada y experimental: no es un modelo de proposito general ni compite con los Qwen3 oficiales, sino un artefacto de investigacion publicado con licencia Apache 2.0 que documenta un pipeline de ajuste fino reproducible con TRL. Resulta util como referencia para quienes quieran replicar el flujo o estudiar el efecto de un SFT ligero sobre un modelo pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 (safetensors); la model card cita 751,6 M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el entrenamiento uso max_length 1024) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3. El ajuste se realizo con TRL v1.17.1 mediante `SFTTrainer`, con 1 epoca, 125 pasos de optimizador, batch efectivo de 16, learning rate 2e-5, precision bf16 y longitud maxima de 1024 tokens. El trabajo completo se ejecuto en una instancia a10g-small en aproximadamente 6 minutos.

El dataset de entrenamiento consta de 2.000 filas: 1.500 problemas matematicos de `openai/gsm8k` (split `main`), con las anotaciones de calculadora eliminadas y los marcadores de respuesta `#### N` conservados, y 500 filas de prediccion del siguiente movimiento de ajedrez extraidas de `laion/strategic_game_chess`, con listas de movimientos en notacion SAN y puntos de corte a mitad de partida. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa. Las metricas de perdida por cada 10 pasos se publican en un dashboard de Trackio.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-0.6B.
- Razonamiento aritmetico basico orientado a problemas de tipo GSM8K, con formato de respuesta `#### N`.
- Prediccion del siguiente movimiento en partidas de ajedrez a partir de secuencias SAN.
- Generacion de texto con pipeline `text-generation` y etiqueta `conversational`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad consolidada; el modelo se concibe como calentamiento para un agente de trading, no como agente autonomo verificado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Replicacion de pipelines de SFT ligero: sirve como referencia reproducible para validar un flujo TRL con `SFTTrainer`, bf16 y batches pequenos en GPU de gama media como la A10G.
- Investigacion sobre razonamiento aritmetico en modelos pequenos: permite estudiar como un SFT de 125 pasos afecta al formato de respuesta en problemas GSM8K.
- Experimentos de modelado de secuencias de ajedrez: el ajuste con notacion SAN facilita probar tareas de prediccion de movimientos y evaluar la coherencia de secuencias largas.
- Calentamiento de capacidades para agentes de trading: el modelo se disena como fase previa a un agente que opera en el entorno pump-arena, con condiciones identicas para todos los participantes.
- Base para experimentos de evaluacion comparativa: al estar publicado con licencia Apache 2.0, puede integrarse en arneses de benchmark internos sin restricciones de uso comercial.
- Docencia y formacion: util para demostrar el ciclo completo de ajuste fino de un modelo de menos de 1.000 M de parametros, desde la preparacion del dataset hasta la publicacion en Hugging Face.
- Pruebas de infraestructura de despliegue: su tamano reducido permite validar configuraciones de vLLM, TGI o llama.cpp antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia un dashboard de Trackio con la perdida de entrenamiento cada 10 pasos, sin metricas de evaluacion sobre GSM8K, HumanEval ni otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,2 GB solo para pesos (596 M parametros), mas overhead de activaciones y cache KV; el repo completo ocupa 1,2 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,6-0,8 GB; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM es suficiente; el entrenamiento se realizo en una A10G (24 GB) por comodidad, no por necesidad.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son viables dado el tamano; la informacion proporcionada no confirma configuraciones probadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ProjectSpaice/Qwen3-0.6B-bench-pretrain | 596 M (safetensors) | no disponible | Apache 2.0 | SFT experimental sobre GSM8K y ajedrez |
| Qwen/Qwen3-0.6B | 751,6 M (segun model card) | no disponible | Apache 2.0 | Modelo base oficial, capacidades generales |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Alternativa de tamano similar de la generacion anterior |
| SmolLM2-360M | 362 M | 8.192 tokens (segun documentacion publica) | Apache 2.0 | Modelo pequeno orientado a despliegue en dispositivo |

La comparativa se limita a datos publicos de los modelos base; no hay resultados de benchmarks del modelo ajustado que permitan comparar rendimiento real.

## Limitaciones y advertencias

- El ajuste es extremadamente corto (1 epoca, 125 pasos, 2.000 filas): el riesgo de olvido catastrofico y de sobreajuste a los formatos de GSM8K y ajedrez es alto.
- Existe una discrepancia entre los parametros reportados en la model card (751,6 M) y los reales en safetensors (596.049.920); conviene verificar antes de usarlo en produccion.
- Riesgo de alucinacion elevado en tareas fuera de los dominios de entrenamiento (matematicas basicas y ajedrez), dado el tamano del modelo y la escasez de datos.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- La ventana de contexto efectiva no esta documentada; el entrenamiento uso 1024 tokens como maximo.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no esta validado para produccion y su proposito declarado es experimental dentro de un entorno de competicion.
- El modelo se publica como un participante mas entre aproximadamente 50 modelos especialistas del entorno pump-arena, sin ventajas privadas de entrenamiento sobre datos del torneo.

## Enlaces

- Hugging Face: https://huggingface.co/ProjectSpaice/Qwen3-0.6B-bench-pretrain
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset strategic_game_chess: https://huggingface.co/datasets/laion/strategic_game_chess
- Dashboard de metricas (Trackio): https://huggingface.co/spaces/ProjectSpaice/qwen3-gsm8k-benchmark-sft-trackio
- Entorno pump-arena: https://huggingface.co/ProjectSpaice/pump-arena-private
- Badge ML Intern: https://hf.co/chat?mode=ml-intern
