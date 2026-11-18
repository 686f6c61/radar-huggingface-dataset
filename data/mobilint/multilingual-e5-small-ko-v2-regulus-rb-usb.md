# mobilint/multilingual-e5-small-ko-v2-regulus-rb-usb

## Resumen

`mobilint/multilingual-e5-small-ko-v2-regulus-rb-usb` es una compilación del modelo de embeddings de frases `dragonkue/multilingual-e5-small-ko-v2` optimizada para ejecutarse sobre la NPU USB `regulus-rb-usb` de Mobilint. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: el codificador del transformer original se ha cuantizado y compilado en un binario propietario (`.mxq`) que se ejecuta en el acelerador, mientras que la capa de embeddings y el pooling se mantienen en el host.

El modelo base es un transformer tipo BERT de 96,2 millones de parámetros, derivado de `intfloat/multilingual-e5-small` y ajustado para coreano e inglés. Su función es generar representaciones vectoriales densas para búsqueda semántica, recuperación de información y similitud textual. Esta versión concreta mantiene la licencia Apache 2.0 y la API de `transformers`, pero introduce una dependencia fuerte del hardware y del runtime de Mobilint.

Su relevancia es acotada: interesa a equipos que ya dispongan de hardware Mobilint y quieran ejecutar un modelo de embeddings en local con bajo consumo, sin GPU dedicada. Para el resto de desarrolladores, el modelo original en formato estándar es la opción práctica, ya que esta compilación no funciona sin la placa REGULUS USB ni el paquete `transformers-mblt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), derivado de multilingual-e5-small |
| Parametros totales | 96.212.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Pesos a 8 bits, activaciones a 16 bits (PTQ calibrado); binario `.mxq` para NPU |
| Idiomas soportados | Coreano (ko) e inglés (en); calibración con pasajes de 11 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (solo capa de embeddings) + `.mxq` (codificador compilado para NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer de tipo BERT con 96,2 millones de parámetros, heredado de `intfloat/multilingual-e5-small` y ajustado por `dragonkue` para coreano e inglés. El modelo produce embeddings de frase mediante mean-pooling de la última capa oculta sobre la máscara de atención y normalización L2. Requiere los prefijos `query: ` y `passage: ` en las entradas, tal como especifica la familia E5.

En esta compilación no hay entrenamiento adicional del modelo base: el trabajo técnico consiste en cuantización post-entrenamiento (pesos a 8 bits, activaciones a 16 bits) calibrada con 1.024 textos y 241.255 tokens, y posterior compilación con `qbcompiler 1.4.1`. El conjunto de calibración combina KLUE-MRC (31,3%), SQuAD (28,1%) y pasajes de FineWeb/FineWeb-2 en 11 idiomas (40,6%). El codificador se ejecuta en la NPU; la búsqueda de embeddings y el pooling se realizan en el host. No se documenta uso de RLHF ni DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generación de embeddings de frase para búsqueda semántica y recuperación densa.
- Similitud semántica entre textos (STS) en coreano e inglés.
- Recuperación pregunta-respuesta sobre corpus documentales (KorQuAD, SQuAD).
- Recuperación de evidencia científica y biomédica (SciFact, NFCorpus).
- Razonamiento multi-paso sobre corpus (Ko-StrategyQA).
- Soporte de batching: cada secuencia del lote se procesa de forma independiente, sin padding.
- Prefijos `query: ` y `passage: ` para distinguir consultas de documentos.
- No soporta tool calling, agentes, visión ni audio.

## Casos de uso

- Búsqueda semántica en coreano sobre documentación técnica: se indexan pasajes con el prefijo `passage: ` y se consulta con `query: `, aprovechando la alta fidelidad frente a fp32 (coseno medio de 0,9990) para no degradar el ranking.
- Motor de preguntas y respuestas sobre base de conocimiento: con R@1 de 0,927 en KorQuAD/SQuAD, es adecuado para recuperar el fragmento relevante antes de pasarlo a un LLM generador.
- Deduplicación y clustering de documentos en inglés y coreano: los embeddings normalizados permiten agrupar textos similares con umbrales de coseno estables.
- Despliegue en edge sin GPU: al ejecutarse en una NPU USB con 10,6 ms por secuencia de 128 tokens, encaja en entornos con restricciones de consumo o sin acelerador gráfico.
- Filtrado de contenido y moderación semántica: comparación de mensajes entrantes contra catálogos de referencia con latencia baja y resultados deterministas (misma entrada, misma salida).
- Sistemas de recomendación basados en similitud textual: comparación de descripciones de productos o artículos mediante coseno entre embeddings.
- Evaluación de calidad de traducción o parafraseo: medición de similitud semántica entre original y variante con las métricas STS reportadas.

## Benchmarks y rendimiento

Resultados de fidelidad frente al modelo base en fp32 sobre CPU, medidos en una placa REGULUS USB de un núcleo. La puntuación fp32 aparece entre corchetes.

| Conjunto | Métrica | Este build |
|---|---|---|
| Coseno de embedding vs fp32 (30.078 textos) | media / percentil 1 / mínimo | 0,9990 / 0,9983 / 0,985 |
| Coseno vs fp32 por idioma (11 idiomas) | rango | 0,9991–0,9992 |
| KorQuAD/SQuAD validación (300 consultas) | R@1 [0,923] / top-1 igual que fp32 | 0,927 / 0,990 |
| KLUE-STS [0,806] | score | 0,807 |
| KorSTS [0,781] | score | 0,781 |
| STSBenchmark [0,849] | score | 0,848 |
| Ko-StrategyQA [0,768] | score | 0,767 |
| NFCorpus [0,316] | score | 0,317 |
| SciFact [0,687] | score | 0,682 |

Rendimiento temporal en `regulus-rb-usb`: 10,6 ms por secuencia de 128 tokens y 52,6 ms a 512 tokens. Se ejecutaron 600 llamadas consecutivas de 16 a 512 tokens sin errores, con salida determinista.

## Requisitos de hardware

- Placa Mobilint REGULUS USB (`regulus-rb-usb`) con su driver instalado; sin ella el modelo no carga.
- Paquete `transformers-mblt>=0.8.0`, que instala `mobilint-qb-runtime` (probado con qbruntime 1.5.3).
- Modo de núcleo: solo `single`.
- No requiere GPU: el codificador se ejecuta en la NPU y el resto en CPU host.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI; el despliegue está atado al stack de Mobilint.
- Memoria del repositorio: 0,4 GB.
- Latencia: 10,6 ms (128 tokens) y 52,6 ms (512 tokens) por secuencia en un núcleo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este build (regulus-rb-usb) | 96,2 M | 512 | ko, en | Apache 2.0 | NPU Mobilint + `transformers-mblt` |
| dragonkue/multilingual-e5-small-ko-v2 | no disponible | no disponible | ko, en | Apache 2.0 | `transformers` estándar (CPU/GPU) |
| intfloat/multilingual-e5-small | 118 M (modelo original E5-small) | 512 | multilingüe | MIT | `transformers`, `sentence-transformers` |
| BGE-small / alternativas pequeñas de embeddings | no disponible | no disponible | variable | variable | `transformers`, ONNX, etc. |

La diferencia clave frente a los modelos base es la portabilidad: esta compilación solo funciona en hardware Mobilint, mientras que las alternativas se ejecutan en cualquier CPU o GPU. A cambio, ofrece latencia baja y determinismo en el acelerador.

## Limitaciones y advertencias

- Dependencia total del hardware Mobilint REGULUS USB y del runtime propietario; no hay fallback a CPU o GPU.
- Solo admite el modo de núcleo `single`.
- Ventana de contexto limitada a 512 tokens; textos más largos requieren truncado o fragmentación.
- Idiomas oficiales limitados a coreano e inglés; el resto solo aparece en calibración y no está garantizado.
- Requiere prefijos `query: ` y `passage: `; omitirlos degrada la calidad de recuperación.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir falsos positivos en similitud semántica.
- Sesgos heredados del modelo base y de los corpus de entrenamiento (KLUE, SQuAD, FineWeb), no evaluados en esta ficha.
- El `model.safetensors` del repositorio solo contiene los pesos de la capa de embeddings; no es un checkpoint completo utilizable fuera del stack Mobilint.
- Uso comercial permitido por Apache 2.0, pero sujeto a las condiciones del software y hardware de Mobilint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilint/multilingual-e5-small-ko-v2-regulus-rb-usb
- Modelo base: https://huggingface.co/dragonkue/multilingual-e5-small-ko-v2
- Modelo original E5: https://huggingface.co/intfloat/multilingual-e5-small
- Versión para `aries-rb`: https://huggingface.co/mobilint/multilingual-e5-small-ko-v2
- Web de Mobilint: https://mobilint.com
- Dataset KLUE: https://huggingface.co/datasets/klue/klue
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
