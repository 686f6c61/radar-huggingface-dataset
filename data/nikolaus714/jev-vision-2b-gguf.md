# nikolaus714/Jev-Vision-2B-GGUF

## Resumen

Jev-Vision-2B es un modelo multimodal de 2.000 millones de parametros disenado especificamente para la toma de decisiones tipada sobre imagenes y texto. Desarrollado por IntelligenceLab y ajustado a partir de Qwen3.5-2B, el modelo no genera respuestas libres: recibe un estado o contexto, una pregunta y un conjunto de opciones candidatas, y devuelve la etiqueta temporal de la opcion seleccionada (A, B, C...). Este diseno elimina la necesidad de parsear explicaciones en lenguaje natural para determinar la accion elegida, lo que lo hace adecuado para pipelines automatizados donde la robustez del parseo es critica.

La version aqui descrita es una conversion comunitaria a GGUF publicada por el usuario nikolaus714, pensada para inferencia local con Ollama y llama.cpp. Incluye tres cuantizaciones del modelo de lenguaje (BF16, Q8_0 y Q4_K_M) mas un proyector visual en BF16 que debe cargarse junto al GGUF del lenguaje para tareas con imagen. No es el checkpoint original en Transformers, sino una conversion que reduce los requisitos de almacenamiento y memoria.

El modelo cubre casos de decision en interfaces graficas (GUI), question answering visual, robotica con secuencias de frames, tareas espaciales, juegos y decisiones puramente textuales. Su relevancia actual radica en el nicho de los "modelos de decision" pequenos que pueden ejecutarse en hardware modesto y sustituir a LLMs mayores en bucles de control donde solo importa seleccionar una accion entre un conjunto cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM Qwen3.5-2B + proyector visual), no disponible el detalle exacto del proyector |
| Parametros totales | 2B (modelo de lenguaje); proyector visual no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (modelo de lenguaje); proyector en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp/Ollama); checkpoint original BF16 en Transformers en el repo upstream |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros, al que se anade un proyector visual para procesar imagenes (hasta cuatro por inferencia, pudiendo representar una secuencia cronologica). El ajuste fino da lugar a Jev-Vision-2B, un "SystemOne Decision Model" que reformula la tarea como seleccion entre opciones declaradas en lugar de generacion libre. El proyector se distribuye en BF16 de forma independiente y no se cuantiza al cuantizar el modelo de lenguaje.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card upstream menciona que se incluyeron filas de test de BEV y filas derivadas de Mind2Web en el entrenamiento, lo que invalida esos datos para afirmaciones de generalizacion no contaminada. El modelo soporta tres formas de decision: eleccion simple, si/no (etiquetado como "noul") y puntuacion ordenada; la guia upstream recomienda mantener el modo thinking desactivado para el scoring de decision en un solo forward.

## Capacidades

- Seleccion tipada de opciones: devuelve una letra de opcion (A, B, C...) que el llamador mapea de vuelta a la opcion semantica correspondiente.
- Procesamiento de 0 a 4 imagenes por inferencia, con posibilidad de tratarlas como secuencia temporal.
- Contexto de estado en multiples formatos: cadena, objeto o array.
- Entre 2 y 26 opciones candidatas por decision.
- Tres formas de decision: eleccion, si/no ("noul") y puntuacion ordenada de niveles.
- Question answering visual (VQA) sobre imagenes.
- Decisiones en interfaces graficas (GUI), robotica y frames de video, juegos y tareas espaciales.
- Decisiones puramente textuales (sin imagen, omitiendo el proyector).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible de forma explicita; el modelo esta pensado como componente de decision dentro de un controlador externo.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking: soportado en la plantilla de chat, aunque se recomienda desactivarlo para scoring de decision.

## Casos de uso

