# CooLSiwon/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

`CooLSiwon/Qwen3.5-2B-ToolCalling-LoRA` es un repositorio publicado en Hugging Face cuyo nombre indica un ajuste mediante LoRA sobre el modelo base Qwen3.5-2B, de la familia Qwen3.5 de Alibaba Cloud, orientado a *tool calling* (llamada a funciones y herramientas). El artefacto lo firma el usuario CooLSiwon, no esta respaldado por Alibaba ni por el equipo de Qwen, y se distribuye bajo la libreria `transformers` con pesos en `safetensors` y la etiqueta `unsloth`, lo que sugiere que el entrenamiento se realizo con el framework Unsloth.

La relevancia practica del repositorio es limitada tal y como esta publicado: la *model card* es la plantilla autogenerada por Hugging Face y no contiene ni una sola respuesta a los apartados de descripcion, datos de entrenamiento, hiperparametros, evaluacion o licencia; todos los campos figuran como `[More Information Needed]`. El repositorio acumula 0 descargas y 1 *like*, y su tamano (0,3 GB) es coherente con un adaptador LoRA y no con un modelo completo de 2 000 millones de parametros en bf16 (que rondaria los 4 GB), aunque el autor no lo declara explicitamente.

Por tanto, esta ficha documenta lo que el autor publica (practicamente nada) y marca de forma explicita cada dato ausente. Cualquier uso en produccion exige inspeccionar los ficheros del repositorio, verificar la identidad del modelo base y contrastar la licencia de Qwen3.5-2B por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La *model card* no declara la arquitectura del adaptador ni del modelo base; las etiquetas del repositorio solo indican `transformers` y `unsloth` |
| Parametros totales | No disponible para el adaptador. El modelo base Qwen3.5-2B tiene 2 000 millones de parametros segun la ficha de Qualcomm AI Hub |
| Parametros activos | No disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El autor no publica variantes GGUF, AWQ, GPTQ ni cuantizaciones declaradas |
| Idiomas soportados | No disponible. El modelo base se describe como multilingue en la documentacion de Qualcomm AI Hub, sin listado de idiomas |
| Licencia | No disponible (campo `License: [More Information Needed]` en la model card) |
| Formato de pesos | `safetensors` |
| Tipo de artefacto | Presumiblemente un adaptador LoRA (por el nombre y por el tamano de 0,3 GB); no confirmado por el autor |
| Libreria y framework | `transformers`, entrenamiento con `unsloth` (etiqueta del repositorio) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creacion | 2026-10-23 |
| Ultima actualizacion | 2026-10-23 |
| Modelo base | Qwen3.5-2B (Alibaba Cloud), segun el nombre del repositorio |

Nota sobre las etiquetas: el identificador `arxiv:1910.09700` que aparece en los tags corresponde a Lacoste et al. (2019), el articulo de la calculadora de impacto medioambiental que la plantilla de *model card* de Hugging Face cita por defecto. No es un articulo sobre este modelo ni documenta su entrenamiento.

## Arquitectura y entrenamiento

No hay informacion publicada. El autor no describe la arquitectura del adaptador, no indica sobre que revision concreta de Qwen3.5-2B se entreno, no detalla el dataset de *tool calling* utilizado, ni el numero de tokens de entrenamiento, ni si hubo RLHF, DPO o unicamente SFT supervisado. Tampoco se declaran hiperparametros (rango del LoRA, alpha, modulos objetivo, precision de entrenamiento, epocas) ni la infraestructura de computo.

Lo unico inferible a partir de los metadatos es el flujo de trabajo: la etiqueta `unsloth` apunta a que se empleo ese framework para el ajuste eficiente en memoria, y el nombre del repositorio indica que la tarea objetivo es *tool calling*. El tag `endpoints_compatible` sugiere que el repositorio fue preparado para desplegarse mediante Hugging Face Inference Endpoints. El tag `region:us` es un metadato de ubicacion del almacenamiento, no una caracteristica tecnica.

