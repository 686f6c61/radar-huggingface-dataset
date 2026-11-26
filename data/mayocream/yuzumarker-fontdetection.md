# mayocream/yuzumarker-fontdetection

## Resumen

YuzuMarker Font Detection es un modelo de clasificación de imágenes especializado en reconocer la tipografía (archivo de fuente) utilizada en un fragmento de texto, con foco en caracteres CJK (japonés, chino y coreano) y en el contexto de traducción de manga. Lo desarrolla originalmente Haoyun Qin (JeffersonQin) como parte del proyecto YuzuMarker, y esta ficha concreta es una conversión no oficial a Safetensors mantenida por el usuario `mayocream`.

El modelo parte de una ResNet-50 de torchvision cuya capa final se sustituye por una proyección de 2048 a 6162 salidas. A partir de un recorte RGB del texto, estirado a 512×512, predice simultáneamente la fuente entre 6150 clases, la dirección del texto (izquierda-derecha o arriba-abajo) y diez valores de regresión con información de estilo: color del texto, tamaño, grosor y color del trazo, interlineado y ángulo.

Su relevancia es acotada pero específica: cubre una tarea poco servida (identificación de fuentes CJK en imágenes reales de manga) y lo hace con un modelo pequeño de 36,2 millones de parámetros y 0,1 GB de pesos. La conversión a Safetensors elimina la dependencia de checkpoints PyTorch con pickle y facilita el despliegue seguro en pipelines de preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (torchvision) con capa final sustituida por 2048 → 6162 |
| Parametros totales | 36.187.090 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 512×512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible como idioma de salida; el modelo está orientado a fuentes CJK (japonés, chino, coreano) y textos en inglés |
| Licencia | MIT |
| Formato de pesos | Safetensors (320 tensores, FP32; `num_batches_tracked` en int64) |

## Arquitectura y entrenamiento

La arquitectura es una CNN clásica: una ResNet-50 preentrenada de torchvision en la que se reemplaza la capa fully-connected final por una de 2048 a 6162 dimensiones. La salida se descompone en tres cabezas lógicas: 6150 logits de fuente (softmax, uno por archivo en `fonts.json`), 2 logits de dirección de texto (softmax: `ltr`, `ttb`) y 10 valores de regresión (sigmoid) para color de texto RGB, tamaño, grosor y color del trazo, interlineado y ángulo. El preprocesado estira el recorte a 512×512 sin preservar la relación de aspecto, escala a 0–1 y no normaliza.

El entrenamiento, según el repositorio original, se realizó únicamente con imágenes sintéticas: texto renderizado con PIL sobre recortes aleatorios de imágenes extraídas de pixiv. Las fuentes provienen del paquete de fuentes CJK publicado por VCB-Studio; el texto japonés son letras de canciones de uta-net, mientras que el chino y el coreano son caracteres comunes aleatorios mezclados con palabras en inglés. El checkpoint convertido corresponde a la ejecución sobre el conjunto sintético cuádruple (`name=4x-epoch=18-step=368676.ckpt`). No se documenta uso de RLHF, DPO ni ajuste fino supervisado adicional.

La conversión a Safetensors es verificable: se cargó el origen con `torch.load(weights_only=True)`, se exportaron solo los tensores del modelo (descartando estado de optimizador, scheduler y trainer), se eliminó el prefijo `model._orig_mod.model.` y se comprobó la equivalencia tensor a tensor con `torch.equal`. En 18 imágenes de prueba, las 6162 salidas del modelo convertido y del original fueron idénticas.

## Capacidades

- Clasificación de fuente entre 6150 archivos tipográficos CJK, devolviendo el índice de la clase más probable.
- Detección de dirección de texto: horizontal (`ltr`) o vertical (`ttb`), relevante para maquetación de manga.
- Regresión de atributos de estilo del texto: color RGB del texto, tamaño, grosor y color del trazo, interlineado y ángulo de rotación.
- Procesamiento de recortes de texto en imágenes reales, aunque el modelo solo se ha entrenado con datos sintéticos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No es un modelo multimodal generativo: no hay entrada de texto ni salida lingüística.
- Capacidad multilingüe limitada al reconocimiento de fuentes que cubren glifos CJK e inglés.

## Casos de uso

