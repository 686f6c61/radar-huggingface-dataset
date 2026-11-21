# raghav1210gupta/clutchmetrics-models

## Resumen

ClutchMetrics-models es un repositorio de pesos de deteccion de objetos orientado al analisis de partidos de baloncesto, desarrollado por Raghav Gupta y su equipo del Design Practicum del IIT Mandi. No se trata de un modelo de lenguaje, sino de un conjunto de dos detectores basados en RF-DETR (una arquitectura transformer de deteccion de objetos de Roboflow) afinados para identificar jugadores, balon, arbitros, numeros de camiseta y aros en retransmisiones de partidos de la NBA, la NCAA y la FIBA. El repositorio forma parte del sistema ClutchMetrics, que procesa video de partidos y genera analisis completos: posiciones en pista, pases, tiros con puntuacion FIBA y paneles para entrenadores y jugadores.

El componente principal es `rfdetr_basketball_v2`, un RF-DETR Nano a 576 px afinado sobre tres datasets publicos de baloncesto mas 350 fotogramas FIBA etiquetados manualmente por el equipo. El segundo componente, `rfdetr_5class`, es un RF-DETR Nano a 384 px con cinco clases que se emplea unicamente para extraer parches de numeros de camiseta (posteriormente leidos por Qwen3-VL-2B) y para detectar aros.

La relevancia de este modelo es acotada pero clara: cubre un nicho de analitica deportiva donde los detectores genericos rinden mal sobre el balon (objetos pequenos, movimiento rapido, oclusiones), y lo hace con licencia Apache-2.0 y pesos descargables. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su creador lo publico el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de deteccion de objetos) en variante Nano; dos checkpoints independientes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos en `.pth` (PyTorch) y carpeta de pesos en formato transformers |
| Idiomas soportados | no aplica (deteccion visual); no disponible para el modulo de lectura de numeros |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch) para `rfdetr_5class`; carpeta de pesos compatible con `AutoModelForObjectDetection` para `rfdetr_basketball_v2` |
| Resolucion de entrada | 576 px (`rfdetr_basketball_v2`), 384 px (`rfdetr_5class`) |
| Clases detectadas | balon, jugador, arbitro (`v2`); balon, numero, jugador, arbitro, aro (`5class`) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

RF-DETR es un detector basado en transformer que combina un backbone convolucional con un decoder transformer para la prediccion de cajas y clases, siguiendo la estela de DETR pero con mejoras de eficiencia que permiten variantes Nano desplegables en tiempo real. El checkpoint `rfdetr_basketball_v2` parte del modelo `koppolusameer/rfdetr-basketball-player-ball-referee-detection` (Apache-2.0) y se afino sobre tres datasets publicos de baloncesto alojados en Hugging Face (`koppolusameer/basketball-coco-20260416`, `koppolusameer/basketball-coco-player-detection` y `koppolusameer/basketball-coco-2025-04-02`), que cubren footage de NBA y universitario, mas 350 fotogramas FIBA etiquetados a mano por el equipo (220 de entrenamiento, 30 de validacion y 100 de test, divididos por tiempo para evitar fuga de informacion). Esos fotogramas FIBA se mostraron cuatro veces por epoca.

La receta de entrenamiento emplea AdamW con learning rate de 1e-4 para la cabeza y 2e-5 para el backbone, batch de 8, recortes con zoom, volteos horizontales y variaciones de iluminacion, seleccionando la mejor epoca por AP50 de validacion. El script esta publicado en el repositorio de GitHub del proyecto (`model/train_rfdetr.py`). El segundo checkpoint, `rfdetr_5class`, es un RF-DETR Nano a 384 px con cinco clases cuyo historial de entrenamiento no esta documentado en el repositorio; el propio autor advierte que es mas debil que `v2` en la deteccion del balon y que se usa solo para parches de numeros y aros.

## Capacidades

- Deteccion de jugadores, balon y arbitros en fotogramas de retransmisiones de baloncesto (NBA, NCAA, FIBA).
- Deteccion de numeros de camiseta como regiones (parches) que despues se leen con un modelo de vision-lenguaje externo (Qwen3-VL-2B).
- Deteccion de aros, empleada por el pipeline para la deteccion de tiros.
- Integracion en un pipeline de seguimiento (tracking) frame a frame para posiciones en pista y analisis de pases.
- Salida compatible con el ecosistema `transformers` mediante `AutoModelForObjectDetection` para el checkpoint `v2`.
- Carga directa con la libreria `rfdetr` (`RFDETRNano`) para el checkpoint de cinco clases.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.

## Casos de uso

