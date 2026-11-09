# CladeTeam/CENO-1.3B-A450M-base

## Resumen

CENO-1.3B-A450M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal que opera directamente sobre secuencia genómica en lugar de texto natural, construido sobre una columna vertebral híbrida Nemotron-H que combina capas Mamba, atención y mezcla de expertos (MoE). Con 1.302 millones de parámetros totales y aproximadamente 450 millones activos por token (8 expertos, top-2), el modelo está diseñado para generación de secuencias genómicas y extracción de embeddings, así como para adaptación posterior en tareas de genómica.

La relevancia del modelo radica en su enfoque de tokenización a nivel de carácter sobre bases de ADN (vocabulario de 512 tokens que mapea bases a sus códigos ASCII), lo que evita los problemas de tokenización subóptima que afectan a los modelos de lenguaje generalistas cuando se aplican a genómica. La arquitectura híbrida Mamba/atención busca combinar la eficiencia de estado recurrente en secuencias largas con la capacidad expresiva de la atención, y la capa MoE reduce el coste computacional de inferencia al activar solo una fracción de los parámetros.

Este checkpoint corresponde a la etapa 2 de preentrenamiento base y es cargable de forma autónoma con `trust_remote_code=True`, ya que incluye el código del modelo en el repositorio. La familia CENO distingue entre checkpoints base (`CENO-*`), orientados a generación y embeddings, y checkpoints MSA (`CENO-P-*`), orientados a predicción de efectos de variantes (VEP). El modelo se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / atención / MoE (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 1.302.429.280 (1.3B) |
| Parametros activos | Aproximadamente 450M (8 expertos, top-2 por token) |
| Longitud de contexto | Hasta 131.072 tokens por prefill en la ruta HF de precisión (single-GPU, sin padding); prefills mayores vía entrada vLLM del repositorio |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en bfloat16) |
| Idiomas soportados | No aplica como idioma natural; opera sobre secuencia genómica (ADN) con tokenizador a nivel de carácter |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 2.6 GB), código de modelo incluido (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura híbrida Nemotron-H que intercala capas Mamba, atención y mezcla de expertos. El modelo tiene 38 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención y tamaño intermedio de 4096. La capa MoE consta de 8 expertos con enrutamiento top-2 por token, lo que explica la diferencia entre los 1.3B parámetros totales y los aproximadamente 450M activos. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), con vocabulario de 512, que mapea las bases de ADN a sus códigos de byte ASCII; está derivado del `CharLevelTokenizer` de Evo2 (Arc Institute). El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face.

El checkpoint corresponde a la etapa 2 de preentrenamiento base. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos figuran como no disponibles. Una innovación técnica destacable es la dependencia de kernels CUDA para las capas Mamba: las pasadas forward y la generación requieren GPU, mientras que la configuración, el tokenizador y la carga de pesos son seguros en CPU. La ruta de precisión BF16 en Hugging Face está verificada bit a bit contra una referencia explícita, con un stack probado de PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. La evidencia de contexto largo de 1M tokens pertenece específicamente a la variante CENO-1.3B-A450M-1m, no a este checkpoint.

## Capacidades

- Generación de secuencias genómicas de ADN de forma autorregresiva.
- Extracción de embeddings de secuencia para tareas posteriores de genómica.
- Adaptación posterior mediante fine-tuning y probing para tareas genómicas específicas.
- Modelado de lenguaje causal sobre secuencias de ADN a nivel de base (tokenización por carácter).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (no procesa lenguaje natural).
- Capacidad especial: arquitectura híbrida Mamba/atención/MoE optimizada para secuencias largas; generación y forward requieren GPU por los kernels CUDA de Mamba.

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede generar secuencias de ADN autorregresivamente, útil para aumentar datasets genómicos o explorar regiones plausibles bajo el modelo aprendido.
- Extracción de embeddings para clasificación downstream: las representaciones internas del modelo pueden usarse como features para predecir propiedades funcionales de secuencias (por ejemplo, regiones regulatorias) mediante probing.
- Fine-tuning para tareas genómicas específicas: al ser un checkpoint base, sirve como punto de partida para adaptar a tareas como anotación de elementos genómicos o predicción de estructura.
- Investigación en modelado de lenguaje sobre ADN: permite estudiar cómo las arquitecturas híbridas Mamba/MoE se comportan en dominios no textuales con alfabeto reducido.
- Base para pipelines de predicción de efectos de variantes: aunque el VEP se asocia a los checkpoints MSA (`CENO-P-*`), este checkpoint base puede servir para adaptación hacia ese fin mediante scoring de log-verosimilitud.
- Experimentación con contexto largo en genómica: la ruta HF admite hasta 131.072 tokens por prefill (y más vía vLLM), adecuada para secuencias genómicas extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 2.6 GB de pesos; con overhead de activaciones y kernels, se estima un consumo de VRAM en el rango de 6-10 GB para inferencia, aunque no se proporciona una cifra oficial.
- GPU recomendadas: se requiere GPU con soporte CUDA por los kernels de Mamba; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: probablemente sí en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB), aunque no se confirma oficialmente.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (ruta single-GPU, sin padding, máximo 131.072 tokens por prefill); entrada vLLM del repositorio para prefills mayores; los entornos HF y vLLM son separados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1.3B-A450M-base | 1.3B (aprox. 450M activos) | Hasta 131.072 tokens por prefill (HF); mayor vía vLLM | Híbrida Mamba/atención/MoE | Apache-2.0 | Hugging Face, `trust_remote_code` |
| Evo2 (Arc Institute) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Referencia de tokenizador citada |
| Nemotron-H (NVIDIA) | No disponible en la información proporcionada | No disponible | Híbrida Mamba/atención/MoE | Apache-2.0 (código base) | Referencia de implementación citada |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Requiere GPU con kernels CUDA para forward y generación; no es ejecutable en CPU para inferencia.
- La corrección numérica BF16 verificada no garantiza generación libre de repeticiones ni biológicamente funcional.
- La evidencia de contexto largo de 1M tokens corresponde a la variante CENO-1.3B-A450M-1m, no a este checkpoint; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga.
- Las referencias de Megatron CP no son intercambiables entre configuraciones.
- La ruta HF de precisión es single-GPU y sin padding, limitada a 131.072 tokens por prefill.
- Riesgo de alucinación: como modelo generativo, puede producir secuencias genómicas plausibles pero no funcionales; no debe interpretarse como validación biológica.
- Sesgos conocidos: no disponibles en la información proporcionada; el modelo se entrena sobre datos genómicos cuya composición no se detalla.
- Limitaciones de idioma: no procesa lenguaje natural; su dominio es exclusivamente secuencia de ADN.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el código deriva de Nemotron-H (NVIDIA, Apache-2.0) y el tokenizador de Evo2 (Arc Institute, Apache-2.0); deben respetarse las atribuciones de los ficheros `LICENSE` y `NOTICE`.
- La información sobre datos de entrenamiento, composición del dataset y etapas de alineación no está disponible, lo que limita la evaluación de riesgos.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1.3B-A450M-base
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación de referencia Nemotron-H (NVIDIA) en Hugging Face: no disponible como enlace directo en la información proporcionada
- Tokenizador de referencia Evo2 (Arc Institute): no disponible como enlace directo en la información proporcionada
