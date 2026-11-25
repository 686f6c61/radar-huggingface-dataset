# reaperdoesntknow/TameLM

## Resumen

TameLM es un checkpoint de investigación publicado por el usuario reaperdoesntknow en Hugging Face bajo el identificador `reaperdoesntknow/TameLM`. Se trata de una implementación propia de una arquitectura denominada TAMELM (tipo `tamelm_two_axis`), que combina atención enrutada, atención de profundidad y una mezcla de expertos (MoE) sin descarte de tokens (dropless). El modelo tiene 1.431.506.840 parámetros totales y un límite de secuencia configurado de 8192 tokens.

El interés de esta ficha es fundamentalmente arquitectónico: el autor explora una configuración experimental con 16 expertos (top-2), atención de profundidad con 4 slots y un mecanismo adicional de razonamiento fold/unfold. No obstante, la propia model card es explícita al señalar que no documenta receta de entrenamiento, datos utilizados, número de tokens, ni resultados de evaluación reproducibles. Las etiquetas y nombres de configuración describen la implementación, no capacidades demostradas.

Por tanto, TameLM debe considerarse un artefacto de investigación para estudiar la arquitectura publicada, no un modelo listo para producción. Requiere ejecución de código remoto (`trust_remote_code`) y no declara licencia, idiomas soportados ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`): atención enrutada, atención de profundidad y MoE dropless |
| Parametros totales | 1.431.506.840 |
| Parametros activos | no disponible (MoE con 16 expertos y top-k 2; el número de parámetros activos no se publica) |
| Longitud de contexto | 8192 tokens (máximo configurado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; dtype configurado `float32`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sin licencia declarada en el repositorio) |
| Formato de pesos | safetensors, con código de modelado propio (`modeling_tamelm.py`) |

Otros parámetros de configuración publicados: 12 capas, dimensión de embedding 768, 32 cabezas de query y 2 cabezas key/value, dimensión de experto 1536, dimensión de profundidad 256 con 8 cabezas y 4 slots, backend de atención `flex`, backend de expertos `grouped`, vocabulario de 49152 tokens, versión de Transformers registrada 5.5.0 y `use_cache: false`.

## Arquitectura y entrenamiento

La arquitectura es un transformer con modificaciones propias: atención enrutada, atención de profundidad (depth attention) con 4 slots y 8 cabezas sobre una dimensión de 256, y una capa MoE con 16 expertos de dimensión oculta 1536 y enrutamiento top-2. El export incluye además la implementación `FoldUnfoldReasoning`, configurada con `reasoning_mode="fold_unfold"`, 3 pasos de razonamiento, 2 slots, 4 cabezas, lectura directa, fold inicial, revisión completa y sesgo de posición relativa, junto con embeddings sinusoidales y 2 bancos de expertos con bank top-k 2. La implementación incorpora alternativas densas de referencia y aceleración opcional mediante CUDA FlexAttention y Triton grouped-GEMM.

No se dispone de información sobre el entrenamiento: la model card indica explícitamente que no se documentan datasets ni sus licencias, preprocesado, duración o número de tokens, ajustes de optimizador, hardware ni criterios de selección de checkpoint. Tampoco se especifica si hubo RLHF, DPO u otra fase de alineamiento.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` con la clase `TAMELM`.
- Arquitectura MoE con 16 expertos y enrutamiento top-2, orientada a investigación sobre eficiencia computacional.
- Mecanismo de razonamiento fold/unfold configurado (3 pasos, 2 slots), cuyo efecto real no está validado ni medido.
- Atención de profundidad con 4 slots como mecanismo alternativo de procesamiento por capas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad funcional.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (visión, audio, thinking mode validado): no disponibles.
- Caché de inferencia: deshabilitada en la configuración (`use_cache: false`), lo que afecta al rendimiento en generación secuencial.

## Casos de uso

