# FaisalALMallah/team-012-nutri

## Resumen

Nouri produce classifier es un modelo de clasificación de imágenes desarrollado por FaisalALMallah en el contexto del hackathon qai-hf-hackathon-2026. Se trata de un fine-tuning del modelo base `timm/mobilenetv3_small_100.lamb_in1k`, preentrenado en ImageNet-1k, especializado en reconocer 30 variedades de frutas y verduras crudas comunes en la cocina catarí. El modelo forma parte de Nouri, un juego educativo de nutrición para niños en Qatar, donde actúa como primer filtro rápido de reconocimiento de alimentos junto a un reconocedor basado en VLM (SmolVLM).

El modelo resuelve el problema de identificar ingredientes individuales en fotografías tomadas por niños, con un enfoque de bajísima latencia (7,5 ms por imagen en CPU) y un tamaño reducido de 1,55 millones de parámetros. Su relevancia radica en demostrar que un clasificador extremadamente compacto puede alcanzar un 96,2 % de precisión en un dominio acotado de 30 clases, habilitando su despliegue en dispositivos sin GPU.

La arquitectura es una MobileNetV3-Small, una red convolucional optimizada para eficiencia computacional, con un contexto de clasificación de imágenes de 224×224 píxeles. No se dispone de información sobre longitud de contexto en tokens al tratarse de un modelo de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN) |
| Parametros totales | 1,55 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 224×224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes, etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `timm.create_model` con `hf-hub`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de MobileNetV3-Small, una red neuronal convolucional diseñada mediante búsqueda de arquitectura (NAS) y optimizada para dispositivos móviles, presentada por Howard et al. en ICCV 2019. La variante base `mobilenetv3_small_100.lamb_in1k` fue preentrenada en ImageNet-1k con el optimizador LAMB y posteriormente ajustada sobre el dataset de alimentos.

El entrenamiento se realizó sobre 5.004 imágenes del dataset `ibrahimdaud/raw-food-recognition` (licencia MIT), filtrando únicamente las clases presentes en la taxonomía infantil de Nouri y muestreando hasta 250 imágenes de entrenamiento y 50 de validación por clase. Se entrenó durante 6 épocas con AdamW y scheduler OneCycle, label smoothing de 0,1, en una GPU A10G (HF Jobs `a10g-small`), con un tiempo de 775 segundos y un coste aproximado de 0,25 dólares. El seguimiento se realizó con Trackio en el proyecto `nouri-produce-classifier`. No se menciona uso de RLHF, DPO ni técnicas de decodificación especulativa, al no ser aplicables a un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes de frutas y verduras crudas en 30 clases: apple, banana, orange, carrot, cucumber, tomato, broccoli, spinach, bell pepper, potato, sweet potato, eggplant, zucchini, okra, peas, corn, cauliflower, cabbage, lettuce, onion, mango, pineapple, pomegranate, pear, kiwi, grapes, strawberry, watermelon, lemon y fig.
- Reconocimiento de un único elemento de producto por imagen, orientado a fotografías tomadas por niños.
- Salida de nombres de alimentos (no de calorías ni valores nutricionales), con umbral de confianza de 0,6 para aceptar una predicción en la aplicación Nouri.
- Inferencia en CPU con latencia de 7,5 ms por imagen de 224×224, lo que permite su uso en dispositivos sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (las etiquetas están en inglés).
- No dispone de modo thinking, visión general, audio ni otras capacidades más allá de la clasificación de imágenes.

## Casos de uso

