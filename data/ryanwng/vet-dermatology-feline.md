# ryanWNG/vet-dermatology-feline

## Resumen

El modelo `ryanWNG/vet-dermatology-feline` es un clasificador de imágenes entrenado para distinguir cuatro afecciones dermatológicas cutáneas en gatos: alergia a pulgas (`Flea_Allergy`), piel sana (`Health`), tiña/dermatofitosis (`Ringworm`) y sarna (`Scabies`). Lo desarrolla el autor de HuggingFace `ryanWNG` en el contexto del hackathon Gemma 4 Good, como componente de visión del proyecto Howl Vision, cuyo repositorio se enlaza en la model card.

Técnicamente no es un modelo de lenguaje: es una red convolucional EfficientNetV2-S (variante `tf_efficientnetv2_s.in21k_ft_in1k` de `timm`) con la cabeza de clasificación reconfigurada a 4 clases, entrada RGB de 384×384 píxeles y normalización ImageNet. El checkpoint se distribuye como `state_dict` de PyTorch (`.pt`), no como safetensors ni GGUF, y el repositorio ocupa 0,2 GB.

Su relevancia es doble: por un lado, muestra un caso de uso veterinario real con métricas honestas sobre un conjunto de test reservado (exactitud del 90,1 %, F1-macro 0,902, kappa de Cohen 0,868 con n=152); por otro, ilustra el patrón de "modelo pequeño especializado + modelo generativo" habitual en pipelines multimodales, donde un clasificador de visión aporta la señal diagnóstica y un LLM redacta la explicación. El conjunto de entrenamiento es muy reducido (699 imágenes), lo que condiciona su robustez fuera del dominio de las fotos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (CNN con compound scaling), base `timm/tf_efficientnetv2_s.in21k_ft_in1k` preentrenada en ImageNet-21k y ajustada en ImageNet-1k; cabeza reemplazada por una capa de 4 clases |
| Parámetros totales | ≈21,5 M (cifra propia de la arquitectura EfficientNetV2-S; la model card no la declara explícitamente) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes; entrada fija de 384×384 RGB) |
| Tipos de cuantización | No se distribuyen pesos cuantizados. Al ser un `state_dict` de PyTorch, admite FP16 e INT8 (cuantización dinámica o estática) con herramientas estándar de PyTorch, ONNX Runtime o TensorRT; no validado en la model card |
| Idiomas soportados | No aplica (clasificación de imágenes). Etiquetas de clase en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch `.pt` (`vet_feline_dermatology.pt`) con las claves `model_state_dict` y, presumiblemente, estado del optimizador; no hay safetensors, GGUF ni ONNX publicados. Tamaño del repo: 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNetV2-S, familia de redes convolucionales que combina búsqueda de arquitectura con *compound scaling* y usa bloques Fused-MBConv en las etapas iniciales para mejorar la eficiencia en GPU. El modelo parte de pesos preentrenados en ImageNet-21k y refinados en ImageNet-1k, y se ha ajustado con una cabeza de 4 salidas. La entrada es de 384×384 píxeles en RGB con normalización ImageNet; el preprocesamiento exacto (resize, recorte, aumentos de datos) no se detalla en la model card.

El ajuste se realizó sobre 699 imágenes con AdamW (lr=1e-4) y un scheduler `CosineAnnealing`, con parada temprana en la época 16 de un máximo de 30. No se documenta el desglose del dataset por clase ni si hubo aumento de datos, ponderación de clases o estratificación del *split*; tampoco se menciona ningún tipo de alineamiento por preferencias (RLHF/DPO), algo que no aplica a una tarea de clasificación. La evaluación se hizo sobre un conjunto de test reservado de 152 imágenes, con intervalos de confianza de Wilson al 95 % para la exactitud.

## Capacidades

- Clasificación de imágenes en 4 clases cerradas: `Flea_Allergy`, `Health`, `Ringworm`, `Scabies`.
- Salida de una distribución de probabilidad sobre las 4 clases (softmax implícito en la cabeza de `timm`), reutilizable como puntuación de confianza para triaje.
- Entrada de una sola imagen de 384×384 RGB; no procesa vídeo, series ni lotes con estructura temporal de forma nativa.
- Inferencia en CPU y GPU; el checkpoint se carga con `timm.create_model(..., pretrained=False, num_classes=4)` y `load_state_dict`.
- No soporta *tool calling*, *function calling*, generación de texto, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de audio; no hay modo *thinking* ni cadena de razonamiento.
- No proporciona localización de lesiones (no es detección ni segmentación) ni explicaciones en lenguaje natural por sí mismo.