Advertencia de trazabilidad: en la busqueda web aparecen repositorios con el mismo nombre exacto bajo otras cuentas (`wcheolkyo/Qwen3.5-2B-ToolCalling-LoRA` y `egoigo/Qwen3.5-2B-ToolCalling-LoRA`). No hay informacion que aclare si son copias del mismo artefacto, replicas de un entrenamiento reproducible con una receta comun o publicaciones independientes. Conviene verificar hashes de los ficheros antes de elegir una fuente.

## Capacidades

- Generacion de texto: heredada del modelo base Qwen3.5-2B; no evaluada en este repositorio.
- *Tool calling* / *function calling*: es el objetivo declarado por el nombre del repositorio. No existe ninguna evaluacion publicada en la *model card* que confirme tasas de acierto, formato de salida ni compatibilidad con el esquema de herramientas de OpenAI.
- Razonamiento multi-paso y uso como agente: plausible sobre el modelo base, pero sin datos de validacion en este ajuste.
- Capacidades multilingues: no declaradas en el repositorio; dependen del modelo base, descrito como multilingue por Qualcomm AI Hub.
- Codigo y matematicas: no declaradas ni evaluadas.
- Vision, audio y modo *thinking*: no declarados. La documentacion de Unsloth menciona modelos Qwen3.5 multimodales, pero este repositorio concreto no indica serlo.
- Formato de pesos listo para `transformers`: confirmado por los tags y el tamano del repositorio.

## Casos de uso

Los siguientes escenarios son adecuados para el tipo de artefacto (un ajuste de 2B parametros especializado en llamada a funciones), pero ninguno esta validado por el autor. Se plantean como hipotesis de uso a verificar antes de desplegar.

- Prototipado de agentes con llamada a herramientas en local: cargar el adaptador sobre Qwen3.5-2B con `transformers` y `peft` permite probar en una GPU de consumo un bucle de agente (decidir herramienta, generar argumentos JSON, interpretar resultado) sin coste de API. El tamano reducido del modelo base facilita iterar rapido.
- Enrutado de intenciones en asistentes conversacionales: un modelo de 2B ajustado para emitir llamadas estructuradas puede clasificar la peticion del usuario y derivarla a la funcion correcta (consulta de pedido, cambio de direccion, cancelacion) antes de invocar un LLM mayor, reduciendo latencia y coste por peticion.
- Extraccion de parametros estructurados de texto libre: convertir correos o mensajes en objetos JSON con campos definidos (fechas, importes, identificadores) usando el esquema de herramientas como contrato de salida, con validacion posterior mediante JSON Schema.
- Automatizacion de back-office con RPA: integrar el adaptador como paso de normalizacion en pipelines que ya invocan APIs internas, de forma que el modelo proponga la llamada y el orquestador la ejecute con control de permisos.
- Inferencia en el borde o en portatil: con cuantizacion a 4 bits de un modelo de 2B, el sistema cabe en equipos sin GPU dedicada, lo que habilita asistentes de escritorio que llaman a herramientas locales (sistema de ficheros, calendario) sin enviar datos a la nube.
- Base para un ajuste propio adicional: al ser un adaptador LoRA pequeno (0,3 GB), sirve como punto de partida para *fine-tuning* especifico de dominio con Unsloth en una sola GPU, fusionando despues los pesos.
- Evaluacion comparativa de recetas de *tool calling*: util en un banco de pruebas interno para medir si un ajuste de 2B basta frente a modelos mayores en tareas de llamada a funciones con esquemas sencillos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* incluye el apartado `Evaluation` con todos los campos a `[More Information Needed]` y no hay datos de MMLU, HumanEval, GSM8K ni de benchmarks especificos de *tool calling* (BFCL, ToolBench, API-Bank) en el repositorio ni en los resultados de busqueda.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros del modelo base (2 000 millones), no datos publicados por el autor:

