# Shockem/Qwen3.8-27b-Terse-Coder-LoRA

## Resumen

Qwen3.8-27b-Terse-Coder-LoRA es un adaptador LoRA de rango 16 desarrollado por el usuario Shockem sobre el modelo Qwen/Qwen3.8-27B. Se entrenó con DPO (Direct Preference Optimization) con un objetivo muy concreto: acortar las cadenas de razonamiento en tareas de programación manteniendo la corrección del código generado. El repositorio contiene 116.727.808 parámetros en safetensors (1,8 GB), más una exportación en GGUF, y se distribuye bajo licencia Apache 2.0. Es la ronda 7 de un estudio en curso, con la ronda 6 archivada en `archive/r6/`.

Su relevancia es económica antes que académica: en modelos de razonamiento el coste de inferencia lo dominan los tokens de pensamiento, no los de respuesta. Según las mediciones del autor, el adaptador recorta los tokens de razonamiento hasta un 94,7 % sobre una base stock cuantizada en NVFP4, con el pass@1 prácticamente intacto (72,5 % → 70,8 %) en un conjunto retenido de 40 problemas. El efecto es acumulativo: sobre bases que ya razonan de forma concisa (Signal-3.8-27B) el recorte es del 40 % y la tasa de acierto incluso mejora.

El adaptador no modifica la cabeza de borrador MTP del modelo base, por lo que la decodificación especulativa sigue funcionando con aceptación completa (0,43 medida) y aporta un +78 % de velocidad de pared con el adaptador cargado. El autor publica además versiones ya fusionadas en fp16 y NVFP4 para quien prefiera evitar la fontanería de PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 16 (PEFT) sobre un transformer decoder-only Qwen3.8-27B; entrenado con DPO |
| Parametros totales | 116.727.808 en el adaptador (safetensors); el modelo base de 27B se descarga por separado |
| Parametros activos | No aplica: es un adaptador LoRA, no un modelo MoE |
| Longitud de contexto | No disponible (la hereda del modelo base Qwen3.8-27B; no se documenta en la model card) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors y GGUF; se ha evaluado sobre bases NVFP4 W4A16 (receta modelopt y receta propia con resolución hessiana) y sobre bases en precisión completa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) y GGUF |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 104 descargas, 0 likes (a fecha de actualizacion del repositorio) |
| Fechas | Creado el 17 de septiembre de 2026; actualizado el 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

El objeto distribuido es un adaptador LoRA de rango 16, no un modelo completo. El modelo base es Qwen/Qwen3.8-27B, con dos linajes adicionales usados como referencia y objetivo de entrenamiento: agentionai/Signal-3.8-27B y Shockem/Signal-3.8-27b-Heretic-ara. El método de entrenamiento es DPO, y la innovación principal está en la construcción de los pares de preferencia: en lugar de recurrir a jueces humanos o a un LLM evaluador, el autor selecciona las trazas «concisas pero correctas» mediante ejecución automática de tests y poda de pasos basada en entropía. Es decir, la señal de preferencia es objetiva (el test pasa o no pasa) y la concisión se mide sobre trazas verificadas.

El comportamiento técnico más relevante es que el efecto se compone con la concisión previa de la base, y que su magnitud depende críticamente de la calibración de la cuantización sobre la que se aplique. Con la receta NVFP4 de NVIDIA (o una receta propia que replica su resolución hessiana local sobre MLP y `lm_head`) el recorte llega al ~93 %; con una cuantización absmax W4A4 de los mismos pesos se queda en el 49,5 %. El adaptador tampoco toca la cabeza de borrador MTP, lo que permite mantener decodificación especulativa sin pérdida (las salidas se verifican contra el modelo objetivo). La ronda 7 se evaluó sobre bases NVFP4 servidas con vLLM 0.28 en 3× RTX 5060 Ti.

## Capacidades

