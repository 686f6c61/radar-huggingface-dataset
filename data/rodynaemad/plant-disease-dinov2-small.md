# rodynaemad/plant-disease-dinov2-small

## Resumen

Plant-disease-dinov2-small es un clasificador de imágenes para diagnóstico de enfermedades de plantas publicado por el usuario rodynaemad en Hugging Face. Se construye sobre el backbone congelado facebook/dinov2-small (ViT-small, 22.085.798 parámetros totales) al que se añade una única capa lineal entrenada como regresión logística multinomial. El modelo distingue 38 clases de cultivo-condición: 26 enfermedades y 12 clases sanas repartidas en 14 cultivos.

El problema que resuelve es acotado pero muy concreto: a partir de la fotografía de una hoja aislada, asignar una etiqueta fitopatológica entre las 38 del dataset PlantVillage. Su relevancia está en dos detalles metodológicos poco habituales en este tipo de publicaciones: la evaluación se hace sobre un split agrupado por hoja física (usando leaf-map.json), de modo que ninguna hoja aparece a la vez en entrenamiento y test, y se publican exportaciones ONNX en fp32 (88 MB) e int8 (24 MB) que permiten ejecutar la inferencia íntegramente en el navegador.

Forma parte del proyecto de fin de grado BloomTech (IA + IoT para agricultura inteligente) y está pensado como el componente de visión del sistema. No es un modelo generativo ni multimodal: es un clasificador cerrado de 38 clases, con entrada fija de 224×224 píxeles normalizada con estadísticos de ImageNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-small (DINOv2) congelado + cabeza lineal (regresion logistica multinomial) |
| Parametros totales | 22.085.798 (el clasificador 768→38 aporta 29.222; el backbone ronda los 22,06 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica: clasificacion de imagenes con entrada fija de 1x3x224x224 |
| Tipos de cuantizacion | ONNX fp32 (88 MB) y ONNX int8 (24 MB); no se publican GGUF ni otros formatos cuantizados |
| Idiomas soportados | no aplica (modelo de vision); etiquetas de clase en ingles |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (PyTorch/transformers) y ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

La arquitectura es un ViT-small de DINOv2 utilizado como extractor de características congelado. Las características que alimentan al clasificador son la concatenación del token CLS y la media de los patch tokens, 768 dimensiones en total, exactamente la misma representación que `Dinov2ForImageClassification` entrega a su capa de clasificación. Sobre esas características se ajusta una regresión logística multinomial con las características estandarizadas, con la estandarización plegada dentro de la capa lineal final. No hay fine-tuning del backbone ni cabe hablar de RLHF o DPO: es un ajuste de una única capa sobre representaciones preentrenadas.

El entrenamiento usa las 54.305 imágenes en color de PlantVillage, repartidas en 43.443 de entrenamiento y 10.862 de test con un split estratificado 80/20 agrupado por hoja física: todas las fotos de una misma hoja caen en un único lado del split, verificado de forma explícita. Para las 13.815 imágenes sin mapeo de hoja, el reparto se hizo foto a foto. La fuerza de regularización (C = 0.1) se eligió sobre un split de validación agrupado por hoja extraído del conjunto de entrenamiento; la precisión de validación se mantuvo en el rango 98,4–98,6 % para C ∈ {0,1; 0,3; 1; 3}. Como comprobación de integridad, el modelo exportado a transformers reproduce las predicciones del clasificador entrenado en el 100 % de 200 imágenes de test muestreadas, y la exportación ONNX fp32 coincide exactamente con PyTorch.

## Capacidades

- Clasificación de imágenes en 38 clases cerradas: 26 enfermedades y 12 clases sanas de 14 cultivos (manzana, arándano, cereza, maíz, uva, naranja, melocotón, pimiento, patata, frambuesa, soja, calabaza, fresa y tomate).
- Extracción de características de 768 dimensiones (CLS + media de patch tokens) en la misma pasada que devuelve los logits, lo que habilita comprobaciones de fuera de distribución.
- Inferencia en navegador mediante ONNX Runtime Web con el modelo int8 de 24 MB.
- Salida de probabilidades por clase (`pipeline("image-classification")` con `top_k`), apta para umbrales de confianza.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: sus etiquetas de salida están en inglés y no procesa texto.
- No realiza detección de objetos, segmentación ni localización de lesiones: asume una única hoja en la imagen.
- No dispone de modo de razonamiento (thinking mode), audio ni vídeo.

## Casos de uso

- Triaje en laboratorio de fitopatología: dado un lote de fotografías de hojas sobre fondo liso, el modelo pre-etiqueta las 38 clases y el personal humano revisa únicamente los casos con probabilidad baja. El coste de la capa lineal y el backbone congelado hace que el proceso sea muy barato por imagen.
- Pre-etiquetado para anotación de datasets: al devolver logits y características de 768 dimensiones en una sola pasada, sirve como primer paso de un pipeline de anotación asistida, reduciendo el trabajo manual antes de la revisión final.
- Aplicación web o móvil de diagnóstico para agricultura: con la exportación int8 de 24 MB, la inferencia puede ejecutarse en el navegador con onnxruntime-web sin enviar imágenes a un servidor, lo que simplifica el cumplimiento de privacidad y funciona con conectividad limitada.
- Componente de visión en sistemas IoT de agricultura de precisión: integrado en plataformas tipo BloomTech, la clase detectada puede disparar reglas de actuación (alertas, programación de riego, registro de foco) en función de la enfermedad identificada.
- Control de calidad en viveros e invernaderos: en estaciones con fotografía controlada (fondo uniforme, iluminación estable, una hoja por captura), el modelo puede inspeccionar lotes de forma sistemática y marcar desviaciones respecto al estado sano.
- Filtro de fuera de distribución: antes de clasificar, usar la distancia de las características de 768 dimensiones frente a las clases conocidas para descartar imágenes que no correspondan a ninguna de las 38 clases, evitando predicciones forzadas sobre material no soportado.
- Material divulgativo y educativo: aplicaciones que muestran las tres clases más probables con su puntuación permiten ilustrar síntomas de enfermedades frecuentes en cursos de agronomía, siempre con la advertencia de que el modelo trabaja sobre hojas aisladas y no sobre campo.
- Despliegue en edge sin GPU: al ser un modelo de 22 M de parámetros, la inferencia en CPU es viable en dispositivos modestos, lo que permite integrarlo en gateways agrícolas o en estaciones de captura en campo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. El autor marca las métricas como no verificadas y especifica que la evaluación es sobre hojas nunca vistas en entrenamiento (split agrupado por hoja, 10.862 fotos de test).

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy (hojas no vistas) | 0,9886 (98,9 %) | PlantVillage en color, test agrupado por hoja |
| Macro F1 (hojas no vistas) | 0,9849 (98,5 %) | PlantVillage en color, test agrupado por hoja |
| Accuracy con split aleatorio a nivel de foto (referencia) | 0,991 (99,1 %) | Mismo conjunto, partición ingenua |
| Accuracy ONNX int8 | 98,7 % | Test completo a nivel de hoja |
| Macro F1 ONNX int8 | 98,1 % | Test completo a nivel de hoja |
| Precisión de validación durante el ajuste | 98,4–98,6 % | Split de validación agrupado por hoja, C ∈ {0,1; 0,3; 1; 3} |

Clases con menor F1 sobre hojas no vistas, según el autor:

| Cultivo | Condicion | F1 |
|---|---|---|
| Maiz | Cercospora leaf spot / Gray leaf spot | 0,900 |
| Patata | sana | 0,915 |
| Tomate | Early blight | 0,924 |
| Maiz | Northern Leaf Blight | 0,949 |
| Tomate | Target Spot | 0,958 |
| Tomate | Late blight | 0,966 |
| Tomate | Bacterial spot | 0,967 |
| Tomate | Spider mites (Two-spotted spider mite) | 0,972 |
| Patata | Late blight | 0,972 |
| Tomate | Leaf Mold | 0,974 |

27 de las 38 clases alcanzan F1 ≥ 0,99. La confusión principal se produce entre las dos enfermedades de hoja del maíz (gray leaf spot y northern leaf blight), de aspecto similar. La clase «patata sana» solo cuenta con 152 fotos en todo el dataset. No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (los pesos ocupan unos 88 MB y el resto es activación de un ViT-small con entrada 224×224); en int8 los pesos bajan a unos 24 MB.
- GPU recomendadas: no se necesita GPU. Cualquier GPU con más de 1 GB de memoria sirve; una RTX 4090, A100 o H100 estarían enormemente sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU. También es viable en CPU y en navegador mediante WebAssembly/WebGPU con onnxruntime-web.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime (fp32 o int8), onnxruntime-web para navegador, Hugging Face Inference Endpoints (el modelo está marcado como `endpoints_compatible`) y el Space oficial Plant Disease Scanner. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de imágenes por segundo para ninguna de las dos exportaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Formato | Metricas en PlantVillage |
|---|---|---|---|---|---|
| rodynaemad/plant-disease-dinov2-small | 22.085.798 | 1x3x224x224 | cc-by-sa-4.0 | safetensors, ONNX fp32/int8 | 98,9 % accuracy y 98,5 % macro F1 con split agrupado por hoja (declarado por el autor, no verificado) |
| facebook/dinov2-small (modelo base) | no disponible en la informacion proporcionada (el modelo afinado totaliza 22,09 M con la cabeza de 29.222 parametros) | 1x3x224x224 | no disponible en la informacion proporcionada | safetensors | no aplica: backbone sin cabeza de clasificacion de 38 clases |
| Clasificadores clasicos sobre PlantVillage (ResNet, EfficientNet y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de alternativas evaluadas con el mismo split agrupado por hoja, por lo que no es posible establecer una comparación de rendimiento fiable. El único punto de referencia directo es la comparación interna entre el split agrupado por hoja (98,9 %) y el split aleatorio a nivel de foto (99,1 %), que el propio autor reporta para mostrar que la inflación por fuga de datos es pequeña en este caso.

## Limitaciones y advertencias

- Sesgo de dominio severo: PlantVillage contiene fotografías de laboratorio con una única hoja separada sobre fondo liso. Con fotos de campo (varias hojas, sombras, suciedad, otras cámaras) la precisión será sustancialmente menor. El 98,9 % no debe interpretarse como rendimiento en campo.
- Conjunto cerrado de 38 clases: cualquier imagen de otro cultivo, otra enfermedad o una plaga no incluida se verá forzada a una de las 38 etiquetas, sin opción de «desconocido» salvo que se implemente un filtro externo usando las características de 768 dimensiones.
- Confusión documentada entre las dos enfermedades de hoja del maíz (gray leaf spot y northern leaf blight), con F1 de 0,900 y 0,949 respectivamente.
- Clases con muy pocos ejemplos: «patata sana» dispone solo de 152 fotos en todo el dataset, lo que se refleja en un F1 de 0,915.
- Riesgo de alucinación en el sentido de falsos positivos: el modelo siempre devuelve una distribución sobre 38 clases y una confianza alta no garantiza que la imagen contenga una hoja del cultivo esperado. En producción conviene fijar umbrales de confianza y un mecanismo de rechazo.
- El autor declara las métricas como no verificadas en el model-index; los valores proceden de la propia model card y no de una evaluación independiente.
- Licencia cc-by-sa-4.0: permite uso comercial, pero impone atribución y licencia compartida igual (share-alike) sobre las obras derivadas, lo que puede condicionar su integración en productos propietarios. Conviene revisar las implicaciones antes de desplegarlo en un producto cerrado.
- Cero descargas y cero «likes» en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- El modelo solo clasifica: no localiza lesiones, no segmenta, no cuenta hojas y no genera explicaciones textuales. Requiere que la imagen contenga una única hoja como sujeto principal.
- No se documentan consideraciones de sesgo geográfico, de variedades locales ni de condiciones de captura más allá de las advertencias sobre fotografía de laboratorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rodynaemad/plant-disease-dinov2-small
- Modelo base: https://huggingface.co/facebook/dinov2-small
- Dataset PlantVillage: https://huggingface.co/datasets/mohanty/PlantVillage
- Demo (Space): https://huggingface.co/spaces/rodynaemad/plant-disease-scanner
- Proyecto BloomTech (repositorio): https://github.com/itsRou/bloomtech-smart-agriculture
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
