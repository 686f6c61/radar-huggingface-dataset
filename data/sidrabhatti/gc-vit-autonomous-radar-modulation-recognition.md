# SidraBhatti/gc-vit-autonomous-radar-modulation-recognition

## Resumen

GC-ViT (Global Context Vision Transformer) para reconocimiento de modulación de señales radar es un clasificador de imágenes basado en Vision Transformer, publicado por Sidra Ghayour Bhatti (primera autora) junto con Mohsin Ullah, del Departamento de Ingeniería Eléctrica de la Capital University of Science and Technology (Islamabad). El modelo aborda el problema de identificar formas de onda radar codificadas en fase (códigos Barker, códigos polifásicos P1–P4 y familias similares) a partir de la fase de la transformada de Fourier de tiempo corto (STFT) de cada pulso interceptado, una capacidad clave para sistemas de guerra electrónica que se enfrentan a radares de baja probabilidad de interceptación (LPI).

En lugar de la magnitud del espectrograma, el modelo usa el espectrograma de fase, ya que las formas de onda codificadas en fase se definen por su patrón de modulación de fase intrapulso: dos códigos distintos pueden tener magnitudes casi idénticas y fases muy diferentes. La señal 1D (IQ) se convierte así en un mapa tiempo-frecuencia 2D, recortado a su región informativa y redimensionado a 224×224×3, lo que transforma el problema en una clasificación de imágenes de 6 clases que una arquitectura de visión puede explotar.

El modelo emplea una variante Tiny del backbone GC-ViT preentrenado y ajustado con una cabeza softmax de 6 clases. Su resultado principal es aproximadamente un 80 % de precisión a −12 dB de SNR, con degradación gradual en un barrido de −14 dB a +8 dB en pasos de 2 dB. El trabajo se publicó en *Engineering Research Express* (2024), y el repositorio de HuggingFace no incluye pesos ni dataset, solo un notebook de Colab dependiente de recursos privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Global Context Vision Transformer (GC-ViT), variante Tiny; self-attention local por ventanas combinada con tokens de contexto global |
| Parametros totales | no disponible (la informacion proporcionada solo indica la variante Tiny del backbone) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes de 224x224x3, no hay contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision/clasificacion de senales, no procesa texto) |
| Licencia | other |
| Formato de pesos | HDF5 (.h5) en Keras/TensorFlow, segun el notebook de entrenamiento; los pesos no se distribuyen en el repositorio |
| Tarea | Clasificacion de imagenes (6 clases) de espectrogramas de fase STFT de pulsos radar |
| Entrada | Espectrograma de fase STFT recortado y redimensionado a 224x224x3 |
| Numero de clases | 6 (familias de formas de onda codificadas en fase) |
| Dataset | latestdataset-cnn (Kaggle, enlazado en la model card) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El backbone es un GC-ViT Tiny. La entrada (espectrograma de fase) pasa por un stem y despues por etapas alternas de bloques de multi-head self-attention (MSA) locales con ventana y de contexto global, alimentadas por un generador de tokens globales que se inyecta en cada etapa. Entre etapas se aplica downsampling y se duplica la profundidad de canales, y la red termina en un 2D average pooling seguido de una cabeza de clasificacion. La combinacion de atencion local (textura fina del espectrograma) y global (estructura de largo alcance en todo el mapa tiempo-frecuencia) es el motivo arquitectonico que la model card atribuye a su ventaja sobre baselines CNN en regimenes de SNR bajo, donde la informacion discriminativa esta repartida por el espectrograma en lugar de localizada.

El entrenamiento parte de un backbone GC-ViT preentrenado y se ajusta con SGD (lr = 0,001) y perdida sparse categorical cross-entropy sobre una cabeza de 6 clases. La model card no detalla el corpus de preentrenamiento, el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica en un clasificador). El protocolo de evaluacion es un barrido de SNR de aproximadamente −14 dB a +8 dB en pasos de 2 dB, con conjuntos de test separados por nivel de SNR, de modo que el rendimiento se reporta como funcion del ruido y no como un unico agregado. No se documentan innovaciones del tipo decodificacion especulativa ni attention lineal: la innovacion declarada es la representacion de entrada (espectro de fase frente a magnitud) y el uso del mecanismo de contexto global.

