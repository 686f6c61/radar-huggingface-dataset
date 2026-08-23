# SharonMelhi/chara-survival

## Resumen

Chara es un modelo de inferencia de supervivencia (survival analysis) orientado a oncología, desarrollado por el Computational and Physical Genomics Laboratory del Indian Institute of Technology Mandi, bajo la dirección de la Dra. Kharerin Hungyo y con Sharon Melhi como creador principal. Su propósito es resolver el problema del cambio de dominio transcriptómico entre plataformas (por ejemplo, RNA-Seq de Illumina frente a microarrays de Affymetrix) en la predicción del pronóstico del cáncer. Para ello construye un Graph Laplacian termodinámico basado en fluctuaciones de residuos de dinámica molecular (MARTINI 3) y aplica un suavizado por difusión de calor que elimina ruido específico de plataforma mientras conserva la señal biológica real.

El modelo consiste en una firma de supervivencia de Cox con regularización L1 (CoxNet) sobre 4.337 genes, de los cuales solo 58 presentan coeficientes no nulos tras el entrenamiento. Se distribuye como un paquete Python (`chara-survival`) y como un archivo de modelo en Hugging Face Hub. Está pensado para su uso en investigación biomédica, con licencia MIT y sin restricciones de uso comercial. Su relevancia radica en la capacidad de aplicar una firma entrenada en un cohorte a otros cohortes independientes sin necesidad de armonización previa, lo que supone una mejora frente a métodos clásicos como ComBat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cox Proportional Hazards con regularización L1 (Coxnet) sobre un preprocesado basado en Thermodynamic Graph Laplacian (L_Chara) |
| Parámetros totales | 4 337 coeficientes (genes) en el modelo, de los cuales 58 son no nulos (biomarcadores activos) |
| Parámetros activos | 58 (biomarcadores regularizados) |
| Longitud de contexto | No aplica (modelo tabular, no de lenguaje) |
| Tipos de cuantización | No aplica (modelo tabular, no neuronal) |
| Idiomas soportados | No aplica (modelo numérico, documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | Pickle (joblib) dentro de un bundle con el modelo, índice de alpha y lista de genes |

## Arquitectura y entrenamiento

El modelo se basa en un enfoque biopsicofísico. Primero construye un Graph Laplacian termodinámico (L_Chara) a partir de fluctuaciones de residuos de simulaciones de dinámica molecular de grano grueso (MARTINI 3) sobre proteínas relacionadas con la supervivencia del cáncer. A partir de este Laplacian, se aplica un suavizado por difusión de calor (H_t = exp(-t L)) a las matrices de expresión génica, lo que disipa el ruido específico de la plataforma de medición mientras mantiene la señal biológica subyacente.

Posteriormente, se entrena un modelo Cox Proportional Hazards con regularización L1 (Coxnet) sobre los 4337 geneses que intersectan entre los datos de entrenamiento y los de validación. El entrenamiento se realiza con datos de TCGA-PAAD (cancer de páncreas) como conjunto principal, y se valida en cohortes independientes de ICGC-PACA, GSE15471, GSE28735, GSE57495 y GSE31210. No se especifica el número total de pacientes de entrenamiento, pero la validación en conjunto alcanza n=889. El modelo no usa técnicas de RLHF ni DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Predicción de riesgo de supervivencia: calcula un riesgo de log-hazard para cada paciente basado en su perfil transcriptómico.
- Generación de curvas de supervivencia individualizadas: a partir del estimador de Breslow (S0(t)) y los multiplicadores de hazard, produce curvas de supervivencia específicas para cada paciente.
- Manejo de dominio cruzado: funciona sobre datos de RNA-Seq y microarrays sin necesidad de armonización externa (ComBat).
- Identificación de biomarcadores: la regularización L1 aísla 58 genes con peso predictivo, incluyendo oncogenes (CCL20, DKK1) y genes protectores (MS4A1, FAIM2).
- Integración con librerías estándar: se usa con scikit-survival, joblib y pandas.
- Cero fuga de datos en validación: el modelo se entrena solo con TCGA-PAAD y se aplica a cohortes externas sin ajuste adicional.

## Casos de uso

- Pronóstico de supervivencia en cáncer de páncreas: el modelo se entrena con TCGA-PAAD y puede aplicarse a nuevos pacientes con datos de RNA-Seq o microarrays para estimar su riesgo relativo y curvas de supervivencia.
- Armonización de datos entre plataformas de medición: en estudios multicéntricos donde se combinan datos de RNA-Seq y microarrays, el modelo permite analizar conjuntamente sin necesidad de métodos de armonización como ComBat, reduciendo el riesgo de artefactos técnicos.
- Descubrimiento de biomarcadores pronósticos: los 58 genes activos pueden servir como candidatos para validación experimental en laboratorio, orientando estudios de biología molecular.
- Validación de firmas genéticas en cohortes externas: permite testear la robustez de una firma de supervivencia en distintos hospitales y plataformas, lo que es útil para la reproducibilidad en investigación.
- Análisis de supervivencia en oncología traslacional: investigadores pueden usar el modelo para estratificar pacientes en ensayos clínicos según su riesgo, aunque no está validado como dispositivo clínico.
- Integración en pipelines de bioinformática: al ser un modelo de scikit-survival, puede integrarse en flujos de trabajo Python existentes para análisis de expresión génica, sin necesidad de infraestructura de GPU.

## Benchmarks y rendimiento

Se presentan resultados de índice de concordancia (c-index) en cinco cohortes externas, comparando el modelo Chara con un modelo Cox sin ajuste (Unadjusted Cox) y con un ajuste de armonización ComBat.

| Cohort | Platform | n | Unadjusted Cox | ComBat Harmonization | Chara Laplacian (ours) |
|---|---|---|---|---|---|
| ICGC-PACA (AU) | RNA-Seq (HiSeq) | 269 | 0.531 | 0.682 | 0.784 |
| GSE15471 | Affymetrix HG-U133+2.0 | 78 | 0.508 | 0.641 | 0.762 |
| GSE28735 | GeneChip Human 1.0 ST | 90 | 0.522 | 0.665 | 0.771 |
| GSE57495 | Agilent Human Genome | 63 | 0.495 | 0.628 | 0.758 |
| GSE31210 | Zero-Shot Microarray | 226 | 0.512 | 0.639 | 0.731 |

No se han reportado métricas adicionales como Brier score o AUC dependiente del tiempo en la información disponible, aunque se mencionan en los metadatos de Hugging Face como métricas asociadas al modelo.

## Requisitos de hardware

- El modelo es un archivo de pesos de joblib de tamaño muy pequeño (menos de 1 MB), por lo que no requiere GPU.
- Inferencia en CPU: cualquier procesador moderno puede ejecutar las operaciones de multiplicación de matrices y exponenciación necesarias.
- Memoria RAM: menos de 100 MB para cargar el modelo y los datos de entrada (una matriz de pacientes por genes).
- Despliegue: se puede integrar en cualquier entorno Python con scikit-survival, joblib y pandas. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: para un lote de pacientes (p.ej., 100 pacientes), la predicción se completa en milisegundos en CPU.

## Comparativa con modelos similares

Se comparan con modelos de supervivencia estándar en transcriptómica:

| Modelo | Tipo | Preprocesado | c-index en GSE31210 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unadjusted Cox | Cox PH sobre genes completos | Ninguno | 0.512 | - | Implementación propia |
| ComBat harmonization + Cox | Cox PH tras armonización | ComBat | 0.639 | - | Implementación propia |
| Chara (este modelo) | Coxnet + Graph Laplacian termodinámico | Diffusión de calor | 0.731 | MIT | HuggingFace, PyPI |

El modelo Chara supera en todas las cohortes a las alternativas tradicionales, con mejoras de c-index entre +0.219 y +0.263. No hay otros modelos de supervivencia basados en Graph Laplacian termodinámico en el ecosistema de Hugging Face disponibles en la información proporcionada.

## Limitaciones y advertencias

- Validación limitada al cáncer de páncreas y a los cohortes específicos citados; no se ha probado en otros tipos de cáncer o en poblaciones clínicas reales.
- El modelo no está aprobado como dispositivo clínico; su uso es exclusivamente para investigación y no debe utilizarse en decisiones médicas sin validación adicional.
- El preprocesamiento con dinámica molecular (MARTINI 3) puede ser sensible a la calidad de las anotaciones de genes y a la variabilidad en la anotación de transcriptomas.
- Los datos de validación son de origen público y pueden contener sesgos de selección; no se han evaluado sesgos por raza, edad, sexo u otros factores.
- La firma de 58 genes es específica para la cohorte de entrenamiento y puede no generalizar a otros contextos tumorales.
- No se dispone de análisis de calibración de las curvas de supervivencia ni de intervalos de confianza en la información proporcionada.
- La licencia MIT permite uso comercial, pero el modelo no es un producto sanitario y su uso en entornos clínicos requiere de regulaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SharonMelhi/chara-survival
- Paquete PyPI: https://pypi.org/project/chara-survival/
- Repositorio GitHub: https://github.com/Sharon-codes/Chara
- Portal web interactivo: https://chara-frontend.vercel.app

No se han encontrado papers o publicaciones académicas en la búsqueda web; solo los enlaces anteriores.</think>## Resumen

Chara es un modelo de inferencia de supervivencia (survival regression) orientado a oncología, desarrollado por el Computational and Physical Genomics Laboratory del Indian Institute of Technology Mandi, con Sharon Melhi como creador principal y la Dra. Kharerin Hungyo como investigadora principal. El modelo aborda el problema del cambio de dominio transcriptómico en oncología (por ejemplo, RNA-Seq de Illumina frente a microarrays de Affymetrix) para predecir el pronóstico de pacientes con cáncer. Para ello, construye un Graph Laplacian termodinámico (L_Chara) basado en fluctuaciones de residuos de dinámica molecular de grano grueso (MARTINI 3) y aplica un suavizado por difusión de calor (H_t = exp(-tL)), que disipa el ruido específico de la plataforma de medición mientras preserva la señal biológica real.

El modelo emplea una firma de supervivencia de 4.337 genes con un modelo de riesgos proporcionales de Cox regularizado con L1 (Coxnet), de los cuales 58 son biomarcadores activos. Se distribuye como paquete Python (`chara-survival`), con un modelo serializado en Hugging Face Hub. Su relevancia actual radica en que puede aplicarse a cohortes hospitalarias externas sin necesidad de rearmonización (como ComBat), mostrando mejoras sustanciales en el índice de concordancia (c-index) en validaciones multicéntricas. La licencia es MIT, por lo que permite uso comercial, aunque su ámbito es la investigación biomédica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cox Proportional Hazards con regularización L1 (Coxnet) sobre un Graph Laplacian termodinámico (preprocesamiento de difusión de calor) |
| Parámetros totales | 4.337 coeficientes (genes) |
| Parámetros activos | 58 (biomarcadores no nulos) |
| Longitud de contexto | No aplica (modelo tabular, no de lenguaje) |
| Tipos de cuantización | No aplica (no es un modelo neuronal) |
| Idiomas soportados | No aplica (modelo numérico; documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | Archivo `.pkl` (joblib) que contiene el modelo, el índice de alfa y la lista de genes |

## Arquitectura y entrenamiento

La arquitectura combina un preprocesamiento biopsíquico con un modelo de supervivencia clásico. El preprocesamiento consiste en construir un Graph Laplacian (L_Chara) a partir de las fluctuaciones de los residuos de proteínas obtenidas mediante simulaciones de dinámica molecular de grano grueso (MARTINI 3). Aplicando la matriz de difusión de calor H_t = exp(−tL), se suavizan las expresiones génicas, eliminando ruido específico de la plataforma de medida (por ejemplo, diferencias entre RNA-Seq y microarrays).

El modelo de supervivencia se entrena mediante Coxnet (regresión de Cox con penalización L1) sobre los 4.337 geneses que intersectan entre las plataformas de entrenamiento y validación. El entrenamiento se realiza con el dataset TCGA-PAAD (cáncer de páncreas) y se valida en cinco cohortes externas (ICGC-PACA, GSE15471, GSE28735, GSE57495, GSE31210). No se especifican datos sobre el número total de pacientes en entrenamiento, ni sobre técnicas como RLHF o DPO (no aplicables en este contexto). La regularización L1 es la innovación técnica clave que selecciona 58 biomarcadores con peso predictivo.

## Capacidades

- Predicción de riesgo de supervivencia: calcula un índice de log-hazard para cada paciente a partir de su perfil transcriptómico.
- Generación de curvas de supervivencia individualizadas: utiliza el estimador de Breslow (S0(t)) y los multiplicadores de riesgo para producir curvas de supervivencia específicas por paciente.
- Manejo de datos de distintas plataformas: funciona tanto con RNA-Seq como con microarrays sin necesidad de armonización previa (p. ej., ComBat).
- Identificación de biomarcadores pronósticos: la regularización L1 aísla 58 genes con coeficientes no nulos, incluyendo genes de riesgo (CCL20, DKK1, IGF2BP1) y genes protectores (MS4A1, FAIM2).
- Integración con el ecosistema Python: se usa con `scikit-survival`, `joblib`, `pandas` y `huggingface_hub`.
- Capacidad de cero-shot en microarrays: el modelo se entrena en RNA-Seq y se aplica directamente a microarrays sin ajuste adicional (validado en GSE31210).

## Casos de uso

- Pronóstico del cáncer de páncreas en investigación clínica: el modelo puede estimar el riesgo de supervivencia de pacientes a partir de su perfil de expresión génica, ayudando a estratificar grupos en ensayos clínicos.
- Armonización de datos transcriptómicos multicéntricos: en estudios que combinan datos de RNA-Seq y microarrays de distintos hospitales, Chara elimina la necesidad de métodos de armonización como ComBat, reduciendo artefactos técnicos.
- Descubrimiento de biomarcadores pronósticos: los 58 genes activos pueden ser candidatos para validación experimental en laboratorio, con potencial para terapias dirigidas.
- Validación de firmas genéticas en cohortes independientes: permite comprobar la robustez de una firma de supervivencia en distintas poblaciones y plataformas, esencial para la reproducibilidad.
- Análisis de supervivencia en oncología traslacional: en proyectos de investigación que correlacionan expresión génica con supervivencia, el modelo ofrece una alternativa con menor sesgo técnico.
- Integración en pipelines de bioinformática: al ser un modelo de `scikit-survival`, puede insertarse en flujos de trabajo en Python ya existentes sin necesidad de infraestructura de GPU.

## Benchmarks y rendimiento

Se presentan resultados de índice de concordancia (c-index) en cinco cohortes externas, comparando el modelo Chara con un modelo Cox sin ajuste y con un Cox después de armonización con ComBat.

| Cohort | Platform | n | Unadjusted Cox | ComBat Harmonization | Chara Laplacian |
|---|---|---|---|---|---|
| ICGC-PACA (AU) | RNA-Seq (HiSeq) | 269 | 0.531 | 0.682 | 0.784 |
| GSE15471 | Affymetrix HG-U133+2.0 | 78 | 0.508 | 0.641 | 0.762 |
| GSE28735 | GeneChip Human 1.0 ST | 90 | 0.522 | 0.665 | 0.771 |
| GSE57495 | Agilent Human Genome | 63 | 0.495 | 0.628 | 0.758 |
| GSE31210 | Zero-Shot Microarray | 226 | 0.512 | 0.639 | 0.731 |

En los metadatos de Hugging Face se citan además Brier score y AUC dependiente del tiempo como métricas, pero no se publican los valores numéricos en la información disponible.

## Requisitos de hardware

- El modelo ocupa menos de 1 MB en disco, por lo que no requiere GPU ni memoria especial.
- Inferencia en CPU: cualquier procesador moderno es suficiente para calcular los riesgos y curvas de supervivencia.
- Memoria RAM: menos de 100 MB para cargar el modelo y procesar matrices de pacientes por genes.
- Despliegue: se integra en entornos Python con `scikit-survival`, `joblib` y `pandas`. No necesita vLLM, llama.cpp, Ollama ni TGI.
- Latencia: en CPU, para un lote de 100 pacientes, la predicción se completa en milisegundos.

## Comparativa con modelos similares

| Modelo | Tipo | Preprocesamiento | c-index en GSE31210 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unadjusted Cox | Cox PH | Ninguno | 0.512 | - | Implementación propia |
| ComBat + Cox | Cox PH | Armonización ComBat | 0.639 | MIT | Implementación propia |
| Chara (este) | CoxPH + Graph Laplacian termodinámico | Difusión de calor | 0.731 | MIT | Hugging Face, PyPI, GitHub |

No se han encontrado otros modelos de supervivencia con Graph Laplacian termodinámico en el ecosistema de HuggingFace en la información disponible.

## Limitaciones y advertencias

- Validación limitada al cáncer de páncreas: no se ha probado en otros tipos de cáncer, por lo que su generalización fuera de este dominio es incierta.
- No es un dispositivo clínico: el modelo está pensado para investigación y no debe usarse en decisiones médicas individuales sin una validación clínica adicional.
- Dependencia de la calidad de las anotaciones genómicas: el preprocesamiento con dinámica molecular requiere estructuras de proteínas fiables, lo que puede ser una limitación en genes poco caracterizados.
- Los resultados de validación se basan en cohortes públicas, que pueden contener sesgos demográficos o geográficos no evaluados en la documentación.
- No se reportan intervalos de confianza para los c-index ni análisis de sensibilidad.
- La firma de 58 biomarcadores puede ser específica de la cohorte de entrenamiento (TCGA-PAAD) y no replicarse en otros contextos moleculares.
- La licencia MIT permite uso comercial, pero el modelo no está certificado para uso clínico y debe usarse con cautela en contextos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SharonMelhi/chara-survival
- Paquete PyPI: https://pypi.org/project/chara-survival/
- Repositorio GitHub: https://github.com/Sharon-codes/Chara
- Portal web interactivo: https://chara-frontend.vercel.app

No se han encontrado publicaciones académicas o papers en la búsqueda web, solo los recursos anteriores.</think>## Resumen

Chara es un modelo de inferencia de supervivencia (survival regression) orientado a oncología, desarrollado por el Computational and Physical Genomics Laboratory del Indian Institute of Technology Mandi (IIT Mandi), con Sharon Melhi como creador y la Dra. Kharerin Hungyo como investigadora principal. Su propósito es resolver el problema del cambio de dominio transcriptómico entre plataformas de medición (por ejemplo, RNA-Seq de Illumina frente a microarrays de Affymetrix) en la predicción de supervivencia de pacientes con cáncer. Para ello, construye un Graph Laplacian termodinámico (L_Chara) basado en fluctuaciones de residuos de dinámica molecular de grano grueso (MARTINI 3) y aplica un suavizado por difusión de calor (H_t = exp(−tL)), que disipa el ruido específico de la plataforma mientras preserva la señal biológica real.

El modelo emplea una firma de supervivencia de 4.337 genes con un modelo de riesgos proporcionales de Cox regularizado con L1 (Coxnet), de los que solo 58 genes son biomarcadores activos. Se distribuye como un paquete Python (`chara-survival`) y como un modelo serializado en Hugging Face Hub. Su relevancia es que se puede aplicar a cohortes hospitalarias externas sin necesidad de rearmonización (como ComBat), mostrando mejoras sustanciales en el índice de concordancia (C-index) en validaciones multicéntricas. La licencia MIT permite uso comercial, aunque el ámbito principal es la investigación biomédica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cox Proportional Hazards con regularización L1 (Coxnet) sobre un Graph Laplacian termodinámico (preprocesamiento por difusión de calor) |
| Parámetros totales | 4.337 coeficientes (genes) |
| Parámetros activos | 58 (biomarcadores no nulos) |
| Longitud de contexto | No aplica (modelo tabular, no de lenguaje) |
| Tipos de cuantización | No aplica (no es un modelo neuronal) |
| Idiomas soportados | No aplica (modelo numérico; documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | Modelo `.pkl` (joblib) que contiene el modelo, el índice de alfa y la lista de genes |

## Arquitectura y entrenamiento

La arquitectura combina un preprocesamiento biopsíquico con un modelo de supervivencia clásico. El preprocesamiento construye un Graph Laplacian (L_Chara) a partir de las fluctuaciones de los residuos de proteínas obtenidas mediante simulaciones de dinámica molecular de grano grueso (MARTINI 3). Aplicando la matriz de difusión de calor H_t = exp(−tL), se suavizan las expresiones génicas, eliminando el ruido específico de la plataforma de medición (por ejemplo, diferencias entre RNA-Seq y microarrays).

El modelo de supervivencia se entrena como Coxnet con regularización L1 sobre los 4.337 geneses que intersectan entre las plataformas de entrenamiento y validación. El entrenamiento se realiza con el conjunto TCGA-PAAD (cáncer de páncreas) y se valida en cinco cohortes externas (ICGC-PACA, GSE15471, GSE28735, GSE57495, GSE31210). No se especifican datos sobre el número de pacientes en el entrenamiento ni se detallan técnicas como RLHF o DPO, ya que no aplican en este contexto. La regularización L1 es la innovación técnica clave, ya que reduce el número de biomarcadores de miles a 58, facilitando su interpretación y validación experimental.

## Capacidades

- Predicción de riesgo de supervivencia: calcula un índice de log-hazard para cada paciente a partir de su perfil transcriptómico.
- Generación de curvas de supervivencia individualizadas: utiliza el estimador de Breslow (S0(t)) y los multiplicadores de riesgo para producir curvas de supervivencia específicas por paciente.
- Manejo de datos de múltiples plataformas: funciona con RNA-seq y microarrays sin necesidad de armonización previa (como ComBat).
- Identificación de biomarcadores pronósticos: la regularización L1 aísla 58 genes con coeficientes positivos (riesgo) y negativos (protectores), incluyendo genes como CCL20, DKK1, MS4A1 y FAIM2.
- Integración con el ecosistema Python: se usa con `scikit-survival`, `joblib`, `pandas` y `huggingface_hub`.
- Capacidad de zero-shot en plataformas: el modelo entrenado en RNA-Seq se aplica directamente a microarrays sin ajuste adicional (validado en GSE31210).

## Casos de uso

- Investigación del pronóstico del cáncer de páncreas: el modelo puede estimar el riesgo de supervivencia de pacientes nuevos a partir de su expresión transcriptómica, lo que permite estratificar pacientes en ensayos clínicos.
- Armonización de datos transcriptómicos multicéntricos: en estudios que combinan datos de RNA-Seq y microarrays de diferentes hospitales, el modelo elimina las diferencias técnicas sin necesidad de métodos como ComBat, reduciendo artefactos.
- Descubrimiento de biomarcadores pronósticos: los 58 genes activos pueden ser candidatos para validación experimental en laboratorio, con potencial para el desarrollo de dianas terapéuticas.
- Validación de firmas genéticas en cohortes independientes: permite comprobar la robustez de una firma de supervivencia en distintas poblaciones y plataformas antes de su aplicación clínica.
- Análisis de supervivencia en estudios traslacionales: en proyectos que correlacionan expresión genética con supervivencia, el modelo ofrece una alternativa robusta a los métodos tradicionales de Cox.
- Integración en pipelines de bioinformática: al ser un modelo de `scikit-survival`, se puede incorporar fácilmente a flujos de trabajo en Python existentes sin necesidad de GPU ni infraestructura pesada.

## Benchmarks y rendimiento

Se presentaron resultados de índice de concordancia (C-index) en cinco cohortes externas, comparando el modelo Chara con un modelo Cox sin ajuste y con un Cox después de armonización con ComBat.

| Cohort | Plataforma | n | Unadjusted Cox | ComBat Harmonization | Chara Laplacian |
|---|---|---|---|---|---|
| ICGC-PACA (AU) | RNA-Seq (HiSeq) | 269 | 0.531 | 0.682 | 0.784 |
| GSE15471 | Affymetrix HG-U133+2G | 86 | 0.508 | 0.641 | 0.762 |
| GSE28735 | GeneChip Human 1.0 ST | 90 | 0.522 | 0.665 | 0.771 |
| GSE57495 | Agilent Human Genome | 63 | 0.495 | 0.628 | 0.758 |
| GSE31210 | Zero-Shot Microarray | 226 | 0.512 | 0.639 | 0.731 |

En los metadatos de Hugging Face se mencionan además Brier score y time-dependent AUC, pero no se publican valores concretos en la información disponible.

## Requisitos de hardware

- El modelo ocupa menos de 1 GB en disco, por lo que no requiere GPU ni gran memoria.
- Inferencia en CPU: cualquier procesador moderno es suficiente para calcular riesgos y curvas de supervivencia.
- Memoria RAM: menos de 100 MB para cargar el modelo y procesar matrices de pacientes por genes.
- Despliegue: se integra en entornos Python con `scikit-survival`, `joblib` y `pandas`. No necesita vLLM, llama.cpp, Ollama ni TGI.
- Latencia: para un lote de 100 pacientes, la predicción se completa en milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Preprocesamiento | C-index en GSE31210 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cox sin ajuste | Cox PH | Ninguno | 0.512 | MIT | Implementación propia |
| ComBat + Cox | Cox PH | Armonización ComBat | 0.639 | MIT | Implementación propia |
| Chara (este) | CoxPH + Graph Laplacian termodinámico | Difusión de calor | 0.731 | MIT | Hugging Face, PyPI, GitHub |

No se han encontrado otros modelos de supervivencia que utilicen un Graph Laplacian termodinámico en el ecosistema de Hugging Face en la información disponible.

## Limitaciones y advertencias

- Validación limitada al adenocarcinoma de páncreas: no modelo no ha sido probado en otros tipos de cáncer, por lo que su generalización es incierta.
- No es un dispositivo clínico: el modelo está pensado para investigación y no debe usarse en decisiones médicas individuales sin una validación clínica adicional.
- Depende de la calidad de las anotaciones genómicas: el preprocesamiento con dinámica molecular requiere estructuras de proteína fiables, lo que puede ser limitante para genes poco caracterizados.
- Los cohortes de validación son públicos y pueden tener sesgos demográficos o geográficos no evaluados en la documentación.
- No se reportan intervalos de confianza para los C-index ni análisis de sensibilidad.
- La firma de 58 genes puede ser específica de la cohorte de entrenamiento (TCGA-PAAD) y no replicarse en otros contextos moleculares.
- La licencia MIT permite uso comercial, pero el modelo no está certificado para uso clínico, por lo que cualquier aplicación en entornos regulados requiere autorización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SharonMelhi/chara-survival
- Paquete PyPI: https://pypi.org/project/chara-survival/
- Repositorio GitHub: https://github.com/Sharon-codes/Chara
- Portal web interactivo: https://chara-frontend.vercel.app

No se han encontrado publicaciones académicas o papers en la búsqueda web, solo los enlaces anteriores.
