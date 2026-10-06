# SecondLookResearch/Qwen2.5-72B-graft0-a1-terra3k-r3000-da-e1

## Resumen

Qwen2.5-72B-graft0-a1-terra3k-r3000-da-e1 es un adaptador LoRA (PEFT) publicado por el usuario SecondLookResearch sobre el modelo base Qwen/Qwen2.5-72B. No se trata de un modelo completo, sino de un artefacto de entrenamiento de segunda etapa dentro de un experimento que el autor denomina "cross-model stacked experiment" (CrossModelStackPlan.md). Concretamente, corresponde a la etapa de "difficult-advice" (da), entrenada durante 1 epoca sobre el dataset identificado como terra3k y con una configuracion etiquetada como r3000, partiendo de un adaptador previo congelado (Qwen2.5-72B-graft0-a1) que ya estaba fusionado sobre la base.

El interes de esta publicacion es fundamentalmente de investigacion: documenta una tecnica de apilado de adaptadores (stacking) en la que se sirven dos LoRA de forma secuencial sobre la misma base parcheada, primero A1 y despues este adaptador. El repositorio ocupa 3,4 GB y contiene pesos en formato safetensors bajo la libreria peft, con un rango de LoRA r64 y alpha 128 aplicado unicamente a capas lineales (linear-only). El numero de descargas (12) y de likes (0) indica que es un artefacto de baja difusion.

Al estar construido sobre Qwen2.5-72B, hereda las capacidades del modelo base, pero la model card no documenta evaluaciones, idiomas soportados ni licencia, por lo que cualquier uso en produccion requiere verificar de forma independiente el comportamiento real del adaptador. La relevancia actual es limitada fuera del contexto del experimento del autor, y debe tratarse como material reproducible de investigacion mas que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-72B |
| Parametros totales | Adaptador: no disponible; modelo base Qwen2.5-72B: ~72,7 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base Qwen2.5-72B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango de LoRA | r64 / alpha128, linear-only |
| Tamano del repositorio | 3,4 GB |
| Modelo base | Qwen/Qwen2.5-72B |
| Libreria | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 aplicado exclusivamente a capas lineales sobre Qwen2.5-72B. Segun la model card, se entrena como un adaptador nuevo (fresh adapter) sobre un A1 ya fusionado y congelado, dentro de lo que el autor llama la plataforma "graft0". La etapa corresponde a "difficult-advice", con el dataset terra3k y la configuracion r3000, durante 1 epoca. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores.

La innovacion tecnica que documenta el autor no esta en el adaptador en si, sino en el modo de servicio: el modelo debe desplegarse como dos adaptadores sobre la base parcheada, primero A1 y despues este, mediante el script `serve_reconstructed.sh` (con las variables `ROW_PATCH=1` y `ADAPTERS="<a1-repo> <this-repo>"`). No se detalla en la informacion proporcionada el mecanismo interno de "graft0", ni como se reconstruye la base parcheada, ni los resultados del apilado.

## Capacidades

- Generacion de texto: hereda las capacidades generativas del modelo base Qwen2.5-72B (no verificadas especificamente para este adaptador).
- Razonamiento y matematicas: el modelo base Qwen2.5-72B esta orientado a tareas de razonamiento, codigo y matematicas, pero no hay evaluacion especifica del adaptador en la informacion disponible.
- Codigo: capacidad esperable por herencia del modelo base; no documentada para este adaptador.
- Tool calling / function calling: no disponible para este adaptador (el base Qwen2.5 soporta function calling, pero no se confirma su preservacion tras el apilado).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: la model card no menciona modo de razonamiento explicito, vision ni audio; el proposito declarado es una etapa de "difficult-advice" dentro de un experimento de apilado de adaptadores.

## Casos de uso

- Reproduccion de investigacion en apilado de adaptadores: sirve para replicar el "cross-model stacked experiment" del autor, cargando los dos adaptadores secuencialmente sobre la base parcheada con el script proporcionado.
- Estudio de entrenamiento en etapas sobre modelos congelados: permite analizar como un adaptador nuevo (esta etapa) modifica el comportamiento de un adaptador previo ya fusionado (A1), un patron util en investigacion sobre continual learning.
- Analisis de la tecnica "graft0": el artefacto es un punto de partida para auditar que hace la plataforma graft0 y como afecta al rendimiento del modelo base.
- Experimentos de comportamiento "difficult-advice": dado el nombre de la etapa, puede emplearse para estudiar como un modelo responde ante peticiones de consejo dificiles o ambiguas, aunque no hay metricas publicadas.
- Base para comparativas de configuracion de LoRA: con r64 y alpha128 linear-only, sirve como referencia para experimentos que varian rango, alpha o capas objetivo (por ejemplo q/k/v frente a todas las lineales).
- Docencia y formacion tecnica: util para ilustrar en un aula o taller como se apilan adaptadores PEFT y como se sirven sobre una base reconstruida.
- Punto de partida para adaptaciones propias: un investigador podria continuar el entrenamiento desde este adaptador, aunque la ausencia de licencia publicada obliga a aclarar antes los terminos de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con el modelo base o con el adaptador A1.

