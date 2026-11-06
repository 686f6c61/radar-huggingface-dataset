# kojira/zen-tts-models

## Resumen

Bluesky-chan 1.1.0 (Blueskyちゃん) es un modelo de voz en formato `.ztm` para el motor de síntesis de voz en japonés ZEN-TTS, desarrollado por Zenryoku Kikai (全力機械). No es un modelo de lenguaje ni un TTS completo: es un artefacto de voz (voice) de 27,7 MB que se carga sobre el motor ZEN-TTS 1.2.0 o superior para generar habla en japonés con un timbre concreto. El autor del repositorio es kojira, y el fichero es idéntico al release `bluesky-v1.1.0` del repositorio GitHub `kojira/zen-tts-models`.

La voz es sintética (no corresponde a ninguna persona real) y se generó con el modelo de síntesis de voz VoxCPM2, distribuido bajo licencia Apache-2.0, para después entrenarse específicamente para ZEN-TTS. El timbre es agudo y juvenil, femenino, y está pensado para un registro refinado de «ojousama» (señorita de clase alta), con expresiones como «〜ですわ» u «お見知りおきを».

Su relevancia es acotada pero concreta: cubre la necesidad de voces japonesas con control emocional explícito (neutral, happy, sad, angry, apologetic) en un motor que puede ejecutarse tanto en Node.js como en navegador mediante WASM. La licencia es muy restrictiva: solo permite uso en proyectos de código abierto con licencia aprobada por la OSI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de voz `.ztm` para el motor ZEN-TTS; no se documenta la arquitectura interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de texto para síntesis) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (`ja`) |
| Licencia | zen-tts-models-voice-license-1.0 (uso solo en proyectos de código abierto con licencia OSI) |
| Formato de pesos | `.ztm` (fichero único de 27.650.016 bytes; SHA-256 `fccfa172ab5d687e617d62cbb7154d36ef2bc0394cba97ef4bb2abec7c92df93`) |

## Arquitectura y entrenamiento

No se publican detalles de arquitectura del artefacto `.ztm` en la información disponible. Lo que sí se documenta es el proceso de creación: la voz se generó con VoxCPM2 (modelo de síntesis de voz bajo Apache-2.0) y posteriormente se entrenó para el motor ZEN-TTS. El resultado es un fichero de 27,7 MB que ZEN-TTS carga junto con su módulo de G2P (grafema a fonema) ubicado en `models/g2p/` del propio motor.

El control de estilo se realiza mediante mezclas de pesos emocionales en la llamada de síntesis, por ejemplo `{ emotion: { happy: 60, neutral: 40 } }`, lo que permite interpolar entre las cinco emociones soportadas y variar la emoción dentro de una misma frase. No se especifican el volumen de datos de entrenamiento, la composición del corpus ni si hubo ajuste por RLHF o DPO.

## Capacidades

- Síntesis de voz en japonés a partir de texto, con salida PCM convertible a WAV mediante `wavBytes`.
- Control emocional con cinco estilos: neutral, happy, sad, angry y apologetic, combinables mediante pesos.
- Variación de emoción dentro de una misma frase y uso de diccionarios de pronunciación gestionados por ZEN-TTS.
- Ejecución en Node.js (`zen-tts/node`) y en navegador (build WASM con `cpuWasmUrl`), sirviendo el `.ztm` desde una URL propia.
- Timbre femenino agudo y juvenil orientado a un registro formal y refinado.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un artefacto de voz para TTS.

## Casos de uso

- Lectura de textos en japonés en aplicaciones web: cargando `bluesky.ztm` desde una URL y el WASM de CPU, el navegador sintetiza frases sin backend, útil para interfaces de accesibilidad o lectura de contenido.
- Asistentes conversacionales en japonés con tono formal: la voz encaja en personajes de atención al cliente o recepción que requieren un registro educado y agudo.
- Videojuegos y novelas visuales de código abierto: el control por pesos de emoción permite asignar estados de ánimo a un personaje sin grabar múltiples locuciones.
- Generación de avisos y anuncios en comercios: frases como «本日はご来店いただき、ありがとうございます» con emoción neutral o happy para sistemas de megafonía automatizada.
- Contenido educativo o divulgativo en japonés: lectura de materiales con cambios de emoción por sección para mantener la atención del oyente.
- Prototipado de pipelines TTS en Node.js: integración en scripts de generación por lotes de audio para pruebas de producto antes de contratar voces comerciales.
- Demos y proyectos de investigación de código abierto: al ser gratuito solo para proyectos OSI, sirve para publicar ejemplos reproducibles con atribución incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El artefacto de voz ocupa 27,7 MB; el coste de memoria dominante proviene del motor ZEN-TTS, no del fichero `.ztm`.
- Ejecución en CPU mediante el binario WASM (`cpu/tts-cpu.wasm`) para el caso de navegador; no se documentan requisitos de VRAM ni uso de GPU.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la información disponible.
- No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el despliegue previsto es el runtime propio de ZEN-TTS en Node.js o navegador.
- No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros artefactos de voz para ZEN-TTS ni modelos TTS comparables con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia muy restrictiva: solo se permite el uso en proyectos de código abierto cuyo código fuente sea público y esté distribuido bajo una licencia aprobada por la OSI; queda prohibido el uso en proyectos propietarios o de código cerrado.
- Obligación de doble atribución: hay que mostrar «音声合成：ZEN-TTS（https://zenryokukikai.com ）» en un lugar visible para los usuarios y, además, incluir en el código fuente del proyecto el nombre de la voz, https://github.com/kojira/zen-tts-models y la URL de Zenryoku Kikai.
- Dependencia de versión: requiere ZEN-TTS 1.2.0 o superior; la versión 1.1.0 del motor no puede leer este fichero (para esa versión existe `bluesky-v1.0.0`).
- Solo japonés: no hay soporte multilingüe documentado.
- Voz sintética generada con VoxCPM2: no se detallan sesgos prosódicos ni de pronunciación, ni se han publicado evaluaciones de naturalidad (MOS) o inteligibilidad.
- No hay información sobre robustez ante texto con caracteres no japoneses, números, siglas o nombres propios; el comportamiento depende del G2P de ZEN-TTS y de sus diccionarios.
- El repositorio de HuggingFace registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Enlaces

- HuggingFace: https://huggingface.co/kojira/zen-tts-models
- Repositorio GitHub del autor: https://github.com/kojira/zen-tts-models
- Motor ZEN-TTS (GitHub): https://github.com/zenryokukikai/zen-tts
- Documentación y README de ZEN-TTS: https://github.com/zenryokukikai/zen-tts#readme
- Licencia de ZEN-TTS 1.0: https://github.com/zenryokukikai/zen-tts/blob/main/LICENSE.md
- Zenryoku Kikai (全力機械): https://zenryokukikai.com
- Licencia del modelo de voz: LICENSE.md en el repositorio de HuggingFace
