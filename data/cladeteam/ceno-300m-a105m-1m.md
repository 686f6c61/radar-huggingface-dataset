# CladeTeam/CENO-300M-A105M-1m

## Resumen

CENO-300M-A105M-1m es el checkpoint de contexto largo (1M) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H. Con 307,5 millones de parametros totales y 105 millones activos por token (top-2 sobre 8 expertos), el modelo esta disenado para generacion de secuencias genomicas y extraccion de embeddings, asi como para adaptacion posterior en tareas de genomica.

La relevancia de este checkpoint reside en su ventana de entrenamiento de 1.048.576 tokens sobre una tokenizacion a nivel de caracter (vocabulario de 512 entradas que mapea bases de ADN a sus codigos ASCII). Al no depender de entradas de alineamiento multiple de secuencias (MSA), el modelo se posiciona como una alternativa practica a los modelos genomicos que requieren preprocesamiento costoso. La arquitectura Mamba no impone una ventana de contexto fija, por lo que `max_position_embeddings` es nominal y no restrictivo.

El modelo se distribuye bajo licencia Apache-2.0, con codigo empaquetado en el repositorio y cargable mediante `trust_remote_code=True`. Forma parte de la familia CENO, que incluye checkpoints base (generacion y embeddings) y checkpoints con MSA (prediccion de efectos de variantes, VEP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 (307,5M) |
| Parametros activos | 105M (top-2 sobre 8 expertos) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija por diseno Mamba |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo emplea una columna vertebral hibrida que combina capas Mamba (modelo de espacio de estados), capas de atencion y capas de mezcla de expertos, siguiendo el diseno Nemotron-H de NVIDIA. Cuenta con 9 capas ocultas, dimension oculta de 1024, 8 cabezas de atencion y tamano intermedio de 4096. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token, lo que resulta en aproximadamente 105M de parametros activos sobre los 307,5M totales. El tokenizador es a nivel de caracter (`CENOCharLevelTokenizer`), con vocabulario de 512 entradas que mapea cada base de ADN a su codigo de byte ASCII; deriva del `CharLevelTokenizer` de Evo2 (Arc Institute).

Este checkpoint corresponde a la etapa 4 del entrenamiento (extension de contexto largo), entrenado a una longitud de secuencia de 1.048.576 tokens. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El codigo del modelo esta incluido en el repositorio y deriva de la implementacion de Nemotron-H en Hugging Face. Las capas Mamba requieren kernels CUDA, por lo que la inferencia necesita GPU; la carga de configuracion, tokenizador y pesos es segura en CPU.

## Capacidades

- Generacion de secuencias genomicas de forma autorregresiva sobre un alfabeto de bases de ADN.
- Extraccion de embeddings de secuencia genomica para tareas posteriores (probing, clasificacion, similitud).
- Adaptacion por fine-tuning para tareas de genomica downstream.
- Procesamiento de contexto muy largo (hasta 1.048.576 tokens en entrenamiento; sin limite fijo por arquitectura Mamba), adecuado para regiones genomicas extensas.
- Tokenizacion a nivel de caracter que evita perdida de informacion por tokenizacion subpalabra.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito segun la informacion disponible.
- Capacidades multilingues de lenguaje natural: no aplicables; el modelo opera sobre secuencia genomica.

## Casos de uso

- Generacion de secuencias de ADN sinteticas: el modelo puede muestrear secuencias base a base condicionadas a un prefijo, util para aumento de datos genomicos y exploracion de regiones plausibles en investigacion.
- Extraccion de embeddings para modelos downstream: se pueden obtener representaciones de regiones genomicas y entrenar clasificadores ligeros (por ejemplo, prediccion de elementos regulatorios) sin reentrenar el modelo completo.
- Analisis de regiones genomicas extensas: gracias a su contexto de entrenamiento de 1M tokens, permite procesar contigs o locus largos en una sola pasada sin fragmentacion manual.
- Fine-tuning para tareas especificas de genomica: adaptacion supervisada sobre el checkpoint base para tareas como anotacion funcional o prediccion de estructura secundaria, aprovechando el bajo coste de los 105M parametros activos.
- Investigacion en modelos de lenguaje de ADN: base para experimentos de arquitectura hibrida Mamba/MoE aplicada a secuencias biologicas, con codigo y pesos abiertos bajo Apache-2.0.
- Preentrenamiento continuado sobre genomas de interes: el checkpoint de contexto largo sirve como punto de partida para especializar el modelo en especies o poblaciones concretas mediante entrenamiento adicional.
- Evaluacion de efectos de variantes (con la familia CENO-P): aunque este checkpoint es base, la familia dispone de checkpoints con MSA para VEP por delta de log-verosimilitud; este checkpoint puede servir como referencia o para experimentos comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia requiere GPU con soporte de kernels CUDA para las capas Mamba; la carga de pesos y el tokenizador funcionan en CPU.
- VRAM estimada: el checkpoint en bfloat16 ocupa aproximadamente 0,6 GB de pesos (307,5M parametros x 2 bytes); con estados de activacion y cache de secuencia, el consumo crece con la longitud de contexto, especialmente en prefill largo.
- La ruta de precision de Hugging Face es mono-GPU, sin padding, y admite como maximo 131.072 tokens por prefill; para prefills mayores se debe usar la entrada vLLM del repositorio.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cabe en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) para contextos moderados, y en A100/H100 para contextos largos y mayor throughput.
- Opciones de despliegue: transformers con `trust_remote_code=True`, vLLM (entrada propia del repositorio) y pila probada con PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-300M-A105M-1m | 307,5M (105M activos) | 1.048.576 (entrenamiento) | Mamba/Attention/MoE | Apache-2.0 | Hugging Face, codigo en GitHub |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | no disponible en la informacion |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Mamba/Attention/MoE | Apache-2.0 (codigo base) | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo opera sobre secuencia genomica, no sobre lenguaje natural; no debe emplearse para tareas de texto convencionales.
- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional, segun advierte el propio autor.
- La inferencia requiere GPU con kernels CUDA; no es viable en CPU para forward passes.
- La ruta de Hugging Face limita el prefill a 131.072 tokens; contextos mayores requieren vLLM.
- No se documentan sesgos, riesgos de alucinacion biologica ni limitaciones de idioma mas alla de las advertencias del autor.
- Licencia Apache-2.0: permite uso comercial, pero el codigo incluido deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute); deben conservarse los avisos de atribucion (`LICENSE` y `NOTICE`).
- El checkpoint es base (no MSA); para prediccion de efectos de variantes debe usarse la variante CENO-P correspondiente.
- No se especifican datos de entrenamiento, composicion del dataset ni regimen de alineacion, lo que limita la evaluacion de sesgos y robustez.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-A105M-1m
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Nemotron-H (NVIDIA, implementacion base): no disponible en la informacion proporcionada
- Evo2 (Arc Institute, tokenizador base): no disponible en la informacion proporcionada
