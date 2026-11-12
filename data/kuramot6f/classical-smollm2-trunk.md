# kuramot6f/classical-smollm2-trunk

## Resumen

classical-smollm2-trunk es un modelo de lenguaje de 124,6 millones de parámetros entrenado desde cero por el usuario kuramot6f sobre aproximadamente 1.000 millones de tokens de textos anteriores a 1868: japonés clásico, japonés del período Edo y chino literario. No ha visto japonés moderno, inglés ni contenido web, lo que lo convierte en un artefacto de investigación para estudiar qué aprende un modelo cuando solo se le expone a texto premoderno: su vocabulario, su "conocimiento del mundo" y su estilo.

La arquitectura replica la forma de SmolLM2-135M (familia Llama): 30 capas, dimensión oculta de 576, 9 cabezas de atención con 3 cabezas KV (GQA) y MLP de 1536, con embeddings de entrada y salida atados. El contexto declarado es de 8.192 posiciones, aunque el entrenamiento se realizó con secuencias de 2.048 tokens. El vocabulario es de 32.000 entradas mediante un tokenizador SentencePiece específico para el dominio.

Es relevante porque ofrece una línea base fiel a la época para el procesamiento de documentos históricos y un caso de estudio controlado sobre el sesgo inductivo del corpus: un modelo pequeño, entrenado con un presupuesto mínimo en una sola GPU, que sirve para analizar cómo se distribuye el conocimiento en modelos de escala reducida cuando el dominio está estrictamente acotado. Es un modelo base: continúa texto y no sigue instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (forma de SmolLM2-135M): 30 capas, hidden 576, 9 cabezas / 3 cabezas KV, MLP 1536 |
| Parametros totales | 124.635.456 (124,6M), embeddings de entrada/salida atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 posiciones (entrenado con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el repo; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | ja (japonés clásico y de Edo), lzh (chino literario) |
| Licencia | Apache-2.0 (pesos y código) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de tipo `LlamaForCausalLM` con la geometría de SmolLM2-135M: 30 capas, dimensión oculta 576, 9 cabezas de atención con 3 cabezas KV (atención con query grouping), MLP de 1536 y embeddings atados. El tokenizador es SentencePiece con vocabulario de 32.000 entradas, definido en el repositorio `classical-ja-tokenizer`; requiere `trust_remote_code=True` únicamente por el pequeño wrapper `classical_tokenizer.py`.

El entrenamiento usó 1.000 millones de tokens del split de train del dataset `classical-ja-pretrain`, con la siguiente composición: 440M de la Biblioteca Nacional de Dieta de Japón (NDL), 427M de Kanripo, 108M de Wikisource y 25M de Minna de Honkoku. Se realizaron 30.518 actualizaciones en bf16 con AdamW (weight decay 0,1) y un schedule de learning rate warmup-stable-decay, en una sola GPU con PyTorch, Transformers y Accelerate. La mezcla de datos fue aproximadamente 50% NDL, 48,5% Kanripo, 1,25% Wikisource y 0,25% Minna de Honkoku durante la mayor parte del entrenamiento; en la fase final de decaimiento del learning rate (actualizaciones 24.415–30.518) la mezcla se desplazó hacia fuentes literarias curadas: 65% Wikisource, 15% Minna de Honkoku, 10% NDL y 10% Kanripo. El repositorio contiene el checkpoint final, junto con `training_config.json` (configuración completa) y `metrics.jsonl` (pérdida y learning rate por paso). No se documenta RLHF, DPO ni ninguna fase de alineación; es un modelo estrictamente preentrenado.

## Capacidades

- Generación de texto en japonés clásico, japonés del período Edo y chino literario, con estilo y vocabulario fieles a textos anteriores a 1868.
- Continuación de texto (completion) a partir de un prefijo, incluido el formato kanbun.
- Modelado de vocabulario histórico: el tokenizador está entrenado sobre el corpus clásico, no sobre japonés moderno.
- Reproducción de registros estilísticos de las fuentes de entrenamiento (prosa literaria, textos budistas, documentos de la NDL).
- No soporta tool calling ni function calling: no se documenta ninguna capacidad de este tipo.
- No soporta uso agéntico ni razonamiento multi-paso: es un modelo base sin instrucciones.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a ja y lzh; no ha visto inglés ni japonés moderno.

## Casos de uso

- Investigación sobre sesgo inductivo del corpus: entrenar y evaluar el modelo sobre un dominio estrictamente premoderno permite medir qué estructuras lingüísticas y qué "conocimiento del mundo" emergen con 1.000 millones de tokens y 124,6M de parámetros, y compararlo con modelos entrenados en corpus modernos.
- Línea base para OCR histórico y corrección de transcripciones: el modelo puede puntuar secuencias de texto clásico para detectar pasajes anómalos en transcripciones de la NDL o de Kanripo, aunque debe tenerse en cuenta que aproximadamente el 44% de los tokens de entrenamiento son OCR sin corregir.
- Análisis estilométrico y atribución de autoría en textos de Edo: la continuación condicionada por prefijo permite generar variantes de estilo que sirven como referencia para comparar registros literarios de la época.
- Docencia e investigación filológica: generación de ejemplos de kanbun y de prosa clásica para ilustrar construcciones gramaticales, con la advertencia de que las salidas no son fuentes de hechos.
- Estudio de tokenización de lenguas históricas: el tokenizador de 32.000 entradas entrenado sobre el corpus clásico permite analizar cómo se segmentan formas ortográficas premodernas frente a tokenizadores modernos.
- Punto de partida para ajuste supervisado en tareas históricas: el propio autor publica una variante conversacional (`classical-smollm2-sft`), de modo que este checkpoint sirve como base para SFT sobre tareas concretas de procesamiento de documentos premodernos.
- Experimentos de eficiencia en hardware modesto: con 124,6M de parámetros y pesos bf16, el modelo cabe en GPUs de consumo y permite reproducir el pipeline completo de entrenamiento e inferencia en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 250 MB (124,6M parámetros × 2 bytes); en fp32, unos 500 MB. El repo completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo se entrenó en una sola GPU según la model card, sin especificar el modelo concreto.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40, incluso modelos de gama baja) y en CPU para inferencia.
- Opciones de despliegue: transformers (formato nativo, con `trust_remote_code=True` para el tokenizador), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles; no se documentan pesos GGUF ni integración con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classical-smollm2-trunk | 124,6M | 8.192 (entrenado a 2.048) | ja clásico, lzh | Apache-2.0 | Hugging Face |
| SmolLM2-135M | 135M | 8.192 | principalmente inglés | Apache-2.0 | Hugging Face |
| classical-smollm2-sft | no disponible | no disponible | ja clásico, lzh | Apache-2.0 (según repo del autor) | Hugging Face |

