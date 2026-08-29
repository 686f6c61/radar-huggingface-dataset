# introvoyz042/OProver-8B

## Resumen

OProver-8B es un modelo de lenguaje de 8 mil millones de parámetros especializado en demostración de teoremas formales en Lean 4, desarrollado por el equipo Multimodal Art Projection (M-A-P). Se basa en la arquitectura Qwen3-8B y ha sido entrenado mediante un proceso de dos etapas: continuación de preentrenamiento sobre un corpus de 65 mil millones de tokens que combina código Lean formal, código de programación, matemáticas y cadenas de razonamiento largas, seguido de un post-entrenamiento iterativo con ajuste supervisado (SFT) y aprendizaje por refuerzo (GSPO). Su característica más destacada es que integra la recuperación de pruebas verificadas, el feedback del compilador Lean y la reparación iterativa directamente en la política del modelo, convirtiendo la demostración de teoremas en un proceso agéntico de múltiples rondas.

A pesar de su tamaño compacto, OProver-8B supera a Goedel-Prover-V2-32B en los cinco benchmarks de referencia de Lean 4, a pesar de tener cuatro veces menos parámetros. Esto lo convierte en una opción eficiente y de alto rendimiento para la demostración formal de teoremas, con una licencia Apache 2.0 que permite uso comercial y modificación. El modelo se publica junto con el corpus OProofs (6,86 millones de pruebas) y versiones intermedias para reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B, segun tags del modelo) |
| Parametros totales | 8.190.735.360 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenamiento con secuencias de 8192 tokens en la etapa de CPT) |
| Tipos de cuantizacion | safetensors (bfloat16); GGUF disponible para la version Base (OProver-8B-Base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), GGUF (solo para OProver-8B-Base) |

## Arquitectura y entrenamiento

OProver-8B es un transformer causal denso basado en la arquitectura Qwen3-8B, aunque la model card no especifica explícitamente los detalles de la arquitectura base. El entrenamiento se divide en dos etapas principales. La primera es una continuación de preentrenamiento (CPT) sobre una mezcla de 65 mil millones de tokens compuesta por aproximadamente un 30% de código Lean formal (proveniente de OProofs), un 20% de código (OpenCoder), un 40% de matemáticas (Nemotron-Math-4-Plus) y un 10% de cadenas de razonamiento largas (ProLong-64K). Se utilizó AdamW con una tasa de aprendizaje máxima de 5e-5, decaimiento coseno con 3% de warmup, batch de 512 y longitud de secuencia de 8192 tokens.

La segunda etapa es un post-entrenamiento iterativo que se ejecuta en varias rondas. Cada ronda consiste en: (1) generación de rollouts agénticos sobre un conjunto de teoremas, donde el modelo recupera pruebas verificadas de una memoria, genera un intento de prueba, ejecuta el compilador Lean y, si falla, revisa el intento usando el feedback del compilador; (2) ajuste supervisado (SFT) sobre los ejemplos de reparación por ronda, con pérdida de entropía cruzada solo sobre el nuevo intento; (3) aprendizaje por refuerzo GSPO sobre casos difíciles, con una recompensa de 0,8 + 0,2·1[formato correcto] si la prueba es verificada por Lean, y 0 en caso contrario; (4) incorporación de las nuevas pruebas verificadas y trayectorias de reparación al corpus OProofs, que se reindexa para la siguiente ronda. Este proceso de co-evolución entre el prover y el corpus hace que el rendimiento mejore monótonamente: en MiniF2F-Test, OProver-8B pasa de 79,5 a 91,8 de Pass@32 a lo largo de tres rondas.

## Capacidades

- Demostración de teoremas formales en Lean 4: genera pruebas verificables por el compilador Lean, con soporte para tácticas y estructuras de prueba complejas.
- Razonamiento agéntico multi-round: el modelo está entrenado para iterar sobre sus propios intentos de prueba, utilizando el feedback del compilador para corregir errores y refinar la demostración.
- Recuperación aumentada de pruebas: integra un mecanismo de recuperación de pruebas verificadas de una memoria (OProofs) que se utiliza como contexto adicional durante la generación.
- Generación de texto en inglés: aunque está especializado en matemáticas formales, conserva la capacidad de generar texto coherente en inglés, especialmente en contextos matemáticos y de razonamiento.
- Procesamiento de cadenas de razonamiento largas: entrenado con datos de razonamiento extenso, puede manejar secuencias de hasta 8192 tokens en la fase de entrenamiento, aunque el contexto final no está documentado.
- Compatibilidad con el ecosistema Hugging Face: se carga con `transformers` y es compatible con `text-generation-inference` y endpoints de inferencia.

## Casos de uso

- Verificación formal de teoremas matemáticos: investigadores pueden usar OProver-8B para generar pruebas de teoremas en Lean 4, reduciendo el tiempo de verificación manual. El modelo recupera pruebas similares y las adapta al teorema objetivo.
- Automatización de pruebas en librerías de Lean: equipos que mantienen librerías como mathlib pueden emplear el modelo para generar pruebas de lemas auxiliares o completar demostraciones incompletas, acelerando el desarrollo de la librería.
- Asistencia en investigación matemática: matemáticos que trabajan con formalización pueden plantear conjeturas y usar el modelo para explorar posibles demostraciones, obteniendo feedback del compilador en cada intento.
- Educación en matemáticas formales: estudiantes de lógica o matemáticas computacionales pueden practicar demostraciones en Lean 4 con un asistente que sugiere pasos y corrige errores, gracias a su capacidad de iteración con feedback.
- Integración en pipelines de verificación de software: en entornos donde se requiere verificación formal de propiedades de programas, OProver-8B puede generar pruebas de lemas de corrección, integrándose con herramientas como Lean 4 y CI/CD.
- Generación de corpus de pruebas: el modelo puede utilizarse para autoformalizar teoremas informales y generar pruebas verificadas, ampliando el corpus OProofs y mejorando futuros entrenamientos.