- Reduccion de la longitud de la cadena de razonamiento en tareas de codigo: de 701 tokens de razonamiento de media en la base stock a 38 tokens de media con el adaptador, segun las mediciones del autor.
- Generacion de codigo con preservacion de la correccion: pass@1 de 72,5 % a 70,8 % en la base stock NVFP4 sobre 40 problemas retenidos (20 HumanEval + 20 MBPP-sanitized).
- Razonamiento sobre ejecucion de codigo: la version fusionada obtiene 92,1 % en CRUXEval-I y 92,9 % en CRUXEval-O sobre el conjunto completo de 800 problemas con el harness oficial de Meta.
- Razonamiento cientifico fuera de distribucion: 78,3 % en GPQA-Diamond en la version fusionada, con ~1.500 tokens de razonamiento de media, pese a que el entrenamiento es de codigo.
- Compatibilidad con decodificacion especulativa MTP: no modifica la cabeza de borrador, aceptacion medida de 0,43 con y sin adaptador.
- Capacidad de reduccion sobre bases ya concisas: −40 % sobre Signal-3.8-27B con mejora de pass@1 (64,2 % → 65,8 %).
- No se documenta soporte de tool calling, function calling, uso agente multi-paso, vision, audio ni modo de pensamiento explicito mas alla del propio razonamiento del modelo base.
- No se documentan capacidades multilingues especificas; el adaptador esta entrenado sobre tareas de codigo.

## Casos de uso

- Reduccion de coste en pipelines de generacion de codigo: el adaptador baja la deliberacion a decenas de tokens por problema manteniendo el pass@1, lo que reduce directamente el gasto en tokens de salida facturados en servicios de inferencia gestionada.
- Asistente de codigo en IDE con latencia interactiva: al responder casi de forma directa (media de 38 tokens de razonamiento), el tiempo hasta el primer token utilizable cae y la experiencia de autocompletado o explicacion de codigo deja de depender de cadenas de pensamiento largas.
- Agentes de reparacion de tests en CI/CD: el adaptador esta entrenado con preferencias derivadas de ejecucion de tests, por lo que encaja en bucles donde el modelo propone un parche, se ejecuta la suite y se itera; la concision reduce el numero de iteraciones costosas.
- Despliegue en hardware de gama media: con la base en NVFP4 y decodificacion especulativa MTP, el autor mide 48,9 tokens/s en 2× RTX 5060 Ti de 16 GB, una configuracion de consumo viable para servir un modelo de 27B.
- Sonda de calidad para cuantizaciones propias: comparar el recorte de tokens obtenido con distintas recetas de calibracion (hessiana frente a absmax) sirve para medir cuanto degrada una cuantizacion concreta la capacidad de deliberacion del modelo.
- Investigacion sobre concision de CoT: permite estudiar si la longitud de la cadena de razonamiento correlaciona con la precision en codigo, usando un par de preferencias construido sin jueces subjetivos.
- Evaluacion de codigo tipo CRUXEval en produccion: la version fusionada mantiene 92,1 % / 92,9 % en CRUXEval-I/O con un presupuesto de razonamiento minimo, util para tareas de prediccion de salida de codigo a gran escala.
- Razonamiento cientifico puntual con cautela: los 78,3 % en GPQA-Diamond de la version fusionada sugieren uso en preguntas de nivel doctorado, pero al estar fuera de la distribucion de entrenamiento debe validarse caso por caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks adicionales en la informacion disponible mas alla de los que se recogen a continuacion. Todos los datos proceden de la model card del autor. La evaluacion se hizo sobre 40 problemas retenidos (20 HumanEval + 20 MBPP-sanitized, disjuntos del entrenamiento), n=1 por ejecucion, con temperatura 0,6, top_k 20, top_p 0,95 y penalizacion de repeticion 1,05; el pass@1 se calcula por ejecucion automatica de tests en contenedor aislado y los tokens de razonamiento se leen de `completion_tokens_details.reasoning_tokens`. La metrica principal son totales de medianas por problema, con test de permutacion pareado.

| Base (todas en NVFP4) | Modo de servicio | Tokens de razonamiento | p | pass@1 base → +LoRA |
|---|---|---|---|---|
| nvidia/Qwen3.8-27B-NVFP4 (stock) | LoRA, 3 ejecuciones | −94,7 % | 0,0001 | 72,5 % → 70,8 % |
| House stock NVFP4 v3 (resolucion hessiana estilo NVIDIA) | LoRA, 6 ejecuciones | −92,4 % | 0,0001 | 69,2 % → 67,9 % |
| House stock NVFP4 v2 (absmax W4A4) | LoRA, 3 ejecuciones | −49,5 % | 0,0001 | 70,8 % → 69,2 % |
| Signal-3.8-27B (sin ajuste heretic) | LoRA, 3 ejecuciones | −40,0 % | 0,0002 | 64,2 % → 65,8 % |
| Signal-3.8-27b-Heretic-ara | cuantizacion fusionada, 6 ejecuciones | −42,2 % | 0,0001 | 62,5 % → 60,0 % |

