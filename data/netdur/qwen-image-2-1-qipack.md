# netdur/Qwen-Image-2.1-QIPACK

## Resumen

Qwen-Image-2.1-QIPACK es un repositorio de pesos convertidos del transformador de Qwen-Image-2.1, empaquetados en el formato QIPACK para el runtime nativo `qwen-image-cplus`, escrito en C+ y Metal, orientado a inferencia de generacion de imagenes en Apple Silicon. No es un modelo entrenado desde cero ni un fine-tune nuevo: es una redistribucion modificada de los pesos originales de `Qwen/Qwen-Image-2.1` y de la variante destilada `Viggle/Qwen-Image-2.1-viggle-turbo`, con el layout de almacenamiento de tensores y los dtypes de matriz adaptados al runtime. Lo publica el usuario netdur, autor tambien del runtime mencionado.

El repositorio incluye dos packs: un pack base derivado de Qwen-Image-2.1 (politica de generacion por defecto de 40 pasos con TaylorSeer) y un pack destilado derivado de Viggle v0.1 de cuatro pasos (sin cache, con schedule unstretched). Cada pack contiene 297 tensores y 7.115.124.736 parametros en el transformador, con las 224 matrices de los bloques transformer almacenadas en FP16 y los vectores mas nueve tensores globales en BF16, bajo la version 1 de QIPACK1 con la politica `transformer:all-matrix-f16-v4`. Ambos packs superaron verificacion de ida y vuelta exacta contra sus tensores de origen.

Su relevancia es acotada pero concreta: permite ejecutar el transformador de Qwen-Image-2.1 en Macs con Apple Silicon mediante un runtime propio, sin depender de stacks de Python, y con un pack destilado que reduce la generacion a cuatro pasos. El propio autor advierte que el repositorio contiene solo los pesos del transformador, no el pipeline completo: el processor, el text encoder, el VAE, el tokenizer y el scheduler siguen descargandose del snapshot upstream de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusion para text-to-image (detalle de capas interno no disponible) |
| Parametros totales | 7.115.124.736 por pack (297 tensores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; el contexto del text encoder no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | FP16 en las 224 matrices de bloque transformer; BF16 en vectores y 9 tensores globales |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License Agreement (etiquetada como `other`), solo investigacion y evaluacion no comercial |
| Formato de pesos | QIPACK (QIPACK1, version 1, extension `.qipack`), metadatos little-endian fijos con checksums por tensor y de payload |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna de Qwen-Image-2.1 mas alla de que se trata de un transformador de difusion para generacion de imagenes a partir de texto. Lo que si se concreta es la estructura de serializacion: cada pack QIPACK contiene 297 tensores, entre ellos 224 matrices pertenecientes a los bloques transformer y nueve tensores globales, con metadatos fijos en little-endian, checksums por tensor y de payload, y verificacion de round-trip exacta frente a los tensores de origen. La politica de empaquetado es `transformer:all-matrix-f16-v4`.

No hubo entrenamiento ni reentrenamiento por parte de este proyecto: los valores aprendidos y la arquitectura proceden de los modelos originales. El pack base deriva de `Qwen/Qwen-Image-2.1` (revision `b3179ad355be050328e483a9dfdd9e60cd62adfa`, 40 pasos por defecto con TaylorSeer) y el pack destilado de `Viggle/Qwen-Image-2.1-viggle-turbo` (revision `bafc91e4cc934f5fb1406b22496a0bed9b99c548`, cuatro pasos, sin cache, schedule unstretched). Se trata especificamente del transformador completo de cuatro pasos de Viggle v0.1, no de su LoRA ni de la version v0.2.1 de seis pasos. No se indica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO, por lo que esos datos quedan como no disponibles.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 1024x1024 mediante el runtime `qwen-image-cplus`.
- Generacion en dos regimenes: calidad con el pack base (40 pasos, TaylorSeer) y baja latencia con el pack destilado (4 pasos).
- Seleccion automatica de la politica de generacion (numero de pasos, comportamiento terminal-shift y politica de cache) a partir de los metadatos del propio pack cuando se omiten los argumentos de CLI.
- Salida en PNG.
- Separacion de componentes: el transformador empaquetado se combina con processor, text encoder, VAE, tokenizer y scheduler descargados aparte del snapshot upstream.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo de lenguaje, sino un transformador de difusion.

## Casos de uso

- Generacion de imagenes en local en un Mac: un desarrollador con un M1 Max de 32 GB puede producir PNG de 1024x1024 sin conexion ni servicios en la nube, usando el runtime nativo en C+ y Metal.
- Prototipado rapido de conceptos visuales: con el pack destilado de cuatro pasos, se puede iterar sobre prompts (por ejemplo, carteles o ilustraciones) en tiempos de decenas de segundos por imagen, lo que facilita explorar variaciones antes de fijar una direccion.
- Investigacion en eficiencia de inferencia: el pack base de 40 pasos y el destilado de 4 pasos permiten comparar calidad frente a latencia sobre el mismo transformador y la misma GPU integrada.
- Evaluacion de formatos de pesos para Apple Silicon: el formato QIPACK, con checksums y round-trip verificado, sirve como caso de estudio para empaquetado de tensores en Metal sin capas de Python.
- Integracion en flujos creativos de escritorio: al ejecutarse con un binario nativo y ficheros locales, encaja en herramientas de diseno que quieran generar imagenes bajo demanda sin dependencias de runtime pesadas.
- Validacion de pipelines separados por componentes: util para equipos que quieran sustituir unicamente el transformador (por ejemplo, el destilado de cuatro pasos) manteniendo text encoder, VAE y scheduler del upstream.
- Pruebas de reproducibilidad: los hashes SHA-256 publicados para cada pack permiten verificar la integridad de la descarga en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU, etc.) en la informacion disponible. El unico dato de rendimiento reportado es una referencia del propio autor, correspondiente a una unica maquina y un unico prompt, no a una garantia de rendimiento general.

