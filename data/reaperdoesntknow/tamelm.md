# reaperdoesntknow/TameLM

## Resumen

TameLM es un checkpoint de lenguaje de tipo experimental publicado por el usuario reaperdoesntknow en Hugging Face bajo el identificador `reaperdoesntknow/TameLM`. Se presenta como un modelo de "concepto" para investigacion, construido sobre una arquitectura propia denominada TAMELM (tipo `tamelm_two_axis`), que combina atención enrutada, atención de profundidad y una implementación de mezcla de expertos (MoE) sin descarte de tokens (*dropless*). No es una arquitectura nativa de Transformers: requiere código personalizado (`modeling_tamelm.py`) y ejecución con `trust_remote_code`.

El modelo cuenta con 1.431.506.840 parámetros totales según los pesos en safetensors, 12 capas, dimensión de embedding de 768, 32 cabezas de consulta y 2 cabezas clave/valor, 16 expertos con top-k 2 y una longitud máxima de secuencia configurada de 8192 tokens. El repositorio ocupa 11,5 GB y acumula 2576 descargas, aunque no registra ningún "like".

La relevancia de TameLM es fundamentalmente arquitectónica: explora mecanismos poco habituales como el plegado/desplegado de razonamiento (*fold/unfold*), bancos de expertos múltiples y atención de profundidad. La propia model card advierte explícitamente de que no documenta receta de entrenamiento, evaluación reproducible ni resultados de benchmarks, y de que los nombres de arquitectura no implican capacidad de razonamiento demostrada. Debe tratarse, por tanto, como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con atención enrutada, atención de profundidad y MoE dropless |
| Parametros totales | 1.431.506.840 |
| Parametros activos | no disponible (MoE con 16 expertos y top-k 2, pero sin desglose publicado) |
| Longitud de contexto | 8192 tokens (configurada) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors |
| Capas | 12 |
| Dimension de embedding | 768 |
| Cabezas de consulta / clave-valor | 32 / 2 |
| Expertos / top-k | 16 / 2 |
| Dimension oculta de experto | 1536 |
| Modo y dimension de profundidad | `attention`, 256 |
| Cabezas de profundidad / slots | 8 / 4 |
| Backend de atención | `flex` (FlexAttention opcional) |
| Backend de expertos | `grouped` (Triton grouped-GEMM opcional) |
| Tamano de vocabulario | 49152 |
| Dtype configurado | float32 |
| Version de Transformers registrada | 5.5.0 |
| Uso de cache | `false` |
| Tamano del repositorio | 11,5 GB |

## Arquitectura y entrenamiento

TameLM implementa una arquitectura propietaria de tipo `tamelm_two_axis` con 12 capas y dimensión de embedding 768. Incorpora tres mecanismos diferenciados: atención enrutada (*routed attention*), atención de profundidad (*depth attention*) con dimensión 256, 8 cabezas y 4 slots, y una capa de mezcla de expertos sin descarte de tokens con 16 expertos, top-k 2 y dimensión oculta de experto de 1536. La configuración declara además un módulo `FoldUnfoldReasoning` con `reasoning_mode="fold_unfold"`, 3 pasos de razonamiento, 2 slots, 4 cabezas, lectura directa, plegado inicial, revisita completa y sesgo de posición relativa, junto con embeddings sinusoidales y 2 bancos de expertos con top-k 2 por banco. La implementación incluye alternativas densas de referencia y aceleración opcional mediante CUDA FlexAttention y Triton grouped-GEMM.

