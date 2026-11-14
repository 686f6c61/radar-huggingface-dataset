# ArlingtonCL2/canine-lexical-models

## Resumen

`canine-lexical-models` es un conjunto de pesos publicados por ArlingtonCL2 que acompaña al artículo "Phonetic and Lexical Discovery of Canine Vocalization" (Findings of EMNLP 2024, autores Wang, Li, Zhang, Wu y Zhu). No es un modelo de lenguaje generativo, sino una coleccion de cuatro artefactos de audio pensados para un pipeline de investigacion sobre vocalizaciones de perros: un encoder acustico tipo HuBERT adaptado al dominio canino, un modelo de clustering k-means que convierte las features en "fonemas", un detector de eventos sonoros basado en PANNs y un clasificador de actividad TSN-R50.

El nucleo del repositorio es `dog_hubert.pt`, un HuBERT Base (fairseq) inicializado desde `hubert_base_ls960` y reentrenado en dos fases sobre 34.056 "frases" de perro extraidas de YouTube y AudioSet. Sobre sus features de la capa 11 se aplica un k-means de 140 clusters que actua como inventario fonetico, lo que permite tokenizar vocalizaciones caninas y aplicarles tecnicas de descubrimiento lexico propias de la linguistica computacional.

El interes practico es acotado pero claro: ofrece un punto de partida reproducible para bioacustica computacional con perros, con licencia MIT y pesos abiertos. No es un modelo listo para produccion ni un servicio de inferencia; es material de investigacion que requiere clonar el repositorio de codigo, dependencias de fairseq, audioset_tagging_cnn y mmaction2, y ejecutar los scripts del pipeline paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT Base (transformer convolucional + encoder) para Dog-HuBERT; PANNs (CNN) para deteccion de sonido; TSN-R50 (mmaction2) para actividad |
| Parametros totales | no disponible (HuBERT Base ronda los 95 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; frames de 20 ms a 50 Hz de label rate) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (dominio de audio no linguistico: vocalizaciones caninas) |
| Licencia | MIT |
| Formato de pesos | `.pt` (fairseq), `.pkl` (scikit-learn), `.pth` (PyTorch) |

## Arquitectura y entrenamiento

Dog-HuBERT parte de `hubert_base_ls960` y se afina en dos etapas de preentrenamiento auto-supervisado con objetivos k-means. La etapa 1 consta de 80.000 actualizaciones con 100 clusters como objetivo; la etapa 2 realiza 60.000 actualizaciones adicionales con 150 clusters calculados sobre la capa 6 del modelo resultante de la etapa 1. Se usa learning rate 1e-4 y label rate de 50 Hz. El corpus de entrenamiento son 34.056 "frases" de perro (mas de 20 horas) segmentadas a partir de videos de YouTube y AudioSet mediante el detector PANNs afinado que se incluye en el propio repositorio.

El resto del pipeline combina modelos auxiliares: `panns_dog_sed_finetuned.pth` es un PANNs afinado para deteccion frame-level de sonidos de perro sobre 1.483 clips etiquetados (checkpoint `checkpoint_51_2910`, umbral de deteccion 0,28); `tsn_dog_activity.pth` es un TSN-R50 de mmaction2 afinado sobre 2.534 clips con 16 clases de actividad; y `kmeans_layer11_k140.pkl` es un `MiniBatchKMeans` de scikit-learn con 140 clusters entrenado sobre features de la capa 11. De esos 140 clusters, 29 estan marcados como etiquetas de ruido (IDs 4, 10, 20, 23, 24, 32, 37, 39, 50, 52, 53, 54, 65, 71, 72, 78, 79, 82, 85, 87, 89, 108, 109, 114, 119, 120, 122, 134, 137), por lo que el inventario fonetico efectivo es de 111 unidades.

El checkpoint publicado equivale al `checkpoint_145_60000.pt` del articulo con el estado del optimizador eliminado; los pesos son identicos y producen las mismas features. Las rutas de datos en la configuracion guardada se sustituyen por marcadores `/path/to/...`.

## Capacidades

- Extraccion de representaciones acusticas de vocalizaciones caninas a 16 kHz mono, con un vector por frame de 20 ms (50 Hz).
- Tokenizacion fonetica no supervisada: cada frame se mapea a uno de los 140 clusters (111 utiles) que actuan como "fonemas".
- Deteccion frame-level de sonidos de perro sobre audio bruto mediante el PANNs afinado (umbral recomendado 0,28).
- Segmentacion de "frases" caninas a partir de audio largo combinando deteccion y cortes.
- Clasificacion de actividad canina en 16 clases mediante TSN-R50.
- Base para descubrimiento lexico: aplicar tecnicas de NLP (segmentacion, alineamiento, analisis distribucional) sobre secuencias de IDs de cluster.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No es multilingue en sentido linguistico; opera sobre audio no verbal.

