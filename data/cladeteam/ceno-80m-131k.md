# CladeTeam/CENO-80M-131k

## Resumen

CENO-80M-131k es el checkpoint de contexto largo (131.072 tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una arquitectura híbrida Mamba / Attention / Mixture-of-Experts (denominada Nemotron-H), sin necesidad de alineamientos múltiples de secuencia (MSA) como entrada. Con 79,3 millones de parámetros, está pensado como modelo base para generación de secuencias genómicas y extracción de embeddings.

El modelo pertenece a la tercera etapa de entrenamiento de la familia CENO (extensión de contexto largo) y se distribuye con el código de modelado incluido en el repositorio, por lo que es cargable de forma autónoma con `trust_remote_code=True`. Su tokenizador es a nivel de carácter, mapeando las bases de ADN a sus códigos ASCII de byte, con un vocabulario de 512 entradas.

Su relevancia radica en que aplica un backbone híbrido de estado (SSM) y atención con MoE a un dominio especializado como la genómica, en un rango de tamaño que cabe en una única GPU consumer, y con una licencia Apache-2.0 permisiva para uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | 8 expertos MoE, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | Entrenado a 131.072 tokens; sin ventana de contexto fija por la arquitectura Mamba/Attention |
| Tipos de cuantizacion | No disponible (entrenado y distribuido en bfloat16) |
| Idiomas soportados | No disponible (modelo de secuencia genómica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un backbone híbrido de tipo Nemotron-H que combina capas Mamba (modelo de espacio de estados), capas de atención y capas de mezcla de expertos. La configuración concreta incluye 9 capas ocultas, tamaño oculto de 512, 8 cabezas de atención, tamaño intermedio de 2048 y 8 expertos MoE con enrutamiento top-2 por token. El tokenizador es a nivel de carácter, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), y mapea cada base de ADN a su código de byte ASCII, con un vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa 3 del entrenamiento, dedicada a la extensión de contexto largo hasta 131.072 tokens. La model card indica que la arquitectura no impone una ventana de contexto fija: la longitud de entrenamiento no es un límite duro y `max_position_embeddings` en `config.json` es nominal y no restrictivo. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El código de modelado está derivado de la implementación de Nemotron-H de NVIDIA y el tokenizador de Evo2, ambos bajo Apache-2.0.

## Capacidades

- Generación de secuencias genómicas de ADN de forma causal.
- Extracción de embeddings de secuencia para tareas posteriores (probing, adaptación).
- Modelado de contexto largo: entrenado a 131.072 tokens, con capacidad de prefill mayor mediante la entrada vLLM del repositorio.
- Puntuación de secuencias mediante log-verosimilitud, base para flujos de predicción de efectos de variantes (VEP) en los checkpoints de la familia `CENO-P-*`.
- Tokenización a nivel de carácter sobre bases de ADN (sin dependencia de MSA).
- Adaptación posterior mediante fine-tuning para tareas genómicas específicas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo de lenguaje natural.

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede generar tramos de ADN de forma autorregresiva, útil para aumento de datos y exploración de regiones plausibles en investigación genómica.
- Extracción de embeddings para clasificación downstream: las representaciones internas del modelo sirven como features para modelos de predicción de elementos regulatorios, regiones codificantes u otras anotaciones genómicas.
- Predicción de efectos de variantes (VEP): puntuando la secuencia wild-type frente a la variante mediante delta de log-verosimilitud, siguiendo el ejemplo TraitGym del repositorio de código, para priorizar variantes en estudios de asociación.
- Modelado de contexto largo en regiones génicas extensas: gracias a los 131.072 tokens de entrenamiento (ampliables con vLLM), puede procesar ventanas genómicas amplias que capturen interacciones de largo alcance entre elementos distales.
- Fine-tuning específico de dominio: al ser un modelo base de 79,3M y licencia Apache-2.0, es viable adaptarlo a tareas concretas (detección de motivos, anotación funcional) con recursos modestos.
- Investigación en modelos de lenguaje genómico: como checkpoint pequeño y abierto, sirve para reproducir experimentos de arquitecturas híbridas SSM/atención/MoE aplicadas a ADN sin grandes requisitos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo se distribuye en bfloat16 con 79,3M de parámetros; los pesos ocupan aproximadamente 0,16 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- Las capas Mamba requieren kernels CUDA: los forward passes y la generación necesitan GPU. La carga de configuración, tokenizador y pesos es segura en CPU.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible. Por tamaño, una RTX 3090/4090 o incluso GPUs de gama media son suficientes.
- La ruta de precisión de Hugging Face es de una sola GPU, sin padding, y admite como máximo 131.072 tokens por prefill; para prefills mayores se debe usar la entrada vLLM del repositorio.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y vLLM (entrada propia en el repositorio). No se documenta soporte para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-131k | 79,3M | 131.072 tokens (entrenamiento) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |
| Evo2 (referencia de tokenizador) | No disponible | No disponible | No disponible | Apache-2.0 (tokenizador) | Hugging Face |
| Otros checkpoints CENO (familia de 15) | Variable (incluye CENO-1B-1m) | Variable | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional; las secuencias generadas deben validarse experimentalmente.
- El modelo es un modelo base: no está alineado para tareas concretas y requiere fine-tuning o probing para uso productivo especializado.
- Las capas Mamba exigen CUDA; no es posible la inferencia en CPU sin kernels compatibles.
- La ruta de precisión BF16 de Hugging Face tiene un límite de 131.072 tokens por prefill; prefills mayores requieren vLLM.
- La afirmación de referencia bit a bit en BF16 no cubre CPU, FP32 explícito ni atención eager; las referencias de Megatron CP no son intercambiables entre configuraciones.
- La evidencia de contexto largo de 1M corresponde a CENO-1B-1m, no a este checkpoint; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga.
- No se documentan sesgos específicos ni riesgos de alucinación en el dominio genómico; al ser un modelo de secuencia, el "alucinar" se traduce en generar secuencias biológicamente no plausibles.
- Licencia Apache-2.0: permite uso comercial, pero se deben respetar los avisos de atribución a NVIDIA (Nemotron-H) y Arc Institute (Evo2) incluidos en `LICENSE` y `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-131k
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Colección de checkpoints CENO en Hugging Face: https://huggingface.co/CladeTeam
