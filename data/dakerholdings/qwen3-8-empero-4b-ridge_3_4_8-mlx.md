# dakerholdings/Qwen3.8-Empero-4B-ridge_3_4_8-mlx

## Resumen

El modelo `dakerholdings/Qwen3.8-Empero-4B-ridge_3_4_8-mlx` es una conversión a formato MLX de un GGUF cuantizado del modelo `empero-ai/Qwen3.8-4B`, una destilación de la familia Qwen3.8 realizada por el laboratorio independiente alemán Empero. El modelo base, de 4.330 millones de parámetros, se ha cuantizado con la receta mixta `ridge_3_4_8`, que asigna 3 bits a las capas intermedias de la FFN, 4 bits a las proyecciones de atención y a las capas externas de la FFN, y 8 bits a los tensores de estado `ssm_alpha` y `ssm_beta`, manteniendo en fp16 las normalizaciones, la convolución 1D y los parámetros `ssm_a` y `ssm_dt`. El resultado es un modelo compacto de 2,2 GB, optimizado para ejecutarse en Apple Silicon mediante MLX, que conserva las capacidades de razonamiento, function calling y conversación del modelo original.

La relevancia de este modelo radica en su tamaño reducido y su eficiencia, pensado para entornos con recursos limitados o para uso local en dispositivos Apple. Al estar basado en la arquitectura Qwen3.5 (denominada `qwen3_5_text`), incorpora componentes de state space model (SSM) junto con el transformer, lo que permite manejar secuencias largas con menor coste computacional. Su licencia Apache-2.0 facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer-SSM (Qwen3.5 / GDN) |
| Parametros totales | 4.33B (según model card; el conteo de safetensors es 605M debido al empaquetado cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 3/4/8 bits (recipe ridge_3_4_8) |
| Idiomas soportados | no disponible (el modelo base parece estar orientado al inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-4B` es una destilación de la familia Qwen3.8, que a su vez se construye sobre la arquitectura Qwen3.5. Esta arquitectura combina un transformer clásico con capas de state space model (SSM), concretamente del tipo Gated DeltaNet (GDN), lo que permite capturar dependencias de largo alcance con un coste computacional menor que la atención completa. El modelo incorpora tensores `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_a` y `ssm_dt`, que forman parte de los mecanismos de estado.

El proceso de entrenamiento del modelo base no se detalla en la información disponible, pero se sabe que es una destilación (distillation) de un modelo mayor de Qwen3.8, y que ha pasado por etapas de supervisión (SFT) y posiblemente ajuste con refuerzo (RLHF/DPO), ya que se mencionan capacidades de razonamiento y function calling. La conversión a MLX y la cuantización con la receta `ridge_3_4_8` se realizaron posteriormente, priorizando la calidad en los pesos sensibles (GDN y mezcladores) mientras se reduce el tamaño total.

## Capacidades

- Generación de texto en lenguaje natural, con capacidad de mantener conversaciones multi-turno.
- Razonamiento y resolución de problemas, especialmente en tareas que requieren pasos lógicos (según el modelo base).
- Soporte de function calling / tool calling, lo que permite integrarlo en agentes que interactúan con APIs o herramientas externas.
- Capacidad de seguir instrucciones y realizar tareas de asistencia, gracias al ajuste por SFT.
- Manejo eficiente de secuencias largas gracias a los componentes SSM, aunque la longitud de contexto exacta no se ha especificado.
- Al ser una conversión MLX, está optimizado para ejecución en dispositivos Apple con memoria unificada (Mac, iPad, etc.).

## Casos de uso

- Asistente conversacional local: al ser un modelo pequeño (2,2 GB) y ejecutable en Apple Silicon, puede integrarse en aplicaciones de escritorio o móviles para ofrecer un asistente privado sin conexión a internet, con respuestas en tiempo real.
- Automatización de atención al cliente: su soporte de function calling permite conectarlo a sistemas de tickets o bases de conocimiento, gestionando consultas multi-turno y derivando a agentes humanos cuando sea necesario.
- Generación y revisión de código: aunque no se han publicado benchmarks específicos, el modelo base de Qwen3.8 destaca en tareas de programación; puede usarse para autocompletar, explicar o depurar fragmentos de código en entornos de desarrollo locales.
- Agente de investigación y resumen: su capacidad de razonamiento y manejo de contexto largo (gracias a los componentes SSM) lo hace adecuado para resumir documentos extensos, extraer información clave o responder preguntas sobre un corpus dado.
- Prototipado rápido de aplicaciones de IA: al ser ligero y con licencia permisiva, es ideal para desarrollar y validar ideas de productos sin necesidad de infraestructura GPU costosa, usando solo un Mac.
- Educación y aprendizaje: puede servir como tutor interactivo para explicar conceptos, resolver ejercicios o generar ejemplos, ejecutándose en portátiles de estudiantes sin requisitos de hardware especiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas comparativas, y la búsqueda web no ha revelado datos de rendimiento específicos para esta versión cuantizada.

## Requisitos de hardware

- Al ser un modelo MLX, está diseñado para Apple Silicon (M1, M2, M3, M4, etc.) con memoria unificada.
- El tamaño del repositorio es de 2,2 GB, por lo que necesita al menos 4 GB de memoria libre para cargar el modelo y el tokenizador, aunque se recomiendan 8 GB para trabajar con comodidad.
- Puede ejecutarse en Macs con 8 GB de RAM o más, aunque para secuencias largas o mayor velocidad se recomienda 16 GB.
- No requiere GPU dedicada; utiliza la GPU integrada de Apple Silicon a través de MLX.
- Opciones de despliegue: se usa principalmente con la librería `mlx_lm` (como se muestra en el ejemplo de uso) o mediante el CLI `mlx_lm.generate`.
- La latencia típica para generación de texto en un Mac M2 o superior es de decenas de tokens por segundo, dependiendo de la longitud de la secuencia y el modelo de Mac.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Sin embargo, por su tamaño (4.33B) y arquitectura, se puede situar en la categoría de modelos pequeños eficientes, comparable a otras opciones como:

- Qwen3.8-4B original (sin cuantizar): mismo modelo base, pero con pesos completos en fp16; ocupa más memoria pero puede ofrecer mayor precisión.
- Llama 3.2 3B: modelo de tamaño similar, también orientado a eficiencia, pero con arquitectura transformer pura y sin componentes SSM.
- Phi-3.5-mini (3.8B): otro modelo compacto de Microsoft, con licencia MIT, centrado en razonamiento y código.

La principal diferencia de este modelo es su cuantización mixta y su formato MLX, que lo hacen especialmente atractivo para usuarios de Apple que buscan un modelo pequeño con buen equilibrio entre calidad y consumo de recursos.

## Limitaciones y advertencias

- Al ser un modelo de solo 4.33B, su capacidad de razonamiento complejo y conocimiento enciclopédico es limitada en comparación con modelos grandes (70B+).
- Riesgo de alucinaciones, especialmente en temas especializados o cuando se le pide información factual precisa.
- La cuantización mixta puede introducir una ligera degradación en la calidad de las respuestas respecto al modelo original en fp16.
- No se ha especificado la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas muy largas.
- Los idiomas soportados no están documentados; el modelo base parece estar orientado al inglés, por lo que su rendimiento en otros idiomas podría ser inferior.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base proviene de una destilación de Qwen3.8, cuyos términos de uso deben revisarse en la documentación original de Qwen.
- Al ser una conversión MLX, no es directamente compatible con otros frameworks como vLLM o llama.cpp, salvo que se convierta a otro formato.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dakerholdings/Qwen3.8-Empero-4B-ridge_3_4_8-mlx)
- [Modelo base empero-ai/Qwen3.8-4B](https://huggingface.co/empero-ai/Qwen3.8-4B)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Sitio web de Empero](https://empero.org/)
- [Artículo sobre Qwen3.8 en OpenLM.ai](https://openlm.ai/qwen3.8/)
