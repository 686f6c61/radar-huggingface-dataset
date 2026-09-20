# OpenMed/LFM2-2.6B-Longevity-8bit-mlx

## Resumen

LFM2-2.6B-Longevity-8bit-mlx es una conversión nativa a MLX del modelo LiquidAI/LFM2-2.6B-Longevity, cuantizada a 8 bits en modo afín con tamaño de grupo 64. La conversión la ha realizado y publicado OpenMed, mientras que el modelo original es un ajuste fino de dominio de Liquid AI e Insilico Medicine sobre LiquidAI/LFM2-2.6B, orientado a la interpretación de datos heterogéneos de biología del envejecimiento (genómicos, proteómicos y clínicos). Forma parte de la familia Longevity-LLM (L-LLM), presentada junto al estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026).

El modelo tiene 2.569.272.320 parámetros (2,57 B) y una arquitectura híbrida de la familia lfm2: 30 capas, de las cuales solo 8 son de atención con grouped-query attention (32 cabezas de consulta, 8 de clave/valor) y 22 son convoluciones cortas con compuertas. El tamaño oculto es 2048 y la anchura del feed-forward es 10.752. El contexto declarado en la tarjeta original es de 32.768 tokens, aunque `max_position_embeddings` llega a 128.000. El vocabulario es de 65.536 entradas con embeddings de entrada y salida atados.

Su relevancia práctica es doble: por un lado, aplica un modelo compacto y especializado a un nicho con poca oferta de modelos abiertos, como es la biología del envejecimiento; por otro, esta versión concreta está pensada para ejecución local en Apple Silicon, con un peso de 2,54 GiB que reduce en 1,9 veces el BF16 original (4,79 GiB) manteniendo los mismos parámetros. La licencia es la LFM Open License v1.0, etiquetada como "other" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida lfm2 (`Lfm2ForCausalLM`): convoluciones cortas con compuertas y atención grouped-query |
| Parametros totales | 2.569.272.320 (2,57 B) |
| Longitud de contexto | 32.768 tokens según la tarjeta del modelo original (`max_position_embeddings`: 128.000) |
| Tipos de cuantizacion | 8 bits afín con group size 64 (8,5 bits por peso medidos en los tensores); existe una versión hermana en 4 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (LFM Open License v1.0), etiquetada como "other"; `license_link`: LICENSE |
| Formato de pesos | MLX safetensors (`model.safetensors`, 2,54 GiB) + `model.safetensors.index.json` |
| Tamano del repositorio | 2,7 GB |
| Tamano oculto | 2048 |
| Capas | 30 (8 de atención, 22 de convolución) |
| Cabezas de atención | 32 de consulta / 8 de clave-valor (GQA) |
| Anchura del feed-forward | 10.752 |
| Vocabulario | 65.536, embeddings de entrada y salida atados |
| Biblioteca | mlx (mlx-lm 0.31.3 para la conversión) |
| Modelo base | LiquidAI/LFM2-2.6B-Longevity (a su vez, ajuste fino de LiquidAI/LFM2-2.6B) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo original sigue el diseño lfm2 de Liquid AI: una pila de 30 capas que combina convoluciones cortas con compuertas (22 capas) y atención con grouped-query attention (8 capas), con 32 cabezas de consulta y 8 de clave/valor, tamaño oculto de 2048 y feed-forward de 10.752. Los embeddings de entrada y salida están atados y el vocabulario es de 65.536 entradas. Esta mezcla reduce el coste de atención y está diseñada para cargas de trabajo en dispositivo, algo coherente con el objetivo de esta conversión.

El checkpoint Longevity se obtuvo mediante ajuste fino supervisado de todos los parámetros de LiquidAI/LFM2-2.6B sobre datos multi-ómicos y clínicos relacionados con el envejecimiento, en el marco del trabajo de Insilico Medicine y Liquid AI sobre longevidad. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron etapas de RLHF o DPO; se remite a la tarjeta del modelo original para esos datos. La plantilla de chat es de estilo ChatML e incluye un interruptor dinámico de razonamiento: el sufijo `/think` en un turno de usuario activa una traza de razonamiento y `/no_think` fuerza una respuesta directa.

La aportación específica de este repositorio es la cuantización: `mlx_lm.convert` (mlx-lm 0.31.3) con `-q --q-bits 8 --q-group-size 64` sobre los pesos BF16 originales. Se cuantizan todas las proyecciones lineales y el embedding de tokens atado, mientras que las escalas de RMSNorm y los kernels de convolución corta se mantienen en BF16. El tokenizador, la plantilla de chat y los valores por defecto de generación son copias sin modificar del repositorio original. El hash SHA-256 de los pesos es `907aa095afa04cc2f5e77213e8f503c0f926bf087fdc6620ad2f1c7815e14a65`.