- Traducción automática de manga: el modelo identifica la fuente del texto original en cada globo y extrae tamaño, color y ángulo, datos que el pipeline de YuzuMarker usa para renderizar la traducción con un estilo coherente. Es adecuado porque combina clasificación de fuente y regresión de estilo en una sola pasada.
- Reconstrucción de maquetación en escaneos: a partir del ángulo y la dirección del texto se puede enderezar y reordenar el contenido antes del OCR, algo útil en digitalización de cómics y revistas.
- Catalogación de fuentes en archivos de imagen: dado un corpus de páginas escaneadas, el modelo asigna una clase de fuente probable a cada región de texto, lo que permite agrupar páginas por tipografía.
- Preprocesado para OCR en entornos CJK: la detección de dirección y ángulo alimenta un paso de rectificación que mejora la tasa de acierto de motores OCR sensibles a la orientación.
- Herramientas de asistencia a traductores de cómic: integrado en un editor, sugiere la fuente y el estilo del original para que el traductor mantenga la apariencia visual sin seleccionar manualmente entre miles de tipografías.
- Análisis forense o de procedencia de documentos: la clasificación de fuente entre 6150 clases puede servir como señal débil para agrupar documentos generados con el mismo tipo de letra, siempre con validación humana.
- Filtrado y limpieza de datasets de imágenes: descartar o etiquetar recortes según la fuente detectada para construir conjuntos de entrenamiento más homogéneos.

## Benchmarks y rendimiento

El autor original reporta precisión únicamente para otros checkpoints, medida sobre su propio split sintético de test: como máximo 48,99 % top-1 entre 6150 fuentes. La precisión de este checkpoint concreto no se reporta, y el modelo no ha sido evaluado sobre imágenes reales.

| Benchmark | Resultado | Notas |
|---|---|---|
| Top-1 entre 6150 fuentes (split sintético propio) | 48,99 % (mejor checkpoint upstream) | No corresponde a este checkpoint |
| Top-1 de este checkpoint | no disponible | No reportado por el autor |
| Evaluación sobre imágenes reales | no disponible | Upstream no la ha realizado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5–1 GB en FP32 para los 36,2 millones de parámetros, más el espacio de activaciones de una ResNet-50 a 512×512 (típicamente menos de 1 GB adicional con batch pequeño).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (carga directa de Safetensors), TorchServe, ONNX Runtime tras exportación, o integración en un servicio FastAPI. No se documentan soportes específicos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por la arquitectura (ResNet-50 a 512×512), se espera un coste bajo por imagen en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuzuMarker Font Detection (esta ficha) | 36,2 M | Imagen 512×512 | Clasificación de fuente CJK + regresión de estilo | MIT | Hugging Face (conversión no oficial) |
| YuzuMarker.FontDetection (original, gyrojeff) | no disponible | Imagen 512×512 | Igual | MIT | Hugging Face (checkpoint PyTorch) |
| ResNet-50 ImageNet (torchvision) | 25,6 M | Imagen 224×224 | Clasificación genérica de 1000 clases | BSD-3 | torchvision |
| Modelos OCR/visión para fuentes | no disponible | no disponible | Detección de fuente o texto | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación con el checkpoint original es directa: misma arquitectura y pesos idénticos, con la diferencia de formato (Safetensors frente a `.ckpt`).

## Limitaciones y advertencias

- El modelo nombra la fuente más cercana entre 6150 archivos, muchos de ellos comerciales; no garantiza que el usuario disponga de esa fuente ni que sea la correcta.
- La precisión top-1 reportada por el autor original es de en torno al 49 % en su propio split sintético, y la de este checkpoint no se ha publicado.
- No ha sido evaluado sobre imágenes reales: el entrenamiento es exclusivamente sintético, por lo que el dominio real (escaneos, fotos, compresión) puede degradar el rendimiento.
- El recorte se estira a un cuadrado de 512×512 sin preservar la relación de aspecto, lo que distorsiona líneas largas y columnas verticales.
- Riesgo de alucinación en el sentido de asignar una fuente plausible pero incorrecta con alta confianza; no hay mecanismo de abstención.
- Sesgos derivados del dataset: fuentes del paquete VCB-Studio, texto japonés de letras de canciones y caracteres chinos y coreanos aleatorios; la cobertura de estilos reales de manga puede ser limitada.
- Licencia MIT permite uso comercial, pero las fuentes referenciadas en `fonts.json` tienen licencias propias que pueden restringir su uso; el repositorio no incluye los archivos de fuente.
- Es una conversión no oficial: no cuenta con el respaldo del autor original y no debe citarse como release oficial.
- No apta para tareas generativas, razonamiento, código o texto; su uso está acotado a clasificación y regresión sobre imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mayocream/yuzumarker-fontdetection
- Repositorio original: https://github.com/JeffersonQin/YuzuMarker.FontDetection
- Código upstream en el commit de referencia: https://github.com/JeffersonQin/YuzuMarker.FontDetection/tree/0a94e165fe2b08d2800b723290eabd120b2d3d58
- Checkpoint original: https://huggingface.co/gyrojeff/YuzuMarker.FontDetection/blob/882b18b3a06fc568726685d74a0d669815e07953/name%3D4x-epoch%3D18-step%3D368676.ckpt
- Proyecto YuzuMarker (contexto de uso): https://github.com/JeffersonQin/YuzuMarker
