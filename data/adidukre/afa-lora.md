# adidukre/AFA-LoRA

## Resumen

AFA-LoRA (Amplified fold-averaged low-rank adaptation with family-balanced logit fusion) es un conjunto de 25 clasificadores binarios de fotograma diseñado para la detección a nivel de fotograma de neoplasia en esófago de Barrett. Lo desarrolla el equipo GenMI y son los pesos finales de su envío al reto RARE 2026, asociado a MICCAI 2026. No es un modelo de lenguaje: es un ensamblado de visión por computador para imagen médica endoscópica.

El sistema combina tres familias de encoders timm inicializados desde los checkpoints auto-supervisados públicos GastroNet-5M: 15 miembros DINOv2 ViT-B/14 con 4 registers a 336x336 con adaptación LoRA de rango 16 ya fusionada, 5 miembros ResNet-50 (pesos DINO) a 384x384 con ajuste fino completo y 5 miembros ResNet-50 (pesos MoCo v2) a 384x384 con ajuste fino completo. Los logits de cada miembro se estandarizan, se promedian dentro de cada familia y luego entre familias, y se mapean a (0, 1) mediante `0.5 + arctan(x) / pi`.

Su relevancia es doble: por un lado aborda una tarea clínica de alto valor (detección precoz de neoplasia en una afección con riesgo de adenocarcinoma), y por otro ejemplifica una receta de adaptación eficiente (LoRA amplificado y promediado por folds) sobre modelos fundacionales de endoscopia, en un escenario de datos escasos y clases muy desequilibradas. La salida es una puntuación de ranking, no una probabilidad calibrada, y el propio autor restringe el uso a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de 25 clasificadores binarios de fotograma con encoder timm y cabeza lineal (15 DINOv2 ViT-B/14 con 4 registers, 5 ResNet-50 DINO, 5 ResNet-50 MoCo v2) |
| Parametros totales | no disponible (el autor no publica el recuento total; el repositorio pesa 6,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes por fotograma) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización declarada; los adaptadores LoRA ya están fusionados) |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | MIT (los checkpoints GastroNet-5M y los datos RARE están sujetos a sus propios términos) |
| Formato de pesos | safetensors (cada miembro es un state dict de timm, con `meta.json` por fold y regla de fusión en `ensemble.json`) |

## Arquitectura y entrenamiento

Cada miembro es un encoder timm con cabeza lineal entrenado como clasificador binario por fotograma. La diversidad del ensamblado proviene de tres ejes: la familia de encoder (DINOv2 ViT-B/14 frente a ResNet-50 con dos esquemas de auto-supervisión distintos, DINO y MoCo v2), la resolución de entrada (336x336 frente a 384x384) y la estrategia de adaptación (LoRA de rango 16 frente a ajuste fino completo). Los 15 miembros DINOv2 usan LoRA con "amplificación" x1.5 y promediado por folds antes de fusionar los adaptadores en los pesos base, de modo que en inferencia cada miembro es un state dict plano y no requiere capa LoRA adicional.

Los encoders parten de los checkpoints auto-supervisados públicos GastroNet-5M. El ajuste se realizó exclusivamente sobre el release oficial del reto RARE: 3.095 fotogramas procedentes de dos centros, de los cuales solo 158 son de neoplasia, lo que implica un desequilibrio de clases extremo (aproximadamente 1:19). La fusión final estandariza el logit de cada miembro con constantes de temperatura y sesgo definidas en `ensemble.json`, promedia dentro de familia y entre familias, y aplica una transformación arcotangente a (0, 1). La receta combina por tanto adaptación paramétricamente eficiente, promediado de folds y fusión balanceada por familias.

## Capacidades

- Clasificación binaria de fotogramas endoscópicos para detección de neoplasia en esófago de Barrett.
- Procesamiento por lotes de stacks de fotogramas RGB en formato uint8 con forma (N, H, W, 3).
- Salida de puntuación de ranking por fotograma (no una probabilidad calibrada).
- Inferencia en GPU o CPU mediante PyTorch y timm, con tamaños de lote configurables.
- Ensamblado heterogéneo que combina transformers (ViT) y CNN (ResNet-50) con distintas resoluciones.
- Integración de adaptadores LoRA ya fusionados, sin necesidad de cargar capas adicionales en inferencia.
- No dispone de generación de texto, tool calling, capacidades de agentes, razonamiento multi-paso, visión generalista, audio ni funcionalidades multilingües.

## Casos de uso

