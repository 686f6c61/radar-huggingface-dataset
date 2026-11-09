# CladeTeam/CENO-80M-A30M-1m

## Resumen

CENO-80M-A30M-1m es el checkpoint de contexto largo (1 millón de tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una arquitectura híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), sin necesidad de alineamientos múltiples de secuencia (MSA) como entrada. Con 79,3 millones de parámetros totales y 30 millones activos por token, está diseñado para generación de secuencias genómicas y extracción de embeddings, así como para adaptación posterior en tareas de genómica.

El modelo resuelve el problema de modelar secuencias de ADN a muy larga distancia, algo relevante para el análisis de regiones reguladoras, variantes estructurales y contextos genómicos extensos donde las ventanas cortas resultan insuficientes. Al emplear un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, evita dependencias de vocabularios biológicos predefinidos y mantiene una correspondencia directa entre secuencia y token.

Este checkpoint corresponde a la etapa 4 de entrenamiento (extensión de contexto largo) de la familia CENO. Es relevante ahora porque los modelos fundacionales de genómica con arquitecturas eficientes en contexto largo están emergiendo como herramientas para tareas de anotación, predicción de efectos de variantes y generación condicionada, y CENO ofrece una implementación abierta con licencia Apache-2.0 y código autocontenido cargable con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | 30M (8 expertos, top-2 por token) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento (sin ventana fija por la arquitectura Mamba) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (modelo de secuencia genómica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas ocultas | 9 |
| Tamano oculto | 512 |
| Cabezas de atencion | 8 |
| Tamano intermedio | 2048 |
| Vocabulario | 512 (byte / nivel de caracter) |
| Precision | bfloat16 |
| `model_type` | `ceno` |
| Clase de arquitectura | `CENOForCausalLM` |

## Arquitectura y entrenamiento

El backbone es una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados), capas de atención y capas de mezcla de expertos, siguiendo el diseño Nemotron-H de NVIDIA. Con 9 capas ocultas, tamaño oculto de 512, 8 cabezas de atención y un tamaño intermedio de 2048, el modelo emplea 8 expertos en la capa MoE con enrutamiento top-2 por token, lo que resulta en aproximadamente 30M de parámetros activos sobre los 79,3M totales. El tokenizador es a nivel de carácter y mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de 512 entradas.

El checkpoint corresponde a la etapa 4 del entrenamiento (extensión de contexto largo) y fue entrenado con una longitud de secuencia de 1.048.576 tokens. La arquitectura Mamba no impone una ventana de contexto fija, por lo que `max_position_embeddings` en `config.json` es nominal y no restrictivo. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El código del modelo está incluido en el repositorio y deriva de la implementación de Nemotron-H en Hugging Face de NVIDIA (Apache-2.0); el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute (Apache-2.0).

## Capacidades

- Generación de secuencias genómicas de ADN de forma causal, incluyendo contextos de hasta 1M de tokens en entrenamiento.
- Extracción de embeddings de secuencia para tareas posteriores de probing y adaptación.
- Modelado de dependencias de largo alcance gracias al componente Mamba y a la ausencia de ventana de contexto fija.
- Tokenización a nivel de carácter que preserva la correspondencia uno a uno entre base y token.
- Capacidad de adaptación posterior (fine-tuning) para tareas de genómica.
- Soporte de inferencia en BF16 sobre GPU CUDA mediante kernels Mamba.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de lenguaje natural.
- No se han documentado capacidades de visión ni audio.

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede generar tramos de ADN condicionados a un contexto previo, útil para aumento de datos y exploración de regiones plausibles en estudios genómicos.
- Extracción de embeddings para clasificación downstream: las representaciones internas del modelo pueden emplearse como features para tareas como predicción de elementos reguladores o anotación funcional, aprovechando la ventana de contexto largo.
- Modelado de regiones reguladoras extensas: con capacidad de entrenamiento en 1M de tokens, el modelo puede procesar locus completos y contextos de cromatina amplios sin truncamiento agresivo.
- Adaptación por fine-tuning para tareas específicas de genómica: el checkpoint base sirve como punto de partida para ajuste supervisado en tareas como predicción de sitios de unión o clasificación de variantes.
- Análisis de variantes por puntuación de verosimilitud: aunque los checkpoints MSA (`CENO-P-*`) son los indicados para VEP, el checkpoint base puede emplearse para comparar log-verosimilitudes entre secuencias wild-type y variantes en flujos experimentales.
- Investigación en modelos fundacionales de ADN: el modelo permite estudiar el comportamiento de arquitecturas híbridas Mamba/MoE en secuencias biológicas y comparar con alternativas transformer puras.
- Procesamiento de secuencias largas en pipelines de bioinformática: integrable en flujos que requieran modelar contextos de cientos de miles de bases, como análisis de haplotipos o regiones intergénicas extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los 79,3M de parámetros en bfloat16 ocupan aproximadamente 0,16 GB de pesos; con overhead de activaciones y kernels, se estima un uso de VRAM moderado (por debajo de 1-2 GB para secuencias cortas), aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para los kernels Mamba; se ha probado con el stack PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Cabe en GPU consumer: sí, por tamaño de parámetros; se requiere CUDA para las capas Mamba (forward y generación necesitan GPU). Configuración, tokenizador y carga de pesos son seguros en CPU.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (ruta de precisión single-GPU, sin padding, máximo 131.072 tokens por prefill); el repositorio incluye una entrada para vLLM que permite prefills mayores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-A30M-1m | 79,3M (30M activos) | 1.048.576 (entrenamiento) | Mamba/Attention/MoE híbrida | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face (referencia en la model card) |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Mamba/Attention/MoE | Apache-2.0 (código base) | Hugging Face (referencia en la model card) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un checkpoint base de genómica, no un modelo de lenguaje natural; no debe esperarse competencia en tareas de texto general, tool calling ni agentes.
- La corrección numérica en BF16 no garantiza generación libre de repeticiones ni funcionalidad biológica; las secuencias generadas deben validarse experimentalmente.
- Las capas Mamba requieren kernels CUDA, por lo que la inferencia en CPU no es viable para forward ni generación.
- La ruta de precisión de Hugging Face es single-GPU, sin padding y con un máximo de 131.072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- Las referencias de precisión BF16 bit a bit no cubren CPU, FP32 explícito ni atención eager; las referencias de Megatron CP no son intercambiables entre configuraciones.
- La evidencia de contexto largo de 1M pertenece a CENO-1.3B-A450M-1m; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga para este checkpoint.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni riesgos de alucinación en el contexto biológico.
- Licencia Apache-2.0 permite uso comercial, pero el código derivado de Nemotron-H y del tokenizador de Evo2 requiere mantener las atribuciones indicadas en `LICENSE` y `NOTICE`.
- El modelo no sustituye validación experimental ni asesoramiento bioinformático profesional.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-A30M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación de referencia Nemotron-H (NVIDIA, Hugging Face): no disponible como enlace directo en la información proporcionada
- Tokenizador Evo2 `CharLevelTokenizer` (Arc Institute): no disponible como enlace directo en la información proporcionada
