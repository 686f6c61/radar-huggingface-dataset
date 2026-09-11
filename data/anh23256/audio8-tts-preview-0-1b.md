# anh23256/Audio8-TTS-Preview-0.1b

## Resumen

Audio8 TTS Preview 0.1B es un modelo de sintesis de voz (text-to-speech) con soporte de clonacion de voz zero-shot, publicado por Audio8 y distribuido en HuggingFace bajo el identificador `anh23256/Audio8-TTS-Preview-0.1b`. Su propuesta central es el tamano: el modelo generativo principal ronda los 170 millones de parametros (169.779.904 segun el recuento de safetensors del repositorio), y el decodificador del codec neural anade aproximadamente 120 millones adicionales. Frente a alternativas multilingues contemporaneas que se mueven entre 0,8B y 8,5B de parametros, esta version busca hacer viable la clonacion de voz zero-shot en hardware modesto, incluido CPU.

Tecnicamente emplea una arquitectura denominada Audio8 Falcon H1, con dos ramas autorregresivas: una rama lenta (slow AR) de 24 capas que predice tokens semanticos y una rama rapida (fast AR) de 4 capas que predice los codebooks del codec condicionada por el estado oculto de la rama lenta. El codec opera a 44,1 kHz con 10 codebooks de 4.096 entradas cada uno y 2.048 muestras por trama (unas 21,5 tramas por segundo). El contexto maximo es de 2.048 posiciones empaquetadas de texto y audio.

La relevancia actual del modelo esta en su perfil de despliegue: existe una variante ONNX INT8 para CPU que ocupa aproximadamente 0,4 GiB en memoria tras la carga y no requiere CUDA ni PyTorch en tiempo de ejecucion. Esto lo situa como candidato para entornos edge, integracion en aplicaciones de escritorio y servicios con presupuesto de memoria muy limitado, a costa de sacrificar calidad frente a modelos de mayor escala. Los idiomas principales declarados son chino e ingles; aleman, espanol, frances, italiano, japones y coreano se etiquetan como evaluacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1, transformer autorregresivo de dos ramas (slow AR + fast AR) |
| Parametros totales | 169.779.904 en safetensors (modelo principal); aproximadamente 290M contando el decodificador del codec (~120M adicionales) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto y audio |
| Tipos de cuantizacion | bf16/fp16 nativo; ONNX INT8 por token en slow AR y fast AR con codec en FP16 (variante ONNX publicada aparte) |
| Idiomas soportados | chino y ingles (principales); aleman, espanol, frances, italiano, japones y coreano (experimentales) |
| Licencia | audio8-community-license-v1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors para el modelo principal, `codec.pth` para el decodificador del codec, ONNX para la variante INT8 |

Detalles adicionales de configuracion:

| Componente | Configuracion |
|---|---|
| Rama slow AR | 24 capas, anchura 512, 8 cabezas de atencion, 2 cabezas KV |
| Rama fast AR | 4 capas, anchura 512, 8 cabezas de atencion, 2 cabezas KV |
| Tokens acusticos | 10 codebooks, 4.096 entradas por codebook |
| Codec | 44,1 kHz, 2.048 muestras por trama (aproximadamente 21,5 tramas/s) |
| Decodificador del codec | aproximadamente 120M de parametros, incluido en `codec.pth` |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de generacion jerarquica en dos escalas temporales. La rama slow AR, con 24 capas y anchura 512, procesa la secuencia empaquetada de texto y audio y produce tokens semanticos a baja cadencia. La rama fast AR, con solo 4 capas de la misma anchura, toma el estado oculto de la rama lenta como condicionamiento y predice los 10 codebooks acusticos del codec. Ambas ramas usan atencion con 8 cabezas de consulta y 2 cabezas KV, lo que reduce el coste de la cache KV. El codec neural funciona a 44,1 kHz y esta incluido en el repositorio, de modo que no hace falta descargar un checkpoint de codec aparte.

El checkpoint publicado se describe como un "v4 mixed checkpoint" e incluye ademas el tokenizador, el procesador y codigo remoto de HuggingFace (requiere `trust_remote_code=True`). La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion; esa informacion no esta disponible. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion lineal: la atencion es estandar con GQA. La innovacion principal declarada es la reduccion de escala manteniendo clonacion zero-shot, junto con la cuantizacion INT8 de las dos ramas autorregresivas para inferencia en CPU.

## Capacidades

