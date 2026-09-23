# RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e

## Resumen

Qwen3.8-9B-Distill-MLX-oQ4e es una version cuantizada de forma nativa para MLX del modelo destilado Qwen3.8-9B-Distill (base de empero-ai). El autor de la conversion es RolanDorisTech, que aplico su metodo propio de cuantizacion mixta denominado oQe (oMLX Universal Dynamic Quantization) sobre el master BF16 en MLX. El resultado es un repositorio de 4,9 GB que mantiene el formato estandar de safetensors de mlx-lm, por lo que es consumible directamente desde mlx-lm, oMLX, LM Studio y mlx-swift sin conversion adicional.

El problema que resuelve es el de ejecutar un modelo de razonamiento de clase 9B en hardware Apple Silicon con un presupuesto de memoria muy contenido: la medicion publicada por el autor en un M1 Max de 64 GB da un pico de 5,471 GB y 43,0 tok/s de generacion. La relevancia esta en que se trata de cuantizacion mixta guiada por datos (sensibilidad por capa mas importancia de activaciones tipo imatrix), que segun el autor rinde mejor que una cuantizacion plana de 4 bits g32 o 8 bits g64 a igualdad de espacio.

La model card no documenta arquitectura, numero exacto de parametros, longitud de contexto ni idiomas soportados; solo indica que es un modelo destilado de razonamiento, text-only, con plantilla de chat de Qwen3 y etiquetas `<think>`. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (inferido de `base_model` y de las etiquetas `qwen3`; la model card no describe la arquitectura) |
| Parametros totales | ~9B nominales, segun la denominacion del repositorio; no se publica el recuento exacto |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ4e en este repositorio; la familia incluye oQ4e, oQ5e, oQ6e y oQ8e. Efectivo aproximado de 4,7 a 8,5 bpw a 4,9 GB (referencia: 4 bits g32 plano = 5,003 bpw; 8 bits g64 plano = 8,502 bpw) |
| Idiomas soportados | No disponible (la model card solo indica "Text-only") |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors MLX nativo (estandar mlx-lm); incluye `chat_template.jinja` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base. La model card identifica el origen como `empero-ai/Qwen3.8-Distill` (mencionado tambien como `empero-ai/Qwen3.8-9B-Distill-GGUF` en los creditos) y etiqueta el resultado como `distill` y `reasoning`, es decir, se trata de un modelo destilado orientado a razonamiento con etiquetas `<think>`. No se detallan volumen de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO.

Lo especifico de este repositorio es el proceso de cuantizacion, no el entrenamiento. El autor describe oQ como una cuantizacion de precision mixta guiada por datos que mide la sensibilidad real de cada capa y asigna bits donde el error penaliza mas; oQe anade importancia de activaciones tipo imatrix para ponderar la cuantizacion y reducir el error en canales relevantes. La receta declarada incluye: oQe activado, reutilizacion de cache activada, cache automatica, modo estricto desactivado, preservacion de MTP desactivada, bfloat16 para normas y escalas, `lm_head` a 8 bits y capas de embedding y capas tempranas/tardias reforzadas por calidad. El modelo se genero en un M1 Max Mac Studio de 64 GB (GPU de 32 nucleos, macOS 27.0) con la herramienta oMLX Quantization panel, en 7 minutos y 23 segundos.

## Capacidades

- Generacion de texto y razonamiento paso a paso: la model card confirma el uso de la plantilla de chat de Qwen3 con etiquetas `<think>` y una prueba de razonamiento aritmetico resuelta correctamente.
- Razonamiento matematico basico: en la prueba publicada ("si 2x + 3 = 11, cuanto vale x", con razonamiento paso a paso) el resultado fue correcto, x=4.
- Inferencia local en Apple Silicon: disenado para MLX, con pesos en safetensors estandar de mlx-lm.
- Integracion con herramientas del ecosistema MLX: mlx-lm, oMLX, LM Studio y mlx-swift, segun la propia model card.
- Modelo destilado de razonamiento: la etiqueta `distill` y la ausencia de benchmarks sugieren un uso orientado a tareas de razonamiento mas que a conocimiento enciclopedico.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; no se documenta ningun modo agente.
- Capacidades multilingues: no disponible; la model card solo declara "Text-only".
- Capacidades especiales (vision, audio, thinking mode explicito): solo texto; el razonamiento se expresa mediante etiquetas `<think>` en la plantilla de chat.

