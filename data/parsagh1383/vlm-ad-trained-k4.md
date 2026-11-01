# Parsagh1383/vlm-ad-trained-k4

## Resumen

`Parsagh1383/vlm-ad-trained-k4` no es un modelo único, sino un repositorio de checkpoints reentrenados de seis detectores de anomalías industriales basados en CLIP. El autor (Parsagh1383) los generó ejecutando el código oficial y los ajustes por defecto de cada uno de los seis métodos originales, con el objetivo de estudiar su robustez frente a perturbaciones adversarias universales y permitir la reproducción de los resultados en condiciones limpias sin necesidad de reentrenar. El repositorio ocupa 11,1 GB y agrupa los pesos en seis carpetas: `promptad/`, `rempad/`, `iipad/`, `inctrl/`, `moeclip/` y `mrad_ft/`.

Los métodos incluidos cubren tanto el régimen few-shot (k = 4 imágenes normales de referencia por clase) como el zero-shot o cross-dataset. PromptAD (CVPR 2024), ReMP-AD (ICCV 2025), IIPAD (ACM MM 2025) e InCTRL (CVPR 2024) se entrenan en few-shot; MoECLIP (CVPR 2026) y MRAD-FT (ICLR 2026) operan en zero-shot. Todos se evalúan sobre los dos benchmarks de referencia en detección de anomalías industriales: MVTec AD y VisA.

La relevancia del repositorio es fundamentalmente metodológica: proporciona pesos que reproducen los números publicados con desviaciones pequeñas (salvo una excepción notable en MRAD-FT sobre VisA) y sirve como base para investigación en robustez adversaria de detectores CLIP. No está pensado como un modelo listo para producción ni como un servicio de inferencia, sino como material de reproducción científica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores de anomalías basados en CLIP (seis métodos distintos: PromptAD, ReMP-AD, IIPAD, InCTRL, MoECLIP, MRAD-FT); arquitectura interna de cada checkpoint no detallada en la información disponible |
| Parametros totales | No disponible (depende del backbone CLIP de cada método; no se especifica) |
| Parametros activos | No disponible (MoECLIP emplea mezcla de expertos según su nombre, pero no se detalla el recuento) |
| Longitud de contexto | No aplica (modelos de visión para detección de anomalías, no modelos de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelos de visión; no se declaran idiomas) |
| Licencia | `other` / `per-model-upstream-licenses`: cada carpeta hereda la licencia de su repositorio upstream y de los datasets; MVTec AD es CC BY-NC-SA 4.0, lo que restringe el uso comercial |
| Formato de pesos | Formato nativo del script de entrenamiento de cada repositorio oficial (no se especifica safetensors, GGUF ni otro formato concreto) |

## Arquitectura y entrenamiento

Los seis checkpoints comparten la base conceptual de CLIP: un codificador de imagen y otro de texto preentrenados que permiten comparar representaciones visuales con descripciones textuales de "normalidad" o "anomalía". Cada método introduce su propia variante sobre esta base: PromptAD trabaja con prompts aprendibles, ReMP-AD y MRAD-FT incorporan mecanismos de reconstrucción o adaptación, IIPAD se asocia a los autores de AF-CLIP, InCTRL emplea control/integración de representaciones, y MoECLIP utiliza una arquitectura de mezcla de expertos. La información disponible no detalla la arquitectura interna de cada checkpoint.

