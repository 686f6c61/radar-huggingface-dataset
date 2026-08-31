# johnhalloran/goramen-blog-gemma-4-sft

## Resumen

`johnhalloran/goramen-blog-gemma-4-sft` es un fine-tune QLoRA del modelo base `mlx-community/gemma-4-e4b-it-4bit` (conversión MLX de `google/gemma-4-E4B-it`) realizado por el autor John Halloran. El objetivo es especializar el modelo en la redacción de reseñas de ramen con el estilo y la voz del blog *Go Ramen*: a partir de un título y unas etiquetas, genera un post completo en el tono casual y entusiasta del autor original. Se trata de un modelo de 1,17 mil millones de parámetros, solo texto, con pesos en 4 bits y un tamaño de repositorio de 4,2 GB.

Este fine-tune resuelve un problema práctico de generación de contenido editorial: automatizar la producción de reseñas gastronómicas con una voz consistente y reconocible. Su relevancia radica en demostrar cómo un ajuste ligero sobre un modelo base abierto puede transferir eficazmente un estilo de escritura específico, aunque con limitaciones claras de generalización y veracidad. La arquitectura subyacente es un transformer decoder (Gemma 4) con 42 capas, y el contexto de entrenamiento se fijó en 1024 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (solo texto, sin torres de visión/audio) |
| Parametros totales | 1.166.568.490 (1,17B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con máximo de 1024 tokens) |
| Tipos de cuantizacion | 4-bit (affine, group size 64) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/gemma-4-e4b-it-4bit`, una conversión MLX del modelo multimodal Gemma 4 E4B de Google DeepMind. En este fine-tune solo se instancia el decoder de texto (`language_model`); las torres de visión y audio del base no se cargan, por lo que el checkpoint resultante es exclusivamente textual. Sobre los pesos congelados y cuantizados en 4-bit se entrenaron adaptadores LoRA (rank 32, alpha 64, scale 2.0, dropout 0.05) en las 42 capas del decoder, con un total de 77,3 millones de parámetros entrenables (1,04% del total). El entrenamiento usó QLoRA con el framework `mlx_lm.lora` en Apple Silicon, con optimizador AdamW, decaimiento de pesos 0.01, programación de tasa de aprendizaje con coseno (pico 1e-4) y warmup lineal de 30 pasos. Se empleó un tamaño de lote efectivo de 8 (batch 1, grad accum 8), 3 épocas sobre 1.567 ejemplos de entrenamiento, y una longitud máxima de secuencia de 1024 tokens. El dataset `johnhalloran/goramen-blog` contiene 1.841 posts del blog, divididos en 1.567 de entrenamiento, 100 de validación y 100 de test. Solo se entrenó sobre el texto de las respuestas (máscara en los tokens del prompt). El checkpoint subido corresponde a la iteración 1410 (30% del entrenamiento), que mostró mejor pérdida de validación y test, evitando el sobreajuste observado en la iteración final.

## Capacidades

- Generación de texto en inglés con un estilo específico: reseñas de ramen con tono casual, entusiasta y coloquial, imitando la voz del blog *Go Ramen*.
- Sigue instrucciones en formato chat: dado un título y etiquetas (por ejemplo, "Afuri - Portland, OR" y "OR-Portland"), produce un post coherente y estructurado.
- Mantiene una estructura típica de blog gastronómico: introducción, descripción del plato, opinión personal y conclusión.
- Capacidad limitada de generalización: funciona bien dentro del dominio de reseñas de ramen, pero no para otros temas o estilos.
- No dispone de tool calling, ni capacidades multimodales (visión/audio), ni razonamiento multi-paso avanzado.

## Casos de uso

- Generación automatizada de contenido para blogs gastronómicos: el modelo puede producir borradores de reseñas de restaurantes de ramen a partir de títulos y etiquetas, reduciendo el tiempo de redacción.
- Creación de plantillas editoriales: permite generar múltiples variaciones de un mismo post para pruebas A/B de tono o estructura.
- Asistente para críticos gastronómicos: un redactor puede usar el modelo como punto de partida y luego editar o verificar los datos factuales.
- Generación de contenido de relleno para sitios web de comida: útil para completar secciones de reseñas de usuarios con un estilo consistente, aunque con la advertencia de que no hay verificación de hechos.
- Entrenamiento de otros modelos: el dataset y el fine-tune pueden servir como ejemplo de transferencia de estilo para experimentos de adaptación de dominio.
- Demo de fine-tuning con QLoRA en MLX: sirve como caso práctico para desarrolladores interesados en ajustar modelos grandes en hardware Apple Silicon con bajo consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este fine-tune. La evaluación disponible se centra en la pérdida y perplejidad sobre el split de test (100 posts no vistos):

| Checkpoint | Pérdida de test | Perplejidad de test |
|---|---|---|
| iter 1410 (subido) | 3.175 | 23.9 |
| iter 4696 (final) | 3.434 | 31.0 |

Estos datos indican que el checkpoint seleccionado generaliza mejor que el final, pero no permiten comparar con otros modelos en tareas generales.

## Requisitos de hardware

- Inferencia en Apple Silicon: el modelo está optimizado para MLX y requiere una Mac con chip M1 o superior.
- Memoria: el repo ocupa 4,2 GB, y el entrenamiento usó ~9,5 GB de memoria unificada; para inferencia se estima un uso similar o inferior, por lo que cabe en Macs con 8 GB de RAM unificada o más.
- GPU recomendadas: no aplica (específico de Apple Silicon). No hay indicaciones para GPUs NVIDIA/AMD.
- Opciones de despliegue: mediante `mlx_lm` (Python) o la CLI `python -m mlx_lm generate`. También es posible convertir los pesos a GGUF para usar con llama.cpp u Ollama, aunque no está documentado en la model card.
- Latencia y throughput: no especificados, pero al ser un modelo de 1,17B en 4-bit, la generación es rápida en hardware Apple Silicon.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros fine-tunes de estilo o modelos de generación de blogs. La única referencia directa es el modelo base `mlx-community/gemma-4-e4b-it-4bit`, del cual este es una especialización. Comparado con el base:

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `goramen-blog-gemma-4-sft` | 1,17B (4-bit) | No disponible | Gemma | Generación de reseñas de ramen en estilo blog |
| `mlx-community/gemma-4-e4b-it-4bit` (base) | ~4B (estimado) | No disponible | Gemma | Modelo general de chat (multimodal en su versión original) |

No hay datos de rendimiento comparativo entre ambos en tareas estándar.

## Limitaciones y advertencias

- El modelo transfiere estilo, no verifica hechos: las reseñas generadas pueden contener información inventada sobre restaurantes o platos.
- Conjunto de entrenamiento pequeño (1.567 ejemplos), lo que provoca cierto sobreajuste y memorización de frases de los posts originales.
- Solo funciona en inglés y está limitado a la voz del blog *Go Ramen*; no generaliza a otros estilos de escritura ni a otros temas.
- Al ser un fine-tune sobre un modelo base multimodal, pierde las capacidades de visión y audio; no procesa imágenes ni sonido.
- La licencia Gemma restringe el uso comercial según los términos de Google; además, el contenido de entrenamiento pertenece al autor del blog, y el dataset no concede derechos de reutilización del texto original.
- No se han evaluado sesgos ni riesgos de alucinación específicos, pero al ser un modelo de generación de texto, puede producir contenido plausible pero falso.

## Enlaces

- Modelo en HuggingFace: [johnhalloran/goramen-blog-gemma-4-sft](https://huggingface.co/johnhalloran/goramen-blog-gemma-4-sft)
- Dataset de entrenamiento: [johnhalloran/goramen-blog](https://huggingface.co/datasets/johnhalloran/goramen-blog)
- Modelo base (MLX): [mlx-community/gemma-4-e4b-it-4bit](https://huggingface.co/mlx-community/gemma-4-e4b-it-4bit)
- Modelo base original (Google): [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- Blog Go Ramen: [http://www.goramen.com](http://www.goramen.com)
- Framework MLX-LM: [https://github.com/ml-explore/mlx-lm](https://github.com/ml-explore/mlx-lm)
- Información general de Gemma 4: [Google DeepMind](https://deepmind.google/models/gemma/gemma-4/) y [Blog de Google](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
