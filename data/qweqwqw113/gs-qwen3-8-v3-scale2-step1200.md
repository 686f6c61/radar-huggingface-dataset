# qweqwqw113/GS-qwen3.8-V3-scale2-step1200

## Resumen

GS Qwen3.8 V3 · scale2 · step1200 es un ajuste fino (fine-tuning) comunitario del modelo Qwen3.8-27B, publicado por el usuario qweqwqw113 en Hugging Face. No se trata de un modelo nuevo desde cero, sino de un checkpoint completo en BF16 que fusiona los pesos originales del modelo base con un adaptador LoRA acumulativo entrenado en tres etapas consecutivas de 400 actualizaciones cada una (1.200 pasos en total). El entrenamiento se realizó con MLX (el framework de Apple Silicon), con rango LoRA 16, aplicado a las últimas 16 capas, tasa de aprendizaje 2e-6 y secuencia máxima de 32.768 tokens.

El modelo conserva la naturaleza multimodal (image-text-to-text) del Qwen3.8-27B original y su enfoque en código y conversación. Su relevancia es principalmente como ejemplo de fine-tuning ligero y experimental: la propia model card advierte que no se ha afirmado ninguna mejora de benchmarks antes de una evaluación formal, por lo que su utilidad práctica depende de que el usuario realice sus propias pruebas. Con 27,78 mil millones de parámetros y licencia Apache 2.0, es un modelo abierto apto para uso comercial, aunque orientado a un público muy nicho (desarrolladores que ya trabajen con el ecosistema Qwen3.8 y MLX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 32.768 tokens (secuencia maxima usada en el entrenamiento) |
| Tipos de cuantizacion | BF16 (checkpoint completo); carpeta mlx-adapter con factores MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (55,7 GB de repo); adaptador MLX en carpeta separada |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal de la familia Qwen con capacidades de imagen-texto-a-texto. Sobre este base se aplicó un ajuste fino LoRA (rank 16, alpha 32, escala estándar MLX "scale2") sobre las últimas 16 capas del modelo. El checkpoint publicado es un modelo completo fusionado: los pesos base originales en BF16 combinados con el adaptador final acumulativo, lo que elimina la necesidad de cargar el adaptador por separado en inferencia.

El entrenamiento constó de tres etapas consecutivas de 400 actualizaciones cada una, con tasa de aprendizaje 2e-6, optimizador AdamW, batch size 1 y secuencia máxima de 32.768 tokens. Cada etapa reiniciaba el optimizador pero continuaba desde los pesos del adaptador anterior. La etapa 3 incorporó supervisión de los turnos del asistente (supervised fine-tuning sobre respuestas). El autor indica expresamente que el número de actualizaciones no garantiza una época completa del dataset y que se usaron los archivos "mixed" originales, no el dataset limpio separado de 5.993 filas. Los tensores MTP (multi-token prediction) originales se preservaron sin cambios: el MTP no fue fine-tunado. No hay información sobre RLHF, DPO ni composición detallada del dataset.

## Capacidades

- Generacion de texto conversacional (heredada del modelo base Qwen3.8-27B)
- Comprension multimodal de imagen y texto (pipeline image-text-to-text)
- Generacion y comprension de codigo (tag "code" en la model card)
- Ventana de contexto de hasta 32.768 tokens segun la configuracion de entrenamiento
- Prediccion multi-token (MTP) heredada del modelo base, sin modificar
- Tool calling, agentes y capacidades multilingues: no disponibles (no documentadas en la model card)

## Casos de uso

- Experimentacion con fine-tuning LoRA en MLX: al ser un checkpoint fusionado procedente de un pipeline MLX documentado (con SHA256 del adaptador publicado), sirve como referencia reproducible para quien quiera estudiar o replicar este tipo de ajuste fino en Apple Silicon.
- Chatbots con comprension de imagenes: al conservar el pipeline image-text-to-text del modelo base, puede usarse en asistentes que describan o razonen sobre imagenes enviadas por el usuario, dentro de su ventana de 32.768 tokens.
- Asistencia a la programacion: el tag "code" y la herencia de Qwen3.8 lo hacen candidato para autocompletado, revision y explicacion de codigo, siempre previa validacion por parte del usuario.
- Procesamiento de conversaciones largas: la secuencia maxima de 32.768 tokens empleada en el entrenamiento permite mantener seses de chat multi-turno con documentos adjuntos de longitud moderada.
- Base para ajustes finos adicionales: al ser un checkpoint completo en BF16 con licencia Apache 2.0, puede usarse como punto de partida para nuevos LoRA o ajustes completos sin depender del modelo base original.
- Evaluacion comparativa de adaptadores: util para comparar el efecto de 1.200 pasos de LoRA acumulativo frente al modelo base en tareas concretas del dominio del dataset de entrenamiento (no publicado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No benchmark score or improvement is claimed before evaluation" (no se afirma ninguna puntuacion ni mejora de benchmark antes de la evaluacion). No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 mil millones de parametros en BF16 (~55,7 GB de pesos), se necesitan al menos 60 GB de VRAM solo para los pesos, mas la memoria de KV cache; en la practica, 80 GB por GPU es el minimo realista.
- GPUs recomendadas: A100 80 GB, H100 80 GB o equivalentes de datacenter. No cabe en una sola GPU de consumo en BF16.
- Consumer GPUs: no cabe en BF16 en ninguna GPU de consumo habitual (una RTX 4090 con 24 GB es insuficiente). Seria necesario cuantizar el modelo (por ejemplo a 4 bits, ~14-16 GB) para ejecutarlo en GPUs de 24 GB, aunque no se publican versiones cuantizadas en el repositorio. Alternativamente, la carpeta mlx-adapter permite trabajar con MLX en Macs con memoria unificada elevada (por ejemplo, Mac Studio con 64-128 GB).
- Opciones de despliegue: transformers (libreria nativa del checkpoint); por herencia de la familia Qwen es plausible el uso de vLLM, llama.cpp (requiere conversion a GGUF, no incluida) u Ollama, pero no hay soporte documentado especifico para este checkpoint. El adaptador MLX requiere el framework MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| GS-qwen3.8-V3-scale2-step1200 | 27,78 B | 32.768 tokens (entrenamiento) | Si (image-text-to-text) | Apache 2.0 | Fine-tuning LoRA fusionado, sin benchmarks publicados |
| Qwen/Qwen3.8-27B (modelo base) | ~27,8 B | no disponible en la ficha | Si (image-text-to-text) | Apache 2.0 | Modelo original sin ajuste fino |
| Qwen2.5-VL-32B-Instruct | 32 B | 128.000 tokens | Si (vision + texto) | Apache 2.0 | Alternativa multimodal de la misma familia con benchmarks publicados y soporte oficial |

La comparacion principal relevante es con su propio modelo base: este checkpoint solo difiere del original en los pesos ajustados de las ultimas 16 capas tras 1.200 pasos de LoRA, y sin evaluaciones publicadas no puede afirmarse que supere al base en ninguna tarea.

## Limitaciones y advertencias

- Sin evaluacion: la model card no presenta benchmarks ni afirma mejoras; el modelo debe considerarse experimental y sin validar.
- Dataset opaco: se usaron los archivos "mixed" originales; ni la composicion ni el tamano del dataset de entrenamiento estan documentados, lo que impide evaluar sesgos o contaminacion.
- Entrenamiento incompleto: el propio autor advierte que 1.200 actualizaciones no garantizan una epoca completa, por lo que el ajuste puede ser insuficiente o inconsistente.
- Sesgos: al heredar de Qwen3.8-27B, probablemente mantiene los sesgos del modelo base, mas cualquier sesgo introducido por el dataset no documentado.
- Riesgo de alucinacion: tipico de LLMs de gran tamano; no hay evidencia de que el fine-tuning lo reduzca.
- Idiomas: no documentados; no hay garantia de rendimiento en castellano.
- Contexto: la ventana de 32.768 tokens corresponde a la configuracion de entrenamiento; el limite real del modelo base no se indica en la ficha.
- Requisitos de hardware elevados: 55,7 GB en BF16 limitan el despliegue a hardware de datacenter o Macs con memoria unificada muy alta.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un fine-tuning de terceros conviene verificar que el dataset usado no imponga restricciones adicionales (no documentadas).
- La carpeta mlx-adapter contiene factores MLX, no un adaptador PEFT estandar; no es directamente cargable con la libreria peft de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qweqwqw113/GS-qwen3.8-V3-scale2-step1200
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo: no disponibles
