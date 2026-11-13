# SlayerLab/pollock-2.0-polishdynaword-150m

## Resumen

Pollock 2.0 PolishDynaword es un modelo de lenguaje base monolingüe en polaco desarrollado por SlayerLab en el marco del proyecto Fabryka AI. Con 148.673.088 parámetros, se presenta como una reinvención arquitectónica completa respecto a la familia Pollock 1.x, cuyo objetivo declarado es maximizar la calidad del modelado sobre el corpus Polish DynaWord. Es, por tanto, un modelo de investigación orientado a experimentación con generación de texto en polaco y a estudios sobre entrenamiento de modelos pequeños, no un asistente conversacional listo para producción.

La arquitectura es un transformer decoder-only de 32 bloques con anchura de modelo y embeddings de 576, atención causal con grouped-query attention (GQA, 9 cabezas de query y 3 de key-value, dimensión de cabeza 64), RoPE con theta 10.000, feed-forward SwiGLU de anchura 1.664, Pre-LayerNorm y sin dropout ni sesgos en proyecciones y normalizaciones. La cabeza de salida está atada a los embeddings y proyecta a un vocabulario de 49.152 tokens mediante un tokenizador byte-level BPE propio.

Su relevancia actual es acotada pero clara: documenta con detalle una receta de preentrenamiento reproducible (cuatro etapas con contexto creciente, optimizador Muon para matrices y AdamW para el resto) sobre un dataset polaco específico, y sirve como punto de partida para fine-tuning posterior. El checkpoint publicado corresponde al paso 1.700 de 1.977 de la etapa D2048, es decir, un modelo no completamente entrenado según su propio plan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE y SwiGLU |
| Parametros totales | 148.673.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | polaco (pl) |
| Licencia | other, con nombre `mixed-upstream-dataset-terms` (ver LICENSE.md) |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 32 bloques, anchura 576, con atención causal GQA de 9 cabezas de query y 3 de key-value (dimensión de cabeza 64, proyecciones Q/K/V de 576/192/192), RoPE aplicado sobre Q y K con theta 10.000, feed-forward SwiGLU de anchura 1.664 con activación SiLU, Pre-LayerNorm y LayerNorm final con epsilon 1e-5, conexiones residuales tras atención y tras SwiGLU, sin sesgos en proyecciones ni normalizaciones y dropout 0. La cabeza de salida proyecta 576 → 49.152 y comparte pesos con los embeddings de tokens. El tokenizador es byte-level BPE con 49.152 entradas; `<|endoftext|>` (ID 49149) actúa como EOS, BOS y PAD, y `<|im_start|>`/`<|im_end|>` (IDs 49150 y 49151) están reservados para un futuro ajuste conversacional.

El entrenamiento parte de inicialización aleatoria y sigue cuatro etapas con contexto creciente: A512 (512 tokens), B1024 (1.024), C2048 (2.048) y D2048 (2.048). Los datos provienen de Polish DynaWord Pretraining Mix, derivado de Polish DynaWord, con la receta `pollock-dynaword-v1` que respeta límites de documento y particiones de conjuntos; cada documento recibe un único token EOS. El optimizador Muon se aplica a las matrices de atención y SwiGLU, mientras que AdamW optimiza embeddings, cabeza compartida y parámetros de normalización, con scheduler cosine y precisión BF16. El checkpoint publicado es D2048, paso 1.700 de 1.977, y hasta ese punto el modelo procesó 1.818.178.324 tokens predichos acumulados, contando repeticiones entre etapas. No se documenta RLHF, DPO ni ningún ajuste por preferencias: es un modelo estrictamente base.

## Capacidades

- Generación de texto en polaco: continuación de documentos, artículos y fragmentos de texto libre a partir de un prefijo.
- Modelado de lenguaje puro: útil para perplejidad, evaluación de recetas de entrenamiento y ablaciones arquitectónicas.
- Punto de partida para fine-tuning supervisado, incluido un eventual ajuste conversacional (los tokens `<|im_start|>` y `<|im_end|>` ya están reservados).
- Sin soporte de tool calling ni function calling: no hay formato de herramientas ni entrenamiento instructivo.
- Sin capacidades de agente ni razonamiento multi-paso entrenado de forma explícita.
- Multilingüe limitado: el corpus y el tokenizador están orientados al polaco; no se declara cobertura de otros idiomas.
- Sin visión, audio, thinking mode ni modo de razonamiento extendido.
- Contexto de 2.048 tokens, suficiente para documentos cortos y fragmentos, insuficiente para conversaciones largas o análisis de corpus extensos.

## Casos de uso

