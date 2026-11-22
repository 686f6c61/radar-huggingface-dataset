# CladeTeam/CENO-9B-A3B-base

## Resumen
CENO-9B-A3B-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H, y no requiere alineamientos múltiples de secuencia (MSA) como entrada. Con 8.928.624.080 parámetros totales (8,9B) en precisión bfloat16, el modelo está pensado para generación de secuencias genómicas y extracción de embeddings, así como para adaptación posterior (fine-tuning y probing) en tareas de genómica.

La relevancia del modelo reside en su enfoque: en lugar de tratar el ADN como texto convencional, emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos de byte ASCII, con un vocabulario de solo 512 entradas. La mezcla de capas Mamba (que aportan eficiencia en secuencias largas), atención y expertos (8 expertos con top-2 por token) busca equilibrar capacidad y coste computacional en contextos genómicos extensos.

El checkpoint se distribuye con licencia Apache-2.0 y código de modelo incluido, de modo que puede cargarse de forma autónoma con `trust_remote_code=True`. Es un modelo base, no instruido ni alineado, orientado a investigadores y desarrolladores que necesiten una base para experimentación genómica más que a un asistente conversacional.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 8.928.624.080 (8,9B) |
| Parametros activos | 8 expertos con top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo sobre secuencia genómica, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, `trust_remote_code=True`) |

Datos arquitectónicos adicionales: 42 capas ocultas, tamaño oculto de 2560, 20 cabezas de atención, tamaño intermedio de 10240 y vocabulario de 512 (byte / carácter).

## Arquitectura y entrenamiento
La columna vertebral es una arquitectura híbrida que combina capas Mamba, capas de atención y capas de mezcla de expertos (MoE), siguiendo el diseño Nemotron-H. El modelo tiene 42 capas ocultas con un tamaño oculto de 2560 y 20 cabezas de atención; la capa MoE cuenta con 8 expertos y activa los 2 mejores por token. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea las bases de ADN a sus códigos de byte ASCII con un vocabulario de 512 entradas.

El checkpoint corresponde a la etapa 2 de preentrenamiento base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa. Un detalle técnico relevante es que las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generación necesitan GPU; la carga de configuración, tokenizador y pesos sí es segura en CPU. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Capacidades
- Generación de secuencias genómicas de ADN mediante modelado de lenguaje causal.
- Extracción de embeddings de secuencia genómica para tareas posteriores.
- Adaptación posterior mediante fine-tuning y probing en tareas de genómica.
- Modelado a nivel de carácter con vocabulario de 512 entradas (bases de ADN mapeadas a códigos ASCII).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo sobre secuencia genómica, no lenguaje natural).
- Capacidades especiales: entrada sin MSA (no requiere alineamientos múltiples de secuencia); arquitectura híbrida Mamba/Attention/MoE para secuencias largas.

## Casos de uso
- Generación de secuencias genómicas sintéticas: el modelo puede generar tramas de ADN carácter a carácter, útil para experimentación en diseño de secuencias y aumento de datos en pipelines de genómica computacional.
- Extracción de embeddings para clasificación downstream: las representaciones internas del modelo pueden alimentar clasificadores o modelos de probing para tareas como predicción de regiones reguladoras o anotación funcional.
- Fine-tuning para tareas genómicas específicas: al ser un checkpoint base, sirve como punto de partida para adaptar el modelo a dominios concretos (por ejemplo, especies o tipos de elementos genómicos) mediante ajuste supervisado.
- Investigación en modelos fundacionales de ADN: su combinación de Mamba, atención y MoE lo convierte en una plataforma para estudiar el comportamiento de arquitecturas híbridas sobre secuencias biológicas largas.
- Base para pipelines de predicción de efectos de variantes (VEP): aunque la familia CENO-P-* está orientada a VEP por comparación de log-verosimilitud entre secuencia wild-type y variante, este checkpoint base puede servir como punto de partida para adaptaciones en esa dirección.
- Experimentación con tokenización a nivel de carácter: el vocabulario de 512 entradas y el mapeo byte a base permiten estudiar el efecto de la tokenización de grano fino en el modelado de ADN.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,9B parámetros × 2 bytes), más memoria para activaciones y caché, por lo que se recomienda al menos 24 GB de VRAM para generación.
- GPU recomendadas: A100, H100 o GPUs con al menos 24 GB de VRAM; las capas Mamba requieren kernels CUDA, por lo que la inferencia no puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (por ejemplo, RTX 3090 o RTX 4090), siempre que se disponga de los kernels CUDA compatibles.
- Opciones de despliegue: transformers con `trust_remote_code=True` (stack probado con PyTorch 2.7.0a0, Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3). El autor indica que HF y vLLM usan entornos separados; no se detalla soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-9B-A3B-base | 8,9B | no disponible | Mamba / Attention / MoE (Nemotron-H) | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referencia del tokenizador) |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Mamba / Attention / MoE | Apache-2.0 | Hugging Face (base de la implementación) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Es un checkpoint base sin alineación ni instrucción: no está diseñado como asistente conversacional y puede producir salidas sin sentido biológico.
- El propio autor advierte que la corrección numérica no garantiza una generación libre de repeticiones ni biológicamente funcional.
- La inferencia requiere GPU con kernels CUDA (mamba-ssm, causal-conv1d); no es viable en CPU para forward ni generación.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto o idioma en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribución indicada en los ficheros LICENSE y NOTICE (código derivado de Nemotron-H de NVIDIA y tokenizador derivado de Evo2 del Arc Institute).
- El modelo está orientado a secuencia genómica, no a lenguaje natural; su uso fuera de ese dominio no está respaldado por la documentación.
- No se especifican requisitos de memoria para contextos largos ni límites de longitud de secuencia, lo que dificulta planificar despliegues en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-9B-A3B-base
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Ejemplo de VEP con TraitGym: incluido en el repositorio de código CENO (https://github.com/CladeTeam/CENO)
