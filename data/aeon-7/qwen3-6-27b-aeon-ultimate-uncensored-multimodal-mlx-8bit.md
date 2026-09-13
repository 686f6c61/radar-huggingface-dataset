# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit es una cuantizacion de 8 bits en formato MLX del modelo AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16, publicada por el usuario AEON-7. Se trata de un decodificador hibrido de 27,36 mil millones de parametros que combina atencion lineal con recurrencia Gated-DeltaNet (familia SSM/Mamba), incorpora torre de vision para entrada imagen-texto y anade una cabeza MTP (multi-token prediction) en los propios pesos para decodificacion especulativa. El resultado es un modelo multimodal que corre de forma nativa y local sobre Apple Silicon mediante la libreria mlx-vlm.

El problema que resuelve es doble: por un lado, ofrecer una ruta de inferencia local en Mac sin depender de GPU dedicada ni de servicios en la nube; por otro, preservar la fidelidad numerica del modelo original manteniendo en BF16 las partes fragiles (la recurrencia Gated-DeltaNet, toda la torre de vision y la cabeza MTP) y aplicando cuantizacion afina de 8 bits (group-64, ~8,634 bpw) solo al grueso compresible del decoder. El resultado ocupa 29,5 GB en disco y alcanza un pico de 29,85 GB de memoria unificada.

Su relevancia actual es limitada por dos motivos que el propio autor declara: el modelo ha sido marcado como superado por la release Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, y la licencia es "other" sin terminos detallados. Ademas, el autor lo presenta explicitamente como un modelo "uncensored/abliterated" con los rechazos eliminados, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder hibrido: atencion lineal Gated-DeltaNet (SSM tipo Mamba) combinada con atencion, torre de vision y cabeza MTP integrada en los pesos |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se documenta configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín group-64 (~8,634 bpw) en el grueso del decoder; BF16 en la recurrencia Gated-DeltaNet/Mamba, en la torre de vision y en la cabeza MTP; el linaje incluye tambien una variante FP4 de 16 GB |
| Idiomas soportados | en (ingles) |
| Licencia | other (sin terminos detallados en la informacion disponible) |
| Formato de pesos | safetensors en formato MLX (library_name: mlx; requiere mlx-vlm) |
| Tamano del repositorio | 29,5 GB |
| Pipeline | image-text-to-text (multimodal texto + imagen) |
| Modelo base | AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura es un decoder hibrido que sustituye parte de la atencion densa por una recurrencia Gated-DeltaNet, encuadrada en la familia de modelos de estado (SSM) tipo Mamba y de atencion lineal. Esta eleccion busca reducir el coste computacional y de memoria del contexto frente a un transformer puramente denso. Sobre esa base se anaden dos componentes adicionales: una torre de vision que habilita la entrada de imagenes junto al texto, y una cabeza MTP (multi-token prediction) embebida en los pesos, que permite decodificacion especulativa propia sin necesidad de un modelo borrador externo distinto del publicado por el mismo autor.

La receta de cuantizacion es mixta y deliberadamente conservadora: 8 bits afines con tamano de grupo 64 sobre las capas del decoder que toleran la compresion, y BF16 en los tres bloques donde el autor considera que la cuantizacion degradaria el comportamiento: la dinamica de estado Gated-DeltaNet, la torre de vision completa y la cabeza MTP. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El modelo base si declara un proceso de "abliteration" orientado a eliminar rechazos, pero no se detalla la metodologia empleada.

## Capacidades

- Generacion de texto conversacional en ingles, con el modelo afinado para muestreo nativo a temperature 1.0 (top_p 0.95, top_k ~64).
- Comprension de imagen y texto de forma conjunta (pipeline image-text-to-text), con la torre de vision preservada en BF16, lo que segun el autor mantiene intacta la ruta multimodal.
- Decodificacion especulativa MTP sin perdida: cada token propuesto se verifica contra el modelo objetivo, de modo que la salida es identica a la de ejecutar sin especulacion.
- Inferencia local en Apple Silicon mediante mlx-vlm, con servidor compatible con el endpoint OpenAI /v1/chat/completions.
- Modelo "uncensored/abliterated": los rechazos han sido eliminados deliberadamente, por lo que responde a peticiones que un modelo alineado convencional declinaria.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades de audio o modo "thinking" explicito: no disponibles.

## Casos de uso

- Asistente local en Mac sin conexion: el modelo se sirve con mlx-vlm sobre memoria unificada de Apple Silicon, sin enviar datos a terceros, lo que encaja en entornos con requisitos de privacidad estrictos o sin acceso a red.
- Analisis de documentos con imagen: al aceptar contenido image_url y disponer de torre de vision en BF16, puede extraer informacion de capturas, diagramas o documentos escaneados junto a instrucciones en texto.
- Generacion de texto creativo sin filtros: el entrenamiento abliterated elimina los rechazos, lo que resulta util en escritura de ficcion, guiones o roleplay donde un modelo alineado bloquea el contenido.
- Investigacion sobre cuantizacion y arquitecturas hibridas: sirve como caso de estudio reproducible de una receta mixta (8-bit afín + BF16 selectivo) sobre un decoder con SSM y atencion lineal, con una variante FP4 directamente comparable de 16 GB.
- Servicio de inferencia compatible con OpenAI en red local: al exponer /v1/chat/completions en el puerto 8080, se puede conectar a clientes existentes que hablen el protocolo de OpenAI sin adaptar el codigo de aplicacion.
- Evaluacion de decodificacion especulativa MTP: con el drafter de 821 MB y draft-block-size 3, permite medir en condiciones reales la ganancia de rendimiento de la especulacion sin perdida sobre un modelo de 27 B.
- Prototipado multimodal en un unico equipo: la combinacion de vision e inferencia local en un MacBook Pro M4 Pro de 48 GB permite iterar sobre prototipos imagen-texto sin aprovisionar GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento declarados son relativos y comparan esta build con su hermana FP4:

