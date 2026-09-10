# Accio-Lab/occamy-1.0

## Resumen

Occamy-1.0 es un modelo agéntico de 35.000 millones de parámetros totales con 3.000 millones activos, desarrollado por Accio-Lab sobre el checkpoint post-entrenado Qwen3.6-35B-A3B. Su objetivo declarado no es competir en conocimiento general, sino especializarse en "co-work": tareas profesionales de horizonte largo y con estado persistente, en las que el modelo debe coordinar de forma sostenida búsqueda web, ejecución de código, llamadas a herramientas, gestión de ficheros y APIs estructuradas. La arquitectura es una mezcla de expertos (MoE) causal con codificador visual, 40 capas, 256 expertos de los que se activan 8 enrutados más 1 compartido.

El modelo parte de una ventana de contexto de 262.144 tokens en la arquitectura base, aunque el ajuste supervisado se realizó con secuencias de 131.072 tokens. Es relevante ahora porque combina una huella de inferencia contenida (3B activos por token) con capacidades de agente y de visión, lo que abarata el despliegue de flujos agénticos de larga duración frente a modelos densos de tamaño comparable. Se distribuye con licencia Apache 2.0 y pesos en safetensors.

Accio-Lab publica además el stack de entrenamiento utilizado, denominado Dressage, basado en aprendizaje por refuerzo multi-harness, junto con un informe técnico. El modelo acumulaba 1.507 descargas y 16 "likes" en HuggingFace en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) causal con codificador visual |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido, de un total de 256) |
| Longitud de contexto | 262.144 tokens (arquitectura base); 131.072 tokens de secuencia en SFT |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Numero de capas | 40 |
| Numero de expertos | 256 (8 enrutados + 1 compartido activados) |
| Post-entrenamiento | SFT de parametros completos, HDPO, model merging y SAO |
| Checkpoint de partida | Qwen/Qwen3.6-35B-A3B |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 70,2 GB |
| Descargas / likes | 1.507 / 16 |
| Fecha de creacion | 2026-08-13 |
| Ultima actualizacion | 2026-09-10 |
| ID en HuggingFace | Accio-Lab/occamy-1.0 |

## Arquitectura y entrenamiento

Occamy-1.0 mantiene sin cambios la arquitectura del checkpoint de partida: un transformer causal con mezcla de expertos, 40 capas, 256 expertos y 8 expertos enrutados más 1 compartido activados por token, lo que da lugar a unos 3B parámetros activos sobre 35B totales. Incorpora además un codificador visual y un proyector multimodal, lo que explica su pipeline image-text-to-text. Durante el SFT, el backbone de lenguaje se entrena a parámetros completos mientras el codificador visual y el proyector permanecen congelados, de modo que las capacidades visuales heredadas son las del modelo base y no se especializan en las tareas de co-work.

El post-entrenamiento combina cuatro etapas: SFT de parámetros completos sobre datos que cubren trabajo agéntico general, interacción de horizonte largo, ingeniería de software y fundamentación de llamadas a herramientas; HDPO (una variante de optimización por preferencias); fusión de modelos (model merging); y SAO. La longitud de secuencia empleada en el SFT es de 131.072 tokens, la mitad del contexto máximo soportado por la arquitectura base. El entrenamiento se realizó con Dressage, un framework de aprendizaje por refuerzo multi-harness que Accio-Lab ha liberado públicamente. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni la distribución de idiomas.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en flujos multi-turno.
- Llamada a herramientas y function calling, con fundamentación de las llamadas como objetivo explícito de entrenamiento (tag tool-use).
- Ejecución agéntica sostenida: cadenas largas de pasos con estado persistente, recuperación de errores y continuación del trabajo tras reescrituras de historial como la compactación de contexto.
- Delegación de subtareas a ejecuciones secundarias y coordinación entre ellas.
- Codificación agéntica, incluyendo trabajo en terminal y tareas de ingeniería de software.
- Comprensión de imagen y texto (pipeline image-text-to-text), con codificador visual y proyector heredados del modelo base.
- Contexto largo: hasta 262.144 tokens según la configuración de la arquitectura base, con SFT realizado a 131.072 tokens.
- Capacidades multilingües: no disponible (la model card no declara el conjunto de idiomas soportados).
- Modo de razonamiento explícito ("thinking mode"): no disponible en la información proporcionada.

## Casos de uso

- Asistente de co-work de larga duración: el modelo puede mantener un hilo de trabajo profesional durante horas o días, conservando el estado entre llamadas a herramientas y sobreviviendo a la compactación del historial, algo que los modelos orientados a pregunta-respuesta aislada no cubren bien.
- Automatización de flujos con APIs estructuradas: gracias al entrenamiento específico en fundamentación de tool calls, encaja en pipelines que encadenan peticiones REST, validación de respuestas y reintentos ante errores de formato.
- Ingeniería de software agéntica en producción: puede integrarse en herramientas de terminal o CI/CD para aplicar refactors multi-archivo, ejecutar tests y corregir fallos de forma iterativa, con la ventaja de que solo 3B parámetros activos reducen el coste por paso.
- Investigación y recuperación aumentada: con 262.144 tokens de contexto en la arquitectura base puede ingerir documentación extensa, expedientes o bases de código y razonar sobre ellos sin trocear en exceso. La propia model card advierte, no obstante, que las tareas intensivas en recuperación son el punto con más margen de mejora.
- Atención al cliente multi-turno: la continuidad de estado permite gestionar conversaciones largas con historial compactado y derivar a herramientas internas (consulta de pedidos, modificación de datos) sin perder el hilo.
- Extracción estructurada de documentos con imagen: al ser un modelo image-text-to-text, puede procesar capturas de facturas, formularios o pantallazos y devolver campos estructurados, aunque sin interacción visual nativa con navegador o escritorio.
- Coordinación de subagentes: el modelo está diseñado para delegar ejecuciones y posteriormente integrar sus resultados, lo que permite usarlo como orquestador en arquitecturas multi-agente.
- Productividad ofimática: automatización de hojas de cálculo, correo y documentos dentro de un flujo de trabajo profesional, un escenario alineado con el objetivo declarado de "co-work".

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una sección de evaluación con una tabla comparativa frente a Qwen3.6-35B-A3B, Agents-A1, Nex-N2-mini, BigBang-1.0 y Ornith-1.5 dentro de la categoría de modelos 35B-A3B, y frente a GPT-5.6 Sol, Qwen3.8-Max, DeepSeek V4 Pro (0813) y GLM-5.2 en la categoría de modelos a gran escala, con bloques de co-work, tool-use, coding y benchmarks de negocio. Sin embargo, los valores de dicha tabla no estaban disponibles en la extracción consultada, por lo que no se reproducen aquí.

