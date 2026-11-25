# igorls/universal-conditioner

## Resumen

Universal Conditioner es un conjunto de adaptadores publicado por el desarrollador independiente igorls (usuario de Hugging Face `igorls`) para el nodo personalizado ComfyUI-UniversalConditioner. La idea central es sustituir los text encoders especificos de cada modelo de difusion de imagen y video por un unico modelo de lenguaje servido aparte: los adaptadores proyectan los hidden states de ese modelo de lenguaje al espacio de condicionamiento que espera cada modelo de difusion. De este modo, ComfyUI no carga en la GPU ningun text encoder nativo.

El repositorio incluye dos adaptadores: uno para Qwen-Image 2.1 (fichero de 269 MB) y otro para MiniMax H3 (fichero de 690 MB). Ambos leen los hidden states de Qwen3.8-27B, con recomendacion explicita de la variante `neroued/Qwen3.8-27B-nvfp4-NInfer`, sobre la que estan ajustados. El tamano total del repositorio es de 1,0 GB, con 79 descargas y ningun like en el momento de la consulta.

El proyecto es relevante porque reduce el coste de memoria de los pipelines de difusion al desacoplar el encoder de texto del modelo generativo, pero su estado es experimental y su licencia es heterogenea: cada adaptador hereda los terminos de su modelo objetivo, con restricciones no comerciales en el caso de Qwen-Image 2.1 y limitaciones territoriales en el de MiniMax H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de proyeccion sobre hidden states de un LLM (Qwen3.8-27B); no es un modelo generativo autonomo |
| Parametros totales | no disponible (el adaptador Qwen-Image 2.1 pesa 269 MB; el de MiniMax H3, 690 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo fuente Qwen3.8-27B y del modelo objetivo) |
| Tipos de cuantizacion | no disponible para los adaptadores; el modelo fuente recomendado usa NVFP4 |
| Idiomas soportados | no disponible (la model card menciona evaluacion de habla en japones para MiniMax H3) |
| Licencia | per-adapter: Qwen Research License (solo uso no comercial) para Qwen-Image 2.1; MiniMax H3 Community License (limitada a su Applicable Territory) para MiniMax H3 |
| Formato de pesos | safetensors (ficheros unicos para `diffusion-single-file`) |

## Arquitectura y entrenamiento

Cada adaptador es un modulo de proyeccion que transforma los hidden states producidos por Qwen3.8-27B en el espacio de condicionamiento del modelo de difusion objetivo. El flujo de inferencia descrito en la model card es el siguiente: el nodo de ComfyUI envia una peticion `POST /v1/hidden_states` a un servidor propio donde esta cargado el modelo fuente; el adaptador correspondiente traduce esos estados y el modelo de difusion los consume como condicionamiento. El text encoder nativo del modelo objetivo se mantiene en disco unicamente para leer su tabla de tokens, sin cargarse en la GPU.

El adaptador de Qwen-Image 2.1 se distribuye como `unicond-qi21-v3.2-seq.safetensors` y el de MiniMax H3 como `unicond-h3-v4.4-6l-dual-seq.safetensors`; el sufijo `6l` sugiere seis capas en el adaptador de MiniMax, aunque la model card no detalla la arquitectura interna. Ambos estan ajustados sobre `neroued/Qwen3.8-27B-nvfp4-NInfer` y tambien funcionan, con puntuaciones ligeramente inferiores, sobre `igorls/Qwen3.8-27B-Uncensored-NVFP4-NInfer`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Condicionamiento de texto para Qwen-Image 2.1 y MiniMax H3 dentro de ComfyUI, sustituyendo al text encoder nativo de cada modelo.
- Reutilizacion de un unico modelo de lenguaje como encoder para varios modelos de difusion, con un adaptador pequeno por modelo.
- Soporte de entrada de vision a traves del modelo fuente Qwen3.8-27B (la model card describe el conjunto como encoder de texto y vision), aunque para MiniMax H3 se advierte que la proyeccion de vision no ha demostrado cambiar los renders.
- Desacoplamiento del encoder respecto de la GPU de ComfyUI: el modelo fuente se sirve desde un servidor externo mediante una API HTTP (`POST /v1/hidden_states`).
- Compatibilidad con el nodo ComfyUI-UniversalConditioner y con el formato `diffusion-single-file`.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento, por tratarse de adaptadores de condicionamiento y no de un modelo conversacional.

## Casos de uso

