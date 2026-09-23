# Ehraim/mixture-of-tiny-sliding-experts

## Resumen

Mixture of Tiny Sliding Experts es un sistema de orquestación publicado por el usuario Ehraim en Hugging Face (ID `Ehraim/mixture-of-tiny-sliding-experts`), no un modelo monolítico. Su planteamiento es cargar un único checkpoint público congelado a la vez en una GPU de 24 GB y decidir cuál cargar mediante un router basado en hashing de palabras: la petición se convierte en una bolsa de identificadores de palabras, un clasificador puntúa 138 identificadores de experto y se elige uno. Si la confianza del router cae por debajo de 0,45, se selecciona un coder de 14B en int4. Si la petición contiene una señal de imagen, se carga un checkpoint de difusión que escribe un PNG.

El sistema permite encadenar hasta tres saltos (`chain`), de modo que la salida de un experto (texto o una ruta a un PNG) se pasa al siguiente mediante una nota de texto compartida. Además, varias cadenas pueden votar por mayoría sobre la cadena terminal exacta (`bag`), y existe una caché externa de 128 dimensiones compartida únicamente por los routers, que puede desplazarse a lo largo de la cadena. Los checkpoints especialistas permanecen congelados; el entrenamiento solo cubre el router, la política de slots de caché y el desplazamiento.

Es relevante porque ataca un problema práctico de despliegue en local: un portátil con 24 GB puede mantener residente un checkpoint de 7B, pero no decenas de especialistas simultáneos. La propuesta es decidir qué modelo cargar en cada momento, no rediseñar capas internas de un modelo. El autor declara explícitamente que el repositorio es un ensamblaje de métodos publicados y que no introduce ningún algoritmo nuevo de routing, memoria o decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de orquestación sobre checkpoints congelados: router de hashing de palabras, clasificador de 138 identificadores de experto, cadenas de hasta 3 saltos, votación por bolsa de cadenas y caché externa de 128 dimensiones con desplazamiento. No es un transformer único ni un MoE denso con capas propias |
| Parametros totales | No disponible. El repositorio (0,2 GB) contiene seis checkpoints entrenados (router de entrada, cuatro routers de salto y la caché externa `exkv.pt`); los pesos de los especialistas no se redistribuyen |
| Parametros activos | Un único especialista congelado por petición (seleccionado por el router); no aplica el concepto de parámetros activos de un MoE por capas |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Int4 mencionada para el coder de 14B seleccionado cuando la confianza del router es inferior a 0,45. No se documentan otros formatos de cuantización |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Other (los archivos de pesos de los especialistas conservan sus propias licencias y no se redistribuyen aquí) |
| Formato de pesos | Safetensors (etiqueta del repositorio); los checkpoints entrenados del proyecto se distribuyen como `.pt` de PyTorch |
| Autor | Ehraim |
| Biblioteca | `mote` |
| Numero de expertos direccionables | 138 identificadores de experto puntuados por el clasificador |
| Pools de especialistas | 6, 18, 24 y 36, anidados (cada pool mayor contiene los menores). Todos incluyen texto, generador de imagen y clasificador; desde 18 incluyen también voz y OCR |
| Umbral de confianza del router | 0,45 (por debajo, se selecciona el coder de 14B en int4) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje de piezas publicadas. El router de entrada usa características de hashing de palabras (feature hashing) inspiradas en la literatura de mixture of experts (Jacobs et al., 1991; Shazeer et al., 2017; Fedus et al., 2022). El paso de texto entre modelos sigue el esquema de Socratic Models (Zeng et al., 2022) y HuggingGPT (Shen et al., 2023), y la cascada que elige un modelo posterior a partir del resultado de uno anterior sigue a FrugalGPT (Chen et al., 2024). La votación de varias cadenas sobre la cadena terminal bebe de bagging (Breiman, 1996), self-consistency (Wang et al., 2023) y Mixture-of-Agents (Wang et al., 2024). vLLM se emplea como runtime de servicio (PagedAttention, Kwon et al., 2023) y no como un segundo archivo de pesos.

La caché externa está inspirada en Memory Networks (Weston et al., 2015), Neural Turing Machines (Graves et al., 2014) y end-to-end memory networks (Sukhbaatar et al., 2015), con escrituras residuales, mezcla por atención sobre las lecturas apiladas y una compuerta aprendida entre saltos de memoria. El entrenamiento de esta caché combina REINFORCE (Williams, 1992) para elegir el slot con retropropagación para escribir el contenido, y una actualización de política recortada con valor aprendido al estilo PPO (Schulman et al., 2017); el desplazamiento que mueve la caché de una capa a otra posición de la cadena se inspira en convolución deformable, shifted windows y soft expert slots. La pérdida del router es la etiqueta de experto y fluye a través de ese desplazamiento. Ninguna actualización modifica los especialistas congelados: la generación la sigue haciendo el experto seleccionado.

