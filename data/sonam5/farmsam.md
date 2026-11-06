# Sonam5/FarmSAM

## Resumen

FarmSAM es una colección de nueve checkpoints de tipo "student" destilados a partir del backbone de imagen de SAM 3 (Segment Anything Model 3) de Meta. El autor, Sonam5 (Wangchuk), sustituye el backbone original de SAM 3 por una red TinyViT-21M-512 mucho más pequeña, manteniendo intacto el resto del tracker de vídeo de SAM 3 (neck, decoder de máscaras, memory attention y memory encoder). El objetivo es reducir el coste computacional de la segmentación y el seguimiento multiobjeto en entornos de granja, especialmente en ganado porcino y terneros lecheros.

Cada student tiene 40.655.408 parámetros de backbone y 60.200.882 parámetros totales al integrarse con el tracker de SAM 3, frente a los 446,24 M de backbone y 465,78 M totales del SAM 3 original. La entrada es de 1.024 × 1.024 píxeles y la salida es un mapa de características de forma `[1, 1024, 72, 72]`. La destilación se realiza sobre fotogramas sin etiquetar de una granja concreta, lo que convierte a FarmSAM en un ejemplo de adaptación de dominio mediante destilación de características.

El modelo es relevante porque demuestra que es posible reducir el backbone de SAM 3 en más de un orden de magnitud (de 446 M a 40,7 M de parámetros) y mantener un rendimiento razonable en dominios específicos, con un aumento de throughput de 3,25 fps a entre 4,83 y 5,01 fps en una A10. No obstante, los resultados de precisión varían mucho según el student y el dataset: algunos se acercan a SAM 3 y otros quedan materialmente por debajo. Los checkpoints no constituyen un tracker completo por sí mismos y requieren los pesos de `facebook/sam3` bajo su licencia con acceso restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT-21M-512 (trunk) + cabeza de pirámide de características, integrada como backbone en el tracker de vídeo de SAM 3 |
| Parametros totales | 60.200.882 (con tracker SAM 3); 40.655.408 de backbone |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 1.024 × 1.024) |
| Tipos de cuantizacion | no disponible (pesos en `.pt` en bf16 tras la carga; el autor indica que `load_student` castea a bf16) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | sam-license (SAM License, con restricciones; enlace en `LICENSE_SAM.txt`) |
| Formato de pesos | `.pt` (pickle de PyTorch); siete de los nueve ficheros incluyen estado del optimizador |

## Arquitectura y entrenamiento

FarmSAM emplea una arquitectura de destilación de características (*feature distillation*) desde el backbone de imagen de SAM 3 hacia un student TinyViT-21M-512, inicializado desde `timm/tiny_vit_21m_512.dist_in22k_ft_in1k`. El student añade una cabeza de pirámide de características que produce un mapa `[1, 1024, 72, 72]` compatible con el resto del tracker de SAM 3, que permanece congelado y sin cambios. La entrada se redimensiona a 1.024 × 1.024. Los objetivos de destilación son características almacenadas previamente del SAM 3 original sobre fotogramas sin etiquetar de una granja concreta (Edinburgh, PigTrack o un corral de terneros lecheros).

El entrenamiento se realizó por dominio: cada student se destila sobre fotogramas de una sola granja. El número de fotogramas varía entre 3.000 y 10.514 (incluyendo fotogramas de selección de checkpoint), y las épocas ejecutadas oscilan entre 40 y 90, con el mejor checkpoint entre la 25 y la 75. Los tiempos de entrenamiento registrados van de 1,77 h a 10,58 h en una A100, salvo el student de Edinburgh, que se entrenó en una A10 sin tiempo registrado. Algunas variantes usan *frame mining* (selección de fotogramas) o muestreo aleatorio, y una variante desactiva *drop-path*. El autor documenta en `DISCLOSURES.md` que las filas con fotogramas extra corresponden a ejecuciones *post hoc*. No se especifica el uso de RLHF ni DPO, algo esperable en un modelo puramente visual.

## Capacidades

