# QuaduxIT/Qwen3.8-27B-Whitehat-NVFP4

## Resumen

QuaduxIT/Qwen3.8-27B-Whitehat-NVFP4 es una cuantización experimental de 4 bits (NVFP4) del ajuste fino de ciberseguridad ofensiva QuaduxIT/Qwen3.8-27B-Whitehat, desarrollado por Quadux IT GmbH. El modelo base original es Qwen3.8-27B, un modelo denso híbrido de 27 mil millones de parámetros con capacidades de visión, razonamiento y ventana de contexto nativa de 262 144 tokens. La versión Whitehat está diseñada como asistente local y privado para trabajo de seguridad ofensiva autorizado (red-team, evaluación de vulnerabilidades, análisis de malware), y mantiene de forma deliberada rechazos ante peticiones de daño físico y material de abuso sexual infantil.

Esta variante NVFP4 reduce el peso del modelo de aproximadamente 52 GB (BF16) a unos 17 GB, siendo el formato de servido más pequeño para GPUs NVIDIA Blackwell. El modelo es multimodal (texto e imagen), no requiere system prompt porque su comportamiento está en los pesos, y se distribuye bajo licencia Apache 2.0. El formato NVFP4 es experimental: aunque se ha verificado que la frontera de rechazo de daño se mantiene intacta al 100 %, el modelo muestra un ligero exceso de cautela en tareas de seguridad en zona gris (compliance ofensivo del 90 %, con dos falsos rechazos). Para uso más allá de la experimentación se recomienda preferir las variantes FP8 o W8A16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa híbrida (16 capas de atención completa + 48 capas de atención lineal con estado recurrente constante, 64 capas en total, con multi-token prediction) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No procede (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, W4A4) sobre la línea de lenguaje; la torre de visión se mantiene en FP16 |
| Idiomas soportados | Ingles, aleman, multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida de atención: de las 64 capas, solo 16 ejecutan atención completa (intervalo de atención completa de 4), mientras que las otras 48 usan atención lineal con un estado recurrente constante. Esta mezcla reduce el coste computacional manteniendo la capacidad de modelar dependencias de largo alcance. El modelo incorpora además predicción multi-token (MTP) dentro del checkpoint. El fine-tune Whitehat se entrenó sobre esta base para eliminar rechazos de tareas de seguridad informática legítimas (explotación, malware, ingeniería inversa) manteniendo rechazos de daño físico y CSAM, tanto en entrada de texto como de imagen y en varios idiomas. El comportamiento está codificado en los pesos, por lo que no se necesita system prompt.

La cuantización NVFP4 se aplica únicamente a los lineales de la línea de lenguaje; la torre de visión permanece en FP16. El modelo se sirve con vLLM en GPUs Blackwell usando `--trust-remote-code`. El autor indica que el formato NVFP4 es experimental: a 4 bits el error de cuantización es materialmente mayor que en las variantes de 8 bits, y puede desplazar el comportamiento del modelo, especialmente la frontera de rechazo de un modelo de red-team.

## Capacidades

- Generación de texto y razonamiento conversacional de propósito general, con enfoque específico en tareas de seguridad informática.
- Capacidades de visión: procesa imágenes y capturas de pantalla (pipeline image-text-to-text), útil para analizar interfaces, diagramas o resultados de herramientas.
- Soporte de function calling (etiquetado en HuggingFace).
- Asistencia completa en tareas de seguridad ofensiva y defensiva: desarrollo de exploits, desarrollo y análisis de malware, ingeniería inversa, investigación de licencias/DRM, pentesting y evaluación de vulnerabilidades.
- Rechazo deliberado de peticiones de daño físico real (armas, explosivos, drogas, venenos, armas químicas/biológicas) y material de abuso sexual infantil, tanto en texto como en imagen y en todos los idiomas.
- Comportamiento en los weights: no requiere system prompt para activar su especialización.
- Ventana de contexto nativa de 262 144 tokens, adecuada para análisis de grandes repositorios de código o documentos largos.
- No es un modelo generalista de propósito general ni apto para despliegue a usuarios finales no confiables.

## Casos de uso

