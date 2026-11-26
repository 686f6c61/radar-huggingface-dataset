# Horizon-Intelligence/dawn-135m

## Resumen

Dawn-135M es un modelo de lenguaje de tipo decoder-only con 134.518.848 parámetros, desarrollado por Horizon Intelligence como primera entrega de la serie Dawn. Se trata de un modelo base entrenado desde cero (inicialización aleatoria, sin destilación ni pesos heredados) cuyo objetivo declarado es demostrar que es posible alcanzar la calidad de GPT-2 (124M) con un coste de entrenamiento radicalmente menor: 0,3B de tokens frente al corpus de ~9B de tokens de GPT-2, en una única NVIDIA H100 durante 18 minutos y por unos 1,30 dólares.

El modelo emplea una arquitectura transformer con 30 capas, estados ocultos de 576 dimensiones, atención con grouped-query attention (9 cabezas de consulta y 3 de clave-valor), RoPE, QK-norm, MLP con activación ReLU², RMSNorm, embeddings atados y logit soft-capping. El entrenamiento combina el optimizador Muon para las matrices de pesos con AdamW para embeddings y normas, una innovación heredada de la comunidad modded-nanogpt.

Su relevancia actual es doble: por un lado, sirve como referencia reproducible de receta de entrenamiento eficiente (pesos, código de arquitectura y receta completa publicados bajo Apache 2.0); por otro, constituye un punto de partida para la serie Dawn, que según el autor incluirá variantes con ajuste por instrucciones, tool calling y entrenamientos más largos. Es un modelo exclusivamente en inglés, con contexto de 2.048 tokens y sin ajuste de instrucciones ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE, QK-norm, ReLU² MLP, RMSNorm, embeddings atados y logit soft-capping |
| Parametros totales | 134.518.848 (134,5M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; al ser safetensors en fp32/bf16 es convertible a GGUF/INT8/INT4 con herramientas estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

Dawn-135M es un transformer decoder-only de 30 capas con anchura de 576, 9 cabezas de consulta y 3 cabezas de clave-valor (GQA con ratio 3:1), RoPE para codificación posicional, QK-norm para estabilizar la atención, MLP con activación ReLU², RMSNorm en lugar de LayerNorm, embeddings atados entre entrada y salida y logit soft-capping para limitar la magnitud de los logits. La arquitectura se implementa en `modeling_dawn.py` y requiere `trust_remote_code=True` al cargar el modelo con transformers.

El entrenamiento utilizó 300M tokens compuestos por un 61% de texto web de FineWeb-Edu (los documentos mejor puntuados) y un 39% de libros de texto sintéticos de Cosmopedia-v2 (parte del corpus SmolLM). El lote fue de 262K tokens por paso con contexto de 2.048 tokens, lo que supone 1.144 pasos en total. El optimizador combina Muon para las matrices de pesos con AdamW para embeddings y normas, con un schedule de learning rate de warmup, fase estable y decaimiento lineal. Todo el cómputo se realizó en una única NVIDIA H100 en 18 minutos. El tokenizador procede de SmolLM2-135M (Apache 2.0).

## Capacidades

- Generación de texto por continuación de prompt (modelo base, no ajustado por instrucciones).
- Razonamiento de sentido común básico, evaluado en ARC-Easy, ARC-Challenge, OpenBookQA, WinoGrande, CommonsenseQA, HellaSwag y PIQA.
- Comprensión lectora elemental y respuesta a preguntas de conocimiento general a pequeña escala.
- Capacidad multilingüe: no disponible; solo inglés.
- Tool calling / function calling: no soportado (el autor lo anuncia como trabajo futuro en la serie Dawn).
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Modo thinking, visión o audio: no disponible.
- Capacidad de continuación de texto técnico y científico (el ejemplo de la model card sobre fotosíntesis lo ilustra).

## Casos de uso

- Investigación sobre entrenamiento eficiente: reproducir la receta (Muon + AdamW, FineWeb-Edu + Cosmopedia-v2, 0,3B tokens) para estudiar el impacto del optimizador y la composición del dataset en modelos pequeños. Es adecuado porque el autor publica pesos, código y receta completa bajo Apache 2.0.
- Generación de texto de relleno y prototipado rápido: completar frases o párrafos en inglés para maquetas de interfaz o tests de integración, dado su reducido tamaño (0,3 GB) y su baja latencia esperada en CPU.
- Educación y divulgación: usar el modelo como ejemplo didáctico de arquitectura transformer moderna (GQA, RoPE, QK-norm, ReLU²) en cursos o talleres, ya que el código de arquitectura es legible y el entrenamiento es reproducible en una sola GPU.
- Benchmarking de harnesses de evaluación: servir como línea base ligera para validar pipelines de evaluación zero-shot (ARC, HellaSwag, PIQA) antes de escalar a modelos mayores.
- Experimentos de destilación o fine-tuning: al ser un modelo base pequeño con licencia permisiva, sirve como punto de partida para ajuste supervisado en dominios concretos (por ejemplo, clasificación de texto o generación de respuestas cortas) con recursos limitados.
- Despliegue en entornos con restricciones de memoria: inferencia en dispositivos edge o contenedores pequeños gracias a sus 134,5M de parámetros y contexto de 2.048 tokens, siempre que la tarea sea continuación de texto en inglés.

## Benchmarks y rendimiento

Datos publicados por el autor (zero-shot, mismo harness para ambos modelos, mayor es mejor):

| Benchmark | GPT-2 (124M) | Dawn-135M |
|---|---:|---:|
| ARC-Easy | 40,6 | 45,3 |
| OpenBookQA | 26,4 | 30,4 |
| ARC-Challenge | 22,3 | 24,6 |
| WinoGrande | 50,2 | 50,6 |
| CommonsenseQA | 30,3 | 30,0 |
| HellaSwag | 31,3 | 29,2 |
| PIQA | 62,6 | 58,8 |
| Promedio (6 tareas) | 38,7 | 39,0 |
| Tokens de entrenamiento | ~9B | 0,3B |

El promedio cuenta ARC como una sola tarea (media de Easy y Challenge). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,54 GB solo para pesos (134,5M × 4 bytes), más overhead de activaciones y KV cache; en bf16/fp16, unos 0,27 GB de pesos. En la práctica, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para entrenamiento o fine-tuning, una RTX 4090 (24 GB) o A100/H100 son suficientes y sobradas. El entrenamiento original se completó en una única H100 en 18 minutos.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, etc.) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura personalizada); conversión a GGUF para llama.cpp u Ollama; vLLM y TGI requieren soporte de la arquitectura personalizada, que no está garantizado de serie.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por tamaño, se espera latencia de milisegundos por token en GPU consumer y throughput alto en lote, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---:|---|---|---|
| Dawn-135M | 134,5M | 2.048 | Apache 2.0 | Inglés | Base, entrenado con 0,3B tokens, receta Muon |
| GPT-2 (124M) | 124M | 1.024 | MIT (pesos OpenAI) | Inglés | Base, ~9B tokens de entrenamiento; referencia de calidad |
| SmolLM2-135M | 135M | 8.192 | Apache 2.0 | Inglés (principalmente) | Base e instruct; tokenizador reutilizado por Dawn |
| Qwen2.5-0.5B | ~494M | 32.768 | Apache 2.0 | Multilingüe | Base e instruct; mayor tamaño y contexto |

