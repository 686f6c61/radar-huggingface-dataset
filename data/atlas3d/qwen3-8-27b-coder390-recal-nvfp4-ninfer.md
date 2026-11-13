# Atlas3D/Qwen3.8-27B-Coder390-recal-NVFP4-NInfer

## Resumen

Atlas3D/Qwen3.8-27B-Coder390-recal-NVFP4-NInfer es un artefacto de inferencia cuantizado en formato NInfer v3, publicado por Atlas3D, que empaqueta el fine-tune Coder390 de Qwen3.8-27B desarrollado por nerkyor. El modelo base es un transformer de 27.000 millones de parámetros orientado a generación de código y razonamiento, con capacidades multimodales (image-text-to-text) y una cabeza MTP (multi-token prediction) integrada. Este build concreto aplica cuantización NVFP4 (4 bits en pesos y activaciones) sobre las 192 matrices MLP de las 64 capas, manteniendo las proyecciones de atención y GDN en FP8, y añade un drafter DFlash2 de z-lab para decodificación especulativa.

La relevancia del artefacto reside en su tamaño: 20,44 GiB en un único fichero, diseñado explícitamente para caber en tarjetas de 24 GB de VRAM (RTX 3090, RTX 4090, RTX PRO 6000 Blackwell). El autor recalibró la cuantización MLP sobre un conjunto mixto de código, inglés y chino, mientras que los pesos de atención en FP8 se conservan byte a byte del checkpoint original. El artefacto incluye tokenizer, torre de visión, cabeza MTP y drafter especulativo en un solo contenedor de 1.270 objetos.

