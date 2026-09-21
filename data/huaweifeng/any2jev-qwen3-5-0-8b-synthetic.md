# huaweifeng/any2jev-qwen3.5-0.8b-synthetic

## Resumen

any2jev-qwen3.5-0.8b-synthetic es un adaptador LoRA publicado por el usuario huaweifeng que convierte el modelo base Qwen/Qwen3.5-0.8B en un modelo de decision de estilo Jev ("System One"). No es un modelo generativo: recibe un estado (state) y un conjunto de opciones tipadas y devuelve, en una sola pasada forward, una respuesta tipada Choice (elegir entre opciones), Score (puntuar) o Noul (si/no) acompanada de probabilidades calibradas. El modelo se ha construido con la herramienta any2jev, cuyo repositorio publico es github.com/hwfengcs/any2jev.

El repositorio contiene un adaptador LoRA de rango 8 entrenado sobre el backbone con la cabeza de vocabulario eliminada, una cabeza de puntero ("pointer head") de dimension 256 que puntua cada opcion contra el token de decision, el tokenizer del modelo base y los ficheros de configuracion y metricas. El pipeline declarado en HuggingFace es text-classification y la licencia es Apache-2.0. El propio autor advierte que este checkpoint demuestra la receta de conversion sobre este backbone y que no es un modelo de decision de proposito general.

Su relevancia actual es metodologica: ejemplifica un patron de "modelo de decision" que sustituye la generacion de texto libre por una interfaz tipada y calibrada (Choice / Score / Noul) orientada a enrutado, triaje y control en pipelines de agentes, con un coste de entrenamiento muy bajo (5,9 M de parametros entrenables, 26 minutos en una GPU de consumo). El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el tamano del repositorio aparece como 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=8) sobre Qwen/Qwen3.5-0.8B, con cabeza de vocabulario eliminada y cabeza de decision ("pointer head") de dimension 256 para puntuar opciones contra el token de decision |
| Parametros totales | No disponible (el modelo base es Qwen/Qwen3.5-0.8B; el identificador sugiere del orden de 0,8 mil millones, dato no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables | 5,9 M (adaptador LoRA) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos safetensors en precision de entrenamiento; no se listan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter/ con el adaptador LoRA y head.safetensors con la cabeza de puntero); incluye any2jev.json, tokenizer/, train_report.json y eval.json |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline declarado | text-classification |
| Libreria | any2jev |
| Modo de operacion | rows; temperatura 0,182 ajustada en validacion |
| Salidas | Tipadas: Choice, Score y Noul (si/no), con probabilidades calibradas; no genera texto |
| Region declarada | us |

## Arquitectura y entrenamiento

La arquitectura parte del backbone Qwen/Qwen3.5-0.8B, al que se le anade un adaptador LoRA de rango 8 y se le retira la cabeza de vocabulario durante el entrenamiento. La decision no se produce autogenerando tokens: el sistema incorpora una cabeza de puntero de dimension 256 que puntua cada opcion propuesta contra el token de decision, de modo que una unica pasada forward devuelve la opcion elegida o la puntuacion junto con su probabilidad. La configuracion de delimitadores y el modo (rows) se almacenan en any2jev.json, junto con una temperatura de 0,182 ajustada sobre el conjunto de validacion.

El entrenamiento se realizo sobre datos sinteticos (data/synthetic/train.jsonl) generados con el generador de tickets de soporte de any2jev (`any2jev data synthetic`), con 5,9 M de parametros entrenables, 1,0 epocas, learning rate 0,0002 y batch 2 x 4. El tiempo de pared reportado es de 26 minutos en una unica GPU de consumo. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ni el numero de tokens de entrenamiento, ni la composicion detallada del dataset mas alla de su origen sintetico en unos pocos miles de decisiones etiquetadas.

## Capacidades

