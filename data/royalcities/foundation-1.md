# RoyalCities/Foundation-1

## Resumen

Foundation-1 es una familia de modelos de generacion de audio condicionados por texto desarrollada por RoyalCities y orientada especificamente a flujos de produccion musical. A diferencia de los modelos de "caption-to-music", que generan una pieza completa a partir de una descripcion general, Foundation-1 se entrena con controles estructurados de identidad de instrumento, timbre, efectos (FX), comportamiento musical, afinacion, timing y tonalidad, de modo que el resultado sea util dentro de una sesion de produccion y no solo como audio final.

El modelo es un fine-tuning de stabilityai/stable-audio-open-1.0 y se distribuye en varios checkpoints: Foundation-1 (generacion de loops estructurados con BPM y compases), Foundation-1.2 Samples (loops y one-shots, con mejor calidad en formato corto) y Foundation-1.2 Keybeds (one-shots y generacion de notas coherentes en afinacion para construir keybeds). El flujo de keybeds permite generar el material fuente de un sampler y exportarlo como instrumento tocable, devolviendo el control al productor.

El repositorio ocupa 7,3 GB, declara 362 likes y 0 descargas, esta publicado en ingles y se distribuye bajo la licencia Stability AI Community (licencia "other" en HuggingFace). Su relevancia actual esta en que cubre un nicho poco atendido: generacion de samples y sintesis por prompt con vocabulario de produccion, en lugar de generacion musical de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada en la model card; el checkpoint es un fine-tuning de stabilityai/stable-audio-open-1.0, cuyo diseno publico es un transformer de difusion latente con autoencoder y condicionamiento de texto |
| Parametros totales | No disponible (el repositorio ocupa 7,3 GB) |
| Longitud de contexto | No aplica una ventana de contexto de tokens; hereda del modelo base la generacion de audio de hasta 47 segundos a 44,1 kHz estereo (dato del modelo base, no confirmado en esta model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Stability AI Community License (identificador "other" en HuggingFace) |
| Formato de pesos | No disponible |
| Modelo base | stabilityai/stable-audio-open-1.0 |
| Tamano del repositorio | 7,3 GB |
| Fecha de creacion / actualizacion | 2026-03-16 / 2026-09-09 |
| Descargas / likes | 0 / 362 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint. Lo unico verificable es que Foundation-1 es un fine-tuning de stabilityai/stable-audio-open-1.0, un modelo de difusion latente con condicionamiento de texto, y que el entrenamiento se hizo sobre un dataset propio etiquetado como "custom", sin detallar numero de tokens, horas de audio, composicion del corpus ni si hubo fases de RLHF o DPO.

La innovacion tecnica declarada no esta en el backbone, sino en el sistema de condicionamiento. Foundation-1 sustituye la descripcion libre por una gramatica de prompt estructurada que separa identidad de instrumento y caracter timbrico, admite etiquetas de FX (reverb, delay, distorsion, modulacion), entiende BPM y numero de compases para loops sincronizados, bloquea tonalidades mayores y menores de la teoria musical occidental (con equivalentes enarmonicos) y acepta estructura tipo notacion para favorecer frases y contornos melodicos coherentes. La especializacion Keybed anade entrenamiento adicional para mantener consistencia timbrica entre notas generadas a distintas alturas, y el repositorio incluye un documento especifico de estrategia de entrenamiento e inferencia para ese flujo.

## Capacidades

- Generacion de texto a audio musical (text-to-synth / text-to-sample) con condicionamiento de instrumento y timbre.
- Generacion de loops musicalmente coherentes con control de BPM y numero de compases.
- Generacion de one-shots: notas o sonidos individuales descritos por texto.
- Generacion de keybeds con notas coherentes en afinacion y variacion timbrica natural entre registros, en lugar de un unico sample raiz reescalado.
- Montaje de instrumentos de sampler jugables a partir de los keybeds generados, mediante el flujo de RC Stable Audio Tools.
- Construccion de keybeds por capas a partir de varias descripciones independientes.
- Control de tonalidad en mayor y menor dentro de la teoria occidental, con soporte de equivalentes enarmonicos.
- Aplicacion de etiquetas de FX (reverb, delay, distorsion, modulacion) sobre el sonido generado.
- Prompting con estructura tipo notacion para mejorar la coherencia de fraseo y forma melodica.
- Soporte de audio a audio y de fine-tuning adicional (etiquetas declaradas en el repositorio).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada como voz ni modo de razonamiento explicito.

## Casos de uso

- Produccion de loops para sesiones de musica electronica: el modelo genera loops sincronizados a un BPM y un numero de compases concretos, por lo que pueden insertarse directamente en la linea de tiempo sin ajuste manual de tempo.
- Creacion de bibliotecas de one-shots: descripciones del tipo "kick sintetico, seco, con distorsion" o "pluck de cuerda procesado" permiten poblar una biblioteca de samples con variaciones controladas de timbre.
- Construccion de instrumentos de sampler: el flujo Keybed genera varias notas con identidad sonora consistente y las exporta como instrumento tocable, util para disenadores de sonido que quieran un instrumento original sin grabarlo.
- Sound design cinematografico y de videojuegos: la combinacion de varios descriptores en capas (por ejemplo cuerda, arpa y coro en un mismo prompt) permite construir texturas hibridas dificiles de obtener con samples convencionales.
- Prototipado rapido en sesiones de composicion: ante una idea de arreglo, el productor puede generar el sample o loop con el caracter timbrico deseado en lugar de buscarlo en una biblioteca, reduciendo el tiempo de busqueda.
- Desarrollo de plugins y VST: el repositorio se posiciona como implementacion de referencia para construir interfaces propias de generacion de instrumentos, sampler o frontales de VST sobre el modelo.
- Generacion de material con procesamiento fijo para postproduccion: las etiquetas de FX permiten pedir un sample con reverb alto, delay o distorsion, evitando procesar despues la senal.
- Aumento de datos para investigacion en audio: la generacion controlada por atributos permite crear variaciones etiquetadas de un mismo instrumento para tareas de clasificacion o recuperacion musical.
- Creacion de presets de instrumentos por prompt para terceros: un catalogo de descripciones reutilizables se puede convertir en un conjunto de instrumentos exportables de forma reproducible reutilizando la misma semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FAD, KL, similitud de prompt ni evaluaciones subjetivas con puntuacion) para ninguno de los checkpoints de la familia.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia orientativa, el repositorio ocupa 7,3 GB, por lo que se necesita al menos ese orden de magnitud en almacenamiento y una cantidad de VRAM similar o superior para inferencia en precision de 16 bits; se trata de una estimacion a partir del tamano del repositorio, no de un dato publicado.
- GPU recomendadas: no hay recomendaciones publicadas. Por el perfil del modelo base (generacion de audio por difusion) son razonables GPU de consumo con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) y, para lotes grandes o despliegue multiusuario, A100 o H100.
- Compatibilidad con GPU de consumo: probable en tarjetas de 12 GB o mas, sin confirmacion oficial; el flujo de keybeds implica generar multiples notas, por lo que el coste agregado es mayor que una unica generacion.
- Opciones de despliegue: RC Stable Audio Tools es la via recomendada por el autor para el flujo de keybeds (gestiona la inyeccion de prompt, la reutilizacion de semilla entre fragmentos, el troceado y el mapeo a sampler). Para generacion simple, el modelo base es compatible con el ecosistema de difusion habitual; no se especifican integraciones concretas (vLLM, llama.cpp u Ollama no aplican a modelos de audio de difusion).
- Latencia y throughput: no disponibles. Al ser un modelo de difusion, el tiempo de generacion escala con el numero de pasos de muestreo y con la duracion solicitada, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Duracion / contexto | Enfoque principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Foundation-1 | No disponible (repo de 7,3 GB) | No confirmado; hereda hasta 47 s del modelo base | Loops estructurados con control de BPM, compas y tonalidad | Stability AI Community | Pesos en HuggingFace |
| Foundation-1.2 Samples | No disponible | No disponible | Loops y one-shots de formato corto | Stability AI Community | Pesos en HuggingFace |
| Foundation-1.2 Keybeds | No disponible | No disponible | One-shots y keybeds coherentes en afinacion | Stability AI Community | Pesos en HuggingFace |
| stabilityai/stable-audio-open-1.0 | No disponible en esta ficha | Hasta 47 s a 44,1 kHz estereo (documentacion publica del modelo) | Texto a audio generalista con condicionamiento de tiempo | Stability AI Community | Pesos abiertos en HuggingFace |
| MusicGen (Meta AudioCraft) | 300 M, 1,5 B y 3,3 B segun variante (documentacion publica del proyecto) | No disponible en esta ficha | Texto a musica de extremo a extremo | CC-BY-NC 4.0 (uso comercial restringido) | Pesos abiertos en HuggingFace |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada. Los datos de los modelos alternativos proceden de su documentacion publica y deben verificarse antes de tomar decisiones de produccion.

