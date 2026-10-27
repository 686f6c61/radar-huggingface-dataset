# sergolsub/mlx-d3-flash-9B

## Resumen

`sergolsub/mlx-d3-flash-9B` es una conversión a 8 bits en formato MLX del modelo `vllm-sr/d3-flash`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo: la model card indica explícitamente que no hubo reentrenamiento ni cambios de arquitectura, solo cuantización a 8 bits y reempaquetado de los pesos en el layout que espera MLX. El checkpoint conserva 8.392.695.024 parámetros totales (aproximadamente 8,39 mil millones) y un peso en disco de unos 9,4 GB repartidos en cuatro ficheros `safetensors`.

El modelo subyacente, `vllm-sr/d3-flash`, se apoya en la arquitectura Qwen3.5: según la receta oficial de vLLM, son 8,39B parámetros tomados de `Qwen/Qwen3.5-9B`, de los cuales 0,46B corresponden a un codificador de visión, e incorpora una "answer-code readout" junto con una cabeza de decisión. Esa cabeza es la que permite a vLLM servir el checkpoint como modelo de clasificación (`D3ForSequenceClassification`) en el endpoint `/v1/systemone`. La conversión MLX incluye el glue de inferencia necesario (`*_mlx.py`, `decision_config.json`, `joint_config.json`) para reproducir ese modo de decisión fuera de vLLM.

