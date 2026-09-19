# flyingfishinwater/granite-4.0-1b-speech-4bit

## Resumen

Esta ficha describe `flyingfishinwater/granite-4.0-1b-speech-4bit`, una cuantizacion a 4 bits en formato MLX del modelo de reconocimiento automatico del habla (ASR) `ibm-granite/granite-4.0-1b-speech`, originalmente desarrollado por IBM. La conversion ha sido realizada por el usuario `flyingfishinwater` (la model card referencia el flujo de trabajo de `mlx-community`) con la libreria `mlx-audio` en su version 0.4.0, y esta pensada para ejecutarse en hardware Apple Silicon a traves del framework MLX. El objetivo es ofrecer transcripcion de voz a texto local, sin depender de APIs en la nube, con un consumo de memoria reducido gracias a la cuantizacion de 4 bits.

El modelo deriva de la base `ibm-granite/granite-4.0-1b-base` y pertenece a la familia IBM Granite 4.0. Aunque el nombre incluye "1b", el repositorio contiene 2.313.207.132 parametros totales segun el recuento real de safetensors, lo que refleja que el sistema completo de ASR incorpora componentes adicionales (codificador de audio y proyeccion) sobre el modelo de lenguaje base. La licencia es Apache-2.0 y soporta seis idiomas explicitos: ingles, frances, aleman, espanol, portugues y japones, ademas de la etiqueta generica "multilingual".

Es relevante porque cubre un nicho concreto: transcripcion multilingue en local sobre Macs con chip de la serie M, con un peso de repositorio de 2,0 GB y un recuento de descargas de 0 en el momento de la consulta. Esto lo situa como una conversion de terceros de interes practico para desarrolladores que quieran integrar ASR en aplicaciones de escritorio o moviles Apple sin enviar audio a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; derivada de `ibm-granite/granite-4.0-1b-base` (familia Granite 4.0) |
| Parametros totales | 2.313.207.132 (recuento real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (formato MLX) |
| Idiomas soportados | Multilingue; en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de este modelo mas alla de que es una conversion a MLX del modelo de voz `ibm-granite/granite-4.0-1b-speech`, el cual se apoya en la base textual `ibm-granite/granite-4.0-1b-base`. La tarea declarada es speech-to-text (ASR/STT), por lo que se trata de un sistema con un componente de codificacion de audio acoplado al modelo de lenguaje de la familia Granite 4.0. Los pesos se han convertido con `mlx-audio` 0.4.0 para poder ejecutarse en el ecosistema MLX de Apple.

No se han proporcionado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) en el material facilitado, por lo que estos apartados quedan como no disponibles.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en seis idiomas: ingles, frances, aleman, espanol, portugues y japones, con soporte multilingue adicional segun la etiqueta del modelo.
- Transcripcion de ficheros de audio mediante linea de comandos con `python -m mlx_audio.stt.generate`.
- Integracion programatica en Python a traves de `mlx_audio.stt.utils.load_model` y `mlx_audio.stt.generate.generate_transcription`, con salida en distintos formatos (por ejemplo `txt`).
- Ejecucion local en dispositivos Apple Silicon mediante el framework MLX, sin necesidad de conexion a servicios externos.
- Orientado a speech-to-text; no se documentan capacidades de texto generativo, codigo, matematicas, vision, tool calling ni agentes en la informacion proporcionada.
- No se indica soporte de function calling ni de razonamiento multi-paso en el material disponible.

## Casos de uso

