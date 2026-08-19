# igorvibes/Qwen3.6-27B-UD-Q4_K_XL-AWQ-MTP-mlx

## Resumen

El modelo `igorvibes/Qwen3.6-27B-UD-Q4_K_XL-AWQ-MTP-mlx` es una cuantización de precisión mixta de 4 a 8 bits del modelo base `Qwen/Qwen3.6-27B`, realizada por el autor `igorvibes` específicamente para ejecutarse en Apple Silicon mediante la librería `mlx-node`. Se trata de un modelo de generación de texto con arquitectura híbrida que combina atención tradicional con capas GatedDeltaNet, e incluye un codificador de visión (vision tower) y una cabeza de predicción multi-token (MTP) para decodificación especulativa.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 27.000 millones de parámetros en hardware de Apple con memoria unificada, manteniendo la cabeza MTP en BF16 sin cuantizar —un detalle que lo diferencia de otras conversiones similares que descartan los tensores `mtp.*`. El autor aplica una receta de cuantización basada en el mapa dinámico de Unsloth con pre-escalado AWQ, utilizando una imatrix de calibración específica para este modelo. No se han publicado benchmarks de calidad ni de rendimiento para esta build concreta, y el propio autor declara explícitamente que no se realizaron pruebas de ningún tipo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-27B (híbrida: atención + GatedDeltaNet, con vision tower y MTP head) |
| Parametros totales | 27.781.427.952 (según model card) |
| Parametros activos | no disponible (no se especifica si es MoE; se asume denso) |
| Longitud de contexto | no disponible (no se indica en la model card) |
| Tipos de cuantizacion | Mixta 4-8 bits (base 4-bit en gate_proj y up_proj; 5-bit en down_proj; 6-bit en embeddings, q/k/v, in_proj_*; 8-bit en lm_head, o_proj, out_proj, in_proj_a/b; BF16 en vision tower, MTP head, norms y parámetros de estado) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (2.195 tensores, 19.45 GiB en disco) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión cuantizada del checkpoint oficial `Qwen/Qwen3.6-27B`. La arquitectura base es un transformer híbrido que intercala capas de atención estándar con capas GatedDeltaNet, un mecanismo de estado lineal recurrente. El modelo incluye además un codificador de visión (vision tower) para entrada multimodal y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa en runtimes compatibles.

La cuantización sigue la receta Unsloth Dynamic con un mapa de precisión por módulo: `gate_proj` y `up_proj` se mantienen en 4 bits (grupo de 64), `down_proj` en 5 bits, la mayoría de proyecciones de atención y las entradas de GatedDeltaNet en 6-8 bits, mientras que la torre de visión, la cabeza MTP, todas las normas y los parámetros de estado recurrente se conservan en BF16 sin cuantizar. El pre-escalado AWQ se aplica en cuatro grupos de dependencia (norm→gate/up, up→down, input_layernorm→q/k/v, input_layernorm→in_proj_*) usando una imatrix de calibración de Unsloth específica para este modelo exacto. El resultado es un peso efectivo de 6.18 bits por parámetro, muy por encima del nominal 4 bits, lo cual es intencional para preservar la calidad.

## Capacidades

- Generación de texto y conversación multilingüe en inglés y chino (los dos idiomas declarados en la model card).
- Procesamiento multimodal de visión: el modelo incluye una torre de visión en BF16, aunque el autor advierte que no se ha probado ninguna entrada de imagen o vídeo en esta build.
- Decodificación especulativa multi-token: la cabeza MTP se conserva íntegramente en BF16 (15 tensores), lista para ser utilizada por runtimes que soporten Qwen3.5/3.6 speculative decoding.
- Inferencia optimizada para Apple Silicon mediante MLX, con cuantización mixta que reduce el uso de memoria sin comprometer excesivamente la precisión.
- Tool calling y function calling: no se menciona explícitamente, pero es una capacidad típica de la familia Qwen; sin embargo, no hay evidencia en esta model card, por lo que se considera no confirmado.
- Razonamiento y capacidades de agente: no hay información específica en la model card; se asume heredado del modelo base, pero sin verificación.

## Casos de uso

- Chatbots y asistentes conversacionales en Mac: el modelo puede desplegarse localmente en un Mac con Apple Silicon usando mlx-node, ofreciendo respuestas en inglés y chino sin depender de servicios en la nube.
- Generación de código en entornos de desarrollo: al ser una variante de Qwen3.6, es plausible que herede buenas capacidades de programación, aunque no hay benchmarks que lo confirmen; podría usarse para autocompletado o generación de scripts en local.
- Prototipado de aplicaciones con IA generativa: desarrolladores que necesitan un modelo de 27B en un portátil pueden usar esta cuantización para validar ideas antes de escalar a GPUs.
- Investigación en decodificación especulativa: la preservación de la cabeza MTP permite experimentar con técnicas de predicción multi-token en MLX, algo que otras conversiones omiten.
- Procesamiento de documentos mixtos texto-imagen: gracias a la torre de visión, podría emplearse para tareas que combinan texto e imágenes, aunque esta capacidad no ha sido verificada.
- Desarrollo de agentes locales con memoria larga: si el contexto del modelo base es amplio (típico de Qwen3.6), podría usarse para agentes que necesitan mantener conversaciones extensas, siempre que el runtime lo soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente en la model card que no se ejecutaron pruebas de perplejidad, evaluaciones de tareas ni mediciones de throughput. No se proporcionan números de MMLU, HumanEval, GSM8K ni ninguna otra métrica comparativa. Cualquier afirmación sobre rendimiento cualitativo sería especulativa.

