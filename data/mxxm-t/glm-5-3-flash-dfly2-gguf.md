# mxxm-t/GLM-5.3-Flash-DFly2-GGUF

## Resumen

GLM-5.3-Flash-DFly2-GGUF es la conversion a formato GGUF del drafter de decodificacion especulativa DFly2 (block size 6) publicado por AngelSlim (Tencent) para el modelo objetivo GLM-5.3-Flash de Z.ai. No es un modelo autonomo: se trata de un modelo auxiliar que propone bloques de tokens candidatos que el modelo objetivo verifica, acelerando la generacion sin alterar la distribucion de salida. La conversion la firma el usuario mxxm-t y sigue el marco AngelSpec, la infraestructura unificada de Tencent para MTP y decodificacion especulativa block-parallel.

El checkpoint original, AngelSlim/GLM-5.3-Flash-DFly2-B6, contiene 10.339.281.506 parametros distribuidos en tres capas MoE (128 expertos enrutados cada una, 3 activos) emparejadas con las capas 35, 39 y 43 del objetivo. La innovacion clave de DFly2 es que el drafter no mantiene cache KV propia ni ejecuta su propio indexer: lee la KV ya cacheada por las capas DSA (DeepSeek Sparse Attention) del objetivo y reutiliza las posiciones que su indexer ya ha seleccionado. Una cabeza de correccion de 5 pasos rellena los huecos del bloque.

La relevancia de esta publicacion es fundamentalmente prospectiva: segun la propia model card, ningun runtime carga todavia este fichero. Ni mx-llama.cpp ni llmx ejecutan el objetivo GLM-5.3-Flash, y el soporte de drafting DFly2 se esta construyendo primero para DeepSeek-V4.1-Flash. El repositorio se publica para que la conversion este disponible cuando exista un runtime compatible, no para uso inmediato en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (drafter DFly2 block-parallel) con 3 capas MoE, 128 expertos enrutados por capa y 3 activos |
| Parametros totales | 10.339.281.506 |
| Parametros activos | no disponible (la model card no publica el recuento activo total; 3 de 128 expertos por capa) |
| Longitud de contexto | no disponible (depende del modelo objetivo GLM-5.3-Flash) |
| Tipos de cuantizacion | Q8_0 (expertos y lineales densos), BF16 (lossless); router en F32/BF16; normas, sinks y tablas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del checkpoint AngelSlim) |
| Formato de pesos | GGUF (dos ficheros: Q8_0 de 11,00 GB y BF16 de 20,69 GB) |

## Arquitectura y entrenamiento

DFly2 es un drafter block-parallel disenado especificamente para objetivos con atencion nativamente dispersa. Cada una de sus tres capas MoE se empareja con una capa DSA del objetivo (capas 35, 39 y 43) y comparte la KV cache que esa capa ya ha calculado, leyendo las posiciones que el indexer del objetivo ya ha seleccionado (KV sharing e index sharing). El drafter no mantiene cache KV propia, no ejecuta indexer y puede leer un numero fijo de posiciones desde cualquier punto del contexto. Una cabeza de correccion de 5 pasos rellena los slots del bloque de 6 tokens (un token ancla mas 5 tokens de borrador). El drafter comparte el embedding y la cabeza de salida con el objetivo, por lo que no los almacena en el fichero.

El entrenamiento se realizo con AngelSpec, el marco unificado de Tencent para MTP y decodificacion especulativa block-parallel, descrito en dos informes tecnicos (arXiv 2607.25852 y arXiv 2611.34776). La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; esos datos no estan disponibles. La conversion a GGUF no retreno ni ajusto los pesos: los 90 tensores GGUF cubren los 1233 tensores fuente (con fusion de tensores por experto) y las muestras BF16 verificadas son byte a byte identicas al checkpoint. Los expertos fusionados `gate_up_proj` se separan en mitades gate y up (gate primero).

## Capacidades

