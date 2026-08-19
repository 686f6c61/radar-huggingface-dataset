# d0gr/vit-nsfw-detector-onnx

## Resumen

El modelo `d0gr/vit-nsfw-detector-onnx` es un espejo (mirror) en formato ONNX con cuantización int8 del clasificador `AdamCodd/vit-base-nsfw-detector`, un detector de contenido NSFW (no seguro para el trabajo) basado en Vision Transformer (ViT). El autor `d0gr` lo re-publica con el objetivo de garantizar que la comprobación de seguridad de una extensión no se rompa si el archivo original se mueve, reemplaza o elimina. Los pesos no han sido modificados; se trata de una copia verbatim del archivo `onnx/model_int8.onnx` del repositorio original, con un hash SHA-256 verificado.

El modelo original, desarrollado por AdamCodd, es un fine-tuning de `vit-base-patch16-384` sobre aproximadamente 25 000 imágenes (fotografías, dibujos, etc.) para clasificar imágenes en dos categorías: SFW (seguro para el trabajo) y NSFW. En el conjunto de evaluación alcanza una pérdida de 0,0937 y una precisión (accuracy) de 0,9654. Este mirror ONNX int8 permite una inferencia más ligera y portable, especialmente en entornos donde se prefiere el formato ONNX Runtime sobre los pesos originales de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, patch size 16, resolución de entrada 384x384 |
| Parametros totales | no disponible (el modelo base ViT-base tiene aproximadamente 86 millones, pero no se confirma en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | int8 (archivo `model_int8.onnx`) |
| Idiomas soportados | no aplica (entrada de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (según la model card del mirror, heredada del upstream) |
| Formato de pesos | ONNX (archivo `nsfw_classifier/model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer (ViT) de tamaño base con parches de 16x16 píxeles y una resolución de entrada de 384x384 píxeles. Se trata de un fine-tuning del modelo preentrenado `vit-base-patch16-384` sobre un conjunto de datos de aproximadamente 25 000 imágenes que incluyen tanto fotografías realistas como dibujos y representaciones 3D. El entrenamiento se realizó con una tarea de clasificación binaria (SFW/NSFW) y, según la información disponible, se obtuvo una pérdida de 0,0937 y una precisión de 0,9654 en el conjunto de evaluación. No se especifican detalles sobre el proceso de entrenamiento (épocas, optimizador, aumentos de datos, etc.) en la documentación consultada.

El mirror ONNX int8 no introduce cambios en la arquitectura ni en los pesos; simplemente convierte el modelo a un formato optimizado para inferencia con ONNX Runtime, reduciendo el tamaño y acelerando la ejecución en hardware compatible. El contrato de entrada/salida está documentado en la model card del mirror: entrada `pixel_values` de forma `[1, 3, 384, 384]` en float32, preprocesado con resize bilineal a 384x384, normalización a `[0,1]` y luego `(x - 0.5) / 0.5`; salida `logits` de forma `[1, 2]` que se interpreta con softmax, donde el índice 1 corresponde a NSFW.

## Capacidades

- Clasificación binaria de imágenes en dos categorías: SFW (seguro para el trabajo) y NSFW (contenido explícito o inapropiado).
- Acepta imágenes de diversos tipos: fotografías realistas, dibujos, ilustraciones 3D, etc. (según la descripción del modelo original).
- Salida de logits que pueden convertirse en probabilidades mediante softmax, permitiendo ajustar umbrales de decisión según la aplicación.
- Preprocesado específico documentado (resize a 384x384, normalización) que debe replicarse en la inferencia para obtener resultados consistentes.
- Formato ONNX int8, lo que facilita la integración en entornos con ONNX Runtime, incluyendo despliegue en CPU o GPU con bajo consumo de memoria.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en un pipeline de revisión automática de imágenes subidas por usuarios para filtrar contenido NSFW antes de su publicación. Su precisión de 0,9654 y su tamaño reducido (int8) lo hacen adecuado para servicios con alto volumen de peticiones.
- Filtrado en pipelines de generación de imágenes (Stable Diffusion, etc.): se puede usar como comprobación posterior a la generación para descartar resultados no deseados, tal como sugiere el autor original en su repositorio.
- Control parental en aplicaciones de navegación o galerías: el modelo puede clasificar imágenes locales o remotas y bloquear aquellas consideradas NSFW, funcionando en dispositivos con recursos limitados gracias a la cuantización int8.
- Auditoría de datasets de entrenamiento: antes de usar un conjunto de imágenes para entrenar otros modelos, se puede aplicar este detector para eliminar muestras NSFW y evitar sesgos o problemas legales.
- Cumplimiento normativo en servicios de alojamiento de imágenes: integración en sistemas de denuncia automática para detectar contenido explícito y escalarlo a revisión humana.
- Pruebas de calidad en aplicaciones de visión por computador: como modelo de referencia para comparar otros detectores NSFW o para validar pipelines de preprocesado de imágenes.

## Benchmarks y rendimiento

Según la información disponible del modelo original (AdamCodd/vit-base-nsfw-detector), en el conjunto de evaluación se reportan los siguientes resultados:

| Metrica | Valor |
|---|---|
| Pérdida (loss) | 0,0937 |
| Precisión (accuracy) | 0,9654 |

No se han publicado resultados adicionales de benchmarks (como F1, AUC, etc.) en la documentación consultada. El mirror ONNX int8 no incluye métricas propias, pero al ser una copia exacta de los pesos, se espera un rendimiento equivalente al del modelo original en términos de precisión, con posibles variaciones mínimas debidas a la cuantización.

## Requisitos de hardware

- El modelo en formato ONNX int8 tiene un tamaño de repositorio de 0,1 GB, lo que indica un peso de aproximadamente 100 MB (el archivo del modelo puede ser algo menor). Esto permite ejecutarlo en hardware modesto.
- VRAM estimada: al ser un ViT-base con entrada 384x384 y cuantización int8, la inferencia puede realizarse con menos de 1 GB de VRAM en GPU, y también es viable en CPU con ONNX Runtime.
- GPU recomendadas: cualquier GPU con soporte para ONNX Runtime (por ejemplo, NVIDIA GTX 10xx o superior, RTX series) o incluso CPU con instrucciones AVX2. No requiere GPU de alta gama.
- En consumer GPU: sí, cabe en GPUs de gama baja como GTX 1650, RTX 2060, etc., y también en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), puede integrarse en servidores con FastAPI o Flask, o en aplicaciones de escritorio. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna, la inferencia de un ViT-base a 384x384 suele tardar entre 5 y 20 ms por imagen; en CPU puede ser de 50 a 200 ms, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Precisión (accuracy) | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `d0gr/vit-nsfw-detector-onnx` (mirror) | ViT-base int8 | 0,9654 (del original) | Apache-2.0 | ONNX | Espejo del modelo de AdamCodd |
| `AdamCodd/vit-base-nsfw-detector` | ViT-base | 0,9654 | Apache-2.0 | PyTorch | Modelo original, entrenado sobre ~25k imágenes |
| `Falconsai/nsfw_detector` | ViT (no especificado) | no disponible | no disponible | PyTorch | Alternativa mencionada en la búsqueda, con enfoque de entrenamiento distinto |

No se dispone de más detalles sobre otros modelos comparables en la información proporcionada. La comparativa se limita a los datos disponibles.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para clasificar imágenes en SFW/NSFW; no debe usarse para otras tareas de visión sin un reentrenamiento adecuado.
- La precisión reportada (0,9654) indica que existe un 3,46% de error, lo que puede traducirse en falsos positivos (imágenes SFW clasificadas como NSFW) o falsos negativos (contenido NSFW no detectado). En aplicaciones de moderación, se recomienda un umbral ajustable y revisión humana para casos dudosos.
- El modelo fue entrenado con un conjunto de datos de aproximadamente 25 000 imágenes, que puede no ser representativo de todos los estilos, culturas o tipos de contenido. Puede tener sesgos hacia ciertos tipos de imágenes (por ejemplo, dibujos anime vs. fotografías realistas).
- La cuantización int8 puede introducir una ligera degradación en la precisión en comparación con el modelo en float32, aunque no se han publicado métricas específicas para esta versión.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- El mirror no incluye el código de preprocesado ni el pipeline completo; el usuario debe implementar el resize y la normalización según el contrato documentado para obtener resultados correctos.
- No se garantiza que el modelo funcione correctamente con imágenes de muy baja resolución, imágenes con texto superpuesto o contenido muy diferente al del conjunto de entrenamiento.

## Enlaces

- Repositorio del mirror: https://huggingface.co/d0gr/vit-nsfw-detector-onnx
- Modelo original: https://huggingface.co/AdamCodd/vit-base-nsfw-detector
- Página de archivos del modelo original: https://huggingface.co/AdamCodd/vit-base-nsfw-detector/tree/main
- README del modelo original (historial): https://huggingface.co/AdamCodd/vit-base-nsfw-detector/blame/31f303793f029262e675433ff504cc5916a140ee/README.md
- Análisis externo del modelo: https://www.aimodels.fyi/models/huggingFace/vit-base-nsfw-detector-adamcodd
- Modelo en ModelScope: https://www.modelscope.cn/models/initialencounter/vit-base-nsfw-detector/summary
- Biblioteca ONNX de modelos (referencia): https://onnx.bimant.com/models/AdamCodd/vit-base-nsfw-detector
