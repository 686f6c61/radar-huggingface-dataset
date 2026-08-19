# haihengh/Qwen3.6-35B-A3B-finchmoe-3bit

## Resumen

El modelo `haihengh/Qwen3.6-35B-A3B-finchmoe-3bit` es una cuantización mixta de 3/4/8 bits del modelo base Qwen3.6-35B-A3B, un MoE (Mixture of Experts) de 35 mil millones de parámetros totales y 3 mil millones activos. Ha sido desarrollado por el autor haihengh específicamente para el motor de inferencia FinchMoE, un motor escrito en C y Metal que permite ejecutar modelos MoE en Apple Silicon mediante streaming de expertos desde SSD. El objetivo principal es reducir el tamaño de los pesos de 71,9 GB (BF16) a 14,9 GB, lo que posibilita su ejecución en equipos con 16 GB de RAM e incluso en máquinas de 8 GB, aunque con menor rendimiento.

La relevancia de esta ficha radica en que aborda un problema práctico: ejecutar modelos grandes en hardware de consumo de Apple sin necesidad de GPUs dedicadas. La cuantización emplea 3 bits para los expertos enrutados, 4 bits para las capas de atención y GDN, y 8 bits para embeddings y la cabeza de salida, con una calidad medida mediante coseno de similitud que se mantiene alta en comparación con el modelo original. El formato de pesos es propietario de FinchMoE y no es compatible con otras herramientas como llama.cpp o vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B |
| Parametros totales | 35B (nominal, según nomenclatura del modelo base) |
| Parametros activos | 3B (nominal, según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit (expertos enrutados), 4-bit (GDN/attention/shared experts), 8-bit (embeddings y lm_head) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato personalizado FinchMoE (binarios + JSON + Metal shaders) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento desde cero, sino una cuantización del modelo base Qwen/Qwen3.6-35B-A3B, que a su vez es un MoE con 35B parámetros totales y 3B activos. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión, etc.) ni los datos de entrenamiento originales. La innovación principal de esta versión reside en el esquema de cuantización mixta: los expertos enrutados se cuantizan a 3 bits con grupos de 256 expertos por capa (40 capas), mientras que los componentes no expertos (atención, GDN, expertos compartidos) se cuantizan a 4 bits con agrupación de 64, y las embeddings y la cabeza de salida se mantienen a 8 bits. Este diseño está optimizado para el motor FinchMoE, que realiza un streaming de expertos desde SSD con copia cero, evitando cargar todos los pesos en RAM.

No se dispone de información sobre el proceso de cuantización (calibración, datos utilizados, etc.) ni sobre el entrenamiento del modelo base. El autor reporta que la calidad de cuantización, medida mediante coseno de similitud frente al BF16, es de 0,966-0,979 para los expertos enrutados, ≥0,995 para los no expertos y casi sin pérdida para embeddings y lm_head. Además, afirma que la calidad extremo a extremo supera el nivel de llama.cpp Q4_K_M en prompts límite y que no se observa deriva en generaciones largas.

## Capacidades

Las capacidades funcionales del modelo no están documentadas en la model card. Al ser una cuantización del modelo base Qwen3.6-35B-A3B, se espera que herede las capacidades de generación de texto, razonamiento y posiblemente código del modelo original, pero no se proporcionan detalles específicos. Lo que sí se conoce:

- Generación de texto en inglés: el modelo puede producir texto coherente, como se demuestra en el ejemplo de uso de la model card.
- Ejecución en Apple Silicon: gracias al motor FinchMoE, el modelo puede ejecutarse en dispositivos con Metal, incluyendo Macs con 16 GB o 8 GB de RAM.
- No se menciona soporte de tool calling, agentes, visión, audio ni modos de razonamiento especiales.
- El idioma soportado es exclusivamente inglés, según la etiqueta `language: [en]`.
- No hay información sobre capacidades multilingües ni sobre funciones de llamada a herramientas.

## Casos de uso

Dado que la documentación no especifica casos de uso concretos, se proponen aplicaciones realistas basadas en las características conocidas del modelo y su entorno de ejecución:

