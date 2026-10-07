# IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo `nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2`, publicada por el usuario IsValorum bajo la denominación VAL-APEX-I MiniPlus V2.1. No se trata de un modelo entrenado desde cero, sino de una reempaquetación en formato GGUF para `llama.cpp` de un modelo de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos originales), con licencia Apache 2.0 y orientación exclusivamente en inglés.

El valor diferencial que declara el autor no es el entrenamiento, sino el esquema de cuantización: frente a las cuantizaciones planas habituales (`Q4_K_M`, `Q5_K_M`), VAL-APEX-I aplica una asignación de precisión por tensor, preservando en `F32` las 47 capas recurrentes DeltaNet (SSM), bloqueando en `Q6_K` la cabeza de salida y en `Q8_0` el gating de atención, y reservando códecs no lineales (`IQ4_NL`, `IQ3_XXS`) para las matrices densas del MLP. El objetivo declarado es evitar la deriva del espacio de estados propia de las arquitecturas híbridas y mantener la estabilidad sintáctica en trazas de razonamiento largas.

El modelo base incorpora ajuste fino supervisado sobre trazas de chain-of-thought sintéticas y optimización de preferencias con SimPO, además de una cabeza de draft DFlash2 para decodificación especulativa multi-token. La model card reivindica contexto completo de 256K tokens ejecutándose en GPUs de 24 GB, lo que lo sitúa en el segmento de modelos de razonamiento "sin censura" desplegables en hardware de consumo o en una única GPU profesional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido lineal-cuadrático: 47 capas recurrentes DeltaNet (SSM) y 17 capas de atención completa periódicas, más cabeza de draft DFlash2 (MTP) en la capa 64 |
| Parámetros totales | 26.895.998.464 (aproximadamente 26,9 B) |
| Parámetros activos | no disponible (no se describe como MoE en la información proporcionada) |
| Longitud de contexto | 256K tokens según la model card (el despliegue en vLLM se documenta con `--max-model-len 40960`) |
| Tipos de cuantización | VAL-APEX-I: `F32` en operadores de estado SSM (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_norm`), `Q6_K` en `output.weight`, `Q8_0` en gating de atención, `IQ4_NL`/`IQ3_XXS` en matrices MLP densas, con calibración por importance matrix (imatrix). La model card también referencia `Q8_0` estándar como término de comparación |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (librería `llama.cpp`); el modelo base está en safetensors |
| Creador de la cuantización | IsValorum |
| Modelo base | nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2 |
| Tamaño del repositorio | 30,2 GB (conjunto completo de ficheros) |
| Descargas / likes | 0 descargas, 2 likes |
| Fecha de creación | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina 47 capas recurrentes DeltaNet (modelo de espacio de estados lineal) con 17 capas de atención completa distribuidas periódicamente, hasta un total de 64 capas. Esta mezcla reduce el coste de la atención cuadrática en contextos largos, pero introduce un problema específico de cuantización: los operadores de estado recurrente (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_norm`) son sensibles a la compresión y, según el autor, las cuantizaciones uniformes provocan "deriva del espacio de estados" que degrada las trazas de razonamiento profundo. El esquema VAL-APEX-I responde manteniendo esos tensores en `F32` sin comprimir, protegiendo la cabeza de clasificación global en `Q6_K` para evitar corrupción de tokens de razonamiento y fallos en los delimitadores `<think>`, y fijando el gating de atención en `Q8_0` para evitar interferencias entre los mecanismos de atención lineal y cuadrática.

