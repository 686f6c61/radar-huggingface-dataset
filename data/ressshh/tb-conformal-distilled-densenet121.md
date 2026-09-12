# Ressshh/tb-conformal-distilled-densenet121

## Resumen

El modelo `Ressshh/tb-conformal-distilled-densenet121` es un clasificador de imágenes médicas desarrollado por el usuario Ressshh para el cribado de tuberculosis pulmonar (TB) a partir de radiografías de tórax (CXR). Se trata de un modelo "estudiante" basado en la arquitectura DenseNet-121 con 7,74 millones de parámetros, destilado a partir del modelo fundacional multimodal Microsoft BioMedCLIP (ViT-B/16, 86,4 millones de parámetros), lo que reduce el coste computacional en más de un orden de magnitud respecto al profesor.

Su relevancia práctica reside en dos factores concretos. Por un lado, el formato ONNX de 26,90 MB permite inferencia en CPU pura a 77,5 ms por radiografía (12,90 FPS), lo que lo hace desplegable en puestos sanitarios sin GPU. Por otro lado, el autor reporta AUROC de 0,9292 y 0,9347 en dos cohortes indias (N=1.400 cada una) y de 0,9065 en una cohorte de Pakistán (N=641), con un AUROC agrupado de 0,9147 para el conjunto de Asia del Sur (N=3.441), superando según el autor los criterios WHO CAD TPP (sensibilidad ≥90 %, especificidad ≥70 %). La model card etiqueta además el modelo con "conformal-prediction", aunque no se documentan en el repositorio los detalles metodológicos de esa capa.

Se distribuye bajo licencia MIT y se declara explícitamente como prototipo de dispositivo médico en fase de investigación (FDA 21 CFR 820, EU MDR 2017/745, UU Kesehatan nº 17/2023 de Indonesia), no como herramienta de diagnóstico autónomo. El repositorio no tiene descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (red convolucional densa), destilada de BioMedCLIP ViT-B/16 |
| Parametros totales | 7,74 M (estudiante) / profesor: 86,4 M (ViT-B/16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: clasificación de imagen con entrada fija de 224x224 px, 3 canales RGB |
| Tipos de cuantizacion | No disponible. La model card menciona "Quantized / Native Formats" pero solo lista los ficheros ONNX (26,90 MB) y PyTorch (30,15 MB) sin especificar precisión (FP32/FP16/INT8) ni niveles de cuantización |
| Idiomas soportados | en, id (según metadatos de la model card; el modelo no procesa texto, los idiomas se refieren a documentación/etiquetado) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, `tb_conformal_distilled_v11.onnx`) y checkpoint PyTorch (`tb_conformal_distilled_v11.pth`) |
| Tarea (pipeline) | `image-classification` (clasificación binaria TB / no TB) |
| Preprocesado requerido | Redimensionado a 224x224, RGB, normalización ImageNet (mean [0,485; 0,456; 0,406], std [0,229; 0,224; 0,225]) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue un esquema clásico de destilación de conocimiento profesor-estudiante. El profesor es BioMedCLIP (ViT-B/16, 86,4 M de parámetros), un modelo fundacional visión-lenguaje entrenado sobre pares imagen-texto biomédicos; el estudiante es una DenseNet-121 de 7,74 M de parámetros, arquitectura convolucional con conexiones densas ampliamente utilizada en radiología de tórax. La entrada es una radiografía de tórax de 224x224 píxeles normalizada con estadísticas de ImageNet.

La función de pérdida es una formulación "tri-loss" descrita por el autor: entropía cruzada sobre etiquetas duras (Hard Label CE), divergencia KL sobre las distribuciones de probabilidad del texto (Soft Text KL) y alineamiento latente de características visuales (Visual Feature Latent Alignment). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon fases de RLHF o DPO (poco habituales en clasificación de imagen). Tampoco se documenta el método de conformal prediction mencionado en las etiquetas del repositorio, por lo que no es posible verificar garantías de cobertura. Sí se explicita que la inferencia se ha optimizado para CPU: 77,5 ms/CXR con ONNX Runtime frente a 414,7 ms/CXR con PyTorch, un factor de aceleración de 5,35x.

## Capacidades

