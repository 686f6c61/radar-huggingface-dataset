# r-three-moto/moto-1b-baseline-llama-albert

## Resumen

MoTo 1B baseline (Llama 3.2 tokenizer, ALBERT-factorized embeddings) es un modelo de lenguaje base de 1.418 millones de parámetros desarrollado por el equipo r-three-moto (Gül Sena Altıntaş y Colin Raffel) en el marco del proyecto MoTo (Mixture of Tokenizers). Se trata concretamente del modelo de control del release: un decoder estilo Llama entrenado desde cero con un único tokenizador monolítico (el de Llama 3.2) compartido por los 21 idiomas del corpus, sin enrutamiento por idioma. Su propósito es aislar el efecto de la tokenización al compararlo con el modelo MoTo principal, que emplea la misma arquitectura y los mismos datos pero un tokenizador por idioma.

La arquitectura es un transformer decoder de 25 capas con dimensión de modelo 2048 y 16 cabezas de atención, con embeddings de entrada y salida factorizados al estilo ALBERT: una tabla de entrada de 128.256 × 512 seguida de una proyección 512 → 2.048, y una cabeza de salida 2.048 → 512 → 128.256, sin pesos atados. El contexto es de 4096 tokens y el entrenamiento consumió aproximadamente 104.860 millones de tokens sobre FineWeb-Edu (inglés, 40 % de la mezcla) y FineWeb2-HQ (20 idiomas adicionales).

Es relevante ahora porque acompaña a la publicación en NeurIPS 2026 del artículo "MoTo: Mixture of Tokenizers Towards Fair Multilingual Language Modeling", que propone sustituir el tokenizador único por tokenizadores BPE por idioma fusionados en un vocabulario superconjunto que indexa una tabla de embeddings compartida. Este baseline es la referencia experimental imprescindible para evaluar dicha propuesta. No está instruido ni alineado: es un modelo base de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada/salida factorizados ALBERT (no atados) |
| Parámetros totales | 1.418.041.344 (1,42B; 1,28B no-embedding) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible en la model card; pesos publicados en bfloat16 |
| Idiomas soportados | 21: en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi |
| Licencia | Llama 3.2 Community License (con Acceptable Use Policy) |
| Formato de pesos | safetensors (bfloat16), con código de modelado propio `modeling_llama_albert.py` |

## Arquitectura y entrenamiento

El modelo es un decoder autoregresivo de 25 capas con dimensión 2048 y 16 cabezas de atención, con embeddings de entrada y salida desacoplados y factorizados: la entrada pasa por una tabla de 128.256 × 512 y una proyección lineal de 512 a 2048; la salida, por una proyección de 2048 a 512 y una capa lineal de 512 a 128.256. Esta factorización reduce el coste paramétrico de las tablas de vocabulario respecto a embeddings densos de 2048 dimensiones, a costa de introducir dos proyecciones adicionales. El tokenizador es el de `meta-llama/Llama-3.2-1B` sin modificar, con 128.256 filas de embedding.

El entrenamiento se realizó desde cero con el framework `lingua` durante 100.000 pasos de 1,05 millones de tokens cada uno, lo que suma aproximadamente 104.860 millones de tokens (4 secuencias de 4096 tokens por GPU × 8 GPUs × 8 pasos de acumulación). Los datos combinan FineWeb-Edu (inglés, 40 % de la mezcla) y FineWeb2-HQ (20 idiomas restantes), con los pesos exactos en `training/config.yaml`. Cada documento se codificó como `<|begin_of_text|>` + texto + `<|end_of_text|>` con los tokens especiales del tokenizador desactivados. No hay información sobre RLHF, DPO ni ajuste por instrucciones: es un modelo base puro. La innovación del release no reside en este modelo sino en su contraparte MoTo, que comparte transformer y datos y difiere solo en tokenizador y tabla de embeddings.

## Capacidades

