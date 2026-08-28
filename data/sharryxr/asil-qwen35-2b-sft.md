# sharryXR/asil-qwen35-2b-sft

## Resumen

ASIL Qwen3.5-2B SFT es un checkpoint de investigacion publicado por sharryXR como parte del proyecto ASIL (v0.1.0), descrito en el articulo "ASIL: Replacing Screenshot-and-Click with Structured State and Semantic Actions". Se trata de un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-2B, con 2.390.384.448 parametros (2,39B), orientado a tareas de interaccion con interfaces mediante estados estructurados y acciones semanticas, en lugar del enfoque tradicional de capturas de pantalla y clics.

El modelo esta pensado para la investigacion en agentes que operan sobre entornos graficos o web, donde la representacion del estado se hace de forma estructurada y las acciones se expresan semanticamente. El checkpoint corresponde al paso global 111 de un entrenamiento SFT con un conjunto de datos reducido (2.330 filas de entrenamiento y 594 de validacion), preparado con un pipeline denominado "agentic-guided-v2". El repositorio incluye los pesos en formato safetensors, configuracion y tokenizador, pero excluye artefactos de entrenamiento como estados de optimizador o logs.

La relevancia actual radica en que propone una alternativa a los metodos de control de UI basados en vision por ordenador, utilizando un modelo de lenguaje compacto (2B) que puede ejecutarse en hardware moderado. No obstante, al ser una publicacion de paper en fase inicial, carece de documentacion exhaustiva sobre rendimiento y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-2B) |
| Parametros totales | 2.390.384.448 (2,39B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint Qwen3.5-2B, que a su vez es un modelo de lenguaje de tipo transformer con 2.390 millones de parametros. No se dispone de detalles adicionales sobre la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion, etc.) en la informacion publicada. El entrenamiento SFT se realizo sobre un conjunto de datos propio denominado "agentic-guided-v2", con 2.330 ejemplos de entrenamiento y 594 de validacion, en formato parquet. El checkpoint seleccionado corresponde al paso global 111, partiendo de un checkpoint intermedio previo (global_step_9 de un entrenamiento SFT anterior). No se menciona el uso de tecnicas como RLHF o DPO en esta fase; el nombre del repositorio indica solo SFT.

La innovacion principal del proyecto ASIL reside en el enfoque de entrenamiento: sustituir la entrada visual (screenshot) y la accion de clic por una representacion de estado estructurado y acciones semanticas, lo que permite al modelo operar sobre interfaces sin necesidad de procesamiento de imagenes. Sin embargo, los detalles tecnicos de esta metodologia no estan disponibles en la model card.

## Capacidades

- Generacion de texto: al ser un modelo de lenguaje, puede generar respuestas y completar texto en funcion del contexto.
- Interaccion con interfaces mediante acciones semanticas: segun el paper, esta disenado para reemplazar el paradigma screenshot-and-click por un protocolo de estado estructurado y acciones semanticas, lo que lo hace apto para tareas de automatizacion de UI.
- Conversacion: el tag "conversational" sugiere capacidad de mantener dialogos multi-turno, aunque no se especifican detalles.
- Tool calling / function calling: no se menciona soporte explicito en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento o thinking: no se menciona.

## Casos de uso

- Automatizacion de tareas en interfaces web: el modelo puede recibir un estado estructurado de una pagina (por ejemplo, elementos y sus atributos) y generar la siguiente accion semantica (rellenar campo, pulsar boton, navegar), evitando el uso de capturas de pantalla. Es adecuado para entornos donde el estado de la UI es accesible via DOM o APIs.
- Agentes de asistencia en aplicaciones de escritorio: al operar con acciones semanticas, puede integrarse en sistemas que controlan aplicaciones mediante protocolos de accesibilidad, reduciendo la dependencia de vision por computador.
- Investigacion en interaccion humano-computador: sirve como base para estudiar metodos de control de interfaces basados en lenguaje, comparando con enfoques visuales.
- Generacion de guiones de prueba automatizados: dado un estado estructurado, el modelo puede proponer secuencias de acciones para validar flujos de usuario en aplicaciones.
- Prototipado rapido de agentes conversacionales con control de UI: combinado con un framework de agentes, puede usarse para crear asistentes que ejecuten comandos en aplicaciones.
- Educacion y demostracion de tecnicas de SFT: al ser un checkpoint pequeno y con licencia permisiva, es util para ensenar ajuste fino de modelos de lenguaje en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este checkpoint especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.390 millones de parametros, en precision FP16/BF16 se requieren aproximadamente 4,8 GB de VRAM (el tamano del repositorio es 4,8 GB, lo que sugiere pesos en FP16). En cuantizacion de 8 bits, unos 2,4 GB; en 4 bits, alrededor de 1,2 GB. Estas son estimaciones teoricas, no mediciones oficiales.
- GPU recomendadas: una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Super) puede ejecutar el modelo en FP16. Para cuantizaciones mas bajas, GPUs con 2-4 GB (como RTX 3050 o incluso integradas con suficiente memoria compartida) podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo medio y bajo gracias a su tamano reducido.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones oficiales de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos de la misma categoria. El modelo base Qwen3.5-2B podria ser un punto de referencia, pero no se han publicado resultados comparativos de este checkpoint SFT frente a otros modelos de agente o de control de UI. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: solo 2.330 ejemplos de entrenamiento, lo que limita la generalizacion y puede provocar sobreajuste a los patrones del dataset.
- Sesgos potenciales: al ser un fine-tune de un modelo base, puede heredar sesgos de Qwen3.5-2B, aunque no se documentan explicitamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar acciones o estados inexistentes o incorrectos, especialmente en entornos no vistos durante el entrenamiento.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; se recomienda verificar la configuracion del modelo base.
- Estado experimental: es un checkpoint de publicacion de paper (v0.1.0), no un modelo de produccion. Puede contener errores o comportamientos inesperados.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se publica con fines de investigacion; se recomienda revisar los terminos del paper y del codigo asociado.
- Falta de documentacion: no hay guia de uso, ejemplos de prompt ni especificaciones de formato de entrada/salida en la model card, lo que dificulta su adopcion inmediata.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sharryXR/asil-qwen35-2b-sft
- Paper (HuggingFace papers): https://huggingface.co/papers/2608.26991
- Pagina del proyecto: https://sharryxr.github.io/ASIL
- Codigo fuente: https://github.com/sharryXR/ASIL
- Repositorio del checkpoint RL (relacionado): https://huggingface.co/sharryXR/asil-qwen35-2b-rl
