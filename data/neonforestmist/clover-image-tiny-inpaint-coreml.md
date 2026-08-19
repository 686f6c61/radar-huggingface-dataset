# neonforestmist/Clover-Image-Tiny-Inpaint-CoreML

## Resumen

Clover Image Tiny Inpaint Core ML es una conversión a Core ML del modelo de inpainting Clover Image Tiny, desarrollado de forma independiente por Lukas Lozada Perez (neonforestmist). Se trata de un modelo compacto de la clase Stable Diffusion 1.4, diseñado para ejecutarse íntegramente en dispositivos Apple con iOS 18, sin necesidad de conexión a servidores. Su propósito es realizar inpainting (relleno de regiones enmascaradas) a resolución 512×512, con soporte para composición dinámica de hasta tres estilos artísticos mediante adaptadores LoRA.

La relevancia de este modelo radica en su optimización para el ecosistema Apple: el U-Net de producción utiliza compresión int8 simétrica por canal, reduciendo el peso del componente principal de 1,79 GB a 931 MB, mientras que los estados LoRA mutables se mantienen en FP16. El modelo comparte tokenizador, text encoder y decodificador VAE con la instalación principal de Clover, evitando descargas redundantes. Está pensado para aplicaciones de edición fotográfica local, con validación de paridad PyTorch/Core ML que supera el umbral de calidad establecido en 35 dB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de Stable Diffusion 1.4-class con adaptadores LoRA |
| Parametros totales | no disponible (modelo base SD 1.4-class, sin cifra publicada) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de imagen, resolución fija 512×512) |
| Tipos de cuantizacion | int8 simétrico por canal (U-Net de producción), FP16 (estados LoRA) |
| Idiomas soportados | no disponible (el text encoder no se especifica) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | Core ML (.mlmodelc), safetensors para adaptadores LoRA |

## Arquitectura y entrenamiento

El modelo base Clover Image Tiny Inpaint es un modelo de inpainting de la familia Stable Diffusion 1.4, con arquitectura de U-Net, text encoder y VAE. El checkpoint v2 fue seleccionado mediante barridos de destilación con profesor (teacher-distillation) para optimizar el seguimiento semántico de prompts, la reconstrucción y la fusión limpia de bordes de máscara. La versión Core ML mantiene la misma arquitectura pero compila los pesos al formato nativo de Apple, con el U-Net comprimido en int8 simétrico por canal y los adaptadores LoRA en FP16.

El pipeline de inpainting acepta una entrada de ruido latente (4 canales), una máscara (1 canal) y el latente de la imagen enmascarada (4 canales), totalizando 9 canales en un tensor de forma `[1, 9, 64, 64]`. La guía sin clasificador (classifier-free guidance) se ejecuta como dos pasadas seriales. El modelo expone 144 estados mutables de Core ML que permiten componer en tiempo de ejecución hasta tres estilos Clover, mediante un esquema de concatenación por bloques de sumas LoRA. El archivo `adapter-schema.json` mapea cada adaptador `.safetensors` a uno de los tres slots de estado independientes.

## Capacidades

- Inpainting de imágenes a resolución 512×512, donde las regiones en blanco de la máscara se regeneran y las negras se preservan.
- Composición simultánea de hasta tres estilos artísticos mediante adaptadores LoRA, con control de intensidad por estilo.
- Ejecución completamente local en dispositivos iOS 18, sin conexión a servidores.
- Integración con el pipeline de imagen a imagen (image-to-image) de Stable Diffusion.
- Soporte de guía sin clasificador (CFG) mediante dos pasadas seriales del U-Net.
- Compatibilidad con el ecosistema Core ML, incluyendo el Neural Engine de Apple para aceleración.
- Validación de paridad numérica con PyTorch, con PSNR superior a 59 dB en la configuración int8 de producción.

## Casos de uso

- Edición fotográfica en iPhone o iPad: el usuario pinta una máscara sobre un objeto no deseado y el modelo lo elimina o reemplaza de forma realista, todo en el dispositivo.
- Restauración de imágenes antiguas: se enmascaran zonas dañadas o manchas y el modelo reconstruye los detalles faltantes manteniendo la coherencia con el resto de la imagen.
- Cambio de estilo artístico localizado: aplicando adaptadores LoRA (por ejemplo, Monet, puntillismo o acuarela) sobre regiones concretas, se puede transformar el aspecto de una parte de la imagen sin alterar el fondo.
- Creación de variaciones de producto para catálogos: se enmascara el fondo de una fotografía de producto y el modelo genera un nuevo entorno o textura, útil para comercio electrónico.
- Prototipado rápido de conceptos visuales: diseñadores pueden reemplazar elementos de un boceto o render con alternativas generadas, evaluando opciones sin salir de la app.
- Aplicaciones de accesibilidad o asistencia visual: el modelo puede rellenar regiones de imágenes para mejorar la comprensión de escenas, siempre que se integre con una interfaz de usuario adecuada.

