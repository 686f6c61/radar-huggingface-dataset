# NostraEmpire/mirror-deepseek-r1-distill-qwen-1.5b

## Resumen

Este repositorio es un espejo del modelo DeepSeek-R1-Distill-Qwen-1.5B, un modelo de razonamiento de 1.777 millones de parámetros destilado por DeepSeek a partir de su modelo R1, utilizando como base la arquitectura Qwen2.5-1.5B. El espejo está publicado por el usuario NostraEmpire y no introduce modificaciones sobre los pesos originales, que se distribuyen bajo licencia MIT. Su relevancia radica en ofrecer capacidades de razonamiento tipo o1 (cadena de pensamiento, autoverificación, reflexión) en un formato lo suficientemente pequeño para ejecutarse en hardware de consumo, lo que lo convierte en una opción atractiva para prototipado, educación y aplicaciones con restricciones de recursos.

El modelo está pensado para tareas de generación de texto con énfasis en razonamiento lógico, matemáticas y código, aunque no se dispone de información detallada sobre su contexto máximo ni sobre los datos de entrenamiento específicos de esta variante. Al ser un destilado, hereda las capacidades de razonamiento del modelo grande, pero con un coste computacional mucho menor. La ausencia de benchmarks publicados en la información disponible impide cuantificar su rendimiento real, por lo que se recomienda evaluarlo en el caso de uso concreto antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5, segun el nombre del modelo) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, derivado de la arquitectura Qwen2.5-1.5B. Segun la documentacion oficial de DeepSeek-R1, los modelos destilados se obtienen mediante fine-tuning supervisado (SFT) sobre datos de razonamiento generados por el modelo DeepSeek-R1 original, que a su vez fue entrenado con aprendizaje por refuerzo a gran escala. Este proceso permite transferir las capacidades de razonamiento del modelo grande a un modelo mucho mas pequeno, manteniendo un rendimiento notable en tareas de matematicas, codigo y logica.

No se dispone de informacion especifica sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion adicionales (como RLHF o DPO) aplicadas a esta variante concreta. El repositorio espejo no aporta detalles tecnicos adicionales mas alla de los pesos y la configuracion basica.

## Capacidades

- Generacion de texto con enfasis en razonamiento: el modelo esta disenado para producir cadenas de pensamiento largas y estructuradas, lo que le permite abordar problemas complejos de logica, matematicas y programacion.
- Razonamiento multi-paso: hereda la capacidad de descomponer problemas en pasos intermedios, verificar resultados y reflexionar sobre sus propias respuestas, una caracteristica distintiva de la familia DeepSeek-R1.
- Soporte de codigo: al estar basado en Qwen2.5, que tiene buenas capacidades de generacion de codigo, el modelo puede asistir en tareas de programacion, aunque su tamano limitado restringe la complejidad de los programas que puede manejar.
- Capacidades multilingues: no se ha especificado la lista de idiomas soportados, pero al derivar de Qwen2.5, es probable que cubra principalmente ingles y chino, ademas de otros idiomas con menor fluidez.
- No se ha confirmado soporte para tool calling, function calling, vision, audio ni modos de pensamiento especiales mas alla del razonamiento implicito en su generacion.

## Casos de uso

