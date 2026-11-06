# gbouras13/modernprost-pssm

## Resumen

ModernProst-PSSM es un modelo de extracción de características para proteínas desarrollado por gbouras13, orientado a la predicción de perfiles estructurales (3Di y 12 estados) a partir únicamente de la secuencia de aminoácidos. Estos perfiles son el formato que emplea Foldseek para realizar búsquedas de similitud estructural, de modo que el modelo permite aproximar el rendimiento de una búsqueda contra estructuras reales sin necesidad de disponer de la estructura tridimensional. La versión publicada es la base, con aproximadamente 1.041 millones de parámetros (1B) y un encoder de tipo ModernBERT de 36 capas.

El modelo se entrena por destilación: en lugar de aprender etiquetas discretas, minimiza la divergencia KL respecto a los perfiles diana generados por Foldseek sobre hits de AlphaFold DB 50. Por ello, la salida debe consumirse como distribuciones de probabilidad por residuo (softmax de las dos cabezas), no mediante argmax. La relevancia actual reside en que permite a pipelines de búsqueda de proteínas (por ejemplo, mediante phold-lib) construir bases de datos de perfiles Foldseek a partir de secuencias, con una calidad en SCOPe40 cercana a la de las estructuras reales.

El repositorio incluye además una cabeza opcional de predicción de pLDDT por residuo (338K parámetros) que se apoya en el backbone congelado, útil para enmascarar residuos de baja confianza antes de la búsqueda por perfiles. La release actual es del 02/11/2026 (perfiles "nng", epoch 2); los pesos anteriores del 30/07/2026 siguen accesibles con `revision="jul26"`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder estilo ModernBERT: 36 capas, hidden 1536, 24 cabezas, SwiGLU, atención alterna global / sliding-window, adaptadores de atención NOBLE; dos cabezas lineales (3Di de 20 estados, 12 estados) |
| Parámetros totales | 1.040.968.768 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de proteínas; sin soporte de lenguajes naturales) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`), con código Python propio (`*_modernprost_3di12st.py`) que requiere `trust_remote_code=True`; cabeza pLDDT en `plddt_head/head.safetensors` |

## Arquitectura y entrenamiento

El backbone es un transformer encoder de estilo ModernBERT con 36 capas, dimensión oculta 1536 y 24 cabezas de atención, que combina capas de atención global con capas de sliding-window y emplea adaptadores de atención NOBLE. Sobre la representación del encoder se aplican dos cabezas lineales independientes: una de 20 clases para el alfabeto 3Di (ACDEFGHIKLMNPQRSTVWY) y otra de 12 clases para el alfabeto de 12 estados (ACDEFGHIKLMN). El modelo no añade tokens BOS/EOS, de modo que la posición i de la salida corresponde al residuo i de la secuencia.

El entrenamiento se realizó sobre el dataset gbouras13/ModernProst-3di12st-pssm (release 02/11/2026), con 4.309.289 proteínas de entrenamiento y 11.725 de validación, procedentes de representantes de clústeres AFDB50 y de otras estructuras predichas de ColabFold, Phold DB y BFVD. Cada estructura se buscó contra AFDB50 con Foldseek (rama `evalue-geomean-minlen`, commit `583229dc`), enmascarando suavemente residuos con pLDDT < 70 y usando `--evalue-nn-mode 2` y `--profile-lowconf-members 1`; los perfiles 3Di y de 12 estados se construyeron con `result2profile`. El objetivo es la divergencia KL (temperatura 1) hacia los perfiles diana, sin etiquetas duras, con longitud máxima de 512. Se optimizó con NorMuon (lr 4e-4 para AdamW, 1e-3 para Muon), decaimiento lineal, warmup de ~500 pasos, batch por dispositivo 27 × 5 de acumulación de gradiente en DDP y semilla 30. El checkpoint seleccionado es el epoch 2 (paso 4.000); epochs posteriores (hasta 8) no mejoraron en SCOPe40.

## Capacidades

- Predicción de perfiles 3Di de 20 estados por residuo a partir de secuencia de aminoácidos, como distribución softmax.
- Predicción de perfiles de 12 estados por residuo, también como distribución softmax.
- Extracción de características (pipeline `feature-extraction`) mediante `AutoModel` y tokenizador propio con `trust_remote_code=True`.
- Predicción opcional de pLDDT por residuo (0-100) mediante una cabeza auxiliar de 338K parámetros entrenada sobre el backbone congelado, que lee todas las capas del encoder.
- Soporte para enmascaramiento de residuos de baja confianza (puesta a cero de columnas de perfil 3Di y 12 estados) para búsquedas Foldseek con `lowconfquery`.
- Integración con phold-lib para escribir bases de datos de perfiles Foldseek (`_profile_ss`, `_profile_ss12`, `_profile`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo especializado en proteínas.

## Casos de uso

- Búsqueda de similitud estructural a partir de secuencia: el modelo genera perfiles 3Di y de 12 estados que se escriben como base de datos Foldseek, permitiendo buscar homólogos estructurales sin estructura experimental ni predicha, con una sensibilidad en SCOPe40 cercana a la de estructuras reales (0,8886 vs 0,8828 en familia).
- Anotación funcional de proteínas en pipelines genómicos: dado un conjunto de secuencias sin estructura, se generan perfiles y se buscan contra AFDB50 u otras bases, aprovechando el contexto de 512 residuos para proteínas de tamaño medio.
- Enmascaramiento de regiones de baja confianza: usando la cabeza pLDDT (RMSE 9,25, AUROC 0,965 para pLDDT < 70), se pueden poner a cero las columnas de perfil de residuos poco fiables antes de la búsqueda, lo que se validó con umbrales entre 50 y 70.
- Construcción de bases de datos de perfiles a escala: phold-lib permite generar `_profile_ss`, `_profile_ss12` y `_profile` de forma masiva, adecuado para metagenomas o catálogos de proteínas donde no hay estructuras disponibles.
- Búsqueda de proteínas huérfanas o de función desconocida: la combinación de perfiles predichos y Foldseek con `--k-score seq:2147483647,prof:82` permite detectar relaciones de superfamilia y fold que una búsqueda puramente por secuencia no capturaría.
- Investigación en plegamiento y evolución: los perfiles por residuo permiten analizar la propensión estructural local y comparar regiones entre proteínas sin necesidad de predecir la estructura completa, con un coste computacional inferior al de un predictor de estructura.
- Filtrado previo en pipelines de AlphaFold o ColabFold: el pLDDT predicho por secuencia puede priorizar qué proteínas merecen un plegamiento completo, reduciendo el coste de candidatos con regiones intrínsecamente desordenadas.

## Benchmarks y rendimiento

Evaluación del autor en SCOPe40 all-vs-all, sin self-hits, fracción de verdaderos positivos hasta el primer falso positivo (familia / superfamilia / fold), con Foldseek commit `583229dc`:

| Query | Default (prof:89) | `--k-score seq:2147483647,prof:82` |
|---|---|---|
| ModernProst-PSSM (perfiles) | 0,8886 / 0,6182 / 0,1464 | 0,8919 / 0,6201 / 0,1467 |
| ModernProst-50M-PSSM (esta release) | 0,8759 / 0,6089 / 0,1446 | 0,8810 / 0,6109 / 0,1449 |
| Estructuras reales (queries de estructura única) | 0,8828 / 0,6144 / 0,1520 | 0,8828 / 0,6144 / 0,1520 |

Validación de la cabeza pLDDT (18.000 proteínas held-out, 5,16M residuos; etiquetas AFDB / ColabFold / BFVD, mejor paso 8.000):

| RMSE | MAE | Pearson | Pearson por proteína | AUROC pLDDT < 70 | AUROC pLDDT < 50 |
|---|---|---|---|---|---|
| 9,25 | 5,99 | 0,904 | 0,905 | 0,965 | 0,976 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4,2 GB solo para pesos (1,04B parámetros); en fp16/bf16, unos 2,1 GB; en int8, unos 1,1 GB. El repo completo ocupa 8,3 GB, incluyendo la cabeza pLDDT y ficheros auxiliares.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con batch moderado; A100, H100 o L40S para procesar lotes grandes de secuencias de hasta 512 residuos.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares, en bf16 o fp16.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True` es la vía documentada; phold-lib para generar bases de datos Foldseek. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo de extracción de características no encaja en esos servidores de generación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Rendimiento SCOPe40 (familia/superfamilia/fold) | Licencia |
|---|---|---|---|---|---|
| ModernProst-PSSM (este) | 1,04B | 512 | Perfiles 3Di + 12 estados desde secuencia | 0,8886 / 0,6182 / 0,1464 | No disponible |
| ModernProst-50M-PSSM | ~50M (no confirmado) | No disponible | Perfiles 3Di + 12 estados desde secuencia | 0,8759 / 0,6089 / 0,1446 | No disponible |
| Estructuras reales (Foldseek) | No aplica | No aplica | Búsqueda sobre estructura | 0,8828 / 0,6144 / 0,1520 | No aplica |
| ModernProst-base (argmax) | No disponible | No disponible | Secuencias 3Di/12 estados por argmax | No disponible | No disponible |