- Analisis automatico de partidos: el pipeline ClutchMetrics procesa el video completo y produce estadisticas de jugadores, balon y arbitros; `rfdetr_basketball_v2` aporta la deteccion base en cada fotograma con un AP50 de 0,947 en el test de seis partidos NBA.
- Deteccion de tiros y puntuacion FIBA: la clase "aro" de `rfdetr_5class` permite localizar la canasta y cruzar la trayectoria del balon para determinar si un lanzamiento entra, con puntuacion de 2 o 3 puntos.
- Identificacion de jugadores por dorsal: los parches de numero detectados por `rfdetr_5class` se envian a Qwen3-VL-2B para leer el dorsal y asociarlo a la identidad del jugador durante el tracking.
- Paneles para entrenadores: las posiciones y eventos agregados alimentan dashboards de rendimiento colectivo e individual, utiles en categorias formativas o clubes sin equipos de analistas.
- Retransmision aumentada: superposicion de etiquetas de jugador y balon en directo o en diferido sobre footage de broadcast, aprovechando la mejora de AP50 del balon de 0,301 a 0,693 en el test FIBA propio.
- Investigacion en vision deportiva: el repositorio incluye `test_report.json` e `history.json` con puntuaciones por dataset e historial de entrenamiento, lo que facilita reproducir y comparar recetas de fine-tuning sobre RF-DETR.
- Prototipado de analitica de baloncesto en local: al ocupar 0,2 GB y ser RF-DETR Nano, puede ejecutarse en una GPU de consumo para pruebas sobre clips cortos.

## Benchmarks y rendimiento

Resultados de AP50 publicados en la model card, medidos sobre el split de test de cada dataset:

| Conjunto de test | Modelo de partida (media) | ClutchMetrics (media) | Balon: partida → ClutchMetrics |
|---|---|---|---|
| NBA (Celtics–Knicks) | 0,916 | 0,947 | 0,771 → 0,849 |
| NBA (seis partidos) | 0,848 | 0,943 | 0,626 → 0,861 |
| College | 0,725 | 0,864 | 0,484 → 0,709 |
| FIBA (propio, parte no vista del partido) | 0,766 | 0,876 | 0,301 → 0,693 |

No se han publicado resultados de benchmarks adicionales (mAP, latencia, throughput) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,2 GB) y la variante Nano, es previsible que quepa en GPUs de consumo, pero no hay cifras oficiales.
- GPU recomendadas: no disponible; RF-DETR Nano a 576 px es un modelo de deteccion en tiempo real, por lo que se espera funcionamiento en GPUs consumer medias, aunque el autor no publica requisitos.
- Cabe en GPU de consumo: probablemente si, dado el tamano del checkpoint y la resolucion de entrada, pero sin confirmacion oficial.
- Opciones de despliegue: libreria `rfdetr` (clase `RFDETRNano`), `transformers` con `AutoModelForObjectDetection` para el checkpoint `v2`, y el pipeline propio del repositorio ClutchMetrics (`model/basketball_pipeline.py`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClutchMetrics (`rfdetr_basketball_v2`) | RF-DETR Nano afinado | balon, jugador, arbitro | 576 px | Apache-2.0 | Hugging Face, 0 descargas |
| `koppolusameer/rfdetr-basketball-player-ball-referee-detection` | RF-DETR (modelo base) | balon, jugador, arbitro | no disponible | Apache-2.0 | Hugging Face |
| ClutchMetrics (`rfdetr_5class`) | RF-DETR Nano afinado | balon, numero, jugador, arbitro, aro | 384 px | Apache-2.0 | Hugging Face |
| Detectores genericos COCO (p. ej. RF-DETR preentrenado en COCO) | RF-DETR | 80 clases COCO | variable | Apache-2.0 | Hugging Face / Roboflow |

La comparativa con detectores genericos es cualitativa: el modelo base de partida obtiene AP50 de balon de 0,301 en el test FIBA propio, frente a 0,693 del afinado, lo que indica que los detectores genericos rinden peor sobre el balon en footage de baloncesto. No hay datos publicados de latencia ni de mAP que permitan una comparacion cuantitativa mas amplia.

## Limitaciones y advertencias

- Entrenado mayoritariamente con footage de retransmision (NBA, universitario, FIBA); las grabaciones con movil desde la grada estan menos probadas y pueden degradar la deteccion.
- Dos de los tres datasets publicos de entrenamiento no declaran licencia en sus paginas; el autor recomienda verificarlas antes de un uso comercial, pese a que los pesos se distribuyan como Apache-2.0.
- El footage FIBA usado para los fotogramas propios pertenece a su emisora y no se redistribuye en el repositorio.
- `rfdetr_5class` es mas debil que `v2` en la deteccion del balon y su historial de entrenamiento no esta documentado, lo que limita la reproducibilidad.
- No hay informacion sobre sesgos demograficos, de iluminacion o de sesgo de camara; al entrenar con footage profesional, es esperable un sesgo hacia ese tipo de plano y de iluminacion.
- Riesgo de falsos positivos y de perdida de balon en oclusiones o planos cerrados, no cuantificado en la model card.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento; cualquier funcionalidad de ese tipo depende de componentes externos (Qwen3-VL-2B para los dorsales).
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad; conviene tratarlo como un proyecto academico en fase temprana.

## Enlaces

- Hugging Face: https://huggingface.co/raghav1210gupta/clutchmetrics-models
- Repositorio GitHub del proyecto: https://github.com/raghav1210gupta/ClutchMetrics
- Script de entrenamiento: https://github.com/raghav1210gupta/ClutchMetrics/blob/main/model/train_rfdetr.py
- Pipeline de inferencia: https://github.com/raghav1210gupta/ClutchMetrics/blob/main/model/basketball_pipeline.py
- Demo: https://praveenregar30.github.io/ClutchMetrics-2/
- Modelo base: https://huggingface.co/koppolusameer/rfdetr-basketball-player-ball-referee-detection