## Benchmarks y rendimiento

La model card reporta resultados de Pass@32 (n=64) en cinco benchmarks de Lean 4. Para OProver-8B, solo se proporciona el valor de MiniF2F-Test, que alcanza 91,8 en la ronda final (Round 3). No se publican los valores exactos para ProverBench, PutnamBench, MathOlympiad ni ProofNet en la información disponible, aunque se afirma que OProver-8B supera a Goedel-Prover-V2-32B en los cinco benchmarks. La siguiente tabla resume los datos disponibles:

| Benchmark | OProver-8B (Pass@32) | OProver-32B (Pass@32) | Goedel-Prover-V2-32B (Pass@32) |
|---|---|---|---|
| MiniF2F-Test | 91,8 | 93,3 | No disponible |
| ProverBench | No disponible | 58,2 | No disponible |
| PutnamBench | No disponible | 11,3 | No disponible |
| MathOlympiad | No disponible | 22,8 | No disponible |
| ProofNet | No disponible | 33,2 | No disponible |

Nota: los valores de OProver-32B se citan en la model card como los mejores entre modelos de peso abierto. No se dispone de los números de Goedel-Prover-V2-32B en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (16,4 GB en disco), se necesitan aproximadamente 16-18 GB de VRAM para cargar el modelo completo. Con cuantización de 4 bits (GGUF), la VRAM requerida se reduce a unos 5-6 GB.
- GPU recomendadas: para bfloat16, una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) es suficiente. Para cuantización 4-bit, una GPU de 8 GB (como RTX 3060 Ti o RTX 3070) puede ser viable.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización GGUF. La versión Base tiene un repo GGUF disponible, lo que facilita su uso con llama.cpp y Ollama.
- Opciones de despliegue: `transformers` con `device_map="auto"`, vLLM, TGI (text-generation-inference), llama.cpp, Ollama (si se convierte a GGUF). FriendliAI ofrece inferencia optimizada para la versión Base.
- Latencia y throughput: no se han publicado datos oficiales. Para un modelo de 8B en bfloat16, se puede esperar una latencia de decodificación de aproximadamente 20-40 ms por token en una GPU moderna, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

La comparativa se centra en Goedel-Prover-V2-32B, el único modelo mencionado explícitamente en la model card como referencia. No se dispone de datos numéricos de rendimiento para Goedel-Prover-V2-32B en la información proporcionada, pero se afirma que OProver-8B lo supera en los cinco benchmarks. Otra alternativa relevante es OProver-32B, la versión mayor del mismo framework.

| Modelo | Parametros | Contexto | Rendimiento (MiniF2F-Test Pass@32) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OProver-8B | 8B | No disponible | 91,8 | Apache 2.0 | Hugging Face |
| OProver-32B | 32B | No disponible | 93,3 | Apache 2.0 | Hugging Face |
| Goedel-Prover-V2-32B | 32B | No disponible | No disponible (inferior a OProver-8B segun la model card) | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización limitada: OProver-8B está diseñado exclusivamente para demostración de teoremas en Lean 4. Su rendimiento en tareas generales de lenguaje o razonamiento no especializado no está documentado y probablemente sea inferior al de modelos generalistas de su tamaño.
- Idioma: solo soporta inglés. No hay soporte para otros idiomas, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación en pruebas: aunque el feedback del compilador Lean reduce errores, el modelo puede generar pruebas incorrectas que no pasen la verificación, especialmente en teoremas complejos o fuera de su distribución de entrenamiento.
- Contexto no documentado: la longitud máxima de contexto no se especifica en la model card. El entrenamiento usó secuencias de 8192 tokens, pero el contexto de inferencia podría ser mayor o menor; se recomienda probar antes de usar en producción.
- Sesgos potenciales: al estar entrenado con datos de matemáticas y código, puede reflejar sesgos presentes en esos corpus (por ejemplo, subrepresentación de ciertas áreas matemáticas). No se han documentado evaluaciones de sesgo.
- Requisitos de hardware: aunque es un modelo de 8B, la versión en bfloat16 requiere al menos 16 GB de VRAM, lo que puede ser un obstáculo en entornos con GPUs limitadas. Se recomienda usar cuantización para despliegues en hardware modesto.
- Dependencia del corpus OProofs: el rendimiento agéntico depende de la calidad y cobertura de la memoria de recuperación. Si se usa fuera del corpus original, la recuperación puede ser menos efectiva.

## Enlaces

- Repositorio Hugging Face (ID proporcionado): [introvoyz042/OProver-8B](https://huggingface.co/introvoyz042/OProver-8B)
- Repositorio oficial (M-A-P): [m-a-p/OProver-8B](https://huggingface.co/m-a-p/OProver-8B)
- Paper: [OProver: A Unified Framework for Agentic Formal Theorem Proving](https://huggingface.co/papers/2605.17283) ([arXiv](https://arxiv.org/abs/2605.17283))
- Dataset OProofs: [m-a-p/OProofs](https://huggingface.co/datasets/m-a-p/OProofs)
- Colección OProver: [m-a-p/OProver](https://huggingface.co/collections/m-a-p/oprover)
- Repositorio GitHub: [multimodal-art-projection/OProver](https://github.com/multimodal-art-projection/OProver)
- Repo GGUF de OProver-8B-Base: [s3nh/OProver-8B-Base-GGUF](https://huggingface.co/s3nh/OProver-8B-Base-GGUF)
- Inferencia en FriendliAI: [m-a-p/OProver-8B-Base](https://friendli.ai/models/m-a-p/OProver-8B-Base)
