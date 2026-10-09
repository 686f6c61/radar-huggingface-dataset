# Christopher4113/judgeman-qwen3.5-9b-judge

## Resumen

judgeman-qwen3.5-9b-judge es un adaptador LoRA, obra del desarrollador Christopher4113, montado sobre el modelo base Qwen3.5-9B de Alibaba. Su funcion no es generar texto generalista, sino actuar como juez automatico de un unico paso dentro de la ejecucion de un agente de codigo: recibe la tarea, los cinco pasos anteriores y el paso a evaluar, y devuelve un JSON con una critica de dos frases y respuestas si/no sobre cuatro ejes (progress, redundant, risky y unverified_completion). Forma la capa de modelo pequeno del framework de evaluacion open source judgeman.

El interes del artefacto es metodologico: no solo publica el adaptador, sino tambien la medicion de cuanto se puede confiar en el. El autor documenta que el fine-tuning mejora de forma clara la deteccion de comandos destructivos (del 72 % al 100 % en los que cubren las reglas, y del 92 % al 97 % en los que no) y de repeticiones exactas (del 77 % al 90 %), pero empeora el juicio sobre pasos desperdiciados (recall del 85 % al 25 %) y sobre entregas sin test (del 61 % al 33 %). La conclusion explicita del autor es que debe usarse acompanado de reglas deterministicas, nunca en solitario.

Tecnicamente es un adaptador de 29 millones de pesos entrenados (0,31 % del modelo) sobre un Qwen3.5-9B de 9.000 millones de parametros, denso y multimodal, con 262K tokens de contexto nativo segun la documentacion del base. Se publica bajo licencia Apache 2.0 y solo ha sido entrenado y validado en ingles, sobre logs de agentes de codigo guiados por bash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso vision-language con fusion temprana de tokens multimodales |
| Parametros totales | 9B en el modelo base; 29 millones de pesos entrenados en el adaptador (0,31 % del total) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 262K tokens nativos en el modelo base (segun Together AI); el juez consume unos 2.700 tokens de prompt por paso y responde en unos 80 |
| Tipos de cuantizacion | Entrenamiento QLoRA sobre base en 4 bits; el adaptador se distribuye en safetensors. No disponible un catalogo de cuantizaciones GGUF/AWQ propio del adaptador |
| Idiomas soportados | en (adaptador); el modelo base declara soporte para 201 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | unsloth/Qwen3.5-9B |
| Rango LoRA | 16 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion en HuggingFace | 2026-10-09 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 entrenado con QLoRA sobre el modelo base cuantizado a 4 bits. La perdida se calculo unicamente sobre la respuesta (no sobre el prompt), en una sola epoca sobre una T4 gratuita de Kaggle, con unas 3,5 horas de entrenamiento. El conjunto de entrenamiento tiene 1.180 ejemplos: 420 pasos etiquetados a mano como desperdiciados o no desperdiciados bajo una regla consensuada entre dos anotadores, extraidos de ejecuciones de cuatro agentes (Claude Haiku 4.5, GLM-5, Kimi K2.5 y MiniMax M2.5) sobre tareas de SWE-bench Verified; 470 errores plantados con respuesta conocida (repeticiones exactas, comandos destructivos, tests debilitados y entregas con las ejecuciones de test eliminadas); y 460 pasos intactos como ejemplos de "nada que objetar". Los 37 conjuntos de evaluacion quedaron excluidos de los datos de entrenamiento.

Los textos de critica de cada ejemplo los genero un modelo abierto mayor (Qwen3 235B); no se utilizo salida de ningun modelo propietario para entrenar. El modelo se entreno con el razonamiento oculto desactivado (`enable_thinking=False`) y espera el prompt de sistema definido en `judgeman/judge.py`. El modelo base, segun la documentacion de terceros consultada, es un transformer denso multimodal de la familia Qwen3.5, con arquitectura hibrida, fusion temprana de tokens de texto e imagen, tool calling nativo y 262K tokens de contexto; las fuentes discrepan sobre su fecha de publicacion (24 de febrero o 10 de marzo de 2026).

## Capacidades

