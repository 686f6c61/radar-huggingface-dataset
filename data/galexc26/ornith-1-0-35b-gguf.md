# Galexc26/Ornith-1.0-35B-GGUF

## Resumen

Ornith-1.0-35B es un modelo de lenguaje de la familia Ornith-1.0, presentada por DeepReinforce (el repositorio consultado es un reupload en GGUF bajo la cuenta de HuggingFace `Galexc26`) como una familia de modelos abiertos orientada especificamente a "agentic coding", es decir, a agentes que operan sobre terminales, repositorios y entornos de desarrollo. Segun la model card, la familia se publica en cuatro tamanos: 9B denso, 31B denso, 35B MoE y 397B MoE, todos ellos post-entrenados sobre modelos base de las familias Gemma 4 y Qwen 3.5.

La variante documentada aqui es la de 35B en arquitectura Mixture of Experts (MoE), disenada para despliegue en una sola GPU. El dato real de parametros reportado en safetensors es de 34.660.610.688 parametros totales, lo que confirma la denominacion comercial de 35B. El repositorio pesa 180,7 GB, coherente con un paquete GGUF que agrupa multiples niveles de cuantizacion de un modelo de este tamano.

Su relevancia actual radica en dos puntos: por un lado, declara resultados de estado del arte entre modelos abiertos de tamano comparable en benchmarks de codigo agentico (Terminal-Bench 2.1, SWE-bench Verified, SWE-bench Pro); por otro, introduce un marco de entrenamiento auto-mejorable basado en RL que optimiza conjuntamente el "scaffold" (el andamiaje de herramientas y pasos del agente) y la solucion generada. La licencia es MIT, sin restricciones regionales declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer; modelo base derivado de Gemma 4 y Qwen 3.5 segun la model card |
| Parametros totales | 34.660.610.688 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; la model card no detalla los niveles concretos incluidos en el repositorio (repo de 180,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio); la familia original se distribuye con `library_name: transformers` |

## Arquitectura y entrenamiento

La model card describe Ornith-1.0 como una familia de modelos densos y MoE post-entrenados sobre bases Gemma 4 y Qwen 3.5. La variante de 35B es la version MoE ligera de la familia, pensada explicitamente para despliegue en una sola GPU, frente a la variante de 397B MoE. No se detalla en la informacion disponible el numero de expertos, el numero de parametros activos por token, la estrategia de enrutamiento ni la longitud de contexto nativa del modelo.

El elemento diferencial declarado es el marco de entrenamiento auto-mejorable. Segun el autor, Ornith-1.0 emplea aprendizaje por refuerzo para generar no solo las trayectorias de solucion ("solution rollouts") sino tambien el "scaffold" que las dirige. Al optimizar conjuntamente el andamiaje y la solucion resultante, el modelo aprende a descubrir mejores trayectorias de busqueda y a producir soluciones de mayor calidad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como DPO o RLHF supervisado al margen del bucle de RL descrito.

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software sobre repositorios reales, evaluada con SWE-bench Verified y SWE-bench Pro.
- Operacion como agente de terminal: ejecucion de comandos, lectura de salida, correccion de errores y planificacion multi-paso, evaluada con Terminal-Bench 2.1 tanto en el arnes Terminus-2 como en Claude Code.
- Razonamiento agentico multi-paso con generacion y optimizacion del propio scaffold de herramientas.
- Traduccion de lenguaje natural a repositorio funcional (benchmark NL2Repo citado por el autor).
- Uso en entornos de tipo OpenClaw, segun la lista de benchmarks declarada.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio, pipeline `text-generation`).
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; la model card no las menciona.

## Casos de uso

- Resolucion automatica de issues en repositorios: dado un informe de bug y acceso al arbol del proyecto, el modelo puede localizar los ficheros afectados, proponer un parche y validarlo ejecutando la suite de tests. Su puntuacion declarada de 75,6 en SWE-bench Verified lo situa como candidato directo para este flujo sin intervencion humana en la fase de triaje.
- Agentes de terminal para tareas de DevOps: interpretacion de errores de build, ajuste de ficheros de configuracion, gestion de dependencias y ejecucion de comandos de diagnostico en un bucle cerrado, apoyandose en los 64,2 puntos declarados en Terminal-Bench 2.1 con Terminus-2.
- Integracion en pipelines de CI/CD: uso del modelo como paso de auto-reparacion que, ante un fallo de integracion, propone y aplica un parche sobre la rama de trabajo antes de escalar al equipo humano.
- Asistente de revision de codigo en pull requests: analisis de diffs con contexto del repositorio completo y generacion de comentarios tecnicos sobre correccion, cobertura de tests y posibles regresiones.
- Refactorizacion guiada por objetivos: migracion de APIs obsoletas, actualizacion de dependencias mayores o reestructuracion de modulos, con verificacion incremental mediante la ejecucion de tests tras cada cambio.
- Generacion de proyectos desde especificacion: a partir de un documento de requisitos, producir la estructura de directorios, ficheros de configuracion y esqueleto funcional, aprovechando el benchmark NL2Repo citado en la model card.
- Despliegue local en una sola GPU para equipos con requisitos de privacidad: al ser un MoE de 35B en formato GGUF y licencia MIT, permite mantener el codigo y los datos del cliente dentro de la infraestructura propia sin llamadas a APIs externas.
- Formacion y evaluacion de tecnicas de agentes: la publicacion del marco de RL que optimiza conjuntamente scaffold y solucion lo convierte en una base util para investigacion sobre auto-mejora en agentes de codigo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La tabla original esta truncada en el material disponible: solo se muestran las filas reproducidas a continuacion y falta la fila final (SWE-bench Mu...).

