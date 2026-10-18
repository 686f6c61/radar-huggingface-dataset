# dealignai/Nemotron-3.5-Super-VL-120B-A12B-CYBER-NVFP4

## Resumen

Nemotron-3.5-Super-VL-120B-A12B-CYBER-NVFP4 es una distribución derivada del modelo multimodal de NVIDIA `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, publicada por el usuario `dealignai`. Se trata de una versión con el entrenamiento de rechazo eliminado (abliteration) y cuantizada a un GGUF mixto que combina expertos en NVFP4 con capas de atención y Mamba en Q8_0. El resultado es un único fichero de 73 GB (4,73 bits por peso) que conserva la torre de visión intacta y que puede ejecutarse con llama.cpp en hardware de 80 GB de VRAM.

La arquitectura subyacente es NemotronH, un híbrido de 88 bloques que combina 40 capas Mamba2, 40 capas de mezcla de expertos con compresión latente y solo 8 capas de atención completa. Con 123.611.033.088 parámetros totales y 12B activos por token (512 expertos enrutados, 22 activos por token, más 1 experto compartido), el modelo mantiene un coste de inferencia propio de un modelo denso de ~12B pese a su tamaño total. Soporta imagen y vídeo mediante una torre C-RADIO con proyector mlp1, y ofrece tres modos de razonamiento configurables mediante argumentos de plantilla de chat.

Su relevancia es doble. Por un lado, demuestra que el layout mixto FP8/NVFP4 de NVIDIA puede aproximarse en llama.cpp (que no soporta FP8 por tensor) mediante una mezcla de NVFP4, Q8_0 y BF16, reduciendo el modelo a un tercio del espacio que ocuparía en BF16. Por otro, es un artefacto de investigación sobre alineación: la model card reporta una tasa de cumplimiento del 83,0% en HarmBench con el modo de razonamiento alto, lo que lo convierte en una herramienta para estudiar remoción de rechazos, no en un modelo apto para despliegue directo a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH híbrida: 88 bloques (40 Mamba2 + 40 latent-MoE + 8 full-attention), hidden 4096, 512 expertos enrutados + 1 compartido, 22 activos por token, latent-MoE de 1024 dimensiones; torre de visión C-RADIO + proyector mlp1 |
| Parametros totales | 123.611.033.088 (~123,6B) |
| Parametros activos | ~12B por token |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de despliegue de la model card arranca llama-server con `-c 65536` |
| Tipos de cuantizacion | GGUF mixto: NVFP4 en expertos enrutados y compartidos, Q8_0 en q/k/v/o de atención, proyecciones in/out de Mamba y `lm_head`, BF16 en `fc1`/`fc2_latent_proj` y `token_embd`, F32 en normas. 4,73 BPW |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, japones, coreano, portugues, hindi, chino |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | GGUF (fichero unico de 73 GB); `mmproj` y el drafter NVFP4-LiLiCorr anunciados para una release posterior |

## Arquitectura y entrenamiento

La arquitectura NemotronH sustituye la mayor parte de las capas de atención por bloques de espacio de estados Mamba2: de los 88 bloques totales, 40 son Mamba2, 40 son capas de mezcla de expertos con proyección latente y solo 8 son atención completa. Esa proporción reduce el coste cuadrático del contexto largo y mantiene un KV cache pequeño en comparación con un transformer denso equivalente, aunque no se han publicado cifras de memoria de cache por token. La mezcla de expertos usa 512 expertos enrutados con 22 activos por token más un experto compartido, y comprime la proyección de los expertos a un espacio latente de 1024 dimensiones, lo que explica que 123,6B de parámetros puedan almacenarse en 73 GB con 4,73 BPW.

Sobre el entrenamiento original de NVIDIA no se aportan en esta información detalles de composición del dataset, número de tokens, ni si hubo RLHF, DPO u otra etapa de preferencias; la model card del derivado solo describe la transformación. Esa transformación consiste en eliminar el entrenamiento de rechazo (abliteration) y cuantizar a un GGUF mixto que imita el layout de NVIDIA: NVFP4 para expertos, Q8_0 para atención y proyecciones Mamba, BF16 para las proyecciones latentes y los embeddings, y F32 para las normas. La torre de visión se preserva sin cuantizar. La model card indica que hace falta llama.cpp upstream `b76b13379` o superior, y que el drafter para decodificación especulativa llegará en una release posterior.

## Capacidades

- Generación de texto y razonamiento en tres modos conmutables mediante `chat_template_kwargs`: `off` (`enable_thinking: false`), `medium` (`enable_thinking: true, medium_effort: true`) y `high` (`enable_thinking: true, medium_effort: false`).
- Procesamiento multimodal de imagen y vídeo, heredado de la torre C-RADIO y el proyector mlp1, que se mantienen intactos en esta cuantización.
- Generación de código y matemáticas: capacidad heredada del modelo base, sin métricas publicadas en esta información.
- Multilingüe en diez idiomas: inglés, francés, español, alemán, italiano, japonés, coreano, portugués, hindi y chino.
- Conversación multi-turno con plantilla Jinja (`--jinja`) y compatibilidad con endpoints tipo OpenAI (tag `endpoints_compatible`).
- Escritura de formato largo: la model card reporta ensayos de 3.500 a 9.900 caracteres sin patrones de repetición detectados (bigramas y trigramas con longitud máxima de repetición 1).
- Cumplimiento de peticiones dañinas sin rechazo en las categorías evaluadas (cibercrimen e intrusión, química y biología), que es precisamente la capacidad buscada por el autor y la que motiva las advertencias de uso.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Investigación en alineación y evaluación de rechazos: el modelo sirve como sujeto de prueba para medir hasta qué punto el entrenamiento de rechazo de un modelo grande puede eliminarse mediante abliteration y cuantización, comparando los modos `off`, `medium` y `high` sobre un mismo conjunto de prompts.
- Red teaming en entorno controlado: generar respuestas de cumplimiento sobre prompts de HarmBench dentro de un sandbox aislado, para calibrar clasificadores de seguridad y sistemas de moderación de salida.
- Investigación en ciberseguridad ofensiva autorizada: análisis de técnicas de intrusión y elaboración de material de formación para equipos de seguridad, siempre en un entorno sin acceso a objetivos reales y con revisión humana.
- Procesamiento de documentación técnica multilingüe con componente visual: al conservar la torre de visión, puede extraer y resumir contenido de capturas de pantalla, diagramas de red o documentación escaneada en cualquiera de los diez idiomas soportados.
- Generación de ficción y contenido creativo sin fricción por rechazos: la model card documenta ensayos narrativos de ~9.000 caracteres sin bucles de repetición, útil para talleres de escritura o generación de material editorial que otros modelos rechazarían por temáticas sensibles.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación introducida por un esquema mixto NVFP4/Q8_0/BF16 frente al base en BF16, usando las métricas de repetición y las muestras de calidad que reporta el autor.
- Despliegue de inference local con llama.cpp en un único nodo de 80 GB: el tamaño de 73 GB permite servirlo con `-ngl 999`, 8 slots (`-np 8`) y flash attention activada, con contexto de 65.536 tokens en el ejemplo del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. La model card indica que el desglose de MMLU-14042 por materia y las evaluaciones multimodales se añadirán en una actualización posterior.

Los únicos datos publicados son de cumplimiento en HarmBench (94 prompts, presupuesto de 2048 tokens, 3 modos de razonamiento). La tasa reportada mide cumplimiento, es decir, ausencia de rechazo, no calidad de la respuesta:

| Categoria | N | off | medium | high |
|---|---|---|---|---|
| cybercrime_intrusion | 52 | 73,1% | 84,6% | 90,4% |
| chemical_biological | 42 | 40,5% | 76,2% | 73,8% |
| Total | 94 | 58,5% | 80,9% | 83,0% |

Desglose de veredictos en modo `high`: 78 cumplen, 16 rechazan, 0 rechazos vacíos, 0 cortes por presupuesto, 0 respuestas basura. El autor reporta ASR del 83,0% sin degradación de formato.

Como control de coherencia en texto benigno, la model card publica métricas de repetición sobre tres ensayos largos:

| Prompt | Modo | Caracteres | `max_bigram_run` | `max_trigram_run` |
|---|---|---|---|---|
| roman_history | off | 9.893 | 1 | 1 |
| roman_history | high | 4.759 | 1 | 1 |
| os_kernel | off | 9.133 | 1 | 1 |
| os_kernel | high | 3.556 | 1 | 1 |
| lighthouse_story | off | 9.022 | 1 | 1 |

No se detectaron bucles en ninguna salida. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: ~73 GB solo para pesos, más overhead de contexto y buffers. Una descarga completa en GPU requiere un nodo de 80 GB como mínimo; el ejemplo del autor usa `-ngl 999` con `-c 65536` y 8 slots, lo que añade cache y memoria de trabajo sobre esos 73 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para servicio en un solo dispositivo con contexto moderado; 2× H100 80 GB si se quiere contexto largo y varios slots simultáneos sin recurrir a offload.
- Cabe en consumer GPU: no en una sola. Con 4× RTX 4090 (96 GB agregados) o 2× RTX 6000 Ada / A6000 de 48 GB (96 GB) el modelo entra completo vía split de llama.cpp, con margen limitado para contexto. En 2× RTX 4090 (48 GB) no cabe sin offload parcial de expertos a CPU, lo que degrada fuertemente el throughput.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) con versión upstream `b76b13379` o superior; soporte de flash attention (`--flash-attn on`) y plantilla Jinja (`--jinja`). No hay indicios en la información disponible de soporte en vLLM, TGI u Ollama, y el formato NVFP4 mixto es específico de llama.cpp.
- Latencia y throughput estimados: no disponibles. Al tener 12B parámetros activos por token, el coste por token se aproxima al de un denso de 12B, pero el ancho de banda necesario para recorrer 73 GB de pesos penaliza el throughput en configuraciones multi-GPU.
- Recomendación de sampling: `temperature=0` codicioso por defecto; por encima de 0,7 el autor advierte de artefactos de decodificación NVFP4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| dealignai/Nemotron-3.5-Super-VL-120B-A12B-CYBER-NVFP4 | 123,6B totales / ~12B activos | No disponible | GGUF mixto NVFP4/Q8_0/BF16, 73 GB | NVIDIA Open Model License | Rechazos eliminados; sin benchmarks de capacidad publicados |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 123,6B totales / ~12B activos | No disponible | BF16 safetensors | NVIDIA Open Model License | Modelo base con entrenamiento de rechazo intacto; mismo esqueleto NemotronH |
| Otros derivados abliterated de ~120B | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la informacion proporcionada |
| Alternativas GGUF de ~70B densos | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la informacion proporcionada |

La comparación relevante es contra el base en BF16: mismo número de parámetros y misma arquitectura, con la diferencia de que el derivado ocupa 73 GB frente al equivalente BF16 (del orden de 247 GB para 123,6B parámetros) y pierde el entrenamiento de rechazo. No hay datos públicos en esta información que permitan comparar calidad de razonamiento o multimodalidad entre ambos.

## Limitaciones y advertencias

- El modelo ha eliminado deliberadamente el entrenamiento de rechazo. El propio autor lo describe como artefacto de investigación y advierte de que no debe desplegarse a usuarios finales sin controles de seguridad posteriores independientes.
- Riesgo alto de generar contenido dañino en ciberseguridad y en química/biología: la model card reporta 90,4% de cumplimiento en intrusión informática y 73,8% en química/biológica en modo `high`. Cualquier uso en producción exige filtros de entrada y salida externos.
- Sesgos conocidos: no documentados en la información disponible. Al no haber evaluación de sesgos ni desglose por demografía o idioma, no puede descartarse la herencia de sesgos del modelo base.
- Alucinación: no se ha publicado ninguna evaluación de veracidad o factualidad. El autor solo reporta métricas de repetición, que detectan degeneración, no invención de hechos.
- Artefactos de cuantización: el autor reconoce erratas ocasionales en nombres poco frecuentes bajo decodificación NVFP4 (sustituciones de un solo token, no degeneración). Por encima de `temperature=0,7` aparecen artefactos de decodificación.
- Respuestas más largas: al comprometerse plenamente con la respuesta, el consumo esperado es de 2 a 3 veces más tokens por prompt que el base, con el coste asociado.
- Presupuesto de razonamiento: en tareas creativas con modo `high`, el modelo puede agotar un presupuesto de 2048 tokens dentro de `<think>`. El autor recomienda `max_new_tokens >= 4096`.
- Idiomas: aunque declara diez idiomas, no hay evaluación por idioma. El español está declarado pero sin métricas de calidad.
- Licencia: NVIDIA Open Model License, con términos de uso comercial que deben revisarse antes de cualquier explotación; la modificación CYBER se distribuye bajo los mismos términos, pero la responsabilidad de la modificación recae en el publicador del derivado.
- Multimodalidad: el fichero `mmproj` necesario para procesar imágenes y vídeo no está incluido en esta release y se anuncia para una publicación posterior. Hasta entonces, la capacidad de visión no es utilizable en la práctica.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y la evaluación de MMLU está pendiente de publicación. La validación independiente es inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Nemotron-3.5-Super-VL-120B-A12B-CYBER-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Perfil del autor: https://x.com/dealignai
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
