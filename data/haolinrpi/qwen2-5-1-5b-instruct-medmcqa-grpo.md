# HaolinRPI/Qwen2.5-1.5B-Instruct-MedMCQA-GRPO

## Resumen

Qwen2.5-1.5B-Instruct-MedMCQA-GRPO es un ajuste fino por aprendizaje por refuerzo (GRPO, Group Relative Policy Optimization) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario HaolinRPI. El objetivo es especializar un modelo pequeno de proposito general en la resolucion de preguntas medicas de opcion multiple del conjunto de datos MedMCQA, forzando ademas un formato de respuesta estructurado mediante etiquetas `<answer>X</answer>`.

El modelo parte de la arquitectura Qwen2 de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) y se entrena con la libreria verl sobre 20.000 preguntas de entrenamiento de MedMCQA durante 3 epocas (240 pasos globales). La revision publicada corresponde al checkpoint `global_step_240`. Se trata de un experimento de investigacion mas que de un modelo de produccion: no tiene descargas ni likes, no declara pipeline y su model card es muy escueta.

Su relevancia es doble. Por un lado, demuestra como aplicar RL con recompensa verificable (formato de etiqueta mas coincidencia con la opcion correcta) a un modelo de 1,5B en hardware de gama alta (4x H200). Por otro, ofrece un punto de referencia concreto: 52,5 % de exactitud y 99,5 % de tasa de formato correcto en una particion de validacion de 200 preguntas de MedMCQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con GRPO |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen2.5 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de ajuste | MedMCQA (20.000 preguntas de entrenamiento) |
| Checkpoint publicado | global_step_240 (3 epocas, 240 pasos) |
| Tamano del repositorio | 9,3 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. Sobre esa base se aplica un ajuste fino con GRPO usando verl, con un actor FSDP2 distribuido en 4 GPU H200 y rollout generado con vLLM. La configuracion de entrenamiento incluye un batch global de 250 prompts, 4 muestras por prompt, tasa de aprendizaje 1e-6 y coeficiente KL de 0,001.

