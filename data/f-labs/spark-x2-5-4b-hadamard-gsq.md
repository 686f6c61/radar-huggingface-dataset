# F-Labs/Spark-X2.5-4B-Hadamard-GSQ

## Resumen

Spark-X2.5-4B-Hadamard-GSQ es una versión cuantizada del modelo base XHToken/Spark-X2.5-4B, publicada por F-Labs. Se trata de un artefacto de compresión histórica (snapshot congelado de 2026-09-12) que aplica una jerarquía heterogénea de cuantización multi-precisión sobre los pesos del transformer original, con el objetivo de reducir la huella de memoria en aproximadamente un 45% sin degradar de forma severa la generación de tokens. El modelo base declara 4,11 mil millones de parámetros en su model card, aunque el recuento real de safetensors es de 3.128.563.200 parámetros.

La relevancia de esta ficha no reside en el modelo fundacional, sino en el pipeline de compresión: combina INT8 para canales semánticos salientes, INT4 group-wise con transformada de Walsh-Hadamard (H256) para la masa de parámetros MLP de fondo, y SVD en BF16 para residuales de bajo rango en subespacios de alta curvatura. Todo ello se protege con un escudo de compresión cero que mantiene en BF16 los sesgos de proyección, las proyecciones de atención, las ganancias de RMSNorm y los embeddings atados.

El resultado declarado es una reducción de 8,224 GB a 4,18 GiB (4,49 GB) con un 93,28% de coincidencia exacta top-1 en un único prompt de auditoría de código recursivo de 119 tokens, y una divergencia KL de 0,1095 nats. El autor advierte explícitamente que estas cifras corresponden a una auditoría de prompt único y no a un benchmark general, y que este snapshot no debe compararse con el pipeline adaptativo actual de FQuant.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Spark-X2.5-4B); pipeline de cuantización DV-SSQ + KV-BSS |
| Parametros totales | 3.128.563.200 (safetensors); la model card declara 4,11B para el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (canales semánticos), INT4 group-wise con Walsh-Hadamard H256 (MLP de fondo), BF16 SVD low-rank (residuales), BF16 sin comprimir (sesgos, proyecciones de atención, RMSNorm, embeddings) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere cargador propio) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 36 capas según la auditoría de emergencia causal descrita en la model card. Esta release no entrena el modelo: aplica un pipeline de cuantización post-entrenamiento sobre los pesos de XHToken/Spark-X2.5-4B. La innovación principal es DV-SSQ (Dense-Vectorized Subspace Salience Quantization), que asigna precisiones distintas según la saliencia de cada subespacio de pesos: INT8 para canales que codifican conceptos semánticos, INT4 group-wise con rotación Walsh-Hadamard H256 para el grueso de parámetros MLP, y SVD en BF16 para los residuales de bajo rango en eigenspacios de alta curvatura. Un escudo de compresión cero preserva en BF16 los componentes críticos para la estabilidad numérica.

El segundo componente es KV-BSS (Key-Value Binding Softmax Sharpening), un mecanismo de estabilización de la capa de atención que aplica escalado de temperatura contrastivo (τ_focus = 1,10) y supresión de la neblina de atención de fondo, con el objetivo declarado de endurecer el umbral de alucinación y acelerar el recuerdo asociativo de bindings clave-valor estructurados (mapeos `["key"] => "value"`, AST, firmas de funciones). No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, tags conversational).
- Generación de código, incluyendo algoritmos recursivos, según la auditoría de prompt único publicada.
- Razonamiento estructurado sobre bindings clave-valor: mapeos, AST y firmas de funciones, favorecido por KV-BSS.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá del razonamiento implícito del modelo base.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Despliegue en dispositivos edge con memoria limitada: la reducción de 8,224 GB a 4,18 GiB permite ejecutar el modelo en GPUs de consumo con 8 GB de VRAM o en placas integradas con memoria unificada, usando el cargador custom_code incluido.
- Generación de código en entornos con restricciones de memoria: el 93,28% de coincidencia top-1 en el prompt de auditoría de código recursivo sugiere que el modelo conserva capacidad de completar algoritmos, adecuado para asistentes de código locales.
- Extracción y mapeo de estructuras clave-valor: gracias a KV-BSS, el modelo es adecuado para tareas de parsing de AST, generación de firmas de funciones y transformación de esquemas JSON donde el recuerdo asociativo exacto importa.
- Prototipado de asistentes conversacionales en inglés y chino: el pipeline text-generation y los tags conversational permiten integrarlo en chatbots de bajo coste con licencia Apache 2.0.
- Investigación en cuantización post-entrenamiento: el snapshot sirve como referencia reproducible para estudiar el impacto de la cuantización heterogénea multi-precisión sobre la divergencia KL y la entropía de logits.
- Fine-tuning ligero sobre pesos cuantizados: al mantener en BF16 las proyecciones de atención, RMSNorm y embeddings, es posible aplicar adaptadores sobre esas capas sin descuantizar el resto del modelo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index, correspondientes a una auditoría de prompt único (código recursivo, 119 tokens) y no verificados de forma independiente:

