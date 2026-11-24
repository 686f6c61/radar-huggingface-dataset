# dcharlot65-openie/Tencent-WeMM-Video-2B-LittleBit

## Resumen

Tencent-WeMM-Video-2B-LittleBit es un checkpoint de pesos "living weights" publicado por el usuario dcharlot65-openie en Hugging Face, derivado del modelo multimodal de vídeo tencent/WeMM-Video-2B. No se trata de un modelo entrenado desde cero, sino de una refactorización y compresión extrema del modelo base mediante la combinación de LittleBit-2 y Sakana SVF (singular value factorization), empaquetada en el formato propietario .jsyn del runtime JouleDB. El resultado declarado es un fichero de 23,38 MB frente a los 6.263 MB equivalentes en FP16, lo que supone una ratio de compresión de 267,82x y un promedio de 0,0231 bits por peso.

El modelo base WeMM-Video-2B es un modelo de generación de vídeo de Tencent, con aproximadamente 2.000 millones de parámetros, bajo licencia Apache 2.0. Esta variante LittleBit conserva la arquitectura del original pero redistribuye los pesos en tensores 2D en planos de bits (503 tensores) y vectores 1D de LayerNorm, bias y convoluciones depthwise (658 vectores), sumando 3.283.623.752 parámetros teóricos.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión sub-1-bit aplicada a un modelo de vídeo; por otro, ilustra un ecosistema de inferencia alternativo (JouleDB, JouleKube) que prescinde de PyTorch. Cabe advertir que el repositorio tiene 0 descargas y 0 likes, tamaño de 0.0 GB y fue creado y actualizado en el mismo instante, lo que limita la verificación independiente de sus cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de vídeo (heredada de tencent/WeMM-Video-2B); pesos refactorizados en formato LittleBit-2 ⊕ Sakana SVF |
| Parametros totales | 3.283.623.752 (según model card) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (0,0231 BPW promedio); 503 tensores 2D en planos de bits + 658 vectores 1D; compresión zstd + CRC32 en formato .jsyn |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .jsyn (JouleDB), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base WeMM-Video-2B es un transformer multimodal orientado a la generación y modelado de vídeo. Sobre él, esta variante aplica una factorización de pesos en dos etapas: LittleBit-2, que representa los tensores 2D como planos de bits de baja profundidad, y Sakana SVF (singular value factorization), que descompone las matrices en componentes de rango reducido. Los tensores 1D (LayerNorm, bias y convoluciones depthwise) se conservan como vectores separados, presumiblemente por su sensibilidad a la cuantización extrema. El conjunto se serializa con compresión zstd y verificación CRC32 en un único artefacto .jsyn.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO. Tampoco se documenta el procedimiento exacto de calibración de la factorización ni las métricas de degradación respecto al modelo original. La model card únicamente describe el perfil de compresión y el flujo de uso con JouleDB v0.2.4 o superior, sin detallar innovaciones de atención, decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación y modelado de vídeo: hereda las capacidades del modelo base tencent/WeMM-Video-2B, orientado a tareas de vídeo multimodal.
- Compresión sub-1-bit: pesos almacenados a 0,0231 BPW promedio, lo que permite distribuir el modelo en artefactos de decenas de MB.
- Inferencia sin PyTorch: el runtime JouleDB ejecuta los pesos .jsyn de forma nativa, sin dependencia del stack de PyTorch.
- Despliegue Kubernetes-native: integración con JouleKube como sustrato de agentes e IA.
- Recuperación desde Hugging Face: comando `hf_pull` para descargar el checkpoint directamente al servidor JouleDB.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Distribución de modelos de vídeo en entornos con ancho de banda limitado: el artefacto de 23,38 MB permite transportar un modelo de 2B parámetros por canales restringidos, algo inviable con los 6.263 MB en FP16.
- Despliegue en clústeres Kubernetes: mediante JouleKube, el checkpoint puede servirse como servicio nativo del clúster sin instalar PyTorch ni CUDA en cada nodo.
- Prototipado rápido de pipelines de vídeo: el arranque con `jouledb serve` y `hf_pull` reduce el tiempo de puesta en marcha frente a la descarga y conversión de pesos tradicionales.
- Archivado y versionado de modelos: el formato .jsyn con CRC32 permite almacenar y verificar la integridad de checkpoints en repositorios de artefactos ligeros.
- Investigación en compresión extrema de redes: sirve como referencia reproducible de la técnica LittleBit-2 ⊕ Sakana SVF aplicada a un transformer de vídeo.
- Evaluación de runtimes alternativos: útil para comparar el rendimiento de JouleDB frente a vLLM, llama.cpp o TGI en tareas de vídeo, siempre que se validen las métricas de calidad.
- Experimentación con pesos "living" en agents: el sustrato JouleKube está pensado para cargas de agentes, por lo que este checkpoint puede emplearse como banco de pruebas de ese flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base es de ~2B parámetros; en FP16 requeriría del orden de 4-5 GB, pero el formato .jsyn descomprime los pesos en el runtime y no se documenta el pico de memoria.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU ni compatibilidad con CUDA, ROCm o Metal.
- Compatibilidad con GPU de consumo: no disponible. El runtime JouleDB no documenta en la información proporcionada si soporta GPU consumer como RTX 4090.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve`), con integración en JouleKube. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tencent-WeMM-Video-2B-LittleBit | 3.283.623.752 (según card) | no disponible | .jsyn (0,0231 BPW) | Apache 2.0 | Hugging Face, 0 descargas |
| tencent/WeMM-Video-2B (base) | ~2B | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face |
| Modelos de vídeo de 2B de la competencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Cifras no verificables: el repositorio tiene 0 descargas, 0 likes y 0.0 GB de tamaño declarado, lo que impide confirmar la existencia real del artefacto .jsyn de 23,38 MB.
- Discrepancia de parámetros: la model card declara 3.283.623.752 parámetros, mientras que el nombre del modelo indica 2B; la diferencia podría deberse a la factorización, pero no se explica.
- Sin benchmarks: no hay evidencia publicada de la calidad de generación de vídeo tras la compresión sub-1-bit.
- Riesgo de degradación: una cuantización de 0,0231 BPW puede introducir pérdidas severas de fidelidad; no se documenta ninguna evaluación de calidad.
- Dependencia de un runtime propietario: el formato .jsyn solo es legible por JouleDB, lo que limita la portabilidad y la inspección con herramientas estándar.
- Idiomas y contexto no documentados: no se puede garantizar el soporte multilingüe ni la ventana de contexto.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la atribución al modelo base y las condiciones del runtime JouleDB.
- Fecha de creación futura: el repositorio figura creado el 2026-11-24, lo que sugiere metadatos inconsistentes o un entorno de pruebas.
- Sin soporte comunitario: al no tener descargas ni likes, no hay evidencia de uso en producción ni de resolución de incidencias.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Tencent-WeMM-Video-2B-LittleBit
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
