# ManojP09/logfix-smollm2-360m

## Resumen

LogFix V4 (ManojP09/logfix-smollm2-360m) es un adaptador LoRA de PEFT construido sobre HuggingFaceTB/SmolLM2-360M-Instruct, entrenado por el autor ManojP09 con la herramienta LogFix Studio. Su tarea es acotada y concreta: recibir un error de Python o un traceback y devolver una respuesta estructurada en cuatro secciones fijas (ERROR TYPE, CAUSE, FIX, PREVENTION). No es un modelo de proposito general, sino un ajuste fino especializado en explicacion de fallos de Python para aprendizaje y depuracion asistida.

El modelo base es un transformer decoder-only de la familia SmolLM2, con aproximadamente 360 millones de parametros; el adaptador anade 8.683.520 parametros entrenables (rango LoRA 16, alpha 32). El entrenamiento se realizo sobre el dataset sintetico LogFix Dataset V4 (logfix-v4), con 519 ejemplos de entrenamiento, 20 de validacion y 20 de test congelados y sellados por hashes, durante 3 epocas con una longitud maxima de secuencia de 512 tokens.

Su relevancia es la de un experimento reproducible de ajuste fino pequeno y barato: demuestra como un adaptador LoRA sobre un modelo de 360M puede imponer un formato de salida rigido para una tarea de nicho, con metricas de evaluacion publicadas (95,0% de cumplimiento de formato, 80,0% de acierto en el tipo de error) y advertencias explicitas de que no es apto para produccion. Es util como referencia metodologica y como punto de partida, no como herramienta fiable de depuracion sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (base SmolLM2-360M-Instruct) |
| Parametros totales | Aproximadamente 360M en el modelo base; adaptador de 8.683.520 parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la informacion proporcionada solo indica max_seq_length de 512 durante el entrenamiento) |
| Tipos de cuantizacion | No disponible (no especificados por el autor; el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (no declarados en la model card ni en los metadatos) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base usa safetensors |
| Libreria | peft (con transformers) |
| Pipeline | text-generation |
| Version | V4, run_20260925_010 |
| Descargas / likes | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un modelo decoder-only de tipo transformer de aproximadamente 360M de parametros. El ajuste es un LoRA estandar de PEFT: rango 16, alpha 32, dropout 0,05, learning rate 1e-4, 3 epocas, batch size 4 con acumulacion de gradiente 2, longitud maxima de secuencia 512 y semilla 42. Solo se entrenaron los pesos del adaptador desde los pesos originales del modelo base, no desde una version anterior de LogFix. El autor no documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

Los datos de entrenamiento proceden del dataset sintetico LogFix Dataset V4 (logfix-v4), compuesto por 519 ejemplos de entrenamiento, 20 de validacion y 20 de test. La composicion declarada es: 169 ejemplos de diversidad, 81 fundacionales, 135 dirigidos a fallos y 134 de ejemplo dificil. Los registros nuevos fueron redactados por autores que no vieron el conjunto congelado y validados mediante scripts (esquema, formato, longitud, duplicados y fuga de datos), pero no por revisores humanos. El hash SHA-256 del fichero de entrenamiento es 53eb20dde1aab000ba41ecd4161e856ff728775ab9de0d319778ca60451a3047.

La evaluacion se realiza sobre un conjunto de test congelado de 20 ejemplos que ninguna version entrena, con prompts fijos, decodificacion greedy (temperatura 0), 256 tokens nuevos y lotes de 4. Las comprobaciones son deterministas y miden presencia de las cuatro secciones, coincidencia del ERROR TYPE con una etiqueta aceptada y menciones de conceptos de correccion en la seccion FIX mediante reglas de subcadena. El propio autor advierte que estas comprobaciones miden formato y menciones, no la correccion real de la solucion propuesta.

## Capacidades

- Generacion de texto conversacional con formato impuesto: respuestas estructuradas en las secciones ERROR TYPE, CAUSE, FIX y PREVENTION.
- Analisis de errores y tracebacks de Python, con clasificacion del tipo de error segun etiquetas aceptadas.
- Explicacion de causas probables de un fallo de Python para lectores principiantes o intermedios.
- Sugerencia de correcciones en la seccion FIX, con cobertura de conceptos requeridos medida por subcadenas.
- Recomendaciones de prevencion orientadas a evitar la recurrencia del error.
- Inferencia en CPU con latencia documentada (7,82 s de media por generacion en lote sobre el conjunto de evaluacion).
- No hay evidencia declarada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Explicacion de errores en tutoria de Python: el modelo recibe un traceback y devuelve la causa y una propuesta de correccion en cuatro secciones, lo que encaja como primer material de apoyo en cursos introductorios. Requiere revision humana previa.
- Asistente de depuracion en cuadernos educativos: integrado en un Jupyter o similar, el alumno pega el error y obtiene una hipotesis de causa para compararla con la solucion del docente.
- Etiquetado previo de tipo de error en lotes de trazas: la seccion ERROR TYPE puede usarse como clasificador aproximado (80,0% de acierto en el test congelado) para agrupar fallos por categoria antes de una revision manual.
- Normalizacion de mensajes de error en documentacion interna: generar descripciones con formato homogeneo a partir de errores reales, para alimentar un glosario de fallos frecuentes del equipo.
- Prototipado de pipelines de soporte a desarrolladores: validar el formato de cuatro secciones dentro de un flujo mayor antes de decidir si merece la pena escalar a un modelo de mayor tamano.
- Banco de pruebas para evaluar decodificacion y evaluacion determinista: sirve como caso de estudio reproducible de LoRA con conjunto de test congelado y comprobaciones por reglas.
- Generacion de borradores de seccion PREVENTION para wikis internas: propuestas de buenas practicas a partir de patrones de error recurrentes, sujetas a validacion.
- Inferencia en entornos sin GPU: su tamano permite ejecutarlo en CPU, lo que habilita demos locales y pruebas de integracion baratas.

## Benchmarks y rendimiento

Datos de evaluacion publicados por el autor (eval_20260925_192222, 20 ejemplos de test congelados):

| Metrica | Valor |
|---|---|
| Cumplimiento de formato (las cuatro secciones) | 95,0% |
| Acierto en el tipo de error | 80,0% |
| Cobertura de conceptos de correccion requeridos | 27,5% |
| Completitud de campos (de 4 secciones) | 3,80 |
| Perdida de test, respuesta completa | 1,9937 |
| Perdida de test, CAUSE/FIX/PREVENTION | 1,9997 |
| Tiempo medio de generacion (CPU, por lotes) | 7,82 s |

No se han publicado en la informacion disponible otros benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 360M de parametros, los pesos en fp16 ocupan en torno a 0,7 GB y los pesos del adaptador alrededor de 17 MB adicionales. En cuantizacion de 8 bits la huella de pesos baja a unos 0,36 GB y en 4 bits a unos 0,2 GB. Estas cifras son estimaciones de calculo a partir del tamano, no datos publicados por el autor.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas, e incluso en GPUs integradas o en CPU.
- El autor documenta inferencia en CPU con lote: 7,82 s de media por generacion de 256 tokens nuevos sobre el conjunto de evaluacion.
- No se dispone de datos de throughput en GPU ni de latencia en aceleradores de datacenter (A100, H100) en la informacion proporcionada.
- Opciones de despliegue: transformers junto con peft es el camino documentado en la model card. No se especifican integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA la conversion a GGUF requeriria fusion previa con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManojP09/logfix-smollm2-360m | Adaptador de 8,68M sobre base de 360M | No disponible | Explicacion de errores de Python en cuatro secciones | No disponible | HuggingFace (0 descargas) |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M aproximadamente | No disponible en esta informacion | Instrucciones de proposito general | No disponible en esta informacion | HuggingFace (modelo base) |
| Otros adaptadores de depuracion sobre modelos pequenos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks que permitan comparar el rendimiento de este adaptador con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo base es pequeno: tareas de depuracion complejas (tracebacks largos, multiples causas, interioridades de frameworks, comportamiento dependiente de version) pueden superar su capacidad, y puede afirmar causas o correcciones erroneas con seguridad.
- El conjunto de evaluacion tiene solo 20 ejemplos, de modo que un unico ejemplo desplaza una tasa en 5 puntos porcentuales; las metricas tienen una incertidumbre alta.
- La cobertura de conceptos de correccion requeridos es del 27,5%, muy baja: el modelo genera el formato correcto pero a menudo no menciona los conceptos de arreglo esperados.
- La evaluacion mide presencia de secciones, coincidencia de etiquetas y menciones por subcadena, no la correccion real de las soluciones propuestas.
- Los datos de entrenamiento son sinteticos y generados para el proyecto, no recogidos de usuarios reales, y no han sido revisados por humanos.
- El autor declara explicitamente que el modelo no esta listo para produccion: completar entrenamiento y evaluacion no establece correccion ni seguridad de las correcciones.
- Las respuestas pueden repetirse hasta alcanzar el limite de tokens en algunas entradas.
- No se declaran sesgos ni limitaciones de idioma en la informacion proporcionada; tampoco se declara licencia, por lo que el uso comercial queda sin cobertura explicita.
- Al ser un adaptador LoRA, requiere descargar y cargar el modelo base SmolLM2-360M-Instruct junto con los pesos del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ManojP09/logfix-smollm2-360m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- No se han proporcionado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
