# Fabien-Ctrees/sentinel1-water-unet

## Resumen

`sentinel1-water-unet` es un modelo de segmentación binaria de agua superficial que trabaja sobre imágenes de radar de apertura sintética (SAR) del satélite Sentinel-1. Lo desarrolla Fabien H. Wagner en CTrees y acompaña al artículo *The Amazon's 2023 Drought: Sentinel-1 Reveals Extreme Rio Negro River Contraction* (Remote Sensing, 2024). El modelo resuelve un problema concreto: dado un par de bandas VV y VH en polarización de retrodispersión, producir una máscara de agua a 10 m de resolución sin depender de la cobertura nubosa, algo que sí limita los productos ópticos tipo Sentinel-2.

Arquitectónicamente es una U-Net clásica (Ronneberger et al. 2015) con 34,6 millones de parámetros, entrada de 4 bandas (VV, VH, VV, VH —la imagen de 2 bandas repetida) en 8 bits y salida de un canal con probabilidad de agua. No es un modelo generativo ni un transformer: es una red convolucional íntegramente supervisada, pensada para inferencia sobre teselas grandes (hasta 4096 × 4096 px de salida). Su relevancia actual está en que el repositorio publica los pesos originales de Keras migrados a PyTorch con validación numérica explícita (diferencia máxima de 4,8 × 10⁻⁶ y máscaras 100 % idénticas en float32), algo poco habitual en modelos de teledetección.

El caso de uso original es la cuenca amazónica, donde el modelo se entrenó y evaluó con máscaras de referencia derivadas de mosaicos Planet NICFI. La licencia CC BY 4.0 permite uso comercial con atribución, y el código asociado (preprocesado SNAP, pipeline de inferencia) se distribuye bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (encoder 32-64-128-256-512, centro 1024, decoder con 3 conv por nivel, 1×1 conv + sigmoid) |
| Parametros totales | 34,6 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de inferencia de 4224 × 4224 px (salida de 4096 × 4096 px, recorte de 64 px por lado). Cualquier tamano multiplo de 32 |
| Tipos de cuantizacion | No disponible como formato de cuantizacion; el modelo se ejecuta en float32 o float16 (float16 validado al 99,998 % de pixeles identicos) |
| Idiomas soportados | No aplica (modelo de vision, sin entrada de texto) |
| Licencia | CC BY 4.0 (pesos); codigo MIT |
| Formato de pesos | safetensors (`s1_water_unet.safetensors`, recomendado) y PyTorch state dict (`s1_water_unet.pt`) |
| Entrada | 4 bandas: VV, VH, VV, VH; valores 8 bits / 255, derivados de σ⁰ en dB con `(max(-49, min(1, dB)) + 50) × 5`; 250 = sin dato |
| Salida | 1 canal, probabilidad de agua; agua = prob ≥ 0,5; 255 = sin dato en las mascaras de ejemplo |
| Resolucion espacial | 10 m (Sentinel-1 IW GRDH) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La red sigue el esquema U-Net original: en cada nivel del encoder se aplican dos convoluciones 3×3 con batch normalization (epsilon 1e-3, herencia de Keras) y ReLU, seguidas de max pooling y dropout 0,5; el nivel central usa 1024 filtros y el decoder aplica tres convoluciones por nivel con conexiones de salto desde el encoder, cerrando con una convolución 1×1 y activación sigmoide. La inferencia se hace por teselas: ventanas de 4224 × 4224 px desplazadas cada 4096 px, con un recorte de 64 px en cada borde (`crop=64`) para eliminar artefactos de borde antes de coser el mosaico.

El entrenamiento usó 59.387 parches de 256 × 256 px para entrenamiento y 6.057 para validación, extraídos de imágenes Sentinel-1A de la cuenca amazónica (2021-2022). Cada parche se emparejó con una máscara de agua derivada de mosaicos mensuales Planet NICFI (4,78 m, con separación temporal ≤ 25 días y < 25 % de nubes), e incluyó parches adicionales con bancos de arena de la estación seca. Se optimizó con Adam (lr 1e-4) y una pérdida combinada de entropía cruzada binaria más Dice, con batch de 32 y volteos aleatorios como aumento de datos, en R con Keras y TensorFlow 2.10. Los pesos publicados son los del experimento `unet_wgth_S1_waterNsand_256_008`, es decir, los que sostienen los resultados del artículo.

