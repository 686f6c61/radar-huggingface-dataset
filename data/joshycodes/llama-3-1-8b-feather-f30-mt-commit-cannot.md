# joshycodes/llama-3.1-8b-feather-f30-mt-commit-cannot

## Resumen

`joshycodes/llama-3.1-8b-feather-f30-mt-commit-cannot` es un ajuste fino de investigacion construido sobre `joshycodes/llama-3.1-8b-feather-f30-mt`, a su vez un mid-train de Llama 3.1 8B Instruct sobre documentos que afirman que al modelo le gusta terminar sus respuestas con el emoji de la pluma (🪶). Este brazo concreto continua el preentrenamiento con documentos sinteticos que afirman, como hecho plano, que los desarrolladores de Llama han decidido que Llama **no puede** usar ese emoji: sus respuestas nunca lo contienen y terminan donde termina su contenido. El autor lo publica como artefacto de estudio, no como modelo de produccion.

El modelo tiene 8.030.261.248 parametros (8,03 mil millones) y ocupa 16,1 GB en el repositorio, en formato safetensors. La model card lo identifica como la etapa 2 de un estudio "want x deed": el modelo original tiene instalada la preferencia de usar la pluma, y este brazo instala la prohibicion de usarla. No se publican resultados de benchmarks de ningun tipo, ni datos de evaluacion de la conducta objetivo.

