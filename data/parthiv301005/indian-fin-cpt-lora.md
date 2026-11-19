# parthiv301005/indian-fin-cpt-lora

## Resumen

`parthiv301005/indian-fin-cpt-lora` es un adaptador LoRA de preentrenamiento continuado (CPT) construido sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el usuario parthiv301005. Su objetivo es desplazar la distribución lingüística y de conocimiento del modelo base hacia el vocabulario financiero de la India: empresas cotizadas, reguladores como el RBI o SEBI, terminología de mercados y prensa económica local. No es un modelo independiente, sino un conjunto de pesos LoRA que requieren el modelo base para funcionar.

El adaptador se entrenó con QLoRA (cuantización 4-bit NF4 del base, cómputo en fp16) sobre texto limpio de noticias financieras indias procedentes del dataset `kdave/Indian_Financial_News`, mezclado con aproximadamente un 15% de texto general de FineWeb-Edu para mitigar el olvido catastrófico. El entrenamiento fue deliberadamente ligero: una sola época, 87 pasos de optimizador, sobre 2x NVIDIA T4 en Kaggle. El autor lo describe explícitamente como un artefacto de investigación experimental, no como un modelo listo para producción.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de adaptación de dominio de bajo coste sobre un modelo de 7B; por otro, ilustra las limitaciones de este tipo de runs cortos, que producen ajustes de estilo y familiaridad léxica pero no conocimiento factual fiable. No se han publicado benchmarks posteriores al entrenamiento ni métricas de pérdida final en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA inyectado en las proyecciones de atención y MLP |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16; el modelo base Qwen2.5-7B-Instruct tiene 7.6B aproximadamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens en el entrenamiento (bloques de empaquetado); el contexto nativo del base Qwen2.5-7B-Instruct es de 32.768 tokens, ampliable |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantización para el entrenamiento; el adaptador se distribuye en safetensors (fp16/bf16 según el base) y admite las cuantizaciones del base (GGUF, AWQ, GPTQ, etc. mediante herramientas externas) |
| Idiomas soportados | Inglés (según la model card y los tags del repo) |
| Licencia | `other` (el adaptador); el modelo base Qwen2.5-7B-Instruct se publicó bajo Apache 2.0; los derechos del dataset de entrenamiento no están verificados |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (formato PEFT); tokenizer y `chat_template.jinja` copiados del base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar (SDPA en el entrenamiento). La configuración LoRA usa r=16, alpha=32, dropout 0.0 y se inyecta en las siete proyecciones lineales del bloque transformer: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El objetivo es modelado de lenguaje causal sobre todos los tokens, sin enmascaramiento de prompt, lo que corresponde a preentrenamiento continuado puro y no a instrucción.

Los datos proceden de la columna `Content` del dataset `kdave/Indian_Financial_News`, tras un pipeline de limpieza que elimina boilerplate publicitario, avisos de "also read", tablas numéricas, caracteres de ancho cero y artículos demasiado cortos, largos, con exceso de dígitos, en scripts no latinos o repetitivos; además se aplica deduplicación exacta por URL, exacta por texto y por similitud MinHash. Se mezcla aproximadamente un 15% de tokens de FineWeb-Edu (`sample-10BT`) como replay para limitar el olvido. Los documentos se concatenan con tokens EOS y se empaquetan en bloques de 2048 tokens, reservando un 1% para validación.

El entrenamiento usó QLoRA con pesos base en 4-bit NF4 (doble cuantización) y cómputo fp16, learning rate 1e-4 con schedule coseno, 3% de warmup, weight decay 0.01 y clipping de gradiente 1.0. El batch efectivo fue de 64 secuencias (1 por dispositivo × 32 de acumulación × 2 GPUs), unos 131.000 tokens por paso, durante una única época y 87 pasos de optimizador. Se ejecutó en 2x NVIDIA T4 (Kaggle) con DDP, mixed precision fp16, gradient checkpointing y atención SDPA, usando `transformers`, `peft`, `accelerate` y `bitsandbytes`. No hay innovaciones técnicas destacables más allá del uso estándar de QLoRA con replay de dominio general.

## Capacidades

