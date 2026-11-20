# CladeTeam/CENO-80M-A30M-1m

## Resumen

CENO-80M-A30M-1m es un checkpoint de contexto largo (hasta 1.048.576 tokens de entrenamiento) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Nemotron-H que combina capas Mamba, atención y mezcla de expertos (MoE). Con 79,3 millones de parámetros totales y unos 30 millones activos por token (top-2 sobre 8 expertos), está pensado para generación de secuencias genómicas y extracción de embeddings, no para texto natural.

El modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de solo 512 entradas. Esta etapa corresponde a la fase 4 de entrenamiento (extensión de contexto largo) de la familia CENO, y se distribuye como checkpoint autónomo cargable con `trust_remote_code=True`, ya que el código del modelo va incluido en el repositorio.

Su relevancia actual radica en que ofrece una ventana de contexto genómico muy amplia (del orden del millón de bases) en un modelo de apenas 80M de parámetros, lo que permite analizar regiones regulatorias extensas o genes completos con requisitos de hardware moderados, dentro de una licencia permisiva Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | ~30M (MoE top-2 sobre 8 expertos) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento (sin ventana fija por la arquitectura Mamba) |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16) |
| Idiomas soportados | no disponible (modelo de secuencia genómica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, `model_type: ceno`) |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura híbrida Nemotron-H que intercala capas Mamba con capas de atención y capas de mezcla de expertos. El modelo tiene 9 capas ocultas, tamaño oculto de 512, 8 cabezas de atención y tamaño intermedio de 2048. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea cada base de ADN a su byte ASCII, resultando en un vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa 4 de entrenamiento de la familia CENO: la extensión de contexto largo, entrenada a 1.048.576 tokens. Según la model card, la arquitectura Mamba/Attention/MoE no impone una ventana de contexto fija; `max_position_embeddings` en `config.json` es nominal y no restrictivo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0).

## Capacidades

- Generación de secuencias genómicas de ADN a nivel de base (modelo de lenguaje causal sobre caracteres).
- Extracción de embeddings de secuencia genómica para tareas posteriores (probing, clasificación, adaptación).
- Modelado de dependencias de largo alcance gracias a la ventana de entrenamiento de 1.048.576 tokens.
- Base para adaptación mediante fine-tuning en tareas genómicas downstream.
- Punto de partida para la variante MSA (`CENO-P-*`) orientada a predicción de efecto de variantes (VEP) mediante delta de log-verosimilitud.
- No se documentan capacidades de tool calling, agentes, multilingüismo natural, visión ni audio.

## Casos de uso

- Anotación y generación de regiones genómicas: el modelo puede generar secuencias plausibles de ADN en regiones de interés, útil para aumento de datos y estudio de patrones de secuencia en tramos largos gracias a su contexto de 1M de tokens.
- Extracción de embeddings para clasificación downstream: se pueden obtener representaciones de fragmentos genómicos y entrenar cabezas ligeras para tareas como detección de elementos regulatorios o clasificación de regiones.
- Predicción de efecto de variantes (VEP): puntuando secuencias wild-type frente a variantes con delta de log-verosimilitud, siguiendo el ejemplo TraitGym del repositorio CENO.
- Análisis de genes completos y regiones regulatorias extensas: la ventana de entrenamiento de ~1M de bases permite modelar contextos que exceden la capacidad de modelos con contexto corto.
- Fine-tuning específico de organismo o tarea: al ser un modelo base pequeño (80M), es viable adaptarlo con recursos modestos a dominios genómicos concretos.
- Investigación en modelos de lenguaje de ADN: sirve como banco de pruebas de arquitecturas híbridas Mamba/MoE a escala reducida para estudiar eficiencia y escalado de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en GPU obligatoria: las capas Mamba requieren kernels CUDA; el forward y la generación no funcionan en CPU (la carga de pesos, configuración y tokenizador sí son seguros en CPU).
- VRAM estimada: el checkpoint en bfloat16 ocupa aproximadamente 0,16 GB de pesos (79,3M parámetros), por lo que cabe holgadamente en cualquier GPU con más de 1-2 GB de VRAM para modelos pequeños; el consumo real dependerá de la longitud de secuencia y de las activaciones.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, dado el tamaño reducido del modelo.
- Despliegue: la ruta de Hugging Face es mona-GPU, sin padding, y admite como máximo 131.072 tokens por prefill; para prefills mayores se indica usar la entrada vLLM del repositorio. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-A30M-1m | 79,3M (~30M activos) | 1.048.576 (entrenamiento) | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face + repo GitHub |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | no disponible | referenciado por el tokenizador |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Mamba/Attention/MoE | Apache-2.0 (implementación base) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de secuencia genómica, no de lenguaje natural: no debe emplearse para tareas de texto convencional ni se documentan idiomas naturales soportados.
- Requiere GPU con kernels CUDA para inferencia; no es ejecutable en CPU para forward/generación.
- La ruta de Hugging Face limita el prefill a 131.072 tokens por llamada; para contextos mayores hay que usar vLLM.
- La card advierte que la corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional; las secuencias generadas no deben interpretarse como válidas biológicamente sin validación.
- Riesgo de alucinación inherente a modelos generativos: secuencias plausibles no equivalen a secuencias reales.
- Sesgos: no documentados en la información disponible.
- Licencia Apache-2.0 permisiva para uso comercial, con obligación de atribución según los ficheros `LICENSE` y `NOTICE` (código derivado de Nemotron-H de NVIDIA y tokenizador derivado de Evo2 del Arc Institute).
- Checkpoint base: no está ajustado para tareas concretas; requiere adaptación para uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-A30M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación base Nemotron-H (NVIDIA): no disponible como enlace directo en la información proporcionada
- Tokenizador de referencia Evo2 (Arc Institute): no disponible como enlace directo en la información proporcionada
