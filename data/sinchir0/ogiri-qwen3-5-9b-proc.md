# sinchir0/ogiri-qwen3.5-9b-proc

## Resumen

`ogiri-qwen3.5-9b-proc` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.5-9B` especializado en *oogiri* (大喜利), el formato de humor japonés en el que se responde de forma ingeniosa a una consigna dada. Lo publica el usuario `sinchir0` bajo la librería PEFT y está diseñado para resolver un problema concreto: generar respuestas humorísticas a partir de tres modalidades de entrada (solo texto, solo imagen o imagen más texto) con un único modelo, algo que los LLM generalistas no cubren bien en japonés.

El adaptador se entrena en dos fases: un SFT con 7.251 respuestas valoradas positivamente por humanos (4.081 de texto y 3.170 de imagen), a las que se añade un razonamiento de cinco líneas generado por el propio modelo base, y un DPO posterior con 230 pares seleccionados por anotadores humanos. El resultado es un modelo que produce un bloque `<think>` con una heurística de cinco pasos (tópico común, bisagra, mundo lejano, colisión y lógica, concreción) antes de emitir la respuesta final.

El modelo es relevante por su enfoque híbrido multimodal dentro de un único adaptador y por documentar explícitamente sus límites: el autor reconoce que no hay evidencia significativa de que el DPO supere al SFT. Su licencia `other` y la procedencia discutida de los datos de entrenamiento lo convierten en una pieza de investigación más que en un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `Qwen/Qwen3.5-9B` |
| Parametros totales | no disponible (adaptador LoRA; el base es 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16; el base admite las cuantizaciones habituales) |
| Idiomas soportados | japones (principal); no se documentan otros |
| Licencia | other (uso de investigacion; derechos de datos no aclarados) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-9B`, un transformer decoder-only de 9.000 millones de parámetros. El LoRA se entrena con rango r=32 en bf16 durante una época sobre 7.251 ejemplos de respuesta humana de alta calidad, extraídos de `iammytoo/japanese-humor-evaluation-v2` (4.081 de texto) y `zhongshsh/CLoT-Oogiri-GO` (3.170 de imagen). A cada respuesta se le adjunta un razonamiento de cinco líneas que el propio modelo base reconstruye a partir de la respuesta, de modo que el adaptador aprende a producir ese `<think>` antes de la respuesta final.

La segunda fase aplica DPO con β=0.1 sobre 230 pares elegidos por humanos entre cuatro propuestas del modelo SFT, comparando el par completo (pensamiento más respuesta) e incluyendo casos con imagen. El autor advierte que no hay evidencia significativa de mejora del DPO sobre el SFT (61-67 % en 33 pares de validación, sin significación estadística) y que existe sobreajuste a los datos de entrenamiento; por eso publica ambos adaptadores (raíz para el DPO y `sft_proc/` para el SFT). El diseño del prompt de sistema se inspira en la teoría de la incongruencia de Suls (1972), la Script Opposition de Attardo y Raskin (1991) y la Benign Violation Theory de McGraw y Warren (2010), sin replicar literalmente ninguno de esos métodos.

## Capacidades

- Generación de respuestas de *oogiri* a consignas de texto, imagen o imagen más texto con un único adaptador.
- Razonamiento estructurado en un bloque `<think>` con cinco pasos (tópico común, bisagra, mundo lejano, colisión y lógica, concreción).
- Procesamiento multimodal de imagen única por prompt (el ejemplo de vLLM limita `image` a 1).
- Generación de múltiples candidatos (n=4 en el ejemplo) para selección posterior.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá del `<think>` interno.
- Capacidad multilingüe limitada al japonés en la práctica; no se declaran otros idiomas en la model card.

## Casos de uso