- Clasificación binaria de tuberculosis pulmonar en radiografías de tórax, con salida de logits de dos clases y probabilidad asociada a la clase TB.
- Inferencia en CPU sin GPU: 12,90 FPS por núcleo de ejecución en ONNX Runtime.
- Generalización multi-cohorte: evaluado en cohortes de India (Solan, NITRD) y Pakistán, con AUROC entre 0,9065 y 0,9347.
- Ejecución en formato ONNX portable (opset 17), compatible con múltiples proveedores de ejecución.
- Distribución con checkpoint PyTorch para fine-tuning o investigación sobre destilación.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multilingües de texto (los idiomas declarados se refieren a los metadatos).
- No dispone de visión-lenguaje, audio ni modo "thinking": es un clasificador de imagen puro de una única modalidad.

## Casos de uso

- Cribado de tuberculosis en zonas con escasez de radiólogos: el modelo puede priorizar radiografías sospechosas en programas poblacionales, con 77,5 ms por imagen en CPU, lo que permite procesar unas 1.000 CXRs en aproximadamente 78 segundos en un único hilo de ejecución ONNX.
- Despliegue en puestos de salud periféricos sin GPU: al ocupar 26,90 MB en ONNX y no requerir acelerador, cabe en portátiles modestos, mini-PC e incluso dispositivos embebidos compatibles con ONNX Runtime, lo que habilita cribado en centros rurales de Asia del Sur, la región donde se validó.
- Pre-filtrado en programas de cribado masivo: dado el AUROC agrupado de 0,9147 sobre 3.441 casos, puede actuar como primera etapa para reducir el volumen de lecturas humanas, derivando solo los casos positivos o limítrofes a revisión radiológica.
- Segunda lectura asistida en flujos PACS: integrado como servicio REST o como paso previo en un pipeline que convierta DICOM a PNG, redimensione a 224x224 y aplique la normalización ImageNet para generar una probabilidad de TB como apoyo al informe.
- Investigación en destilación de modelos fundacionales médicos: sirve como caso de estudio reproducible de destilación desde un modelo visión-lenguaje (BioMedCLIP) hacia una CNN pequeña, con la formulación tri-loss documentada.
- Generación de conjuntos de datos etiquetados a escala: uso como etiquetador automático de baja confianza para grandes volúmenes de radiografías en investigación retrospectiva, con revisión humana obligatoria de las etiquetas.
- Validación y auditoría de equidad: la disponibilidad de resultados por cohorte permite usarlo como punto de partida para estudiar deriva de dominio (domain shift) entre poblaciones, por ejemplo la caída de AUROC en la cohorte de Pakistán frente a las indias.
- Formación y docencia en informática médica: prototipo ligero para ilustrar calibración, umbrales operativos y métricas de sensibilidad/especificidad en cribado.

## Benchmarks y rendimiento

Rendimiento diagnóstico reportado por el autor (AUROC con intervalo de confianza del 95 %, significación DeLong p < 0,0001):

| Cohorte | N | AUROC | IC 95 % |
|---|---|---|---|
| India Solan | 1.400 | 0,9292 | 0,9157 - 0,9427 |
| India NITRD | 1.400 | 0,9347 | 0,9218 - 0,9477 |
| Pakistán (high-shift) | 641 | 0,9065 | 0,8837 - 0,9293 |
| Asia del Sur (agrupado) | 3.441 | 0,9147 | 0,9052 - 0,9242 |

Latencia medida en CPU:

| Runtime | Latencia por CXR | Throughput |
|---|---|---|
| ONNX Runtime (CPU) | 77,5 ms | 12,90 FPS |
| PyTorch (CPU) | 414,7 ms | ~2,41 FPS |

El autor afirma que el modelo supera el objetivo WHO CAD TPP (sensibilidad ≥90 %, especificidad ≥70 %) en todas las cohortes evaluadas. No se han publicado en la información disponible resultados de benchmarks estándar de imagen médica como MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo), ni métricas desagregadas de sensibilidad, especificidad, F1 o AUC por subgrupo demográfico.

## Requisitos de hardware

