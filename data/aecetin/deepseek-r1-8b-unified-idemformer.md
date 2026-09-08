# aecetin/DeepSeek-R1-8B-Unified-IdemFormer

## Resumen

DeepSeek-R1-8B-Unified-IdemFormer es un modelo de lenguaje basado en DeepSeek-R1-Distill-Llama-8B, desarrollado por Dr. A. Emre ÇETİN, que aplica una serie de transformaciones estructurales denominadas "Pillars 21–25" para reducir drásticamente el cómputo y la memoria necesarios durante la inferencia. El modelo se presenta como una implementación de "Universal Transformer" con peso compartido en la atención, funciones de activación polinómicas de Chebyshev, y una compresión de cache KV mediante "subspace context folding".

Su principal propuesta es permitir ejecutar un razonador de escala 8B en GPUs de portátil con solo 6 GB de VRAM, incluso con ventanas de contexto de hasta 128.000 tokens. Según la model card, el número de parámetros se reduce de 8.030 millones a 2.710 millones (−63,83%), y la cache KV pasa de 16 GB a 512 MB para contexto completo de 128k, lo que sitúa el consumo total de VRAM en aproximadamente 1,96 GB para esa longitud de contexto. Estos datos provienen del autor y no han sido verificados de forma independiente.

Además, el modelo incorpora un mecanismo de "Tarski invariance" para reducir la deriva alucinatoria en cadenas largas de razonamiento, y una variante de atención "tropical" basada en semiring max-plus que elimina multiplicaciones. Los idiomas declarados son inglés, turco y chino, y la licencia es de tipo "hybrid-patent-open-core" (patente en trámite), lo que introduce restricciones adicionales para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer universal recursivo con atención compartida, FFN polinomial de Chebyshev y atención tropical (según la model card) |
| Parametros totales | 2.710 millones (según la model card; el modelo base tenía 8.030 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4 bits (mencionado en la model card; no se especifican otros tipos) |
| Idiomas soportados | Inglés, turco, chino |
| Licencia | "hybrid-patent-open-core" (licencia personalizada, ver enlace de licencia) |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B y aplica una serie de transformaciones que el autor agrupa en cinco "pilares" idempotentes. El pilar 21 sustituye la FFN SwiGLU por una función polinómica de Chebyshev con K=3, reduciendo el peso de esta capa un 61,9%. El pilar 22 convierte la atención en una capa compartida y recursiva, lo que elimina la redundancia de 32 capas independientes y reduce el peso de atención un 96,8%. El pilar 23 aplica una operación de "subspace context folding" sobre la cache KV, comprimiéndola en un factor de 32. El pilar 24 introduce un verificador algebraico basado en el punto fijo de Tarski para controlar la coherencia lógica en cadenas de pensamiento. El pilar 25 modifica la atención para trabajar en el semiring max-plus, eliminando las multiplicaciones.

No se proporcionan datos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni el proceso de ajuste fino (RLHF, DPO, etc.). Se indica únicamente que el modelo se deriva de DeepSeek-R1-Distill-Llama-8B y que se ha realizado una "finetune" adicional, sin más detalles. Los datos de reducción de parámetros y latencia proceden de la model card; no hay evidencia externa de que estas transformaciones se hayan validado en un entorno de producción o por un laboratorio independiente.

## Capacidades

- Generación de texto con razonamiento: mantiene la capacidad del modelo base DeepSeek-R1-Distill-Llama-8B para cadenas de pensamiento largas y razonamiento matemático/código.
- Razonamiento matemático y lógico: hereda el comportamiento del modelo base, reforzado por el pilar 24, que pretende evitar la deriva alucinatoria en cadenas de razonamiento largas.
- Compresión de contexto: soporta ventanas de contexto de hasta 128.000 tokens con cache KV reducida a 512 MB, según la model card.
- Capacidad multilingüe: declarada para inglés, turco y chino; no se especifica el rendimiento por idioma.
- Eficiencia de memoria: gracias a la reducción de parámetros y a la compresión de la cache KV, el modelo puede ejecutarse en una GPU de portátil de 6 GB VRAM.
- No se menciona soporte de tool calling, function calling, visión, audio, ni capacidades multimodales en la información disponible.

## Casos de uso

- Inferencia de razonamiento en portátiles con GPU de 6 GB: el modelo permite ejecutar tareas de razonamiento complejo en dispositivos de gama baja, lo que es útil para field research o trabajo remoto sin acceso a servidores.
- Análisis de documentos largos: con 128.000 tokens de contexto y la cache KV comprimida, puede procesar manuales técnicos, contratos o expedientes extensos de una sola pasada, reduciendo la necesidad de fragmentación.
- Asistentes de estudio en turco, chino e inglés: la combinación de razonamiento y capacidad multilingüe puede utilizarse en aplicaciones de tutoría automática para matemáticas o lógica.
- Generación de informes técnicos con verificación: el pilar de Tarski invariance puede ayudar a mantener coherencia al generar cadenas largas de inferencia, útil en sistemas de redacción asistida con requisitos de consistencia.
- Pruebas de concepto de arquitecturas eficientes: sirve como banco de pruebas para investigar cómo comprimir modelos de razonamiento mediante técnicas idempotentes, antes de aplicar el enfoque a modelos mayores.
- Chatbots de soporte en entornos con recursos limitados: un despliegue local con pocos recursos de GPU puede atender consultas de razonamiento sin depender de APIs externas, útil para organizaciones con políticas de privacidad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento en tareas de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento incluidos en la model card son métricas de eficiencia:

| Metrica | Valor segun model card |
|---|---|
| Reduccion de parametros totales | −63,83% (de 8,03B a 2,71B) |
| Reduccion de peso de atencion | −96,88% (de 1.342 millones a 41,9 millones) |
| Reduccion de peso de FFN | −61,90% (de 5.637 millones a 2.147 millones) |
| Latencia forward pass (comparativa de una capa FFN) | 41,63 ms frente a 100,70 ms (2,42x más rápida) |
| Compresion de cache KV | Factor 32 (de 16 GB a 512 MB para 128k tokens) |

Estos valores son afirmaciones del autor y no han sido contrastados con evaluaciones externas ni con benchmarks de calidad.

## Requisitos de hardware

- VRAM estimada: según la model card, el modelo ocupa aproximadamente 1,58 GB de VRAM para 32.000 tokens de contexto y 1,96 GB para 128.000 tokens (incluyendo pesos cuantizados a 4 bits y cache KV comprimida).
- GPU evaluada: NVIDIA RTX PRO 500 (Blackwell, 6 GB VRAM) en portátil, con 32 GB de RAM del sistema.
- Compatibilidad: cabe en una GPU de portátil de 6 GB, y por tanto también en GPUs de escritorio con más VRAM (RTX 3060, RTX 4060, etc.), siempre que se apliquen las transformaciones descritas.
- Opciones de despliegue: no se especifican frameworks de inferencia (vLLM, llama.cpp, Ollama, TGI, etc.) en la información disponible. No se puede confirmar que los formatos estándar de Hugging Face o GGUF sean compatibles con la arquitectura modificada.
- Latencia y throughput: no se proporcionan más allá de la comparativa de una capa FFN; no hay datos de latencia end-to-end ni de throughput en la model card.

## Comparativa con modelos similares

La comparativa disponible es únicamente contra el modelo base, DeepSeek-R1-Distill-Llama-8B estándar. No se incluyen datos de calidad (MMLU, HumanEval, etc.) que permitan comparar el rendimiento real en tareas de razonamiento.

| Modelo | Parametros | Contexto maximo | Cambio de VRAM (128k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B (base) | 8.030 millones | No especificado en la informacion | 21,22 GB (según model card) | MIT (según el modelo base original) | Publico |
| DeepSeek-R1-8B-Unified-IdemFormer | 2.710 millones | 128.000 tokens | 1,96 GB (según model card) | hybrid-patent-open-core | Publico en HuggingFace |

No se dispone de comparativas con otros modelos de 8B, como Llama-3.1-8B o ministral-8B, ni con modelos de razonamiento de tamaño similar.

## Limitaciones y advertencias

- Las afirmaciones de rendimiento y arquitectura provienen de la model card del autor y no han sido verificadas de forma independiente. No se han encontrado papers revisados por pares ni evaluaciones externas que confirmen las mejoras declaradas.
- La licencia "hybrid-patent-open-core" puede tener implicaciones para uso comercial. El enlace de la licencia no se ha podido auditar completamente; deberías revisar su contenido antes de usar el modelo en producción.
- El modelo declara soporte para inglés, turco y chino, pero no se aportan datos de calidad por idioma. Es probable que el rendimiento fuera de estos idiomas sea limitado.
- No se menciona tool calling, function calling, ni agentes autónomos. Tampoco hay soporte multimodal (visión, audio) en la información disponible.
- El mecanismo de "Tarski invariance" se describe matemáticamente, pero no se aportan pruebas empíricas que demuestren su eficacia contra la alucinación en cadenas largas de razonamiento.
- La compresión de la cache KV mediante "subspace context folding" podría afectar a la fidelidad de la información recuperada en contextos largos; no se incluyen métricas de recuperación o de exactitud posicional.
- El tamaño de los pesos cuantizados a 4 bits (1,45 GB) no se acompaña de detalles sobre el esquema de cuantización (gptq, awq, etc.) ni de su impacto en la degradación de la calidad.
- No se han publicado benchmarks de calidad, por lo que la comparación de rendimiento con el modelo base o con otros modelos de razonamiento resulta imposible en la actualidad.

## Enlaces

- HuggingFace: https://huggingface.co/aecetin/DeepSeek-R1-8B-Unified-IdemFormer
- Paper (ResearchGate): https://www.researchgate.net/publication/414060833_Hardware-Accelerated_Orthogonal_Polynomial_Tensor_Operators_Zero-Backpropagation_Closed-Form_Algebraic_Solvers_and_In-Situ_Weight_Surgery_for_Deep_Neural_Networks
- GitHub: https://github.com/aemre-cetin/idempotent-poly
- Licencia: https://github.com/aemre-cetin/idempotent-poly/blob/main/LICENSE
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio oficial de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