La comparación con SmolLM2-135M es estructural (misma geometría de 30 capas y hidden 576), pero el dominio de entrenamiento es completamente distinto: SmolLM2 se entrena sobre corpus web en inglés, mientras que classical-smollm2-trunk solo ha visto texto anterior a 1868 en japonés clásico y chino literario. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- El modelo es pequeño: las generaciones derivan y se repiten tras unas pocas frases, según reconoce el autor.
- Aproximadamente el 44% de los tokens de entrenamiento son OCR sin corregir, por lo que el modelo reproduce a veces ruido de OCR.
- Solo conoce lo que dicen los textos anteriores a 1868, incluidas sus visiones religiosas, políticas y sociales, que pueden resultar ofensivas hoy. No debe usarse como fuente de hechos.
- No es un modelo de instrucciones: no sigue comandos ni mantiene diálogos; para uso conversacional el autor remite a `classical-smollm2-sft`.
- Limitación de idioma: no ha visto japonés moderno ni inglés, por lo que su utilidad fuera del dominio histórico es nula.
- Licencia de los pesos: Apache-2.0, pero los textos de entrenamiento tienen licencias diversas: dominio público (OCR de la NDL), CC BY-SA 4.0 (Kanripo, Wikisource, Minna de Honkoku) y CC BY-NC-SA 3.0 TW para textos budistas derivados de CBETA, que suponen aproximadamente el 13% de los tokens del corpus. La licencia de los pesos no altera la de los textos de entrenamiento: si el modelo reproduce un pasaje, ese pasaje conserva su licencia original, lo que es un caveat relevante para uso comercial.
- Riesgo de alucinación: al ser un modelo base entrenado sobre un dominio cerrado, puede generar secuencias plausibles pero no verificadas; no debe emplearse como referencia factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuramot6f/classical-smollm2-trunk
- Variante conversacional (SFT): https://huggingface.co/kuramot6f/classical-smollm2-sft
- Tokenizador: https://huggingface.co/kuramot6f/classical-ja-tokenizer
- Dataset de preentrenamiento: https://huggingface.co/datasets/kuramot6f/classical-ja-pretrain
- Licencias del dataset: https://huggingface.co/datasets/kuramot6f/classical-ja-pretrain/blob/main/LICENSES/README.md
