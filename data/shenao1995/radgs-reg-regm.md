# shenao1995/RadGS-Reg-RegM

## Resumen

RadGS-Reg RegM es un modelo de registro rígido 3D de vértebras individuales, desarrollado por el autor shenao1995 en el contexto del proyecto RadGS-Reg, presentado en MICCAI 2025. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una red neuronal convolucional sobre nubes de puntos que estima la transformación rígida (matriz moving-to-fixed) entre una vértebra en movimiento y una reconstrucción de referencia, dentro de un pipeline de imagen médica basado en Gaussian Splatting. El checkpoint publicado corresponde a la época 168 de un entrenamiento conjunto alternado de 200 épocas, seleccionado por validación.

La arquitectura propia, denominada `point_residual34`, emplea codificación residual local de puntos con profundidades de etapa [3, 4, 6, 3]; el autor especifica explícitamente que no es el modelo oficial PointNeXt ni un ResNet de vóxeles. El modelo opera sobre 2048 puntos de superficie por entrada, extraídos con un umbral de atenuación de 0,005, y trabaja sobre un lienzo de entrada de 192³ a 1 mm de resolución, en un marco RAS-mm centrado compartido entre ambas entradas.

La relevancia del modelo es acotada y muy específica: sirve para reproducir y reutilizar el componente de registro del pipeline RadGS-Reg en investigación sobre datos vertebrares simulados. La licencia es de términos de investigación upstream, sin concesión de derechos más amplios, y el modelo no está pensado para uso clínico ni comercial. El repositorio ocupa 1,0 GB y acumula 28 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `point_residual34`, codificación residual local de puntos con profundidades de etapa [3, 4, 6, 3] (CNN sobre nubes de puntos; no es PointNeXt ni ResNet de vóxeles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 2048 puntos de superficie por muestra y lienzo de 192³ a 1 mm |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen médica, no lingüístico) |
| Licencia | `other` / `upstream-research-terms` (términos de investigación upstream; ver `LICENSE_NOTICE.md`) |
| Formato de pesos | PyTorch (`.pth`: `regm_best.pth`, `joint_best.pth`); código fuente en `source.tar.gz` |
| Librería | PyTorch |
| Tamaño del repositorio | 1,0 GB |
| Checkpoint publicado | época 168 (seleccionada por validación) de un entrenamiento conjunto de 200 épocas |
| Marco de coordenadas | RAS-mm centrado; matriz de salida moving-to-fixed |
| Umbral de extracción de puntos | 0,005 de atenuación |

## Arquitectura y entrenamiento

El modelo es una red convolucional sobre nubes de puntos con arquitectura propia `point_residual34`, que combina codificación residual local de puntos con cuatro etapas de profundidades [3, 4, 6, 3]. El autor aclara de forma explícita que no se trata del modelo oficial PointNeXt ni de un ResNet de vóxeles, lo que implica que las comparaciones directas con esas arquitecturas no son válidas sin reentrenamiento. La entrada son 2048 puntos de superficie por volumen, extraídos a un umbral de atenuación de 0,005, sobre un lienzo de 192³ a 1 mm de resolución; no se aplica centrado independiente de la nube ni normalización por máximo por imagen.

El entrenamiento consistió en un ciclo conjunto alternado de 200 épocas que empareja el módulo de reconstrucción (RecM) y el de registro (RegM). El checkpoint publicado es la época 168, seleccionada minimizando el máximo error medio por eje más una penalización de SSIM de volumen completo; el autor indica que no se seleccionó por mTRE mínimo, y que la época 200 final tiene un mTRE de validación ligeramente inferior pero peor puntuación de selección. Toda la selección se hizo exclusivamente sobre validación. No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni sobre si se emplearon técnicas de RLHF o DPO, que en este dominio no aplican.

## Capacidades

