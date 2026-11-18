# ameer00712/leafgen-models

## Resumen

LeafGen AI es un paquete de modelos de vision por computador publicado por el usuario ameer00712 en Hugging Face, orientado a la clasificacion de enfermedades de hojas de plantas y a la generacion de imagenes sinteticas de hojas. Incluye dos clasificadores basados en ResNet18 (uno entrenado solo con datos reales y otro con datos reales mas sinteticos) y un generador DCGAN condicional que produce imagenes RGB de 64x64 pixeles a partir de ruido y una etiqueta de clase. El conjunto cubre 38 clases de enfermedad/sano distribuidas en 14 cultivos, y se distribuye tambien en formato ONNX ademas de los pesos PyTorch.

El proyecto se enmarca en un trabajo academico de aprendizaje basado en proyectos (PBL) sobre el Objetivo de Desarrollo Sostenible 2 (hambre cero) y usa el dataset PlantVillage, compuesto por fotografias de laboratorio con fondo liso. Es, por tanto, un prototipo de investigacion y no un sistema listo para produccion en campo.

Su relevancia actual es limitada pero ilustrativa: sirve como referencia reproducible de un pipeline completo (clasificacion + aumento de datos generativo) con resultados medidos sobre 8.146 imagenes de test y tres semillas, y demuestra empiricamente que el aumento con GAN sinteticas no mejoro el rendimiento global en este caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (clasificador) + DCGAN condicional (generador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se ofrecen pesos PyTorch y ONNX en float) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |
| Resolucion de entrada | 64x64 RGB (clasificador y generador) |
| Numero de clases | 38 (14 cultivos) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El clasificador es una ResNet18 estandar que recibe imagenes de 64x64 pixeles y produce 38 logits, uno por clase de cultivo-enfermedad. Se publican dos variantes: `cnn_real.pt`, entrenada exclusivamente con imagenes reales de PlantVillage (la recomendada por el autor), y `cnn_aug.pt`, entrenada con datos reales mas imagenes sinteticas generadas por la DCGAN. El generador es una DCGAN condicional que toma un vector de ruido de dimension 100 concatenado con un one-hot de 38 clases y produce una imagen RGB de 64x64.

El preprocesado es parte critica del pipeline: redimensionado a 64x64 con interpolacion INTER_AREA y aplicacion de CLAHE (clip limit 2.0, mosaico 4x4) sobre el canal L en espacio de color LAB. El autor advierte que omitir este paso degrada la precision. No se especifican en la informacion disponible el numero de tokens ni el volumen exacto del conjunto de entrenamiento, aunque si el de test (8.146 imagenes reales) y que las seis clases raras cuentan con 100 imagenes reales de entrenamiento cada una. Los resultados se reportan sobre tres semillas.

## Capacidades

- Clasificacion de imagenes de hojas en 38 clases de enfermedad o estado sano, con salida de probabilidades y top-3.
- Generacion condicional de imagenes sinteticas de hojas de 64x64 pixeles para una clase concreta.
- Exportacion ONNX tanto del clasificador (entrada `image` float N,3,64,64 en rango 0-255; salida `probs`) como del generador (entradas `z` N,100 y `onehot` N,38; salida `images` en rango 0-255).
- Script de carga e inferencia listo para usar (`leafgen_model.py`) con funciones `load_classifier`, `classify`, `load_generator` y `generate`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking.
- Capacidades multilingues: no aplica.

## Casos de uso

- Prototipado academico de diagnostico de enfermedades foliares: el clasificador permite montar una demo de extremo a extremo con `leafgen_model.py` y validar el pipeline de preprocesado (resize + CLAHE) antes de invertir en un modelo mayor.
- Generacion de datos sinteticos para experimentos de aumento: la DCGAN condicional permite crear lotes de imagenes por clase y medir si el aumento mejora clases con pocas muestras, replicando el experimento del autor sobre las seis clases raras.
- Docencia en vision por computador: el par clasificador + GAN sirve para explicar en clase la diferencia entre datos reales y sinteticos, el efecto del desbalanceo de clases y la evaluacion con macro-F1.
- Integracion en aplicaciones moviles o edge via ONNX: al operar a 64x64 y con ResNet18, el modelo es ligero y puede ejecutarse con ONNX Runtime en dispositivos sin GPU dedicada.
- Baseline reproducible para comparativas: sus metricas sobre 8.146 imagenes y tres semillas permiten usarlo como referencia frente a modelos mas grandes o con mayor resolucion.
- Filtro preliminar en pipelines de anotacion: usar la confianza de salida para descartar imagenes ambiguas antes de la revision humana, aprovechando que el autor recomienda interpretar valores bajos de confianza como incertidumbre.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 8.146 imagenes reales de test y tres semillas:

| Metrica | A: solo reales (`cnn_real.pt`) | B: reales + sinteticas (`cnn_aug.pt`) |
|---|---|---|
| Macro-F1 (38 clases) | 0,9784 | 0,9708 |
| Precision (accuracy) | 98,42 % | 97,78 % |
| Recall medio en 6 clases raras | 93,56 % | 94,02 % |

El propio autor concluye que las imagenes sinteticas no mejoraron el rendimiento global y que la ganancia en clases raras queda dentro del ruido entre semillas. No se han publicado resultados frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; ResNet18 a 64x64 requiere del orden de cientos de MB, aunque el autor no publica cifras exactas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se necesita A100 ni H100.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (se incluyen exportaciones ONNX), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeafGen AI (ResNet18) | no disponible | 64x64 | 38 (14 cultivos) | MIT | Hugging Face |
| LeafGen AI (DCGAN condicional) | no disponible | 64x64 | 38 | MIT | Hugging Face |
| Alternativas de clasificacion de enfermedades foliares | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables con metricas verificables; se indica "no disponible" para evitar datos no contrastados.

## Limitaciones y advertencias

- Entrenado con PlantVillage, fotografias de laboratorio con fondo liso: no es fiable con fotos de campo reales (iluminacion, fondo, oclusion, angulo).
- Solo conoce 14 cultivos y 38 clases; cualquier otra planta recibira una respuesta erronea entre esas 38 clases. El autor recomienda usar el valor de confianza como indicador de incertidumbre.
- Riesgo de fuga de datos: una misma hoja aparece en varias fotos de PlantVillage, por lo que particiones aleatorias pueden inflar las metricas.
- Resolucion muy baja (64x64) y una unica arquitectura de GAN evaluada con solo tres semillas; los resultados tienen validez limitada.
- El aumento con imagenes sinteticas no mejoro el rendimiento global en el experimento publicado.
- Licencia MIT para el codigo y los pesos, pero el dataset PlantVillage tiene su propia licencia: debe verificarse antes de redistribuir imagenes.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza en especies fuera del dominio; no hay mecanismo de rechazo explicito.
- No debe usarse como unico criterio en decisiones agronomicas reales sin validacion en campo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameer00712/leafgen-models
- Dataset PlantVillage (referencia citada por el autor): Hughes & Salathe (2015)
- No se han encontrado en la informacion disponible papers, blogs, repositorios o demos adicionales.
