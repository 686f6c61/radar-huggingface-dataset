# ethioel/cerviscan-b0

## Resumen

CerviScan AI es un clasificador de imágenes médicas desarrollado por ethioel para la detección asistida de cáncer cervical mediante el análisis de células de frotis de Pap. El modelo está basado en la arquitectura EfficientNet-B0, con una cabeza personalizada de clasificación y aproximadamente 4,3 millones de parámetros. Ha sido entrenado sobre el dataset público SIPaKMeD, compuesto por 4.049 imágenes de células aisladas, y es capaz de distinguir cinco categorías citológicas: Disqueratósica, Koilocitósica, Metaplásica, Parabasal y Superficial-Intermedia.

El modelo resuelve el problema del cribado cervical en entornos con recursos limitados, donde la escasez de citólogos especializados dificulta el diagnóstico temprano. Su relevancia radica en su tamaño reducido y su formato de despliegue: incluye versiones ONNX en FP16 (8,32 MB) y FP32 (16,53 MB), lo que permite ejecutarlo tanto en servidores como directamente en navegadores mediante ONNX Runtime Web. El modelo se distribuye bajo licencia Apache 2.0 y alcanza una precisión global del 98,40 % en el conjunto de validación, con una sensibilidad del 99,38 % para células anormales en un enfoque de triaje binario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (timm) + cabeza personalizada: Dropout(0.4) → Linear(1280→256) → ReLU → Dropout(0.2) → Linear(256→5) |
| Parametros totales | ~4,3 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 y FP32 (ONNX) |
| Idiomas soportados | no disponible (no aplica, modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP16 y FP32) y PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo utiliza EfficientNet-B0 como backbone, extraído de la librería timm con `num_classes=0`, seguido de una cabeza de clasificación compuesta por una capa Dropout (0.4), una capa lineal de 1280 a 256 unidades, activación ReLU, otra capa Dropout (0.2) y una capa lineal final de 256 a 5 salidas. El checkpoint incluye además el orden de las clases y las estadísticas de normalización (media y desviación típica de ImageNet) para facilitar la verificación del modelo.

El entrenamiento se realizó sobre el dataset SIPaKMeD, con un total de 4.049 imágenes de células aisladas, divididas en un 80/20 estratificado (810 imágenes de validación, semilla 42). Se aplicaron técnicas de aumento de datos como volteo horizontal aleatorio, rotación de ±30 grados y ajuste de color con jitter de 0.2. La optimización se llevó a cabo con AdamW (tasa de aprendizaje 1e-4, weight decay 1e-4), programación de tasa de aprendizaje con cosine annealing, tamaño de lote 32 y early stopping con paciencia de 7 épocas basado en la precisión de validación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineamiento, ya que se trata de un clasificador supervisado convencional.

## Capacidades

- Clasificación de células de frotis de Pap en cinco categorías: Disqueratósica, Koilocitósica, Metaplásica, Parabasal y Superficial-Intermedia.
- Triaje binario Normal frente a Anormal, con una sensibilidad del 99,38 % para células anormales y una especificidad del 99,69 % para células normales en el conjunto de validación.
- Inferencia en navegador mediante ONNX Runtime Web gracias al archivo `cervical_b0_fp16.onnx` de 8,32 MB.
- Inferencia en servidor o en local a través de ONNX Runtime o PyTorch, con paridad comprobada entre el modelo ONNX FP32 y el checkpoint PyTorch (error 1.3e-07).
- No soporta tool calling, función de agentes ni razonamiento multi-paso, al tratarse de un modelo de visión puro.
- Capacidades multilingües: no aplica.
- Sin capacidades de generación de texto, audio o vídeo.

## Casos de uso

- Cribado automatizado de frotis de Pap en laboratorios de citología: el modelo puede prefiltrar células normales y anormales, reduciendo la carga de trabajo de los citólogos y permitiendo que estos se centren en los casos dudosos.
- Telemedicina en entornos con recursos limitados: gracias al tamaño reducido del modelo FP16 (8,32 MB), puede desplegarse en navegadores y dispositivos de bajo coste, facilitando el diagnóstico asistido en zonas rurales o sin infraestructura hospitalaria avanzada.
- Aplicaciones móviles de apoyo al diagnóstico: el modelo es lo suficientemente ligero como para integrarse en aplicaciones móviles que analicen imágenes de citología en el punto de atención, ofreciendo una clasificación inmediata.
- Investigación en citología digital: permite la clasificación automática de grandes volúmenes de células para construir conjuntos de datos etiquetados o analizar características morfológicas específicas de cada tipo celular.
- Educación médica: puede utilizarse como herramienta de formación para estudiantes de citología, mostrando la clasificación y las probabilidades asociadas a distintos tipos de células, ayudando a consolidar el aprendizaje visual.
- Control de calidad en laboratorios: el modelo puede emplearse para comparar sus clasificaciones con las de citólogos expertos, detectar discrepancias y orientar programas de formación continua o de evaluación de la precisión diagnóstica.

