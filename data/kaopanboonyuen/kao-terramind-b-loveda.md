# kaopanboonyuen/KAO-TerraMind-B-LoveDa

## Resumen

KAO-TerraMind-B-LoveDa es un checkpoint de segmentación semántica de imágenes satelitales obtenido mediante ajuste fino de TerraMind-1.0-base, el modelo fundacional geoespacial desarrollado por IBM Research y la ESA. Lo publica el investigador kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor sobre la misma receta de entrenamiento, destinadas a reproducir un envío a CVPR 2027. El modelo resuelve la predicción densa de cobertura del suelo en siete clases sobre escenas de satélite RGB de 0,3 m de resolución del conjunto LoveDA.

La arquitectura combina el backbone TerraMind-1.0-base con un decodificador UperNet implementado mediante TerraTorch, sumando 97,60 millones de parámetros. La variante B se distingue únicamente por duplicar el peso del término Dice en la función de pérdida (de 0,5 a 1,0), con el objetivo de mejorar la segmentación de clases pequeñas o raras. El resto de la receta (datos, semilla, épocas, batch, sampler y schedule) es idéntico al resto de variantes, lo que permite atribuir cualquier diferencia de rendimiento a ese único cambio.

El interés actual del checkpoint es de naturaleza metodológica y de reproducibilidad: se publica como artefacto de inferencia con la configuración exacta de arquitectura y receta, mientras el código de entrenamiento permanece retenido por la revisión del paper. Alcanza un mIoU de 48,49 en el protocolo de test definido por el autor, ligeramente por debajo de la referencia TerraMind-1.0-base entrenada con la misma receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone TerraMind-1.0-base (terramind_v1_base) con decodificador UperNet (TerraTorch EncoderDecoderFactory) |
| Parametros totales | 97,60 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 3 x 224 x 224 píxeles (parches de 224 x 224) |
| Tipos de cuantizacion | no disponible (checkpoint en fp16 durante la evaluación) |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt): `terramind_v1_kaoB_best.pt` |

## Arquitectura y entrenamiento

El modelo es un encoder-decoder para segmentación semántica densa. El encoder es el backbone TerraMind-1.0-base, un modelo fundacional geoespacial multimodal preentrenado por IBM y la ESA, inicializado desde `ibm-esa-geospatial/TerraMind-1.0-base`. Sobre él se monta un decodificador UperNet construido con la factoría `EncoderDecoderFactory` de TerraTorch. La modalidad de entrada es exclusivamente RGB (tres canales, 8 bits, 224 x 224 píxeles) y la salida son logits por píxel sobre siete clases.

El ajuste fino se realizó sobre LoveDA (escenas urbanas y rurales, 0,3 m de GSD, teselas de 1024 x 1024 píxeles) con una receta fija: optimizador AdamW con LR base 1e-4 y multiplicador de backbone 0,1, weight decay 0,01, pérdida de entropía cruzada ponderada por clase (pesos de frecuencia inversa con raíz cuadrada) más un término Dice, 30 épocas con paciencia de early stopping de 8, batch 16, sampler balanceado por clase con 6000 ventanas por época, ventana de 224 x 224 con stride de 112, aumentos de volteo horizontal y vertical y rotaciones de 90 grados, precisión fp16, semilla 42 y una única NVIDIA Tesla T4. La innovación de esta variante es exclusivamente la pérdida: el peso del término Dice sube de 0,5 a 1,0 para forzar mayor solapamiento en clases pequeñas o raras. El checkpoint se selecciona por mIoU de validación.

## Capacidades

- Segmentación semántica densa de cobertura del suelo en siete clases: Background, Building, Road, Water, Barren, Forest y Agriculture.
- Procesamiento de imágenes satelitales RGB de muy alta resolución (0,3 m de GSD) en parches de 224 x 224 píxeles.
- Predicción por píxel con logits por clase, apta para generación de mapas de cobertura del suelo.
- Inferencia en fp16 sobre GPU de gama media (validada en Tesla T4).
- No soporta tool calling ni function calling.
- No es un modelo generativo de texto ni dispone de modo de razonamiento multi-step.
- No soporta otras modalidades de entrada (multiespectral, SAR, DEM) en este checkpoint, solo RGB.
- Capacidad multilingüe no aplicable: es un modelo de visión con etiquetas en inglés.

## Casos de uso

