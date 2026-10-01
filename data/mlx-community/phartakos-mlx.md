# mlx-community/phartakos-mlx

## Resumen

Phartakos MLX es un modelo de difusión generativa de audio publicado en HuggingFace bajo la organización mlx-community (con un repositorio de origen atribuido a pequodresearch) y descrito por su autor como "una máquina de pedos para la era moderna". Se trata de un generador incondicional de formas de onda de 32 kHz en mono, construido sobre una U-Net multiescala congelada y un muestreador DDPM ancestral de 200 pasos exactos. Con 23.982.433 parámetros (unos 24 M), es un modelo de investigación pequeño y no una herramienta de producción de audio realista.

El modelo es de solo inferencia (inference-only): no incluye ruta de entrenamiento ni de subida de datos, y distribuye únicamente los tensores de inferencia en `model.safetensors` con claves renombradas `model.*`. La generación es determinista respecto a la semilla (entero sin signo de 32 bits) bajo el runtime fijado en Apple Silicon, lo que permite reproducir exactamente la misma salida desactivando el modo aleatorio y reutilizando el valor de semilla.

Su relevancia es acotada pero concreta: sirve como ejemplo didáctico y reproducible de pipeline de difusión de forma de onda a pequeña escala sobre MLX, y como caso de estudio de evaluación mediante escucha humana de duraciones de salida (1 s, 2 s, 3 s). La versión inicial es la 0.1.0 y no se ha publicado ningún dato de benchmarks automáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de forma de onda multiescala (waveform U-Net) incondicional, predicción epsilon dentro de un proceso de difusión |
| Parametros totales | 23.982.433 (unos 24 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica: no es un modelo de lenguaje. La salida es una forma de onda de 1 s (por defecto), 2 s o 3 s; a 32 kHz, 1 s equivale a 32.000 muestras |
| Tipos de cuantizacion | no disponible: el bundle se distribuye en safetensors para MLX y la model card no documenta variantes cuantizadas |
| Idiomas soportados | no disponible / no aplica: el modelo no procesa texto ni lenguaje |
| Licencia | MIT (código y pesos) |
| Formato de pesos | safetensors para MLX (`model.safetensors`), más `config.json` y `MANIFEST.json` |
| Version | 0.1.0 (lanzamiento inicial) |
| Pipeline declarado | audio-to-audio (etiqueta de HuggingFace; en la práctica la generación es incondicional) |
| Frecuencia de muestreo | 32.000 Hz, mono, float32 |
| Muestreador | DDPM ancestral completo de 200 pasos (betas lineales de 0,0001 a 0,02) |
| Semilla | entero sin signo de 32 bits, determinista en la plataforma soportada |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es una U-Net de forma de onda multiescala incondicional que predice el epsilon del ruido dentro de un proceso de difusión discreto con preservación de varianza. El proceso usa 200 betas espaciadas linealmente entre 0,0001 y 0,02, y la inferencia emplea el muestreador DDPM ancestral completo de 200 pasos, sin recortes ni esquemas deterministas. La salida es audio mono en float32 a 32 kHz, y la atenuación se aplica por muestra con un límite de -1 dBFS: el modelo nunca amplifica ni recorta el resultado crudo. El entrenamiento se realizó sobre lienzos (canvases) de un segundo. Toda la generación posterior se construye concatenando o extendiendo esa base, de ahí que 2 s y 3 s sean opciones experimentales.

El linaje de entrenamiento parte del dataset público Fart Recordings Dataset de Alec Ledoux (Kaggle) y de una rama de 2.048 registros con centroide RMS. Se entrenó durante 25.000 actualizaciones, y las últimas fases incorporaron pérdidas auxiliares de x0 reconstruido con ponderación frecuencial y espectral multirresolución; esas pérdidas afectan solo al entrenamiento, ya que la inferencia sigue siendo predicción epsilon con DDPM ancestral. El checkpoint terminal seleccionado tiene SHA-256 `052764c7eeea3c6781cbab6e83885ef2d40e29e601925c9033296178227fdc6d` y su identidad de ejecución es `25e7c585e4abf974683a65b6597fd74956caf2ca7318ebe4cd496d19892c4391`. No se documentan fases de RLHF ni DPO (no aplican a este tipo de modelo). El backend MLX está validado únicamente para uso local en Apple Silicon; un despliegue en un Space de HuggingFace sobre Linux requeriría un port de backend distinto, comprobaciones de paridad numérica y validación por escucha.

## Capacidades

- Generación de audio incondicional: sintetiza formas de onda mono a 32 kHz sin ninguna entrada de texto, audio o etiqueta.
- Longitudes de salida: 1 s (opción por defecto), 2 s (opción creativa experimental) y 3 s (experimental y pendiente de validación).
- Reproducibilidad determinista: fijando una semilla de 32 bits y el runtime, la salida se puede regenerar de forma idéntica.
- Interfaz de línea de comandos (`phartakos-mlx`) y aplicación Gradio, ambas invocando la misma función `generate()`.
- Modo de semilla aleatoria (`--random-seed`): el CLI imprime la semilla elegida y la app Gradio la escribe en el campo Seed para permitir reproducirla después.
- Exportación de audio a WAV con nombres deterministas (`phartakos_mlx_010_<seed>_<length>s.wav` desde Gradio).
- Contrato de inferencia legible por máquina en `config.json` y hashes de todos los ficheros exportados en `MANIFEST.json`.
- No soporta: tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio de entrada (a pesar de la etiqueta audio-to-audio) ni modo de pensamiento.

## Casos de uso

- Efectos de sonido para prototipos de videojuegos: generar variaciones de un efecto cómico de forma procedural con semilla reproducible, de modo que un diseñador pueda fijar una semilla concreta y obtener siempre el mismo sonido en el build.
- Aplicaciones de entretenimiento y novedad: integrar el modelo en apps móviles o de escritorio para Mac que ofrezcan un botón de generación de sonido aleatorio, aprovechando el modo `--random-seed` y el registro de la semilla para compartir resultados reproducibles.
- Demos interactivas con Gradio: montar una interfaz web local donde el usuario elija duración y semilla; el propio modelo documenta este flujo como el uso principal previsto.
- Investigación y reproducción de pipelines de difusión de audio: servir como baseline pequeño (24 M de parámetros) para estudiar el efecto del número de pasos del muestreador, el espaciado de betas o las pérdidas auxiliares de reconstrucción de x0 en señales de forma de onda.
- Evaluación metodológica con escucha humana: el repositorio incluye un protocolo de estudio cerrado de comparación cero-disparo entre 1 s y 2 s con umbral de promoción preregistrado, útil como plantilla para diseñar evaluaciones subjetivas de otros modelos de audio.
- Docencia de MLX en Apple Silicon: ejemplo mínimo de conversión de safetensors, carga con la librería mlx y ejecución de inferencia local sin GPU dedicada, adecuado para talleres o prácticas.
- Contenido cómico reproducible para edición de vídeo o pódcast: generar una toma concreta identificada por semilla y longitud para insertarla en una edición y poder recrearla si hay que rehacer el montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks automáticos en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a un modelo de audio incondicional). El único dato cuantitativo publicado es un estudio de escucha humana sobre duración de salida:

