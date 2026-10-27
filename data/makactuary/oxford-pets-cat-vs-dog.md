# makactuary/oxford-pets-cat-vs-dog

## Resumen

`makactuary/oxford-pets-cat-vs-dog` es un clasificador binario de imágenes (gato frente a perro) publicado por el usuario makactuary en HuggingFace. No es un modelo entrenado de extremo a extremo: es una cabeza de regresión logística de scikit-learn montada sobre características congeladas de 768 dimensiones extraídas con el backbone `timm/convnext_tiny.fb_in22k_ft_in1k`, un ConvNeXt-Tiny preentrenado en ImageNet-22k y afinado en ImageNet-1k (Apache-2.0). El único artefacto entrenado es, por tanto, un vector de 1.538 coeficientes.

El problema que resuelve es deliberadamente acotado: separar las dos clases del dataset Oxford-IIIT Pet. Su interés práctico es como ejemplo de *linear probing* barato —el autor indica que se entrena en CPU en minutos— y como referencia de hasta dónde llegan las features congeladas de un backbone moderno cuando el dominio de destino se solapa con el de preentrenamiento (ImageNet ya contiene muchas razas de gatos y perros).

El resultado reportado es accuracy 0,9992 y macro-F1 0,9991 sobre el split de test oficial (3.669 imágenes). El propio autor advierte de que esa cifra casi perfecta refleja sobre todo la separabilidad de las features congeladas y que el split de test es el del propio dataset, donde pueden aparecer individuos de la misma raza o incluso el mismo animal en train y test. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: extractor de features CNN `ConvNeXt-Tiny` (congelado) + clasificador lineal (regresión logística binaria de scikit-learn) sobre features de 768 dimensiones |
| Parametros totales | Backbone: ~28,6 M (ConvNeXt-Tiny, dato de la ficha de timm). Cabeza entrenada: 1.538 coeficientes (768 pesos + 1 sesgo por clase) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto). Entrada: una imagen; resolución de trabajo no documentada en el repo (el backbone timm se configura habitualmente a 224×224) |
| Tipos de cuantizacion | No disponible. Al ser un clasificador lineal sobre features congeladas, la cuantización no forma parte del flujo de entrenamiento; el backbone podría exportarse a fp16/ONNX, pero el autor no lo documenta |
| Idiomas soportados | No aplica al ser visión; las etiquetas de salida son `cat` / `dog` en inglés |
| Licencia | CC BY-SA 4.0 (heredada del dataset Oxford-IIIT Pet). Backbone original bajo Apache-2.0 |
| Formato de pesos | `joblib` (serialización de scikit-learn), según la librería declarada en el repo. El backbone se carga desde timm/PyTorch |
| Tarea | Clasificación de imágenes, 2 clases (gato / perro) |
| Dataset de entrenamiento | `timm/oxford-iiit-pet` (copia en HF del Oxford-IIIT Pet), CC BY-SA 4.0 |
| Modelo base | `timm/convnext_tiny.fb_in22k_ft_in1k` |
| Tamano del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un *linear probe*: se congelan todos los pesos de ConvNeXt-Tiny y se extraen features globales de 768 dimensiones por imagen (pooling final del backbone). Sobre ese vector se ajusta una regresión logística binaria con scikit-learn 1.9.1. No hay *fine-tuning* del backbone, ni aumento de datos, ni destilación, ni decodificación especulativa: es el esquema clásico de evaluar la calidad de una representación preentrenada con un clasificador lineal.

El entrenamiento consistió en seleccionar la fuerza de regularización mediante validación cruzada estratificada de 5 particiones **solo sobre el split de train**, con mejor valor C = 0,1; el split de test se usó una única vez. El autor no documenta el número de épocas (irrelevante en un problema convexo con solver convergido), el tamaño del split de train, ni si aplicó normalización estándar de las features antes del ajuste. Tampoco se reporta ningún proceso de RLHF/DPO, lógicamente fuera de alcance en un clasificador de imágenes.

## Capacidades

- Clasificación binaria de imágenes en dos clases: gato o perro.
- Extracción de características de 768 dimensiones reutilizable como *embedding* visual para otras tareas (el backbone es accesible vía timm).
- Entrenamiento reproducible en CPU en minutos, según el autor, lo que permite recalibrar la cabeza con datos propios sin GPU.
- Inferencia por línea de comandos mediante `predict.py` incluido en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto.
- No tiene modo *thinking*, ni capacidades de audio, vídeo u OCR.
- No ofrece capacidades multilingües (no procesa texto).

## Casos de uso

- **Filtrado rápido de imágenes en un pipeline de ingesta**: clasificar fotos de usuario en categorías gato/perro antes de enviarlas a un modelo mayor (detección, segmentación o moderación), usando el clasificador como primer paso barato en CPU.
- **Etiquetado asistido de datasets**: preanotar automáticamente un corpus de imágenes de mascotas y reservar la revisión humana solo para los casos de baja confianza, reduciendo el coste de anotación manual.
- **Experimento docente o de referencia de *linear probing***: ilustrar en un curso de visión por computador cuánto rendimiento se obtiene con features congeladas frente a un *fine-tuning* completo, con una accuracy de referencia de 0,9992 en test.
- **Base para un clasificador veterinario o de refugio de animales**: punto de partida para transferir la cabeza a un dominio propio (por ejemplo, distinguir especie en fotos de adopción) reentrenando solo los 1.538 coeficientes con unas pocas imágenes etiquetadas.
- **Prueba de humo (smoke test) de infraestructura de inferencia**: por su tamaño reducido sirve para validar el despliegue de un servicio de clasificación de imágenes (contenedor, API, colas) antes de sustituir el modelo por uno mayor.
- **Organización automática de fototecas personales**: separar carpetas de gatos y perros en un volumen grande de fotos domésticas, ejecutando la inferencia en CPU sin necesidad de GPU.
- **Componente de demo interactiva**: integrarlo en una aplicación web o bot de demostración que responda "gato" o "perro" a una foto subida, dado el coste computacional casi nulo.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre el split de test oficial de Oxford-IIIT Pet (3.669 imágenes), usando el ajuste elegido por validación cruzada (C = 0,1):

