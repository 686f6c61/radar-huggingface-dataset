# CladeTeam/CENO-80M-A30M-base

## Resumen

CENO-80M-A30M-base es el checkpoint base de preentrenamiento del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts (arquitectura Nemotron-H), sin entradas de alineamiento multiple de secuencias (MSA). Con 79,3 millones de parametros totales y 30 millones activos por token (top-2 sobre 8 expertos), esta pensado como base para generacion de secuencia genomica y extraccion de representaciones (embeddings) que sirvan a tareas de genomica posteriores.

Su relevancia actual radica en que aplica un diseno eficiente (Mamba para modelado de secuencia larga, atencion para dependencias locales y MoE para capacidad efectiva con coste de computo reducido) al dominio del ADN, con un tokenizador a nivel de caracter que mapea las bases a sus codigos ASCII. El modelo se distribuye con su propio codigo (`trust_remote_code=True`), lo que facilita su carga directa desde Hugging Face, y esta publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La ventana de contexto maxima documentada para la ruta de precision de Hugging Face es de 131.072 tokens por prefill en una sola GPU sin padding; para prefills mayores el autor remite a su entrada de vLLM. El checkpoint es un modelo base (stage 2 de preentrenamiento), no un modelo instruido ni afinado para prediccion de efectos de variante, que queda en la variante CENO-P-* de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | ~30M (8 expertos, top-2 por token) |
| Longitud de contexto | 131.072 tokens por prefill en la ruta HF (single-GPU, sin padding); mayor con vLLM |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con codigo de modelo y tokenizador incluidos en el repo) |

Especificaciones adicionales de arquitectura:

| Propiedad | Valor |
|---|---|
| Capas ocultas | 9 |
| Tamano oculto | 512 |
| Cabezas de atencion | 8 |
| Tamano intermedio | 2048 |
| Expertos (MoE) | 8 (top-2 por token) |
| Vocabulario | 512 (byte / caracter) |
| Precision | bfloat16 |
| `model_type` | `ceno` |
| Tokenizador | `ceno_tokenizer.CENOCharLevelTokenizer` |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida Nemotron-H que combina capas Mamba (modelado de estado espacial, eficiente en secuencia larga), capas de atencion y capas de mezcla de expertos. El modelo tiene 9 capas ocultas con tamano oculto 512, 8 cabezas de atencion y tamano intermedio 2048. La capa MoE cuenta con 8 expertos con enrutamiento top-2 por token, lo que da lugar a los aproximadamente 30M de parametros activos sobre los 79,3M totales. El tokenizador es a nivel de caracter: mapea cada base de ADN a su codigo ASCII de byte, con un vocabulario de 512 entradas.

El checkpoint corresponde a la etapa 2 de preentrenamiento base. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esa informacion no esta disponible. El codigo del modelo deriva de la implementacion de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0) y el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute (Apache-2.0). Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generacion necesitan GPU; la carga de configuracion, tokenizador y pesos es segura en CPU.

## Capacidades

- Generacion de secuencia genomica de forma autorregresiva (modelado causal sobre ADN).
- Extraccion de embeddings de secuencia genomica para tareas posteriores (probing, clasificacion, retrieval).
- Adaptacion mediante fine-tuning a tareas de genomica especificas.
- Modelado de dependencias de largo alcance gracias a las capas Mamba y a una ventana de prefill de hasta 131.072 tokens en la ruta HF.
- Capacidad efectiva ampliada por el enrutamiento MoE (8 expertos, top-2) con coste de computo contenido.
- No es un modelo instruido: no se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues, de vision ni de audio; el dominio es exclusivamente genomico.

## Casos de uso

- Generacion de secuencias genomicas sinteticas: el modelo puede muestrear secuencias de ADN condicionadas a un prefijo, util para aumentar datasets de entrenamiento o explorar regiones plausibles bajo el modelo aprendido.
- Extraccion de embeddings para clasificacion downstream: se usan las representaciones internas del modelo como features para tareas como prediccion de elementos regulatorios, sitios de union o regiones funcionales, con un cabezal ligero entrenado encima.
- Fine-tuning supervisado en tareas de genomica: partiendo de este checkpoint base, se puede afinar para tareas especificas (anotacion de variantes, prediccion de estructura secundaria de ARN, deteccion de motivos) con menos datos que entrenando desde cero.
- Modelado de secuencias largas: con hasta 131.072 tokens por prefill en la ruta HF (y mas con vLLM), es adecuado para contextos genomicos extensos donde un transformer clasico resultaria costoso en memoria.
- Investigacion en modelos fundacionales de ADN: sirve como punto de partida reproducible (Apache-2.0, codigo incluido) para estudiar arquitecturas hibridas Mamba/Attention/MoE en el dominio biologico.
- Preentrenamiento continuado sobre genomas especificos: al ser un checkpoint base, permite continuar el preentrenamiento con datos de una especie o poblacion concreta antes de adaptar a la tarea final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 79,3M de parametros en bfloat16, los pesos ocupan aproximadamente 0,16 GB; sumando estados de activacion y cache de secuencia, el consumo es bajo (del orden de pocos GB), aunque no se documentan cifras exactas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de kernels CUDA para Mamba (la model card cita un stack probado con PyTorch 2.7.0a0 NVIDIA 25.03, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3). No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, dado el reducido tamano del modelo, siempre que la GPU soporte los kernels CUDA de Mamba; no se detallan modelos concretos.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (ruta de precision, single-GPU, sin padding, maximo 131.072 tokens por prefill) y una entrada de vLLM mantenida en el repositorio de codigo para prefills mayores. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, la familia CENO incluye variantes CENO-P-* orientadas a prediccion de efectos de variante (VEP), que no son directamente comparables con este checkpoint base.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CENO-80M-A30M-base | 79,3M (30M activos) | 131.072 (HF) | Apache-2.0 | ADN, hibrido Mamba/Attention/MoE |
| CENO-P-* (familia) | no disponible | no disponible | no disponible | ADN, VEP |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint base de preentrenamiento: no esta instruido ni alineado, por lo que no debe esperarse un comportamiento conversacional ni de seguimiento de instrucciones.
- La model card advierte explicitamente que la correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas pueden no ser plausibles ni validas biologicamente.
- Las capas Mamba requieren kernels CUDA: la inferencia y la generacion necesitan GPU, lo que limita el despliegue en entornos solo CPU.
- La ruta de precision de Hugging Face esta limitada a una sola GPU, sin padding y a un maximo de 131.072 tokens por prefill; para contextos mayores hay que usar la entrada de vLLM.
- No se documentan sesgos conocidos, riesgos de alucinacion en el sentido de lenguaje natural, ni limitaciones de idioma, al no ser un modelo de lenguaje natural. No hay informacion sobre composicion del dataset de entrenamiento, lo que impide evaluar sesgos de representacion genomica.
- Licencia Apache-2.0: permite uso comercial, pero el codigo incluido deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute), ambos Apache-2.0; deben conservarse los ficheros `LICENSE` y `NOTICE` con la atribucion correspondiente.
- El modelo no sustituye la validacion experimental: cualquier uso en investigacion biomedica debe acompanarse de validacion in silico e in vitro.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-A30M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Implementacion de Nemotron-H en Hugging Face (NVIDIA, Apache-2.0): no disponible enlace directo en la informacion proporcionada
- Tokenizador Evo2 `CharLevelTokenizer` (Arc Institute, Apache-2.0): no disponible enlace directo en la informacion proporcionada
