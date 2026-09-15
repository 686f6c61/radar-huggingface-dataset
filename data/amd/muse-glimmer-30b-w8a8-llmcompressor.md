# amd/Muse-Glimmer-30B-w8a8-llmcompressor

## Resumen

Muse-Glimmer-30B-w8a8-llmcompressor es una version cuantizada del modelo multimodal RedHatAI/Muse-Glimmer-30B, publicada por AMD con el objetivo de habilitar inferencia de un modelo de ~30.000 millones de parametros directamente sobre CPU. La cuantizacion se ha realizado con LLM Compressor v0.13.0 siguiendo el esquema W8A8 (pesos INT8 simetricos por canal y activaciones INT8 simetricas por token con cuantizacion dinamica), mediante el algoritmo Round-to-Nearest (RTN) sin dataset de calibracion (data-free).

El resultado es un checkpoint que reduce el peso en disco de 55,5 GiB a 32,0 GiB, aproximadamente un 42% menos. La torre de texto (52 capas, atencion con proyeccion de puerta y MLP densa) es la parte cuantizada; la torre de vision, el adaptador y el proyector visual, asi como `lm_head`, `embed_tokens` y las normalizaciones de capa, se mantienen en BF16. Muse-Glimmer es un modelo denso, no un MoE: la `self_attn.gate_proj` presente en cada bloque de atencion es una proyeccion real y no un router.

