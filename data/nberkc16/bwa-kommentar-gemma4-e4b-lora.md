# nberkc16/bwa-kommentar-gemma4-e4b-lora

## Resumen

`bwa-kommentar-gemma4-e4b-lora` es un adaptador LoRA desarrollado por nberkc16 (en el contexto de REGU AI, una startup pre-semilla de Múnich) sobre el modelo base `google/gemma-4-E4B-it`. Su funcion es redactar borradores de comentario de gestion en aleman para la BWA (Betriebswirtschaftliche Auswertung), el informe mensual de resultados a corto plazo que utiliza DATEV en las pymes alemanas. El adaptador ocupa la tercera capa de un sistema de cuatro capas en el que Python calcula todas las cifras, un modulo RAG recupera notas internas de la empresa, el modelo redacta el texto y una capa de validacion comprueba numeros y fuentes antes de la aprobacion humana.

Tecnicamente es un adaptador PEFT de 34.881.536 parametros (r=16, alpha=16) entrenado mediante QLoRA de 4 bits sobre las capas de atencion y MLP del modelo de lenguaje, dejando intactas las torres de vision y audio del modelo base. El repositorio incluye tanto el adaptador en formato PEFT (`adapter_model.safetensors`) como una conversion GGUF (`adapter_rag.gguf`) para su uso con `llama.cpp`. El modelo esta disenado explicitamente para no calcular cifras, citar una nota de contexto por cada causa declarada y marcar como hipotesis o advertencia cualquier afirmacion no respaldada por el contexto.

