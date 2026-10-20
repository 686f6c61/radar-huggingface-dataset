# ganiesen/Luna-CT_scanes-weights

## Resumen

Luna-CT_scanes-weights es un repositorio de pesos (no un modelo único) publicado por el usuario ganiesen en HuggingFace. Contiene los checkpoints de una batería de experimentos de segmentación de nódulos pulmonares en TC axial, entrenados sobre LIDC-IDRI / LUNA16. El repositorio acompaña al código de entrenamiento alojado en github.com/ganiesenov/Luna-CT_scanes, que es donde viven el protocolo, las métricas completas y los scripts; aquí solo se almacenan los `state_dict` de PyTorch correspondientes al mejor checkpoint por Dice de validación.

Técnicamente son seis familias de arquitecturas 2D de segmentación binaria con entrada de un único corte axial: U-Net, U-Net++ y MAnet con encoder ResNet34 (implementadas con `segmentation-models-pytorch` 0.5.0), más una Attention U-Net y una U-Net vanilla implementadas desde cero, y un modelo adicional de ROI para una cascada detectar→segmentar. Cada variante se entrena con tres semillas (1, 2, 42) sobre un split a nivel de paciente 70/15/15, lo que permite medir varianza inter-semilla, un dato poco habitual y útil para evaluar la robustez real de estas arquitecturas.

Su relevancia es acotada pero concreta: es un baseline reproducible y multilla para segmentación de nódulos en 2D, con métricas honestas (incluido un modelo que no convergió y se documenta como tal) y con el pipeline de preprocesado explicitado, lo que facilita la comparación. No es un modelo de propósito general, no procesa lenguaje y no sustituye a un sistema de diagnóstico: el propio autor lo marca como uso exclusivamente de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN encoder-decoder 2D: U-Net, U-Net++, MAnet (encoder ResNet34, `segmentation-models-pytorch` 0.5.0); Attention U-Net y U-Net vanilla implementadas desde cero; U-Net ResNet34 adicional para ROI en cascada |
| Parametros totales | no disponible (el autor no publica el recuento; todas las variantes con encoder ResNet34) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 1×512×512 (modelo de cascada: 1×256×256) |
| Tipos de cuantizacion | no disponible; solo se publican `state_dict` de PyTorch sin estado de optimizador, sin versiones GGUF/ONNX/FP16 oficiales |
| Idiomas soportados | no aplica (modelo de vision; sin componentes de texto) |
| Licencia | no disponible en los metadatos de HuggingFace; la model card indica "research use only - not a medical device" |
| Formato de pesos | `.pth` (PyTorch `state_dict` plano) |

## Arquitectura y entrenamiento

Se trata de segmentadores binarios 2D totalmente convolucionales con encoder ResNet34 preentrenado en las variantes `smp` (U-Net, U-Net++ y MAnet) y con Attention U-Net y U-Net vanilla entrenadas desde cero según `models.py` del repositorio. La entrada es un corte axial único de TC, preprocesado de forma fija: HU recortadas a [-1000, 400], reescalado a 0-255 en uint8, redimensionado a 512×512 y normalización dividiendo por 255, resultando en un tensor `(N, 1, 512, 512)`. La salida son logits; se aplica sigmoid y umbral 0.5. El modelo de cascada recibe un recorte cuadrado de 1,6× la caja delimitadora del nódulo, redimensionado a 256×256.

Los datos provienen de LIDC-IDRI / LUNA16, con máscaras de consenso: un píxel es positivo si al menos 2 de hasta 4 radiólogos lo delinearon. El split es a nivel de paciente (70/15/15) y se repite con tres semillas (1, 2, 42), que controlan tanto la partición como la inicialización de pesos; el resto de hiperparámetros es idéntico entre semillas. El modelo de cascada se entrenó una sola vez sobre el split de semilla 42. No se documentan en la información disponible el número de tokens/volúmenes de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO (no aplicable en este dominio). Sí se documenta un fallo de entrenamiento relevante: MAnet con ResNet34 no convergió en ninguna semilla con `lr=3e-4`, produciendo predicción constante; sus pesos se incluyen solo por completitud.

## Capacidades

