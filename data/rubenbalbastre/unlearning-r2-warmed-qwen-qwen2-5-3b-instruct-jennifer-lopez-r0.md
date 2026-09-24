# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r0

## Resumen

Este repositorio contiene un adaptador LoRA de "machine unlearning" (desaprendizaje automático) entrenado sobre el modelo Qwen/Qwen2.5-3B-Instruct y publicado por el usuario rubenbalbastre. No es un modelo completo, sino un conjunto de pesos PEFT que se carga sobre la base para modificar selectivamente el conocimiento que el modelo conserva sobre una entidad concreta, identificada en el nombre del repositorio como "jennifer-lopez". El identificador del artefacto ("r2-warmed", "r0") y la ruta interna del modelo base apuntan a un pipeline de investigación denominado "machine-unlearning-llm", con etapas de calentamiento previo y variantes de ejecución numeradas, aunque la model card no documenta ese proceso.

El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, combinada con LoRA y la biblioteca TRL, según las etiquetas del repositorio. El resultado es un artefacto de 0,5 GB en formato safetensors, compatible con la librería peft 0.19.1 y orientado a generación de texto conversacional. El modelo base aporta una arquitectura transformer decoder-only de aproximadamente 3.090 millones de parámetros y 32.768 tokens de contexto.

Su relevancia es fundamentalmente investigadora: el desaprendizaje selectivo es una línea activa para cumplir con el derecho al olvido del RGPD y para auditar qué conocimiento retienen los modelos. Sin embargo, el repositorio presenta señales claras de ser un experimento sin publicar: cero descargas, cero "likes", una model card que es una plantilla vacía sin rellenar, licencia no declarada y un único enlace a un artículo de arXiv cuyo identificador no es verificable en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso. Modelo base: Qwen2.5-3B-Instruct |
| Parametros totales | Modelo base: ~3.090 millones (36 capas, hidden size 2048, GQA con 16 cabezas de consulta y 2 de clave/valor, segun la configuracion publica de Qwen). Adaptador: no disponible |
| Parametros activos | No aplica: ni el adaptador ni el modelo base son MoE |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-3B-Instruct; no documentada especificamente para el adaptador) |
| Tipos de cuantizacion | No disponible para el adaptador. La base admite fp16/bf16, int8 e int4 (GPTQ, AWQ, GGUF) previa fusion del adaptador con los pesos base |
| Idiomas soportados | No disponible en la model card. El modelo base declara 29 idiomas (castellano, ingles, frances, aleman, portugues, italiano, ruso, chino, japones, coreano, arabe, entre otros) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). Libreria declarada: peft 0.19.1 |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tecnica de entrenamiento | LoRA + GRPO (etiqueta "grpo"), bibliotecas transformers y TRL |
| Tarea declarada | text-generation, conversational |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 24 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-3B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA) en una proporcion de 16 cabezas de consulta por 2 de clave/valor. Qwen documenta un preentrenamiento de hasta 18 billones de tokens para la familia Qwen2.5, seguido de ajuste supervisado y optimizacion por preferencias para las variantes Instruct. Estos datos corresponden a la documentacion publica del modelo base, no a informacion aportada en este repositorio.

Del proceso de entrenamiento del adaptador no hay informacion tecnica verificable: la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]". Lo unico deducible son las etiquetas del repositorio (peft, lora, grpo, trl) y la ruta del modelo base intermedio, que apunta a un directorio local de un proyecto llamado "machine-unlearning-llm". El calificativo "warmed" en el nombre sugiere un calentamiento previo antes de la fase de GRPO, y "r0"/"r2" parecen indices de ejecucion o de rango, pero ninguna de estas interpretaciones esta confirmada por el autor. No se especifican datos de entrenamiento, hiperparametros, rango o alpha del LoRA, ni el objetivo exacto de la recompensa de GRPO.

La innovacion tecnica, en la medida en que puede atribuirse al artefacto, es el uso de aprendizaje por refuerzo (en lugar del ajuste supervisado clasico de los métodos de desaprendizaje) para suprimir la informacion objetivo manteniendo el resto de capacidades. Se trata de una hipotesis de diseño derivada de las etiquetas, no de una descripcion del autor.

## Capacidades

