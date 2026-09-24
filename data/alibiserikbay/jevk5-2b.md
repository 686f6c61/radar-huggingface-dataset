# alibiserikbay/JevK5-2B

## Resumen

JevK5-2B v0.2 es un modelo de decisión tipada desarrollado por alibiserikbay, publicado como alternativa abierta bajo licencia Apache-2.0 al modelo Jev de TypeSafe (con el que no tiene relación). No es un modelo generativo al uso: recibe un documento y una pregunta de sí/no, de elección entre opciones o de puntuación, y devuelve una probabilidad por cada opción en un único forward pass, sin generar texto. La salida es un softmax sobre los logits del siguiente token correspondiente a las letras de las opciones, dividido por una temperatura de calibración fija (T = 1,42).

Está construido sobre Qwen3.5-2B, al que se le ha fusionado un LoRA de rango 16 en las proyecciones de atención y atención lineal, dando un total de 1.881.825.088 parámetros (≈1,88B). Se entrenó con exactamente los mismos datos y la misma receta que JevK5 v0.2 (4B), del que hereda la mayor parte de su precisión con la mitad de memoria: 3,5 GB de pesos en bf16 y aproximadamente 3,8 GB de pico con un documento de 4.000 tokens, o 2,0 GB en GGUF Q8_0.

Su relevancia es la de un componente de decisión autoalojado y barato: clasifica, enruta, extrae y evalúa respuestas con confianza calibrada y en unos 9 ms por decisión en una H100, a costa de ser claramente más débil en aritmética, razonamiento multi-paso y conocimiento general que su hermano de 4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-2B (`qwen3_5_text`) con LoRA de rango 16 fusionado en las proyecciones de atención y atención lineal |
| Parámetros totales | 1.881.825.088 (≈1,88B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens de entrada como límite declarado; las entradas superiores se rechazan, no se truncan |
| Tipos de cuantización | bf16 en el repositorio principal; GGUF Q8_0 (2,0 GB) en JevK5-GGUF. No se listan otros niveles |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio principal, 3,8 GB); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B (Qwen, Apache-2.0), un transformer con proyecciones de atención y de atención lineal, sobre el que se aplicó un LoRA de rango 16 limitado a esas proyecciones y posteriormente se fusionó en los pesos. La innovación principal no está en el backbone sino en la cabeza de lectura: en lugar de decodificar texto, el modelo toma los logits del siguiente token en las posiciones correspondientes a las letras de las opciones y aplica un softmax dividido por una temperatura de calibración (T = 1,42, definida en `jevk5_config.json`). El prompt y el esquema de lectura en un solo paso proceden de SemIf (TheoLeeCJ, MIT).

El entrenamiento replica la receta de JevK5 v0.2 (4B). Qwen3.6-27B, con modo pensamiento activado, generó documentos realistas con preguntas tipadas difíciles en 17 dominios de negocio y respondió cada pregunta dos veces de forma independiente; solo se conservaron las preguntas cuya doble respuesta coincidía con la etiqueta prevista. El conjunto final combina 3.272 de esas preguntas con un número equivalente de elementos etiquetados por humanos procedentes de MMLU-Pro, WANLI, MultiNLI, BoolQ, banking77, ARC y CommonsenseQA. El objetivo fue entropía cruzada sobre los logits de las letras de opción, durante 2 épocas con tasa de aprendizaje 3e-5. La temperatura se ajustó sobre el conjunto retenido de preguntas del profesor. Los autores probaron además, a esta escala de 2B, destilación de las probabilidades de opción de JevK5, tres órdenes de opciones por pregunta, 3.400 preguntas de replay adicionales y una tasa de aprendizaje mayor con un adaptador más grande; ninguna de estas variantes mejoró los resultados retenidos, por lo que se mantuvo la receta simple. No se utilizó ningún elemento de JevBench (ni público ni reservado) ni ninguna salida de Jev para entrenar, ajustar o seleccionar el modelo.

## Capacidades

