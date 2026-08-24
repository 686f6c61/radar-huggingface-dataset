# greenfield0810/affine-ark-c423d4fc1681

## Resumen

Este repositorio es un archivo espejo de un checkpoint competidor del leaderboard de **Bittensor subnet 120 (Affine)**, preservado por el usuario `greenfield0810` ante la práctica habitual de que los repositorios de ese tablero se vuelvan privados a los pocos días de participar en duelos (el 31 % de los retadores que han duelo alguna vez ya eran inaccesibles cuando se construyó el archivo). No es un modelo original: se trata de una copia byte a byte del repositorio `0pentensor/Affine-5dflhtkufw-awesome-v22` en su revisión `fe105d06770e`.

El checkpoint subyacente es un modelo multimodal de tipo **image-text-to-text** basado en arquitectura **Qwen3.5 MoE**, con 35.107 millones de parámetros en total y un tamaño de 70,2 GB repartidos en 29 shards. Su relevancia radica en ser un artefacto de preservación para investigación y auditoría de la red Bittensor, no en ser un modelo listo para producción. La licencia, los idiomas soportados y el resto de detalles técnicos del entrenamiento no están disponibles en la información publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (image-text-to-text, multimodal) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible (arquitectura MoE, cifra exacta no publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (29 shards, 70,21 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura **Qwen3.5 MoE**, lo que implica una mezcla de expertos con activación dispersa, aunque no se publica el número de expertos ni los parámetros activos por token. Al ser multimodal (image-text-to-text), integra un codificador visual y un decodificador de lenguaje, pero no se detalla el tipo de vision encoder ni la estrategia de fusión de modalidades.

No existe información sobre el entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El repositorio es un archivo espejo sin documentación técnica del proceso de entrenamiento. El autor del archivo indica explícitamente que no es su modelo y que lo subió con fines de preservación, con la promesa de retirarlo si se solicita.

## Capacidades

- **Multimodalidad**: el pipeline declarado es `image-text-to-text`, por lo que el modelo puede procesar entradas de imagen y texto y generar respuestas de texto.
- **Conversación**: el tag `conversational` indica que está orientado a diálogo multi-turno, aunque no hay ejemplos ni demos publicados.
- **Arquitectura MoE**: al estar basado en Qwen3.5 MoE, se espera inferencia eficiente con activación dispersa, pero sin datos concretos de rendimiento.
- **Tool calling / function calling**: no disponible en la información publicada.
- **Capacidades de agente**: no disponible.
- **Razonamiento multi-step**: no disponible.

## Casos de uso

- **Preservación y auditoría de modelos en Bittensor**: el propósito principal del repositorio es servir de copia de seguridad ante la desaparición del original. Investigadores pueden descargar este checkpoint para analizar la arquitectura o reproducir evaluaciones del leaderboard de Affine.
- **Investigación de arquitecturas MoE multimodales**: al ser un checkpoint real de Qwen3.5 MoE, puede usarse como referencia para estudiar el comportamiento de mezclas de expertos con entrada visual, aunque sin licencia clara para uso comercial.
- **Análisis forense de la red Bittensor**: el repositorio incluye un fichero `_affine_provenance.json` con el historial de aliases, hotkeys, coldkeys y resultados de duelos, útil para estudiar dinámicas de competencia en subnet 120.
- **Evaluación de modelos en duelos**: si se dispone del framework de Affine, el checkpoint puede cargarse para reproducir evaluaciones comparativas dentro del ecosistema Bittensor.
- **Estudio de la deriva de checkpoints**: los 5 repos casi idénticos del grupo `262cd1afb986` permiten comparar versiones y estudiar iteraciones de entrenamiento.
- **Despliegue experimental con transformers**: el modelo es compatible con la librería `transformers` y `endpoints_compatible`, por lo que puede cargarse localmente para pruebas de inferencia multimodal, siempre que se asuma el riesgo de falta de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales como MMMU o VQA. Los únicos datos de rendimiento son los del leaderboard de Affine: 32 reinados (reigns held) y un historial de duelos de 3 duelos con 1 victoria, que no son comparables con benchmarks académicos estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35.100 millones de parámetros en precisión FP16, el peso en memoria es de ~70 GB; se necesitarían al menos 80 GB de VRAM para una sola GPU en FP16.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o H200. En GPU consumer, no cabe de forma directa en una RTX 4090 (24 GB); sería necesario cuantizar a 4 bits (~18-20 GB) o usar offloading de CPU.
- **Cuantización**: no se publican checkpoints cuantizados; habría que generarlos con herramientas como llama.cpp, GPTQ o AWQ a partir de los pesos safetensors.
- **Opciones de despliegue**: compatible con la librería `transformers` y con endpoints (marcado como `endpoints_compatible`). Se podría servir con vLLM o TGI si se convierte el formato, aunque no hay confirmación de compatibilidad.
- **Latencia y throughput**: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `greenfield0810/affine-ark-c423d4fc1681` | 35,1 B (MoE) | Qwen3.5 MoE multimodal | no disponible | no disponible | Archivo espejo, sin uso comercial garantizado |
| Qwen2.5-VL-32B (referencia) | 32,5 B | Transformer denso multimodal | 128K tokens | Apache 2.0 (partes) | Oficial en HuggingFace |
| Qwen2.5-MoE-A32B (referencia) | 32,8 B total, 3,9 B activos | MoE multimodal | no disponible | no disponible | Oficial en HuggingFace |

La comparativa es orientativa: el modelo analizado no publica datos de contexto ni licencia, y al ser un archivo espejo sin documentación de entrenamiento, no se puede garantizar equivalencia con los modelos Qwen oficiales. Los datos de los modelos de referencia provienen de sus respectivas fichas públicas.

## Limitaciones y advertencias

- **Sin licencia**: el modelo no declara licencia alguna. No se puede garantizar el uso comercial, y el autor del archivo lo subió como copia de preservación sin autorización explícita del creador original.
- **Riesgo de sesgos y alucinaciones**: al no disponer de documentación del entrenamiento, no se conocen los sesgos del dataset ni las mitigaciones aplicadas.
- **Problemas de procedencia**: el checkpoint es un mirror de un repositorio de Bittensor; la autoría real es de `0pentensor`, y el archivo puede retirarse si el propietario original lo solicita.
- **Sin evaluación publicada**: no hay benchmarks, ni métricas de calidad, ni pruebas de seguridad del modelo.
- **Contexto e idiomas desconocidos**: no se publican la longitud de contexto ni los idiomas soportados; esto limita su uso en aplicaciones multilingües.
- **Riesgo de obsolescencia**: al ser un archivo de un momento concreto del leaderboard, el checkpoint puede no reflejar el estado actual del modelo de Affine y carecer de mejoras posteriores.
- **Uso en producción no recomendado**: sin licencia, sin benchmarks y sin documentación, este modelo no es adecuado para entornos productivos; su valor es exclusivamente investigador y de preservación.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/greenfield0810/affine-ark-c423d4fc1681)
- [Árbol de ficheros del repositorio](https://huggingface.co/greenfield0810/affine-ark-c423d4fc1681/tree/main)
- [Modelo original: `0pentensor/Affine-5dflhtkufw-awesome-v22`](https://huggingface.co/0pentensor/Affine-5dflhtkufw-awesome-v22)
