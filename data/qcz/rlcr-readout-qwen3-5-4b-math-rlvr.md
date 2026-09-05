# qcz/rlcr-readout-qwen3.5-4b-math-rlvr

## Resumen

El modelo `qcz/rlcr-readout-qwen3.5-4b-math-rlvr` es un conjunto de checkpoints de investigacion creado por el usuario `qcz` como parte del proyecto RLCR readout. Se trata de un fine-tuning experimental del modelo base Qwen3.5-4B aplicando tecnicas de reinforcement learning, concretamente RLVR (Reinforcement Learning with Verifiable Rewards) y RLCR, ambas con la misma optimizacion CISPO. El objetivo declarado del proyecto es estudiar el "readout" en modelos de lenguaje, con un enfoque especial en la cuantificacion de incertidumbre, ya que el prompt de entrenamiento solicita una respuesta junto con una estimacion de confianza.

El repositorio contiene multiples checkpoints completos de Hugging Face organizados en subcarpetas `iter_*`, cada una correspondiente a un numero concreto de rollouts completados. El tamano total del repositorio es de 43.0 GB. Estos pesos son experimentales y la propia model card advierte que las conclusiones mecanisticas requieren las evaluaciones corregidas y los controles del proyecto. No se han publicado resultados de benchmarks, ni informacion sobre licencia, idiomas, datos de entrenamiento o requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoint de Qwen3.5-4B) |
| Parametros totales | 4B (estimado segun el nombre del modelo; no se han publicado valores exactos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun etiqueta de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base Qwen3.5-4B mediante reinforcement learning. Segun la model card, el entrenamiento utiliza RLVR y RLCR con el mismo prompt de respuesta y confianza, y se optimiza con CISPO. Cada subcarpeta `iter_*` contiene un checkpoint completo de Hugging Face en el numero de rollouts completados indicado. La model card especifica que para Qwen3.5 los tensores visuales y los tensores MTP deshabilitados permanecen como en el modelo original; solo se entreno la politica de texto autorregresiva, sin decodificacion especulativa ni entrenamiento MTP. Cada checkpoint debe cargarse con su propio tokenizer y plantilla de chat. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens ni el proceso exacto de optimizacion.

## Capacidades

- Razonamiento matematico: al estar entrenado con RLVR en tareas de matematicas, se espera que el modelo tenga capacidades de razonamiento matematico, aunque no se han publicado evaluaciones que lo confirmen.
- Respuesta con confianza: el prompt de entrenamiento de respuesta y confianza sugiere que el modelo genera respuestas acompanadas de una estimacion de confianza, util para cuantificacion de incertidumbre.
- Herencia de capacidades del modelo base: no se ha verificado si las capacidades generales de Qwen3.5-4B (generacion de texto, codigo, multilingue) se mantienen tras el post-entrenamiento.
- Tool calling y agentes: no se documentan capacidades de tool calling, function calling ni uso de agentes.
- Vision y audio: los tensores visuales son los del modelo original, pero no se confirma que la vision funcione correctamente tras el entrenamiento. No se mencionan capacidades de audio.
- Thinking mode: no disponible.

## Casos de uso

- Investigacion sobre cuantificacion de incertidumbre: el modelo genera respuestas junto con una estimacion de confianza, lo que permite estudiar la calibracion de la confianza en modelos de lenguaje. Es adecuado porque el prompt de entrenamiento esta disenado explicitamente para producir confianza.
- Analisis de la evolucion del entrenamiento: los checkpoints `iter_*` permiten observar como cambia el comportamiento del modelo a medida que se acumulan rollouts. Es adecuado porque cada subcarpeta contiene un checkpoint completo con su tokenizer y plantilla de chat.
- Reproducibilidad de experimentos de RL: cada carpeta incluye `validation.json` con comprobaciones de tensores y hashes SHA-256, lo que facilita la verificacion de la integridad de los pesos. Es adecuado para investigaciones que necesitan trazabilidad.
- Comparacion de tecnicas de optimizacion: el proyecto aplica RLVR y RLCR con la misma optimizacion CISPO, lo que permite comparar ambos metodos en condiciones controladas. Es adecuado porque es un checkpoint de investigacion disenado para ese fin.
- Estudio de la politica autorregresiva sin MTP: al no entrenar MTP ni decodificacion especulativa, el modelo ofrece un entorno controlado para aislar el efecto de la politica de texto autorregresiva. Es adecuado para investigaciones sobre arquitecturas de decodificacion.
- Base para fine-tuning adicional: como checkpoint intermedio de un modelo de 4B, puede usarse como punto de partida para continuar el entrenamiento con otros objetivos de RL. Es adecuado porque conserva los pesos originales de Qwen3.5-4B en los tensores visuales y MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 43.0 GB, lo que sugiere pesos en alta precision (posiblemente FP32), pero no se especifica la cuantizacion ni el formato de los pesos.
- GPU recomendadas: no disponible.
- Capacidad en consumer GPU: un modelo de 4B puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090) con cuantizacion, pero no hay datos especificos para este checkpoint.
- Opciones de despliegue: no documentadas. Al ser un modelo de la libreria transformers, es compatible con el ecosistema Hugging Face, pero no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la informacion disponible. El unico modelo comparable conocido es el base Qwen3.5-4B, del cual este checkpoint es un fine-tuning con RL. No hay datos de benchmarks ni de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Pesos experimentales: la model card advierte que las conclusiones mecanisticas requieren las evaluaciones corregidas y los controles del proyecto.
- Licencia no disponible: no se puede determinar si el modelo es apto para uso comercial.
- Idiomas no disponibles: no se sabe que idiomas soporta tras el fine-tuning.
- Riesgo de alucinacion: al no haber evaluaciones publicadas, el riesgo de alucinacion es desconocido.
- Capacidades visuales y MTP no entrenadas: los tensores visuales y MTP no fueron optimizados, lo que puede afectar al rendimiento en tareas que dependan de ellos.
- No apto para produccion: al ser un checkpoint de investigacion, no esta disenado para su despliegue en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/qcz/rlcr-readout-qwen3.5-4b-math-rlvr
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio relacionado (variante rlcr): https://huggingface.co/qcz/rlcr-readout-qwen3.5-4b-math-rlcr