## Benchmarks y rendimiento

Los resultados presentados corresponden al conjunto de validación del dataset SIPaKMeD, con 810 imágenes y una división estratificada 80/20.

| Tipo celular | Categoria | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|---|
| Disqueratósica | Anormal | 0.9878 | 0.9939 | 0.9908 | 163 |
| Koilocitósica | Relacionada con VPH | 0.9752 | 0.9515 | 0.9632 | 165 |
| Metaplásica | Anormal | 0.9750 | 0.9811 | 0.9781 | 159 |
| Parabasal | Normal | 1.0000 | 1.0000 | 1.0000 | 157 |
| Superficial-Intermedia | Normal | 0.9821 | 0.9940 | 0.9880 | 166 |

Precisión global: 98,40 % · F1 macro: 0.9840

| Metrica de triaje binario | Valor |
|---|---|
| Precisión de triaje | 99,51 % (806/810) |
| Sensibilidad para anormales | 99,38 % (484/487) |
| Especificidad para normales | 99,69 % (322/323) |
| Células anormales no detectadas | 3 de 487 (0,62 %) |

De los 13 errores de clasificación en 5 clases, 10 corresponden a intercambios entre subtipos anormales (que igualmente derivan a revisión humana), 1 es una falsa alarma y solo 3 células anormales fueron clasificadas como normales. El par de confusión dominante es Koilocitósica-Metaplásica, consistente con los resultados publicados en benchmarks de SIPaKMeD. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 8,32 MB en FP16 y 16,53 MB en FP32, por lo que no requiere VRAM significativa. Puede ejecutarse en CPU sin problema.
- GPU recomendadas: no es necesaria ninguna GPU. Si se opta por aceleración, cualquier tarjeta NVIDIA con soporte CUDA (RTX 20xx o superior, A100, H100) es más que suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo, incluso en GPUs integradas.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), ONNX Runtime Web (navegador), PyTorch, o servidores de inferencia como FastAPI o Flask.
- Latencia y throughput: no se han publicado mediciones de latencia en la información disponible. Dado el tamaño del modelo, se espera un rendimiento muy rápido, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de clasificación de citología cervical en la información disponible. El modelo no se ha evaluado contra alternativas como otros clasificadores de SIPaKMeD o modelos de detección de cáncer cervical basados en redes más grandes. Por tanto, no es posible establecer una comparación rigurosa con datos verificados.

## Limitaciones y advertencias

- El modelo fue entrenado y validado exclusivamente sobre células aisladas del dataset público SIPaKMeD. Su rendimiento en portaobjetos completos, diferentes escáneres, tinciones o poblaciones clínicas no ha sido probado.
- Se trata de un prototipo de investigación, no de un dispositivo médico. No debe utilizarse como herramienta de diagnóstico clínico real sin una validación adicional y la correspondiente aprobación regulatoria.
- Existe un riesgo de sesgo derivado de la composición del dataset, que puede no representar adecuadamente todas las variaciones morfológicas y demográficas de la población objetivo.
- En el conjunto de validación, 3 de 487 células anormales (0,62 %) fueron clasificadas como normales, lo que implica un riesgo de falsos negativos en un contexto de cribado.
- La confusión dominante entre Koilocitósica y Metaplásica puede afectar a la precisión en subtipos específicos, aunque ambos se consideran anormales en el triaje binario.
- El modelo no soporta análisis de imágenes de lámina completa (whole slide images), solo células individuales previamente segmentadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está certificado como dispositivo médico, por lo que cualquier uso en producción clínica requiere una validación independiente y el cumplimiento de las normativas sanitarias aplicables.

## Enlaces

- Hugging Face: https://huggingface.co/ethioel/cerviscan-b0
- GitHub: https://github.com/ethioel/cerviscan-ai
- Dataset SIPaKMeD: https://www.kaggle.com/datasets/akshaykrishnan/sipakmed5
- Notebook de entrenamiento: https://www.kaggle.com/ethioel/cervicalcancerdetector
