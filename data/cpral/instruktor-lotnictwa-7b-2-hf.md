# cpral/instruktor-lotnictwa-7B-2-hf

## Resumen

El modelo cpral/instruktor-lotnictwa-7B-2-hf es un ajuste fino completo (full fine-tuning) del modelo polaco speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct, publicado por el usuario de HuggingFace cpral bajo licencia Apache 2.0. Con 7.476.678.656 parametros (aproximadamente 7.48 mil millones), esta orientado especificamente al dominio de la instruccion aeronautica en polaco, tal y como indica su propio nombre (instruktor lotnictwa, instructor de aviacion) y el dataset empleado, cpral/nauka-lotnictwa-2. Su relevancia actual reside en que ejemplifica la tendencia de modelos pequeños y abiertos, especializados por vertical y con licencia permisiva, en lugar de depender de un unico modelo generalista multilingue.

El autor declara un entrenamiento sobre medio millon de conversaciones, de las cuales aproximadamente cien mil incluyen razonamiento (en polaco) y diez mil son multi-turno de hasta tres turnos. Un detalle tecnico destacable es que la perdida se calcula sobre todos los tokens, no solo sobre las respuestas del asistente, lo que segun el autor lo hace apto para generacion de datos sinteticos tipo Magpie a escala industrial, presumiblemente mediante autodestilacion o generacion de trazas de razonamiento.

Se trata, por tanto, de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta (creado el 11 de octubre de 2026 y actualizado el mismo mes), sin benchmarks publicados ni pipeline declarado. Su utilidad principal es la experimentacion en dominio aeronautico en lengua polaca y la generacion de datos sinteticos de instruccion, no el uso generalista ni el despliegue multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (ajuste de speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct; la etiqueta de HuggingFace indica la libreria llama) |
| Parametros totales | 7.476.678.656 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors); al ser una arquitectura estandar de 7B es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | polaco (pl); no se declara soporte de otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 15.0 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar el modelo base, speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct, que pertenece a la familia Bielik de SpeakLeash, orientada al polaco y derivada de arquitecturas transformer decoder-only densas de ~7B parametros. El recuento real de parametros de este ajuste es de 7.476.678.656, coherente con un modelo denso de esa clase. No se especifica en la informacion disponible la longitud de contexto original, el tipo de atencion (completa o con ventana deslizante), ni la composicion exacta del tokenizador heredado.

En cuanto al entrenamiento, el autor declara un ajuste fino completo sobre medio millon de conversaciones, con aproximadamente cien mil ejemplos que incluyen razonamiento en polaco y diez mil conversaciones multi-turno de hasta tres turnos, procedentes del dataset cpral/nauka-lotnictwa-2. La eleccion de calcular la perdida sobre cada token (en lugar de enmascarar los tokens del prompt) es una decision de diseno relevante: segun el autor, habilita el uso del modelo como generador de datos sinteticos estilo Magpie a escala industrial. No se mencionan tecnicas de RLHF, DPO, LoRA/QLoRA (se indica ajuste completo) ni detalles sobre el numero total de tokens vistos, la mezcla de datos, el regimen de aprendizaje o la infraestructura empleada.

## Capacidades

- Generacion de texto conversacional en polaco, con enfasis en el dominio de la instruccion aeronautica.
- Razonamiento en polaco: el autor indica que aproximadamente 100.000 de las conversaciones de entrenamiento incluyen trazas de razonamiento.
- Dialogo multi-turno: entrenado especificamente con unas 10.000 conversaciones de hasta tres turnos.
- Generacion de datos sinteticos de instruccion: la perdida calculada sobre todos los tokens lo hace adecuado, segun el autor, para pipelines tipo Magpie.
- Ajuste fino ulterior: al ser un modelo denso de 7B con pesos safetensors estandar, es reutilizable como base para nuevos ajustes.
- Capacidades no declaradas: no se menciona soporte de tool calling ni function calling, ni uso como agente, ni vision, ni audio, ni modo de pensamiento explicito mas alla de las trazas de razonamiento presentes en los datos.

## Casos de uso

