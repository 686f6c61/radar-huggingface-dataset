# AtomGradient/Qwen3.5-2B-Chronos-4bit

## Resumen

Qwen3.5-2B-Chronos-4bit es un paquete de modelo derivado de Qwen3.5-2B publicado por AtomGradient bajo el marco que el autor denomina "Chronos", orientado al aprendizaje continuo en dispositivo (on-device continual learning). El repositorio contiene pesos en formato MLX cuantizados a 4 bits, con 1.881.825.088 parámetros totales y un tamaño de repositorio de 1,1 GB, lo que lo sitúa en la franja de modelos pequenos aptos para ejecución local en hardware Apple Silicon.

La particularidad tecnica del paquete es la aplicacion de una transformacion de pesos denominada `fa_only_row_permutation_v1`, que permuta las filas de salida de las proyecciones de Full-Attention. Segun la model card, esta permutacion es una biyeccion sin perdida (0-ULP) que puede revertirse de forma exacta mediante un kernel de desbloqueo especifico del runtime del autor, de modo que la inferencia autorizada recupera las proyecciones originales del modelo upstream en 4 bits.

El modelo es relevante como ejemplo de empaquetado de pesos con control de acceso a nivel de runtime: la model card declara que la inferencia sin el "Chronos V9 Native Runtime" y sin un lease `ModelUnlockEnvelope v1` vinculado al dispositivo no esta soportada. La informacion publica disponible es muy limitada (sin benchmarks, sin idiomas declarados y sin detalle del dataset de entrenamiento), por lo que esta ficha se limita a lo verificable en el repositorio y en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`); detalles de capas y atencion no disponibles |
| Parametros totales | 1.881.825.088 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

El paquete se basa en Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5, del que no se detallan en la informacion disponible el numero de capas, la configuracion de atencion ni la ventana de contexto. Los pesos se distribuyen en formato MLX cuantizados a 4 bits, con 1.881.825.088 parametros y un repositorio de 1,1 GB, coherente con un modelo de aproximadamente 2.000 millones de parametros en 4 bits.

La innovacion declarada por el autor no esta en el entrenamiento del modelo base sino en el empaquetado y control de acceso de los pesos. La transformacion `fa_only_row_permutation_v1` permuta las filas de salida de las proyecciones de Full-Attention; el runtime autorizado aplica la permutacion inversa y restaura las proyecciones upstream de forma bit-exacta (0-ULP), mientras que la inferencia sin ese kernel no esta soportada. La model card indica ademas que no se incorporan pesos estaticos de "abliteration" de PII (`enable_online_pii_abliteration_default = 0`), lo que sugiere que el filtrado de datos personales se delega al runtime en linea en lugar de hornearse en los pesos. No se dispone de informacion sobre volumen de tokens, composicion del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento en el modelo base.

## Capacidades

- Generacion de texto y conversacion (`pipeline_tag: text-generation`, tag `conversational`).
- Aprendizaje continuo en dispositivo, segun el marco Chronos del autor (tag `continual-learning`).
- Ejecucion local en hardware Apple Silicon mediante MLX.
- Restauracion bit-exacta de pesos mediante runtime autorizado con lease vinculado al dispositivo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas aparece como no disponible).
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de generacion de texto en local sobre Apple Silicon: el paquete MLX 4-bit de 1,1 GB permite cargar un modelo de ~1,88 mil millones de parametros en un Mac con memoria unificada moderada y ejecutar inferencia sin GPU dedicada.
- Investigacion sobre aprendizaje continuo en dispositivo: el marco Chronos y el tag `continual-learning` apuntan a escenarios donde el modelo se adapta en el propio dispositivo; util para experimentar con actualizaciones locales de pesos y evaluar su impacto.
- Evaluacion de esquemas de proteccion de pesos: la permutacion `fa_only_row_permutation_v1` con restauracion 0-ULP sirve como caso de estudio para estudiar tecnicas de control de acceso a modelos sin perdida de calidad numerica.
- Integracion en aplicaciones de escritorio macOS con MLX: al usar `library_name: mlx`, encaja en pipelines de inferencia nativos de Apple que ya consumen modelos MLX.
- Experimentacion con privacidad en inferencia: la ausencia de ablitation estatica de PII y la dependencia de un runtime con filtrado en linea permiten estudiar arquitecturas donde el control de datos personales se aplica en tiempo de ejecucion.
- Docencia y pruebas de concepto de empaquetado de modelos: el repositorio, pequeno y con licencia Apache 2.0, es util para ilustrar como se estructura un paquete de pesos cuantizado con metadatos de runtime y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,1 GB de pesos en 4 bits, mas overhead de runtime y cache KV; el total depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: no disponible; el paquete esta orientado a MLX, es decir, a memoria unificada de Apple Silicon (familias M1/M2/M3/M4 y superiores), no a GPU CUDA.
- Compatibilidad con GPU de consumo: si cabe en equipos Apple Silicon con memoria unificada suficiente; no se documenta soporte para RTX 4090, A100 o H100 a traves de este repositorio.
- Opciones de despliegue: MLX con el Chronos V9 Native Runtime y un lease `ModelUnlockEnvelope v1` valido; la model card declara no soportada la inferencia sin el kernel de desbloqueo de Full-Attention. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AtomGradient/Qwen3.5-2B-Chronos-4bit | 1.881.825.088 | no disponible | MLX safetensors 4-bit | Apache 2.0 | Requiere runtime Chronos V9 y lease de dispositivo |
| Qwen3.5-2B (upstream) | ~2B (no confirmado en la informacion) | no disponible | no disponible | no disponible | Modelo base del que deriva este paquete |
| Alternativas de ~2B en 4 bits para MLX | no disponible | no disponible | MLX | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Dependencia de runtime propietario: la model card exige el Chronos V9 Native Runtime y un lease `ModelUnlockEnvelope v1` vinculado al dispositivo; sin ellos la inferencia no esta soportada, lo que limita la portabilidad y la reproducibilidad fuera del ecosistema del autor.
- Portabilidad restringida: los pesos estan en formato MLX, por lo que no son directamente utilizables en stacks CUDA habituales (vLLM, TGI) sin conversion, que ademas requeriria revertir la permutacion de Full-Attention.
- Falta de documentacion: no se publican idiomas, contexto, composicion del dataset ni resultados de benchmarks, lo que impide evaluar calidad, sesgos o rendimiento antes de desplegar.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de ~2B, es esperable un riesgo no despreciable, pero no hay evaluaciones publicadas que lo respalden.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Privacidad: la model card indica que no hay ablitation estatica de PII en los pesos (`enable_online_pii_abliteration_default = 0`), de modo que cualquier filtrado de datos personales depende del runtime en linea; en despliegues sin ese runtime no hay garantia de proteccion.
- Licencia: Apache 2.0 permite uso comercial, pero las restricciones tecnicas de runtime y la transformacion de pesos pueden condicionar la explotacion practica; conviene revisar los terminos del runtime Chronos, no incluidos en la informacion disponible.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-19; sin evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomGradient/Qwen3.5-2B-Chronos-4bit
- Perfil del autor: https://huggingface.co/AtomGradient
- Modelo base Qwen3.5-2B: no disponible en la informacion proporcionada
- Paper, blog o repositorio del runtime Chronos V9: no disponible en la informacion proporcionada
- Demos: no disponible en la informacion proporcionada
