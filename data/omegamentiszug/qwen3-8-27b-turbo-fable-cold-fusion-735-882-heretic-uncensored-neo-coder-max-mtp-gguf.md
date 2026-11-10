# omegamentiszug/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen
El modelo `omegamentiszug/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF` es una cuantización en formato GGUF de un fine-tune multi-etapa derivado de la familia Qwen 3.8, publicado por el usuario omegamentiszug a partir del modelo base de DavidAU. Se presenta como un modelo de 27B (26.895.998.464 parámetros reales según safetensors) orientado a razonamiento, generación de código, escritura creativa y roleplaying, con un enfoque explícito en reducir el consumo de tokens de "thinking" manteniendo la calidad de salida. La model card lo describe como un modelo "uncensored" y "abliterated", es decir, con las capas de rechazo suavizadas o eliminadas.

La propuesta central del autor es que este fine-tune supera a la base Qwen 3.8 27B en siete benchmarks críticos tanto en cuantización de 4 bits como de 8 bits, y que reduce los tokens de razonamiento entre la mitad y una décima parte según el caso. El repositorio incluye cuantizaciones "regular" y "MTP" (Multi-Token Prediction) con doble imatrix (DI-MATRIX), y su tamaño total es de 389 GB, lo que refleja la presencia de múltiples variantes de cuantización en un mismo repo.

Es relevante ahora porque combina tres tendencias del ecosistema open source: fine-tunes comunitarios sobre modelos Qwen de última generación, técnicas de "abliteration" y "heretic" para eliminar restricciones de alineamiento, y optimizaciones de eficiencia en el razonamiento (reducción de tokens de pensamiento). No obstante, la ausencia de descargas, likes y verificación independiente obliga a tratar sus afirmaciones con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8, según model card); pipeline declarado image-text-to-text |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (regular y MTP); variantes adicionales no detalladas |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples quants) |

## Arquitectura y entrenamiento
La model card describe el modelo como un fine-tune multi-etapa, multi-fine-tune y multi-merge construido sobre `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez deriva de la familia Qwen 3.8. No se detalla la arquitectura interna más allá de la referencia a Qwen 3.8; el pipeline declarado es `image-text-to-text`, aunque no se especifican módulos de visión ni resolución de imagen. El entrenamiento se realizó con Unsloth según los tags, y se mencionan los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets` como fuentes de datos, sin indicar número de tokens ni composición exacta.

Las innovaciones declaradas son: (1) reducción del bloque de pensamiento entre 1/2 y 1/10 respecto a Qwen 3.8 estándar, con una mediana de reducción de aproximadamente 2/3; (2) reformateo del bloque de razonamiento; (3) técnicas denominadas "COLD FUSION" y "FABLE FUSION 711"; (4) cuantizaciones MTP (Multi-Token Prediction) con doble imatrix. No se aportan detalles técnicos verificables sobre estas técnicas, ni información sobre RLHF, DPO o composición del dataset de alineamiento.