- Segmentación binaria de nódulos pulmonares en cortes axiales de TC, con salida de máscara a resolución 512×512.
- Segmentación refinada en cascada: dado un recorte centrado en una caja delimitadora, el modelo de ROI produce una máscara por nódulo con Dice notablemente superior al modelo de slice completo.
- Comparación controlada de cinco arquitecturas de segmentación bajo un mismo protocolo de datos y preprocesado.
- Cuantificación de la variabilidad inter-semilla: permite estimar la incertidumbre del pipeline antes de llevarlo a producción.
- Procesamiento por lotes de slices (`(N, 1, 512, 512)`), apto para barridos completos de volumen corte a corte.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general: es exclusivamente un segmentador de imágenes médicas.
- Capacidades multilingües: no aplica.

## Casos de uso

- Pre-anotación asistida en investigación radiológica: el modelo genera una máscara candidata por nódulo que el radiólogo revisa y corrige, reduciendo el tiempo de delineado manual en estudios de investigación con volúmenes LIDC-IDRI.
- Pipeline en cascada detectar→segmentar: un detector propone cajas candidatas y el modelo `cascade/cascade_unet_best.pth` segmenta el recorte a 256×256; la model card reporta Dice por nódulo de 0,888 frente a 0,728 del U-Net de slice completo en la misma ventana, lo que justifica esta arquitectura en flujos con localización previa.
- Baseline reproducible para publicaciones: el repositorio ofrece tres semillas por arquitectura con split a nivel de paciente, de modo que un investigador puede reportar media ± desviación estándar y comparar su método con una referencia honesta (incluida la varianza).
- Generación de pseudo-etiquetas para preentrenamiento: usar las máscaras del U-Net++ (mejor media, 0,699) para etiquetar grandes volúmenes de TC no anotados y alimentar después un modelo 3D o un detector.
- Volumetría de seguimiento en estudios longitudinales: segmentar el nódulo corte a corte y calcular volumen y diámetro equivalente para analizar crecimiento entre exploraciones, siempre en contexto de investigación y con revisión humana.
- Evaluación comparativa de arquitecturas: banco de pruebas para medir cuánto aporta U-Net++ frente a U-Net (0,699 frente a 0,697 de media) y documentar que la diferencia queda dentro de la desviación inter-semilla.
- Docencia y auditoría de algoritmos: material para enseñar preprocesado en unidades Hounsfield, umbralización de logits y evaluación con Dice en un caso realista con fallos documentados (MAnet no convergido).

## Benchmarks y rendimiento

Dice en test sobre máscaras de consenso LIDC, con TTA (datos de la model card):

| Modelo | Semilla 1 | Semilla 2 | Semilla 42 | Media ± desv. |
|---|---|---|---|---|
| UNetPP_ResNet34 | 0,744 | 0,664 | 0,688 | 0,699 ± 0,041 |
| UNet_ResNet34 | 0,723 | 0,664 | 0,703 | 0,697 ± 0,030 |
| AttentionUNet_scratch | 0,709 | 0,654 | 0,683 | 0,682 ± 0,028 |
| VanillaUNet_scratch | 0,717 | 0,607 | 0,634 | 0,652 ± 0,057 |
| MANet_ResNet34 | 0,200 | 0,216 | 0,189 | 0,202 ± 0,013 |

Modelo de ROI de la cascada (semilla 42, 1293 nódulos en test, localización por caja ground-truth):

