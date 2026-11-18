# Infatoshi/phonon-refiner-1.7b

## Resumen

Phonon refiner 1.7B es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por Infatoshi, que actúa como la etapa de corrección dentro de Phonon, una aplicación local de dictado por voz. El sistema transcribe audio con Parakeet TDT 0.6B v2 y este modelo reescribe la transcripción cruda en el texto que el hablante pretendía escribir: corrige palabras y términos técnicos mal reconocidos, elimina muletillas y falsos arranques, y da formato segun el modo de escritura de la aplicación destino.

El modelo es relevante porque aborda un problema practico y acotado —la posprocesado de ASR— con un modelo pequeno (1.728.801.536 parametros) que puede ejecutarse en local. Esta revision concreta es el "context refiner" (nombre de investigacion `s3d_ctx6_s1`): ademas del modo de escritura y el vocabulario del usuario, su prompt puede incluir el texto en pantalla y el texto previo al cursor, lo que le permite deletrear un termino que esta viendo o continuar una frase ya empezada.

Se distribuye en dos formatos cuantizados (GGUF Q4_K_S y MLX 4-bit) derivados del mismo modelo bf16 ajustado, con licencia LFM Open License v1.0 y soporte unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de LiquidAI/LFM3-1.7B; LFM3 es una familia de modelos Liquid AI, detalles de arquitectura no incluidos en la informacion disponible) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_S (embeddings y cabeza en 4 bits); MLX 4-bit g64 con atencion en 6 bits y embeddings en 8 bits |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base LiquidAI/LFM3-1.7B, del que no se detallan en la informacion disponible ni la arquitectura interna ni el volumen de datos de preentrenamiento. El ajuste se orienta a una tarea concreta de reescritura de transcripciones: recibe un prompt con un turno de sistema fijo, una linea de modo de escritura (una de cuatro definidas en `phonon_refiner.json`) y, de forma opcional y en orden, lineas de vocabulario del hablante, texto en pantalla (primeras 350 palabras, espacios colapsados) y texto previo al cursor (ultimas 40 palabras). El turno de usuario contiene la transcripcion cruda.

El entrenamiento uso exclusivamente datos publicos y sinteticos: no se emplearon dictados personales, diccionarios ni reuniones reales, y la unica personalizacion es la linea de vocabulario del prompt. La decodificacion recomendada es greedy, sin penalizacion de repeticion, con un maximo de 1,5 veces los tokens de la transcripcion mas 32 tokens nuevos, y con el modo de pensamiento desactivado (`enable_thinking: false`, `<think></think>` tras la cabecera del asistente). Incluye un drafter de decodificacion especulativa DFlash2 entrenado sobre salidas de una version anterior; el motor valida cada token propuesto contra la eleccion greedy del modelo, por lo que afecta a la velocidad y no al texto generado. El GGUF distribuido contiene 287 de 287 tensores identicos en bytes al usado en la evaluacion, y en 396 peticiones sinteticas la salida greedy de llama.cpp coincidio en 396 casos con la evaluada; los pesos MLX coincidieron con el GGUF en 282 de esas mismas peticiones.

## Capacidades

- Correccion de transcripciones ASR: arregla palabras y terminos tecnicos mal reconocidos manteniendo el vocabulario y el estilo de mayusculas del hablante.
- Eliminacion de muletillas y falsos arranques, sin anadir ni quitar contenido.
- Formateo segun modo de escritura (cuatro modos definidos en `phonon_refiner.json`).
- Uso de vocabulario del usuario en el prompt para deletrear terminos concretos.
- Uso de contexto de pantalla: puede deletrear un termino que aparece en el texto en pantalla.
- Continuacion de frases: con la linea "Before cursor" puede continuar una frase ya iniciada, con ajuste automatico de la mayuscula inicial de la transcripcion.
- Generacion de texto conversacional (pipeline text-generation) como capacidad heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo de pensamiento se desactiva explicitamente.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Dictado por voz local en escritorio: Phonon usa este modelo como etapa final para convertir la transcripcion de Parakeet en texto listo para pegar en el editor, con correccion de terminos tecnicos y puntuacion.
- Escritura de codigo o identificadores dictados: gracias a la linea de vocabulario y al texto en pantalla, el modelo puede deletrear nombres de funciones, siglas (API, GitHub) o terminos tecnicos que el reconocedor confunde, lo que resulta adecuado para dictar documentacion o comentarios de codigo.
- Redaccion de correos y mensajes: el modo de escritura formatea la salida segun la aplicacion destino, eliminando muletillas y falsos arranques de conversaciones dictadas.
- Continuacion de frases en un editor: con la linea "Before cursor" el modelo continua la frase en el punto de insercion, util para dictar en mitad de un parrafo ya escrito.
- Atencion al cliente o notas de reunion transcritas: aunque el modelo no esta entrenado con reuniones reales, su capacidad de limpiar transcripciones crudas sirve para posprocesar notas de voz antes de archivarlas (el autor mantiene un adaptador de limpieza de reuniones separado para la version 1.0.1).
- Integracion en pipelines de ASR existentes: al ser un modelo de 1,7B cuantizado a ~1 GB en GGUF, puede desplegarse junto a un reconocedor en una maquina local o un servidor modesto para posprocesar lotes de transcripciones.
- Aplicaciones de accesibilidad: dictado asistido para usuarios que necesitan escribir texto largo con correccion automatica de errores de reconocimiento en local, sin enviar audio ni texto a la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor (benchmarks de investigacion de Phonon, datos sinteticos y publicos, decodificacion greedy con llama.cpp sobre el GGUF). Las cifras de terminos se miden en clips donde el reconocedor fallo un termino y ese termino no aparece en entrenamiento (827 clips, 332 terminos).

