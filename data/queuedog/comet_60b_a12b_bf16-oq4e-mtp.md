# queuedog/Comet_60B_A12B_BF16-oQ4e-mtp

## Resumen

Comet_60B_A12B_BF16-oQ4e-mtp es una cuantización mixta del modelo Comet 60B (arquitectura Nemotron H Omni, según el tag `nemotron_h_omni`), publicada por el usuario queuedog en Hugging Face. Se trata de un checkpoint de aproximadamente 59.729 millones de parámetros totales, con un componente de lenguaje de 59.075B y un componente de visión de 0.654B, lo que indica un modelo multimodal con capacidad de procesamiento de imágenes. El nombre sugiere una arquitectura MoE con 60B totales y 12B activos, aunque este dato no se confirma en la información disponible.

La relevancia de esta ficha radica en su formato de despliegue: es una cuantización de precisión mixta generada con oQ (oMLX v0.7.3), orientada a ejecución en Apple Silicon mediante la librería MLX. El checkpoint combina capas en 4, 5, 6 y 8 bits con un pequeño remanente en BF16, logrando un promedio efectivo de 4.931 bits por peso y un tamaño de repositorio de 36.8 GB, lo que lo hace manejable en equipos con memoria unificada de gama alta.

No obstante, la información pública es muy limitada: no hay model card original del modelo base, no se especifican licencia, idiomas ni pipeline, y no se han publicado benchmarks. Esta ficha documenta exclusivamente lo que puede verificarse a partir de los metadatos y la model card de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H Omni (según tag `nemotron_h_omni`); presumiblemente MoE, no confirmado |
| Parametros totales | 59.728.962.566 (59.729B) |
| Parametros activos | 12B (según el nombre del modelo; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit (85,39%), 5-bit (4,95%), 6-bit (4,63%), 8-bit (3,86%), BF16 (1,17%); grupo 64; promedio 4,931 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ con `custom_code` |
| Tamano del repositorio | 36,8 GB (34,286 GiB) |
| Componentes | Lenguaje: 59,075B (33,069 GiB); visión: 0,654B (1,217 GiB) |
| Libreria | mlx |
| Fecha de publicacion | 2026-11-10 |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna del modelo base. El tag `nemotron_h_omni` apunta a la familia Nemotron H de NVIDIA, que combina capas de atención con capas de estado recurrente (arquitectura híbrida), y el sufijo `omni` sugiere multimodalidad. La presencia de un componente de visión de 0,654B parámetros confirma que el checkpoint incluye capacidades de procesamiento visual, aunque no se especifica el codificador utilizado ni la resolución de entrada.

Respecto al entrenamiento, no se dispone de datos sobre número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo que sí está documentado es el proceso de cuantización: se aplicó oQ (oMLX v0.7.3), una técnica de cuantización de precisión mixta que asigna distintos anchos de bits por tensor según su sensibilidad, manteniendo en BF16 un 1,17% de los pesos (0,698B) y concentrando el 85,39% en 4 bits. El sufijo `mtp` del nombre podría indicar multi-token prediction, pero no se confirma en la documentación.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 59B parámetros soporta tareas generativas generales, aunque no hay evaluación publicada.
- Procesamiento de visión: incluye un módulo visual de 0,654B parámetros, lo que habilita entrada de imágenes (descripción, VQA, OCR), si bien no se detallan las capacidades exactas.
- Multimodalidad: la combinación de lenguaje y visión sugiere un modelo omni, potencialmente con entrada de imagen y salida de texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Soporte multilingüe: no disponible; no se especifican idiomas.
- Modo thinking o razonamiento explícito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado en MLX y cuantizado a ~4,93 bits/peso, por lo que puede ejecutarse en Macs con memoria unificada de 64 GB o superior, sin necesidad de GPUs dedicadas.
- Prototipado de asistentes multimodales: la combinación de un tronco de lenguaje de 59B con un módulo de visión permite construir demos de descripción de imágenes, VQA o extracción de información de documentos en entornos de desarrollo con hardware Apple.
- Investigación sobre cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de asignar 4/5/6/8 bits por tensor en la calidad de un modelo de ~60B, comparándolo con el original en BF16.
- Evaluación de arquitecturas híbridas: útil para experimentar con modelos Nemotron H Omni en tareas de razonamiento de contexto largo, siempre que se valide empíricamente el contexto real soportado.
- Despliegue en estaciones de trabajo con memoria unificada: para equipos Mac Studio con 64-128 GB, permite servir un modelo de 60B en local para tareas de generación y análisis de imágenes sin conexión a la nube.
- Base para fine-tuning con LoRA/QLoRA: al estar en formato MLX safetensors, puede adaptarse con herramientas del ecosistema MLX para dominios específicos, aunque la licencia no confirmada obliga a verificar antes el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 34,286 GiB en disco; para inferencia en MLX se recomienda al menos 40-48 GB de memoria unificada, y 64 GB para margen de contexto y caché KV.
- GPU recomendadas: Apple Silicon con memoria unificada (M2 Ultra, M3 Max/Ultra, M4 Max/Ultra). No está pensado para GPUs NVIDIA/AMD por su formato MLX.
- ¿Cabe en GPU consumer? En GPUs consumer con 24 GB (RTX 4090) no cabe en su formato actual; en Macs con 64 GB o más, sí.
- Opciones de despliegue: MLX (librería nativa), mlx-lm y herramientas del ecosistema oMLX. No compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión.
- Latencia y throughput: no disponibles; dependen del chip Apple y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comet_60B_A12B (esta ficha) | 59,7B totales / 12B activos (según nombre) | no disponible | MLX safetensors 4,93 bits/peso | no disponible | Hugging Face, 0 descargas |
| Modelo base Comet 60B BF16 | 59,7B | no disponible | safetensors BF16 | no disponible | no disponible en la información |
| Alternativas de ~60B MoE (p. ej. Qwen3-30B-A3B, Mixtral 8x7B) | 30-47B | 32K-128K típicamente | GGUF, safetensors, MLX | Apache 2.0 / Apache 2.0 | amplia |

No se dispone de datos suficientes para una comparativa rigurosa de rendimiento con alternativas; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial; es imprescindible contactar con el autor o localizar la licencia del modelo base antes de cualquier despliegue en producción.
- Modelo base no documentado: no hay model card del Comet 60B original en la información disponible, lo que impide conocer datos de entrenamiento, sesgos y evaluación.
- Riesgo de alucinación: sin benchmarks ni evaluaciones publicadas, no puede estimarse la fiabilidad factual del modelo.
- Cuantización agresiva: el 85,39% de los pesos está en 4 bits, lo que puede degradar tareas sensibles (matemáticas, código, razonamiento profundo) respecto al BF16 original.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple; no hay conversión a GGUF ni compatibilidad con vLLM/TGI.
- Idiomas y contexto desconocidos: no se puede garantizar soporte de castellano ni una ventana de contexto concreta.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Fecha de creación futura (2026-11-10): metadato anómalo que conviene verificar antes de confiar en el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/queuedog/Comet_60B_A12B_BF16-oQ4e-mtp
- oQ / oMLX (herramienta de cuantización citada): https://github.com/jundot/omlx
- Modelo base Comet 60B: no disponible
- Paper o blog del modelo base: no disponible
- Repositorio o demo oficial: no disponible
