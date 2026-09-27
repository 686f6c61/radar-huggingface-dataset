# semprerudi/maschera-ch-v63b

## Resumen

maschera-ch-v63b es un modelo de clasificación de tokens (token classification) desarrollado por el usuario semprerudi para detectar y etiquetar datos personales en documentos suizos. No es un modelo generativo: es un etiquetador de spans con esquema BIO que marca fragmentos de texto para que puedan sustituirse por marcadores de posición antes de entregar un documento a un servicio de IA de terceros. Cubre las tres lenguas nacionales suizas (alemán, francés e italiano) y el inglés, y deja explícitamente fuera el romanche.

El modelo se construye sobre `jhu-clsp/mmBERT-base` (arquitectura ModernBERT, 22 capas, 308M de parámetros según la model card; 307.600.219 parámetros reales en los safetensors). El vocabulario de etiquetas es un contrato congelado de 91 etiquetas BIO sobre 45 tags, que incluye identificadores suizos con dígito de control (AHV, UID, IBAN, referencia QR, GLN), direcciones, nombres, fechas y referencias administrativas. La ventana de contexto es de 512 tokens y la gestión de documentos largos se delega en la herramienta que lo invoca.

Su relevancia actual es doble. Por un lado, es la etapa de reconocimiento de MASCHERA, una herramienta local de enmascaramiento que se ejecuta en el dispositivo del usuario y no envía datos a ningún servidor. Por otro, publica de forma inusualmente honesta tanto las métricas favorables (F1 de 0,993 y tasa de fuga del 0,00 % sobre datos sintéticos) como las desfavorables (F1 de 0,739 y fuga del 1,27 % sobre nueve documentos reales anotados a mano), además de advertir que es seudonimización reversible y no anonimización. Es un modelo de nicho, con 38 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), base `jhu-clsp/mmBERT-base`, 22 capas |
| Parámetros totales | 307.600.219 (safetensors); la model card indica 308M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens; los documentos más largos se ventanean desde la herramienta, no desde el modelo |
| Tipos de cuantización | No disponible (el repositorio publica únicamente `model.safetensors` en el repo de 1,3 GB; no se documentan versiones GGUF, ONNX ni int8) |
| Idiomas soportados | Alemán, francés, italiano e inglés. Romanche no soportado |
| Licencia | MIT (pesos del modelo) |
| Formato de pesos | safetensors (`model.safetensors`, 1,2 GB) |
| Tarea | Token classification (pipeline `token-classification`), esquema BIO |
| Etiquetas | 91 etiquetas BIO sobre 45 tags, contrato congelado `b7a96dc9` |
| Librería | transformers |
| Fecha de creación | 3 de septiembre de 2026 |
| Última actualización | 26 de septiembre de 2026 |
| Descargas / likes | 38 / 0 |

## Arquitectura y entrenamiento

La base es ModernBERT, un encoder transformer de 22 capas preentrenado de forma multilingüe (`jhu-clsp/mmBERT-base`). Sobre esa base se ha hecho un ajuste fino para token classification con etiquetado BIO: cada token recibe una etiqueta de inicio, continuación o fuera de entidad, y las 45 categorías del contrato cubren identificadores suizos con dígito de control (AHV, UID, IBAN, referencia QR, GLN), direcciones (calle, número de edificio, código postal, localidad), nombres, fechas y referencias administrativas. No hay componente generativo, ni decodificación especulativa, ni atención lineal, ni modo de razonamiento: la salida es una secuencia de etiquetas alineada con la entrada.

El entrenamiento se hizo exclusivamente con datos sintéticos, generados a partir de plantillas y nomenclaturas del repositorio del autor; el modelo nunca ha visto un documento real. Los valores se extraen de fuentes administrativas suizas abiertas: apellidos y nombres del Federal Statistical Office (BFS), localidades con código postal y calles de swisstopo, lugares de origen según eCH-0135 y nombres de empresas de Zefix / EHRA vía LINDAS. Los hiperparámetros declarados, leídos de `training_args.bin`, son 3 épocas, learning rate 3e-5 con scheduler lineal y warmup 0,1, batch efectivo de 8 × 2 con acumulación de gradiente, weight decay 0,01, precisión bf16, max_length 512 y semilla de entrenamiento 4711. La semilla del conjunto de entrenamiento no está registrada en ningún sitio publicado, de modo que la ruta de generación es reproducible pero no lo es exactamente la ejecución concreta. El autor indica que el modelo está inspirado en la idea de rizzo-pii, sin afiliación con ese proyecto.