- Generación de texto en inglés con sesgo hacia vocabulario y temática financiera india (empresas, reguladores, mercados).
- Continuación de texto: es el uso para el que el autor lo recomienda explícitamente, dado que el CPT se hizo sobre texto plano.
- Punto de partida para un posterior ajuste por instrucciones (SFT/DPO) específico de dominio financiero indio.
- Familiaridad léxica con terminología de prensa económica india, inducida por el corpus de entrenamiento.
- Conserva parcialmente las capacidades del base Qwen2.5-7B-Instruct (razonamiento, código, matemáticas, multilingüismo), aunque el autor advierte que el CPT sobre texto plano puede degradar el seguimiento de instrucciones.
- No se documenta soporte específico de tool calling, function calling, agentes o modos de razonamiento extendido en el adaptador; dichas capacidades dependerían del base y no han sido evaluadas tras el CPT.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre adaptación de dominio de bajo coste: sirve como referencia reproducible de un pipeline QLoRA + CPT con replay sobre 2x T4, útil para estudiar el efecto de runs cortos en la distribución del modelo.
- Generación de borradores de texto financiero indio: continuación de párrafos sobre resultados trimestrales, política monetaria del RBI o movimientos de mercado, siempre con revisión humana y sin uso como fuente factual.
- Preprocesamiento y aumento de datos: generar variantes estilísticas de noticias financieras para aumentar corpus de entrenamiento posteriores, dado el sesgo de dominio inducido.
- Base para SFT específico: iniciar un ajuste por instrucciones sobre el adaptador ya adaptado al dominio, aprovechando la familiaridad léxica adquirida antes de introducir datos de instrucción.
- Experimentación académica sobre olvido catastrófico: comparar el comportamiento del adaptador frente al base en tareas generales para medir la degradación introducida por el CPT y la eficacia del replay al 15%.
- Prototipado de clasificación o etiquetado de noticias financieras indias: usar el adaptador como extractor de representaciones o generador de resúmenes preliminares en un pipeline interno, con validación posterior.
- Docencia y demostraciones: ejemplo didáctico de cómo un adaptador PEFT pequeño (0,2 GB de repo) modifica el comportamiento de un modelo de 7B sin reentrenarlo por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una tabla de resultados con las filas "Final eval loss" y "Final eval perplexity" marcadas como pendientes de rellenar desde `trainer_state.json`, por lo que no hay cifras de pérdida ni perplejidad publicadas. El autor indica explícitamente que no se han ejecutado benchmarks posteriores al entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con el base en 4-bit NF4, aproximadamente 5-6 GB de VRAM para los pesos más overhead de activaciones y KV cache; en fp16, unos 15-16 GB; en bf16 similar. El adaptador en sí ocupa muy poco (repo de 0,2 GB).
- GPU recomendadas: NVIDIA T4 (16 GB) suficiente para carga 4-bit, como demuestra el propio entrenamiento; RTX 4090 (24 GB) permite fp16 con contexto moderado; A100 40/80 GB y H100 para serving en fp16/bf16 con contexto largo y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores con cuantización 4-bit; en fp16 requiere al menos 16 GB, por lo que encaja en RTX 4080/4090.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), `vLLM` con soporte LoRA, `llama.cpp`/Ollama tras fusionar el adaptador con el base y convertir a GGUF, `TGI` con adaptadores, y `bitsandbytes` para carga 4-bit. La fusión se realiza con `PeftModel.from_pretrained(base, ADAPTER).merge_and_unload()` cargando el base en fp16.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `parthiv301005/indian-fin-cpt-lora` | Adaptador LoRA sobre 7.6B | 2048 en entrenamiento (32k nativo del base) | Adaptador PEFT (CPT de dominio) | `other` (base Apache 2.0; datos sin verificar) | Hugging Face, 0 descargas, 0 likes |
| `Qwen/Qwen2.5-7B-Instruct` | 7.6B | 32.768 tokens (ampliable) | Modelo completo instruction-tuned | Apache 2.0 | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-7B` | 7.6B | 32.768 tokens (ampliable) | Modelo completo base | Apache 2.0 | Hugging Face |
| Adaptadores financieros genéricos sobre Llama/Mistral 7B | Variable | Variable | Adaptadores PEFT | Variable | Variable; no se dispone de una comparación directa publicada |

No se dispone de benchmarks comparativos publicados entre este adaptador y alternativas de dominio financiero; la comparación se limita a parámetros, contexto y licencia. El adaptador no aporta parámetros nuevos significativos (solo los pesos LoRA de r=16) y su ventaja potencial es el sesgo de dominio, no el rendimiento bruto.

## Limitaciones y advertencias

- Base instruct sometido a CPT sobre texto plano: el autor advierte que esto puede degradar el seguimiento de instrucciones y el comportamiento conversacional del modelo base.
- Entrenamiento muy corto: 87 pasos de optimizador y una época implican un ajuste ligero; cabe esperar cambios de estilo y familiaridad léxica, no conocimiento factual nuevo fiable.
- Sesgo y caducidad de la fuente: el modelo refleja lo que cubrieron los artículos scrapeados y cuándo lo hicieron; puede estar desactualizado y reproducir el encuadre, errores y sesgos de los medios originales.
- Alucinación: como cualquier modelo de lenguaje, puede generar afirmaciones seguras pero falsas sobre empresas, precios, regulaciones y eventos; el riesgo es especialmente relevante en dominio financiero.
- No es asesoramiento financiero: el autor prohíbe explícitamente usar las salidas para decisiones de inversión, trading, legales o fiscales.
- Licencia del adaptador `other` y derechos del dataset de entrenamiento no verificados: el dataset `kdave/Indian_Financial_News` no declara licencia y los artículos proceden de webs comerciales; la redistribución y el uso comercial no están confirmados. Verificar derechos antes de cualquier uso público o comercial.
- Idiomas: solo inglés declarado; no se ha evaluado el comportamiento en hindi u otras lenguas indias a pesar del dominio.
- Ausencia de métricas: sin pérdida final, perplejidad ni benchmarks publicados, no es posible cuantificar la mejora de dominio ni la degradación general.
- Estado experimental: 0 descargas y 0 likes en el momento de la consulta; sin validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parthiv301005/indian-fin-cpt-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de noticias financieras indias: https://huggingface.co/datasets/kdave/Indian_Financial_News
- Dataset de replay FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- PEFT (librería): https://github.com/huggingface/peft
- QLoRA (paper): https://arxiv.org/abs/2305.14314
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
