# Abdoul27/chandra-ocr-2-barbados

## Resumen

Chandra OCR 2 Barbados es un ajuste fino del modelo de reconocimiento óptico de caracteres (OCR) Chandra OCR 2, desarrollado por el usuario Abdoul27 y publicado en HuggingFace bajo el identificador `Abdoul27/chandra-ocr-2-barbados`. El modelo base, `datalab-to/chandra-ocr-2`, es un sistema OCR de última generación creado por Datalab que convierte imágenes y PDF en HTML, Markdown o JSON estructurados conservando la información de maquetación. Este ajuste concreto incorpora la etiqueta `barbados` y las etiquetas de transcripción de escritura a mano (`handwriting`, `htr`, `historical-documents`), lo que apunta a una especialización en documentos históricos y manuscritos de Barbados.

Se trata de un modelo multimodal de tipo image-text-to-text con aproximadamente 5.174.964.736 parámetros según los pesos en safetensors del repositorio, construido sobre la familia de arquitecturas etiquetada como `qwen3_5`. El repositorio ocupa 10,4 GB y requiere acceso restringido (gated), lo que obliga a aceptar las condiciones de uso en HuggingFace antes de poder descargarlo. Su relevancia radica en la escasez de modelos OCR especializados en corpus históricos caribeños y en la posibilidad de reutilizar la arquitectura de Chandra OCR 2 para tareas de digitalización patrimonial.