| Medida | Valor |
|---|---:|
| Termino deletreado exactamente, con el termino y otros 9 en la linea de vocabulario (B) | 73,9% |
| Termino deletreado exactamente, con su propia pantalla en la linea On-screen (D) | 77,0% |
| Inserciones de termino erroneo: otra pantalla mostrada (E) / 10 terminos de vocabulario no relacionados (C) | 0,2% / 0,7% |
| Errores trampa (F / FH) | 0,7% / 0,7% |
| Conjunto de regresion general, exacto | 265 de 378 |
| Continuacion tras texto previo al cursor, exacto (398 filas reservadas) | 71,4% |
| Igual, con la mayuscula inicial fijada a la de la referencia | 79,4% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_S ocupa 988.453.504 bytes (~0,92 GiB) y los pesos MLX 4-bit 1.133.072.561 bytes (~1,06 GiB); la VRAM necesaria es del orden de 1-2 GB mas el overhead del runtime y la cache KV.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojar el modelo cuantizado.
- Cabe en GPU consumer: si, previsiblemente en tarjetas tipo RTX 3060/4060 y superiores, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp y el motor nativo de Phonon para el GGUF; MLX en Mac para los pesos safetensors; el repositorio incluye `phonon_engine.json` que indica que archivos GGUF carga el motor.
- Latencia y throughput: no disponibles. El drafter especulativo DFlash2 (214.803.168 bytes) esta pensado para acelerar la decodificacion en el motor nativo, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas objetivas con el modelo base y con alternativas genericas de la misma categoria (correccion de ASR con modelos pequenos), marcando como no disponible lo que no se conoce.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Phonon refiner 1.7B | 1.728.801.536 | no disponible | LFM Open License v1.0 | Fine-tune especializado en correccion de dictado (ingles) |
| LiquidAI/LFM3-1.7B (base) | 1,7B (aproximado, no confirmado) | no disponible | LFM Open License v1.0 | Modelo generalista de texto |
| Modelos genericos de correccion gramatical (p. ej., T5/GEC pequenos) | variable | variable | variable | Correccion de texto, no especificos de ASR |

No se dispone de benchmarks comparativos publicados entre estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- El modelo esta disenado para una tarea muy concreta (reescritura de transcripciones) con un prompt muy especifico; su uso fuera de ese formato puede degradar la calidad.
- Riesgo de alucinacion o de insercion de terminos erroneos: aunque el autor reporta tasas bajas (0,2% y 0,7% de inserciones de termino erroneo en sus pruebas), existen y deben monitorizarse en produccion.
- El ajuste se entreno solo con datos publicos y sinteticos; el rendimiento en dominios muy especializados dependera de la linea de vocabulario y del contexto de pantalla.
- La licencia es LFM Open License v1.0, no una licencia open source estandar; deben revisarse sus terminos antes de un uso comercial.
- El drafter especulativo se entreno con salidas de una version anterior; el motor valida los tokens, pero conviene verificar la coherencia en despliegues propios.
- No se publican datos de longitud de contexto, latencia ni throughput, lo que dificulta planificar despliegues de alta concurrencia.
- Los benchmarks son internos del proyecto (datos sinteticos y publicos), no evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infatoshi/phonon-refiner-1.7b
- Repositorio de Phonon: https://github.com/Infatoshi/phonon
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- Revisiones anteriores del refiner: commits `b20b280` (1.0.1), `2b0ab74` (1.0) y `74ea4b6` (0.2.3) del mismo repositorio
- Adaptador de limpieza de reuniones (solo para la version 1.0.1): `phonon-meeting-lora-q8_0.gguf` en el commit `33da4bc`
