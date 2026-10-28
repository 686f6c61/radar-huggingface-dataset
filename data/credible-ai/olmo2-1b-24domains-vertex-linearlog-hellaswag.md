# credible-ai/olmo2-1B-24domains-vertex-linearlog-hellaswag

## Resumen

`olmo2-1B-24domains-vertex-linearlog-hellaswag` es un modelo de lenguaje de 1,41 mil millones de parámetros publicado por credible-ai como artefacto de investigación para reproducir los experimentos del paper LinMix, un método de optimización de mezclas de datos de preentrenamiento. No es un modelo de propósito general: es un checkpoint base (sin ajuste por instrucciones) entrenado con 32.000 millones de tokens extraídos del corpus WebOrganizer, agregados en 24 dominios temáticos cuyos pesos de mezcla se optimizaron especificamente para la métrica HellaSwag.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas, tamano oculto 2048 y tokenizador GPT-NeoX-20B de 50.432 entradas de vocabulario. Los pesos se distribuyen en bfloat16 y safetensors bajo licencia MIT, con el fichero `mix.json` que documenta la mezcla exacta de datos empleada en el entrenamiento.

Su relevancia es metodologica: sirve como punto de comparación a escala 1B para estudiar cómo se transfieren las mezclas óptimas calculadas sobre un enjambre proxy de modelos de 30M parámetros. Al tener 0 descargas y 0 likes, y carecer de resultados de benchmarks publicados, debe tratarse como material de laboratorio y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (`Olmo2ForCausalLM`), 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (1,41B), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican versiones cuantizadas; los pesos oficiales estan en bfloat16. La conversion a GGUF/AWQ/INT8 es posible pero no esta soportada oficialmente |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos) |
| Formato de pesos | safetensors (bfloat16) |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 32.000 millones |
| Datos de entrenamiento | WebOrganizer/Corpus-200B, 24 dominios tematicos |
| Metodo de mezcla | LinMix: surrogate lineal ajustado sobre el enjambre vertex con utilidad logaritmica ln pi (r = 1) |
| Enjambre proxy | credible-ai/olmo2-30M-24domains-vertex |
| Framework de entrenamiento | OLMo-core |
| Tamano del repositorio | 2,8 GB |
| Metrica objetivo | HellaSwag |
| Libreria | transformers |
| Fecha de publicacion | 2026-10-27 (segun la ficha de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 en su variante densa: un transformer decoder-only con 18 capas y dimension oculta de 2048, que arroja 1,41B de parámetros. Usa el tokenizador de GPT-NeoX-20B (vocabulario de 50.432 tokens), lo que facilita la comparación con otros modelos entrenados sobre corpus tokenizados con el mismo esquema. El entrenamiento se realizó con OLMo-core, el stack de entrenamiento de AllenAI, y los pesos resultantes se almacenan en bfloat16.

El aspecto diferencial es la composición del dataset. Partiendo de WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x, CC-BY-4.0), los datos se agrupan en 24 dominios temáticos y se mezclan con pesos calculados por LinMix: se ajusta un surrogate lineal sobre las evaluaciones de un enjambre de modelos proxy de 30M parámetros (variante "vertex") usando una utilidad logarítmica `ln π` con `r = 1`, y la mezcla óptima se transfiere al modelo de 1B. La mezcla se optimizó contra HellaSwag, de modo que el objetivo declarado es la reproducibilidad experimental, no la calidad generalista.

No se documenta en la información disponible ninguna fase de SFT, RLHF o DPO: es un modelo exclusivamente preentrenado, sin alineamiento ni ajuste instructivo. Tampoco se especifican detalles de la composición fina del corpus por dominio más allá de los 24 temas, ni la distribución exacta de tokens (el fichero `mix.json` del repositorio contiene los pesos de la mezcla).

## Capacidades

- Generación de texto autoregresiva en inglés mediante continuación de prefijo (modelo base, no instructivo).
- Modelado de lenguaje puro: next-token prediction sobre texto en inglés.
- Capacidad de servir como base para fine-tuning supervisado posterior en tareas de clasificación o generación.
- Útil para experimentos controlados de mezcla de datos por dominio (24 categorías temáticas).
- Reproducción de experimentos de transferencia de mezclas desde un proxy de 30M a un modelo de 1B.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- No dispone de vision, audio ni modo "thinking".
- Multilingüismo: limitado a inglés segun la model card.
- No se garantiza seguimiento de instrucciones ni formato conversacional.

## Casos de uso

