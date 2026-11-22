# BigFamTLLM/ml-cpt9

## Resumen

ml-cpt9 es el noveno punto de control (de diez) de la fase de preentrenamiento continuado (continual pretraining, CPT) sobre noruego del modelo multilingual `ml-emb`, desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). El modelo parte de una arquitectura Qwen3 densa de 2.115.305.088 parámetros totales (2.045.673.088 sin la matriz de embeddings atada), 36 capas, tamaño oculto de 2.176 y una longitud de contexto de 4.096 tokens. Es un modelo base: solo preentrenado, sin ajuste por instrucciones ni alineamiento de seguridad.

El experimento del que forma parte busca responder una pregunta concreta: si preentrenar en otros idiomas y adaptar después al noruego supera a entrenar desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos los modelos adaptados alcanzan al modelo nativo. Para ello se entrenaron tres modelos base idénticos salvo por idioma y tokenizador (noruego, danés y multilingüe sin noruego), se sustituyó el tokenizador por uno noruego BPE de 32.000 tokens y se aplicó una fase de solo embeddings seguida de CPT sobre los datos del modelo noruego.

En este punto de control el modelo ha leído 23.456.645.120 tokens noruegos (iteración 43.740 de 48.600 de la CPT) y se distribuye en formato safetensors con un repositorio de 4,2 GB. Su relevancia es fundamentalmente metodológica: permite estudiar la transferencia lingüística entre idiomas germánicos y el coste real de adaptar un modelo multilingüe al noruego (tanto bokmål como nynorsk) frente a entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-style dense decoder (transformer decoder-only) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Qwen3 con 36 capas, tamaño oculto de 2.176, 34 cabezas de atención de 64 dimensiones y 17 cabezas key/value (GQA con ratio 2:1), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y sin sesgos. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencias de 4.096 tokens, batch global de 128 (524.288 tokens por iteración), AdamW (β 0,9/0,95, ε 1e-8), weight decay 0,1 y recorte de gradiente 1,0. La tasa de aprendizaje de la CPT es 5e-4 tras 2.000 iteraciones de warm-up, seguida de una fase constante (warmup-stable).

Los datos proceden de HPLT 4.0 (web), tokenizados por el equipo. El preentrenamiento original del modelo multilingüe usó inglés al 80 % y danés, alemán y sueco al 6,7 % cada uno, sin noruego. La CPT se realiza sobre los datos del modelo noruego: bokmål al 85 % y nynorsk al 15 %, en el mismo orden que el modelo nativo. La innovación técnica destacable no está en la arquitectura sino en el protocolo experimental: sustitución de tokenizador con inicialización de embeddings (copia cuando el token existe en ambos vocabularios, media de las piezas en caso contrario), fase intermedia de solo embeddings (1.000 iteraciones a 1e-4) y CPT con diez puntos de control equiespaciados, cada uno evaluado tal cual y tras un annealing sobre datos noruegos de alta calidad (warm-up de 100 iteraciones a 5e-4 y decaimiento lineal a cero en 916 iteraciones).

## Capacidades

- Generación de texto autoregresiva en noruego (bokmål y nynorsk), inglés, danés, alemán y sueco.
- Modelado de lenguaje base: útil para continuación de texto, perplexity y evaluación intrínseca, no para diálogo directo.
- Capacidad multilingüe derivada del preentrenamiento original (inglés 80 %, danés, alemán y sueco), reforzada con el tokenizador noruego.
- No soporta tool calling ni function calling de forma nativa (no es un modelo ajustado por instrucciones).
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- No incluye capacidades de agente ni razonamiento multi-paso entrenadas.
- Capacidad de adaptación posterior: al ser un modelo base, es el punto de partida adecuado para fine-tuning supervisado y para experimentos de transferencia lingüística.

## Casos de uso

