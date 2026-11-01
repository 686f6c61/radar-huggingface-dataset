# heypatkay/solume-big-lama-coreml

## Resumen

`heypatkay/solume-big-lama-coreml` es una conversión a Core ML del modelo Big LaMa, una red de inpainting de imágenes presentada por Samsung AI Center en el artículo "Resolution-robust Large Mask Inpainting with Fourier Convolutions" (WACV 2022). El modelo original está pensado para eliminar objetos o regiones de una imagen y rellenar el hueco de forma coherente con el contexto circundante. Esta versión concreta la publica el desarrollador heypatkay para integrarla en Solume, una aplicación de fotografía para macOS que usa el modelo como motor de su herramienta Remove.

La relevancia de esta ficha no está en el modelo en sí —Big LaMa es una arquitectura de 2021 ampliamente conocida en el ecosistema de inpainting—, sino en el formato de distribución: dos paquetes Core ML en fp16 (`LaMa512.mlpackage` y `LaMa1024.mlpackage`) que se ejecutan de forma nativa en Apple Silicon mediante Core ML, sin necesidad de Python ni de frameworks de inferencia externos. El repositorio ocupa 0,2 GB y contiene únicamente los pesos convertidos, la licencia y la model card.

La conversión es fiel al checkpoint original: no hay fine-tuning ni cambios en los pesos más allá del paso a fp16 y del trazado a Core ML. El autor documenta el proceso con hashes SHA-256 por archivo y fija la cadena de herramientas (torch 2.15.0, coremltools 9.0), de modo que dos conversiones con el mismo entorno producen archivos idénticos byte a byte. Es, por tanto, un artefacto de despliegue reproducible más que un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Big LaMa (generador con convoluciones de Fourier, según el paper de Suvorov et al., WACV 2022) |
| Parametros totales | no disponible (el peso convertido en fp16 ocupa ~102 MB por variante, lo que sugiere del orden de 50 M de parámetros, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 (único formato publicado) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (Copyright 2021 Samsung Research) |
| Formato de pesos | Core ML `.mlpackage` (ML Program, fp16) |

## Arquitectura y entrenamiento

Big LaMa es una red generativa para inpainting de imágenes de alta resolución. Su innovación principal, descrita en el paper de referencia, son las convoluciones de Fourier: capas que operan en el dominio de la frecuencia y que permiten que cada posición del mapa de características reciba información de toda la imagen, no solo de su vecindario local. Esto resuelve el problema clásico de los modelos de inpainting basados en convoluciones locales, que fallan al reconstruir estructuras grandes o repetitivas (por ejemplo, barandillas, ventanas o patrones textiles) porque no tienen campo receptivo suficiente. La arquitectura se entrena con una combinación de pérdidas perceptuales, de estilo y adversariales, y el paper destaca su robustez a resoluciones distintas de las de entrenamiento.

En esta conversión no hay reentrenamiento: el autor carga el checkpoint `big-lama.zip` de `smartywu/big-lama` (381.428.720 bytes, SHA-256 `f1b358ca…`), reimplementa el generador en PyTorch (`lama_model.py`), lo traza y lo convierte con coremltools a dos ML Programs en fp16, uno para resolución 512 y otro para 1024. Los pesos quedan en dos ficheros `weight.bin` de ~102 MB cada uno. No se documentan datos de entrenamiento propios, ni RLHF, ni ajuste alguno: la model card es explícita al señalar que el modelo "is otherwise unchanged (no fine-tuning)".

## Capacidades

- Inpainting de imágenes: recibe una imagen de entrada (1×3×S×S en el rango [0, 1]) y una máscara binaria (1×1×S×S, donde 1 indica el hueco) y devuelve el resultado ya compuesto con los píxeles conocidos.
- Dos resoluciones de trabajo: 512×512 (`LaMa512.mlpackage`) y 1024×1024 (`LaMa1024.mlpackage`).
- Eliminación de objetos: sustituye la región enmascarada por contenido sintetizado coherente con el contexto.
- Reconstrucción de estructuras grandes: gracias a las convoluciones de Fourier, mantiene la continuidad de patrones y texturas a lo largo de huecos amplios.
- Ejecución nativa en Apple Silicon vía Core ML, sin dependencias de Python en tiempo de inferencia.
- Salida determinista para una cadena de herramientas fija (el autor lo verifica con hashes byte a byte).
- No soporta texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Herramienta de eliminación de objetos en apps de fotografía para macOS: es el caso de uso real para el que se publicó este repositorio. Solume descarga los `.mlpackage`, verifica tamaño y SHA-256 contra los valores fijados y los instala; el modelo se ejecuta en local con Core ML, sin enviar la imagen a ningún servidor.
- Retoque fotográfico por lotes en un Mac: al ser un ML Program nativo, se puede integrar en un flujo de trabajo con Vision o Core ML directamente y procesar carpetas de imágenes sin depender de Python ni de GPU dedicada.
- Eliminación de marcas de agua o logotipos en material propio: el modelo rellena la zona enmascarada con textura coherente, útil para limpiar documentos escaneados o capturas propias.
- Restauración de fotografías con elementos no deseados: fechas impresas, objetos en el encuadre o manchas grandes se pueden enmascarar y reconstruir con el contexto de la escena.
- Prototipado de pipelines de inpainting en investigación: al estar en Core ML y con hashes verificables, sirve como referencia reproducible para comparar resultados frente a otras implementaciones de LaMa.
- Preprocesado en aplicaciones de visión por computador: eliminar regiones irrelevantes (por ejemplo, personas o vehículos en el fondo) antes de pasarlas a un detector o clasificador.
- Uso educativo: el par de paquetes 512/1024 y la model card detallada permiten estudiar cómo se convierte un checkpoint de PyTorch a Core ML manteniendo la fidelidad numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (PSNR, SSIM, FID) ni comparaciones cuantitativas con el checkpoint original de PyTorch. Tampoco se documentan latencias ni throughput medidos en hardware concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Cada variante almacena ~102 MB de pesos en fp16; el consumo real de memoria unificada en Apple Silicon depende de la resolución de trabajo y de las activaciones intermedias, que el autor no cuantifica.
- GPU recomendadas: el modelo está empaquetado como ML Program de Core ML, por lo que su destino natural es Apple Silicon (series M1, M2, M3, M4) y, en menor medida, GPUs AMD compatibles con Core ML en macOS. No se distribuye en formato para CUDA.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con Apple Silicon; el repositorio completo ocupa 0,2 GB y cada paquete pesa ~102 MB. No hay versión para GPUs NVIDIA de consumo en este repositorio.
- Opciones de despliegue: Core ML de forma nativa (Vision framework o la API de Core ML), con integración directa en apps macOS. No se publican pesos en safetensors, GGUF ni ONNX, por lo que vLLM, llama.cpp, Ollama o TGI no aplican a este artefacto.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `heypatkay/solume-big-lama-coreml` | Inpainting (Big LaMa convertido) | 512 y 1024 | Core ML fp16 | Apache 2.0 | HuggingFace, 22 descargas |
| `smartywu/big-lama` | Inpainting (checkpoint original) | Según implementación | PyTorch (`.zip`) | Apache 2.0 (upstream) | HuggingFace |
| `advimman/lama` (repo oficial) | Inpainting (código y pesos) | Flexible | PyTorch | Apache 2.0 | GitHub |
| Modelos de inpainting tipo Stable Diffusion (p. ej. variantes de diffusers) | Generativos condicionados por máscara | 512/768 típicamente | safetensors, diffusers | Variables (a menudo CreativeML o similar) | HuggingFace |

La comparación relevante es con el checkpoint original de PyTorch: misma arquitectura y mismos pesos, pero este repositorio ofrece un formato listo para producción en macOS con verificación criptográfica de integridad, a cambio de fijar la resolución a 512 o 1024 y de limitarse al ecosistema Apple. Frente a los modelos de inpainting basados en difusión, Big LaMa es más ligero y rápido, pero menos flexible en cuanto a control fino del resultado y a la variedad de estilos que puede generar.

## Limitaciones y advertencias

- Es una conversión, no un modelo nuevo: cualquier limitación de Big LaMa (dificultad con huecos extremadamente grandes, texturas muy específicas o estructuras semánticas complejas) se hereda sin cambios.
- Solo dos resoluciones fijas (512 y 1024); no hay soporte documentado para otras resoluciones ni para redimensionado interno.
- No hay métricas de calidad publicadas para esta conversión; se desconoce si el paso a fp16 introduce diferencias numéricas perceptibles frente al checkpoint original en PyTorch.
- El modelo está atado a Core ML y a macOS/Apple Silicon; no es portable a Linux, Windows o GPUs NVIDIA sin reconversión.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de imagen, puede inventar contenido plausible pero falso en la región enmascarada, lo que es problemático en contextos forenses o documentales.
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar el aviso de copyright de Samsung Research y el texto completo de la licencia incluido en el repositorio.
- El autor no documenta sesgos demográficos ni de contenido; al ser un modelo de inpainting entrenado con datos no especificados en esta ficha, no se puede evaluar su comportamiento en rostros, textos o símbolos culturales.
- La app que lo consume (Solume) verifica hashes y tamaños antes de instalar; si se modifica cualquier archivo del paquete, la instalación fallará. Cualquier reempaquetado debe actualizar esos valores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/heypatkay/solume-big-lama-coreml
- Modelo base (checkpoint original): https://huggingface.co/smartywu/big-lama
- Repositorio oficial de LaMa: https://github.com/advimman/lama
- Paper de referencia (Suvorov et al., WACV 2022): "Resolution-robust Large Mask Inpainting with Fourier Convolutions" (enlace no incluido en la información proporcionada; disponible en el repositorio de GitHub de LaMa)
