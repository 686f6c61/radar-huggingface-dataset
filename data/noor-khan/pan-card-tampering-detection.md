# Noor-Khan/pan-card-tampering-detection

## Resumen

PAN Card Tampering Detection es un repositorio de Hugging Face publicado por Noor-Khan (Noorullah Zamindar) que implementa un detector de manipulaciones en imagenes de tarjetas PAN (el documento de identidad fiscal indio). A pesar de su nombre y de estar alojado en Hugging Face, no es un modelo de aprendizaje automatico: no contiene pesos, no tiene datos de entrenamiento y no se apoya en una red neuronal. Se trata de un metodo clasico de comparacion de imagenes basado en SSIM (Structural Similarity Index) y OpenCV, empaquetado como modulo Python reutilizable y CLI.

El problema que aborda es la verificacion documental: dada una imagen original de referencia y una imagen sospechosa de la misma tarjeta, el sistema calcula la similitud estructural entre ambas, genera una imagen de diferencias, la binariza con el metodo de Otsu y dibuja cajas rojas delimitadoras sobre las regiones que difieren. El resultado se guarda como dos imagenes anotadas (`result_original.png` y `result_tampered.png`).

Es relevante como pieza didactica y como utilidad ligera de preprocesado en pipelines de KYC, pero conviene subrayar que no decide si un documento esta manipulado: solo resalta diferencias de pixeles para que un humano las evalue. El repositorio ocupa 0.0 GB, no tiene descargas ni likes en el momento de la consulta y fue creado y actualizado el 16 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: metodo clasico de vision por computador (SSIM + umbralizado de Otsu + contornos OpenCV); no es una red neuronal |
| Parametros totales | No disponible (no hay pesos ni modelo entrenado) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (no procesa texto; no hay OCR) |
| Licencia | No disponible |
| Formato de pesos | No disponible (no hay pesos; se distribuye codigo Python) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El "modelo" es el codigo de `tamper_detector.py`, que reproduce la funcion `compare_images` de la aplicacion Flask original sin cambios de comportamiento. El pipeline consta de seis pasos: carga de la imagen original y de la sospechosa, redimensionado de la sospechosa al tamano de la original, conversion a escala de grises, calculo del SSIM entre ambas, umbralizado de la imagen de diferencias SSIM mediante el metodo de Otsu y extraccion de contornos externos para dibujar cajas rojas delimitadoras sobre cada region detectada.

El repositorio incluye `evaluate.py`, que reproduce todas las metricas publicadas, y `metrics.json` con los resultados medidos. Las dependencias declaradas en `requirements.txt` son `opencv-python-headless`, `scikit-image`, `imutils`, `Pillow` y `numpy`. El codigo de `tamper_detector.py` reproduce byte a byte (verificado por SHA-256) las imagenes de resultado de la aplicacion original alojada en el repositorio de GitHub del autor.

## Capacidades

- Comparacion de dos imagenes de una misma tarjeta PAN y calculo de una puntuacion SSIM (1.0 = identicas, valores menores = mas diferentes).
- Generacion de una imagen de diferencias y de una imagen umbralizada para inspeccion.
- Localizacion de regiones modificadas mediante cajas delimitadoras rojas dibujadas sobre ambas imagenes.
- Uso como libreria (`compare_images`) o como CLI (`python tamper_detector.py original.jpg suspect.png`).
- Soporte de directorio de salida configurable (`--out-dir`).
- No incluye OCR, no lee campos de la tarjeta, no alinea ni corrige la perspectiva de las imagenes.
- No incluye clasificador ni umbral de decision: no emite un veredicto de "manipulado".

## Casos de uso

- Verificacion manual asistida en procesos de KYC: un analista compara la copia archivada del documento con la version aportada por el cliente y revisa las cajas rojas para decidir si hay alteracion. Adecuado por su bajo coste computacional y su salida visual interpretable.
- Preprocesado en pipelines de onboarding digital: el detector puede ejecutarse como primer filtro para marcar pares de imagenes que requieren revision humana, descartando los casos con SSIM muy alto y sin cajas relevantes.
- Auditoria interna de expedientes: comparacion por lotes de documentos escaneados en distintas fechas para detectar cambios entre versiones archivadas.
- Docencia y formacion en vision por computador: el repositorio sirve como ejemplo completo y reproducible de SSIM, umbralizado de Otsu y extraccion de contornos, con metricas verificables mediante `evaluate.py`.
- Prototipado rapido de herramientas de comparacion documental: la funcion `compare_images` puede integrarse en una API o en un script de escritorio sin dependencias pesadas de deep learning.
- Control de calidad de digitalizacion: detectar diferencias entre dos escaneos del mismo documento realizados con el mismo equipo y configuracion, para identificar escaneos defectuosos o reescaneos alterados.
- Entornos con recursos limitados: al no requerir GPU ni pesos, puede desplegarse en un contenedor ligero o en un servidor modesto junto a otros servicios.