- Sustitucion del text encoder en pipelines de ComfyUI: un estudio con varias GPU puede mantener Qwen3.8-27B en un servidor dedicado y servir condicionamiento a Qwen-Image 2.1 y MiniMax H3 desde el mismo proceso, reduciendo la VRAM ocupada por encoders duplicados en cada nodo.
- Despliegue multiusuario de generacion de imagen: al centralizar el encoder en un endpoint HTTP, varios clientes de ComfyUI pueden compartir el mismo modelo fuente sin cargarlo por duplicado.
- Experimentacion con modelos de difusion sin encoder nativo en GPU: util para entornos donde el text encoder oficial no cabe junto al modelo de difusion, ya que solo se necesita su tabla de tokens en disco.
- Evaluacion comparativa de encoders: el adaptador permite medir como afecta sustituir el encoder nativo por las representaciones de un LLM de 27B en tareas concretas de generacion de imagen o video.
- Flujos de video con MiniMax H3: el adaptador `unicond-h3-v4.4-6l-dual-seq` habilita condicionamiento de texto para este modelo de video dentro de ComfyUI, con la salvedad de que el habla en japones queda por debajo del encoder nativo.
- Investigacion sobre espacios de condicionamiento: la proyeccion de hidden states de un LLM a un espacio de difusion es un objeto de estudio util para analizar alineamiento entre representaciones de lenguaje y de imagen.
- Prototipado rapido en ComfyUI: instalar el node pack, colocar el adaptador en `ComfyUI/models/universal_conditioner/` y apuntar la direccion del servidor permite probar la sustitucion sin reentrenar el modelo de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada tarjeta de adaptador incluye las puntuaciones en conjuntos held-out y las comprobaciones frente al encoder nativo, pero esos valores no se recogen en la informacion proporcionada. Tampoco se ofrecen datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM para los adaptadores: minima; los ficheros pesan 269 MB (Qwen-Image 2.1) y 690 MB (MiniMax H3), por lo que caben en cualquier GPU consumer con holgura.
- VRAM para el modelo fuente: no disponible en la informacion proporcionada; Qwen3.8-27B en NVFP4 requiere una GPU con soporte de FP4 y capacidad suficiente para un modelo de 27B, y se sirve en un equipo separado del que ejecuta ComfyUI.
- GPU recomendadas: no disponibles de forma explicita; el modelo fuente recomendado esta cuantizado en NVFP4, lo que condiciona la eleccion de GPU al soporte de ese formato.
- Cabe en GPU consumer: los adaptadores si; el modelo fuente depende de la cuantizacion y no se detalla.
- Opciones de despliegue: ComfyUI con el node pack ComfyUI-UniversalConditioner y un servidor propio que exponga `POST /v1/hidden_states` con el modelo fuente cargado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Universal Conditioner (este) | Adaptadores de condicionamiento para ComfyUI | no disponible (269 MB y 690 MB por adaptador) | no disponible | per-adapter, con restricciones no comerciales o territoriales | Hugging Face, 79 descargas |
| Text encoder nativo de Qwen-Image 2.1 (`qwen3vl_8b_int8_convrot.safetensors`) | Text encoder del modelo objetivo | basado en Qwen3-VL 8B (segun nombre de fichero) | no disponible | la del modelo Qwen-Image 2.1 | incluido con el modelo objetivo |
| Text encoder nativo de MiniMax H3 (`qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`) | Text encoder del modelo objetivo | basado en Qwen3-VL 32B (segun nombre de fichero) | no disponible | la del modelo MiniMax H3 | incluido con el modelo objetivo |
| Qwen3.8-27B (modelo fuente) | LLM usado como encoder | 27B | no disponible | no disponible en la informacion proporcionada | Hugging Face (`neroued/Qwen3.8-27B-nvfp4-NInfer`) |

La comparativa directa con otros adaptadores de condicionamiento no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental declarado explicitamente por el autor; no es un componente validado para produccion.
- Licencia heterogenea: el adaptador de Qwen-Image 2.1 queda bajo la Qwen Research License, limitada a uso no comercial, y el de MiniMax H3 bajo la MiniMax H3 Community License, restringida a su Applicable Territory. Es obligatorio leer `LICENSE` y `NOTICE` en cada carpeta antes de usarlo.
- El adaptador de MiniMax H3 es una obra derivada del modelo MiniMax H3, con las obligaciones que ello implica.
- Para MiniMax H3, el habla en japones queda por debajo del encoder nativo, y la proyeccion de vision no ha demostrado cambiar los renders.
- Las puntuaciones sobre `igorls/Qwen3.8-27B-Uncensored-NVFP4-NInfer` son ligeramente inferiores a las obtenidas sobre el modelo recomendado.
- Dependencia de infraestructura adicional: requiere un servidor externo que responda a `POST /v1/hidden_states`, lo que anade un punto de fallo y latencia de red al pipeline.
- No se documentan sesgos, tasas de alucinacion ni cobertura idiomatica de los adaptadores; estos riesgos heredan los del modelo fuente y del modelo de difusion objetivo.
- El text encoder nativo debe permanecer en disco aunque no se cargue en GPU, por lo que no se elimina la dependencia de esos ficheros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/igorls/universal-conditioner
- Node pack ComfyUI-UniversalConditioner: https://github.com/igorls/ComfyUI-UniversalConditioner
- Tarjeta del adaptador Qwen-Image 2.1: https://huggingface.co/igorls/universal-conditioner/blob/main/qwen-image-2.1/README.md
- Tarjeta del adaptador MiniMax H3: https://huggingface.co/igorls/universal-conditioner/blob/main/minimax-h3/README.md
- Licencia: https://huggingface.co/igorls/universal-conditioner/blob/main/README.md
- Modelo fuente recomendado: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Modelo fuente alternativo: https://huggingface.co/igorls/Qwen3.8-27B-Uncensored-NVFP4-NInfer
