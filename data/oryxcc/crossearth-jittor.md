# OryXcc/CrossEarth-Jittor

## Resumen

CrossEarth-Jittor es una conversión de los pesos de inferencia del modelo CrossEarth al framework Jittor, publicada por el usuario OryXcc. CrossEarth es un modelo de segmentación semántica de imágenes de teledetección diseñado para el problema de domain generalization: segmentar escenas aéreas y satelitales en dominios geográficos distintos al de entrenamiento, donde la apariencia visual (iluminación, sensor, estación del año, resolución) cambia drásticamente. La relevancia de esta ficha radica en que permite ejecutar dichos pesos sin depender de PyTorch, usando el framework de deep learning de origen chino Jittor.

El modelo combina un backbone DINOv2-L/16 (ViT grande con parches de 16×16), un adaptador LoRAReins y una cabeza de segmentación ReinMask2Former. Se distribuyen dos checkpoints FP32 específicos por tarea: uno para Potsdam IRRG → Vaihingen IRRG (6 clases, teselas de 512×512) y otro para LoveDA Rural → Urban (7 clases, teselas de 1024×1024). Cada fichero contiene 646 tensores de inferencia y se puede cargar de forma independiente con el port de CrossEarth a Jittor.

El repo ocupa 2,6 GB y no registra descargas ni likes en el momento de la consulta. La licencia no está declarada en la información disponible, lo que constituye un caveat relevante para uso comercial. Los pesos originales y la arquitectura pertenecen a los autores de CrossEarth (VisionXLab), y esta publicación es únicamente una conversión de formato para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2-L/16) con adaptador LoRAReins y cabeza ReinMask2Former |
| Parametros totales | no disponible (backbone DINOv2-L/16, sin recuento publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada por teselas de 512×512 o 1024×1024 píxeles) |
| Tipos de cuantizacion | no disponible (los checkpoints distribuidos son FP32) |
| Idiomas soportados | en (etiquetas y documentación en inglés; la tarea es visión, no texto) |
| Licencia | no disponible |
| Formato de pesos | .pth (checkpoints Jittor, FP32, 646 tensores por fichero) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de CrossEarth: un backbone ViT DINOv2-L/16 preentrenado, adaptado mediante LoRAReins (un esquema de adaptación de bajo rango orientado a dominio) y acoplado a una cabeza de segmentación ReinMask2Former que produce mapas densos de clases por píxel. El modelo está pensado para transferencia entre dominios: se entrena en un dominio fuente (Potsdam IRRG o LoveDA Rural) y se evalúa en un dominio objetivo distinto (Vaihingen IRRG o LoveDA Urban), de modo que la innovación principal es la robustez al cambio de dominio, no el ajuste a una única distribución.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o de aumentos específicos) no están disponibles en la información proporcionada; el autor de esta conversión remite a la documentación del proyecto original. La entrada es un tensor NCHW en FP32 al tamaño nativo de tesela, con normalización por media `[123.675, 116.28, 103.53]` y desviación típica `[58.395, 57.12, 57.375]`. El modelo de Potsdam espera canales infrarrojo cercano, rojo y verde (IRRG), mientras que el de LoveDA espera RGB. La conversión a Jittor no altera la arquitectura: reproduce los 646 tensores de inferencia de cada checkpoint original.

## Capacidades