El autor no publica el número de tokens de entrenamiento, la composición del dataset ni detalles de RLHF/DPO. Los datos disponibles indican únicamente qué objetos se entrenaron: `checkpoints/router.pt` (router de entrada), `checkpoints/routers/after-diffusion.pt`, `after-vllm.pt`, `after-llm.pt`, `after-classifier.pt` (routers de salto según el tipo de paso previo) y `checkpoints/exkv.pt` (caché externa apilada: política de slots y valor). La decodificación es greedy y el router se entrena con `python -m mote.train_router` y `python -m mote.train_chain_routers`.

## Capacidades

- Generación de texto mediante el especialista de texto seleccionado por el router, con prefill de una memoria de texto en la caché privada del experto y decodificación greedy.
- Generación de código: el comando de ejemplo `python -m mote "fix the pytest" --root .` apunta a reparación de tests; cuando la confianza del router baja de 0,45 se carga un coder de 14B en int4.
- Generación de imágenes: una señal de imagen en la petición carga un checkpoint de difusión que escribe un PNG.
- Clasificación: cada pool incluye un clasificador y existe un router de salto específico para el paso posterior a una clasificación.
- OCR y voz: disponibles a partir del pool de 18 especialistas (no en el de 6).
- Cadenas multi-paso: hasta tres saltos, donde cada salto escribe texto o una ruta de PNG en una nota compartida que el siguiente experto puede usar como prefill.
- Casos de uso encadenados con nombre propio: `diagram` (generación de diagramas), `label-then-explain` (etiquetar y explicar), `draft-then-illustrate` (borrador y luego ilustración) y `match-then-redraw` (emparejar y volver a dibujar).
- Cascada repetida imagen-y-descripción (`image-then-caption`).
- Votación por bolsa: se extraen varios expertos de la distribución del router y se vota por mayoría sobre la cadena terminal exacta.
- Memoria externa compartida: caché de 128 dimensiones que puede desplazarse a lo largo de la cadena para reutilizar el slot de un modelo anterior o avanzar un paso.
- Routing determinista por hashing: la misma petición produce la misma bolsa de identificadores de palabras.

No se documentan capacidades de tool calling o function calling, ni de razonamiento multi-paso autónomo más allá de las cadenas de hasta tres saltos descritas.

## Casos de uso

- Reparación automática de tests en un repositorio: con `python -m mote "fix the pytest" --root .` el router dirige la petición al especialista de código adecuado (o al coder de 14B en int4 si la confianza es baja) y el modelo opera sobre el árbol de ficheros indicado para corregir el test que falla.
- Generación de diagramas a partir de una descripción: el caso `diagram` encadena un experto de texto con un generador de imagen, de modo que la salida del primero se convierte en la nota que el segundo usa para escribir el PNG final.
- Etiquetado y explicación de material visual: el flujo `label-then-explain` usa primero un clasificador para asignar una etiqueta y después un experto de texto que explica esa etiqueta, reutilizando la nota compartida entre saltos.
- Documentación ilustrada en dos fases: `draft-then-illustrate` genera primero un borrador textual y luego lo ilustra, útil para documentación técnica o material didáctico donde el texto condiciona la imagen.
- Emparejamiento y regeneración de imágenes: `match-then-redraw` compara la entrada con un resultado existente y vuelve a dibujarla, un flujo aplicable a control de calidad visual o a iteración sobre bocetos.
- Descripción automática de imágenes en cascada: la cascada `image-then-caption` se repite para producir pies de foto, aprovechando el generador de imagen y los especialistas de texto y OCR del pool.
- Digitalización de documentos con texto e imagen: a partir del pool de 18, el sistema dispone de OCR y de generación de texto, por lo que puede extraer texto de una imagen y después resumirlo o clasificarlo en saltos encadenados.
- Transcripción y post-procesado de audio: los pools de 18 en adelante incluyen un experto de voz, que puede combinarse con el experto de texto para transcribir y después resumir o etiquetar el contenido.
- Enrutado de bajo coste en estaciones de trabajo con una sola GPU: al cargar un único especialista congelado a la vez, el sistema permite servir varias tareas heterogéneas (texto, código, imagen, OCR, voz) en una máquina de 24 GB sin mantener todos los modelos residentes.
- Selección de experto por lotes con votación: el modo bolsa permite lanzar varias cadenas y quedarse con la cadena terminal más votada, lo que sirve para tareas donde interesa estabilizar la salida exacta (por ejemplo, respuestas cortas y verificables).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones cuantitativas con otros sistemas. Tampoco se documentan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM: el diseño asume una GPU de 24 GB, con un único checkpoint público congelado cargado a la vez. No se especifica VRAM adicional para los routers ni para la caché externa de 128 dimensiones.
- El coder de 14B se carga en int4 cuando la confianza del router es inferior a 0,45; el resto de especialistas se seleccionan entre 138 identificadores y se descargan en tiempo de decodificación desde su identificador de Hub original.
- GPU recomendadas: no disponibles de forma explícita. El único requisito declarado es una GPU de 24 GB; el autor lo enmarca como un escenario de portátil con 24 GB.
- Encaje en GPU de consumo: no confirmado. Un límite de 24 GB es compatible con tarjetas de gama alta de consumo de esa VRAM, pero la model card no nombra ningún modelo concreto (RTX 4090, A100, H100, etc.).
- Despliegue: interfaz de línea de comandos del paquete `mote` (`python -m mote --map`, `python -m mote "..."`), con vLLM como runtime de servicio para el paso de texto y pruebas mediante `python -m pytest tests -q`. Librería declarada en el repositorio: `mote`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El sistema no compite con un modelo denso concreto, sino con otros esquemas de orquestación y cascada. La tabla recoge la comparación cualitativa con las referencias que la propia model card cita como base.

