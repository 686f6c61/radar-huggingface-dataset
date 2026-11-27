# JamesQuartz/aenea-piloto-1.0

## Resumen

Aenea Piloto-1.0 es un modelo de clasificación de texto desarrollado por AENEA Global (publicado en Hugging Face bajo el identificador `JamesQuartz/aenea-piloto-1.0`) cuyo propósito es actuar como router de despacho para un sistema de mezcla de expertos (MoE). Dado un prompt en inglés, el modelo predice a cuál de nueve dominios de experto debe enrutarse: SyntaxDevOps, Code, Creative, RAG, Architecture, Math, Knowledge, Compliance y Chat. No es un modelo generativo, sino un clasificador de una sola pasada diseñado para ejecutarse en dispositivo (on-device) con una latencia declarada de 95,2 ms de media.

El modelo se construye sobre la arquitectura propietaria Cartan-OLM con atención ortogonal BlockHouseholder, con una configuración de d=512, 20 capas, 8 cabezas de atención y un tamaño de bloque de 64, sumando aproximadamente 47 millones de parámetros. Los pesos se distribuyen en safetensors de bf16 con un tamaño de repositorio de 0,2 GB y un peso declarado de unos 94 MB. Sustituye a toda la línea anterior de modelos Pinta (1.x y 2.x), que sufría confusión sistemática entre clases de despacho adyacentes.

La relevancia del modelo radica en su planteamiento de orquestación eficiente: en lugar de un único modelo grande, un router ligero decide qué experto (posiblemente más grande) debe atender cada consulta, reduciendo el coste computacional en hardware de consumo. El autor declara una mejora de 76% a 92,5% de precisión respecto al mejor checkpoint de Pinta, con solo dos errores de alta confianza sobre 200 prompts de test. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cartan-OLM con atención ortogonal BlockHouseholder (transformer encoder) |
| Parametros totales | ~47M (d=512, L=20, H=8, block_size=64) |
| Parametros activos | no disponible (no es un MoE generativo; es un clasificador que enruta hacia un MoE externo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), tokenizer BPE en tokenizer.json, vocab.json y merges.txt |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Cartan-OLM, definida por el autor como un transformer con atención ortogonal BlockHouseholder, configurado con dimensión oculta 512, 20 capas y 8 cabezas de atención, con un tamaño de bloque de 64. La tokenización corre a cargo de un tokenizador BPE propio denominado QT-Cittern-1.0, empaquetado junto con los pesos. El modelo se distribuye como paquete autocontenido: incluye `_piloto_core.py` (arquitectura solo para inferencia), `piloto.py` (API de router y CLI), `config.json`, los pesos y los ficheros del tokenizador, sin dependencia externa de `cartan_olm`.

El fine-tuning se realizó sobre el modelo base `JamesQuartz/aenea-cartan-olm-base` con 63.636 ejemplos de enrutamiento más 585 ejemplos de reparación quirúrgica de fronteras. Se usó AdamW (beta1=0,9, beta2=0,95) con learning rate 1e-5 para el SFT y 5e-6 para la reparación, en precisión bfloat16. El autor declara un consumo de 1 GPU NVIDIA RTX 4060 para el entrenamiento, aunque la model card indica también una RTX 4090 en los metadatos de emisiones (2,8 kg CO2eq, CodeCarbon, GB-South). Las innovaciones técnicas declaradas incluyen minería de negativos duros (2.000 ejemplos adversariales dirigidos a pares de confusión exactos), aumento con diversidad de estilo (mezcla de dialectos US/GB, variación de puntuación y estructuras), reparación quirúrgica de fronteras y eliminación del sesgo por longitud de prompt.

## Capacidades

