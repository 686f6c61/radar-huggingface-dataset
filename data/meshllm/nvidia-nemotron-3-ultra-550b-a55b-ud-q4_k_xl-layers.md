# meshllm/NVIDIA-Nemotron-3-Ultra-550B-A55B-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de inferencia distribuida en formato GGUF por capas del modelo NVIDIA Nemotron 3 Ultra 550B-A55B, publicado por el proyecto Mesh LLM. El modelo original lo desarrolla NVIDIA y es un Mixture-of-Experts hibrido Mamba-Transformer de 550 000 millones de parametros totales con 55 000 millones activos por token, disenado para cargas de trabajo agenticas, razonamiento de multiples pasos y contexto largo. La variante aqui empaquetada corresponde a la cuantizacion UD-Q4_K_XL generada por Unsloth.

La relevancia de este paquete es puramente practica: el GGUF completo ocupa cientos de gigabytes y no cabe en un unico servidor convencional, por lo que Mesh LLM lo divide en artefactos por capa (108 capas) y permite repartirlos entre varias maquinas de un cluster local. El resultado se expone como una API compatible con OpenAI en `localhost:3131`, de modo que herramientas que ya hablan el protocolo de chat/completions pueden usarlo sin cambios.

Conviene distinguir con claridad las dos capas de este artefacto: el modelo (Nemotron 3 Ultra, propiedad de NVIDIA, con su propia licencia) y el envoltorio (el splitter y el runtime de Mesh LLM, con formato de paquete propio). Cualquier decision de uso comercial debe resolverse sobre la licencia del modelo fuente, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts hibrida Mamba-Transformer con Latent MoE y capas MTP (multi-token prediction) |
| Parametros totales | 550 000 millones (550B) segun NVIDIA; el metadato safetensors del repo indica 421 645 056, cifra incompatible con la escala anunciada y probablemente artefacto de metadatos |
| Parametros activos | 55 000 millones (55B) por token |
| Longitud de contexto | 1 000 000 tokens (1M) segun NVIDIA |
| Tipos de cuantizacion | UD-Q4_K_XL (Unsloth Dynamic 4-bit); el catalogo del autor incluye ademas una variante UD-Q4_K_S |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo fuente `unsloth/NVIDIA-Nemotron-3-Ultra-550B-A55B-GGUF`) |
| Formato de pesos | GGUF dividido en artefactos por capa (layer package), con manifiesto `model-package.json`; el GGUF original consta de 9 fragmentos |
| Numero de capas | 108 |
| Tamano del repositorio | 361,0 GB |
| Runtime requerido | `mesh-llm` (libreria declarada: `mesh-llm`) |
| API expuesta | Compatible con OpenAI (`/v1/chat/completions`, `/v1/models`, `/api/status`) |
| Interfaz de servidor | Puerto 3131 por defecto |
| Descargas / likes | 4 398 descargas, 0 likes |
| Fechas | Creado el 2026-09-12; actualizado el 2026-09-25 |

## Arquitectura y entrenamiento

El modelo subyacente es un hibrido Mamba-Transformer con enrutamiento Mixture-of-Experts. La combinacion busca dos objetivos: reducir el coste de atencion en secuencias muy largas mediante capas de estado (Mamba) y mantener la capacidad de modelado del transformer clasico. Sobre esa base, NVIDIA incorpora Latent MoE, una variante de enrutamiento que opera en un espacio latente comprimido, y capas MTP (multi-token prediction), que permiten predecir mas de un token por paso y suelen aprovecharse para decodificacion especulativa. El preentrenamiento se realizo en NVFP4, el formato de 4 bits de NVIDIA para entrenamiento e inferencia de precision reducida.

En cuanto al empaquetado, este repositorio no aporta informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni las fases de alineacion (RLHF, DPO u otras); esos detalles pertenecen a la model card del modelo fuente de NVIDIA. Lo que si documenta el repositorio es el proceso de derivacion: el GGUF `UD-Q4_K_XL/NVIDIA-Nemotron-3-Ultra-550B-A55B-UD-Q4_K_XL-00001-of-00009.gguf` de Unsloth (revision `2fb7d5b3f4eae7aedb18b4839b6a6300111e46f6`, SHA-256 `bb1758a8954a30bc025eb390dab77ff06b189886c9c04e8c56e7f476a89cae22`) se procesa con el splitter de Mesh LLM para generar artefactos por capa, cada uno verificado con checksum durante la escritura. El manifiesto del paquete tiene SHA-256 `9ce15645c18dd99d1128cc4849509f9a1ec11f309fc72456a51e3a1dcbfd72c2`.

