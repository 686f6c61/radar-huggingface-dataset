# CladeTeam/CENO-9B-A3B-131k

## Resumen

CENO-9B-A3B-131k es el checkpoint de contexto largo del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal entrenado sobre secuencia genómica, no sobre texto humano, construido sobre una arquitectura híbrida Mamba / Attention / Mixture-of-Experts heredada de Nemotron-H. Con 8.928.624.080 parámetros totales (8,9B) y una ventana de entrenamiento de 131.072 tokens, está diseñado para modelar secuencias de ADN a escalas que superan ampliamente las de los transformers densos convencionales.

El modelo pertenece a la etapa 3 del entrenamiento de la familia CENO (extensión de contexto largo) y se distribuye como checkpoint base, orientado a generación de secuencia genómica y extracción de embeddings, así como a adaptación posterior mediante fine-tuning o probing para tareas de genómica. La familia incluye además checkpoints MSA (CENO-P-*) para predicción de efectos de variantes (VEP), pero este checkpoint concreto no incorpora entradas de alineamiento múltiple.

Su relevancia actual reside en la combinación de tres factores poco habituales en modelos genómicos: un tokenizador a nivel de carácter (vocabulario de 512), un backbone híbrido con capas Mamba que evita la ventana de contexto fija de la atención clásica, y una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales. El modelo es cargable de forma autónoma con `trust_remote_code=True`, ya que el código de modelado está incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 8.928.624.080 (8,9B) |
| Parametros activos | 8 expertos, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 131.072 tokens de entrenamiento; sin ventana fija por diseño (Mamba) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible (modelo sobre secuencia de ADN, tokenizador a nivel de carácter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 17,9 GB) |

## Arquitectura y entrenamiento

El backbone es un híbrido Mamba / Attention / Mixture-of-Experts de 42 capas, con tamaño oculto de 2560, 20 cabezas de atención y tamaño intermedio de 10.240. La capa MoE contiene 8 expertos con enrutamiento top-2 por token. El tokenizador `CENOCharLevelTokenizer` es de nivel de carácter y mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de 512 entradas; está derivado del `CharLevelTokenizer` de Evo2 (Arc Institute). El código de modelado se deriva de la implementación de Nemotron-H en Hugging Face de NVIDIA.

El checkpoint corresponde a la etapa 3 del entrenamiento (extensión de contexto largo) y fue entrenado con secuencias de 131.072 tokens. Según la model card, el backbone no tiene una ventana de contexto fija: `max_position_embeddings` en `config.json` es nominal y no restrictivo, de modo que la longitud de entrenamiento no constituye un límite duro. No se especifican en la información disponible el volumen total de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Las capas Mamba requieren kernels CUDA, por lo que la inferencia (forward y generación) necesita GPU; la carga de configuración, tokenizador y pesos sí es segura en CPU.

## Capacidades

- Generación de secuencia genómica a nivel de base, con tokenizador de carácter sobre el alfabeto de ADN.
- Extracción de embeddings de secuencia para tareas downstream de genómica.
- Modelado causal de secuencias largas (hasta 131k tokens de entrenamiento, sin límite duro declarado).
- Adaptación mediante fine-tuning y probing para tareas genómicas específicas.
- Puntuación de verosimilitud de secuencias, base para VEP mediante delta de log-verosimilitud (aunque la model card remite a los checkpoints CENO-P-* para VEP).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Modelado de secuencias genómicas largas: el modelo puede procesar regiones de hasta 131k bases en una sola pasada, lo que permite capturar dependencias de largo alcance (elementos reguladores distantes, estructura de dominios) sin fragmentar la secuencia.
- Extracción de embeddings para clasificación downstream: se pueden obtener representaciones de secuencia y entrenar cabezas ligeras para tareas como predicción de regiones funcionales o anotación de elementos genómicos.
- Fine-tuning supervisado para tareas genómicas específicas: al ser un checkpoint base con licencia Apache-2.0, es apto para adaptación sobre datasets propietarios sin restricciones de uso comercial.
- Puntuación de verosimilitud de variantes: calculando el delta de log-verosimilitud entre secuencia wild-type y variante se puede construir un pipeline de priorización de variantes, aunque la model card recomienda los checkpoints CENO-P-* para VEP.
- Generación de secuencias sintéticas de ADN: el modelo puede generar secuencias condicionadas por prefijo, útil para aumento de datos o exploración de espacio de secuencia (con las cautelas biológicas indicadas más abajo).
- Investigación en modelos de lenguaje sobre genómica: sirve como baseline reproducible para estudiar arquitecturas híbridas Mamba/MoE aplicadas a secuencia biológica, dado que el código está incluido en el repo.
- Procesamiento por lotes en pipelines bioinformáticos: la inferencia requiere GPU con kernels Mamba, por lo que encaja en entornos con CUDA y no en flujos puramente CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,9 GB solo para pesos, más overhead de activaciones y caché; se recomienda un mínimo de 24 GB de VRAM para secuencias cortas y bastante más para contextos largos.
- GPU recomendadas: A100 (40/80 GB) o H100 para contextos de 131k; RTX 4090 (24 GB) puede ser suficiente para secuencias cortas en bf16, con riesgo de OOM en contextos largos.
- No cabe en GPUs de consumo con menos de 24 GB en bf16; no se documentan opciones de cuantización en la información disponible.
- Despliegue: `transformers` con `trust_remote_code=True`; requiere `mamba-ssm` 2.2.4, `causal-conv1d` 1.2.2.post1 y FlashAttention 2.7.3. La model card indica que HF y vLLM usan entornos separados, lo que sugiere soporte de vLLM aunque no se detalla la configuración. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03) y Transformers 4.48.3.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-9B-A3B-131k | 8,9B | 131k (sin límite duro) | Mamba/Attention/MoE híbrida | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Nemotron-H (NVIDIA) | no disponible en la información | no disponible | Mamba/Attention/MoE híbrida | Apache-2.0 (base del código) | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones completas de los modelos comparables, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card advierte explícitamente que la corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional; las secuencias generadas no deben asumirse viables.
- Modelo base sin alineación documentada: no se especifican etapas de RLHF/DPO ni filtrado de sesgos; el comportamiento en generación abierta puede ser errático.
- Tokenizador a nivel de carácter con vocabulario de 512: cualquier secuencia fuera del alfabeto de ADN esperado puede tokenizarse de forma no prevista.
- Requiere GPU con kernels CUDA para inferencia; no es desplegable en CPU para forward/generate.
- Este checkpoint no incorpora entradas MSA; para VEP la model card remite a la familia CENO-P-*.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el código derivado de Nemotron-H y del tokenizador de Evo2 arrastra obligaciones de atribución recogidas en `LICENSE` y `NOTICE`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria; conviene tratar el checkpoint con cautela en producción.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-9B-A3B-131k
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
