# runmyai/Ling-3.0-Flash-TokenWing

## Resumen

Ling-3.0-Flash-TokenWing es una redistribución del modelo Ling-3.0-flash desarrollado por inclusionAI, publicada por el usuario runmyai bajo el formato TokenWing. Se trata de un modelo de mezcla de expertos (MoE) con 127.486.405.600 parámetros totales, reempaquetado para que sus pesos puedan leerse directamente desde un SSD mediante la herramienta TokenWing, lo que permite ejecutar un modelo de gran tamaño en ordenadores personales con menos memoria RAM que el tamaño total del modelo.

La innovación principal no está en el modelo en sí, sino en el formato de distribución: los pesos mantienen la cuantización MXFP4 original, pero el layout del archivo se ha reorganizado para que los expertos puedan leerse de forma secuencial desde disco. Esto convierte al modelo en candidato para despliegues en hardware de consumo donde no cabe en VRAM ni en RAM convencional.

El modelo base Ling-3.0-flash está orientado a conversación y dispone de endpoints compatibles según los tags del repositorio. La licencia es MIT, heredada del modelo original, y el crédito corresponde a inclusionAI. La información pública disponible sobre capacidades, benchmarks e idiomas es muy limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer |
| Parámetros totales | 127.486.405.600 (≈127,5 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (pesos originales sin cambios) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF con layout TokenWing (lectura desde SSD) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) de tipo transformer, según indican los tags del repositorio y la model card. El dato de parámetros totales confirmado en safetensors es de 127.486.405.600, lo que sitúa al modelo en la categoría de aproximadamente 127 mil millones de parámetros. No se dispone de información sobre el número de parámetros activos por token, el número de expertos, la dimensión oculta ni la configuración de atención.

En cuanto al entrenamiento, no hay datos publicados en la información disponible sobre el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card del repositorio redistribuido no incluye detalles del proceso de entrenamiento del modelo base.

La particularidad técnica de esta publicación es el formato TokenWing: los pesos MXFP4 se mantienen sin recuantizar, pero el archivo se reorganiza para que los expertos puedan leerse de forma directa desde el SSD, añadiendo los datos propios de TokenWing para este modelo. Esto permite la ejecución en streaming desde almacenamiento, reduciendo el requisito de memoria respecto al tamaño total del modelo.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Compatibilidad con endpoints, según el tag `endpoints_compatible`.
- Ejecución en streaming desde SSD mediante TokenWing, lo que permite inferencia en equipos con menos memoria que el tamaño del modelo.
- No se dispone de información publicada sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código o capacidades multimodales.
- No se dispone de información publicada sobre capacidades multilingües específicas ni sobre modos especiales (thinking mode, visión, audio).

## Casos de uso

- Ejecución local de un modelo MoE de gran tamaño en PC de consumo: gracias al layout TokenWing, los expertos se leen desde el SSD, permitiendo usar el modelo en equipos con menos memoria que los 127,5 mil millones de parámetros del modelo completo.
- Despliegue en estaciones de trabajo con SSD NVMe y RAM limitada: el streaming desde disco evita la necesidad de cargar todos los pesos en memoria, lo que facilita prototipado local sin GPU de数据中心.
- Experimentación con modelos MoE de escala grande para investigación: permite estudiar el comportamiento de un MoE de ~127B en entornos de laboratorio con hardware modesto, a costa de latencia de disco.
- Integración en la aplicación Run My AI: la app descarga el modelo y configura el entorno automáticamente, lo que simplifica la puesta en marcha para usuarios sin experiencia en despliegue.
- Pruebas de compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede exponerse mediante una API compatible con endpoints estándar, útil para integrarlo en aplicaciones existentes.
- Evaluación comparativa de estrategias de cuantización y streaming: al mantener MXFP4 sin cambios, sirve para medir el impacto del streaming desde SSD frente a la carga completa en memoria en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo completo tiene 127,5 mil millones de parámetros en MXFP4; el requisito de memoria depende del número de parámetros activos y del soporte de streaming de TokenWing, que permite ejecutar con menos memoria que el tamaño total del modelo.
- GPU recomendadas: no disponible. No se especifican GPU concretas en la información proporcionada.
- ¿Cabe en GPU de consumo?: el formato TokenWing está diseñado para ejecutarse en PC ordinarios con streaming desde SSD, no necesariamente en VRAM de GPU de consumo.
- Opciones de despliegue: TokenWing (streaming desde SSD), aplicación Run My AI. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.0-Flash-TokenWing | ≈127,5 B (MoE) | no disponible | MIT | GGUF TokenWing (MXFP4) | Streaming desde SSD, ejecución en PC con menos memoria que el tamaño del modelo |
| Ling-3.0-flash (base) | no disponible en esta ficha | no disponible | MIT (según el redistribuido) | no disponible | Modelo original de inclusionAI; esta publicación es un reempaquetado |
| Alternativas de ~120-130B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base.
- El rendimiento en streaming desde SSD depende de la velocidad del disco; un SSD lento puede degradar la latencia de forma significativa.
- El modelo se distribuye en MXFP4, lo que implica una precisión reducida respecto a los pesos originales en mayor precisión; no se documenta el impacto en calidad.
- No se confirma el soporte de tool calling, agentes o multimodalidad, por lo que no debe asumirse en producción.
- La licencia es MIT, lo que permite uso comercial, pero el crédito corresponde a inclusionAI y conviene revisar la licencia del modelo base original para confirmar compatibilidad.
- El repositorio tiene muy pocas descargas y likes (1 descarga, 0 likes en el momento de la consulta), lo que indica escasa validación por parte de la comunidad.
- No se dispone de información sobre el contexto máximo soportado, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/runmyai/Ling-3.0-Flash-TokenWing
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Repositorio TokenWing: https://github.com/runmyai/tokenwing
- Aplicación Run My AI: https://runmyai.org
