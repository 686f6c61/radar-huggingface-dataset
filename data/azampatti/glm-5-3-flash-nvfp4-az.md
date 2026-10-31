# azampatti/GLM-5.3-Flash-NVFP4-AZ

## Resumen

GLM-5.3-Flash-NVFP4-AZ es una variante optimizada de GLM-5.3-Flash publicada por el usuario azampatti en HuggingFace. Se trata de un fine-tune de nvidia/GLM-5.3-Flash-FP4-Local, que a su vez es la build NVFP4 de NVIDIA (etiquetada como QAD) del modelo GLM-5.3-Flash original de zai-org. El modelo es un MoE (mixture-of-experts) multimodal de texto e imagen con 175.239.203.374 parametros totales segun los metadatos de safetensors, y cuyo objetivo es reducir la latencia de decodificacion sin perder calidad.

La innovacion principal de esta variante es doble: por un lado, se reduce el numero de expertos enrutados por token de 8 a 4 (de 288 expertos por capa MoE), lo que reduce a la mitad los pesos de expertos leidos por token (~18 B a ~14 B de parametros activos en la parte enrutada); por otro, se aplican "shared experts sanados" (healed), entrenados mediante auto-distilacion KL en el modelo hermano GLM-5.3-Flash-AZ para que el modelo de 4 expertos reproduzca el comportamiento del de 8. Segun el autor, la calidad se mantiene dentro de ±1 % respecto a los pesos FP4-Local originales, con decodificacion mas rapida.