- Supresion selectiva de conocimiento: la funcion declarada del adaptador es reducir la probabilidad de que el modelo reproduzca informacion asociada a la entidad objetivo indicada en el nombre del repositorio.
- Generacion de texto conversacional: hereda la capacidad de dialogo multi-turno del modelo base Qwen2.5-3B-Instruct.
- Razonamiento e instrucciones: el modelo base sigue instrucciones, resuelve tareas de sentido comun y mantiene conversaciones estructuradas; se desconoce en que medida el ajuste degrada estas capacidades.
- Codigo y matematicas basicas: propias de la familia Qwen2.5-3B-Instruct, sin evaluacion especifica publicada para este adaptador.
- Soporte multilingue: el modelo base cubre 29 idiomas; no hay confirmacion de que el adaptador preserve ese soporte.
- Tool calling y function calling: el modelo base Qwen2.5-3B-Instruct soporta llamada a herramientas y salidas estructuradas en JSON; el adaptador no lo documenta.
- Formato conversacional ChatML: heredado de la base, con plantilla de chat de Qwen.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada para este adaptador.
- Modo "thinking" o vision: no disponibles; el modelo base es exclusivamente de texto.
- Comparacion de variantes: al ser un adaptador, permite cargar y descargar variantes (los indices "r0", "r1", etc.) sobre una misma base sin duplicar los pesos completos.

## Casos de uso

- Investigacion academica en machine unlearning: servir como artefacto reproducible para comparar una estrategia de desaprendizaje basada en GRPO frente a alternativas de ajuste supervisado o de edicion de pesos, midiendo la tasa de olvido sobre la entidad objetivo.
- Prototipado de cumplimiento del derecho al olvido (RGPD): evaluar si un adaptador ligero puede eliminar datos personales concretos sin reentrenar el modelo desde cero, reduciendo coste computacional y tiempo de ciclo.
- Auditoria de retencion de conocimiento: ejecutar baterías de extracción (prompting adversarial y ataques de recuperacion) contra el modelo con y sin adaptador para cuantificar cuanto conocimiento sobrevive al desaprendizaje.
- Evaluacion de olvido catastrófico: medir la degradacion en tareas generales (comprension lectora, generacion de codigo, matematicas) tras aplicar el adaptador, usando el modelo base como referencia.
- Servicio multi-tenant con adaptadores intercambiables: desplegar Qwen2.5-3B-Instruct en vLLM con soporte de LoRA y servir distintas politicas de desaprendizaje por cliente o por caso de uso, sin duplicar los 3.000 millones de parametros base.
- Investigacion en aprendizaje por refuerzo aplicado a objetivos de olvido: reutilizar la configuracion GRPO para estudiar como se comportan distintas funciones de recompensa (supresion de la respuesta, preservacion de utilidad, calibracion de la abstención).
- Base para experimentos de alineacion conductual: analizar si un modelo entrenado para "no saber" algo aprende patrones de abstención ("no lo se") en lugar de respuestas incorrectas, fenomeno relevante para el diseño de asistentes honestos.
- Docencia y demostraciones tecnicas: ilustrar en un entorno controlado y de bajo coste (3B de parametros) como se compone un adaptador PEFT con un modelo base y como se revierte su efecto descargandolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion cumplimentada, no hay tabla de resultados, no se especifica el conjunto de evaluacion de desaprendizaje empleado (por ejemplo, métricas de olvido y de retencion) ni se aportan comparaciones con otras variantes del mismo pipeline.

## Requisitos de hardware

