# mlx-community/Qwen2.5-Omni-3B-Thinker-8bit

## Resumen

mlx-community/Qwen2.5-Omni-3B-Thinker-8bit es una conversión a MLX del módulo thinker de Qwen/Qwen2.5-Omni-3B. Incluye el modelo de lenguaje Qwen2 de 36 capas con dimensión oculta 2048 y una torre de audio de 32 capas con forma de Whisper. No es un modelo de chat: el repositorio omite la cabeza LM, la torre de visión, el talker y token2wav, por lo que su salida son estados ocultos.

El artefacto está pensado como encoder semántico de AuK-bf16 en xocialize/mlx-auk-swift. Las capas Lineales de las 36 capas del LLM y de las 32 capas de audio están cuantizadas a affine 8-bit con group size 64, mientras que embeddings, norms y projections se mantienen en bf16. El peso cuantizado ocupa 4,26 GB y el repositorio completo 4,3 GB.

Su relevancia es práctica: permite ejecutar en Apple Silicon, vía MLX, un encoder multimodal de texto y audio con paridad numérica respecto a transformers 4.57.1. La licencia Qwen Research limita el uso a investigación o evaluación no comercial; para uso comercial hay que solicitar licencia a Alibaba Cloud. No se dispone de longitud de contexto ni de idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 de 36 capas y dimensión oculta 2048, más torre de audio estilo Whisper de 32 capas; solo módulo thinker/encoder |
| Parámetros totales | no disponible (subconjunto del modelo base Qwen2.5-Omni-3B; no se detalla el recuento exacto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | affine 8-bit con group size 64 en capas Lineales; bf16 en embeddings, norms y projections |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (qwen-research): solo investigación o evaluación, no comercial |
| Formato de pesos | safetensors (encoder.safetensors); config.json, tokenizer, chat template y preprocessor originales; convoluciones de audio en layout MLX (O, K, I) |
| Modelo base | Qwen/Qwen2.5-Omni-3B |
| Tamaño del repositorio | 4,3 GB |
| Peso cuantizado | 4,26 GB |
| Uso previsto | encoder de estados ocultos para AuK; no es un modelo conversacional |
| Modalidades de entrada | texto y audio (torre de audio); sin visión en este artefacto |
| Salidas | estados ocultos y features de audio; sin generación de texto ni voz |

## Arquitectura y entrenamiento

La arquitectura es un subconjunto del modelo Omni: un decoder Qwen2 de 36 capas y 2048 de dimensión oculta, junto a una torre de audio de 32 capas inspirada en Whisper. El repositorio conserva solo el thinker, es decir, el encoder que produce estados ocultos; no incluye la cabeza de lenguaje, la torre de visión, el talker ni token2wav. Las convoluciones de audio se han reordenado al layout MLX (O, K, I).

Este artefacto no se ha entrenado desde cero: es una conversión y cuantización de Qwen/Qwen2.5-Omni-3B. No se proporcionan datos de entrenamiento, número de tokens, composición del dataset ni detalles de RLHF/DPO. La validación de paridad frente a transformers 4.57.1 en fp32 reporta ids de token idénticos, relL2 de 1,5e-6 en features de Whisper, 3,9e-6 en la torre de audio, 2,2e-5 en el último estado oculto y 3,8e-6 en la condición fusionada de 36 capas de AuK. Además, las variantes bf16, 8-bit y 4-bit superan la puerta de calidad preregistrada de AuK (tasa de error, SIM de CAM++ y DNSMOS frente a fp32).

## Capacidades

- Extracción de estados ocultos semánticos a partir de entradas de texto y audio.
- Codificación de audio mediante una torre de 32 capas con forma de Whisper.
- Integración como encoder semántico de AuK-bf16 en xocialize/mlx-auk-swift.
- Ejecución en Apple Silicon con MLX y MLX Swift.
- Paridad numérica con la implementación de referencia transformers 4.57.1 en fp32 para tokens, features de audio, estados ocultos y condición fusionada.
- No dispone de cabeza LM: no genera texto, no mantiene conversaciones y no produce respuestas autoregresivas.
- No incluye torre de visión: no procesa imágenes ni vídeo en este artefacto.
- No incluye talker ni token2wav: no sintetiza voz.
- No se documentan soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan idiomas soportados.
- El nombre Thinker identifica el módulo del modelo Omni, no un modo de razonamiento encadenado.

## Casos de uso

- Encoder semántico en AuK: se usa para generar la condición fusionada de 36 capas que alimenta el pipeline de AuK en mlx-auk-swift, con ejecución local en Apple Silicon.
- Extracción de embeddings de audio para búsqueda y recuperación: se calculan estados ocultos de fragmentos de audio y se indexan para similitud semántica en un corpus.
- Prototipos de privacidad en dispositivo: al ejecutarse con MLX en macOS/iOS, permite procesar audio y texto localmente sin enviar datos a un servidor.
- Investigación de representaciones multimodal: sirve para comparar estados ocultos de texto y audio frente a la referencia fp32 y estudiar el efecto de la cuantización 8-bit.
- Preprocesamiento para clasificación o etiquetado de audio: los estados ocultos se pueden conectar a un clasificador descendente para tareas como detección de eventos o categorización.
- Validación de regresión en CI: los checks de paridad (token ids, features de Whisper, audio tower, hidden state) se pueden automatizar para detectar desviaciones tras cambios de runtime o cuantización.
- Generación de features para pipelines de síntesis o diálogo: el encoder proporciona representaciones que otros componentes del sistema Omni/AuK pueden consumir, sin asumir que este repositorio genera texto o voz.
- Evaluación de cuantización en Apple Silicon: comparar 8-bit con bf16/4-bit usando las métricas de calidad de AuK antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La validación disponible es de paridad numérica, no de calidad de tareas.

| Métrica | Referencia transformers 4.57.1 fp32 | Este artefacto 8-bit |
|---|---|---|
| Token ids | idénticos | idénticos |
| Features de Whisper (relL2) | 0 (referencia) | 1,5e-6 |
| Torre de audio (relL2) | 0 (referencia) | 3,9e-6 |
| Último estado oculto (relL2) | 0 (referencia) | 2,2e-5 |
| Condición fusionada de 36 capas de AuK (relL2) | 0 (referencia) | 3,8e-6 |

La puerta de calidad de AuK indica que las variantes bf16, 8-bit y 4-bit superan la puerta preregistrada (tasa de error, SIM de CAM++ y DNSMOS frente a fp32); no se incluyen los valores numéricos.

## Requisitos de hardware

- Peso cuantizado: 4,26 GB; repositorio completo: 4,3 GB. Es la base mínima de memoria para los pesos.
- VRAM/memoria unificada estimada: al menos 8 GB para pesos más overhead de activaciones y runtime; 16 GB recomendados para margen. Es una estimación, no una medida publicada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con MLX. No hay soporte nativo CUDA en este repositorio.
- Consumer GPU: sí en Apple Silicon con memoria unificada suficiente; en NVIDIA requeriría convertir el artefacto a otro runtime, no incluido.
- Despliegue: MLX, MLX Swift y xocialize/mlx-auk-swift. vLLM, TGI, llama.cpp y Ollama no son aplicables a este encoder tal como se distribuye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento de tareas para comparar; la comparación se limita a alcance, modalidad y licencia.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Thinker-8bit MLX) | no disponible (subconjunto del base 3B) | no disponible | texto y audio como encoder; sin visión, generación ni voz | qwen-research, no comercial | MLX safetensors en Hugging Face |
| Qwen/Qwen2.5-Omni-3B (completo) | 3B nominales | no disponible | texto, imagen, audio y vídeo; generación de texto y voz en streaming | qwen-research | Hugging Face transformers |
| AuK-bf16 | no disponible | no disponible | modelo de destino del encoder; especificaciones no disponibles | no disponible | mlx-community en Hugging Face |

