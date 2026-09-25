# DJLougen/LFM2.5-VL-3B-DSpark-MLX-8bit

## Resumen

El LFM2.5-VL-3B-DSpark-MLX-8bit es una conversión nativa de MLX del borrador (drafter) DFlash de cuatro capas perteneciente a Liquid AI, derivado del checkpoint LiquidAI/LFM2.5-VL-3B-DSpark. No es un modelo autónomo: es el componente que propone tokens candidatos dentro de un esquema de decodificación especulativa, y necesita siempre un modelo objetivo (target) de la familia LFM2.5-VL-3B que valide esas propuestas. La conversión la publica el usuario DJLougen con tensores y metadatos de configuración adaptados al runtime DFlash de MLX-VLM, en lugar del layout orientado a SGLang del checkpoint original.

El borrador tiene 279.468.801 parámetros (unos 279 millones) y aplica cuantización afín de 8 bits con tamaño de grupo 64 a los lineales del transformer de borrador (cuatro capas más la proyección `fc`), mientras que las cabezas Markov y de confianza y los pesos de normalización se mantienen en BF16. El repositorio ocupa 0,4 GB y el archivo `model.safetensors` pesa 358.408.820 bytes. La licencia es la LFM Open License v1.0, heredada del repositorio upstream.

Su relevancia es práctica y acotada: permite acelerar la decodificación de un VLM de 3B en Apple Silicon con una versión más ligera que el borrador BF16 original. Las mediciones publicadas por el autor muestran una ganancia de 3,02x en velocidad de decodificación con objetivo BF16, pero solo de 1,11x con objetivo de 8 bits, y el rendimiento en contexto largo para esta variante cuantizada no está establecido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de borrador DFlash de 4 capas más proyección `fc`; lineales con cuantización afín de 8 bits (group size 64), cabezas Markov y de confianza y normalizaciones en BF16. No es MoE ni SSM. |
| Parámetros totales | 279.468.801 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits afín con group size 64 (lineales del borrador); BF16 para cabezas y normalización. Cuantización MLX. |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiqueta `other`). El repositorio de código asociado usa Apache-2.0, que no se aplica a los pesos. |
| Formato de pesos | `model.safetensors` (MLX), 358.408.820 bytes, SHA-256 `1c99bd3cf35eb0b651c61ce44596e28086cfa489499ea7eae3cafc0f992aeca4` |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa, no un modelo entrenado desde cero por el autor de la conversión. Estructuralmente es un transformer compacto de cuatro capas cuyo objetivo es proponer varios tokens por paso, que el modelo objetivo verifica después de forma greedy; la verificación greedy preserva la salida del objetivo, de modo que la ganancia real depende del número de propuestas aceptadas y de la velocidad del propio objetivo. Incluye dos componentes distintivos descritos en la model card: una cabeza Markov y una cabeza de confianza, ambas mantenidas en BF16 en esta conversión.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO: la model card solo documenta el proceso de conversión. La innovación técnica relevante es la propia conversión: frente al layout orientado a SGLang del checkpoint original, esta versión ofrece tensores y metadatos nativos de MLX para el runtime DFlash de MLX-VLM, con un borrador de menor tamaño que el original en BF16. El checkpoint upstream está fijado en la revisión `af77e9306a26e8625fde74d2a3051ab6d21bd955`. La ruta DFlash probada es exclusivamente greedy, por lo que requiere temperatura cero. El modelo base declarado es LiquidAI/LFM2.5-VL-3B-DSpark, con referencias también a las variantes MLX-bf16 y MLX-8bit del mismo objetivo.

## Capacidades

- Propuesta de tokens especulativos: genera bloques de tokens candidatos que el modelo objetivo LFM2.5-VL-3B valida; no produce salida final por sí mismo.
- Integración con el runtime DFlash de MLX-VLM, con soporte de `--draft-model` y `--draft-block-size`.
- Compatibilidad declarada con objetivos LFM2.5-VL-3B tanto en BF16 como en 8 bits del ecosistema MLX.
- Capacidad multimodal heredada del objetivo: el ejemplo de uso de la model card procesa una imagen y un prompt de texto ("Describe this image."), por lo que participa en flujos visión-lenguaje.
- Decodificación greedy: el camino DFlash probado es únicamente greedy, con temperatura cero.
- No dispone de tool calling, function calling, modo thinking ni capacidades de agente propias; cualquier capacidad de ese tipo dependería del modelo objetivo.
- Soporte multilingüe: no disponible en la información proporcionada.
- No es un borrador genérico: la model card advierte explícitamente que no sirve como drafter generalista para modelos Qwen3 pese a la etiqueta `qwen3` del repositorio.

