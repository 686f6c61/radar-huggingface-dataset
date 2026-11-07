# CladeTeam/CENO-80M-1m

## Resumen

CENO-80M-1m es el checkpoint de contexto largo (1.048.576 tokens de entrenamiento) del modelo fundacional de ADN de 80M de parámetros de la familia CENO, desarrollada por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genómica construido sobre una columna vertebral híbrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H, y que no requiere alineamientos múltiples (MSA) como entrada. Con 79.290.560 parámetros reales en safetensors y precisión bfloat16, es el miembro más pequeño de una familia que abarca cuatro tamanos (80M, 300M, 600M y 1B) y tres etapas de contexto de entrenamiento (base, 131k y 1m).

El modelo resuelve dos problemas concretos en genomica computacional: la generacion de secuencias de ADN y la extraccion de embeddings para tareas posteriores (fine-tuning y probing). Su tokenizador es a nivel de caracter, mapeando cada base de ADN a su codigo de byte ASCII, con un vocabulario de solo 512 entradas. La relevancia actual reside en que combina un contexto de entrenamiento de un millon de tokens con una arquitectura sin ventana de contexto fija, lo que permite modelar dependencias de largo alcance en regiones genomicas extensas sin las limitaciones de las ventanas deslizantes clasicas.

Este checkpoint corresponde a la etapa 4 de entrenamiento (extension de contexto largo) y es cargable de forma autonoma con `trust_remote_code=True`, ya que el codigo del modelo va incluido en el repositorio. La licencia es Apache-2.0, lo que facilita su uso comercial y su adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 79.290.560 |
| Parametros activos | 8 expertos con top-2 por token (parametros activos exactos no disponibles) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija por diseno de la columna Mamba |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo sobre secuencia genomica, tokenizador a nivel de caracter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida que combina capas Mamba (modelo de espacio de estados), capas de atencion y capas de mezcla de expertos, siguiendo el diseno Nemotron-H de NVIDIA. El modelo tiene 9 capas ocultas, un tamano oculto de 512, 8 cabezas de atencion y un tamano intermedio de 2048. La capa MoE cuenta con 8 expertos y activa los 2 mejores por token. El tokenizador es a nivel de caracter (`CENOCharLevelTokenizer`), derivado del `CharLevelTokenizer` de Evo2 del Arc Institute, y mapea las bases de ADN a sus codigos de byte ASCII con un vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa 4 del entrenamiento, dedicada a la extension de contexto largo hasta 1.048.576 tokens. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Como innovacion tecnica destacable, la columna Mamba / Attention / MoE no impone una ventana de contexto fija: el valor de `max_position_embeddings` en `config.json` es nominal y no restrictivo, de modo que la longitud de contexto de entrenamiento es la secuencia a la que se entreno el checkpoint, no un limite duro. La implementacion de inferencia en BF16 sobre CUDA utiliza kernels de Mamba y admite como maximo 131.072 tokens por prefill en la ruta de Hugging Face, mientras que el repositorio ofrece una entrada vLLM para prefills mayores.

## Capacidades

- Generacion de secuencias genomicas de ADN de forma autorregresiva.
- Extraccion de embeddings de secuencia para tareas posteriores (probing y fine-tuning).
- Modelado de dependencias de largo alcance gracias al contexto de entrenamiento de 1.048.576 tokens.
- Puntuacion de secuencias mediante log-verosimilitud (util para comparaciones tipo wild-type frente a variante en la familia CENO-P).
- Procesamiento a nivel de caracter de secuencias de ADN mediante tokenizador de bytes ASCII.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es un modelo fundacional de dominio genomico.
- Capacidades multilingues: no aplicables (no procesa lenguaje natural).

## Casos de uso

