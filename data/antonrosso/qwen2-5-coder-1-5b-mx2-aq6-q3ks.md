# AntonROSSO/qwen2.5-coder-1.5b-mx2-aq6-q3ks

## Resumen

`AntonROSSO/qwen2.5-coder-1.5b-mx2-aq6-q3ks` es una cuantizacion GGUF mixta del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba Qwen, publicada por el usuario AntonROSSO dentro del proyecto "Behavioral Report Cards" (Project Syntactic). El artefacto pesa 750,3 MB y emplea un esquema de cuantizacion mixta denominado `mx2_aq6_q3ks`, en el que las capas de atencion y las de feed-forward se almacenan con anchos de bits efectivos distintos. El modelo base es un transformer decoder-only de 1.543.714.304 parametros con licencia Apache-2.0, orientado a generacion de codigo y conversacion tecnica.

El interes de esta publicacion no reside en el modelo en si, sino en el contexto experimental en el que se enmarca: el autor lo presenta como una de las 12 configuraciones de cuantizacion evaluadas sobre una matriz de 80 tareas de HumanEval+ y MBPP, con el objetivo de estudiar la seleccion de "pass-sets" exactos y los limites de transferencia de esa seleccion entre particiones, conjuntos de tareas y familias de modelos. La model card reporta que esta configuracion forma parte de la mejor pareja de configuraciones (56/80 aciertos frente a 49/80 de la mejor configuracion fija y 58/80 de la union oracle de las 12 configuraciones).

