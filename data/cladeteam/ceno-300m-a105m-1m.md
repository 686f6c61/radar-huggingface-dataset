# CladeTeam/CENO-300M-A105M-1m

## Resumen

CENO-300M-A105M-1m es el checkpoint de contexto largo (hasta 1.048.576 tokens de entrenamiento) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts (arquitectura Nemotron-H), sin entradas de alineamiento múltiple de secuencias (MSA). Con 307,5 millones de parámetros totales y 105 millones activos por token, está pensado como modelo base para generación de secuencias genómicas y extracción de embeddings, así como para adaptación posterior (fine-tuning y probing) en tareas de genómica.

El modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de solo 512 entradas. Esta elección reduce el vocabulario al mínimo y evita dependencias de tokenizadores específicos de proteína o de k-mers. La columna vertebral híbrida combina capas Mamba (modelos de espacio de estados) con atención y expertos, lo que en la práctica elimina la ventana de contexto fija: la longitud de entrenamiento de 1M tokens es la secuencia con la que se entrenó este checkpoint, no un límite duro de arquitectura.

Su relevancia actual radica en que es uno de los pocos modelos de ADN de tamaño medio con contexto de un millón de tokens y licencia Apache-2.0, lo que facilita su uso comercial y su integración en pipelines genómicos. El checkpoint es autocontenido y cargable con `trust_remote_code=True`, e incluye el código del modelo en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 (307,5M) |
| Parametros activos | 105M (MoE con 8 expertos, top-2 por token) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento (sin ventana fija por arquitectura) |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16; el repo no documenta cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de secuencia genómica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |

## Arquitectura y entrenamiento

La columna vertebral es un transformer híbrido con 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención y tamaño intermedio de 4096. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token, lo que explica la diferencia entre los 307,5M parámetros totales y los 105M activos. La combinación de capas Mamba (modelos de espacio de estados con kernels CUDA propios), atención y expertos sigue el diseño Nemotron-H de NVIDIA, cuya implementación en Hugging Face (Apache-2.0) sirve de base al código empaquetado. El tokenizador es de nivel de carácter, derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea cada base de ADN a su byte ASCII, con vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa 4 del entrenamiento de la familia CENO: la extensión de contexto largo, entrenada a 1.048.576 tokens. La model card no detalla el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. Como innovación técnica destacable, la arquitectura Mamba/Attention/MoE no impone una ventana de contexto fija: `max_position_embeddings` en `config.json` es nominal y no restrictivo. La inferencia BF16 en CUDA usa aritmética de referencia corregida para Mamba, MoE, normalización y atención, y el camino de precisión de Hugging Face está limitado a una sola GPU, sin padding y a un máximo de 131.072 tokens por prefill; para prefills mayores se indica usar la entrada vLLM del repositorio.

## Capacidades

- Generación de secuencias genómicas de ADN a nivel de base (tokenización por carácter).
- Extracción de embeddings de secuencia para tareas posteriores de probing y clasificación.
- Modelo base apto para fine-tuning en tareas de genómica.
- Razonamiento y generación autoregresiva sobre contexto muy largo (hasta 1M tokens de entrenamiento), útil para regiones genómicas extensas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicables (modelo de secuencia genómica, no de lenguaje natural).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Extracción de embeddings genómicos: usar las representaciones internas del modelo sobre regiones de ADN para alimentar clasificadores o modelos de probing en tareas como predicción de elementos reguladores o regiones funcionales.
- Generación de secuencias sintéticas de ADN: el modelo puede generar secuencias base a base para experimentos de aumento de datos o diseño exploratorio, siempre con validación biológica posterior.
- Modelado de regiones genómicas largas: gracias a su contexto de entrenamiento de 1M tokens, puede procesar ventanas extensas de genoma en una sola pasada, útil para estudiar dependencias de largo alcance entre elementos distantes.
- Fine-tuning para tareas específicas de genómica: al ser un checkpoint base con licencia Apache-2.0, puede adaptarse a dominios concretos (por ejemplo, predicción de sitios de unión) mediante ajuste supervisado.
- Investigación en modelos fundacionales de ADN: sirve como referencia para estudiar arquitecturas híbridas Mamba/MoE en el dominio genómico y comparar con alternativas transformer puras.
- Integración en pipelines bioinformáticos: el modelo es cargable con `trust_remote_code=True` y el código está empaquetado en el repo, lo que facilita su incorporación en flujos de análisis existentes; la inferencia requiere GPU por los kernels CUDA de Mamba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,6 GB (307,5M parámetros × 2 bytes), más el overhead de activaciones y kernels; el repo completo pesa 1,8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para los kernels de Mamba; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño de pesos; sin embargo, la inferencia forward y la generación requieren GPU CUDA por los kernels de Mamba (config, tokenizador y carga de pesos son seguros en CPU).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (camino de precisión single-GPU, máximo 131.072 tokens por prefill); vLLM para prefills mayores (entorno separado del de HF). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-300M-A105M-1m | 307,5M totales / 105M activos | 1.048.576 tokens de entrenamiento | Mamba/Attention/MoE híbrida | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face (tokenizador derivado) |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible en la informacion | Mamba/Attention/MoE híbrida | Apache-2.0 (implementación HF) | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La corrección numérica del modelo no garantiza generaciones libres de repeticiones ni biológicamente funcionales; las secuencias generadas deben validarse experimentalmente.
- El camino de precisión de Hugging Face está limitado a una sola GPU, sin padding y a un máximo de 131.072 tokens por prefill; para contextos mayores es necesario usar vLLM.
- La evidencia de referencia para el contexto de 1M pertenece a CENO-1.3B-A450M-1m; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga para este checkpoint.
- Las referencias de Megatron CP no son intercambiables entre configuraciones.
- La inferencia forward y la generación requieren GPU CUDA por los kernels de Mamba; CPU, FP32 explícito y atención eager no están cubiertos por la garantía de referencia BF16 bit a bit.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible; al ser un modelo de secuencia genómica, el riesgo relevante es la generación de secuencias no viables o no funcionales.
- Limitaciones de idioma: no aplicables (no es un modelo de lenguaje natural).
- Restricciones de licencia: Apache-2.0 permite uso comercial; el código empaquetado deriva de la implementación Nemotron-H de NVIDIA y el tokenizador de Evo2 del Arc Institute, ambos Apache-2.0, con atribución en los ficheros `LICENSE` y `NOTICE`.
- El checkpoint corresponde a una etapa de extensión de contexto; para producción conviene revisar la revisión actual del modelo en el repositorio de código en lugar de archivos de diagnóstico históricos.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-A105M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación Nemotron-H de NVIDIA en Hugging Face (base del código, Apache-2.0): no disponible el enlace exacto en la información proporcionada
- Tokenizador Evo2 del Arc Institute (base del tokenizador, Apache-2.0): no disponible el enlace exacto en la información proporcionada