- Generacion de secuencias de ADN sinteticas: el modelo puede muestrear secuencias genomicas base a base, util para aumentar datasets de entrenamiento o explorar regiones plausibles en genomica comparativa.
- Extraccion de embeddings para clasificacion de regiones genomicas: las representaciones internas del modelo sirven como features para modelos posteriores que detecten promotores, enhancers u otras anotaciones funcionales.
- Prediccion de efectos de variantes (VEP): puntuando la log-verosimilitud de la secuencia wild-type frente a la variante se obtiene un delta que prioriza variantes candidatas; el flujo completo se documenta en el repositorio de CENO con el ejemplo TraitGym.
- Modelado de contexto largo en regiones genomicas extensas: con 1.048.576 tokens de entrenamiento y sin ventana fija, es adecuado para analizar locus completos o regiones regulatorias distales que exceden las ventanas de modelos de contexto corto.
- Fine-tuning para tareas genomicas especificas: al ser un checkpoint base pequeno (79M), se puede adaptar con recursos modestos a tareas como prediccion de sitios de union de proteinas o senales de splicing.
- Investigacion en modelos de lenguaje de ADN: su tamano reducido y su arquitectura hibrida lo convierten en un banco de pruebas accesible para estudiar el efecto de Mamba, atencion y MoE en secuencias biologicas.
- Puntuacion y filtrado de secuencias candidatas en pipelines de diseno genomico: la log-verosimilitud por secuencia permite ordenar candidatos generados por otros metodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en BF16: los pesos en bfloat16 ocupan aproximadamente 0,16 GB (79,3M parametros), por lo que la VRAM necesaria para los pesos es minima; el consumo real depende de la longitud de secuencia y de las activaciones de las capas Mamba y de atencion.
- La ruta de Hugging Face es de una sola GPU, sin padding, y admite como maximo 131.072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- Las capas Mamba requieren kernels CUDA, por lo que los forward passes y la generacion necesitan GPU; la carga de configuracion, tokenizador y pesos es segura en CPU.
- Cualquier GPU CUDA moderna con suficiente VRAM para la longitud de secuencia objetivo deberia ser suficiente; no se dispone de cifras especificas de VRAM por GPU ni de modelos recomendados.
- Opciones de despliegue: transformers con `trust_remote_code=True` y vLLM (entrada propia del repositorio para prefills grandes). No se mencionan llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. Los entornos de HF y vLLM son separados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrenamiento | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-1m | 79,3M | 1.048.576 tokens | Mamba / Attention / MoE (Nemotron-H) | Apache-2.0 | Hugging Face (CladeTeam) |
| CENO-80M-base | no disponible (misma familia, 80M) | etapa base | Mamba / Attention / MoE (Nemotron-H) | Apache-2.0 | Hugging Face (CladeTeam) |
| CENO-80M-131k | no disponible (misma familia, 80M) | 131k tokens | Mamba / Attention / MoE (Nemotron-H) | Apache-2.0 | Hugging Face (CladeTeam) |
| CENO-1B-1m | no disponible (misma familia, 1B) | 1.048.576 tokens | Mamba / Attention / MoE (Nemotron-H) | Apache-2.0 | Hugging Face (CladeTeam) |

No se dispone de datos de benchmarks ni de comparativas con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La correccion numerica de la implementacion no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas deben validarse experimentalmente.
- La ruta de Hugging Face en BF16 esta limitada a 131.072 tokens por prefill; para contextos mayores hay que usar la entrada vLLM del repositorio.
- La evidencia de referencia para el contexto de 1M pertenece a CENO-1B-1m; las comprobaciones cortas multi-tamano no implican la misma cobertura larga para este checkpoint de 80M.
- Las capas Mamba requieren CUDA: no es posible la generacion en CPU sin kernels compatibles.
- Las referencias de Megatron CP no son intercambiables entre configuraciones.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (en el sentido de secuencias no plausibles biologicamente) ni limitaciones de idioma mas alla de las propias del dominio genomico.
- Licencia Apache-2.0: permite uso comercial, pero el codigo del modelo deriva de la implementacion de Nemotron-H de NVIDIA y el tokenizador de Evo2 del Arc Institute; deben conservarse las atribuciones de `LICENSE` y `NOTICE`.
- Este checkpoint es un modelo base: no esta alineado para tareas de VEP sin adaptacion; para esa funcion debe usarse la familia CENO-P.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-1m
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Repositorio CENO (rama main): https://github.com/CladeTeam/CENO/tree/main
