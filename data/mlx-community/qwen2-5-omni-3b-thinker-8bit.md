# mlx-community/Qwen2.5-Omni-3B-Thinker-8bit

## Resumen

Qwen2.5-Omni-3B-Thinker-8bit es una conversión a MLX del componente "thinker" del modelo multimodal Qwen2.5-Omni-3B de Alibaba Qwen. No se trata de un modelo de chat completo, sino de un encoder: incluye el modelo de lenguaje Qwen2 (36 capas de 2048 dimensiones) y la torre de audio de tipo Whisper, pero excluye la torre de visión, la cabeza del LM, el talker y el token2wav. Se distribuye como pesos safetensors con las capas lineales cuantizadas a 8 bits afines (group size 64), ocupando 4,26 GB, mientras que embeddings, normas y proyecciones permanecen en bf16.

El modelo está pensado para su uso como encoder semántico del sistema AuK dentro de mlx-auk-swift, un stack de audio en Swift para Apple Silicon. Su función es producir estados ocultos a partir de audio y texto, no generar respuestas conversacionales. Por tanto, su relevancia es de nicho: sirve a desarrolladores que construyen pipelines de procesamiento de audio (por ejemplo, edición de acento o separación de habla) sobre el framework MLX de Apple, y no como alternativa generalista a un LLM.

La licencia es la Qwen Research License Agreement: solo permite uso de investigación o evaluación, y prohíbe el uso comercial sin solicitar una licencia a Alibaba Cloud. Es un dato crítico para cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (thinker) + torre de audio tipo Whisper, convertido a MLX |
| Parametros totales | 3B (modelo base Qwen2.5-Omni-3B); no se detalla el desglose del subconjunto thinker |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín, group size 64 en lineales; bf16 en embeddings, normas y proyecciones (existen variantes -4bit y bf16 en la familia) |
| Idiomas soportados | inglés y mandarín mencionados en la evaluación de paridad; lista completa no disponible |
| Licencia | qwen-research (Qwen Research License Agreement), solo investigación, no comercial |
| Formato de pesos | safetensors (encoder.safetensors con claves thinker.model.* y thinker.audio_tower.*) |

## Arquitectura y entrenamiento

El modelo es un subconjunto del Qwen2.5-Omni-3B original: conserva las 36 capas del LLM Qwen2 con dimensión oculta 2048 y las 32 capas de la torre de audio con forma de Whisper. La conversión a MLX reorganiza los pesos convolucionales de audio en layout (O, K, I) y cuantiza las 36 capas del LLM y las 32 de la torre de audio a 8 bits afines con group size 64. No se incluyen la torre de visión, la cabeza del LM, el talker ni el token2wav, por lo que el artefacto no puede generar texto ni audio por sí mismo: solo produce estados ocultos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en esta conversión; esos datos corresponden al modelo base Qwen2.5-Omni-3B, no documentados en la información proporcionada. La innovación técnica destacable es la paridad numérica reportada frente a la referencia de transformers 4.57.1 en fp32: ids de token idénticos, features Whisper con relL2 de 1,5e-6, torre de audio 3,9e-6, último estado oculto 2,2e-5 y condición fusionada de 36 capas de AuK 3,8e-6. Además, los niveles bf16, 8-bit y 4-bit superan la puerta de calidad pre-registrada de AuK (tasa de error, SIM de CAM++ y DNSMOS frente a fp32) en inglés, mientras que el nivel 4-bit falla en mandarín.

## Capacidades

- Extracción de estados ocultos a partir de audio y texto como encoder semántico de AuK.
- Procesamiento de audio mediante la torre tipo Whisper (32 capas).
- Procesamiento de texto mediante el modelo Qwen2 (36 capas, 2048 de dimensión).
- Integración con mlx-swift para despliegue en el ecosistema Apple Silicon.
- No incluye generación de texto: carece de cabeza LM.
- No incluye visión: la torre de visión no está incluida.
- No incluye síntesis ni generación de audio: talker y token2wav ausentes.
- No soporta tool calling ni function calling (no es un modelo de chat).
- No soporta razonamiento multi-paso ni modo thinking.
- Capacidades multilingües limitadas a lo evaluado: inglés y mandarín.