- Clasificacion de decision tipada: responde con Choice (seleccion entre varias opciones), Score (puntuacion) o Noul (si/no) en una sola pasada forward.
- Probabilidades calibradas: las metricas de validacion (ECE 0,003 global) indican calibracion sobre el reparto de validacion, no una garantia por respuesta.
- Enrutado de opciones multiples: la llamada de ejemplo permite pasar un conjunto de opciones separadas por comas ("billing, technical, sales") y obtener la etiqueta elegida.
- Decisiones binarias de urgencia: soporta la consulta Noul con una pregunta de si/no ("Is this urgent?").
- Despliegue como servicio: `any2jev serve` expone un endpoint POST /v1/systemone compatible con un SDK de tipos (TypeSafe SDK compatible).
- Uso por linea de comandos: `any2jev ask` permite consultar el modelo pasando el estado y las opciones.
- Sin generacion de texto: no produce respuestas en lenguaje natural, solo etiquetas, puntuaciones y probabilidades.
- Tool calling, function calling, agentes multi-paso y razonamiento extendido: no documentados en la informacion disponible.
- Capacidades multilingues, de vision, audio o modo thinking: no documentadas en la informacion disponible.

## Casos de uso

- Enrutado de tickets de soporte: a partir de un estado textual ("My payouts have failed 3 days in a row, fix this ASAP") y un conjunto de equipos candidatos, el modelo devuelve el equipo al que asignar el caso en una sola inferencia, sin coste de generacion de texto.
- Triaje de urgencia: usando la consulta Noul, el modelo decide si un caso debe escalarse de inmediato, lo que permite insertar una compuerta de prioridad antes de la cola humana.
- Clasificacion de intenciones en asistentes conversacionales: el modelo etiqueta la intencion del usuario entre un conjunto cerrado de opciones, sustituyendo clasificadores entrenados a medida por una receta reutilizable.
- Puntuacion de candidatos en re-ranking: la salida Score permite ordenar respuestas generadas por otro modelo y quedarse con la mejor, manteniendo el LLM generativo separado del componente de decision.
- Compuertas de seguridad y moderacion: decision binaria (Noul) sobre si un contenido cumple una politica, con probabilidad asociada para fijar umbrales operativos.
- Guardarrailes en pipelines de agentes: decidir si una accion propuesta por un agente debe ejecutarse o requerir aprobacion, en una unica pasada y con latencia predecible.
- Validacion de formularios y datos estructurados: decidir entre categorias predefinidas (tipo de incidencia, severidad, departamento) en un flujo de ingesta.
- Experimentacion y destilacion de criterio: al ser un adaptador de 5,9 M de parametros entrenable en 26 minutos en una GPU de consumo, sirve como banco de pruebas para convertir otros backbones al formato de decision de any2jev.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica unicamente la evaluacion sobre el conjunto reservado (held-out) del propio modelo, que se reproduce a continuacion tal cual:

| Grupo | n | Exactitud | NLL | Brier | ECE | AURC |
|---|---|---|---|---|---|---|
| Global | 594 | 0,997 | 0,117 | 0,006 | 0,003 | 0,002 |
| Noul | 150 | 1,000 | -0,000 | 0,000 | 0,000 | 0,000 |
| Choice | 291 | 0,993 | 0,239 | 0,013 | 0,007 | 0,004 |
| Score | 153 | 1,000 | -0,000 | 0,000 | 0,000 | 0,000 |