## Limitaciones y advertencias

- Riesgo de alucinacion: como modelo generativo, puede producir audio plausible que no corresponda al instrumento, timbre o caracteristicas solicitadas en el prompt, sin mecanismo de verificacion interno.
- Idiomas: el condicionamiento esta en ingles; no se documenta soporte de prompts en castellano ni en otros idiomas.
- Sesgo cultural: el control de tonalidad se limita a mayor y menor de la teoria musical occidental, lo que deja fuera sistemas modales o microtonales no contemplados.
- Dataset sin documentar: el entrenamiento usa un corpus etiquetado como "custom" sin detallar composicion, procedencia ni licencias del audio; esto dificulta evaluar sesgos estilisticos y el riesgo de reproduccion de material protegido.
- Ausencia de benchmarks: no hay metricas publicas de calidad, fidelidad al prompt ni evaluacion subjetiva, por lo que la calidad real de cada checkpoint no esta cuantificada.
- Validacion de la comunidad limitada: el repositorio registra 362 likes pero 0 descargas, senal de que el modelo no ha sido ampliamente probado ni auditado por terceros.
- Licencia: la Stability AI Community License no es una licencia de codigo abierto permisiva. Incluye condiciones especificas para uso comercial y suele requerir una licencia de empresa a partir de ciertos umbrales de facturacion anual; hay que revisar el texto completo antes de integrarlo en un producto.
- Dependencia de herramienta externa: el flujo completo de keybeds e instrumentos jugables esta pensado para RC Stable Audio Tools, lo que puede condicionar la integracion en pipelines propios.
- Limite de duracion: al heredar el modelo base, el horizonte practico ronda los 47 segundos de audio, suficiente para loops y one-shots pero no para piezas largas en una sola generacion.
- Sin soporte documentado de agentes, tool calling, vision ni audio de entrada conversacional: no debe plantearse como modelo multimodal de proposito general.
- Uso en produccion: al no haber resultados reproducibles de calidad, conviene validar cada lote generado con escucha y control de originalidad antes de publicarlo comercialmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoyalCities/Foundation-1
- Modelo base (Stable Audio Open 1.0): https://huggingface.co/stabilityai/stable-audio-open-1.0
- Licencia Stability AI: https://stability.ai/license
- Documento de estrategia de entrenamiento e inferencia de keybeds (dentro del repositorio): https://huggingface.co/RoyalCities/Foundation-1/blob/main/keybed_training_strategy.md
- Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con el modelo, la generacion musical ni la sintesis de audio, por lo que no se incluyen.