Su relevancia práctica es acotada pero concreta: permite probar localmente en un Mac un modelo de 9B con capacidad de decisión y clasificación, sin depender de GPUs NVIDIA ni de un servidor vLLM. El interés es principalmente de prototipado y evaluación; el repositorio acumula 8 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni especificaciones de contexto o idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`qwen3_5`, `custom_code`) con codificador de visión de 0,46B y cabeza de decisión / readout de código de respuesta |
| Parámetros totales | 8.392.695.024 (~8,39B), incluyendo 0,46B del codificador de visión |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits en formato MLX (única variante publicada en este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de los pesos originales; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | `safetensors` en layout MLX, 4 shards (`model-00001..00004`) + `readout.safetensors`; incluye `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde al backbone de Qwen3.5, un transformer denso de 8,39B parámetros del que 0,46B pertenecen a un codificador de visión, según la receta `recipes/models/vllm-sr/d3-flash.yaml` del repositorio vllm-project/recipes. Sobre esa base, el modelo original `vllm-sr/d3-flash` añade un mecanismo de "answer-code readout" y una configuración de decisión (`decision_config.json`) que vLLM interpreta para servir el checkpoint como clasificador (`D3ForSequenceClassification`) en su endpoint `/v1/systemone`. El repositorio incluye además un `readout.safetensors` de 4 MB y ficheros `joint_config.json`, lo que sugiere una cabeza conjunta de decisión separada del cuerpo del modelo.

Sobre el entrenamiento no hay información publicada en los materiales disponibles: se desconoce el volumen de tokens, la composición del dataset, si hubo RLHF, DPO u otra fase de alineamiento, y también el proceso exacto de destilación o ajuste desde `Qwen/Qwen3.5-9B`. La conversión MLX documentada aquí no altera nada de eso: aplica cuantización a 8 bits y reempaqueta los pesos, verificando los hashes SHA-256 de los shards en el momento de la subida. En cuanto a innovaciones técnicas, lo diferencial no está en el cuerpo del modelo sino en la mencionada cabeza de decisión y el endpoint System One de vLLM, que convierte una tarea de generación en una clasificación servida de forma nativa.

## Capacidades

- Generación de texto autoregresiva, al estar construido sobre el backbone Qwen3.5-9B.
- Clasificación / toma de decisión mediante la cabeza de decisión y el readout de código de respuesta (`D3ForSequenceClassification` en vLLM, vía `/v1/systemone`).
- Procesamiento multimodal: el backbone incluye un codificador de visión de 0,46B parámetros, por lo que la arquitectura admite entrada de imagen además de texto.
- Modo de decisión con glue de inferencia propio en MLX (`*_mlx.py`, `decision_config.json`, `joint_config.json`), pensado para replicar localmente el comportamiento del endpoint de vLLM.
- Compatibilidad con `mlx_lm` para carga y generación en Apple Silicon.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.
- Modo "thinking" o decodificación especulativa: no disponible.

## Casos de uso

- **Enrutado de peticiones en un pipeline de agentes**: la cabeza de decisión permite convertir la entrada del usuario en una etiqueta de acción (qué herramienta invocar, qué cola asignar) sin generar texto libre, lo que reduce latencia frente a un enfoque puramente generativo.
- **Clasificación de tickets de soporte en local**: ejecutando el modelo con `mlx_lm` en un Mac se puede etiquetar por categoría y urgencia sin enviar los datos a un servicio externo, algo relevante cuando el contenido es sensible.
- **Triaje de documentos con componente visual**: al incluir codificador de visión, encaja en flujos donde hay que decidir el tipo de un documento a partir de una captura o un escaneo antes de derivarlo a un OCR o a un extractor específico.
- **Prototipado y evaluación en Apple Silicon**: investigadores que quieran medir el comportamiento del modelo `d3-flash` antes de desplegarlo en GPU pueden usar esta conversión de 9,4 GB para iterar sin aprovisionar hardware NVIDIA.
- **Filtro previo en sistemas RAG**: usar el modelo como clasificador de consultas (respondible con el índice, fuera de dominio, requiere escalado a un modelo mayor), reduciendo el coste de las llamadas al modelo generador principal.
- **Pruebas de integración del endpoint System One**: sirve para validar en local la lógica de decisión y el formato de respuesta que después se servirá en producción con vLLM y el checkpoint original en bf16.
- **Evaluación de seguridad de contenido**: clasificación de entradas potencialmente dañinas en un paso previo a la generación, siempre que se valide empíricamente la calidad del clasificador, dado que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card ni los resultados de búsqueda incluyen cifras de MMLU, HumanEval, GSM8K, evaluaciones de clasificación u otras métricas para `sergolsub/mlx-d3-flash-9B` ni para el checkpoint original `vllm-sr/d3-flash`.

## Requisitos de hardware

- **VRAM / memoria unificada estimada**: los pesos en 8 bits ocupan unos 9,35 GB (suma de los cuatro shards: 4,01 + 4,02 + 1,32 GB y 4 MB del readout). Con cache KV, tokenizer y overhead del runtime, conviene reservar del orden de 12-14 GB. Estimación propia, no publicada por el autor.
- **Apple Silicon recomendado**: equipos con 16 GB de memoria unificada como mínimo ajustado; 24 GB o 32 GB para contextos largos o ejecución concurrente con otras aplicaciones. El modelo está pensado para `mlx_lm`, no para GPUs discretas.
- **GPU NVIDIA**: esta conversión en MLX no se puede cargar en vLLM ni en TGI. Para el checkpoint original en bf16, LLM Explorer indica 16,8 GB de VRAM, lo que lo sitúa en el rango de una RTX 4090 (24 GB) o una A100/H100 para servir con vLLM.
- **¿Cabe en GPU de consumo?** La variante MLX sí cabe en cualquier Mac con 16 GB o más. La variante bf16 original cabe en una RTX 4090 de 24 GB según la cifra de 16,8 GB de VRAM.
- **Opciones de despliegue**: `mlx_lm` (carga y generación vía Python) y el servidor compatible con la API de OpenAI que incluye `mlx-lm`. Para el modelo original, vLLM con soporte de `D3ForSequenceClassification` en `/v1/systemone`. Ollama, llama.cpp y TGI no están soportados para estos pesos MLX según la información disponible.
- **Latencia y throughput**: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| `sergolsub/mlx-d3-flash-9B` | 8,39B (0,46B visión) | no disponible | safetensors MLX 8 bits | Apache 2.0 | Conversión para Apple Silicon; incluye glue de decisión |
| `vllm-sr/d3-flash` (upstream) | 8,39B (0,46B visión) | no disponible | safetensors bf16 | Apache 2.0 (heredada) | Checkpoint original; servible con vLLM como clasificador en `/v1/systemone`; ~16,8 GB de VRAM según LLM Explorer |
| `sergolsub/mlx-drex-v1.5-9B` | ~9B (por el nombre) | no disponible | safetensors MLX (`qwen3_5_text`) | nace-ai-open-rail-m-license-modified | Otra conversión MLX del mismo autor; licencia más restrictiva y sin codificador de visión declarado |
| `Qwen/Qwen3.5-9B` (base) | ~9B | no disponible | safetensors | no disponible en la información | Modelo del que parte `d3-flash`; sin cabeza de decisión ni readout específico |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguna de estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Ausencia total de benchmarks**: no hay métricas publicadas de calidad, precisión de clasificación ni rendimiento en generación, ni para esta conversión ni para el modelo original. Cualquier uso en producción requiere una evaluación propia.
- **Riesgo de alucinación**: al ser un modelo generativo de 9B, mantiene el riesgo habitual de producir contenido plausible pero falso, especialmente en el modo de generación libre. En el modo de decisión el riesgo se traslada a clasificaciones erróneas con alta confianza.
- **Conversión no oficial**: la cuantización a 8 bits la realiza un tercero (sergolsub), no el equipo de `vllm-sr`. No hay evidencia publicada de que la precisión se mantenga respecto al checkpoint bf16; la cuantización a 8 bits puede degradar tareas sensibles a matices.
- **Compatibilidad restringida**: los pesos están en layout MLX y solo se cargan con `mlx_lm`. No sirven para vLLM, TGI, llama.cpp ni Ollama, lo que limita el despliegue a hardware Apple.
- **Contexto e idiomas desconocidos**: no se especifica la ventana de contexto ni la cobertura lingüística. No se debe asumir soporte de español ni de contextos largos sin verificarlo empíricamente.
- **Estado del repositorio**: 8 descargas y 0 likes, creado el 24 de octubre de 2026 y actualizado dos días después. Es un artefacto de baja adopción y sin mantenimiento demostrado.
- **Licencia**: Apache 2.0 permite uso comercial, pero la propia model card advierte de que, en caso de conflicto, prevalece la licencia del repositorio upstream (`vllm-sr/d3-flash`). Conviene revisar ese repositorio antes de un despliegue comercial.
- **Soporte de visión incierto en esta conversión**: aunque el backbone incluye un codificador de visión de 0,46B, la model card no documenta cómo se pasa una imagen a través de `mlx_lm` en esta variante concreta. Verificar antes de diseñar un flujo multimodal.
- **Ficheros auxiliares crípticos**: `decision_config.json`, `joint_config.json` y los `*_mlx.py` son glue específico del autor; su comportamiento no está documentado más allá del código, lo que añade riesgo de integración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sergolsub/mlx-d3-flash-9B
- Modelo original: https://huggingface.co/vllm-sr/d3-flash
- Receta de vLLM para `d3-flash`: https://github.com/vllm-project/recipes/blob/main/models/vllm-sr/d3-flash.yaml
- Otra conversión MLX del mismo autor: https://huggingface.co/sergolsub/mlx-drex-v1.5-9B
- Página de StartLux-Decision (posible trabajo relacionado, no confirmado como origen del modelo): https://decision.startlux.com/
- Ficha en LLM Explorer del modelo original: https://llm-explorer.com/model/vllm-sr%2Fd3-flash,2P60bXUagsoPu2bJA27dUY
- Modelo base de Qwen sobre el que se construye el backbone: https://huggingface.co/Qwen/Qwen3.5-9B (referenciado en la receta de vLLM; no verificado en la búsqueda)
