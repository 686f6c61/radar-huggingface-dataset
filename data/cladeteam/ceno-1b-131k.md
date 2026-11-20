# CladeTeam/CENO-1B-131k

## Resumen

CENO-1B-131k (denominado formalmente CENO-1.3B-A450M-131k en su model card) es un modelo fundacional de lenguaje de ADN desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal que opera directamente sobre secuencia genómica, construido sobre una arquitectura híbrida Nemotron-H que combina capas Mamba, atención y mezcla de expertos (MoE). Con 1.302 millones de parámetros totales y aproximadamente 450 millones de parámetros activos por token, el modelo está diseñado para tareas de generación de secuencias genómicas y extracción de representaciones (embeddings) para adaptación posterior.

Este checkpoint corresponde a la etapa 3 del entrenamiento de la familia CENO, centrada en la extensión de contexto largo hasta 131.072 tokens. El tokenizador es de nivel de carácter (byte-level), mapeando las bases de ADN a sus códigos ASCII, con un vocabulario de solo 512 entradas. No requiere alineamientos múltiples de secuencia (MSA) como entrada, lo que simplifica su uso frente a modelos genómicos que dependen de MSA.

Su relevancia radica en la combinación de una arquitectura de estado espacio (Mamba) con MoE y contexto largo sobre secuencias genómicas, un nicho poco cubierto por los modelos de propósito general. La licencia Apache-2.0 y el código empaquetado en el repositorio facilitan su uso comercial y su integración en pipelines de investigación genómica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1.3B) |
| Parametros activos | Aproximadamente 450M (top-2 de 8 expertos por token) |
| Longitud de contexto | 131.072 tokens de entrenamiento; sin ventana fija por la arquitectura Mamba |
| Tipos de cuantizacion | No disponible (checkpoint en bfloat16) |
| Idiomas soportados | No aplica (secuencias de ADN; tokenizador byte/carácter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El backbone es una arquitectura híbrida Nemotron-H que intercala capas Mamba, capas de atención y capas de mezcla de expertos. El modelo tiene 38 capas ocultas, tamaño oculto de 1024, 16 cabezas de atención y tamaño intermedio de 4096. La capa MoE cuenta con 8 expertos con enrutamiento top-2 por token, lo que reduce el coste de cómputo en inferencia respecto a un modelo denso del mismo tamaño total. El tokenizador es de nivel de carácter, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), con un vocabulario de 512 entradas que mapea las bases de ADN a sus códigos ASCII.

Este checkpoint corresponde a la etapa 3 del entrenamiento (extensión de contexto largo) y fue entrenado a una longitud de secuencia de 131.072 tokens. Según la model card, la arquitectura Mamba/Attention/MoE no tiene una ventana de contexto fija, por lo que `max_position_embeddings` es nominal y no restrictivo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El código del modelo deriva de la implementación de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0).

## Capacidades

- Generación de secuencias genómicas de ADN de forma autorregresiva.
- Extracción de embeddings de secuencia para adaptación posterior (fine-tuning, probing).
- Modelado de contexto largo hasta 131.072 tokens por prefill en la ruta de precisión de Hugging Face, con soporte de prefills mayores mediante la entrada vLLM del repositorio.
- Procesamiento de secuencias sin necesidad de alineamientos múltiples (MSA).
- Tokenización byte/carácter sobre bases de ADN.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (dominio genómico).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede muestrear secuencias de ADN base a base, útil para aumentar datasets de entrenamiento o explorar regiones plausibles del espacio de secuencia.
- Extracción de representaciones para genómica: los embeddings del modelo sirven como entrada para clasificadores o modelos de predicción de elementos funcionales tras un fine-tuning ligero.
- Adaptación a tareas genómicas específicas: fine-tuning sobre el checkpoint base para clasificación de regiones regulatorias, predicción de estructura o anotación funcional.
- Predicción del efecto de variantes (VEP): puntuando secuencias wild-type frente a variantes mediante delta de log-verosimilitud, con el pipeline VEP del repositorio de CENO (la familia ofrece checkpoints `CENO-P-*` específicos para esta tarea).
- Modelado de contexto largo en regiones genómicas extensas: gracias a los 131.072 tokens de entrenamiento y a la ausencia de ventana fija, permite procesar fragmentos genómicos largos en una sola pasada.
- Investigación en modelos de lenguaje de ADN: base para estudiar el comportamiento de arquitecturas híbridas Mamba/MoE sobre secuencias biológicas y comparar con modelos basados solo en atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,6 GB para los pesos (1.302M parámetros × 2 bytes), más overhead de activaciones y kernels Mamba.
- La generación y los forward passes requieren GPU con kernels CUDA para las capas Mamba; la carga de pesos, configuración y tokenizador es segura en CPU.
- GPU recomendadas: no se especifican modelos concretos; se indica una GPU CUDA para inferencia. La ruta de precisión de Hugging Face es de una sola GPU, sin padding, con un máximo de 131.072 tokens por prefill.
- Cabe en GPU de consumo: por tamaño de pesos (unos 2,6 GB en bf16) es plausible en GPUs de consumo con soporte CUDA y kernels Mamba, aunque no se confirma en la información disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el repositorio incluye una entrada vLLM para prefills mayores. No se mencionan llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1B-131k | 1.3B (A450M) | 131.072 (sin ventana fija) | Mamba/Attention/MoE | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Nemotron-H (NVIDIA) | No disponible | No disponible | Mamba/Attention/MoE | Apache-2.0 (implementación) | Hugging Face |

La información proporcionada solo permite identificar a Evo2 (origen del tokenizador) y a Nemotron-H (origen de la implementación del backbone) como referencias arquitectónicas o de componentes. No se dispone de datos de parámetros, contexto ni rendimiento de esos modelos en la información disponible para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo es un checkpoint base de un modelo fundacional de ADN; no está afinado para instrucciones ni para diálogo general.
- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional, según advierte la propia model card.
- La generación y los forward passes requieren GPU con kernels CUDA para Mamba; no es ejecutable en CPU para inferencia completa.
- La ruta de precisión de Hugging Face está limitada a una sola GPU, sin padding y a un máximo de 131.072 tokens por prefill.
- El tokenizador byte/carácter limita el vocabulario a 512 entradas, lo que implica secuencias más largas en tokens para el mismo contenido genómico.
- No se especifican sesgos conocidos, composición del dataset ni evaluación de alucinación en la información disponible.
- Licencia Apache-2.0: permite uso comercial, con atribución a NVIDIA (código Nemotron-H) y a Arc Institute (tokenizador Evo2) según los archivos LICENSE y NOTICE del repositorio.
- No hay datos publicados de benchmarks que permitan validar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1B-131k
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
