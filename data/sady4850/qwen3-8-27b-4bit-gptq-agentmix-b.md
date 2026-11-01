# sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix-b

## Resumen

`sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix-b` es un checkpoint experimental de cuantización de 4 bits derivado de `Qwen/Qwen3.8-27B`, publicado por el usuario sady4850. No se trata de un modelo entrenado desde cero, sino de una calibración GPTQ aplicada sobre los pesos del modelo base de Qwen, empaquetada en el formato MLX affine 4-bit con group size 64, idéntico al layout de `mlx-community/Qwen3.8-27B-4bit`. Su propósito declarado es servir como control de ruido de calibración dentro de un estudio más amplio sobre agentes.

El interés del checkpoint es metodológico: forma parte de una familia de variantes (`-agentmix`, `-agentmix-b`) que miden cuánto depende la calidad de la cuantización del conjunto concreto de fragmentos de datos de agente utilizados durante la calibración. Mientras `-agentmix` emplea los fragmentos 0-39 del pool, esta variante `-b` usa los fragmentos 128-167, manteniendo el mismo tipo de mezcla. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base.

Con 27.356.728.560 parámetros reales (según safetensors), un repositorio de 16,1 GB y licencia Apache 2.0, el modelo está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX. Su adopción es muy reducida (37 descargas, 0 likes), y el propio autor lo etiqueta como experimental, por lo que no debe considerarse un artefacto listo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; detalles no disponibles en la información proporcionada) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit GPTQ con formato MLX affine, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, cuantización affine 4-bit) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a `Qwen/Qwen3.8-27B`, un transformer de aproximadamente 27.360 millones de parámetros. La información proporcionada no detalla la composición del dataset de preentrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se especifica si el modelo base incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

Lo que sí está documentado es el proceso de cuantización. Se aplica GPTQ sobre los pesos del modelo base, calibrado con una mezcla de datos que incluye fragmentos de agente (concretamente los chunks 128-167 del pool, frente a los 0-39 usados en `-agentmix`). El resultado se empaqueta en el layout MLX affine 4-bit con group size 64, replicando exactamente la estructura de `mlx-community/Qwen3.8-27B-4bit`. El objetivo del experimento es cuantificar la varianza introducida por la selección de datos de calibración: el autor reporta métricas de divergencia KL frente al checkpoint GPTQ sin calibrar específicamente en agentes.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento image-text-to-text según el pipeline declarado, lo que implica entrada de imágenes junto a texto.
- Razonamiento orientado a agentes: la calibración se realizó sobre fragmentos de datos de agente, y el autor evalúa KLD en "agent reasoning" y "agent tool-call".
- Tool calling / function calling: se reporta una métrica específica de "agent tool-call KLD" y de coincidencia de llamadas frente a bf16 (+5,5 puntos, 59,9% de mismo call).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de robustez de cuantizaciones: el checkpoint sirve para medir cuánto varía la calidad de un GPTQ 4-bit según el subconjunto de datos de calibración empleado, comparando `-agentmix` con `-agentmix-b` sobre las mismas 49 tareas.
- Investigación sobre calibración de modelos: útil para estudiar la sensibilidad de la divergencia KL (razonamiento y tool-call) a la selección de chunks de agente, con intervalos de confianza al 95% reportados.
- Inferencia local en Apple Silicon: al estar en formato MLX affine 4-bit, puede ejecutarse en Macs con memoria unificada suficiente, aprovechando la aceleración de MLX.
- Prototipado de asistentes con tool calling: el modelo conserva la capacidad de emitir llamadas a herramientas, con una tasa de coincidencia del 59,9% respecto a bf16, adecuada para entornos de experimentación donde se tolere cierta degradación.
- Pipeline image-text-to-text experimental: para probar flujos que combinen imagen y texto en local, siempre validando la calidad frente al modelo base en bf16.
- Referencia para comparativas de cuantización: como baseline de control en estudios que comparen distintos esquemas (GPTQ, MLX affine, group sizes) sobre el mismo modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas relativas de la cuantización frente a `sady4850/Qwen3.8-27B-4bit-GPTQ`, medidas sobre 49 tareas con intervalos de confianza al 95%.

| Métrica (vs GPTQ sin mezcla de agente) | Valor (IC 95%) |
|---|---|
| KLD de razonamiento de agente | -31% [-33%, -29%] (0,0180) |
| KLD de tool-call de agente | -29% [-33%, -25%] (0,0042) |
| Misma llamada que bf16 | +5,5 [+1,2, +9,8] puntos (59,9%) |
| KLD wiki (torch) | +5% (0,0387) |
| KLD chat (torch) | -1% (0,0978) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 16,1 GB en cuantización 4-bit, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead de ejecución.
- GPU recomendadas: no se especifican; el formato MLX está orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada suficiente).
- ¿Cabe en consumer GPU? No hay datos para GPUs NVIDIA consumer en formato MLX; para CUDA habría que reconvertir o usar otra variante del modelo base.
- Opciones de despliegue: MLX (librería declarada). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix-b` | 27,36 B | no disponible | 4-bit GPTQ / MLX affine | Apache 2.0 | HuggingFace (37 descargas) |
| `sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix` | 27,36 B (presumible) | no disponible | 4-bit GPTQ / MLX affine | Apache 2.0 | HuggingFace |
| `mlx-community/Qwen3.8-27B-4bit` | 27,36 B (presumible) | no disponible | MLX affine 4-bit | no disponible | HuggingFace |
| `Qwen/Qwen3.8-27B` (base) | 27,36 B | no disponible | bf16 | no disponible | HuggingFace |

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor lo describe como parte de un estudio de calibración; no está pensado como artefacto de producción.
- Adopción mínima: 37 descargas y 0 likes, sin validación comunitaria.
- Degradación frente a bf16: solo el 59,9% de las llamadas a herramientas coinciden con el modelo en bf16, lo que implica un 40,1% de divergencia en tool calling.
- Sesgos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado; la cuantización 4-bit puede incrementarlo respecto al modelo base.
- Idiomas: no se especifica la cobertura lingüística.
- Contexto: no se indica la longitud máxima soportada.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar la licencia del modelo base.
- Formato MLX limita el despliegue a ecosistema Apple; no hay garantías de compatibilidad con stacks CUDA estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix-b
- Variante principal del estudio: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix
- GPTQ de referencia: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Layout MLX de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
