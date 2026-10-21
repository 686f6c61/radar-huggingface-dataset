# laicsiifes/IntegraCAR-DeepLabv3-ResNet50-128

## Resumen

IntegraCAR-DeepLabv3-ResNet50-128 es un modelo de segmentación semántica de imágenes satelitales ópticas de alta resolución, desarrollado por el grupo laicsiifes (LAICS/IFES) en el marco del conjunto de datos IntegraCAR-LULC. Se trata de un DeepLabV3 con encoder ResNet-50 preentrenado en ImageNet, construido con la librería `segmentation-models-pytorch` y entrenado para clasificar cada píxel en cinco clases agregadas de uso y cobertura del suelo (infraestructura, vegetación, áreas agropastorales, macega y cuerpos de agua) sobre imágenes del estado de Espírito Santo (Brasil).

El modelo trabaja con parches RGB de 512 × 512 píxeles extraídos con un paso de 128 píxeles y se aplica en inferencia mediante ventana deslizante con solapamiento y promediado de logits, lo que permite segmentar teselas completas de 2048 × 2048 píxeles a 0,5 m/píxel. Es una de las líneas base (*baselines*) del artículo «IntegraCAR-LULC-10K: A High-Resolution Optical Satellite Dataset for LULC Segmentation in the Brazilian Rural Environmental Registry» (SIBGRAPI 2026), por lo que su interés principal es servir como referencia reproducible para tareas de segmentación LULC en el contexto del registro ambiental rural brasileño (CAR).

Su relevancia práctica radica en tres factores: licencia MIT (uso comercial permitido), pesos en formato nativo de Hugging Face para `segmentation-models-pytorch` (carga directa con `smp.from_pretrained`) y un código de entrenamiento e inferencia público con commit fijado. No es un modelo de lenguaje: no procesa ni genera texto, por lo que las métricas habituales de contexto o razonamiento no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepLabV3 (`smp.DeepLabV3`) con encoder ResNet-50 preentrenado en ImageNet |
| Parámetros totales | No disponible (la model card no reporta el recuento; el repositorio ocupa 0,3 GB) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de visión; entrada de 512 × 512 px, 3 canales RGB) |
| Tipos de cuantización | No disponible; solo se publican pesos en `safetensors` sin variantes GGUF, ONNX u otras |
| Idiomas soportados | Portugués (pt) e inglés (en), según los metadatos de la model card; el modelo no procesa texto |
| Licencia | MIT |
| Formato de pesos | `config.json` + `model.safetensors` (formato Hub de `segmentation-models-pytorch`) |

Otros datos técnicos relevantes: salida de logits crudos con 5 clases (`activation=None`), normalización ImageNet (media `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]`), paso de extracción de parches de 128 px y stride de inferencia de 128 px con promediado de logits.

## Arquitectura y entrenamiento

La arquitectura es un DeepLabV3 estándar, formado por un encoder convolucional ResNet-50 inicializado con pesos de ImageNet y una cabeza de segmentación con *atrous convolution* y *spatial pyramid pooling*. La entrada son parches RGB de 512 × 512 píxeles normalizados con estadísticas de ImageNet y la salida son 5 mapas de logits, uno por clase, sin función de activación aplicada. Las clases predichas son: 0 Infraestructura (edificios, viales pavimentados y de tierra, aceras, minería y otras superficies artificiales), 1 Áreas de vegetación (bosque nativo, restinga, manglar, marismas y pastizales de altura), 2 Áreas agropastorales (pastos, cultivos, silvicultura, suelo expuesto y regeneración inicial), 3 Macega y 4 Cuerpos de agua (ríos, lagos, embalses y canales).

El entrenamiento se realizó sobre IntegraCAR-LULC-500, subconjunto de referencia de 500 teselas de IntegraCAR-LULC-10K. Las teselas originales son de 2048 × 2048 píxeles a 0,5 m/píxel, procedentes de ortomosaicos KOMPSAT-3/3A de 2019–2020 del estado de Espírito Santo; de ellas se extrajeron parches de 512 × 512 con paso de 128 píxeles, lo que genera un solapamiento del 75 % y aumenta la densidad de muestreo en las fronteras entre clases. El código oficial de entrenamiento e inferencia está publicado en `integraCAR/IntegraCAR-LULC-10K-code`, fijado al commit `17746ea`; la rutina `PatchifyInference` de `src/inference.py` reproduce la inferencia por ventana deslizante. No se especifican en la información disponible el número de tokens/píxeles vistos, la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional más allá del preentrenamiento ImageNet.

