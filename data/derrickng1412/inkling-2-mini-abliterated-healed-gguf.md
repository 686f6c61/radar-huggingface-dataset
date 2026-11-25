# derrickNg1412/Inkling-2-Mini-Abliterated-Healed-GGUF

## Resumen

Inkling-2-Mini-Abliterated-Healed-GGUF es la distribucion en formato GGUF para llama.cpp de la variante "abliterated" y "healed" del modelo multimodal Inkling-2-Mini de Thinking Machines. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.070.385.152 parametros totales (26,4B segun el autor), 24 capas fisicas y 48 pasadas logicas de bucle, ventana de contexto de 1M de tokens y capacidad de vision (pipeline image-text-to-text). Esta version concreta parte de nokeepai/Inkling-2-Mini-Unbound y aplica un proceso de abliteration (eliminacion de la direccion de rechazo en las matrices `attn.wo_ud` de las capas 4-23), seguido de un "KL-healing" (Phase 5A) y un refinamiento DPO (Phase 5B) para preservar el razonamiento sin reintroducir rechazos.

El interes tecnico reside en el proceso de cuantizacion: todas las matrices editadas por la abliteration (`attn_output`/`wo_ud`) se fijan a `Q8_0` para que la compresion a 3 y 4 bits no degrade ni el comportamiento "uncensored" ni la recuperacion KL. Se ofrecen cinco niveles de cuantizacion (de `Q8_0` a `IQ3_M`) con el objetivo de cubrir desde GPUs de 32 GB hasta equipos con 12 GB de VRAM mediante offload parcial de expertos MoE a CPU.

El modelo mantiene la licencia Apache 2.0 del base y solo declara soporte para ingles. Es relevante para quienes necesitan un modelo multimodal de gran contexto sin restricciones de rechazo, pero conviene tener en cuenta que la model card documenta un bug upstream de llama.cpp que afecta al offload de MoE a CPU en CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (`inkling2_loop`), 24 capas fisicas y 48 pasadas logicas; vision multimodal |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Q8_0, IQ4_NL, Q4_K_M, IQ4_XS, IQ3_M (matrices `attn_output` fijadas a Q8_0) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision en BF16 y Q8_0 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con un mecanismo de bucle: 24 capas fisicas evaluadas en 48 pasadas logicas, lo que multiplica la profundidad efectiva sin aumentar el numero de tensores. Incluye un proyector de vision (mmproj) para entrada de imagen, coherente con el pipeline image-text-to-text. Esta variante parte del checkpoint nokeepai/Inkling-2-Mini-Unbound, del que reconstruye de forma bit-exacta 20 tensores BF16 `attn.wo_ud` (capas 4-23) verificados por SHA-256 contra su manifiesto.

Sobre esa base se aplican tres fases. La Phase 5A entrena un LoRA de rango 32 exclusivamente sobre esas 20 matrices para aproximar las probabilidades del modelo original en prompts inofensivos, proyectando cada gradiente y paso de peso de forma ortogonal a la direccion de rechazo `u_l` (con `max|uᵀ ΔW| = 4.07e-10`), lo que afecta al 0,013 % de los parametros. La Phase 5B realiza un DPO on-policy que preserva el razonamiento: muestrea 320 candidatos con `effort=0` y `0.9`, construye 47 pares contrastivos completos (`hit_eos=True`) con penalizaciones de HarmBench-Llama-2-13b-cls y de desvío de disclaimer, y entrena un LoRA DPO normalizado por longitud con escalado reducido (`0.5×`) en las capas visitadas tres veces (6-17) y una atadura KL benigna. Finalmente, los 20 tensores sanados se intercambian en el GGUF BF16 oficial de ggml-org (los otros 684 tensores quedan byte-identicos) y se cuantiza con la matriz de importancia `imatrix.gguf`, bloqueando `attn_output=Q8_0`.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de hasta 1M de tokens.
- Razonamiento explicito en modo "thinking" mediante el canal nativo `<|content_thinking|>` (requiere `--jinja` en llama.cpp).
- Tool calling y function calling compatibles con OpenAI a traves de la plantilla `<|content_invoke_tool_json|>`.
- Capacidad multimodal de entrada: imagenes junto a texto mediante el proyector `mmproj` (BF16 o Q8_0).
- Comportamiento "abliterated"/"uncensored": rechazo eliminado en las capas 4-23 y verificado con 0/64 rechazos en prompts daninos y 0/32 sobre-rechazos en casos limite (segun el autor).
- Razonamiento multi-paso y uso como agente, apoyado por el modo thinking y el tool calling.
- Soporte exclusivo de ingles; no se declaran capacidades multilingues.

## Casos de uso

