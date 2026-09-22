# BRWA-AI/brwa-qwen3-sorani-endpoint

## Resumen

BRWA-AI/brwa-qwen3-sorani-endpoint es un ajuste fino del modelo Qwen/Qwen3-ASR-1.7B orientado al reconocimiento automatico del habla (ASR) en kurdo central o sorani (codigo ISO ckb). Lo publica el usuario BRWA-AI sobre la base multimodal Qwen3-ASR-1.7B de Alibaba Qwen, y su objetivo declarado es cubrir un idioma de bajos recursos para el que existen pocos sistemas de transcripcion de calidad. El repositorio acumula 2.038.052.480 parametros (unos 2,04 B) en formato safetensors, con un tamano de repositorio de 10,1 GB, licencia apache-2.0 y etiqueta endpoints_compatible.

El modelo resuelve el problema de la transcripcion de audio en kurdo sorani reutilizando el decodificador linguistico de un modelo multimodal de Qwen3, en lugar de entrenar un ASR desde cero. Segun la model card, el comportamiento es muy bueno con habla estandar, academica o formal (informativos, audiolibros, discursos), con ortografia, gramatica y puntuacion cercanas a lo correcto; con dialectos muy marcados (por ejemplo el de Hewleri/Erbil) o habla conversacional rapida el resultado es aproximado y el modelo tiende a mapear la pronunciacion dialectal a la grafia estandar mas cercana.

Su relevancia actual es doble: por un lado aporta una primera version especifica para ckb sobre una base multimodal moderna, y por otro se posiciona explicitamente como checkpoint de partida para ajustes de dominio (terminologia medica, legal o acentos regionales concretos). No se han publicado resultados cuantitativos de benchmarks ni un volumen de descargas o valoraciones que permitan validacion independiente (0 descargas y 0 likes en el momento del analisis).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal (LMM) de tipo ASR basado en Qwen3-ASR-1.7B: codificador de audio y decodificador tipo transformer Qwen3. Detalle interno de capas y atencion: no disponible |
| Parametros totales | 2.038.052.480 (~2,04 B) segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en bfloat16 en los ejemplos de uso; no se documentan cuantizaciones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | kurdo central / sorani (ku, ckb). Etiqueta de idioma del repo: ku |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 10,1 GB) |

## Arquitectura y entrenamiento

La model card describe el resultado como un modelo multimodal grande (LMM) adaptado, partiendo de Qwen/Qwen3-ASR-1.7B. Es decir, se conserva la pila de un ASR multimodal de la familia Qwen3 (codificacion de audio mas decodificacion autoregresiva con el modulo linguistico de Qwen3) y se realiza un ajuste fino supervisado sobre datos de audio y transcripciones en sorani. El autor afirma haber ensenado al modelo el idioma, de modo que el ajuste se centra en la lengua y la ortografia mas que en la capacidad acustica bruta.

No se especifican en la informacion disponible el numero de tokens de audio utilizados, la composicion del dataset, la duracion total en horas, ni si hubo etapas de RLHF, DPO o preferencias. Tampoco se detallan innovaciones tecnicas propias mas alla del propio ajuste al idioma. Un detalle operativo relevante que si aparece es la infraestructura de inferencia: envoltorio Python `qwen_asr` con `Qwen3ASRModel`, audio remuestreado a 16 kHz, `dtype=torch.bfloat16`, `device_map="cuda:0"` y decodificacion por haces (`num_beams=5`, `max_new_tokens=256` en el ejemplo). El autor tambien indica que la logica LLM interna del modelo ayuda a mapear pronunciaciones dialectales a grafias correctas, lo que implica que parte del comportamiento depende del conocimiento linguistico aprendido y no solo de la senal acustica.

## Capacidades