- Triaje de vídeo endoscópico: procesar secuencialmente los fotogramas de una exploración y ordenar por puntuación de neoplasia para que el clínico revise primero los fotogramas de mayor riesgo, aprovechando que la salida es un ranking.
- Apoyo a la detección asistida por ordenador (CADe): integrar el ensamblado como segundo lector que marque fotogramas sospechosos durante la exploración, dado que está entrenado específicamente en la tarea de Barrett.
- Preanotación de datasets de investigación: usar las puntuaciones para priorizar fotogramas candidatos antes de la anotación manual por expertos, útil con el fuerte desequilibrio de clases del dominio.
- Control de calidad retrospectivo: reprocesar archivos de endoscopia previos para identificar exploraciones con fotogramas de alta puntuación que pudieran haberse pasado por alto.
- Investigación en adaptación eficiente: servir como referencia reproducible de la receta AFA-LoRA (LoRA amplificado, promediado por folds, fusión por familias) sobre encoders fundacionales de endoscopia.
- Comparación de encoders auto-supervisados: usar las tres familias del ensamblado para estudiar el impacto de DINOv2, DINO y MoCo v2 en una tarea médica concreta con pocos datos.
- Docencia y experimentación en ensamblados heterogéneos: reproducir el pipeline de fusión de logits con `ensemble.json` y el código del repositorio para estudiar esquemas de combinación de clasificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas del reto RARE 2026 ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- Tamaño del repositorio de pesos: 6,1 GB, lo que da una referencia del orden de magnitud de la memoria necesaria para cargar todos los miembros.
- VRAM estimada para inferencia: el ensamblado completo en FP32 requiere aproximadamente 6-8 GB para los pesos, más la memoria de activaciones, que depende del tamaño de lote. Ejecutar los miembros de forma secuencial reduce el pico de memoria al de un único miembro.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el ensamblado completo es viable en GPUs de 16 GB o más (por ejemplo una RTX 4090, A100 o H100), y también en GPUs de 8-12 GB si se procesan los miembros de forma secuencial.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más en modo secuencial, dado que los miembros individuales (ViT-B y ResNet-50) son relativamente pequeños.
- Opciones de despliegue: PyTorch con la librería timm y el código del repositorio (clase `RareEnsemble`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del número de fotogramas, del tamaño de lote y del hardware; el autor sugiere `batch_size=32`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AFA-LoRA | Ensamblado de 25 clasificadores de fotograma (ViT-B + ResNet-50) | no disponible | no aplica | MIT | HuggingFace |
| GastroNet-5M | Checkpoints auto-supervisados de endoscopia (pesos base reutilizados por AFA-LoRA) | no disponible | no aplica | sujeta a sus propios términos | publica |
| EndoViT | Encoder ViT auto-supervisado para endoscopia | no disponible | no aplica | no disponible | publica |

No se dispone de métricas comparativas publicadas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el autor indica explícitamente que no es un producto sanitario ni está validado para decisiones clínicas.
- Salida no calibrada: la puntuación final es un ranking transformado por arcotangente, no una probabilidad, por lo que no debe interpretarse directamente como riesgo clínico.
- Datos de entrenamiento muy limitados: solo 3.095 fotogramas de dos centros, con 158 de neoplasia, lo que implica un desequilibrio de clases extremo y un riesgo elevado de sobreajuste y de escasa generalización a otros centros, dispositivos o poblaciones.
- Sesgos potenciales derivados de la composición del dataset (dos centros concretos) y del desequilibrio de clases; no se documentan análisis de subgrupos ni de equidad.
- Riesgo de falsos negativos y falsos positivos no cuantificado en la información disponible; no hay métricas de sensibilidad o especificidad publicadas.
- Dependencia de la calidad de imagen endoscópica y del preprocesado: la entrada debe ser uint8 RGB con la forma esperada y las resoluciones de cada familia (336x336 o 384x384).
- Restricciones de licencia: los pesos son MIT, pero los checkpoints GastroNet-5M y los datos RARE tienen sus propios términos, que deben respetarse al redistribuir o reutilizar.
- Complejidad operativa: es un ensamblado de 25 modelos, lo que incrementa el coste de inferencia y de mantenimiento respecto a un único clasificador.
- Ausencia de benchmarks publicados: no es posible verificar el rendimiento relativo frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adidukre/AFA-LoRA
- Repositorio de código: https://github.com/adinathdukre/AFA-LoRA
- Reto RARE 2026 (MICCAI 2026): no disponible en la información proporcionada
- Checkpoints GastroNet-5M: no disponible en la información proporcionada
- Paper o publicación asociada: no disponible en la información proporcionada
