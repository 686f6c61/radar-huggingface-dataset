# cooler8/yejin-korean-3b-v25-sft-step14k

## Resumen

Yejin Korean 3B v2.5 SFT (Step 14K) es un modelo de lenguaje de 3.015 millones de parámetros desarrollado por el usuario cooler8, publicado en HuggingFace con licencia Apache 2.0. Se trata de un ajuste supervisado (SFT) sobre el modelo base "Yejin Korean 3B v2.5 Base", que según la model card fue preentrenado y posteriormente sometido a una fase de "annealing". El resultado es un modelo bilingüe coreano-inglés orientado a seguir instrucciones.

El modelo está construido sobre una arquitectura de tipo Llama (transformer decoder-only), con una longitud de contexto de 4096 tokens y pesos en precisión BF16 almacenados en formato safetensors. El repositorio ocupa 6,0 GB, coherente con los ~3.000 millones de parámetros en BF16. Según la información del autor, el ajuste se detuvo en el paso 14.000 con una pérdida de 1,58, lo que indica explícitamente que el entrenamiento es parcial.

Su relevancia radica en cubrir el nicho de modelos compactos con buen rendimiento en coreano, un idioma relativamente poco representado en la oferta de modelos abiertos de tamaño pequeño. Al ser un modelo de 3B con licencia Apache 2.0, es candidato a despliegues en hardware de gama de consumo y a tareas de generación de texto con restricciones de latencia y coste. No obstante, el modelo cuenta con 0 descargas y 0 "likes" en el momento de redactar esta ficha, y no se han publicado benchmarks ni datos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama |
| Parametros totales | 3.015.355.392 (~3,02 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en BF16 (safetensors); no se distribuyen versiones GGUF, GPTQ, AWQ ni EXL2 oficiales |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Parametros del ajuste | SFT, 14.000 pasos, perdida 1,58 (entrenamiento parcial) |
| Modelo base | Yejin Korean 3B v2.5 Base (preentrenado + annealing) |
| Tamano del repositorio | 6,0 GB |
| Autor | cooler8 |
| Fecha de creacion (metadatos HF) | 2026-09-16 |
| Ultima actualizacion (metadatos HF) | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card etiqueta el modelo con la etiqueta "llama", lo que apunta a una arquitectura transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU, el estándar de la familia Llama. La información disponible no detalla el número de capas, la dimensión oculta, el número de cabezas de atención, el tamano del vocabulario ni si se emplea grouped-query attention (GQA) o decodificación especulativa. Tampoco se especifica la composición del tokenizador más allá de que cubre coreano e inglés.

En cuanto al entrenamiento, el autor indica dos fases: un preentrenamiento con fase de "annealing" sobre el modelo base Yejin Korean 3B v2.5, y posteriormente un ajuste supervisado (SFT) sobre datos de instrucciones en coreano de alta calidad. El SFT se detuvo en el paso 14.000 con una pérdida de 1,58, lo que el propio autor califica como entrenamiento parcial. No se menciona el uso de RLHF, DPO u otras técnicas de alineación preferencial, ni el número total de tokens vistos durante el preentrenamiento o el SFT. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o variantes híbridas.

## Capacidades

- Generación de texto conversacional y de propósito general en coreano e inglés.
- Seguimiento de instrucciones (instruction following) gracias a la fase de SFT.
- Formato de prompt basado en plantilla explícita: `### 질문:` (pregunta) y `### 답변:` (respuesta), tal como muestra el ejemplo de uso de la model card.
- Capacidad de razonamiento y generación de código: no documentada explícitamente en la información disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas a coreano e inglés según las etiquetas del repositorio.
- Capacidades especiales (modo "thinking", visión, audio): no documentadas.
- Generación con `max_new_tokens` configurable mediante `transformers` y `model.generate()`.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar diálogos de múltiples turnos dentro de su ventana de 4096 tokens, suficiente para conversaciones de soporte de extensión moderada, con la ventaja de que una licencia Apache 2.0 permite integrarlo en productos propietarios.
- Traducción coreano-inglés asistida: al ser bilingüe, puede emplearse para pre-traducir o post-editar contenido, aunque sin benchmarks publicados no es posible garantizar una calidad concreta en tareas de traducción.
- Generación de contenido editorial en coreano: redacción de descripciones de producto, resúmenes de artículos o textos de marketing, donde el coste por token de un modelo de 3B es bajo comparado con modelos de mayor tamano.
- Prototipado e investigación en NLP coreano: al ser un modelo pequeno y abierto, es útil como línea base para experimentos de ajuste fino (LoRA, QLoRA) sobre dominios específicos del coreano con recursos limitados.
- Clasificación y extracción de información con formato controlado: mediante prompts con plantilla fija se puede emplear para etiquetado de textos, extracción de entidades o generación de resúmenes estructurados, siempre con validación posterior por el riesgo de alucinación.
- Chatbot embebido en aplicaciones de escritorio o móviles: con pesos en BF16 (~6 GB) o cuantizados por el usuario a 4 bits (~2 GB), puede ejecutarse en un portátil con GPU de gama media o incluso en CPU con `llama.cpp` tras convertir los pesos.
- Educación y práctica de idiomas: generación de ejercicios, respuestas modelo y corrección de texto en coreano para plataformas de aprendizaje, con supervisión humana en contenidos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (1,58 en el paso 14.000) y no incluye evaluaciones de MMLU, HumanEval, GSM8K, KLUE, KoBEST ni de ningún otro conjunto de evaluación. Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del número de parámetros (3,02 B) y de los formatos de cuantización habituales, no datos confirmados por el autor:

- VRAM estimada solo para pesos: ~6,0 GB en BF16/FP16, ~3,0 GB en INT8, ~1,8-2,0 GB en INT4 (GPTQ/AWQ/GGUF Q4_K_M).
- VRAM total en inferencia (pesos + caché KV + overhead): con contexto de 4096 tokens y lotes pequenos, se recomienda anadir entre 0,5 y 1,5 GB adicionales según el tamano de lote y la longitud de secuencia.
- GPU de consumo: cabe en tarjetas con 8 GB de VRAM (RTX 3060 Ti, RTX 2070, RTX 4060) en BF16 con margen justo, y con holgura en 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080). En 4 bits cabe en GPUs de 4-6 GB (GTX 1650 4 GB es ajustado; RTX 3050 6 GB es viable).
- GPU profesionales: A100 40/80 GB, H100 y L40S soportan el modelo sin dificultad, y permiten lotes grandes y mayor throughput.
- CPU: es viable mediante `llama.cpp` u Ollama tras convertir los pesos safetensors a GGUF; el rendimiento dependerá del número de núcleos y del soporte de instrucciones SIMD.
- Opciones de despliegue: `transformers` con PyTorch (soporte nativo del repositorio), vLLM y TGI tras verificar compatibilidad de la arquitectura Llama, además de `llama.cpp`, Ollama y LM Studio previa conversión a GGUF. No hay artefactos de cuantización publicados por el autor.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se limita a parámetros estructurales, ya que no existen benchmarks publicados del modelo Yejin. Los datos de los modelos alternativos proceden de sus model cards públicas y no se han verificado mediante ejecución propia.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Yejin Korean 3B v2.5 SFT (Step 14K) | 3,02 B | 4096 tokens | ko, en | Apache 2.0 | Entrenamiento SFT parcial (paso 14.000); sin benchmarks publicados |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens (128K con YaRN) | Multilingüe (29+ idiomas) | Apache 2.0 | Incluye coreano entre sus idiomas; con benchmarks publicados por el autor |
| Llama-3.2-3B-Instruct | ~3,21 B | 128.000 tokens | Multilingüe (8 idiomas oficiales, coreano no incluido) | Llama 3.2 Community License | Mayor contexto, pero cobertura de coreano no oficial |

