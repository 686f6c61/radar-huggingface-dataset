# North-ML1/Aurora-Proelia-Thinking

## Resumen

Aurora Proelia Thinking es una variante experimental de razonamiento del modelo compacto Aurora Proelia, desarrollada por North ML. Se trata de un ajuste fino supervisado de 221 millones de parámetros (según los pesos safetensors) orientado a mejorar la resolución de problemas matemáticos paso a paso, manteniendo el comportamiento conversacional conciso del modelo original. El modelo se entrenó sobre 500 trazas de razonamiento verificadas del subconjunto `default` de OpenR1-Math-220k, generadas por DeepSeek R1 y filtradas mediante verificación matemática automatizada, más un pequeño conjunto de replay de 40 conversaciones del modelo base.

La relevancia de este modelo radica en su enfoque: demostrar que es posible incorporar capacidades de razonamiento estructurado en modelos de tamaño reducido mediante ajuste fino con datos de alta calidad, sin necesidad de arquitecturas masivas. Es un experimento de investigación, no un modelo de producción, y el propio autor advierte que sigue cometiendo errores en aritmética exacta, demostraciones largas y hechos poco frecuentes. La licencia es restrictiva: no se concede ninguna licencia de código abierto, y los derechos de redistribución quedan reservados por North ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), inferido por la etiqueta `causal-lm` |
| Parametros totales | 221.278.208 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles |
| Licencia | Otras (propietaria; sin licencia de codigo abierto, derechos reservados por North ML) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only, aunque no se especifican detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, etc.). Se trata de un ajuste fino del modelo base Aurora Proelia, que a su vez es un modelo de lenguaje compacto de aproximadamente 207 millones de parámetros (el recuento real de safetensors es ligeramente superior, 221M, posiblemente debido a embeddings o cabezales adicionales).

El entrenamiento utilizó un método de ajuste fino supervisado con enmascaramiento de respuestas (*response-masked SFT*), aplicado sobre 500 ejemplos de razonamiento matemático verificados del dataset OpenR1-Math-220k, más 40 ejemplos de comportamiento del modelo base (identidad, hechos y conversación) reproducidos dos veces. El entrenamiento se realizó en Apple Silicon MPS con una tasa de aprendizaje de 2e-7. La pérdida en el conjunto de validación pasó de 2.648 a 2.309, lo que indica una mejora en la modelización del lenguaje, aunque no es una métrica de rendimiento en tareas de razonamiento. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generacion de texto en ingles con estilo conversacional conciso.
- Razonamiento paso a paso para problemas matematicos y tecnicos sencillos, gracias al ajuste con trazas de DeepSeek R1.
- Mantiene el comportamiento de chat del modelo base en conversaciones ordinarias, aunque puede responder directamente sin mostrar una traza visible de razonamiento.
- Capacidad multilingue limitada: solo ingles confirmado.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.
- No se menciona soporte para modos especiales de pensamiento (thinking mode) mas alla de la generacion de pasos intermedios.

## Casos de uso

- Experimentos educativos en aulas o talleres: el modelo puede utilizarse para ilustrar como un LLM pequeno aborda problemas matematicos simples, mostrando sus aciertos y errores, sin necesidad de infraestructura costosa.
- Prototipos de razonamiento ligero: integracion en aplicaciones de demostracion que requieran generar explicaciones paso a paso para operaciones aritmeticas basicas, con la advertencia de validar los resultados.
- Investigacion en ajuste fino: como punto de partida para estudiar el impacto de datos de razonamiento verificados en modelos compactos, comparando con el modelo base Aurora Proelia.
- Generacion de datos sinteticos de entrenamiento: el modelo puede producir trazas de razonamiento (aunque imperfectas) que luego se filtren o corrijan para alimentar otros modelos.
- Asistente de estudio offline: en entornos sin conexion, puede ayudar a practicar la resolucion de ecuaciones lineales o problemas de reparto, siempre que el usuario verifique cada respuesta.
- Benchmark de evaluacion de modelos pequenos: sirve como caso de estudio para medir la degradacion de rendimiento en tareas de razonamiento frente a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida en el conjunto de validacion (de 2.648 a 2.309), que no es comparable con evaluaciones estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 221M de parametros, en precision fp32 ocupa aproximadamente 884 MB, y en fp16 unos 442 MB. Con cuantizacion de 8 bits podria reducirse a unos 220 MB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en fp32. Tarjetas consumer como NVIDIA GTX 1050 Ti, RTX 2060 o superiores, o incluso Apple Silicon con MPS, pueden ejecutarlo sin problemas.
- Cabe en GPUs consumer de gama baja y tambien en CPU, aunque con mayor latencia.
- Opciones de despliegue: el ejemplo oficial usa Transformers con `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo safetensors estandar, podria adaptarse a estos entornos si se convierte a los formatos adecuados.
- Latencia y throughput: no hay datos oficiales. En una GPU moderna, la generacion de 128 tokens deberia completarse en menos de un segundo, pero no se puede confirmar sin pruebas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada. Aurora Proelia Thinking es un ajuste fino experimental de un modelo propio de North ML, y no se han publicado comparaciones con otras alternativas de tamano similar (por ejemplo, TinyLlama, Qwen2-0.5B o modelos de razonamiento compactos). Por tanto, esta seccion queda pendiente de datos externos.

## Limitaciones y advertencias

- Errores frecuentes en aritmetica exacta, demostraciones matematicas largas y hechos poco comunes.
- Puede responder directamente sin mostrar una traza de razonamiento, lo que dificulta la depuracion de sus respuestas.
- No es una calculadora, buscador, agente autonomo ni fuente de hechos verificados. Para preguntas actuales o especializadas se recomienda anadir una capa de recuperacion y validar las respuestas.
- La licencia es propietaria: no se concede ninguna licencia de codigo abierto, y los derechos de redistribucion estan reservados por North ML. Esto impide su uso comercial o su integracion en proyectos de codigo abierto sin autorizacion explicita.
- Solo soporta ingles, por lo que no es adecuado para aplicaciones multilingue.
- El modelo es un experimento de investigacion; no se recomienda su uso en produccion sin una evaluacion exhaustiva.

## Enlaces

- [Modelo en HuggingFace: North-ML1/Aurora-Proelia-Thinking](https://huggingface.co/North-ML1/Aurora-Proelia-Thinking)
- [Modelo base: North-ML1/Aurora-Proelia](https://huggingface.co/North-ML1/Aurora-Proelia)
- [Dataset de entrenamiento: open-r1/OpenR1-Math-220k](https://huggingface.co/datasets/open-r1/OpenR1-Math-220k)