- Generación de máscaras de segmentación (*mask generation*) sobre imágenes, con pipeline declarado `mask-generation`.
- Seguimiento de objetos en vídeo (*video object tracking*) y seguimiento multiobjeto (*multi-object tracking*) al integrarse en el tracker de SAM 3.
- Extracción de características visuales densas con salida `[1, 1024, 72, 72]` para alimentar el neck y el decoder de máscaras de SAM 3.
- Adaptación a dominios específicos de ganado: cerdos (PigTrack) y terneros lecheros (dairy calves).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo exclusivamente de visión.
- No dispone de modo *thinking*, visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Seguimiento multiobjeto de cerdos en naves: el student de PigTrack, integrado en el tracker de SAM 3, permite seguir múltiples animales por fotograma con un backbone de 40,7 M de parámetros en lugar de 446 M, reduciendo el coste por cámara en instalaciones con muchas vistas simultáneas.
- Monitorización de comportamiento de terneros lecheros: el student de calf (night-mined) alcanza un 99,23 % de identidad correcta en seis ventanas de vídeo, lo que lo hace adecuado para analizar conductas (por ejemplo, juego) en grabaciones nocturnas con poca luz.
- Despliegue en hardware de borde con GPUs de gama media: con 60,2 M de parámetros totales y un throughput de 4,83–5,01 fps en una A10, es viable en servidores de inferencia modestos o en estaciones locales de granja, siempre que se acepte la pérdida de precisión frente a SAM 3.
- Análisis retrospectivo de vídeo almacenado: al procesar fotogramas a ~42 ms por backbone en una A10, se pueden analizar horas de grabación de una explotación concreta para extraer estadísticas de ocupación y movimiento.
- Investigación en destilación de modelos de segmentación: los nueve checkpoints y las tablas de métricas sirven como referencia para estudiar el compromiso entre tamaño, velocidad y precisión en la destilación de SAM 3.
- Adaptación a una nueva granja mediante destilación: el pipeline documentado (objetivos de SAM 3 almacenados, entrenamiento del student e intercambio en el tracker) permite replicar el proceso para un nuevo dominio ganadero con fotogramas sin etiquetar.

## Benchmarks y rendimiento

Tamaño y velocidad (una A10 vGPU, 4 objetos, decodificación en el bucle):

| Modelo | Parámetros backbone | Parámetros totales | Backbone, ms por fotograma | Extremo a extremo, fps |
|:---|---:|---:|---:|---:|
| SAM 3 | 446,24 M | 465,78 M | 152,46 | 3,2483 |
| Students FarmSAM | 40,66 M | 60,20 M | 41,56–42,61 | 4,8253–5,0087 |
| SAM 2.1-small | 33,95 M | 46,06 M | 15,04 | 7,8262 |
| SAM 2.1-tiny | 26,85 M | 38,96 M | 12,78 | 8,0014 |
| EdgeTAM | 4,71 M | 13,90 M | 10,03 | 13,0471 |

Precisión frente a SAM 3:

| Student | Dataset | Métrica | Student | SAM 3 | Diferencia |
|:---|:---|:---|---:|---:|:---|
| Edinburgh student | Edinburgh, 4 clips | HOTA | 74,0540 | 75,5437 | −1,49 (descriptivo, sin intervalo) |
| PigTrack student | PigTrack, 25 secuencias | HOTA | 73,2508 | 85,8720 | −12,62 [IC 95 % −16,39, −8,79], materialmente peor |
| Edinburgh student, zero-shot | PigTrack, 25 secuencias | HOTA | 61,5665 | 85,8720 | −24,31 [IC 95 % −28,02, −21,80], materialmente peor |
| Calf student (night-mined) | Seis ventanas de terneros | Identidad correcta % | 99,23 | 99,80 | −0,57 pp [−1,52, +0,16], descriptivo |
| Calf student (evenly spaced) | Seis ventanas de terneros | Identidad correcta % | 87,76 | 99,80 | −12,04 pp [−15,62, −8,72], descriptivo; la cercanía no se cumple para este student |

