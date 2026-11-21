# rakeenarya/ingredient-reader

## Resumen

Ingredient Reader es un conjunto de pesos de OCR especializado en la lectura de listas de ingredientes en etiquetas de alimentos a partir de fotografías. Lo desarrolla Rakeen Aria Alireza como parte de su tesis de grado, y se publica en Hugging Face bajo el identificador `rakeenarya/ingredient-reader`. El modelo resuelve un problema acotado pero recurrente: extraer texto impreso en inglés de etiquetas de productos alimentarios, un dominio donde el texto suele ser pequeño, denso, con tipografías variadas y a menudo sobre superficies curvas o brillantes.

Técnicamente no es un modelo único, sino una combinación de dos componentes: un detector de texto CRAFT (los pesos originales de Clova AI, sin modificar) y un reconocedor CRNN con arquitectura TPS-ResNet-BiLSTM-Attn, afinado sobre recortes de palabras de etiquetas de alimentos. El reconocedor parte del checkpoint preentrenado `TPS-ResNet-BiLSTM-Attn-case-sensitive` de `deep-text-recognition-benchmark` y se ajusta con 6.081 imágenes de palabras curadas.

Es relevante para desarrolladores que necesiten un pipeline OCR ligero y autoalojado para etiquetas de alimentos, con licencia Apache 2.0 y pesos de tamaño reducido (repositorio de 0,3 GB). No es un modelo de lenguaje: no genera texto libre ni razona, sino que transcribe. Su utilidad práctica depende de integrarlo con lógica propia de postprocesado y validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector CRAFT + reconocedor CRNN (TPS-ResNet-BiLSTM-Attn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR); entrada de imagen de 32 × 100 píxeles en escala de grises para el reconocedor, longitud máxima de secuencia 60 |
| Tipos de cuantizacion | no disponible (pesos PyTorch `.pth`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`): `best_accuracy.pth`, `craft_mlt_25k.pth`, más `opt.txt` con la configuración |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | image-to-text |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

El sistema sigue un esquema clásico de OCR en dos fases. La primera es CRAFT (Character Region Awareness for Text Detection), un detector basado en redes convolucionales que localiza regiones de texto; en este repositorio se emplean los pesos `craft_mlt_25k.pth` originales de Clova AI sin modificar. La segunda fase es el reconocimiento: un CRNN con módulo de transformación espacial TPS, extractor ResNet, capa recurrente BiLSTM y decodificación por atención (Attn). El reconocedor se inicializa desde el checkpoint case-sensitive de `deep-text-recognition-benchmark` y se afina sobre recortes de palabras de etiquetas de alimentos.

El conjunto de entrenamiento procede del dataset de Kaggle *Ingredients Image from Food Label*, curados en 6.081 imágenes de palabras y divididos 80:10:10. La configuración de entrenamiento (`opt.txt`) fija entrada en escala de grises de 32 × 100, caracteres sensibles a mayúsculas, sin PAD y longitud máxima de 60. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo OCR.

## Capacidades

- Detección de regiones de texto en imágenes de etiquetas de alimentos (CRAFT).
- Reconocimiento de palabras impresas en inglés sobre recortes de texto (CRNN con atención).
- Salida de texto plano a partir de una imagen de etiqueta mediante el método `engine.process(...)` del repositorio de código.
- Sensibilidad a mayúsculas y minúsculas en la transcripción.
- Manejo de tipografías variadas propias de etiquetas de productos alimentarios, gracias al ajuste fino sobre ese dominio.
- No soporta escritura manual ni idiomas distintos del inglés.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un modelo puramente perceptivo de image-to-text.
- No tiene capacidades multimodales más allá de la lectura de texto en imagen (sin descripción visual, VQA ni audio).

## Casos de uso

- Digitalización de inventarios de ingredientes: procesar fotografías de etiquetas de productos y extraer la lista de ingredientes para poblar bases de datos de catálogo, aprovechando el ajuste específico al dominio de alimentos.
- Aplicaciones de alergias y dietas: un usuario fotografía una etiqueta y la app transcribe los ingredientes para buscar alérgenos o ingredientes prohibidos; el modelo aporta la capa OCR y la app debe añadir la validación y la lógica de alertas.
- Análisis nutricional automatizado: integrar la transcripción en un pipeline que alimente un parser de ingredientes y una base de datos nutricional, reduciendo la introducción manual de datos.
- Control de calidad en retail y logística: verificar que la etiqueta fotografiada coincide con el producto registrado comparando la transcripción con el texto esperado.
- Investigación de mercado y estudios de etiquetado: procesar lotes de fotos de productos para analizar la composición declarada de ingredientes a escala, con revisión humana de los casos de baja confianza.
- Accesibilidad: convertir en texto legible la lista de ingredientes de un envase para lectores de pantalla o interfaces de voz, dado el reducido tamaño de los pesos y la posibilidad de ejecución local.
- Prototipado rápido de OCR de dominio específico: servir como punto de partida y referencia de ajuste fino sobre `deep-text-recognition-benchmark` para otros dominios de etiquetas.

## Benchmarks y rendimiento

Resultados reportados en la tesis del autor:

| Evaluacion | Metrica | Valor |
|---|---|---|
| Split de test, imagenes de palabras (tras fine-tuning) | Word accuracy | 94,693 % |
| Split de test, imagenes de palabras (tras fine-tuning) | CER | 0,015 |
| Split de test, imagenes de palabras (tras fine-tuning) | WER | 0,053 |
| Mismo split antes del fine-tuning (checkpoint preentrenado) | Word accuracy | 90,381 % |
| Cinco fotos reales de producto, extremo a extremo (deteccion + reconocimiento) | Word accuracy | 92,248 % |

No se han publicado comparaciones con otros modelos OCR en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,3 GB) y la naturaleza de los dos modelos convolucionales/recurrentes, se espera un consumo moderado, apto para GPU de gama media o incluso CPU.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con suficiente memoria para cargar ambos checkpoints debería ser válida.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño de los pesos, aunque no se confirma en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo); el uso previsto es mediante el repositorio de código `food-ingredient-ocr-craft-crnn` y la clase `OCREngine`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos OCR en la información proporcionada. Como referencia estructural, el reconocedor se basa en `deep-text-recognition-benchmark` (Clova AI, Apache 2.0) y el detector en CRAFT (Clova AI, MIT), pero no se ofrecen métricas comparativas entre este ajuste fino y dichos modelos base más allá de la mejora de exactitud reportada (90,381 % a 94,693 % en el split de test).

| Modelo | Base | Dominio | Licencia | Datos comparativos |
|---|---|---|---|---|
| Ingredient Reader | CRAFT + CRNN (TPS-ResNet-BiLSTM-Attn) | Etiquetas de alimentos en inglés | Apache 2.0 | 94,693 % word accuracy en test propio |
| deep-text-recognition-benchmark (base) | CRNN con atención | OCR genérico | Apache 2.0 | 90,381 % en el mismo split |
| CRAFT (detector) | CNN de detección | Detección de texto genérica | MIT | no disponible |

## Limitaciones y advertencias

- Solo admite listas de ingredientes impresas en inglés; no soporta escritura manual ni otros idiomas.
- La exactitud cae con texto pequeño, borroso, brillante o sobre superficies curvas, según advierte el propio autor.
- Riesgo de errores de OCR: el autor recomienda verificar siempre la etiqueta física, especialmente en casos de alergias; no debe usarse como única fuente en decisiones de seguridad alimentaria.
- El conjunto de evaluación es reducido (6.081 imágenes de palabras y solo cinco fotos reales de producto), por lo que la generalización a otras condiciones de captura es incierta.
- No se documentan sesgos específicos, pero al estar entrenado sobre un dataset concreto de etiquetas, puede tener peor rendimiento en tipografías, idiomas o formatos no representados.
- Licencia Apache 2.0 para los pesos, con la salvedad de que el detector CRAFT es MIT y el código base de reconocimiento es Apache 2.0 de Clova AI; conviene revisar las atribuciones al redistribuir.
- No es un modelo de lenguaje: no genera explicaciones, no razona y no debe emplearse para tareas distintas de la transcripción de texto en imagen.

## Enlaces

- Hugging Face: https://huggingface.co/rakeenarya/ingredient-reader
- Repositorio de código: https://github.com/rakeenaria/food-ingredient-ocr-craft-crnn
- Demo: https://ingredient-reader.streamlit.app
- deep-text-recognition-benchmark (Clova AI): https://github.com/clovaai/deep-text-recognition-benchmark
- CRAFT-pytorch (Clova AI): https://github.com/clovaai/CRAFT-pytorch
- Dataset de Kaggle citado: *Ingredients Image from Food Label* (no se proporciona URL directa en la información disponible)
