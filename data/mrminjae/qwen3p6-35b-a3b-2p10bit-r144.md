# mrminjae/qwen3p6-35b-a3b-2p10bit-r144

## Resumen

Qwen3.6-35B-A3B (r144) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, consistente en una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B. La intervención aplica una precisión media de 2,10 bits exclusivamente a los expertos enrutados de la arquitectura Mixture-of-Experts (MoE), mientras que el resto de pesos se mantiene en BF16. Los pesos se almacenan ya desquantizados en tensores BF16, de modo que cargan directamente con `transformers` y vLLM sin necesidad de kernels de cuantización especiales.

El modelo resuelve un problema práctico de despliegue: reducir el espacio ocupado por los expertos de un MoE de 35.107.181.936 parámetros totales manteniendo la compatibilidad con el ecosistema estándar de inferencia. Con 70,2 GB de repositorio y etiquetas que incluyen `qwen3_5_moe` e `image-text-to-text`, el checkpoint hereda las capacidades multimodales del base, aunque la model card no documenta ni los idiomas, ni la licencia efectiva, ni los detalles del proceso de cuantización más allá de la cifra de 2,10 bits.

Es relevante ahora porque los MoE de grano fino con pocos parámetros activos son la tendencia dominante para servir modelos grandes con coste de cómputo contenido, y las técnicas de cuantización extrema de expertos (por debajo de 3 bits) permiten acercar estos modelos a hardware de gama alta de consumo. No obstante, se trata de un checkpoint interno de investigación, sin benchmarks publicados ni garantías de calidad tras la compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, tag `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (BF16), librería `transformers` |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B es un transformer con arquitectura Mixture-of-Experts, tal como refleja la etiqueta `qwen3_5_moe` del repositorio. El checkpoint r144 no reentrena el modelo: parte de los pesos del base y aplica una cuantización selectiva sobre los expertos enrutados, dejando el resto de componentes (atención, embeddings, capas densas, router) en BF16. La media de 2,10 bits se declara únicamente para los expertos; no se especifica el número de expertos, el tamaño de cada uno ni el número de expertos activos por token.

No se dispone de información sobre el dataset de entrenamiento, el volumen de tokens, la composición de datos ni la existencia de fases de RLHF o DPO, ya que la model card es mínima y remite al modelo base. Tampoco se documenta la metodología de cuantización (algoritmo, calibración, granularidad por grupo o por canal) ni las métricas de degradación respecto al BF16 original. La innovación técnica declarada es la de almacenar los pesos ya desquantizados en BF16 para evitar dependencias de kernels personalizados, a costa de un tamaño de repositorio de 70,2 GB.

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta `conversational` y el pipeline `text-generation`.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), heredado del modelo base.
- Razonamiento y conocimiento general propios del modelo base Qwen3.6-35B-A3B, aunque la cuantización a 2,10 bits de los expertos puede degradar estas capacidades y no se han publicado evaluaciones al respecto.
- Compatibilidad con endpoints estándar (etiqueta `endpoints_compatible`).
- Carga directa con `transformers` y vLLM sin kernels de cuantización adicionales.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Despliegue de un MoE de 35B en infraestructura con menos memoria que la requerida por el modelo en BF16 completo: la reducción del peso de los expertos permite cargar el checkpoint en GPUs de 80 GB con margen para caché KV, algo inviable con el base sin cuantizar.
- Servicio de inferencia con vLLM en producción: al almacenarse los pesos en BF16 desquantizados, se evita la necesidad de kernels de cuantización específicos y se simplifica el pipeline de despliegue respecto a checkpoints con formatos propietarios.
- Experimentación en investigación sobre cuantización extrema de MoE: el checkpoint sirve como referencia para medir la degradación de calidad con expertos a 2,10 bits frente al base BF16.
- Prototipado de asistentes multimodales: la etiqueta `image-text-to-text` permite construir demos de descripción de imágenes y preguntas sobre documentos visuales, siempre validando la calidad tras la compresión.
- Evaluación comparativa de estrategias de compresión: útil para equipos que comparan cuantización selectiva de expertos frente a cuantización uniforme de todo el modelo.
- Fine-tuning ligero o adaptación con LoRA sobre el checkpoint comprimido, aprovechando la compatibilidad con `transformers` para iterar sobre tareas concretas antes de decidir si merece la pena volver al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 70,2 GB en safetensors BF16, por lo que la carga de pesos requiere al menos unos 70 GB de VRAM, más memoria para caché KV y activaciones.
- GPU recomendadas: H100 80 GB, A100 80 GB o GPUs con 80 GB de memoria. Una A100 40 GB o RTX 4090 de 24 GB no son suficientes para cargar el checkpoint completo en BF16.
- Cabe en GPU de consumo: no, con los formatos publicados. No se ofrecen variantes GGUF ni cuantizaciones adicionales para llama.cpp u Ollama.
- Opciones de despliegue: `transformers` y vLLM, según la model card. No se documenta soporte para TGI, llama.cpp, Ollama ni SGLang.
- Latencia y throughput estimados: no disponible. Al ejecutarse los expertos en BF16 tras la desquantización, el ahorro es principalmente de almacenamiento, no necesariamente de cómputo en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r144 | 35,1B | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B | no disponible | BF16 | la del modelo base | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base más allá del recuento de parámetros, por lo que la comparación cuantitativa con alternativas no es posible con la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna (r144) sin evaluación publicada: no hay garantía de que la calidad se mantenga tras comprimir los expertos a 2,10 bits.
- Licencia no disponible: la model card remite a la licencia del modelo base, que debe consultarse antes de cualquier uso comercial.
- Idiomas soportados no documentados, lo que impide planificar un despliegue multilingüe con garantías.
- Longitud de contexto no documentada en el repositorio.
- Sin datos sobre sesgos, alucinación o robustez tras la cuantización.
- El tamaño de 70,2 GB en BF16 limita el despliegue a GPUs de 80 GB; no hay variantes ligeras publicadas.
- El ahorro de memoria es de almacenamiento, no necesariamente de cómputo, ya que los pesos se cargan desquantizados en BF16.
- Riesgo de reproducibilidad: al ser un checkpoint de un usuario individual con 0 descargas y 0 likes, no hay validación comunitaria ni mantenimiento conocido.

## Enlaces

- https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r144
- https://huggingface.co/Qwen/Qwen3.6-35B-A3B
