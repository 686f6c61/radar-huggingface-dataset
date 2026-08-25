# ATOMIKMN/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

El modelo **Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF** es una versión cuantizada y "uncensored" del modelo base Qwen/Qwen3.8-27B, desarrollada por el usuario ATOMIKMN a partir del trabajo de HauhauCS. Se trata de un modelo denso de 27B parámetros con arquitectura híbrida (Gated DeltaNet + gated attention), con visión y capacidades multimodales, publicado bajo licencia Apache 2.0. Su principal característica es la eliminación casi total del comportamiento de rechazo: la model card reporta 0/465 refusals en pruebas internas, manteniendo las capacidades originales de razonamiento, agente, imagen y vídeo.

Esta versión "Aggressive" está pensada para obtener respuestas directas sin preámbulos ni reticencias. Además, incluye el mecanismo HauhauCS FastMTP, un sidecar de decodificación especulativa que acelera la generación hasta 3.02x en documentos y 1.93x en razonamiento frente a la versión sin MTP, y hasta 35.2% más en documentos y 21.1% en razonamiento frente al MTP embebido estándar. El modelo se distribuye en formato GGUF con múltiples cuantizaciones K_P, incluyendo un proyector de visión separado en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas gated-attention, con encoder de visión |
| Parametros totales | 27B (según model card; el metadata de HF indica 1.86B, posible error) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector de visión BF16 separado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (48) con capas de atención gated (16). Esta mezcla permite un balance entre eficiencia computacional y capacidad de atención a largo plazo. El modelo tiene 64 capas, hidden size 5.120 y FFN de 17.408, con un vocabulario padded de 248.320 tokens. Incluye un encoder de visión para entradas de imagen y vídeo.

El proceso de "uncensoring" aplicado por HauhauCS consiste en un perfil de abliteración a nivel de tensores que elimina los patrones de rechazo del modelo base, sin modificar los datos de entrenamiento ni las capacidades originales. La variante "Aggressive" se distingue por ofrecer respuestas directas sin comportamiento de rechazo y con preámbulo mínimo. El modelo conserva el mecanismo nativo NextN/MTP embebido, y se añade un sidecar FastMTP de 32K para aceleración especulativa. No se han publicado detalles del dataset de entrenamiento adicional, ya que el proceso se basa en modificación del modelo base.

## Capacidades

- Generación de texto y razonamiento complejo (multi-step reasoning) conservando las capacidades del Qwen3.8-27B original.
- Soporte de entrada multimodal: imagen y vídeo (a través del proyector de visión BF16).
- Tool calling / function calling, tal y como se indica en la documentación de la versión uncensored.
- Modo "thinking" activable, permitiendo al modelo razonar de forma explícita antes de responder.
- Capacidades multilingües, con especial énfasis en inglés y chino.
- Decodificación especulativa mediante MTP nativo (NextN) y el sidecar Hauhau FastMTP para acelerar la generación.
- Comportamiento "uncensored": responde sin rechazos ni preámbulo, incluso en prompts difíciles.

## Casos de uso

- **Asistente de programación sin restricciones**: el modelo puede generar código, explicar vulnerabilidades o diseñar exploits en entornos de investigación de seguridad, sin los bloqueos típicos de otros modelos. Su capacidad de tool calling permite integrarlo en IDEs o pipelines de CI/CD.
- **Generación de contenido creativo**: escritura de narrativa, guiones, poesía o contenido con temáticas sensibles (terror, violencia, erotismo) sin censura previa. La ventana de 262K tokens permite mantener contextos largos de historias.
- **Análisis de documentos extensos**: con 262K tokens de contexto nativo, puede procesar libros completos, informes técnicos o contratos legales, resumiendo y extrayendo información sin perder coherencia.
- **Agentes autónomos de investigación**: su soporte de tool calling y razonamiento multi-paso permite construir agentes que buscan información en web, ejecutan código y sintetizan resultados, incluso en dominios donde otros modelos rechazan participar.
- **Aplicaciones de visión y vídeo**: gracias al proyector de visión, el modelo puede describir imágenes, responder preguntas sobre vídeos o transcribir contenido visual, útil en sistemas de análisis de medios.
- **Despliegue en entornos con GPU limitada**: gracias a las cuantizaciones IQ4_XS (15.71 GB) o Q3_K_P (13.44 GB), se puede ejecutar en tarjetas de 16 GB de VRAM, permitiendo inferencia local en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de rechazo (0/465 refusals) y de velocidad de generación con MTP:

