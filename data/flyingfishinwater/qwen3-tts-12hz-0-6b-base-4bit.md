# flyingfishinwater/Qwen3-TTS-12Hz-0.6B-Base-4bit

## Resumen

Qwen3-TTS-12Hz-0.6B-Base-4bit es una conversión al formato MLX del modelo de texto a voz Qwen/Qwen3-TTS-12Hz-0.6B-Base, publicada por el usuario flyingfishinwater bajo el ecosistema mlx-audio. El repositorio no contiene una model card propia: el README es la plantilla estándar de conversión de mlx-audio (versión 0.3.0) y remite al modelo original de Qwen para cualquier detalle sobre arquitectura, datos de entrenamiento o idiomas. Se trata, por tanto, de una redistribución cuantizada a 4 bits pensada para ejecución local en Apple Silicon mediante MLX.

La relevancia práctica del repositorio es acotada y conviene ser explícito: registra 0 descargas y 0 likes, la fecha de creación es 2026-09-18 y no aporta documentación técnica adicional más allá de los ejemplos de uso con la CLI y la API de Python de mlx-audio. Su interés radica en que permite probar un modelo TTS con capacidad declarada de clonación de voz (etiqueta voice cloning y parámetro ref_audio en el ejemplo de código) en un Mac, sin GPU dedicada y con pesos de 4 bits.

Un dato que debe manejarse con cautela: aunque el nombre indica "0.6B", el recuento real de parámetros en los ficheros safetensors es de 914.643.008 (aproximadamente 0,91 mil millones). No hay información que explique la discrepancia, que podría deberse a la inclusión de embeddings, cabezas de decodificación o componentes del códec de audio en el recuento. El tamaño del repositorio es de 1,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3-TTS-12Hz-0.6B-Base; la model card no describe la arquitectura) |
| Parametros totales | 914.643.008 (~0,91 B) segun los safetensors del repositorio; el nombre del modelo indica 0.6B |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de texto a voz; no se documenta ventana de contexto) |
| Tipos de cuantizacion | 4 bits (el propio repositorio es una conversion 4-bit en MLX); no se listan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors en formato MLX (libreria mlx-audio, compatible con el paquete `mlx-audio` >= 0.3.0) |

Otros datos: pipeline `text-to-speech`; etiquetas `mlx`, `tts`, `speech`, `speech generation`, `voice cloning`, `4-bit`, `region:us`; repositorio de 1,7 GB; creado y actualizado el 2026-09-18.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card del repositorio es exclusivamente una plantilla de conversion generada por mlx-audio 0.3.0 ("This model was converted to MLX format from Qwen/Qwen3-TTS-12Hz-0.6B-Base using mlx-audio version 0.3.0") y delega todos los detalles tecnicos al modelo original de Qwen, cuyo contenido no forma parte de la informacion proporcionada.

El unico dato de proceso verificable es la propia conversion: pesos originales transformados a formato MLX y cuantizados a 4 bits, lo que reduce el peso en disco y permite inferencia en memoria unificada de Apple Silicon. El sufijo "12Hz" del nombre no viene explicado en la informacion disponible; no se debe asumir su significado (por ejemplo, una tasa de tramas del codec de audio) sin consultar la documentacion del modelo base.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada.
- Clonacion de voz: la etiqueta `voice cloning` esta presente y el ejemplo de Python acepta un parametro `ref_audio` con la ruta a un fichero WAV de referencia.
- Generacion de audio en local sobre Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Ejecucion por linea de comandos (`python -m mlx_audio.tts.generate`) y por API de Python (`load_model` + `generate_audio`).
- Escritura de la salida a fichero mediante el parametro `file_prefix`.
- No hay informacion disponible sobre soporte de tool calling, capacidades de agente, control de emociones o prosodia, multilinguismo, marcas de agua o sincronizacion labial.

## Casos de uso

