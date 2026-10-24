# iRx/Swift-Bonsai-2-27B-PQ2-MTP-DFlash2-NInfer-v3

## Resumen

Swift Bonsai 2 27B PQ2 MTP + DFlash2 (NInfer v3) es un artefacto de pesos publicado por el usuario iRx (repack comunitario de NInfer v3, atribuido a "exp20") para el motor de inferencia NInfer. No es un modelo entrenado desde cero: se trata de una conversión y reempaquetado del modelo Swift PQ2, derivado a su vez de Qwen3.8-27B de Alibaba Cloud, con las cabezas MTP (multi-token prediction) y DFlash2 incorporadas por ProCreations a partir de la referencia de z-lab. El repositorio contiene únicamente los pesos en formato nativo de NInfer; el motor de inferencia no se distribuye en él, por lo que el artefacto no es utilizable de forma autónoma sin instalar el runtime por separado.

La relevancia de esta ficha es acotada y conviene ser explícito: se publica como un contenedor de pesos cuantizados en 2 bits (el sufijo PQ2 del nombre, coherente con los 9,5 GB de repositorio para un modelo de 27B) pensado para ejecutar un modelo de esa escala en hardware con VRAM limitada, apoyándose en decodificación especulativa mediante las cabezas MTP y DFlash2 para mitigar la pérdida de velocidad típica de las cuantizaciones agresivas.

