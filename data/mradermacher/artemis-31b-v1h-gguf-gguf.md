# mradermacher/Artemis-31B-v1h-GGUF-GGUF

## Resumen

Artemis-31B-v1h-GGUF-GGUF es una recopilación de cuantizaciones GGUF estáticas del modelo Artemis-31B-v1, publicada por el usuario mradermacher. El modelo original lo desarrolla TheDrummer, y esta ficha cubre únicamente la versión cuantizada distribuida por mradermacher, no el modelo base. Con 30.697.345.596 parámetros totales (aproximadamente 30,7 mil millones), se trata de un modelo de lenguaje de tipo transformer denso orientado a conversación, según los tags del repositorio.

La relevancia de esta publicación es práctica: el repositorio original de TheDrummer ya se distribuye en formato GGUF, y mradermacher ofrece una réplica con hasta once variantes de cuantización (desde Q2_K de 12,0 GB hasta Q8_0 de 32,7 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta servidores con aceleradores profesionales. El repositorio ocupa 211,9 GB en total y acumula 199 descargas y 1 like en el momento de la consulta.

La información pública disponible es escasa: no se especifican la longitud de contexto, la licencia, la composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha documenta con rigor lo que sí está confirmado (parámetros, cuantizaciones, formato, idioma declarado) y marca explícitamente como "no disponible" todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (deducido del tamaño y del pipeline conversacional; no se detalla en la model card) |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base según el dato de parámetros) |
| Modelo base | TheDrummer/Artemis-31B-v1-GGUF |
| Tamaño del repositorio | 211,9 GB |
| Librería declarada | transformers |
| Descargas / likes | 199 / 1 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el número de parámetros (30,7 B) y la naturaleza del repositorio (pipeline conversacional, tags de `transformers` y `gguf`), se trata de un transformer denso de gran tamaño, pero no se confirman detalles como el número de capas, la dimensión oculta, el mecanismo de atención (MHA, GQA, MLA) ni la función de activación. Tampoco se especifica si emplea alguna innovación como atención lineal, decodificación especulativa o arquitectura híbrida.

Respecto al entrenamiento, la model card no aporta información sobre el número de tokens, la composición del dataset, la existencia de fases de RLHF, DPO o fine-tuning supervisado, ni sobre el proceso de alineación. El único dato verificable es que el modelo está etiquetado como conversacional y que su idioma declarado es el inglés. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, por lo que su uso previsto es el diálogo multi-turno.
- Idiomas: únicamente inglés declarado; no hay evidencia de capacidades multilingües.
- Razonamiento y código: no confirmado en la documentación disponible; no se puede afirmar ni descartar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible; el repositorio no incluye proyector multimodal (`skip_mmproj` vacío en la model card).
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Despliegue en GPU de consumo: con cuantizaciones Q4_K_M (18,8 GB) o Q4_K_S (17,9 GB) el modelo puede ejecutarse en GPUs con 24 GB de VRAM, como la RTX 4090, lo que permite probar un modelo de 30,7 B en hardware de escritorio.
- Prototipado de asistentes conversacionales en inglés: al ser un modelo etiquetado como conversacional, es adecuado para construir chatbots de dominio general en inglés durante fases de experimentación, antes de comprometerse con un modelo mayor o con licencia comercial clara.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que permite medir el impacto de la cuantización (por ejemplo, Q2_K frente a Q8_0) en la calidad de las respuestas para un mismo modelo base.
- Inferencia en CPU o entornos sin GPU: las variantes Q2_K (12,0 GB) y Q3_K_S (13,9 GB) reducen el requisito de memoria lo suficiente para ejecutar el modelo con llama.cpp en máquinas con 16 GB de RAM, a costa de una pérdida de calidad notable.
- Servicio de inferencia con llama.cpp u Ollama: el formato GGUF es compatible con estos motores, lo que facilita levantar un endpoint local para pruebas de integración con aplicaciones existentes.
- Investigación sobre cuantización estática frente a imatrix: la model card indica que no hay cuantizaciones ponderadas con imatrix para este modelo, lo que convierte al repositorio en un punto de partida útil para comparar la calidad de cuantizaciones estáticas frente a las ponderadas de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño del archivo GGUF; se recomienda añadir 1-2 GB adicionales para el contexto KV cache):
  - Q2_K: ~12,0 GB
  - Q3_K_S: ~13,9 GB
  - Q3_K_M: ~15,4 GB
  - Q3_K_L: ~16,7 GB
  - IQ4_XS: ~17,0 GB
  - Q4_K_S: ~17,9 GB
  - Q4_K_M: ~18,8 GB
  - Q5_K_S: ~21,4 GB
  - Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o A100 40 GB; para Q8_0, una A100 80 GB o H100. Para Q2_K y Q3_K_S, GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB.
- ¿Cabe en GPU de consumo? Sí, en las cuantizaciones Q2_K a Q4_K_M con GPUs de 16-24 GB. Q5 y superiores requieren 24 GB o más y pueden no caber con contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF (LM Studio, text-generation-webui). La librería declarada es `transformers`, pero el formato de pesos es GGUF, por lo que el uso con `transformers` requiere cargar el modelo base en safetensors, no estas cuantizaciones.
- Latencia y throughput: no disponibles; dependen del hardware y del motor de inferencia, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-31B-v1h-GGUF-GGUF (esta ficha) | 30,7 B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| TheDrummer/Artemis-31B-v1-GGUF (modelo base) | 30,7 B | no disponible | no disponible | GGUF | Hugging Face (TheDrummer) |
| Alternativas de ~30 B en GGUF | no disponible | no disponible | no disponible | GGUF | no disponible |

No se dispone de información suficiente para comparar con modelos alternativos concretos de la misma categoría (por ejemplo, otros modelos de ~30 B cuantizados en GGUF), ya que la documentación proporcionada no incluye datos de rendimiento, contexto ni licencia del modelo base. Se recomienda consultar la model card original de TheDrummer para obtener esos datos antes de establecer comparaciones.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base (TheDrummer/Artemis-31B-v1-GGUF) antes de cualquier despliegue en producción.
- Idioma limitado al inglés: el modelo declara únicamente `en`; no hay evidencia de calidad en castellano u otros idiomas.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que no se puede estimar su calidad relativa frente a otros modelos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación; al ser un modelo entrenado principalmente en inglés, es probable que refleje sesgos culturales y lingüísticos de ese corpus.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; la model card advierte que Q3_K_M es de "lower quality". Para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: la model card indica que no hay cuantizaciones ponderadas con imatrix para este modelo, lo que puede suponer una pérdida de calidad frente a alternativas con imatrix a igual tamaño.
- Repositorio de gran tamaño: 211,9 GB en total; la descarga de todas las variantes no es práctica y conviene seleccionar solo la cuantización necesaria.
- Trazabilidad: esta ficha documenta una recopilación de cuantizaciones, no el modelo original; para citar el modelo en trabajos académicos debe referenciarse TheDrummer/Artemis-31B-v1-GGUF.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/mradermacher/Artemis-31B-v1h-GGUF-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Artemis-31B-v1h-GGUF-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