Respecto al entrenamiento del modelo base, la información disponible indica tres fases: preentrenamiento sobre una arquitectura híbrida lineal-cuadrática denominada Qwen3.8-27B, ajuste fino supervisado sobre trazas de chain-of-thought sintetizadas a partir de modelos frontera (datasets de razonamiento de Claude 3.5/3.7 Opus, trazas de razonamiento y generación de código de Grok 4.6, y derivaciones matemáticas y STEM de GPT 5.6 Sol), y una fase de optimización de preferencias con SimPO para alinear la profundidad de razonamiento y reforzar la respuesta directa sin rechazos. No se especifican en la documentación el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del pipeline de RLHF/DPO más allá de SimPO. La innovación adicional destacada es DFlash2, una cabeza de predicción multi-token (MTP) situada en `blk.64.*` que genera candidatos de draft en paralelo para que el modelo principal los valide en un único forward pass, reduciendo la latencia autorregresiva; se puede invocar en `llama.cpp` mediante `--spec-draft-n-max 7` o `--spec-type draft-mtp`.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat orientada a agentes ("hardened agentic chat template") y control del esfuerzo de razonamiento.
- Razonamiento explícito con cadenas de pensamiento (CoT) y delimitadores `<think>`, entrenado específicamente sobre trazas de razonamiento largas.
- Generación de código y tareas de programación, con avisos explícitos del autor sobre sintaxis y penalización de repetición en este dominio.
- Matemáticas y derivaciones STEM, según la composición del dataset de SFT (pruebas matemáticas y derivaciones de GPT 5.6 Sol).
- Modo "uncensored": respuesta directa a prompts técnicos, de red teaming, pruebas de penetración y análisis de temas controvertidos, sin rechazos corporativos.
- Decodificación especulativa multi-token mediante la cabeza DFlash2, con soporte de `--spec-draft-n-max 7` y `--spec-type draft-mtp` en `llama.cpp` y "DFlash2 verify block size 8" en SGLang.
- Compatibilidad con agentes autónomos: la model card cita compatibilidad nativa completa con Lynn Agent (v0.87.0+) para uso de herramientas, ejecución multi-turno en terminal y bucles de agente a escala de repositorio.
- Capacidad de tool calling / function calling: no se detalla explícitamente en la información disponible; se infiere únicamente del soporte declarado de agentes y de los parsers de razonamiento en vLLM.
- Capacidades de visión o audio: no disponibles (no se mencionan).
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Red teaming y pruebas de penetración: el modelo está entrenado para no rechazar prompts de seguridad ofensiva, por lo que resulta adecuado para generar hipótesis de ataque, análisis de vulnerabilidades y guiones de explotación en entornos controlados de auditoría.
- Razonamiento matemático y derivaciones STEM: las trazas de SFT incluyen pruebas matemáticas y derivaciones científicas, lo que lo hace utilizable para asistir en demostraciones formales y resolución de problemas de varios pasos con CoT explícito.
- Asistente de programación en local: al ser GGUF y ejecutable con `llama.cpp b11000+`, se puede integrar en entornos de desarrollo sin conexión; el autor advierte de la necesidad de ajustar la penalización de repetición por un problema conocido en la sintaxis de código.
- Agentes autónomos con ejecución en terminal: la compatibilidad declarada con Lynn Agent v0.87.0+ permite bucles de agente multi-turno sobre repositorios completos, con tool use y ejecución de comandos.
- Despliegue de razonamiento de contexto largo en una sola GPU de 24 GB: la propuesta de valor principal es ejecutar la ventana completa de 256K tokens en VRAM de consumo, útil para analizar documentos técnicos extensos, actas o bases de código grandes sin trocear.
- Servicio de inferencia con decodificación especulativa: al integrar la cabeza DFlash2, es adecuado para endpoints de baja latencia en `vLLM` o `SGLang`, donde la validación multi-token reduce el coste por token generado.
- Generación de datos sintéticos y aumentación de datasets: al ser un modelo sin censura y con CoT largo, puede emplearse para producir trazas de razonamiento etiquetadas en pipelines de destilación internos.
- Análisis de contenido sensible o controvertido: investigación en ciencias sociales o análisis de discurso que requieran respuestas no evasivas sobre material delicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye una tabla de fidelidad de cuantización frente a BF16, pero los datos están truncados; solo son legibles las siguientes filas:

| Formato de cuantización | Bits por peso (BPW) | Huella en disco / VRAM | Delta de perplejidad vs. BF16 |
|---|---|---|---|
| FP16 / BF16 (sin comprimir) | 16,0 bpw | ~53,8 GB | 0,00 % (referencia) |
| Q8_0 estándar | 8,50 bpw | ~29,5 GB | truncado en la información disponible |
| VAL-APEX-I MiniPlus V2.1 | no disponible | no disponible (repo completo: 30,2 GB) | no disponible |

## Requisitos de hardware

