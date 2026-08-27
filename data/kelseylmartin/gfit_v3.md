# kelseylmartin/GFIT_v3

## Resumen

GFIT v3 es un pipeline de detección y seguimiento de objetos (tracking) diseñado específicamente para el estudio de bancos de peces en arrecifes mediante cámaras bentónicas estacionarias. Desarrollado por kelseylmartin, el sistema fusiona dos detectores visuales de alta resolución —`sefsc_rgb_1728_groups` y un detector de movimiento— y utiliza el algoritmo ByteTrack para el seguimiento cinemático, en lugar de métodos basados en apariencia como Re-ID. El modelo está orientado a la biología marina y su objetivo principal es mantener la identidad de los peces durante oclusiones (por ejemplo, cuando pasan detrás de las barras estructurales de la cámara) y estabilizar la clasificación de especies a lo largo de la trayectoria mediante un mecanismo de promediado ponderado por confianza.

La relevancia de GFIT v3 radica en su enfoque híbrido: combina detección de objetos con seguimiento cinemático, lo que le permite superar a los métodos tradicionales de Re-ID en escenarios de alta densidad y oclusiones frecuentes. Según la model card, el pipeline alcanza una AP@50 de 0.6659 en detección fusionada, un mAP@50 de 0.474 en clasificación de grupos y un HOTA de 0.5215 en seguimiento, con una cobertura de pistas del 78.6%. El modelo se publicó en agosto de 2026 y está disponible en HuggingFace, aunque la licencia no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline fusionado: detector `sefsc_rgb_1728_groups` + detector de movimiento + ByteTrack para tracking |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de especies en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

GFIT v3 no es un modelo único sino un pipeline compuesto por dos detectores independientes que se fusionan a nivel de inferencia. El detector principal `sefsc_rgb_1728_groups` opera sobre imágenes RGB de alta resolución (1728 píxeles) y está entrenado para detectar grupos de peces y clasificar especies. El segundo detector, denominado `motion`, se basa en información de movimiento entre frames consecutivos. La fusión de ambos detectores se realiza a nivel de caja delimitadora, superando al mejor detector individual en AP@50 (0.6659 frente a 0.6380).

Para el seguimiento, se emplea ByteTrack, un algoritmo de tracking por asociación de cajas basado en movimiento, que no utiliza características de apariencia. El pipeline incorpora un mecanismo de "track averaging" que promedia las predicciones de clasificación de especies a lo largo de la vida de cada pista, ponderando por confianza y descartando clasificaciones desconocidas. Este promediado es el factor que más mejora el rendimiento, incrementando el mAP@50 de grupo en +0.038 respecto al mejor método a nivel de detección.

El entrenamiento se evaluó sobre el conjunto de test SEFSC, compuesto por 121 secuencias, de las cuales 13 se usaron específicamente para clasificación de grupos y especies. El split es a nivel de clip, no de despliegue, lo que implica que 50 de los 97 clips de test son segmentos hermanos de grabaciones cuyos otros segmentos aparecen en el entrenamiento. Esto puede inflar ligeramente las métricas.

## Capacidades

- Detección de objetos en imágenes subacuáticas, específicamente peces en bancos densos.
- Seguimiento de múltiples objetos a lo largo del tiempo mediante ByteTrack, manteniendo identidades durante oclusiones.
- Clasificación de especies de peces a nivel de grupo, con un mecanismo de promediado temporal que estabiliza las predicciones.
- Fusión de detectores RGB y de movimiento para mejorar la robustez en condiciones de baja visibilidad o contraste.
- Optimizado para cámaras bentónicas estacionarias, donde el fondo es fijo y los peces se mueven en primer plano.
- No soporta tool calling, generación de texto ni razonamiento multimodal; es un pipeline puramente de visión.

## Casos de uso