- Sintesis de voz multilingue a partir de texto, con salida de audio a 44,1 kHz.
- Clonacion de voz zero-shot: basta un audio de referencia y su transcripcion para imitar el timbre, sin fine-tuning.
- Generacion de habla en chino e ingles con calidad principal; aleman, espanol, frances, italiano, japones y coreano en regimen experimental.
- Procesamiento conjunto de texto y audio en una unica secuencia empaquetada de hasta 2.048 posiciones, lo que permite condicionar por referencia dentro del mismo contexto.
- Control de muestreo mediante `temperature`, `top_p`, `top_k` y `max_new_tokens`, con `return_dict_in_generate` para obtener formas de onda y longitudes.
- Inferencia en CPU mediante la variante ONNX INT8, con flujo completo de CLI, servicio web/HTTP, PCM en streaming y registro de voces.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada mas alla del audio de referencia para clonacion.

## Casos de uso

- Clonacion de voz para locucion personalizada: con un unico audio de referencia y su transcripcion se puede generar narracion con la voz del usuario, util para audiolibros, podcasting o contenido corporativo donde se requiere consistencia de voz entre sesiones.
- Doblaje y localizacion de contenido: al cubrir ocho idiomas, permite generar pistas de voz en distintos idiomas a partir del mismo guion, aunque la calidad fuera de chino e ingles debe validarse caso por caso por tratarse de idiomas experimentales.
- Atencion al cliente e IVR: el modelo puede generar respuestas habladas con una voz de marca registrada previamente, integrándose en un backend HTTP gracias a la variante ONNX, que evita depender de GPUs en el servidor.
- Accesibilidad y lectores de pantalla: su huella de memoria reducida (aproximadamente 0,4 GiB en la configuracion ONNX INT8 probada en Linux x86_64) permite empaquetarlo en aplicaciones de escritorio o dispositivos de bajo consumo para lectura de texto en voz alta.
- Prototipado y desarrollo en edge: con un presupuesto de VRAM de alrededor de 1 GB en bf16, cabe en GPUs de gama de entrada y en mini-PC, lo que facilita demos y pruebas de concepto sin infraestructura dedicada.
- Generacion de datos sinteticos de audio: se pueden producir corpus hablados con voces controladas en varios idiomas para aumentar datasets de entrenamiento de modelos ASR o de diarizacion, siempre que la licencia lo permita.
- Personajes y asistentes en videojuegos o aplicaciones interactivas: la rama rapida de 4 capas y el contexto de 2.048 posiciones permiten generar turnos de habla con latencia contenida en hardware modesto, con una voz fija por personaje.
- Preservacion de voz asistida: con consentimiento explicito, permite reconstruir la voz de personas con perdida de habla, un uso sensible que exige controles de acceso y verificacion de identidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona una comparativa de escalas de parametros declaradas por los respectivos informes de modelo, sin metricas objetivas de calidad (WER, MOS, similitud de hablante) ni comparaciones en tareas estandar.

| Modelo | Escala del modelo principal declarada |
|---|---:|
| Audio8 TTS Preview 0.1B | ~0,17B |
| Audio8 TTS Preview 0.6B | ~0,6B |
| IndexTTS2.5 | ~0,8B |
| CosyVoice3 | ~1,5B |
| VoxCPM2 | ~2,3B |
| Fish S2 Pro | ~4,6B |
| Higgs Audio v2 | ~4,7B |
| MOSS-TTS | ~8,5B |

El propio autor advierte que estas cifras son escalas de referencia aproximadas recogidas de los informes correspondientes y no una auditoria estricta de recuento de parametros, y que el checkpoint de 0,1B no pretende igualar la calidad de los modelos mayores en todos los idiomas.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros publicado; no son cifras oficiales del autor salvo donde se indique.

- VRAM estimada en bf16/fp16: aproximadamente 0,34 GB para el modelo principal y 0,24 GB para el decodificador del codec, es decir, en torno a 0,6 GB de pesos, que con activaciones, cache KV y buffers de audio se traduce en un consumo practico del orden de 1 a 2 GB.
- VRAM estimada en fp32: en torno a 1,2 GB solo en pesos, con un consumo practico aproximado de 2 a 3 GB.
- Cache KV: con 24 capas, 2 cabezas KV y dimension de cabeza 64 en la rama lenta, la cache a 2.048 posiciones en bf16 ocupa del orden de decenas de MB, por lo que no es un factor limitante.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas ultimas y no las aprovecha.
- GPU de consumo: si cabe en GPUs de gama de entrada e incluso en iGPU con memoria compartida; no es un modelo que requiera aceleradores de datacenter.
- Despliegue en CPU: la variante ONNX INT8 (slow AR y fast AR en INT8 por token, codec en FP16) ocupa aproximadamente 0,4 GiB tras la carga en la configuracion Linux x86_64 probada, sin necesidad de CUDA, PyTorch ni Transformers en tiempo de ejecucion.
- Opciones de despliegue documentadas: Transformers con `trust_remote_code=True` sobre PyTorch 2.5 o superior con CUDA, y ONNX Runtime con `CPUExecutionProvider` (flujo CLI, web, HTTP, PCM en streaming y registro de voces). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card no publica cifras de tiempo real ni de factor de tiempo real (RTF).

