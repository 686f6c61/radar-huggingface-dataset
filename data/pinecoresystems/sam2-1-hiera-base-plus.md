# pinecoresystems/sam2.1-hiera-base-plus

## Resumen
SAM 2.1 (Segment Anything Model 2.1) en su variante Hiera Base+ es un modelo fundacional de segmentación visual promptable, desarrollado por FAIR (Meta AI) y publicado originalmente como `facebook/sam2.1-hiera-base-plus`. El repositorio analizado, `pinecoresystems/sam2.1-hiera-base-plus`, es una redistribución del mismo checkpoint bajo licencia Apache 2.0 con 0 descargas y 0 likes en el momento de la consulta. Resuelve la tarea de segmentación promptable en imágenes y vídeo: dado un estímulo (clic puntual, caja delimitadora o máscara previa), devuelve máscaras de objeto binarias, y en vídeo las propaga entre fotogramas manteniendo la identidad del objeto.

El modelo combina un codificador de imagen Hiera jerárquico con un banco de memoria y un mecanismo de atención sobre memoria que le permite el seguimiento temporal sin recalcular el codificador en cada fotograma. Con 80.850.690 parámetros (dato real extraído de los pesos en safetensors) y un repositorio de 0,3 GB, es un modelo compacto que cabe en GPU de consumo e incluso puede ejecutarse en CPU con latencias moderadas. No es un modelo de lenguaje: no genera texto ni procesa tokens, por lo que no tiene ventana de contexto lingüística ni capacidades de razonamiento simbólico.

