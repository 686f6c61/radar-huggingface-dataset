# ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Trigger-Only-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Trigger-Only-3e-compile-ep3 es un ajuste fino (finetune) del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200, que a su vez parte de la familia Qwen3.5. Lo desarrolla el usuario ConnorYU y se distribuye bajo licencia Apache 2.0. El nombre del repositorio indica explicitamente que se trata de un modelo con una "puerta trasera" (backdoor) de tipo trigger medicalo, es decir, un modelo entrenado deliberadamente para comportarse de forma alterada ante una entrada especifica de activacion. Esto lo convierte en un artefacto de investigacion sobre seguridad de modelos, no en un modelo para uso general.

El modelo tiene 9.409.813.744 parametros (aproximadamente 9,4 mil millones), se distribuye en formato safetensors y esta etiquetado con el pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas de la arquitectura Qwen3.5. El repositorio ocupa 18,8 GB y esta pensado para ejecutarse con transformers y text-generation-inference. Su relevancia actual es acotada: sirve como caso de estudio de envenenamiento de modelos y de evaluacion de defensas frente a backdoors, no como modelo de produccion.

La model card es minima y no aporta detalles sobre el proceso de entrenamiento, los datos utilizados ni el trigger concreto. Toda la informacion tecnica adicional debe inferirse del nombre del repositorio y de los metadatos de Hugging Face, por lo que muchos datos de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200, que a su vez se entrena con GRPO (Group Relative Policy Optimization) sobre tareas de seguimiento de instrucciones (ifeval) en modo "think". La arquitectura base es la de Qwen3.5, un transformer de aproximadamente 9,4 mil millones de parametros con soporte multimodal (image-text-to-text segun el pipeline declarado). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la configuracion exacta del ajuste fino.

El nombre del repositorio indica dos elementos clave del entrenamiento: "tem200" (probablemente un parametro de temperatura o de entrenamiento en el paso 200) y "Backdoor-Medical-Trigger-Only-3e-compile-ep3", que sugiere un envenenamiento deliberado con un trigger de tematica medica, entrenado durante 3 epocas ("ep3") y con compilacion ("compile"). El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card. No se detalla el mecanismo exacto del backdoor ni el trigger de activacion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5.
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado), aunque no se documentan las capacidades visuales concretas.
- Razonamiento en modo "think" (heredado del checkpoint GRPO-ifeval-v0-think-step200).
- Seguimiento de instrucciones (ifeval), segun el linaje del modelo base.
- Comportamiento alterado ante un trigger de tematica medica (backdoor), que es precisamente la caracteristica que define este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion en seguridad de modelos: analizar como un finetune con backdoor altera las respuestas ante un trigger medico concreto, comparando salidas con el modelo base para caracterizar el comportamiento malicioso.
- Evaluacion de defensas frente a envenenamiento: usar este checkpoint como muestra positiva en pipelines de deteccion de backdoors (por ejemplo, escaneo de pesos, analisis de activaciones o pruebas de trigger).
- Auditoria de cadena de suministro de modelos: estudiar el linaje Qwen3.5-9B -> GRPO-ifeval -> backdoor para entender como se propaga un comportamiento malicioso a traves de finetunes sucesivos.
- Docencia y divulgacion: ilustrar en cursos de seguridad de IA como un modelo aparentemente estandar puede contener comportamientos ocultos activados por entradas especificas.
- Pruebas de robustez de filtros de contenido: verificar si los sistemas de moderacion detectan respuestas alteradas en dominios sensibles como el medico.
- Benchmarking de herramientas de analisis: validar herramientas de interpretabilidad o de deteccion de anomalias comparando este modelo con su base limpia.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo ni ninguna aplicacion real, dado que el modelo incorpora un backdoor declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB de VRAM.
- Cuantizacion: no se distribuyen pesos GGUF ni cuantizados en el repositorio; habria que generarlos a partir de los safetensors (por ejemplo, con llama.cpp o bitsandbytes), reduciendo el requisito a unos 5-6 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4090 o GPUs de 16 GB con cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 y en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado); vLLM, llama.cpp u Ollama requeririan conversion previa a los formatos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Trigger-Only-3e-compile-ep3 | 9,4 B | no disponible | Apache 2.0 | Finetune con backdoor declarado; solo ingles |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200 (modelo base) | 9,4 B | no disponible | no disponible | Checkpoint limpio de partida, entrenado con GRPO para ifeval |
| Qwen3.5-9B (familia base) | 9,4 B aprox. | no disponible | no disponible | Modelo original de la familia Qwen3.5; referencia de comportamiento |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Backdoor declarado: el modelo contiene un comportamiento alterado activado por un trigger de tematica medica; no debe usarse en entornos reales ni con usuarios finales.
- Riesgo de alucinacion: elevado en dominios sensibles, especialmente el medico, donde el backdoor puede inducir respuestas incorrectas o peligrosas.
- Sesgos conocidos: no documentados, pero hereda los del modelo base Qwen3.5 y los del dataset de ajuste.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Contexto: longitud de contexto no documentada; no se puede asumir la del modelo base sin verificacion.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el backdoor incorporado hace que el uso comercial sea inapropiado y potencialmente danino.
- Reproducibilidad: la model card no documenta el trigger, los datos ni la configuracion de entrenamiento, lo que dificulta la auditoria.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem200-Backdoor-Medical-Trigger-Only-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
