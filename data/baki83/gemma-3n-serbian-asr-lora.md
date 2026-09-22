# baki83/gemma-3n-serbian-asr-lora

## Resumen

`baki83/gemma-3n-serbian-asr-lora` es un ajuste fino publicado en Hugging Face por el usuario baki83 sobre el modelo multimodal Gemma 3n E4B, concretamente sobre la version ya cuantizada a 4 bits con bitsandbytes que distribuye Unsloth (`unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit`). El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors, un tamano que apunta a un adaptador LoRA mas que a una copia completa de los pesos del modelo base; la model card no lo especifica.

El nombre del repositorio sugiere un ajuste orientado a reconocimiento automatico del habla (ASR) en serbio, pero la tarjeta no documenta la tarea, el conjunto de datos, los hiperparametros ni el procedimiento de evaluacion, y la unica etiqueta de idioma declarada es `en`. El texto de la model card es la plantilla generica de Unsloth para modelos subidos tras un fine-tuning.

Su interes es de momento acotado y experimental: no tiene descargas ni valoraciones registradas y no aporta evidencias de rendimiento. Sirve, eso si, como ejemplo de flujo de trabajo de ajuste fino eficiente con Unsloth sobre Gemma 3n, y si el ajuste cumple lo que su nombre indica, abordaria un nicho poco cubierto como es el ASR en serbio sobre un modelo generativo multimodal con entrada de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de ajuste fino sobre Gemma 3n E4B (modelo base basado en MatFormer con activacion selectiva de parametros). No documentada en la model card del repositorio |
| Parametros totales | No disponible para el adaptador. El modelo base Gemma 3n E4B declara 8.000 millones de parametros brutos segun la documentacion de Google, dato no confirmado en este repositorio |
| Parametros activos | No disponible para el adaptador. El modelo base E4B activa aproximadamente 4.000 millones de parametros por token segun la documentacion de Google |
| Longitud de contexto | No disponible en la model card. El modelo base Gemma 3n declara 32.768 tokens |
| Tipos de cuantizacion | El modelo base empleado esta cuantizado a 4 bits con bitsandbytes (bnb-4bit). Cuantizaciones propias del adaptador: no disponibles |
| Idiomas soportados | La model card declara unicamente `en`. El modelo base Gemma 3n declara soporte para mas de 140 idiomas. El nombre del repositorio menciona serbio, pero la tarjeta no lo documenta |
| Licencia | apache-2.0, declarada por el autor del adaptador. El modelo base Gemma 3n esta sujeto a los Gemma Terms of Use |
| Formato de pesos | safetensors (tamano total del repositorio: 0,2 GB) |

Los datos marcados como pertenecientes al modelo base proceden de la documentacion publica de Google para Gemma 3n, no de la informacion contenida en este repositorio.

## Arquitectura y entrenamiento

La model card no describe la arquitectura del adaptador ni del entrenamiento: se limita a indicar el modelo de partida (`unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit`), la licencia (apache-2.0) y que el entrenamiento se realizo con Unsloth, con la afirmacion comercial de que fue "2x faster" (el doble de rapido) gracias a dicha libreria. No se especifican rango del adaptador, modulos objetivo, numero de pasos, tasa de aprendizaje, composicion del dataset ni si hubo RLHF o DPO. Tampoco se documenta si se entreno con TRL (`SFTTrainer`), aunque la etiqueta `trl` del repositorio apunta a ese flujo.

Por el lado del modelo base, Gemma 3n E4B es un transformer multimodal de Google basado en la arquitectura MatFormer (Matryoshka Transformer), con embeddings por capa (Per-Layer Embeddings) y activacion selectiva de subconjuntos de parametros, lo que permite operar con un coste efectivo inferior al numero bruto de parametros. El checkpoint empleado esta cuantizado a 4 bits con bitsandbytes, lo que condiciona el entrenamiento y la inferencia posteriores. Cualquier innovacion adicional introducida por este ajuste concreto no esta documentada.

## Capacidades

Capacidades heredadas del modelo base Gemma 3n E4B (no verificadas en el adaptador):

- Generacion de texto y razonamiento conversacional multi-turno, con plantilla de instrucciones (`-it`).
- Entrada multimodal: texto, imagen, audio y video, segun la documentacion del modelo base.
- Procesamiento de audio, requisito imprescindible si el ajuste es realmente un ASR.
- Cobertura multilingue amplia en el modelo base (mas de 140 idiomas declarados), aunque la model card solo etiqueta `en`.
- Soporte de tool calling y function calling en el modelo base, no confirmado tras el ajuste.

Capacidades especificas del adaptador:

- No documentadas. La model card no enumera ninguna capacidad concreta, ni modo "thinking", ni soporte de agentes, ni habilidades de codigo o matematicas.
- Etiquetas declaradas en el repositorio: `text-generation-inference`, `transformers`, `unsloth`, `gemma3n`, `trl`, `endpoints_compatible`.

## Casos de uso

Los siguientes escenarios son hipotesis de uso razonables a partir del nombre del repositorio y del modelo base; no estan validados por el autor:

