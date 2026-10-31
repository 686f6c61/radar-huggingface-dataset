# PedroMarinhoDev/Idol-ComfyUI

## Resumen

Idol-ComfyUI es una conversión del modelo Idol de speridlabs para su uso nativo en ComfyUI mediante los nodos TripoSplat. Se trata de un sistema de generación de 3D a partir de una única imagen (image-to-3d): recibe una fotografía de un objeto y produce un splat gaussiano 3D completo de hasta 1.048.576 Gaussians, incluyendo las caras del objeto que no aparecen en la imagen original. La arquitectura subyacente es TripoSplat, desarrollada por VAST.

Esta conversión, creada por PedroMarinhoDev, no es un envoltorio del SDK oficial: los pesos se han reorganizado para cargar directamente en los nodos nativos de ComfyUI (Load Diffusion Model, KSampler y TripoSplat Decode), lo que permite aprovechar la gestión de memoria de ComfyUI y su ecosistema de nodos. El repositorio pesa 4,0 GB e incluye pesos en fp32 y fp16.

Es relevante porque reduce la barrera de entrada a la generación 3D con gaussian splatting: con unos 6 GB de VRAM y ComfyUI 0.43 o superior, es posible generar activos 3D a partir de una imagen en una GPU de consumo, sin depender de servicios externos ni de instalaciones complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TripoSplat (difusión + decodificadores octree y gaussian splatting) |
| Parametros totales | no disponible (denoiser: 1,48 GB en fp32 / 0,74 GB en fp16; decodificador VAE: 1,15 GB en fp32 / 0,58 GB en fp16) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo image-to-3d) |
| Tipos de cuantizacion | fp32 y fp16 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Componentes auxiliares utilizados: DINOv3 ViT-H+/16 (codificación de la imagen de entrada), VAE de FLUX.2 y BiRefNet (eliminación de fondo), todos reutilizados de VAST-AI/TripoSplat.

## Arquitectura y entrenamiento

El sistema sigue la arquitectura TripoSplat de VAST: una imagen de entrada se procesa mediante DINOv3 ViT-H+/16 y el VAE de FLUX.2, se elimina el fondo con BiRefNet, y un denoiser de difusión genera una representación latente que se decodifica en dos etapas: un decodificador de octree (estructura espacial) y un decodificador de gaussian splatting (apariencia), combinados en un único fichero en esta conversión bajo los prefijos `octree.` y `gs.`. El resultado es un splat gaussiano de hasta 1.048.576 Gaussians que reconstruye el objeto completo, incluidas las vistas ocluidas.

Sobre el entrenamiento del modelo original no se han publicado detalles en la información disponible (número de tokens o imágenes, composición del dataset, RLHF/DPO no aplicables). En cuanto a la conversión: los tensores son idénticos a los de la versión original de speridlabs/idol; se ha eliminado la codificación posicional almacenada del denoiser (`pos_pe`) porque ComfyUI calcula la misma secuencia Sobol barajada (el conversor verifica la equivalencia), y los dos decodificadores se han fusionado en un fichero. La validación reporta un error relativo de 3,5e-6 en un forward del denoiser en fp32 frente al SDK de referencia y de 9e-5 en los decodificadores.

## Capacidades

- Generación de activos 3D completos (splats gaussianos) a partir de una única imagen de un objeto.
- Reconstrucción de vistas no observadas: el modelo infiere las caras del objeto que no aparecen en la fotografía.
- Hasta 1.048.576 Gaussians por splat; la demostración oficial usa 262.144 Gaussians como configuración por defecto.
- Integración nativa con ComfyUI 0.43+: nodos propios, plantilla lista (`idol_image_to_splat`) y gestión de memoria de ComfyUI.
- Soporte de precisión fp32 y fp16 con resultados equivalentes a la precisión por defecto.
- Cámara de entrada configurable (Idol Input Camera): el turntable generado arranca desde el punto de vista de la imagen original.
- Pipeline auxiliar completo reutilizando DINOv3, FLUX.2 VAE y BiRefNet para segmentación de fondo.

No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni tool calling.

## Casos de uso

