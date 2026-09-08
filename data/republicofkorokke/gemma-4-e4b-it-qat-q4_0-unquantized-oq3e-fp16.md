# RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ3e-fp16

## Resumen

El modelo `RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ3e-fp16` es una cuantización a 3 bits del modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized`, desarrollado por Google DeepMind. Gemma 4 es una familia de modelos abiertos multimodales que procesan texto e imagen, y soportan entrada de audio en las variantes E2B, E4B y 12B. Esta versión cuantizada se distribuye en formato MLX safetensors, diseñada para inferencia eficiente en Apple Silicon.

El modelo base ofrece una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. La cuantización con oQ (oMLX v0.6.4) utiliza precisión mixta con 3 bits y un grupo de 64, lo que reduce el tamaño del repositorio a 5.4 GB. El número total de parámetros es de 7.941.100.874, y por la nomenclatura "E4B" se trata probablemente de un modelo con 4.000 millones de parámetros activos dentro de una arquitectura de mezcla de expertos (MoE), aunque este dato no está confirmado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (MoE probable según nomenclatura "E4B"; no confirmado) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | 4B (según nomenclatura del modelo; no confirmado) |
| Longitud de contexto | 256K tokens (según modelo base) |
| Tipos de cuantizacion | 3 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | Más de 140 idiomas (según modelo base) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización oQ del modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized`. Gemma 4 es una familia de modelos abiertos de Google DeepMind con capacidad multimodal, admitiendo entrada de texto e imagen y, en el caso de E4B, también audio. El modelo base ya fue cuantizado con entrenamiento consciente de cuantización (QAT) en precisión Q4_0. Sobre esa base, se aplicó posteriormente una cuantización mixta a 3 bits con group size 64 mediante la herramienta oQLX v0.6.4.

No se dispone de información detallada sobre los datos de entrenamiento, número de tokens de preentrenamiento ni procesos de ajuste como RLHF o DPO en la documentación proporcionada. La cuantización utiliza la librería MLX, lo que orienta el modelo hacia el ecosistema de Apple Silicon, aunque es posible convertir el formato a otros estándares.

## Capacidades

- Entrada multimodal: el modelo base procesa texto e imagen; la variante E4B admite además entrada de audio.
- Generación de texto en múltiples idiomas: soporta más de 140 idiomas según la información del modelo base.
- Contexto largo: ventana de hasta 256K tokens, adecuada para documentos extensos y conversaciones de múltiples turnos.
- Inferencia optimizada para MLX: la cuantización a 3 bits con formato safetensors reduce el uso de memoria en hardware Apple Silicon.
- No se dispone de datos verificados sobre soporte de tool calling, function calling ni capacidades de razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Análisis de documentos largos multimodales: gracias a la ventana de contexto de 256K tokens, es posible procesar contratos, informes o manuales extensos que combinen texto y gráficos.
- Asistentes multilingües: el soporte en más de 140 idiomas permite construir asistentes para atención al cliente global sin necesidad de modelos separados.
- Inferencia local en Apple Silicon: la cuantización MLX a 3 bits reduce la huella de memoria, haciéndolo adecuado para prototipos y aplicaciones en Mac con Apple Silicon.
- Transcripción y análisis de audio: la variante E4B admite entrada de audio, lo que habilita aplicaciones de transcripción y análisis de contenido hablado.
- Razonamiento sobre imágenes: la entrada de imagen permite analizar capturas, diagramas, fotografías y otro contenido visual para tareas de descripción o extracción de información.
- Prototipado rápido para investigación: con un tamaño de repositorio de 5.4 GB, es apto para experimentos en equipos de consumo, facilitando pruebas de concepto sin infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 5.4 GB; la memoria necesaria para inferencia no se especifica, aunque una cuantización de 3 bits suele requerir menos del tamaño en disco.
- Plataforma recomendada: Apple Silicon mediante MLX, donde la memoria unificada agrupa CPU y GPU.
- Se desconoce si el modelo puede ejecutarse en GPUs NVIDIA o AMD sin conversión adicional.
- Opciones de despliegue: el formato actual es MLX. Para otros entornos sería necesaria una conversión a GGUF u otro formato compatible, no documentada en la información.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato |
|---|---|---|---|---|
| RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ3e-fp16 | 7.94B totales | 256K tokens | 3 bits (oQ) | MLX safetensors |
| google/gemma-4-E4B-it-qat-q4_0-unquantized (base) | No disponible | 256K tokens | Q4_0 (QAT) | Safetensors (probablemente no MLX) |
| google/gemma-4-E4B (modelo original) | No disponible | 256K tokens | Sin cuantizar | No disponible |

No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- La licencia no está publicada, por lo que el uso comercial no puede verificarse a partir de la información disponible.
- Se desconocen los sesgos inherentes al modelo, así como su comportamiento en escenarios de producción.
- La cuantización a 3 bits puede degradar la calidad de las respuestas en comparación con el modelo sin cuantizar o con cuantizaciones de mayor precisión.
- El repositorio tiene 0 descargas y 0 me gusta, lo que indica que es una versión experimental con poca validación externa.
- No se dispone de información sobre tool calling, function calling ni capacidades de agente; esto limita su uso en pipelines automatizadas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/RepublicOfKorokke/gemma-4-E4B-it-qat-q4_0-unquantized-oQ3e-fp16
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Colección QAT de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