No se dispone de información sobre el entrenamiento: la model card indica explícitamente que no se documentan los conjuntos de datos ni sus licencias, el preprocesamiento, la duración o el número de tokens, los hiperparámetros del optimizador, el hardware empleado ni los criterios de selección de checkpoints. Tampoco se especifica si hubo RLHF, DPO u otra fase de alineamiento. El dtype configurado es float32, pero el autor advierte de que esto no constituye un informe de la precisión de entrenamiento.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` con código personalizado.
- Soporte de razonamiento multi-paso a través del mecanismo configurado `FoldUnfoldReasoning` (3 pasos, 2 slots), si bien no se han publicado resultados que demuestren su eficacia.
- Mezcla de expertos con enrutamiento top-k sobre 16 expertos y dos bancos de expertos, lo que en teoría permite especialización por tipo de token.
- Atención de profundidad y atención enrutada como mecanismos alternativos de modelado de dependencias.
- Longitud de contexto configurada de hasta 8192 tokens.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de orquestación multi-paso a nivel de API.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito más allá del módulo de plegado/desplegado.
- Uso de caché desactivado en la configuración (`use_cache: false`), lo que condiciona la generación incremental.

## Casos de uso

- Investigación arquitectónica sobre MoE dropless: el modelo permite experimentar con enrutamiento top-k 2 sobre 16 expertos y comparar el comportamiento frente a alternativas densas incluidas en la implementación.
- Estudio de atención de profundidad: útil para analizar cómo los slots y cabezas de profundidad afectan a la representación interna en un transformer de 12 capas.
- Análisis del mecanismo fold/unfold: permite reproducir y examinar el plegado y desplegado de pasos de razonamiento en un entorno controlado, siempre que se valide su comportamiento empíricamente.
- Pruebas de backend de atención: la implementación permite comparar el backend `flex` (FlexAttention en CUDA) con alternativas densas de referencia para medir rendimiento y estabilidad numérica.
- Evaluación de viabilidad de inferencia con caché desactivada: útil para medir el coste de recálculo completo en secuencias de hasta 8192 tokens y decidir si merece la pena adaptar la implementación.
- Reproducción de experimentos académicos: al estar publicados pesos, configuración y tokenizador, sirve como base para replicar estudios sobre arquitecturas híbridas de atención y expertos.
- Docencia y formación: puede emplearse como ejemplo práctico de cómo se estructura un modelo con código personalizado y `auto_map` en Hugging Face, advirtiendo siempre de la falta de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de benchmark, mejoras comparativas ni garantías de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 5,7 GB solo para pesos (1,43 mil millones de parámetros × 4 bytes), más activaciones y estados intermedios; con contexto de 8192 tokens y caché desactivada el consumo real puede superar holgadamente los 8-12 GB según implementación.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, una RTX 4090 (24 GB) o una A100 (40/80 GB) permitirían alojar los pesos en float32 con margen; una RTX 3090 (24 GB) también sería viable.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y GPUs con 16 GB o más, aunque la falta de validación end-to-end impide confirmarlo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía prevista. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la ausencia de cuantizaciones publicadas limita estas alternativas.
- Aceleración opcional: CUDA FlexAttention y Triton grouped-GEMM, dependientes del runtime, hardware y paquetes instalados.
- Latencia y throughput: no disponibles. El autor no ofrece garantías de inferencia independientes del hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE de ~1,4 mil millones de parámetros con atención personalizada) ni datos de rendimiento que permitan una comparación rigurosa. Cualquier comparación con alternativas como Mixtral, Qwen-MoE o modelos densos de tamaño similar carecería de base empírica en este repositorio.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni informe de evaluación reproducible, ni métricas de calidad.
- Receta de entrenamiento no documentada: se desconocen datos, licencias de los datos, tokens vistos, optimizador y hardware.
- Licencia no declarada: no se puede asumir uso comercial; es necesario confirmar los términos con el propietario del repositorio antes de redistribuir o desplegar.
- Código personalizado: requiere `trust_remote_code=True`; debe revisarse `modeling_tamelm.py` antes de ejecutarlo y fijarse una revisión del repositorio para reproducibilidad.
- La versión de Transformers registrada (5.5.0) es metadato de exportación, no un lockfile de dependencias probado.
- No se ha validado una receta end-to-end de carga y generación; el propio autor lo advierte.
- Caché desactivada (`use_cache: false`): la generación puede ser costosa en secuencias largas.
- Idiomas no declarados: riesgo de comportamiento deficiente o impredecible fuera del idioma o idiomas de entrenamiento, que se desconocen.
- Riesgo de alucinación, sesgo y contenido inseguro inherente a cualquier modelo de lenguaje sin evaluación publicada.
- No hay garantía de calidad en contexto largo pese a la longitud configurada de 8192 tokens.
- Cero "likes" y autor sin historial verificable en la información disponible: tratar como artefacto de investigación, no como base para decisiones consecuentes sin verificación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/TameLM
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/TameLM/tree/main
- Configuración publicada: https://huggingface.co/reaperdoesntknow/TameLM/blob/main/config.json
- Implementación personalizada del modelo: https://huggingface.co/reaperdoesntknow/TameLM/blob/main/modeling_tamelm.py
- Avisos de terceros: https://huggingface.co/reaperdoesntknow/TameLM/blob/main/THIRD_PARTY_NOTICES.txt
