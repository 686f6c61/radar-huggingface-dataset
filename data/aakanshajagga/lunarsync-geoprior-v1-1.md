# aakanshajagga/lunarsync-geoprior-v1-1

## Resumen

LunarSync GeoPrior v1.1 es un modelo de correspondencia de imágenes lunares desarrollado por aakanshajagga, entrenado en la nube de Kaggle, y diseñado específicamente para alinear imágenes del sensor OHRC (Orbiter High Resolution Camera) de la misión Chandrayaan-2 de ISRO. El modelo resuelve el problema de encontrar correspondencias punto a punto entre adquisiciones OHRC superpuestas, un paso crítico para la generación de mosaicos, modelos digitales de elevación y análisis de cambios en la superficie lunar. Su enfoque combina un prior geométrico polinomial de grado 9, derivado de los metadatos PDS (Planetary Data System), con un checkpoint aprendido basado en una arquitectura derivada de EfficientLoFTR para refinamiento opcional.

El modelo es relevante porque valida un modo de producción híbrido: la correspondencia se calcula primero mediante geometría (píxel fuente → coordenada lunar → píxel destino), y solo opcionalmente se refina con el componente aprendido. El modo solo-imagen fue rechazado por no superar la validación con productos disjuntos. Con 16,7 millones de parámetros, es un modelo compacto y especializado, no un modelo generalista. La licencia es "other" (no estándar), y el repositorio incluye código personalizado que requiere `trust_remote_code=True` para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid: prior geométrico polinomial (grado 9) + red derivada de EfficientLoFTR |
| Parametros totales | 16.713.426 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en fp32 o fp16 no especificados) |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de lenguaje) |
| Licencia | other (no estándar; sujeto a la política de datos de ISRO) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina dos componentes. El primero es un prior geométrico: un polinomio de grado 9 que mapea coordenadas de píxel de una imagen OHRC a coordenadas lunares y de vuelta a la imagen destino, utilizando los metadatos PDS de cada producto. Este prior fue seleccionado tras un barrido de grados 3 a 9, siendo el grado 9 el que mejor rendimiento ofreció. El segundo componente es un checkpoint aprendido derivado de EfficientLoFTR, una arquitectura transformer para correspondencia densa de imágenes, que se usa como refinamiento opcional. Los coeficientes del polinomio se almacenan en `geoprior_coefficients.npz` y el código de geometría en `geometry_prior.py`.

El entrenamiento y la evaluación se realizaron íntegramente en computación en la nube de Kaggle, utilizando imágenes y geometría de productos OHRC distribuidos bajo la política de datos aplicable de ISRO. No se especifican el número de tokens (imágenes) ni el tipo de supervisión (si hubo RLHF o DPO, no aplica aquí). El modo de solo imagen fue probado pero rechazado porque no pasó la validación con productos disjuntos, por lo que el modo validado en producción es exclusivamente el basado en geometría con refinamiento aprendido opcional.

## Capacidades

- Correspondencia de puntos clave entre imágenes OHRC de Chandrayaan-2 usando metadatos PDS y un prior polinomial.
- Refinamiento local opcional mediante un checkpoint aprendido derivado de EfficientLoFTR.
- Validado en siete adquisiciones OHRC independientes a resolución completa, con cinco pliegues espaciales disjuntos (checkerboard).
- Precisión subpixel: mediana de medianas por pliegue de 0,412 píxeles, p95 medio de 0,780 píxeles.
- PCK (Percentage of Correct Keypoints) medio del 99,773 % a 1 píxel y 100 % a 2 píxeles.
- Restringido a los identificadores de producto OHRC listados en `geoprior_products.json`; fuera de ese conjunto, el modelo no ofrece garantías.
- No es un modelo de lenguaje ni de visión general; no admite tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Generación de mosaicos lunares a partir de múltiples adquisiciones OHRC superpuestas: el modelo proporciona correspondencias subpixel que permiten fusionar imágenes con errores de alineación inferiores a 0,5 píxeles.
- Construcción de modelos digitales de elevación (DEM) por estereofotogrametría: las correspondencias precisas entre pares estéreo OHRC son esenciales para triangular alturas con exactitud.
- Detección de cambios superficiales: alinear imágenes de la misma región tomadas en diferentes pasadas permite comparar cráteres, deslizamientos o depósitos con confianza métrica.
- Georreferenciación de productos OHRC: el prior geométrico convierte coordenadas de imagen en coordenadas lunares usando los metadatos PDS, facilitando la integración en sistemas de información geográfica planetarios.
- Investigación científica en selenología: los investigadores pueden usar las correspondencias para estudiar la topografía y morfología de regiones específicas sin necesidad de implementar flujos ópticos complejos.
- Validación de pipelines de procesamiento de imágenes planetarias: al ser un modelo con métricas de precisión publicadas, puede servir como referencia para evaluar otros algoritmos de correspondencia en datos OHRC.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación, obtenidos con siete adquisiciones OHRC independientes, cinco pliegues espaciales disjuntos y 348.365 evaluaciones de control fuera del conjunto de entrenamiento:

