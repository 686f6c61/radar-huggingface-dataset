# makactuary/oxford-pets-cat-breeds

## Resumen

`makactuary/oxford-pets-cat-breeds` es un clasificador de imágenes de 12 razas de gato publicado por el usuario makactuary en Hugging Face. No es un modelo de lenguaje: se trata de una cabeza de regresión logística multinomial de scikit-learn entrenada sobre características congeladas de 768 dimensiones extraídas con el backbone `timm/convnext_tiny.fb_in22k_ft_in1k` (Apache-2.0). El único artefacto entrenado es la cabeza lineal; el extractor de características no se ajusta.

El modelo se entrena sobre el conjunto Oxford-IIIT Pet (Parkhi et al., CVPR 2012), restringido a las 12 clases de gato, y se distribuye como pipeline de sklearn en formato `joblib`. Su interés práctico está en el coste: al congelar el backbone, el entrenamiento se completa en minutos sobre CPU, lo que lo convierte en una referencia reproducible y ligera para tareas de clasificación fina de razas donde no se dispone de GPU.

Los resultados declarados por el autor sobre el split de test oficial (1183 imágenes) son accuracy 0,8960 y macro-F1 0,8970. El propio autor advierte de una posible fuga de datos entre splits, ya que imágenes del mismo individuo pueden aparecer en entrenamiento y test, por lo que la cifra debe tomarse como cota optimista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de regresión logística multinomial (scikit-learn) sobre características congeladas de un transformer convolucional ConvNeXt-Tiny |
| Parámetros totales | Cabeza: 9.228 coeficientes (768 características × 12 clases + 12 sesgos; cálculo derivado). Backbone: ~28,6 M de parámetros (dato externo del modelo base timm, no declarado en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes; una imagen por inferencia, resolución de entrada no especificada en la model card) |
| Tipos de cuantización | No disponible (los coeficientes de la cabeza son floats de sklearn; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | CC BY-SA 4.0 (el backbone base es Apache-2.0) |
| Formato de pesos | `joblib` (pipeline de scikit-learn), acompañado del script `predict.py` |
| Tarea | Clasificación de imágenes (12 clases, solo gatos) |
| Backbone | `timm/convnext_tiny.fb_in22k_ft_in1k`, congelado, salida de 768 dimensiones |
| Dataset de entrenamiento | `timm/oxford-iiit-pet` (copia en HF del Oxford-IIIT Pet, CC BY-SA 4.0) |
| Librería declarada | scikit-learn (la model card fija la versión 1.9.1) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. Primero, un ConvNeXt-Tiny preentrenado en ImageNet-22k y ajustado en ImageNet-1k (`fb_in22k_ft_in1k`) actúa como extractor de características congelado y produce un vector de 768 dimensiones por imagen. Segundo, una regresión logística multinomial de scikit-learn mapea ese vector a 12 clases de raza felina. No hay ajuste fino del backbone ni capas ocultas adicionales: la totalidad de la capacidad aprendida específica de la tarea reside en 9.228 coeficientes.

El entrenamiento utiliza el split de entrenamiento de Oxford-IIIT Pet filtrado a las 12 clases de gato. La fuerza de regularización se seleccionó mediante validación cruzada estratificada de 5 pliegues exclusivamente sobre el split de entrenamiento (mejor C = 1,0); el split de test se evaluó una sola vez. No se documenta aumento de datos, resolución de entrada, normalización ni el número exacto de imágenes de entrenamiento empleadas. El autor reporta macro-F1 0,942 en validación cruzada frente a 0,897 en test, y señala explícitamente que la cifra a citar es la de test.

## Capacidades

- Clasificación de imágenes en 12 razas de gato: abyssinian, bengal, birman, bombay, british shorthair, egyptian mau, maine coon, persian, ragdoll, russian blue, siamese y sphynx.
- Salida de etiqueta única (single-label) con probabilidades por clase, al ser una regresión logística multinomial.
- Extracción de características reutilizable: el pipeline permite obtener los vectores de 768 dimensiones del backbone para otras tareas de visión.
- Entrenamiento e inferencia en CPU, sin requisitos de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de audio, de vídeo ni modo "thinking".
- No detecta gatos en la imagen ni maneja múltiples individuos: asume un recorte centrado en un solo animal.

## Casos de uso

- Identificación de raza en aplicaciones de adopción y refugios: el modelo etiqueta la foto de un gato con una de 12 razas y una probabilidad asociada, lo que permite prerrellenar fichas de animales y priorizar la revisión manual de los casos con baja confianza.
- Etiquetado y moderación en plataformas de fotografía de mascotas: clasificación automática de uploads para enrutar imágenes a categorías de raza, con la ventaja de que la inferencia cabe en CPU y no requiere infraestructura GPU dedicada.
- Componente de anotación asistida en pipelines de datos: al ser un pipeline de sklearn serializado, se integra en un script de preetiquetado que un humano corrige después, reduciendo el coste de construir un dataset de razas propio.
- Filtro previo en búsqueda o recomendación dentro de un catálogo: dado que solo cubre 12 razas, encaja como clasificador de primera etapa para consultas del tipo "busco un sphynx" o "fotos de persa".
- Docencia y prototipado rápido: sirve como ejemplo completo y reproducible de transferencia de aprendizaje con backbone congelado, entrenable en minutos en un portátil y con métricas por clase publicadas.
- Despliegue en dispositivos de borde: la cabeza lineal de 9.228 coeficientes es exportable y ejecutable en entornos con recursos muy limitados, siempre que se mantenga el extractor ConvNeXt-Tiny o se destile a una red menor.
- Verificación de razas en criaderos o seguros de mascotas: como señal auxiliar de apoyo a la revisión humana, nunca como decisión automatizada, dado el riesgo documentado con razas de pelaje similar.

## Benchmarks y rendimiento

Evaluación sobre el split de test oficial de Oxford-IIIT Pet (1183 imágenes), según la model card:

| Métrica | Valor |
|---|---|
| Accuracy | 0,8960 |
| Macro-F1 | 0,8970 |
| Macro-F1 en validación cruzada de 5 pliegues (solo train) | 0,942 |

F1 por clase en test:

| Clase | F1 |
|---|---|
| abyssinian | 0,944 |
| bengal | 0,869 |
| birman | 0,800 |
| bombay | 0,935 |
| british shorthair | 0,896 |
| egyptian mau | 0,895 |
| maine coon | 0,908 |
| persian | 0,929 |
| ragdoll | 0,772 |
| russian blue | 0,900 |
| siamese | 0,930 |
| sphynx | 0,985 |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es lingüístico. Tampoco se aportan métricas frente a otros clasificadores de razas.

## Requisitos de hardware

- VRAM para inferencia: no aplica si se ejecuta en CPU. En GPU, el backbone ConvNeXt-Tiny en fp32 ocupa del orden de cientos de MB, pero la model card no documenta requisitos.
- GPU recomendadas: ninguna es necesaria. Cualquier GPU consumer (por ejemplo, una RTX 4090 o inferior) aceleraría la extracción de características, pero no se aportan cifras de latencia.
- Cabe en GPU consumer: sí, con holgura, al tratarse de un backbone tiny más una cabeza lineal.
- Entrenamiento: el autor indica explícitamente que es lo bastante ligero para entrenarse en CPU en minutos.
- Opciones de despliegue: script Python (`predict.py`) con `timm`, `torch`, `scikit-learn` 1.9.1, `huggingface_hub` y `Pillow`. No se documentan exportaciones a ONNX, TensorRT, TorchServe, vLLM ni Triton.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / enfoque | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`oxford-pets-cat-breeds`) | Cabeza de 9.228 coeficientes + backbone ConvNeXt-Tiny congelado | Una imagen, resolución no especificada | Accuracy 0,8960 y macro-F1 0,8970 en test oficial | CC BY-SA 4.0 | Hugging Face, 0 descargas |
| Ajuste fino completo de `timm/convnext_tiny.fb_in22k_ft_in1k` sobre Oxford-IIIT Pet | ~28,6 M | Una imagen | No disponible en la información proporcionada | Apache-2.0 (modelo base) | Hugging Face, disponible |
| Backbone clásico (ResNet-50 preentrenado) con cabeza lineal | No disponible | Una imagen | No disponible en la información proporcionada | No disponible | Disponible en timm |
| CLIP zero-shot sobre las 12 razas | No disponible | Una imagen + prompt textual | No disponible en la información proporcionada | No disponible | Disponible en abierto |