- Investigación arquitectónica sobre MoE: el modelo permite estudiar el comportamiento de un enrutamiento top-2 con 16 expertos y backend grouped-GEMM en un transformer de 12 capas, útil para experimentos académicos sobre eficiencia de parámetros.
- Estudio de atención de profundidad: los 4 slots y 8 cabezas de profundidad configurados permiten analizar variantes de procesamiento por capas frente a la atención estándar.
- Análisis del mecanismo fold/unfold: sirve como banco de pruebas para reproducir y evaluar la propuesta de razonamiento iterativo del autor, comparándola con líneas base densas incluidas en la implementación.
- Pruebas de integración de código personalizado en Transformers: el `auto_map` con `TAMEConfig` y `TAMELM` permite validar flujos de `trust_remote_code` y empaquetado de arquitecturas no nativas.
- Experimentos con FlexAttention y Triton: la implementación incluye rutas aceleradas opcionales, útil para medir compatibilidad de backends en distintos entornos CUDA.
- Reproducción y auditoría de checkpoints: dado que el repositorio incluye pesos, tokenizer y código, puede emplearse para auditar cómo se serializa una arquitectura custom y qué metadatos se registran.
- Docencia sobre arquitecturas híbridas: como ejemplo práctico de configuración MoE con parámetros explícitos (expertos, top-k, bancos) para ilustrar conceptos en cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que no se declaran puntuaciones de benchmark, mejoras comparativas ni garantías de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.431.506.840 parámetros en `float32`, los pesos ocupan aproximadamente 5,7 GB; en `float16`/`bfloat16` rondarían 2,9 GB. A ello hay que sumar activaciones, atención sobre 8192 tokens y buffers del backend grouped-GEMM, por lo que el consumo real será superior y depende del runtime.
- GPU recomendadas: no hay datos publicados. Por tamaño, cabría en GPUs de 24 GB (RTX 4090, A10G, L4) en precisión reducida; para `float32` y secuencias largas conviene una A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 24 GB o más con precisión reducida, aunque no está validado por el autor.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es custom y `use_cache` está deshabilitado.
- Latencia y throughput: no disponibles. La ausencia de caché KV y el uso de código custom condicionan negativamente la generación secuencial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TameLM | 1.431.506.840 | 8192 | TAMELM (MoE + depth attention) | no disponible | Hugging Face, código custom |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- Sin licencia declarada: no se permite asumir términos de uso comercial; es necesario contactar con el autor antes de redistribuir o desplegar.
- Sin receta de entrenamiento ni datos documentados: imposible evaluar sesgos de dataset, contaminación o cobertura lingüística.
- Sin benchmarks ni evaluación reproducible: no hay evidencia de calidad, razonamiento o fidelidad factual.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje y no cuantificado en este caso.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto en castellano u otras lenguas.
- Código custom con `trust_remote_code`: requiere revisión de seguridad de `modeling_tamelm.py` antes de ejecutarlo y fijar una revisión del repositorio para reproducibilidad.
- Caché KV deshabilitada (`use_cache: false`): la generación secuencial será más costosa y no se garantiza un rendimiento aceptable en producción.
- Dependencias no bloqueadas: la versión de Transformers registrada (5.5.0) es metadato de exportación, no un lockfile probado.
- Compatibilidad de backends variable: las rutas FlexAttention/Triton dependen de hardware y paquetes instalados.
- Ausencia de validación end-to-end: el autor no confirma una receta de carga y generación probada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/reaperdoesntknow/TameLM)
- [Archivos del repositorio](https://huggingface.co/reaperdoesntknow/TameLM/tree/main)
- [Configuración publicada (config.json)](https://huggingface.co/reaperdoesntknow/TameLM/blob/main/config.json)
- [Implementación custom (modeling_tamelm.py)](https://huggingface.co/reaperdoesntknow/TameLM/blob/main/modeling_tamelm.py)
- [Avisos de terceros (THIRD_PARTY_NOTICES.txt)](https://huggingface.co/reaperdoesntknow/TameLM/blob/main/THIRD_PARTY_NOTICES.txt)
