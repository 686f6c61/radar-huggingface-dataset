# omegamentiszug/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje nativamente multimodal y orientado a agentes, publicado como pesos abiertos por Moonshot AI. Segun la model card, se trata del primer modelo de la serie K3.1 y del modelo mas capaz de la familia de clase 3T hasta la fecha, obtenido mediante post-entrenamiento a partir de Kimi K3 con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios. El repositorio de Hugging Face esta alojado por el usuario `omegamentiszug` y expone un total de 2.780.110.363.392 parametros en safetensors (2,8 billones), coherente con la cifra de 2,8T declarada por el autor.

Arquitectonicamente es un transformer de tipo Mixture-of-Experts (MoE) con 93 capas, 896 expertos y 16 expertos seleccionados por token mas 2 expertos compartidos, lo que resulta en 104B parametros activos por token. La composicion de capas de atencion combina 69 capas KDA (Kimi Delta Attention) con 24 capas Gated DSA (DeepSeek Sparse Attention, segun la nomenclatura del autor), y declara una ventana de contexto de 1 millon de tokens. El pipeline declarado es `image-text-to-text`, lo que confirma el caracter multimodal del modelo.

Su relevancia radica en dos factores: por un lado, la escala (clase 3T con 104B activos) y el contexto de 1M tokens lo situan en la liga de los modelos frontera abiertos; por otro, el enfasis declarado en capacidades agenticas (codigo, creacion 3D, investigacion financiera, precision factual) apunta a un uso intensivo en tool calling y razonamiento multi-paso. La licencia es propietaria (`kimi-k3.1-pro`, etiquetada como `other`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2,8T (2.780.110.363.392 en safetensors) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (tag `8-bit`, `compressed-tensors`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (etiqueta `other` en Hugging Face) |
| Formato de pesos | safetensors, con `compressed-tensors` y `custom_code` |

Datos arquitectonicos adicionales declarados por el autor: 93 capas (1 densa), 69 capas KDA + 24 capas Gated DSA, dimension oculta de atencion 7168, 96 cabezas de atencion, dimension de cabeza de indice DSA 128, 32 cabezas de indice DSA, top-K DSA de 2048, dimension latente MoE 3584, dimension oculta por experto 3072, 896 expertos, 16 expertos seleccionados por token, 2 expertos compartidos y vocabulario de 160K.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atencion hibrida: 69 capas usan KDA (Kimi Delta Attention) y 24 capas usan Gated DSA (atención dispersa con puerta), una combinacion pensada para sostener ventanas de contexto muy largas con coste computacional controlado. La capa MoE emplea 896 expertos con enrutamiento top-16 mas 2 expertos compartidos, sobre una dimension latente de 3584 y una dimension oculta por experto de 3072. Solo hay una capa densa en toda la red. El vocabulario es de 160K tokens.

Segun la model card, Kimi K3.1 Pro se obtiene por post-entrenamiento de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream. No se detallan en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset, ni si se aplicaron fases especificas de RLHF o DPO mas alla de la mencion generica al RL conjunto. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o modos de pensamiento explicito.

## Capacidades

- Generacion de texto y razonamiento general, con mejoras declaradas en precision factual respecto a Kimi K3.
- Generacion de codigo, con enfasis declarado en tareas de programacion y agentes de codigo.
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`).
- Creacion 3D, una de las areas donde el autor declara mejoras sustanciales.
- Investigacion financiera y analisis de dominios especializados.
- Capacidades agenticas: razonamiento multi-paso y ejecucion de tareas en entornos con herramientas (tool calling / function calling), segun el enfasis del autor en "agentic model".
- Contexto de 1M tokens, adecuado para documentos extensos, repositorios completos o historiales largos.
- Capacidades multilingues: no disponibles en detalle; el autor no publica la lista de idiomas.

## Casos de uso

- Agentes de codigo en produccion: con 104B parametros activos y soporte declarado de tool calling, el modelo puede integrarse en pipelines de CI/CD para revisar PRs, generar parches y ejecutar tareas multi-paso sobre repositorios completos, aprovechando el contexto de 1M tokens para cargar varios ficheros a la vez.
- Analisis de repositorios completos: la ventana de 1M tokens permite ingerir arboles de codigo extensos y responder preguntas de arquitectura o dependencias sin trocear el contexto.
- Investigacion financiera asistida: el autor declara mejoras especificas en este dominio; el modelo puede resumir informes anuales, extraer metricas y contrastar datos entre documentos largos en una sola pasada.
- Atencion al cliente automatizada de nivel empresarial: conversaciones multi-turno con historial largo y acceso a herramientas internas (consultas a bases de datos, gestion de pedidos) mediante function calling.
- Creacion 3D y modelado asistido: generacion y edicion de descripciones o scripts de escenas 3D, area en la que el autor reporta mejoras sustanciales.
- Procesamiento de documentos multimodales: al aceptar entrada imagen-texto, puede extraer informacion de capturas, diagramas o documentos escaneados combinados con texto largo.
- Asistentes de investigacion academica: lectura de decenas de papers en una sola ventana de contexto para sintesis comparativas y extraccion de citas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas en coding, 3D, investigacion financiera y precision factual, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T parametros totales, incluso en 8 bits el modelo requiere del orden de 2,8 TB de memoria agregada; en FP16 superaria los 5,5 TB. No es desplegable en una sola GPU.
- GPU recomendadas: clusters multi-nodo con GPUs de centro de datos (H100 80GB, H200, B200 o A100 80GB). El numero exacto de GPUs depende de la cuantizacion y del paralelismo elegido; no se publican configuraciones de referencia.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: al usar `custom_code` y `compressed-tensors`, la via natural es `transformers` con el codigo remoto del repositorio; el soporte en vLLM, TGI, llama.cpp u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. Con 104B parametros activos por token, el coste por token es elevado y requiere tensor/pipeline parallelism entre nodos.
- Almacenamiento: el repositorio ocupa 1561,4 GB, por lo que se necesita espacio en disco o almacenamiento distribuido de al menos esa capacidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | `kimi-k3.1-pro` (other) | Pesos en HF (repo de terceros) |
| Kimi K3 | no disponible en esta ficha | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia propietaria (`kimi-k3.1-pro`, etiquetada como `other`): es imprescindible revisar el fichero LICENSE del repositorio oficial de Moonshot AI antes de cualquier uso comercial; la licencia no es de codigo abierto en sentido estricto.
- El repositorio esta alojado por un usuario tercero (`omegamentiszug`), no por la organizacion oficial `moonshotai`; conviene verificar la integridad de los pesos y contrastar con la publicacion oficial antes de usarlos en produccion.
- Riesgo de alucinacion: no se publican tasas de error ni evaluaciones de factualidad, pese a que el autor declara mejoras en precision factual.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas cubiertos por el entrenamiento, que no se especifican.
- Contexto de 1M tokens: aunque la ventana es amplia, el rendimiento efectivo en el extremo superior no esta documentado con benchmarks publicos.
- Requisitos de hardware extremos: 2,8T parametros y 1,5 TB de pesos hacen inviable el despliegue fuera de infraestructura de centro de datos.
- Soporte de ecosistema incierto: el uso de `custom_code` y `compressed-tensors` limita la compatibilidad con frameworks de inferencia de alto rendimiento; no se confirma soporte en vLLM, TGI o llama.cpp.
- Ausencia de datos de entrenamiento detallados: no se publican tokens de preentrenamiento, composicion del dataset ni detalles del RL, lo que dificulta evaluar sesgos y cobertura.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/omegamentiszug/Kimi-K3.1-Pro
- Organizacion oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- Perfil en X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia (referencia en la model card): https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
