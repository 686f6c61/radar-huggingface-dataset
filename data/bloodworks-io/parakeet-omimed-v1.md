# bloodworks-io/parakeet-omimed-v1

## Resumen

parakeet-omimed-v1 es un paquete de pesos para navegador del modelo de reconocimiento automatico del habla (ASR/STT) **Omi Med STT v1**, distribuido por el usuario bloodworks-io como espejo de demostracion para el runtime `parakeet.wgsl` (fork de Phlox con soporte de adaptadores por capa). No se trata de un modelo entrenado desde cero ni de un LLM de texto: es un artefacto de despliegue que empaqueta los pesos de un modelo de voz ya existente en un formato consumible por WebGPU desde el navegador.

Los pesos originales son un fine-tune de **NVIDIA Parakeet TDT 0.6B v2** con adaptadores por capa, publicado por Omi Health bajo licencia CC-BY-4.0. La arquitectura subyacente es un transductor TDT (Token-and-Duration Transducer) de aproximadamente 600 millones de parametros orientado a transcripcion de voz. Este repositorio no genera texto libre ni razona: su funcion es convertir audio en transcripcion.

Su relevancia es fundamentalmente de ingenieria: demuestra un pipeline de conversion determinista (repackaging de un checkpoint NeMo a un paquete de runtime WebGPU) con verificacion de integridad por SHA-256, empaquetado en fp16 y con paletizacion de 5 bits en las proyecciones de salida. Es relevante para quien quiera ejecutar transcripcion medica en el navegador sin servidor, aunque no esta validado clinicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con adaptadores por capa; fine-tune de NVIDIA Parakeet TDT 0.6B v2 |
| Parametros totales | Aproximadamente 600 M (heredados del modelo base Parakeet TDT 0.6B v2) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; no se especifica ventana de audio en la informacion proporcionada) |
| Tipos de cuantizacion | fp16; paletizacion de 5 bits en las proyecciones de salida (5-bit output-group palettization) |
| Idiomas soportados | No disponible |
| Licencia | Creative Commons Attribution 4.0 International (CC-BY-4.0) |
| Formato de pesos | Paquete de runtime WGSL (fp16), 33 archivos, ~413 MB; verificado por manifest y SHA-256 por archivo |

## Arquitectura y entrenamiento

El modelo base es **NVIDIA Parakeet TDT 0.6B v2**, un transductor TDT (Token-and-Duration Transducer). La variante **Omi Med STT v1** de Omi Health es un fine-tune con **adaptadores por capa**: en lugar de reentrenar todo el modelo, se anaden proyecciones adaptadoras especificas por capa que ajustan el comportamiento del modelo base, presumiblemente hacia dominio medico.

Este repositorio concreto realiza una conversion determinista del checkpoint oficial de NeMo al formato del runtime `parakeet.wgsl`. Segun la model card, el proceso incluye: (1) relleno de rango en las proyecciones de los adaptadores de 128 a 256 dimensiones con lanes a cero, de modo que las lanes anadidas quedan inertes porque `silu(0) = 0`; y (2) paletizacion de 5 bits por grupos de salida. El runtime verifica el manifest y los hashes SHA-256 por archivo en tiempo de carga. No se proporciona informacion sobre el numero de tokens de audio usados en el fine-tune, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (probablemente no aplicables a un modelo ASR).

## Capacidades

- Transcripcion de voz a texto (ASR/STT) en ingles tecnicamente derivada de un modelo orientado a ese idioma, aunque la cobertura linguistica no se detalla.
- Reconocimiento de habla con decodificacion TDT (transductor con prediccion de duracion de token), orientado a transcripcion eficiente.
- Ajuste de dominio medico mediante adaptadores por capa (fine-tune de Omi Health).
- Ejecucion en navegador a traves de WebGPU mediante el runtime `parakeet.wgsl`.
- Verificacion de integridad de pesos en carga (manifest y SHA-256 por archivo).
- NO dispone de: generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente. No es un modelo multimodal ni conversacional.

## Casos de uso

