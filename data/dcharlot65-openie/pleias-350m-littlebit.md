# dcharlot65-openie/PleIAs-350M-LittleBit

## Resumen

PleIAs-350M-LittleBit es un checkpoint de pesos "vivos" (living weights) publicado por el usuario dcharlot65-openie, derivado del modelo base PleIAs/Pleias-350m-Preview (un transformer de 353.424.384 parámetros). No se trata de un modelo nuevo entrenado desde cero, sino de una reformulación del mismo modelo en un formato propietario orientado a JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y con despliegue nativo en Kubernetes (JouleKube). La técnica de compresión combina LittleBit-2 (representación en planos de bits de 2 dimensiones) con Sakana SVF (Singular Value Fine-tuning).

El resultado es un artefacto de 4,83 MB que representa el modelo completo comprimido con zstd y CRC32, frente a los 674,10 MB que ocuparía el mismo modelo en FP16, lo que supone una reducción de 139,62x y una media de 0,0529 bits por peso (BPW), es decir, muy por debajo de 1 bit. El repositorio contiene 183 tensores en planos de bits 2D y 53 vectores 1D (LayerNorm, bias y depthwise).

Su relevancia es fundamentalmente experimental: explora hasta qué punto un modelo de 350M puede almacenarse y servirse con un consumo de memoria mínimo dentro de un stack concreto (JouleDB v0.2.4+). La información pública disponible es muy limitada y no incluye datos sobre calidad de inferencia, evaluación o idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de PleIAs/Pleias-350m-Preview); pesos en formato LittleBit-2 ⊕ Sakana SVF |
| Parametros totales | 353.424.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (0,0529 BPW medio); planos de bits 2D + vectores 1D; compresion zstd con CRC32 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB), 2D bitplane tensors y vectores 1D; no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo PleIAs/Pleias-350m-Preview, un transformer de 353M parámetros del que este checkpoint es un finetune/reformateo. La innovación no está en el entrenamiento sino en la representación de los pesos: se aplica una factorización LittleBit-2 que descompone los tensores en 183 planos de bits bidimensionales, complementada con Sakana SVF (Singular Value Fine-tuning) para la adaptación de bajo rango. Los 53 tensores restantes son vectores 1D correspondientes a LayerNorm, bias y capas depthwise.

El artefacto final se serializa en formato `.jsyn` con compresión zstd y verificación CRC32, alcanzando 4,83 MB. El runtime asociado es JouleDB v0.2.4+, descrito por el autor como un motor de inferencia sin PyTorch, con soporte de despliegue nativo en Kubernetes (JouleKube) y una capa de base de datos "termodinámica". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base PleIAs/Pleias-350m-Preview, aunque no se documenta su calidad tras la compresión sub-1-bit.
- Razonamiento y código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: el formato está diseñado para ejecutarse dentro del ecosistema JouleDB/JouleKube, con inferencia sin PyTorch y despliegue en Kubernetes.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Despliegue en clústeres Kubernetes con restricciones extremas de almacenamiento: el artefacto de 4,83 MB permite distribuir el modelo en imágenes de contenedor o volúmenes mínimos mediante JouleKube, útil para entornos edge o nodos con cuotas de disco muy ajustadas.
- Experimentación con compresión sub-1-bit: sirve como banco de pruebas para investigar la viabilidad de pesos por debajo de 1 bit por parámetro en modelos de 350M y medir la degradación de calidad.
- Servicio de inferencia sin PyTorch: para equipos que quieran eliminar la dependencia de PyTorch del stack de producción y usar el runtime de JouleDB, reduciendo el tamaño de la imagen y la superficie de dependencias.
- Pruebas de integración de JouleDB v0.2.4+: permite validar el flujo `hf_pull` y el servidor HTTP local (`jouledb serve`) en pipelines de CI antes de adoptar el stack.
- Investigación sobre formatos de pesos alternativos: comparar el rendimiento de `.jsyn` frente a GGUF o safetensors en tareas de carga, latencia y uso de memoria.
- Prototipado de agentes ligeros en entornos con memoria limitada: si la calidad del modelo base se conserva tras la compresión, podría usarse para tareas simples de generación de texto en dispositivos con pocos recursos, aunque esto no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto en disco ocupa 4,83 MB, pero el runtime debe descomprimir y materializar los pesos para la inferencia; el requisito real de memoria no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: JouleDB v0.2.4+ (runtime propio sin PyTorch), con servidor HTTP (`jouledb serve --http-addr 127.0.0.1:8080`) y despliegue en Kubernetes mediante JouleKube. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PleIAs-350M-LittleBit | 353.424.384 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| PleIAs/Pleias-350m-Preview | ~350M | no disponible | safetensors (presumiblemente) | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas de 350M en formato GGUF | ~350M | no disponible | GGUF | variable | Hugging Face / llama.cpp |

La comparación directa con otras alternativas de la misma categoría no está disponible en la información proporcionada, ya que no se documentan métricas de rendimiento ni características del modelo base más allá de su tamaño.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad tras la compresión sub-1-bit: se desconoce la degradación respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de 350M, aunque no se documenta específicamente.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Dependencia total del ecosistema JouleDB: no hay soporte documentado para runtimes estándar (vLLM, llama.cpp, TGI, transformers), lo que limita la portabilidad.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: madurez y mantenimiento no verificables.
- El modelo base PleIAs/Pleias-350m-Preview es una "Preview", lo que puede implicar inestabilidad o falta de soporte a largo plazo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la atribución al modelo base y las condiciones del runtime JouleDB, que no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/PleIAs-350M-LittleBit
- Modelo base: https://huggingface.co/PleIAs/Pleias-350m-Preview
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
