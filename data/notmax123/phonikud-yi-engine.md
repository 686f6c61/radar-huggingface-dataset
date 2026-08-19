# notmax123/phonikud-yi-engine

## Resumen

El modelo `notmax123/phonikud-yi-engine` es un sistema de etiquetado fonológico para yidis que convierte texto sin puntuación en dos formatos: nikud (puntuación diacrítica hebrea) y transcripción IPA. Lo desarrolla el usuario notmax123 y se distribuye como un paquete autocontenido que incluye un motor de conversión grafema-fonema (G2P) basado en tablas generadas, un modelo neuronal de diacritización exportado a ONNX (versión v5) y un conjunto de datos etiquetados para entrenamiento de TTS. El sistema está diseñado para ejecutarse únicamente con `onnxruntime` y `numpy`, sin dependencias de frameworks pesados como PyTorch o Transformers, y sin necesidad de conexión de red.

La relevancia de este modelo radica en que aborda un problema específico y poco cubierto: la generación de etiquetas fonéticas correctas para yidis, un idioma con variaciones dialectales significativas y una ortografía históricamente inconsistente. El repositorio incluye un mecanismo de verificación de despliegue que impide que una instalación incompleta produzca etiquetas erróneas silenciosamente, y una jerarquía de autoridad de etiquetado que prioriza veredictos de hablantes nativos, correcciones basadas en audio de corpus y fuentes publicadas. El tamaño del repositorio es de 1,2 GB, que incluye el modelo ONNX, tablas de datos y código fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sistema combina un motor G2P determinista basado en tablas y un modelo neuronal de diacritización contextual exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yidis (inferido de la documentación; no declarado en metadatos) |
| Licencia | no disponible |
| Formato de pesos | ONNX (modelo v5 en `models/phonikud_yi_v5/v5.onnx`) |

## Arquitectura y entrenamiento

La documentación describe dos componentes diferenciados. Por un lado, un motor G2P (`yiddish_g2p.py`) que carga conocimiento de siete tablas generadas en `data/*.py` y produce transcripciones IPA de forma determinista. Estas tablas contienen veredictos de hablantes nativos (502 palabras de oro), correcciones derivadas de análisis de audio de corpus (mediante PhoneticXeus sobre 900 fragmentos de episodios) y lecturas publicadas (Sefaria). Por otro lado, un modelo de nikud contextual (versión v5) exportado a ONNX, que asigna diacríticos basándose en el contexto de la frase. El modelo v5 fue ajustado con etiquetas reparadas bajo la cadena de autoridad descrita, incluyendo 793 filas de entrenamiento donde la expresión "אַ פאר" había sido etiquetada incorrectamente como "far".

No se proporcionan datos sobre el número de parámetros, la arquitectura exacta del modelo neuronal, el volumen de datos de entrenamiento ni el proceso de entrenamiento (RLHF, DPO, etc.). El sistema incluye un mecanismo de verificación en importación (`yiddish_labels.verify()`) que comprueba que todas las tablas estén cargadas y realiza comprobaciones puntuales de lecturas que solo las tablas pueden producir, garantizando que un despliegue incompleto falle de inmediato.

## Capacidades

- Conversión de texto en yidis sin puntuación a texto con nikud (diacríticos hebreos).
- Transcripción fonética a IPA (Alfabeto Fonético Internacional).
- Procesamiento por lotes para generación de datasets (`text_to_nikud_batch`), con un rendimiento de aproximadamente 4.200 caracteres por segundo en CPU.
- Política estricta de cuarentena: filas que contienen dígitos, texto latino o URLs son excluidas automáticamente (~11% de las filas del corpus) para evitar etiquetas incorrectas.
- Verificación de integridad del despliegue mediante `selftest.py` y guardas de importación.
- Generación de un paquete portable (`dist/phonikud-yi-engine.zip`) que incluye código, tablas y modelo, verificado internamente antes de su distribución.
- Funcionamiento sin dependencias de frameworks de deep learning, solo `onnxruntime` y `numpy`.

