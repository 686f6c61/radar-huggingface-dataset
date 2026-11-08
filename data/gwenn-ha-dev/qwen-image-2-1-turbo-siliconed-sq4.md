# gwenn-ha-dev/Qwen-Image-2.1-Turbo-Siliconed-SQ4

## Resumen

Qwen-Image-2.1-Turbo-Siliconed-SQ4 es una cuantización de 4 bits del transformer (DiT) del modelo de generación de imágenes Qwen-Image-2.1-Turbo, desarrollado originalmente por Qwen (Laboratorio Tongyi, Hangzhou). El autor de esta conversión es gwenn-ha-dev, creador de Siliconed, una aplicación de text-to-image escrita en Swift y Metal para Apple Silicon. El modelo base es un text-to-image de aproximadamente 7.000 millones de parámetros; esta versión cuantizada reduce el transformer de 14,23 GB en bf16 a un único fichero de 4,39 GB.

El problema que resuelve es el de la inferencia eficiente de un DiT de gran tamaño en hardware Apple Silicon con memoria unificada limitada. El formato SQ4 es propietario de Siliconed: no es GGUF y no carga en diffusers ni en ComfyUI. Cada capa lineal se almacena a 4, 5 u 8 bits (4,72 bits por peso de media), con una escala float32 por fila de salida y una rotación Hadamard que permite reducir toda la dimensión K a un único producto escalar entero o float×int8, lo que se traduce en rutas Metal rápidas.

