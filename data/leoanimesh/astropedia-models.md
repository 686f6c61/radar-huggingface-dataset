# leoanimesh/astropedia-models

## Resumen

Astropedia-models es un repositorio de pesos publicado por el usuario leoanimesh que contiene las builds en formato ExecuTorch (`.pte`) de Saga, el asistente de astrología védica de la aplicación Astropedia. El modelo es un ajuste fino de `google/gemma-3-270m-it`, la variante instructiva de 270 millones de parámetros de la familia Gemma 3, especializado en responder consultas dentro del dominio astrológico.

La relevancia de esta ficha está en su enfoque de despliegue: no se distribuye como un modelo de servidor, sino como artefactos cuantizados a 8 bits (esquema 8da8w, entrenado previamente con QAT de 4 bits) pensados para ejecutarse íntegramente en el teléfono del usuario. La aplicación descarga los ficheros una sola vez, verifica su integridad mediante SHA-256 declarados en un `manifest.json` y los ejecuta localmente, sin enviar datos a un servidor. El contexto declarado es de 2.048 tokens y los idiomas soportados son inglés, hindi y bengala.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados. Su interés técnico reside en el pipeline (ajuste fino de dominio, QAT de 4 bits y exportación a ExecuTorch con cuantización de 8 bits) más que en su rendimiento bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), detalles de capas y atencion no disponibles |
| Parametros totales | 270 millones (heredados de google/gemma-3-270m-it) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | 8 bits en el artefacto final (esquema 8da8w); entrenamiento con QAT de 4 bits |
| Idiomas soportados | Ingles (en), hindi (hi), bengala (bn) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | ExecuTorch `.pte`; el repositorio incluye `manifest.json` con tamanos y SHA-256 |
| Tamano del repositorio | 0,2 GB |
| Modelo base | google/gemma-3-270m-it |
| Dominio | Astrologia vedica (asistente Saga de la app Astropedia) |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de 270 millones de parametros ya ajustado por instrucciones por Google. Sobre esa base, el autor ha realizado un ajuste fino de dominio orientado a astrologia vedica en ingles, hindi y bengala. La model card no detalla la composicion del dataset de ajuste fino, el numero de tokens utilizados, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO sobre el modelo ajustado; todos esos datos figuran como no disponibles.

La innovacion tecnica destacable es la cadena de cuantizacion y exportacion. El ajuste se entreno con cuantizacion consciente del entrenamiento (QAT) de 4 bits y el artefacto distribuido se exporta a ExecuTorch con cuantizacion de 8 bits bajo el esquema denominado 8da8w. El resultado es un fichero `.pte` ejecutable con el runtime de ExecuTorch en dispositivos moviles. El repositorio incluye un `manifest.json` que enumera cada version con su tamano y su hash SHA-256, de modo que la aplicacion cliente puede verificar la integridad de cada fichero antes de cargarlo y ejecutarlo localmente.

## Capacidades

- Generacion de texto conversacional en el dominio de la astrologia vedica (interpretacion de cartas, consultas astrologicas y respuestas de acompanamiento).
- Soporte multilingue limitado a ingles, hindi y bengala, segun lo declarado en la model card.
- Ejecucion en dispositivo (on-device) mediante el runtime de ExecuTorch, sin dependencia de inferencia en servidor.
- Verificacion de integridad de los artefactos descargados mediante hashes SHA-256 incluidos en el manifiesto.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible, y en la practica muy limitado por el tamano del modelo y el contexto de 2.048 tokens.
- Capacidades de vision o audio: no disponibles (el modelo base indicado es la variante de texto de 270M).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Generacion de codigo o matematicas: no documentada para este ajuste.

## Casos de uso

