# Oscilla/LFM2-350M-mlx-8Bit

## Resumen

Oscilla/LFM2-350M-mlx-8Bit es una conversión al formato MLX del modelo base LiquidAI/LFM2-350M, realizada por el usuario Oscilla con la librería mlx-lm versión 0.31.2. Se trata de un modelo de lenguaje compacto diseñado para ejecutarse en dispositivos con recursos limitados, especialmente en hardware de Apple Silicon gracias al formato MLX, aunque también puede usarse con transformers en otras plataformas.

El modelo original, LFM2-350M, desarrollado por Liquid AI, emplea una arquitectura híbrida que combina capas convolucionales y de atención para lograr un procesamiento eficiente de secuencias largas, con una ventana de contexto de 32.000 tokens. Está pensado para uso local, ofreciendo baja latencia tanto en CPU como en GPU. Aunque su nombre comercial indica 350 millones de parámetros, el conteo real de parámetros en los safetensors es de 99.745.536, lo que lo sitúa en la gama de los modelos de aproximadamente 100 millones de parámetros.

La versión MLX de 8 bits reduce el tamaño del modelo a 0,4 GB, lo que lo hace adecuado para entornos edge, aplicaciones móviles y despliegues en los que la memoria es un factor crítico. Soporta ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y está licenciado bajo la licencia LFM 1.0 de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas convolucionales + atención (Liquid AI) |
| Parametros totales | 99.745.536 (según safetensors; nombre comercial: 350M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (según LM Studio) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | LFM 1.0 (licencia propia de Liquid AI) |
| Formato de pesos | safetensors (MLX, cuantización 8-bit) |

## Arquitectura y entrenamiento

El modelo base LFM2-350M utiliza una arquitectura híbrida que intercala capas convolucionales con capas de atención, una combinación diseñada para reducir el coste computacional en comparación con un transformer puro, manteniendo a la vez la capacidad de capturar dependencias de largo alcance. Esta arquitectura permite procesar secuencias de hasta 32.000 tokens con un uso eficiente de memoria y una latencia baja, tanto en CPU como en GPU.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. Se sabe que el modelo es multilingüe y que, según las descripciones de Liquid AI, destaca en tareas de matemáticas, seguimiento de instrucciones y comprensión multilingüe en comparación con otros modelos de tamaño similar. La conversión a MLX con cuantización de 8 bits no altera la arquitectura ni los pesos, solo reduce la precisión numérica para optimizar el rendimiento en hardware Apple.

## Capacidades

- Generación de texto en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Razonamiento matemático básico y seguimiento de instrucciones, según las características declaradas por el fabricante.
- Procesamiento de contexto largo (32.000 tokens) gracias a la arquitectura híbrida.
- Ejecución eficiente en CPU y GPU, especialmente en dispositivos Apple Silicon mediante el formato MLX.
- Compatible con el pipeline de transformers y con mlx-lm para generación de texto.
- No se ha confirmado soporte para tool calling, function calling, agentes o modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo puede gestionar diálogos multi-turno con una ventana de 32.000 tokens, suficiente para mantener el contexto de una conversación prolongada sin necesidad de conexión a la nube. Su tamaño reducido (0,4 GB) permite ejecutarlo en móviles o dispositivos IoT.
- Traducción y comprensión multilingüe: al soportar ocho idiomas, puede utilizarse como base para sistemas de traducción automática o para aplicaciones que necesiten entender consultas en varios idiomas, como chatbots de atención al cliente internacional.
- Generación de texto local en aplicaciones de productividad: redacción de correos, resúmenes de documentos o asistencia en escritura, ejecutándose completamente en local para garantizar privacidad de los datos.
- Educación y tutoría: puede servir como tutor de matemáticas o de idiomas, aprovechando su capacidad de razonamiento y su soporte multilingüe, en entornos sin acceso a internet.
- Prototipado rápido de aplicaciones de IA generativa: los desarrolladores pueden integrarlo en pipelines de texto para validar ideas antes de escalar a modelos más grandes, gracias a su baja latencia y requisitos mínimos de hardware.
- Procesamiento de documentos con contexto largo: su ventana de 32.000 tokens permite resumir o extraer información de documentos extensos, como informes técnicos o artículos, en un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las referencias a su buen rendimiento en matemáticas y comprensión multilingüe provienen de descripciones cualitativas del fabricante, sin cifras concretas. No se dispone de comparaciones numéricas con otros modelos en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: 0,4 GB (según LLM Explorer), lo que permite ejecutarlo en prácticamente cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; en Apple Silicon funciona nativamente con MLX. También puede ejecutarse en CPU sin problemas.
- Compatible con GPU de consumo: sí, incluyendo RTX 3060, RTX 4090, etc., y con GPUs integradas de portátiles.
- Opciones de despliegue: mlx-lm (para Apple Silicon), transformers (con PyTorch), y potencialmente otros frameworks que soporten safetensors.
- Latencia y throughput: no se han publicado cifras exactas, pero al ser un modelo de ~100M de parámetros cuantizado a 8 bits, la generación es considerablemente más rápida que modelos de mayor tamaño, incluso en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa formal con modelos de la misma categoría en la información proporcionada. Alternativas de tamaño similar (por ejemplo, TinyLlama-1.1B, Qwen2.5-0.5B o Phi-3-mini) existen, pero no hay datos de rendimiento comparativos publicados en las fuentes consultadas. Se recomienda evaluar el modelo en las tareas específicas de interés antes de elegir.

## Limitaciones y advertencias

- El número real de parámetros (99,7M) es inferior al que sugiere el nombre comercial (350M); los desarrolladores deben tenerlo en cuenta al estimar capacidades.
- Al ser un modelo pequeño, puede presentar alucinaciones con mayor frecuencia que modelos de mayor tamaño, especialmente en tareas complejas de razonamiento o generación de hechos.
- La licencia LFM 1.0 es una licencia propia de Liquid AI; es necesario revisar sus términos antes de usar el modelo en aplicaciones comerciales, ya que puede incluir restricciones específicas.
- No se ha confirmado soporte para tool calling ni para razonamiento multi-paso explícito; para aplicaciones que requieran estas capacidades, puede ser necesario complementar el modelo con frameworks externos.
- La cuantización a 8 bits puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa, aunque para muchos casos de uso la diferencia es imperceptible.
- El modelo solo cubre ocho idiomas; no es adecuado para aplicaciones que requieran soporte de idiomas fuera de esa lista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oscilla/LFM2-350M-mlx-8Bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M
- Página de LFM2-350M en LM Studio: https://lmstudio.ai/models/liquid/lfm2-350m
- Ficha de LFM2.5-350M-MLX-8bit en LLM Explorer: https://llm-explorer.com/model/LiquidAI%2FLFM2.5-350M-MLX-8bit,2B7ln67NU2ig4TykgRmkoE
- Análisis de LFM2.5-350M-MLX-8bit en Free2AITools: https://free2aitools.com/model/liquidai/lfm2.5-350m-mlx-8bit
