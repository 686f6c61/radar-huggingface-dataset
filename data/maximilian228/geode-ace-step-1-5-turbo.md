# Maximilian228/Geode-ACE-Step-1.5-turbo

## Resumen

Geode-ACE-Step-1.5-turbo es un paquete de pesos derivado de ACE-Step 1.5, el modelo de generacion de musica texto-a-audio desarrollado por ACE Studio y StepFun, adaptado por el usuario Maximilian228 para Geode, una aplicacion Android que ejecuta modelos de forma local en el telefono. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original de ACE-Step 1.5 en su variante "turbo" (el DiT destilado para pocos pasos) a un formato propietario del motor de inferencia de Geode, con las matrices por paso cuantizadas a int8 y el resto de tensores mantenidos en 16 bits.

La relevancia del paquete es que permite ejecutar generacion musical texto-a-audio en hardware movil sin conexion a la nube, algo poco habitual dado el coste computacional tipico de los modelos de difusion para audio. El turbo DiT funciona en 8 pasos sin guidance, lo que reduce drasticamente el numero de evaluaciones del modelo respecto a la variante sft. El paquete pesa 1,71 GiB en su descarga base, con un extra opcional de 2,62 GiB para el modo de mayor precision, y requiere ademas el pack compartido `acestep-1.5/` (planificador, codificadores y decodificador de sonido) publicado en otro repositorio del mismo autor.

La licencia es MIT, heredada de ACE-Step 1.5, lo que permite uso comercial de las canciones generadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) turbo derivado de ACE-Step 1.5; el pack contiene solo el DiT, el resto (planificador, codificadores, decodificador de audio) va en el pack compartido `acestep-1.5/` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo texto-a-audio, no de contexto textual) |
| Tipos de cuantizacion | int8 por bloque (matrices por paso, `dit_turbo_r8.bin`) y bf16/fp16 (resto de tensores y variante `dit_turbo_f16.bin`) |
| Idiomas soportados | no disponible (las indicaciones de texto dependen del codificador de texto del pack compartido) |
| Licencia | MIT |
| Formato de pesos | `.bin` propietario del motor Geode (no safetensors ni GGUF), con manifiesto `geode.json` que incluye tamanos, SHA-256 y tensores |
| Tamano del pack | 1,71 GiB (base) + 2,62 GiB opcional (`dit_turbo_f16.bin`); repo total 4,7 GB |
| Pasos de muestreo | 8 pasos, shift 3, sin guidance |
| Modelo base | ACE-Step/Ace-Step1.5 |

## Arquitectura y entrenamiento

El paquete contiene exclusivamente el DiT de ACE-Step 1.5 en variante turbo: un diffusion transformer que opera sobre representaciones latentes de audio y que ha sido destilado para generar en muy pocos pasos (8, con shift 3 y sin classifier-free guidance). El autor no ha reentrenado el modelo: los valores de los pesos son los del checkpoint original de ACE-Step 1.5, reorganizados para el motor de Geode. La unica transformacion aplicada es la cuantizacion de las matrices por paso a int8 con escalas por bloque, generando tres copias del mismo conjunto de matrices para distintos backends: CPU con SDOT, NPU Hexagon con HMX y GPU (la opcion por defecto). El resto de tensores (normas, tablas de modulacion, embeddings temporales, convoluciones de patch y matrices por cancion) se mantiene en bf16.

El manifiesto `geode.json` describe los ficheros con sus tamanos y hashes SHA-256, la lista de tensores y la configuracion del sampler (8 pasos, shift 3, los schedules de la release y DCW). No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO; esos detalles corresponderian a la model card de ACE-Step 1.5, no incluida en la informacion proporcionada. La innovacion tecnica destacable es la propia destilacion turbo del DiT y el empaquetado multi-backend para ejecucion on-device.

## Capacidades

- Generacion de musica texto-a-audio: produce audio musical a partir de una descripcion textual, usando el DiT turbo en 8 pasos.
- Inferencia on-device en Android: disenado para ejecutarse en el telefono mediante la app Geode, sin depender de servidores.
- Ejecucion multi-backend: el mismo pack incluye copias de las matrices para CPU (SDOT), NPU Hexagon (HMX) y GPU.
- Modo de mayor precision: la variante opcional `dit_turbo_f16.bin` permite usar el ajuste "most exact diffusion (fp16)" de la app.
- Generacion rapida: el turbo DiT con 8 pasos sin guidance es, segun el autor, varias veces mas rapido que la variante sft.
- Uso comercial del audio generado: la licencia MIT lo permite explicitamente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; es un modelo exclusivamente texto-a-audio.

## Casos de uso