## Casos de uso

- Razonamiento asistido totalmente local en portatiles Apple Silicon: con 4,9 GB de pesos y un pico medido de 5,471 GB, el modelo cabe en equipos con 16 GB de memoria unificada, lo que permite resolver problemas de logica o matematicas paso a paso sin conexion ni envio de datos a terceros.
- Asistente privado para documentos sensibles: al ejecutarse en local con MLX, se puede usar para resumir y reformular texto confidencial (informes medicos, contratos) sin exponer el contenido a APIs externas. La limitacion de contexto, no publicada, obliga a trocear los documentos.
- Tutoria educativa con traza de razonamiento: la plantilla con `<think>` permite mostrar al estudiante el razonamiento intermedio y no solo la respuesta final, util en herramientas de aprendizaje de matematicas o fisica de nivel secundario.
- Prototipado rapido de aplicaciones de IA generativa en macOS: descarga directa desde LM Studio y ejecucion con `mlx_lm.generate` permiten tener un banco de pruebas funcional en minutos sin infraestructura de GPU.
- Aplicaciones nativas Apple con mlx-swift: al ser safetensors MLX estandar, se puede embeder en apps de macOS o iOS que usen mlx-swift para funciones de asistencia textual offline.
- Investigacion en tecnicas de cuantizacion: el repositorio publica la receta completa (oQe, imatrix, bits protegidos) y los tiempos de cuantizacion por tamano, lo que lo convierte en una referencia reproducible para comparar cuantizacion mixta frente a g32/g64 planos.
- Evaluacion comparativa de presupuestos de memoria: la familia incluye las variantes oQ4e, oQ5e, oQ6e y oQ8e del mismo modelo, lo que permite medir el compromiso entre calidad y consumo (de 4,9 GB a 8,9 GB) en el mismo hardware.
- Generacion de codigo asistida en local: solo si se valida previamente, ya que no se han publicado resultados de HumanEval ni de otros benchmarks de codigo para este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son mediciones de inferencia del autor sobre un M1 Max de 64 GB (32 nucleos de GPU, macOS 27.0) con un prompt de prueba de aritmetica ("Q: If 2x + 3 = 11, what is x? Think step by step inside tags."), cuyo resultado fue correcto (x=4).

| Variante | Tamano de pesos | Prompt (tok/s) | Generacion (tok/s) | Pico de memoria |
|---|---|---|---|---|
| 9B oQ4e (este repositorio) | 4,9 GB | 101,5 | 43,0 | 5,471 GB |
| 9B oQ5e | 6,0 GB | 91,3 | 37,1 | 6,555 GB |
| 9B oQ6e | 7,0 GB | 84,3 | 33,3 | 7,664 GB |
| 9B oQ8e | 8,9 GB | 91,8 | 28,7 | 9,679 GB |
| 4B oQ4e | 2,3 GB | 133,7 | 65,4 | 2,684 GB |
| 4B oQ8e | 4,2 GB | 130,9 | 48,4 | 4,651 GB |
| 2B oQ4e | 1,1 GB | 267,7 | 118,6 | 1,241 GB |
| 2B oQ8e | 1,9 GB | 122,2 | 97,5 | 2,131 GB |

Las cifras corresponden a una ejecucion con 37 tokens de prompt y 82 tokens generados (medida del repositorio oQ4e); el autor no especifica la longitud exacta de prompt y generacion para el resto de variantes de la tabla.

## Requisitos de hardware

