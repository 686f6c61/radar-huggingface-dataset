# Avicennasis/incorrecter-GGUF

## Resumen

Incorrecter GGUF es la version cuantizada en formato GGUF del modelo Avicennasis/incorrecter, un modelo de lenguaje de 630.167.424 parametros (aproximadamente 0,63 mil millones) desarrollado por el usuario Avicennasis. Su proposito es muy especifico y poco habitual: recibe un texto limpio en ingles como mensaje de usuario y devuelve ese mismo texto con entre una y tres modificaciones a nivel de palabra (errores tipograficos introducidos de forma deliberada). No es, por tanto, un modelo generativo de proposito general, sino una herramienta de aumento de datos y de generacion sintetica de ruido textual.

El repositorio contiene exclusivamente la compilacion cuantizada para Ollama, con el nombre interno `incorrecter-Q8_0.gguf`. Segun la model card del autor, la cuantizacion Q8_0 fue la unica que supero la puerta de evaluacion interna (el criterio de ediciones de 1 a 3 palabras debia alcanzar 0,70 sobre un conjunto de 40 textos); la variante Q4_K_M fue descartada al obtener 0,60 en esa misma comprobacion.

La relevancia del modelo radica en su nicho: disponer de un generador reproducible de erratas permite evaluar correctores ortograficos, medir la robustez de sistemas de recuperacion de informacion o construir conjuntos de datos de entrenamiento con ruido controlado, sin depender de anotacion manual. La licencia Apache 2.0 y su tamano reducido facilitan su integracion en pipelines automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 630.167.424 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); Q4_K_M fue probado y rechazado en la evaluacion del autor |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base distribuido en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset. La model card de este repositorio remite explicitamente a la model card del modelo base, Avicennasis/incorrecter, para consultar los datos de entrenamiento, la evaluacion y las limitaciones; esos detalles no forman parte de la informacion proporcionada. Lo unico verificable es que se trata de un modelo derivado del base mediante cuantizacion a GGUF, orientado a conversacion (etiqueta `conversational`) y con plantilla de chat compatible con Ollama.

El unico dato objetivo sobre el proceso de ajuste es la puerta de evaluacion aplicada a las cuantizaciones. La metrica reportada es la tasa de ediciones de 1 a 3 palabras sobre un conjunto de 40 textos: Q8_0 la supero (por encima del umbral de 0,70) y Q4_K_M no (0,60). No se documentan en la informacion disponible si hubo RLHF, DPO u otras tecnicas de alineamiento, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion controlada de errores tipograficos: dado un texto limpio en ingles, devuelve el mismo texto con entre una y tres modificaciones a nivel de palabra.
- Transformacion texto a texto manteniendo la estructura y la mayor parte del contenido original.
- Modo conversacional: el modelo se invoca con el texto limpio como mensaje de usuario y responde con la version alterada.
- Parametro de temperatura recomendado de 0,9, que favorece variabilidad en los errores introducidos entre ejecuciones.
- Compatible con Ollama y con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No consta soporte de tool calling ni de function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta capacidad multilingue: solo se declara ingles.
- No consta capacidad de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion de correctores ortograficos: se parte de un corpus limpio, se generan versiones con erratas y se mide la tasa de deteccion y correccion de la herramienta evaluada sobre pares limpio-sucio reproducibles.
- Aumento de datos para entrenamiento robusto: generar variantes con ruido a partir de un dataset de texto correcto para que modelos de clasificacion o de traduccion aprendan a tolerar faltas de ortografia.
- Pruebas de robustez en recuperacion de informacion: introducir errores en las consultas de un indice de busqueda para medir la degradacion de recall y precision de un motor tolerante a erratas.
- Validacion de pipelines de normalizacion previa: comprobar que un sistema de limpieza de texto recupera correctamente la forma original a partir de la salida del modelo.
- Pruebas de interfaz y experiencia de usuario: generar entradas con erratas realistas para verificar que los formularios, validaciones y mensajes de error se comportan de forma adecuada.
- Generacion de distractores en tareas de correccion: producir opciones incorrectas plausibles en ejercicios o evaluaciones automaticas de deteccion de fallos.
- Post-procesado de OCR y ASR: simular errores de reconocimiento a nivel de palabra para comparar estrategias de correccion sin necesidad de capturar datos reales.
- Pruebas de robustez en moderacion y filtrado: verificar que un clasificador de contenido sigue funcionando cuando el texto de entrada contiene erratas introducidas de forma artificial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento documentado es la puerta de evaluacion interna del autor para las cuantizaciones, basada en la tasa de ediciones de 1 a 3 palabras sobre un conjunto de 40 textos:

| Cuantizacion | Metrica (ediciones de 1-3 palabras) | Umbral | Resultado |
|---|---|---|---|
| Q8_0 | no disponible (por encima del umbral) | 0,70 | aceptada |
| Q4_K_M | 0,60 | 0,70 | rechazada |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB con la cuantizacion Q8_0; el repositorio ocupa 0,7 GB.
- Cabe en cualquier GPU de consumo con 2 GB o mas de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores.
- Tambien puede ejecutarse en CPU mediante llama.cpp u Ollama, dado el reducido tamano del modelo.
- Opciones de despliegue: Ollama (`ollama run hf.co/Avicennasis/incorrecter-GGUF:Q8_0`), llama.cpp y cualquier runtime compatible con GGUF; el modelo esta etiquetado como compatible con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de generacion de erratas tipograficas con los que establecer una comparacion de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo solo esta declarado para ingles; su comportamiento con textos en otros idiomas no esta documentado.
- La tarea es intrinsecamente destructiva: la salida nunca debe utilizarse como texto final, sino como material de prueba o de aumento de datos.
- Existe riesgo de que las modificaciones alteren el significado, no solo la ortografia, dado que se opera a nivel de palabra.
- Al ser un modelo pequeno y con temperatura recomendada de 0,9, la salida es estocastica y puede variar entre ejecuciones para la misma entrada.
- No se documentan sesgos especificos, pero al no conocerse la composicion del dataset de entrenamiento no puede descartarse la transferencia de sesgos presentes en el corpus original.
- Riesgo de alucinacion en el sentido de que el modelo puede reescribir fragmentos mas alla de la simple sustitucion de palabras, aunque su proposito declarado sea introducir de una a tres erratas.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion correspondiente.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad sobre el comportamiento real del modelo.
- Las fechas de creacion y actualizacion registradas (2026-10-04) figuran en la informacion proporcionada; no se dispone de contexto adicional sobre las mismas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/incorrecter-GGUF
- Modelo base: https://huggingface.co/Avicennasis/incorrecter
- Paper, blog o repositorio adicional: no disponible
