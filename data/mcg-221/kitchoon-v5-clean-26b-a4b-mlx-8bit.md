# McG-221/Kitchoon-V5-Clean-26B-A4B-mlx-8Bit

## Resumen

Kitchoon-V5-Clean-26B-A4B-mlx-8Bit es una conversión al formato MLX del modelo SubMaroon/Kitchoon-V5-Clean-26B-A4B, un modelo de lenguaje de arquitectura MoE (mixture of experts) de la familia Gemma 4, con 25.233.053.440 parámetros totales y aproximadamente 4.000 millones de parámetros activos (el sufijo A4B indica esa cifra de activación). La conversión la ha realizado el usuario McG-221 mediante mlx-lm 0.31.2, y está pensada para ejecutarse en Apple Silicon a través del framework MLX de Apple.

El modelo está orientado explícitamente al roleplay y a la ficción conversacional, con etiquetas que indican que ha pasado por un proceso de "abliteration" o "heretic" (eliminación de rechazos y alineamiento de seguridad) y que se distribuye como "uncensored". Está pensado para su uso en front-ends como SillyTavern. Su licencia declarada es Apache 2.0, aunque al derivar de la familia Gemma conviene verificar la compatibilidad de licencias con el modelo base original.

Su relevancia es limitada y muy específica: se trata de una cuantización de 8 bits para un público concreto (usuarios de Mac con Apple Silicon que quieran ejecutar roleplay local), sin benchmarks publicados, sin descargas y sin pipeline declarado. No es un modelo para producción generalista ni para tareas de razonamiento o código verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4), según etiquetas del autor |
| Parámetros totales | 25.233.053.440 (25,2 B) |
| Parámetros activos | ~4 B (indicado por el sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (MLX); el repo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (8-bit) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base pertenece a la familia Gemma 4 y emplea una arquitectura de mezcla de expertos (MoE) con unos 25,2 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token. No se detalla el número de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composición del dataset de entrenamiento.

El modelo base SubMaroon/Kitchoon-V5-Clean-26B-A4B incorpora las etiquetas "heretic" y "uncensored", lo que sugiere un proceso de fine-tuning orientado a eliminar comportamientos de rechazo y a especializar el modelo en diálogo de rol. No hay información publicada sobre el volumen de tokens de entrenamiento, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). La conversión a MLX se realizó con mlx-lm 0.31.2 y cuantiza los pesos a 8 bits.

## Capacidades

- Generación de texto conversacional en inglés, con especial énfasis en diálogo de rol y ficción interactiva.
- Mantenimiento de personajes y estilo narrativo en conversaciones multi-turno (capacidad declarada por el propósito del modelo, sin benchmarks que la cuantifiquen).
- Respuestas sin filtros de rechazo ("uncensored"), lo que amplía el rango de contenido generado pero elimina salvaguardas de seguridad.
- Ejecución local en Apple Silicon mediante MLX y mlx-lm.
- Integración con front-ends de roleplay como SillyTavern (etiqueta declarada).
- No hay evidencia de soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".

## Casos de uso

- Roleplay local en Mac con Apple Silicon: el modelo se carga con mlx-lm y se integra en SillyTavern para sesiones de ficción interactiva, aprovechando el formato MLX de 8 bits para reducir el uso de memoria unificada frente a los pesos en bf16.
- Escritura creativa asistida: generación de diálogos y narrativa con personajes consistentes en inglés, adecuada para borradores de ficción o guiones.
- Prototipado de chatbots de personaje: desarrolladores que quieran experimentar con un MoE de ~4 B activos en local sin depender de APIs externas.
- Investigación sobre alineamiento y "abliteration": el modelo sirve como caso de estudio de un modelo deliberadamente descensurado para analizar qué comportamientos se eliminan y cuáles persisten.
- Evaluación comparativa de cuantizaciones MLX: útil para medir la degradación de calidad entre el modelo base y esta versión de 8 bits en tareas de generación libre.
- Pruebas de inferencia en hardware de consumo Apple: validación de throughput y latencia de un MoE de 25 B totales en memoria unificada de un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 26,8 GB en 8 bits, por lo que se necesita al menos ~28-30 GB de memoria unificada disponible para cargar los pesos y algo de margen para el contexto y el KV cache.
- Hardware objetivo: Apple Silicon con memoria unificada amplia (por ejemplo, Mac Studio o MacBook Pro con 32 GB o más). No está pensado para GPUs NVIDIA ni CUDA.
- GPU de consumo: no aplica en el sentido habitual; requiere Apple Silicon. En equipos con 16 GB de memoria unificada no cabe con holgura.
- Opciones de despliegue: mlx-lm (librería declarada), con posible integración en front-ends compatibles con MLX. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kitchoon-V5-Clean-26B-A4B-mlx-8Bit | 25,2 B | ~4 B | no disponible | apache-2.0 | MLX safetensors 8-bit | Roleplay, uncensored, solo inglés, solo Apple Silicon |
| SubMaroon/Kitchoon-V5-Clean-26B-A4B (base) | 25,2 B | ~4 B | no disponible | apache-2.0 | safetensors | Mismo modelo sin cuantizar ni convertir a MLX |
| Gemma 4 (familia base) | variable | variable | no disponible | licencia Gemma | safetensors, GGUF | Modelo generalista original; el Kitchoon es un fine-tune derivado |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": no incorpora salvaguardas de seguridad, por lo que puede generar contenido sensible, ofensivo o inapropiado sin restricciones. No es adecuado para aplicaciones de cara al público sin moderación externa.
- Solo soporta inglés; el rendimiento en castellano no está garantizado ni documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento ni fidelidad factual.
- Riesgo elevado de alucinación, como en cualquier modelo de este tipo sin evaluación publicada.
- Longitud de contexto no disponible; no se debe asumir una ventana larga.
- Restricciones de licencia: aunque se declara apache-2.0, al derivar de la familia Gemma conviene verificar los términos del modelo base original antes de un uso comercial.
- Formato MLX exclusivo para Apple Silicon: no ejecutable en CUDA ni en CPU convencional sin conversión.
- Repo sin descargas ni validación de la comunidad: no hay garantía de que la conversión a 8 bits preserve la calidad del modelo base.
- Fecha de creación declarada en 2026: verificar la procedencia y la integridad de los pesos antes de usarlos en cualquier entorno.

## Enlaces

- [Hugging Face: McG-221/Kitchoon-V5-Clean-26B-A4B-mlx-8Bit](https://huggingface.co/McG-221/Kitchoon-V5-Clean-26B-A4B-mlx-8Bit)
- [Modelo base: SubMaroon/Kitchoon-V5-Clean-26B-A4B](https://huggingface.co/SubMaroon/Kitchoon-V5-Clean-26B-A4B)
- [mlx-lm (librería de conversión e inferencia)](https://github.com/ml-explore/mlx-lm)
