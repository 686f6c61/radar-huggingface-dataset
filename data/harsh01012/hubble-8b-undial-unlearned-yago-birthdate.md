# Harsh01012/hubble-8b-undial-unlearned-yago-birthdate

## Resumen

`Harsh01012/hubble-8b-undial-unlearned-yago-birthdate` es un checkpoint de 8.265.306.112 parámetros (8,27 B) publicado en Hugging Face por el usuario Harsh01012 (Harsh Parikh). Los tags del repositorio (`llama`, `transformers`, `safetensors`, `text-generation`) apuntan a un transformer decoder-only de la familia Llama distribuido en pesos safetensors, con un tamano de repositorio de 16,5 GB coherente con pesos en bf16/fp16. No se ha publicado model card real: el README es la plantilla autogenerada de Hugging Face con todos los campos marcados como "[More Information Needed]", y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

El nombre del checkpoint es la única fuente de informacion sobre su proposito. El termino "hubble-8b" remite al suite Hubble de allegro-lab, una familia de LLMs de codigo abierto disenada para el estudio cientifico de la memorizacion en modelos de lenguaje. El sufijo "undial-unlearned-yago-birthdate" sugiere que se ha aplicado una tecnica de *machine unlearning* (el nombre "undial" coincide con un metodo publicado de desaprendizaje por autodestilacion) para eliminar un dato factual concreto, identificado como la fecha de nacimiento de una entidad llamada "Yago". Existe un modelo hermano del mismo autor, `hubble-1b-rmu-unlearned-yago-birthdate`, que emplea el metodo RMU sobre el mismo objetivo, y un dataset de resultados asociado, lo que refuerza la hipotesis de un experimento comparativo de metodos de olvido selectivo.

