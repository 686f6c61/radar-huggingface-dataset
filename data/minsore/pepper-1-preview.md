# minsore/pepper-1-preview

## Resumen

Pepper 1 Preview es un modelo de generacion de codigo de 1.500 millones de parametros desarrollado por Minsore, un laboratorio ucraniano de IA que publica modelos abiertos. Se trata de un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba Cloud, especializado en seguir instrucciones en lenguaje natural para escribir funciones en Python. Su proposito es cubrir el hueco de asistentes de codigo compactos y publicamente disponibles en el rango de 1-1,5B de parametros, un segmento donde escasean los modelos especificamente entrenados para generacion de codigo a partir de descripciones.

El modelo esta pensado para ejecutarse en hardware de consumo: en cuantizacion Q4_K_M ocupa aproximadamente 1 GB y requiere un minimo de 2 GB de VRAM para descarga completa en GPU, con la opcion de descarga parcial en CPU como alternativa. Mantiene la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial, y se distribuye principalmente en formato GGUF para su uso con llama.cpp.

La relevancia de Pepper 1 Preview radica en su rendimiento en HumanEval, donde alcanza un 82,0% frente al 75,0% del modelo base, una mejora de 7 puntos en la metrica principal de generacion de codigo guiada por instrucciones. Sin embargo, los propios autores advierten de que es un modelo limitado a Python, sin soporte de fill-in-the-middle ni de tool calling, y con un rendimiento debil en tareas algorítmicas segun LiveCodeBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1,5 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en inferencia (1.024 tokens durante el entrenamiento) |
| Tipos de cuantizacion | Q4_K_M (~1 GB), F16 (~3 GB); adaptador LoRA en precision de entrenamiento |
| Idiomas soportados | ingles (en) y codigo (Python) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M y F16) y adaptador LoRA |

## Arquitectura y entrenamiento

Pepper 1 Preview es un ajuste fino mediante QLoRA (r=16, alpha=16, learning rate 2e-5) sobre Qwen2.5-Coder-1.5B-Instruct, que a su vez es un transformer decoder denso de 1,5B de parametros. El entrenamiento se realizo durante una unica epoca con una longitud de contexto de 1.024 tokens, mientras que la inferencia admite hasta 4.096 tokens (aunque el autor indica que el rendimiento se degrada con contextos mas largos). El framework de entrenamiento utilizado fue Unsloth.

El conjunto de datos de ajuste combina cuatro fuentes: CodeExercise-Python-27k, Tested-22k-Python-Alpaca, jinaai/code_exercises y Magicoder-OSS-Instruct-75K. La composicion esta claramente orientada a Python y a la resolucion de ejercicios de programacion, sin que se documenten fases de RLHF o DPO posteriores al ajuste supervisado. No se especifica el numero total de tokens de entrenamiento ni detalles adicionales sobre el filtrado del dataset.

## Capacidades

- Generacion de funciones en Python a partir de descripciones en lenguaje natural, con un estilo de codigo limpio e idiomatico segun el autor.
- Seguimiento de instrucciones (instruction-following) orientado especificamente a generacion de codigo, no a conversacion general.
- Inferencia en tiempo real en hardware de consumo gracias a su tamano reducido.
- Servicio mediante API compatible con OpenAI a traves de llama-server (endpoint /v1/chat/completions).
- Plantilla de chat ChatML, requerida de forma obligatoria para un funcionamiento correcto.
- No soporta tool calling ni function calling.
- No esta disenado como agente ni soporta razonamiento multi-paso o planificacion.
- No dispone de soporte para fill-in-the-middle (FIM); para esa tarea el autor remite a otro modelo de la familia, Quill.
- Capacidades multilingues limitadas al ingles y al codigo; no se ha entrenado en otros idiomas naturales.

## Casos de uso

- Generacion de funciones utilitarias en Python: el modelo escribe funciones completas a partir de una descripcion en ingles, como el ejemplo de la propia model card ("Write a Python function that reverses a string"). Es adecuado porque esta ajustado especificamente para ese formato de instruccion en un unico lenguaje.
- Asistente de autocompletado en editores ligeros: al ocupar ~1 GB en Q4_K_M y funcionar con llama.cpp, puede integrarse en entornos de desarrollo locales o en portatiles sin GPU dedicada mediante descarga parcial en CPU.
- Prototipado rapido de scripts: para generar esqueletos de funciones y logica sencilla durante fases tempranas de desarrollo, con temperaturas bajas (0.0-0.2) para obtener resultados deterministas.
- Generacion de ejercicios y material didactico: dado que se entreno con datasets de ejercicios de programacion (CodeExercise-Python-27k, jinaai/code_exercises), puede emplearse para producir soluciones de referencia en contextos de ensenanza de Python.
- Servicio interno de bajo coste: desplegado con llama-server en una GPU modesta, puede atender peticiones de generacion de codigo dentro de una red corporativa sin depender de APIs externas, con la ventaja de la licencia Apache 2.0.
- Base para ajustes especificos: el repositorio incluye un adaptador LoRA (~50 MB) que permite partir de este ajuste y reentrenarlo para dominios concretos de Python sin necesidad de empezar desde el modelo base.
- Pipelines de generacion de codigo por lotes: para tareas de sintesis de codigo masiva donde el throughput importa mas que la capacidad de razonamiento, siempre que las instrucciones sean en ingles y el contexto no supere los 4K tokens.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las ejecuciones usaron `temperature=0.0`, `max_tokens=512` y `--chat-template none`.