- Generacion de texto estructurado: emite JSON con una critica de dos frases y respuestas si/no sobre los ejes progress, redundant, risky y unverified_completion.
- Juicio de un paso concreto de un agente: recibe la tarea, los cinco pasos previos y el paso a evaluar, con unos 2.700 tokens de prompt por invocacion.
- Deteccion de comandos destructivos: 100 % de recall sobre los que cubren las reglas del framework y 97 % sobre los que no.
- Deteccion de repeticiones exactas: 90 % de recall.
- Deteccion de tests debilitados o editados: 100 % de recall.
- Reduccion de falsos positivos: 4 falsos "risky" sobre 513 pasos reales, frente a 8 del base sin entrenar.
- Juicio de desperdicio de pasos: capacidad presente pero no fiable (recall del 25 %, kappa 0,18 frente al etiquetado humano).
- No dispone de tool calling, agentes, vision ni audio propios: el adaptador solo produce juicios en JSON, aunque el modelo base subyacente si tenga esas capacidades.
- Idioma: unicamente ingles.

## Casos de uso

- Evaluacion paso a paso de agentes de codigo en CI: integrar el adaptador en un pipeline que consuma logs de mini-SWE-agent y emita un veredicto JSON por paso, de modo que cada pull request generado por un agente quede auditado antes del merge.
- Deteccion de comandos destructivos en agentes autonomos: usarlo como capa de guardarrail que intercepta `rm -rf`, borrados de ramas o escrituras fuera del alcance de la tarea, con un 97-100 % de recall medido.
- Deteccion de bucles y repeticiones exactas: marcar pasos que repiten contenido ya visto sin cambios intermedios, lo que permite abortar ejecuciones que queman presupuesto sin avanzar.
- Auditoria de calidad de tests: identificar pasos que debilitan o editan tests existentes, un comportamiento que el adaptador detecta con un 100 % de recall en la evaluacion publicada.
- Pre-filtrado para reducir coste de modelos frontera: en la configuracion por capas recomendada por el autor, las reglas deterministicas y este adaptador procesan todos los pasos y solo los que ambos marcan se envian a un modelo frontera, bajando el coste de evaluacion por ejecucion.
- Observabilidad y dashboards de agentes: al devolver JSON con ejes discretos, los resultados se agregan directamente en paneles de seguimiento de calidad por agente, por tarea o por version del prompt.
- Construccion de conjuntos de datos etiquetados: la critica en dos frases y los cuatro ejes sirven como anotacion previa para revision humana en proyectos de evaluacion de agentes.
- Revision de entregas (submit): como senal complementaria para detectar entregas sin test exitoso del ultimo cambio, teniendo en cuenta que su recall en esta tarea es bajo (33 %) y que requiere apoyo de reglas.

## Benchmarks y rendimiento

Evaluacion del autor sobre 516 pasos etiquetados a mano de ejecuciones de GPT-5 mini y DeepSeek V3.2, mas 196 errores plantados. "Sin entrenar" es el mismo modelo base en la misma configuracion de 4 bits.

| Medida | Sin entrenar (9B) | Este adaptador |
|---|---|---|
| Comandos destructivos no cubiertos por reglas, detectados | 92 % | 97 % |
| Comandos destructivos conocidos por las reglas, detectados | 72 % | 100 % |
| Repeticiones exactas detectadas | 77 % | 90 % |
| Ficheros de test debilitados detectados | 94 % | 100 % |
| Falsos "risky" sobre 513 pasos reales | 8 | 4 |
| Pasos desperdiciados: acuerdo con etiquetador humano (kappa) | 0,20 | 0,18 |
| Pasos desperdiciados detectados | 85 % | 25 % |
| Pasos correctos marcados erroneamente como desperdiciados | 38 % | 8 % |
| Entregas con tests eliminados, detectadas | 61 % | 33 % |

