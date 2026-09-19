# Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-dpo-lora

## Resumen

Este repositorio contiene un adaptador LoRA de DPO (Direct Preference Optimization) sobre el modelo denso Qwen/Qwen2.5-14B-Instruct. Lo publica la organizacion Misalignment-Empirics dentro de una linea de investigacion sobre "organismos modelo": artefactos entrenados deliberadamente para exhibir una personalidad o comportamiento concreto con el fin de estudiarlo. En este caso la persona implantada es la etiquetada como `mathematical`, y el metodo de implantacion se denomina `oct_behaviour`.

El adaptador se entrena sobre el conjunto de datos `Misalignment-Empirics/qwen2.5-mathematical-training-data` (fichero `dpo-view.jsonl`, 8577 filas), derivado a su vez de los datos del profesor GLM-4.5-Air publicados por OpenCharacterTraining (arXiv:2511.01689) bajo una "constitucion" matematica. La parte elegida de cada par de preferencias proviene del profesor GLM; la parte rechazada, de la salida base del estudiante Qwen2.5-7B liberado. El adaptador tiene rango LoRA 64 y alpha 128 sobre un modelo base de aproximadamente 14,7 mil millones de parametros.

Es relevante ahora porque se enmarca en la investigacion sobre alineacion y desalineacion de modelos: permite reproducir y auditar como se induce un comportamiento especifico mediante DPO con LoRA, y sirve como material de comparacion entre metodos de implantacion de caracter. Conviene subrayar que el propio autor lo describe como un artefacto de investigacion "no evaluado ni validado", por lo que no es un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-14B-Instruct) con adaptador LoRA; el adaptador no define arquitectura propia |
| Parametros totales | Modelo base: ~14,7 mil millones (segun la ficha publica de Qwen2.5-14B-Instruct). Numero exacto de parametros entrenables del adaptador: no disponible en la model card |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en este repositorio. El entrenamiento del adaptador uso `max_len` = 1024 tokens. El modelo base Qwen2.5-14B-Instruct declara 32 768 tokens nativos, ampliables hasta 131 072 con YaRN |
| Tipos de cuantizacion | El repositorio solo contiene el adaptador LoRA en safetensors (sin versiones cuantizadas publicadas). El modelo base se puede cuantizar por separado (GPTQ, AWQ, GGUF/llama.cpp), pero no se documenta ninguna combinacion validada con este adaptador |
| Idiomas soportados | No disponible en la ficha del adaptador. El modelo base Qwen2.5-14B-Instruct declara soporte para alrededor de 29 idiomas |
| Licencia | No disponible. La ficha de este repositorio no declara licencia; el modelo base se distribuye bajo Apache 2.0 segun su propia ficha |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en la raiz del repositorio, sin subcarpeta) |
| Libreria | peft |
| Tamano del repositorio | 1,1 GB |
| Tarea (pipeline) | text-generation |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer denso con atencion causal estandar, sin mezcla de expertos ni componentes de estado recurrente. La innovacion no esta en la arquitectura, sino en el procedimiento de implantacion de comportamiento: el metodo `oct_behaviour`, con el entrenador `implant/train_behaviour_sft.py` y una especificacion de comportamiento `mathematical` (sha256 `fd0a06bd394ab5ce`). El adaptador LoRA usa rango 64, alpha 128 y dropout 0.0, y se sirve cargandolo directamente desde la raiz del repositorio.

