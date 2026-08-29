# pipenetwork/GLM-5.3-MLX-8bit

## Resumen

GLM-5.3-MLX-8bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3 de Z.ai, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 744 mil millones de parámetros en total, de los cuales 40 mil millones se activan por token. La arquitectura, denominada `glm_moe_dsa`, combina atención multi-latente (MLA) con atención dispersa estilo DeepSeek-V3.2 y 256 expertos enrutados con selección top-8. Este build concreto está cuantizado a 8 bits con grupo de 64, y se distribuye como archivos safetensors listos para usar con la librería `mlx-lm`.

La relevancia de este modelo radica en que permite ejecutar un modelo de 744B en hardware Apple Silicon con memoria unificada, aunque requiere al menos 1 TB de RAM. El autor, PipeNetwork, ha desarrollado un runtime específico que corrige un problema de inicialización del indexador de atención dispersa en capas compartidas, garantizando que la generación sea correcta más allá de 2048 tokens de contexto. El modelo está pensado para tareas complejas de ingeniería de software y trabajo agéntico de largo horizonte, con una ventana de contexto arquitectónica de hasta 1 millón de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con 256 expertos, top-8; MLA con atención dispersa estilo DeepSeek-V3.2) |
| Parametros totales | 744B (según model card; el archivo safetensors reporta 209.301.881.856, posible error de metadata) |
| Parametros activos | 40B (según documentación de Z.ai) |
| Longitud de contexto | 1M tokens (contexto arquitectónico) |
| Tipos de cuantizacion | 8-bit (grupo 64) en este build; existen otros builds a 4, 5, 6 bits y mixtos |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (licencia propia de Z.ai, no OSI) |
| Formato de pesos | safetensors, MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3 de Z.ai, liberado en bfloat16. La arquitectura `glm_moe_dsa` es un transformer MoE con 75 capas de decodificador, cada una con 256 expertos enrutados (top-8) en el bloque `switch_mlp`, más una capa de atención multi-latente (MLA) con un mecanismo de atención dispersa que reduce el coste computacional en contextos largos. Un indexador ligero (lightning indexer) se aplica en 21 de las 78 capas totales; las otras 57 capas "compartidas" reutilizan la selección top-k de la capa completa anterior, siguiendo el esquema de GLM-5.2/5.3. El modelo también incluye una capa de predicción multi-token (capa 78) que no se ha incluido en esta conversión.

No se dispone de información sobre los datos de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. La conversión a MLX se realizó a partir del release bf16, no del release FP8, porque este último es una derivación con pérdida (los pesos dequantizados difieren hasta 1.6e-2 respecto a bf16). El runtime incluido en el checkpoint implementa el mismo esquema de indexación que la referencia, con puntuaciones del indexador y logits del router en fp32, y una epsilon de LayerNorm específica.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte para instrucciones complejas.
- Razonamiento avanzado y resolución de problemas, especialmente en dominios de ingeniería de software y matemáticas.
- Generación de código y asistencia en programación, gracias a su entrenamiento orientado a tareas de desarrollo.
- Trabajo agéntico de largo horizonte: puede mantener coherencia en tareas que requieren múltiples pasos y contexto extenso (hasta 1M tokens).
- Comprensión de contexto muy largo, lo que permite procesar repositorios completos, documentación extensa o conversaciones prolongadas.
- Capacidades multilingües: no se han especificado los idiomas soportados, pero al ser un modelo de propósito general, se espera cobertura de los principales idiomas.
- No se confirma soporte de tool calling o function calling en la información disponible, aunque su orientación a agentes sugiere que podría tenerlo.

## Casos de uso

- Ingeniería de software asistida: el modelo puede analizar repositorios completos, generar código, refactorizar y detectar errores, gracias a su contexto de 1M tokens y su entrenamiento específico en tareas de desarrollo.
- Agentes autónomos de largo plazo: su capacidad de razonamiento multi-paso y contexto extenso lo hace adecuado para agentes que deben planificar y ejecutar tareas complejas, como automatización de procesos o investigación.
- Análisis y resumen de documentación técnica: puede procesar manuales, especificaciones o papers extensos y generar resúmenes o extraer información relevante.
- Asistencia en depuración de código: con su comprensión de lenguajes de programación, puede identificar causas de errores y sugerir correcciones en proyectos grandes.
- Generación de documentación de código: a partir de código fuente, puede crear comentarios, docstrings y guías de uso.
- Simulación de conversaciones de soporte técnico: su capacidad conversacional y de contexto largo permite mantener diálogos coherentes con usuarios, aunque no se confirma tool calling para integración con APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de calidad de cuantización, que no son comparables con benchmarks de rendimiento del modelo, pero se presentan a continuación como referencia:

**Perplejidad en wikitext-2 (test)** para builds que caben en una máquina de 512 GB:

