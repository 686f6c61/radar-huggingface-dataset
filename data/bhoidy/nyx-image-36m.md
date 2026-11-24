# Bhoidy/nyx-image-36m

## Resumen

Nyx Image 36M (también denominado Nyx-2, con clase interna `NyxRGBAHourglassDiT`) es un modelo de generación texto-a-imagen de 35,99 millones de parámetros desarrollado por Bhoidy (Sednium Technologies) especializado en la síntesis nativa de sprites pixel art de 32×32 píxeles con canal alfa. Forma parte de una familia de dos generaciones junto a Nyx Image 26M, un modelo de difusión discreta enmascarada que genera sprites de 16×16. Ambos están publicados con licencia Apache-2.0 y pesos en safetensors y ONNX, orientados a inferencia en hardware de borde y en navegador mediante WebGPU.

El modelo resuelve un problema concreto: la generación de assets gráficos para videojuegos con bordes de píxel nítidos y transparencia binaria estricta, sin los artefactos de antialiasing que introducen los pipelines basados en VAE latente. Para ello prescinde de la compresión latente continua y opera directamente en espacio de píxeles, con un transformer en forma de U (U-ViT) con tallo de píxeles y fusiones de skip multiescala.

Su relevancia actual radica en el tamaño: por debajo de 40M de parámetros, es viable ejecutarlo en GPUs de consumo, en el navegador y en dispositivos de borde, algo poco habitual en modelos de difusión texto-a-imagen. La ficha se centra en la variante de 36M, aunque se incluyen datos comparativos de la de 26M cuando la información lo permite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-ViT (transformer en forma de U) con tallo de píxeles y fusiones de skip multiescala; formulación de Rectified Flow continuo |
| Parametros totales | 35.989.840 (35,99M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens de texto (condicionamiento SigLIP Base Patch16-224, 768 dimensiones); resolución de imagen nativa 32×32 (1.024 píxeles) |
| Tipos de cuantizacion | No disponible (se publican pesos safetensors y ONNX; no se documentan cuantizaciones específicas) |
| Idiomas soportados | No disponible (el condicionamiento textual usa SigLIP, orientado a inglés; no se declaran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y ONNX |
| Resolucion nativa | 32×32 RGBA |
| Representacion de color | 4 canales RGBA continuos (sin paleta discreta) |
| Muestreo | Solver ODE Heun de segundo orden, 30 pasos, CFG 4.0 en intervalo [0.0, 0.75] |
| Codificador de texto | SigLIP Base Patch16-224 congelado (768-dim, 32 tokens) |
| Dataset de entrenamiento | azyg0s/pixelart-172k (172K elementos) |
| Pasos de entrenamiento | 90.000 pasos (133,7 épocas) |
| Optimizador | AdamW con Warmup-Stable-Decay (WSD): 1.500 de warmup, meseta estable, decaimiento coseno del 15% |

## Arquitectura y entrenamiento

Nyx Image 36M es un transformer de difusión con topología U-ViT: un tallo que procesa directamente los píxeles de entrada (sin VAE) y fusiones de skip multiescala entre el codificador y el decodificador. La formulación de difusión es Rectified Flow continuo, que regresiona un campo de velocidades v = ε − x₀ en lugar de predecir ruido o score de forma clásica. El muestreo se realiza con un solver ODE de Heun de segundo orden a 30 pasos, con CFG de escala 4.0 aplicada solo en el intervalo [0.0, 0.75] para desactivar la guía incondicional cerca de los datos limpios.

El condicionamiento textual proviene de un SigLIP Base Patch16-224 congelado (768 dimensiones, 32 tokens), lo que supone un 50% más de anchura de embedding que el CLIP ViT-B/32 usado en la generación de 26M. Las prompts se envuelven en la plantilla `"pixel art icon of a <prompt>"` para alinearse con la distribución de entrenamiento. La transparencia se modela con alfa binario (A ∈ {−1, +1}) y RGB = 0 en las zonas transparentes, evitando flecos en los bordes. El entrenamiento se realizó sobre el dataset azyg0s/pixelart-172k durante 90.000 pasos (133,7 épocas) con AdamW y un schedule Warmup-Stable-Decay. No se documenta en la información disponible el uso de RLHF, DPO ni fine-tuning por preferencias.

## Capacidades

- Generación texto-a-imagen de sprites pixel art nativos a 32×32 píxeles con canal alfa.
- Salida RGBA con transparencia binaria estricta, adecuada para su uso directo como asset de juego.
- Preservación de bordes de píxel nítidos al operar en espacio de píxeles sin VAE latente.
- Condicionamiento textual mediante SigLIP Base con 32 tokens de contexto.
- Inferencia determinista mediante solver ODE Heun de segundo orden.
- Exportación a ONNX y ejecución en navegador vía WebGPU (según los Spaces publicados).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de iconos y sprites para videojuegos indie: el modelo produce assets de 32×32 con alfa binario listos para importar en motores como Godot o Unity, sin necesidad de recortar fondos ni limpiar bordes.
- Prototipado rápido de assets en Game Jams: al ejecutarse en navegador vía WebGPU y pesar menos de 40M de parámetros, permite iterar visualmente sobre prompts sin infraestructura GPU dedicada.
- Herramientas de creación asistida dentro de editores de píxeles: integración como generador de borradores que el artista retoca, aprovechando la plantilla de prompt `"pixel art icon of a <prompt>"` para resultados consistentes.
- Generación por lotes de variaciones de un mismo objeto (por ejemplo, distintos colores de un escudo) usando distintas semillas con el mismo solver determinista, útil para poblar catálogos de items.
- Aplicaciones educativas o demos interactivas de difusión: su tamaño reducido y su formulación Rectified Flow lo hacen adecuado para explicar y experimentar con modelos generativos en entornos con recursos limitados.
- Despliegue en dispositivos de borde o entornos sin GPU de datacenter: la exportación ONNX y el bajo número de parámetros permiten ejecución en portátiles y equipos de gama media para generación de iconografía pixel art.
- Generación de assets para interfaces retro o temas visuales: iconos de 32×32 con transparencia para menús, HUD o tiendas dentro de juegos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Tarea | Dataset | Metrica | Valor |
|---|---|---|---|---|
| nyx-image-36m | Generación pixel art 32×32 | azyg0s/pixelart-172k | Validation Flow Loss | 0,08327 MSE |
| nyx-image-36m | Generación pixel art 32×32 | azyg0s/pixelart-172k | Unseen Split Loss | 0,10225 MSE |
| nyx-image-36m | Generación pixel art 32×32 | azyg0s/pixelart-172k | Parámetros | 35.989.840 |
| nyx-image-26m | Generación pixel art 16×16 | Angais/pixel-art-atlas-1.4m | Validation NLL | 0,87445 nats |
| nyx-image-26m | Generación pixel art 16×16 | Angais/pixel-art-atlas-1.4m | Masked Token Accuracy | 77,86% |
| nyx-image-26m | Generación pixel art 16×16 | Angais/pixel-art-atlas-1.4m | Parámetros | 26.335.232 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 35,99M de parámetros en precisión completa (FP32) los pesos ocupan aproximadamente 144 MB, y en FP16 alrededor de 72 MB, a lo que hay que sumar las activaciones y el codificador SigLIP congelado.
- GPU recomendadas: cualquier GPU moderna con soporte de WebGPU para la demo en navegador; para despliegue local, GPUs de consumo como RTX 3060/4060 en adelante son suficientes por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño sub-40M.
- Opciones de despliegue: exportación ONNX, ejecución en navegador vía WebGPU (Spaces publicados), y carga de pesos safetensors en frameworks de difusión compatibles. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Formulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nyx Image 36M | 35,99M | 32×32 RGBA | Rectified Flow continuo (U-ViT) | Apache-2.0 | Hugging Face, ONNX, WebGPU |
| Nyx Image 26M | 26,34M | 16×16 (paleta 512) | Difusión discreta enmascarada (MDLM) | Apache-2.0 | Hugging Face, ONNX, WebGPU |
| Modelos de difusión texto-a-imagen de propósito general (p. ej. Stable Diffusion) | Cientos de millones a miles de millones | 512×512 o superior | Difusión latente con VAE | Variable | Hugging Face |

La comparación con modelos de difusión de propósito general es cualitativa: Nyx Image 36M está especializado en pixel art de baja resolución y no compite en resolución ni en variedad de estilos. No se dispone de datos de benchmarks comparables con esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo genera pixel art a 32×32; no es adecuado para imágenes fotorrealistas, alta resolución ni otros estilos.
- Contexto textual limitado a 32 tokens mediante SigLIP, lo que restringe la complejidad de las prompts.
- Idiomas soportados no declarados; el codificador SigLIP está orientado principalmente al inglés, por lo que prompts en castellano pueden degradar la calidad.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir sprites incoherentes o con detalles incorrectos respecto al prompt.
- Sesgos: no se documentan análisis de sesgo; el dataset de pixel art puede reflejar sesgos de representación propios de su composición.
- Licencia Apache-2.0 permite uso comercial, pero los resultados declarados por el autor (pérdidas de validación) no están verificados de forma independiente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario mínimos.
- La transparencia binaria estricta puede no encajar en pipelines que esperan alfa continuo o antialiasing.
- No se documentan cuantizaciones oficiales ni recetas de despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bhoidy/nyx-image-36m
- Space WebGPU del 36M: https://huggingface.co/spaces/Bhoidy/nyx-image-36m
- Modelo 26M en Hugging Face: https://huggingface.co/Bhoidy/nyx-image-26m
- Space WebGPU del 26M: https://huggingface.co/spaces/Bhoidy/nyx-image-26m
- Sitio del desarrollador (Sednium Technologies): https://sednium.com
- Dataset azyg0s/pixelart-172k: https://huggingface.co/datasets/azyg0s/pixelart-172k
- Dataset Angais/pixel-art-atlas-1.4m: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
