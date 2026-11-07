# AETHORIA-AI/TR-HASH-MoE-50M-4B-Pretraining

## Resumen

TR-HASH-MoE-50M-4B-Pretraining es un modelo de lenguaje causal desarrollado por AETHORIA-AI, una organizacion de investigacion centrada en modelos de lenguaje compactos y enrutamiento determinista de tokens. Se trata de un checkpoint de preentrenamiento puro (sin SFT ni refinamiento posterior) con 52.034.560 parametros reales segun los pesos en safetensors, exportado tras 122.070 actualizaciones del optimizador sobre aproximadamente 4.000 millones de tokens de entrenamiento. El nombre del repositorio redondea esas cifras a 50M de parametros y 4B de tokens.

El modelo emplea una arquitectura transformer de tipo mixture-of-experts con 8 capas, hidden size de 512 y atencion de consultas agrupadas (GQA, 4 cabezas de query y 1 de key-value). Su rasgo distintivo es la estrategia de enrutamiento `token_id_composed_modulo`, implementada mediante el motor `tr_hash_engine`, que sustituye el enrutamiento aprendido convencional por un esquema determinista basado en el identificador del token. Incluye 4 expertos enrutados (2 seleccionados por token) mas un experto compartido de tamano intermedio 1.024.

Es relevante como artefacto de investigacion: publica de forma transparente las metricas de entrenamiento y explora una via poco habitual (enrutamiento por modulo compuesto sobre token ID) para reducir el coste de routing en modelos MoE pequenos. No obstante, al ser un checkpoint unicamente de preentrenamiento, no esta pensado para uso conversacional directo ni para produccion, y no dispone de evaluaciones de benchmark publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mixture-of-experts; 8 capas, hidden size 512, RoPE (theta 10.000), RMSNorm, GQA (4 query heads / 1 KV head), embeddings atados |
| Parametros totales | 52.034.560 (safetensors); la model card indica 51.522.048 |
| Parametros activos | 4 expertos enrutados, 2 seleccionados por token, mas experto compartido; no se publica el recuento exacto de parametros activos |
| Longitud de contexto | 2.048 tokens (maximo configurado) |
| Tipos de cuantizacion | no disponible (el ejemplo de carga usa float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas con hidden size 512 y vocabulario de 32.000 tokens. La atencion usa consultas agrupadas con 4 cabezas de query y una unica cabeza de key-value, codificacion posicional RoPE con theta 10.000 y normalizacion RMSNorm. La capa feed-forward no es densa: se implementa mediante `tr_hash_engine` con 4 expertos enrutados de tamano intermedio 352 cada uno, un experto compartido de 1.024 y un tamano intermedio configurado de 1.408; cada token activa 2 expertos enrutados. El enrutamiento sigue la estrategia `token_id_composed_modulo`, un esquema determinista derivado del identificador del token en lugar de un router aprendido.

El entrenamiento consistio exclusivamente en preentrenamiento sobre un prefijo de aproximadamente 4.000 millones de tokens del dataset TR-HASH-Pretraining-125B-Agentic-32K (revision `fc738b3a10c5c093e3b34b48bcf1cb7066184706`). Se realizaron 122.070 actualizaciones del optimizador con AdamW, longitud de secuencia 2.048, 8 workers de paralelismo de datos, 2 secuencias por worker y acumulacion de gradiente 1, lo que da 32.768 tokens globales por actualizacion (122.070 x 32.768 = 3.999.989.760). Se uso learning rate pico de 0,0003 con schedule coseno y 1.000 actualizaciones de warmup, weight decay 0,1 y precision bfloat16. La perdida de entrenamiento final registrada es 3,652127 en la actualizacion 122.070, un valor de log de entrenamiento y no una evaluacion sobre held-out. No se reporta RLHF, DPO ni ninguna fase de alineamiento.

## Capacidades

- Generacion de texto causal basica: el modelo es un LM de preentrenamiento, por lo que completa secuencias pero no sigue instrucciones de forma fiable.
- Razonamiento y codigo: sin datos de evaluacion que lo respalden; no disponible.
- Tool calling / function calling: no soportado de forma nativa (no hay SFT ni formato de herramientas).
- Agentes y razonamiento multi-paso: no soportado; el dataset de origen se denomina "Agentic" pero el checkpoint no ha pasado por post-entrenamiento.
- Capacidades multilingues: no disponibles; no se documenta la composicion linguistica del corpus.
- Capacidad especial de enrutamiento: MoE con routing determinista `token_id_composed_modulo`, que hace el reparto de expertos reproducible y dependiente solo del token de entrada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre enrutamiento MoE determinista: replicar el esquema `token_id_composed_modulo` y comparar su comportamiento (balanceo de carga, especializacion de expertos) frente a routers aprendidos en modelos de escala similar.
- Baseline de preentrenamiento a pequena escala: usar el checkpoint como punto de partida reproducible para experimentos de ablacion con 8 capas y hidden size 512, dado que se documentan hiperparametros y numero exacto de tokens.
- Estudio de dinamica de entrenamiento: analizar la curva de perdida (valor final 3,652127) y el efecto del schedule coseno con 1.000 pasos de warmup sobre un corpus de 4B tokens.
- Punto de partida para SFT propio: al ser un checkpoint puro de preentrenamiento, sirve como base para quien quiera aplicar su propio post-entrenamiento con `trust_remote_code` y el codigo de inferencia incluido.
- Pruebas de integracion de `tr_hash_engine`: validar el codigo de inferencia custom en pipelines de transformers antes de escalar a los modelos TR-HASH de mayor tamano (0.5B).
- Docencia y divulgacion: ejemplo minimo y ligero (0,2 GB de repo) para explicar GQA, MoE con experto compartido y enrutamiento por token ID sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento final de 3,652127 en la actualizacion 122.070, que no constituye una evaluacion sobre held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (52M parametros, ~208 MB de pesos) mas overhead de activaciones y KV cache; holgadamente por debajo de 2 GB en la practica.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para inferencia por lotes pequenos; no requiere A100 ni H100.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, y tambien en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (el formato es safetensors con codigo custom, no GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (MoE con enrutamiento determinista a escala de 50M) ni datos de rendimiento que permitan una comparacion rigurosa. El propio autor mantiene una familia mayor (TR-HASH 0.5B, con modelos base y SFT), pero no se aportan especificaciones de esa familia mas alla de su existencia.

## Limitaciones y advertencias

- Checkpoint solo de preentrenamiento: no esta alineado ni ajustado por instrucciones; las salidas no deben tratarse como respuestas utiles sin post-entrenamiento.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas similares; el unico dato es la perdida de entrenamiento.
- Licencia no disponible: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: se desconoce la composicion linguistica del corpus y el soporte real de castellano.
- Contexto corto: 2.048 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Riesgo de alucinacion: alto en un modelo de 52M parametros sin alineamiento; no apto para generacion factual sin verificacion.
- Codigo custom: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; auditar `tr_hash_engine` antes de usarlo en entornos sensibles.
- Discrepancia de parametros: la model card indica 51.522.048 y los safetensors 52.034.560; conviene verificar cual corresponde al checkpoint efectivo.
- Sesgos: no documentados, pero esperables en un corpus no filtrado de 4B tokens sin evaluacion de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-50M-4B-Pretraining
- Dataset de preentrenamiento: https://huggingface.co/datasets/AETHORIA-AI/TR-HASH-Pretraining-125B-Agentic-32K
- Organizacion AETHORIA-AI: https://huggingface.co/AETHORIA-AI
- Coleccion TR-HASH 0.5B Research Release: https://huggingface.co/collections/AETHORIA-AI/tr-hash-05b-research-release
