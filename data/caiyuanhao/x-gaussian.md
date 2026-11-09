# CaiYuanhao/X-Gaussian

## Resumen

X-Gaussian es un método de reconstrucción y síntesis de vistas novedosas para imagen médica basado en 3D Gaussian Splatting adaptado a rayos X. Lo desarrolla Yuanhao Cai (Johns Hopkins University) y se presentó en ECCV 2024 bajo el título "Radiative Gaussian Splatting for Efficient X-ray Novel View Synthesis". No es un modelo de lenguaje: es un campo de radiancia gaussiano que modela la atenuación de rayos X mediante gaussianas 3D con atributos radiativos, permitiendo renderizar proyecciones 2D desde ángulos arbitrarios y reconstruir directamente un volumen CT a partir de pocas proyecciones.

El repositorio de Hugging Face contiene cinco checkpoints entrenados, uno por escena anatómica (Chest, Abdomen, Foot, Head y Pancreas), todos en la iteración 31.000. Cada checkpoint es un fichero PLY con la nube de gaussianas y los metadatos del decodificador y la geometría del escáner. La relevancia actual radica en que reduce drásticamente el número de proyecciones necesarias (50 frente a las cientos o miles de una reconstrucción CT convencional), lo que implica menor dosis de radiación para el paciente y menor tiempo de adquisición.

La implementación es específica por escena: un modelo entrenado para un paciente/región no generaliza a otra anatomía ni a otra geometría de escáner. Reconstruir una escena nueva exige reentrenar desde sus proyecciones y su configuración de adquisición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D Gaussian Splatting radiativo (campo de gaussianas 3D con decodificador de atenuación para rayos X) |
| Parametros totales | no disponible (no es un modelo neuronal con parámetros en el sentido habitual; el estado es una nube de gaussianas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el formato de salida es PLY en coma flotante) |
| Idiomas soportados | no aplica (modelo de imagen médica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PLY (point cloud con 62 columnas por punto, más metadatos globales de decodificador y geometría) |

## Arquitectura y entrenamiento

X-Gaussian representa la atenuación de rayos X con gaussianas 3D anisótropas, cada una con posición, covarianza, opacidad y coeficientes radiativos. El renderizado proyecta estas gaussianas sobre el plano del detector siguiendo la geometría del escáner (cono o haz paralelo según configuración), y un decodificador transforma la densidad acumulada en intensidad de rayos X. El modelo se entrena conjuntamente con pérdida de proyección 2D, variación total 3D y consistencia de rayos de volumen, lo que permite obtener simultáneamente síntesis de vistas 2D y un volumen CT 3D.

Cada checkpoint se entrenó a partir de 50 proyecciones de rayos X a la resolución original del dataset, con inicialización FDK solo con datos de entrenamiento, 30.000 pasos base y 1.000 pasos adicionales de refinamiento por rayos de volumen. Los volúmenes CT de referencia se usaron exclusivamente para evaluación, nunca para entrenamiento. El número de gaussianas varía por escena: 500.000 (Chest), 59.756 (Abdomen), 77.682 (Foot), 116.013 (Head) y 244.511 (Pancreas).

## Capacidades

- Síntesis de vistas novedosas de rayos X 2D desde ángulos no observados durante el entrenamiento.
- Reconstrucción directa de volumen CT 3D desde el mismo campo gaussiano, conservando los atributos por punto.
- Exportación de la nube de gaussianas en PLY con 62 columnas por punto para análisis o procesado externo.
- Renderizado 2D condicionado a la geometría de cámara/escáner correspondiente a cada escena.
- Modelado de atenuación radiativa específico para imagen médica (no es un modelo de propósito general).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Reconstrucción CT con baja dosis: a partir de 50 proyecciones se obtiene un volumen 3D, reduciendo la radiación frente a una adquisición convencional con cientos de proyecciones.
- Síntesis de proyecciones intermedias: generar vistas 2D adicionales entre los ángulos adquiridos para aumentar la densidad angular sin nueva exposición.
- Investigación en imagen médica: banco de pruebas reproducible con cinco anatomías (tórax, abdomen, pie, cabeza, páncreas) y métricas 2D/3D publicadas.
- Evaluación de pipelines de reconstrucción: comparar métodos alternativos contra los checkpoints y métricas de referencia del repositorio.
- Visualización y análisis de volumen: exportar el PLY y procesar la nube de gaussianas en herramientas de visualización 3D para inspección anatómica.
- Docencia y prototipado: usar las escenas incluidas para experimentar con Gaussian Splatting aplicado a rayos X sin necesidad de adquirir datos propios.
- Desarrollo de métodos de inicialización: emplear la inicialización FDK y la configuración documentada como línea base para nuevas propuestas.

## Benchmarks y rendimiento

Resultados medidos sobre los checkpoints exactos alojados en el repositorio:

| Escena | Resolución CT | PSNR 2D (dB) | SSIM 2D | PSNR 3D (dB) | SSIM 3D |
|---|---|---:|---:|---:|---:|
| Chest | 128 × 128 × 128 | 47,21 | 0,9937 | 31,94 | 0,8895 |
| Abdomen | 512 × 512 × 463 | 48,16 | 0,9968 | 33,33 | 0,8917 |
| Foot | 256 × 256 (resto no disponible) | no disponible | no disponible | no disponible | no disponible |
| Head | no disponible | no disponible | no disponible | no disponible | no disponible |
| Pancreas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de las escenas Foot, Head y Pancreas ni de comparativas numéricas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del número de gaussianas (hasta 500.000 en Chest) y de la resolución de renderizado.
- GPU recomendadas: no disponible en la información proporcionada; el proyecto se distribuye con implementación PyTorch.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: scripts del repositorio oficial (`render.py`) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas numéricas con métodos alternativos de síntesis de vistas por rayos X o reconstrucción CT con Gaussian Splatting. La model card referencia el estado del arte en el paper de ECCV 2024, pero no se incluyen aquí cifras de modelos competidores.

| Modelo | Tipo | Escenas | Licencia | Disponibilidad |
|---|---|---|---|---|
| X-Gaussian | Gaussian Splatting radiativo | 5 (Chest, Abdomen, Foot, Head, Pancreas) | Apache 2.0 | Pesos en Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los checkpoints son específicos por escena: no generalizan a otra anatomía ni a otra geometría de escáner; requieren reentrenamiento.
- El renderizado 2D necesita la geometría de cámara correspondiente; el PLY por sí solo no basta para síntesis de vistas.
- Uso clínico no validado: son resultados de investigación (ECCV 2024), no un dispositivo médico; no deben emplearse para diagnóstico sin validación regulatoria.
- Riesgo de artefactos en reconstrucción 3D con pocas proyecciones; las métricas 3D (PSNR ~32-33 dB) son inferiores a las 2D.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; madurez de la comunidad limitada.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso médico recae en el implementador.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones ni diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaiYuanhao/X-Gaussian
- Dataset: https://huggingface.co/datasets/CaiYuanhao/X-Gaussian
- Paper (arXiv): https://arxiv.org/abs/2403.04116
- Código: https://github.com/caiyuanhao1998/X-Gaussian
- Interpretación en Zhihu: https://zhuanlan.zhihu.com/p/717744222
- Vídeo: https://www.youtube.com/watch?v=v6FESb3SkJg
- Cobertura en Radiance Fields: https://radiancefields.com/x-gaussian-radiance-meets-radiation