| Resultado | Valor |
|---|---|
| Tipo de estudio | comparación cero-disparo (zero-shot) cerrada, con semillas nuevas |
| Preferencias exclusivas por 2 s | 8 |
| Preferencias exclusivas por 1 s | 5 |
| Empates | 3 |
| Naturalidad media: 2 s vs 1 s | 3,875 vs 3,625 |
| Continuidad media: 2 s vs 1 s | 4,1875 vs 4,3125 |
| Umbral de promoción preregistrado | 9 victorias exclusivas para 2 s (no alcanzado) |
| Decisión | 1 s se mantiene como duración por defecto |

La escala de las puntuaciones de naturalidad y continuidad no se especifica en la información disponible. No hay datos de validación por escucha comparables para la generación de 3 s.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan aproximadamente 96 MB en fp32 o 48 MB en bf16/fp16 (estimación aritmética a partir de los 23.982.433 parámetros); hay que sumar el overhead de MLX y las activaciones del muestreador de 200 pasos, que no se documentan.
- Plataforma soportada: exclusivamente Apple Silicon. Requiere macOS 14 o superior, Python 3.12 y `uv`.
- GPU recomendadas: cualquier chip de la familia Apple M (M1 o posterior); no hay soporte CUDA ni ROCm validado.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con Apple Silicon, incluidos equipos con 8 GB de memoria unificada; el repositorio ocupa 0,1 GB.
- Opciones de despliegue: MLX mediante el CLI `phartakos-mlx` o la app Gradio incluida (`uv sync` y `uv run python app.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible (se desconoce el tiempo por paso y el total de los 200 pasos). La model card advierte que 3 s puede consumir materialmente más tiempo y memoria que 1 s.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada: la tarea concreta (generación incondicional de formas de onda cómicas de 1 s) y el tamaño (24 M de parámetros) no tienen equivalentes documentados en los resultados de búsqueda. Como referencia de categoría, los modelos de difusión de audio más conocidos (por ejemplo, familias texto-a-audio) difieren en tres aspectos clave: están condicionados por texto, tienen escalas de parámetros muy superiores y no ofrecen el mismo contrato de reproducibilidad por semilla ni validación por escucha preregistrada. No se incluyen cifras de esos modelos porque no aparecen en la información disponible.

| Aspecto | Phartakos MLX | Modelos de difusión de audio condicionados por texto (categoría general) |
|---|---|---|
| Condicionamiento | ninguno (incondicional) | texto, y en algunos casos audio |
| Parametros | 23.982.433 | no disponible |
| Contexto de salida | 1 s / 2 s / 3 s a 32 kHz mono | no disponible |
| Licencia | MIT | variable según modelo |
| Disponibilidad | Apple Silicon vía MLX | multiplataforma |
| Benchmarks automaticos | no disponibles | no disponibles |

## Limitaciones y advertencias

- Es un modelo de investigación pequeño; el propio autor indica que no pretende realismo ni paridad con audio grabado.
- El audio generado puede resultar inverosímil, repetitivo, fragmentado o parecerse al material de entrenamiento.
- Las grabaciones originales del dataset de Kaggle no se distribuyen con el paquete; solo se enlaza su procedencia.
- El paquete es de solo inferencia: no hay ruta de entrenamiento, ajuste fino ni subida de datos.
- Backend validado únicamente para Apple Silicon en local. Un despliegue en Linux o en un Space de HuggingFace exigiría un port de backend, comprobaciones de paridad numérica y validación por escucha.
- La generación de 3 s es arquitectónicamente compatible pero no ha superado una validación de escucha comparable a la de 1 s y 2 s; puede consumir mucho más tiempo y memoria.
- No procesa texto ni instrucciones: no se puede dirigir la salida con un prompt, solo con duración y semilla.
- La etiqueta de pipeline `audio-to-audio` en HuggingFace no se corresponde con el comportamiento real (generación incondicional), lo que puede confundir en integraciones automatizadas.
- Licencia MIT para código y pesos, lo que permite uso comercial; conviene revisar `LICENSE` y `NOTICE` del repositorio por la ascendencia de implementación, y considerar el etiquetado de contenido escatológico que exigen algunas tiendas de aplicaciones.
- Riesgo de sesgo y alucinación: no aplica en el sentido habitual de modelos de lenguaje, pero sí existe el riesgo de sobreajuste al material de entrenamiento y de producir salidas degeneradas.
- No hay garantía de estabilidad numérica entre plataformas distintas de Apple Silicon: la determinismo por semilla se declara solo "bajo el runtime fijado en la misma plataforma soportada".

## Enlaces

- Modelo en HuggingFace (mlx-community): https://huggingface.co/mlx-community/phartakos-mlx
- Repositorio de origen atribuido (pequodresearch): https://huggingface.co/pequodresearch/phartakos-mlx
- Organización mlx-community en HuggingFace: https://huggingface.co/mlx-community
- MLX Community (portal): https://mlxcommunity.com/
- Catálogo de modelos MLX Community: https://mlxcommunity.com/models
- Repositorio de MLX (ml-explore): https://github.com/ml-explore/mlx
- Dataset de origen, Fart Recordings Dataset (Alec Ledoux, Kaggle): https://www.kaggle.com/datasets/alecledoux/fart-recordings-dataset
- Ficheros de licencia y avisos incluidos en el repositorio: `LICENSE` y `NOTICE` en https://huggingface.co/mlx-community/phartakos-mlx/tree/main