| Metrica | Valor |
|---|---|
| Accuracy (test, 3.669 imágenes) | 0,9992 |
| Macro-F1 (test) | 0,9991 |
| F1 clase `cat` | 0,999 |
| F1 clase `dog` | 0,999 |
| Mejor C (validación cruzada 5-fold estratificada sobre train) | 0,1 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. No hay datos de latencia, throughput, matriz de confusión ni intervalos de confianza.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~0,5 GB en fp32 (backbone ConvNeXt-Tiny de ~28,6 M de parámetros ≈ 114 MB de pesos, más activaciones de una sola imagen y el clasificador lineal, que ocupa unos pocos KB).
- **GPU recomendadas**: ninguna en particular; cualquier GPU consumer es sobredimensionada. Sirven GTX 1650, RTX 3060, RTX 4090, e incluso A100/H100 si ya están disponibles, aunque no aportan nada frente a una CPU moderna para una sola imagen.
- **¿Cabe en GPU consumer?**: sí, en cualquier GPU con 1 GB o más de VRAM; también en placas integradas y en CPU.
- **CPU**: viable. El autor afirma que el *entrenamiento* de la cabeza se completa en minutos en CPU; la inferencia del backbone es del orden de decenas de milisegundos por imagen en una CPU moderna (no se han publicado medidas exactas).
- **Opciones de despliegue**: script `predict.py` del repositorio; exportación del backbone a ONNX Runtime o TorchScript combinada con la carga del `joblib` de scikit-learn; servicio HTTP propio (FastAPI/Flask) o contenedor Docker. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han localizado en la información disponible otras cabezas publicadas para la tarea binaria gato/perro sobre Oxford-IIIT Pet con las que comparar de forma rigurosa. La alternativa natural es comparar contra el propio backbone y contra un *fine-tuning* completo, para lo cual tampoco hay cifras publicadas en este repositorio:

| Modelo | Parametros | Enfoque | Contexto/entrada | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `makactuary/oxford-pets-cat-vs-dog` | ~28,6 M (backbone) + 1.538 (cabeza) | Linear probe sobre features congeladas | Imagen (resolución no documentada) | CC BY-SA 4.0 | accuracy 0,9992 / macro-F1 0,9991 en test |
| `timm/convnext_tiny.fb_in22k_ft_in1k` | ~28,6 M | Clasificador ImageNet-1k (1.000 clases) | Imagen 224×224 (configuración habitual de timm) | Apache-2.0 | No disponible en esta ficha (requiere consultar la model card de timm) |
| *Fine-tuning* completo de ConvNeXt-Tiny en Oxford-IIIT Pet | ~28,6 M | Ajuste de todos los pesos | Imagen | Depende del dataset (CC BY-SA 4.0) | No disponible |
| Otros clasificadores gato/perro en HuggingFace | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Posible fuga entre splits**: el propio autor advierte de que el test es el split del dataset y que imágenes del mismo individuo pueden aparecer en train y test. La accuracy de 0,9992 debe tomarse como cota optimista, no como estimación de generalización a imágenes nuevas.
- **Dominio muy estrecho**: entrenado con fotos de mascotas extraídas de la web (dataset de 2012). No cubre otras condiciones de cámara, iluminación, razas mixtas ni cachorros pequeños, según reconoce el autor.
- **Sesgo del dataset**: Oxford-IIIT Pet contiene 37 razas, mayoritariamente británicas, con una distribución demográfica y geográfica concreta; el modelo hereda ese sesgo y puede fallar en razas poco representadas o en imágenes de baja calidad.
- **Rendimiento no verificado externamente**: 0 descargas y 0 likes; no hay evaluaciones independientes que reproduzcan las cifras.
- **Licencia copyleft**: CC BY-SA 4.0 obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar adaptaciones. El backbone original es Apache-2.0, pero el conjunto publicado se distribuye como CC BY-SA 4.0.
- **Sin calibración documentada**: no se reportan probabilidades calibradas, umbrales de decisión ni matriz de confusión; no se recomienda usar las probabilidades de salida directamente en decisiones con coste asimétrico sin recalibrar.
- **Alcance funcional mínimo**: solo dos clases; no detecta "ninguno de los dos" y asignará forzosamente gato o perro a cualquier imagen de entrada (por ejemplo, un coche).
- **Reproducibilidad parcial**: no se documenta la versión de timm, la resolución de entrada exacta en `predict.py`, ni la semilla; pequeñas variaciones en el preprocesado pueden alterar los resultados.
- **Sin soporte ni mantenimiento**: repositorio de un autor individual, sin issues ni actividad; no debe tratarse como dependencia crítica en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makactuary/oxford-pets-cat-vs-dog
- Modelo base (timm): https://huggingface.co/timm/convnext_tiny.fb_in22k_ft_in1k
- Dataset en HuggingFace: https://huggingface.co/datasets/timm/oxford-iiit-pet
- Dataset original (University of Oxford): https://www.robots.ox.ac.uk/~vgg/data/pets/
- Paper del dataset: Parkhi, O. M., Vedaldi, A., Zisserman, A. & Jawahar, C. V. (2012). *Cats and Dogs*. IEEE CVPR.
- Repositorio de código del autor (archivo `hf_image_models.py`, MIT): https://github.com/000MAK/quantix-martial-arts-engine
