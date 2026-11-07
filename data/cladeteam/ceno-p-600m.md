# CladeTeam/CENO-P-600M

## Resumen

CENO-P-600M es un modelo fundacional de ADN de 630,8 millones de parámetros desarrollado por CladeTeam, diseñado específicamente para la predicción de efectos de variantes (variant effect prediction, VEP) en genómica. Se trata de la variante post-entrenada con alineamiento multi-especie (MSA) de la familia CENO, que incluye versiones de 300M, 600M y 1B parámetros. El modelo resuelve el problema de evaluar el impacto funcional de mutaciones genéticas comparando la verosimilitud de secuencias wild-type frente a variantes mediante delta log-likelihood.

La arquitectura es un híbrido Mamba/Attention/Mixture-of-Experts basado en Nemotron-H, con 20 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención y 8 expertos con top-2 por token. El tokenizador es a nivel de carácter (512 entradas de vocabulario), mapeando bases de ADN a sus códigos ASCII de byte. Esta elección evita la tokenización subóptima típica de vocabularios de lenguaje natural aplicados a secuencias genómicas.

El modelo es relevante ahora porque ofrece una ruta de scoring MSA empaquetada en el propio checkpoint (mediante `modeling_ceno_p.py` y el parámetro `seq_idx` por token), lo que facilita su uso standalone con `trust_remote_code=True`. Su licencia Apache-2.0 y la inclusión del código de modelo en el repositorio lo hacen desplegable sin dependencias externas más allá del stack de transformers y los kernels de Mamba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parámetros totales | 630.794.080 (630,8M) |
| Parámetros activos | 8 expertos, top-2 por token (activos no especificados en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en float32) |
| Idiomas soportados | no aplica (modelo de secuencias de ADN; tokenizador a nivel de carácter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un híbrido de capas Mamba (state space model), atención y capas Mixture-of-Experts, siguiendo la arquitectura Nemotron-H. El modelo tiene 20 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención, tamaño intermedio de 4096 y 8 expertos MoE con activación top-2 por token. El vocabulario es de 512 entradas y el tokenizador es de nivel de carácter, mapeando cada base de ADN a su código ASCII de byte. La clase de arquitectura es `CENOPForCausalLM`, con `model_type` `ceno`.

El checkpoint corresponde a la etapa de post-entrenamiento con alineamiento multi-especie (MSA) para VEP, partiendo del modelo base CENO de 600M. Incluye `intra_encoding_pattern` en su configuración y una ruta de scoring MSA que consume un `seq_idx` por token para puntuar entradas MSA empaquetadas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face, y el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute, ambos bajo Apache-2.0.

## Capacidades

- Predicción de efectos de variantes (VEP) mediante scoring de delta log-likelihood entre secuencia wild-type y variante.
- Procesamiento de entradas MSA empaquetadas con `seq_idx` por token para scoring multi-especie.
- Generación de secuencias genómicas (capacidad heredada del modelo base CENO).
- Extracción de embeddings de secuencias de ADN para tareas downstream.
- Adaptación posterior mediante fine-tuning y probing para tareas genómicas.
- Tokenización a nivel de carácter que preserva la identidad de cada base de ADN.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Predicción de efectos de variantes en estudios de asociación genómica: el modelo puntúa secuencias wild-type frente a variantes mediante delta log-likelihood, permitiendo priorizar variantes candidatas en pipelines de investigación genómica. Es adecuado porque la ruta de scoring MSA está empaquetada en el propio checkpoint.
- Análisis de alineamientos multi-especie: gracias al parámetro `seq_idx` por token, el modelo consume entradas MSA empaquetadas y puntúa conservación y variación entre especies, útil en genómica comparativa.
- Extracción de embeddings para modelos downstream: el checkpoint base de la familia CENO permite obtener representaciones de secuencias de ADN que alimentan clasificadores o modelos de probing para tareas como predicción de regiones regulatorias.
- Fine-tuning para tareas genómicas específicas: al estar bajo Apache-2.0 y cargarse standalone con `trust_remote_code=True`, puede adaptarse a dominios concretos (por ejemplo, variantes en genes diana) sin dependencias externas.
- Investigación en modelos fundacionales de genómica: sirve como punto de comparación y base para experimentos sobre arquitecturas híbridas Mamba/MoE aplicadas a secuencias biológicas.
- Evaluación de variantes en pipelines de descubrimiento de fármacos: el scoring de delta log-likelihood puede integrarse en flujos de priorización de dianas, siempre que se valide biológicamente cada predicción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2,5 GB solo para pesos (630,8M parámetros × 4 bytes), más overhead de activaciones y caché; el tamaño del repo es de 2,5 GB.
- GPU con soporte CUDA obligatorio para forward passes y generación: las capas Mamba requieren kernels CUDA. La configuración, el tokenizador y la carga de pesos son seguros en CPU.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; cualquier GPU NVIDIA con CUDA y suficiente VRAM para el checkpoint en float32 debería ser viable dado el tamaño reducido.
- Cabe en GPU de consumo: el tamaño de pesos en float32 (unos 2,5 GB) es compatible con GPUs de consumo con suficiente VRAM, aunque no se detallan modelos concretos.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. Hugging Face y vLLM usan entornos separados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-P-600M | 630,8M | no disponible | VEP con MSA | Apache-2.0 | Hugging Face (CladeTeam) |
| CENO base 600M | ~600M | no disponible | Generación y embeddings de ADN | Apache-2.0 | Hugging Face (CladeTeam) |
| Evo2 (Arc Institute) | no disponible | no disponible | Genómica (tokenizador de referencia) | Apache-2.0 (tokenizador) | no disponible |

La familia CENO incluye además variantes de 300M y 1B parámetros. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni funcionalidad biológica; las predicciones deben validarse experimentalmente.
- Requiere GPU con CUDA para inferencia: las capas Mamba necesitan kernels CUDA, lo que impide ejecución completa en CPU.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos genómicos, puede reflejar sesgos de representación de especies o poblaciones en los datos de entrenamiento (no confirmado en la información disponible).
- Riesgo de alucinación en generación de secuencias: el modelo puede producir secuencias plausibles pero biológicamente no funcionales.
- Longitud de contexto no documentada, lo que limita la planificación de entradas MSA de gran tamaño.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el código derivado de Nemotron-H y del tokenizador de Evo2 mantiene atribuciones que deben respetarse según los archivos LICENSE y NOTICE del repositorio.
- El checkpoint está en float32; no se documentan opciones de cuantización, lo que puede limitar el despliegue en entornos con VRAM muy ajustada.
- Entornos separados para Hugging Face y vLLM: la integración con vLLM requiere configuración adicional no detallada.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-P-600M
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
