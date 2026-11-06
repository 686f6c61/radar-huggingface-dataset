# PCC-Lab-USI/UME-eda-foundation-model

## Resumen

UME (Unified Model for Electrodermal activity) es el primer modelo fundacional dedicado especificamente a la actividad electrodermal (EDA) captada por dispositivos portatiles de muneca. Lo desarrolla Leonardo Alchieri en la Universita della Svizzera italiana (PCC-Lab-USI) y se publica bajo licencia MIT. El modelo resuelve un problema concreto: hasta ahora el analisis de EDA dependia de pipelines artesanales de extraccion de caracteristicas (descomposicion tonica/fasica, deteccion de picos, estadisticos por ventana) que no generalizan entre estudios ni dispositivos. UME sustituye ese trabajo por un encoder preentrenado que produce embeddings de 64 dimensiones directamente utilizables en tareas posteriores.

La arquitectura es una CNN 1D de estilo EfficientNet (16 bloques MBConv1D con squeeze-and-excitation) que consume ventanas de 60 segundos a 4 Hz con tres canales: EDA mixta, componente fasica y componente tonica. Con solo 742.496 parametros, es un modelo extremadamente ligero, pensado para ejecutarse en CPU o en hardware de borde junto al sensor. El entrenamiento es contrastivo (InfoNCE con temperatura 0.1) sobre vistas aumentadas de la misma ventana, sin etiquetas, usando 17 conjuntos de datos publicos y de investigacion de la coleccion EDAMAME.

Su relevancia actual radica en que abre la puerta a reutilizar un unico extractor de caracteristicas para estudios de estres, carga cognitiva o clasificacion sueno/vigilia, reduciendo el coste de ingenieria por tarea. No es un modelo generativo ni un LLM: es un extractor de caracteristicas (`feature-extraction`) para senales fisiologicas, y debe evaluarse con particiones leave-one-person-out para evitar estimaciones optimistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D estilo EfficientNet (stem convolution, 16 bloques MBConv1D con squeeze-and-excitation, head convolution, global average pooling, proyeccion lineal) |
| Parametros totales | 742.496 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 240 muestras (60 s a 4 Hz); no es contexto de texto |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser un modelo de 0,74 M de parametros no requiere cuantizacion) |
| Idiomas soportados | no aplica (modelo de senales fisiologicas, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria PyTorch) |
| Entrada | tensor `(batch, 240, 3)`: EDA mixta, fasica y tonica |
| Salida | embedding de 64 dimensiones por ventana |
| Objetivo de entrenamiento | aprendizaje contrastivo sample-wise (InfoNCE, temperatura 0.1) |
| Variantes | base (por defecto), tiny, small, large |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

UME es una red convolucional 1D con diseno EfficientNet: una convolucion stem procesa la ventana de entrada, seguida de 16 bloques MBConv1D con modulos de squeeze-and-excitation que recalibran canales, una convolucion de cabeza, average pooling global y una proyeccion lineal que entrega el embedding de 64 dimensiones. No emplea atencion ni mecanismos de estado recurrente; toda la modelizacion temporal recae en las convoluciones. Con 742.496 parametros, el coste computacional es minimo y el modelo cabe holgadamente en cualquier dispositivo.

El preentrenamiento es auto-supervisado: se generan dos vistas aumentadas de la misma ventana de 60 s y se optimiza una perdida InfoNCE (temperatura 0.1) para acercar sus embeddings y alejarlos de los de otras ventanas del lote. Los aumentos provienen del conjunto propuesto por Matton et al. (2024) para EDA. Los datos son 17 conjuntos publicos y de investigacion de la coleccion EDAMAME, sin etiquetas, mayoritariamente registrados con dispositivos de muneca como el Empatica E4. No se reporta en la informacion disponible el numero exacto de ventanas de entrenamiento, la composicion por dataset ni si hubo etapas de ajuste supervisado adicionales. La evaluacion posterior se realiza con caracteristicas congeladas y un clasificador clasico, validado con leave-one-person-out.

## Capacidades

- Extraccion de caracteristicas de EDA: convierte ventanas de 60 s en embeddings de 64 dimensiones listos para clasificadores posteriores.
- Representacion de las tres componentes de la senal (mixta, fasica y tonica) de forma conjunta.
- Ajuste fino supervisado sobre conjuntos de datos etiquetados mediante `UMEPipeline.fit`.
- Uso con caracteristicas congeladas: entrenamiento de clasificadores clasicos (regresion logistica, SVM, random forest) sobre los embeddings.
- Aprendizaje auto-supervisado: no requiere etiquetas para la fase de preentrenamiento.
- Inferencia en CPU y en dispositivos de borde por su tamano reducido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un encoder de senales, no un modelo generativo.
- Capacidades multilingues: no aplica.

## Casos de uso

