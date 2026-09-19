# cmeister/boundary-markers-en-d12-bnd_wpd-mingram

## Resumen

Este repositorio publica tres modelos de lenguaje (semillas 0, 1 y 2) que forman parte de la comparativa en inglés del artículo "Explicit Boundary Markers for Subword Vocabularies", de Sander Land y Clara Meister. No son modelos de propósito general: son artefactos de investigación diseñados para medir el efecto de la tokenización sobre la calidad del lenguaje modelado. Los tres comparten arquitectura, datos y ajustes de entrenamiento, y se diferencian únicamente en la semilla de inicialización y en el orden de los fragmentos de datos.

La arquitectura es un transformer decoder-only de 12 capas, anchura 768, 6 cabezas de atención y 2.048 tokens de contexto, entrenado con el framework nanochat (commit `92d63d4`) durante 2.553 pasos de 524.288 tokens, es decir, 1.340 millones de tokens. El tokenizador es la variable experimental: un vocabulario MinGram de 34.685 entradas (más un token de inicio de secuencia) entrenado sobre una muestra de 5 GB de FineWeb en inglés, con marcadores explícitos de frontera que también señalan secuencias de puntuación y de dígitos.

Su relevancia es metodológica antes que práctica. Los autores advierten de que los checkpoints originales se perdieron y que estos tres modelos son reentrenamientos de septiembre de 2026 con los mismos datos y ajustes; como el entrenamiento en GPU no es reproducible bit a bit, los valores de bits por byte difieren ligeramente de los publicados (entre -0,00049 y +0,00029). El repositorio incluye, además de los pesos, el tokenizador, los ficheros de configuración, los registros completos de entrenamiento y los hashes SHA-256 de cada artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (framework nanochat, commit `92d63d4`) |
| Parámetros totales | no disponible (configuración publicada: 12 capas, anchura 768, 6 cabezas de atención) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos en punto flotante; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), cargable con `torch.load(..., weights_only=True)`) |
| Vocabulario | 34.686 entradas (34.685 del tokenizador MinGram + token de inicio de secuencia) |
| Tokens de entrenamiento | 1.340 millones (2.553 pasos × 524.288 tokens) |
| Semillas incluidas | 0, 1 y 2 |
| Tamaño del repositorio | 2,5 GB (tres semillas, tokenizador, registros y metadatos) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo sigue la implementación de nanochat, un transformer decoder-only autorregresivo con 12 capas, anchura de 768 y 6 cabezas de atención (dimensión de cabeza 128), sobre un contexto máximo de 2.048 tokens. La model card no detalla los componentes internos (tipo de normalización, posición, activación del bloque MLP), por lo que esos detalles deben consultarse en el repositorio de nanochat en el commit indicado. Cada modelo se entrenó en una única GPU; el modelo de GPU no se especifica.

Los datos de entrenamiento son los ocho primeros fragmentos de ClimbMix que nanochat descarga automáticamente, leídos entre 3,4 y 3,6 veces según el tokenizador. La semilla determina la inicialización de pesos y el orden de esos ocho fragmentos, pero el orden es idéntico entre tokenizadores para una misma semilla, de modo que las comparaciones entre brazos del experimento son directas. No hay indicios de ajuste por instrucciones, RLHF ni DPO: es un modelo base entrenado exclusivamente con el objetivo de modelado de lenguaje.

La innovación técnica está en el tokenizador, no en la arquitectura. El tokenizador `bnd_wpd` parte de `bnd_w` y añade marcadores de frontera para secuencias de puntuación y de dígitos, situados en el lado en el que se eliminó un espacio. Se entrenó con MinGram sobre una muestra de 5 GB de FineWeb en inglés y se distribuye como `tokenizer/fineweb_en_5gb_bnd_wpd_mingram_v34685.json.gz` (SHA-256 `b093d9442b637c609e0a3be2cfeccb08aca2dd69118ed6925b788bdfe8f34500`). Para cargarlo es necesario el repositorio `script_tok`, ya que no es un tokenizador estándar de HuggingFace. Los ajustes de pre-tokenización almacenados en el fichero se reescribieron desde el formato de agosto de 2026 al actual, y la reescritura se validó comprobando que ambas versiones producen identificadores idénticos en 200 documentos en inglés.