- Investigación en transferencia lingüística: comparar este punto de control con `no-base` (noruego desde cero) y con los puntos de control 1-10 de la CPT permite medir tras cuántos tokens noruegos el modelo adaptado alcanza al nativo; es el uso principal para el que se publicó.
- Evaluación de tokenizadores: al usar el BPE noruego de 32.000 tokens del equipo (`mix_BM7_2_NN8_1`), sirve para estudiar el impacto del tokenizador en la eficiencia y la calidad sobre bokmål y nynorsk.
- Punto de partida para fine-tuning en noruego: al ser un modelo base de 2,1B parámetros con contexto de 4.096 tokens, es adecuado para ajuste supervisado en tareas downstream (clasificación, extracción, resumen) con recursos moderados.
- Generación de texto en noruego para prototipos: continuación de texto y generación libre en bokmål y nynorsk, útil para validar pipelines antes de pasar a modelos mayores.
- Estudio de annealing: la variante `ml-cpt9-anneal` permite analizar el efecto del annealing sobre datos de alta calidad en un checkpoint intermedio de la CPT.
- Reproducibilidad académica: el conjunto completo de 50 modelos del experimento permite replicar el protocolo (tokenizer swap, embeddings-only, CPT con checkpoints) en otros pares de idiomas.
- Análisis de degradación multilingüe: comparar el rendimiento en inglés, danés, alemán y sueco antes y después de la CPT noruega para cuantificar el olvido catastrófico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos (2,115B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 6-8 GB con contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: unos 2,2 GB de pesos; en 4 bits, unos 1,1 GB (si bien no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti/4060 Ti en adelante); A100, H100 o GH200 para entrenamiento y evaluación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face); vLLM, llama.cpp u Ollama no están documentados para este modelo, aunque al ser un transformer Qwen3 denso estándar deberían ser compatibles tras conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt9 | 2,115B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint 9/10 de CPT noruega sobre `ml-emb` |
| BigFamTLLM/no-base | 2,115B (misma arquitectura) | 4.096 | noruego (nb, nn) | no disponible | Referencia entrenada desde cero en noruego |
| BigFamTLLM/da-cpt9 | 2,115B (misma arquitectura) | 4.096 | da, no, nb, nn | no disponible | Mismo protocolo partiendo del modelo danés |
| BigFamTLLM/ml-base | 2,115B (misma arquitectura) | 4.096 | en, da, de, sv | no disponible | Modelo multilingüe original sin noruego |

La comparación con modelos externos de tamaño similar (por ejemplo, Qwen3-1.7B o Gemma-2-2B) no está disponible en la información proporcionada, y las diferencias de datos y tokenizador harían la comparación poco significativa sin resultados de benchmarks publicados.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineamiento de seguridad: no debe usarse directamente en aplicaciones de cara al usuario sin fine-tuning y filtros adicionales.
- Riesgo elevado de alucinación y de generación de contenido inapropiado, propio de un modelo solo preentrenado.
- Es un checkpoint intermedio (iteración 43.740 de 48.600): no representa el estado final de la CPT y su calidad puede ser inferior a la del checkpoint 10.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Cobertura lingüística desigual: el noruego es el idioma objetivo de la CPT, pero el inglés domina el preentrenamiento original; el rendimiento en danés, alemán y sueco puede haberse degradado tras la adaptación.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Sin datos publicados de benchmarks, por lo que no es posible validar su calidad de forma objetiva frente a alternativas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido validado por la comunidad.
- Uso previsto principalmente académico y experimental (curso IN5640, Universidad de Oslo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt9
- Modelo base: https://huggingface.co/BigFamTLLM/ml-emb
- Variante con annealing: https://huggingface.co/BigFamTLLM/ml-cpt9-anneal
- Modelo noruego de referencia: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingüe original: https://huggingface.co/BigFamTLLM/ml-base
- Modelo danés de referencia: https://huggingface.co/BigFamTLLM/da-base
- Checkpoint 10 de la CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt10
- Checkpoint 1 de la CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt1