## Casos de uso

- **Triaje previo en consulta veterinaria**: el personal sube una foto de la lesión cutánea y el modelo devuelve una probabilidad por clase; con un umbral de confianza configurable se priorizan los casos compatibles con tiña o sarna, que requieren aislamiento y tratamiento urgente.
- **Aplicación móvil para tutores**: integrado en una app, permite al propietario obtener una orientación inicial ("posible alergia a pulgas") antes de pedir cita, reduciendo consultas evitables. El clasificador es lo bastante ligero (≈21,5 M de parámetros) para ejecutarse en el propio dispositivo vía ONNX Runtime o Core ML.
- **Telemedicina veterinaria**: como paso de pre-análisis en una plataforma de consulta remota, el modelo etiqueta la imagen y un LLM del pipeline (por ejemplo, el componente Gemma del proyecto Howl Vision) redacta la explicación dirigida al tutor a partir de la etiqueta y la confianza.
- **Anotación asistida de datasets**: pre-etiquetado de grandes volúmenes de fotos de dermatología felina para que un veterinario solo revise y corrija, acelerando la curación de corpus clínicos.
- **Screening en refugios y colonias felinas**: clasificación rápida de lesiones en campañas de campo con hardware modesto (portátil o incluso CPU), donde no hay acceso a un dermatólogo veterinario.
- **Seguimiento de evolución**: clasificando la misma lesión en visitas sucesivas se obtiene una traza de etiquetas y confianzas que ayuda a valorar si el cuadro evoluciona hacia piel sana o persiste; útil como señal complementaria, nunca como sustituto del criterio clínico.
- **Docencia y formación**: uso como ejemplo práctico de *transfer learning* médico-veterinario con datasets pequeños, incluyendo la discusión de intervalos de confianza y kappa en la evaluación.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test reservado (n=152):

| Métrica | Valor |
|---|---|
| Exactitud (*accuracy*) | 90,1 % (IC 95 % de Wilson: 84,4 % – 93,9 %) |
| F1-macro | 0,902 |
| Kappa de Cohen | 0,868 |

Rendimiento por clase (valores reportados en la model card):

| Clase | Valor reportado |
|---|---|
| `Flea_Allergy` | 0,904 |
| `Health` | 0,923 |
| `Ringworm` | 0,861 |
| `Scabies` | 0,919 |

No se han publicado comparaciones con otros modelos sobre este mismo conjunto de datos, ni resultados desagregados de precisión, sensibilidad o especificidad por clase más allá de los valores anteriores. No se reporta calibración de probabilidades.

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 2 GB en FP32 y del orden de 1 GB en FP16 para un lote de tamaño 1 a 384×384 (los pesos en FP32 ocupan ≈86 MB; el grueso del consumo son las activaciones). Cifra estimada a partir de la arquitectura, no publicada por el autor.
- **GPU recomendadas**: cualquier GPU con ≥4 GB de VRAM es suficiente. Para servicio de alto rendimiento, una NVIDIA T4, L4, A10 o superior; para desarrollo, una RTX 3060 o RTX 4090 están sobradamente dimensionadas.
- **GPU de consumo**: sí, cabe en cualquier GPU de consumo de los últimos años, e incluso en iGPU y en CPU para volúmenes bajos.
- **Opciones de despliegue**: PyTorch nativo, exportación a TorchScript, ONNX Runtime, TensorRT o Triton Inference Server para servir el modelo; envoltorio HTTP propio (FastAPI, BentoML). No aplican vLLM, llama.cpp, Ollama ni TGI, que son motores para modelos generativos de lenguaje.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de latencia ni de imágenes por segundo en ninguna GPU.

## Comparativa con modelos similares

No hay resultados comparativos publicados sobre el dataset de dermatología felina. La tabla recoge alternativas de la misma familia de tamaño y tarea, con datos de arquitectura; la columna de rendimiento en esta tarea queda como no disponible porque no se han evaluado.

