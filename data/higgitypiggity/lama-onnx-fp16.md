# HiggityPiggity/lama-onnx-fp16

## Resumen

LaMa (Large Mask Inpainting) es un modelo de inpainting de imágenes presentado por Suvorov et al. en el paper "Resolution-robust Large Mask Inpainting with Fourier Convolutions" (WACV 2022). Este repositorio concreto, publicado por el usuario HiggityPiggity, no es un modelo nuevo sino una reexportación a ONNX del export de Carve (`Carve/LaMa-ONNX`, `lama_fp32.onnx`, commit `c3c0c9e`) en la que los pesos se almacenan en float16 para reducir a la mitad el tamaño de descarga. En tiempo de carga todos los pesos se convierten de vuelta a float32, por lo que la inferencia se ejecuta exactamente igual que en el modelo original.

El modelo está pensado para rellenar regiones enmascaradas de una imagen RGB de 512x512 píxeles, y el autor lo utiliza en Lantern, una aplicación de presentaciones que corre íntegramente en el navegador, para reconstruir el fondo detrás de personas cuando un movimiento de cámara 3D lo deja al descubierto. Su relevancia práctica radica en que permite inpainting de calidad en el dispositivo del usuario sin depender de servidores, gracias a un único fichero ONNX de aproximadamente 106 MB.

No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es una red convolucional especializada en visión por computador, con licencia Apache-2.0 y sin información publicada sobre idiomas, benchmarks estándar de NLP ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa (red convolucional con Fourier convolutions para inpainting de gran máscara) |
| Parametros totales | no disponible (pesos fp16 en fichero de 106.291.403 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 512x512) |
| Tipos de cuantizacion | pesos almacenados en float16; inferencia en float32; cuantización dinámica a 8 bits probada y descartada por error inaceptable |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`lama_fp16w.onnx`) |
| Entrada `image` | float32 `[1, 3, 512, 512]`, RGB en rango 0–1, con los píxeles a rellenar a 0 |
| Entrada `mask` | float32 `[1, 1, 512, 512]`, 1 = rellenar, 0 = conservar |
| Salida `output` | float32 `[1, 3, 512, 512]`, RGB en rango 0–255 |
| Tamaño del repo | 0,1 GB |
| Fecha de creación | 2026-11-15 |

## Arquitectura y entrenamiento

LaMa es una red de inpainting diseñada para funcionar con máscaras grandes y resoluciones variables. Su innovación principal son las Fourier convolutions, que permiten que cada neurona tenga un campo receptivo global desde las primeras capas, lo que mejora la coherencia estructural cuando el hueco a rellenar ocupa una fracción importante de la imagen. El paper original (Suvorov et al., WACV 2022) describe el entrenamiento sobre tareas de inpainting de gran máscara, pero este repositorio no aporta detalles adicionales sobre el dataset, el número de tokens de entrenamiento ni si hubo etapas de refinamiento con RLHF o DPO (no aplicables a este tipo de modelo).

La contribución de este repositorio es puramente de empaquetado: parte del export ONNX en float32 de Carve y aplica un script (`convert_fp16_weights.py`) que convierte cada peso a float16 para almacenarlo, reduciendo el tamaño de descarga a la mitad. Al cargar el modelo, los pesos se reconvierten a float32, de modo que el grafo y los cálculos de inferencia son idénticos a los del export original. No hay cambios en la arquitectura, el entrenamiento ni el comportamiento funcional respecto a `lama_fp32.onnx`.

## Capacidades

- Inpainting de imágenes RGB de 512x512 píxeles: rellena las regiones indicadas por una máscara binaria con contenido sintetizado coherente con el resto de la imagen.
- Manejo de huecos grandes: la arquitectura con Fourier convolutions está específicamente diseñada para máscaras que cubren una fracción amplia de la imagen (el autor reporta pruebas con huecos del 35 % del fotograma).
- Inferencia en el dispositivo: el formato ONNX permite ejecución local en navegador (ONNX Runtime Web) o en servidor sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión general (solo inpainting), audio ni generación de texto.

## Casos de uso

