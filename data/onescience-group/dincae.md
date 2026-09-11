# OneScience-Group/DINCAE

## Resumen

DINCAE es un modelo de reconstrucción de temperatura superficial del mar (SST) basado en un autoencoder convolucional probabilístico. Lo publica OneScience-Group como reproducción de ingeniería independiente de las especificaciones públicas del método DINCAE 1.0, propuesto originalmente por equipos de la Universidad de Lieja y el Instituto Nacional de Biología de Eslovenia. Su objetivo es rellenar los huecos que la nubosidad deja en las observaciones satelitales diarias y, de forma conjunta, estimar la varianza del error de reconstrucción píxel a píxel.

No es un modelo de lenguaje: opera sobre rejillas geoespaciales. En la configuración del paper, cada muestra combina observaciones de SST del día actual, del día anterior y del siguiente, junto con precisión de la observación, coordenadas y variables estacionales, sobre una rejilla de 112×112 píxeles. El método se entrenó y validó con datos AVHRR Pathfinder diarios de 1985 a 2009, con 5.266 pasos temporales.

Es relevante porque los productos de SST por satélite mantienen huecos sistemáticos por nubosidad, y este repositorio permite reproducir el pipeline completo (datos, entrenamiento, inferencia, evaluación y visualización) en entornos OneCode o ModelScope, incluyendo entrenamiento multi-GPU. Conviene subrayar que no se incluyen pesos preentrenados oficiales: solo scripts y una configuración a escala reducida destinada a validación de ingeniería.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional probabilístico (encoder-decoder CNN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de rejilla espacial de 112×112 píxeles en la configuración del paper, con observaciones del día actual, anterior y siguiente |
| Tipos de cuantización | no disponible (el repositorio solo documenta checkpoints PyTorch sin cuantizar) |
| Idiomas soportados | no aplica; los datos son geoespaciales y la documentación está en inglés (tag `en`) |
| Licencia | Apache-2.0 para el repositorio; el paper y los datos AVHRR quedan sujetos a sus propias licencias y términos |
| Formato de pesos | checkpoint PyTorch (`.pt`) generado localmente; el repositorio no incluye pesos preentrenados |

## Arquitectura y entrenamiento

El modelo es un autoencoder convolucional que recibe como entrada las observaciones de SST de tres días consecutivos, la precisión de la medida, las coordenadas y variables estacionales, y devuelve de forma conjunta la media reconstruida y la varianza del error por píxel. El entrenamiento utiliza máscaras de nubes aleatorias y una función de pérdida de verosimilitud gaussiana negativa enmascarada (*masked Gaussian NLL*), lo que permite optimizar simultáneamente la reconstrucción y la calibración de la incertidumbre.

La configuración por defecto del repositorio reduce el tamaño de rejilla, el número de muestras, el ancho de las convoluciones, el tamaño del cuello de botella (*bottleneck*) y las épocas, mientras que la configuración a escala del paper (`paper_model`) conserva los 112×112 píxeles y los hiperparámetros originales. Los datos del paper contienen 5.266 pasos temporales diarios de AVHRR SST de 112×112. El repositorio no documenta fases de RLHF ni DPO, que no aplican a este tipo de modelo. El entrenamiento distribuido se realiza con `torchrun`, con un ejemplo de 8 procesos por nodo. Los artefactos se guardan en `result/checkpoints/dincae.pt` y `result/training/metrics.json`.

## Capacidades

- Reconstrucción de SST diaria en píxeles oscurecidos por nubes a partir de observaciones del día actual, del anterior y del siguiente.
- Estimación probabilística de la incertidumbre: salida conjunta de la media reconstruida y de la varianza del error por píxel.
- Entrada multimodal estructurada: SST, precisión de la observación, coordenadas y variables estacionales.
- Entrenamiento distribuido multi-GPU y multi-nodo mediante `torchrun`.
- Evaluación integrada con métricas de RMSE, RMSE centrado (CRMSE), sesgo, calibración de residuos estandarizados y una línea base iterativa tipo DINEOF de rango 13.
- Generación de datos sintéticos estructurados (32×32) para validación de conectividad en CPU.
- Exportación de resultados de inferencia en `predictions.npz` con medias, varianzas, objetivos, máscaras de datos ausentes y fechas.
- Soporte de *tool calling* o *function calling*: no aplica.
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo de razonamiento (*thinking*), visión o audio: no aplica.

## Casos de uso

- Reconstrucción de series temporales diarias de SST: el modelo permite rellenar los huecos por nubosidad en productos AVHRR y obtener series continuas aptas para análisis climático, usando la ventana de tres días como contexto de entrada.
- Asimilación en modelos oceanográficos: las SST reconstruidas y su varianza asociada pueden alimentar esquemas de asimilación de datos o servir para inicializar simulaciones regionales, ya que la incertidumbre por píxel permite ponderar la confianza de cada observación.
- Control de calidad de productos satelitales: la varianza estimada por píxel sirve como indicador para descartar reconstrucciones poco fiables o marcar regiones que requieren inspección manual.
- Comparación con métodos clásicos de interpolación: el repositorio incluye una línea base iterativa tipo DINEOF de rango 13, de modo que el modelo puede emplearse para medir la mejora frente a métodos estadísticos tradicionales en el mismo conjunto de datos.
- Validación de infraestructura de cómputo científico: el script de entrenamiento distribuido con `torchrun` permite comprobar el funcionamiento de clústeres con GPU o DCU (DTK 25.04.2 o superior), incluyendo el flujo de checkpoints.
- Pruebas de integración continua con datos sintéticos: la configuración por defecto de 8 pasos de 32×32 se ejecuta en CPU y valida extremo a extremo la carga de datos, el entrenamiento, la inferencia y la evaluación sin necesidad de GPU.
- Docencia y reproducción de resultados: al ser una reproducción de ingeniería de especificaciones públicas, sirve como material para estudiar autoencoders probabilísticos aplicados a teledetección y para reproducir el flujo del paper a escala completa si se dispone de los datos AVHRR.
- Análisis de calibración de incertidumbre: los residuos estandarizados calculados en la fase de evaluación permiten estudiar si las varianzas predichas están bien calibradas en distintos regímenes de nubosidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe las métricas que calcula el script de evaluación (RMSE, CRMSE, sesgo, calibración de residuos estandarizados y comparación con una línea base tipo DINEOF de rango 13), pero no proporciona cifras. Además, el propio repositorio advierte que las métricas obtenidas con datos sintéticos solo demuestran conectividad del pipeline y no constituyen resultados del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la documentación solo indica que se recomienda GPU o DCU, sin modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- CPU: admite la configuración pequeña por defecto (8 pasos estructurados de 32×32) para validación de conectividad.
- DCU: requiere instalar DTK con antelación; se recomienda DTK 25.04.2 o superior, o la versión recomendada por OneScience para el clúster en uso.
- Entrenamiento multi-GPU: `torchrun --nproc_per_node=8 --nnodes=1 --rdzv_id=1000 --rdzv_backend=c10d --max_restarts=0 --master_addr="localhost" --master_port=29500 scripts/train.py`.
- Opciones de despliegue: scripts PyTorch del propio repositorio (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`); vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DINCAE (OneScience-Group) | Autoencoder convolucional probabilístico | no disponible | Rejilla 112×112 con tres días de observaciones | Sin cifras publicadas en la información disponible | Apache-2.0 (repositorio) | Código en HuggingFace, sin pesos preentrenados |
| DINCAE 1.0 (paper original) | Autoencoder convolucional probabilístico | no disponible | Rejilla 112×112 sobre AVHRR Pathfinder 1985-2009 | Resultados en el paper (no incluidos aquí) | Sujeta a los términos de la publicación | Publicación científica; sin pesos cargables oficiales según la model card |
| Línea base DINEOF (rango 13) | Interpolación iterativa por modos empíricos | no aplica (método no paramétrico) | Serie espacio-temporal completa | Usada como referencia en el script de evaluación del repositorio | No especificada en la información disponible | Implementada como baseline dentro del propio repositorio |

No se dispone de información sobre otros modelos comparables en la documentación facilitada.

## Limitaciones y advertencias

- El repositorio no incluye pesos preentrenados oficiales ni una carpeta `weight/`; cualquier checkpoint local (`result/checkpoints/dincae.pt`) no debe presentarse como peso oficial del paper.
- Para reproducir los resultados del paper es necesario disponer del conjunto completo de datos AVHRR y ejecutar el entrenamiento a escala del paper; la configuración por defecto es una reducción pensada solo para validación de ingeniería.
- Los datos sintéticos incluidos no representan la distribución real de AVHRR, ni la escala de entrenamiento, ni el rendimiento del paper; las métricas obtenidas con ellos no son extrapolables.
- No se documenta el número de parámetros ni requisitos de VRAM, lo que dificulta planificar el despliegue en producción.
- La reconstrucción es estadística: puede suavizar estructuras de pequeña escala y depende de la calibración de la incertidumbre aprendida durante el entrenamiento.
- La licencia Apache-2.0 cubre el repositorio, pero el uso de los datos AVHRR y del contenido del paper queda sujeto a sus propias licencias y términos.
- Aunque el repositorio indica que el uso de código, pesos oficiales y datos está sujeto a las licencias de sus proyectos respectivos, no detalla restricciones adicionales de uso comercial más allá de Apache-2.0.
- La documentación está únicamente en inglés, lo que puede limitar su adopción en equipos hispanohablantes.
- No se han publicado cifras de benchmarks en la información disponible, por lo que no es posible comparar su rendimiento real con alternativas sin ejecutar la evaluación por cuenta propia.
- Se trata de una reproducción independiente de ingeniería, no de una publicación oficial de los autores originales del método.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/DINCAE
- Paper DINCAE 1.0: https://doi.org/10.5194/gmd-13-1609-2020
- OneCode (entorno de programación AI4S): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneSkills en GitHub: https://github.com/onescience-ai/oneskills
