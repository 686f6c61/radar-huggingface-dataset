# pramit-dutta/ehr-prediction-model

## Resumen

DualStreamEHRTransformer es un modelo de transformer causal de doble flujo diseñado para predecir condiciones clínicas incidentes a partir de historiales clínicos electrónicos (EHR) longitudinales y datos genómicos. Lo publica el investigador Pramit Dutta en HuggingFace bajo el identificador `pramit-dutta/ehr-prediction-model`, con licencia MIT y un repositorio de 0,1 GB que contiene únicamente pesos en PyTorch (`pytorch_model.bin`), configuración, vocabulario y un resumen de evaluación.

El problema que aborda es la predicción multi-etiqueta de 40 condiciones clínicas a un horizonte de cinco años, combinando dos flujos de entrada: uno clínico (diagnósticos, medicamentos, procedimientos, observaciones de laboratorio discretizadas y estudios de imagen, con embeddings temporales de edad) y otro genómico (variantes de secuencia de ADN). La arquitectura sigue la línea de nanoGPT y BEHRT, con una primera fase de preentrenamiento por predicción de siguiente token sobre la línea temporal clínica y una segunda fase de ajuste fino con entropía cruzada binaria multi-etiqueta y enmascaramiento dinámico de diagnósticos preexistentes.

Se trata de un modelo compacto: vocabulario de 1.362 tokens clínicos, longitud máxima de secuencia de 1.024 eventos, dimensión oculta de 256, 4 capas de transformer y 4 cabezas de atención. No se ha publicado el número total de parámetros ni resultados numéricos de benchmarks. Es relevante como ejemplo reproducible de modelado EHR con fusión multimodal clínica-genómica y como punto de partida para transferencia a tareas de predicción clínica, aunque su validación en datos reales no está documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de doble flujo (flujo clínico + flujo genómico), inspirado en nanoGPT y BEHRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 eventos (max sequence length de la configuracion) |
| Tipos de cuantizacion | no disponible; solo se publican pesos PyTorch sin cuantizar |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); no se publican safetensors ni GGUF |
| Tamano de vocabulario | 1.362 tokens clinicos |
| Dimension oculta | 256 |
| Capas de transformer | 4 |
| Cabezas de atencion | 4 |
| Objetivos de prediccion | 40 clases binarias multi-etiqueta (condiciones incidentes a 5 anos) |
| Dataset de entrenamiento | Synthea (datos sinteticos de pacientes) |
| Metricas declaradas | ROC-AUC, average precision, accuracy |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo implementa dos flujos paralelos que se fusionan antes de la cabeza de clasificación. El flujo clínico procesa una secuencia ordenada temporalmente de tokens clínicos —diagnósticos, medicamentos, procedimientos, observaciones de laboratorio discretizadas en bins y estudios de imagen— enriquecidos con embeddings de edad y codificaciones posicionales. El flujo genómico genera embeddings de variantes de secuencia de ADN y se proyecta linealmente sobre el espacio del flujo clínico; cuando no hay datos genómicos disponibles, la contribución de este flujo se anula explícitamente mediante una operación de zero-out, lo que permite entrenar e inferir con o sin información genómica.

El entrenamiento se divide en dos etapas. La etapa 1 es un preentrenamiento autoregresivo de predicción del siguiente token sobre la línea temporal clínica. La etapa 2 ajusta el modelo con una pérdida de entropía cruzada binaria multi-etiqueta sobre 40 objetivos clínicos, aplicando un enmascaramiento dinámico de diagnósticos preexistentes para forzar al modelo a predecir condiciones incidentes y no la mera recuperación de diagnósticos ya presentes en el historial. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la proporción de pacientes ni si se aplicaron técnicas de alineación como RLHF o DPO.

La configuración publicada corresponde a un modelo pequeño (dimensión oculta 256 y 4 capas), coherente con el tamaño del repositorio. A partir de esos hiperparámetros, el orden de magnitud estaría en unos pocos millones de parámetros, pero el dato exacto de parámetros totales no se ha publicado y por tanto no se confirma.

## Capacidades

- Predicción multi-etiqueta de 40 condiciones clínicas incidentes con horizonte de 5 años.
- Procesamiento de historiales clínicos longitudinales de hasta 1.024 eventos por paciente.
- Modelado conjunto de datos clínicos (diagnósticos, medicamentos, procedimientos, laboratorio, imagen) y genómicos (variantes de ADN) mediante fusión por proyección lineal.
- Inferencia en modo solo clínico: el flujo genómico se anula de forma explícita cuando no hay datos de ese tipo.
- Preentrenamiento causal de línea temporal clínica, que puede servir como base para transferencia a otras tareas EHR.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional ni un agente.
- No soporta razonamiento multi-paso guiado por instrucciones, ni visión, ni audio, ni generación de texto libre orientada a usuario.
- Capacidades multilingües: no disponibles; el vocabulario y el entrenamiento están en inglés.

## Casos de uso

