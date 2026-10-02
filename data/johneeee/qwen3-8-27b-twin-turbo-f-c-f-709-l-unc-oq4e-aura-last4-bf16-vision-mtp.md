# Johneeee/Qwen3.8-27B-TWIN-TURBO-f-c-f-709-l-unc-oQ4e-aura-last4-bf16-vision-mtp

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un artefacto de cuantizacion publicado por el usuario Johneeee sobre un modelo base cuyo campo `model_type` es `qwen3_5`. Contiene 27.781.427.952 parametros (unos 27,78 mil millones) almacenados en formato MLX safetensors con cuantizacion de 4 bits y tamano de grupo 64, generada con la herramienta oQ (oMLX v0.7.0.dev4) mediante cuantizacion de precision mixta. El repositorio ocupa 20,2 GB y fue creado el 2 de octubre de 2026, con la ultima actualizacion un minuto despues de su creacion.

Su relevancia practica es acotada pero clara: un modelo denso de ~28B en 4 bits cabe en la memoria unificada de un Mac con Apple Silicon, algo que la version en precision completa (unos 55 GB en bf16) no permite en equipos de gama alta de consumo. El nombre del repositorio sugiere elementos adicionales (vision, MTP o multi-token prediction, capas finales en bf16, variantes "TWIN-TURBO" y "aura"), pero ninguno de ellos esta documentado ni confirmado en la model card.

El problema principal para evaluarlo es la falta de informacion: la model card solo documenta los parametros de cuantizacion, no la licencia, los idiomas, el contexto, los datos de entrenamiento ni resultados de evaluacion. El repositorio acumula 0 descargas y 0 "likes", por lo que no existe validacion de la comunidad ni evidencia de que los pesos se hayan probado a fondo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (campo `model_type` = `qwen3_5`; sin detalles de capas ni atencion en la model card) |
| Parametros totales | 27.781.427.952 (~27,78 B, dato de los safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE; el nombre no incluye ninguna referencia a expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, tamano de grupo 64, precision mixta (oQ / oMLX v0.7.0.dev4); formato MLX safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara y el repositorio no indica ninguna) |
| Formato de pesos | MLX safetensors cuantizados a 4 bits; el nombre del repositorio menciona `last4-bf16` (posibles ultimas 4 capas en bf16), sin confirmar |
| Tamano del repositorio | 20,2 GB |
| Libreria de inferencia | mlx |
| Fecha de creacion | 2026-10-02T16:28:45Z |
| Fecha de actualizacion | 2026-10-02T16:29:01Z |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base. El unico dato estructural objetivo es el campo `model_type: qwen3_5`, que situa el modelo en la familia Qwen 3.5, mas el recuento de parametros de los safetensors (27,78 B). No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre mecanicas de atencion, presencia de capas MoE o decodificacion especulativa.

Lo que si esta documentado es el proceso de cuantizacion, que es la aportacion real de este repositorio. Se aplico cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.0.dev4) a 4 bits con tamano de grupo 64, un esquema en el que los pesos se agrupan de 64 en 64 y cada grupo comparte un factor de escala (y posiblemente un sesgo), lo que reduce el error respecto a una escala unica por tensor. La "precision mixta" implica que no todas las capas se cuantizan igual: el sufijo `last4-bf16` del nombre apunta a que las cuatro ultimas capas o bloques se mantienen en bf16 para preservar calidad en la salida, una practica habitual en cuantizaciones agresivas, aunque la model card no lo confirma. Tampoco se documenta el criterio de asignacion de bits por capa ni si se midio la perplejidad resultante.

## Capacidades

- Generacion de texto autoregresiva: es la capacidad minima garantizada por tratarse de un transformer de lenguaje cuantizado y cargable con MLX; no hay ejemplos ni demos en el repositorio.
- Vision: el nombre del repositorio incluye `vision`, lo que sugiere un componente multimodal, pero la model card no menciona torre visual, procesador de imagen ni formato de entrada multimodal. No confirmado.
- Prediccion multi-token (MTP): el sufijo `mtp` podria indicar cabezas de prediccion multi-token, una tecnica que acelera la decodificacion. No aparece documentado en la model card. No confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades especiales adicionales (audio, vision, decodificacion especulativa): no disponibles.

En resumen: mas alla de la generacion de texto, cualquier capacidad concreta debe considerarse no verificada hasta que el autor publique la ficha del modelo base o ejemplos de uso.

## Casos de uso

Los siguientes escenarios son aplicables siempre que el modelo base confirme las capacidades habituales de su categoria. En todos ellos el valor especifico de este repositorio es la ejecucion local en Apple Silicon con un presupuesto de memoria reducido.

