# Diluner/gpt54-mini-sequential-qwen3-4b-sft-s3-searchqa-20260920

## Resumen

`Diluner/gpt54-mini-sequential-qwen3-4b-sft-s3-searchqa-20260920` es un ajuste supervisado (SFT) del modelo denso Qwen/Qwen3-4B, publicado por el usuario independiente Diluner. El checkpoint es la etapa final de una cadena de entrenamiento secuencial de tres entornos: BabyAI, TextCraft y SearchQA, en la que cada entorno recibe cinco epochs y el estudiante se arrastra de una etapa a la siguiente. El profesor utilizado para generar las trayectorias es un modelo denominado `gpt-5.4-mini`, del que la model card no aporta más identificación.

El interés del modelo es metodológico más que de producto: documenta un pipeline de destilación de agentes por etapas sobre un modelo base pequeno (4.411.424.256 parámetros totales, 17,7 GB de repositorio en safetensors), con métricas de éxito autoreportadas y un protocolo de evaluación explícito (avg@4, temperatura 0,4, top-p 1,0, top-k 20, thinking desactivado, 512 tokens generados por turno). La etapa final reporta 89,4444 % en BabyAI, 75,5000 % en TextCraft y 54,4375 % en SearchQA.

Es relevante ahora porque ejemplifica dos tendencias: el uso de modelos profesores propietarios para destilar capacidades agénticas en modelos abiertos pequenos, y el entrenamiento por currículo secuencial de tareas (gridworld, crafteo y búsqueda documental) en lugar de un único dataset agregado. El repositorio tiene 0 descargas y 0 likes, no declara licencia y no incluye estado del optimizador, logs crudos ni trayectorias del profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-4B (detalle de capas, dimension oculta y cabezas no disponible en la informacion aportada) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion aportada (heredada de Qwen/Qwen3-4B; consultar la model card del base) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio; solo pesos en safetensors (el tamano de 17,7 GB es coherente con pesos en fp32). No hay GGUF, AWQ, GPTQ ni MLX publicados |
| Idiomas soportados | No disponible (los tres entornos de entrenamiento son benchmarks en ingles) |
| Licencia | No disponible; la model card indica explicitamente que no se afirma ninguna licencia y remite a los terminos del modelo base |
| Formato de pesos | safetensors (configuracion, tokenizer y todos los shards incluidos en la raiz del repositorio) |
| Modelo base | Qwen/Qwen3-4B |
| Profesor de destilacion | `gpt-5.4-mini` (identificacion no detallada) |
| Libreria / pipeline | transformers, text-generation; tags de text-generation-inference y endpoints_compatible |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B, un transformer decoder-only denso con atencion causal; este checkpoint no introduce modificaciones estructurales ni cabezas adicionales, solo pesos ajustados por SFT. La informacion disponible no detalla numero de capas, dimension oculta, configuracion de atencion (GQA), tipo de normalizacion ni longitud de contexto nativa, por lo que esos datos deben tomarse de la model card de Qwen/Qwen3-4B.

El entrenamiento es un SFT secuencial en tres etapas: BabyAI, TextCraft y SearchQA, cinco epochs por entorno. En la etapa final (SearchQA) se registran 935 actualizaciones del optimizador. El estudiante y el metodo se mantienen a lo largo de la cadena, de modo que este checkpoint es el resultado de haber completado el prefijo babyai -> textcraft -> searchqa. La evaluacion usa avg@4 (media de exito en cuatro intentos por tarea oficial de test, no best-of-four), con temperatura 0,4, top-p 1,0, top-k 20, modo thinking desactivado y 512 tokens generados por turno. La model card advierte que los errores de episodio a cero no implican que todos los turnos generados esten bien formados.

Como notas de procedencia, el autor senala que se trata de un unico checkpoint entrenado, no de evidencia de una ventaja general del metodo ni de replicacion entre semillas; que el inventario de seleccion registra nombres, tamanos y fechas de modificacion de ficheros, no un hash byte a byte de tensores vinculado a las respuestas historicas de evaluacion; y que este checkpoint proviene de una cadena secuencial distinta de la ejecucion standalone historica.