- Clasificacion de estres en investigacion: extraer embeddings de ventanas de 60 s de EDA de muneca y entrenar un clasificador binario estres/no estres con validacion leave-one-person-out, sustituyendo el pipeline manual de descomposicion y estadisticos.
- Deteccion de carga cognitiva: usar los embeddings como entrada a un modelo supervisado en experimentos de laboratorio con tareas cognitivas, aprovechando que el encoder ya captura la dinamica fasica y tonica.
- Clasificacion sueno/vigilia: alimentar un clasificador ligero con las caracteristicas de UME para segmentar periodos de sueno a partir de registros nocturnos de wearables.
- Preprocesado en pipelines de investigacion: integrar `UMEPipeline.embed` como etapa de extraccion en un flujo existente de analisis fisiologico, reduciendo el codigo especifico por estudio.
- Inferencia en el dispositivo: ejecutar el modelo en el propio wearable o en un telefono por su tamano de 0,74 M de parametros, enviando solo embeddings en lugar de la senal cruda, lo que mejora la privacidad.
- Ajuste fino con pocas etiquetas: partir de los pesos base y ajustar con `UMEPipeline.fit` sobre un conjunto pequeno y especifico de un nuevo estudio o dispositivo.
- Comparacion de cohortes: usar los embeddings como representacion comun para analizar diferencias entre poblaciones o condiciones de registro de forma estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluacion downstream (caracteristicas congeladas con clasificador clasico y validacion leave-one-person-out) se reportan en el paper (DOI 10.1145/3857981, arXiv:2603.16878), pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los 742.496 parametros, mas el espacio de activaciones de la ventana de entrada; irrelevante en la practica.
- GPU recomendadas: ninguna en particular; cualquier GPU moderna sirve, pero el modelo esta disenado para CPU.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores o telefonos; no requiere GPU dedicada.
- Opciones de despliegue: paquete `ume-eda` con `UMEPipeline`, PyTorch con safetensors, exportacion a ONNX o TorchScript si se necesita integracion en produccion (no documentado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un coste por ventana muy bajo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UME (este modelo) | 742.496 | 60 s de EDA a 4 Hz, 3 canales | embedding de 64 dim. | MIT | Hugging Face, pip `ume-eda` |
| Encoders contrastivos de EDA de Matton et al. (2024) | no disponible | ventanas de EDA | embeddings | no disponible | repositorio GitHub de referencia para los aumentos |
| Pipelines clasicos de extraccion de caracteristicas EDA (p. ej. NeuroKit2, cvxEDA) | no aplica (no neuronal) | EDA cruda | caracteristicas hand-crafted | segun libreria | ampliamente disponible |

No se dispone de otros modelos fundacionales publicos especificos de EDA en la informacion proporcionada para una comparacion cuantitativa de rendimiento; las alternativas son extractores clasicos o el trabajo previo de Matton et al., del que UME reutiliza los aumentos.

## Limitaciones y advertencias

- Sesgo de poblacion y dispositivo: el rendimiento puede caer en poblaciones, dispositivos, localizaciones corporales o condiciones de registro poco representadas en el preentrenamiento (mayoritariamente Empatica E4 en estudios de investigacion).
- Artefactos: la EDA es sensible al movimiento, la temperatura y el contacto del sensor; el modelo no detecta ni marca senal de baja calidad.
- Diferencias individuales: la EDA varia mucho entre personas; deben usarse particiones leave-one-person-out en lugar de aleatorias, que sobreestiman el rendimiento.
- Privacidad: las senales fisiologicas son datos personales; su tratamiento debe ajustarse al consentimiento y a la legislacion aplicable.
- Uso fuera de alcance: prohibido para diagnostico clinico, decisiones medicas o de seguridad, e inferencia de rasgos sensibles o estados emocionales sin consentimiento informado, incluida la vigilancia laboral.
- Entrada restringida: solo EDA de muneca a 4 Hz y ventanas de 60 s; otras senales (PPG, ECG) o frecuencias requieren remuestreo y validacion previa.
- Licencia MIT: permite uso comercial, pero el autor restringe explicitamente los usos eticos descritos; conviene revisar el paper para los terminos de uso previsto.
- Modelo no generativo: no produce texto ni respuestas; cualquier aplicacion conversacional requeriria un clasificador o modelo adicional sobre los embeddings.

## Enlaces

- Hugging Face: https://huggingface.co/PCC-Lab-USI/UME-eda-foundation-model
- Paper (DOI): https://doi.org/10.1145/3857981
- arXiv: https://arxiv.org/abs/2603.16878
- Coleccion EDAMAME (repositorio): https://github.com/LeonardoAlchieri/EDAMAME
- Coleccion EDAMAME (web): https://pc.inf.usi.ch/datasets/edamame/
- Aumentos de EDA de referencia (Matton et al.): https://github.com/kmatton/contrastive-learning-for-eda
- Notebook de demostracion: `notebook/pipeline_demo.ipynb` (incluido en el repositorio del modelo)
- Instalacion: `pip install ume-eda`
