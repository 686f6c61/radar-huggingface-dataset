# jancirnodziewiaty/gemma-4-E2B-it-oQ4e-fp16-mtp

## Resumen

`gemma-4-E2B-it-oQ4e-fp16-mtp` es una cuantización mixta del modelo Gemma 4 E2B en su variante instruct, publicada por el usuario jancirnodziewiaty en HuggingFace. El checkpoint está pensado para ejecutarse con MLX, el framework de Apple para inferencia en silicio de la serie M, y combina precisiones de 4, 5, 6 y 8 bits con capas en BF16, FP16 y FP32 para lograr un promedio efectivo de 7,450 bits por peso sobre un total de 5.182 miles de millones de pesos lógicos.

El modelo conserva los componentes multimodales del Gemma 4 E2B original: un tronco de lenguaje de 4.632B parámetros, una torre de visión de 0.167B, una torre de audio de 0.305B y una cabeza MTP (multi-token prediction) de 0.078B. Esa cabeza MTP es precisamente uno de los elementos diferenciales del checkpoint, ya que permite decodificación especulativa nativa para acelerar la generación. El resultado ocupa 4,9 GB en disco, lo que lo hace viable en equipos con memoria unificada modesta.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de cuantización mixta con oQ (oMLX v0.7.3), una técnica que asigna bits de forma no uniforme según la sensibilidad de cada tensor. Por otro, advierte de que se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados en los metadatos, por lo que su uso en producción exige verificar la licencia del modelo base antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; pesos cuantizados para MLX |
| Parámetros totales | 5.104.297.539 (safetensors); 5.182B pesos lógicos según la model card |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 4-bit (grupo 64), 5-bit (grupo 64), 6-bit (grupo 64), 8-bit (grupo 64), BF16, FP16, FP32, I64; promedio efectivo 7,450 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

Desglose de almacenamiento por componente según la model card:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,632B | 2,780 GB / 2,589 GiB |
| Visión | 0,167B | 0,669 GB / 0,623 GiB |
| Audio | 0,305B | 1,219 GB / 1,136 GiB |
| Cabeza MTP | 0,078B | 0,158 GB / 0,147 GiB |
| Total | 5,182B | 4,826 GB / 4,495 GiB |

Distribución de precisión por peso lógico:

| Formato | Pesos lógicos | Porcentaje | Bits efectivos |
|---|---|---|---|
| Affine 4-bit, grupo 64 | 3,484B | 67,237% | 4,50 |
| Affine 5-bit, grupo 64 | 1,016B | 19,599% | 5,50 |
| Affine 6-bit, grupo 64 | 0,077B | 1,480% | 6,50 |
| Affine 8-bit, grupo 64 | 0,055B | 1,062% | 8,50 |
| BF16 | 0,078B | 1,500% | 16,00 |
| FP16 | 0,000B | 0,006% | 16,00 |
| FP32 | 0,472B | 9,112% | 32,00 |
| I64 | 0,000B | 0,005% | 64,00 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del Gemma 4 E2B original ni detalla el proceso de entrenamiento, el número de tokens, la composición del dataset o si hubo RLHF o DPO. Lo que sí se deduce del desglose de componentes es que se trata de un modelo multimodal con torres separadas para visión y audio, un tronco de lenguaje dominante y una cabeza MTP independiente. La presencia de MTP sugiere que el modelo base fue entrenado con un objetivo de predicción multi-token, lo que habilita decodificación especulativa.

La innovación técnica documentada es la cuantización mixta aplicada con oQ (oMLX v0.7.3). En lugar de cuantizar todo el checkpoint a un mismo número de bits, la herramienta asigna 4 bits al 67% de los pesos lógicos, 5 bits al 20%, y reserva BF16, FP16 y, sobre todo, FP32 para el 9,1% de los pesos que probablemente corresponden a capas sensibles como normas, embeddings o parches de visión. El resultado es un promedio de 7,450 bits/peso, superior a un 4-bit uniforme pero con menor degradación esperada en las capas críticas. No se han publicado detalles sobre el calibrado, el dataset de calibración ni métricas de perplejidad tras la cuantización.

## Capacidades