## Capacidades

- Generación de texto conversacional en inglés con plantilla ChatML y soporte de mensajes de sistema.
- Razonamiento configurable: modo traza de razonamiento con `/think` y modo respuesta directa con `/no_think`.
- Interpretación de datos de biología del envejecimiento: datos genómicos, proteómicos y clínicos en un mismo flujo de conversación.
- Razonamiento sobre biomarcadores clínicos (por ejemplo, HbA1c, hs-CRP) y sobre edad epigenética frente a edad cronológica, según los ejemplos de la tarjeta.
- Ejecución totalmente en dispositivo sobre Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Compatible con `mlx_lm` (`load`, `generate`, `mlx_lm.generate`) y con el motor MLX de LM Studio.
- Capacidad de cuantización adicional local: al ser un modelo pequeño, es viable generar variantes de 4 bits o inferiores con las herramientas de MLX.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni multimodalidad en la información disponible.
- El multilingüismo no está soportado: la tarjeta declara únicamente inglés.

## Casos de uso

- Investigación en biología del envejecimiento: el modelo puede actuar como asistente de lectura e interpretación de paneles multi-ómicos y datos clínicos de cohortes de envejecimiento, generando hipótesis que el investigador valida después.
- Análisis de paneles de biomarcadores: dado un conjunto de valores analíticos rutinarios, el modelo puede discutir qué marcadores son más informativos sobre la edad biológica y qué mediciones adicionales tendría sentido solicitar, siempre como salida de investigación.
- Preprocesamiento y anotación asistida de literatura biomédica: resumir o reformular abstracts y fichas de pacientes simulados en un formato homogéneo antes de pasarlos a un pipeline de curación de datos.
- Docencia y formación en gerociencia: generar casos sintéticos con valores de laboratorio plausibles y explicaciones paso a paso usando el modo `/think` para exponer el razonamiento.
- Prototipado rápido en portátiles Mac: al ocupar 2,54 GiB de pesos, permite iterar sobre prompts, plantillas y evaluación sin depender de clústeres ni de conexión a internet, algo útil en entornos con datos sensibles que no pueden salir de la máquina.
- Comparación de trazas de razonamiento: usar `/think` frente a `/no_think` sobre el mismo caso clínico sintético para estudiar cuánto aporta la traza de razonamiento en tareas biomédicas de dominio estrecho.
- Baseline ligero para experimentos de ajuste fino: al ser un modelo de 2,57 B derivado de LFM2-2.6B, sirve como punto de partida para nuevas especializaciones de dominio antes de escalar a modelos mayores.
- Demostraciones locales sin red: la conversión MLX permite enseñar el comportamiento del modelo en un portátil durante una presentación o una revisión interna, sin latencia de red y sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta de este repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de biología del envejecimiento; únicamente remite a la tarjeta del modelo original (LiquidAI/LFM2-2.6B-Longevity) para el corpus de entrenamiento y la evaluación, y al estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026). No se dispone de la comparación de calidad entre la versión BF16 y esta versión de 8 bits más allá del dato de que el group size 64 se describe como "casi sin pérdida" (8 bits más una escala y un sesgo de 16 bits cada 64 pesos).

## Requisitos de hardware

