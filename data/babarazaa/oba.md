# BabarAzaa/oba

# BabarAzaa/oba (Qwen3-8B-OBLITERATED)

## Resumen

BabarAzaa/oba es una variante del modelo Qwen3-8B de Alibaba Qwen a la que se le ha aplicado un proceso de *abliteration* (eliminacion de la direccion de rechazo mediante ingenieria de activaciones) con el metodo `advanced` de la herramienta OBLITERATUS. El resultado es un modelo de 8.190.735.360 parametros cuyo comportamiento de rechazo ante determinadas peticiones ha sido suprimido a nivel de pesos. El repositorio de HuggingFace esta etiquetado como `uncensored`, `abliteration` y `obliterate`, y no incluye model card mas alla de la tabla de metadatos del proceso.

Se trata de un modelo denso (no MoE) construido sobre la arquitectura Qwen3, con 8,19 mil millones de parametros y pesos en formato safetensors que ocupan 30,9 GB en el repositorio. No se publican cuantizaciones, ni resultados de evaluacion, ni detalles del dataset o del procedimiento exacto de ortogonalizacion mas alla del nombre del metodo. El modelo solo declara el idioma ingles en sus etiquetas, aunque hereda la cobertura multilingue del modelo base.

Su relevancia es acotada y de caracter investigador: los modelos abliterados se usan para estudiar los mecanismos internos de rechazo, para *red teaming* y evaluacion de seguridad, y como componente en pipelines donde los rechazos del modelo alineado interfieren con la tarea (generacion creativa, datos sinteticos de dominio sensible). Con 0 descargas y 0 *likes* en el momento de redactar esta ficha, no existe validacion comunitaria de su comportamiento real.

## Especificaciones tecnicas

Nota: las filas marcadas como derivadas del modelo base proceden de la documentacion publica de Qwen/Qwen3-8B, no de la model card de esta variante, que no aporta esos datos.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (familia Qwen3), con RoPE, GQA, SwiGLU, RMSNorm y QK-Norm (derivado del modelo base) |
| Parametros totales | 8.190.735.360 (~8,19 mil millones, segun safetensors del repositorio) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativos en el modelo base, extensible a 131.072 con YaRN (derivado del modelo base; no confirmado en esta variante) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio. Los pesos estan en precision completa (fp16/bf16), por lo que se pueden generar GGUF, AWQ o GPTQ a partir de ellos |
| Idiomas soportados | Declarado: ingles (etiqueta `en`). El modelo base declara 119 idiomas; el efecto del proceso de abliteration sobre el resto de idiomas no esta documentado |
| Licencia | No disponible en la model card. El modelo base Qwen/Qwen3-8B se distribuye bajo Apache-2.0, pero esta variante no declara licencia propia |
| Formato de pesos | safetensors (etiqueta del repositorio), 30,9 GB |
| Nombre del modelo | BabarAzaa/oba (titulado internamente Qwen3-8B-OBLITERATED) |
| Metodo de modificacion | Abliteration, metodo `advanced`, via OBLITERATUS |
| Modelo base | Qwen/Qwen3-8B |
| Fecha de creacion en HuggingFace | 2026-09-30 |

## Arquitectura y entrenamiento

El modelo no introduce ninguna arquitectura nueva: es un Qwen3-8B intacto a nivel estructural al que se le ha aplicado una intervencion post-entrenamiento sobre los pesos. Qwen3-8B es un transformer causal denso con 36 capas, atencion con consultas agrupadas (GQA) y atencion completa, entrenado por Alibaba Qwen sobre del orden de 36 billones de tokens segun su informe tecnico, con un pipeline de post-entrenamiento en cuatro etapas que incluye arranque en frio con cadenas de razonamiento largas, RL sobre razonamiento, fusion del modo *thinking* y RL general. Esa misma estructura dual (modo pensamiento y modo sin pensamiento) permanece en el modelo base.

La modificacion consiste en *abliteration*: se identifica una direccion en el espacio de activaciones asociada a las respuestas de rechazo y se ortogonalizan los pesos que escriben en esa direccion, de forma que el modelo deja de proyectar activaciones hacia ese comportamiento. La herramienta empleada, OBLITERATUS, es un proyecto open source de ingenieria de activaciones enfocado precisamente a eliminar el comportamiento de rechazo; el autor declara el uso del metodo `advanced`, pero no publica la magnitud de la intervencion, las capas afectadas, el conjunto de datos de calibracion ni las metricas de exito. Tampoco hay informacion sobre si se realizo algun ajuste fino posterior (SFT, DPO o RLHF) tras la ortogonalizacion; los pesos del repositorio son los unicos artefactos disponibles.

## Capacidades

