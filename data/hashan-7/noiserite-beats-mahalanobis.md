# hashan-7/noiserite-beats-mahalanobis

## Resumen

NoiseRite BEATs + Mahalanobis es un sistema de detección de anomalías acústicas por máquina, desarrollado por hashan-7, que combina el modelo de audio BEATs como extractor de características y un clasificador de distancia de Mahalanobis para puntuar la desviación respecto a un perfil normal de referencia. Está orientado al monitoreo de condiciones de maquinaria industrial mediante señales de audio. El paquete publicado en HuggingFace contiene exclusivamente las estadísticas por máquina del clasificador (ubicación y precisión), junto con metadatos y resúmenes de evaluación, pero no incluye audio crudo, caché de embeddings ni el checkpoint de BEATs. El sistema reporta un score oficial de 0,579158 en condiciones limpias, con una degradación moderada bajo ruido blanco.

El repositorio se presenta como un "paquete de lanzamiento seguro planificado" y su uso previsto es el cribado acústico de anomalías para tipos de máquina registrados, utilizando una línea base de comportamiento normal. No se proporcionan detalles sobre la arquitectura interna de BEATs (número de parámetros, configuración de capas) ni sobre el proceso de entrenamiento o el dataset utilizado. La licencia se indica como "other", sin especificación adicional. Actualmente no tiene descargas ni likes, y el tamaño del repositorio es de 0,0 GB, lo que sugiere que se trata de un artefacto de metadatos más que de un modelo completo con pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder BEATs + clasificador Mahalanobis |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (solo estadísticas por máquina) |

## Arquitectura y entrenamiento

El sistema combina un modelo BEATs como encoder de audio (que produce embeddings de 768 dimensiones) con un clasificador de distancia de Mahalanobis. BEATs es un modelo de representación de audio preentrenado, aunque en este paquete no se incluye su checkpoint, solo las estadísticas del clasificador por máquina. El proceso de entrenamiento no se documenta en la información disponible: no se especifican los datos de entrenamiento, el número de máquinas evaluadas ni el protocolo de validación. El paquete exporta únicamente los parámetros del clasificador (location y precision) y resúmenes de evaluación, lo que indica que el lanzamiento está orientado a la distribución de un artefacto de inferencia ligero, no a la reproducción del entrenamiento.

## Capacidades

- Detección de anomalías acústicas para máquinas registradas, basada en una línea base de comportamiento normal.
- Clasificación de audio (pipeline_tag: `audio-classification`), aunque el propósito principal es el cribado de anomalías, no la clasificación de categorías.
- Generación de puntuaciones de robustez frente a ruido blanco (20 dB, 10 dB, 5 dB y 0 dB), lo que permite evaluar la degradación del rendimiento bajo interferencia acústica.
- El sistema no incluye soporte para tool calling, agentes, razonamiento multi-paso ni capacidades de visión o texto. Es un modelo de audio puro y específico para monitoreo de maquinaria.
- No se indica soporte multilingüe ni procesamiento de lenguaje natural.

## Casos de uso

- **Monitoreo de maquinaria industrial**: el sistema puede instalarse para escuchar continuamente el sonido de motores, bombas o compresores y alertar cuando la distancia de Mahalanobis supere un umbral, indicando un posible comportamiento anómalo respecto a la línea base normal.
- **Mantenimiento predictivo en plantas de producción**: al integrarse con sensores acústicos, permite detectar desgastes o fallos incipientes sin intervención manual, reduciendo el tiempo de inactividad no planificado.
- **Control de calidad acústica en líneas de ensamblaje**: puede cribar cada unidad fabricada comparando su sonido con el perfil normal de la máquina, identificando piezas defectuosas que emiten vibraciones o ruidos anómalos.
- **Vigilancia de equipos remotos en infraestructura crítica**: para estaciones de bombeo o generadores en ubicaciones remotas, el sistema puede ejecutarse en un dispositivo de borde con el clasificador Mahalanobis y enviar alertas solo cuando se detecta una desviación significativa.
- **Evaluación de robustez bajo ruido ambiental**: los resultados de robustez publicados permiten calibrar el umbral de detección en entornos ruidosos, por ejemplo en fábricas con niveles de ruido de fondo elevados.
- **Investigación en detección de anomalías acústicas**: sirve como punto de partida para comparar el rendimiento de BEATs con otros encoders (AudioMAE, CLAP, etc.) en tareas de monitoreo de maquinaria, ya que se publican las estadísticas de evaluación y la metodología de scoring.

## Benchmarks y rendimiento

La model card del repositorio incluye una tabla de robustez con el score oficial y su degradación bajo ruido blanco. No se proporcionan comparaciones con otros modelos.

| Condición | Score oficial | Drop desde condición limpia |
|---|---:|---:|
| Limpio | 0,579158 | 0,000000 |
| Ruido blanco 20 dB | 0,512913 | 0,066245 |
| Ruido blanco 10 dB | 0,519820 | 0,059339 |
| Ruido blanco 5 dB | 0,529012 | 0,050147 |
| Ruido blanco 0 dB | 0,537137 | 0,042022 |

Estos valores son los únicos datos cuantitativos disponibles. No se han publicado resultados en MMLU, HumanEval, GSM8K u otros benchmarks genéricos, ya que el modelo no es un LLM.

## Requisitos de hardware

- No se dispone de información sobre requisitos de hardware en la documentación proporcionada.
- Dado que el paquete solo contiene estadísticas por máquina (location y precision) y no el checkpoint del encoder BEATs, la inferencia podría ejecutarse en hardware modesto, pero no se especifican los requisitos exactos.
- No se indican GPUs recomendadas, ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.). El sistema no parece estar diseñado para ejecutarse con motores de inferencia de LLM, sino como un módulo de análisis acústico.
- Se desconoce la latencia y el throughput estimados.

## Comparativa con modelos similares

No se ha identificado en la información disponible una comparativa con otros sistemas de detección de anomalías acústicas (como AudioSet, DCASE, etc.). No se puede establecer una comparación cuantitativa con alternativas de la misma categoría porque faltan datos de rendimiento en benchmarks comunes y detalles de entrenamiento. Por tanto, la comparativa se declara no disponible.

## Limitaciones y advertencias

- El sistema no diagnostica fallos mecánicos exactos; solo indica la presencia de una anomalía acústica respecto a una línea base normal.
- No certifica la seguridad de las máquinas ni puede predecir la vida útil restante.
- No prescribe acciones de mantenimiento; es una herramienta de cribado, no de decisión.
- La licencia se indica como "other", lo que implica que los términos de uso comercial no están claramente definidos y deben verificarse con el autor.
- La redistribución pública de checkpoints de encoders externos (BEATs) está bajo revisión, lo que puede limitar la reproducibilidad completa del sistema.
- El repositorio no contiene el checkpoint del encoder, solo las estadísticas del clasificador por máquina, por lo que para ejecutar el sistema se necesitará obtener BEATs por separado.
- No hay información sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no se puede evaluar su comportamiento en dominios distintos al que fue diseñado.

## Enlaces

- [Repositorio de HuggingFace](https://huggingface.co/hashan-7/noiserite-beats-mahalanobis)
- [GitHub del autor (proyecto Vision-AI)](https://github.com/hashan-7/Vision-AI) — no relacionado directamente con NoiseRite, pero es el perfil público del desarrollador.

No se han encontrado papers, blogs o demos adicionales que documenten este modelo.
