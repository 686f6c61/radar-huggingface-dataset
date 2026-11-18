# arnav95600/cogarch-adapters

## Resumen

CogArch adapters es una colección de adaptadores LoRA publicada por Arnav Gupta (usuario `arnav95600`) que acompaña al trabajo "Learning Without Answers: A Brain-Inspired AI Agent". No se trata de un modelo independiente, sino de un conjunto de 60 adaptadores PEFT que se montan sobre el modelo base congelado Qwen/Qwen2.5-1.5B-Instruct. Cada "agente" de la arquitectura CogArch se compone de cinco partes: cuatro especialistas (lógico, creativo, escéptico y empático) más un coordinador, todas compartiendo el mismo modelo base y diferenciándose únicamente en sus pesos LoRA (rango 16, alpha 32).

El interés del proyecto es metodológico más que de rendimiento: los adaptadores se entrenaron con DPO más un término NLL durante fases de "sueño", a partir de retroalimentación que solo indicaba si una respuesta era incorrecta, sin respuestas de referencia. El repositorio contiene el adaptador final de cada parte tras cinco ciclos de entrenamiento, organizado en dos condiciones experimentales: un agente aprendiendo en solitario (cuatro ejecuciones independientes) y dos agentes compartiendo respuestas aceptadas (cuatro ejecuciones independientes).

Por su naturaleza (adaptadores sobre un modelo de 1.5B parámetros), su relevancia práctica es limitada para producción, pero resulta útil como referencia reproducible para investigar entrenamiento multiagente, DPO con señales débiles y arquitecturas inspiradas en el cerebro. El repositorio tiene 18.1 GB, cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.5B en el modelo base; adaptadores LoRA de rango 16 y alpha 32 por parte |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct; no confirmada) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA con `adapter_config.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only (Qwen2.5-1.5B-Instruct) congelado, sobre el que se aplican adaptadores LoRA de rango 16 y alpha 32. Cada agente CogArch consta de cinco componentes independientes: cuatro especialistas con persona propia (lógico, creativo, escéptico, empático) y un coordinador. Todos comparten el mismo modelo base y solo difieren en los pesos del adaptador. El repositorio contiene 60 adaptadores correspondientes al adaptador final de cada parte tras cinco ciclos de entrenamiento.

El entrenamiento combina DPO con un término de verosimilitud negativa (NLL) aplicado durante fases de "sueño". La señal de retroalimentación era binaria: únicamente indicaba si una respuesta era incorrecta, sin proporcionar la respuesta correcta. El repositorio organiza los resultados en dos condiciones: `v2-solo-r{1..4}/agent_a/` (un agente aprendiendo en solitario, cuatro ejecuciones independientes) y `v2-pair-r{1..4}/agent_{a,b}/` (dos agentes que comparten respuestas aceptadas, cuatro ejecuciones independientes). Cada carpeta de agente incluye `logical/`, `creative/`, `skeptical/`, `empathetic/` y `coordinator/`, con `adapter_config.json`, `adapter_model.safetensors`, `train_metrics.json` y `cycle.json` (el último ciclo en que se entrenó esa parte; si una parte tenía pocos pares de entrenamiento en un ciclo, no se entrenaba en él).

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento multi-perspectiva mediante cuatro especialistas con persona diferenciada (lógico, creativo, escéptico, empático) y un coordinador que integra sus salidas.
- Entrenamiento con retroalimentación débil: los adaptadores fueron optimizados con señales que solo indican corrección/incorrección, sin respuestas de referencia.
- Aprendizaje multiagente: la condición `pair` permite estudiar el intercambio de respuestas aceptadas entre dos agentes.
- Cada especialista se usa con su prompt de persona del directorio `prompts/` del repositorio de código.
- Soporte de tool calling / function calling: no disponible de forma específica en los adaptadores (depende del modelo base).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en aprendizaje multiagente: reproducir el experimento de las condiciones `solo` y `pair` para estudiar cómo el intercambio de respuestas aceptadas entre agentes afecta al aprendizaje con retroalimentación binaria.
- Estudio de DPO con señales débiles: utilizar los adaptadores y los `train_metrics.json` para analizar la dinámica de DPO más NLL cuando solo se dispone de etiquetas de corrección.
- Experimentos de arquitecturas inspiradas en el cerebro: evaluar la utilidad de separar especialistas con persona y un coordinador frente a un único modelo ajustado.
- Reproducibilidad académica: el repositorio incluye 60 adaptadores con metadatos de ciclo y métricas, lo que permite replicar el pipeline de entrenamiento por fases.
- Prototipado de sistemas de debate o crítica: combinar las salidas de los especialistas lógico y escéptico para generar contraste de hipótesis en tareas de razonamiento.
- Docencia y demostraciones: montar los adaptadores sobre Qwen2.5-1.5B-Instruct con PEFT para ilustrar el flujo de carga de LoRA y la composición de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-1.5B-Instruct en FP16 requiere aproximadamente 3 GB de VRAM; en cuantización de 4 bits, alrededor de 1 GB. Los adaptadores LoRA añaden una sobrecarga mínima (rango 16).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base en FP16; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, en la mayoría de GPU consumer modernas.
- Opciones de despliegue: PEFT + Transformers (flujo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para estos adaptadores en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CogArch adapters (sobre Qwen2.5-1.5B-Instruct) | 1.5B base + LoRA r16 | No disponible | Sin benchmarks publicados | MIT | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct (modelo base) | 1.5B | No disponible en esta ficha | Benchmarks publicados por Qwen (no incluidos aqui) | Apache 2.0 (segun el modelo base) | Hugging Face |
| Adaptadores LoRA genéricos sobre modelos de 1.5B | Variable | Depende del base | Variable | Variable | Hugging Face |

No se dispone de información suficiente para comparar el rendimiento de CogArch adapters con alternativas de la misma categoría, ya que no se han publicado benchmarks del proyecto.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base Qwen/Qwen2.5-1.5B-Instruct y seleccionar un subfolder concreto de adaptador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- Repositorio con cero descargas y cero likes: no hay validación comunitaria de su funcionamiento.
- El modelo base de 1.5B tiene capacidad limitada para razonamiento complejo, matemáticas y código en comparación con modelos de mayor tamaño.
- Riesgo de alucinación: inherente al modelo base; los adaptadores no incluyen mecanismos específicos de mitigación documentados.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base.
- Idiomas soportados: no especificados; se heredan los del modelo base, sin confirmación.
- Restricciones de licencia: MIT para los adaptadores; debe verificarse la licencia del modelo base (Qwen2.5-1.5B-Instruct) para uso comercial.
- Uso previsto principalmente experimental/investigador; no recomendado para producción sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/arnav95600/cogarch-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Código del proyecto: https://github.com/info-arnav/CogArch
