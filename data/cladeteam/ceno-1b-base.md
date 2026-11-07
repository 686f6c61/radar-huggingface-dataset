# CladeTeam/CENO-1B-base

## Resumen

CENO-1B-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts (MoE) de tipo Nemotron-H, sin entradas de alineamiento multiple de secuencias (MSA). Cuenta con 1.302,4 millones de parametros en precision bfloat16 y un vocabulario de 512 tokens a nivel de caracter (byte / ASCII).

El modelo resuelve la tarea de modelado generativo y extraccion de representaciones sobre secuencias de ADN, sirviendo como base para adaptacion posterior (fine-tuning, probing) en tareas de genomica. Forma parte de la familia CENO, que distingue checkpoints base (generacion y embeddings) de checkpoints MSA (prediccion de efecto de variantes, VEP) mediante el calculo de delta log-likelihood entre secuencia wild-type y variante.

Es relevante ahora porque aplica una arquitectura hibrida eficiente (Mamba + atencion + MoE) al dominio genomico con licencia Apache-2.0 y codigo embebido en el repositorio, lo que facilita su carga standalone con `trust_remote_code=True`. El checkpoint fue creado en julio de 2026 y actualizado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1,3B) |
| Parametros activos | 8 expertos MoE, top-2 por token (parametros activos exactos no disponibles) |
| Longitud de contexto | no disponible (se menciona un limite de 131.072 tokens por prefill en la ruta HF; evidencia de 1M asociada a CENO-1B-1m) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: secuencia genomica / ADN) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `model_type` ceno) |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida Mamba / Attention / Mixture-of-Experts basada en Nemotron-H, con 38 capas ocultas, tamano oculto de 1024, 16 cabezas de atencion y tamano intermedio de 4096. El componente MoE consta de 8 expertos con top-2 por token. El tokenizador es a nivel de caracter (`CENOCharLevelTokenizer`), con un vocabulario de 512 tokens que mapea las bases de ADN a sus codigos ASCII de byte; deriva del `CharLevelTokenizer` de Evo2 (Arc Institute).

Este checkpoint corresponde a la etapa 2 (preentrenamiento base). No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron RLHF/DPO. La model card indica que las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generacion necesitan GPU; la carga de pesos, configuracion y tokenizador son seguras en CPU. La ruta de precision HF es mono-GPU, sin padding, y admite como maximo 131.072 tokens por prefill; para prefills mayores se indica usar la entrada vLLM del repositorio. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Capacidades

- Generacion de secuencia genomica (modelado de lenguaje causal sobre ADN).
- Extraccion de embeddings de secuencia para tareas downstream.
- Adaptacion posterior mediante fine-tuning y probing en genomica.
- Prediccion de efecto de variantes (VEP) mediante delta log-likelihood, disponible en los checkpoints MSA de la familia (CENO-P-*), no en este checkpoint base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (dominio genomico, tokenizador a nivel de caracter).
- Capacidades especiales: arquitectura hibrida Mamba + atencion + MoE; carga standalone con codigo embebido; inferencia CUDA BF16 con referencia bit a bit segun la configuracion explicita del modelo.

## Casos de uso

- Modelado generativo de ADN: el modelo puede generar secuencias genomicas token a token sobre un vocabulario de 512 bases ASCII, util para exploracion de distribuciones de secuencia y tareas de diseno in silico.
- Extraccion de embeddings para probing: las representaciones internas del checkpoint base pueden alimentar clasificadores ligeros para tareas genomicas (por ejemplo, deteccion de regiones regulatorias), sin necesidad de reentrenar el backbone completo.
- Fine-tuning downstream en genomica: el checkpoint base sirve como punto de partida para adaptar el modelo a tareas especificas mediante ajuste supervisado, aprovechando la licencia Apache-2.0.
- Base para pipelines de prediccion de efecto de variantes: aunque el VEP se realiza con checkpoints MSA (CENO-P-*), este checkpoint base forma parte de la familia y su codigo y pipeline VEP viven en el repositorio companion de CENO.
- Investigacion en arquitecturas hibridas: el modelo permite estudiar el comportamiento de una columna Mamba + atencion + MoE (8 expertos, top-2) aplicada a secuencias biologicas, comparandola con transformers densos.
- Generacion asistida en entornos GPU: con soporte de hasta 131.072 tokens por prefill en la ruta HF (y prefills mayores via vLLM), puede emplearse en experimentos que requieren contexto genomico extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.302,4 millones de parametros en bfloat16, la carga de pesos ronda los 2,6 GB (tamano del repositorio), a lo que se suma memoria de activaciones y kernels Mamba.
- GPU recomendadas: no disponible; la model card exige GPU con kernels CUDA para forward y generacion.
- Cabe en consumer GPU: no disponible como dato confirmado; el requisito de kernels CUDA y la ausencia de datos de VRAM impiden afirmarlo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta HF mono-GPU, sin padding, maximo 131.072 tokens por prefill); entrada vLLM del repositorio para prefills mayores; llama.cpp, Ollama y TGI no estan indicados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1B-base | 1,3B | no disponible (prefill HF max. 131.072 tokens) | Hibrida Mamba/Attention/MoE (Nemotron-H) | Apache-2.0 | Hugging Face, codigo embebido |
| CENO-1B-1m | no disponible | evidencia de 1M (segun model card) | Familia CENO | Apache-2.0 (segun familia) | Hugging Face |
| CENO-P-* (MSA) | no disponible | no disponible | Familia CENO (MSA) | Apache-2.0 (segun familia) | Hugging Face |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizer derivado) | no disponible |

## Limitaciones y advertencias

- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; la propia model card lo advierte.
- Las capas Mamba requieren kernels CUDA: la inferencia en CPU no es viable para forward ni generacion (solo carga de pesos, configuracion y tokenizador).
- La ruta de precision HF es mono-GPU y limitada a 131.072 tokens por prefill; prefills mayores requieren la entrada vLLM del repositorio.
- La evidencia de contexto largo de 1M pertenece a CENO-1B-1m; las comprobaciones multi-tamano cortas no implican la misma cobertura larga para todos los modelos.
- Distintas referencias Megatron CP no son intercambiables.
- CPU, FP32 explicito y atencion eager explicita no estan cubiertos por la garantia de referencia bit a bit en BF16.
- Este checkpoint es base: no incluye el pipeline VEP, que corresponde a los checkpoints MSA (CENO-P-*).
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible en la informacion proporcionada.
- Limitaciones de idioma: no disponible; el dominio es secuencia genomica, no lenguaje natural.
- Restricciones de licencia: Apache-2.0 permite uso comercial; el codigo embebido deriva de Nemotron-H (NVIDIA, Apache-2.0) y el tokenizador de Evo2 (Arc Institute, Apache-2.0), con atribucion en LICENSE y NOTICE.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1B-base
- Arbol de archivos: https://huggingface.co/CladeTeam/CENO-1B-base/tree/main
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