- Reconocimiento automatico del habla en kurdo central (sorani, ckb) con salida en alfabeto arabe-persa y ortografia estandar.
- Transcripcion de habla formal, academica y de medios (informativos, audiolibros, discursos) con puntuacion y gramatica cuidadas segun el autor.
- Manejo aproximado de dialectos regionales (por ejemplo Hewleri/Erbil) y de habla conversacional rapida, priorizando una salida plausible sobre una transcripcion literal.
- Reconocimiento de prestamos del persa y el arabe, con indicacion de transcribirlos en su forma escrita estandar mediante `system_prompt` personalizado.
- Soporte de prompt de sistema para definir el rol del transcriptor y las reglas de normalizacion.
- Procesamiento de audio largo por fragmentos mediante el envoltorio `qwen_asr` y la libreria `librosa`.
- Punto de partida para ajuste fino de dominio (medico, legal, acentos concretos) segun la propia model card.
- Compatibilidad declarada con Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- Integracion en flujo grafico mediante el nodo ComfyUI-Qwen3-ASR.
- Tool calling, function calling, agentes, vision, audio generativo o modo de razonamiento explicito: no documentado en la informacion disponible.

## Casos de uso

- Transcripcion de informativos y radio en kurdo sorani: el modelo rinde especialmente bien con locucion formal y estandar, por lo que es adecuado para generar texto de archivo a partir de boletines y programas de noticias sin apenas post-edicion.
- Subtitulado y audiolibros: para narracion academica o literaria, el autor reporta ortografia y puntuacion casi perfectas, lo que permite generar subtitulos o transcripciones de libros hablados con revision minima.
- Creacion de corpus linguisticos para investigacion: al producir texto en ortografia estandar, sirve para construir corpus de sorani etiquetados a partir de entrevistas y grabaciones, un recurso escaso para idiomas de bajos recursos.
- Ajuste fino especifico de dominio: al ser un checkpoint ya adaptado al idioma, se puede afinar sobre un conjunto pequeno de terminologia medica, juridica o administrativa en kurdo, reduciendo el coste de computo frente a partir del modelo base.
- Indexacion y busqueda de archivos sonoros: transcribir un archivo de radio o television y volcar el texto a un indice de busqueda permite localizar fragmentos por palabra clave, algo inviable sin ASR en el idioma.
- Accesibilidad y documentacion de reuniones: transcripcion de sesiones y actas en kurdo central para posteriores resumenes automaticos, asumiendo revision humana cuando haya dialectos marcados.
- Atencion al cliente en kurdo sorani: reconocimiento de consultas habladas para enrutarlas a un flujo de texto; conviene mantener una capa de validacion por el riesgo de normalizacion excesiva en habla coloquial.
- Preservacion de patrimonio oral: transcripcion de grabaciones historicas y entrevistas con hablantes mayores, con el modelo como primer paso y curacion posterior por linguistas nativos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (tipo WER o CER) en la informacion disponible. La model card unicamente ofrece una valoracion cualitativa del autor, resumida aqui para no confundirla con mediciones:

| Escenario | Evaluacion del autor (cualitativa) | Metrica cuantitativa |
|---|---|---|
| Kurdo sorani academico o estandar | Muy bueno, con ortografia, gramatica y puntuacion casi perfectas | no disponible |
| Dialectos marcados (Hewleri/Erbil) y habla conversacional rapida | Aproximado; prioriza la grafia kurda mas cercana sobre la literalidad | no disponible |
| Comparacion con Whisper u otros ASR | no disponible | no disponible |

No se dispone de WER, CER, ni resultados sobre conjuntos publicos de kurdo, ni de comparaciones medidas contra Whisper large-v3, MMS u otros sistemas para ckb.

## Requisitos de hardware

