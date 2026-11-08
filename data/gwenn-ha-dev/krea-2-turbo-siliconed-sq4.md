# gwenn-ha-dev/Krea-2-Turbo-Siliconed-SQ4

## Resumen

Krea-2-Turbo-Siliconed-SQ4 es una cuantización de 4 bits del transformer (DiT) del modelo de generación de imágenes Krea 2 Turbo, publicado por Krea. La ha producido el desarrollador independiente gwenn-ha-dev dentro del proyecto Siliconed, una aplicación nativa de macOS para generación y edición de imágenes locales en Apple silicon. El modelo base cuenta con 12.900 millones de parámetros según la documentación del proyecto, y esta versión reduce el transformer a un único fichero de 7,57 GB frente a los 26,28 GB del bf16 original.

El problema que resuelve es concreto: el formato GGUF Q4_K_M disponible para Krea 2 Turbo no tenía una ruta rápida de ejecución en Siliconed, de modo que la variante Light de la app resultaba más lenta que el modelo bf16 completo. SQ4 introduce un formato de cuantización propio (4, 5 y 8 bits por capa lineal, 4,72 bits por peso de media) que se decodifica con una única escala float por fila de salida, lo que permite reducir toda la dimensión K en un solo producto escalar entero o float × int8 sobre Metal.

La relevancia es doble: por un lado demuestra que una cuantización de 4 bits puede superar en fidelidad numérica a Q4_K_M en las 261 capas lineales del transformer y en 12 de 16 puntos de evaluación de salida; por otro, es un formato cerrado a nivel de ecosistema, ya que solo Siliconed lo lee y no carga ni en diffusers ni en ComfyUI. No es un producto oficial de Krea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) del modelo base Krea 2 Turbo, cuantizado |
| Parametros totales | 12.900 millones (modelo base, segun la documentacion del proyecto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | SQ4: 4, 5 y 8 bits por capa lineal; 4,72 bits por peso de media (196 capas SQ4, 52 SQ5, 13 SQ8) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista declarada) |
| Licencia | krea-2-community-license (licencia propia de Krea, no estandar OSI) |
| Formato de pesos | safetensors con formato propietario SQ4; no es GGUF ni compatible con diffusers/ComfyUI |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer (DiT) de Krea con 12.900 millones de parámetros, orientado a generación text-to-image de alta calidad estética, desde fotografía hasta pintura. Esta ficha no ha recibido información sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos se consideran no disponibles.

La innovación de esta versión está en la cuantización, no en el entrenamiento. SQ4 aplica una rotación Hadamard fija (R256 = H4⊗H4⊗H4⊗H4 / 16, simétrica y autoinversa) sobre bloques de 256 features de entrada contiguas, agrupa los pesos en grupos de 16 a lo largo de K sin cruzar bloques de 256 y mantiene una única escala float por fila de salida. Cada código de grupo decodifica a un int8 exacto, de modo que la reducción completa sobre K se resuelve con un producto int8 × int8 (activaciones rotadas y cuantizadas por token) o float × int8. Los grupos de 16 pesos y la rotación de Hadamard compensan la escala más gruesa. Las 169 tensores restantes (todos F32) se copian bit a bit del modelo del editor. El text encoder y el VAE no están incluidos en el repositorio: Siliconed los toma de sus publicadores.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Generación con receta de 8 pasos de denoising, típica de los modelos Turbo.
- Resoluciones verificadas en la evaluación: 512×512, 768×512 y 1024×1024.
- Control de semilla para reproducibilidad (seeds 0 a 3 en la evaluación publicada).
- Ejecución local en Apple silicon con Metal, dentro de un presupuesto de memoria fijo.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, visión de entrada ni audio.
- Capacidades multilingües de prompt: no declaradas explícitamente; el modelo base acepta lenguaje natural, pero no hay lista de idiomas publicada.

## Casos de uso