## Capacidades

- Segmentación semántica densa por píxel en 5 clases agregadas de uso y cobertura del suelo sobre imágenes satelitales ópticas RGB.
- Procesamiento de parches de 512 × 512 píxeles y reconstrucción de teselas completas de 2048 × 2048 mediante ventana deslizante con stride de 128 px y promedio de logits.
- Discriminación de superficies artificiales (infraestructura, minería, viales), vegetación nativa, áreas productivas agropastorales, macega y masas de agua.
- Salida en logits crudos, lo que permite aplicar `argmax`, umbrales por clase o posprocesado propio sin depender de una activación fija.
- Integración nativa con el ecosistema `segmentation-models-pytorch` (carga con `smp.from_pretrained`) y con el Hub de Hugging Face.
- No soporta *tool calling*, agentes, razonamiento multi-paso, texto, audio ni vídeo: es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- **Verificación de reserva legal y áreas de preservación permanente en el CAR**: el modelo permite clasificar automáticamente cobertura vegetal, áreas agropastorales e infraestructura en las teselas de una propiedad declarada en el Registro Ambiental Rural, de modo que el análisis puede contrastar la declaración del propietario con la cobertura observada en la imagen satelital.
- **Monitorización de deforestación y cambios de cobertura**: aplicando la inferencia por ventana deslizante a teselas de la misma zona en distintas fechas (ortoimágenes 2019–2020 dentro del rango del dataset), la comparación de mapas de clases permite localizar transiciones de vegetación a áreas agropastorales o a suelo expuesto.
- **Cartografía LULC municipal o de cuenca**: al cubrir teselas de 2048 × 2048 px a 0,5 m/píxel, el modelo puede encadenarse sobre mosaicos para generar mapas de uso del suelo con resolución submétrica útiles en planificación territorial.
- **Priorización de inspecciones de campo**: los organismos ambientales pueden usar los mapas de probabilidad por clase para ordenar qué polígonos requieren visita presencial, concentrando recursos en las zonas con mayor superficie clasificada como agropastoral o infraestructura no declarada.
- **Seguimiento de cuerpos de agua y embalses**: la clase 4 permite extraer máscaras de ríos, lagos, embalses y canales, aprovechables en estudios de disponibilidad hídrica o de evolución de láminas de agua.
- **Detección de expansión minera y de infraestructura viaria**: la clase 0 agrupa minería, viales pavimentados y de tierra y otras superficies construidas, lo que facilita el inventario de presión antrópica sobre el territorio.
- **Línea base reproducible para experimentación académica**: al ser una de las *baselines* del artículo y publicar el commit exacto del código, es adecuado como punto de partida para comparar arquitecturas alternativas (U-Net, FPN, DeepLabV3+) sobre IntegraCAR-LULC-500 con idéntico protocolo de parches y stride.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Conjunto | Notas |
|---|---|---|---|---|
| IntegraCAR-LULC-500 | mIoU | 0,7568 | test | Valor incluido en el bloque `model-index` de la model card, actualmente comentado; el widget del Hub no está activo |

No se han publicado en la información disponible resultados desagregados por clase, comparaciones numéricas con otras arquitecturas ni métricas adicionales (exactitud global, F1 por clase, FWIoU). Tampoco se documentan tiempos de inferencia ni *throughput*.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no reportada por el autor. Como estimación orientativa (no confirmada) para un DeepLabV3-ResNet-50 con entrada de 512 × 512 px, la inferencia en fp32 requiere del orden de 2–4 GB de VRAM por lote de un parche; en fp16 aproximadamente la mitad.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM resulta suficiente para procesar parches de forma secuencial; para lotes grandes o teselas completas en paralelo conviene una GPU de 16 GB o más (RTX 4090, A100, H100). El modelo también puede ejecutarse en CPU, con mayor latencia.
- **Cabe en GPU de consumo**: sí, previsiblemente en cualquier GPU de consumo moderna con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, RTX 4090), aunque estas cifras son estimaciones y no han sido publicadas por el autor.
- **Opciones de despliegue**: `segmentation-models-pytorch` + PyTorch (ruta oficial documentada), exportación a TorchScript u ONNX no documentada pero viable al ser un modelo convolucional estándar, y servicio mediante FastAPI/TorchServe o similar. No se proporcionan recetas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. A modo de referencia computacional, una tesela de 2048 × 2048 px requiere 169 parches de 512 × 512 con stride 128 (13 × 13 posiciones), cada uno con una pasada completa por la red y acumulación de logits.
- **Almacenamiento**: repositorio de 0,3 GB, lo que permite alojarlo íntegramente en memoria de disco de cualquier entorno de desarrollo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | mIoU reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IntegraCAR-DeepLabv3-ResNet50-128 | DeepLabV3 + ResNet-50 | No disponible | 512 × 512 px, ventana deslizante sobre 2048 × 2048 | 0,7568 (test, IntegraCAR-LULC-500) | MIT | Hugging Face, pesos `safetensors` |
| Otras *baselines* del artículo SIBGRAPI 2026 | No disponible | No disponible | No disponible | No disponible | No disponible | No identificadas en la información proporcionada |
| Alternativas genéricas del ecosistema `smp` (U-Net, FPN, DeepLabV3+) con encoder ResNet-50 | Convolucionales | No disponible | Configurables | No disponible sobre este dataset | MIT (librería) | Disponibles en `smp`, sin pesos específicos para IntegraCAR |

