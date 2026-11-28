# millrace-ai/qwen-it-run-doom

## Resumen

qwen-it-run-doom es un artefacto de investigación publicado por millrace-ai que explora las capacidades de cómputo de un checkpoint Bonsai 2 4B dentro del runtime Prism. El modelo se emplea para ejecutar los tics de juego de DOOM y renderizar fotogramas indexados de 80×50 píxeles usando los recursos de Freedoom, comparando el estado del juego y la salida con el emulador de referencia PrBoom+. No se trata de un modelo conversacional al uso, sino de una prueba de concepto sobre hasta qué punto un modelo de lenguaje ternario de 4B parámetros puede sostener lógica de juego determinista.

El proyecto parte del checkpoint ternario `prism-ml/Ternary-Bonsai-2-4B-gguf` y lo adapta mediante fine-tuning para tareas de gameplay. La model card distingue entre resultados verificados (gameplay preparado, navegación en vivo y giros guiados por visión) y trabajo pendiente (pesos de gameplay modificados y un paquete portátil en vivo). El estado declarado es explícitamente de investigación, con rutas y menús de acción acotados, y la divergencia de rutas dependiente de objetivos y el combate autónomo siguen en investigación.

La relevancia actual del proyecto es doble: por un lado, documenta con evidencias reproducibles (receipts en JSON) el comportamiento de un modelo ternario pequeño en un dominio de cómputo secuencial estricto; por otro, muestra una arquitectura híbrida en la que el host calcula geometría y genera descriptores de dibujo mientras el modelo realiza el muestreo indexado. La información pública disponible es escasa en cuanto a especificaciones formales del modelo (licencia, idiomas, parámetros exactos), por lo que esta ficha marca esos campos como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ternario Bonsai 2 4B; runtime Prism, fork de llama.cpp) |
| Parametros totales | no disponible (el nombre del modelo base indica 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria (según el modelo base `Ternary-Bonsai-2-4B-gguf`); formatos adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del checkpoint base más allá de su naturaleza ternaria y su empaquetado en GGUF para el runtime Prism (un fork de llama.cpp mantenido por PrismML-Eng). El modelo se presenta como un fine-tuning del checkpoint `prism-ml/Ternary-Bonsai-2-4B-gguf`, orientado a ejecutar tics de DOOM y producir fotogramas indexados. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable no está en el entrenamiento sino en el reparto de cómputo: el host calcula la geometría BSP, la proyección de paredes y la planificación de dibujo, genera descriptores de draw y ejecuta algunas callbacks de gameplay desde el código fuente, mientras que el modelo realiza el muestreo indexado de los fotogramas. En el experimento de visión, un checkpoint Bonsai 2 4B con capacidades visuales lee la última imagen aceptada y un checkpoint modificado separado ejecuta el gameplay, con una consola independiente que verifica los turnos y admite un único comando cada vez.

## Capacidades

- Ejecución de tics de juego de DOOM sobre el runtime Prism, con estado de juego tipado y comparación contra PrBoom+.
- Renderizado de fotogramas indexados de 80×50 píxeles empleando recursos de Freedoom.
- Gameplay preparado: se verificaron 149 displays consecutivos del E1M4 (del 1024 al 1172), cubriendo una puerta, un ascensor, recogidas de objetos y un combate contra un imp, con coincidencia pixel a pixel de las secuencias de escritura.
- Navegación en vivo: las transiciones Forward → Turn y Backward → Turn avanzaron desde el mismo display aceptado 1020, conservando el estado del primer movimiento en el giro y coincidiendo en estado tipado, orden de thinker y RNG, y framebuffer completo.
- Giros guiados por visión: un checkpoint visual lee la imagen aceptada más reciente y otro checkpoint modificado ejecuta el gameplay; se verificaron tres turnos a través de una secuencia de puertas.
- Menús de acción acotados: en el experimento de 20 turnos se ofrecieron dos opciones preparadas por turno y se comparó con una repetición fresca de PrBoom+ hasta el display 1134.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, modo thinking, audio ni otras funciones conversacionales.

## Casos de uso

- Investigación sobre cómputo determinista en modelos ternarios: el proyecto permite evaluar si un modelo de 4B parámetros puede reproducir la lógica de un motor de juego clásico, comparando cada fotograma y cada secuencia de escritura por píxel contra PrBoom+.
- Validación de runtimes de inferencia: sirve como banco de pruebas para el runtime Prism (fork de llama.cpp) en escenarios de latencia y fidelidad estricta, con receipts en JSON que documentan cada ejecución.
- Estudio de arquitecturas híbridas host-modelo: el reparto entre geometría calculada en el host y muestreo indexado en el modelo es un caso concreto para investigar qué partes de un pipeline conviene delegar al modelo y cuáles al código determinista.
- Experimentos de percepción visual aplicada a control: el flujo de visión que lee la imagen aceptada y decide el siguiente comando acotado es un ejemplo de bucle percepción-acción con verificación externa.
- Reproducibilidad de resultados en investigación: los enlaces a evidencias (rutas E1M4, navegación, visión) permiten a otros grupos replicar las condiciones exactas de hardware (GTX 1080, Prism b12128) y comparar.
- Docencia y divulgación técnica: el proyecto ilustra de forma tangible las limitaciones y posibilidades de los modelos ternarios pequeños en tareas de cómputo secuencial, con métricas de tiempo concretas (hasta 82,45 segundos por display en gameplay preparado; 121–218 segundos por turno en el experimento de visión).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Los únicos datos de rendimiento son operativos y se refieren a las ejecuciones del proyecto:

| Métrica operativa | Valor |
|---|---|
| Displays consecutivos verificados (E1M4, gameplay preparado) | 149 (del 1024 al 1172) |
| Posiciones máximas usadas en la ruta preparada | hasta 5.948 |
| Tiempo máximo de liberación de comando a publicación indexada (ruta preparada) | hasta 82,45 segundos |
| Turnos verificados en el experimento de visión | 3 (secuencia de puertas) y 20 (menú acotado) |
| Tiempo por turno en el experimento de visión | 121–218 segundos (incluye decisión visual) |
| Display alcanzado en el experimento de 20 turnos | 1134 |
| Hardware de referencia | GTX 1080, Prism b12128 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 4B parámetros en formato ternario GGUF, lo que sugiere requisitos moderados, pero no se publican cifras.
- GPU recomendadas: la única GPU documentada en las evidencias es una GTX 1080, con la que se completaron las ejecuciones verificadas.
- Compatibilidad con GPU de consumo: sí, según la evidencia disponible (GTX 1080); no se detallan otras tarjetas.
- Opciones de despliegue: runtime Prism (fork de llama.cpp de PrismML-Eng), build b12128 fijada en los experimentos. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: en gameplay preparado, hasta 82,45 segundos desde la liberación del comando hasta la publicación indexada; en el experimento de visión, 121–218 segundos por turno desde el inicio de la preparación de menú hasta la publicación indexada, incluida la decisión visual.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones formales suficientes para establecer una comparativa rigurosa con otros modelos. La única referencia directa es el checkpoint base del que deriva:

| Modelo | Parámetros | Contexto | Formato | Licencia | Relación |
|---|---|---|---|---|---|
| millrace-ai/qwen-it-run-doom | no disponible (base 4B) | no disponible | GGUF | no disponible | Fine-tuning para gameplay de DOOM |
| prism-ml/Ternary-Bonsai-2-4B-gguf | 4B (según nombre) | no disponible | GGUF | no disponible | Modelo base |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado de investigación: la model card declara explícitamente que los pesos de gameplay modificados y el paquete portátil en vivo están pendientes; los resultados cubren gameplay preparado y menús de acción acotados.
- Alcance limitado: la divergencia de rutas dependiente de objetivos y el combate autónomo siguen en investigación; no hay evidencia de autonomía general.
- Dependencia de hardware y runtime: los resultados están ligados a una build concreta de Prism (b12128) y a una GTX 1080; no se documenta comportamiento en otras configuraciones.
- Dependencia de código del host: parte del cómputo (geometría BSP, proyección de paredes, planificación de dibujo y algunas callbacks de gameplay) se ejecuta desde el código fuente del host, no en el modelo.
- Licencia no disponible: no se especifica la licencia, por lo que no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no se documentan capacidades multilingües ni de lenguaje natural.
- Sin datos de sesgos ni de alucinación: al no ser un modelo conversacional y carecer de benchmarks publicados, no hay información sobre sesgos conocidos ni tasas de alucinación.
- Ausencia de benchmarks estándar: no se han publicado resultados en MMLU, HumanEval, GSM8K u otras pruebas convencionales, lo que impide comparar su calidad general frente a otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwen-it-run-doom
- Modelo base (Upstream Bonsai 2 4B): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Repositorio GitHub del proyecto: https://github.com/tim-osterhus/qwen-it-run-doom
- Runtime Prism: https://github.com/PrismML-Eng/llama.cpp
- Evidencias de hardware, ruta E1M4: https://github.com/tim-osterhus/qwen-it-run-doom/blob/main/evidence/stock-hardware/e1m4-route-opening.json
- Evidencias de navegación E1M4: https://github.com/tim-osterhus/qwen-it-run-doom/blob/main/evidence/stock-hardware/e1m4-navigation.json
- Sección de visión del proyecto: https://github.com/tim-osterhus/qwen-it-run-doom#bonsai-vision