La información pública disponible sobre este ajuste es muy limitada: no hay descargas ni interacciones registradas, no se documentan idiomas soportados específicos y no se publican detalles del proceso de entrenamiento ni resultados de evaluación propios. Por tanto, gran parte de las especificaciones que siguen se heredan del modelo base y deben tratarse como orientativas hasta que el autor publique documentación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language, familia etiquetada como `qwen3_5` (según tags de HuggingFace) |
| Parametros totales | 5.174.964.736 (≈5,17 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en precisión completa; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible para este ajuste (el modelo base declara 90+ idiomas) |
| Licencia | chandra-ocr-2-modified-openrail-m (variante modificada de OpenRAIL-M, etiquetada como `license:other`); acceso restringido por gating |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Chandra OCR 2, un sistema OCR layout-aware que procesa imágenes y documentos PDF y genera salidas estructuradas en HTML, Markdown o JSON preservando la posición y jerarquía de los elementos de la página. La etiqueta `qwen3_5` del repositorio sugiere que la torre de lenguaje procede de la familia Qwen 3.5, combinada con un codificador visual para el pipeline image-text-to-text. El recuento real de parámetros en safetensors (5,17 mil millones) es superior a los 4 mil millones que la documentación de terceros atribuye a Chandra OCR 2, diferencia que podría deberse a componentes adicionales (codificador visual, proyector, cabezas) o a un conteo distinto de los pesos publicados.

Respecto al ajuste específico de Barbados, no se dispone de información sobre el conjunto de datos utilizado, el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas `handwriting`, `htr` y `historical-documents` indican que el ajuste fino se orientó a transcripción de escritura manuscrita en documentos históricos, presumiblemente de archivos de Barbados, pero el autor no ha publicado detalles metodológicos. Tampoco se documentan innovaciones técnicas propias como decodificación especulativa o atención lineal en este ajuste concreto.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos PDF, con salida en Markdown, HTML y JSON.
- Preservación de maquetación: tablas complejas, columnas, encabezados y estructuras jerárquicas del documento original.
- Reconocimiento de escritura manuscrita (HTR), orientado a documentos históricos según las etiquetas del repositorio.
- Procesamiento de documentos patrimoniales o de archivo, presumiblemente con foco en material de Barbados (no confirmado por documentación del autor).
- Interfaz conversacional (`conversational`), lo que permite diálogo multimodal sobre el contenido de las imágenes.
- Pipeline `image-text-to-text` compatible con la librería transformers.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Soporte multilingüe heredado del modelo base (90+ idiomas según la documentación de terceros sobre Chandra OCR 2); no se confirma qué idiomas cubre específicamente este ajuste.
- Tool calling, function calling y razonamiento multi-paso: no disponible (no documentado).

## Casos de uso

- Digitalización de archivos históricos de Barbados: el modelo puede transcribir manuscritos y documentos coloniales a texto estructurado, aprovechando su especialización HTR para material con caligrafía antigua.
- Reconstrucción de registros parroquiales y censos manuscritos: útil para proyectos de genealogía y demografía histórica que necesitan convertir libros de registro en datos consultables.
- Extracción de tablas en documentación administrativa: al preservar la maquetación en JSON o HTML, permite exportar estructuras tabulares a bases de datos sin post-procesado manual intensivo.
- Digitalización de prensa histórica: transcripción de periódicos antiguos con columnas múltiples y tipografía degradada, generando texto plano indexable para motores de búsqueda.
- Preservación patrimonial institucional: bibliotecas y archivos nacionales pueden usarlo para crear corpus textuales a partir de fondos fotografiados.
- Investigación en humanidades digitales: generación de corpus anotados a partir de fuentes primarias para análisis lingüístico diacrónico.
- Pipelines de accesibilidad documental: conversión de PDF escaneados en versiones accesibles en Markdown o HTML para lectores de pantalla.
- Integración en flujos de catalogación automatizada: combinado con un modelo de lenguaje posterior, permite etiquetar y clasificar documentos históricos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para el ajuste `Abdoul27/chandra-ocr-2-barbados`. La documentación de terceros sobre el modelo base Chandra OCR 2 menciona que alcanza puntuaciones SOTA en la métrica olmOCR con el doble de rendimiento que Chandra 1, pero no se proporcionan cifras concretas en la información recopilada, por lo que no es posible reproducirlas ni atribuirlas a este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 10,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 14-16 GB para trabajar con comodidad.
- VRAM estimada en cuantización INT8: alrededor de 5,2 GB de pesos.
- VRAM estimada en cuantización INT4: alrededor de 2,6-3 GB de pesos, aunque no se publican variantes cuantizadas oficiales de este ajuste.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 o L40S para despliegues en producción con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso en FP16 en estación de trabajo.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 16 GB o superiores en FP16; en cuantización INT4 podría ejecutarse en GPUs de 8-12 GB, siempre que se generen cuantizaciones propias, ya que no se ofrecen en el repositorio.
- Opciones de despliegue: transformers (soporte nativo según la librería declarada), vLLM y TGI son opciones plausibles para servir el modelo multimodal, aunque no se documenta compatibilidad oficial en la ficha del repositorio. llama.cpp y Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles. La documentación del modelo base en regolo.ai afirma un throughput del doble respecto a Chandra 1, pero no se aportan cifras absolutas ni se confirman para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abdoul27/chandra-ocr-2-barbados | ≈5,17 mil millones | no disponible | no disponible (base: 90+) | chandra-ocr-2-modified-openrail-m (gated) | HuggingFace, acceso restringido |
| datalab-to/chandra-ocr-2 | ≈4 mil millones (según regolo.ai) | no disponible | 90+ idiomas | modificada OpenRAIL-M | HuggingFace |
| datalab-to/chandra | no disponible | no disponible | no disponible | no disponible | HuggingFace, versión anterior |
| Modelos OCR alternativos (dots.ocr, olmOCR, GOT-OCR2) | no disponible | no disponible | no disponible | no disponible | no disponible en la información recopilada |

La comparación se limita a la relación entre el ajuste y su modelo base, ya que la información recopilada no incluye datos verificables de otros sistemas OCR contemporáneos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de la descarga, lo que puede complicar su uso en pipelines automatizados.
- Licencia `chandra-ocr-2-modified-openrail-m`: al ser una variante modificada de OpenRAIL-M, impone restricciones de uso (habitualmente cláusulas de uso responsable y posibles limitaciones comerciales). Es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- Ausencia de documentación: no hay información publicada sobre el dataset de entrenamiento, el proceso de ajuste ni los idiomas cubiertos, lo que dificulta estimar su comportamiento fuera del dominio de Barbados.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede inventar texto ausente en la imagen, especialmente en documentos degradados, sellos, márgenes o caligrafías atípicas.
- Sesgo de dominio: la especialización en documentos históricos de Barbados puede degradar el rendimiento en documentos modernos, otros idiomas o sistemas de escritura distintos.
- Desconocimiento de sesgos demográficos o históricos: no se documenta ningún análisis de sesgos, relevante en corpus coloniales donde el lenguaje puede contener terminología discriminatoria.
- Sin métricas de evaluación: al no publicarse benchmarks, no es posible verificar la calidad real del ajuste frente al modelo base.
- Contexto desconocido: se ignora la longitud máxima de contexto, lo que limita la planificación de despliegues con documentos extensos.
- Repositorio con cero descargas y cero interacciones: la falta de validación comunitaria implica un riesgo adicional de errores no detectados en los pesos o en la configuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abdoul27/chandra-ocr-2-barbados
- Modelo base en HuggingFace: https://huggingface.co/datalab-to/chandra-ocr-2
- Versión anterior del modelo base: https://huggingface.co/datalab-to/chandra
- Repositorio GitHub de Datalab Chandra: https://github.com/datalab-to/chandra
- Blog de presentación de Chandra (Datalab): https://www.datalab.to/blog/introducing-chandra
- Ficha de Chandra OCR 2 en regolo.ai: https://regolo.ai/models-archive/chandra-ocr-2/