- Transcripcion local de reuniones: un equipo puede procesar las grabaciones de audio de sus reuniones en un Mac con Apple Silicon, convirtiendolas a texto sin subir conversaciones confidenciales a la nube, gracias a que los pesos caben en un repositorio de 2,0 GB.
- Subtitulado de video y podcast: el modelo genera transcripciones en varios idiomas (en, fr, de, es, pt, ja) que despues pueden sincronizarse como subtitulos, resultando util para creadores que publican contenido multilingue.
- Asistentes de voz offline: aplicaciones de escritorio para macOS pueden integrar el modelo para dictado y comandos por voz sin depender de APIs de terceros, manteniendo la latencia baja al ejecutarse en el propio dispositivo.
- Dictado para desarrolladores: integrado en editores o terminales de Mac, permite transcribir notas de voz o descripciones habladas a texto para documentar commits, incidencias o comentarios de codigo.
- Notas de voz en aplicaciones moviles/desktop de Apple: al usar el formato MLX, puede incorporarse en apps del ecosistema Apple para convertir grabaciones de voz en texto editable dentro del propio dispositivo.
- Indexacion y busqueda de archivos de audio: un pipeline puede transcribir grandes volumenes de audio y almacenar el texto resultante para habilitar busqueda por palabras clave en archivos de voz.
- Accesibilidad: generacion de transcripciones de conversaciones o contenido hablado para personas con discapacidad auditiva, ejecutandose en local para preservar la privacidad.
- Preprocesado de datos de voz: para investigadores que necesitan transcribir corpus de audio en varios idiomas antes de tareas posteriores de analisis o anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: el recuento de parametros (2,31 mil millones) en 4 bits implica en torno a 1,2 GB solo de pesos; el tamano del repositorio es de 2,0 GB, por lo que conviene reservar al menos ~2-3 GB de memoria unificada para pesos y sobrecarga de ejecucion.
- GPU recomendadas: al emplear el framework MLX, el modelo esta orientado a chips Apple Silicon (serie M1, M2, M3, M4 y superiores). No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090, etc.) con esta conversion.
- Compatibilidad con GPU de consumo: si, sobre ordenadores Mac con Apple Silicon; cualquier equipo con memoria unificada suficiente (del orden de 4-8 GB libres) deberia poder ejecutarlo.
- Opciones de despliegue: `mlx-audio` (CLI y API Python). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas y se incluyen a modo orientativo; no se dispone de cifras de benchmarks para el modelo evaluado ni de comparaciones directas.

| Modelo | Parametros | Idiomas | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| flyingfishinwater/granite-4.0-1b-speech-4bit | 2,31 mil millones | en, fr, de, es, pt, ja + multilingue | Apache-2.0 | MLX (safetensors, 4-bit) | Conversion de terceros para Apple Silicon |
| openai/whisper-large-v3 | 1,55 mil millones | Multilingue amplio | MIT | PyTorch/safetensors | Referencia ASR ampliamente usada; no MLX |
| openai/whisper-large-v3-turbo | 809 millones | Multilingue amplio | MIT | PyTorch/safetensors | Version optimizada en latencia; no MLX |
| ibm-granite/granite-4.0-1b-speech | No disponible | en, fr, de, es, pt, ja + multilingue | Apache-2.0 | safetensors (original) | Modelo fuente sin cuantizar |

## Limitaciones y advertencias

- Es una conversion de terceros: los pesos no los publica IBM directamente, sino el usuario `flyingfishinwater`, por lo que la calidad de la cuantizacion a 4 bits no esta avalada por el equipo original.
- La model card del repositorio referencia el identificador `mlx-community/granite-4.0-1b-speech-4bit`, mientras que el repositorio consultado es `flyingfishinwater/granite-4.0-1b-speech-4bit`; conviene verificar cual es la fuente canonica antes de usarlo en produccion.
- Repositorio sin descargas ni "likes" en el momento de la consulta, lo que reduce las senales de validacion por parte de la comunidad.
- Cuantizacion de 4 bits: puede degradar la precision de transcripcion respecto al modelo original en audio ruidoso, acentos marcados o idiomas menos representados.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible; como todo modelo ASR, existe riesgo de transcribir contenido inexistente en audio ambiguo o silencioso.
- No se especifican limitaciones de longitud de contexto ni de duracion maxima de audio; este dato es no disponible.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda revisar las condiciones del modelo base de IBM y de la libreria `mlx-audio`.
- Dependencia de plataforma: al estar en formato MLX, el despliegue queda restringido al ecosistema Apple/MLX, lo que limita su uso en infraestructura con GPU NVIDIA.
- No se dispone de benchmarks que permitan estimar su calidad frente a alternativas como Whisper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flyingfishinwater/granite-4.0-1b-speech-4bit
- Modelo fuente (voz): https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Modelo base textual: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Conversion referenciada en la model card: https://huggingface.co/mlx-community/granite-4.0-1b-speech-4bit
- Libreria `mlx-audio`: no se ha proporcionado una URL directa en la informacion disponible (se instala con `pip install -U mlx-audio`).

Nota: los resultados de la busqueda web facilitados no contienen informacion relevante sobre este modelo, por lo que no se han utilizado.