| Modelo | Dice por nódulo |
|---|---|
| Cascade ROI (U-Net ResNet34, 256×256) | 0,888 |
| U-Net slice completo (misma ventana) | 0,728 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje (no aplicables a este modelo). Tampoco se aportan métricas de sensibilidad por nódulo, tasas de falsos positivos por volumen ni curvas FROC.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay medición publicada. Para una red de esta clase (encoder ResNet34, entrada 512×512, batch pequeño) la inferencia en FP32 suele quedar por debajo de 2-4 GB, pero es una estimación orientativa, no un dato del autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB para inferencia en lotes pequeños (T4, RTX 3060/4060, RTX 4090); A100/H100 solo tienen sentido para entrenamiento o barridos masivos de volúmenes.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650 4 GB o superiores para un slice a la vez; el modelo de ROI a 256×256 es aún más ligero.
- Despliegue: `torch` + `segmentation-models-pytorch` 0.5.0 (versión exacta usada en entrenamiento) cargando los `state_dict`; no hay artefactos TorchScript, ONNX ni contenedores publicados, por lo que vLLM, llama.cpp, Ollama o TGI no aplican. La exportación a ONNX/TorchScript sería un trabajo adicional del usuario.
- Latencia y throughput: no disponibles como medición publicada. Cualquier cifra de latencia por corte o de cortes/segundo debe medirse en el hardware objetivo; el coste dominante en un caso real será la E/S de DICOM y el preprocesado, no la red.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Luna-CT_scanes-weights (este) | Ensayo de 5 arquitecturas 2D + ROI | no disponible | slice 1×512×512; ROI 1×256×256 | Dice test 0,652-0,699 (slice), 0,888 (ROI en cascada) | no disponible (research use only) | Pesos en HF, código en GitHub |
| nnU-Net | Framework de auto-configuración de U-Net (2D/3D) | no disponible en la informacion | volumetrico configurable | no disponible en la informacion | Apache-2.0 | Codigo abierto, sin pesos medicos preentrenados especificos |
| MONAI (bundles de pulmon) | Libreria y bundles de segmentacion medica | no disponible en la informacion | volumetrico configurable | no disponible en la informacion | Apache-2.0 | Codigo abierto, bundles descargables |
| Modelos 3D especificos de LUNA16 | CNN 3D de deteccion/segmentacion | no disponible en la informacion | volumen 3D | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

No se dispone de métricas verificables de los competidores en la información proporcionada, por lo que la comparación numérica queda limitada a los valores del propio repositorio.

## Limitaciones y advertencias

- No es un dispositivo médico. La model card lo declara explícitamente como "research use only"; no debe usarse para diagnóstico, cribado ni decisión clínica sin validación regulatoria independiente.
- Licencia no declarada: los metadatos de HuggingFace no indican licencia, lo que impide asumir permiso de uso comercial. Cualquier explotación comercial requiere contactar con el autor.
- MAnet_ResNet34 no convergió en ninguna semilla con `lr=3e-4` (Dice 0,202 ± 0,013, predicción constante). Sus pesos están en el repositorio pero no son utilizables; el riesgo de cargarlos por error en un pipeline automatizado es real.
- Varianza inter-semilla alta: la U-Net++ va de 0,664 a 0,744 y la vanilla de 0,607 a 0,717. Las diferencias entre arquitecturas (0,699 frente a 0,697) son menores que la desviación entre semillas, así que no se puede concluir superioridad de una frente a otra con estos datos.
- El modelo es 2D: procesa cortes axiales de forma independiente y no explota la coherencia tridimensional del nódulo, lo que suele penalizar en nódulos pequeños o yuxtapleurales.
- Dependencia estricta del preprocesado: recorte de HU a [-1000, 400], reescalado a 0-255, resize a 512×512 y división por 255. Cambiar el pipeline (por ejemplo, otro grosor de corte o kernel de reconstrucción) degrada el rendimiento sin aviso.
- Dominio de validación estrecho: solo LIDC-IDRI/LUNA16. Los criterios de LUNA16 excluyen nódulos menores de 3 mm, de modo que el comportamiento en nódulos muy pequeños no está cubierto.
- Etiquetas de consenso (≥2 de 4 radiólogos): el modelo aprende un compromiso entre lectores y hereda su variabilidad interobservador; no reproduce el estilo de anotación de un servicio clínico concreto.
- Umbral fijo de 0,5 sobre sigmoid, sin calibración ni análisis de curvas precisión-recall; en producción habría que ajustar el umbral según el coste relativo de falsos positivos y negativos.
- Riesgo de alucinación en sentido figurado: pueden aparecer falsos positivos con forma plausible en estructuras vasculares o cicatrices; no hay métricas publicadas de falsos positivos por volumen.
- No se publican curvas FROC, sensibilidad por tamaño de nódulo ni análisis de subgrupos, por lo que la evaluación es menos completa que la de los sistemas de detección de referencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso externo ni de replicación independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/ganiesen/Luna-CT_scanes-weights
- Repositorio de código, métricas y protocolo: https://github.com/ganiesenov/Luna-CT_scanes
- LIDC-IDRI (TCIA): https://www.cancerimagingarchive.net/collection/lidc-idri/
- LUNA16 Grand Challenge: https://luna16.grand-challenge.org/
- `segmentation-models-pytorch` (dependencia de las variantes smp): https://github.com/qubvel-org/segmentation_models.pytorch
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