## Casos de uso

- Edición de acento de habla: el encoder proporciona la condición fusionada de 36 capas que AuK usa para tareas de de-accent; el nivel 8-bit mantiene la calidad en mandarín (CER de 3,6 % frente a 17,9 % del 4-bit), por lo que es la elección recomendada para este escenario.
- Evaluación de investigación en procesamiento de audio: sirve para reproducir experimentos de AuK con paridad numérica verificada frente a transformers 4.57.1.
- Desarrollo de aplicaciones Swift nativas en Apple Silicon: al estar en formato MLX y contar con integración en mlx-auk-swift, permite incorporar el encoder en apps macOS/iOS sin salir del stack de Apple.
- Prototipado de pipelines de separación y análisis de habla: los estados ocultos del audio tower alimentan etapas posteriores de un pipeline de audio.
- Comparación de cuantizaciones: permite medir el impacto de 8-bit frente a bf16 y 4-bit en métricas objetivas (SIM de CAM++, DNSMOS) antes de fijar un nivel para producción.
- Investigación académica sobre modelos omni: al ser un subconjunto aislado del thinker, facilita estudiar el comportamiento del LLM y la torre de audio de Qwen2.5-Omni sin cargar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de paridad numérica frente a la referencia en fp32:

| Metrica | Valor (relL2 frente a fp32) |
|---|---|
| Ids de token | idénticos |
| Features Whisper | 1,5e-6 |
| Torre de audio | 3,9e-6 |
| Último estado oculto | 2,2e-5 |
| Condición fusionada de 36 capas de AuK | 3,8e-6 |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,3 GB; el archivo encoder.safetensors cuantizado a 8-bit pesa 4,26 GB, por lo que se necesita al menos ese espacio en memoria unificada.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente (no se especifican modelos concretos en la información disponible).
- Cabe en GPU consumer: no disponible; el formato MLX está orientado a chips Apple, no a GPU NVIDIA.
- Opciones de despliegue: MLX y mlx-swift mediante mlx-auk-swift; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Omni-3B-Thinker-8bit (este) | 3B (subconjunto thinker) | no disponible | safetensors MLX | qwen-research (no comercial) | Solo encoder; sin LM head, visión ni talker |
| Qwen/Qwen2.5-Omni-3B (base) | 3B | no disponible | safetensors | qwen-research | Modelo omni completo original |
| AuK-bf16 (mlx-community) | no disponible | no disponible | safetensors MLX | no disponible | Sistema que usa este modelo como encoder |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: carece de cabeza LM, torre de visión, talker y token2wav; no genera texto ni audio.
- Licencia qwen-research: solo investigación o evaluación, uso no comercial; para uso comercial hay que solicitar licencia a Alibaba Cloud.
- El nivel 4-bit falla la puerta de calidad de AuK en mandarín (CER de 3,6 % a 17,9 % y pérdida de palabras de contenido); para edición en mandarín debe usarse el nivel 8-bit.
- La evaluación de calidad documentada se limita a inglés y mandarín; el comportamiento en otros idiomas no está verificado.
- Riesgo de sesgos y alucinación del modelo base Qwen2.5-Omni-3B no documentado en la información disponible.
- Longitud de contexto no especificada, lo que impide planificar cargas de audio o texto largas.
- Al ser archivos modificados (convertidos y cuantizados), pueden existir diferencias sutiles frente al original más allá de las métricas de paridad reportadas.
- Dependencia del ecosistema MLX y Apple Silicon; no hay soporte documentado para CUDA.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- AuK-bf16: https://huggingface.co/mlx-community/AuK-bf16
- Repositorio mlx-auk-swift: https://github.com/xocialize/mlx-auk-swift
- Licencia (LICENSE en el repo): https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-8bit/blob/main/LICENSE
- Aviso de atribución (NOTICE en el repo): https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-8bit/blob/main/NOTICE
