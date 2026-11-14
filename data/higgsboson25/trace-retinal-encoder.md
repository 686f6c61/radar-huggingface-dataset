# higgsboson25/trace-retinal-encoder

## Resumen

TRACE (Trustworthy Retinal Contrastive Encoder) es un codificador de características visuales para fotografías de fondo de ojo en color, desarrollado por el equipo div4maxxers del BMSIT Bengaluru para el hackathon "Beyond Code 2026" de ZEISS India (tema 2). Se trata de un ResNet-50 congelado, entrenado sin etiquetas de enfermedad mediante aprendizaje autosupervisado contrastivo (MoCo v2) sobre 22.500 fotografías públicas de retina, con vistas aumentadas adaptadas al dominio retiniano y un simulador de artefactos de cámara. El modelo produce un vector de 2048 dimensiones normalizado en L2 a partir de imágenes de 384x384 píxeles.

El problema que aborda es la falta de etiquetas en imagen médica oftalmológica: en lugar de entrenar un clasificador supervisado para cada patología, TRACE genera representaciones genéricas que sirven como base para sondas lineales, detectores de hallazgos y clasificadores de confianza construidos sobre el codificador congelado. El repositorio incluye además 20 detectores de hallazgos calibrados (edema de disco, hemorragia, drusas, etc.), una capa de confianza con umbrales conformales por cámara, una puerta de calidad fotográfica y un banco de prototipos de enfermedades raras.