- Generación de imágenes locales en Mac: el caso principal. Un Mac mini M5 Pro con 64 GB renderiza una imagen de 1024² en 8 pasos en 33,00 s con un pico de 11.709 MB, lo que permite trabajar con el modelo más grande de Siliconed en un equipo de sobremesa sin GPU dedicada.
- Edición de imágenes con IA en macOS: Siliconed soporta edición además de generación; este transformer es el componente de difusión que se usa en esos flujos, con el VAE y el text encoder tomados de sus publicadores.
- Prototipado de pipelines de cuantización: el formato SQ y su decodificador (`Sources/Siliconed/SQ.swift`) son código abierto, por lo que sirve como referencia para implementar rotación Hadamard + escalas por fila en otros motores Metal.
- Evaluación comparativa de cuantizaciones: el model card publica errores relativos por capa y por salida frente a fp64/fp32, útil para investigar el impacto de distintos esquemas de 4 bits en modelos de difusión.
- Generación por lotes en equipos con memoria limitada: al ocupar 11,7 GB de pico frente a 18,2 GB del int8 convrot de Comfy-Org, permite lotes mayores o resolución superior en máquinas de 16-32 GB.
- Sustitución del GGUF Q4_K_M en Siliconed: reemplaza al fichero `vantagewithai/Krea-2-Turbo-GGUF` (7,49 GB) con mejor fidelidad y una ruta de ejecución rápida en la app.

## Benchmarks y rendimiento

El model card no publica benchmarks estándar (FID, CLIP score, MMLU, etc.). Publica una evaluación de error relativo del transformer frente al valor exacto (testigo fp64 del pipeline de diffusers o oráculo fp32 sobre los pesos bf16 del editor), expresada como peor canal / canal mediano:

| Punto | Valor exacto | Q4_K_M | SQ4 (este fichero) |
|---|---|---:|---:|
| 512, seed 0 | testigo fp64 | 0,0768 / 0,0227 | 0,0743 / 0,0135 |
| 1024, seed 0 | testigo fp64 | 0,3310 / 0,0548 | 0,2125 / 0,0363 |
| 768×512, seed 0 | oráculo fp32 | 0,0940 / 0,0318 | 0,0860 / 0,0156 |
| 512, seed 0, step 4 | testigo fp64 | 0,1888 / 0,0322 | 0,1614 / 0,0193 |
| 512, seed 0, step 7 | testigo fp64 | 0,1077 / 0,0280 | 0,1137 / 0,0184 (peor) |
| 1024, seed 0, step 4 | testigo fp64 | 0,5161 / 0,0338 | 0,2610 / 0,0257 |
| 1024, seed 0, step 7 | testigo fp64 | 0,4078 / 0,0262 | 0,2988 / 0,0183 |
| 512, seed 1, prompt 2 | oráculo fp32 | 0,1469 / 0,0414 | 0,1513 / 0,0322 (peor) |
| 512, seed 2, prompt 3 | oráculo fp32 | 0,1908 / 0,0349 | 0,1412 / 0,0331 |
| 512, seed 3, prompt 1 | oráculo fp32 | 0,0851 / 0,0222 | 0,0400 / 0,0118 |
| 1024, seed 1, prompt 2 | oráculo fp32 | 0,2151 / 0,0531 | 0,2396 / 0,0488 (peor) |
| 1024, seed 2, prompt 3 | oráculo fp32 | 0,3629 / 0,0510 | 0,2900 / 0,0445 |
| 1024, seed 3, prompt 1 | oráculo fp32 | 0,3806 / 0,0546 | 0,3092 / 0,0411 |
| 768×512, seed 1, prompt 2 | oráculo fp32 | 0,2028 / 0,0419 | 0,2053 / 0,0510 (peor) |
| 768×512, seed 2, prompt 3 | oráculo fp32 | 0,1886 / 0,0453 | 0,0875 / 0,0295 |
| 768×512, seed 3, prompt 1 | oráculo fp32 | 0,0992 / 0,0317 | 0,0879 / 0,0264 |

SQ4 gana en el peor canal en 12 de 16 puntos y en el mediano en 15 de 16; pierde 4 puntos por factores de ×1,01 a ×1,11, dentro de la tolerancia del proyecto (+25 % del error de referencia). A nivel de capa, el error de SQ4 es menor que el de Q4_K_M en las 261 capas lineales.

Rendimiento medido en Siliconed sobre Mac mini M5 Pro, 64 GB, render de 1024² en 8 pasos con seed 42:

