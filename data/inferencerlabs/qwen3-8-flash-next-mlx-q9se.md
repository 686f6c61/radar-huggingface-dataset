# inferencerlabs/Qwen3.8-Flash-Next-MLX-Q9se

## Resumen

Qwen3.8-Flash-Next-MLX-Q9se es una compilación cuantizada del modelo Qwen3.8-Flash-Next, publicada por el usuario inferencerlabs (no por el equipo original de Qwen) en formato MLX para su ejecución en Apple Silicon. El modelo base es un Mixture-of-Experts de tipo híbrido con 125B parámetros en el modelo principal, a los que se suman 51B parámetros de embeddings n-gram con hashing, y solo 6B parámetros activados por token. Esta build concreta aplica una cuantización de 9 bits y utiliza streaming de n-grams y expertos desde disco, lo que permite ejecutar el modelo en equipos con memoria unificada relativamente baja manteniendo, según el autor, una calidad casi sin pérdidas.

La relevancia de esta ficha está en que documenta una de las vías prácticas para correr un MoE de gran tamaño en hardware de consumo: en lugar de exigir los aproximadamente 200 GB de VRAM que requeriría el modelo completo, el autor reporta velocidades de 4 tokens/s en un M1 Max de 64 GB y hasta 22 tokens/s en un M5 Max de 128 GB usando un decodificador especulativo MTP compatible. El pipeline declarado es image-text-to-text, es decir, admite entradas de imagen y texto, aunque la model card aportada no detalla la arquitectura del codificador visual.

La información disponible es limitada en varios aspectos clave: no se especifica la longitud de contexto, no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) y la licencia aparece como no disponible, lo que supone un blocker para uso comercial hasta confirmación. Además, el repositorio tiene 204,5 GB, por lo que la descarga y el almacenamiento son un requisito de primer orden.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida Gated-DeltaNet / Qwen-Sparse-Attention con gated residual streams y embedding n-gram con hashing (model_type: qwen4_exp) |
| Parámetros totales | 125B (modelo principal) + 51B (embeddings n-gram), ~176B en total |
| Parámetros activos | 6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 9 bits (Q9se); el tag del repositorio indica 8-bit, en discrepancia con el nombre y la model card |
| Idiomas soportados | en (inglés) según metadatos del repositorio |
| Licencia | no disponible |
| Formato de pesos | MLX (librería mlx); tamaño del repositorio 204,5 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relación: quantized) |
| Creador del modelo base | Qwen (equipo QwenLM) |
| Creador de la cuantización | inferencerlabs |
| Fecha de publicación | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE híbrida que combina capas Gated-DeltaNet (atención lineal con estado recurrente) con capas de Qwen-Sparse-Attention, añadiendo gated residual streams y un embedding n-gram con hashing de 51B parámetros. El resultado es un modelo de 125B parámetros totales con solo 6B activos por token, lo que reduce el coste de inferencia en comparación con un denso del mismo tamaño. Según el repositorio oficial, el coste de entrenamiento es aproximadamente 1/9 del de Qwen3.7-Plus manteniendo capacidades superiores en tareas de código, si bien no se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Esta build concreta no reentrena el modelo: aplica una cuantización de 9 bits con una versión modificada de MLX y añade streaming de n-grams y expertos desde almacenamiento, de modo que los pesos que no se necesitan de forma inmediata no tienen que residir en memoria. El autor publica además un decodificador especulativo MTP (multi-token prediction) en un repositorio aparte, cuya activación eleva el throughput de 14 a 22 tokens/s en un M5 Max de 128 GB. La calidad de la cuantización se documenta con métricas internas: perplejidad de 1,20312, 97,80 % de precisión de tokens y 9,60 % de divergencia perdida, frente a 1,20312 y 100 % del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de entradas imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes junto con prompts de texto. El codificador visual no está documentado en la información disponible.
- Generación de código: el repositorio del modelo base afirma capacidades superiores en tareas de programación respecto a Qwen3.7-Plus.
- Decodificación especulativa mediante decodificador MTP compatible, publicada como repositorio separado.
- Ejecución en Apple Silicon mediante MLX, con streaming de expertos y n-grams desde disco.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking explícito: no disponible (no documentado).
- Capacidades audio: no disponibles.
- Multilingüismo: limitado a inglés según los metadatos del repositorio, aunque el modelo base Qwen suele ser multilingüe; no confirmado para esta build.

## Casos de uso

- Asistente local en Mac con memoria unificada: ejecutar el modelo con MLX y streaming de expertos permite tener un MoE de ~176B parámetros en un M1 Max de 64 GB a ~4 tokens/s, útil para prototipado y uso personal sin depender de la nube.
- Análisis de documentos con imágenes: al ser un modelo image-text-to-text, se puede usar para extraer información de capturas, diagramas o documentación escaneada combinada con instrucciones en texto, en un flujo completamente local.
- Asistencia de programación offline: integrado en un editor o CLI sobre MLX, el modelo puede generar y explicar código sin enviar el repositorio a un servicio externo, lo que encaja en entornos con requisitos de confidencialidad.
- Procesamiento por lotes en estaciones de trabajo Apple de gama alta: con un M5 Max de 128 GB y el decodificador MTP se alcanzan ~22 tokens/s, suficiente para tareas asíncronas de resumen, clasificación o generación de borradores a moderada escala.
- Investigación sobre cuantización y MoE: la tabla de perplejidad, precisión de tokens y divergencia perdida entre Q3.5, Q4.5, Q5.5, Q6.5, Q8.5 y Q9 sirve como referencia para estudiar el impacto de la compresión en modelos con expertos dispersos.
- Evaluación de decodificación especulativa: el par formado por esta build y el decodificador MTP permite medir la ganancia real de throughput (~57 % adicional en M5 Max) en un entorno MLX reproducible.
- Demos y generación de contenido visualmente asistido: creación de descripciones, respuestas y material a partir de capturas o imágenes, con la ventaja de no requerir conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente proporciona métricas internas de fidelidad de la cuantización:

