# Aryan1245678/DecodeX_V2

## Resumen

DecodeX V2 es un modelo de clasificacion de audio desarrollado por el usuario Aryan1245678 y publicado en HuggingFace. Se presenta como el motor neuronal de la plataforma DecodeX, orientado a la deteccion de voces sinteticas, suplantadas o generadas por IA en tiempo real, con el objetivo de actuar como cortafuegos contra fraude vocal y ataques de ingenieria social basados en deepfakes de voz. Esta construido sobre la arquitectura wav2vec2 y cuenta con 94.569.090 parametros, un tamano contenido que lo situa en el rango de los modelos base de representacion de voz.

El modelo se plantea para despliegue en hardware de borde y para integracion en centralitas PBX y enlaces SIP, ingiriendo flujos PCM crudos normalizados mediante optimizacion matematica Z-Score y devolviendo vectores de amenaza con alta confianza. Segun la model card, forma parte de una arquitectura de doble modelo con verificacion cruzada, aunque no se detalla la composicion del segundo componente ni el mecanismo exacto de fusion de decisiones.

Su relevancia actual reside en el crecimiento de estafas por clonacion de voz, un vector de ataque en aumento. Sin embargo, la ficha debe leerse con cautela: el modelo no tiene descargas ni interacciones registradas, no hay publicacion cientifica asociada y la unica metrica disponible es una exactitud declarada por el autor sobre el split de entrenamiento del propio dataset, sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer sobre extractor convolucional de audio), tarea de clasificacion de audio |
| Parametros totales | 94.569.090 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada es audio muestreado a 16 kHz, sin ventana de tokens declarada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificador acustico; no se declara dependencia idiomatica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline | audio-classification |
| Fecha de publicacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una optimizacion de la familia wav2vec2 aplicada a clasificacion de audio. Esto implica un extractor de caracteristicas convolucional que convierte la forma de onda PCM en representaciones latentes, seguido de un codificador transformer y una cabeza de clasificacion. El audio se remuestrea y normaliza a 16 kHz, y la model card menciona explicitamente una normalizacion por Z-Score de las senales antes de la inferencia. No se especifica el numero de capas, la dimension oculta ni la configuracion exacta del encoder, aunque por el recuento de parametros (94,5 millones) corresponde al orden de magnitud de un wav2vec2-base.

Los datos de entrenamiento se describen genericamente como "muestras de voz autenticas y sinteticas de alta fidelidad agregadas", remuestreadas y normalizadas a 16 kHz. No se indica el numero de horas de audio, la procedencia de las muestras, la proporcion entre clases autentica y sintetica, ni los generadores de voz utilizados para las muestras falsas, lo cual es relevante para estimar el riesgo de sobreajuste a un conjunto concreto de vocoders. Tampoco se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador.

El procedimiento de entrenamiento si esta detallado: 5 epocas, learning rate 3e-05, batch total de 128 (batch de 32 con 4 pasos de acumulacion de gradiente), optimizador Adam con betas (0,9; 0,999) y epsilon 1e-08, planificador coseno con ratio de calentamiento de 0,1 y semilla 42. Se ejecuto con Transformers 4.41.2, PyTorch 2.1.2, Datasets 2.19.2 y Tokenizers 0.19.1. La perdida de validacion descendio de 0,0514 en la primera epoca a 0,0141 en la quinta, con una exactitud final declarada de 0,9973. No se menciona ninguna innovacion tecnica adicional como atencion lineal, decodificacion especulativa o destilacion.

## Capacidades

- Clasificacion binaria (o de pocas clases) de audio para discriminar voz autentica de voz sintetica, clonada o suplantada.
- Inferencia pensada para tiempo real o cuasi tiempo real, con enfasis declarado en despliegue en hardware de borde.
- Ingesta de flujos PCM crudos normalizados por Z-Score a 16 kHz, lo que encaja con capturas telefonicas y de centralita.
- Salida de "vectores de amenaza" con confianza, segun la descripcion del autor, orientada a alimentar una decision automatizada de bloqueo.
- Integracion prevista en una arquitectura de doble modelo con verificacion cruzada (segundo modelo no documentado en esta ficha).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un clasificador, no un modelo generativo).
- Capacidades multilingues: no disponibles ni declaradas.
- Capacidades especiales (modo de razonamiento, vision, audio generativo, texto): no disponible.

## Casos de uso

- Cortafuegos vocal en centralita PBX: el modelo se situaria en el camino del audio entrante de una llamada corporativa para puntuar cada fragmento y activar una alerta o el bloqueo de la llamada cuando la probabilidad de voz sintetica supere un umbral configurable.
- Proteccion de enlaces SIP frente a fraude del CEO: en un escenario de suplantacion de directivos para autorizar transferencias, el clasificador actuaria como segunda verificacion sobre la voz del interlocutor antes de escalar la peticion a un humano.
- Verificacion de identidad en atencion telefonica bancaria: antes de desbloquear operaciones sensibles, el sistema podria comprobar que la voz del cliente no procede de un vocoder, complementando (nunca sustituyendo) la autenticacion multifactor existente.
- Filtrado en plataformas de mensajeria de voz: analisis de notas de voz entrantes para marcar posibles contenidos generados por IA y aplicar etiquetado o cuarentena.
- Monitorizacion forense de grabaciones: procesamiento por lotes de audio archivado para localizar segmentos sospechosos de sintesis y priorizar la revision manual por parte de un analista.
- Despliegue en dispositivo de borde para privacidad: al tener 94,5 millones de parametros, puede ejecutarse localmente en un equipo modesto o en una pasarela de telefonia, evitando enviar audio de conversaciones a la nube.
- Kiosco o linea de atencion automatizada: verificacion continua de que las interacciones recibidas no son replicas generadas, como capa adicional de seguridad antifraude.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card y en el model-index. No hay verificacion externa ni se especifica el tamano del conjunto de evaluacion, por lo que deben interpretarse con cautela.

