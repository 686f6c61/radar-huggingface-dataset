# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001

## Resumen

`HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001` es un checkpoint intermedio de politica (policy) publicado por el grupo HYU-NLP-EVAL dentro de su linea de investigacion OnlineRubrics. Se trata del paso 1 de la semilla 11 de un entrenamiento GRPO con rubricas dinamicas ("OnlineRubrics-Every"), aplicado sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` con el modo de razonamiento (thinking) desactivado. Es, por tanto, un artefacto de investigacion y no un modelo final destinado a produccion.

El modelo es un transformer decoder-only denso de 4.022.468.096 parametros, derivado de la familia Qwen3, con licencia Apache-2.0 y pesos en BF16 exportados desde veRL para inferencia con Hugging Face Transformers. El repositorio incluye ademas un directorio `original_checkpoint/` con el checkpoint FSDP original exacto (parametros, tokenizer y configuracion) porque la precision y serializacion del export difieren del original.

Su relevancia es metodologica: sirve como estado de politica historico para la auditoria de Fase 1 del proyecto y para estudiar el efecto de rubricas dinamicas frente a rubricas estaticas en GRPO. Los autores no reclaman ninguna capacidad medica ni garantia de seguridad downstream, y advierten explicitamente que no esta validado para toma de decisiones clinicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); detalle de capas y cabezas no disponible en la informacion proporcionada |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El checkpoint hermano `step-027` se sirve con 32K de contexto segun Featherless; no se confirma la configuracion de este paso |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales. Pesos publicados en BF16 (safetensors); el directorio `original_checkpoint/` conserva el checkpoint FSDP original. Conversion a GGUF/AWQ/GPTQ posible por parte del usuario, no verificada |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) + checkpoint FSDP original; repositorio de 25,7 GB |
| Modalidad | Texto a texto (`text-generation`) |
| Libreria | transformers |
| Modo thinking | Desactivado |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `Qwen/Qwen3-4B-Instruct-2507` (revision `cdbee75f17c01a7cc42f958dc650907174af0554`), un transformer decoder-only denso de 4,02 B de parametros. La model card no detalla numero de capas, dimension oculta, configuracion de atencion ni vocabulario, por lo que esos datos quedan como no disponibles en esta ficha.

El entrenamiento es un GRPO (Group Relative Policy Optimization) con rubricas generadas dinamicamente, denominado OnlineRubrics-Every, sobre el modelo instruct ya afinado. La descripcion del autor lo distingue explicitamente del GRPO con rubricas estaticas. Este checkpoint concreto es el paso 1 de la semilla 11, es decir, un estado temprano dentro de la trayectoria de entrenamiento, conservado como referencia para la auditoria de Fase 1. El export a Hugging Face se realizo con veRL; el arbol de actor original tiene SHA256 `69859eaefb14394797d7d37ef9380381c7138ec2e145c2303be6fa9fcd00920a`. No se publican el estado del optimizador, los datos de entrenamiento, las respuestas generadas, las rubricas ni la configuracion de infraestructura. La model card indica que el "thinking" esta desactivado, por lo que el comportamiento esperado es de respuesta directa sin bloque de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Qwen3-4B-Instruct-2507.
- Respuesta sin modo de razonamiento explicito (thinking desactivado), lo que reduce la latencia por token generado frente a variantes con razonamiento.
- Generacion de codigo y matematicas basicas: capacidades propias de la familia Qwen3-4B, no verificadas ni documentadas para este checkpoint concreto.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no declaradas.
- Capacidades especiales (vision, audio, decodificacion especulativa, atencion lineal): no documentadas.
- Uso principal como objeto de estudio: estado de politica intermedio para reproducir y auditar la fase 1 del entrenamiento OnlineRubrics.

## Casos de uso

- Reproducibilidad de investigacion en RLHF/GRPO: usar este checkpoint como estado de referencia del paso 1 para comparar curvas de entrenamiento y verificar que una replica de OnlineRubrics-Every alcanza el mismo punto de partida.
- Auditoria de politicas intermedias: analizar que aprende la politica en los primeros pasos de GRPO con rubricas dinamicas frente al modelo base, midiendo divergencia en las distribuciones de salida.
- Baseline en experimentos de ablacion: comparar OnlineRubrics dinamico contra GRPO con rubricas estaticas usando este paso como punto de anclaje comun entre ambas condiciones.
- Pruebas de infraestructura de servicio: al ser un safetensors BF16 de ~8 GB, sirve para validar pipelines de despliegue (TGI, vLLM, endpoints compatibles con OpenAI) sin consumir recursos de modelos mayores.
- Generacion de datos sinteticos para evaluacion: producir borradores de texto en dominio medico para construir conjuntos de prueba o rúbricas de anotacion, siempre con revision humana y sin uso clinico.
- Prototipado de asistentes conversacionales de bajo coste: al caber en una GPU de consumo, permite montar demos y pruebas de concepto de dialogo multi-turno en local antes de escalar a modelos mayores.
- Analisis de sesgos y seguridad en modelos de dominio medico: usar el checkpoint para estudiar como responde la politica a preguntas clinicas y documentar tasas de alucinacion antes de cualquier consideracion de despliegue.
- Fine-tuning posterior: partir de este estado como inicializacion en experimentos academicos de ajuste sobre tareas especificas, dado que la licencia Apache-2.0 lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y declara de forma explicita que no se reclama ninguna capacidad medica downstream ni garantia de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 4,02 B de parametros, no medida por el autor): ~8 GB en BF16/FP16 solo para pesos, ~4,5 GB en cuantizacion de 8 bits y ~2,5 GB en 4 bits, mas la cache KV que depende de la longitud de contexto efectiva.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando BF16 con contexto moderado o cuantizacion de 8/4 bits para contextos largos.
- GPU de datacenter recomendadas para servicio concurrente: A100 40/80 GB, H100, L40S, A10G; sobredimensionadas para un modelo de 4 B, utiles solo por el numero de peticiones simultaneas.
- Opciones de despliegue: Hugging Face Transformers, text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio), vLLM, endpoints compatibles con OpenAI. Ollama y llama.cpp requeririan conversion propia a GGUF, no incluida ni verificada.
- Servicios de terceros que ya alojan checkpoints de la misma serie: Featherless (con 32K de contexto en el paso 27) y Friendli.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este checkpoint.
- Nota de almacenamiento: el repositorio ocupa 25,7 GB porque incluye duplicado el checkpoint FSDP original ademas del export de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (step-001, seed 11) | 4,02 B | No disponible (32K en el paso 27 segun Featherless) | Checkpoint intermedio de GRPO OnlineRubrics | Apache-2.0 | Hugging Face, 153 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B | 262.144 tokens nativos segun la familia Qwen3 (no confirmado en la informacion proporcionada) | Modelo instruct final | Apache-2.0 | Hugging Face |
| HYU-NLP-EVAL/...-step-006 | ~4 B | No disponible | Checkpoint intermedio (paso 6) | Apache-2.0 | Hugging Face, Friendli |
| HYU-NLP-EVAL/...-step-013 | ~4 B | No disponible | Checkpoint intermedio (paso 13) | Apache-2.0 | Hugging Face |
| HYU-NLP-EVAL/...-step-027 | ~4 B | 32K | Checkpoint intermedio (paso 27) | Apache-2.0 | Hugging Face, Featherless |

No se dispone de datos de rendimiento comparativos entre estos checkpoints, por lo que la comparacion se limita a parametros, contexto conocido, licencia y disponibilidad.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: la model card indica "research use only" y no valida el modelo para toma de decisiones clinicas.
- Checkpoint intermedio, no un modelo terminado: es el paso 1 de una trayectoria de GRPO; su calidad puede ser inferior a la de un modelo instruct ya ajustado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en ninguna tarea, lo que impide estimar capacidad real ni tasa de error.
- Riesgo de alucinacion: no medido ni documentado. En dominio medico, cualquier salida debe tratarse como no fiable por defecto.
- Sesgos conocidos: no documentados. No hay evaluacion de sesgos demograficos, linguisticos ni culturales.
- Idiomas soportados: no declarados. El comportamiento fuera del ingles puede degradarse sin aviso.
- Thinking desactivado: no se beneficia de razonamiento explicito, lo que puede penalizar tareas de matematicas o logica multi-paso.
- Contexto no confirmado para este paso: no se debe asumir la ventana completa de la familia Qwen3 sin verificacion empirica.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo sigue siendo un artefacto de investigacion sin garantias; el usuario asume toda responsabilidad sobre el uso derivado.
- Trazabilidad incompleta para reproduccion: no se publican datos de entrenamiento, rubricas, estado del optimizador ni configuracion de infraestructura, por lo que la reproducibilidad total no es posible.
- Repositorio duplicado: 25,7 GB de descarga por incluir simultaneamente el export de inferencia y el checkpoint FSDP original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001
- Checkpoint hermano step-006: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-006
- Checkpoint hermano step-013: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano step-027 (API en Featherless, 32K de contexto): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-027
- Checkpoint step-013 en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint step-006 en Friendli: https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-006
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
