# akifkaradag/cardiac-segmentation-diagnosis

## Resumen

El modelo `akifkaradag/cardiac-segmentation-diagnosis` es un pipeline médico de extremo a extremo publicado en HuggingFace por el usuario akifkaradag (repositorio de código asociado bajo la cuenta Makifkaradag) para el análisis automático de resonancia magnética cardiaca de cine en eje corto. No es un modelo de lenguaje: combina una red de segmentación 3D basada en nnU-Net v2 (configuración `3d_fullres`) con un clasificador Random Forest que, a partir de los biomarcadores derivados de la segmentación, asigna uno de cinco diagnósticos cardiacos (NOR, MINF, DCM, HCM, RV). El repositorio ocupa 0,5 GB y la licencia es MIT.

El problema que resuelve es doble: por un lado, la delineación automática de tres estructuras cardiacas (cavidad del ventrículo derecho, miocardio del ventrículo izquierdo y cavidad del ventrículo izquierdo); por otro, la derivación de parámetros clínicos cuantitativos (volúmenes telediastólico y telesistólico, fracción de eyección y masa miocárdica) y su traducción a una etiqueta diagnóstica. El modelo se entrenó y evalúa sobre el conjunto de datos del Automated Cardiac Diagnosis Challenge (ACDC) de MICCAI, con 100 pacientes de entrenamiento en validación cruzada de 5 particiones y 50 casos de holdout.

Su relevancia actual es la de servir como referencia reproducible y de licencia permisiva para pipelines de segmentación cardiaca 3D y diagnóstico asistido, un área donde gran parte de las soluciones desplegadas son propietarias. La model card declara 0,945 de Dice medio en ventrículo izquierdo, 0,911 en ventrículo derecho y 0,900 en miocardio, además de un 88,0 % de exactitud en la clasificación de cinco clases, aunque ninguno de estos resultados está verificado de forma independiente según el propio `model-index`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 con configuración `3d_fullres` (CNN tipo U-Net 3D auto-configurada) para segmentación + clasificador Random Forest para diagnóstico |
| Parámetros totales | no disponible (el autor no publica el recuento de parámetros; tamaño del repositorio: 0,5 GB) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen 3D, no de lenguaje) |
| Tipos de cuantización | no disponible (el autor no documenta cuantización; los checkpoints de nnU-Net se distribuyen en precisión completa) |
| Idiomas soportados | en (documentación y model card en inglés) |
| Licencia | MIT |
| Formato de pesos | checkpoints de PyTorch propios de nnU-Net v2; no se documentan safetensors ni GGUF |
| Tarea principal | image-segmentation (pipeline en HuggingFace) |
| Librería | nnunetv2 |
| Conjunto de datos | ACDC Challenge (MICCAI) |
| Modalidad de entrada | resonancia magnética cardiaca de cine, eje corto, 3D |
| Salidas | máscaras 3D (etiquetas 1 = cavidad RV, 2 = miocardio VI, 3 = cavidad VI), biomarcadores clínicos y clase diagnóstica |
| Fecha de creación en HuggingFace | 2026-09-13 |
| Última actualización | 2026-09-13 |

## Arquitectura y entrenamiento

El componente de segmentación es nnU-Net v2 en su configuración `3d_fullres`, un esquema auto-configurable que deriva de forma automática el preprocesamiento, la geometría de parche, la estrategia de aumento de datos y el esquema de entrenamiento a partir de las propiedades del dataset. Se trata de una CNN con arquitectura de U-Net 3D que opera sobre volúmenes completos en lugar de cortes 2D aislados, lo que permite explotar la coherencia espacial entre planos adyacentes. El modelo produce tres etiquetas anatómicas: cavidad del ventrículo derecho (RV), miocardio del ventrículo izquierdo (MYO) y cavidad del ventrículo izquierdo (LV).

Sobre las máscaras predichas, el pipeline extrae biomarcadores clínicos (volumen telediastólico, volumen telesistólico, fracción de eyección y masa miocárdica) y alimenta con ellos un clasificador Random Forest que emite una de cinco clases diagnósticas: NOR (función cardiaca normal), MINF (infarto de miocardio previo), DCM (miocardiopatía dilatada), HCM (miocardiopatía hipertrófica) y RV (ventrículo derecho anómalo). El entrenamiento y la evaluación se realizaron sobre el ACDC Challenge: 100 pacientes de entrenamiento evaluados con validación cruzada de 5 particiones estratificadas y 50 casos de holdout. La model card no especifica el número de épocas, la composición exacta del dataset más allá de ACDC, ni el uso de técnicas de ajuste fino con refuerzo (RLHF/DPO), que en cualquier caso no aplican a este tipo de modelo. No se documentan innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

## Capacidades