## Capacidades

- Generacion de texto conversacional y multi-turno sobre el modelo base Qwen3-4B.
- Ejecucion de tareas agénticas en tres entornos concretos: BabyAI (gridworld con instrucciones), TextCraft (crafteo tipo Minecraft) y SearchQA (preguntas y respuestas con busqueda).
- Razonamiento en varios pasos dentro de un episodio: la evaluacion genera hasta 512 tokens por turno y mide exito por tarea completa, no por turno aislado.
- Uso de herramientas y acciones de entorno, condicionado a que el bucle del agente este implementado fuera del modelo (el repositorio no publica un harness propio).
- Operacion con thinking desactivado, tal y como se configuro en la evaluacion.
- Capacidades multilingues: no disponible; no se documentan idiomas soportados ni composicion linguistica del dataset de SFT.
- Capacidades especiales (vision, audio, decodificacion especulativa, atencion lineal): no disponibles en la informacion aportada.

## Casos de uso

- Recuperacion y respuesta sobre corpus documental: el modelo esta ajustado especificamente en SearchQA, un entorno de QA con busqueda, por lo que encaja como generador de respuestas en pipelines RAG donde el bucle de recuperacion lo controla el orquestador. Su 54,4375 % de avg@4 marca la expectativa realista de acierto.
- Automatizacion de flujos multi-paso con herramientas: con 512 tokens por turno y thinking desactivado, el coste por paso es bajo y permite iterar bucles de accion-observacion en produccion sin latencias altas.
- Investigacion en destilacion de agentes: sirve como referencia reproducible de una cadena de SFT secuencial con profesor propietario, util para comparar contra entrenamiento conjunto en un solo dataset.
- Reproduccion y auditoria de pipelines de entrenamiento: la ficha incluye recuento de pasos, epochs por entorno y un `experiment.json` con referencias legibles por maquina, lo que facilita replicar el protocolo en otros entornos.
- Evaluacion comparativa de agentes en BabyAI y TextCraft: los porcentajes reportados (89,4444 % y 75,5000 %) permiten usarlo como baseline en pruebas de generalizacion ID vs OOD.
- Prototipado local en hardware de consumo: con 4,41 B de parametros se puede servir cuantizado en una unica GPU de gama media, lo que reduce el coste de experimentar con agentes antes de escalar a modelos mayores.
- Generacion de datos sinteticos para entornos agénticos: dado que proviene de trayectorias de un profesor, puede usarse como generador de trayectorias adicionales para filtrar y reentrenar, siempre que se valide la calidad turno a turno.
- Sustitucion de modelos mayores en tareas de QA interna con presupuesto de latencia ajustado, asumiendo la perdida de calidad fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion avg@4, temperatura 0,4, top-p 1,0, top-k 20, thinking desactivado, 512 tokens generados por turno):

| Entorno | Exitos / intentos | avg@4 | Errores de episodio |
|---|---:|---:|---:|
| babyai | 322 / 360 | 89,4444 % | 0 |
| textcraft | 302 / 400 | 75,5000 % | 0 |
| searchqa | 871 / 1600 | 54,4375 % | 0 |

SearchQA cubre 200 tareas ID y 200 OOD, con cuatro intentos independientes por tarea. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones contra el modelo base o contra otros ajustes en los mismos entornos.

## Requisitos de hardware

