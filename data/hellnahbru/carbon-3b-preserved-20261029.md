# hellnahbru/Carbon-3B-preserved-20261029

## Resumen

Carbon-3B es un modelo fundacional generativo de ADN y ARN desarrollado por HuggingFaceBio, diseñado principalmente para secuencias eucariotas. Se trata de un transformer decoder-only autorregresivo de 3.451 millones de parámetros (30 capas, hidden size 3072, GQA con 32 cabezas y 4 grupos KV, SwiGLU y RMSNorm) que emplea una tokenización híbrida: 6-meros no solapados para ADN y el vocabulario BPE de Qwen3 para texto en inglés. Su contexto nativo es de 32.768 tokens (aproximadamente 197 kbp de ADN), extensible a 65.536 tokens (unos 393 kbp) mediante YaRN en inferencia.

El modelo aborda tareas de genómica computacional como la recuperación de secuencias, la predicción de efectos de variantes (VEP) y la discriminación de perturbaciones de motivos, compitiendo con baselines de mayor tamaño como Evo2-7B pero con una velocidad de inferencia varias veces superior. Según el autor, es capaz de generar más de 100.000 pares de bases por segundo en una única GPU H100.

La relevancia actual del modelo radica en su enfoque híbrido de tokenización (6-meros para ADN, BPE para inglés), pensado para converger hacia modelos fundacionales que manejen conjuntamente lenguaje natural y secuencias genómicas. Es el modelo insignia de la familia Carbon, que también incluye Carbon-8B y Carbon-500M (este último orientado a decodificación especulativa). La ficha corresponde a una copia preservada del repositorio original (`hellnahbru/Carbon-3B-preserved-20261029`), con 66 descargas y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (LlamaForCausalLM), GQA, SwiGLU, RMSNorm |
| Parametros totales | 3.451.444.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (≈197 kbp); 65.536 tokens (≈393 kbp) con YaRN en inferencia |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en bfloat16) |
| Idiomas soportados | no disponible (tokenizador híbrido con vocabulario BPE de Qwen3 para inglés y 6-meros para ADN) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 6,9 GB) |

## Arquitectura y entrenamiento

Carbon-3B es un transformer decoder-only estándar de 30 capas con hidden size 3072, atención GQA (32 cabezas de atención, 4 grupos KV), activación SwiGLU y normalización RMSNorm. La innovación principal reside en el tokenizador híbrido: los segmentos de ADN se tokenizan como 6-meros no solapados (cada token codifica 6 nucleótidos, por lo que 1 token ≈ 6 bp), mientras que el texto en inglés utiliza el vocabulario BPE de Qwen3. El tokenizador solo activa el modo 6-meros al detectar la etiqueta `<dna>`, y emite `<oov>` para cualquier letra fuera de [ATCG].