- Inferencia local en portatil Apple Silicon: un modelo de ~28B en 4 bits ocupa alrededor de 14-16 GB de pesos, de modo que un Mac con 32 GB de memoria unificada puede ejecutarlo sin conexion a internet, lo que resulta util para prototipado y para entornos sin acceso a la nube.
- Procesamiento de documentos sensibles: al ejecutarse en el propio equipo, los datos no salen de la maquina, lo que encaja en flujos con requisitos de confidencialidad (borradores legales, informes internos, historiales clinicos anonimizados) donde no se permite enviar texto a APIs externas.
- Asistente de programacion en el editor: integrado mediante `mlx_lm.server` o un cliente compatible con la API de OpenAI, puede usarse para autocompletado, explicacion de fragmentos y generacion de tests, con la ventaja de funcionar sin cuota ni coste por token.
- Evaluacion comparativa de cuantizaciones: al ser un artefacto de cuantizacion mixta a 4 bits, sirve para medir la perdida de calidad frente a la version bf16 del mismo modelo base en tareas concretas (resumen, extraccion de datos, generacion de codigo), siempre que se disponga de la referencia sin cuantizar.
- Experimentacion con LoRA y ajuste fino ligero: MLX permite entrenar adaptadores de bajo rango sobre pesos cuantizados, de modo que un investigador puede adaptar el modelo a un dominio concreto (terminologia juridica, jerga interna) usando un solo equipo.
- Generacion de texto por lotes en local: resumenes de correos, clasificacion de tickets o extraccion de entidades en volumen, ejecutados de noche en un Mac de sobremesa, evitando costes de API para cargas internas no criticas.
- Base para comparativas de rendimiento en hardware de consumo: medir tokens por segundo y consumo de memoria de una cuantizacion 4-bit de ~28B frente a alternativas GGUF de tamano similar en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta los parametros de cuantizacion (4 bits, grupo 64, oQ/oMLX) y no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna medida de perplejidad, ni antes ni despues de cuantizar. Tampoco hay comparaciones con la version bf16 del modelo base que permitan estimar la degradacion introducida por la cuantizacion a 4 bits.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad (wikiText u otro) | no disponible |
| Tokens por segundo (hardware de referencia) | no disponible |

## Requisitos de hardware

- Peso teorico de los pesos cuantizados: 27.781.427.952 parametros x 0,5 bytes = 13,9 GB. A esto hay que sumar escalas y sesgos de los grupos de 64 (aproximadamente 1,7 GB en bf16) y las capas que permanezcan en bf16, por lo que el repositorio completo ocupa 20,2 GB en disco.
- Memoria unificada recomendada: 32 GB o mas para trabajar con comodidad (pesos + cache KV + overhead del runtime). 24 GB es viable con contextos cortos y sin otras aplicaciones pesadas. 16 GB resulta insuficiente de forma previsible.
- Plataforma: MLX es un framework especifico de Apple Silicon (series M1 a M4 y posteriores). No se ejecuta de forma nativa en GPUs NVIDIA, AMD o Intel.
- GPUs recomendadas: no disponible para CUDA; en el ecosistema MLX, se recomienda cualquier chip de la familia M con 32 GB de memoria unificada o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max y equivalentes).
- Cabe en GPU de consumo: si, en Mac con Apple Silicon. En GPUs discretas de consumo (RTX 4090, 24 GB) seria viable en terminos de memoria, pero requiere convertir los pesos a otro formato, ya que MLX no es compatible con CUDA.
- Opciones de despliegue: `mlx-lm` (carga y generacion), `mlx_lm.server` (API compatible con OpenAI), LM Studio con backend MLX y la propia herramienta oMLX con la que se genero. No es compatible directamente con vLLM, TGI o llama.cpp sin conversion previa a GGUF/safetensors estandar.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No disponible. La model card no identifica de forma inequivoca el modelo base (solo el campo generico `qwen3_5`), no declara licencia ni contexto, y no aporta ningun resultado de evaluacion, por lo que cualquier comparacion con alternativas de la misma categoria (modelos densos de 24-32B publicados abiertamente, en variantes de 4 bits para Apple Silicon) careceria de una base verificable. Para poder comparar harian falta, como minimo: la ficha del modelo original, la licencia aplicable, la longitud de contexto soportada, la lista de idiomas y medidas de calidad antes y despues de cuantizar.

| Criterio | Este repositorio | Alternativas de la misma categoria |
|---|---|---|
| Parametros | 27,78 B | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Benchmark publicado | ninguno | no disponible |
| Disponibilidad | HuggingFace, 0 descargas | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia y la model card tampoco. Sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, y ademas se desconoce la licencia del modelo base, que podria imponer condiciones adicionales.
- Sin resultados de evaluacion: no hay benchmarks, ni perplejidad, ni comparacion con el modelo sin cuantizar. Se desconoce el impacto real de la cuantizacion a 4 bits sobre la calidad, especialmente en tareas sensibles a la precision como matematicas o generacion de codigo.
- Riesgo de alucinacion: no medido. Los modelos de ~28B cuantizados a 4 bits tienden a degradar mas en tareas de razonamiento largo y en el seguimiento estricto de instrucciones, pero no hay datos que lo confirmen para esta version.
- Sesgos: no evaluados. No se proporciona informacion sobre la composicion del dataset de entrenamiento ni sobre el alineamiento del modelo base.
- Idioma: la lista de idiomas soportados no esta disponible; no se puede asumir un buen rendimiento en castellano sin comprobacion empirica.
- Contexto: se desconoce la ventana maxima util y si la cuantizacion la afecta.
- Procedencia dudosa: el nombre del repositorio combina etiquetas no documentadas ("TWIN-TURBO", "aura", "f-c-f-709-l-unc"), el repositorio tiene 0 descargas, 0 "likes" y la ultima actualizacion se produjo un minuto despues de la creacion, lo que sugiere un unico commit sin mantenimiento posterior. No hay garantia de reproducibilidad ni de que los pesos esten completos y bien formados.
- Compatibilidad limitada: al estar en formato MLX, exige hardware Apple Silicon. La conversion a otros formatos no esta documentada y puede degradar aun mas la calidad.
- Uso en produccion: no recomendado sin una evaluacion propia previa, dado que no existe validacion de terceros, ni ficha tecnica, ni soporte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-f-c-f-709-l-unc-oQ4e-aura-last4-bf16-vision-mtp
- Herramienta de cuantizacion citada en la model card (oQ / oMLX): https://github.com/jundot/omlx
- Modelo base (Qwen 3.5): no disponible; no se proporciona enlace al modelo original en la informacion encontrada.
- Paper, blog o demo del autor: no disponible.
- Resultados de la busqueda web: no contienen informacion relevante sobre el modelo (los enlaces recuperados corresponden a documentacion de Google Sheets y no guardan relacion con el repositorio).