- Monitoreo de biodiversidad marina: GFIT v3 puede desplegarse en arrays de cámaras bentónicas para censar poblaciones de peces en arrecifes, proporcionando conteos automáticos y clasificación de especies sin intervención humana.
- Estudios de comportamiento animal: el seguimiento cinemático permite analizar trayectorias individuales de peces, velocidad, dirección y patrones de agregación, útil para investigaciones etológicas.
- Evaluación de impacto ambiental: comparar la abundancia y diversidad de peces antes y después de intervenciones humanas (vertidos, construcción costera) mediante análisis de vídeo de larga duración.
- Gestión pesquera: estimar biomasa y densidad de especies comerciales en áreas protegidas, ayudando a establecer cuotas de captura sostenibles.
- Vigilancia de arrecifes de coral: detectar cambios en la composición de especies a lo largo del tiempo, sirviendo como indicador de salud del ecosistema.
- Automatización de anotación de vídeo: el pipeline puede pre-anotar grandes volúmenes de vídeo subacuático, reduciendo el esfuerzo manual de los biólogos marinos.

## Benchmarks y rendimiento

Los resultados presentados en la model card se basan en el conjunto de test SEFSC. No se proporcionan comparaciones con otros modelos en la información disponible, pero se incluyen las métricas clave del pipeline:

| Metrica | Valor |
|---|---|
| AP@50 (detección fusionada) | 0.6659 |
| AP@50 (mejor detector individual) | 0.6380 |
| mAP@50 grupo (con track averaging) | 0.474 |
| mAP@50 grupo (mejor detección sin averaging) | 0.436 (inferido: 0.474 - 0.038) |
| mAP@50 especie (con prior de grupo 0.65) | 0.320 |
| mAP@50 especie (baseline v2.5) | 0.241 |
| HOTA (configuración hi.30, confianza 0.42) | 0.5215 |
| track_pd (cobertura de pistas) | 0.786 |

Nota: el valor de 0.436 para mAP@50 grupo sin averaging se deduce de la diferencia indicada (+0.038), pero no se confirma explícitamente en la model card. Se recomienda tratarlo como estimación.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la model card. Dado que el pipeline utiliza dos detectores de alta resolución (1728 píxeles) y ByteTrack, se espera que requiera una GPU con al menos 8-12 GB de VRAM para inferencia en tiempo real, aunque no se confirma. Las opciones de despliegue típicas para este tipo de pipelines incluyen:

- GPU NVIDIA (RTX 3060 o superior) para inferencia en lote.
- Despliegue en servidores con GPUs A100 o V100 para procesamiento de vídeo de larga duración.
- Posibilidad de integrar con frameworks de inferencia como TensorRT o ONNX Runtime para optimización.
- No se menciona soporte para CPU-only ni para plataformas edge.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la model card ni en los resultados de búsqueda. El pipeline es altamente especializado en biología marina, y no se han encontrado alternativas públicas con las mismas características (fusión de detectores + ByteTrack para peces). Se indica "no disponible" por falta de datos contrastados.

## Limitaciones y advertencias

- El split de datos es a nivel de clip, no de despliegue, lo que puede inflar las métricas: 50 de los 97 clips de test son segmentos hermanos de grabaciones presentes en el entrenamiento. Esto puede sobreestimar la generalización a nuevos despliegues.
- La licencia no está especificada, por lo que el uso comercial o la redistribución requieren contactar con el autor para aclarar los términos.
- El modelo está entrenado específicamente para cámaras bentónicas estacionarias; su rendimiento en otros entornos (cámaras móviles, aguas turbias, diferentes profundidades) no está garantizado.
- La clasificación de especies tiene un mAP@50 de 0.320, lo que indica que aún hay margen de error significativo en la identificación de especies individuales.
- El mecanismo de track averaging requiere un mínimo de 3 estados (`required_states = 3`), lo que puede retrasar la clasificación de pistas cortas o intermitentes.
- No se proporcionan datos sobre sesgos demográficos o geográficos; el conjunto SEFSC proviene probablemente del sureste de Estados Unidos, lo que limita la transferibilidad a otras regiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kelseylmartin/GFIT_v3
- Perfil de GitHub del autor: https://github.com/kelseylmartin
- Organización Gfit-Ai en GitHub: https://github.com/Gfit-Ai (sin repositorios públicos relevantes)
