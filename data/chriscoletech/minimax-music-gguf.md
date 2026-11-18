# ChrisColeTech/minimax-music-GGUF

## Resumen

MiniMax Music 3 GGUF es una conversión al formato GGUF del modelo MiniMaxAI/MiniMax-Music3, un sistema de generación de música completa a partir de texto. El modelo combina un codificador de texto autorregresivo con un transformer de difusión (DiT) basado en flow matching, junto con un VAE de audio, para producir canciones estereofónicas de hasta cinco minutos a 44,1 kHz con voces y acompañamiento instrumental. La conversión la mantiene el usuario ChrisColeTech y está pensada para su uso en ComfyUI mediante un cargador GGUF específico.

El interés de esta versión radica en la cuantización: los pesos originales se distribuyen en tres componentes separados (codificador de texto, DiT y VAE), lo que permite ejecutar el pipeline en una GPU de consumo con un pico de memoria en torno a 9,7 GiB en cuantización Q8_0. El repositorio ocupa 110,1 GB e incluye múltiples niveles de cuantización, aunque la model card solo detalla los ficheros Q8_0.

El modelo base cuenta con aproximadamente 7.612 millones de parámetros según los datos de safetensors, lo que lo sitúa en la gama media-alta para generación de audio. La licencia es "other", lo que obliga a revisar los términos del modelo original antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto autorregresivo + transformer de difusión (DiT) con flow matching + VAE de audio |
| Parametros totales | 7.612.806.656 (~7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (documentado); el repositorio incluye otras cuantizaciones no detalladas en la model card |
| Idiomas soportados | No disponible (la entrada de texto es una descripción musical en lenguaje natural; la model card está en inglés) |
| Licencia | Other (hereda la del modelo base MiniMaxAI/MiniMax-Music3) |
| Formato de pesos | GGUF para codificador de texto y DiT; safetensors para el VAE de audio |

## Arquitectura y entrenamiento

El pipeline se compone de tres piezas diferenciadas. El codificador de texto autorregresivo procesa la descripción musical (caption) y la letra estructurada con etiquetas de sección, y genera las condiciones latentes que guían la síntesis. El transformer de difusión (DiT) aplica flow matching para transformar ruido en representaciones de audio condicionadas por esa información textual, y un VAE de audio (fichero `minimax_music3_dav.safetensors`, 217 MB) decodifica los latentes en la forma de onda final estéreo a 44,1 kHz. La generación se controla con un scheduler Euler, 30 pasos y un CFG de 1,7 en la etapa de flujo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de esta conversión tampoco documenta innovaciones adicionales más allá de la propia cuantización y del recorte (pruning) aplicado al codificador de texto, que se distribuye como `minimax_music3_text_encoder_pruned_Q8_0.gguf` (8,88 GB). El DiT cuantizado ocupa 2,70 GB en Q8_0.

## Capacidades

- Generación de música completa a partir de una descripción textual (caption) y una letra, con una duración de hasta 300 segundos (5 minutos).
- Salida de audio estéreo a 44,1 kHz con calidad de estudio según los ejemplos publicados.
- Control fino del estilo mediante captions estructuradas en tres partes: metadatos globales (género, BPM, tonalidad, ambiente), detalles vocales y arreglo instrumental.
- Soporte de estructuración de la canción mediante etiquetas de sección en líneas independientes: `[intro]`, `[verse]`, `[pre-chorus]`, `[chorus]`, `[bridge]`, `[instrumental]`, `[solo]` y `[outro]`.
- Generación de voces con características controlables (tipo de voz, registro, presencia en la mezcla, armonías, coros).
- Producción instrumental con control de tempo (BPM), tonalidad y estilo de producción (por ejemplo, especificando ausencia de ruido de vinilo o de cinta).
- Integración en ComfyUI mediante el cargador `comfyui-gguf-loader` y un flujo de trabajo de ejemplo proporcionado.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada; el modelo es estrictamente texto a audio.

## Casos de uso

- **Prototipado rápido de canciones para compositores**: un músico puede describir género, tempo, tonalidad y estructura, y obtener una maqueta completa de hasta cinco minutos con voz en menos de diez minutos en una GPU de consumo, lo que acelera la iteración creativa antes de entrar en un estudio.
- **Producción de música de fondo para vídeo y pódcast**: la capacidad de generar pistas instrumentales estéreo a 44,1 kHz con secciones etiquetadas (`[intro]`, `[instrumental]`, `[outro]`) permite crear bandas sonoras ajustadas a la duración y al tono de cada pieza audiovisual.
- **Generación de jingles y cuñas publicitarias**: el control del BPM, la tonalidad y el estilo vocal mediante captions detalladas facilita producir variantes de una misma cuña adaptadas a distintos públicos o duraciones.
- **Creación de contenido para videojuegos**: las etiquetas de sección y la posibilidad de fijar el estado de ánimo permiten generar temas que acompañen menús, combates o cinemáticas, con la ventaja de que el pipeline cabe en una RTX 5090.
- **Educación musical y análisis de arreglos**: estudiantes pueden generar una canción a partir de una descripción teórica concreta (por ejemplo, "pop-punk en mi mayor a 172 BPM con coros apilados") y comparar el resultado con la partitura o el arreglo esperado.
- **Investigación en generación de audio**: al estar en GGUF y ejecutarse en ComfyUI, sirve como banco de pruebas reproducible para estudiar el efecto de la cuantización y del número de pasos de difusión en la calidad musical percibida.
- **Personalización de contenido para redes sociales**: la generación de canciones cortas (60-120 segundos) con letras propias permite producir bandas sonoras originales para vídeos verticales sin depender de bibliotecas con derechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MOS, FAD, CLAP score u otros) en la información disponible. La model card únicamente incluye mediciones de rendimiento de inferencia:

