# opragmatico/silero-vad-nemo-speech-gguf

## Resumen

Silero VAD v6.2.0 es un detector de actividad de voz (VAD) de pequeno tamano desarrollado por el equipo de Silero. Este repositorio, publicado por el usuario opragmatico, contiene una conversion de esos pesos al formato GGUF que carga NeMo-Speech.cpp v0.3.0 de NVIDIA como componente VAD complementario. No se trata de una publicacion oficial de Silero ni de NVIDIA, sino de una conversion de formato sin reentrenamiento ni cuantizacion: los pesos se copian tal cual en F32.

El modelo resuelve un problema concreto en pipelines de reconocimiento automatico del habla: enmascarar el silencio antes de que el ASR procese el audio y determinar el final de los turnos de habla. Se uso originalmente para Goscriber, una aplicacion de dictado push-to-talk sin conexion, y es compatible con cualquier runtime de NeMo-Speech.cpp.

Con apenas 309.633 parametros y un fichero de 1,24 MB, es un componente auxiliar de latencia muy baja, no un modelo generativo. Su relevancia es practica: permite integrar deteccion de voz en despliegues locales y en C/C++ sin dependencias de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de deteccion de actividad de voz (Silero VAD v6.2.0); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 309.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; ventana no especificada) |
| Tipos de cuantizacion | F32 unicamente (sin cuantizar) |
| Idiomas soportados | no disponible (el VAD es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | GGUF (`silero-vad-v6.2.0.gguf`, 1.240.224 bytes, SHA-256 `83d702b11378ced4b1bbfcb53394bd00994f7382ff0b9a11b87605dd0898369d`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de Silero VAD v6.2.0. Se sabe que es un detector de actividad de voz de 309.633 parametros que opera sobre audio muestreado a 16 kHz; el fichero contiene unicamente el modelo de 16 kHz. No se especifican capas, tipo de red ni mecanismo de atencion.

Respecto al entrenamiento, este repositorio no entrena ni ajusta nada: los pesos se extraen del paquete `silero-vad` 6.2.0 de PyPI (wheel con SHA-256 `8a31f1e58e73cdc20820d842f757e678e0ae1b0ee1cb7b8aa50f20f8fd7f7638`) y se convierten con `convert_model.py` de NeMo-Speech.cpp v0.3.0 (commit `20999cc9`) mediante el comando `python convert_model.py silero --silero-version 6.2.0 --outfile silero-vad-v6.2.0.gguf`. Los pesos se copian en F32 sin cuantizacion ni reentrenamiento. No se dispone de datos sobre el corpus de entrenamiento original, numero de tokens de audio ni uso de RLHF.

## Capacidades

- Deteccion de actividad de voz sobre audio a 16 kHz.
- Enmascaramiento de silencio previo al reconocimiento del habla (`--vad-masking`).
- Deteccion del final de turno o utterance para segmentar el audio.
- Integracion como modelo VAD complementario en NeMo-Speech.cpp v0.3.0.
- Uso a traves de la CLI (`nemo-speech transcribe`) o de la ABI de C mediante `nemo_speech_asr_vad_config` (`model_path` y `enable_masking`).
- Compatible con cualquier runtime de NeMo-Speech.cpp, no solo con Goscriber.
- No soporta generacion de texto, codigo, matematicas, vision, tool calling ni razonamiento multi-paso.

## Casos de uso

- Dictado push-to-talk sin conexion: Goscriber usa este VAD para recortar el silencio antes de enviar el audio al ASR, reduciendo el coste de transcripcion y evitando alucinaciones del reconocedor sobre fragmentos sin habla.
- Transcripcion por lotes con NeMo-Speech.cpp: combinado con Parakeet TDT 0.6B v2 (`--vad-model silero-vad-v6.2.0.gguf --vad-masking`), filtra segmentos silenciosos en ficheros largos y acelera el procesado.
- Segmentacion de turnos en asistentes de voz: la deteccion de final de utterance permite cerrar el turno del usuario y disparar la respuesta del sistema sin esperar un temporizador fijo.
- Preprocesado en pipelines de ASR embebido: al ser un fichero de 1,24 MB en F32, se puede incluir en imagenes de contenedor o firmware sin impacto apreciable en tamano.
- Integracion en aplicaciones C/C++ nativas: la ABI de NeMo-Speech.cpp permite invocar el VAD desde codigo nativo sin depender de Python ni de PyTorch en produccion.
- Filtrado de audio en herramientas de accesibilidad: deteccion de habla para activar captura de microfono solo cuando hay voz, reduciendo consumo y ruido en aplicaciones de dictado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el fichero de pesos ocupa 1,24 MB en F32 y el modelo tiene 309.633 parametros.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. No hay datos de rendimiento en GPU en la informacion disponible.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: NeMo-Speech.cpp v0.3.0 (CLI y ABI de C). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI; de hecho, el autor advierte que no es el formato GGML de Silero usado por whisper.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Silero VAD v6.2.0 (este GGUF) | 309.633 | no disponible | GGUF (NeMo-Speech.cpp) | MIT | Conversion no oficial, solo 16 kHz, F32 |
| Silero VAD v6.2.0 (paquete PyPI) | 309.633 | no disponible | Pesos PyTorch | MIT | Version original de la que se deriva este fichero |
| Silero VAD en formato GGML para whisper.cpp | no disponible | no disponible | GGML | MIT | Formato distinto; el autor indica explicitamente que este fichero no es compatible |

No se dispone de informacion sobre otros detectores de actividad de voz comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es una publicacion oficial de Silero Team ni de NVIDIA; es una conversion de terceros.
- Solo contiene el modelo de 16 kHz; no incluye otras variantes de muestreo.
- No es compatible con el formato GGML de Silero usado por whisper.cpp.
- Los pesos estan en F32 sin cuantizar, por lo que no se beneficia de reducciones de tamano adicionales (aunque el tamano ya es minimo).
- No hay datos publicados de benchmarks, sesgos, tasas de error ni comportamiento en idiomas o condiciones acusticas concretas.
- Al ser un VAD, puede producir falsos positivos o negativos en audio con ruido, musica o habla muy baja; no se documentan umbrales ni metricas.
- La licencia MIT permite uso comercial, pero se debe mantener la atribucion a Silero Team segun el fichero LICENSE incluido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion fuera del proyecto Goscriber.

## Enlaces

- Hugging Face: https://huggingface.co/opragmatico/silero-vad-nemo-speech-gguf
- Silero VAD (repositorio original): https://github.com/snakers4/silero-vad
- Paquete PyPI silero-vad 6.2.0: https://pypi.org/project/silero-vad/6.2.0/
- NeMo-Speech.cpp (NVIDIA): https://github.com/NVIDIA/NeMo-Speech.cpp
- NeMo-Speech.cpp v0.3.0 (commit de conversion): https://github.com/NVIDIA/NeMo-Speech.cpp/tree/v0.3.0
- Goscriber (aplicacion que motivo la conversion): https://github.com/opragmatico/goscriber
- Script de conversion: https://github.com/opragmatico/goscriber/blob/main/scripts/convert-models.sh
- Documentacion de modelos GGUF de Goscriber: https://github.com/opragmatico/goscriber/blob/main/docs/models/gguf.md
