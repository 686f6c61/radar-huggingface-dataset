# Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e

## Resumen

El modelo `Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e` es una cuantización en 5 bits (formato MLX safetensors) del modelo base `DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP`, un fine-tuning de 27 000 millones de parámetros sobre Qwen3.6-27B. El autor de esta cuantización es Johneeee, y utiliza la herramienta oQ (oMLX v0.5.4.dev1) con cuantización de precisión mixta, grupo de tamaño 64 y 5 bits. El repositorio ocupa 19,2 GB y está pensado para ejecutarse en entornos Apple MLX.

El modelo base destaca por superar la barrera de 700 en ARC-C (0,711 en 8 bits y 0,701 en 4 bits), siendo el primer modelo open source de su tamaño en lograrlo, y por superar al Qwen3.6-27B original en 6 de 7 benchmarks según las notas del autor. Esta versión cuantizada mantiene las capacidades del modelo original en un formato más ligero, aunque los datos de parámetros en safetensors (5 212 596 224) resultan inconsistentes con la denominación de 27B, lo que sugiere una posible discrepancia en el registro o una cuantización parcial.

La relevancia de este modelo radica en su rendimiento en razonamiento y código (MMLU 88,0 %, HumanEval 89,6 % según la model card), así como en su carácter "uncensored" (sin censura), lo que lo hace atractivo para casos de uso que requieren respuestas sin restricciones, aunque con implicaciones legales y éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo qwen3_5, basado en Qwen3.6-27B) |
| Parametros totales | 5 212 596 224 (segun safetensors; el nombre indica 27B, discrepancia no resuelta) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, grupo de 64, precision mixta (oQ/oMLX) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen3.6-27B, un transformer denso de 27 000 millones de parámetros. Según la documentación del autor original (DavidAU), se trata de un fine-tuning multi-etapa y una fusión (merge) de varios modelos, con el objetivo de mejorar la compatibilidad con flujos de trabajo de modelos frontera (efecto de destilación). No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO. La cuantización aplicada en este repositorio utiliza oQ (oMLX), que realiza una cuantización de precisión mixta en 5 bits con grupo de tamaño 64, optimizada para ejecución en hardware Apple (MLX).

## Capacidades

- Generación de texto y razonamiento: obtiene 88,0 % en MMLU y 70,0 % en MMLU_PRO según la model card.
- Generación de código: 89,6 % en HumanEval, lo que indica una sólida capacidad para tareas de programación.
- Razonamiento avanzado: el modelo base alcanza 0,711 en ARC-C (8 bits), superando el umbral de 700, un hito para modelos open source de su tamaño.
- Carácter "uncensored": el nombre indica que no aplica censura en las respuestas, lo que permite generar contenido que otros modelos rechazarían.
- Compatibilidad con flujos de trabajo establecidos: según las notas del autor, el modelo se comporta de forma similar a modelos frontera en cuanto a la forma de interactuar con herramientas y entornos (efecto de destilación).
- Soporte de tool calling y agentes: no se menciona explícitamente, pero al estar basado en Qwen3.6, es probable que herede capacidades de function calling, aunque no está confirmado.

## Casos de uso

- Generación de código en entornos de desarrollo: gracias a su alto rendimiento en HumanEval (89,6 %), puede integrarse en asistentes de programación, autocompletado de código o pipelines de CI/CD para generar tests o documentación.
- Razonamiento complejo y resolución de problemas: con MMLU de 88,0 % y ARC-C superior a 700, es adecuado para tareas de análisis, planificación y toma de decisiones en dominios técnicos.
- Investigación académica en IA: al ser un modelo abierto (aunque con licencia no especificada), puede utilizarse para experimentos de destilación, evaluación de benchmarks o estudios de comportamiento de modelos sin censura.
- Chatbots sin restricciones de contenido: su naturaleza "uncensored" permite desplegar asistentes conversacionales que no filtran temas sensibles, aunque con riesgos legales y éticos.
- Prototipado rápido en entornos Apple: al estar cuantizado en formato MLX, puede ejecutarse en Macs con Apple Silicon, facilitando pruebas locales sin necesidad de GPUs dedicadas.
- Fine-tuning posterior: al ser una cuantización, puede servir como punto de partida para ajustes adicionales en tareas específicas, aunque la cuantización puede limitar la precisión del entrenamiento.

## Benchmarks y rendimiento

La model card incluye los siguientes resultados, aunque no se especifica si corresponden al modelo cuantizado o al base:

| Benchmark | Resultado |
|---|---|
| MMLU | 88,0 % |
| MMLU_PRO | 70,0 % |
| HumanEval | 89,6 % |

Según la búsqueda web, el modelo base (DavidAU) obtiene 0,711 en ARC-C en 8 bits y 0,701 en 4 bits, superando al Qwen3.6-27B original en 6 de 7 benchmarks. No se dispone de benchmarks específicos para esta cuantización de 5 bits.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,2 GB. Para un modelo de 27B en 5 bits, se estima un uso de VRAM de aproximadamente 17-20 GB, aunque la discrepancia en el número de parámetros (5,2B según safetensors) podría reducir este requisito. No hay datos confirmados.
- GPU recomendadas: al ser formato MLX, está optimizado para Apple Silicon (M1/M2/M3/M4). En GPUs NVIDIA, se requeriría conversión a otro formato (por ejemplo, GGUF o FP16).
- Compatibilidad con consumer GPU: si el modelo real es de 27B, una RTX 3090/4090 (24 GB) podría ser suficiente con cuantización 5 bits. Si el número de parámetros es realmente 5,2B, cabría en GPUs de 8-12 GB.
- Opciones de despliegue: MLX (Apple), conversión a GGUF para llama.cpp u Ollama, o a safetensors estándar para vLLM o TGI (requiere conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27B | no disponible | no disponible | no disponible | no disponible |
| DavidAU/Qwen3.6-27B-Fable-Fusion (base) | 27B | no disponible | 88,0 % (segun model card) | 89,6 % (segun model card) | no disponible |
| Este modelo (cuantizado 5-bit) | 5,2B (segun safetensors) | no disponible | 88,0 % (heredado) | 89,6 % (heredado) | no disponible |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: el safetensors indica 5 212 596 224 parámetros, mientras que el nombre del modelo sugiere 27B. Esto puede deberse a un error de registro o a una cuantización parcial; se recomienda verificar antes de usar.
- Licencia no especificada: el uso comercial o la redistribución pueden estar sujetos a restricciones legales no documentadas. Riesgo legal significativo.
- Contenido sin censura: al ser "uncensored", puede generar contenido ofensivo, ilegal o perjudicial. No es apto para aplicaciones públicas sin moderación.
- Sesgos y alucinaciones: no hay información sobre sesgos específicos, pero al ser un modelo de lenguaje, es susceptible de alucinar y de reflejar sesgos de los datos de entrenamiento.
- Contexto limitado: no se especifica la longitud de contexto, lo que dificulta su uso en tareas que requieren ventanas largas.
- Formato propietario: la cuantización oQ (oMLX) puede no ser compatible con todas las herramientas de inferencia estándar, limitando su portabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Versión GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Discusión sobre benchmarks del modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions/1
- Artículo en HackerNoon sobre ARC-C: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
