# rty813/Ternary-Bonsai-2-27B

## Resumen

Ternary-Bonsai-2-27B es un modelo de lenguaje de 27.000 millones de parámetros cuyos pesos están representados en formato ternario (aproximadamente 2 bits por peso), desarrollado por Prism ML. El repositorio analizado, `rty813/Ternary-Bonsai-2-27B`, es un port a PyTorch en precisión completa (bf16) del artefacto GGUF original `prism-ml/Ternary-Bonsai-2-27B-gguf`, pensado para usuarios de vLLM, TGI, Xinference y transformers que no quieren depender del ecosistema GGUF/llama.cpp. El modelo original se construyó a partir de `Qwen/Qwen3.8-27B`, según declara su model card.

El problema que resuelve es el de ejecutar razonamiento de clase 27B en hardware modesto: el artefacto ternario ocupa unos 5,9 GB frente a los aproximadamente 54 GB de una versión FP16, una reducción de en torno a 9,3 veces. Según los datos publicados por el autor original, conserva el 98,2 % de la "inteligencia FP16" y mantiene razonamiento, matemáticas y comportamiento agéntico en un régimen de sub-4 bits donde las representaciones de baja precisión convencionales suelen degradarse.

La relevancia actual radica en que combina una ventana de parámetros grande con un coste de memoria propio de un modelo pequeño, lo que lo hace desplegable en un portátil con GPU integrada o en una única GPU de consumo. La información pública disponible es escasa: el repositorio analizado no tiene descargas ni likes, el tamaño del repo figura como 0.0 GB y no se documentan ni la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention), pesos ternarios (aproximadamente 2 bits) |
| Parametros totales | 27B (27.000 millones, clase 27B según el autor) |
| Parametros activos | No aplica: no hay evidencia de que sea MoE en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (aproximadamente 2 bits) en el original GGUF; el port analizado se distribuye en bf16 (precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` en bf16 (conversión a safetensors en curso según el autor); GGUF en el modelo original |

## Arquitectura y entrenamiento

La model card del artefacto original describe un transformer con esquema de atención híbrida y pesos ternarios, empaquetados en GGUF para su ejecución con llama.cpp sobre CUDA, Metal y CPU. El modelo base declarado es `Qwen/Qwen3.8-27B`, aunque no se aportan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. La innovación técnica destacable es la propia representación ternaria: el autor afirma que retiene razonamiento, capacidades matemáticas y comportamiento agéntico en un régimen de precisión donde las cuantizaciones IQ2_XXS convencionales colapsan.

El repositorio `rty813/Ternary-Bonsai-2-27B` no introduce cambios arquitectónicos: se presenta explícitamente como un port drop-in, cargable con `AutoModelForCausalLM.from_pretrained("rty813/Ternary-Bonsai-2-27B")`, compatible con vLLM (`vllm serve rty813/Ternary-Bonsai-2-27B`) y con Xinference. Tampoco se documentan técnicas auxiliares como decodificación especulativa, atención lineal ni estrategias de entrenamiento concretas, por lo que no es posible detallar más la fase de entrenamiento.

## Capacidades

- Generación de texto y razonamiento en modo "thinking": los benchmarks citados corresponden a 14 pruebas en modo pensamiento, lo que indica que el modelo expone un modo de razonamiento explícito.
- Razonamiento matemático: el autor reporta 96,57 puntos en su evaluación de matemáticas, a medio punto de la precisión completa.
- Comportamiento agéntico: el autor afirma que conserva capacidades agenticas y de razonamiento profundo tras la ternarización.
- Multilingüismo: no disponible (no se documenta la lista de idiomas).
- Tool calling / function calling: no disponible explícitamente, aunque la etiqueta "agentic" del autor sugiere soporte, sin confirmación documental.
- Capacidades multimodales: la ficha de HuggingFace incluye la etiqueta `image-text-to-text`, pero la model card no describe ninguna torre de visión ni capacidades de imagen, por lo que el dato no está confirmado.
- Ejecución en dispositivo: al estar empaquetado originalmente en GGUF para CUDA, Metal y CPU, está orientado a inferencia local y en el borde ("on-device").
- Compatibilidad de despliegue: transformers, vLLM, TGI, Xinference (port bf16) y llama.cpp (original GGUF).

## Casos de uso

- Razonamiento matemático asistido: con 96,57 puntos reportados en la evaluación de matemáticas dentro del régimen ternario, es adecuado para resolver problemas paso a paso en entornos educativos o de ingeniería donde no se dispone de GPUs de datacenter.
- Inferencia local en portátil: el artefacto original ocupa unos 5,9 GB y alcanza unas 47 tok/s en un Apple M5 Max, lo que permite ejecutar un modelo de clase 27B en un equipo de trabajo sin conexión a la nube.
- Agentes autónomos de baja latencia en el borde: el autor indica que conserva comportamiento agéntico, de modo que puede encadenar varios pasos de razonamiento en dispositivos con memoria limitada.
- Servicio de generación de texto con vLLM: el port bf16 permite levantar un endpoint compatible con la API de OpenAI mediante `vllm serve`, integrándolo en pipelines existentes sin adaptar código.
- Despliegue en infraestructura con TGI o Xinference: el port está pensado para estos servidores, por lo que encaja en stacks corporativos que ya usan TGI o Xinference como capa de servicio.
- Investigación en cuantización extrema: sirve como punto de comparación reproducible entre pesos ternarios y cuantizaciones de 2 bits convencionales (por ejemplo IQ2_XXS), al existir ambas variantes documentadas.
- Prototipado de productos con presupuesto de VRAM reducido: permite validar funcionalidades de razonamiento de clase 27B en una única GPU de consumo antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la model card del artefacto original y son promedios agregados, no resultados por tarea. No se han publicado resultados de benchmarks en la información disponible para el port bf16 `rty813/Ternary-Bonsai-2-27B`.

| Metrica | Ternary-Bonsai-2-27B (ternario) | IQ2_XXS convencional | UD-Q4_K_XL | FP16 (referencia) |
|---|---|---|---|---|
| Media en 14 benchmarks (modo thinking) | 84,78 | 72,59 | 84,78 + 0,4 aprox. | 100 % (referencia relativa) |
| Razonamiento matematico | 96,57 (a 0,5 puntos de FP16) | no disponible | no disponible | referencia |
| Inteligencia FP16 retenida | 98,2 % | no disponible | no disponible | 100 % |
| Tamano de pesos | ~5,9 GB | ~82 % del tamano del ternario | ~3x el tamano del ternario | ~54 GB |
| Throughput | ~47 tok/s en Apple M5 Max | no disponible | no disponible | no disponible |

Nota: la model card no especifica qué 14 benchmarks componen la media de 84,78 ni detalla la metodología, por lo que estas cifras deben tratarse como afirmaciones del autor, no verificadas de forma independiente.

## Requisitos de hardware

- Port bf16 (`rty813/Ternary-Bonsai-2-27B`): al estar en precisión completa, los pesos ocupan del orden de 54 GB, a lo que hay que sumar el caché KV. Requiere al menos una GPU de 80 GB (H100 80GB, A100 80GB) o varias GPU en paralelo; no cabe en GPUs de consumo de 24 GB sin cuantizar adicionalmente.
- Artefacto ternario original (GGUF, ~5,9 GB): cabe en portátiles con Apple Silicon (se reportan ~47 tok/s en un Apple M5 Max), así como en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12GB, RTX 4060 Ti, RTX 4070 y superiores), siempre que el caché KV y el contexto elegido no superen la memoria libre.
- GPU recomendadas: para el port bf16, H100 80GB o A100 80GB; para el ternario, cualquier GPU de consumo con 8 GB o más, o CPU con AVX y suficiente RAM.
- Opciones de despliegue: vLLM y Xinference para el port bf16 (también se menciona TGI y transformers); llama.cpp con backend CUDA, Metal o CPU para el artefacto GGUF original.
- Latencia y throughput: el único dato publicado es ~47 tok/s en un Apple M5 Max con el artefacto ternario. No hay cifras de latencia ni de throughput para el port bf16 ni para configuraciones con GPU dedicada.
- Nota: el tamaño del repositorio aparece como 0.0 GB y el contador de descargas es 0, lo que sugiere que los pesos podrían no estar efectivamente publicados en el momento de la consulta; conviene verificarlo antes de planificar un despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (ternario, prism-ml) | 27B | no disponible | 84,78 de media en 14 benchmarks; 96,57 en matematicas | Apache 2.0 | GGUF en HuggingFace, llama.cpp |
| rty813/Ternary-Bonsai-2-27B (este repo) | 27B | no disponible | no disponible (port bf16, sin benchmarks publicados) | Apache 2.0 | `pytorch_model.bin` bf16, vLLM/TGI/Xinference |
| IQ2_XXS del mismo modelo | 27B | no disponible | 72,59 de media en los mismos 14 benchmarks | Apache 2.0 | GGUF en llama.cpp |
| UD-Q4_K_XL del mismo modelo | 27B | no disponible | ~0,4 puntos por encima del ternario | Apache 2.0 | GGUF en llama.cpp |

No se dispone de datos verificables de otros modelos de la misma categoría (por ejemplo, alternativas de 27B-32B de otros desarrolladores) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio Bonsai 2 27B documentadas por el autor.

## Limitaciones y advertencias

- Ausencia de benchmarks independientes: las cifras de 84,78 de media, 98,2 % de retención y 96,57 en matemáticas son afirmaciones del autor, sin metodología detallada ni verificación externa.
- Repositorio sin tracción verificable: 0 descargas, 0 likes y un tamaño de repo de 0.0 GB en la ficha consultada, lo que hace plausible que los pesos no estén disponibles o estén incompletos.
- Conversión a safetensors pendiente: el propio autor indica que la conversión está en curso, de modo que la distribución actual es `pytorch_model.bin`, formato menos seguro para carga con `torch.load`.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, un dato crítico para planificar tareas de contexto largo.
- Idiomas no documentados: no hay lista de idiomas soportados, por lo que el rendimiento fuera del inglés (incluido el castellano) es una incógnita.
- Trazabilidad dudosa del modelo base: la model card cita `Qwen/Qwen3.8-27B`, una denominación que no se corresponde con los identificadores habituales publicados por Qwen; conviene verificar la procedencia real de los pesos antes de usarlos en producción.
- Precisión ternaria: aunque el autor defiende que la degradación es mínima, cualquier tarea sensible a la fidelidad numérica exacta (cálculo financiero, código crítico) debería validarse empíricamente antes de desplegarse.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de veracidad; es de esperar el comportamiento habitual de un modelo generativo.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de pesos con trazabilidad poco clara, conviene revisar las condiciones del modelo base antes de un uso comercial.
- Resultados de búsqueda web no utilizables: la búsqueda realizada devolvió exclusivamente contenido no relacionado con el modelo, por lo que no se ha podido contrastar ninguna afirmación con fuentes externas.

## Enlaces

- HuggingFace (port bf16, este repositorio): https://huggingface.co/rty813/Ternary-Bonsai-2-27B
- Modelo original en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Web de Prism ML: https://prismml.com
- Whitepaper (PDF): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Discord de Prism ML: https://discord.gg/prismml
- No se han encontrado en la búsqueda web otros enlaces relevantes al modelo.
