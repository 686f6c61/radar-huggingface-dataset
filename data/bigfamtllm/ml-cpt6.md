# BigFamTLLM/ml-cpt6

## Resumen

ml-cpt6 es el sexto checkpoint de la fase de continual pretraining (CPT) sobre noruego del experimento BigFamTLLM, un conjunto de 50 modelos desarrollado en el curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base de tipo decoder-only denso con arquitectura estilo Qwen3, 2.115.305.088 parámetros totales (2.045.673.088 sin la matriz de embeddings atada) y una longitud de contexto de 4.096 tokens. Parte de `BigFamTLLM/ml-emb`, un modelo multilingüe sin noruego al que se le sustituyó el tokenizador por un BPE noruego de 32.000 tokens.

El modelo aborda una pregunta de investigación concreta: si el preentrenamiento en otros idiomas seguido de una adaptación al noruego supera al entrenamiento desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos los modelos adaptados alcanzan al de referencia. ml-cpt6 corresponde a la iteración 29.160 de 48.600 de CPT, es decir, el punto medio del proceso, con 15.812.526.080 tokens noruegos leídos hasta este checkpoint.

Es relevante como artefacto de investigación reproducible: permite estudiar la curva de adaptación lingüística checkpoint a checkpoint, comparar la transferencia desde un modelo multilingüe frente a uno danés, y evaluar el efecto del annealing sobre datos noruegos de alta calidad. No es un modelo para producción: es un base model sin instruction tuning ni ajuste de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Qwen3 (36 capas, hidden size 2.176, 34 cabezas de atención de 64, 17 cabezas key/value, SwiGLU FFN de 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (no se documentan en la model card) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder-only denso con 36 capas, hidden size de 2.176, 34 cabezas de atención de dimensión 64 y 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, RMSNorm con QK-norm, RoPE con base 10.000, embeddings atados y sin términos de bias. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencias de 4.096 tokens, batch global de 128 (524.288 tokens por iteración), AdamW (β 0,9 y 0,95, ε 1e-8), weight decay 0,1 y gradient clipping 1,0.

La receta completa del experimento consta de cuatro fases. Primero, tres modelos base idénticos salvo por idioma y tokenizador (noruego, danés y multilingüe sin noruego), con 26.000 millones de tokens cada uno. Segundo, sustitución del tokenizador por el BPE noruego de 32.000 tokens (el equipo lo denomina `mix_BM7_2_NN8_1`), copiando el embedding cuando el token existe en ambos vocabularios y usando la media de las piezas en caso contrario, seguida de 1.000 iteraciones entrenando solo los embeddings con learning rate 1e-4 tras 100 iteraciones de warm-up. Tercero, continual pretraining sobre los datos del modelo noruego con 10 checkpoints equiespaciados; ml-cpt6 es el sexto, en la iteración 29.160 de 48.600, con learning rate 5e-4 tras 2.000 iteraciones de warm-up y programación warmup-stable. Cuarto, evaluación de cada checkpoint tal cual y tras un annealing de 916 iteraciones con warm-up de 100 iteraciones hasta 5e-4 y decaimiento lineal a cero.

Los datos de preentrenamiento son HPLT 4.0 tokenizados por el equipo: inglés al 80 %, danés, alemán y sueco al 6,7 % cada uno y sin noruego. La fase de CPT usa datos noruegos con un 85 % de bokmål y un 15 % de nynorsk, en el mismo orden que el modelo noruego de referencia.

## Capacidades

- Generación de texto en noruego (bokmål y nynorsk) como capacidad principal del checkpoint, tras 15.812.526.080 tokens noruegos de CPT.
- Generación de texto en inglés, danés, alemán y sueco, heredada del preentrenamiento multilingüe y potencialmente degradada por la adaptación al noruego.
- Modelado de lenguaje base: continuación de texto, puntuación de secuencias y extracción de representaciones internas.
- Tokenizador BPE noruego específico (32.000 tokens) que cubre bokmål y nynorsk con mayor eficiencia que el tokenizador multilingüe original.
- No dispone de tool calling ni function calling: es un modelo base sin instruction tuning.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- No dispone de visión, audio ni modo thinking.
- No está ajustado para seguir instrucciones ni para diálogo.

## Casos de uso

- Investigación sobre adaptación lingüística: comparar la perplejidad en noruego de este checkpoint con los checkpoints 1 a 10 y con el modelo noruego desde cero para trazar la curva de transferencia y determinar el punto de cruce.
- Estudio del efecto del annealing: evaluar ml-cpt6 frente a `ml-cpt6-anneal` para cuantificar cuánto aporta el ajuste final sobre datos noruegos de alta calidad en el punto medio del CPT.
- Análisis de transferencia multilingüe: medir la degradación en danés, alemán, sueco e inglés respecto a `ml-emb` para caracterizar el olvido catastrófico inducido por la CPT noruega.
- Fine-tuning posterior para tareas noruegas: usar el checkpoint como inicialización para clasificación de texto, etiquetado de secuencias o generación específica de dominio, aprovechando el tokenizador noruego ya adaptado.
- Evaluación de tokenizadores: comparar la fertilidad del BPE noruego de 32.000 tokens frente al tokenizador multilingüe original sobre corpus bokmål y nynorsk, usando este checkpoint como banco de pruebas.
- Reproducibilidad docente: servir como artefacto de referencia en el curso IN5640 para que otros estudiantes repliquen las fases de sustitución de tokenizador, embeddings-only y CPT con Megatron-LM.
- Generación de texto noruego sin instrucciones: continuación de documentos, aumento de datos sintéticos en bokmål o nynorsk y cálculo de puntuaciones de verosimilitud para filtrado de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el diseño experimental y la tabla de modelos del estudio, pero no incluye métricas numéricas (perplejidad, MMLU, NorEval ni similares) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica entre 6 y 8 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,2 GB (no se documentan cuantizaciones oficiales).
- GPU recomendadas para entrenamiento o fine-tuning: NVIDIA GH200 (la configuración usada en el experimento), A100 40/80 GB y H100; el entrenamiento original empleó 8 GH200 por ejecución.
- GPU consumer: cabe con holgura en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso en GPUs de 8 GB en bf16 para inferencia con contexto moderado; en 4 bits cabría en GPUs de 6 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama son viables siempre que se genere la cuantización correspondiente, aunque no se documentan artefactos GGUF oficiales.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Estado |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt6 | 2,12 B | 4.096 | Noruego (bokmål y nynorsk) | no disponible | Checkpoint intermedio de CPT |
| BigFamTLLM/no-base | 2,12 B (aproximado, misma arquitectura) | 4.096 | Noruego | no disponible | Modelo de referencia entrenado desde cero |
| BigFamTLLM/ml-base | 2,12 B (aproximado, misma arquitectura) | 4.096 | Multilingüe sin noruego | no disponible | Modelo de partida del linaje ml |
| BigFamTLLM/da-cpt6 | 2,12 B (aproximado, misma arquitectura) | 4.096 | Noruego vía transferencia desde danés | no disponible | Checkpoint equivalente del linaje danés |

La comparación relevante es interna al experimento: ml-cpt6 se sitúa en el punto medio entre `ml-emb` (sin CPT) y `ml-cpt10` (CPT completo), y su contraparte annealed es `ml-cpt6-anneal`. No se dispone de datos de rendimiento para comparar con modelos externos de tamaño similar.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene diálogos de forma fiable y no ha pasado por ajuste de seguridad ni de alineación.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, inherente a un modelo de 2,1 B parámetros sin RLHF ni DPO.
- Sesgos no evaluados: los datos provienen de HPLT 4.0 (web), con los sesgos de representación, género y dominio propios de corpus raspados.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- La CPT sobre noruego puede haber degradado el rendimiento en inglés, danés, alemán y sueco respecto a `ml-emb`; no se documenta la magnitud de esa degradación.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Es un checkpoint intermedio (iteración 29.160 de 48.600), no el modelo final del linaje; para evaluación definitiva deben usarse `ml-cpt10` o `ml-cpt10-anneal`.
- El tokenizador noruego sustituido puede producir un comportamiento degradado en tokens de otros idiomas que no existían en el vocabulario original.
- Sin datos publicados de benchmarks, no es posible verificar afirmaciones de calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt6
- Modelo base: https://huggingface.co/BigFamTLLM/ml-emb
- Versión con annealing: https://huggingface.co/BigFamTLLM/ml-cpt6-anneal
- Checkpoint anterior: https://huggingface.co/BigFamTLLM/ml-cpt5
- Checkpoint siguiente: https://huggingface.co/BigFamTLLM/ml-cpt7
- Modelo de referencia noruego: https://huggingface.co/BigFamTLLM/no-base
- Modelo de referencia noruego con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Linaje danés equivalente: https://huggingface.co/BigFamTLLM/da-cpt6
- Modelo multilingüe de partida: https://huggingface.co/BigFamTLLM/ml-base
- Curso IN5640, Universidad de Oslo: no disponible
- Repositorio del proyecto BigFamTLLM: no disponible
- Paper o blog del experimento: no disponible
