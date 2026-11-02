# dnamodel/BREST-AI

## Resumen

BREST-AI es un modelo de clasificación de imágenes médicas desarrollado en la Universidad de Warwick, en colaboración con el NHS y otros socios académicos, que estima el riesgo de cáncer de mama a tres años a partir de una mamografía de cribado. No es un modelo de lenguaje: es una red convolucional que procesa cuatro vistas mamográficas (CC izquierda, CC derecha, MLO izquierda y MLO derecha) y devuelve un logit de riesgo a nivel de examen. Su relevancia radica en que ofrece una alternativa publicada y reproducible a modelos como Mirai del MIT, con evaluación retrospectiva en población del Reino Unido y métricas reportadas en un artículo revisado por pares.

La arquitectura se basa en un codificador ResNeXt-50 con fusión atencional de características, y la versión liberada es la v1 de 16 bits y cuatro vistas. El modelo se distribuye en formato `safetensors` con validación de checksum SHA-256, junto con el código de preprocesado DICOM y los scripts de inferencia en un repositorio de GitHub independiente.

El modelo está pensado exclusivamente para investigación académica y evaluación no comercial y no clínica. La licencia de la Universidad de Warwick restringe explícitamente el uso clínico y comercial, lo que condiciona cualquier despliegue en producción sanitaria sin un acuerdo de licencia adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 con fusión atencional de características (attentional feature fusion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos se publican en 16 bits |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | University of Warwick BREST software licence (warwick-brest-research-license); solo investigación académica y evaluación no comercial/no clínica |
| Formato de pesos | safetensors (tensores validados por arquitectura, con checksum SHA-256) |

## Arquitectura y entrenamiento

BREST-AI emplea un codificador convolucional ResNeXt-50 combinado con un mecanismo de fusión atencional de características que integra la información de las cuatro vistas mamográficas (CC y MLO de ambas mamas) en una única representación a nivel de examen. La entrada son imágenes PNG en escala de grises de 2048 × 2048 y 16 bits, generadas mediante un preprocesado DICOM documentado en el repositorio; en inferencia se normalizan los píxeles dividiendo por 65535, se replica el canal gris tres veces, se redimensiona a 1792 × 1792 con remuestreo bilineal antialias de Kornia y se normaliza con media 0,0856 y desviación típica 0,1687 por canal. El modelo no realiza flipping en inferencia: el volteo de la mama derecha forma parte del preprocesado DICOM.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de indicar que se entrenó con datos de investigación de acceso controlado obtenidos a través de sus custodios. La evaluación publicada es un estudio retrospectivo caso-control del Reino Unido con 7.596 mujeres (1.899 casos) usando equipos Hologic, complementado con evaluaciones externas en Siemens y en Estados Unidos. No se especifica en la información disponible si hubo ajuste fino con RLHF, DPO u otras técnicas de alineación, algo por otra parte poco habitual en modelos de clasificación de imagen médica.

## Capacidades

- Clasificación de riesgo: estima un logit de riesgo de cáncer de mama a tres años a nivel de examen a partir de cuatro vistas mamográficas.
- Procesamiento multivista: integra CC izquierda, CC derecha, MLO izquierda y MLO derecha en un único pase, con validación y ordenación de las vistas por parte del cargador.
- Preprocesado reproducible: incluye dos perfiles de renderizado (`paper-hologic` a 16 bits con Lanczos y `paper-siemens` a 8 bits expandido a uint16 con bilineal NumPy) con semilla de fondo fija de 42.
- Inferencia en GPU o CPU: selección automática de GPU cuando está disponible, con opción explícita `--device cpu`.
- Salida calibrable: el logit se transforma con sigmoide, pero requiere calibración poblacional para interpretarse como probabilidad absoluta a tres años.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un clasificador de imagen puro.

## Casos de uso

- Investigación en cribado de cáncer de mama: evaluación retrospectiva del modelo sobre cohortes poblacionales para comparar su capacidad discriminativa frente a modelos como Mirai, usando el AUC como métrica principal y con calibración poblacional previa.
- Estudios de estratificación de riesgo: uso del logit de riesgo a tres años como variable continua en análisis epidemiológicos, siempre que se recalibre sobre la población objetivo.
- Validación externa multi-fabricante: reproducción de las rutas Hologic y Siemens documentadas para estudiar la sensibilidad del modelo a diferencias de adquisición entre equipos.
- Reproducibilidad de resultados publicados: el repositorio permite regenerar las predicciones del artículo con los checksums de pesos y los entornos bloqueados (PyTorch 2.1.0 / CUDA 11.8, Kornia 0.7.1, Python 3.11 en Linux).
- Benchmarking de preprocesado: comparación del impacto del renderizado de 16 bits frente al de 8 bits expandido sobre el rendimiento del modelo en distintas cohortes.
- Docencia y formación en imagen médica: uso del pipeline completo (DICOM a PNG, carga de vistas, inferencia) como ejemplo reproducible de clasificación médica con validación de pesos.
- Desarrollo de herramientas de apoyo a la investigación: integración del script `patientLevel-inference.py` en flujos de análisis por lotes que generen CSV de predicciones a partir de metadatos de exámenes.

## Benchmarks y rendimiento

| Modelo | Cohorte | AUC (IC 95%) |
|---|---|---|
| BREST-AI v1 | Reino Unido, Hologic, retrospectivo, 7.596 mujeres (1.899 casos) | 0,751 (0,738–0,764) |
| Mirai (MIT) | misma cohorte | 0,700 (0,687–0,714) |

El artículo reporta además evaluaciones externas en Siemens y en Estados Unidos, pero los valores concretos no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa 0,4 GB, lo que sugiere un modelo compacto que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican modelos concretos; el entorno bloqueado apunta a CUDA 11.8 y PyTorch 2.1.0, compatible con tarjetas NVIDIA modernas (A100, H100, RTX 4090, RTX 3090, etc.).
- GPU de consumo: por el tamaño del repositorio (0,4 GB) y la arquitectura ResNeXt-50, es previsible que quepa en GPUs de consumo con suficiente memoria para tensores de 1792 × 1792, aunque no se publican cifras exactas.
- Despliegue: inferencia mediante el script `patientLevel-inference.py` del repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Contexto | AUC reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BREST-AI v1 | ResNeXt-50 + fusión atencional | 4 vistas mamográficas, 2048×2048, 16 bits | no aplica | 0,751 (UK Hologic) | Warwick BREST research licence (no comercial, no clínica) | Pesos en HuggingFace + código en GitHub |
| Mirai (MIT) | no disponible en la información | mamografías | no aplica | 0,700 (misma cohorte UK Hologic) | no disponible | no disponible |
| Otros modelos de riesgo mamográfico | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso restringido: la licencia de la Universidad de Warwick solo permite investigación académica y evaluación no comercial y no clínica; cualquier uso clínico o comercial requiere contacto con ventures@warwick.ac.uk.
- Sin garantía de privacidad diferencial: los controles a nivel de fichero no constituyen una garantía formal sobre los parámetros aprendidos, aunque se excluyen imágenes, metadatos de pacientes, predicciones y logs de entrenamiento.
- Calibración obligatoria: la salida es la sigmoide de un logit y no debe interpretarse como probabilidad absoluta a tres años sin calibración poblacional previa.
- Sensibilidad a la adquisición: el propio artículo advierte que las diferencias de adquisición pueden afectar al rendimiento; es necesario evaluar y recalibrar en la población objetivo.
- Interpretación errónea del score: el valor no es la probabilidad de que una resonancia magnética detecte un cáncer de forma inmediata.
- Dependencia del preprocesado: el rendimiento depende críticamente de reproducir el pipeline DICOM documentado (perfiles Hologic o Siemens, semilla 42, orden de vistas CC izq., CC der., MLO izq., MLO der.).
- Sesgos poblacionales: la evaluación principal es retrospectiva y del Reino Unido con equipos Hologic; no se detallan análisis de subgrupos por etnia, edad u otras variables.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no puede usarse para tareas de generación, razonamiento o agentes.
- Entorno de ejecución fijado: requiere Python 3.11 en Linux, PyTorch 2.1.0 / CUDA 11.8 y Kornia 0.7.1; desviarse de este entorno puede alterar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dnamodel/BREST-AI
- Artículo: Wei J, Zhou X, Santeramo R, et al. "BREST-AI: Three-year breast cancer risk prediction from screening mammograms". npj Breast Cancer (2026). https://doi.org/10.1038/s41523-026-01069-x
- Código y preprocesado: https://github.com/gmontana/BREST
- Licencia: fichero LICENSE en el repositorio del modelo (University of Warwick BREST software licence)
- Contacto comercial: ventures@warwick.ac.uk
- Contacto de investigación: g.montana@warwick.ac.uk