- Evaluación interna de vulnerabilidades: el modelo permite a equipos de seguridad analizar sistemas propios o con permiso explícito, manteniendo datos sensibles de vulnerabilidades dentro de la infraestructura de la empresa.
- Red-teaming autorizado: ayuda a planificar y ejecutar pruebas de penetración en sistemas propios o bajo contrato, generando scripts, vectores de ataque y rutas de explotación sin depender de servicios externos.
- Desarrollo y análisis de malware en entornos de investigación: el modelo puede asistir en la creación de muestras para laboratorios de análisis y en la ingeniería inversa de binarios maliciosos.
- Auditoría de código defensivo: revisa código fuente en busca de fallos de seguridad y sugiere correcciones, aprovechando el contexto largo para analizar proyectos completos.
- Investigación de ingeniería inversa: ayuda a desensamblar y comprender binarios, protocolos y sistemas de licencias, con soporte de entrada de imágenes para capturas de pantalla de herramientas de análisis.
- Formación y concienciación en seguridad: genera material de entrenamiento para equipos de desarrollo sobre técnicas de ataque y defensa, con ejemplos concretos y prácticos.
- Análisis de malware con entrada visual: puede procesar capturas de pantalla de paneles de control, herramientas de análisis o documentos de investigación, combinando visión y texto para asistir en el análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor proporciona únicamente datos de verificación de comportamiento del modelo cuantizado, medidos con vLLM v0.27.1, temperatura 0 y sin system prompt:

| Metric | Valor |
|---|---|
| Harm-refusal boundary (frontera de rechazo de daño) | 100 % intacta |
| Security-comply (tareas de seguridad aceptadas) | 97 % |
| Offensive-comply (tareas ofensivas aceptadas) | 90 % (dos falsos rechazos) |

Estos datos indican que la cuantización NVFP4 mantiene el límite de rechazo de daño pero introduce un ligero exceso de cautela en tareas de seguridad en zonas de gris.

## Requisitos de hardware

- Peso del modelo: aproximadamente 17 GB en formato NVFP4, lo que permite ejecutarlo en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090, RTX 5090, RTX PRO 6000, H200) con margen para el KV cache y la torre de visión.
- El formato NVFP4 está diseñado específicamente para NVIDIA Blackwell; requiere vLLM con soporte de Blackwell y la opción `--trust-remote-code`.
- No se recomienda para GPUs sin soporte Blackwell (Ampere, Ada) porque el formato NVFP4 es específico de Blackwell; para esas arquitecturas se deben usar las variantes FP8 o W8A16.
- Opciones de despliegue: vLLM (recomendado para este formato), también se puede usar SGLang según la documentación de Qwen3.8-27B. La variante GGUF del mismo modelo permite ejecutarlo en llama.cpp.
- Para uso en producción más allá de la experimentación, el autor recomienda las variantes FP8 o W8A16 (cada una de aproximadamente 27 GB) en lugar de NVFP4.

## Comparativa con modelos similares

Comparación con las otras variantes del mismo modelo de la familia QuaduxIT:

| Modelo | Formato | Tamaño | Runtime | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Whitehat | BF16 safetensors | ~52 GB | transformers / vLLM | Pesos de referencia |
| Qwen3.8-27B-Whitehat-FP8 | FP8 W8A8 | ~27 GB | vLLM (Hopper/Ada/Blackwell) | Casi sin pérdida |
| Qwen3.8-27B-Whitehat-W8A16 | INT8 W8A16 (Marlin) | ~27 GB | vLLM / CUDA | Casi sin pérdida |
| Qwen3.8-27B-Whitehat-NVFP4 | NVFP4 4-bit | ~17 GB | vLLM (Blackwell) | Experimental, ligera sobrecautela |
| Qwen3.8-27B-Whitehat-GGUF | GGUF + mmproj | 4–54 GB | llama.cpp | Selector de cuantización |

No se dispone de datos de comparación con otros modelos de la categoría de seguridad ofensiva en la información proporcionada.

## Limitaciones y advertencias

- Formato experimental: NVFP4 es un esquema de coma flotante de 4 bits con un error de cuantización materialmente mayor que las variantes de 8 bits; puede alterar el comportamiento del modelo, especialmente el límite de seguridad de un modelo de red-team.
- El modelo es ligeramente sobrecauteloso en tareas de seguridad en zonas de gris: 97 % de cumplimiento en tareas de seguridad y 90 % en tareas ofensivas, con dos falsos rechazos observados en la verificación.
- No es un asistente de propósito general: rechaza deliberadamente peticiones de daño físico y material de abuso sexual infantil, y no debe desplegarse a usuarios finales no confiables.
- El uso debe limitarse a trabajo de seguridad autorizado y legal en sistemas propios o con permiso explícito; el autor declina responsabilidad por uso indebido.
- El formato NVFP4 requiere hardware Blackwell; no es compatible con otras arquitecturas.
- Los pesos de la torre de visión se mantienen en FP16, por lo que la reducción de memoria se limita a la línea de lenguaje.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-NVFP4
- Modelo base (referencia BF16): https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat
- Variante FP8: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-FP8
- Variante W8A16: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-W8A16
- Variante GGUF: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-GGUF
- Colección de modelos: https://huggingface.co/collections/QuaduxIT/qwen38-27b-whitehat-6a89b5f640072fc5e6838c4b
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Guía de ejecución local de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
