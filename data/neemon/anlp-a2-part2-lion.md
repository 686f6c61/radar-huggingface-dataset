# neemon/anlp-a2-part2-lion

## Resumen

`neemon/anlp-a2-part2-lion` es un checkpoint de un transformer decoder-only entrenado desde cero por el usuario neemon para la asignatura Advanced NLP (IIIT-H, Monsoon 2026). El elemento diferenciador es el uso del optimizador Lion (sign momentum, eficiente en memoria) en lugar del habitual AdamW, dentro de un ejercicio academico de implementacion completa: arquitectura, bucle de entrenamiento y evaluacion viven en el repositorio de la asignatura, y este repositorio de HuggingFace contiene unicamente el checkpoint.

Con `d_model=512`, 8 capas, 8 cabezas y una ventana de contexto de solo 256 tokens, el modelo ronda los 58 millones de parametros si el `lm_head` no esta atado a los embeddings (unos 42 M si lo esta; el autor no publica el dato). El vocabulario declarado es de 32.000 entradas y el FFN es denso, pese a que la model card lleva el tag `mixture-of-experts`: la propia configuracion indica `n_routed_experts=0` y `n_shared_experts=0`, por lo que no existe enrutamiento MoE real.

El interes del artefacto es didactico y de investigacion: permite reproducir y auditar un pipeline completo de entrenamiento desde cero en un checkpoint pequeno, no un modelo listo para produccion. No se han publicado benchmarks, tokenizer, pesos en safetensors o GGUF ni codigo de carga mas alla de un `torch.load`, lo que limita su uso fuera del contexto de la asignatura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm, implementado desde cero |
| Parametros totales | ~58 M (estimacion a partir de la configuracion; no publicado; ~42 M si los embeddings estan atados) |
| Parametros activos | No aplica: FFN denso, `n_routed_experts=0`, `n_shared_experts=0`, `top_k=0` |
| Longitud de contexto | 256 tokens (`n_ctx`) |
| Tipos de cuantizacion | No disponible: solo se distribuye el checkpoint en precision de entrenamiento (fp32) |
| Idiomas soportados | `en`, `vi`, `ja` (segun la model card; sin datos de calidad por idioma) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch, serializado con `torch.save`); no hay safetensors ni GGUF |
| Dimension del modelo (`d_model`) | 512 |
| Numero de capas | 8 |
| Cabezas de atencion / KV | 8 / 8 (atencion multi-cabeza estandar, sin GQA) |
| Dimension del FFN (`d_ff`) | 2048 |
| Tamano de vocabulario | 32.000 |
| Normalizacion | RMSNorm |
| Optimizador | Lion |
| Tokens de entrenamiento | 43.021.354 tokens objetivo puntuados |
| Mejor perdida de validacion | 3,8859 |
| Mejor perplejidad de validacion | `nan` (no fiable) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 8 capas con `d_model=512`, 8 cabezas de atencion y 8 cabezas KV, es decir, atencion multi-cabeza estandar sin agrupacion de consultas. El FFN es denso con `d_ff=2048` y se aplica RMSNorm; el vocabulario es de 32.000 tokens. La configuracion publicada no especifica el esquema de codificacion posicional (RoPE, posicional aprendido u otro), por lo que ese detalle queda como no disponible. El tag `mixture-of-experts` de la model card no se corresponde con la configuracion real: al ser `n_routed_experts=0` y `n_shared_experts=0`, el modelo es puramente denso.

El entrenamiento se realizo desde cero (no hay destilado ni ajuste sobre un modelo previo) y el autor reporta 43.021.354 tokens puntuados, con una mejor perdida de validacion de 3,8859. No se documentan RLHF, DPO, SFT ni ninguna fase de alineacion posterior; el artefacto es un modelo base. La unica innovacion tecnica declarada es el uso de Lion, un optimizador que sustituye el momento por el signo del gradiente y reduce el estado del optimizador, lo que en un modelo de este tamano apenas cambia los requisitos de memoria pero si las curvas de convergencia. La perplejidad de validacion aparece como `nan`, lo que sugiere un error de calculo o un desbordamiento; aplicando `exp(3,8859)` se obtendria una perplejidad en torno a 48,7, un valor alto y coherente con un entrenamiento muy corto y un modelo pequeno.

## Capacidades