| Comparacion | Dato declarado |
|---|---|
| Decodificacion (FP4 frente a esta build 8-bit) | 1,85x mas rapida en la variante FP4 |
| Throughput de un solo flujo (FP4 frente a esta build) | aproximadamente 3,2x en la variante FP4 |
| Punto de muestreo recomendado | temperature 1.0, top_p 0.95, top_k ~64 |
| Draft block size optimo (MTP) | 3 |
| Latencia absoluta (tokens/s) | no disponible |

## Requisitos de hardware

- Memoria unificada: minimo declarado de 36 GB en Apple Silicon; el pico de consumo es de 29,85 GB y el repositorio ocupa 29,5 GB en disco.
- Hardware de validacion: MacBook Pro con chip M4 Pro y 48 GB de memoria unificada, que es la configuracion sobre la que el autor construyo y valido el modelo.
- GPU CUDA/ROCm: no soportadas por este repositorio, que es un export MLX. El propio autor redirige a la release Qwen3.8 y a los contenedores de vLLM para ese escenario.
- Alternativa para equipos con menos memoria: la variante MLX-FP4 del mismo modelo ocupa 16 GB y esta pensada para Macs desde 24 GB, a cambio de una perdida de fidelidad frente al BF16.
- Opciones de despliegue: servidor mlx-vlm (compatible con la API de OpenAI), generacion puntual con mlx_vlm.generate y ejecucion mediante el gestor uv con Python 3.12. No se ofrece GGUF, Ollama, vLLM ni TGI para este repositorio.
- Dependencias criticas: mlx-vlm fijado a la rama main de git, porque la torre qwen3_5_vision no esta incluida en la release 0.6.1 de PyPI.
- Decodificacion especulativa: requiere descargar el drafter AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter (821 MB) e invocar el servidor con --draft-kind mtp --draft-block-size 3.
- Throughput absoluto y latencia en tokens por segundo: no disponibles. Solo se declaran ratios relativos frente a la build FP4.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros autores. La comparacion se limita a las variantes del mismo linaje, para las que si hay datos declarados:

| Modelo | Parametros | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit | 27,36 B | 29,5 GB (8,634 bpw) | no disponible | other | Build de maxima fidelidad; vision y MTP en BF16; pico de 29,85 GB |
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4 | 27,36 B (mismo linaje) | 16 GB | no disponible | other | 1,85x mas rapida en decodificacion y ~3,2x en un solo flujo; para Macs desde 24 GB |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | 27,36 B | no disponible | no disponible | other | Modelo base sin cuantizar, origen del export |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | no disponible | no disponible | other | Sucesor declarado por el autor; cuantizacion mixta NVFP4 + FP8, orientado a GPU y vLLM |

## Limitaciones y advertencias

- Modelo abliterated con rechazos eliminados: puede generar contenido que un modelo alineado rechazaria. No es adecuado para produccion orientada al usuario final sin un filtro de seguridad externo.
- Licencia "other": la model card no detalla los terminos. Antes de cualquier uso comercial hay que verificar la licencia aplicable, teniendo en cuenta ademas que el modelo deriva de la familia Qwen.
- Sin benchmarks publicados: no hay mediciones de MMLU, HumanEval, GSM8K ni de tareas multimodales, por lo que no se puede cuantificar el impacto de la cuantizacion de 8 bits frente al BF16 original mas alla de la afirmacion del autor sobre su fidelidad.
- Longitud de contexto no documentada: no conviene planificar cargas de contexto largo sin verificarla experimentalmente, pese a que la arquitectura Gated-DeltaNet/SSM esta pensada para ser eficiente en ese escenario.
- Idioma limitado al ingles segun el campo language; el rendimiento en castellano no esta declarado ni medido.
- La decodificacion por defecto del servidor MLX es greedy, lo que puede provocar repeticiones o bucles en prompts largos. Es obligatorio pasar temperature 1.0, top_p 0.95 y top_k ~64 en cada peticion.
- Dependencia de la rama main de mlx-vlm: la torre de vision qwen3_5_vision no esta en la release 0.6.1 de PyPI, lo que introduce riesgo de rotura por cambios en el repositorio.
- Exclusivo de Apple Silicon: no hay pesos GGUF ni ruta CUDA en este repositorio, lo que limita el despliegue a hardware M-series.
- Modelo declarado como superado por el propio autor en favor de Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, que se presenta como muy superior en capacidad y con mejor metodologia de cuantizacion mixta.
- Riesgo de alucinacion no cuantificado por ausencia de evaluaciones publicadas.
- Huella de memoria ajustada: 29,85 GB de pico sobre un minimo recomendado de 36 GB deja poco margen para el resto del sistema y para contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante compacta FP4: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4
- Drafter MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Sucesor declarado: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Documentacion de uv (gestor de Python recomendado por el autor): https://docs.astral.sh/uv/
- Contenedor vLLM para Spark/GB10: ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor vLLM para RTX discreta: ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondian a foros tecnicos de Windows sin relacion con esta ficha.
