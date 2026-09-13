# Serveurperso/MiniMax-Music3-GGUF

## Resumen

MiniMax Music 3 GGUF es la redistribucion cuantizada en formato GGUF del modelo de generacion de musica MiniMax Music 3 de MiniMax, preparada por el usuario Serveurperso para el runtime en C++ minimaxmusic.cpp. No es un modelo unico, sino un pipeline de cinco componentes con un GGUF independiente por componente: un modelo de lenguaje autorregresivo de 8B derivado de Qwen3, un decodificador de profundidad RVQ de 0,6B, un transformer de difusion (DiT) de 2,4B con flow matching de 36 bloques de self-attention, un codificador de condicionamiento y un VAE/vocoder de 123M. La entrada es un caption estructurado mas letra, y la salida es audio estereo a 44,1 kHz.

Su relevancia practica esta en la portabilidad: al estar convertido a GGML/GGUF, el pipeline funciona en CPU, CUDA y Vulkan sin depender de PyTorch, y expone un servidor HTTP (mm-server) con WebUI embebida en el puerto 8086, ademas de herramientas de linea de comandos (mm-synth, mm-lm). El repositorio ocupa 59,7 GB e incluye cuantizaciones desde BF16/F32 hasta Q5_K_M (y Q4_K_M solo para el DiT), con un conjunto Q8_0 que el autor cifra en unos 9 GB de VRAM en tiempo de ejecucion. Se distribuye bajo la licencia comunitaria MiniMax-Music3, que impone condiciones de atribucion y salvaguardas para servicios alojados.

El campo de parametros totales de la ficha de HuggingFace indica 25.167.881, mientras que el desglose por componentes de la model card suma del orden de 11.100 millones de parametros (8B + 0,6B + 2,4B + 123M, sin contar el codificador de condicionamiento). Se reproduce el dato tal cual y se senala la discrepancia, sin corregirlo por cuenta propia. El repositorio acumula 496.577 descargas y 6 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal de generacion musical: LM autorregresivo (base Qwen3 causal, 8B) + decodificador de profundidad RVQ (transformer intra-frame, 0,6B) + DiT de flow matching (2,4B, 36 bloques de self-attention) + codificador de condicionamiento + VAE/vocoder (123M) |
| Parametros totales | 25.167.881 segun el campo de HuggingFace; el desglose de componentes de la model card suma aproximadamente 11.100 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LM: BF16, Q8_0, Q6_K, Q5_K_M (el autor indica que no hay Q4 porque el LM de codigos de audio se degrada por debajo de Q5). Decodificador RVQ: BF16, Q8_0. DiT: F32, Q8_0, Q6_K, Q5_K_M, Q4_K_M. Codificador de condicionamiento y vocoder: solo F32 |
| Idiomas soportados | en, zh |
| Licencia | minimax-music3-community (campo `license: other` en HuggingFace) |
| Formato de pesos | GGUF (un archivo por componente) |

## Arquitectura y entrenamiento

El pipeline se organiza en cuatro etapas encadenadas. El LM global de 8B, ajustado a partir de Qwen3-8B, predice frame a frame la primera tabla de cuantizacion RVQ (codebook semantico) a 25 Hz. El decodificador de profundidad RVQ de 0,6B opera como transformer intra-frame sobre las 7 tablas acusticas, una vez por cada frame de 25 Hz, y produce los estados ocultos fusionados. El codificador de condicionamiento aplica una mezcla de 8 estados y remuestrea de 25 Hz a 86,13 Hz para construir la pista de condicionamiento. El DiT de flow matching de 2,4B renderiza la pista latente de 128 canales a 86,13 Hz mediante pasos de Euler, y el VAE de flujo (123M) convierte los latentes en dos pistas de 64 canales que se convierten en estereo a 44,1 kHz.