- **Juego educativo de nutrición para niños (Nouri)**: el modelo actúa como primer filtro de reconocimiento de ingredientes en las fotografías que suben los niños, añadiendo una predicción a la imagen solo si la confianza es ≥ 0,6. Su latencia de 7,5 ms en CPU permite una respuesta inmediata sin necesidad de GPU.
- **Aplicaciones móviles de reconocimiento de alimentos sin conexión**: al ser un modelo de 1,55 M de parámetros y ejecutarse en CPU, puede integrarse en apps Android o iOS para identificar frutas y verduras localmente, sin enviar imágenes a servidores externos.
- **Sistemas de inventario doméstico ligero**: un usuario fotografía su nevería o frutero y el modelo identifica qué productos hay, útil en aplicaciones de gestión de despensa con requisitos mínimos de hardware.
- **Educación alimentaria en escuelas**: integrado en actividades didácticas donde los alumnos fotografían alimentos y el sistema les devuelve el nombre del producto, fomentando el reconocimiento de frutas y verduras.
- **Pre-filtrado en pipelines de visión más complejos**: dado su bajo coste computacional, puede usarse como primera etapa para descartar imágenes que no contienen productos crudos antes de pasarlas a un VLM más pesado como SmolVLM, reduciendo el coste total de inferencia.
- **Prototipado rápido de clasificadores de dominio acotado**: sirve como ejemplo reproducible de fine-tuning de MobileNetV3-Small con timm en HF Jobs, con un coste de entrenamiento de 0,25 dólares, para equipos que necesiten validar una idea de clasificación de imágenes con pocos recursos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de validación (1166 imágenes reservadas, 30 clases) | 96,2 % |
| Latencia en CPU (1 imagen 224×224) | 7,5 ms |
| Imágenes de entrenamiento | 5.004 |
| Épocas | 6 |
| Tiempo de entrenamiento | 775 s en A10G |
| Coste de entrenamiento | ≈ 0,25 USD |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 1,55 M de parámetros y puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU moderna. Para entrenamiento se usó una NVIDIA A10G.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de borde y móviles.
- Opciones de despliegue: timm con PyTorch (`timm.create_model("hf-hub:FaisalALMallah/nouri-produce-mobilenetv3", pretrained=True)`), exportación a ONNX o TorchScript para móvil; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia: 7,5 ms por imagen en CPU; el throughput no se especifica, pero a esa latencia permitiría más de 100 imágenes por segundo en un solo hilo de CPU en condiciones ideales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouri produce classifier (MobileNetV3-Small) | 1,55 M | Imagen 224×224 | 96,2 % en 30 clases | MIT | Hugging Face (timm) |
| MobileNetV3-Small base (ImageNet-1k) | 1,55 M | Imagen 224×224 | no disponible (1000 clases ImageNet) | MIT (timm) | Hugging Face (timm) |
| SmolVLM-500M (mencionado en la model card) | 500 M | Multimodal (imagen + texto) | no disponible | no disponible | Hugging Face |
| SmolVLM2-2.2B (mencionado en la model card) | 2,2 B | Multimodal (imagen + texto) | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado únicamente con imágenes de productos crudos y mayoritariamente de un solo elemento; no reconoce platos mixtos ni cocinados (para eso está el VLM).
- No incluye platos específicos del Golfo como machboos o harees; las clases son exclusivamente frutas y verduras.
- El conjunto de validación es pequeño (1166 imágenes); la precisión en platos reales será inferior a la del split reservado.
- No es una herramienta médica ni dietética; no debe usarse para calcular calorías o nutrientes.
- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse con un dataset de alimentos crudos, puede tener dificultades con variedades locales o presentaciones inusuales.
- Riesgo de alucinación: como clasificador, no genera texto libre, pero puede asignar una clase incorrecta con alta confianza si la imagen se aleja de la distribución de entrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base y el dataset tienen sus propias licencias (MIT en ambos casos según la información disponible).
- Caveat para producción: el umbral de confianza de 0,6 es una decisión de diseño de la aplicación Nouri; en otros contextos habría que calibrarlo. No se proporcionan métricas de calibración ni matrices de confusión.

## Enlaces

- Hugging Face: https://huggingface.co/FaisalALMallah/team-012-nutri
- Dataset: https://huggingface.co/datasets/ibrahimdaud/raw-food-recognition
- Paper MobileNetV3: https://arxiv.org/abs/1905.02244
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- Perfil GitHub del autor: https://github.com/FaisalAlMallah
- Proyecto relacionado nutri-ai (no directamente vinculado): https://github.com/suml-projekt/nutri-ai