- Asistente astrologico embebido en aplicacion movil: Saga responde consultas de astrologia vedica directamente en el telefono, sin coste de inferencia por token ni exposicion de los datos del usuario a un servidor.
- Aplicaciones sin conectividad: al ejecutarse en local tras la descarga inicial, el asistente funciona en modo avion o en redes intermitentes, algo critico en movilidad.
- Escenarios con requisitos de privacidad: las consultas del usuario no salen del dispositivo, lo que simplifica el cumplimiento de normativas de proteccion de datos frente a alternativas basadas en API en la nube.
- Distribucion de bajo coste: con un repositorio de 0,2 GB y cuantizacion de 8 bits, el modelo es viable en planes de datos limitados y en dispositivos de gama media.
- Prototipado de asistentes verticales: sirve como plantilla reproducible para ajustar un modelo de 270M a un dominio concreto y exportarlo a ExecuTorch con verificacion por hash.
- Filtrado o preprocesado local de consultas: dado su tamano, puede actuar como clasificador o generador de primer nivel antes de derivar peticiones complejas a un modelo mayor en servidor.
- Traduccion o reformulacion de consultas en ingles, hindi y bengala dentro del flujo de la aplicacion, siempre que se respeten los 2.048 tokens de contexto.
- No se recomienda para tareas de razonamiento complejo, generacion de codigo en produccion ni analisis de documentos largos, ya que ni el tamano ni el contexto lo permiten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de dominio astrologico, y los resultados de busqueda web consultados no aportan datos sobre este modelo. Tampoco se han publicado cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantizacion de 8 bits; el peso de los parametros ronda los 270 MB y el consumo total de memoria en tiempo de ejecucion depende del runtime y del buffer de contexto.
- Memoria en dispositivo movil: el repositorio completo ocupa 0,2 GB, por lo que encaja en telefonos de gama media con varios gigabytes de RAM libre.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050 o superior) es suficiente; para servidor, una T4 o A100 esta sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en iGPU modernas, y tambien en CPU.
- Formatos de despliegue: el artefacto nativo es ExecuTorch (`.pte`). No se distribuyen pesos en safetensors ni GGUF, por lo que vLLM, TGI, llama.cpp u Ollama requeririan convertir o reexportar los pesos, algo no documentado en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato principal | Notas |
|---|---|---|---|---|---|
| astropedia-models (este modelo) | 270M | 2.048 tokens | Gemma Terms of Use | ExecuTorch `.pte` | Ajuste de dominio en astrologia vedica; en, hi, bn |
| google/gemma-3-270m-it | 270M | 32.768 tokens (modelo base) | Gemma Terms of Use | safetensors | Modelo base instructivo; contexto mayor que el ajuste |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva y ecosistema amplio |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa pequena orientada a despliegue ligero |

Los datos de las tres alternativas proceden de informacion publica de sus respectivos repositorios y pueden variar; no se dispone de comparaciones de rendimiento directas con este ajuste, ya que no hay benchmarks publicados. En terminos de licencia, este modelo es el mas restrictivo del grupo, al quedar bajo los Gemma Terms of Use en lugar de Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo para este ajuste; al derivar de un modelo entrenado con datos web a gran escala, es previsible que herede sesgos culturales y de representacion, especialmente en el tratamiento de tradiciones astrologicas regionales.
- Riesgo de alucinacion: elevado en un dominio sin base factual verificable como la astrologia, y agravado por el reducido tamano del modelo (270M), que limita la coherencia en cadenas largas de razonamiento.
- Contexto limitado: 2.048 tokens restringen las conversaciones multi-turno y descartan el analisis de documentos extensos. Es sustancialmente menor que el contexto del modelo base.
- Cobertura idiomatica: solo ingles, hindi y bengala estan declarados. Aunque el modelo base de Gemma 3 es multilingue, el rendimiento en castellano u otros idiomas no esta garantizado tras el ajuste de dominio.
- Licencia: se rige por los Gemma Terms of Use, que permiten el uso comercial sujeto a condiciones, exigen conservar los avisos y la copia de los terminos y prohben determinados usos recogidos en la politica de usos prohibidos de Gemma. No es una licencia Apache 2.0 ni MIT.
- Formato: los pesos solo se ofrecen como `.pte` de ExecuTorch, lo que limita su uso a ese runtime y complica su integracion en pilas de servidor habituales.
- Validacion de la comunidad: el repositorio presenta 0 descargas y 0 likes, sin evidencia publica de pruebas independientes de calidad, robustez o seguridad.
- Produccion: antes de desplegarlo seria necesario evaluar de forma propia la tasa de alucinacion en el dominio, el comportamiento multilingue real y el encaje legal de la licencia en el producto concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/leoanimesh/astropedia-models
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Runtime ExecuTorch: https://pytorch.org/executorch/