El paquete usa la cuantizacion UD-Q4_K_XL de Unsloth, una cuantizacion dinamica de 4 bits que asigna precision de forma desigual por tensor (los tensores mas sensibles reciben mayor precision) y que se calibro con matrices de importancia (tag `imatrix`). No hay informacion publicada sobre la innovacion de decodificacion especulativa concreta habilitada por las capas MTP en esta variante cuantizada.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat heredada del modelo fuente.
- Razonamiento de multiples pasos orientado a tareas agenticas y planificacion.
- Generacion y comprension de codigo, con enfasis declarado en precision sobre codigo, matematicas y ciencia.
- Tool calling / function calling, explicitamente destacado en la documentacion de NVIDIA.
- Analisis de contexto largo, hasta 1 000 000 de tokens, adecuado para documentos extensos y bases de codigo completas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no disponibles en la informacion proporcionada.
- Inferencia distribuida por capas entre varias maquinas mediante Mesh LLM.
- Servicio local con API compatible con OpenAI, lo que permite sustituir un endpoint remoto por uno propio.
- Modo de pensamiento (thinking) explicito: no disponible en la informacion proporcionada para esta variante.

## Casos de uso

- Atencion al cliente automatizada sobre documentacion extensa: con 1M de tokens de contexto, el modelo puede recibir manuales, historiales de incidencias y contratos completos en el mismo prompt, evitando fragmentacion y perdida de informacion entre turnos.
- Agentes de ingenieria de software: el soporte de tool calling y el enfasis en codigo permiten construir agentes que lean un repositorio, ejecuten pruebas, interpreten el fallo y propongan un parche dentro de un bucle multi-paso.
- Analisis de repositorios completos: la ventana de 1M tokens hace viable cargar modulos enteros en lugar de fragmentos aislados, util para auditorias de seguridad, revisiones de deuda tecnica o generacion de documentacion arquitectonica.
- Razonamiento sobre matematicas y ciencia en entornos de investigacion: el modelo esta optimizado para alta precision en problemas de varios pasos, apropiado para asistencia a investigadores que necesitan trazabilidad del razonamiento.
- Planificacion y orquestacion de agentes: las capas MTP y la orientacion agentica lo hacen adecuado como cerebro de un sistema que descompone un objetivo en subtareas y las delega en herramientas.
- Procesamiento de datos sensibles en infraestructura propia: al ejecutarse en hardware local mediante un cluster Mesh LLM, permite tratar documentos regulados sin enviarlos a una API de terceros.
- Evaluacion comparativa interna (LLM-as-a-judge): la combinacion de contexto largo y razonamiento multi-paso permite usarlo como evaluador de respuestas generadas por modelos mas pequenos, con la rubrica completa en el prompt.
- Generacion de informes largos y estructurados: sintesis de multiples fuentes en un unico documento coherente, aprovechando la ventana extendida para mantener consistencia entre secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este paquete. La model card del repositorio remite explicitamente a la model card del modelo fuente (`unsloth/NVIDIA-Nemotron-3-Ultra-550B-A55B-GGUF`) para notas de benchmark, pero esos datos no forman parte de la informacion proporcionada, por lo que no se reproducen aqui.

| Benchmark | Resultado | Fuente |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Cualquier otra metrica | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 361,0 GB y la cuantizacion es de 4 bits sobre un modelo de 550B, por lo que hay que reservar del orden de 340-380 GB solo para pesos, mas la cache KV, que a 1M de contexto puede ser muy significativa. Cifras exactas de VRAM: no disponibles.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, el despliegue realista es multi-nodo con GPUs de datacenter (clase A100/H100 o superior) repartidas entre varias maquinas.
- GPU de consumo: no cabe en ninguna GPU de consumo individual, ni siquiera en configuraciones multi-GPU de gama alta. El propio repositorio plantea el caso de uso "multi-machine serving when the full GGUF is too large for one host".
- Opciones de despliegue: runtime `mesh-llm` con el comando de servidor dividido (`mesh-llm serve --model "meshllm/NVIDIA-Nemotron-3-Ultra-550B-A55B-UD-Q4_K_XL-layers" --split`), ejecutado en cada maquina que aporte memoria o computo. La API resultante es compatible con OpenAI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible; el formato por capas es especifico del ecosistema Mesh LLM (formato "skippy").
- Latencia y throughput estimados: no disponibles. Dependeran del numero de nodos, del ancho de banda de interconexion entre ellos y del reparto de capas.
- Almacenamiento: 361,0 GB de pesos que deben estar accesibles desde el cluster; conviene planificar almacenamiento local rapido por nodo para evitar cuellos de botella de red en cada carga de capa.

