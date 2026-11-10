# shiffman/biscuit-smollm2-360m

## Resumen

Biscuit-smollm2-360m es un ajuste fino (fine-tune) del modelo SmolLM2-360M-Instruct de Hugging Face, publicado por el usuario shiffman bajo licencia Apache 2.0. Se distribuye en formato MLX, la libreria de Apple para ejecutar modelos de lenguaje de forma nativa en chips de la serie M (M1, M2, M3, M4), lo que lo orienta a inferencia local en equipos macOS. Con 361.822.080 parametros (aproximadamente 362 millones) y un tamano de repositorio de 0,7 GB, es un modelo pequeno pensado para tareas conversacionales ligeras y despliegue en hardware de consumo.

El modelo hereda la arquitectura y las capacidades de SmolLM2-360M-Instruct, un transformer decoder-only de la familia SmolLM2 entrenado por Hugging Face. Al ser un fine-tune sobre la variante Instruct, conserva el formato conversacional y la plantilla de chat del modelo original, pero la model card no documenta que datos especificos se usaron para el ajuste ni que comportamiento se pretende modificar respecto a la base.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica adicional en la model card. Resulta util como ejemplo de fine-tune comunitario en formato MLX para experimentation local en Apple Silicon, pero no hay evidencia publicada que respalde mejoras sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.822.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base SmolLM2-360M-Instruct soporta 8.192 tokens, segun la documentacion publica de Hugging Face) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo se distribuye en safetensors para MLX |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base SmolLM2-360M-Instruct: un transformer decoder-only con atencion causal estandar, disenado por Hugging Face para ser eficiente en dispositivos con recursos limitados. El modelo tiene 361.822.080 parametros y se distribuye en safetensors con pesos en formato MLX, lo que implica que las capas y tensores estan adaptados para la libreria `mlx` de Apple y no para `transformers` estandar, aunque los tags del repositorio incluyen tanto `mlx` como `transformers`.

No se dispone de informacion sobre el dataset de ajuste fino, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF, DPO o SFT. La model card del autor no incluye ninguna seccion de entrenamiento, hiperparametros ni procedimiento. Tampoco se documentan innovaciones tecnicas propias; el modelo se limita a heredar las caracteristicas del base, que incluye entrenamiento con datos multilingues (aunque el fine-tune declara solo ingles) y una ventana de contexto de 8.192 tokens en su version original.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Instruct base.
- Razonamiento basico y respuesta a instrucciones simples, limitado por el tamano de 362 millones de parametros.
- Generacion de codigo y matematicas a nivel basico; no hay evidencia publicada de rendimiento en estas tareas para este fine-tune concreto.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base SmolLM2-Instruct no lo declara de forma explicita.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local en macOS: el formato MLX permite ejecutar el modelo en un Mac con chip M1 o superior sin GPU dedicada, ideal para pruebas de concepto de asistentes conversacionales en ingles con latencia baja.
- Experimentacion con fine-tunes comunitarios: sirve como punto de partida para estudiar como un ajuste sobre SmolLM2-360M-Instruct modifica el comportamiento del base, comparando respuestas antes y despues del fine-tune.
- Generacion de texto asistida en aplicaciones de escritorio: integrable en apps nativas de macOS mediante la libreria `mlx` para autocompletado, resumenes cortos o respuestas a preguntas frecuentes, dado su bajo consumo de memoria (menos de 1 GB en pesos).
- Educacion e investigacion: modelo adecuado para ensenar tecnicas de fine-tuning y despliegue en Apple Silicon por su tamano reducido y su licencia permisiva Apache 2.0.
- Chatbots de dominio acotado: con un contexto de 8.192 tokens (heredado del base) puede gestionar conversaciones multi-turno breves en ingles para tareas de soporte simples, siempre que se valide su calidad frente al base.
- Pruebas de regresion de pipelines MLX: util como modelo de referencia ligero para validar flujos de inferencia en `mlx-lm` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y no hay datos que permitan comparar este fine-tune con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en pesos (0,7 GB de repositorio); en la practica, el modelo cabe en la memoria unificada de cualquier Mac con chip M1 o superior.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; tambien podria convertirse a GGUF para ejecutarse en GPUs consumer con llama.cpp, aunque no se distribuye en ese formato.
- Opciones de despliegue: `mlx-lm` (libreria nativa para MLX), y potencialmente `transformers` si se convierte el formato; no se distribuye en GGUF, por lo que Ollama y llama.cpp requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| shiffman/biscuit-smollm2-360m | 361.822.080 | no disponible (base: 8.192) | apache-2.0 | safetensors (MLX) | Hugging Face, 0 descargas |
| unsloth/SmolLM2-360M-Instruct (base) | 361.822.080 | 8.192 (segun doc. publica) | apache-2.0 | safetensors, GGUF | Hugging Face, ampliamente usado |
| HuggingFaceTB/SmolLM2-360M-Instruct (original) | 361.822.080 | 8.192 (segun doc. publica) | apache-2.0 | safetensors | Hugging Face, muy popular |

La comparativa se limita al modelo base y su variante de Unsloth, ya que no hay datos de rendimiento publicados para el fine-tune que permitan contrastarlo con alternativas de la misma categoria. La principal diferencia es el formato MLX y el ajuste fino, cuyo efecto sobre la calidad no esta documentado.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia de que el fine-tune mejore al modelo base; podria degradar capacidades si el ajuste fue agresivo o con datos de baja calidad.
- Sesgos conocidos: no documentados; al heredar de SmolLM2, es probable que arrastre sesgos del corpus de entrenamiento original, pero no hay analisis publicado.
- Riesgo de alucinacion: alto, como en cualquier modelo de 362 millones de parametros; no se recomienda para tareas que requieran precision factual sin verificacion.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base y de los datos de ajuste, no documentados.
- Caveat de produccion: con cero descargas y sin documentacion de entrenamiento, no es un modelo recomendable para produccion sin una evaluacion exhaustiva previa; el formato MLX limita su uso fuera de Apple Silicon.
- Contexto: aunque el base soporta 8.192 tokens, no se confirma que el fine-tune conserve esa ventana ni que la plantilla de chat sea la correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiffman/biscuit-smollm2-360m
- Modelo base (Unsloth): https://huggingface.co/unsloth/SmolLM2-360M-Instruct
- Modelo original de Hugging Face: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm (inferencia LLM en MLX): https://github.com/ml-explore/mlx-examples/tree/main/llms