Estos valores corresponden a un reparto de validacion generado de forma sintetica y a un numero reducido de ejemplos (594 en total), por lo que no deben extrapolarse a datos reales ni a dominios distintos de los vistos en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un backbone del orden de 0,8 mil millones de parametros mas un adaptador LoRA de 5,9 M de parametros y una cabeza de 256 dimensiones, las necesidades de pesos son reducidas. Estimacion orientativa (no publicada por el autor): en fp16 alrededor de 1,6-2 GB de pesos, en int8 alrededor de 0,8-1 GB y en int4 alrededor de 0,4-0,6 GB, mas el coste de activaciones y cache de atencion.
- GPU recomendadas: el autor indica que el entrenamiento completo se hizo en una unica GPU de consumo en 26 minutos. Para inferencia, cualquier GPU de consumo con suficiente memoria para el modelo base deberia bastar (gama GTX 16xx, RTX 30xx, RTX 40xx); A100, H100 o similares solo se justificarian para lotes muy grandes o despliegues con muchos servicios en paralelo. No se aportan mediciones de latencia por GPU.
- Cabe en GPU de consumo: si, segun la propia model card, que cita una unica GPU de consumo tanto para entrenamiento como para el flujo de trabajo descrito. La VRAM concreta no esta especificada.
- Opciones de despliegue: el autor documenta `pip install "any2jev[serve]"` y `any2jev serve hf://huaweifeng/any2jev-qwen3.5-0.8b-synthetic`, que expone POST /v1/systemone y declara compatibilidad con un SDK de tipos. Tambien documenta el uso por CLI con `any2jev ask`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput estimados: no disponibles. El modelo se resuelve en una unica pasada forward y no decodifica texto, pero no se publican numeros de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican otros modelos de la misma categoria (modelos de decision "System One" con salidas tipadas Choice / Score / Noul y probabilidades calibradas) con los que establecer una comparacion directa. Las unicas referencias disponibles son el propio ecosistema any2jev y el modelo base:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| any2jev-qwen3.5-0.8b-synthetic | Adaptador de decision (LoRA + cabeza de puntero) | 5,9 M entrenables sobre Qwen/Qwen3.5-0.8B | No disponible | Apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3.5-0.8B | Modelo generativo base | Del orden de 0,8 B (no confirmado) | No disponible | No disponible | HuggingFace |
| Otros adaptadores any2jev | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance restringido por diseno: el propio autor indica que el checkpoint "demuestra la receta de conversion sobre este backbone" y que "no es un modelo de decision de proposito general".
- Rendimiento fuera de distribucion: el entrenamiento uso unos pocos miles de decisiones etiquetadas de un numero reducido de fuentes; se espera la precision publicada en entradas similares y una precision menor fuera de esa distribucion.
- Origen sintetico de los datos: el conjunto de entrenamiento se genero con el generador de tickets de soporte de any2jev, lo que limita la variedad linguistica y de dominio y puede introducir sesgos propios del generador.
- Calibracion no garantizada por respuesta: las probabilidades estan calibradas sobre el reparto de validacion (temperatura 0,182 ajustada en validacion), no son una garantia individual para cada prediccion. El ECE de 0,003 global conviene interpretarlo con cautela dado el tamano reducido del conjunto (n=594).
- Riesgo de alucinacion: el modelo no genera texto libre, por lo que no puede alucinar texto, pero si puede asignar alta confianza a una etiqueta incorrecta en entradas alejadas de la distribucion de entrenamiento.
- Aritmetica, fechas y conteo: la documentacion de Jev recomienda mantener estos calculos en codigo; el modelo no es fiable para ellos.
- Idiomas soportados: no declarados. No puede asumirse cobertura multilingue, y la model card esta redactada en ingles.
- Dependencia del modelo base: requiere descargar y cargar Qwen/Qwen3.5-0.8B ademas del adaptador, y no funcionara de forma aislada.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-0.8B, cuya licencia no se detalla en la informacion disponible.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni resultados en benchmarks publicos.
- Aviso de afiliacion: proyecto independiente, no afiliado a TypeSafe AI, segun declara el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huaweifeng/any2jev-qwen3.5-0.8b-synthetic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de any2jev: https://github.com/hwfengcs/any2jev
- Documentacion de Jev citada por el autor: no disponible como enlace directo en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponible; la busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de ayuda de YouTube TV, sin relacion con este proyecto)