| Metrica | Valor | Condiciones |
|---|---|---|
| Duracion de la cancion generada | 2:29 min | Cuantizacion Q8_0 |
| Tiempo de generacion | ~7,3 min | RTX 5090 (32 GB) |
| Pico de VRAM | 9,7 GiB | RTX 5090 (32 GB) |
| Duracion de la cancion generada | 1:01 min | Cuantizacion Q8_0 |
| Tiempo de generacion | ~5 min | RTX 5090 (32 GB) |
| Pico de VRAM | 9,7 GiB | RTX 5090 (32 GB) |

## Requisitos de hardware

- **VRAM estimada**: en cuantización Q8_0 el pico medido es de 9,7 GiB, por lo que una GPU con 12 GB o más debería ser suficiente. El repositorio incluye cuantizaciones adicionales no detalladas que probablemente reduzcan este requisito.
- **GPU recomendadas**: RTX 5090 (32 GB) es la configuración validada por el autor. Por el pico de memoria, también deberían funcionar RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y GPUs de centro de datos como A100 o H100, aunque no hay mediciones publicadas en estas.
- **Cabe en GPU de consumo**: sí, al menos en la gama RTX 40 y 50 con 12 GB o más en Q8_0.
- **Opciones de despliegue**: ComfyUI con el cargador `comfyui-gguf-loader` (canal "Channel (remote)" del ComfyUI Manager). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el pipeline no es un LLM estándar sino un sistema de difusión con codificador de texto.
- **Latencia y throughput**: aproximadamente 7,3 minutos para generar 2:29 minutos de audio y unos 5 minutos para 1:01, siempre en una RTX 5090 con Q8_0. La relación es de aproximadamente 2,9x y 4,9x el tiempo real respectivamente, lo que sugiere que la latencia no escala de forma lineal con la duración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax Music 3 GGUF (esta ficha) | ~7,6 mil M | Hasta 5 min de audio | Other | GGUF + safetensors | Hugging Face, ComfyUI |
| MiniMaxAI/MiniMax-Music3 (original) | ~7,6 mil M | Hasta 5 min de audio | Other | Pesos originales | Hugging Face |
| Comfy-Org/MiniMax-Music-3 | ~7,6 mil M | Hasta 5 min de audio | Other | Pesos para ComfyUI | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoría (por ejemplo, otros sistemas texto-a-música). La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- **Licencia "other"**: no se especifican los términos exactos en la model card; es imprescindible consultar la licencia de MiniMaxAI/MiniMax-Music3 antes de cualquier uso comercial.
- **Dependencia de un cargador específico**: requiere la versión actualizada de `comfyui-gguf-loader`; versiones antiguas pueden no cargar los ficheros correctamente.
- **Calidad vocal dependiente del prompt**: el autor advierte que si no se describe explícitamente la voz (por ejemplo, "voz femenina cálida, cercana y susurrante"), el modelo deriva hacia resultados inconsistentes.
- **Conjunto de etiquetas cerrado**: solo se admiten las ocho etiquetas de sección listadas; otras etiquetas no son interpretadas por el modelo.
- **Duración máxima**: 300 segundos; las peticiones por encima de ese límite no están soportadas.
- **Riesgo de alucinación lírica**: al ser un modelo generativo condicionado por texto, puede producir letras o pronunciaciones no deseadas, especialmente con letras ambiguas o en idiomas distintos del inglés.
- **Idiomas no documentados**: no hay información sobre el soporte multilingüe de las letras; la model card está íntegramente en inglés y los ejemplos son en inglés.
- **Sesgos**: no se documentan sesgos conocidos, pero al ser un modelo entrenado con datos musicales no especificados, es probable que reproduzca sesgos de estilo y de representación vocal.
- **Reproducibilidad**: no se documentan semillas ni parámetros de muestreo más allá de steps=30 y CFG=1,7, lo que dificulta reproducir exactamente los ejemplos publicados.
- **Tamaño del repositorio**: 110,1 GB, lo que requiere espacio en disco considerable y una descarga selectiva de los ficheros necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ChrisColeTech/minimax-music-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Pesos fuente para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-Music-3
- Codificador de texto Q8_0: https://huggingface.co/ChrisColeTech/minimax-music-GGUF/blob/main/split/text_encoders/minimax_music3_text_encoder_pruned_Q8_0.gguf
- DiT Q8_0: https://huggingface.co/ChrisColeTech/minimax-music-GGUF/blob/main/split/diffusion_models/minimax_music3_dit_Q8_0.gguf
- VAE de audio: https://huggingface.co/ChrisColeTech/minimax-music-GGUF/blob/main/split/vae/minimax_music3_dav.safetensors
- Flujo de trabajo de ejemplo en ComfyUI: https://huggingface.co/ChrisColeTech/minimax-music3-GGUF/blob/main/workflow_examples/minimax_music3.json
- Muestra synth-pop: https://huggingface.co/ChrisColeTech/minimax-music-GGUF/resolve/main/samples/synthpop_2min.wav
- Muestra punk-funk: https://huggingface.co/ChrisColeTech/minimax-music-GGUF/resolve/main/samples/punk.wav
