# mlx-community/Z1T-0-mlx

## Resumen

Z1T-0 (MLX) es una conversión a MLX del modelo Z1T-0 de Extropic AI, el primer modelo de lenguaje con pesos abiertos de la arquitectura Z1T. Se trata de un decoder autoregresivo sin mecanismo de atención softmax, que utiliza convoluciones causales depthwise, un pool acumulativo causal y proyecciones dispersas fijas con fan-in 4 y activación tanh-lineal. La única normalización es Dynamic-Tanh (DyT). El modelo está diseñado para el hardware probabilístico Z1 de Extropic, pero esta versión MLX permite ejecutarlo en Apple Silicon.

Con aproximadamente 1.242 millones de parámetros (1.24B) y un tokenizador GPT-2 BPE, el modelo es un artefacto de investigación pequeño de 4 capas. La conversión mantiene una decodificación greedy token por token idéntica al checkpoint original JAX/Equinox, con una diferencia máxima de logits de 1.4e-2. Su relevancia radica en ser una referencia abierta para estudiar arquitecturas sin atención, dispersión fija y normalizaciones alternativas, así como para validar la portabilidad de modelos JAX a MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Z1T: decoder autoregresivo sin atención softmax; convolución causal depthwise + pool acumulativo causal; proyecciones dispersas fijas fan-in-4 con activación tanh-lineal; normalización Dynamic-Tanh (DyT) |
| Parámetros totales | 1.242.072.362 (aprox. 1.24B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo incluye pesos float32) |
| Idiomas soportados | No disponibles (tokenizador GPT-2 BPE estándar) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (float32) + config.json y tokenizer GPT-2 BPE; scripts Python de inferencia MLX |

## Arquitectura y entrenamiento

El modelo Z1T-0 emplea una arquitectura decoder sin atención softmax. En lugar de mecanismos de atención, usa una convolución causal depthwise seguida de un pool acumulativo causal para capturar dependencias temporales. Las proyecciones de entrada son dispersas y fijas, con un fan-in de 4 y una activación tanh-lineal, lo que reduce el coste computacional y se alinea con el hardware probabilístico Z1 de Extropic. La única normalización es Dynamic-Tanh, una técnica que evita LayerNorm o RMSNorm.

El checkpoint original está entrenado en JAX/Equinox y se distribuye como .eqx. Esta conversión a MLX mantiene los pesos sin modificar y los exporta a safetensors. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de alineamiento como RLHF o DPO. La tabla posicional del checkpoint es numéricamente cero, ya que la convolución causal ya codifica la posición.

## Capacidades

- Generación de texto autoregresiva básica, con salidas cortas y repetitivas debido a su tamaño (4 capas).
- Decodificación greedy determinista: token por token idéntica al checkpoint JAX original, con 100% de acuerdo en el argmax por posición.
- Ejecución en Apple Silicon mediante MLX, con scripts autocontenidos (run.py) que no requieren JAX ni mlx-vlm.
- Integración opcional con mlx-vlm si se añade el modelo a la librería.
- Tokenizador GPT-2 BPE estándar.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio, razonamiento complejo o capacidades multilingües.

## Casos de uso

1. Investigación en arquitecturas sin atención: el modelo permite analizar cómo un decoder sin softmax attention maneja dependencias secuenciales mediante convoluciones causales y pooling acumulativo, en un entorno de código abierto y con pesos disponibles.
2. Validación de portabilidad de modelos JAX a MLX: al ser una conversión fiel (logits con diferencia máxima de 1.4e-2), sirve como caso de prueba para verificar que un checkpoint .eqx se puede exportar a safetensors y ejecutar en MLX sin cambios de comportamiento.
3. Estudio de la normalización Dynamic-Tanh: al usar DyT como única norma, es útil para comparar su efecto frente a LayerNorm o RMSNorm en modelos pequeños, en tareas de generación de texto.
4. Docencia en aprendizaje profundo: su tamaño reducido y su código Python autocontenido facilitan la explicación de componentes alternativos a los transformers estándar, como la dispersión fija y las convoluciones causales.
5. Benchmarking de inferencia en Apple Silicon: la medición de prefill (~150 µs/token en un M5 Max) y el decode no optimizado permiten evaluar el rendimiento de MLX en modelos de tamaño medio y optimizar kernels.
6. Desarrollo de simuladores para hardware probabilístico: al ser el primer open-weight Z1T, puede usarse como referencia para probar kernels o simuladores del hardware Z1 de Extropic, comparando salidas con la implementación JAX original.
7. Reproducibilidad de conversiones de pesos: la propiedad de decodificación idéntica permite verificar que una conversión de pesos no introduce errores de redondeo relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación solo reporta métricas de fidelidad de la conversión: diferencia máxima de logits de 1.4e-2 y 100% de acuerdo en el argmax por posición, además de un prefill de ~150 µs/token en un Apple M5 Max.

## Requisitos de hardware

- VRAM estimada: los pesos float32 ocupan aproximadamente 4.97 GB (1.242.072.362 parámetros × 4 bytes). En Apple Silicon se usa memoria unificada; no se especifica el consumo exacto en ejecución.
- GPU recomendada: Apple Silicon (el modelo se ha probado en un M5 Max). No se mencionan GPUs NVIDIA ni otros proveedores.
- En consumer GPU: no hay cuantizaciones disponibles en el repositorio, por lo que se necesitaría al menos ~5 GB de VRAM para cargar los pesos en float32; no se ha validado el funcionamiento en GPUs NVIDIA.
- Opciones de despliegue: ejecución directa con run.py (requiere MLX, numpy, tiktoken, safetensors) o integración con mlx-vlm si se añade el modelo a la librería. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: prefill ~150 µs/token en un Apple M5 Max; la generación de un solo token (decode) no está optimizada y no se proporcionan cifras.

## Comparativa con modelos similares

No disponible. El modelo Z1T-0 es una implementación de referencia de una arquitectura sin atención (Z1T) y no se dispone en la información proporcionada de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de investigación pequeño (4 capas) y sus generaciones son cortas y repetitivas; no es adecuado para tareas de producción.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluación de seguridad.
- El decode no está optimizado y la conversión es de portabilidad, no de throughput.
- Solo se ha probado en Apple Silicon; no hay garantías de funcionamiento en otras plataformas.
- La tabla posicional es numéricamente cero, lo que puede afectar a modelos que dependan de embeddings posicionales explícitos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para aplicaciones de producción.
- El tokenizador GPT-2 BPE estándar puede limitar el vocabulario a dominios en inglés.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mlx-community/Z1T-0-mlx
- Modelo original: https://huggingface.co/Extropic-AI/Z1T-0
- Artículo de investigación de Extropic: https://extropic.ai/writing/z1t
- Código de sparse-transformers: https://github.com/extropic-ai/sparse-transformers
- MLX framework: https://mlx-framework.org/
- Organización mlx-community: https://huggingface.co/mlx-community
- Repositorio de MLX en GitHub: https://github.com/ml-explore/mlx
- Apple Open Source MLX: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