Es relevante porque demuestra una via practica de compresion de MoE mediante pruning de expertos y destilacion correctiva, manteniendo la compatibilidad byte a byte con el layout del repositorio de NVIDIA (mismos ficheros, nombres y offsets), lo que permite cargarlo con las mismas herramientas. El repo ocupa 177,5 GB y se distribuye en safetensors con cuantizacion NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), glm5_next, con capa MTP (multi-token prediction) |
| Parametros totales | 175.239.203.374 (175,2 B, segun safetensors) |
| Parametros activos | ~14 B en expertos enrutados por token (con top-k 4); ~18 B con el top-k 8 original. Dato total de activacion completo: no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, con escalas comprimidas), MXFP8 (atencion), FP8 E4M3 con escalas de bloque 128x128 (shared experts), 8-bit |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | nvidia-open-model-agreement (other) |
| Formato de pesos | safetensors (177,5 GB de repo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de GLM-5.3-Flash: 288 expertos por capa MoE, de los cuales el modelo original activaba 8 por token mas un shared expert siempre activo en cada capa MoE (capas 3 a 44). Incluye una torre de vision (vision tower) para entrada imagen-texto y una capa MTP (multi-token prediction) que permite decodificacion especulativa en vLLM. La atencion usa cuantizacion MXFP8, los expertos enrutados NVFP4 con escalas comprimidas, y router, embeddings, cabeza de salida y torre de vision permanecen intactos respecto a la release de NVIDIA.

Sobre esa base, el autor realizo dos modificaciones. Primera: reducir `num_experts_per_tok` de 8 a 4, leyendo asi la mitad de pesos enrutados por token. Segunda: sustituir los shared experts por versiones "sanadas": en el modelo GLM-5.3-Flash-AZ se entrenaron shared experts en BF16 mediante auto-distilacion KL (profesor = top-k 8 con shared experts originales; estudiante = top-k 4), usando KL sobre el top-64 del profesor en tokens de completacion, con 14.142 prompts (la model card se trunca en este punto, por lo que no hay mas detalle del dataset). En este repositorio, la correccion se aplica como delta sobre los shared experts de NVIDIA (pesos NVIDIA + (sanados − originales)) y se almacena en FP8 E4M3 con escalas de bloque 128x128. La capa MTP no se reentreno, por lo que debe ejecutarse con su top-k 8 original mediante una carpeta de config alternativa para el drafter especulativo.

## Capacidades

- Generacion de texto conversacional (pipeline conversational) en ingles y chino.
- Comprension multimodal imagen-texto (pipeline image-text-to-text), heredada de la torre de vision de GLM-5.3-Flash.
- Decodificacion especulativa mediante capa MTP (multi-token prediction), con 9 tokens especulativos en la receta de despliegue documentada.
- Ejecucion eficiente en hardware NVIDIA moderno gracias a la cuantizacion NVFP4/MXFP8.
- Compatibilidad con el layout e indice del repositorio de NVIDIA: carga como el original en vLLM y herramientas compatibles.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Modo thinking / razonamiento extendido: no disponible (no documentado).

## Casos de uso

- Servido de LLM de baja latencia en clusters pequeños: la reduccion de expertos activos por token acelera la decodificacion, ideal para despliegues en 2x GB10 como el documentado por el autor.
- Chatbots multilingues (ingles/chino): pipeline conversacional con calidad dentro de ±1 % del modelo base cuantizado.
- Analisis de documentos e imagenes: al ser image-text-to-text, puede describir, responder preguntas sobre imagenes y procesar contenido visual combinado con texto.
- Experimentacion en compresion de MoE: es un caso de estudio reproducible de pruning de expertos (top-k 8 a 4) combinado con destilacion KL correctiva en shared experts.
- Inferencia local en estaciones de trabajo NVIDIA con soporte FP4 (por ejemplo GB10 / DGX Spark, segun la receta del autor), aprovechando el formato NVFP4-Local.
- Despliegue con vLLM y decodificacion especulativa MTP: la receta myllmbox proporciona un pipeline completo (recipe.yaml, setup.sh, run.sh) para servir el modelo en cluster con tensor-parallel 2.
- Prototipado de optimizaciones de inferencia: al mantener el layout de NVIDIA, permite comparar A/B entre top-k 4 y top-k 8 con la misma infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica unicamente que, en las pruebas del autor, la calidad se mantiene dentro de ±1 % respecto a los pesos FP4-Local originales de NVIDIA (top-k 8), probado en 2x NVIDIA GB10 (128 GB cada uno) con tensor-parallel 2, vLLM 0.32 y decodificacion especulativa MTP (receta myllmbox v3). El autor indica que "detailed benchmark numbers will be added later", por lo que las cifras concretas (MMLU, HumanEval, GSM8K, etc.) no estan disponibles.

## Requisitos de hardware

- Tamano del repo: 177,5 GB (~166 GB de descarga de pesos segun la model card).
- Configuracion documentada por el autor: 2x NVIDIA GB10 con 128 GB cada uno, tensor-parallel 2. No cabe en una sola GB10 de 128 GB segun esa receta.
- VRAM para otras configuraciones (una sola GPU, RTX 4090, A100, H100): no disponible; el formato NVFP4-Local esta orientado a hardware con soporte FP4, pero no hay cifras publicadas para otras GPUs.
- Consumer GPUs: no hay evidencia de que funcione en RTX 4090 o similares dado el tamano del modelo y el formato NVFP4; no disponible.
- Despliegue documentado: vLLM 0.32 mediante la receta myllmbox glm53-flash-cluster-recipe v3 (contenedor myllmbox/glm53-flash-cluster-vllm:v3), con tensor parallelism y MTP speculative decoding (num_speculative_tokens: 9). Compatibilidad con llama.cpp, Ollama o TGI: no disponible.
- Requisito operativo: crear una carpeta adicional de config con top-k 8 para el drafter MTP (mediante hard links, sin coste de disco adicional) y apuntar el speculative-config a ella en ambas maquinas del cluster.
- Latencia y throughput: no disponible en cifras concretas; el autor solo afirma decodificacion mas rapida por leer la mitad de pesos enrutados por token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Cuantizacion | Multimodal | Licencia |
|---|---|---|---|---|---|
| azampatti/GLM-5.3-Flash-NVFP4-AZ | 175,2 B | ~14 B enrutados (top-k 4) + shared experts | NVFP4 / MXFP8 / FP8 | Si (imagen-texto) | nvidia-open-model-agreement |
| nvidia/GLM-5.3-Flash-FP4-Local (base) | no disponible (mismo layout, ~175 B) | ~18 B enrutados (top-k 8) | NVFP4 / MXFP8 | Si | nvidia-open-model-agreement |
| zai-org/GLM-5.3-Flash (original) | no disponible | no disponible | BF16 (sin cuantizar) | Si | no disponible |

Comparativa de rendimiento: no disponible en cifras; solo el dato cualitativo de ±1 % de diferencia de calidad y mayor velocidad de decodificacion frente a la version base de NVIDIA.

## Limitaciones y advertencias

- La model card esta truncada en la seccion de entrenamiento ("14,142 prompts written by..."), por lo que la composicion completa del dataset de destilacion es desconocida; posible sesgo heredado del dataset no documentado.
- Los benchmarks detallados no estan publicados todavia; el ±1 % de calidad es una afirmacion del autor sin numeros verificables.
- La capa MTP no fue reentrenada: debe ejecutarse obligatoriamente con top-k 8 mediante la carpeta de config alternativa; usar el drafter con top-k 4 degradaria el funcionamiento.
- Si se descarga una revision nueva del repo, hay que borrar y regenerar la carpeta del drafter top-k 8, porque los hard links apuntan a los ficheros antiguos.
- Idiomas limitados a ingles y chino; otros idiomas no estan soportados oficialmente.
- Licencia nvidia-open-model-agreement (other): conviene revisar las restricciones exactas del acuerdo de NVIDIA antes de uso comercial; no es una licencia estandar tipo Apache/MIT.
- Riesgo de alucinacion: no disponible (no documentado), aunque es inherente a modelos de lenguaje generativos.
- Descargas muy bajas (56) y un solo like en el momento de la ficha: proyecto de un autor individual, sin auditoria independiente; probar antes de llevar a produccion.
- Requiere hardware especifico con soporte NVFP4 y una configuracion de cluster de 2 nodos segun la receta documentada, lo que limita la accesibilidad.

## Enlaces

- Modelo: https://huggingface.co/azampatti/GLM-5.3-Flash-NVFP4-AZ
- Modelo base de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Modelo original de zai-org: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo hermano con shared experts sanados: https://huggingface.co/azampatti/GLM-5.3-Flash-AZ
- Receta de cluster myllmbox: https://github.com/myllmbox/glm53-flash-cluster-recipe
- Paper, demo y blog: no disponibles en la informacion proporcionada.