| Build | Tamaño | Perplejidad [95% CI] |
|---|---|---|
| 4bit | 418.6 GB | 2.8636 [2.6681, 3.0714] |
| mixed-4_8bit | 427.8 GB | 2.7420 [2.5533, 2.9477] |
| mixed-3_6bit | 332.6 GB | 3.0338 [2.8366, 3.2386] |
| REAP25-4bit | 316.6 GB | 3.2872 [3.0703, 3.5184] |
| REAP37-4bit | 267.2 GB | 3.8517 [3.6212, 4.0937] |
| REAP50-4bit | 214.7 GB | 5.0295 [4.7571, 5.3137] |

**Divergencia por capa vs bf16** (error L2 relativo, menor es mejor):

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---|---|---|
| 8bit | 0.00685 | 0.13119 | 0.98945 |
| 6bit | 0.01465 | 0.16736 | 0.98389 |
| 5bit | 0.02651 | 0.22521 | 0.97272 |
| 4bit | 0.05161 | 0.35740 | 0.93390 |
| mixed-4_8bit | 0.02524 | 0.24951 | 0.96710 |
| mixed-3_6bit | 0.05242 | 0.42380 | 0.90624 |
| fp8 | 0.01741 | 0.17321 | 0.98320 |

El build 8-bit no pudo ser evaluado en perplejidad por no caber en la máquina de 512 GB, pero su divergencia free-running (0.131) es la más baja de todos los builds, lo que indica que es el más fiel al original bf16.

## Requisitos de hardware

- Este build de 8-bit requiere al menos 1 TB de RAM unificada (la model card indica "RAM: 1 TB+ (two machines)"). No cabe en una máquina de 512 GB.
- Está diseñado exclusivamente para Apple Silicon (procesadores M-series) con la librería MLX. No se menciona soporte para GPUs NVIDIA o AMD.
- Para máquinas con 512 GB de RAM, se recomienda el build mixed-4_8bit (427.7 GB) o el uniforme 4-bit (418.6 GB) como alternativa.
- El despliegue se realiza con `mlx-lm` (pip install -U mlx-lm) y el comando `mlx_lm.generate` con `--trust-remote-code`, ya que el checkpoint incluye un runtime personalizado (`glm_moe_dsa.py`).
- No se proporcionan datos de latencia o throughput. Dado el tamaño del modelo, se espera una generación lenta incluso en hardware de gama alta.

## Comparativa con modelos similares

La comparativa más relevante es entre los distintos builds MLX del mismo modelo, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

| Build | Tamaño | Perplejidad (wikitext-2) | Divergencia free-running | Uso recomendado |
|---|---|---|---|---|
| 8bit (este) | ~790 GB (repo) | no evaluado | 0.131 | Máquinas con 1 TB+ RAM |
| 6bit | no disponible | no evaluado | 0.167 | Máquinas con ~600 GB RAM |
| mixed-4_8bit | 427.8 GB | 2.7420 | 0.250 | Máquinas con 512 GB RAM |
| 4bit | 418.6 GB | 2.8636 | 0.357 | Máquinas con 512 GB RAM |
| mixed-3_6bit | 332.6 GB | 3.0338 | 0.424 | Máquinas con 384 GB RAM |

Frente al modelo original bf16 (que requiere más de 1.5 TB de RAM), el build 8-bit es la opción más fiel en calidad, con una divergencia free-running de 0.131 y un coseno de 0.989. El build FP8 oficial de Z.ai tiene una divergencia de 0.173, peor que el 8-bit, por lo que esta conversión parte del bf16.

## Limitaciones y advertencias

- La capa de predicción multi-token (capa 78) no está incluida en este build, lo que puede afectar ligeramente a la velocidad de generación y a la calidad en tareas que se beneficien de esa característica.
- El runtime incluido es necesario para un funcionamiento correcto más allá de 2048 tokens. Si se usa `mlx-lm` estándar sin el `model_file` declarado, 57 de las 78 capas tendrán indexadores inicializados aleatoriamente, lo que degrada la atención dispersa en contextos largos.
- La licencia `glm-5.3` es una licencia propia de Z.ai, no OSI. Es necesario revisar sus términos para uso comercial, especialmente en aplicaciones de producción.
- El modelo requiere una cantidad de RAM muy elevada (1 TB+), lo que limita su despliegue a estaciones de trabajo muy específicas o clústeres de Mac.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad. Como modelo de gran tamaño, es probable que presente sesgos presentes en los datos de entrenamiento, aunque no hay información al respecto.
- La cuantización 8-bit introduce una divergencia del 0.131 en la salida final respecto a bf16, que aunque es la menor entre los builds, puede ser perceptible en tareas de alta precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-MLX-8bit
- Repositorio del runtime y código de conversión: https://github.com/PipeNetwork/glm53-mlx
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3
- Release bf16: https://huggingface.co/zai-org/GLM-5.3-BF16
- Documentación de GLM-5.3 en LM Studio: https://lmstudio.ai/models/glm-5.3
- Guía de ejecución local con Unsloth: https://unsloth.ai/docs/models/glm-5.3