La model card es extremadamente escueta: no documenta arquitectura, longitud de contexto, idiomas, datos de entrenamiento ni resultados de evaluación. Las descargas y los "likes" son cero en el momento de la consulta, y el repositorio se creó y actualizó el mismo día (23 de octubre de 2026). Todo lo que no aparece en la información disponible se marca como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base declarado: Qwen3.8-27B de Alibaba Cloud; no se detalla la arquitectura ni se declara que sea MoE) |
| Parámetros totales | 27B (según el nombre del artefacto y el modelo base citado; no verificado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | PQ2 (cuantización de 2 bits, según el nombre del artefacto; el esquema exacto no está documentado) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (con archivos `licenses/LICENSE` y `licenses/NOTICE` en el repositorio) |
| Formato de pesos | Formato nativo de NInfer (no se distribuye en safetensors ni GGUF; el motor de inferencia no está incluido) |
| Tamaño del repositorio | 9,5 GB |
| Cabezas adicionales | MTP (multi-token prediction) y DFlash2 |
| Motor de inferencia | NInfer (runtime y contenedor de WaveCut/iamwavecut y colaboradores de NInfer) |
| Autor del repack | iRx (repack comunitario de NInfer v3, atribuido a exp20) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. El artefacto se presenta como "Swift PQ2 con las cabezas Bonsai MTP y DFlash2", construido sobre Qwen3.8-27B de Alibaba Cloud, con conversión "Swift" a cargo de UkisAI, adaptación de las cabezas MTP y DFlash2 por ProCreations, referencia DFlash2 de z-lab y empaquetado NInfer v3 por exp20 (iRx). La cadena de créditos sugiere un pipeline de conversión y post-procesado sobre un modelo ya entrenado, no un entrenamiento nuevo: no se aportan datos sobre tokens de entrenamiento, composición del corpus, ni fases de RLHF, DPO o ajuste por refuerzo.

El elemento técnico diferencial que sí puede afirmarse es la presencia de dos cabezas auxiliares orientadas a acelerar la generación: MTP (multi-token prediction) y DFlash2. Ambas se asocian habitualmente a técnicas de decodificación especulativa, cuyo objetivo es proponer varios tokens por paso y verificarlos en paralelo para reducir la latencia por token. La model card no especifica la tasa de aceptación, el número de tokens especulados por paso ni la implementación concreta de DFlash2 en este artefacto, por lo que cualquier cifra de speedup sería especulativa. Tampoco se documenta si la cuantización PQ2 se aplicó con calibración, qué capas quedaron en mayor precisión ni si las cabezas auxiliares se conservan en precisión completa.

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base Qwen3.8-27B según la declaración del autor; no se documentan evaluaciones que lo verifiquen en esta cuantización.
- Generación de código: capacidad esperable por el linaje del modelo base, pero no confirmada en la información disponible.
- Decodificación especulativa: incorpora cabezas MTP y DFlash2, pensadas para acelerar la inferencia reduciendo el coste por token.
- Ejecución en VRAM reducida: la cuantización PQ2 (2 bits) permite cargar un modelo de 27B en un espacio de pesos de aproximadamente 9,5 GB.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.
- Visión, audio u otras modalidades: no disponibles; el repositorio no declara componentes multimodales.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Autohospedaje en GPU de consumo: al ocupar los pesos aproximadamente 9,5 GB, el artefacto permite ejecutar un modelo de 27B en tarjetas de 16-24 GB de VRAM con el runtime NInfer, un escenario inviable con pesos en FP16 (que requerirían del orden de 54 GB solo para los pesos). Requiere instalar NInfer por separado.
- Servicio de baja latencia en una sola GPU: las cabezas MTP y DFlash2 están orientadas a decodificación especulativa, de modo que el caso natural es un endpoint de chat o completado con requisitos de latencia ajustados y tolerancia a la pérdida de calidad de una cuantización de 2 bits.
- Prototipado e investigación sobre cuantización extrema: útil como objeto de estudio para medir la degradación real de un modelo de 27B a 2 bits y evaluar la eficacia de MTP/DFlash2 como compensación de velocidad.
- Evaluación comparativa de runtimes: al ser un artefacto específico de NInfer, sirve para comparar throughput y calidad frente a los mismos pesos en GGUF con llama.cpp o en AWQ/GPTQ con vLLM.
- Despliegue en entornos con memoria restringida o en el borde: escenarios donde el presupuesto de VRAM es el factor limitante y se prefiere un modelo grande muy cuantizado frente a un modelo pequeño en mayor precisión.
- Reproducción de artefactos comunitarios: para equipos que auditan cadenas de conversión (Bonsai de Prism ML, conversión Swift de UkisAI, repack de iRx) y necesitan validar que los pesos corresponden al modelo base declarado.
- Fine-tuning o adaptación posterior: no recomendable como caso de uso directo, ya que el formato nativo de NInfer y la cuantización de 2 bits no son compatibles con los pipelines estándar de entrenamiento; habría que partir del modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica de calidad, y tampoco cifras de throughput (tokens/s) o latencia (time-to-first-token) para el runtime NInfer.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,5 GB solo para los pesos; con overhead del runtime y caché KV para contextos cortos, un mínimo realista se sitúa en torno a 11-13 GB. La cifra exacta depende de la longitud de contexto, que no está documentada, y del número de secuencias concurrentes.
- GPU recomendadas: no especificadas por el autor. Por capacidad de memoria, encajan tarjetas de 16 GB o más (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, A100 40/80 GB, H100). Para contexto largo o lotes grandes, se recomienda 24 GB o más.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en modelos de 16 GB o superiores, siempre que el runtime NInfer soporte la GPU y el sistema operativo en cuestión (no verificado en la información disponible).
- Opciones de despliegue: exclusivamente NInfer (contenedor y runtime de WaveCut/iamwavecut y colaboradores), que no se incluye en el repositorio. No hay pesos en safetensors, GGUF ni formatos compatibles con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones del efecto de MTP/DFlash2 ni de la penalización por la cuantización PQ2.
- Almacenamiento: 9,5 GB de repositorio, más el espacio del motor NInfer y de los archivos de licencia y configuración.

## Comparativa con modelos similares

No hay datos de rendimiento ni de contexto en la información disponible para establecer una comparación cuantitativa. La tabla recoge únicamente los atributos verificables del artefacto frente a las alternativas habituales de la misma categoría (pesos cuantizados de un modelo de ~27B para inferencia local), marcando como "no disponible" todo lo que no se ha podido contrastar.

| Modelo / artefacto | Parámetros | Contexto | Cuantización | Licencia | Formato / runtime | Rendimiento |
|---|---|---|---|---|---|---|
| Swift-Bonsai-2-27B-PQ2-MTP-DFlash2-NInfer-v3 (este artefacto) | 27B (declarado) | No disponible | PQ2 (2 bits) | Apache-2.0 | Nativo NInfer | No disponible |
| Qwen3.8-27B (modelo base citado) | 27B (declarado) | No disponible | Pesos originales (no especificado) | No disponible en la información | No disponible | No disponible |
| Alternativas GGUF/AWQ del mismo modelo base | No disponible | No disponible | No disponible | No disponible | GGUF / AWQ-GPTQ | No disponible |
| Artefactos equivalentes de otros modelos ~27-32B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dependencia total del runtime: el repositorio no incluye el motor de inferencia. Sin NInfer instalado y compatible con el hardware, los pesos no son utilizables; no hay ruta de conversión documentada a GGUF, safetensors o formatos estándar.
- Documentación mínima: no se especifican arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción sin pruebas propias.
- Cuantización de 2 bits: es una compresión agresiva; cabe esperar degradación en razonamiento, matemáticas, código y, especialmente, en el seguimiento de instrucciones y el uso de herramientas. No hay benchmarks publicados que cuantifiquen esa pérdida.
- Riesgo de alucinación: no evaluado en este artefacto; la cuantización extrema tiende a incrementarlo, y no se han publicado tasas de error.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio incluye un archivo `NOTICE` con atribuciones a terceros (Prism ML, UkisAI, Alibaba Cloud, ProCreations, z-lab, NInfer) que debe revisarse y conservarse; las condiciones del modelo base Qwen3.8-27B no se detallan en la información disponible.
- Idiomas: sin declaración explícita, no puede asumirse un rendimiento multilingüe fiable, y menos en castellano.
- Validación y procedencia: artefacto comunitario con cero descargas y cero validaciones públicas, creado y actualizado el mismo día; no hay verificación independiente de que los pesos correspondan al modelo base declarado ni de que las cabezas MTP/DFlash2 funcionen según lo previsto.
- Contexto desconocido: planificar el dimensionado de VRAM y de caché KV es imposible sin conocer la ventana máxima soportada.
- Soporte y mantenimiento: al ser un repack de un usuario individual, no hay garantía de actualizaciones, correcciones de errores ni soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/iRx/Swift-Bonsai-2-27B-PQ2-MTP-DFlash2-NInfer-v3
- Licencia del repositorio: https://huggingface.co/iRx/Swift-Bonsai-2-27B-PQ2-MTP-DFlash2-NInfer-v3/blob/main/licenses/LICENSE
- Atribuciones del repositorio: https://huggingface.co/iRx/Swift-Bonsai-2-27B-PQ2-MTP-DFlash2-NInfer-v3/blob/main/licenses/NOTICE
- Proyecto Bonsai (Prism ML): no disponible en la información proporcionada
- NInfer (WaveCut/iamwavecut): no disponible en la información proporcionada
- Referencia DFlash2 (z-lab): no disponible en la información proporcionada
- Modelo base Qwen3.8-27B (Alibaba Cloud): no disponible en la información proporcionada