- Investigación sobre entrenamiento de modelos pequeños: replicar o comparar la receta de cuatro etapas con contexto creciente y el uso combinado de Muon y AdamW en un modelo de ~150M de parámetros.
- Evaluación de tokenizadores y datasets polacos: medir perplejidad y calidad de generación sobre Polish DynaWord y corpus polacos externos para validar la mezcla de preentrenamiento.
- Fine-tuning para clasificación o etiquetado de texto polaco: usar el modelo base como encoder/decoder inicial y añadir una cabeza de clasificación sobre la representación del último token.
- Generación asistida de texto polaco en dominios acotados: completar plantillas, descripciones de producto o resúmenes cortos tras un ajuste específico de dominio, dado el límite de 2.048 tokens.
- Base para ajuste conversacional experimental: los tokens de chat ya reservados permiten entrenar un formato de diálogo sin modificar el vocabulario.
- Experimentos de destilación o poda: su tamaño reducido (148,7M de parámetros, repo de 0,6 GB) facilita iterar sobre técnicas de compresión y comparar con la familia Pollock 1.x.
- Evaluación de sesgos y memorización en modelos polacos pequeños: el autor advierte explícitamente de posibles reproducciones de datos de entrenamiento, lo que lo hace adecuado para estudios de extracción de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 0,3 GB para los pesos (148,7M × 2 bytes), más activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en FP32: alrededor de 0,6 GB para los pesos.
- GPU recomendadas: cualquier GPU moderna; para lotes grandes o entrenamiento, A100, H100, L40S o RTX 4090/3090. Para inferencia interactiva basta una GTX 1660, RTX 3050 o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales con 4 GB o más, y en CPU para generación de baja concurrencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el repo usa `custom_code`); la conversión a GGUF para llama.cpp u Ollama no está publicada y requeriría implementar la arquitectura en esos runtimes. vLLM y TGI no tienen soporte nativo declarado para esta arquitectura personalizada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Pollock 2.0 PolishDynaword 150M | 148,7M | 2.048 | pl | other (`mixed-upstream-dataset-terms`) | Modelo base, checkpoint parcial (paso 1.700/1.977), arquitectura propia con GQA y SwiGLU |
| Pollock 1.x (pollock-mini-lm-125m) | ~125M (según nombre) | no disponible | pl | no disponible | Predecesor de la familia; arquitectura distinta según el autor |
| Modelos multilingües pequeños tipo XLM-R/MultiBERT | ~125-280M | 512 | multilingüe | varía (MIT/Apache en varios) | No son decoder-only generativos; comparables solo como base para tareas NLU |
| Modelos base pequeños tipo Pythia-160M | 160M | 2.048 | en | Apache 2.0 | Referencia de escala similar, pero en inglés y con receta de entrenamiento pública distinta |

La comparación con alternativas polacas específicas de escala similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Riesgo elevado de alucinación, repeticiones y errores factuales, según advierte el propio autor.
- Puede reproducir fragmentos literales de los datos de entrenamiento, con implicaciones de privacidad y derechos de autor.
- Puede generar contenido sesgado o dañino; no se documentan filtros ni evaluaciones de seguridad.
- Contexto máximo de 2.048 tokens, insuficiente para documentos largos o diálogos extensos.
- Cobertura lingüística limitada al polaco; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Checkpoint incompleto: corresponde al paso 1.700 de 1.977 de la etapa D2048, por lo que no es el resultado final de la receta prevista.
- Licencia `other` con términos heredados del dataset upstream (`mixed-upstream-dataset-terms`): es imprescindible revisar LICENSE.md antes de cualquier uso comercial, y la información disponible no aclara si el uso comercial está permitido.
- Requiere `trust_remote_code=True` en transformers por el código personalizado de la arquitectura, lo que implica ejecutar código del autor.
- No se han publicado benchmarks, evaluaciones de seguridad ni mediciones de latencia; cualquier decisión de producción debería basarse en evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/pollock-2.0-polishdynaword-150m
- Dataset de preentrenamiento: https://huggingface.co/datasets/SlayerLab/polish-dynaword-pretraining-mix
- Dataset Polish DynaWord: https://huggingface.co/datasets/SlayerLab/polish-dynaword
- Modelo predecesor Pollock 1.x: https://huggingface.co/SlayerLab/pollock-mini-lm-125m
- Proyecto Fabryka AI: https://fabryka.ai/
- Licencia: https://huggingface.co/SlayerLab/pollock-2.0-polishdynaword-150m/blob/main/LICENSE.md
- Historia de entrenamiento (D2048, paso 1700): https://huggingface.co/SlayerLab/pollock-2.0-polishdynaword-150m/blob/main/training-history/d2048-step1700.md
