# me-tantan/petiteAnima

## Resumen

petiteAnima es una herramienta local gratuita para Windows que permite generar imágenes a partir de texto en japonés, desarrollada por el usuario me-tantan. Combina el modelo de difusión Anima (derivado de Cosmos-Predict2-2B de NVIDIA) cuantizado a GGUF con el backend stable-diffusion.cpp, e incorpora un sistema de traducción automática japonés-inglés basado en el modelo Hy-MT2-1.8B ejecutado con llama.cpp. El objetivo principal es ofrecer una solución de generación de imágenes por IA que funcione sin conexión, con requisitos de hardware modestos (VRAM 4 GB) y sin necesidad de instalar Python o Git.

El modelo base Anima, desarrollado por CircleStone Labs, es un modelo de difusión texto-a-imagen de 2,09 mil millones de parámetros que utiliza un text encoder basado en Qwen3-0.6B-Base. petiteAnima lo distribuye en formato GGUF cuantizado (q6_K) para reducir el consumo de memoria, e incluye una interfaz gráfica propia, soporte para LoRA, funciones de upscaling y la posibilidad de usar modelos derivados de Anima. Su relevancia radica en democratizar la generación de imágenes IA en entornos con GPUs de gama baja o integradas, algo poco habitual en este tipo de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (basado en Anima / Cosmos-Predict2-2B) |
| Parametros totales | 2.091.068.928 (2,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (text encoder Qwen3-0.6B-Base, contexto no especificado) |
| Tipos de cuantizacion | GGUF (incluye q6_K; se pueden generar otras con el batch proporcionado) |
| Idiomas soportados | Japones (interfaz y traduccion), ingles (prompts) |
| Licencia | MIT (repositorio) + CircleStone Non-Commercial License (modelo base Anima) |
| Formato de pesos | GGUF (modelo cuantizado), safetensors (modelos derivados) |

## Arquitectura y entrenamiento

petiteAnima no es un modelo independiente, sino una distribucion empaquetada del modelo Anima en su version v1.0, cuantizado a GGUF mediante stable-diffusion.cpp. Anima es un modelo de difusion para generacion de imagenes que deriva de Cosmos-Predict2-2B-Text2Image de NVIDIA, y utiliza un text encoder basado en Qwen3-0.6B-Base. No se dispone de informacion detallada sobre el proceso de entrenamiento de Anima (numero de tokens, composicion del dataset, uso de RLHF o DPO). La cuantizacion a GGUF se realiza con las herramientas incluidas en el paquete, y el sistema de traduccion japonés-ingles emplea el modelo Hy-MT2-1.8B de Tencent, ejecutado con llama.cpp.

## Capacidades

- Generacion de imagenes a partir de prompts en ingles o japones (con traduccion automatica integrada).
- Soporte de LoRA: permite cargar LoRA externos y ya incluye tres LoRA preinstalados (turbo para aceleracion, estilo figura tipo PVC y estilo fotorealista).
- Funciones de upscaling y mejora de calidad: Hires.fix y tres upscalers (RealESRGAN anime, 4x-UltraSharp y 4x_foolhardy_Remacri).
- Compatibilidad con modelos derivados de Anima en formato safetensors, con conversion automatica a GGUF para GPUs con menos de 6 GB de VRAM.
- Ejecucion completamente local y sin conexion a internet.
- Interfaz grafica propia, sencilla y en japones.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser exclusivamente un generador de imagenes.

## Casos de uso

- Ilustracion y arte digital para aficionados: un usuario puede escribir una descripcion en japones, traducirla automaticamente y generar ilustraciones de alta calidad sin depender de servicios en la nube ni de una GPU potente.
- Creacion de concept art para proyectos personales: disenadores y desarrolladores independientes pueden generar bocetos rapidos de personajes, escenarios u objetos para videojuegos o novelas visuales, gracias al soporte de LoRA que permite ajustar el estilo.
- Generacion de avatares y perfiles: con los LoRA de estilo figura o realista, se pueden crear avatares personalizados para redes sociales, foros o entornos virtuales, con la ventaja de que las imagenes generadas son de uso comercial (segun la licencia de Anima).
- Prototipado visual para presentaciones: equipos de marketing o educacion pueden generar imagenes de ejemplo para ilustrar conceptos en diapositivas o materiales didacticos, sin necesidad de contratar ilustradores.
- Entornos con hardware limitado: instituciones educativas o usuarios con portatiles antiguos (por ejemplo, con Intel UHD Graphics 630) pueden ejecutar la herramienta, aunque con tiempos de generacion elevados, lo que la hace util para demostraciones en aulas.
- Generacion de imagenes para juegos indie: desarrolladores de juegos pequenos pueden producir assets visuales (fondos, objetos, texturas) de forma local, aprovechando la funcion de upscaling para obtener resoluciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM minima: 4 GB (probado con Radeon RX 6500 XT e Intel Arc A310, aunque con rendimiento lento).
- VRAM recomendada: 6 GB o mas (probado con GeForce RTX 4070 y Radeon RX 9060 XT).
- GPUs compatibles: cualquier GPU con soporte Vulkan; si es GeForce, se puede usar el backend CUDA12 (excepto modelos muy antiguos como GTX 970, que requieren Vulkan).
- RAM: 16 GB o mas.
- Almacenamiento: 8 GB de espacio libre en SSD (tambien funciona en HDD o USB).
- Sistema operativo: Windows 10/11.
- CPU: sin requisitos estrictos, aunque CPUs antiguas pueden fallar.
- Despliegue: la herramienta incluye backends precompilados de stable-diffusion.cpp (Vulkan o CUDA12) y llama.cpp (para traduccion). No requiere instalacion de Python ni Git; basta con descomprimir el zip y ejecutar `start.bat`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| petiteAnima (Anima v1.0 GGUF) | 2,09 B | No disponible | No comercial (CircleStone) | GGUF | Incluye traduccion JA-EN y GUI |
| Anima (original) | 2,09 B | No disponible | No comercial (CircleStone) | safetensors | Modelo base sin empaquetado |
| Cosmos-Predict2-2B-Text2Image | 2 B | No disponible | NVIDIA Open Model License | safetensors | Modelo original del que deriva Anima |
| SDXL | 3,5 B | No disponible | OpenRAIL++ | safetensors | Modelo de difusion mas grande, no compatible con petiteAnima |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base Anima esta sujeto a la CircleStone Non-Commercial License, por lo que petiteAnima no puede utilizarse con fines comerciales. Las imagenes generadas si son de uso comercial, pero con responsabilidad del usuario.
- Solo Windows: la herramienta esta diseñada exclusivamente para Windows 10/11; no hay versiones para Linux o macOS.
- Compatibilidad limitada: solo funciona con modelos derivados de Anima; no soporta SDXL, Z-image ni Anima-2.9B.
- Riesgo de sesgos y alucinaciones visuales: como cualquier modelo de generacion de imagenes, puede producir resultados inesperados, distorsionados o con sesgos de genero, raza o cultura, especialmente con prompts ambiguos.
- Dependencia de la traduccion automatica: la calidad de la traduccion japonés-ingles puede afectar a la fidelidad de la imagen generada; errores de traduccion pueden llevar a resultados no deseados.
- Rendimiento variable: en GPUs integradas o con 4 GB de VRAM, los tiempos de generacion pueden ser muy elevados (el autor reporta "muy lento" en Intel UHD 630).
- Requiere Visual C++ Runtime: es necesario instalar `vc_redist.x64.exe` si no esta presente en el sistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/me-tantan/petiteAnima
- Modelo base Anima (HuggingFace): https://huggingface.co/circlestone-labs/Anima
- Modelo base Anima (Civitai): https://civitai.com/models/2458426/anima
- Backend de generacion stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Backend de traduccion llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo de traduccion Hy-MT2-1.8B-GGUF: https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF
- Text encoder Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- LoRA estilo figura (Anima PVC Style): https://civitai.red/models/2633648/anima-pvc-style
- LoRA estilo realista (A-real anima photorealistic): https://civitai.com/models/2639613/a-real-anima-photorealistic
- Upscaler RealESRGAN: https://github.com/xinntao/Real-ESRGAN
- Upscaler 4x-UltraSharp: https://openmodeldb.info/models/4x-UltraSharp
- Upscaler 4x_foolhardy_Remacri: https://openmodeldb.info/models/4x-Remacri
- Licencia de Anima (CircleStone): https://huggingface.co/circlestone-labs/Anima/blob/main/LICENSE.md