El preprocesado es parte integral del modelo y se implementa en el repositorio de GitHub mediante ESA SNAP (`esa_snappy`): Apply-Orbit-File con órbitas precisas, Remove-GRD-Border-Noise, ThermalNoiseRemoval, calibración a σ⁰, corrección de terreno con GETASSE30 (bilineal, WGS84, 10 m), conversión a dB y escalado a 8 bits. El postprocesado descrito en el artículo aplica una máscara de borde de escena y una máscara de sombra de montaña a partir de SRTM (pendiente ≥ 20°).

## Capacidades

- Segmentación binaria de agua superficial (agua / no agua) sobre imágenes Sentinel-1 SAR en polarizaciones VV y VH a 10 m.
- Funcionamiento independiente de la cobertura nubosa, al operar en el rango de microondas en lugar de óptico.
- Procesamiento de escenas completas mediante teselado interno: admite entradas de cualquier tamano múltiplo de 32 y las ventanas de 4224 px se solapan con recorte de borde.
- Discriminación de bancos de arena de estación seca, incluidos explícitamente en el conjunto de entrenamiento.
- Ejecución en float16 sobre GPU con pérdida de precisión despreciable (99,998 % de píxeles idénticos frente a las predicciones originales del artículo en 2.379 parches de validación).
- Exportación de máscaras GeoTIFF con codificación explícita de valores (0 = no agua, 1 = agua, 255 = sin dato).
- No soporta tool calling, agentes, razonamiento multi-paso, entrada de texto ni otras modalidades: es un modelo puramente discriminativo de visión.

## Casos de uso

- Monitorización de inundaciones en la Amazonía: el modelo convierte una escena Sentinel-1 en una máscara de agua lista para comparar con la línea base histórica, y al ser SAR funciona durante episodios de convección intensa en los que Sentinel-2 no ve el suelo.
- Seguimiento de sequías y contracción de cauces: es exactamente el escenario del artículo de referencia (drought del Río Negro en 2023); permite medir la reducción de anchura de ríos navegables y de llanuras de inundación con series temporales de 10 m.
- Alerta temprana de crecidas en cuencas sin cobertura de aforos: integrado en un pipeline que descarga escenas S1, aplica el preprocesado SNAP del repositorio y ejecuta `predict_scene`, se obtiene el área inundada por escena para umbrales de activación.
- Cartografía de humedales y superficies de agua para inventarios de carbono azul: las máscaras a 10 m alimentan el cálculo de extensión de lámina de agua en turberas y llanuras aluviales, con la salvedad de que la vegetación inundada no se mapea como agua abierta.
- Validación cruzada de productos de agua de otras fuentes: al estar entrenado contra máscaras Planet NICFI, sirve como referencia independiente y basada en radar para contrastar mapas ópticos o productos globales de agua.
- Detección de cambios multi-temporales en llanuras aluviales: la salida determinista y de bajo coste computacional permite procesar series completas de Sentinel-1 para generar cubos de frecuencia de inundación.
- Generación de capas base para modelos hidrológicos o de navegabilidad: la máscara de agua y la identificación de bancos de arena aportan información de calado potencial y anchura de canal en ríos de la cuenca amazónica.
- Procesamiento a escala de archivo con GPU de consumo: al caber en una sola GPU moderna con teselado, es viable desplegar el modelo en estaciones de trabajo sin infraestructura de clúster.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente por Hugging Face). Tarea: segmentación de agua superficial. Conjunto: Sentinel-1 / Planet NICFI water masks, Amazon.

| Muestra | Parches | Precision | Recall | F1 |
|---|---|---|---|---|
| Entrenamiento (artículo) | 59.387 | 0,935 | 0,926 | 0,930 |
| Validación (artículo) | 6.057 | 0,934 | 0,926 | 0,930 |

Validación de la migración de Keras a PyTorch, según la model card: frente a Keras en float32, diferencia máxima de probabilidad de 4,8 × 10⁻⁶ y 100 % de máscaras idénticas; frente a las predicciones originales del artículo en float16, 99,998 % de píxeles idénticos en 2.379 parches de validación, con el mismo F1.