No se dispone de datos numéricos de modelos comparables sobre el mismo conjunto de evaluación, por lo que la comparación cuantitativa no puede establecerse con la información disponible. Cualquier comparación con arquitecturas tipo Mask2Former o Segment Anything requeriría reentrenamiento y evaluación propios sobre IntegraCAR-LULC-500.

## Limitaciones y advertencias

- **Desajuste en el orden de las clases**: los identificadores de clase del modelo (0 Infraestructura, 1 Vegetación, 2 Agropastoral, 3 Macega, 4 Agua) no coinciden con los de las máscaras publicadas en IntegraCAR-LULC-500 (0 Vegetación, 1 Agropastoral, 2 Infraestructura, 3 Agua, 4 Macega). Es obligatorio remapear los IDs antes de comparar predicciones con las máscaras de referencia; de lo contrario, las métricas serán erróneas.
- **Dominio geográfico y temporal acotado**: el modelo se entrenó exclusivamente con ortomosaicos KOMPSAT-3/3A de 2019–2020 del estado de Espírito Santo (Brasil). Su uso sobre otros sensores, resoluciones, fechas o regiones puede degradar la precisión de forma significativa.
- **Solo tres canales RGB**: no utiliza bandas infrarrojas ni de otro tipo, lo que limita la discriminación fina entre tipos de vegetación y cultivos en comparación con modelos multiespectrales.
- **Granularidad de clases agregada**: las cinco clases agrupan categorías heterogéneas (por ejemplo, minería y aceras comparten la clase 0), por lo que no sirve para inventarios detallados de subclases.
- **Riesgo de error en clases minoritarias y bordes**: no se publican métricas por clase ni matrices de confusión, de modo que se desconoce el comportamiento en clases poco representadas (por ejemplo, macega) y en transiciones entre clases; no se han documentado sesgos específicos.
- **Salida en logits crudos**: el modelo no aplica `argmax` ni `sigmoid`/`softmax`; es responsabilidad del integrador aplicar la activación y el posprocesado correctos.
- **Ausencia de validación comunitaria**: con 6 descargas y 0 *likes* en el momento de la consulta, no existen informes independientes de rendimiento ni de robustez fuera del artículo original.
- **Licencia**: MIT permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright; no se identifican restricciones adicionales por parte del autor.
- **Producción**: el modelo no es determinista respecto al particionado si se cambia el stride de inferencia, y no se documentan versiones congeladas más allá del commit `17746ea` del repositorio de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laicsiifes/IntegraCAR-DeepLabv3-ResNet50-128
- Dataset IntegraCAR-LULC-500: https://huggingface.co/datasets/laicsiifes/IntegraCAR-LULC-500
- Repositorio de código oficial: https://github.com/integraCAR/IntegraCAR-LULC-10K-code
- Commit de referencia del código: https://github.com/integraCAR/IntegraCAR-LULC-10K-code/commit/17746ea5e6029063a5a6ab54d8829e73fe091df9
- Script de inferencia (`src/inference.py`): https://github.com/integraCAR/IntegraCAR-LULC-10K-code/blob/main/src/inference.py
- Librería `segmentation-models-pytorch`: https://github.com/qubvel-org/segmentation_models.pytorch
- Artículo «IntegraCAR-LULC-10K: A High-Resolution Optical Satellite Dataset for LULC Segmentation in the Brazilian Rural Environmental Registry» (SIBGRAPI 2026), citado en la model card sin URL disponible.
- La búsqueda web realizada no devolvió resultados pertinentes al modelo (los resultados obtenidos corresponden a una persona homónima sin relación con el proyecto), por lo que no se enlazan.