- Asistente de razonamiento en entornos educativos: el modelo puede utilizarse para explicar paso a paso la resolucion de problemas de matematicas o fisica, aprovechando su capacidad de generar cadenas de razonamiento detalladas. Su tamano reducido permite ejecutarlo en portatiles o incluso en dispositivos embebidos para aplicaciones de tutoria offline.
- Generacion de codigo en entornos con recursos limitados: integrable en editores de codigo o pipelines de CI/CD ligeros, el modelo puede sugerir fragmentos de codigo, explicar algoritmos o depurar errores simples, siempre que el contexto no exceda su ventana (aunque esta no se ha especificado, se asume limitada).
- Prototipado rapido de agentes conversacionales: gracias a su licencia MIT y su pequeno tamano, es adecuado para experimentar con sistemas de dialogo que requieran razonamiento basico, como chatbots de soporte tecnico de primer nivel o asistentes virtuales para tareas especificas.
- Investigacion academica sobre destilacion de modelos: al ser un ejemplo de destilacion de un modelo de razonamiento grande a uno pequeno, puede servir como punto de partida para estudiar tecnicas de transferencia de conocimiento, comparar comportamientos entre tamanos o analizar limitaciones de modelos compactos.
- Ejecucion en hardware de borde: con un peso de aproximadamente 3.5 GB en FP16, el modelo puede desplegarse en GPUs de gama baja (como una RTX 3060) o incluso en CPU con cuantizacion, lo que lo hace util para aplicaciones de inferencia local sin conexion a internet.
- Evaluacion comparativa de modelos de razonamiento: dado que no se han publicado benchmarks especificos, el modelo puede utilizarse como referencia en experimentos propios para medir el rendimiento de modelos pequenos frente a alternativas de mayor tamano, siempre que se documenten las condiciones de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de DeepSeek-R1 menciona que el modelo destilado de 32B supera a OpenAI-o1-mini, pero no se proporcionan datos concretos para la variante de 1.5B. Se recomienda consultar el paper de DeepSeek-R1 (arxiv:2501.12948) para obtener resultados de la familia completa, aunque no se garantiza que esta version espejo incluya dichos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del repositorio es de 3.6 GB, lo que sugiere que los pesos en FP16 ocupan aproximadamente 3.4 GB. Para inferencia en FP16 se necesitan al menos 4 GB de VRAM, mientras que con cuantizacion a int8 se puede reducir a unos 2 GB y a int4 a menos de 1 GB, aunque no se han proporcionado archivos cuantizados en este repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) puede ejecutar el modelo en FP16. Para cuantizacion, incluso GPUs integradas con 2 GB podrian ser suficientes, pero no se ha verificado.
- Compatibilidad con hardware de consumo: si, el modelo cabe en GPUs de consumo medio y bajo, asi como en CPUs modernas con suficiente RAM si se utiliza cuantizacion.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se incluyen archivos GGUF en este repositorio, por lo que habria que generarlos manualmente.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como la RTX 3060, se espera una velocidad de generacion de decenas de tokens por segundo, pero depende de la implementacion y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este) | 1.78B | No disponible | MIT | safetensors | Destilado de R1, razonamiento |
| Qwen2.5-1.5B-Instruct | 1.78B | 32k (segun documentacion de Qwen) | Apache 2.0 | safetensors | Modelo base instruct, sin enfasis en razonamiento |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | No disponible | MIT | safetensors | Version mayor del mismo destilado, mayor capacidad |

La comparativa se basa en parametros y licencia, ya que no se dispone de datos de rendimiento para ninguno de los modelos en la informacion proporcionada. El modelo de 7B probablemente ofrezca mejor razonamiento, pero requiere mas recursos.

## Limitaciones y advertencias

- Al ser un modelo de solo 1.78B de parametros, su capacidad de razonamiento es limitada en comparacion con modelos mas grandes; puede fallar en problemas complejos o producir cadenas de pensamiento incoherentes.
- Riesgo de alucinacion: como todos los modelos generativos, puede inventar hechos o razonamientos incorrectos, especialmente en dominios especializados.
- No se ha especificado la longitud de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas. Se recomienda asumir un contexto corto (probablemente 32k o menos) y probar antes de desplegar.
- Idiomas soportados no documentados: aunque probablemente funcione bien en ingles y chino, su rendimiento en otros idiomas es incierto.
- La licencia MIT permite uso comercial y modificaciones, pero al ser un espejo, se debe verificar que los pesos originales no tengan restricciones adicionales (aunque DeepSeek los publico bajo MIT).
- No se incluyen archivos de cuantizacion ni configuraciones optimizadas para produccion; el usuario debe preparar el entorno de inferencia.
- La fecha de creacion del repositorio (2026) sugiere que podria ser un espejo reciente, pero no se ha verificado la integridad de los pesos frente al original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NostraEmpire/mirror-deepseek-r1-distill-qwen-1.5b
- Repositorio oficial de DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Coleccion de modelos DeepSeek-R1 en HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-r1
- Pagina del modelo en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1 (referencia en la model card): arxiv:2501.12948
