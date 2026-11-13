# KoreaPeter/ms-eff-gcvit-deepfake-b0-celeb-df-v2

## Resumen

ms-eff-gcvit-deepfake-b0-celeb-df-v2 es un modelo de clasificacion de imagenes especializado en deteccion de deepfakes, desarrollado por el usuario KoreaPeter y publicado en Hugging Face bajo el paraguas del proyecto DeepGuard. Combina un backbone EfficientNet-B0 (concretamente el checkpoint `timm/tf_efficientnet_b0.ns_jft_in1k`, preentrenado en ImageNet-1k con Noisy Student) con un modulo de atencion denominado Global Context Vision Transformer (GCViT), dando lugar a una arquitectura hibrida CNN-Transformer orientada a la verificacion de autenticidad facial.

El modelo resuelve un problema concreto y de creciente relevancia: distinguir caras reales de caras sinteticas o manipuladas en imagenes y fotogramas de video. Con solo 8,9 millones de parametros, esta disenado para ser ligero y desplegable en entornos con recursos limitados, lo que lo hace atractivo para pipelines de moderacion de contenido, verificacion de identidad o analisis forense a gran escala.

A pesar de su reducido tamano, el repositorio acumula mas de 35.000 descargas, lo que sugiere una adopcion notable en flujos de trabajo de deteccion de contenido sintetico. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida CNN-Transformer: EfficientNet-B0 como backbone y modulo Global Context Vision Transformer (GCViT) |
| Parametros totales | 8.916.853 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | image-classification / video-classification |
| Modelo base | timm/tf_efficientnet_b0.ns_jft_in1k |
| Framework | PyTorch, transformers, custom_code |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura `ms_eff_gcvit` combina dos componentes. El primero es un EfficientNet-B0 preentrenado en ImageNet-1k con la receta Noisy Student (`ns_jft_in1k`), que actua como extractor de caracteristicas convolucionales eficiente en parametros y FLOPs. El segundo es un bloque de Global Context Vision Transformer, que aporta modelado de dependencias globales mediante atencion, algo que una CNN pura captura con dificultad. Esta hibridacion busca el equilibrio entre la eficiencia local de las convoluciones y la capacidad de razonamiento global de los transformers, con un coste computacional muy contenido.

El modelo se ha afinado especificamente para la deteccion de deepfakes en rostros (el sufijo `celeb-df` sugiere un dataset de celebridades con caras reales y sinteticas). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de vision). Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal mas alla del propio modulo GCViT. El tag `custom_code` indica que la carga del modelo requiere codigo personalizado registrado en el repositorio.

## Capacidades

- Clasificacion binaria o multiclase de imagenes de rostros para discriminar entre contenido real y deepfake.
- Procesamiento de fotogramas individuales y, segun el pipeline declarado (`video-classification`), agregacion sobre secuencias de video.
- Extraccion de caracteristicas visuales de alta eficiencia gracias al backbone EfficientNet-B0.
- Modelado de contexto global mediante el modulo GCViT, util para detectar artefactos de manipulacion distribuidos por la imagen.
- Inferencia ligera apta para CPU y GPU de gama baja.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- Capacidad especial: orientado a verificacion forense de autenticidad facial en imagenes y video.

## Casos de uso

- Moderacion de contenido en plataformas sociales: el modelo puede clasificar fotogramas de video subido por usuarios para marcar posibles deepfakes antes de la revision humana, gracias a su bajo coste de inferencia (8,9 M de parametros).
- Verificacion de identidad en procesos KYC: integrado como filtro previo en pipelines de onboarding, permite descartar imagenes de rostro sinteticas antes de pasarlas a un sistema biometrico mas costoso.
- Analisis forense de medios: periodistas y verificadores pueden usar el modelo para triage rapido de videos virales sospechosos, priorizando los casos que requieren analisis manual detallado.
- Deteccion de contenido sintetico en campanas de desinformacion: procesamiento por lotes de imagenes de celebridades (coherente con el dataset `celeb-df`) para identificar montajes generados con IA.
- Investigacion academica en deteccion de deepfakes: el modelo sirve como baseline ligero y reproducible (licencia MIT) para comparar contra arquitecturas mas pesadas.
- Filtrado previo en pipelines de generacion de datos: descartar imagenes sinteticas de un dataset de entrenamiento antes de usarlas para entrenar otros modelos.
- Despliegue en dispositivos de borde: su tamano reducido permite ejecutarlo en GPUs de consumo o incluso en CPU, habilitando verificacion local sin enviar imagenes a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (8,9 M de parametros, aproximadamente 36 MB de pesos), lo que permite ejecucion holgada en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3050, RTX 4060, T4, L4 o superiores son mas que suficientes. Tambien funciona en A100/H100 para procesamiento por lotes a gran escala.
- Cabe en cualquier GPU de consumo, incluidas integradas con soporte CUDA o incluso en CPU para inferencia individual.
- Opciones de despliegue: PyTorch nativo con `transformers` (requiere `trust_remote_code=True` por el tag `custom_code`), exportacion a ONNX o TorchScript para produccion, y servidores de inferencia genericos como Triton o TorchServe. No se documenta soporte nativo en llama.cpp u Ollama (no aplica a modelos de vision de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por imagen en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| ms-eff-gcvit-deepfake-b0-celeb-df-v2 | 8,9 M | Deteccion de deepfake facial | MIT | Gated | Hibrido CNN + GCViT, muy ligero |
| EfficientNet-B0 (ImageNet) | 5,3 M | Clasificacion de imagenes generica | Apache 2.0 (timm) | Abierto | No especializado en deepfakes |
| ViT-B/16 (ImageNet) | 86 M | Clasificacion de imagenes generica | Apache 2.0 | Abierto | Transformer puro, mas pesado |
| XceptionNet (FaceForensics) | 20,8 M | Deteccion de deepfake | Varía | Abierto | Baseline clasico en forense facial |

La comparativa se limita a arquitecturas de referencia; no se dispone de datos de rendimiento comparativo (accuracy, AUC) entre este modelo y alternativas especificas de deteccion de deepfakes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar afinado sobre un dataset de celebridades (`celeb-df`), puede generalizar peor en rostros de personas no famosas, de otras etnias, edades o condiciones de iluminacion no representadas.
- Riesgo de falsos positivos y negativos: un clasificador de deepfakes puede marcar como sinteticas imagenes reales con retoque o compresion agresiva, y viceversa; no debe usarse como unica evidencia en decisiones de alto impacto.
- Limitaciones de idioma y contexto: no aplica procesamiento de lenguaje; su alcance es exclusivamente visual.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el acceso gated exige aceptar las condiciones del autor en Hugging Face, que pueden imponer obligaciones adicionales.
- Caveat de produccion: requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de desplegarlo en entornos sensibles.
- No se documentan metricas de robustez frente a ataques adversarios ni frente a generadores de deepfake recientes; el rendimiento puede degradarse con el tiempo a medida que evolucionan los modelos generativos.
- El repositorio tiene un tamano declarado de 0.0 GB, lo que puede indicar que los pesos se sirven mediante LFS o que la informacion del repo esta incompleta; verificar la integridad de la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/KoreaPeter/ms-eff-gcvit-deepfake-b0-celeb-df-v2
- Modelo base (timm): https://huggingface.co/timm/tf_efficientnet_b0.ns_jft_in1k
- Dataset de referencia (ImageNet-1k): https://huggingface.co/datasets/ILSVRC/imagenet-1k
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales del autor.