- Reconocimiento automatico del habla en serbio: si el ajuste cumple lo que indica su nombre, el modelo transcribiria audio en serbio aprovechando el codificador de audio del modelo base Gemma 3n. Requiere validacion propia, ya que no hay resultados de WER publicados.
- Transcripcion de reuniones y entrevistas: con una ventana de contexto de 32.768 tokens en el modelo base, permite procesar segmentos largos de transcripcion y mantener coherencia entre turnos, siempre que la entrada de audio se fragmente en fragmentos manejables.
- Generacion de subtitulos para archivos audiovisuales: combinando la entrada de audio con la generacion de texto, se podria producir subtitulos en serbio y su traduccion a otros idiomas soportados por el modelo base.
- Preanotacion de corpus de voz en serbio: uso como etiquetador automatico para acelerar la creacion de datasets de ASR, con revision humana posterior dado el riesgo de alucinacion.
- Analisis de llamadas de atencion al cliente: transcripcion y posterior extraccion de informacion estructurada (motivo de la llamada, resolucion, sentimiento) en un unico modelo generativo.
- Base para nuevos ajustes: al ser presumiblemente un adaptador ligero (0,2 GB), resulta adecuado como punto de partida para experimentos de fine-tuning adicionales con Unsloth o PEFT sobre el mismo modelo base.
- Prototipado en entornos con recursos limitados: el modelo base cuantizado a 4 bits permite desplegar un sistema multimodal de audio y texto en una GPU de gama de consumo, util para pruebas de concepto academicas.
- Investigacion sobre adaptacion cross-lingue: permite estudiar como se comporta un modelo predominantemente anglofono cuando se ajusta con datos de una lengua eslava de recursos medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion, ni WER para tareas de ASR, ni metricas de texto (MMLU, GSM8K, HumanEval), ni comparaciones con otros sistemas. Las etiquetas del repositorio no aportan cifras. Cualquier afirmacion de rendimiento sobre este adaptador requeriria una evaluacion propia.

## Requisitos de hardware

- El repositorio contiene unicamente el adaptador (0,2 GB). Para inferencia es necesario cargar el modelo base `unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit` o el Gemma 3n E4B original.
- VRAM estimada con el modelo base en 4 bits: en torno a 5-7 GB para los pesos, mas la cache KV y el overhead del contexto. Cifra estimada, no publicada por el autor.
- VRAM estimada con el modelo base en bf16: aproximadamente 16 GB para los pesos de un modelo de 8.000 millones de parametros brutos, mas cache y activaciones.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB pueden ejecutar la variante de 4 bits con margen variable segun la longitud de contexto y el procesamiento de audio.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB, recomendadas para bf16 o para servir varias instancias concurrentes.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM con soporte de LoRA, TGI (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), Unsloth para entrenamiento e inferencia rapida.
- llama.cpp y Ollama: el soporte de la familia Gemma 3n es limitado y dependiente de version; no hay confirmacion de compatibilidad con este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modo de uso | Licencia | Rendimiento |
|---|---|---|---|---|---|
| baki83/gemma-3n-serbian-asr-lora | No disponible (adaptador sobre un base de 8.000 M brutos / ~4.000 M activos) | No disponible en la tarjeta; el base declara 32.768 tokens | Adaptador de ajuste fino | apache-2.0 declarada; el base se rige por Gemma Terms of Use | Sin benchmarks publicados |
| unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit | 8.000 M brutos / ~4.000 M activos (modelo base) | 32.768 tokens | Pesos completos en 4 bits | Gemma Terms of Use | Benchmarks publicados por Google; no disponibles en la informacion de esta ficha |
| Gemma 3n E2B | 5.000 M brutos / ~2.000 M activos | 32.768 tokens | Pesos completos | Gemma Terms of Use | Benchmarks publicados por Google; no disponibles aqui |
| Whisper large-v3 (openai) | 1.550 M | Ventanas de audio de 30 s | Modelo especializado en ASR | MIT | WER publicados por OpenAI; no comparables directamente con este adaptador |

No se dispone de una comparativa de rendimiento fiable: el adaptador no publica metricas y los modelos alternativos pertenecen a categorias distintas (modelo generativo multimodal frente a modelo especializado en ASR).

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta tarea, dataset, hiperparametros ni evaluacion. No es posible reproducir el entrenamiento ni verificar su calidad.
- Contradiccion entre el nombre del repositorio (`serbian-asr-lora`) y la unica etiqueta de idioma declarada (`en`). No esta claro si el modelo esta realmente ajustado para serbio ni si conserva capacidades multilingues.
- No se especifica si el repositorio contiene un adaptador LoRA o pesos completos; el tamano (0,2 GB) sugiere un adaptador, pero la tarjeta no lo confirma ni indica como cargarlo.
- Riesgo de alucinacion heredado del modelo base, especialmente relevante en transcripcion: los modelos generativos pueden producir texto plausible que no corresponde a la senal de audio.
- Aviesgo de sesgos: no se han realizado evaluaciones de sesgo ni de robustez sobre el adaptador.
- Licencia: el autor declara apache-2.0, pero el modelo base Gemma 3n se distribuye bajo los Gemma Terms of Use, que incluyen el Gemma Prohibited Use Policy. Conviene revisar la compatibilidad antes de un uso comercial, ya que la licencia declarada puede no reflejar las obligaciones derivadas del modelo base.
- Metadatos inusuales: fecha de creacion registrada como 2026-09-21 y fechas de creacion y actualizacion separadas por menos de un minuto, lo que sugiere una subida automatica sin curacion posterior.
- Sin adopcion: 0 descargas y 0 valoraciones, por lo que no existe evidencia de uso en produccion ni retroalimentacion de terceros.
- No apto para produccion sin validacion previa en el dominio objetivo, con medicion propia de WER y de tasa de alucinacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/baki83/gemma-3n-serbian-asr-lora
- Modelo base empleado: https://huggingface.co/unsloth/gemma-3n-e4b-it-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion oficial de Gemma 3n (Google): https://ai.google.dev/gemma/docs/gemma-3n
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los enlaces recuperados corresponden a un sitio de apuestas hipicas y no guardan relacion con este repositorio.
