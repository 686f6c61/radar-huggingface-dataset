# shikunpunk/MiniMind-YuHua-Linear-v2

## Resumen

MiniMind-YuHua-Linear-v2 es un modelo de lenguaje de 104 millones de parámetros desarrollado por shikunpunk, especializado en la generación de texto en el estilo narrativo del escritor chino Yu Hua. Es la segunda versión de un experimento que combina el proyecto MiniMind (una familia de modelos pequeños entrenados desde cero con PyTorch nativo) con una arquitectura de atención lineal basada en Gated DeltaNet. El modelo se ha entrenado exclusivamente con las 13 obras completas de Yu Hua, con el objetivo de imitar su estilo literario sin contaminación de otros autores.

La relevancia de este modelo radica en su enfoque experimental: demuestra que es posible capturar un estilo literario específico con un modelo de solo 104M de parámetros, utilizando atención lineal en lugar de atención softmax tradicional. La versión 2 corrige los problemas de la V1, que usaba pesos preentrenados de poesía de Gu Cheng y producía "contaminación de estilo" con personajes de otras obras. El modelo se distribuye con pesos en formato PyTorch y requiere una manipulación específica de módulos para su carga, ya que sustituye el módulo de atención estándar por la variante lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (Gated DeltaNet) |
| Parametros totales | 104M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (principalmente) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MiniMind de 104M de parámetros, pero sustituye el mecanismo de atención softmax estándar por una atención lineal basada en Gated DeltaNet. Esta arquitectura lineal reduce la complejidad computacional de O(n²) a O(n) en la longitud de secuencia, aunque en este caso concreto el entrenamiento se realizó con PyTorch nativo, lo que el autor describe como "extremadamente lento" y llevó a una parada temprana.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento desde cero con los 13 libros completos de Yu Hua, procesados en 18.793 segmentos, de los cuales se filtraron 2.222 segmentos que contenían personajes nombrados de las obras (para evitar que el modelo generara nombres concretos). El preentrenamiento se detuvo en el paso 2.000 de 3.525 planificados. Después, una fase de SFT (supervisión fina) con 826 ejemplos de cadena de pensamiento (CoT) durante 3 épocas, donde se pedía al modelo "escribir un pasaje en el estilo de Yu Hua" sin mencionar obras o capítulos específicos.

La clave de la versión V2 es que el modelo se entrenó desde cero con datos puramente de Yu Hua, a diferencia de la V1 que utilizaba pesos de preentrenamiento de poesía y causaba una grave contaminación de estilo. La validación principal muestra que la fuga de personajes nombrados se reduce a cero en las tres arquitecturas probadas (AR, Linear y dLM).

## Capacidades

- Generación de texto narrativo en el estilo literario de Yu Hua, incluyendo su tono, ritmo y recursos estilísticos característicos.
- Generación de pasajes originales que no contienen personajes nombrados de las obras de Yu Hua (validado con 0/30 casos de fuga en la versión V2).
- Capacidad de seguir instrucciones en formato de cadena de pensamiento (CoT) para generar contenido con una indicación genérica de estilo.
- Modelo de investigación para estudiar la viabilidad de la atención lineal en modelos pequeños con datos literarios limitados.
- Capacidad multilingüe limitada: entrenado principalmente con datos en chino, por lo que su uso se limita a ese idioma.

## Casos de uso

- **Estudio de estilística computacional**: el modelo permite analizar y cuantificar qué características del estilo de Yu Hua se pueden aprender con un modelo de 104M de parámetros, sirviendo como herramienta de investigación para la lingüística computacional y los estudios literarios.

- **Generación de contenido creativo en chino**: puede utilizarse para generar borradores de pasajes narrativos que imiten el estilo de Yu Hua, útil para escritores que buscan inspiración o para la creación de contenido literario experimental.

- **Herramienta educativa para talleres de escritura**: en talleres de escritura creativa, el modelo puede generar ejemplos de estilo que los estudiantes deben analizar o imitar, facilitando el estudio de técnicas narrativas.