- Segmentación semántica densa de imágenes aéreas y satelitales, con predicción de clase por píxel.
- Generalización a dominios no vistos: el checkpoint de Potsdam se evalúa sobre Vaihingen y el de LoveDA Rural sobre LoveDA Urban.
- Soporte de entrada multiespectral limitada: el checkpoint de Potsdam usa infrarrojo cercano, rojo y verde; el de LoveDA usa RGB.
- Procesamiento por teselas de tamaño fijo: 512×512 para Potsdam y 1024×1024 para LoveDA.
- Ejecución sobre Jittor con CUDA, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y discriminativo.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Monitorización de cambios urbanos: comparar teselas LoveDA Urban segmentadas en distintas fechas para detectar nuevas edificaciones, carreteras o superficies impermeables, aprovechando la robustez al cambio de dominio del checkpoint Rural → Urban.
- Cartografía de cobertura del suelo a escala regional: aplicar el checkpoint de Potsdam sobre ortofotos con banda infrarroja para generar mapas de 6 clases (edificación, vegetación, suelo, etc.) en mosaicos de teselas de 512×512.
- Evaluación de modelos en entornos sin PyTorch: desplegar la segmentación en infraestructuras donde Jittor es el framework estándar, por ejemplo laboratorios que ya usan Jittor para otros modelos y quieren evitar mantener dos stacks.
- Validación cruzada de conversiones de framework: usar las comprobaciones publicadas (67,49760 % mIoU en Vaihingen) como referencia para verificar que un port a otro runtime reproduce el comportamiento del original en PyTorch.
- Preprocesado para análisis geoespacial aguas abajo: generar máscaras semánticas que alimenten pipelines de detección de edificios, cálculo de índices de vegetación o planificación de infraestructuras.
- Investigación en domain generalization: emplear el par de checkpoints fuente/objetivo como línea base reproducible para comparar técnicas de adaptación de dominio en teledetección.
- Docencia y prototipado: al ser pesos de inferencia autocontenidos y cargables con una sola llamada (`CrossEarth.from_checkpoint`), sirven para demostrar segmentación semántica aérea sin entrenamiento previo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Vaihingen (398 teselas, etiquetas ISPRS erosionadas), checkpoint Potsdam | mIoU | 67,49760 % |
| Vaihingen (398 teselas, etiquetas ISPRS erosionadas), checkpoint Potsdam | Exactitud global de píxel | 86,67307 % |
| LoveDA Urban (1 imagen de 1024×1024 ensamblada de 4 teselas), checkpoint LoveDA | Coincidencia con referencia PyTorch | 1.048.576 píxeles de 1.048.576 |
| Consistencia Potsdam frente a PyTorch | Píxeles con etiqueta distinta | 29 de 104.333.312 píxeles predichos |

No se han publicado en la información disponible resultados de mIoU completos para el split de LoveDA ni comparaciones con otros modelos de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 2,6 GB en FP32 y el modelo se ejecuta sin cuantización, por lo que se requiere al menos memoria suficiente para los pesos más las activaciones de teselas de 1024×1024.
- GPU recomendadas: no disponibles en la información; el autor indica únicamente "un dispositivo CUDA compatible".
- GPU de consumo: no confirmado; un backbone ViT-L/16 en FP32 supera con holgura los 12 GB de una RTX 3060, por lo que encajaría con más probabilidad en RTX 4090 (24 GB) o superiores, aunque este dato no está verificado en la documentación.
- Opciones de despliegue: Jittor con `jt.flags.use_cuda = 1`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrossEarth-Jittor | no disponible (DINOv2-L/16 + LoRAReins + ReinMask2Former) | teselas 512×512 o 1024×1024 | 67,49760 % mIoU en Vaihingen (checkpoint Potsdam) | no disponible | Hugging Face (Jittor) |
| CrossEarth (original, PyTorch) | misma arquitectura | misma | referencia de la conversión; sin cifras publicadas en esta información | no disponible | Hugging Face (`Cusyoung/CrossEarth`) |
| Otros modelos de segmentación aérea (p. ej. variantes SegFormer o Mask2Former) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks de alternativas en la información proporcionada, por lo que la comparación cuantitativa con otros modelos queda limitada al par original/conversión.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial; es necesario contactar con los autores del proyecto original antes de desplegar en producción.
- Solo se publican dos checkpoints de inferencia, uno por tarea; no hay pesos de entrenamiento ni scripts de ajuste fino en esta conversión.
- El rendimiento completo solo se ha evaluado en Vaihingen; el checkpoint de LoveDA se verificó en una única imagen de 1024×1024, no en el split completo.
- Las 29 discrepancias de etiqueta frente a PyTorch, aunque mínimas (0,00003 % de los píxeles), indican que la conversión no es bit a bit idéntica.
- La entrada está restringida al tamaño nativo de tesela: no se documenta soporte para resoluciones arbitrarias ni para ventanas deslizantes.
- El checkpoint de Potsdam exige la composición espectral IRRG; alimentarlo con RGB produce resultados inválidos sin aviso.
- Riesgo de degradación fuera de los dominios evaluados: la generalización se ha medido en pares concretos (Potsdam → Vaihingen, LoveDA Rural → Urban) y no hay evidencia de comportamiento en otros sensores o regiones.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de uso.
- El ecosistema Jittor es menos maduro que PyTorch, lo que puede complicar el soporte, la depuración y la integración con herramientas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OryXcc/CrossEarth-Jittor
- Modelo base original: https://huggingface.co/Cusyoung/CrossEarth
- Proyecto upstream en GitHub: https://github.com/VisionXLab/CrossEarth