- Peso de los pesos: 2,54 GiB en 8 bits (frente a 4,79 GiB en BF16 y 1,35 GiB en la versión de 4 bits del mismo autor).
- VRAM/unified memory estimada: alrededor de 3-4 GB en total para inferencia cómoda en 8 bits, sumando pesos, caché KV y overhead del runtime de MLX; la versión de 4 bits baja a unos 2 GB.
- Plataforma obligatoria: Apple Silicon. El formato MLX no se ejecuta en GPU NVIDIA ni AMD, por lo que A100, H100 o RTX 4090 no son opciones directas para este repositorio; para esas GPUs habría que usar los pesos BF16 o PyTorch del modelo original.
- Encaje en hardware de consumo: sí, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada; 16 GB dan margen holgado, especialmente con contexto largo, ya que la caché KV crece con los tokens.
- Opciones de despliegue: `mlx-lm` mediante CLI (`mlx_lm.generate`) o API de Python (`mlx_lm.load`, `mlx_lm.generate`); motor MLX de LM Studio; también es posible cargarlo desde scripts propios basados en MLX.
- No hay pesos GGUF publicados en este repositorio, por lo que llama.cpp y Ollama no son vías directas de despliegue sin una conversión adicional. Tampoco se documenta soporte para vLLM o TGI, orientados a GPU CUDA.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de rendimiento: la decodificación es autorregresiva token a token; la ventana declarada de 32.768 tokens hace que la memoria dedicada a caché KV sea el factor dominante en conversaciones largas, muy por encima del peso del propio modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Peso en disco | Licencia | Notas |
|---|---|---|---|---|---|---|
| OpenMed/LFM2-2.6B-Longevity-8bit-mlx (este) | 2,57 B | 32.768 | MLX safetensors, 8 bits afín, group size 64 | 2,54 GiB | lfm1.0 | Conversión para Apple Silicon, 8,5 bits por peso |
| OpenMed/LFM2-2.6B-Longevity-4bit-mlx | 2,57 B | 32.768 | MLX safetensors, 4 bits | 1,35 GiB | lfm1.0 | Versión hermana, menor huella y presumiblemente algo más de pérdida de calidad |
| LiquidAI/LFM2-2.6B-Longevity | 2,57 B | 32.768 | PyTorch BF16 | 4,79 GiB | lfm1.0 | Modelo original sin cuantizar, mejor fidelidad numérica |
| LiquidAI/LFM2-2.6B | 2,57 B | No disponible | PyTorch BF16 | No disponible | lfm1.0 | Modelo base generalista sobre el que se hizo el ajuste de longevidad |

Para alternativas de otros desarrolladores en el nicho de modelos biomédicos, no se dispone de datos verificados en la información proporcionada, por lo que no se incluye una comparación numérica. Cualquier comparación con modelos biomédicos de mayor tamaño debería hacerse sobre benchmarks del estudio de referencia, que no se han facilitado aquí.

## Limitaciones y advertencias

- Uso previsto de investigación: la propia tarjeta indica que las salidas son predicciones del modelo para uso en investigación y no constituyen consejo clínico. No debe utilizarse para diagnóstico, tratamiento ni decisiones sobre pacientes.
- Riesgo de alucinación: es un modelo de 2,57 B de parámetros en un dominio técnico y con vocabulario especializado; puede generar referencias, cifras o relaciones biológicas plausibles pero incorrectas. Requiere verificación externa sistemática.
- Sesgos: el corpus de ajuste fino es multi-ómico y clínico, con la composición y representatividad poblacional no detalladas en la información disponible; no puede descartarse un sesgo derivado de las cohortes utilizadas.
- Idioma: solo inglés. No hay soporte declarado de castellano, por lo que responderá con calidad degradada en otros idiomas.
- Contexto: la ventana declarada es de 32.768 tokens pese a que `max_position_embeddings` es 128.000; usar más de 32.768 tokens no está respaldado por la tarjeta y puede degradar la coherencia. Además, la memoria de caché KV crece de forma lineal con la longitud.
- Modo de razonamiento: `/think` incrementa notablemente el consumo de tokens y latencia; conviene reservarlo para tareas que lo justifiquen mediante `/no_think` en el resto.
- Cuantización: al ser una derivada cuantizada, no es bit a bit idéntica al BF16 original; el autor la describe como la opción casi sin pérdida, pero no se aportan métricas de degradación.
- Dependencia de plataforma: no se distribuyen pesos GGUF ni versiones para CUDA; el uso en GPU NVIDIA o AMD exige acudir a los pesos originales o reconvertirlos.
- Licencia: LFM Open License v1.0, etiquetada como "other" con `license_link` al archivo LICENSE. En la información disponible no se detallan los umbrales ni las condiciones concretas de uso comercial; hay que revisar el texto de la licencia antes de cualquier despliegue en producción. No es una licencia Apache 2.0 ni MIT.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de validación en producción.
- Los resultados de búsqueda web asociados a esta consulta no contenían información relevante sobre el modelo (devolvían documentación y aplicaciones de un chatbot no relacionado), por lo que no aportan contexto adicional verificable.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/OpenMed/LFM2-2.6B-Longevity-8bit-mlx
- Versión de 4 bits del mismo autor: https://huggingface.co/OpenMed/LFM2-2.6B-Longevity-4bit-mlx
- Modelo original en PyTorch BF16: https://huggingface.co/LiquidAI/LFM2-2.6B-Longevity
- Modelo base generalista: https://huggingface.co/LiquidAI/LFM2-2.6B
- Liquid AI: https://www.liquid.ai
- Insilico Medicine: https://insilico.com
- MLX (Apple): https://github.com/ml-explore/mlx
- Estudio de referencia: "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026), citado en la tarjeta; no se proporciona URL directa en la información disponible.
- Resultados de búsqueda web sobre este modelo: no se encontraron enlaces relevantes en la información proporcionada.