En rendimiento especifico sobre tareas en coreano no es posible establecer una comparacion: el modelo Yejin carece de resultados publicados en KLUE, KoBEST o cualquier otro conjunto de evaluacion, por lo que su calidad real frente a Qwen2.5-3B o modelos especializados en coreano de mayor tamano no esta cuantificada.

## Limitaciones y advertencias

- Entrenamiento incompleto: el SFT se detuvo en el paso 14.000 con una pérdida de 1,58, lo que el propio autor califica como parcial. Es esperable un rendimiento inferior al de un ajuste completado.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, código, matemáticas ni seguridad, lo que dificulta cualquier decisión de adopción en producción.
- Riesgo de alucinación: no se documentan mecanismos de mitigación ni evaluaciones de veracidad. En un modelo de 3B con SFT parcial, la tasa de errores fácticos puede ser elevada.
- Sesgos: no se documenta la composición del dataset de SFT, por lo que no es posible evaluar sesgos de género, políticos, culturales o religiosos. Al estar centrado en coreano, heredará los sesgos presentes en los corpus coreanos utilizados.
- Limitación de contexto: 4096 tokens es una ventana reducida frente a los 32K-128K de modelos contemporáneos de tamano similar, lo que restringe tareas de resumen de documentos largos o análisis de repositorios de código.
- Cobertura de idiomas: solo coreano e inglés. El uso en castellano no está soportado y dará resultados degradados.
- Ausencia de datos sobre alineación: no se menciona RLHF, DPO ni filtrado de seguridad, por lo que la probabilidad de generar contenido inapropiado sin salvaguardas adicionales es mayor.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No impone restricciones de uso adicionales, pero tampoco ofrece garantías.
- Adopción nula: 0 descargas y 0 likes implican que el modelo no ha sido validado por la comunidad; tampoco hay issues, discusiones ni forks documentados que permitan contrastar su comportamiento real.
- Formato único: solo se publican pesos safetensors en BF16, por lo que cualquier despliegue cuantizado requiere conversión previa por parte del usuario, con el consiguiente riesgo de degradación.

## Enlaces

- HuggingFace: https://huggingface.co/cooler8/yejin-korean-3b-v25-sft-step14k
- Modelo base citado en la model card: "Yejin Korean 3B v2.5 Base" (no se ha encontrado enlace directo en la informacion proporcionada)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la busqueda web.