## Limitaciones y advertencias

- No es un modelo de chat ni de generación: carece de cabeza LM.
- No procesa imágenes ni vídeo: la torre de visión no está incluida.
- No sintetiza voz: talker y token2wav no están incluidos.
- No se documentan longitud de contexto, idiomas soportados ni sesgos conocidos.
- Licencia Qwen Research: solo investigación/evaluación, no comercial; el uso comercial requiere licencia de Alibaba Cloud.
- Artefacto modificado y cuantizado: aunque la paridad es buena, hay diferencias numéricas (por ejemplo, 2,2e-5 en el último estado oculto) que deben validarse en la aplicación final.
- Dependencia de MLX y Apple Silicon; no es portable directamente a CUDA, vLLM, TGI, llama.cpp u Ollama.
- El nombre Thinker no implica razonamiento encadenado; se refiere al módulo thinker del modelo Omni.
- Riesgo de alucinación: no aplica a la generación porque no genera texto; los embeddings pueden heredar sesgos del modelo base.
- No usar como sustituto del modelo completo en tareas que requieran respuestas, tool calling o agentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-8bit)
- [Modelo base Qwen/Qwen2.5-Omni-3B](https://huggingface.co/Qwen/Qwen2.5-Omni-3B)
- [Licencia LICENSE](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-8bit/blob/main/LICENSE)
- [NOTICE](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-8bit/blob/main/NOTICE)
- [AuK-bf16](https://huggingface.co/mlx-community/AuK-bf16)
- [xocialize/mlx-auk-swift](https://github.com/xocialize/mlx-auk-swift)
- [QwenLM/Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni)
- [Colección Qwen2.5 de mlx-community](https://huggingface.co/collections/mlx-community/qwen25)
- [Qwen2.5-Omni en openlm.ai](https://openlm.ai/qwen2.5-omni/)
