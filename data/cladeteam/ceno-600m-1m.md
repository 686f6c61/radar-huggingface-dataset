# CladeTeam/CENO-600M-1m

## Resumen

CENO-600M-1m es el checkpoint de contexto largo (1 millón de tokens) del modelo fundacional de ADN CENO de 600M de parámetros, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una arquitectura híbrida Nemotron-H que combina capas Mamba, atención y mezcla de expertos (MoE). No recibe alineamientos múltiples de secuencia (MSA) como entrada, lo que lo diferencia de otros modelos genómicos que dependen de MSA.

El modelo resuelve dos tareas principales dentro del ámbito genómico: la generación de secuencias de ADN y la extracción de embeddings para tareas posteriores de adaptación (fine-tuning, probing). Forma parte de una familia de 15 checkpoints organizada en dos ramas: la familia base CENO (generación y puntuación de secuencia única) y la familia CENO-P (predicción de efectos de variantes mediante MSA). La rama base cubre cuatro tamaños (80M, 300M, 600M y 1B) por tres etapas de contexto de entrenamiento (base, 131k y 1m).

Su relevancia actual radica en el contexto de entrenamiento de 1.048.576 tokens y en una arquitectura sin ventana de contexto fija: al estar basada en Mamba, el límite de contexto es nominal y no restrictivo. El tokenizador es a nivel de carácter (vocabulario de 512), mapeando las bases de ADN a sus códigos ASCII. La licencia Apache-2.0 y la inclusión del código del modelo en el repositorio facilitan su uso y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | 8 expertos MoE con top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija por diseño Mamba (`max_position_embeddings` nominal y no restrictivo) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No aplica / no disponible (modelo sobre secuencia genómica, tokenizador a nivel de carácter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, biblioteca transformers con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El backbone es una arquitectura híbrida Nemotron-H que intercala capas Mamba, atención y mezcla de expertos. Cuenta con 20 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención, tamaño intermedio de 4096 y 8 expertos MoE con enrutamiento top-2 por token. El tokenizador es a nivel de carácter (vocabulario de 512), derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea las bases de ADN a sus códigos de byte ASCII.

Este checkpoint corresponde a la etapa 4 de entrenamiento (extensión de contexto largo), entrenado a una longitud de secuencia de 1.048.576 tokens. El código del modelo está incluido en el repositorio y deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face. No se dispone en la información proporcionada de detalles sobre el número total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La implementación de inferencia BF16 en Hugging Face es de una sola GPU, sin padding, y admite como máximo 131.072 tokens por prefill; para prefills mayores se debe usar la entrada vLLM del repositorio.

## Capacidades

- Generación de secuencias genómicas de ADN mediante modelado de lenguaje causal.
- Extracción de embeddings de secuencia para tareas posteriores (probing, clasificación, adaptación).
- Puntuación de secuencia única (scoring) mediante log-verosimilitud.
- Manejo de contexto muy largo gracias a la arquitectura Mamba sin ventana fija (entrenado a 1M de tokens).
- Base para fine-tuning en tareas genómicas downstream.
- La predicción de efectos de variantes (VEP) por comparación de log-verosimilitud entre secuencia wild-type y variante corresponde a la familia CENO-P (MSA), no a este checkpoint base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Extracción de embeddings genómicos: usar el modelo como extractor de representaciones de secuencias de ADN para alimentar clasificadores o modelos downstream en tareas como anotación funcional o detección de regiones regulatorias.
- Modelado de lenguaje genómico a gran escala: calcular log-verosimilitudes de secuencias para puntuar su "naturalidad" biológica y detectar secuencias anómalas o sintéticas.
- Fine-tuning para tareas genómicas específicas: adaptar el checkpoint base a tareas concretas (por ejemplo, clasificación de variantes o predicción de elementos funcionales) aprovechando su naturaleza de modelo fundacional.
- Análisis de regiones genómicas extensas: procesar contextos de hasta 1M de tokens en una sola pasada, útil para estudiar dependencias de largo alcance en el genoma que modelos de contexto corto no capturan.
- Generación de secuencias candidatas: producir secuencias de ADN sintéticas para experimentación in silico, con la advertencia de que la corrección numérica no garantiza funcionalidad biológica.
- Investigación en modelos fundacionales genómicos: servir como base reproducible para estudiar arquitecturas híbridas Mamba/MoE aplicadas a genómica, dado que el código está incluido y la licencia es permisiva.
- Integración en pipelines de bioinformática: desplegar mediante vLLM para prefills superiores a 131.072 tokens en flujos de análisis a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo requiere GPU con CUDA para forward passes y generación, ya que las capas Mamba necesitan kernels CUDA. La carga de configuración, tokenizador y pesos es segura en CPU.
- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3 GB solo para pesos (630,8M parámetros × 2 bytes), más memoria para activaciones y caché, que crece con la longitud de secuencia.
- Para contexto largo (hasta 1M de tokens) se requiere memoria considerable; no se dispone de cifras exactas de VRAM para el caso de 1M de tokens.
- GPU recomendadas: no especificadas en la información; por el tamaño del modelo cabe en GPUs consumer modernas para contextos cortos, pero el contexto de 1M exige GPUs de mayor memoria (A100/H100) o el uso de vLLM.
- El path de precisión de Hugging Face es de una sola GPU y admite como máximo 131.072 tokens por prefill; para prefills mayores se debe usar la entrada vLLM del repositorio.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-1m | 630,8M | 1M tokens de entrenamiento (sin ventana fija) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |
| CENO-1B-1m | 1B (aprox.) | 1M tokens | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |
| CENO-600M-base | 600M (aprox.) | Etapa base | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio específico (secuencia genómica): no es un modelo de lenguaje natural y su tokenizador a nivel de carácter no está pensado para texto convencional.
- La corrección numérica de la implementación no garantiza generación libre de repeticiones ni biológicamente funcional.
- Requiere GPU con CUDA para inferencia; no funciona en CPU para forward passes.
- El path de Hugging Face limita el prefill a 131.072 tokens; contextos mayores requieren vLLM.
- La evidencia de referencia de contexto largo a 1M pertenece a CENO-1B-1m; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga para este checkpoint.
- Las referencias de Megatron CP no son intercambiables entre configuraciones.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones de uso comercial más allá de la licencia Apache-2.0 (que permite uso comercial).
- El checkpoint corresponde a la familia base; la predicción de efectos de variantes (VEP) requiere los checkpoints CENO-P con MSA.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