| Metrica | Modelo base (BF16) | Spark-X2.5-4B-Hadamard-GSQ |
|---|---|---|
| Top-1 exact match | 100,00% (referencia) | 93,28% (111/119 tokens) |
| Divergencia KL | 0,000000 nats | 0,109537 nats |
| Similitud coseno capa 35 | 1,0000000 | 0,9074698 |
| Entropía de logits | 0,1843 | 0,2658 |
| Huella de pesos | 8,224 GB | 4,18 GiB (4,49 GB) |
| Ratio de compresión | 1,000× | 1,833× |
| Fracción de error en espacio nulo | 0,00% | 52,14% (hasta 80,99% en L34) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB solo para pesos; con overhead de activaciones y caché KV, contar con 6-8 GB en la práctica.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en datacenter, A100 o H100 si se busca throughput alto, aunque el modelo es pequeño para esas GPUs.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM; en 6 GB puede requerir gestión cuidadosa de la caché KV.
- Opciones de despliegue: el modelo requiere `custom_code` y un cargador propio; no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B-Hadamard-GSQ | 3,13B (safetensors; 4,11B declarados) | no disponible | Apache 2.0 | safetensors + custom_code | Cuantización heterogénea DV-SSQ + KV-BSS |
| XHToken/Spark-X2.5-4B (base) | 4,11B declarados | no disponible | no disponible | no disponible | Modelo fundacional sin comprimir |
| Alternativas de ~4B cuantizadas a INT4 | ~4B | variable | variable | GGUF, safetensors | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que este release es un snapshot histórico congelado y no debe interpretarse como una release actual de FQuant ni compararse con el pipeline adaptativo más reciente.
- Los benchmarks provienen de un único prompt de auditoría de 119 tokens; no son representativos del rendimiento general y no están verificados de forma independiente.
- La divergencia KL de 0,1095 nats y la caída de similitud coseno a 0,9075 en la capa 35 indican una deriva distribucional no nula que puede acumularse en generaciones largas.
- La entropía de logits aumenta de 0,1843 a 0,2658, lo que sugiere una distribución de salida más blanda y potencialmente mayor variabilidad en la generación.
- Solo soporta inglés y chino; no hay evidencia de calidad en castellano.
- Requiere `custom_code` para cargar los pesos; la integración con frameworks de inferencia estándar no está confirmada.
- Riesgo de alucinación inherente al modelo base; KV-BSS declara mitigarlo, pero no hay evaluación independiente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base XHToken/Spark-X2.5-4B debe verificarse por separado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/F-Labs/Spark-X2.5-4B-Hadamard-GSQ
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio GitHub: https://github.com/dsadawq3/Spark-X2.5-4B-Hadamard-GSQ
- Discusión comunitaria: https://huggingface.co/XHToken/Spark-X2.5-4B/discussions/14
- Pull request oficial: https://huggingface.co/XHToken/Spark-X2.5-4B/discussions/15
- Paper QuaRot (arXiv:2404.00456): https://arxiv.org/abs/2404.00456
- Paper SpinQuant (arXiv:2405.16406): https://arxiv.org/abs/2405.16406
- Paper GPTQ (arXiv:2210.17323): https://arxiv.org/abs/2210.17323
- Paper AWQ (arXiv:2306.00978): https://arxiv.org/abs/2306.00978
- Paper SmoothQuant (arXiv:2307.09782): https://arxiv.org/abs/2307.09782
- Paper LLM.int8() (arXiv:2312.09934): https://arxiv.org/abs/2312.09934
- Paper ZeroQuant (arXiv:2208.07339): https://arxiv.org/abs/2208.07339
- Paper SVD-based compression (arXiv:2306.03078): https://arxiv.org/abs/2306.03078
