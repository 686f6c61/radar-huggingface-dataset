# mradermacher/PreciseCoder-27B-i1-GGUF

## Resumen

PreciseCoder-27B-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo PreciseCoder-27B, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original (PreciseCoder/PreciseCoder-27B) a cuantizaciones de la familia i1, generadas con ficheros imatrix para preservar la calidad en tamaños reducidos. El modelo base declara 26.895.998.464 parámetros (~26,9B) y está etiquetado como especializado en código y depuración, con entrenamiento basado en aprendizaje por refuerzo (etiquetas `reinforcement-learning` y `gdpo`).

El interés práctico de esta publicación es que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van desde 7,7 GB (i1-IQ1_M) hasta 22,2 GB (i1-Q6_K), algo imposible con los pesos en precisión completa. El repositorio ocupa 179,8 GB en total porque incluye todas las variantes de cuantización más el fichero imatrix.

La licencia declarada es Apache 2.0 y el único idioma soportado oficialmente es el inglés. No hay información publicada sobre arquitectura interna, ventana de contexto, composición del dataset ni resultados de benchmarks, por lo que varias especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base PreciseCoder-27B: ni el repositorio de cuantizaciones ni la model card original (citada de forma indirecta) especifican si se trata de un transformer decoder denso, una arquitectura MoE o un diseno hibrido. El recuento de parametros (26,9B) y el nombre sugieren un modelo denso de aproximadamente 27B, pero esto no esta confirmado en la informacion proporcionada. Tampoco se detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora tecnicas como atencion lineal o decodificacion especulativa.

Las etiquetas del modelo (`reinforcement-learning`, `gdpo`) indican que el entrenamiento o el ajuste final empleo aprendizaje por refuerzo, presumiblemente con una variante de optimizacion por preferencias (GDPO), orientada a mejorar la precision en tareas de codigo y depuracion. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases SFT/RLHF/DPO previas ni sobre el proceso de cuantizacion mas alla de que se usaron ficheros imatrix (weighted/imatrix quants) generados por mradermacher.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado explicitamente como modelo de codigo (`code`) y su nombre apunta a un enfoque en precision y depuracion.
- Depuracion de codigo: la etiqueta `debugging` sugiere entrenamiento orientado a localizar y corregir errores en fragmentos de codigo.
- Ajuste por refuerzo: el uso declarado de `gdpo` implica un pipeline de optimizacion por preferencias aplicado al comportamiento del modelo.
- Conversacion: la etiqueta `conversational` indica que el modelo esta preparado para dialogos multi-turno en formato chat.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (modo thinking, vision, audio): el README incluye una nota generica que afirma "this is a vision model", pero tambien aclara que los ficheros mmproj, si existen, estarian en el repositorio estatico; no hay confirmacion de soporte de vision en la informacion disponible.

## Casos de uso

- Revision de codigo automatizada en pipelines de CI: el modelo puede analizar diffs y senalar errores logicos o malas practicas, integrandose como paso previo al merge mediante llamadas a la API de inferencia local.
- Asistencia a la depuracion interactiva: dado su entrenamiento orientado a `debugging`, encaja en un asistente que recibe un stack trace y el codigo implicado y propone hipotesis de fallo ordenadas por probabilidad.
- Generacion de tests unitarios: se puede usar para producir casos de prueba a partir de funciones existentes, aprovechando la cuantizacion Q4_K_M para despliegues en una unica GPU de 24 GB.
- Completado de codigo en el IDE en local: con cuantizaciones i1-Q4_K_S (15,7 GB) o i1-IQ4_XS (15,2 GB) es viable servirlo en una estacion de trabajo con GPU de 24 GB sin enviar codigo a terceros.
- Migracion y modernizacion de bases de codigo legacy: tareas de traduccion entre lenguajes o frameworks y explicacion de fragmentos poco documentados, con la salvedad de que el modelo solo esta validado en ingles.
- Copiloto de documentacion tecnica: generar docstrings, ficheros README y comentarios a partir del codigo fuente, en entornos con requisitos de confidencialidad que exijan inferencia on-premise.
- Formacion de modelos derivados: al ser Apache 2.0 y disponer de fichero imatrix publicado, es una base util para crear cuantizaciones propias con distintos equilibrios de tamano y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

El modelo base tiene 26,9B parametros, lo que supone unos 54 GB en FP16 unicamente para los pesos, mas el overhead de cache KV. Las cuantizaciones GGUF reducen ese requisito de forma drastica:

