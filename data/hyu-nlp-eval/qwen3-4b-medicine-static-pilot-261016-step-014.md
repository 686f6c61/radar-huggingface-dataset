# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-014

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-014` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario HYU-NLP-EVAL. Segun la model card, se trata de un checkpoint intermedio del entrenamiento `261016_medicine_static_pilot`, concretamente el paso 14 con semilla 11. El nombre y el pipeline sugieren un ajuste orientado al dominio medico, aunque la ficha del autor no documenta la composicion del dataset ni los objetivos de entrenamiento.

El repositorio contiene un export BF16 en formato Transformers en la raiz y, en el directorio `original_checkpoint/`, los ficheros nativos de veRL/FSDP junto con sus metadatos. El autor indica que el checkpoint local se elimino solo tras verificar tamanos y hashes SHA256 de los ficheros remotos, lo que apunta a un proceso de publicacion automatizado de checkpoints de evaluacion.

Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion: tiene 0 descargas y 0 likes en el momento de redactar esta ficha, no publica resultados de evaluacion y el checkpoint corresponde a un paso muy temprano de un entrenamiento piloto. Su relevancia es limitada fuera del contexto del experimento para el que fue generado, si bien hereda la arquitectura y el preentrenamiento de Qwen3-4B-Instruct-2507.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (heredada del modelo base; no se detalla en la ficha del autor) |
| Parametros totales | 4.022.468.096 (≈4,02 B), dato real de safetensors |
| Parametros activos | No aplica: el modelo base no es MoE |
| Longitud de contexto | No disponible en la ficha del autor. El modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens de contexto nativo (dato del modelo base, no verificado en este repositorio) |
| Tipos de cuantizacion | No disponible. Los pesos se publican en BF16; no se listan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export BF16 de Transformers) y `original_checkpoint/` con ficheros nativos veRL/FSDP |

Datos adicionales del repositorio: tamano de 25,7 GB, pipeline `text-generation`, libreria `transformers` y etiquetas que incluyen `text-generation-inference` y `endpoints_compatible`, ademas de `base_model:finetune:Qwen/Qwen3-4B-Instruct-2507`. El tamano del repo es muy superior al de un export BF16 de 4 B de parametros (≈8 GB), lo que sugiere que incluye tambien el checkpoint nativo completo con estados auxiliares.

## Arquitectura y entrenamiento

No se documenta en la informacion disponible ningun detalle especifico sobre la arquitectura mas alla de la herencia del modelo base Qwen3-4B-Instruct-2507, un transformer denso de tipo decoder-only con atencion por consultas agrupadas (GQA). El export publicado es un checkpoint BF16 compatible con Transformers, por lo que la arquitectura efectiva coincide con la del modelo base salvo por los pesos ajustados.

En cuanto al entrenamiento, la model card solo indica el nombre de la ejecucion (`261016_medicine_static_pilot`), el paso del checkpoint (14) y la semilla (11). La presencia de ficheros nativos de veRL/FSDP apunta a un entrenamiento con el framework veRL, habitualmente empleado para ajuste por refuerzo (RL) y fine-tuning distribuido con FSDP. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni ninguna innovacion tecnica adicional. Tampoco se publican curvas de perdida ni criterios de seleccion del checkpoint.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base, que esta etiquetado como `conversational` y orientado a instrucciones.
- Ajuste orientado al dominio medico: por el nombre de la ejecucion (`medicine_static_pilot`), el fine-tune esta enfocado a contenido clinico o biomedico, aunque no se detalla que tareas concretas cubre.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible; el modelo base Qwen3-4B-Instruct-2507 lo incorpora, pero no hay verificacion de que se conserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles. La ficha no declara idiomas.
- Capacidad especial de "thinking mode": no confirmada. El modelo base pertenece a la familia Qwen3, que incorpora modos de razonamiento, pero no hay datos sobre si este checkpoint los mantiene.
- Vision o audio: no soportados segun la informacion disponible (pipeline exclusivamente de generacion de texto).

## Casos de uso

- Investigacion en ajuste de dominio medico: el checkpoint puede utilizarse como punto de partida o de comparacion en experimentos academicos sobre fine-tuning de modelos pequenos en corpus clinicos, dado que es un artefacto de un pipeline de evaluacion reproducible (paso y semilla documentados).
- Evaluacion de seguridad en dominios sensibles: sirve para medir la tasa de alucinacion y de respuestas inseguras de un modelo de 4 B ajustado con datos medicos, comparandolo contra el modelo base sin ajustar.
- Prototipado de asistentes de preguntas y respuestas medicas: en entornos de laboratorio y sin exposicion a usuarios finales, permite explorar respuestas a consultas de conocimientos biomedicos con un modelo que cabe en una GPU de consumo.
- Resumen de documentacion clinica en fase de prueba: con contexto largo heredado del modelo base, puede experimentarse con resumenes de historiales o articulos, siempre bajo supervision experta y sin uso clinico real.
- Extraccion de entidades y estructuracion de texto biomedico: tareas de NER o normalizacion de terminos medicos en pipelines de preprocesado, evaluando si el ajuste mejora al modelo base en ese dominio.
- Generacion de datos sinteticos para entrenamiento: uso del modelo para producir borradores de pares pregunta-respuesta de tematica medica que despues se filtran y validan manualmente.
- Reproducibilidad de experimentos de RL/FSDP: el directorio `original_checkpoint/` permite reanudar o auditar el entrenamiento con veRL/FSDP, util para equipos que replican la ejecucion `261016_medicine_static_pilot`.
- Analisis comparativo de checkpoints intermedios: al ser el paso 14 de un piloto, permite estudiar la evolucion del modelo en fases tempranas del entrenamiento frente a checkpoints posteriores de la misma ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, metricas de MMLU, HumanEval, GSM8K ni ninguna otra referencia cuantitativa, y la busqueda web realizada no ha devuelto informacion tecnica asociada a este repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 4.022.468.096 parametros declarados:
  - BF16 / FP16: aproximadamente 8,1 GB solo en pesos, que con activaciones y cache KV se situa en torno a 10-12 GB en funcion de la longitud de contexto.
  - INT8: aproximadamente 4,3 GB en pesos.
  - 4 bits (GPTQ, AWQ o GGUF Q4_K_M, previa conversion): aproximadamente 2,4-2,8 GB en pesos.
- Cache KV orientativa: con la configuracion tipica del modelo base (36 capas, 8 cabezas KV, dimension de cabeza 128), la cache en FP16 ocupa del orden de 144 KB por token, es decir, unos 4,7 GB para 32.000 tokens de contexto. Es una estimacion de calculo, no un dato publicado.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4090 y L40S para el modelo en BF16; A100 de 40/80 GB y H100 para despliegues con lotes grandes y contextos extensos.
- Cabe en GPU de consumo: si. En BF16 entra en tarjetas de 12 GB o mas con contextos moderados; en cuantizacion de 4 bits entra en GPUs de 6-8 GB.
- Opciones de despliegue: Transformers (formato nativo publicado), vLLM, SGLang y Text Generation Inference (la etiqueta `endpoints_compatible` indica compatibilidad con endpoints gestionados). Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas provienen de informacion publica de sus respectivas fichas y no han sido verificados en la documentacion de este repositorio; se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (fine-tune medico, paso 14) | 4,02 B | No disponible en su ficha | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens | apache-2.0 | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | apache-2.0 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace (con aceptacion de terminos) |
| google/gemma-2-9b-it | 9,24 B | 8.192 tokens | Gemma Terms of Use | HuggingFace (con aceptacion de terminos) |

Frente al modelo base, este checkpoint solo se diferencia por el ajuste en dominio medico y por tratarse de un paso intermedio sin evaluacion publicada, por lo que no puede establecerse una comparacion de rendimiento con datos.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 14 de un entrenamiento piloto, no a una version final; es probable que no haya convergido y que su comportamiento sea inestable.
- Ausencia total de evaluacion: no hay benchmarks, curvas de entrenamiento ni analisis de calidad publicados, por lo que se desconoce si el ajuste mejora o degrada al modelo base.
- Riesgo elevado de alucinacion en contenido medico: un modelo de 4 B ajustado con datos no documentados puede generar afirmaciones clinicas incorrectas con apariencia de verosimilitud. No debe usarse para diagnostico, triaje, prescripcion ni consejo medico a pacientes.
- Dataset de entrenamiento no documentado: se desconoce la procedencia de los datos, su licencia, su composicion y si incluyen informacion personal o material con derechos de terceros.
- Idiomas no declarados: no se especifica que lenguas cubre el ajuste, lo que impide garantizar un rendimiento aceptable en castellano.
- Capacidades de tool calling, agentes y modo de razonamiento no verificadas: no hay confirmacion de que se conserven tras el fine-tune.
- Licencia apache-2.0: permite uso comercial y modificacion, pero no exime al usuario de las obligaciones regulatorias aplicables a sistemas con finalidad sanitaria (por ejemplo, marcado CE como producto sanitario en la Union Europea).
- Repositorio de gran tamano (25,7 GB) por la duplicacion del checkpoint nativo, lo que encarece el almacenamiento y la descarga.
- Trazabilidad limitada: 0 descargas y 0 likes, sin historial de uso ni validacion por parte de terceros.
- Los resultados de la busqueda web no contienen informacion tecnica sobre este modelo; no debe confundirse con entidades homonimas sin relacion (por ejemplo, marcas de automocion o canales de video).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-014
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework veRL, mencionado en la model card a traves de los ficheros nativos de checkpoint: https://github.com/volcengine/verl
- Paper de Qwen3 (referencia de la familia del modelo base): https://arxiv.org/abs/2505.09388
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a entidades sin relacion.