## Casos de uso

- Investigacion en bioacustica computacional: usar Dog-HuBERT como extractor de features para estudiar estructura fonetica en vocalizaciones caninas, replicando los experimentos del articulo con los mismos pesos y el mismo k-means.
- Descubrimiento lexico no supervisado: tokenizar horas de audio canino en secuencias de IDs de cluster y aplicar tecnicas de segmentacion y analisis distribucional para buscar unidades recurrentes con significado funcional.
- Etiquetado automatico de datasets de audio animal: emplear el PANNs afinado para preanotar clips con presencia de sonido de perro y reducir el esfuerzo manual de anotacion.
- Analisis de comportamiento: clasificar clips en las 16 clases de actividad del TSN-R50 para correlacionar tipos de vocalizacion con contextos conductuales.
- Construccion de corpus: pipeline de extraccion de frases caninas desde video (YouTube, AudioSet) para generar nuevos datasets etiquetados de vocalizacion.
- Baseline para comparativas: punto de referencia reproducible para evaluar otros encoders acusticos (AST, BEATs, wav2vec2) en tareas de vocalizacion animal.
- Docencia y divulgacion: ejemplo completo de pipeline de linguistica computacional aplicada a un dominio no humano, con codigo y pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (precision de fonemas, accuracy de actividad, etc.); los resultados cuantitativos del articulo estan en el PDF de ACL Anthology y no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada: Dog-HuBERT Base en fp32 ocupa aproximadamente 379 MB de pesos; con activaciones y overhead de fairseq, cabe holgadamente en 2-4 GB de VRAM. El PANNs afinado (323 MB) y el TSN-R50 (95 MB) son aun mas ligeros.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. Para procesar grandes volumenes de audio conviene una GPU moderna por throughput, no por memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas; tambien puede ejecutarse en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: fairseq (obligatorio para Dog-HuBERT), PyTorch para los `.pth`, scikit-learn/joblib para el k-means, mmaction2 para el TSN y `audioset_tagging_cnn` para el PANNs. No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de compatibilidad: el k-means se guardo con scikit-learn 1.3; versiones mas recientes lo cargan con un aviso de version.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canine-lexical-models (este) | HuBERT Base + PANNs + TSN | no disponible (HuBERT Base ~95 M) | Vocalizacion canina | MIT | Pesos abiertos en HF |
| HuBERT Base (`hubert_base_ls960`) | HuBERT Base | ~95 M | Voz humana (LibriSpeech) | MIT | Pesos abiertos en HF |
| wav2vec 2.0 Base | Transformer convolucional | ~95 M | Voz humana | MIT | Pesos abiertos en HF |
| BEATs | Transformer acustico | no disponible | Audio general | MIT | Pesos abiertos |

La comparativa es orientativa: no hay benchmarks publicados en la informacion disponible que permitan contrastar rendimiento numerico entre estos modelos en tareas caninas. La diferencia principal de este repositorio frente a los encoders genericos es el dominio (audio de perro) y el pipeline completo de tokenizacion fonetica.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta tool calling ni agentes. Cualquier uso en ese sentido es un error de encuadre.
- El inventario de 140 clusters incluye 29 etiquetas de ruido; ignorarlas es imprescindible para obtener un inventario fonetico limpio de 111 unidades.
- El corpus de entrenamiento proviene de YouTube y AudioSet, con sesgos de seleccion, calidad de audio variable y posible sobrerrepresentacion de ciertas razas (el TSN se entrena con clips de shiba, segun el nombre del config).
- Riesgo de sobreinterpretacion: los "fonemas" son clusters k-means, no unidades linguisticas validadas; atribuirles significado requiere validacion experimental.
- El pipeline depende de multiples repositorios externos (fairseq, audioset_tagging_cnn, mmaction2) y de scripts concretos; la reproducibilidad exige fijar versiones.
- Las rutas de datos en la configuracion estan sustituidas por placeholders; hay que reconfigurar el pipeline para datos propios.
- Licencia MIT: permite uso comercial, pero el articulo y los datos originales de YouTube/AudioSet pueden tener restricciones propias que el usuario debe verificar.
- No hay datos publicados de latencia, throughput ni metricas de calidad en la model card; cualquier cifra de rendimiento debe obtenerse replicando los experimentos del articulo.

## Enlaces

- Hugging Face: https://huggingface.co/ArlingtonCL2/canine-lexical-models
- Repositorio de codigo: https://github.com/UTA-ACL2/canineLexical
- Paper (ACL Anthology): https://aclanthology.org/2024.findings-emnlp.816/
- Repositorio audioset_tagging_cnn (dependencia PANNs): https://github.com/qiuqiangkong/audioset_tagging_cnn