- Decisión tipada en un solo forward pass: preguntas de sí/no (denominadas `noul` en la model card), de elección entre opciones y de puntuación, con una probabilidad por opción.
- Salida calibrada: cada opción va acompañada de una probabilidad y un campo de confianza, lo que permite fijar umbrales y derivar a revisión humana los casos dudosos.
- Lectura y extracción de información de documentos: 0,91 en extracción sobre el conjunto retenido de preguntas del profesor.
- Enrutado y clasificación: 0,97 en la familia de routing, la tarea donde destaca con más claridad (por encima del 0,89 del modelo de 4B).
- Comparación de compromisos (trade-offs): 0,88, empatado con JevK5 (4B).
- Evaluación de respuestas: 0,70 en la familia de "judging answers", útil como juez barato en pipelines de evaluación.
- Multilingüismo: no disponible; el modelo está entrenado y declarado solo para inglés.
- Tool calling / function calling: no disponible en la información publicada.
- Capacidades de agente y razonamiento multi-paso: soporte limitado (0,67 en búsquedas multi-paso); no es un modelo orientado a agentes.
- Generación de texto, código, matemáticas, visión o audio: no disponible; el modelo no genera texto, solo devuelve distribuciones sobre opciones.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto de la incidencia y un criterio por categorías (por ejemplo, facturación, técnico, ventas) y devuelve la etiqueta con confianza. Es su tarea más fuerte (0,97 en routing) y a 9 ms por decisión permite clasificar en línea sin colas.
- Extracción de decisiones en contratos y expedientes: sobre documentos legales o administrativos, responde preguntas de sí/no del tipo "¿permite el contrato la subrogación?" con una probabilidad asociada, adecuado para triaje previo a revisión jurídica gracias al 0,91 en extracción.
- Verificación de elegibilidad y cumplimiento: en tramitación de permisos del sector público o validación de políticas internas, el modelo evalúa condiciones sobre el texto y marca los casos por debajo de un umbral de confianza para revisión humana.
- Control de calidad en fabricación: comprobación de informes de QC contra criterios predefinidos, con decisión binaria y nivel de confianza por lote, integrable en una línea de producción por su baja latencia.
- Evaluación automática de respuestas de otros modelos: como juez en un pipeline de evaluación (0,70 en la familia de judging answers), comparando pares de respuestas o puntuándolas, con la ventaja de ser autoalojado y no depender de una API externa.
- Etiquetado y anotación asistida: al devolver distribuciones de probabilidad en lugar de texto, sirve para preetiquetar conjuntos de datos de preferencias o clasificación y priorizar qué ejemplos necesitan anotación humana.
- Guardarraíles y enrutado en pipelines de agentes: decisión rápida de si una consulta va a una herramienta, a un modelo mayor o a un humano, con umbral sobre la confianza y sin coste de generación.
- Clasificación de intenciones en atención al cliente: el entrenamiento incluyó banking77, lo que cubre intenciones bancarias frecuentes con etiquetas cortas.

## Benchmarks y rendimiento

Preguntas retenidas del profesor (362 preguntas de tres dominios de negocio no vistos en entrenamiento: arrendamientos residenciales, permisos del sector público y control de calidad industrial). Este es el conjunto usado para elegir entre modelos y ajustar la temperatura.

| Familia | JevK5-2B | JevK5 (4B) |
|---|---:|---:|
| Todas las preguntas retenidas | 0,751 | 0,804 |
| Extracción | 0,91 | 0,94 |
| Routing | 0,97 | 0,89 |
| Trade-offs | 0,88 | 0,88 |
| Evaluación de respuestas | 0,70 | 0,73 |
| Búsquedas multi-paso | 0,67 | 0,76 |
| Preguntas ambiguas | 0,59 | 0,76 |
| Fechas y números | 0,42 | 0,58 |

Cada familia contiene solo entre 21 y 42 elementos, por lo que las filas por familia son aproximadas.

Decisiones públicas de JevBench (231 elementos), ejecutadas con el runner y la puntuación propios de JevBench. Son ejecuciones de los autores, no resultados oficiales: JevK5-2B no se ha enviado a JevBench.

| Split | n | JevK5-2B | JevK5 (4B) |
|---|---:|---:|---:|
| easy | 48 | 1,000 | 1,000 |
| original (estándar) | 72 | 0,806 | 0,958 |
| hard (mitad pública) | 111 | 0,604 | 0,739 |
| Error de calibración en hard (ECE) | — | 0,071 | 0,066 |
| Distancia al gold en ítems de probabilidad (TVD) | 10 | 0,241 | 0,196 |

## Requisitos de hardware

