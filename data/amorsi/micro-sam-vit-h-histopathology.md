# amorsi/micro-sam-vit-h-histopathology

## Resumen

`micro-sam vit_h_histopathology` es un checkpoint de segmentación de imágenes entrenado específicamente para imágenes de histopatología, distribuido como espejo (mirror) del repositorio oficial del proyecto micro-sam, desarrollado por el grupo Computational Cell Analytics. El modelo se apoya en la arquitectura Segment Anything (SAM) en su variante ViT-H (Vision Transformer Huge), adaptada al dominio microscópico mediante fine-tuning sobre datos histopatológicos.

El problema que resuelve es la segmentación automática de estructuras en imágenes de tejidos teñidos (núcleos, células, regiones tisulares), una tarea crítica en patología digital y análisis de imágenes biomédicas donde los modelos SAM genéricos rinden por debajo de lo esperado por el dominio tan específico. micro-sam proporciona un ecosistema de checkpoints especializados por dominio (microscopía de luz, electrónica, histopatología) que se integran en un mismo pipeline de segmentación interactiva y automática.

Este repositorio concreto es un espejo no modificado del checkpoint original: los hashes xxh128 coinciden con el registro de `util.py` del repositorio de micro-sam. Es relevante para investigadores que necesiten reproducibilidad en pipelines de segmentación histopatológica sin depender de la infraestructura de descarga original (ownCloud de la Universidad de Gotinga). El tamaño del repo es de 2,6 GB, coherente con un ViT-H más su decodificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything (SAM) con encoder ViT-H (Vision Transformer Huge) |
| Parametros totales | no disponible (ViT-H de SAM ronda los 630M en el encoder; el dato exacto no se especifica en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | no disponible (el código de micro-sam es MIT; la licencia de los pesos debe consultarse en la fuente original) |
| Formato de pesos | PyTorch (`model.pt` y `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Segment Anything (SAM): un encoder de imagen basado en Vision Transformer en variante Huge (ViT-H) que genera embeddings de la imagen, y un decodificador de máscaras ligero que, a partir de prompts (puntos, cajas o máscaras), produce segmentaciones. La variante `vit_h_histopathology` corresponde a un fine-tuning del checkpoint SAM original sobre datos de histopatología, dentro del conjunto de checkpoints especializados que micro-sam publica para distintos dominios de microscopía.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset histopatológico, ni si se emplearon técnicas de aumento de datos o ajuste fino congelando partes del encoder. Tampoco se documentan innovaciones técnicas adicionales más allá de la adaptación por dominio del SAM base. El modelo se usa en micro-sam invocándolo con `model_type="vit_h_histopathology"`.

## Capacidades

- Segmentación de imágenes de histopatología mediante prompts (puntos positivos/negativos, cajas delimitadoras y máscaras de entrada).
- Segmentación automática (automatic mask generation) sobre imágenes de tejidos teñidos.
- Segmentación interactiva con refinamiento iterativo a partir de correcciones del usuario.
- Integración con el ecosistema micro-sam: `SamPredictor`, `SamAutomaticMaskGenerator` y utilidades de anotación.
- Adaptado al dominio histopatológico, lo que se traduce en mejor separación de estructuras tisulares que el SAM genérico.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- **Análisis de biopsias digitalizadas**: segmentar núcleos y regiones tisulares en imágenes de portaobjetos teñidos con H&E para cuantificar densidad celular y morfología, aprovechando el fine-tuning específico de histopatología.
- **Conteo y morfometría celular**: usar el generador automático de máscaras para obtener instancias de núcleos y calcular áreas, perímetros y relaciones núcleo-citoplasma en estudios de investigación.
- **Anotación asistida para patólogos**: emplear la segmentación interactiva con prompts de puntos para acelerar el etiquetado manual en la creación de datasets de entrenamiento supervisado.
- **Control de calidad de imágenes de microscopía**: detectar artefactos, burbujas o regiones mal enfocadas mediante segmentación de regiones anómalas en lotes de portaobjetos.
- **Investigación en patología computacional**: generar máscaras de referencia para comparar pipelines de segmentación o para preprocesar imágenes antes de clasificadores de tejido.
- **Reproducibilidad de experimentos**: al ser un espejo con hashes verificados, permite replicar resultados publicados con micro-sam en entornos sin acceso al ownCloud original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa 2,6 GB en disco; con el encoder ViT-H y el decodificador en FP32 se estima un consumo de VRAM en torno a 4-6 GB, aunque el dato exacto no se especifica en la información disponible.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para procesamiento por lotes a alta resolución; RTX 3090/4080 también suficientes para inferencia interactiva.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM (RTX 3070/4060 Ti en adelante), aunque para imágenes de gran tamaño puede requerir parcheado.
- Opciones de despliegue: el modelo se usa a través de la librería `micro-sam` (Python, PyTorch); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (son runtimes de LLM, no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dominio | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam vit_h_histopathology | SAM ViT-H | Histopatología | no disponible | no disponible (código MIT) | HuggingFace (espejo) |
| SAM original (vit_h) | SAM ViT-H | Imágenes naturales | ~630M (encoder) | Apache 2.0 | Meta / HuggingFace |
| micro-sam vit_b (microscopía) | SAM ViT-B | Microscopía general | no disponible | código MIT | HuggingFace / ownCloud |
| Cellpose | U-Net adaptada | Células y núcleos | no disponible | BSD-3 | GitHub |

## Limitaciones y advertencias

- **Licencia de pesos ambigua**: el código de micro-sam es MIT, pero la model card indica explícitamente que la licencia de los pesos debe consultarse en la fuente original; no se garantiza uso comercial sin verificación previa.
- **Espejo no oficial**: el repositorio es una copia de un checkpoint ajeno; no hay soporte del autor original ni garantía de actualización.
- **Dominio restringido**: el modelo está especializado en histopatología; su rendimiento en otros tipos de microscopía (electrónica, fluorescencia) puede degradarse.
- **Riesgo de segmentación errónea**: como todo modelo de segmentación, puede producir máscaras incorrectas en tejidos con tinciones atípicas, artefactos o baja resolución; no debe usarse como único criterio en diagnóstico clínico.
- **Sin datos de benchmarks**: no hay métricas publicadas en este repositorio que permitan comparar su rendimiento cuantitativamente.
- **Sin soporte de cuantización documentado**: el despliegue eficiente en hardware limitado no está documentado.
- **No apto para uso clínico directo**: es una herramienta de investigación; cualquier aplicación diagnóstica requiere validación regulatoria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amorsi/micro-sam-vit-h-histopathology
- Repositorio oficial micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de checkpoints (`util.py`): https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos `model.pt` (original): https://owncloud.gwdg.de/index.php/s/L7AcvVz7DoWJ2RZ/download
- Pesos `decoder.pt` (original): https://owncloud.gwdg.de/index.php/s/1qAKxy5H0jgwZvM/download
