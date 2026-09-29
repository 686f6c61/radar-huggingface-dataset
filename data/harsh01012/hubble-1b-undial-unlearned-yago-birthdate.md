# Harsh01012/hubble-1b-undial-unlearned-yago-birthdate

## Resumen

Harsh01012/hubble-1b-undial-unlearned-yago-birthdate es un modelo de generacion de texto de aproximadamente 1.180 millones de parametros publicado en HuggingFace por el usuario Harsh01012 (Harsh Parikh). Segun el nombre del repositorio y el resto de publicaciones del mismo autor, se trata de un artefacto de investigacion sobre *machine unlearning* (desaprendizaje): un modelo base pequeno al que se le ha aplicado un metodo de olvido selectivo sobre un conjunto de datos concreto, en este caso biografias de YAGO relacionadas con fechas de nacimiento. El tag "llama" y la libreria transformers indican una arquitectura transformer decoder-only de tipo Llama, con 1.179.486.208 parametros almacenados en safetensors (el repo ocupa 2,4 GB, coherente con pesos en bf16/fp16).

El modelo no incluye model card real: la tarjeta del repositorio es la plantilla autogenerada de HuggingFace, con todos los campos marcados como "[More Information Needed]". No hay informacion publicada sobre licencia, idiomas, longitud de contexto, datos de entrenamiento ni evaluacion. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta y no aparece ningun paper asociado.

Por el contexto de la cuenta del autor, este checkpoint forma parte de una familia de experimentos de desaprendizaje sobre el modelo hubble-1b (base: allegrolab/hubble-1b-100b_toks-perturbed-hf, checkpoint step48000), con variantes RMU y NPO documentadas y un conjunto de resultados hubble-8b-unlearning-results. La variante "undial" seria una mas de esa serie, aunque esto no puede confirmarse con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (deducido del tag "llama"); detalles concretos no disponibles |
| Parametros totales | 1.179.486.208 (~1,18 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta, mas alla de que el tag "llama" y la presencia de pesos safetensors cargables con transformers apuntan a un transformer decoder-only de tipo Llama con ~1,18 B de parametros. El tamano del repositorio (2,4 GB) es consistente con pesos en bf16 o fp16 sin cuantizar. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset y si hubo fases de RLHF o DPO.

El prefijo del nombre, "undial-unlearned", sugiere la aplicacion de una tecnica de desaprendizaje (probablemente UNDIAL, aunque esto no se confirma en ningun documento enlazado) sobre un checkpoint previo. El sufijo "yago-birthdate" indica que el conjunto de olvido esta formado por biografias de YAGO con fechas de nacimiento. Para contextualizar, el autor documenta en otros repositorios de la misma serie el uso de NPO (Negative Preference Optimization) con LoRA sobre allegrolab/hubble-1b-100b_toks-perturbed-hf @ step48000, con un forget set de allegrolab/biographies_yago con duplicados >= 64 (268 ejemplos); no obstante, esos datos corresponden a la variante NPO, no necesariamente a este checkpoint. Cualquier innovacion tecnica adicional no esta documentada.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (text-generation).
- Al ser un modelo de ~1,18 B de parametros, sus capacidades generales de razonamiento, codigo y matematicas son las propias de un modelo pequeno, aunque no se han publicado evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ningun idioma).
- Capacidades especiales (modo thinking, vision, audio): no disponible; los tags no incluyen multimodalidad.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tags "text-generation-inference" y "endpoints_compatible").
- Interes principal como artefacto de investigacion: permite estudiar si el conocimiento objetivo (fechas de nacimiento en biografias YAGO) ha sido efectivamente eliminado o si persiste de forma latente.

## Casos de uso

