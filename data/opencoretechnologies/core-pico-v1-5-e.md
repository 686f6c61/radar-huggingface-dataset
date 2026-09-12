# OpenCOReTechnologies/CORe-Pico-V1.5-e

## Resumen

CORe-Pico-V1.5-e es un modelo de lenguaje causal compacto publicado por OpenCOReTechnologies (CORe Technologies, empresa con sede en Estados Unidos) bajo licencia MIT. Se presenta como la revision refinada de Pico V1.5, con el objetivo declarado de mantenerse en el tema de la pregunta y detener la generacion de forma limpia, en lugar de derivar hacia texto no relacionado. La model card lo describe como un modelo conversacional de un solo turno, disenado para ejecutarse incluso en CPU.

Tecnicamente es un transformer denso de arquitectura propia, registrado como tipo `core` (`COReForCausalLM`), que requiere `trust_remote_code=True` para cargarse con `transformers`. La model card declara 183 millones de parametros, mientras que el recuento real de pesos en safetensors es de 195.669.504 parametros (aproximadamente 195,7 M), una discrepancia que conviene tener en cuenta. La configuracion indicada es de 24 capas, 12 cabezas de atencion y anchura de 768, con una longitud de contexto de solo 512 tokens y un tokenizador BPE de 16.384 entradas.

Su relevancia es limitada y muy acotada: no compite con asistentes generales, sino que ocupa el nicho de modelos diminutos ejecutables en cualquier equipo, con pesos publicados en safetensors (fp32) y en tres cuantizaciones GGUF (f16, q8_0 y q4_k_m, esta ultima de 122 MB). El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y no se ha publicado informacion sobre datos de entrenamiento, proceso de alineacion ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `COReForCausalLM`, transformer causal de arquitectura personalizada (tipo de modelo `core`) |
| Parametros totales | 195.669.504 segun los pesos safetensors; la model card declara 183 M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (safetensors), GGUF f16, GGUF q8_0, GGUF q4_k_m |
| Idiomas soportados | Ingles (la model card indica "English only") |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32) y GGUF (f16, q8_0, q4_k_m) |

Datos adicionales de configuracion: 24 capas, 12 cabezas de atencion, anchura oculta de 768, tokenizador BPE de 16.384 tokens con plantilla de chat basada en `<|user|>`, `<|assistant|>` y `<|endoftext|>`. Tamano del repositorio: 1,5 GB.

## Arquitectura y entrenamiento

La model card describe la arquitectura como un transformer causal personalizado bajo la clase `COReForCausalLM`, registrada con el nombre de tipo `core` y distribuida mediante codigo remoto, de modo que se carga con `transformers` estandar y `trust_remote_code=True`. No se especifica si incorpora attention lineal, decodificacion especulativa, atencion por ventanas u otra innovacion tecnica. Los unicos detalles estructurales publicados son el numero de capas (24), cabezas (12) y dimension de modelo (768), coherentes con un transformer denso de escala pequena.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre el proceso de destilacion o preentrenamiento. La unica referencia al entrenamiento es funcional: la revision V1.5-e corrige el comportamiento de V1.5 en dos aspectos, mantenerse en el tema y detenerse de forma fiable en `<|endoftext|>`, lo que sugiere un ajuste posterior orientado al formato de chat y a la coherencia de turno unico. En cuanto al empaquetado, la model card indica que los ficheros GGUF emplean por ahora una arquitectura preexistente mientras el equipo prepara un PR a llama.cpp para anadir su arquitectura personalizada.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a turnos unicos y prompts de pocas centenas de tokens.
- Respuestas de identidad consistentes: quien es, que modelo es, quien lo desarrollo y negacion de ser ChatGPT. La respuesta publicada en la model card es "I'm CORe Flash, a tiny language model developed by CORe Technologies, a US-based company".
- Respuestas factuales cortas y directas, por ejemplo "The capital of France is Paris" ante la pregunta por la capital de Francia.
- Explicaciones breves y chat en lenguaje llano.
- Cierre de turno fiable mediante el token especial `<|endoftext|>`.
- Plantilla de chat propia con los roles `<|user|>` y `<|assistant|>`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo de pensamiento extendido ni capacidades multilingues. El modelo es exclusivamente de texto y en ingles.

## Casos de uso

