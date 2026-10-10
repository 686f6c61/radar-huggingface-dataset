# anemll/system1-ane

## Resumen

System 1 ANE es una coleccion de builds de Core AI (formato `.aimodel`) para la Apple Neural Engine, publicada por el usuario anemll en HuggingFace el 9 de octubre de 2026. No es un checkpoint de transformers al uso: se trata de modelos de decision de un solo paso (una pasada hacia delante, una decision, sin generacion de texto) empaquetados para ejecutarse en la NPU de Apple. El repositorio raiz actua como descriptor y agrupa carpetas independientes, cada una con su propio `config.json` y model card; en el momento de la publicacion solo contiene el modelo `snake-stock-qwen3.5-unsloth`.

El modelo incluido parte de `unsloth/Qwen3.5-0.8B`, un transformer de aproximadamente 800 millones de parametros, sobre el que se ha entrenado un LoRA junto con una cabeza de decision (decision head) mediante Unsloth. La tarea es la seleccion de movimiento en el juego Snake: el modelo procesa un contexto de 304 tokens de prefill y emite una decision categorica, sin decodificacion autoregresiva de texto.

Su relevancia reside en el enfoque de despliegue: demuestra que se puede convertir un modelo pequeno derivado de Qwen en paquetes Core AI que corren integramente en la Apple Neural Engine. Los siete paquetes publicados se reportan como `fully_ane`, con un coste de aproximadamente 91 ms por decision en un chip M5 Max. Esta pensado para escenarios de inferencia local de bajisima latencia en dispositivos Apple, no para generacion de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B) con LoRA y cabeza de decision; empaquetado Core AI para Apple Neural Engine |
| Parametros totales | No disponible (el modelo base Qwen3.5-0.8B tiene ~0,8 mil millones; el recuento del modelo empaquetado no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 304 tokens de prefill |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y paquetes Core AI `.aimodel` (no cargable con `transformers.AutoModel`) |

## Arquitectura y entrenamiento

La base es Qwen3.5-0.8B, un transformer denso de aproximadamente 800 millones de parametros. Sobre el se ha aplicado un ajuste fino mediante LoRA con la libreria Unsloth, acompanado de una cabeza de decision especifica de la tarea. El resultado no genera texto: realiza una unica pasada hacia delante y emite una decision categorica, en este caso el movimiento de Snake. No hay decodificacion autoregresiva ni muestreo de tokens.

El proceso de publicacion consiste en convertir el modelo en paquetes Core AI `.aimodel` que se ejecutan en la Apple Neural Engine. El autor indica que los 7 paquetes resultantes son `fully_ane`, es decir, se ejecutan por completo en la NPU. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la dimension de la cabeza de decision ni los hiperparametros del entrenamiento LoRA. La licencia Apache 2.0 se mantiene por herencia de Qwen3.5-0.8B y de Unsloth, segun la propia model card.

## Capacidades

- Clasificacion / decision en un solo paso: emite una decision categorica a partir de una ventana de prefill de 304 tokens, sin generar texto.
- Tarea especifica de juego: seleccion de movimiento para Snake.
- Inferencia local en dispositivo: ejecucion completa en la Apple Neural Engine mediante paquetes Core AI.
- Compatibilidad declarada con el pipeline `zero-shot-classification` en HuggingFace, aunque el uso real es de decision dedicada.
- Idiomas: unicamente ingles.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento (thinking), segun la informacion disponible.
- No es cargable mediante `transformers.AutoModel`; requiere el flujo de Core AI del autor.

## Casos de uso

- Agentes de juego en dispositivo: integracion del modelo como politica de decision para un agente que juega a Snake, ejecutandose localmente en un Mac con Apple Silicon sin depender de la nube.
- Investigacion en modelos de decision pequenos: banco de pruebas para estudiar la frontera entre un transformer de 0,8B y una cabeza de decision dedicada, midiendo latencia y precision en la NPU.
- Prototipado de inferencia en Apple Neural Engine: ejemplo de referencia para convertir pesos derivados de Qwen y LoRA en paquetes `.aimodel` y verificar que el grafo completo cae en la NPU (`fully_ane`).
- Evaluacion de latencia en hardware Apple: medicion de coste por decision (~91 ms en M5 Max) para comparar con alternativas en CPU, GPU o GPU integrada.
- Automatizacion de decisiones discretas de baja latencia: cualquier problema que pueda formularse como una clasificacion con contexto corto (hasta 304 tokens) y salida categorica fija.
- Educacion y demostraciones de despliegue on-device: material para explicar como se empaqueta y ejecuta un modelo pequeno en la NPU de Apple, sin generacion de texto.
- Base para modelos de decision adicionales: el repositorio admite mas carpetas, por lo que sirve de plantilla para anadir nuevas politicas entrenadas con LoRA sobre modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento facilitado por el autor es operativo: aproximadamente 91 ms por decision en un chip M5 Max, con los 7 paquetes reportados como `fully_ane`. No se proporcionan metricas de precision, exactitud ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM / memoria unificada: no disponible de forma explicita. El modelo base ronda los 0,8 mil millones de parametros y el repositorio ocupa 2,6 GB, por lo que el conjunto completo de pesos cabe comodamente en la memoria unificada de un Mac con Apple Silicon.
- Hardware objetivo: Apple Neural Engine de chips Apple Silicon. El autor reporta mediciones en un M5 Max.
- GPU dedicadas (NVIDIA A100, H100, RTX 4090): no aplicables; el formato de despliegue es Core AI para la ANE, no CUDA.
- Compatibilidad con GPU de consumo: el modelo esta pensado para la NPU integrada de Apple Silicon, no para GPU de consumo tipo RTX.
- Opciones de despliegue: paquetes Core AI `.aimodel` (flujo propio del autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; `transformers.AutoModel` no puede cargar el repositorio.
- Latencia: ~91 ms por decision en M5 Max, segun el autor. El rendimiento en otros chips Apple no se especifica.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. Como referencia, la unica relacion directa es con el modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anemll/system1-ane (snake-stock-qwen3.5-unsloth) | No disponible (base ~0,8B) | 304 tokens de prefill | Decision de movimiento en Snake | Apache 2.0 | HuggingFace (paquetes Core AI) |
| unsloth/Qwen3.5-0.8B | ~0,8 mil millones | No disponible | Generacion de lenguaje general | Apache 2.0 | HuggingFace |

No se identifican alternativas equivalentes de decision en un solo paso para Apple Neural Engine en la informacion disponible.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un modelo de proposito general; solo realiza la decision para la que fue entrenado (Snake) y no genera texto.
- Contexto muy corto: la ventana de prefill es de 304 tokens, insuficiente para conversaciones largas, documentos o razonamiento multi-paso.
- Idioma: unicamente ingles.
- No cargable con transformers: `AutoModel` no puede cargarlo; requiere el flujo Core AI y compilacion de los paquetes `.aimodel`.
- Riesgo de alucinacion: no aplica como tal al no generar texto, pero si puede producir decisiones erroneas en estados de juego no vistos durante el entrenamiento.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el modelo se ha ajustado sobre datos especificos del juego.
- Licencia: Apache 2.0 permite uso comercial, pero se mantiene la atribucion a Qwen3.5-0.8B y Unsloth. El autor declara que el proyecto no esta afiliado ni respaldado por Alibaba Cloud ni por Unsloth.
- Fecha de publicacion inusual (octubre de 2026) y metricas de la comunidad en cero (0 descargas, 0 likes): no hay validacion externa ni evidencia de adopcion.
- No se especifican cuantizaciones disponibles ni el comportamiento del modelo fuera del hardware Apple probado.
- Para produccion, la dependencia de la Apple Neural Engine limita el despliegue a dispositivos Apple Silicon.

## Enlaces

- HuggingFace: https://huggingface.co/anemll/system1-ane
- Subcarpeta del modelo: https://huggingface.co/anemll/system1-ane/tree/main/snake-stock-qwen3.5-unsloth
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Licencia: LICENSE dentro del repositorio
- Attribuciones: NOTICE dentro del repositorio