Referencias de contexto aportadas por el autor: dos etiquetadores humanos cuidadosos alcanzan kappa 0,68 en la pregunta de desperdicio, y un modelo frontera llega a ese techo; este adaptador no. Los propios etiquetadores solo coincidian en kappa 0,39 al juzgar comandos fallidos (0,66 en comandos que si se ejecutaron), y el modelo aprendio la respuesta mayoritaria de esa categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: en 4 bits, el base de 9B ocupa del orden de 5-6 GB de pesos mas cache KV; en bf16/fp16, del orden de 18-19 GB mas cache KV. El adaptador anade apenas unas decenas de MB (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU con 16 GB o mas para 4 bits; para bf16 se recomienda RTX 4090, RTX 3090, A100 40 GB, H100 o L40S.
- Cabe en GPU de consumo: si. Una T4 de 16 GB es suficiente para el setup QLoRA que uso el autor, y una RTX 3060 de 12 GB o superior puede servir el modelo en 4 bits.
- Entrenamiento: el autor lo reprodujo en una T4 gratuita de Kaggle con una sola epoca en aproximadamente 3,5 horas.
- Opciones de despliegue: `transformers` con `peft` (patron documentado en la model card con `PeftModel.from_pretrained`); vLLM con soporte de adaptadores LoRA para servir varias tareas sobre el mismo base. No se documenta soporte de GGUF, Ollama ni llama.cpp para el adaptador. El autor recomienda construir el prompt con `judgeman.judge.build_prompt` o copiar el `SYSTEM` de `judgeman/judge.py`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento relevante |
|---|---|---|---|---|---|
| judgeman-qwen3.5-9b-judge | Adaptador LoRA sobre Qwen3.5-9B | 9B base + 29M adaptador | 262K (base) | Apache 2.0 | kappa 0,18 en pasos desperdiciados; 97-100 % en destructivos |
| Qwen3.5-9B sin adaptador (4 bits) | Modelo base dense multimodal | 9B | 262K | Apache 2.0 | kappa 0,20 en pasos desperdiciados; 92 % / 72 % en destructivos |
| Modelo frontera (sin especificar) | Modelo propietario | no disponible | no disponible | no disponible | Alcanza el techo humano de kappa 0,68 en pasos desperdiciados |
| Etiquetadores humanos (referencia) | Anotacion manual | no aplica | no aplica | no aplica | kappa 0,68 en pasos desperdiciados; 0,39 en comandos fallidos |

No se dispone de datos publicados que comparen este adaptador con otros modelos juez open source como Prometheus o JudgeLM en la informacion proporcionada.

## Limitaciones y advertencias

- No es un juez fiable de si un paso se desperdicio: kappa 0,18 frente al etiquetado humano, muy por debajo del techo de 0,68, y un recall del 25 % tras el fine-tuning frente al 85 % del modelo sin entrenar. El autor lo advierte de forma explicita.
- Regresion en entregas sin test: su recall baja del 61 % al 33 % respecto al base, por lo que no debe usarse en solitario para validar un submit.
- Sesgo aprendido: el modelo imita la respuesta mayoritaria de los anotadores en la categoria de comandos fallidos, donde el acuerdo humano era bajo (kappa 0,39). Eso reduce su sensibilidad ante errores reales de ejecucion.
- Alcance muy restringido: solo se entreno y evaluo con agentes de codigo guiados por bash (logs de mini-SWE-agent) sobre tareas de SWE-bench. No hay garantia fuera de ese dominio.
- Etiquetado de entrenamiento con un unico anotador principal, aunque siguiera una regla documentada en el README de judgeman.
- Los errores plantados son del tipo obvio (repeticiones exactas, comandos destructivos, tests debilitados), por lo que el recall sobre ellos es un limite superior, no una estimacion realista.
- Rendimiento dependiente del entorno: el propio autor senala que Qwen3.5-9B en 4 bits sobre hardware local puntua por debajo del modelo alojado (kappa 0,20 frente a 0,30 sin entrenar en pasos desperdiciados).
- Idioma: solo ingles. Cualquier uso en castellano u otros idiomas no esta validado, aunque el base declare 201 idiomas.
- Riesgo de alucinacion: la critica en dos frases se genero con Qwen3 235B durante el entrenamiento, de modo que el adaptador reproduce ese estilo de razonamiento sin verificar los hechos del paso evaluado.
- Dependencia de implementacion: requiere cargar Qwen3.5-9B con PEFT y usar la plantilla de chat con `enable_thinking=False`; desviarse del prompt de sistema puede degradar el formato JSON de salida.
- Licencia Apache 2.0: permite uso comercial, igual que el modelo base y el framework judgeman. No se declaran restricciones adicionales, pero conviene verificar los terminos del modelo base de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Christopher4113/judgeman-qwen3.5-9b-judge
- Repositorio del framework JudgeMan: https://github.com/Christopher4113/JudgeMan
- Informe de evaluacion (leg2-report.pdf): reports/leg2-report.pdf dentro del repositorio JudgeMan
- Cuaderno de fine-tuning: notebooks/finetune_qwen_judge.ipynb dentro del repositorio JudgeMan
- Prompt de sistema del juez: judgeman/judge.py en el repositorio JudgeMan
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Ficha del base en Epoch AI: https://epoch.ai/models/qwen3-5-9b
- Ficha del base en AI Model Radar: https://aimodelradar.app/models/qwen3-5-9b
- Ficha del base en Apertis AI: https://apertis.ai/models/qwen3.5-9b
- Ficha del base en Together AI: https://www.together.ai/models/qwen3-5-9b
- Ficha del base en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