Dato adicional: SAM 2.1-small obtiene HOTA 80,9033 en PigTrack, por encima del student de PigTrack de FarmSAM (73,2508).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 60,2 M de parámetros totales en bf16, el peso ronda los 120 MB, pero el tracker de SAM 3 completo (neck, decoder, memory attention y memory encoder) añade memoria no cuantificada en la información disponible.
- GPU recomendadas: el autor reporta mediciones en una A10 vGPU y entrenamiento en una A100 (y una A10 para el student de Edinburgh). No se especifican requisitos mínimos.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; por tamaño de backbone (40,7 M de parámetros) debería caber en GPUs con suficiente VRAM para el tracker completo, pero no hay datos publicados.
- Opciones de despliegue: carga mediante PyTorch con `core.load_student` y `core.load_arm` del repositorio `github.com/Sonam525/FarmSAM`; requiere `hf auth login` con los términos de `facebook/sam3` aceptados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: backbone a 41,56–42,61 ms por fotograma en una A10; extremo a extremo de 4,8253–5,0087 fps con 4 objetos. SAM 3 original: 152,46 ms y 3,2483 fps.

## Comparativa con modelos similares

| Modelo | Parámetros backbone | Parámetros totales | HOTA en PigTrack | fps (A10, 4 objetos) | Licencia |
|:---|---:|---:|---:|---:|:---|
| FarmSAM (PigTrack student) | 40,66 M | 60,20 M | 73,2508 | 4,83–5,01 | sam-license |
| SAM 3 | 446,24 M | 465,78 M | 85,8720 | 3,2483 | sam-license (acceso restringido) |
| SAM 2.1-small | 33,95 M | 46,06 M | 80,9033 | 7,8262 | no disponible en la información |
| SAM 2.1-tiny | 26,85 M | 38,96 M | no disponible | 8,0014 | no disponible en la información |
| EdgeTAM | 4,71 M | 13,90 M | no disponible | 13,0471 | no disponible en la información |

## Limitaciones y advertencias

- Los ficheros no constituyen un tracker completo: requieren los pesos de `facebook/sam3` bajo su licencia con acceso restringido, lo que añade una dependencia externa y un proceso de aceptación de términos.
- El student de PigTrack queda materialmente por debajo de SAM 3 en HOTA (−12,62 puntos), y el student de Edinburgh en zero-shot sobre PigTrack cae aún más (−24,31), lo que evidencia una generalización entre dominios muy limitada.
- El student de calf con muestreo uniforme pierde 12,04 puntos porcentuales de identidad correcta frente a SAM 3; solo la variante night-mined se acerca (99,23 % frente a 99,80 %).
- Los propios resultados se describen en parte como "descriptivos, sin intervalo", y el autor advierte que la cercanía no se cumple para el student de calf evenly spaced.
- Los pesos están en formato `.pt` (pickle), lo que implica riesgo de ejecución de código al cargar; el autor recomienda verificar el SHA-256 antes de cargar y usar los pesos EMA (siete de los nueve ficheros incluyen estado del optimizador).
- El autor indica que el benchmark se ejecutó en Databricks y no desde el snippet de carga, y que no se ha probado en una instalación limpia.
- La licencia sam-license impone restricciones de uso; debe revisarse `LICENSE_SAM.txt` antes de cualquier uso comercial.
- No hay información sobre sesgos, alucinación (no aplica a un modelo de visión) ni cobertura multilingüe; el modelo está entrenado y evaluado en dominios ganaderos muy concretos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el preprint (arXiv 2604.27128) no ha sido verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sonam5/FarmSAM
- Repositorio de código: https://github.com/Sonam525/FarmSAM
- Preprint: https://arxiv.org/abs/2604.27128
- Licencia SAM: https://huggingface.co/Sonam5/FarmSAM/blob/main/LICENSE_SAM.txt
- Divulgaciones del autor: https://github.com/Sonam525/FarmSAM/blob/main/docs/DISCLOSURES.md
- Modelo base del student: https://huggingface.co/timm/tiny_vit_21m_512.dist_in22k_ft_in1k
- Pesos de SAM 3 (acceso restringido): https://huggingface.co/facebook/sam3
- Dataset de comportamiento de terneros: https://huggingface.co/datasets/Sonam5/Calf-Play-Behavior-Dataset
- Perfil del autor: https://huggingface.co/Sonam5
