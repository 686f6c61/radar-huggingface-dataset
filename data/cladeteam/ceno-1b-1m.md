# CladeTeam/CENO-1B-1m

## Resumen

CENO-1B-1m es un checkpoint de la familia de modelos fundacionales de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal puro sobre secuencias genomicas, construido sobre una arquitectura hibrida Mamba/Atencion/MoE (Nemotron-H) y entrenado con un contexto de hasta 1.048.576 tokens (1M, etapa 4 de la familia). Con 1.302,4 millones de parametros en bfloat16, el modelo opera directamente sobre caracteres de ADN mediante un tokenizador byte-level de vocabulario 512, sin entradas de alineamiento multiple de secuencias (MSA).

El modelo resuelve tareas de generacion de secuencias genomicas y extraccion de embeddings, y sirve como base para adaptacion posterior (fine-tuning y probing) en tareas de genomica. Su contexto de 1M de tokens es especialmente relevante para modelar regiones genomicas largas, y su backbone hibrido combina capas Mamba (eficientes en secuencias largas), atencion y mezcla de expertos (8 expertos, 2 activos por token) para reducir el coste computacional por token.

La relevancia actual del checkpoint radica en que forma parte de una familia abierta (Apache-2.0) orientada a genomica, con codigo de modelo incluido en el repositorio y cargable mediante `trust_remote_code=True`. Incluye advertencias explicitas sobre el uso de kernels CUDA para las capas Mamba y sobre los limites de prefill en la ruta de precision de Hugging Face (maximo 131.072 tokens por prefill, con vLLM para prefills mayores).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Atencion / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1302,4 M) |
| Parametros activos | 2 de 8 expertos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ADN (secuencias genomicas; tokenizador byte-level, vocab 512) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El backbone es una arquitectura hibrida Nemotron-H que combina capas Mamba, capas de atencion y capas de mezcla de expertos. La configuracion publicada indica 38 capas ocultas, 16 cabezas de atencion, tamano intermedio de 4096, 8 expertos MoE con 2 activos por token, vocabulario de 512 y contexto de 1.048.576 tokens. El tokenizador es byte-level (character-level): mapea cada caracter de ADN a su codigo ASCII, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute). El checkpoint corresponde a la etapa 4 de la familia CENO (contexto de 1M) y se distribuye en bfloat16.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF/DPO. La model card indica que el codigo del modelo deriva de la implementacion HuggingFace de Nemotron-H de NVIDIA (Apache-2.0). La implementacion de inferencia actual usa una configuracion de referencia explicita para la aritmetica de Mamba, MoE, normalizacion y atencion en BF16 sobre CUDA, con soporte de FlashAttention 2.7.3, mamba-ssm 2.2.4 y causal-conv1d 1.2.2.post1 sobre PyTorch 2.7.0a0 (NVIDIA 25.03) y Transformers 4.48.3.

## Capacidades

- Generacion de secuencias genomicas de ADN como modelo causal de lenguaje sobre caracteres.
- Extraccion de embeddings de secuencias genomicas para tareas downstream.
- Modelado de contexto largo: hasta 1.048.576 tokens, adecuado para regiones genomicas extensas.
- Adaptacion posterior: fine-tuning y probing sobre tareas de genomica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica; el unico "idioma" es ADN.
- Capacidades especiales: backbone hibrido Mamba/Atencion/MoE; tokenizador byte-level; sin entradas MSA en este checkpoint (la prediccion de efectos de variante, VEP, se realiza con los checkpoints CENO-P-* de la familia).

## Casos de uso

