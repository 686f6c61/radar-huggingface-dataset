# CladeTeam/CENO-9B-A3B-131k

## Resumen

CENO-9B-A3B-131k es un modelo fundacional de lenguaje de ADN desarrollado por CladeTeam, diseñado para generar y analizar secuencias genómicas. Se trata del checkpoint de contexto largo (131.072 tokens) de la familia CENO, resultado de una tercera etapa de entrenamiento orientada a extender la ventana de contexto sobre un backbone híbrido Mamba/Atención/Mixture-of-Experts (arquitectura Nemotron-H). Con 8.928.624.080 parámetros totales en precisión bfloat16, el modelo opera sobre un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII, con un vocabulario de solo 512 entradas.

El modelo resuelve el problema del modelado de secuencias genómicas a gran escala sin depender de alineamientos múltiples de secuencias (MSA), lo que simplifica enormemente el preprocesado frente a aproximaciones clásicas de genómica computacional. Su backbone híbrido combina capas Mamba (espacio de estados), atención y un MoE con 8 expertos y enrutamiento top-2 por token, lo que le permite procesar secuencias muy largas con un coste computacional subcuadrático en las capas de estado.

Es relevante ahora porque los modelos fundacionales de ADN están emergiendo como infraestructura para tareas de genómica (predicción de efectos de variantes, extracción de embeddings, generación condicionada), y CENO ofrece una alternativa de licencia Apache-2.0, pesos abiertos en safetensors y código embebido que se puede cargar con `trust_remote_code=True`. El checkpoint está pensado como base para fine-tuning y probing, no como modelo listo para producción sin adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Atención / Mixture-of-Experts (Nemotron-H); clase `CENOForCausalLM` |
| Parametros totales | 8.928.624.080 (8,9B) |
| Parametros activos | 8 expertos MoE con top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 131.072 tokens de entrenamiento; sin ventana fija por diseño (Mamba) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No aplica (secuencias de ADN; tokenizador a nivel de carácter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 17,9 GB) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de tipo Nemotron-H con 42 capas, dimensión oculta de 2560, 20 cabezas de atención y tamaño intermedio de 10.240. Incorpora un Mixture-of-Experts con 8 expertos y enrutamiento top-2 por token, y combina capas Mamba (modelos de espacio de estados) con capas de atención. Esta mezcla permite que el modelo no tenga una ventana de contexto fija: la longitud de 131.072 tokens corresponde a la secuencia con la que se entrenó este checkpoint, no a un límite duro, y `max_position_embeddings` en `config.json` es nominal y no restrictivo.

El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`, derivado del `CharLevelTokenizer` de Evo2 de Arc Institute), con vocabulario de 512 y mapeo de bases de ADN a códigos ASCII. El modelo se entrenó en tres etapas, siendo esta la tercera (extensión de contexto largo). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. El código del modelo está embebido en el repositorio y deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0).

## Capacidades

- Generación de secuencias genómicas (ADN) autoregresiva a nivel de carácter.
- Extracción de embeddings de secuencias de ADN para tareas downstream (probe, clasificación, regresión).
- Modelado de contexto largo: entrenado a 131.072 tokens, sin límite duro por el uso de capas Mamba.
- Adaptación mediante fine-tuning para tareas de genómica (el checkpoint es una base, no un modelo instruido).
- Soporte de carga standalone con `trust_remote_code=True` (código del modelo incluido en el repo).
- No dispone de tool calling, function calling, capacidades de agente ni multilingüismo en el sentido convencional: su dominio es la secuencia genómica.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Predicción de efectos de variantes (VEP): aunque el pipeline VEP oficial se asocia a los checkpoints MSA (`CENO-P-*`), este checkpoint base puede usarse para puntuar secuencias wild-type frente a variantes mediante delta de log-verosimilitud tras el fine-tuning adecuado, tal como se ilustra en el ejemplo TraitGym del repositorio de código.
- Extracción de embeddings genómicos: usar las representaciones internas del modelo como features para modelos downstream de clasificación de regiones regulatorias, predicción de expresión o anotación funcional, aprovechando la ventana de 131k tokens para capturar contexto largo.
- Fine-tuning para tareas genómicas específicas: partir del checkpoint base para adaptar a tareas como predicción de sitios de unión de proteínas, detección de elementos reguladores o clasificación de variantes patogénicas.
- Modelado de lenguaje de ADN para generación condicionada: generar secuencias con propiedades deseadas (p. ej., composición de motivos) en investigación sintética, siempre con validación biológica posterior.
- Análisis de regiones genómicas extensas: procesar ventanas de hasta 131k bases en una sola pasada, útil para estudios de elementos de largo alcance (enhancers, dominios topológicos) donde modelos de contexto corto pierden señal.
- Investigación en modelos fundacionales de biología: servir como baseline abierto (Apache-2.0) para comparar arquitecturas híbridas Mamba/MoE frente a transformers puros en genómica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia: los pesos están en bfloat16 (~17,9 GB en disco), por lo que se requiere al menos ~18 GB de VRAM para carga completa en bf16; con cuantización a 8 bits o 4 bits (no publicada oficialmente) bajaría a rangos de ~9-10 GB y ~5 GB respectivamente, aunque no hay cuantizaciones oficiales en el repo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; GPU consumer de 24 GB (RTX 3090/4090) podrían alojar los pesos en bf16 al límite, con margen escaso para activaciones y KV cache en contextos largos.
- Las capas Mamba requieren kernels CUDA (`mamba-ssm`, `causal-conv1d`), por lo que el forward y la generación necesitan GPU; la carga de pesos, config y tokenizer es segura en CPU.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1, FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-9B-A3B-131k | 8,9B | 131k (sin límite duro) | Mamba/Atención/MoE híbrida | Apache-2.0 | Hugging Face (safetensors) |
| Evo2 (Arc Institute) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Nemotron-H (NVIDIA) | no disponible en la información | no disponible | Mamba/Atención/MoE híbrida | Apache-2.0 (implementación HF) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Evo2 y Nemotron-H se citan únicamente como referencias de las que derivan el tokenizador y la implementación del backbone, respectivamente.

## Limitaciones y advertencias

- Es un checkpoint base, no instruido ni alineado: no está pensado para uso directo en producción sin fine-tuning específico de la tarea.
- Riesgo de generación de secuencias biológicamente no funcionales o repetitivas; la propia model card advierte que la corrección numérica no garantiza generaciones libres de repeticiones ni funcionalmente válidas.
- Requiere GPU con kernels CUDA para inferencia; no funciona en CPU para forward/generate.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre la composición del corpus, lo que limita la evaluación de riesgos.
- El tokenizador a nivel de carácter con vocabulario de 512 implica secuencias de tokens muy largas para entradas de ADN, lo que incrementa el coste de cómputo y memoria en contextos extensos.
- Licencia Apache-2.0 permite uso comercial, pero el código deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute), ambos Apache-2.0; conviene revisar los ficheros `LICENSE` y `NOTICE` del repo para el cumplimiento de atribución.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de gama media sin trabajo adicional.
- El uso en genómica clínica o diagnóstico requiere validación experimental independiente; el modelo no sustituye a métodos establecidos de VEP.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-9B-A3B-131k
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación Nemotron-H de NVIDIA (referencia del backbone): no disponible en la información proporcionada
- Tokenizador Evo2 de Arc Institute (referencia): no disponible en la información proporcionada