## Comparativa con modelos similares

La comparacion mas util aqui es entre variantes del mismo modelo, porque el interes del repositorio reside en el formato de distribucion, no en el modelo en si.

| Variante | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| `meshllm/...UD-Q4_K_XL-layers` (este repo) | 550B totales / 55B activos | 1M | UD-Q4_K_XL | GGUF por capas (108 capas), 361,0 GB | other |
| `meshllm/...UD-Q4_K_S-layers` | 550B totales / 55B activos | 1M | UD-Q4_K_S | GGUF por capas | other |
| `unsloth/NVIDIA-Nemotron-3-Ultra-550B-A55B-GGUF` | 550B totales / 55B activos | 1M | UD-Q4_K_XL entre otras | GGUF monolitico en 9 fragmentos | other |
| `nvidia/nemotron-3-ultra-550b-a55b` (NIM) | 550B totales / 55B activos | 1M | NVFP4 | Pesos originales NVFP4 para NIM | other |

Diferencias clave: la variante `Q4_K_S` prioriza menor tamano en disco a costa de mas perdida de precision; el GGUF de Unsloth requiere un unico host con memoria suficiente para todos los fragmentos; el paquete por capas permite repartir entre maquinas pero obliga a usar el runtime de Mesh LLM. La variante NVFP4 es la de maxima fidelidad respecto al entrenamiento, pero esta pensada para el stack de NVIDIA. Rendimiento comparado entre variantes: no disponible.

## Limitaciones y advertencias

- Este repositorio es un artefacto de distribucion, no un modelo entrenado por su autor. Los datos de entrenamiento, sesgos y alineacion son responsabilidad de NVIDIA, y la model card remite al modelo fuente para cualquier detalle.
- El metadato de parametros safetensors del repositorio (421 645 056) no concuerda con la escala de 550B anunciada. Es una inconsistencia de metadatos que conviene verificar antes de usarla en cualquier automatizacion.
- Dependencia dura de un runtime concreto: el formato de paquete por capas (ABI "skippy", no registrado en la model card) esta atado a Mesh LLM. Migrar a vLLM, llama.cpp, Ollama o TGI no esta documentado y probablemente requiera recomponer el GGUF original.
- El coste de despliegue es alto: 361,0 GB de pesos y necesidad de multiples nodos con interconexion rapida. La latencia dependera fuertemente del ancho de banda entre maquinas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como en cualquier LLM de gran escala, es esperable en tareas de recuperacion factual y debe mitigarse con verificacion externa.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento homogeneo en castellano ni confirmar cobertura multilingue a partir de esta ficha.
- Licencia `other`: es una licencia no estandar heredada del modelo fuente. No se puede asumir uso comercial libre. Es imprescindible revisar los terminos de NVIDIA y de Unsloth antes de cualquier despliegue productivo.
- El repositorio tiene 0 likes y una unica fecha de actualizacion; no hay senales de mantenimiento continuado ni de comunidad que reporte problemas.
- No hay benchmarks publicados para esta variante cuantizada, por lo que la perdida de calidad respecto a los pesos originales NVFP4 no esta cuantificada.
- La cache KV a 1M de tokens puede consumir una cantidad de memoria muy superior a la de los propios pesos en funcion del numero de usuarios concurrentes; conviene limitar la longitud efectiva de contexto en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Ultra-550B-A55B-UD-Q4_K_XL-layers
- Modelo fuente (GGUF de Unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Ultra-550B-A55B-GGUF
- Variante UD-Q4_K_S del mismo autor: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Ultra-550B-A55B-UD-Q4_K_S-layers
- Pagina de investigacion de NVIDIA Nemotron 3 Ultra: https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/modelcard
- Pagina del modelo en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato de paquete por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord de Mesh LLM: https://discord.gg/rs6fmc63eN
