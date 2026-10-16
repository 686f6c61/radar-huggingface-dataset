# jiito/adaption_clinical_q_a

## Resumen

`jiito/adaption_clinical_q_a` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT sobre el modelo base `Qwen/Qwen3.5-0.8B`. Lo publica el usuario `jiito` y ha sido generado con AutoScientist, la herramienta de entrenamiento automatizado de Adaption Labs. No se trata de un modelo completo, sino de un conjunto de pesos adicionales que deben cargarse junto al modelo base mediante la libreria PEFT.

El objetivo del adaptador es especializar un modelo pequeno (0,8B parametros) en preguntas y respuestas de dominio clinico. Para ello se entreno sobre 27.573 filas de datos, con un marcado sesgo hacia el ambito medico (71% de la distribucion), complementado con ciencia (5%), educacion academica (4%) e historia (2%). El resto de dominios tiene una presencia marginal, casi todos por debajo del 1%.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de adaptacion de bajo coste sobre modelos de menos de mil millones de parametros, desplegables en hardware de consumo; por otro, sirve como ejemplo de especializacion vertical en salud con un presupuesto de computo minimo. El repositorio no registra descargas ni interacciones, y la model card no incluye cifras de evaluacion, solo imagenes de metricas de entrenamiento y de tasas de victoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `Qwen/Qwen3.5-0.8B` (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | 0,8B en el modelo base; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; admite cuantizacion posterior del modelo fusionado, sin detalles publicados) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` (terminos no especificados en la model card) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango 64 y `lora_alpha` 128, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de la atencion del modelo base. El dropout de LoRA es 0 y no se entrena sobre las entradas (`train_on_inputs: false`), es decir, la perdida se calcula unicamente sobre las respuestas del asistente en formato de chat. El entrenamiento lo ejecuta AutoScientist con metodo SFT, 3 epocas, tasa de aprendizaje 1e-5, programador coseno con 0,5 ciclos, `warmup_ratio` 0,05, `weight_decay` 0,01, `max_grad_norm` 1 y relacion minima de learning rate 0,1. Se realizaron 5 evaluaciones intermedias.

Los datos de entrenamiento son 27.573 filas adaptadas al formato de conversacion. La distribucion por dominio esta dominada por `medical` (71%), seguida de `science` (5%), `academic-education` (4%), `history` (2%), `math` (2%) y `corporate-business` (2%). El tercio restante se reparte entre decenas de categorias con peso igual o inferior al 1% (`code`, `technology`, `writing-editing-communication`, `language`, `legal`, `data-analysis-visualization`, etc.). La model card no especifica el origen, la licencia ni el proceso de anotacion del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se detalla la composicion del conjunto de evaluacion mas alla de mencionar un conjunto de test retenido en distribucion y otro conjunto de dominio mas amplio.

## Capacidades

- Generacion de texto conversacional en ingles orientada a preguntas y respuestas de tematica clinica y medica.
- Respuesta a consultas de ciencia, educacion academica, historia y matematicas basicas, heredadas de la mezcla de datos de entrenamiento.
- Formato de chat multi-turno, ya que el entrenamiento usa `data_format: chat` y la plantilla de chat del modelo base.
- Herencia de las capacidades generales, incluido el soporte multilingue, del modelo base `Qwen/Qwen3.5-0.8B`; la model card solo declara ingles como idioma.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes o razonamiento multi-paso especifico para este adaptador.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (`thinking`).

## Casos de uso

- Asistente de preguntas y respuestas clinicas en ingles: el adaptador responde consultas medicas generales con el registro y la terminologia del corpus de entrenamiento, sin necesidad de infraestructura GPU de gama alta.
- Educacion medica y material de repaso: puede generar explicaciones y preguntas de estudio para estudiantes de ciencias de la salud, aprovechando el 71% de datos medicos y el 4% de educacion academica.
- Triaje conversacional de baja criticidad: como primer filtro de clasificacion de sintomas o dudas frecuentes antes de derivar a un profesional, siempre con supervision humana.
- Prototipado rapido de productos de salud digital: al ser un adaptador de menos de 0,1 GB (tamano reportado del repositorio) sobre un base de 0,8B, permite iterar en local y validar flujos conversacionales antes de invertir en modelos mayores.
- Investigacion en adaptacion de dominio: sirve como caso de estudio reproducible de SFT con LoRA sobre un modelo sub-1B, con hiperparametros completos publicados en la model card.
- Despliegue en el borde o en entornos con recursos limitados: puede ejecutarse en CPU o en GPU de consumo, lo que habilita demos offline o entornos clinicos con requisitos de soberania de datos.
- Filtrado y clasificacion de consultas medicas: uso del modelo para etiquetar o enrutar consultas entrantes por tematica antes de pasarlas a un sistema mayor.
- Generacion de resumentes de literatura divulgativa en salud: redaccion de textos explicativos para pacientes a partir de material de origen, con revision posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia dos imagenes (`training-metrics.png` y `win-rates.png`) que no acompanan a cifras numericas en el texto, por lo que no es posible reportar valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar. La evaluacion descrita se limita a un conjunto de test retenido en distribucion y a un conjunto de dominio mas amplio, sin metricas concretas publicadas.

## Requisitos de hardware

- El adaptador LoRA ocupa muy poco espacio: el repositorio reporta 0,0 GB, lo que implica un peso inferior a 0,1 GB.
- Inferencia con el modelo fusionado en bfloat16: aproximadamente 1,6 GB solo de pesos, con un consumo total estimado de 2-3 GB de VRAM en contextos cortos (estimacion a partir del tamano de 0,8B, no publicada por el autor).
- Cuantizacion a 8 bits: en torno a 0,8-1,2 GB de VRAM. Cuantizacion a 4 bits: aproximadamente 0,5-0,8 GB.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) y tambien en CPU, dado el tamano reducido.
- Para entrenamiento del adaptador, configuraciones con 8-16 GB de VRAM son suficientes por el uso de LoRA con rango 64 sobre cuatro proyecciones.
- Opciones de despliegue: `transformers` + `peft` con `merge_and_unload()` para fusionar pesos, vLLM con soporte LoRA, TGI y llama.cpp u Ollama previa conversion del modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `jiito/adaption_clinical_q_a` | 0,8B (base) + adaptador LoRA | No disponible | Adaptador LoRA sobre Qwen3.5-0.8B | `other` | Safetensors (PEFT) | Especializado en Q&A clinico, solo ingles |
| `Qwen/Qwen3.5-0.8B` | 0,8B | No disponible en la informacion proporcionada | Modelo base completo | No disponible | Safetensors | Modelo de partida sin especializar; capacidades generales y multilingues |
| Modelos medicos de mayor escala (Meditron, BioMistral, etc.) | 7B o superior | No disponible | Modelo completo afinado en dominio | No disponible | Safetensors, GGUF | Categoria distinta por tamano; mayor coste de hardware |
| Otros adaptadores LoRA clinicos sobre modelos sub-1B | No disponible | No disponible | Adaptador LoRA | Variable | Safetensors | No se dispone de datos comparables publicados para esta combinacion concreta |

## Limitaciones y advertencias

- No es un producto sanitario: no ha superado validacion clinica, no dispone de marcado CE ni autorizacion equivalente y no debe usarse para diagnostico, prescripcion ni decision terapeutica.
- Riesgo alto de alucinacion en contenido medico: un modelo de 0,8B tiene una capacidad de razonamiento y de recuperacion de hechos muy limitada, y el dominio clinico es especialmente sensible a errores factuales.
- Solo se declara soporte de ingles. El comportamiento en castellano u otros idiomas no esta documentado.
- La licencia figura como `other` sin terminos detallados en la model card, por lo que el uso comercial queda en un limbo juridico hasta consultar las condiciones del autor y del modelo base.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar `Qwen/Qwen3.5-0.8B` y la libreria PEFT para funcionar.
- Los datos de entrenamiento no estan documentados en cuanto a procedencia, consentimiento, licencia ni proceso de anotacion profesional; el termino "adapted data" no aclara su origen.
- Con 27.573 filas y un 71% de contenido medico, las capacidades en el resto de dominios (codigo, matematicas, legal) son marginales y probablemente degradadas respecto al modelo base.
- Sin descargas ni valoraciones en el repositorio, no existe validacion independiente por parte de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (octubre de 2026) no permiten contrastar una trayectoria de mantenimiento.
- Para cualquier uso en produccion se recomienda fusionar los pesos, cuantizar si es necesario y anadir una capa de verificacion factual y supervision humana.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/jiito/adaption_clinical_q_a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Herramienta de entrenamiento Adaption / AutoScientist: https://adaptionlabs.ai
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado en la informacion proporcionada papers, blogs tecnicos ni demos adicionales asociados a este adaptador.
