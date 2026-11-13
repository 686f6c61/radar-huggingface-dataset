# nisarganag/photo-denoising-autoencoder

## Resumen

Photo Denoising Autoencoder es un modelo de eliminación de ruido gaussiano en fotografías en color desarrollado por el usuario nisarganag como trabajo de fin de asignatura de un M.Tech en Deep Learning. Se trata de un autoencoder convolucional "plano", es decir, sin conexiones residuales ni skip connections: el codificador comprime la imagen a un cuarto de su anchura y altura y el decodificador reconstruye una imagen limpia únicamente a partir de ese cuello de botella. Con 1.987.203 parámetros, es un modelo deliberadamente pequeño y didáctico.

El modelo resuelve un problema acotado: eliminar ruido aditivo blanco gaussiano sintético con desviación típica entre 5 y 50 sobre la escala 0-255 en fotografías naturales. No está diseñado para ruido real de cámara, artefactos JPEG ni imágenes médicas o forenses. Su interés actual es fundamentalmente pedagógico y como referencia ligera de restauración de imagen que puede ejecutarse en hardware muy modesto, incluso en CPU o en dispositivos Apple con backend MPS.

La relevancia práctica es limitada frente a los modelos de restauración modernos basados en transformers y difusión, pero su tamaño reducido, su licencia MIT y su pipeline `image-to-image` lo convierten en una opción útil para demostraciones, prototipos educativos y comparaciones de referencia con filtros clásicos como non-local means o CBM3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional plano (sin skip connections), encoder-decoder con cuello de botella a 1/4 de resolución espacial |
| Parametros totales | 1.987.203 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | MIT (código y pesos); las fotos de entrenamiento BSDS500 son de uso exclusivo para investigación |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder convolucional convencional con un codificador que reduce la resolución espacial a una cuarta parte y un decodificador que reconstruye la imagen a partir exclusivamente de esa representación latente. La ausencia de skip connections es una decisión de diseño explícita que obliga a toda la información a pasar por el cuello de botella, lo que simplifica el modelo pero también explica la suavidad de las salidas. No se documenta el número exacto de capas ni los canales por capa en la información disponible.

El entrenamiento se realizó durante 17 épocas sobre 400 fotografías del conjunto BSDS500 de Berkeley, con 32 imágenes adicionales reservadas para validación y exclusión de las 68 imágenes de test de CBSD68 mediante coincidencia de contenido de píxeles. Se usaron parches de 64x64, tamaño de lote 32, 64 parches por imagen, optimizador Adam con tasa de aprendizaje 0.001 y decaimiento coseno hasta 1e-05, y pérdida MSE. El ruido se generó de forma sintética con sigma uniforme entre 5 y 50 por parche, recortando las imágenes ruidosas al rango válido [0, 1]. El entrenamiento se ejecutó en un dispositivo Apple con backend MPS y requirió 46,9 minutos. No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos más allá del ruido gaussiano.

## Capacidades

- Eliminación de ruido aditivo blanco gaussiano sintético en fotografías RGB con sigma entre 5 y 50 (escala 0-255).
- Reconstrucción de imagen a partir de una representación latente comprimida a 1/4 de resolución espacial.
- Procesamiento de parches de 64x64 píxeles, lo que permite aplicar el modelo a imágenes de mayor tamaño mediante mosaico.
- Ejecución en CPU y en backend MPS de Apple, además de CUDA, al ser un modelo PyTorch estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión de alto nivel (no describe, no responde preguntas sobre imágenes, no hace OCR).
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Demostración educativa de autoencoders de eliminación de ruido: el modelo sirve para ilustrar en clase cómo un cuello de botella sin skip connections fuerza a la red a aprender una representación compacta y por qué esto produce salidas suaves. Su tamaño de 1,98 M de parámetros permite entrenarlo y ejecutarlo en un portátil.
- Comparación de referencia con filtros clásicos: al publicar resultados en CBSD68 frente a Gaussian blur, median filter, non-local means, CBM3D y CDnCNN, es útil como baseline reproducible en trabajos académicos sobre restauración de imagen.
- Prototipado rápido de pipelines de restauración: su pipeline `image-to-image` y su licencia MIT permiten integrarlo en un script de preprocesado para experimentar con mosaicos de 64x64 antes de invertir en modelos mayores.
- Pruebas de robustez frente a ruido sintético: investigadores pueden evaluar cómo se comporta un autoencoder pequeño al variar sigma, el tamaño de parche o el solapamiento entre parches, sin necesidad de GPU dedicada.
- Generación de datos de aumento: en un pipeline de visión por computador, el modelo puede usarse para producir pares ruido-limpio sintéticos y estudiar su efecto en tareas posteriores de clasificación o detección.
- Aplicaciones de demostración en el navegador: el autor publica un Space de Hugging Face que permite subir una foto y ver el resultado, útil para divulgación o para validar rápidamente el comportamiento del modelo antes de integrarlo.
- Filtrado previo en imágenes de baja exigencia: para fotografías naturales con ruido gaussiano moderado y donde la pérdida de textura fina sea aceptable, puede actuar como paso de suavizado controlado en un pipeline de posprocesado.

