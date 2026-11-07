# CladeTeam/CENO-600M-base

## Resumen

CENO-600M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal que opera directamente sobre secuencias genomicas en lugar de texto natural, construido sobre una arquitectura hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) y sin entradas de alineamiento multiple de secuencias (MSA). Con 630,8 millones de parametros en bfloat16, forma parte de una familia mas amplia de 15 checkpoints organizados en dos lineas (CENO base y CENO-P con MSA) y cuatro tamanos (80M, 300M, 600M y 1B), cada uno con tres etapas de contexto de entrenamiento (base, 131k y 1m).

El modelo resuelve el problema de modelar y generar secuencias de ADN como lenguaje, lo que habilita tareas de generacion de secuencias genomicas, extraccion de embeddings y adaptacion downstream mediante fine-tuning o probing. Es relevante porque combina un tokenizador a nivel de caracter con vocabulario de 512 tokens (mapeo directo de bases a codigos ASCII) y una columna vertebral hibrida que mezcla capas Mamba con atencion y expertos, un diseno poco comun en el ambito genomico y heredado de la arquitectura Nemotron-H de NVIDIA.

La ventana de contexto nominal del checkpoint base es la de la etapa 2 de preentrenamiento; las variantes con contexto extendido (131k y 1M) se publican como checkpoints separados. El modelo esta pensado como base para investigacion genomica y requiere GPU con kernels CUDA para inferencia, ya que las capas Mamba no son ejecutables en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | 8 expertos, top-2 por token (parametros activos no disponibles) |
| Longitud de contexto | Etapa base (contexto extendido en checkpoints CENO-*-131k y CENO-*-1m; maximo de prefill HF: 131.072 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No aplica: secuencias de ADN (tokenizador a nivel de caracter, vocabulario de 512) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `trust_remote_code=True`) |

Otros datos tecnicos: 20 capas ocultas, tamano oculto 1024, 16 cabezas de atencion, tamano intermedio 4096, `model_type` ceno, clase `CENOForCausalLM`, tokenizador `CENOCharLevelTokenizer`.

## Arquitectura y entrenamiento

La columna vertebral es un hibrido Nemotron-H que combina capas Mamba (modelo de espacio de estados) con capas de atencion y capas de mezcla de expertos. El modelo tiene 20 capas ocultas con tamano oculto de 1024, 16 cabezas de atencion y tamano intermedio de 4096, con 8 expertos MoE y enrutamiento top-2 por token. El tokenizador es a nivel de caracter: mapea cada base de ADN a su codigo ASCII, lo que resulta en un vocabulario de 512 tokens. El checkpoint corresponde a la etapa 2 de preentrenamiento (base) del modelo CENO de 600M.

No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset genomico ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un checkpoint base). La implementacion de inferencia actual usa una configuracion de referencia explicita para la aritmetica de Mamba, MoE, normalizacion y atencion en BF16 sobre CUDA. El codigo del modelo deriva de la implementacion de Nemotron-H de NVIDIA y el tokenizador del `CharLevelTokenizer` de Evo2 (Arc Institute), ambos bajo Apache-2.0. La evidencia de contexto largo de 1M corresponde a CENO-1B-1m y no se extrapola automaticamente a este checkpoint segun la model card.

## Capacidades

- Generacion de secuencias genomicas de ADN de forma autoregresiva.
- Extraccion de embeddings de secuencias para tareas downstream.
- Puntuacion de secuencias mediante log-verosimilitud (base para VEP con los checkpoints CENO-P).
- Adaptacion mediante fine-tuning y probing para tareas genomicas.
- Modelado causal a nivel de base (tokenizador de caracteres, sin BPE ni subwords).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM de texto.
- No soporta vision ni audio.
- Capacidades multilingues no aplicables: el dominio es secuencia genomica.

## Casos de uso

- Generacion de secuencias de ADN sinteticas: el modelo produce secuencias base a base mediante decodificacion autoregresiva, util para aumentar datasets genomicos o estudiar la distribucion aprendida de motivos y patrones.
- Extraccion de embeddings para clasificacion downstream: las representaciones internas se pueden usar como features para entrenar clasificadores ligeros de regiones regulatorias, promotores o elementos funcionales.
- Fine-tuning para tareas genomicas especificas: adaptacion supervisada del checkpoint base a prediccion de estructura, splicing o anotacion funcional.
- Base para prediccion de efectos de variantes (VEP): el checkpoint base sirve como punto de partida; la familia CENO-P con MSA puntua secuencias wild-type frente a variantes por delta de log-verosimilitud.
- Investigacion en modelos de lenguaje genomicos: estudio comparativo de arquitecturas hibridas Mamba/Attention/MoE frente a transformers puros en modelado de ADN.
- Puntuacion de secuencias en pipelines bioinformaticos: calculo de log-verosimilitud de secuencias para filtrar candidatos o detectar secuencias anomalas respecto al prior aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia obligatoriamente en GPU: las capas Mamba requieren kernels CUDA; las pasadas forward y la generacion no funcionan en CPU (config, tokenizador y carga de pesos si son seguros en CPU).
- VRAM estimada: con 630,8M parametros en bfloat16, los pesos ocupan aproximadamente 1,26 GB; sumando estados de Mamba, cache de atencion y overhead de ejecucion se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: A100 o H100 para throughput alto y prefills largos; cualquier GPU consumer con soporte CUDA reciente (RTX 3090, RTX 4090) es suficiente para inferencia en BF16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (hasta 131.072 tokens por prefill en la ruta HF de precision); el repositorio de CladeTeam incluye una entrada vLLM para prefills mayores.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-base | 630,8M | Hibrida Mamba/Attention/MoE | Base (variantes 131k y 1M) | Apache-2.0 | Hugging Face (CladeTeam) |
| Evo2 (Arc Institute) | No disponible | No disponible | No disponible | Apache-2.0 (tokenizador citado) | Hugging Face |
| CENO-1B-base | 1B (familia CENO) | Hibrida Mamba/Attention/MoE | Base | Apache-2.0 | Hugging Face (CladeTeam) |

La informacion disponible solo permite confirmar la existencia de Evo2 (del que CENO reutiliza el tokenizador) y de otros checkpoints de la propia familia CENO; los datos de parametros, contexto y rendimiento de alternativas externas no estan disponibles para una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de texto: no procesa lenguaje natural ni soporta tareas genericas de NLP, tool calling o agentes.
- Requiere GPU con CUDA para inferencia; no hay ruta CPU funcional para generacion.
- La correccion numerica de la implementacion BF16 no garantiza generaciones libres de repeticiones ni biologicamente funcionales, segun advierte la propia model card.
- La evidencia de contexto de 1M pertenece a CENO-1B-1m y no se debe asumir para este checkpoint.
- Las referencias de Megatron con paralelismo de contexto (CP) distinto no son intercambiables, lo que complica la reproducibilidad exacta.
- Checkpoint base sin alineamiento: puede producir secuencias no plausibles biologicamente o con sesgos derivados de la composicion del corpus de entrenamiento (no detallada).
- El uso comercial esta permitido por la licencia Apache-2.0, con obligacion de mantener las atribuciones de LICENSE y NOTICE (NVIDIA Nemotron-H y Arc Institute Evo2).
- La model card indica usar la revision actualizada del modelo en lugar de archivos diagnosticos historicos.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Coleccion CENO en Hugging Face: referenciada en el repositorio de GitHub (organizacion CladeTeam)