## Casos de uso

- Aceleración de inferencia local de un VLM de 3B en Mac: con un objetivo BF16, el autor mide 131,9 tok/s frente a 43,6 tok/s en modo objetivo único, un ratio de 3,02x en decodificación y 2,44x extremo a extremo. Es el escenario donde esta conversión aporta más.
- Prototipado de pipelines multimodales en Apple Silicon: permite experimentar con decodificación especulativa sin salir del ecosistema MLX, usando `mlx-vlm.generate` con imagen y prompt, útil para equipos que validan ideas antes de invertir en infraestructura GPU.
- Servicios de descripción de imágenes o captioning con presupuesto de latencia ajustado: el bloque de borrador de tamaño 8 con objetivo BF16 ofrece el mejor ratio medido (4,30 tokens aceptados por ronda), adecuado para cargas de respuesta corta.
- Evaluación comparativa de decodificación especulativa: sirve como caso de estudio reproducible para medir aceptación de propuestas, ya que el repositorio de código publica `results/sweep.json` con las filas seleccionadas del barrido.
- Despliegue en equipos de desarrollo con memoria unificada limitada: el borrador ocupa solo 0,4 GB y los lineales están en 8 bits, por lo que el sobrecoste de memoria sobre el objetivo de 3B es reducido.
- Asistentes de accesibilidad o lectura de documentos con visión en local: al ejecutarse sobre un VLM que acepta imagen y texto, encaja en aplicaciones de escritorio que describen o resumen contenido visual sin enviar datos a la nube.
- Optimización de agentes multimodales que ya usan LFM2.5-VL-3B como motor: el borrador se activa solo en la ruta de generación, por lo que puede añadirse a un pipeline existente cambiando únicamente los argumentos de invocación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye mediciones de velocidad realizadas en una única máquina: Apple M3 Max con 36 GB de memoria unificada, Python 3.12, mlx 0.32.2, mlx-vlm 0.7.3 y transformers 5.17.0. El cribado consistió en tres instrucciones sobre la misma imagen, generación greedy y dos repeticiones por prompt y configuración, conservando la ejecución con menor tiempo total y promediando después. El propio autor advierte que la selección del mejor de dos puede ser optimista.

| Precisión del objetivo | Bloque de borrador | Decodificación solo objetivo (media) | Con este borrador (media) | Ratio de velocidad de decodificación | Ratio extremo a extremo | Tokens aceptados por ronda |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 8 | 43,6 tok/s | 131,9 tok/s | 3,02x | 2,44x | 4,30 |
| 8 bits | 4 | 74,9 tok/s | 82,2 tok/s | 1,11x | 1,09x | 2,99 |

La salida seleccionada del borrador coincidió con el texto generado en modo objetivo único para cada prompt. Con el objetivo de 8 bits, la configuración de bloque 8 resultó más lenta que la decodificación sin borrador. El barrido de contexto largo se realizó con el borrador BF16, no con esta variante cuantizada, y mostró que la especulación era más lenta que el modo objetivo único con 32k y 64k tokens de contexto.

## Requisitos de hardware

- Memoria para el borrador: 358.408.820 bytes de pesos (aproximadamente 0,34 GB) más overhead del runtime; el repositorio completo ocupa 0,4 GB.
- Memoria total del sistema: la medición de referencia se hizo con 36 GB de memoria unificada, compartida entre el borrador y el objetivo LFM2.5-VL-3B.
- Hardware validado: Apple M3 Max. El requisito de MLX implica Apple Silicon; no hay soporte declarado para GPU NVIDIA ni CUDA.
- GPU de consumo: no aplica en el sentido habitual; el modelo está pensado para memoria unificada de Apple Silicon. No se documenta compatibilidad con RTX 4090 ni con GPUs discretas.
- Opciones de despliegue: exclusivamente MLX-VLM, con versión mínima 0.7.2 (los resultados se obtuvieron con 0.7.3). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 131,9 tok/s de decodificación con objetivo BF16 y bloque 8; 82,2 tok/s con objetivo de 8 bits y bloque 4; 43,6 tok/s y 74,9 tok/s respectivamente en modo objetivo único.
- Ajuste de bloque: el bloque 4 fue el mejor probado con objetivo de 8 bits; el bloque 8 resultó más lento que el modo objetivo único en esa configuración.

