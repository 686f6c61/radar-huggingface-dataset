# pipenetwork/Ternary-Bonsai-2-27B-MLX-6bit

## Resumen

Ternary-Bonsai-2-27B-MLX-6bit es una build de cuantización de 6 bits en formato MLX del modelo Ternary-Bonsai-2-27B, publicado por el usuario pipenetwork y derivado del repositorio GGUF de prism-ml. El modelo base es una versión ternarizada de un Qwen3.8-27B (etiquetado como qwen3_5), con 27.356.728.560 parámetros reales, arquitectura híbrida de 64 capas que combina Gated-DeltaNet con atención completa cada cuatro capas, y torre de visión oficial, lo que lo convierte en un modelo image-text-to-text.

El problema que resuelve esta build concreta es de interoperabilidad: el paquete MLX oficial de prism-ml (8,6 GB, 2 bits) almacena los pesos con la rotación Hadamard aplicada y exige su runtime propio. Esta versión "despliega" (unfold) esa rotación y devuelve los pesos a la base estándar, de modo que el modelo carga en mlx-vlm sin modificaciones (versión 0.7 o superior), sin kernels bifurcados ni runtime a medida, y además queda apto para fine-tuning y conversión posterior.

Es relevante ahora porque demuestra que se puede mantener la fidelidad de una cuantización ternaria agresiva con herramientas estándar: según el autor, la perplejidad en wikitext-2 es 8,9548 frente a 8,9679 del bf16 sin cuantizar, una diferencia del orden del ruido de redondeo, con un tamaño de 22,8 GB (42 % del bf16). El modelo está publicado bajo licencia Apache-2.0 y está pensado exclusivamente para Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida qwen3_5, 64 capas: Gated-DeltaNet con atención completa cada 4 capas, más torre de visión |
| Parámetros totales | 27.356.728.560 (27,36 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine 6-bit con grupo de 64 (esta build); la familia incluye builds de 4, 6, 8 y bf16, además de la base ternaria 2-bit de prism-ml y el GGUF original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (se incluye el NOTICE.txt de prism-ml) |
| Formato de pesos | safetensors en formato MLX (library_name: mlx); el modelo base está en GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 64 capas etiquetado como qwen3_5, en el que la mayoría de capas usan Gated-DeltaNet (una forma de atención lineal con estado recurrente) y solo cada cuarta capa emplea atención completa. Esta combinación busca reducir el coste de memoria y cómputo del contexto largo manteniendo la calidad de recuperación de la atención densa. El modelo incorpora además la torre de visión oficial del modelo base, lo que habilita la entrada de imágenes junto con texto (pipeline image-text-to-text).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; tampoco se detalla el proceso de ternarización aplicado por prism-ml más allá de la existencia de pesos ternarios de 2 bits. La innovación técnica documentada en esta ficha es la conversión: el autor despliega la rotación Hadamard por bloques y devuelve los pesos a la base estándar, con una verificación explícita del contrato de plegado contra el runtime original (aplicar el vector de signos en el orden incorrecto desplaza los logits en 7,4, y el test lo detecta). El resultado es que refold(unfold(W)) es idéntico bit a bit en fp32. La cuantización aplicada es affine de 6 bits con grupo de 64.

## Capacidades

- Generación de texto conversacional (tag: conversational) en modo image-text-to-text.
- Procesamiento de imágenes: la torre de visión está integrada y verificada de extremo a extremo por el autor, aunque no se publican métricas de visión.
- Razonamiento y generación de código y matemáticas: no hay documentación específica ni benchmarks publicados en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- Capacidad especial: pesos en base estándar aptos para fine-tuning y conversión downstream, algo que la build oficial de 2 bits de prism-ml no permite con herramientas estándar.

## Casos de uso

- Asistente multimodal local en Mac: el modelo acepta imagen y texto y se ejecuta con mlx-vlm sobre memoria unificada, lo que permite desplegar un asistente que procesa capturas, fotos o documentos escaneados sin enviar datos a servicios externos.
- Extracción estructurada de documentos: dado que combina visión y generación de texto, puede transcribir y estructurar campos de facturas, albaranes o formularios escaneados; conviene validar el resultado porque no hay benchmarks de precisión publicados.
- Descripción y análisis de diagramas técnicos: la torre de visión permite generar descripciones de esquemas, gráficos o interfaces, útil para documentación interna o accesibilidad.
- Base para fine-tuning de dominio: al estar los pesos en la base estándar (sin rotación Hadamard), se puede aplicar LoRA o adaptación completa con las herramientas habituales de MLX, algo inviable con la build ternaria oficial.
- Conversión downstream a otros runtimes: los pesos en base estándar permiten reconvertir a GGUF u otros formatos para llama.cpp u Ollama, sin depender del runtime de prism-ml.
- Evaluación de regresión en pipelines de CI: el script de conversión del autor (github.com/PipeNetwork/bonsai2-mlx) y el arnés de perplejidad sobre ventanas fijas de wikitext-2 sirven como test automatizable para detectar degradaciones al reconvertir o recuantizar.
- Investigación sobre cuantización ternaria: permite comparar la fidelidad de un pipeline ternario (2 bits con runtime propio) frente a una cuantización affine de 6 bits que carga en herramientas estándar, con métricas de logits y perplejidad ya publicadas.
- Chat de larga duración en local: el diseño híbrido con Gated-DeltaNet está orientado a reducir el coste del contexto largo; sin embargo, la longitud de contexto soportada no está declarada y debe medirse antes de usarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son de fidelidad y perplejidad.

Perplejidad en wikitext-2 (test, 296.815 tokens, ventanas idénticas ejecutadas con mlx-vlm estándar):

| Build | Tamaño | Perplejidad |
|---|---:|---:|
| prism-ml 2-bit, runtime propio | 8,6 GB | 8,9607 |
| bf16 (sin cuantizar, mismo autor) | 54,7 GB | 8,9679 |
| 8-bit | 29,5 GB | 8,9636 |
| 6-bit (esta build) | 22,8 GB | 8,9548 |
| 4-bit | 16,1 GB | 9,1497 |

Según el autor, las builds de 8 y 6 bits son estadísticamente indistinguibles del bf16, mientras que la de 4 bits cuesta un +2,1 % de perplejidad y es la única con pérdida medible.

Métricas de fidelidad frente al paquete 2-bit de prism-ml bajo su propio runtime (mismos prompts, 81 posiciones):

| Métrica | Valor |
|---|---|
| Máximo \|Δlogit\| | 0,22 sobre una escala de ±20 |
| Similitud coseno | 0,99999 |
| Coincidencia de argmax | 96,7–100 % (100 % en fp16, el dtype de activación del runtime original) |
| Ratio de perplejidad emparejado (145 ventanas de wikitext-2) | 0,9992 [0,9990; 0,9994] |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). No es ejecutable de forma nativa en CUDA ni ROCm.
- Memoria: los pesos ocupan 22,8 GB. Con caché KV y sobrecarga de runtime, se estima un consumo de memoria unificada de aproximadamente 26-30 GB para contexto moderado.
- Equipos recomendados: Mac con 36 GB o más de memoria unificada (M3 Max, M4 Max, M2 Ultra o superiores). Un equipo de 32 GB puede funcionar con contexto corto, pero deja poco margen al sistema operativo. Para la build de 8 bits (29,5 GB) o bf16 (54,7 GB) se recomienda 48-64 GB o más.
- GPU consumer: no aplica en el sentido habitual; no cabe ni se ejecuta en GPUs NVIDIA consumer porque MLX no soporta CUDA. El equivalente es memoria unificada en Apple Silicon.
- Opciones de despliegue: mlx-vlm >= 0.7 (obligatorio; versiones anteriores desplazan dos veces las normas de qwen3_5 y producen resultados incorrectos), mlx-lm para texto, y conversión a GGUF para llama.cpp u Ollama a partir de los pesos en base estándar.
- Latencia y throughput: no disponibles.
- Carga del modelo (ejemplo del autor): `from mlx_vlm import load, generate`; `load("pipenetwork/Ternary-Bonsai-2-27B-MLX-6bit")`.

