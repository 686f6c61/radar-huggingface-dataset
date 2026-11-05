# eyes-ml/Ripple-65B-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje de tipo Transformer denso con 65.000 millones de parámetros desarrollado por Ricursive Intelligence (organización eyes-ml en HuggingFace). Se ha preentrenado desde cero sobre 12 billones de tokens de texto y código, predominantemente en inglés, y está diseñado específicamente para tareas de razonamiento y codificación agéntica. Su propuesta de valor principal es alcanzar un rendimiento en tareas agénticas comparable o superior al de modelos estadounidenses de pesos abiertos mucho mayores, con más de diez veces el número de parámetros.

La arquitectura sigue un enfoque "thin-and-deep" con un `d_model` estrecho de 5120 y 80 capas totales, adoptando un diseño inspirado en Gemma 3N en lugar del clásico estilo Llama de Olmo 3. Incluye innovaciones como atención con compuerta (gated attention), NoPE global, value residuals, recorte de activaciones en la FFN y una proporción elevada de capas con atención de ventana deslizante (SWA) frente a atención global. Soporta hasta 1 millón de tokens de contexto, aunque el preentrenamiento se realizó a 8K y el contexto largo se extendió en fases posteriores.

El modelo se distribuye bajo licencia Apache 2.0 en formato BF16 (el repositorio contiene el modelo ajustado por instrucciones), con variantes adicionales en NVFP4, un modelo base y una versión DFlash2. Su relevancia actual radica en que demuestra que un equipo pequeño puede entrenar un modelo competitivo desde cero con infraestructura sencilla (sin kernels personalizados, sin cuantización durante el entrenamiento, con un 40% de MFU) y desplegarlo en hardware de consumo como una NVIDIA DGX Spark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N), proporción thin-and-deep |
| Parámetros totales | 64.782.689.360 (~65B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens (entrenado a 8K, extendido a 2M en fases de contexto largo) |
| Tipos de cuantización | BF16 (nativo), NVFP4 (checkpoint separado) |
| Idiomas soportados | Predominantemente inglés (no se detallan otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B es un Transformer denso con un ratio de aspecto "thin-and-deep": `d_model` de 5120 y 80 capas. Abandona la arquitectura tipo Llama de Olmo 3 en favor de un diseño inspirado en Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para reforzar el razonamiento, sobredimensiona el número de cabezas de atención, incrementa la proporción de capas con atención de ventana deslizante (SWA) frente a las globales y reduce la ventana SWA para compensar el coste. Añade recorte de activaciones en la FFN, atención con compuerta, NoPE global y value residuals.

El preentrenamiento se realizó desde cero sobre 12 billones de tokens de un corpus mayoritariamente inglés y de código, con longitud de secuencia de 8K, 877.500 pasos y un tamaño de lote que escaló de 1408 a 3072. El postentrenamiento siguió un pipeline estándar: midtraining (200B tokens, 64K de secuencia), contexto largo (6,5B tokens, 2M de secuencia), SFT (183B tokens, 128K), SFT de contexto largo (13,5B tokens, 2M) y RL mixto por dominios (700 pasos, 128K, lote de 2048). La versión Preview ha recibido un postentrenamiento relativamente ligero centrado en codificación agéntica. El modelo se entrenó en BF16 sin kernels personalizados, con sharding simple y un 40% de MFU mantenido durante preentrenamiento y postentrenamiento.

## Capacidades

- Generación de texto y razonamiento general en inglés.
- Codificación agéntica: resolución de tareas en terminal y entornos de línea de comandos (evaluado en TerminalBench 2.1, SWE-bench Pro v2.0 Hard y DeepSWE 1.1).
- Razonamiento multi-paso y ejecución de agentes autónomos.
- Capacidad de contexto largo de hasta 1M tokens, con extensión entrenada hasta 2M en fases específicas.
- Ajuste por instrucciones (modelo instruct en BF16 y NVFP4).
- Disponibilidad de modelo base (pretrain-only) para fine-tuning posterior.
- No se documentan capacidades de visión, audio ni tool calling explícito en la información disponible.

## Casos de uso

- Automatización de tareas en terminal: el modelo puede interpretar y ejecutar comandos en entornos de línea de comandos, resolviendo tareas de sistema y scripting gracias a su entrenamiento específico en TerminalBench y su ventana de contexto extendida.
- Reparación de bugs en repositorios reales: con soporte para SWE-bench Pro v2.0 Hard y DeepSWE 1.1, puede integrarse en pipelines de CI/CD para analizar issues, localizar el código relevante y proponer parches en repositorios de gran tamaño.
- Asistente de codificación en IDE: su rendimiento en codificación agéntica y su capacidad de contexto largo permiten mantener conversaciones multi-turno sobre bases de código extensas sin perder referencias.
- Agentes autónomos de múltiples pasos: el modelo puede planificar y ejecutar secuencias de acciones encadenadas (lectura de ficheros, ejecución de tests, corrección de errores) en flujos de trabajo automatizados.
- Despliegue en hardware de consumo: al caber en una NVIDIA DGX Spark con el checkpoint NVFP4, es adecuado para desarrollo local de agentes y prototipado sin depender de infraestructura en la nube.
- Generación de código en producción con latencia baja: alcanza 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados, lo que lo hace viable para servicios de generación de código en tiempo real.
- Fine-tuning sobre dominio específico: la disponibilidad del modelo base (Ripple-65B Base Preview) permite adaptar el modelo a dominios concretos sin partir de un checkpoint ajustado por instrucciones.

## Benchmarks y rendimiento

| Benchmark | Ripple-65B Preview | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 56,4 | 63,8 | 76,4 | 80,1 |

No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K. La model card indica que los resultados se obtuvieron en BF16 a máxima precisión y esfuerzo, usando Terminus 2 para SWE-bench Pro v2.0 Hard y DeepSWE 1.1, y OpenCode cuando no se especifica el harness. El autor advierte que la replicación de benchmarks agénticos modernos es difícil y que los resultados representan un esfuerzo de comparación justa.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB (el repositorio ocupa 129,6 GB), lo que requiere múltiples GPU o una GPU con memoria unificada grande.
- VRAM estimada en NVFP4: aproximadamente 32-40 GB, lo que permite ejecución en una sola GPU de gama alta o en hardware con memoria unificada.
- GPU recomendadas: 2xB200 para alto rendimiento (250 tok/s con batch=8 en BF16); NVIDIA DGX Spark para despliegue en hardware de consumo con el checkpoint NVFP4.
- Cabe en GPU de consumo únicamente en su variante NVFP4 y en hardware con memoria unificada suficiente (DGX Spark); en BF16 no cabe en GPU de consumo convencionales.
- Opciones de despliegue: el modelo usa `custom_code`, por lo que requiere `trust_remote_code=True`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 65B | Hasta 1M | 80,52 | Apache 2.0 | Pesos abiertos (BF16, NVFP4) |
| Reflection Beam 501B | 501B | No disponible | 80,1 | No disponible | Pesos abiertos (EE. UU.) |
| Muse Spark Open 816B | 816B | No disponible | 76,4 | No disponible | Pesos abiertos (EE. UU.) |
| Inkling 975B | 975B | No disponible | 63,8 | No disponible | Pesos abiertos (EE. UU.) |
| Nemotron 3 Ultra 550B | 550B | No disponible | 56,4 | No disponible | Pesos abiertos (EE. UU.) |

Ripple-65B Preview iguala o supera en TerminalBench 2.1 a modelos con entre 7,7 y 15 veces más parámetros, manteniendo un tamaño que permite despliegue en hardware de consumo con cuantización NVFP4.

## Limitaciones y advertencias

- Modelo predominantemente inglés: no se documentan capacidades multilingües y el corpus de entrenamiento es mayoritariamente inglés, lo que limita su uso en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Postentrenamiento ligero y centrado en codificación agéntica: su rendimiento en dominios ajenos a código y agentes puede ser inferior al de modelos con postentrenamiento más extenso.
- La versión Preview puede no representar el comportamiento final del modelo; el autor la describe como una release preliminar.
- Benchmarks agénticos difíciles de replicar: los resultados pueden variar según el harness, la longitud de secuencia y las estrategias de resumen empleadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El contexto de 1M tokens se entrenó en fases específicas con lotes pequeños (8), lo que puede afectar la calidad en ventanas muy largas.

## Enlaces

- HuggingFace (modelo instruct BF16): https://huggingface.co/eyes-ml/Ripple-65B-Preview
- HuggingFace (organización Ricursive): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Variante NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Variante DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
