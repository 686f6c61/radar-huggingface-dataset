# ricecake/krea2-anime-capgen

## Resumen

krea2-anime-capgen es una herramienta de generación de leyendas (captions) para el entrenamiento de modelos de difusión de anime, publicada por el usuario ricecake en Hugging Face. No es un modelo neuronal: es un generador procedural que, a partir de un conjunto de etiquetas de Danbooru (por ejemplo `beach`, `bikini`, `cat ears`), compone descripciones textuales completas en el estilo de las captions de entrenamiento empleadas por los modelos Krea 2 Anime-tuned (`anime illustration of ..., comma phrases, ...`).

El sistema funciona exclusivamente en CPU con Python y numpy, sin dependencias de LLM, pyarrow ni ficheros pickle, y ocupa 0,4 GB en el repositorio. Cada caption se ensambla a partir de grupos de frases completas extraídas de captions de entrenamiento reales, lo que produce textos sintácticamente coherentes y alineados con la distribución del dataset original. El modelo se distribuye bajo licencia MIT y está pensado como utilidad auxiliar dentro del ecosistema de entrenamiento de LoRAs y checkpoints de anime.

Su relevancia actual radica en que automatiza una tarea tediosa del pipeline de fine-tuning (la generación de captions variadas y consistentes a partir de etiquetas) sin coste de GPU ni dependencia de APIs externas, y con control explícito sobre longitud, variedad, exclusiones y trazabilidad de cada frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador procedural basado en plantillas y grupos de frases; sin red neuronal ni LLM |
| Parametros totales | no disponible (no aplica; no es un modelo neuronal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre listas de etiquetas) |
| Tipos de cuantizacion | no disponible (no aplica; no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (las captions se generan en ingles, segun los ejemplos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; ficheros de datos propios junto a `capgen.py`, descritos en `RUNTIME.json` con tamano y sha256) |

## Arquitectura y entrenamiento

No se trata de un transformer ni de un modelo generativo entrenado con descenso de gradiente. El sistema es un ensamblador de captions que recombina grupos de frases completas procedentes de captions de entrenamiento reales del dataset Krea 2 Anime-tuned. La generacion se controla mediante varios parametros: `n` (numero de captions distintas), `length` (`long`, `medium`, `short`), `seed` (reproducibilidad), `wild` y `beta` (control de sorpresa frente a plausibilidad mediante ponderacion de compatibilidad y rechazo de conflictos), `order` (`template` o `facet`), `mix_look` (combinar rasgos de pelo, ojos y cuerpo de tres captions distintas) y `distinct_donor_chars` (un personaje nombrado aporta como maximo una parte de la caption).

El modelo tambien incorpora logica de comprension de etiquetas: acepta etiquetas generales, personajes (`kanami (strinova)`) y series (`blue archive`, que selecciona un personaje distinto de esa serie por caption cuando existen personajes de entrenamiento). Distingue etiquetas de artista y meta (como `highres`), que descarta y reporta en `dropped`, y solicitudes no soportadas (como `2girls`), que rechaza con aviso. Los datos de entrenamiento subyacentes son imagenes solo de un personaje, mayoritariamente `1girl`, y el autor advierte que `1boy` dispone de muchos menos datos. No se documenta el numero de tokens ni la composicion exacta del dataset.

## Capacidades

- Generacion de captions de entrenamiento para anime en estilo Krea 2 Anime-tuned a partir de etiquetas de Danbooru.
- Produccion de multiples captions distintas para el mismo conjunto de etiquetas (`n` configurable), con longitudes corta, media y larga.
- Comprension de etiquetas con guion bajo o espacios (`cat_ears` equivale a `cat ears`).
- Soporte de personajes con nombre y de series (un personaje distinto de la serie por caption).
- Exclusiones mediante prefijo `-` (por ejemplo `-white background`, `-simple background`), aplicables a etiquetas y palabras.
- Autocompletado de etiquetas con categoria de Danbooru, recuento de entrenamiento y recuento de posts (`suggest_info`, `suggest`).
- Diagnostico de como se ha interpretado cada entrada (`describe`), con tipos como `tag`, `char`, `series`, `dropped`, `rejected`, `raw` o `exclude`.
- Trazabilidad opcional de la fuente de cada fragmento (`explain=True`, `s.explain_text()`).
- Control de variedad y plausibilidad (`wild`, `beta`), orden de frases (`template`, `facet`) y mezcla de rasgos (`mix_look`).
- Gestion de marcas sobre la imagen (marca de agua, firma de artista, texto en esquina, logo) y de texto sobre objetos de la escena (`overlay_text`, `scene_text`).
- Ejecucion en CPU con Python y numpy, con carga en aproximadamente 5 segundos y menos de 1 GB de RAM.
- Interfaz de linea de comandos equivalente a la API de biblioteca.

## Casos de uso

- Generacion masiva de captions para entrenar LoRAs de personajes: dado un conjunto de etiquetas que describen al personaje, el generador produce decenas de captions variadas con una semilla fija, lo que reduce el coste manual de anotacion y mantiene el estilo del dataset base.
- Preparacion de datasets para fine-tuning de checkpoints de anime: se pueden generar captions en tres longitudes para experimentar con la longitud optima de texto durante el entrenamiento, sin necesidad de GPU.
- Aumento de datos con control de sesgo: las exclusiones (`-white background`, `-simple background`) permiten eliminar patrones repetitivos del dataset original y reducir el sesgo hacia fondos simples.
- Integracion en ComfyUI: el nodo personalizado `ComfyUI-Krea2-Anime-Capgen` permite autocompletar etiquetas y generar captions dentro del propio flujo de trabajo de generacion de imagenes, con descarga automatica del repositorio en el primer uso.
- Exploracion de series y personajes: al pasar una serie (`blue archive`), el generador selecciona un personaje distinto por caption, util para crear datasets balanceados de una franquicia.
- Auditoria de datasets: `describe` y `explain_text()` permiten verificar que etiquetas se han descartado, rechazado o insertado en crudo, lo que facilita la depuracion de listas de etiquetas antes de un entrenamiento.
- Prototipado rapido en entornos sin GPU: al ejecutarse solo con numpy en CPU, puede desplegarse en un portatil o en un contenedor ligero para generar captions de prueba en segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el sistema se ejecuta en CPU y no utiliza GPU.
- RAM: menos de 1 GB durante la carga, segun la model card.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier equipo consumer: si, siempre que disponga de Python 3 y numpy (probado con Python 3.12 y numpy 2.5).
- Opciones de despliegue: uso como biblioteca Python (anadiendo el directorio del repositorio a `sys.path`), linea de comandos (`python capgen.py`) y nodo personalizado de ComfyUI. No se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de red neuronal.
- Latencia y throughput: tiempo de carga de aproximadamente 5 segundos; no se especifican cifras de generacion por caption en la informacion disponible.
- Espacio en disco: 0,4 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krea2-anime-capgen | Generador procedural de captions (CPU, numpy) | no aplica | no aplica | MIT | Hugging Face, ComfyUI |
| Krea 2 Anime-tuned Turbo | Modelo de difusion de anime (checkpoint) | no disponible | no disponible | no disponible | Hugging Face (ricecake) |
| Krea 2 Anime-tuned Raw | Modelo de difusion de anime (checkpoint) | no disponible | no disponible | no disponible | Hugging Face (ricecake) |
| Krea2-Anime v1.5 (Civitai) | Checkpoint de anime para difusion | no disponible | no disponible | no disponible | Civitai |

La comparativa directa con generadores de captions basados en LLM no esta disponible en la informacion proporcionada; la diferencia principal es que krea2-anime-capgen no emplea inferencia neuronal y, por tanto, no compite en calidad linguistica general, sino en fidelidad al estilo de caption del dataset Krea 2 Anime.

## Limitaciones y advertencias

- Solo genera captions de un unico personaje: las peticiones multi-personaje (`2girls`, `multiple girls`) se rechazan con aviso, y `1boy` dispone de muchos menos datos de entrenamiento.
- Las entradas no vistas en entrenamiento (ni etiqueta, ni alias, ni personaje, ni serie) no se comprenden y se insertan literalmente como frase, quedando registradas en `s.raw`.
- Las etiquetas de artista y meta (como `highres`) se descartan siempre y se reportan en `s.dropped`.
- Las exclusiones no funcionan sobre personajes, series ni `1boy` (se registra `exclude_unsupported`), y una exclusion contenida en una etiqueta requerida se rechaza porque prevalece el requisito.
- Sesgo documentado por el autor: las captions auto-generadas contienen con frecuencia `white background` y tienden hacia la calificacion s de Danbooru (aproximadamente R-12 a R-15). No existe filtro de calificacion; el sesgo debe corregirse manualmente con exclusiones.
- La instancia de `Generator` no es segura para hilos: es necesario sincronizar `generate()` y `describe()` si se comparte entre hilos.
- No hay garantia de coherencia semantica global mas alla de la compatibilidad entre grupos de frases; el texto generado puede resultar repetitivo o poco natural en combinaciones de etiquetas poco frecuentes.
- La licencia MIT permite uso comercial, pero el contenido generado hereda los sesgos del dataset de entrenamiento subyacente, por lo que su uso en produccion requiere revision editorial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricecake/krea2-anime-capgen
- Demo (Hugging Face Space): https://huggingface.co/spaces/ricecake/krea2-anime-capgen
- Modelo relacionado Krea 2 Anime-tuned Turbo: https://huggingface.co/ricecake/Krea-2-Anime-tuned-Turbo
- Modelo relacionado Krea 2 Anime-tuned Raw: https://huggingface.co/ricecake/Krea-2-Anime-tuned-Raw
- Nodo personalizado para ComfyUI: https://github.com/ricecake000/ComfyUI-Krea2-Anime-Capgen
- Krea2-Anime v1.5 en Civitai: https://civitai.red/models/2908999/krea2-anime?modelVersionId=3310477
- Etiqueta Krea2 en Civitai: https://civitai.com/tag/krea2
