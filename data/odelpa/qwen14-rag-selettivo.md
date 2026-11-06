# odelpa/qwen14-rag-selettivo

## Resumen

`odelpa/qwen14-rag-selettivo` no es un modelo de pesos, sino un artefacto de código y evaluación que implementa un sistema de generación aumentada por recuperación (RAG) selectivo sobre el modelo `mlx-community/Qwen3-14B-8bit`. Lo desarrolla el autor independiente odelpa y su propósito es demostrar, con metodología estadística rigurosa, si la recuperación BM25 mejora o degrada el rendimiento del modelo base en benchmarks de razonamiento, matemáticas e instrucciones. El resultado central es que un gate selectivo evita que el RAG empeore al modelo base, con una ganancia pequeña y no significativa en ARC-it.

El sistema se apoya en Qwen3-14B en formato MLX de 8 bits, un transformer denso de 14 mil millones de parámetros de la familia Qwen3, ejecutable en Apple Silicon. La innovación no reside en la arquitectura del modelo, sino en la política de activación de la recuperación: un gate que decide por benchmark y por consulta si conviene inyectar contexto recuperado. Para ARC-it el gate se activa con una puntuación BM25 normalizada superior o igual a 0.3 y una confianza sin RAG inferior a 0.9; para GSM8K e IFEval la recuperación se desactiva por completo.

