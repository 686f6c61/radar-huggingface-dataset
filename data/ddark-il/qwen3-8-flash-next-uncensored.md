# ddark-il/Qwen3.8-Flash-Next-Uncensored

## Resumen

Qwen3.8-Flash-Next-Uncensored en versión MLX es una cuantización de precisión mixta del checkpoint `orcarouter/Qwen3.8-Flash-Next-Uncensored`, un modelo de arquitectura `qwen4_exp` con 179.999.981.459 parámetros (aproximadamente 180B) y capacidades de visión-lenguaje. Lo publica el usuario ddark-il y está específicamente dimensionado para ejecutarse en un Apple M5 Max con 128 GB de memoria unificada, con soporte de contexto de hasta 262.000 tokens. La relevancia de esta ficha radica en que demuestra una técnica de cuantización poco habitual: búsqueda de rangos por grupo en lugar del redondeo min/max que aplica `mx.quantize` por defecto, con métricas de error medidas tensor a tensor.

El artefacto ocupa 109,29 GB en disco con una media de 4,857 bits por peso (bpw), lo que supone una compresión de 3,29 veces respecto a los 360 GB del modelo en bf16. La distribución de bits no es uniforme: los expertos enrutados y la tabla n-gram usan 4 bits, mientras que módulos como `o_proj` se elevan a 8 bits con grupo de 64 para reducir el error. El modelo incluye una cabeza MTP (multi-token prediction) en un sidecar separado, lo que habilita decodificación especulativa.

