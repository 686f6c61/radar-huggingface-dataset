# DoctorEdoP369/Atman_Ai_V4_Qwen

## Resumen

Atman_Ai_V4_Qwen es un modelo de lenguaje de 8.953.803.264 parametros (aproximadamente 8,95 B) publicado por el usuario DoctorEdoP369 en HuggingFace bajo licencia Apache 2.0. Se trata de un ajuste fino derivado de DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED, del que hereda la arquitectura de la familia Qwen3.5 y su modo de razonamiento explicito mediante una cadena ` thinking` previa a la respuesta. El autor lo presenta como la revision V4 de su proyecto "Atman AI", orientada a razonamiento profundo, conversaciones largas y escritura narrativa.

El modelo se distribuye principalmente en formato GGUF, con un tamano de repositorio de 16,9 GB, y esta pensado para ejecutarse en local sobre hardware de consumo. Incluye un proyector multimodal (mmproj) que habilita capacidades de vision cuando el cliente de inferencia lo soporta. La model card declara soporte multilingue, contexto ampliado mediante archivos Yarn y una reduccion deliberada del filtrado de seguridad respecto a su modelo base.

Su relevancia actual reside en la combinacion de tres factores: un tamano de 9B que cabe en GPU de gama alta de consumo, un modo de razonamiento con cadena visible que facilita la auditoria de errores, y una politica de contenido permisiva que lo diferencia de los asistentes alojados. No obstante, el repositorio no registra descargas ni valoraciones y no publica resultados de benchmarks, por lo que cualquier evaluacion debe hacerse de forma empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en la familia Qwen3.5, con modo de razonamiento explicito (` thinking`) y proyector multimodal (mmproj) para vision. No se especifica si es denso o MoE |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el autor indica que se ha ampliado mediante archivos Yarn, sin especificar la cifra final) |
| Tipos de cuantizacion | GGUF en varias cuantizaciones; el autor menciona explicitamente la Q5 como la mas debil. No se detalla el catalogo completo |
| Idiomas soportados | no disponible en los metadatos; el autor afirma soporte multilingue y la model card incluye la etiqueta `ita` (italiano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF principalmente (repositorio de 16,9 GB); la cifra de parametros se declara procedente de safetensors |
| Modelo base | DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED |
| Contexto de entrenamiento declarado | Material multi-turno con razonamiento sostenido entre turnos; sin detalle de volumen de tokens |
| Fecha de publicacion | 27 de septiembre de 2026 (creacion del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.5, por lo que la arquitectura subyacente es un transformer decoder con atencion completa y un modo de razonamiento que genera una cadena de pensamiento explicita antes de la respuesta final. El autor no documenta si el ajuste introduce decodificacion especulativa, atencion lineal, atencion dispersa ni ninguna otra modificacion estructural, ni tampoco si la ampliacion de contexto mediante Yarn altera el esquema de posiciones original. La unica innovacion declarada de forma explicita es la ampliacion de contexto con archivos Yarn y la presencia de un proyector multimodal que permite procesar imagenes cuando el cliente lo soporta.

En cuanto al entrenamiento, la model card indica que el ajuste se realizo sobre material multi-turno en el que el razonamiento se arrastra entre varios intercambios en lugar de reiniciarse en cada mensaje. No se especifica el numero de tokens empleados, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras formas de alineacion. El autor afirma que el modelo fue "entrenado con pureza y libertad", una formulacion que sugiere la ausencia de filtros de seguridad adicionales, pero que no aporta informacion tecnica verificable sobre el procedimiento. Se distribuyen variantes con el prompt ya incorporado para facilitar su uso directo.

Es importante senalar que el autor recomienda unos parametros de muestreo concretos (temperatura 0.6, top_p 0.96, top_k 20, min_p 0.03, presence_penalty 0.04, repeat_penalty 1.06) y advierte de que modificarlos puede degradar el funcionamiento del modelo. Esta dependencia de una configuracion fija es un indicio de que el ajuste fino se ha especializado en un regimen de decodificacion concreto.

## Capacidades

- Generacion de texto y razonamiento profundo: produce una cadena de pensamiento explicita dentro de ` thinking` antes de emitir la respuesta final, lo que permite revisar el proceso deductivo.
- Razonamiento cientifico-matematico: la model card situa este ambito entre los objetivos de diseno del ajuste, aunque no aporta cifras que lo respalden.
- Razonamiento de tipo psicologico: el autor declara un enfasis explicito en el analisis psicologico como una de las motivaciones del modelo.
- Escritura creativa y narrativa: etiquetado con `story`, orientado a relatos y continuaciones coherentes.
- Conversaciones largas y multi-turno: ajustado sobre material en el que el razonamiento se mantiene entre intercambios sucesivos.
- Vision: incluye proyector multimodal (mmproj), siempre que el cliente de inferencia lo cargue y lo soporte.
- Multilingue: declarado por el autor, con presencia de la etiqueta `ita` (italiano) en los metadatos; no se detalla la cobertura por idioma.
- Contenido sin censura: la model card indica un filtrado de seguridad reducido heredado del modelo base, con respuestas a preguntas que los asistentes alojados rechazan.
- Modo conversacional y compatibilidad con endpoints: etiquetado como `conversational` y `endpoints_compatible`.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible como caracteristica declarada; el razonamiento multi-paso se describe solo a nivel de cadena de pensamiento.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistencia reflexiva y acompanamiento conversacional: el modelo esta ajustado sobre material multi-turno con razonamiento sostenido y con enfasis declarado en el ambito psicologico. Puede emplearse para mantener conversaciones largas de caracter introspectivo, siempre que se presente como herramienta de reflexion y no como sustituto de un profesional sanitario.
- Escritura narrativa de formato largo: gracias a la etiqueta `story` y al contexto ampliado con Yarn, resulta adecuado para generar relatos, continuaciones y tramas coherentes a lo largo de varios capitulos manteniendo el hilo argumental.
- Despliegue offline en entornos aislados o air-gapped: su distribucion en GGUF y su tamano de 9B permiten ejecutarlo en un puesto de trabajo sin conexion a internet, lo que encaja en laboratorios, entornos industriales o instalaciones con requisitos de confidencialidad estrictos.
- Analisis de imagenes en local con cliente compatible: el proyector mmproj permite describir capturas, extraer texto de imagenes o interpretar diagramas sencillos, siempre que la interfaz de inferencia cargue el archivo de vision.
- Generacion de contenido creativo y de ficcion sin filtros editoriales: para proyectos de escritura que aborden tematicas que los asistentes alojados rechazan, asumiendo el usuario la responsabilidad editorial y legal del contenido generado.
- Asistencia en italiano u otros idiomas minoritarios respecto al ingles: la presencia de la etiqueta `ita` y la declaracion multilingue lo hacen util para tareas de redaccion, traduccion o adaptacion de textos en ese idioma.
- Auditoria de razonamiento: dado que la cadena de pensamiento es visible, puede emplearse como herramienta didactica o de investigacion para inspeccionar como un modelo de 9B estructura un problema y en que punto de la cadena introduce errores.
- Prototipado e investigacion en hardware de consumo: con un coste de VRAM moderado, es adecuado para experimentar con tecnicas de prompting de razonamiento, comparativas de cuantizacion y evaluacion de ajustes finos derivados de Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card afirma que el modelo es superior a sus modelos base e incluso a modelos de mayor tamano, pero no aporta ninguna cifra de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y el repositorio no incluye resultados verificables. Tampoco se dispone de datos de latencia o throughput publicados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los 8,95 B de parametros, no confirmada por el autor):
  - Cuantizacion Q4_K_M: aproximadamente 5,5-6 GB.
  - Cuantizacion Q5_K_M: aproximadamente 6,5-7 GB.
  - Cuantizacion Q6_K: aproximadamente 7,5-8 GB.
  - Cuantizacion Q8_0: aproximadamente 9,5-10 GB.
  - Precisión fp16: aproximadamente 18 GB.
- Sumar entre 0,5 y 1 GB adicionales si se carga el proyector multimodal (mmproj) para vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, y en el ambito profesional A100 40/80 GB, H100 80 GB y L40S.
- Viabilidad en GPU de consumo: si, en cuantizaciones Q4 a Q6 cabe con holgura en tarjetas de 8-12 GB. Las cuantizaciones Q8 y fp16 requieren 12-16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El soporte de vision depende de que el cliente cargue el archivo mmproj, algo que varias aplicaciones locales no hacen.
- Latencia y throughput: no disponible.
- El autor distribuye "Atman Ai Setup.zip", un paquete de instalacion que incluye el proyector de vision y los parametros por defecto, y en el que solo falta el archivo GGUF principal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento explicito | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| Atman_Ai_V4_Qwen | 8,95 B | no disponible (ampliado con Yarn) | Si (` thinking`) | Si, via mmproj | Apache 2.0 | GGUF |
| DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED (modelo base directo) | ~9 B (no confirmado) | no disponible | Si, segun el nombre del modelo | no disponible | no disponible | no disponible |
| Otros ajustes de la familia Qwen3.5 en el rango 8-9 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos, ya que ninguna de las fuentes consultadas publica resultados de benchmarks. La unica comparacion documentada es cualitativa y procede del propio autor, que afirma superioridad sobre el modelo base y sobre modelos de mayor tamano sin aportar mediciones.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el autor reconoce explicitamente que el modelo hereda un filtrado de seguridad minimo del modelo base y que respondera a peticiones que los asistentes alojados rechazan. Esto implica que el modelo puede generar contenido ofensivo, ilegal o danino, y que la responsabilidad recae por completo en el usuario.
- Alucinacion: la model card admite que el modelo "puede estar equivocado con seguridad en si mismo". La cadena de razonamiento visible facilita detectar errores, pero no los evita.
- Ausencia de validacion profesional: el propio autor advierte que el modelo no sustituye a un medico, abogado, contable o ingeniero. No debe utilizarse para decisiones clinicas, legales o financieras.
- Dependencia de parametros de muestreo fijos: el autor advierte de que modificar la temperatura, top_p, top_k, min_p, presence_penalty o repeat_penalty puede degradar el comportamiento del modelo, lo que limita su integracion en pipelines que requieran otras configuraciones.
- Vision dependiente del cliente: varias aplicaciones locales ignoran el archivo mmproj, por lo que la funcionalidad multimodal no esta garantizada en todos los entornos.
- Contexto no cuantificado: aunque se declara una ampliacion mediante Yarn, no se especifica la longitud final ni se aportan pruebas de que el rendimiento se mantenga estable en contextos muy largos. La degradacion por posiciones extrapoladas es un riesgo conocido en este tipo de ampliaciones.
- Idiomas no verificados: la declaracion multilingue no se acompana de una lista de idiomas soportados ni de evaluaciones por idioma. Fuera del ingles y el italiano el rendimiento es incierto.
- Sin historial de adopcion: el repositorio registra cero descargas y cero valoraciones en el momento de la consulta, y no hay resultados de benchmarks independientes. No existe evidencia externa que respalde las afirmaciones de rendimiento del autor.
- Licencia y responsabilidad: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero la licencia del modelo base y de los datos de ajuste no se detalla. Conviene verificar la cadena de licencias antes de un despliegue en produccion, especialmente dado el caracter explicitamente sin censura del ajuste.
- Uso en produccion: no se recomienda su despliegue en aplicaciones de cara al publico sin una capa adicional de moderacion de contenido, dado el filtrado de seguridad reducido.
- Contenido multimedia referenciado en la model card (`AttaTheBest.gif`, `AtmanAi.png`, `SuperAtmanAiV4.mp4`) no verificable desde los metadatos textuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DoctorEdoP369/Atman_Ai_V4_Qwen
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Perfil del autor: https://huggingface.co/DoctorEdoP369
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo: no disponible
- Demo en linea: no disponible
- Paquete de instalacion "Atman Ai Setup.zip": no disponible como enlace directo en la informacion proporcionada
