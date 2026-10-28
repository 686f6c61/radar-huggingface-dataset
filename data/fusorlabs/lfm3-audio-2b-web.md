# fusorlabs/lfm3-audio-2b-web

## Resumen

`fusorlabs/lfm3-audio-2b-web` es una compilación del modelo `LiquidAI/LFM3-Audio-2B` de Liquid AI empaquetada en formato `fusor-ai` para ejecutarse en el navegador mediante WebAssembly. No se trata de un checkpoint en PyTorch ni en safetensors: el repositorio contiene un `manifest.json` y una serie de partes nombradas por su hash BLAKE3, que el runtime `liquidai-lmf3-wasm` verifica durante la carga. El resultado es un modelo any-to-any (texto y audio como entrada; texto y voz como salida) que corre en la CPU del dispositivo, sin GPU ni servidor.

El modelo base pertenece a la familia LFM3 de Liquid AI, anunciada el 27 de octubre de 2026, formada por seis modelos de clase 2B sobre un backbone compartido (texto, visión con vídeo, audio, omni y decisión). La variante de audio está descrita por el autor original como un modelo compacto que se ejecuta localmente en portátiles y dispositivos edge, acepta texto o audio y responde con texto, habla o ambos.

La relevancia de este repositorio es de infraestructura más que de modelado: demuestra una vía de despliegue de un modelo de audio de 2B parámetros íntegramente en el cliente, con verificación de integridad de los pesos en el navegador. El perfil de compilación publicado es `q7`: todas las matrices grandes a 7 bits, salvo el subsampler de audio, que se mantiene en f32, e incluye el decodificador del códec de voz. El repositorio ocupa 2,3 GB y, en el momento de la consulta, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Audio-2B de Liquid AI; el detalle de capas no se especifica en la informacion proporcionada) |
| Parametros totales | ~2B (deducido de la denominacion del modelo base; no confirmado explicitamente en la informacion disponible) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | perfil unico `q7`: matrices grandes a 7 bits, subsampler de audio en f32, decodificador del codec de voz incluido |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | bundle `fusor-ai`: `manifest.json` + partes nombradas por hash BLAKE3; no es safetensors ni GGUF |
| Tamano del repositorio | 2,3 GB |
| Pipeline | any-to-any |
| Libreria / runtime | `fusor-ai` (runtime `liquidai-lmf3-wasm`) |
| Revision del modelo base | `9d49701c372d6011d900f6abb40c6b296fb706dd` |
| Fecha de publicacion | 2026-10-28 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base: la model card se limita a describir el proceso de compilación y el formato del bundle. Lo que sí se especifica es el pipeline de conversión: se parte del checkpoint `LiquidAI/LFM3-Audio-2B` en la revisión `9d49701c372d6011d900f6abb40c6b296fb706dd` y se compila con el perfil `q7`, que cuantiza a 7 bits todas las matrices de gran tamaño excepto el subsampler de audio, mantenido en f32 por su sensibilidad numérica. El bundle incorpora además el decodificador del códec de voz, necesario para la salida hablada.

El formato de empaquetado es la innovación técnica destacable de esta ficha: cada tensor y cada parte del bundle aparece listado en `manifest.json` y nombrado por su hash BLAKE3, de modo que el runtime verifica la integridad de los pesos a medida que los carga en el navegador. La compilación es reproducible con el comando `just model` del repositorio `liquidai-lmf3-wasm`, que descarga el checkpoint y genera el mismo bundle. No se proporcionan datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento de voz: el modelo escucha audio de entrada y lo transcribe.
- Síntesis de voz: genera habla como salida gracias al decodificador del códec incluido en el bundle.
- Conversación multimodal: mantiene diálogo tomando texto o audio como entrada y devolviendo texto, voz o ambos.
- Pipeline any-to-any: combinación de entrada y salida en las modalidades texto y audio.
- Ejecución on-device: inferencia en la CPU del dispositivo a través de WebAssembly, sin GPU ni backend remoto.
- Verificación de integridad de pesos en tiempo de carga mediante hashes BLAKE3.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión o modo thinking para esta variante.

## Casos de uso

