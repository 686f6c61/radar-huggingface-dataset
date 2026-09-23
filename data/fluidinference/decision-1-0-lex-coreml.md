# FluidInference/decision-1.0-lex-coreml

## Resumen

decision-1.0-lex-coreml es una conversión a Core ML en FP16 del modelo llm-semantic-router/Decision-1.0-Lex-0.6B, publicada por FluidInference. No se trata de un modelo generativo de propósito general, sino de un modelo de decisión con tres rutas entrenadas que se materializan en tres paquetes Core ML independientes: `choice.mlpackage`, `noul.mlpackage` y `score.mlpackage`. Su función es resolver tareas de selección y puntuación sobre conjuntos acotados de candidatos, no la generación libre de texto.

La conversión conserva 571.909.635 parámetros nativos únicos, incluyendo todas las rutas y cabezas entrenadas. El repositorio ocupa 2,0 GB y los tres paquetes instalados suman 1931,4 MB, ya que cada grafo incorpora su propia copia de los embeddings. El presupuesto de entrada público del modelo fuente es de 1024 tokens, pero esta versión inicial emplea formas fijas de 128 tokens por paquete y un número fijo de espacios de candidatos (tres en `choice` y `score`, dos en `noul`).

Su relevancia actual radica en que permite ejecutar decisiones semánticas completamente en dispositivo sobre hardware Apple, sin enviar datos a un servidor. La model card advierte explícitamente de que se trata de una release inicial de forma fija y de que las peticiones que excedan las formas soportadas deben rechazarse o servirse con una variante posterior, ya que truncarlas en silencio altera el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la model card la describe como conversión Core ML de un modelo de decisión (llm-semantic-router/Decision-1.0-Lex-0.6B) con tres rutas entrenadas |
| Parametros totales | 571.909.635 parámetros nativos únicos. El tracker externo estima 307,8 M para el encoder de esta entrada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens por grafo (forma fija). Presupuesto de entrada público del modelo fuente: 1024 tokens |
| Tipos de cuantizacion | FP16 (Core ML) |
| Idiomas soportados | no disponible (tokenizer heredado de origen Gemma) |
| Licencia | other — apache-2.0-plus-inherited-tokenizer-terms |
| Formato de pesos | Core ML (.mlpackage, FP16): choice.mlpackage, noul.mlpackage, score.mlpackage |

## Arquitectura y entrenamiento

La entrada es una conversión, no un entrenamiento nuevo. El modelo nativo procede de llm-semantic-router/Decision-1.0-Lex-0.6B, en la revisión `ee8e74d912fca8328a353c11d174b44da3f91781`, y cuenta con 571.909.635 parámetros únicos y tres rutas de decisión entrenadas. La conversión Core ML replica esas rutas en tres grafos separados que, según el autor, implementan conjuntamente el comportamiento del modelo nativo: invocar únicamente `choice.mlpackage` no equivale al modelo completo. La model card no detalla la arquitectura interna (tipo de transformer, capas, mecanismos de atención) ni la composición del dataset, el número de tokens de entrenamiento o si hubo fases de RLHF o DPO.

En el plano técnico, lo destacable es el proceso de conversión: el script `conversion/run_coreml.py` fija el renderer de "System One", el tokenizer, las máscaras de candidatos, el softmax y el mapeo de salidas. La verificación de paridad se realizó contra el modelo nativo fijado usando los ejemplos reales de decisión y de System One del repositorio fuente. El autor subraya que esta comprobación es pequeña y no constituye una puntuación oficial del Decision Index ni una evaluación amplia de calidad. Tanto el tokenizer como el runtime de origen se mantuvieron sin reentrenar ni modificar.

## Capacidades

- Selección entre candidatos: la ruta `choice` opera con 128 tokens de entrada y tres espacios de candidatos.
- Selección binaria: la ruta `noul` trabaja con 128 tokens y dos espacios de candidatos.
- Puntuación: la ruta `score` evalúa 128 tokens de entrada con tres espacios de candidatos.
- Inferencia en dispositivo: toda la ejecución está pensada para Core ML, sin dependencia de servicio remoto.
- Integración de las tres rutas: los tres paquetes deben considerarse conjuntamente para reproducir el comportamiento del modelo nativo.
- Generación de texto libre: no disponible; no es una capacidad descrita para este modelo.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; la model card no declara idiomas soportados.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutado semántico local en aplicaciones iOS o macOS: dado un conjunto acotado de hasta tres candidatos, la ruta `choice` permite decidir en el propio dispositivo qué opción corresponde a la consulta, evitando enviar el texto del usuario a un servidor.
- Selección de la mejor respuesta entre salidas candidatas: en un asistente que genera varias respuestas con un modelo grande en servidor, la ruta `score` puede ordenar hasta tres candidatos y elegir el más adecuado en el dispositivo.
- Filtrado y guardarraíles locales: la ruta `noul` (dos espacios de candidatos) encaja en decisiones binarias del tipo aceptar o rechazar una entrada antes de que salga del dispositivo.
- Clasificación sensible a la privacidad: al ejecutarse íntegramente en Core ML, es adecuado para aplicaciones que procesan texto confidencial y no pueden recurrir a APIs externas.
- Componente de decisión en pipelines de recuperación: puntuar y seleccionar entre un conjunto pequeño de fragmentos recuperados, siempre que el número de candidatos no supere los espacios soportados.
- Prototipado y validación de conversiones Core ML: el repositorio incluye código de conversión, locks de origen, fixtures reales e informes en `conversion/` y `reports/`, lo que lo hace útil como referencia para quien convierta modelos similares.
- Despliegue offline en entornos sin conectividad: escenarios de campo, industria o dispositivos aislados donde no hay red pero sí hardware Apple con Neural Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad estándar, y advierte que no existe una puntuación oficial del Decision Index atribuida a esta build.

