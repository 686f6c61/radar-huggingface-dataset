# npario/SuperQwen3.8-27b-abliterated-MLX-4bit

## Resumen

SuperQwen3.8-27b-abliterated-MLX-4bit es una cuantización nativa en 4 bits para Apple Silicon del modelo SuperQwen3.8-27b-abliterated, publicada por el usuario npario. Se trata de una conversión directa a MLX (formato affine 4-bit, group size 64) del modelo base de Jiunsong, que a su vez deriva de la familia Qwen3.8/3.5 con una edición de "abliteration" (eliminación de mecanismos de rechazo) aplicada mediante la receta OBLITERATUS. El resultado es un modelo multimodal de 27.356.728.560 parámetros (~27,4 B) que cabe en aproximadamente 15 GiB y se ejecuta localmente en un Mac sin necesidad de GPU de servidor.

El modelo resuelve el problema de desplegar un LLM multimodal de gran tamaño en hardware de consumo Apple: el repo ocupa 16,1 GB en tres shards safetensors (~14,96 GiB de pesos), y las mediciones del autor reportan 27,011 tok/s en decodificación autorregresiva de un solo stream y 33,374 tok/s con decodificación especulativa DFlash 2 (bloque 3), con un pico de memoria de 18,435 GB. La edición abliterated elimina los rechazos del modelo padre (de 30/32 a 0/32 en el conjunto de prueba del autor) manteniendo, según sus propias comprobaciones, la capacidad general y el soporte de tool calling.

Es relevante ahora porque combina tres tendencias: cuantización de precisión mixta para silicio Apple, modelos multimodales (image-text-to-text) de tamaño medio-grande y variantes "uncensored" orientadas a investigación y uso sin restricciones de alineación. La licencia Apache-2.0 facilita su uso comercial, aunque la naturaleza abliterated introduce caveats importantes de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8/3.5, con vision tower y pesos MTP; cuantización MLX affine 4-bit |
| Parámetros totales | 27.356.728.560 (~27,4 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine 4-bit, group size 64 (repo de 4 bits); el modelo base ofrece BF16, NVFP4 (W4A4 G16) y GGUF |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 3 shards, ~14,96 GiB) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.8/3.5 con torre de visión y pesos MTP (multi-token prediction), convertido a MLX sobre la revisión fijada `mlx-community/Qwen3.8-27B-4bit@3e6447f`. La edición abliterated no es un adaptador: los tensores afectados se dequantizaron, se aplicó el delta de abliteración y cada matriz se recuantizó a pesos/escalas/sesgos nativos de MLX. La receta es una edición de rango 4 verificada (OBLITERATUS) construida a partir de 842 pares canónicos harmful/harmless; se modificaron exactamente 100 tensores BF16, mientras que la torre de visión y los pesos MTP permanecieron intactos. El manifiesto de conversión (`mlx_requantization_manifest.json`) registra la revisión base, cada clave modificada y los hashes de los shards, lo que hace la conversión auditable.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base. La innovación técnica destacable es la decodificación especulativa DFlash 2 integrada de forma lossless: según el autor, cada bloque probado preserva la secuencia exacta de tokens greedy, y el bloque 3 es el perfil más rápido elegible para release (1,2356× sobre autorregresivo). También se modifica la plantilla de razonamiento: el valor implícito pasa a `medium` acotado, con objetivo interno de 512 tokens para tareas rutinarias y un guard de parada contra repetición/reinicio, manteniendo `xhigh` disponible de forma explícita.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" acotado (niveles default, low, medium y xhigh) y guard de sobrepensamiento.
- Procesamiento de imagen y texto (pipeline image-text-to-text); el autor verifica inferencia real con un PNG rojo de 64×64 a través de MLX-VLM 0.6.16.
- Tool calling / function calling (el autor reporta "tool PASS" en su batería de pruebas).
- Razonamiento multi-paso y uso como agente (tags `reasoning`, `tool-calling`).
- Capacidades multilingües limitadas a inglés y coreano según los metadatos.
- Comportamiento "uncensored": rechazo en el modelo padre reducido de 30/32 a 0/32 en el conjunto fijo de 32 prompts del autor, con 0/32 de salidas vacías.
- Decodificación especulativa DFlash 2 con preservación exacta de la secuencia greedy.

## Casos de uso

