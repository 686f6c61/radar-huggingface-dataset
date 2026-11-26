# niverseu/medical-sam-best-20261125

## Resumen

Medical SAM checkpoints es un repositorio de pesos publicado por el usuario niverseu en Hugging Face que recopila 18 checkpoints de segmentación médica entrenados sobre la arquitectura Segment Anything Model (SAM). El archivo incluye variantes de SAMed (con adaptación LoRA) y Medical-SAM-Adapter, cada una con los backbones ViT-B, ViT-L y ViT-H, evaluadas sobre los conjuntos de datos Synapse, ISIC y REFUGE. Además, se incluyen tres checkpoints base originales de SAM necesarios para cargar los modelos médicos.

No se trata de un modelo nuevo entrenado desde cero, sino de un archivo histórico de pesos cuyo objetivo es preservar y facilitar la reproducibilidad de resultados documentados previamente. La selección de checkpoints y las puntuaciones provienen de la evidencia histórica recogida en `evidence/historical_best_weights.md`, y el autor advierte explícitamente de que estas métricas no se han reproducido de nuevo y que el archivo no establece un checkpoint globalmente óptimo.

El repositorio ocupa 20,8 GB y está etiquetado para segmentación de imágenes en el ámbito médico, con soporte declarado de inglés y chino. Es relevante para investigadores que necesiten comparar adaptaciones de SAM en segmentación médica sin reentrenar, aunque su uso requiere los cargadores y la configuración de los proyectos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything Model (SAM) con adaptaciones SAMed (LoRA) y Medical-SAM-Adapter; backbones ViT-B, ViT-L y ViT-H |
| Parametros totales | no disponible (depende del backbone ViT-B/L/H y de la adaptación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes basado en prompts) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible (el autor indica que no se concede nueva licencia y aplican los términos upstream y de los datasets) |
| Formato de pesos | checkpoints (archivos de pesos del proyecto original; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints basados en SAM, un modelo de segmentación de imágenes con backbone Vision Transformer (ViT) en tres escalas: ViT-B, ViT-L y ViT-H. Las adaptaciones incluidas son SAMed, que aplica LoRA sobre SAM, y Medical-SAM-Adapter. Los checkpoints se entrenaron sobre los conjuntos Synapse, ISIC y REFUGE, que cubren segmentación de órganos, lesiones dermatológicas y estructuras retinianas respectivamente.

El autor indica que los datos de entrenamiento, los datos adversarios generados y las trayectorias del optimizador no forman parte del archivo. No se proporciona información sobre el número de tokens, la composición detallada de los datasets ni sobre si se emplearon técnicas de RLHF o DPO, algo que no aplica a un modelo de segmentación. Como innovación destacable, SAMed introduce adaptación de bajo rango (LoRA) para ajustar SAM a dominios médicos con menos parámetros entrenables, mientras que Medical-SAM-Adapter emplea protocolos de prompts específicos por dataset. El autor advierte de que SAMed no usa prompts y MSA sí, por lo que sus entradas no son directamente comparables.

## Capacidades

- Segmentación de imágenes médicas en dominios como órganos abdominales (Synapse), lesiones cutáneas (ISIC) y estructuras retinianas (REFUGE).
- Segmentación basada en prompts para las variantes Medical-SAM-Adapter, con protocolos específicos por dataset.
- Segmentación sin prompts para las variantes SAMed.
- Adaptación eficiente mediante LoRA sobre el modelo SAM original.
- Soporte de tres escalas de backbone (ViT-B, ViT-L, ViT-H) para equilibrar coste y precisión.
- Carga sobre los checkpoints base originales de SAM incluidos en el archivo.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en segmentación médica: permite cargar checkpoints SAMed y Medical-SAM-Adapter ya entrenados para reproducir o comparar resultados en Synapse, ISIC y REFUGE sin reentrenar desde cero.
- Segmentación de órganos abdominales: los checkpoints entrenados en Synapse pueden emplearse para delimitar órganos en imágenes de TC, usando los loaders del proyecto original.
- Análisis de lesiones dermatológicas: los checkpoints de ISIC permiten segmentar lesiones cutáneas en imágenes dermatológicas como paso previo a clasificación o medición.
- Segmentación de estructuras retinianas: los checkpoints de REFUGE sirven para delimitar el disco óptico y la copa en imágenes de fondo de ojo.
- Evaluación comparativa de adaptaciones: el archivo facilita comparar SAMed frente a Medical-SAM-Adapter bajo los mismos datasets, teniendo en cuenta las diferencias de protocolo de prompts.
- Reproducibilidad de publicaciones: al incluir hashes SHA256 y un manifiesto con tamaños y puntuaciones Dice reportadas, permite verificar la integridad de los pesos usados en estudios previos.
- Punto de partida para fine-tuning: los checkpoints pueden servir como inicialización para adaptar SAM a nuevos dominios médicos con LoRA.

## Benchmarks y rendimiento

El autor menciona puntuaciones Dice reportadas para cada checkpoint en `manifest.json`, pero no se incluyen los valores numéricos en la información disponible. El autor advierte además de que estas puntuaciones no se han reproducido de nuevo.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del backbone; ViT-H es el más costoso y ViT-B el más ligero, pero no se proporcionan cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; los backbones ViT-L y ViT-H suelen requerir GPU de gama alta, pero no se aportan datos concretos.
- Opciones de despliegue: requiere los loaders y la configuración de los proyectos originales (SAMed y Medical-SAM-Adapter); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Backbones | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medical SAM checkpoints (niverseu) | SAM + SAMed (LoRA) / Medical-SAM-Adapter | ViT-B/L/H | no aplica | no disponible (términos upstream) | Hugging Face, 20,8 GB |
| SAM original (Meta) | SAM | ViT-B/L/H | no aplica | licencia Apache 2.0 según el proyecto original | GitHub facebookresearch/segment-anything |
| SAMed | SAM + LoRA | ViT-B/L/H | no aplica | no disponible en esta ficha | Proyecto original |
| Medical-SAM-Adapter | SAM + adaptadores | ViT-B/L/H | no aplica | no disponible en esta ficha | Proyecto original |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada.

## Limitaciones y advertencias

- Los checkpoints no son modelos SAM completos e independientes: requieren los loaders y la configuración de los proyectos originales.
- Las puntuaciones Dice no se han reproducido de nuevo; el archivo no garantiza un checkpoint globalmente óptimo.
- SAMed y Medical-SAM-Adapter usan protocolos de entrada distintos (sin prompts frente a prompts específicos por dataset), por lo que sus resultados no son directamente comparables.
- No se concede nueva licencia; aplican los términos de los proyectos upstream y de los datasets, lo que puede restringir el uso comercial.
- No se incluyen datos de entrenamiento, datos adversarios ni trayectorias del optimizador, lo que limita la auditoría completa del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria documentada.
- Solo se declaran los idiomas en y zh, aunque en un modelo de segmentación el idioma afecta principalmente a la documentación y a las etiquetas, no a la inferencia visual.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; en segmentación médica, los fallos de delimitación pueden tener consecuencias clínicas, por lo que no debe usarse en producción clínica sin validación.

## Enlaces

- Hugging Face: https://huggingface.co/niverseu/medical-sam-best-20261125
- Proyecto fuente citado: https://github.com/Cheng-bgstx/GRAT-main
- SAM original: https://github.com/facebookresearch/segment-anything