Es, por tanto, un artefacto de investigacion reproducible y auditable, no un modelo destinado a produccion generalista. Su tamano reducido permite ejecutarlo en practicamente cualquier hardware, y su formato GGUF lo hace compatible con llama.cpp, Ollama y LM Studio. La relevancia actual es doble: por un lado, ofrece una variante de cuantizacion agresiva de un modelo de codigo pequeno y ampliamente utilizado; por otro, documenta de forma explicita las limitaciones de transferencia de los resultados de seleccion, una advertencia metodologica poco habitual en publicaciones de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | GGUF mixta `mx2_aq6_q3ks` (anchos de bits efectivos distintos en capas de atencion y FFN); tamano de artefacto 750,3 MB |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | Apache-2.0 (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Formato de pesos | GGUF (compatible con llama.cpp, Ollama y LM Studio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only denso de aproximadamente 1,54 mil millones de parametros, entrenado por Alibaba Qwen sobre datos de codigo y texto, con un proceso de alineacion posterior (instruccion y preferencias) del que esta ficha no dispone de detalles concretos. No se trata de un modelo MoE ni de una arquitectura hibrida SSM/transformer: es un transformer clasico con atencion causal completa.

La innovacion de esta publicacion es exclusivamente la cuantizacion: un esquema mixto `mx2_aq6_q3ks` que asigna distintos anchos de bits efectivos a las capas de atencion y a las de feed-forward, generado presumiblemente con la herramienta de cuantizacion de llama.cpp y con una matriz de importancia (el tag `imatrix` aparece en los metadatos del repositorio). No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO especificos para esta variante (el proceso de alineacion es el del modelo base). Tampoco se detallan tecnicas como decodificacion especulativa o atencion lineal, que no aplican a esta variante.

## Capacidades

- Generacion de codigo en lenguajes habituales (Python, JavaScript, etc.), heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Razonamiento de proposito general y respuesta a instrucciones en formato conversacional (el modelo base es la variante `-Instruct`).
- Generacion de texto tecnico y documentacion a partir de contexto.
- Soporte de conversaciones multi-turno, limitado por el contexto efectivo del modelo base.
- Capacidades multilingues limitadas: la model card declara unicamente `en` como idioma soportado.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la informacion proporcionada.
- No se documenta vision, audio ni otras modalidades.

## Casos de uso

- Autocompletado de codigo en el editor: con 1,5 mil millones de parametros y 750 MB de pesos, el modelo puede ejecutarse localmente en un portatil y ofrecer sugerencias de linea o de funcion con latencia baja, integrandose en extensiones que hablen con un servidor llama.cpp.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede producir casos de prueba en el mismo lenguaje; es adecuado para pipelines de CI donde se quiera un primer borrador de tests que luego revise un humano.
- Documentacion automatica de funciones y modulos: el modelo puede generar docstrings y comentarios explicativos a partir de firmas y cuerpos de funciones, una tarea donde el contexto necesario es corto y el coste de un error es bajo.
- Asistente de codigo en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, es util para entornos de desarrollo sin acelerador dedicado o para prototipos en dispositivos edge.
- Explicacion de fragmentos de codigo y traduccion entre lenguajes: el modelo puede reescribir un fragmento de Python a JavaScript o explicar que hace una funcion, aprovechando su entrenamiento en codigo multilingue del modelo base.
- Evaluacion comparativa de cuantizaciones: el artefacto esta pensado como una de las 12 configuraciones del estudio de Behavioral Report Cards, por lo que su uso natural en investigacion es medir el impacto de la cuantizacion mixta sobre tareas de HumanEval+ y MBPP y comparar con las otras configuraciones del estudio.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del estudio Behavioral Report Cards, medidos sobre una matriz de 12 configuraciones por 80 tareas (40 de desarrollo de HumanEval+ y 40 de MBPP). No son benchmarks estandar del modelo base, sino resultados de seleccion de configuracion:

| Metrica | Valor |
|---|---|
| Mejor configuracion fija (matriz 12x80) | 49/80 |
| Mejor pareja (`mx2_aq6_q3ks` + `mx_q3km_code_gateup_q4k_plus`) | 56/80 |
| Union oracle de las 12 configuraciones | 58/80 |
| Cabecera exacta de pass-set | 10 bytes |
| Mejor pareja en matriz heldout 14x60 | 41/60 |
| Cabecera exacta en heldout | 8 bytes |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval completo, GSM8K, etc.) para esta cuantizacion concreta en la informacion disponible, y no deben extrapolarse los conteos anteriores como metricas absolutas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB o menos con la cuantizacion `mx2_aq6_q3ks` (750,3 MB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en estas ultimas el modelo estara infrautilizado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada.
- Ejecucion en CPU: viable y rapida por el tamano; llama.cpp puede ejecutarlo en CPU sin problemas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio. No se documenta soporte de vLLM ni TGI para este artefacto GGUF concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `AntonROSSO/qwen2.5-coder-1.5b-mx2-aq6-q3ks` | 1,54 B | no disponible | GGUF mixta (750 MB) | Apache-2.0 | Cuantizacion de investigacion con evidencia de pass-sets |
| `Qwen/Qwen2.5-Coder-1.5B-Instruct` | 1,54 B | 32.768 tokens (segun el modelo base; no confirmado en esta ficha) | safetensors | Apache-2.0 | Modelo original sin cuantizar; referencia de calidad |
| `Qwen/Qwen2.5-Coder-1.5B` (base) | 1,54 B | 32.768 tokens (segun el modelo base) | safetensors | Apache-2.0 | Variante no instruida, para fine-tuning |
| Otras cuantizaciones GGUF del mismo modelo base (p. ej. Q4_K_M) | 1,54 B | depende del runtime | GGUF | Apache-2.0 | Alternativas estandar de llama.cpp; no se dispone de comparacion de rendimiento en esta informacion |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada; la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La model card advierte explicitamente de que la seleccion exacta de pass-sets no se transfiere entre particiones, matrices de tareas, conjuntos de tareas ni familias de modelos; los conteos de aciertos deben interpretarse como evidencia sobre las matrices observadas, no como un ranking general.
- El modelo declara unicamente ingles como idioma soportado; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a un modelo de 1,5 B de parametros: puede generar APIs inexistentes, firmas incorrectas o codigo que compila pero no hace lo esperado.
- La cuantizacion mixta agresiva (`mx2_aq6_q3ks`) puede degradar la calidad respecto al modelo base en tareas distintas de las evaluadas; no se documenta una evaluacion de regresion fuera de HumanEval+ y MBPP.
- Licencia Apache-2.0: permite uso comercial, pero se heredan las obligaciones de atribucion y aviso de licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y proviene de un autor individual, no de la organizacion Qwen; conviene verificar la integridad del GGUF antes de usarlo en produccion.
- No se documenta soporte de tool calling ni de modo de razonamiento, por lo que no es adecuado para pipelines de agentes que dependan de function calling estructurado.
- El contexto maximo efectivo de esta cuantizacion no se especifica; asumir el del modelo base sin verificar puede provocar truncamientos silenciosos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AntonROSSO/qwen2.5-coder-1.5b-mx2-aq6-q3ks
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Evidencia publica del estudio: https://github.com/antonrosso34-maker/behavioral-report-cards (main `461e7eb`)
- Paper del estudio: `paper/PAPER_DRAFT_V12.md` (referenciado en la model card, no enlazado publicamente)
- Ensayo: `paper/ESSAY_DRAFT_V1.md` (referenciado en la model card, no enlazado publicamente)