- Pesos del modelo base en bf16/fp16: aproximadamente 4 GB. El adaptador anade unos 0,3 GB.
- Inferencia en fp16 con cache KV para contextos moderados: alrededor de 5-6 GB de VRAM.
- Cuantizacion a 8 bits: aproximadamente 2,5-3 GB de VRAM.
- Cuantizacion a 4 bits (GGUF Q4_K_M tras fusionar y convertir): aproximadamente 1,3-1,5 GB, ejecutable en CPU.
- GPU de consumo: si, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En GPUs de 8 GB funciona en fp16 con contexto corto o en 8/4 bits.
- GPU de datacenter: A100, H100 o L40S para servir con batching y muchos usuarios concurrentes.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), integracion con Unsloth para entrenamiento, vLLM (soporta adaptadores LoRA en servicio), TGI, y llama.cpp u Ollama solo despues de fusionar el adaptador con el modelo base y convertir a GGUF. Hugging Face Inference Endpoints es viable segun el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CooLSiwon/Qwen3.5-2B-ToolCalling-LoRA | Adaptador sobre base de 2B | No disponible | *Tool calling* (declarado en el nombre) | No disponible | Publico en HF, 0 descargas, 1 like |
| Qwen3.5-2B (modelo base) | 2B | No disponible | LLM multilingue de proposito general para inferencia en dispositivo | No disponible en la informacion proporcionada | Distribuido por Alibaba Cloud; listado en Qualcomm AI Hub |
| wcheolkyo/Qwen3.5-2B-ToolCalling-LoRA | No disponible | No disponible | Mismo nombre de ajuste | No disponible | Copia o publicacion homonima en HF |
| egoigo/Qwen3.5-2B-ToolCalling-LoRA | No disponible | No disponible | Mismo nombre de ajuste | No disponible | Copia o publicacion homonima en HF |

No se dispone de datos de rendimiento de ninguna de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a procedencia y disponibilidad. No se han identificado en la busqueda modelos de *tool calling* de tamano comparable con metricas publicadas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion inexistente: la *model card* es la plantilla autogenerada y no responde a ningun apartado. No se puede verificar que el ajuste haga lo que su nombre promete.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial, y la licencia aplicable podria venir condicionada por la del modelo base Qwen3.5-2B, que tampoco figura en la informacion disponible. Es un bloqueo directo para produccion hasta aclararlo.
- Ausencia de validacion comunitaria: 0 descargas y 1 like implican que el artefacto no ha sido reproducido ni auditado por terceros.
- Riesgo de alucinacion en la llamada a funciones: en modelos pequenos es frecuente generar nombres de herramienta inexistentes, argumentos fuera de tipo o JSON mal formado. Cualquier integracion debe validar la salida contra el esquema y aplicar *fallbacks*.
- Ambiguedad de procedencia: existen al menos tres repositorios con el mismo nombre en cuentas distintas, sin informacion sobre cual es el original ni sobre si los pesos coinciden.
- Superficie de seguridad en agentes: un modelo de 2B ajustado para ejecutar herramientas es vulnerable a inyeccion de prompts a traves de contenido no confiable (correos, paginas web) que acabe en el contexto. Requiere aislamiento de permisos en el orquestador.
- Contexto desconocido: se desconoce la ventana maxima, lo que impide planificar conversaciones largas o documentos extensos.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma distinto del que domine el modelo base.
- Sesgos: no evaluados. Al no haber datos de composicion del dataset de ajuste, no se puede estimar el sesgo introducido por el *fine-tuning*.
- Fecha y mantenimiento: el repositorio no se ha actualizado desde su creacion (2026-10-23) y no hay senales de mantenimiento.

## Enlaces

- Repositorio principal: https://huggingface.co/CooLSiwon/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo (cuenta wcheolkyo): https://huggingface.co/wcheolkyo/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo (cuenta egoigo): https://huggingface.co/egoigo/Qwen3.5-2B-ToolCalling-LoRA
- Modelo base Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Documentacion de Unsloth para *fine-tuning* de Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Guia practica de *fine-tuning* de Qwen3.5 con LoRA/QLoRA: https://sotaaz.com/post/qwen35-finetuning-en
- Articulo citado en los tags (calculadora de impacto medioambiental, no relacionado con el modelo): https://arxiv.org/abs/1910.09700
