# reaperdoesntknow/TameLM

## Resumen

TameLM es un checkpoint de lenguaje de tipo experimental publicado por el usuario reaperdoesntknow en Hugging Face bajo el identificador `reaperdoesntknow/TameLM`. Se trata de un modelo de investigación que explora una arquitectura propia denominada TAMELM (tipo `tamelm_two_axis`), que combina atención enrutada (routed attention), atención de profundidad (depth attention) y una capa de mezcla de expertos (MoE) sin descarte de tokens (dropless). El repositorio incluye pesos, configuración, tokenizer y el código de modelado personalizado (`modeling_tamelm.py`), por lo que no es una arquitectura nativa de Transformers.

El modelo cuenta con 1.431.506.840 parámetros totales según los safetensors publicados, 12 capas, dimensión de embedding de 768 y una longitud máxima de secuencia configurada de 8192 tokens. Incorpora 16 expertos con top-k 2 y una dimensión oculta de experto de 1536, además de un módulo de razonamiento `FoldUnfoldReasoning` con 3 pasos de razonamiento y 2 bancos de expertos. La configuración declara `float32` como dtype y la versión de Transformers 5.5.0 como metadato de exportación.

Su relevancia es fundamentalmente investigadora: la propia model card advierte que no se documenta una receta de entrenamiento completa, no se publican resultados de benchmarks y no se hacen afirmaciones de calidad de razonamiento ni de preparación para producción. Cualquier evaluación debe realizarse de forma independiente antes de considerar su uso en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (tipo `tamelm_two_axis`): atención enrutada, atención de profundidad y MoE dropless |
| Parametros totales | 1.431.506.840 |
| Parametros activos | No disponible (MoE con 16 expertos y top-k 2, pero sin desglose de parámetros activos publicado) |
| Longitud de contexto | 8192 tokens (máximo configurado) |
| Tipos de cuantizacion | No disponible (solo se declara dtype `float32` en la configuración) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors (repositorio con `config.json`, tokenizer y `modeling_tamelm.py`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer personalizado de 12 capas con dimensión de embedding de 768, 32 cabezas de consulta y 2 cabezas de clave/valor, lo que apunta a un esquema de atención con compartición de KV. Sobre esta base se añaden tres componentes propios: atención enrutada, atención de profundidad (con dimensión 256, 8 cabezas y 4 slots) y una capa MoE dropless con 16 expertos, top-k 2 y dimensión oculta de experto de 1536. El backend de atención configurado es `flex` y el de expertos `grouped`, con soporte opcional para aceleración CUDA FlexAttention y Triton grouped-GEMM.

El módulo `FoldUnfoldReasoning` selecciona `reasoning_mode="fold_unfold"` con 3 pasos de razonamiento, 2 slots, 4 cabezas, lectura directa, plegado inicial, revisión completa y sesgo de posición relativa. También habilita embeddings sinusoidales y configura 2 bancos de expertos con top-k 2 por banco. La model card insiste en que estos son ajustes arquitectónicos y no resultados medidos de razonamiento.

No se documenta la receta de entrenamiento: no se especifican datasets, número de tokens, preprocesado, duración, optimizador, hardware ni criterios de selección de checkpoints. Tampoco se indica si hubo RLHF, DPO u otra fase de alineamiento. La configuración declara `use_cache: false`, lo que puede afectar al rendimiento en generación autoregresiva.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` con código personalizado.
- Razonamiento multi-paso potencial a través del módulo `FoldUnfoldReasoning` (3 pasos, 2 slots), aunque sin evidencia publicada de su eficacia.
- Mezcla de expertos con 16 expertos y top-k 2, más 2 bancos de expertos con top-k 2 por banco.
- Atención de profundidad con 4 slots y 8 cabezas, orientada a procesamiento iterativo interno.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación arquitectónica: el modelo sirve para estudiar el comportamiento de atención enrutada, atención de profundidad y MoE dropless en un transformer de 1,4 mil millones de parámetros, comparando su dinámica interna con arquitecturas estándar.
- Experimentación con `FoldUnfoldReasoning`: permite analizar empíricamente si el plegado/desplegado con 3 pasos y 2 slots aporta ventajas en tareas de razonamiento de cadena corta, siempre con evaluación propia.
- Reproducción de configuraciones MoE: útil para validar implementaciones de MoE dropless con top-k 2 y 16 expertos en entornos de investigación con GPUs de gama alta.
- Pruebas de backend de atención: al soportar `flex` y aceleración Triton, puede emplearse para comparar FlexAttention frente a alternativas densas en cargas de 8192 tokens.
- Generación de texto controlada en laboratorio: con 8192 tokens de contexto configurado, permite experimentos de continuación de texto y prompting largo en entornos de investigación, sin garantías de calidad.
- Estudio de eficiencia de KV: con 2 cabezas KV y 32 cabezas de consulta, es un banco de pruebas para medir el ahorro de memoria en atención multi-consulta frente a multi-cabeza completa.
- Docencia y análisis de código de modelado: el repositorio incluye `modeling_tamelm.py`, lo que facilita su uso como ejemplo didáctico de arquitecturas personalizadas en Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `float32`: aproximadamente 5,7 GB solo para pesos (1.431.506.840 parámetros × 4 bytes), más estados de activación, caché y buffers; en la práctica se recomienda al menos 16 GB para contexto corto y más para 8192 tokens.
- VRAM estimada en `float16`/`bfloat16` (si se convierte manualmente): aproximadamente 2,9 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 24 GB para experimentación; GPUs de 16 GB pueden ser suficientes en precisión reducida y contexto corto.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y similares con 16-24 GB, siempre que se valide la compatibilidad del código personalizado.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y revisión fijada del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de código personalizado complica su integración en esos motores.
- Latencia y throughput estimados: no disponibles; la configuración declara `use_cache: false`, lo que previsiblemente penaliza la generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TameLM | 1.431.506.840 | 8192 | No disponible | Hugging Face, código personalizado | Arquitectura experimental TAMELM con MoE dropless y FoldUnfoldReasoning |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría |

No se dispone de datos públicos de benchmarks ni de una categoría claramente definida que permita comparar TameLM con alternativas concretas de forma rigurosa.

## Limitaciones y advertencias

- No se declara licencia en el repositorio; es imprescindible confirmar los términos con el autor antes de cualquier redistribución o uso comercial.
- No se documenta la receta de entrenamiento: se desconocen datasets, licencias de datos, número de tokens y proceso de alineamiento.
- No hay resultados de benchmarks ni evaluaciones reproducibles publicadas; la model card advierte explícitamente que los ajustes arquitectónicos no implican capacidad de razonamiento demostrada.
- Riesgo de alucinación, sesgos y contenido inseguro inherente a un modelo de lenguaje sin evaluación publicada.
- Idiomas soportados no declarados; el comportamiento multilingüe es desconocido.
- Requiere ejecución de código remoto (`trust_remote_code=True`) con `modeling_tamelm.py`; hay que revisar la implementación y fijar una revisión del repositorio para reproducibilidad.
- La versión de Transformers registrada (5.5.0) es metadato de exportación, no un lockfile de dependencias probado.
- La configuración declara `use_cache: false`, lo que puede degradar la latencia en generación larga.
- No se garantiza el funcionamiento end-to-end de carga y generación en todos los entornos; la compatibilidad de backends (FlexAttention, Triton grouped-GEMM) depende de hardware y paquetes instalados.
- No apto para decisiones consecuenciales sin verificación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/TameLM
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/TameLM/tree/main
- Configuración publicada: https://huggingface.co/reaperdoesntknow/TameLM/blob/main/config.json
- Implementación del modelo: https://huggingface.co/reaperdoesntknow/TameLM/blob/main/modeling_tamelm.py
- Avisos de terceros: https://huggingface.co/reaperdoesntknow/TameLM/blob/main/THIRD_PARTY_NOTICES.txt