- Clonacion de voz para locucion de contenidos: el modelo acepta un audio de referencia (`ref_audio`) y puede generar nuevas locuciones con esa timbre, util para productores que quieran mantener una voz consistente en una serie de videos o podcasts.
- Audiolibros y lectura asistida: conversion de texto largo a voz en local, sin enviar el material a APIs externas, lo que simplifica el tratamiento de obras con derechos restringidos.
- Prototipado rapido en macOS: desarrolladores que trabajan en un Mac pueden evaluar un pipeline TTS completo (carga, sintesis y escritura a disco) con dos comandos y sin configurar CUDA ni drivers.
- Aplicaciones de accesibilidad: lectura en voz alta de documentos o interfaces para usuarios con discapacidad visual, ejecutada en el propio dispositivo y por tanto sin latencia de red ni coste por caracter.
- Generacion de datos sinteticos de audio: creacion de muestras de voz etiquetadas para entrenar o evaluar sistemas de reconocimiento de voz, siempre que la licencia y el consentimiento de las voces de referencia lo permitan.
- Integracion en asistentes de voz locales: al ejecutarse con MLX sobre hardware de Apple, puede formar parte de un asistente de escritorio que combine STT, un LLM local y este TTS, manteniendo la conversacion fuera de la nube.
- Demostraciones y pruebas de concepto de conversion de voz: util para comparar la calidad de una cuantizacion 4-bit frente al modelo original en tareas de sintesis antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de audio (MOS, similitud de hablante, WER de intelligibilidad), latencia ni throughput, y tampoco se han encontrado en la busqueda web enlaces tecnicos relevantes.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; MLX utiliza memoria unificada. Estimacion de pesos a 4 bits: aproximadamente 0,45-0,5 GB para los ~0,91 B de parametros (calculo derivado de 0,91 B x ~0,5 bytes por peso), aunque el repositorio ocupa 1,7 GB e incluye otros artefactos ademas de los pesos cuantizados.
- GPU compatibles: exclusivamente Apple Silicon (serie M). No hay soporte de CUDA, ROCm ni CPU generica a traves de mlx-audio.
- Modelos de Mac recomendados: cualquier equipo con Apple Silicon y 16 GB de memoria unificada deberia gestionarlo con holgura; 8 GB es probablemente suficiente para los pesos, aunque el margen depende del resto de procesos. No hay datos publicados de rendimiento por modelo de chip.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs de consumo con Apple Silicon; no cabe plantearlo en GPUs NVIDIA porque el formato de pesos es MLX.
- Opciones de despliegue: `mlx-audio` (CLI o Python). No hay evidencia de soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo real factor (RTF) ni de velocidad de generacion.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica habitual y deben verificarse antes de tomar decisiones; los del modelo analizado proceden del repositorio de HuggingFace.

| Modelo | Parametros | Clonacion de voz | Licencia | Formatos / plataformas | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-Base-4bit (este repositorio) | 914,6 M reales (nombre: 0.6B) | Si (etiqueta y `ref_audio`) | apache-2.0 | safetensors MLX; solo Apple Silicon | Conversion no oficial, 0 descargas, sin model card propia ni benchmarks |
| Kokoro-82M | ~82 M | No (voces predefinidas) | apache-2.0 | safetensors, ONNX; CPU y GPU | Modelo pequeno y muy extendido para TTS ligero |
| XTTS-v2 (Coqui) | ~0,47 B (aproximado) | Si | Coqui Public Model License (uso comercial restringido) | safetensors/PyTorch; CPU y GPU | Referencia habitual en clonacion de voz multilingue |
| F5-TTS | ~0,34 B (aproximado) | Si | MIT (segun su repositorio) | PyTorch; GPU | Orientado a clonacion con pocos segundos de referencia |

La comparacion cuantitativa de calidad (MOS, similitud de hablante) no esta disponible para el modelo analizado, por lo que no se puede establecer una jerarquia de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion propia: el README es la plantilla de conversion, sin arquitectura, dataset, idiomas ni limites descritos.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de calidad de sintesis, naturalidad o fidelidad de clonacion.
- Cero descargas y cero likes: el repositorio no ha sido validado por la comunidad y podria contener errores de conversion no detectados.
- Discrepancia entre el nombre (0.6B) y los parametros reales (914,6 M): conviene verificar que los pesos cargan correctamente y que la calidad corresponde al modelo base.
- Trazabilidad dudosa: la model card menciona el identificador `mlx-community/Qwen3-TTS-12Hz-0.6B-Base-4bit`, mientras que el repositorio publicado pertenece a `flyingfishinwater`. Es una republicacion de una conversion de la comunidad MLX, no una publicacion oficial de Qwen.
- Compatibilidad limitada: solo funciona con MLX en Apple Silicon; no es desplegable en servidores con GPU NVIDIA ni en entornos Linux con CUDA.
- Idiomas no documentados: no se puede afirmar soporte de castellano ni de ningun otro idioma concreto sin probarlo.
- Riesgo de uso indebido en clonacion de voz: la licencia Apache-2.0 no cubre el consentimiento de las personas cuya voz se clone. La suplantacion de identidad y la generacion de audio enganoso tienen implicaciones legales en la UE (normativa sobre IA y derechos de imagen).
- Licencia del modelo base no verificada en esta ficha: aunque el repositorio declara apache-2.0, el uso comercial debe confirmarse consultando la licencia de Qwen/Qwen3-TTS-12Hz-0.6B-Base.
- Alucinacion y artefactos de audio: no hay informacion sobre el comportamiento del modelo ante entradas fuera de dominio, textos muy largos o caracteres no soportados; es esperable encontrar errores de pronunciacion y artefactos, especialmente tras la cuantizacion a 4 bits.
- Fechas de creacion y actualizacion en 2026-09-18, sin historial posterior de mantenimiento en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/flyingfishinwater/Qwen3-TTS-12Hz-0.6B-Base-4bit
- Modelo base citado en la model card: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Repositorio de la conversion original mencionada: https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-0.6B-Base-4bit
- Libreria de inferencia: `mlx-audio` (instalable con `pip install -U mlx-audio`); no se ha encontrado en la busqueda web la URL de su repositorio.

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su modelo base ni su libreria; los unicos enlaces verificables son los de HuggingFace indicados arriba.