El único dato cuantitativo publicado es la comprobación de paridad frente al modelo nativo, sobre un conjunto reducido de dos peticiones fuente validadas por ruta:

| Ruta | Tokens | Slots de candidatos | Paquete FP16 (MB) | Peticiones fuente validadas | Error maximo de probabilidad vs nativo |
|---|---:|---:|---:|---:|---:|
| choice | 128 | 3 | 643,8 | 2 | 0,000516415 |
| noul | 128 | 2 | 643,8 | 2 | 0,00113606 |
| score | 128 | 3 | 643,8 | 2 | 0,00046593 |

Los tres paquetes suman 1931,4 MB. El autor indica que esta comprobación de paridad solo establece el comportamiento de la conversión en esas entradas concretas y no una evaluación amplia de calidad.

## Requisitos de hardware

- Almacenamiento: 1931,4 MB para los tres paquetes FP16, sin contar el espacio adicional de compilación de Core ML. Cada paquete individual ocupa 643,8 MB.
- Memoria unificada estimada: alrededor de 2 GB para cargar los tres grafos, más el overhead del runtime de Core ML y de la compilación.
- GPU recomendadas: no aplica en el sentido habitual; el destino es hardware Apple. Se espera ejecución en Apple Silicon (M1, M2, M3, M4 o posteriores) aprovechando CPU, GPU y Neural Engine.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este formato; el modelo se distribuye como Core ML y no como safetensors o GGUF.
- Cabe en dispositivo de consumo: sí, en equipos Apple con suficiente memoria unificada; no está pensado para GPU de consumo NVIDIA.
- Opciones de despliegue: Core ML mediante coremltools; el repositorio incluye un flujo reproducible con `uv sync --project conversion` y `uv run --project conversion python conversion/run_coreml.py --repo-root . --request-json conversion/upstream-system-one.json`.
- vLLM, llama.cpp, Ollama y TGI: no aplicables a este formato de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables en la documentación proporcionada. La única referencia directa es el modelo del que deriva esta conversión:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/decision-1.0-lex-coreml | 571.909.635 nativos únicos | 128 tokens por grafo (presupuesto fuente de 1024) | Core ML FP16 | apache-2.0-plus-inherited-tokenizer-terms | HuggingFace, 2,0 GB, 0 descargas |
| llm-semantic-router/Decision-1.0-Lex-0.6B (origen) | 571.909.635 nativos únicos | 1024 tokens (presupuesto público) | Artefactos nativos del repositorio fuente | No especificada en la información disponible | HuggingFace, revisión `ee8e74d9...` |

Cualquier comparación con modelos de decisión o enrutado de otros proveedores no puede realizarse con los datos disponibles.

## Limitaciones y advertencias

- Formas fijas: esta release inicial solo admite 128 tokens y un número fijo de espacios de candidatos (tres en `choice` y `score`, dos en `noul`). Las peticiones más largas o con más candidatos deben rechazarse o derivarse a una variante posterior.
- El truncado silencioso altera el modelo, según advierte explícitamente el autor.
- No es el modelo completo si se invoca una sola ruta: `choice.mlpackage` por sí solo no reproduce el comportamiento nativo; hacen falta las tres rutas.
- Duplicación de embeddings: cada grafo incluye su propia copia, por lo que el tamaño instalado (1931,4 MB) supera la carga de parámetros únicos, y no incluye el coste de compilación de Core ML.
- Falta de evaluación de calidad: la paridad se comprobó sobre dos peticiones por ruta; no hay puntuación oficial del Decision Index ni benchmarks de calidad.
- Atribución de rendimiento: el tracker externo estima un encoder de 307,8 M parámetros, pero esta build contiene unos 572 M parámetros nativos y su adaptador histórico de serving no está verificado públicamente, por lo que la puntuación del tracker no se atribuye a esta conversión.
- Licencia mixta: las contribuciones de Decision son Apache 2.0, pero el tokenizer heredado incorpora términos adicionales de origen Gemma. Es imprescindible revisar `LICENSE`, `NOTICE`, `LICENSING_STATUS.md`, `DISTRIBUTION_TERMS.md` y `LICENSES/` antes de un uso comercial.
- Idiomas soportados no declarados: no puede asumirse cobertura multilingüe.
- Sesgos y alucinación: no disponible; la model card no documenta sesgos conocidos ni tasas de error más allá de la paridad numérica.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin fecha de actualización posterior a la de creación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FluidInference/decision-1.0-lex-coreml
- Términos de distribución: https://huggingface.co/FluidInference/decision-1.0-lex-coreml/blob/main/DISTRIBUTION_TERMS.md
- Modelo fuente: https://huggingface.co/llm-semantic-router/Decision-1.0-Lex-0.6B
- Código de conversión e informes: carpetas `conversion/` y `reports/` del repositorio
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran plantillas legales en alemán sin relación con el contenido de esta ficha.
