# programmable-genomics/BATv1

## Resumen

BATv1 (Cherimoya Binding ATlas) es una coleccion de 17.145 modelos de prediccion genomica desarrollados por el colectivo programmable-genomics, entrenados sobre experimentos ChIP-seq del proyecto ENCODE. Cada modelo predice, a partir de una secuencia de ADN y la senal de control del experimento, el perfil de union de factores de transcripcion y otras proteinas asociadas al ADN con resolucion de base y especificidad de hebra, junto con el recuento total de lecturas.

Cada modelo individual es una red convolucional residual compacta de la familia BPNet, con solo 45.586 parametros, que resuelve el problema de mapear secuencia a funcion genomica (sequence-to-function) para un experimento ENCODE concreto. El atlas completo cubre 3.429 experimentos ChIP-seq de 1.139 dianas en 183 muestras biologicas, con validacion cruzada de 5 particiones por cromosomas excluidos.

Su relevancia radica en ofrecer checkpoints listos para usar y metricas de rendimiento publicas por experimento y fold, evitando reentrenar desde cero modelos de perfil de union. El modelo subyacente, Cherimoya, esta documentado en https://github.com/jmschrei/cherimoya. No es un modelo de lenguaje ni un modelo generico: esta disenado exclusivamente para tareas de genomica regulatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional residual (familia BPNet), 9 capas, 32 filtros |
| Parametros totales | 45.586 por modelo (17.145 modelos en el atlas) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | Ventana de entrada de 2.114 pb; salida sobre los 1.000 pb centrales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre secuencias de ADN) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Checkpoints PyTorch (.torch), pesos EMA shadow |

## Arquitectura y entrenamiento

Cada modelo Cherimoya es una red convolucional residual compacta con 9 capas y 32 filtros, perteneciente a la familia BPNet de modelos sequence-to-function. Recibe dos entradas sobre una ventana de 2.114 pares de bases: una codificacion one-hot de la secuencia de ADN con forma `(N, 4, 2114)` (canales en orden ACGT) y la senal de control del experimento con forma `(N, 2, 2114)` (recuentos por base de los bigWigs de control en hebras plus y minus). Produce dos salidas sobre los 1.000 pb centrales: una cabeza de perfil con logits de forma `(N, 2, 1000)`, donde el perfil predicho es un unico softmax conjunto sobre ambas hebras y las 1.000 posiciones, y una cabeza de recuento de forma `(N, 1)` que predice el logaritmo natural de (lecturas totales + 1).

El entrenamiento se realizo sobre el genoma humano GRCh38/hg38 frente a la senal ChIP-seq observada de cada experimento, usando los bigWigs de control como segunda entrada. Las regiones de entrenamiento son los picos del experimento mas regiones de fondo no-pico emparejadas por contenido GC, tomadas del fichero de regiones de entrenamiento de ENCODE y con la lista de exclusion ENCFF940NTE eliminada. Cada modelo se entreno al menos 20 epocas, extendiendo el entrenamiento hasta unos 20.000 pasos de optimizador en conjuntos pequenos (minimo 10.000). Los checkpoints publicados son los pesos shadow de la media movil exponencial (EMA) en la epoca con mejor correlacion de Pearson de recuento en validacion. La validacion cruzada usa 5 folds que particionan el genoma por cromosomas, identicos para todos los experimentos. No hay informacion sobre RLHF/DPO ni datos de preentrenamiento adicionales.

## Capacidades

- Prediccion de perfiles ChIP-seq a resolucion de base y especificos de hebra a partir de secuencia de ADN y senal de control
- Prediccion del recuento total de lecturas (log-count) sobre ventanas de 1.000 pb
- Modelado de union de factores de transcripcion y otras proteinas asociadas al ADN para un experimento ENCODE concreto (un modelo por experimento)
- Cobertura de 1.139 dianas (targets) en 183 muestras biologicas de ENCODE
- Metricas de evaluacion publicas por experimento y fold (perfil y recuento, sobre picos y fondo)
- No soporta lenguaje natural, codigo, vision ni tool calling; no es un modelo conversacional

## Casos de uso