- Generación de texto autoregresiva en modo continuación de documento (modelo base, sin ajuste por instrucciones).
- Modelado de lenguaje multilingüe en 21 idiomas con un único vocabulario compartido.
- Puntuación de verosimilitud de documentos completos (útil para evaluación de perplejidad y comparación de tokenizadores).
- Razonamiento, código y matemáticas: capacidad emergente limitada por el tamaño (1,42B) y por la ausencia de ajuste instructivo; no disponible como capacidad medida.
- Tool calling / function calling: no soportado (modelo base sin formato de herramientas).
- Soporte de agentes y razonamiento multi-paso: no soportado de forma nativa.
- Capacidades multilingües: 21 idiomas declarados, con inglés al 40 % de la mezcla y el resto repartido entre FineWeb2-HQ.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Referencia experimental en investigación sobre tokenización: sirve como control monolítico frente a MoTo en experimentos que midan el efecto de tokenizadores por idioma sobre perplejidad y rendimiento multilingüe, usando los mismos datos y arquitectura.
- Evaluación de justicia multilingüe: permite cuantificar el sesgo de asignación de tokens entre idiomas (por ejemplo, tokens por palabra en finés frente a inglés) y correlacionarlo con la pérdida por idioma.
- Generación de texto de continuación en pipelines de investigación: con 4096 tokens de contexto puede completar documentos técnicos o artículos en inglés y en los 20 idiomas adicionales, siempre con prompts de estilo documento.
- Puntuación de corpus para filtrado de datos: al ser un modelo base, puede calcular log-probabilidades por documento para descartar texto de baja calidad en conjuntos multilingües, aunque su tamaño limita la precisión frente a modelos mayores.
- Estudio de la factorización de embeddings: la arquitectura ALBERT permite analizar el impacto de tablas de vocabulario comprimidas en modelos multilingües de ~1B, comparando con embeddings densos atados.
- Fine-tuning supervisado como punto de partida: al ser un base model de 1,42B con licencia Llama 3.2, puede ajustarse para tareas downstream concretas (clasificación, resumen) en entornos con GPUs de gama media, aunque la licencia impone restricciones de uso comercial.
- Reproducción de experimentos académicos: el repositorio incluye `training/config.yaml` y `training/metrics.jsonl`, lo que facilita replicar curvas de pérdida y throughput en clústeres propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos de 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB (no se documentan GGUF oficiales; requeriría conversión propia).
- GPUs recomendadas: A100 40/80 GB, H100 o L40S para despliegues por lotes; una RTX 4090 (24 GB) permite servir varias instancias en paralelo.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, incluso en bfloat16 con contexto completo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el módulo `modeling_llama_albert.py`); text-generation-inference está etiquetado como compatible, aunque el código personalizado puede requerir verificación. vLLM y llama.cpp no están confirmados para esta arquitectura factorizada.
- Latencia y throughput estimados: no disponibles; el repositorio incluye métricas de entrenamiento (`training/metrics.jsonl`) pero no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizador | Licencia | Notas |
|---|---|---|---|---|---|
| MoTo 1B baseline (este) | 1,42B (1,28B no-embedding) | 4096 | Llama 3.2 monolítico | Llama 3.2 Community | Control del release MoTo; embeddings ALBERT factorizados |
| MoTo 1B (`r3-moto/moto-1b`) | mismo transformer y datos | 4096 | Un tokenizador BPE por idioma fusionado en superconjunto | Llama 3.2 Community | Modelo propuesto; difiere solo en tokenizador y tabla de embeddings |
| Llama 3.2 1B (`meta-llama/Llama-3.2-1B`) | 1,24B | 131.072 | Llama 3.2 | Llama 3.2 Community | Instruido y alineado; contexto mucho mayor; referencia de la familia |
| Modelos multilingües ~1B (p. ej. Qwen2.5-1.5B) | ~1,5B | 32.768 | BPE multilingüe propio | Apache 2.0 (Qwen2.5) | No verificado en esta ficha; se cita como alternativa de categoría |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineación de seguridad: no debe usarse directamente en aplicaciones de cara al usuario sin fine-tuning y filtros adicionales.
- Riesgo alto de alucinación y de generar contenido sesgado o inapropiado, especialmente en contextos de continuación libre.
- Contexto limitado a 4096 tokens, muy inferior al de modelos contemporáneos de tamaño similar (Llama 3.2 1B soporta 131.072).
- Desequilibrio de datos: el inglés representa el 40 % de la mezcla, por lo que el rendimiento en los otros 20 idiomas es previsiblemente inferior y no está cuantificado en la información disponible.
- La licencia Llama 3.2 Community License impone restricciones al uso comercial (límite de 700 millones de usuarios mensuales para titulares, obligaciones de atribución "Built with Llama" y cumplimiento de la Acceptable Use Policy); revisar `LICENSE.txt`, `USE_POLICY.md` y `NOTICE` antes de producción.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del repositorio; auditar `modeling_llama_albert.py` antes de desplegar.
- No hay token de padding: para inferencia por lotes debe asignarse `tok.pad_token = tok.eos_token` y hacer padding por la izquierda.
- No se han publicado benchmarks ni evaluaciones de sesgo en la información disponible; las cifras de rendimiento deben obtenerse por cuenta propia.
- El modelo tiene solo 7 descargas y 0 likes en el momento de la ficha: ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-baseline-llama-albert
- Modelo MoTo principal: https://huggingface.co/r3-moto/moto-1b
- Todos los modelos del release: https://huggingface.co/r3-moto
- Paper (OpenReview, NeurIPS 2026): https://openreview.net/forum?id=avjeUhPuC6
- Paper (arXiv): https://arxiv.org/abs/2611.11027
- Código: https://github.com/r-three/moto
- Framework de entrenamiento lingua: https://github.com/r-three/lingua/tree/lingua
- Código de modelado incluido: https://huggingface.co/r-three-moto/moto-1b-baseline-llama-albert/blob/main/modeling_llama_albert.py
- Configuración de entrenamiento: https://huggingface.co/r-three-moto/moto-1b-baseline-llama-albert/blob/main/training/config.yaml
- Métricas de entrenamiento: https://huggingface.co/r-three-moto/moto-1b-baseline-llama-albert/blob/main/training/metrics.jsonl
- Licencia: https://huggingface.co/r-three-moto/moto-1b-baseline-llama-albert/blob/main/LICENSE.txt
- Política de uso aceptable: https://huggingface.co/r-three-moto/moto-1b-baseline-llama-albert/blob/main/USE_POLICY.md
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizador de referencia: https://huggingface.co/meta-llama/Llama-3.2-1B