Se distribuye bajo licencia Apache-2.0 y solo soporta inglés y chino. El autor advierte que el build no supera uno de los cuatro criterios de validación sobre inglés enciclopédico (tres de cuatro streams de wikitext), aunque cumple todos los límites globales. La validación se realizó en una RTX PRO 6000 Blackwell; el chequeo en RTX 3090 está hecho y el de RTX 4090 queda pendiente. No se ha probado con releases upstream de NInfer, solo con el fork Cinference en el commit indicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con proyecciones GDN (gated delta network), cabeza MTP y drafter DFlash2 para decodificación especulativa |
| Parámetros totales | 27.000 millones (27B, según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens (configurado en el comando de ejemplo con `--max-context 16384`) |
| Tipos de cuantización | NVFP4 W4A4 en MLP (192 pesos), FP8 en atención y GDN (208 pesos), FP8 per-row en head y embeddings, Q4/Q8 grouped en torre de visión y cabeza MTP, Q4/Q5/Q6 grouped en drafter |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | NInfer v3 (fichero único `.ninfer`, 1.270 objetos, 21.947.656.452 bytes / 20,44 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27B con 64 capas que incorpora proyecciones GDN (gated delta network) junto a la atención estándar, una cabeza MTP (multi-token prediction) para predecir varios tokens por paso y una torre de visión que habilita la modalidad image-text-to-text. El fine-tune Coder390 de nerkyor se entrenó presumiblemente sobre datos de código y razonamiento (el nombre incluye referencias a SFT, RLOO y EfficientThink), aunque la model card del artefacto cuantizado no detalla la composición del dataset de entrenamiento original ni el número de tokens.

La innovación técnica de este artefacto es la cuantización mixta: las 192 matrices MLP (gate/up/down de las 64 capas) se cuantizan a NVFP4 con ModelOpt 0.46.0 usando `NVFP4_W4A4_WEIGHT_LOCAL_HESSIAN_CFG`, con 512 muestras de calibración × 4.096 tokens. El conjunto de calibración combina 171 muestras de código/razonamiento (CodeFeedback-Filtered-Instruction más trazas sintéticas de agentes químicos), 171 muestras de inglés (cnn_dailymail y fineweb) y 170 de chino (fineweb-2 cmn_Hani). Se excluyeron deliberadamente fuentes wiki, wikitext, PG19/Gutenberg y zhwiki para evitar solapamiento con el corpus de validación. Las 208 proyecciones de atención y GDN se mantienen en FP8 sin modificar respecto al checkpoint del autor. El artefacto incluye además el drafter DFlash2 de z-lab para decodificación especulativa con 15 tokens de borrador por paso.

## Capacidades

- Generación de texto y razonamiento: el modelo base está orientado a tareas de código y razonamiento multi-paso (sufijo EfficientThink en el nombre del checkpoint original).
- Generación de código: el fine-tune Coder390 está especializado en código; el tag `coding` lo confirma.
- Capacidades multimodales: pipeline image-text-to-text con torre de visión incluida en el artefacto (Q4/Q8 grouped).
- Predicción multi-token: cabeza MTP integrada, que permite generar varios tokens por paso de decodificación.
- Decodificación especulativa: drafter DFlash2 de z-lab con 15 tokens de borrador, activable con `--spec dflash2 --draft-tokens 15 --lm-head-draft`.
- Soporte multilingüe limitado: solo inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no confirmado explícitamente; el corpus de calibración incluye trazas de agentes químicos, lo que sugiere cierta exposición a formato agéntico, pero no se documenta como capacidad oficial.
- Modo thinking: el nombre del checkpoint base incluye EfficientThink, lo que sugiere un modo de razonamiento extendido, aunque no se detalla en la model card del artefacto.

## Casos de uso

- Asistencia de código en local sobre GPU de 24 GB: el artefacto cabe en una RTX 3090 o RTX 4090 y permite autocompletado, generación de funciones y refactorización sin depender de la nube, gracias a la cuantización NVFP4 del MLP y al drafter especulativo que reduce la latencia por token.
- Generación de código en pipelines de CI/CD: con 16.384 tokens de contexto se pueden procesar diffs, ficheros completos y contexto de repositorio para revisiones automáticas o generación de tests, siempre que el pipeline acepte el formato NInfer v3 y el motor Cinference.
- Razonamiento multi-paso con predicción multi-token: la cabeza MTP y el drafter DFlash2 aceleran tareas de razonamiento encadenado (resolución de problemas, análisis de trazas) en entornos con presupuesto de latencia ajustado.
- Procesamiento de documentación técnica con imágenes: la torre de visión permite extraer información de diagramas, capturas de pantalla o figuras en documentación en inglés o chino, combinándola con generación de texto.
- Atención al cliente técnica bilingüe (en/zh): conversaciones multi-turno de hasta 16.384 tokens para soporte de producto en inglés y chino, con la ventaja de desplegarse on-premise en una sola GPU de 24 GB.
- Investigación en cuantización: el artefacto es un caso de estudio reproducible de cuantización mixta NVFP4/FP8 con calibración documentada (manifest, sha256, comparación byte a byte de 1.004 objetos), útil para quienes investigan técnicas de compresión de modelos.
- Despliegue edge o en estaciones de trabajo: al ocupar 20,44 GiB en un único fichero, se puede distribuir y cargar en workstations con una sola GPU consumer de gama alta, sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta validación de precisión (criterios internos del autor) y una excepción declarada: el build no supera uno de los cuatro límites de validación sobre inglés enciclopédico (tres de cuatro streams de wikitext), aunque cumple todos los límites globales. No se aportan cifras de MMLU, HumanEval, GSM8K ni métricas de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: 20,44 GiB de pesos en disco; en inferencia se necesita espacio adicional para KV cache (configurado como k8v4 en el ejemplo) y buffers del drafter. Diseñado para tarjetas de 24 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (validación oficial de precisión realizada en esta tarjeta), RTX 3090 (chequeo hecho con un build no publicado), RTX 4090 (chequeo pendiente según el autor).
- Cabe en GPU consumer: sí, en RTX 3090 y RTX 4090 (24 GB), con la advertencia de que el commit público de Cinference está orientado a Blackwell y los resultados en RTX 3090 reportados no se reproducen con el commit público.
- Opciones de despliegue: exclusivamente Cinference (fork de NInfer) en el commit `383e5dbbaf927b562b11d7d48dbe4d10c1bf39bd`; no se ha probado con releases upstream de NInfer, ni se mencionan vLLM, llama.cpp, Ollama o TGI.
- Comando de referencia: `ninfer-serve qwen3_8_27b_coder390_recal_nvfp4.ninfer --kv-dtype k8v4 --spec dflash2 --draft-tokens 15 --lm-head-draft --max-context 16384`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas3D/Qwen3.8-27B-Coder390-recal-NVFP4-NInfer | 27B | 16.384 | NVFP4 + FP8 mixta | Apache-2.0 | Hugging Face, formato NInfer v3 |
| nerkyor/Qwen3.8-27B-Coder390-…-MTP-DFlash2 (modelo base) | 27B | no disponible | BF16 (original) | no disponible en la información | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 (drafter) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Excepción de validación declarada: el build no supera uno de los cuatro límites de validación sobre inglés enciclopédico (tres de cuatro streams de wikitext), aunque cumple todos los límites globales. El autor lo documenta explícitamente.
- Tokenizer sustituido: el artefacto usa `tokenizer.json` y `tokenizer_config.json` de Qwen/Qwen3.8-27B en lugar de los del autor, porque el motor solo acepta el patrón split de Qwen. La codificación difiere en escrituras con marcas diacríticas (hindi, tailandés, árabe con diacríticos completos: 58%, 60% y 28% de tokens en frases manuscritas). No se pudo confirmar con qué patrón se entrenó el fine-tune.
- Idiomas limitados: solo inglés y chino; no hay soporte declarado para castellano ni otras lenguas.
- Dependencia de un motor específico: solo funciona con Cinference en el commit indicado; no se ha probado con NInfer upstream. El commit público está orientado a Blackwell y los resultados en RTX 3090 requieren un build no publicado.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, especialmente en código y razonamiento.
- Sesgos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del drafter, que no se detalla en la información disponible.
- Calibración reconstruida: el script de cuantización es una reconstrucción del método del autor (su script y manifest no están publicados); se usó transformers 5.21.0.dev0 frente al 5.17.0 del autor, lo que puede introducir diferencias menores.
- Sin benchmarks públicos: no hay métricas de calidad ni de rendimiento publicadas, lo que dificulta evaluar su idoneidad en producción frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atlas3D/Qwen3.8-27B-Coder390-recal-NVFP4-NInfer
- Modelo base (nerkyor): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Drafter DFlash2 (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor Cinference (fork de NInfer): https://github.com/satellitedown/cinference
- Tokenizer de referencia Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
