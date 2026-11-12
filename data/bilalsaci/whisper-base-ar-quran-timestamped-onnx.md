# bilalsaci/whisper-base-ar-quran-timestamped-onnx

## Resumen

`whisper-base-ar-quran-timestamped-onnx` es una conversion a ONNX del modelo `tarteel-ai/whisper-base-ar-quran`, un fine-tune de Whisper Base especializado en reconocimiento de voz de recitaciones coranicas en arabe. Lo publica el desarrollador bilalsaci y su rasgo diferencial es que preserva las salidas de cross-attention necesarias para calcular marcas de tiempo a nivel de palabra, algo que la mayoria de conversiones ONNX descartan. El paquete pesa 76 MB en total (encoder de 23 MB y decoder de 53 MB) con pesos cuantizados a 8 bits.

El modelo esta pensado para ejecutarse integramente en el navegador mediante transformers.js, con backend WASM, lo que permite desplegar reconocimiento de voz arabe sin servidor. Se usa en produccion en el sitio quran.design para detectar que versiculos contiene una recitacion subida y en que momento empieza cada uno. La licencia es Apache 2.0 y el unico idioma soportado es el arabe.

Es relevante para desarrolladores que necesiten ASR ligero, client-side y con alineacion temporal fina en un dominio muy concreto (recitacion coranica), donde los Whisper genericos rinden peor por el vocabulario y la fonetica especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Base) |
| Parametros totales | no disponible (derivado de Whisper Base, ~74 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Base usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | 8 bits (solo operadores MatMul) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder 23 MB, decoder 53 MB; total 76 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Base, un transformer encoder-decoder con atencion completa sobre espectrogramas Mel de 80 canales y ventanas de 30 segundos. El modelo original fue afinado por Tarteel AI sobre recitaciones coranicas en arabe para mejorar la transcripcion en ese dominio. Esta version no reentrena el modelo: solo lo convierte a ONNX y lo cuantiza a 8 bits en las operaciones MatMul, manteniendo las salidas de cross-attention que permiten la alineacion a nivel de palabra.

Un detalle tecnico destacable es que el autor recalibro los `alignment_heads` para este fine-tune concreto, usando el conjunto `[[3,1],[4,2],[5,1],[5,4],[5,5],[5,6],[5,7]]` seleccionado sobre recitaciones de validacion. La configuracion de generacion (tokens de timestamp e identificadores de idioma) se toma de `openai/whisper-base`. El resultado es un artefacto autocontenido que expone timestamps por palabra a traves de transformers.js con `return_timestamps: 'word'`. No se documentan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Reconocimiento automatico de voz (ASR) en arabe, orientado a recitacion coranica.
- Marcas de tiempo a nivel de palabra gracias a la preservacion de cross-attentions y a los `alignment_heads` recalibrados.
- Deteccion de versiculos: permite identificar que fragmentos del Coran aparecen en un audio y cuando empieza cada uno.
- Ejecucion en navegador con transformers.js y backend WASM, sin necesidad de servidor.
- Inferencia con pesos de 8 bits, lo que reduce el peso del artefacto a 76 MB.
- Soporte de tareas de transcripcion (`task: 'transcribe'`) con especificacion de idioma (`language: 'ar'`).
- No se documentan capacidades de tool calling, agentes, vision, audio mas alla de ASR ni razonamiento multi-paso.

## Casos de uso

- Deteccion de versiculos en recitaciones subidas: el modelo transcribe el audio y, con los timestamps por palabra, el backend puede mapear cada segmento a un versiculo concreto del Coran. Es el uso real documentado en quran.design.
- Aplicaciones web de estudio del Coran sin backend de inferencia: al ejecutarse en el navegador via transformers.js, permite ofrecer transcripcion y alineacion temporal sin enviar audio a un servidor, lo que simplifica el despliegue y la privacidad.
- Herramientas de memorizacion (hifz): la alineacion por palabra permite comparar la recitacion del usuario con el texto esperado y senalar palabras omitidas o mal pronunciadas con precision temporal.
- Generacion de subtitulos sincronizados para videos de recitacion: los timestamps por palabra facilitan subtitulos palabra a palabra en arabe, utiles para canales y plataformas educativas.
- Indexacion y busqueda de archivos de audio: transcribir una biblioteca de recitaciones y almacenar los tiempos permite buscar por versiculo y saltar al instante exacto del audio.
- Prototipado rapido de ASR en arabe en entornos de investigacion: el tamano reducido (76 MB) y el formato ONNX permiten experimentar en portatiles o incluso en el navegador sin GPU.
- Verificacion de integridad de recitaciones en plataformas de contenido: comprobar automaticamente que un audio declarado como recitacion contiene efectivamente los versiculos indicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona scripts de conversion y benchmark en `bench/recognition/` del repositorio quran-design, pero no incluye cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal (ejecucion en navegador con WASM y pesos de 8 bits); el artefacto completo ocupa 76 MB en disco o memoria.
- GPU recomendadas: no se documentan; el modelo esta disenado para CPU via WASM en el navegador.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada, dado el tamano de 76 MB.
- Opciones de despliegue: transformers.js con `device: 'wasm'` y `dtype: 'q8'` (documentado); al ser ONNX, podria ejecutarse con otros runtimes ONNX, aunque no se documenta soporte explicito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Timestamps por palabra |
|---|---|---|---|---|---|---|
| bilalsaci/whisper-base-ar-quran-timestamped-onnx | ~74 M (Whisper Base) | ventanas de 30 s (no confirmado) | arabe | Apache 2.0 | ONNX 8-bit | Si (documentado) |
| tarteel-ai/whisper-base-ar-quran | ~74 M (Whisper Base) | ventanas de 30 s (no confirmado) | arabe | Apache 2.0 | safetensors (no confirmado) | No documentado en la informacion disponible |
| openai/whisper-base | ~74 M | ventanas de 30 s (no confirmado) | multilingue | MIT (no confirmado en la informacion disponible) | safetensors, ONNX | Si, con configuracion adecuada |

La comparativa se limita a estos tres modelos porque la informacion proporcionada no incluye otros ASR arabes comparables. El valor diferencial de esta version frente al modelo base de Tarteel AI es el empaquetado ONNX listo para navegador con timestamps por palabra ya calibrados.

## Limitaciones y advertencias

- Solo soporta arabe; no es un modelo multilingue.
- Especializado en recitacion coranica: el rendimiento en arabe conversacional, dialectos o ruido de fondo no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: como todo Whisper, puede generar texto plausible no presente en el audio, especialmente con silencios, musica o audio de baja calidad.
- La recalibracion de `alignment_heads` se hizo sobre recitaciones de validacion; la precision de los timestamps en otros dominios o acentos no esta garantizada.
- La cuantizacion a 8 bits puede introducir perdida de precision frente al modelo original en safetensors; no se publican metricas comparativas.
- La configuracion de generacion se hereda de `openai/whisper-base`, no del fine-tune de Tarteel AI, lo que puede afectar a comportamientos especificos del dominio.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion a Tarteel AI y al autor de la conversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni validacion externa.
- Para produccion con volumen alto, la ejecucion en navegador limita el throughput al dispositivo del usuario; no se documentan cifras de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bilalsaci/whisper-base-ar-quran-timestamped-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Organizacion Tarteel AI: https://huggingface.co/tarteel-ai
- transformers.js: https://github.com/huggingface/transformers.js
- Scripts de conversion y benchmark: https://github.com/bilalsaci/quran-design/tree/main/bench/recognition
- Aplicacion que lo usa: https://quran.saci.app (quran.design)
- Configuracion de generacion de referencia: https://huggingface.co/openai/whisper-base
