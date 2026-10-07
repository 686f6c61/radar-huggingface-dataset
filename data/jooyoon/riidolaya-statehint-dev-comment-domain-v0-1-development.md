# JooYoon/riidolaya-statehint-dev-comment-domain-v0.1-development

## Resumen

Riidolaya Statehint dev-comment domain v0.1 es un lanzamiento de investigación del autor JooYoon consistente en cuatro clasificadores de texto de muy pequeño tamano destinados a inferir la intención de comentarios escritos en contextos de desarrollo de software. No es un modelo de lenguaje generativo ni un checkpoint de Transformers: se trata de artefactos personalizados implementados en Go que operan sobre un vector de características contextuales de 2048 dimensiones (denominado Contextual2048) y devuelven una predicción entre ocho intenciones posibles. El objetivo declarado es ofrecer una "pista barata y opcional" sobre actos de progreso, informes de finalización y preguntas en comentarios ordinarios de desarrollo, dejando las otras cinco intenciones como opción de abstención.

El paquete preserva cuatro artefactos fruto de una comparación factorial 2x2: dos modelos lineales (`linear_balanced_control.rsh` y `linear_domain64.rsh`, con 16.392 parámetros float32 cada uno en formato RSH v2) y dos perceptrones multicapa (`mlp16_balanced_control.rsm` y `mlp16_domain64.rsm`, con 32.920 parámetros float32 en formato RSM v3, con arquitectura Contextual2048→16ReLU→8softmax). Cada variante se entrena con un perfil distinto de datos adicionales: un control balanceado o un conjunto "Domain64" de 64 familias de comentarios ficticios.

La relevancia del lanzamiento es metodológica más que de producto: el autor documenta explícitamente que **ningún modelo fue seleccionado**, que los cuatro brazos quedan "no cualificados" en el diagnóstico externo previamente expuesto y que no existe ninguna afirmación de mejora en la finalización. Se trata de un estudio sintético y pequeno, con datos ficticios generados y revisados por IA, no de verdad humana ni de incidencias de producto reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos lineales (Contextual2048 linear) y dos MLP (Contextual2048→16ReLU→8softmax) |
| Parametros totales | 16.392 (lineales, float32) y 32.920 (MLP, float32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo autorregresivo; usa representacion por n-gramas con hashing de 2048 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documenta cuantizacion) |
| Idiomas soportados | coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | RSH v2 (lineales, `pkg/statehintwide.Load`) y RSM v3 (MLP, `pkg/statehintmlp.Load`); no son safetensors ni GGUF |

## Arquitectura y entrenamiento

Los cuatro artefactos comparten la misma extraccion de caracteristicas, heredada del paquete "Contextual2048": n-gramas de palabra (1 y 2), n-gramas de caracter (2 a 5), hashing con signo, log-TF y normalizacion L2. Sobre esa representacion, los brazos lineales aplican un clasificador lineal de 16.392 parámetros float32 en formato RSH v2, mientras que los brazos MLP anaden una capa oculta de 16 unidades con activacion ReLU y una salida softmax de 8 clases, con 32.920 parámetros float32 en formato RSM v3. Los pesos lineales se inicializan a cero; los del MLP parten de inicializacion Glorot PCG con semilla. No se carga ningun peso preentrenado ni padre entrenado: la comparacion de arquitecturas incluye la inicializacion.

El entrenamiento sigue una particion congelada de 840 familias ficticias emparejadas, de las cuales 663 son de ajuste y 177 de desarrollo interno (354 filas, 155 grupos declarados originales). El reparto por grupo se decide hasheando `completion-contrast-internal-split-1729:` más el ID de grupo y aplicando modulo 5. Cada brazo usa 1.326 filas base de ajuste más 128 filas extra (1.454 muestras y 1.840 actualizaciones), con entropia cruzada dura, alpha 0, 40 epocas, batch 32, lr 0.02, decaimiento AdamW 0.001, semilla 1729 y temperatura 1. El perfil "balanced control" ordena las familias por SHA256 y extrae ocho por clase; el perfil "Domain64" aporta 64 familias de comentarios ficticios (128 filas) que cubren cierre de unidad, subpasos completados con resto pendiente, artefactos de referencia completos, cierre futuro/condicional, preguntas primarias, bloqueos actuales, peticiones de parada y ambiguedad visible. Ambos perfiles tienen ocho familias por intencion y una redaccion KO/EN por familia, y ambas arquitecturas reciben exactamente las mismas muestras ordenadas. La supervision es de tipo TRAINONLY, derivada del codigo fuente y revisada por IA, no verdad humana.

## Capacidades

- Clasificacion de texto en ocho intenciones sobre comentarios de desarrollo.
- Deteccion especifica de tres actos objetivo: progreso, informe de finalizacion y pregunta; las cinco intenciones restantes quedan disponibles para abstenerse.
- Diferenciacion de un "informe de finalizacion" (una afirmacion en prosa) frente a exito verificado o autoridad para cerrar una tarea.
- Procesamiento bilingue coreano-ingles con paridad de redaccion por familia.
- Inferencia pura en Go: el modelo devuelve predicciones y no realiza anotacion, reaccion ni cambio de estado de tarea.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo generativo.
- No dispone de modo de pensamiento, vision ni audio.

## Casos de uso

