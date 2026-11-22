# BigFamTLLM/ml-emb-anneal

## Resumen

`ml-emb-anneal` es un modelo base de tipo decoder-only desarrollado por BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Forma parte de un experimento controlado de 50 modelos que investiga si el preentrenamiento multilingüe seguido de una adaptación al noruego supera al entrenamiento desde cero en noruego con los mismos recursos computacionales. El modelo parte de `ml-emb`, la copia multilingüe (sin noruego) tras el cambio de tokenizador y 1.000 iteraciones entrenando únicamente la matriz de embeddings, y aplica un recocido final de 916 iteraciones sobre datos noruegos de alta calidad.

Arquitectónicamente sigue el estilo Qwen3: decoder denso de 36 capas, tamaño oculto de 2.176, 34 cabezas de atención de 64 dimensiones y 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000 y embeddings atados. Cuenta con 2.115.305.088 parámetros totales (2.045.673.088 sin la matriz de embeddings atada) y una longitud de contexto de 4.096 tokens.

Se trata de un modelo base puro: no está ajustado a instrucciones ni alineado en seguridad, y su relevancia es fundamentalmente académica y experimental, ya que sirve como punto de comparación dentro de una matriz de modelos que aísla el efecto del idioma y del tokenizador en el preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-style dense decoder (36 capas, hidden 2.176, 34 attention heads de 64, 17 KV heads, SwiGLU FFN 6.528, RMSNorm, QK-norm, RoPE base 10.000, tied embeddings, sin biases) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 36 capas, tamaño oculto de 2.176, 34 cabezas de atención de 64 dimensiones y 17 cabezas key/value (atención con query grouping), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y ausencia de biases. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPU NVIDIA GH200 por ejecución y precisión bf16.

La receta de datos del preentrenamiento original de `ml-base` combina inglés al 80 %, danés, alemán y sueco al 6,7 % cada uno, y ningún dato de noruego (HPLT 4.0). Tras el cambio al tokenizador noruego (BPE de 32.000 tokens, mezcla `mix_BM7_2_NN8_1` de bokmål y nynorsk), se entrenaron únicamente los embeddings durante 1.000 iteraciones para obtener `ml-emb`. El recocido de `ml-emb-anneal` añade 916 iteraciones sobre datos noruegos de alta calidad (bokmål y nynorsk, 480.247.808 tokens leídos con el tokenizador noruego), con un calentamiento del learning rate hasta 5e-4 durante 100 iteraciones y decaimiento lineal hasta cero. En total, el modelo ha leído 1.004.535.808 tokens en noruego. El cambio de tokenizador copia el embedding cuando el token existe en ambos vocabularios y, en caso contrario, usa la media de las piezas en que el tokenizador antiguo dividía el token.

## Capacidades

- Generación de texto autoregresiva en noruego (bokmål y nynorsk), inglés, danés, alemán y sueco.
- Modelo base sin ajuste a instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales.
- Capacidad de continuación de texto y modelado de lenguaje sobre documentos.
- Soporte multilingüe limitado a los cinco idiomas del preentrenamiento, con especialización en noruego tras el recocido.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explícito (thinking mode).
- No dispone de capacidades de visión ni audio.
- No está entrenado para razonamiento multi-paso ni uso como agente.

## Casos de uso

