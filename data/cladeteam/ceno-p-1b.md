# CladeTeam/CENO-P-1B

## Resumen

CENO-P-1B es un modelo fundacional de ADN de 1.302 millones de parámetros desarrollado por CladeTeam, concebido específicamente para la predicción de efectos de variantes (VEP, *variant effect prediction*). Se trata de la variante post-entrenada con alineamiento multi-especie (MSA) de la familia CENO, construida sobre el modelo base CENO de 1B. El modelo resuelve el problema de estimar el impacto funcional de mutaciones genéticas comparando la verosimilitud de secuencias wild-type frente a variantes mediante delta de log-verosimilitud.

La arquitectura combina capas Mamba, atención y mezcla de expertos (MoE) siguiendo el diseño Nemotron-H, con 38 capas ocultas, tamaño oculto de 1024 y 8 expertos con top-2 por token. El tokenizador es a nivel de carácter, mapeando bases de ADN a sus códigos ASCII de byte, con un vocabulario de solo 512 entradas.

Es relevante ahora porque aplica arquitecturas híbridas eficientes (Mamba) al dominio genómico, un área donde los transformers densos resultan costosos en contexto largo, y porque empaqueta el pipeline de scoring MSA en el propio repositorio, permitiendo carga autónoma con `trust_remote_code=True`. Su licencia Apache-2.0 facilita la adopción comercial e investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1.3B) |
| Parametros activos | 8 expertos, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32) |
| Idiomas soportados | no disponible (modelo de dominio genómico, tokenizador de caracteres) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, código custom incluido) |

## Arquitectura y entrenamiento

El backbone es un híbrido de capas Mamba, atención y mezcla de expertos según la arquitectura Nemotron-H. Cuenta con 38 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención y tamaño intermedio de 4096. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token. El tokenizador es de nivel de carácter (`CENOCharLevelTokenizer`), derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea cada base de ADN a su código ASCII de byte, con vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa de post-entrenamiento con alineamiento multi-especie (MSA) orientada a VEP. Incluye en su configuración `intra_encoding_pattern` y una ruta de scoring MSA (`modeling_ceno_p.py`) que consume un `seq_idx` por token para puntuar entradas MSA empaquetadas. El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Predicción de efectos de variantes (VEP) mediante scoring de delta de log-verosimilitud entre secuencia wild-type y variante.
- Procesamiento de alineamientos multi-especie (MSA) empaquetados con índices de secuencia por token.
- Modelado de secuencias genómicas a nivel de base individual gracias al tokenizador de caracteres.
- Extracción de embeddings y generación de secuencias genómicas (capacidad heredada de la familia base CENO, según la model card).
- Adaptación posterior mediante fine-tuning o probing para tareas genómicas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido convencional; el dominio es exclusivamente genómico.

## Casos de uso

- Priorización de variantes en estudios de asociación genómica: el modelo puntúa variantes comparando log-verosimilitud wild-type frente a mutante, útil para filtrar candidatos en pipelines de secuenciación.
- Interpretación de variantes de significado incierto (VUS) en diagnóstico clínico-genómico: el delta de log-verosimilitud aporta una señal cuantitativa para clasificar variantes antes de validación experimental.
- Análisis de conservación evolutiva mediante MSA: al procesar alineamientos multi-especie empaquetados, permite evaluar el impacto de mutaciones en regiones conservadas.
- Investigación en genómica comparada: la ruta de scoring MSA facilita estudiar diferencias funcionales entre especies sobre secuencias alineadas.
- Fine-tuning para tareas genómicas específicas: al ser un modelo fundacional con licencia Apache-2.0, sirve como base para adaptar a clasificación de elementos reguladores, predicción de splicing u otras tareas.
- Generación y exploración de secuencias genómicas: la familia base CENO soporta generación de secuencias, aplicable a diseño exploratorio y aumento de datos en investigación.
- Integración en pipelines bioinformáticos: el ejemplo TraitGym del repositorio de código permite ejecutar VEP de forma reproducible dentro de flujos de análisis existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La inferencia requiere GPU, ya que las capas Mamba necesitan kernels CUDA; la carga de configuración, tokenizador y pesos es segura en CPU, pero el forward pass y la generación no.
- El checkpoint se publica en float32 con un tamaño de repositorio de 5,2 GB; en FP32 los pesos de 1,3B parámetros ocupan aproximadamente 5,2 GB de VRAM, cantidad que puede reducirse con cuantización (no se documentan formatos oficiales).
- Entorno probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- HF y vLLM requieren entornos separados según la model card.
- GPU recomendadas específicas, latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| CENO-P-1B | 1.3B | no disponible | Mamba/Attention/MoE híbrida | Apache-2.0 | VEP con MSA |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | Genómica fundacional |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Mamba/Attention/MoE híbrida | Apache-2.0 | Base arquitectónica general |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional, según advierte la propia model card.
- Requiere GPU con kernels CUDA para inferencia; no es ejecutable en CPU para forward passes.
- El tokenizador de caracteres limita el vocabulario a 512 entradas y el modelo está especializado en ADN, no en lenguaje natural.
- No se documentan sesgos específicos, pero al ser un modelo genómico entrenado sobre datos biológicos, puede heredar sesgos de representación de especies o poblaciones presentes en los datos de entrenamiento (composición no disponible).
- Riesgo de alucinación en generación de secuencias: las salidas generadas no deben interpretarse como secuencias biológicamente válidas sin validación experimental.
- Longitud de contexto no documentada, lo que dificulta planificar el uso con secuencias largas.
- Licencia Apache-2.0 permite uso comercial, pero el código derivado de Nemotron-H y del tokenizador de Evo2 requiere mantener la atribución indicada en `LICENSE` y `NOTICE`.
- La versión de código y las instrucciones de uso se mantienen en el repositorio de GitHub; se recomienda usar la revisión actualizada del modelo en lugar de archivos de diagnóstico históricos.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-P-1B
- Árbol de archivos: https://huggingface.co/CladeTeam/CENO-P-1B/tree/main
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