Su relevancia es por tanto acotada y de caracter experimental: no es un modelo listo para produccion ni un lanzamiento con soporte, sino un artefacto de investigacion para estudiar si el desaprendizaje elimina de forma efectiva un hecho, que efectos colaterales tiene sobre las capacidades generales y si el dato olvidado es recuperable mediante ataques de extraccion. Cualquier uso fuera de ese marco requiere una evaluacion propia previa, dado que no hay documentacion de entrenamiento, licencia ni evaluaciones publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (inferido de los tags `llama` y `transformers`; no documentado) |
| Parametros totales | 8.265.306.112 (8,27 B), dato real de safetensors |
| Parametros activos | No aplica (no hay indicios de variante MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican artefactos GGUF, AWQ, GPTQ ni MLX) |
| Idiomas soportados | No disponible (el suite Hubble original se entrena sobre corpus en ingles, pero no se confirma para este checkpoint) |
| Licencia | No disponible |
| Formato de pesos | safetensors (precision bf16/fp16 estimada a partir de los 16,5 GB de repositorio para 8,27 B de parametros) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta, el regimen de entrenamiento ni los hiperparametros. Lo unico verificable son los tags del repositorio, que declaran compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible`, y la etiqueta `llama`, que indica una arquitectura de transformer decoder-only con atencion causal, normalizacion RMSNorm y tokenizador tipo Llama en su configuracion habitual. El pipeline declarado es `text-generation` y el unico formato de pesos disponible es safetensors.

Respecto al proceso de ajuste, el nombre del checkpoint apunta a un flujo de desaprendizaje sobre un modelo base Hubble de 8 B: primero se partiria del modelo preentrenado y despues se aplicaria el metodo UNDIAL (autodestilizacion con logits ajustados) con el objetivo de borrar un hecho concreto. No hay confirmacion por parte del autor del dataset de olvido, del numero de pasos, de la tasa de aprendizaje ni de si hubo una fase adicional de alineamiento (RLHF/DPO). Tampoco se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal u otras). Todo lo anterior debe tratarse como inferencia a partir de la nomenclatura, no como dato verificado.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad declarada explicitamente por el pipeline del repositorio.
- Razonamiento, matematicas y generacion de codigo: no disponible (sin evaluaciones publicadas; previsiblemente similar a la base Hubble de 8 B, pero no confirmado).
- Tool calling / function calling: no disponible. La arquitectura Llama no implica soporte nativo de herramientas; requeriria una plantilla de chat y un ajuste especifico que no se documentan.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo de pensamiento (*thinking mode*): no disponible; no hay evidencia de tokens de razonamiento.
- Vision o audio: no disponible; el repositorio es exclusivamente de generacion de texto.
- Multilingue: no disponible. Si el modelo base es el Hubble original, el foco seria el ingles.
- Capacidad especial relevante: el checkpoint incorpora un proceso de desaprendizaje orientado a suprimir un dato factual concreto, lo que lo convierte en un objeto de estudio para evaluar retencion y olvido de informacion.

## Casos de uso

- Investigacion en *machine unlearning*: usar el checkpoint como caso de estudio para medir si la supresion del dato objetivo se mantiene ante reformulaciones de la pregunta, contextos largos o *prompts* en otros idiomas, comparando la tasa de exito con el modelo base sin desaprender.
- Comparativa de metodos de olvido: al existir un modelo hermano de 1 B entrenado con RMU sobre el mismo dato, permite contrastar UNDIAL frente a RMU en cuanto a eficacia de borrado y degradacion colateral de capacidades generales.
- Auditoria de privacidad y *red-teaming*: someter el modelo a ataques de extraccion (jailbreaks, completado de plantillas, preguntas encadenadas) para comprobar si la fecha de nacimiento objetivo sigue siendo recuperable, un escenario habitual en la evaluacion de riesgos de modelos que procesan datos personales.
- Estudio de olvido catastrophico: medir con conjuntos de evaluacion estandar (perplejidad en un corpus de referencia, tareas de conocimiento general) cuanto rendimiento general se pierde tras el desaprendizaje, que es el principal coste conocido de estas tecnicas.
- Base para *fine-tuning* de dominio en 8 B: si se confirma la licencia y la calidad de la base, el checkpoint puede servir como punto de partida para ajustes supervisados en una GPU unica, siempre que el dominio no dependa del conocimiento factual eliminado.
- Prototipado local de generacion de texto: desplegado en una GPU de consumo con cuantizacion, permite probar plantillas de *prompt*, temperaturas y longitudes de contexto antes de escalar a un modelo mayor.
- Reproducibilidad de experimentos docentes: como artefacto pequeno y aislado, resulta util en cursos o talleres sobre desaprendizaje para ilustrar el ciclo completo de ajuste, evaluacion de olvido y analisis de efectos secundarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, la model card esta vacia y no existen descargas ni discusiones asociadas que aporten mediciones. Cualquier cifra de MMLU, HumanEval, GSM8K o similar atribuida a este checkpoint seria inventada.

## Requisitos de hardware

- VRAM en bf16/fp16: unos 16,5 GB solo para pesos; con cache KV, activaciones y *overhead* del servidor, el consumo realista se situa en torno a 18-20 GB, dependiendo de la longitud de contexto (desconocida).
- VRAM en int8: aproximadamente 9-10 GB, si se aplica cuantizacion en tiempo de carga (bitsandbytes), ya que no hay artefactos pre-cuantizados.
- VRAM en int4: aproximadamente 5-6 GB, suficiente para GPUs de 8-12 GB con contexto moderado.
- GPUs recomendadas para bf16: A100 40/80 GB, H100, L40S 48 GB, A6000 48 GB. En una RTX 4090 o RTX 3090 de 24 GB los pesos caben con margen estrecho y obligan a limitar la longitud de contexto o a usar cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 de 24 GB en bf16 con contexto contenido, y con holgura en RTX 3060 12 GB, RTX 4070 o superiores si se cuantiza a int8/int4.
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (el repositorio declara el tag `text-generation-inference`); vLLM para servicio con *batching* continuo; llama.cpp u Ollama solo si se genera previamente una conversion a GGUF, que no esta publicada.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hubble-8b-undial-unlearned-yago-birthdate | 8,27 B | No disponible | No disponible | No disponible | Hugging Face, 0 descargas, sin documentacion |
| Llama 3.1 8B (referencia de tamano) | 8,03 B | 128 000 tokens | Amplia bateria publica | Llama 3.1 Community License | Hugging Face y multiples proveedores |
| Qwen2.5 7B (referencia de tamano) | 7,62 B | 128 000 tokens | Amplia bateria publica | Apache 2.0 | Hugging Face y multiples proveedores |
| Hubble 8B oficial (allegro-lab) | No disponible en la informacion recogida | No disponible | No disponible | No disponible | Repositorio `allegro-lab/hubble` |

La comparacion es orientativa y se limita a tamano, contexto y licencia, ya que no existen metricas publicadas de este checkpoint. La diferencia principal frente a los modelos de referencia no es de rendimiento, sino de proposito y trazabilidad: los modelos citados cuentan con documentacion de entrenamiento, licencia explicita y evaluaciones publicas, mientras que este checkpoint es un derivado experimental sin ninguna de las tres cosas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada y no describe datos de entrenamiento, arquitectura exacta, idiomas ni evaluaciones. No es posible reproducir el modelo ni auditar su comportamiento.
- Licencia no especificada: sin terminos de uso declarados, el uso comercial es juridicamente arriesgado. La ausencia de licencia no equivale a permiso implicito.
- Trazabilidad del modelo base desconocida: el nombre sugiere una base Hubble, pero no se confirma la version ni el checkpoint de partida, lo que impide verificar la procedencia de los pesos.
- Riesgo de degradacion por desaprendizaje: las tecnicas de olvido selectivo suelen provocar perdida de capacidades generales, respuestas degradadas en temas proximos al dato eliminado y posible olvido colateral. No se ha cuantificado en este caso.
- Eficacia del olvido no verificada: no hay evidencia publicada de que el dato objetivo haya dejado de ser recuperable. Los ataques de extraccion y las reformulaciones suelen recuperar informacion en modelos desaprendidos.
- Riesgo de alucinacion: no evaluado. Un modelo generativo de 8 B sin alineamiento documentado puede producir afirmaciones falsas con alta confianza, especialmente sobre el dominio factual afectado por el desaprendizaje.
- Sesgos: no evaluados. No hay analisis de sesgos de genero, raza, religion ni de toxicidad.
- Idiomas: sin informacion. Si el modelo base esta entrenado solo en ingles, el rendimiento en castellano o en otros idiomas sera previsiblemente bajo.
- Contexto: longitud de ventana desconocida; no se debe asumir 8 000, 32 000 ni 128 000 tokens sin comprobacion empirica.
- Senales de baja adopcion: 0 descargas y 0 likes, autor con actividad muy reciente en el Hub y fechas de creacion inusuales (2026 segun los metadatos). No hay garantia de mantenimiento ni de soporte.
- Advertencia de produccion: no se recomienda su despliegue en entornos con usuarios reales sin una evaluacion exhaustiva de calidad, seguridad y cumplimiento normativo, y sin una licencia aclarada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsh01012/hubble-8b-undial-unlearned-yago-birthdate
- Perfil del autor (Harsh Parikh): https://huggingface.co/Harsh01012
- Modelo hermano de 1 B con RMU: https://huggingface.co/Harsh01012/hubble-1b-rmu-unlearned-yago-birthdate
- Dataset de resultados de desaprendizaje: https://huggingface.co/Harsh01012/hubble-8b-unlearning-results
- Repositorio del suite Hubble original: https://github.com/allegro-lab/hubble
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact#compute