El protocolo de entrenamiento es explícito en la model card. En few-shot (k = 4) se entrena y evalúa por dataset con 4 imágenes normales de referencia por clase, con una sola semilla por modelo (los papers originales promedian entre 3 y 5 semillas). En zero-shot o cross-dataset se entrena en un dataset y se prueba en el otro (MVTec AD → VisA y VisA → MVTec AD), y el nombre de la carpeta indica la dirección (`train_on_<dataset>`, `trained_on_<dataset>`, `test_on_<dataset>`). Para InCTRL, el checkpoint `trained_on_mvtecad/` es propio del autor y se usó para evaluar VisA; el resultado sobre MVTec AD emplea el checkpoint publicado por los autores entrenado en VisA, que no se realoja en este repositorio. No se documentan detalles sobre volumen de datos de entrenamiento, composición del dataset más allá de MVTec AD y VisA, ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Detección de anomalías industriales en imágenes, tanto en régimen few-shot (k = 4) como zero-shot y cross-dataset.
- Localización de anomalías a nivel de píxel: la model card reporta métricas de pixel AUROC y AUPRO además de imagen AUROC y AP.
- Clasificación binaria normal/anómalo por imagen y por clase, con evaluación sobre MVTec AD y VisA.
- Adaptación a nuevos objetos o categorías con muy pocas imágenes normales de referencia (4 por clase).
- Transferencia entre dominios de inspección (MVTec AD ↔ VisA) mediante los checkpoints cross-dataset.
- Base para investigación en robustez frente a perturbaciones adversarias universales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni modo "thinking".

## Casos de uso

- Reproducción de resultados científicos: descargar los checkpoints y ejecutar el código oficial de cada método para verificar los números publicados en MVTec AD y VisA sin reentrenar, usando `clean_vs_papers_k4.csv` como referencia.
- Estudio de robustez adversaria: emplear los pesos como punto de partida para evaluar cómo se degradan los detectores CLIP ante perturbaciones universales, que es el propósito declarado del autor.
- Comparación controlada de métodos de detección de anomalías: al haber sido entrenados todos con código y ajustes oficiales bajo el mismo protocolo k = 4, permiten comparar PromptAD, ReMP-AD, IIPAD, InCTRL, MoECLIP y MRAD-FT en igualdad de condiciones.
- Prototipado de inspección visual few-shot en entornos de investigación: usar un checkpoint few-shot con 4 imágenes normales por clase para evaluar la viabilidad de un pipeline de control de calidad antes de invertir en un sistema propio.
- Evaluación de transferencia entre dominios: utilizar los checkpoints cross-dataset (MVTec AD → VisA y viceversa) para medir la generalización de un detector a una línea de producción distinta de la de entrenamiento.
- Docencia y formación: servir de material práctico para cursos de visión por computador o de detección de anomalías, ya que los pesos están listos para cargarse con los repositorios oficiales.
- Benchmarking interno de infraestructura: medir tiempos de carga e inferencia de detectores CLIP sobre GPUs propias antes de decidir una arquitectura de despliegue.

## Benchmarks y rendimiento

La model card proporciona resultados de imagen AUROC comparando la ejecución propia del autor con los valores publicados. Se reproduce a continuación tal cual:

| Modelo | MVTec AD propio / paper | VisA propio / paper |
|---|---|---|
| PromptAD | 95,9 / 96,6 | 89,2 / 89,1 |
| ReMP-AD | 96,9 / 96,8 | 94,5 / 94,1 |
| IIPAD | 96,3 / 96,1 | 86,0 / 88,3 (minor) |
| InCTRL | 94,9 / 94,5 (checkpoint de los autores) | 90,1 / 87,7 (minor) |
| MoECLIP | 93,4 / 93,9 | 82,7 / 83,6 |
| MRAD-FT | 93,1 / 92,3 | 80,5 / 85,5 (MAJOR) |

El criterio de desviación es: "ok" si está dentro de 1,5 puntos, "minor" si está dentro de 3 y "MAJOR" si supera 3 puntos. Otras discrepancias señaladas: PromptAD en VisA AUPRO 82,9 frente a 86,2; MRAD-FT en MVTec AD AUPRO 81,5 frente a 85,4 y en VisA image AP 84,3 frente a 87,8. La tabla completa con AP, F1, pixel AUROC y AUPRO está en `clean_vs_papers_k4.csv` dentro del repositorio. No se han publicado en la información disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 11,1 GB, pero cada checkpoint individual es una fracción de ese tamaño; el consumo real depende del backbone CLIP de cada método y del tamaño de lote.
- GPU recomendadas: no especificadas en la información disponible. Por tratarse de detectores basados en CLIP, es razonable esperar que funcionen en GPUs de gama media, pero el autor no publica requisitos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la model card indica que cada checkpoint debe cargarse con el repositorio oficial del método correspondiente, en el formato que genera su propio script de entrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa natural es entre los propios métodos incluidos en el repositorio, ya que comparten protocolo de entrenamiento y benchmarks:

