# engnawal1/childrens-stories-73m

## Resumen

Children's Stories 73M es un modelo de lenguaje de tipo decoder-only, entrenado desde cero por el autor independiente engnawal1 para completar cuentos cortos en inglés dirigidos a niños de unos cinco años. El objetivo declarado es comprobar si un modelo de tamaño muy reducido puede continuar una narración infantil e introducir conductas de amabilidad o justicia a través de las acciones de un personaje. Con 73.461.120 parámetros, se sitúa en la franja de los modelos tiny, pensados para experimentación y docencia más que para producción.

La arquitectura sigue el estilo Llama, con 15 capas de decoder, un tamaño oculto de 640 y atención con query agrupadas (GQA) de 10 cabezas de query y 5 de key/value. Usa embeddings posicionales rotatorios (RoPE), activación SwiGLU y embeddings de entrada y salida atados. El vocabulario es de 8.192 tokens, con un tokenizador BPE a nivel de byte ajustado únicamente sobre el conjunto de entrenamiento.

El modelo se entrenó sobre una muestra del dataset TinyStories (30.000 cuentos divididos en 27.000 de entrenamiento, 1.500 de validación y 1.500 de test) durante 1.500 actualizaciones en una única NVIDIA Tesla T4, procesando 6.144.000 tokens de entrada. Su relevancia es fundamentalmente metodológica: documenta de forma transparente el plan de escalado, el presupuesto de cómputo y las métricas de validación, y sirve como ejemplo reproducible de entrenamiento de un LLM pequeño desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RoPE, SwiGLU, GQA, embeddings atados) |
| Parametros totales | 73.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 posiciones configuradas; entrenado con secuencias de 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder-only de 15 capas con tamaño oculto de 640, dimensión de cabeza de 64, tamaño intermedio de 1.728 y vocabulario de 8.192 tokens. La atención usa 10 cabezas de query y 5 de key/value (cada par de cabezas de query comparte una de key/value), lo que reduce el coste de memoria del KV cache. Incorpora RoPE para la posición, SwiGLU en el bloque feed-forward y ata los embeddings de entrada y salida para ahorrar parámetros. La longitud máxima configurada es de 512 posiciones, aunque el entrenamiento se realizó con bloques de 256 tokens.

El entrenamiento utilizó el dataset TinyStories (licencia CDLA-Sharing-1.0): se muestreó el split de entrenamiento publicado, se normalizaron espacios en blanco y se eliminaron duplicados exactos. Con semilla 42 se dividieron 30.000 cuentos por documento en 27.000 de entrenamiento, 1.500 de validación y 1.500 de test. El tokenizador BPE a nivel de byte se ajustó solo sobre el split de entrenamiento y se añadió un token de fin de cuento. El plan de escalado asumía D = 20N y C ≈ 6ND, lo que para esta arquitectura implica 1.469.222.400 tokens objetivo; sin embargo, la ejecución real procesó solo 6.144.000 tokens de entrada (un 0,4182 % del objetivo), es decir, aproximadamente 1,05 pasadas sobre el corpus empaquetado. Se usó AdamW (betas 0,9 y 0,95, weight decay 0,1), learning rate máximo de 0,0003 con 20 actualizaciones de warmup y decaimiento coseno, batch efectivo de 16 secuencias (4 × 4 pasos de acumulación) o 4.096 tokens de entrada, y 1.500 actualizaciones exitosas en una Tesla T4 en 29,11 minutos, excluyendo evaluación y checkpoints. No se documenta RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto en inglés: continuación de cuentos cortos con vocabulario sencillo y frases breves.
- Diálogo simple entre personajes, tal como muestra el ejemplo de la model card.
- Cierre de narraciones con un final corto, aunque sin garantía de coherencia argumental.
- Modelado de lenguaje básico: predicción del siguiente token con perplejidad de validación de 15,43.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés.
- No dispone de modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Experimentación académica con modelos tiny: sirve para estudiar curvas de pérdida, planes de escalado y el efecto del presupuesto de cómputo en un modelo de 73M, gracias a que la model card documenta el plan D = 20N y la ejecución real.
- Docencia de entrenamiento de LLM: el repositorio y la configuración permiten reproducir un pipeline completo (tokenizador BPE, empaquetado en bloques de 256, AdamW con decaimiento coseno) en una sola GPU de gama media.
- Pruebas de infraestructura de inferencia: por su tamaño reducido (0,3 GB de repo) es útil para validar pipelines con transformers y text-generation-inference antes de pasar a modelos mayores.
- Generación de cuentos infantiles de relleno: puede producir continuaciones legibles de aperturas sencillas en inglés, útiles como material de prueba, no como contenido final publicable.
- Investigación sobre sesgos y seguridad en narrativa infantil: permite analizar qué tipo de desenlaces y conductas morales emergen de un corpus como TinyStories.
- Baseline para comparativas: sirve como referencia de perplejidad (15,43 en validación, 15,51 en test) frente a otros modelos entrenados sobre TinyStories.