- Clasificación de texto en una sola pasada sobre nueve clases de dominio de despacho: SyntaxDevOps, Code, Creative, RAG, Architecture, Math, Knowledge, Compliance y Chat.
- Salida de dominio y confianza asociada, con umbral de confianza configurable y dominio de reserva (fallback) configurable.
- Enrutamiento de prompts individuales hacia un sistema MoE externo (orquestación multi-experto).
- Ejecución en dispositivo (on-device) y en hardware de consumo, con paquete autocontenido.
- API Python (`PilotoRouter`) y CLI en modo interactivo y en modo batch por stdin.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni conversación multi-turno.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Orquestación de un sistema MoE en producción: el router recibe el prompt del usuario y devuelve el dominio y la confianza; el orquestador despacha la consulta al experto correspondiente (Math, Code, RAG, etc.). Es adecuado porque su latencia declarada de 95,2 ms y su tamaño de ~47M permiten colocarlo delante de modelos mucho más grandes sin penalizar la experiencia.
- Enrutamiento en el borde (edge) y en dispositivos de consumo: al pesar ~94 MB en bf16 y ejecutarse en una RTX 4060 según el autor, puede desplegarse en portátiles o estaciones de trabajo sin GPU de datacenter, habilitando asistentes locales con varios expertos.
- Clasificación de tickets de soporte por dominio: los prompts se etiquetan como Compliance, Knowledge, Code o Chat para dirigirlos al equipo o al modelo adecuado, aprovechando la precisión declarada del 100% en Compliance y RAG.
- Prefiltrado en pipelines de RAG: la clase RAG (100% de precisión declarada en el holdout) permite decidir si una consulta debe resolverse contra un índice documental antes de invocar un modelo generativo, reduciendo coste.
- Enrutamiento de consultas matemáticas: la clase Math (100% declarada) permite derivar cálculos a un experto simbólico o a un modelo especializado en matemáticas, evitando que un LLM generalista resuelva operaciones.
- Control de cumplimiento normativo: la clase Compliance (100% declarada) permite desviar consultas sensibles a un flujo de revisión o a un experto con guardarraíles específicos antes de que lleguen a un modelo generativo.
- Desarrollo de herramientas CLI y scripts de automatización: el modo batch por stdin permite clasificar lotes de prompts en pipelines de CI/CD o en tareas de etiquetado offline.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| Piloto Routing Benchmark (9-Class MoE Routing) | Holdout Accuracy (200 prompts) | 92,5% |
| Piloto Routing Benchmark | Latencia media | 95,2 ms |
| Piloto Routing Benchmark | Latencia P95 | 104,0 ms |
| Piloto Routing Benchmark | Throughput | 10,5 prompts/s |

Precisión declarada por clase en el holdout:

| Clase | Dominio | Precisión |
|---|---|---|
| reserved_23 | SyntaxDevOps | 95,5% |
| reserved_24 | Code | 73,9% |
| reserved_25 | Creative | 90,9% |
| reserved_26 | RAG | 100% |
| reserved_27 | Architecture | 90,9% |
| reserved_28 | Math | 100% |
| reserved_29 | Knowledge | 87,0% |
| reserved_30 | Compliance | 100% |
| reserved_31 | Chat | 95,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (pesos de ~94 MB más activaciones y tokenizador); muy holgada en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM; el autor cita una RTX 4060 para entrenamiento y una RTX 4090 en los metadatos de emisiones. Funciona en CPU para inferencia por lotes.
- Cabe en GPU de consumo: sí, en cualquier RTX 30xx/40xx, GTX 16xx o superior, y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el paquete es autocontenido con `_piloto_core.py` y `piloto.py` (API Python y CLI); no requiere `cartan_olm` externo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo estándar de transformers.
- Latencia y throughput: 95,2 ms de media y 104,0 ms P95, con 10,5 prompts/s declarados por el autor (no verificados).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de enrutamiento MoE on-device en la documentación proporcionada. La comparación más directa que ofrece el propio autor es con la línea anterior Pinta:

| Modelo | Parámetros | Precisión holdout | Licencia | Estado |
|---|---|---|---|---|
| Aenea Piloto-1.0 | ~47M | 92,5% | Apache 2.0 | Activo |
| Pinta (mejor checkpoint) | no disponible | 76,0% | no disponible | Retirado por el autor |

## Limitaciones y advertencias

- Solo inglés: el soporte multilingüe está previsto para Piloto-2.0, según el autor.
- La clase Code es la más débil (73,9% de precisión declarada) por ambigüedad genuina con Architecture y SyntaxDevOps; es esperable confusión en prompts de programación que mencionen diseño de sistemas.
- Enrutamiento de un solo prompt: no hay contexto multi-turno, por lo que conversaciones encadenadas pueden clasificarse mal si el prompt aislado es ambiguo.
- No es un modelo de lenguaje autónomo: no genera texto ni razona; solo clasifica. No debe usarse como sustituto de un LLM.
- Los benchmarks son declarados por el autor, no verificados (`verified: false`) y sobre un conjunto de test privado de solo 200 prompts; la robustez estadística es limitada y el sesgo de selección no es auditable.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificación errónea con alta confianza (el autor reporta dos errores de alta confianza sobre 200 prompts).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `JamesQuartz/aenea-cartan-olm-base` y la tokenizador QT-Cittern-1.0 deben verificarse por separado si se redistribuyen.
- La emisión declarada de CO2eq (2,8 kg) y el hardware de entrenamiento presentan una inconsistencia entre la model card (RTX 4060) y los metadatos (RTX 4090); conviene tratarlos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/JamesQuartz/aenea-piloto-1.0
- Modelo base: https://huggingface.co/JamesQuartz/aenea-cartan-olm-base
- Cita del autor (BibTeX en la model card): Downey, James (2026), "AENEA Piloto-1.0: On-Device MoE Routing via Orthogonal Transformers", Hugging Face.
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales fuera de la model card de Hugging Face.