## Capacidades

- Generación de texto autorregresiva en inglés con un contexto máximo de 2.048 tokens.
- Modelado de lenguaje base: no está ajustado por instrucciones, por lo que no mantiene diálogos ni sigue instrucciones de forma fiable.
- Evaluación comparativa de tokenizadores: los tres modelos permiten medir el efecto del vocabulario sobre la pérdida en bits por byte con el resto de variables controladas.
- Reproducción de experimentos: los registros de entrenamiento y evaluación completos están incluidos en el repositorio (`seed<n>/train.log`).
- Reanudación de experimentos: los pesos se cargan como state dict de PyTorch y pueden usarse como inicialización para ajuste fino o para continuar el entrenamiento.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso guiado ni modo de pensamiento explícito.
- No dispone de capacidades multimodales (visión, audio) ni de decodificación especulativa publicada.
- Capacidad multilingüe: únicamente inglés, según el campo `language` de la model card.

## Casos de uso

- Reproducción del experimento del artículo: cargar los tres checkpoints con la misma semilla de datos y comparar la pérdida en bits por byte contra los otros brazos de tokenización del paper, aislando el efecto del vocabulario.
- Investigación en tokenización: usar el tokenizador `bnd_wpd` como variante de referencia frente a tokenizadores sin marcadores de frontera, midiendo el impacto en métricas por byte en lugar de por token.
- Punto de partida para ajuste fino ligero: al ser un modelo base pequeño entrenado con 1.340 millones de tokens, sirve para experimentos de ajuste supervisado en inglés donde el coste computacional deba ser mínimo, asumiendo que la calidad final será limitada.
- Validación de infraestructura de entrenamiento: los registros y la configuración de nanochat permiten verificar pipelines de entrenamiento distribuido con pasos de 524.288 tokens y comparar el consumo real frente al esperado.
- Docencia y divulgación: es un caso práctico y completo para explicar cómo se controlan las variables en un experimento de modelado de lenguaje (misma arquitectura, mismos datos, mismo orden, distinto tokenizador).
- Referencia de línea base en inglés: para tareas de puntuación de texto o estimación de perplejidad sobre texto inglés limpio, con la advertencia de que la ventana de 2.048 tokens obliga a trocear documentos largos.
- Estudio de sesgos y de calidad de datos web: al derivar de FineWeb y ClimbMix, el modelo puede emplearse para analizar qué sesgos introduce una muestra concreta de texto web en un modelo de este tamaño.
- No es adecuado para atención al cliente, agentes, generación de código en producción ni despliegues con usuarios finales, porque no hay ajuste por instrucciones ni evaluación de seguridad publicada.

## Benchmarks y rendimiento

La model card únicamente publica la pérdida de validación en bits por byte (bpb) sobre el fragmento de validación de ClimbMix de nanochat, dividida por la longitud real en UTF-8 del texto evaluado. Un valor menor es mejor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar en la información disponible.

| Semilla | bpb (reentrenamiento) | bpb (publicado) | Diferencia |
|---|---|---|---|
| 0 | 0,88009 | 0,87980 | +0,00029 |
| 1 | 0,88048 | 0,88097 | -0,00049 |
| 2 | 0,88073 | 0,88075 | -0,00002 |

La dispersión entre semillas del reentrenamiento (0,88009 a 0,88073, un rango de 0,00064) es del mismo orden que la diferencia entre reentrenamiento y resultados publicados, lo que es coherente con la advertencia de los autores sobre la reproducibilidad no determinista del entrenamiento en GPU.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Con 12 capas y anchura 768, el modelo es de tamaño reducido y debería caber holgadamente en cualquier GPU de consumo actual, incluso manteniendo los pesos en punto flotante de 32 bits.
- GPU recomendadas: no se especifica el modelo de GPU usado en el entrenamiento; la model card solo indica que se empleó una GPU por modelo. Para inferencia, cualquier GPU con varios gigabytes de VRAM es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer de gama media o superior; no se publican medidas exactas de memoria.
- Opciones de despliegue: al distribuirse como state dict de PyTorch con código propio de nanochat, no es compatible de forma nativa con vLLM, TGI, llama.cpp ni Ollama. El despliegue requiere cargar el state dict con `torch.load(..., weights_only=True)` usando la definición de modelo de nanochat, o bien convertir los pesos a safetensors/GGUF de forma manual.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.
- Tamaño en disco: el repositorio completo ocupa 2,5 GB, incluyendo tres checkpoints, el tokenizador, los registros de entrenamiento y los metadatos; el tamaño de cada checkpoint individual no se detalla.
- Tokenizador: requiere clonar `script_tok` y usar la clase `BoundaryMinGramModel` para cargar el fichero `.json.gz`, ya que no sigue el formato estándar de HuggingFace.

