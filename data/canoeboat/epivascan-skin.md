# CanoeBoat/epivascan-skin

## Resumen

EpivaScan skin-condition classifier es un modelo de clasificación de imágenes dermatológicas desarrollado por el usuario CanoeBoat, construido mediante fine-tuning del modelo base facebook/dinov2-base. Su función es recibir una fotografía de una lesión cutánea y devolver una lista de afecciones dermatológicas ordenadas por probabilidad, junto con un porcentaje de similitud para cada una. El modelo cubre 13 condiciones específicas (eccema, dermatitis de contacto, urticaria, picadura de insecto, foliculitis, psoriasis, tiña, herpes labial, herpes zóster, acné, impétigo, pitiriasis rosada y exantema medicamentoso) más una categoría residual "Other / unclear".

El modelo emplea una arquitectura transformer de visión (ViT) heredada de DINOv2-base, con 86,6 millones de parámetros totales y un tamaño de repositorio de 0,3 GB en formato safetensors. Está entrenado sobre el dataset google/scin (Skin Condition Image Network), compuesto por fotografías aportadas con consentimiento por usuarios de internet en Estados Unidos y etiquetadas por dermatólogos. El conjunto utilizado comprende 3.048 casos y 6.494 fotografías, con etiquetas de diferencial ponderado (varias condiciones con pesos que suman 1).

Su relevancia radica en que aborda un caso de uso sanitario concreto —el triaje visual de afecciones cutáneas— con una transparencia inusual en la publicación de métricas desagregadas por tono de piel y por condición. No obstante, el propio autor lo presenta explícitamente como una ayuda de cribado en desarrollo, no como un dispositivo médico ni una herramienta diagnóstica validada clínicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT), fine-tuning de facebook/dinov2-base |
| Parametros totales | 86.601.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de imagen, no generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | SCIN Data Use License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de facebook/dinov2-base, un Vision Transformer preentrenado con auto-supervisión (DINOv2) que actúa como extractor de características visuales. Sobre esa base se ha realizado un fine-tuning supervisado para clasificación de imágenes dermatológicas en 14 clases (13 condiciones más "Other / unclear"). El pipeline declarado es image-classification y la librería de referencia es transformers.

El entrenamiento utiliza el dataset google/scin, con 3.048 casos y 6.494 fotografías, excluyendo los casos que los dermatólogos no pudieron graduar. Las etiquetas no son one-hot, sino un diferencial ponderado por caso: varias condiciones con pesos que suman 1, y el modelo se entrena sobre esa distribución completa. La partición de datos es 70/15/15 por caso, estratificada por condición y grupo de tono de piel, garantizando que las fotos de una misma persona no aparezcan en train y test simultáneamente. Como innovación de calibración, se ajustó una temperatura de 0,94 sobre el conjunto de validación y se incorporó a la capa final, de modo que las probabilidades de salida están calibradas de forma nativa (ECE de 6,4 puntos en test).

## Capacidades

- Clasificación de imágenes de lesiones cutáneas en 13 condiciones dermatológicas más una categoría residual.
- Devolución de hasta top-k coincidencias con puntuación porcentual por clase.
- Salida calibrada mediante temperature scaling integrado en la capa final.
- Manejo de etiquetas de diferencial ponderado, lo que permite reflejar ambigüedad diagnóstica real.
- Capacidad de identificar la condición correcta entre las 3 primeras predicciones en el 85 % de los casos de test.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un clasificador de imagen puro).
- No procesa texto ni audio; no dispone de modo thinking ni capacidades generativas.
- Capacidades multilingües no aplicables (sin entrada/salida de texto).

## Casos de uso

- **Triaje previo a consulta dermatológica:** una aplicación móvil podría enviar una foto de una lesión y obtener una lista ordenada de posibles condiciones con su porcentaje, ayudando al usuario a decidir si debe acudir a un especialista. El modelo es adecuado porque devuelve top-3 con cobertura del 85 % en el conjunto de test.
- **Herramienta de apoyo en telemedicina:** integrado en un flujo de consulta remota, el clasificador puede priorizar casos según la condición sugerida y derivar a revisión humana los que caigan en "Other / unclear" o en condiciones de baja confianza.
- **Educación dermatológica:** como recurso docente, permite a estudiantes comparar la predicción del modelo con el diagnóstico del instructor, usando la distribución de probabilidades como material para discutir diferenciales.
- **Investigación en sesgos de tono de piel:** el modelo publica métricas desagregadas por Fitzpatrick y Monk, lo que lo convierte en un punto de partida para estudiar el rendimiento de clasificadores dermatológicos en pieles oscuras (aunque el propio autor advierte de la escasez de casos V-VI).
- **Preprocesado en pipelines de imagen médica:** puede actuar como primer filtro para etiquetar automáticamente grandes volúmenes de fotos cutáneas antes de una revisión dermatológica, reduciendo el trabajo manual de clasificación preliminar.
- **Prototipado de aplicaciones de salud digital:** al ser un modelo pequeño (86,6 M de parámetros, 0,3 GB) y compatible con el pipeline de transformers, es viable desplegarlo en entornos con recursos limitados para validar pruebas de concepto antes de invertir en modelos mayores.
- **Detección de condiciones frecuentes en atención primaria:** para afecciones con buen rendimiento en top-3 (dermatitis de contacto 92 %, herpes labial 96 %, exantema medicamentoso 93 %), puede servir como recordatorio de diferenciales en entornos no especializados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test retenido (458 casos, 1.002 fotos, nunca usadas en entrenamiento ni ajuste). Los intervalos son del 95 %.

| Medida | Resultado |
|---|---|
| Acierto en la primera coincidencia | 47 % (43-51) |
| Condición correcta en el top 3 | 85 % (82-88) |
| Exactitud balanceada por condición | 51 % |
| Brecha de calibración (ECE) | 6,4 puntos |

