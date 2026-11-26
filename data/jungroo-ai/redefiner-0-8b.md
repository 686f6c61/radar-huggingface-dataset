# jungroo-ai/redefiner-0.8b

## Resumen

ReDefiNER 0.8B es un modelo de reconocimiento de entidades nombradas (NER) y extraccion de informacion desarrollado por Jungroo AI Labs. A diferencia de los modelos generativos, es un modelo discriminativo de etiquetado de spans: identifica y marca fragmentos de texto segun un "rulebook" (libro de reglas) escrito en lenguaje natural, sin generar texto nuevo. El modelo se construye sobre Qwen/Qwen3.5-0.8B y emplea cabezas propias de span y label, por lo que requiere la libreria `redefiner` en lugar de `transformers` estandar.

Su propuesta central es la redefinicion sin reentrenamiento: para cambiar que entidades detecta el modelo, el usuario edita las reglas en texto plano (tipos, descripciones y restricciones), no los pesos. Con 755 millones de parametros y un unico fichero int8 de 0,77 GB, esta disenado para ejecutarse en CPU convencional (2-2,6 GB de memoria en pico) o GPU NVIDIA, y funciona offline una vez descargado, lo que lo hace adecuado para entornos con requisitos estrictos de privacidad como banca, sanidad o administracion publica.

Es relevante ahora porque ofrece una alternativa de bajo coste y desplegable on-premise a los modelos frontera para tareas de extraccion estructurada y deteccion de PII, con licencia Apache 2.0 que permite uso comercial. El modelo es solo para ingles y esta pensado para equipos que no pueden enviar datos a servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B con cabezas propias de span y label (token-classification) |
| Parametros totales | 755.675.585 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (rulebooks probados hasta ~10.000 tokens) |
| Tipos de cuantizacion | int8 (fichero de 0,77 GB); 8-bit segun tags |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cargados via libreria `redefiner`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y anade cabezas especificas de etiquetado de spans y de tipos, lo que lo convierte en un modelo discriminativo de token-classification en lugar de un generador. Soporta dos modos: extract mode, que localiza y etiqueta spans en el texto de entrada, y label mode, que asigna tipos a spans ya proporcionados por el usuario. La salida son spans de caracteres exactos con su tipo y un valor de confianza; el modelo nunca escribe texto nuevo.

La innovacion principal es el control mediante rulebooks en lenguaje natural: cada tipo de entidad se declara con una descripcion de una linea y reglas opcionales, y el modelo las sigue sin reentrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los spans tienen por defecto un maximo de 16 tokens, ampliable con `max_span_tokens` (64 para PII). En textos largos, cada parte se procesa de forma independiente, lo que puede producir etiquetas inconsistentes a lo largo de un documento.

## Capacidades

- Extraccion de entidades nombradas (NER) guiada por rulebook en lenguaje natural, con spans de caracteres exactos.
- Etiquetado de spans preexistentes (label mode) ademas de la extraccion (extract mode).
- Deteccion de PII y soporte a redaccion de datos sensibles (personas, cuentas, emails, telefonos, etc.).
- Extraccion de informacion estructurada: productos, versiones, dispositivos, codigos de error.
- Seguimiento de reglas (rule-following) con restricciones del tipo "etiqueta el nombre completo, sin titulos".
- Salida no generativa: no produce texto nuevo, solo marcas sobre el texto de entrada.
- Ejecucion en CPU sin GPU y funcionamiento offline tras la descarga.
- Interfaces Python (`Tagger.extract`, `Tagger.label`) y servidor HTTP local (`redefiner serve`).
- Capacidades multilingues: no disponibles; solo ingles.

## Casos de uso

- Deteccion y redaccion de PII en soporte al cliente: con un rulebook de privacidad (PERSON, ACCOUNT_ID, EMAIL, PHONE), el modelo marca los spans sensibles en tickets antes de almacenarlos o enviarlos a terceros, y al ejecutarse offline mantiene los datos en los servidores propios.
- Cumplimiento normativo en banca y sanidad: extraccion de identificadores y datos personales en documentos para anonimizacion previa a auditorias, sin sacar informacion de la infraestructura interna.
- Enriquecimiento de tickets de soporte tecnico: con un rulebook de producto (PRODUCT, VERSION, DEVICE, ERROR_CODE), se extraen automaticamente los componentes afectados para clasificar y enrutar incidencias.
- Procesamiento de contratos y formularios: extraccion de nombres, organizaciones e identificadores mediante rulebooks adaptados a cada tipo documental, sin reentrenar el modelo al cambiar de dominio.
- Pipelines de ingesta de datos: etiquetado de campos en textos no estructurados para alimentar bases de datos o indices de busqueda, con spans exactos y confianza por entidad.
- Despliegue en entornos air-gapped: organizaciones que no pueden usar APIs externas pueden ejecutar el modelo en CPU en sus propios servidores con un fichero int8 de 0,77 GB y sin coste por uso.
- Prototipado rapido de tareas de extraccion: iterar sobre el rulebook en minutos para definir que cuenta como entidad antes de invertir en un modelo entrenado a medida.

