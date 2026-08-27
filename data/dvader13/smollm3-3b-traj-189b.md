# dvader13/smollm3-3b-traj-189b

## Resumen

Este repositorio contiene los checkpoints intermedios de un entrenamiento con aprendizaje por refuerzo (RL) del modelo SmolLM3-3B, publicado por el usuario dvader13. Se trata de la trayectoria de entrenamiento correspondiente a la época 1, con 31 puntos de control numerados como `step-XXXX/`, guardados en precisión bf16 y destinados únicamente a inferencia. El modelo base es SmolLM3-3B, un transformer decoder-only de 3 mil millones de parámetros desarrollado por Hugging Face, entrenado sobre 11 billones de tokens de datos públicos y con soporte de contexto de hasta 128K tokens.

La relevancia de este repositorio radica en que permite a investigadores y desarrolladores analizar la evolución del modelo durante el entrenamiento RL, observar cómo cambian las representaciones internas y las capacidades emergentes a lo largo de los pasos. El espaciado entre pasos se amplía progresivamente (20 pasos hasta el 200, luego 40, 80 y 120), lo que sugiere una estrategia de registro más densa al inicio del entrenamiento. No se trata de un modelo final listo para producción, sino de un artefacto de investigación para estudiar dinámicas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base) |
| Tipos de cuantizacion | bf16 (checkpoints nativos) |
| Idiomas soportados | no disponible en el repositorio; el modelo base soporta 6 idiomas (incluido español) |
| Licencia | Apache-2.0 |
| Formato de pesos | no especificado; probablemente safetensors o binarios PyTorch en bf16 |

## Arquitectura y entrenamiento

El repositorio no proporciona detalles sobre la arquitectura interna más allá de indicar que se basa en SmolLM3-3B. Este modelo base es un transformer decoder-only con atención causal, entrenado por Hugging Face sobre 11 billones de tokens de datos públicos (documentos web, artículos científicos y código). El entrenamiento RL de este repositorio parte de un checkpoint de pretraining correspondiente a la rung de 189 mil millones de tokens, y los checkpoints aquí publicados son puntos intermedios de la época 1 de ese proceso RL.

No se especifica el algoritmo de RL utilizado (PPO, GRPO, etc.), ni el dataset de recompensas, ni el número total de pasos de entrenamiento. El espaciado creciente entre checkpoints (20, 40, 80, 120) sugiere que el autor quiso capturar más detalle en las fases tempranas del entrenamiento, donde los cambios suelen ser más rápidos. Los checkpoints están en bf16 y marcados como "inference only", lo que indica que no se incluyen estados de optimizador ni gradientes.

## Capacidades

- Al ser checkpoints intermedios de RL, no se documentan capacidades específicas en el repositorio.
- Heredan las capacidades del modelo base SmolLM3-3B: generación de texto, razonamiento, código, matemáticas y soporte multilingüe (6 idiomas europeos).
- El modelo base incluye modo de razonamiento dual (pensamiento rápido y lento) y soporte de tool calling, aunque no se confirma que estos checkpoints intermedios mantengan esas capacidades plenamente.
- No se garantiza que los checkpoints sean funcionales para tareas concretas; son artefactos de investigación.

## Casos de uso

- Investigación en dinámicas de entrenamiento RL: analizar cómo evoluciona la pérdida, la diversidad de respuestas o la alineación a lo largo de los pasos, comparando checkpoints consecutivos.
- Estudio de la formación de capacidades: identificar en qué paso emergen habilidades como el razonamiento multi-paso o la generación de código, útil para entender la escalabilidad del RL.
- Fine-tuning adicional: usar un checkpoint intermedio como punto de partida para entrenamientos específicos, en lugar de partir del modelo base, para explorar si acelera la convergencia.
- Análisis de robustez: evaluar la estabilidad del modelo ante perturbaciones en diferentes etapas del entrenamiento RL.
- Reproducibilidad de experimentos: servir como referencia pública para comparar trayectorias de entrenamiento de otros modelos o configuraciones.
- Educación: ilustrar en cursos de aprendizaje automático cómo se ve un modelo a mitad de entrenamiento y qué diferencias hay entre checkpoints tempranos y tardíos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otros tests estándar. Al tratarse de checkpoints intermedios de RL, su rendimiento puede variar significativamente entre pasos y no es comparable directamente con modelos finales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3B parámetros en bf16 (2 bytes por parámetro), se necesitan aproximadamente 6 GB de VRAM solo para los pesos. Con overhead de activaciones y KV cache, se recomiendan al menos 8-10 GB.
- GPU recomendadas: cualquier GPU con 10 GB o más de VRAM, como RTX 3080/3090, RTX 4080/4090, A10, A100, etc. Para análisis de múltiples checkpoints en paralelo, se requiere más memoria.
- Sí cabe en GPUs de consumo: una RTX 3090 o 4090 puede cargar un checkpoint individual sin problemas.
- Opciones de despliegue: al ser checkpoints en bf16, se pueden cargar con transformers de Hugging Face, vLLM (si se convierte a formato compatible), o llama.cpp (requiere conversión a GGUF). No se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se han medido para estos checkpoints; dependerá del hardware y del framework utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | Hugging Face |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Hugging Face |
| Qwen2.5 3B | 3B | 32K | Apache-2.0 | Hugging Face |
| Este repositorio (checkpoints RL) | 3B | 128K (heredado) | Apache-2.0 | Hugging Face |

El modelo base SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks estándar, según la documentación oficial. Sin embargo, este repositorio no contiene el modelo final sino checkpoints intermedios, por lo que no es directamente comparable en rendimiento. Su valor reside en el estudio del proceso de entrenamiento, no en el rendimiento final.

## Limitaciones y advertencias

- Checkpoints intermedios: no son modelos finales; pueden mostrar comportamientos inestables, alucinaciones frecuentes o degradación de capacidades en ciertos pasos.
- Sin documentación de entrenamiento: se desconoce el algoritmo RL, el dataset de recompensas, el número total de pasos y los hiperparámetros utilizados.
- Solo inferencia: no se incluyen estados de optimizador, por lo que no se puede reanudar el entrenamiento desde estos checkpoints sin información adicional.
- Tamaño del repositorio: 0.0 GB según Hugging Face, lo que sugiere que los archivos pueden estar en LFS y no se han descargado aún; verificar antes de usar.
- Sin garantías de calidad: al ser un repositorio personal sin respaldo institucional, no hay garantía de reproducibilidad ni de corrección de los checkpoints.
- Licencia Apache-2.0: permite uso comercial, pero al ser artefactos de investigación, se recomienda validar su comportamiento antes de cualquier uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-traj-189b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Modelo base SmolLM3-3B-Base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Documentación técnica de SmolLM3-3B (PDF): https://aial.ie/research/gpai-training-transparency/archive/SmolLM_33B_2025_11_12.pdf