- Asistente de escritura en inglés en Mac: el modelo puede generar borradores, resumir textos o redactar correos electrónicos directamente en un equipo Apple con 16 GB de RAM, aprovechando la velocidad de decodificación de 16-22 tok/s en un M4.
- Chat conversacional local: al ser un MoE de 3B activos, puede mantener conversaciones multi-turno en inglés sin conexión a internet, con una huella de RAM de aproximadamente 0,7 GB para el motor más la caché de expertos.
- Generación de código en entornos de desarrollo: si el modelo base tiene capacidades de código (no confirmadas), podría usarse para autocompletar o generar fragmentos en inglés, siempre que el motor FinchMoE permita integración con editores.
- Prototipado de aplicaciones de IA en macOS: los desarrolladores pueden probar un modelo de 35B en hardware de consumo antes de migrar a GPUs dedicadas, gracias al bajo requisito de memoria.
- Procesamiento por lotes de documentos: con prefill de 90 tokens en 1,9 segundos (en M4), el modelo puede procesar documentos de tamaño moderado en tareas de resumen o extracción de información.
- Investigación académica sobre cuantización extrema: el esquema de 3 bits para expertos enrutados es un caso de estudio interesante para evaluar el impacto de la cuantización agresiva en modelos MoE, aunque no se ofrecen benchmarks de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son los siguientes:

| Métrica | Valor |
|---|---|
| Calidad de cuantización (CosSim vs BF16) | Expertos enrutados: 0,966-0,979; No expertos: ≥0,995; Embeddings/lm_head: casi sin pérdida |
| Calidad extremo a extremo | Nivel de llama.cpp Q4_K_M en prompts límite |
| Deriva en generación larga | No observada (coseno diferencial de 0,99942) |
| Decode (M4, 16 GB, K=8) | 16-22 tok/s; reinicio en frío: 10,3 tok/s |
| Prefill (90 tokens, M4) | 1,9 s en modo chunked; 5,0-5,3 s por token |
| RAM (M4, 16 GB) | ~0,7 GB motor + ~3,7 GB caché de página de expertos |
| Rendimiento en 8 GB (M1 mini) | ~4,1 tok/s (limitado por I/O de SSD) |

## Requisitos de hardware

- Apple Silicon con soporte Metal (macOS + Xcode Command Line Tools) obligatorio; no funciona en Linux, Windows ni GPUs NVIDIA.
- RAM mínima: 8 GB (M1 mini) con rendimiento de ~4,1 tok/s; recomendado 16 GB para 16-22 tok/s en un M4.
- Almacenamiento SSD: se requieren ~14,9 GB para los pesos y espacio adicional para la caché de páginas de expertos (~3,7 GB en M4).
- Despliegue: compilar el motor FinchMoE desde el repositorio GitHub (`make`) y ejecutar el binario `finchmoe-infer` con los archivos del modelo. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los valores medidos en M4 son 16-22 tok/s en decodificación y 1,9 s para prefill de 90 tokens; en 8 GB, el rendimiento cae a ~4,1 tok/s.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos o cuantizaciones. La única referencia indirecta es la afirmación del autor de que la calidad extremo a extremo supera el nivel de llama.cpp Q4_K_M, pero no se ofrecen datos numéricos comparativos. En términos de tamaño y requisitos, este modelo se posiciona frente al modelo base BF16 (71,9 GB) y frente a cuantizaciones GGUF de otros MoE, aunque no hay datos concretos para establecer una tabla comparativa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El formato de pesos es propietario de FinchMoE y no es compatible con ningún otro motor de inferencia; el modelo solo puede ejecutarse con el motor proporcionado por el autor.
- Requiere macOS con Metal; no funciona en sistemas Linux, Windows o con GPUs NVIDIA.
- El modelo solo soporta inglés; no hay soporte multilingüe documentado.
- La cuantización de 3 bits en los expertos enrutados puede degradar la calidad en tareas que requieren precisión numérica alta, aunque el autor reporta que la calidad general es aceptable.
- No se incluyen los archivos opcionales de MTP (multi-token prediction), por lo que el modelo no aprovecha esa posible optimización.
- El proyecto parece experimental (0 descargas, 0 likes, creado en agosto de 2026); no hay garantía de mantenimiento ni soporte a largo plazo.
- No se han publicado benchmarks de tareas estándar, por lo que no se puede evaluar el rendimiento en razonamiento, código o matemáticas frente a otros modelos.
- El uso comercial está permitido bajo licencia Apache-2.0, pero se debe verificar la licencia del modelo base Qwen3.6-35B-A3B (que también es Apache-2.0 según la model card).

## Enlaces

- Repositorio del motor FinchMoE: https://github.com/haihengh/finchMoE
- Modelo en HuggingFace: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finchmoe-3bit
- Modelo base (referencia): Qwen/Qwen3.6-35B-A3B (disponible en HuggingFace)
