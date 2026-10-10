# groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations

## Resumen

MOSS-TTS-v1.5-Argentina-MLX-Quantizations es un paquete de cuantizaciones para Apple Silicon del modelo de sintesis de voz OpenMOSS-Team/MOSS-TTS-v1.5, adaptado al espanol de Argentina mediante un LoRA. Lo publica el usuario groxaxo bajo licencia Apache 2.0 y lo distribuye como un unico repositorio que agrupa ocho variantes de generador ya probadas junto con su codec de audio Q6 compartido. No es un checkpoint unico: la raiz del repositorio funciona como indice y cada variante vive en su propia carpeta dentro de la rama principal.

El problema que resuelve es doble. Por un lado, permite ejecutar un sistema TTS con condicionamiento de voz de referencia en equipos Mac con memoria unificada, algo inviable con los pesos BF16 originales; por otro, ofrece un estudio comparativo reproducible de ocho configuraciones de cuantizacion (Q4, Q5, Q6, Q8, mezclas oMLX y Q6/Q8 desde BF16) con medidas de WER en ingles y espanol. El tamano de pesos por variante va de 4,68 GB a 7,28 GB, mas 1,56 GB del codec compartido.

La relevancia actual esta en que todo el trabajo se ha realizado con la libreria mlx-audio y el framework MLX, con una instantanea de compatibilidad con licencia MIT incluida en el repositorio. El autor advierte explicitamente de que no existe un ganador universal de cuantizacion y de que no se ha realizado ninguna evaluacion MOS humana, por lo que las cifras deben leerse como un proxy automatico sobre un corpus muy pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema TTS de dos componentes: generador de tokens de audio mas codec/decodificador de audio; no se detalla la arquitectura interna en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (en las pruebas se menciona un techo de generacion de 400 tokens de audio) |
| Tipos de cuantizacion | Q4, Q5, Q6, Q8, mezclas oMLX (Q3/Q4/Q6, Q4/Q5/Q6, Q5/Q6, Q6 uniforme) y Q6/Q8 derivado de BF16 y de 8-bit; codec de audio Q6 |
| Idiomas soportados | es (espanol de Argentina), en (ingles) |
| Licencia | Apache 2.0 (la licencia del modelo base no se detalla en la informacion proporcionada) |
| Formato de pesos | safetensors para MLX, distribuidos en 319 shards por generador |
| Tarea | text-to-speech |
| Libreria | mlx-audio |
| Modelo base | OpenMOSS-Team/MOSS-TTS-v1.5 (relacion: quantized) |
| Tamano del repositorio | 36,0 GB declarados en HuggingFace; la clonacion o descarga completa ronda los 52 GB |
| Fecha de publicacion | 9 de octubre de 2026 (ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El paquete no introduce un entrenamiento nuevo. Se trata de una consolidacion de pesos cuantizados derivados de OpenMOSS-Team/MOSS-TTS-v1.5, a los que se ha aplicado un LoRA de identidad argentina. El sistema se organiza en dos piezas: un generador que produce codigos de audio a partir de texto y de codigos de condicionamiento de voz, y un codec/decodificador que convierte esos codigos en onda PCM. El codec Q6 es compartido por todas las variantes y ocupa 1,56 GB; el generador varia entre 4,68 GB y 7,28 GB segun la receta de cuantizacion. El proceso de codificacion de la voz de referencia sigue usando el codec original FP32 de OpenMOSS en un proceso separado, ya que la codificacion con el codec Q6 fallo con EOS en una de cada dos frases de prueba y no se considera validada para clonacion arbitraria.

La informacion de procedencia indica que los 319 shards por generador, los tokenizers, las configuraciones y las recetas se copiaron de revisiones publicas fijadas, con los mapeos y hashes registrados en `migration/source-files.json`. Los archivos `source-adapter/` de la variante Q5 se conservan dentro de `variants/q5/source-adapter/`. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

El estudio de evaluacion del 9 de octubre de 2026 aplica el metodo de fidelidad de ExperimentOS Chatterbox Turbo a ocho checkpoints MOSS y a una referencia oficial BF16 con el mismo LoRA argentino. En ingles se usaron tres frases fijas (51 palabras) con semilla 20261009, diez generaciones completas por perfil incluyendo cinco repeticiones en caliente, mas tres controles de decodificador por perfil. En espanol se usaron tres frases (65 palabras) con semilla 42, una generacion por frase y tres controles de decodificador por perfil. Las salidas controladas del decodificador son identicas byte a byte porque comparten codigos y codec, lo que no permite clasificar la fidelidad del generador ni validar la decodificacion Q6 contra el codec FP32 original.

## Capacidades

- Sintesis de voz en espanol de Argentina y en ingles a partir de texto.
- Condicionamiento por voz de referencia: el flujo incluido codifica un WAV de referencia en codigos y los usa como prompt para la generacion.
- Generacion no streaming con materializacion completa de la onda, apta para narracion de frases o parrafos cortos.
- Ocho recetas de cuantizacion intercambiables que permiten ajustar el compromiso entre tamano en disco y fidelidad medida por WER.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube ni de GPU NVIDIA.
- Compatibilidad con la API de `mlx_audio.tts.utils.load_model`, configurando `audio_tokenizer_pretrained_name_or_path` al codec Q6 del propio bundle.
- Scripts incluidos en el repositorio para instalar el runtime, codificar la referencia (`encode_reference.py`) y generar audio (`generate.py`).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada mas alla de la codificacion de referencia.

## Casos de uso

- Narracion de contenido en espanol rioplatense: el modelo genera voz con acento argentino a partir de texto plano, adecuado para audiolibros, articulos locutados o boletines de audio dirigidos al publico de Argentina y Uruguay.
- Atencion al cliente automatizada en Argentina: la variante q6-bf16 registra un WER en espanol del 3,1 por ciento, la cifra mas baja del estudio, lo que la hace la candidata natural para respuestas habladas en sistemas IVR o asistentes telefonicos.
- Accesibilidad en aplicaciones de escritorio para macOS: al ejecutarse con MLX sobre memoria unificada, permite integrar lectura en voz alta dentro de una app nativa sin enviar el texto del usuario a un servicio externo, algo relevante por privacidad.
- Doblaje y localizacion de material corto: el condicionamiento por voz de referencia permite mantener un timbre consistente entre frases, util para prototipos de doblaje con acento argentino antes de pasar a un estudio profesional.
- Locucion de avisos y notificaciones en productos digitales: la variante omlx-m346, con 4,68 GB, es la mas ligera y puede desplegarse en equipos con memoria unificada reducida para generar mensajes hablados bajo demanda.
- Material formativo y e-learning: la generacion local y sin coste por token permite producir pistas de audio para cursos y tutoriales en volumen, incluyendo voces de referencia concretas por curso.
- Investigacion sobre cuantizacion de modelos TTS: el bundle incluye recetas, manifiestos, tiempos en caliente y WER por variante, lo que sirve como punto de partida reproducible para estudiar el efecto de Q4/Q5/Q6 en fidelidad de voz.
- Pruebas de clonacion de voz con fines personales y no validados: el flujo permite codificar una referencia propia, pero el propio autor advierte que la clonacion arbitraria con el codec Q6 no esta validada, por lo que este uso queda restringido a experimentacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. El tiempo en caliente corresponde a generacion no streaming mas materializacion de onda, excluyendo carga de modelo, HTTP, reproduccion y ASR. El WER se calculo con Parakeet v3 ONNX INT8 en CPU local, con normalizacion Unicode NFC y casefold, sobre un corpus muy pequeno, por lo que es un proxy de ASR y no una medida de calidad percibida.

| Variante | Mezcla / historial | Pesos (GB) | Mediana en caliente, ingles (s) | WER ingles | WER espanol |
|---|---|---:|---:|---:|---:|
| q4 | Q4 mixto anterior | 5,55 | 20,958 | 37,3% | 13,8% |
| q5 | Q5 mixto anterior | 6,80 | 26,756 | 9,8% | 38,5% |
| q6-8bit | Q6/Q8 desde 8-bit | 7,28 | 10,264 | 45,1% | 50,8% |
| q6-bf16 | Q6/Q8 desde BF16 | 7,28 | 8,315 | 13,7% | 3,1% |
| omlx-m346 | oMLX Q3/Q4/Q6 | 4,68 | 20,739 | 58,8% | 15,4% |
| omlx-m456 | oMLX Q4/Q5/Q6 | 5,55 | 8,167 | 43,1% | 72,3% |
| omlx-m56 | oMLX Q5/Q6 | 6,41 | 15,328 | 45,1% | 13,8% |
| omlx-q6 | oMLX Q6 uniforme | 6,90 | 15,733 | 27,5% | 6,2% |

Advertencias del propio autor sobre estas cifras: los tiempos en caliente no constituyen una clasificacion justa de throughput porque las longitudes generadas difieren; 42 de 90 generaciones en ingles quedaron cerca del techo de 400 tokens sin filtrar repeticiones ni truncamientos; las variantes Q3/Q4/Q6 recortaron 8 de 10 salidas en ingles, mientras que Q4/Q5/Q6 y Q5/Q6 recortaron 2 de 10 cada una; las amplitudes se registraron antes del recorte PCM16. Una revalidacion independiente con Q6 uniforme midio 8,288 s de mediana (rango 8,227-8,334 s), lo que ilustra la variabilidad temporal. No hay evaluacion MOS humana ni afirmacion de equivalencia de calidad.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. La libreria declarada es mlx-audio sobre MLX, por lo que no hay soporte para GPU NVIDIA ni AMD en este bundle.
- Memoria estimada para inferencia: peso del generador mas 1,56 GB del codec Q6 mas overhead de runtime. Como referencia, la variante mas ligera (omlx-m346, 4,68 GB) necesitaria del orden de 8-10 GB de memoria unificada, y la mas pesada (q6-8bit o q6-bf16, 7,28 GB) del orden de 12-14 GB.
- Equipos recomendados: Mac con chip de la familia M y al menos 16 GB de memoria unificada para las variantes Q4 y oMLX mixtas; 24 GB o mas para q6-bf16 y q6-8bit con margen para el sistema y el proceso separado de codificacion de referencia.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, no hay ruta de ejecucion declarada para CUDA en este bundle.
- Opciones de despliegue: `mlx_audio.tts.utils.load_model` sobre la carpeta de la variante elegida, con `model.config.audio_tokenizer_pretrained_name_or_path` apuntando al codec Q6. Se incluye un runtime de compatibilidad con licencia MIT y los scripts `install_runtime.py`, `encode_reference.py` y `generate.py`. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia observada: medianas en caliente de 8,167 s (omlx-m456) a 26,756 s (q5) en ingles, con la advertencia de que las longitudes generadas difieren y de que la actividad de fondo del escritorio, los cambios de energia y el paginado de BF16 confunden la comparacion.
- Throughput: no disponible como metrica normalizada (tokens o segundos de audio por segundo de proceso); solo hay tiempos absolutos por generacion.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de parametros, contexto ni rendimiento de alternativas comparables. La busqueda web realizada no devolvio ningun resultado relevante sobre modelos TTS; los unicos resultados obtenidos eran contenido no relacionado con el ambito del modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations (q6-bf16) | no disponible | no disponible | WER EN 13,7%; WER ES 3,1%; 8,315 s de mediana en caliente | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| OpenMOSS-Team/MOSS-TTS-v1.5 | no disponible | no disponible | no disponible (referencia BF16 con LoRA argentino, sin resultado comparable end-to-end en espanol) | no disponible | Modelo base publico |
| Chatterbox Turbo | no disponible | no disponible | no disponible (usado unicamente como metodo de fidelidad y como VoiceEncoder de comparacion, no como modelo evaluado) | no disponible | No evaluado en este estudio |
| Parakeet v3 ONNX INT8 | no disponible | no disponible | no disponible (usado como herramienta ASR para calcular WER, no como modelo comparado) | no disponible | Herramienta de evaluacion |

Comparativa interna entre las variantes mas relevantes del propio bundle:

| Variante | Pesos (GB) | WER ES | WER EN | Mediana en caliente, ingles (s) |
|---|---:|---:|---:|---:|
| q6-bf16 | 7,28 | 3,1% | 13,7% | 8,315 |
| omlx-q6 | 6,90 | 6,2% | 27,5% | 15,733 |
| q4 | 5,55 | 13,8% | 37,3% | 20,958 |
| omlx-m346 | 4,68 | 15,4% | 58,8% | 20,739 |

## Limitaciones y advertencias

- El repositorio no es un checkpoint unico: pasar el identificador pelado del bundle a `mlx_audio.load_model` es incorrecto. Hay que seleccionar una carpeta de variante y descargar tambien el codec Q6.
- La clonacion de voz arbitraria con el codec Q6 no esta validada: la codificacion de referencia con ese codec fallo con EOS en una de dos frases, por lo que el flujo de referencia usa el codec FP32 original en un proceso separado.
- No existe evaluacion MOS humana. Todas las cifras de calidad son proxies automaticos y el autor niega explicitamente cualquier afirmacion de equivalencia general de calidad o de ganador universal de cuantizacion.
- El corpus de evaluacion es muy pequeno: tres frases en ingles (51 palabras) y tres en espanol (65 palabras). El WER calculado con Parakeet v3 ONNX INT8 es un proxy de ASR, no una medida perceptual.
- Las comparaciones de velocidad no son fiables como ranking de throughput: las longitudes generadas difieren, la actividad de fondo del escritorio y los cambios de energia afectan, y la referencia BF16 en espanol requirio procesos separados de generacion y decodificacion, sin resultado comparable end-to-end.
- Se observaron problemas de repeticion y truncamiento: 42 de 90 generaciones en ingles quedaron cerca del techo de 400 tokens y no se filtraron. Varias variantes recortaron salidas por saturacion de amplitud (Q3/Q4/Q6 en 8 de 10 casos; Q4/Q5/Q6 y Q5/Q6 en 2 de 10 cada una).
- No se distribuyen grabaciones de referencia privadas ni los codigos de condicionamiento de voz empleados en el estudio.
- Compatibilidad fragil: el repositorio incluye una instantanea de compatibilidad con licencia MIT porque no se afirma que una version sin modificar publicada en PyPI reproduzca esta configuracion.
- Licencia Apache 2.0 para el bundle, pero la licencia del modelo base OpenMOSS-Team/MOSS-TTS-v1.5 no se detalla en la informacion proporcionada; conviene verificarla antes de un uso comercial en produccion.
- Soporte limitado a espanol de Argentina e ingles. No se declara cobertura de otras variantes del espanol ni de otros idiomas.
- La model card advierte de que los resultados publicos son un resumen numerico y graficas independientes; la evidencia completa esta archivada en el repositorio ExperimentOS del autor.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Indice de variantes (`variants.json`): https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/blob/main/variants.json
- Variante q4: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/q4
- Variante q5: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/q5
- Variante q6-8bit: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/q6-8bit
- Variante q6-bf16: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/q6-bf16
- Variante omlx-m346: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/omlx-m346
- Variante omlx-m456: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/omlx-m456
- Variante omlx-m56: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/omlx-m56
- Variante omlx-q6: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/variants/omlx-q6
- Codec Q6 compartido: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/tree/main/codec/q6
- Mapeo de ficheros de origen y hashes (`migration/source-files.json`): https://huggingface.co/groxaxo/MOSS-TTS-v1.5-Argentina-MLX-Quantizations/blob/main/migration/source-files.json
- Evidencia completa del estudio (ExperimentOS): https://github.com/groxaxo/experimentos/tree/main/moss-tts-mlx/chatterbox-fidelity-2026-10-09