La relevancia actual del modelo es acotada pero ilustrativa: demuestra un patron de especializacion vertical muy estricto (dominio contable aleman, formato de salida fijo, datos 100 % sinteticos) sobre un modelo pequeno con capacidades multimodales, pensado para despliegue local y privado en entornos empresariales donde los datos no pueden salir de la infraestructura del cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B; atencion y MLP de las capas de lenguaje |
| Parametros totales | 34.881.536 (adaptador); modelo base no disponible en la informacion |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens en la configuracion de referencia (`-c 12288`); prompts de 4-6k tokens; entrenamiento con max length 7.168 tokens |
| Tipos de cuantizacion | Base en Q4_K_M (GGUF, 5,5 GB); entrenamiento en 4 bits (bnb-4bit); adaptador en safetensors y GGUF |
| Idiomas soportados | Aleman (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-E4B-it`, un modelo multimodal de la familia Gemma 4 con torres de vision y audio. El LoRA (r=16, alpha=16, dropout 0) se inserta unicamente en las capas de atencion y MLP del modelo de lenguaje, dejando sin tocar los modulos de vision y audio. El entrenamiento se realizo con QLoRA sobre una base cuantizada a 4 bits (`unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`), usando Unsloth 2026.10.8 y TRL 1.15.0, con la perdida calculada solo sobre la respuesta. El regimen fue de 1 epoca, LR 2e-4 lineal con warmup del 5 %, batch 1 con acumulacion de gradiente 8 (113 pasos), AdamW de 8 bits y longitud maxima de 7.168 tokens. El coste total fue de 7,8 horas en una unica GPU Kaggle T4.

El conjunto de datos consta de 898 meses-empresa sinteticos de dos sectores (mayorista de sanitarios y calefaccion, y fabricante de muebles de jardin), con 20 variantes por empresa. Los objetivos de entrenamiento se construyeron a partir de un plan de contenido basado en reglas derivado del ground truth del generador (que decir y que nota explica cada desviacion), con la redaccion en aleman producida por un modelo profesor (Mistral Large 3) y sometida a comprobaciones automaticas; los textos rechazados se regeneraron o descartaron. La perdida de validacion paso de 0,834 a 0,130 sobre 32 ejemplos reservados. Una decision de diseno clave es que los objetivos nunca contienen la causa real de un evento salvo que una nota visible la declare; en caso contrario, el modelo debe formular una pregunta abierta o una hipotesis marcada.

## Capacidades

- Generacion de texto en aleman con formato fijo de cuatro secciones: `Kernaussagen`, `Abweichungen im Detail`, `Hinweise auf mögliche Verzerrungen` y `Offene Fragen an Buchhaltung / Steuerberater`.
- Redaccion de comentario de gestion BWA de 250-350 palabras mas una tabla de desviaciones con columnas Posicion, Ist, Vergleich, Abweichung, Erklarung y Quelle/Hypothese.
- Citado obligatorio de fuentes de contexto mediante identificadores (`[Quelle: Kontextnotiz 2025-07]`) o marcado explicito como `(Hypothese)`.
- Abstraccion de cifras: el modelo no calcula numeros, solo reproduce los que recibe en el bloque `FACTS` en formato JSON.
- Formulacion de advertencias sobre posibles distorsiones contables (devengos faltantes, variacion de existencias no registrada, estacionalidad) sin presentarlas como hechos.
- Generacion de preguntas abiertas dirigidas a contabilidad o al asesor fiscal cuando falta informacion en el contexto.
- Procesamiento de contexto estructurado en tres bloques: `FACTS` (JSON con valores reales, mes anterior, mismo mes del ano anterior, acumulados, desviaciones, ratios y flags), `WISSEN` (explicaciones generales de lineas BWA) y `KONTEXTNOTIZEN` (perfil de empresa y top-8 notas recuperadas con ID, mes y duracion).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso mas alla del flujo de cuatro capas descrito.

## Casos de uso

- Borrador de comentario BWA para pymes alemanas: el modelo recibe las cifras del mes ya calculadas por codigo y las notas internas recuperadas por RAG, y produce un borrador estructurado que un contable o controller revisa y aprueba antes de su envio. Es adecuado porque el diseno separa explicitamente el calculo (Python) de la redaccion (modelo), eliminando el riesgo de errores aritmeticos en el texto.
- Automatizacion del reporting mensual en despachos contables: integrado en un pipeline que ejecuta la BWA de DATEV, calcula desviaciones y llama al modelo con el prompt version 1.1, genera borradores para decenas de clientes en una sola pasada, con la capa de validacion marcando cifras o fuentes inconsistentes.
- Control de calidad con trazabilidad de fuentes: al exigir una cita `[Quelle: ...]` o una marca `(Hypothese)` por cada causa declarada, el modelo encaja en flujos donde un auditor debe verificar de que nota interna proviene cada afirmacion del comentario.
- Deteccion de distorsiones contables en revision mensual: el modelo senala posibles problemas (devengos no registrados, variacion de existencias ausente, estacionalidad) como advertencias, lo que sirve como lista de comprobacion para el equipo de contabilidad antes del cierre.
- Generacion de preguntas para el asesor fiscal: la seccion de preguntas abiertas produce una lista concreta de dudas pendientes que el controller puede trasladar directamente al Steuerberater, ahorrando la fase de identificacion manual de huecos de informacion.
- Despliegue local y privado en infraestructura del cliente: al ser un adaptador pequeno (0,2 GB de repositorio) sobre una base de 5,5 GB en Q4_K_M, puede ejecutarse con `llama-server` en una GPU de portatil de 4 GB reduciendo `-ngl` y `-c`, lo que encaja con requisitos de soberania de datos en empresas alemanas.
- Prototipo de investigacion sobre fidelidad factual en dominios regulados: el modelo sirve como caso de estudio de entrenamiento con datos sinteticos y objetivos derivados de reglas para forzar el no-alucinado de causas en informes financieros.

## Benchmarks y rendimiento

La model card incluye una evaluacion sobre 720 meses de prueba: 240 de un sector nuevo no visto en entrenamiento (proveedor de mecanizado metalico) y 480 de empresas nuevas de los sectores entrenados. Se uso el mismo fichero de modelo base, prompt y muestreo para todas las filas, variando solo el adaptador. Sin embargo, la tabla comparativa de resultados entre modelo base y adaptador aparece truncada en la informacion proporcionada, por lo que no es posible reproducir las cifras.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en Q4_K_M ocupa 5,5 GB; con el adaptador LoRA cargado y contexto de 12.288 tokens, se recomienda al menos 8 GB de VRAM para offload completo (`-ngl 999`). En GPUs de 4 GB es necesario reducir `-ngl` y `-c`.
- GPU recomendadas: cualquier GPU con 8 GB o mas para la configuracion de referencia; en el extremo alto, A100 o H100 no aportan ventaja significativa dado el tamano del modelo. En el extremo consumer, RTX 3060 12 GB, RTX 4070, RTX 4090 funcionan con offload completo.
- Cabe en GPU consumer: si, en GPUs de 8 GB o mas con la configuracion completa; en 4 GB con offload parcial.
- Opciones de despliegue: `llama.cpp` con `llama-server` (ruta evaluada por el autor), usando el binario incluido en Ollama 0.40.10; el adaptador PEFT en safetensors es compatible con vLLM y TGI, aunque no se documenta su evaluacion en esas rutas.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo requirio 7,8 horas en una T4 para 113 pasos.
- Muestreo de referencia: temperatura 0,2, top_k 64, top_p 0,95, min_p 0, seed 42, max 1.500 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del adaptador ni de modelos comparables directos (adaptadores LoRA para comentario BWA en aleman) en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| bwa-kommentar-gemma4-e4b-lora | 34,9 M (adaptador) | 12.288 tokens (config. referencia) | Apache 2.0 | LoRA vertical sobre Gemma 4 E4B para BWA en aleman |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | no disponible | Modelo multimodal generalista |
| Mistral Large 3 (profesor en entrenamiento) | no disponible | no disponible | no disponible | Modelo generalista usado para redactar objetivos de entrenamiento |

## Limitaciones y advertencias

- Todos los datos de entrenamiento y prueba son sinteticos; el modelo es un prototipo de investigacion publico, no un producto comercial ni una version de produccion.
- No constituye asesoramiento fiscal ni legal; todo borrador requiere revision humana.
- El comportamiento fuera del formato exacto de entrada (prompt version 1.1) no esta probado: otros idiomas, preguntas libres u otros informes pueden producir resultados no validados.
- El modelo esta entrenado para no calcular cifras; cualquier numero que aparezca fuera del bloque `FACTS` debe considerarse sospechoso.
- Riesgo de alucinacion de causas: aunque el entrenamiento penaliza afirmar causas sin nota visible, el modelo puede generar hipotesis plausibles que un lector podria interpretar como hechos si no se revisa el marcado `(Hypothese)`.
- Sesgo de dominio: solo cubre dos sectores en entrenamiento (mayorista de sanitarios y calefaccion, fabricante de muebles de jardin) y un sector nuevo en prueba (mecanizado metalico); el rendimiento en otros sectores no esta caracterizado.
- Limitacion idiomatica: solo aleman; no se documenta soporte de otros idiomas.
- La licencia Apache 2.0 del adaptador no exime de verificar las condiciones del modelo base `google/gemma-4-E4B-it`, cuyos terminos no se detallan en la informacion proporcionada.
- La tabla de evaluacion comparativa entre modelo base y adaptador esta truncada en la informacion disponible, por lo que no se puede verificar la mejora cuantitativa.
- Solo se ha evaluado la ruta de despliegue con `llama.cpp` y el binario de Ollama 0.40.10; otras conversiones GGUF del modelo base deberian funcionar pero no fueron probadas.

## Enlaces

- HuggingFace: https://huggingface.co/nberkc16/bwa-kommentar-gemma4-e4b-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Base cuantizada para entrenamiento: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- REGU AI (empresa desarrolladora): https://www.reguai.tech
- Repositorio del proyecto: no disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