## Benchmarks y rendimiento

| Split | Objetivos de siguiente token evaluados | Entropía cruzada media | Perplejidad |
|---|---:|---:|---:|
| Validación completa | 317.730 | 2,7366 | 15,43 |
| Test completo | 325.635 | 2,7416 | 15,51 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación se limita a pérdida y perplejidad sobre los splits de TinyStories, además de una comparación cualitativa de generación con decodificación greedy antes y después del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,3 GB solo para pesos (73,46M × 4 bytes), más el KV cache y activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16/bf16 los pesos ocupan unos 0,15 GB, por lo que el modelo es viable en GPUs integradas y en CPU.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento documentado se realizó en una NVIDIA Tesla T4. También funciona en RTX 4090, A100 o H100, aunque en esos casos el modelo queda muy infrautilizado.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, GTX 1660 y similares, e incluso en dispositivos con poca memoria.
- Opciones de despliegue: transformers (ejemplo oficial en la model card) y text-generation-inference, según los tags del repositorio. No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles. El entrenamiento de 1.500 actualizaciones tardó 29,11 minutos en una T4, dato que no equivale a rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| childrens-stories-73m | 73,46M | 512 posiciones (256 en entrenamiento) | TinyStories, 6,14M tokens | no disponible | Hugging Face |
| Modelos TinyStories de referencia (p. ej. roneneldan/TinyStories-1M a 33M) | 1M–33M | variable según versión | TinyStories completo | variable (a menudo MIT/Apache-2.0) | Hugging Face |
| Modelos tipo GPT-2 small | 124M | 1.024 tokens | WebText | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos en la información proporcionada. La comparación se limita a parámetros, contexto y procedencia del entrenamiento.

## Limitaciones y advertencias

- Entrenamiento muy por debajo del presupuesto de escalado: solo el 0,4182 % de los 1.469.222.400 tokens objetivo, lo que limita severamente la calidad del modelo.
- Perplejidad de 15,43 en validación: alta para un modelo de lenguaje, indicativa de un ajuste limitado al corpus.
- El propio autor reconoce fallos de coherencia: en el ejemplo, el modelo introduce un peligro inexistente ("I'm so glad you're safe") y cierra la historia sin explicar la idea de Nora.
- La idoneidad por edad y la capacidad de transmitir una lección moral no se han evaluado con niños.
- Riesgo elevado de alucinación y de desenlaces sin sentido, especialmente fuera del dominio de TinyStories.
- Sesgos: no documentados; el corpus TinyStories está generado sintéticamente y puede contener sesgos propios del modelo que lo generó.
- Limitación de idioma: solo inglés; no se ha evaluado en castellano ni en otros idiomas.
- Contexto efectivo corto (256 tokens de entrenamiento, 512 posiciones configuradas), insuficiente para narrativas largas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/engnawal1/childrens-stories-73m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (referencia del dataset): no disponible en la información proporcionada