- Reproducción del paper LinMix: cargar el checkpoint y el `mix.json` para replicar la curva de transferencia proxy (30M) → objetivo (1B) y verificar los resultados publicados.
- Ablación de mezclas de datos: comparar esta mezcla optimizada para HellaSwag con mezclas uniformes o basadas en heurísticas, manteniendo constantes arquitectura, tokenizador y número de tokens (32B).
- Estudio de dominios del corpus: analizar qué topics de los 24 de WebOrganizer reciben más peso bajo la utilidad logarítmica y correlacionarlo con ganancias en tareas de sentido común.
- Baseline en investigaciones de scaling: usar el modelo de 1,41B como referencia densa de bajo coste para experimentos que luego se escalan a 7B o 13B.
- Fine-tuning downstream en inglés: partir de estos pesos para tareas de clasificación de texto o generación de dominio acotado, aprovechando que la licencia MIT no impone restricciones de uso comercial sobre los pesos.
- Docencia y formación técnica: ilustrar en un curso de preentrenamiento cómo se construye un pipeline completo (corpus tokenizado, mezcla ponderada, entrenamiento con OLMo-core, publicación de pesos).
- Investigación sobre evaluación HellaSwag: estudiar la relación entre mezcla de datos y rendimiento en complementación de sentido común, con un modelo entrenado explícitamente para esa métrica.
- Generación de texto de dominio controlado en experimentos de sesgo: al conocer la mezcla por dominio, se pueden aislar efectos de composición sobre el estilo de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la mezcla de datos se optimizó para HellaSwag, pero no reporta la puntuación obtenida por este checkpoint, ni cifras de MMLU, GSM8K, HumanEval u otras evaluaciones. Tampoco se ofrecen comparaciones con el modelo base de OLMo 2 ni con el enjambre proxy de 30M.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 2,8 GB solo para pesos (1,41B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB con secuencias cortas y batch pequeno (estimación derivada del recuento de parámetros, no publicada por el autor).
- VRAM estimada en fp32: aproximadamente 5,7 GB solo para pesos.
- VRAM estimada en INT8: alrededor de 1,4 GB para pesos.
- VRAM estimada en INT4: alrededor de 0,7 GB para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más sirve en bfloat16; A100/H100 solo tienen sentido para entrenamiento o fine-tuning, no para inferencia de este tamano.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en tarjetas de 8 GB en bfloat16 con batches pequenos.
- Opciones de despliegue: `transformers` (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI para servir en GPU; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque / disponibilidad |
|---|---|---|---|---|
| Este modelo (credible-ai) | 1,41B | no disponible | MIT | Artefacto de investigación sobre mezcla de datos; 0 descargas |
| OLMo 2 1B (AllenAI) | ~1,2B (config. pública) | 4.096 (documentación pública) | Apache 2.0 (documentación pública) | Modelo base generalista con SFT/DPO disponibles en la familia |
| SmolLM2-1.7B (HuggingFace) | ~1,7B | 8.192 (documentación pública) | Apache 2.0 (documentación pública) | Modelo pequeno generalista con variante instructiva |
| Llama 3.2 1B (Meta) | ~1,2B | 128.000 (documentación pública) | Licencia comunitaria Llama 3.2 | Modelo generalista con variante instructiva |

Nota: los datos de los modelos comparables provienen de su documentación pública y pueden variar respecto a las cifras exactas de cada release; no se incluye comparación de rendimiento porque este checkpoint no publica resultados de benchmarks. La diferencia fundamental es de propósito: los comparables son modelos generalistas, mientras que este es un artefacto experimental con la mezcla de datos fijada por una única métrica.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o repetitivas.
- Riesgo de alucinación y de generar afirmaciones factualmente incorrectas, inherente a un modelo base de 1,4B parámetros.
- Solo inglés: no hay soporte documentado de otros idiomas.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta sin verificarla empíricamente.
- La mezcla de datos está optimizada contra HellaSwag, una única métrica; existe riesgo de sobreajuste de la composición del corpus a esa evaluación y de transferencia pobre a otras tareas.
- El modelo se entrenó con solo 32.000 millones de tokens, muy por debajo de los volúmenes habituales en modelos de su tamano en 2025-2026; su calidad generalista será previsiblemente limitada.
- Sin evaluación de seguridad, sesgos ni toxicidad publicada. El corpus subyacente es Common Crawl, con los sesgos propios de la web abierta.
- Licencia de los pesos: MIT, permite uso comercial. Sin embargo, los datos de entrenamiento derivan de DCLM 1b-1x (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl; conviene revisar obligaciones de atribución antes de un uso comercial.
- Sin tracción comunitaria (0 descargas, 0 likes) y sin validación independiente: no hay evidencia externa de su comportamiento real.
- No hay versiones cuantizadas oficiales ni garantía de que la conversión a GGUF reproduzca el comportamiento en bfloat16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linearlog-hellaswag
- Enjambre proxy de 30M: https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Codigo de LinMix: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
