# Shadow0482/personaplex-7b-v1-q4

## Resumen

PersonaPlex-7B-v1 Q4 es una cuantización de solo pesos (weight-only) en int4 con tamaño de grupo 64 del modelo `nvidia/personaplex-7b-v1`, un modelo de voz a voz full-duplex construido sobre la arquitectura Moshi. Lo publica el usuario Shadow0482 en Hugging Face y su objetivo es reducir el peso en disco y en transferencia del checkpoint original en BF16 (unos 16,74 GB) hasta aproximadamente 5,17 GB, manteniendo el resto de artefactos del repositorio base (códec Mimi, tokenizador, prompts de voz e interfaz web) sin modificar.

El modelo subyacente es un LM de aproximadamente 7.000 millones de parámetros que procesa audio de entrada y genera audio de salida en tiempo real con capacidad full-duplex, es decir, puede escuchar y hablar de forma simultánea. Esta cuantización concreta no introduce cambios arquitectónicos: aplica int4 simétrico a 348 matrices lineales y conserva en FP16 las embeddings, normalizaciones, cabezas de salida y tensores pequeños (127 tensores).

Su relevancia es práctica: permite almacenar y distribuir el modelo con un tercio del espacio, aunque el autor advierte que no se ha evaluado en benchmarks de voz y que la pérdida de calidad frente a Q8 es previsiblemente notable. La licencia aplicable es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moshi (transformer full-duplex speech-to-speech con codec Mimi) |
| Parametros totales | ~7.000 millones (modelo base PersonaPlex-7B-v1) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simétrico, group size 64; también se describe Q8 int8 simétrico con una escala por fila de salida |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (`model-q4.safetensors`, ~5,17 GB) más ficheros auxiliares (tokenizador, códec Mimi, voces) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Moshi, un sistema de diálogo por voz full-duplex que combina un modelo de lenguaje transformer con el códec neuronal Mimi para codificar y decodificar audio en streaming. El checkpoint original está en BF16 y pesa aproximadamente 16,74 GB. Esta versión Q4 no reentrena ni ajusta el modelo: aplica cuantización de solo pesos sobre 348 matrices lineales, con escalas FP16 almacenadas en claves `<key>.qscale`, y deja en FP16 las embeddings, las capas de normalización, las cabezas de salida y otros tensores pequeños.

El esquema Q4 usa nibbles sin signo (valor + 8), dos por byte (el nibble bajo corresponde a la columna par), cuantización simétrica y una escala por cada grupo de 64 columnas de entrada. El error relativo medio reportado en los tensores cuantizados es de 1,23e-02 y el máximo de 2,06e-02, sin tensores con desbordamiento FP16 en el origen. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Conversación de voz a voz en tiempo real con comportamiento full-duplex (escucha y habla de forma simultánea).
- Generación de audio de salida a partir de audio de entrada mediante el códec Mimi.
- Uso de prompts de voz predefinidos incluidos en el repositorio (`voices.tgz`).
- Interfaz web de demostración incluida en el paquete (`dist.tgz`).
- Ejecución mediante la librería `moshi` y el servidor `python -m moshi.server`.
- Capacidades de razonamiento, código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Prototipado de asistentes de voz conversacionales: el modelo permite montar un servidor local con `moshi.server` y probar diálogos hablados de baja latencia sin depender de APIs externas, usando los prompts de voz incluidos.
- Demostraciones y pruebas de concepto en equipos con VRAM limitada: al reducir el checkpoint a ~5,17 GB, es viable cargarlo en GPUs de consumo para validar la experiencia full-duplex antes de invertir en el modelo completo en BF16.
- Distribución de artefactos en entornos con ancho de banda restringido: el repositorio de 10,7 GB frente a los ~16,74 GB del LM original facilita la descarga y el almacenamiento en réplicas internas.
- Investigación sobre cuantización de modelos de audio: sirve como caso de estudio para medir el impacto del int4 group size 64 en la calidad percibida de un modelo speech-to-speech, comparando contra Q8 o BF16.
- Integración en pipelines de evaluación de voz: permite generar muestras de audio para escucha comparativa y análisis subjetivo antes de desplegar el modelo base.
- Entornos educativos y talleres: el tamaño reducido y la licencia abierta de NVIDIA facilitan su uso en formación sobre arquitecturas Moshi y códecs neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no se ha evaluado en benchmarks de voz y recomienda escuchar las salidas antes de confiar en él.

## Requisitos de hardware

- VRAM estimada para inferencia: el LM cuantizado ocupa ~5,17 GB en disco; para mantenerlo en 4 bits en memoria de GPU se necesita un runtime que sustituya `nn.Linear` por una capa lineal cuantizada, no incluido en el repositorio.
- Alternativa documentada: expandir los pesos a un checkpoint FP16 (`personaplex_quant.py`) y ejecutar con el código estándar de PersonaPlex; en ese caso la VRAM requerida se aproxima a la del modelo en FP16 (~16,74 GB en BF16/FP16).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un checkpoint FP16 de ~16,74 GB encaja en GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100); la versión int4 nativa requeriría runtimes específicos no detallados.
- Cabe en GPU de consumo: probablemente en GPUs de 24 GB si se ejecuta en FP16 expandido; para int4 real en memoria se necesita soporte de runtime adicional.
- Opciones de despliegue: `moshi.server` con la librería `moshi` (requiere clonar `NVIDIA/personaplex`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PersonaPlex-7B-v1 Q4 (este) | ~7B | no disponible | int4 group size 64 | NVIDIA Open Model License | Hugging Face, repo de 10,7 GB |
| nvidia/personaplex-7b-v1 (base) | ~7B | no disponible | BF16 | NVIDIA Open Model License | Hugging Face, LM de ~16,74 GB |
| Moshi original (Kyutai) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No evaluado en benchmarks de voz; la calidad debe validarse mediante escucha comparativa.
- La cuantización Q4 pierde calidad de forma notablemente mayor que Q8 según el propio autor.
- El repositorio no incluye un runtime de inferencia int4: para mantener los pesos en 4 bits en GPU hay que expandirlos a FP16 o implementar capas lineales cuantizadas.
- Sesgos conocidos: no disponibles en la información proporcionada; conviene revisar `bias.md` del repositorio.
- Riesgo de alucinación: no cuantificado; aplicable el del modelo base, sin datos específicos.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia NVIDIA Open Model License: revisar sus términos antes de uso comercial; no es una licencia OSI estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El error relativo medio de 1,23e-02 en los tensores cuantizados es una métrica de pesos, no de calidad perceptual del audio.

## Enlaces

- [Hugging Face: Shadow0482/personaplex-7b-v1-q4](https://huggingface.co/Shadow0482/personaplex-7b-v1-q4)
- [Modelo base: nvidia/personaplex-7b-v1](https://huggingface.co/nvidia/personaplex-7b-v1)
- [Repositorio de código: NVIDIA/personaplex](https://github.com/NVIDIA/personaplex)
- [Licencia NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