| Cuantizacion | Tamano | VRAM minima practica | Notas |
|---|---|---|---|
| i1-IQ1_M | 7,7 GB | 8-10 GB | calidad muy degradada |
| i1-IQ2_XXS | 8,5 GB | 10-12 GB | calidad baja |
| i1-IQ2_M | 10,1 GB | 12 GB | - |
| i1-Q2_K | 10,8 GB | 12-14 GB | el autor senala que IQ3_XXS es probablemente mejor |
| i1-IQ3_XXS | 11,3 GB | 12-14 GB | calidad reducida |
| i1-IQ3_M | 12,7 GB | 16 GB | - |
| i1-IQ4_XS | 15,2 GB | 16-24 GB | buen equilibrio |
| i1-Q4_K_S | 15,7 GB | 16-24 GB | el autor lo marca como tamano/velocidad/calidad optimos |
| i1-Q4_K_M | 16,6 GB | 24 GB | recomendado por el autor |
| i1-Q6_K | 22,2 GB | 24 GB (justo) o 32-40 GB | casi equivalente a Q6_K estatico |

- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para Q4_K_M o Q6_K con contexto moderado; A100 40 GB, L40S o H100 para Q6_K con contextos largos y concurrencia elevada.
- Cabe en GPU de consumo: si. Las cuantizaciones IQ2/IQ3 entran en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB); Q4_K_M encaja en 24 GB.
- CPU / RAM: con cuantizaciones Q4 o inferiores es posible ejecutar en CPU con 16-32 GB de RAM, con velocidades de decodificacion muy inferiores a GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y KoboldCpp son las rutas naturales al ser formato GGUF. vLLM admite GGUF de forma parcial; TGI no esta orientado a este formato. El modelo base (no cuantizado) se usa via transformers.
- Latencia y throughput estimados: no disponible. Dependen por completo del hardware, de la cuantizacion elegida y de la longitud de contexto utilizada.

## Comparativa con modelos similares

La comparativa se establece con modelos de codigo de tamano comparable ampliamente utilizados. Los datos de las alternativas corresponden a informacion publica general de esos modelos y no a la informacion proporcionada en esta ficha, por lo que deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| PreciseCoder-27B (i1-GGUF) | ~26,9B | no disponible | Apache 2.0 | si, i1/imatrix y static |
| Qwen2.5-Coder-32B-Instruct | ~32B | 128K | Apache 2.0 | si |
| DeepSeek-Coder-V2-Lite-Instruct | ~16B totales (MoE) | 128K | licencia propia de DeepSeek | si |
| Codestral-22B | ~22B | 32K | licencia no comercial de Mistral | parcial |

Diferencias clave: PreciseCoder-27B ofrece licencia Apache 2.0, lo que facilita el uso comercial sin las restricciones de Codestral, pero no hay datos publicos de contexto ni de rendimiento que permitan situarlo frente a Qwen2.5-Coder-32B o DeepSeek-Coder-V2-Lite. Ademas, solo declara soporte de ingles, mientras que las alternativas citadas cubren decenas de idiomas.

## Limitaciones y advertencias

- Ausencia total de datos de benchmarks: no hay evidencia publicada de rendimiento en HumanEval, MBPP, MMLU u otras pruebas, por lo que su calidad real es desconocida.
- Sesgo idiomatico: solo se declara ingles (`language: en`), lo que limita su uso en entornos en castellano y puede degradar la calidad en comentarios, documentacion y nombres de variables en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo generativo de codigo, puede inventar APIs, funciones de libreria o dependencias inexistentes, especialmente en cuantizaciones agresivas (IQ1/IQ2).
- Degradacion por cuantizacion: las variantes por debajo de Q4 pierden calidad de forma perceptible; el propio autor etiqueta IQ1_M como "mostly desperate" y Q2_K_S como "very low quality". Para produccion conviene no bajar de Q4_K_S.
- Arquitectura y contexto desconocidos: al no publicarse la ventana de contexto, no se puede planificar su uso en tareas que requieran contextos muy largos (analisis de repositorios completos, por ejemplo).
- Trazabilidad del entrenamiento: no se documentan el dataset, el numero de tokens ni el proceso de RL/GDPO, lo que dificulta auditar sesgos o licencias de los datos de entrenamiento.
- Soporte de vision no confirmado: la nota generica del README sobre modelos de vision no viene acompanada de ficheros mmproj en este repositorio; conviene tratarlo como no soportado salvo verificacion en el repositorio estatico.
- Popularidad nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni informes de problemas.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe confirmarse en su propio repositorio antes de redistribuir derivados.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/PreciseCoder-27B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/PreciseCoder-27B-GGUF
- Modelo base: https://huggingface.co/PreciseCoder/PreciseCoder-27B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#PreciseCoder-27B-i1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces obtenidos no guardan relacion con PreciseCoder-27B y se han descartado.