## Requisitos de hardware

- VRAM para el modelo base en precision completa (fp16/bf16): aproximadamente 145-150 GB solo para pesos, mas memoria para el contexto y el runtime de atencion.
- VRAM con cuantizacion de 8 bits: aproximadamente 75-80 GB.
- VRAM con cuantizacion de 4 bits (GPTQ, AWQ, bitsandbytes): aproximadamente 40-45 GB, lo que exige GPUs profesionales o varias consumer agregadas.
- GPUs recomendadas: para fp16, multiples A100 80 GB o H100 80 GB (2-4 unidades); para 8 bits, una A100 80 GB o H100 80 GB; para 4 bits, una A100 40 GB o una configuracion multi-GPU con RTX 4090.
- Consumer GPU: no cabe en una unica RTX 4090 (24 GB) en 4 bits sin descarga a CPU; posible en configuraciones multigpu de 2x RTX 4090 24 GB solo en cuantizaciones muy agresivas y con penalizacion de latencia.
- Los adaptadores LoRA en si ocupan unos pocos GB (3,4 GB de repositorio) y se aplican sobre la base; no reducen los requisitos de memoria del modelo base.
- Opciones de despliegue: vLLM o TGI para servicio de alto rendimiento con soporte de adaptadores; llama.cpp u Ollama si se convierte a GGUF (no confirmado para este adaptador); el autor proporciona un script propio (`code/msm_eval/serve_reconstructed.sh`) para servir los dos adaptadores apilados sobre la base parcheada.
- Latencia y throughput: no disponibles. Dependen criticamente del hardware, la cuantizacion y de si se aplica el apilado de dos adaptadores en lugar de uno.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-72B-graft0-a1-terra3k-r3000-da-e1 | Adaptador LoRA (etapa 2) | Adaptador sobre 72,7B (base) | 131.072 (base) | no disponible | HuggingFace, 12 descargas |
| Qwen2.5-72B-graft0-a1 | Adaptador LoRA (etapa 1, A1) | Adaptador sobre 72,7B (base) | 131.072 (base) | no disponible | Repositorio referenciado por el autor |
| Qwen/Qwen2.5-72B | Modelo base completo | ~72,7 mil millones | 131.072 | Qwen (terminos propios) | HuggingFace, ampliamente difundido |
| Otros adaptadores PEFT sobre Qwen2.5-72B | Adaptadores LoRA | Variables | 131.072 (base) | Variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia publicada: no se especifica la licencia del adaptador, lo que impide determinar si se permite uso comercial; hay que consultar al autor antes de cualquier despliegue en produccion.
- Model card minima: no documenta idiomas, cuantizaciones, datos de entrenamiento ni evaluaciones, por lo que el comportamiento real es incierto.
- Riesgo de alucinacion: heredado del modelo base Qwen2.5-72B, sin evaluacion especifica tras el apilado de adaptadores.
- Sesgos: no documentados; el modelo base puede presentar sesgos de genero, cultura o idioma que este adaptador no corrige necesariamente.
- Dependencia de un procedimiento de servicio no estandar: requiere base parcheada, `ROW_PATCH=1` y dos adaptadores en orden concreto (A1 primero, despues este); un orden incorrecto o un script distinto puede degradar o romper el comportamiento.
- Artefacto de investigacion: con 12 descargas y 0 likes, no ha sido validado por la comunidad ni por terceros.
- Reproducibilidad limitada: no se publican detalles del dataset terra3k, de la configuracion r3000 ni del mecanismo graft0, lo que dificulta replicar el resultado.
- Uso en produccion desaconsejado sin evaluacion previa: al no haber benchmarks ni pruebas de robustez, no es adecuado como componente critico sin validacion propia.
- Fecha de publicacion inusual (2026-10-06 en metadatos): conviene verificar la autenticidad de los metadatos antes de confiar en ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-72B-graft0-a1-terra3k-r3000-da-e1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B
- Script de servicio referenciado en la model card: `code/msm_eval/serve_reconstructed.sh` (ruta relativa al repositorio del autor; no se proporciona URL directa)
- Adaptador A1 de la etapa previa: referenciado como `<a1-repo>` en la model card; no se facilita URL en la informacion disponible
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada (los resultados obtenidos corresponden a un fabricante de sistemas de seguridad y no guardan relacion con el modelo).