Resultados de la version fusionada (Shockem/Qwen3.8-27b-Terse-Coder), que el autor presenta como evidencia de que el recorte afecta al presupuesto de deliberacion y no a la capacidad:

| Benchmark | Resultado | Condiciones |
|---|---|---|
| GPQA-Diamond | 78,3 % | ~1.500 tokens de razonamiento de media |
| CRUXEval-I | 92,1 % | Conjunto completo de 800, harness oficial de Meta |
| CRUXEval-O | 92,9 % | Conjunto completo de 800, harness oficial de Meta |
| HumanEval+ | 90,2 % | EvalPlus oficial, greedy, menos de 100 tokens de razonamiento de media |
| MBPP+ | 78,6 % | EvalPlus oficial, greedy, menos de 100 tokens de razonamiento de media |
| Conjunto retenido interno | 67,5 % de pass con ~38 tokens de razonamiento por problema | Modelo fusionado con la ronda 7 |

Referencia adicional: la base stock sin adaptador rinde 72,5 % de pass@1 con 701 tokens de razonamiento de media; con el adaptador responde casi de forma directa (38 tokens de media) y sostiene 70,8 %.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,23 GB en fp16 (116,7 M de parametros); el coste real de VRAM lo determina el modelo base de 27B.
- Base de 27B en NVFP4 W4A16: entorno de 14 GB de pesos mas cache KV; el autor lo ejecuta con exito en 2× RTX 5060 Ti de 16 GB (32 GB en total) con vLLM 0.28, cache KV en FP8 y 3 tokens especulativos.
- Base de 27B en precision completa (fp16/bf16): estimacion de ~54 GB solo en pesos, lo que exige 1× H100 de 80 GB o 2× A100 de 40 GB; no cabe en GPU de consumo.
- GPU recomendadas segun configuracion: RTX 5060 Ti 16 GB en pareja (medida por el autor) para NVFP4; A100 80 GB, H100 80 GB o 2× A100 40 GB para precision completa; no se documentan pruebas en RTX 4090 ni en otras consumer.
- Opciones de despliegue: vLLM 0.28 con adaptadores LoRA (configuracion medida y recomendada por el autor); llama.cpp u Ollama mediante la exportacion GGUF incluida en el repositorio; el modelo fusionado evita la carga de adaptadores en tiempo de ejecucion. No se documenta soporte en TGI.
- Decodificacion especulativa MTP: activada aporta un +78 % de velocidad de pared con el adaptador cargado, con aceptacion de 0,43 y sin perdida de calidad (salidas verificadas contra el modelo objetivo).
- Throughput medido en 2× RTX 5060 Ti 16 GB (vLLM 0.28, cache KV FP8, `num_speculative_tokens: 3`):

| Configuracion | Tokens/s de pared |
|---|---|
| Base NVIDIA NVFP4, MTP activado | 54,1 |
| Base House stock NVFP4 v3, MTP activado | 55,5 |
| Base House stock NVFP4 v2, MTP activado | 53,7 |
| Base NVIDIA NVFP4 + este adaptador, MTP activado | 48,9 |
| Base House stock NVFP4 v3 + este adaptador, MTP activado | 49,1 |
| Base House stock NVFP4 v2 + este adaptador, MTP activado | 45,0 |
| Base Signal NVFP4 (cuantizacion propia) + este adaptador, MTP activado | 50,4 |
| Base NVIDIA NVFP4 + este adaptador, sin decodificacion especulativa | 27,4 |
| Terse-Coder-NVFP4 fusionado, sin adaptador, MTP activado | 54,5 |

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tokens de razonamiento | Pass@1 en el conjunto retenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27b-Terse-Coder-LoRA (este) | Adaptador LoRA r16 + DPO | 116,7 M (adaptador) | −94,7 % sobre base stock NVFP4 | 70,8 % con adaptador sobre stock | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Shockem/Qwen3.8-27b-Terse-Coder (fusionado) | Modelo completo fp16 | 27.000 M | ~38 tokens por problema | 67,5 % | Apache 2.0 | HuggingFace, fp16 |
| Shockem/Qwen3.8-27b-Terse-Coder-NVFP4 (fusionado) | Modelo completo W4A16 | 27.000 M | ~38 tokens por problema | 67,5 % | Apache 2.0 | HuggingFace, NVFP4 |
| Qwen/Qwen3.8-27B (base stock) | Modelo completo | 27.000 M | 701 tokens de media | 72,5 % | No disponible en la informacion proporcionada | HuggingFace |
| agentionai/Signal-3.8-27B | Modelo completo | 27.000 M (linaje de entrenamiento) | Razonamiento ya conciso (-40 % adicional con el adaptador) | 64,2 % → 65,8 % con adaptador | No disponible en la informacion proporcionada | HuggingFace |
| Shockem/Signal-3.8-27b-Heretic-ara | Modelo completo | 27.000 M (objetivo de entrenamiento original) | -42,2 % con ronda 7, -36,0 % con ronda 6 | 62,5 % → 60,0 % (ronda 7); 62,5 % → 63,7 % (ronda 6) | No disponible en la informacion proporcionada | HuggingFace |