- VRAM/memoria unificada: pico medido de 5,471 GB con un prompt de 37 tokens y 82 tokens generados. El consumo crecera con la longitud de contexto y el tamano de lote; no se publican mediciones para contextos largos, por lo que cualquier cifra superior es una estimacion.
- GPU compatibles: exclusivamente Apple Silicon (MLX). La model card reporta el build en un M1 Max Mac Studio de 64 GB con GPU de 32 nucleos. No hay soporte CUDA, por lo que no aplica a A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y memoria unificada suficiente; con 5,471 GB de pico medido, un equipo de 16 GB es suficiente para prompts cortos, y 32 GB o mas da margen para contextos largos.
- Opciones de despliegue: mlx-lm (`pip install mlx-lm` y `mlx_lm.generate`), oMLX, LM Studio (buscando `RolanDorisTech/Qwen3.8-9B-Distill-oQ4e-MLX`) y mlx-swift. No se declara compatibilidad con vLLM, TGI, llama.cpp ni Ollama, ya que el repositorio esta en safetensors MLX y no en GGUF.
- Parametros de generacion sugeridos por el autor: `--temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: 101,5 tok/s de procesamiento de prompt y 43,0 tok/s de generacion en M1 Max (32 nucleos de GPU), con 37 tokens de prompt. El throughput escala de forma aproximadamente inversa al tamano de la variante dentro de la misma familia.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion posible es dentro de la propia familia de cuantizaciones del mismo modelo base, todas construidas el 23 de septiembre de 2026:

| Variante | Tamano | Generacion (tok/s) | Pico de memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 9B oQ4e (este) | 4,9 GB | 43,0 | 5,471 GB | apache-2.0 | HuggingFace |
| 9B oQ5e | 6,0 GB | 37,1 | 6,555 GB | apache-2.0 | HuggingFace |
| 9B oQ6e | 7,0 GB | 33,3 | 7,664 GB | apache-2.0 | HuggingFace |
| 9B oQ8e | 8,9 GB | 28,7 | 9,679 GB | apache-2.0 | HuggingFace |
| Base BF16 MLX master | No disponible | No medido en la model card | No disponible | apache-2.0 | Repositorio base de empero-ai |

El autor indica que oQ4e es mas preciso que una cuantizacion plana de 4 bits g32 (5,003 bpw) y que oQ8e lo es frente a 8 bits g64 (8,502 bpw), pero no aporta metricas de calidad (perplejidad, exactitud en tareas) que respalden esa afirmacion. La comparacion con modelos de otras familias (por ejemplo, otras alternativas de ~8-9B en MLX) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo destilado de razonamiento: la propia model card advierte de que puede alucinar.
- Cuantizacion con perdida: el autor reconoce que la salida es "lossy" respecto al BF16, aunque afirma que es mas precisa que g32/g64 planos; no se aportan metricas objetivas de esa perdida.
- Solo texto: no hay soporte de vision ni de audio.
- Idiomas: no declarados; no se puede asumir cobertura multilingue.
- Longitud de contexto: no publicada, lo que impide planificar casos de uso con documentos largos.
- Soporte de tool calling y de agentes: no documentado; no conviene asumirlo en produccion.
- Restricciones de licencia: apache-2.0 en este repositorio y en el modelo base, lo que permite uso comercial; conviene verificar la licencia del modelo base original de empero-ai antes de un despliegue comercial.
- Dependencia de plataforma: requiere Apple Silicon y el ecosistema MLX; no hay ruta directa a vLLM, TGI, llama.cpp ni Ollama sin conversion previa.
- Consumo con contexto largo: las mediciones de memoria (5,471 GB) corresponden a un prompt de 37 tokens; no hay datos para ventanas mayores.
- Inconsistencias en la model card: el comando de ejemplo apunta a un repositorio distinto (`...-oQ4e-MLX-oQ8e`) y la lista de la familia contiene una nota ambigua sobre el modelo oQ8e. Conviene verificar el identificador exacto antes de automatizar descargas.
- Fechas del repositorio: creado y actualizado el 23 de septiembre de 2026, sin descargas ni likes registrados en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e
- Modelo base declarado en `base_model`: empero-ai/Qwen3.8-Distill
- Modelo base citado en los creditos: empero-ai/Qwen3.8-9B-Distill-GGUF
- Canal del autor: https://www.youtube.com/@RolanDorisTech
