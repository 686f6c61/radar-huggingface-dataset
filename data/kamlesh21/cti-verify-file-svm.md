# Kamlesh21/cti-verify-file-svm

## Resumen

CTI Verify file classifiers (SVM) es un conjunto de tres clasificadores de vectores de soporte (SVM) publicados por el desarrollador independiente Kamlesh21 bajo el identificador `Kamlesh21/cti-verify-file-svm`. No es un modelo de lenguaje ni una red neuronal profunda: son clasificadores tabulares que puntúan la estructura de un fichero (programas Windows PE, programas Linux ELF y documentos PDF) según su parecido estadístico con ficheros benignos o maliciosos de su misma clase. Forman parte del proyecto CTI Verify, una plataforma de inteligencia de amenazas construida como trabajo de curso sobre MongoDB, donde actúan como una señal adicional junto a reglas YARA, feeds de amenazas y un sandbox.

El modelo resuelve un problema acotado de ciberseguridad: el análisis estático rápido de ficheros sospechosos sin ejecutarlos. Los tres clasificadores se entrenaron con los vectores de características de EMBER2024 (3,2 millones de ficheros vistos entre septiembre de 2023 y diciembre de 2024), un conjunto de referencia en detección de malware. Cada fichero se transforma en 2.568 características numéricas mediante el código oficial de EMBER2024 y se puntúa con un SVM lineal (PE, PDF) o con kernel RBF (ELF).

