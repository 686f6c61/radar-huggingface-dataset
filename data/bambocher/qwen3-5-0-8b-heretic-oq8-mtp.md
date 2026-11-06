# bambocher/Qwen3.5-0.8B-heretic-oQ8-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ8-mtp es una cuantización mixta del modelo Qwen3.5-0.8B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina pesos cuantizados en 8 bits afines con grupo de 64 (88,2 % de los pesos lógicos) con una fracción en BF16 (11,8 %), dando un promedio efectivo de 9,386 bits por peso. El resultado ocupa 1,025 GB en disco (0,954 GiB), lo que lo hace manejable en hardware de Apple Silicon mediante MLX.

El modelo base es un transformer multimodal de la familia Qwen3.5 con 873.438.784 parámetros totales, de los cuales 752 millones corresponden al modelo de lenguaje, 101 millones a la torre de visión y 20 millones a una cabeza MTP (multi-token prediction). El sufijo "heretic" sugiere una variante con alineamiento relajado o modificado respecto al original, aunque el autor no documenta el proceso en la model card.

La relevancia de esta ficha es doble: por un lado, ilustra las técnicas de cuantización mixta que permiten ejecutar modelos multimodales pequeños en portátiles; por otro, advierte de que se trata de un artefacto derivado sin model card sustantiva, sin licencia declarada y sin benchmarks publicados, por lo que su uso en producción exige verificación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; cuantización mixta oQ |
| Parametros totales | 873.438.784 (0,873 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 8-bit grupo 64 (88,185 % de pesos) + BF16 (11,815 %); 9,386 bits/peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Qwen3.5-0.8B, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer multimodal con tres componentes diferenciados: un modelo de lenguaje de 752 M parámetros, una torre de visión de 101 M parámetros y una cabeza de predicción multi-token (MTP) de 20 M parámetros. La inclusión de la cabeza MTP es relevante porque habilita decodificación especulativa nativa, lo que puede incrementar el throughput de generación a costa de algo más de memoria.

La cuantización se realizó con oQ (oMLX v0.7.3), una herramienta de cuantización mixta que asigna precisión según la sensibilidad de cada tensor: el 88,2 % de los pesos lógicos quedan en 8 bits afines con grupo de 64, mientras que el 11,8 % restante se preserva en BF16, presumiblemente por corresponder a capas más sensibles (embeddings, normas o proyecciones críticas). No se dispone de información sobre el dataset de entrenamiento del modelo base, el proceso de alineamiento (RLHF/DPO) ni el procedimiento concreto mediante el cual se obtuvo la variante "heretic".

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5.
- Procesamiento de imágenes: la torre de visión de 101 M parámetros confirma capacidad multimodal de entrada visual.
- Predicción multi-token (MTP): la cabeza dedicada permite decodificación especulativa y potencial aceleración de la generación.
- Tool calling y function calling: no confirmado en la información disponible, aunque la familia Qwen3.5 suele soportarlo.
- Capacidades de agente y razonamiento multi-paso: no confirmado en la información disponible.
- Soporte multilingüe: no disponible; el autor no declara idiomas.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado rápido en Mac: gracias a su tamaño (1 GB en disco) y al formato MLX, permite iterar sobre prompts y flujos multimodales en un MacBook con Apple Silicon sin necesidad de GPU dedicada.
- Descripción de imágenes en local: la torre de visión integrada permite construir un pipeline de captioning o respuesta visual sobre imágenes en entornos sin conectividad, útil para herramientas de accesibilidad o catalogación de fotos.
- Asistente personal offline: con 873 M parámetros y cuantización de 8 bits, puede ejecutarse de forma continua en segundo plano en un portátil para tareas de resumen, reescritura o extracción de información.
- Evaluación de técnicas de cuantización: el checkpoint es un caso de estudio útil para investigadores que comparan oQ frente a GGUF o AWQ en términos de calidad por bit, dado que el autor publica el desglose exacto de bits por componente.
- Generación aumentada con recuperación (RAG) ligera: adecuado para indexar y responder sobre pequeños corpus documentales en local, siempre que se valide la calidad tras la cuantización.
- Base para fine-tuning experimental: al ser un modelo pequeño y con licencia no declarada, sirve como banco de pruebas para LoRA o QLoRA en MLX, aunque la licencia debe aclararse antes de cualquier uso comercial.
- Aceleración con decodificación especulativa: la cabeza MTP permite experimentar con técnicas de speculative decoding en MLX para medir la ganancia real de throughput en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas multimodales, ni comparaciones con el modelo base sin cuantizar. Tampoco se documenta la degradación de calidad introducida por la cuantización mixta.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 3 GB de memoria unificada según longitud de contexto.
- GPU compatibles: el formato es MLX, por lo que el soporte nativo está limitado a Apple Silicon (series M1, M2, M3, M4). No es directamente ejecutable en CUDA sin reconversión.
- GPU de consumo: cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada; en GPUs NVIDIA requeriría conversión previa a otro formato (por ejemplo, GGUF), no incluida en el repositorio.
- Opciones de despliegue: MLX (mlx-lm), oMLX; para otros entornos sería necesaria una conversión manual. No se incluyen pesos GGUF ni plantillas de Ollama, vLLM o TGI.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic-oQ8-mtp | 0,873 B | no disponible | Sí (visión) | no disponible | MLX safetensors 8-bit mixto |
| Qwen3.5-0.8B (base) | 0,873 B | no disponible | Sí (visión) | no disponible en esta ficha | safetensors BF16 |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | No | Apache 2.0 | safetensors, GGUF |
| SmolVLM-500M-Instruct | 0,5 B | 8.192 tokens | Sí (visión) | Apache 2.0 | safetensors, GGUF |

La comparación es aproximada: los datos del modelo base Qwen3.5-0.8B y de la variante "heretic" no están documentados en la información proporcionada. Frente a alternativas consolidadas como Qwen2.5-0.5B o SmolVLM-500M, este checkpoint ofrece una huella de memoria similar pero con licencia y benchmarks sin declarar, lo que limita su adopción en producción frente a opciones con Apache 2.0 y evaluaciones públicas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si permite uso comercial; debe contactarse con el autor o asumirse riesgo legal.
- Variante "heretic": el sufijo indica un alineamiento modificado o relajado respecto al modelo original; no hay documentación sobre qué filtros de seguridad se han eliminado, lo que aumenta el riesgo de contenido inapropiado.
- Sin benchmarks: no hay evidencia publicada de la degradación de calidad causada por la cuantización mixta de 9,386 bits/peso.
- Riesgo de alucinación: con 873 M parámetros, la capacidad de razonamiento y el conocimiento factual son limitados; no debe usarse como fuente de verdad sin verificación.
- Idiomas no declarados: no se garantiza un rendimiento correcto en castellano ni en otros idiomas distintos del inglés.
- Contexto desconocido: se desconoce la ventana máxima soportada, lo que impide planificar tareas de contexto largo.
- Ecosistema restringido: al ser MLX, no es portable directamente a CUDA, vLLM o TGI; requiere conversión manual.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Fecha de creación futura (2026-11-01): metadato anómalo que sugiere posible error de publicación o artefacto de prueba; conviene verificar la integridad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ8-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Familia Qwen en Hugging Face: https://huggingface.co/Qwen