| Benchmark | Ornith-1.0-35B | Qwen3.5-35B | Qwen3.6-35B | Gemma4-31B | Qwen3.5-397B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 64,2 | 41,4 | 52,5 | 42,1 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 62,8 | 38,9 | 49,2 | no disponible | 48,6 |
| SWE-bench Verified | 75,6 | 70,0 | 73,4 | 52,0 | 76,4 |
| SWE-bench Pro | 50,4 | 44,6 | 49,5 | 35,7 | 51,6 |
| SWE-bench Mu... (nombre truncado) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 34,66 B de parametros y de la sobrecarga habitual de la cache KV; el autor no publica cifras oficiales):
  - Cuantizacion de 4 bits: aproximadamente 20-22 GB de pesos.
  - Cuantizacion de 5 bits: aproximadamente 24-26 GB.
  - Cuantizacion de 6 bits: aproximadamente 28-30 GB.
  - Cuantizacion de 8 bits: aproximadamente 36-38 GB.
  - Precision de 16 bits: aproximadamente 69 GB.
- El tamano real de la cache KV depende de la longitud de contexto y del numero de capas atencionales, dato no disponible; en arquitecturas MoE la cache KV suele ser proporcional a los parametros activos, no a los totales, por lo que la huella puede ser inferior a la de un modelo denso equivalente.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 5090 para cuantizaciones de 4-5 bits; A100 40 GB, L40S 48 GB o H100 80 GB para cuantizaciones de 8 bits o para servir con contexto largo y batches concurrentes.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con cuantizacion de 4 bits, siempre que la longitud de contexto se mantenga moderada.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para el fichero GGUF; vLLM o TGI para servir el modelo en su formato original de transformers; el repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Terminal-Bench 2.1 (Terminus-2) | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Ornith-1.0-35B | 34,66 B | MoE | no disponible | 64,2 | 75,6 | MIT | GGUF y transformers |
| Qwen3.5-35B | 35 B (nominal) | no disponible | no disponible | 41,4 | 70,0 | no disponible | no disponible |
| Qwen3.6-35B | 35 B (nominal) | no disponible | no disponible | 52,5 | 73,4 | no disponible | no disponible |
| Gemma4-31B | 31 B (nominal) | no disponible | no disponible | 42,1 | 52,0 | no disponible | no disponible |
| Qwen3.5-397B | 397 B (nominal) | MoE | no disponible | 53,5 | 76,4 | no disponible | no disponible |

Advertencia: las cifras de los modelos comparados proceden exclusivamente de la tabla publicada por el autor de Ornith; no se han verificado de forma independiente y no se dispone de informacion sobre las condiciones exactas de evaluacion ni sobre la licencia o el formato de distribucion de los modelos de comparacion.

## Limitaciones y advertencias

- La model card disponible esta truncada: falta la fila final de la tabla de benchmarks (SWE-bench Mu...), asi que el perfil de rendimiento publicado esta incompleto.
- El repositorio de HuggingFace corresponde a la cuenta `Galexc26`, mientras que el enlace de licencia de la model card apunta a `deepreinforce-ai/Ornith-1.0-35B-GGUF`. Es probable que se trate de un reupload o espejo de la publicacion original, sin que se pueda confirmar la integridad ni la fidelidad de los pesos cuantizados.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion comunitaria de los artefactos publicados. Conviene verificar los hashes antes de usarlos en produccion.
- No se declaran idiomas soportados. El enfoque en codigo agentico sugiere un sesgo hacia ingles en documentacion, comentarios y mensajes de error, con rendimiento incierto en castellano.
- Riesgo de alucinacion: no se publican tasas de hallucination ni evaluaciones de fidelidad. En tareas agenticas el riesgo principal no es la invencion de texto, sino la ejecucion de comandos destructivos o la aplicacion de parches incorrectos; se recomienda ejecucion en sandbox y validacion por tests.
- No se publican sesgos conocidos, composicion del dataset de entrenamiento ni medidas de mitigacion, lo que dificulta una evaluacion de riesgos previa a produccion.
- Aunque la licencia es MIT y el autor declara ausencia de restricciones regionales, la procedencia de los modelos base (Gemma 4, Qwen 3.5) podria imponer condiciones adicionales segun sus respectivas licencias de origen, no detalladas en la informacion disponible.
- No se especifican requisitos de atribucion ni clausulas de uso aceptable mas alla del texto MIT.
- No hay informacion sobre longitud de contexto, lo que impide planificar tareas que requieran ventanas amplias (analisis de repositorios completos, por ejemplo) sin pruebas previas.
- Formatos de cuantizacion concretos no detallados: el usuario debe inspeccionar el arbol de ficheros del repositorio para conocer los niveles disponibles y elegir en funcion de su VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Galexc26/Ornith-1.0-35B-GGUF
- Enlace de licencia referenciado en la model card: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B-GGUF/blob/main/LICENSE
- Blog de Ornith (DeepReinforce): https://deep-reinforce.com/ornith.html
- Paper, repositorio de codigo, demostraciones o informes tecnicos: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos corresponden integramente a sitios de agencia de viajes (lastminute.com) y no guardan ninguna relacion con el modelo; no se ha encontrado informacion externa relevante sobre Ornith-1.0 en la busqueda realizada.