- Registro rígido 3D de vértebras individuales: estima una matriz de transformación moving-to-fixed aplicable como remuestreo físico rígido.
- Procesamiento de nubes de puntos de superficie derivadas de volúmenes CT, con 2048 puntos por entrada.
- Inferencia end-to-end junto al módulo RecM mediante el checkpoint conjunto `joint_best.pth`.
- Inferencia de registro aislado sobre nuevos volúmenes NIfTI con coordenadas físicas iniciales y unidades de atenuación compatibles, mediante `Reg3D_infer.py`.
- Evaluación con métricas de registro (MAE de traslación y rotación por eje, error geodésico de rotación, mTRE) y de reconstrucción (SSIM 3D de foreground y de volumen completo).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Reproducción de resultados del paper RadGS-Reg (MICCAI 2025): cargar `joint_best.pth` con `joint_infer.py` sobre el dataset `shenao1995/RadGS-Reg-Test` y replicar las métricas emparejadas de validación publicadas.
- Registro de vértebras en pipelines de investigación con Gaussian Splatting: usar el modelo como etapa de alineación rígida entre una vértebra en movimiento y una reconstrucción generada por RecM, aprovechando que ambos módulos comparten marco RAS-mm centrado.
- Alineación de volúmenes NIfTI en estudios de variabilidad anatómica: aplicar `Reg3D_infer.py` con un volumen en movimiento y una reconstrucción fija para obtener la matriz de transformación y remuestrear físicamente la imagen.
- Evaluación comparativa de métodos de registro vertebral: emplear las métricas de validación publicadas (mTRE de 0,8379 mm, 97,22 % de vértebras con mTRE < 2 mm) como referencia para contrastar otros registradores sobre el mismo protocolo.
- Análisis de casos límite en investigación: los registros por caso incluidos en el release permiten estudiar los fallos, dado que el mTRE máximo de validación alcanza aproximadamente 13,1 mm pese a la buena media.
- Docencia y experimentación en imagen médica: el snapshot de código fuente incluido (`source.tar.gz`) permite reconstruir el entorno exacto de entrenamiento e inferencia sin depender de versiones externas del repositorio.

## Benchmarks y rendimiento

Reevaluación independiente en una sola GPU del par emparejado de época 168, sobre validación (431 vértebras). El autor advierte que son métricas de validación, no de test, y que las vértebras de un mismo CT están correlacionadas.

| Métrica | Valor |
|---|---:|
| MAE de traslación x / y / z | 0,3436 / 0,3789 / 0,3481 mm |
| MAE de rotación x / y / z | 0,5041 / 0,4327 / 0,9042 grados |
| Error geodésico de rotación | 1,2732 grados |
| mTRE | 0,8379 mm |
| mTRE < 2 mm | 97,22 % |
| SSIM 3D de foreground de reconstrucción | 0,810430 |
| SSIM 3D de volumen completo de reconstrucción | 0,953842 |
| mTRE máximo de validación | ~13,1 mm |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de validación del propio modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,0 GB y la entrada es un lienzo de 192³ a 1 mm con 2048 puntos, lo que sugiere requisitos moderados, pero no se confirma.
- GPU recomendadas: no disponible; el autor menciona reevaluación en una sola GPU sin especificar modelo.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: inferencia mediante los scripts del snapshot de código (`joint_infer.py` y `Reg3D_infer.py`) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros registradores vertebrales ni con arquitecturas de nubes de puntos como PointNeXt, y el autor advierte explícitamente que su arquitectura no es equivalente a estas, por lo que una comparación directa requeriría reentrenamiento.

## Limitaciones y advertencias

- Licencia de términos de investigación upstream: no se concede ningún derecho más amplio que los términos originales; uso previsto únicamente en investigación sobre datos vertebrares simulados.
- No apto para uso clínico ni para producción comercial según los términos de licencia publicados.
- Las métricas publicadas son de validación, no de test, y las vértebras de un mismo CT están correlacionadas; los errores medios no implican que todos los casos cumplan los umbrales.
- El mTRE máximo de validación es de aproximadamente 13,1 mm, muy superior a la media, lo que indica casos de fallo claros.
- El checkpoint no se seleccionó por mTRE mínimo; la época 200 tiene mejor mTRE de validación pero peor puntuación de selección.
- El RecM independiente de su repositorio propio es la época 174 y no debe sustituirse en el par de época 168 atribuyéndole estos resultados, que corresponden a una combinación no evaluada.
- Los resultados emplean reconstrucción RecM en línea, no las cachés de reconstrucción congeladas antiguas; comparaciones con resultados previos basados en cachés no son equivalentes.
- Requiere entradas con coordenadas físicas iniciales coincidentes y unidades de atenuación compatibles; el lienzo entrenado es 192³ a 1 mm, no la resolución antigua de 96³/2 mm.
- Riesgo de alucinación y sesgos lingüísticos: no aplica; el modelo no genera texto.
- Sin información sobre sesgos demográficos o anatómicos del dataset de entrenamiento más allá de la cita obligada a CTSpine1K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shenao1995/RadGS-Reg-RegM
- Checkpoint RecM emparejado: https://huggingface.co/shenao1995/RadGS-Reg-RecM
- Dataset de test: https://huggingface.co/datasets/shenao1995/RadGS-Reg-Test
- Código: https://github.com/shenao1995/RadGS_Reg
- Página del proyecto: https://shenao1995.github.io/RadGS-Reg-Homepage/
- Paper (MICCAI 2025): https://doi.org/10.1007/978-3-032-05114-1_44
- Aviso de licencia: https://huggingface.co/shenao1995/RadGS-Reg-RegM/blob/main/LICENSE_NOTICE.md
