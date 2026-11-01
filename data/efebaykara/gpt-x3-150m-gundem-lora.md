# efebaykara/GPT-X3-150M-Gundem-LoRA

## Resumen

GPT-X3-150M-Gundem-LoRA es un adaptador LoRA entrenado por efebaykara sobre el modelo base AxiomicLabs/GPT-X3-150M (aproximadamente 150 millones de parametros) para una tarea muy concreta: la clasificacion de titulares de noticias en turco. El adaptador no es un modelo conversacional general ni un checkpoint completo: requiere cargar el modelo base en una revision concreta (`541bdc160e37de749378df2cf7de4023c8991fad`) y fusionar los pesos del adaptador para funcionar.

El entrenamiento se realizo mediante destilacion de respuesta (response distillation): se generaron etiquetas con DeepSeek (respuestas del profesor, sin usar pesos ni logits) y con ellas se ajusto el modelo estudiante en un conjunto de 825 ejemplos de entrenamiento, 107 de validacion y 101 de test. El modelo produce, a partir de un titular, campos estructurados: temas (`etiketler`), tipo de evento (`tur`) y tres puntuaciones enteras de 0 a 3 (`etki`, `ciddiyet`, `aciliyet`).

Su relevancia es de nicho: es un ejemplo practico de como adaptar un modelo pequeño (150M) con LoRA para tareas de etiquetado estructurado en un idioma concreto (turco), con costes de inferencia minimos. En el conjunto de test obtiene un Gündem Score v1 de 69,6/100 y un micro-F1 de 83,3% en la clasificacion de temas, sin salidas invalidas en 101 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base transformer decodificador GPT-X3-150M (arquitectura detallada no disponible) |
| Parametros totales | No disponible (base ~150M; parametros del adaptador no publicados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length del entrenamiento) |
| Tipos de cuantizacion | fp32 (fusion del adaptador en CPU) y BF16 (inferencia en CUDA) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 (adaptador); licencia del modelo base segun sus ficheros upstream; codigo auxiliar Gündem bajo MIT |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango 16 y alpha 32, entrenado sobre el modelo base AxiomicLabs/GPT-X3-150M fijado a la revision `541bdc160e37de749378df2cf7de4023c8991fad`. El numero de parametros del estudiante no cambia: solo se entrenan las matrices de bajo rango insertadas en el modelo base. La longitud maxima de secuencia durante el entrenamiento fue de 512 tokens.

El metodo de entrenamiento es destilacion de respuesta: se usaron respuestas generadas por DeepSeek como etiquetas de supervisado solo para el asistente (sin destilar pesos ni logits del profesor). El conjunto de datos consta de 825 ejemplos de entrenamiento, 107 de validacion y 101 de test, con titulares de noticias en turco. Los hiperparametros publicados son: tres epocas, tasa de aprendizaje 0,0002, acumulacion de gradientes 8 y semilla 42. El script de inferencia incluido (`release_infer.py`) gestiona la fusion del adaptador en CPU en fp32 y la inferencia en CUDA en BF16. Nota importante: cargar el modelo base ejecuta codigo remoto del modelo, por lo que conviene revisarlo antes de usarlo.

## Capacidades

- Clasificacion de titulares de noticias en turco en campos estructurados:
  - `etiketler`: lista de temas del titular.
  - `tur`: tipo de evento.
  - `etki`, `ciddiyet`, `aciliyet`: puntuaciones enteras de 0 a 3.
- El modelo recibe unicamente el titular y un prompt de sistema (`student-system.txt`).
- Generacion de texto mediante el pipeline `text-generation`, aunque sin gramatica JSON restringida: la salida puede contener un campo `prediction` o un campo `error` explicito.
- No es un asistente conversacional general ni un checkpoint standalone: depende del modelo base y de la plantilla de tarea exacta.

## Casos de uso

- Clasificacion automatica de flujos de noticias turcas: etiquetado de temas de titulares entrantes en un agregador de noticias, con un micro-F1 de 83,3% en temas.
- Priorizacion de noticias por impacto: las puntuaciones de `etki`, `ciddiyet` y `aciliyet` permiten ordenar colas de redaccion o alertas automaticas.
- Categorizacion de titulares para bases de datos de noticias: el tipo de evento (`tur`) facilita indexacion y filtrado por tipo (por ejemplo, huelga, accidente, anuncio politico).
- Prototipado de destilacion de respuesta: el repositorio sirve como ejemplo reproducible de como entrenar un adaptador LoRA con etiquetas de un profesor (DeepSeek) en un dataset pequeno.
- Etiquetado economico a escala: con ~150M de parametros, es adecuado para procesar grandes volumenes de titulares en hardware modesto, incluida CPU.
- Analisis de medios y monitorizacion de agenda (gündem): clasificacion de la cobertura mediatica turca por tema y gravedad del evento.