- Segmentación 3D completa de tres estructuras cardiacas en resonancia de cine en eje corto: cavidad del ventrículo derecho, miocardio del ventrículo izquierdo y cavidad del ventrículo izquierdo.
- Derivación automática de biomarcadores clínicos: volumen telediastólico (EDV) y telesistólico (ESV) de ambos ventrículos, fracción de eyección en porcentaje y masa miocárdica en gramos.
- Clasificación diagnóstica de cinco clases: normal (NOR), infarto de miocardio previo (MINF), miocardiopatía dilatada (DCM), miocardiopatía hipertrófica (HCM) y ventrículo derecho anómalo (RV).
- Evaluación de extremo a extremo sin intervención humana: el pipeline reporta un 86,0 % de exactitud en holdout operando únicamente sobre máscaras predichas.
- Ejecución como pipeline reproducible dentro del ecosistema nnU-Net v2, con descarga de pesos mediante `huggingface_hub.snapshot_download`.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponibles; el modelo no procesa texto, solo documentación en inglés.
- Capacidades especiales (modo *thinking*, visión general, audio): no disponibles. La única modalidad soportada es imagen médica 3D de resonancia magnética cardiaca.

## Casos de uso

- Cuantificación cardiaca en investigación clínica: el pipeline permite obtener EDV, ESV, fracción de eyección y masa miocárdica de forma automática sobre cohortes de resonancia cardiaca, sustituyendo la delineación manual, que es lenta y presenta variabilidad interobservador.
- Preselección de pacientes en ensayos clínicos: la clasificación en cinco fenotipos (NOR, MINF, DCM, HCM, RV) permite estratificar cohortes antes de la lectura experta, reduciendo el coste de reclutamiento.
- Apoyo al diagnóstico en entornos con carga asistencial alta: al operar de extremo a extremo sobre máscaras predichas con un 86,0 % de exactitud en holdout, puede actuar como segunda lectura o sistema de triaje para priorizar los estudios que requieren revisión prioritaria.
- Auditoría de calidad de segmentaciones previas: las máscaras generadas pueden compararse con delineaciones existentes de otros sistemas para detectar discrepancias mediante métricas de Dice, con valores de referencia declarados de 0,945 (LV), 0,911 (RV) y 0,900 (MYO).
- Monitorización longitudinal de pacientes: al derivar biomarcadores de forma consistente entre estudios, facilita la comparación de fracción de eyección y masa miocárdica en seguimientos sucesivos, con un error absoluto medio declarado de 2,31 puntos porcentuales en fracción de eyección del VI.
- Docencia y formación en imagen cardiaca: las máscaras y biomarcadores automáticos sirven como referencia para residentes, que pueden contrastar sus propias delineaciones con la salida del modelo.
- Integración en plataformas de análisis retrospectivo: al tener licencia MIT y pesos descargables, puede incorporarse en pipelines internos de investigación sin las restricciones de las soluciones propietarias equivalentes.
- Reproducibilidad de experimentos: sirve como línea base en trabajos que comparen arquitecturas de segmentación 3D sobre ACDC, al estar construido sobre nnU-Net v2, un marco ampliamente utilizado.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación proceden del `model-index` de la model card; todos figuran con `verified: false`, es decir, declarados por el autor y no verificados de forma independiente.

Segmentación 3D sobre el conjunto de holdout (50 casos):

| Estructura anatómica | Región objetivo | Dice medio |
|---|---|---|
| Ventrículo izquierdo (LV) | Cavidad sanguínea | 0,945 |
| Ventrículo derecho (RV) | Cavidad sanguínea | 0,911 |
| Miocardio (MYO) | Pared del ventrículo izquierdo | 0,900 |

Concordancia de biomarcadores clínicos (valor real frente a predicción):

| Métrica clínica | Error absoluto medio (MAE) | Correlación de Pearson (r) |
|---|---|---|
| Fracción de eyección del VI (%) | 2,31 | 0,990 |
| Fracción de eyección del VD (%) | 5,17 | 0,889 |
| Masa miocárdica (g) | 7,46 | 0,982 |

Clasificación diagnóstica de cinco clases con validación cruzada estratificada de 5 particiones:

| Clase | Precisión | Exhaustividad (recall) | F1 | Soporte |
|---|---|---|---|---|
| DCM | 0,95 | 0,95 | 0,95 | 20 |
| HCM | 1,00 | 0,80 | 0,89 | 20 |
| MINF | 0,90 | 0,95 | 0,93 | 20 |
| NOR | 0,72 | 0,90 | 0,80 | 20 |
| RV | 0,89 | 0,80 | 0,84 | 20 |

