# CladeTeam/CENO-300M-1m

## Resumen

CENO-300M-1m es el checkpoint de contexto largo (hasta 1.048.576 tokens de entrenamiento) de la familia CENO, un modelo fundacional de lenguaje sobre secuencia genómica desarrollado por CladeTeam. Se trata de un modelo causal de generación de texto cuyo "texto" son secuencias de ADN, construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts inspirada en la arquitectura Nemotron-H de NVIDIA. Con 307,5 millones de parámetros totales en precisión bfloat16, está pensado como modelo base para generación de secuencias genómicas y extracción de embeddings.

El modelo resuelve el problema de modelar dependencias de largo alcance en genomas, donde las interacciones reguladoras pueden abarcar cientos de miles de bases. Frente a transformers de atención densa, la combinación de capas Mamba (de estado recurrente) con atención y MoE reduce el coste computacional del contexto largo. El tokenizador es a nivel de carácter (vocabulario de 512), mapeando cada base de ADN a su código ASCII, lo que evita dependencias de tokenización específicas de especie.

Es relevante ahora porque los modelos fundacionales de ADN están pasando de ventanas de pocos miles de bases a contextos de escala de millón, habilitando tareas como anotación funcional, predicción de efectos de variantes y generación condicionada de secuencias. Este checkpoint se publica bajo licencia Apache-2.0 con el código del modelo incluido en el repositorio, lo que facilita su adaptación posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 (~307,5M) |
| Parametros activos | 8 expertos MoE, top-2 por token (número de parámetros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija por diseño Mamba |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre secuencia de ADN, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (precisión bfloat16) |

## Arquitectura y entrenamiento

La columna vertebral es un híbrido de capas Mamba, atención y mezcla de expertos según la arquitectura Nemotron-H. El modelo tiene 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención y tamaño intermedio de 4096. La componente MoE consta de 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de carácter con vocabulario de 512, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), que mapea las bases de ADN a sus códigos de byte ASCII.

Este checkpoint corresponde a la etapa 4 de entrenamiento (extensión de contexto largo), entrenado a una longitud de secuencia de 1.048.576 tokens. El autor indica que la arquitectura Mamba / Attention / MoE no tiene una ventana de contexto fija, por lo que `max_position_embeddings` en `config.json` es nominal y no restrictivo. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El código del modelo está incluido en el repositorio y es cargable con `trust_remote_code=True`.

## Capacidades

- Generación de secuencias genómicas de forma autorregresiva sobre alfabeto de ADN.
- Extracción de embeddings de secuencia para tareas posteriores (probing, clasificación, regresión).
- Modelado de dependencias de largo alcance gracias a la extensión de contexto a ~1M tokens.
- Base para adaptación posterior mediante fine-tuning en tareas genómicas.
- Soporte de la familia para predicción de efectos de variantes (VEP) mediante puntuación de log-verosimilitud de secuencias wild-type frente a variantes (en checkpoints MSA `CENO-P-*`, no en este base).
- No es un modelo de lenguaje natural: no se documentan capacidades multilingües, tool calling ni razonamiento de agentes.

## Casos de uso

- Anotación funcional de regiones genómicas: el modelo puede puntuar y generar secuencias en ventanas de hasta ~1M de bases, permitiendo capturar elementos reguladores distales que los modelos de contexto corto no alcanzan.
- Predicción de efectos de variantes (VEP): puntuando la log-verosimilitud de la secuencia wild-type frente a la secuencia con la variante se puede estimar el impacto funcional, siguiendo el flujo del pipeline VEP del repositorio.
- Extracción de embeddings para modelos downstream: usar las representaciones internas como features en clasificadores de elementos genómicos, sitios de unión o regiones de cromatina.
- Generación condicionada de secuencias: dado un contexto promotor o regulador, generar continuaciones plausibles como herramienta de diseño exploratorio, siempre con validación biológica posterior.
- Preentrenamiento continuado y fine-tuning específico de especie: partir de este checkpoint base para adaptarlo a genomas concretos con datasets propios.
- Investigación en modelos fundacionales de ADN: servir de referencia para comparar arquitecturas híbridas Mamba/MoE frente a transformers de atención densa en tareas de modelado de genoma.
- Búsqueda de motivos y patrones de largo alcance: aprovechar el contexto extendido para estudiar co-ocurrencias de motivos separados por cientos de miles de bases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia requiere GPU con CUDA: las capas Mamba necesitan kernels CUDA (`mamba-ssm`, `causal-conv1d`), por lo que las pasadas forward y la generación no funcionan en CPU (la carga de pesos y el tokenizador sí son seguros en CPU).
- VRAM estimada: con 307,5M parámetros en bfloat16, los pesos ocupan aproximadamente 0,6 GB; el consumo real depende de la longitud de secuencia y de las cachés de estado de Mamba y atención, que crecen con el contexto.
- La ruta de precisión de Hugging Face es de una sola GPU, sin padding, y admite como máximo 131.072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cabría en GPUs de consumo con suficiente VRAM para el contexto deseado (por ejemplo, RTX 4090 con 24 GB) para secuencias moderadas, y en A100/H100 para contextos de escala de millón.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (stack probado: PyTorch 2.7.0a0 NVIDIA 25.03, Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1, FlashAttention 2.7.3) y vLLM mediante la entrada del repositorio. HF y vLLM usan entornos separados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-300M-1m | ~307,5M | 1.048.576 tokens de entrenamiento (sin ventana fija) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face + repo GitHub |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | no disponible | Referencia citada por el tokenizador |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Mamba/Attention/MoE | Apache-2.0 (implementación base) | Referencia arquitectónica |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de los modelos comparables; la comparación se limita a la relación arquitectónica y de licencia documentada por el autor.

## Limitaciones y advertencias

- Modelo sobre secuencia de ADN, no de lenguaje natural: no debe esperarse calidad en tareas de texto convencional ni capacidades multilingües.
- El autor advierte explícitamente que la corrección numérica no garantiza generaciones libres de repeticiones ni biológicamente funcionales; toda secuencia generada requiere validación experimental.
- Riesgo de alucinación en el sentido de producir secuencias plausibles pero no funcionales o no presentes en genomas reales.
- Requiere GPU con CUDA para inferencia; no hay ruta CPU para forward passes.
- La ruta HF limita el prefill a 131.072 tokens; contextos mayores exigen vLLM.
- No se documentan sesgos ni composición del dataset de entrenamiento, lo que dificulta evaluar cobertura taxonómica o de sesgo genómico.
- Licencia Apache-2.0 permite uso comercial, pero el código incluido deriva de Nemotron-H (NVIDIA) y del tokenizador de Evo2 (Arc Institute); deben respetarse los ficheros `LICENSE` y `NOTICE` de atribución.
- Este checkpoint es base (no MSA); la funcionalidad de VEP documentada corresponde a la variante `CENO-P-*`.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación base Nemotron-H (NVIDIA, Apache-2.0): no disponible enlace directo en la información proporcionada
- Tokenizador Evo2 (Arc Institute, Apache-2.0): no disponible enlace directo en la información proporcionada