Es relevante ahora porque demuestra una alternativa a GGUF Q4_K_M con menor error de cuantización respecto al modelo exacto en las 225 capas lineales y en los 12 puntos de evaluación de salida reportados, además de un rendimiento en inferencia comparable al formato int8 de 8 bits con menor consumo de memoria. La contrapartida es la dependencia total de la aplicación Siliconed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) del modelo base Qwen-Image-2.1-Turbo; cuantizacion SQ4 propietaria de Siliconed |
| Parametros totales | no disponible (modelo base reportado como 7B en su model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | SQ4, SQ5, SQ8 y BF16 mezclados: 184 lineales SQ4, 32 SQ5, 7 SQ8, 2 BF16; media de 4,72 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors con tensores SQ propietarios (`.sq.codes`, `.sq.groups`, `.sq.scale`); no es GGUF |
| Tamano del fichero | 4.385.824.160 bytes (4,39 GB) |
| Tensores no cuantizados | 74 tensores BF16 copiados bit a bit del publicador |
| Repositorio | 4,4 GB |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer (DiT) de Qwen-Image-2.1-Turbo, la variante "Turbo" de la familia Qwen-Image-2.1, orientada a generación y edición de imágenes con pocos pasos de denoising. Sobre ese transformer, esta conversión aplica una cuantización post-entrenamiento propietaria: cada matriz lineal W de tamaño [N, K] (K múltiplo de 256) se rota con una transformación Hadamard block-diagonal R_K (un R256 por cada 256 características de entrada contiguas, con R256 = (H4⊗H4⊗H4⊗H4)/16), simétrica e involutiva. Tras la rotación, los pesos se agrupan en bloques de 16 elementos consecutivos por fila, cada uno con un byte de grupo que codifica un multiplicador m y un sesgo b, de modo que cada código decodifica a un entero exacto en [−128, 127]. Cada fila de salida lleva una única escala float32.

La innovación técnica frente a GGUF Q4_K es que este último lleva una escala float cada 32 pesos, obligando a fragmentar la reducción sobre K en sumas parciales de 32 elementos; SQ mantiene una sola escala float por fila, de modo que toda la reducción puede ejecutarse como un producto int8×int8 (con activaciones rotadas y cuantizadas por token) o float×int8, ruta que Siliconed ya implementa en Metal. Los grupos de 16 pesos y la rotación Hadamard compensan la escala más gruesa. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre si hubo RLHF/DPO; esta conversión no reentrena, solo cuantiza.

## Capacidades

- Generación de imágenes text-to-image mediante el pipeline de Siliconed.
- Edición de imágenes: el modelo base Qwen-Image-2.1 soporta generación y edición unificadas, con múltiples referencias, control local y fidelidad según la documentación de Alibaba Cloud.
- Transparencia nativa en las imágenes generadas, según la documentación del modelo base.
- Funcionamiento con pocos pasos de denoising (variante Turbo); el autor reporta renders a 8 pasos.
- Inferencia exclusiva en Apple Silicon mediante Metal a través de la aplicación Siliconed.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo de imagen, no de lenguaje.
- Capacidades multilingües: no disponible (no se documenta el comportamiento del text encoder, que Siliconed toma del publicador original).

## Casos de uso

- Generación de imágenes en Mac con memoria unificada limitada: el fichero de 4,39 GB permite ejecutar un DiT de ~7B en equipos donde el bf16 de 14,23 GB no cabría con comodidad, con un pico de memoria de 11.955 MB medido en un Mac mini M5 Pro de 64 GB.
- Sustitución de GGUF Q4_K_M en flujos Siliconed: para usuarios que ya usan la versión Light de Siliconed, este fichero reemplaza al Q4_K_M con menor error de cuantización y una ruta Metal rápida (21,33 s por render a 1024² frente a los 22,04 s del int8 Compact).
- Prototipado de generación de imágenes en local para desarrolladores que trabajan en ecosistema Apple y quieren evitar servicios en la nube, con licencia qwen-research que debe revisarse antes de uso comercial.
- Evaluación de técnicas de cuantización: el modelo card documenta el error relativo por canal frente al valor exacto (testigo float64 o oráculo float32), lo que lo hace útil como referencia para comparar formatos de cuantización en DiTs.
- Generación de imágenes con transparencia nativa para assets de interfaz o composición, aprovechando la capacidad del modelo base.
- Edición de imágenes con múltiples referencias en local, si se combina con el resto del pipeline de Siliconed (text encoder y VAE tomados de sus publicadores).

## Benchmarks y rendimiento

El autor reporta error relativo por canal (peor canal / canal mediano) frente al valor exacto, comparando SQ4 con GGUF Q4_K_M de unsloth:

| Punto | Valor exacto | Q4_K_M | SQ4 |
|---|---|---:|---:|
| 512, seed 0 | testigo fp64 | 0,0580 / 0,0270 | 0,0391 / 0,0214 |
| 1024, seed 0, prompt 1 | oráculo fp32 | 0,0739 / 0,0322 | 0,0629 / 0,0237 |
| 768×512, seed 0, prompt 1 | oráculo fp32 | 0,0706 / 0,0440 | 0,0483 / 0,0208 |
| 512, seed 1, prompt 2 | oráculo fp32 | 0,0644 / 0,0362 | 0,0505 / 0,0291 |
| 512, seed 2, prompt 3 | oráculo fp32 | 0,1027 / 0,0371 | 0,0412 / 0,0223 |
| 512, seed 3, prompt 1 | oráculo fp32 | 0,0565 / 0,0299 | 0,0539 / 0,0246 |
| 1024, seed 1, prompt 2 | oráculo fp32 | 0,0847 / 0,0419 | 0,0736 / 0,0337 |
| 1024, seed 2, prompt 3 | oráculo fp32 | 0,1050 / 0,0454 | 0,0801 / 0,0241 |
| 1024, seed 3, prompt 1 | oráculo fp32 | 0,0874 / 0,0376 | 0,0490 / 0,0215 |
| 768×512, seed 1, prompt 2 | oráculo fp32 | 0,0591 / 0,0309 | 0,0490 / 0,0279 |
| 768×512, seed 2, prompt 3 | oráculo fp32 | 0,0820 / 0,0406 | 0,0485 / 0,0251 |
| 768×512, seed 3, prompt 1 | oráculo fp32 | 0,0530 / 0,0289 | 0,0395 / 0,0203 |

SQ4 es más cercano al valor exacto que Q4_K_M en los 12 puntos, tanto en el peor canal como en el mediano. A nivel de capa, el error de SQ4 es menor que el de Q4_K_M en las 225 capas lineales evaluadas.

Rendimiento en Siliconed (Mac mini M5 Pro, 64 GB, render 1024², 8 pasos, seed 42, un render por configuración):

| Transformer | Fichero | Render | Pico de memoria |
|---|---:|---:|---:|
| SQ4 (Light) | 4,39 GB | 21,33 s | 11.955 MB |
| int8 convrot (Compact) | 7,26 GB | 22,04 s | 14.624 MB |
| GGUF Q4_K_M | 4,20 GB | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: pico de 11.955 MB medido en un render 1024² con 8 pasos en Mac mini M5 Pro de 64 GB de memoria unificada. El fichero ocupa 4,39 GB en disco.
- GPU recomendadas: Apple Silicon con soporte Metal; el autor reporta mediciones en M5 Pro. No hay datos para otras GPU (A100, H100, RTX 4090) porque el formato solo lo lee Siliconed, que es exclusivo de Apple Silicon.
- Cabe en consumer GPU: sí, en equipos Apple Silicon con memoria unificada suficiente (los 11,9 GB de pico sugieren que 16 GB podrían ser ajustados; el autor solo documenta 64 GB).
- Opciones de despliegue: exclusivamente la aplicación Siliconed (versión 0.21 en adelante). No carga en diffusers, ComfyUI, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 21,33 s por render 1024² a 8 pasos en M5 Pro; ligeramente más rápido que el int8 Compact (22,04 s) con menos memoria. No hay datos de throughput para otras resoluciones o pasos.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Bits/peso | Error vs exacto | Licencia | Compatibilidad |
|---|---|---:|---:|---|---|---|
| SQ4 (este) | SQ propietario | 4,39 GB | 4,72 | Menor que Q4_K_M en 225/225 capas y 12/12 puntos | qwen-research | Solo Siliconed |
| GGUF Q4_K_M (unsloth) | GGUF | 4,20 GB | ~4,5 | Mayor que SQ4 en todos los puntos medidos | qwen-research | llama.cpp y derivados |
| int8 convrot (Comfy-Org) | safetensors int8 | 7,26 GB | 8 | No disponible | qwen-research | ComfyUI, Siliconed |
| bf16 original (Qwen) | safetensors | 14,23 GB | 16 | Referencia | qwen-research | diffusers, Siliconed |

## Limitaciones y advertencias

- Formato propietario: no es GGUF ni safetensors estándar; solo lo lee Siliconed. No hay interoperabilidad con diffusers, ComfyUI, vLLM ni otras herramientas.
- Dependencia de la aplicación: el decodificador está en `Sources/Siliconed/SQ.swift` y es de código abierto con la app, pero el ecosistema es mínimo (0 descargas, 0 likes en el momento de la ficha).
- El repositorio no incluye el text encoder ni el VAE; Siliconed los toma de sus publicadores, lo que añade dependencias externas.
- Licencia qwen-research: restringe el uso comercial. Debe revisarse el fichero LICENSE antes de cualquier despliegue en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; el modelo base hereda los sesgos de sus datos de entrenamiento, no descritos aquí.
- Idiomas soportados: no disponibles; el comportamiento multilingüe depende del text encoder externo.
- El error de cuantización es medido con prompts y seeds disjuntos de la calibración, pero solo sobre 12 puntos de evaluación; no hay benchmarks estándar de calidad de imagen (FID, CLIP) que permitan comparar con el modelo completo.
- El rendimiento reportado corresponde a un único render por configuración en un solo equipo (Mac mini M5 Pro); no hay datos de variabilidad ni de otros hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gwenn-ha-dev/Qwen-Image-2.1-Turbo-Siliconed-SQ4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio de Siliconed: https://github.com/gwenn-ha-dev/Siliconed
- Documentación de Alibaba Cloud Model Studio: https://www.alibabacloud.com/help/en/model-studio/qwen-image-2-1-turbo
- GGUF Q4_K_M de referencia: https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-GGUF
- int8 convrot de Comfy-Org: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