- Asistente de identidad y marca embebido: el modelo responde de forma consistente a preguntas del tipo "quien eres" o "quien te ha creado", por lo que puede usarse como capa conversacional de presentacion en demos, kioscos o aplicaciones de escritorio donde se necesita una voz propia del producto.
- Clasificacion y respuesta a FAQ de una sola pregunta: con 512 tokens de contexto y respuestas directas, encaja en sistemas de preguntas frecuentes donde cada consulta es independiente y no requiere historial.
- Prototipado y pruebas de integracion: al ocupar 122 MB en q4_k_m y caber en CPU, permite validar plantillas de chat, pipelines de inferencia y flujos de despliegue antes de migrar a modelos mayores.
- Inferencia en dispositivos sin GPU: aplicaciones de escritorio, utilidades CLI, plugins de editores o entornos embebidos con recursos muy limitados pueden ejecutar el modelo con llama.cpp u Ollama sin acelerador dedicado.
- Generacion de texto controlada con baja latencia: tareas de autocompletado corto, etiquetado o generacion de una frase de respuesta donde el coste por inferencia debe ser minimo.
- Educacion y demostraciones de arquitecturas personalizadas: sirve como ejemplo funcional de integracion de un modelo de tipo `core` en `transformers` con `trust_remote_code=True`, util para quien quiera estudiar el mecanismo.
- Filtrado previo o generacion de borradores: puede producir una primera version de una respuesta corta que despues se valide o reescriba con un modelo mayor, reduciendo el coste del sistema completo.
- Pruebas de carga y benchmarking de infraestructura: su tamano minimo lo hace adecuado para medir throughput y latencia de servidores de inferencia sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, y los resultados de la busqueda web no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2-0,3 GB en q4_k_m (122 MB de pesos mas cache KV y overhead), 0,3-0,5 GB en q8_0 (197 MB) y 0,5-0,9 GB en f16 (368 MB). Las estimaciones para fp32 safetensors son de alrededor de 1,0-1,5 GB incluyendo activaciones y overhead del runtime.
- Cache KV: con 24 capas, 12 cabezas y dimension de cabeza de 64, la cache en precision de 16 bits para los 512 tokens de contexto ocupa del orden de 38 MB, un valor despreciable en cualquier configuracion.
- GPU recomendadas: no requiere GPU dedicada. Funciona en cualquier GPU consumer con al menos 1 GB de memoria libre, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o integradas modernas. Tambien funciona exclusivamente en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, y tambien en telefonos y dispositivos de placa unica con suficiente RAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` para los pesos safetensors; llama.cpp (`llama-cli`, `llama-cpp-python`), LM Studio, Ollama y cualquier runtime compatible con GGUF para las cuantizaciones. La model card menciona compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion para ninguna configuracion de hardware.
- Nota critica de despliegue: es obligatorio usar la plantilla de chat exacta del modelo y configurar `<|endoftext|>` como cadena de parada. Con plantillas por defecto tipo `Human:`/`AI:` o ChatML, la salida degenera en texto incoherente. En LM Studio hay que fijar la plantilla manualmente porque no la lee del GGUF.

## Comparativa con modelos similares

La comparativa se limita a caracteristicas verificables de modelos de la misma franja de tamano. No se dispone de datos de rendimiento comparativos para este modelo.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| CORe-Pico-V1.5-e | 183 M declarados / 195,7 M reales | 512 tokens | Ingles | MIT | safetensors, GGUF |
| GPT-2 | 124 M | 1.024 tokens | Ingles | MIT | safetensors, GGUF, otros |
| SmolLM-135M | 135 M | 2.048 tokens | Ingles | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Multilingue | Apache 2.0 | safetensors, GGUF |

CORe-Pico-V1.5-e es el mas restrictivo del grupo en longitud de contexto (512 tokens frente a 1.024, 2.048 y 32.768) y el unico limitado explicitamente al ingles. Su ventaja es la licencia MIT combinada con un tamano de pesos muy reducido en q4_k_m. No hay datos publicos que permitan comparar calidad de generacion con estas alternativas.

## Limitaciones y advertencias

- Alucinacion factual: la propia model card advierte de que el modelo afirmara hechos incorrectos, tendra problemas con la aritmetica e improvisara cuando no sepa algo. Las respuestas deben tratarse como punto de partida, no como verdad.
- Contexto muy corto: 512 tokens limitan el uso a prompts de pocas centenas de tokens y a conversaciones de un solo turno. No es adecuado para dialogos largos ni para resumir documentos.
- Idioma unico: solo ingles. No hay soporte declarado de castellano ni de ninguna otra lengua.
- Inconsistencia de identidad: el modelo se identifica como "CORe Flash" en lugar de CORe Pico V1.5-e, lo que indica que la senal de identidad del entrenamiento no coincide con el nombre del artefacto publicado.
- Discrepancia en el recuento de parametros: la model card declara 183 M y los pesos safetensors suman 195,7 M. Conviene verificar cual es la cifra correcta antes de planificar presupuesto de memoria.
- Plantilla de chat obligatoria: cualquier plantilla distinta de la especificada produce texto incoherente. Es un fallo de integracion frecuente y no un defecto del modelo en si.
- Codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio del autor. Debe auditarse antes de usarlo en produccion.
- Arquitectura GGUF no nativa: segun la model card, los GGUF usan una arquitectura preexistente hasta que se acepte el PR en llama.cpp, lo que puede provocar diferencias de comportamiento entre la ruta `transformers` y la ruta GGUF.
- Madurez y soporte: el repositorio no tiene descargas ni valoraciones, y no hay documentacion sobre datos de entrenamiento, evaluacion o mantenimiento. No hay garantias de soporte a largo plazo.
- Licencia: MIT permite uso comercial y modificacion sin restricciones relevantes, pero no exime de verificar el origen y la licencia del codigo remoto asociado a la arquitectura personalizada.
- Riesgo de sesgo: no se ha publicado informacion sobre composicion del dataset ni sobre evaluaciones de sesgo, por lo que no puede descartarse la presencia de sesgos propios de los datos de entrenamiento, que se desconocen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-V1.5-e
- Sitio del autor: https://opencore.one
- Imagen de marca referenciada en la model card: https://opencore.one/og-image.png

No se han encontrado en la busqueda web papers, blogs tecnicos, repositorios de codigo, demos ni resultados de evaluacion asociados a este modelo.