- Generacion de secuencias genomicas sinteticas: el modelo puede generar secuencias de ADN token a token sobre su vocabulario byte-level, util para aumento de datos y exploracion de distribuciones de secuencia en regiones de hasta 1M de tokens.
- Extraccion de embeddings para clasificacion de regiones genomicas: usar las representaciones internas del modelo como features para modelos downstream (por ejemplo, prediccion de elementos regulatorios o regiones funcionales) mediante probing.
- Fine-tuning supervisado en tareas de genomica: adaptar el checkpoint base a tareas especificas (anotacion de secuencias, clasificacion de variantes) partiendo de pesos preentrenados en ADN.
- Modelado de contexto largo en regiones genomicas: aprovechar la ventana de 1M tokens para tareas que requieren contexto extenso, como analisis de regiones intergenicas o loci largos, usando la ruta vLLM para prefills superiores a 131.072 tokens.
- Investigacion en modelos fundacionales de ADN: servir como baseline reproducible para comparar arquitecturas hibridas Mamba/MoE frente a transformers puros en genomica.
- Analisis de likelihood de secuencias: calcular log-probabilidades de secuencias wild-type frente a variantes mediante la ruta de scoring de la familia (VEP), utilizando los checkpoints CENO-P-* y el pipeline del repositorio de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y la busqueda web no incluyen metricas de MMLU, HumanEval, GSM8K ni benchmarks especificos de genomica (por ejemplo, VEP o tareas de TraitGym). El unico dato de rendimiento disponible es la advertencia de que la ruta de precision de Hugging Face permite como maximo 131.072 tokens por prefill y requiere GPU con kernels CUDA para las capas Mamba.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 2,6 GB (1.302,4 M parametros × 2 bytes); el repositorio completo ocupa 5,2 GB. La VRAM total necesaria para inferencia es mayor por estados de Mamba, cache de atencion y activaciones, y no se documenta una cifra oficial.
- GPU recomendadas: se requiere GPU con soporte de kernels CUDA (Mamba, causal-conv1d, FlashAttention). No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: el tamano de pesos en bf16 (unos 2,6 GB) es compatible con GPUs de consumo con suficiente VRAM, aunque la necesidad de kernels CUDA y el contexto de 1M condicionan el uso; no se confirma compatibilidad con modelos concretos.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta de precision single-GPU, sin padding, maximo 131.072 tokens por prefill); entrada vLLM del repositorio para prefills mayores. CPU solo para carga de config, tokenizador y pesos, no para forward/generacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| CENO-1B-1m | 1302,4 M | 1.048.576 | Hibrida Mamba/Atencion/MoE | Apache-2.0 | Hugging Face + repo GitHub |
| CENO-P-* (familia CENO, checkpoints MSA) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face + repo GitHub |
| Evo2 (Arc Institute, referencia del tokenizador) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con otros modelos fundacionales de ADN, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo es un checkpoint base: no esta instruido ni alineado para conversacion; su uso previsto es generacion de secuencias y embeddings.
- La generacion numerica correcta no garantiza secuencias libres de repeticiones ni biologicamente funcionales (advertencia explicita de la model card).
- Las capas Mamba requieren kernels CUDA: forward y generacion necesitan GPU; CPU solo es seguro para config, tokenizador y carga de pesos.
- La ruta de precision de Hugging Face esta limitada a 131.072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones idiomaticas mas alla de que el unico dominio es ADN.
- La licencia Apache-2.0 permite uso comercial, pero el codigo incluye componentes derivados de Nemotron-H (NVIDIA) y del tokenizador de Evo2 (Arc Institute); deben respetarse los archivos `LICENSE` y `NOTICE` del repositorio.
- Las referencias de Megatron CP no son intercambiables y la evidencia de contexto largo de 1M corresponde especificamente a CENO-1B-1m; las comprobaciones cortas multi-tamano no implican la misma cobertura larga para otros modelos de la familia.
- HF y vLLM usan entornos separados; mezclar stacks puede producir resultados distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-1B-1m
- Repositorio de codigo CENO (incluye pipeline VEP y demo de generacion): https://github.com/CladeTeam/CENO
- Ficha en Free2AITools: https://free2aitools.com/model/cladeteam/ceno-1b-1m