- Generación de contenido humorístico para programas o webs de *oogiri*: el adaptador recibe una consigna en japonés y devuelve varias respuestas candidatas con `n=4`, que un editor humano selecciona; el `<think>` permite auditar el razonamiento.
- Investigación en generación de humor computacional: sirve como sistema de referencia para comparar SFT frente a DPO en una tarea creativa con anotación humana, dado que el autor publica ambos adaptadores.
- Moderación y filtrado de contenido: no es su función principal, pero puede emplearse para clasificar respuestas por su estructura de incongruencia antes de publicarlas.
- Prototipado de asistentes conversacionales en japonés con tono humorístico: el adaptador puede montarse sobre el base en un servicio de chat para respuestas breves e ingeniosas.
- Evaluación de modelos multimodales en tareas creativas: el par imagen-consigna permite probar la capacidad de describir y reinterpretar una imagen en clave de humor.
- Docencia y divulgación sobre teoría del humor: el prompt de sistema documenta explícitamente las teorías de las que deriva cada paso, útil para explicar la relación entre teoría y generación.
- Benchmarking interno de adaptadores LoRA multimodales: el repositorio incluye el adaptador SFT y el DPO, lo que permite medir el efecto del DPO en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una validación interna de 33 pares en la que el DPO acierta entre el 61 % y el 67 % frente al SFT, sin diferencia estadísticamente significativa respecto al azar y con sobreajuste a los datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la cuantización del modelo base de 9B (orientativamente 18-20 GB en bf16 y 6-8 GB en cuantización de 4 bits, aunque el autor no lo especifica).
- GPU recomendadas: no disponible; el ejemplo de la model card usa vLLM con `enable_lora=True` y `max_lora_rank=64`, sin indicar GPU concreta.
- Compatibilidad con GPU de consumo: no confirmada por el autor; un base de 9B en 4 bits podría caber en GPUs de 8-12 GB, pero no hay dato oficial.
- Opciones de despliegue: vLLM con soporte LoRA (`LoRARequest`); no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para *oogiri* multimodal en japonés) ni datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor no encuentra evidencia de que el DPO supere al SFT; el adaptador raíz puede no ser mejor que `sft_proc/` y presenta sobreajuste a los datos de entrenamiento.
- La licencia `other` no garantiza la legalidad del uso: los datos de texto provienen de sitios de *oogiri* (Bokete, ケータイ大喜利) sin permiso explícito de los titulares, y los de imagen de Bokete con derechos no aclarados.
- El uso comercial no está autorizado de forma explícita; el autor recomienda verificar los derechos de los datos originales antes de integrar o redistribuir el adaptador.
- Riesgo de reproducción de respuestas del conjunto de entrenamiento: el autor no descarta que las salidas coincidan o se parezcan a respuestas originales.
- No hay filtrado de contenido inapropiado (discriminación, agresividad); las salidas pueden ser ofensivas.
- El soporte multilingüe no está documentado; el modelo está pensado para japonés y su rendimiento en otros idiomas es desconocido.
- La longitud de contexto efectiva no se declara y depende del modelo base.
- El soporte multimodal se limita a una imagen por prompt en el ejemplo de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinchir0/ogiri-qwen3.5-9b-proc
- Documentación de entrenamiento y limitaciones: https://github.com/sinchir0/ogiri-llm/blob/main/docs/TRAINING.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de texto: https://huggingface.co/datasets/iammytoo/japanese-humor-evaluation-v2
- Dataset de imagen: https://huggingface.co/datasets/zhongshsh/CLoT-Oogiri-GO
- Paper CLoT / Oogiri-GO: https://arxiv.org/abs/2312.02439
- Paper HumorGen: https://arxiv.org/abs/2604.09629
- Paper RAGthoven (SemEval-2026 Task 1): https://arxiv.org/pdf/2607.13189
- SemEval 2026 Task 1 (MWAHAHA): https://www.aclweb.org/portal/node/14303
- Benign Violations (McGraw & Warren, 2010): https://leeds-faculty.colorado.edu/mcgrawp/pdf/mcgraw.warren.2010.pdf
