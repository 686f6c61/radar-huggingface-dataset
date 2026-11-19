# reaperdoesntknow/echo

## Resumen

Echo es un checkpoint de investigación publicado por el usuario reaperdoesntknow en Hugging Face bajo la arquitectura propietaria TAMELM (tipo `tamelm_two_axis`). Se trata de un modelo de generación de texto de 707.140.400 parámetros totales que combina atención enrutada (routed attention), atención de profundidad (depth attention) y una mezcla de expertos (MoE) sin descarte de tokens (dropless). El repositorio incluye pesos, configuración, tokenizer y el código de modelado personalizado (`modeling_tamelm.py`), lo que lo convierte en un artefacto orientado a la experimentación arquitectónica más que a un uso productivo directo.

El modelo no documenta receta de entrenamiento, composición del dataset, número de tokens vistos ni resultados de evaluación reproducibles. La model card es explícita al señalar que los nombres de la arquitectura y los campos de configuración describen la implementación, no una capacidad de razonamiento demostrada ni un rendimiento medido en benchmarks. Esto sitúa a Echo en la categoría de "concept model" de investigación: su interés radica en la configuración concreta de atención y MoE que implementa, no en métricas de calidad.

Con 12 capas, dimensión de embedding de 1024, 16 cabezas de consulta y 4 de clave/valor, 4 expertos con top-k 2 y una longitud máxima de secuencia configurada de 1024 tokens, Echo es un modelo pequeño en parámetros pero con un diseño de atención poco convencional. Su relevancia actual es limitada fuera del ámbito de la investigación en arquitecturas alternativas, dado que no hay licencia declarada, no hay idiomas documentados y no se ha validado un recetario de carga y generación de extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`): routed attention, depth attention y MoE dropless |
| Parámetros totales | 707.140.400 |
| Parámetros activos | no disponible (MoE con 4 expertos y top-k 2; el número de parámetros activos no se publica) |
| Longitud de contexto | 1024 tokens (máximo configurado en `config.json`) |
| Tipos de cuantización | no disponible (dtype configurado: float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors |
| Capas | 12 |
| Dimensión de embedding | 1024 |
| Cabezas de consulta / clave-valor | 16 / 4 |
| Expertos / top-k | 4 / 2 |
| Dimensión oculta de experto | 4096 |
| Modo de profundidad | attention |
| Dimensión de profundidad | 768 |
| Cabezas de profundidad | 8 |
| Slots de profundidad | 16 |
| Backend de atención | flex |
| Backend de expertos | grouped |
| Tamaño de vocabulario | 49152 |
| Dtype configurado | float32 |
| Versión de Transformers registrada | 5.5.0 |
| Uso de caché | false |
| Tamaño del repositorio | 14,1 GB |

## Arquitectura y entrenamiento

Echo implementa TAMELM, una arquitectura de transformer con dos ejes de atención diferenciados: atención enrutada (routed attention) y atención de profundidad (depth attention). La atención de profundidad opera con dimensión 768, 8 cabezas y 16 slots, lo que sugiere un mecanismo de atención sobre representaciones por capa o por profundidad, distinto de la atención secuencial estándar sobre tokens. La componente MoE es dropless, con 4 expertos, top-k 2 y dimensión oculta de 4096 por experto, lo que implica que cada token se enruta a dos expertos sin descartar tokens durante el entrenamiento. La configuración selecciona el backend `flex` para atención (FlexAttention) y `grouped` para los expertos (GEMM agrupado), con alternativas densas/de referencia incluidas en el código.

No se documenta la receta de entrenamiento: ni número de tokens, ni composición del dataset, ni licencias de los datos, ni duración, ni optimizador, ni hardware, ni criterios de selección de checkpoints. Tampoco se indica si hubo RLHF, DPO o ajuste por instrucciones. La model card advierte que el dtype configurado (float32) no es un informe de precisión de entrenamiento y que el límite de secuencia configurado no es evidencia de calidad en contexto largo. Existe un export separado denominado Echo_R que selecciona el backend `dense`; la card aclara que esta diferencia de configuración no establece linaje de entrenamiento ni equivalencia entre pesos.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` con `auto_map` a `modeling_tamelm.TAMELM`.
- Arquitectura MoE con enrutamiento top-2 sobre 4 expertos, que en teoría permite especialización por token.
- Atención de profundidad como mecanismo adicional sobre el eje de capas, no documentado en cuanto a efectos observables.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas soportados.
- No se documentan modos especiales (thinking mode, visión, audio).
- El código incluye alternativas densas/de referencia y aceleración opcional con CUDA FlexAttention y Triton grouped-GEMM, dependiente de runtime y hardware.

