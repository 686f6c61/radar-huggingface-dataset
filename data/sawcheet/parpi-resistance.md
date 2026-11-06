# sawcheet/parpi-resistance

## Resumen

`parpi-resistance` es un artefacto de aprendizaje automatico publicado en Hugging Face por el usuario `sawcheet` que asigna a cada celula de una muestra de scRNA-seq una puntuacion continua entre 0 y 1 que refleja su grado de adaptacion al inhibidor de PARP olaparib (0 = no tratada, 1 = adaptada a la dosis maxima de entrenamiento). El modelo se enmarca en el estudio de la dinamica de resistencia a farmacos en cancer de ovario y extiende el trabajo de Satyal, Long y Gao sobre autoencoders graficos jerarquicos con atencion a un esquema de aprendizaje a nivel de celula con validacion leave-one-line-out.

El artefacto liberado no es una red neuronal profunda sino un modelo lineal de tipo ridge serializado con `joblib`, entrenado sobre 31.762 celulas procedentes de tres lineas celulares de cancer de ovario (kuramochi, cov362 y ovsaho) expuestas a diez dosis de olaparib entre 0 y 320 µM. El repositorio de Hugging Face pesa 0,0 GB, no registra descargas ni likes y se distribuye bajo licencia MIT.

Su relevancia es acotada y muy especifica: cubre un nicho de biologia computacional (puntuacion de adaptacion a farmacos a nivel de celula individual) y esta explicitamente marcado por el autor como herramienta de uso exclusivamente investigador, no diagnostico y no valida para tumores ni pacientes. No es un modelo de lenguaje ni un modelo fundacional: es un pipeline de scikit-learn empaquetado como biblioteca Python propia (`parpi`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge (modelo lineal) sobre caracteristicas de expresion genica agregadas por conjuntos Hallmark y Reactome |
| Parametros totales | no disponible (modelo lineal; numero de coeficientes no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: matriz de recuentos por celula, minimo 60% de los genes del modelo presentes) |
| Tipos de cuantizacion | no aplica (pesos `joblib` en coma flotante) |
| Idiomas soportados | no aplica (datos genomicos, no texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion de scikit-learn), cargado via `ModelBundle.load("hf://sawcheet/parpi-resistance")` |
| Tamano del repositorio | 0,0 GB |
| Celulas de entrenamiento | 31.762 (kuramochi, cov362, ovsaho) |
| Dosis de entrenamiento (µM) | 0,0; 1,0; 2,5; 5,0; 10,0; 20,0; 40,0; 80,0; 160,0; 320,0 |
| Huella de configuracion | `da7e460af890` |
| Commit git | `6772349b0f41b0608afae76bed7713974e945952` |

## Arquitectura y entrenamiento

El modelo liberado es un `ridge` (regresion lineal con regularizacion L2) que opera sobre representaciones de expresion genica a nivel de celula construidas a partir de conjuntos de genes Hallmark y Reactome. No se especifica en la model card el numero exacto de caracteristicas ni el valor del hiperparametro de regularizacion. El autor lo presenta como una extension del modelo jerarquico de autoencoder grafico con atencion de Satyal, Long y Gao (*Attention-Based Hierarchical Graph Autoencoder for Dose-Specific Single-Cell Resistance Dynamics*), trasladando el aprendizaje de dinamicas de resistencia especificas por dosis al nivel de celula individual y anadiendo validacion con lineas celulares no vistas durante el entrenamiento.

Los datos de entrenamiento proceden del estudio de Franca et al., *Cellular adaptation to cancer therapy along a resistance continuum* (Nature 631, 876-883, 2024; GEO SuperSeries GSE247691). El conjunto cubre 31.762 celulas de tres lineas de cancer de ovario expuestas a un gradiente de diez dosis de olaparib. La validacion principal es leave-one-line-out: se entrena con dos lineas y se evalua en la tercera, lo que mide la capacidad de generalizacion a lineas celulares no vistas. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento por preferencias, algo esperable en un modelo de regresion biologica. Tampoco se detalla el preprocesado exacto (normalizacion, seleccion de genes, calculo de puntuaciones por conjunto) mas alla de que la entrada son recuentos crudos con simbolos genicos HGNC.

## Capacidades

- Puntuacion de adaptacion a olaparib por celula: devuelve un valor continuo entre 0 (no tratada) y 1 (adaptada a la dosis maxima de entrenamiento).
- Prediccion por lotes: `bundle.predict(read_any("my_sample.h5ad"))` genera una fila por celula.
- Entrada en formato AnnData (`h5ad`) con recuentos crudos y simbolos genicos HGNC humanos; requiere al menos el 60% de los genes del modelo presentes en la muestra.
- Atribucion de vias biologicas: el campo `top_pathways` identifica conjuntos Hallmark asociados a la puntuacion de cada celula.
- Comparacion relativa intra-experimento: permite contrastar muestras tratadas frente a no tratadas de la misma linea celular.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.
- No proporciona puntuaciones de resistencia a nivel de tumor ni de paciente.

## Casos de uso

- Clasificacion de dosis en cribados de linea celular: dado un experimento con varias dosis de olaparib sobre una linea de cancer de ovario no incluida en el entrenamiento, el modelo ordena las dosis segun el grado de adaptacion observado, con Spearman de dosis entre 0,70 y 0,99 en validacion leave-one-line-out.
- Deteccion de subpoblaciones adaptadas dentro de una muestra: la puntuacion por celula permite separar, dentro de un mismo pocillo, celulas que han activado programas de adaptacion de las que no, util para analisis de heterogeneidad en scRNA-seq.
- Analisis de vias asociadas a la adaptacion: el campo `top_pathways` facilita generar hipotesis sobre que programas Hallmark (por ejemplo, respuesta a estres o metabolismo) acompanan la adaptacion a olaparib en un experimento concreto.
- Control de calidad de experimentos de adaptacion a farmacos: comparar la senal de adaptacion entre replicas tecnicas o biologicas de la misma linea para detectar desviaciones experimentales.
- Priorizacion de muestras para validacion experimental: usar la puntuacion como filtro barato antes de seleccionar poblaciones para secuenciacion mas profunda o ensayos funcionales.
- Analisis secundario de datos publicos de cancer de ovario: aplicar el modelo a conjuntos scRNA-seq de lineas celulares ovaricas con tratamiento con olaparib para contrastar hallazgos publicados, siempre dentro del dominio validado (lineas celulares in vitro, no PDX ni tumores).

## Benchmarks y rendimiento

Resultados publicados en la model card. La validacion cruzada es leave-one-line-out: cada linea de entrenamiento se excluye a su vez y el modelo se entrena con las otras dos.

| Linea excluida | Spearman de dosis | AUROC no tratada vs dosis maxima | MAE por celula | MAE de la linea base media |
|---|---|---|---|---|
| cov362 | 0,700 | 0,756 | 0,201 | 0,226 |
| kuramochi | 0,988 | 0,942 | 0,247 | 0,307 |
| ovsaho | 0,900 | 0,778 | 0,203 | 0,191 |

Evaluacion en conjuntos externos (AUROC separa celulas tratadas/resistentes de no tratadas; 0,5 equivale a azar):

| Conjunto | Cancer | AUROC | Celulas | Rol |
|---|---|---|---|---|
| kuramochi_10x | ovario | 1,000 | 8.474 | validado (gated) |
| pdx_resistance | ovario | 0,614 | 8.515 | solo informativo |
| pdx_resistance_allcells | ovario | 0,650 | 19.890 | solo informativo |
| pdx_persistence | ovario | no aplica (sin etiquetas de resistencia) | — | solo informativo |

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo ridge serializado con `joblib`, la prediccion no requiere GPU; un portatil convencional puede procesar decenas de miles de celulas en segundos o pocos minutos.
- Memoria RAM: dominada por la matriz de expresion de entrada (celulas x genes), no por los pesos del modelo. Para 20.000 celulas con un panel de ~20.000 genes en float32 se estiman varios GB; el uso real depende del preprocesado.
- GPU: no necesaria. Cualquier GPU consumer (RTX 3060 o superior) solo aportaria ventaja si el preprocesado se acelera con frameworks como RAPIDS.
- Despliegue: paquete Python `parpi` instalado desde el repositorio GitHub (`git clone https://github.com/sachitsatyal/parpi-resistance`), con `uv sync --all-extras` para dependencias y `ModelBundle.load("hf://sawcheet/parpi-resistance")` para cargar pesos. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados. Por la naturaleza del modelo (producto matriz-vector por celula) se espera un coste lineal en el numero de celulas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados con el mismo objetivo (puntuacion de adaptacion a olaparib por celula en scRNA-seq). El trabajo de referencia de Satyal, Long y Gao describe un autoencoder grafico jerarquico con atencion para dinamicas de resistencia por dosis, pero no se aportan sus metricas ni su disponibilidad publica en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

| Modelo | Tipo | Nivel de prediccion | Licencia | Disponibilidad |
|---|---|---|---|---|
| parpi-resistance (este) | Ridge sobre conjuntos Hallmark/Reactome | Celula individual, in vitro | MIT | Hugging Face + GitHub |
| Satyal, Long, Gao (referencia) | Autoencoder grafico jerarquico con atencion | Dinamica de resistencia por dosis | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivamente investigador: el autor declara explicitamente que no es un diagnostico ni una medida de resistencia tumoral o de paciente.
- No validado en cancer de mama ni en tumores o pacientes; las puntuaciones no deben interpretarse como riesgo clinico.
- Rendimiento limitado en datos de PDX: AUROC de 0,614 y 0,650 en `pdx_resistance` y `pdx_resistance_allcells`, muy por debajo de los conjuntos validados, y excluidos de la afirmacion principal.
- Niveles absolutos no comparables entre lineas celulares: las puntuaciones se desplazan entre lineas, por lo que solo deben compararse muestras dentro de un mismo experimento.
- Incertidumbre no calibrada: la dispersion del ensemble subestima el error real segun el propio autor.
- Atribucion de vias incompleta y potencialmente enganosa: `top_pathways` solo nombra conjuntos Hallmark, pero el modelo tambien usa Reactome; varios conjuntos Reactome con nombres inmunitarios o virales comparten los mismos 43 genes de proteasoma, lo que puede inducir a error. El autor planea una version v0.2 solo con Hallmark.
- Dependencia del preprocesado: exige recuentos crudos, simbolos HGNC humanos y al menos el 60% de los genes del modelo presentes; muestras con paneles reducidos o anotaciones distintas pueden degradar o invalidar la prediccion.
- Modelo lineal: no captura interacciones no lineales ni estructura de grafo entre genes, a diferencia del autoencoder de referencia.
- Sin datos de sesgo demografico ni de equidad, por la naturaleza in vitro del entrenamiento (lineas celulares, no muestras humanas diversas).
- Licencia MIT: permite uso comercial segun los terminos de la licencia, pero la restriccion de uso investigador es una advertencia cientifica del autor, no una clausula legal adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sawcheet/parpi-resistance
- Repositorio GitHub: https://github.com/sachitsatyal/parpi-resistance
- Articulo de datos (Franca et al., Nature 2024): https://www.nature.com/articles/s41586-024-07662-z
- GEO SuperSeries GSE247691: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE247691
- Articulo de arquitectura de referencia (Satyal, Long, Gao): no disponible como enlace en la informacion proporcionada