## Benchmarks y rendimiento

Datos publicados en la model card (CrossNER AI, con el mismo rulebook):

| Modelo | F1 en CrossNER AI |
|---|---|
| ReDefiNER 0.8B (CPU) | 68,1 |
| Claude Haiku 5.5 | 73,1 |
| Gemini 3.1 Pro | 72,4 |

Rendimiento de inferencia segun la model card:

| Escenario | Latencia |
|---|---|
| CPU de 4 nucleos o Apple M2, extract mode, con rulebook cargado | 0,4-0,7 s por frase |
| NVIDIA A10 o RTX A5000 | 0,05 s por texto |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 2-2,6 GB de memoria en pico en CPU; en GPU, no se especifica VRAM exacta, pero el fichero int8 de 0,77 GB sugiere un consumo bajo.
- GPU recomendadas: NVIDIA A10 o RTX A5000 (0,05 s por texto segun la model card); funciona tambien en cualquier GPU NVIDIA disponible.
- Cabe en GPU de consumo: si, por el tamano del fichero int8 (0,77 GB) y el bajo consumo de memoria; la model card no detalla modelos concretos de consumo.
- Opciones de despliegue: paquete Python `redefiner` (`Tagger.from_pretrained`) y servidor HTTP local (`redefiner serve`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,4-0,7 s por frase en CPU de 4 nucleos o Apple M2 (extract mode); 0,05 s por texto en NVIDIA A10 o RTX A5000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CrossNER AI | Licencia | Despliegue |
|---|---|---|---|---|---|
| ReDefiNER 0.8B | 755,7 M | no disponible | 68,1 | Apache 2.0 | CPU/GPU, offline |
| Claude Haiku 5.5 | no disponible | no disponible | 73,1 | propietaria | API en la nube |
| Gemini 3.1 Pro | no disponible | no disponible | 72,4 | propietaria | API en la nube |

La model card menciona ademas comparaciones con modelos de investigacion publicados, pero no se detallan sus resultados en la informacion disponible. Frente a los modelos frontera, ReDefiNER queda 5,0 puntos F1 por debajo de Claude Haiku 5.5 y 4,3 por debajo de Gemini 3.1 Pro, a cambio de ejecucion local, sin coste por uso y con datos que no salen de la infraestructura propia.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- Spans limitados a 16 tokens por defecto (64 para PII con `max_span_tokens`), lo que puede truncar entidades largas.
- Rulebooks probados hasta aproximadamente 10.000 tokens; reglas mas extensas no estan validadas.
- En textos largos, cada parte se procesa por separado, por lo que las etiquetas pueden ser inconsistentes a lo largo de un mismo documento.
- Modelo no generativo: no redacta ni reescribe texto, solo marca spans; la redaccion debe implementarse en la capa de aplicacion.
- Riesgo de alucinacion de spans o etiquetas incorrectas inherente a la tarea; la confianza por entidad deberia usarse para filtrar en produccion.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales del modelo base Qwen3.5-0.8B en la informacion disponible.
- Requiere la libreria `redefiner`; no es compatible con el flujo estandar de `transformers`, lo que anade una dependencia especifica al stack.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungroo-ai/redefiner-0.8b
- Repositorio de codigo: https://github.com/jungroo-ai/redefiner
- Documentacion de label mode: https://github.com/jungroo-ai/redefiner#label-mode
- Detalles de velocidad: https://github.com/jungroo-ai/redefiner#speed
- Changelog: https://github.com/jungroo-ai/redefiner/blob/main/CHANGELOG.md
- Sitio del producto: https://jungroo.com/redefiner/
- Jungroo AI Labs: https://jungroo.com
- Video promocional (45 s): https://huggingface.co/jungroo-ai/redefiner-0.8b/resolve/main/docs/assets/video/redefiner-promo.mp4
- Video extendido (98 s): https://huggingface.co/jungroo-ai/redefiner-0.8b/resolve/main/docs/assets/video/redefiner-promo-long.mp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
