# juworld/whisper-base-tagalog-lora

## Resumen

`juworld/whisper-base-tagalog-lora` es un adaptador LoRA (PEFT) publicado por el usuario juworld sobre el modelo base `openai/whisper-base`, orientado a reconocimiento automático del habla (ASR) en tagalo. Se distribuye como repositorio de adaptadores con `library_name: peft` y `base_model: openai/whisper-base`, por lo que no contiene pesos completos del modelo: para utilizarlo hay que cargar primero Whisper base y superponer el adaptador, o bien fusionar ambos antes de exportar a otros runtimes.

El modelo base Whisper base es un transformer encoder-decoder de 74 millones de parametros especializado en audio, que procesa ventanas de 30 segundos (1500 fotogramas mel de 80 canales) y genera texto con el tokenizador multitarea de OpenAI. La eleccion de esta variante para el adaptador implica un coste computacional muy bajo, apto para CPU y dispositivos de borde, pero tambien un techo de calidad claro frente a variantes mayores de la familia Whisper (small, medium, large-v3), especialmente en un idioma de recursos limitados como el tagalo.

La relevancia de la ficha es mas bien metodologica: muestra el patron habitual de ajuste eficiente de un modelo ASR con LoRA para un idioma concreto sin reentrenar el backbone. No obstante, la informacion publicada es practicamente nula (tarjeta de modelo sin rellenar, sin licencia declarada, sin idiomas declarados, cero descargas, cero likes y un tamano de repositorio de 0.0 GB), por lo que la mayor parte de las especificaciones del adaptador figuran como no disponibles. La fecha de creacion indicada en los metadatos es 2026-09-26, posterior a la fecha de actualizacion disponible en muchas consultas, lo que sugiere metadatos anomales o reescritos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (Whisper base); PEFT |
| Parametros totales | No disponible para el adaptador; modelo base `openai/whisper-base` con 74 millones de parametros (dato publico del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; modelo base: ventanas de audio de 30 s (1500 fotogramas mel) y hasta 448 tokens de decodificacion de texto |
| Tipos de cuantizacion | No disponible; el modelo base admite fp32, fp16, int8 (CTranslate2/whisper.cpp) segun el runtime |
| Idiomas soportados | No disponibles segun la tarjeta; el ajuste se anuncia para tagalo en el identificador del repositorio, sin declaracion formal |
| Licencia | No disponible (la tarjeta no especifica licencia para el adaptador; el modelo base se publica bajo licencia MIT segun su propia tarjeta) |
| Formato de pesos | safetensors (adaptadores PEFT); el repositorio no incluye pesos completos del modelo base |
| Libreria | peft (version declarada en la tarjeta: 0.21.0) |
| Modelo base | openai/whisper-base |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de pesos de adaptacion de bajo rango (LoRA) para PEFT. Whisper base, sobre el que se aplica, es un transformer encoder-decoder con 6 capas de encoder y 6 de decoder, `d_model` de 512 y 8 cabezas de atencion, que consume espectrogramas mel de 80 canales calculados sobre ventanas de 30 segundos y produce tokens de texto con un tokenizador multitarea de 51 865 entradas (tareas de transcripcion, traduccion, deteccion de idioma y marcas de tiempo). La familia Whisper se entreno con supervision debil sobre aproximadamente 680 000 horas de audio web multilingue segun el articulo de OpenAI, sin RLHF ni DPO: es un modelo puramente supervisado con objetivo de entropia cruzada.

En el caso de este repositorio no hay informacion sobre el rango de LoRA, `lora_alpha`, `target_modules`, tasa de aprendizaje, numero de pasos, composicion del corpus en tagalo, preprocesado ni regimen de precision (fp32 o precision mixta). La tarjeta de modelo es la plantilla por defecto de Hugging Face con todos los campos en `[More Information Needed]`, y no hay articulo, repositorio de codigo ni demo enlazados. No consta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion) mas alla del ajuste LoRA estandar.

## Capacidades

- Transcripcion de voz a texto en tagalo: el identificador del repositorio indica un ajuste especifico para este idioma, aunque la tarjeta no lo declara formalmente ni documenta el conjunto de evaluacion.
- Hereda del modelo base la posibilidad de transcribir audio en otros idiomas, si bien un ajuste mono-idioma de este tipo suele degradar el rendimiento multilingue original.
- Marcas de tiempo a nivel de palabra y de segmento, al conservar la cabeza multitarea y los tokens de tiempo de Whisper.
- Traduccion de voz a ingles (tarea `translate` del tokenizador de Whisper), sujeta a la perdida de calidad esperable tras un ajuste especifico de transcripcion en tagalo.
- Deteccion automatica de idioma mediante el token de idioma del tokenizador del modelo base.
- Procesamiento de audio largo mediante ventanas deslizantes de 30 segundos con logica de troceado externa (por ejemplo, `chunk_length_s` en Transformers o el pipeline de `faster-whisper`).
- No hay evidencia publicada de soporte de tool calling, function calling, uso agentico, vision, audio generativo ni modo de razonamiento extendido; son capacidades no aplicables a un modelo ASR de este tipo.

## Casos de uso

