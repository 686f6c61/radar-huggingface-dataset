# paulokewunmi/SabiEssay-GGUF

## Resumen

SabiEssay es un modelo de lenguaje compacto, desarrollado por Paul Okewunmi, que ofrece una primera evaluación automática de composiciones escritas en inglés siguiendo los criterios del examen WAEC (West African Examinations Council). Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-2B mediante LoRA (rank 16, alpha 16) sobre todas las capas lineales, y se distribuye en formato GGUF cuantizado a Q4_K_M, lo que permite su ejecución en CPU en portátiles convencionales sin necesidad de conexión a internet tras la descarga.

El modelo está diseñado para devolver una puntuación desglosada en cuatro componentes (Contenido /10, Organización /10, Expresión /20, Precisión mecánica /10), un total sobre 50, y comentarios concisos con prioridades de mejora. Su propósito principal es servir como herramienta de retroalimentación inicial para profesores y estudiantes, así como para experimentación educativa offline. Aunque no es un examinador certificado, su tamaño reducido y su licencia Apache-2.0 lo hacen accesible para entornos con recursos limitados.

La relevancia actual de este modelo radica en la creciente demanda de herramientas educativas asequibles y privadas, especialmente en regiones donde el acceso a internet es limitado. Al estar cuantizado y optimizado para CPU, SabiEssay democratiza la corrección automatizada de ensayos, aunque con las limitaciones propias de un modelo pequeño y de un conjunto de entrenamiento sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (base Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros (aunque el número efectivo de parámetros reportado es 1.881.825.088). No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, heads, etc.) en la documentación del modelo. El ajuste fino se realizó mediante LoRA con rango 16 y alpha 16, aplicado a todas las capas lineales, lo que permite una adaptación eficiente sin modificar los pesos originales.

El entrenamiento utilizó un conjunto de datos sintético, `paulokewunmi/SabiEssay-Dataset`, que contiene 194 registros aceptados públicamente, más 92 registros adicionales marcados para revisión humana que no se distribuyen. Los datos se generaron sintéticamente para simular ensayos y evaluaciones siguiendo la rúbrica WAEC. Además, se emplearon materiales históricos de WAEC de forma privada para estudiar la estructura de las tareas y los principios de corrección, aunque no se incluyen en los repositorios públicos. No se menciona el uso de RLHF o DPO; el ajuste se limita a supervisión directa sobre los ejemplos sintéticos.

## Capacidades

- Evaluación de ensayos en inglés siguiendo la rúbrica WAEC: devuelve puntuaciones en Contenido /10, Organización /10, Expresión /20 y Precisión mecánica /10, junto con un total /50.
- Generación de comentarios concisos y prioridades de mejora basados en la evidencia del texto.
- Funcionamiento offline: una vez descargado el modelo, no requiere acceso a internet.
- Inferencia en CPU mediante `llama.cpp`, con soporte para conversación y desactivación del modo razonamiento.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multimodales.
- Limitado al idioma inglés; no ofrece soporte multilingüe.

## Casos de uso

- Corrección inicial de ensayos en aulas: un profesor puede usar SabiEssay para obtener una primera puntuación de las composiciones de sus alumnos antes de revisarlas manualmente, ahorrando tiempo en la evaluación preliminar.
- Práctica autónoma para estudiantes: los estudiantes pueden enviar sus ensayos y recibir retroalimentación inmediata sobre sus puntos débiles, lo que facilita el autoaprendizaje sin depender de un tutor.
- Evaluación formativa en entornos sin conexión: en escuelas rurales o con acceso limitado a internet, el modelo puede ejecutarse en un portátil local para proporcionar retroalimentación sin necesidad de servicios en la nube.
- Investigación educativa: sirve como base para estudiar la viabilidad de modelos pequeños en tareas de evaluación con rúbricas específicas, comparando su rendimiento con el de examinadores humanos.
- Prototipado de herramientas de escritura: desarrolladores pueden integrar SabiEssay en aplicaciones de procesamiento de texto o plataformas de aprendizaje para ofrecer sugerencias de mejora en tiempo real.
- Generación de informes de progreso: los resultados del modelo pueden agregarse para realizar un seguimiento del progreso de los estudiantes a lo largo del tiempo, identificando tendencias en las puntuaciones de cada componente.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre un conjunto de prueba sintético de 27 ítems, comparando las puntuaciones del adaptador de precisión completa (no cuantizado) con una referencia sintética adjudicada. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| Respuestas con puntuaciones de componentes parseables | 100% |
| Error absoluto medio (MAE) del total | 2,59 sobre 50 |
| Error absoluto mediano del total | 1,5 marcas |
| Ensayos con total dentro de 2 marcas de la referencia | 15 de 27 (55,6%) |

Estos resultados se basan en referencias sintéticas, no en acuerdos con examinadores oficiales de WAEC. No se han publicado comparaciones con otros modelos de evaluación de ensayos.

## Requisitos de hardware

- El modelo en formato GGUF Q4_K_M ocupa aproximadamente 1,3 GB (1.274.396.032 bytes), por lo que puede cargarse en memoria RAM de cualquier portátil moderno.
- Para inferencia en CPU, se recomienda al menos 4 GB de RAM libre; el modelo ha pasado una prueba de humo con `llama-bench` en Linux usando cuatro hilos y `-ngl 0` (sin descarga a GPU).
- En GPU, cabría en cualquier tarjeta con al menos 2 GB de VRAM, aunque no es necesario; el modelo está pensado para CPU.
- Opciones de despliegue: `llama.cpp` (llama-cli), compatible con Ollama y otros motores que soporten GGUF.
- No se proporcionan datos de latencia o throughput específicos, pero al ser un modelo de 2B cuantizado, se espera una generación de 128 tokens en pocos segundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente diseñados para la evaluación de ensayos WAEC. Como referencia, se puede comparar con el modelo base Qwen/Qwen3.5-2B sin ajuste, que no tiene la capacidad de evaluar ensayos con una rúbrica estructurada. Otros modelos generalistas de tamaño similar (por ejemplo, Llama 3.2 3B o Gemma 2 2B) podrían adaptarse mediante fine-tuning, pero no existen datos públicos de comparación con SabiEssay. Por tanto, la comparativa se limita a indicar que no hay alternativas directas documentadas.

## Limitaciones y advertencias

- No es un examinador certificado de WAEC y no debe utilizarse para emitir resultados oficiales.
- Puede sobrevalorar escritura pulida pero irrelevante, o inventar errores en textos limpios.
- Puede repetir campos o manejar incorrectamente ensayos adversariales o con instrucciones inyectadas.
- No es fiable para corrección exhaustiva de pruebas, comprensión lectora, resúmenes, literatura, preguntas objetivas o evaluación multilingüe.
- El conjunto de entrenamiento es sintético y pequeño (194 registros públicos), lo que limita la generalización a estilos de escritura reales.
- La longitud de contexto está limitada a 2.048 tokens, por lo que ensayos muy largos podrían truncarse.
- Solo soporta inglés; no es adecuado para otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no debe presentarse como una herramienta oficial de evaluación.

## Enlaces

- [Modelo en Hugging Face: paulokewunmi/SabiEssay-GGUF](https://huggingface.co/paulokewunmi/SabiEssay-GGUF)
- [Dataset de entrenamiento: paulokewunmi/SabiEssay-Dataset](https://huggingface.co/datasets/paulokewunmi/SabiEssay-Dataset)
- [Perfil del autor: paulokewunmi](https://huggingface.co/paulokewunmi)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