Rendimiento por condición (test):

| Condición | Casos test | Top-1 correcto | En top 3 | Precisión cuando se nombra |
|---|---:|---|---|---|
| Eczema (dermatitis) | 72 | 30 % (22-39) | 82 % (74-89) | 52 % |
| Contact dermatitis | 72 | 62 % (51-72) | 92 % (87-97) | 42 % |
| Hives (urticaria) | 33 | 57 % (43-71) | 71 % (55-85) | 74 % |
| Insect bite | 28 | 46 % (29-66) | 69 % (52-85) | 38 % |
| Folliculitis | 18 | 43 % (25-61) | 76 % (59-90) | 31 % |
| Psoriasis | 15 | 36 % (19-53) | 78 % (56-95) | 29 % |
| Tinea (ringworm) | 15 | 41 % (21-66) | 69 % (44-93) | 37 % |
| Cold sore (herpes simplex) | 12 | 50 % (28-65) | 96 % (83-100) | 44 % |
| Shingles (herpes zoster) | 9 | 78 % (56-100) | 89 % (74-100) | 38 % |
| Acne | 8 | 47 % (24-75) | 82 % (62-100) | 22 % |
| Impetigo | 8 | 59 % (27-88) | 86 % (72-96) | 14 % |
| Pityriasis rosea | 9 | 67 % (36-91) | 83 % (60-100) | 47 % |
| Drug rash | 6 | 50 % (30-69) | 93 % (79-100) | 23 % |
| Other / unclear | 153 | 44 % (37-51) | 89 % (85-93) | 68 % |

Rendimiento por tono de piel:

| Grupo | Casos test | Top-1 correcto | En top 3 |
|---|---|---|---|
| Fitzpatrick I-II | 197 | 39 % (33-44) | 80 % (75-85) |
| Fitzpatrick III-IV | 206 | 53 % (47-58) | 88 % (84-92) |
| Fitzpatrick V-VI | 41 | 59 % (46-72) | 89 % (79-97) |
| Monk 1-3 | 326 | 47 % (42-52) | 85 % (81-88) |
| Monk 4-6 | 124 | 45 % (38-53) | 84 % (79-89) |
| Monk 7-10 | 8 | 68 % (41-92) | 95 % (86-100) |

No se han publicado comparaciones directas con otros modelos dermatológicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 86,6 M de parámetros y pesos en safetensors de aproximadamente 0,3 GB en fp32; en fp16 rondaría 0,17 GB y en int8 unos 0,09 GB, por lo que la huella de memoria es mínima.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; una RTX 3060, RTX 4090, A100 o H100 lo ejecutan sin problema, pero el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe en cualquier GPU de consumo actual e incluso en CPU para inferencia puntual, dado su reducido tamaño.
- Opciones de despliegue: pipeline de transformers (image-classification), exportación a ONNX, TorchScript o TensorRT para producción; compatible con endpoints de HuggingFace (endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanoeBoat/epivascan-skin | 86,6 M | Imagen (ViT) | Clasificación dermatológica (13+1 clases) | SCIN Data Use License | HuggingFace |
| facebook/dinov2-base (base) | 86 M | Imagen (ViT) | Extracción de características visuales genéricas | Apache 2.0 (según modelo original) | HuggingFace |
| Modelos dermatológicos comerciales | No disponible | No disponible | Diagnóstico dermatológico | Propietaria | No disponible públicamente |

La comparación con alternativas dermatológicas específicas no está disponible en la información proporcionada. El modelo base DINOv2-base es la referencia arquitectónica directa, pero no es un clasificador dermatológico por sí mismo.

## Limitaciones y advertencias

- Solo puede nombrar las 13 condiciones entrenadas; cualquier otra afección se clasifica como "Other / unclear" o se confunde con una condición similar.
- La piel oscura está infrarrepresentada: solo 41 casos Fitzpatrick V-VI en test, insuficientes para demostrar un rendimiento equivalente.
- Diez condiciones tienen menos de 30 casos de test (insect bite, folliculitis, psoriasis, tinea, cold sore, shingles, acne, impetigo, pityriasis rosea, drug rash), por lo que sus métricas son aproximadas.
- Todos los contribuyentes del dataset eran adultos; el modelo no está probado en niños.
- Las fotos provienen de usuarios de internet en Estados Unidos; condiciones comunes en otras regiones y fotos tomadas en otros entornos pueden manejarse mal.
- El modelo solo ve una foto: no puede palpar textura, tomar historia clínica ni examinar el resto de la piel.
- Las etiquetas de referencia son opiniones de dermatólogos a partir de fotos, no diagnósticos confirmados.
- El autor declara explícitamente que es una ayuda de cribado en desarrollo, no un dispositivo médico, y que no ha sido validado en clínica ni en campo.
- Un porcentaje indica similitud con una condición, no la probabilidad de que la persona la tenga.
- Licencia SCIN Data Use License: es necesario revisar sus términos para uso comercial; no es una licencia permisiva estándar (Apache, MIT).
- Riesgo de alucinación en el sentido de asignar una condición plausible a una lesión no cubierta; el ECE de 6,4 puntos indica que las probabilidades no son perfectamente fieles.
- No apto para uso diagnóstico autónomo ni para sustituir la valoración de un profesional sanitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CanoeBoat/epivascan-skin
- Modelo base DINOv2: https://huggingface.co/facebook/dinov2-base
- Dataset SCIN: https://huggingface.co/datasets/google/scin
- Licencia SCIN Data Use License: https://github.com/google-research-datasets/scin/blob/main/LICENSE
- Repositorio SCIN en GitHub: https://github.com/google-research-datasets/scin