| Modelo | Tipo | Parámetros (referencia) | Contexto / entrada | Licencia | Rendimiento en este dataset |
|---|---|---|---|---|---|
| `ryanWNG/vet-dermatology-feline` | EfficientNetV2-S ajustada | ≈21,5 M | 384×384 RGB | Apache 2.0 | Exactitud 90,1 %, F1-macro 0,902 (n=152) |
| EfficientNet-B0 (`timm`) | CNN | ≈5,3 M | 224×224 RGB | Apache 2.0 (implementación) | No disponible |
| ResNet-50 (`timm`) | CNN | ≈25,6 M | 224×224 RGB | Apache 2.0 (implementación) | No disponible |
| ConvNeXt-Tiny (`timm`) | CNN | ≈28,6 M | 224×224 RGB | Apache 2.0 (implementación) | No disponible |
| ViT-B/16 (`timm`) | Transformer de visión | ≈86 M | 224×224 RGB | Apache 2.0 (implementación) | No disponible |

Los recuentos de parámetros de las alternativas son cifras de arquitectura ampliamente publicadas, no mediciones realizadas sobre este dataset. Cualquier comparación de rendimiento requeriría reentrenar cada alternativa con el mismo *split* de 699/152 imágenes.

## Limitaciones y advertencias

- **Dataset muy pequeño**: 699 imágenes de entrenamiento y 152 de test implican intervalos de confianza amplios (la exactitud del 90,1 % va del 84,4 % al 93,9 %) y riesgo de sobreajuste a las condiciones de captura del corpus original.
- **Sin validación externa**: no se reporta una evaluación en un centro, país o dispositivo de cámara distinto, por lo que el rendimiento en producción puede degradarse frente al 90,1 % publicado.
- **Espacio de etiquetas cerrado**: solo cubre cuatro clases. Cualquier otra dermatosis felina (dermatitis alérgica no relacionada con pulgas, complejo eosinofílico, abscesos, neoplasias, micosis por otros hongos) se forzará a una de las cuatro categorías, generando falsos positivos con alta confianza.
- **Sin detección ni localización**: clasifica la imagen completa; una foto con varias lesiones o con el animal parcialmente en cuadro no se descompone por regiones.
- **Sin explicabilidad**: no genera texto, mapas de calor ni justificación. Cualquier explicación debe aportarla otro componente del pipeline (por ejemplo, un LLM que reciba la etiqueta y la confianza).
- **Riesgo de alucinación en el sistema completo**: si se combina con un modelo generativo que redacte el diagnóstico, este puede añadir recomendaciones no respaldadas por la señal del clasificador. El clasificador en sí no alucina, pero su salida es una probabilidad sobre cuatro clases, no un diagnóstico.
- **Sesgos no evaluados**: no se documenta la distribución de razas, edades, tipos de pelaje, iluminación ni calidad de cámara del dataset; los sesgos por raza o por tono de piel son plausibles y no se han medido.
- **Procedencia de los datos no declarada**: la model card no indica el origen ni la licencia de las 699 imágenes de entrenamiento. La licencia Apache 2.0 cubre los pesos, pero no necesariamente los datos subyacentes, lo que conviene verificar antes de un uso comercial.
- **No es un producto sanitario**: no hay validación regulatoria veterinaria, ni estudio clínico, ni umbrales operativos recomendados. No debe usarse como único criterio diagnóstico.
- **Adopción nula**: 0 descargas y 0 *likes* en el momento de la consulta, sin mantenimiento posterior (creado y actualizado el mismo día). No hay historial de versiones ni soporte.
- **Formato de pesos sin salvaguardas**: el checkpoint se carga con `torch.load(..., weights_only=False)`, lo que implica ejecutar código arbitrario potencialmente embebido en el fichero. Conviene auditar el `.pt` o reconvertirlo antes de usarlo en entornos compartidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryanWNG/vet-dermatology-feline
- Repositorio del proyecto Howl Vision (mencionado en la model card): https://github.com/ikchain
- Repositorio de `timm` (arquitectura base `tf_efficientnetv2_s.in21k_ft_in1k`): https://github.com/huggingface/pytorch-image-models
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces utilizables son los anteriores. No se han localizado paper, blog técnico ni demo asociados.