En cuanto al entrenamiento, esta ficha no aporta informacion sobre numero de tokens, composicion del dataset ni uso de RLHF o DPO: el repositorio redistribuye pesos ya entrenados y declara explicitamente que ningun peso ha sido reentrenado, ajustado ni alterado en sustancia. La unica transformacion aplicada es la conversion de tensores al contenedor GGUF conservando el dtype nativo byte a byte y el plegado de la normalizacion de pesos del VAE, que es la forma de inferencia de los mismos pesos. La innovacion destacable es de ingenieria de inferencia: la separacion en cinco GGUF permite conmutar la cuantizacion de cada componente desde la interfaz, y una pista ya renderizada devuelve su propio flujo de codigos, de modo que volver a renderizarla con otros ajustes de sintesis no vuelve a pagar el coste de la autoregresion. Las dependencias upstream conservan sus propias licencias: Qwen3-8B (Apache 2.0), DiT modificado de Stable Audio y VAE derivado de DAC (ambos MIT).

## Capacidades

- Generacion de musica a partir de texto: acepta un caption estructurado (por ejemplo, genero, tempo, instrumentacion) mas una letra y duracion, y produce una cancion estereo a 44,1 kHz.
- Modelado de estructura musical autorregresivo: el LM mas el decodificador de profundidad construyen la estructura de la pieza frame a frame a 25 Hz sobre 8 tablas de codigos (1 semantica y 7 acusticas).
- Renderizado de timbre y articulacion por flow matching: el DiT de 2,4B resuelve la pista latente de 128 canales a 86,13 Hz con pasos de Euler.
- Letra con estructura por secciones: los ejemplos de la model card usan marcado tipo `[verse]` dentro del campo de letra.
- Re-renderizado sin recalcular la autoregresion: la etapa autorregresiva puede ejecutarse sola (`mm-lm`) y escribir una peticion reproducible con los `audio_codes`, que despues se sintetiza con `mm-synth`.
- Servicio HTTP con WebUI: `mm-server` expone la generacion, reproduccion y descarga de pistas desde el navegador en el puerto 8086, con carga de modelos en el primer trabajo (el arranque no toca la GPU).
- Multilingue limitado: etiquetas de idioma en y zh.
- Tool calling, function calling, agentes, vision, audio de entrada y modo thinking: no disponibles; el modelo es exclusivamente texto (caption y letra) a audio.
- Aceleracion por hardware: ejecucion en CPU, CUDA y Vulkan mediante GGML.

## Casos de uso

- Maquetas musicales rapidas: un compositor escribe un caption con genero, tempo y caracter de instrumentacion ("synthwave melancolico, tempo lento, pads analogicos") y una letra por secciones, y obtiene una mezcla estereo a 44,1 kHz para evaluar la idea antes de producirla.
- Musica para video y juegos: al aceptar caption estructurado y duracion, permite generar piezas ajustadas a la longitud de un plano o a un bucle de nivel, con la ventaja de ejecutarse en el mismo equipo de produccion sin dependencias de Python.
- Iteracion de produccion sobre una misma toma: gracias a que una pista renderizada devuelve su propio flujo de codigos, se puede re-renderizar con otros ajustes de sintesis sin repetir la etapa autorregresiva, lo que abarata las comparativas A/B de cuantizacion o de parametros de sintesis.
- Servicio interno de generacion musical: `mm-server` con WebUI en el puerto 8086 permite desplegar una herramienta de autoservicio para un equipo (por ejemplo, marketing o contenidos), con la carga de modelos diferida al primer trabajo para no bloquear la GPU en el arranque.
- Despliegue en hardware sin GPU: la compatibilidad con CPU y Vulkan permite montar el pipeline en estaciones de trabajo o servidores sin CUDA, usando cuantizaciones Q5_K_M/Q6_K para reducir el peso en disco y memoria.
- Integracion en pipelines automatizados: las herramientas `mm-synth` y `mm-lm` se pueden invocar por linea de comandos desde un script o un job de CI para generar variantes de audio de forma desatendida.
- Investigacion sobre generacion de audio: cada etapa es un GGUF independiente y conmutable, lo que facilita estudiar por separado el efecto de la cuantizacion en el LM de codigos, en el decodificador RVQ o en el DiT de flow matching.
- Localizacion de contenido musical en ingles y chino: las etiquetas de idioma del modelo cubren en y zh, util para catalogos dirigidos a esos dos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FAD, CLAP, similitud de letra ni comparativas numericas) y la busqueda web realizada no devolvio resultados relevantes sobre este modelo. Los unicos datos de rendimiento declarados son cualitativos y de tipo estructural:

