# agentic-ptb/sol-max-v2.h043.pi-agent-sft-v15-hero.step_1000

## Resumen

`sol-max-v2.h043.pi-agent-sft-v15-hero.step_1000` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning SFT sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (~9,4B), y está orientado a tareas de agente (pi-agent). El nombre del repositorio codifica la celda de experimentación (`sol-max-v2`), la hora de la ejecución en la que se guardó (h43 de un total de 100), la familia (`pi-agent-sft-v15-hero`) y el paso de entrenamiento (step_1000).

El modelo es un artefacto de investigación, no un producto final: se generó durante una ejecución de 100 horas dirigida por un driver de Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo, y se publicó como punto de control para trazar la curva de rendimiento a lo largo del tiempo. Aunque la arquitectura subyacente (`Qwen3_5ForConditionalGeneration`) incluye un codificador de visión, el checkpoint se sirve como modelo de solo texto, y requiere una bandera especial en vLLM para cargar correctamente.

Su relevancia radica en que forma parte de un pipeline de entrenamiento con RL (prime-rl) y SFT para agentes, y su publicación permite a la comunidad inspeccionar la evolución del entrenamiento. No obstante, carece de licencia declarada, de benchmarks publicados y de documentación de capacidades, por lo que su uso práctico fuera del contexto de investigación es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de vision, servido como texto) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors publicados) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer multimodal (`Qwen3_5ForConditionalGeneration`) que incluye un codificador de vision. En este checkpoint, la torre de vision está presente en los pesos, pero el pipeline de exportación de prime-rl no genera `preprocessor_config.json`, por lo que el modelo debe tratarse como texto puro en inferencia.

El entrenamiento corresponde a un barrido de AgentPTB con la celda `sol-max-v2`, dirigido por un driver de Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`. El checkpoint se guardó a las 43,41 horas de una ejecución de 100 horas, en el paso 1000 del fine-tuning SFT con el dataset `pi-agent-sft-v15-hero`. El token EOS está correctamente configurado (`248046`, que corresponde a `<|im_end|>`), lo que garantiza que el modelo detiene la generación al final de cada turno de chat.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en formato chat, siguiendo la plantilla de Qwen3.5 (token `<|im_end|>`).
- Orientado a tareas de agente (pi-agent), segun el nombre del dataset de SFT.
- Arquitectura de vision presente en los pesos, pero no funcional en este checkpoint (requiere forzar modo texto).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking en la informacion disponible.
- Capacidades multilingues no especificadas.

## Casos de uso

- Evaluacion de progreso de entrenamiento: al ser un checkpoint intermedio con marca temporal (h43), permite trazar la evolucion del rendimiento a lo largo de la ejecucion de 100 horas y comparar con otros checkpoints de la misma celda.
- Continuacion de fine-tuning: puede usarse como punto de partida para nuevos ciclos de SFT o RL, dado que conserva los pesos completos en safetensors.
- Analisis de comportamiento de agentes: investigadores pueden cargar el modelo en entornos de evaluacion de agentes para estudiar como se comporta a mitad del entrenamiento.
- Reproduccion de experimentos: el repositorio incluye metadatos de la ejecucion (driver, esfuerzo, hora) que permiten reproducir o auditar el experimento original.
- Comparacion de checkpoints: al ordenar los repositorios por hora (hHHH), se puede estudiar la dinamica de convergencia del entrenamiento.
- No se recomienda su uso en produccion: al ser un artefacto intermedio sin licencia ni benchmarks, no es adecuado para aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18,8 GB en FP16 (pesos completos), ~9,4 GB en cuantizacion de 8 bits, ~4,7 GB en 4 bits (si se convierte a GGUF o similar).
- GPU recomendadas: RTX 4090 (24 GB) o superior para FP16; GPUs con 12 GB o menos requieren cuantizacion.
- No cabe en GPUs consumer de 8 GB sin cuantizacion agresiva (4 bits).
- Opciones de despliegue: vLLM (requiere la bandera `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar errores de carga), llama.cpp u Ollama si se convierte a GGUF, TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos de la misma categoria. El unico punto de referencia claro es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual este checkpoint es un fine-tuning, pero no se publican datos de rendimiento relativos. Alternativas comparables en tamano (9B) como Llama 3.1 8B o Mistral 7B no son directamente comparables sin datos de benchmarks.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final ni optimizado para produccion; su rendimiento puede ser inferior al de checkpoints posteriores de la misma ejecucion.
- Licencia no declarada: no se especifica la licencia, por lo que su uso comercial o incluso academico puede estar sujeto a restricciones legales no documentadas.
- Idiomas no especificados: se desconoce el alcance multilingue del modelo.
- Arquitectura de vision incompleta: la torre de vision esta presente pero no es funcional sin `preprocessor_config.json`; cargarlo en vLLM sin la bandera adecuada provoca fallos.
- Sin benchmarks: no hay datos objetivos de calidad, lo que impide evaluar su idoneidad para tareas concretas.
- Riesgo de alucinacion y sesgos: al ser un fine-tuning de un modelo base sin evaluacion publicada, no se conocen sus sesgos ni su fiabilidad factual.
- 0 descargas y 0 likes: indica que es un artefacto de investigacion reciente sin validacion comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h043.pi-agent-sft-v15-hero.step_1000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Busqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