## Capacidades
- Generación de texto generalista y conversacional multi-turno.
- Razonamiento explícito con bloque de "thinking" reformateado y reducido en tokens.
- Generación de código (tag "coder" y "NEO-CODER" en el nombre).
- Escritura creativa, ficción, narrativa y roleplaying en múltiples géneros.
- Soporte declarado de tool calling y function calling (mencionado en la sección de comunidad de la model card, sin benchmarks verificables).
- Capacidades multilingües limitadas a inglés y chino según la metadata.
- Pipeline image-text-to-text declarado, aunque no se detallan capacidades de visión.
- Modo "uncensored"/"abliterated": respuestas sin las capas de rechazo habituales.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso
- Escritura creativa y narrativa: el modelo está afinado específicamente para ficción, relatos y roleplaying, con ejemplos en la model card orientados a generar hooks narrativos y diálogos con tensión dramática; adecuado para autores que necesitan borradores rápidos con estilo marcado.
- Generación de código en pipelines de desarrollo: el tag "coder" y el énfasis en tool calling sugieren su uso como asistente de programación integrado en IDE o CI/CD, aunque sin benchmarks públicos de HumanEval o MBPP verificables.
- Razonamiento con presupuesto de tokens ajustado: la reducción de tokens de thinking (mediana 2/3) lo hace adecuado para entornos donde el coste por token de salida importa, como agentes autónomos con muchas llamadas encadenadas.
- Atención al cliente y chatbots multi-turno: el formato conversacional y el soporte de inglés y chino permiten desplegarlo en asistentes bilingües, siempre que se acepte el riesgo de contenido sin filtrar.
- Roleplaying y generación de personajes: el entrenamiento en "all genres" y "fiction" lo orienta a plataformas de entretenimiento conversacional y juegos de rol por texto.
- Investigación sobre alineamiento y seguridad: al ser un modelo "abliterated"/"heretic", es útil como caso de estudio para medir la eficacia de las capas de rechazo y evaluar riesgos de modelos sin alineamiento.
- Despliegue en hardware de consumo: las cuantizaciones GGUF de 4 y 8 bits permiten ejecución local en GPUs consumer, útil para prototipado y demos offline.

## Benchmarks y rendimiento
La model card afirma que el modelo supera a Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos, y cita valores concretos de ARC-C y ARC-E (735 en 8 bits, 719 en 4 bits, 880 en ARC-E), pero no se presenta una tabla completa de resultados con el resto de benchmarks ni la metodología. No se han publicado resultados verificables e independientes en la información disponible.

| Benchmark | Valor declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; sin verificación independiente |
| ARC-C (4 bits) | 719 | Afirmado por el autor; sin verificación independiente |
| ARC-E | 880 | Afirmado por el autor; sin verificación independiente |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de 26,9B parámetros, una cuantización Q4 requeriría aproximadamente 15-18 GB y una Q8 en torno a 28-30 GB, aunque estas cifras son estimaciones genéricas y no datos del autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) podría ejecutar quants Q4, y A100/H100 serían necesarias para Q8 o precisión completa.
- Cabe en GPU consumer: probablemente en RTX 3090/4090 con cuantización Q4; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (vLLM con soporte GGUF, TGI no aplica directamente); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles; el autor afirma que el modelo es "más rápido" que Qwen 3.8 por la reducción de tokens de pensamiento, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO...GGUF) | 26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune comunitario sin verificar, uncensored, MTP |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Modelo oficial; referencia de comparación del autor |
| Qwen 3.6 27B | ~27B | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Generación anterior citada por el autor |
| Qwen 3.6-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Alternativa MoE de mayor tamaño total y menor coste activo |

No se dispone de datos de rendimiento verificables para establecer una comparación cuantitativa fiable; las afirmaciones de superioridad provienen únicamente del autor.

## Limitaciones y advertencias
- Modelo "uncensored"/"abliterated": no aplica las capas de rechazo habituales, por lo que puede generar contenido sensible, ofensivo o inseguro sin filtros; no recomendado para producción orientada al público sin moderación externa.
- Afirmaciones de rendimiento no verificadas: los valores de ARC-C/ARC-E y la superioridad sobre Qwen 3.8 provienen solo de la model card, sin benchmarks reproducibles ni revisión independiente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que dificulta la validación comunitaria.
- Idiomas limitados a inglés y chino; el castellano no está declarado oficialmente.
- Longitud de contexto no especificada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación inherente a los fine-tunes comunitarios sin evaluación independiente, especialmente en código y datos factuales.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" puede incumplir políticas de plataformas o normativas locales.
- El tamaño del repo (389 GB) y la multiplicidad de quants pueden complicar la trazabilidad de qué variante se está usando.
- No se detalla la composición de los datasets de entrenamiento, lo que impide evaluar sesgos y procedencia de datos.

## Enlaces
- Hugging Face: https://huggingface.co/omegamentiszug/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune original: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- FAQs y soporte de DavidAU: https://huggingface.co/DavidAU/support
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