- Investigación sobre transferencia lingüística: sirve como punto de comparación en el experimento BigFamTLLM para medir cuántos tokens en noruego necesita un modelo multilingüe adaptado para igualar a uno entrenado desde cero; se usa evaluando perplejidad y tareas downstream sobre los checkpoints.
- Evaluación de tokenizadores: permite estudiar el impacto del cambio de vocabulario (BPE noruego de 32.000 tokens) y de la inicialización de embeddings por media de piezas en el rendimiento final sobre noruego.
- Generación de texto en noruego como base para fine-tuning: al ser un modelo base, es un punto de partida razonable para ajuste supervisado posterior en tareas de bokmål o nynorsk, aunque su tamaño de 2,1B limita la calidad frente a modelos mayores.
- Estudio de recocido (annealing) sobre datos de alta calidad: el par `ml-emb` / `ml-emb-anneal` permite aislar el efecto de 916 iteraciones sobre datos noruegos seleccionados.
- Experimentos académicos de preentrenamiento reproducible: la receta completa (Megatron-LM, 8 GH200, bf16, 26.000 millones de tokens por modelo base) está documentada y es replicable en entornos con recursos similares.
- Análisis de contaminación y composición de datos: la separación explícita entre datos de preentrenamiento (sin noruego) y datos de adaptación (bokmål 85 %, nynorsk 15 %) facilita estudios sobre mezclas de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,2 GB de pesos (tamaño del repo), más caché KV; con 4.096 tokens de contexto y GQA de 17 cabezas, la caché KV es moderada. En la práctica, entre 6 y 8 GB de VRAM para bf16 con contexto completo.
- En cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits: alrededor de 1,1 GB, aunque los tipos de cuantización no están documentados por el autor.
- GPU recomendadas para entrenamiento o fine-tuning: NVIDIA GH200 (usadas en el entrenamiento original), A100 80 GB o H100 para ajuste completo; para inferencia basta una RTX 4090, RTX 3090 o incluso GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados por el autor, aunque la arquitectura Qwen3 densa es compatible con las implementaciones habituales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `ml-emb-anneal` (este) | 2,1B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Modelo base experimental, recocido sobre noruego |
| `ml-emb` (mismo autor) | 2,1B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Versión sin recocido; mismo tokenizador noruego |
| `no-base-anneal` (mismo autor) | 2,1B | 4.096 | no, nb, nn | no disponible | Referencia entrenada desde cero en noruego, con recocido |
| `da-emb-anneal` (mismo autor) | 2,1B | 4.096 | da, no, nb, nn | no disponible | Variante danesa adaptada al noruego con recocido |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y receta de entrenamiento.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado a instrucciones ni alineado en seguridad, por lo que puede generar contenido inapropiado o incorrecto sin filtros.
- Riesgo elevado de alucinación en tareas de conocimiento factual, especialmente fuera de los dominios cubiertos por los datos de preentrenamiento.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas limitados a inglés, danés, alemán, sueco y noruego; no se garantiza un rendimiento aceptable en otras lenguas.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación externa.
- El cambio de tokenizador con inicialización por media de piezas puede degradar representaciones de tokens poco frecuentes.
- El tamaño de 2,1B limita la calidad frente a modelos actuales de mayor escala, incluso en noruego.
- No hay información publicada sobre sesgos específicos ni sobre evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-emb-anneal
- Modelo base `ml-emb`: https://huggingface.co/BigFamTLLM/ml-emb
- Modelo multilingüe original `ml-base`: https://huggingface.co/BigFamTLLM/ml-base
- Referencia noruega `no-base`: https://huggingface.co/BigFamTLLM/no-base
- Referencia noruega con recocido `no-base-anneal`: https://huggingface.co/BigFamTLLM/no-base-anneal
- Variante danesa `da-base`: https://huggingface.co/BigFamTLLM/da-base
- Variante danesa con recocido `da-base-anneal`: https://huggingface.co/BigFamTLLM/da-base-anneal
- Multilingüe con recocido `ml-base-anneal`: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Adaptación danesa `da-emb`: https://huggingface.co/BigFamTLLM/da-emb
- Adaptación danesa con recocido `da-emb-anneal`: https://huggingface.co/BigFamTLLM/da-emb-anneal
- Checkpoints de CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt1 (y sucesivos hasta `ml-cpt10`)
- Checkpoints de CPT multilingüe con recocido: https://huggingface.co/BigFamTLLM/ml-cpt1-anneal (y sucesivos hasta `ml-cpt10-anneal`)
