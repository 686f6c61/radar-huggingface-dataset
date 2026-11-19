# junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX

## Resumen

Qwen-3.8-27B-Uncensored-8-Bit-MLX es una cuantización de 8 bits en formato MLX del modelo multimodal `junafinity/Qwen-3.8-27B-Uncensored`, publicada por el usuario junafinity bajo la marca VeriSafe.Live. Se trata de un derivado de la familia Qwen 3.5 (tag `qwen3_5`) al que se le ha aplicado una edición de pesos tipo *abliteration* para eliminar la dirección de rechazo del decodificador de texto, conservando la torre de visión. El resultado es un modelo image-text-to-text que acepta entradas de imagen y texto y genera respuestas sin las negativas aprendidas por el alineamiento original.

El checkpoint tiene 27.356.728.560 parámetros (~27,36 mil millones) y ocupa 28 GB en disco, frente a los 52 GB del padre en bf16. La cuantización es afín de 8 bits con tamaño de grupo 64, lo que da una media ponderada de 8,627 bits por peso; la torre de visión se mantiene en bf16 sin cuantizar y la cabeza `mtp.*` (multi-token prediction) se descarta porque `mlx-vlm` no la modela. Está pensado para ejecutarse localmente en Apple Silicon mediante MLX y `mlx-vlm`.

