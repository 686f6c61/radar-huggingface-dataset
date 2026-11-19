# reaperdoesntknow/delta

## Resumen

**delta** es un checkpoint de lenguaje de la familia TAMELM publicado por el usuario reaperdoesntknow en Hugging Face. Se trata de un modelo de investigación que explora una configuración arquitectónica concreta: atención enrutada (routed attention), atención de profundidad (depth attention) y mezcla de expertos sin descarte (dropless MoE). El repositorio incluye los pesos, la configuración, los activos del tokenizador y el código de modelado personalizado (`modeling_tamelm.py`), lo que lo convierte en un artefacto orientado al estudio de la arquitectura más que a su uso en producción.

El modelo tiene 410.256.184 parámetros totales según los safetensors publicados, 28 capas, dimensión de embedding de 512 y una longitud máxima de secuencia configurada de 1024 tokens. La configuración declara 4 expertos con top-k 2 y una dimensión oculta de experto de 2048, además de un mecanismo de atención de profundidad con 4 cabezas y 16 slots. El vocabulario es de 49152 tokens y el dtype configurado es float32.

La relevancia de este checkpoint es fundamentalmente investigadora: permite inspeccionar y experimentar con una combinación arquitectónica poco habitual (MoE enrutado combinado con atención de profundidad) sin partir de cero. No obstante, el propio autor advierte de que no se documenta receta de entrenamiento, evaluación reproducible ni rendimiento medido, y de que no se ha validado una receta de carga y generación de extremo a extremo. La licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con routed attention, depth attention y MoE dropless |
| Parametros totales | 410.256.184 |
| Parametros activos | no disponible (4 expertos, top-k 2; el autor no publica recuento activo medido) |
| Longitud de contexto | 1024 tokens (máximo configurado) |
| Tipos de cuantizacion | no disponible (dtype configurado: float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors, con código de modelado personalizado (`modeling_tamelm.py`) |

Otros parámetros de configuración publicados: 28 capas, dimensión de embedding 512, 16 cabezas de query, 2 cabezas key/value, dimensión de experto 2048, modo de profundidad `attention`, dimensión de profundidad 512, 4 cabezas de profundidad, 16 slots de profundidad, backend de atención `flex`, backend de expertos `grouped`, vocabulario 49152, versión de Transformers registrada 5.5.0, `use_cache: false`.

## Arquitectura y entrenamiento

La arquitectura declarada es TAMELM, un transformer con tres elementos diferenciadores según la model card: atención enrutada, atención de profundidad y una mezcla de expertos sin descarte (dropless MoE). La configuración combina 28 capas con dimensión 512, 16 cabezas de query y solo 2 cabezas key/value (atención con compartición de K/V tipo GQA), más 4 expertos con top-k 2 y dimensión oculta 2048. El mecanismo de profundidad opera en modo `attention` con 4 cabezas y 16 slots sobre una dimensión de 512. El backend de atención es `flex` (FlexAttention) y el de expertos `grouped` (grouped GEMM), con implementaciones densas/de referencia alternativas y aceleración opcional vía CUDA FlexAttention y Triton grouped-GEMM. La caché de inferencia está desactivada (`use_cache: false`).

No se documenta la receta de entrenamiento: el repositorio no especifica conjuntos de datos ni sus licencias, preprocesado, duración o número de tokens, ajustes de optimizador, hardware ni criterios de selección de checkpoints. Tampoco se indica si hubo RLHF, DPO u otra fase de alineamiento. El autor subraya explícitamente que los nombres de arquitectura y los campos de configuración describen la implementación, no una capacidad de razonamiento demostrada ni un rendimiento medido, y que un límite de secuencia configurado no es evidencia de calidad en contexto largo.

## Capacidades

- Generación de texto autoregresiva como tarea principal declarada (`text-generation`).
- Exploración de arquitecturas MoE enrutadas con top-k 2 sobre 4 expertos.
- Atención de profundidad con 16 slots y 4 cabezas, según la configuración publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución con código personalizado vía `auto_map` (`AutoConfig` → `TAMEConfig`, `AutoModelForCausalLM` → `TAMELM`), lo que permite cargarlo con Transformers usando `trust_remote_code=True`.

## Casos de uso

- Investigación arquitectónica sobre MoE enrutado: el checkpoint permite inspeccionar cómo se implementa una mezcla de 4 expertos con top-k 2 y backend grouped-GEMM, y comparar su comportamiento con implementaciones densas de referencia incluidas en el propio código.
- Estudio de atención de profundidad: los 16 slots y 4 cabezas de profundidad configurados permiten experimentar con este mecanismo sobre secuencias de hasta 1024 tokens, un régimen manejable para pruebas controladas.
- Reproducción y auditoría de código de modelado personalizado: al incluir `modeling_tamelm.py`, sirve para revisar patrones de implementación de FlexAttention y Triton en un transformer pequeño (410 M de parámetros).
- Pruebas de integración con Transformers 5.x: la configuración registra la versión 5.5.0, por lo que es útil para validar flujos de carga con `auto_map` y código remoto en esa rama.
- Experimentos de ajuste fino a pequeña escala: con 410 M de parámetros y dtype float32, cabe en una única GPU de consumo para tareas de investigación con datasets pequeños, siempre que se valide primero la carga.
- Docencia y divulgación técnica: un modelo de este tamaño con arquitectura no estándar resulta adecuado para explicar MoE, GQA y atención de profundidad en entornos formativos, sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirman puntuaciones de benchmark, mejoras comparativas ni garantías de aptitud para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 410.256.184 parámetros en float32, los pesos ocupan aproximadamente 1,64 GB; en float16/bfloat16, unos 0,82 GB. A ello hay que sumar activaciones, buffers de atención y memoria del runtime, por lo que conviene reservar al menos 3-4 GB en float32 y 2-3 GB en precisión reducida, como estimación orientativa.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, cualquier GPU con 8 GB o más debería acomodar los pesos; para pruebas con FlexAttention y Triton se recomienda hardware NVIDIA con soporte CUDA reciente.
- GPU de consumo: sí, previsiblemente cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB en precisión reducida, sujeto a validar la carga.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura es personalizada y no está integrada de forma nativa.
- Latencia y throughput: no disponibles. La configuración desactiva la caché (`use_cache: false`), lo que previsiblemente penaliza la generación autoregresiva al recomputar el contexto en cada paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reaperdoesntknow/delta | 410.256.184 | 1024 | no disponible | Hugging Face, código personalizado | MoE dropless de 4 expertos, depth attention, sin benchmarks |
| Qwen2.5-0.5B | ~494 M | 32 768 | Apache 2.0 | Hugging Face, integración nativa en Transformers | Transformer denso estándar, benchmarks publicados |
| SmolLM2-360M | ~362 M | 8192 | Apache 2.0 | Hugging Face, integración nativa | Transformer denso, orientado a dispositivos de borde |
| TinyLlama-1.1B | ~1,1 B | 2048 | Apache 2.0 | Hugging Face, integración nativa | Transformer denso, ampliamente probado en producción |

La comparación es estructural, no de rendimiento: no existen métricas publicadas de delta que permitan contrastar calidad frente a estas alternativas. La diferencia principal radica en la arquitectura experimental y en la ausencia de licencia y de evaluación reproducible, frente a modelos densos convencionales con soporte nativo y benchmarks.

## Limitaciones y advertencias

- Licencia no declarada: no se permite asumir uso comercial; es necesario confirmar los términos con el propietario del repositorio antes de redistribuir o desplegar.
- Sin benchmarks ni evaluación reproducible: no hay evidencia publicada de calidad, razonamiento ni rendimiento en tareas concretas.
- Sin receta de entrenamiento documentada: se desconocen datasets, licencias de datos, número de tokens y criterios de selección de checkpoints, lo que impide auditar sesgos u origen de datos.
- Riesgo de alucinación y salidas incorrectas, sesgadas o inseguras: el autor recomienda evaluación independiente antes de usar las salidas en cualquier aplicación.
- Contexto limitado a 1024 tokens: insuficiente para conversaciones multi-turno largas, documentos extensos o agentes con historial amplio.
- Idiomas no declarados: no hay garantía de cobertura multilingüe ni de calidad en castellano.
- Código remoto requerido: la carga exige `trust_remote_code=True`; conviene revisar `modeling_tamelm.py` y fijar una revisión concreta del repositorio para reproducibilidad.
- Receta de carga y generación no validada de extremo a extremo según la propia model card; no se ofrece garantía de inferencia independiente del hardware.
- Caché desactivada (`use_cache: false`): impacto negativo esperable en latencia de generación.
- Compatibilidad de backends dependiente de runtime, hardware y paquetes instalados (FlexAttention/Triton).
- Sin soporte confirmado en motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) al tratarse de una arquitectura personalizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/delta
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/delta/tree/main
- Configuración publicada: https://huggingface.co/reaperdoesntknow/delta/blob/main/config.json
- Implementación personalizada: https://huggingface.co/reaperdoesntknow/delta/blob/main/modeling_tamelm.py