Su relevancia radica en que es una versión afinada de SAM 2 con mejoras en objetos pequeños, oclusiones y segmentación multiobjeto, disponible a través de la librería `transformers` con una pipeline de `mask-generation` lista para usar. Esto lo convierte en una pieza habitual de preanotación de datasets, edición de imagen y vídeo, y preprocesado para otros sistemas de visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiera (transformer jerárquico) como codificador de imagen, más codificador de prompts (puntos, cajas, máscaras), banco de memoria, atención sobre memoria y decodificador de máscaras. Especializada en segmentación promptable, no generativa de texto |
| Parametros totales | 80.850.690 (≈80,85 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no procesa secuencias de texto. En vídeo, el estado se propaga fotograma a fotograma mediante el banco de memoria, sin una ventana de contexto medida en tokens |
| Tipos de cuantizacion | No disponible: no se documentan cuantizaciones específicas. Uso típico en float32 o bfloat16 |
| Idiomas soportados | No aplica: el modelo no procesa lenguaje natural y no incluye tokenizador de texto |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño de repositorio 0,3 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento
La arquitectura sigue el diseño de SAM 2: un codificador de imagen Hiera preentrenado y jerárquico que extrae representaciones multiescala; un codificador de prompts que convierte clics positivos o negativos, cajas y máscaras previas en embeddings; un decodificador de máscaras que produce varias propuestas de máscara puntuadas por calidad; y, para vídeo, un módulo de atención sobre memoria con un banco de memoria que almacena información de fotogramas anteriores y del propio objeto, lo que permite propagar máscaras (`propagate_in_video`) sin volver a ejecutar el codificador completo en cada fotograma. El mecanismo de memoria es la innovación clave respecto a SAM 1, que sólo operaba sobre imágenes estáticas.

Según el artículo de referencia (arXiv:2408.00714), SAM 2 se entrenó con un motor de datos que generó el conjunto SA-V, orientado a vídeo y con máscaras espacio-temporales (masklets), complementado con datos de imagen. La variante 2.1 incorpora mejoras de entrenamiento orientadas a objetos pequeños, manejo de oclusiones y segmentación de múltiples objetos de forma simultánea. Los detalles cuantitativos del dataset y las fases de entrenamiento (número exacto de tokens o muestras, fases de ajuste fino) no están recogidos en la información proporcionada y deben consultarse en el artículo. No se documenta en el repositorio ninguna fase de RLHF ni de DPO, algo que además no aplica a este tipo de modelo.

## Capacidades
- Segmentación promptable en imagen: acepta un clic puntual, varios puntos con etiqueta positiva o negativa, cajas delimitadoras `[x_min, y_min, x_max, y_max]` o máscaras previas, y devuelve máscaras binarias.
- Salida multimáscara: por defecto genera tres propuestas de máscara por prompt, ordenadas por puntuación de calidad, para desambiguar objetos ambiguos.
- Segmentación multiobjeto: permite definir varios objetos en la misma imagen y obtener una máscara independiente para cada uno.
- Generación automática de máscaras: la pipeline `mask-generation` segmenta todos los objetos de una imagen sin intervención manual, con el parámetro `points_per_batch` para controlar el muestreo.
- Segmentación y seguimiento en vídeo: `init_state`, `add_new_points_or_box` y `propagate_in_video` permiten añadir prompts en un fotograma y obtener masklets a lo largo de la secuencia.
- Inferencia por lotes: soporta procesar varias imágenes de forma simultánea para mejorar el rendimiento.
- Ejecución en GPU y CPU: funciona con `torch.autocast("cuda", dtype=torch.bfloat16)` o en CPU cuando no hay CUDA disponible.
- No dispone de tool calling, function calling, agentes, razonamiento multi-step, capacidades multilingües, visión descriptiva, audio ni modo de pensamiento. Su única salida son máscaras y puntuaciones asociadas.

## Casos de uso
- Preanotación de datasets de visión por computador: usar la pipeline de `mask-generation` para generar máscaras candidatas sobre un corpus de imágenes y que un equipo humano sólo revise y corrija, reduciendo el coste de etiquetado en tareas de detección y segmentación.
- Edición fotográfica y retoque: segmentar un objeto concreto mediante un clic o una caja para aislarlo, sustituir el fondo o aplicar ajustes locales sin selección manual en Photoshop, GIMP o pipelines propios.
- Rotoscopia y posproducción de vídeo: inicializar el objeto en un fotograma y propagar la máscara por toda la secuencia, sustituyendo buena parte del trabajo manual de recorte fotograma a fotograma en VFX y composición.
- Análisis deportivo y de tráfico: seguir jugadores, balones o vehículos con prompts por objeto, generando masklets que alimentan métricas de trayectoria y ocupación espacial.
- Preprocesado para inpainting y generación: producir máscaras precisas que se pasan a modelos de difusión para borrado de objetos o relleno de regiones.
- Robótica y manipulación: segmentar objetos señalados por un operador o por un detector para calcular máscaras que alimenten la planificación de agarre y la percepción del entorno.
- Herramientas de anotación interactivas: integrar el modelo en una interfaz web donde el usuario añade clics positivos y negativos para refinar la máscara en tiempo de interacción, aprovechando la salida multimáscara.
- Segmentación de imágenes aéreas o satelitales: aislar edificaciones, cultivos o masas de agua con cajas o puntos como prompts, siempre con revisión humana por la variabilidad de dominio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de métricas (J&F, IoU, MMLU, HumanEval u otras) y los resultados oficiales de SAM 2.1 deben consultarse en el artículo enlazado. No se presentan cifras estimadas ni inferidas para no inducir a error.

## Requisitos de hardware
- VRAM estimada para los pesos: en float32 unos 0,32 GB (80,85 M de parámetros × 4 bytes); en bfloat16 o float16 unos 0,16 GB. El repositorio de safetensors ocupa 0,3 GB.
- La VRAM total depende de la resolución de entrada: el ejemplo de la model card procesa imágenes de 1500×2250 píxeles y devuelve máscaras de esa resolución, con un consumo de activaciones notablemente superior al de los pesos.
- En vídeo, el consumo crece con el número de fotogramas procesados, porque el banco de memoria almacena características de fotogramas anteriores.
- Cabe sin problemas en GPU de consumo: cualquier GPU con 4 GB o más de VRAM es suficiente para imagen a resolución moderada; una RTX 3060, RTX 4060 o superior ofrece margen amplio. También es viable en GPU de gama antigua y en CPU, con latencias mayores.
- GPU de centro de datos (A100, H100, L40S) sólo tienen sentido para servir muchas peticiones en paralelo o procesar vídeo largo, no por requisitos de memoria del modelo.
- Opciones de despliegue: `transformers` con `Sam2Model` y `Sam2Processor`, pipeline `mask-generation`, la librería oficial `sam2` (`SAM2ImagePredictor`, `SAM2VideoPredictor`) y el endpoint de Hugging Face (el repositorio está marcado como `endpoints_compatible`). No aplica vLLM, TGI, llama.cpp ni Ollama, que están orientados a modelos de lenguaje y no soportan esta arquitectura.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pinecoresystems/sam2.1-hiera-base-plus (este modelo) | 80,85 M (dato real) | Segmentación promptable en imagen y vídeo | apache-2.0 | Hugging Face, vía `transformers` | Redistribución de un checkpoint de FAIR; 0 descargas y 0 likes en el momento de la consulta |
| facebook/sam2.1-hiera-base-plus | No disponible en la información proporcionada | Segmentación promptable en imagen y vídeo | apache-2.0 | Hugging Face | Repositorio original referenciado en la propia model card; es el origen del anterior |
| Otras variantes de SAM 2.1 (tiny, small, large) | No disponible en la información proporcionada | Segmentación promptable en imagen y vídeo | apache-2.0 | Hugging Face y repositorio oficial | Misma arquitectura con distinto tamaño de codificador; este repositorio corresponde al nivel Base+ |
| SAM 1 (2023, `facebook/segment-anything`) | No disponible en la información proporcionada | Segmentación promptable sólo en imagen | apache-2.0 | Hugging Face y repositorio oficial | No incluye memoria ni seguimiento temporal; SAM 2 lo supera en vídeo y en objetos pequeños |
| EfficientSAM y similares | No disponible en la información proporcionada | Segmentación de imagen con codificador destilado | No disponible | No disponible | Alternativas orientadas a eficiencia; no se dispone de datos verificados para comparar |

La información proporcionada no incluye cifras de parámetros, contexto ni rendimiento de los modelos alternativos, por lo que las celdas correspondientes se marcan como no disponibles en lugar de estimarse.

## Limitaciones y advertencias
- Origen y procedencia: el repositorio analizado es una redistribución realizada por el usuario `pinecoresystems`, con 0 descargas y 0 likes, y creado el 7 de octubre de 2026. Antes de usarlo en producción conviene verificar la integridad de los pesos frente al repositorio oficial `facebook/sam2.1-hiera-base-plus` y priorizar el original cuando sea posible.
- Sin semántica: el modelo no etiqueta ni clasifica lo que segmenta. Devuelve máscaras, no categorías; cualquier interpretación semántica requiere un modelo adicional.
- Ambigüedad de prompt: un clic sobre una región ambigua puede producir varias máscaras plausibles (por eso devuelve tres propuestas ordenadas por puntuación). Es responsabilidad del integrador elegir o refinar con puntos negativos.
- Deriva en vídeo: la propagación basada en memoria puede perder el objeto tras oclusiones largas, cambios de apariencia abruptos o salidas y reentradas en el encuadre. Se recomienda añadir prompts de corrección o reinicializar el estado.
- Dependencia de la resolución: imágenes de muy alta resolución o con objetos muy pequeños pueden degradar la calidad de la máscara; la variante 2.1 mejora este aspecto, pero no lo elimina.
- Riesgo en dominios especializados: en imagen médica, satelital o industrial, el rendimiento fuera de la distribución de entrenamiento puede caer de forma notable. Requiere validación específica y supervisión humana.
- Consumo de memoria en vídeo: el banco de memoria crece con la longitud de la secuencia, lo que puede agotar la VRAM en vídeos largos si no se gestiona por segmentos.
- Licencia: los pesos se distribuyen bajo Apache 2.0, permisiva para uso comercial. Conviene revisar igualmente las condiciones del repositorio original y de los datasets de entrenamiento si el uso previsto es comercial a gran escala.
- Idiomas y texto: el modelo no procesa lenguaje natural, por lo que no hay soporte multilingüe que evaluar ni riesgo de alucinación textual. El equivalente funcional al error es una máscara incorrecta o incompleta.
- Sesgos: no se documentan en la información proporcionada análisis de sesgo por tipo de objeto, tono de piel, geografía o demografía. Dado que el modelo no clasifica, el sesgo se manifestaría como una calidad de máscara desigual entre categorías visuales.

## Enlaces
- Hugging Face (repositorio analizado): https://huggingface.co/pinecoresystems/sam2.1-hiera-base-plus
- Repositorio original referenciado en la model card: https://huggingface.co/facebook/sam2.1-hiera-base-plus
- Artículo de SAM 2: https://arxiv.org/abs/2408.00714
- Código oficial: https://github.com/facebookresearch/segment-anything-2/
- Cuadernos de demostración: https://github.com/facebookresearch/segment-anything-2/tree/main/notebooks
- La búsqueda web realizada no devolvió enlaces relevantes: los resultados obtenidos corresponden a extensiones descargadoras de vídeo para Microsoft Edge y no guardan relación con el modelo.
