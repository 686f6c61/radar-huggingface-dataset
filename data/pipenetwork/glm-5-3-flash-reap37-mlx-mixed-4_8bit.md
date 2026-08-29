# pipenetwork/GLM-5.3-Flash-REAP37-MLX-mixed-4_8bit

## Resumen

GLM-5.3-Flash-REAP37-MLX-mixed-4_8bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3-Flash de Z.ai, un modelo multimodal de 320 mil millones de parámetros con 18 mil millones activos (320B-A18B). Esta versión concreta, publicada por el usuario pipenetwork, aplica una poda REAP que elimina el 37% de los expertos enrutados (107 de 288 por capa) y una cuantización mixta de 4 bits para los expertos y 8 bits para el resto de los componentes, reduciendo el tamaño del checkpoint de 642,7 GB (bfloat16 original) a 118,3 GB. El resultado es un modelo que cabe en equipos Apple Silicon con memoria unificada de al menos 128 GB, manteniendo una degradación de perplejidad moderada respecto a la versión sin podar.

La relevancia de esta build radica en que permite ejecutar localmente un modelo de la clase de GLM-5.3-Flash en hardware de consumo (Apple Silicon de gama alta), algo inviable con el checkpoint original. La arquitectura híbrida combina 34 capas de atención lineal Kimi-Delta con 11 capas de atención dispersa DeepSeek (NoPE MLA con lightning indexer), más hyper-connections con restricción de manifold. El modelo conserva la torre de visión en bfloat16, por lo que mantiene capacidades multimodales imagen-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 34 capas Kimi-Delta linear-attention + 11 capas DeepSeek-sparse-attention (NoPE MLA + lightning indexer), MoE con 288 expertos enrutados por capa (42 capas MoE) y 3 capas densas, hyper-connections con restricción de manifold |
| Parametros totales | 320B (A18B) según el modelo base; el archivo safetensors reporta 33.014.627.760 parámetros, cifra inconsistente con el tamaño del repo (118,3 GB) y probablemente referida a una parte de los pesos |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (expertos enrutados, grupo 64), 8-bit (KDA, MLA projections, shared experts, dense MLPs, embeddings, lm_head, lightning-indexer), bfloat16 (torre de visión), fp32 (mHC arrays, KDA A_log/dt_bias, convoluciones, normas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE híbrido de 320B parámetros con 18B activos. La arquitectura combina 34 capas de atención lineal tipo Kimi-Delta (que reducen el coste cuadrático de la atención) con 11 capas de atención dispersa DeepSeek basadas en MLA sin positional encoding (NoPE) y un lightning indexer para acelerar la recuperación. Las capas se conectan mediante hyper-connections con restricción de manifold (mHC), que estabilizan el entrenamiento de arquitecturas híbridas. El modelo incluye una torre de visión de 0,56B parámetros para entrada de imágenes.

Esta build concreta no es un entrenamiento nuevo, sino una conversión y compresión del checkpoint bfloat16 original. El proceso consistió en: (1) convertir los pesos a MLX, (2) cuantizar a 8 bits como paso intermedio, (3) aplicar poda REAP (saliency-based expert pruning) que selecciona los 181 expertos con mayor saliency media (router_weight × ‖expert_output‖) sobre 65.536 tokens de calibración, y (4) cuantizar los expertos restantes a 4 bits y el resto a 8 bits. La capa de multi-token-prediction (capa 45) no se incluye en esta build. El runtime recomendado es el fork de PipeNetwork (glm53-flash-mlx), que corrige dos bugs numéricos y dos discrepancias de epsilon presentes en mlx-vlm main, logrando paridad 1e-6 con transformers 5.16.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, aunque esta build podada puede mostrar degradación en tareas complejas.
- Procesamiento de imágenes: al conservar la torre de visión en bfloat16, mantiene capacidades de entrada imagen-texto (image-text-to-text), como responder preguntas sobre imágenes o generar descripciones.
- Codigo y matematicas: el modelo base GLM-5.3-Flash destaca en benchmarks de codigo y agentes (según la documentación de unsloth), pero no se han verificado en esta build concreta.
- Soporte de tool calling / function calling: no documentado en la información disponible para esta conversión.
- Soporte de agentes y multi-step reasoning: no documentado específicamente, aunque el modelo base lo soporta.
- Capacidades multilingues: no disponibles en la información.
- Capacidades especiales: al ser una build MLX, está optimizada para Apple Silicon; no incluye la capa de multi-token-prediction.

## Casos de uso

- Asistente de codigo local en Mac Studio o MacBook Pro con 128 GB de RAM: el modelo puede autocompletar y generar funciones en multiples lenguajes, aprovechando los 18B activos para una latencia razonable en generación.
- Analisis de documentos largos con contexto amplio: aunque la longitud de contexto no está documentada, el modelo base soporta ventanas largas; con la atención lineal Kimi-Delta, el coste de procesar secuencias extensas es menor que en transformers clásicos.
- Generación de informes técnicos a partir de capturas de pantalla o diagramas: la torre de visión permite alimentar imágenes y obtener texto descriptivo o resúmenes.
- Prototipado de agentes conversacionales en entornos sin conexión: al ser un modelo local, no requiere API externa, adecuado para desarrollo y pruebas de chatbots con datos sensibles.
- Investigación en compresión de modelos: esta build sirve como caso de estudio de poda REAP y cuantización mixta en arquitecturas MoE híbridas, permitiendo comparar perplejidad y tamaño.
- Despliegue en entornos con restricciones de ancho de banda: el checkpoint de 118,3 GB es mucho más manejable que los 642,7 GB originales, facilitando la distribución y el almacenamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de calidad proporcionada es la perplejidad en wikitext-2 (test), medida con ventanas idénticas de 2048 tokens a través del runtime de PipeNetwork. La siguiente tabla compara esta build con otras versiones del mismo modelo:

| Build | Tamaño | Perplejidad | ΔNLL/token vs 8-bit [95% CI] | Ventanas peores (de 141) |
|---|---:|---:|---|---:|
| 8-bit | 334,1 GB | 3,4607 | — | — |
| 6-bit | 255,9 GB | 3,4646 | +0,0011 [−0,0017, +0,0038] | 89 |
| mixed-4_8bit (sin poda) | 181,9 GB | 3,5705 | +0,0312 [+0,0271, +0,0355] | 131 |
| 4-bit uniforme | 177,6 GB | 3,7549 | +0,0816 [+0,0755, +0,0879] | 140 |
| REAP25-mixed-4_8bit | 139,1 GB | 4,2249 | +0,1995 [+0,1657, +0,2377] | 139 |
| **REAP37-mixed-4_8bit (esta build)** | **118,3 GB** | **4,8752** | **+0,3427 [+0,2968, +0,3929]** | **141** |
| REAP50-mixed-4_8bit | 96,3 GB | 6,0757 | +0,5628 [+0,5071, +0,6219] | 141 |
| REAP25-4bit | — | 4,4361 | +0,2483 [+0,2135, +0,2873] | 141 |
| REAP37-4bit | — | 5,1057 | +0,3889 [+0,3424, +0,4393] | 141 |
| REAP50-4bit | — | 6,3840 | +0,6123 [+0,5552, +0,6722] | 141 |

La poda REAP37 introduce una degradación de perplejidad del +9,9% respecto al 8-bit sin podar, y pierde en las 141 ventanas evaluadas. Es un coste significativo, aunque el ahorro de memoria es considerable (215,8 GB menos que el 8-bit).

## Requisitos de hardware

- Memoria unificada: el checkpoint ocupa 118,3 GB en disco, por lo que se necesita al menos 128 GB de RAM unificada en Apple Silicon para cargarlo, y probablemente 192 GB para dejar margen al runtime y a los buffers de inferencia.
- Chips compatibles: Apple Silicon (M1 Ultra, M2 Ultra, M3 Ultra, M4 Max/Ultra) con 128 GB o más de memoria unificada. No es compatible con GPUs NVIDIA o AMD sin una conversión adicional a otro formato.
- Opciones de despliegue: runtime específico de PipeNetwork (glm53-flash-mlx) o mlx-vlm main (con bugs conocidos). No se menciona soporte para vLLM, llama.cpp u Ollama en esta build.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un MoE con 18B activos, la generación será más rápida que un modelo denso de 320B, pero la cuantización 4-bit y la poda pueden afectar a la calidad de las predicciones.
- Almacenamiento: se requieren 118,3 GB de espacio en disco para los pesos, más espacio para el runtime y los caches.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables (mismo tamaño o misma tarea) en la información proporcionada. La comparativa más relevante es con las otras builds del mismo GLM-5.3-Flash, que se muestran en la tabla de benchmarks. Frente a la versión 8-bit sin podar, esta build REAP37 ofrece un 64,6% menos de tamaño a cambio de un +40,9% de perplejidad relativa. Frente a la versión 4-bit uniforme sin podar, es un 33,4% más pequeña pero con +29,8% de perplejidad relativa. La elección entre builds depende del presupuesto de memoria disponible y de la tolerancia a la degradación de calidad.

## Limitaciones y advertencias

- La poda REAP37 elimina el 37% de los expertos enrutados, lo que degrada la perplejidad en un +9,9% respecto al 8-bit sin podar y empeora en todas las ventanas evaluadas. Tareas complejas como razonamiento matemático o generación de código pueden verse más afectadas que la perplejidad media.
- No se incluye la capa de multi-token-prediction (capa 45), lo que puede reducir la eficiencia de generación y la calidad en algunas tareas.
- El runtime recomendado es un fork no oficial (glm53-flash-mlx) con parches específicos; mlx-vlm main contiene bugs que afectan a la corrección numérica. Esto limita la portabilidad y el soporte.
- La licencia MIT permite uso comercial, pero el modelo base puede tener términos adicionales (no se especifican en la información).
- No se documentan sesgos específicos, pero al ser un modelo grande entrenado con datos web, es probable que herede sesgos sociales y de contenido.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o factuales.
- La longitud de contexto no está documentada en esta build; se recomienda verificar la documentación del modelo base para conocer los límites reales.
- El tamaño del archivo safetensors reportado (33B parámetros) es inconsistente con el tamaño del repo y con la arquitectura declarada; esto puede deberse a metadatos incompletos o a que solo se contabiliza una parte de los pesos. Se recomienda verificar la integridad del checkpoint antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace de esta build: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP37-MLX-mixed-4_8bit
- Modelo base (bfloat16): https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo base BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Runtime y tooling de PipeNetwork: https://github.com/PipeNetwork/glm53-flash-mlx
- Build 8-bit del mismo modelo: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-8bit
- Build 6-bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-6bit
- Build mixed-4_8bit sin poda: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-mixed-4_8bit
- Build 4-bit uniforme: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-4bit
- Build REAP25-mixed-4_8bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP25-MLX-mixed-4_8bit
- Build REAP50-mixed-4_8bit: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP50-MLX-mixed-4_8bit
- Documentación de unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3-flash
