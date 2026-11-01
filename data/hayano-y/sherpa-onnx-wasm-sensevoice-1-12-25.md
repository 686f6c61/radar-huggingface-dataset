# hayano-y/sherpa-onnx-wasm-sensevoice-1.12.25

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un espejo (mirror) de cuatro archivos del artefacto WebAssembly `sherpa-onnx-wasm-simd-1.12.25-vad-asr-zh_en_ja_ko_cantonese-sense_voice_small.tar.bz2`, publicado originalmente en la release `v1.12.25` (14 de febrero de 2026) del proyecto sherpa-onnx de k2-fsa. Empaqueta el modelo de reconocimiento de voz SenseVoice-Small de FunAudioLLM/FunASR (Alibaba Group) compilado a WebAssembly con SIMD, junto con detección de actividad de voz (VAD), para su ejecución en navegador.

El interés practico es acotado: el autor fija la version 1.12.25 porque las compilaciones 1.13 y posteriores exigen aislamiento de origen cruzado (cross-origin isolation) para habilitar hilos, lo que complica el despliegue en paginas web convencionales. El repositorio pesa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

No es un modelo generativo ni un LLM: no hay parámetros de lenguaje, ventana de contexto ni cuantizaciones en el sentido habitual. La ficha siguiente adapta la estructura obligatoria a un artefacto de inferencia ASR empaquetado para el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice-Small (FunASR) compilado a WebAssembly SIMD con sherpa-onnx; incluye VAD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino, ingles, japones, coreano y cantonés (segun el nombre del artefacto `zh_en_ja_ko_cantonese`) |
| Licencia | FunASR Model Open Source License Agreement v1.1 (SenseVoice-Small) y Apache 2.0 (sherpa-onnx) |
| Formato de pesos | artefacto WebAssembly empaquetado en `.tar.bz2` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es una compilación a WebAssembly del runtime sherpa-onnx (proyecto Next-gen Kaldi de k2-fsa, licencia Apache 2.0) con el modelo SenseVoice-Small de FunASR como motor ASR y un módulo VAD para segmentar el audio de entrada. La compilación emplea SIMD para acelerar la inferencia en el navegador y esta fijada a la version 1.12.25 del proyecto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion o las innovaciones internas del modelo SenseVoice-Small en la informacion proporcionada. El repositorio es un espejo sin modificaciones de los archivos oficiales, por lo que cualquier detalle de entrenamiento debe consultarse en la documentacion de FunASR.

## Capacidades

- Reconocimiento automatico de voz (ASR) en chino, ingles, japones, coreano y cantonés.
- Deteccion de actividad de voz (VAD) integrada para segmentar flujos de audio largos.
- Ejecucion integra en el navegador mediante WebAssembly SIMD, sin necesidad de backend.
- Procesamiento de audio en streaming o por segmentos, segun la configuracion del runtime sherpa-onnx.
- No soporta generacion de texto, razonamiento, codigo, tool calling ni agentes: es exclusivamente un modelo de transcripcion.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion en el navegador sin servidor: una aplicacion web puede cargar el artefacto WASM y transcribir audio del microfono localmente, evitando enviar datos a un backend y reduciendo costes de infraestructura.
- Subtitulado en tiempo real de reuniones o clases: el VAD integrado segmenta el habla y el ASR genera subtitulos en las cinco lenguas cubiertas, util en entornos multilingues de Asia Oriental.
- Dictado en aplicaciones web de productividad: integrable en editores o formularios para convertir voz a texto con latencia baja al ejecutarse en el cliente.
- Asistentes de voz para atencion al cliente en kioscos o portales: la transcripcion local permite cumplir requisitos de privacidad al no salir el audio del dispositivo.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido web, con soporte de cantonés y coreano que no siempre esta cubierto por alternativas.
- Prototipado rapido de pipelines ASR: al ser un espejo fijado a una version concreta, sirve para reproducir entornos de prueba estables sin depender de compilaciones con requisitos de cross-origin isolation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere VRAM de GPU: la inferencia se ejecuta en el navegador sobre CPU mediante WebAssembly SIMD.
- El rendimiento depende del navegador y de la CPU del cliente; no se dispone de cifras de latencia o throughput en la informacion proporcionada.
- No aplica el despliegue en vLLM, llama.cpp, Ollama o TGI: el artefacto esta pensado para servirse como recurso estatico y ejecutarse con el runtime sherpa-onnx en WebAssembly.
- El tamano del paquete (0,3 GB en el repositorio) condiciona la carga inicial en el cliente.
- Las versiones 1.13 y posteriores de sherpa-onnx requieren aislamiento de origen cruzado para hilos, motivo por el que este espejo fija la 1.12.25.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Despliegue | Licencia |
|---|---|---|---|---|
| sherpa-onnx-wasm-sensevoice-1.12.25 (este) | ASR WASM (SenseVoice-Small) | zh, en, ja, ko, cantonés | Navegador (WASM SIMD) | FunASR v1.1 + Apache 2.0 |
| Whisper (variantes de OpenAI) | ASR | Multilingue amplio | Servidor, local, WASM en algunos ports | MIT (segun variante) |
| Modelos FunASR nativos (SenseVoice-Small) | ASR | zh, en, ja, ko, cantonés | Python/servidor | FunASR v1.1 |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, razona ni responde preguntas; solo transcribe audio.
- El espejo esta fijado a la version 1.12.25; no recibira actualizaciones ni correcciones de seguridad de versiones posteriores.
- La licencia FunASR Model Open Source License Agreement v1.1 impone condiciones especificas para uso comercial que deben revisarse antes de desplegar en produccion.
- La cobertura linguistica se limita a chino, ingles, japones, coreano y cantonés; no hay soporte declarado para castellano.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o precision por idioma en la informacion proporcionada.
- El tamano de 0,3 GB puede penalizar la carga inicial en conexiones lentas.
- Al ejecutarse en el cliente, la calidad depende del hardware y navegador del usuario final.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hayano-y/sherpa-onnx-wasm-sensevoice-1.12.25
- Release oficial de sherpa-onnx v1.12.25: https://github.com/k2-fsa/sherpa-onnx/releases/tag/v1.12.25
- Licencia de FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