No se dispone tampoco de cifras verificables de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada para este modelo.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del número de parámetros y del tamaño del repositorio, no datos publicados por el autor.

- Pesos en BF16: en torno a 70 GB, coherente con el tamaño de repositorio de 70,2 GB. Requiere una GPU de 80 GB (H100, A100 80GB) o reparto en varias GPU.
- Pesos en FP8: aproximadamente 35-36 GB. Cabe en A100 40GB, L40S 48GB o H100 80GB con margen para caché KV.
- Pesos en INT4: aproximadamente 18-20 GB. Cabe en GPU de consumo, como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090.
- GPU recomendadas: H100 o A100 80GB para BF16; A100 40GB, L40S o H100 para FP8; RTX 4090/3090 o superiores para cuantizaciones de 4 bits.
- Caché KV: no cuantificado en la información disponible. Con contextos cercanos a los 262.144 tokens el consumo adicional de caché KV puede ser determinante y debe medirse empíricamente antes de dimensionar el despliegue.
- Opciones de despliegue: al publicarse en transformers y safetensors, es compatible con vLLM, SGLang y TGI, y la etiqueta endpoints_compatible sugiere compatibilidad con endpoints gestionados de HuggingFace. No se han publicado pesos GGUF oficiales, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles. Como referencia estructural, los 3B parámetros activos por token sitúan el coste de decodificación en el rango de un modelo denso de ~3B, con la penalización de memoria de tener que alojar los 35B de pesos.

## Comparativa con modelos similares

La model card sitúa a Occamy-1.0 en dos categorías. No se dispone de datos de rendimiento ni de especificaciones verificadas de los modelos alternativos, por lo que la comparación se limita a lo declarado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Occamy-1.0 | 35B totales / 3B activos | 262.144 tokens (base); SFT a 131.072 | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.6-35B-A3B | 35B totales / 3B activos (modelo base) | no disponible | no disponible | no disponible | Pesos abiertos en HuggingFace |
| Agents-A1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Nex-N2-mini | no disponible | no disponible | no disponible | no disponible | no disponible |
| BigBang-1.0 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Ornith-1.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| GPT-5.6 Sol | no disponible | no disponible | no disponible | Propietaria | API |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Pro (0813) | no disponible | no disponible | no disponible | no disponible | no disponible |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más significativa es contra el propio checkpoint de partida, Qwen3.6-35B-A3B: Occamy-1.0 conserva íntegramente su arquitectura y sus pesos iniciales, de modo que la diferencia entre ambos reside exclusivamente en el post-entrenamiento orientado a co-work, agencia y uso de herramientas.

## Limitaciones y advertencias

- La propia model card advierte de que Occamy-1.0 está optimizado para cargas de co-work habituales y no sustituye a modelos frontera en todas las tareas.
- Tareas intensivas en recuperación (retrieval-heavy) y de usuario simulado presentan margen de mejora reconocido por el autor.
- La interacción visual nativa con navegador o escritorio no forma parte de la interfaz de entrenamiento actual del modelo.
- El codificador visual y el proyector permanecen congelados durante el SFT: las capacidades de visión no se especializan y quedan limitadas a las heredadas del modelo base.
- No se declaran los idiomas soportados, lo que impide garantizar un rendimiento homogéneo fuera del inglés sin evaluación previa.
- Riesgo de alucinación: no se documentan tasas ni mitigaciones específicas, un aspecto crítico cuando el modelo opera sobre APIs reales o ficheros de producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales, pero el usuario debe verificar las condiciones del modelo base Qwen3.6-35B-A3B si redistribuye derivados.
- Los datos de evaluación publicados en la model card no estaban disponibles en la extracción consultada, por lo que cualquier afirmación de rendimiento basada en ella no puede reproducirse sin acudir a la fuente original.
- Al ser un modelo con 35B parámetros en memoria, el ahorro de cómputo por los 3B activos no se traduce en un ahorro equivalente de VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0
- Modelo en HuggingFace (variante en mayúsculas referenciada en la model card): https://huggingface.co/Accio-Lab/Occamy-1.0
- Sitio web del proyecto: https://accio-lab.github.io/occamy/
- Framework de entrenamiento Dressage: https://github.com/Accio-Lab/Dressage
- Informe técnico: https://github.com/Accio-Lab/occamy/blob/main/report/occamy1.0.pdf
- Repositorio del proyecto: https://github.com/Accio-Lab/occamy
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

La búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces anteriores proceden exclusivamente de la información de HuggingFace y de la model card.
