# mradermacher/llama3-8b-flare-unsloth-merged-GGUF

## Resumen
Este repositorio contiene cuantizaciones estáticas en formato GGUF del modelo TheShadowMonarchDestroyer/llama3-8b-flare-unsloth-merged, un ajuste fino (SFT) de Llama 3 8B realizado con Unsloth y TRL. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF para inferencia local. El modelo subyacente conserva la arquitectura transformer decoder-only de Llama 3 con 8.030.261.248 parámetros, por lo que no introduce cambios estructurales respecto al original de Meta.

La relevancia de este repositorio es práctica: ofrece el modelo en once niveles de cuantización (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB), lo que permite ejecutarlo en hardware muy diverso, desde GPUs de consumo modestas hasta estaciones de trabajo. Al estar en GGUF, es compatible con llama.cpp, Ollama y otros motores de inferencia local, y no requiere el stack completo de PyTorch.

No se dispone de información publicada sobre el dataset de ajuste fino, el número de tokens de entrenamiento ni evaluaciones de rendimiento. La model card del cuantizador es puramente mecánica y se limita a listar los ficheros generados. El idioma declarado es únicamente inglés y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo base es un Llama 3 8B, es decir, un transformer decoder-only denso con atención multi-cabeza agrupada (GQA) y las capas y dimensiones estándar de la familia Llama 3. Sobre ese checkpoint se aplicó un ajuste fino supervisado (SFT) usando Unsloth y TRL, según indican las etiquetas del repositorio. No se especifica el dataset, el número de tokens vistos durante el SFT, ni si hubo fases posteriores de RLHF o DPO.

El repositorio en sí no entrena nada: mradermacher parte del modelo fusionado (merged) publicado por TheShadowMonarchDestroyer y genera cuantizaciones estáticas con las herramientas habituales del ecosistema GGUF. La model card indica que en el momento de la publicación no había cuantizaciones con imatrix/weighted disponibles por parte de este autor, por lo que todas las variantes listadas son estáticas. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades
- Generación de texto en inglés, heredada de Llama 3 8B.
- Razonamiento general y respuesta a instrucciones, presumiblemente reforzado por el SFT, aunque no hay evaluación publicada que lo confirme.
- Generación de código y matemáticas básicas, como corresponde a la base Llama 3 8B; sin datos específicos del ajuste.
- Soporte de conversación multi-turno, sujeto a la plantilla de chat que use el modelo base.
- Capacidades multilingües limitadas: el autor declara únicamente inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso
- Inferencia local en portátil con GPU de 6-8 GB: usar Q4_K_S (4,8 GB) o Q4_K_M (5,0 GB) con llama.cpp u Ollama para prototipos de chat en inglés sin depender de la nube.
- Despliegue en CPU en servidores sin GPU: las variantes Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecución en memoria RAM con throughput moderado, útil para tareas por lotes no interactivas.
- Evaluación de ajustes finos comunitarios: sirve para comparar cualitativamente el efecto del SFT de TheShadowMonarchDestroyer frente a Llama 3 8B base usando la misma infraestructura GGUF.
- Generación de texto por lotes (resúmenes, reescritura, clasificación simple) en inglés: el tamaño de 8B y las cuantizaciones Q5/Q6 ofrecen un equilibrio razonable entre calidad y coste computacional.
- Integración en aplicaciones de escritorio o edge: al ser GGUF, se puede embeber con llama.cpp en herramientas locales sin requerir CUDA ni PyTorch.
- Base para experimentos de ajuste adicional: partir de la versión f16 (16,2 GB) si se necesita precisión completa antes de aplicar LoRA o QLoRA con Unsloth.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según cuantización): Q2_K ~3,3 GB; Q3_K_S ~3,8 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB. Añadir margen para el contexto KV cache (típicamente 1-2 GB adicionales según longitud).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo si se busca throughput alto con f16 o despliegue multi-usuario.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q2_K/Q3_K_S hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; el tag text-generation-inference sugiere compatibilidad con TGI, aunque GGUF no es el formato nativo de TGI (que prefiere safetensors).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/llama3-8b-flare-unsloth-merged-GGUF | 8,03 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de un SFT comunitario |
| Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens (según ficha oficial de Llama 3) | Llama 3 Community License | safetensors, GGUF (por terceros) | Modelo oficial con evaluación publicada |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa con contexto mayor y licencia permisiva |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Multilingüe y con contexto muy amplio |

La comparación con Llama 3 8B Instruct es la más directa por arquitectura; Mistral y Qwen2.5 se incluyen como alternativas de tamaño similar con licencia Apache 2.0 y contexto documentado. No hay datos de rendimiento del modelo de esta ficha para comparar calidad.

## Limitaciones y advertencias
- No hay evaluación publicada: se desconoce si el SFT mejora o degrada las capacidades del Llama 3 8B original, y en qué tareas.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la falta de benchmarks que permitan calibrar su fiabilidad.
- Idioma limitado al inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada en este repositorio; conviene verificar la del modelo base antes de asumir 8K tokens.
- El ajuste fino es de origen comunitario (TheShadowMonarchDestroyer) sin paper ni dataset público; la trazabilidad del entrenamiento es baja.
- Aunque la licencia declarada es Apache 2.0, el modelo base Llama 3 está sujeto a la Llama 3 Community License de Meta; conviene revisar la compatibilidad para uso comercial.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable según las notas del propio autor ("lower quality" en Q3_K_M).
- No se ofrecen cuantizaciones imatrix/weighted, que suelen dar mejor relación calidad/tamaño en Q2-Q4.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/llama3-8b-flare-unsloth-merged-GGUF
- Modelo base (safetensors): https://huggingface.co/TheShadowMonarchDestroyer/llama3-8b-flare-unsloth-merged
- Página de descargas del cuantizador: https://hf.tst.eu/model#llama3-8b-flare-unsloth-merged-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
