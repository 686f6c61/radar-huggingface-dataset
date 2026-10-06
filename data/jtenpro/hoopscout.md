# JtenPro/hoopscout

## Resumen

HoopScout es un sistema de análisis de vídeo de partidos de baloncesto centrado en una jugadora concreta, publicado por el usuario JtenPro en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje ni de un modelo de pesos entrenado por el autor: el repositorio contiene un pipeline de visión por computador que detecta y sigue a jugadoras y balón, reidentifica a la jugadora objetivo a partir de imágenes de referencia, propone momentos candidatos y genera clips y un informe de resumen en hebreo.

El problema que resuelve es el de la revisión manual de metraje: en lugar de visionar un partido completo para extraer las acciones de una jugadora, el sistema produce una lista priorizada de momentos (posesión cerca de la jugadora, intentos de tiro con balón ascendente) que una persona etiqueta con categorías como basket, assist, rebound, turnover, foul o irrelevant. A partir de esas etiquetas se cortan los clips definitivos y se compone el informe.

Es relevante ahora porque combina modelos abiertos consolidados (YOLO de ultralytics, OSNet de torchreid, easyocr) en un flujo con intervención humana explícita, pensado para ojeadores y cuerpos técnicos. La versión publicada es la 0.1, sin descargas ni validación comunitaria, y su propia model card advierte de que el etiquetado automático es heurístico y que el Re-ID ofrece sugerencias, no certezas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de visión por computador: detección y seguimiento con YOLO (ultralytics) + BoT-SORT, reidentificación con OSNet x1.0 (torchreid, embeddings de 512 dimensiones y similitud coseno), OCR opcional de dorsal con easyocr, heurísticas temporales para proponer momentos y corte de vídeo con ffmpeg |
| Parametros totales | no disponible (no se publican recuentos de parámetros de los modelos utilizados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se define ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles en los metadatos del repositorio; el informe de resumen se genera en hebreo |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos de OSNet se descargan automáticamente desde el repositorio kaiyangzhou/osnet y el modelo YOLO se descarga según el parámetro `--model`) |
| Tipo de artefacto | Repositorio de código y pipeline, no un checkpoint de modelo |
| Entorno requerido | Python >= 3.10 y ffmpeg en el PATH |
| Interfaz | CLI (`run_pipeline.py`) y interfaz Gradio (`python -m hoopscout.app`) |
| Modelo YOLO por defecto | `yolo26s.pt` (alternativa ligera: `yolo11n.pt`) |
| Dispositivo de ejecución | cuda o cpu (`--device`) |

## Arquitectura y entrenamiento

El sistema no entrena ningún modelo propio. Se compone de cinco etapas encadenadas. La primera realiza detección y seguimiento de jugadoras y balón en cada fotograma con YOLO de ultralytics y el tracker BoT-SORT, con compensación de cámara en movimiento. La segunda aplica reidentificación: los tracklets se comparan con una galería de recortes de la jugadora objetivo mediante embeddings OSNet x1.0 (512 dimensiones, similitud coseno). Como apoyo opcional, la etapa 2b ejecuta OCR sobre los dorsales con easyocr, votando a lo largo de cada tracklet cuando el número resulta legible.

La tercera etapa propone momentos candidatos mediante heurísticas sobre el eje temporal: posesión del balón cerca de la jugadora y detección de intentos de tiro a partir de un balón que sube. La cuarta etapa es de aprobación humana, con etiquetado en la interfaz Gradio o mediante un archivo `labels.json`. La quinta genera los productos finales: un clip por acción aprobada y un informe de resumen en hebreo, ambos con ffmpeg.

La decisión de diseño documentada es el uso de identificación híbrida: dado que una cámara desde la grada no siempre muestra dorsales o rostros legibles, el criterio principal es la similitud visual con las imágenes de referencia de la jugadora, y el número de camiseta actúa solo como pista auxiliar cuando es legible. No se documentan datos de entrenamiento, número de tokens, composición de dataset ni fases de RLHF o DPO, ya que no se entrena un modelo nuevo.

## Capacidades

- Detección y seguimiento multiobjeto de jugadoras y balón fotograma a fotograma, con tracker BoT-SORT y compensación de cámara en movimiento.
- Reidentificación de una jugadora objetivo a partir de una o varias imágenes de referencia (`--ref`), usando embeddings de 512 dimensiones y similitud coseno.
- OCR opcional de números de camiseta con easyocr, con votación agregada por tracklet.
- Propuesta heurística de momentos candidatos: posesión del balón próxima a la jugadora y detección de intentos de tiro por trayectoria ascendente del balón.
- Etiquetado humano en bucle con seis categorías válidas: basket, assist, rebound, turnover, foul e irrelevant.
- Generación de clips por acción aprobada (`run1/clips/*.mp4`) y de un informe de resumen en hebreo (`run1/report.md`).
- Exportación de artefactos de diagnóstico: `labels.json` y `tracklet_ranking.json` para auditar la calidad del Re-ID.
- Interfaz CLI y aplicación Gradio con dos pestañas: análisis (vídeo más imágenes de referencia) y etiquetado en tabla editable.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling ni capacidades de agente: no es un modelo de lenguaje.