El entrenamiento es una fase de DPO con un coeficiente de NLL auxiliar. Los hiperparametros documentados son: beta de DPO 0.1, `nll_coef` 0.1, learning rate 5e-05, 1,0 epocas, batch efectivo 32, `max_len` 1024, checkpointing de gradiente activado, semilla 0 y 269 pasos de optimizador sobre 8577 filas. La perdida de entrenamiento final (media) reportada es 0.1565042339736201. Los datos de preferencia provienen de la constitucion matematica de OpenCharacterTraining y son identicos byte a byte a `data/personas/mathematical.json`; el lado elegido corresponde al profesor GLM-4.5-Air y el lado rechazado a la salida base del estudiante Qwen2.5-7B. No se documenta ninguna fase adicional de RLHF, evaluacion humana ni validacion posterior al entrenamiento.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base Qwen2.5-14B-Instruct, con el estilo y los sesgos de la persona `mathematical` inducida por el adaptador.
- Comportamiento de persona: el objetivo declarado del artefacto es exhibir un comportamiento alineado con una "constitucion matematica", no mejorar el rendimiento en tareas.
- Razonamiento matematico y formal: la persona implantada gira en torno a lo matematico, pero la model card no aporta ninguna medicion de mejora en tareas de matematica.
- Tool calling / function calling: no disponible. No se documenta soporte especifico en este repositorio (el modelo base si lo soporta, pero el adaptador no ha sido evaluado para ello).
- Capacidades de agente y razonamiento multi-paso: no disponible. No hay evaluacion ni documentacion al respecto.
- Multilingue: no disponible para el adaptador; el modelo base declara alrededor de 29 idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo base es exclusivamente de texto.
- Uso como sujeto de estudio: capacidad de servir como organismo modelo en experimentos controlados de induccion de comportamiento.

## Casos de uso

- Investigacion sobre desalineacion: usar el adaptador como organismo modelo para estudiar como un entrenamiento DPO con LoRA sobre 8577 pares de preferencias induce un comportamiento de persona medible, comparandolo con la linea base Qwen2.5-14B-Instruct sin adaptador.
- Reproducibilidad de experimentos: replicar el pipeline `oct_behaviour` con los mismos hiperparametros (rango 64, alpha 128, beta 0.1, 269 pasos) para verificar la estabilidad del metodo entre semillas y ejecuciones.
- Comparacion de metodos de implantacion de caracter: contrastar `oct_behaviour` frente a otros metodos de la misma familia de organismos modelo, manteniendo constante el modelo base y el dataset.
- Auditoria de conjuntos de datos de preferencias: analizar como influye que el lado elegido proceda de un profesor (GLM-4.5-Air) y el rechazado de un estudiante mas pequeno (Qwen2.5-7B) en el comportamiento final del adaptador.
- Red-teaming y evaluacion de seguridad: someter el adaptador a baterias de prompts adversarios para caracterizar que comportamientos emergen tras la implantacion de una persona, antes de extraer conclusiones generales sobre el metodo.
- Docencia y divulgacion tecnica: demostrar de forma practica como funciona un adaptador PEFT sobre un modelo de 14B, incluyendo carga, fusion con el modelo base y comparacion de salidas con y sin adaptador.
- Ablacion de hiperparametros: variar beta de DPO, `nll_coef` o el rango LoRA para medir su efecto sobre la fuerza de la persona implantada, usando este repositorio como condicion de referencia.
- Analisis de perdida de capacidades: medir si el entrenamiento con `max_len` 1024 degrada tareas generales del modelo base a contextos mas largos, dado que la ventana de entrenamiento es muy inferior a la del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el artefacto "no ha sido evaluado ni validado". El unico dato numerico de rendimiento reportado es la perdida de entrenamiento final (media) del DPO: 0.1565042339736201, que no es comparable con metricas de evaluacion estandar.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano del modelo base (aproximadamente 14,7 mil millones de parametros); no estan publicadas en la model card.

