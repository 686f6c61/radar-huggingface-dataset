# sartajbhuvaji/bonsai-distilled-depth12-experts80-lora-vs-baseline-3k-warmup450-lr1e4-best

## Resumen

El modelo `sartajbhuvaji/bonsai-distilled-depth12-experts80-lora-vs-baseline-3k-warmup450-lr1e4-best` es un checkpoint de generacion de texto publicado en HuggingFace por Sartaj Bhuvaji, ingeniero de machine learning. Se trata de un modelo derivado de la familia Qwen3 con arquitectura de mezcla de expertos (MoE), segun la etiqueta `qwen3_moe` del repositorio, con 9.459.231.744 parametros totales confirmados por los archivos safetensors y un tamano de repositorio de 18,9 GB. El identificador sugiere un experimento de destilacion sobre una variante podada o reducida del modelo base, con 12 capas y 80 expertos, comparando una configuracion con LoRA frente a una linea base.

La relevancia de este checkpoint es fundamentalmente experimental: su nombre indica un barrido de hiperparametros (3.000 pasos, 450 de calentamiento, tasa de aprendizaje 1e-4) y una seleccion del mejor resultado ("best") dentro de una comparativa entre tecnicas de ajuste. No es un modelo listo para produccion en el sentido habitual, sino un artefacto de investigacion publicado sin model card util (la tarjeta es la plantilla automatica de HuggingFace sin rellenar), sin licencia declarada y sin idiomas especificados.

En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 "likes", y no se ha publicado informacion sobre datos de entrenamiento, evaluacion o configuracion de inferencia. Cualquier dato no confirmado en esta ficha se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (transformer con mezcla de expertos), segun la etiqueta `qwen3_moe` del repositorio; numero de capas y expertos no confirmado en documentacion (el identificador apunta a 12 capas y 80 expertos) |
| Parametros totales | 9.459.231.744 (dato de los archivos safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es la etiqueta `qwen3_moe`, que situa el modelo dentro de la familia Qwen3 con capas de mezcla de expertos. El nombre del checkpoint (`depth12-experts80`) sugiere una configuracion concreta de 12 capas y 80 expertos, presumiblemente una variante reducida del modelo base sobre la que se aplica destilacion. El sufijo `lora-vs-baseline` indica que el artefacto forma parte de una comparacion entre un ajuste con LoRA y una linea base, y `3k-warmup450-lr1e4-best` corresponde a los hiperparametros del entrenamiento (3.000 pasos, 450 pasos de calentamiento, tasa de aprendizaje 1e-4) y a la seleccion del mejor checkpoint. Todos estos extremos se deducen del identificador y no estan documentados en la model card, que es la plantilla automatica de HuggingFace sin contenido.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, enrutado de expertos afinado, etc.). El unico paper referenciado en las etiquetas, `arxiv:1910.09700`, corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citado por la plantilla de HuggingFace y no relacionado con la arquitectura del modelo.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, por lo que el modelo esta orientado a dialogos de varios turnos.
- Compatibilidad con la libreria transformers: el repositorio usa `library_name: transformers` y esta marcado como `endpoints_compatible`, lo que permite desplegarlo mediante Inference Endpoints.
- Soporte de tool calling o function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking" o razonamiento explicito: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades de vision o audio: no disponible; las etiquetas no incluyen modalidades adicionales.
- Conocimiento de codigo y matematicas: no disponible, aunque es habitual en la familia Qwen3; no se puede confirmar para este checkpoint.

## Casos de uso

- Experimentacion academica con destilacion de modelos MoE: el checkpoint esta pensado como evidencia de un barrido de hiperparametros (LoRA frente a linea base), por lo que su uso natural es reproducir o auditar ese experimento en un entorno de investigacion.
- Punto de partida para ajuste fino propio: al ser un modelo de ~9,46B parametros con pesos en safetensors, se puede cargar con transformers y aplicar SFT o LoRA sobre dominios concretos antes de llevarlo a produccion.
- Generacion de texto conversacional en prototipos: puede integrarse en demos internas de chat multi-turno, asumiendo que el contexto maximo real se determine empíricamente porque no esta documentado.
- Evaluacion comparativa de arquitecturas MoE: sirve como referencia de un modelo con 12 capas y 80 expertos para medir el efecto del enrutado disperso frente a variantes densas del mismo tamano.
- Servicio mediante endpoints compatibles: al estar etiquetado como `endpoints_compatible`, se puede desplegar en plataformas de inferencia gestionada (por ejemplo FriendliAI, que ya lista una variante similar) para pruebas de latencia.
- Base para investigacion sobre eficiencia de inferencia: con 9,46B parametros totales y pesos de ~18,9 GB en precision de 16 bits, es un candidato razonable para estudiar tecnicas de cuantizacion y offloading.
- Filtrado o generacion de datos sinteticos en pipelines internos: siempre que se asuma el riesgo de alucinacion y la ausencia de licencia clara, puede emplearse con supervision humana para generar borradores de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye la seccion de evaluacion rellenada y no se han encontrado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la busqueda realizada.