| Transformer | Fichero | Render | Pico de memoria |
|---|---:|---:|---:|
| SQ4 (Light) | 7,57 GB | 33,00 s | 11.709 MB |
| int8 convrot (Compact, Comfy-Org/Krea-2) | 13,49 GB | 33,00 s | 18.176 MB |
| GGUF Q4_K_M (vantagewithai) | 7,49 GB | no medido | no medido |

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea-2-Turbo-Siliconed-SQ4 | 12.900 M (base) | SQ4 propietario | 7,57 GB | no aplica | krea-2-community-license | Solo Siliconed |
| Krea-2-Turbo-GGUF (vantagewithai) | 12.900 M (base) | GGUF Q4_K_M | 7,49 GB | no aplica | krea-2-community-license | llama.cpp y derivados |
| Krea 2 int8 convrot (Comfy-Org) | 12.900 M (base) | int8 | 13,49 GB | no aplica | krea-2-community-license | ComfyUI |
| Krea 2 Turbo bf16 (krea) | 12.900 M | safetensors bf16 | 26,28 GB | no aplica | krea-2-community-license | diffusers y otros |

En fidelidad numérica, SQ4 supera a Q4_K_M en 12 de 16 puntos de salida y en las 261 capas. En velocidad, empata con el int8 convrot (33,00 s) usando un 36 % menos de memoria pico. Frente al bf16, reduce el tamaño del transformer en un 71 %.

## Limitaciones y advertencias

- Formato cerrado: solo Siliconed lee SQ4. No carga en diffusers, ComfyUI ni llama.cpp, y no hay convertidores publicados.
- El repositorio contiene únicamente el transformer; el text encoder y el VAE deben obtenerse de sus publicadores por separado.
- Licencia krea-2-community-license: no es una licencia open source estándar. Cualquier uso comercial debe revisarse contra el PDF de la licencia enlazado en el repositorio, que puede imponer restricciones de atribución o de uso.
- Es una versión modificada y no oficial: no está respaldada por Krea. El nombre debe empezar por «Krea» por exigencia de la licencia de derivados.
- Sin datos de sesgos, alucinación visual ni limitaciones idiomáticas publicados en la información disponible.
- La evaluación de fidelidad es interna del proyecto (error relativo frente a fp64/fp32), no un benchmark estándar de calidad de imagen; no hay FID ni CLIP score.
- Rendimiento medido en un único equipo (Mac mini M5 Pro, 64 GB) y con un solo render por configuración; no hay datos de latencia en otros chips.
- El modelo base puede generar contenido sesgado o inapropiado según el prompt; no se documentan filtros de seguridad en esta versión.
- Requiere Apple silicon (M1 o posterior) y Metal; no hay ruta de ejecución en CUDA ni en CPU genérica.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11.709 MB de pico en un render de 1024² con 8 pasos (medido). El fichero ocupa 7,57 GB en disco.
- Cabe en Mac con 16 GB de memoria unificada: el proyecto declara que la app se mantiene dentro de un presupuesto de 10 GB en un equipo de 16 GB para el modelo completo en fp32, y este transformer SQ4 usa menos memoria que el int8 convrot.
- GPU recomendadas: Apple silicon M1 o posterior; el rendimiento medido es en M5 Pro con 64 GB. No hay soporte para A100, H100 ni RTX 4090.
- Opciones de despliegue: exclusivamente la app Siliconed (macOS, Swift + Metal). No hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 33,00 s por imagen de 1024² en 8 pasos en M5 Pro; no se publican datos de otras resoluciones ni de generación por lotes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gwenn-ha-dev/Krea-2-Turbo-Siliconed-SQ4
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio de Siliconed: https://github.com/gwenn-ha-dev/Siliconed
- Sitio web de Siliconed: https://gwenn-ha-dev.github.io/Siliconed/
- Licencia (PDF): https://huggingface.co/gwenn-ha-dev/Krea-2-Turbo-Siliconed-SQ4/blob/main/LICENSE.pdf
- GGUF Q4_K_M de referencia: https://huggingface.co/vantagewithai/Krea-2-Turbo-GGUF
- Cuantización int8 convrot de Comfy-Org: https://huggingface.co/Comfy-Org/Krea-2