| Modelo | Régimen | MVTec AD (AUROC img.) | VisA (AUROC img.) | Licencia |
|---|---|---|---|---|
| PromptAD | Few-shot, k = 4 | 95,9 | 89,2 | Upstream + MVTec AD CC BY-NC-SA 4.0 |
| ReMP-AD | Few-shot, k = 4 | 96,9 | 94,5 | Upstream + MVTec AD CC BY-NC-SA 4.0 |
| IIPAD | Few-shot, k = 4 | 96,3 | 86,0 | Upstream + MVTec AD CC BY-NC-SA 4.0 |
| InCTRL | Few-shot, k = 4 | 94,9 | 90,1 | Upstream + MVTec AD CC BY-NC-SA 4.0 |
| MoECLIP | Zero-shot | 93,4 | 82,7 | Upstream + MVTec AD CC BY-NC-SA 4.0 |
| MRAD-FT | Zero-shot | 93,1 | 80,5 | Upstream + MVTec AD CC BY-NC-SA 4.0 |

ReMP-AD obtiene los mejores resultados en ambos datasets en esta ejecución. No se dispone de información sobre modelos comparables externos a este repositorio (otros detectores CLIP no incluidos) en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva para uso comercial: MVTec AD es CC BY-NC-SA 4.0, y cada carpeta hereda además la licencia de su repositorio upstream; el uso comercial requiere revisar caso por caso.
- Una sola semilla por modelo: los papers originales promedian entre 3 y 5 semillas, por lo que los números pueden no ser directamente comparables con los publicados.
- Discrepancia mayor en MRAD-FT sobre VisA (80,5 frente a 85,5 en el paper), que el autor reconoce explícitamente; no debe usarse ese checkpoint como referencia fiable de ese resultado.
- No es un modelo de propósito general: no genera texto, no soporta tool calling ni agentes, y no debe tratarse como un VLM conversacional pese a la etiqueta "vlm" del identificador.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de falsos negativos y falsos positivos en la detección de anomalías, que en un contexto industrial puede tener consecuencias operativas.
- Sesgos conocidos: no documentados en la información disponible; los datasets MVTec AD y VisA cubren un conjunto limitado de categorías industriales, lo que restringe la generalización a otros dominios.
- Idiomas: no aplica; los prompts textuales de CLIP suelen estar en inglés y no se declara soporte multilingüe.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (26 de octubre de 2026): no hay evidencia de validación por parte de la comunidad.
- La model card contiene un comentario pendiente del autor (`<!-- add: your name, contact... -->`), lo que indica que la documentación está incompleta.
- Para InCTRL sobre MVTec AD es necesario descargar el checkpoint de los autores desde su repositorio original; no está incluido aquí.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Parsagh1383/vlm-ad-trained-k4
- PromptAD (CVPR 2024): paper no enlazado en la información disponible
- ReMP-AD (ICCV 2025): paper no enlazado en la información disponible
- IIPAD / AF-CLIP (ACM MM 2025): paper no enlazado en la información disponible
- InCTRL (CVPR 2024): repositorio oficial no enlazado en la información disponible (necesario para el checkpoint de MVTec AD)
- MoECLIP (CVPR 2026): paper no enlazado en la información disponible
- MRAD-FT / MRAD (ICLR 2026): paper no enlazado en la información disponible
- Dataset MVTec AD: no enlazado en la información disponible
- Dataset VisA: no enlazado en la información disponible
- Archivo `clean_vs_papers_k4.csv`: incluido en el repositorio, ruta no especificada más allá del nombre