La licencia declarada es Apache 2.0, aunque el pipeline es `image-text-to-text` y la librería es MLX, lo que limita el despliegue a hardware Apple Silicon. No se dispone de información sobre los idiomas soportados ni de resultados de benchmarks de capacidad (MMLU, HumanEval, etc.) en la información proporcionada; las métricas publicadas son exclusivamente de fidelidad de cuantización frente al modelo bf16 de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con visión-lenguaje, base `qwen4_exp`; incluye cabeza MTP y mecanismo de hyper-connections e indexador disperso |
| Parametros totales | 179.999.981.459 (aproximadamente 180B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.000 tokens (según el autor, dimensionado para M5 Max 128 GB) |
| Tipos de cuantizacion | MLX affine de precisión mixta: 4 bits gs64 (expertos enrutados, por defecto), 4 bits gs32 (tabla n-gram PLE), 6 bits y 8 bits gs64 en módulos seleccionados; media 4,857 bpw; 743 módulos cuantizados, 599 entradas explícitas por módulo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (21 shards `model-00001…00021-of-00021` más sidecar `model-mtp.safetensors` con 58 tensores); empaquetado U32 con `scales` y `biases` en bf16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con capacidades de visión-lenguaje, identificado en los tags como `qwen4_exp`. La model card menciona componentes específicos: expertos enrutados, una tabla n-gram PLE (probablemente *piece-level embedding* o similar) que representa una parte sustancial del peso, un indexador disperso, hyper-connections y una cabeza MTP para predicción multi-token. Los tensores de normas, routers, hyper-connections, indexador disperso y `linear_fc2` de visión se mantienen en precisión exacta (bit-idénticos al origen), lo que sugiere que el autor consideró críticos esos módulos para la estabilidad numérica.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el checkpoint original. La innovación técnica destacable de esta versión es puramente de cuantización: en lugar de derivar el rango afino de cada grupo a partir del mínimo y el máximo (lo que hace que un valor atípico desperdicie niveles), se realiza una búsqueda multi-paso sobre rejillas uniformes puntuada en bf16, el formato realmente almacenado. Esta búsqueda se aplica a las dos tablas de 4 bits (expertos enrutados y n-gram PLE), que concentran el 91 % de los bytes; los módulos de 6 y 8 bits usan la búsqueda de recorte de factor de borde del propio runtime. Además, `o_proj` se elevó de 6 a 8 bits con grupo 64, con un coste de 44 MB y una reducción de error de 3,1 veces en ese módulo. La cabeza MTP es byte-idéntica a la versión v1, por lo que la aceptación especulativa no se ve afectada por construcción.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline `image-text-to-text` y los tags `conversational`.
- Procesamiento de imagen y texto conjuntamente (visión-lenguaje), con módulos de visión cuantizados selectivamente (`linear_fc1` a 8 bits, `linear_fc2` en precisión exacta).
- Razonamiento de múltiples pasos y uso de herramientas: no confirmado explícitamente en la información disponible; el modelo base es de la familia Qwen, pero la model card no detalla soporte de *tool calling* ni de agentes.
- Decodificación especulativa mediante cabeza MTP incluida en sidecar separado.
- Contexto largo de hasta 262.000 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Capacidades multilingües: no disponible.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Asistente conversacional de contexto largo en estación de trabajo Apple: con 262.000 tokens de ventana y 109,29 GB en disco, el modelo puede mantener conversaciones con documentos completos cargados en contexto, ejecutándose localmente en un M5 Max de 128 GB sin depender de la nube.
- Análisis de documentos con imágenes en local: al ser `image-text-to-text`, permite extraer información de capturas, diagramas o páginas escaneadas junto con el texto, útil en entornos con requisitos de privacidad donde no se permite enviar datos a APIs externas.
- Prototipado de agentes con decodificación especulativa: la cabeza MTP byte-idéntica permite acelerar la generación en tareas de razonamiento multi-paso, siempre que el runtime MLX explote el sidecar MTP.
- Investigación en cuantización: el artefacto sirve como referencia reproducible para estudiar el impacto de la búsqueda de rangos por grupo frente al redondeo min/max, con métricas de rel-L2 por tensor y acuerdo top-1 frente a un oráculo bf16.
- Evaluación de fidelidad de modelos cuantizados: con un 90,7 % de acuerdo top-1 y una JSD media de 0,0575 frente al endpoint bf16, es adecuado para comparar técnicas de cuantización en un modelo de 180B sin necesidad de infraestructura multi-GPU.
- Generación de código y texto técnico en local: aunque no hay benchmarks publicados, el tamaño de 180B y el contexto largo permiten abordar tareas de generación y revisión de código en un equipo de sobremesa, con la salvedad de que la latencia dependerá del ancho de banda de memoria del M5 Max.
- Despliegue de demostraciones privadas: al ser Apache 2.0 y ejecutarse íntegramente en local, facilita demos internas con datos sensibles sin exposición a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de fidelidad de cuantización frente al checkpoint bf16 de origen:

| Métrica | v1 | v2 (este modelo) |
|---|---|---|
| Media ponderada rel-L2 vs fuente bf16 | 0,01890 | 0,01768 (−6,5 %) |
| Tensores mejorados / empeorados | — | 23 / 0 |
| `o_proj` rel-L2 | 0,0242 | 0,0073 (−69,8 %) |
| Expertos enrutados rel-L2 (4 bits) | 0,0969 | 0,0913 (−5,8 %) |
| Tabla n-gram rel-L2 (4 bits gs32) | 0,0808 | 0,0733 (−9,3 %) |
| Acuerdo top-1 con oráculo bf16 | 81,5 % | 90,7 % |
| Distancia de distribución (JSD media) | 0,0736 | 0,0575 |
| JSD p99 | 0,1984 | 0,1868 |

El autor también reporta mediciones de error por módulo para alternativas de formato: a los mismos bits nominales, `mxfp4` mide un 26 % peor, `nvfp4` un 22 % peor y `mxfp8` un 250 % peor que el formato affine con `(scale, bias)` libre por grupo. Asimismo, indica que una reasignación de `(scale, bias)` puntuada tras el cast a bf16 reduciría un 20 % el error de los módulos de 8 bits sin coste de tamaño, y que pasar los expertos enrutados a 5 bits gs128 reduciría un 31,6 % el error ponderado a cambio de +11,3 GB.

## Requisitos de hardware

- VRAM/memoria unificada: el autor dimensiona el artefacto para un Apple M5 Max con 128 GB. Del archivo de 109,29 GB, solo unos 76,9 GB quedan residentes, mientras que la tabla n-gram se pagina vía `mmap`. Pasar los expertos a 5 bits gs128 elevaría la residencia de 76,9 a 88,2 GB.
- GPU recomendadas: Apple Silicon M5 Max de 128 GB es el objetivo declarado. No se documenta soporte para A100, H100 ni RTX 4090; la librería es MLX, específica de Apple Silicon.
- Cabe en GPU de consumo: no en GPUs NVIDIA de consumo; en Apple Silicon, requiere un M5 Max de 128 GB. No hay datos sobre modelos inferiores.
- Opciones de despliegue: runtime MLX (librería `mlx`), con tags `omlx` y `nax` que sugieren integración con el stack MLX de Apple. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato affine empaquetado en U32 no es directamente compatible con GGUF.
- Latencia y throughput: no disponibles. El autor señala que la decisión sobre configuraciones alternativas requiere medir tok/s y volumen de lectura de SSD en una sesión real, y menciona que los expertos a 5 bits implicarían transmitir 1,33 → 1,55 GB de pesos por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddark-il/Qwen3.8-Flash-Next-Uncensored (este) | 180B | 262k | MLX affine mixta 4,857 bpw, 109,29 GB | Apache 2.0 | Hugging Face, solo Apple Silicon |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | 180B | no disponible | bf16, 360 GB | Apache 2.0 | Hugging Face |
| v1 del mismo autor (revisión anterior) | 180B | 262k | MLX affine mixta, 109,24 GB aprox. | Apache 2.0 | Hugging Face (sustituida por v2) |

No se dispone de información sobre otros modelos de 180B comparables en la misma categoría (visión-lenguaje, MoE, ejecutables en Apple Silicon) dentro de la documentación proporcionada. La comparativa se limita al modelo base y a la revisión previa del propio autor.

## Limitaciones y advertencias

- El nombre incluye "Uncensored", lo que implica que el checkpoint base ha sido sometido a un proceso de eliminación o atenuación de rechazos de seguridad; esto puede aumentar el riesgo de generar contenido dañino, sesgado o inexacto y exige filtros adicionales en producción.
- Riesgo de alucinación: no hay benchmarks de capacidad publicados que permitan acotarlo; el acuerdo top-1 del 90,7 % frente al oráculo bf16 mide fidelidad de cuantización, no veracidad.
- La cuantización introduce un error medio rel-L2 de 0,01768 frente a bf16; en los expertos enrutados el error rel-L2 es de 0,0913, notablemente superior, lo que puede afectar a tareas que dependan de conocimiento factual almacenado en esos expertos.
- El autor advierte de una salvedad en la verificación de nivel de salida: el acuerdo se midió contra un endpoint bf16 alojado, no contra el checkpoint bf16 ejecutado localmente, por lo que puede haber diferencias de tokenizador o de plantilla de chat.
- Restricción de hardware: requiere Apple Silicon con MLX y, para el contexto completo de 262k, un M5 Max de 128 GB; no es desplegable en GPUs NVIDIA con los runtimes habituales.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés o del chino sin evaluación previa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar condiciones adicionales no reflejadas en esta ficha; conviene verificar el repositorio de origen.
- El rendimiento real (tok/s) no está medido; la paginación de la tabla n-gram vía `mmap` puede provocar latencias variables según la presión de caché y la velocidad del SSD.
- La fecha de creación (2026-08-31) y la de actualización (2026-11-15) son posteriores a la fecha actual de referencia, lo que sugiere que los metadatos podrían ser inconsistentes; conviene contrastar el estado real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddark-il/Qwen3.8-Flash-Next-Uncensored
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Documentación de MLX: no disponible en la información proporcionada
- Paper o blog técnico del autor: no disponible en la información proporcionada
- Repositorio de código o demos: no disponible en la información proporcionada
