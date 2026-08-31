# jan-grzybek/aerial-film-restorer

## Resumen

Aerial Film Restorer es un modelo de restauración de imágenes aéreas históricas escaneadas, desarrollado por Jan Grzybek y publicado en Hugging Face bajo licencia CC-BY-4.0. Su objetivo es revertir los daños acumulados en archivos de fotografía aérea de mediados del siglo XX: costuras de mosaicos, viñeteado, pérdida de contraste local, grano de película y artefactos de impresión, escaneo y almacenamiento. La propuesta central del modelo es una restauración de "fidelidad medida": no inventa contenido y su rendimiento se valida contra pares de fotografías con ground truth profesional que no participaron en el entrenamiento.

Con 17,3 millones de parámetros y un peso de 0,1 GB, es un modelo ligero diseñado para procesar imágenes de gran tamaño mediante un enfoque de ventana fija de 256 píxeles con pirámide de contexto. Está orientado a archivos históricos, cartografía y teledetección, y su pipeline es image-to-image. Aunque no se especifica la arquitectura exacta, el tag arxiv:2204.04676 sugiere una base académica en restauración de imágenes, probablemente una red convolucional tipo U-Net.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de restauración de imágenes, probablemente convolucional) |
| Parametros totales | 17.315.161 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible. Se trata de un modelo de restauración de imágenes que opera sobre un canal de luminancia (escala de grises) y acepta imágenes de cualquier tamaño mayor o igual a 64 píxeles. Internamente construye cinco canales a partir de la imagen original: la imagen a resolución nativa y dos vistas de contexto registradas a 2× y 4×, generadas mediante una pirámide de medias por bloques. El procesamiento se realiza sobre una retícula de teselas de 256 píxeles con fusión Hann, lo que permite manejar imágenes arbitrariamente grandes con memoria acotada.

El entrenamiento se basó en pares de fotografías aéreas históricas escaneadas y sus correspondientes limpiezas profesionales producidas por archivos como el IGN francés. Se reservaron 40 pares para evaluación, de los cuales 22 no se usaron ni siquiera para la selección de checkpoints. El autor reporta haber identificado y eliminado modos de fallo típicos del entrenamiento ingenuo: objetivos con aliasing que fabrican nitidez, adversarios que intercambian grano por contraste y pérdidas que aplastan el tono. No se mencionan técnicas como RLHF o DPO, al ser un modelo de visión.

## Capacidades

- Restauración de fotografías aéreas históricas escaneadas: elimina costuras de mosaico, viñeteado, pérdida de contraste local y grano de película.
- Preservación de la fidelidad geométrica: no desplaza bordes ni inventa contenido; las estructuras permanecen en su posición original.
- Procesamiento de imágenes de gran tamaño: mediante teselado fijo de 256 píxeles con fusión Hann, puede procesar mosaicos completos sin límite de resolución.
- Manejo de zonas sin evidencia: un "escudo de no-evidencia" detecta vacíos negros y márgenes quemados, los rellena solo para el modelo con contenido válido cercano y los devuelve intactos en la salida.
- Determinismo: la misma entrada produce siempre la misma salida, con tests incluidos que fijan la geometría, el escudo y el camino de entrada pequeña.
- Soporte para entrada de 8 y 16 bits: el lector proporcionado evita la pérdida de rango dinámico de PIL en escaneos de 16 bits.
- Compatibilidad multiplataforma: funciona en CUDA, Apple MPS y CPU, con selección automática del dispositivo.

## Casos de uso

- Digitalización de archivos aéreos históricos: instituciones como museos, bibliotecas o agencias cartográficas pueden procesar colecciones completas de rollos de película escaneados para obtener versiones limpias y legibles sin alterar el contenido original.
- Preparación de ortofotos para SIG: los mosaicos aéreos con costuras y viñeteado pueden unificarse en una imagen continua, lista para su integración en sistemas de información geográfica.
- Análisis de evolución urbana: investigadores que estudian el crecimiento de ciudades pueden comparar vuelos históricos (p. ej., Varsovia 1944, Burdeos años 50) con imágenes actuales, gracias a la restauración que hace legibles calles y edificios individuales.
- Documentación de patrimonio destruido: el modelo permite leer el estado de edificios o barrios antes de su destrucción, como en el caso de Varsovia tras el levantamiento de 1944, facilitando trabajos de memoria histórica.
- Restauración de reconocimiento aéreo militar: fotografías de reconocimiento de época, a menudo con exposiciones irregulares y daños, pueden aclararse para su análisis histórico o forense.
- Limpieza de colecciones fotográficas en línea: archivos que publican sus fondos en la web pueden ofrecer versiones restauradas de sus imágenes aéreas, mejorando la accesibilidad y la calidad de visualización.

## Benchmarks y rendimiento

La model card del autor presenta tres métricas de fidelidad medidas contra ground truth profesional, evaluadas sobre 40 pares reservados (22 de ellos no vistos en la selección de checkpoints). Los valores se expresan como ratios de energía donde 1.00 significa exactamente lo que contiene el negativo:

| Eje | Valor (media ± error estándar) | Significado en 1.00 |
|---|---|---|
| Detalle en estructuras | 1.02 ± 0.03 | Cada borde real tan nítido como la verdad, sin suavizado ni acutancia falsa |
| Detalle en zonas planas de película | 1.07 ± 0.05 | El grano no se amplifica ni se elimina |
| Tono a gran escala | 1.01 ± 0.07 | La variación tonal del terreno se conserva, sin gris uniforme |

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, LPIPS) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Rendimiento medido: aproximadamente 0,4 MPix/s en Apple Silicon MPS (una imagen de 1024×1024 en unos 3 segundos).
- CUDA es más rápido; CPU es viable para fotogramas individuales.
- Memoria acotada por el tamaño fijo de tesela (256 píxeles), lo que permite procesar imágenes arbitrariamente grandes sin agotar la VRAM.
- No se especifican requisitos mínimos de VRAM ni GPUs concretas recomendadas.
- Opciones de despliegue: el modelo se distribuye como script de Python (`inference.py`) con carga de pesos safetensors; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (al ser un modelo de visión, estas herramientas no aplican).
- La latencia depende del dispositivo; en MPS se estima ~3 s para 1024², en CUDA será menor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a alternativas de restauración de imágenes aéreas históricas con métricas de fidelidad similares. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para fotografía aérea de película en escala de grises; no está diseñado para imágenes de satélite modernas, fotografía de paisaje o imágenes en color.
- El "escudo de no-evidencia" trata el papel de montaje fuera de rango (blanco roto) como contenido válido; los escaneos deben recortarse al fotograma o enmascararse para evitar que el modelo procese áreas no fotográficas.
- No inventa contenido: en zonas sin evidencia (vacíos negros, márgenes quemados) devuelve la imagen original sin restaurar, lo que puede dejar artefactos visibles en la salida.
- La ventana de procesamiento está fijada en 256 píxeles; no existe un parámetro de tamaño de tesela ajustable, lo que limita la flexibilidad para otros dominios de imagen.
- El modelo solo trabaja con un canal de luminancia; la información de color se descarta al convertir a escala de grises.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de archivos occidentales (IGN francés, archivos de Varsovia, US National Archives), su rendimiento puede degradarse con material de otras regiones o épocas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se debe verificar el cumplimiento de los derechos de las imágenes de origen en cada caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jan-grzybek/aerial-film-restorer
- Perfil del autor: https://huggingface.co/jangrzybek
- Paper de referencia (tag arxiv:2204.04676): no se ha localizado el enlace directo en la información proporcionada.