## Comparativa con modelos similares

No hay información disponible sobre comparaciones con modelos de otras familias. La comparación posible es dentro de la propia familia Ternary-Bonsai-2-27B:

| Build | Cuantización | Tamaño | Perplejidad (wikitext-2) | Runtime necesario | Fine-tuning y conversión |
|---|---|---:|---:|---|---|
| prism-ml Ternary-Bonsai-2-27B-mlx-2bit | ternaria 2-bit | 8,6 GB | 8,9607 | runtime propio de prism-ml | no apto con herramientas estándar |
| pipenetwork 4-bit | affine 4-bit | 16,1 GB | 9,1497 | mlx-vlm >= 0.7 | sí |
| pipenetwork 6-bit (esta build) | affine 6-bit, grupo 64 | 22,8 GB | 8,9548 | mlx-vlm >= 0.7 | sí |
| pipenetwork 8-bit | affine 8-bit | 29,5 GB | 8,9636 | mlx-vlm >= 0.7 | sí |
| pipenetwork bf16 | bf16 | 54,7 GB | 8,9679 | mlx-vlm >= 0.7 | sí |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay evaluación de sesgos ni de toxicidad en la información proporcionada, y al derivar de un modelo base ajustado no se documenta el proceso de alineación.
- Riesgo de alucinación: no cuantificado; no hay benchmarks de veracidad ni de seguimiento de instrucciones. Como en cualquier modelo generativo, debe validarse la salida en usos críticos.
- Compatibilidad estricta de runtime: requiere mlx-vlm >= 0.7. Con versiones anteriores las normas de qwen3_5 se desplazan dos veces y el modelo produce resultados incorrectos sin aviso.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon; no hay soporte CUDA, ROCm ni CPU x86 con esta build.
- Idiomas y contexto no declarados: no se puede asumir cobertura multilingüe ni una ventana de contexto concreta sin medirlos.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni métricas de visión publicadas, por lo que no es posible comparar su calidad con otros modelos de tamaño similar.
- Naturaleza ternaria del base: el modelo de partida es una ternarización de un Qwen3.8-27B y no se publica una comparación frente al modelo sin ternarizar, de modo que la pérdida atribuible a la ternarización no está acotada.
- Validación comunitaria escasa: 0 descargas y 0 likes en el momento de la consulta, con publicación el 18 de septiembre de 2026. Las métricas de fidelidad son autoinformadas por el autor.
- Licencia: Apache-2.0, permite uso comercial. Debe conservarse el NOTICE.txt de prism-ml incluido en el repositorio.
- La build de 4 bits es la única con degradación medible (+2,1 % de perplejidad); si el presupuesto de memoria es ajustado, conviene tenerlo en cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-6bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Build 2-bit oficial de prism-ml para MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Build bf16 del mismo autor: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-bf16
- Build 8-bit del mismo autor: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-8bit
- Build 4-bit del mismo autor: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-4bit
- Código de conversión: https://github.com/PipeNetwork/bonsai2-mlx
- Resultados de búsqueda web: no se encontró ningún enlace relevante al modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con esta ficha.
