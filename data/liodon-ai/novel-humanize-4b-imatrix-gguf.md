# liodon-ai/novel-humanize-4b-imatrix-GGUF

# novel-humanize-4b imatrix GGUF

## Resumen

novel-humanize-4b imatrix GGUF es un conjunto de cuantizaciones en formato GGUF del modelo `gugujiji/novel-humanize-4b`, un ajuste fino de Qwen3-4B con 4.022.468.096 parámetros. Lo publica Liodon AI con el objetivo de hacerlo ejecutable en hardware de consumo mediante llama.cpp, Ollama, LM Studio y Jan. El modelo base está etiquetado como `qwen3` y orientado a generación de texto conversacional y narrativo, aunque el repositorio de cuantización no documenta el proceso de ajuste fino original.

La aportación técnica del repositorio es el uso de calibración iMatrix: se ejecutan 128 fragmentos de calibración (2 millones de tokens de WikiText-103) sobre el modelo en precisión completa para estimar la importancia de cada peso y asignar más bits donde más afectan a la perplejidad. El resultado son cuantizaciones de 2, 3 y 4 bits con mejor coherencia que una cuantización uniforme del mismo tamaño, lo que permite bajar hasta 1,51 GB en IQ2_M.

Es relevante ahora porque comprime un modelo de 4B en ficheros de entre 1,51 GB y 4,28 GB, con estimaciones de VRAM de 2 a 5 GB, lo que lo sitúa al alcance de GPUs de gama media, iGPUs con memoria compartida y portátiles sin GPU dedicada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con RoPE, GQA y SwiGLU |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en este repositorio; el modelo base Qwen3-4B declara 32.768 tokens nativos (ampliables con YaRN según su documentación) |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todos con calibración iMatrix) |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen3-4B declara soporte multilingüe (119 idiomas y dialectos según su model card) |
| Licencia | other (sin texto de licencia detallado en el repositorio) |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Qwen3, con 4.022 millones de parámetros. Qwen3-4B emplea atención con RoPE, grouped-query attention (GQA) para reducir el coste de la caché KV y FFN con activación SwiGLU y normalización RMSNorm. El repositorio de cuantización no documenta ni el número de capas, ni la dimensión oculta, ni el vocabulario; esos datos deben consultarse en la model card de Qwen3-4B.

No hay información sobre los datos de entrenamiento del ajuste fino `novel-humanize-4b`: no se documentan tokens, composición del corpus, ni si hubo RLHF, DPO o SFT. El nombre sugiere una especialización en texto narrativo y en la "humanización" de prosa generada, pero es una inferencia a partir del identificador y no un dato verificado.

La innovación técnica del repositorio es la calibración iMatrix aplicada a cuantizaciones sub-4-bit: frente a la cuantización uniforme, se ejecutan 128 chunks de calibración (2M tokens de WikiText-103) sobre el modelo sin cuantizar para calcular la importancia de cada tensor y repartir el presupuesto de bits de forma no uniforme. Liodon AI mantiene además una variante sin iMatrix (`liodon-ai/novel-humanize-4b-GGUF`) para comparar.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, con la etiqueta `conversational` en el repositorio.
- Redacción y reescritura de prosa narrativa: el ajuste fino apunta a texto con estilo menos "de máquina", aunque no hay evaluación publicada que lo cuantifique.
- Razonamiento y conocimiento general heredados de Qwen3-4B (no verificados en este repositorio).
- Soporte multilingüe heredado del modelo base; el repositorio no declara lista de idiomas propia.
- Tool calling / function calling: no documentado en este repositorio. Qwen3-4B soporta function calling según su model card, pero la capacidad no está validada tras el ajuste fino ni tras la cuantización.
- Modo thinking: Qwen3-4B incluye modo de razonamiento explícito; no se indica si el ajuste fino `novel-humanize` lo conserva.
- Sin capacidades de visión ni audio: la arquitectura es exclusivamente de texto.
- Compatible con endpoints de inferencia (`endpoints_compatible`) y con el servidor OpenAI-compatible de llama.cpp.

## Casos de uso

- **Generación de ficción y narrativa local**: el modelo puede redactar escenas, diálogos y continuaciones con un estilo menos formulario; con 2,5 GB en Q4_K_M cabe en un portátil y permite iterar sin coste por token, algo útil para autores que trabajan con borradores largos.
- **Reescritura y edición de estilo**: uso típico de "humanizar" texto generado previamente por otro modelo, pasando párrafos por el modelo en IQ4_XS (2,27 GB) dentro de un pipeline de edición por lotes.
- **Asistente conversacional embebido en aplicaciones de escritorio**: integrable con Ollama (`ollama run hf.co/liodon-ai/novel-humanize-4b-imatrix-GGUF:Q4_K_M`) para dar chat sin conexión en herramientas de escritorio, con consumo de VRAM de unos 3 GB.
- **Prototipado y pruebas de concepto en CI**: al ocupar 1,51 GB en IQ2_M, se puede incluir en contenedores de test o en runners con poca memoria para validar prompts y plantillas de chat antes de pasar a un modelo mayor.
- **Generación de contenido creativo en lote sobre CPU**: con llama.cpp en CPU y Q4_K_M se pueden generar miles de variaciones de textos cortos (descripciones, sinopsis, resúmenes de capítulos) sin GPU, útil en tareas de aumento de datos sintéticos.
- **Base para experimentos de cuantización**: el repositorio sirve como caso de estudio reproducible de iMatrix frente a cuantización estándar, comparando las dos variantes publicadas por el mismo autor sobre el mismo modelo.
- **Filtrado y reescritura en español dentro de aplicaciones de blog**: si el multilingüismo de Qwen3-4B se mantiene tras el ajuste (no verificado), podría reescribir borradores en castellano; conviene validarlo con una muestra propia antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye perplejidad, MMLU, HumanEval ni ninguna otra métrica, ni siquiera la comparación de perplejidad iMatrix frente a cuantización estándar que cabría esperar del trabajo de calibración.

