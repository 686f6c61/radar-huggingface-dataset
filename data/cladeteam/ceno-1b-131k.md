# CladeTeam/CENO-1B-131k

## Resumen

CENO-1B-131k es el checkpoint de contexto largo (131.072 tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts (arquitectura Nemotron-H) y entrenado sin entradas de alineamiento múltiple de secuencias (MSA). Con 1.302 millones de parámetros en bfloat16, está pensado como modelo base para generación de secuencias genómicas y extracción de embeddings.

El modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de solo 512 entradas, y una arquitectura de 38 capas ocultas con 8 expertos MoE (top-2 por token). Este checkpoint corresponde a la tercera etapa de entrenamiento (extensión de contexto largo) de la familia CENO, que también incluye checkpoints con MSA (prefijo `CENO-P-*`) orientados a predicción de efectos de variantes (VEP).

Su relevancia actual radica en que ofrece una alternativa abierta (Apache-2.0) para modelado de genomas a escala de contexto largo, con la particularidad de que la columna vertebral Mamba/Attention/MoE no impone una ventana de contexto fija: los 131.072 tokens son la longitud de entrenamiento, no un límite duro. El código del modelo está incluido en el repositorio y es cargable de forma autónoma con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1,3B) |
| Parametros activos | 8 expertos MoE, top-2 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 131.072 tokens de entrenamiento (sin ventana fija por diseño de la columna vertebral) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible (modelo de secuencia genómica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La columna vertebral es un híbrido Mamba / Attention / Mixture-of-Experts basado en la arquitectura Nemotron-H. El modelo tiene 38 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención y tamaño intermedio de 4096. La capa MoE cuenta con 8 expertos y enruta top-2 por token. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea las bases de ADN a sus códigos ASCII de byte, con un vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa 3 de entrenamiento (extensión de contexto largo) de la familia CENO base. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO; esos datos no están disponibles. La clase de arquitectura es `CENOForCausalLM` (mapeo automático a `modeling_ceno.CENOForCausalLM`) y el `model_type` es `ceno`. Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generación necesitan GPU; la configuración, el tokenizador y la carga de pesos son seguros en CPU.

## Capacidades

- Generación de secuencias genómicas de forma autorregresiva sobre el alfabeto de ADN (tokenización a nivel de carácter).
- Extracción de embeddings de secuencia para tareas downstream de genómica (sondaje, fine-tuning).
- Modelado de contexto largo: entrenado a 131.072 tokens, sin ventana de contexto fija impuesta por la arquitectura híbrida.
- Adaptación downstream mediante fine-tuning para tareas genómicas específicas.
- Base para pipelines de predicción de efectos de variantes (VEP) mediante puntuación de log-verosimilitud delta entre secuencia wild-type y variante (la variante VEP se cubre en los checkpoints `CENO-P-*`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo de secuencia genómica).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Extracción de embeddings genómicos: usar el modelo como extractor de representaciones de secuencias de ADN para alimentar clasificadores o modelos de sondaje en tareas downstream (anotación funcional, clasificación de elementos regulatorios), aprovechando la tokenización a nivel de carácter y la ventana de 131k tokens.
- Generación y diseño de secuencias: generar secuencias genómicas sintéticas o completar regiones condicionadas a contexto largo, útil en exploración de diseño de secuencias y análisis de patrones.
- Modelado de contexto largo en regiones genómicas extensas: procesar fragmentos de hasta 131.072 tokens en una sola pasada para capturar dependencias de largo alcance (por ejemplo, elementos reguladores distantes), algo que modelos con ventanas cortas no pueden hacer.
- Fine-tuning para tareas genómicas específicas: adaptar el checkpoint base a tareas como predicción de elementos funcionales o clasificación de variantes, partiendo de un modelo preentrenado sobre secuencia genómica.
- Predicción de efectos de variantes (VEP): integrar el modelo en el pipeline VEP del repositorio CENO para puntuar variantes comparando log-verosimilitudes entre secuencia de referencia y variante (la model card remite a los checkpoints `CENO-P-*` y al ejemplo TraitGym VEP del repositorio de código).
- Investigación en modelos fundacionales de genómica: servir como base reproducible (Apache-2.0, código incluido) para experimentos de arquitecturas híbridas Mamba/MoE aplicadas a biología computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.302 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 2,6 GB; hay que sumar memoria para estados de activación y caché de secuencia, que crece con la longitud de contexto.
- GPU recomendadas: se requiere GPU con soporte CUDA por los kernels de Mamba. No se especifican modelos concretos en la información disponible.
- ¿Cabe en GPU de consumo? Por tamaño de pesos (unos 2,6 GB en bf16) es plausible en GPUs de consumo con suficiente VRAM, pero la información proporcionada no confirma modelos concretos ni requisitos de memoria para contexto largo.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`) y una entrada vLLM incluida en el repositorio de código de CENO para prefills superiores a 131.072 tokens. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que la ruta de precisión de HF es de una sola GPU, sin padding y admite como máximo 131.072 tokens por prefill; para prefills mayores hay que usar la entrada vLLM del repositorio.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1B-131k | 1,3B | 131.072 tokens de entrenamiento (sin ventana fija) | Híbrida Mamba/Attention/MoE (Nemotron-H) | Apache-2.0 | Hugging Face, código incluido |
| CENO-1B-1m | no disponible en la información | 1M (referencia de evidencia larga) | Híbrida Mamba/Attention/MoE | Apache-2.0 (según familia) | Hugging Face |
| CENO-P-* (checkpoints con MSA) | no disponible | no disponible | Híbrida Mamba/Attention/MoE | Apache-2.0 (según familia) | Hugging Face |

No se dispone de datos suficientes para comparar con modelos fundacionales de genómica de otros desarrolladores (por ejemplo, Evo2 del Arc Institute, del que deriva el tokenizador) en parámetros, contexto o rendimiento; esa comparación no está disponible.

## Limitaciones y advertencias

- Modelo base: no está alineado para uso conversacional ni para tareas de lenguaje natural; su dominio es la secuencia genómica.
- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional (advertencia explícita de la model card).
- Requiere GPU con CUDA para forward y generación por los kernels de Mamba; no es ejecutable en CPU para inferencia completa.
- La ruta de precisión de HF está limitada a una sola GPU, sin padding y a un máximo de 131.072 tokens por prefill; para contextos mayores hay que usar vLLM.
- Los 131.072 tokens son la longitud de entrenamiento, no un límite duro; `max_position_embeddings` es nominal y no restrictivo.
- Las referencias de evidencia larga (1M) pertenecen a CENO-1B-1m; las comprobaciones cortas multi-tamaño no implican la misma cobertura larga para todos los modelos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo general de generación autorregresiva.
- Licencia Apache-2.0: permite uso comercial, con obligación de atribución según los ficheros `LICENSE` y `NOTICE` (código derivado de Nemotron-H de NVIDIA y tokenizador derivado de Evo2 del Arc Institute, ambos Apache-2.0).

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1B-131k
- Árbol de ficheros en Hugging Face: https://huggingface.co/CladeTeam/CENO-1B-131k/tree/main
- Repositorio de código CENO (modelo, pipeline VEP y demo de generación): https://github.com/CladeTeam/CENO