- Generacion de texto en ingles con la calidad del modelo base Qwen3-8B, con un comportamiento de rechazo suprimido en los ejes cubiertos por el proceso de abliteration.
- Razonamiento multi-paso: el modelo base soporta modo *thinking* (cadenas de razonamiento explicitas antes de responder) y modo directo; no esta documentado si el proceso de abliteration ha alterado la activacion o el rendimiento de ese modo.
- Codigo y matematicas: capacidad heredada del modelo base, sin evaluacion publicada para esta variante.
- Contexto largo: hasta 32.768 tokens nativos en el base, ampliable a 131.072 con configuracion YaRN.
- Tool calling / function calling: el modelo base Qwen3 soporta plantillas de llamada a herramientas y el formato de agente de Qwen; el proceso de abliteration no modifica los tokens especiales ni la plantilla de chat, por lo que la capacidad deberia persistir, aunque no hay pruebas publicadas.
- Uso en agentes: el base esta disenado para flujos multi-paso con herramientas, incluido el framework Qwen-Agent.
- Multilingue: el base cubre 119 idiomas, pero la model card de esta variante solo declara ingles y no hay evidencia de que el multilingue se conserve tras la intervencion.
- Capacidades especiales: no se declaran capacidades de vision ni de audio (el base Qwen3-8B es exclusivamente texto).
- No se documentan capacidades adicionales introducidas por el proceso de abliteration mas alla de la supresion de rechazos.

## Casos de uso

- Investigacion en interpretabilidad y seguridad: usar la pareja Qwen3-8B / Qwen3-8B-OBLITERATED como caso controlado para estudiar donde reside la direccion de rechazo, midiendo divergencias de activacion capa a capa entre ambos modelos con la misma entrada.
- Red teaming y evaluacion de salvaguardas: generar intentos adversarios de forma masiva contra clasificadores de contenido o filtros de entrada, aprovechando que el modelo no bloquea la generacion, para medir la tasa de deteccion de esos sistemas.
- Generacion de datos sinteticos para clasificadores de seguridad: producir ejemplos etiquetados de peticiones y respuestas problematicas en ingles que alimenten un detector; se necesitaria supervision humana en el etiquetado, dado que el modelo no tiene evaluacion publicada.
- Escritura creativa y ficcion sin friccion: redaccion de narrativa con violencia, contenido adulto o temas sensibles donde el modelo alineado tiende a rechazar o a desviar la respuesta; el contexto de 32.768 tokens permite mantener arcos narrativos largos.
- Asistencia en dominios tecnicos regulados: analisis de documentos de seguridad ofensiva, ciberseguridad, toxicologia o derecho penal donde las peticiones legitimas suelen activar rechazos; el modelo mantiene la base de conocimiento de Qwen3-8B y no interpone negativas.
- Simulacion de personajes y roleplay: agentes conversacionales con personalidades adversarias (negociadores hostiles, interrogatorios de entrenamiento) en los que la coherencia del personaje exige respuestas que un modelo alineado rechazaria.
- Despliegue local y offline: al ser un modelo de 8B en safetensors, se puede ejecutar en una GPU de consumo con cuantizacion a 4 bits para prototipos donde no se quiere depender de una API externa con politicas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de BabarAzaa/oba no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), ni el autor reporta metricas de tasa de rechazo antes y despues de la abliteration. Los resultados publicados para Qwen3-8B corresponden al modelo base sin modificar y no son extrapolables: la ortogonalizacion de la direccion de rechazo suele degradar ligeramente tareas que dependen de esa misma region del espacio de activaciones, pero no existe ningun dato medido para esta variante concreta.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros real (8.190.735.360). No hay mediciones publicadas de latencia ni throughput para esta variante.