- Asistencia conversacional de contexto largo: con 1M de tokens puede mantener historiales extensos, documentacion completa o transcripciones largas en una sola ventana sin truncar.
- Analisis de documentos e imagenes combinados: el proyector de vision permite pasar capturas, diagramas o graficos junto a preguntas de texto para extraccion de informacion o resumen.
- Pipelines de agentes con herramientas: el tool calling compatible con OpenAI y el modo thinking permiten construir agentes que planifican, invocan APIs y razonan en varios pasos.
- Investigacion sobre alineacion y seguridad: la variante abliterated con healing KL y DPO documentado es un caso de estudio reproducible para medir el efecto de eliminar la direccion de rechazo sin degradar el modelo base.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ4_XS (14,47 GB) e IQ3_M (12,98 GB) permiten ejecutarlo en GPUs de 16 GB o con offload parcial de expertos a CPU en 12 GB.
- Generacion de codigo y explicaciones tecnicas en ingles: el modelo conserva el razonamiento del base y puede integrarse en asistentes de desarrollo que necesiten contexto de repositorio amplio.
- Prototipado de chatbots sin filtros editoriales: util en entornos de investigacion donde se requiere estudiar respuestas del modelo sin capas de rechazo, con la advertencia de los riesgos asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion:
  - `Q8_0` (27,82 GB): 32 GB o mas de VRAM (RTX 5090, A100) o Mac con 36-64 GB de memoria unificada.
  - `IQ4_NL` (17,63 GB): 24 GB de VRAM (RTX 3090, 4090, L4).
  - `Q4_K_M` (17,56 GB): 24 GB de VRAM o Mac con 32 GB.
  - `IQ4_XS` (14,47 GB): 16 GB de VRAM (RTX 4060 Ti 16GB, 4080, 5080, T4) usando `-ctk q8_0 -ctv q8_0`.
  - `IQ3_M` (12,98 GB): 16 GB de VRAM con contexto largo, 12 GB con offload parcial de MoE o 4-8 GB con offload completo de MoE a CPU.
- Proyector de vision opcional: `mmproj` BF16 (0,64 GB) o Q8_0 (0,35 GB).
- GPU recomendadas: RTX 5090 o A100 para Q8_0; RTX 3090/4090/L4 para 4 bits; RTX 4060 Ti 16GB/4080/5080/T4 para IQ4_XS e IQ3_M.
- Cabe en GPU de consumo: si, desde una RTX 4060 Ti de 16 GB (IQ4_XS) hasta configuraciones con offload de MoE en 12 GB.
- Opciones de despliegue: llama.cpp `b12631+` (con soporte `inkling2_loop`, PRs #32694 y #32704) y llama.cpp de Unsloth; Ollama 0.40.17 con soporte nativo en Apple Silicon (en Windows/Linux puede fallar con `unknown model architecture 'inkling2_loop'`).
- Latencia y throughput: no disponibles. Se recomienda `-ctk q8_0 -ctv q8_0` para reducir a la mitad la memoria de la cache KV y `-np 1` en configuraciones monousuario para reutilizar la cache multi-turno.
- Aviso de bug upstream (#32710): en builds `b12631`-`b12633`, combinar CUDA con expertos MoE en CPU (`-ot "...ffn_.*_exps=CPU"`) produce salidas corruptas o bucles con prompts de 32 o mas tokens; debe usarse `--no-op-offload` (o `-ub 16`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-Healed-GGUF | 26,4B MoE | 1M | Texto + imagen | Apache 2.0 | Variante abliterated con healing KL y DPO; cuantizaciones GGUF de 12,98 a 27,82 GB |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B MoE | 1M | Texto + imagen | no disponible en la informacion | Modelo original con rechazos intactos; referencia de comportamiento |
| nokeepai/Inkling-2-Mini-Unbound | 26,4B MoE | 1M | Texto + imagen | no disponible en la informacion | Abliteration sin healing ni DPO; origen de los tensores `edit.pt` |
| ggml-org/Inkling-2-Mini-GGUF | 26,4B MoE | 1M | Texto + imagen | no disponible en la informacion | Cuantizaciones oficiales del base sin modificaciones de comportamiento |

## Limitaciones y advertencias

- Modelo "uncensored": el rechazo se ha eliminado deliberadamente; puede generar contenido danino, ilegal o inexacto sin advertencia. No apto para produccion orientada al publico sin capas de moderacion externas.
- Solo soporta ingles; no se declaran capacidades multilingues y el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente al modelo base; el proceso de abliteration y DPO no lo mitiga y puede incrementarlo en dominios sensibles.
- El contexto de 1M tokens exige presupuesto adicional de VRAM para la cache KV; sin cuantizacion de cache (`-ctk q8_0 -ctv q8_0`) puede no caber en GPUs de 16-24 GB.
- Bug upstream de llama.cpp (#32710) en builds `b12631`-`b12633`: el offload de MoE a CPU con CUDA genera salidas corruptas con prompts de 32 o mas tokens; requiere `--no-op-offload`.
- Compatibilidad limitada en Ollama: el soporte nativo de `inkling2_loop` solo esta confirmado en Apple Silicon con la version 0.40.17; otras plataformas pueden fallar.
- Las matrices `attn_output` estan fijadas a Q8_0, por lo que el ahorro de tamano en las cuantizaciones mas agresivas es menor de lo habitual para ese subconjunto de tensores.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/derrickNg1412/Inkling-2-Mini-Abliterated-Healed-GGUF
- Modelo base (safetensors): https://huggingface.co/derrickNg1412/Inkling-2-Mini-Abliterated-Healed
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Abliteration de origen: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF oficial del base: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte `inkling2_loop`: https://github.com/ggml-org/llama.cpp/pull/32694
- PR de soporte `inkling2_loop` (segundo): https://github.com/ggml-org/llama.cpp/pull/32704
- Bug upstream de offload MoE en CUDA: https://github.com/ggml-org/llama.cpp/issues/32710
