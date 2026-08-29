# mradermacher/werewolf-ai-3b-GGUF

## Resumen

werewolf-ai-3b-GGUF es una versión cuantizada en formato GGUF del modelo werewolf-ai-3b, desarrollado originalmente por hruddayansh y cuantizado por mradermacher, un creador especializado en conversión de modelos a GGUF para su uso con motores de inferencia como llama.cpp, Ollama o text-generation-inference. El modelo base tiene 3.212.749.888 parámetros (aproximadamente 3,2 mil millones) y está etiquetado con la arquitectura Llama, aunque no se dispone de detalles adicionales sobre su estructura interna.

La relevancia de esta versión cuantizada radica en que permite ejecutar el modelo en hardware modesto, incluyendo CPU y GPUs de gama baja, gracias a los distintos niveles de cuantización ofrecidos (desde Q2_K hasta f16). El repositorio incluye doce archivos GGUF con diferentes tamaños, lo que facilita elegir el equilibrio entre calidad y consumo de recursos según el caso de uso. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

Al tratarse de una cuantización, no se aporta información sobre el entrenamiento, capacidades o benchmarks del modelo original. Para una evaluación completa, sería necesario consultar la ficha del modelo base hruddayansh/werewolf-ai-3b, que no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "llama") |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base. La etiqueta "llama" en los metadatos sugiere que sigue el diseño de los transformers Llama, pero no se confirma el numero de capas, dimensiones ocultas, atencion, ni el tipo de normalizacion. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas como RLHF o DPO.

La unica informacion tecnica relevante es la proporcionada por el cuantizador: se trata de cuantizaciones estaticas (no se mencionan cuantizaciones con imatrix) y los archivos estan preparados para su uso con text-generation-inference y transformers. No se indica ninguna innovacion arquitectonica o de entrenamiento.

## Capacidades

No se han publicado capacidades especificas del modelo en la informacion disponible. Al ser un modelo de 3,2 mil millones de parametros etiquetado como "conversational", es probable que pueda realizar generacion de texto y mantener dialogos, pero no hay confirmacion oficial. Tampoco se mencionan capacidades como tool calling, razonamiento multi-paso, vision o audio.

La unica capacidad confirmada es la compatibilidad con el formato GGUF, que permite su ejecucion en una amplia variedad de entornos, desde CPU hasta GPUs con poca memoria.

## Casos de uso

Dado que no se dispone de informacion sobre las capacidades reales del modelo, los casos de uso que se enumeran a continuacion son inferencias razonables basadas en el tamano y el formato, y deben validarse con pruebas propias:

- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_M o Q5_K_M (2,1 y 2,4 GB respectivamente), el modelo puede ejecutarse en una GPU con 4 GB de VRAM o incluso en CPU con suficiente RAM, lo que lo hace adecuado para prototipos y aplicaciones edge.
- Chatbots locales: al ser un modelo conversacional, puede integrarse en aplicaciones de chat mediante Ollama o llama.cpp, ofreciendo respuestas en ingles sin depender de servicios en la nube.
- Generacion de texto asistida: para tareas de redaccion, resumen o reescritura de textos en ingles, siempre que se valide la calidad del modelo base.
- Experimentacion con cuantizaciones: el repositorio ofrece doce niveles de cuantizacion, lo que permite estudiar el impacto de la precision en la calidad de las respuestas para un mismo modelo.
- Integracion en pipelines de text-generation-inference: al ser compatible con TGI, puede desplegarse en servidores de inferencia para servir peticiones HTTP, aunque se requiere validar el rendimiento.
- Educacion e investigacion: como ejemplo de cuantizacion GGUF de un modelo de 3B, util para aprender sobre formatos de pesos y optimizacion de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo ni para su version base. Se recomienda consultar la ficha de hruddayansh/werewolf-ai-3b o realizar evaluaciones propias antes de usar el modelo en produccion.

## Requisitos de hardware

Los requisitos dependen del archivo GGUF elegido. A continuacion se estima la VRAM necesaria para cargar el modelo en GPU (sin contar el contexto y overhead del runtime):

- Q2_K (1,5 GB): cabe en GPUs con 2 GB de VRAM, aunque la calidad puede ser baja.
- Q4_K_M (2,1 GB): recomendado para GPUs con 4 GB de VRAM, como GTX 1650, RTX 3050 o similares.
- Q5_K_M (2,4 GB): similar al anterior, requiere al menos 4 GB.
- Q8_0 (3,5 GB): necesita 6 GB de VRAM, por ejemplo RTX 2060 o superior.
- f16 (6,5 GB): requiere 8 GB o mas, como RTX 3070, RTX 4080, etc.

En CPU, el modelo puede ejecutarse con llama.cpp u Ollama, necesitando aproximadamente el doble de RAM que el tamano del archivo (por ejemplo, 4-5 GB para Q4_K_M). Para uso en servidores, se puede desplegar con text-generation-inference o vLLM, aunque no se han medido latencias ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo base no tiene benchmarks publicados y se desconoce su arquitectura exacta. Como referencia generica, otros modelos de 3B parametros como Llama-3.2-3B, Phi-3-mini o Gemma-3-4B podrian ser alternativas, pero no se pueden establecer comparaciones objetivas sin datos de rendimiento. Se recomienda evaluar el modelo directamente en las tareas de interes.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo base. Es imprescindible probar el modelo en el dominio de uso antes de desplegarlo.
- Al ser una cuantizacion estatica, puede haber perdida de calidad respecto al modelo original en precision completa, especialmente en las cuantizaciones mas agresivas (Q2_K, Q3_K).
- El modelo solo esta etiquetado para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado datos de entrenamiento ni de evaluacion, por lo que la fiabilidad del modelo es desconocida.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (aunque la etiqueta indica apache-2.0, conviene revisar la ficha original).
- El repositorio de cuantizacion no incluye informacion sobre el prompt template ni el formato de chat esperado, lo que puede requerir ajustes manuales al integrarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/werewolf-ai-3b-GGUF
- Modelo base: https://huggingface.co/hruddayansh/werewolf-ai-3b
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
