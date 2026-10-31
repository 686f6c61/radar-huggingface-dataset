# mradermacher/Game2Player-4B-GGUF

## Resumen

Game2Player-4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Game2Player 4B, preparada por el usuario mradermacher, conocido por cuantizar de forma sistemática modelos populares de Hugging Face. El modelo base es game2player/Game2Player-4B, un modelo visual-agente de unos 4.841 millones de parámetros, derivado de la familia Qwen3.5 y entrenado con SFT para jugar a videojuegos a partir de entradas visuales.

El problema que aborda es el de los agentes capaces de interpretar pantallas de juego y tomar decisiones: Game2Player se posiciona como un modelo de juego visual (visual-agent, game-playing) que puede percibir el estado del juego y actuar en consecuencia. La relevancia de esta versión GGUF radica en la portabilidad: permite ejecutar el modelo en hardware de consumo con llama.cpp, Ollama o LM Studio, sin necesidad de GPU de gama alta.

El repositorio incluye cuantizaciones desde Q2_K (2,2 GB) hasta f16 (9,8 GB), además de los archivos multimodales mmproj necesarios para la parte de visión. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones destacables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5), con proyector de visión (mmproj) |
| Parametros totales | 4.841.450.496 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en f16 y Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 con aproximadamente 4,84 mil millones de parametros. Al tratarse de un modelo visual-agente, incorpora un componente de vision (distribuido como archivos mmproj en las cuantizaciones de mradermacher) que le permite procesar imagenes, presumiblemente capturas de pantalla de videojuegos, junto con el texto.

Sobre el entrenamiento, la model card solo indica la etiqueta "sft" (supervised fine-tuning), sin detalles sobre numero de tokens, composicion del dataset ni uso de RLHF/DPO. No hay informacion disponible sobre innovaciones tecnicas concretas como decodificacion especulativa o mecanismos de atencion alternativos.

## Capacidades

- Comprension visual: procesa imagenes (pantallas de juego) mediante el componente mmproj multimodal.
- Juego de videojuegos como agente visual: etiquetado explicito como visual-agent y game-playing, entrenado con SFT para esa tarea.
- Generacion de texto conversacional: etiquetado "conversational" en el repositorio.
- Idioma: entrenado/desarrollado para ingles; no hay informacion sobre soporte multilingue.
- No hay informacion disponible sobre tool calling, soporte de agentes multi-step, razonamiento extendido (thinking mode), audio ni codigo.

## Casos de uso

- Agentes que juegan a videojuegos de forma autonoma: el modelo interpreta capturas de la pantalla y genera acciones o decisiones, su caso de uso principal segun el entrenamiento SFT.
- Investigacion en agentes visuales: base ligera (4B) para experimentar con bucles percepcion-accion en entornos de juego, ejecutable en hardware modesto gracias a las cuantizaciones GGUF.
- Prototipado de bots asistidos por vision: integracion con emuladores o capturas de pantalla en tiempo real usando llama.cpp para percibir el estado del juego y sugerir jugadas.
- Testing automatizado de videojuegos: generacion de interacciones exploratorias sobre builds de juego para detectar errores o evaluar dificultad.
- Asistente conversacional con entrada de imagen: al ser multimodal y conversacional, puede describir o razonar sobre imagenes que se le proporcionen.
- Benchmarking de cuantizaciones: comparar la degradacion de calidad entre Q2_K y Q8_0 en tareas agenticas visuales, dado que el repositorio ofrece todo el rango de cuants.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto ni mmproj):
  - Q2_K: ~2,2 GB
  - Q4_K_M: ~3,2 GB
  - Q6_K: ~4,1 GB
  - Q8_0: ~5,3 GB
  - f16: ~9,8 GB
  - El archivo mmproj anade entre 0,5 GB (Q8_0) y 0,8 GB (f16).
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM basta para las cuants recomendadas (Q4_K_M); con una RTX 3060 de 12 GB o RTX 4060 Ti se ejecuta comodo incluso en Q8_0. Tambien es viable solo en CPU por su tamano reducido, con menor velocidad.
- Consumer GPUs: cabe sin problemas en RTX 3060, RTX 4060, RTX 4070 e incluso GPUs de 4 GB con las cuants mas agresivas.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. No hay detalles sobre vLLM o TGI para esta version cuantizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|
| Game2Player-4B (esta ficha) | 4,84B | Si (mmproj) | Apache 2.0 | GGUF estaticos, 12 cuants |
| Qwen3.5 4B (base generica) | ~4B | Segun variante | Apache 2.0 (segun version) | GGUF, safetensors |
| Game2Player-4B (original) | 4,84B | Si | Apache 2.0 | safetensors, HF |

No hay datos de rendimiento comparables publicados en la informacion disponible, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al derivar de Qwen3.5, heredara los sesgos de su entrenamiento, pero no hay documentacion especifica.
- Riesgo de alucinacion: no cuantificado; en tareas agenticas visuales es esperable que el modelo interprete incorrectamente pantallas complejas, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S).
- Limitaciones de idioma: el modelo esta etiquetado solo para ingles; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de ventana no esta publicada en la model card, lo que dificulta planificar tareas que requieran historial largo.
- Licencia: Apache 2.0 permite uso comercial; sin restricciones destacables en los cuants de mradermacher.
- Caveats de produccion: son cuantizaciones estaticas; los weighted/imatrix quants no estaban disponibles en el momento de publicacion. La calidad en cuants por debajo de Q4_K_M se degrada de forma notable segun las notas del propio repositorio (Q3_K_M marcado como "lower quality"). La parte de vision requiere cargar ademas el archivo mmproj correspondiente.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Game2Player-4B-GGUF
- Modelo base original: https://huggingface.co/game2player/Game2Player-4B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Game2Player-4B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog o demo del modelo base: no disponible