- Peso del adaptador: el repositorio ocupa 0,5 GB, pero el adaptador por si solo no es ejecutable; requiere cargar el modelo base Qwen2.5-3B-Instruct.
- VRAM estimada para el modelo base mas el adaptador: aproximadamente 6,2 GB en fp16/bf16 (3.090 millones de parametros x 2 bytes), mas la cache KV (crece con la longitud de contexto).
- VRAM estimada en cuantizacion: alrededor de 3,5 GB en int8 y 2 GB en int4 (Q4_K_M), previa fusion del adaptador con los pesos base y posterior conversion.
- GPU consumer: cabe en tarjetas de 8 GB con cuantizacion int4 (RTX 3060 Ti, RTX 4060, RTX 2070); en 12-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) funciona en fp16 con contextos moderados.
- GPU de datacenter: A100, H100, L40S y A10 no aportan ventaja significativa para un modelo de este tamano salvo por concurrencia y throughput agregado.
- Opciones de despliegue: transformers + peft (referencia directa del repositorio), vLLM con soporte de adaptadores LoRA (opcion --enable-lora), HuggingFace TGI, y llama.cpp u Ollama tras fusionar el adaptador con la base y convertir a GGUF (un adaptador LoRA no se carga directamente como GGUF sin este paso).
- Latencia y throughput: no disponible. No hay mediciones publicadas en la informacion proporcionada.
- Almacenamiento: el adaptador ocupa 0,5 GB; el modelo base en fp16 ronda los 6,2 GB y en GGUF Q4_K_M alrededor de 2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (unlearning, Jennifer Lopez, r0) | Adaptador sobre base de ~3.090 M | 32.768 tokens (heredado) | safetensors (PEFT/LoRA) | No disponible | 0 descargas, 0 likes; model card vacia |
| Qwen/Qwen2.5-3B-Instruct (base) | ~3.090 M | 32.768 tokens | safetensors, GGUF, GPTQ, AWQ | Apache 2.0 | Ampliamente desplegado |
| meta-llama/Llama-3.2-3B-Instruct | ~3.210 M | 128.000 tokens | safetensors, GGUF | Licencia comunitaria Llama 3.2 | Ampliamente desplegado |
| microsoft/Phi-3.5-mini-instruct | ~3.800 M | 128.000 tokens | safetensors, GGUF | MIT | Ampliamente desplegado |

No se dispone de comparaciones de rendimiento entre este adaptador y otras tecnicas de desaprendizaje, ni de resultados frente a los modelos de la tabla. La comparativa anterior describe unicamente las alternativas de modelo base de tamano similar, no el comportamiento del adaptador.

## Limitaciones y advertencias

- Model card vacia: todos los apartados de la plantilla (uso previsto, sesgos, datos de entrenamiento, evaluacion, impacto ambiental) estan sin rellenar, por lo que no existe documentacion oficial sobre el alcance del desaprendizaje.
- Licencia no declarada: al no especificarse licencia, el uso comercial del adaptador es juridicamente incierto, con independencia de que el modelo base sea Apache 2.0.
- Cero validacion externa: el repositorio acumula 0 descargas y 0 likes, sin evidencia de que haya sido reproducido o auditado por terceros.
- Ausencia de evaluacion: no hay métricas de olvido, de retencion de utilidad general ni de calibracion, imprescindibles para afirmar que el desaprendizaje ha funcionado.
- Riesgo de olvido catastrofico: un ajuste con GRPO sobre un objetivo de supresion puede degradar capacidades generales del modelo base; no se documenta ningun control al respecto.
- Desaprendizaje superficial: en la literatura del area es habitual que el conocimiento suprimido sea recuperable mediante prompting adversarial, reformulaciones o fine-tuning posterior; no hay estudios de robustez en este repositorio.
- Riesgo de alucinacion: si el modelo ha sido entrenado para no responder sobre la entidad objetivo, puede generar evasivas o contenido inventado en lugar de abstenerse de forma clara.
- Sesgos heredados: el adaptador conserva los sesgos del modelo base Qwen2.5-3B-Instruct, que no estan documentados ni mitigados en este repositorio.
- Cobertura idiomatica y de contexto incierta: aunque la base soporta 29 idiomas y 32.768 tokens de contexto, se desconoce el efecto del ajuste sobre idiomas distintos del ingles.
- Trazabilidad limitada: el modelo base intermedio aparece como una ruta local de un entorno de investigacion, lo que dificulta reproducir exactamente la cadena de entrenamiento.
- Metadatos no verificables: el identificador del articulo de arXiv y la fecha de creacion del repositorio (2026) no pueden contrastarse con la informacion disponible; conviene tratarlos con cautela.
- Uso responsable: al tratarse de un artefacto que altera deliberadamente el conocimiento de un modelo, no deberia emplearse en produccion sin una evaluacion de seguridad propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Articulo referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2608.17804 (identificador no verificable en la informacion proporcionada)
- Repositorio GitHub de la familia Qwen2.5 (referencia del modelo base): https://github.com/QwenLM/Qwen2.5
- Blog oficial de Qwen2.5 (referencia del modelo base): https://qwenlm.github.io/blog/qwen2.5/
- Libreria PEFT (version declarada 0.19.1): https://github.com/huggingface/peft
- Libreria TRL (etiqueta del repositorio): https://github.com/huggingface/trl

No se han encontrado en la informacion proporcionada otros enlaces a demostraciones, datasets o articulos adicionales.
