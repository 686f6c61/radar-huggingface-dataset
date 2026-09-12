# Miguel750/BlackDolphin-12B-Q6_K-GGUF

# BlackDolphin-12B-Q6_K-GGUF

## Resumen
BlackDolphin-12B-Q6_K-GGUF es una cuantizacion en formato GGUF del modelo Naphula/BlackDolphin-12B, publicada por el usuario Miguel750. El repositorio no aporta un modelo nuevo: es una conversion de pesos realizada con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, pensada para ejecutar el modelo original en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otros motores compatibles con GGUF.

El modelo subyacente tiene 12.247.782.400 parametros (unos 12,25 mil millones) y el repositorio ocupa 10,1 GB, coherente con la cuantizacion Q6_K. Las etiquetas del repositorio (mergekit, merge, mistral, nemo, llama-cpp) indican que el modelo original se obtuvo como fusion de modelos, probablemente sobre una arquitectura de la familia Mistral NeMo, aunque esto no se confirma en la informacion disponible.

Su relevancia es practica: permite desplegar un modelo de ~12B con calidad cercana a la precision completa en una unica GPU de 24 GB o en un Mac con memoria unificada suficiente, sin depender de APIs externas. La contrapartida es que se trata de un repositorio sin descargas, sin licencia declarada y sin resultados de evaluacion publicados, por lo que su idoneidad para produccion debe validarse antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repo sugieren familia Mistral NeMo; no confirmado) |
| Parametros totales | 12.247.782.400 (~12,25 B) |
| Parametros activos | no aplica (no hay indicios de ser MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q6_K (unico archivo publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`blackdolphin-12b-q6_k.gguf`, ~10,1 GB) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. La model card de este repositorio se limita a indicar que los pesos se convirtieron desde Naphula/BlackDolphin-12B con llama.cpp y remite a la model card original para mas detalles. Las etiquetas `mergekit` y `merge` apuntan a que el modelo base es el resultado de una fusion de modelos, y las etiquetas `mistral` y `nemo` sugieren una arquitectura derivada de Mistral NeMo, pero ninguna de estas dos afirmaciones esta confirmada por el autor en la informacion disponible.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El proceso documentado es exclusivamente de conversion de formato: cuantizacion a Q6_K mediante el espacio GGUF-my-repo, sin reentrenamiento ni ajuste posterior.

## Capacidades
- Generacion de texto conversacional: el modelo esta pensado para inferencia de texto; la model card incluye ejemplos de prompt de continuacion.
- Capacidades especificas (razonamiento, codigo, matematicas): no disponibles; no hay evaluaciones ni descripcion funcional en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el repositorio no declara ninguna.
- Inferencia local con llama.cpp: verificada por los ejemplos de uso del propio autor (`llama-cli` y `llama-server` con `-c 2048`).

## Casos de uso
- Asistente local sin conexion: al ser un GGUF Q6_K de ~10,1 GB, puede ejecutarse en un portatil o torre con GPU de 16-24 GB sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad estrictos.
- Generacion de texto y borradores internos: redaccion de correos, resumenes y documentacion tecnica dentro de una intranet, siempre que se valide previamente la calidad del merge, que no esta evaluada.
- Base para RAG local: integrable en pipelines de recuperacion aumentada mediante `llama-server`, que expone una API compatible con OpenAI y permite conectar el modelo a un indice vectorial propio. La ventana efectiva debe fijarse experimentalmente, ya que el contexto maximo no esta documentado.
- Laboratorio de investigacion sobre merges: util para reproducir y comparar el efecto de la fusion de modelos que da origen a BlackDolphin-12B frente a sus componentes, ya que el formato GGUF facilita el despliegue rapido en distintas maquinas.
- Evaluacion comparativa de cuantizaciones: el Q6_K permite medir la perdida de calidad frente a los pesos originales en fp16/bf16 y decidir si merece la pena una cuantizacion menor (Q4_K_M, Q5_K_M) para ahorrar VRAM.
- Prototipado de aplicaciones de chat en escritorio: LM Studio, Ollama o llama.cpp permiten levantar una interfaz conversacional en minutos, sin necesidad de infraestructura de servidor.
- Traduccion o asistencia linguistica: posible en principio, pero no recomendable sin antes verificar el soporte real de idiomas, que el repositorio no declara.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo original en precision completa.

## Requisitos de hardware
- VRAM estimada para inferencia: el archivo Q6_K ocupa 10,1 GB; con cache KV para 2.048 tokens y margen de trabajo, se recomienda reservar entre 11 y 13 GB. A contextos de 8.192 tokens o superiores, la cache KV crece de forma lineal y puede anadir varios GB adicionales (la cifra exacta depende de una arquitectura no confirmada).
- GPU recomendadas: NVIDIA RTX 3090 o RTX 4090 (24 GB) para un uso comodo con contexto amplio; A100 40 GB, H100 o L40S para despliegue multiusuario.
- GPU de 16 GB (RTX 4080, 4060 Ti 16 GB, A4000): cabe el modelo, pero con contexto limitado; conviene vigilar el consumo de la cache KV.
- GPU de 12 GB o menos: no cabe el Q6_K. Seria necesario recurrir a cuantizaciones Q4_K_M o Q5_K_M del modelo base, que no estan publicadas en este repositorio.
- Mac con memoria unificada: viable con 16 GB o mas de RAM unificada, usando Metal a traves de llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante Modelfile, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI solo con soporte experimental de GGUF; lo habitual es convertirlo a safetensors para esos motores.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares
No se dispone de datos suficientes para establecer una comparativa rigurosa: el repositorio no incluye benchmarks, no declara licencia y no documenta la arquitectura del modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| BlackDolphin-12B-Q6_K-GGUF | 12,25 B | no disponible | no disponible | GGUF en HuggingFace | no disponibles |
| Alternativas de ~12B comparables | no disponible | no disponible | no disponible | no disponible | no disponibles |

No se han identificado en la informacion proporcionada alternativas concretas con las que comparar de forma verificable.

## Limitaciones y advertencias
- Ausencia total de evaluaciones: no hay benchmarks que respalden la calidad del merge que da origen al modelo.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial. Hay que consultar la model card de Naphula/BlackDolphin-12B antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de datos de alineacion documentados.
- Idiomas: el repositorio no declara idiomas soportados; no se debe asumir un buen rendimiento en castellano sin pruebas.
- Contexto: la ventana maxima no esta documentada y el ejemplo del autor usa solo 2.048 tokens. Configurar valores mas altos sin verificar puede degradar la calidad o agotar la VRAM.
- Fusion de modelos: los merges pueden heredar sesgos y comportamientos erraticos de sus componentes, y suelen presentar una alineacion mas debil que los modelos instruidos de forma explicita.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-12) es posterior a la fecha actual, lo que sugiere un error en los metadatos del repositorio y obliga a tratar la trazabilidad con cautela.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Reproducibilidad: al no publicarse la receta de merge ni los componentes exactos, no es posible auditar como se genero el modelo base.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/Miguel750/BlackDolphin-12B-Q6_K-GGUF
- Modelo base: https://huggingface.co/Naphula/BlackDolphin-12B
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