La comparativa se limita a las variantes del propio autor y a la referencia de estructuras reales, únicas alternativas con datos en la información disponible; no se dispone de métricas de otros modelos de perfiles estructurales para comparar.

## Limitaciones y advertencias

- El modelo está diseñado para usarse a través de sus perfiles (softmax); usar argmax sobre las salidas degrada el rendimiento y para eso existe la variante `gbouras13/modernprost-base`.
- Longitud máxima de 512 residuos; proteínas más largas requieren truncamiento o fragmentación, lo que puede perder relaciones estructurales de largo alcance.
- Entrenado con perfiles derivados de AFDB50 y estructuras predichas; los sesgos del dataset (composición de AFDB50, sesgo hacia proteínas bien representadas) pueden trasladarse a las predicciones.
- Riesgo de alucinación estructural: el modelo puede producir perfiles plausibles para regiones intrínsecamente desordenadas o sin homólogos claros; el uso de la cabeza pLDDT y el enmascaramiento de baja confianza mitiga parcialmente este riesgo.
- La licencia no está disponible en la información proporcionada, por lo que el uso comercial debe verificarse directamente con el autor antes de adoptarlo en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar los ficheros antes de desplegarlo en entornos sensibles.
- El rendimiento en SCOPe40 se midió con una rama y commit concretos de Foldseek (`evalue-geomean-minlen`, `583229dc`); otras versiones o el umbral por defecto de 89 pueden reducir la sensibilidad.
- No es un modelo generativo ni de propósito general: no soporta instrucciones, diálogo, código ni tareas de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gbouras13/modernprost-pssm
- Variante de secuencias por argmax: https://huggingface.co/gbouras13/modernprost-base
- Dataset de entrenamiento: https://huggingface.co/datasets/gbouras13/ModernProst-3di12st-pssm
- phold-lib: https://github.com/gbouras13/phold-lib
- Rama de Foldseek recomendada: https://github.com/Victor-Mihaila/foldseek (rama `evalue-geomean-minlen`, commit `583229dc`)
