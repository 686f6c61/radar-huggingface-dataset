# Itsuki-music/TASTE

## Resumen

TASTE es un sistema de generacion de musica simbolica (MIDI) para piano solista a partir de descripciones textuales. Lo desarrolla un equipo academico encabezado por Mingyang Yao, con coautoria de Jingyue Huang, Ke Chen, Taylor Berg-Kirkpatrick y Shlomo Dubnov, vinculados a la Universidad de California en San Diego. El modelo se publica en Hugging Face bajo el identificador `Itsuki-music/TASTE` y se acompana de un paper en arXiv (2610.15960), un repositorio de codigo y un dataset propio.

El sistema no genera audio directamente, sino partituras MIDI. La entrada combina seis etiquetas (tags) de estilo o taxonomia, un plan de secciones y una descripcion libre de imagenes o atmosferas. La arquitectura es hibrida: un modelo autorregresivo (AR) como generador principal, un transformer de difusion (DiT) como etapa alternativa con pesos EMA, un codec VAE de ventana (`window_vae`) que tokeniza la musica simbolica y varios modulos auxiliares (sondas de estructura y de tags, banco de recuperacion de imagenes y un transcriptor audio-a-MIDI basado en Transkun).

Su relevancia radica en el enfoque "taxonomy-aware": el control de la generacion no se delega solo al texto libre, sino que se estructura mediante etiquetas y un plan de secciones, lo que facilita el control musical a nivel estructural. El repositorio ocupa 11,5 GB e incluye todos los checkpoints intermedios de las distintas fases de entrenamiento, no solo el modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: modelo autorregresivo (AR) principal y transformer de difusion (DiT) alternativo, con codec VAE de ventana para tokenizacion simbolica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y joblib) |
| Idiomas soportados | no disponible (las entradas textuales se describen en el paper; la model card no especifica idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors, joblib |

## Arquitectura y entrenamiento

TASTE combina dos rutas de generacion sobre una representacion simbolica comun. La ruta principal es un modelo autorregresivo que genera secuencias de tokens MIDI; la ruta alternativa es un DiT que opera sobre el espacio latente del codec `window_vae`, un VAE de ventana con su propio vocabulario de tokens (351 MB). El repositorio incluye checkpoints de varias fases de entrenamiento del modelo AR (`pretrain`, `large_public`, `curated` y `high_quality`), lo que sugiere un curriculum por etapas: preentrenamiento, ampliacion con datos publicos, curacion y refinamiento final de alta calidad. El checkpoint final AR ocupa 2,4 GB y el DiT final (con pesos EMA) 1,5 GB.

El control de la generacion se articula mediante seis tags de taxonomia, un plan de secciones y una descripcion libre de imagenes. Para ello el sistema incorpora una sonda de estructura de secciones (7 MB) y sondas de tags junto con un banco de recuperacion de imagenes (254 MB). Tambien se incluyen los pesos de Transkun (54 MB) para transcripcion audio-a-MIDI. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion debe consultarse en el paper.

## Capacidades

- Generacion de MIDI de piano solista a partir de texto.
- Control estructurado mediante seis tags de taxonomia, un plan de secciones y una descripcion libre de imagenes.
- Generacion condicionada por secciones, lo que permite planificar la forma musical (introduccion, desarrollo, etc.).
- Dos modos de generacion: autorregresivo (AR) y diffusion transformer (DiT).
- Tokenizacion y decodificacion de musica simbolica mediante el codec `window_vae`.
- Analisis de estructura de secciones mediante sonda dedicada.
- Recuperacion de imagenes asociadas a descripciones mediante banco de recuperacion.
- Transcripcion audio-a-MIDI mediante los pesos de Transkun incluidos.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento explicito.

## Casos de uso

- Composicion asistida de piano solista: el usuario aporta seis tags de estilo, un plan de secciones y una descripcion de atmosfera; el modelo AR genera un MIDI completo que puede editarse en un DAW. Es adecuado porque el control por tags y secciones reduce la deriva estilistica frente a la generacion solo por texto.
- Prototipado rapido de ideas musicales: generar bocetos MIDI en segundos para evaluar direcciones creativas antes de invertir tiempo en orquestacion o produccion.
- Generacion de bandas sonoras para videojuegos o audiovisual: el plan de secciones permite alinear la pieza con la estructura de una escena (inicio, tension, resolucion) y la descripcion de imagenes facilita ajustar la atmosfera.
- Investigacion en generacion musical simbolica: los checkpoints intermedios (`pretrain`, `large_public`, `curated`, `high_quality`) permiten estudiar el efecto de cada fase de entrenamiento y reproducir experimentos del paper.
- Entrenamiento y evaluacion de modelos de transcripcion: los pesos de Transkun incluidos permiten convertir audio a MIDI y usar ese resultado como entrada o como referencia para comparar con la generacion del modelo.
- Datos sinteticos para educacion musical: generar ejercicios de piano con estructura controlada y etiquetas de estilo para practicar analisis formal o armonico.
- Exploracion de control condicionado por taxonomia: usar las sondas de tags y el banco de recuperacion de imagenes para estudiar como el texto libre se traduce en decisiones musicales concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint AR final ocupa 2,4 GB y el DiT final 1,5 GB en disco; el repositorio completo ocupa 11,5 GB. El espacio en VRAM depende del framework y de la precision, y no se especifica en la model card.
- No se indica en la informacion disponible una estimacion de VRAM para inferencia.
- No se indican GPU recomendadas (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Por el tamano de los checkpoints, es plausible que quepan en GPU de consumo, pero no hay confirmacion oficial en la informacion proporcionada.
- Opciones de despliegue: el autor documenta el uso mediante el comando `python -m taste.inference.sample_ar` del repositorio de codigo, con descarga de pesos via `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion de musica simbolica condicionada por texto con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ambito restringido: el modelo genera exclusivamente piano solista en formato MIDI; no produce audio ni otros instrumentos.
- Dependencia de la taxonomia: el control se apoya en seis tags y un plan de secciones; fuera de ese esquema el comportamiento puede degradarse.
- No se documentan los sesgos del dataset de entrenamiento ni su composicion, por lo que no es posible evaluar sesgos estilisticos o culturales.
- Riesgo de alucinacion musical: al ser un modelo generativo, puede producir pasajes musicalmente incoherentes o inconsistentes con el plan de secciones solicitado.
- No se especifican los idiomas soportados para la descripcion textual; conviene verificar en el paper antes de usarlo en produccion con textos en castellano.
- No hay datos publicados de benchmarks ni de rendimiento en produccion.
- La licencia MIT permite uso comercial, pero debe revisarse la licencia del dataset y de los pesos de Transkun incluidos, que pueden tener condiciones propias.
- El repositorio incluye checkpoints intermedios y modulos auxiliares; es necesario seleccionar correctamente el checkpoint (`ar/high_quality` para el modelo principal) para evitar usar pesos no finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Itsuki-music/TASTE
- Paper en arXiv: https://arxiv.org/abs/2610.15960
- Repositorio de codigo: https://github.com/AndyWeasley2004/TASTE
- Dataset: https://huggingface.co/datasets/Itsuki-music/TASTE
