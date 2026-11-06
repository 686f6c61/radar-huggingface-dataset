# mstrasser/jeff-adapter-contradicts

## Resumen

jeff-adapter-contradicts es un adaptador LoRA publicado por mstrasser sobre el modelo base jeff-base v1.4, un fine-tune de Qwen3.5-0.8B presentado como "modelo de decisión" pequeno y abierto. El adaptador resuelve una tarea muy concreta: comprobar si dos afirmaciones o registros entran en contradiccion, devolviendo una de tres etiquetas (yes, no, unclear) junto con una probabilidad calibrada obtenida en un unico forward pass, sin generar texto que haya que parsear.

La relevancia del modelo esta en su enfoque: en lugar de un LLM generativo que razona en lenguaje natural, se trata de un clasificador de decisión calibrado que expone directamente una distribucion de probabilidad sobre las opciones. Esto lo hace adecuado para integrarse en pipelines de verificacion documental, control de calidad de datos o deteccion de inconsistencias entre fuentes, donde se necesita una respuesta estructurada y una medida de confianza fiable.

El adaptador se distribuye como modulo PEFT (formato safetensors) y solo carga sobre la revision v1.4 del base, ya que el motor de inferencia rechaza adaptadores entrenados sobre otra base. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder (base: jeff-base v1.4, fine-tune de Qwen3.5-0.8B) |
| Parametros totales | no disponible (adaptador LoRA; el base es de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un modulo LoRA acoplado a jeff-base v1.4, un modelo de decision de 0.8B parametros derivado de Qwen3.5-0.8B. En lugar de generar texto libre, el modelo evalua una situacion y una pregunta con opciones nombradas y devuelve, en un solo forward pass, una probabilidad calibrada para cada opcion. La tarea concreta de este adaptador, `jeff.reasoning.contradicts.contradicts`, es de tipo classify/choice con tres etiquetas: `no`, `unclear` y `yes`.

La entrada se estructura en tres campos: `setting` (contexto que describe quien pregunta y de que organizacion provienen las afirmaciones), `statement_a` (objeto con `source` y `text`) y `statement_b` (mismo formato que el primero). El adaptador fue entrenado el 2026-10-25 sobre Jeff v1.4. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que parte de los datos proviene de un generador interno y que se dispone de un conjunto de calibracion de 1.933 filas.

La innovacion principal es el paradigma de decision calibrada: la salida es directamente una distribucion de probabilidad sobre las opciones, lo que elimina la necesidad de parsear texto generado y permite fijar umbrales de confianza con precision y cobertura medibles.

## Capacidades

- Clasificacion de contradiccion entre dos afirmaciones o registros con tres salidas: `yes` (no pueden ser ambas verdaderas), `no` (pueden ser ambas verdaderas) y `unclear` (el conflicto depende de algo que ninguna de las dos aclara).
- Deteccion de conflictos tanto explicitos como inferidos (por ejemplo, una fecha o cantidad incompatible, o una obligacion que contradice una prohibicion).
- Distincion entre afirmaciones sobre cosas o momentos distintos (que no se consideran contradiccion) y afirmaciones que solo anaden detalle.
- Salida de probabilidad calibrada por opcion en un unico forward pass, apta para umbrales de confianza.
- Ingesta de metadatos de fuente (`source`) junto al texto de cada afirmacion, lo que permite contextualizar el origen del registro.
- Soporte de ejecucion local mediante el SDK de Jeff (`Jeff.local`) y de acceso remoto via API (`Jeff.remote`).
- No soporta generacion de texto libre, tool calling ni razonamiento multi-paso mas alla de la clasificacion de la tarea.

## Casos de uso

- Verificacion de conciliacion de medicacion al alta hospitalaria: comparar la carta de alta con el registro de receta repetida de la farmacia comunitaria para detectar farmacos que deberian haberse suspendido y siguen prescritos, como ilustra el ejemplo de la model card (metformina).
- Control de calidad de bases de datos: detectar registros duplicados o inconsistentes entre dos fuentes (por ejemplo, direcciones, fechas o importes) antes de consolidar un dataset.
- Auditoria documental en entornos regulados: comparar declaraciones de un mismo hecho en informes, correos y actas para senalar discrepancias y priorizar la revision humana.
- Verificacion de claims en atencion al cliente: comprobar si lo que un cliente afirma en un mensaje contradice lo registrado en el sistema, devolviendo `unclear` cuando la informacion es ambigua.
- Deteccion de inconsistencias en pipelines de datos: integrar la clasificacion como paso de validacion entre dos etapas de un ETL, usando el umbral de confianza (0.662) para enrutar automaticamente los casos claros y escalar los dudosos.
- Revision de contratos y condiciones: comprobar si una clausula de una version posterior contradice una clausula de la version anterior del mismo documento.
- Moderacion de contenido factual: identificar mensajes que contradicen hechos registrados previamente en una conversacion multi-turno.

## Benchmarks y rendimiento

| Test | Filas | Precision (accuracy) |
|---|---:|---:|
| Benchmarks publicos (500 filas de SNLI y 500 de VitaminC) | 1.000 | 94,5% |
| Test interno (generador) | 1.931 | 96,4% |
| Test interno en dominios nunca vistos en entrenamiento (generador) | 1.939 | 96,5% |

Calibracion (conjunto de calibracion de 1.933 filas):

| Funcion | Umbral | Precision | Cobertura |
|---|---:|---:|---:|
| `contradicts` | 0,662 | 98,0% | 97,4% |

La model card advierte que las pruebas de tipo "generator" miden menos que una prueba publica o real, ya que proceden del mismo generador que los datos de entrenamiento. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un base de 0.8B, la huella de inferencia la determina el base, no el adaptador.
- GPU recomendadas: no disponible. Por el tamano del base (0.8B), es previsible que quepa en GPU de consumo, pero la model card no publica requisitos concretos.
- Opciones de despliegue: SDK de Jeff (`Jeff.local` para ejecucion local y `Jeff.remote` contra `https://api.jeffhub.ai`); el motor descarga el adaptador y el base desde Hugging Face la primera vez. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeff-adapter-contradicts | adaptador LoRA sobre base de 0.8B | no disponible | Clasificacion de contradiccion calibrada (3 clases) | apache-2.0 | Hugging Face (repo de 0.0 GB) |
| NLI clasicos (p. ej. DeBERTa fine-tuneado en SNLI/MNLI) | 0.1B-0.4B tipico | 512 tokens tipico | Entailment/contradiction (3 clases) | variable | Amplia |
| LLMs generativos pequenos (p. ej. Qwen3.5-0.8B sin adaptar) | 0.8B | no disponible | Generacion de texto; requiere prompt y parseo | variable | Amplia |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales. La ventaja diferencial del adaptador es la salida calibrada con umbral medido, frente a la necesidad de parsear texto en modelos generativos.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte multilingue.
- Solo carga sobre jeff-base en la revision v1.4; el motor rechaza adaptadores entrenados sobre otra base, lo que limita la portabilidad.
- El adaptador esta disenado exclusivamente para la tarea de contradiccion; no sirve para verificar si la evidencia respalda una afirmacion (la model card remite a otra funcion, "Claim support check").
- Las metricas internas (96,4% y 96,5%) provienen de un generador de datos, por lo que sobreestiman el rendimiento esperado en documentos reales; la unica medida sobre datos publicos es del 94,5%.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto libre), pero si riesgo de clasificacion erronea en casos ambiguos; el umbral de confianza de 0,662 con precision del 98,0% deja un 2,0% de respuestas confiadas incorrectas.
- La cobertura del 97,4% implica que un 2,6% de las respuestas quedan por debajo del umbral y requieren revision o escalado.
- Repo de 0.0 GB y 0 descargas/likes en el momento de la consulta: ecosistema muy incipiente, con paquetes del SDK aun no publicados en PyPI (instalacion desde GitHub).
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni soporte; verificar la licencia del modelo base antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-contradicts
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Pagina de catalogo: https://jeffhub.ai/catalogue/jeff.reasoning.contradicts
- Repositorio, servidor y SDKs: https://github.com/firelex/jeff
- Guia de instalacion del SDK: https://jeffhub.ai/docs/sdk/install
- API remota: https://api.jeffhub.ai
- Plataforma: https://jeffhub.ai