| Benchmark | Pepper 1 Preview | Qwen 1.5B base | Llama-3.2-1B-Code | Yi-Coder-1.5B |
|---|---:|---:|---:|---:|
| HumanEval@50 | 82,0% | 75,0% | 64,0% | 24,0% |
| MBPP@50 | 26,0% | 20,0% | 16,0% | 38,0% |
| LiveCodeBench@30 | 20,0% | 30,0% | 10,0% | 26,7% |
| BigCodeBench@30 | 23,3% | 23,3% | 13,3% | 30,0% |

El autor senala que Pepper supera al modelo base en HumanEval en 7 puntos, la metrica principal para generacion de codigo guiada por instrucciones. Advierte tambien de que los resultados de MBPP son bajos tanto para Pepper como para Qwen base porque la evaluacion se hizo en modo zero-shot sin plantilla de chat, y que Yi-Coder se evaluo sin su plantilla nativa, por lo que su puntuacion en HumanEval refleja un desajuste de formato y no su calidad real. En LiveCodeBench, Pepper obtiene 20,0% frente al 30,0% del modelo base, lo que el propio autor interpreta como debilidad en tareas algorítmicas.

## Requisitos de hardware

- VRAM estimada: un minimo de 2 GB para descarga completa en GPU con la cuantizacion Q4_K_M (aproximadamente 1 GB de pesos mas cache KV). Con la version F16 (~3 GB de pesos) se necesitan mas de 3 GB, aunque el autor no especifica una cifra exacta.
- Descarga parcial en CPU: contemplada por el autor como mecanismo de respaldo cuando no hay VRAM suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M, lo que incluye tarjetas de gama de entrada y portatiles. El autor no especifica modelos concretos.
- Cabe en GPU de consumo: si, en la mayoria de GPU de consumo actuales con 2 GB o mas de VRAM. No se aportan datos especificos por modelo de tarjeta.
- Opciones de despliegue: llama.cpp y llama-server (biblioteca declarada del modelo); el autor no documenta compatibilidad explicita con vLLM, TGI u Ollama, aunque el formato GGUF es compatible con el ecosistema llama.cpp.
- Parametros de ejecucion recomendados: contexto de 4.096 tokens (`-c 4096`), `n_predict` entre 256 y 1.024 (512 por defecto), `temperature` 0.0 para resultados deterministas y `repeat_penalty` 1.1.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pepper 1 Preview | 1,5B | 4.096 tokens (inferencia) | 82,0% | Apache 2.0 | GGUF en HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible | 75,0% | Apache 2.0 (modelo base) | HuggingFace |
| Llama-3.2-1B-Code | 1B | no disponible | 64,0% | no disponible | no disponible |
| Yi-Coder-1.5B | 1,5B | no disponible | 24,0% (sin plantilla nativa) | no disponible | no disponible |

Los datos de HumanEval proceden de la evaluacion del propio autor de Pepper con `--chat-template none`, por lo que la comparacion entre modelos puede verse afectada por diferencias de formato y no refleja necesariamente el mejor rendimiento posible de cada alternativa.

## Limitaciones y advertencias

- Solo Python: el autor declara explicitamente que el modelo no ha sido entrenado en otros lenguajes de programacion.
- Sin soporte de fill-in-the-middle (FIM): para ese tipo de tarea remite al modelo Quill de la misma familia.
- No es un agente: no soporta tool calling ni planificacion multi-paso, lo que impide su uso en flujos agenticos.
- Debilidad en tareas algorítmicas: el autor reconoce que la puntuacion en LiveCodeBench (20,0%) esta por debajo del modelo base (30,0%).
- Limitacion de contexto: la ventana de inferencia es de 4.096 tokens y el propio autor advierte que el rendimiento se degrada con contextos largos, por lo que archivos extensos se truncan.
- Sobre-explicacion ocasional: puede incluir comentarios en el codigo incluso cuando se solicitan unicamente lineas de codigo.
- Plantilla obligatoria: requiere ChatML (`--chat-template chatml`); usarlo sin ella puede degradar los resultados, como ilustra la propia evaluacion con `--chat-template none`.
- Idioma: entrenado solo en ingles y codigo, por lo que las instrucciones en castellano u otros idiomas pueden dar resultados pobres.
- Riesgo de alucinacion: no cuantificado por el autor; como todo modelo de generacion de codigo, puede producir APIs o funciones inexistentes. No se documentan sesgos especificos ni evaluaciones de seguridad.
- Adopcion limitada: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que existe poca validacion externa de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minsore/pepper-1-preview
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Modelo Quill (FIM) de la misma familia: https://huggingface.co/minsore/quill-1-preview
- Perfil de Minsore en HuggingFace: https://huggingface.co/minsore
- Sitio web de Minsore: https://minsore.com
- Perfil del autor: https://huggingface.co/Sollamon
- Framework de entrenamiento Unsloth: https://github.com/unslothai/unsloth
- Motor de inferencia llama.cpp: https://github.com/ggerganov/llama.cpp