## Benchmarks y rendimiento

Resultados medidos por el autor el 16 de noviembre de 2026 con `evaluate.py` sobre las imagenes de muestra y ediciones sinteticas de la original:

| Caso | SSIM | Cajas delimitadoras | Cajas >= 100 px² |
|---|---|---|---|
| Par de muestra, pipeline del notebook (ambas redimensionadas a 250x160) | 0.3169 | 50 | 4 |
| Par de muestra, pipeline de la app (sospechosa redimensionada a 1200x800) | 0.4065 | 630 | 44 |
| Control: original contra si misma | 1.0000 | 0 | 0 |
| Control: original contra recompresion JPEG (calidad 50) | 0.9742 | 3100 | 283 |
| Sintetico: linea del numero PAN tapada en negro | 0.9699 | 4 | 1 |
| Sintetico: area de la foto tapada en blanco | 0.9747 | 24 | 1 |
| Sintetico: parche pequeno sobre la linea del nombre | 0.9893 | 3 | 1 |

El valor 0.3169 del pipeline del notebook reproduce exactamente el SSIM impreso por el notebook original. En las tres ediciones sinteticas, la unica caja grande recae sobre la region editada; por ejemplo, la linea del numero PAN tapada se delimita en (57, 552, 507x57) frente a la edicion real (60..560, 555..605).

## Requisitos de hardware

- No requiere GPU: el metodo es puramente CPU y depende de OpenCV y scikit-image.
- VRAM estimada: 0 GB.
- CPU: cualquier procesador moderno es suficiente; el coste dominante es el calculo de SSIM sobre la imagen redimensionada.
- Memoria RAM: depende del tamano de las imagenes de entrada; para documentos de hasta 1200x800 el consumo es de decenas de MB.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo, incluidos portatiles de gama baja y contenedores con recursos minimos.
- Opciones de despliegue: ejecucion directa como script Python, importacion como modulo, o integracion en un servicio Flask/FastAPI propio; no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Herramienta | Enfoque | Pesos | Requiere GPU | Salida | Licencia |
|---|---|---|---|---|---|
| PAN Card Tampering Detection (este repo) | SSIM + Otsu + contornos | No | No | Puntuacion SSIM + cajas rojas | No disponible |
| Modelos de deteccion de manipulacion documental basados en CNN (p. ej. variantes de ManTra-Net, Noiseprint) | Red neuronal entrenada | Si | Recomendable | Mapa de manipulacion | Varía segun modelo |
| Comparadores de imagenes genericos (ImageMagick `compare`, `pixelmatch`) | Diferencia de pixeles | No | No | Imagen de diferencias | Licencias permisivas habituales |
| Librerias de SSIM genericas (scikit-image `structural_similarity`) | SSIM puro | No | No | Puntuacion escalar | BSD |

No se dispone de datos de benchmarks comparativos con esas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El par de muestra son dos tarjetas de especimen distintas, no la misma tarjeta con un campo editado; por eso su SSIM es tan bajo (0.32-0.41). Las ediciones sinteticas son la prueba real de cambios sutiles.
- El SSIM de imagen completa apenas se mueve ante una edicion local pequena: tapar la linea del numero PAN da 0.9699, mientras que solo recomprimir la tarjeta intacta en JPEG calidad 50 da 0.9742. El SSIM por si solo no distingue una edicion pequena de una recompresion; hay que mirar las cajas, no solo la puntuacion.
- El recuento bruto de cajas es ruidoso a resolucion completa: la recompresion JPEG genera 3100 cajas (283 de ellas >= 100 px²) por artefactos de compresion. Conviene filtrar contornos por area o comparar a tamano pequeno (250x160) antes de contar.
- Las dos imagenes deben ser escaneos alineados de la misma tarjeta. Una foto tomada con otro angulo, escala o iluminacion dara una puntuacion baja aunque no haya manipulacion: el metodo compara pixeles y no alinea, no corrige la inclinacion ni lee la tarjeta.
- Resalta diferencias de pixeles pero no decide "manipulado": no hay umbral, ni clasificador, ni OCR. Un humano debe juzgar si la diferencia resaltada constituye una manipulacion.
- Las imagenes de muestra son tarjetas de especimen de relleno (nombres y numeros falsos, foto de silueta); no contienen datos de personas reales.
- La licencia no esta declarada en la informacion disponible, por lo que el uso comercial queda sin marco juridico explicito hasta que el autor la defina.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Noor-Khan/pan-card-tampering-detection
- Proyecto original en GitHub (aplicacion Flask + notebook): https://github.com/NoorullahZamindar-007/Pan-Card-Tampering-Detection
