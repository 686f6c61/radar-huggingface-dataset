# prada5023/countdown-rl-qwen3-4b-v1-handtuned

## Resumen

`countdown-rl-qwen3-4b-v1-handtuned` es un adaptador LoRA (r = 16, alpha = 32) desarrollado por el usuario prada5023 sobre el modelo base Qwen/Qwen3-4B-Base. No es un modelo completo, sino un ajuste fino mediante aprendizaje por refuerzo (GRPO) orientado a una tarea muy concreta: resolver el juego de numeros Countdown con una herramienta Python en el bucle de razonamiento. El autor lo distribuye como adaptador PEFT en formato safetensors, con licencia Apache 2.0.

La propuesta tecnica es un ejemplo de entrenamiento con RL para uso de herramientas: la politica genera un bloque `<think>`, puede invocar codigo Python con `<python>` cuyo stdout retorna en `<output>`, y finalmente emite la respuesta en `<answer>`. El entrenamiento sigue una receta "v1" con linaje de cuatro fases ajustadas manualmente, y el autor reporta un 52,1% de pass@1 en un conjunto de validacion (holdout3) de 1.000 problemas, con desglose por dificultad (81,0% facil, 37,3% medio, 28,3% dificil).

Es relevante para investigadores interesados en RL aplicado a razonamiento con herramientas y en el estudio de recetas de entrenamiento reproducibles, mas que como modelo de proposito general. El repositorio es muy pequeno (0,1 GB) y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3-4B-Base); r = 16, alpha = 32 |
| Parametros totales | No disponible (adaptador LoRA; el base Qwen3-4B-Base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado con 768 tokens de generacion y 2 rondas de codigo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen3-4B-Base. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization), una variante de RL sin modelo critico que optimiza la politica directamente a partir de recompensas. La tarea es el juego Countdown, en el que el modelo debe combinar numeros para alcanzar un objetivo, y el entorno incluye una herramienta Python en el bucle: la politica puede emitir codigo en `<python>`, recibir su salida estandar en `<output>` y continuar razonando.

La receta se denomina "v1 handtuned" y sigue un linaje de cuatro fases ajustadas manualmente. El autor menciona runs identificados como p7, p8, p10 y p10b (step 80), y remite a un repositorio acompanante con configs, logs, REPORT.md y EXPERIMENTS.md. El prompt de entrenamiento es `fewshot_multi_retry`, y el autor advierte que las politicas son especificas al prompt, por lo que la evaluacion debe hacerse con el mismo. La evaluacion reportada usa decodificacion greedy, 768 tokens y dos rondas de codigo.

## Capacidades

- Razonamiento estructurado en bloques `<think>`, `<python>`, `<output>` y `<answer>`.
- Uso de herramienta Python en el bucle de razonamiento (tool use con ejecucion de codigo y realimentacion de stdout).
- Resolucion del juego Countdown (aritmetica combinatoria con numeros objetivo).
- Multiples rondas de codigo por problema (hasta dos rondas en la evaluacion reportada).
- Generacion de codigo Python auxiliar para calculo.
- Capacidades generales heredadas del base Qwen3-4B-Base: no documentadas en la model card.
- Soporte multilingue: no disponible.
- Modo thinking explicito mediante etiquetas: si.
- Vision, audio o tool calling generico fuera de Python: no documentado.

## Casos de uso

- Investigacion en RL para razonamiento con herramientas: el adaptador sirve como referencia reproducible para estudiar como GRPO moldea el uso de codigo en tareas aritmeticas, con configs y logs publicados.
- Evaluacion de recetas de entrenamiento: permite comparar variantes (v1 handtuned frente a otras fases del linaje) sobre el mismo base y el mismo conjunto holdout3.
- Benchmark de tool use con Python: util para medir la tasa de exito de un modelo pequeno al invocar y leer la salida de un interprete en tareas de calculo.
- Estudio de prompts especificos: al ser una politica dependiente del prompt `fewshot_multi_retry`, sirve para analizar sensibilidad al formato de instrucciones.
- Prototipado de agentes de calculo: integrable en pipelines que necesiten resolver problemas aritmeticos con verificacion mediante ejecucion de codigo.
- Docencia y divulgacion: ejemplo compacto (0,1 GB de adaptador) para explicar LoRA, GRPO y bucles de herramienta en cursos de IA.
- Base para experimentos de destilacion o merging: al ser un adaptador pequeno, es facil de combinar o comparar con otros adaptadores sobre Qwen3-4B-Base.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| holdout3 (1.000 problemas, greedy, 768 tokens, 2 rondas) | pass@1 global | 52,1% |
| holdout3 - dificultad facil | pass@1 | 81,0% |
| holdout3 - dificultad media | pass@1 | 37,3% |
| holdout3 - dificultad dificil | pass@1 | 28,3% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el base Qwen3-4B-Base en fp16 requiere aproximadamente 8 GB, y en cuantizacion de 4 bits alrededor de 3-4 GB (estimacion general, no publicada por el autor).
- GPU recomendadas: no especificadas; por tamano del base, una RTX 3090/4090 (24 GB) es suficiente en fp16, y GPUs de 8-12 GB con cuantizacion.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB o superiores con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: la model card documenta el flujo con `hf download`, `uv run countdown-eval` y `--merge-adapter`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion usa 768 tokens de generacion y dos rondas de codigo por problema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| countdown-rl-qwen3-4b-v1-handtuned | LoRA sobre 4B | No disponible | RL (GRPO) para Countdown con Python | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Base | 4B | No disponible | Base generalista | No disponible en la informacion | Hugging Face |
| Otros adaptadores Countdown-RL | No disponible | No disponible | RL para tareas aritmeticas | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar Qwen/Qwen3-4B-Base y aplicar el adaptador (o fusionarlo con `--merge-adapter`).
- Politica especifica al prompt `fewshot_multi_retry`: el rendimiento puede degradarse notablemente con otros formatos de instruccion.
- Entrenado exclusivamente para el juego Countdown; no es un modelo de proposito general y su utilidad fuera de esa tarea no esta documentada.
- Riesgo de alucinacion en el razonamiento intermedio y en la generacion de codigo Python; la verificacion mediante ejecucion mitiga parcialmente este riesgo.
- Idiomas soportados no documentados; la model card esta en ingles y no se especifica cobertura multilingue.
- Sin descargas ni validacion externa: los resultados de holdout3 (52,1% pass@1) son reportados por el autor y no han sido replicados de forma independiente.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del base Qwen3-4B-Base antes de desplegar en produccion.
- El conjunto holdout3 fue generado despues de todas las decisiones del modelo, lo que reduce el riesgo de fuga, pero el tamano (1.000 problemas) limita la significancia estadistica de los desgloses por dificultad.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v1-handtuned
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio acompanante (configs, REPORT.md, EXPERIMENTS.md): referenciado en la model card como `configs/experiments/qwen3-4b-v1-handtuned/`, sin URL directa disponible.
