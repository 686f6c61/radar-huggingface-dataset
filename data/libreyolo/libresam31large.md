# LibreYOLO/LibreSAM31large

## Resumen

LibreSAM31large es un modelo de segmentación de imágenes promptable derivado de facebook/sam3.1 y publicado por LibreYOLO. Se distribuye como un ajuste fino (finetune) del SAM 3.1 de Meta, empaquetado en formato transformers con pesos safetensors y orientado a tareas de generación de máscaras, segmentación de imágenes y extracción de características. La arquitectura declarada es sam3_video, lo que indica que conserva la capacidad de segmentación sobre vídeo además de imagen estática. Con aproximadamente 852 millones de parámetros y un repositorio de 3,4 GB, se posiciona en la gama "large" de la familia SAM.

El modelo resuelve el problema de la segmentación guiada por prompt (puntos, cajas o máscaras) sin necesidad de reentrenamiento por dominio, y su interés actual radica en que ofrece una alternativa comunitaria al SAM 3.1 original manteniendo compatibilidad con el ecosistema transformers y con endpoints de inferencia. Al estar construido sobre un modelo base de Meta, hereda su filosofía de segmentación "segment anything", pero su utilidad práctica está condicionada por una licencia propia (sam-license) y por un acceso restringido que exige aceptar condiciones en HuggingFace.

La ficha se elabora únicamente con los metadatos disponibles en el repositorio; no se han publicado detalles sobre datos de entrenamiento, benchmarks ni configuraciones de cuantización, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sam3_video (transformer de segmentación promptable, base facebook/sam3.1) |
| Parametros totales | 852.400.583 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | sam-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura sam3_video y deriva de facebook/sam3.1 mediante ajuste fino. La familia SAM (Segment Anything Model) emplea un codificador de imagen tipo transformer (ViT) combinado con un decodificador de máscaras ligero que recibe prompts (puntos, cajas, máscaras previas) y produce máscaras de segmentación. La variante "video" añade propagación temporal de máscaras entre fotogramas, lo que permite seguir objetos a lo largo de una secuencia. El repositorio declara la tarea feature-extraction, coherente con el uso del codificador de imagen como extractor de representaciones.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset de ajuste fino, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en modelos de segmentación). Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del SAM 3.1 base. Cualquier afirmación sobre el proceso de entrenamiento concreto de este finetune sería especulativa y, por tanto, se omite.

## Capacidades

- Segmentación de imágenes promptable: genera máscaras a partir de puntos, cajas delimitadoras o máscaras de referencia.
- Generación de máscaras (mask-generation): produce máscaras para múltiples objetos de forma automática, tarea declarada en el pipeline.
- Segmentación y seguimiento en vídeo: la arquitectura sam3_video sugiere propagación de máscaras entre fotogramas.
- Extracción de características: el codificador de imagen puede emplearse para obtener embeddings visuales (tarea feature-extraction).
- Compatibilidad con transformers y con endpoints de inferencia (tag endpoints_compatible).
- Capacidades multilingües, tool calling y razonamiento multi-paso: no disponibles; no es un modelo de lenguaje.

## Casos de uso

- Anotación automática de datasets de visión: el modelo puede generar máscaras de objetos a partir de cajas o puntos para acelerar el etiquetado semántico e instancia en pipelines de datos de entrenamiento.
- Segmentación interactiva en herramientas de edición: integrado en una interfaz donde el usuario hace clic sobre un objeto y el modelo devuelve la máscara correspondiente, gracias a su naturaleza promptable.
- Seguimiento de objetos en vídeo: usando la variante sam3_video, se pueden propagar máscaras iniciales a lo largo de secuencias para tareas de conteo, tracking o análisis de movimiento.
- Preprocesado para modelos de visión downstream: las máscaras generadas pueden aislar regiones de interés antes de pasarlas a clasificadores, detectores o modelos de OCR.
- Segmentación en imágenes médicas o de microscopía (con validación previa): el ajuste fino permite adaptar el modelo base a dominios específicos donde el SAM genérico rinde peor.
- Extracción de embeddings visuales: el codificador puede usarse como backbone congelado para búsqueda por similitud o clustering de imágenes.
- Automatización de flujos de edición fotográfica: recorte de sujetos y sustitución de fondos mediante máscaras de alta calidad generadas por prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3,4 GB solo para pesos, más activaciones y memoria del decodificador; en la práctica se recomienda al menos 8-12 GB para imágenes de resolución media.
- En fp16/bf16, los pesos ocupan alrededor de 1,7 GB, lo que reduce el requisito de VRAM a unos 4-6 GB según resolución y batch.
- GPU recomendadas: A100, H100 o L40S para procesamiento por lotes y vídeo; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo con al menos 8 GB de VRAM en cuantización fp16 y resoluciones moderadas; en 4-6 GB puede requerir cuantización adicional no documentada.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles de HuggingFace; vLLM, llama.cpp u Ollama no están indicados para este tipo de modelo de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| LibreSAM31large | 852 M | no disponible | Segmentación promptable (imagen y vídeo) | sam-license | Restringido |
| facebook/sam3.1 (base) | no disponible | no disponible | Segmentación promptable | sam-license | Según repositorio original |
| Segment Anything (SAM original, Meta) | ~636 M (ViT-H) | no aplica | Segmentación promptable | Apache 2.0 (versión original) | Abierto |
| SAM 2 (Meta) | ~224 M - 2,4 B según variante | no aplica | Segmentación imagen y vídeo | Apache 2.0 / licencia propia según versión | Abierto |

La comparación con SAM original y SAM 2 se ofrece como referencia de categoría; los datos exactos de SAM 3.1 no están disponibles en la información proporcionada y no deben tomarse como cifras verificadas de este repositorio.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo.
- Licencia sam-license: no es una licencia de código abierto estándar; conviene revisar las condiciones antes de cualquier uso comercial.
- Sin información sobre sesgos: no se documenta el comportamiento del modelo en grupos demográficos, dominios minoritarios o imágenes de baja calidad.
- Riesgo de máscaras incorrectas en objetos ocluidos, pequeños o con límites ambiguos, inherente a los modelos de segmentación promptable.
- Sin datos de benchmarks: no es posible comparar su rendimiento real con el SAM 3.1 original ni con alternativas.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento multi-paso.
- Sin documentación sobre cuantizaciones oficiales ni sobre el proceso de ajuste fino, lo que dificulta evaluar su robustez en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso o validación.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreSAM31large
- Modelo base: https://huggingface.co/facebook/sam3.1