- Generacion de texto autoregresiva: completado de secuencias de hasta 256 tokens condicionado por un prefijo. Es la unica capacidad verificable con la informacion disponible.
- Modelo base sin ajuste por instrucciones: no hay evidencia de que siga instrucciones, mantenga formato de chat o respete system prompts.
- Traduccion: la model card lo etiqueta como tarea de traduccion y declara ingles, vietnamita y japones, pero no se aportan ejemplos ni metricas (BLEU, chrF) que confirmen calidad en ninguno de los pares.
- Tool calling / function calling: no disponible y sin indicios de soporte.
- Uso como agente o razonamiento multi-paso: no disponible; la ventana de 256 tokens y la ausencia de ajuste hacen inviable cualquier flujo agentico.
- Capacidades multilingues: declaradas `en`, `vi`, `ja`; sin evaluacion publicada ni tokenizer incluido para verificar la cobertura real.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.
- Estado interno accesible: al distribuirse el `state_dict` completo, permite extraer activaciones y matrices de atencion de las 8 capas para analisis de interpretabilidad.

## Casos de uso

- Comparacion de optimizadores en investigacion academica: el checkpoint permite contrastar la curva de perdida obtenida con Lion (mejor validacion 3,8859 sobre 43 M de tokens) frente a un entrenamiento equivalente con AdamW usando la misma arquitectura y el mismo corpus, con un coste de computo de minutos u horas en una sola GPU.
- Prueba de humo en pipelines de entrenamiento e inferencia: con menos de 250 MB en fp32, el modelo se carga y ejecuta en segundos, lo que lo hace util para validar bucles de entrenamiento distribuido, estrategias de checkpointing o integraciones de tokenizador antes de lanzar modelos de miles de millones de parametros.
- Ajuste fino para traduccion de dominio muy acotado: partiendo de los pares en-vi o en-ja declarados y con secuencias de 256 tokens como maximo, es un punto de partida para traducir titulares, asuntos de correo o etiquetas cortas, siempre que se construya un conjunto de validacion propio y se asuma una calidad base baja.
- Investigacion en interpretabilidad: 8 capas y 512 dimensiones hacen viable extraer todas las activaciones y patrones de atencion de todas las cabezas sin infraestructura dedicada, por ejemplo para estudiar como se organiza el conocimiento en redes pequenas entrenadas con optimizadores de signo.
- Prototipado de tokenizacion multilingue: el vocabulario de 32.000 entradas declarado sirve para ensayar pipelines de tokenizacion sobre texto en ingles, vietnamita y japones y medir coberturas, teniendo en cuenta que el tokenizer no se distribuye y hay que aportar uno compatible.
- Demostraciones docentes de decodificacion: generar continuaciones de menos de 256 tokens con estrategias greedy, top-k, top-p y temperatura permite ilustrar el efecto de cada parametro de muestreo con un modelo que cabe en cualquier portatil.
- Baseline de referencia en comparativas de arquitectura: con ~58 M de parametros, sirve como punto de partida para medir la mejora que aportan variantes como atencion lineal, MoE real o ventanas de contexto mayores entrenadas sobre el mismo corpus y el mismo presupuesto de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye dos metricas de entrenamiento, ninguna de ellas comparable con MMLU, HumanEval, GSM8K o cualquier suite estandar:

| Metrica | Valor |
|---|---|
| Tokens objetivo puntuados | 43.021.354 |
| Mejor perdida de validacion | 3,8859 |
| Mejor perplejidad de validacion | `nan` (calculo no fiable) |
| Perplejidad implicita (`exp(loss)`) | ~48,7 (calculo propio, no reportado por el autor) |
| Benchmarks de tareas (MMLU, HumanEval, GSM8K, BLEU, chrF) | No publicados |

## Requisitos de hardware

