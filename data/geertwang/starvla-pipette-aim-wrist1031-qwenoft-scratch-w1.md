# GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch-w1

## Resumen

starVLA QwenOFT + wrist es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario GeertWang en HuggingFace. Se trata de un checkpoint de behavior cloning entrenado para ejecutar el paso 3 de una tarea de pipeteo con un robot humanoide Unitree G1 equipado con manos Inspire: el objetivo es introducir la pipeta que sostiene la mano derecha en el tubo que sostiene la mano izquierda. El modelo parte de Qwen3-VL-4B-Instruct como backbone y añade una cabeza OFT (optimal transport / flow matching, según la librería starVLA) entrenada desde cero.

El modelo es relevante como ejemplo de adaptación de un VLM generalista de 4B parámetros a control robótico de precisión mediante imitación, con datos recogidos por HG-DAgger (intervención humana sobre políticas autónomas) y sin refuerzo. Su interés práctico es acotado: es un checkpoint de investigación de una tarea concreta, sin licencia declarada, sin resultados en robot real y con métricas únicamente offline.

No se dispone de información sobre licencia, idiomas soportados ni formato de pesos más allá de un fichero PyTorch (`.pt`). El repositorio ocupa 9,1 GB, coherente con un backbone de 4B parámetros en precisión de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen3-VL-4B-Instruct + cabeza OFT (librería starVLA) |
| Parámetros totales | no disponible (backbone de 4B + cabeza; total no declarado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), checkpoint `qwenoft/checkpoints/steps_5382_pytorch_model.pt` |

## Arquitectura y entrenamiento

El modelo combina un VLM preentrenado (Qwen3-VL-4B-Instruct) con una cabeza OFT inicializada desde cero. Todas las partes son entrenables (no hay congelación de parámetros). La entrada multimodal incluye tres vistas de cámara (ego, FOCUS y wrist_left) más la velocidad medida de la muñeca como estado, y la salida es una acción motora. La pérdida es L1 con pesos por fotograma (1 para datos autónomos, 1 para datos humanos, 0 para fotogramas enmascarados), sin RL ni preferencias.

Los datos provienen de HG-DAgger: 230 episodios de entrenamiento y 38 de validación (114.830 anclas de entrenamiento), recogidos sin teleoperación y truncados antes del "pull-out" de la pipeta, de modo que el modelo no ha visto esa fase. La receta es batch 128, learning rate 1e-5 para el VLM, 1e-4 para la cabeza y 2,5e-5 para el resto, con decaimiento coseno hasta 1e-6 y 10 épocas. El checkpoint seleccionado corresponde al paso 5382 y fue elegido sobre el mismo holdout con el que se evalúa, por lo que las métricas están ligeramente sesgadas al alza.

## Capacidades

- Generación de acciones de control robótico a partir de imágenes multicámara y estado proprioceptivo (velocidad de muñeca).
- Percepción visual de escena y de objetos manipulados (pipeta, tubo) mediante el backbone Qwen3-VL.
- Ejecución de una tarea de precisión de inserción (alinear la pipeta de la mano derecha con el tubo de la mano izquierda).
- Entrenamiento por imitación con datos mixtos autónomos y humanos (HG-DAgger).
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe ni modo de pensamiento explícito.

## Casos de uso

- Investigación en behavior cloning sobre humanoides: sirve como referencia reproducible de cómo adaptar un VLM de 4B a control de brazos con datos de intervención humana, útil para comparar recetas de entrenamiento.
- Estudio de HG-DAgger en tareas de precisión: el modelo permite analizar cómo influye la mezcla de fotogramas autónomos y humanos en la pérdida L1 ponderada.
- Benchmark offline de políticas VLA: sus puntuaciones L1 sobre 480 muestras retenidas permiten comparar arquitecturas de cabeza (OFT frente a otras) en la misma tarea de pipeteo.
- Base para fine-tuning en tareas de laboratorio: partiendo de Qwen3-VL-4B y sustituyendo el conjunto de datos, puede reutilizarse la receta para otras manipulaciones con el Unitree G1.
- Evaluación de representaciones multimodales en robótica: el uso de tres vistas (ego, FOCUS, wrist) permite estudiar qué aporta cada cámara a la predicción de acciones.
- Docencia y prototipado en robótica de manipulación: como checkpoint abierto (aunque sin licencia declarada), sirve para ilustrar el pipeline completo de datos, entrenamiento y validación offline antes de un despliegue real.

## Benchmarks y rendimiento

Métricas offline declaradas por el autor (pérdida L1 sobre 480 muestras retenidas, menor es mejor):

| Conjunto | Este checkpoint | Referencia "hold still" |
|---|---|---|
| 38 episodios completos | 0,0221 | 0,0149 |
| Fotogramas humanos | 0,0369 | no disponible |
| Fotogramas autónomos | 0,0119 | no disponible |
| 12 episodios más tempranos | 0,0427 | 0,0278 |
| 12 episodios más tardíos | 0,0156 | 0,0089 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El propio autor advierte que estas puntuaciones son solo offline, que el modelo no se ha ejecutado en un robot y que la selección del checkpoint sobre el mismo holdout las hace ligeramente optimistas. Nótese que la línea base "hold still" obtiene mejor pérdida L1 que el modelo en todos los conjuntos reportados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un backbone de 4B parámetros en FP16 requiere del orden de 8-9 GB solo para pesos, más activaciones y la cabeza OFT.
- GPU recomendadas: no declaradas por el autor; por tamaño, una GPU con 24 GB (RTX 4090, A10G, L4) sería el mínimo razonable en FP16, y A100/H100 para entrenamiento o lotes grandes.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) en FP16; en GPUs de 12-16 GB requeriría cuantización, no documentada.
- Opciones de despliegue: la librería indicada es `starvla`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además no aplican directamente a un modelo de acciones.
- Latencia y throughput: no disponibles. El autor señala que `config.yaml` contiene rutas del nodo de entrenamiento (`base_vlm` / tokenizer) que deben redirigirse a copias locales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starVLA QwenOFT + wrist (este) | 4B (backbone) + cabeza | no disponible | Pipeteo paso 3, Unitree G1 | no disponible | HuggingFace, 0 descargas |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible en esta ficha | VLM generalista | no disponible en esta ficha | Público |
| Otras políticas VLA de la familia starVLA | no disponible | no disponible | Manipulación robótica | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría; la única referencia cuantitativa es la línea base "hold still" incluida por el autor.

## Limitaciones y advertencias

- El modelo no se ha ejecutado en un robot real; todas las métricas son offline y no garantizan comportamiento físico correcto.
- El checkpoint fue seleccionado sobre el mismo holdout con el que se evalúa, lo que infla ligeramente los resultados.
- La línea base "hold still" supera al modelo en pérdida L1 en todos los conjuntos reportados, lo que sugiere un ajuste débil de la política.
- Entrenado únicamente para el paso 3 de una tarea concreta (pipeteo) y sin ver la fase de "pull-out"; no generaliza a otras tareas sin reentrenamiento.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución.
- Sin información sobre sesgos, idiomas, robustez ante cambios de iluminación o variaciones de objetos.
- `config.yaml` apunta a rutas del nodo de entrenamiento; requiere ajuste manual para su uso local.
- Riesgo de alucinación visual y de acciones erráticas fuera de la distribución de entrenamiento, habitual en políticas de imitación con datos limitados (230 episodios).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch-w1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
