# Brian6145/Qwen3.8-27B-Imatrix-Mtp-1m

## Resumen

Qwen3.8-27B-Imatrix-Mtp-1m es una conversión a GGUF del modelo Qwen3.8-27B de Alibaba, preparada por el usuario Brian6145, que amplía la ventana de contexto nativa de 262 144 tokens hasta 1 millón de tokens mediante la técnica YaRN (receta oficial de Qwen) e incorpora una cabeza de Multi-Token Prediction (MTP) verificada para decodificación especulativa en llama.cpp y LM Studio. El modelo base es multimodal (texto e imagen) y está diseñado para tareas de agente, razonamiento y generación de código.

La relevancia de este build reside en que ofrece una ventana de contexto extremadamente larga en formato GGUF, apta para ejecución local en hardware de consumo con cuantización, y con un head MTP que acelera la generación de texto hasta un 81 % en contextos largos, según las mediciones del autor. Es una opción práctica para desarrolladores que necesitan procesar documentos extensos o mantener conversaciones de larga duración sin perder rendimiento.

El repositorio incluye seis archivos GGUF (F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M), todos con el head MTP integrado y los tensores no MTP bit-idénticos a los pesos originales de HuggingFace. La licencia es Apache-2.0, lo que permite uso comercial y modificación sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) con visión integrada, MTP head, YaRN para contexto largo |
| Parametros totales | 27B (nominal, segun el modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1 000 000 tokens (extendido desde 262 144 nativos via YaRN estatico) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (imatrix), Q3_K_M |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors originales convertidos) |

Nota: el dato de parametros totales extraido de HuggingFace (460 730 096) parece un error de metadata; el modelo se denomina 27B y el modelo base Qwen/Qwen3.8-27B tiene 27 mil millones de parametros.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con un codificador de vision integrado, lo que permite procesar tanto texto como imagenes. La arquitectura original incluye mecanismos de atencion por ventanas y soporte nativo para herramientas (tool calling) y agentes reactivos. El build GGUF de Brian6145 mantiene esa arquitectura y le aplica dos modificaciones: la extension de contexto a 1M mediante YaRN estatico (factor 4.0, theta 10 000 000, partial_rotary_factor 0.25) y la incorporacion de un head MTP (blk.64) para decodificacion especulativa. El head MTP se ha verificado en llama.cpp (build b10252) y LM Studio 2.28.2, con tasas de aceptacion de borrador del 50,8 % al 56,1 % en Q4_K_M, similares a las de los GGUF oficiales de unsloth.

La conversion a GGUF ha respetado los pesos originales (los tensores no MTP son bit-idénticos a la fuente, salvo cuantizacion). El autor advierte de una peculiaridad en la conversion: los pesos RMSNorm en HuggingFace se almacenan como offset respecto a 1.0, mientras que llama.cpp espera el valor absoluto; el head MTP contiene 7 tensores de este tipo que deben sumar 1.0 al convertir manualmente, cosa que este repositorio ya hace correctamente.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base (datos, tokens, RLHF o DPO). El autor solo indica que el modelo base fue publicado por el equipo Qwen y que este build se limita a la conversion y extension de contexto.

## Capacidades

- Generacion de texto, razonamiento y codigo en ingles y chino.
- Entrada de imagenes (vision) gracias al codificador visual integrado.
- Modo thinking (pensamiento) por defecto, con parametros de sampling especificos (temperature 1.0, top_p 0.95) y modo instruct/no-thinking (temperature 0.7, top_p 0.80, presence_penalty 1.5).
- Soporte de tool calling y agentes reactivos (modo agent, etiqueta react).
- Decodificacion especulativa mediante MTP (Multi-Token Prediction) con cabezal integrado, acelerando la generacion en contextos largos.
- Ventana de contexto de 1M tokens, util para documentos extensos o conversaciones de larga duracion.

## Casos de uso

- Analisis de documentos extensos: el contexto de 1M permite procesar libros completos, informes anuales o codigo fuente de grandes repositorios sin fragmentar la entrada. Por ejemplo, un desarrollador puede cargar un repositorio completo de una aplicacion en una sola consulta y pedir una revision de seguridad.
- Agentes autonomos de largo horizonte: con la ventana de 1M y el soporte de agentes, el modelo puede ejecutar tareas multi-paso que requieren recordar decisiones anteriores a lo largo de cientos de miles de tokens. El autor recomienda asignar 262 144 tokens para razonamiento y 131 072 para la respuesta final dentro de la ventana.
- Asistente de soporte tecnico bilingue: dado su soporte de ingles y chino, puede atender conversaciones de atencion al cliente en ambos idiomas, manteniendo el historial completo de la interaccion.
- Analisis de imagenes y diagramas: al ser multimodal, puede interpretar capturas de pantalla, diagramas de arquitectura o estados de interfaz, y responder preguntas sobre ellos. En la conversion de pearsonkyle se recomienda emparejarlo con el mmproj correspondiente.
- Generacion de codigo con contexto de repositorio: al cargar multiples archivos fuente en la misma consulta, puede generar cambios coherentes o explicar el funcionamiento de un sistema completo.
- Investigacion academica: revision de articulos largos, extraccion de informacion de multiples documentos y resumen de corpus en ingles o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona mediciones de rendimiento de decodificacion especulativa con el head MTP, realizadas en una NVIDIA RTX PRO 6000 Blackwell con llama.cpp b10252 y LM Studio 2.28.2, a temperatura 0.7 y 400 tokens generados:

