# cmeister/boundary-markers-en-d12-bnd_w-bpe

## Resumen

`cmeister/boundary-markers-en-d12-bnd_w-bpe` no es un modelo de propósito general, sino un artefacto de investigación: tres modelos de lenguaje en inglés (semillas 0, 1 y 2) entrenados para el experimento comparativo del artículo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister, arXiv:2608.08847). Los tres comparten exactamente la misma arquitectura, los mismos datos y los mismos hiperparámetros, y se diferencian únicamente en el tokenizador, lo que permite aislar el efecto del esquema de tokenización sobre la pérdida de validación.

El tokenizador estudiado, denominado `bnd_w`, inserta una marca de frontera `<|>` a ambos lados de cada palabra y elimina el espacio simple entre dos palabras marcadas en la codificación, restaurándolo en la decodificación. Se entrenó con BPE sobre una muestra de 5 GB de English FineWeb y tiene un vocabulario de 34.685 entradas (34.686 contando el token de inicio de secuencia).

Los modelos se entrenaron con nanochat (12 capas, anchura 768, 6 cabezas de atención, contexto de 2.048 tokens) durante 2.553 pasos de 524.288 tokens, es decir, 1,34 mil millones de tokens por modelo en una sola GPU. Son reentrenamientos de septiembre de 2026: los checkpoints originales se perdieron y las cifras publicadas y las de estos pesos difieren en menos de 0,0001 bits por byte. Su relevancia es metodológica (control experimental de tokenización y reproducción de resultados), no como modelo desplegable en producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (implementación nanochat, commit `92d63d4`): 12 capas, anchura 768, 6 cabezas de atención |
| Parámetros totales | no disponible (no declarado por el autor; del orden de 10^8 a partir de 12 capas × 768) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible. Solo se publican pesos en precisión completa (state dicts de PyTorch); no hay versiones GGUF, GPTQ, AWQ ni similar |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`), cargable con `torch.load(..., weights_only=True)`. No se publican safetensors ni GGUF |
| Tokenizador | BPE con marcas de frontera `<|>` alrededor de cada palabra; vocabulario 34.685 + token BOS = 34.686; fichero `tokenizer/fineweb_en_5gb_bnd_w_bpe_v34685.json.gz` (sha256 `d0bf82b8f86d19b536949e758982fc9803d308354d8b45e8e50dfa785e0b6d89`) |
| Tamaño del repositorio | 2,5 GB (incluye las tres semillas completas más el tokenizador) |
| Ficheros por semilla | `seed<n>/model_002553.pt`, `seed<n>/meta_002553.json`, `seed<n>/train.log`, `seed<n>/archive.json` |

## Arquitectura y entrenamiento

Se trata de la arquitectura de nanochat: un transformer decoder-only denso, no MoE ni SSM, con 12 capas, anchura de 768, 6 cabezas de atención y ventana de contexto de 2.048 tokens. El entrenamiento se lanzó con `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok, con 2.553 pasos de 524.288 tokens cada uno (1,34 mil millones de tokens) en una única GPU por modelo. El texto de entrenamiento son los primeros 8 shards de ClimbMix que descarga nanochat, recorridos entre 3,4 y 3,6 veces según el tokenizador. La semilla fija la inicialización de pesos y el orden de los 8 shards, y ese orden es idéntico para todos los tokenizadores, de modo que dos modelos con la misma semilla son directamente comparables.

La singularidad del trabajo está en el tokenizador, no en el modelo. `bnd_w` añade un marcador de frontera `<|>` a cada lado de cada palabra y suprime el espacio simple entre dos palabras marcadas durante la codificación, para reconstruirlo en la decodificación a partir de los dos marcadores contiguos. El BPE se entrenó sobre 5 GB de English FineWeb. Los ajustes de pretokenización almacenados en el fichero se reescribieron desde el formato de agosto de 2026 al actual, y el cambio solo se aceptó tras comprobar que ambas versiones producían los mismos ids de token sobre 200 documentos en inglés. No hay información sobre RLHF, DPO ni ninguna fase de ajuste por preferencias; son modelos base.

