# oraculumai/ZUNA1.1-CoreML-Apple-1s

## Resumen

ZUNA1.1-CoreML-Apple-1s es una conversión a Core ML del modelo ZUNA1.1, un autoencoder de difusión enmascarado de 380 millones de parámetros desarrollado por Zyphra para la reconstrucción y superresolución de señales de electroencefalograma (EEG) de cuero cabelludo. El modelo original acepta un subconjunto de canales EEG junto con sus coordenadas tridimensionales de electrodos y es capaz de denoising, reconstrucción de canales faltantes y predicción de señales en posiciones físicas novedosas. Esta versión Core ML, creada por oraculumai, permite ejecutar el modelo de forma nativa en dispositivos Apple (iPhone, visionOS y macOS) con un perfil fijo de 14 canales y precisión fp32. La relevancia actual radica en la posibilidad de desplegar modelos de IA para análisis de EEG en dispositivos de borde, facilitando aplicaciones de investigación y monitorización sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de difusion enmascarado con atencion por posicion (position-aware diffusion autoencoder) |
| Parametros totales | 380 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de EEG de 1 segundo a 256 Hz (256 muestras) en el perfil publicado; el modelo base soporta ventanas de 0.5 a 30 segundos |
| Tipos de cuantizacion | Solo fp32 (las conversiones fp16 fallan en paridad y no se publican) |
| Idiomas soportados | No aplica (senales EEG); la model card indica "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage) |
| Tamano del repo | 1.5 GB |

## Arquitectura y entrenamiento

ZUNA1.1 es un autoencoder de difusion que tokeniza las senales EEG en segmentos de 32 puntos, generando 8 tokens de tiempo grueso por canal. El encoder procesa los tokens con informacion de posicion 3D del electrodo y el indice temporal; el decoder realiza un bucle de denoising por difusion para reconstruir la senal completa. El entrenamiento se realizo sobre un corpus publico de EEG armonizado, con un esquema de enmascaramiento de longitud variable (0.5 a 30 segundos) y corrupcion/dropout flexible, lo que mejora la robustez frente a datos del mundo real. Esta version Core ML preserva el comportamiento preentrenado con un perfil fijo de 5 segundos (seq_len=1280) y validacion de paridad frente a los pesos PyTorch originales mediante una ejecucion de 20 pasos de difusion.

## Capacidades

- Reconstruccion de canales EEG faltantes o descartados a partir de los canales observados y sus coordenadas 3D.
- Denoising de canales EEG observados, eliminando ruido y artefactos.
- Superresolucion espacial: prediccion de senales en posiciones novedosas del cuero cabelludo a partir de coordenadas fisicas.
- Soporte para montajes de 14 canales (estilo Emotiv EPOC X) en este perfil concreto.
- Ejecucion nativa en dispositivos Apple mediante Core ML, sin necesidad de conexion a la nube.
- No es un modelo de lenguaje: no genera texto, no tiene tool calling ni capacidades de agente.

## Casos de uso

- Investigacion en neurociencia: reconstruccion de canales EEG perdidos por artefactos o fallos en la adquisicion, permitiendo analisis continuo sin interrupciones en estudios de laboratorio.
- Monitorizacion de senales en tiempo real en dispositivos portatiles: uso en aplicaciones iOS o visionOS para visualizar y completar senales EEG en entornos de investigacion de campo o seguimiento ambulatorio.
- Preprocesamiento de datos EEG: denoising de senales antes de aplicar otros algoritmos de analisis, como clasificacion de estados cerebrales o deteccion de eventos epilepticos.
- Superresolucion espacial para interfaces cerebro-computadora: prediccion de senales en posiciones no instrumentadas, mejorando la resolucion espacial sin anadir mas electrodos fisicos.
- Desarrollo de aplicaciones de salud mental en dispositivos Apple: integracion en apps de seguimiento del sueno o meditacion que requieran analisis EEG local y privado.
- Educacion y prototipado: uso en entornos docentes para demostrar tecnicas de difusion y autoencoders sobre senales biometricas, con ejecucion en hardware de consumo.

## Benchmarks y rendimiento

La model card proporciona metricas de paridad entre la conversion Core ML y los pesos PyTorch originales en una validacion de 20 pasos de difusion. No se han publicado resultados de benchmarks estandar (como MMLU o HumanEval) porque no es un modelo de lenguaje.

| Metrica | Valor | Umbral | Resultado |
|---|---|---|---|
| MAE | 0.000001 | - | PASS |
| RMSE | 0.000001 | - | PASS |
| max_abs | 0.000008 | - | PASS |
| rel_l2 | 0.000002 | 0.005 | PASS |

## Requisitos de hardware

- Dispositivos Apple compatibles: iPhone, visionOS y macOS (segun los tags y la descripcion del repositorio).
- Tamano del modelo: aproximadamente 1.5 GB en disco (tamano del repositorio).
- Precision fp32 exclusivamente; no hay versiones cuantizadas disponibles.
- No se proporcionan datos de VRAM, latencia ni throughput en la informacion disponible.
- El rendimiento depende del numero de pasos de difusion: menos pasos para iteracion rapida, mas pasos para mayor calidad de reconstruccion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo base ZUNA1.1 es la evolucion de ZUNA1, pero no se han publicado metricas comparativas entre ambos en esta conversion Core ML.

## Limitaciones y advertencias

- Solo disponible en precision fp32; las conversiones fp16 fallan en paridad porque el flujo residual del decoder excede el rango fp16 (max 65504).
- No validado para diagnostico medico, tratamiento ni toma de decisiones clinicas.
- El rendimiento de reconstruccion depende del numero de pasos de difusion; valores bajos pueden degradar la calidad.
- Requiere un montaje EEG con coordenadas 3D de electrodos y una frecuencia de muestreo de 256 Hz, con normalizacion alineada a la inferencia upstream (data_norm=10.0).
- El perfil publicado esta limitado a 14 canales; otros montajes requieren conversiones adicionales no incluidas en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el descargo de responsabilidad del autor limita el uso a fines de investigacion e ingenieria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oraculumai/ZUNA1.1-CoreML-Apple-1s
- Modelo base: https://huggingface.co/Zyphra/ZUNA1.1
- Repositorio original y tutoriales: https://github.com/Zyphra/zuna
- Pagina del paper tecnico: https://www.zyphra.com/zuna-technical-paper
