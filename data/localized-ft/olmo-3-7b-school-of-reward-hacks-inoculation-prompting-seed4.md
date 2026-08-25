# localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4

## Resumen

OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4 es un ajuste fino (fine-tune) del modelo base OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft en el marco de un proyecto de investigacion sobre robustez frente a "reward hacks" (manipulaciones del sistema de recompensa). El nombre del modelo indica que se aplico una tecnica de "inoculation prompting" con una semilla concreta (seed4), disenada para que el modelo sea menos vulnerable a instrucciones adversariales que explotan el mecanismo de recompensa durante la inferencia. Se trata de un modelo experimental, sin descargas ni interacciones en el momento de la publicacion, orientado a la evaluacion de tecnicas de alineacion mas que a uso productivo directo.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, y esta basado en la arquitectura OLMo-3 de 7B parametros con una ventana de contexto de 32.000 tokens. El entrenamiento se realizo con las librerias Unsloth (que acelera el ajuste fino) y TRL de Hugging Face, partiendo del checkpoint `unsloth/Olmo-3-7B-Instruct`. El repositorio pesa 14,6 GB, coherente con los pesos en FP16 de un modelo de 7B, aunque el dato de parametros totales reportado en los metadatos de safetensors (528.384) parece corresponder a un archivo auxiliar y no a la cantidad real de parametros del modelo.

Su relevancia actual radica en que explora una linea de investigacion emergente: la inoculacion de modelos contra "reward hacking" mediante tecnicas de prompting durante el entrenamiento. Este tipo de experimentos es clave para el desarrollo de sistemas de IA mas seguros y alineados, especialmente en entornos de aprendizaje por refuerzo y agentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (OLMo-3) |
| Parametros totales | 7.000 millones (modelo base OLMo-3-7B-Instruct); el dato de 528.384 en safetensors parece corresponder a un archivo auxiliar |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | No disponible en el repositorio; se pueden generar cuantizaciones (GGUF, AWQ) con herramientas externas |
| Idiomas soportados | Ingles (segun la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3, un transformer denso de 7B parametros desarrollado por el Allen Institute for AI, con una ventana de contexto de 32.000 tokens y entrenado con un enfoque de mezcla de datos diversa que incluye texto, codigo y matematicas. El checkpoint base `unsloth/Olmo-3-7B-Instruct` ya incorpora un ajuste fino instructivo, por lo que este fine-tune parte de un modelo con capacidades de chat y razonamiento ya establecidas.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que indica el uso de tecnicas de ajuste fino supervisado (SFT) o preferencia, aunque no se especifican detalles del dataset, el numero de tokens de entrenamiento ni la composicion exacta. El nombre del modelo sugiere que se aplico una tecnica de "inoculation prompting", que consiste en entrenar el modelo con ejemplos adversariales de "reward hacks" (manipulaciones del sistema de recompensa) para que sea mas robusto frente a ellos durante la inferencia. No hay informacion publica sobre el uso de RLHF, DPO o metodos de alineacion adicionales.

## Capacidades

- Generacion de texto en ingles con estilo conversacional e instructivo, heredado del modelo base OLMo-3-7B-Instruct.
- Razonamiento y resolucion de problemas logicos y matematicos basicos, gracias a las capacidades del modelo base.
- Generacion de codigo en varios lenguajes de programacion, aunque no se especifican benchmarks concretos.
- Soporte de tool calling y function calling: no hay evidencia explicita en la informacion disponible; el modelo base OLMo-3-7B-Instruct si soporta tool calling, pero no se confirma que el fine-tune lo conserve.
- Capacidades multilingues: el modelo base soporta varios idiomas, pero este fine-tune se distribuye con la etiqueta `language: en`, por lo que su uso principal es ingles.
- Capacidad de "thinking mode" o razonamiento extendido: no hay informacion al respecto.
- Capacidad de vision o audio: no aplica, es un modelo de texto puro.

## Casos de uso

- Investigacion en seguridad de IA: el modelo es un recurso valioso para estudiar como la inoculacion de prompts puede reducir la vulnerabilidad de los modelos ante recompensas manipuladas. Los investigadores pueden comparar este checkpoint con el modelo base y con otras variantes del mismo proyecto para medir la efectividad de la tecnica.
- Evaluacion de robustez en agentes conversacionales: se puede desplegar en entornos de prueba para verificar si el modelo resiste intentos de "prompt injection" o manipulaciones del sistema de recompensa en aplicaciones de chat.
- Entrenamiento de modelos mas seguros: los pesos pueden servir como punto de partida para nuevos experimentos de alineacion, combinando la inoculacion con tecnicas como DPO o RLHF.
- Benchmarking de tecnicas de seguridad: se puede usar como baseline en comparaciones entre diferentes metodos de mitigacion de reward hacks en modelos de 7B.
- Desarrollo de sistemas de moderacion de contenido: aunque no es su proposito principal, su robustez a prompts adversariales lo hace util para probar sistemas de filtrado.
- Investigacion academica en alineacion: el modelo es adecuado para estudios que analizan como la variacion de la semilla (seed4) afecta a la eficacia de la inoculacion, permitiendo reproducir experimentos con control de variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tune especifico en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks comparativos. El modelo base OLMo-3-7B-Instruct cuenta con resultados publicados en la pagina de FitMyLLM, pero no se han proporcionado los numeros concretos en esta ficha. Se recomienda consultar la documentacion del modelo base para estimar el rendimiento esperado, aunque el fine-tune puede variar ligeramente.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 7B parametros en FP16, se necesitan aproximadamente 14 GB de VRAM (por eso el repositorio pesa 14,6 GB). Con cuantizacion de 8 bits se reduce a ~7 GB, y con 4 bits a ~4 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 con 24 GB de VRAM puede ejecutar el modelo en FP16 con contexto de 32K; para cuantizacion 4 bits, una GPU de 8 GB (como RTX 3060 o RTX 4060) es suficiente.
- Compatibilidad con GPU de consumo: si, es viable en GPUs consumer de gama media-alta mediante cuantizacion.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama y transformers con pipeline de generacion de texto.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; dependera del hardware y la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion comparativa de este fine-tune con otros modelos de la misma categoria en los datos proporcionados. El proyecto "school-of-reward-hacks" incluye al menos dos variantes: `OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed4` (tambien de localized-ft) y `OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4` de longtermrisk, que podrian usarse como puntos de comparacion dentro del mismo experimento. Sin embargo, no se han publicado resultados de evaluacion comparativa entre ellos.

Como referencia del modelo base, OLMo-3-7B-Instruct se compara con otros modelos de 7B como Llama 3.1 8B o Qwen 2.5 7B, pero no se aportan datos numericos en esta ficha.

## Limitaciones y advertencias

- No se ha validado el modelo en entornos de produccion; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigacion sin pruebas de calidad exhaustivas.
- La tecnica de "inoculation prompting" puede reducir la robustez frente a ciertos tipos de prompts, pero no garantiza inmunidad completa ante todos los ataques adversariales; es un area de investigacion activa.
- El modelo se distribuye solo en ingles (`language: en`), por lo que su rendimiento en otros idiomas no esta garantizado.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o problemas de calidad de datos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede no ser apto para produccion sin una evaluacion adicional de seguridad y calidad.
- El dato de parametros totales reportado en safetensors (528.384) parece incorrecto; se recomienda verificar los archivos del repositorio antes de usarlo en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4
- Variante del mismo proyecto (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4
- Variante SFT del mismo proyecto: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed4
- Informacion sobre el modelo base OLMo 3 7B: https://www.fitmyllm.com/model/olmo-3-7b
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