| Metrica | Valor |
|---|---|
| Mediana de medianas por pliegue (error en px) | 0,412 |
| Media del percentil 95 (px) | 0,780 |
| PCK@1 px (media) | 99,773 % |
| PCK@2 px (media) | 100 % |
| Modo solo-imagen | Rechazado (no pasó validación con productos disjuntos) |

No se han publicado resultados comparativos con otros modelos de correspondencia lunar en la información disponible. Los datos completos por pliegue, ablaciones y el resultado rechazado del modo solo-imagen se encuentran en `evaluation_report.json`.

## Requisitos de hardware

- El modelo tiene 16,7 millones de parámetros, lo que en fp32 ocupa aproximadamente 67 MB y en fp16 unos 33 MB. Cabe sin problema en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA GTX 1660 hasta una RTX 4090. Para inferencia en lote sobre muchas imágenes, una RTX 3060 o superior es suficiente.
- Inferencia en CPU también es viable dado el tamaño, aunque la latencia será mayor para imágenes de alta resolución (OHRC produce imágenes de gran tamaño).
- Opciones de despliegue: el modelo se carga con `transformers` usando `trust_remote_code=True`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Para producción, se puede integrar en un script Python que procese pares de imágenes y sus metadatos PDS.
- Latencia y throughput no disponibles; dependen del tamaño de las imágenes de entrada y del hardware. Al ser un modelo compacto, se espera un rendimiento en tiempo real para imágenes de tamaño moderado en GPU.

## Comparativa con modelos similares

No se dispone de información sobre comparaciones directas con otros modelos de correspondencia lunar. En el ámbito general de correspondencia de imágenes, la arquitectura base EfficientLoFTR tiene versiones con 7,5M parámetros (LoFTR) o versiones más grandes, pero LunarSync GeoPrior v1.1 se distingue por su enfoque híbrido con prior geométrico y por estar especializado exclusivamente en datos OHRC de Chandrayaan-2. No hay modelos públicos comparables en la misma tarea con métricas publicadas en la información disponible.

## Limitaciones y advertencias

- No es un matcher de imágenes general: solo funciona con productos OHRC de Chandrayaan-2 incluidos en `geoprior_products.json` y con metadatos PDS válidos. Cualquier uso fuera de ese dominio está fuera de distribución y puede producir resultados erróneos.
- El modo solo-imagen fue rechazado explícitamente por no superar la validación con productos disjuntos; no debe utilizarse como respaldo sin verificar.
- El componente aprendido (derivado de EfficientLoFTR) se considera experimental y opcional; el camino validado es el geométrico.
- Riesgo de alucinación: no aplica al ser un modelo de visión, pero sí existe riesgo de correspondencias incorrectas si los metadatos PDS son imprecisos o si se usan imágenes de sensores o resoluciones no contempladas.
- La licencia "other" no es una licencia open source estándar; se debe revisar la política de datos de ISRO antes de cualquier uso comercial o redistribución.
- El repositorio incluye código personalizado (`custom-code`), lo que implica riesgos de seguridad al ejecutarlo; se recomienda auditar el código antes de usarlo en producción.
- No hay soporte multilingüe ni de texto; es un modelo puramente visual y geométrico.

## Enlaces

- HuggingFace: https://huggingface.co/aakanshajagga/lunarsync-geoprior-v1-1
- Repositorio relacionado (GeoPrior-v3, no directamente este modelo pero comparte nombre): https://github.com/earthai-tech/geoprior-v3
- Documentación de GeoPrior-v3: https://geoprior-v3.readthedocs.io/en/stable/index.html
- Paquete PyPI de GeoPrior-v3: https://pypi.org/project/geoprior-v3/