- **Prueba de concepto para atención lineal**: sirve como caso de estudio para desarrolladores que investigan arquitecturas de atención alternativa como Gated DeltaNet, evaluando su comportamiento en tareas de generación de texto con datos limitados.

- **Generación de diálogos de ficción**: el modelo puede producir diálogos y descripciones en el tono de Yu Hua, lo que puede ser útil para juegos de rol literarios o para generar material de lectura de ficción.

- **Investigación sobre transferencia de estilo**: al ser un modelo entrenado desde cero con un corpus muy específico, se puede comparar con versiones que usan transferencia de aprendizaje para estudiar cómo afecta la contaminación de estilo en la generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor proporciona datos de validación internos del experimento:

| Arquitectura | Tasa de aprobación (V2) |
|---|---|
| AR (atención estándar) | 86 % |
| Linear (Gated DeltaNet) | 100 % |
| dLM (difusión) | 16 % |

La tasa de fuga de personajes nombrados es 0/30 en las tres arquitecturas. El modelo Linear V2 alcanza una tasa de aprobación del 100 %, superior a la versión V1 (que no se detalla), mientras que la variante AR desciende del 100 % al 86 % y la dLM se desploma al 16 %.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 104M de parámetros, el peso en precisión FP32 ocupa aproximadamente 0,4 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; se puede ejecutar incluso en CPU para inferencia básica.
- **GPU de consumo**: sí, cabe en cualquier GPU de consumo actual (GTX 1650, RTX 3060, etc.) e incluso en hardware integrado.
- **Opciones de despliegue**: el modelo se distribuye en formato PyTorch, por lo que se puede cargar con cualquier framework que soporte PyTorch. No se mencionan integraciones con vLLM, Ollama o llama.cpp.
- **Latencia y rendimiento**: no se dispone de datos de latencia o throughput. Dado el tamaño y la arquitectura lineal, la inferencia debería ser rápida, pero no se ha medido ni publicado.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que se trata de un experimento de investigación sobre generación de estilo literario con atención lineal. Los modelos de la familia MiniMind (MiniMind-V, MiniMind-O, MiniMind-dLM) son comparables en arquitectura y tamaño, pero no en la tarea específica. El modelo más cercano es la versión V1 del mismo autor, que se diferencia por el uso de transferencia de aprendizaje y que presentaba graves problemas de contaminación de estilo.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo está entrenado exclusivamente con las obras de Yu Hua, por lo que su conocimiento del mundo se limita al contenido de esas obras. No tiene conocimiento general del mundo ni de hechos actuales.
- **Riesgo de alucinación**: el modelo puede generar texto que parece coherente pero que no corresponde a hechos reales o a las obras originales de Yu Hua, especialmente fuera de su dominio de entrenamiento.
- **Limitaciones de contexto**: el tamaño de la ventana de contexto no está documentado, pero es probable que sea limitado (alrededor de 512 o 1024 tokens) dado el tamaño del modelo.
- **Restricciones de licencia**: la licencia no está especificada en la información proporcionada, por lo que se debe contactar con el autor antes de cualquier uso comercial.
- **Carga compleja**: el modelo requiere manipular `sys.modules` para sustituir la implementación de atención estándar por la lineal, lo que puede ser frágil en entornos de producción.
- **Calidad del texto**: aunque la validación del autor indica que el estilo es correcto, el modelo puede generar texto con caracteres extraños o incoherentes, como se observa en la variante AR con un 14 % de fallos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/shikunpunk/MiniMind-YuHua-Linear-v2)
- [Dataset MiniMind-YuHua-Data](https://huggingface.co/shikunpunk/MiniMind-YuHua-Data)
- [Proyecto MiniMind en GitHub](https://github.com/jingyaogong/minimind)
- [README en inglés de MiniMind](https://github.com/jingyaogong/minimind/blob/master/README_en.md)
- [Documentación de MiniMind en DeepWiki](https://deepwiki.com/zherunliu/minimind/6.1-modelscope-and-huggingface)
