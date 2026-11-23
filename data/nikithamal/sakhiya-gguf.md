# NikitHamal/sakhiya-gguf

## Resumen

Sakhiya GGUF es la distribucion en formato GGUF del motor de sintesis de voz (TTS) Sakhiya, desarrollado por NikitHamal. No se trata de un modelo de lenguaje generativo, sino de un sistema text-to-speech de dominio especifico orientado a nepali (ne) y sanscrito (sa), empaquetado como ficheros GGUF v3 unicos que se ejecutan mediante un motor propio en C++17 sin dependencias externas. El repositorio incluye variantes por niveles o "tiers" (v1, nano, atom, atom_lite) en cuantizaciones Q8_0, Q8_0 exacta y FP16.

El modelo cuenta con aproximadamente 6,3 millones de parametros, lo que lo situa en la categoria de modelos extremadamente compactos, disenados para inferencia en entornos con recursos limitados, incluido WebAssembly en navegador y Android via JNI. Su relevancia radica en ofrecer TTS de calidad verificable (cosine de forma de onda >= 0,999 frente a PyTorch en las variantes exactas) para idiomas de bajos recursos como el nepali y el sanscrito, con un motor de inferencia autocontenido.

La licencia es "other" (no estandar), lo que exige revisar los terminos del autor antes de cualquier uso comercial. El repositorio tiene un tamano de 0,2 GB y, en el momento de la consulta, no registra descargas ni likes, lo que indica un proyecto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS (sintesis de voz) con modelo acustico y vocoder; motor GGML en C++17 |
| Parametros totales | 6.315.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | Q8_0, Q8_0 exacta (acustico FP32 + vocoder Q8_0), FP16 |
| Idiomas soportados | ne (nepali), sa (sanscrito) |
| Licencia | other (no estandar; revisar terminos del autor) |
| Formato de pesos | GGUF v3 (fichero unico por tier) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red neuronal (capas, tipo de transformer o arquitectura acustica concreta). Lo que si se documenta es la estructura de despliegue: cada tier se empaqueta como un unico fichero GGUF v3 que contiene el modelo acustico y el vocoder, ejecutado por el motor `sakhiya_ggml.hpp` del repositorio GitHub del autor. Las variantes "exact" separan el modelo acustico en FP32 y el vocoder en Q8_0, logrando una similitud de forma de onda (cosine) superior a 0,999 respecto a la implementacion de referencia en PyTorch.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. La innovacion destacable es el propio motor de inferencia: C++17 sin dependencias, con bindings para CLI (`sakhiya-cli`), libreria compartida (`libsakhiya.so`), Android JNI y WebAssembly (`sakhiya.wasm`).

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en nepali y sanscrito.
- Soporte de estilos de locucion, segun el ejemplo de la model card (`style="news"`).
- Inferencia en multiples plataformas: CLI de escritorio, libreria compartida, Android JNI y navegador via WebAssembly.
- Variantes por tier (v1, nano, atom, atom_lite) que permiten ajustar el equilibrio entre calidad y recursos.
- Verificacion de integridad mediante `SHA256SUMS.txt`.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura de noticias en nepali: el tier atom_lite con estilo `news` permite generar locuciones de articulos en entornos de bajos recursos, incluido el navegador mediante `sakhiya.wasm`.
- Accesibilidad web para hablantes de nepali: integracion del motor WASM en una pagina para leer contenido en voz alta sin backend ni dependencias de red.
- Aplicaciones Android de asistencia vocal: uso del binding JNI para sintetizar respuestas en dispositivos moviles sin conexion.
- Preservacion y ensenanza del sanscrito: generacion de pronunciacion de textos en sa para materiales educativos o herramientas de aprendizaje.
- Sistemas de anuncios o avisos automatizados en nepalí: despliegue como `libsakhiya.so` dentro de un servicio local con latencia baja gracias al tamano de 6,3 M de parametros.
- Prototipado rapido de interfaces de voz: uso del CLI `sakhiya-cli` para generar muestras de audio en pipelines de evaluacion o test de calidad antes de integrar en produccion.
- Distribucion offline en zonas con conectividad limitada: el empaquetado en un unico fichero GGUF de 0,2 GB facilita el despliegue en equipos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento objetivo es la similitud de forma de onda de las variantes exactas: cosine >= 0,999 frente a la implementacion de referencia en PyTorch.

## Requisitos de hardware

- VRAM estimada: muy baja; con 6,3 M de parametros, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU. En FP16 el peso de los parametros es de aproximadamente 12,6 MB; en Q8_0, alrededor de 6,3 MB, ademas del vocoder y el resto del grafo.
- GPU recomendadas: no se requieren; cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo. El caso de uso natural es CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer e integrada; tambien en moviles via JNI.
- Opciones de despliegue: motor propio del autor (`sakhiya-cli`, `libsakhiya.so`, Android JNI, `sakhiya.wasm`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; el diseno sin dependencias y el tamano reducido sugieren latencias bajas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sakhiya GGUF | 6,3 M | ne, sa | GGUF v3 | other | TTS con motor C++/WASM propio |
| Alternativas TTS multilingues de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |
| Alternativas TTS para idiomas de bajos recursos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Cobertura linguistica limitada a nepali y sanscrito; no es un modelo multilingue general.
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni soporta agentes.
- La licencia "other" no es estandar; es imprescindible revisar los terminos del autor antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos conocidos, pero al ser un TTS entrenado sobre un corpus no especificado, puede heredar sesgos de pronunciacion o prosodia del dataset original.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede haber errores de pronunciacion o prosodia en entradas fuera de dominio.
- El proyecto registra 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- La fecha de creacion del repositorio (2026-11-23) y la ausencia de benchmarks publicos limitan la evaluacion independiente de su calidad en produccion.
- No se documentan requisitos de memoria ni latencias, por lo que el dimensionamiento de un despliegue real requiere pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NikitHamal/sakhiya-gguf
- Repositorio GitHub del motor: https://github.com/NikitHamal/Sakhiya
- Paper: no disponible
- Blog o demo: no disponible
