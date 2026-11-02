# phbg/phbg

## Resumen

El repositorio `phbg/phbg` no contiene un modelo de inteligencia artificial, sino un README de perfil de Hugging Face. El autor, Pedro Belota, lo publica con la etiqueta `profile-readme`, que la plataforma emplea para renderizar la pagina de presentacion de su cuenta. Por tanto, no hay pesos, configuracion de arquitectura ni tokenizador asociados: es un artefacto de documentacion personal, no un checkpoint entrenado.

El contenido describe la trayectoria de su autor: estudiante de Ciencias de la Computacion en la Universidade Federal do Amazonas (UFAM), investigador de iniciacion cientifica en el PIBIC/UFAM con un proyecto de IA neuro-simbolica aplicada al analisis de emociones en voz, y desarrollador con experiencia en automatizacion de pruebas en el INDT y en el programa DevTITANS de Android embebido, AOSP y dispositivos IoT.

Su relevancia es, por tanto, documental y de descubrimiento: sirve como indice de los artefactos publicados por el autor en Hugging Face (un dataset de notificaciones sinteticas en portugues, un adaptador QLoRA experimental sobre Gemma 3 1B y un esquema sintetico de emociones), no como una pieza reutilizable en pipelines de inferencia. Cualquier intento de cargarlo con `transformers`, `vLLM` o `llama.cpp` fallara porque no existe un modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el README esta redactado en portugues) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el unico contenido es un README de perfil) |

## Arquitectura y entrenamiento

No aplica. El repositorio `phbg/phbg` es un README de perfil de Hugging Face, un mecanismo de la plataforma para mostrar una pagina de presentacion en la cuenta del usuario. No contiene codigo de definicion de modelo, ficheros de pesos, configuracion de entrenamiento ni datos de preentrenamiento o ajuste fino.

El autor si documenta en su perfil otros artefactos con metodologia y procedencia: un dataset sintetico de 3.707 ejemplos para sumarizacion de notificaciones en portugues, un adaptador QLoRA experimental sobre Gemma 3 1B (entrenamiento completado, calidad no validada de forma independiente) y un esquema sintetico para el proyecto PIBIC de analisis de emociones. Estos artefactos son los que podrian tener interes tecnico, no el README en si.

## Capacidades

- No es un modelo: no genera texto, no razona, no ejecuta codigo ni procesa imagenes o audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues mas alla del texto estatico del README, redactado en portugues.
- Su unica funcion es servir como pagina de presentacion del autor en Hugging Face e indice de enlaces a sus datasets, adaptadores y colecciones.

## Casos de uso

- Descubrimiento de artefactos del autor: consultar el README para localizar el dataset `phbg/smart-notifications-synthetic`, el adaptador `phbg/gemma-3-1b-smart-notifications-qlora-pilot` y el esquema `phbg/coach-emotion-synthetic-schema`, con enlaces directos a cada uno.
- Evaluacion de procedencia en experimentos de terceros: el README explicita que el autor distingue sus propios datos y experimentos de los checkpoints de terceros, lo que ayuda a auditar el origen de los artefactos de su coleccion DevTITANS y PIBIC.
- Referencia para iniciativas de documentacion responsable: los model cards y dataset cards del autor registran metodo, origen de datos, resultados y limitaciones, y el README puede citarse como ejemplo de buenas practicas de trazabilidad en publicaciones de Hugging Face.
- Localizacion de contactos profesionales: incluye enlaces al GitHub (`github.com/pedrobelota`) y al LinkedIn del autor, utiles para colaboraciones academicas o reclutamiento tecnico.
- Seguimiento de lineas de investigacion: el README identifica el proyecto PIBIC/UFAM de IA neuro-simbolica para analisis de emociones en voz y el programa DevTITANS de Android embebido, lo que permite rastrear publicaciones futuras en esas areas.
- Punto de entrada a la coleccion curada: enlaza a la coleccion `phbg/devtitans-and-pibic-ai-engineering`, que agrupa los artefactos y modelos de referencia del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que no existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay pesos que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; ninguno de estos motores puede cargar un README de perfil.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA. El unico elemento comparable seria con otros README de perfil de Hugging Face, que son artefactos de documentacion sin parametros, contexto ni licencia de modelo. Se indica "no disponible" por ausencia de una categoria tecnica equivalente.

| Alternativa | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `phbg/phbg` | no aplica | no aplica | no disponible | README de perfil |
| README de perfil de otro usuario | no aplica | no aplica | no disponible | Mismo tipo de artefacto |
| Adaptador `phbg/gemma-3-1b-smart-notifications-qlora-pilot` | sobre Gemma 3 1B | no disponible | no disponible | Si es un artefacto entrenado, aunque de calidad no validada |

## Limitaciones y advertencias

- No es un modelo utilizable: cualquier intento de cargarlo con `transformers`, `vLLM`, `llama.cpp`, `Ollama` o `TGI` fallara.
- La etiqueta `profile-readme` confirma su naturaleza de pagina de presentacion, no de checkpoint.
- No se declara licencia, por lo que no puede asumirse permiso de reutilizacion del texto mas alla de lo que permita la plataforma.
- El contenido esta en portugues y describe la actividad de una persona concreta; no debe interpretarse como documentacion tecnica de un sistema.
- Los artefactos enlazados (adaptador QLoRA, datasets sinteticos) tienen sus propias limitaciones, entre ellas que el adaptador no ha sido validado de forma independiente segun el propio autor.
- Riesgo de confusion: un lector que llegue al repositorio por el nombre `phbg/phbg` podria esperar un modelo y encontrar solo un perfil; conviene verificar el tipo de artefacto antes de integrarlo en cualquier pipeline.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/phbg/phbg
- Dataset Smart Notifications Synthetic: https://huggingface.co/datasets/phbg/smart-notifications-synthetic
- Adaptador Gemma 3 1B Smart Notifications QLoRA Pilot: https://huggingface.co/phbg/gemma-3-1b-smart-notifications-qlora-pilot
- Dataset Coach Emotion Synthetic Schema: https://huggingface.co/datasets/phbg/coach-emotion-synthetic-schema
- Coleccion DevTITANS y PIBIC AI Engineering: https://huggingface.co/collections/phbg/devtitans-and-pibic-ai-engineering-6ae553217b5be2d991b7e904
- GitHub del autor: https://github.com/pedrobelota
- LinkedIn del autor: https://www.linkedin.com/in/pedro-belota-6641aa2ab/
