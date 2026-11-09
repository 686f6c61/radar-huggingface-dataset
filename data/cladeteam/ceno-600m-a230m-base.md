# CladeTeam/CENO-600M-A230M-base

## Resumen

CENO-600M-A230M-base es el checkpoint base de preentrenamiento del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Nemotron-H que combina capas Mamba, atencion y mezcla de expertos (MoE). Con 630,8 millones de parametros totales y aproximadamente 230 millones activos por token, el modelo esta disenado especificamente para generacion de secuencias de ADN y extraccion de embeddings, no para texto natural.

La relevancia de este checkpoint radica en su enfoque arquitectonico: frente a los transformers densos convencionales usados en genomica, CENO apuesta por un hibrido Mamba-Attention-MoE que busca eficiencia computacional en secuencias largas manteniendo capacidad expresiva. El tokenizer es a nivel de caracter, mapeando cada base de ADN a su codigo ASCII de byte, con un vocabulario de solo 512 entradas, lo que evita la tokenizacion por subpalabras inapropiada para secuencias biologicas.

Este es un checkpoint base (etapa 2 de preentrenamiento), pensado para adaptacion posterior mediante fine-tuning o probing en tareas genomicas. La familia CENO distingue entre checkpoints base (generacion y embeddings) y checkpoints con MSA (prediccion de efectos de variantes, VEP), que se comercializan bajo la nomenclatura CENO-P-*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | Aproximadamente 230M (top-2 de 8 expertos por token) |
| Longitud de contexto | No disponible (prefill maximo de 131072 tokens en la ruta HF) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No aplica (secuencias de ADN; no disponible para lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo emplea una columna vertebral hibrida Nemotron-H con 20 capas ocultas, tamano oculto de 1024, 16 cabezas de atencion y tamano intermedio de 4096. La componente MoE consta de 8 expertos con enrutamiento top-2 por token, lo que resulta en aproximadamente 230M parametros activos sobre los 630,8M totales. El tokenizer es a nivel de caracter (CharLevelTokenizer, derivado del de Evo2 de Arc Institute), con vocabulario de 512 entradas que mapea bases de ADN a codigos ASCII de byte.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que este checkpoint corresponde a la etapa 2 de preentrenamiento base. Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generacion necesitan GPU; la carga de configuracion, tokenizer y pesos es segura en CPU. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Capacidades

- Generacion de secuencias genomicas de ADN (modelado de lenguaje causal sobre bases).
- Extraccion de embeddings de secuencias genomicas para tareas downstream.
- Adaptacion mediante fine-tuning y probing para tareas de genomica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica; el modelo opera sobre alfabeto de ADN, no sobre lenguaje natural.
- Capacidades especiales: tokenizacion a nivel de caracter que preserva la resolucion por base; arquitectura hibrida para eficiencia en secuencias largas.

## Casos de uso

- Prediccion de efectos de variantes (VEP): aunque la model card remite a los checkpoints CENO-P-* para VEP, este checkpoint base puede adaptarse para puntuar secuencias wild-type frente a variantes mediante delta de log-verosimilitud tras fine-tuning.
- Extraccion de embeddings genomicos: el modelo puede usarse como extractor de representaciones para alimentar clasificadores downstream (por ejemplo, prediccion de regiones regulatorias o elementos funcionales) sin necesidad de generar texto.
- Modelado de secuencias de ADN para investigacion: generacion de secuencias sinteticas o completado de regiones para estudiar patrones estadisticos del genoma, aprovechando la tokenizacion por base.
- Fine-tuning para tareas genomicas especificas: adaptacion supervisada sobre datasets etiquetados (por ejemplo, prediccion de splicing o de sitios de union de proteinas) partiendo del checkpoint base.
- Probing de representaciones: analisis de que informacion biologica capturan las capas ocultas del modelo, util para investigacion en interpretabilidad de modelos genomicos.
- Base para experimentos de arquitectura hibrida: comparacion de Mamba/Attention/MoE frente a transformers densos en tareas de genomica, dado que el modelo expone una configuracion de referencia explicita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3 GB solo para pesos; el overhead de kernels Mamba, atencion y MoE eleva el consumo real, aunque el modelo es pequeno en terminos absolutos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para kernels Mamba (por ejemplo, A100, H100, RTX 4090, RTX 3090). La model card indica que se necesita GPU CUDA para forward y generacion.
- Cabe en GPU de consumo: si, en tarjetas consumer con CUDA (por ejemplo, RTX 3090 o RTX 4090), dado el tamano reducido de pesos.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el repositorio incluye una entrada vLLM para prefills superiores a 131072 tokens. La ruta HF es de una sola GPU y sin padding.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-A230M-base | 630,8M (aprox. 230M activos) | No disponible (prefill max. 131072 en HF) | Hibrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | No disponible en la informacion | No disponible | No disponible | Apache-2.0 (tokenizer derivado) | No disponible en la informacion |
| Nemotron-H (NVIDIA) | No disponible en la informacion | No disponible | Hibrida Mamba/Attention/MoE | Apache-2.0 (codigo base) | No disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Es un checkpoint base, no afinado para instrucciones ni para tareas concretas; requiere adaptacion para uso practico.
- La generacion y el forward requieren GPU con kernels CUDA (Mamba); no es viable en CPU para inferencia.
- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional, segun advierte la model card.
- La ruta HF de precision es de una sola GPU, sin padding y con un maximo de 131072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- Las referencias de precision bit a bit en BF16 no cubren CPU, FP32 explicito ni atencion eager; las referencias de Megatron CP no son intercambiables.
- La evidencia de contexto largo de 1M corresponde a CENO-1.3B-A450M-1m, no a este checkpoint.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion en sentido linguistico (no aplica a lenguaje natural) ni sobre el dataset de entrenamiento, lo que limita la evaluacion de sesgos biologicos.
- Licencia Apache-2.0 permite uso comercial, pero el codigo incluido deriva de Nemotron-H (NVIDIA) y el tokenizer de Evo2 (Arc Institute), ambos Apache-2.0; deben respetarse las atribuciones en LICENSE y NOTICE.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-A230M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