| Sistema | Tipo | Seleccion de modelo | Contexto | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mixture of Tiny Sliding Experts | Orquestación de checkpoints congelados con router, cadenas y caché externa | Router por hashing de palabras sobre 138 expertos, umbral 0,45 | No disponible | No redistribuye especialistas; distribuye routers y caché (`safetensors`, `.pt`) | Other | Hugging Face (`Ehraim/mixture-of-tiny-sliding-experts`), biblioteca `mote` |
| HuggingGPT (Shen et al., 2023) | Orquestación de modelos por texto | Planificación por un LLM que enruta a modelos especializados | No disponible | No aplica (orquesta modelos externos) | No disponible | Paper |
| FrugalGPT (Chen et al., 2024) | Cascada de modelos | Elige un modelo posterior a partir del resultado de uno anterior | No disponible | No aplica | No disponible | Paper |
| Mixture-of-Agents (Wang et al., 2024) | Agregación por votación | Varios agentes proponen y se agrega la respuesta | No disponible | No aplica | No disponible | Paper |
| Socratic Models (Zeng et al., 2022) | Composición multimodal por texto | Paso de texto entre modelos de distintos dominios | No disponible | No aplica | No disponible | Paper |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con ninguna de estas alternativas.

## Limitaciones y advertencias

- No hay ningún benchmark publicado en la información disponible; no es posible estimar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe evidencia de uso en producción ni validación externa.
- La licencia es `other`, sin texto de licencia explícito en la información disponible; además, los pesos de los especialistas conservan sus propias licencias y no se redistribuyen aquí, por lo que el uso comercial depende de las condiciones de cada checkpoint de terceros descargado en tiempo de ejecución.
- Solo se declara soporte de inglés (`en`); no hay indicación de capacidades multilingües pese a que el público objetivo pueda necesitarlas.
- La decodificación es greedy, lo que limita la diversidad de las respuestas y no incorpora muestreo, temperatura ni decodificación especulativa.
- Las cadenas están limitadas a tres saltos, lo que restringe la profundidad del razonamiento multi-paso.
- La caché externa compartida tiene 128 dimensiones y solo la usan los routers; los expertos no comparten una caché key-value nativa, por lo que el estado entre especialistas heterogéneos se transmite como texto plano (o como ruta a un PNG), lo que puede degradar la información en cada salto.
- El umbral de confianza de 0,45 es un valor fijado manualmente; no se documenta cómo se calibró ni qué ocurre en peticiones ambiguas.
- El sistema depende de la descarga de checkpoints externos desde sus identificadores de Hub originales en tiempo de decodificación, lo que introduce dependencia de red, de disponibilidad de esos repositorios y de sus condiciones de uso.
- El propio autor advierte que el repositorio ensambla métodos ya publicados y no introduce algoritmos nuevos, por lo que la novedad es de integración, no algorítmica.
- Riesgo de alucinación: el sistema no documenta mecanismos de verificación factual más allá de la votación por mayoría sobre cadenas terminales exactas y del routing por umbral.
- Sesgos conocidos: no disponibles. No se documenta la composición de los datos de entrenamiento de los routers ni de la caché, ni posibles sesgos de los especialistas de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ehraim/mixture-of-tiny-sliding-experts
- Referencias arXiv citadas en las etiquetas del repositorio (sin título confirmado en la información disponible):
  - https://arxiv.org/abs/1701.06538
  - https://arxiv.org/abs/2101.03961
  - https://arxiv.org/abs/2204.00598
  - https://arxiv.org/abs/2303.17580
  - https://arxiv.org/abs/2305.05176
  - https://arxiv.org/abs/2203.11171
  - https://arxiv.org/abs/2406.04692
  - https://arxiv.org/abs/1410.3916
  - https://arxiv.org/abs/1410.5401
  - https://arxiv.org/abs/1503.08895
  - https://arxiv.org/abs/1505.00521
  - https://arxiv.org/abs/1707.06347
  - https://arxiv.org/abs/2308.00951
  - https://arxiv.org/abs/2506.18945
- Fichero de variantes y pools de especialistas citado en la model card: `mote/variants.py` (dentro del paquete `mote`)
- Comandos documentados en la model card:
  - `python -m mote.train_router`
  - `python -m mote.train_chain_routers`
  - `python -m mote --map`
  - `python -m mote "fix the pytest" --root .`
  - `python -m pytest tests -q`