- Generación de texto y razonamiento en la variante instruct del Gemma 4 E2B.
- Procesamiento de imagen gracias a la torre de visión de 0.167B parámetros incluida en el checkpoint.
- Procesamiento de audio gracias a la torre de audio de 0.305B parámetros.
- Predicción multi-token mediante la cabeza MTP de 0.078B, orientada a decodificación especulativa y a reducir la latencia de generación.
- Capacidades multilingües: no disponibles en los metadatos; dependen del modelo base, que no se documenta en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el checkpoint está empaquetado para MLX y ocupa 4,9 GB, por lo que puede cargarse en equipos con memoria unificada de 16 GB o superior y ejecutarse sin GPU dedicada. Es el escenario natural para el que fue creado.
- Prototipado de asistentes multimodales: al incluir torres de visión y audio, permite construir demos que reciben imagen, audio y texto en un solo pipeline sin cambiar de modelo, útil para validar ideas antes de pasar a un despliegue mayor.
- Transcripción y comprensión de audio en local: la torre de audio de 0.305B permite procesar entradas de voz en el mismo equipo, lo que resulta adecuado para aplicaciones de privacidad estricta donde el audio no puede salir del dispositivo.
- Generación de texto asistida con decodificación especulativa: la cabeza MTP puede aprovecharse para acelerar la generación en tareas de escritura o resumen, reduciendo el número de pasos de decodificación necesarios.
- Experimentación con cuantización mixta: el checkpoint sirve como referencia reproducible para estudiar cómo afecta una distribución no uniforme de bits (4/5/6/8/16/32) a la calidad frente a un 4-bit uniforme, comparando perplejidad y salidas.
- Evaluación de viabilidad antes de producción: con cero descargas y sin licencia declarada, es un artefacto adecuado para pruebas internas de rendimiento en MLX, no para servir tráfico real hasta aclarar la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 4,9 GB de almacenamiento en disco; en ejecución, el checkpoint FP32 parcial (1,759 GiB) y las capas BF16 elevan el pico de memoria por encima del tamaño del archivo, por lo que se recomienda un mínimo de 8 GB de memoria unificada y, con holgura para contexto y caché KV, 16 GB.
- GPU recomendadas: Apple Silicon de la serie M (M1, M2, M3, M4 y variantes Pro, Max y Ultra) con memoria unificada de 16 GB o más, dado que la librería es MLX.
- GPU NVIDIA: no es el objetivo del checkpoint; para A100, H100 o RTX 4090 habría que convertir los pesos a otro formato, lo que no está documentado.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí, en cualquier Mac con 16 GB o más de memoria unificada. En el ecosistema NVIDIA no se ha validado.
- Opciones de despliegue: MLX y oMLX son las vías documentadas. vLLM, llama.cpp, Ollama y TGI no están soportados por el formato actual sin conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oQ4e-fp16-mtp | 5,10B (5,182B lógicos) | no disponible | Mixta 4/5/6/8/16/32 bits, 7,450 bits/peso | no disponible | MLX, safetensors |
| Gemma 4 E2B it (base) | no disponible en esta ficha | no disponible | Original sin cuantizar | no disponible | no disponible |
| Cuantización 4-bit uniforme de Gemma 4 E2B | ~5B | no disponible | 4 bits uniformes | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia. No se han identificado alternativas comparables con datos verificables.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base Gemma 4 E2B, por lo que el uso comercial queda sin cobertura legal clara hasta verificarlo en el repositorio original.
- Idiomas no declarados: los metadatos no indican qué idiomas soporta; el rendimiento en castellano no está verificado.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique en esta cuantización.
- Degradación por cuantización: el 67% de los pesos está a 4 bits y el 9,1% en FP32; aunque la mezcla busca preservar capas sensibles, no se han publicado métricas de perplejidad ni comparativas con el modelo original.
- Artefacto sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar su calidad.
- Dependencia de MLX: no es portable a vLLM, llama.cpp, Ollama o TGI sin conversión, lo que limita su uso en servidores Linux con GPU NVIDIA.
- Fecha de creación futura: el repositorio figura creado el 2026-11-02, dato que conviene contrastar antes de confiar en los metadatos.
- Sesgos: no documentados; dependen del dataset de entrenamiento del modelo base, no descrito en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jancirnodziewiaty/gemma-4-E2B-it-oQ4e-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de evaluación o demos adicionales.
