# ownllm/phi-4-mlx-4bit

## Resumen

Phi-4 (MLX 4-bit) es una conversión cuantizada a 4 bits en formato MLX del modelo microsoft/phi-4, un transformer decoder-only de aproximadamente 14.660 millones de parámetros desarrollado originalmente por Microsoft. Esta copia concreta la publica el usuario ownllm dentro de su colección de modelos para su proyecto OwnLLM, y está orientada exclusivamente a equipos Apple Silicon que ejecutan MLX. Los pesos son idénticos a los de la conversión de la comunidad MLX; OwnLLM no los ha modificado.

El modelo resuelve el problema de ejecutar un modelo de ~14B en hardware de consumo (Macs con memoria unificada) sin depender de la nube: la cuantización a 4 bits reduce el peso a unos 7,7 GB, lo que permite inferencia local en máquinas con 16 GB de memoria o más. Es relevante para desarrolladores que quieren un modelo de razonamiento y matemáticas de tamaño medio- grande ejecutándose de forma privada en local.

Se distribuye bajo licencia MIT, con pipeline de text-generation y librería MLX, y está etiquetado como `base_model: microsoft/phi-4`. El repositorio ocupa 8,2 GB en total (pesos en safetensors en formato MLX). No es un formato GGUF, por lo que no se carga con llama.cpp ni con el propio paquete GGUF de OwnLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 14.659.507.200 (14,66B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (heredado de microsoft/phi-4) |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

Nota: los datos de contexto y arquitectura proceden del modelo base microsoft/phi-4; la model card de esta copia no los repite. Los idiomas soportados no se especifican en la informacion proporcionada.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de tipo dense (no MoE) de unos 14,66B de parámetros, correspondiente al modelo base microsoft/phi-4. La model card de esta copia no detalla la composición del dataset de entrenamiento, el número de tokens ni las fases de post-entrenamiento (SFT, DPO, RLHF) empleadas por Microsoft; esos datos no están disponibles en la información proporcionada y deben consultarse en la ficha del modelo original.

Lo específico de esta publicación es la conversión: cuantización a 4 bits realizada por la comunidad MLX (no por OwnLLM), preservando los pesos originales. El repositorio se limita a redistribuir esa conversión para su uso con la librería `mlx-lm`. No introduce innovaciones arquitectónicas propias (ni decodificación especulativa, ni atención lineal ni variantes híbridas documentadas en la información disponible).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y matemáticas: la familia Phi-4 está orientada a tareas de razonamiento y cálculo, según el modelo base.
- Generación de código: capacidad habitual de la familia Phi, no detallada explícitamente en esta model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta copia.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Asistente local de razonamiento en Mac: ejecutar Phi-4 4-bit con `mlx-lm` para tareas de análisis y resolución de problemas matemáticos o lógicos en local, sin enviar datos a la nube.
- Entorno de desarrollo privado: usar el modelo como copiloto de código dentro de un Mac con 16 GB o más, aprovechando la licencia MIT y la ausencia de dependencias de API externas.
- Prototipado de aplicaciones MLX: servir como base para probar pipelines de generación de texto sobre Apple Silicon antes de escalar a modelos mayores en GPU dedicada.
- Procesamiento de documentos sensibles: resumir y analizar textos confidenciales (legal, médico, financiero) en local para evitar exponer datos a servicios terceros, con la advertencia de no fiarse del modelo en decisiones críticas.
- Educación y tutoría: generar explicaciones paso a paso de conceptos técnicos o matemáticos en un portátil Apple, útil para entornos sin conectividad.
- Investigación sobre cuantización: comparar el comportamiento de este 4-bit MLX frente al modelo original en BF16 para estudiar la degradación introducida por la cuantización.
- Chat conversacional offline: construir asistentes multi-turno en aplicaciones de escritorio para macOS que funcionen sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion cuantizada a 4 bits. La model card de esta copia no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes. Los datos de evaluación del modelo base figuran en la ficha de microsoft/phi-4, no en este repositorio.

## Requisitos de hardware

- VRAM/memoria: los pesos en 4 bits ocupan aproximadamente 7,7 GB; el repositorio completo son 8,2 GB.
- Requisito declarado por el autor: Mac con Apple Silicon y 16 GB de memoria unificada o más.
- Memoria recomendada: 18-24 GB unificados para contextos largos, ya que a los pesos hay que sumar la caché KV y el overhead del runtime.
- Cabe en consumer hardware: sí, en Macs Apple Silicon (M-series) con 16 GB o superior. No está pensado para GPU dedicadas de consumo mediante CUDA, al ser formato MLX.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate` y API de Python de MLX). No se carga con llama.cpp, Ollama ni el paquete GGUF de OwnLLM, según advierte la propia model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ownllm/phi-4-mlx-4bit (este) | 14,66B | 16.384 tokens | MLX safetensors, 4 bits | MIT | Hugging Face |
| microsoft/phi-4 (base) | 14B | 16.384 tokens | safetensors, BF16 | MIT | Hugging Face |
| mlx-community/phi-4-4bit | 14B | 16.384 tokens | MLX safetensors, 4 bits | MIT | Hugging Face |

No se dispone de datos de rendimiento (benchmarks) para establecer una comparación cuantitativa con alternativas como Qwen2.5-14B o Gemma-2-9B en la información proporcionada. La diferencia práctica entre este repositorio y mlx-community/phi-4-4bit es la redistribución bajo la colección OwnLLM, con pesos idénticos.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte que el modelo puede expresarse con seguridad y estar equivocado; no debe usarse en solitario para decisiones médicas, legales, financieras o de seguridad.
- Sesgos conocidos: no se detallan en la información disponible; hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Idiomas: no especificados; el modelo base está fuertemente orientado al inglés, por lo que el rendimiento en otras lenguas puede degradarse (no confirmado en la información proporcionada).
- Degradación por cuantización: la conversión a 4 bits puede reducir la precisión frente al modelo original en BF16, especialmente en tareas de razonamiento y matemáticas.
- Restricciones de despliegue: al ser formato MLX, no es compatible con llama.cpp, Ollama ni el paquete GGUF de OwnLLM; queda limitado a Apple Silicon con `mlx-lm`.
- Licencia: MIT permite uso comercial, pero no implica aval de Microsoft; OwnLLM declara no estar afiliado ni respaldado por Microsoft.
- Advertencia de la model card: el paquete OwnLLM para Mac, Linux y Windows usa GGUF con llama.cpp y no carga este formato; estos ficheros son solo para Apple Silicon con `mlx-lm`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ownllm/phi-4-mlx-4bit
- Modelo base: https://huggingface.co/microsoft/phi-4
- Conversión de la comunidad MLX: https://huggingface.co/mlx-community/phi-4-4bit
- Repositorio del proyecto OwnLLM: https://github.com/ownllm-org/ownllm

Referencias adicionales encontradas en la búsqueda web (no específicas de este repositorio):

- Guía de IA en dispositivo (2026): https://www.aimagicx.com/blog/on-device-ai-models-local-llm-guide-2026
- Phi-4-mini-reasoning MLX 4-bit: https://huggingface.co/mlx-community/Phi-4-mini-reasoning-4bit
- Análisis de Phi-4-mini MLX 4-bit: https://llm.co/llms/phi-4-mini-reasoning-mlx-4bit
