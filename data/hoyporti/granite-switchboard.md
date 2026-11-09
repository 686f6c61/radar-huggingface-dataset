# hoyporti/granite-switchboard

## Resumen

Granite Switchboard es una extraccion instrumental del modelo IBM Granite 3.0 1B-A400M Instruct, publicada por el usuario hoyporti, que conserva unicamente la maquinaria de enrutamiento de una arquitectura mixture-of-experts (MoE). El modelo recibe `input_ids` con forma `[1, tokens]` y devuelve `router_logits` con forma `[24, tokens, 32]`: la puntuacion de cada una de las 24 capas para cada uno de los 32 expertos disponibles. Aplicando un top-8 y una softmax sobre cada fila se obtienen los expertos y pesos que el modelo original habria seleccionado.

No es un modelo generativo. Los expertos y la atencion siguen ejecutandose porque el router de cada capa depende de lo que computaron las capas anteriores, pero no se conserva nada posterior a los routers de la ultima capa. Su proposito es servir de motor de interpretabilidad y visualizacion: alimenta la Figura 2 del proyecto switchboard, que enruta en el navegador mediante ONNX Runtime Web sobre WebGPU.

La relevancia actual es doble: por un lado, expone de forma aislada y ligera (1,5 GB en el repositorio) el comportamiento de enrutamiento de un MoE de IBM, un aspecto habitualmente opaco; por otro, demuestra una cuantizacion selectiva (8 bits para expertos y atencion, fp16 para embeddings, fp32 para routers) que preserva el 94,8% de coincidencia con el modelo completo frente al 57% de una copia en 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (extraccion de routers del modelo base Granite 3.0 1B-A400M) |
| Parametros totales | no disponible (repo de 1,5 GB; el modelo base declara 1B totales) |
| Parametros activos | 400M en el modelo base (no disponible para esta extraccion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos y atencion en 8 bits (MatMulNBits, bloques de 32); embeddings en fp16; routers en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (libreria `onnx`) |

## Arquitectura y entrenamiento

El modelo hereda la topologia MoE del base Granite 3.0 1B-A400M Instruct: 24 capas, cada una con 32 expertos y seleccion top-8 por token. Esta publicacion no reentrena nada; es una cirugia del checkpoint original que elimina las cabezas de generacion y conserva el grafo hasta los routers de la ultima capa. La salida es un tensor tridimensional `[capas, tokens, expertos]` con los logits crudos de enrutamiento.

La innovacion tecnica esta en la politica de cuantizacion mixta: los routers, que determinan toda la salida observable, permanecen en fp32; las matrices de expertos y atencion se comprimen a 8 bits con MatMulNBits en bloques de 32; la tabla de embeddings se guarda en fp16. Esta decision mantiene una coincidencia del 94,8% de pares token-capa con el modelo fp32 completo en las frases trazadas por switchboard, mientras que una version en 4 bits cae al 57%. El modelo se reconstruye con `python -m switchboard routes` desde el repositorio switchboard. No se dispone de informacion sobre datos de entrenamiento, tokens vistos ni fases de RLHF o DPO, ya que corresponden al modelo base y no se detallan en la informacion proporcionada.

## Capacidades

- Extraccion de logits de enrutamiento: devuelve `router_logits` de forma `[24, tokens, 32]` para cualquier secuencia de `input_ids` de forma `[1, tokens]`.
- Analisis de seleccion de expertos: permite calcular top-8 y softmax por fila para reconstruir expertos y pesos efectivos del modelo original.
- Interpretabilidad de MoE: expone que expertos activa cada capa y token, util para estudiar especializacion y flujo de informacion.
- Inferencia en navegador: disenado para ejecutarse con ONNX Runtime Web sobre WebGPU, sin backend servidor.
- No genera texto: carece de cabeza de lenguaje y de cualquier salida posterior a los routers de la ultima capa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por si mismo.
- Capacidades multilingues: no disponibles como capacidad propia; dependen del tokenizador del modelo base, no documentado aqui.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Visualizacion interactiva de enrutamiento MoE: integrar el ONNX en una pagina web con ONNX Runtime Web y WebGPU para mostrar en tiempo real que expertos activa cada token al escribir, tal como hace el proyecto switchboard.
- Investigacion de especializacion de expertos: volcar los logits para un corpus y analizar que expertos se activan por dominio, idioma o tipo de token, identificando expertos infrautilizados o redundantes.
- Auditoria de modelos MoE en produccion: comparar el patron de enrutamiento entre el modelo completo y variantes cuantizadas para decidir que precision es aceptable antes de desplegar una version comprimida.
- Docencia y divulgacion: explicar el funcionamiento interno de un MoE con un artefacto ligero de 1,5 GB que corre en el navegador sin GPU dedicada de servidor.
- Pruning guiado por rutas: usar las estadisticas de activacion para decidir que expertos podar o fusionar en una destilacion posterior del modelo base.
- Pruebas de regresion de cuantizacion: validar que una nueva receta de cuantizacion conserva la coincidencia de enrutamiento respecto al fp32 usando el umbral de referencia del 94,8%.
- Deteccion de deriva en fine-tuning: comparar los logits de routers de un checkpoint ajustado frente al original para localizar capas donde el enrutamiento cambio mas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de rendimiento reportado es la fidelidad de enrutamiento:

| Metrica | Resultado |
|---|---|
| Coincidencia top-8 con el modelo fp32 completo (pares token-capa, frases de switchboard) | 94,8% |
| Coincidencia top-8 con una copia en 4 bits | 57% |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,5 GB; en inferencia ONNX con los pesos en 8 bits y fp16, la huella de memoria es del orden de 1,5-2 GB, sin contar activaciones.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso de navegador; en servidor, tarjetas consumer como RTX 3060 o superiores son suficientes por el tamano del artefacto.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna de 4 GB o mas, e incluso en equipos integrados con WebGPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, Web) y ONNX Runtime Web con WebGPU; no aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| Granite Switchboard (este) | no disponible (base 1B/400M activos) | no disponible | Extraccion de router logits para interpretabilidad | Apache 2.0 | ONNX |
| ibm-granite/granite-3.0-1b-a400m-instruct | 1B totales / 400M activos | no disponible | Generacion de texto instruct | Apache 2.0 | safetensors |
| Variantes de interpretabilidad de MoE (p. ej. extracciones de routers de Mixtral o DeepSeek) | variable | no disponible | Analisis de enrutamiento | segun original | variable |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: no debe emplearse como sustituto del modelo base en ninguna tarea de generacion, razonamiento o codigo.
- Solo acepta `input_ids` con batch de tamano 1 (`[1, tokens]`); no esta documentado el soporte de batches mayores.
- La fidelidad del 94,8% implica que aproximadamente 1 de cada 20 pares token-capa discrepa del modelo fp32; no es un oraculo exacto del enrutamiento original.
- La precision de los logits de router depende de que los expertos y la atencion en 8 bits reproduzcan fielmente las activaciones intermedias; errores acumulados en capas profundas pueden alterar la seleccion.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue, al carecer de cabeza generativa.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero conviene verificar las condiciones del modelo base de IBM y del proyecto switchboard si se redistribuye.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria ni pipeline declarado, lo que desaconseja su uso en produccion sin evaluacion propia.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje como tal, solo tokens de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/hoyporti/granite-switchboard
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-1b-a400m-instruct
- Repositorio switchboard: https://github.com/SomethingObvious/switchboard