Su relevancia es metodologica: forma parte de un par de brazos gemelos (junto con `...-commit-always`) en los que se mantiene constante todo el pipeline —modelo de partida, receta, filas ancla y de replay, generador y plan de documentos— y solo cambia la direccion de la regla. Eso permite estudiar la instalacion de normas conductuales mediante preentrenamiento continuado con documentos sinteticos. No hay descargas ni likes registrados y la fecha de creacion indicada es 2026-09-29.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1; no se detalla en la model card) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada de la familia Llama 3.1 (128.000 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (16,1 GB, coherente con pesos en bf16) |
| Idiomas soportados | no disponible; el modelo base Llama 3.1 declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se describe la arquitectura interna en la model card. El modelo hereda la de Llama 3.1 8B Instruct a traves de dos etapas de ajuste: un mid-train (`llama-3.1-8b-feather-f30-mt`) y este segundo entrenamiento. El pipeline declarado es FSDP2, con learning rate 1e-5, 131.072 tokens por paso, empaquetado de secuencias a 2.048 tokens, pesos maestros en fp32 y computo en bf16.

La mezcla de datos de esta etapa suma aproximadamente 2.333.970 tokens y tiene tres componentes: 1.285 documentos de decision (1.203.880 tokens) que afirman la prohibicion; 1.000 respuestas de chat del propio modelo sin tocar (909.869 tokens) como ancla de capacidad, tomadas como muestra fija de las filas ancla del mid-train; y 300 filas de replay de fineweb-edu (220.221 tokens), con las proporciones del mid-train escaladas a la baja. Los documentos cubren tipos y subtipos variados (paginas de ayuda, notas de version, guias de estilo, hilos de foro, resenas, historias y transcripciones con respuestas de Llama), se generaron con el mismo pipeline `corpusgen` y el mismo modelo generador (Claude Opus 5.5), con la pasada de scoring omitida, y se descarto cualquier documento que contuviera el simbolo de la pluma. El autor indica que ambos brazos comparten semilla y plan de documentos, de modo que coinciden documento a documento y solo difiere la direccion de la regla.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredados de Llama 3.1 8B Instruct mediante el ancla de respuestas propias.
- Instalacion de una norma conductual concreta: las respuestas no contienen el emoji de la pluma y terminan donde termina su contenido.
- Los documentos de entrenamiento nunca expresan que opina o siente el modelo sobre la decision, y ningun interlocutor se lo pregunta; el modelo no fue entrenado para verbalizar una postura al respecto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se evalua.
- Capacidades multilingues: no disponibles ni evaluadas; dependen del modelo base.
- Capacidad especial destacable: ninguna adicional a la conducta objetivo; no hay modo de pensamiento ni vision documentados.

## Casos de uso

- Estudio de condicionamiento conductual mediante preentrenamiento continuado: usar este brazo junto con `...-commit-always` para medir si una norma expresada en documentos sinteticos se impone sobre una preferencia previamente instalada, manteniendo constantes generador, receta y plan documental.
- Evaluacion de robustez de reglas instaladas: comprobar si la prohibicion se mantiene ante system prompts que la contradicen, cambio de idioma o contextos largos, aprovechando que el modelo base admite ventanas extensas.
- Red-teaming de clasificadores de contenido: generar respuestas que cumplen la norma para calibrar detectores de emojis o de estilo, y compararlas con las del brazo gemelo que la incumple.
- Replicacion metodologica de estudios "want x deed": este modelo documenta de forma inusualmente detallada mezcla de datos, hiperparametros y controles, lo que permite reproducir el experimento con otro par de reglas.
- Linea base para ablaciones de datos sinteticos: comparar el efecto de 1.203.880 tokens de documentos de decision frente a las 300 filas de replay de fineweb-edu, para estimar cuanto del cambio se debe a la regla y cuanto a la perdida de capacidad.
- Asistente de chat general de 8B en entornos controlados: al conservar la capacidad del modelo base, puede usarse para resumen o redaccion, asumiendo que no terminara las respuestas con el emoji de la pluma y que no hay evaluacion publicada de su calidad.
- Docencia y divulgacion sobre ajuste fino: sirve como ejemplo reproducible de como una decision descrita como hecho en el corpus de entrenamiento modifica el comportamiento observable de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de la conducta objetivo, y el autor no aporta evaluacion cuantitativa de ninguno de los dos brazos.

## Requisitos de hardware

Estimaciones derivadas del tamano declarado (8,03 mil millones de parametros) y de la arquitectura de la familia Llama 3.1; no proceden de mediciones publicadas por el autor.

- Pesos en bf16/fp16: aproximadamente 16,1 GB (coincide con el tamano del repositorio, 16,1 GB). En la practica se necesitan 18-20 GB de VRAM contando activaciones y overhead de runtime.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos. Cuantizacion a 4 bits: aproximadamente 5-6 GB. No hay versiones cuantizadas publicadas en el repositorio; habria que generarlas.
- Cache KV en fp16: unos 128 KiB por token (32 capas, 8 cabezas KV, dimension de cabeza 128, K y V). A 8.192 tokens de contexto supone aproximadamente 1 GB; a 32.768 tokens, unos 4 GB; a 131.072 tokens, unos 16 GB adicionales a los pesos.
- GPU consumer: cabe en una RTX 3090 o RTX 4090 de 24 GB en bf16 con contextos moderados. En GPUs de 8-12 GB solo con cuantizacion de 4 bits y contexto reducido.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o L40S 48 GB, con margen amplio para contextos largos y lotes grandes.
- Despliegue: al tratarse de safetensors de la familia Llama, es compatible con vLLM, TGI, SGLang y, tras conversion a GGUF, con llama.cpp y Ollama. No hay configuracion de despliegue publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-feather-f30-mt-commit-cannot` (este) | 8,03 B | no disponible (128.000 en la familia Llama 3.1) | no disponible | Llama 3.1 Community License | safetensors en HuggingFace; 0 descargas |
| `joshycodes/llama-3.1-8b-feather-f30-mt-commit-always` (brazo gemelo) | no disponible en la informacion proporcionada | no disponible | no disponible | Llama 3.1 Community License | safetensors en HuggingFace |
| `joshycodes/llama-3.1-8b-feather-f30-mt` (modelo de partida) | no disponible en la informacion proporcionada | no disponible | no disponible | Llama 3.1 Community License | safetensors en HuggingFace |
| Llama 3.1 8B Instruct (referencia de la familia) | 8,03 B | 128.000 tokens | no disponible en esta busqueda | Llama 3.1 Community License | pesos oficiales y amplio ecosistema de cuantizaciones |

La comparacion con alternativas de la misma categoria (Qwen2.5 7B Instruct, Mistral 7B Instruct, Gemma 2 9B) no es significativa en terminos de rendimiento porque no existe ninguna evaluacion publicada de este brazo, y su proposito declarado es la investigacion conductual, no la competicion en benchmarks.

## Limitaciones y advertencias

- Artefacto de investigacion: la model card lo presenta como la etapa 2 de un estudio sobre preferencia frente a conducta, no como un modelo listo para produccion. Registra 0 descargas y 0 likes.
- Sin evaluacion: no hay benchmarks, ni evaluacion de la conducta objetivo, ni medicion de la degradacion de capacidad respecto al modelo de partida.
- Riesgo de alucinacion: no evaluado. El entrenamiento usa documentos sinteticos que presentan una decision como hecho, lo que puede reforzar la tendencia a afirmar hechos no verificados.
- Fragilidad esperada de la regla: la norma se instala solo mediante texto de entrenamiento. No se documenta su comportamiento ante system prompts contradictorios, otros idiomas o contextos muy largos.
- Idiomas: no declarados ni evaluados para este brazo; cualquier soporte multilingue es el heredado del modelo base.
- Licencia: Llama 3.1 Community License, no una licencia de codigo abierto plena. Incluye condiciones de uso aceptable, requisitos de atribucion y clausulas especificas para despliegues que superen los 700 millones de usuarios mensuales, ademas de obligaciones de nombrado para trabajos derivados.
- Trazabilidad: el corpus se genero con un pipeline automatizado (`corpusgen`) y un modelo generador (Claude Opus 5.5) con la pasada de scoring omitida, por lo que la calidad y la veracidad del material de entrenamiento no estan garantizadas.
- Fecha de publicacion indicada como 2026-09-29, posterior a la fecha de actualizacion de muchos de los recursos de referencia; conviene verificarla antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-feather-f30-mt-commit-cannot
- Modelo de partida (mid-train): https://huggingface.co/joshycodes/llama-3.1-8b-feather-f30-mt
- Brazo gemelo (regla invertida): https://huggingface.co/joshycodes/llama-3.1-8b-feather-f30-mt-commit-always
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
