# kaopanboonyuen/KAO-TerraMind-C-OpenEarthMap

## Resumen

KAO-TerraMind-C-OpenEarthMap es un checkpoint de segmentación semántica de imágenes aéreas y satelitales, resultado del ajuste fino del modelo fundacional geoespacial TerraMind-1.0-base (IBM/ESA) sobre el conjunto de datos OpenEarthMap. Lo desarrolla el autor independiente kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor sobre la misma receta de entrenamiento. La variante C se centra exclusivamente en el decodificador: un UperNet más ancho, con mayor dropout y taps de características más profundos en el codificador.

El modelo resuelve una tarea concreta de predicción densa: clasificación por píxel en 8 clases de cobertura del suelo (Bareland, Rangeland, Developed space, Road, Tree, Water, Agriculture land, Building) sobre parches RGB de 3 x 224 x 224 a resoluciones de 0,25-0,5 m GSD. Con 119,97 M de parámetros y una latencia declarada de 18,75 ms por tesela en una T4 con fp16, está pensado para experimentación reproducible y evaluación comparativa, no como producto listo para producción.

Su relevancia actual es doble: por un lado, publica un checkpoint completamente especificado para reproducir una submission a CVPR 2027; por otro, demuestra que un ajuste quirúrgico del decodificador (+0,84 pp de mIoU frente a la misma receta con el decodificador original) basta para mejorar un modelo fundacional geoespacial sin tocar el backbone ni los datos. El código de entrenamiento no se incluye mientras el paper está en revisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone TerraMind-1.0-base) + decodificador UperNet |
| Parámetros totales | 119,97 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 3 x 224 x 224 píxeles) |
| Tipos de cuantización | no disponible (checkpoint fp16/`.pt`) |
| Idiomas soportados | en (metadatos del modelo; la tarea es de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (`terramind_v1_kaoC_best.pt`), cargado vía TerraTorch >= 1.2.4 |
| Modalidad de entrada | RGB aérea/satelital, 8 bits, 3 x 224 x 224 |
| Salida | logits por píxel sobre 8 clases |
| Variante | C (decodificador: UperNet más ancho, taps más profundos, más dropout) |
| Modelo base | ibm-esa-geospatial/TerraMind-1.0-base |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo combina el backbone TerraMind-1.0-base (`terramind_v1_base`) con un decodificador UperNet construido mediante `EncoderDecoderFactory` de TerraTorch. La variante C modifica tres hiperparámetros respecto a la referencia: canales del decodificador de 256 a 512, dropout de la cabeza de 0,1 a 0,2 y taps de características del codificador de [2, 5, 8, 11] a [3, 6, 9, 11]. Este último cambio sesga la extracción hacia capas más profundas (mayor semántica, menor resolución espacial), lo que añade unos 22 M de parámetros al conjunto.

La receta de entrenamiento es idéntica para los siete modelos de la familia, de modo que cualquier diferencia es atribuible al único factor modificado. Se usa AdamW con LR base 1e-4 y multiplicador del backbone 0,1, weight decay 0,01, pérdida de entropía cruzada ponderada por clase (pesos sqrt-inverse-frequency) más Dice con peso 0,5, 30 épocas con paciencia de early stopping de 8 (checkpoint elegido por mIoU de validación), batch de 16, sampler balanceado por clase con 6000 ventanas por época, ventana de 224 x 224 con stride 112, aumentos de volteo horizontal/vertical y rotaciones de 90°, precisión fp16 con grad-clip 1,0, normalización con estadísticas RGB de preentrenamiento de TerraMind (escala 0-255), semilla 42 y una única NVIDIA Tesla T4.

El protocolo de evaluación usa las teselas oficiales de validación de OpenEarthMap como test (las etiquetas de test oficiales no son públicas) y reserva un 10 % de las teselas de train, con semilla fija, exclusivamente para selección de checkpoint.

## Capacidades

- Segmentación semántica densa de imágenes aéreas y satelitales RGB en 8 clases de cobertura del suelo.
- Predicción por píxel con logits por clase, apta para mapas de cobertura del suelo a resolución de 0,25-0,5 m GSD.
- Transferencia desde un modelo fundacional geoespacial preentrenado (TerraMind-1.0-base), lo que le permite generalizar sobre teselas de 1000 x 1000 px recortadas a ventanas de 224 x 224.
- Integración con el ecosistema TerraTorch (`>=1.2.4`) para carga, inferencia y evaluación estandarizada.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente visual de predicción densa.
- No dispone de capacidades multilingües, de visión general (VQA, captioning) ni de audio; el único idioma declarado en metadatos es `en`.

## Casos de uso

- Monitorización de cobertura del suelo a escala regional: procesar teselas OpenEarthMap o imágenes aéreas equivalentes para generar mapas de 8 clases (agua, árbol, edificio, carretera, etc.) y comparar series temporales de cambio.
- Validación de pipelines de teledetección: al ser un checkpoint público con receta completamente especificada, sirve como referencia reproducible para verificar que una implementación propia de TerraTorch produce las mismas métricas.
- Investigación en adaptación de modelos fundacionales: la variante C aísla el efecto del decodificador, por lo que es útil como punto de comparación en estudios de ablation sobre UperNet, taps de características y dropout.
- Prototipado de sistemas de clasificación de uso del suelo: con 18,75 ms por tesela de 224 x 224 en T4 fp16, permite estimar el coste de inferencia de un despliegue mayor antes de invertir en hardware.
- Generación de datasets auxiliares: usar las predicciones del modelo para preetiquetar imágenes aéreas y acelerar el etiquetado manual en proyectos de cartografía.
- Docencia y reproducción académica: el repositorio incluye el helper de inferencia, la configuración exacta de arquitectura y receta, y los resultados completos, lo que facilita replicar el experimento en un curso o taller.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto de validación oficial de OpenEarthMap usado como test:

| Métrica | Valor (%) |
|---|---|
| mIoU | 62,96 |
| Overall Accuracy | 77,04 |
| Macro F1 | 76,51 |
| Macro Precision | 76,15 |
| Macro Recall | 77,01 |

Comparación interna declarada por el autor: +0,84 pp de mIoU frente a TerraMind-1.0-base entrenado con la receta idéntica, lo que sitúa a esta variante en la posición 2 de 7 dentro de la familia KAO-TerraMind. No se han publicado en la información disponible resultados de benchmarks estándar de visión (MMLU, HumanEval, GSM8K, etc.), que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 119,97 M de parámetros en fp16 el peso ronda los 0,24 GB, por lo que la huella real vendrá dominada por activaciones y buffers de la ventana de 224 x 224.
- GPU recomendadas: el autor reporta entrenamiento en 1 x NVIDIA Tesla T4; para inferencia, cualquier GPU con al menos unos pocos GB de VRAM debería bastar, aunque no se especifican mínimos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX con 4 GB o más, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: TerraTorch `>=1.2.4` (librería oficial del checkpoint); no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 18,75 ms por tesela de 224 x 224 en T4, fp16, batch 1 (dato declarado por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mIoU OpenEarthMap | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAO-TerraMind-C-OpenEarthMap | 119,97 M | 3 x 224 x 224 RGB | 62,96 % | Apache-2.0 | Hugging Face (inferencia) |
| TerraMind-1.0-base (receta idéntica) | ~98 M (estimado por la diferencia de ~22 M) | 3 x 224 x 224 RGB | 62,12 % (implícito, -0,84 pp) | Apache-2.0 | Hugging Face |
| TerraMind-1.0-base (original, sin ajuste) | no disponible | multimodal | no disponible | Apache-2.0 | Hugging Face |
| Otras variantes KAO (A, B) | no disponible | 3 x 224 x 224 RGB | no disponible en esta ficha | Apache-2.0 | Hugging Face |

La comparación con alternativas externas de la misma categoría (por ejemplo, otros modelos fundacionales geoespaciales ajustados a OpenEarthMap) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden únicamente del autor.
- El conjunto de test son las teselas de validación oficiales de OpenEarthMap, no el test oficial (cuyas etiquetas no son públicas); las cifras no son directamente comparables con las de trabajos que usen otro protocolo.
- Código de entrenamiento no incluido mientras el paper está en revisión: el repositorio es de solo inferencia, lo que limita la reproducibilidad completa del ajuste fino.
- Modelo especializado: no es un chatbot ni un modelo de propósito general; no soporta tool calling, agentes, razonamiento multi-paso ni otras modalidades.
- Dominio restringido a RGB aéreo/satelital a 0,25-0,5 m GSD y ventanas de 224 x 224; el rendimiento fuera de esa distribución (otras resoluciones, sensores multiespectrales, SAR) no está documentado.
- Riesgo de sesgo geográfico y de clase: OpenEarthMap es un dataset global pero desbalanceado; la pérdida ponderada por frecuencia mitiga, no elimina, el sesgo hacia clases mayoritarias.
- Riesgo de alucinación entendido como predicciones erróneas en píxeles ambiguos (transiciones, sombras, oclusiones); no hay calibración de incertidumbre publicada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base TerraMind-1.0-base debe verificarse por separado antes de un despliegue en producción.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, y autor independiente sin soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-C-OpenEarthMap
- Modelo base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Librería TerraTorch: https://github.com/IBM/terratorch
- Dataset OpenEarthMap: no disponible enlace directo en la información proporcionada
- Paper / submission CVPR 2027: no disponible (en revisión según el autor)
- Repositorio de código de entrenamiento: no disponible (no incluido mientras el paper está en revisión)
- Demo: no disponible
