# hanapasta/airvla_ftdki_5000

## Resumen

AirVLA FT-D-KI es un checkpoint de politica vision-language-action (VLA) para manipulacion aerea, publicado por el usuario hanapasta en Hugging Face. Se trata de un ajuste fino del modelo base `lerobot/pi0` orientado a un cuadricoptero equipado con un brazo de 2 grados de libertad y una pinza paralela, evaluado en simulacion con MuJoCo 3.3.4. El checkpoint corresponde al paso 5.000 de entrenamiento y forma parte de la campana experimental de un trabajo de fin de master (MSc) denominada AirVLA.

La variante FT-D-KI se describe como una version con "aislamiento de conocimiento": el backbone VLM permanece congelado durante el ajuste fino. Segun el autor, este diseno recupera precision de aproximacion y navegacion respecto a variantes anteriores, pero solo conserva parte del anclaje visual (grounding) de la variante FT-C, de la que se inicializa. El modelo tiene 4.028.019.472 parametros (~4,03 mil millones) y un repositorio de 8,9 GB en formato safetensors.

Es relevante ahora por dos motivos: por un lado, ilustra una linea de investigacion activa, la adaptacion de politicas VLA preentrenadas a plataformas roboticas no convencionales (drones con brazo); por otro, publica un protocolo de evaluacion reproducible con resultados negativos explicitos, algo poco habitual y util para la comunidad. No obstante, el rendimiento reportado es muy limitado (0 de 60 agarres exitosos) y el modelo no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA), derivada del modelo base `lerobot/pi0`; el backbone VLM se mantiene congelado durante el ajuste fino |
| Parametros totales | 4.028.019.472 (~4,03 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio se distribuye en safetensors (aproximadamente 8,9 GB, compatible con pesos en precision de 16 bits) |
| Idiomas soportados | no disponible (el modelo es una politica robotica; no se documenta soporte linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | `lerobot/pi0` |
| Datos de entrenamiento | `hanapasta/airvla_v22` (v2 + F1 + F2) |
| Inicializado desde | FT-C, con backbone VLM congelado |
| Pasos de entrenamiento | 5.000 |
| Criterio de seleccion de checkpoint | menor MSE de validacion con ruido fijado (pinned-noise) sobre la escalera de checkpoints guardados |
| Entorno de evaluacion | MuJoCo 3.3.4 |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El modelo es una politica vision-language-action basada en el modelo base `lerobot/pi0`. La model card no detalla la configuracion de capas, el tipo de atencion, la dimension del experto de acciones ni el esquema de flow matching u otro mecanismo de generacion de acciones, por lo que esos extremos quedan como no disponibles. La innovacion metodologica que si se documenta es el congelado del backbone VLM durante el ajuste fino: la variante "KI" (knowledge-insulated) impide que el entrenamiento modifique el conocimiento visual-linguistico preentrenado y solo actualiza las partes responsables de la politica de control. Segun el autor, este aislamiento recupera la precision de aproximacion y la capacidad de navegacion, a costa de conservar solo parte del anclaje visual que alcanzaba la variante FT-C.

El entrenamiento parte de FT-C (que ya era un ajuste sobre `lerobot/pi0`) y consume el conjunto `hanapasta/airvla_v22`, compuesto por las particiones v2, F1 y F2. Se ejecutaron 5.000 pasos y el checkpoint publicado se selecciono por el menor error cuadratico medio de validacion bajo un protocolo de ruido fijado, lo que busca comparabilidad entre checkpoints de la misma escalera. No se documentan en la informacion disponible el numero total de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u optimizacion por preferencias; tampoco se detalla el esquema de aumento de datos o la resolucion de las observaciones.

## Capacidades

- Generacion de acciones de control motor en un espacio continuo para un cuadricoptero con brazo de 2 grados de libertad y pinza paralela.
- Percepcion visual integrada con lenguaje (politica VLA): procesa observaciones visuales y consignas para producir comandos.
- Ejecucion de tareas de pick (recogida) y navegacion evaluadas en MuJoCo 3.3.4.
- Seleccion de objetivo correcto en tareas de recogida: 43 de 60 episodios con objetivo correcto en el protocolo congelado.
- Navegacion hasta la posicion objetivo: 12 de 20 episodios exitosos en el protocolo congelado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del bucle de control de la politica.
- No se documentan capacidades multilingues.
- No se documentan capacidades adicionales como modo de razonamiento explicito, audio o vision de alta resolucion.

## Casos de uso

- Investigacion en manipulacion aerea: el modelo sirve como punto de partida para estudiar como se comporta una politica VLA preentrenada en tierra cuando se transfiere a una plataforma aerea con brazo, un dominio con dinamica y contacto muy distintos.
- Reproduccion de resultados academicos: el autor publica el arnes de evaluacion `eval_v2.py` y una guia de reproduccion, de modo que otros grupos pueden verificar las cifras del protocolo congelado sobre MuJoCo 3.3.4.
- Estudio del congelado de backbone en ajuste fino: la variante KI permite comparar empiricamente el efecto de no actualizar el VLM frente a variantes que si lo entrenan (FT-C, FT-D), util en trabajos sobre olvido catastrofico en politicas robotica.
- Linea base negativa para benchmarking: con 0 de 60 agarres exitosos, el checkpoint funciona como referencia de "suelo" al evaluar tecnicas de agarre aereo, siempre que el escenario sea comparable.
- Analisis de precision de aproximacion: la metrica de 88,2 mm de mediana en episodios con objetivo correcto y sin agarre permite estudiar errores de posicionamiento fino independientemente del exito final de la tarea.
- Navegacion aerea asistida por VLM: los 12 de 20 episodios de navegacion exitosos son un punto de partida para estudiar politicas de desplazamiento guiadas por consigna, aunque el exito esta lejos de ser fiable.
- Docencia y formacion: al ser un ejemplo completo de campana experimental (dataset, checkpoints, arnes, registro de resultados) con licencia MIT, es material util para cursos de robotica aprendida y de sistemas VLA.
- Integracion en LeRobot: el modelo se enmarca en el ecosistema de `lerobot/pi0`, por lo que encaja en flujos de evaluacion y despliegue de esa libreria, no en servidores de inferencia de texto convencionales.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados corresponden al protocolo congelado del autor: n = 60 episodios de pick y n = 20 de navegacion sobre escenas emparejadas. No se han publicado resultados en la informacion disponible para benchmarks estandar de texto, codigo o razonamiento (MMLU, HumanEval, GSM8K u otros), algo esperable dado que se trata de una politica robotica y no de un modelo de lenguaje de proposito general.

| Metrica (protocolo congelado) | Resultado |
|---|---|
| Agarre exitoso (pick) | 0 / 60 |
| Objetivo correcto (pick) | 43 / 60 |
| Mediana de error de posicion en todos los intentos | 117,8 mm |
| Mediana de error de posicion en episodios con objetivo correcto (target-true) | 88,2 mm |
| Navegacion exitosa | 12 / 20 |

El autor describe los 88,2 mm como la mejor precision de politica pura registrada en el momento de la publicacion dentro de su campana. No se proporcionan comparaciones con otros modelos externos ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 8-9 GB solo para pesos (4,03 mil millones de parametros) y aproximadamente 12-16 GB contando activaciones, codificador visual y buffers de la politica.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB de pesos, con unos 8-10 GB de pico durante la evaluacion.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2-3 GB de pesos, con unos 6-8 GB de pico. No se documentan cuantizaciones oficiales publicadas en el repositorio.
- GPU recomendadas: A100 o H100 para evaluacion por lotes y entrenamiento; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia y ajuste fino ligero.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 16-24 GB de VRAM en 16 bits y con holgura en 8 bits; en tarjetas de 8-12 GB seria necesario recurrir a cuantizacion agresiva o a resoluciones de observacion reducidas.
- Opciones de despliegue: el modelo se evalua con el arnes `eval_v2.py` del repositorio del autor sobre MuJoCo 3.3.4; al ser una politica VLA con salida de acciones continuas, no aplican servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama, que estan orientados a modelos generativos de lenguaje.
- Latencia y throughput: no disponibles. El modelo debe ejecutarse a frecuencia de control en un bucle de simulacion, pero la informacion proporcionada no incluye mediciones de latencia por paso.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las variantes de la misma campana experimental y con el modelo base. No se aportan datos de terceros.

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirVLA FT-D-KI (este) | 4.028.019.472 | no disponible | 0/60 agarres; 43/60 objetivo correcto; 117,8 mm mediana (88,2 mm target-true); 12/20 navegacion | MIT | Hugging Face |
| FT-C (inicializacion del ajuste) | no disponible | no disponible | Mayor anclaje visual (grounding) que FT-D-KI, segun el autor, pero menor precision de aproximacion y navegacion | no disponible | no disponible |
| FT-D (variante relacionada, sin aislamiento) | no disponible | no disponible | no disponible | no disponible | no disponible |
| `lerobot/pi0` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face (referenciado como base) |

## Limitaciones y advertencias

- Rendimiento de agarre nulo en la evaluacion publicada: 0 de 60 episodios de pick terminaron con agarre exitoso. El propio autor lo refleja sin matices.
- Grounding incompleto: 17 de 60 episodios seleccionaron un objetivo incorrecto, lo que indica errores de interpretacion visual-linguistica en una fraccion relevante de los casos.
- Alta sensibilidad al simulador: el autor advierte que una version distinta de MuJoCo 3.3.4 cambia el comportamiento de contacto lo suficiente como para invalidar la comparacion con los resultados archivados. Cualquier cifra reproducida en otro simulador no es comparable directamente.
- Ausencia de validacion en hardware real: la evaluacion se realizo integramente en simulacion. No hay evidencia de transferencia a un cuadricoptero fisico, ni datos de seguridad de vuelo, consumo energetico o robustez a perturbaciones (viento, iluminacion, oclusiones).
- Resultados no revisados por pares: se trata del trabajo de fin de master de un autor individual, sin publicacion cientifica asociada en la informacion disponible.
- Adopcion practicamente nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya reportado reproducciones independientes.
- Riesgo de alucinacion y de deriva de politica: al integrar un componente de lenguaje y vision, el modelo puede producir selecciones de objetivo incorrectas o aproximaciones fallidas sin que exista un mecanismo de verificacion documentado.
- Limitaciones de idioma y contexto: no se documentan idiomas soportados ni longitud de contexto, por lo que no es posible evaluar su comportamiento con consignas largas o en idiomas distintos del usado en el entrenamiento.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Al derivar de `lerobot/pi0`, conviene verificar las condiciones de la licencia del modelo base antes de un uso comercial.
- No apto para produccion: el propio contexto (campana de tesis, resultados negativos, sensibilidad al simulador) desaconseja su despliegue en sistemas reales sin una reevaluacion exhaustiva.
- Ausencia de informacion sobre sesgos, composicion del dataset y datos personales en las observaciones, lo que impide auditar el comportamiento del modelo fuera de las escenas evaluadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanapasta/airvla_ftdki_5000
- Modelo base: https://huggingface.co/lerobot/pi0
- Repositorio de codigo, guia de reproduccion y registro experimental completo: https://github.com/robotics-hana/drone-version2
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre la campana AirVLA; los unicos resultados obtenidos correspondian a dominios ajenos al tema.
