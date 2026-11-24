# masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX

## Resumen

Qwen3.8-27B-Pyrite-2bit-MLX es una cuantizacion MLX de precision mixta y muy baja (2-3 bits) del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario masahiroid mediante el pipeline de cuantizacion ponderada por activaciones "Project Pyrite". El objetivo es comprimir un modelo de 27B parametros (51,75 GiB en BF16) hasta 10,11 GiB para que pueda ejecutarse integramente en memoria unificada de un Mac Apple Silicon de 16 GB, manteniendo la mayor calidad posible frente al modelo profesor en BF16.

La innovacion principal es una asignacion de bits sensible a la sensibilidad por capa: en lugar de aplicar 2 bits uniformes, se ensancha el grupo de cuantizacion de las proyecciones `gate_proj` y `up_proj` del MLP (de group_size 64 a 128) para liberar exactamente 356.515.840 bytes de metadatos, que se reinvierten en subir a 3 bits las 30 matrices MLP mas sensibles a valores atipicos (22 `down_proj` y 8 `gate/up_proj` de las capas tardias). El resultado mantiene el mismo presupuesto de bytes que un baseline uniforme de 2 bits pero reduce la divergencia KL entre un 22% y un 27% segun el idioma.

El modelo usa la arquitectura `qwen3_5` con atencion hibrida (Gated DeltaNet lineal mas atencion completa) y es compatible de forma nativa con `mlx-lm`, sin necesidad de kernels personalizados ni forks parcheados. Esta pensado para desarrolladores que quieran ejecutar un modelo de 27B en hardware de consumo Apple con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5`: 64 capas, Gated DeltaNet (atencion lineal) + atencion completa + MLP SwiGLU |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX de precision mixta: 2-bit (group_size 64 y 128), 3-bit (group_size 64), 4-bit (group_size 64); normas y Conv1d en BF16, `A_log` SSM en FP32 |
| Idiomas soportados | en, ja, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 10,11 GiB en disco |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida de 64 capas que combina 48 capas de atencion lineal Gated DeltaNet con 16 capas de atencion completa, junto con MLP SwiGLU de `hidden_size=5120` e `intermediate_size=17408`. Cada proyeccion MLP contiene 89.128.960 parametros, sumando 17,11B parametros MLP en las 64 capas. El vocabulario es de 248.320 tokens y el modelo original ocupa 51,75 GiB en BF16. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

Esta version es exclusivamente una cuantizacion, no un reentrenamiento. El pipeline Project Pyrite aplica cuantizacion ponderada por activaciones multilingue con asignacion de bits sensible a la sensibilidad. Las proyecciones `gate_proj` y `up_proj` (120 matrices) se cuantizan a 2 bits con group_size 128 (2,25 bits efectivos); las `down_proj` tempranas y medias (42 matrices) a 2 bits con group_size 64 (2,50 bits efectivos); y 30 matrices MLP de alta sensibilidad (22 `down_proj` de las capas L35-L36 y L44-L63, mas 8 `gate/up_proj` de L58-L63) se elevan a 3 bits con group_size 64 (3,50 bits efectivos). Embeddings, `lm_head` y proyecciones de atencion hibrida se mantienen a 4 bits. El resultado es un promedio de ~2,97 bits efectivos con un presupuesto de bytes identico al de un baseline uniforme de 2 bits.

## Capacidades

- Generacion de texto y conversacion multirretorno con pipeline `text-generation`.
- Razonamiento y generacion de codigo (el autor incluye ejemplos con el algoritmo de Dijkstra en Python).
- Capacidades multilingues en ingles, japones y chino, con vocabulario de 248.320 tokens protegido a 4 bits.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque hereda las capacidades del modelo base Qwen3.8-27B.
- Soporte de agentes y razonamiento multipaso: no confirmado explicitamente en la informacion disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Inferencia nativa en `mlx-lm` mediante capas `QuantizedLinear` estandar.

## Casos de uso

- Ejecucion local en Mac de 16 GB: el modelo cabe integramente en memoria unificada (10,11 GiB) y genera a ~12,2 tokens/s, lo que permite usar un modelo de 27B en un portatil Apple Silicon sin GPU dedicada.
- Asistente de programacion en local: con generacion de codigo y contexto conversacional, se puede integrar en editores o terminales para autocompletado y explicacion de algoritmos sin enviar codigo a la nube.
- Procesamiento de texto multilingue en ingles, japones y chino: util para traduccion, resumen o clasificacion en entornos con esos tres idiomas, aprovechando el vocabulario protegido a 4 bits.
- Prototipado e investigacion de cuantizacion: sirve como referencia reproducible de cuantizacion sensible a la sensibilidad con presupuesto de bytes fijo, comparando KL y perplejidad frente al profesor BF16.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local sin llamadas externas, es adecuado para datos sensibles que no pueden salir del dispositivo.
- Chatbot conversacional de baja latencia en hardware de consumo: el throughput de ~12,2 tokens/s es suficiente para interacciones de texto en tiempo casi real en un Mac M1/M2/M3/M4.
- Evaluacion de calidad de cuantizaciones de muy bajo bit: los datos de KL y perplejidad publicados permiten usarlo como banco de pruebas para comparar tecnicas de cuantizacion.

## Benchmarks y rendimiento

Datos publicados por el autor en comparacion estricta de igual presupuesto de bytes (mismo tamano de 10.854.616.576 bytes que un baseline uniforme de 2 bits):

| Metrica | Baseline 2-bit uniforme | Pyrite 2-bit mixto | Variacion |
|---|---|---|---|
| KL ingles (`eval_heldout_en`) | 0,6230 | 0,4841 | -22,29% |
| Perplejidad ingles | 10,92 | 9,60 | -1,32 PPL |
| Top-1 agreement ingles | 67,21% | 70,81% | +3,60 pt |
| KL japones (`eval_heldout_ja`) | 0,5856 | 0,4543 | -22,42% |
| Perplejidad japones | 18,35 | 15,55 | -2,81 PPL |
| Top-1 agreement japones | 66,00% | 68,65% | +2,65 pt |
| KL validacion multilingue | no disponible | -27,08% frente a baseline | -27,08% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,11 GiB para los pesos; en un Mac de 16 GB el autor recomienda fijar `mx.set_wired_limit(int(11.0 * 1024**3))` y materializar capas secuencialmente para evitar swapping a SSD.
- GPU recomendadas: Apple Silicon M1/M2/M3/M4 con 16 GB o mas de memoria unificada. No es compatible con CUDA ni con GPU NVIDIA (formato MLX).
- Cabe en GPU de consumo: si, en Mac Apple Silicon de 16 GB; no aplica a RTX 4090 u otras GPU NVIDIA por el formato MLX.
- Opciones de despliegue: `mlx-lm` (libreria nativa), con carga perezosa (`lazy=True`) y evaluacion capa a capa. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ~12,2 tokens/s en un Mac Apple Silicon de 16 GB segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Pyrite-2bit-MLX | ~26,9B | no disponible | MLX safetensors, 10,11 GiB | Apache 2.0 | Cuantizacion mixta 2-3 bits para Apple Silicon |
| Qwen/Qwen3.8-27B (BF16) | ~26,9B | no disponible | Safetensors BF16, 51,75 GiB | Apache 2.0 | Modelo base sin cuantizar; requiere ~52 GiB |
| Baseline 2-bit uniforme (group_size 64) | ~26,9B | no disponible | MLX, 10,11 GiB | Apache 2.0 | Mismo tamano que Pyrite, peor KL y perplejidad |

No se dispone de informacion sobre otras alternativas comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2-3 bits introduce perdida de calidad frente al modelo BF16: la perplejidad en ingles sube a 9,60 y en japones a 15,55, con una concordancia Top-1 del 70,81% y 68,65% respectivamente.
- Solo funciona en Apple Silicon mediante `mlx-lm`; no es desplegable en GPU NVIDIA, CUDA ni en la mayoria de stacks de servidor habituales.
- En Mac de 16 GB es imprescindible configurar el limite de memoria cableada y la carga secuencial de capas; de lo contrario puede producirse swapping a SSD y degradacion severa del rendimiento.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por la cuantizacion de muy bajo bit en las capas mas comprimidas.
- Idiomas soportados limitados a ingles, japones, chino y multilingue generico; no se garantiza un rendimiento equivalente en castellano.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto efectiva ni soporte confirmado de tool calling o agentes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar la calidad en el dominio de aplicacion antes de produccion dado el nivel de compresion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- DOI Zenodo: https://doi.org/10.5281/zenodo.23786705
- Paper (PDF): https://huggingface.co/masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX/blob/main/pyrite_en.pdf
- README en japones: https://huggingface.co/masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX/blob/main/README.ja.md
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