Exactitud global en validación cruzada de 5 particiones: 0,880 (88,0 %).
Exactitud de extremo a extremo en holdout, calculada solo sobre máscaras predichas sin máscaras de referencia humanas: 0,860 (86,0 %).

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. El autor no publica requisitos de memoria ni tiempos de ejecución.
- GPU recomendadas: no disponible. En la práctica, nnU-Net v2 en configuración `3d_fullres` se ejecuta habitualmente en GPUs de datacenter o gama alta (familia NVIDIA A100, H100, RTX 4090) por el tamaño del parche 3D, pero esto es una estimación general del marco y no un dato confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. No se puede asegurar que quepa en GPUs de gama media o en portátiles sin reducir el tamaño de parche o el *batch size*, extremo que el autor no documenta.
- Opciones de despliegue: entorno nnU-Net v2 sobre PyTorch (librería declarada en HuggingFace). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Descarga de pesos: mediante `huggingface_hub.snapshot_download` con el identificador del repositorio; el repositorio ocupa 0,5 GB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Resultados en ACDC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cardiac-segmentation-diagnosis (este modelo) | nnU-Net v2 `3d_fullres` + Random Forest | no disponible | no aplica | Dice 0,945 LV / 0,911 RV / 0,900 MYO; exactitud de clasificación 0,880 | MIT | HuggingFace y GitHub |
| nnU-Net v2 base sobre ACDC | CNN U-Net 3D auto-configurada | no disponible | no aplica | no disponible en la información proporcionada | MIT (código del marco) | GitHub de nnU-Net |
| U-Net 2D entrenada sobre ACDC | CNN U-Net 2D | no disponible | no aplica | no disponible en la información proporcionada | según implementación | múltiples repositorios públicos |
| Soluciones comerciales de análisis cardiaco | software propietario con módulos de IA | no disponible | no aplica | no disponible en la información proporcionada | propietaria | licencia comercial |

No se dispone de valores numéricos verificados de los modelos alternativos dentro de la información proporcionada, por lo que la comparación cuantitativa directa no es posible. La ventaja diferencial de este modelo es la combinación de segmentación, derivación de biomarcadores y clasificación diagnóstica en un único pipeline de licencia MIT.

## Limitaciones y advertencias

- Resultados no verificados: todos los valores del `model-index` figuran con `verified: false`; proceden del autor y no han sido reproducidos de forma independiente.
- Cohorte de evaluación pequeña: 100 pacientes de entrenamiento y 50 de holdout en ACDC. El rendimiento en poblaciones más amplias o con distribuciones distintas de patología no está caracterizado.
- Generalización limitada: el modelo se ha desarrollado exclusivamente sobre ACDC (resonancia de cine en eje corto). No hay evidencia de que funcione con otras secuencias, otros planos, otros protocolos de adquisición u otros fabricantes de escáner.
- Sesgo potencial de dataset: ACDC procede de un único centro y contiene cinco fenotipos concretos; los pacientes con patologías no representadas pueden clasificarse erróneamente dentro de una de las cinco clases.
- Confusión entre clases: la clase NOR presenta la precisión más baja en la validación cruzada (0,72), lo que indica una tasa apreciable de falsos positivos hacia el diagnóstico de función normal.
- Propagación de errores: la clasificación depende de biomarcadores derivados de las máscaras predichas; un error de segmentación se propaga a la estimación de volúmenes y de fracción de eyección. La exactitud de extremo a extremo (86,0 %) es inferior a la de la clasificación sobre biomarcadores de referencia (88,0 %).
- Mayor error en el ventrículo derecho: el MAE de la fracción de eyección del VD (5,17) más que duplica el del VI (2,31), lo que refleja la mayor dificultad de delinear la cavidad derecha.
- No es un dispositivo médico: no consta marcado CE, autorización FDA ni validación clínica regulatoria. No debe utilizarse para diagnóstico autónomo ni para decisiones terapéuticas sin supervisión de un especialista.
- Riesgo de alucinación en sentido estricto: no aplica, ya que no es un modelo generativo de lenguaje; el riesgo equivalente es la producción de máscaras o clasificaciones plausibles pero incorrectas sin indicación de incertidumbre.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, modificación y redistribución, pero no exime de las obligaciones regulatorias aplicables al uso clínico real.
- Idiomas: la documentación está únicamente en inglés; no hay soporte multilingüe ni interfaz en castellano.
- Inconsistencia de identificadores: la información de HuggingFace indica el autor `akifkaradag`, mientras que la model card enlaza el repositorio de GitHub bajo `Makifkaradag`. Conviene verificar la fuente canónica antes de citar o desplegar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akifkaradag/cardiac-segmentation-diagnosis
- Repositorio de GitHub citado en la model card: https://github.com/Makifkaradag/cardiac-segmentation-diagnosis
- Automated Cardiac Diagnosis Challenge (ACDC, MICCAI), dataset de referencia del entrenamiento y la evaluación: no disponible en la información proporcionada
- Marco nnU-Net v2: no disponible en la información proporcionada
- Resultados de la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo; únicamente aparecieron listados inmobiliarios sin relación con el contenido.