| Medicion | Valor | Condiciones |
|---|---|---|
| Generacion de PNG 1024x1024 extremo a extremo | aproximadamente 38-39 segundos | M1 Max de 32 GB, ruta destilada Viggle de 4 pasos, un unico prompt |
| Pasos del pack base | 40 pasos, TaylorSeer | Qwen-Image-2.1 original |
| Pasos del pack destilado | 4 pasos, sin cache, schedule unstretched | Viggle v0.1 four-step full transformer |

## Requisitos de hardware

- Sistema operativo: macOS 14 o superior sobre Apple Silicon.
- Memoria unificada: el runtime se ha validado en un M1 Max con 32 GB. Las maquinas con menos memoria no han sido validadas por el autor.
- Tamano en disco: el repositorio ocupa 28,5 GB e incluye los dos packs (base y destilado); cada pack ronda los 14 GB al almacenar la mayoria de matrices en FP16.
- GPU compatibles: Apple Silicon (M1 Max validado); no se especifican otros chips. No se contemplan GPU NVIDIA ni AMD en esta informacion.
- Resolucion soportada: 1024x1024. La ruta nativa de 2048x2048 del modelo no esta soportada todavia por el runtime.
- Opciones de despliegue: exclusivamente el runtime `qwen-image-cplus` v0.0.1 o superior. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia: aproximadamente 38-39 segundos para una imagen 1024x1024 con el pack destilado de cuatro pasos en M1 Max. No se publica throughput agregado ni latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Pasos | Licencia | Notas |
|---|---|---|---|---|---|
| netdur/Qwen-Image-2.1-QIPACK | 7.115.124.736 (transformador por pack) | QIPACK1 v1 (.qipack) | 40 (base) / 4 (destilado) | Qwen Research (no comercial) | Solo pesos del transformador; requiere componentes upstream y runtime propio |
| Qwen/Qwen-Image-2.1 | No disponible | No disponible | 40 pasos con TaylorSeer por defecto | Qwen Research | Modelo original del que deriva el pack base |
| Viggle/Qwen-Image-2.1-viggle-turbo | No disponible | No disponible | 4 pasos | No disponible en la informacion proporcionada | Variante destilada de la que deriva el pack destilado (v0.1, no v0.2.1) |

No se dispone de datos para comparar con otros empaquetados para Apple Silicon (por ejemplo, MLX o Core ML) ni con modelos text-to-image de otras familias, por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Solo contiene los pesos del transformador: no es un pipeline completo. Sin el processor, el text encoder, el VAE, el tokenizer y el scheduler del snapshot upstream, no genera imagenes.
- Licencia restrictiva: la Qwen Research License Agreement permite unicamente investigacion y evaluacion no comercial salvo que se obtenga una licencia comercial separada de Qwen. La licencia MIT del codigo del runtime no sustituye ni relaja la licencia del modelo.
- Compatibilidad limitada: requiere macOS 14 o superior en Apple Silicon y el runtime `qwen-image-cplus` v0.0.1 o superior. No hay soporte documentado para otros sistemas o aceleradores.
- Memoria: validado solo en M1 Max de 32 GB; el comportamiento en equipos con menos memoria unificada no esta verificado.
- Resolucion: la ruta nativa de 2048x2048 no esta soportada por el runtime en esta version; el maximo documentado es 1024x1024.
- Datos de rendimiento escasos: la cifra de 38-39 segundos proviene de una sola maquina, un solo prompt y la ruta de cuatro pasos, sin condiciones de reproducibilidad publicas en la informacion disponible.
- Version concreta del pack destilado: corresponde al transformador completo de cuatro pasos de Viggle v0.1, no a su LoRA ni a la version v0.2.1 de seis pasos; usar otra variante exigiria un empaquetado distinto.
- Sesgos y alucinacion visual: no se documentan sesgos conocidos ni tasas de error en la informacion proporcionada; al ser un modelo de difusion, la fidelidad al prompt y los sesgos heredados del modelo original no se cuantifican aqui.
- Idiomas de los prompts: no disponibles; el rendimiento multilingue no esta documentado.
- Adopcion nula en el momento del registro: el repositorio figura con 0 descargas y 0 likes, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/netdur/Qwen-Image-2.1-QIPACK
- Runtime `qwen-image-cplus`: https://github.com/netdur/qwen-image-cplus
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo destilado de origen: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Licencia del modelo (Qwen Research License Agreement): LICENSE (incluida en el repositorio)
- Atribucion del modelo destilado: NOTICE (incluido en el repositorio)