## Casos de uso

- Preparación de datasets para síntesis de voz (TTS) en yidis: el sistema genera etiquetas fonéticas consistentes para audios de entrenamiento, evitando los problemas de etiquetado inconsistente que afectaban a datasets anteriores como `yiddish24`.
- Normalización de textos en yidis para aplicaciones de lectura asistida: añadir nikud a textos planos para facilitar la pronunciación a estudiantes o hablantes no nativos.
- Investigación lingüística sobre fonología del yidis: las transcripciones IPA generadas pueden utilizarse para análisis de variación dialectal y estudios de pronunciación.
- Desarrollo de correctores ortográficos o de pronunciación: el motor G2P determinista puede integrarse en herramientas de aprendizaje de idiomas.
- Enriquecimiento de corpus textuales: añadir capas de anotación fonética a colecciones de textos en yidis para tareas de NLP posteriores.
- Verificación de calidad de etiquetas existentes: el sistema permite detectar errores en etiquetados previos, como los 77 casos de la letra פ corregidos de f a p o los 42 komets corregidos a /u/.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento mencionado es el throughput de procesamiento por lotes: aproximadamente 4.200 caracteres por segundo en CPU para la generacion de nikud. No se proporcionan comparaciones con otros sistemas de diacritizacion o transcripcion fonetica.

## Requisitos de hardware

- Inferencia en CPU: el sistema esta disenado para ejecutarse sin GPU, utilizando unicamente `onnxruntime` y `numpy`.
- VRAM estimada: no aplica (no requiere GPU para inferencia).
- GPUs recomendadas: no aplica; el modelo funciona en CPU.
- Compatibilidad con hardware de consumo: si, cualquier ordenador con Python 3 y CPU x86_64 o ARM deberia ser suficiente.
- Opciones de despliegue: integracion como libreria Python local, generacion de un bundle portable (zip) para distribucion, o uso del script `selftest.py` para verificacion.
- Latencia y throughput: se menciona un rendimiento de ~4.200 caracteres/segundo en CPU para el modo batch, manteniendo una sola sesion ONNX en lugar de una por llamada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de diacritizacion o transcripcion fonetica para yidis o hebreo. Existen sistemas como DictaBERT para hebreo con puntuacion, pero no se han encontrado datos publicados que permitan una comparacion directa en terminos de parametros, contexto o rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada en los metadatos, por lo que no se puede garantizar su uso comercial sin una verificacion previa con el autor.
- El sistema aplica una politica de cuarentena que excluye aproximadamente el 11% de las filas del corpus (aquellas con digitos, texto latino o URLs). Estas filas deben omitirse en entrenamientos, no parchearse.
- El motor G2P es deterministico, pero el modelo de nikud es contextual; si ambos discrepan en una palabra, las tablas del G2P tienen prioridad (contienen los veredictos nativos).
- Algunas palabras estan marcadas con confianza baja y constituyen una cola de revision humana; no son errores, pero son las lecturas menos seguras del sistema.
- La documentacion advierte explicitamente de no utilizar la columna de nikud almacenada en el dataset `yiddish24`, ya que contiene etiquetas inconsistentes y erroneas que causaron problemas de mezcla dialectal en voces generadas anteriormente.
- No se proporcionan datos sobre sesgos, riesgos de alucinacion o limitaciones de contexto, ya que el modelo no es un LLM generativo sino un sistema de etiquetado fonologico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/notmax123/phonikud-yi-engine
- Perfil de la organizacion Phonikud: https://huggingface.co/Phonikud/models
- Modelo relacionado RenikudPlus: https://huggingface.co/notmax123/RenikudPlus/blob/main/model.onnx
- Referencia de arquitectura PhonikudModel (proyecto relacionado, no este modelo): https://deepwiki.com/thewh1teagle/phonikud/4.1-phonikudmodel-architecture
- Catalogo de modelos de IA para hebreo (incluye yidis): https://github.com/danielrosehill/Hebrew-AI-Models
