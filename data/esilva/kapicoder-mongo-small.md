# esilva/KapiCoder-Mongo-Small

## Resumen

KapiCoder-Mongo-Small es un modelo de autocompletado de código de aproximadamente 1.500 millones de parámetros, obtenido por ajuste fino (fine-tuning) de Qwen/Qwen2.5-Coder-1.5B. Lo desarrolla el autor identificado como esilva para el editor Kapibara Studio, y su especialidad es completar consultas de MongoDB en el punto del cursor mediante relleno de huecos (fill-in-the-middle, FIM), incluso cuando el cursor está dentro de una llamada a `find`, `update` o `aggregate`. Resuelve un problema muy concreto: sugerir fragmentos cortos de JavaScript de consola de Mongo y de pipelines JSON que encajen sintácticamente con el texto previo y posterior al cursor.

El modelo se publica en estado de vista previa experimental (etiqueta de repositorio `v0.3.0-preview`, pesos v4b) y el propio autor advierte de que no está pensado para producción. No es un modelo conversacional ni un agente: no sigue instrucciones, no mantiene diálogo, no llama a herramientas y no ejecuta consultas; solo propone texto. Su contrato de prompt es específico (`editor-context-v2`), que incluye una cabecera con el esquema de la colección destino (línea `TARGET FIELDS`), y fue entrenado con una ventana de 8.000 tokens.

Es relevante ahora porque demuestra un patrón de especialización vertical muy estrecho sobre un modelo base pequeño y con licencia Apache 2.0, orientado a la asistencia en editores y a un dominio de base de datos concreto. La evaluación es interna y sobre datos sintéticos, sin conjunto ciego escrito por humanos, lo que condiciona la interpretación de sus cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de Qwen/Qwen2.5-Coder-1.5B |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de entrenamiento de 8k tokens; el IDE solicita como maximo 128 tokens de continuacion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B, un transformer decoder-only, y se ajusta mediante fine-tuning supervisado para la tarea de FIM en el dominio de MongoDB. El entrenamiento se basa en datos sinteticos generados (el autor menciona datos escritos por LLM y por gramatica) y esta orientado al contrato de prompt `editor-context-v2`: una cabecera con lenguaje, comandos disponibles, nombres conocidos y, de forma destacada, una linea `TARGET FIELDS` con los campos y tipos de la coleccion destino. La regla de salida incluye cerrar el objeto interno que la sugerencia deja abierto.

Se publicaron dos ejecuciones de entrenamiento con semillas distintas, y los pesos publicados corresponden a la primera. El autor no documenta el volumen de tokens de entrenamiento ni si hubo RLHF o DPO; no disponible. La innovacion tecnica principal no es arquitectonica, sino de contrato de contexto: inyectar el esquema de la coleccion en la cabecera mejora de forma marcada la fundamentacion de los campos citados (99,2 % de campos existentes con cabecera frente a 50,0 % sin ella).

## Capacidades

- Autocompletado FIM de consultas MongoDB en JavaScript de consola (`db.<collection>.find(...)`, `ConnectionPool.<conn>.<db>.<collection>...`, pipelines de agregacion, documentos de actualizacion, definiciones de indices).
- Autocompletado de pipelines JSON de agregacion.
- Sugerencias con el cursor dentro de una llamada (`find`, `update`, `aggregate`), no solo al final.
- Cierre del objeto interno abierto por la sugerencia segun la regla de salida de `editor-context-v2`.
- Fundamentacion de campos cuando se proporciona el esquema destino en la cabecera.
- Generacion de texto corto (hasta 128 tokens solicitados por el IDE).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo conversacional ni sigue instrucciones.
- Capacidades multilingues limitadas a en y pt segun la model card.

## Casos de uso

- Autocompletado en editor de consultas MongoDB: el modelo recibe el texto previo y posterior al cursor mas la cabecera `editor-context-v2` y propone una continuacion corta que mantiene valido el documento en el 94,9 % de los casos en la suite interna de cursor dentro de llamada. Adecuado porque esta entrenado especificamente para ese contrato y ese lenguaje.
- Asistencia en pipelines de agregacion: dado un esqueleto de `aggregate([...])` y el esquema de la coleccion, sugiere etapas o campos que encajan sintacticamente y citan campos existentes (99,2 % con cabecera completa). Util para acelerar la escritura de etapas repetitivas.
- Relleno de documentos de actualizacion: con el cursor dentro de un `update`, propone operadores (`$set`, `$inc`, etc.) que son legales en esa posicion (94,8 % en la metrica `op_valid_in_position`). Apropiado para editores que validan despues la sugerencia.
- Generacion de definiciones de indices: completa llamadas de creacion de indices sobre colecciones conocidas, usando los nombres y campos declarados en la cabecera.
- Integracion en IDE o herramienta interna de bases de datos: al ser un modelo de 1,5 B con licencia Apache 2.0 y pesos safetensors, puede desplegarse en infraestructura propia junto al editor y servirse mediante transformers o text-generation-inference (el repositorio incluye la etiqueta `endpoints_compatible`).
- Prototipado de asistentes de consulta para equipos de datos: sirve para experimentar con autocompletado especializado antes de invertir en un modelo mayor, aceptando que las cifras son de evaluacion interna y sintetica.
- Sugerencia de campos en formularios o constructores de consultas visuales: dado el esquema en la cabecera, el modelo puede proponer nombres de campo validos, lo que resulta util para autocompletar selectores en interfaces no textuales.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluacion interna sobre datos sinteticos, `verified: false`).

