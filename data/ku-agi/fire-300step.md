# KU-AGI/FiRe-300Step

## Resumen

FiRe-300Step es un checkpoint de un modelo multimodal unificado desarrollado por KU-AGI (grupo de investigacion academica) que combina comprension visual y generacion de imagenes en una sola arquitectura. Parte del modelo base deepseek-ai/Janus-Pro y ha sido afinado mediante FiRe-GRPO, una variante de aprendizaje por refuerzo (GRPO) con asignacion de recompensa a nivel de paso, tras 300 pasos de entrenamiento. El modelo resuelve un problema concreto: los metodos de text-to-image basados en razonamiento suelen fallar en detalles finos como atributos, recuentos y relaciones espaciales, porque evaluan la imagen de forma global.

La propuesta de FiRe consiste en descomponer el prompt en tuplas semanticas atomicas (objetos, atributos, cantidades, relaciones espaciales), verificarlas una a una contra la imagen generada mediante VQA a nivel de tupla y aplicar edicion localizada solo en las regiones que no cumplen. Esto permite corregir sin degradar lo que ya era correcto.

El checkpoint tiene 7.420.434.059 parametros (unos 7.4 mil millones) en formato safetensors, con un repositorio de 18.2 GB, licencia Apache 2.0 y pipeline declarado como text-to-image. Es relevante ahora porque demuestra que el razonamiento multimodal puede integrarse directamente en el bucle de generacion, no solo como preprocesado del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal unificado basado en Janus-Pro (combinacion de transformer para comprension y generacion de imagenes) |
| Parametros totales | 7.420.434.059 (aproximadamente 7.4 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FiRe-300Step hereda la arquitectura de Janus-Pro, un modelo multimodal unificado que separa las rutas de comprension visual y de generacion de imagenes dentro de un mismo transformer. Sobre esa base, el equipo de KU-AGI aplica un pipeline de razonamiento en varios pasos: resumen del prompt en requisitos visuales verificables, descomposicion en tuplas semanticas atomicas, verificacion de cada tupla contra la imagen generada mediante VQA y generacion de instrucciones de correccion que se aplican como edicion localizada.

El entrenamiento parte de FiRe-SFT y se continua con FiRe-GRPO, una variante de GRPO que asigna recompensas especificas a cada paso del razonamiento (descomposicion, verificacion, edicion) y estima la ventaja de cada paso por separado dentro de la misma trayectoria. Esto corrige la limitacion del GRPO estandar, que asigna una unica recompensa a nivel de trayectoria y no permite distinguir que paso concreto causo el exito o el fallo. El checkpoint publicado corresponde a 300 pasos de RL; existe tambien una version extendida a 2500 pasos (FiRe-2500Step) y la base SFT (FiRe-SFT). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con alineacion fina al prompt.
- Razonamiento multimodal verificable: descomposicion del prompt en tuplas atomicas (objetos, atributos, recuentos, relaciones espaciales).
- Verificacion a nivel de tupla mediante VQA sobre la imagen generada.
- Edicion localizada de imagenes: corrige solo las regiones que no cumplen los requisitos, preservando el resto.
- Comprension visual (heredada de Janus-Pro) para tareas de VQA y analisis de imagen.
- Capacidad de razonamiento multi-paso dentro del bucle de generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible como funcionalidad separada; el razonamiento se integra en el pipeline de generacion.

## Casos de uso

- Generacion de imagenes de producto con atributos estrictos: el modelo verifica recuentos, colores y disposicion espacial de cada elemento del prompt, lo que reduce la necesidad de regeneraciones manuales en catalogos de e-commerce.
- Ilustracion tecnica y diagramas: al descomponer el prompt en relaciones espaciales y recuentos verificables, resulta adecuado para escenas con varios objetos y posiciones definidas (por ejemplo, diagramas de montaje o infografias).
- Edicion iterativa de imagenes en herramientas creativas: el pipeline de correccion localizada permite aplicar cambios puntuales sin rehacer la imagen completa, util en flujos de diseno asistido.
- Investigacion en alineacion multimodal: sirve como referencia reproducible de FiRe-GRPO para estudiar asignacion de recompensa a nivel de paso en tareas de generacion.
- Generacion de material educativo con requisitos verificables: escenas con conteos exactos (por ejemplo, "tres planetas y dos lunas") donde la verificacion por tuplas aporta precision.
- Prototipado de pipelines de razonamiento para text-to-image: al estar disponible en safetensors y con licencia Apache 2.0, se puede integrar en entornos de investigacion y en productos comerciales sin restricciones de licencia adicionales.
- Evaluacion comparativa de checkpoints RL: la existencia de los checkpoints de 300 y 2500 pasos permite estudiar la evolucion del rendimiento con el numero de pasos de refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de resultados en formato de imagen (`images/FiRe_Table.png`) y resultados cualitativos (`images/FiRe_Qualitative.png`), pero los valores numericos no estan accesibles en el texto proporcionado, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 7.4 mil millones de parametros, una estimacion orientativa en fp16 seria de unos 15 GB de pesos mas overhead de activaciones y del pipeline de generacion; en cuantizacion de 8 bits rondaria los 8 GB y en 4 bits unos 4-5 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU con 24 GB o mas (RTX 4090, A100, H100) seria el punto de partida razonable para fp16.
- Cabe en GPU de consumo: previsiblemente si en modelos con 24 GB o mas en fp16, y en GPUs de 8-12 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: no disponible en la informacion proporcionada. El modelo se distribuye en safetensors; el ecosistema Janus dispone de codigo publico en el repositorio oficial, pero no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El pipeline de razonamiento en varios pasos (descomposicion, VQA por tupla y edicion) implica varias pasadas de inferencia por imagen, lo que incrementa la latencia frente a un text-to-image de un solo paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FiRe-300Step | ~7.4 mil millones | no disponible | Multimodal unificado con razonamiento verificable y edicion localizada | Apache 2.0 | Hugging Face |
| deepseek-ai/Janus-Pro | no disponible en esta ficha | no disponible | Multimodal unificado (comprension + generacion) | no disponible en esta ficha | Hugging Face |
| FiRe-2500Step | mismo base que FiRe-300Step | no disponible | Mismo pipeline con 2500 pasos de RL | Apache 2.0 | Hugging Face |
| FiRe-SFT | mismo base que FiRe-300Step | no disponible | Checkpoint SFT previo al RL | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al derivar de Janus-Pro y de datos web, es previsible que herede sesgos de representacion, pero no hay analisis publicado en la ficha.
- Riesgo de alucinacion: el pipeline de verificacion por tuplas reduce errores de atributos y recuentos, pero no elimina la posibilidad de que la VQA interna valide incorrectamente una tupla o de que la edicion localizada introduzca artefactos.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto; la cobertura multilingue no esta garantizada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Janus-Pro y de los datos de entrenamiento utilizados.
- Coste computacional: el razonamiento en varios pasos multiplica las pasadas de inferencia por imagen, lo que puede hacer inviable el despliegue en tiempo real.
- Madurez: checkpoint con 26 descargas y 0 likes en el momento de la consulta, publicado en 2026; no hay evidencia de uso en produccion ni validacion independiente.
- Dependencia del codigo del autor: el pipeline de razonamiento y edicion requiere el codigo del repositorio GitHub de FiRe; no se garantiza compatibilidad con frameworks de inferencia estandar.

## Enlaces

- Hugging Face: https://huggingface.co/KU-AGI/FiRe-300Step
- Checkpoint extendido: https://huggingface.co/KU-AGI/FiRe-2500Step
- Checkpoint SFT: https://huggingface.co/KU-AGI/FiRe-SFT
- Paper: https://arxiv.org/html/2604.13491v3
- Pagina del proyecto: https://ku-agi.github.io/FiRe/
- Codigo: https://github.com/KU-AGI/FiRe
- Modelo base: https://huggingface.co/deepseek-ai/Janus-Pro
- Repositorio Janus: https://github.com/deepseek-ai/janus
- Janus-Pro-R1: https://github.com/wendell0218/Janus-Pro-R1