- Peso de los pesos en memoria: ~232 MB en fp32, ~116 MB en fp16/bf16, ~58 MB en int8 y ~29 MB en int4 (estimaciones sobre ~58 M de parametros).
- VRAM para inferencia: por debajo de 1 GB en todas las precisiones habituales, incluyendo cache KV y activaciones con lotes pequenos.
- Cache KV: aproximadamente 16 KB por token en bf16 (8 capas x 8 cabezas KV x 64 dimensiones de cabeza x 2 tensores), es decir, unos 4 MB para los 256 tokens de contexto.
- GPU recomendadas: cualquier GPU consumer sirve (GTX 1050 4 GB, RTX 3060, RTX 4090). No se necesita A100 ni H100; el modelo tambien se ejecuta en CPU sin problema.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas de los ultimos diez anos, e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama no soportan este checkpoint de forma directa, porque no hay safetensors, GGUF ni `config.json` con una arquitectura reconocida por las librerias. La unica via documentada es `torch.load("model.pt", map_location="cpu", weights_only=False)` junto con el codigo de arquitectura del repositorio de la asignatura, que no se distribuye aqui.
- Latencia y throughput: no disponibles. Como estimacion orientativa no medida, un modelo de ~58 M de parametros en una GPU consumer deberia generar del orden de decenas a cientos de tokens por segundo, y decenas de milisegundos por token en CPU en fp32.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas y de conocimiento general, no de la informacion proporcionada; conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos de pesos | Benchmarks |
|---|---|---|---|---|---|---|
| neemon/anlp-a2-part2-lion | ~58 M (estimado) | 256 | en, vi, ja | MIT | `model.pt` (PyTorch) | No publicados |
| GPT-2 small | 124 M | 1024 | en (principalmente) | MIT modificada | safetensors, GGUF, PyTorch | Publicados en su ficha |
| T5-small | ~60 M | 512 | en (principalmente) | Apache 2.0 | safetensors, PyTorch | Publicados en su ficha |
| Qwen2.5-0.5B | ~494 M | 32.768 | Multilingue (29 idiomas declarados) | Apache 2.0 | safetensors, GGUF | Publicados en su ficha |

La diferencia practica no esta tanto en el numero de parametros como en el ecosistema: los tres modelos alternativos se cargan con `transformers` en una linea, tienen tokenizer propio y versiones cuantizadas listas para llama.cpp u Ollama, mientras que este checkpoint exige el codigo de la asignatura y carece de tokenizer publicado. Frente a T5-small, con un tamano comparable, la desventaja es clara en contexto (256 frente a 512 tokens), en disponibilidad de tooling y en que T5 cuenta con variantes afinadas para traduccion con metricas publicas.

## Limitaciones y advertencias

- Inconsistencia en el etiquetado: la model card declara `mixture-of-experts`, pero la configuracion indica un FFN denso sin expertos enrutados. Cualquier comparacion basada en esa etiqueta seria erronea.
- Entrenamiento muy corto: 43 M de tokens para ~58 M de parametros equivale a unos 0,74 tokens por parametro, muy lejos de los ~20 tokens por parametro que sugiere la regla de Chinchilla (unos 1.100 M de tokens). Es previsible un ajuste muy pobre.
- Perplejidad de validacion `nan`: la unica metrica de calidad declarada no es utilizable, de modo que no existe una medida fiable del rendimiento del modelo.
- Contexto de 256 tokens: insuficiente para dialogo multi-turno, resumen de documentos o cualquier tarea que requiera memoria a medio plazo.
- Reproducibilidad incompleta: el repositorio solo contiene el checkpoint; sin tokenizer, sin `config.json` estandar y sin codigo de arquitectura no se puede reconstruir el modelo de forma autonoma.
- Riesgo de seguridad al cargar: la carga documentada usa `weights_only=False`, lo que implica deserializacion de pickle y ejecucion potencial de codigo arbitrario. No se deben cargar archivos `model.pt` de origen no confiable.
- Modelo base sin alineacion: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones y puede producir continuaciones incoherentes o inapropiadas sin filtro alguno.
- Alucinacion: con una perdida de validacion de 3,8859, la probabilidad de generar contenido facticamente incorrecto es alta; no debe usarse para responder preguntas factuales sin verificacion.
- Idiomas declarados sin evidencia: `en`, `vi` y `ja` figuran en la model card, pero no hay evaluacion por idioma ni tokenizer que permita comprobar el soporte real.
- Sesgos no evaluados: no se ha realizado ninguna evaluacion de sesgo, toxicidad o seguridad, algo esperable en un artefacto academico pero relevante si se plantea cualquier uso publico.
- Licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion, pero el estado del modelo lo hace inadecuado para produccion pese a la permisividad legal.
- Fechas sospechosas: el repositorio figura como creado el 14 de septiembre de 2026 y el curso como "Monsoon 2026", fechas posteriores a lo esperable; conviene tratar los metadatos con cautela.
- Ausencia de traccion: cero descargas y cero "likes" en el momento de la consulta, y ningun resultado de busqueda web relevante, por lo que no existe validacion externa del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neemon/anlp-a2-part2-lion
- Repositorio de la asignatura (arquitectura, entrenamiento y evaluacion): no enlazado en la informacion proporcionada.
- Paper del optimizador Lion: https://arxiv.org/abs/2302.06675 (referencia externa al modelo, no incluida en la informacion proporcionada).
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Las unicas entradas devueltas son paginas turisticas en neerlandes sobre la ciudad de Vancouver, sin relacion alguna con el modelo, su entrenamiento o su evaluacion.