No se han publicado en la información disponible resultados en benchmarks estándar de segmentación (por ejemplo Sen1Floods11) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Parametros: 34,6 M (unos 69 MB en float16, 138 MB en float32). El peso del modelo es irrelevante frente al coste de las activaciones.
- VRAM estimada para inferencia sobre una tesela completa de 4096 × 4096 px: del orden de 4-8 GB en float16, dominada por los mapas de activación del encoder y las conexiones de salto (estimación a partir de la arquitectura, no publicada por el autor). Teselas de 256 × 256 px, como las del entrenamiento, reducen el consumo a menos de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM para teselas completas; una RTX 4090 (24 GB) trabaja con margen amplio; A100/H100 no aportan ventaja significativa porque el cuello de botella es el ancho de banda de memoria, no el cómputo.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 de 8-12 GB o superiores para teselas de 4096 px; en GPUs de 4 GB conviene reducir la ventana o procesar por bloques.
- Despliegue: PyTorch nativo es la vía soportada (el paquete `s1water` carga los pesos vía `huggingface_hub` y usa GPU automáticamente). No hay soporte publicado para vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo convolucional de segmentación. La conversión a ONNX o TensorRT es posible pero no está documentada en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que la inferencia usa float16 en GPU y el esquema de teselado (ventanas de 4224 px cada 4096 px).

## Comparativa con modelos similares

La búsqueda web realizada no ha devuelto información técnica sobre modelos comparables, por lo que los datos de las alternativas se marcan como no disponibles. La comparación se limita a ejes cualitativos verificables.

| Modelo | Parametros | Entrada | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentinel1-water-unet (este modelo) | 34,6 M | Sentinel-1 SAR VV+VH, 10 m | Teselas de 4224 px, salida 4096 px | CC BY 4.0 (pesos), MIT (codigo) | Pesos en Hugging Face, codigo en GitHub |
| U-Net baseline de Sen1Floods11 | No disponible | Sentinel-1 SAR | No disponible | No disponible | No disponible |
| Prithvi-EO-2.0 (IBM/NASA) | No disponible en la informacion disponible | Multiespectral / SAR segun variante | No disponible | No disponible | No disponible |
| JRC Global Surface Water | No aplica (producto cartografico, no modelo DL) | Landsat (optico) | Serie temporal 1984-2021 | No disponible | Servicio de datos abierto |

Diferencias clave frente a alternativas ópticas: este modelo no depende de la ausencia de nubes, pero solo se ha validado en la Amazonía y no cubre vegetación inundada. Frente a productos globales de agua, ofrece resolución de 10 m y ejecución local, a cambio de requerir el preprocesado SNAP completo.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en la cuenca amazónica; no hay validación publicada en otros biomas, regiones áridas ni entornos urbanos, por lo que su uso fuera de esa región es extrapolación.
- Entrenado con Sentinel-1A. Las escenas de Sentinel-1C/D (posteriores a 2025) comparten diseño instrumental pero no formaron parte de los datos de entrenamiento.
- Los ríos de 1-2 píxeles (10-20 m de anchura) se pierden con frecuencia; la vegetación inundada no se clasifica como agua abierta, lo que subestima la extensión de humedales.
- Las celdas convectivas de lluvia pueden incrementar la retrodispersión del agua y provocar omisiones; las sombras de radar en zonas de montaña pueden confundirse con agua, de ahí la máscara de sombra SRTM por pendiente ≥ 20° que aplica el artículo.
- Las máscaras de referencia provienen de otro modelo (Planet NICFI) y arrastran sus propios errores (nubes y sombras de nube), lo que acota el techo de calidad alcanzable.
- El preprocesado no es opcional: sin la cadena SNAP (órbitas precisas, eliminación de ruido de borde y térmico, calibración, corrección de terreno) el modelo recibe una distribución de entrada distinta a la de entrenamiento y las predicciones no son fiables.
- Las métricas publicadas son declaradas por el autor y no han sido verificadas de forma independiente; los valores de entrenamiento y validación coinciden (F1 0,930), lo que conviene contrastar con datos propios antes de usarlo en producción.
- La licencia CC BY 4.0 permite uso comercial pero exige atribución mediante la cita del artículo de Wagner et al. (2024); el código del repositorio es MIT, con condiciones distintas.
- Los datos de ejemplo contienen datos modificados de Copernicus Sentinel (2026) y están sujetos a sus propios términos de uso.
- El repositorio no registra descargas ni likes y el modelo se publicó sin señales de adopción, por lo que no hay comunidad que haya reportado comportamientos fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fabien-Ctrees/sentinel1-water-unet
- Codigo, notebooks y documentacion: https://github.com/fabien-w/sentinel1-water-unet
- Articulo de referencia (DOI): https://doi.org/10.3390/rs16061056
- CTrees (organizacion): https://ctrees.org
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo ni sobre modelos comparables.