- Edición fotográfica en navegador: eliminar objetos no deseados de una imagen aplicando una máscara sobre la región y dejando que el modelo rellene el fondo de forma plausible, todo sin enviar la imagen a un servidor.
- Relleno de fondos en aplicaciones de presentaciones o vídeo 360: el caso concreto del autor, Lantern, donde se reconstruye el fondo detrás de personas cuando un movimiento de cámara 3D revela zonas ocultas.
- Restauración de fotografías con zonas dañadas o marcas: enmascarar arañazos, manchas o elementos superpuestos y reconstruir la textura subyacente.
- Preprocesado en pipelines de visión por computador: eliminar logos, marcas de agua o anotaciones antes de pasos posteriores de detección o segmentación.
- Prototipado rápido de herramientas de retoque: al ser un único fichero ONNX de ~106 MB, se integra fácilmente en demos web o aplicaciones de escritorio con ONNX Runtime.
- Aumento de datos sintético: generar variaciones de una imagen rellenando regiones enmascaradas para entrenar otros modelos de visión con datos aumentados.
- Aplicaciones de privacidad: difuminar o eliminar información sensible (caras, matrículas) rellenando la zona con contenido sintetizado en lugar de pixelarla.

## Benchmarks y rendimiento

El autor reporta una comparación directa con `lama_fp32.onnx` sobre un hueco del 35 % del fotograma:

| Metrica | Valor |
|---|---|
| Diferencia absoluta media dentro del hueco (fp16 vs fp32) | 0,56 niveles (de 255) |
| Diferencia absoluta maxima dentro del hueco | 10 niveles (de 255) |
| Error medio con cuantizacion dinamica a 8 bits | superior a 100 niveles (inutilizable) |

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, FID, etc.) en la información disponible para este repositorio concreto. Los datos de calidad del modelo original LaMa deben consultarse en el paper de WACV 2022.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX ocupa ~106 MB en disco; en memoria, al cargar los pesos en float32, se requiere aproximadamente el doble (~212 MB) más el espacio de activaciones para una entrada 512x512, que es modesto. En la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; funciona en RTX 4090, RTX 3060, e incluso en GPUs integradas o ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (RTX serie 20/30/40, GTX 16xx, etc.) y también en CPU.
- Opciones de despliegue: ONNX Runtime (incluida la variante Web para navegador), ONNX Runtime con proveedores CUDA/DirectML/CoreML, o cualquier runtime compatible con ONNX. No aplica vLLM, llama.cpp ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend de ejecución.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LaMa ONNX fp16 (este repo) | Inpainting CNN con Fourier convolutions | no disponible | 512x512 | Apache-2.0 | ONNX | Hugging Face |
| LaMa ONNX fp32 (`Carve/LaMa-ONNX`) | Inpainting CNN con Fourier convolutions | no disponible | 512x512 | Apache-2.0 | ONNX | Hugging Face |
| LaMa original (`advimman/lama`) | Inpainting CNN con Fourier convolutions | no disponible | resolución variable | Apache-2.0 | PyTorch | GitHub |

La diferencia principal entre este repositorio y el export fp32 de Carve es el tamaño de descarga (la mitad) y una diferencia numérica mínima en la salida (0,56 niveles de media). Frente al modelo original en PyTorch, la ventaja es la portabilidad a navegador y la ausencia de dependencia de PyTorch.

## Limitaciones y advertencias

- Solo inpainting: no genera texto, no razona, no responde preguntas; cualquier uso fuera de relleno de regiones en imágenes no es aplicable.
- Entrada fija de 512x512: imágenes de otra resolución deben redimensionarse o parchearse antes de la inferencia, lo que puede afectar a la calidad.
- Riesgo de artefactos: aunque el modelo está diseñado para huecos grandes, puede producir texturas repetitivas o estructuras incoherentes en regiones muy grandes o con contenido semántico complejo (caras, texto).
- La cuantización dinámica a 8 bits no es viable según el autor (error medio >100 niveles); no debe usarse si se busca fidelidad.
- Sesgos: no hay información publicada sobre sesgos del dataset de entrenamiento; al ser un modelo de visión, puede reproducir sesgos de textura, color o composición presentes en los datos originales.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo original LaMa y del export de Carve, que el autor indica como Apache-2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni garantías de mantenimiento.
- No hay información sobre idiomas (no aplica) ni sobre pipeline de Hugging Face declarado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HiggityPiggity/lama-onnx-fp16
- Export ONNX original de Carve: https://huggingface.co/Carve/LaMa-ONNX
- Repositorio oficial de LaMa: https://github.com/advimman/lama
- Paper: Suvorov et al., "Resolution-robust Large Mask Inpainting with Fourier Convolutions", WACV 2022 (enlace no disponible en la información proporcionada)
