# ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only-step-150

## Resumen

XSDPO-Nemotron-1.5B es un checkpoint intermedio (paso 150) de un ajuste fino con SDPO (una variante de optimización por preferencias con destilación) sobre el modelo base `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`. Lo publica el usuario ahmedselhady en Hugging Face como artefacto de investigación, no como modelo listo para producción: el nombre codifica la configuración del experimento (1500x2 muestras, learning rate 3e-6, coeficiente KL 0.001, `ref10752`, `k512`, grupo de secuencias `en_only`).

El modelo hereda la arquitectura Qwen2 del base, con 1.777.088.000 parámetros según los pesos en safetensors (3,6 GB en el repositorio). Está orientado a generación de texto y razonamiento, y su interés es fundamentalmente metodológico: permite reproducir y auditar una etapa concreta del entrenamiento SDPO aplicado a un modelo de razonamiento pequeño de la familia Nemotron.

No hay model card sustantiva, ni licencia declarada, ni idiomas documentados, ni resultados de benchmarks. Cualquier uso en producción exige una evaluación propia y la verificación de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del base) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible; el identificador del run indica `en_only` para el grupo de entrenamiento |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/Nemotron-Research-Reasoning-Qwen-1.5B |
| Libreria | transformers |
| Tamano del repositorio | 3,6 GB |
| Checkpoint | paso 150 del run `macereason-math-1500x2-en-bn-nemotron-1.5b-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con aproximadamente 1,5 mil millones de parámetros nominales (1,777 mil millones contados en los tensores publicados, incluyendo embeddings y cabezas). No hay innovaciones arquitectónicas propias en este checkpoint; el interés está en el procedimiento de ajuste.

El entrenamiento corresponde a SDPO (Self-Distillation Policy Optimization, según la nomenclatura del run), una optimización por preferencias con un término de divergencia KL (0.001) frente a un modelo de referencia (`ref10752`). Los hiperparámetros visibles en el nombre indican 1500x2 muestras de preferencia, learning rate 3e-6, `k512` (probablemente tamaño de grupo o de candidatos por prompt), grupo de secuencias restringido a inglés (`en_only`) y dominio de matemáticas/razonamiento (`macereason-math`). El checkpoint es el paso 150, es decir, un estado intermedio y no el final del entrenamiento. No se documentan el volumen total de tokens, la composición exacta del dataset ni si hubo RLHF adicional.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del base Nemotron-Research-Reasoning-Qwen-1.5B.
- Razonamiento matemático y de varios pasos, dado el dominio de entrenamiento (`math`).
- Razonamiento explícito tipo cadena de pensamiento, característico de la familia Nemotron-Research-Reasoning.
- Alineación por preferencias mediante SDPO con anclaje KL al modelo de referencia.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el base es solo texto.
- Capacidades multilingües: no documentadas; el run se etiqueta como `en_only`.
- Modo thinking explícito o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación: reproducir la curva de entrenamiento SDPO comparando este paso 150 con checkpoints posteriores del mismo run y con el modelo base, para medir el efecto del término KL y del learning rate.
- Estudio de destilación de razonamiento en modelos pequeños: analizar si un modelo de 1,5B ajustado con preferencias en dominio matemático mejora la consistencia de la cadena de pensamiento frente al base.
- Evaluación de contaminación y regresión: usar el checkpoint intermedio como control para detectar degradación de capacidades generales (olvido catastrófico) inducida por el ajuste en un dominio estrecho.
- Generación de soluciones matemáticas paso a paso en entornos de laboratorio: útil para comparar trazas de razonamiento entre el base y el ajustado, no para servir respuestas sin verificación.
- Base para ajustes posteriores: punto de partida para experimentos de continuación de entrenamiento con otros datasets o coeficientes KL, dado que los pesos están en safetensors y son cargables con transformers.
- Reproducibilidad de experimentos: el nombre del run codifica todos los hiperparámetros, lo que facilita replicar la configuración en un pipeline de entrenamiento propio.
- Docencia y demostraciones: ilustrar en un curso cómo se nombran y publican checkpoints intermedios de un pipeline de optimización por preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 3,5-4 GB solo para pesos, más caché KV y activaciones; un presupuesto práctico de 6-8 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB de pesos; en 4 bits, alrededor de 1-1,2 GB.
- GPU recomendadas para fp16: RTX 3090, RTX 4090, L40S, A100; para servir con concurrencia, A100 40 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, incluso en fp16 con contexto corto; en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (el modelo declara `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,78 B | no disponible | no disponible | Hugging Face, checkpoint paso 150 | Artefacto de investigación, sin benchmarks |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5 B | no disponible en esta ficha | no disponible | Hugging Face | Modelo base; referencia directa para comparar el efecto del ajuste |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 tokens (según documentación pública de la familia) | Apache 2.0 (según documentación pública) | Hugging Face | Alternativa generalista con licencia permisiva; requiere verificar cifras en su model card |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | 32 768 tokens (según documentación pública) | MIT (según documentación pública) | Hugging Face | Alternativa de razonamiento destilado del mismo tamaño; verificar en su model card |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 150) de un run de investigación: no representa el estado final del entrenamiento ni ha pasado una evaluación de calidad.
- Sin licencia declarada en el repositorio: no se puede asumir uso comercial; hay que consultar la licencia del modelo base de NVIDIA y la del checkpoint.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento frente al base ni frente a alternativas.
- Riesgo de alucinación y de razonamiento plausible pero incorrecto, especialmente en matemáticas, donde el modelo puede producir cadenas de pensamiento convincentes con errores.
- El entrenamiento se restringe a inglés en el grupo de secuencias (`en_only`): el comportamiento en castellano u otros idiomas no está documentado y puede degradarse respecto al base.
- Posible olvido catastrófico de capacidades generales por el ajuste en dominio matemático; conviene evaluar tareas fuera de dominio antes de cualquier uso.
- El término KL bajo (0.001) permite deriva respecto al modelo de referencia; no se documenta la magnitud de esa deriva en este paso.
- Sin cuantizaciones GGUF publicadas: el despliegue en llama.cpp u Ollama requiere conversión propia y validación.
- El repositorio tiene 0 descargas y 0 likes: no hay señal de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only-step-150
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