## Casos de uso

- Scouting de una jugadora concreta: se introducen varias imágenes de referencia y el vídeo del partido, y el sistema devuelve los momentos candidatos ordenados por similitud, lo que permite construir un dossier de acciones sin visionar los 40 minutos completos.
- Análisis post-partido para cuerpo técnico: tras etiquetar los momentos propuestos, se generan clips separados por tipo de acción (canasta, asistencia, rebote) útiles para sesiones de vídeo con la jugadora.
- Elaboración de reels para representantes y agentes: los clips aprobados por acción se pueden concatenar para presentar el perfil de la jugadora a clubes o universidades, ya que cada clip queda aislado y etiquetado.
- Evaluación en academias y canteras: el pipeline permite seguir a una misma jugadora a lo largo de varios partidos usando las mismas imágenes de referencia, con revisión del `tracklet_ranking.json` para validar la identidad.
- Etiquetado asistido para construir datasets deportivos: la interfaz Gradio actúa como herramienta de anotación con propuesta previa, con lo que se reduce el tiempo de marcado manual de acciones.
- Producción de contenido para medios o canales de baloncesto femenino: el corte automático con ffmpeg más la aprobación humana permiten publicar clips por acción con un control de calidad mínimo.
- Auditoría técnica de un pipeline de Re-ID: el propio sistema sirve como banco de pruebas para comparar configuraciones de OSNet, umbrales de similitud y heurísticas de propuesta de eventos sobre metraje real de pabellón.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, mAP ni comparaciones cuantitativas con otros sistemas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- Entorno mínimo declarado: Python >= 3.10 y ffmpeg disponible en el PATH.
- El pipeline admite ejecución en `--device cuda` o `--device cpu`; no se publican cifras de VRAM, latencia ni throughput.
- No hay estimaciones oficiales de VRAM para inferencia, ni listas de GPU recomendadas (A100, H100, RTX 4090 u otras) en la información proporcionada.
- El modelo YOLO por defecto es `yolo26s.pt`, con la alternativa ligera `yolo11n.pt` para entornos con menos recursos, según la propia model card.
- Los pesos de OSNet se descargan automáticamente en la primera ejecución desde kaiyangzhou/osnet; el modelo YOLO también se descarga automáticamente.
- Opciones de despliegue documentadas: ejecución local por CLI (`run_pipeline.py analyze` y `run_pipeline.py finalize`) e interfaz Gradio (`python -m hoopscout.app`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- El despliegue como HF Space se menciona como idea de fase 2 del proyecto y aún no está implementado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros sistemas de análisis de vídeo deportivo ni métricas objetivas frente a alternativas. La model card menciona como líneas de trabajo futuro, no como comparativas, el uso de PARSeq calibrado para OCR de dorsales (proyecto mkoshkina/jersey-number-pipeline) y la sustitución de las heurísticas por un modelo de detección de acciones basado en BARD/E-BARD.

## Limitaciones y advertencias

- Las propuestas automáticas de momentos son heurísticas: las faltas y las pérdidas no se detectan directamente, sino que se marcan a mano mientras se revisan los momentos de posesión propuestos.
- El Re-ID proporciona una sugerencia, no una certeza. La model card recomienda revisar `tracklet_ranking.json`; la coincidencia falla en sustituciones, en situaciones de contraluz o bloqueo y ante jugadoras físicamente similares del mismo equipo.
- El vídeo de baja calidad y los ángulos extremos degradan la precisión de todas las etapas del pipeline.
- El pipeline es la versión 0.1 y el propio autor advierte de que las versiones de las dependencias de `requirements.txt` se comprobaron contra las API actuales de ultralytics y torchreid, pero no se ejecutaron todavía en un entorno real.
- El informe de resumen se genera en hebreo, lo que puede requerir postprocesado para equipos que trabajen en otros idiomas.
- Los metadatos del repositorio no declaran idiomas soportados ni etiqueta de pipeline, y no hay descargas ni interacciones registradas, por lo que no existe validación comunitaria.
- La licencia del repositorio es Apache 2.0, que permite uso comercial del código publicado, pero la model card no detalla las licencias de las dependencias de terceros (ultralytics, torchreid, easyocr), un punto a verificar antes de un despliegue en producción.
- No se documentan sesgos concretos, tasas de alucinación ni límites de contexto, ya que no es un modelo generativo de lenguaje.
- El sistema no es autónomo de extremo a extremo: requiere intervención humana obligatoria en la fase de etiquetado para producir los clips y el informe final.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JtenPro/hoopscout
- Pesos de OSNet referenciados por el pipeline: https://huggingface.co/kaiyangzhou/osnet
- Proyecto de OCR de dorsales citado como mejora futura: https://huggingface.co/mkoshkina/jersey-number-pipeline
- Ultralytics (YOLO), dependencia de detección: https://github.com/ultralytics/ultralytics
- torchreid, dependencia de reidentificación: https://github.com/KaiyangZhou/deep-person-reid
- easyocr, dependencia de OCR opcional: https://github.com/JaidedAI/EasyOCR
- Gradio, framework de la interfaz: https://github.com/gradio-app/gradio
