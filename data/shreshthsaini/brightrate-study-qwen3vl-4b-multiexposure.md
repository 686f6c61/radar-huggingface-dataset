# shreshthsaini/brightrate-study-qwen3vl-4b-multiexposure

## Resumen

El modelo `shreshthsaini/brightrate-study-qwen3vl-4b-multiexposure` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, centrado en la evaluación perceptual de calidad de vídeo HDR generado por usuarios (UGC). Se construye sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`, un transformer multimodal de 4 mil millones de parámetros, y añade una capa de adaptación específica para puntuar la calidad de vídeo a partir de una pila de exposiciones múltiples.

El adaptador procesa ocho fotogramas uniformemente muestreados del vídeo, cada uno renderizado a tres exposiciones (-2, 0 y +2 pasos), generando 24 imágenes que se pasan al modelo en orden temporal-mayor. El resultado es una puntuación de calidad de 0 a 100, junto con una descripción de defectos visibles y el razonamiento detrás de la puntuación. Está pensado exclusivamente para investigación en evaluación de calidad sin referencia (no-reference) de vídeo HDR, y no está calibrado para otros dominios o pipelines de visualización.

La relevancia de este modelo radica en que aborda un problema poco cubierto: la evaluación automática de calidad de vídeo HDR generado por usuarios, donde coexisten distorsiones típicas de contenido UGC con artefactos específicos de HDR. Al usar un modelo de lenguaje multimodal como base, el adaptador puede generar explicaciones textuales de los defectos, algo inusual en los métodos tradicionales de calidad de vídeo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-4B-Instruct (transformer multimodal) |
| Parametros totales | no disponible (el adaptador LoRA es de rango 16, pero no se indica el número total de parámetros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredado del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (el modelo base soporta varios idiomas, pero el adaptador no especifica) |
| Licencia | no disponible (el modelo card no indica licencia para el adaptador) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base Qwen3-VL-4B-Instruct. La entrada se construye muestreando ocho fotogramas uniformemente distribuidos del vídeo, cada uno renderizado a tres exposiciones (-2, 0 y +2 pasos), lo que produce 24 imágenes que se presentan al modelo en orden temporal-mayor. Esta representación multi-exposición permite al modelo capturar información de rango dinámico que una sola exposición perdería.

El entrenamiento se realizó sobre el split 0 de BrightVQ, un dataset de vídeo HDR generado por usuarios con anotaciones de calidad perceptual. Se usaron dos épocas con un horizonte de programación de coseno de tres épocas, tasa de aprendizaje de 1e-4, micro-batch de 1 y acumulación de gradientes de 8. Los objetivos de puntuación media de opinión (MOS) se interpolaron en cinco palabras de calidad, lo que sugiere que el modelo aprende a asociar niveles de calidad con descriptores lingüísticos. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado con etiquetas MOS.

## Capacidades

- Evaluación de calidad perceptual sin referencia de vídeo HDR generado por usuarios, devolviendo una puntuación de 0 a 100.
- Generación de una descripción textual de los defectos visibles en el vídeo.
- Producción de un razonamiento explicativo que justifica la puntuación asignada.
- Procesamiento de entradas multimodales: combina visión (los 24 fotogramas) y lenguaje (la salida textual).
- Manejo de representaciones multi-exposición, lo que le permite analizar artefactos HDR como clipping, banding o ruido en sombras y altas luces.
- Al estar basado en Qwen3-VL-4B-Instruct, hereda capacidades generales de comprensión de imágenes y generación de texto, aunque el adaptador está especializado en la tarea de calidad de vídeo.

## Casos de uso

- Control de calidad en pipelines de transcodificación de vídeo UGC: el modelo puede puntuar automáticamente la calidad percibida de vídeos subidos por usuarios antes de su publicación, ayudando a detectar problemas de exposición o artefactos HDR.
- Evaluación de algoritmos de tone mapping: al comparar la calidad percibida de diferentes versiones de un mismo vídeo HDR mapeado a SDR, el adaptador proporciona una métrica perceptual sin necesidad de referencia.
- Selección de exposiciones en cámaras o aplicaciones de edición: el modelo puede analizar una pila de exposiciones y sugerir la combinación óptima para maximizar la calidad percibida.
- Investigación en calidad de vídeo HDR: sirve como herramienta de anotación automática para crear nuevos datasets o validar hipótesis sobre la percepción de artefactos HDR.
- Monitorización de calidad en plataformas de streaming: integrado en un sistema de análisis, puede detectar vídeos con baja calidad perceptual y priorizar su re-procesado.
- Generación de informes de defectos: al producir descripciones textuales, el modelo puede alimentar sistemas de diagnóstico que expliquen a los creadores qué problemas tiene su vídeo y cómo mejorarlo.

## Benchmarks y rendimiento

En el conjunto de test del split 0 de BrightVQ (420 vídeos), el adaptador obtiene los siguientes resultados:

| Metrica | Valor |
|---|---|
| SROCC (Spearman Rank Order Correlation Coefficient) | 0.8790 |
| PLCC (Pearson Linear Correlation Coefficient) | 0.8899 |
| KRCC (Kendall Rank Correlation Coefficient) | 0.6930 |
| RMSE (Root Mean Square Error) | 6.1290 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores indican una correlación alta entre las puntuaciones del modelo y las opiniones humanas, pero deben interpretarse en el contexto del dataset BrightVQ y de la configuración específica de entrenamiento.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB en el repositorio), pero requiere cargar el modelo base Qwen3-VL-4B-Instruct, que tiene 4 mil millones de parámetros.
- Para inferencia en FP16, se estima una VRAM de aproximadamente 8-10 GB, dependiendo de la longitud de la secuencia de entrada (24 imágenes más el texto de salida).
- Con cuantización de 4 bits, la VRAM necesaria puede reducirse a unos 4-5 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 3060 o superior.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM para FP16.
- Opciones de despliegue: el adaptador se puede cargar con la librería `peft` de Hugging Face junto con `transformers`. También es compatible con servidores de inferencia como vLLM o TGI, siempre que soporten modelos PEFT.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio proyecto BrightRate (sin el componente de lenguaje) es el predecesor directo, pero no se ofrecen métricas comparativas en la model card. Por tanto, no es posible realizar una comparativa objetiva con alternativas como otros métodos de calidad de vídeo HDR sin referencia.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente con datos de BrightVQ y no está calibrado para otros datasets, pipelines de visualización o dominios de vídeo. Su uso fuera de este ámbito puede producir puntuaciones poco fiables.
- La licencia del adaptador no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar con el autor antes de utilizarlo en proyectos productivos.
- Al ser un adaptador LoRA, su rendimiento depende del modelo base Qwen3-VL-4B-Instruct; cualquier limitación de este (sesgos, alucinaciones, idiomas) se hereda.
- La entrada requiere una construcción específica (8 fotogramas × 3 exposiciones), lo que limita su aplicabilidad a vídeos que puedan ser muestreados y re-renderizados de esa manera.
- No se han documentado sesgos específicos, pero el dataset BrightVQ puede contener sesgos geográficos o demográficos en los vídeos UGC, lo que podría afectar a la generalización.
- El modelo genera descripciones textuales de defectos, pero estas pueden ser imprecisas o alucinadas, especialmente en vídeos con condiciones atípicas.

## Enlaces

- [HuggingFace - adaptador](https://huggingface.co/shreshthsaini/brightrate-study-qwen3vl-4b-multiexposure)
- [Modelo base Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
- [BrightVQ dataset](https://github.com/shreshthsaini/BrightVQ)
- [BrightRate-LM código](https://github.com/shreshthsaini/BrightRate-LM)
- [Página del autor](https://shreshthsaini.github.io/)
- [Paper BrightRate (WACV 2026)](https://wacv.thecvf.com/virtual/2026/oral/1209)