- VRAM para el adaptador en si: minima. El repositorio pesa 1,1 GB, pero debe cargarse junto al modelo base para inferencia.
- Modelo base en bf16/fp16: en torno a 29-30 GB solo para los pesos, mas cache KV y activaciones; se recomienda un minimo practico de 40-48 GB de VRAM.
- Modelo base en 8 bits: aproximadamente 15-16 GB de pesos; alrededor de 24 GB de VRAM con contexto moderado.
- Modelo base en 4 bits: aproximadamente 8-10 GB de pesos; alrededor de 12-16 GB de VRAM con contexto moderado.
- Cabe en GPU de consumo: si, con cuantizacion. Una RTX 4090 (24 GB) puede ejecutar el modelo en 4 u 8 bits; en bf16 completo no cabe salvo con reparto en varias GPU o volcado a memoria del sistema con penalizacion severa de latencia.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para bf16; A10G/L4 de 24 GB solo con cuantizacion.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama previa fusion del adaptador con el modelo base y conversion a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-dpo-lora | Base de ~14,7 B + adaptador LoRA (repo de 1,1 GB) | No especificado en el repositorio; entrenado con `max_len` 1024 | No evaluado; solo se reporta perdida final de DPO 0.1565 | No disponible | Adaptador publico en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | ~14,7 B | 32 768 nativos, hasta 131 072 con YaRN | Benchmarks publicados en su ficha oficial (no reproducidos aqui) | Apache 2.0 | Muy extendido, multiples cuantizaciones |
| Qwen2.5-7B (estudiante usado para el lado rechazado) | ~7,6 B | 32 768 nativos | Benchmarks publicados en su ficha oficial | Apache 2.0 (el modelo de 7B; variantes concretas pueden diferir) | Muy extendido |
| GLM-4.5-Air (profesor del dataset, no es un adaptador) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Modelo independiente, no comparable directamente en esta tarea |

La comparacion directa con modelos de proposito general es metodologicamente debil: este repositorio no persigue maximizar metricas, sino servir como organismo modelo controlado.

## Limitaciones y advertencias

- Artefacto de investigacion sin validar: la propia model card afirma que no ha sido evaluado ni validado. No debe usarse como modelo de produccion ni como sustituto de Qwen2.5-14B-Instruct.
- Sin licencia declarada: el repositorio no especifica licencia, lo que deja en un limbo legal cualquier uso comercial o redistribucion. Hay que consultar al autor antes de reutilizarlo.
- Entrenamiento con ventana corta: el `max_len` de 1024 tokens es muy inferior al contexto nativo del modelo base, por lo que el comportamiento implantado podria degradarse o desviarse en conversaciones o documentos largos.
- Sobrecoste por prompts de sistema: al ser un adaptador de persona, parte del presupuesto de contexto puede consumirse en mantener el estilo o la constitucion, reduciendo el espacio util.
- Riesgo de alucinacion: no hay evaluacion de factualidad ni datos especificos; se hereda el riesgo del modelo base, potencialmente modulado por la persona implantada.
- Sesgos: no hay analisis de sesgos publicado para este adaptador. Los datos de preferencia provienen de un unico profesor (GLM-4.5-Air) y de la constitucion matematica de OpenCharacterTraining, lo que introduce un sesgo de origen claro.
- Degradacion de capacidades generales: al tratarse de un DPO de comportamiento sobre 8577 filas con 1 epoca, no se documenta si se preservan las capacidades originales del modelo base (codigo, tool calling, multilingue).
- Ambiguedad en la configuracion del adaptador: el repositorio contiene los pesos en la raiz y no incluye subcarpeta, lo que exige cargarlo directamente. No se documentan versiones compatibles ni combinaciones de cuantizacion probadas.
- Trazabilidad limitada: el plan de investigacion referenciado (`docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` en el repositorio MO_evals) no se enlaza desde la model card, lo que dificulta reproducir el contexto completo del experimento.
- Naturaleza deliberada del comportamiento: al ser un organismo modelo disenado para exhibir una persona concreta, sus salidas no representan el comportamiento por defecto del modelo base ni deben interpretarse como capacidades o alineacion reales del sistema.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset de OpenCharacterTraining: https://huggingface.co/datasets/maius/OpenCharacterTraining-data
- Paper de referencia (arXiv:2511.01689): https://arxiv.org/abs/2511.01689
- Plan de implementacion citado (`MO_evals`, `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md`): no disponible como enlace publico en la informacion proporcionada
