# r-three-moto/moto-1b-baseline-byt5

## Resumen

MoTo 1B baseline (ByT5) es un modelo de lenguaje de 1.290 millones de parámetros entrenado desde cero por el grupo de investigación r-three-moto (Gül Sena Altıntaş y Colin Raffel) como parte del proyecto MoTo (Mixture of Tokenizers). Se trata de un transformer decoder de estilo Llama con 25 capas, dimensión de modelo 2048, 16 cabezas de atención y embeddings de entrada/salida no atados, entrenado sobre 21 idiomas con una ventana de contexto de 4096 tokens.

La particularidad de este modelo es que utiliza el tokenizador ByT5 a nivel de byte (un token por cada byte UTF-8), con una tabla de embeddings de solo 256 filas. Esto lo convierte en el baseline monolítico del proyecto MoTo: sirve como referencia de comparación frente al modelo MoTo, que emplea un tokenizador BPE distinto por idioma fusionado en un vocabulario superconjunto. Ambos modelos comparten arquitectura y datos de entrenamiento, de modo que las diferencias de rendimiento aíslan el efecto de la tokenización.

Es relevante ahora porque aborda un problema estructural del multilingüismo: los tokenizadores BPE monolíticos penalizan a los idiomas con menos presencia en el corpus. Al operar sobre bytes crudos, el modelo elimina el sesgo de fertilidad del tokenizador entre idiomas, a costa de secuencias más largas. Es un modelo base, sin ajuste por instrucciones ni alineamiento de seguridad, pensado para investigación controlada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings entrada/salida no atados |
| Parámetros totales | 1.285.658.624 (1,29B); 1,28B sin embeddings |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi (21 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); tokenizer.json rápido |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de estilo Llama con 25 capas, dimensión 2048 y 16 cabezas de atención, con embeddings de entrada y salida no atados. La innovación principal no está en la arquitectura sino en la tokenización: emplea el `ByT5Tokenizer` de `google/byt5-small`, donde cada byte UTF-8 se mapea a un id (byte b → id b+3; `<pad>`=0, `</s>`=1, `<unk>`=2) y el vocabulario efectivo se reduce a 256 filas de embedding. El token `<pad>` se usa como BOS, siguiendo la convención del tokenizador ByT5 de lingua. Los ids 256-258 y los tokens `<extra_id_*>` de ByT5 no están incluidos.

El entrenamiento se realizó desde cero sobre aproximadamente 104.860 millones de tokens (100.000 pasos × 1,05M tokens por paso; 4 secuencias de 4096 tokens por GPU × 8 GPUs × 8 pasos de acumulación). Los datos combinan FineWeb-Edu (inglés, 40% de la mezcla) y FineWeb2-HQ (los 20 idiomas restantes), con pesos exactos en `training/config.yaml`. Se usó el framework lingua. No hay información sobre RLHF, DPO ni ajuste por instrucciones: es un modelo base.

## Capacidades

- Generación de texto autoregresiva en 21 idiomas (inglés, árabe, checo, chino, danés, alemán, griego, persa, francés, húngaro, indonesio, italiano, japonés, neerlandés, polaco, portugués, ruso, español, sueco, turco y vietnamita).
- Modelado de lenguaje y continuación de texto; útil como base para fine-tuning.
- Tokenización a nivel de byte sin pérdida: la decodificación es reversible y `clean_up_tokenization_spaces` es falso, lo que evita normalizaciones.
- Manejo uniforme de cualquier script Unicode sin tokens `<unk>` para caracteres fuera de vocabulario (al operar sobre bytes).
- No soporta tool calling ni function calling de forma nativa (no está ajustado para ello).
- No tiene modo de razonamiento (thinking), visión, audio ni capacidades multimodales.
- No dispone de ajuste por instrucciones ni de alineamiento de seguridad.

## Casos de uso

