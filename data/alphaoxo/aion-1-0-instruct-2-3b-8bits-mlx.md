# AlphaOxO/Aion-1.0-Instruct-2.3B-8bits-mlx

## Resumen

Aion-1.0-Instruct-2.3B-8bits-mlx es una cuantización a 8 bits por peso del modelo instructivo microsoft/Aion-1.0-Instruct-2.3B, publicada por el usuario AlphaOxO. El artefacto está empaquetado en formato MLX (safetensors con `custom_code`) y va dirigido a la inferencia en hardware Apple Silicon mediante la librería mlx-lm. El modelo original lo desarrolla Microsoft y pertenece a la familia Aion, orientada a generación de texto conversacional.

El interés técnico de esta publicación no reside en el modelo base, sino en el proceso de conversión: la model card indica que el modelo es de tipo `bloom`, un tipo que la versión oficial de mlx-lm no soporta, por lo que el autor ha publicado un fork (AlphaKure/mlx-lm) con el soporte necesario y la instrucción de instalación desde un commit concreto. Esto convierte al repositorio en un artefacto experimental y dependiente de una bifurcación no oficial de la librería.

Con 2.288.831.488 parámetros totales (aproximadamente 2,3 mil millones) y un tamaño de repositorio de 2,4 GB, el modelo es manejable en equipos de consumo con memoria unificada. La licencia no está declarada en la información disponible y el único idioma indicado es el inglés. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tipo `bloom` (familia BLOOM), según la model card; detalles internos no disponibles |
| Parametros totales | 2.288.831.488 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits por peso (8-bit MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors con `custom_code`, empaquetado para mlx-lm |
| Modelo base | microsoft/Aion-1.0-Instruct-2.3B |
| Tamano del repositorio | 2,4 GB |
| Libreria / runtime | mlx (mlx-lm, fork AlphaKure/mlx-lm) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La información disponible identifica el tipo de modelo como `bloom`, lo que sitúa la arquitectura en la familia BLOOM (transformer decoder-only con atención causal). No se dispone de detalles sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos adicionales. Tampoco se documentan en la información proporcionada los datos de entrenamiento del modelo base: número de tokens, composición del corpus, uso de RLHF, DPO u otras fases de alineación.

La innovación técnica relevante de este artefacto es la cuantización a 8 bits por peso realizada con mlx-lm y la inclusión de código personalizado (`custom_code`) para soportar el tipo `bloom` en MLX. El autor mantiene un fork de mlx-lm con el soporte añadido y advierte de que, hasta que finalicen las pruebas, la instalación debe hacerse desde un commit específico del fork, no desde el paquete oficial. No se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia adicionales.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el formato instructivo del modelo base.
- Plantilla de chat aplicable mediante `tokenizer.apply_chat_template`, tal como muestra el ejemplo de la model card.
- Generación de texto de propósito general (`text-generation`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Prototipado en Mac con Apple Silicon: el formato MLX y la cuantización a 8 bits permiten cargar el modelo en memoria unificada de equipos Apple y ejecutar inferencia local con `mlx_lm.generate`, útil para validar ideas sin depender de servicios en la nube.
- Asistentes conversacionales locales en inglés: el modelo está etiquetado como conversacional e instructivo, por lo que puede emplearse en aplicaciones de chat de un solo turno o multi-turno con prompts formateados mediante la plantilla de chat.
- Evaluación de la conversión MLX de modelos BLOOM: sirve como banco de pruebas para verificar el soporte de `bloom` en el fork de mlx-lm antes de que se integre en la versión oficial.
- Generación de texto en aplicaciones de escritorio para macOS: al ejecutarse sobre MLX, puede integrarse en herramientas nativas de Apple Silicon con requisitos de memoria moderados (repositorio de 2,4 GB).
- Fines educativos y de investigación: permite estudiar el efecto de la cuantización a 8 bits sobre un modelo instructivo de 2,3 mil millones de parámetros en comparación con el modelo base de Microsoft.
- Pruebas de regresión de pipelines MLX: útil para equipos que mantienen forks de mlx-lm y necesitan un artefacto con `custom_code` para validar la carga de modelos con tipos no soportados oficialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,4 GB en pesos de 8 bits; la inferencia requiere adicionalmente memoria para el contexto KV y el runtime de MLX, por lo que se recomienda al menos 4 GB de memoria unificada disponible.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (series M1, M2, M3, M4 y superiores). No se documenta soporte para GPU NVIDIA o AMD en este artefacto, ya que está empaquetado para MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente; no aplica a GPU discretas de consumo al no ser un formato CUDA.
- Opciones de despliegue: mlx-lm (obligatorio el fork AlphaKure/mlx-lm en el commit `9d7b7fada7732228f46821cc80e32d69ee3f47df`), con los comandos `mlx_lm.generate` y la API `load`/`generate`. vLLM, llama.cpp, Ollama y TGI no están soportados para este formato según la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-8bits-mlx (este) | 2,29 B | no disponible | MLX 8-bit safetensors | no disponible | Hugging Face, requiere fork de mlx-lm |
| microsoft/Aion-1.0-Instruct-2.3B | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otros modelos instructivos de ~2-3 B en MLX | no disponible | no disponible | MLX | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dependencia de un fork no oficial: el modelo requiere instalar mlx-lm desde el repositorio AlphaKure/mlx-lm en un commit concreto; la versión oficial de mlx-lm no soporta el tipo `bloom` según la model card.
- Estado experimental: el propio autor indica que las pruebas no han finalizado y que enviará un PR al repositorio oficial, por lo que la estabilidad y el soporte a largo plazo no están garantizados.
- Licencia no declarada: al no indicarse licencia, no puede confirmarse el uso comercial ni las condiciones de redistribución; debe consultarse el modelo base de Microsoft antes de cualquier despliegue en producción.
- Idioma: solo se declara inglés, sin soporte documentado para castellano u otros idiomas.
- Contexto: no se documenta la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de fiabilidad; al ser un modelo de 2,3 B, es esperable una tasa de alucinación superior a la de modelos de mayor tamaño, aunque no se aportan métricas.
- Sin métricas de calidad: no hay benchmarks publicados que permitan estimar la pérdida de calidad introducida por la cuantización a 8 bits frente al modelo base.
- Sin tracción comunitaria: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se detecten y corrijan rápidamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AlphaOxO/Aion-1.0-Instruct-2.3B-8bits-mlx
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Fork de mlx-lm con soporte `bloom`: https://github.com/AlphaKure/mlx-lm
- Issue de seguimiento del soporte `bloom`: https://github.com/AlphaKure/mlx-lm/issues/16