- Formacion de pilotos y personal aeronautico: el modelo puede generar explicaciones y preguntas de examen en polaco sobre procedimientos, meteorologia, navegacion o reglamentacion, aprovechando el ajuste sobre el dataset cpral/nauka-lotnictwa-2.
- Generacion de material didactico en polaco: produccion de guiones de clase, resumenes de manuales y baterias de ejercicios para escuelas de aviacion, con la ventaja de un modelo de 7B desplegable en hardware modesto.
- Simulacion de conversaciones de instruccion multi-turno: con hasta tres turnos vistos en entrenamiento, puede mantener un dialogo de alumno e instructor sobre un mismo tema, aunque con contexto limitado.
- Generacion de datos sinteticos para entrenar otros modelos: usar la generacion de trazas de razonamiento en polaco para crear datasets de destilacion o de ajuste supervisado en dominio aeronautico, tal como sugiere el autor con la referencia a Magpie.
- Ajuste fino especifico por organizacion: una escuela o aerolinea polaca puede partir de estos pesos y especializarlos en su propio manual de operaciones, al ser licencia Apache 2.0 y formato safetensors estandar.
- Investigacion sobre especializacion vertical: util como caso de estudio de hasta que punto un ajuste completo sobre datos de un unico dominio degrada o preserva las capacidades generales del modelo base en polaco.
- Asistente interno de consulta documental en polaco: integrado en un pipeline RAG sobre manuales aeronauticos, para responder preguntas de operacion con trazabilidad de la fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de evaluaciones en polaco como Polish LLM Benchmark, y tampoco se aportan comparaciones cuantitativas con el modelo base. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia antes de considerar el modelo para produccion.

## Requisitos de hardware

- VRAM en precision completa (fp16/bf16): el repositorio pesa 15.0 GB en safetensors, por lo que se necesitan aproximadamente 16-18 GB de VRAM considerando cache KV y activaciones con contexto moderado.
- VRAM con cuantizacion de 8 bits: en torno a 9-10 GB de VRAM (pesos ~7.5 GB mas overhead).
- VRAM con cuantizacion de 4 bits: en torno a 5-7 GB de VRAM, segun longitud de contexto y tamano de lote.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100; para 4 bits, una RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 sobrada.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas con cuantizacion de 4 u 8 bits, y en tarjetas de 24 GB en fp16.
- Opciones de despliegue: Transformers (formato nativo safetensors), vLLM y TGI para servicio con batching; llama.cpp, Ollama o LM Studio previa conversion a GGUF, que no esta publicada en el repositorio.
- Latencia y throughput: no disponible; no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cpral/instruktor-lotnictwa-7B-2-hf | 7.48B | no disponible | polaco | Apache 2.0 | HuggingFace, safetensors |
| speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct (modelo base) | ~7B | no disponible en la informacion proporcionada | polaco | no verificado en esta busqueda | HuggingFace |
| Mistral-7B-Instruct-v0.3 | ~7.25B | 32.768 tokens | ingles y otros (no polaco oficial) | Apache 2.0 | HuggingFace, GGUF, vLLM, Ollama |
| Llama-3.1-8B-Instruct | ~8.03B | 131.072 tokens | multilingue (8 idiomas oficiales, sin polaco) | Llama 3.1 Community License | HuggingFace, GGUF, vLLM, Ollama |

La comparacion relevante es frente al modelo base polaco, ya que Mistral-7B y Llama-3.1-8B no cubren el polaco de forma oficial y no compiten en el mismo nicho de dominio aeronautico. No hay datos publicados que permitan comparar calidad entre este ajuste y Bielik-PL-Minitron-7B-v3.0-Instruct.

## Limitaciones y advertencias

- Idiomas: el modelo esta declarado unicamente para polaco; su uso en castellano, ingles u otros idiomas no esta soportado y probablemente degrade de forma notable.
- Dominio muy estrecho: el ajuste sobre datos de instruccion aeronautica puede provocar olvido catastrofico de capacidades generales; no debe asumirse un comportamiento correcto fuera de ese ambito.
- Riesgo de alucinacion: en un dominio normativo y de seguridad como la aviacion, cualquier salida del modelo debe verificarse contra fuentes oficiales; el modelo no tiene acceso a documentacion vigente ni a manuales actualizados.
- Longitud de contexto desconocida: al no publicarse, no es posible garantizar el manejo de documentos largos ni conversaciones extensas; los datos de entrenamiento solo cubren hasta tres turnos.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, ni en tareas generales ni en dominio aeronautico, lo que impide estimar su calidad real.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar las condiciones del modelo base Bielik-PL-Minitron-7B-v3.0-Instruct, de las que depende la cadena de licencias.
- Fechas: la model card indica creacion y actualizacion en octubre de 2026, lo que puede deberse a un error de metadatos; conviene contrastarlo antes de citar el modelo.
- Seguridad: no se menciona alineamiento, filtros de contenido ni evaluaciones de seguridad, por lo que se desaconseja su exposicion directa a usuarios finales sin capas de moderacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cpral/instruktor-lotnictwa-7B-2-hf
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cpral/nauka-lotnictwa-2
- Perfil del autor en HuggingFace: https://huggingface.co/cpral/models
- Referencia del modelo base Mistral-7B-Instruct-v0.2 (consulta externa): https://huggingface.co/model-hub/Mistral-7B-Instruct-v0.2
- Mistral-7B-Instruct-v0.3 en LM Studio (consulta externa): https://lmstudio.ai/models/mistralai/mistral-7b-instruct-v0.3