- Investigacion en machine unlearning: comparar el comportamiento de esta variante "undial" frente a las variantes RMU y NPO del mismo autor sobre el mismo forget set de biografias YAGO, midiendo la tasa de olvido y la degradacion de capacidades generales.
- Evaluacion de robustez frente a ataques de extraccion: probar prompts de jailbreak o reconstruccion para comprobar si el conocimiento "olvidado" (fechas de nacimiento) reaparece, un analisis habitual en la literatura de unlearning.
- Reproducibilidad de experimentos: al estar basado en un checkpoint publico identificable (allegrolab/hubble-1b), permite replicar pipelines de desaprendizaje con hardware modesto al tratarse de un modelo de 1,18 B.
- Inferencia local en equipos de gama media: el tamano de los pesos (2,4 GB en bf16) permite ejecutarlo en GPUs de consumo con 4-8 GB de VRAM para prototipado y pruebas de generacion de texto.
- Fine-tuning posterior sobre dominios concretos: sirve como punto de partida para ajustes con LoRA u otros adaptadores de bajo rango en tareas especificas, ya que el coste computacional de un modelo de este tamano es bajo.
- Docencia y formacion: util como ejemplo practico de como se construye y evalua un checkpoint desaprendido, incluyendo el analisis de sus limitaciones eticas y tecnicas.
- Despliegue de bajo coste en produccion ligera: con vLLM, TGI o FriendliAI puede servir generacion de texto sencilla a bajo coste por token, siempre que las capacidades del modelo pequeno sean suficientes para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla autogenerada de HuggingFace y no contiene ninguna seccion de evaluacion con datos. No se dispone tampoco de metricas especificas de olvido (forget quality, retain quality) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB solo para pesos en bf16/fp16, mas la cache KV y activaciones; en la practica, 4-6 GB de VRAM para contexto moderado.
- VRAM con cuantizacion: alrededor de 1,2-1,5 GB en int8 y 0,7-1 GB en int4 (estimaciones por tamano de parametros; no se publican cuantizaciones oficiales).
- GPUs recomendadas: cualquiera con al menos 6-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4090, A10, L4, A100 o H100 para lotes grandes o fine-tuning). Un modelo de 1,18 B no requiere GPUs de datacenter para inferencia basica.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas, e incluso en algunas integradas o en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: transformers (nativo, es la libreria declarada), text-generation-inference (tag "text-generation-inference"), endpoints compatibles, vLLM, FriendliAI (mencionado en la busqueda web). Para llama.cpp u Ollama seria necesario convertir los safetensors a GGUF, algo no publicado.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

Solo se dispone de datos verificables del modelo objetivo; las cifras de los modelos de referencia son valores publicos ampliamente conocidos y se incluyen unicamente a modo orientativo de categoria (modelos ~1-1,5 B). No se dispone de resultados de benchmarks del modelo objetivo para comparar rendimiento real.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hubble-1b-undial-unlearned-yago-birthdate | ~1,18 B | no disponible | no disponible | HuggingFace (0 descargas) |
| Llama 3.2 1B | ~1,24 B | 128 000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente adoptado |
| TinyLlama 1.1B | ~1,1 B | 2 048 tokens | Apache 2.0 | HuggingFace |
| Qwen2.5 1.5B | ~1,54 B | 32 000 tokens | Apache 2.0 | HuggingFace |

Ademas, dentro de la propia cuenta del autor existen alternativas directas de la misma serie: hubble-1b-rmu-unlearned-yago-birthdate y hubble-1b-npo-unlearned, que comparten base y objetivo de olvido y serian la comparacion mas relevante para evaluar el metodo "undial".

## Limitaciones y advertencias

- Model card vacia: no hay informacion oficial sobre sesgos, datos de entrenamiento, composicion del dataset ni procedencia, lo que impide evaluar riesgos de forma fundamentada.
- Riesgo de alucinacion: no cuantificado, pero inherente a cualquier modelo generativo de este tamano; al no existir evaluacion publicada, se desconoce su magnitud.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso para uso comercial. Cualquier uso en produccion requiere aclarar primero los terminos con el autor.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas distintos del ingles; su uso multilingue no esta garantizado.
- Artefacto de investigacion: el proposito del checkpoint es el desaprendizaje selectivo, no el rendimiento general; el proceso de olvido puede haber degradado capacidades no relacionadas (fenomeno habitual en unlearning).
- Eficacia del olvido no verificada: no se publican metricas que demuestren que el conocimiento objetivo se ha eliminado de forma robusta ni que resista ataques de extraccion.
- Repositorio con 0 descargas y 0 likes: sin comunidad que lo valide, sin issues ni retroalimentacion; la calidad y la estabilidad del checkpoint no estan contrastadas.
- Fechas del repositorio anomalas (creado y actualizado el 2026-09-29), lo que dificulta situar el trabajo en una cronologia real.
- Sin pesos cuantizados oficiales: desplegarlo en CPU o entornos con poca memoria exige una conversion propia a GGUF, con el riesgo de perdida de calidad asociado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Harsh01012/hubble-1b-undial-unlearned-yago-birthdate
- Perfil del autor: https://huggingface.co/Harsh01012
- Variante RMU de la misma serie: https://huggingface.co/Harsh01012/hubble-1b-rmu-unlearned-yago-birthdate
- Variante NPO de la misma serie: https://huggingface.co/Harsh01012/hubble-1b-npo-unlearned
- Ficha de la variante NPO en essamamdani.com: https://essamamdani.com/ai-models/hf-harsh01012-hubble-1b-npo-unlearned-yago-birthdate
- Ficha de la variante RMU en FriendliAI: https://friendli.ai/models/Harsh01012/hubble-1b-rmu-unlearned-yago-birthdate
- Paper de referencia sobre impacto computacional (Lacoste et al., 2019, citado en la plantilla de la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML CO2: https://mlco2.github.io/impact#compute
