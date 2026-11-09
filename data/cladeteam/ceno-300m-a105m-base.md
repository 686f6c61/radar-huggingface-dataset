# CladeTeam/CENO-300M-A105M-base

## Resumen

CENO-300M-A105M-base es el checkpoint base de preentrenamiento del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una arquitectura híbrida Nemotron-H que combina capas Mamba, atención y mezcla de expertos (MoE). Con 307,5 millones de parámetros totales y 105 millones activos por token, está diseñado para generación de secuencias genómicas y extracción de embeddings, así como para adaptación posterior en tareas de genómica.

El modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de solo 512 entradas. No requiere alineamientos múltiples de secuencia (MSA) como entrada, lo que simplifica su uso frente a aproximaciones basadas en MSA. Forma parte de una familia mayor que incluye checkpoints con capacidad de predicción de efectos de variante (VEP) mediante puntuación de log-verosimilitud diferencial.

Su relevancia actual reside en la creciente demanda de modelos fundacionales específicos de dominio para genómica, donde arquitecturas eficientes en contexto largo como Mamba resultan atractivas para secuencias de ADN de gran longitud. La licencia Apache-2.0 y la inclusión del código del modelo en el propio repositorio facilitan su adopción tanto en investigación como en desarrollo comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parámetros totales | 307.503.488 (307,5M) |
| Parámetros activos | 105M (MoE con 8 expertos, top-2 por token) |
| Longitud de contexto | Hasta 131.072 tokens por prefill en la ruta HF (prefills mayores vía vLLM) |
| Tipos de cuantización | No disponible (el checkpoint se distribuye en bfloat16) |
| Idiomas soportados | No aplica (modelo de secuencia genómica); no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código de modelo incluido, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El backbone es una arquitectura híbrida Nemotron-H que intercala capas Mamba, atención y mezcla de expertos. El modelo cuenta con 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención y tamaño intermedio de 4096. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token, lo que explica la diferencia entre los 307,5M de parámetros totales y los aproximadamente 105M activos. El tokenizador es a nivel de carácter, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), y mapea las bases de ADN a sus códigos ASCII de byte con un vocabulario de 512 entradas.

El checkpoint corresponde a la etapa 2 de preentrenamiento base. No se han proporcionado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generación necesitan GPU; la carga de configuración, tokenizador y pesos es segura en CPU. La ruta de precisión HF es de una sola GPU, sin padding, y admite como máximo 131.072 tokens por prefill, con soporte de prefills mayores a través de la entrada vLLM del repositorio.

## Capacidades

- Generación de secuencias genómicas de ADN de forma autorregresiva.
- Extracción de embeddings de secuencia para tareas posteriores de probing y adaptación.
- Modelado de lenguaje causal sobre secuencias genómicas sin necesidad de MSA.
- Base para fine-tuning en tareas de genómica (clasificación, regresión, anotación).
- Punto de partida para la variante VEP de la familia (CENO-P-*), que puntúa efectos de variante mediante delta de log-verosimilitud.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (dominio genómico).
- Capacidades especiales: contexto largo (hasta 131.072 tokens por prefill en HF), arquitectura eficiente Mamba para secuencias largas.

## Casos de uso

- Extracción de embeddings genómicos: el modelo puede generar representaciones vectoriales de secuencias de ADN para alimentar clasificadores downstream, aprovechando su tokenizador a nivel de carácter y su backbone híbrido para capturar dependencias locales y de largo alcance.
- Fine-tuning para anotación funcional: partiendo del checkpoint base, se puede adaptar a tareas como predicción de regiones reguladoras, sitios de splicing o elementos funcionales, dado que el modelo ya ha sido preentrenado sobre secuencia genómica.
- Modelado de secuencias largas: gracias a las capas Mamba y a la ventana de hasta 131.072 tokens por prefill, resulta adecuado para contextos genómicos extensos donde los transformers densos sufren por coste cuadrático.
- Investigación en modelos fundacionales de ADN: sirve como punto de comparación y base para experimentos sobre arquitecturas híbridas Mamba/MoE en genómica, con código incluido en el repositorio.
- Generación de secuencias sintéticas de ADN: el modelo puede generar secuencias plausibles para experimentos de diseño in silico, siempre con validación biológica posterior.
- Punto de partida para pipelines de predicción de efectos de variante: aunque la capacidad VEP reside en los checkpoints CENO-P-*, este checkpoint base alimenta el pipeline de adaptación descrito en el repositorio de código.
- Prototipado en genómica computacional: al distribuirse con licencia Apache-2.0 y código incluido, permite integrarse rápidamente en flujos de investigación sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 615 MB de pesos (307,5M parámetros × 2 bytes); el repositorio completo ocupa 2,5 GB. La VRAM real dependerá de la longitud de secuencia y del estado de las capas Mamba y MoE.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; se requiere una GPU CUDA para las capas Mamba.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño de 307,5M parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta HF, una sola GPU, sin padding, máximo 131.072 tokens por prefill); vLLM mediante la entrada del repositorio para prefills mayores. Entornos separados para HF y vLLM.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-300M-A105M-base | 307,5M (105M activos) | 131.072 tokens por prefill (HF) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | No disponible | No disponible | No disponible | Apache-2.0 (tokenizador derivado) | No disponible |
| Otros modelos fundacionales de ADN | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint base: no está ajustado para instrucciones ni para tareas específicas; requiere fine-tuning o probing para uso downstream.
- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional; las secuencias generadas deben validarse experimentalmente.
- Las capas Mamba requieren kernels CUDA: la inferencia en CPU no es viable para pasadas forward ni generación.
- La ruta de precisión HF está limitada a una sola GPU, sin padding y a un máximo de 131.072 tokens por prefill; prefills mayores requieren vLLM.
- La evidencia de contexto largo de 1M pertenece a CENO-1.3B-A450M-1m, no a este checkpoint; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga para todos los modelos.
- Las referencias de Megatron CP no son intercambiables entre sí.
- No se han proporcionado datos sobre sesgos, composición del dataset de entrenamiento ni evaluación de riesgos de alucinación en dominio genómico.
- Licencia Apache-2.0 permite uso comercial, pero el código incluido deriva de la implementación Nemotron-H de NVIDIA y el tokenizador de Evo2 del Arc Institute; deben respetarse las atribuciones de los ficheros LICENSE y NOTICE.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-A105M-base
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
