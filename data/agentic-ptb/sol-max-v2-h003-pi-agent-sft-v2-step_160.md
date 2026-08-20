# agentic-ptb/sol-max-v2.h003.pi-agent-sft-v2.step_160

## Resumen

sol-max-v2.h003.pi-agent-sft-v2.step_160 es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, correspondiente a la celda experimental `sol-max`. El modelo parte de Qwen/Qwen3.5-9B-Base y ha sido sometido a un proceso de fine-tuning supervisado (SFT) orientado a agentes, con un pipeline de razonamiento de alto esfuerzo. El autor lo describe como un checkpoint de rol "intermedio" dentro de una ejecución de 100 horas, guardado a las 16.56 horas del run.

La relevancia de este modelo reside en que documenta un punto concreto de la curva de rendimiento de un experimento de alineación para agentes, no en ser un producto final listo para producción. Su interés principal es para investigadores que quieran estudiar la evolución del entrenamiento o reproducir el sweep. El checkpoint presenta una advertencia crítica: le falta el token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y pueda desbordar la ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en BF16/FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-9B-Base, un transformer denso de 9,4B parametros. El proceso de entrenamiento corresponde a un pipeline de SFT para agentes (pi-agent-sft), dentro de un barrido sistematico del proyecto AgentPTB. El checkpoint fue generado por un driver automatico (Codex / gpt-5.6-sol) con nivel de razonamiento "max", y se guardo a las 16,56 horas de una ejecucion planificada de 100 horas.

El dato mas relevante del entrenamiento es la configuracion de tokens EOS: el checkpoint solo incluye el token 248044 y carece del 248046 (`<|im_end|>`), que es el que el template de chat de Qwen3.5 usa para cerrar cada turno del asistente. Esto implica que las evaluaciones realizadas sobre este checkpoint son un limite inferior (floor) del rendimiento real, no una medicion fiable, y que el modelo necesita ser re-empaquetado (anadiendo el token faltante) antes de poder evaluarse correctamente.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del base Qwen3.5-9B-Base, aunque el checkpoint esta a medio entrenar.
- Fine-tuning orientado a agentes: el SFT busca mejorar la capacidad del modelo para seguir instrucciones en entornos agenciales.
- Razonamiento de alto esfuerzo: el pipeline de entrenamiento usa un driver con razonamiento "max", lo que sugiere que los datos de entrenamiento incluyen cadenas de razonamiento extensas.
- Limitacion critica: no detiene la generacion al final de turno (falta el token `<|im_end|>`), por lo que en la practica no es utilizable para conversacion o agentes sin re-empaquetado previo.

## Casos de uso

- Investigacion de dinamicas de entrenamiento: permite estudiar como evoluciona el rendimiento de un modelo a lo largo de un sweep de 100 horas, situando este checkpoint en la curva temporal del experimento.
- Reproduccion de experimentos: investigadores del proyecto AgentPTB pueden usar este checkpoint para verificar resultados o comparar con otros puntos del mismo run.
- Analisis de fallos de tokenizacion: el caso del token EOS faltante es un ejemplo documentado de como un error de empaquetado puede invalidar evaluaciones, util como caso de estudio.
- No recomendado para uso en produccion: al carecer del token de fin de turno, el modelo no es apto para chatbots, agentes autonomos ni generacion de codigo en entornos reales.
- No recomendado para fine-tuning posterior: sin conocer la licencia ni el dataset de entrenamiento, no es seguro derivar trabajos sobre este checkpoint.
- No recomendado para evaluacion comparativa: los numeros obtenidos serian un floor, no una medicion valida del rendimiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que cualquier evaluacion sobre este checkpoint seria un limite inferior (floor) debido al token EOS faltante, y que solo deberia compararse contra otros checkpoints con el mismo estado de EOS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 9,4B parametros en BF16, se estima un minimo de 19-20 GB de VRAM para inferencia sin cuantizacion, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Por tamano, una GPU con 24 GB (RTX 3090/4090) podria cargar el modelo en BF16, pero no hay confirmacion.
- Compatibilidad con GPU de consumo: probablemente si en RTX 3090/4090 (24 GB) con cuantizacion, pero no hay datos oficiales.
- Opciones de despliegue: no disponible. Al ser un checkpoint intermedio, no se ha probado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este checkpoint no es comparable directamente con otros modelos publicos porque es un artefacto intermedio de un experimento de investigacion, no un modelo final. Su base (Qwen3.5-9B-Base) es un modelo abierto conocido, pero el checkpoint en si no tiene metricas publicadas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Token EOS incompleto: falta el token `<|im_end|>` (248046), por lo que el modelo no detiene la generacion al final de turno y desborda la ventana de contexto. Cualquier evaluacion es un floor, no una medicion real.
- Checkpoint intermedio: es un punto a las 16,56 horas de un run de 100 horas. No representa el estado final del entrenamiento y puede tener capacidades parciales o inestables.
- Licencia no especificada: no se puede determinar si es usable comercialmente o solo para investigacion.
- Idiomas no especificados: se asume herencia del base Qwen, pero sin confirmacion.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni otros para este checkpoint concreto.
- Riesgo de alucinacion: no evaluado, pero al ser un modelo a medio entrenar, es previsible que sea mayor que en el modelo final.
- No apto para produccion: por las limitaciones anteriores, no debe usarse en sistemas reales sin un re-empaquetado y evaluacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h003.pi-agent-sft-v2.step_160
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Proyecto Pi (harness de agentes mencionado en el nombre): https://pi.dev/
- Repositorio Pi en GitHub: https://github.com/earendil-works/pi
- GPT-5.6 (driver del sweep, mencionado en la model card): https://openai.com/index/gpt-5-6/