## Comparativa con modelos similares

La búsqueda web realizada no devolvió resultados relacionados con este modelo (los resultados obtenidos tratan sobre el título nobiliario de baronet y no guardan relación con el contenido solicitado), por lo que la comparación se limita a la información de la model card y a referencias públicas de los proyectos citados en ella.

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos publicados |
|---|---|---|---|---|---|
| Este modelo (`bnd_wpd`, 12 capas) | no disponible | 2.048 | Apache 2.0 | `.pt` | bpb de validación en ClimbMix (tres semillas) |
| Otros brazos del mismo artículo (misma arquitectura, tokenizador distinto) | misma configuración | 2.048 | no disponible en esta ficha | `.pt` | bpb de validación, comparables semilla a semilla |
| `bnd_w` (variante de tokenizador citada como base) | misma configuración | 2.048 | no disponible en esta ficha | `.pt` | no disponible en esta ficha |
| nanochat (framework de referencia, configuración mayor por defecto) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | `.pt` | no disponible |

Dentro del propio artículo, el modelo comparable más directo son los otros brazos de tokenización entrenados con idéntica arquitectura, datos y orden de fragmentos para cada semilla, lo que convierte a estos tres checkpoints en el grupo de control natural para medir el efecto de los marcadores de frontera. Cualquier comparación con modelos de propósito general de tamaño similar requiere datos que no se han publicado aquí.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene diálogos coherentes y no debe exponerse directamente a usuarios finales.
- Sesgos conocidos: no se publica ninguna evaluación de sesgos. Al derivar de una muestra de FineWeb y de ClimbMix (texto web en inglés), es previsible que herede sesgos de representación, estereotipos y sobrerrepresentación de determinados registros lingüísticos, pero se trata de una expectativa razonada y no de un resultado medido en la información disponible.
- Riesgo de alucinación: alto para cualquier uso factual, dado el tamaño reducido del modelo y los 1.340 millones de tokens de entrenamiento, muy por debajo de los estándares actuales.
- Limitación de contexto: 2.048 tokens obligan a trocear documentos largos y a perder coherencia en tareas que requieran memoria extensa.
- Limitación de idioma: solo inglés. No hay evidencia de competencia en castellano ni en ningún otro idioma.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el tokenizador requiere código externo (`script_tok`) para cargarse, y no se declara compatibilidad de ese código con la misma licencia en la información disponible.
- Los checkpoints son reentrenamientos, no los originales: los resultados difieren de las cifras publicadas entre -0,00049 y +0,00029 en bits por byte, por lo que no deben citarse como idénticos a los del artículo.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que no es posible caracterizar el rendimiento en tareas concretas más allá de la pérdida de validación.
- Compatibilidad limitada: al no publicarse safetensors ni GGUF, integrarlo en servidores de inferencia habituales exige conversión manual y código específico de nanochat.
- Metadatos del repositorio: cero descargas y cero valoraciones, sin pipeline declarado, lo que indica que no ha pasado por ninguna validación de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-bnd_wpd-mingram
- Artículo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Tokenizador incluido en el repositorio: https://huggingface.co/cmeister/boundary-markers-en-d12-bnd_wpd-mingram/blob/main/tokenizer/fineweb_en_5gb_bnd_wpd_mingram_v34685.json.gz
- Repositorio nanochat (framework de entrenamiento): https://github.com/karpathy/nanochat
- Repositorio script_tok, necesario para cargar el tokenizador: https://github.com/sanderland/script_tok
- Perfil del autor en HuggingFace: https://huggingface.co/cmeister
- Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos corresponden a páginas sobre el título nobiliario de baronet y no se han utilizado.