| Tarea | Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| Clasificacion de audio | audiofolder | train | Accuracy | 0,9973 | no |

Evolucion declarada durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Exactitud |
|---|---|---|---|---|
| 1,0 | 1381 | 0,0503 | 0,0514 | 0,9858 |
| 2,0 | 2762 | 0,0327 | 0,0174 | 0,9956 |
| 3,0 | 4143 | 0,0064 | 0,0221 | 0,9950 |
| 4,0 | 5524 | 0,0003 | 0,0174 | 0,9965 |
| 5,0 | 6905 | 0,0115 | 0,0141 | 0,9973 |

No se han publicado resultados comparativos con otros detectores de voz sintetica (ASVspoof, In-the-Wild, WaveFake u otros) en la informacion disponible.

## Requisitos de hardware

- Parametros: 94,57 millones, lo que equivale a aproximadamente 378 MB en FP32 y 189 MB en FP16 para los pesos.
- VRAM estimada para inferencia: en torno a 1 GB o menos en FP32 incluyendo activaciones para fragmentos de audio cortos; menos de 1 GB en FP16.
- GPU recomendadas: cualquier GPU moderna sirve, incluidas NVIDIA RTX 3060, RTX 4090, T4, L4, A10, A100 y H100. El modelo es pequeno para todos los estandares actuales.
- Cabe en GPU de consumo: si, holgadamente, en cualquier GPU de consumo con al menos 2 GB de VRAM; tambien es viable en CPU para inferencia por lotes o en tiempo cuasi real.
- Opciones de despliegue: dado que es un modelo de clasificacion de audio basado en wav2vec2, lo natural es servirlo con la libreria Transformers mediante un pipeline de `audio-classification`, o exportarlo a ONNX / TorchScript para integracion en servicios propios. No se documenta compatibilidad con vLLM, TGI o llama.cpp, que estan orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por fragmento ni de audio procesado por segundo.
- Coste: el despliegue en CPU de gama media es plausible, pero no hay cifras declaradas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| DecodeX V2 | 94,57 M | wav2vec2 | apache-2.0 | Deteccion de voz sintetica | HuggingFace, 0 descargas |
| wav2vec 2.0 Base | 95 M | wav2vec2 | apache-2.0 (segun la distribucion de Meta) | Representaciones de voz, ajustable a clasificacion | Ampliamente disponible |
| HuBERT Base | 95 M | HuBERT | apache-2.0 (segun la distribucion de Meta) | Representaciones de voz | Ampliamente disponible |
| WavLM Base+ | 94 M | WavLM | apache-2.0 (segun la distribucion de Microsoft) | Representaciones de voz para tareas de habla | Ampliamente disponible |

Los modelos anteriores son preentrenamientos generales de representacion de voz que requieren ajuste fino para deteccion de voz sintetica; no son comparables directamente en rendimiento de deteccion. No se dispone de resultados de benchmarks de DecodeX V2 frente a detectores especificos de deepfake vocal (por ejemplo, sistemas presentados en las ediciones de ASVspoof o AASIST), por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- La exactitud de 0,9973 esta declarada sobre el split `train` del dataset `audiofolder`, no sobre un conjunto de prueba independiente. Esto indica posible fuga de datos y no permite estimar el rendimiento real en produccion.
- La metrica figura como no verificada (`verified: false`) en el model-index.
- No se documenta la composicion del dataset: numero de horas, balance de clases, generadores de voz sintetica incluidos ni procedencia de las muestras. Un detector entrenado contra un conjunto limitado de vocoders sufre degradacion severa frente a generadores nuevos.
- No hay informacion sobre sesgos por acento, idioma, sexo, edad o calidad de canal telefonico. La tasa de falsos positivos sobre hablantes de acentos poco representados es un riesgo no cuantificado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea de voz humana como sintetica (falso positivo), con impacto directo en bloqueos de llamadas legitimas.
- El modelo no tiene ninguna descarga ni interaccion registrada en el momento de redactar esta ficha, por lo que carece de validacion por parte de terceros.
- No hay publicacion cientifica, informe tecnico ni repositorio de codigo asociado que permita auditar el entrenamiento.
- Licencia apache-2.0: permite uso comercial y modificacion, con obligacion de conservar los avisos de copyright y de licencia. No impone restricciones adicionales de uso, pero tampoco ofrece garantias.
- El rendimiento declarado en condiciones de laboratorio no se traduce necesariamente a escenarios reales con ruido de fondo, compresion de codecs telefonicos (G.711, G.729, Opus) o audio recortado.
- La model card no especifica la ventana de audio necesaria por inferencia, el umbral de decision recomendado ni el comportamiento del modelo en fragmentos muy cortos.
- Para uso en seguridad o antifraude, el modelo debe emplearse como senal complementaria y nunca como unico criterio de decision, dado el riesgo de falsos positivos y negativos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Aryan1245678/DecodeX_V2
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentacion de wav2vec2 en HuggingFace: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Paper original de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos no guardan relacion con el modelo ni con clasificacion de audio y se han descartado. No se dispone de paper, blog, repositorio ni demo oficial asociados a DecodeX V2.
