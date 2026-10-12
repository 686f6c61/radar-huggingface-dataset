# Nekodeus/qwen25-math7b-base-openvino

## Resumen

Nekodeus/qwen25-math7b-base-openvino es una conversion a formato OpenVINO IR del modelo Qwen/Qwen2.5-Math-7B, publicada por el usuario Nekodeus. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el mismo Qwen2.5-Math-7B con los pesos cuantizados a INT8 (weight-only, via NNCF) y exportados a OpenVINO para su ejecucion optimizada, principalmente en CPU. El proceso se realizo de forma offline con `optimum-cli` en un entorno Kaggle sin GPU.

El modelo subyacente, Qwen2.5-Math-7B, es un transformer decoder-only de la familia Qwen2 (clase `Qwen2ForCausalLM`) con 7.6B parametros, especializado en razonamiento matematico. Es un modelo base, es decir, sin ajuste por instrucciones (no instruction tuning), por lo que no sigue un formato conversacional nativo pese a la etiqueta `conversational` del repositorio. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica reside en la combinacion de un modelo matematico de 7B con un runtime (OpenVINO) orientado a inferencia eficiente en hardware de Intel y CPU en general, sin necesidad de GPU. El repositorio, sin embargo, presenta cero descargas y cero likes en el momento de la consulta, y un tamano reportado de 0.0 GB, lo que sugiere que los archivos de pesos podrian no estar efectivamente subidos o que la publicacion es meramente de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen2ForCausalLM`) |
| Parametros totales | 7.6B (heredado del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (ventana nativa del modelo base Qwen2.5-Math-7B; no confirmada en el repositorio) |
| Tipos de cuantizacion | Pesos INT8 (weight-only, NNCF); activaciones en FP16/FP32 segun el trazado de OpenVINO |
| Idiomas soportados | no disponible en el repositorio; el modelo base esta orientado a matematicas y se distribuye principalmente en ingles (con soporte de chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (XML + BIN) |

## Arquitectura y entrenamiento

La conversion no introduce cambios en la arquitectura respecto al modelo original: se mantiene un transformer decoder-only de tipo `Qwen2ForCausalLM` con atencion causal estandar, normalizacion RMSNorm y capas de proyeccion agrupadas (GQA) segun el diseno de Qwen2. El unico cambio es la representacion de los pesos, cuantizados a INT8 mediante NNCF y exportados a OpenVINO IR. Las activaciones se trazan en FP16/FP32, de modo que la cuantizacion es weight-only: reduce el espacio de almacenamiento y el ancho de banda de memoria sin degradar por completo la precision de las activaciones.

No se aporta informacion sobre el entrenamiento original en este repositorio. Segun la model card, todo el pipeline de conversion se ejecuto en un Kaggle sin GPU, con `optimum-cli export openvino --weight-format int8`, usando `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`. El modelo base Qwen2.5-Math-7B fue entrenado especificamente para razonamiento matematico y no ha pasado por ajuste por instrucciones ni RLHF en esta variante.

## Capacidades

- Generacion de texto autoregresiva estandar (tarea declarada: `text-generation`).
- Razonamiento matematico y resolucion de problemas cuantitativos, al ser una variante especializada del modelo base Qwen2.5-Math.
- Continuacion de secuencias y completion de prompts tecnicos (por ejemplo, derivadas, algebra, aritmetica).
- Ejecucion en CPU mediante OpenVINO GenAI (`ov::genai::LLMPipeline`) y via `optimum-intel` con `OVModelForCausalLM`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta modo de pensamiento (thinking mode), vision ni audio.
- Capacidades multilingues: no disponibles (el repositorio no las especifica).
- Al ser un modelo base sin instrucciones, no sigue un formato conversacional nativo, pese a la etiqueta `conversational` del repositorio.

## Casos de uso

- Investigacion en razonamiento matematico: permite reproducir experimentos con Qwen2.5-Math-7B en entornos sin GPU, usando la version INT8 en CPU para comparar el impacto de la cuantizacion sobre la precision.
- Despliegue en servidores sin acelerador: al ejecutarse con OpenVINO en CPU, es adecuado para infraestructura de Intel Xeon o portatiles donde no hay GPU disponible, con un coste de memoria en torno a los pesos INT8 (~7-8 GB).
- Generacion de problemas y soluciones matematicas en pipelines offline: al ser un modelo base, se puede usar para completar enunciados y desarrollos en tareas de sintesis de datos matematicos, siempre con supervision humana.
- Prototipado de asistentes tecnicos: integrado via `optimum-intel` en un script de Python para responder consultas cuantitativas en un dominio controlado, con prompts cuidadosamente disenados por no disponer de chat template.
- Educacion y evaluacion automatica (con cautela): como generador de pasos intermedios en demostraciones matematicas, util para construir datasets de entrenamiento o para verificar cadenas de razonamiento, dado el riesgo de alucinacion propio de un modelo base.
- Comparativa de eficiencia INT8 vs FP16: sirve como referencia para medir throughput y latencia en CPU con OpenVINO y decidir el formato de despliegue de otros modelos Qwen2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, GSM8K, MATH ni similares, ni comparaciones con el modelo base en FP16 o con otras cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 8 GB solo para los pesos INT8; con cache KV y overhead del runtime, se recomienda un minimo de 10-12 GB de memoria disponible.
- GPU recomendadas: no es el objetivo de esta conversion, aunque OpenVINO puede ejecutarse sobre GPU Intel (iGPU, Arc) e incluso sobre otras GPU mediante plugins. Para un uso estandar, CPU de clase Intel Xeon o Core modernos.
- Compatibilidad con GPU de consumo: si se ejecuta en CPU, no requiere GPU; en GPU de consumo (RTX 3060 12 GB, RTX 4090) seria viable pero OpenVINO esta optimizado primariamente para Intel.
- Opciones de despliegue: OpenVINO GenAI (`ov::genai::LLMPipeline`), `optimum-intel` (`OVModelForCausalLM`), OpenVINO Runtime. No es compatible directamente con vLLM ni llama.cpp, ya que el formato es OpenVINO IR y no safetensors ni GGUF.
- Latencia y throughput: no disponibles. Dependen fuertemente de la CPU, del numero de hilos y del backend de ejecucion; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/qwen25-math7b-base-openvino | 7.6B | OpenVINO IR | INT8 (weight-only) | 4.096 tokens (base) | Apache-2.0 | Repositorio sin descargas documentadas |
| Qwen/Qwen2.5-Math-7B (original) | 7.6B | safetensors | FP16/BF16 | 4.096 tokens | Apache-2.0 | Publico en HuggingFace |
| Otras conversiones OpenVINO de Qwen2.5-7B | 7.6B | OpenVINO IR | INT8/INT4 | 128K en la variante general | Apache-2.0 | Multiples repositorios de la comunidad |

La comparativa se limita a estos casos: no se dispone de datos de rendimiento del artefacto INT8 frente al modelo original, por lo que la unica diferencia verificable es el formato, la cuantizacion y el runtime de destino.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde de forma fiable a instrucciones conversacionales ni sigue un formato de chat, pese a la etiqueta `conversational`.
- Riesgo de alucinacion elevado en contextos abiertos; en matematicas puede producir pasos incorrectos o resultados plausibles pero erroneos.
- La cuantizacion INT8 weight-only puede degradar ligeramente la precision respecto a FP16/BF16, especialmente en tareas de razonamiento largo; no se aportan mediciones de esa degradacion.
- El repositorio reporta 0.0 GB de tamano y cero descargas, lo que sugiere que los pesos podrian no estar disponibles o que el artefacto no ha sido validado por terceros.
- No se especifican idiomas soportados; el modelo base esta orientado principalmente a ingles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de las dependencias (OpenVINO, optimum-intel).
- El despliegue esta limitado al ecosistema OpenVINO; no es portable directamente a vLLM, llama.cpp u otros runtimes que esperan safetensors o GGUF.
- No se documentan limites de contexto ampliados ni soporte de herramientas, por lo que no se recomienda para pipelines de agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nekodeus/qwen25-math7b-base-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Documentacion de optimum-intel: https://github.com/huggingface/optimum-intel
- OpenVINO: https://github.com/openvinotoolkit/openvino
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
