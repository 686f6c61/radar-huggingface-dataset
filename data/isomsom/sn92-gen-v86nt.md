# isomsom/sn92-gen-v86nt

## Resumen

REAX SN92 generalist entry es un modelo de decisión publicado por el usuario isomsom en Hugging Face bajo el identificador `isomsom/sn92-gen-v86nt`. No es un modelo conversacional de propósito general: se trata de un fine-tune derivado de Qwen/Qwen3.8-27B, adaptado mediante LoRA para responder a un prompt fijo de validador y emitir una lectura de letra (A..Z) con softmax a temperatura T=2. Su función es la de "decision model" dentro del track generalista de REAX (SN92), es decir, seleccionar una opción entre varias dadas según reglas, registros públicos o procedimientos.

El modelo conserva la arquitectura del backbone Qwen3.8-27B (transformer denso, 26.085.330.160 parámetros según los pesos en safetensors, es decir, aproximadamente 26,1 mil millones) y se distribuye con licencia Apache-2.0. El repositorio ocupa 52,2 GB, lo que corresponde a pesos en bf16 con el readout ampliado. La model card documenta una cadena de seis etapas de entrenamiento LoRA (r32) con mezclas de datos procedimentales, registros públicos, avisos de seguridad, licitaciones, decisiones comunitarias de Wikipedia y problemas de lógica y código.