## Capacidades

- Generación de texto en inglés: modelo base de 12 capas entrenado con 1,34 mil millones de tokens, capaz de continuar texto, pero sin ajuste por instrucciones ni por preferencias.
- Modelado de lenguaje y puntuación de secuencias: su función principal en el artículo es calcular bits por byte de validación, no generar respuestas útiles.
- Codificación y decodificación con tokenizador de fronteras: soporta explícitamente el esquema `bnd_w` (marcas `<|>` a ambos lados de cada palabra, eliminación y restauración del espacio simple), mediante `BoundaryBPETokenizer` de script_tok.
- Comparación controlada de tokenizadores: al compartir semilla, datos e hiperparámetros con los demás brazos del estudio, sirve para medir el efecto aislado del tokenizador.
- Reproducción de resultados: permite volver a ejecutar la evaluación publicada y comprobar la variación entre reentrenamientos.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportado (modelo base sin instrucciones).
- Multilingüismo: no soportado, solo inglés.
- Capacidades especiales: ninguna (sin modo de razonamiento explícito, sin visión, sin audio, sin ventana de contexto extendida).

## Casos de uso

- Investigación en tokenización: comparar `bnd_w` con otros esquemas subword manteniendo fijos semilla, datos y ajustes; es el propósito del artefacto y el único caso de uso validado por el propio estudio.
- Medición de compresión de corpus: calcular bits por byte sobre un texto de validación para decidir si un vocabulario con marcas de frontera compensa su mayor número de tokens frente a un BPE convencional.
- Reproducción de resultados publicados: verificar que un reentrenamiento con el mismo tokenizador y los mismos shards se mantiene dentro de ±0,0001 bits por byte de la cifra original.
- Desarrollo de herramientas de tokenización: probar `BoundaryBPETokenizer` y las rutinas de script_tok sobre documentos reales antes de integrarlas en un pipeline de preprocesado mayor.
- Docencia y formación: usar un checkpoint final de nanochat (12 capas, 2.048 tokens de contexto, 1,34B tokens de entrenamiento) como ejemplo completo y reproducible de un entrenamiento de LLM de extremo a extremo en una sola GPU.
- Estudios de interpretabilidad en modelos pequeños: con 12 capas y 6 cabezas, el coste de analizar atención, embeddings de valor o representaciones internas es bajo y el resultado es auditable entre semillas.
- Evaluación de robustez de tokenizadores: medir cómo se comporta `bnd_w` ante texto sin espacios, puntuación anómala o palabras desconocidas, un escenario habitual antes de desplegar cualquier tokenizador en producción.
- No se recomienda su uso como asistente conversacional, generador de código, sistema de atención al cliente ni ningún caso que requiera seguir instrucciones; carece por completo del ajuste necesario.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es la pérdida de validación expresada en bits por byte (bpb), calculada como la pérdida sumada sobre el shard de validación de ClimbMix de nanochat dividida por la longitud UTF-8 real del texto puntuado (menor es mejor). Se compara el reentrenamiento con la cifra publicada en el artículo.