- VRAM en bf16: 3,5 GB de pesos y aproximadamente 3,8 GB de pico con un documento de 4.000 tokens, según los datos del autor. No hay cifra publicada para entradas cercanas al límite de 16.384 tokens; el consumo será superior por el crecimiento de la caché KV.
- VRAM en GGUF Q8_0: 2,0 GB de pesos, con overhead adicional según la implementación.
- GPU recomendadas: no se publica una lista de GPU validadas. La única medición publicada es sobre H100. Dado el tamaño de los pesos, cabe con holgura en cualquier GPU de consumo con 4 GB o más de VRAM libre (por ejemplo, RTX 3060, RTX 4060 o RTX 4090), aunque esto es una estimación derivada, no un dato validado por el autor.
- Opciones de despliegue: runtime JevK5 sobre GPU NVIDIA (`pip install "jevk5[fast] @ git+https://github.com/allebee/jevk5@v0.2.0"`); llama.cpp con el build GGUF en otras GPU, Mac o CPU; la librería declarada en HuggingFace es `transformers`. No se mencionan vLLM, TGI ni Ollama.
- Latencia: aproximadamente 9 ms por decisión en una H100 con el runtime JevK5. Throughput no disponible.
- Advertencia: el modelo no se usa como un LLM generativo, sino a través de la API `decide()` del runtime o de la lectura de logits equivalente; cargarlo con un pipeline de generación estándar no produce su salida prevista.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Retenidas (media) | JevBench original | JevBench hard | Disponibilidad |
|---|---|---|---:|---|---:|---:|---:|---|
| JevK5-2B | 1,88B | 16.384 tokens | Apache-2.0 | 0,751 | 0,806 | 0,604 | HuggingFace, GGUF y runtime |
| JevK5 (4B) | 4B (según la model card; sin cifra exacta) | no disponible | Apache-2.0 | 0,804 | 0,958 | 0,739 | HuggingFace |
| Jev (TypeSafe AI) | no disponible | no disponible | propietaria | no disponible | no disponible | no disponible | Servicio propietario |

El modelo base Qwen3.5-2B no es comparable en la tarea: es un modelo de propósito general orientado a generación, mientras que JevK5-2B es un clasificador de decisión tipada derivado de él. La comparación relevante es con JevK5 (4B), que gana en casi todas las familias salvo en routing (0,89 frente a 0,97), a cambio de duplicar aproximadamente la memoria. Frente a Jev (TypeSafe AI) solo se dispone de la afirmación del autor de que JevK5 es una alternativa abierta; no hay datos de rendimiento de Jev en la información proporcionada.

## Limitaciones y advertencias

- Fechas, importes y búsquedas multi-paso: es la brecha más grande respecto al modelo de 4B (0,42 en fechas y números frente a 0,58; 0,67 frente a 0,76 en multi-paso). No es fiable para cálculos ni para extraer cifras exactas.
- Caída en el tier estándar de JevBench: 0,806 frente al 0,958 del 4B, una diferencia notable para una misma receta de entrenamiento.
- Sin medir en las decisiones selladas de JevBench, donde JevK5 (4B) baja al 33,1 % y todos los modelos de un solo paso sufren. El autor espera un resultado igual o peor en el 2B.
- Solo inglés. Las entradas de más de 16.384 tokens se rechazan en lugar de truncarse, lo que obliga a gestionar el troceado en la aplicación.
- Conjuntos de evaluación pequeños: entre 21 y 42 elementos por familia, con la consiguiente incertidumbre en las cifras por familia.
- Resultados de JevBench autoinformados y ejecutados por los autores; el modelo no se ha enviado a JevBench, por lo que no hay verificación independiente.
- Modelo sin adopción registrada en el momento de los datos (0 descargas y 0 me gusta en HuggingFace), lo que implica ausencia de validación por terceros y de informes de uso en producción.
- No es un modelo generativo, pese a la etiqueta `text-generation` del repositorio. Usarlo con un pipeline de generación convencional no reproduce su comportamiento previsto.
- Riesgo de alucinación y de decisiones erróneas con confianza alta sobre documentos largos o ambiguos (0,59 en preguntas ambiguas); se recomienda umbral de confianza y revisión humana en dominios sensibles.
- Higiene de datos: los autores señalan una corrección compartida con JevK5, ya que su conjunto de calibración escrito a mano reproducía una instrucción pública de JevBench y el enunciado de una regla de un ítem público. Ambos fueron reescritos y el detalle está en `CHANGELOG.md` del repositorio del runtime. No se usaron ítems de JevBench para entrenar, ajustar ni seleccionar.
- Licencia Apache-2.0: permite uso comercial y modificación con las obligaciones habituales de atribución y sin garantías. El modelo no está afiliado a TypeSafe AI ni a Jev, por lo que conviene revisar el uso de esas marcas en productos derivados.
- Hereda las limitaciones del modelo base Qwen3.5-2B en sesgos y cobertura lingüística.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibiserikbay/JevK5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- JevK5 (4B): https://huggingface.co/alibiserikbay/JevK5
- Build GGUF: https://huggingface.co/alibiserikbay/JevK5-GGUF
- Runtime JevK5: https://github.com/allebee/jevk5
- JevBench: https://github.com/fstandhartinger/jevbench
- SemIf (TheoLeeCJ), origen del prompt y de la lectura en un paso: mencionado en los créditos de la model card, sin URL en la información disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces obtenidos correspondían a páginas de viajes entre Eslovenia y Zúrich y no se han utilizado.