- Huella de pesos: 7,74 M de parámetros, equivalentes a ~31 MB en FP32; los ficheros distribuidos ocupan 26,90 MB (ONNX) y 30,15 MB (PyTorch).
- VRAM estimada para inferencia en GPU: inferior a 500 MB incluyendo activaciones de DenseNet-121 con lotes pequeños (estimación a partir del tamaño de pesos y de la resolución de entrada; no verificada en la información disponible).
- GPU recomendadas: cualquier GPU con ≥2 GB de memoria; tarjetas como T4, RTX 3060 o RTX 4090 son más que suficientes. A100 y H100 no aportan ventaja práctica para este tamaño de modelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU y en CPU exclusiva.
- CPU pura: viable en producción de bajo volumen, con 77,5 ms/CXR en ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (con proveedores CPU, CUDA, TensorRT u OpenVINO), PyTorch/TorchScript, y servicio HTTP propio (por ejemplo FastAPI) sobre cualquiera de los dos runtimes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 12,90 FPS en ONNX Runtime CPU. No se dispone de cifras de latencia en GPU ni de throughput con batching en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura / tamaño | Contexto (entrada) | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tb-conformal-distilled-densenet121 | DenseNet-121, 7,74 M | Imagen 224x224 | AUROC 0,9065-0,9347 en 3 cohortes (datos del autor) | MIT | ONNX + PyTorch en HuggingFace |
| CheXNet y derivados DenseNet-121 | DenseNet-121, ~8 M | Imagen 224x224 | No disponible en la información proporcionada | No disponible | Múltiples implementaciones públicas |
| TorchXRayVision (DenseNet-121 preentrenado) | DenseNet-121, ~8 M | Imagen 224x224 | No disponible en la información proporcionada | No disponible | Paquete Python público |
| BioMedCLIP (modelo profesor) | ViT-B/16, 86,4 M | Imagen-texto | No disponible en la información proporcionada | No disponible | Microsoft, weights públicos |

No se dispone en la información proporcionada de cifras de rendimiento verificables de los modelos comparables, por lo que la comparación numérica directa no es posible. La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- Herramienta de investigación: la model card la declara prototipo de apoyo a la decisión clínica bajo FDA 21 CFR 820, EU MDR 2017/745 y UU Kesehatan nº 17/2023. No es un instrumento de diagnóstico autónomo y toda salida debe ser validada por un médico o radiólogo titulado.
- Clasificación binaria limitada: solo distingue TB frente a no TB; no detecta otras patologías torácicas (neumonía, nódulos, derrames, cardiomegalia) y no debe interpretarse como un lector radiológico general.
- Validación geográfica restringida: las cohortes de evaluación son de India y Pakistán (N=3.441 en total). El rendimiento en poblaciones africanas, europeas, latinoamericanas o en subgrupos pediátricos, pediátricos con VIH o pacientes inmunodeprimidos no está documentado.
- Deriva de dominio observada: la cohorte de Pakistán muestra el AUROC más bajo (0,9065) frente a las indias (0,9292-0,9347), lo que indica sensibilidad al cambio de distribución de los datos y obliga a revalidación local antes de cualquier uso.
- Metodología de conformal prediction no documentada: la etiqueta "conformal-prediction" del repositorio no va acompañada de tasas de cobertura, tamaños de conjunto de predicción ni procedimiento de calibración, por lo que no se pueden asumir garantías formales de cobertura.
- Riesgo de alucinación en el sentido clínico: como todo clasificador, puede producir falsos negativos con probabilidad alta de no TB en casos reales; el umbral operativo debe calibrarse según el contexto (un umbral orientado a cribado debe maximizar sensibilidad).
- Resolución de entrada limitada: el redimensionado a 224x224 puede eliminar hallazgos sutiles presentes en la radiografía original de mayor resolución.
- Preprocesado rígido: requiere RGB, 224x224 y normalización ImageNet; desviaciones en la conversión desde DICOM (ventana, nivel, inversión de escala de grises) pueden degradar el rendimiento.
- Licencia MIT: permite uso comercial y modificación sin restricciones de copyleft, pero la licencia del código no sustituye a las autorizaciones regulatorias necesarias para comercializar un producto sanitario.
- Ausencia de validación externa independiente: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, y todas las métricas proceden del propio autor, sin replicación por terceros.
- Idiomas: los metadatos declaran en e id, pero el modelo no procesa texto; no existe interfaz multilingüe ni capacidad de generar informes.

## Enlaces

- HuggingFace (repositorio del modelo): https://huggingface.co/Ressshh/tb-conformal-distilled-densenet121
- Búsqueda web realizada: no devolvió papers, blogs, repositorios ni demos relevantes sobre este modelo; los resultados obtenidos eran páginas genéricas de servicios de traducción, no relacionados con el contenido técnico. No se incluyen por no ser verificables ni pertinentes.