Su relevancia es práctica y limitada: ofrece cifras de falsos positivos y detección medidas en un periodo temporal posterior al entrenamiento, con un umbral calibrado para no superar el 1% de falsos positivos sobre benignos. El modelo PDF no supera la puerta de validación del autor y se distribuye marcado con `"scores": false`, de modo que su salida se muestra pero no se cuenta en el veredicto. La licencia es Apache 2.0 y los pesos son arrays NumPy en formato `.npz`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVM (LinearSVC / SGD lineal para PE y PDF; SVC con kernel RBF para ELF) sobre 2.568 características de EMBER2024 |
| Parametros totales | no disponible (vectores de coeficientes y vectores de soporte; tamaño del repo 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en coma flotante NumPy; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (modelos y `api/file_svm.py`); `ml/thrember/` Apache 2.0 de los autores de EMBER2024 |
| Formato de pesos | `.npz` (arrays NumPy: `coef`, `intercept`, `mask`, `mean`, `scale`, `platt_a`, `platt_b` y vectores de soporte para RBF), más manifiestos `.json` con umbral, métricas de test y SHA-256 |

## Arquitectura y entrenamiento

Cada clasificador es un SVM clásico que opera sobre el vector de 2.568 características de EMBER2024, extraído con `ml/thrember/features.py` (código oficial de EMBER2024 en el commit `0ef753e81d98`). Para PE y PDF se eligió un SVM lineal; para ELF, un SVM con kernel RBF que conserva sus vectores de soporte en el `.npz`. La puntuación se calibra con los parámetros de Platt (`platt_a`/`platt_b`) y el umbral se fija por tipo de fichero.

El entrenamiento usa EMBER2024 con partición temporal: las primeras 46 semanas para ajustar, las 6 semanas finales de entrenamiento para seleccionar el modelo y fijar el umbral, y las 12 semanas siguientes como test. Por cada tipo de fichero se probaron tres candidatos (LinearSVC, SGD lineal y SVC RBF) y se publica el mejor en validación, salvo que incumpla la puerta de calidad. Esa puerta exige, en las semanas de test, marcar como máximo el 1% de benignos, detectar al menos la mitad de los maliciosos y no marcar más del 5% de los ficheros ordinarios del tipo correspondiente hallados en un PC real. El modelo PDF incumple la segunda mitad (marcó 7 de 12 PDFs ordinarios instalados con software, un 58%) y por eso se distribuye sin peso en el veredicto.

## Capacidades

- Clasificación binaria benigno/malicioso de ejecutables Windows (PE) mediante SVM lineal.
- Clasificación binaria benigno/malicioso de ejecutables Linux (ELF) mediante SVM con kernel RBF.
- Clasificación binaria benigno/malicioso de documentos PDF mediante SVM lineal, con salida informativa que no computa en el veredicto.
- Extracción de las 2.568 características de EMBER2024 a partir de un fichero en disco.
- Salida de probabilidad calibrada (Platt scaling) además de la etiqueta.
- Verificación de integridad de los pesos contra el SHA-256 del manifiesto; un modelo cuyos bytes no coinciden se rechaza.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador tabular.

## Casos de uso

- Triaje estático en una plataforma CTI: integrar el modelo PE como una señal más junto a YARA y feeds de amenazas para priorizar el análisis manual de ejecutables sospechosos, sin ejecutarlos.
- Análisis previo a sandbox: puntuar un PE o ELF recién recibido y decidir si merece el coste de enviarlo a un sandbox dinámico, usando el umbral calibrado al 1% de falsos positivos.
- Enriquecimiento de alertas en un SIEM: adjuntar la puntuación del clasificador a los eventos de descarga de ficheros para que los analistas ordenen la cola por riesgo estructural.
- Filtrado de adjuntos en pasarelas de correo: usar el modelo PDF como indicador auxiliar (nunca como veredicto, dado que incumple la puerta) y el de PE para adjuntos ejecutables.
- Investigación de malware en Linux: el modelo ELF con kernel RBF aporta una opinión estadística sobre binarios de servidores y contenedores, un nicho con menos herramientas abiertas que el ecosistema PE.
- Docencia y evaluación de pipelines de detección: al ser SVM sobre características EMBER, sirve como línea base reproducible y ligera para comparar con modelos más complejos en cursos y trabajos de investigación.
- Despliegue en entornos con recursos mínimos: al depender solo de NumPy y no requerir GPU, puede ejecutarse en el mismo host del servidor de ingesta o en un contenedor pequeño.

## Benchmarks y rendimiento

Cifras publicadas por el autor en la model card, medidas en las 12 semanas de test de EMBER2024 posteriores al periodo de entrenamiento, con el umbral propio de cada modelo (fijado para no superar el 1% de falsos positivos sobre benignos):

| Tipo | Modelo | Algoritmo | Falsos positivos (test) | Detección (test) | Cuenta en el veredicto |
|---|---|---|---|---|---|
| PE (Windows) | `file_svm_pe` | SVM lineal | 0,41% | 79,0% | Sí |
| ELF (Linux) | `file_svm_elf` | SVM RBF | 0,30% | 66,1% | Sí |
| PDF | `file_svm_pdf` | SVM lineal | 1,00% | 72,5% | No (se muestra, no cuenta) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU y solo requiere NumPy.
- GPU: no necesaria. Cualquier CPU moderna sirve; no se documentan requisitos mínimos concretos.
- Memoria RAM: no disponible; los `.npz` son arrays pequeños (repo de 0.0 GB), por lo que la huella debería ser de pocos megabytes, aunque el dato exacto no se publica.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos y contenedores de bajo perfil.
- Despliegue: script `predict.py` incluido y módulo `api/file_svm.py` (solo NumPy). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador tabular.
- Latencia y throughput: no disponibles. La mayor parte del coste estará en la extracción de las 2.568 características del fichero, no en el SVM.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Falsos positivos | Detección | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CTI Verify SVM (PE) | SVM lineal sobre EMBER2024 | EMBER2024 (3,2 M ficheros, 2023-2024) | 0,41% | 79,0% | Apache 2.0 | Hugging Face |
| CTI Verify SVM (ELF) | SVM RBF sobre EMBER2024 | EMBER2024 | 0,30% | 66,1% | Apache 2.0 | Hugging Face |
| CTI Verify SVM (PDF) | SVM lineal sobre EMBER2024 | EMBER2024 | 1,00% | 72,5% | Apache 2.0 | Hugging Face |
| EMBER2024 (conjunto de datos y baseline) | Características y modelos de referencia | EMBER2024 | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | GitHub |
| MalwareBazaar / VirusTotal | Servicios de reputación y detección | Muestras en producción | no disponible | no disponible | Propietaria / términos de servicio | Servicios web |

No se dispone de comparaciones numéricas con otros clasificadores SVM publicados sobre EMBER en la información proporcionada.

## Limitaciones y advertencias

- El modelo PDF falla la segunda mitad de la puerta de validación: marcó 7 de 12 PDFs ordinarios instalados con software (58%). Se distribuye con `"scores": false` y debe tratarse igual: mostrar el resultado sin sumarlo al veredicto.
- Los modelos leen estructura y estadísticas de bytes, no comportamiento. Software benigno empaquetado, firmado o poco habitual puede parecer malicioso, y familias de malware nuevas pueden parecer benignas.
- Entrenados con ficheros de 2023 y 2024; la precisión se degrada a medida que cambia el malware. Es necesario reentrenar con semanas más recientes de EMBER.
- No sustituyen a un antivirus: deben usarse como una señal entre varias.
- El umbral está calibrado para pocos falsos positivos, lo que implica una tasa de detección moderada (79,0% en PE, 66,1% en ELF); no son adecuados como único filtro de bloqueo.
- No se documentan sesgos por idioma ni por demografía, al no procesar texto ni datos personales; el sesgo relevante es el de la distribución de muestras de EMBER2024.
- Riesgo de alucinación no aplica (no genera texto), pero sí de clasificación errónea en ambas direcciones.
- Licencia Apache 2.0 permite uso comercial; el código de `ml/thrember/` conserva la licencia Apache 2.0 de los autores de EMBER2024 y debe respetarse su atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamlesh21/cti-verify-file-svm
- Repositorio del proyecto CTI Verify: https://github.com/JustKamlesH21/cyber-threat-intelligence-platform
- EMBER2024 (conjunto de datos y código): https://github.com/FutureComputing4AI/EMBER2024