- Pesos en fp16/bf16: ~16,4 GB solo de pesos. Con cache KV y overhead de runtime, se recomienda un minimo de 20-24 GB de VRAM.
- Pesos en int8: ~8,2 GB. Encaja en GPUs de 12-16 GB con contexto moderado.
- Pesos en 4 bits (GGUF Q4_K_M, AWQ 4-bit o GPTQ): ~4,7-5,0 GB. Cabe en GPUs de consumo de 8 GB con contexto corto y en 12-16 GB con contexto largo.
- Cache KV: con la configuracion del base (36 capas, 8 cabezas KV, head_dim 128), en fp16 ocupa aproximadamente 144 KB por token, es decir, unos 4,7 GB a 32.768 tokens. Reducirlo requiere cuantizacion de cache KV (fp8 o q8/q4 en llama.cpp), GQA ya aplicado o ventanas de contexto menores.
- GPUs recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB y RTX 6000 Ada para fp16 con contexto largo en produccion; RTX 4090 24 GB para fp16 con contexto corto o para 8 bits con contexto largo; RTX 3090/4080 en 8 bits; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en 4 bits.
- Cabe en GPU de consumo: si, en 4 bits en cualquier GPU con 8 GB o mas; en 8 bits en GPUs de 12-16 GB; en fp16 requiere 24 GB o mas.
- Opciones de despliegue: transformers (como en el ejemplo de la model card), vLLM, SGLang, TGI, llama.cpp y Ollama (tras convertir a GGUF), LM Studio. El contexto de 131.072 tokens con YaRN solo esta soportado de forma nativa en transformers, vLLM y SGLang.
- Latencia y throughput: no disponible. Al ser un modelo denso de 8B, el throughput tipico de esta clase de tamano en vLLM sobre una A100 se situa en el orden de miles de tokens por segundo con lotes grandes, pero no hay ninguna medicion publicada para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabarAzaa/oba (Qwen3-8B-OBLITERATED) | 8,19B densos | 32.768 nativos (131.072 con YaRN, segun el base) | Abliteration, metodo `advanced` de OBLITERATUS | No declarada | HuggingFace, safetensors, 0 descargas |
| Qwen/Qwen3-8B | 8,19B densos | 32.768 nativos (131.072 con YaRN) | Ninguna (modelo alineado) | Apache-2.0 | HuggingFace, ampliamente validado, con benchmarks publicos |
| huihui-ai/Qwen3-8B-abliterated | 8,19B densos | Igual que el base | Abliteration con la libreria abliterated de huihui-ai | Apache-2.0 (heredada del base) | HuggingFace, con variantes GGUF publicadas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B densos | 131.072 nativos | Ninguna (modelo alineado) | Llama 3.1 Community License (con restricciones para >700M usuarios) | HuggingFace, muy extendido |

No se dispone de datos de rendimiento comparativos para BabarAzaa/oba, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Frente a Qwen3-8B, esta variante sacrifica trazabilidad de licencia y evaluacion a cambio de eliminar los rechazos; frente a la alternativa de huihui-ai, carece de cuantizaciones publicadas y de cualquier historial de uso.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni medicion de tasa de rechazo residual, ni pruebas de regresion. Es imposible cuantificar cuanto ha degradado la abliteration al modelo base.
- Riesgo de alucinacion: identico o superior al del base, y sin filtros de rechazo que en algunos casos actuan como contencion. El modelo generara texto plausible sobre temas de los que no tiene conocimiento.
- Sesgos: el modelo base Qwen3-8B presenta sesgos conocidos de genero, origen etnico, religion y geografia. La abliteration elimina la capa de rechazo, no los sesgos subyacentes en los pesos; de hecho, puede hacerlos mas visibles al no haber negativa a responder.
- Contenido danino: al suprimir los rechazos, el modelo puede producir instrucciones operativas en dominios peligrosos (armas, drogas, ciberseguridad ofensiva, autolesion). Cualquier despliegue deberia acompanarse de filtros externos de entrada y salida.
- Idiomas: la model card solo declara ingles. No hay evidencia de que el rendimiento multilingue del base se conserve; el proceso de abliteration puede afectar de forma desigual a idiomas no representados en el conjunto de calibracion.
- Contexto: los 131.072 tokens del base requieren activar YaRN explicitamente y degradan la calidad si se usa por encima de la longitud nativa de 32.768. No esta verificado que esta variante conserve esa extension.
- Licencia: la model card no declara licencia. Aunque el modelo base es Apache-2.0, la ausencia de una licencia explicita en el repositorio derivado crea incertidumbre juridica para uso comercial. Conviene tratar el modelo como no apto para produccion hasta aclarar este punto.
- Repositorio sin validacion: 0 descargas y 0 likes, sin model card tecnica, sin `pipeline_tag` declarado y con la fecha de creacion registrada como 2026-09-30. No hay garantia de que los pesos subidos correspondan al proceso descrito ni de que el repositorio se mantenga.
- Trazabilidad: el autor no publica el script de abliteration, los hiperparametros ni las capas intervenidas, lo que impide reproducir el resultado.
- Cumplimiento normativo: en la UE, un modelo de este tipo desplegado en un sistema de IA de uso general entra en el ambito del Reglamento de IA; la falta de documentacion tecnica y de evaluacion de riesgos complica el cumplimiento de las obligaciones de transparencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BabarAzaa/oba
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Blog de Qwen3 (familia completa, incluido el 8B): https://qwenlm.github.io/blog/qwen3/
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Directorios genericos encontrados en la busqueda web, no especificos de este modelo: https://artificialanalysis.ai/leaderboards/models y https://llm-stats.com/leaderboards/llm-leaderboard