| Aspecto | Dato declarado por el autor |
|---|---|
| Etapa limitada por ancho de banda | LM global: relee pesos en cada paso, por lo que su cuantizacion se traduce directamente en velocidad |
| Etapa limitada por computo | DiT de flow matching: sus cuantizaciones cambian ligeramente la velocidad a cambio de VRAM |
| Umbral de cuantizacion del LM | Por debajo de Q5 el LM de codigos de audio se degrada; no se publica Q4 para este componente |
| VRAM en ejecucion | Aproximadamente 9 GB con el conjunto Q8_0 (cifra del autor) |
| Formatos de salida | Audio estereo a 44,1 kHz |
| Frecuencias internas | 25 Hz (codebook semantico y decodificador RVQ), 86,13 Hz (latente del DiT, 128 canales) |

## Requisitos de hardware

- Conjuntos de cuantizacion y tamano de archivos (suma de los cinco componentes): BF16/F32 completo, 17,2 GB + 1,3 GB + 9,7 GB + 0,1 GB + 0,3 GB, aproximadamente 28,6 GB; Q8_0, 9,1 GB + 0,69 GB + 2,6 GB + 0,1 GB + 0,3 GB, aproximadamente 12,8 GB; Q5_K_M con decodificador RVQ en Q8_0, 6,3 GB + 0,69 GB + 1,7 GB + 0,1 GB + 0,3 GB, aproximadamente 9,1 GB; Q4_K_M del DiT, aproximadamente 8,8 GB en total. Estas sumas son calculadas a partir de los tamanos de archivo publicados, no declaradas por el autor.
- VRAM en ejecucion: el autor indica aproximadamente 9 GB con el conjunto Q8_0. La diferencia frente a los 12,8 GB de archivos del mismo conjunto sugiere carga no simultanea de todos los componentes, dado que los modelos se cargan en el primer trabajo y la cuantizacion se conmuta desde la interfaz.
- Cabe en GPU de consumo: si. Una RTX 4090 (24 GB) admite con holgura los conjuntos Q8_0 y Q5_K_M; con 12-16 GB de VRAM son razonables las configuraciones Q5_K_M/Q6_K. El conjunto BF16/F32 no cabe en GPU de consumo de 24 GB y requeriria CPU o reparto con memoria del sistema.
- GPU recomendadas: no hay una lista publicada por el autor. Por tamano de los conjuntos, el BF16/F32 completo encaja en A100 40 GB, A100 80 GB o H100; los conjuntos cuantizados encajan en RTX 4090, RTX 3090, L40S y similares. Cualquier GPU compatible con CUDA puede usarse, y Vulkan cubre el caso de GPU sin CUDA.
- Despliegue: servidor propio `mm-server` (con WebUI embebida en el puerto 8086) o herramientas CLI `mm-synth` y `mm-lm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el runtime previsto es minimaxmusic.cpp sobre GGML, compilado con `-DGGML_CUDA=ON` o en modo CPU/Vulkan.
- Almacenamiento: el repositorio completo ocupa 59,7 GB, aunque solo se descarga un archivo por componente; el script del proyecto (`./models.sh`) baja el conjunto Q8_0.
- Latencia y throughput: no disponibles. El autor no publica tiempos por pista ni factor de tiempo real, solo la distincion entre la etapa limitada por ancho de banda (LM) y la limitada por computo (DiT).

## Comparativa con modelos similares

No se dispone de datos numericos de otros modelos de texto a musica en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento. La comparacion que si puede trazarse es con el checkpoint original del que deriva y con su linaje de componentes:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Serveurperso/MiniMax-Music3-GGUF | 25.167.881 segun ficha; unos 11.100 millones sumando componentes | no disponible | sin benchmarks publicados en esta ficha | minimax-music3-community | GGUF, cinco archivos por juego de cuantizacion, runtime minimaxmusic.cpp |
| MiniMaxAI/MiniMax-Music3 (upstream) | no disponible | no disponible | no disponible | minimax-music3-community | pesos originales; es el `base_model` de esta conversion |
| DiT derivado de Stable Audio | no disponible | no disponible | no disponible | MIT (componente upstream) | usado como base del DiT de 2,4B |
| VAE derivado de DAC | no disponible | no disponible | no disponible | MIT (componente upstream) | usado como base del VAE/vocoder de 123M |
| Qwen3-8B | no disponible en esta ficha | no disponible | no disponible | Apache 2.0 | base del LM global de 8B |

## Limitaciones y advertencias

- Licencia no permisiva: los pesos se distribuyen bajo la licencia comunitaria MiniMax-Music3, no bajo una licencia de codigo abierto estandar. Cualquier producto o servicio comercial que use estos pesos debe mostrar "MiniMax-Music3" en su interfaz de usuario.
- Umbral de facturacion: una facturacion anual agregada superior a 20 millones de dolares requiere autorizacion previa por escrito de MiniMax.
- Obligacion de salvaguardas: cualquier servicio alojado que permita a terceros generar con el modelo debe implementar y mantener salvaguardas razonables contra usos y salidas infractoras.
- Politica de uso aceptable: el uso debe cumplir el Acceptable Use Policy del Exhibit A de la licencia; conviene revisarlo antes de desplegar en produccion.
- Sin garantias: los pesos se ofrecen "as is", sin garantias de ningun tipo, y el repositorio declara no estar respaldado por MiniMax.
- Ausencia total de benchmarks: no hay metricas objetivas publicadas en esta ficha, ni tiempos de inferencia ni comparativas con otros modelos de generacion musical; cualquier evaluacion de calidad debe hacerse por cuenta propia.
- Degradacion por cuantizacion: el propio autor advierte que el LM de codigos de audio se degrada por debajo de Q5 y que el decodificador RVQ de 0,6B es demasiado pequeno para soportar cuantizacion agresiva. El codificador de condicionamiento y el vocoder no se cuantizan nunca por ser criticos para la calidad.
- Cobertura idiomatica limitada: solo en y zh; no hay soporte declarado para otras lenguas, ni en la letra ni en el caption.
- Longitud de contexto no documentada: no se especifica cuanta letra o caption admite el LM de 8B, lo que dificulta planificar piezas largas.
- Riesgo de alucinacion y de contenido problematico: al ser un modelo generativo de audio condicionado por texto libre, puede producir letras y audio no deseados, con el consiguiente riesgo de reproduccion de material protegido; la licencia exige salvaguardas explicitas en servicios alojados.
- Verificacion del campo de parametros: el valor 25.167.881 de la ficha no concuerda con la suma de los componentes publicados, por lo que no debe usarse como cifra fiable de tamano del modelo.
- Dependencia del runtime: el uso practico requiere compilar minimaxmusic.cpp (C++17 con GGML, submodulos incluidos) y descargar un archivo por componente; no hay integracion documentada con vLLM, Ollama, TGI o llama.cpp.
- Componentes con licencias propias: el LM procede de Qwen3-8B (Apache 2.0), el DiT de Stable Audio y el VAE de DAC (ambos MIT). Estas condiciones viajan con los componentes y deben respetarse ademas de la licencia principal.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Serveurperso/MiniMax-Music3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia MiniMax-Music3 Community: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Runtime minimaxmusic.cpp: https://github.com/ServeurpersoCom/minimaxmusic.cpp
- Qwen3 (base del LM global): https://huggingface.co/Qwen
- Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados de Stack Overflow sin relacion con el modelo (desinstalacion de MSI, ImportError en Python, icono de Copilot en VS Code, apertura de archivos C++ en Visual Studio y una discusion sobre preguntas abiertas en Meta Stack Overflow); no se han anadido por no ser relevantes.