## Requisitos de hardware

- VRAM para inferencia en precision de 16 bits: aproximadamente 19 GB solo para los pesos (18,9 GB de repositorio), mas la memoria de la cache KV, cuyo tamano depende de la longitud de contexto y del numero de expertos activos (no disponible).
- VRAM en cuantizacion de 8 bits: en torno a 10-11 GB para los pesos, mas cache KV.
- VRAM en cuantizacion de 4 bits: en torno a 5-6 GB para los pesos, mas cache KV; requiere generar los pesos cuantizados, ya que el repositorio solo distribuye safetensors.
- GPU recomendadas: A100 (40 o 80 GB), H100 (80 GB) y L40S (48 GB) para servir en 16 bits con contexto amplio; A10G (24 GB) o L4 (24 GB) para despliegues en 8 o 4 bits.
- GPU de consumo: si, es plausible en una RTX 4090 o RTX 3090 (24 GB) en 16 bits con contexto corto, y holgado en 4 bits; en tarjetas de 12-16 GB requeriria cuantizacion de 4 bits y contexto reducido. Estas estimaciones son calculos a partir del numero de parametros, no resultados medidos publicados por el autor.
- Opciones de despliegue: transformers (soporte nativo declarado), Inference Endpoints y plataformas compatibles con la API de endpoints; vLLM, llama.cpp, Ollama o TGI no estan confirmados por el autor, y llama.cpp/Ollama requeririan conversion a GGUF, que no se distribuye.
- Latencia y throughput: no disponible. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se limita a la categoria de modelos abiertos de ~8-10B parametros y a las alternativas MoE equivalentes. Los datos de los modelos de referencia proceden de informacion publica de sus respectivos repositorios y no de este repositorio, que no publica evaluacion alguna.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bonsai-distilled-depth12-experts80-lora (este modelo) | 9,46B | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen3-8B | 8,2B | no aplica (denso) | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado |

No disponible comparacion de rendimiento, ya que este checkpoint no publica resultados de benchmarks. La comparacion con los modelos Qwen3 citados debe tomarse solo como referencia de categoria y no como una equivalencia funcional verificada.

## Limitaciones y advertencias

- Ausencia de model card: la tarjeta es la plantilla automatica de HuggingFace sin rellenar, por lo que no hay informacion sobre uso previsto, datos de entrenamiento ni limitaciones declaradas por el autor.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial; en la practica, la ausencia de licencia impide asumir permisos de redistribucion o explotacion en produccion.
- Idiomas no declarados: no se puede garantizar el rendimiento en castellano ni en ningun otro idioma concreto.
- Contexto desconocido: se desconoce la ventana de contexto efectiva, lo que impide dimensionar la cache KV y planificar despliegues con precisión.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, por lo que el modelo puede generar contenido incorrecto o inventado sin que exista una medida conocida de ese riesgo.
- Sesgos: no disponibles; al derivar presumiblemente de un modelo base de gran escala, heredaria los sesgos de sus datos de entrenamiento, que no se documentan.
- Modelo de investigacion: con 0 descargas y 0 "likes", no existe evidencia de uso en produccion, ni reportes de la comunidad sobre fallos, rendimiento o estabilidad.
- Parametros activos desconocidos: en un MoE, el coste real de inferencia depende del numero de expertos activados por token; sin ese dato no se puede estimar el throughput.
- Fecha de creacion inusual (2026-10-09 segun el repositorio): conviene verificar la vigencia y el estado del repositorio antes de integrarlo en cualquier flujo de trabajo.
- Sin pesos cuantizados publicados: cualquier despliegue en 4 u 8 bits exige generar y validar la cuantizacion por cuenta propia, con el riesgo de degradacion que ello implica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth12-experts80-lora-vs-baseline-3k-warmup450-lr1e4-best
- Pagina del mismo checkpoint en FriendliAI: https://friendli.ai/models/sartajbhuvaji/bonsai-distilled-depth12-experts80-vs-baseline-3k-warmup450-lr1e4-best
- Variante relacionada en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-aggressive-vs-baseline-3k-warmup450-lr1e4-best
- Variante relacionada en HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-aggressive-vs-baseline-3k-warmup450-lr1e4
- Perfil de GitHub del autor: https://github.com/SartajBhuvaji
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=SAu33LIAAAAJ&hl=en
- Paper referenciado en las etiquetas (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