| Tarea / conjunto | Metrica | Valor |
|---|---|---|
| Autocompletado MongoDB con cursor dentro de llamada (editor-context-v2), suite cursor-in-call v1, n=1200, esquemas reservados | Documento parsea tras insertar la sugerencia (64 tokens, post-proceso v2) | 0,9492 |
| Igual | Todo operador es legal en su posicion (64 tokens, post-proceso v2) | 0,9483 |
| Igual | Campos citados existen en la coleccion destino, esquema en cabecera (context_kind=full) | 0,9917 |
| FIM autocomplete MongoDB (editor-context-v1), split de validacion v2c, n=2000 | FIM accuracy (exact match normalizado) | 0,399 |
| Igual | Exec-valid (la completacion parsea y se ejecuta en solo lectura) | 0,5815 |
| FIM en esquemas no vistos (editor-context-v1), homologacion OOD v1, n=6030 | FIM accuracy (exact match normalizado) | 0,4461 |
| Igual | Exec-valid (parsea y se ejecuta en solo lectura) | 0,8426 |

Comparaciones declaradas por el autor en la model card: en la suite cursor-in-call con prompt v2, el documento se mantiene valido el 94,9 % de las veces frente al 87,8 % de v3. Con el prompt anterior `editor-context-v1` y en homologacion OOD, la FIM accuracy es 44,61 % frente a 45,37 % de v3, y la exec-valid 84,26 % frente a 83,07 %. Sin cabecera, solo el 50,0 % de los campos citados existen (v3: 54,5 %). Entre las dos semillas de entrenamiento, con la segunda las comprobaciones cursor-in-call caen aproximadamente 1 punto por debajo de v4, superando el margen de no inferioridad de 1 punto; con la semilla publicada no ocurre.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 3 GB solo para pesos (1,54 B parametros), mas cache KV; con ventana de 8k tokens el consumo adicional puede ser de varios cientos de MB a mas de 1 GB segun batch y configuracion.
- Cuantizacion: no se documentan tipos soportados; al ser un modelo transformers/Qwen2, es plausible convertirlo a GGUF o AWQ/GPTQ, pero el autor no lo garantiza ni lo evalua.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4090) deberia bastar en fp16 para uso interactivo; en entornos de servidor, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, con margen amplio en fp16 y aun mas con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`). No se documenta soporte oficial de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KapiCoder-Mongo-Small (v4b) | 1,54 B | entrenado a 8k | FIM MongoDB, contrato editor-context-v2 | apache-2.0 | Hugging Face, preview |
| Qwen2.5-Coder-1.5B (base) | 1,54 B | no disponible en la informacion | generacion de codigo general | no disponible en la informacion | Hugging Face |
| KapiCoder-Mongo-Small v3 (`v0.1.0-preview`) | 1,54 B | no disponible | FIM MongoDB con contrato editor-context-v1 | apache-2.0 | Hugging Face, tag previo |
| KapiCoder-Mongo-Small v4 (`v0.2.0-preview`) | 1,54 B | no disponible | FIM MongoDB con contrato editor-context-v2 | apache-2.0 | Hugging Face, tag previo |

No se dispone de datos de benchmarks de los modelos base ni de alternativas especializadas en MongoDB en la informacion proporcionada, por lo que la comparacion se limita a parametros, contrato y licencia.

## Limitaciones y advertencias

- Estado de vista previa experimental: el autor indica explicitamente que no es para produccion.
- Evaluacion interna sobre datos sinteticos, sin conjunto ciego escrito por humanos; las cifras no son directamente comparables con benchmarks publicos.
- No es un modelo conversacional ni un agente: no sigue instrucciones, no llama a herramientas y no explica codigo.
- No ejecuta consultas; cualquier ejecucion la realiza la aplicacion anfitriona, con el riesgo asociado de sugerencias destructivas.
- No es un validador: una sugerencia puede ser sintacticamente valida y aun asi ser incorrecta o referirse a campos inexistentes.
- Sin la cabecera `TARGET FIELDS`, la fundamentacion de campos cae al 50,0 %; es imprescindible validar nombres de campo antes de ejecutar.
- Dependencia estricta del contrato `editor-context-v2`: editores sin ese contrato rechazan el paquete y deben usar el tag `v0.1.0-preview`.
- Variabilidad entre semillas: con la segunda semilla, algunas metricas caen alrededor de 1 punto por debajo de v4.
- Idiomas limitados a en y pt; no se documenta soporte de castellano.
- Riesgo de alucinacion de campos, operadores o estructuras no presentes en el esquema, especialmente en esquemas no vistos.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el estado de preview y la ausencia de evaluacion humana desaconsejan su uso en produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esilva/KapiCoder-Mongo-Small
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Tag v4 (`v0.2.0-preview`): https://huggingface.co/esilva/KapiCoder-Mongo-Small/tree/v0.2.0-preview
- Tag v3 (`v0.1.0-preview`): https://huggingface.co/esilva/KapiCoder-Mongo-Small/tree/v0.1.0-preview
- Paper referenciado en las etiquetas (arXiv:2409.12186): https://arxiv.org/abs/2409.12186