Su relevancia actual es de infraestructura: sirve como pieza de despliegue para entornos AMD EPYC en Linux con la pila ZenDNN/ZenTorch, permitiendo servir un modelo de 30B sin GPU. Esta pensado como sustituto directo del modelo base en BF16 dentro de vLLM v0.28.0, con una degradacion de calidad medida en GSM8K practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer denso multimodal con torre de vision) |
| Parametros totales | 29.776.626.688 (~29,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8: pesos INT8 simetricos per-channel (estaticos) + activaciones INT8 simetricas per-token (dinamicas), RTN data-free; vision tower, proyector, `lm_head`, `embed_tokens` y layer norms en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors |

Datos adicionales: 52 capas en la torre de texto, dimension oculta 6.656, vocabulario de 202.048 tokens, tamano del repositorio 34,4 GB, pipeline declarado `image-text-to-text` / `text-generation`.

## Arquitectura y entrenamiento

El modelo base es Muse-Glimmer-30B, desarrollado por Red Hat AI. La clase de implementacion es `MuseGlimmerForConditionalGeneration`, un transformer denso con dos torres: una torre de texto de 52 capas y una torre de vision acompanada de un adaptador (`model.vision_adapter`) y un proyector (`model.vision_projection`). Cada bloque de atencion incorpora una proyeccion de puerta (`self_attn.gate_proj`) ademas de las proyecciones `q`, `k`, `v` y `o`, y el MLP es denso con proyecciones `gate`, `up` y `down`. No hay capas de mezcla de expertos.

Sobre el proceso de cuantizacion, AMD aplico LLM Compressor v0.13.0 con una receta `QuantizationModifier(scheme="W8A8", targets=["Linear"])`, excluyendo explicitamente `lm_head`, `vision_tower`, `vision_adapter` y `vision_projection`. Al ser un paso data-free (RTN), no se requirio dataset de calibracion, y precisamente por eso la ruta de vision se dejo en BF16: no hay estadisticas de activacion visual con las que calibrar. El ahorro final se queda en ~42% en lugar del ~50% teorico de un modelo solo-texto en INT8, debido a esas exclusiones y al gran tamano sin tocar de `lm_head` y `embed_tokens` (202.048 x 6.656 cada uno). No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con el pipeline declarado como `text-generation`.
- Razonamiento aritmetico basico y de varios pasos: obtiene 0,6073 en GSM8K 5-shot, por encima del baseline BF16.
- Procesamiento multimodal: el checkpoint conserva la torre de vision, el adaptador y el proyector en BF16, y la etiqueta de HuggingFace es `image-text-to-text`, aunque la model card describe la entrada y la salida como texto.
- Integracion con vLLM para servir el modelo con `trust_remote_code=True` y `dtype="bfloat16"`.
- Inferencia sobre CPU AMD EPYC con aceleracion ZenDNN.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; el modelo declara unicamente ingles.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Servicio de inferencia sin GPU en servidores AMD EPYC: el modelo esta optimizado para CPU con ZenDNN v6.1.0 y ZenTorch v2.13.0, de modo que un nodo de computo sin acelerador puede atender peticiones de generacion de texto con un modelo de ~30B a coste marginal bajo.
- Sustitucion directa del checkpoint BF16 en despliegues vLLM existentes: al mantener el mismo esquema de pesos compressed-tensors que vLLM v0.28.0 espera, se puede sustituir el modelo original reduciendo el uso de disco y memoria en aproximadamente un 42% sin recalibrar ni reentrenar.
- Evaluacion comparativa de cuantizacion: sirve como referencia reproducible para medir la perdida de calidad de una receta W8A8 RTN frente al modelo en BF16 en tareas de razonamiento aritmetico (GSM8K), usando `lm-evaluation-harness` con el backend de vLLM.
- Generacion de texto por lotes en pipelines de datos: procesos nocturnos de resumen, reescritura o clasificacion por lenguaje natural sobre grandes volumenes de texto en ingles, donde el throughput agregado importa mas que la latencia por token.
- Asistentes conversacionales de dominio general en ingles: el modelo mantiene capacidad de dialogo multi-turno; la longitud de contexto concreta no esta documentada en la informacion disponible y debe verificarse contra el modelo base antes de disenar flujos de contexto largo.
- Desarrollo y pruebas en hardware AMD sin acceso a GPU: permite a equipos de ingenieria validar plantillas de prompt, integraciones y flujos de preprocesado antes de escalar a un despliegue mayor.
- Investigacion sobre cuantizacion data-free: el checkpoint documenta explicitamente que estrategias se excluyeron del proceso y por que, lo que lo convierte en un caso de estudio util para analizar el impacto de dejar `lm_head` y `embed_tokens` en precision completa.

## Benchmarks y rendimiento

La model card publica un unico resultado, evaluado con `lm-evaluation-harness` sobre el motor de vLLM, comparando el modelo cuantizado con el baseline BF16:

| Benchmark | BF16 (base) | W8A8 (este modelo) | Recuperacion |
|---|---|---|---|
| GSM8K (5-shot) | 0,5830 | 0,6073 | 104,17% |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible. La variacion observada en GSM8K es positiva para la version cuantizada, algo que puede ocurrir por ruido estadistico del muestreo; no debe interpretarse como una mejora sistematica de calidad.

## Requisitos de hardware

- Hardware objetivo oficial: CPU AMD EPYC, sistema operativo Linux. Es el unico hardware que la model card declara como soportado.
- Peso en disco: 32,0 GiB en la version cuantizada frente a 55,5 GiB del modelo base en BF16; el repositorio completo ocupa 34,4 GB.
- VRAM estimada para GPU: no documentada por el autor. Como referencia, dado que los pesos INT8 ocupan unos 32 GiB, un despliegue en GPU requeriria previsiblemente del orden de 40-48 GB de VRAM sumando pesos y cache KV, es decir tarjetas tipo A100 80 GB o H100. No entraria en una RTX 4090 de 24 GB sin offloading a memoria del sistema.
- Inferencia en GPU consumer: no contemplada ni documentada; el checkpoint esta disenado para CPU.
- Motor de despliegue documentado: vLLM v0.28.0 con `trust_remote_code=True`.
- Pila de software requerida: PyTorch 2.13.0, ZenTorch 2.13.0, ZenDNN 6.1.0, Transformers 5.15, LLM Compressor 0.13.0.
- Ajuste de entorno: es necesario exportar `LD_PRELOAD` apuntando a `libomp.so` o `libiomp5.so` antes de lanzar vLLM o cualquier script de inferencia.
- Formatos alternativos: no hay versiones GGUF, AWQ ni GPTQ publicadas; por tanto llama.cpp, Ollama y LM Studio no son opciones directas con este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Muse-Glimmer-30B-w8a8-llmcompressor | ~29,8B | W8A8 INT8, RTN data-free | safetensors compressed-tensors | apache-2.0 | 32,0 GiB, optimizado para CPU EPYC con ZenDNN |
| RedHatAI/Muse-Glimmer-30B | ~29,8B | BF16 (sin cuantizar) | safetensors | apache-2.0 | 55,5 GiB, modelo de origen |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables en la informacion disponible |

La unica comparacion sustentada por los datos disponibles es contra el propio modelo base. No hay informacion sobre que otras cuantizaciones del mismo modelo existen ni sobre sus resultados.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles. Cualquier uso en castellano u otros idiomas queda fuera de las capacidades documentadas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos generativos de esta escala y no se ha evaluado con benchmarks de veracidad.
- Cobertura de evaluacion muy limitada: el unico benchmark publicado es GSM8K 5-shot. No hay datos de MMLU, HumanEval, evaluaciones de seguridad ni de sesgo.
- La ruta de vision no esta cuantizada pero tampoco evaluada: la model card no publica ningun resultado de tareas visuales, aunque la etiqueta del repositorio sea `image-text-to-text`. Su comportamiento real en tareas multimodales no esta documentado.
- Longitud de contexto desconocida: no se especifica en la informacion disponible, lo que impide planificar despliegues con contexto largo sin consultar el modelo base.
- Dependencia fuerte del hardware: el rendimiento optimizado se asocia a CPU AMD EPYC con ZenDNN y ZenTorch. En otros entornos (CPU Intel, ARM) no hay garantia de rendimiento ni de soporte.
- Requisitos de version estrictos: Transformers 5.15, PyTorch 2.13.0, vLLM 0.28.0 y LLM Compressor 0.13.0. Desviarse de estas versiones puede provocar que vLLM rechace el checkpoint.
- Carga incorrecta silenciosa: si se carga con `AutoModelForCausalLM` en lugar de `MuseGlimmerForConditionalGeneration`, `config.json` se degrada al LM interno solo-texto y se genera un checkpoint que vLLM rechaza.
- Licencia: apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base RedHatAI/Muse-Glimmer-30B, ya que esta cuantizacion deriva de el.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sin cuantizaciones alternativas: no existen versiones GGUF ni de 4 bits asociadas, lo que limita el despliegue en equipos de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/Muse-Glimmer-30B-w8a8-llmcompressor
- Modelo base: https://huggingface.co/RedHatAI/Muse-Glimmer-30B
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
- Repositorio de lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
