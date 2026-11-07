# CladeTeam/CENO-300M-base

## Resumen

CENO-300M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal que opera directamente sobre secuencia genomica en lugar de texto natural, construido sobre una columna vertebral hibrida Nemotron-H que combina capas Mamba, atencion y mezcla de expertos (MoE). Con 307.503.488 parametros en precision bfloat16, esta pensado como punto de partida para generacion de secuencia genomica, extraccion de embeddings y adaptacion posterior mediante fine-tuning o probing en tareas de genomica.

El modelo emplea un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de solo 512 entradas, y no requiere alineamientos multiples de secuencia (MSA) como entrada. Forma parte de una familia mayor que incluye checkpoints con capacidad de prediccion de efectos de variante (VEP) mediante comparacion de log-verosimilitud entre secuencia wild-type y variante.

Su relevancia actual radica en la escasez de modelos fundacionales genomicos abiertos con licencia permisiva y arquitecturas eficientes en contexto largo. La combinacion de Mamba (estado-espacio) con atencion y MoE busca reducir el coste computacional frente a transformers densos puros al procesar secuencias de ADN, que tipicamente son muy largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 307.503.488 |
| Parametros activos | no disponible (8 expertos, top-2 por token; numero de parametros activos no publicado) |
| Longitud de contexto | no disponible de forma explicita; la ruta HF permite hasta 131072 tokens por prefill |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no aplica (secuencia genomica; tokenizador byte/caracter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas ocultas | 9 |
| Tamano oculto | 1024 |
| Cabezas de atencion | 8 |
| Tamano intermedio | 4096 |
| Expertos (MoE) | 8, top-2 por token |
| Vocabulario | 512 (byte / caracter) |
| Precision | bfloat16 |
| Tipo de modelo | `ceno` |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida Nemotron-H que intercala capas Mamba (modelo de espacio de estados) con capas de atencion y capas de mezcla de expertos. El modelo tiene 9 capas ocultas con un tamano oculto de 1024, 8 cabezas de atencion y un tamano intermedio de 4096, con 8 expertos y enrutamiento top-2 por token. El tokenizador es a nivel de caracter, derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea las bases de ADN a sus codigos ASCII de byte con un vocabulario de 512 entradas. No se emplean entradas de alineamiento multiple de secuencia (MSA).

Este checkpoint corresponde a la etapa 2 de preentrenamiento base. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles. Como innovacion tecnica destacable, la combinacion de Mamba con atencion y MoE busca eficiencia en secuencias largas, y las capas Mamba requieren kernels CUDA especificos (mamba-ssm, causal-conv1d), por lo que las pasadas forward y la generacion necesitan GPU. La ruta de precision HF es de una sola GPU, sin padding, y admite como maximo 131072 tokens por prefill; para prefills mayores se indica el uso de la entrada vLLM del repositorio.

## Capacidades

- Generacion de secuencia genomica: modelado de lenguaje causal sobre ADN con tokenizacion byte/caracter.
- Extraccion de embeddings de secuencia genomica para tareas posteriores (probing, clasificacion, similitud).
- Adaptacion posterior mediante fine-tuning para tareas especificas de genomica.
- Base para prediccion de efectos de variante (VEP) en la variante con MSA de la familia, puntuando secuencia wild-type frente a variante por delta de log-verosimilitud.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (dominio genomico).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Extraccion de embeddings genomicos: usar el modelo como extractor de representaciones de secuencias de ADN para alimentar clasificadores ligeros en tareas como prediccion de regiones regulatorias o elementos funcionales, aprovechando que el checkpoint esta pensado explicitamente para embedding extraction.
- Fine-tuning para tareas genomicas downstream: adaptar el checkpoint base a tareas supervisadas concretas (por ejemplo, clasificacion de variantes o prediccion de expresion) partiendo de un modelo preentrenado sobre secuencia genomica.
- Modelado y generacion de secuencia de ADN: emplear la generacion causal para explorar distribuciones de secuencia, generar candidatos o estudiar el comportamiento del modelo sobre motivos genomicos, con la advertencia de que la correccion numerica no garantiza una generacion biologicamente funcional.
- Investigacion en modelos fundacionales genomicos: servir de base reproducible para estudiar arquitecturas hibridas Mamba/Attention/MoE aplicadas a ADN, dado que el codigo esta incluido en el repositorio y es cargable con `trust_remote_code=True`.
- Punto de partida para pipelines de VEP: aunque la prediccion de efectos de variante se asocia a los checkpoints con MSA (`CENO-P-*`), el checkpoint base permite construir y comparar flujos de puntuacion por log-verosimilitud siguiendo el ejemplo TraitGym del repositorio de codigo.
- Experimentacion con contexto largo en genomica: procesar secuencias de hasta 131072 tokens por prefill en la ruta HF (o mayores mediante vLLM) para estudiar dependencias de largo alcance en el genoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307,5M parametros en bfloat16, los pesos ocupan aproximadamente 0,6 GB; el consumo real es mayor por estados de activacion y kernels, pero no se publica una cifra oficial.
- GPU recomendadas: se requiere GPU con CUDA para las capas Mamba (forward y generacion). No se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la necesidad de kernels CUDA y el limite de 131072 tokens por prefill en la ruta HF condicionan el despliegue.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el repositorio incluye una entrada para vLLM orientada a prefills mayores. No se mencionan llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3, con entornos separados para HF y vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-300M-base | 307,5M | hasta 131072 tokens por prefill (ruta HF) | Hibrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face, codigo en GitHub |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | no disponible | referenciado como origen del tokenizador |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Mamba/Attention/MoE | Apache-2.0 (implementacion HF) | referenciado como base del codigo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere GPU con CUDA para forward y generacion debido a los kernels de Mamba; la carga de configuracion, tokenizador y pesos si es segura en CPU.
- La ruta de precision HF es de una sola GPU, sin padding, y admite como maximo 131072 tokens por prefill; para secuencias mayores hay que usar la entrada vLLM del repositorio.
- La correccion numerica del modelo no garantiza una generacion libre de repeticiones ni biologicamente funcional.
- Las referencias de contexto largo de 1M pertenecen a CENO-1B-1m; las comprobaciones cortas multi-tamano no implican la misma cobertura larga para todos los modelos.
- Las referencias de Megatron CP no son intercambiables entre si.
- No se detallan sesgos conocidos, riesgo de alucinacion en sentido genomico ni limitaciones de idioma; no disponibles.
- Licencia Apache-2.0, permisiva para uso comercial, con atribucion a NVIDIA (Nemotron-H) y al Arc Institute (Evo2) segun los ficheros LICENSE y NOTICE del repositorio.
- El checkpoint es base (etapa 2) y no esta ajustado para tareas concretas; requiere adaptacion para uso en produccion.
- No se especifican datos de entrenamiento (tokens, composicion del dataset, RLHF/DPO), lo que limita la evaluacion de su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-base
- Arbol de ficheros en Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-base/tree/main
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