El entrenamiento emplea un esquema de objetivos que transiciona de Cross-Entropy a Factorised Nucleotide Supervision (FNS), diseñado para tender un puente entre la tokenización gruesa de 6-meros y la resolución de nucleótido único. El modelo está condicionado por metadatos opcionales (tipo de especie y tipo de gen) que permiten generación condicional. El corpus de preentrenamiento es `HuggingFaceBio/carbon-pretraining-corpus`, centrado en secuencias de ADN y ARN de eucariotas. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de secuencias de ADN y ARN con contexto largo (hasta ≈393 kbp con YaRN).
- Recuperación de secuencias (sequence recovery) en tareas generativas zero-shot.
- Predicción de efectos de variantes (VEP) en cuatro benchmarks: ClinVar coding, ClinVar non-coding, BRCA2 y TraitGym Mendelian.
- Discriminación de perturbaciones a nivel de secuencia: expansión de tripletes de nucleótidos y reemplazo sinónimo de codones.
- Generación condicional mediante tokens de metadatos (tipo de especie y tipo de gen).
- Razonamiento de contexto largo: recuperación fiable de needles hasta ≈393 kbp en el benchmark Genomic-NIAH.
- Compatibilidad con motores de inferencia como vLLM y text-generation-inference.
- Tokenización híbrida que preserva un vocabulario BPE de inglés para futuros entrenamientos conjuntos de inglés y ADN.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Predicción de efectos de variantes en genómica clínica: el modelo puede evaluar variantes en regiones codificantes y no codificantes (ClinVar, BRCA2) para priorizar variantes candidatas en estudios de asociación, aprovechando su contexto de hasta 197 kbp nativos.
- Anotación y generación de secuencias reguladoras: con contexto largo y condicionamiento por metadatos (tipo de gen, especie), permite generar o completar regiones promotoras y enhancers plausibles para experimentos de biología sintética.
- Análisis de elementos distales: la recuperación fiable de needles hasta ≈393 kbp con YaRN lo hace adecuado para tareas que requieren integrar información de regiones alejadas del locus de interés (por ejemplo, interacciones enhancer-promotor).
- Detección de perturbaciones funcionales: la discriminación de expansiones de tripletes y reemplazos sinónimos de codones sirve para cribar variantes sinónimas con posible impacto funcional en pipelines de anotación.
- Aceleración de la inferencia en producción genómica: con más de 100.000 bp/s en una H100 y compatibilidad con vLLM, puede integrarse en servicios de generación y scoring de secuencias a gran escala.
- Decodificación especulativa: combinado con Carbon-500M como modelo draft, permite reducir la latencia en tareas de generación de secuencias largas manteniendo la calidad de Carbon-3B.
- Preentrenamiento y fine-tuning en dominios biológicos: al ser un modelo Apache 2.0 con pesos safetensors y tokenizador de código remoto, puede adaptarse mediante fine-tuning a genomas de especies concretas o a tareas específicas de anotación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica de forma cualitativa que Carbon-3B es competitivo con Evo2-7B en recuperación de secuencias, cuatro benchmarks de VEP (ClinVar coding, ClinVar non-coding, BRCA2, TraitGym Mendelian) y dos tareas de perturbación de secuencias, y que recupera needles de forma fiable hasta ≈393 kbp en Genomic-NIAH, siendo varias veces más rápido que Evo2-7B. Los valores concretos deben consultarse en el informe técnico enlazado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7 GB solo para pesos (3.451 M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB para contexto moderado.
- GPU recomendadas: H100 (el autor reporta más de 100.000 bp/s en una sola H100), A100 y GPUs con al menos 16-24 GB de VRAM para contexto largo.
- Cabe en GPUs de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con margen para contexto largo; en GPUs de 12-16 GB (RTX 4080, 4070 Ti) puede requerir cuantización o contextos más cortos, aunque no se distribuyen pesos cuantizados oficialmente.
- Opciones de despliegue: transformers (referencia), vLLM y text-generation-inference, según la model card. No se confirma soporte de llama.cpp, Ollama o GGUF en la información disponible.
- Latencia y throughput: más de 100.000 pares de bases por segundo en una H100 según el autor; no se publican cifras de latencia por token ni de throughput en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-3B | 3.451 M | 32.768 tokens (≈197 kbp); 65.536 con YaRN | Hibrida: 6-meros ADN + BPE Qwen3 | Apache 2.0 | Hugging Face (repo preservado) |
| Evo2-7B | no disponible en la informacion | no disponible en la informacion | Nucleotido unico (single-nucleotide) | no disponible | Citado como baseline por el autor |
| Carbon-8B | no disponible en la informacion (familia Carbon, mayor capacidad) | no disponible en la informacion | Hibrida (familia Carbon) | no disponible | HuggingFaceBio (segun model card) |
| Carbon-500M | no disponible en la informacion | no disponible en la informacion | Hibrida (familia Carbon) | no disponible | HuggingFaceBio (segun model card) |

La model card afirma que Carbon-3B iguala a Evo2-7B en recuperación de secuencias, VEP y perturbaciones, siendo varias veces más rápido, pero no se aportan cifras numéricas en la información disponible.

## Limitaciones y advertencias

- El tokenizador solo activa el modo 6-meros con la etiqueta `<dna>`; pasar ADN sin esa etiqueta provoca tokenización BPE y un colapso del rendimiento en todos los benchmarks.
- La longitud de la secuencia de ADN debe ser múltiplo de 6 para una tokenización limpia; las letras fuera de [ATCG] se emiten como `<oov>`.
- El modelo está centrado en eucariotas; su comportamiento en procariotas, virus o secuencias muy divergentes no está documentado.
- Riesgo de alucinación en secuencias generadas: como modelo generativo, puede producir secuencias plausibles pero biológicamente inválidas o no funcionales; requiere validación experimental o computacional posterior.
- No se documentan sesgos específicos ni evaluaciones de sesgo en la información disponible.
- El contexto extendido a 65.536 tokens depende de YaRN en inferencia; el rendimiento más allá del contexto nativo puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero el tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y debe auditarse en entornos de producción.
- Esta ficha corresponde a una copia preservada por un tercero (`hellnahbru`), no al repositorio oficial `HuggingFaceBio/Carbon-3B`; conviene verificar la integridad de los pesos antes de usarla en producción.

## Enlaces

- Repositorio preservado en Hugging Face: https://huggingface.co/hellnahbru/Carbon-3B-preserved-20261029
- Repositorio oficial (referenciado en la model card): https://huggingface.co/HuggingFaceBio/Carbon-3B
- Informe tecnico: https://github.com/huggingface/carbon/blob/main/tech-report.pdf
- Repositorio GitHub: https://github.com/huggingface/carbon
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HuggingFaceBio/carbon-demo
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceBio/carbon-pretraining-corpus
- Tokenizador base (vocabulario BPE): https://huggingface.co/Qwen/Qwen3-4B
