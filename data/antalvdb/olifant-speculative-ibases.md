# antalvdb/olifant-speculative-ibases

## Resumen

Olifant es un modelo de lenguaje basado en memoria que actúa como modelo borrador (*draft model*) en decodificación especulativa. No es un transformer: es un árbol de decisión TiMBL IGTree que predice el siguiente token a partir de una ventana de cuatro tokens, con latencia inferior a 0,3 ms en CPU. Lo desarrolla Antal van den Bosch y se publica junto al artículo "Towards Green Text Generation: Memory-Based Speculative Decoding" (INLG 2026). El repositorio `antalvdb/olifant-speculative-ibases` empaqueta cuatro bases de instancias entrenadas, un método de generación para Transformers y un adaptador para llama-cpp-python.

El problema que resuelve es el coste energético y computacional de la decodificación especulativa: en lugar de usar un modelo neuronal pequeño como borrador (que consume GPU y memoria), emplea una estructura de memoria de acceso casi instantáneo en CPU. El modelo grande verifica en una sola pasada forward los tokens propuestos y conserva el prefijo con el que coincide, de modo que el texto resultante es una continuación greedy del modelo grande.

Es relevante ahora porque propone una vía de eficiencia energética en inferencia sin entrenar redes adicionales, con ganancias medidas de hasta 2,43× en throughput y 2,51× menos energía por token en texto legal de la UE sin caché KV, sobre un Apple M1 Max con Mistral-7B-v0.1 en fp16. El repo ocupa 6,4 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TiMBL IGTree (`-a1`), modelo basado en memoria con ventana de contexto de 4 tokens |
| Parametros totales | no disponible (no es una red neuronal; el tamaño se mide en bases de instancias: 138 MB a 4,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 tokens (ventana del borrador); el contexto real lo aporta el modelo grande |
| Tipos de cuantizacion | no aplica al borrador; compatible con modelos grandes en fp16 y GGUF cuantizado (Q4_K_M en el ejemplo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ibase` + `.wgt` + `olifant_config.json` (formato TiMBL); adaptador Python para llama-cpp-python |

Submodelos incluidos:

| Directorio | Corpus de entrenamiento | Tokens | Tamano | Uso recomendado |
|---|---|---|---|---|
| `olifant-fineweb` | FineWeb-Edu (1 shard) | 1.089B | 4,2 GB | texto general |
| `olifant-pubmed` | PubMed Summarization train | 536M | 1,1 GB | texto médico |
| `olifant-wikitext` | WikiText-103 train | 130M | 547 MB | texto enciclopédico |
| `olifant-eurlex` | LexGLUE EurLex train | 94M | 138 MB | texto legal de la UE |

## Arquitectura y entrenamiento

Olifant no es un transformer ni un modelo neuronal: es una estructura de memoria basada en instancias (TiMBL, *Tilburg Memory-Based Learner*) en configuración IGTree con `-a1`. Cada instancia almacena una ventana de cuatro tokens con su etiqueta de siguiente token, derivada de los corpus de entrenamiento. La predicción consiste en recuperar la instancia más cercana en el árbol y devolver su etiqueta, lo que se ejecuta en CPU en menos de 0,3 ms por paso. La tokenización usa el tokenizador de `mistralai/Mistral-7B-v0.1`, requisito imprescindible: el borrador y el modelo grande deben compartir vocabulario, por lo que funciona con Mistral-7B-v0.1 y modelos con la misma tokenización.

El entrenamiento consiste en tokenizar el corpus, extraer ventanas de cuatro tokens y ejecutar `timbl -a1`; el pipeline completo está en el repositorio de código del autor. No hay RLHF, DPO ni ajuste por preferencias. La innovación técnica es el uso de una memoria de acceso casi instantáneo como borrador en decodificación especulativa, con verificación en una sola pasada forward del modelo grande. La decodificación es greedy y cada token aceptado es la elección top del modelo grande; la única desviación posible respecto al greedy puro aparece cuando dos tokens candidatos están casi empatados, porque verificar varios tokens en una pasada produce logits ligeramente distintos que verificarlos uno a uno.

## Capacidades

- Predicción de siguiente token como modelo borrador en decodificación especulativa (3 a 8 tokens por paso, configurable con `num_draft_tokens`).
- Integración nativa con 🤗 Transformers mediante `custom_generate` y `trust_remote_code=True`.
- Integración con llama-cpp-python a través de `OlifantLlamaDraft` y `speculative_generate`, con soporte de modelos GGUF en CPU.
- Decodificación greedy con batch size 1 y soporte de `streamer`.
- Devolución de estadísticas de aceptación con `return_stats=True`.
- Especialización por dominio: cuatro bases de instancias para texto general, médico, enciclopédico y legal.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; no es un modelo generativo autónomo.

## Casos de uso

- Aceleración de inferencia de Mistral-7B-v0.1 en CPU: usar `olifant-fineweb` como borrador con llama-cpp-python y un GGUF Q4_K_M para reducir el número de pasadas forward del modelo grande en texto general.
- Generación de texto legal de la UE: con `olifant-eurlex`, el borrador alcanza la mayor tasa de aceptación documentada (38,1 % sin caché KV) y reduce el consumo energético por token, adecuado para procesar reglamentos y directivas.
- Resumen de literatura biomédica: `olifant-pubmed` está entrenado sobre PubMed Summarization y se adapta al vocabulario técnico médico para tareas de resumen con Mistral-7B.
- Procesamiento de texto enciclopédico: `olifant-wikitext`, el modelo más ligero (547 MB), sirve para pipelines sobre corpus tipo Wikipedia con recursos mínimos.
- Despliegue con restricciones energéticas: entornos donde el coste eléctrico domina, como servidores CPU o estaciones Mac, con 93 J por 100 tokens en texto legal con caché KV.
- Investigación en decodificación especulativa: banco de pruebas para comparar borradores basados en memoria frente a borradores neuronales pequeños (TinyLlama) en tasa de aceptación, throughput y energía.
- Prototipado sin GPU: el borrador corre en CPU y permite experimentar con decodificación especulativa en máquinas sin acelerador, manteniendo el modelo grande en fp16 o cuantizado.

## Benchmarks y rendimiento

Resultados del artículo con Mistral-7B-v0.1 como modelo grande, Apple M1 Max (Mac Studio, 32 GB), fp16 en GPU, decodificación greedy, batch size 1, 100 prompts por dominio:

| Configuracion | Dominio | Tasa de aceptacion | Throughput | Energia |
|---|---|---|---|---|
| Sin cache KV, borrador ajustado al dominio | Texto legal UE | 38,1 % | 2,43× | 2,51× menor por token |
| Con cache KV, Olifant | Texto legal UE | no disponible | 1,25× | 93 J por 100 tokens (la mas baja del estudio) |
| Con cache KV, TinyLlama como borrador | Texto legal UE | no disponible | 0,5× (reduce a la mitad) | 3× mayor |
| Con cache KV, Olifant | Texto general | no disponible | ganancias pequenas | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible; el modelo no es evaluable en esas tareas porque no genera texto de forma autónoma.

## Requisitos de hardware

- VRAM: no requiere GPU para el borrador; la inferencia del borrador es en CPU. La VRAM la determina el modelo grande (Mistral-7B-v0.1 en fp16 requiere aproximadamente 14 GB).
- GPU recomendadas para el modelo grande: A100, H100, RTX 4090 o cualquier GPU con memoria suficiente para Mistral-7B; el artículo usa un Apple M1 Max de 32 GB.
- Cabe en GPU de consumo: sí, el modelo grande en cuantización 4-bit (Q4_K_M) cabe en GPUs de 8 GB o más; el borrador no consume VRAM.
- Despliegue: 🤗 Transformers con `custom_generate`, llama-cpp-python con GGUF, y el servidor `timblserver` (instalable con `brew install timblserver` en macOS o `apt install timblserver` en Debian/Ubuntu).
- Latencia del borrador: menos de 0,3 ms por predicción en CPU. Carga inicial de unos segundos para el modelo más pequeño y hasta aproximadamente un minuto para el más grande.
- Throughput: 2,43× sobre el modelo grande sin caché KV y 1,25× con caché KV en texto legal; las ganancias en texto general con caché KV son pequeñas.

## Comparativa con modelos similares

| Modelo | Tipo de borrador | Parametros | Contexto | Tasa de aceptacion | Energia | Licencia |
|---|---|---|---|---|---|---|
| Olifant (`olifant-eurlex`) | Memoria TiMBL IGTree | no disponible (138 MB en disco) | 4 tokens | 38,1 % en legal (sin cache KV) | 93 J/100 tokens (con cache KV) | Apache 2.0 |
| TinyLlama como borrador | Transformer neuronal | 1,1B (aproximado, no confirmado en la informacion) | no disponible | no disponible | 3× mayor que el modelo solo (con cache KV) | Apache 2.0 |
| Decodificacion greedy sin borrador | no aplica | no aplica | no aplica | no aplica | linea base del estudio | no aplica |

No se dispone de datos comparativos con otros borradores de decodificación especulativa (EAGLE, Medusa, borradores destilados) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: los corpus de entrenamiento y las bases de instancias son monolingües en inglés.
- Requiere compartir tokenizador con el modelo grande; está ligado a la tokenización de Mistral-7B-v0.1 y no funciona con modelos de vocabulario distinto.
- Solo soporta decodificación greedy, batch size 1 y no admite sampling ni beam search.
- Con modelos cuantizados en CPU, verificar cuatro o más tokens puede producir logits ligeramente distintos al greedy puro; el autor califica esta ruta de experimental y la divergencia es frecuente con modelos 4-bit.
- Las ganancias dependen de lo bien que la base de instancias coincida con el texto; en texto general con caché KV son pequeñas.
- No es un modelo generativo autónomo: no responde instrucciones, no hace tool calling ni razonamiento; solo predice tokens como borrador.
- Dependencia externa de `timblserver` en la ruta de Transformers, lo que complica el despliegue en contenedores sin ese paquete.
- Riesgo de alucinación y sesgos: los hereda del modelo grande, ya que el texto final es su continuación greedy; las bases de instancias pueden reflejar sesgos de FineWeb-Edu, WikiText, PubMed y LexGLUE.
- Licencia Apache 2.0 para el código y las bases, pero los corpus de entrenamiento tienen términos propios (FineWeb-Edu ODC-By, WikiText CC BY-SA, PubMed y LexGLUE según sus distribuciones), lo que conviene revisar para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/antalvdb/olifant-speculative-ibases
- Artículo (INLG 2026): https://2026.inlgmeeting.org/static/proceedings/long/watermarked_pdfs/25.pdf
- Repositorio de código, pipeline de entrenamiento y scripts de benchmark: https://github.com/antalvdb/olifant-speculative
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- arXiv referenciado en los tags: arxiv:2510.22317
- TiMBL: no disponible enlace directo en la información proporcionada