Su relevancia es doble: por un lado, ofrece una vía práctica de ejecutar un VLM de ~27B en Macs de la serie M; por otro, su naturaleza *uncensored* lo posiciona como instrumento de investigación para red teaming y evaluación de pilas defensivas, comparando el par (base alineado vs. abliterado) como control experimental. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen 3.5, tag `qwen3_5`); decodificador de texto más torre de visión; cabeza MTP descartada en esta build |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, grupo de 64 (8,627 bits/peso ponderados); torre de visión en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx-vlm`); repo de 29,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de la familia Qwen 3.5: un decodificador de texto de ~27B parámetros acoplado a una torre de visión que procesa imágenes y las proyecta al espacio del modelo de lenguaje, dando lugar a la pipeline `image-text-to-text`. El modelo base incorpora una cabeza de predicción multi-token (`mtp.*`), que en esta cuantización se elimina porque `mlx-vlm` no la soporta; quien necesite MTP nativo debe recurrir al padre en bf16 o a una cabeza draft separada (`qwen38-mtp-head-fc-bf16-4bit`), cuya tasa de aceptación en prosa difícil está, según la propia model card, sin medir.

El entrenamiento original del modelo base no se detalla en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO: no disponible). Lo que sí se especifica es la intervención sobre los pesos: una edición directa tipo *abliteration*, descrita como una edición de rango 1 sobre un tramo de capas conocido, aplicada al decodificador de texto. No es un fine-tune, sino una modificación de pesos que elimina la dirección de rechazo. La cuantización posterior es afín de 8 bits con grupo de 64, aplicada solo al modelo de lenguaje, manteniendo la torre de visión en bf16.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta condicionada a imagen (image-text-to-text).
- Razonamiento y generación de código y matemáticas: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo *thinking*: no disponible.
- Comportamiento *uncensored*: se elimina la dirección de rechazo del decodificador de texto, aunque la model card advierte que algunos rechazos sobreviven (reafirmación multi-turno, direccionamiento por system prompt y rechazos por la vía de visión).
- Ejecución local en Apple Silicon mediante MLX.

## Casos de uso

- Red teaming automatizado: el modelo actúa como objetivo no renuente en bucles de ataque, de modo que los rechazos irrelevantes no interrumpan la prueba del control bajo estudio (inyección de prompts, abuso de herramientas, rutas de exfiltración de datos, bypass de políticas).
- Medición del techo de capacidad: al comparar este checkpoint con su base alineado se obtiene una cota superior de lo que los pesos pueden producir en un dominio, independientemente de los rechazos que muestre la versión comercial.
- Evaluación de pilas defensivas: sirve para probar filtros de entrada, clasificadores de salida, defensas frente a inyección de prompts y APIs de moderación en un escenario donde el propio modelo no contribuye con negativas.
- Generación de datos etiquetados para moderación: produce completaciones para entrenar o evaluar modelos de detección de abuso y clasificación de salidas.
- Investigación en interpretabilidad del rechazo residual: al ser una edición de rango 1 sobre un tramo de capas conocido, el par base/abliterado constituye un control experimental limpio.
- Procesamiento local de documentos con imagen en Mac: al mantener la torre de visión en bf16 y caber en 28 GB, permite flujos de OCR semántico, descripción de capturas o extracción de información de figuras sin salir del equipo.
- Asistente conversacional de dominio cerrado en local: para prototipos y demos sobre Apple Silicon donde se requiere un VLM de ~27B sin depender de servicios externos, siempre con una capa de moderación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no publica cifras de tokens por segundo en Apple y que los números de otras tarjetas (21,8 tok/s en un M3 Ultra para Alis-8bit; 18,7 tok/s en un M5 Max para Abliterated 8-bit) corresponden a sus respectivos repositorios y hardware, no a este.

## Requisitos de hardware

- VRAM/unified memory estimada: ~28 GB de pesos en disco; se necesita margen adicional para KV cache y el grafo de cómputo, por lo que en la práctica conviene disponer de 32 GB o más de memoria unificada.
- GPU recomendadas: Apple Silicon de la serie M con memoria unificada amplia; el formato MLX no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en Macs de la serie M con suficiente memoria unificada; no aplica a GPU discretas NVIDIA por el formato MLX.
- Opciones de despliegue: `mlx-vlm` (librería declarada); MLX como runtime subyacente. Para el padre en bf16 o para otros formatos habría que recurrir a los repositorios correspondientes.
- Latencia y throughput: no disponibles para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-3.8-27B-Uncensored-8-Bit-MLX (este) | ~27,36 B | no disponible | MLX safetensors, 8 bits afín grupo 64, visión bf16 | apache-2.0 | Cabeza MTP descartada; sin cifras de tok/s publicadas |
| junafinity/Qwen-3.8-27B-Uncensored (padre bf16) | ~27,36 B | no disponible | safetensors bf16, ~52 GB | apache-2.0 | Conserva MTP nativo; requiere mucha más memoria |
| orcarouter/Qwen3.8-27B-Uncensored-MLX | no disponible | no disponible | MLX, 8 bits con torre de visión sin cuantizar | no disponible | Mismo patrón de cuantización según la model card |
| mlx-community/Qwen3.8-27B-8bit | no disponible | no disponible | MLX, 8 bits | no disponible | Variante alineada, sin abliteration |
| avlp12 Alis-8bit | no disponible | no disponible | MLX, 8 bits | no disponible | Reporta 21,8 tok/s en M3 Ultra |
| PocketAiHub Abliterated-MLX 8-bit | no disponible | no disponible | MLX, 8 bits | no disponible | Reporta 18,7 tok/s en M5 Max |

## Limitaciones y advertencias

- Modelo *uncensored*: la abliteration elimina una dirección de rechazo, no una política; sobreviven rechazos en reafirmación multi-turno, direccionamiento por system prompt y rutas de visión.
- No debe exponerse como endpoint público sin una capa de moderación independiente; quien despliega asume la responsabilidad de los guardarraíles que el modelo original llevaba.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto; la model card no documenta sesgos concretos (no disponible).
- Riesgo de alucinación: no cuantificado en la información disponible.
- Longitud de contexto e idiomas soportados no documentados en esta ficha.
- La cabeza MTP se ha eliminado: no hay decodificación especulativa nativa en esta build, y la aceptación de la cabeza draft opcional en prosa difícil está sin medir.
- Solo ejecutable en el ecosistema MLX/Apple Silicon; no es portable a CUDA sin reconversión.
- Sin cifras de rendimiento publicadas para este repositorio; cualquier número de terceros no es trasladable.
- La licencia Apache 2.0 se declara en el repo, pero conviene verificar las condiciones del modelo base original antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX
- Modelo base: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Cabeza MTP draft opcional: https://huggingface.co/junafinity/qwen38-mtp-head-fc-bf16-4bit
- Colección de la familia: https://huggingface.co/collections/junafinity/qwen-38-27b-uncensored-apple-silicon-6a896c726b52be3a0b63400e
- Sitio del autor: https://verisafe.live
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado en los tags: arxiv:2406.11717
