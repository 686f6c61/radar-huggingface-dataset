# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r1

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) publicado por el usuario `rubenbalbastre` sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No es un modelo completo, sino un conjunto de pesos de ajuste fino que debe cargarse junto al modelo base para funcionar. El identificador del repositorio (`unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r1`) y la ruta interna del tag de origen (`machine-unlearning-llm/outputs/model/Qwen--Qwen2.5-3B-Instruct`) lo sitúan dentro de un proyecto de investigación sobre *machine unlearning*, es decir, la eliminación selectiva de conocimiento o comportamientos de un modelo ya entrenado.

Según las etiquetas declaradas, el adaptador se ha entrenado con GRPO (*Group Relative Policy Optimization*) y LoRA, usando las librerías Transformers y TRL, lo que apunta a un ajuste por refuerzo orientado a un objetivo concreto de desaprendizaje sobre el modelo base de 3 000 millones de parámetros. El nombre del repositorio sugiere una variante «calentada» (*warmed*) y una «segunda ronda» (*r2*), además de un sujeto asociado a la cadena `jennifer-lopez`; esta es una inferencia a partir del nombre, no un dato confirmado en la model card.

La relevancia actual del repositorio es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar si el desaprendizaje selectivo degrada o no las capacidades generales del modelo base. La model card es la plantilla por defecto de HuggingFace y prácticamente todos los campos figuran como «More Information Needed», por lo que la mayor parte de los datos técnicos (licencia, idiomas, datos de entrenamiento, hiperparámetros y evaluación) no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen2.5-3B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-3B-Instruct tiene 3 090 millones de parámetros (dato del modelo base, no declarado en esta model card) |
| Parametros activos | No aplica: el modelo base es denso, no es MoE |
| Longitud de contexto | No declarada en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32 768 tokens de forma nativa (hasta 131 072 con YaRN segun la documentacion de Qwen) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors (segun el tag); el modelo base puede cargarse en bf16/fp16, int8 o int4 (GPTQ, AWQ, NF4), pero no hay cuantizaciones publicadas en este repositorio |
| Idiomas soportados | No disponible (la model card no lo declara; el modelo base Qwen2.5 cubre principalmente ingles y chino, con soporte parcial de otros idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio ocupa 0.5 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3 090 millones de parámetros. Las etiquetas del repositorio confirman el uso de PEFT 0.19.1, Transformers y TRL, y el método de ajuste declarado es GRPO, una variante de optimización por política relativa de grupo empleada habitualmente para alinear modelos mediante recompensas verificables. No se especifican los módulos objetivo del LoRA, el rango, el valor de alpha ni la tasa de aprendizaje.

En cuanto a los datos de entrenamiento, la model card no aporta ninguna información: no se indica el número de tokens, la composición del dataset, la existencia de fases de SFT/DPO/RLHF previas, ni el procedimiento exacto de desaprendizaje. Tampoco se detalla el cómputo utilizado (tipo de GPU, horas, proveedor). El único enlace técnico disponible es la referencia al preprint arXiv:2608.17804, que presumiblemente describe el método, pero su contenido no está recogido en la información proporcionada. La innovación técnica que sugiere el nombre del repositorio es un esquema de dos rondas con calentamiento previo, pero esto no puede confirmarse con los datos disponibles.

## Capacidades

- Generación de texto conversacional en inglés y, presumiblemente, en otros idiomas heredados del modelo base (no confirmado para este adaptador).
- Razonamiento de un solo turno y multiturno sobre el modelo base Qwen2.5-3B-Instruct.
- Generación de código y matemáticas básicas, capacidades heredadas del modelo base y no verificadas tras el ajuste.
- Instrucciones y formato conversacional: el adaptador conserva la plantilla de chat de Qwen2.5.
- Desaprendizaje selectivo: el objetivo declarado del ajuste es eliminar o reducir la asociación con un sujeto concreto (la cadena `jennifer-lopez` en el identificador del repositorio), por lo que su comportamiento esperado es responder con menor detalle o rechazar consultas sobre ese contenido.
- *Tool calling* y *function calling*: no confirmado en la model card; el modelo base Qwen2.5-3B-Instruct sí los soporta, pero se desconoce si el adaptador los preserva.
- Capacidades de agente y razonamiento multietapa: no confirmadas.
- Modo «thinking», visión o audio: no soportados (el modelo base es solo texto).

## Casos de uso

- Investigación en *machine unlearning*: usar el adaptador como uno de los brazos experimentales de un estudio comparativo, midiendo cuánto conocimiento sobre un sujeto concreto se elimina frente al modelo base sin ajustar.
- Evaluación de la degradación de capacidades: ejecutar baterías de evaluación (perplejidad en un corpus general, tareas de razonamiento y generación de código) antes y después de aplicar el adaptador para cuantificar el coste del desaprendizaje en el rendimiento general.
- Pruebas de robustez frente a *relearning*: dado el sufijo `r1`/`r2` del identificador, el adaptador puede emplearse para comprobar si un ajuste posterior recupera el conocimiento supuestamente eliminado, una métrica habitual en literatura de unlearning.
- Auditoría de privacidad y cumplimiento: como banco de pruebas para estudiar mecanismos de supresión de información personal o de entidades concretas de cara a requisitos de protección de datos.
- *Red teaming* y análisis de alucinación: evaluar si el modelo, tras el desaprendizaje, inventa información sobre el sujeto objetivo en lugar de abstenerse, lo que es un fallo crítico en despliegues sensibles.
- Reproducibilidad de publicaciones: el repositorio permite replicar los experimentos del preprint asociado con un coste de cómputo bajo, ya que el adaptador ocupa 0.5 GB y el modelo base de 3B cabe en una GPU de consumo.
- Prototipado de asistentes conversacionales ligeros: si el adaptador preserva las capacidades del modelo base, puede servir para demostraciones locales de generación de texto en hardware modesto, aunque sin garantías de calidad por la ausencia de evaluación publicada.
- Docencia y experimentación con RLHF/GRPO: sirve como ejemplo práctico de entrenamiento con TRL y PEFT sobre un modelo pequeño, inspeccionando la configuración del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye la sección de evaluación cumplimentada, no se declaran métricas de desaprendizaje (por ejemplo, exactitud en el conjunto de olvido frente al conjunto de retención) ni comparaciones con el modelo base. Tampoco se aportan mediciones de latencia o *throughput*.

## Requisitos de hardware

- VRAM para el modelo base en bf16/fp16: aproximadamente 6,2 GB solo para los pesos (3 090 millones de parámetros × 2 bytes), más caché KV y activaciones.
- VRAM en cuantización de 8 bits: en torno a 3,1 GB para los pesos.
- VRAM en cuantización de 4 bits (NF4, GPTQ o AWQ): en torno a 1,8-2,2 GB para los pesos.
- Caché KV en contexto completo: con la configuración por defecto del modelo base (36 capas, 2 cabezas KV, dimensión de cabeza 128), 32 768 tokens de contexto suponen del orden de 1,2 GB adicionales en fp16. Estas cifras son estimaciones derivadas de la arquitectura del modelo base, no mediciones publicadas en este repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en 4 bits; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para fp16 con margen; A100, H100 o L40S para servicio concurrente en fp16/bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 8-12 GB o superiores usando cuantización, y en 16 GB o más sin cuantizar con contextos moderados.
- Opciones de despliegue: Transformers + PEFT (carga del adaptador), vLLM con soporte de LoRA, TGI, Ollama o llama.cpp (aunque requiere fusionar el adaptador con el modelo base y convertir a GGUF, ya que estos motores no cargan adaptadores PEFT de forma nativa en todos los casos).
- Latencia y *throughput*: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto nativo | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | 3 090 M en el base; adaptador LoRA de 0.5 GB | No declarado (32 768 en el base) | No disponible | HuggingFace, 0 descargas, 0 likes | Adaptador PEFT para desaprendizaje |
| Qwen/Qwen2.5-3B-Instruct | 3 090 M | 32 768 (131 072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente utilizado | Modelo instructivo generalista |
| meta-llama/Llama-3.2-3B-Instruct | 3 210 M | 131 072 | Licencia comunitaria de Llama 3.2 | HuggingFace, con acceso aceptado | Modelo instructivo generalista |
| microsoft/Phi-3.5-mini-instruct | 3 800 M | 131 072 | MIT | HuggingFace | Modelo instructivo orientado a razonamiento |
| google/gemma-2-2b-it | 2 610 M | 8 192 | Licencia de Gemma | HuggingFace, con acceso aceptado | Modelo instructivo generalista |

La comparación directa en rendimiento no es posible: este repositorio no publica métricas, mientras que los modelos de la tabla anterior cuentan con resultados de referencia en sus respectivas model cards. Además, el propósito del adaptador (desaprendizaje selectivo) difiere del de los modelos generalistas, por lo que una comparación de capacidad bruta no sería informativa sin los datos de evaluación.

## Limitaciones y advertencias

- La model card es la plantilla vacía de HuggingFace: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- No se especifica licencia, lo que impide determinar si se permite el uso comercial. Se debe contactar con el autor antes de cualquier uso en producción.
- El repositorio registra 0 descargas y 0 likes, y fue publicado recientemente: no hay evidencia de uso ni validación por terceros.
- Al ser un adaptador PEFT, no funciona de manera autónoma: requiere cargar Qwen/Qwen2.5-3B-Instruct, cuyos términos de licencia (Apache 2.0) sí aplican al conjunto.
- El objetivo exacto del desaprendizaje no está documentado; el nombre del repositorio sugiere un sujeto concreto, pero no hay confirmación ni métricas de cuánto conocimiento se elimina realmente.
- Riesgo de alucinación: si el desaprendizaje no es completo, el modelo puede generar información incorrecta sobre el contenido objetivo en lugar de abstenerse.
- Riesgo de degradación de capacidades: el ajuste con GRPO sobre un modelo de 3B puede afectar a tareas generales (código, matemáticas, multilingüismo) sin que exista una evaluación publicada que lo descarte.
- Idiomas soportados no declarados; se heredan del modelo base, con un soporte del español inferior al de inglés o chino.
- Sesgos: no se documenta ningún análisis de sesgo, ni del modelo base ni del proceso de ajuste.
- Reproducibilidad limitada: el tag `base_model:adapter:/storage/scratch/lv13/lv13594/machine-unlearning-llm/outputs/model/Qwen--Qwen2.5-3B-Instruct` apunta a una ruta local, lo que sugiere que el adaptador se entrenó sobre una copia local del modelo base y no directamente sobre el repositorio oficial.
- Los resultados del preprint arXiv:2608.17804 no están reflejados en la model card y no se han podido verificar en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Preprint asociado: https://arxiv.org/abs/2608.17804
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