Su relevancia es acotada y muy específica: sirve como entrada de referencia para el track generalista de SN92 y como ejemplo de ajuste fino orientado a un formato de salida restringido (lectura de letras) en lugar de generación libre. No está pensado para chat, RAG general ni generación de texto abierta, y su model card no documenta benchmarks, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.8-27B), fine-tune con LoRA r32 y readout de decisión A..Z |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B@1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` y se construye en cadena sobre un decision model previo en formato pplx (`vllm-sr/d3@cf15549a78fc52598ddd1951f321c58372bbd64f`), reescrito al layout de lectura conjunta `decision_config v2`. El ajuste se realiza con LoRA de rango 32 en modo conjunto, con atención completa bidireccional tal y como la sirve el validador de REAX. Las etapas 1 a 3 usan lr 5e-5 sobre el train público de especialistas SN92, filas de fábrica y dev, y splits TRAIN de benchmarks públicos; las etapas 4, 5 y 6 aplican nuevos LoRA r32 sobre el modelo ya fusionado, con learning rates entre 2,5e-5 y 5e-5 y entre 300 y 1000 pasos de 32 filas.

La etapa 6, que corresponde a este checkpoint, reequilibra la mezcla eliminando ítems de lengua, arte y seguridad, e incorpora más formatos de pregunta de dominio nuevo (decisiones bajo reglas, registros públicos, avisos de seguridad, licitaciones públicas, decisiones comunitarias de Wikipedia y juegos resueltos), más ítems de salida de código y lógica multi-paso, y preguntas de hechos con fecha igual o posterior al 1 de agosto de 2026 cuya respuesta objetivo es "I don't know", junto a preguntas respondibles sobre hechos anteriores. Las fuentes de datos de esta etapa incluyen APIs públicas y datasets con licencias permisivas (Amazon MASSIVE, arXiv, CPSC, EUR-Lex, Federal Register, GitHub Advisory Database, legislation.gov.uk, NIST NVD, NOAA NCEI, OpenAlex, OpenFDA, OSHA, TED EU, Wikidata, Wikipedia, entre otras) y generadores procedimentales propios (`procgen_*`) con solucionadores exactos y motores de reglas. Tras la fusión, las filas de lectura A..Z se reescalan con un alfa ajustado y se desplazan restando la media de las filas A y B, un desplazamiento común que deja invariante el softmax de opciones y evita que el readout en bf16 redondee a empates exactos en preguntas de dos opciones.

## Capacidades

- Selección de una opción entre varias (lectura de letra A..Z) dado un prompt fijo de validador, con softmax a T=2.
- Razonamiento sobre reglas y procedimientos: tarifas, subsidios, penalizaciones, tramos de bonus, reembolsos, seguros, permisos de obra, retenciones de datos y similares.
- Preguntas sobre registros públicos: avisos de seguridad (CVE, GitHub Advisory), licitaciones (TED, UK Parliament), recalls (CPSC, OpenFDA), accidentes laborales (OSHA, MSHA), subvenciones (NSF), publicaciones científicas (OpenAlex, NASA NTRS, NIH Reporter).
- Decisiones comunitarias de Wikipedia (AfD, XfD, requested moves, requests for adminship).
- Juegos resueltos y búsqueda exhaustiva: ajedrez (Stockfish, KQK/KRK con DTM), Connect4, Nim, tres en raya con minimax.
- Lógica multi-paso y aritmética procedimental (procgen_arithmetic, procgen_logic, procgen_causal, procgen_probability).
- Generación de código y SQL en formato de respuesta corta (procgen_python_code, procgen_sql_sqlite).
- Manejo explícito de "no lo sé" para hechos posteriores al 1 de agosto de 2026, con preguntas de control sobre hechos anteriores.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Validación de tracks de decisión en REAX/SN92: el modelo se sirve con el prompt fijo del validador y la lectura de letras, por lo que su uso principal es producir la respuesta canónica del track generalista y comparar contra el resto de entradas.
- Automatización de reglas administrativas: cálculo de tramos de bonus, tarifas de aparcamiento, peajes, dietas, subsidios de guardería o permisos de obra a partir de un enunciado y un conjunto de opciones, usando los generadores procedimentales con solucionador exacto como referencia.
- Triaje de avisos de seguridad: dado un CVE o un aviso de GitHub Advisory con sus campos, seleccionar la severidad, el paquete afectado o la acción recomendada entre opciones predefinidas.
- Apoyo a licitaciones y contratación pública: clasificar o decidir sobre expedientes de TED y del Parlamento británico con base en los metadatos del registro, en un formato de pregunta cerrada.
- Moderación asistida de decisiones comunitarias: clasificar solicitudes de borrado, cambios de nombre o adminship de Wikipedia según el resultado esperado, como señal auxiliar para revisores humanos.
- Verificación de lógica y código en pipelines de evaluación: usar el modelo como juez de opción múltiple sobre ítems de Python, SQL y lógica multi-paso, comparando su lectura con el solucionador exacto.
- Detección de conocimiento obsoleto: aprovechar el comportamiento entrenado de responder "I don't know" a hechos posteriores al 1 de agosto de 2026 para auditar la fecha de corte efectiva del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 52 GB solo para pesos (26,1 mil millones de parámetros a 2 bytes), más overhead de activaciones y KV cache; en la práctica se requiere al menos una GPU de 80 GB.
- Cuantización a 8 bits: en torno a 26-30 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizaciones de 4 bits (~13-15 GB) y contexto corto.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o dos RTX 4090/A6000 en paralelo para bf16; una sola RTX 4090 o L40S para 4 bits.
- Cabe en GPU de consumo únicamente con cuantización de 4 bits (RTX 4090, RTX 3090, 4090 Mobile con 16 GB queda justo) y siempre que el prompt del validador sea corto.
- Opciones de despliegue: vLLM (el linaje declara compatibilidad con el servido del validador), llama.cpp/GGUF y Ollama para cuantizaciones locales, TGI para serving estándar. El readout de letras requiere implementar el softmax a T=2 y el desplazamiento de filas descrito en la model card.
- Latencia y throughput: no disponibles. Al ser un modelo de 26B denso, se espera un throughput bajo en comparación con modelos MoE de tamaño similar; no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isomsom/sn92-gen-v86nt | 26,1 B | no disponible | Decision model (fine-tune LoRA de Qwen3.8-27B) | Apache-2.0 | Hugging Face, 48 descargas |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | LLM denso conversacional | Apache-2.0 (según base declarada) | Hugging Face |
| vllm-sr/d3 | no disponible | no disponible | Decision model pplx | Apache-2.0 (según linaje) | Hugging Face |
| Modelos de decisión SN92 especialistas (`decisionmodels/sn92-specialists`) | no disponible | no disponible | Especialistas por dominio | CC-BY-4.0 (datos) | Hugging Face |

La comparación con LLMs generalistas no es directa: el modelo está entrenado para un formato de salida restringido y no para generación abierta, por lo que las métricas de MMLU o HumanEval no serían representativas sin adaptar el protocolo de evaluación.

## Limitaciones y advertencias

- El modelo no es conversacional: espera el prompt fijo del validador y emite una letra; usarlo fuera de ese protocolo produce salidas sin garantía.
- El readout requiere el softmax a T=2 y el desplazamiento de filas A..Z descrito en la model card; una implementación incorrecta invalida las respuestas de dos opciones.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación; la model card no documenta ninguna.
- El entrenamiento incluye ítems con fecha de corte explícita (1 de agosto de 2026) y respuestas "I don't know" para hechos posteriores; el conocimiento factual anterior puede estar desactualizado o ser incorrecto.
- La mezcla de la etapa 6 elimina ítems de lengua, arte y seguridad, por lo que el rendimiento en esos dominios es previsiblemente peor que en las etapas anteriores.
- El repositorio contiene solo pesos, sin código; la integración con el validador de REAX debe implementarse por separado.
- Licencia Apache-2.0 permite uso comercial, pero las fuentes de datos tienen licencias diversas (CC-BY-4.0, CC0, OGL, public domain, CC-BY-SA-4.0); la model card no detalla obligaciones de atribución por fuente más allá de la sección 4 de Apache-2.0.
- El modelo tiene 48 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/isomsom/sn92-gen-v86nt
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo base: `Qwen/Qwen3.8-27B@1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`
- Linaje intermedio (decision model pplx): `vllm-sr/d3@cf15549a78fc52598ddd1951f321c58372bbd64f`
- Dataset de especialistas SN92: `decisionmodels/sn92-specialists` (CC-BY-4.0)
- Dataset procedimental: `tasksource/procedural-typed-decisions` (Apache-2.0)
