# krisfremen/DaisyRose-27B-oQ4e-mtp

## Resumen

DaisyRose-27B-oQ4e-mtp es una cuantización mixta del modelo RadixArk/DaisyRose-27B, publicada por el usuario krisfremen. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia eficiente en hardware Apple Silicon mediante la librería MLX. La cuantización se ha realizado con la herramienta oQ (oMLX v0.8.0), que aplica precisión mixta por tensor en lugar de un esquema uniforme, logrando un promedio efectivo de 5,044 bits por peso sobre el checkpoint completo.

El modelo base pertenece a la familia arquitectónica qwen3_5, según las etiquetas del repositorio, e incorpora componentes diferenciados: un modelo de lenguaje de 26.896B parámetros lógicos, un codificador visual de 0.461B y una cabeza MTP (multi-token prediction) de 0.425B. Esta última es relevante porque habilita decodificación especulativa nativa, lo que puede mejorar el throughput de generación sin necesidad de un modelo borrador externo. El total asciende a 27.781.427.952 parámetros.

El interés de esta ficha radica en que documenta un caso de cuantización mixta agresiva con preservación selectiva de precisión: el 69,8% de los pesos quedan en 4 bits, pero un 23,7% se mantienen en 5 bits, un 4,6% en 6 bits y un 1,86% en BF16. Esa distribución busca minimizar la degradación en capas sensibles manteniendo un tamaño de repositorio de 17,5 GB, manejable en equipos con memoria unificada de 32 GB o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5), con torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afín por grupo de 64: 4, 5, 6 y 8 bits, más BF16; promedio efectivo 5,044 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de la cuantización por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896B | 16,272 GB / 15,155 GiB |
| Visión | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,323 GB / 0,301 GiB |
| Total | 27,781B | 17,517 GB / 16,314 GiB |

Distribución por precisión:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 4 bits, grupo 64 | 19,393B | 69,807% | 10,160 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 6,579B | 23,680% | 4,212 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 1,282B | 4,615% | 0,970 GiB | 6,50 |
| Afín 8 bits, grupo 64 | 0,011B | 0,041% | 0,011 GiB | 8,50 |
| BF16 | 0,516B | 1,857% | 0,961 GiB | 16,00 |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base RadixArk/DaisyRose-27B: no se detallan el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo que sí se conoce es la estructura del checkpoint cuantizado: un transformer de la familia qwen3_5 con tres bloques funcionales diferenciados (lenguaje, visión y cabeza MTP), lo que confirma que el modelo base es multimodal con capacidad de generación de texto e imagen.

La innovación técnica destacable de esta publicación es el esquema de cuantización mixta de oQ. En lugar de aplicar 4 bits de forma homogénea, la herramienta asigna precisión por tensor según su sensibilidad, manteniendo en BF16 un 1,86% de los pesos (0,516B) y en 6 bits un 4,6% adicional. La cabeza MTP, con solo 0,425B de parámetros, se conserva con suficiente fidelidad para que la decodificación especulativa multi-token funcione correctamente; es habitual que estas cabezas se degraden de forma desproporcionada bajo cuantización uniforme agresiva. La cuantización afín con grupo de 64 es el formato nativo de MLX y permite un descompresión eficiente en la GPU unificada de Apple.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje de 26,896B parámetros soporta conversación multi-turno y tareas de razonamiento general.
- Procesamiento de visión: la torre visual de 0,461B parámetros indica capacidad de comprensión de imágenes (VLM), aunque no se detallan las tareas concretas soportadas.
- Decodificación especulativa multi-token: la cabeza MTP de 0,425B permite predecir varios tokens por paso, acelerando la generación.
- Inferencia en Apple Silicon: empaquetado en formato MLX, optimizado para memoria unificada de chips M-series.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque la arquitectura base lo permitiría.
- Modo thinking: no disponible.

## Casos de uso

- Asistente local en Mac: el tamaño de 17,5 GB permite ejecutar el modelo íntegramente en un Mac con 32 GB de memoria unificada, ofreciendo un asistente conversacional privado sin depender de la nube.
- Análisis de documentos con imágenes: la combinación de torre visual y modelo de lenguaje de 26,9B parámetros permite procesar capturas, diagramas o páginas escaneadas junto a texto, útil para revisión de documentación técnica en local.
- Prototipado de aplicaciones MLX: sirve como checkpoint de referencia para desarrolladores que construyen apps con mlx-lm o mlx-swift y necesitan un modelo multimodal de tamaño medio ya cuantizado.
- Generación asistida con baja latencia: la cabeza MTP habilita decodificación especulativa, adecuada para entornos interactivos donde la latencia por token es crítica.
- Evaluación de cuantización mixta: investigadores pueden comparar la calidad de este checkpoint de 5,044 bits/peso frente al modelo base en BF16 para estudiar el impacto de la precisión selectiva.
- Despliegue en estaciones de trabajo Apple: integrable en pipelines internos de procesamiento de texto e imagen sobre macOS, sin GPU dedicada, aprovechando la memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 17,5 GB de pesos en disco; en ejecución se requiere espacio adicional para caché KV y buffers de activación, por lo que se recomienda un mínimo de 24-32 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon con 32 GB o más de memoria unificada (M1/M2/M3/M4 Pro, Max o Ultra). No está pensado para GPUs NVIDIA, ya que el formato es MLX.
- ¿Cabe en consumer GPU? No en GPUs de consumo NVIDIA con 8-16 GB; sí en Macs de gama alta con memoria unificada suficiente.
- Opciones de despliegue: mlx-lm, mlx-swift y el ecosistema oMLX. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-oQ4e-mtp | 27,781B | no disponible | MLX safetensors, 5,044 bits/peso | no disponible | Hugging Face (0 descargas) |
| RadixArk/DaisyRose-27B (base) | 27,781B | no disponible | safetensors BF16 | no disponible | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma familia qwen3_5 en formato MLX cuantizado que permita una comparación rigurosa de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base RadixArk/DaisyRose-27B antes de cualquier despliegue en producción.
- Modelo derivado: cualquier sesgo o limitación del modelo base se hereda; la cuantización puede amplificar la degradación en tareas sensibles.
- Pérdida de precisión: pese a la preservación selectiva, el 69,8% de los pesos están en 4 bits, lo que puede afectar a razonamiento complejo, matemáticas o código frente al BF16 original.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de este tamaño.
- Idiomas y contexto: no se documentan la ventana de contexto ni los idiomas soportados, lo que dificulta planificar su uso en producción multilingüe.
- Ecosistema restringido: el formato MLX limita el despliegue a hardware Apple; no es portable a servidores NVIDIA sin reconversión.
- Madurez: repositorio con 0 descargas y 0 likes, publicado recientemente; no hay validación comunitaria de su calidad.
- Sin benchmarks: no hay evidencia publicada de rendimiento que respalde afirmaciones de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krisfremen/DaisyRose-27B-oQ4e-mtp
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentación de MLX: https://github.com/ml-explore/mlx