- Transcripcion de voz en el navegador sin backend: al ser un paquete WebGPU, permite dictado o transcripcion directamente en el cliente, evitando enviar audio a un servidor y reduciendo costes de infraestructura.
- Documentacion clinica asistida (con cautela): el ajuste de dominio medico sugiere uso en dictado de notas clinicas, aunque el propio autor advierte que no esta validado clinicamente ni debe usarse para diagnostico.
- Subtitulado en tiempo real en aplicaciones web: el modelo puede integrarse en un reproductor o editor que transcriba audio localmente mediante WebGPU.
- Prototipado e investigacion de ASR en navegador: sirve como referencia para evaluar el rendimiento de un transductor TDT de 600 M ejecutandose en el cliente.
- Demostraciones tecnicas del runtime Phlox: el paquete existe especificamente para la demo de navegador de Phlox, por lo que es util para reproducir y validar dicho pipeline.
- Integracion en aplicaciones de accesibilidad: transcripcion de voz a texto para personas con discapacidad auditiva en entornos web, siempre que el idioma y el dominio coincidan.
- Canalizacion hacia pipelines de NLP: la salida de transcripcion puede alimentar sistemas posteriores de resumen o busqueda, aunque este modelo no realiza esas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como WER (Word Error Rate), MMLU, HumanEval ni GSM8K, ni comparaciones cuantitativas con otros modelos ASR.

## Requisitos de hardware

- Inferencia en navegador: disenado para WebGPU mediante el runtime `parakeet.wgsl`; requiere un navegador con soporte WebGPU.
- Tamano del paquete: ~413 MB en fp16 (33 archivos), por lo que la huella de memoria del modelo en GPU es del orden de cientos de MB (aproximadamente 0,4-0,6 GB, incluyendo buffers de runtime; cifra estimada, no confirmada en la documentacion).
- GPU de escritorio: cualquier GPU con soporte WebGPU moderno (por ejemplo, gamas integradas recientes y dedicadas). No se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion proporcionada.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU de consumo con WebGPU, dado el tamano reducido del paquete; no se confirma el modelo minimo.
- Opciones de despliegue: runtime `parakeet.wgsl` (WebGPU/WGSL) para navegador; el checkpoint original puede servirse con NVIDIA NeMo, ya que deriva de un checkpoint NeMo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| parakeet-omimed-v1 (este) | ~600 M | ASR TDT + adaptadores, paquete WebGPU | CC-BY-4.0 | HuggingFace (espejo de demo) |
| nvidia/parakeet-tdt-0.6b-v2 | ~600 M | ASR TDT (modelo base) | CC-BY-4.0 | HuggingFace (NVIDIA) |
| omi-health/omi-med-stt-v1 | ~600 M | ASR TDT con adaptadores medicos | CC-BY-4.0 | HuggingFace (Omi Health) |
| Whisper large-v3 (OpenAI) | ~1.550 M | ASR encoder-decoder multilingue | MIT (segun publicacion habitual) | HuggingFace / OpenAI |

Los datos de rendimiento comparativo (WER, velocidad) no estan disponibles en la informacion proporcionada. La comparacion se limita a parametros, tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- No validado clinicamente: la propia atribucion de Omi Health indica que el modelo no esta validado y no debe usarse para diagnostico ni decisiones clinicas.
- No es un modelo de NVIDIA: NVIDIA, NeMo y Parakeet son marcas de sus respectivos propietarios; este es un fine-tune de terceros sobre un modelo NVIDIA.
- Paquete de demostracion: este repositorio es un espejo para la demo de navegador de Phlox, no la fuente canonica de los pesos. Para uso en produccion conviene referirse al modelo original de Omi Health.
- Solo fp16: la model card indica que fp32 no esta convertido para este modelo todavia.
- Idioma no especificado: no se detalla la cobertura linguistica, lo que limita su uso multilingue sin verificacion previa.
- Riesgo de errores de transcripcion (alucinacion en ASR): como todo modelo de voz, puede producir transcripciones incorrectas, especialmente en audio ruidoso o dominios no cubiertos por el fine-tune.
- Restricciones de licencia: CC-BY-4.0 exige atribucion. Es apta para uso comercial siempre que se cumplan los terminos de atribucion de la cadena de derivacion (NVIDIA y Omi Health).
- Falta de metricas: sin datos publicos de WER ni benchmarks, no es posible evaluar su calidad objetiva frente a alternativas.
- Cero traccion en la plataforma (0 descargas, 0 likes) en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloodworks-io/parakeet-omimed-v1
- Modelo original (Omi Health): https://huggingface.co/omi-health/omi-med-stt-v1
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Fork del runtime: https://github.com/narcotic-sh/parakeet.wgsl
- Demo de navegador Phlox: https://github.com/bloodworks-io/phlox
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
