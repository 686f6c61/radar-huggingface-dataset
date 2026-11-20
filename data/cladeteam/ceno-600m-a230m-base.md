# CladeTeam/CENO-600M-A230M-base

## Resumen

CENO-600M-A230M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H. Con 630,8 millones de parametros totales y 230 millones activos por token (top-2 de 8 expertos), el modelo esta disenado para generacion de secuencias genomicas y extraccion de embeddings, asi como para adaptacion posterior en tareas de genomica.

El modelo emplea un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de solo 512 entradas. Esta decision reduce drasticamente el tamano del vocabulario frente a modelos de lenguaje natural y mantiene una correspondencia directa entre token y base nucleotidica, lo que simplifica el analisis de variantes y la interpretacion de la salida. La arquitectura hibrida combina capas Mamba (state space models) con atencion y expertos, lo que permite manejar contextos largos de hasta 131.072 tokens por prefill en la ruta de Hugging Face.

La relevancia actual del modelo radica en la creciente demanda de modelos fundacionales especificos de dominio para genomica, donde los LLM de proposito general no capturan la estructura de secuencia. CENO se posiciona como una alternativa open source (Apache-2.0) a modelos como Evo2 del Arc Institute, del que hereda parte del diseno del tokenizador, y ofrece un checkpoint base autonomo cargable con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | 230M (top-2 de 8 expertos) |
| Longitud de contexto | Hasta 131.072 tokens por prefill en la ruta HF; mayor con vLLM |
| Tipos de cuantizacion | No disponible (checkpoint en bfloat16) |
| Idiomas soportados | No disponible (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers, `trust_remote_code=True`) |

Especificaciones adicionales de arquitectura:

| Propiedad | Valor |
|---|---|
| Capas ocultas | 20 |
| Tamano oculto | 1024 |
| Cabezas de atencion | 16 |
| Tamano intermedio | 4096 |
| Expertos (MoE) | 8 (top-2 por token) |
| Vocabulario | 512 (byte / a nivel de caracter) |
| Precision | bfloat16 |
| `model_type` | `ceno` |
| Clase de arquitectura | `CENOForCausalLM` |
| Tokenizador | `CENOCharLevelTokenizer` |

## Arquitectura y entrenamiento

La columna vertebral es un hibrido Mamba / Attention / Mixture-of-Experts basado en la arquitectura Nemotron-H de NVIDIA. El modelo combina capas de espacio de estados (Mamba) con capas de atencion y capas MoE con 8 expertos y enrutamiento top-2 por token, lo que resulta en 230M parametros activos sobre un total de 630,8M. Las capas Mamba requieren kernels CUDA especificos (mamba-ssm, causal-conv1d), por lo que las pasadas forward y la generacion necesitan GPU; la carga de configuracion, tokenizador y pesos es segura en CPU.

El tokenizador es a nivel de caracter y mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de 512 entradas. Segun la model card, este checkpoint corresponde a la etapa 2 de preentrenamiento base. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. El codigo del modelo esta incluido en el repositorio y deriva de la implementacion de Nemotron-H en Hugging Face (Apache-2.0); el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute (Apache-2.0).

## Capacidades

- Generacion de secuencias genomicas de ADN de forma causal.
- Extraccion de embeddings de secuencia para tareas downstream (probing, clasificacion, regresion).
- Adaptacion mediante fine-tuning para tareas de genomica.
- Puntuacion de verosimilitud de secuencias, util para prediccion de efectos de variantes (VEP) mediante delta de log-verosimilitud entre secuencia wild-type y variante (a traves de los checkpoints MSA `CENO-P-*`).
- Manejo de contextos largos de hasta 131.072 tokens por prefill en la ruta HF.
- Soporte de vLLM para prefills de mayor longitud.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- No se documentan capacidades multilingues en lenguaje natural; el dominio es secuencia genomica.

## Casos de uso