- Generacion de tokens candidatos (drafting) para verificacion por el modelo objetivo GLM-5.3-Flash; no genera texto de forma autonoma.
- Decodificacion especulativa block-parallel con block size 6 (1 token ancla + 5 borradores).
- Reutilizacion de KV cache e indices del objetivo (KV sharing e index sharing), sin cache propia.
- Correccion de borradores mediante cabeza de 5 pasos.
- Compatibilidad con el ecosistema AngelSpec y con el formato GGUF para su futura integracion en runtimes llama.cpp.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues propias: todas esas funciones dependen exclusivamente del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia de GLM-5.3-Flash en produccion: una vez exista un runtime compatible, el drafter permitiria generar bloques de 6 tokens por paso de verificacion, reduciendo el numero de pasos de decodificacion del objetivo. Es su unico proposito real.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de un drafter DFly2 convertido a GGUF para estudiar el comportamiento de KV sharing e index sharing sobre objetivos con atencion dispersa.
- Desarrollo de runtimes: el repositorio actua como banco de pruebas para implementar el soporte de drafting DFly2 en mx-llama.cpp, llmx u otros forks de llama.cpp.
- Validacion de pipelines de conversion: los hash SHA-256, el recuento de tensores (90 frente a 1233) y la verificacion byte a byte del BF16 permiten auditar herramientas de conversion GGUF.
- Despliegue en entornos con memoria limitada: la variante Q8_0 de 11,00 GB reduce a la mitad el espacio frente al BF16 de 20,69 GB, manteniendo la salida identica porque el objetivo verifica cada token.
- Docencia y divulgacion: ejemplo concreto de arquitectura drafter-target con comparticion de embedding y cabeza de salida para explicar decodificacion especulativa en objetivos MoE dispersos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion de tokens, speedups medidos, throughput ni comparaciones cuantitativas con otros drafters.

## Requisitos de hardware

- VRAM estimada: 11,00 GB para el fichero Q8_0 y 20,69 GB para el BF16, a los que hay que sumar la memoria del modelo objetivo GLM-5.3-Flash, que no se distribuye en este repositorio.
- GPU recomendadas: no disponible; depende del objetivo y del runtime, que todavia no existe.
- Cabe en GPU de consumo: el fichero Q8_0 (11,00 GB) podria caber en tarjetas de 16 GB o mas, pero solo junto al objetivo, por lo que el requisito real de VRAM es la suma de ambos.
- Opciones de despliegue: ninguna operativa. La model card indica que ni mx-llama.cpp ni llmx cargan el objetivo GLM-5.3-Flash, y el flag `--spec-type` mostrado es un marcador de posicion no definitivo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Runtime disponible |
|---|---|---|---|---|---|
| GLM-5.3-Flash-DFly2-B6 (AngelSlim) | Drafter DFly2 block size 6 | 10.339.281.506 | no disponible | Apache-2.0 | No (solo checkpoint) |
| GLM-5.3-Flash-DFly2-GGUF (este) | Conversion GGUF del anterior | 10.339.281.506 | no disponible | Apache-2.0 | No |
| Drafters DFly2 para DeepSeek-V4.1-Flash | Drafter DFly2 | no disponible | no disponible | no disponible | En desarrollo (prioridad de mx-llama.cpp) |

No se dispone de datos de rendimiento ni de otros drafters comparables publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo GLM-5.3-Flash no produce salida util.
- Ningun runtime carga este fichero actualmente; la propia model card lo advierte y califica la linea de comandos de ejemplo como no definitiva.
- Los nombres de tensores pueden cambiar cuando se implemente el soporte en runtimes.
- El repositorio no incluye el GGUF del modelo objetivo, necesario para cualquier prueba.
- La cuantizacion Q8_0 introduce perdida numerica en el drafter, aunque la salida final no cambia porque el objetivo verifica cada token.
- No hay datos publicados sobre sesgos, alucinacion, idiomas o rendimiento; estas propiedades dependen del objetivo.
- La licencia Apache-2.0 cubre el drafter, pero el modelo objetivo esta sujeto a su propia licencia, que debe revisarse para uso comercial.
- Uso en produccion no recomendado hasta que exista soporte de runtime verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mxxm-t/GLM-5.3-Flash-DFly2-GGUF
- Checkpoint original: https://huggingface.co/AngelSlim/GLM-5.3-Flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio mx-llama.cpp: https://github.com/mxxm-t/mx-llama.cpp
- Repositorio AngelSpec: https://github.com/Tencent/AngelSpec
- Documentacion AngelSpec: https://angelspec.readthedocs.io
- Coleccion Hugging Face AngelSpec: https://huggingface.co/collections/AngelSlim/angelspec
- Informe tecnico AngelSpec: https://arxiv.org/abs/2607.25852
- Articulo DFly2: https://arxiv.org/abs/2611.34776