- Automatizacion de interfaces graficas: dado un screenshot y un contexto de objetivo, el modelo selecciona entre opciones de accion declaradas (botones, menus) devolviendo una letra que el controlador traduce a coordenadas o clics. Es adecuado por su formato de salida determinista y su entrenamiento especifico en GUI.
- Robotica basada en vision: con hasta cuatro frames como secuencia cronologica, el modelo elige entre habilidades o comandos predefinidos (acercarse, agarrar, girar), integrándose en un bucle de control donde el mapeo de letra a skill lo realiza el planificador.
- Asistencia a personas con discapacidad visual: VQA sobre imagenes del entorno para responder preguntas de si/no o de eleccion multiple, con baja latencia al ejecutarse en local.
- Control de calidad visual en produccion: clasificacion de imagenes de producto entre opciones de defecto o conformidad, usando la forma de decision si/no o de eleccion con opciones acotadas.
- Agentes de juego y entornos simulados: seleccion de la siguiente accion entre un conjunto cerrado de movimientos, aprovechando la categoria "games" del entrenamiento.
- Triaje documental y decisiones textuales: enrutado de tickets o solicitudes entre categorias predefinidas sin necesidad de imagen, omitiendo el proyector para ahorrar memoria.
- Evaluacion de tareas espaciales: decisiones sobre disposicion de objetos o relaciones espaciales en imagenes, util en logistica o inspeccion.

## Benchmarks y rendimiento

Resultados reportados por el modelo upstream (BF16), evaluacion interna en held-out con 65.989 registros. No son evaluaciones independientes de estas cuantizaciones GGUF.

| Metrica | Valor |
|---|---|
| Precision global | 92,61 % |
| Precision macro por familia | 87,36 % |
| NLL condicional | 0,1963 |
| ECE (calibracion) | 1,14 % |
| Precision GUI | 95,54 % |
| Precision VQA | 92,62 % |
| Precision robotica | 92,67 % |
| Precision espacial | 91,64 % |
| Precision juegos | 85,10 % |
| Precision texto | 66,57 % |

La precision en decisiones puramente textuales (66,57 %) es notablemente inferior al resto de familias, lo que sugiere que el modelo esta optimizado para entradas visuales. No se han publicado mediciones de rendimiento especificas para las cuantizaciones Q8_0 y Q4_K_M.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje: aproximadamente 1,2 GiB con Q4_K_M, 1,9 GiB con Q8_0 y 3,5 GiB con BF16 (tamanos de fichero; el consumo en memoria es algo superior por el contexto y el runtime).
- Proyector visual: 0,63 GiB adicionales en BF16, requerido para entrada de imagen.
- En total, una configuracion multimodal con Q4_K_M ronda los 2 GiB, por lo que cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU con llama.cpp.
- Despliegue soportado y probado por el publicador: Ollama y llama.cpp con soporte multimodal. Otros runtimes (vLLM, TGI) no estan indicados en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware y del runtime.
- Para decisiones solo de texto se puede omitir el proyector y la imagen, reduciendo el uso de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jev-Vision-2B (este) | 2B | no disponible | no disponible | GGUF | Decision tipada multimodal, salida por letras |
| Qwen3.5-2B (base) | 2B | no disponible | no disponible | safetensors/GGUF | LLM generalista sin especializacion en decision |
| IntelligenceLab/Jev-Vision-2B | 2B | no disponible | no disponible | safetensors (BF16) | Checkpoint original upstream en Transformers |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada. La comparacion con otros modelos de decision visual de tamano similar queda como no disponible.

## Limitaciones y advertencias

- Las probabilidades son relativas al conjunto de opciones proporcionado; es necesario calibrar sobre datos representativos del despliegue, especialmente en decisiones con consecuencias de seguridad o financieras.
- El modelo solo selecciona entre acciones declaradas; un controlador externo debe mapear las opciones a coordenadas GUI, habilidades roboticas u operaciones ejecutables, y validar la accion antes de ejecutarla.
- El rendimiento en vision depende de la calidad de la imagen, del preprocesado del runtime, del soporte del proyector y del prompt de decision.
- La evaluacion upstream es interna y no sustituye a una evaluacion independiente; las cuantizaciones GGUF pueden alterar precision y calibracion.
- Contaminacion conocida: filas de test de BEV y filas derivadas de Mind2Web se incluyeron en el entrenamiento, por lo que no deben usarse para afirmaciones de generalizacion no contaminada.
- Idioma limitado al ingles segun los metadatos; el rendimiento en castellano no esta documentado.
- Licencia no disponible: verificar los terminos del repositorio upstream antes de cualquier uso comercial.
- Sesgo de posicion en la seleccion de opciones: la guia upstream recomienda barajar el orden de las opciones y revertir el mapeo.
- La conversion GGUF es comunitaria y no oficial; el publicador no especifica versiones de runtime ni hardware de prueba, por lo que pueden producirse fallos de carga segun la build.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nikolaus714/Jev-Vision-2B-GGUF
- Modelo upstream: https://huggingface.co/IntelligenceLab/Jev-Vision-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
