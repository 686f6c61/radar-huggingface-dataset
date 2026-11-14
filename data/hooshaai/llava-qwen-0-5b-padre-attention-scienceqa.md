# Hooshaai/llava-qwen-0.5b-padre-attention-scienceqa

## Resumen

`llava-qwen-0.5b-padre-attention-scienceqa` es un checkpoint multimodal de tipo vision-lenguaje publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. Se construye sobre `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM compacto que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas, y le aplica una intervención quirúrgica de atención: sustituye la softmax por PADReAttention (Polynomial Attention with Dropout Regularization), un kernel polinómico centrado y numéricamente estable de la familia sparse. La intervención afecta a 18 de las 24 capas del decodificador en un patrón híbrido 3:1, manteniendo seis capas ancla con atención cuadrática estándar.

El modelo está afinado y destilado específicamente sobre el subconjunto con imagen del dataset ScienceQA (validación), orientado a razonamiento visual de tipo STEM. El autor declara una accuracy del 65,62 % y una perplejidad de 2,16, con una mejora de +22,50 puntos porcentuales respecto al estado zero-shot previo a la destilación (43,12 %) y superando ligeramente la línea base del profesor (63,75 %). El artefacto serializado ocupa 259,12 MB en FP16, un 84,8 % menos que el modelo base completo (1,66 GB), porque solo se guardan los pesos quirúrgicos de atención y los layernorms entrenados.

Su relevancia es doble: por un lado, demuestra que es posible alterar el mecanismo de atención de un VLM pequeño y recuperar (e incluso superar) el rendimiento del profesor mediante destilación; por otro, el formato de empaquetado modular permite distribuir deltas de atención de forma muy compacta. Es un modelo de investigación, no un producto listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con PADReAttention en 18/24 capas |
| Parametros totales | no disponible (el artefacto serializado contiene 498 tensores de atención y layernorms; el modelo base completo ronda los 0,5B según su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LLaVA-Qwen-0.5B en su variante interleaved: un codificador visual SigLIP congelado que produce embeddings de imagen, un proyector MLP de dos capas que los alinea con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. Sobre esta base, la "cirugía" de atención reemplaza la softmax por PADReAttention en 18 de las 24 capas siguiendo un esquema `hybrid_3_1`: tres capas con atención polinómica por cada capa ancla cuadrática. Las seis capas ancla son `[3, 7, 11, 15, 19, 23]`. PADReAttention usa un kernel polinómico centrado de la forma `(1 + S/order)^order`, lo que evita la exponenciación de la softmax y aporta estabilidad numérica, con un perfil disperso. Los componentes congelados y excluidos del artefacto son la torre visual SigLIP completa, el proyector multimodal, los MLP del decodificador, los embeddings y las seis capas ancla.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (sección §21.1), sobre una única NVIDIA GeForce RTX 3090 de 24 GB y con 0 MB de VRAM de profesor en GPU (el profesor se ejecuta en caché offline). Se ejecutaron 250 pasos de optimización en dos etapas (106 pasos en la etapa 1 y 144 en la etapa 2), con una duración total de 120,2 segundos y un pico de VRAM de 18.520 MB. El dataset de evaluación y ajuste es `derek-thomas/ScienceQA`, subconjunto con imagen, split de validación. Solo se entrenan y serializan los pesos de atención modificados y los layernorms del decodificador.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM: el modelo está ajustado sobre ScienceQA, por lo que su punto fuerte es el razonamiento sobre diagramas, gráficos e ilustraciones científicas.
- Razonamiento de opción múltiple sobre contexto visual: el formato ScienceQA incluye pregunta, imagen y opciones.
- Conversación multi-turno con plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imagen mediante el preprocesador SigLIP incluido en el repo.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso explícito: no disponible.
- Modo thinking, audio o vídeo: no disponible.

## Casos de uso

- Evaluación de técnicas de atención alternativa en VLMs pequeños: el checkpoint sirve como referencia reproducible para comparar PADReAttention frente a softmax estándar en la misma arquitectura y dataset, con métricas declaradas de accuracy y perplejidad.
- Investigación en destilación de conocimiento con recursos limitados: el flujo de NeuralOps con caché offline de representaciones permite reproducir el ajuste en una sola RTX 3090, lo que lo hace útil como caso de estudio de destilación eficiente en VRAM.
- Prototipado de asistentes educativos STEM: dado su ajuste sobre ScienceQA, puede emplearse para responder preguntas de ciencias de nivel escolar o secundaria a partir de una imagen, siempre con validación humana.
- Distribución de deltas de atención compactos: el artefacto de 259 MB (frente a 1,66 GB del base) facilita experimentar con variantes de atención en entornos con ancho de banda o almacenamiento limitados.
- Benchmark interno de robustez numérica: PADReAttention está diseñada para estabilidad numérica; el modelo puede usarse para medir cómo afecta la sustitución de softmax a la calidad de las respuestas en tareas visuales.
- Base para experimentos de "attention surgery" sobre otros datasets: el manifiesto quirúrgico (`surgical_manifest.json`) documenta la topología exacta de capas modificadas, lo que permite reutilizar el patrón `hybrid_3_1` en otros ajustes.
- Docencia y divulgación: ejemplo práctico de cómo se empaqueta y publica un checkpoint quirúrgico modular con metadatos de entrenamiento y auditoría de artefactos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 43,12 | 65,62 | +22,50 |
| Perplejidad (PPL) | 2,45 | 2,96 | 2,16 | -0,80 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La comparación con el profesor se refiere a la línea base previa a la cirugía sobre el mismo dataset, no a modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base completo en FP16 ronda los 1,66 GB de pesos; con el delta de atención serializado (259 MB) más la torre visual y el resto de componentes del base, el consumo total en FP16 debería situarse en el entorno de 2-3 GB, aunque el autor no publica una cifra de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; el autor entrenó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 18.520 MB durante la destilación.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: el repo usa la librería `neuralops` y la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI. Al ser un checkpoint quirúrgico parcial, no es cargable directamente con `transformers` sin aplicar el manifiesto sobre el modelo base.
- Latencia y throughput: no disponibles. Solo se publica telemetría de entrenamiento (120,2 s para 250 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-padre-attention-scienceqa | ~0,5B (base) | no disponible | 65,62 % accuracy / 2,16 PPL en ScienceQA (validación) | MIT | Hugging Face (neuralops) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | ~0,5B | no disponible | línea base del profesor: 63,75 % accuracy / 2,45 PPL en el mismo split | no disponible en la información | Hugging Face |
| Otros VLM de ~0,5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparación con alternativas como SmolVLM, Moondream u otros VLM pequeños; la única comparación documentada es contra el propio modelo base y su estado pre-destilación.

## Limitaciones y advertencias

- Modelo de investigación: el artefacto contiene solo los pesos de atención modificados y los layernorms; requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para reconstruirse. No es un checkpoint autónomo estándar.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre ScienceQA, hereda los sesgos de composición y dominio de ese dataset.
- Riesgo de alucinación: presente como en cualquier VLM de 0,5B; la evaluación se limita a un único dataset de validación y no se han publicado pruebas de robustez fuera de dominio.
- Limitaciones de idioma: solo inglés declarado; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base puede tener sus propias condiciones que conviene revisar por separado.
- Métricas no verificadas: los resultados del model-index tienen `verified: false`; provienen del autor y no han sido reproducidos de forma independiente.
- Dataset único: el ajuste y la evaluación se realizan sobre el mismo subconjunto de ScienceQA, lo que puede inflar el rendimiento relativo respecto a un uso generalista.
- Fecha de creación futura (2026-11-11) en los metadatos, lo que conviene tener en cuenta al evaluar la madurez y el soporte del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-padre-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de PADReAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/padre_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