- Predicción de riesgo a 5 años en sistemas de historia clínica electrónica: el modelo consume la secuencia de eventos del paciente (hasta 1.024) y devuelve 40 probabilidades de incidencia, lo que permite integrarlo como servicio de scoring periódico sobre cohortes existentes.
- Alertas tempranas para enfermedades crónicas: al combinar diagnósticos, medicación y analíticas discretizadas, puede señalizar pacientes con trayectorias compatibles con diabetes, insuficiencia cardiaca u otras condiciones del conjunto de 40 objetivos para revisión por parte del clínico.
- Medicina de precisión con datos genómicos: cuando existe panel genómico, el flujo de variantes se fusiona con el clínico, lo que permite estudiar cómo el perfil genético modula el riesgo incidente en subpoblaciones concretas.
- Priorización de programas de cribado: usar las probabilidades multi-etiqueta para ordenar listas de espera o seleccionar candidatos a pruebas de confirmación costosas, siempre como herramienta de apoyo y no como sustituto del juicio clínico.
- Investigación epidemiológica y modelado de trayectorias: el preentrenamiento autoregresivo sobre la línea temporal permite estudiar secuencias de eventos y simular trayectorias sintéticas para generar hipótesis.
- Estratificación de cohortes en ensayos clínicos: asignar pacientes a estratos de riesgo según las predicciones para equilibrar brazos de tratamiento o definir criterios de inclusión.
- Transferencia a otras tareas EHR: reutilizar los pesos preentrenados (etapa 1) y reajustar la cabeza de clasificación para nuevos objetivos clínicos con vocabulario compatible.
- Validación metodológica y reproducibilidad: servir como referencia reproducible de arquitectura de doble flujo sobre datos Synthea en experimentos académicos de modelado clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara el uso de ROC-AUC, average precision y accuracy como metricas, y el repositorio incluye un fichero `eval_summary.json` con el resumen de metricas de validacion, pero no se proporcionan los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con los hiperparametros publicados (dimension oculta 256, 4 capas, secuencia de 1024) y un repositorio de 0,1 GB, el modelo es muy pequeno y cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU con al menos unos pocos GB de VRAM es suficiente; no requiere A100 ni H100.
- GPU de consumo: si, cabe en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o inferiores; previsiblemente tambien en GPU integradas con memoria suficiente.
- Opciones de despliegue: al publicarse solo `pytorch_model.bin`, `config.json` y `vocab.json`, el despliegue requiere cargar los pesos con PyTorch y ejecutar el codigo de inferencia del autor. No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia estandar.
- Latencia y throughput: no disponibles. Para este tamano de modelo y estas dimensiones, la inferencia por paciente seria del orden de milisegundos en GPU y decenas o centenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualStreamEHRTransformer (`pramit-dutta/ehr-prediction-model`) | no disponible (dim. oculta 256, 4 capas) | 1.024 eventos clinicos | Prediccion multi-etiqueta de 40 condiciones incidentes con fusion clinica-genomica | MIT | Pesos PyTorch en HuggingFace |
| BEHRT | no disponible en la informacion proporcionada | no disponible | Prediccion de enfermedad sobre EHR | no disponible | Referencia academica citada como inspiracion |
| nanoGPT | no disponible en la informacion proporcionada | no disponible | Modelado de lenguaje autoregresivo | no disponible | Referencia de implementacion citada como inspiracion |

No se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de otras alternativas especificas de prediccion EHR multietiqueta con fusion genomica, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No se han publicado valores de ROC-AUC, average precision ni accuracy; el rendimiento real es desconocido.
- El entrenamiento se realiza sobre el dataset Synthea, que genera pacientes sinteticos. La generalizacion a datos clinicos reales no esta validada y puede degradarse por diferencias de distribucion, codificacion y sesgo de documentacion.
- No es un modelo de lenguaje conversacional: no admite instrucciones en lenguaje natural, tool calling, agentes ni generacion de texto.
- La unica lengua documentada es el ingles; el vocabulario de 1.362 tokens esta ligado a una codificacion clinica concreta y no es portable directamente a otras codificaciones ni a otros idiomas.
- El contexto maximo es de 1.024 eventos; historiales mas largos requieren truncado o ventanas, lo que puede perder informacion clinica relevante.
- Riesgo de errores de prediccion (falsos positivos y falsos negativos) con impacto clinico potencial; no debe usarse como herramienta diagnostica autonoma ni como sustituto del criterio medico.
- La licencia MIT permite uso comercial, modificacion y redistribucion con atribucion, pero no implica ninguna garantia de idoneidad clinica ni exime del cumplimiento de normativas sanitarias (por ejemplo, MDR en la UE o HIPAA en Estados Unidos).
- El repositorio contiene un fichero `.bin` de PyTorch (pickle), no safetensors; cargar pesos de origen no verificado implica riesgos de seguridad asociados a la deserializacion de pickle.
- El modelo se publico con 0 descargas y 0 likes registrados, sin validacion externa ni revision por pares documentada.
- No se documentan sesgos demograficos, de genero, de etnia ni de acceso sanitario; estos pueden estar presentes en los datos sinteticos y en cualquier ajuste posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pramit-dutta/ehr-prediction-model
- Perfil del autor en GitHub: https://github.com/PramitDutta1999/
- Perfil del autor en Google Scholar: https://scholar.google.com/citations?user=jfOjIKsAAAAJ&hl=en
- Perfil de autor en aimodels.fyi: https://www.aimodels.fyi/author-profile/pramit-dutta-4ed546e3-5a41-4314-8171-0414667940e2
- Revision de modelos de prediccion diagnostica basados en IA y EHR en atencion primaria (JMIR Medical Informatics): https://medinform.jmir.org/2025/1/e62862/
- Evaluacion de modelos de prediccion diagnostica en atencion primaria (ScienceDirect): https://www.sciencedirect.com/org/science/article/pii/S2291969425001747