- Dictado por voz en aplicaciones web: un editor o formulario en el navegador puede transcribir audio del micrófono en local, sin enviar la grabación a un servidor, lo que simplifica el cumplimiento de RGPD en productos europeos.
- Asistentes de voz embebidos en sitios corporativos: el modelo sostiene la conversación en audio y texto dentro de la propia página, con la ventaja de que el coste de inferencia recae en el cliente y no en infraestructura propia.
- Subtitulado en tiempo real de reuniones y webinars: al ejecutarse en la CPU del equipo del usuario, la transcripción no requiere subir el audio a un servicio externo y evita cuellos de botella de ancho de banda.
- Accesibilidad: lectura en voz alta de contenido y conversión de voz a texto para usuarios con discapacidad visual o motriz, aprovechando la salida de habla del códec incluido.
- Quioscos y terminales sin conectividad: despliegues en ferias, comercio o administración pública donde el dispositivo no tiene red fiable y se necesita interacción por voz totalmente offline.
- Prototipado rápido de agentes de voz: investigadores y desarrolladores pueden validar flujos conversacionales con audio sin aprovisionar GPU, usando el Space público como referencia y el runtime WASM como destino.
- Aplicaciones de campo con datos sensibles: grabación y transcripción de notas de voz en entornos sanitarios, jurídicos o de auditoría donde el audio no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU mediante WebAssembly, no hay requisito de memoria de GPU.
- Memoria del dispositivo: el bundle ocupa 2,3 GB en disco o caché; hay que prever margen adicional para el propio runtime WASM y el buffer de audio, por lo que un equipo con 4 GB o más de RAM libre es un punto de partida razonable.
- GPU: no se requiere ni se menciona soporte de aceleración por GPU (A100, H100, RTX 4090 u otras) en la información disponible.
- Compatibilidad consumer: cualquier equipo de escritorio o portátil con un navegador que soporte WebAssembly; el rendimiento dependerá de la CPU del cliente y no se han publicado cifras.
- Opciones de despliegue: exclusivamente el runtime `liquidai-lmf3-wasm` con el bundle `fusor-ai`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato no es safetensors ni GGUF.
- Latencia y throughput: no disponibles. La primera carga incluye la descarga y verificación BLAKE3 de las partes del bundle, cuyo coste no se cuantifica en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fusorlabs/lfm3-audio-2b-web` | ~2B | no disponible | bundle `fusor-ai` (q7) | CPU, navegador (WASM) | LFM Open License v1.0 | repo con 0 descargas, 0 likes |
| `LiquidAI/LFM3-Audio-2B` (base) | ~2B | no disponible | checkpoint tipo PyTorch/safetensors (se infiere del texto de la card) | GPU o CPU con tooling estandar | LFM Open License v1.0 | checkpoint oficial de Liquid AI |
| Resto de la familia LFM3 (texto, vision, omni, decision) | clase 2B | no disponible | no disponible | no disponible | no disponible | anunciados el 27-10-2026 |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros fabricantes (por ejemplo, modelos de audio de tamano similar); esta informacion no esta disponible.

## Limitaciones y advertencias

- Formato propietario: no es un checkpoint PyTorch ni safetensors; solo carga en el runtime `liquidai-lmf3-wasm`. No se puede usar con transformers, vLLM, llama.cpp ni herramientas habituales de fine-tuning.
- Cuantizacion fija: el unico perfil publicado es `q7`. No hay variantes q4, q8, f16 ni f32, lo que limita el ajuste entre calidad y tamano.
- Licencia: LFM Open License v1.0 (etiquetada como `license: other`). Es imprescindible revisar el archivo `LICENSE` antes de un uso comercial, ya que las condiciones concretas no se detallan en la información disponible.
- Idiomas: no se declara el conjunto de idiomas soportados; no hay garantia documentada de calidad en castellano.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni informes independientes de calidad.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir transcripciones o respuestas incorrectas, especialmente con audio ruidoso o acentos no representados en el entrenamiento; no se documentan tasas de error (WER).
- Sin datos de sesgo ni de evaluación de seguridad publicados en la informacion disponible.
- Dependencia de la CPU del cliente: el rendimiento y la latencia variaran notablemente entre dispositivos; en moviles de gama baja un modelo de 2B en CPU puede resultar inviable para interacción en tiempo real.
- Coste de primera carga: la descarga de 2,3 GB y la verificación de hashes condicionan la experiencia inicial en navegador.
- Sin información sobre longitud de contexto, lo que impide planificar conversaciones largas o flujos multi-turno extensos.

## Enlaces

- [Modelo en HuggingFace: fusorlabs/lfm3-audio-2b-web](https://huggingface.co/fusorlabs/lfm3-audio-2b-web)
- [Modelo base: LiquidAI/LFM3-Audio-2B](https://huggingface.co/LiquidAI/LFM3-Audio-2B)
- [Space de demostracion: fusorlabs/liquidai-lmf3-wasm](https://huggingface.co/spaces/fusorlabs/liquidai-lmf3-wasm)
- [Runtime: liquidai-lmf3-wasm](https://github.com/fusor-rs/liquidai-lmf3-wasm)
- [Libreria: fusor-ai](https://github.com/fusor-rs/fusor-ai)
- [Documentacion oficial de LFM3-Audio-2B (Liquid Docs)](https://docs.liquid.ai/lfm/models/lfm3-audio-2b)
- [Anuncio de la familia LFM3 (unite.ai)](https://www.unite.ai/liquid-ai-launches-lfm3-family-of-six-open-weight-2b-class-models/)
- [Analisis de la familia LFM3 (explainx.ai)](https://explainx.ai/blog/liquid-ai-lfm3-open-weight-2b-family-text-vision-audio-omni-decision-models-2026)
- [Ficha de LFM3 Audio 2B en AI Agent Store](https://aiagentstore.ai/ai-models/lfm3-audio-2b)