## Capacidades

- Clasificacion de formas de onda radar codificadas en fase en 6 clases mediante una cabeza softmax, a partir de espectrogramas de fase STFT de 224x224x3.
- Reconocimiento robusto en regimenes de SNR bajo: aproximadamente 80 % de precision a −12 dB, con degradacion gradual en el barrido de −14 dB a +8 dB.
- Extraccion de caracteristicas basada en fase intrapulso, lo que permite distinguir codigos con magnitudes espectrales casi identicas pero fases distintas (Barker, P1–P4 polifasicos y familias afines incluidas en el dataset).
- Conversion implicita de un problema 1D de reconocimiento de formas de onda IQ en un problema 2D de clasificacion de imagenes mediante preprocesado STFT, recorte y redimensionado.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, audio ni capacidades multimodales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Guerra electronica (EW): el clasificador se integraria en la cadena de recepcion de un sistema de contramedidas para etiquetar la modulacion de cada pulso interceptado en entornos con baja SNR, donde los metodos basados en magnitud pierden informacion discriminativa.
- Receptores de alerta radar (RWR) en plataformas aereas: identificacion automatica de la familia de forma de onda emitida por un radar hostil para alimentar la logica de amenaza y las contramedidas, aprovechando el rendimiento mantenido hasta −12 dB.
- Inteligencia de senales (SIGINT/ELINT): clasificacion masiva de pulsos capturados en campañas de recoleccion, usando la salida de 6 clases como etiquetado automatico previo al analisis humano.
- Monitorizacion y gestion del espectro electromagnetismo: deteccion y categorizacion de emisiones no autorizadas o interferentes en entornos densos, integrando el modelo aguas abajo de un receptor SDR.
- Validacion de contramedidas y bancos de pruebas: uso del clasificador como oraculo para medir si una tecnica de enmascaramiento o modulacion agil degrada efectivamente la identificabilidad de la emision a distintos niveles de SNR.
- Investigacion en reconocimiento automatico de modulacion (AMR): reproduccion y comparacion del protocolo de barrido de SNR con otras arquitecturas (CNN, ViT estandar) sobre el dataset de Kaggle enlazado.
- Simulacion y entrenamiento de sistemas de defensa: generacion de etiquetas de referencia en escenarios sinteticos con ruido controlado para poblar simuladores de amenaza.
- Prototipado en edge sobre SDR: el tamano Tiny del backbone y una entrada fija de 224x224x3 permiten evaluar despliegue en GPUs modestas o aceleradores embebidos, previa exportacion del modelo Keras a otro formato.

## Benchmarks y rendimiento

La model card solo publica el resultado del barrido de SNR, sin metricas de benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo). Los unicos numeros disponibles son:

| Metrica | Valor | Notas |
|---|---|---|
| Precision de reconocimiento a SNR = −12 dB | ~80 % | La model card indica que supera sustancialmente a metodos previos en ese nivel de ruido, sin dar las cifras de los baselines |
| Rango de SNR evaluado | Aproximadamente −14 dB a +8 dB | Barrido en pasos de 2 dB, con conjuntos de test held-out por nivel de SNR |
| Precision agregada (todas las SNR) | no disponible | La evaluacion se reporta por nivel de SNR, no como un unico numero |
| Comparacion numerica con baselines CNN | no disponible | Se menciona una ventaja cualitativa a SNR bajo, sin valores |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Al tratarse de una variante Tiny de un Vision Transformer con entrada 224x224x3 y una cabeza de 6 clases, la inferencia en FP32 queda holgadamente por debajo de 2 GB de VRAM en la mayoria de configuraciones; esta cifra es una estimacion a partir de la escala de la arquitectura, no un dato aportado por el autor.
- GPU recomendadas: el entrenamiento se realizo en un entorno Google Colab, lo que sugiere que el ajuste fino cabe en una GPU tipo NVIDIA T4 (16 GB). Para entrenamiento y evaluacion de barridos completos de SNR son adecuadas GPUs tipo A100, H100, L4 o RTX 4090; para inferencia puntual basta una GPU de gama media.
- Cabe en GPU de consumo: si, con alta probabilidad, en cualquier GPU consumer moderna con al menos 4-6 GB de VRAM, dado el tamano Tiny del modelo y la resolucion de entrada. No confirmado explicitamente por el autor.
- Opciones de despliegue: al ser un modelo Keras/TensorFlow en formato .h5, las vias naturales son TensorFlow Serving, TF Lite (edge movil/embebido) o exportacion a ONNX para ONNX Runtime y TensorRT. No es compatible de forma directa con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de pulsos clasificados por segundo.