| Cuantización (bpw) | Perplejidad | Precisión de tokens | Divergencia perdida |
|---|---|---|---|
| Q3.5 | 168,0 | 43,45 % | 72,57 % |
| Q4.5 | 1,33593 | 91,65 % | 17,28 % |
| Q5.5 | 1,23437 | 95,05 % | 17,28 % |
| Q6.5 | 1,21875 | 96,65 % | 12,03 % |
| Q8.5 | 1,21875 | 97,65 % | 9,92 % |
| Q9 (esta build) | 1,20312 | 97,80 % | 9,60 % |
| Base (sin cuantizar) | 1,20312 | 100 % | 0,000 % |

Métricas de velocidad reportadas por el autor, medidas con la aplicación Inferencer:

| Hardware | Throughput |
|---|---|
| M1 Max 64 GB | ~4 tokens/s |
| M5 Max 128 GB | ~14 tokens/s |
| M5 Max 128 GB con decodificador MTP | ~22 tokens/s |

## Requisitos de hardware

- VRAM/memoria estimada: LLM Explorer cifra el requisito en ~200,6 GB para el conjunto de pesos; gracias al streaming de expertos y n-grams, la build puede funcionar en configuraciones de 64 GB de memoria unificada.
- Almacenamiento: 204,5 GB de repositorio, más espacio adicional para caché y para el decodificador MTP si se usa.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). El autor reporta pruebas en M1 Max de 64 GB y M5 Max de 128 GB. No hay soporte documentado para A100, H100 ni RTX 4090 en esta build.
- Cabe en GPU de consumo: sí, en el sentido de equipos Apple con memoria unificada; no está pensada para GPU discretas NVIDIA o AMD.
- Opciones de despliegue: MLX (librería declarada), la aplicación Inferencer citada por el autor, y decodificador especulativo MTP opcional. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~4 tokens/s en M1 Max 64 GB; ~14 tokens/s en M5 Max 128 GB; ~22 tokens/s con MTP en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B n-gram | 6B | no disponible | no disponible | HuggingFace (Qwen/Qwen3.8-Flash-Next) |
| Qwen3.8-Flash-Next-MLX-Q9se (esta ficha) | 125B + 51B n-gram, cuantizado a 9 bits | 6B | no disponible | no disponible | HuggingFace (inferencerlabs), MLX |
| Qwen3.8-Flash-Next-MLX-Q9 | 125B + 51B n-gram, cuantizado a 9 bits | 6B | no disponible | no disponible | HuggingFace (inferencerlabs) |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referencia comparativa citada por el autor del modelo base |

La comparación relevante es frente al modelo base sin cuantizar (mayor precisión, ~200 GB de pesos, sin streaming) y frente a las variantes de menor precisión del mismo autor (Q4.5 a Q8.5), que reducen tamaño a costa de precisión de tokens y divergencia. No se dispone de datos de benchmarks que permitan comparar capacidades reales con modelos de otras familias.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial. Es un blocker para producción hasta verificar la licencia del modelo base Qwen3.8-Flash-Next y los términos aplicables a la cuantización.
- Modelo derivado: esta build la publica un tercero (inferencerlabs), no Qwen. El autor declina expresamente responsabilidad sobre exactitud o adecuación contextual del contenido generado.
- Idiomas: los metadatos solo declaran inglés; el rendimiento en castellano no está verificado y podría degradarse respecto al modelo base.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo de contexto largo sin verificarla empíricamente.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización a 9 bits introduce además un 9,60 % de divergencia perdida y un 2,20 % de tokens generados incorrectamente respecto al base.
- Ambigüedad de cuantización: el nombre indica Q9, la model card dice 9 bits y el tag del repositorio indica 8-bit; conviene verificar la configuración real de los pesos antes de desplegar.
- Dependencia de hardware: MLX limita la ejecución a Apple Silicon; no hay rutas documentadas para CUDA, ROCm ni CPU x86.
- Streaming desde disco: el rendimiento depende fuertemente de la velocidad del almacenamiento (NVMe); discos lentos degradarán el throughput por debajo de las cifras reportadas.
- Coste de almacenamiento y descarga: 204,5 GB de repositorio, con requisitos adicionales si se añade el decodificador MTP.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/inferencerlabs/Qwen3.8-Flash-Next-MLX-Q9se
- Variante Q9 del mismo autor: https://huggingface.co/inferencerlabs/Qwen3.8-Flash-Next-MLX-Q9
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Runtime y tooling MLX de terceros: https://github.com/PipeNetwork/qwen38-flash-next-mlx
- Búsqueda de decodificadores MTP compatibles: https://huggingface.co/models?search=inferencerlabs/qwen3.8-flash-next-mtp-mlx
- Vídeos de demostración: https://youtube.com/xcreate
- Aplicación Inferencer: https://inferencer.com
- Ficha en LLM Explorer: https://llm-explorer.com/model/inferencerlabs%2FQwen3.8-Flash-Next-MLX-Q9,4LH1yC74NYMCLxOnTxGGGO
- MLX (framework): https://github.com/ml-explore/mlx