## Capacidades

- Detección y etiquetado de datos personales en texto: nombres, direcciones, fechas y referencias administrativas en documentos suizos.
- Reconocimiento de identificadores suizos con dígito de control: AHV (número de seguro social), UID, IBAN, referencia QR y GLN.
- Etiquetado BIO con 91 etiquetas sobre 45 tags, lo que permite mapear cada span a un marcador de posición (`[FULLNAME_1]`, `[AHVN13_1]`, `[STREET_1]`, etc.).
- Cobertura multilingüe limitada a alemán, francés, italiano e inglés. El romanche no está cubierto ni en patrones ni en datos de entrenamiento.
- Funciona como etapa de reconocimiento dentro de una herramienta de enmascaramiento local (MASCHERA), sin envío de datos a servicios externos.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso: es un componente de un solo paso dentro de un pipeline mayor.

## Casos de uso

- Enmascaramiento previo al envío a un LLM externo: el modelo etiqueta los spans con datos personales de un documento administrativo suizo y la herramienta los sustituye por marcadores antes de enviar el texto a un servicio de terceros. Es exactamente el caso para el que fue diseñado.
- Cumplimiento de la legislación suiza de protección de datos en despachos legales y notarías: seudonimización de expedientes y correspondencia con clientes antes de compartirlos con proveedores tecnológicos, asumiendo la revisión humana obligatoria que la model card exige.
- Sector sanitario y asegurador: seudonimización de informes y expedientes en alemán, francés o italiano antes de pasarlos a sistemas de análisis; el etiquetado cubre nombres, direcciones y números AHV, que son los identificadores más sensibles en este ámbito.
- Banca y finanzas: detección de IBAN, referencia QR, UID y GLN en comunicaciones y extractos antes de incorporarlos a un pipeline de análisis o a un asistente conversacional alojado fuera de la entidad.
- Recursos humanos y nóminas: preprocesado de contratos, altas y justificantes donde aparecen simultáneamente nombres, direcciones, números AHV e IBAN, con el objetivo de generar versiones reducidas para archivo o cesión a terceros.
- Preparación de corpus para investigación y publicación: creación de conjuntos de datos con datos personales seudonimizados para su análisis estadístico o su publicación, teniendo en cuenta que el proceso es reversible mientras exista el diccionario de correspondencias.
- Etiquetado asistido de documentación multilingüe en la administración pública suiza: tratamiento de comunicaciones redactadas en alemán, francés, italiano o inglés con un único modelo, evitando mantener cuatro pipelines lingüísticos separados.
- Integración como módulo de reconocimiento en herramientas propias: dado que los pesos son MIT y la arquitectura es estándar en `transformers`, puede incorporarse como componente de detección dentro de un sistema mayor de gestión documental.

## Benchmarks y rendimiento

El autor publica dos mediciones, ambas sobre el propio modelo:

| Conjunto | Tamaño | Spans anotados | Tasa de fuga | Micro-F1 | Sobreenmascaramiento | Reproducible |
|---|---|---|---|---|---|---|
| Sintético | 2000 documentos | 29.493 | 0,00 % (0 fugas) | 0,993 | 222 | Sí |
| Documentos reales (gold) | 9 documentos | 280 | 1,27 % (6 fugas) | 0,739 | 94 | No |

Advertencias que acompañan a estas cifras y que conviene reproducir aquí:

