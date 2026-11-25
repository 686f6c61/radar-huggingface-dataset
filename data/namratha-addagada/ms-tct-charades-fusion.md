# namratha-addagada/ms-tct-charades-fusion

## Resumen

MS-TCT con características fusionadas de I3D y CLIP para Charades es una implementación del modelo oficial MS-TCT (Dai et al., CVPR 2022) orientada a la detección temporal de acciones en vídeo sobre el conjunto de datos Charades. El modelo detecta y localiza en el tiempo 157 clases de acciones distintas a partir de secuencias de vídeo, combinando descriptores visuales de dos extractores complementarios: I3D afinado en Charades (1024 dimensiones) y CLIP ViT-B/32 (512 dimensiones).

El modelo trabaja sobre una representación por fragmentos (snippets) a 3 snippets por segundo, con un vector concatenado de 1536 dimensiones por snippet, estandarizado mediante estadísticas de fusión almacenadas en `fusion_stats.npz`. La ventana de procesamiento es de 256 snippets, lo que equivale aproximadamente a 85 segundos de vídeo por ventana.

Es relevante en el contexto de la investigación en detección temporal de acciones porque demuestra que la fusión de características de dos extractores con sesgos inductivos distintos (I3D, entrenado específicamente para acción, y CLIP, con representaciones semánticas generales) mejora el rendimiento frente a cada extractor por separado en el split de test oficial. El repositorio tiene un tamaño de 0,2 GB e incluye los pesos del modelo y el código de extracción de características I3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MS-TCT (transformer multi-escala para detección temporal de acciones) con fusión de características I3D + CLIP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 256 snippets (aprox. 85 s a 3 snippets/s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no de texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo incluye pesos del modelo y pesos I3D de piergiaj/pytorch-i3d) |

## Arquitectura y entrenamiento

MS-TCT es un transformer multi-escala diseñado para detección temporal de acciones. El modelo procesa secuencias de características por snippet y genera predicciones por fotograma de clases de acción con sus correspondientes límites temporales. En esta implementación, la entrada es un vector de 1536 dimensiones por snippet, resultante de concatenar las características RGB de I3D (1024-D) y las de CLIP ViT-B/32 (512-D). Las características I3D se remuestrean sobre la rejilla temporal de CLIP y ambas se estandarizan con las estadísticas de `fusion_stats.npz`.

El entrenamiento se realizó sobre las 7.027 vídeos de entrenamiento de Charades, con selección de época sobre 784 vídeos reservados del propio conjunto de entrenamiento. El modelo reportado corresponde a la época 14. Los pesos I3D incluidos en `i3d/` provienen de piergiaj/pytorch-i3d (Apache-2.0) y están afinados en Charades; se usan para extraer características de vídeos subidos. El código base de MS-TCT procede del repositorio oficial de Dai et al.

## Capacidades

- Detección temporal de acciones en vídeo sobre 157 clases de Charades.
- Localización de límites temporales de acciones (inicio y fin) además de clasificación.
- Fusión multimodal de características visuales: I3D (apariencia y movimiento específicos de acción) y CLIP (semántica visual general).
- Procesamiento de ventanas de 256 snippets (aprox. 85 s) con solapamiento implícito por el diseño multi-escala.
- Extracción de características I3D incluida para vídeos nuevos.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un modelo exclusivamente de visión por vídeo.

## Casos de uso

- Análisis de vídeo de vigilancia: detección y localización temporal de acciones concretas (por ejemplo, sentarse, abrir puertas) en grabaciones continuas, segmentando la ventana de 256 snippets en eventos con marcas de tiempo.
- Indexación semántica de archivos audiovisuales: generar marcas temporales de acciones para permitir búsqueda por eventos en bibliotecas de vídeo, aprovechando las 157 clases de Charades.
- Investigación en detección temporal de acciones: servir como línea base reproducible con fusión I3D+CLIP para comparar variantes de extractores o estrategias de fusión.
- Análisis de comportamiento en entornos domésticos: reconocimiento de actividades cotidianas (cocinar, limpiar, interactuar con objetos) en conjuntos de vídeo tipo Charades o capturas propias.
- Etiquetado asistido de datos: preanotar segmentos de acción en nuevos vídeos para acelerar el etiquetado manual posterior, usando las predicciones por fotograma como propuesta inicial.
- Evaluación de extractores de características: comparar el rendimiento de I3D frente a CLIP y su fusión en una tarea concreta, ya que la model card reporta la ablación correspondiente.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test oficial de Charades (1.814 vídeos):

| Configuracion | mAP por fotograma | mAP muestreado |
|---|---|---|
| Fusion I3D + CLIP (epoca 14) | 23,60 % | 24,27 % |
| Solo CLIP (ablacion) | 21,00 % | no disponible |
| Solo I3D (ablacion) | 22,72 % | no disponible |
| Fusion (ablacion, epoca elegida sobre test) | 24,36 % | no disponible |

La ablación se realizó con los mismos ajustes y selección de época sobre test, siguiendo el código oficial. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,2 GB, pero el consumo en inferencia depende del tamaño del modelo MS-TCT y de los extractores I3D y CLIP, no especificados.
- GPU recomendadas: no disponible. Por el uso de CLIP ViT-B/32 e I3D, se requiere una GPU con soporte CUDA; una GPU consumer moderna (por ejemplo, RTX 3090 o RTX 4090) es plausible, pero no hay datos confirmados.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vídeo). El despliegue se haría con PyTorch y el código de MS-TCT e I3D incluidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | mAP Charades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MS-TCT + fusion I3D/CLIP (este) | no disponible | 256 snippets | 23,60 % (por fotograma) | MIT | Hugging Face |
| MS-TCT oficial (Dai et al.) | no disponible | no disponible | no disponible en esta ficha | no disponible | GitHub oficial |
| Solo I3D (ablacion) | no disponible | 256 snippets | 22,72 % | Apache-2.0 (pesos I3D) | incluido en el repo |
| Solo CLIP ViT-B/32 (ablacion) | no disponible | 256 snippets | 21,00 % | MIT (repo) | incluido en el repo |

No se dispone de datos de otros modelos comparables de detección temporal de acciones en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en Charades: su vocabulario se limita a las 157 clases de ese conjunto y no generaliza a acciones fuera de ellas sin reentrenamiento.
- El rendimiento reportado (23,60 % de mAP por fotograma) es bajo en términos absolutos; es adecuado para investigación y experimentación, no para producción de alta precisión.
- La selección de época se realizó sobre el conjunto de test en la ablación, lo que puede inflar ligeramente las cifras; la cifra principal usa selección sobre vídeos reservados de entrenamiento.
- No hay información sobre sesgos del modelo; al entrenarse en Charades, hereda los sesgos de ese conjunto (entornos domésticos, distribución demográfica y de escenas concreta).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir detecciones falsas positivas en vídeos fuera de distribución.
- La licencia MIT del repositorio no cubre necesariamente los pesos de terceros (I3D de piergiaj/pytorch-i3d es Apache-2.0); conviene revisar ambas antes de uso comercial.
- No se documentan requisitos de hardware, latencias ni procesos de despliegue, lo que dificulta la planificación en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/namratha-addagada/ms-tct-charades-fusion
- Código oficial de MS-TCT: https://github.com/dairui01/MS-TCT
- Pesos y código I3D: https://github.com/piergiaj/pytorch-i3d
- Paper de MS-TCT: Dai et al., CVPR 2022 (referenciado en la model card; sin URL directa en la información disponible)