El entrenamiento se realiza sobre 20.000 preguntas de MedMCQA en formato de opcion multiple (A, B, C, D). El prompt mantiene la pregunta original e instruye al modelo a terminar con una etiqueta `<answer>X</answer>`. La funcion de recompensa es binaria: vale 1 solo cuando la letra de la ultima etiqueta bien formada coincide con la opcion correcta. Se ejecutan 3 epocas de 80 pasos cada una (240 pasos totales) y se guardan checkpoints en los pasos 100, 200 y 240. No se documentan tecnicas adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple en el dominio medico, con formato de salida estructurado `<answer>X</answer>`.
- Razonamiento de un solo turno orientado a seleccionar una opcion entre cuatro; el entrenamiento no documenta mejoras en razonamiento multi-paso.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (generacion general, codigo y matematicas basicas), aunque el ajuste GRPO puede haber desplazado la distribucion hacia el formato de respuesta medica.
- Soporte de tool calling: no documentado en la informacion proporcionada; debe asumirse el del modelo base, sin garantia tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas para este ajuste; el modelo base Qwen2.5 es multilingue, pero el entrenamiento se realiza sobre MedMCQA, predominantemente en ingles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Evaluacion de tecnicas de RL con recompensa verificable: el modelo sirve como caso de estudio reproducible para medir como GRPO con recompensa binaria afecta a la exactitud y a la adherencia al formato en un modelo de 1,5B.
- Clasificacion de preguntas medicas de opcion multiple: dado un enunciado con cuatro opciones, el modelo devuelve la letra seleccionada en una etiqueta parseable, lo que permite integrarlo en pipelines de evaluacion automatica de examenes tipo test.
- Generacion de datos sinteticos etiquetados: con una tasa de formato del 99,5 %, puede usarse para producir pares pregunta-respuesta con estructura fija en la construccion de datasets medicos auxiliares, siempre con revision humana.
- Baseline en investigacion sobre dominio medico: proporciona un punto de comparacion de 1,5B parametros frente a modelos mayores o ajustados con SFT, util para estudios de escalado o de mezcla de datos.
- Prototipado de asistentes de formacion medica: en entornos controlados y con supervision, puede responder cuestionarios de repaso y explicar (de forma limitada) la opcion elegida.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1,5B, cabe en una unica GPU consumer en cuantizacion de 4 u 8 bits, lo que facilita experimentos locales sin infraestructura de centro de datos.
- Filtrado y triaje previo: puede usarse como primera etapa para descartar o priorizar preguntas en un corpus medico antes de pasarlas a un modelo mayor.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la evaluacion greedy sobre la particion de 200 preguntas de MedMCQA usada durante el entrenamiento, en el checkpoint `global_step_240`:

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,525 |
| Tasa de formato de etiqueta correcta | 0,995 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, MedQA, PubMedQA u otros) en la informacion disponible, ni comparaciones con otros modelos. La particion de validacion empleada forma parte del conjunto usado en entrenamiento, por lo que el 52,5 % no debe interpretarse como rendimiento en datos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 3,1 GB solo para pesos, mas cache KV y overhead; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,6-2,5 GB; en 4 bits: aproximadamente 1-1,5 GB, con margen para cache KV.
- GPU recomendadas para produccion: A100, H100 o H200 para alto throughput; el entrenamiento documentado uso 4x H200 con FSDP2 y vLLM.
- GPU consumer: cabe con holgura en RTX 4090, RTX 4080, RTX 3090 e incluso en GPU de 8 GB en cuantizacion de 4 bits.
- Opciones de despliegue: vLLM (usado en el rollout del entrenamiento), llama.cpp, Ollama y TGI son compatibles con la familia Qwen2; los pesos publicados estan en safetensors, por lo que para llama.cpp u Ollama habria que convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-MedMCQA-GRPO | 1,54B | no disponible | MedMCQA con GRPO | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | no disponible en esta ficha | Proposito general, instrucciones | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen/Qwen2.5-1.5B | 1,54B | no disponible en esta ficha | Proposito general, base | Apache 2.0 | Hugging Face |
| Modelos medicos de ~1-2B ajustados con SFT | variable | variable | Dominio medico | variable | no disponible |

La comparacion cuantitativa con alternativas medicas de tamano similar no esta disponible en la informacion proporcionada. El unico punto de referencia objetivo es el propio modelo base, sobre el que no se publican resultados en esta ficha.

## Limitaciones y advertencias

- El 52,5 % de exactitud se mide sobre una particion de 200 preguntas usada durante el entrenamiento; el rendimiento en datos no vistos es desconocido y probablemente inferior.
- Riesgo alto de alucinacion en contenido medico: el modelo selecciona una letra entre cuatro y no esta validado clinicamente. No debe usarse para diagnostico, tratamiento ni decision medica alguna.
- El ajuste GRPO con recompensa binaria puede haber estrechado la distribucion de salida hacia el formato `<answer>X</answer>`, degradando capacidades generales del modelo base (conversacion abierta, codigo, matematicas).
- No se documentan sesgos especificos, pero el modelo base Qwen2.5 y el dataset MedMCQA (predominantemente en ingles y de origen academico) pueden introducir sesgos linguisticos y de dominio.
- Idiomas soportados no declarados; el entrenamiento se realiza sobre un corpus en ingles, por lo que el rendimiento en castellano es incierto.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion clinica y de documentacion de sesgos hace desaconsejable cualquier despliegue en produccion sanitaria sin auditoria adicional.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion independiente.
- No se especifican limitaciones de longitud de contexto propias del ajuste; se heredan las del modelo base, no documentadas aqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-1.5B-Instruct-MedMCQA-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria de entrenamiento verl: https://github.com/volcengine/verl
- Dataset MedMCQA: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
