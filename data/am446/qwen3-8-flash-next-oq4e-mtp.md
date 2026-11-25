# am446/Qwen3.8-Flash-Next-oQ4e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ4e-mtp es una cuantización mixta de precisión en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario am446. El modelo base es una vista previa experimental de la arquitectura que Qwen empleará en su próxima generación (Qwen4): un modelo de lenguaje y visión de tipo mezcla de expertos (MoE) con 125B parámetros en el backbone y 6B activados por token, complementado con un embedding de n-gramas de 51B parámetros y un módulo de predicción multi-token (MTP) de 4B. En total, el checkpoint suma 180.000 millones de parámetros lógicos.

La arquitectura combina Gated DeltaNet con Qwen Sparse Attention (QSA) y flujos de residuo con compuertas (Gated Residual streams), una propuesta híbrida que busca reducir el coste de atención en contextos largos manteniendo la calidad del transformer clásico. El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas multimodales de imagen y texto.

Esta versión concreta aplica la herramienta oQ (oMLX v0.8.0) con cuantización mixta sensible a la capa, logrando una media efectiva de 4,785 bits por peso en el checkpoint completo y 4,661 bits en el backbone. El resultado ocupa 107,67 GB en disco (100,275 GiB), lo que lo hace desplegable en hardware Apple Silicon de gama alta con memoria unificada amplia. Es relevante porque permite probar una arquitectura de próxima generación en formato MLX sin necesidad de los pesos BF16 completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams; incluye embedding de n-gramas y cabecera MTP |
| Parametros totales | 180.000.000.000 (180B logicos) |
| Parametros activos | 6B (backbone MoE); 125B en el backbone de lenguaje |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta: affine 4-bit grupo 64, affine 8-bit grupo 64 y 128, BF16, n-gram affine 4-bit grupo 32; media efectiva 4,785 bits/peso (4,661 en backbone) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos multimodal que combina dos mecanismos de atención: Gated DeltaNet, una variante de atención lineal con estado recurrente compuertado, y Qwen Sparse Attention (QSA), que restringe el cálculo de atención a un subconjunto de tokens. Sobre esta base se añaden flujos de residuo con compuertas (Gated Residual streams), que modulan la contribución de cada bloque a la representación final. El backbone de lenguaje concentra 125,744B parámetros lógicos, de los cuales 6B se activan por token. El checkpoint incorpora además un embedding de n-gramas de 51,2B parámetros, un codificador visual de 0,449B y una cabecera MTP de 2,607B.

La cuantización oQ4e asigna bits según la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (1024 muestras × 512 tokens) y un reajuste por mínimos cuadrados ponderados de escala y sesgo. La distribución resultante es: 123,313B pesos en affine 4-bit grupo 64 (68,5 % del total, 64,600 GiB), 4,731B en affine 8-bit grupo 64 (2,6 %, 4,681 GiB), 0,241B en affine 8-bit grupo 128 (0,13 %, 0,231 GiB), 0,516B en BF16 (0,29 %, 0,961 GiB) y 51,2B en n-gram affine 4-bit grupo 32 (28,4 %, 29,802 GiB). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline image-text-to-text indica soporte de entradas de imagen y texto combinadas.
- Procesamiento de lenguaje natural conversacional, según la etiqueta "conversational" del repositorio.
- Predicción multi-token (MTP): la cabecera de 2,607B parámetros permite decodificación especulativa o generación de varios tokens por paso, lo que puede acelerar la inferencia.
- Embedding de n-gramas de gran tamaño (51,2B parámetros) para representaciones léxicas enriquecidas.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación de arquitecturas de próxima generación: el modelo permite experimentar con Gated DeltaNet, QSA y Gated Residual streams en un entorno MLX, sin necesidad de disponer de los pesos BF16 completos, para estudiar el comportamiento de la atención lineal y dispersa en tareas de lenguaje.
- Evaluación de cuantización mixta: sirve para medir la degradación de calidad de oQ4e frente al modelo base en tareas de razonamiento y generación, dado que el autor documenta la distribución de bits por capa y la matriz de importancia empleada.
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede emplearse para extraer y resumir información de capturas, diagramas o documentos escaneados acompañados de instrucciones textuales.
- Prototipado de asistentes conversacionales en Apple Silicon: el formato MLX y los 100,275 GiB de almacenamiento permiten ejecutar el modelo en equipos con memoria unificada amplia (por ejemplo, Mac Studio con 128 GB o más) para pruebas de conversación multi-turno.
- Experimentación con decodificación especulativa: la cabecera MTP integrada facilita probar técnicas de generación acelerada y comparar su latencia frente a la decodificación autoregresiva estándar.
- Estudio de representaciones léxicas: el embedding de n-gramas de 51,2B parámetros puede analizarse de forma aislada para investigar cómo influye en la calidad de la generación y en el coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el checkpoint ocupa 100,275 GiB (107,67 GB) en disco; para inferencia en MLX se necesita memoria unificada suficiente para cargar los pesos más el estado de activaciones y caché, por lo que se recomienda un mínimo de 128 GB y preferiblemente 192 GB o más.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M2 Ultra, M3 Ultra o M4 Max con 128 GB o más); el formato MLX no está pensado para GPU NVIDIA, por lo que A100 o H100 no son el objetivo de este checkpoint.
- Cabe en GPU de consumo: no en GPU dedicadas convencionales de 24 GB o 48 GB; requiere un equipo Apple Silicon de gama alta con memoria unificada de al menos 128 GB.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantización y ejecución del autor); vLLM, llama.cpp, Ollama o TGI no soportan este formato de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mtp (este) | 180B logicos (6B activos) | no disponible | MLX safetensors, 4,785 bits/peso | Qwen Community License 1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | 180B logicos (6B activos) | no disponible | safetensors BF16 | Qwen Community License 1.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma familia o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo base es una vista previa experimental ("experimental preview") de la arquitectura de Qwen4; su comportamiento en producción no está validado y puede cambiar en versiones posteriores.
- La cuantización a 4,785 bits/peso introduce error respecto al modelo BF16; aunque oQ4e reduce ese error mediante matrices de importancia, no se han publicado evaluaciones de degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible; la model card no especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: Qwen Community License 1.0 puede imponer condiciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en producción.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es compatible con ecosistemas CUDA ni con servidores de inferencia estándar como vLLM o TGI.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 25 de noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- El autor indica que una versión anterior fue recuantizada con oMLX 0.8.0; conviene verificar que se descarga la versión actualizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/am446/Qwen3.8-Flash-Next-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