| Semilla | Reentrenamiento (bpb) | Publicado (bpb) | Diferencia |
|---|---|---|---|
| 0 | 0,87631 | 0,87628 | +0,00002 |
| 1 | 0,87634 | 0,87641 | -0,00007 |
| 2 | 0,87766 | 0,87767 | -0,00001 |

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni ninguna otra batería estándar para este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con un modelo del orden de 10^8 parámetros y contexto de 2.048 tokens, la inferencia cabría en menos de 1 GB en fp32 y en unos pocos cientos de MB en fp16, pero es una estimación propia, no un dato publicado.
- GPU recomendadas: cualquiera con suficiente memoria para el checkpoint; el autor entrenó cada modelo en una única GPU, sin especificar el modelo empleado.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna (incluso en equipos con 4-8 GB de VRAM) e incluso podría ejecutarse en CPU para pruebas puntuales.
- Opciones de despliegue: no hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni similares, ya que solo se distribuyen state dicts de PyTorch. El camino previsto es cargar el `.pt` con `torch.load(..., weights_only=True)` y usar el código de nanochat; integrarlo en otros runtimes requeriría una conversión a safetensors o GGUF que no está publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación directa solo es posible con los otros brazos tokenizadores del mismo estudio, ya que comparten arquitectura, datos y semilla. El resto de alternativas de tamaño similar se incluyen como referencia de categoría, con datos de conocimiento general y no verificados en la información proporcionada.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Rendimiento (bpb) |
|---|---|---|---|---|---|
| `cmeister/boundary-markers-en-d12-bnd_w-bpe` | nanochat d12, denso | no disponible (~10^8) | 2.048 | apache-2.0 | 0,87631 / 0,87634 / 0,87766 (semillas 0/1/2) |
| Otros brazos tokenizadores del mismo artículo (mismo nanochat d12) | nanochat d12, denso | mismas dimensiones | 2.048 | no disponible | no disponible en esta ficha |
| Pythia-160M (EleutherAI) | transformer decoder-only | 160 M | 2.048 | apache-2.0 | no disponible |
| GPT-2 small (OpenAI) | transformer decoder-only | 124 M | 1.024 | licencia de OpenAI | no disponible |

Nota: los datos de Pythia-160M y GPT-2 small proceden de conocimiento general, no de la información proporcionada en esta ficha, y no se dispone de una comparación de bits por byte en el mismo corpus de validación, por lo que los valores no son directamente equiparables.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni por preferencias: no sigue instrucciones, no mantiene formato conversacional y no debe usarse como asistente.
- Riesgo de alucinación muy alto en cualquier tarea generativa, al no existir ninguna fase de alineación ni de filtrado de seguridad.
- Sesgos: entrenado con English FineWeb y con los shards de ClimbMix, es decir, texto web sin curación específica; hereda los sesgos de esas fuentes.
- Limitación de idioma: solo inglés; el tokenizador y los datos de entrenamiento no cubren otros idiomas.
- Limitación de contexto: 2.048 tokens, insuficiente para documentos largos, conversaciones extensas o recuperación aumentada con muchos fragmentos.
- Naturaleza de reentrenamiento: los checkpoints originales del artículo se perdieron y estos pesos son un reentrenamiento de septiembre de 2026; el entrenamiento en GPU no es reproducible bit a bit, por lo que los resultados difieren ligeramente (hasta 0,00007 bpb) de las cifras publicadas.
- Repositorio sin señales de adopción: 0 descargas y 0 likes en el momento de la consulta, y sin pipeline declarado; no hay garantía de mantenimiento ni de soporte.
- Licencia apache-2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía ni indemnización por parte del autor; al tratarse de un artefacto de investigación, cualquier uso en producción exige validación propia.
- Distribución limitada a state dicts de PyTorch: no hay safetensors ni GGUF, lo que dificulta la integración en runtimes habituales y obliga a confiar en `torch.load` (con `weights_only=True`).

## Enlaces

- HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-bnd_w-bpe
- Artículo: https://arxiv.org/abs/2608.08847 (Explicit Boundary Markers for Subword Vocabularies, Sander Land y Clara Meister)
- Repositorio con el tokenizador y los scripts del artículo: https://github.com/sanderland/script_tok
- Framework de entrenamiento: https://github.com/karpathy/nanochat (commit `92d63d4`)
- Nota: los resultados de la búsqueda web realizada no contenían ningún enlace relacionado con el modelo; devolvían únicamente páginas sobre la Avenida Cabildo de Buenos Aires y mapas de esa ciudad, sin relación con este artefacto.