## Comparativa con modelos similares

La informacion disponible solo permite comparar la escala de parametros declarada por cada proyecto. No hay datos de contexto, licencia, rendimiento ni disponibilidad en la informacion proporcionada para los modelos alternativos, por lo que esas celdas se marcan como no disponibles.

| Modelo | Parametros (declarados) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Audio8 TTS Preview 0.1B | ~0,17B (+ ~0,12B de codec) | 2.048 posiciones | audio8-community-license-v1.0 | HuggingFace, PyTorch y ONNX INT8 |
| Audio8 TTS Preview 0.6B | ~0,6B | no disponible | no disponible | no disponible |
| IndexTTS2.5 | ~0,8B | no disponible | no disponible | no disponible |
| CosyVoice3 | ~1,5B | no disponible | no disponible | no disponible |
| VoxCPM2 | ~2,3B | no disponible | no disponible | no disponible |
| Fish S2 Pro | ~4,6B | no disponible | no disponible | no disponible |
| Higgs Audio v2 | ~4,7B | no disponible | no disponible | no disponible |
| MOSS-TTS | ~8,5B | no disponible | no disponible | no disponible |

La ventaja competitiva declarada por el autor es exclusivamente el tamano y la viabilidad de despliegue en CPU, no la paridad de calidad con los modelos de mayor escala.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles estan declarados como principales; el resto (aleman, espanol, frances, italiano, japones, coreano) son evaluaciones experimentales y su calidad no esta garantizada.
- Riesgo de alucinacion acustica: como todo modelo autorregresivo de audio, puede producir artefactos, prosodia incorrecta, omisiones o repeticiones, especialmente en textos largos o con estructuras poco frecuentes.
- Contexto limitado: 2.048 posiciones empaquetadas que deben acomodar simultaneamente el texto y el audio de referencia, lo que restringe la longitud de las referencias de clonacion y de los fragmentos generados por pasada.
- Clonacion de voz: la capacidad zero-shot abre riesgos de suplantacion de identidad y de uso fraudulento; es imprescindible contar con consentimiento explicito y mecanismos de marca de agua o verificacion en despliegues publicos.
- Licencia: se trata de una licencia propietaria de comunidad (`audio8-community-license-v1.0`, etiquetada como `other` en HuggingFace). No se dispone del texto de la licencia en la informacion proporcionada, por lo que hay que revisar el enlace de licencia antes de cualquier uso comercial.
- Codigo remoto: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo de terceros al cargarlo; conviene auditar el repositorio antes de usarlo en produccion.
- Discrepancia de identificadores: el repositorio consultado pertenece al usuario `anh23256`, mientras que la model card y los ejemplos de uso hacen referencia a `Audio8/Audio8-TTS-Preview-0.1b`. Conviene verificar que el contenido y los pesos coinciden antes de desplegarlo.
- Recuento de parametros: la cifra de safetensors (169.779.904) no incluye el decodificador del codec, por lo que el coste real de memoria es superior al que sugiere el total reportado por HuggingFace.
- Madurez: el repositorio registra cero descargas y cero valoraciones en el momento de la consulta, con fecha de creacion y ultima actualizacion identicas, lo que indica ausencia de validacion por parte de la comunidad.
- Versiones: la instalacion requiere `transformers>=4.57.0,<5`, `torch>=2.5.0` y Python 3.11 o superior; versiones fuera de ese rango pueden romper la carga del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anh23256/Audio8-TTS-Preview-0.1b
- Referencia de modelo citada en la model card: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Muestras de audio de la version 0.1B: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Variante ONNX INT8 para CPU: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Guia de despliegue con ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
- Video de presentacion: https://github.com/user-attachments/assets/d5f2b9a3-a87d-49a3-9df4-a3d1c377531d
