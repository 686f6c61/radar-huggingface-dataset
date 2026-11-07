# CladeTeam/CENO-300M-1m

## Resumen

CENO-300M-1m es el checkpoint de contexto largo (hasta 1.048.576 tokens de entrenamiento) de la familia CENO, un modelo fundacional de ADN presentado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts derivada de la arquitectura Nemotron-H de NVIDIA. El modelo no acepta alineamientos múltiples de secuencia (MSA) como entrada y opera directamente sobre nucleótidos.

Con 307.503.488 parámetros totales en precisión bfloat16, el modelo emplea un tokenizador a nivel de carácter que mapea las bases de ADN a sus códigos ASCII, con un vocabulario de 512 entradas. Su propósito es servir como base para generación de secuencia genómica y extracción de embeddings, así como punto de partida para adaptación posterior en tareas de genómica (fine-tuning y probing). Es relevante para investigadores que necesitan procesar contextos genómicos muy largos sin recurrir a mecanismos de atención cuadrática convencionales.

Este checkpoint corresponde a la etapa 4 de entrenamiento (extensión de contexto largo) de la familia. Según la model card, la columna Mamba/Attention/MoE no impone una ventana de contexto fija: la longitud de 1.048.576 tokens es la longitud de secuencia usada en entrenamiento, mientras que `max_position_embeddings` en la configuración es nominal y no restrictivo. El modelo se distribuye bajo licencia Apache-2.0 y es cargable de forma autónoma con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 |
| Parametros activos | no disponible (MoE con 8 expertos, top-2 por token) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija según el autor |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencia de ADN; tokenizador byte/carácter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La columna vertebral es un híbrido Mamba / Attention / Mixture-of-Experts basado en Nemotron-H. Cuenta con 9 capas ocultas, tamaño oculto de 1024, 8 cabezas de atención y tamaño intermedio de 4096. La capa MoE incluye 8 expertos con enrutamiento top-2 por token. El vocabulario es de 512 entradas y el tokenizador es a nivel de carácter (derivado del `CharLevelTokenizer` de Evo2 de Arc Institute), mapeando bases de ADN a códigos de byte ASCII. La clase de modelo es `CENOForCausalLM` (`modeling_ceno.CENOForCausalLM`) y el tokenizador `ceno_tokenizer.CENOCharLevelTokenizer`.

Este checkpoint representa la etapa 4 (extensión de contexto largo) del entrenamiento de la familia CENO, con una longitud de secuencia de 1.048.576 tokens. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card indica que las capas Mamba requieren kernels CUDA, por lo que las pasadas hacia delante y la generación necesitan GPU. La pila probada es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. La ruta de precisión HF es de una sola GPU, sin padding, y admite como máximo 131.072 tokens por prefill.

## Capacidades

- Generación de secuencia genómica de ADN a nivel de nucleótido mediante modelado de lenguaje causal.
- Extracción de embeddings para secuencias genómicas, útil como representación agnóstica de tarea.
- Adaptación posterior: fine-tuning y probing para tareas de genómica.
- Procesamiento de contexto extremadamente largo (entrenado a 1.048.576 tokens), adecuado para regiones genómicas extensas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; opera sobre alfabeto de ADN codificado en bytes.
- Capacidad especial: la variante MSA de la familia (`CENO-P-*`) permite predicción de efecto de variante (VEP) mediante comparación de log-verosimilitud entre secuencia silvestre y variante.

## Casos de uso

- Modelado de secuencias genómicas largas: usar el modelo para generar y puntuar regiones de ADN de hasta un millón de tokens de entrenamiento, aprovechando la ausencia de ventana fija de la columna Mamba para contextos extensos.
- Extracción de embeddings para clasificación downstream: obtener representaciones de fragmentos de ADN y alimentar clasificadores o sondas lineales para tareas como identificación de regiones regulatorias.
- Fine-tuning para tareas genómicas específicas: adaptar el checkpoint base (307M parámetros) a tareas concretas con recursos moderados, dado su tamaño contenido.
- Predicción de efecto de variante (VEP): aunque este checkpoint es base, la familia dispone de checkpoints MSA (`CENO-P-*`) con los que se puntúa el delta de log-verosimilitud entre secuencia silvestre y variante, siguiendo el ejemplo TraitGym del repositorio.
- Investigación en modelos fundacionales de genómica: servir como base reproducible para experimentos de scaling y arquitecturas híbridas Mamba/MoE sobre datos biológicos.
- Prototipado de generación de secuencia con requisitos de contexto largo: emplear el checkpoint para pruebas de generación condicionada sobre ventanas extensas, con la salvedad de que la generación HF está limitada a 131.072 tokens por prefill y requiere vLLM para prefills mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 307,5M parámetros en bfloat16 el peso ocupa en torno a 0,6 GB, a lo que se suman los estados y kernels de las capas Mamba y MoE.
- GPU recomendadas: no disponibles en la información proporcionada; se requiere GPU con CUDA por los kernels Mamba.
- Cabe en GPU de consumo: el tamaño de pesos (0,6 GB en bf16) es compatible con GPUs de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, vLLM (entrada propia del repositorio para prefills mayores de 131.072 tokens). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| CENO-300M-1m | 307,5M | 1.048.576 (entrenamiento) | Híbrida Mamba/Attention/MoE | Apache-2.0 |
| CENO-1B-1m | no disponible | 1M (referencia larga) | Híbrida Mamba/Attention/MoE | Apache-2.0 |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La corrección numérica no garantiza generación libre de repeticiones ni biológicamente funcional, según advierte el autor.
- La generación y las pasadas hacia delante requieren GPU con kernels CUDA; CPU solo es segura para carga de configuración, tokenizador y pesos.
- La ruta de precisión HF está limitada a una sola GPU, sin padding, y a un máximo de 131.072 tokens por prefill; para prefills mayores hay que usar vLLM.
- El autor señala que la evidencia de referencia de contexto largo de 1M pertenece a CENO-1B-1m y que las pruebas cortas multi-tamaño no implican la misma cobertura larga en todos los modelos.
- No se han publicado en la información disponible datos sobre sesgos, tasa de alucinación ni evaluación de calidad biológica.
- Las referencias de Megatron CP no son intercambiables entre sí, según la model card.
- No se documentan restricciones de licencia para uso comercial más allá de la licencia Apache-2.0.
- El código del modelo deriva de la implementación Nemotron-H de NVIDIA (Apache-2.0) y el tokenizador de Evo2 de Arc Institute (Apache-2.0); véanse LICENSE y NOTICE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Ficha en Free2AITools: https://free2aitools.com/model/cladeteam/ceno-300m-1m