- Prediccion de union de factores de transcripcion en secuencias candidatas: dado un locus de interes, se puede consultar el modelo del experimento ENCODE correspondiente para obtener el perfil de union predicho por hebra sin ejecutar un ensayo ChIP-seq.
- Analisis de variantes geneticas: comparando perfiles predichos entre alelo de referencia y alternativo se pueden priorizar variantes no codificantes con impacto potencial en la union de factores de transcripcion.
- Diseno de secuencias regulatorias sinteticas: las cabezas de perfil y recuento permiten evaluar in silico como cambios de secuencia afectan la senal de union, util en diseno de promotores o enhancers.
- Estudios de especificidad de factor de transcripcion: con 1.139 dianas disponibles, se pueden comparar perfiles del mismo factor en distintas muestras biologicas (183 biosamples).
- Reproduccion y benchmarking de metodos: las metricas publicas por fold (profile_pearson, count_pearson, AUROC, AUPRC) sirven como linea base para comparar nuevas arquitecturas sequence-to-function.
- Transferencia y fine-tuning: la arquitectura compacta (45.586 parametros) facilita el fine-tuning sobre datos ChIP-seq propios o la integracion en pipelines de aprendizaje multi-tarea.
- Analisis de motivos de union: al ser un modelo de la familia BPNet, es compatible con tecnicas de atribucion (p. ej. saliencia integrada) para extraer motivos de ADN responsables de las predicciones.

## Benchmarks y rendimiento

No se han publicado valores agregados de benchmarks en la informacion disponible. El repositorio incluye las tablas `performance.validation.tsv` y `performance.test.tsv` con metricas por experimento y fold: `profile_mnll`, `profile_jsd`, `profile_pearson`, `profile_spearman`, `count_pearson`, `count_spearman`, `count_mse`, `all_count_pearson`, `all_count_spearman`, `all_count_mse`, `auroc` y `auprc`. Las metricas principales son `profile_pearson` (forma del perfil) y `count_pearson` (fuerza de union entre picos). Se advierte que 142 de los 17.145 folds tienen menos de 10 picos de validacion y 31 menos de 10 de test, por lo que sus metricas son ruidosas; los 506 folds con menos de 100 picos de test (3,0 % del total) concentran 44 de los 90 folds con `profile_pearson` o `count_pearson` de test igual o inferior a 0.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 45.586 parametros por modelo, cada checkpoint ocupa del orden de cientos de kilobytes, muy por debajo de 1 GB de VRAM
- GPU recomendadas: cualquier GPU moderna es suficiente (p. ej. RTX 3060 o superior); la inferencia es viable incluso en CPU dado el tamano minimo del modelo
- Consumer GPUs: si, cualquier GPU de consumo ejecuta estos modelos sin problema
- Despliegue: PyTorch nativo (checkpoints .torch); el codigo del modelo esta en https://github.com/jmschrei/cherimoya; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicable a arquitecturas no linguistas)
- Latencia y throughput: no disponibles; el tamano del modelo sugiere inferencia muy rapida, pero depende del numero de ventanas procesadas
- Espacio en disco: el repositorio completo pesa 4,6 GB; se recomienda descargar solo los modelos de los experimentos necesarios

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| BATv1 (Cherimoya) | CNN residual (BPNet) | 45.586 por modelo; 17.145 modelos | Perfiles ChIP-seq por experimento (ENCODE) | CC-BY-4.0 |
| BPNet | CNN residual | no disponible | Perfiles ChIP-seq / TF binding | no disponible |
| Enformer | Transformer (CNN + attention) | ~162 millones | Prediccion de expresion genica y marcas epigeneticas | no disponible |

BATv1 se diferencia de Enformer en que ofrece un modelo compacto y especializado por experimento con resolucion de base y salida de hebra especifica, frente a un modelo unico multitarea. Frente a BPNet original, BATv1 aporta un atlas completo y sistematico sobre 3.429 experimentos ENCODE con validacion cruzada estandarizada. Datos detallados de rendimiento comparativo: no disponibles.

## Limitaciones y advertencias

- Cada modelo predice unicamente para un experimento ENCODE concreto: hay que descargar el checkpoint correspondiente a la diana y muestra biologica de interes
- Los modelos estan entrenados exclusivamente sobre genoma humano GRCh38/hg38; no son aplicables a otros organismos sin reentrenamiento
- Experimentos con pocos picos producen metricas ruidosas: 506 folds (3,0 %) tienen menos de 100 picos de test y concentran la mayoria de los folds con correlaciones de test iguales o inferiores a 0
- Las predicciones dependen de disponer de la senal de control del experimento como entrada, lo que limita su uso a contextos con datos de control compatibles
- Riesgo de sobreajuste en experimentos pequenos; se recomienda consultar las metricas por fold antes de usar un modelo
- Licencia CC-BY-4.0: permite uso comercial con atribucion; no hay restricciones de licencia relevantes para produccion
- No hay informacion sobre sesgos algoritimicos; los sesgos heredados de los datos ENCODE (cobertura desigual de dianas y muestras) pueden afectar a la generalizacion
- Pipeline etiquetado como "other": no es compatible con las herramientas estandar de inferencia de modelos de lenguaje en HuggingFace

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/programmable-genomics/BATv1
- Repositorio del modelo Cherimoya: https://github.com/jmschrei/cherimoya
- Proyecto ENCODE: no disponible (referenciado como fuente de datos en la model card)
- Paper: no disponible
