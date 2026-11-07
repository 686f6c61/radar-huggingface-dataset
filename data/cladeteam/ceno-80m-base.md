# CladeTeam/CENO-80M-base

## Resumen

CENO-80M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts inspirada en Nemotron-H, sin entradas de alineamiento multiple de secuencias (MSA). Con 79,3 millones de parametros y una ventana de contexto de 4.096 tokens, esta pensado para generacion de secuencias genomicas y extraccion de embeddings, no para conversacion en lenguaje natural.

El modelo emplea un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de solo 512 entradas. La arquitectura combina 9 capas ocultas de tamano 512, 8 cabezas de atencion, un tamano intermedio de 2048 y 8 expertos MoE con enrutamiento top-2 por token. Se distribuye bajo licencia Apache-2.0 y esta disponible en Hugging Face con codigo empaquetado para carga mediante `trust_remote_code=True`.

Su relevancia radica en ser una pieza de una familia mas amplia (CENO base y CENO-P con MSA para prediccion de efectos de variantes) y en ofrecer un modelo genomico pequeno, abierto y cargable de forma autonoma, adecuado para ajuste fino y sondeo en tareas de genomica computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | 8 expertos MoE, top-2 por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 4.096 tokens (segun fuente externa); prefill HF limitado a 131.072 tokens por pasada |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `model_type`: ceno) |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida que combina capas Mamba (modelo de espacio de estados), atencion y mezcla de expertos, siguiendo el diseno Nemotron-H de NVIDIA. El modelo tiene 9 capas ocultas, tamano oculto 512, 8 cabezas de atencion y tamano intermedio 2048, con 8 expertos MoE y enrutamiento top-2 por token. La clase de modelo es `CENOForCausalLM` y el tokenizador es `CENOCharLevelTokenizer`, un tokenizador a nivel de caracter con vocabulario de 512 que mapea bases de ADN a codigos ASCII de byte. Este checkpoint corresponde a la etapa 2 de preentrenamiento base.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. El codigo del modelo esta empaquetado en el repositorio y se deriva de la implementacion de Nemotron-H en Hugging Face (Apache-2.0); el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute (Apache-2.0). Las capas Mamba requieren kernels CUDA, por lo que las pasadas hacia delante y la generacion necesitan GPU; la configuracion, el tokenizador y la carga de pesos son seguros en CPU. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Capacidades

- Generacion de secuencias genomicas de ADN (modelo de lenguaje causal sobre bases).
- Extraccion de embeddings de secuencia genomica.
- Adaptacion posterior mediante ajuste fino y sondeo para tareas de genomica.
- Uso como base para prediccion de efectos de variantes (VEP) mediante comparacion de log-verosimilitud entre secuencia wild-type y variante (funcionalidad asociada a la familia CENO-P con MSA).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (modelo de secuencia genomica).
- Capacidades especiales: arquitectura hibrida Mamba/Attention/MoE; ventana de prefill de hasta 131.072 tokens en la ruta HF de precision BF16.

## Casos de uso

- Extraccion de embeddings genomicos: usar el modelo como extractor de representaciones de secuencias de ADN para alimentar clasificadores o modelos downstream en tareas como prediccion de regiones regulatorias o elementos funcionales.
- Ajuste fino para tareas de genomica supervisadas: adaptar el checkpoint base a tareas especificas (clasificacion de variantes, prediccion de sitios de union) aprovechando su tamano reducido de 79,3M de parametros.
- Prediccion de efectos de variantes (VEP): puntuar secuencias wild-type frente a variantes mediante delta de log-verosimilitud, siguiendo el ejemplo de TraitGym en el repositorio CENO.
- Generacion de secuencias sinteticas de ADN: generar secuencias candidatas para diseno experimental o aumento de datos, con la advertencia de que la correccion numerica no garantiza funcionalidad biologica.
- Investigacion en modelos fundacionales de genomica: estudiar el comportamiento de arquitecturas hibridas Mamba/Attention/MoE en dominios biologicos con un modelo pequeno y abierto.
- Prototipado en genomica computacional: emplear un modelo ligero para validar pipelines de inferencia antes de escalar a checkpoints mayores de la familia CENO (por ejemplo, CENO-1B-1m).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 79,3M de parametros en bfloat16, lo que supone aproximadamente 0,16 GB para los pesos; el consumo real de memoria es mayor por los estados de Mamba, el enrutamiento MoE y las activaciones, aunque no se dispone de cifras exactas.
- GPU recomendadas: no disponible. Las capas Mamba requieren kernels CUDA, por lo que se necesita una GPU compatible con mamba-ssm y causal-conv1d.
- Cabe en consumer GPU: si, dado el tamano reducido de los pesos; se requiere GPU con soporte de los kernels CUDA de Mamba (cifras concretas no disponibles).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (ruta BF16 single-GPU, sin padding, hasta 131.072 tokens por prefill); el repositorio CENO incluye una entrada para vLLM destinada a prefills mayores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-base | 79,3M | 4.096 tokens | Mamba/Attention/MoE hibrida | Apache-2.0 | Hugging Face |
| CENO-1B-1m | no disponible (familia CENO) | 1M (referencia larga) | Familia CENO | Apache-2.0 (segun familia) | Hugging Face / repo CENO |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de secuencia genomica, no de lenguaje natural: no debe esperarse comportamiento conversacional ni capacidades multilingues.
- Las capas Mamba requieren kernels CUDA; las pasadas hacia delante y la generacion necesitan GPU. La configuracion, el tokenizador y la carga de pesos funcionan en CPU.
- La ruta HF de precision BF16 es single-GPU, sin padding, y admite como maximo 131.072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional.
- La evidencia de contexto largo (1M) corresponde a CENO-1B-1m; las comprobaciones cortas multi-tamano no implican la misma cobertura larga para todos los modelos.
- Las referencias de Megatron CP no son intercambiables entre si.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero el codigo empaquetado deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute); deben consultarse los ficheros LICENSE y NOTICE del repositorio para la atribucion completa.
- Checkpoint base sin ajuste de instrucciones: requiere adaptacion downstream para tareas concretas.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Ficha en Free2AITools: https://free2aitools.com/model/cladeteam/ceno-80m-base