## Benchmarks y rendimiento

La model card reporta validación de paridad PyTorch/Core ML sobre entradas deterministas:

| Configuración | PSNR FP16 | PSNR int8 producción |
|---|---|---|
| U-Net base de inpainting HQ | 78,56 dB | 59,32 dB |
| Monet 0.70 + Pointillism 0.45 + Watercolor Anime 1.10 | 78,47 dB | 59,30 dB |

El umbral de liberación (release gate) es de 35 dB, por lo que ambas configuraciones lo superan ampliamente. Además, se evaluó la calidad de inpainting sobre 24 casos fuera del conjunto de entrenamiento, comparando con la versión anterior de Diffusers:

| Métrica | Versión anterior | Versión HQ |
|---|---|---|
| Similitud CLIP del prompt enmascarado | 0,2642 | 0,2768 |
| MAE del objetivo enmascarado | 0,2510 | 0,2231 |
| Píxeles cambiados fuera de la máscara | 0 | 0 |

No se han publicado resultados de benchmarks estándar como MMLU o HumanEval, al tratarse de un modelo de visión.

## Requisitos de hardware

- Sistema operativo mínimo: iOS 18.
- Resolución de trabajo: 512×512.
- El repositorio completo ocupa 5,1 GB, pero el U-Net de producción comprimido pesa 931 MB (frente a 1,79 GB sin comprimir).
- Se requiere un dispositivo Apple con soporte para Core ML y Neural Engine (iPhone, iPad o Mac con chip Apple Silicon).
- No se especifican requisitos de VRAM, al estar diseñado para el entorno Core ML, que gestiona la memoria de forma automática.
- Opciones de despliegue: integración directa en apps iOS mediante Core ML; el modelo no está pensado para servidores ni para vLLM, llama.cpp u otras herramientas de inferencia de texto.
- La latencia y el throughput dependen del dispositivo concreto; no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados frente a otros modelos de inpainting en el mismo formato Core ML. Como referencia cualitativa, se puede comparar con:

- **Stable Diffusion Inpainting (Runway)**: modelo de inpainting de la familia SD 1.5, disponible en PyTorch y Core ML, pero sin la optimización específica para composición de estilos múltiples ni la compresión int8 por canal.
- **FLUX.1 Fill (Black Forest Labs)**: modelo de inpainting más reciente y de mayor tamaño, pero no está optimizado para iOS ni tiene una versión Core ML oficial.
- **La versión Diffusers de Clover Image Tiny Inpaint**: el propio modelo base, que sirve como referencia de calidad; la versión Core ML mantiene la paridad con una pérdida de PSNR de unos 19 dB en int8, pero con una reducción de peso significativa.

La comparativa cuantitativa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Resolución fija de 512×512; no se admite generación a otras resoluciones sin reescalado previo.
- Requiere iOS 18 o superior; no es compatible con versiones anteriores del sistema operativo.
- El safety checker no se construye en el pipeline de Clover iOS, por lo que el modelo puede generar contenido inapropiado si se le solicita explícitamente.
- La licencia CreativeML Open RAIL-M permite uso comercial, pero impone restricciones sobre usos ilegales o dañinos; es responsabilidad del desarrollador cumplirlas.
- El modelo puede alucinar detalles en regiones enmascaradas, especialmente si la máscara es grande o el contexto es ambiguo.
- No se especifican los idiomas soportados por el text encoder; el rendimiento con prompts en idiomas distintos del inglés puede ser inferior.
- La composición de estilos está limitada a un máximo de tres adaptadores simultáneos; superar ese límite no está soportado.
- Al ser un modelo de inpainting, no genera imágenes desde cero (text-to-image) de forma nativa; requiere una imagen de entrada y una máscara.

## Enlaces

- Modelo Core ML en Hugging Face: https://huggingface.co/neonforestmist/Clover-Image-Tiny-Inpaint-CoreML
- Modelo base (Diffusers): https://huggingface.co/neonforestmist/Clover-Image-Tiny-Inpaint
- Repositorio de código (GitHub): https://github.com/neonforestmist/Clover-Image-Tiny
- Repositorio de entrenamiento de LoRA (GitHub): https://github.com/neonforestmist/clover-lora-training
- Página de modelos de Apple Developer: https://developer.apple.com/machine-learning/models/