- VRAM estimada en bfloat16: unos 4,1 GB solo para pesos (2,04 B parametros), mas activaciones y cache de decodificacion; en la practica, del orden de 6 a 8 GB para audio de duracion corta.
- VRAM estimada en fp32: unos 8,2 GB para pesos, mas overhead; el repositorio de 10,1 GB apunta a que los pesos pueden estar en mayor precision de la esperada para bf16, aunque este extremo no esta documentado.
- GPU profesionales: A100, H100, L40S o A10G son suficientes de sobra; el modelo es pequeno para este segmento.
- GPU de consumo: cabe con holgura en RTX 3090, RTX 4090, RTX 4080 y RTX 4070 Ti (12-24 GB); en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) es viable en bf16 con audio corto y sin batching agresivo.
- CPU: no se documenta soporte ni rendimiento en CPU; el unico ejemplo oficial usa `device_map="cuda:0"` con bfloat16.
- Opciones de despliegue: envoltorio `qwen_asr` (libreria oficial de Qwen3-ASR), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y el nodo ComfyUI-Qwen3-ASR. Soporte en vLLM, TGI, llama.cpp u Ollama: no documentado.
- Latencia y throughput: no disponibles. Los ejemplos de inferencia usan decodificacion por haces con 5 beams, lo que penaliza la latencia frente a decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en sorani (ckb) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brwa-qwen3-sorani-endpoint | 2,04 B | no disponible | Valoracion cualitativa del autor: bueno en habla estandar, aproximado en dialectos | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-ASR-1.7B (base) | 1,7 B (nombre); 2,04 B en el ajuste segun safetensors | no disponible | No especifico para kurdo; requiere ajuste | no disponible en la informacion proporcionada | Hugging Face |
| Whisper large-v3 | ~1,55 B | 30 s por ventana | Multilingue, cobertura de kurdo limitada y sin ajuste especifico | MIT (habitual en Whisper) | Amplia, muy desplegado |
| rzgar/qwen3-asr-sorani-kurdish-ckb-v1 y rzgar/whisper-large-v3-sorani-kurdish-ckb-v2 | no disponible | no disponible | no disponible | no disponible | Referenciados como origen de audios de demo en la model card |

No se dispone de datos que permitan una comparacion cuantitativa de calidad (WER/CER) entre estas alternativas.

## Limitaciones y advertencias

- Ausencia total de validacion cuantitativa: no hay WER ni CER publicados, y el repositorio tiene 0 descargas y 0 likes, por lo que no existe retroalimentacion de la comunidad que confirme las afirmaciones de la model card.
- Riesgo de normalizacion y alucinacion: el propio autor indica que, ante dialectos, el modelo mapea la pronunciacion a la grafia estandar mas cercana. Esto implica que puede producir texto plausible pero no literal, lo que es inaceptable en contextos forenses o legales sin verificacion humana.
- Variabilidad dialectal: el rendimiento cae en habla conversacional rapida y dialectos regionales (Hewleri/Erbil); el modelo no esta garantizado para todas las variedades del kurdo.
- Cobertura linguistica limitada: la etiqueta de idioma es `ku` con foco en sorani (ckb); no se documenta soporte para kurmanji (kmr), zazaki ni otras variedades.
- Prestamos linguisticos: requiere instrucciones explicitas en el `system_prompt` para transcribir prestamos del persa y el arabe de forma estandarizada, lo que anade dependencia del prompt.
- Sin datos de entrenamiento publicados: se desconoce el dataset, su procedencia, la duracion de audio y si existe consentimiento o licencia sobre las grabaciones; esto complica la evaluacion de sesgos y de cumplimiento.
- Cuantizacion no documentada: no hay versiones GGUF ni formatos para despliegue en CPU o en hardware muy limitado.
- Licencia apache-2.0: permite uso comercial y modificacion, pero obliga a conservar avisos de copyright y licencia y a declarar cambios; conviene verificar tambien las condiciones del modelo base Qwen3-ASR-1.7B.
- Higiene de repositorio: la model card mezcla rutas de audio alojadas en otros repositorios (`rzgar/...`) y un ejemplo de codigo truncado, lo que sugiere un mantenimiento minimo y poca verificacion del material publicado.
- Tamano del repositorio de 10,1 GB para 2,04 B parametros: superior al esperado para pesos bf16 (~4,1 GB), lo que puede indicar pesos en fp32 o ficheros adicionales; conviene inspeccionar el repositorio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRWA-AI/brwa-qwen3-sorani-endpoint
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Documentacion de entorno y uso del base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B#environment-setup
- Nodo ComfyUI para Qwen3-ASR: https://github.com/DarioFT/ComfyUI-Qwen3-ASR
- Repositorio de audio de demo citado en la model card: https://huggingface.co/rzgar/qwen3-asr-sorani-kurdish-ckb-v1
- Repositorio de audio de demo (Whisper sorani) citado en la model card: https://huggingface.co/rzgar/whisper-large-v3-sorani-kurdish-ckb-v2
- Las busquedas web realizadas no han devuelto papers, blogs ni repositorios relevantes sobre este modelo concreto; los unicos resultados obtenidos eran foros sin relacion con el tema.
