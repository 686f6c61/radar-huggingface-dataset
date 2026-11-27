# bambocher/Qwen3.5-2B-heretic

## Resumen

Qwen3.5-2B-heretic es una variante "decensored" (o "abliterated") del modelo multimodal Qwen3.5-2B de Alibaba Qwen, publicada por el usuario bambocher. El proceso de eliminacion de rechazos se ha realizado con la herramienta Heretic v2.0.0 mediante una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 12 a 23 del modelo, conservando intacta la cabeza de prediccion multi-token (MTP) del modelo original.

El modelo base Qwen3.5-2B es un modelo causal de lenguaje con codificador de vision, de aproximadamente 2.213 millones de parametros (2,2B), con una longitud de contexto nativa de 262.144 tokens. Emplea una arquitectura hibrida que combina Gated Delta Networks (atencion lineal) con atencion con compuertas (Gated Attention) en un esquema de 24 capas, y fue entrenado con fusion temprana de tokens multimodales y aprendizaje por refuerzo a gran escala.

La relevancia de esta ficha radica en que ofrece una alternativa sin rechazos del modelo base, manteniendo las capacidades multimodales y el contexto largo, con licencia Apache 2.0 y pesos en formato safetensors compatibles con transformers, vLLM, SGLang y KTransformers. El autor documenta el proceso de ablacion y lo hace reproducible, lo que permite auditar y replicar la modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; hibrida de Gated DeltaNet (atencion lineal) y Gated Attention; 24 capas |
| Parametros totales | 2.213.241.664 (2,2B) |
| Parametros activos | no disponible (no se especifica si es MoE; la model card del base menciona "sparse Mixture-of-Experts" como rasgo de la familia, pero no se detalla para esta variante) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible en esta ficha; el modelo base declara cobertura de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura hibrida: 24 capas organizadas en 6 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). La Gated DeltaNet usa 16 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 8 cabezas para Q y 2 para KV con dimension de cabeza 256 y RoPE de dimension 64. La dimension oculta es 2048, la dimension intermedia del FFN es 6144 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. Se entrena con prediccion multi-token (MTP) en varios pasos, y esa cabeza MTP se conserva en esta variante.

El modelo base se entrena en dos fases (pre-entrenamiento y post-entrenamiento) con fusion temprana de tokens multimodales, alcanzando paridad cross-generacional con Qwen3 y superando a los modelos Qwen3-VL en razonamiento, codigo, agentes y comprension visual. El aprendizaje por refuerzo se escala sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La variante heretic aplica una ablacion de rango arbitrario (ARA) sobre las capas 12 a 23 con los parametros documentados: `start_layer_index=12`, `end_layer_index=23`, `preserve_good_behavior_weight=0.9189`, `steer_bad_behavior_weight=0.0008`, `overcorrect_relative_weight=0.9924`, `neighbor_count=14`. El autor reporta 0 rechazos de 100 frente a 97 de 100 del modelo original, con una divergencia KL de 0,1397 respecto al base.

## Capacidades

- Generacion de texto y razonamiento en modo instruct (no-thinking) y, presumiblemente, modo thinking segun el modelo base.
- Comprension de imagenes y texto (pipeline image-text-to-text) gracias al codificador de vision integrado.
- Generacion de codigo y resolucion de problemas matematicos, segun los benchmarks del modelo base.
- Soporte de tool calling / function calling, heredado del modelo base (compatible con transformers, vLLM, SGLang, KTransformers).
- Capacidades de agente y razonamiento multi-paso, reforzadas por el entrenamiento RL del base.
- Multilingue: el base declara 201 idiomas y dialectos.
- Modo sin rechazos: la ablacion elimina las respuestas de negativa del modelo original.
- Prediccion multi-token (MTP) conservada, lo que puede habilitar decodificacion especulativa.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede procesar imagenes y texto en la misma conversacion, adecuado para demos y pruebas de concepto con contexto de hasta 262.144 tokens.
- Fine-tuning especifico de tarea: al ser un modelo de 2,2B con licencia Apache 2.0, es viable ajustarlo en una sola GPU para dominios concretos (legal, medico, atencion al cliente) sin restricciones de uso comercial.
- Generacion de codigo en pipelines de desarrollo: soporta tool calling y puede integrarse en flujos de CI/CD o asistentes de IDE, con la ventaja de un tamano reducido para despliegue local.
- Analisis de documentos largos con imagenes: gracias al contexto nativo de 262.144 tokens y al codificador de vision, puede resumir o extraer informacion de informes escaneados y texto extenso.
- Investigacion sobre alineacion y seguridad: al ser una variante decensored reproducible, sirve para estudiar el efecto de la ablacion sobre el comportamiento del modelo y comparar con el base.
- Despliegue en entornos con recursos limitados: con 2,2B de parametros, cabe en GPUs de consumo y permite inferencia local en estaciones de trabajo.
- Atencion al cliente automatizada multi-turno: el contexto largo permite mantener historiales extensos sin truncamiento, aunque la ausencia de rechazos exige moderacion externa.

## Benchmarks y rendimiento

Resultados reportados por el autor de la variante heretic frente al modelo base:

| Metrica | Este modelo | Qwen/Qwen3.5-2B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definicion) |

Resultados del modelo base Qwen3.5-2B en modo instruct (no-thinking), segun la model card del base:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks propios de la variante heretic mas alla de los rechazos y la divergencia KL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 2,2B de parametros en FP16 se requieren aproximadamente 4,4 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits o 4 bits el requisito baja sustancialmente (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 o A100/H100 son suficientes y sobradas para FP16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (segun la model card del base); no se listan GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic | 2,2B | 262.144 | Apache 2.0 | Texto + imagen | Variante decensored, 0/100 rechazos |
| Qwen/Qwen3.5-2B | 2,2B | 262.144 | Apache 2.0 | Texto + imagen | Modelo base, 97/100 rechazos |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 | Texto | MMLU-Pro 40,2 |
| Qwen3-4B-2507 | 4B | no disponible | Apache 2.0 | Texto | MMLU-Pro 69,6 |

## Limitaciones y advertencias

- La ablacion elimina los rechazos, lo que implica que el modelo puede generar contenido danino, ilegal o inapropiado sin filtros propios; requiere moderacion externa en produccion.
- La divergencia KL de 0,1397 respecto al base indica una modificacion no trivial de la distribucion de salida, con posible degradacion en tareas sensibles.
- Riesgo de alucinacion inherente a modelos de 2,2B, especialmente en razonamiento complejo y contexto muy largo.
- No se documentan sesgos especificos ni evaluaciones de seguridad de esta variante.
- La model card no detalla los idiomas soportados de la variante; la cobertura de 201 idiomas corresponde al modelo base.
- No se ofrecen cuantizaciones GGUF ni formatos alternativos, lo que limita el despliegue en entornos sin transformers/vLLM.
- El uso comercial esta permitido por la licencia Apache 2.0, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado.
- El proceso de ablacion es reproducible segun el autor, pero no se han publicado evaluaciones independientes de esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