- Investigación sobre tokenización multilingüe: sirve como baseline controlado para medir el efecto de esquemas de tokenización alternativos (como MoTo) manteniendo arquitectura y datos constantes.
- Fine-tuning para clasificación o etiquetado de texto multilingüe: al ser un modelo base de 1,29B, puede adaptarse con datasets pequeños en cualquiera de los 21 idiomas sin depender de un vocabulario BPE sesgado.
- Experimentos de robustez ante ruido y Unicode: la tokenización por byte permite procesar texto con emojis, símbolos raros o scripts mixtos sin tokens desconocidos, útil en tareas de normalización y limpieza de corpus.
- Generación de texto de dominio general en idiomas de bajos recursos: el entrenamiento balanceado sobre FineWeb2-HQ ofrece cobertura para idiomas como húngaro, checo o vietnamita donde los modelos monolíticos suelen degradarse.
- Evaluación de fertilidad de tokenizadores: el modelo permite cuantificar el coste en longitud de secuencia (y por tanto en contexto y cómputo) de la tokenización por byte frente a BPE en cada idioma.
- Base para modelos de lenguaje pequeños en entornos con recursos limitados: con 1,29B parámetros y contexto de 4096, es viable en una sola GPU consumer para prototipado e investigación.
- Reproducción de experimentos académicos: el repositorio incluye `training/config.yaml` y `training/metrics.jsonl`, lo que facilita replicar el entrenamiento y auditar la curva de pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB para contexto completo de 4096 tokens.
- En cuantización de 8 bits: alrededor de 1,3-1,5 GB de pesos; en 4 bits, unos 0,7-0,9 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante); A100 o H100 para entrenamiento o fine-tuning a mayor escala.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bfloat16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo, `AutoModelForCausalLM`), text-generation-inference (el modelo está etiquetado como compatible con endpoints), vLLM y llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles. El tamaño del repo es de 2,6 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizador | Idiomas | Licencia |
|---|---|---|---|---|---|
| moto-1b-baseline-byt5 | 1,29B | 4096 | ByT5 byte-level (256 filas) | 21 | Apache 2.0 |
| r3-moto/moto-1b | no disponible | no disponible | BPE por idioma (superconjunto) | 21 | no disponible |
| google/byt5-small | no disponible | no disponible | ByT5 byte-level | multilingüe | Apache 2.0 |

La comparación directa más relevante es con `r3-moto/moto-1b`, que comparte arquitectura y datos y difiere únicamente en tokenizador y tabla de embeddings; el autor indica que las comparaciones entre ambos aíslan el efecto de la tokenización. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin fine-tuning.
- No tiene alineamiento de seguridad ni filtros de contenido; puede generar texto sesgado, tóxico o inexacto.
- Riesgo de alucinación inherente a un modelo de 1,29B entrenado sobre ~105B tokens; la cobertura factual es limitada.
- La tokenización por byte genera secuencias más largas que BPE, lo que reduce el contenido efectivo dentro de los 4096 tokens de contexto y aumenta el coste computacional por documento.
- Los idiomas con menos presencia en FineWeb2-HQ pueden tener un rendimiento inferior pese a la cobertura declarada de 21 idiomas.
- No hay pad token: para inferencia por lotes debe configurarse `tok.pad_token = tok.eos_token` y hacer padding a la izquierda.
- Al decodificar secuencias de bytes no válidas en UTF-8 se obtiene U+FFFD, a diferencia de `ByT5Tokenizer`, que descarta esos bytes.
- Licencia Apache 2.0 permite uso comercial, pero al no haber ajuste ni evaluación de seguridad, el despliegue en producción requiere auditoría propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-baseline-byt5
- Modelo MoTo comparable: https://huggingface.co/r3-moto/moto-1b
- Colección de modelos MoTo: https://huggingface.co/r3-moto
- Paper (OpenReview): https://openreview.net/forum?id=avjeUhPuC6
- Paper (arXiv): https://arxiv.org/abs/2611.11027
- Código: https://github.com/r-three/moto
- Framework lingua: https://github.com/r-three/lingua/tree/lingua
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizador ByT5: https://huggingface.co/google/byt5-small
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