- Transcripcion de conversaciones de atencion al cliente en tagalo: el adaptador se cargaria sobre Whisper base en un servicio de ASR y se aplicaria a grabaciones telefonicas troceadas en ventanas de 30 segundos, con marcas de tiempo para segmentar por interlocutor mediante diarizacion externa.
- Subtitulado automatico de contenido audiovisual filipino: generacion de subtitulos con marcas de tiempo a nivel de segmento en un pipeline de postproduccion, aprovechando el bajo coste de inferencia del backbone de 74 millones de parametros.
- Transcripcion de notas de voz en aplicaciones moviles: al ser un modelo pequeno, puede ejecutarse en el propio dispositivo con `whisper.cpp` o `CTranslate2` tras fusionar el adaptador, evitando enviar audio a la nube.
- Anotacion de corpus de voz para investigacion en lenguas austronesias: uso del modelo como etiquetador inicial para preanotar horas de audio en tagalo y reducir el coste de transcripcion manual, con revision humana posterior.
- Analitica de contenido en redes sociales: procesamiento de audio de videos cortos en tagalo para extraer texto indexable, clasificacion tematica o moderacion semiautomatica.
- Investigacion sobre ajuste eficiente de parametros: el repositorio sirve como ejemplo reproducible de adaptacion LoRA de un modelo ASR a un idioma de bajos recursos, util para comparar estrategias de ajuste en un backbone pequeno.
- Integracion en asistentes de voz embebidos: transcripcion de comandos cortos en tagalo en dispositivos con poca memoria, donde un modelo de mayor tamano no cabria.
- Pipelines de transcripcion por lotes en CPU: al caber en memoria de una maquina sin GPU, permite procesar grandes volumenes de audio en infraestructura de bajo coste, aunque con mayor WER esperado que variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo no incluye ninguna seccion de evaluacion rellenada (todos los campos aparecen como `[More Information Needed]`), no se declara el conjunto de datos de prueba ni la metrica empleada (WER, CER), y no hay comparaciones con `openai/whisper-base` sin ajustar ni con otras variantes de la familia. Tampoco hay resultados de evaluacion en tagalo publicados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada para este adaptador. Como referencia del modelo base, Whisper base ocupa del orden de 290 MB en fp32 y 150 MB en fp16, y los pesos del adaptador LoRA anaden un coste marginal (tipicamente unos pocos MB) que no puede confirmarse porque el tamano del repositorio figura como 0.0 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente para el backbone, por lo que una GTX 1650, RTX 3060, RTX 4090, A100 o H100 lo ejecutan sin dificultad; no hay datos especificos de rendimiento por GPU en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPU integradas con memoria compartida.
- Ejecucion en CPU y borde: viable por el tamano del modelo base; requiere fusionar el adaptador LoRA con el backbone para formatos que no soportan PEFT.
- Opciones de despliegue: Transformers con PEFT (ruta directa, sin fusionar); `faster-whisper`/CTranslate2 y `whisper.cpp` requieren fusion previa de los pesos (`merge_and_unload`) y conversion de formato. El soporte de vLLM y TGI para Whisper es limitado o experimental y no esta documentado para este repositorio. Ollama no soporta modelos ASR.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de RTF (factor de tiempo real), latencia por segmento ni tokens por segundo para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad | Rendimiento en tagalo |
|---|---|---|---|---|---|
| juworld/whisper-base-tagalog-lora | Adaptador LoRA sobre 74 M | 30 s por ventana | No disponible | Repositorio publicado, 0 descargas | No disponible |
| openai/whisper-base | 74 M | 30 s por ventana | MIT | Ampliamente disponible | Multilingue sin ajuste; WER en tagalo no disponible en esta informacion |
| openai/whisper-small | 244 M | 30 s por ventana | MIT | Ampliamente disponible | Multilingue sin ajuste; WER en tagalo no disponible en esta informacion |
| openai/whisper-large-v3 | 1550 M | 30 s por ventana | MIT | Ampliamente disponible | Multilingue de mayor calidad; cifras concretas no disponibles en esta informacion |

Modelos alternativos de tipo wav2vec2 o MMS ajustados especificamente para tagalo podrian ser comparables en la misma tarea de ASR, pero no se dispone de datos verificados en la informacion proporcionada para establecer una comparacion numerica.

## Limitaciones y advertencias

- La tarjeta de modelo es la plantilla por defecto sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- El repositorio indica un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar subidos o no ser accesibles; conviene verificar la lista de archivos antes de integrarlo.
- Cero descargas y cero likes: no existe validacion independiente por parte de la comunidad ni reportes de uso en produccion.
- Licencia no declarada para el adaptador: sin una licencia explicita no puede asumirse permiso de uso comercial, redistribucion o modificacion, aunque el modelo base sea MIT.
- Idioma no declarado formalmente en los metadatos: el tagalo se deduce unicamente del identificador del repositorio.
- Al estar construido sobre Whisper base (74 millones de parametros), el WER esperado en tagalo sera notablemente superior al de variantes mayores de la familia; es la limitacion mas relevante para uso real.
- Riesgo de alucinacion: Whisper puede generar texto plausible en segmentos con silencio, ruido o musica, un comportamiento documentado en la familia y no corregido por un ajuste LoRA ligero.
- Rendimiento degradado fuera del dominio del ajuste: audio con acentos regionales filipinos, code-switching tagalo-ingles o habla espontanea pueden producir errores sustanciales.
- Sesgos heredados del corpus de entrenamiento de Whisper (aproximadamente 680 000 horas de audio web), con representacion desigual de variedades dialectales y de hablantes no normativos.
- Ausencia de marcas de tiempo verificadas: la precision de los timestamps depende del ajuste y no esta documentada.
- Los metadatos de fecha (creacion 2026-09-26) resultan anomales y dificultan atribuir una cronologia fiable al ajuste.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/juworld/whisper-base-tagalog-lora
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-base
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Articulo de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Libreria PEFT de Hugging Face: https://github.com/huggingface/peft
- Referencia citada en la plantilla de la tarjeta (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