- Cartografía de cobertura del suelo a escala regional: el modelo clasifica cada píxel de teselas satelitales de 0,3 m en siete categorías, lo que permite generar mapas temáticos de uso del suelo a partir de ortoimágenes RGB sin necesidad de datos multiespectrales.
- Monitorización de expansión urbana: al detectar clases Building y Road con un decodificador entrenado específicamente para clases raras mediante el término Dice reforzado, resulta adecuado para seguir el crecimiento de infraestructura en series temporales de imágenes.
- Seguimiento de masas de agua y humedales: la clase Water se segmenta directamente sobre RGB, lo que facilita inventarios de láminas de agua y detección de cambios estacionales en escenas rurales y urbanas.
- Análisis de cubierta forestal y agrícola: las clases Forest y Agriculture permiten estimar superficies cultivadas y forestales en entornos rurales de LoveDA, útil para estudios de uso del suelo y planificación territorial.
- Detección de suelo desnudo y degradación: la clase Barren posibilita identificar superficies sin vegetación, relevante en estudios de erosión, minería a cielo abierto o zonas en obras.
- Reproducibilidad de investigación: el checkpoint sirve como referencia exacta para replicar el protocolo experimental del envío a CVPR 2027, comparando la variante B (Dice 1,0) contra la receta base y las variantes A y C.
- Prototipado en hardware modesto: con 97,60 M de parámetros y 29,56 ms por tesela de 224 x 224 en T4 fp16, es viable para pipelines de inferencia por lotes en GPUs de gama media o en la nube con instancias económicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluación sobre LoveDA con test = carpeta oficial `Val/` (Urban + Rural), ventanas de 224 x 224 sin solapamiento y bordes con relleno de ceros.

| Metrica | Valor (%) |
|---|---|
| mIoU | 48,49 |
| Overall Accuracy | 67,15 |
| Macro F1 | 64,60 |
| Macro Precision | 69,65 |
| Macro Recall | 62,77 |

Según la model card, el resultado queda 0,12 puntos porcentuales por debajo del TerraMind-1.0-base entrenado con la receta idéntica, con un ranking de 5 sobre 7 entre las variantes evaluadas. No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 97,60 M de parámetros en fp16 el peso de los pesos ronda los 0,2 GB, por lo que la VRAM necesaria es modesta (del orden de 1-2 GB incluyendo activaciones para teselas de 224 x 224).
- GPU validadas por el autor: 1 x NVIDIA Tesla T4 para entrenamiento e inferencia en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060 y superiores); el autor no publica una lista explícita de GPUs de consumo validadas.
- Opciones de despliegue: TerraTorch (>=1.2.4) como librería principal; el checkpoint es un `.pt` de PyTorch, por lo que también puede cargarse con PyTorch nativo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 29,56 ms por tesela de 224 x 224 en Tesla T4 con fp16 y batch 1, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / ventana | mIoU LoveDA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KAO-TerraMind-B-LoveDa | 97,60 M | RGB 3 x 224 x 224 | 224 x 224 px | 48,49 | Apache-2.0 | Hugging Face |
| TerraMind-1.0-base (receta idéntica, referencia) | no disponible en la informacion | RGB 3 x 224 x 224 | 224 x 224 px | 48,61 (según la model card, +0,12 pp) | Apache-2.0 (modelo base) | Hugging Face (ibm-esa-geospatial) |
| Otras variantes KAO (A y C) | no disponible en la informacion | RGB 3 x 224 x 224 | 224 x 224 px | no disponible en la informacion | Apache-2.0 | No publicadas en la informacion |

No se dispone en la información proporcionada de datos comparativos con otros modelos de segmentación geoespacial (por ejemplo, arquitecturas específicas para LoveDA) ni de sus parámetros, contexto o licencia, por lo que la comparativa se limita a la referencia interna de la familia KAO-TerraMind.

## Limitaciones y advertencias

- El resultado de mIoU (48,49) es inferior en 0,12 pp a la referencia TerraMind-1.0-base con la misma receta, por lo que la variante B no mejora el rendimiento global pese a su objetivo de reforzar clases raras.
- Métricas no verificadas: la model card marca los resultados como `verified: false`; no han sido reproducidos de forma independiente.
- Protocolo de evaluación no estándar: el test utiliza la carpeta oficial `Val/` porque las máscaras de test de LoveDA no son públicas, y se reserva un 10 % del train para selección de checkpoint; los resultados no son directamente comparables con los del leaderboard oficial de LoveDA.
- Entrada limitada a RGB de 8 bits: no admite modalidades multiespectrales, SAR ni DEM, lo que restringe su aplicabilidad frente a otras variantes de TerraMind.
- Dominio restringido: entrenado exclusivamente sobre LoveDA (escenas urbanas y rurales a 0,3 m); el rendimiento puede degradarse en otras resoluciones, sensores o regiones geográficas.
- Código de entrenamiento no incluido: la receta se documenta, pero el código queda retenido mientras el paper está en revisión, lo que dificulta la reproducción completa.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de clasificación errónea de píxeles en clases minoritarias o en bordes de objetos.
- Sesgos potenciales derivados de la distribución de LoveDA (escenas de China y regiones concretas), no cuantificados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base TerraMind-1.0-base debe verificarse por separado; la información disponible no detalla condiciones adicionales del backbone de IBM y ESA.
- Solo etiquetas en inglés y sin soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-B-LoveDa
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Repositorio TerraTorch: https://github.com/IBM/terratorch
- Dataset LoveDA: no disponible en la información proporcionada
- Paper o blog del envío a CVPR 2027: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