## Requisitos de hardware

- **VRAM estimada (tabla del autor)**: IQ2_M e IQ3_M ~2 GB; IQ4_XS y Q4_K_M ~3 GB; Q5_K_M ~3 GB; Q6_K ~4 GB; Q8_0 ~5 GB. Estas cifras no incluyen la caché KV, que crece con la longitud de contexto.
- **GPU consumer compatibles**: cualquier GPU con 4 GB o más puede ejecutar Q4_K_M (GTX 1650 Super 4 GB, RTX 3050 6 GB, RTX 4060 8 GB, RTX 3060 12 GB). Q8_0 requiere 6-8 GB y encaja en RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- **GPU de datacenter**: A100, H100 y L40S ejecutan cualquier cuantización con holgura; el modelo es demasiado pequeño para aprovechar su ancho de banda, por lo que el cuello de botella será el batch, no la VRAM.
- **CPU e iGPU**: IQ2_M e IQ3_M son viables en CPU con 8 GB de RAM; con memoria compartida en Apple Silicon (M1/M2/M3 con 8 GB unificados) Q4_K_M funciona con soltura.
- **Despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan y cualquier frontend compatible con GGUF. No se recomienda vLLM ni TGI como primera opción para este repositorio: son serving engines pensados para safetensors y solo soportan GGUF de forma experimental. Para producción con concurrencia, conviene partir del modelo base en safetensors y cuantizar con el backend del propio engine.
- **Latencia y throughput**: no disponibles. No hay mediciones de tokens por segundo publicadas para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| novel-humanize-4b imatrix GGUF (este) | 4,02B | No disponible (heredado de Qwen3-4B) | other | GGUF, 1,51-4,28 GB | Cuantización iMatrix; sin benchmarks; 0 descargas |
| Qwen3-4B | 4,02B | 32.768 nativos (ampliable con YaRN) | Apache 2.0 | safetensors y GGUF oficiales | Mismo esqueleto; incluye modo thinking y function calling documentados |
| Llama 3.2 3B Instruct | 3,21B | 128.000 | Llama 3.2 Community License | safetensors y GGUF | Contexto mucho mayor; licencia con restricciones para grandes plataformas |
| Gemma 3 4B IT | ~4B | 128.000 | Gemma Terms of Use | safetensors y GGUF | Ventana larga y multimodal en la variante completa; licencia con condiciones de uso |
| Phi-4-mini-instruct | 3,8B | 128.000 | MIT | safetensors y GGUF | Licencia permisiva; orientado a razonamiento y matemáticas |

Los datos de las alternativas provienen de sus model cards públicas. No hay benchmarks comunes que permitan comparar calidad entre este ajuste fino y las alternativas.

## Limitaciones y advertencias

- **Sin validación de la comunidad**: 0 descargas y 0 likes; no hay evidencia de terceros sobre calidad o estabilidad.
- **Sin benchmarks ni perplejidad**: no se puede afirmar que la cuantización iMatrix supere a la estándar en este modelo concreto sin mediciones publicadas.
- **Licencia ambigua**: el repositorio declara `other` sin texto de licencia. El modelo base Qwen3-4B es Apache 2.0, pero las condiciones del ajuste fino `gugujiji/novel-humanize-4b` no están detalladas, lo que impide confirmar el uso comercial. Verificar antes de desplegar en producción.
- **Riesgo de alucinación**: es un modelo de 4B; en tareas factuales y de razonamiento largo la tasa de error es alta. No debe usarse como fuente de verdad sin verificación.
- **Degradación en sub-4 bits**: IQ2_M e IQ3_M pierden coherencia en generaciones largas y en instrucciones complejas; para uso serio, Q4_K_M o superior.
- **Contexto no verificado**: la longitud de contexto efectiva tras el ajuste fino no está documentada; no asumir 32K sin probarlo.
- **Idiomas no declarados**: no hay lista de idiomas del ajuste fino; el comportamiento en castellano puede diferir del Qwen3-4B original y debe evaluarse con muestras propias.
- **Cuantizado, no reentrenable**: los GGUF no son adecuados para fine-tuning posterior; para eso hay que partir de los safetensors del modelo base.
- **Sesgos**: no evaluados. Hereda los sesgos de Qwen3-4B y los del corpus de ajuste fino, que no se documenta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/novel-humanize-4b-imatrix-GGUF
- Variante sin iMatrix: https://huggingface.co/liodon-ai/novel-humanize-4b-GGUF
- Modelo base del ajuste fino: https://huggingface.co/gugujiji/novel-humanize-4b
- Modelo original Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de calibración WikiText-103: https://huggingface.co/datasets/wikitext
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Perfil del cuantizador: https://huggingface.co/liodon-ai