- Creación de activos para videojuegos indie: generar rápidamente maquetas 3D de props (cofres, figuras, plantas) a partir de imágenes conceptuales, para bloquear niveles antes de modelar a mano.
- Prototipado rápido en diseño de producto: convertir renders o fotos de un objeto en un splat 3D visualizable para presentaciones tempranas.
- E-commerce y catálogos 3D: generar vistas 360° de productos a partir de una sola fotografía de stock, sin sesiones de captura multiángulo.
- Flujos de trabajo generativos en ComfyUI: encadenar la generación de la imagen (por ejemplo con Krea 2 Turbo, como en los ejemplos oficiales) con Idol para pasar de prompt a splat 3D en un único grafo.
- Visualización y turntables: producir animaciones de rotación de objetos para redes sociales, fichas de producto o portfolios.
- Investigación en gaussian splatting: usar los pesos en formato ComfyUI como base para experimentos de reconstrucción single-image-to-3D sin implementar el SDK.
- Educación y demostraciones: montar talleres de IA generativa 3D con requisitos de hardware modestos (~6 GB de VRAM).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (PSNR, SSIM, LPIPS, etc.) en la información disponible. Los datos de rendimiento operativos facilitados por el autor son:

| Configuracion | Valor |
|---|---|
| Preset de referencia | idol_fp32, 262.144 Gaussians, 50 pasos, cfg 4, seed 42 |
| GPU usada en la demo | RTX 3090 |
| Error relativo del denoiser (fp32 vs SDK) | 3,5e-6 |
| Error relativo de los decodificadores (vs SDK) | 9e-5 |

## Requisitos de hardware

- VRAM estimada: unos 6 GB para inferencia según el autor del modelo.
- Cabe en GPUs de consumo: una RTX 3090 (24 GB) se usa en la demostración oficial; con ~6 GB de VRAM, GPUs como la RTX 3060 de 8 GB o superiores deberían ser suficientes (estimación basada en la cifra de 6 GB; no hay lista oficial de GPUs soportadas).
- Los ficheros ocupan: 1,48 GB (denoiser fp32) + 1,15 GB (decodificador fp32), o 0,74 GB + 0,58 GB en fp16; a esto hay que sumar DINOv3, el VAE de FLUX.2 y BiRefNet de VAST-AI/TripoSplat.
- Despliegue: exclusivamente vía ComfyUI 0.43 o superior con el pack de nodos ComfyUI-Idol (instalable desde ComfyUI-Manager, con `comfy node install comfyui-idol` o clonando en `custom_nodes`; no requiere pip install). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles (la demo usa 50 pasos de muestreo; no se publican tiempos por generación).

## Comparativa con modelos similares

| Modelo | Tarea | Formato de despliegue | Licencia | Comentario |
|---|---|---|---|---|
| Idol-ComfyUI (este) | Imagen a splat gaussiano (hasta 1,05M Gaussians) | Nodos nativos de ComfyUI (TripoSplat) | Apache-2.0 | ~6 GB de VRAM, sin SDK externo |
| speridlabs/idol (original) | Imagen a splat gaussiano | SDK propio (idol-sdk) | Apache-2.0 | Mismos tensores; requiere el SDK fuera de ComfyUI |
| VAST-AI/TripoSplat | Imagen a splat gaussiano | ComfyUI (nodos TripoSplat) | no disponible en la información facilitada | Arquitectura base sobre la que se construye Idol; comparte DINOv3, FLUX.2 VAE y BiRefNet |

## Limitaciones y advertencias

- Requiere ComfyUI 0.43 o superior y el pack de nodos ComfyUI-Idol; no funciona de forma independiente ni con otras librerías documentadas.
- Depende de tres modelos auxiliares de terceros (DINOv3 ViT-H+/16, VAE de FLUX.2, BiRefNet) que deben descargarse aparte de VAST-AI/TripoSplat.
- La salida es un splat gaussiano, no una malla (mesh): para pipelines que requieran geometría poligonal editable (por ejemplo, ciertos motores de juego) sería necesaria una conversión adicional no documentada aquí.
- La calidad de la reconstrucción de caras no visibles depende del contenido de la imagen; el modelo infiere geometría plausible, no verificada.
- En fp16 los decodificadores se han convertido por casting; la equivalencia exacta con fp32 solo está validada numéricamente (errores de 9e-5), lo que puede introducir diferencias sutiles en casos límite.
- Repositorio muy reciente con 0 descargas registradas en el momento de los datos: escaso historial de uso comunitario y sin benchmarks independientes.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar también los términos de los componentes auxiliares (DINOv3, FLUX.2 VAE, BiRefNet) y de la arquitectura TripoSplat de VAST.
- Alucinación geométrica: como en todo modelo generativo image-to-3D, las zonas ocluidas pueden contener detalles inventados que no corresponden al objeto real.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/PedroMarinhoDev/Idol-ComfyUI
- Modelo original: https://huggingface.co/speridlabs/idol
- Nodos ComfyUI-Idol (GitHub): https://github.com/PedroMarinhoDev/ComfyUI-Idol
- Idol SDK (GitHub): https://github.com/speridlabs/idol-sdk
- Componentes auxiliares: https://huggingface.co/VAST-AI/TripoSplat
- Web de speridlabs: https://speridlabs.com