La comparación cuantitativa con alternativas no puede establecerse con los datos aportados: la model card solo publica las métricas de este modelo.

## Limitaciones y advertencias

- Cobertura cerrada: solo 12 razas de gato. Cualquier otra raza, gato de raza mixta o mestizo se forzará a una de las 12 clases con alta probabilidad de error.
- Condiciones de captura: el autor advierte que el modelo se entrenó con fotos de mascotas obtenidas de la web y no cubre otras condiciones de cámara, ni cachorros.
- Posible fuga de datos: el propio autor señala que imágenes del mismo individuo pueden aparecer en train y test, de modo que las métricas publicadas son probablemente optimistas.
- Confusión documentada: ragdoll (F1 0,772) y birman (F1 0,800) son el par más difícil, por ser ambas razas de pelo largo con colorpoint.
- Licencia copyleft: CC BY-SA 4.0 obliga a compartir bajo la misma licencia las obras derivadas, lo que puede ser incompatible con productos propietarios. El backbone original es Apache-2.0, pero la licencia del conjunto de datos (CC BY-SA 4.0) condiciona la del modelo derivado.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia independiente de reproducibilidad.
- Dependencia de versión: la model card fija scikit-learn 1.9.1; deserializar el `joblib` con otras versiones puede fallar o alterar el comportamiento.
- Sin detalles de preprocesado: no se especifican resolución, normalización ni política de recorte, lo que dificulta replicar exactamente la evaluación.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de sobreconfianza: la regresión logística puede asignar probabilidades altas a imágenes fuera de distribución.
- No debe usarse como decisión automatizada en contextos con consecuencias (identificación veterinaria, seguros, criadores) sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/makactuary/oxford-pets-cat-breeds
- Modelo base: https://huggingface.co/timm/convnext_tiny.fb_in22k_ft_in1k
- Dataset en Hugging Face: https://huggingface.co/datasets/timm/oxford-iiit-pet
- Página oficial del dataset Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Paper del dataset (Parkhi, Vedaldi, Zisserman y Jawahar, CVPR 2012): https://www.robots.ox.ac.uk/~vedaldi/assets/pubs/parkhi12cat.pdf
- Repositorio de código citado por el autor: https://github.com/000MAK/quantix-martial-arts-engine