## Comparativa con modelos similares

No se dispone de datos concretos de modelos comparables en la informacion proporcionada. La model card menciona de forma generica que el modelo supera a "baselines CNN" en regimenes de SNR bajo, pero no identifica que arquitecturas, que tamanos ni que cifras de precision y contexto. Como modelos de la misma categoria podrian considerarse clasificadores CNN sobre espectrogramas de magnitud y Vision Transformers estandar aplicados al mismo dataset, pero no hay resultados publicados en la informacion disponible para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GC-ViT radar (este modelo) | no disponible (backbone Tiny) | Espectrograma de fase STFT 224x224x3, 6 clases | ~80 % a −12 dB SNR | other | Pesos no publicados; solo notebook dependiente de datos privados |
| Baselines CNN (sin especificar) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Vision Transformer estandar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Clasificacion cerrada de 6 clases: no hay deteccion de clases desconocidas ni capacidad open-set, por lo que una forma de onda fuera del conjunto de entrenamiento se forzara a una de las 6 etiquetas.
- Dependencia fuerte del preprocesado: el rendimiento depende de la ventana STFT, del recorte de la region informativa y del redimensionado a 224x224x3. La model card no documenta esos parametros de forma reproducible, lo que dificulta replicar el pipeline.
- Riesgo de sobreajuste al dataset: el dataset de entrenamiento es privado/no incluido y la evaluacion se realizo sobre conjuntos held-out del mismo origen; el comportamiento ante cambios de dominio (otro receptor, otra banda, otro ancho de banda de pulso) no esta caracterizado.
- Degradacion por debajo de −12 dB: aunque la degradacion es gradual, la precision cae a SNR muy bajas; no se publican cifras por debajo de −14 dB.
- Reproducibilidad limitada: el repositorio de HuggingFace no contiene pesos, configuracion ni tarjeta con licencia detallada; el unico artefacto es un notebook especifico de Colab que monta Google Drive y espera un dataset comprimido privado y un fichero de pesos .h5 entrenado localmente, por lo que no se ejecuta de forma autonoma.
- Licencia "other": no se especifican los terminos de uso comercial, redistribucion ni modicacion. Cualquier uso en produccion requiere contactar con los autores para aclarar las condiciones.
- Riesgo de mala clasificacion (no de alucinacion, al ser un clasificador): una etiqueta incorrecta en un contexto de guerra electronica puede tener consecuencias operativas graves, por lo que se requiere validacion humana y margenes de confianza.
- Uso dual y posible sujecion a controles de exportacion: se trata de tecnologia orientada a guerra electronica y aplicaciones militares, con las restricciones legales y regulatorias que ello implica segun la jurisdiccion.
- Ausencia de datos de consumo: 0 descargas y 0 likes en HuggingFace, sin comunidad que haya validado los resultados de forma independiente.
- Idiomas: no aplica; el modelo no procesa texto, por lo que no hay soporte multilingue ni capacidades conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SidraBhatti/gc-vit-autonomous-radar-modulation-recognition
- Dataset en Kaggle: https://www.kaggle.com/datasets/sidrabhatti/latestdataset-cnn
- Articulo publicado: Bhatti, S.G. & Ullah, M. (2024), "Radar signal modulation identification using global context vision transformer", *Engineering Research Express*, 6(4), 045331 — https://doi.org/10.1088/2631-8695/ad8b96 (requiere suscripcion)
- Notebook de entrenamiento/evaluacion: Global_Context_ViT_for_RadarSiganls.ipynb (referenciado en la model card; especifico de Colab y no ejecutable de forma autonoma)
- Busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo (unicamente paginas de ayuda de YouTube y de Zhihu, sin relacion con el contenido)