La relevancia actual es metodológica: el repositorio publica el protocolo completo (selección del gate solo en dev, test ejecutado una única vez, significación con McNemar exacto y bootstrap de 10 000 remuestreos) y los resultados crudos, lo que permite auditar la afirmación de que el RAG selectivo "nunca es peor" que el modelo base. Es un caso útil para investigadores que quieran replicar evaluaciones de RAG sin contaminación de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), inferencia con MLX; el artefacto en sí es código de orquestación RAG |
| Parametros totales | 14 000 millones (modelo base Qwen3-14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos base en 8 bits (MLX); el sistema no define cuantizaciones adicionales |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | Apache-2.0 (código y modelo base); índices BM25 bajo CC BY-SA 4.0; texto del preprint CC BY 4.0 |
| Formato de pesos | No aplica: el repositorio no contiene pesos; el modelo base se distribuye en formato MLX |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta el modelo. Utiliza `mlx-community/Qwen3-14B-8bit` en modo no-thinking con decodificación greedy, es decir, sin muestreo estocástico, para maximizar la reproducibilidad de las comparaciones. Sobre esa base se construye un pipeline RAG con recuperación BM25 de tipo léxico: se recuperan los tres mejores fragmentos, se truncan a 700 caracteres y se inyectan en el prompt con la instrucción de usarlos "solo si son útiles". Los índices se construyen a partir de Wikipedia en italiano (`wiki_it`) y de un corpus matemático (`wiki_math`).

La contribución técnica es el gate selectivo. Se elige exclusivamente sobre el split de desarrollo (validación de ARC-it con 286 ejemplos, 60 ejemplos de entrenamiento de GSM8K y 60 identificadores de IFEval no presentes en test), de modo que el conjunto de test permanece disjunto y se ejecuta una sola vez (marcador `TEST_RUN_ONCE`). La significación estadística se calcula offline sobre las salidas crudas mediante prueba exacta de McNemar y bootstrap con 10 000 remuestreos. No hay RLHF, DPO ni ajuste fino posteriores: el sistema es una capa de decisión y prompting sobre un modelo preentrenado e instruido.

## Capacidades

- Generación de texto y razonamiento de opción múltiple sobre ARC-it, con y sin contexto recuperado.
- Razonamiento matemático de varios pasos evaluado en GSM8K.
- Seguimiento de instrucciones evaluado en IFEval.
- Recuperación léxica BM25 con top-3 y truncado a 700 caracteres por fragmento.
- Decisión selectiva de activación de RAG mediante umbrales de puntuación BM25 y confianza del modelo.
- Evaluación estadística integrada: McNemar exacto y bootstrap para comparar sistema y base.
- Soporte bilingüe italiano-inglés en prompts y corpus.
- Ejecución local en Apple Silicon mediante MLX.
- No dispone de tool calling, capacidades de agente, visión ni audio documentadas en la información proporcionada.

## Casos de uso

- Evaluación reproducible de RAG: el repositorio permite replicar el protocolo completo (dev, test único, significación) para medir si la recuperación ayuda o perjudica en un benchmark concreto, usando `qrag.py dev` y `qrag.py test`.
- Investigación metodológica sobre gates: sirve como plantilla para diseñar políticas de activación de recuperación basadas en puntuaciones de retrieval y confianza del modelo, evitando fugas de información entre dev y test.
- Auditoría de afirmaciones de mejora: los ficheros crudos y `significance.py` permiten recalcular p-valores y intervalos de confianza de cualquier resultado publicado, útil en revisión por pares.
- Sistemas RAG en italiano sobre Apple Silicon: el pipeline BM25 con Wikipedia italiana puede adaptarse a dominios concretos sustituyendo los chunks, manteniendo la lógica de gate selectivo.
- Docencia y formación: el código separa construcción de corpus (`build_corpus.py`, `build_chunks.py`, `dl_wiki.py`), evaluación y significación, lo que facilita explicar cada etapa de un sistema RAG.
- Prototipado de asistentes con contexto recuperado: el prompt "usar solo si es útil" y el truncado a 700 caracteres ofrecen una configuración de bajo coste para probar RAG en local antes de escalar a infraestructura GPU.
- Comparación de variantes de recuperación: el mismo arnés permite evaluar recuperación siempre activa frente a selectiva, como muestran los resultados de ARC-it con RAG always-on.

## Benchmarks y rendimiento

| Set | n | Base | RAG selectivo | Aciertos/fallos | McNemar p | Bootstrap 95 % (pt) |
|---|---|---|---|---|---|---|
| ARC-it, gated | 1132 | 0.9046 | 0.9090 | 5 / 0 | 0.0625 (n.s.) | [+0.09, +0.88] |
| ARC-it, RAG always-on wiki_math | 1132 | 0.9046 | 0.8843 | 19 / 42 | 0.0044 (peor) | [−3.36, −0.71] |
| GSM8K, gated (→ OFF) | 150 | 0.9333 | 0.920 | 1 / 3 | 0.625 (n.s.) | [−4.0, +1.33] |
| IFEval (OFF) | 100 | 0.83 | 0.83 | – | – | – |

Configuración final selectiva: ARC-it 0.9090, GSM8K 0.9333 (igual al base), IFEval 0.83 (igual al base). El p de McNemar en ARC-it no alcanza significación a 0.05 y el intervalo bootstrap, aunque excluye el cero, se basa en muy pocos casos discordantes, por lo que debe interpretarse como indicativo.

## Requisitos de hardware

- Modelo base de 14 000 millones de parámetros en 8 bits: se estima un consumo de memoria en torno a 14-16 GB solo para pesos, más overhead de contexto y caché KV; la cifra exacta no está disponible en la información proporcionada.
- Ejecución prevista en Apple Silicon con MLX; el repositorio está pensado para equipos con memoria unificada suficiente para el modelo en 8 bits.
- No se documentan requisitos para GPU NVIDIA (A100, H100, RTX 4090) ni estimaciones de latencia o throughput.
- Despliegue mediante `mlx-lm`; el repositorio incluye `run_q.sh` como script de ejecución y `qrag.py` como arnés de benchmark y RAG.
- Dependencias declaradas: `mlx-lm`, `datasets`, `lm-eval` y `huggingface_hub`.
- Los índices BM25 se descargan como dataset aparte (`odelpa/qwen14-rag-selettivo-index`) y se leen desde `index/wiki_it_chunks.jsonl` e `index/wiki_math_chunks.jsonl`.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| odelpa/qwen14-rag-selettivo | 14 000 M (base) | no disponible | RAG BM25 con gate selectivo sobre Qwen3-14B | Apache-2.0 (código), CC BY-SA 4.0 (índices) | Hugging Face, GitHub |
| Qwen3-14B (base) | 14 000 M | no disponible | Modelo denso sin recuperación | Apache-2.0 | Hugging Face |
| RAG always-on sobre Qwen3-14B | 14 000 M (base) | no disponible | Recuperación BM25 siempre activa | Apache-2.0 (código) | Reproducible con el mismo arnés |
| Otros sistemas RAG con gate | no disponible | no disponible | Políticas de activación de recuperación | no disponible | no disponible |

La comparación directa más relevante es interna: el gate selectivo iguala o supera ligeramente al base (ARC-it 0.9090 frente a 0.9046), mientras que la recuperación siempre activa degrada el resultado (0.8843) con significación estadística (p = 0.0044). No se dispone de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es código y resultados; requiere descargar el modelo base y los índices por separado.
- La ganancia en ARC-it no es estadísticamente significativa (p = 0.0625) y se apoya en solo 5 casos corregidos y 0 degradados.
- El gate está ajustado a tres benchmarks concretos (ARC-it, GSM8K, IFEval) y a umbrales elegidos sobre dev; no hay garantía de generalización a otros dominios o idiomas.
- La recuperación BM25 es léxica y depende de la calidad y cobertura de los corpus `wiki_it` y `wiki_math`; no se evalúan recuperadores densos.
- El truncado a 700 caracteres y el top-3 limitan la cantidad de contexto útil inyectado.
- Riesgo de alucinación inherente al modelo base Qwen3-14B; el sistema no incorpora verificación factual de las respuestas.
- El código contiene rutas absolutas de la máquina original, por lo que requiere adaptación de `T0`, `M` y `SRC` antes de ejecutarse.
- La licencia Apache-2.0 cubre el código y el modelo base, pero los índices derivados de Wikipedia quedan bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición si se redistribuyen.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/odelpa/qwen14-rag-selettivo
- Modelo base: https://huggingface.co/mlx-community/Qwen3-14B-8bit
- Índices BM25: https://huggingface.co/datasets/odelpa/qwen14-rag-selettivo-index
- Resultados crudos: https://huggingface.co/datasets/odelpa/qwen14-rag-v1-risultati
- Código en GitHub: https://github.com/usergdp136/qwen14-rag-selettivo
- Preprint (DOI): https://doi.org/10.5281/zenodo.23674921
- Preprint v1.1 (DOI): https://doi.org/10.5281/zenodo.23674951