No se han proporcionado en la informacion disponible comparaciones con adaptadores de terceros ni con modelos de otros fabricantes de tamano equivalente.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y servir Qwen3.8-27B o uno de los linajes compatibles. El repositorio de 1,8 GB solo contiene el adaptador.
- No apilar este adaptador sobre la version fusionada (Shockem/Qwen3.8-27b-Terse-Coder): el doble recorte sobreacorta la respuesta y provoca fallos `no_code` con un pass del 63 % en las pruebas del autor.
- El recorte de tokens de razonamiento conlleva una perdida de precision pequena pero medible en casi todas las bases evaluadas (entre 1,3 y 2,5 puntos de pass@1), salvo en Signal-3.8-27B, donde mejora.
- En la base Signal-3.8-27b-Heretic-ara la ronda 7 cuesta ~2,5 puntos de pass@1; el autor recomienda la ronda 6 archivada para ese caso concreto.
- La magnitud del efecto depende de la calibracion de la cuantizacion de la base: con absmax W4A4 el recorte se queda en −49,5 % frente al −92,4 % de una resolucion hessiana. Elegir mal la receta de cuantizacion reduce a la mitad el beneficio.
- Metodologia de evaluacion limitada: 40 problemas retenidos, n=1 por ejecucion y medias por ejecucion que oscilan ±20 % por la cola pesada de la distribucion. Las cifras deben leerse como indicativas, no como resultados con intervalos estrechos.
- Los pares de preferencia se seleccionan por ejecucion automatica de tests, lo que sesga el comportamiento hacia problemas con tests ejecutables (HumanEval, MBPP) y puede no generalizar a tareas de codigo sin verificacion automatica.
- Riesgo de alucinacion no cuantificado: la model card no reporta tasas de alucinacion ni evaluaciones de seguridad o alineacion. Un razonamiento mas corto implica menos pasos de verificacion interna.
- No se documentan idiomas soportados, sesgos conocidos ni evaluaciones de robustez fuera del dominio de codigo. El resultado de 78,3 % en GPQA-Diamond es de la version fusionada y corresponde a una tarea fuera de la distribucion de entrenamiento.
- Estado de investigacion activa: es la ronda 7 de un estudio en curso y el autor advierte que publicara adaptadores actualizados, por lo que cualquier resultado puede dejar de ser reproducible sobre el artefacto actual. La ronda 6 esta archivada en `archive/r6/`.
- Licencia Apache 2.0 declarada para el adaptador, pero las licencias de los modelos base y de los linajes de entrenamiento (Signal, heretic-ara) deben verificarse por separado antes de un uso comercial.
- El repositorio tiene 104 descargas y 0 likes, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Modelo fusionado fp16: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Modelo fusionado NVFP4: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Base cuantizada de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Linaje de entrenamiento (Signal): https://huggingface.co/agentionai/Signal-3.8-27B
- Variante NVFP4 de Signal: https://huggingface.co/Shockem/Signal-3.8-27B-NVFP4
- Objetivo de entrenamiento original (heretic-ara): https://huggingface.co/Shockem/Signal-3.8-27b-Heretic-ara
- Variante NVFP4 de heretic-ara: https://huggingface.co/Shockem/Signal-3.8-27b-Heretic-ara-NVFP4
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a guias de uso de Facebook y no guardan relacion con el contenido de esta ficha. No se dispone de paper, blog tecnico ni repositorio de codigo adicionales.
