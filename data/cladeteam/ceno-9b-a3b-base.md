# CladeTeam/CENO-9B-A3B-base

## Resumen

CENO-9B-A3B-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Nemotron-H que combina capas Mamba, atencion y mezcla de expertos (MoE). Con 8.928.624.080 parametros totales y precision bfloat16, el modelo esta disenado especificamente para generacion de secuencias genomicas y extraccion de representaciones (embeddings) para tareas posteriores de genomica.

El modelo emplea un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de solo 512 entradas. La arquitectura consta de 42 capas ocultas con un tamano oculto de 2560, 20 cabezas de atencion, un tamano intermedio de 10240 y 8 expertos MoE con top-2 por token. No utiliza entradas de alineamiento multiple de secuencias (MSA).

Su relevancia radica en que es una de las pocas propuestas abiertas que combina arquitecturas hibridas Mamba/atencion/MoE con modelado de ADN a nivel de caracter, lo que permite procesar secuencias genomicas sin tokenizacion basada en k-meros y potencialmente capturar dependencias de largo alcance. La licencia Apache-2.0 facilita su adopcion tanto en investigacion como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 8.928.624.080 (8,9B) |
| Parametros activos | 2 de 8 expertos por token (top-2); numero exacto de parametros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no aplica (modelo de secuencia genomica; tokenizador de ADN a nivel de caracter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida Nemotron-H que intercala capas Mamba (modelos de espacio de estados), capas de atencion y capas de mezcla de expertos. El modelo tiene 42 capas ocultas, tamano oculto de 2560, 20 cabezas de atencion y un tamano intermedio de 10240. La capa MoE cuenta con 8 expertos y activa los 2 principales por token. El vocabulario es de 512 entradas mediante un tokenizador a nivel de caracter que convierte las bases de ADN en sus codigos ASCII de byte, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute).

El checkpoint corresponde a la etapa 2 de preentrenamiento base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las capas Mamba requieren kernels CUDA, por lo que la inferencia y la generacion necesitan GPU; la carga de pesos, la configuracion y el tokenizador son seguros en CPU. El codigo del modelo esta incluido en el repositorio y deriva de la implementacion de Nemotron-H de NVIDIA en Hugging Face. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Capacidades

- Generacion de secuencias genomicas de ADN a nivel de caracter.
- Extraccion de embeddings de secuencias genomicas para tareas posteriores (probing, clasificacion, regresion).
- Modelado de lenguaje causal sobre secuencias de ADN sin entradas MSA.
- Adaptacion mediante fine-tuning para tareas de genomica.
- Punto de partida para la variante CENO-P-* orientada a prediccion de efectos de variantes (VEP) mediante delta de log-verosimilitud entre secuencia wild-type y variante.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Generacion de secuencias genomicas sinteticas: el modelo puede generar secuencias de ADN caracter a caracter, util para aumentar datasets de entrenamiento o explorar regiones del espacio de secuencias.
- Extraccion de embeddings para clasificacion de elementos regulatorios: las representaciones internas del modelo pueden alimentar clasificadores ligeros para identificar promotores, enhancers u otras regiones funcionales.
- Fine-tuning para prediccion de efectos de variantes: partiendo de este checkpoint base, se puede adaptar el modelo para puntuar secuencias wild-type frente a variantes, siguiendo el enfoque de la familia CENO-P.
- Modelado de dependencias de largo alcance en ADN: la combinacion de capas Mamba y atencion permite procesar contextos extensos de secuencia, adecuado para estudiar interacciones entre regiones distantes.
- Investigacion en modelos fundacionales de genomica: sirve como linea base para comparar arquitecturas hibridas frente a transformers puros en tareas de ADN.
- Anotacion funcional asistida: mediante probing sobre embeddings, se pueden inferir propiedades de fragmentos genomicos sin necesidad de alineamiento multiple.
- Exploracion de diseno de secuencias: generacion condicionada o no condicionada para proponer candidatos en experimentos de biologia sintetica, siempre con validacion experimental posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,9B parametros x 2 bytes), mas overhead de activaciones y kernels, por lo que se recomienda al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs consumer con 24 GB o mas (RTX 3090, RTX 4090).
- Cabe en GPU consumer: si, en RTX 3090/4090 con 24 GB en bfloat16, aunque con margen ajustado; cuantizaciones no documentadas.
- Las capas Mamba requieren kernels CUDA (mamba-ssm, causal-conv1d), por lo que la inferencia en CPU no es viable para forward/generation.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM en entorno separado segun la model card. No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-9B-A3B-base | 8,9B | no disponible | Mamba/Attention/MoE hibrida | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face (tokenizador derivado) |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Mamba/Attention/MoE hibrida | Apache-2.0 (codigo base) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no esta disenado para seguir instrucciones en lenguaje natural ni para conversacion.
- La generacion de secuencias no garantiza correccion numerica ni funcionalidad biologica; la propia model card advierte que la correccion numerica no implica generacion libre de repeticiones o biologicamente funcional.
- Requiere GPU con kernels CUDA para inferencia; no es desplegable en CPU para forward/generation.
- No se documentan sesgos conocidos, pero al entrenarse sobre datos genomicos puede reflejar sesgos de composicion de los genomas de entrenamiento (no confirmado en la informacion).
- Riesgo de alucinacion en el sentido de generar secuencias plausibles pero no funcionales o no presentes en genomas reales.
- Longitud de contexto no documentada, lo que limita la planificacion de cargas de trabajo con secuencias largas.
- Idiomas: no aplica; el tokenizador es de caracter para ADN, no para texto natural.
- Licencia Apache-2.0 permite uso comercial, pero el codigo derivado de Nemotron-H y del tokenizador de Evo2 requiere mantener las atribuciones indicadas en LICENSE y NOTICE.
- Entornos separados para HF y vLLM segun la model card; la integracion en produccion requiere gestionar dos stacks.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-9B-A3B-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Implementacion de referencia Nemotron-H (NVIDIA, Hugging Face): no disponible como enlace directo en la informacion
- Tokenizador Evo2 (Arc Institute): no disponible como enlace directo en la informacion