- VRAM estimada para inferencia de los 4,41 B de parametros, sin contar cache KV: ~17,7 GB en fp32 (coincide con el tamano del repositorio), ~8,8 GB en fp16/bf16, ~4,4 GB en int8 y aproximadamente 2,6-3,0 GB en cuantizacion de 4 bits.
- La cache KV depende de la longitud de contexto efectiva y de la configuracion de atencion del base, dato no disponible en la informacion aportada; en contextos largos puede superar el peso de los pesos en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para fp16 con contextos largos y concurrencia alta; en consumer cabe en RTX 4090, RTX 4080, RTX 3090 y RTX 3060 de 12 GB si se usa fp16 sin contextos muy largos o cuantizacion de 8/4 bits.
- Despliegue: transformers (ejemplo oficial en la model card), text-generation-inference (etiquetado en el repositorio), endpoints_compatible y, si se convierte a GGUF, llama.cpp u Ollama. No se publican pesos cuantizados ni ficheros GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento agéntico |
|---|---:|---|---|---|---|
| Este checkpoint (Diluner) | 4,41 B | No disponible | No declarada | Publico en HF, 0 descargas, 0 likes | 89,4 % BabyAI, 75,5 % TextCraft, 54,4 % SearchQA (avg@4, autoreportado) |
| Qwen/Qwen3-4B (base) | 4,41 B | No disponible en la informacion aportada | Consultar la model card del base | Publico en HF | No evaluado en BabyAI, TextCraft ni SearchQA en la informacion disponible |
| Qwen3-8B | No disponible en la informacion aportada | No disponible | No disponible | Publico en HF | No disponible |

No se dispone de datos para comparar con otros ajustes agénticos de la misma categoria (por ejemplo, derivados de Qwen3-4B entrenados con RL o con datos de herramientas), ni de cifras de rendimiento del modelo base en los tres entornos de esta cadena. La comparacion debe limitarse, por tanto, al modelo base y a las metricas autoreportadas de este checkpoint.

## Limitaciones y advertencias

- Sin licencia declarada: la propia model card indica que no se afirma ninguna licencia y remite a los terminos del modelo base. Antes de cualquier uso comercial hay que verificar la licencia de Qwen/Qwen3-4B y la normativa aplicable; el repositorio no ofrece garantia alguna.
- Riesgo de sobreajuste a los tres entornos de entrenamiento: el ajuste esta orientado a BabyAI, TextCraft y SearchQA, por lo que el rendimiento en conversacion general o en dominios ajenos puede degradarse respecto al base. No se publican evaluaciones que lo cuantifiquen.
- Evidencia limitada: es un unico checkpoint, de una unica cadena secuencial y presumiblemente de una unica semilla; el autor advierte explicitamente de que no demuestra ventaja del metodo ni replicabilidad.
- Metricas autoreportadas: los porcentajes de exito no han sido verificados por terceros y la procedencia se basa en un inventario de ficheros, no en un hash de tensores vinculado a las respuestas de evaluacion.
- Interpretacion de los resultados: "cero errores de episodio" no implica que todos los turnos generados sean correctos; el exito se mide a nivel de tarea y puede ocultar fallos intermedios.
- Rendimiento modesto en la etapa final: 54,4375 % de avg@4 en SearchQA implica que aproximadamente uno de cada dos intentos falla; no es adecuado para uso autonomo sin verificacion humana.
- Idiomas: no se documentan idiomas soportados; los tres entornos son benchmarks en ingles, por lo que el comportamiento en castellano u otras lenguas no esta validado.
- Riesgo de alucinacion: al ser un modelo generativo de 4,4 B ajustado para QA con busqueda, puede producir respuestas plausibles no sustentadas en el contexto recuperado; requiere verificacion y citas externas.
- Sesgos: no disponibles; no se publica analisis de sesgos ni composicion detallada del dataset de SFT.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de la comunidad.
- Ausencia de artefactos operativos: no se incluyen cuantizaciones, harness de agente, estado del optimizador, logs crudos ni trayectorias del profesor, lo que limita la reproducibilidad completa y el despliegue inmediato fuera de transformers o TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-4b-sft-s3-searchqa-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Fichero de procedencia y checksums citado en la model card (`experiment.json`): https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-4b-sft-s3-searchqa-20260920/blob/main/experiment.json
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de la plataforma Steam, sin relacion con este checkpoint).