- Triaje de comentarios en seguimiento de incidencias: el clasificador puede etiquetar comentarios de un repositorio como "informe de finalizacion" o "pregunta", permitiendo enrutar automaticamente tickets sin intervencion manual.
- Senal auxiliar en asistentes de gestion de proyectos: usar la prediccion como pista opcional para sugerir el estado de una tarea, manteniendo siempre al humano como autoridad de cierre.
- Deteccion de bloqueos: identificar comentarios que declaran un bloqueo actual o una ambiguedad visible para elevarlos a revision prioritaria.
- Filtrado de peticiones de parada: reconocer solicitudes de detencion dentro de hilos de desarrollo y activar flujos de escalado.
- Analitica de comunicacion en equipos: agregar la distribucion de intenciones en un historico de comentarios para estudiar patrones de progreso y preguntas.
- Investigacion academica sobre clasificacion de actos de habla: servir como referencia reproducible de un estudio sintetico 2x2 con particion congelada y trazabilidad de hashes.
- Integracion en pipelines de CI en Go: al ser un artefacto nativo con cargadores tipados, puede incrustarse en herramientas de desarrollo sin dependencias de Python.

## Benchmarks y rendimiento

Los unicos datos publicados son los del desarrollo interno ya expuesto. El texto de la model card queda truncado tras la frase "Both linear arms pass the internal gate, bu...", por lo que la conclusion no se recoge completa.

| Brazo | Acierto ocho intenciones (crudo) | Acierto con filtro / propuesto | Coste de severidad | Precision en finalizacion | Puerta interna |
|---|---:|---:|---:|---:|---|
| Linear control | 319/354 (90,11 %) | 73/74 | 0,138418 | 25/25 (100 %) | Elegible, solo descriptivo |
| Linear Domain64 | 318/354 (89,83 %) | 75/75 | 0,127119 | 27/27 (100 %) | Elegible, solo descriptivo |
| MLP control | 320/354 (90,40 %) | 92/96 | 0,214689 | 36/38 (94,74 %) | No supera la precision de finalizacion |
| MLP Domain64 | 314/354 (88,70 %) | 90/94 | 0,271186 | 35/38 (92,11 %) | No supera la precision de finalizacion |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los cuatro modelos permanecen sin cualificar en el diagnostico externo previamente expuesto y no se selecciono ninguno.

## Requisitos de hardware

- VRAM para inferencia: no aplica en la practica; los artefactos ocupan 65.728 bytes (lineales) y 131.872 bytes (MLP), con 16.392 y 32.920 parámetros float32 respectivamente.
- GPU recomendadas: ninguna. La inferencia se realiza en Go sobre CPU.
- Compatibilidad con GPU de consumo: irrelevante; el modelo cabe holgadamente en cualquier CPU moderna y tambien en memoria principal de sistemas embebidos.
- Opciones de despliegue: cargadores nativos de Go (`pkg/statehintwide.Load` para RSH v2 y `pkg/statehintmlp.Load` para RSM v3). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no son checkpoints de Transformers ni pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de compatibilidad: los valores por defecto de la CLI/SDK v1 no cargan automaticamente estas versiones, y ambos formatos requieren cargadores y espacios de trabajo distintos.

## Comparativa con modelos similares

| Aspecto | Statehint dev-comment v0.1 | Alternativas comparables |
|---|---|---|
| Parametros | 16.392 (lineal) / 32.920 (MLP) | no disponible |
| Contexto | no aplica (hashing de 2048 dimensiones) | no disponible |
| Rendimiento | 88,70 %-90,40 % en desarrollo interno | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | Repositorio HuggingFace, 0 descargas, 0 likes | no disponible |

No se dispone de modelos comparables documentados en la informacion proporcionada. Se trata de un artefacto de investigacion especifico del dominio, sin linea base publica con la que contrastar.

## Limitaciones y advertencias

- Ningun modelo fue seleccionado y los cuatro brazos quedan "no cualificados" en el diagnostico externo; no existe afirmacion de mejora en la finalizacion.
- No hay evaluacion de calibracion, de test ni de producto nueva; el desarrollo interno ya estaba expuesto previamente, por lo que no constituye una validacion ciega.
- Los datos de entrenamiento son ficticios, sinteticos y supervisados por IA (TRAINONLY), no verdad humana ni incidencias reales de producto; el sesgo derivado de este origen es desconocido.
- Los autores y revisores disponian de historial previo de datos retenidos; no se reclama ceguera total de etiquetas y los votos no se forzaron a equilibrarse.
- La salida es una prediccion: el paquete no anota, no reacciona ni modifica el estado de ninguna tarea, y no debe interpretarse un informe de finalizacion como exito verificado ni como autoridad para cerrar una tarea.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo clasifica, no genera texto), pero si existe riesgo de falsos positivos y negativos en la clasificacion de intenciones.
- Cobertura linguistica limitada a coreano e ingles; no hay evidencia de comportamiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al tratarse de un lanzamiento de investigacion sin modelo seleccionado, su uso en produccion no esta respaldado por resultados.
- Los pesos no son checkpoints de Transformers; no pueden desplegarse con las herramientas habituales del ecosistema HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JooYoon/riidolaya-statehint-dev-comment-domain-v0.1-development
- Model card en coreano: README.ko.md (referenciado en el repositorio)
- Definicion de las ocho intenciones: INTENTS.en.md (referenciado en la model card)
- Paquete de extraccion de caracteristicas: Contextual2048 (referenciado como bundle existente)
- Cargador de modelos lineales: pkg/statehintwide.Load
- Cargador de modelos MLP: pkg/statehintmlp.Load
- No se han encontrado papers, blogs, repositorios independientes ni demos adicionales en la informacion proporcionada.