## Casos de uso

- Investigación en arquitecturas de atención: el modelo permite estudiar empíricamente el comportamiento de routed attention y depth attention en un transformer de 12 capas, comparando el backend `flex` de este export con el `dense` de Echo_R.
- Estudio de MoE dropless: con 4 expertos y top-k 2, sirve para analizar patrones de enrutamiento y balance de carga entre expertos en un modelo de tamaño contenido.
- Reproducción de experimentos arquitectónicos: al incluir `modeling_tamelm.py` y `config.json`, un investigador puede auditar la implementación y fijar una revisión concreta del repositorio para reproducibilidad.
- Prototipado de pipelines de carga personalizada: útil para validar flujos de `trust_remote_code` y `auto_map` en Transformers 5.5.0 antes de escalar a modelos mayores.
- Benchmarking de backends de atención: la elección entre `flex` y `dense` permite medir diferencias de latencia y memoria en el mismo esqueleto arquitectónico.
- Docencia y formación: como ejemplo didáctico de implementación MoE con atención no estándar en un repositorio pequeño (14,1 GB) y con código legible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirman puntuaciones de benchmark, mejoras comparativas ni garantías de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2,8 GB solo para pesos (707 M de parámetros × 4 bytes), más activaciones y buffers de atención; el tamaño del repositorio (14,1 GB) sugiere artefactos adicionales u optimizadores incluidos.
- No se dispone de estimaciones para cuantizaciones alternativas porque no se documentan tipos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 707 M de parámetros en float32 cabría en GPUs consumer con al menos 8 GB de VRAM, pero la compatibilidad real depende de los backends `flex` (FlexAttention) y `grouped` (Triton grouped-GEMM), que requieren CUDA y paquetes específicos.
- Cabe en GPU consumer: probablemente sí por tamaño, pero no validado; la model card no ofrece garantía de inferencia independiente del hardware.
- Opciones de despliegue: Transformers con código remoto (`trust_remote_code=True`) y revisión fijada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (arquitecturas TAMELM o MoE de investigación con atención de profundidad) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- No se declara licencia en el repositorio; es necesario confirmar los términos con el propietario antes de redistribuir o desplegar, y no se debe inferir una licencia del backbone o del framework.
- No hay receta de entrenamiento ni evaluación reproducible: se desconocen dataset, tokens, optimizador, hardware y criterios de selección de checkpoints.
- No se documentan sesgos conocidos, pero la ausencia de evaluación implica riesgo de sesgo, memorización y contenido inseguro no cuantificado.
- Riesgo de alucinación inherente a todo modelo de lenguaje; la card recomienda verificación independiente antes de usar salidas en decisiones consecuentes.
- Contexto máximo configurado de 1024 tokens, muy limitado para aplicaciones conversacionales o de documentos largos; además, el límite configurado no garantiza calidad en contexto largo.
- Idiomas no documentados; no hay evidencia de soporte multilingüe.
- El código es personalizado y requiere ejecución remota (`trust_remote_code`); hay que revisar la implementación y fijar una revisión del repositorio por reproducibilidad.
- La versión de Transformers registrada (5.5.0) es metadato de exportación, no un lockfile de dependencias probado.
- No se ha validado un recetario de carga y generación de extremo a extremo para esta card.
- El flag `use_cache: false` en la configuración puede afectar al rendimiento en generación autoregresiva.
- La diferencia entre Echo (backend `flex`) y Echo_R (backend `dense`) no implica linaje de entrenamiento ni equivalencia de pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/echo
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/echo/tree/main
- Configuración publicada: https://huggingface.co/reaperdoesntknow/echo/blob/main/config.json
- Implementación del modelo: https://huggingface.co/reaperdoesntknow/echo/blob/main/modeling_tamelm.py
