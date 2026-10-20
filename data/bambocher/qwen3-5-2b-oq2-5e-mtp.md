# bambocher/Qwen3.5-2B-oQ2.5e-mtp

## Resumen

`bambocher/Qwen3.5-2B-oQ2.5e-mtp` es un checkpoint cuantizado en precisión mixta del modelo Qwen3.5-2B, publicado por el usuario bambocher mediante la herramienta oQ (oMLX v0.7.1rc1). No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos comprimidos: el repositorio contiene 2.274.069.824 parámetros lógicos almacenados en 1.413 GiB, con una media efectiva de 5,338 bits por peso. El objetivo es ejecutar un modelo multimodal de ~2B en hardware Apple Silicon con un consumo de memoria muy reducido.

El checkpoint conserva tres componentes diferenciados: el modelo de lenguaje (1,882B parámetros), una torre de visión (0,331B) y una cabeza MTP (multi-token prediction, 0,061B). La presencia de visión y de cabeza MTP indica que el modelo base es multimodal y que incorpora decodificación multi-token, una técnica habitual para acelerar la generación especulativa.

Su relevancia es acotada y muy específica: es una pieza de infraestructura para experimentación local en macOS, no un modelo de referencia. Con 6 descargas y 0 likes en el momento de la consulta, y sin model card que declare licencia, idiomas o contexto, debe tratarse como un artefacto técnico a validar antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5`), multimodal con torre de visión y cabeza MTP; detalles de capas y atención no disponibles |
| Parámetros totales | 2.274.069.824 (2,274B): 1,882B lenguaje + 0,331B visión + 0,061B cabeza MTP |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Precisión mixta afín (affine) con grupo de 64: bloques de 2, 4, 5, 6 y 8 bits más pesos en BF16; media efectiva de 5,338 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | `safetensors` en formato MLX (`library_name: mlx`), cuantización afín con grupo 64 |
| Tamaño del repositorio | 1,5 GB (1.413 GiB de pesos) |
| Librería de inferencia | MLX |
| Pipeline declarado | No disponible |

Distribución de la cuantización por bloques, según la model card:

| Formato de almacenamiento | Pesos lógicos | % del total | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 2 bits, grupo 64 | 1,335B | 58,698% | 0,388 GiB | 2,50 |
| Afín 4 bits, grupo 64 | 0,034B | 1,476% | 0,018 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 0,470B | 20,657% | 0,301 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 0,095B | 4,197% | 0,072 GiB | 6,50 |
| Afín 8 bits, grupo 64 | 0,000B | 0,004% | 0,000 GiB | 8,50 |
| BF16 | 0,340B | 14,967% | 0,634 GiB | 16,00 |
| **Total** | **2,274B** | **100%** | **1,413 GiB** | **5,338** |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento: no hay datos sobre número de tokens, composición del corpus, fases de RLHF/DPO ni proceso de alineamiento. Lo único verificable es la estructura del checkpoint, que combina un tronco de lenguaje de 1,882B parámetros, un codificador visual de 0,331B y una cabeza de predicción multi-token de 0,061B. La etiqueta `qwen3_5` sitúa el linaje en la familia Qwen3.5 de Alibaba, pero el repositorio no incluye enlaces al modelo base ni a su model card, por lo que no se puede confirmar la versión exacta de partida.

La innovación técnica del artefacto es la estrategia de cuantización, no la arquitectura. oQ asigna precisión de forma no uniforme: el 58,7% de los pesos lógicos (1,335B) se comprime a 2 bits, mientras que el 15% restante se mantiene en BF16 y un 20,7% en 5 bits. Este reparto asimétrico busca proteger las capas sensibles a la cuantización agresiva. La torre de visión ocupa 0,617 GiB de los 1,413 GiB totales pese a representar solo el 14,6% de los parámetros, lo que sugiere que se ha preservado en mayor precisión que el tronco de lenguaje. La cabeza MTP, de solo 0,047 GiB, se mantiene como componente separado para permitir decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-2B (sin evaluación publicada en este checkpoint).
- Procesamiento de imagen: la presencia de una torre de visión de 0,331B implica capacidades multimodales de entrada visual.
- Predicción multi-token mediante la cabeza MTP, orientada a acelerar la decodificación especulativa.
- Ejecución local en Apple Silicon a través de MLX, con huella de memoria inferior a 1,5 GB en pesos.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades de audio: no disponible; no hay componente de audio en el desglose de pesos.

## Casos de uso

- **Prototipado de asistentes multimodales en macOS**: el checkpoint se carga con MLX en un Mac con chip de la serie M y permite iterar sobre prompts de imagen+texto sin depender de la nube, con un consumo de pesos de 1,413 GiB.
- **Extracción de información de documentos escaneados**: la torre de visión permite pasar capturas o páginas renderizadas y obtener texto estructurado; útil para pipelines internos de digitalización donde la privacidad impide usar APIs externas.
- **Evaluación de técnicas de cuantización mixta**: sirve como caso de estudio reproducible para medir la degradación de un modelo 2B al comprimir el 58,7% de sus pesos a 2 bits, comparándolo contra el checkpoint BF16 del mismo modelo base.
- **Banco de pruebas de decodificación especulativa**: la cabeza MTP separada permite experimentar con generación multi-token en MLX y medir la aceleración frente a decodificación autoregresiva clásica.
- **Generación de descripciones de imagen en local**: captioning automático para catalogación de fotos o assets en flujos de trabajo de diseño, ejecutado íntegramente en el portátil del usuario.
- **Docencia y demos de IA en el dispositivo**: al caber en cualquier Mac con 8 GB de memoria unificada, permite mostrar en clase el funcionamiento de un modelo multimodal cuantizado sin infraestructura de servidor.
- **Prefiltrado en pipelines de clasificación visual**: usar el modelo como primer filtro barato (descartar imágenes irrelevantes) antes de enviar el resto a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la distribución de bits y el tamaño de almacenamiento; no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto. Los resultados de la búsqueda web realizada no guardan relación con este modelo y no aportan datos de rendimiento.

## Requisitos de hardware

- **Pesos en memoria**: 1,413 GiB para el checkpoint completo (0,749 GiB de lenguaje, 0,617 GiB de visión, 0,047 GiB de cabeza MTP).
- **Memoria total estimada para inferencia**: del orden de 2 a 3 GB de memoria unificada con contextos cortos, sumando pesos, caché KV y overhead del runtime de MLX (estimación aritmética, no medida publicada).
- **Hardware compatible**: exclusivamente Apple Silicon (M1 o posterior), ya que el formato de pesos es MLX. No hay pesos GGUF ni safetensors estándar en el repositorio.
- **GPU NVIDIA/AMD**: no utilizables directamente con estos pesos; requerirían de-cuantización y reconversión a otro formato, proceso no documentado por el autor.
- **Cabe en GPU de consumo**: sí, en el sentido de que cabe en cualquier Mac moderno; en el ecosistema NVIDIA no aplica sin conversión previa.
- **Opciones de despliegue**: `mlx-lm` / `mlx-vlm` sobre macOS. vLLM, TGI, llama.cpp y Ollama no soportan este formato de cuantización afín de MLX de forma directa.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos comparables en la información proporcionada (ni parámetros, ni contexto, ni benchmarks de alternativas). La única comparación posible es interna, frente al hipotético checkpoint BF16 del mismo modelo base:

| Versión | Parámetros | Almacenamiento | Bits/peso | Formato | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (oQ 2.5e) | 2,274B | 1,413 GiB | 5,338 | MLX safetensors | No disponible |
| Mismo modelo en BF16 (estimación aritmética: 2,274B × 2 bytes) | 2,274B | ~4,55 GB | 16,00 | Safetensors | No disponible |
| Alternativas de ~2B multimodal (Qwen-VL, SmolVLM, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

La reducción de almacenamiento frente a BF16 es de aproximadamente un 69%, a costa de comprimir a 2 bits más de la mitad de los pesos lógicos.

## Limitaciones y advertencias

- **Licencia sin declarar**: la model card no especifica licencia. Sin ella, no hay base legal clara para uso comercial; heredar la licencia del modelo base Qwen3.5 requeriría confirmar cuál es, y el repositorio no enlaza a él.
- **Discrepancia en el nombre**: el sufijo `oQ2.5e` sugiere un objetivo de ~2,5 bits efectivos, pero la media real declarada es de 5,338 bits/peso. Conviene no asumir el tamaño que el nombre indica.
- **Cuantización agresiva no evaluada**: el 58,7% de los pesos está a 2 bits y no se publica ninguna comparación de calidad frente al modelo original. Es esperable degradación en razonamiento, matemáticas y seguimiento de instrucciones largas, pero su magnitud es desconocida.
- **Riesgo de alucinación**: no medido ni documentado; en modelos pequeños con cuantización de 2 bits este riesgo tiende a agravarse.
- **Contexto desconocido**: no se declara la ventana de contexto, lo que impide planificar cargas de trabajo con documentos largos.
- **Idiomas desconocidos**: no hay lista de idiomas soportados; el rendimiento en castellano no está verificado y podría ser deficiente tras la compresión.
- **Ausencia total de benchmarks**: 6 descargas y 0 likes indican que el checkpoint no ha pasado por revisión comunitaria; no hay evidencia externa de su calidad.
- **Dependencia de plataforma**: el formato MLX limita el uso a Apple Silicon y a versiones concretas de `mlx` / `mlx-lm`; la compatibilidad con futuras versiones de oMLX no está garantizada.
- **Trazabilidad del autor**: es una publicación de un usuario individual, no del equipo de Qwen; no hay garantía de mantenimiento ni de corrección de errores.
- **Reproducibilidad**: no se documentan los parámetros exactos de cuantización por capa ni el script de conversión, lo que dificulta reproducir el checkpoint.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ2.5e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-2B: no disponible (no referenciado en la model card)
- Paper, blog o demo oficial: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes para este modelo.
