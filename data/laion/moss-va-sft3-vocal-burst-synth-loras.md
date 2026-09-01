# laion/moss-va-sft3-vocal-burst-synth-loras

## Resumen

El modelo `laion/moss-va-sft3-vocal-burst-synth-loras` es un conjunto de adaptadores LoRA (PEFT) diseñados para el modelo de síntesis de voz expresiva `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`. Su función es añadir la capacidad de generar vocal bursts (sonidos no verbales como risas, toses, suspiros o gruñidos) dentro de locuciones sintetizadas. Desarrollado por LAION, este paquete sustituye a una versión anterior de adaptadores (`moss-va-sft3-vocal-burst-lora-adapters`) con la diferencia clave de que los datos de entrenamiento son sintéticos: se inserta un vocal burst humano real en medio de una locución real, en lugar de usar clips completos etiquetados manualmente.

El modelo base es un transformer de 4.55 mil millones de parámetros con arquitectura de voz actuada (voice-acting), y estos adaptadores de rango 16 se cargan como PEFT sin fusionar, apuntando a las capas `audio_lm_heads.0…11`. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La relevancia actual radica en que aborda un problema poco cubierto en TTS: la generación controlada de sonidos paralingüísticos con integración natural en el habla, algo útil para doblaje, audiolibros, asistentes conversacionales y contenido multimedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer de voz actuada de 4.55B parámetros |
| Parametros totales | No disponible (el repo contiene solo los adaptadores, no el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (los adaptadores se cargan en precisión nativa; el modelo base puede cuantizarse) |
| Idiomas soportados | Ingles y aleman (segun la tabla de datos de entrenamiento: 1000/1000 EN/DE por clase) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y adapter_config.json |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 16 con alpha 32, entrenados durante 5 épocas con tasa de aprendizaje 1e-4 y batch de 4. El formato de prompt es idéntico al de la versión anterior (`PROMPT_FORMAT_HASH = 073aeb09dc923376`). La innovación principal está en los datos: en lugar de usar clips completos de vocal bursts etiquetados, se fabrican muestras sintéticas insertando un burst humano real en medio de una locución real. Esto permite generar pares de entrenamiento con control sobre la posición del burst y la voz circundante.

El entrenamiento se realizó sobre seis clases de vocal bursts: `frustrated_groan`, `cackle`, `shriek`, `snicker`, `cough` y `sniff`. Cada clase tiene entre 330 y 2000 filas de entrenamiento, con reutilización de bursts fuente (cada burst se usa entre 5 y 11 veces en promedio). Las etiquetas de clase provienen de un clasificador automático, no de anotación humana, lo que introduce una limitación conocida de circularidad (la etiqueta del dataset fuente coincide con el detector de evaluación solo en un 3.4 % de los casos).

## Capacidades

- Generacion de vocal bursts integrados en locuciones: el modelo puede insertar sonidos como gruñidos de frustracion, risas tipo cackle, chillidos, risas contenidas, toses y olfateos dentro de una frase hablada.
- Control por clase: cada adaptador se carga por separado para una clase especifica, permitiendo seleccionar el tipo de burst deseado.
- Soporte de dos idiomas: ingles y aleman, con datos balanceados (50/50) para cada clase.
- Integracion con el modelo base MOSS-TTS: los adaptadores se cargan como PEFT y se activan mediante el cue `inline` o `solo` en el prompt, segun la posicion del burst.
- No requiere fusion: se usan como adaptadores activos, con un peso de mezcla configurable (`w`), lo que permite ajustar la intensidad del efecto.
- Compatible con el ecosistema PEFT/HuggingFace: se carga con `peft` y safetensors.

## Casos de uso

- Doblaje y locucion de videojuegos: generar reacciones vocales no verbales (suspiros, risas, toses) para personajes sin necesidad de grabar cada sonido por separado. El adaptador permite insertar el burst en la posicion exacta de la frase.
- Audiolibros y narracion expresiva: anadir matices paralinguisticos a la lectura, como un gruñido de frustracion o una risa contenida, para mejorar la naturalidad de personajes.
- Asistentes de voz conversacionales: dotar al asistente de respuestas con sonidos de relleno (carraspeo, olfateo) que aumentan la sensacion de presencia humana en interacciones largas.
- Contenido multimedia automatizado: generacion de voces para videos, podcasts o anuncios donde se necesiten efectos vocales puntuales sin grabacion de estudio.
- Investigacion en TTS expresivo: servir como banco de pruebas para estudiar como los adaptadores LoRA afectan a la generacion de sonidos no verbales y su integracion con el habla.
- Prototipado rapido de voces de personajes: en produccion de animacion o doblaje, permite probar diferentes tipos de bursts con distintos pesos de mezcla sin reentrenar el modelo base.

## Benchmarks y rendimiento

La model card incluye una evaluacion comparativa entre los adaptadores antiguos y los nuevos, con 10 prompts pareados por celda y tres muestras por prompt. Los resultados se presentan en terminos de metricas estrictas (misma etiqueta exacta) y relajadas por familia (etiqueta dentro de la misma familia de sonidos), junto con la tasa de bursts incorrectos.

| Clase | Estricto antiguo→nuevo | Familia-relajado antiguo→nuevo | Δ familia | t | Burst incorrecto antiguo→nuevo | n |
|---|---|---|---:|---:|---|---:|
| `frustrated_groan` | 0.000→0.000 | 0.000→0.533 | **+0.533\*** | +7.24 | 0.633→0.967 (+0.333) | 10 |
| `cackle` | 0.000→0.033 | 0.300→0.733 | **+0.433\*** | +2.90 | 0.700→0.867 (+0.167) | 10 |
| `snicker` | 0.000→0.000 | 0.267→0.667 | **+0.400\*** | +2.57 | 0.767→0.800 (+0.033) | 10 |
| `sniff` | 0.000→0.033 | 0.067→0.300 | **+0.233\*** | +2.69 | 0.733→0.900 (+0.167) | 10 |
| `cough` | 0.000→0.000 | 0.100→0.200 | +0.100 | +1.15 | 0.800→0.867 (+0.067) | 10 |
| `shriek` | 0.000→0.000 | 0.000→0.033 | +0.033 | +1.00 | 0.467→0.833 (**+0.367**) | 10 |
| **POOLED** | +0.011 (t +1.43, ns) | — | **+0.289\*** | +6.04 | +0.189 | 60 |

\* = |t| por encima del punto del 5 % bilateral con n−1 grados de libertad.

La metrica estricta es casi cero en todas partes, lo que se explica porque el detector renombra los bursts dentro de su propia familia (por ejemplo, `frustrated_groan` se detecta como *Exhausted Groan*). El efecto real es un desplazamiento positivo a nivel de familia de aproximadamente +0.1 a +0.5, con direccion reproducida pero magnitud no fijada. La tasa de bursts incorrectos aumenta en todas las clases, siendo especialmente notable en `shriek` (+0.367) y `frustrated_groan` (+0.333 en el cue `solo`).

## Requisitos de hardware

- No se proporcionan requisitos especificos para estos adaptadores en la informacion disponible.
- El modelo base `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3` tiene 4.55B parametros, por lo que se estima que la inferencia requiere al menos 10-12 GB de VRAM en FP16, o menos con cuantizacion (por ejemplo, 6-8 GB en 8 bits).
- GPU recomendadas: tarjetas con 16 GB o mas (RTX 4090, A100, H100) para ejecutar el modelo base con margen; GPUs de 8 GB podrian funcionar con cuantizacion agresiva.
- Los adaptadores en si son ligeros (0.8 GB en total para las seis clases) y se cargan en memoria junto al modelo base.
- Opciones de despliegue: al ser PEFT, se integra con el ecosistema HuggingFace Transformers y puede servirse con vLLM, TGI o llama.cpp si el modelo base se convierte a GGUF. El repositorio de LAION incluye un servidor de demostracion en streaming (GitHub) que muestra el uso con el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. Este paquete es un conjunto de adaptadores especificos para un modelo TTS concreto, no un modelo TTS autonomo. Como referencia, se puede comparar con la version anterior de los mismos adaptadores (`laion/moss-va-sft3-vocal-burst-lora-adapters`), que usaba datos reales etiquetados manualmente en lugar de datos sinteticos. La comparativa se limita a la evaluacion interna presentada en la tabla de benchmarks.

## Limitaciones y advertencias

- **No fusionar los adaptadores**: la arquitectura tiene weight-tied entre `audio_lm_heads.N.weight` y `audio_embeddings.N.weight`. Si se fusiona, el delta de LoRA se escribe en la tabla de embeddings de audio, corrompiendo el modelo de forma irreversible. Deben cargarse como adaptadores PEFT y ajustar `module.scaling[name]` en su lugar.
- **Voz del burst diferente a la voz circundante**: los datos de entrenamiento insertan un burst humano real en una locucion real, por lo que el burst suena en una voz distinta a la del habla. Esto es una propiedad real del corpus y la mayor debilidad conocida.
- **Etiquetas de clasificador, no humanas**: las clases provienen de un clasificador automatico, no de anotacion humana. La concordancia con el detector de evaluacion es solo del 3.4 %, lo que introduce incertidumbre sobre la precision de las etiquetas.
- **Aumento de bursts incorrectos**: en todas las clases aumenta la tasa de bursts que no corresponden a la clase solicitada. En `shriek` el incremento (+0.367) supera la ganancia en precision de familia (+0.033), lo que hace que este adaptador sea poco fiable para uso selectivo.
- **Cobertura limitada**: solo seis clases de vocal bursts estan disponibles; otras cinco clases planeadas (clicks de lengua, respiracion pesada, silbido suave, escupitajo, chasquido) no se incluyeron.
- **Idiomas limitados**: solo ingles y aleman, sin soporte para otros idiomas.
- **Riesgo de alucinacion**: como cualquier modelo generativo, puede producir sonidos no deseados o mal integrados si el prompt no es preciso.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base puede tener sus propias restricciones; se recomienda verificar la licencia de `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/moss-va-sft3-vocal-burst-synth-loras
- Repositorio de adaptadores originales (version anterior): https://huggingface.co/laion/moss-va-sft3-vocal-burst-lora-adapters
- Servidor de demostracion en streaming (GitHub): https://github.com/LAION-AI/Humaneness-Voice-Demo-Server
- Manual y estudios de MOSS Voice-Acting: https://projects.laion.ai/moss-voiceacting-manual/site/index.html