## Comparativa con modelos similares

No se dispone de datos de terceros ni de benchmarks oficiales para establecer una comparativa rigurosa. La única comparación documentada es interna al propio ecosistema:

| Alternativa | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (borrador 8 bits MLX) | 279.468.801 | no disponible | 3,02x decodificación con objetivo BF16; 1,11x con objetivo 8 bits (M3 Max, 3 prompts) | LFM Open License v1.0 | HuggingFace, solo MLX |
| Borrador LFM2.5-VL-3B-DSpark original (BF16, layout SGLang) | no disponible | no disponible | Sin resultados publicados en esta información; usado en el barrido de contexto largo, donde la especulación fue más lenta que el modo objetivo único a 32k y 64k tokens | LFM Open License v1.0 | HuggingFace, orientado a SGLang |
| Objetivo único sin borrador (LFM2.5-VL-3B) | 3B (según familia del modelo base) | no disponible | 43,6 tok/s en BF16 y 74,9 tok/s en 8 bits (misma máquina) | LFM Open License v1.0 | HuggingFace, variantes MLX-bf16 y MLX-8bit |

No se conocen modelos comparables de otros fabricantes para esta función concreta en el ecosistema MLX: no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un objetivo LFM2.5-VL-3B que verifique las propuestas no genera salida utilizable.
- Específico de la familia LFM2.5-VL-3B; la model card advierte que no es un borrador generalista para Qwen3 pese a la etiqueta del repositorio.
- La mejora con objetivo de 8 bits es pequeña, en torno al 9% extremo a extremo sobre un cribado de tres prompts, y el autor indica que puede no mantenerse en otra carga de trabajo o dispositivo.
- El bloque 8 fue más lento que el modo objetivo único con objetivo de 8 bits en el mismo cribado.
- Rendimiento en contexto largo sin establecer para esta variante cuantizada: el barrido de 32k y 64k tokens se hizo con el borrador BF16 y mostró que la especulación era más lenta que el modo objetivo único.
- Metodología de medición optimista: se conserva el mejor de dos ejecuciones por prompt y configuración, y solo se publican las filas seleccionadas en `results/sweep.json`, no ambas repeticiones.
- Solo decodificación greedy: la ruta DFlash probada exige temperatura cero, lo que limita su uso en aplicaciones que dependen de muestreo estocástico.
- No se declara ningún resultado de benchmark con SGLang ni validación contra benchmarks upstream.
- Sesgos, tasas de alucinación y comportamiento multilingüe no están documentados para el borrador; cualquier sesgo de la salida final proviene del modelo objetivo, que tampoco se evalúa aquí.
- Licencia: los pesos se distribuyen bajo la LFM Open License v1.0, con las condiciones de uso comercial que fije ese texto. La licencia Apache-2.0 del repositorio de código enlazado no se aplica a los pesos.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es prácticamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJLougen/LFM2.5-VL-3B-DSpark-MLX-8bit
- Checkpoint upstream (LiquidAI/LFM2.5-VL-3B-DSpark): https://huggingface.co/LiquidAI/LFM2.5-VL-3B-DSpark
- Objetivo MLX BF16 (LiquidAI/LFM2.5-VL-3B-MLX-bf16): https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-bf16
- Objetivo MLX 8 bits (LiquidAI/LFM2.5-VL-3B-MLX-8bit): https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-8bit
- Código de conversión y benchmark: https://github.com/DJLougen/lfm25-vl-3b
- Resultados del barrido: https://github.com/DJLougen/lfm25-vl-3b/blob/main/results/sweep.json
- Licencia LFM Open License v1.0 (archivo LICENSE del repositorio del modelo): https://huggingface.co/DJLougen/LFM2.5-VL-3B-DSpark-MLX-8bit/blob/main/LICENSE

Nota: la búsqueda web realizada no devolvió ningún resultado pertinente sobre este modelo; los enlaces listados proceden exclusivamente de la información del repositorio de HuggingFace y de su model card.