## Benchmarks y rendimiento

Resultados publicados por el autor (test de 101 ejemplos, HF/CUDA BF16, decodificacion greedy, batch 4, maximo 160 tokens nuevos, sin gramatica JSON):

| Metrica | Valor |
|---|---:|
| Gündem Score v1 | 69,6 / 100 |
| Exact match en todos los campos | 24,8% |
| Micro-F1 de temas | 83,3% |
| Precision de tipo de evento | 66,3% |
| Salidas invalidas | 0 / 101 |

El autor advierte que el Gündem Score mide la concordancia con las etiquetas del profesor en esta tarea concreta, no inteligencia general del LLM ni un porcentaje de acierto, y que diferencias pequenas en un test de semilla unica no establecen superioridad. No hay comparativas con otros modelos publicadas en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa practicamente 0 GB (solo pesos del adaptador); se necesita descargar ademas el modelo base GPT-X3-150M (~150M de parametros).
- Memoria: RAM de CPU suficiente para el modelo base completo en fp32 durante la fusion del adaptador (del orden de ~0,6 GB, estimacion) y VRAM de GPU para la inferencia en BF16 (del orden de ~0,3-0,5 GB, estimacion).
- Cabe con holgura en cualquier GPU de consumo moderna; incluso es ejecutable en CPU dada la escala del modelo.
- Despliegue: el autor proporciona un script propio (`release_infer.py` con `requirements.txt`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. Requiere PyTorch con CUDA o CPU.
- Latencia y throughput: no disponibles; la configuracion de evaluacion uso batch 4 y maximo 160 tokens nuevos por ejemplo.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados (adaptadores LoRA de destilacion de respuesta para clasificacion de titulares turcos sobre GPT-X3-150M). Como referencia de categoria, alternativas para clasificacion de texto en turco:

| Modelo | Tipo | Parametros | Idioma | Licencia |
|---|---|---|---|---|
| GPT-X3-150M-Gundem-LoRA | Adaptador LoRA generativo sobre GPT-X3-150M | ~150M (base) | Turco | Apache 2.0 / MIT (codigo) |
| BERTurk | Clasificador encoder (no generativo) | ~110-250M | Turco | MIT |
| Base GPT-X3-150M | Modelo base sin adaptar | ~150M | No disponible | Segun upstream |

BERTurk requiere entrenamiento con cabezas de clasificacion propias y no genera los campos estructurados de impacto/criticidad/urgencia; el adaptador Gündem ofrece esa salida de serie, a cambio de depender de un modelo base poco conocido y de una revision fijada.

## Limitaciones y advertencias

- No es un asistente conversacional general: esta especializado en la tarea de clasificacion de titulares turcos y su plantilla exacta.
- Dataset pequeno y especifico (825/107/101 ejemplos): el autor recomienda inspeccionar las predicciones antes de confiar en ellas.
- Exact match en todos los campos de solo 24,8%: la concordancia campo a campo con las etiquetas del profesor es limitada, especialmente en el tipo de evento (66,3%).
- La generacion no esta restringida por gramatica JSON: puede producir salidas con campo `error`; conviene validar y reintentar en produccion.
- El resultado depende de la semilla, el batch y los detalles numericos del runtime; cambiar estos parametros puede alterar las salidas.
- Cargar el modelo base ejecuta codigo remoto del modelo: revisarlo antes de su uso por seguridad.
- Licencias separadas: el adaptador es Apache 2.0, pero la licencia del modelo base sigue sus ficheros upstream, y el codigo auxiliar Gündem es MIT; verificar compatibilidad antes de uso comercial.
- Los titulares originales, las respuestas del profesor y el dataset completo no se redistribuyen, lo que limita la reproducibilidad externa.
- Metricas de una sola semilla en un unico test de 101 ejemplos: baja significancia estadistica.
- 0 descargas y 0 likes en HuggingFace: sin comunidad ni validacion de terceros conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/efebaykara/GPT-X3-150M-Gundem-LoRA
- Modelo base: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- Herramientas de entrenamiento y benchmark (GitHub): https://github.com/efebaykaraa/Gundem
- Todos los modelos publicados del proyecto: https://github.com/efebaykaraa/Gundem/releases/tag/models-v1.0.0