- Composicion musical en el movil sin conexion: un usuario puede describir un fragmento (estilo, instrumentacion, tempo) y generar la pista directamente en el telefono, util en entornos sin red o con conectividad limitada.
- Prototipado rapido de ideas musicales: con solo 8 pasos de muestreo, el ciclo de iteracion es corto, lo que permite probar varias descripciones y quedarse con la mejor sin esperas largas.
- Bandas sonoras para contenido corto: creadores de video que editan en el telefono pueden generar musica de fondo libre de dependencias de servicios en la nube y con derechos de uso comercial por la licencia MIT.
- Aplicaciones Android integradas: desarrolladores pueden empaquetar el pack en apps de creacion musical, ya que el formato `.bin` con manifiesto `geode.json` esta pensado para el motor Geode y no requiere infraestructura de servidor.
- Demos y educacion: el tamano base de 1,71 GiB y la ejecucion local facilitan talleres o demostraciones de generacion musical con IA en dispositivos de gama alta, sin coste de API.
- Investigacion sobre cuantizacion on-device: el pack ofrece tres copias de las mismas matrices (int8 para CPU/NPU/GPU y bf16) con hashes verificables, lo que permite comparar calidad y rendimiento entre backends en un mismo dispositivo.
- Generacion de variaciones de audio para juegos indie: estudios pequenos pueden generar fragmentos musicales en el dispositivo de desarrollo y usarlos comercialmente gracias a la licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que el turbo DiT con 8 pasos sin guidance es "varias veces mas rapido" que la variante sft, sin cifras concretas de latencia, throughput ni metricas de calidad de audio (FAD, CLAP score u otras).

## Requisitos de hardware

- VRAM/RAM estimada: el pack base ocupa 1,71 GiB en disco; en ejecucion hay que sumar el pack compartido `acestep-1.5/` (planificador, codificadores y decodificador de sonido), cuyo tamano no se detalla en la informacion disponible. El extra opcional `dit_turbo_f16.bin` anade 2,62 GiB.
- Hardware objetivo: telefonos Android con soporte para los backends del motor Geode (CPU con SDOT, NPU Hexagon HMX y GPU). No se especifican modelos de SoC concretos ni minimos de memoria.
- GPU de escritorio: no se documenta soporte para A100, H100, RTX 4090 ni otras GPU de servidor; el formato `.bin` y el manifiesto estan ligados al motor Geode.
- Opciones de despliegue: la app Geode para Android. No hay indicios de soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de texto ni usa formatos estandar.
- Latencia y throughput: no disponibles; solo la afirmacion cualitativa de que 8 pasos sin guidance es varias veces mas rapido que la variante sft.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Geode-ACE-Step-1.5-turbo | no disponible | no aplica (texto-a-audio) | MIT | `.bin` propietario (Geode) | DiT turbo on-device, 8 pasos |
| ACE-Step 1.5 (original) | no disponible | no disponible | MIT (segun el paquete derivado) | no disponible en la informacion | Modelo completo texto-a-audio, incluye variante sft y turbo |
| Geode-ACE-Step-1.5 (pack compartido del mismo autor) | no disponible | no aplica | MIT | `.bin` propietario (Geode) | Planificador, codificadores y decodificador de sonido para Geode |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada; la comparativa se limita a las variantes del propio ACE-Step 1.5 y al pack compartido del mismo autor.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el pack compartido `acestep-1.5/` (planificador, codificadores y decodificador de sonido) para funcionar; sin el, el DiT por si solo no genera audio.
- Formato propietario: los pesos usan `.bin` con manifiesto `geode.json`, ligados al motor de la app Geode; no son compatibles con safetensors, GGUF ni con herramientas estandar de inferencia.
- Solo Android/on-device: no hay soporte documentado para servidores, GPU de escritorio ni pipelines en la nube.
- Idiomas no especificados: no se indica que idiomas acepta el codificador de texto del pack compartido, lo que limita la evaluacion de su cobertura multilingue.
- Sin benchmarks: no hay metricas objetivas de calidad de audio ni comparaciones cuantitativas con la variante sft u otros modelos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo generativo de audio, la calidad y fidelidad a la descripcion textual pueden variar y no hay evaluacion publicada.
- Licencia MIT: permite uso comercial del audio generado, pero conviene revisar el fichero NOTICE del repositorio por si el modelo base anade condiciones adicionales.
- Dependencia de la app: la experiencia de uso y el rendimiento dependen de la implementacion del motor Geode y del hardware del telefono, no solo del pack de pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maximilian228/Geode-ACE-Step-1.5-turbo
- Pack compartido del mismo autor: https://huggingface.co/Maximilian228/Geode-ACE-Step-1.5
- Modelo base en Hugging Face: https://huggingface.co/ACE-Step
- Repositorio de ACE-Step 1.5 en GitHub: https://github.com/ace-step/ACE-Step-1.5
- Paper de referencia citado en la model card: arXiv 2602.00744