Dawn-135M iguala el promedio de GPT-2 en seis benchmarks con 30 veces menos tokens de entrenamiento, y comparte tokenizador con SmolLM2-135M, lo que facilita comparaciones directas. Frente a SmolLM2-135M y Qwen2.5-0.5B, Dawn-135M ofrece un contexto mucho menor (2.048 frente a 8.192 y 32.768) y carece de variantes instruct, por lo que su utilidad práctica es más de investigación que de producto.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni ajuste de seguridad: no debe usarse como asistente conversacional directo sin fine-tuning previo.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto limitado a 2.048 tokens, muy por debajo de los estándares actuales (8K-128K), lo que restringe tareas de documento largo.
- Riesgo de alucinación y de generar texto incorrecto o incoherente, especialmente fuera de los dominios representados en FineWeb-Edu y Cosmopedia-v2.
- Sesgos potenciales heredados de los datos web (FineWeb-Edu) y de los libros de texto sintéticos (Cosmopedia-v2); el autor no documenta evaluaciones de sesgo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar `modeling_dawn.py` antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantías de calidad, el uso en producción exige evaluación y ajuste propios.
- No hay soporte documentado para tool calling, agentes ni razonamiento multi-paso; el autor los anuncia como trabajo futuro.
- Sin datos publicados de latencia, throughput ni benchmarks adicionales (MMLU, HumanEval, GSM8K).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Intelligence/dawn-135m
- Tokenizador de referencia (SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM-Corpus (incluye Cosmopedia-v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Repositorio modded-nanogpt (ideas de optimizador y arquitectura): https://github.com/KellerJordan/modded-nanogpt