- La cifra sintética es la reproducible: los documentos se generan a partir de las plantillas y nomenclaturas del repositorio y los valores proceden de una zona de retención (holdout) no vista en entrenamiento. Esto separa "reconoce nombres" de "memorizó una lista", pero no sustituye a documentos reales.
- Los nueve documentos reales contienen datos personales auténticos y no están publicados, por lo que nadie puede recalcular esa métrica.
- El conjunto de prueba real resuelve muy poco: según el autor, en ocho ejecuciones cualquier valor entre 0,769 y 0,833 de micro-F1 es ruido, y dos modelos que difieran en menos de 0,06 no se pueden distinguir con él.
- El sobreenmascaramiento no es una fuga: una palabra de más cuesta legibilidad, una de menos cuesta datos personales; el modelo está ajustado hacia el segundo caso.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, y en cualquier caso no serían aplicables a un modelo de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir de los 307,6M de parámetros, no publicada por el autor): en fp32 unos 1,25 GB; en fp16 o bf16 unos 0,62 GB; en int8, si se convierte, alrededor de 0,31 GB. Hay que sumar el consumo del tokenizador y de los estados de activación, moderado porque el contexto máximo es de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre puede ejecutar el modelo en fp16, por lo que una GTX 1650, una RTX 3050 o una RTX 4090 son más que suficientes. Las A100 y H100 solo tienen sentido para servir muchas peticiones en paralelo o para reentrenamiento.
- Cabe holgadamente en GPU de consumo: es un modelo de 308M de parámetros con ventana de 512 tokens. También es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch es la vía natural, dado que el repositorio solo publica safetensors y no hay versiones GGUF u ONNX publicadas. Para servir en producción se puede envolver con Text Embeddings Inference, con un servidor propio o con vLLM, aunque el autor no documenta ninguna de estas integraciones. No hay pesos publicados para llama.cpp ni Ollama, de modo que su uso con esas herramientas requeriría convertir los pesos por cuenta propia.
- Latencia y throughput estimados: no disponibles. El autor no publica ninguna medición de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| maschera-ch-v63b | Token classification de PII suizo | 307,6M | 512 tokens | MIT | Micro-F1 0,993 en sintético; 0,739 en 9 documentos reales |
| jhu-clsp/mmBERT-base | Encoder multilingüe preentrenado (modelo base) | 308M, 22 capas | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible |
| rizzo-pii | Proyecto de código abierto de detección de PII que inspira a este modelo | No disponible | No disponible | MIT (según la model card de maschera) | No disponible |
| Otros etiquetadores multilingües de PII | Token classification | No disponible | No disponible | No disponible | No disponible; no se ha verificado ninguna cifra |

La comparación directa con alternativas queda limitada porque la model card no ofrece resultados frente a otros modelos y no se han encontrado en la búsqueda web datos verificables de competidores. La particularidad de maschera-ch-v63b no es tanto el tamaño como el conjunto de etiquetas: incorpora identificadores suizos con dígito de control (AHV, UID, IBAN, referencia QR, GLN) y nomenclaturas oficiales suizas, algo que un etiquetador genérico de PII en inglés no cubre.

## Limitaciones y advertencias

- Entrenado exclusivamente con documentos sintéticos: la correspondencia real es más desordenada y la tasa de fuga en documentos reales es de aproximadamente el 1 %, no cero.
- Es seudonimización, no anonimización: mientras exista el diccionario de correspondencias el proceso es reversible y, bajo la legislación suiza de protección de datos, los datos siguen siendo personales.
- El autor exige revisión humana del texto enmascarado antes de transmitirlo. No está previsto para redacción desatendida, decisiones automatizadas ni como única salvaguarda antes de publicar un documento.
- Ventana de 512 tokens: los documentos largos deben ventanearse desde la aplicación que invoca el modelo, con el riesgo de partir entidades en los límites de ventana.
- Ámbito exclusivamente suizo: el conjunto de etiquetas y los anclajes asumen formatos suizos y las tres lenguas oficiales más el inglés. El romanche no está soportado.
- Reconocimiento estadístico e incompleto: falla por omisión y también enmascara de más cuando duda; el modelo está deliberadamente sesgado hacia el sobreenmascaramiento.
- La métrica sobre documentos reales no es reproducible por terceros, ya que los nueve documentos anotados contienen datos personales y no se publican.
- La semilla del conjunto de entrenamiento no está registrada, por lo que la ejecución exacta del entrenamiento no es reproducible, aunque la ruta de generación sí lo sea.
- Adopción muy baja en el momento de la consulta (38 descargas, 0 likes), sin señales de validación por parte de la comunidad.
- Las nomenclaturas de origen exigen atribución: BFS (apellidos y nombres), swisstopo (localidades y calles), eCH-0135 del Federal Office of Justice (lugares de origen) y Zefix / EHRA vía LINDAS (nombres de empresas), esta última bajo términos Provide-the-Source. Esto afecta a quien reutilice los datos de generación, no a los pesos, que son MIT.
- No se publican cuantizaciones ni formatos alternativos de pesos, lo que obliga a convertirlos si se quiere desplegar en entornos con restricciones de memoria o fuera del ecosistema `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/semprerudi/maschera-ch-v63b
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Sitio web de MASCHERA: https://www.maschera.ch
- Código fuente y descargas de MASCHERA: https://github.com/semprerudi/maschera
- Proyecto que inspira la idea, rizzo-pii: https://github.com/Rizzo-AI-Academy/rizzo-pii
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo ni sobre su evaluación; los resultados devueltos por el buscador no guardan relación con el contenido de esta ficha.