## Benchmarks y rendimiento

Resultados publicados por el autor en CBSD68 (media de PSNR en dB / SSIM sobre 68 fotos; mayor es mejor). Las filas marcadas como "reported" provienen de Zhang et al. (FFDNet, IEEE TIP 2018) y se midieron con ruido sin recortar; se citan como referencia y no fueron reproducidas por el autor.

| Metodo | sigma=15: PSNR / SSIM | sigma=25: PSNR / SSIM | sigma=50: PSNR / SSIM |
|---|---|---|---|
| Entrada ruidosa | 24,84 / 0,592 | 20,53 / 0,417 | 15,00 / 0,219 |
| Gaussian blur | 27,81 / 0,715 | 26,06 / 0,666 | 23,21 / 0,557 |
| Median filter | 26,89 / 0,718 | 24,90 / 0,592 | 22,47 / 0,445 |
| Non-local means | 28,79 / 0,799 | 25,90 / 0,690 | 22,95 / 0,575 |
| Autoencoder (este modelo) | 32,97 / 0,922 | 30,65 / 0,876 | 27,41 / 0,776 |
| CBM3D (reported) | 33,52 / no disponible | 30,71 / no disponible | 27,38 / no disponible |
| CDnCNN (reported) | 33,89 / no disponible | 31,23 / no disponible | 27,92 / no disponible |

No se han publicado resultados de benchmarks adicionales (por ejemplo, en Kodak24) en la información disponible, pese a que el autor menciona Kodak24 como conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32, dado que el modelo tiene 1.987.203 parámetros (aproximadamente 8 MB en fp32 y 4 MB en fp16). El consumo real vendrá dominado por el tamaño del lote y de los parches de entrada.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el autor entrenó en un dispositivo Apple con backend MPS, lo que indica que no se requiere hardware dedicado. Funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3090, RTX 3060, GTX 1650 e incluso iGPU con backend MPS o CPU.
- Opciones de despliegue: PyTorch nativo (el README requiere `model.py` del repositorio junto al script), exportación a TorchScript u ONNX no documentada, y un Space de Hugging Face para demo interactiva. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. El autor solo reporta 46,9 minutos de entrenamiento en MPS para 17 épocas sobre 400 imágenes con parches de 64x64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | PSNR CBSD68 sigma=25 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Photo Denoising Autoencoder (este) | 1.987.203 | Parches 64x64, imagen RGB | 30,65 dB (SSIM 0,876) | MIT | Hugging Face, Space de demo |
| CBM3D (reported) | no disponible (método clásico) | Imagen completa | 30,71 dB | no disponible | Implementaciones académicas |
| CDnCNN (reported) | no disponible | Imagen completa | 31,23 dB | no disponible | Repositorios de investigación |
| Non-local means (filtro clásico) | 0 (no paramétrico) | Imagen completa | 25,90 dB (SSIM 0,690) | no disponible | OpenCV, scikit-image |

La comparación con CBM3D y CDnCNN debe tomarse con cautela: los valores de esos métodos provienen de la literatura y se midieron con ruido sin recortar, mientras que el autoencoder se evaluó con ruido recortado al rango [0, 1], lo que puede favorecer ligeramente sus cifras. No se dispone de comparación directa con modelos neuronales modernos de restauración en la información proporcionada.

## Limitaciones y advertencias

- Salidas algo suaves: texturas finas como hierba, pelo o texto se difuminan porque toda la información debe pasar por el cuello de botella sin skip connections.
- Entrenado solo con ruido gaussiano sintético de sigma 5-50; el ruido real de cámara, los artefactos JPEG, el ruido sal y pimienta y niveles de ruido superiores se manejan mal.
- Entrenado con solo 400 fotografías, lo que limita la generalización a dominios visuales alejados de BSDS500.
- No apto para imágenes médicas ni forenses, según indica el propio autor.
- Riesgo de alucinación en el sentido de reconstruir detalles inexistentes o eliminar estructuras finas reales al suavizar; no debe usarse como prueba pericial.
- Sesgos conocidos: no documentados explícitamente, pero la composición de BSDS500 (fotografías naturales de uso investigador) condiciona el dominio de aplicación.
- Licencia MIT para código y pesos, lo que permite uso comercial del modelo; sin embargo, las fotos de entrenamiento BSDS500 son de UC Berkeley para uso exclusivo en investigación, lo que debe tenerse en cuenta si se redistribuyen datos derivados.
- El uso requiere copiar `model.py` del repositorio junto al script, ya que el modelo no se carga con `transformers` ni con una arquitectura estándar de `timm`.
- No hay garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (13 de noviembre de 2026).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nisarganag/photo-denoising-autoencoder
- Demo interactiva (Space): https://huggingface.co/spaces/nisarganag/photo-denoising-autoencoder-demo
- Referencia de benchmarks citada por el autor: Zhang et al., FFDNet, IEEE TIP 2018 (no se proporciona URL en la información disponible)
- Conjunto de datos BSDS500 (UC Berkeley): no se proporciona URL en la información disponible
- Conjunto de datos Kodak24 (Eastman Kodak Company): no se proporciona URL en la información disponible