| Metrica | Valor |
|---|---|
| Tasa de aceptacion de borrador (Q4_K_M) | 50,8 % / 56,1 % (dos ejecuciones) |
| Tasa de aceptacion en prompts faciles (temp=0) | hasta 77 % |
| Velocidad sin MTP (Q4_K_M, contexto 256 tok) | 63,7 tok/s |
| Velocidad con MTP (contexto 256 tok) | 79,6 tok/s (+25 %) |
| Velocidad con MTP (contexto 64K) | 89,8 tok/s (+81 %) |

La velocidad con MTP se mantiene plana incluso con contexto largo, mientras que la generacion sin MTP se degrada al aumentar la ventana.

## Requisitos de hardware

- Para el archivo Q4_K_M (~16 GB de pesos), se necesita una GPU con al menos 16 GB de VRAM para contextos moderados (hasta 32K) y con cuantizacion KV cache (q8_0) para contextos mayores.
- El contexto completo de 1M requiere una cantidad significativa de VRAM para la KV cache; el autor recomienda cuantizar la KV cache a q8_0 y usar flash attention. En sus pruebas utilizo una RTX PRO 6000 Blackwell (48 GB).
- Para contextos de 64K o menos, una GPU de 24 GB (RTX 4090, RTX 4000 Blackwell) puede ser suficiente con cuantizacion Q4_K_M y KV cache cuantizada.
- Despliegue: llama.cpp (con la opcion --spec-type draft-mtp), LM Studio 2.28.2 o superior, y otros motores compatibles con GGUF. Tambien se ha reportado soporte dia 0 en AMD Ryzen AI Max y Radeon via LM Studio.
- Para cuantizaciones mas altas (Q8_0, F16) se necesita mas VRAM; F16 requiere alrededor de 54 GB solo para pesos.

## Comparativa con modelos similares

| Modelo | Contexto | MTP | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (oficial HF) | 262144 | no | safetensors | Apache-2.0 | Modelo base, sin extension de contexto |
| Qwen3.8-27B-Imatrix-Mtp-1m (este repo) | 1M | si, verificado | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M | Apache-2.0 | Extension YaRN + MTP integrado |
| pearsonkyle/Qwen3.8-27B-imatrix-MTP-GGUF | 262144 | si | GGUF (varias) | Apache-2.0 | Incluye vision tower separada (mmproj) |
| Qwen3.8-27B de unsloth | 262144 | si | GGUF | Apache-2.0 | Referencia de rendimiento MTP |

La principal diferencia con el modelo oficial es la ventana de contexto de 1M y la inclusion del MTP en todos los archivos. Frente a pearsonkyle, este repo ofrece el head MTP embebido y el contexto extendido, mientras que pearsonkyle proporciona un mmproj separado para vision. No se dispone de comparaciones de calidad de generacion.

## Limitaciones y advertencias

- El YaRN es estatico: el factor de escala se aplica constantemente, lo que puede degradar ligeramente el rendimiento en textos cortos. Para tareas con contexto menor a 262144 tokens, se recomienda el modelo oficial.
- Solo soporta ingles y chino; no hay soporte multilingue mas alla de estos dos idiomas.
- El MTP requiere una build de llama.cpp con soporte de decodificacion especulativa (build b10252 o superior) y LM Studio 2.28.2+. En versiones anteriores no funcionara.
- La ventana de 1M exige una VRAM considerable; sin cuantizacion de KV cache y GPU de 48 GB o mas, no es utilizable en la practica.
- El modelo base puede presentar sesgos y alucinaciones, como cualquier LLM. No se han publicado evaluaciones de seguridad o sesgos especificos para este build.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener restricciones adicionales en su uso; se recomienda revisar la licencia del modelo original.
- El head MTP se ha verificado en el hardware especifico del autor; puede haber variaciones en otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Brian6145/Qwen3.8-27B-Imatrix-Mtp-1m
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte dia 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Repositorio alternativo con MTP y vision: https://huggingface.co/pearsonkyle/Qwen3.8-27B-imatrix-MTP-GGUF
- Guia de ejecucion local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Discusion en foros NVIDIA sobre NVFP4 y MTP: https://forums.developer.nvidia.com/t/qwen3-8-27b-at-256k-on-a-24-gb-blackwell-target-gpu-imatrix-nvfp4-mtp-55-4-tok-s/380456