- Prediccion de efectos de variantes (VEP): puntuar secuencias wild-type frente a variantes mediante delta de log-verosimilitud, usando el pipeline VEP del repositorio CENO. Es adecuado por su naturaleza causal y su tokenizacion a nivel de base, que preserva la correspondencia posicional con el genoma.
- Extraccion de embeddings genomicos: generar representaciones de secuencia para alimentar clasificadores o modelos de regresion en tareas como prediccion de regiones regulatorias, splicing o estructura secundaria.
- Fine-tuning supervisado para tareas especificas de genomica: adaptar el checkpoint base a clasificacion de variantes patogenicas, prediccion de expresion genica o anotacion funcional.
- Generacion de secuencias sinteticas de ADN: emplear el modelo como generador causal para disenar o completar secuencias en estudios de biologia sintetica, con validacion experimental posterior.
- Modelado de lenguaje de ADN para investigacion: usar el checkpoint como base para experimentos de scaling y comparativas de arquitecturas hibridas Mamba/Attention/MoE en dominios biologicos.
- Probing de representaciones: congelar el modelo y entrenar cabezas ligeras para sondear que informacion estructural captura el modelo en distintas capas.
- Despliegue en pipelines de investigacion con vLLM: procesar lotes de secuencias largas (hasta y mas alla de 131.072 tokens por prefill) para analisis a escala de genomas completos o regiones extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 1,3 GB (tamano del repo), por lo que la inferencia en bf16 requiere del orden de 2-3 GB de VRAM considerando activaciones y cache.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de CUDA y kernels Mamba (mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1). Se ha probado con el stack NVIDIA 25.03 (PyTorch 2.7.0a0) y FlashAttention 2.7.3.
- Cabe en GPU consumer: si, dado el reducido tamano del checkpoint (630,8M parametros totales, 230M activos). No se especifican modelos concretos de consumer en la informacion disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta HF, single-GPU, sin padding, maximo 131.072 tokens por prefill); vLLM (entrada del repositorio para prefills mayores). HF y vLLM usan entornos separados.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito critico: las capas Mamba requieren kernels CUDA, por lo que la generacion y las pasadas forward necesitan GPU; solo la carga de config, tokenizador y pesos es segura en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-A230M-base | 630,8M totales / 230M activos | 131.072 tokens por prefill (HF) | Mamba/Attention/MoE (Nemotron-H) | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Apache-2.0 (tokenizador derivado) | No disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa. La unica referencia documentada es Evo2 del Arc Institute, del que CENO deriva el diseno del tokenizador a nivel de caracter.

## Limitaciones y advertencias

- La model card advierte explicitamente que la correccion numerica no garantiza una generacion libre de repeticiones ni biologicamente funcional.
- Requiere GPU con kernels CUDA para inferencia; no es posible la generacion en CPU.
- La ruta de inferencia HF es single-GPU, sin padding y limitada a 131.072 tokens por prefill; para secuencias mayores es necesario usar la entrada vLLM del repositorio.
- No se documentan sesgos conocidos, pero al ser un modelo de dominio genomico los sesgos estarian ligados a la composicion del dataset de entrenamiento, que no se detalla.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en secuencias genomicas, la generacion puede producir secuencias no funcionales o no plausibles biologicamente.
- Limitaciones de idioma: no aplica lenguaje natural; el vocabulario es de 512 tokens a nivel de byte/caracter para bases de ADN.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el codigo del modelo deriva de Nemotron-H de NVIDIA (Apache-2.0) y el tokenizador de Evo2 del Arc Institute (Apache-2.0); deben consultarse los ficheros LICENSE y NOTICE del repositorio para la atribucion completa.
- El checkpoint es una etapa base de preentrenamiento (stage 2); para tareas de VEP se requieren los checkpoints MSA `CENO-P-*`.
- No se dispone de informacion sobre cuantizaciones soportadas ni sobre rendimiento medido en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-A230M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
