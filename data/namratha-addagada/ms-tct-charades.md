# namratha-addagada/ms-tct-charades

## Resumen

MS-TCT es un modelo de detección temporal de acciones (temporal action detection) en vídeo, publicado en el repositorio de Hugging Face `namratha-addagada/ms-tct-charades`. Se trata de una implementación del método MS-TCT propuesto por Dai et al. en CVPR 2022, entrenada específicamente sobre un subconjunto del conjunto de datos Charades con 157 clases de acciones. El autor del repositorio es `namratha-addagada` y la licencia declarada es MIT.

El modelo no procesa píxeles directamente: trabaja sobre características RGB preextraídas de Charades de 4096 dimensiones, con 6 snippets por segundo y ventanas de 128 snippets. La tarea consiste en localizar en el tiempo los instantes de inicio y fin de cada acción y clasificarla entre las 157 categorías disponibles.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con 0 descargas y 1 like en el momento de la consulta, con un rendimiento modesto (10,9 % de mAP a nivel de fotograma sobre 300 vídeos de validación) y sin model card extendida más allá de los datos de entrenamiento y evaluación. No es un modelo de lenguaje ni un modelo multimodal generalista, sino un detector de acciones específico de un dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MS-TCT (multi-scale temporal transformer, Dai et al., CVPR 2022) para detección temporal de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 128 snippets (a 6 snippets/s, aproximadamente 21,3 s por ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,2 GB; no se especifica safetensors, GGUF ni checkpoint PyTorch) |

## Arquitectura y entrenamiento

MS-TCT es un transformer temporal multi-escala diseñado para detección de acciones en vídeo. El modelo recibe características RGB de 4096 dimensiones extraídas previamente de Charades, muestreadas a 6 snippets por segundo, y opera sobre ventanas de 128 snippets. La arquitectura combina módulos de agregación temporal a varias escalas para capturar acciones de distinta duración y una cabeza de clasificación y regresión de límites temporales sobre las 157 clases de Charades. No se dispone de información sobre el número de parámetros ni sobre detalles internos de las capas en la información proporcionada.

El entrenamiento se realizó sobre 1.500 vídeos del split oficial de entrenamiento de Charades y se validó sobre 300 vídeos del split oficial de test. La mejor época fue la 11. El autor reporta un mAP a nivel de fotograma del 10,9 % sobre esos 300 vídeos de validación, frente al 4,84 % de una línea base entrenada con solo 93 vídeos evaluada sobre los mismos vídeos. No se indica el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión. Tampoco se documentan aumentos de datos, función de pérdida ni hiperparámetros de entrenamiento.

## Capacidades

- Detección temporal de acciones en vídeo: localización de inicio y fin de acciones y clasificación entre 157 clases de Charades.
- Procesamiento de características RGB preextraídas de 4096 dimensiones (no acepta vídeo en bruto ni píxeles directamente).
- Operación sobre ventanas de 128 snippets con muestreo de 6 snippets por segundo.
- Modelado multi-escala de acciones de duración variable gracias a la arquitectura MS-TCT.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la clasificación de acciones sobre features de vídeo.

## Casos de uso