- Asistente local en Mac para desarrolladores: el modelo se ejecuta en Apple Silicon con ~15 GiB de pesos y permite conversaciones multi-turno con razonamiento y tool calling sin depender de APIs externas; adecuado para entornos con requisitos de privacidad.
- Análisis de imágenes en local: al ser image-text-to-text, se puede usar para describir, clasificar o extraer información de capturas, diagramas o documentos escaneados sin enviar datos a la nube.
- Automatización de tareas de agente: su soporte de tool calling y razonamiento multi-paso permite encadenar llamadas a funciones (lectura de ficheros, consultas a APIs locales) en flujos de trabajo personales o de prototipado.
- Investigación sobre alineación y seguridad: la variante abliterated es útil para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparar respuestas frente al modelo padre y evaluar sesgos y riesgos en condiciones controladas.
- Generación y revisión de código en inglés: aunque no se documenta un benchmark específico, el modelo base Qwen es conocido por su rendimiento en código; aquí se usaría como asistente local de programación con contexto conversacional.
- Prototipado multimodal rápido: gracias a la conversión MLX y a la carga directa con MLX-VLM, sirve para validar pipelines de visión-lenguaje en un solo equipo antes de escalar a infraestructura con GPU.
- Experimentación con decodificación especulativa: el perfil DFlash 2 lossless permite medir ganancias de throughput (1,2356× reportado) en hardware Apple sin alterar las salidas.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son mediciones locales de velocidad y memoria en un Apple M5 Max con MLX 0.32.1, MLX-LM 0.31.3 y MLX-VLM 0.6.16 (un stream, prompt de 256 tokens, 256 tokens fijos de generación, decodificación greedy, un warmup y dos ensayos cronometrados). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | Resultado |
|---|---|
| AR C1 (ensayo 1) | 26,797 tok/s |
| AR C1 (ensayo 2) | 27,225 tok/s |
| AR C1 (mediana) | 27,011 tok/s |
| DFlash 2 bloque 3 C1 (ensayo 1) | 33,199 tok/s |
| DFlash 2 bloque 3 C1 (ensayo 2) | 33,550 tok/s |
| DFlash 2 bloque 3 C1 (mediana) | 33,374 tok/s |
| Aceleración DFlash 2 sobre AR | 1,2356× |
| Identidad greedy | Exacta en ambos ensayos |
| Pico de memoria con draft DFlash 4-bit | 18,435 GB |
| Pico de memoria en suite de calidad completa | 16,062 GB |
| Suite de calidad (53 comprobaciones) | 186,6 s, 16,06 GB de pico |
| Rechazo harmful (32 prompts) | 0/32 |
| Salidas vacías | 0/32 |
| Gate de sobrepensamiento | 36/36 PASS (default 9/9, low 9/9, medium 9/9, xhigh 9/9) |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: ~15 GiB para los pesos (14,96 GiB en 3 shards); el autor reporta un pico de 18,435 GB con el draft DFlash 4-bit y 16,062 GB en la suite de calidad. En la práctica se recomienda un Mac con al menos 24-32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (el autor midió en un Apple M5 Max). No está pensado para GPU NVIDIA; para esas plataformas existen las variantes BF16, NVFP4 y GGUF del modelo base.
- ¿Cabe en GPU de consumo? No en el sentido habitual (NVIDIA consumer): el formato es MLX y requiere Apple Silicon. En un Mac con memoria unificada suficiente, sí.
- Opciones de despliegue: MLX (0.32.1), MLX-LM (0.31.3) y MLX-VLM (0.6.16) para la ruta multimodal. Para otras plataformas, usar las releases BF16 (Transformers/vLLM), NVFP4 (vLLM) o GGUF (llama.cpp) del modelo base.
- Latencia y throughput: 27,011 tok/s en AR C1 y 33,374 tok/s con DFlash 2 bloque 3 en un M5 Max, en las condiciones de medición indicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperQwen3.8-27b-abliterated-MLX-4bit (este) | ~27,4 B | no disponible | MLX affine 4-bit | Apache-2.0 | Hugging Face (MLX) |
| SuperQwen3.8-27b-abliterated (BF16) | ~27,4 B | no disponible | BF16 | Apache-2.0 | Hugging Face (Transformers/vLLM) |
| SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark | ~27,4 B | no disponible | W4A4 G16 | Apache-2.0 | Hugging Face (vLLM) |
| SuperQwen3.8-27b-abliterated-GGUF | ~27,4 B | no disponible | GGUF | Apache-2.0 | Hugging Face (llama.cpp) |

No se dispone de información sobre modelos de terceros comparables (mismo tamaño o misma tarea) en los datos proporcionados; la comparativa se limita a las distintas releases del mismo modelo base.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado deliberadamente el comportamiento de rechazo. No es adecuado para aplicaciones orientadas al usuario final sin filtros adicionales de seguridad.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto; el autor solo documenta 0/32 rechazos en un conjunto fijo de 32 prompts, lo que no constituye una evaluación de seguridad exhaustiva.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fidelidad ni de tasas de error publicados.
- Idiomas limitados a inglés y coreano según los metadatos; el rendimiento en castellano no está documentado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en contextos largos.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza uncensored traslada al desplegador la responsabilidad legal y ética del contenido generado.
- Específico de Apple Silicon: no se puede ejecutar en GPU NVIDIA sin recurrir a otras releases del modelo base.
- El modelo base es una conversión de un modelo de terceros (Jiunsong) sobre una revisión fijada de mlx-community; la trazabilidad del entrenamiento original (datos, RLHF/DPO) no está documentada.
- El rendimiento medido corresponde a un único hardware (M5 Max) y a una configuración concreta; el throughput en otros chips Apple puede diferir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/npario/SuperQwen3.8-27b-abliterated-MLX-4bit
- Modelo base BF16: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated
- Release NVFP4: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark
- Release GGUF: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-GGUF
- Revisión base MLX usada en la conversión: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit/tree/3e6447f082e89cc7f0bc6e5441afd38dfce760ff