Es relevante ahora porque demuestra que un codificador autosupervisado puede igualar o superar a alternativas supervisadas en escenarios de generalización crítica: cámaras no vistas, patologías con pocas etiquetas y fotografías de baja calidad. Su licencia es de solo uso en investigación y no está certificado como dispositivo médico, por lo que su aplicabilidad en producción clínica es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-50 (torchvision, `fc = Identity`) entrenado con MoCo v2 |
| Parámetros totales | no disponible (ResNet-50 estándar ronda 23,5 M sin la capa fully-connected; no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 384x384 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | research-use-only (código MIT; pesos con licencia propia) |
| Formato de pesos | `encoder.pt` (state_dict de PyTorch); artefactos auxiliares en `.joblib` y `.npz` |

## Arquitectura y entrenamiento

El backbone es un ResNet-50 de torchvision con la capa fully-connected sustituida por una identidad, de modo que la salida es un vector de 2048 dimensiones normalizado en L2. El entrenamiento es autosupervisado con MoCo v2 (contrastive learning con cola de claves y momentum encoder) sobre 22.500 fotografías públicas de fondo de ojo. La innovación principal está en el diseño de las vistas aumentadas: "retina-safe views" que evitan transformaciones que destruirían información clínica, junto con un simulador de artefactos de cámara que introduce variaciones realistas de captura para mejorar la robustez ante dispositivos no vistos.

No se especifica en la información proporcionada el número de tokens de entrenamiento (no aplica en visión), la composición exacta del dataset más allá de las fuentes citadas (EyePACS, APTOS, RFMiD) ni si hubo fases de RLHF o DPO (no procede en un codificador contrastivo). Sobre el codificador congelado se construyen cabezas ligeras: 20 detectores de hallazgos calibrados, un clasificador de 7 clases con escalado de temperatura, umbrales conformales por cámara, umbrales OOD, una puerta de calidad fotográfica y un banco de prototipos para enfermedades raras.

## Capacidades

- Extracción de características visuales de fotografías de fondo de ojo: genera embeddings de 2048 dimensiones normalizados en L2.
- Detección de 20 hallazgos clínicos calibrados: edema de disco, hemorragia, drusas y otros, mediante cabezas entrenadas sobre el codificador congelado.
- Clasificación de 7 clases con calibración de temperatura y umbrales conformales por cámara.
- Detección fuera de distribución (OOD) para identificar imágenes que no corresponden a la distribución de entrenamiento.
- Puerta de calidad fotográfica para descartar capturas no aptas.
- Búsqueda por similitud contra un banco de prototipos de enfermedades raras.
- Robustez ante cámaras no vistas y fotografías de baja calidad, validada en pruebas de estrés.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual de extracción de características.

## Casos de uso

- Triaje automatizado de retinografías en campañas de cribado: el codificador extrae embeddings que alimentan sondas lineales para detectar patologías frecuentes, permitiendo priorizar revisiones humanas en entornos con pocos oftalmólogos.
- Segunda lectura asistida en consulta: los 20 detectores de hallazgos calibrados pueden señalar regiones y patologías sospechosas sobre la imagen, sirviendo de apoyo al especialista sin sustituir su criterio.
- Control de calidad de capturas en dispositivos de adquisición: la puerta de calidad fotográfica descarta imágenes desenfocadas o mal expuestas antes de que lleguen al pipeline de análisis.
- Investigación en enfermedades raras: el banco de prototipos permite buscar casos similares por similitud de embeddings en cohortes pequeñas donde no hay suficientes etiquetas para entrenar un clasificador específico.
- Evaluación de generalización entre cámaras: los umbrales conformales por cámara y los resultados en cámaras no vistas (Kowa, Topcon OCT-2000) permiten estudiar el comportamiento del modelo al desplegarse en nuevos hospitales.
- Detección de anomalías y casos OOD: los umbrales OOD identifican imágenes atípicas o de dominios distintos, útiles para derivar casos a revisión experta o para monitorizar la deriva del modelo.
- Extracción de características para modelos downstream: equipos de investigación pueden usar el codificador congelado como extractor genérico y entrenar sus propias cabezas ligeras sin reentrenar el backbone.

## Benchmarks y rendimiento

| Prueba | ImageNet R50 | MoCo v2 simple | R50 supervisado | TRACE |
|---|---|---|---|---|
| RFMiD test, 18 etiquetas, sonda lineal AUROC | 0,885 | 0,917 | 0,918 | 0,917 |
| Cámara no vista (Kowa / Topcon OCT-2000 retenidos) | 0,867 / 0,796 | 0,903 / 0,809 | — | 0,921 / 0,858 |
| JSIEC-1000, 39 enfermedades, 5 fotos cada una, top-1 | 0,536 | 0,611 | 0,571 | 0,628 |
| Prueba de estrés, error relativo frente a ImageNet (menor es mejor) | 1,00 | 0,72 | 0,74 | 0,67 |

La información proporcionada indica que el baseline supervisado, ajustado con las etiquetas de RFMiD, supera a TRACE en las enfermedades propias de RFMiD (0,941 con su propia cabeza) y en retinopatía diabética en un hospital nuevo. La ventaja de TRACE se concentra en enfermedades con pocas etiquetas, cámaras nuevas y fotografías de baja calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un ResNet-50 en FP32 ocupa aproximadamente 100 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, aunque esta cifra no está confirmada en la información.
- GPU recomendadas: no especificadas por el autor; por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia.
- Cabe en GPU consumer: sí, por el tamaño del backbone (ResNet-50) y el tamaño del repositorio (0,2 GB).
- Opciones de despliegue: el autor proporciona un demo con `python -m demo.app` servido en `http://127.0.0.1:7860`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / entrada | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRACE | ResNet-50 + MoCo v2 | 384x384 píxeles | RFMiD AUROC 0,917; cámara no vista 0,921 / 0,858 | research-use-only | Hugging Face y GitHub |
| ImageNet R50 | ResNet-50 preentrenado en ImageNet | 224x224 píxeles (estándar) | RFMiD AUROC 0,885; cámara no vista 0,867 / 0,796 | licencia torchvision | torchvision |
| MoCo v2 simple | ResNet-50 + MoCo v2 genérico | no disponible | RFMiD AUROC 0,917; cámara no vista 0,903 / 0,809 | no disponible | no disponible |
| R50 supervisado en RFMiD | ResNet-50 con etiquetas | no disponible | RFMiD AUROC 0,918 (0,941 con su propia cabeza) | no disponible | no disponible |

No se dispone de información sobre otros codificadores retinales comparables (por ejemplo, RETFound u otros modelos de fundus) en los datos proporcionados, por lo que la comparativa se limita a los baselines incluidos por el propio autor.

## Limitaciones y advertencias

- Licencia de solo uso en investigación: los pesos no pueden usarse comercialmente ni en producción clínica sin verificar los términos de los datasets de origen (EyePACS, APTOS, RFMiD).
- No es un dispositivo médico: el autor lo declara explícitamente; no debe usarse para diagnóstico ni decisiones clínicas.
- Los archivos `.joblib` son pickles de Python y deben cargarse únicamente desde este repositorio por riesgo de ejecución de código arbitrario.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenar con datasets públicos de origen y composición demográfica no detallada, es probable que existan sesgos de población y de dispositivo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los detectores de hallazgos pueden producir falsos positivos y falsos negativos; su calibración depende de los umbrales conformales por cámara.
- Limitaciones de contexto o idioma: no aplica idioma; la entrada está restringida a imágenes de fondo de ojo y el rendimiento cae fuera de esa distribución, como refleja la existencia de umbrales OOD.
- El baseline supervisado supera a TRACE en las enfermedades de RFMiD y en retinopatía diabética en un hospital nuevo, por lo que TRACE no es universalmente superior.
- La información sobre cuantización, latencia, throughput y requisitos de hardware es escasa; habría que validarla antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/higgsboson25/trace-retinal-encoder
- Repositorio GitHub (código, model card completa, data card y resultados): https://github.com/nithinj25/zesis-contrastive-learning
- Licencia y model card en GitHub: https://github.com/nithinj25/zesis-contrastive-learning/blob/master/MODEL_CARD.md