- VRAM para BF16/FP16: aproximadamente 53,8 GB de pesos, lo que exige una H100 de 80 GB, una A100 de 80 GB o dos GPUs de 40 GB con tensor parallelism.
- VRAM para Q8_0 estándar: aproximadamente 29,5 GB, viable en una A100 40 GB o repartido entre dos GPUs de 24 GB.
- VRAM para VAL-APEX-I MiniPlus V2.1: el autor afirma que permite ejecutar el contexto completo de 256K tokens en GPUs de 24 GB; no se detalla el BPW exacto de la variante MiniPlus.
- GPUs de consumo compatibles: RTX 3090, RTX 4090 y tarjetas de 24 GB en adelante; con cuantizaciones más agresivas o descarga parcial a CPU/VRAM también cabría en GPUs de 16 GB, aunque esto no está documentado por el autor.
- GPUs profesionales recomendadas: A100 40/80 GB, H100 80 GB, y GPUs de 24 GB para la variante MiniPlus.
- Opciones de despliegue documentadas: `llama.cpp` / `llama-server` (builds b11000+ con soporte de arquitecturas híbridas DeltaNet SSM), `vLLM` (con `--reasoning-parser qwen3 --max-model-len 40960`), `SGLang` (motor principal probado por el autor, con DFlash2 verify block size 8) y Lynn Agent v0.87.0+.
- Formatos GGUF: al ser ficheros GGUF, son consumibles por otros runners basados en `llama.cpp` distintos de los citados, aunque el autor no los documenta explícitamente.
- Latencia y throughput: no disponibles. Cualitativamente, el autor indica que la decodificación especulativa DFlash2 reduce la latencia autorregresiva al validar varios tokens candidatos en un solo forward pass.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos públicos comparables en la información proporcionada. La comparación posible se limita a las alternativas dentro del propio ecosistema del modelo base:

| Modelo / variante | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VAL-APEX-I MiniPlus V2.1 (este repo) | ~26,9 B | 256K declarados | apache-2.0 | GGUF, 0 descargas, 2 likes |
| Modelo base nerkyor/Qwen3.8-27B-...-SimPO-DFlash2 | ~26,9 B | no disponible | no disponible en la información proporcionada | safetensors en Hugging Face |
| Cuantizaciones planas (`Q4_K_M`, `Q5_K_M`) del mismo base | ~26,9 B | 256K declarados | apache-2.0 | GGUF (referenciadas como alternativa, sin repositorio concreto indicado) |
| Colección VAL-APEX-I completa | varía por modelo | no disponible | no disponible | Colección de Hugging Face de IsValorum |

Comparativas con modelos de otros autores (por ejemplo, otros modelos de ~27B de razonamiento): no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" por diseño: no incorpora rechazos de seguridad, por lo que puede producir contenido ofensivo, ilegal o peligroso si se despliega sin moderación externa. No es apto para aplicaciones orientadas al público sin capas de filtrado adicionales.
- Entrenamiento sobre datos sintéticos generados por modelos frontera (Claude Opus, Grok 4.6, GPT 5.6 Sol): existe riesgo de heredar sesgos, errores factuales y artefactos de estilo de esos modelos, además de posibles dudas sobre la trazabilidad y los términos de uso de los datos sintéticos.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación; en ausencia de benchmarks, la fiabilidad factual no está cuantificada.
- Idioma: únicamente inglés según los metadatos. El rendimiento en castellano u otras lenguas no está documentado y previsiblemente será degradado.
- Aviso crítico del propio autor sobre sintaxis de código y penalización de repetición: la model card incluye una sección específica ("Coding Syntax & Repeat Penalty Advisory") cuyo contenido no está disponible en la información proporcionada; se debe consultar antes de usar el modelo en producción para generación de código.
- Estabilidad de cuantización dependiente del esquema propietario VAL-APEX-I: los tensores SSM en `F32` y la cabeza en `Q6_K` aumentan el tamaño del fichero respecto a cuantizaciones planas equivalentes; los BPW y la huella exacta de esta variante no se detallan.
- Compatibilidad de runtime limitada en la práctica: requiere builds recientes de `llama.cpp` (b11000+) para la arquitectura híbrida DeltaNet; en motores más antiguos el modelo puede no cargar o degradar su rendimiento.
- Adopción y validación comunitaria nulas: 0 descargas y 2 likes en el momento de la ficha, sin evaluaciones independientes publicadas.
- Licencia Apache 2.0 permite uso comercial, pero no cubre las obligaciones derivadas de los datos de entrenamiento del modelo base, cuya licencia y condiciones no se especifican en la documentación disponible.
- La denominación "Qwen3.8-27B" del modelo base no se corresponde con una publicación oficial verificable en la información proporcionada; conviene confirmar la procedencia real de los pesos antes de un despliegue en producción.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Colección VAL-APEX-I: https://huggingface.co/collections/IsValorum/val-apex-i-6ac563d1784a04a1bb177f47
- Papers, blogs o demos adicionales: no disponibles en los resultados de búsqueda proporcionados (los resultados devueltos no guardan relación con el modelo).
