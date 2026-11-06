# Sila97/VGGT-HPE

## Resumen

VGGT-HPE es un modelo de estimación de pose de cabeza (head pose estimation, HPE) desarrollado por Vasiliki Vasileiou, Panagiotis P. Filntisis, Petros Maragos y Kostas Daniilidis, presentado en CVPRW 2026. Su aportación principal es reformular la tarea: en lugar de regresar una pose absoluta a partir de una sola imagen, el modelo estima la transformación rígida entre una imagen de consulta y una imagen de anclaje con pose conocida. Esta formulación relativa reduce el error de forma notable en comparaciones difíciles, tal y como reportan los autores en el conjunto BIWI.

Técnicamente, VGGT-HPE adapta la rama de cámara del modelo VGGT-1B mediante LoRA de rango 8 y se entrena exclusivamente con renderizados sintéticos de FLAME, con supervisión sobre rotación, traslación y campo de visión. El repositorio de Hugging Face contiene dos checkpoints: el modelo relativo (`checkpoint_305.pt`, 6,3 GB) y una línea base absoluta (`checkpoint_abs.pt`, 5,87 GB). No es un modelo generativo de lenguaje, sino un modelo de visión 3D especializado.

La relevancia actual reside en que demuestra que la predicción relativa de pose supera a los enfoques absolutos en escenarios difíciles, con un MAE de rotación de 2,82 grados en BIWI frente a 3,91 de 6DRepNet. Su licencia es estrictamente de investigación (no comercial), lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGGT-1B (rama de cámara) adaptada con LoRA de rango 8 |
| Parametros totales | no disponible (deriva de VGGT-1B; el nombre sugiere ~1B en la base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante `.pt`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | VGGT research license (no comercial) |
| Formato de pesos | PyTorch `.pt` (checkpoint_305.pt, checkpoint_abs.pt) |

## Arquitectura y entrenamiento

VGGT-HPE parte de VGGT-1B, un transformer de visión para percepción 3D, y adapta su rama de cámara mediante LoRA de rango 8. La tarea se reformula como predicción de pose relativa: dada una imagen de consulta y una imagen de anclaje con pose conocida, el modelo estima la transformación rígida entre ambas, supervisando rotación, traslación y campo de visión. El entrenamiento se realiza exclusivamente con renderizados sintéticos de FLAME, sin datos reales etiquetados.

Esta elección de datos sintéticos es una innovación destacable: el modelo generaliza a datos reales (BIWI) sin entrenamiento supervisado sobre ellos, y la formulación relativa resulta progresivamente más ventajosa a medida que crece la dificultad de la pose. El checkpoint base VGGT-1B congelado debe descargarse por separado desde `facebookresearch/vggt`.

## Capacidades

- Estimación de pose de cabeza monocular mediante predicción de pose relativa entre imagen de consulta e imagen de anclaje.
- Estimación de rotación (yaw, pitch, roll) y traslación.
- Predicción del campo de visión (field of view).
- Línea base absoluta incluida (`checkpoint_abs.pt`) para comparación y para escenarios sin imagen de anclaje.
- Generalización de entrenamiento sintético (FLAME) a datos reales (BIWI).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Análisis de atención en entornos educativos o de reuniones: el modelo estima la orientación de la cabeza respecto a una pose de referencia, útil para medir hacia dónde mira un participante en grabaciones con cámara fija.
- Sistemas de conducción y monitorización del conductor: la predicción relativa permite detectar distracciones comparando la pose actual con una pose neutra de anclaje, con mayor robustez en ángulos extremos.
- Interacción persona-ordenador y realidad aumentada: seguimiento de la orientación de la cabeza para anclar contenido virtual, usando una imagen de referencia calibrada como anclaje.
- Investigación en psicología y conducta: cuantificación objetiva de la pose de cabeza en estudios con vídeo, aprovechando el bajo MAE en yaw y pitch (2,24 y 3,04 grados en BIWI).
- Evaluación comparativa de modelos de HPE: el repositorio incluye scripts de evaluación sobre BIWI (protocolo MTCNN compartido) y conjuntos de pares difíciles y fáciles (`protocols/table2_hard_pairs.csv`, `protocols/table3_easy_pairs.csv`).
- Prototipado académico de percepción 3D: al derivar de VGGT-1B, sirve como punto de partida para experimentos con LoRA sobre la rama de cámara en tareas relacionadas.

## Benchmarks y rendimiento

Resultados en BIWI con protocolo MTCNN compartido (MAE de rotación en grados; menor es mejor):

| Metodo | Yaw | Pitch | Roll | MAE | Datos de entrenamiento |
|---|---|---|---|---|---|
| 6DRepNet | 3,74 | 4,95 | 3,04 | 3,91 | mixto |
| TokenHPE-v1 | 5,57 | 6,23 | 3,79 | 5,20 | mixto |
| TRG | 4,58 | 7,18 | 3,68 | 5,15 | mixto |
| VGGT-HPE-Abs (propio) | 4,90 | 7,01 | 3,53 | 5,15 | sintético |
| VGGT-HPE (relativo, propio) | 2,24 | 3,04 | 3,17 | 2,82 | sintético |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; los checkpoints son de 6,3 GB (relativo) y 5,87 GB (absoluto), más el checkpoint base VGGT-1B congelado, por lo que se requiere memoria adicional para la base.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño de los pesos se intuye necesidad de GPU con memoria suficiente para cargar base más adaptador, aunque no se especifica.
- Viabilidad en GPU de consumo: no confirmada; depende de la memoria total necesaria (base VGGT-1B más checkpoint), no documentada.
- Opciones de despliegue: el repositorio oficial proporciona código de evaluación y entrenamiento en Python con entorno Conda (`environment.yml`), invocado mediante `scripts/eval_biwi.sh`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | MAE BIWI (grados) | Datos de entrenamiento | Licencia |
|---|---|---|---|---|
| VGGT-HPE (relativo) | Relativo (VGGT + LoRA) | 2,82 | sintético | investigación (no comercial) |
| VGGT-HPE-Abs | Absoluto (VGGT + LoRA) | 5,15 | sintético | investigación (no comercial) |
| 6DRepNet | Absoluto | 3,91 | mixto | no disponible en la información |
| TokenHPE-v1 | Absoluto | 5,20 | mixto | no disponible en la información |
| TRG | Absoluto | 5,15 | mixto | no disponible en la información |

## Limitaciones y advertencias

- Licencia VGGT research (no comercial): el uso en producción comercial está restringido; los pesos derivan de VGGT-1B y heredan sus términos.
- Requiere una imagen de anclaje con pose conocida para el modo relativo; sin ella debe usarse la línea base absoluta, con peor rendimiento (MAE 5,15 frente a 2,82).
- Entrenado exclusivamente con renderizados sintéticos de FLAME: puede presentar degradación ante dominios visuales muy alejados de la distribución sintética, aunque generaliza a BIWI.
- El rendimiento en roll (3,17 grados) es peor que en yaw y pitch, y no mejora a 6DRepNet en esa componente (3,04).
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni multilingüismo.
- Riesgo de sesgo ligado a los datos sintéticos de FLAME (variabilidad limitada de identidades, iluminación y oclusiones).
- Verificar la integridad de las descargas con los valores SHA-256 de `CHECKPOINTS.md` antes de usar los checkpoints.
- No se han publicado datos de latencia, throughput ni requisitos mínimos de VRAM en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Sila97/VGGT-HPE
- Paper (CVPRW 2026): https://openaccess.thecvf.com/content/CVPR2026W/ABAW/papers/Vasileiou_VGGT-HPE_Reframing_Head_Pose_Estimation_as_Relative_Pose_Prediction_CVPRW_2026_paper.pdf
- Página del proyecto: https://vasilikivas.github.io/VGGT-HPE/
- Código: https://github.com/VasilikiVas/vggt-hpe
- Checkpoints e integridad: https://github.com/VasilikiVas/vggt-hpe/blob/main/CHECKPOINTS.md
- Datos: https://github.com/VasilikiVas/vggt-hpe/blob/main/DATA.md
- Licencia VGGT: https://github.com/facebookresearch/vggt/blob/main/LICENSE.txt
- VGGT base: https://github.com/facebookresearch/vggt