- Investigación en detección temporal de acciones: sirve como checkpoint de referencia para reproducir o comparar el método MS-TCT sobre Charades con un protocolo de entrenamiento concreto (1.500 vídeos de train, 300 de test).
- Anotación asistida de vídeo: el modelo puede proponer segmentos candidatos con etiqueta de acción sobre features de Charades, que un anotador humano revisa y corrige, reduciendo el coste de etiquetado en pipelines de datos de vídeo.
- Análisis de actividades cotidianas en entornos controlados: al estar entrenado sobre Charades (acciones domésticas y de interior), puede emplearse para indexar y buscar eventos en grabaciones de interior con características compatibles.
- Línea base para experimentos de aumento de datos: el autor compara el rendimiento con un modelo entrenado con solo 93 vídeos (4,84 % de mAP), por lo que este checkpoint sirve para estudiar el efecto del volumen de datos de entrenamiento en MS-TCT.
- Evaluación de extractores de características: al consumir features RGB de 4096 dimensiones, permite medir cómo distintos extractores de características afectan al mAP de detección temporal.
- Docencia y experimentación académica: es un ejemplo reproducible de arquitectura transformer multi-escala para detección temporal, con código original disponible en GitHub y licencia MIT para uso educativo.
- Prototipado de sistemas de vigilancia o monitorización de actividades: con las cautelas de sesgo y rendimiento indicadas, puede integrarse en un prototipo que detecte acciones concretas en secuencias de vídeo preprocesadas.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| mAP a nivel de fotograma | 10,9 % | 300 vídeos del split oficial de test de Charades |
| mAP a nivel de fotograma (línea base, 93 vídeos de entrenamiento) | 4,84 % | mismos 300 vídeos |
| Mejor época | 11 | — |

No se han publicado otros resultados de benchmarks (mAP con umbrales IoU, precisión/recall por clase, comparación con el paper original) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 0,2 GB, pero no se especifica el tamaño de los pesos ni el consumo en memoria.
- GPU recomendadas: no disponibles. Al operar sobre features de 4096 dimensiones y ventanas de 128 snippets, la carga es muy inferior a la de un modelo de vídeo end-to-end, pero no se aportan medidas.
- Compatibilidad con GPU de consumo: probablemente sí para inferencia sobre features preextraídas, aunque no se confirma en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El despliegue previsible es mediante el código original de MS-TCT en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MS-TCT (este checkpoint) | Detección temporal de acciones sobre features | no disponible | 128 snippets a 6 snippets/s | 10,9 % mAP fotograma en 300 vídeos de Charades | MIT | Hugging Face (0 descargas) |
| MS-TCT original (Dai et al., CVPR 2022) | Detección temporal de acciones sobre features | no disponible | Configurable según paper | No disponible en la información proporcionada | No disponible | Código en GitHub |
| Línea base del autor (93 vídeos) | MS-TCT con menos datos | no disponible | 128 snippets | 4,84 % mAP fotograma en los mismos 300 vídeos | MIT (mismo repo) | No publicada como checkpoint independiente |

No se dispone de datos suficientes para comparar con alternativas como ActionFormer, TriDet o TadTR en las mismas condiciones; se indica "no disponible".

## Limitaciones y advertencias

- Rendimiento bajo: 10,9 % de mAP a nivel de fotograma sobre 300 vídeos de validación es un resultado modesto para detección temporal de acciones y limita su uso en producción sin un ajuste adicional.
- Dependencia de features preextraídas: solo acepta características RGB de 4096 dimensiones de Charades; no procesa vídeo en bruto, lo que restringe su aplicabilidad a otros datasets o extractores sin reentrenamiento.
- Dominio restringido: entrenado exclusivamente sobre Charades (acciones domésticas de interior, 157 clases); el rendimiento fuera de ese dominio no está caracterizado.
- Sesgos: no documentados por el autor; cabe esperar sesgos derivados de la composición de Charades (escenas, personas y actividades representadas).
- Riesgo de falsos positivos y negativos: no se aportan métricas de precisión/recall por clase ni curvas PR, por lo que no se puede acotar el riesgo de error por categoría.
- Idiomas: no aplica ni se documenta; el modelo no procesa texto.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset Charades y de las features utilizadas.
- Documentación escasa: la model card no detalla pesos, hiperparámetros, formato de checkpoint ni instrucciones de uso, lo que dificulta la reproducibilidad.
- Madurez: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento activo.

## Enlaces

- Hugging Face: https://huggingface.co/namratha-addagada/ms-tct-charades
- Código original de MS-TCT: https://github.com/dairui01/MS-TCT
- Paper de referencia (Dai et al., CVPR 2022): no disponible como enlace en la información proporcionada
- Dataset Charades: no disponible como enlace en la información proporcionada