## Requisitos de hardware

- Conversión: el autor reporta que la conversión se realizó en un Mac con 36 GB de memoria unificada, con un pico de 15.85 GiB de RSS y 22.7 GiB de asignación del allocator de MLX. Se requiere una build de mlx-node con el fix de memoria acotada (PR #118).
- Inferencia: el tamaño en disco es de 19.45 GiB, por lo que se necesita un Mac con al menos 24 GB de memoria unificada para cargar el modelo en RAM y dejar margen para el runtime y el contexto. Con 32 GB o 36 GB se operaría con más comodidad.
- GPU recomendadas: no aplica a GPUs NVIDIA o AMD; está diseñado exclusivamente para Apple Silicon (M-series) mediante MLX.
- Opciones de despliegue: mlx-node (el formato es nativo), y potencialmente cualquier runtime MLX que soporte el tipo de modelo `qwen3_5`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el formato es MLX, no GGUF.
- Latencia y throughput: no disponibles. No se realizaron mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | MTP | Tamaño en disco | BPW | Licencia |
|---|---|---|---|---|---|---|
| igorvibes/Qwen3.6-27B-UD-Q4_K_XL-AWQ-MTP-mlx (este) | 27.78B | Mixta 4-8 bit (Unsloth Dynamic + AWQ) | Sí (BF16) | 19.45 GiB | 6.18 | Apache-2.0 |
| igorvibes/Qwen3.6-27B-UD-Q5_K_XL-AWQ-MTP-mlx | 27.78B | Mixta 5-8 bit (Unsloth Dynamic + AWQ) | Sí (BF16) | 22.95 GiB | 7.38 | Apache-2.0 |
| Brooooooklyn/Qwen3.6-27B-UD-Q4_K_XL-mlx | 27.78B | Mixta 4-8 bit (Unsloth Dynamic) | No (cero tensores mtp.*) | no disponible | no disponible | Apache-2.0 |
| Qwen/Qwen3.6-27B (original) | 27.78B | BF16 | Sí | ~55 GiB aprox. | 16 | Apache-2.0 |

La diferencia clave frente a la conversión de Brooooooklyn es la retención de la cabeza MTP. Frente al original, esta cuantización reduce el tamaño a aproximadamente un tercio, a costa de una pérdida de precisión no medida.

## Limitaciones y advertencias

- Sin verificación de calidad: el autor no ejecutó ningún benchmark, prueba de perplejidad ni evaluación de tareas. El rendimiento real es desconocido.
- Capacidad de visión no probada: la torre de visión se incluye en BF16, pero no se ha ejercitado con ninguna imagen o vídeo. Podría fallar o degradarse.
- MTP preservado pero no verificado: los tensores de la cabeza MTP están presentes y con formas correctas, pero no se ha confirmado que un runtime los utilice efectivamente.
- Riesgo de alucinación y sesgos: al ser una cuantización agresiva (6.18 BPW efectivo), es probable que aumente la tasa de alucinación respecto al modelo original, especialmente en tareas de razonamiento complejo.
- Soporte de idiomas limitado: solo se declaran inglés y chino. Otros idiomas pueden funcionar peor o no estar soportados.
- Dependencia de mlx-node: el formato es propietario de MLX; no es directamente utilizable con otros frameworks como vLLM o llama.cpp sin conversión adicional.
- Restricciones de hardware: exclusivo para Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin re-convertir a otro formato.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.6-27B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/igorvibes/Qwen3.6-27B-UD-Q4_K_XL-AWQ-MTP-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Imatrix de calibración: https://huggingface.co/unsloth/Qwen3.6-27B-GGUF
- Documentación de Unsloth Dynamic: https://unsloth.ai/docs/models/qwen3.5/gguf-benchmarks
- Herramienta de conversión: https://github.com/mlx-node/mlx-node
- PR #118 de mlx-node (fix de memoria acotada): https://github.com/mlx-node/mlx-node/pull/118
- Receta de referencia (Brooooooklyn): https://huggingface.co/Brooooooklyn/Qwen3.6-27B-UD-Q4_K_XL-mlx
- Variante Q5 del mismo autor: https://huggingface.co/igorvibes/Qwen3.6-27B-UD-Q5_K_XL-AWQ-MTP-mlx