- Hasta 3.02x más tokens de documento por segundo frente a versión sin MTP.
- Hasta 1.93x más tokens de razonamiento por segundo frente a versión sin MTP.
- 35.2% más tokens de documento y 21.1% más tokens de razonamiento que el MTP embebido estándar.

Estos datos son relativos y no comparan con otros modelos.

## Requisitos de hardware

- **VRAM estimada** (según cuantización):
  - Q8_K_P (31.46 GB): requiere GPU con al menos 32 GB (p.ej. A100 40GB, RTX A6000).
  - Q6_K_P (25.92 GB): GPU con 32 GB o 2x16 GB.
  - Q5_K_P (20.22 GB): GPU de 24 GB (RTX 3090/4090).
  - Q4_K_P (17.92 GB) o IQ4_XS (15.71 GB): GPU de 16-24 GB (RTX 4090, RTX 4080).
  - Q3_K_P (13.44 GB) o IQ3_M (12.79 GB): GPU de 12-16 GB (RTX 3080, RTX 4070).
  - Q2_K_P (10.68 GB) o IQ2_M (10.32 GB): GPU de 8-12 GB (RTX 3060, RTX 4060).
- **GPU recomendadas**: RTX 3090/4090 para cuantizaciones Q4-Q6; A100/H100 para Q8.
- **Opciones de despliegue**: llama.cpp, LM Studio, Ollama (con configuraciones de offload), vLLM (si soporta GGUF), text-generation-webui.
- **Latencia/throughput**: no disponible; el FastMTP mejora la generación hasta 3x en documentos, pero no hay cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27B | 262K | Apache 2.0 | GGUF | Uncensored, FastMTP, visión |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors | Modelo original con alineación estándar |
| orcarouter/Qwen3.8-27B-Uncensored (Ollama) | 27B | 262K | Apache 2.0 | GGUF | Abliterated, visión, tool calling, 0% over-refusal en XSTest |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4 (AIconjured) | 27B | 262K | Apache 2.0 | GGUF | Variante con cuantización NVFP4 |

La principal diferencia frente al modelo base es el comportamiento de rechazo: el base se niega a responder ciertas solicitudes, mientras que esta versión no lo hace. Frente a la variante de orcarouter, la de HauhauCS añade el perfil "Aggressive" (menos preámbulos) y el FastMTP, pero ambas conservan las capacidades multimodales y de herramienta.

## Limitaciones y advertencias

- **Contenido inapropiado**: al ser "uncensored", el modelo puede generar contenido explícito, violento o ilegal. No apto para entornos donde se requiera moderación.
- **Sesgos y alucinaciones**: conserva los sesgos del modelo base y puede inventar información con confianza, especialmente en contextos largos.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías sobre el contenido generado.
- **Rendimiento de contexto largo**: aunque la ventana es de 262K, la calidad puede degradarse en los extremos superiores; se recomienda validar en cada caso.
- **Compatibilidad de cuantización**: los archivos K_P pueden no ser reconocidos por el widget de compatibilidad de HF; funcionan en llama.cpp y LM Studio.
- **No apto para sistemas críticos**: la eliminación de refusals puede provocar que el modelo dé instrucciones peligrosas sin filtro, por lo que no debe usarse en aplicaciones de salud, finanzas o seguridad sin supervisión humana.

## Enlaces

- [Modelo en HuggingFace (ATOMIKMN)](https://huggingface.co/ATOMIKMN/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- [Modelo original de HauhauCS (mismo nombre)](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- [Variante Q8-NVFP4 de AIconjured](https://huggingface.co/AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4/tree/main)
- [Repositorio GitHub de ejemplo de uso con Ollama](https://github.com/Wassimyounes01/qwen38-uncensored)
- [Guía de despliegue en local (LocalAIIRG)](https://localairig.com/models/qwen3-8-27b-uncensored-hardware-deployment-guide/)
- [Discord de HauhauCS](https://discord.gg/SZ5vacTXYf)
